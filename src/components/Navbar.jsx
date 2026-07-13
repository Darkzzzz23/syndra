import { Link, useLocation } from "react-router-dom";
import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";

function Navbar() {
  const { currentUser, userProfile, logout } = useContext(AuthContext);
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const role = userProfile?.role;



  const isActive = (path) => location.pathname === path;

  return (
    <header style={styles.header}>
      <div style={styles.container}>
        <Link to="/" style={styles.logo}>
          Syndra
        </Link>

        <nav style={styles.nav}>
          <Link to="/marketplace" style={isActive("/marketplace") ? styles.linkActive : styles.link}>Marketplace</Link>
          <Link to="/leaderboard" style={isActive("/leaderboard") ? styles.linkActive : styles.link}>Leaderboard</Link>
          {currentUser && (
            <Link to="/dashboard" style={isActive("/dashboard") ? styles.linkActive : styles.link}>Dashboard</Link>
          )}
        </nav>

        <div style={styles.actions}>
          {!currentUser ? (
            <>
              <Link to="/login" style={styles.link}>Sign In</Link>
              <Link to="/signup" style={styles.btnPrimary}>Get Started</Link>
            </>
          ) : (
            <div style={{ position: "relative" }}>
              <button onClick={() => setDropdownOpen(!dropdownOpen)} style={styles.avatarBtn}>
                {userProfile?.displayName?.[0] || userProfile?.email?.[0] || "?"}
              </button>
              {dropdownOpen && (
                <div style={styles.dropdown}>
                  <Link to="/dashboard" style={styles.dropItem} onClick={() => setDropdownOpen(false)}>Dashboard</Link>
                  <Link to="/wallet" style={styles.dropItem} onClick={() => setDropdownOpen(false)}>Wallet</Link>
                  <Link to="/settings" style={styles.dropItem} onClick={() => setDropdownOpen(false)}>Settings</Link>
                  {(role === "owner" || role === "admin") && (
                    <Link to="/admin" style={styles.dropItem} onClick={() => setDropdownOpen(false)}>Admin</Link>
                  )}
                  <button onClick={() => { setDropdownOpen(false); logout(); }} style={styles.logoutBtn}>Logout</button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

const styles = {
  header: { background: "#1A1F2E", borderBottom: "1px solid #2D3548", position: "sticky", top: 0, zIndex: 100 },
  container: { maxWidth: "1200px", margin: "0 auto", padding: "0 32px", height: "64px", display: "flex", alignItems: "center", justifyContent: "space-between" },
  logo: { fontSize: "18px", fontWeight: 700, color: "#06B6D4", textDecoration: "none", letterSpacing: "-0.02em" },
  nav: { display: "flex", alignItems: "center", gap: "32px" },
  link: { fontSize: "14px", fontWeight: 500, color: "#CBD5E1", textDecoration: "none", transition: "color 0.2s" },
  linkActive: { fontSize: "14px", fontWeight: 500, color: "#06B6D4", textDecoration: "none" },
  actions: { display: "flex", alignItems: "center", gap: "16px" },
  btnPrimary: { padding: "10px 20px", borderRadius: "6px", background: "#06B6D4", color: "#0A0E17", fontWeight: 600, fontSize: "14px", textDecoration: "none", transition: "all 0.2s", border: "none", cursor: "pointer" },
  avatarBtn: { width: "36px", height: "36px", borderRadius: "50%", background: "#06B6D4", color: "#0A0E17", border: "none", cursor: "pointer", fontWeight: 700, fontSize: "14px", display: "flex", alignItems: "center", justifyContent: "center" },
  dropdown: { position: "absolute", top: "48px", right: "0", background: "#1A1F2E", border: "1px solid #2D3548", borderRadius: "8px", padding: "8px", minWidth: "180px", zIndex: 200, display: "flex", flexDirection: "column", gap: "2px" },
  dropItem: { padding: "10px 14px", borderRadius: "6px", color: "#CBD5E1", textDecoration: "none", fontSize: "14px", display: "block", transition: "background 0.2s" },
  logoutBtn: { padding: "10px 14px", borderRadius: "6px", color: "#EF4444", background: "none", border: "none", width: "100%", textAlign: "left", cursor: "pointer", fontSize: "14px" },
};

export default Navbar;