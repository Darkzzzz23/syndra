import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { requestWithdrawal, getUserWithdrawals } from "../services/withdrawalService";

function Wallet() {
  const { currentUser, userProfile } = useContext(AuthContext);
  const role = userProfile?.role;
  const [balance, setBalance] = useState({ earnings: 0, pending: 0, total: 0 });
  const [withdrawals, setWithdrawals] = useState([]);
  const [showWithdrawForm, setShowWithdrawForm] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawing, setWithdrawing] = useState(false);
  const [withdrawMsg, setWithdrawMsg] = useState("");

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
      const data = await getUserWithdrawals(currentUser.uid);
      setWithdrawals(data);
    };
    loadBalance();
  }, [currentUser]);

  const handleWithdraw = async () => {
    if (!withdrawAmount || Number(withdrawAmount) <= 0) return;
    setWithdrawing(true);
    try {
      await requestWithdrawal(currentUser.uid, currentUser.email, Number(withdrawAmount), role);
      setWithdrawMsg("Withdrawal request submitted! Admin will review shortly.");
      setWithdrawAmount("");
      setShowWithdrawForm(false);
      const data = await getUserWithdrawals(currentUser.uid);
      setWithdrawals(data);
    } catch (err) {
      console.error("Withdrawal failed:", err);
    } finally {
      setWithdrawing(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.title}>💰 Wallet</h1>
        <p style={styles.subtitle}>
          {role === "creator" ? "Your earnings from product sales" : role === "promoter" ? "Your commission earnings" : "Your balance"}
        </p>

        <div style={styles.balanceCard}>
          <p style={styles.balanceLabel}>Available Balance</p>
          <p style={styles.balanceValue}>${balance.total.toFixed(2)}</p>
          <p style={styles.balanceNote}>Withdrawals are reviewed by admin</p>
        </div>

        <button onClick={() => setShowWithdrawForm(!showWithdrawForm)} style={styles.withdrawBtn}>
          {showWithdrawForm ? "Cancel" : "Request Withdrawal"}
        </button>

        {withdrawMsg && <div style={styles.alertSuccess}>{withdrawMsg}</div>}

        {showWithdrawForm && (
          <div style={styles.withdrawForm}>
            <label style={styles.label}>Amount ($)</label>
            <input type="number" min="1" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} placeholder="0.00" style={styles.input} />
            <button onClick={handleWithdraw} disabled={withdrawing} style={styles.submitBtn}>
              {withdrawing ? "Submitting..." : "Submit Request"}
            </button>
          </div>
        )}

        {withdrawals.length > 0 && (
          <div style={styles.historySection}>
            <h3 style={styles.historyTitle}>Withdrawal History</h3>
            {withdrawals.map((w) => (
              <div key={w.id} style={styles.historyRow}>
                <span>${w.amount.toFixed(2)}</span>
                <span style={{ textTransform: "capitalize", color: w.status === "approved" ? "#4ade80" : w.status === "rejected" ? "#f87171" : "#fbbf24" }}>
                  {w.status}
                </span>
                <span style={{ color: "#64748b", fontSize: "12px" }}>
                  {w.createdAt?.toDate?.().toLocaleDateString() || ""}
                </span>
              </div>
            ))}
          </div>
        )}

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
  withdrawBtn: { display: "block", marginTop: "20px", padding: "12px 20px", borderRadius: "12px", border: "1px solid rgba(79,124,255,0.3)", background: "rgba(79,124,255,0.1)", color: "#a5b4ff", cursor: "pointer", fontWeight: 600, width: "100%" },
  withdrawForm: { marginTop: "16px", padding: "16px", borderRadius: "14px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(79,124,255,0.1)" },
  label: { display: "flex", flexDirection: "column", gap: "6px", fontSize: "14px", color: "#cbd5e1", marginBottom: "10px" },
  input: { borderRadius: "12px", border: "1px solid rgba(148,163,184,0.2)", padding: "12px 14px", fontSize: "14px", background: "rgba(255,255,255,0.04)", color: "#fff", outline: "none", width: "100%" },
  submitBtn: { padding: "12px 16px", borderRadius: "12px", border: "none", background: "linear-gradient(135deg, #4f7cff, #7c3aed)", color: "#fff", cursor: "pointer", fontWeight: 700, width: "100%", marginTop: "10px" },
  historySection: { marginTop: "32px" },
  historyTitle: { fontSize: "20px", marginBottom: "12px" },
  historyRow: { display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" },
  alertSuccess: { padding: "12px 16px", borderRadius: "12px", background: "rgba(34,197,94,0.16)", color: "#bbf7d0", marginTop: "16px" },
  backLink: { display: "inline-block", marginTop: "24px", color: "#a5b4ff", textDecoration: "none" },
};

export default Wallet;