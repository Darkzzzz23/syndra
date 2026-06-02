import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { doc, getDoc, setDoc, collection, query, where, getDocs, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/config";
import { saveReferralCookie } from "../services/orderService";

function Redirect() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const promoterRef = searchParams.get("ref") || null;
  const [message, setMessage] = useState("Redirecting to product...");

  useEffect(() => {
    const handleRedirect = async () => {
      try {
        const productRef = doc(db, "products", id);
        const productSnap = await getDoc(productRef);

        if (!productSnap.exists()) {
          setMessage("Product not found. Redirecting to marketplace...");
          setTimeout(() => { window.location.href = "/marketplace"; }, 1500);
          return;
        }

        const product = productSnap.data();

        if (product.status !== "approved") {
          setMessage("This product is not available. Redirecting to marketplace...");
          setTimeout(() => { window.location.href = "/marketplace"; }, 1500);
          return;
        }

        // Save referral to cookie (30 days)
        if (promoterRef) {
          saveReferralCookie(promoterRef);
        }

        // Log click
        const clickRef = doc(db, "clicks", `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
        await setDoc(clickRef, {
          productId: id,
          promoterRef: promoterRef,
          timestamp: serverTimestamp(),
          userAgent: navigator.userAgent,
        });

        // Increment counts if promoter link
        if (promoterRef) {
          const promotersRef = collection(db, "promoters");
          const q = query(promotersRef, where("slug", "==", promoterRef));
          const promoterSnap = await getDocs(q);

          if (!promoterSnap.empty) {
            const promoterDoc = promoterSnap.docs[0];
            const promoterData = promoterDoc.data();
            await setDoc(promoterDoc.ref, { totalClicks: (promoterData.totalClicks || 0) + 1 }, { merge: true });
          }

          await setDoc(productRef, { totalClicks: (product.totalClicks || 0) + 1 }, { merge: true });
        }

        window.location.href = `/product/${id}?ref=${promoterRef || ""}`;
      } catch (error) {
        console.error("Redirect error:", error);
        setMessage("Something went wrong. Redirecting to marketplace...");
        setTimeout(() => { window.location.href = "/marketplace"; }, 1500);
      }
    };

    handleRedirect();
  }, [id, promoterRef]);

  return (
    <div style={styles.page}>
      <h2>{message}</h2>
      <p>Please wait while we take you to the product.</p>
    </div>
  );
}

const styles = {
  page: { height: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", background: "#0b0f17", color: "#fff", fontFamily: "Inter, sans-serif" },
};

export default Redirect;