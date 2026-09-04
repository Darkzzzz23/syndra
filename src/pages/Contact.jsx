import { useState } from "react";

function Contact() {
  const [category, setCategory] = useState(null);

  const contacts = [
    { id: "payment", label: "Payment Support", desc: "Purchases, payouts, withdrawals, Telebirr, CBE", telegram: "syndrahub", person: "Syndra Team", icon: "💳" },
    { id: "bundles", label: "Reseller Bundles", desc: "Bundle purchases, resale rights, product access", telegram: "syndrahub", person: "Syndra Team", icon: "📦" },
    { id: "promoter", label: "Promoter Support", desc: "Referral links, commissions, promoter questions", telegram: "emanuandu", person: "Emanuel", icon: "📣" },
    { id: "general", label: "General Support", desc: "Account issues, product downloads, other questions", telegram: "focus_at_me", person: "Focus", icon: "🛟" },
  ];

  return (
    <div style={styles.page}>
      <div style={styles.glow1} />
      <div style={styles.glow2} />

      <div style={styles.container}>
        {category ? (
          <div style={styles.chatCard}>
            <span style={styles.chatIcon}>{category.icon}</span>
            <h1 style={styles.chatTitle}>{category.label}</h1>
            <p style={styles.chatDesc}>{category.desc}</p>
            <div style={styles.personRow}>
              <span style={styles.personLabel}>Handled by</span>
              <span style={styles.personName}>{category.person}</span>
            </div>
            <a href={`https://t.me/${category.telegram}`} target="_blank" rel="noreferrer" style={styles.telegramBtn}>
              <span style={styles.telegramIcon}>✈️</span> Chat on Telegram
            </a>
            <button onClick={() => setCategory(null)} style={styles.backBtn}>← Back to categories</button>
          </div>
        ) : (
          <>
            <div style={styles.header}>
              <h1 style={styles.title}>How can we help?</h1>
              <p style={styles.sub}>Select your issue and we'll connect you with the right person on Telegram.</p>
            </div>

            <div style={styles.grid}>
              {contacts.map(c => (
                <div key={c.id} onClick={() => setCategory(c)} style={styles.card}>
                  <span style={styles.cardIcon}>{c.icon}</span>
                  <h3 style={styles.cardTitle}>{c.label}</h3>
                  <p style={styles.cardDesc}>{c.desc}</p>
                  <span style={styles.cardArrow}>→</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: { background: "#0A0E17", color: "#F8FAFB", fontFamily: "'Inter', sans-serif", minHeight: "100vh", padding: "80px 24px", position: "relative", overflow: "hidden" },
  glow1: { position: "absolute", top: "-100px", right: "-100px", width: "400px", height: "400px", background: "radial-gradient(circle, rgba(6,182,212,0.06), transparent 70%)", pointerEvents: "none" },
  glow2: { position: "absolute", bottom: "-100px", left: "-100px", width: "300px", height: "300px", background: "radial-gradient(circle, rgba(6,182,212,0.04), transparent 70%)", pointerEvents: "none" },
  container: { maxWidth: "700px", margin: "0 auto", position: "relative", zIndex: 1 },

  header: { textAlign: "center", marginBottom: "48px" },
  title: { fontSize: "36px", fontWeight: 700, letterSpacing: "-0.02em", margin: 0 },
  sub: { color: "#94A3B8", fontSize: "15px", marginTop: "8px", lineHeight: 1.6 },

  grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" },
  card: { background: "#1A1F2E", border: "1px solid #2D3548", borderRadius: "12px", padding: "28px 24px", cursor: "pointer", transition: "all 0.25s", position: "relative" },
  cardIcon: { fontSize: "32px", display: "block", marginBottom: "14px" },
  cardTitle: { fontSize: "16px", fontWeight: 600, margin: "0 0 6px" },
  cardDesc: { color: "#94A3B8", fontSize: "13px", lineHeight: 1.5, margin: 0 },
  cardArrow: { position: "absolute", top: "20px", right: "20px", color: "#06B6D4", fontSize: "18px" },

  chatCard: { textAlign: "center", padding: "60px 32px", background: "#1A1F2E", border: "1px solid #2D3548", borderRadius: "16px", maxWidth: "400px", margin: "0 auto" },
  chatIcon: { fontSize: "48px", display: "block", marginBottom: "16px" },
  chatTitle: { fontSize: "24px", fontWeight: 700, margin: "0 0 8px", letterSpacing: "-0.01em" },
  chatDesc: { color: "#94A3B8", fontSize: "14px", marginBottom: "24px", lineHeight: 1.6 },
  personRow: { display: "flex", justifyContent: "center", alignItems: "center", gap: "8px", marginBottom: "28px" },
  personLabel: { color: "#64748B", fontSize: "13px" },
  personName: { fontWeight: 600, fontSize: "14px", color: "#06B6D4" },
  telegramBtn: { display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "14px 28px", borderRadius: "8px", background: "#06B6D4", color: "#0A0E17", fontWeight: 600, fontSize: "15px", textDecoration: "none", marginBottom: "20px" },
  telegramIcon: { fontSize: "16px" },
  backBtn: { display: "block", background: "none", border: "none", color: "#94A3B8", cursor: "pointer", fontSize: "14px", margin: "0 auto" },
};

export default Contact;