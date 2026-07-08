import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getApprovedProducts } from "../services/productService";
import SEO from "../components/SEO";

function Marketplace() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const categories = ["All", "Worksheets", "Study Guides", "E-books", "Digital Art", "Templates", "Printables", "Other"];

  useEffect(() => {
    const load = async () => {
      try {
        const result = await getApprovedProducts();
        setProducts(result);
      } catch (err) {
        console.error("Failed to load products:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  let filtered = products.filter(p => {
    const matchSearch = (p.title || "").toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "All" || p.category === category;
    return matchSearch && matchCat;
  });

  return (
    <div style={styles.page}>
      <SEO title="Marketplace" description="Browse digital products from independent creators." />

      <div style={styles.container}>
        <h1 style={styles.title}>Marketplace</h1>
        <p style={styles.subtitle}>Browse digital products from creators around the world</p>

        {/* Filters */}
        <div style={styles.filters}>
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={styles.searchInput}
          />
          <select value={category} onChange={e => setCategory(e.target.value)} style={styles.select}>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Grid */}
        {loading ? (
          <div style={styles.grid}>
            {[1,2,3,4,5,6].map(i => (
              <div key={i} style={styles.card}>
                <div style={{ height: "200px", background: "#F3F4F6", borderRadius: "12px 12px 0 0", animation: "pulse 1.5s ease-in-out infinite" }} />
              </div>
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <div style={styles.grid}>
            {filtered.map(product => (
              <Link to={`/product/${product.id}`} key={product.id} style={styles.card}>
                <div style={styles.cardImg}>
                  {product.thumbnailUrl ? (
                    <img src={product.thumbnailUrl} alt={product.title} style={styles.img} />
                  ) : (
                    <span style={styles.imgPlaceholder}>📦</span>
                  )}
                </div>
                <div style={styles.cardBody}>
                  <span style={styles.cardCat}>{product.category}</span>
                  <h3 style={styles.cardTitle}>{product.title || product.name}</h3>
                  <span style={styles.cardCreator}>by {product.creatorDisplayName || product.creatorEmail?.split("@")[0]}</span>
                  <span style={styles.cardPrice}>${product.price?.toFixed(2)}</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p style={styles.empty}>No products found. Try a different search.</p>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: { fontFamily: "'Inter', sans-serif", background: "#FAFBFC", color: "#1A1D26", minHeight: "100vh", padding: "40px 24px" },
  container: { maxWidth: "960px", margin: "0 auto" },
  title: { fontSize: "32px", fontWeight: 700, margin: 0 },
  subtitle: { color: "#6B7280", marginTop: "6px", fontSize: "15px" },
  filters: { display: "flex", gap: "12px", marginTop: "28px", marginBottom: "28px", flexWrap: "wrap" },
  searchInput: { flex: 1, padding: "12px 16px", borderRadius: "12px", border: "1px solid #E5E7EB", fontSize: "14px", outline: "none", minWidth: "200px", background: "#fff" },
  select: { padding: "12px 16px", borderRadius: "12px", border: "1px solid #E5E7EB", fontSize: "14px", outline: "none", background: "#fff", cursor: "pointer" },
  grid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" },
  card: { borderRadius: "16px", background: "#fff", border: "1px solid #E5E7EB", overflow: "hidden", textDecoration: "none", color: "#1A1D26", transition: "transform 0.15s ease", cursor: "pointer" },
  cardImg: { height: "180px", background: "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center" },
  img: { width: "100%", height: "100%", objectFit: "cover" },
  imgPlaceholder: { fontSize: "36px", opacity: 0.3 },
  cardBody: { padding: "16px" },
  cardCat: { fontSize: "11px", color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.04em" },
  cardTitle: { fontSize: "15px", fontWeight: 600, margin: "4px 0" },
  cardCreator: { fontSize: "12px", color: "#9CA3AF" },
  cardPrice: { fontSize: "16px", fontWeight: 700, color: "#6C5CE7", marginTop: "8px", display: "block" },
  empty: { textAlign: "center", color: "#6B7280", padding: "60px" },
};

export default Marketplace;