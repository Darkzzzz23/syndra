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
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true); setError(""); setMessage("");
    try {
      let profileImageUrl = userProfile?.profileImage || "";
      if (profileImage) profileImageUrl = await uploadProductFile(currentUser.uid, profileImage);
      await updateUserProfile(currentUser.uid, { displayName, bio, profileImage: profileImageUrl, payoutDetails: { paypalEmail, cryptoWallet } });
      await refreshUserProfile();
      setMessage("Profile updated!");
    } catch (err) { setError("Failed to update profile."); }
    finally { setSaving(false); }
  };

  const handleRoleChange = async (newRole) => {
    if (!window.confirm(`Switch to ${newRole}?`)) return;
    try { await changeUserRole(currentUser.uid, newRole); await refreshUserProfile(); navigate("/dashboard"); }
    catch (err) { setError("Failed to change role."); }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete your account permanently?")) return;
    if (!window.confirm("This cannot be undone. Are you sure?")) return;
    try { await deleteUserAccount(currentUser.uid); await logout(); navigate("/"); }
    catch (err) { setError("Failed to delete account."); }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.title}>Settings</h1>

        {message && <div style={styles.success}>{message}</div>}
        {error && <div style={styles.error}>{error}</div>}

        {/* Profile */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Profile</h2>
          <form onSubmit={handleSaveProfile} style={styles.form}>
            <label style={styles.label}>Display Name
              <input value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Your name" style={styles.input} />
            </label>
            <label style={styles.label}>Bio
              <textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="About you..." style={{ ...styles.input, minHeight: "70px" }} />
            </label>
            <label style={styles.label}>Profile Image
              <input type="file" accept="image/*" onChange={e => setProfileImage(e.target.files?.[0] || null)} style={styles.fileInput} />
            </label>
            <button type="submit" disabled={saving} style={styles.button}>
              {saving ? "Saving..." : "Save Profile"}
            </button>
          </form>
        </div>

        {/* Payout */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Payout Details</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <label style={styles.label}>PayPal Email
              <input value={paypalEmail} onChange={e => setPaypalEmail(e.target.value)} placeholder="you@example.com" style={styles.input} />
            </label>
            <label style={styles.label}>Crypto Wallet
              <input value={cryptoWallet} onChange={e => setCryptoWallet(e.target.value)} placeholder="BTC/ETH/USDT address" style={styles.input} />
            </label>
            <button onClick={handleSaveProfile} style={styles.button}>Save Payout Info</button>
          </div>
        </div>

        {/* Role */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Switch Role</h2>
          <p style={{ color: "#6B7280", fontSize: "13px", marginBottom: "12px" }}>Current: <strong style={{ textTransform: "capitalize" }}>{userProfile?.role || "None"}</strong></p>
          <div style={{ display: "flex", gap: "8px" }}>
            {["creator", "promoter", "buyer"].map(r => (
              <button key={r} onClick={() => handleRoleChange(r)} style={userProfile?.role === r ? styles.roleActive : styles.roleBtn}>
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Danger */}
        <div style={{ ...styles.section, borderColor: "#FECACA" }}>
          <h2 style={styles.sectionTitle}>Danger Zone</h2>
          <p style={{ color: "#6B7280", fontSize: "13px", marginBottom: "12px" }}>Permanently delete your account and all data.</p>
          <button onClick={handleDelete} style={styles.deleteBtn}>Delete Account</button>
        </div>

        <Link to="/dashboard" style={styles.backLink}>← Back to Dashboard</Link>
      </div>
    </div>
  );
}

const styles = {
  page: { fontFamily: "'Inter', sans-serif", background: "linear-gradient(180deg, #F8F9FC 0%, #EEF0F5 100%)", minHeight: "100vh", padding: "40px 24px" },
  container: { maxWidth: "540px", margin: "0 auto" },
  title: { fontSize: "28px", fontWeight: 700, color: "#1A1D26", margin: "0 0 24px" },
  success: { padding: "12px", borderRadius: "10px", background: "#ECFDF5", color: "#10B981", fontSize: "13px", marginBottom: "16px" },
  error: { padding: "12px", borderRadius: "10px", background: "#FEF2F2", color: "#EF4444", fontSize: "13px", marginBottom: "16px" },
  section: { background: "#fff", border: "1px solid #E8EAEF", borderRadius: "14px", padding: "20px", marginBottom: "16px" },
  sectionTitle: { fontSize: "16px", fontWeight: 600, margin: "0 0 12px", color: "#1A1D26" },
  form: { display: "flex", flexDirection: "column", gap: "12px" },
  label: { display: "flex", flexDirection: "column", gap: "4px", fontSize: "13px", color: "#4B5563", fontWeight: 500 },
  input: { padding: "10px 14px", borderRadius: "10px", border: "1px solid #E0E3E8", fontSize: "14px", outline: "none", background: "#F8F9FC" },
  fileInput: { fontSize: "13px", color: "#6B7280" },
  button: { padding: "10px 16px", borderRadius: "10px", border: "none", background: "#6C5CE7", color: "#fff", fontWeight: 600, fontSize: "13px", cursor: "pointer" },
  roleBtn: { padding: "8px 16px", borderRadius: "10px", border: "1px solid #E0E3E8", background: "#fff", color: "#4B5563", fontWeight: 500, cursor: "pointer", fontSize: "13px", textTransform: "capitalize" },
  roleActive: { padding: "8px 16px", borderRadius: "10px", border: "none", background: "#6C5CE7", color: "#fff", fontWeight: 600, cursor: "pointer", fontSize: "13px", textTransform: "capitalize" },
  deleteBtn: { padding: "10px 16px", borderRadius: "10px", border: "1px solid #FECACA", background: "#FEF2F2", color: "#EF4444", fontWeight: 600, fontSize: "13px", cursor: "pointer" },
  backLink: { display: "block", textAlign: "center", marginTop: "20px", color: "#6C5CE7", textDecoration: "none", fontSize: "13px", fontWeight: 500 },
};

export default Settings;