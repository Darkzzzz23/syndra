import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/config";

function ChooseRole() {
  const { currentUser, refreshUserProfile } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPayout, setShowPayout] = useState(false);
  const [selectedRole, setSelectedRole] = useState("");
  const [payoutDetails, setPayoutDetails] = useState({ paypalEmail: "", cryptoWallet: "" });

  const saveRole = async (role, payout) => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const data = { role, updatedAt: serverTimestamp() };
      if (role === "creator") data.creatorStatus = "pending_review";
      if (payout.paypalEmail || payout.cryptoWallet) data.payoutDetails = payout;
      await setDoc(doc(db, "users", currentUser.uid), data, { merge: true });
      await refreshUserProfile();
      navigate(role === "buyer" ? "/marketplace" : "/dashboard");
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleSelect = (role) => {
    if (role === "buyer") { saveRole(role, {}); return; }
    setSelectedRole(role);
    setShowPayout(true);
  };

  if (showPayout) {
    return (
      <div style={styles.page}>
        <div style={styles.formCard}>
          <h2 style={styles.formTitle}>Payout Details</h2>
          <p style={styles.formSub}>How would you like to receive your earnings?</p>
          <label style={styles.label}>PayPal Email</label>
          <input value={payoutDetails.paypalEmail} onChange={e => setPayoutDetails({ ...payoutDetails, paypalEmail: e.target.value })} placeholder="you@example.com" style={styles.input} />
          <label style={styles.label}>Crypto Wallet (optional)</label>
          <input value={payoutDetails.cryptoWallet} onChange={e => setPayoutDetails({ ...payoutDetails, cryptoWallet: e.target.value })} placeholder="BTC/ETH/USDT address" style={styles.input} />
          <div style={styles.btns}>
            <button onClick={() => setShowPayout(false)} style={styles.skipBtn}>Skip</button>
            <button onClick={() => saveRole(selectedRole, payoutDetails)} disabled={loading} style={styles.saveBtn}>{loading ? "Saving..." : `Continue as ${selectedRole}`}</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.title}>What brings you to Syndra?</h1>
        <p style={styles.sub}>Choose your path — you can always switch later</p>
        <div style={styles.grid}>
          {[
            { icon: "🎨", title: "I create prompts", desc: "Sell your AI prompts, ChatGPT workflows, and automation templates. Keep 70%.", role: "creator" },
            { icon: "📣", title: "I share prompts", desc: "Earn commission by sharing AI prompts you believe in. No inventory needed.", role: "promoter" },
            { icon: "🛍️", title: "I want to buy", desc: "Browse and purchase AI prompts from creators around the world.", role: "buyer" },
          ].map(item => (
            <div key={item.role} onClick={() => !loading && handleSelect(item.role)} style={styles.roleCard}>
              <span style={styles.icon}>{item.icon}</span>
              <h3 style={styles.roleTitle}>{item.title}</h3>
              <p style={styles.roleDesc}>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#0A0E17", fontFamily: "'Inter', sans-serif", padding: "40px 24px" },
  container: { maxWidth: "700px", textAlign: "center" },
  title: { fontSize: "32px", fontWeight: 700, letterSpacing: "-0.01em", margin: "0 0 8px" },
  sub: { color: "#94A3B8", fontSize: "15px", marginBottom: "40px" },
  grid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" },
  roleCard: { padding: "32px 20px", borderRadius: "8px", background: "#1A1F2E", border: "1px solid #2D3548", cursor: "pointer", transition: "all 0.2s", textAlign: "center" },
  icon: { fontSize: "36px", display: "block", marginBottom: "16px" },
  roleTitle: { fontSize: "17px", fontWeight: 600, margin: "0 0 8px" },
  roleDesc: { color: "#94A3B8", fontSize: "13px", lineHeight: 1.5, margin: 0 },
  formCard: { background: "#1A1F2E", border: "1px solid #2D3548", borderRadius: "8px", padding: "32px", maxWidth: "440px", width: "100%" },
  formTitle: { fontSize: "22px", fontWeight: 700, margin: "0 0 4px", textAlign: "center" },
  formSub: { color: "#94A3B8", fontSize: "14px", textAlign: "center", marginBottom: "24px" },
  label: { display: "block", fontSize: "13px", fontWeight: 600, color: "#F8FAFB", marginBottom: "6px" },
  input: { width: "100%", padding: "12px 14px", borderRadius: "6px", border: "1px solid #2D3548", background: "#0A0E17", color: "#F8FAFB", fontSize: "14px", outline: "none", marginBottom: "16px", boxSizing: "border-box" },
  btns: { display: "flex", gap: "12px" },
  skipBtn: { flex: 1, padding: "12px", borderRadius: "6px", border: "1px solid #2D3548", background: "transparent", color: "#CBD5E1", cursor: "pointer", fontWeight: 600 },
  saveBtn: { flex: 2, padding: "12px", borderRadius: "6px", border: "none", background: "#06B6D4", color: "#0A0E17", cursor: "pointer", fontWeight: 600 },
};

export default ChooseRole;