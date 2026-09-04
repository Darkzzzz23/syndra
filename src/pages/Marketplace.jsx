// Marketplace.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getApprovedProducts } from "../services/dbService";

function Marketplace() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = ["All", "Ebook", "Guide", "Template", "Worksheet", "Digital Art", "Other"];

  useEffect(() => {
    const load = async () => {
      try {
        const result = await getApprovedProducts();
        setProducts(result);
      } catch (e) { console.error(e); setProducts([]); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  let filtered = products.filter(p => {
    const matchSearch = (p.name || "").toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === "All" || p.category === activeCategory;
    return matchSearch && matchCat;
  });

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>Marketplace</h1>
          <p style={styles.sub}>Browse digital products from our catalog</p>
        </div>

        <div style={styles.searchBar}>
          <span style={{ opacity: 0.4, paddingLeft: "16px" }}>🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..." style={styles.searchInput} />
        </div>

        <div style={styles.pills}>
          {categories.map(c => (
            <button key={c} onClick={() => setActiveCategory(c)} style={activeCategory === c ? styles.pillActive : styles.pill}>{c}</button>
          ))}
        </div>

        {loading ? (
          <p style={{ textAlign: "center", color: "#94A3B8", padding: "60px" }}>Loading products...</p>
        ) : filtered.length === 0 ? (
          <div style={styles.empty}>
            <span style={{ fontSize: "40px", display: "block", marginBottom: "12px" }}>📦</span>
            <h3>No products yet</h3>
            <p style={{ color: "#94A3B8", marginBottom: "20px" }}>Check back soon — new products are being added.</p>
            <Link to="/reseller-program" style={styles.btnPrimary}>Become a Reseller</Link>
          </div>
        ) : (
          <div style={styles.grid}>
            {filtered.map(p => (
              <div key={p.id} style={styles.card}>
                <div style={styles.cardImg}>📦</div>
                <div style={styles.cardBody}>
                  <span style={styles.cardCat}>{p.category}</span>
                  <h3 style={styles.cardTitle}>{p.name}</h3>
                  <p style={styles.cardDesc}>{p.description?.slice(0, 80) || "Digital product"}...</p>
                  <div style={styles.cardFooter}>
                    <span style={styles.cardPrice}>{p.price} ETB</span>
                    <Link to={`/checkout/product/${p.id}`} style={styles.cardBtn}>Buy</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: { background: "#0A0E17", color: "#F8FAFB", fontFamily: "'Inter', sans-serif", minHeight: "100vh", padding: "60px 24px" },
  container: { maxWidth: "1100px", margin: "0 auto" },
  header: { marginBottom: "28px" },
  title: { fontSize: "28px", fontWeight: 700, margin: 0, letterSpacing: "-0.01em" },
  sub: { color: "#94A3B8", fontSize: "14px", marginTop: "4px" },
  searchBar: { display: "flex", maxWidth: "500px", background: "#1A1F2E", border: "1px solid #2D3548", borderRadius: "8px", overflow: "hidden", marginBottom: "16px" },
  searchInput: { flex: 1, padding: "12px 16px", background: "transparent", border: "none", color: "#F8FAFB", fontSize: "14px", outline: "none" },
  pills: { display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "32px" },
  pill: { padding: "10px 16px", borderRadius: "20px", background: "#2D3548", color: "#CBD5E1", border: "none", cursor: "pointer", fontSize: "13px", fontWeight: 500 },
  pillActive: { padding: "10px 16px", borderRadius: "20px", background: "#06B6D4", color: "#0A0E17", border: "none", cursor: "pointer", fontSize: "13px", fontWeight: 600 },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "24px" },
  card: { background: "#1A1F2E", border: "1px solid #2D3548", borderRadius: "8px", overflow: "hidden" },
  cardImg: { height: "160px", background: "#2D3548", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "40px", opacity: 0.5 },
  cardBody: { padding: "20px", display: "flex", flexDirection: "column", gap: "8px" },
  cardCat: { fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "#06B6D4" },
  cardTitle: { fontSize: "16px", fontWeight: 600, margin: 0 },
  cardDesc: { color: "#94A3B8", fontSize: "13px", lineHeight: 1.5, margin: 0 },
  cardFooter: { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto" },
  cardPrice: { fontSize: "16px", fontWeight: 700, color: "#06B6D4" },
  cardBtn: { padding: "8px 16px", borderRadius: "6px", background: "#06B6D4", color: "#0A0E17", fontWeight: 600, fontSize: "13px", textDecoration: "none" },
  empty: { textAlign: "center", padding: "60px", color: "#94A3B8" },
  btnPrimary: { padding: "10px 20px", borderRadius: "6px", background: "#06B6D4", color: "#0A0E17", fontWeight: 600, fontSize: "14px", textDecoration: "none", display: "inline-block" },
};

export default Marketplace;