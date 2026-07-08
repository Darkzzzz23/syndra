import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/config";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) { setError("Please fill in both fields."); return; }
    setLoading(true); setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/dashboard");
    } catch (err) {
      if (err.code === "auth/user-not-found") setError("No account found with that email.");
      else if (err.code === "auth/wrong-password") setError("Incorrect password.");
      else setError("Login failed. Please try again.");
    } finally { setLoading(false); }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logo}>✦ Syndra</div>
        <h1 style={styles.title}>Welcome back</h1>
        <p style={styles.subtitle}>Sign in to your account</p>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleLogin} style={styles.form}>
          <label style={styles.label}>Email
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" style={styles.input} required />
          </label>
          <label style={styles.label}>Password
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Your password" style={styles.input} required />
          </label>
          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div style={styles.links}>
          <Link to="/forgot-password" style={styles.link}>Forgot password?</Link>
        </div>
        <p style={styles.footerText}>
          Don't have an account? <Link to="/signup" style={styles.link}>Sign up</Link>
        </p>
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
  links: { textAlign: "center", marginTop: "16px" },
  link: { color: "#6C5CE7", textDecoration: "none", fontSize: "13px", fontWeight: 500 },
  footerText: { textAlign: "center", marginTop: "16px", color: "#6B7280", fontSize: "13px" },
};

export default Login;