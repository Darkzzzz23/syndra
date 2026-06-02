import { collection, doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/config";
import { updatePlatformRevenue, initializePlatformRevenue } from "./revenueService";
import { calculateCommissionsFromSettings } from "./settingsService";

const ordersCollection = collection(db, "orders");

// Save referral to cookie when someone clicks a promo link
export const saveReferralCookie = (promoterSlug) => {
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + 30); // 30-day cookie
  document.cookie = `syndra_ref=${promoterSlug}; path=/; expires=${expiry.toUTCString()}; SameSite=Lax`;
};

// Get referral from cookie
export const getReferralFromCookie = () => {
  const match = document.cookie.match(/syndra_ref=([^;]+)/);
  return match ? match[1] : null;
};

// Calculate commission split (uses configurable settings)
export const calculateCommissions = async (amount) => {
  return await calculateCommissionsFromSettings(amount);
};

// Create an order (call this after successful payment)
export const createOrder = async ({
  productId,
  productTitle,
  customerId,
  customerEmail,
  creatorId,
  amount,
  promoterSlug,
}) => {
  const commissions = await calculateCommissions(amount);

  const orderRef = doc(ordersCollection);
  const orderData = {
    productId,
    productTitle,
    customerId,
    customerEmail,
    creatorId,
    amount,
    currency: "usd",
    commissions,
    promoterSlug: promoterSlug || null,
    status: "completed",
    createdAt: serverTimestamp(),
    downloadAccessed: false,
  };

  await setDoc(orderRef, orderData);

  // Update creator earnings
  const creatorRef = doc(db, "users", creatorId);
  const creatorSnap = await getDoc(creatorRef);
  if (creatorSnap.exists()) {
    const data = creatorSnap.data();
    await setDoc(creatorRef, {
      totalRevenue: (data.totalRevenue || 0) + commissions.creator,
      totalSales: (data.totalSales || 0) + 1,
    }, { merge: true });
  }

  // Update promoter earnings if applicable
  if (promoterSlug) {
    const { collection: col, query, where, getDocs } = await import("firebase/firestore");
    const promotersRef = col(db, "promoters");
    const q = query(promotersRef, where("slug", "==", promoterSlug));
    const snap = await getDocs(q);

    if (!snap.empty) {
      const promoterDoc = snap.docs[0];
      const promoterData = promoterDoc.data();
      await setDoc(promoterDoc.ref, {
        totalEarnings: (promoterData.totalEarnings || 0) + commissions.promoter,
        totalSales: (promoterData.totalSales || 0) + 1,
      }, { merge: true });
    }
  }

  // Update product sales count
  const productRef = doc(db, "products", productId);
  const productSnap = await getDoc(productRef);
  if (productSnap.exists()) {
    const productData = productSnap.data();
    await setDoc(productRef, {
      totalSales: (productData.totalSales || 0) + 1,
    }, { merge: true });
  }

  // Update platform revenue
  await initializePlatformRevenue();
  await updatePlatformRevenue(commissions);

  return { id: orderRef.id, ...orderData };
};

// Get customer orders
export const getCustomerOrders = async (customerId) => {
  const { collection: col, query, where, orderBy, getDocs } = await import("firebase/firestore");
  const q = query(col(db, "orders"), where("customerId", "==", customerId), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

// Get creator sales
export const getCreatorSales = async (creatorId) => {
  const { collection: col, query, where, orderBy, getDocs } = await import("firebase/firestore");
  const q = query(col(db, "orders"), where("creatorId", "==", creatorId), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};