import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { getCreatorProducts, deleteProduct } from "../services/productService";
import { getPromoterByUid, generateReferralLink } from "../services/promotionService";
import { getApprovedProducts } from "../services/productService";

function Dashboard() {
  const { logout, currentUser, userProfile } = useContext(AuthContext);
  const role = userProfile?.role;
  const userName = userProfile?.displayName || userProfile?.email?.split("@")[0] || "Creator";
  const creatorStatus = userProfile?.creatorStatus;

  const [creatorProducts, setCreatorProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [productCounts, setProductCounts] = useState({ total: 0, live: 0, pending: 0, earned: 0 });
  const [promoterProfile, setPromoterProfile] = useState(null);
  const [promoterProducts, setPromoterProducts] = useState([]);
  const [copiedId, setCopiedId] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(true);

   useEffect(() => {
    if (!currentUser) return;
    if (role === "creator" && creatorStatus === "approved") loadCreatorData();
    else if (role === "promoter") loadPromoterData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, role, creatorStatus]);

  const loadCreatorData = async () => {
    setLoadingProducts(true);
    try {
      const products = await getCreatorProducts(currentUser.uid);
      setCreatorProducts(products);
      setProductCounts({
        total: products.length,
        live: products.filter(p => p.status === "approved").length,
        pending: products.filter(p => p.status === "pending").length,
        earned: userProfile?.totalRevenue || 0,
      });
    } catch (err) { console.error(err); }
    finally { setLoadingProducts(false); }
  };

  const loadPromoterData = async () => {
    try {
      const [profile, approved] = await Promise.all([getPromoterByUid(currentUser.uid), getApprovedProducts()]);
      setPromoterProfile(profile);
      setPromoterProducts(approved);
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id) => { if (!window.confirm("Delete?")) return; await deleteProduct(id); await loadCreatorData(); };
  const copyLink = (link, id) => { navigator.clipboard.writeText(link); setCopiedId(id); setTimeout(() => setCopiedId(null), 2000); };

  return (
    <div style={styles.page}>
      <aside style={styles.sidebar}>
        <Link to="/" style={styles.sideLogo}>Syndra</Link>
        <nav style={styles.sideNav}>
          <button style={styles.sideItemActive}>📊 Home</button>
          {role === "creator" && <Link to="/upload-product" style={styles.sideItem}>📤 Upload</Link>}
          {role === "promoter" && <Link to="/promote" style={styles.sideItem}>📣 Promote</Link>}
          <Link to="/wallet" style={styles.sideItem}>💰 Wallet</Link>
          <Link to="/settings" style={styles.sideItem}>⚙️ Settings</Link>
        </nav>
        <div style={styles.sideBottom}>
          <div style={styles.sideUser}>
            <div style={styles.sideAvatar}>{userName[0]}</div>
            <div><p style={styles.sideName}>{userName}</p><p style={styles.sideRole}>{role}</p></div>
          </div>
          <button onClick={logout} style={styles.sideLogout}>Logout</button>
        </div>
      </aside>

      <main style={styles.main}>
        <div style={styles.topBar}>
          <span style={{ color: "#94A3B8", fontSize: "14px", textTransform: "capitalize" }}>{role} Dashboard</span>
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <Link to="/wallet" style={styles.walletBtn}>Wallet</Link>
            <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "#06B6D4", color: "#0A0E17", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "12px" }}>{userName[0]}</div>
          </div>
        </div>

        <div style={styles.content}>
          <div style={styles.welcome}>
            <div>
              <h1 style={styles.welcomeTitle}>Good morning, {userName}</h1>
              <p style={styles.welcomeSub}>Here's what's happening with your {role} account.</p>
            </div>
            {role === "creator" && <Link to="/upload-product" style={styles.btnPrimary}>+ New Prompt</Link>}
            {role === "promoter" && <Link to="/pro-promoter" style={styles.btnPrimary}>⭐ Go Pro</Link>}
          </div>

          {showOnboarding && (
            <div style={styles.onboardCard}>
              <span style={{ fontSize: "20px" }}>👋</span>
              <div style={{ flex: 1 }}>
                <strong>Welcome to Syndra!</strong>
                <p style={{ color: "#94A3B8", fontSize: "13px", margin: "4px 0 0" }}>
                  {role === "creator" ? "Upload your first AI prompt to start earning." : role === "promoter" ? "Browse products and share your referral link." : "Browse the marketplace and find AI prompts."}
                </p>
              </div>
              <button onClick={() => setShowOnboarding(false)} style={{ background: "none", border: "none", color: "#94A3B8", cursor: "pointer", fontSize: "16px" }}>✕</button>
            </div>
          )}

          {role !== "buyer" && (
            <div style={styles.statsRow}>
              {role === "creator" ? (
                <>
                  {[{ label: "Products", value: productCounts.total, sub: `${productCounts.live} live`, bar: "#06B6D4", bg: "rgba(6,182,212,0.1)" }, { label: "Live", value: productCounts.live, sub: "Active listings", bar: "#10B981", bg: "rgba(16,185,129,0.1)" }, { label: "Pending", value: productCounts.pending, sub: "Awaiting review", bar: "#D97706", bg: "rgba(217,119,6,0.1)" }, { label: "Earned", value: `$${(productCounts.earned || 0).toFixed(0)}`, sub: "Total earnings", bar: "#EF4444", bg: "rgba(239,68,68,0.1)" }].map(s => (
                    <div key={s.label} style={styles.statCard}>
                      <div style={{ ...styles.statIcon, background: s.bg }}>{s.label[0]}</div>
                      <p style={styles.statValue}>{s.value}</p>
                      <p style={styles.statSub}>{s.sub}</p>
                      <div style={{ ...styles.statBar, background: s.bar }} />
                    </div>
                  ))}
                </>
              ) : (
                <>
                  {[{ label: "Clicks", value: promoterProfile?.totalClicks || 0, sub: "Referral clicks", bar: "#06B6D4", bg: "rgba(6,182,212,0.1)" }, { label: "Sales", value: promoterProfile?.totalSales || 0, sub: "Conversions", bar: "#10B981", bg: "rgba(16,185,129,0.1)" }, { label: "Rate", value: `${promoterProfile?.commissionRate || 20}%`, sub: "Commission", bar: "#D97706", bg: "rgba(217,119,6,0.1)" }, { label: "Earned", value: `$${(promoterProfile?.totalEarnings || 0).toFixed(0)}`, sub: "Total", bar: "#EF4444", bg: "rgba(239,68,68,0.1)" }].map(s => (
                    <div key={s.label} style={styles.statCard}>
                      <div style={{ ...styles.statIcon, background: s.bg }}>{s.label[0]}</div>
                      <p style={styles.statValue}>{s.value}</p>
                      <p style={styles.statSub}>{s.sub}</p>
                      <div style={{ ...styles.statBar, background: s.bar }} />
                    </div>
                  ))}
                </>
              )}
            </div>
          )}

          {role === "creator" && (
            <div style={styles.tableCard}>
              <div style={styles.tableHeader}><span>Your Products</span><span style={{ color: "#94A3B8", fontSize: "12px" }}>{creatorProducts.length} items</span></div>
              {loadingProducts ? <p style={{ padding: "40px", textAlign: "center", color: "#94A3B8" }}>Loading...</p> : creatorProducts.length === 0 ? <p style={{ padding: "40px", textAlign: "center", color: "#94A3B8" }}>No products yet.</p> :
                creatorProducts.map(p => (
                  <div key={p.id} style={styles.tableRow}>
                    <div style={styles.rowImg}>{p.thumbnailUrl ? <img src={p.thumbnailUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : "📦"}</div>
                    <div style={{ flex: 1 }}><p style={{ fontWeight: 500, fontSize: "14px", margin: 0 }}>{p.title}</p><p style={{ color: "#94A3B8", fontSize: "12px", margin: "2px 0 0" }}>{p.category}</p></div>
                    <span style={{ fontSize: "14px", fontWeight: 600 }}>${p.price?.toFixed(2)}</span>
                    <span style={{ fontSize: "11px", padding: "4px 8px", borderRadius: "4px", background: p.status === "approved" ? "rgba(16,185,129,0.15)" : "rgba(217,119,6,0.15)", color: p.status === "approved" ? "#10B981" : "#D97706", textTransform: "capitalize", fontWeight: 600 }}>{p.status === "approved" ? "Live" : p.status}</span>
                    <div style={{ display: "flex", gap: "4px" }}>
                      <Link to={`/product/${p.id}`} style={styles.iconBtn}>👁</Link>
                      <Link to={`/edit-product/${p.id}`} style={styles.iconBtn}>✏️</Link>
                      <button onClick={() => handleDelete(p.id)} style={{ ...styles.iconBtn, color: "#EF4444" }}>🗑</button>
                    </div>
                  </div>
                ))
              }
            </div>
          )}

          {role === "promoter" && (
            <div>
              <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "16px" }}>Products to Promote</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
                {promoterProducts.slice(0, 6).map(p => {
                  const link = promoterProfile?.slug ? generateReferralLink(p.id, promoterProfile.slug) : "";
                  return (
                    <div key={p.id} style={styles.promoCard}>
                      <div style={styles.promoImg}>{p.thumbnailUrl ? <img src={p.thumbnailUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : "📦"}</div>
                      <div style={{ padding: "12px" }}>
                        <p style={{ fontWeight: 600, fontSize: "14px", margin: "0 0 4px" }}>{p.title}</p>
                        <p style={{ color: "#06B6D4", fontWeight: 700 }}>${p.price?.toFixed(2)}</p>
                        <button onClick={() => copyLink(link, p.id)} style={styles.copyBtn}>{copiedId === p.id ? "✓ Copied!" : "Copy Link"}</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {role === "buyer" && (
            <div style={{ textAlign: "center", padding: "60px" }}>
              <span style={{ fontSize: "48px", display: "block", marginBottom: "16px" }}>🛍️</span>
              <h2>Ready to explore?</h2>
              <p style={{ color: "#94A3B8", marginBottom: "24px" }}>Browse AI prompts from independent creators.</p>
              <Link to="/marketplace" style={styles.btnPrimary}>Browse Marketplace</Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

const styles = {
  page: { display: "flex", minHeight: "100vh", background: "#0A0E17", color: "#F8FAFB", fontFamily: "'Inter', sans-serif" },
  sidebar: { width: "224px", background: "#1A1F2E", borderRight: "1px solid #2D3548", display: "flex", flexDirection: "column", position: "sticky", top: 0, height: "100vh" },
  sideLogo: { padding: "20px", fontSize: "18px", fontWeight: 700, color: "#06B6D4", textDecoration: "none", borderBottom: "1px solid #2D3548", letterSpacing: "-0.02em" },
  sideNav: { flex: 1, padding: "12px", display: "flex", flexDirection: "column", gap: "2px" },
  sideItem: { padding: "10px 14px", borderRadius: "6px", color: "#CBD5E1", textDecoration: "none", fontSize: "14px", display: "block", background: "transparent", border: "none", textAlign: "left", cursor: "pointer", width: "100%" },
  sideItemActive: { padding: "10px 14px", borderRadius: "6px", background: "rgba(6,182,212,0.1)", color: "#06B6D4", fontWeight: 600, fontSize: "14px", border: "none", textAlign: "left", cursor: "pointer", width: "100%" },
  sideBottom: { padding: "12px", borderTop: "1px solid #2D3548" },
  sideUser: { display: "flex", alignItems: "center", gap: "10px", padding: "8px 12px", marginBottom: "8px" },
  sideAvatar: { width: "28px", height: "28px", borderRadius: "50%", background: "#06B6D4", color: "#0A0E17", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "12px", flexShrink: 0 },
  sideName: { fontSize: "12px", fontWeight: 600, margin: 0 }, sideRole: { fontSize: "10px", color: "#94A3B8", margin: 0, textTransform: "capitalize" },
  sideLogout: { padding: "8px 12px", borderRadius: "6px", border: "none", background: "transparent", color: "#94A3B8", cursor: "pointer", fontSize: "13px", width: "100%", textAlign: "left" },
  main: { flex: 1 },
  topBar: { height: "56px", background: "#1A1F2E", borderBottom: "1px solid #2D3548", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px" },
  walletBtn: { padding: "6px 14px", borderRadius: "6px", border: "1px solid #2D3548", color: "#CBD5E1", textDecoration: "none", fontSize: "12px" },
  content: { padding: "32px" },
  welcome: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "16px" },
  welcomeTitle: { fontSize: "24px", fontWeight: 700, letterSpacing: "-0.01em", margin: "0 0 4px" },
  welcomeSub: { color: "#94A3B8", fontSize: "14px", margin: 0 },
  btnPrimary: { padding: "10px 20px", borderRadius: "6px", background: "#06B6D4", color: "#0A0E17", fontWeight: 600, fontSize: "14px", textDecoration: "none", border: "none", cursor: "pointer", display: "inline-block" },
  onboardCard: { display: "flex", alignItems: "center", gap: "12px", padding: "16px", borderRadius: "8px", background: "rgba(6,182,212,0.08)", border: "1px solid rgba(6,182,212,0.2)", marginBottom: "24px" },
  statsRow: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "28px" },
  statCard: { background: "#1A1F2E", border: "1px solid #2D3548", borderRadius: "8px", padding: "18px", position: "relative", overflow: "hidden" },
  statIcon: { width: "32px", height: "32px", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "12px", fontSize: "12px", fontWeight: 700 },
  statValue: { fontSize: "22px", fontWeight: 700, margin: "0 0 2px" },
  statSub: { fontSize: "12px", color: "#94A3B8", margin: 0 },
  statBar: { position: "absolute", bottom: 0, left: 0, right: 0, height: "2px" },
  tableCard: { background: "#1A1F2E", border: "1px solid #2D3548", borderRadius: "8px", overflow: "hidden" },
  tableHeader: { padding: "16px 20px", borderBottom: "1px solid #2D3548", display: "flex", justifyContent: "space-between", fontWeight: 600, fontSize: "14px" },
  tableRow: { display: "flex", alignItems: "center", gap: "16px", padding: "14px 20px", borderBottom: "1px solid rgba(45,53,72,0.5)" },
  rowImg: { width: "36px", height: "36px", borderRadius: "6px", background: "#2D3548", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", overflow: "hidden", flexShrink: 0 },
  iconBtn: { background: "none", border: "none", cursor: "pointer", fontSize: "13px", color: "#94A3B8", textDecoration: "none", padding: "4px" },
  promoCard: { background: "#1A1F2E", border: "1px solid #2D3548", borderRadius: "8px", overflow: "hidden" },
  promoImg: { height: "120px", background: "#2D3548", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px" },
  copyBtn: { width: "100%", marginTop: "8px", padding: "8px", borderRadius: "6px", border: "none", background: "#06B6D4", color: "#0A0E17", fontWeight: 600, fontSize: "12px", cursor: "pointer" },
};

export default Dashboard;