import { useState } from "react";
import { Link } from "react-router-dom";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase/config";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess("Password reset email sent! Check your inbox.");
      setEmail("");
    } catch (err) {
      console.error("Password reset failed:", err);
      if (err.code === "auth/user-not-found") {
        setError("No account found with that email.");
      } else if (err.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else {
        setError("Failed to send reset email. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.card}>
          <h1 style={styles.title}>Reset Password</h1>
          <p style={styles.subtitle}>
            Enter your email and we'll send you a link to reset your password.
          </p>

          {error && <div style={styles.alertError}>{error}</div>}
          {success && <div style={styles.alertSuccess}>{success}</div>}

          <form onSubmit={handleSubmit} style={styles.form}>
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

            <button type="submit" disabled={loading} style={styles.button}>
              {loading ? "Sending…" : "Send Reset Link"}
            </button>
          </form>

          <div style={styles.links}>
            <Link to="/login" style={styles.link}>Back to Login</Link>
          </div>
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
    marginTop: "10px",
    lineHeight: 1.6,
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
    marginTop: "20px",
    textAlign: "center",
  },
  link: {
    color: "#a5b4ff",
    textDecoration: "none",
    fontSize: "14px",
  },
  alertError: {
    padding: "14px 18px",
    borderRadius: "16px",
    background: "rgba(248,113,113,0.16)",
    color: "#fecaca",
    marginBottom: "8px",
  },
  alertSuccess: {
    padding: "14px 18px",
    borderRadius: "16px",
    background: "rgba(34,197,94,0.16)",
    color: "#bbf7d0",
    marginBottom: "8px",
  },
};

export default ForgotPassword;