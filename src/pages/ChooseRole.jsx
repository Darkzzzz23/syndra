import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/config";

function ChooseRole() {
  const { currentUser, refreshUserProfile } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPayout, setShowPayout] = useState(false);
  const [selectedRole, setSelectedRole] = useState("");
  const [payoutDetails, setPayoutDetails] = useState({ paypalEmail: "", cryptoWallet: "" });

  const saveRole = async (role, payout) => {
    if (!currentUser) return;
    setLoading(true); setError("");
    try {
      const userRef = doc(db, "users", currentUser.uid);
      const data = { role, updatedAt: serverTimestamp() };
      if (role === "creator") data.creatorStatus = "pending_review";
      if (payout.paypalEmail || payout.cryptoWallet) data.payoutDetails = payout;
      await setDoc(userRef, data, { merge: true });
      await refreshUserProfile();
      navigate(role === "buyer" ? "/marketplace" : "/dashboard");
    } catch (err) { setError("Something went wrong."); }
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
        <div style={styles.card}>
          <h2 style={styles.title}>How would you like to get paid?</h2>
          <p style={styles.subtitle}>You can change this later in Settings</p>
          <label style={styles.label}>PayPal Email
            <input value={payoutDetails.paypalEmail} onChange={e => setPayoutDetails({ ...payoutDetails, paypalEmail: e.target.value })} placeholder="you@example.com" style={styles.input} />
          </label>
          <label style={styles.label}>Crypto Wallet (optional)
            <input value={payoutDetails.cryptoWallet} onChange={e => setPayoutDetails({ ...payoutDetails, cryptoWallet: e.target.value })} placeholder="BTC/ETH/USDT address" style={styles.input} />
          </label>
          <div style={styles.buttons}>
            <button onClick={() => setShowPayout(false)} style={styles.btnSkip}>Skip for now</button>
            <button onClick={() => saveRole(selectedRole, payoutDetails)} disabled={loading} style={styles.btnSave}>
              {loading ? "Saving..." : `Continue as ${selectedRole}`}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.heroTitle}>What brings you to Syndra?</h1>
        <p style={styles.heroSub}>Choose your path — you can always switch later</p>

        {error && <div style={styles.error}>{error}</div>}

        <div style={styles.grid}>
          <div onClick={() => !loading && handleSelect("creator")} style={styles.optionCard}>
            <span style={styles.icon}>🎨</span>
            <h3 style={styles.optionTitle}>I create things</h3>
            <p style={styles.optionDesc}>Sell your art, worksheets, templates, and digital products. You keep 70%.</p>
          </div>
          <div onClick={() => !loading && handleSelect("promoter")} style={styles.optionCard}>
            <span style={styles.icon}>📣</span>
            <h3 style={styles.optionTitle}>I share things</h3>
            <p style={styles.optionDesc}>Earn commission by sharing products you love. No inventory needed.</p>
          </div>
          <div onClick={() => !loading && handleSelect("buyer")} style={styles.optionCard}>
            <span style={styles.icon}>🛍️</span>
            <h3 style={styles.optionTitle}>I want to shop</h3>
            <p style={styles.optionDesc}>Browse and buy digital products from creators around the world.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "linear-gradient(180deg, #F8F9FC 0%, #EEF0F5 100%)", fontFamily: "'Inter', sans-serif", padding: "40px 24px" },
  container: { maxWidth: "700px", width: "100%", textAlign: "center" },
  heroTitle: { fontSize: "32px", fontWeight: 700, color: "#1A1D26", margin: 0 },
  heroSub: { color: "#6B7280", marginTop: "8px", fontSize: "15px" },
  error: { marginTop: "16px", padding: "12px", borderRadius: "10px", background: "#FEF2F2", color: "#EF4444", fontSize: "13px" },
  grid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginTop: "32px" },
  optionCard: { padding: "28px 20px", borderRadius: "16px", background: "#fff", border: "1px solid #E8EAEF", cursor: "pointer", transition: "box-shadow 0.15s", textAlign: "center" },
  icon: { fontSize: "36px", display: "block", marginBottom: "12px" },
  optionTitle: { fontSize: "17px", fontWeight: 600, margin: "0 0 6px", color: "#1A1D26" },
  optionDesc: { color: "#6B7280", fontSize: "13px", lineHeight: 1.5, margin: 0 },
  card: { background: "#fff", border: "1px solid #E8EAEF", borderRadius: "20px", padding: "36px 28px", maxWidth: "440px", width: "100%", boxShadow: "0 4px 24px rgba(0,0,0,0.04)", textAlign: "center" },
  title: { fontSize: "22px", fontWeight: 700, margin: 0, color: "#1A1D26" },
  subtitle: { color: "#6B7280", marginTop: "6px", fontSize: "14px", marginBottom: "20px" },
  label: { display: "flex", flexDirection: "column", gap: "6px", fontSize: "13px", color: "#4B5563", fontWeight: 500, textAlign: "left", marginBottom: "12px" },
  input: { padding: "12px 14px", borderRadius: "10px", border: "1px solid #E0E3E8", fontSize: "14px", outline: "none", background: "#F8F9FC" },
  buttons: { display: "flex", gap: "10px", marginTop: "20px" },
  btnSkip: { flex: 1, padding: "12px", borderRadius: "10px", border: "1px solid #E0E3E8", background: "#fff", color: "#6B7280", fontWeight: 500, cursor: "pointer", fontSize: "14px" },
  btnSave: { flex: 2, padding: "12px", borderRadius: "10px", border: "none", background: "#6C5CE7", color: "#fff", fontWeight: 600, cursor: "pointer", fontSize: "14px" },
};

export default ChooseRole;