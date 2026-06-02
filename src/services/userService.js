import { doc, setDoc, getDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { deleteUser } from "firebase/auth";
import { db, auth } from "../firebase/config";

// Update user profile
export const updateUserProfile = async (uid, profileData) => {
  const userRef = doc(db, "users", uid);
  await setDoc(userRef, {
    displayName: profileData.displayName || "",
    bio: profileData.bio || "",
    profileImage: profileData.profileImage || "",
    updatedAt: serverTimestamp(),
  }, { merge: true });

  // Also update creatorProfile if user is a creator
  const creatorRef = doc(db, "creatorProfiles", uid);
  const creatorSnap = await getDoc(creatorRef);
  if (creatorSnap.exists()) {
    await setDoc(creatorRef, {
      displayName: profileData.displayName || "",
      bio: profileData.bio || "",
      profileImage: profileData.profileImage || "",
      updatedAt: serverTimestamp(),
    }, { merge: true });
  }
};

// Change user role
export const changeUserRole = async (uid, newRole) => {
  const userRef = doc(db, "users", uid);
  await setDoc(userRef, {
    role: newRole,
    updatedAt: serverTimestamp(),
  }, { merge: true });
};

// Get full user profile
export const getFullUserProfile = async (uid) => {
  const userRef = doc(db, "users", uid);
  const snap = await getDoc(userRef);
  if (snap.exists()) {
    return snap.data();
  }
  return null;
};

// Delete user account
export const deleteUserAccount = async (uid) => {
  // Delete user document
  const userRef = doc(db, "users", uid);
  await deleteDoc(userRef);

  // Delete creator profile if exists
  const creatorRef = doc(db, "creatorProfiles", uid);
  const creatorSnap = await getDoc(creatorRef);
  if (creatorSnap.exists()) {
    await deleteDoc(creatorRef);
  }

  // Delete Firebase Auth user
  const user = auth.currentUser;
  if (user && user.uid === uid) {
    await deleteUser(user);
  }
};