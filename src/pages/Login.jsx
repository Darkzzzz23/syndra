import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/config";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
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
      if (err.code === "auth/user-not-found") setError("No account found.");
      else if (err.code === "auth/wrong-password") setError("Incorrect password.");
      else setError("Login failed.");
    } finally { setLoading(false); }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <Link to="/" style={styles.logo}>Syndra</Link>
        <h1 style={styles.title}>Welcome back</h1>
        <p style={styles.sub}>Sign in to your account</p>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleLogin} style={styles.form}>
          <label style={styles.label}>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" style={styles.input} required />

          <label style={styles.label}>Password</label>
          <div style={{ position: "relative" }}>
            <input type={showPass ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" style={{ ...styles.input, paddingRight: "40px" }} required />
            <button type="button" onClick={() => setShowPass(!showPass)} style={styles.eye}>{showPass ? "🙈" : "👁"}</button>
          </div>

          <div style={{ textAlign: "right" }}>
            <Link to="/forgot-password" style={styles.link}>Forgot password?</Link>
          </div>

          <button type="submit" disabled={loading} style={styles.btn}>{loading ? "Signing in..." : "Sign In"}</button>
        </form>

        <p style={styles.footer}>Don't have an account? <Link to="/signup" style={{ color: "#06B6D4", fontWeight: 600 }}>Sign up</Link></p>
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
  label: { fontSize: "13px", fontWeight: 600, color: "#F8FAFB", letterSpacing: "0.03em" },
  input: { width: "100%", padding: "12px 14px", borderRadius: "6px", border: "1px solid #2D3548", background: "#1A1F2E", color: "#F8FAFB", fontSize: "14px", outline: "none", boxSizing: "border-box" },
  eye: { position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: "14px", color: "#94A3B8", padding: 0 },
  link: { color: "#94A3B8", textDecoration: "none", fontSize: "12px" },
  btn: { width: "100%", padding: "12px", borderRadius: "6px", border: "none", background: "#06B6D4", color: "#0A0E17", fontWeight: 600, fontSize: "14px", cursor: "pointer" },
  footer: { textAlign: "center", marginTop: "24px", fontSize: "14px", color: "#94A3B8" },
};

export default Login;