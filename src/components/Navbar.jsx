import { Link } from "react-router-dom";
import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { getPromoterByUid } from "../services/promotionService";

function Navbar() {
  const { currentUser, userProfile, logout } = useContext(AuthContext);
  const [hoveredLink, setHoveredLink] = useState(null);
  const [promoterProfile, setPromoterProfile] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const role = userProfile?.role;

  useEffect(() => {
    const checkPromoter = async () => {
      if (currentUser) {
        try {
          const profile = await getPromoterByUid(currentUser.uid);
          setPromoterProfile(profile);
        } catch {
          setPromoterProfile(null);
        }
      } else {
        setPromoterProfile(null);
      }
    };
    checkPromoter();
  }, [currentUser]);

  const isApprovedPromoter = promoterProfile && promoterProfile.status === "approved";

  return (
    <div style={styles.nav}>
      <div style={styles.container}>
        <Link to="/" style={styles.logoLink}>
          <div style={styles.logo}>
            <span style={styles.logoIcon}>✦</span>
            <span style={styles.logoText}>Syndra</span>
          </div>
        </Link>

        {/* Desktop links */}
        <div style={styles.navLinks} className="desktop-nav">
          {!currentUser && (
            <Link to="/" style={{ ...styles.navLink, ...(hoveredLink === "home" && styles.navLinkHover) }} onMouseEnter={() => setHoveredLink("home")} onMouseLeave={() => setHoveredLink(null)}>Home</Link>
          )}
          <Link to="/marketplace" style={{ ...styles.navLink, ...(hoveredLink === "marketplace" && styles.navLinkHover) }} onMouseEnter={() => setHoveredLink("marketplace")} onMouseLeave={() => setHoveredLink(null)}>Marketplace</Link>
          {currentUser && role === "creator" && userProfile?.creatorStatus === "approved" && (
            <Link to="/upload-product" style={{ ...styles.navLink, ...(hoveredLink === "upload" && styles.navLinkHover) }} onMouseEnter={() => setHoveredLink("upload")} onMouseLeave={() => setHoveredLink(null)}>Upload</Link>
          )}
          {currentUser && isApprovedPromoter && (
            <Link to="/promote" style={{ ...styles.navLink, ...(hoveredLink === "promote" && styles.navLinkHover) }} onMouseEnter={() => setHoveredLink("promote")} onMouseLeave={() => setHoveredLink(null)}>Promote</Link>
          )}
        </div>

        {/* Right section */}
        <div style={styles.rightSection}>
          {!currentUser ? (
            <Link to="/login" style={styles.authBtn}>Sign In</Link>
          ) : (
            <div style={styles.userArea}>
              <div style={styles.dropdown}>
                <button onClick={() => setDropdownOpen(!dropdownOpen)} style={styles.gearBtn}>
                  {userProfile?.profileImage ? (
                    <img src={userProfile.profileImage} alt="" style={styles.navAvatar} />
                  ) : (
                    <span style={styles.navAvatarPlaceholder}>👤</span>
                  )}
                </button>
                {dropdownOpen && (
                  <div style={styles.dropdownMenu}>
                    <Link to="/dashboard" style={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>📊 Dashboard</Link>
                    <Link to="/wallet" style={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>💰 Wallet</Link>
                    <Link to="/settings" style={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>⚙️ Settings</Link>
                    <div style={styles.dropdownDivider} />
                    <Link to="/marketplace" style={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>🛒 Marketplace</Link>
                    <Link to="/leaderboard" style={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>🏆 Leaderboard</Link>
                    <a href="https://discord.gg/kytBEbJ5" target="_blank" rel="noreferrer" style={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>💬 Community</a>
                    {(role === "owner" || role === "admin" || role === "moderator") && (
                      <Link to="/admin" style={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>⚙️ Admin</Link>
                    )}
                    <div style={styles.dropdownDivider} />
                    <button onClick={() => { setDropdownOpen(false); logout(); }} style={{ ...styles.dropdownItem, color: "#fca5a5" }}>🚪 Logout</button>
                  </div>
                )}
              </div>

              {/* Hamburger */}
              <button onClick={() => setMobileOpen(!mobileOpen)} style={styles.hamburger} className="hamburger-btn">
                {mobileOpen ? "✕" : "☰"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div style={styles.mobileMenu} className="mobile-menu">
          <Link to="/marketplace" style={styles.mobileLink} onClick={() => setMobileOpen(false)}>🛒 Marketplace</Link>
          {currentUser && role === "creator" && (
            <Link to="/upload-product" style={styles.mobileLink} onClick={() => setMobileOpen(false)}>📤 Upload</Link>
          )}
          {currentUser && isApprovedPromoter && (
            <Link to="/promote" style={styles.mobileLink} onClick={() => setMobileOpen(false)}>📣 Promote</Link>
          )}
          <Link to="/leaderboard" style={styles.mobileLink} onClick={() => setMobileOpen(false)}>🏆 Leaderboard</Link>
          <a href="https://discord.gg/kytBEbJ5" target="_blank" rel="noreferrer" style={styles.mobileLink}>💬 Community</a>
          {(role === "owner" || role === "admin" || role === "moderator") && (
            <Link to="/admin" style={styles.mobileLink} onClick={() => setMobileOpen(false)}>⚙️ Admin</Link>
          )}
          {currentUser ? (
            <>
              <div style={styles.dropdownDivider} />
              <Link to="/dashboard" style={styles.mobileLink} onClick={() => setMobileOpen(false)}>📊 Dashboard</Link>
              <Link to="/wallet" style={styles.mobileLink} onClick={() => setMobileOpen(false)}>💰 Wallet</Link>
              <Link to="/settings" style={styles.mobileLink} onClick={() => setMobileOpen(false)}>⚙️ Settings</Link>
              <button onClick={() => { setMobileOpen(false); logout(); }} style={{ ...styles.mobileLink, color: "#fca5a5", background: "none", border: "none", width: "100%", textAlign: "left", fontSize: "15px", cursor: "pointer" }}>🚪 Logout</button>
            </>
          ) : (
            <Link to="/login" style={styles.mobileLink} onClick={() => setMobileOpen(false)}>🔑 Sign In</Link>
          )}
        </div>
      )}
    </div>
  );
}

const styles = {
  nav: { position: "sticky", top: 0, zIndex: 100, background: "rgba(11, 15, 23, 0.8)", backdropFilter: "blur(10px)", borderBottom: "1px solid rgba(79, 124, 255, 0.1)", fontFamily: "Inter, sans-serif" },
  container: { maxWidth: "1200px", margin: "0 auto", padding: "12px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" },
  logoLink: { textDecoration: "none", flexShrink: 0 },
  logo: { display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" },
  logoIcon: { fontSize: "18px", background: "linear-gradient(135deg, #4f7cff, #7c3aed)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", fontWeight: "700" },
  logoText: { fontSize: "18px", fontWeight: "700", background: "linear-gradient(135deg, #ffffff, #a5b4ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" },
  navLinks: { display: "flex", gap: "24px", alignItems: "center", flex: 1, justifyContent: "center" },
  navLink: { color: "#94a3b8", textDecoration: "none", fontSize: "14px", fontWeight: "500", transition: "all 0.3s ease", cursor: "pointer" },
  navLinkHover: { color: "#a5b4ff" },
  rightSection: { display: "flex", alignItems: "center", flexShrink: 0 },
  authBtn: { padding: "8px 18px", background: "linear-gradient(135deg, rgba(79, 124, 255, 0.15), rgba(124, 58, 237, 0.15))", border: "1px solid rgba(79, 124, 255, 0.3)", color: "#a5b4ff", textDecoration: "none", borderRadius: "8px", fontWeight: "600", fontSize: "14px" },
  userArea: { display: "flex", alignItems: "center", gap: "8px" },
  dropdown: { position: "relative" },
  gearBtn: { padding: "4px", borderRadius: "50%", background: "transparent", border: "2px solid rgba(79,124,255,0.3)", cursor: "pointer", width: "38px", height: "38px", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" },
  navAvatar: { width: "34px", height: "34px", borderRadius: "50%", objectFit: "cover" },
  navAvatarPlaceholder: { fontSize: "16px" },
  dropdownMenu: { position: "absolute", top: "44px", right: "0", background: "#0f172a", border: "1px solid rgba(79,124,255,0.15)", borderRadius: "12px", padding: "8px", minWidth: "200px", zIndex: 200, display: "flex", flexDirection: "column", gap: "2px" },
  dropdownItem: { padding: "10px 14px", borderRadius: "8px", background: "transparent", border: "none", color: "#cbd5e1", cursor: "pointer", fontSize: "14px", textDecoration: "none", textAlign: "left", width: "100%", display: "block" },
  dropdownDivider: { height: "1px", background: "rgba(255,255,255,0.06)", margin: "4px 0" },
  hamburger: { display: "none", background: "none", border: "none", color: "#94a3b8", fontSize: "22px", cursor: "pointer", padding: "4px" },
  mobileMenu: { display: "none", padding: "8px 20px 20px", flexDirection: "column", gap: "2px", background: "rgba(11, 15, 23, 0.95)", borderBottom: "1px solid rgba(79,124,255,0.1)" },
  mobileLink: { padding: "12px 16px", borderRadius: "10px", color: "#cbd5e1", textDecoration: "none", fontSize: "15px", display: "block" },
};

export default Navbar;