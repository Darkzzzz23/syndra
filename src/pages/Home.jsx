import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getApprovedProducts } from "../services/productService";
import SEO from "../components/SEO";
function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);

  useEffect(() => {
    const loadFeatured = async () => {
      try {
        const products = await getApprovedProducts();
        setFeaturedProducts(products.slice(0, 6));
      } catch (err) {
        console.error("Failed to load featured products:", err);
      }
    };
    loadFeatured();
  }, []);

<SEO title="Create. Promote. Earn." description="The marketplace where creators sell digital products, promoters earn commissions, and customers discover quality downloads." />
  return (
    <div style={styles.page}>
      {/* HERO */}
      <section style={styles.hero}>
        <div style={styles.heroContent}>
          <div style={styles.heroBadge}>✦ The Digital Marketplace</div>
          <h1 style={styles.heroTitle}>
            Create. <span style={styles.heroAccent}>Promote.</span> Earn.
          </h1>
          <p style={styles.heroSubtitle}>
            The marketplace where creators sell digital products, promoters earn commissions,
            and customers discover quality downloads — all in one place.
          </p>
          <div style={styles.heroButtons}>
            <Link to="/marketplace" style={styles.heroBtnPrimary}>Browse Marketplace</Link>
            <Link to="/login" style={styles.heroBtnSecondary}>Get Started</Link>
          </div>
        </div>
        <div style={styles.heroGlow} />
      </section>

      {/* ROLE CARDS */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Everyone Earns on Syndra</h2>
        <p style={styles.sectionSubtitle}>Three ways to join the marketplace</p>
        <div style={styles.cardsGrid}>
          <div style={styles.card}>
            <div style={styles.cardIcon}>🎨</div>
            <h3 style={styles.cardTitle}>Creator</h3>
            <p style={styles.cardDesc}>
              Upload worksheets, ebooks, digital art, templates, and more. Set your price.
              Earn <strong>70%</strong> on every sale.
            </p>
            <Link to="/login" style={styles.cardLink}>Start Selling →</Link>
          </div>

          <div style={{ ...styles.card, ...styles.cardFeatured }}>
            <div style={styles.cardIcon}>📣</div>
            <h3 style={styles.cardTitle}>Promoter</h3>
            <p style={styles.cardDesc}>
              Share products you believe in. Earn <strong>20% commission</strong> on every
              sale through your unique referral link.
            </p>
            <Link to="/login" style={styles.cardLink}>Start Earning →</Link>
          </div>

          <div style={styles.card}>
            <div style={styles.cardIcon}>🛍️</div>
            <h3 style={styles.cardTitle}>Buyer</h3>
            <p style={styles.cardDesc}>
              Discover high-quality digital products from talented creators.
              Purchase and download instantly.
            </p>
            <Link to="/marketplace" style={styles.cardLink}>Browse Products →</Link>
          </div>
          <div style={{ textAlign: "center", marginTop: "32px" }}>
            <Link to="/leaderboard" style={styles.cardLink}>View Leaderboard →</Link>
           </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ ...styles.section, ...styles.stepsSection }}>
        <h2 style={styles.sectionTitle}>How It Works</h2>
        <p style={styles.sectionSubtitle}>Four simple steps to start earning</p>
        <div style={styles.stepsContainer}>
          {[
            { num: "01", icon: "📤", title: "Creators Upload", desc: "Upload your digital products. Set your price. Get approved by our team.", color: "#4f7cff" },
            { num: "02", icon: "🔗", title: "Promoters Share", desc: "Get your unique referral link. Share it anywhere and track every click.", color: "#7c3aed" },
            { num: "03", icon: "💳", title: "Customers Buy", desc: "Browse the marketplace. Purchase in one click. Download instantly.", color: "#a78bfa" },
            { num: "04", icon: "💰", title: "Everyone Earns", desc: "Creator 70%. Promoter 20%. Automatic. Transparent. Fair.", color: "#22c55e" },
          ].map((step, index) => (
            <div key={step.num} style={styles.stepRow}>
              <div style={styles.stepLeft}>
                <div style={{ ...styles.stepIconCircle, background: `${step.color}20`, border: `2px solid ${step.color}40` }}>
                  <span style={styles.stepEmoji}>{step.icon}</span>
                </div>
                {index < 3 && <div style={styles.stepConnector} />}
              </div>
              <div style={styles.stepRight}>
                <span style={{ ...styles.stepNumber, color: step.color }}>{step.num}</span>
                <h3 style={styles.stepTitle}>{step.title}</h3>
                <p style={styles.stepDesc}>{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Featured Products</h2>
        <p style={styles.sectionSubtitle}>Latest approved products from our creators</p>
        <div style={styles.productsGrid}>
          {featuredProducts.length > 0 ? (
            featuredProducts.map((product) => (
              <Link to={`/product/${product.id}`} key={product.id} style={styles.productCard}>
                <div style={styles.productImage}>
                  {product.thumbnailUrl ? (
                    <img src={product.thumbnailUrl} alt={product.title} style={styles.productThumb} />
                  ) : (
                    <span style={styles.productPlaceholder}>📦</span>
                  )}
                </div>
                <div style={styles.productInfo}>
                  <span style={styles.productCategory}>{product.category}</span>
                  <h4 style={styles.productTitle}>{product.title || product.name}</h4>
                  <span style={styles.productPrice}>${product.price?.toFixed(2) ?? "0.00"}</span>
                </div>
              </Link>
            ))
          ) : (
            <div style={styles.emptyProducts}>
              <p>No products yet. Be the first creator!</p>
              <Link to="/login" style={styles.heroBtnPrimary}>Upload Your First Product</Link>
            </div>
          )}
        </div>
        {featuredProducts.length > 0 && (
          <div style={styles.viewAll}>
            <Link to="/marketplace" style={styles.heroBtnPrimary}>View All Products</Link>
          </div>
        )}
      </section>

      {/* STATS */}
      <section style={{ ...styles.section, ...styles.statsSection }}>
        <div style={styles.statsGrid}>
          <div style={styles.statItem}>
            <div style={styles.statIcon}>👥</div>
            <div style={styles.statValue}>70/20/10</div>
            <div style={styles.statLabel}>Commission Split</div>
          </div>
          <div style={styles.statItem}>
            <div style={styles.statIcon}>🔒</div>
            <div style={styles.statValue}>Secure</div>
            <div style={styles.statLabel}>Payments by Stripe</div>
          </div>
          <div style={styles.statItem}>
            <div style={styles.statIcon}>⚡</div>
            <div style={styles.statValue}>Instant</div>
            <div style={styles.statLabel}>Digital Delivery</div>
          </div>
          <div style={styles.statItem}>
            <div style={styles.statIcon}>🌍</div>
            <div style={styles.statValue}>Global</div>
            <div style={styles.statLabel}>Buy & Sell Worldwide</div>
          </div>
        </div>
      </section>

      {/* DISCORD */}
      <section style={styles.discordSection}>
        <div style={styles.discordCard}>
          <div style={styles.discordIcon}>💬</div>
          <h2 style={styles.discordTitle}>Join the Community</h2>
          <p style={styles.discordDesc}>
            Connect with creators, promoters, and buyers. Get early access to features, share feedback, and grow together.
          </p>
          <div style={styles.discordFeatures}>
            <span>🤝 Meet peers</span>
            <span>💡 Get tips</span>
            <span>🚀 Early updates</span>
            <span>🎉 Giveaways</span>
          </div>
          <a href="https://discord.gg/kytBEbJ5" target="_blank" rel="noreferrer" style={styles.discordBtn}>
            Join Discord Server
          </a>
        </div>
      </section>

      {/* CTA BANNER */}
      <section style={styles.ctaSection}>
        <h2 style={styles.ctaTitle}>Ready to Join?</h2>
        <p style={styles.ctaSubtitle}>
          Whether you create, promote, or buy — Syndra has a place for you.
        </p>
        <div style={styles.heroButtons}>
          <Link to="/login" style={styles.heroBtnPrimary}>Get Started Free</Link>
          <Link to="/marketplace" style={styles.heroBtnSecondary}>Explore Marketplace</Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={styles.footer}>
        <div style={styles.footerContent}>
          <div style={styles.footerBrand}>
            <span style={styles.footerLogo}>✦ Syndra</span>
            <p style={styles.footerTagline}>Digital Marketplace for Creators & Promoters</p>
          </div>
          <div style={styles.footerLinks}>
            <Link to="/legal" style={styles.footerLink}>Legal</Link>
            <Link to="/contact" style={styles.footerLink}>Contact</Link>
            <Link to="/marketplace" style={styles.footerLink}>Marketplace</Link>
            <a href="https://discord.gg/kytBEbJ5" target="_blank" rel="noreferrer" style={styles.footerLink}>Community</a>
          </div>
        </div>
        <div style={styles.footerBottom}>
          <p>© 2026 Syndra. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

const styles = {
  page: { color: "#fff", fontFamily: "Inter, sans-serif", background: "linear-gradient(180deg, #05070d 0%, #0f172a 100%)" },

  hero: { padding: "100px 24px 80px", textAlign: "center", position: "relative", overflow: "hidden" },
  heroContent: { maxWidth: "720px", margin: "0 auto", position: "relative", zIndex: 1 },
  heroBadge: { display: "inline-block", padding: "8px 20px", borderRadius: "999px", background: "rgba(79,124,255,0.15)", border: "1px solid rgba(79,124,255,0.25)", color: "#a5b4ff", fontSize: "14px", fontWeight: 600, marginBottom: "24px" },
  heroTitle: { fontSize: "56px", fontWeight: 800, margin: 0, lineHeight: 1.1 },
  heroAccent: { background: "linear-gradient(135deg, #4f7cff, #a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" },
  heroSubtitle: { fontSize: "18px", color: "#94a3b8", marginTop: "20px", lineHeight: 1.7, maxWidth: "560px", margin: "20px auto 0" },
  heroButtons: { display: "flex", gap: "16px", justifyContent: "center", marginTop: "36px", flexWrap: "wrap" },
  heroBtnPrimary: { padding: "16px 32px", borderRadius: "16px", background: "linear-gradient(135deg, #4f7cff, #7c3aed)", color: "#fff", textDecoration: "none", fontWeight: 700, fontSize: "16px", display: "inline-block" },
  heroBtnSecondary: { padding: "16px 32px", borderRadius: "16px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "#cbd5e1", textDecoration: "none", fontWeight: 600, fontSize: "16px", display: "inline-block" },
  heroGlow: { position: "absolute", top: "-100px", left: "50%", transform: "translateX(-50%)", width: "600px", height: "600px", background: "radial-gradient(circle, rgba(79,124,255,0.15), transparent 70%)", pointerEvents: "none" },

  section: { padding: "80px 24px" },
  sectionTitle: { fontSize: "36px", fontWeight: 700, textAlign: "center", margin: 0 },
  sectionSubtitle: { color: "#94a3b8", textAlign: "center", marginTop: "12px", fontSize: "16px" },

  cardsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px", maxWidth: "960px", margin: "40px auto 0" },
  card: { padding: "36px 28px", borderRadius: "20px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(79,124,255,0.12)", textAlign: "center" },
  cardFeatured: { border: "1px solid rgba(79,124,255,0.35)", background: "rgba(79,124,255,0.06)" },
  cardIcon: { fontSize: "40px", marginBottom: "16px" },
  cardTitle: { fontSize: "22px", fontWeight: 700, margin: "0 0 10px" },
  cardDesc: { color: "#cbd5e1", lineHeight: 1.7, fontSize: "14px", marginBottom: "20px" },
  cardLink: { color: "#a5b4ff", textDecoration: "none", fontWeight: 600, fontSize: "14px" },

  stepsSection: { background: "rgba(255,255,255,0.02)", borderTop: "1px solid rgba(79,124,255,0.08)", borderBottom: "1px solid rgba(79,124,255,0.08)" },
  stepsContainer: { maxWidth: "600px", margin: "48px auto 0", display: "flex", flexDirection: "column", gap: "0px" },
  stepRow: { display: "flex", gap: "20px", alignItems: "flex-start", position: "relative" },
  stepLeft: { display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0, width: "60px" },
  stepIconCircle: { width: "56px", height: "56px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, zIndex: 1 },
  stepEmoji: { fontSize: "24px" },
  stepConnector: { width: "2px", height: "60px", background: "rgba(79,124,255,0.15)", marginTop: "8px" },
  stepRight: { flex: 1, paddingBottom: "40px" },
  stepNumber: { fontSize: "12px", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase" },
  stepTitle: { fontSize: "20px", fontWeight: 700, margin: "4px 0 6px" },
  stepDesc: { color: "#94a3b8", fontSize: "14px", lineHeight: 1.6, margin: 0 },

  productsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px", maxWidth: "1000px", margin: "40px auto 0" },
  productCard: { borderRadius: "16px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(79,124,255,0.12)", overflow: "hidden", textDecoration: "none", color: "#fff" },
  productImage: { height: "140px", background: "rgba(79,124,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" },
  productThumb: { width: "100%", height: "100%", objectFit: "cover" },
  productPlaceholder: { fontSize: "40px" },
  productInfo: { padding: "16px" },
  productCategory: { fontSize: "11px", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em" },
  productTitle: { fontSize: "16px", fontWeight: 600, margin: "6px 0" },
  productPrice: { fontSize: "14px", fontWeight: 700, color: "#a5b4ff" },
  emptyProducts: { gridColumn: "1/-1", textAlign: "center", padding: "40px", color: "#94a3b8" },
  viewAll: { textAlign: "center", marginTop: "32px" },

  statsSection: { background: "rgba(255,255,255,0.02)", borderTop: "1px solid rgba(79,124,255,0.08)", borderBottom: "1px solid rgba(79,124,255,0.08)" },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "32px", maxWidth: "800px", margin: "0 auto" },
  statItem: { textAlign: "center" },
  statIcon: { fontSize: "28px", marginBottom: "8px" },
  statValue: { fontSize: "24px", fontWeight: 700 },
  statLabel: { color: "#94a3b8", fontSize: "13px", marginTop: "4px" },

  discordSection: { padding: "60px 24px", textAlign: "center" },
  discordCard: { maxWidth: "500px", margin: "0 auto", padding: "40px 32px", borderRadius: "24px", background: "rgba(88,101,242,0.06)", border: "1px solid rgba(88,101,242,0.2)" },
  discordIcon: { fontSize: "48px", marginBottom: "16px" },
  discordTitle: { fontSize: "28px", fontWeight: 700, margin: 0 },
  discordDesc: { color: "#94a3b8", marginTop: "12px", lineHeight: 1.7 },
  discordFeatures: { display: "flex", justifyContent: "center", gap: "16px", flexWrap: "wrap", marginTop: "20px", fontSize: "14px", color: "#a5b4ff" },
  discordBtn: { display: "inline-block", marginTop: "24px", padding: "14px 28px", borderRadius: "14px", background: "#5865F2", color: "#fff", textDecoration: "none", fontWeight: 700, fontSize: "15px" },

  ctaSection: { padding: "80px 24px", textAlign: "center" },
  ctaTitle: { fontSize: "36px", fontWeight: 700, margin: 0 },
  ctaSubtitle: { color: "#94a3b8", marginTop: "12px", fontSize: "16px" },

  footer: { padding: "40px 24px", borderTop: "1px solid rgba(79,124,255,0.08)" },
  footerContent: { maxWidth: "1000px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "20px" },
  footerBrand: {},
  footerLogo: { fontSize: "18px", fontWeight: 700, color: "#a5b4ff" },
  footerTagline: { color: "#64748b", fontSize: "13px", marginTop: "4px" },
  footerLinks: { display: "flex", gap: "24px" },
  footerLink: { color: "#94a3b8", textDecoration: "none", fontSize: "14px" },
  footerBottom: { textAlign: "center", marginTop: "24px", color: "#475569", fontSize: "13px" },
};

export default Home;