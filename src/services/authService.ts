import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type User,
} from "firebase/auth";
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { auth, db, firebaseConfigured } from "../firebase/config";

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  workspaceName: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

function requireFirebase() {
  if (!firebaseConfigured || !auth || !db) {
    throw new Error("Firebase is not configured. Add the VITE_FIREBASE_* values to .env.local.");
  }
  return { auth, db };
}

function profileRef(uid: string) {
  const { db: firestore } = requireFirebase();
  return doc(firestore, "users", uid);
}

export async function ensureUserProfile(user: User): Promise<UserProfile> {
  const reference = profileRef(user.uid);
  const snapshot = await getDoc(reference);
  if (snapshot.exists()) {
    return { uid: user.uid, ...snapshot.data() } as UserProfile;
  }

  const profile: UserProfile = {
    uid: user.uid,
    email: user.email ?? "",
    displayName: user.displayName ?? "",
    workspaceName: "My workspace",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  await setDoc(reference, profile);
  return profile;
}

export async function createAccount(
  email: string,
  password: string,
  displayName: string,
  workspaceName: string,
) {
  const { auth: firebaseAuth } = requireFirebase();
  const credential = await createUserWithEmailAndPassword(firebaseAuth, email.trim(), password);
  await updateProfile(credential.user, { displayName: displayName.trim() });
  const profile: UserProfile = {
    uid: credential.user.uid,
    email: credential.user.email ?? email.trim(),
    displayName: displayName.trim(),
    workspaceName: workspaceName.trim(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  await setDoc(profileRef(credential.user.uid), profile);
  return { user: credential.user, profile };
}

export async function signIn(email: string, password: string) {
  const { auth: firebaseAuth } = requireFirebase();
  const credential = await signInWithEmailAndPassword(firebaseAuth, email.trim(), password);
  const profile = await ensureUserProfile(credential.user);
  return { user: credential.user, profile };
}

export async function updateWorkspaceProfile(
  uid: string,
  changes: Pick<UserProfile, "displayName" | "workspaceName">,
) {
  const reference = profileRef(uid);
  await updateDoc(reference, {
    displayName: changes.displayName.trim(),
    workspaceName: changes.workspaceName.trim(),
    updatedAt: serverTimestamp(),
  });
  return { uid, ...changes };
}

export async function requestPasswordReset(email: string) {
  const { auth: firebaseAuth } = requireFirebase();
  await sendPasswordResetEmail(firebaseAuth, email.trim());
}

export async function logOut() {
  const { auth: firebaseAuth } = requireFirebase();
  await signOut(firebaseAuth);
}