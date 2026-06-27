import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { getApprovedProducts } from "../services/productService";
import SEO from "../components/SEO";

function Marketplace() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const [sortOpen, setSortOpen] = useState(false);
  const sortRef = useRef(null);

  const categories = ["All", "Worksheets", "Study Guides", "E-books", "Digital Art", "Templates", "Printables", "Other"];
  const sortOptions = [
    { value: "newest", label: "Newest" },
    { value: "price-low", label: "Price: Low to High" },
    { value: "price-high", label: "Price: High to Low" },
    { value: "rating", label: "Top Rated" },
  ];

  useEffect(() => {
    const handleClick = (e) => {
      if (sortRef.current && !sortRef.current.contains(e.target)) {
        setSortOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

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

  let filtered = products.filter((p) => {
    const matchSearch =
      (p.title || p.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (p.description || "").toLowerCase().includes(search.toLowerCase());
    const matchCategory = selectedCategory === "All" || p.category === selectedCategory;
    return matchSearch && matchCategory;
  });

  if (sortBy === "price-low") filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
  if (sortBy === "price-high") filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
  if (sortBy === "rating") filtered.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
  if (sortBy === "newest") filtered.reverse();

  const currentLabel = sortOptions.find((o) => o.value === sortBy)?.label || "Newest";

  return (
    <div style={styles.page}>
      <SEO title="Marketplace" description="Browse approved digital products from creators across the platform." />

      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Marketplace</h1>
            <p style={styles.subtitle}>Browse digital products from independent creators.</p>
          </div>
        </div>

        {/* FILTER BAR */}
        <div style={styles.filterBar}>
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.searchInput}
          />
          <div style={styles.categories}>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={selectedCategory === cat ? styles.catActive : styles.catBtn}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Custom Sort Dropdown */}
          <div style={styles.sortWrapper} ref={sortRef}>
            <div style={styles.sortTrigger} onClick={() => setSortOpen(!sortOpen)}>
              <span>{currentLabel}</span>
              <span style={styles.sortArrow}>▾</span>
            </div>
            {sortOpen && (
              <div style={styles.sortMenu}>
                {sortOptions.map((opt) => (
                  <div
                    key={opt.value}
                    style={{
                      ...styles.sortOption,
                      ...(sortBy === opt.value ? styles.sortOptionActive : {}),
                    }}
                    onClick={() => {
                      setSortBy(opt.value);
                      setSortOpen(false);
                    }}
                  >
                    {opt.label}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* PRODUCT GRID */}
        <div style={styles.grid}>
          {loading ? (
            <div style={styles.emptyState}>Loading products…</div>
          ) : filtered.length > 0 ? (
            filtered.map((product) => (
              <Link to={`/product/${product.id}`} key={product.id} style={styles.card} className="product-card">
                <div style={styles.cardImage}>
                  {product.thumbnailUrl ? (
                    <img src={product.thumbnailUrl} alt={product.title || product.name} style={styles.thumbnail} />
                  ) : (
                    <span style={styles.imageLabel}>📦</span>
                  )}
                </div>
                <div style={styles.cardContent}>
                  <div style={styles.cardMeta}>
                    <span style={styles.category}>{product.category}</span>
                    <span style={styles.price}>${product.price?.toFixed(2) ?? "0.00"}</span>
                  </div>
                  <h2 style={styles.productTitle}>{product.title || product.name}</h2>
                  {product.averageRating > 0 && (
                    <span style={styles.rating}>
                      {"★".repeat(Math.round(product.averageRating))} {product.averageRating}
                    </span>
                  )}
                  <p style={styles.description}>{product.description?.slice(0, 100)}...</p>
                  <p style={styles.creator}>by {product.creatorDisplayName || product.creatorEmail?.split("@")[0] || "Creator"}</p>
                  <Link to={`/product/${product.id}`} style={styles.detailsBtn}>
                    View Details
                  </Link>
                </div>
              </Link>
            ))
          ) : (
            <div style={styles.emptyState}>No products match your search. Try a different category.</div>
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
  container: { maxWidth: "1100px", margin: "0 auto" },
  header: { marginBottom: "28px" },
  title: { fontSize: "36px", margin: 0 },
  subtitle: { color: "#94a3b8", marginTop: "6px" },
  filterBar: { display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center", marginBottom: "28px" },
  searchInput: { flex: "1 1 200px", padding: "12px 16px", borderRadius: "12px", border: "1px solid rgba(148,163,184,0.2)", background: "rgba(255,255,255,0.04)", color: "#fff", fontSize: "14px", outline: "none", minWidth: "200px" },
  categories: { display: "flex", gap: "8px", flexWrap: "wrap" },
  catBtn: { padding: "8px 14px", borderRadius: "20px", border: "1px solid rgba(79,124,255,0.2)", background: "transparent", color: "#94a3b8", cursor: "pointer", fontSize: "13px", fontWeight: 500 },
  catActive: { padding: "8px 14px", borderRadius: "20px", border: "none", background: "linear-gradient(135deg, #4f7cff, #7c3aed)", color: "#fff", cursor: "pointer", fontSize: "13px", fontWeight: 600 },
  sortWrapper: { position: "relative", userSelect: "none" },
  sortTrigger: { padding: "12px 16px", borderRadius: "12px", border: "1px solid rgba(148,163,184,0.2)", background: "rgba(255,255,255,0.04)", color: "#fff", fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", minWidth: "160px" },
  sortArrow: { color: "#94a3b8", fontSize: "10px", marginLeft: "auto" },
  sortMenu: { position: "absolute", top: "44px", right: "0", minWidth: "180px", background: "#0f172a", border: "1px solid rgba(79,124,255,0.2)", borderRadius: "12px", padding: "6px", zIndex: 20, boxShadow: "0 10px 30px rgba(0,0,0,0.5)" },
  sortOption: { padding: "10px 14px", borderRadius: "8px", fontSize: "13px", color: "#94a3b8", cursor: "pointer" },
  sortOptionActive: { background: "rgba(79,124,255,0.15)", color: "#a5b4ff" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "20px" },
  card: { borderRadius: "16px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(79,124,255,0.1)", overflow: "hidden", textDecoration: "none", color: "#fff", transition: "transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease", display: "flex", flexDirection: "column", minHeight: "380px", cursor: "pointer" },
  cardImage: { height: "150px", background: "rgba(79,124,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" },
  thumbnail: { width: "100%", height: "100%", objectFit: "cover" },
  imageLabel: { fontSize: "36px" },
  cardContent: { padding: "18px", flex: 1, display: "flex", flexDirection: "column", gap: "10px" },
  cardMeta: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  category: { fontSize: "11px", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em" },
  price: { fontSize: "16px", fontWeight: 700, color: "#a5b4ff" },
  productTitle: { fontSize: "17px", fontWeight: 600, margin: 0, lineHeight: 1.3 },
  rating: { color: "#fbbf24", fontSize: "13px" },
  description: { color: "#cbd5e1", fontSize: "13px", lineHeight: 1.5, flex: 1 },
  creator: { fontSize: "12px", color: "#64748b" },
  detailsBtn: { display: "inline-block", marginTop: "auto", padding: "10px 16px", background: "linear-gradient(135deg, #4f7cff, #7c3aed)", color: "#fff", borderRadius: "12px", textDecoration: "none", fontWeight: 700, fontSize: "13px", textAlign: "center" },
  emptyState: { gridColumn: "1/-1", padding: "60px", textAlign: "center", color: "#94a3b8" },
};

export default Marketplace;