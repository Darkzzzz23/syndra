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
  const [showBankForm, setShowBankForm] = useState(false);
  const [selectedRole, setSelectedRole] = useState("");
  const [bankDetails, setBankDetails] = useState({
    paypalEmail: "",
    cryptoWallet: "",
  });

  const saveRole = async (role, bankInfo) => {
    if (!currentUser) return;
    setLoading(true);
    setError("");

    try {
      const userRef = doc(db, "users", currentUser.uid);
      const updateData = {
        role,
        updatedAt: serverTimestamp(),
      };

      if (role === "creator") {
        updateData.creatorStatus = "pending_review";
      }

      if (bankInfo.paypalEmail || bankInfo.cryptoWallet) {
        updateData.payoutDetails = bankInfo;
      }

      await setDoc(userRef, updateData, { merge: true });
      await refreshUserProfile();
      navigate("/dashboard");
    } catch (err) {
      console.error("Failed to set role:", err);
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  const handleSelect = (role) => {
    if (role === "buyer") {
      saveRole(role, {});
      return;
    }
    setSelectedRole(role);
    setShowBankForm(true);
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.title}>Choose Your Path</h1>
        <p style={styles.subtitle}>What would you like to do on Syndra?</p>

        {error && <div style={styles.alertError}>{error}</div>}

        {showBankForm ? (
          <div style={styles.bankForm}>
            <h2 style={styles.bankTitle}>Payout Details</h2>
            <p style={styles.bankSubtitle}>
              How would you like to receive your earnings? You can change this later in Settings.
            </p>

            <label style={styles.label}>
              PayPal Email
              <input
                value={bankDetails.paypalEmail}
                onChange={(e) => setBankDetails({ ...bankDetails, paypalEmail: e.target.value })}
                placeholder="you@example.com"
                style={styles.input}
              />
            </label>

            <label style={styles.label}>
              Crypto Wallet (optional)
              <input
                value={bankDetails.cryptoWallet}
                onChange={(e) => setBankDetails({ ...bankDetails, cryptoWallet: e.target.value })}
                placeholder="BTC/ETH/USDT wallet address"
                style={styles.input}
              />
            </label>

            <p style={styles.hint}>We currently support PayPal and cryptocurrency payouts. More options coming soon.</p>

            <div style={styles.bankButtons}>
              <button onClick={() => setShowBankForm(false)} style={styles.skipBtn}>
                Skip for now
              </button>
              <button onClick={() => saveRole(selectedRole, bankDetails)} disabled={loading} style={styles.saveBtn}>
                {loading ? "Saving…" : `Continue as ${selectedRole === "creator" ? "Creator" : "Promoter"}`}
              </button>
            </div>
          </div>
        ) : (
          <div style={styles.grid}>
            <div style={styles.card} onClick={() => !loading && handleSelect("creator")}>
              <div style={styles.icon}>🎨</div>
              <h2 style={styles.cardTitle}>Creator</h2>
              <p style={styles.cardDesc}>Upload and sell your digital products — worksheets, ebooks, art, templates, and more.</p>
              <ul style={styles.features}><li>Upload digital products</li><li>Set your own prices</li><li>Earn 70% per sale</li></ul>
              <button disabled={loading} style={styles.cardBtn}>{loading ? "Saving…" : "I'm a Creator"}</button>
            </div>

            <div style={{ ...styles.card, ...styles.cardFeatured }}>
              <div style={styles.icon}>📣</div>
              <h2 style={styles.cardTitle}>Promoter</h2>
              <p style={styles.cardDesc}>Share products you believe in. Earn 20% commission on every sale.</p>
              <ul style={styles.features}><li>Get unique referral links</li><li>Track clicks & sales</li><li>Earn 20% commission</li></ul>
              <button disabled={loading} style={styles.cardBtn}>{loading ? "Saving…" : "I'm a Promoter"}</button>
            </div>

            <div style={styles.card} onClick={() => !loading && handleSelect("buyer")}>
              <div style={styles.icon}>🛍️</div>
              <h2 style={styles.cardTitle}>Buyer</h2>
              <p style={styles.cardDesc}>Discover and purchase high-quality digital products from talented creators.</p>
              <ul style={styles.features}><li>Browse the marketplace</li><li>Instant downloads</li><li>Support creators</li></ul>
              <button disabled={loading} style={styles.cardBtn}>{loading ? "Saving…" : "I'm a Buyer"}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: "calc(100vh - 70px)", padding: "60px 24px", color: "#fff", background: "linear-gradient(180deg, #05070d 0%, #0f172a 100%)", fontFamily: "Inter, sans-serif", display: "flex", justifyContent: "center", alignItems: "center" },
  container: { maxWidth: "1000px", width: "100%", textAlign: "center" },
  title: { fontSize: "42px", margin: 0, background: "linear-gradient(135deg, #ffffff, #a5b4ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" },
  subtitle: { color: "#94a3b8", fontSize: "18px", marginTop: "12px", marginBottom: "40px" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px" },
  card: { padding: "36px 28px", borderRadius: "24px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(79,124,255,0.14)", textAlign: "left", cursor: "pointer", display: "flex", flexDirection: "column" },
  cardFeatured: { border: "1px solid rgba(79,124,255,0.35)", background: "rgba(79,124,255,0.06)" },
  icon: { fontSize: "40px", marginBottom: "16px" },
  cardTitle: { fontSize: "24px", margin: 0 },
  cardDesc: { color: "#cbd5e1", lineHeight: 1.7, marginTop: "12px", flex: 1 },
  features: { color: "#94a3b8", fontSize: "14px", lineHeight: 2, paddingLeft: "20px", marginTop: "16px" },
  cardBtn: { marginTop: "20px", padding: "14px 20px", borderRadius: "14px", border: "none", background: "linear-gradient(135deg, #4f7cff, #7c3aed)", color: "#fff", cursor: "pointer", fontWeight: 700, fontSize: "15px", width: "100%" },
  bankForm: { maxWidth: "460px", margin: "0 auto", padding: "32px", borderRadius: "20px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(79,124,255,0.14)", textAlign: "left" },
  bankTitle: { fontSize: "24px", margin: 0, textAlign: "center" },
  bankSubtitle: { color: "#94a3b8", textAlign: "center", marginTop: "8px", marginBottom: "24px", fontSize: "14px" },
  label: { display: "flex", flexDirection: "column", gap: "6px", fontSize: "14px", color: "#cbd5e1", marginBottom: "14px" },
  input: { borderRadius: "12px", border: "1px solid rgba(148,163,184,0.2)", padding: "12px 14px", fontSize: "14px", background: "rgba(255,255,255,0.04)", color: "#fff", outline: "none" },
  hint: { color: "#64748b", fontSize: "12px", textAlign: "center", marginTop: "4px" },
  bankButtons: { display: "flex", gap: "12px", marginTop: "24px" },
  skipBtn: { flex: 1, padding: "14px 20px", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "#94a3b8", cursor: "pointer", fontWeight: 600, fontSize: "14px" },
  saveBtn: { flex: 2, padding: "14px 20px", borderRadius: "14px", border: "none", background: "linear-gradient(135deg, #4f7cff, #7c3aed)", color: "#fff", cursor: "pointer", fontWeight: 700, fontSize: "14px" },
  alertError: { padding: "14px 18px", borderRadius: "16px", background: "rgba(248,113,113,0.16)", color: "#fecaca", marginBottom: "24px" },
};

export default ChooseRole;