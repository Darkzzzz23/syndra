import { Link } from "react-router-dom";
import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { getPromoterByUid } from "../services/promotionService";

function Navbar() {
  const { currentUser, userProfile, logout } = useContext(AuthContext);
  const [promoterProfile, setPromoterProfile] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const role = userProfile?.role;

  useEffect(() => {
    if (currentUser) {
      getPromoterByUid(currentUser.uid).then(setPromoterProfile).catch(() => setPromoterProfile(null));
    } else {
      setPromoterProfile(null);
    }
  }, [currentUser]);

  const isApprovedPromoter = promoterProfile && promoterProfile.status === "approved";

  return (
    <div style={styles.nav}>
      <div style={styles.container}>
        <Link to="/" style={styles.logo}>
          ✦ <span style={styles.logoText}>Syndra</span>
        </Link>

        <div style={styles.links}>
          <Link to="/marketplace" style={styles.link}>Marketplace</Link>
          {currentUser && role === "creator" && userProfile?.creatorStatus === "approved" && (
            <Link to="/upload-product" style={styles.link}>Upload</Link>
          )}
          {currentUser && isApprovedPromoter && (
            <Link to="/promote" style={styles.link}>Promote</Link>
          )}
        </div>

        <div style={styles.right}>
          {!currentUser ? (
            <Link to="/login" style={styles.signIn}>Sign In</Link>
          ) : (
            <div style={{ position: "relative" }}>
              <button onClick={() => setDropdownOpen(!dropdownOpen)} style={styles.avatarBtn}>
                {userProfile?.profileImage ? (
                  <img src={userProfile.profileImage} alt="" style={styles.avatar} />
                ) : (
                  <span style={styles.avatarPlaceholder}>👤</span>
                )}
              </button>
              {dropdownOpen && (
                <div style={styles.dropdown}>
                  <Link to="/dashboard" style={styles.dropItem} onClick={() => setDropdownOpen(false)}>Dashboard</Link>
                  <Link to="/wallet" style={styles.dropItem} onClick={() => setDropdownOpen(false)}>Wallet</Link>
                  <Link to="/settings" style={styles.dropItem} onClick={() => setDropdownOpen(false)}>Settings</Link>
                  {(role === "owner" || role === "admin") && (
                    <Link to="/admin" style={styles.dropItem} onClick={() => setDropdownOpen(false)}>Admin</Link>
                  )}
                  <button onClick={() => { setDropdownOpen(false); logout(); }} style={{ ...styles.dropItem, color: "#EF4444", background: "none", border: "none", width: "100%", textAlign: "left", cursor: "pointer", fontSize: "14px" }}>Logout</button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  nav: { background: "#fff", borderBottom: "1px solid #E5E7EB", position: "sticky", top: 0, zIndex: 100, fontFamily: "'Inter', sans-serif" },
  container: { maxWidth: "960px", margin: "0 auto", padding: "14px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" },
  logo: { fontSize: "18px", fontWeight: 700, color: "#6C5CE7", textDecoration: "none", display: "flex", alignItems: "center", gap: "6px" },
  logoText: { color: "#1A1D26" },
  links: { display: "flex", gap: "28px", alignItems: "center" },
  link: { color: "#6B7280", textDecoration: "none", fontSize: "14px", fontWeight: 500 },
  right: {},
  signIn: { padding: "8px 18px", borderRadius: "10px", background: "#6C5CE7", color: "#fff", textDecoration: "none", fontWeight: 600, fontSize: "14px" },
  avatarBtn: { background: "none", border: "2px solid #E5E7EB", borderRadius: "50%", width: "38px", height: "38px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" },
  avatar: { width: "34px", height: "34px", borderRadius: "50%", objectFit: "cover" },
  avatarPlaceholder: { fontSize: "16px" },
  dropdown: { position: "absolute", top: "46px", right: "0", background: "#fff", border: "1px solid #E5E7EB", borderRadius: "12px", padding: "8px", minWidth: "180px", zIndex: 200, boxShadow: "0 4px 16px rgba(0,0,0,0.06)", display: "flex", flexDirection: "column", gap: "2px" },
  dropItem: { padding: "10px 14px", borderRadius: "8px", color: "#1A1D26", textDecoration: "none", fontSize: "14px", display: "block" },
};

export default Navbar;