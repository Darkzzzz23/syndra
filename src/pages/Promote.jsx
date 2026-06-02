import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { getApprovedProducts } from "../services/productService";
import { getPromoterByUid, generateReferralLink } from "../services/promotionService";

function Promote() {
  const { currentUser } = useContext(AuthContext);
  const [products, setProducts] = useState([]);
  const [promoter, setPromoter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [approvedProducts, promoterProfile] = await Promise.all([
          getApprovedProducts(),
          getPromoterByUid(currentUser.uid),
        ]);
        setProducts(approvedProducts);
        setPromoter(promoterProfile);
      } catch (err) {
        console.error("Failed to load promote page:", err);
      } finally {
        setLoading(false);
      }
    };
    if (currentUser) load();
  }, [currentUser]);

  const copyLink = (link, productId) => {
    navigator.clipboard.writeText(link);
    setCopiedId(productId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (loading) {
    return (
      <div style={styles.page}>
        <p>Loading products...</p>
      </div>
    );
  }

  if (!promoter || promoter.status !== "approved") {
    return (
      <div style={styles.page}>
        <div style={styles.container}>
          <h1 style={styles.title}>Promote Products</h1>
          <p style={styles.subtitle}>
            You need to be an approved promoter to access this page.
          </p>
          <a href="/apply-promoter" style={styles.applyLink}>Apply to become a promoter →</a>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Promote Products</h1>
            <p style={styles.subtitle}>
              Your referral slug: <strong style={styles.slugHighlight}>?ref={promoter.slug}</strong>
            </p>
          </div>
        </div>

        <div style={styles.statsRow}>
          <div style={styles.statCard}>
            <p style={styles.statLabel}>Total Clicks</p>
            <p style={styles.statValue}>{promoter.totalClicks || 0}</p>
          </div>
          <div style={styles.statCard}>
            <p style={styles.statLabel}>Total Sales</p>
            <p style={styles.statValue}>{promoter.totalSales || 0}</p>
          </div>
          <div style={styles.statCard}>
            <p style={styles.statLabel}>Earnings</p>
            <p style={styles.statValue}>${(promoter.totalEarnings || 0).toFixed(2)}</p>
          </div>
        </div>

        <h2 style={styles.sectionTitle}>Approved Products</h2>
        <div style={styles.grid}>
          {products.length > 0 ? (
            products.map((product) => {
              const link = generateReferralLink(product.id, promoter.slug);
              const isCopied = copiedId === product.id;

              return (
                <div key={product.id} style={styles.card}>
                  <div style={styles.cardHeader}>
                    <span style={styles.category}>{product.category}</span>
                    <span style={styles.price}>${product.price?.toFixed(2) ?? "0.00"}</span>
                  </div>
                  <h3 style={styles.productTitle}>{product.title || product.name}</h3>
                  <p style={styles.productDesc}>{product.description?.slice(0, 100)}...</p>
                  <p style={styles.commission}>
                    Commission: ${((product.price || 0) * 0.2).toFixed(2)} (20%)
                  </p>
                  <button
                    onClick={() => copyLink(link, product.id)}
                    style={styles.copyBtn}
                  >
                    {isCopied ? "✓ Copied!" : "Copy Referral Link"}
                  </button>
                </div>
              );
            })
          ) : (
            <p style={styles.empty}>No approved products available yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "calc(100vh - 70px)",
    padding: "40px 24px",
    color: "#fff",
    background: "linear-gradient(180deg, #05070d 0%, #0f172a 100%)",
    fontFamily: "Inter, sans-serif",
  },
  container: {
    maxWidth: "1140px",
    margin: "0 auto",
  },
  header: {
    marginBottom: "28px",
  },
  title: {
    fontSize: "34px",
    margin: 0,
  },
  subtitle: {
    color: "#94a3b8",
    marginTop: "10px",
  },
  slugHighlight: {
    color: "#a5b4ff",
    background: "rgba(79,124,255,0.15)",
    padding: "4px 10px",
    borderRadius: "8px",
  },
  statsRow: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "16px",
    marginBottom: "32px",
  },
  statCard: {
    padding: "20px",
    borderRadius: "18px",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(79,124,255,0.14)",
  },
  statLabel: {
    color: "#94a3b8",
    fontSize: "12px",
    textTransform: "uppercase",
    letterSpacing: "0.1em",
  },
  statValue: {
    fontSize: "28px",
    fontWeight: 700,
    marginTop: "8px",
  },
  sectionTitle: {
    fontSize: "24px",
    marginBottom: "18px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "18px",
  },
  card: {
    padding: "22px",
    borderRadius: "18px",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(79,124,255,0.14)",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  category: {
    color: "#94a3b8",
    fontSize: "12px",
  },
  price: {
    fontWeight: 700,
  },
  productTitle: {
    fontSize: "18px",
    margin: 0,
  },
  productDesc: {
    color: "#cbd5e1",
    fontSize: "14px",
    lineHeight: 1.6,
  },
  commission: {
    color: "#a5b4ff",
    fontSize: "14px",
    fontWeight: 600,
  },
  copyBtn: {
    padding: "12px 16px",
    borderRadius: "12px",
    border: "none",
    background: "linear-gradient(135deg, #4f7cff, #7c3aed)",
    color: "#fff",
    cursor: "pointer",
    fontWeight: 700,
    marginTop: "auto",
  },
  empty: {
    color: "#94a3b8",
  },
  applyLink: {
    color: "#a5b4ff",
    textDecoration: "none",
    fontSize: "16px",
  },
};

export default Promote;