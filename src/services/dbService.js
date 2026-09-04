import { collection, addDoc, getDocs, getDoc, updateDoc, deleteDoc, doc, query, where, orderBy, limit, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/config";

// ============ PRODUCTS ============

export const addProduct = async (productData) => {
  const productRef = await addDoc(collection(db, "products"), {
    ...productData,
    totalSales: 0,
    status: "approved",
    createdAt: serverTimestamp(),
  });
  return { id: productRef.id, ...productData };
};

export const getProducts = async () => {
  const snap = await getDocs(collection(db, "products"));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const getApprovedProducts = async () => {
  const q = query(collection(db, "products"), where("status", "==", "approved"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const getProductById = async (productId) => {
  const snap = await getDoc(doc(db, "products", productId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
};

export const updateProduct = async (productId, updates) => {
  await updateDoc(doc(db, "products", productId), { ...updates, updatedAt: serverTimestamp() });
};

export const deleteProduct = async (productId) => {
  await deleteDoc(doc(db, "products", productId));
};

// ============ BUNDLES ============

export const addBundle = async (bundleData) => {
  const bundleRef = await addDoc(collection(db, "bundles"), {
    ...bundleData,
    products: bundleData.products || [],
    status: bundleData.status || "active",
    createdAt: serverTimestamp(),
  });
  return { id: bundleRef.id, ...bundleData };
};

export const getBundles = async () => {
  const snap = await getDocs(collection(db, "bundles"));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const getActiveBundles = async () => {
  const q = query(collection(db, "bundles"), where("status", "==", "active"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const getBundleById = async (bundleId) => {
  const snap = await getDoc(doc(db, "bundles", bundleId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
};

export const updateBundle = async (bundleId, updates) => {
  await updateDoc(doc(db, "bundles", bundleId), { ...updates, updatedAt: serverTimestamp() });
};

export const deleteBundle = async (bundleId) => {
  await deleteDoc(doc(db, "bundles", bundleId));
};

// ============ USERS ============

export const getUserById = async (userId) => {
  const snap = await getDoc(doc(db, "users", userId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
};

export const updateUser = async (userId, updates) => {
  await updateDoc(doc(db, "users", userId), { ...updates, updatedAt: serverTimestamp() });
};

// ============ TRANSACTIONS ============

export const addTransaction = async (transactionData) => {
  const txRef = await addDoc(collection(db, "transactions"), {
    ...transactionData,
    status: transactionData.status || "pending",
    createdAt: serverTimestamp(),
  });
  return { id: txRef.id, ...transactionData };
};

export const getTransactions = async () => {
  const q = query(collection(db, "transactions"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const getTransactionsByUser = async (userId) => {
  const q = query(collection(db, "transactions"), where("userId", "==", userId), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const updateTransaction = async (transactionId, updates) => {
  await updateDoc(doc(db, "transactions", transactionId), { ...updates, updatedAt: serverTimestamp() });
};

// ============ LEDGER ============

export const addLedgerEntry = async (entry) => {
  const entryRef = await addDoc(collection(db, "ledger"), {
    ...entry,
    createdAt: serverTimestamp(),
  });
  return { id: entryRef.id, ...entry };
};

export const getLedgerByUser = async (userId) => {
  const q = query(collection(db, "ledger"), where("userId", "==", userId), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const getLedgerByTransaction = async (transactionId) => {
  const q = query(collection(db, "ledger"), where("transactionId", "==", transactionId));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

// ============ REFERRALS ============

export const addReferral = async (referralData) => {
  const ref = await addDoc(collection(db, "referrals"), {
    ...referralData,
    status: "pending",
    createdAt: serverTimestamp(),
  });
  return { id: ref.id, ...referralData };
};

export const getReferrals = async () => {
  const q = query(collection(db, "referrals"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const getReferralsByReferrer = async (referrerId) => {
  const q = query(collection(db, "referrals"), where("referrerId", "==", referrerId), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const updateReferral = async (referralId, updates) => {
  await updateDoc(doc(db, "referrals", referralId), { ...updates, updatedAt: serverTimestamp() });
};