import { Link } from "react-router-dom";

function ProPromoter() {
  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <span style={styles.badge}>🚀 Limited Spots</span>
        <h1 style={styles.title}>Pro Promoter Program</h1>
        <p style={styles.subtitle}>Higher commissions. Priority support. Featured placement.</p>

        <div style={styles.grid}>
          {[
            { icon: "💰", title: "40% Lifetime Commission", desc: "Double the standard rate. Earn on every dollar the platform makes from your referrals." },
            { icon: "⭐", title: "Featured Placement", desc: "Your profile gets prime visibility across the platform." },
            { icon: "📊", title: "Real-Time Dashboard", desc: "Track clicks, signups, sales, and earnings per link." },
            { icon: "💬", title: "Priority Support", desc: "Direct line to the founder. No tickets. No waiting." },
            { icon: "💸", title: "$10 Payout Threshold", desc: "Get paid faster. Monthly via PayPal or crypto." },
            { icon: "🔗", title: "Custom Referral Link", desc: "Branded link that looks professional and tracks forever." },
          ].map(item => (
            <div key={item.title} style={styles.card}>
              <span style={styles.icon}>{item.icon}</span>
              <h3 style={styles.cardTitle}>{item.title}</h3>
              <p style={styles.cardDesc}>{item.desc}</p>
            </div>
          ))}
        </div>

        <div style={styles.cta}>
          <h2>Ready to join?</h2>
          <p>Limited spots available. Apply now.</p>
          <Link to="/apply-promoter" style={styles.btn}>Apply Now</Link>
          <p style={styles.note}>Already a promoter? <Link to="/settings" style={styles.link}>Upgrade in Settings</Link></p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { fontFamily: "'Inter', sans-serif", background: "linear-gradient(180deg, #F8F9FC 0%, #EEF0F5 100%)", minHeight: "100vh", padding: "60px 24px", textAlign: "center" },
  container: { maxWidth: "800px", margin: "0 auto" },
  badge: { display: "inline-block", padding: "6px 16px", borderRadius: "20px", background: "#F5F3FF", color: "#6C5CE7", fontWeight: 600, fontSize: "13px", marginBottom: "12px" },
  title: { fontSize: "36px", fontWeight: 700, color: "#1A1D26", margin: 0 },
  subtitle: { color: "#6B7280", marginTop: "6px", fontSize: "16px" },
  grid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginTop: "36px" },
  card: { background: "#fff", border: "1px solid #E8EAEF", borderRadius: "14px", padding: "24px 16px", textAlign: "center" },
  icon: { fontSize: "28px", display: "block", marginBottom: "10px" },
  cardTitle: { fontSize: "15px", fontWeight: 600, margin: "0 0 6px", color: "#1A1D26" },
  cardDesc: { color: "#6B7280", fontSize: "13px", lineHeight: 1.5, margin: 0 },
  cta: { marginTop: "44px", padding: "36px", borderRadius: "16px", background: "#fff", border: "1px solid #E8EAEF" },
  btn: { display: "inline-block", padding: "12px 28px", borderRadius: "10px", background: "#6C5CE7", color: "#fff", textDecoration: "none", fontWeight: 600, fontSize: "15px", marginTop: "12px" },
  note: { marginTop: "14px", color: "#6B7280", fontSize: "13px" },
  link: { color: "#6C5CE7", textDecoration: "none", fontWeight: 500 },
};

export default ProPromoter;