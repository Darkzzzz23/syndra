import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getActiveBundles } from "../services/dbService";

function ResellerProgram() {
  const [bundles, setBundles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const result = await getActiveBundles();
        setBundles(result);
      } catch (e) { console.error(e); setBundles([]); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.hero}>
          <span style={styles.badge}>Reseller Program</span>
          <h1 style={styles.title}>Buy Digital Products.<br />Resell Them. Keep Your Margin.</h1>
          <p style={styles.sub}>
            Purchase a bundle of digital products with resale rights. Sell them to customers through your own links. Earn your reseller margin on every sale.
          </p>
        </div>

        <h2 style={styles.sectionTitle}>Available Bundles</h2>

        {loading ? (
          <p style={{ textAlign: "center", color: "#94A3B8", padding: "60px" }}>Loading bundles...</p>
        ) : bundles.length === 0 ? (
          <div style={styles.empty}>
            <span style={{ fontSize: "40px", display: "block", marginBottom: "12px" }}>📦</span>
            <h3>No bundles available yet</h3>
            <p style={{ color: "#94A3B8" }}>Bundles will be added soon.</p>
          </div>
        ) : (
          <div style={styles.grid}>
            {bundles.map(b => (
              <div key={b.id} style={{ ...styles.bundleCard, ...(b.featured ? styles.bundleFeatured : {}) }}>
                <h3 style={styles.bundleName}>{b.name}</h3>
                <span style={styles.bundlePrice}>{b.price} ETB</span>
                <p style={styles.bundleDesc}>{b.description || "Digital products with resale rights"}</p>
                <div style={styles.bundleDetails}>
                  <span style={styles.detail}>📦 Products included</span>
                  <span style={styles.detail}>💰 {b.resellerMargin}% reseller margin</span>
                  <span style={styles.detail}>🔗 {b.referralCommission}% referral commission</span>
                </div>
                <Link to={`/checkout/bundle/${b.id}`} style={styles.btnPrimary}>Purchase Bundle</Link>
              </div>
            ))}
          </div>
        )}

        <div style={styles.infoSection}>
          <h2 style={styles.sectionTitle}>How Reselling Works</h2>
          <div style={styles.steps}>
            {[
              { num: "1", title: "Purchase a Bundle", desc: "Choose a bundle that fits your goals. Pay via Telebirr or CBE." },
              { num: "2", title: "Get Resale Rights", desc: "Receive access to the products and permission to resell them." },
              { num: "3", title: "Sell Products", desc: "Share your unique links. Customers purchase through you." },
              { num: "4", title: "Earn Your Margin", desc: "Keep your reseller margin on every sale you generate." },
            ].map(s => (
              <div key={s.num} style={styles.stepCard}>
                <span style={styles.stepNum}>{s.num}</span>
                <h3 style={styles.stepTitle}>{s.title}</h3>
                <p style={styles.stepDesc}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div style={styles.infoSection}>
          <h2 style={styles.sectionTitle}>Referral Commissions</h2>
          <p style={{ color: "#94A3B8", textAlign: "center", maxWidth: "500px", margin: "0 auto 24px", lineHeight: 1.6 }}>
            Refer someone who purchases a bundle. Earn a referral commission on their qualifying purchase. One level only — simple and transparent.
          </p>
          <div style={styles.referralBox}>
            <p style={{ fontWeight: 600, margin: "0 0 8px" }}>Example:</p>
            <p style={{ color: "#94A3B8", fontSize: "14px", lineHeight: 1.6, margin: 0 }}>
              You refer a friend. They buy a 1,000 ETB bundle. You earn the configured referral commission. No recruiting required — just actual purchases.
            </p>
          </div>
        </div>

        <div style={styles.infoSection}>
          <h2 style={styles.sectionTitle}>Important Notes</h2>
          <div style={styles.notesList}>
            {[
              "✅ Promoting as a regular affiliate is completely FREE",
              "✅ Reseller bundles contain genuine digital products",
              "✅ Referral commissions only apply to qualifying purchases",
              "❌ No earnings just for signing people up",
              "❌ No multi-level commissions",
              "❌ No guaranteed income claims",
            ].map(note => (
              <div key={note} style={{ padding: "12px 0", borderBottom: "1px solid rgba(45,53,72,0.5)", color: "#CBD5E1", fontSize: "14px" }}>
                {note}
              </div>
            ))}
          </div>
        </div>

        <div style={styles.cta}>
          <h2 style={styles.sectionTitle}>Ready to Start?</h2>
          <p style={{ color: "#94A3B8", marginBottom: "24px" }}>Join free as a promoter or purchase a bundle to start reselling.</p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            <Link to="/signup" style={styles.btnPrimary}>Join Free as Promoter</Link>
            <Link to="/marketplace" style={styles.btnSecondary}>Browse Marketplace</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { background: "#0A0E17", color: "#F8FAFB", fontFamily: "'Inter', sans-serif", minHeight: "100vh", padding: "60px 24px" },
  container: { maxWidth: "1000px", margin: "0 auto" },
  hero: { textAlign: "center", padding: "60px 24px" },
  badge: { display: "inline-block", padding: "6px 14px", borderRadius: "20px", background: "rgba(6,182,212,0.1)", color: "#06B6D4", fontSize: "12px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "20px" },
  title: { fontSize: "40px", fontWeight: 700, lineHeight: 1.2, margin: "0 0 20px", letterSpacing: "-0.02em" },
  sub: { fontSize: "16px", color: "#94A3B8", maxWidth: "500px", margin: "0 auto", lineHeight: 1.6 },
  sectionTitle: { fontSize: "28px", fontWeight: 700, letterSpacing: "-0.01em", marginBottom: "32px", textAlign: "center" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px", marginBottom: "64px" },
  bundleCard: { background: "#1A1F2E", border: "1px solid #2D3548", borderRadius: "12px", padding: "32px 24px", textAlign: "center", display: "flex", flexDirection: "column", gap: "12px" },
  bundleFeatured: { borderColor: "#06B6D4", boxShadow: "0 4px 20px rgba(6,182,212,0.15)" },
  bundleName: { fontSize: "20px", fontWeight: 600, margin: 0 },
  bundlePrice: { fontSize: "32px", fontWeight: 700, color: "#06B6D4" },
  bundleDesc: { color: "#94A3B8", fontSize: "14px", lineHeight: 1.5, margin: 0 },
  bundleDetails: { display: "flex", flexDirection: "column", gap: "8px", padding: "16px 0", borderTop: "1px solid #2D3548", borderBottom: "1px solid #2D3548" },
  detail: { color: "#CBD5E1", fontSize: "13px" },
  btnPrimary: { padding: "12px 24px", borderRadius: "6px", background: "#06B6D4", color: "#0A0E17", fontWeight: 600, fontSize: "14px", textDecoration: "none", display: "inline-block", border: "none", cursor: "pointer" },
  btnSecondary: { padding: "12px 24px", borderRadius: "6px", border: "2px solid #06B6D4", color: "#06B6D4", fontWeight: 600, fontSize: "14px", textDecoration: "none", display: "inline-block", background: "transparent", cursor: "pointer" },
  infoSection: { marginBottom: "64px" },
  steps: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px" },
  stepCard: { textAlign: "center", padding: "20px" },
  stepNum: { display: "inline-block", width: "36px", height: "36px", borderRadius: "50%", background: "#06B6D4", color: "#0A0E17", fontWeight: 700, fontSize: "16px", lineHeight: "36px", marginBottom: "12px" },
  stepTitle: { fontSize: "16px", fontWeight: 600, marginBottom: "6px" },
  stepDesc: { color: "#94A3B8", fontSize: "13px", lineHeight: 1.5 },
  referralBox: { background: "#1A1F2E", border: "1px solid #2D3548", borderRadius: "8px", padding: "20px", maxWidth: "500px", margin: "0 auto" },
  notesList: { maxWidth: "500px", margin: "0 auto" },
  cta: { textAlign: "center", padding: "60px 24px" },
  empty: { textAlign: "center", padding: "60px", color: "#94A3B8" },
};

export default ResellerProgram;