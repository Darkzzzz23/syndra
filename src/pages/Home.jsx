import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getApprovedProducts } from "../services/productService";
import SEO from "../components/SEO";

function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const result = await getApprovedProducts();
        setProducts(result.slice(0, 4));
      } catch (err) {
        console.error("Failed to load products:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div style={styles.page}>
      <SEO title="Syndra — Make something. Share it. Earn." description="A friendly marketplace for digital creators of all ages. Sell worksheets, art, ebooks, and templates." />

      {/* HERO */}
      <section style={styles.hero}>
        <h1 style={styles.heroTitle}>Make something.<br />Share it. Earn.</h1>
        <p style={styles.heroSub}>A friendly marketplace for digital creators of all ages</p>
        <div style={styles.heroButtons}>
          <Link to="/marketplace" style={styles.btnPrimary}>Explore Products</Link>
          <Link to="/login" style={styles.btnSecondary}>Start Creating</Link>
        </div>
      </section>

      {/* TRENDING */}
      <section style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>✨ Trending this week</h2>
          <Link to="/marketplace" style={styles.seeAll}>See all →</Link>
        </div>

        {loading ? (
          <div style={styles.grid}>
            {[1, 2].map(i => (
              <div key={i} style={styles.card}>
                <div style={{ height: "240px", background: "#E5E7EB", borderRadius: "12px", animation: "pulse 1.5s ease-in-out infinite" }} />
              </div>
            ))}
          </div>
        ) : (
          <div style={styles.grid}>
            {products.map(product => (
              <Link to={`/product/${product.id}`} key={product.id} style={styles.card}>
                <div style={styles.cardImage}>
                  {product.thumbnailUrl ? (
                    <img src={product.thumbnailUrl} alt={product.title} style={styles.img} />
                  ) : (
                    <div style={styles.imgPlaceholder}>📦</div>
                  )}
                </div>
                <div style={styles.cardBody}>
                  <h3 style={styles.cardTitle}>{product.title || product.name}</h3>
                  <p style={styles.cardCreator}>by {product.creatorDisplayName || product.creatorEmail?.split("@")[0]}</p>
                  <span style={styles.cardPrice}>${product.price?.toFixed(2)}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* HOW IT WORKS */}
      <section style={{ ...styles.section, background: "#F5F3FF" }}>
        <h2 style={{ ...styles.sectionTitle, textAlign: "center" }}>How it works</h2>
        <div style={styles.steps}>
          {[
            { icon: "🎨", title: "Create", desc: "Upload your digital products — art, worksheets, templates, anything" },
            { icon: "📣", title: "Share", desc: "Promoters share your work and earn commission on every sale" },
            { icon: "💰", title: "Earn", desc: "You keep 70% of every sale. No hidden fees. No monthly costs." },
          ].map(step => (
            <div key={step.title} style={styles.step}>
              <div style={styles.stepIcon}>{step.icon}</div>
              <h3 style={styles.stepTitle}>{step.title}</h3>
              <p style={styles.stepDesc}>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={styles.cta}>
        <h2 style={styles.ctaTitle}>Ready to start?</h2>
        <p style={styles.ctaSub}>Join creators and promoters already earning on Syndra</p>
        <Link to="/login" style={styles.btnPrimary}>Get Started Free</Link>
      </section>

      {/* FOOTER */}
      <footer style={styles.footer}>
        <span style={styles.footerLogo}>✦ Syndra</span>
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
  page: { fontFamily: "'Inter', sans-serif", background: "#FAFBFC", color: "#1A1D26", minHeight: "100vh" },
  
  // Hero
  hero: { textAlign: "center", padding: "100px 24px 60px" },
  heroTitle: { fontSize: "48px", fontWeight: 700, lineHeight: 1.15, margin: 0, letterSpacing: "-0.02em" },
  heroSub: { color: "#6B7280", fontSize: "18px", marginTop: "16px" },
  heroButtons: { display: "flex", gap: "12px", justifyContent: "center", marginTop: "32px", flexWrap: "wrap" },
  btnPrimary: { padding: "14px 28px", borderRadius: "12px", background: "#6C5CE7", color: "#fff", textDecoration: "none", fontWeight: 600, fontSize: "15px", border: "none", cursor: "pointer", display: "inline-block" },
  btnSecondary: { padding: "14px 28px", borderRadius: "12px", background: "#fff", color: "#6C5CE7", textDecoration: "none", fontWeight: 600, fontSize: "15px", border: "1px solid #E5E7EB", display: "inline-block" },

  // Section
  section: { padding: "60px 24px", maxWidth: "960px", margin: "0 auto" },
  sectionHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" },
  sectionTitle: { fontSize: "24px", fontWeight: 600, margin: 0 },
  seeAll: { color: "#6C5CE7", textDecoration: "none", fontSize: "14px", fontWeight: 500 },

  // Grid
  grid: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "20px" },
  card: { borderRadius: "16px", background: "#fff", border: "1px solid #E5E7EB", overflow: "hidden", textDecoration: "none", color: "#1A1D26", transition: "transform 0.15s ease, box-shadow 0.15s ease", cursor: "pointer", display: "flex", flexDirection: "column" },
  cardImage: { height: "220px", background: "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" },
  img: { width: "100%", height: "100%", objectFit: "cover" },
  imgPlaceholder: { fontSize: "48px", opacity: 0.3 },
  cardBody: { padding: "20px" },
  cardTitle: { fontSize: "17px", fontWeight: 600, margin: 0 },
  cardCreator: { color: "#6B7280", fontSize: "13px", marginTop: "4px" },
  cardPrice: { fontSize: "18px", fontWeight: 700, color: "#6C5CE7", marginTop: "10px", display: "block" },

  // Steps
  steps: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px", marginTop: "32px", maxWidth: "700px", margin: "32px auto 0" },
  step: { textAlign: "center" },
  stepIcon: { fontSize: "32px", marginBottom: "12px" },
  stepTitle: { fontSize: "18px", fontWeight: 600, margin: "0 0 6px" },
  stepDesc: { color: "#6B7280", fontSize: "14px", lineHeight: 1.6, margin: 0 },

  // CTA
  cta: { textAlign: "center", padding: "60px 24px" },
  ctaTitle: { fontSize: "28px", fontWeight: 600, margin: 0 },
  ctaSub: { color: "#6B7280", marginTop: "8px", marginBottom: "20px" },

  // Footer
  footer: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "24px 24px", borderTop: "1px solid #E5E7EB", maxWidth: "960px", margin: "0 auto", flexWrap: "wrap", gap: "12px" },
  footerLogo: { fontWeight: 700, color: "#6C5CE7" },
  footerLinks: { display: "flex", gap: "20px" },
  footerLink: { color: "#6B7280", textDecoration: "none", fontSize: "13px" },
};

export default Home;