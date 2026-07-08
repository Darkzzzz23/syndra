import { useState } from "react";
import { Link } from "react-router-dom";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase/config";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) { setError("Please enter your email."); return; }
    setLoading(true); setError("");
    try {
      await sendPasswordResetEmail(auth, email);
      setSent(true);
    } catch (err) {
      if (err.code === "auth/user-not-found") setError("No account found with that email.");
      else setError("Failed to send reset email.");
    } finally { setLoading(false); }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logo}>✦ Syndra</div>
        {sent ? (
          <>
            <h1 style={styles.title}>Check your email</h1>
            <p style={styles.subtitle}>We sent a password reset link to {email}</p>
            <Link to="/login" style={styles.link}>← Back to Sign In</Link>
          </>
        ) : (
          <>
            <h1 style={styles.title}>Reset your password</h1>
            <p style={styles.subtitle}>Enter your email and we'll send you a link</p>
            {error && <div style={styles.error}>{error}</div>}
            <form onSubmit={handleSubmit} style={styles.form}>
              <label style={styles.label}>Email
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" style={styles.input} required />
              </label>
              <button type="submit" disabled={loading} style={styles.button}>
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
            </form>
            <Link to="/login" style={{ ...styles.link, display: "block", textAlign: "center", marginTop: "16px" }}>← Back to Sign In</Link>
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: { display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "linear-gradient(180deg, #F8F9FC 0%, #EEF0F5 100%)", fontFamily: "'Inter', sans-serif", padding: "24px" },
  card: { background: "#fff", border: "1px solid #E8EAEF", borderRadius: "20px", padding: "40px 32px", maxWidth: "400px", width: "100%", boxShadow: "0 4px 24px rgba(0,0,0,0.04)" },
  logo: { textAlign: "center", fontSize: "18px", fontWeight: 700, color: "#6C5CE7", marginBottom: "20px" },
  title: { fontSize: "24px", fontWeight: 700, margin: 0, textAlign: "center", color: "#1A1D26" },
  subtitle: { color: "#6B7280", textAlign: "center", marginTop: "6px", fontSize: "14px" },
  error: { padding: "12px", borderRadius: "10px", background: "#FEF2F2", color: "#EF4444", fontSize: "13px", marginBottom: "16px", marginTop: "16px" },
  form: { display: "flex", flexDirection: "column", gap: "14px", marginTop: "20px" },
  label: { display: "flex", flexDirection: "column", gap: "6px", fontSize: "13px", color: "#4B5563", fontWeight: 500 },
  input: { padding: "12px 14px", borderRadius: "10px", border: "1px solid #E0E3E8", fontSize: "14px", outline: "none", background: "#F8F9FC" },
  button: { padding: "12px", borderRadius: "10px", border: "none", background: "#6C5CE7", color: "#fff", fontWeight: 600, fontSize: "15px", cursor: "pointer", marginTop: "4px" },
  link: { color: "#6C5CE7", textDecoration: "none", fontSize: "13px", fontWeight: 500 },
};

export default ForgotPassword;