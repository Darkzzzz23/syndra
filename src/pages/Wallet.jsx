import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";

function Wallet() {
  const { currentUser, userProfile } = useContext(AuthContext);
  const role = userProfile?.role;
  const [balance, setBalance] = useState({ earnings: 0, pending: 0, total: 0 });

  useEffect(() => {
    const loadBalance = async () => {
      if (!currentUser) return;
      const userRef = doc(db, "users", currentUser.uid);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        const data = snap.data();
        setBalance({
          earnings: data.totalRevenue || 0,
          pending: 0,
          total: data.totalRevenue || 0,
        });
      }
    };
    loadBalance();
  }, [currentUser]);

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.title}>Wallet</h1>
        <p style={styles.subtitle}>
          {role === "creator" ? "Your earnings from product sales" : role === "promoter" ? "Your commission earnings" : "Your balance"}
        </p>

        <div style={styles.balanceCard}>
          <p style={styles.balanceLabel}>Available Balance</p>
          <p style={styles.balanceValue}>${balance.total.toFixed(2)}</p>
          <p style={styles.balanceNote}>Withdrawals coming soon</p>
        </div>

        <Link to="/dashboard" style={styles.backLink}>← Back to Dashboard</Link>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: "calc(100vh - 70px)", padding: "40px 24px", color: "#fff", background: "linear-gradient(180deg, #05070d 0%, #0f172a 100%)", fontFamily: "Inter, sans-serif" },
  container: { maxWidth: "500px", margin: "0 auto" },
  title: { fontSize: "34px", margin: 0 },
  subtitle: { color: "#94a3b8", marginTop: "8px" },
  balanceCard: { marginTop: "32px", padding: "32px", borderRadius: "20px", background: "rgba(79,124,255,0.08)", border: "1px solid rgba(79,124,255,0.2)", textAlign: "center" },
  balanceLabel: { color: "#94a3b8", fontSize: "14px", textTransform: "uppercase", letterSpacing: "0.1em" },
  balanceValue: { fontSize: "48px", fontWeight: 800, margin: "12px 0" },
  balanceNote: { color: "#64748b", fontSize: "13px" },
  backLink: { display: "inline-block", marginTop: "24px", color: "#a5b4ff", textDecoration: "none" },
};

export default Wallet;