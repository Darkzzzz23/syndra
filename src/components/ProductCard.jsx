import { useState } from "react";
import { Link } from "react-router-dom";

function ProductCard({ product, size = "lg" }) {
  const [hovered, setHovered] = useState(false);
  const imgHeight = size === "sm" ? "160px" : "208px";

  return (
    <Link
      to={`/product/${product.id}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        ...styles.card,
        transform: hovered ? "translateY(-2px)" : "translateY(0)",
        boxShadow: hovered
          ? "0 8px 32px rgba(108,92,231,0.12)"
          : "0 1px 3px rgba(0,0,0,0.04)",
      }}
    >
      <div style={{ ...styles.imageWrap, height: imgHeight }}>
        {product.thumbnailUrl ? (
          <img
            src={product.thumbnailUrl}
            alt={product.title || product.name}
            style={{
              ...styles.image,
              transform: hovered ? "scale(1.05)" : "scale(1)",
            }}
          />
        ) : (
          <div style={styles.imagePlaceholder}>📦</div>
        )}
        {product.tag && (
          <span style={styles.tag}>{product.tag}</span>
        )}
      </div>

      <div style={styles.body}>
        <span style={styles.category}>{product.category}</span>
        <h3 style={styles.title}>{product.title || product.name}</h3>
        <p style={styles.creator}>by {product.creatorDisplayName || product.creatorEmail?.split("@")[0] || product.creator}</p>
        <div style={styles.footer}>
          <div style={styles.ratingRow}>
            <span style={styles.star}>★</span>
            <span style={styles.ratingText}>{product.averageRating || product.rating || "—"} ({product.totalReviews || product.reviews || 0})</span>
          </div>
          <span style={styles.price}>${product.price?.toFixed(2)}</span>
        </div>
      </div>
    </Link>
  );
}

const styles = {
  card: {
    background: "#fff",
    border: "1px solid rgba(0,0,0,0.08)",
    borderRadius: "12px",
    overflow: "hidden",
    cursor: "pointer",
    transition: "transform 0.2s, box-shadow 0.2s",
    textDecoration: "none",
    color: "inherit",
    display: "flex",
    flexDirection: "column",
  },
  imageWrap: {
    position: "relative",
    width: "100%",
    background: "#f5f5f7",
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    transition: "transform 0.5s",
  },
  imagePlaceholder: {
    fontSize: "40px",
    opacity: 0.3,
  },
  tag: {
    position: "absolute",
    top: "12px",
    left: "12px",
    fontSize: "10px",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    padding: "4px 8px",
    background: "#6C5CE7",
    color: "#fff",
    borderRadius: "6px",
  },
  body: {
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    flex: 1,
  },
  category: {
    display: "inline-block",
    fontSize: "10px",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    padding: "2px 8px",
    background: "#ede9ff",
    color: "#6C5CE7",
    borderRadius: "4px",
    alignSelf: "flex-start",
  },
  title: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: "14px",
    fontWeight: 600,
    lineHeight: 1.3,
    margin: "4px 0 0",
    color: "#0f0f0f",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  creator: {
    fontSize: "12px",
    color: "#7a7a8a",
    margin: 0,
  },
  footer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "auto",
    paddingTop: "8px",
  },
  ratingRow: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
  },
  star: {
    fontSize: "10px",
    color: "#6C5CE7",
  },
  ratingText: {
    fontSize: "12px",
    color: "#7a7a8a",
  },
  price: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: "16px",
    fontWeight: 700,
    color: "#6C5CE7",
  },
};

export default ProductCard;