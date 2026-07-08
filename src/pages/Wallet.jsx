import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { requestWithdrawal, getUserWithdrawals } from "../services/withdrawalService";

function Wallet() {
  const { currentUser, userProfile } = useContext(AuthContext);
  const role = userProfile?.role;
  const [balance, setBalance] = useState({ total: 0 });
  const [withdrawals, setWithdrawals] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const load = async () => {
      if (!currentUser) return;
      const snap = await getDoc(doc(db, "users", currentUser.uid));
      if (snap.exists()) setBalance({ total: snap.data().totalRevenue || 0 });
      const data = await getUserWithdrawals(currentUser.uid);
      setWithdrawals(data);
    };
    load();
  }, [currentUser]);

  const handleWithdraw = async () => {
    if (!amount || Number(amount) <= 0) return;
    setLoading(true);
    try {
      await requestWithdrawal(currentUser.uid, currentUser.email, Number(amount), role);
      setMessage("Request submitted! Admin will review shortly.");
      setAmount(""); setShowForm(false);
      const data = await getUserWithdrawals(currentUser.uid);
      setWithdrawals(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const pendingTotal = withdrawals.filter(w => w.status === "pending").reduce((s, w) => s + w.amount, 0);
  const paidTotal = withdrawals.filter(w => w.status === "approved" || w.status === "paid").reduce((s, w) => s + w.amount, 0);

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <Link to="/dashboard" style={styles.back}>← Dashboard</Link>

        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Wallet</h1>
            <p style={styles.subtitle}>{role === "creator" ? "Your creator earnings" : "Your promoter commissions"}</p>
          </div>
        </div>

        {/* Balance Hero */}
        <div style={styles.heroCard}>
          <div style={styles.heroTop}>
            <span style={styles.heroIcon}>💰</span>
            <span style={styles.heroLabel}>Available Balance</span>
          </div>
          <span style={styles.heroAmount}>${balance.total.toFixed(2)}</span>
          <div style={styles.heroStats}>
            <div style={styles.heroStat}>
              <div style={{ ...styles.statDot, background: "#F59E0B" }} />
              <div>
                <span style={styles.statValue}>${pendingTotal.toFixed(2)}</span>
                <span style={styles.statLabel}>Pending</span>
              </div>
            </div>
            <div style={styles.heroStat}>
              <div style={{ ...styles.statDot, background: "#10B981" }} />
              <div>
                <span style={styles.statValue}>${paidTotal.toFixed(2)}</span>
                <span style={styles.statLabel}>Paid Out</span>
              </div>
            </div>
          </div>
          <button onClick={() => setShowForm(!showForm)} style={styles.heroBtn}>
            {showForm ? "Cancel" : "Request Withdrawal"}
          </button>
        </div>

        {message && <div style={styles.success}>{message}</div>}

        {/* Withdraw Form */}
        {showForm && (
          <div style={styles.formCard}>
            <div style={styles.formHeader}>
              <span style={styles.formIcon}>💸</span>
              <div>
                <h3 style={styles.formTitle}>New Withdrawal</h3>
                <p style={styles.formHint}>Min $10. Paid monthly via PayPal or crypto.</p>
              </div>
            </div>
            <div style={styles.formBody}>
              <input type="number" min="1" value={amount} onChange={e => setAmount(e.target.value)} placeholder="Enter amount..." style={styles.input} autoFocus />
              <div style={styles.quickAmounts}>
                {[10, 25, 50, 100].map(a => (
                  <button key={a} onClick={() => setAmount(a.toString())} style={amount === a.toString() ? styles.quickActive : styles.quickBtn}>${a}</button>
                ))}
              </div>
              <button onClick={handleWithdraw} disabled={loading} style={styles.formBtn}>
                {loading ? "Submitting..." : "Submit Request"}
              </button>
            </div>
          </div>
        )}

        {/* Payout Method */}
        <div style={styles.infoCard}>
          <div style={styles.infoHeader}>
            <span style={styles.infoIcon}>🏦</span>
            <span style={styles.infoTitle}>Payout Method</span>
          </div>
          <div style={styles.infoRow}>
            <span style={styles.infoLabel}>PayPal</span>
            <span style={styles.infoValue}>{userProfile?.payoutDetails?.paypalEmail || "Not set"}</span>
          </div>
          <div style={styles.infoRow}>
            <span style={styles.infoLabel}>Crypto</span>
            <span style={styles.infoValue}>{userProfile?.payoutDetails?.cryptoWallet ? "Connected" : "Not set"}</span>
          </div>
          <Link to="/settings" style={styles.infoLink}>Update payout details →</Link>
        </div>

        {/* History */}
        {withdrawals.length > 0 && (
          <div style={styles.history}>
            <h3 style={styles.historyTitle}>Transaction History</h3>
            <div style={styles.historyList}>
              {withdrawals.map(w => (
                <div key={w.id} style={styles.historyCard}>
                  <div style={styles.historyLeft}>
                    <div style={{
                      ...styles.statusDot,
                      background: w.status === "approved" || w.status === "paid" ? "#10B981" : w.status === "rejected" ? "#EF4444" : "#F59E0B"
                    }} />
                    <div>
                      <span style={styles.historyAmount}>${w.amount.toFixed(2)}</span>
                      <span style={styles.historyDate}>{w.createdAt?.toDate?.().toLocaleDateString() || "—"}</span>
                    </div>
                  </div>
                  <span style={{
                    ...styles.statusBadge,
                    color: w.status === "approved" || w.status === "paid" ? "#065F46" : w.status === "rejected" ? "#991B1B" : "#92400E",
                    background: w.status === "approved" || w.status === "paid" ? "#D1FAE5" : w.status === "rejected" ? "#FEE2E2" : "#FEF3C7"
                  }}>{w.status}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {withdrawals.length === 0 && (
          <div style={styles.empty}>
            <span style={styles.emptyIcon}>💳</span>
            <h3 style={styles.emptyTitle}>No transactions yet</h3>
            <p style={styles.emptyText}>When you request a withdrawal, it'll show up here.</p>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: { fontFamily: "'Inter', sans-serif", background: "linear-gradient(180deg, #F8F9FC 0%, #EEF0F5 100%)", minHeight: "100vh", padding: "40px 24px" },
  container: { maxWidth: "520px", margin: "0 auto" },
  back: { color: "#6C5CE7", textDecoration: "none", fontSize: "13px", fontWeight: 500 },
  header: { marginTop: "14px", marginBottom: "24px" },
  title: { fontSize: "30px", fontWeight: 700, color: "#1A1D26", margin: 0 },
  subtitle: { color: "#6B7280", marginTop: "2px", fontSize: "14px" },

  // Hero
  heroCard: { background: "#fff", border: "1px solid #E8EAEF", borderRadius: "20px", padding: "28px", textAlign: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.03)", marginBottom: "16px" },
  heroTop: { display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginBottom: "8px" },
  heroIcon: { fontSize: "20px" },
  heroLabel: { color: "#6B7280", fontSize: "13px", fontWeight: 500 },
  heroAmount: { display: "block", fontSize: "44px", fontWeight: 800, color: "#1A1D26", margin: "4px 0" },
  heroStats: { display: "flex", justifyContent: "center", gap: "28px", marginTop: "16px", marginBottom: "20px" },
  heroStat: { display: "flex", alignItems: "center", gap: "8px" },
  statDot: { width: "8px", height: "8px", borderRadius: "50%", flexShrink: 0 },
  statValue: { display: "block", fontWeight: 600, fontSize: "14px", color: "#1A1D26" },
  statLabel: { display: "block", color: "#9CA3AF", fontSize: "11px" },
  heroBtn: { padding: "10px 24px", borderRadius: "10px", border: "none", background: "#6C5CE7", color: "#fff", fontWeight: 600, fontSize: "14px", cursor: "pointer" },

  success: { padding: "12px 16px", borderRadius: "10px", background: "#ECFDF5", border: "1px solid #A7F3D0", color: "#065F46", fontSize: "13px", marginBottom: "16px" },

  // Form
  formCard: { background: "#fff", border: "1px solid #E8EAEF", borderRadius: "16px", padding: "20px", marginBottom: "16px", boxShadow: "0 2px 8px rgba(0,0,0,0.03)" },
  formHeader: { display: "flex", alignItems: "center", gap: "12px", marginBottom: "14px" },
  formIcon: { fontSize: "22px" },
  formTitle: { fontSize: "15px", fontWeight: 600, color: "#1A1D26", margin: 0 },
  formHint: { color: "#9CA3AF", fontSize: "12px", marginTop: "2px" },
  formBody: {},
  input: { width: "100%", padding: "12px 14px", borderRadius: "10px", border: "1px solid #E0E3E8", fontSize: "15px", outline: "none", background: "#F8F9FC", color: "#1A1D26", marginBottom: "10px", boxSizing: "border-box" },
  quickAmounts: { display: "flex", gap: "8px", marginBottom: "14px" },
  quickBtn: { flex: 1, padding: "8px", borderRadius: "8px", border: "1px solid #E5E7EB", background: "#fff", color: "#6B7280", fontWeight: 500, fontSize: "13px", cursor: "pointer" },
  quickActive: { flex: 1, padding: "8px", borderRadius: "8px", border: "1px solid #6C5CE7", background: "#F5F3FF", color: "#6C5CE7", fontWeight: 600, fontSize: "13px", cursor: "pointer" },
  formBtn: { width: "100%", padding: "11px", borderRadius: "10px", border: "none", background: "#6C5CE7", color: "#fff", fontWeight: 600, fontSize: "14px", cursor: "pointer" },

  // Payout info
  infoCard: { background: "#fff", border: "1px solid #E8EAEF", borderRadius: "14px", padding: "18px", marginBottom: "16px", boxShadow: "0 2px 8px rgba(0,0,0,0.03)" },
  infoHeader: { display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" },
  infoIcon: { fontSize: "18px" },
  infoTitle: { fontWeight: 600, fontSize: "14px", color: "#1A1D26" },
  infoRow: { display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #F3F4F6", fontSize: "13px" },
  infoLabel: { color: "#6B7280" },
  infoValue: { color: "#1A1D26", fontWeight: 500 },
  infoLink: { display: "inline-block", marginTop: "10px", color: "#6C5CE7", textDecoration: "none", fontSize: "13px", fontWeight: 500 },

  // History
  history: { marginTop: "8px" },
  historyTitle: { fontSize: "16px", fontWeight: 600, color: "#1A1D26", marginBottom: "10px" },
  historyList: { display: "flex", flexDirection: "column", gap: "8px" },
  historyCard: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderRadius: "12px", background: "#fff", border: "1px solid #E8EAEF" },
  historyLeft: { display: "flex", alignItems: "center", gap: "10px" },
  statusDot: { width: "8px", height: "8px", borderRadius: "50%", flexShrink: 0 },
  historyAmount: { display: "block", fontWeight: 600, fontSize: "14px", color: "#1A1D26" },
  historyDate: { display: "block", color: "#9CA3AF", fontSize: "11px", marginTop: "1px" },
  statusBadge: { padding: "4px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 600, textTransform: "capitalize" },

  // Empty
  empty: { textAlign: "center", padding: "40px 20px" },
  emptyIcon: { fontSize: "36px", display: "block", marginBottom: "10px" },
  emptyTitle: { fontSize: "17px", fontWeight: 600, color: "#1A1D26", margin: 0 },
  emptyText: { color: "#6B7280", fontSize: "13px", marginTop: "4px" },
};

export default Wallet;