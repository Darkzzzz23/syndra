import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { getCreatorProducts, deleteProduct } from "../services/productService";
import { getPromoterByUid, generateReferralLink } from "../services/promotionService";
import { getApprovedProducts } from "../services/productService";

function Dashboard() {
  const { logout, currentUser, userProfile } = useContext(AuthContext);
  const role = userProfile?.role;
  const userName = userProfile?.email?.split("@")[0] || "User";
  const creatorStatus = userProfile?.creatorStatus;

  const [creatorProducts, setCreatorProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [deletingProductId, setDeletingProductId] = useState(null);
  const [productCounts, setProductCounts] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });

  const [promoterProfile, setPromoterProfile] = useState(null);
  const [promoterProducts, setPromoterProducts] = useState([]);
  const [copiedId, setCopiedId] = useState(null);
  const [loadingPromoter, setLoadingPromoter] = useState(false);
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
      const counts = products.reduce((acc, p) => {
        acc.total += 1;
        if (p.status === "approved") acc.approved += 1;
        if (p.status === "pending") acc.pending += 1;
        if (p.status === "rejected") acc.rejected += 1;
        return acc;
      }, { total: 0, pending: 0, approved: 0, rejected: 0 });
      setProductCounts(counts);
    } catch (err) { console.error(err); }
    finally { setLoadingProducts(false); }
  };

  const loadPromoterData = async () => {
    setLoadingPromoter(true);
    try {
      const [profile, approved] = await Promise.all([getPromoterByUid(currentUser.uid), getApprovedProducts()]);
      setPromoterProfile(profile);
      setPromoterProducts(approved);
    } catch (err) { console.error(err); }
    finally { setLoadingPromoter(false); }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm("Delete this product?")) return;
    setDeletingProductId(productId);
    try { await deleteProduct(productId); await loadCreatorData(); }
    catch (err) { console.error(err); }
    finally { setDeletingProductId(null); }
  };

  const copyLink = (link, productId) => {
    navigator.clipboard.writeText(link);
    setCopiedId(productId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div style={styles.page}>
      <div style={styles.layout}>
        {/* Sidebar */}
        <div style={styles.sidebar}>
          <Link to="/dashboard" style={styles.sideLink}>📊 Home</Link>
          {role === "creator" && <Link to="/upload-product" style={styles.sideLink}>📤 Upload</Link>}
          {role === "promoter" && <Link to="/promote" style={styles.sideLink}>📣 Promote</Link>}
          <Link to="/wallet" style={styles.sideLink}>💰 Wallet</Link>
          <Link to="/settings" style={styles.sideLink}>⚙️ Settings</Link>
          <button onClick={logout} style={{ ...styles.sideLink, color: "#EF4444", background: "none", border: "none", cursor: "pointer", textAlign: "left", width: "100%" }}>🚪 Logout</button>
        </div>

        {/* Main */}
        <div style={styles.main}>
          <div style={styles.topBar}>
            <div style={styles.avatar}>
              {userProfile?.profileImage ? <img src={userProfile.profileImage} alt="" style={styles.avatarImg} /> : <span>👤</span>}
            </div>
            <div>
              <h1 style={styles.greeting}>Welcome back, {userProfile?.displayName || userName}</h1>
              <p style={styles.roleTag}>{role === "creator" ? "Creator" : role === "promoter" ? "Promoter" : "Buyer"}</p>
            </div>
          </div>

          {showOnboarding && (
            <div style={styles.onboardCard}>
              <span style={{ fontSize: "20px" }}>👋</span>
              <div>
                <strong>Welcome to Syndra!</strong>
                <p style={{ margin: "4px 0 0", color: "#6B7280", fontSize: "13px" }}>
                  {role === "creator" ? "Upload your first product to start earning." :
                   role === "promoter" ? "Browse products and share your referral link." :
                   "Browse the marketplace and find something you love."}
                </p>
              </div>
              <button onClick={() => setShowOnboarding(false)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "16px", marginLeft: "auto" }}>✕</button>
            </div>
          )}

          {/* Creator Content */}
          {role === "creator" && creatorStatus === "approved" && (
            <>
              <div style={styles.statsRow}>
                <div style={styles.stat}><span style={styles.statNum}>{productCounts.total}</span><span style={styles.statLabel}>Products</span></div>
                <div style={styles.stat}><span style={styles.statNum}>{productCounts.approved}</span><span style={styles.statLabel}>Live</span></div>
                <div style={styles.stat}><span style={styles.statNum}>{productCounts.pending}</span><span style={styles.statLabel}>Pending</span></div>
                <div style={styles.stat}><span style={styles.statNum}>${((userProfile?.totalRevenue || 0)).toFixed(0)}</span><span style={styles.statLabel}>Earned</span></div>
              </div>

              <h2 style={styles.sectionTitle}>Your Products</h2>
              <div style={styles.productGrid}>
                {loadingProducts ? <p>Loading...</p> : creatorProducts.map(p => (
                  <div key={p.id} style={styles.productCard}>
                    <div style={styles.productCardImg}>
                      {p.thumbnailUrl ? <img src={p.thumbnailUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span>📦</span>}
                    </div>
                    <div style={{ padding: "12px" }}>
                      <span style={{ fontSize: "11px", color: "#6B7280" }}>{p.status}</span>
                      <h4 style={{ margin: "4px 0", fontSize: "14px" }}>{p.title}</h4>
                      <div style={{ display: "flex", gap: "6px", marginTop: "8px" }}>
                        <Link to={`/product/${p.id}`} style={styles.actionBtn}>View</Link>
                        <Link to={`/edit-product/${p.id}`} style={styles.actionBtn}>Edit</Link>
                        <button onClick={() => handleDelete(p.id)} style={{ ...styles.actionBtn, color: "#EF4444" }}>Delete</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Promoter Content */}
          {role === "promoter" && (
            <>
              {promoterProfile?.status === "approved" ? (
                <>
                  <div style={styles.statsRow}>
                    <div style={styles.stat}><span style={styles.statNum}>{promoterProfile?.totalClicks || 0}</span><span style={styles.statLabel}>Clicks</span></div>
                    <div style={styles.stat}><span style={styles.statNum}>{promoterProfile?.totalSales || 0}</span><span style={styles.statLabel}>Sales</span></div>
                    <div style={styles.stat}><span style={styles.statNum}>${(promoterProfile?.totalEarnings || 0).toFixed(0)}</span><span style={styles.statLabel}>Earned</span></div>
                  </div>
                  <h2 style={styles.sectionTitle}>Products to Promote</h2>
                  <div style={styles.productGrid}>
                    {promoterProducts.slice(0, 6).map(p => {
                      const link = generateReferralLink(p.id, promoterProfile.slug);
                      return (
                        <div key={p.id} style={styles.productCard}>
                          <div style={styles.productCardImg}>{p.thumbnailUrl ? <img src={p.thumbnailUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span>📦</span>}</div>
                          <div style={{ padding: "12px" }}>
                            <h4 style={{ margin: "0 0 4px", fontSize: "14px" }}>{p.title}</h4>
                            <span style={{ fontWeight: 700, color: "#6C5CE7" }}>${p.price?.toFixed(2)}</span>
                            <button onClick={() => copyLink(link, p.id)} style={{ ...styles.actionBtn, display: "block", marginTop: "8px", width: "100%" }}>
                              {copiedId === p.id ? "✓ Copied!" : "Copy Link"}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div style={{ padding: "40px", textAlign: "center", color: "#6B7280" }}>
                  <p>Apply to become a promoter and start earning.</p>
                  <Link to="/apply-promoter" style={{ color: "#6C5CE7", fontWeight: 600 }}>Apply Now</Link>
                </div>
              )}
            </>
          )}

          {/* Buyer Content */}
          {role === "buyer" && (
            <div style={{ textAlign: "center", padding: "60px 20px" }}>
              <span style={{ fontSize: "48px" }}>🛍️</span>
              <h2>Ready to explore?</h2>
              <p style={{ color: "#6B7280", marginBottom: "20px" }}>Browse the marketplace to find worksheets, art, templates, and more.</p>
              <Link to="/marketplace" style={{ padding: "12px 24px", borderRadius: "10px", background: "#6C5CE7", color: "#fff", textDecoration: "none", fontWeight: 600 }}>Browse Marketplace</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { fontFamily: "'Inter', sans-serif", background: "#FAFBFC", color: "#1A1D26", minHeight: "100vh" },
  layout: { display: "flex", maxWidth: "960px", margin: "0 auto", minHeight: "100vh" },
  sidebar: { width: "200px", borderRight: "1px solid #E5E7EB", padding: "24px 16px", display: "flex", flexDirection: "column", gap: "4px", background: "#fff" },
  sideLink: { padding: "10px 14px", borderRadius: "8px", color: "#4B5563", textDecoration: "none", fontSize: "14px", fontWeight: 500 },
  main: { flex: 1, padding: "32px" },
  topBar: { display: "flex", alignItems: "center", gap: "14px", marginBottom: "28px" },
  avatar: { width: "48px", height: "48px", borderRadius: "50%", background: "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", fontSize: "20px" },
  avatarImg: { width: "100%", height: "100%", objectFit: "cover" },
  greeting: { fontSize: "22px", fontWeight: 600, margin: 0 },
  roleTag: { color: "#6B7280", fontSize: "13px", margin: "2px 0 0" },
  onboardCard: { display: "flex", alignItems: "center", gap: "12px", padding: "16px", borderRadius: "12px", background: "#F5F3FF", border: "1px solid #DDD6FE", marginBottom: "24px" },
  statsRow: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "28px" },
  stat: { padding: "16px", borderRadius: "12px", background: "#fff", border: "1px solid #E5E7EB", textAlign: "center" },
  statNum: { fontSize: "22px", fontWeight: 700, display: "block" },
  statLabel: { fontSize: "12px", color: "#6B7280", marginTop: "4px", display: "block" },
  sectionTitle: { fontSize: "18px", fontWeight: 600, marginBottom: "14px" },
  productGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "14px" },
  productCard: { borderRadius: "12px", background: "#fff", border: "1px solid #E5E7EB", overflow: "hidden" },
  productCardImg: { height: "120px", background: "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px" },
  actionBtn: { padding: "6px 12px", borderRadius: "6px", border: "1px solid #E5E7EB", background: "#fff", color: "#4B5563", textDecoration: "none", fontSize: "12px", fontWeight: 500, cursor: "pointer" },
};

export default Dashboard;