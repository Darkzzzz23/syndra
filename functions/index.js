const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");

admin.initializeApp();
const db = admin.firestore();

const app = express();
app.use(cors({ origin: true }));

// Health
app.get("/health", (req, res) => res.status(200).send("ok"));

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

    // Resolve product by id or slug to support both Firestore layouts.
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

exports.api = functions.https.onRequest(app);
