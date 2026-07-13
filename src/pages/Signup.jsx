import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase/config";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

function Signup() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!email || !password) { setError("Please fill in both fields."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    setLoading(true); setError("");
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, "users", result.user.uid), { email, role: null, totalClicks: 0, totalRevenue: 0, totalSales: 0, createdAt: serverTimestamp() });
      navigate("/choose-role");
    } catch (err) {
      if (err.code === "auth/email-already-in-use") setError("Account already exists.");
      else setError("Signup failed.");
    } finally { setLoading(false); }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <Link to="/" style={styles.logo}>Syndra</Link>
        <h1 style={styles.title}>Create your account</h1>
        <p style={styles.sub}>Start selling AI prompts today</p>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSignup} style={styles.form}>
          <label style={styles.label}>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" style={styles.input} required />

          <label style={styles.label}>Password</label>
          <div style={{ position: "relative" }}>
            <input type={showPass ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 8 characters" style={{ ...styles.input, paddingRight: "40px" }} required />
            <button type="button" onClick={() => setShowPass(!showPass)} style={styles.eye}>{showPass ? "🙈" : "👁"}</button>
          </div>

          <p style={{ fontSize: "12px", color: "#94A3B8" }}>By signing up you agree to our <Link to="/legal" style={{ color: "#06B6D4" }}>Terms</Link>.</p>

          <button type="submit" disabled={loading} style={styles.btn}>{loading ? "Creating..." : "Sign Up"}</button>
        </form>

        <p style={styles.footer}>Already have an account? <Link to="/login" style={{ color: "#06B6D4", fontWeight: 600 }}>Sign in</Link></p>
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
  btn: { width: "100%", padding: "12px", borderRadius: "6px", border: "none", background: "#06B6D4", color: "#0A0E17", fontWeight: 600, fontSize: "14px", cursor: "pointer" },
  footer: { textAlign: "center", marginTop: "24px", fontSize: "14px", color: "#94A3B8" },
};

export default Signup;