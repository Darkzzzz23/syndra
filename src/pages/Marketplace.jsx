import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getApprovedProducts } from "../services/productService";
import SEO from "../components/SEO";

function Marketplace() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [sortOpen, setSortOpen] = useState(false);
  const [sortBy, setSortBy] = useState("Newest");

  const categories = ["All", "AI Prompts", "ChatGPT Prompts", "Claude Prompts", "AI Workflows", "Automation Templates", "Midjourney Prompts", "DALL-E Prompts"];
  const sortOptions = ["Newest", "Best Rated", "Price: Low to High", "Price: High to Low"];

  useEffect(() => {
    const load = async () => {
      try { const r = await getApprovedProducts(); setProducts(r); } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  let filtered = products.filter(p => {
    const matchCat = activeCategory === "All" || p.category === activeCategory;
    const matchQ = (p.title || "").toLowerCase().includes(search.toLowerCase());
    return matchCat && matchQ;
  });

  if (sortBy === "Best Rated") filtered.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
  if (sortBy === "Price: Low to High") filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
  if (sortBy === "Price: High to Low") filtered.sort((a, b) => (b.price || 0) - (a.price || 0));

  return (
    <div style={styles.page}>
      <SEO title="AI Prompts Marketplace" description="Browse AI prompts, ChatGPT workflows, and automation templates from independent creators." />
      <div style={styles.container}>
        <h1 style={styles.title}>AI Prompts Marketplace</h1>
        <p style={styles.sub}>Browse prompts, workflows, and automation templates from independent creators.</p>

        <div style={styles.searchBar}>
          <span style={{ opacity: 0.4, paddingLeft: "16px" }}>🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search AI prompts..." style={styles.searchInput} />
        </div>

        <div style={styles.pills}>
          {categories.map(c => (
            <button key={c} onClick={() => setActiveCategory(c)} style={activeCategory === c ? styles.pillActive : styles.pill}>{c}</button>
          ))}
        </div>

        <div style={styles.bar}>
          <span style={{ color: "#94A3B8", fontSize: "14px" }}>{filtered.length} results</span>
          <div style={{ position: "relative" }}>
            <button onClick={() => setSortOpen(!sortOpen)} style={styles.sortBtn}>{sortBy} ▾</button>
            {sortOpen && (
              <div style={styles.sortMenu}>
                {sortOptions.map(o => (
                  <button key={o} onClick={() => { setSortBy(o); setSortOpen(false); }} style={{ ...styles.sortOption, color: sortBy === o ? "#06B6D4" : "#CBD5E1" }}>{o}</button>
                ))}
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <div style={styles.grid}>
            {[1,2,3,4,5,6].map(i => <div key={i} style={{ ...styles.card, minHeight: "280px", animation: "pulse 1.5s ease-in-out infinite" }} />)}
          </div>
        ) : filtered.length === 0 ? (
          <p style={{ textAlign: "center", color: "#94A3B8", padding: "60px" }}>No products found.</p>
        ) : (
          <div style={styles.grid}>
            {filtered.map(p => (
              <Link to={`/product/${p.id}`} key={p.id} style={styles.card}>
                <div style={styles.cardImg}>{p.thumbnailUrl ? <img src={p.thumbnailUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ fontSize: "32px", opacity: 0.3 }}>📦</span>}</div>
                <div style={styles.cardBody}>
                  <span style={styles.cardCat}>{p.category}</span>
                  <h3 style={styles.cardTitle}>{p.title || p.name}</h3>
                  <span style={styles.cardCreator}>by {p.creatorDisplayName || p.creatorEmail?.split("@")[0]}</span>
                  {p.averageRating > 0 && <span style={{ color: "#D97706", fontSize: "12px" }}>{"★".repeat(Math.round(p.averageRating))} {p.averageRating}</span>}
                  <span style={styles.cardPrice}>${p.price?.toFixed(2)}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: { background: "#0A0E17", color: "#F8FAFB", fontFamily: "'Inter', sans-serif", minHeight: "100vh", padding: "60px 32px" },
  container: { maxWidth: "1200px", margin: "0 auto" },
  title: { fontSize: "32px", fontWeight: 700, letterSpacing: "-0.01em", margin: "0 0 8px" },
  sub: { color: "#94A3B8", fontSize: "14px", marginBottom: "28px" },
  searchBar: { display: "flex", maxWidth: "500px", background: "#1A1F2E", border: "1px solid #2D3548", borderRadius: "8px", overflow: "hidden", marginBottom: "16px" },
  searchInput: { flex: 1, padding: "12px 16px", background: "transparent", border: "none", color: "#F8FAFB", fontSize: "14px", outline: "none" },
  pills: { display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "24px" },
  pill: { padding: "10px 16px", borderRadius: "20px", background: "#2D3548", color: "#CBD5E1", border: "none", cursor: "pointer", fontSize: "13px", fontWeight: 500, transition: "all 0.2s" },
  pillActive: { padding: "10px 16px", borderRadius: "20px", background: "#06B6D4", color: "#0A0E17", border: "none", cursor: "pointer", fontSize: "13px", fontWeight: 600 },
  bar: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" },
  sortBtn: { padding: "8px 14px", borderRadius: "6px", border: "1px solid #2D3548", background: "#1A1F2E", color: "#CBD5E1", fontSize: "13px", cursor: "pointer" },
  sortMenu: { position: "absolute", top: "100%", right: 0, marginTop: "4px", background: "#1A1F2E", border: "1px solid #2D3548", borderRadius: "8px", padding: "6px", minWidth: "180px", zIndex: 10 },
  sortOption: { display: "block", width: "100%", padding: "10px 14px", border: "none", background: "transparent", cursor: "pointer", fontSize: "13px", textAlign: "left", color: "#CBD5E1" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "24px" },
  card: { background: "#1A1F2E", border: "1px solid #2D3548", borderRadius: "8px", overflow: "hidden", textDecoration: "none", color: "#F8FAFB", transition: "all 0.3s", display: "flex", flexDirection: "column" },
  cardImg: { height: "180px", background: "#2D3548", display: "flex", alignItems: "center", justifyContent: "center" },
  cardBody: { padding: "20px", display: "flex", flexDirection: "column", gap: "6px", flex: 1 },
  cardCat: { fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "#06B6D4" },
  cardTitle: { fontSize: "16px", fontWeight: 600, margin: 0, lineHeight: 1.4 },
  cardCreator: { fontSize: "12px", color: "#94A3B8" },
  cardPrice: { fontSize: "18px", fontWeight: 700, color: "#06B6D4", marginTop: "auto" },
};

export default Marketplace;