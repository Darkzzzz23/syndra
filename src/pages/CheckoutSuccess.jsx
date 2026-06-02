import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { createOrder, getReferralFromCookie } from "../services/orderService";

function CheckoutSuccess() {
  const [searchParams] = useSearchParams();
  const productId = searchParams.get("productId");
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [orderCreated, setOrderCreated] = useState(false);

  useEffect(() => {
    const loadProduct = async () => {
      if (!productId) {
        setLoading(false);
        return;
      }
      try {
        const productRef = doc(db, "products", productId);
        const snap = await getDoc(productRef);
        if (snap.exists()) {
          const productData = { id: snap.id, ...snap.data() };
          setProduct(productData);

          // Create the order
          if (!orderCreated) {
            const promoterSlug = getReferralFromCookie();
            const customerEmail = "customer@email.com"; // In production, get from Stripe session

            await createOrder({
              productId: productData.id,
              productTitle: productData.title || productData.name,
              customerId: "guest",
              customerEmail: customerEmail,
              creatorId: productData.creatorId || productData.ownerUid,
              amount: productData.price || 0,
              promoterSlug: promoterSlug,
            });
            setOrderCreated(true);
          }
        }
      } catch (err) {
        console.error("Failed to load product:", err);
      } finally {
        setLoading(false);
      }
    };
    loadProduct();
  }, [productId, orderCreated]);

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.icon}>✅</div>
          <h1 style={styles.title}>Payment Successful!</h1>
          <p style={styles.subtitle}>Thank you for your purchase. Your download is ready.</p>

          {loading ? (
            <p style={styles.loading}>Loading your product...</p>
          ) : product ? (
            <div style={styles.productInfo}>
              <h2 style={styles.productTitle}>{product.title || product.name}</h2>
              <p style={styles.productDesc}>{product.description?.slice(0, 150)}...</p>

              {product.fileUrl ? (
                <a href={product.fileUrl} target="_blank" rel="noopener noreferrer" style={styles.downloadBtn} download>
                  📥 Download Your File
                </a>
              ) : (
                <p style={styles.noFile}>Download link will be available soon. Check your email.</p>
              )}
            </div>
          ) : (
            <p style={styles.loading}>Product information not available.</p>
          )}

          <div style={styles.actions}>
            <Link to="/marketplace" style={styles.marketplaceBtn}>Browse More Products</Link>
            <Link to="/dashboard" style={styles.dashboardBtn}>Go to Dashboard</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: "calc(100vh - 70px)", padding: "60px 24px", color: "#fff", background: "linear-gradient(180deg, #05070d 0%, #0f172a 100%)", fontFamily: "Inter, sans-serif", display: "flex", justifyContent: "center", alignItems: "center" },
  container: { maxWidth: "600px", width: "100%" },
  card: { padding: "48px 36px", borderRadius: "24px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(34,197,94,0.3)", textAlign: "center" },
  icon: { fontSize: "56px", marginBottom: "16px" },
  title: { fontSize: "32px", margin: 0, color: "#bbf7d0" },
  subtitle: { color: "#94a3b8", marginTop: "12px", lineHeight: 1.7 },
  loading: { color: "#94a3b8", marginTop: "24px" },
  productInfo: { marginTop: "28px", padding: "24px", borderRadius: "16px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(79,124,255,0.14)", textAlign: "left" },
  productTitle: { fontSize: "20px", margin: 0 },
  productDesc: { color: "#cbd5e1", marginTop: "10px", lineHeight: 1.6 },
  downloadBtn: { display: "inline-block", marginTop: "20px", padding: "16px 28px", borderRadius: "14px", background: "linear-gradient(135deg, #22c55e, #16a34a)", color: "#fff", textDecoration: "none", fontWeight: 700, fontSize: "16px" },
  noFile: { marginTop: "20px", color: "#fbbf24" },
  actions: { display: "flex", gap: "12px", justifyContent: "center", marginTop: "32px", flexWrap: "wrap" },
  marketplaceBtn: { padding: "14px 24px", borderRadius: "14px", background: "linear-gradient(135deg, #4f7cff, #7c3aed)", color: "#fff", textDecoration: "none", fontWeight: 700 },
  dashboardBtn: { padding: "14px 24px", borderRadius: "14px", background: "rgba(255,255,255,0.08)", color: "#cbd5e1", textDecoration: "none", fontWeight: 600, border: "1px solid rgba(255,255,255,0.1)" },
};

export default CheckoutSuccess;