import { Link } from "react-router-dom";

function CheckoutCancel() {
  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.icon}>❌</div>
          <h1 style={styles.title}>Payment Cancelled</h1>
          <p style={styles.subtitle}>
            Your payment was not processed. No charges have been made.
          </p>
          <div style={styles.actions}>
            <Link to="/marketplace" style={styles.marketplaceBtn}>
              Back to Marketplace
            </Link>
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
    maxWidth: "500px",
    width: "100%",
  },
  card: {
    padding: "48px 36px",
    borderRadius: "24px",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(248,113,113,0.3)",
    textAlign: "center",
  },
  icon: {
    fontSize: "56px",
    marginBottom: "16px",
  },
  title: {
    fontSize: "32px",
    margin: 0,
    color: "#fecaca",
  },
  subtitle: {
    color: "#94a3b8",
    marginTop: "12px",
    lineHeight: 1.7,
  },
  actions: {
    marginTop: "32px",
  },
  marketplaceBtn: {
    padding: "14px 24px",
    borderRadius: "14px",
    background: "linear-gradient(135deg, #4f7cff, #7c3aed)",
    color: "#fff",
    textDecoration: "none",
    fontWeight: 700,
  },
};

export default CheckoutCancel;