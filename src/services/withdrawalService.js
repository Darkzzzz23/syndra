import { collection, query, where, orderBy, getDocs, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/config";

const withdrawalsCollection = collection(db, "withdrawals");

// Request withdrawal
export const requestWithdrawal = async (uid, email, amount, role) => {
  const withdrawalRef = doc(withdrawalsCollection);
  await setDoc(withdrawalRef, {
    uid,
    email,
    amount: Number(amount),
    role,
    status: "pending",
    createdAt: serverTimestamp(),
    reviewedAt: null,
    reviewedBy: null,
  });
  return { id: withdrawalRef.id };
};

// Get user's withdrawals
export const getUserWithdrawals = async (uid) => {
  const q = query(withdrawalsCollection, where("uid", "==", uid), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

// Get all pending withdrawals (for admin)
export const getPendingWithdrawals = async () => {
  const q = query(withdrawalsCollection, where("status", "==", "pending"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

// Approve or reject withdrawal
export const updateWithdrawalStatus = async (withdrawalId, status, reviewerUid) => {
  const ref = doc(db, "withdrawals", withdrawalId);
  await setDoc(ref, {
    status,
    reviewedAt: serverTimestamp(),
    reviewedBy: reviewerUid,
  }, { merge: true });
};
// Mark withdrawal as paid
export const markWithdrawalPaid = async (withdrawalId, reviewerUid) => {
  const ref = doc(db, "withdrawals", withdrawalId);
  await setDoc(ref, {
    status: "paid",
    paidAt: serverTimestamp(),
    reviewedBy: reviewerUid,
  }, { merge: true });
};