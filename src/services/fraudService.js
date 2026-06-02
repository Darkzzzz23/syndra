import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";

// Check if buyer is the creator (self-purchase prevention)
export const isSelfPurchase = (customerId, creatorId) => {
  return customerId === creatorId;
};

// Check if buyer is the promoter trying to earn commission on own purchase
export const isSelfReferral = (customerId, promoterSlug) => {
  if (!promoterSlug) return false;
  // We'll check this against the promoters collection
  return null; // checked in validateReferral
};

// Full referral validation
export const validateReferral = async (customerId, promoterSlug, creatorId) => {
  const flags = [];

  // Check self-purchase
  if (customerId === creatorId) {
    flags.push("SELF_PURCHASE");
  }

  // Check if customer is the promoter
  if (promoterSlug) {
    const promotersRef = collection(db, "promoters");
    const q = query(promotersRef, where("slug", "==", promoterSlug));
    const snap = await getDocs(q);

    if (!snap.empty) {
      const promoterData = snap.docs[0].data();

      // Promoter buying from themselves
      if (promoterData.uid === customerId) {
        flags.push("SELF_REFERRAL");
      }

      // Promoter not approved
      if (promoterData.status !== "approved") {
        flags.push("PROMOTER_NOT_APPROVED");
      }
    } else {
      flags.push("INVALID_PROMOTER");
    }
  }

  // Check for duplicate recent orders (rapid fire purchases)
  const ordersRef = collection(db, "orders");
  const recentQuery = query(
    ordersRef,
    where("customerId", "==", customerId),
    where("productId", "==", creatorId) // using creatorId as placeholder, will be productId in real call
  );
  const recentSnap = await getDocs(recentQuery);
  if (recentSnap.size > 0) {
    flags.push("DUPLICATE_PURCHASE_CHECK");
  }

  return {
    isValid: flags.length === 0,
    flags,
  };
};

// Suspicious activity detection
export const detectSuspiciousActivity = (orderData) => {
  const flags = [];

  // Unusually high amount
  if (orderData.amount > 500) {
    flags.push("HIGH_VALUE_PURCHASE");
  }

  // Missing promoter on a referred visit
  // (can add more rules here)

  return flags;
};