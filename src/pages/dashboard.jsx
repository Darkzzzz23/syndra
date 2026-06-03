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

  useEffect(() => {
    if (!currentUser) return;
    if (role === "creator" && creatorStatus === "approved") {
      loadCreatorData();
    } else if (role === "promoter") {
      loadPromoterData();
    }
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
    } catch (err) {
      console.error("Failed to load creator products:", err);
    } finally {
      setLoadingProducts(false);
    }
  };

  const loadPromoterData = async () => {
    setLoadingPromoter(true);
    try {
      const [profile, approved] = await Promise.all([getPromoterByUid(currentUser.uid), getApprovedProducts()]);
      setPromoterProfile(profile);
      setPromoterProducts(approved);
    } catch (err) {
      console.error("Failed to load promoter data:", err);
    } finally {
      setLoadingPromoter(false);
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm("Permanently delete this product?")) return;
    setDeletingProductId(productId);
    try {
      await deleteProduct(productId);
      await loadCreatorData();
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setDeletingProductId(null);
    }
  };

  const copyLink = (link, productId) => {
    navigator.clipboard.writeText(link);
    setCopiedId(productId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // ========== CREATOR DASHBOARD ==========
  if (role === "creator") {
    return (
      <div style={styles.page}>
        <div style={styles.container}>
          <div style={styles.header}>
            <div style={styles.headerLeft}>
              <div style={styles.avatar}>
                {userProfile?.profileImage ? <img src={userProfile.profileImage} alt="" style={styles.avatarImg} /> : <span style={styles.avatarPlaceholder}>👤</span>}
              </div>
              <div>
                <h1 style={styles.title}>{userProfile?.displayName || userName}</h1>
                <p style={styles.subtitle}>Creator · {creatorStatus === "approved" ? "Manage your products" : creatorStatus === "pending_review" ? "Account under review" : "Account rejected"}</p>
              </div>
            </div>
            <div style={styles.headerActions}>
              {creatorStatus === "approved" && <Link to="/upload-product" style={styles.uploadBtn}>Upload Product</Link>}
              <button onClick={logout} style={styles.logoutBtn}>Sign Out</button>
            </div>
          </div>

          {creatorStatus === "pending_review" && (
            <div style={styles.pendingBanner}>⏳ Your creator account is under review. You'll be able to upload once approved.</div>
          )}
          {creatorStatus === "rejected" && (
            <div style={{ ...styles.pendingBanner, background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.3)", color: "#fecaca" }}>❌ Your creator application was rejected. Contact support or switch roles in Settings.</div>
          )}

          {creatorStatus === "approved" && (
            <>
              <div style={styles.statusGrid}>
                <div style={styles.statusCard}><p style={styles.cardTitle}>Total</p><p style={styles.cardValue}>{productCounts.total}</p></div>
                <div style={styles.statusCard}><p style={styles.cardTitle}>Pending</p><p style={styles.cardValue}>{productCounts.pending}</p></div>
                <div style={styles.statusCard}><p style={styles.cardTitle}>Approved</p><p style={styles.cardValue}>{productCounts.approved}</p></div>
                <div style={styles.statusCard}><p style={styles.cardTitle}>Rejected</p><p style={styles.cardValue}>{productCounts.rejected}</p></div>
              </div>

              <section style={styles.section}>
                <h2 style={styles.sectionTitle}>Your Products</h2>
                <div style={styles.grid}>
                  {loadingProducts ? <div style={styles.emptyCard}><p>Loading products…</p></div> : creatorProducts.length > 0 ? creatorProducts.map((p) => (
                    <div key={p.id} style={styles.productCard}>
                      <div style={styles.productHeader}><span style={styles.productTitle}>{p.title || p.name}</span><span style={styles.productBadge}>{p.totalClicks ?? 0} clicks</span></div>
                      <p style={styles.productDesc}>{p.description}</p>
                      <div style={styles.productFooter}>
                        <span style={styles.statusPill}>{p.status}</span>
                        <div style={styles.productActions}>
                          <Link to={`/product/${p.id}`} style={styles.viewBtn}>View</Link>
                          <button onClick={() => handleDelete(p.id)} disabled={deletingProductId === p.id} style={styles.deleteBtn}>{deletingProductId === p.id ? "…" : "Delete"}</button>
                        </div>
                      </div>
                    </div>
                  )) : <div style={styles.emptyCard}><h3>No products yet</h3><p>Upload your first digital product to get started.</p><Link to="/upload-product" style={styles.uploadBtn}>Upload Now</Link></div>}
                </div>
              </section>

              <section style={styles.section}>
                <h2 style={styles.sectionTitle}>Recent Reviews</h2>
                <div style={styles.grid}>
                  {creatorProducts.filter(p => p.totalReviews > 0).length > 0 ? creatorProducts.filter(p => p.totalReviews > 0).slice(0, 5).map(p => (
                    <div key={p.id} style={styles.reviewMiniCard}>
                      <p style={styles.reviewProductName}>{p.title || p.name}</p>
                      <p style={styles.reviewRating}>{"★".repeat(Math.round(p.averageRating || 0))}{"☆".repeat(5 - Math.round(p.averageRating || 0))}<span style={{ color: "#64748b", marginLeft: "8px" }}>{p.totalReviews || 0} review{(p.totalReviews || 0) !== 1 ? "s" : ""}</span></p>
                      <Link to={`/product/${p.id}`} style={styles.reviewLink}>View reviews →</Link>
                    </div>
                  )) : <div style={styles.emptyCard}><p>No reviews yet.</p></div>}
                </div>
              </section>
            </>
          )}

          <Link to="/settings" style={styles.settingsCard}>
            <div style={styles.settingsCardContent}><span style={styles.settingsIcon}>⚙️</span><div><p style={styles.settingsTitle}>Settings</p><p style={styles.settingsSub}>Edit profile, switch role, account</p></div><span style={styles.settingsArrow}>→</span></div>
          </Link>
        </div>
      </div>
    );
  }

  // ========== PROMOTER DASHBOARD ==========
  if (role === "promoter") {
    const isApproved = promoterProfile?.status === "approved";
    const isPending = promoterProfile?.status === "pending_review";

    return (
      <div style={styles.page}>
        <div style={styles.container}>
          <div style={styles.header}>
            <div style={styles.headerLeft}>
              <div style={styles.avatar}>{userProfile?.profileImage ? <img src={userProfile.profileImage} alt="" style={styles.avatarImg} /> : <span style={styles.avatarPlaceholder}>👤</span>}</div>
              <div><h1 style={styles.title}>{userProfile?.displayName || userName}</h1><p style={styles.subtitle}>Promoter · {isApproved ? `@${promoterProfile.slug}` : isPending ? "Application under review" : "Apply to earn commissions"}</p></div>
            </div>
            <div style={styles.headerActions}>{isApproved && <Link to="/promote" style={styles.uploadBtn}>Promote Products</Link>}<button onClick={logout} style={styles.logoutBtn}>Sign Out</button></div>
          </div>
          {isPending && <div style={styles.pendingBanner}>⏳ Your promoter application is being reviewed.</div>}
          {!isApproved && !isPending && <div style={styles.applyCard}><h3>You haven't applied yet</h3><p>Submit your application to start promoting.</p><Link to="/apply-promoter" style={styles.uploadBtn}>Apply Now</Link></div>}
          {isApproved && (
            <>
              <div style={styles.statusGrid}>
                <div style={styles.statusCard}><p style={styles.cardTitle}>Total Clicks</p><p style={styles.cardValue}>{promoterProfile?.totalClicks || 0}</p></div>
                <div style={styles.statusCard}><p style={styles.cardTitle}>Total Sales</p><p style={styles.cardValue}>{promoterProfile?.totalSales || 0}</p></div>
                <div style={styles.statusCard}><p style={styles.cardTitle}>Earnings</p><p style={styles.cardValue}>${(promoterProfile?.totalEarnings || 0).toFixed(2)}</p></div>
              </div>
              <section style={styles.section}>
                <h2 style={styles.sectionTitle}>Products You Can Promote</h2>
                <div style={styles.grid}>
                  {loadingPromoter ? <div style={styles.emptyCard}><p>Loading…</p></div> : promoterProducts.length > 0 ? promoterProducts.slice(0, 6).map((p) => {
                    const link = generateReferralLink(p.id, promoterProfile.slug);
                    return <div key={p.id} style={styles.productCard}><div style={styles.productHeader}><span style={styles.productTitle}>{p.title || p.name}</span><span style={styles.productBadge}>${p.price?.toFixed(2) ?? "0.00"}</span></div><p style={styles.productDesc}>{p.description?.slice(0, 80)}...</p><button onClick={() => copyLink(link, p.id)} style={styles.copyBtn}>{copiedId === p.id ? "✓ Copied!" : "Copy Link"}</button></div>;
                  }) : <div style={styles.emptyCard}><p>No products available yet.</p></div>}
                </div>
                <Link to="/promote" style={{ ...styles.uploadBtn, display: "inline-block", marginTop: "20px" }}>View All Products</Link>
              </section>
            </>
          )}
          <Link to="/settings" style={styles.settingsCard}><div style={styles.settingsCardContent}><span style={styles.settingsIcon}>⚙️</span><div><p style={styles.settingsTitle}>Settings</p><p style={styles.settingsSub}>Edit profile, switch role, account</p></div><span style={styles.settingsArrow}>→</span></div></Link>
        </div>
      </div>
    );
  }

  // ========== BUYER DASHBOARD ==========
  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <div style={styles.headerLeft}><div style={styles.avatar}>{userProfile?.profileImage ? <img src={userProfile.profileImage} alt="" style={styles.avatarImg} /> : <span style={styles.avatarPlaceholder}>👤</span>}</div><div><h1 style={styles.title}>{userProfile?.displayName || userName}</h1><p style={styles.subtitle}>Buyer · Discover digital products</p></div></div>
          <button onClick={logout} style={styles.logoutBtn}>Sign Out</button>
        </div>
        <div style={styles.buyerCard}><div style={{ fontSize: "48px", marginBottom: "16px" }}>🛍️</div><h2>Ready to explore?</h2><p style={{ color: "#94a3b8", marginBottom: "24px" }}>Browse the marketplace to find worksheets, ebooks, digital art, and more.</p><Link to="/marketplace" style={styles.uploadBtn}>Browse Marketplace</Link></div>
        <div style={{ ...styles.section, marginTop: "32px" }}><h2 style={styles.sectionTitle}>Your Purchases</h2><div style={styles.emptyCard}><p>No purchases yet.</p></div></div>
        <Link to="/settings" style={styles.settingsCard}><div style={styles.settingsCardContent}><span style={styles.settingsIcon}>⚙️</span><div><p style={styles.settingsTitle}>Settings</p><p style={styles.settingsSub}>Edit profile, switch role, account</p></div><span style={styles.settingsArrow}>→</span></div></Link>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: "calc(100vh - 70px)", padding: "40px 24px", color: "#fff", background: "transparent", fontFamily: "Inter, sans-serif" },
  container: { maxWidth: "1140px", margin: "0 auto" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "20px", marginBottom: "30px" },
  headerLeft: { display: "flex", alignItems: "center", gap: "16px" },
  avatar: { width: "56px", height: "56px", borderRadius: "50%", overflow: "hidden", background: "rgba(79,124,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: "2px solid rgba(79,124,255,0.3)" },
  avatarImg: { width: "100%", height: "100%", objectFit: "cover" },
  avatarPlaceholder: { fontSize: "24px" },
  headerActions: { display: "flex", gap: "12px", flexWrap: "wrap" },
  title: { fontSize: "28px", margin: 0 },
  subtitle: { color: "#94a3b8", marginTop: "4px", maxWidth: "720px", lineHeight: 1.5, fontSize: "14px" },
  logoutBtn: { padding: "12px 20px", borderRadius: "14px", background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", color: "#fca5a5", cursor: "pointer", fontWeight: 600 },
  uploadBtn: { padding: "12px 20px", borderRadius: "14px", background: "linear-gradient(135deg, #4f7cff, #7c3aed)", color: "#fff", textDecoration: "none", fontWeight: 700, border: "none", cursor: "pointer", fontSize: "14px" },
  statusGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "18px", marginBottom: "32px" },
  statusCard: { padding: "24px", background: "rgba(255,255,255,0.05)", borderRadius: "22px", border: "1px solid rgba(79,124,255,0.14)" },
  cardTitle: { color: "#94a3b8", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: "10px" },
  cardValue: { fontSize: "34px", fontWeight: 800, margin: 0 },
  section: { marginTop: "24px" },
  sectionTitle: { fontSize: "28px", marginBottom: "18px" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "18px" },
  productCard: { padding: "22px", background: "rgba(255,255,255,0.06)", borderRadius: "18px", border: "1px solid rgba(79,124,255,0.14)", display: "flex", flexDirection: "column", gap: "12px" },
  productHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" },
  productTitle: { margin: 0, fontSize: "18px", fontWeight: 700 },
  productBadge: { padding: "6px 12px", background: "rgba(79,124,255,0.16)", borderRadius: "999px", color: "#a5b4ff", fontSize: "13px", fontWeight: 600 },
  productDesc: { color: "#cbd5e1", lineHeight: 1.75, flex: 1 },
  productFooter: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", flexWrap: "wrap", marginTop: "8px" },
  productActions: { display: "flex", gap: "8px" },
  statusPill: { padding: "6px 12px", borderRadius: "999px", background: "rgba(255,255,255,0.08)", color: "#94a3b8", fontSize: "12px", textTransform: "capitalize", fontWeight: 600 },
  viewBtn: { padding: "8px 14px", borderRadius: "10px", background: "rgba(79,124,255,0.15)", color: "#a5b4ff", textDecoration: "none", fontSize: "13px", fontWeight: 600 },
  copyBtn: { padding: "10px 16px", background: "linear-gradient(135deg, #4f7cff, #7c3aed)", color: "white", border: "none", borderRadius: "12px", cursor: "pointer", fontWeight: 700 },
  deleteBtn: { padding: "8px 14px", background: "rgba(239,68,68,0.15)", color: "#fca5a5", border: "1px solid rgba(239,68,68,0.5)", borderRadius: "10px", cursor: "pointer", fontWeight: 600, fontSize: "13px" },
  emptyCard: { gridColumn: "1/-1", padding: "40px", borderRadius: "20px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", textAlign: "center", color: "#94a3b8" },
  pendingBanner: { padding: "20px 24px", borderRadius: "16px", background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.3)", color: "#fde68a", marginBottom: "24px", fontWeight: 600 },
  applyCard: { padding: "40px", borderRadius: "20px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(79,124,255,0.14)", textAlign: "center", marginBottom: "24px" },
  buyerCard: { padding: "60px 40px", borderRadius: "24px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(79,124,255,0.14)", textAlign: "center" },
  reviewMiniCard: { padding: "16px", borderRadius: "14px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(79,124,255,0.1)" },
  reviewProductName: { fontSize: "15px", fontWeight: 600, margin: 0 },
  reviewRating: { color: "#fbbf24", marginTop: "6px", fontSize: "14px" },
  reviewLink: { color: "#a5b4ff", textDecoration: "none", fontSize: "13px", display: "inline-block", marginTop: "8px" },
  settingsCard: { display: "block", marginTop: "32px", padding: "20px 24px", borderRadius: "16px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(79,124,255,0.1)", textDecoration: "none" },
  settingsCardContent: { display: "flex", alignItems: "center", gap: "16px" },
  settingsIcon: { fontSize: "24px" },
  settingsTitle: { margin: 0, fontSize: "16px", fontWeight: 600, color: "#fff" },
  settingsSub: { margin: "4px 0 0", fontSize: "13px", color: "#94a3b8" },
  settingsArrow: { marginLeft: "auto", color: "#94a3b8", fontSize: "18px" },
};

export default Dashboard;