import { collection, query, where, orderBy, getDocs, doc, getDoc, setDoc, serverTimestamp, limit } from "firebase/firestore";
import { db } from "../firebase/config";

const promotersCollection = collection(db, "promoters");

// Apply to become a promoter
export const applyAsPromoter = async (uid, email, formData) => {
  // Check if slug is already taken
  const slugQuery = query(promotersCollection, where("slug", "==", formData.slug));
  const slugSnap = await getDocs(slugQuery);
  if (!slugSnap.empty) {
    throw new Error("This username is already taken. Please choose another.");
  }

  // Check if user already applied
  const userQuery = query(promotersCollection, where("uid", "==", uid));
  const userSnap = await getDocs(userQuery);
  if (!userSnap.empty) {
    throw new Error("You have already submitted a promoter application.");
  }

  const promoterRef = doc(promotersCollection);
  const promoterData = {
    uid,
    email,
    slug: formData.slug.toLowerCase().trim(),
    status: "pending_review",
    socialStats: {
      reddit: {
        username: formData.redditUsername || "",
        karma: Number(formData.redditKarma) || 0,
      },
      instagram: {
        handle: formData.instagramHandle || "",
        followers: Number(formData.instagramFollowers) || 0,
      },
      tiktok: {
        handle: formData.tiktokHandle || "",
        followers: Number(formData.tiktokFollowers) || 0,
      },
      avgViews: Number(formData.avgViews) || 0,
      engagementRate: formData.engagementRate || "",
    },
    experience: formData.experience || "",
    totalClicks: 0,
    totalSales: 0,
    totalEarnings: 0,
    createdAt: serverTimestamp(),
    approvedAt: null,
  };

  await setDoc(promoterRef, promoterData);
  return { id: promoterRef.id, ...promoterData };
};

// Get promoter profile by UID
export const getPromoterByUid = async (uid) => {
  const q = query(promotersCollection, where("uid", "==", uid));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return { id: snap.docs[0].id, ...snap.docs[0].data() };
};

// Get promoter profile by slug
export const getPromoterBySlug = async (slug) => {
  const q = query(promotersCollection, where("slug", "==", slug));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return { id: snap.docs[0].id, ...snap.docs[0].data() };
};

// Get all pending promoter applications (for admin)
export const getPendingPromoters = async () => {
  const q = query(promotersCollection, where("status", "==", "pending_review"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
};

// Get all approved promoters (for leaderboard)
export const getApprovedPromoters = async (limitCount = 20) => {
  const q = query(promotersCollection, where("status", "==", "approved"), orderBy("totalClicks", "desc"), limit(limitCount));
  const snap = await getDocs(q);
  return snap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
};

// Update promoter status (admin approve/reject)
export const updatePromoterStatus = async (promoterId, status) => {
  const promoterRef = doc(db, "promoters", promoterId);
  const updateData = {
    status,
    updatedAt: serverTimestamp(),
  };
  if (status === "approved") {
    updateData.approvedAt = serverTimestamp();
  }
  await setDoc(promoterRef, updateData, { merge: true });
  const docSnap = await getDoc(promoterRef);
  return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
};

// Get click stats for a promoter
export const getPromoterClickStats = async (promoterSlug) => {
  const clicksQuery = query(
    collection(db, "clicks"),
    where("promoterRef", "==", promoterSlug),
    orderBy("timestamp", "desc"),
    limit(50)
  );
  const snap = await getDocs(clicksQuery);
  return snap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
};

// Generate referral link for a product
export const generateReferralLink = (productId, promoterSlug) => {
  return `${window.location.origin}/go/${productId}?ref=${promoterSlug}`;
};