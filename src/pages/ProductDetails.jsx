import { useEffect, useState } from "react";
import { useParams, Link, useSearchParams } from "react-router-dom";
import { getProductById } from "../services/productService";
import { saveReferralCookie, getReferralFromCookie } from "../services/orderService";
import { createCheckoutSession } from "../services/stripeService";

function ProductDetails() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [buying, setBuying] = useState(false);

  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref) {
      saveReferralCookie(ref);
    }

    const loadProduct = async () => {
      try {
        const data = await getProductById(id);
        if (!data || data.status !== "approved") {
          setError("Product not found or not available.");
          return;
        }
        setProduct(data);
      } catch (err) {
        console.error("Unable to load product details", err);
        setError("Unable to load product details.");
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id, searchParams]);

  const handleBuy = async () => {
    if (!product) return;
    setBuying(true);

    try {
      const promoterSlug = getReferralFromCookie();
      const customerEmail = prompt("Enter your email for the receipt:", "");
      if (!customerEmail) {
        setBuying(false);
        return;
      }

      const checkoutUrl = await createCheckoutSession(product, customerEmail, promoterSlug);
      window.location.href = checkoutUrl;
    } catch (err) {
      console.error("Checkout failed:", err);
      alert("Payment failed. Please try again. " + err.message);
      setBuying(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.container}>
          <p>Loading product details…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.page}>
        <div style={styles.container}>
          <p>{error}</p>
          <Link to="/marketplace" style={styles.backLink}>Return to marketplace</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <Link to="/marketplace" style={styles.backLink}>← Back to marketplace</Link>
        <div style={styles.card}>
          <div style={styles.topRow}>
            <div>
              <h1 style={styles.title}>{product.title || product.name}</h1>
              <p style={styles.category}>{product.category}</p>
            </div>
            <div style={styles.pricePanel}>${product.price?.toFixed(2) ?? "0.00"}</div>
          </div>

          <p style={styles.description}>{product.description}</p>

          <div style={styles.infoGrid}>
            <div style={styles.infoBlock}>
              <p style={styles.infoLabel}>Creator</p>
              <p style={styles.infoValue}>{product.creatorEmail || "Creator"}</p>
            </div>
            <div style={styles.infoBlock}>
              <p style={styles.infoLabel}>Status</p>
              <p style={styles.infoValue}>{product.status}</p>
            </div>
            <div style={styles.infoBlock}>
              <p style={styles.infoLabel}>Uploaded</p>
              <p style={styles.infoValue}>
                {product.createdAt?.toDate ? product.createdAt.toDate().toLocaleDateString() : "Unknown"}
              </p>
            </div>
          </div>

          <button onClick={handleBuy} disabled={buying} style={styles.buyBtn}>
            {buying ? "Redirecting to Stripe…" : `Buy Now — $${product.price?.toFixed(2) ?? "0.00"}`}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: "calc(100vh - 70px)", padding: "40px 24px", background: "linear-gradient(180deg, #05070d 0%, #0f172a 100%)", color: "#fff", fontFamily: "Inter, sans-serif" },
  container: { maxWidth: "900px", margin: "0 auto" },
  backLink: { display: "inline-block", color: "#a5b4ff", textDecoration: "none", marginBottom: "24px" },
  card: { padding: "32px", borderRadius: "24px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(79,124,255,0.16)" },
  topRow: { display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "20px", alignItems: "flex-start" },
  title: { fontSize: "36px", margin: 0 },
  category: { color: "#94a3b8", marginTop: "10px" },
  pricePanel: { fontSize: "32px", fontWeight: 700, color: "#fff" },
  description: { color: "#cbd5e1", marginTop: "28px", lineHeight: 1.8 },
  infoGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "18px", marginTop: "28px" },
  infoBlock: { padding: "20px", borderRadius: "18px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(79,124,255,0.1)" },
  infoLabel: { margin: 0, color: "#94a3b8", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.12em" },
  infoValue: { margin: "10px 0 0", fontSize: "16px", fontWeight: 600 },
  buyBtn: { marginTop: "32px", width: "100%", padding: "16px 24px", borderRadius: "16px", border: "none", background: "linear-gradient(135deg, #4f7cff, #7c3aed)", color: "#fff", fontSize: "16px", fontWeight: 700, cursor: "pointer" },
};

export default ProductDetails;