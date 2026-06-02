import { useState } from "react";
import { Link } from "react-router-dom";

function Contact() {
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const data = {
      name: form.name.value,
      email: form.email.value,
      message: form.message.value,
    };

    try {
      const response = await fetch("https://formspree.io/f/mbdbnzze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setSent(true);
      } else {
        alert("Failed to send. Please try again.");
      }
    } catch {
      alert("Failed to send. Please try again.");
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.title}>Contact Us</h1>
        <p style={styles.subtitle}>Questions, feedback, or need help? Reach out.</p>

        {sent ? (
          <div style={styles.successCard}>
            <span style={{ fontSize: "40px" }}>📬</span>
            <h2>Message Sent</h2>
            <p>We'll get back to you soon.</p>
            <Link to="/" style={styles.backBtn}>Back to Home</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={styles.form}>
            <label style={styles.label}>
              Name
              <input name="name" type="text" placeholder="Your name" style={styles.input} required />
            </label>
            <label style={styles.label}>
              Email
              <input name="email" type="email" placeholder="you@example.com" style={styles.input} required />
            </label>
            <label style={styles.label}>
              Message
              <textarea name="message" placeholder="How can we help?" style={{ ...styles.input, minHeight: "140px" }} required />
            </label>
            <button type="submit" style={styles.button}>Send Message</button>
          </form>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: "calc(100vh - 70px)", padding: "60px 24px", color: "#fff", background: "linear-gradient(180deg, #05070d 0%, #0f172a 100%)", fontFamily: "Inter, sans-serif", display: "flex", justifyContent: "center", alignItems: "center" },
  container: { maxWidth: "560px", width: "100%", textAlign: "center" },
  title: { fontSize: "36px", margin: 0 },
  subtitle: { color: "#94a3b8", marginTop: "8px" },
  form: { display: "flex", flexDirection: "column", gap: "16px", marginTop: "28px", textAlign: "left" },
  label: { display: "flex", flexDirection: "column", gap: "8px", fontSize: "14px", color: "#cbd5e1" },
  input: { borderRadius: "14px", border: "1px solid rgba(148,163,184,0.2)", padding: "14px 16px", fontSize: "14px", background: "rgba(255,255,255,0.04)", color: "#fff", outline: "none" },
  button: { padding: "16px 24px", borderRadius: "16px", border: "none", cursor: "pointer", fontSize: "16px", fontWeight: 700, background: "linear-gradient(135deg, #4f7cff, #7c3aed)", color: "#fff", marginTop: "8px" },
  successCard: { padding: "40px", borderRadius: "20px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(34,197,94,0.3)", marginTop: "28px" },
  backBtn: { display: "inline-block", marginTop: "20px", color: "#a5b4ff", textDecoration: "none", fontWeight: 600 },
};

export default Contact;