import { collection, query, where, orderBy, getDocs, doc, setDoc, serverTimestamp, limit } from "firebase/firestore";
import { db } from "../firebase/config";

const usersCollection = collection(db, "users");

// Get all admins and moderators
export const getTeamMembers = async () => {
  const q = query(
    usersCollection,
    where("role", "in", ["admin", "moderator"]),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

// Get all users (for adding new team members)
export const getAllUsers = async (limitCount = 50) => {
  const q = query(usersCollection, orderBy("createdAt", "desc"), limit(limitCount));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

// Update a user's role
export const updateUserRole = async (uid, newRole) => {
  const userRef = doc(db, "users", uid);
  await setDoc(userRef, { role: newRole, updatedAt: serverTimestamp() }, { merge: true });
};

// Get review stats for a team member
export const getTeamMemberStats = async (uid) => {
  const productsQuery = query(
    collection(db, "products"),
    where("reviewedBy", "==", uid),
    orderBy("reviewedAt", "desc"),
    limit(100)
  );
  const snap = await getDocs(productsQuery);

  const approved = snap.docs.filter((d) => d.data().status === "approved").length;
  const rejected = snap.docs.filter((d) => d.data().status === "rejected").length;

  return {
    total: snap.size,
    approved,
    rejected,
    recent: snap.docs.slice(0, 10).map((d) => ({ id: d.id, ...d.data() })),
  };
};