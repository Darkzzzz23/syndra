import {
  collection,
  getCountFromServer,
  getDocs,
  limit,
  orderBy,
  query,
  where,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "../firebase/config";

export const getAdminOverview = async () => {
  const [usersCount, productsCount, clicksCount] = await Promise.all([
    getCountFromServer(collection(db, "users")),
    getCountFromServer(collection(db, "products")),
    getCountFromServer(collection(db, "clicks")),
  ]);

  return {
    users: usersCount.data().count,
    products: productsCount.data().count,
    clicks: clicksCount.data().count,
  };
};

export const getTopProducts = async (limitCount = 6) => {
  const productsQuery = query(
    collection(db, "products"),
    orderBy("totalClicks", "desc"),
    limit(limitCount)
  );

  const snapshot = await getDocs(productsQuery);
  return snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
  }));
};

export const getRecentUsers = async (limitCount = 5) => {
  const usersQuery = query(
    collection(db, "users"),
    orderBy("createdAt", "desc"),
    limit(limitCount)
  );

  const snapshot = await getDocs(usersQuery);
  return snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
  }));
};

export const getRecentClicks = async (limitCount = 8) => {
  const clicksQuery = query(
    collection(db, "clicks"),
    orderBy("createdAt", "desc"),
    limit(limitCount)
  );

  const snapshot = await getDocs(clicksQuery);
  return snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
  }));
};

export const getUserAnalytics = async (uid) => {
  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);

  const productQuery = query(
    collection(db, "products"),
    where("ownerUid", "==", uid),
    orderBy("totalClicks", "desc"),
    limit(6)
  );

  const productsSnap = await getDocs(productQuery);

  return {
    user: userSnap.exists() ? { id: userSnap.id, ...userSnap.data() } : null,
    products: productsSnap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() })),
  };
};
