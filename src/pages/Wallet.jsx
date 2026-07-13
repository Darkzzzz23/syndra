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
      setWithdrawals(await getUserWithdrawals(currentUser.uid));
    };
    load();
  }, [currentUser]);

  const handleWithdraw = async () => {
    if (!amount || Number(amount) <= 0) return;
    setLoading(true);
    try {
      await requestWithdrawal(currentUser.uid, currentUser.email, Number(amount), role);
      setMessage("Request submitted!");
      setAmount(""); setShowForm(false);
      setWithdrawals(await getUserWithdrawals(currentUser.uid));
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const pendingTotal = withdrawals.filter(w => w.status === "pending").reduce((s, w) => s + w.amount, 0);
  const paidTotal = withdrawals.filter(w => w.status === "approved" || w.status === "paid").reduce((s, w) => s + w.amount, 0);

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <Link to="/dashboard" style={styles.back}>← Dashboard</Link>
        <h1 style={styles.title}>Wallet</h1>
        <p style={styles.sub}>{role === "creator" ? "Your prompt earnings" : "Your commission earnings"}</p>

        <div style={styles.heroCard}>
          <div style={styles.heroGlow} />
          <span style={styles.heroLabel}>Available Balance</span>
          <span style={styles.heroAmount}>${balance.total.toFixed(2)}</span>
          <div style={styles.heroStats}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#D97706" }} />
              <div><span style={{ fontWeight: 600, fontSize: "14px" }}>${pendingTotal.toFixed(2)}</span><span style={{ display: "block", color: "#94A3B8", fontSize: "11px" }}>Pending</span></div>
            </div>
            <div style={{ width: "1px", height: "28px", background: "#2D3548" }} />
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10B981" }} />
              <div><span style={{ fontWeight: 600, fontSize: "14px" }}>${paidTotal.toFixed(2)}</span><span style={{ display: "block", color: "#94A3B8", fontSize: "11px" }}>Paid Out</span></div>
            </div>
          </div>
          <button onClick={() => setShowForm(!showForm)} style={styles.heroBtn}>{showForm ? "Cancel" : "Request Withdrawal"}</button>
        </div>

        {message && <div style={styles.success}>{message}</div>}

        {showForm && (
          <div style={styles.formCard}>
            <label style={styles.label}>Amount ($)</label>
            <input type="number" min="1" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" style={styles.input} autoFocus />
            <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
              {[10, 25, 50, 100].map(a => <button key={a} onClick={() => setAmount(a.toString())} style={amount === a.toString() ? styles.quickActive : styles.quickBtn}>${a}</button>)}
            </div>
            <button onClick={handleWithdraw} disabled={loading} style={styles.formBtn}>{loading ? "Submitting..." : "Submit Request"}</button>
          </div>
        )}

        <div style={styles.infoCard}>
          <h3 style={{ fontSize: "14px", fontWeight: 600, marginBottom: "12px" }}>Payout Method</h3>
          <div style={styles.infoRow}><span style={{ color: "#94A3B8" }}>PayPal</span><span>{userProfile?.payoutDetails?.paypalEmail || "Not set"}</span></div>
          <div style={styles.infoRow}><span style={{ color: "#94A3B8" }}>Crypto</span><span>{userProfile?.payoutDetails?.cryptoWallet ? "Connected" : "Not set"}</span></div>
          <Link to="/settings" style={{ color: "#06B6D4", fontSize: "13px", textDecoration: "none" }}>Update →</Link>
        </div>

        {withdrawals.length > 0 && (
          <div style={styles.history}>
            <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "12px" }}>History</h3>
            {withdrawals.map(w => (
              <div key={w.id} style={styles.historyRow}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: w.status === "approved" || w.status === "paid" ? "#10B981" : w.status === "rejected" ? "#EF4444" : "#D97706" }} />
                  <div><span style={{ fontWeight: 600, fontSize: "14px" }}>${w.amount.toFixed(2)}</span><span style={{ display: "block", color: "#94A3B8", fontSize: "11px" }}>{w.createdAt?.toDate?.().toLocaleDateString()}</span></div>
                </div>
                <span style={{ padding: "4px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 600, textTransform: "capitalize", background: w.status === "approved" || w.status === "paid" ? "rgba(16,185,129,0.15)" : w.status === "rejected" ? "rgba(239,68,68,0.15)" : "rgba(217,119,6,0.15)", color: w.status === "approved" || w.status === "paid" ? "#10B981" : w.status === "rejected" ? "#EF4444" : "#D97706" }}>{w.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: { background: "#0A0E17", color: "#F8FAFB", fontFamily: "'Inter', sans-serif", minHeight: "100vh", padding: "60px 32px" },
  container: { maxWidth: "520px", margin: "0 auto" },
  back: { color: "#06B6D4", textDecoration: "none", fontSize: "14px" },
  title: { fontSize: "28px", fontWeight: 700, margin: "12px 0 4px" },
  sub: { color: "#94A3B8", fontSize: "14px", marginBottom: "28px" },
  heroCard: { background: "#1A1F2E", border: "1px solid #2D3548", borderRadius: "12px", padding: "28px", textAlign: "center", position: "relative", overflow: "hidden", marginBottom: "16px" },
  heroGlow: { position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: "200px", height: "2px", background: "linear-gradient(90deg, transparent, #06B6D4, transparent)" },
  heroLabel: { display: "block", color: "#94A3B8", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" },
  heroAmount: { display: "block", fontSize: "44px", fontWeight: 700, marginBottom: "16px" },
  heroStats: { display: "flex", justifyContent: "center", gap: "24px", marginBottom: "20px" },
  heroBtn: { padding: "10px 24px", borderRadius: "6px", border: "none", background: "#06B6D4", color: "#0A0E17", fontWeight: 600, fontSize: "14px", cursor: "pointer" },
  success: { padding: "10px 14px", borderRadius: "6px", background: "rgba(16,185,129,0.1)", border: "1px solid #10B981", color: "#10B981", fontSize: "13px", marginBottom: "16px" },
  formCard: { background: "#1A1F2E", border: "1px solid #2D3548", borderRadius: "8px", padding: "20px", marginBottom: "16px" },
  label: { display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px" },
  input: { width: "100%", padding: "12px 14px", borderRadius: "6px", border: "1px solid #2D3548", background: "#0A0E17", color: "#F8FAFB", fontSize: "14px", outline: "none", marginBottom: "10px", boxSizing: "border-box" },
  quickBtn: { flex: 1, padding: "8px", borderRadius: "6px", border: "1px solid #2D3548", background: "transparent", color: "#CBD5E1", cursor: "pointer", fontSize: "13px", fontWeight: 500 },
  quickActive: { flex: 1, padding: "8px", borderRadius: "6px", border: "1px solid #06B6D4", background: "rgba(6,182,212,0.1)", color: "#06B6D4", cursor: "pointer", fontSize: "13px", fontWeight: 600 },
  formBtn: { width: "100%", padding: "12px", borderRadius: "6px", border: "none", background: "#06B6D4", color: "#0A0E17", fontWeight: 600, fontSize: "14px", cursor: "pointer" },
  infoCard: { background: "#1A1F2E", border: "1px solid #2D3548", borderRadius: "8px", padding: "18px", marginBottom: "16px" },
  infoRow: { display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid rgba(45,53,72,0.5)", fontSize: "13px" },
  history: { marginTop: "8px" },
  historyRow: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderRadius: "8px", background: "#1A1F2E", border: "1px solid #2D3548", marginBottom: "8px" },
};

export default Wallet;