import { auth, db } from "../firebase/config";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";

import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";

/**
 * REGISTER USER
 */
export const registerUser = async (email, password, referralCode = null) => {
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );

  const user = userCredential.user;

  // Create a Firestore user document if it doesn't already exist.
  const userRef = doc(db, "users", user.uid);
  const snap = await getDoc(userRef);
  if (!snap.exists()) {
    await setDoc(userRef, {
      uid: user.uid,
      email: user.email,
      referralCode: user.uid.slice(0, 8),
      referredBy: referralCode || null,
      role: "user",
      totalClicks: 0,
      totalRevenue: 0,
      commissionEarned: 0,
      createdAt: serverTimestamp(),
    });
  }

  return user;
};

/**
 * LOGIN USER
 */
export const loginUser = async (email, password) => {
  const userCredential = await signInWithEmailAndPassword(
    auth,
    email,
    password
  );

  const user = userCredential.user;

  // Ensure Firestore user document exists for role-based features
  const userRef = doc(db, "users", user.uid);
  const snap = await getDoc(userRef);
  if (!snap.exists()) {
    await setDoc(userRef, {
      uid: user.uid,
      email: user.email,
      role: "user",
      totalClicks: 0,
      totalRevenue: 0,
      commissionEarned: 0,
      createdAt: serverTimestamp(),
    });
  }

  return user;
};

/**
 * GET USER DATA (optional future use)
 */
export const getUserData = async (uid) => {
  const docRef = doc(db, "users", uid);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docSnap.data();
  } else {
    return null;
  }
};
