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
    if (!email) { setError("Enter your email."); return; }
    setLoading(true); setError("");
    try {
      await sendPasswordResetEmail(auth, email);
      setSent(true);
    } catch (err) {
      if (err.code === "auth/user-not-found") setError("No account found.");
      else setError("Failed to send.");
    } finally { setLoading(false); }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <Link to="/" style={styles.logo}>Syndra</Link>
        {sent ? (
          <>
            <h1 style={styles.title}>Check your email</h1>
            <p style={styles.sub}>We sent a reset link to {email}</p>
            <Link to="/login" style={styles.link}>← Back to Sign In</Link>
          </>
        ) : (
          <>
            <h1 style={styles.title}>Reset password</h1>
            <p style={styles.sub}>Enter your email and we'll send you a link</p>
            {error && <div style={styles.error}>{error}</div>}
            <form onSubmit={handleSubmit} style={styles.form}>
              <label style={styles.label}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" style={styles.input} required />
              <button type="submit" disabled={loading} style={styles.btn}>{loading ? "Sending..." : "Send Reset Link"}</button>
            </form>
            <Link to="/login" style={{ ...styles.link, display: "block", textAlign: "center", marginTop: "16px" }}>← Back to Sign In</Link>
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: { display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#0A0E17", fontFamily: "'Inter', sans-serif", padding: "24px" },
  card: { width: "100%", maxWidth: "400px" },
  logo: { display: "block", textAlign: "center", fontSize: "20px", fontWeight: 700, color: "#06B6D4", textDecoration: "none", marginBottom: "32px", letterSpacing: "-0.02em" },
  title: { fontSize: "24px", fontWeight: 700, letterSpacing: "-0.01em", margin: "0 0 4px", textAlign: "center" },
  sub: { color: "#94A3B8", fontSize: "14px", textAlign: "center", margin: "0 0 24px" },
  error: { padding: "10px 14px", borderRadius: "6px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#EF4444", fontSize: "13px", marginBottom: "16px" },
  form: { display: "flex", flexDirection: "column", gap: "14px" },
  label: { fontSize: "13px", fontWeight: 600, color: "#F8FAFB" },
  input: { width: "100%", padding: "12px 14px", borderRadius: "6px", border: "1px solid #2D3548", background: "#1A1F2E", color: "#F8FAFB", fontSize: "14px", outline: "none", boxSizing: "border-box" },
  btn: { width: "100%", padding: "12px", borderRadius: "6px", border: "none", background: "#06B6D4", color: "#0A0E17", fontWeight: 600, fontSize: "14px", cursor: "pointer" },
  link: { color: "#06B6D4", textDecoration: "none", fontSize: "14px" },
};

export default ForgotPassword;