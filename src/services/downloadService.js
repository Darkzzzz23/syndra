import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/config";

// Generate a secure download token
export const generateDownloadToken = async (productId, orderId) => {
  const tokenRef = doc(db, "downloadTokens", `${orderId}_${productId}`);
  const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
  
  await setDoc(tokenRef, {
    productId,
    orderId,
    token,
    used: false,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    createdAt: serverTimestamp(),
  });

  return token;
};

// Verify and consume a download token
export const verifyDownloadToken = async (orderId, productId, token) => {
  const tokenRef = doc(db, "downloadTokens", `${orderId}_${productId}`);
  const snap = await getDoc(tokenRef);

  if (!snap.exists()) return { valid: false, reason: "invalid" };

  const data = snap.data();

  if (data.token !== token) return { valid: false, reason: "invalid" };
  if (data.used) return { valid: false, reason: "used" };
  if (data.expiresAt.toDate() < new Date()) return { valid: false, reason: "expired" };

  // Mark as used
  await setDoc(tokenRef, { used: true }, { merge: true });

  return { valid: true, productId: data.productId };
};