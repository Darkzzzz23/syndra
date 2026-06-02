import { doc, setDoc, getDoc, serverTimestamp, increment } from "firebase/firestore";
import { db } from "../firebase/config";

const platformDocRef = doc(db, "platform", "revenue");

// Initialize platform revenue document if it doesn't exist
export const initializePlatformRevenue = async () => {
  const snap = await getDoc(platformDocRef);
  if (!snap.exists()) {
    await setDoc(platformDocRef, {
      totalPlatformRevenue: 0,
      totalCreatorRevenue: 0,
      totalPromoterRevenue: 0,
      totalTransactions: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }
};

// Update platform revenue after a sale
export const updatePlatformRevenue = async (commissions) => {
  await setDoc(platformDocRef, {
    totalPlatformRevenue: increment(commissions.syndra),
    totalCreatorRevenue: increment(commissions.creator),
    totalPromoterRevenue: increment(commissions.promoter),
    totalTransactions: increment(1),
    updatedAt: serverTimestamp(),
  }, { merge: true });
};

// Get platform revenue stats
export const getPlatformRevenue = async () => {
  const snap = await getDoc(platformDocRef);
  if (snap.exists()) {
    return snap.data();
  }
  return {
    totalPlatformRevenue: 0,
    totalCreatorRevenue: 0,
    totalPromoterRevenue: 0,
    totalTransactions: 0,
  };
};