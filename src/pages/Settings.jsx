import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { updateUserProfile, changeUserRole, deleteUserAccount } from "../services/userService";
import { uploadProductFile } from "../services/productService";

function Settings() {
  const { currentUser, userProfile, logout, refreshUserProfile } = useContext(AuthContext);
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState(userProfile?.displayName || "");
  const [bio, setBio] = useState(userProfile?.bio || "");
  const [profileImage, setProfileImage] = useState(null);
  const [paypalEmail, setPaypalEmail] = useState(userProfile?.payoutDetails?.paypalEmail || "");
  const [cryptoWallet, setCryptoWallet] = useState(userProfile?.payoutDetails?.cryptoWallet || "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    setSaving(true); setError(""); setSaved(false);
    try {
      let img = userProfile?.profileImage || "";
      if (profileImage) img = await uploadProductFile(currentUser.uid, profileImage);
      await updateUserProfile(currentUser.uid, { displayName, bio, profileImage: img, payoutDetails: { paypalEmail, cryptoWallet } });
      await refreshUserProfile();
      setSaved(true); setTimeout(() => setSaved(false), 2000);
    } catch (err) { setError("Failed to save."); }
    finally { setSaving(false); }
  };

  const handleRoleChange = async (role) => {
    if (!window.confirm(`Switch to ${role}?`)) return;
    try { await changeUserRole(currentUser.uid, role); await refreshUserProfile(); navigate("/dashboard"); }
    catch (err) { setError("Failed to change role."); }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete your account permanently?")) return;
    if (!window.confirm("This cannot be undone. Sure?")) return;
    try { await deleteUserAccount(currentUser.uid); await logout(); navigate("/"); }
    catch (err) { setError("Failed to delete."); }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <Link to="/dashboard" style={styles.back}>← Dashboard</Link>
        <h1 style={styles.title}>Settings</h1>

        {error && <div style={styles.error}>{error}</div>}
        {saved && <div style={styles.success}>Saved ✓</div>}

        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Profile</h2>
          <label style={styles.label}>Display Name</label>
          <input value={displayName} onChange={e => setDisplayName(e.target.value)} style={styles.input} />
          <label style={styles.label}>Bio</label>
          <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3} style={{ ...styles.input, resize: "none", fontFamily: "'Inter', sans-serif" }} />
          <label style={styles.label}>Profile Image</label>
          <input type="file" accept="image/*" onChange={e => setProfileImage(e.target.files?.[0] || null)} style={{ color: "#94A3B8", fontSize: "13px" }} />
        </div>

        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Payout Details</h2>
          <label style={styles.label}>PayPal Email</label>
          <input value={paypalEmail} onChange={e => setPaypalEmail(e.target.value)} placeholder="you@example.com" style={styles.input} />
          <label style={styles.label}>Crypto Wallet</label>
          <input value={cryptoWallet} onChange={e => setCryptoWallet(e.target.value)} placeholder="BTC/ETH/USDT address" style={styles.input} />
        </div>

        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Switch Role</h2>
          <div style={{ display: "flex", gap: "8px" }}>
            {["creator", "promoter", "buyer"].map(r => (
              <button key={r} onClick={() => handleRoleChange(r)} style={styles.roleBtn}>{r}</button>
            ))}
          </div>
        </div>

        <button onClick={handleSave} disabled={saving} style={styles.saveBtn}>{saving ? "Saving..." : "Save Changes"}</button>

        <div style={{ ...styles.card, borderColor: "rgba(239,68,68,0.3)" }}>
          <h2 style={{ ...styles.cardTitle, color: "#EF4444" }}>Danger Zone</h2>
          <p style={{ color: "#94A3B8", fontSize: "13px", marginBottom: "12px" }}>Permanently delete your account.</p>
          <button onClick={handleDelete} style={styles.deleteBtn}>Delete Account</button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { background: "#0A0E17", color: "#F8FAFB", fontFamily: "'Inter', sans-serif", minHeight: "100vh", padding: "60px 32px" },
  container: { maxWidth: "560px", margin: "0 auto" },
  back: { color: "#06B6D4", textDecoration: "none", fontSize: "14px" },
  title: { fontSize: "28px", fontWeight: 700, margin: "12px 0 24px" },
  error: { padding: "10px 14px", borderRadius: "6px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#EF4444", fontSize: "13px", marginBottom: "12px" },
  success: { padding: "10px 14px", borderRadius: "6px", background: "rgba(16,185,129,0.1)", border: "1px solid #10B981", color: "#10B981", fontSize: "13px", marginBottom: "12px" },
  card: { background: "#1A1F2E", border: "1px solid #2D3548", borderRadius: "8px", padding: "20px", marginBottom: "16px" },
  cardTitle: { fontSize: "16px", fontWeight: 600, margin: "0 0 16px" },
  label: { display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px", marginTop: "12px" },
  input: { width: "100%", padding: "10px 14px", borderRadius: "6px", border: "1px solid #2D3548", background: "#0A0E17", color: "#F8FAFB", fontSize: "14px", outline: "none", boxSizing: "border-box" },
  roleBtn: { padding: "8px 16px", borderRadius: "6px", border: "1px solid #2D3548", background: "transparent", color: "#CBD5E1", cursor: "pointer", fontSize: "13px", textTransform: "capitalize" },
  saveBtn: { width: "100%", padding: "12px", borderRadius: "6px", border: "none", background: "#06B6D4", color: "#0A0E17", fontWeight: 600, fontSize: "14px", cursor: "pointer", marginBottom: "16px" },
  deleteBtn: { padding: "8px 16px", borderRadius: "6px", border: "1px solid rgba(239,68,68,0.3)", background: "transparent", color: "#EF4444", cursor: "pointer", fontWeight: 600, fontSize: "13px" },
};

export default Settings;