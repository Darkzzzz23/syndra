import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase/config";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

function Signup() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!email || !password) { setError("Please fill in both fields."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    setLoading(true); setError("");
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, "users", result.user.uid), {
        email,
        role: null,
        totalClicks: 0,
        totalRevenue: 0,
        totalSales: 0,
        createdAt: serverTimestamp(),
      });
      navigate("/choose-role");
    } catch (err) {
      if (err.code === "auth/email-already-in-use") setError("An account with this email already exists.");
      else setError("Signup failed. Please try again.");
    } finally { setLoading(false); }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logo}>✦ Syndra</div>
        <h1 style={styles.title}>Create your account</h1>
        <p style={styles.subtitle}>Join the marketplace for digital creators</p>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSignup} style={styles.form}>
          <label style={styles.label}>Email
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" style={styles.input} required />
          </label>
          <label style={styles.label}>Password
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 6 characters" style={styles.input} required />
          </label>
          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <p style={styles.footerText}>
          Already have an account? <Link to="/login" style={styles.link}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: { display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#FAFBFC", fontFamily: "'Inter', sans-serif", padding: "24px" },
  card: { background: "#fff", border: "1px solid #E5E7EB", borderRadius: "20px", padding: "40px 32px", maxWidth: "400px", width: "100%", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" },
  logo: { textAlign: "center", fontSize: "18px", fontWeight: 700, color: "#6C5CE7", marginBottom: "20px" },
  title: { fontSize: "24px", fontWeight: 700, margin: 0, textAlign: "center" },
  subtitle: { color: "#6B7280", textAlign: "center", marginTop: "6px", fontSize: "14px" },
  error: { padding: "12px", borderRadius: "10px", background: "#FEF2F2", color: "#EF4444", fontSize: "13px", marginBottom: "16px", marginTop: "16px" },
  form: { display: "flex", flexDirection: "column", gap: "14px", marginTop: "20px" },
  label: { display: "flex", flexDirection: "column", gap: "6px", fontSize: "13px", color: "#4B5563", fontWeight: 500 },
  input: { padding: "12px 14px", borderRadius: "10px", border: "1px solid #E5E7EB", fontSize: "14px", outline: "none", background: "#FAFBFC" },
  button: { padding: "12px", borderRadius: "10px", border: "none", background: "#6C5CE7", color: "#fff", fontWeight: 600, fontSize: "15px", cursor: "pointer", marginTop: "4px" },
  link: { color: "#6C5CE7", textDecoration: "none", fontSize: "13px", fontWeight: 500 },
  footerText: { textAlign: "center", marginTop: "16px", color: "#6B7280", fontSize: "13px" },
};

export default Signup;