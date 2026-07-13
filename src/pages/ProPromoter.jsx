import { Link, useNavigate } from "react-router-dom";

const BENEFITS = [
  { icon: "💰", title: "40% Commission", desc: "Earn 40% on every sale you drive — the highest rate on the market. No cap, no limit.", color: "#6C5CE7", bg: "#ede9ff" },
  { icon: "⚡", title: "Featured Placement", desc: "Your recommended products get premium placement across the marketplace.", color: "#fdcb6e", bg: "#fff8e6" },
  { icon: "📊", title: "Real-Time Dashboard", desc: "Live click tracking, conversion rates, and revenue charts. Know exactly what's working.", color: "#00b894", bg: "#d6f5ef" },
  { icon: "🎧", title: "Priority Support", desc: "Direct line to the founder. Your questions never get lost in a queue.", color: "#fd79a8", bg: "#ffe8f3" },
  { icon: "💸", title: "$10 Payout Threshold", desc: "Request withdrawals from just $10 — no waiting until you hit $100.", color: "#6C5CE7", bg: "#ede9ff" },
  { icon: "🔗", title: "Custom Short Links", desc: "Get branded short links that are memorable and track beautifully.", color: "#00b894", bg: "#d6f5ef" },
];

const TESTIMONIALS = [
  { name: "Rio Martinez", avatar: "RM", stat: "$3,200/mo", quote: "Pro Promoter completely changed my relationship with passive income. I post once, earn for weeks." },
  { name: "Naomi Ellis", avatar: "NE", stat: "48K clicks", quote: "The real-time dashboard is incredible. I can see sales coming in as I post." },
];

