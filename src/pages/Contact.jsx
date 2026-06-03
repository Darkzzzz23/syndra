import { useState } from "react";
import { Link } from "react-router-dom";

function Contact() {
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.title}>Contact Us</h1>
        <p style={styles.subtitle}>Have questions or feedback? Reach out.</p>

        {sent ? (
          <div style={styles.successCard}>
            <span style={{ fontSize: "40px" }}>📬</span>
            <h2>Message Sent!</h2>
            <p>We'll get back to you soon.</p>
            <Link to="/" style={styles.backBtn}>Back to Home</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={styles.form}>
            <label style={styles.label}>
              Name
              <input type="text" placeholder="Your name" style={styles.input} required />
            </label>
            <label style={styles.label}>
              Email
              <input type="email" placeholder="you@example.com" style={styles.input} required />
            </label>
            <label style={styles.label}>
              Message
              <textarea placeholder="How can we help?" style={{ ...styles.input, minHeight: "120px" }} required />
            </label>
            <button type="submit" style={styles.button}>Send Message</button>
          </form>
        )}

        <div style={styles.links}>
          <Link to="/" style={styles.link}>← Back to Home</Link>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: "calc(100vh - 70px)", padding: "40px 24px", color: "#fff", background: "linear-gradient(180deg, #05070d 0%, #0f172a 100%)", fontFamily: "Inter, sans-serif" },
  container: { maxWidth: "600px", margin: "0 auto" },
  title: { fontSize: "36px", margin: 0 },
  subtitle: { color: "#94a3b8", marginTop: "10px", marginBottom: "28px" },
  form: { display: "flex", flexDirection: "column", gap: "16px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(79,124,255,0.14)", borderRadius: "20px", padding: "28px" },
  label: { display: "flex", flexDirection: "column", gap: "6px", fontSize: "14px", color: "#cbd5e1" },
  input: { borderRadius: "12px", border: "1px solid rgba(148,163,184,0.2)", padding: "12px 14px", fontSize: "14px", background: "rgba(255,255,255,0.04)", color: "#fff", outline: "none" },
  button: { padding: "14px 20px", borderRadius: "14px", border: "none", background: "linear-gradient(135deg, #4f7cff, #7c3aed)", color: "#fff", cursor: "pointer", fontWeight: 700, fontSize: "15px" },
  successCard: { padding: "40px", borderRadius: "20px", background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)", textAlign: "center" },
  backBtn: { display: "inline-block", marginTop: "16px", color: "#a5b4ff", textDecoration: "none" },
  links: { marginTop: "20px" },
  link: { color: "#a5b4ff", textDecoration: "none" },
};

export default Contact;