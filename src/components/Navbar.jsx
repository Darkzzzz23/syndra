import { Link, useLocation } from "react-router-dom";
import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";

function Navbar() {
  const { currentUser, userProfile, logout } = useContext(AuthContext);
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  return (
    <header style={styles.header}>
      <div style={styles.inner}>
        <Link to="/" style={styles.logo}>Syndra</Link>

        <nav style={styles.nav}>
          <Link to="/marketplace" style={isActive("/marketplace") ? styles.linkActive : styles.link}>Marketplace</Link>
          <Link to="/reseller-program" style={isActive("/reseller-program") ? styles.linkActive : styles.link}>Reseller Program</Link>

          {!currentUser ? (
            <>
              <Link to="/login" style={styles.link}>Sign In</Link>
              <Link to="/signup" style={styles.btnPrimary}>Get Started</Link>
            </>
          ) : (
            <>
              <Link to="/dashboard" style={isActive("/dashboard") ? styles.linkActive : styles.link}>Dashboard</Link>
              {userProfile?.role === "owner" && (
                <Link to="/admin" style={isActive("/admin") ? styles.linkActive : styles.link}>Admin</Link>
              )}
              <div style={{ position: "relative" }}>
                <button onClick={() => setDropdownOpen(!dropdownOpen)} style={styles.avatarBtn}>
                  {userProfile?.displayName?.[0] || userProfile?.email?.[0] || "?"}
                </button>
                {dropdownOpen && (
                  <div style={styles.dropdown}>
                    <span style={styles.dropEmail}>{userProfile?.email}</span>
                    <div style={styles.dropDivider} />
                    <button onClick={() => { setDropdownOpen(false); logout(); }} style={styles.dropLogout}>Logout</button>
                  </div>
                )}
              </div>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

const styles = {
  header: {
    position: "sticky",
    top: 0,
    zIndex: 100,
    background: "#1A1F2E",
    borderBottom: "1px solid #2D3548",
    width: "100%",
  },
  inner: {
    maxWidth: "1100px",
    margin: "0 auto",
    padding: "0 24px",
    height: "64px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    boxSizing: "border-box",
  },
  logo: { fontSize: "18px", fontWeight: 700, color: "#06B6D4", textDecoration: "none", letterSpacing: "-0.02em" },
  nav: { display: "flex", alignItems: "center", gap: "20px" },
  link: { fontSize: "14px", fontWeight: 500, color: "#CBD5E1", textDecoration: "none" },
  linkActive: { fontSize: "14px", fontWeight: 600, color: "#06B6D4", textDecoration: "none" },
  btnPrimary: { padding: "10px 20px", borderRadius: "6px", background: "#06B6D4", color: "#0A0E17", fontWeight: 600, fontSize: "14px", textDecoration: "none", border: "none", cursor: "pointer" },
  avatarBtn: { width: "36px", height: "36px", borderRadius: "50%", background: "#06B6D4", color: "#0A0E17", border: "none", cursor: "pointer", fontWeight: 700, fontSize: "14px", display: "flex", alignItems: "center", justifyContent: "center" },
  dropdown: { position: "absolute", top: "48px", right: "0", background: "#1A1F2E", border: "1px solid #2D3548", borderRadius: "8px", padding: "12px", minWidth: "180px", zIndex: 200 },
  dropEmail: { display: "block", fontSize: "12px", color: "#94A3B8", marginBottom: "8px" },
  dropDivider: { height: "1px", background: "#2D3548", marginBottom: "8px" },
  dropLogout: { display: "block", width: "100%", textAlign: "left", padding: "8px 0", background: "none", border: "none", color: "#EF4444", cursor: "pointer", fontSize: "14px" },
};

export default Navbar;