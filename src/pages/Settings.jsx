import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { updateUserProfile, changeUserRole, deleteUserAccount } from "../services/userService";
import { uploadProductFile } from "../services/productService";

function Settings() {
  const { currentUser, userProfile, logout, refreshUserProfile } = useContext(AuthContext);
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState(userProfile?.displayName || "");
  const [bio, setBio] = useState(userProfile?.bio || "");
  const [profileImage, setProfileImage] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      let profileImageUrl = userProfile?.profileImage || "";

      if (profileImage) {
        profileImageUrl = await uploadProductFile(currentUser.uid, profileImage);
      }

      await updateUserProfile(currentUser.uid, {
        displayName,
        bio,
        profileImage: profileImageUrl,
      });

      await refreshUserProfile();
      setMessage("Profile updated successfully!");
    } catch (err) {
      console.error("Failed to update profile:", err);
      setError("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleRoleChange = async (newRole) => {
    if (!window.confirm(`Switch to ${newRole}? Your dashboard will change.`)) return;

    try {
      await changeUserRole(currentUser.uid, newRole);
      await refreshUserProfile();
      setMessage(`Role changed to ${newRole}!`);
      setTimeout(() => navigate("/dashboard"), 1000);
    } catch (err) {
      console.error("Failed to change role:", err);
      setError("Failed to change role.");
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("Are you sure? This permanently deletes your account, products, and all data.")) return;
    if (!window.confirm("Final confirmation: This cannot be undone.")) return;

    try {
      await deleteUserAccount(currentUser.uid);
      await logout();
      navigate("/");
    } catch (err) {
      console.error("Failed to delete account:", err);
      setError("Failed to delete account. Try again or contact support.");
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.title}>Settings</h1>

        {message && <div style={styles.alertSuccess}>{message}</div>}
        {error && <div style={styles.alertError}>{error}</div>}

        {/* PROFILE SECTION */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Profile</h2>
          <form onSubmit={handleSaveProfile} style={styles.form}>
            <label style={styles.label}>
              Display Name
              <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Your name" style={styles.input} />
            </label>
            <label style={styles.label}>
              Bio
              <textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell us about yourself" style={{ ...styles.input, minHeight: "80px" }} />
            </label>
            <label style={styles.label}>
              Profile Image
              <input type="file" accept="image/*" onChange={(e) => setProfileImage(e.target.files?.[0] || null)} style={styles.input} />
            </label>
            <button type="submit" disabled={saving} style={styles.saveBtn}>
              {saving ? "Saving…" : "Save Profile"}
            </button>
          </form>
        </div>

        {/* ACCOUNT SECTION */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Account</h2>
          <div style={styles.infoRow}>
            <span style={styles.infoLabel}>Email</span>
            <span style={styles.infoValue}>{currentUser?.email || "N/A"}</span>
          </div>
          <div style={styles.infoRow}>
            <span style={styles.infoLabel}>Role</span>
            <span style={{ ...styles.infoValue, textTransform: "capitalize" }}>{userProfile?.role || "None"}</span>
          </div>
          <div style={styles.infoRow}>
            <span style={styles.infoLabel}>Member since</span>
            <span style={styles.infoValue}>
              {userProfile?.createdAt?.toDate ? userProfile.createdAt.toDate().toLocaleDateString() : "N/A"}
            </span>
          </div>
        </div>

        {/* ROLE SECTION */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Switch Role</h2>
          <p style={styles.sectionDesc}>Change how you use Syndra. Your dashboard will update.</p>
          <div style={styles.roleButtons}>
            <button onClick={() => handleRoleChange("creator")} style={userProfile?.role === "creator" ? styles.roleBtnActive : styles.roleBtn}>
              🎨 Creator
            </button>
            <button onClick={() => handleRoleChange("promoter")} style={userProfile?.role === "promoter" ? styles.roleBtnActive : styles.roleBtn}>
              📣 Promoter
            </button>
            <button onClick={() => handleRoleChange("buyer")} style={userProfile?.role === "buyer" ? styles.roleBtnActive : styles.roleBtn}>
              🛍️ Buyer
            </button>
          </div>
        </div>

        {/* DANGER ZONE */}
        <div style={{ ...styles.section, ...styles.dangerSection }}>
          <h2 style={styles.sectionTitle}>Danger Zone</h2>
          <p style={styles.sectionDesc}>Permanently delete your account and all associated data.</p>
          <button onClick={handleDeleteAccount} style={styles.deleteBtn}>Delete Account</button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: "calc(100vh - 70px)", padding: "40px 24px", color: "#fff", background: "linear-gradient(180deg, #05070d 0%, #0f172a 100%)", fontFamily: "Inter, sans-serif" },
  container: { maxWidth: "640px", margin: "0 auto" },
  title: { fontSize: "34px", margin: "0 0 28px" },
  section: { padding: "24px", borderRadius: "18px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(79,124,255,0.12)", marginBottom: "20px" },
  sectionTitle: { fontSize: "20px", margin: "0 0 12px" },
  sectionDesc: { color: "#94a3b8", fontSize: "14px", marginBottom: "16px" },
  form: { display: "flex", flexDirection: "column", gap: "14px" },
  label: { display: "flex", flexDirection: "column", gap: "6px", fontSize: "14px", color: "#cbd5e1" },
  input: { borderRadius: "12px", border: "1px solid rgba(148,163,184,0.2)", padding: "12px 14px", fontSize: "14px", background: "rgba(255,255,255,0.04)", color: "#fff", outline: "none" },
  saveBtn: { padding: "12px 20px", borderRadius: "12px", border: "none", background: "linear-gradient(135deg, #4f7cff, #7c3aed)", color: "#fff", cursor: "pointer", fontWeight: 700 },
  infoRow: { display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" },
  infoLabel: { color: "#94a3b8", fontSize: "14px" },
  infoValue: { fontSize: "14px" },
  roleButtons: { display: "flex", gap: "10px", flexWrap: "wrap" },
  roleBtn: { flex: 1, minWidth: "100px", padding: "12px 16px", borderRadius: "12px", border: "1px solid rgba(79,124,255,0.2)", background: "transparent", color: "#94a3b8", cursor: "pointer", fontWeight: 600 },
  roleBtnActive: { flex: 1, minWidth: "100px", padding: "12px 16px", borderRadius: "12px", border: "none", background: "linear-gradient(135deg, #4f7cff, #7c3aed)", color: "#fff", cursor: "pointer", fontWeight: 700 },
  dangerSection: { border: "1px solid rgba(239,68,68,0.3)" },
  deleteBtn: { padding: "12px 20px", borderRadius: "12px", border: "1px solid rgba(239,68,68,0.5)", background: "rgba(239,68,68,0.1)", color: "#fca5a5", cursor: "pointer", fontWeight: 600 },
  alertError: { padding: "12px 16px", borderRadius: "12px", background: "rgba(248,113,113,0.16)", color: "#fecaca", marginBottom: "16px" },
  alertSuccess: { padding: "12px 16px", borderRadius: "12px", background: "rgba(34,197,94,0.16)", color: "#bbf7d0", marginBottom: "16px" },
};

export default Settings;