function ProPromoter() {
  const navigate = useNavigate();

  return (
    <div style={styles.page}>
      {/* Hero */}
      <section style={styles.hero}>
        <div style={styles.heroInner}>
          <span style={styles.badge}>Promoter Program</span>
          <h1 style={styles.title}>Pro Promoter Program</h1>
          <p style={styles.subtitle}>Share products you believe in. Earn 40% on every sale. Join the most rewarding promoter program in the digital creator space.</p>
          <div style={styles.heroBtns}>
            <button onClick={() => navigate("/apply-promoter")} style={styles.btnPrimary}>Apply to become Pro →</button>
            <button onClick={() => navigate("/leaderboard")} style={styles.btnSecondary}>View leaderboard</button>
          </div>
          <div style={styles.statsStrip}>
            {[{ value: "6,200+", label: "Pro Promoters" }, { value: "40%", label: "Commission rate" }, { value: "$10", label: "Min. payout" }].map(item => (
              <div key={item.label} style={{ textAlign: "center" }}>
                <p style={styles.stripValue}>{item.value}</p>
                <p style={styles.stripLabel}>{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section style={styles.section}>
        <div style={{ textAlign: "center", marginBottom: "56px" }}>
          <p style={styles.sectionEyebrow}>What you get</p>
          <h2 style={styles.sectionTitle}>Built for serious promoters.</h2>
        </div>
        <div style={styles.benefitsGrid}>
          {BENEFITS.map((b) => (
            <div key={b.title} style={styles.benefitCard}>
              <div style={{ ...styles.benefitIcon, background: b.bg }}>{b.icon}</div>
              <h3 style={styles.benefitTitle}>{b.title}</h3>
              <p style={styles.benefitDesc}>{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section style={styles.testimonialSection}>
        <h2 style={{ ...styles.sectionTitle, textAlign: "center", marginBottom: "40px" }}>What Pro Promoters say</h2>
        <div style={styles.testimonialGrid}>
          {TESTIMONIALS.map((t) => (
            <div key={t.name} style={styles.testimonialCard}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                <div style={styles.testimonialAvatar}>{t.avatar}</div>
                <div>
                  <p style={{ fontSize: "14px", fontWeight: 600, margin: 0 }}>{t.name}</p>
                  <p style={{ fontSize: "12px", fontWeight: 700, color: "#6C5CE7", margin: 0 }}>{t.stat}</p>
                </div>
              </div>
              <p style={{ fontSize: "14px", color: "#7a7a8a", lineHeight: 1.6, margin: 0 }}>"{t.quote}"</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={styles.ctaSection}>
        <h2 style={styles.sectionTitle}>Ready to start earning?</h2>
        <p style={{ color: "#7a7a8a", fontSize: "14px", marginBottom: "32px" }}>Applications take 2 minutes. Most are reviewed within 24 hours.</p>
        <button onClick={() => navigate("/apply-promoter")} style={styles.btnPrimary}>Apply now →</button>
      </section>

      <footer style={styles.footer}>
        <span style={styles.footerLogo}>✦ Syndra</span>
        <div style={styles.footerLinks}>
          <Link to="/legal" style={styles.footerLink}>Legal</Link>
          <Link to="/contact" style={styles.footerLink}>Contact</Link>
        </div>
      </footer>
    </div>
  );
}

const styles = {
  page: { fontFamily: "'Inter', sans-serif", background: "#fff", color: "#0f0f0f", minHeight: "100vh" },
  hero: { borderBottom: "1px solid rgba(0,0,0,0.08)" },
  heroInner: { maxWidth: "1152px", margin: "0 auto", padding: "96px 24px", textAlign: "center" },
  badge: { display: "inline-block", fontSize: "12px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", padding: "4px 12px", background: "#ede9ff", color: "#6C5CE7", borderRadius: "999px", marginBottom: "20px" },
  title: { fontFamily: "'DM Sans', sans-serif", fontSize: "56px", fontWeight: 700, letterSpacing: "-0.02em", margin: "0 0 20px", lineHeight: 1.1 },
  subtitle: { fontSize: "18px", color: "#7a7a8a", maxWidth: "560px", margin: "0 auto 40px", lineHeight: 1.6 },
  heroBtns: { display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" },
  btnPrimary: { display: "inline-flex", alignItems: "center", gap: "8px", padding: "14px 28px", borderRadius: "8px", background: "#6C5CE7", color: "#fff", fontWeight: 600, fontSize: "14px", border: "none", cursor: "pointer", textDecoration: "none" },
  btnSecondary: { padding: "14px 28px", borderRadius: "8px", border: "1px solid rgba(0,0,0,0.08)", background: "#fff", color: "#7a7a8a", fontWeight: 500, fontSize: "14px", cursor: "pointer" },
  statsStrip: { display: "flex", justifyContent: "center", gap: "32px", marginTop: "48px" },
  stripValue: { fontFamily: "'DM Sans', sans-serif", fontSize: "28px", fontWeight: 700, color: "#6C5CE7" },
  stripLabel: { fontSize: "12px", color: "#7a7a8a" },
  section: { maxWidth: "1152px", margin: "0 auto", padding: "80px 24px" },
  sectionEyebrow: { fontSize: "12px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "#6C5CE7", marginBottom: "12px" },
  sectionTitle: { fontFamily: "'DM Sans', sans-serif", fontSize: "30px", fontWeight: 700, letterSpacing: "-0.02em", margin: 0 },
  benefitsGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" },
  benefitCard: { border: "1px solid rgba(0,0,0,0.08)", borderRadius: "12px", padding: "24px" },
  benefitIcon: { width: "40px", height: "40px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px", fontSize: "18px" },
  benefitTitle: { fontFamily: "'DM Sans', sans-serif", fontWeight: 700, marginBottom: "8px" },
  benefitDesc: { fontSize: "14px", color: "#7a7a8a", lineHeight: 1.6, margin: 0 },
  testimonialSection: { borderTop: "1px solid rgba(0,0,0,0.08)", background: "rgba(245,245,247,0.4)", padding: "64px 24px" },
  testimonialGrid: { maxWidth: "768px", margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" },
  testimonialCard: { background: "#fff", border: "1px solid rgba(0,0,0,0.08)", borderRadius: "12px", padding: "24px" },
  testimonialAvatar: { width: "40px", height: "40px", borderRadius: "50%", background: "#6C5CE7", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "14px", flexShrink: 0 },
  ctaSection: { textAlign: "center", padding: "80px 24px", borderTop: "1px solid rgba(0,0,0,0.08)" },
  footer: { display: "flex", justifyContent: "space-between", padding: "24px", borderTop: "1px solid rgba(0,0,0,0.08)", maxWidth: "1152px", margin: "0 auto" },
  footerLogo: { fontWeight: 700, color: "#6C5CE7", fontSize: "14px" },
  footerLinks: { display: "flex", gap: "20px" },
  footerLink: { color: "#7a7a8a", textDecoration: "none", fontSize: "12px" },
};

export default ProPromoter;