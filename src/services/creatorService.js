import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/config";

// Create or update creator profile
export const saveCreatorProfile = async (uid, profileData) => {
  const profileRef = doc(db, "creatorProfiles", uid);
  await setDoc(profileRef, {
    ...profileData,
    updatedAt: serverTimestamp(),
  }, { merge: true });
};

// Get creator profile
export const getCreatorProfile = async (uid) => {
  const profileRef = doc(db, "creatorProfiles", uid);
  const snap = await getDoc(profileRef);
  if (snap.exists()) {
    return snap.data();
  }
  return {
    displayName: "",
    bio: "",
    profileImage: "",
    productCount: 0,
    totalSales: 0,
    averageRating: 0,
  };
};

// Update creator stats (called after product upload or sale)
export const updateCreatorStats = async (uid, { productCount, totalSales }) => {
  const profileRef = doc(db, "creatorProfiles", uid);
  const snap = await getDoc(profileRef);
  const current = snap.exists() ? snap.data() : {};

  await setDoc(profileRef, {
    productCount: (current.productCount || 0) + (productCount || 0),
    totalSales: (current.totalSales || 0) + (totalSales || 0),
    updatedAt: serverTimestamp(),
  }, { merge: true });
};