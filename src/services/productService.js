import { collection, query, where, orderBy, getDocs, doc, getDoc, setDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/config";
import { uploadToCloudinary } from "./cloudinaryService";

const productsCollection = collection(db, "products");

export const uploadProductFile = async (ownerUid, file) => {
  return await uploadToCloudinary(file);
};

export const createProduct = async ({ 
  title, description, category, price, ownerUid, creatorEmail, 
  fileUrl, thumbnailUrl = "", previewUrls = [] 
}) => {
  const productRef = doc(productsCollection);
  const productData = {
    title,
    name: title,
    description,
    category,
    price: Number(price) || 0,
    ownerUid,
    creatorId: ownerUid,
    creatorEmail,
    fileUrl,
    thumbnailUrl,
    previewUrls,
    status: "pending",
    active: false,
    createdAt: serverTimestamp(),
    totalClicks: 0,
    totalSales: 0,
  };

  await setDoc(productRef, productData);
  return { id: productRef.id, ...productData };
};

export const getApprovedProducts = async () => {
  const approvedQuery = query(productsCollection, where("status", "==", "approved"), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(approvedQuery);
  return snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
};

export const getProductById = async (productId) => {
  const productRef = doc(db, "products", productId);
  const docSnap = await getDoc(productRef);
  if (!docSnap.exists()) return null;
  return { id: docSnap.id, ...docSnap.data() };
};

export const getCreatorProducts = async (ownerUid) => {
  const creatorQuery = query(productsCollection, where("ownerUid", "==", ownerUid), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(creatorQuery);
  return snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
};

export const getPendingProducts = async () => {
  const pendingQuery = query(productsCollection, where("status", "==", "pending"), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(pendingQuery);
  return snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
};

export const updateProductStatus = async (productId, status, reviewerUid = null) => {
  const productRef = doc(db, "products", productId);
  const updateData = {
    status,
    active: status === "approved",
    updatedAt: serverTimestamp(),
  };

  if (status === "approved") {
    updateData.approvedAt = serverTimestamp();
  } else {
    updateData.approvedAt = null;
  }

  if (reviewerUid) {
    updateData.reviewedBy = reviewerUid;
    updateData.reviewedAt = serverTimestamp();
  }

  await setDoc(productRef, updateData, { merge: true });
  const docSnap = await getDoc(productRef);
  return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
};

export const deleteProduct = async (productId) => {
  const productRef = doc(db, "products", productId);
  await deleteDoc(productRef);
};