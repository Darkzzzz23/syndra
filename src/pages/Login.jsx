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
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/dashboard");
    } catch (err) {
      console.error("Login failed:", err);
      if (err.code === "auth/user-not-found") {
        setError("No account found with that email.");
      } else if (err.code === "auth/wrong-password") {
        setError("Incorrect password.");
      } else if (err.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else if (err.code === "auth/too-many-requests") {
        setError("Too many login attempts. Please try again later.");
      } else {
        setError("Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.card}>
          <h1 style={styles.title}>Sign In</h1>
          <p style={styles.subtitle}>Welcome back to Syndra</p>

          {error && <div style={styles.alertError}>{error}</div>}

          <form onSubmit={handleLogin} style={styles.form}>
            <label style={styles.label}>
              Email
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                style={styles.input}
                required
              />
            </label>

            <label style={styles.label}>
              Password
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
                style={styles.input}
                required
              />
            </label>

            <button type="submit" disabled={loading} style={styles.button}>
              {loading ? "Signing In…" : "Sign In"}
            </button>
          </form>

          <div style={styles.links}>
            <Link to="/forgot-password" style={styles.forgotLink}>Forgot password?</Link>
          </div>

          <p style={styles.signupText}>
            Don't have an account? <Link to="/login" style={styles.signupLink}>Sign up here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "calc(100vh - 70px)",
    padding: "60px 24px",
    color: "#fff",
    background: "linear-gradient(180deg, #05070d 0%, #0f172a 100%)",
    fontFamily: "Inter, sans-serif",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    maxWidth: "440px",
    width: "100%",
  },
  card: {
    padding: "40px 32px",
    borderRadius: "24px",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(79,124,255,0.16)",
  },
  title: {
    fontSize: "28px",
    margin: 0,
    textAlign: "center",
  },
  subtitle: {
    color: "#94a3b8",
    textAlign: "center",
    marginTop: "8px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    marginTop: "24px",
  },
  label: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    fontSize: "14px",
    color: "#cbd5e1",
  },
  input: {
    borderRadius: "14px",
    border: "1px solid rgba(148,163,184,0.2)",
    padding: "14px 16px",
    fontSize: "14px",
    background: "rgba(255,255,255,0.04)",
    color: "#fff",
    outline: "none",
  },
  button: {
    padding: "16px 24px",
    borderRadius: "16px",
    border: "none",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: 700,
    background: "linear-gradient(135deg, #4f7cff, #7c3aed)",
    color: "#fff",
  },
  links: {
    marginTop: "16px",
    textAlign: "center",
  },
  forgotLink: {
    color: "#a5b4ff",
    textDecoration: "none",
    fontSize: "14px",
  },
  signupText: {
    marginTop: "20px",
    textAlign: "center",
    color: "#94a3b8",
    fontSize: "14px",
  },
  signupLink: {
    color: "#a5b4ff",
    textDecoration: "none",
  },
  alertError: {
    padding: "14px 18px",
    borderRadius: "16px",
    background: "rgba(248,113,113,0.16)",
    color: "#fecaca",
    marginBottom: "8px",
  },
};

export default Login;