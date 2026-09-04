import { Link } from "react-router-dom";

function LandingPage() {
  return (
    <div style={styles.page}>
      {/* Hero */}
      <section style={styles.hero}>
        <div style={styles.heroGlow} />
        <span style={styles.badge}>Digital Products Marketplace</span>
        <h1 style={styles.heroTitle}>Sell Digital Products.<br />Build Your Reseller Network.</h1>
        <p style={styles.heroSub}>
          Creators upload products. Promoters share them. Resellers earn by selling.
          One marketplace. Multiple ways to earn.
        </p>
        <div style={styles.heroBtns}>
          <Link to="/marketplace" style={styles.btnPrimary}>Browse Products</Link>
          <Link to="/reseller-program" style={styles.btnSecondary}>Become a Reseller</Link>
        </div>
        <div style={styles.heroStats}>
          {[
            { value: "ETB", label: "Local Currency" },
            { value: "3", label: "Ways to Earn" },
            { value: "100%", label: "Digital Delivery" },
          ].map(s => (
            <div key={s.label} style={styles.heroStat}>
              <span style={styles.heroStatValue}>{s.value}</span>
              <span style={styles.heroStatLabel}>{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Three ways */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Three Ways to Participate</h2>
        <div style={styles.cards}>
          {[
            { icon: "🛍️", title: "Buy Products", desc: "Purchase ebooks, templates, guides, and digital art directly from the marketplace." },
            { icon: "📣", title: "Promote Free", desc: "Join free as a promoter. Share product links. Earn commission on every sale you bring." },
            { icon: "💼", title: "Resell & Earn", desc: "Purchase a reseller bundle. Get products with resale rights. Sell them and keep your margin." },
          ].map(c => (
            <div key={c.title} style={styles.card}>
              <span style={styles.cardIcon}>{c.icon}</span>
              <h3 style={styles.cardTitle}>{c.title}</h3>
              <p style={styles.cardDesc}>{c.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Reseller teaser */}
      <section style={{ ...styles.section, background: "#1A1F2E" }}>
        <h2 style={{ ...styles.sectionTitle, color: "#F8FAFB" }}>The Reseller Program</h2>
        <p style={{ color: "#94A3B8", textAlign: "center", maxWidth: "500px", margin: "0 auto 40px", lineHeight: 1.6 }}>
          Purchase a bundle of digital products with resale rights. Sell them to customers. Keep your reseller margin on every sale.
        </p>
        <div style={styles.bundleRow}>
          {[
            { name: "Starter", price: "1,000 ETB", desc: "Get started with a starter bundle of products" },
            { name: "Professional", price: "5,000 ETB", desc: "More products, higher margins, marketing assets", featured: true },
            { name: "Premium", price: "10,000 ETB", desc: "Full catalog access, premium support, best margins" },
          ].map(b => (
            <div key={b.name} style={{ ...styles.bundleCard, ...(b.featured ? styles.bundleFeatured : {}) }}>
              <h3 style={styles.bundleName}>{b.name}</h3>
              <span style={styles.bundlePrice}>{b.price}</span>
              <p style={styles.bundleDesc}>{b.desc}</p>
              <Link to="/reseller-program" style={b.featured ? styles.btnPrimary : styles.btnSecondary}>Learn More</Link>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>How Money Flows</h2>
        <div style={styles.steps}>
          {[
            { num: "1", title: "Customer Pays", desc: "Customer purchases a digital product through the marketplace." },
            { num: "2", title: "System Splits", desc: "Payment is split: creator royalty, reseller/promoter commission, platform revenue." },
            { num: "3", title: "Ledger Tracks", desc: "Every transaction is recorded. Every commission is traceable." },
            { num: "4", title: "Get Paid", desc: "Withdraw earnings via Telebirr or CBE when balance is available." },
          ].map(s => (
            <div key={s.num} style={styles.stepCard}>
              <span style={styles.stepNum}>{s.num}</span>
              <h3 style={styles.stepTitle}>{s.title}</h3>
              <p style={styles.stepDesc}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={styles.cta}>
        <h2 style={styles.ctaTitle}>Start Earning Today</h2>
        <p style={styles.ctaSub}>Join free as a promoter or purchase a reseller bundle to start selling.</p>
        <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
          <Link to="/signup" style={styles.btnPrimary}>Join Free</Link>
          <Link to="/reseller-program" style={styles.btnSecondary}>View Reseller Bundles</Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={styles.footer}>
        <span style={styles.footerLogo}>Syndra</span>
        <div style={styles.footerLinks}>
          <Link to="/terms" style={styles.footerLink}>Terms</Link>
          <Link to="/privacy" style={styles.footerLink}>Privacy</Link>
          <Link to="/contact" style={styles.footerLink}>Contact</Link>
        </div>
        <span style={styles.footerCopy}>© 2026 Syndra. All rights reserved.</span>
      </footer>
    </div>
  );
}

const styles = {
  page: { background: "#0A0E17", color: "#F8FAFB", fontFamily: "'Inter', sans-serif", minHeight: "100vh" },
  hero: { textAlign: "center", padding: "100px 24px 80px", position: "relative", overflow: "hidden" },
  heroGlow: { position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: "100%", height: "60%", background: "radial-gradient(ellipse at center, rgba(6,182,212,0.08) 0%, transparent 70%)", pointerEvents: "none" },
  badge: { display: "inline-block", padding: "6px 14px", borderRadius: "20px", background: "rgba(6,182,212,0.1)", color: "#06B6D4", fontSize: "12px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "20px" },
  heroTitle: { fontSize: "48px", fontWeight: 700, lineHeight: 1.15, margin: "0 0 20px", letterSpacing: "-0.02em" },
  heroSub: { fontSize: "16px", color: "#94A3B8", maxWidth: "500px", margin: "0 auto 32px", lineHeight: 1.6 },
  heroBtns: { display: "flex", gap: "12px", justifyContent: "center", marginBottom: "60px", flexWrap: "wrap" },
  btnPrimary: { padding: "10px 20px", borderRadius: "6px", background: "#06B6D4", color: "#0A0E17", fontWeight: 600, fontSize: "14px", textDecoration: "none", display: "inline-block", border: "none", cursor: "pointer" },
  btnSecondary: { padding: "10px 20px", borderRadius: "6px", border: "2px solid #06B6D4", color: "#06B6D4", fontWeight: 600, fontSize: "14px", textDecoration: "none", display: "inline-block", background: "transparent", cursor: "pointer" },
  heroStats: { display: "flex", justifyContent: "center", gap: "48px" },
  heroStat: { textAlign: "center" },
  heroStatValue: { display: "block", fontSize: "24px", fontWeight: 700, color: "#06B6D4" },
  heroStatLabel: { display: "block", fontSize: "13px", color: "#94A3B8", marginTop: "4px" },
  section: { padding: "80px 24px", textAlign: "center" },
  sectionTitle: { fontSize: "32px", fontWeight: 700, letterSpacing: "-0.01em", marginBottom: "48px" },
  cards: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px", maxWidth: "900px", margin: "0 auto" },
  card: { background: "#1A1F2E", border: "1px solid #2D3548", borderRadius: "8px", padding: "32px 24px", textAlign: "center" },
  cardIcon: { fontSize: "32px", display: "block", marginBottom: "16px" },
  cardTitle: { fontSize: "18px", fontWeight: 600, marginBottom: "8px" },
  cardDesc: { color: "#94A3B8", fontSize: "14px", lineHeight: 1.6 },
  bundleRow: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px", maxWidth: "900px", margin: "0 auto" },
  bundleCard: { background: "#1A1F2E", border: "1px solid #2D3548", borderRadius: "8px", padding: "32px 24px", textAlign: "center", display: "flex", flexDirection: "column", gap: "12px" },
  bundleFeatured: { borderColor: "#06B6D4", boxShadow: "0 4px 20px rgba(6,182,212,0.15)" },
  bundleName: { fontSize: "18px", fontWeight: 600 },
  bundlePrice: { fontSize: "28px", fontWeight: 700, color: "#06B6D4" },
  bundleDesc: { color: "#94A3B8", fontSize: "14px", lineHeight: 1.5 },
  steps: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px", maxWidth: "1000px", margin: "0 auto" },
  stepCard: { textAlign: "center", padding: "20px" },
  stepNum: { display: "inline-block", width: "36px", height: "36px", borderRadius: "50%", background: "#06B6D4", color: "#0A0E17", fontWeight: 700, fontSize: "16px", lineHeight: "36px", marginBottom: "12px" },
  stepTitle: { fontSize: "16px", fontWeight: 600, marginBottom: "6px" },
  stepDesc: { color: "#94A3B8", fontSize: "13px", lineHeight: 1.5 },
  cta: { textAlign: "center", padding: "80px 24px", borderTop: "1px solid #2D3548" },
  ctaTitle: { fontSize: "28px", fontWeight: 700, marginBottom: "8px" },
  ctaSub: { color: "#94A3B8", marginBottom: "24px", fontSize: "16px" },
  footer: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "32px 24px", borderTop: "1px solid #2D3548", maxWidth: "1100px", margin: "0 auto", flexWrap: "wrap", gap: "12px" },
  footerLogo: { fontWeight: 700, color: "#06B6D4", fontSize: "16px" },
  footerLinks: { display: "flex", gap: "20px" },
  footerLink: { color: "#94A3B8", textDecoration: "none", fontSize: "13px" },
  footerCopy: { color: "#64748B", fontSize: "12px" },
};

export default LandingPage;