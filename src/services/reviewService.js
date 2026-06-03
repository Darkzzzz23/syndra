import { collection, query, where, orderBy, getDocs, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/config";

const reviewsCollection = collection(db, "reviews");

// Submit a review
export const submitReview = async ({ productId, customerId, customerEmail, rating, comment }) => {
  const reviewRef = doc(reviewsCollection);
  await setDoc(reviewRef, {
    productId,
    customerId,
    customerEmail,
    rating: Number(rating),
    comment,
    createdAt: serverTimestamp(),
  });

  // Update product average rating
  await updateProductRating(productId);
  return { id: reviewRef.id };
};

// Get reviews for a product
export const getProductReviews = async (productId) => {
  const q = query(reviewsCollection, where("productId", "==", productId), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

// Update product average rating
const updateProductRating = async (productId) => {
  const q = query(reviewsCollection, where("productId", "==", productId));
  const snap = await getDocs(q);
  const reviews = snap.docs.map(d => d.data());
  
  if (reviews.length === 0) return;
  
  const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  const productRef = doc(db, "products", productId);
  await setDoc(productRef, {
    averageRating: Math.round(avg * 10) / 10,
    totalReviews: reviews.length,
  }, { merge: true });
};