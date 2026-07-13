import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getApprovedProducts } from "../services/productService";
import SEO from "../components/SEO";

function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = ["All", "AI Prompts", "ChatGPT Prompts", "Claude Prompts", "AI Workflows", "Automation Templates", "Midjourney Prompts", "DALL-E Prompts"];

  useEffect(() => {
    const load = async () => {
      try {
        const result = await getApprovedProducts();
        setProducts(result.slice(0, 6));
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const filtered = products.filter(p => {
    const matchCat = activeCategory === "All" || p.category === activeCategory;
    const matchQ = (p.title || "").toLowerCase().includes(search.toLowerCase());
    return matchCat && matchQ;
  });

  return (
    <div style={styles.page}>
      <SEO title="The Marketplace for AI Prompt Creators" description="Sell ChatGPT prompts, AI workflows, and automation templates. Keep 70% per sale." />

      {/* Hero */}
      <section style={styles.hero}>
        <div style={styles.heroGlow} />
        <div style={styles.heroContent}>
          <h1 style={styles.heroTitle}>The Marketplace for<br />AI Prompt Creators</h1>
          <p style={styles.heroSub}>Create powerful ChatGPT, Claude, and AI workflows. Share with promoters. Keep 70%.</p>
          <div style={styles.heroBtns}>
            <Link to="/signup" style={styles.btnPrimary}>Start Selling Prompts</Link>
            <Link to="/marketplace" style={styles.btnSecondary}>Browse Prompts</Link>
          </div>

          {/* Search */}
          <div style={styles.searchBar}>
            <span style={styles.searchIcon}>🔍</span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search AI prompts, workflows, templates..." style={styles.searchInput} />
            <button style={styles.searchBtn}>Search</button>
          </div>

          {/* Pills */}
          <div style={styles.pills}>
            {categories.map(cat => (
              <button key={cat} onClick={() => setActiveCategory(cat)} style={activeCategory === cat ? styles.pillActive : styles.pill}>{cat}</button>
            ))}
          </div>
        </div>
      </section>

      {/* Products */}
      <section style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Featured AI Prompts & Workflows</h2>
          <Link to="/marketplace" style={styles.viewAll}>View All →</Link>
        </div>
        {loading ? (
          <div style={styles.grid}>
            {[1,2,3,4].map(i => <div key={i} style={{ ...styles.card, minHeight: "300px", animation: "pulse 1.5s ease-in-out infinite" }} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div style={styles.empty}>
            <span style={{ fontSize: "40px", display: "block", marginBottom: "12px" }}>🚀</span>
            <h3>No prompts in this category yet</h3>
            <p style={{ color: "#94A3B8", marginBottom: "20px" }}>Be the first to create one!</p>
            <Link to="/signup" style={styles.btnPrimary}>Upload Your First Prompt</Link>
          </div>
        ) : (
          <div style={styles.grid}>
            {filtered.map(p => (
              <Link to={`/product/${p.id}`} key={p.id} style={styles.card}>
                <div style={styles.cardImg}>
                  {p.thumbnailUrl ? <img src={p.thumbnailUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ fontSize: "32px", opacity: 0.3 }}>📦</span>}
                </div>
                <div style={styles.cardBody}>
                  <span style={styles.cardCat}>{p.category}</span>
                  <h3 style={styles.cardTitle}>{p.title || p.name}</h3>
                  <span style={styles.cardCreator}>by {p.creatorDisplayName || p.creatorEmail?.split("@")[0]}</span>
                  <span style={styles.cardPrice}>${p.price?.toFixed(2)}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* How it works */}
      <section style={styles.howSection}>
        <h2 style={styles.sectionTitle}>How Syndra Works</h2>
        <div style={styles.steps}>
          {[
            { num: "1", title: "Create Your Prompts", desc: "Upload your ChatGPT, Claude, or AI workflow prompts. Include descriptions, examples, and use cases." },
            { num: "2", title: "Share with Promoters", desc: "Generate referral links and let promoters share your prompts with their communities." },
            { num: "3", title: "Earn 70%", desc: "Keep 70% of every sale. Instant payouts. No approval games. No waiting." },
          ].map(s => (
            <div key={s.num} style={styles.stepCard}>
              <span style={styles.stepNum}>{s.num}</span>
              <h3 style={styles.stepTitle}>{s.title}</h3>
              <p style={styles.stepDesc}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section style={styles.statsSection}>
        {[
          { value: "70%", label: "Creator Payout" },
          { value: "Instant", label: "Withdrawals" },
          { value: "0%", label: "Approval Wait" },
        ].map(s => (
          <div key={s.label} style={styles.statCard}>
            <span style={styles.statValue}>{s.value}</span>
            <span style={styles.statLabel}>{s.label}</span>
          </div>
        ))}
      </section>

      {/* CTA */}
      <section style={styles.ctaSection}>
        <h2 style={styles.ctaTitle}>Ready to Start?</h2>
        <p style={styles.ctaSub}>Join creators who are making money selling AI prompts on Syndra.</p>
        <Link to="/signup" style={styles.btnPrimary}>Create Free Account</Link>
      </section>

      {/* Footer */}
      <footer style={styles.footer}>
        <span style={styles.footerLogo}>Syndra</span>
        <div style={styles.footerLinks}>
          <Link to="/legal" style={styles.footerLink}>Legal</Link>
          <Link to="/contact" style={styles.footerLink}>Contact</Link>
          <a href="https://discord.gg/kytBEbJ5" target="_blank" rel="noreferrer" style={styles.footerLink}>Community</a>
        </div>
      </footer>
    </div>
  );
}

const styles = {
  page: { background: "#0A0E17", color: "#F8FAFB", fontFamily: "'Inter', sans-serif", minHeight: "100vh" },
  hero: { padding: "120px 32px 80px", position: "relative", overflow: "hidden", textAlign: "center" },
  heroGlow: { position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: "100%", height: "60%", background: "radial-gradient(ellipse at center, rgba(6,182,212,0.08) 0%, transparent 70%)", pointerEvents: "none" },
  heroContent: { maxWidth: "800px", margin: "0 auto", position: "relative", zIndex: 1 },
  heroTitle: { fontSize: "56px", fontWeight: 700, lineHeight: 1.2, letterSpacing: "-0.02em", margin: "0 0 20px" },
  heroSub: { fontSize: "16px", fontWeight: 400, color: "#94A3B8", lineHeight: 1.6, maxWidth: "500px", margin: "0 auto 32px" },
  heroBtns: { display: "flex", gap: "12px", justifyContent: "center", marginBottom: "40px", flexWrap: "wrap" },
  btnPrimary: { padding: "12px 24px", borderRadius: "6px", background: "#06B6D4", color: "#0A0E17", fontWeight: 600, fontSize: "14px", textDecoration: "none", border: "none", cursor: "pointer", display: "inline-block", transition: "all 0.2s" },
  btnSecondary: { padding: "11px 23px", borderRadius: "6px", border: "2px solid #06B6D4", color: "#06B6D4", fontWeight: 600, fontSize: "14px", textDecoration: "none", display: "inline-block", transition: "all 0.2s", background: "transparent" },
  searchBar: { display: "flex", maxWidth: "600px", margin: "0 auto 16px", background: "#1A1F2E", border: "1px solid #2D3548", borderRadius: "8px", overflow: "hidden" },
  searchIcon: { display: "flex", alignItems: "center", paddingLeft: "16px", fontSize: "14px", opacity: 0.5 },
  searchInput: { flex: 1, padding: "14px 16px", background: "transparent", border: "none", color: "#F8FAFB", fontSize: "14px", outline: "none" },
  searchBtn: { padding: "12px 20px", background: "#06B6D4", color: "#0A0E17", border: "none", fontWeight: 600, fontSize: "14px", cursor: "pointer" },
  pills: { display: "flex", flexWrap: "wrap", gap: "8px", justifyContent: "center", marginTop: "16px" },
  pill: { padding: "10px 16px", borderRadius: "20px", background: "#2D3548", color: "#CBD5E1", border: "none", cursor: "pointer", fontSize: "13px", fontWeight: 500, transition: "all 0.2s" },
  pillActive: { padding: "10px 16px", borderRadius: "20px", background: "#06B6D4", color: "#0A0E17", border: "none", cursor: "pointer", fontSize: "13px", fontWeight: 600, boxShadow: "0 4px 12px rgba(6,182,212,0.15)" },
  section: { maxWidth: "1200px", margin: "0 auto", padding: "80px 32px" },
  sectionHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" },
  sectionTitle: { fontSize: "32px", fontWeight: 700, letterSpacing: "-0.01em", margin: 0, textAlign: "center" },
  viewAll: { color: "#06B6D4", textDecoration: "none", fontSize: "14px", fontWeight: 500 },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "24px" },
  card: { background: "#1A1F2E", border: "1px solid #2D3548", borderRadius: "8px", overflow: "hidden", textDecoration: "none", color: "#F8FAFB", transition: "all 0.3s", display: "flex", flexDirection: "column" },
  cardImg: { height: "180px", background: "#2D3548", display: "flex", alignItems: "center", justifyContent: "center" },
  cardBody: { padding: "20px", display: "flex", flexDirection: "column", gap: "6px", flex: 1 },
  cardCat: { fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "#06B6D4" },
  cardTitle: { fontSize: "16px", fontWeight: 600, margin: 0, lineHeight: 1.4 },
  cardCreator: { fontSize: "12px", color: "#94A3B8" },
  cardPrice: { fontSize: "18px", fontWeight: 700, color: "#06B6D4", marginTop: "auto" },
  empty: { gridColumn: "1/-1", textAlign: "center", padding: "60px" },
  howSection: { padding: "80px 32px", background: "rgba(26,31,46,0.3)", borderTop: "1px solid #2D3548", borderBottom: "1px solid #2D3548" },
  steps: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "32px", maxWidth: "900px", margin: "40px auto 0" },
  stepCard: { textAlign: "center", padding: "24px" },
  stepNum: { display: "inline-block", width: "40px", height: "40px", borderRadius: "50%", background: "#06B6D4", color: "#0A0E17", fontWeight: 700, fontSize: "18px", lineHeight: "40px", marginBottom: "16px" },
  stepTitle: { fontSize: "18px", fontWeight: 600, margin: "0 0 8px" },
  stepDesc: { color: "#94A3B8", fontSize: "14px", lineHeight: 1.6, margin: 0 },
  statsSection: { display: "flex", justifyContent: "center", gap: "48px", padding: "60px 32px", maxWidth: "600px", margin: "0 auto" },
  statCard: { textAlign: "center" },
  statValue: { display: "block", fontSize: "32px", fontWeight: 700, color: "#06B6D4" },
  statLabel: { display: "block", fontSize: "13px", color: "#94A3B8", marginTop: "4px" },
  ctaSection: { textAlign: "center", padding: "80px 32px" },
  ctaTitle: { fontSize: "32px", fontWeight: 700, margin: "0 0 8px" },
  ctaSub: { color: "#94A3B8", marginBottom: "24px", fontSize: "16px" },
  footer: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "32px", borderTop: "1px solid #2D3548", maxWidth: "1200px", margin: "0 auto" },
  footerLogo: { fontWeight: 700, color: "#06B6D4", fontSize: "16px" },
  footerLinks: { display: "flex", gap: "24px" },
  footerLink: { color: "#94A3B8", textDecoration: "none", fontSize: "13px" },
};

export default Home;