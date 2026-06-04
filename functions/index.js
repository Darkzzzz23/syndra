const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");

admin.initializeApp();
const db = admin.firestore();

const app = express();

// Stripe webhook needs raw body
const stripe = require("stripe")(functions.config().stripe?.secret || process.env.STRIPE_SECRET || "");

app.use(cors({ origin: true }));

// Health
app.get("/health", (req, res) => res.status(200).send("ok"));

// Stripe Webhook
app.post("/stripe-webhook", express.raw({ type: "application/json" }), async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const endpointSecret = functions.config().stripe?.webhook_secret || "";

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle checkout completion
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    
    try {
      const productId = session.metadata?.productId;
      const creatorId = session.metadata?.creatorId;
      const promoterSlug = session.metadata?.promoterSlug || null;
      const customerEmail = session.customer_email || "unknown";
      const customerId = session.customer || "guest";
      const amount = (session.amount_total || 0) / 100;

      if (!productId || !creatorId) {
        console.error("Missing metadata in session:", session.id);
        return res.status(200).send("Missing metadata");
      }

      // Get product
      const productSnap = await db.collection("products").doc(productId).get();
      if (!productSnap.exists) {
        console.error("Product not found:", productId);
        return res.status(200).send("Product not found");
      }
      const productData = productSnap.data();

      // Calculate commissions
      const settingsSnap = await db.collection("settings").doc("commissions").get();
      const settings = settingsSnap.exists ? settingsSnap.data() : { creator: 70, promoter: 20, syndra: 10 };
      const total = settings.creator + settings.promoter + settings.syndra;
      const commissions = {
        creator: Math.round((amount * settings.creator / total) * 100) / 100,
        promoter: Math.round((amount * settings.promoter / total) * 100) / 100,
        syndra: Math.round((amount * settings.syndra / total) * 100) / 100,
      };

      // Create order
      const orderRef = db.collection("orders").doc();
      await orderRef.set({
        productId,
        productTitle: productData.title || productData.name,
        customerId,
        customerEmail,
        creatorId,
        amount,
        currency: "usd",
        commissions,
        promoterSlug,
        status: "completed",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        downloadAccessed: false,
      });

      // Update creator
      await db.collection("users").doc(creatorId).set({
        totalRevenue: admin.firestore.FieldValue.increment(commissions.creator),
        totalSales: admin.firestore.FieldValue.increment(1),
      }, { merge: true });

      // Update promoter
      if (promoterSlug) {
        const promoterQ = await db.collection("promoters").where("slug", "==", promoterSlug).limit(1).get();
        if (!promoterQ.empty) {
          const promoterDoc = promoterQ.docs[0];
          await promoterDoc.ref.set({
            totalEarnings: admin.firestore.FieldValue.increment(commissions.promoter),
            totalSales: admin.firestore.FieldValue.increment(1),
          }, { merge: true });
        }
      }

      // Update product sales
      await db.collection("products").doc(productId).set({
        totalSales: admin.firestore.FieldValue.increment(1),
      }, { merge: true });

      // Update platform revenue
      const platformRef = db.collection("platform").doc("revenue");
      await platformRef.set({
        totalPlatformRevenue: admin.firestore.FieldValue.increment(commissions.syndra),
        totalCreatorRevenue: admin.firestore.FieldValue.increment(commissions.creator),
        totalPromoterRevenue: admin.firestore.FieldValue.increment(commissions.promoter),
        totalTransactions: admin.firestore.FieldValue.increment(1),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });

      console.log("Order created via webhook:", orderRef.id);
    } catch (err) {
      console.error("Webhook processing failed:", err);
    }
  }

  res.status(200).send("OK");
});

app.use(express.json());

// Redirect + logging endpoint
app.get("/go/:slug", async (req, res) => {
  const { slug } = req.params;

  try {
    const authHeader = req.get("Authorization") || "";
    let visitorUserId = null;
    if (authHeader.startsWith("Bearer ")) {
      const idToken = authHeader.split("Bearer ")[1].trim();
      try {
        const decoded = await admin.auth().verifyIdToken(idToken);
        visitorUserId = decoded.uid;
      } catch (authErr) {
        console.warn("Unable to verify bearer token for click tracking:", authErr.message);
      }
    }

    const productDoc = await db.collection("products").doc(slug).get();
    let productSnapshot = productDoc.exists ? productDoc : null;

    if (!productSnapshot) {
      const q = await db.collection("products").where("slug", "==", slug).limit(1).get();
      if (!q.empty) {
        productSnapshot = q.docs[0];
      }
    }

    if (!productSnapshot) {
      return res.status(404).format({
        "application/json": () => res.json({ error: "Product not found", redirectUrl: "/" }),
        "*/*": () => res.redirect("/"),
      });
    }

    const product = productSnapshot.data();
    const productId = productSnapshot.id;
    const redirectUrl = product.etsyLink || product.etsyUrl || product.url || "/";

    const clickData = {
      eventType: "click",
      productId,
      productSlug: product.slug || slug,
      userId: visitorUserId,
      ownerUid: product.ownerUid || null,
      referrer: req.get("Referer") || null,
      userAgent: req.get("User-Agent") || null,
      ip: (req.headers["x-forwarded-for"] || req.socket.remoteAddress || "").split(",")[0].trim() || null,
      source: req.query.source || null,
      medium: req.query.medium || null,
      campaign: req.query.campaign || null,
      adId: req.query.ad || null,
      revenue: 0,
      conversionStatus: null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const batch = db.batch();
    const clickRef = db.collection("clicks").doc();
    batch.set(clickRef, clickData);
    batch.set(productSnapshot.ref, {
      totalClicks: admin.firestore.FieldValue.increment(1),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });

    if (product.ownerUid) {
      const ownerRef = db.collection("users").doc(product.ownerUid);
      batch.set(ownerRef, {
        totalClicks: admin.firestore.FieldValue.increment(1),
      }, { merge: true });
    }

    await batch.commit();

    const wantsJson = req.get("Accept")?.includes("application/json") || req.query.json === "1";
    if (wantsJson) {
      return res.json({ redirectUrl });
    }

    return res.redirect(redirectUrl);
  } catch (err) {
    console.error("/go/:slug error", err);
    const wantsJson = req.get("Accept")?.includes("application/json") || req.query.json === "1";
    if (wantsJson) {
      return res.json({ redirectUrl: "/" });
    }
    return res.redirect("/");
  }
});

exports.api = functions.https.onRequest(app)