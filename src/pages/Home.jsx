import { useEffect, useState, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getApprovedProducts } from "../services/productService";
import { saveReferralCookie } from "../services/orderService";
import SEO from "../components/SEO";

function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const [sortOpen, setSortOpen] = useState(false);
  const sortRef = useRef(null);
  const [searchParams] = useSearchParams();

  const categories = ["All", "Worksheets", "Study Guides", "E-books", "Digital Art", "Templates", "Printables", "Other"];
  const sortOptions = [
    { value: "newest", label: "Newest" },
    { value: "price-low", label: "Price: Low to High" },
    { value: "price-high", label: "Price: High to Low" },
    { value: "rating", label: "Top Rated" },
  ];

  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref) {
      saveReferralCookie(ref);
    }

    const handleClick = (e) => {
      if (sortRef.current && !sortRef.current.contains(e.target)) {
        setSortOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [searchParams]);

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

  let filtered = products.filter((p) => {
    const matchSearch = (p.title || p.name || "").toLowerCase().includes(search.toLowerCase()) ||
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
      <SEO title="Digital Products Marketplace" description="Browse and buy worksheets, ebooks, templates, printables, and digital art from independent creators." />

      <section style={styles.hero}>
        <div style={styles.heroContent}>
          <h1 style={styles.heroTitle}>Discover Digital Products</h1>
          <p style={styles.heroSubtitle}>Worksheets, ebooks, templates, printables, and digital art from independent creators. Buy once, download instantly.</p>
          <div style={styles.heroButtons}>
            <Link to="/marketplace" style={styles.heroBtnPrimary}>Browse All Products</Link>
            <Link to="/login" style={styles.heroBtnSecondary}>Join as Creator</Link>
          </div>
        </div>
      </section>

      <section style={styles.section}>
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

        {loading ? (
          <div style={styles.grid}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} style={styles.card}>
                <div style={{ height: "140px", background: "rgba(255,255,255,0.03)", animation: "pulse 1.5s ease-in-out infinite" }} />
                <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
                  <div style={{ width: "60%", height: "12px", borderRadius: "6px", background: "rgba(255,255,255,0.04)", animation: "pulse 1.5s ease-in-out infinite" }} />
                  <div style={{ width: "90%", height: "16px", borderRadius: "6px", background: "rgba(255,255,255,0.04)", animation: "pulse 1.5s ease-in-out infinite" }} />
                  <div style={{ width: "40%", height: "18px", borderRadius: "6px", background: "rgba(255,255,255,0.04)", animation: "pulse 1.5s ease-in-out infinite" }} />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <div style={styles.grid}>
            {filtered.map((product) => (
              <Link to={`/product/${product.id}`} key={product.id} style={styles.card} className="product-card">
                <div style={styles.cardImage}>
                  {product.thumbnailUrl ? (
                    <img src={product.thumbnailUrl} alt={product.title} style={styles.thumb} />
                  ) : (
                    <span style={styles.placeholder}>📦</span>
                  )}
                </div>
                <div style={styles.cardBody}>
                  <span style={styles.categoryTag}>{product.category}</span>
                  <h3 style={styles.productTitle}>{product.title || product.name}</h3>
                  {product.averageRating > 0 && (
                    <span style={styles.rating}>{"★".repeat(Math.round(product.averageRating))} {product.averageRating}</span>
                  )}
                  <div style={styles.cardFooter}>
                    <span style={styles.price}>${product.price?.toFixed(2)}</span>
                    <span style={styles.creator}>by {product.creatorDisplayName || product.creatorEmail?.split("@")[0]}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p style={styles.empty}>No products match your search. Try a different category.</p>
        )}
      </section>

      <section style={styles.cta}>
        <h2 style={styles.ctaTitle}>Are You a Creator?</h2>
        <p style={styles.ctaSubtitle}>Sell your digital products on Syndra. You keep 70%. Promoters bring customers.</p>
        <Link to="/login" style={styles.heroBtnPrimary}>Start Selling</Link>
      </section>

      <footer style={styles.footer}>
        <div style={styles.footerContent}>
          <span style={styles.footerLogo}>✦ Syndra</span>
          <div style={styles.footerLinks}>
            <Link to="/legal" style={styles.footerLink}>Legal</Link>
            <Link to="/contact" style={styles.footerLink}>Contact</Link>
            <a href="https://discord.gg/kytBEbJ5" target="_blank" rel="noreferrer" style={styles.footerLink}>Community</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

const styles = {
  page: { color: "#fff", fontFamily: "Inter, sans-serif", background: "linear-gradient(180deg, #05070d 0%, #0f172a 100%)", minHeight: "100vh" },
  hero: { padding: "80px 24px 60px", textAlign: "center" },
  heroContent: { maxWidth: "600px", margin: "0 auto" },
  heroTitle: { fontSize: "42px", fontWeight: 800, margin: 0, lineHeight: 1.2 },
  heroSubtitle: { color: "#94a3b8", fontSize: "16px", marginTop: "16px", lineHeight: 1.6 },
  heroButtons: { display: "flex", gap: "12px", justifyContent: "center", marginTop: "28px", flexWrap: "wrap" },
  heroBtnPrimary: { padding: "14px 28px", borderRadius: "14px", background: "linear-gradient(135deg, #4f7cff, #7c3aed)", color: "#fff", textDecoration: "none", fontWeight: 700, fontSize: "15px", display: "inline-block" },
  heroBtnSecondary: { padding: "14px 28px", borderRadius: "14px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "#cbd5e1", textDecoration: "none", fontWeight: 600, fontSize: "15px" },
  section: { padding: "40px 24px", maxWidth: "1100px", margin: "0 auto" },
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
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "20px" },
  card: { borderRadius: "16px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(79,124,255,0.1)", overflow: "hidden", textDecoration: "none", color: "#fff", transition: "transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease", display: "flex", flexDirection: "column", cursor: "pointer" },
  cardImage: { height: "140px", background: "rgba(79,124,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" },
  thumb: { width: "100%", height: "100%", objectFit: "cover" },
  placeholder: { fontSize: "36px" },
  cardBody: { padding: "16px", flex: 1, display: "flex", flexDirection: "column", gap: "8px" },
  categoryTag: { fontSize: "11px", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em" },
  productTitle: { fontSize: "15px", fontWeight: 600, margin: 0, lineHeight: 1.3 },
  rating: { color: "#fbbf24", fontSize: "13px" },
  cardFooter: { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto" },
  price: { fontSize: "16px", fontWeight: 700, color: "#a5b4ff" },
  creator: { fontSize: "12px", color: "#64748b" },
  empty: { textAlign: "center", color: "#94a3b8", padding: "60px" },
  cta: { padding: "60px 24px", textAlign: "center", borderTop: "1px solid rgba(79,124,255,0.06)", background: "rgba(255,255,255,0.02)" },
  ctaTitle: { fontSize: "28px", fontWeight: 700, margin: 0 },
  ctaSubtitle: { color: "#94a3b8", marginTop: "8px", marginBottom: "20px" },
  footer: { padding: "32px 24px", borderTop: "1px solid rgba(79,124,255,0.08)", textAlign: "center" },
  footerContent: { display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px", maxWidth: "800px", margin: "0 auto" },
  footerLogo: { fontSize: "16px", fontWeight: 700, color: "#a5b4ff" },
  footerLinks: { display: "flex", gap: "20px" },
  footerLink: { color: "#64748b", textDecoration: "none", fontSize: "13px" },
};

export default Home;