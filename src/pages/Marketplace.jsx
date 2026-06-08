import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getApprovedProducts } from "../services/productService";

function Marketplace() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const result = await getApprovedProducts();
        setProducts(result);
      } catch (error) {
        console.error("Unable to load marketplace products", error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Marketplace</h1>
            <p style={styles.subtitle}>
              Browse approved digital products from creators across the platform.
            </p>
          </div>
          <Link to="/" style={styles.ctaLink}>
            Back to Home
          </Link>
        </div>

        <div style={styles.grid}>
          {loading ? (
            <div style={styles.emptyState}>Loading products…</div>
          ) : products.length > 0 ? (
            products.map((product) => (
              <div key={product.id} style={styles.card}>
                <div style={styles.cardImage}>
                  {product.thumbnailUrl ? (
                    <img
                      src={product.thumbnailUrl}
                      alt={product.title || product.name}
                      style={styles.thumbnail}
                    />
                  ) : (
                    <span style={styles.imageLabel}>Product</span>
                  )}
                </div>
                <div style={styles.cardContent}>
                  <div style={styles.cardMeta}>
                    <span style={styles.category}>{product.category}</span>
                    <span style={styles.price}>${product.price?.toFixed(2) ?? "0.00"}</span>
                  </div>
                  <h2 style={styles.productTitle}>{product.title || product.name}</h2>
                  <p style={styles.description}>{product.description}</p>
                  <p style={styles.creator}>By {product.creatorDisplayName || product.creatorEmail?.split("@")[0] || "Creator"}</p>
                  <Link to={`/product/${product.id}`} style={styles.detailsBtn}>
                    View Details
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div style={styles.emptyState}>
              No approved products are live yet. Check back soon.
            </div>
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
    maxWidth: "1180px",
    margin: "0 auto",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "18px",
    marginBottom: "28px",
  },
  title: {
    fontSize: "36px",
    margin: 0,
  },
  subtitle: {
    color: "#94a3b8",
    marginTop: "10px",
    maxWidth: "760px",
    lineHeight: 1.7,
  },
  ctaLink: {
    color: "#a5b4ff",
    textDecoration: "none",
    border: "1px solid rgba(124, 58, 237, 0.35)",
    padding: "12px 18px",
    borderRadius: "14px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "20px",
  },
  card: {
    borderRadius: "22px",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(79,124,255,0.14)",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    minHeight: "360px",
  },
  cardImage: {
    minHeight: "160px",
    background: "linear-gradient(135deg, rgba(79,124,255,0.12), rgba(124,58,237,0.14))",
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "flex-end",
    padding: "16px",
    position: "relative",
    overflow: "hidden",
  },
  thumbnail: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    position: "absolute",
    top: 0,
    left: 0,
  },
  imageLabel: {
    color: "#e0e7ff",
    fontSize: "12px",
    fontWeight: 700,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    position: "relative",
    zIndex: 1,
  },
  cardContent: {
    padding: "22px",
    display: "flex",
    flexDirection: "column",
    gap: "14px",
    flex: 1,
  },
  cardMeta: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    alignItems: "center",
  },
  category: {
    color: "#94a3b8",
    fontSize: "12px",
  },
  price: {
    color: "#fff",
    fontWeight: 700,
  },
  productTitle: {
    fontSize: "20px",
    margin: 0,
  },
  description: {
    color: "#cbd5e1",
    lineHeight: 1.7,
    flex: 1,
  },
  creator: {
    color: "#94a3b8",
    fontSize: "13px",
  },
  detailsBtn: {
    marginTop: "auto",
    display: "inline-block",
    padding: "12px 18px",
    background: "linear-gradient(135deg, #4f7cff, #7c3aed)",
    color: "#fff",
    borderRadius: "14px",
    textDecoration: "none",
    fontWeight: 700,
  },
  emptyState: {
    gridColumn: "1/-1",
    padding: "32px",
    borderRadius: "20px",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(79,124,255,0.14)",
    textAlign: "center",
    color: "#94a3b8",
  },
};

export default Marketplace;