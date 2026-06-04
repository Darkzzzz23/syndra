import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.code}>404</div>
        <h1 style={styles.title}>Page Not Found</h1>
        <p style={styles.subtitle}>The page you're looking for doesn't exist or was moved.</p>
        <div style={styles.buttons}>
          <Link to="/" style={styles.btnPrimary}>Go Home</Link>
          <Link to="/marketplace" style={styles.btnSecondary}>Browse Marketplace</Link>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "radial-gradient(circle at top, #0f172a, #05070d)", color: "#fff", fontFamily: "Inter, sans-serif", padding: "24px" },
  container: { textAlign: "center", maxWidth: "500px" },
  code: { fontSize: "100px", fontWeight: 800, background: "linear-gradient(135deg, #4f7cff, #7c3aed)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", lineHeight: 1 },
  title: { fontSize: "28px", marginTop: "16px" },
  subtitle: { color: "#94a3b8", marginTop: "10px", lineHeight: 1.6 },
  buttons: { display: "flex", gap: "12px", justifyContent: "center", marginTop: "28px", flexWrap: "wrap" },
  btnPrimary: { padding: "14px 24px", borderRadius: "14px", background: "linear-gradient(135deg, #4f7cff, #7c3aed)", color: "#fff", textDecoration: "none", fontWeight: 700 },
  btnSecondary: { padding: "14px 24px", borderRadius: "14px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "#cbd5e1", textDecoration: "none", fontWeight: 600 },
};

export default NotFound;