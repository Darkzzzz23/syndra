import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { getAdminOverview, getTopProducts, getRecentUsers } from "../services/analyticsService";
import { getPendingProducts, updateProductStatus, deleteProduct } from "../services/productService";
import { getPendingPromoters, getApprovedPromoters, updatePromoterStatus } from "../services/promotionService";
import { getPendingWithdrawals, updateWithdrawalStatus, markWithdrawalPaid } from "../services/withdrawalService";
import { collection, query, where, getDocs, doc, setDoc } from "firebase/firestore";
import { db } from "../firebase/config";

function Admin() {
  const { currentUser, userProfile } = useContext(AuthContext);
  const adminRole = userProfile?.role;
  const isOwner = adminRole === "owner";

  const [stats, setStats] = useState({ users: 0, products: 0, clicks: 0 });
  const [pendingProducts, setPendingProducts] = useState([]);
  const [pendingPromoters, setPendingPromoters] = useState([]);
  const [approvedPromotersList, setApprovedPromotersList] = useState([]);
  const [pendingCreators, setPendingCreators] = useState([]);
  const [approvedCreators, setApprovedCreators] = useState([]);
  const [pendingWithdrawals, setPendingWithdrawals] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  const approvedWithdrawals = [];

  useEffect(() => {
    const load = async () => {
      try {
        const [
          overview, pending, pendingPromos,
          pendingCreatorsSnap, approvedCreatorsSnap, approvedPromotersSnap,
          withdrawals, top, users
        ] = await Promise.all([
          getAdminOverview(),
          getPendingProducts(),
          getPendingPromoters(),
          getApprovedPromoters(50),
          getDocs(query(collection(db, "users"), where("creatorStatus", "==", "pending_review"))),
          getDocs(query(collection(db, "users"), where("creatorStatus", "==", "approved"))),
          getDocs(query(collection(db, "promoters"), where("status", "==", "approved"))),
          getPendingWithdrawals(),
          getTopProducts(5),
          getRecentUsers(5),
        ]);
        setStats(overview);
        setPendingProducts(pending);
        setPendingPromoters(pendingPromos);
        setApprovedPromotersList(approvedPromotersSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        setPendingCreators(pendingCreatorsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        setApprovedCreators(approvedCreatorsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        setPendingWithdrawals(withdrawals);
        setTopProducts(top);
        setRecentUsers(users);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const refresh = async () => {
    const [
      pending, pendingPromos, withdrawals,
      pendingCreatorsSnap, approvedCreatorsSnap, approvedPromotersSnap
    ] = await Promise.all([
      getPendingProducts(),
      getPendingPromoters(),
      getApprovedPromoters(50),
      getPendingWithdrawals(),
      getDocs(query(collection(db, "users"), where("creatorStatus", "==", "pending_review"))),
      getDocs(query(collection(db, "users"), where("creatorStatus", "==", "approved"))),
      getDocs(query(collection(db, "promoters"), where("status", "==", "approved"))),
    ]);
    setPendingProducts(pending);
    setPendingPromoters(pendingPromos);
    setApprovedPromotersList(approvedPromotersSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    setPendingWithdrawals(withdrawals);
    setPendingCreators(pendingCreatorsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    setApprovedCreators(approvedCreatorsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  const handleProduct = async (id, status) => {
    await updateProductStatus(id, status, currentUser.uid);
    await refresh();
  };
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    await deleteProduct(id);
    await refresh();
  };
  const handlePromoter = async (id, status) => {
    await updatePromoterStatus(id, status);
    await refresh();
  };
  const handleCreator = async (uid, status) => {
    await setDoc(doc(db, "users", uid), { creatorStatus: status }, { merge: true });
    await refresh();
  };
  const handleWithdrawal = async (id, status) => {
    if (status === "paid") await markWithdrawalPaid(id, currentUser.uid);
    else await updateWithdrawalStatus(id, status, currentUser.uid);
    await refresh();
  };

  if (loading) return <div style={styles.page}><div style={styles.container}><p style={{ color: "#6B7280" }}>Loading...</p></div></div>;

  const tabs = [
    { key: "overview", label: "📊 Overview" },
    { key: "products", label: `📦 Products (${pendingProducts.length})` },
    { key: "creators", label: `🎨 Creators (${pendingCreators.length + approvedCreators.length})` },
    { key: "promoters", label: `📣 Promoters (${pendingPromoters.length + approvedPromotersList.length})` },
    { key: "withdrawals", label: `💸 Withdrawals (${pendingWithdrawals.length})` },
  ];

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>{isOwner ? "Owner Dashboard" : "Admin Dashboard"}</h1>
          <p style={styles.subtitle}>{isOwner ? "Full platform control" : "Manage products, creators, and promoters"}</p>
        </div>

        <div style={styles.statsRow}>
          {[
            { icon: "👥", label: "Total Users", value: stats.users, color: "#6C5CE7" },
            { icon: "📦", label: "Products", value: stats.products, color: "#00CECE" },
            { icon: "👆", label: "Clicks", value: stats.clicks, color: "#F59E0B" },
            { icon: "⭐", label: "Top Rated", value: topProducts[0]?.averageRating?.toFixed(1) || "—", color: "#10B981" },
          ].map(s => (
            <div key={s.label} style={styles.statCard}>
              <span style={styles.statIcon}>{s.icon}</span>
              <div><span style={styles.statValue}>{s.value}</span><span style={styles.statLabel}>{s.label}</span></div>
              <div style={{ ...styles.statBar, background: s.color }} />
            </div>
          ))}
        </div>

        <div style={styles.tabs}>
          {tabs.map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)} style={activeTab === t.key ? styles.tabActive : styles.tab}>
              {t.label}
            </button>
          ))}
        </div>

        <div style={styles.content}>
          {activeTab === "overview" && (
            <>
              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>🏆 Top Products</h3>
                <div style={styles.miniGrid}>
                  {topProducts.length === 0 && <p style={styles.emptyText}>No products yet.</p>}
                  {topProducts.map(p => (
                    <div key={p.id} style={styles.miniCard}>
                      <span style={styles.miniName}>{p.name || p.title || "Untitled"}</span>
                      <span style={styles.miniStat}>{p.totalClicks || 0} clicks</span>
                    </div>
                  ))}
                </div>
              </div>
              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>🆕 Recent Users</h3>
                {recentUsers.length === 0 && <p style={styles.emptyText}>No users yet.</p>}
                {recentUsers.map(u => (
                  <div key={u.id} style={styles.listRow}>
                    <span style={{ fontWeight: 500 }}>{u.email}</span>
                    <span style={{ color: "#6B7280", textTransform: "capitalize", fontSize: "13px" }}>{u.role || "user"}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {activeTab === "products" && (
            <div style={styles.cardGrid}>
              {pendingProducts.length === 0 && <p style={styles.emptyText}>No pending products.</p>}
              {pendingProducts.map(p => (
                <div key={p.id} style={styles.reviewCard}>
                  <span style={styles.reviewBadge}>{p.category}</span>
                  <h4 style={styles.reviewTitle}>{p.title || p.name}</h4>
                  <p style={styles.reviewDesc}>{p.description?.slice(0, 80)}...</p>
                  <div style={styles.reviewMeta}>by {p.creatorEmail} · ${p.price?.toFixed(2)}</div>
                  <div style={styles.reviewActions}>
                    <button onClick={() => handleProduct(p.id, "approved")} style={styles.btnApprove}>Approve</button>
                    <button onClick={() => handleProduct(p.id, "rejected")} style={styles.btnReject}>Reject</button>
                    <button onClick={() => handleDelete(p.id)} style={styles.btnDelete}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "creators" && (
            <div>
              {pendingCreators.length > 0 && (
                <>
                  <h4 style={{ color: "#6B7280", fontSize: "13px", marginBottom: "8px" }}>Pending Approval</h4>
                  <div style={styles.cardGrid}>
                    {pendingCreators.map(c => (
                      <div key={c.id} style={styles.reviewCard}>
                        <h4 style={styles.reviewTitle}>{c.displayName || c.email?.split("@")[0]}</h4>
                        <p style={styles.reviewDesc}>{c.email}</p>
                        <div style={styles.reviewActions}>
                          <button onClick={() => handleCreator(c.id, "approved")} style={styles.btnApprove}>Approve</button>
                          <button onClick={() => handleCreator(c.id, "rejected")} style={styles.btnReject}>Reject</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
              {approvedCreators.length > 0 && (
                <>
                  <h4 style={{ color: "#6B7280", fontSize: "13px", margin: "16px 0 8px" }}>Approved</h4>
                  <div style={styles.cardGrid}>
                    {approvedCreators.map(c => (
                      <div key={c.id} style={styles.reviewCard}>
                        <h4 style={styles.reviewTitle}>{c.displayName || c.email?.split("@")[0]}</h4>
                        <p style={styles.reviewDesc}>{c.email}</p>
                        <span style={{ ...styles.reviewBadge, background: "#D1FAE5", color: "#065F46" }}>Approved</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
              {pendingCreators.length === 0 && approvedCreators.length === 0 && <p style={styles.emptyText}>No creators.</p>}
            </div>
          )}

          {activeTab === "promoters" && (
            <div>
              {pendingPromoters.length > 0 && (
                <>
                  <h4 style={{ color: "#6B7280", fontSize: "13px", marginBottom: "8px" }}>Pending Approval</h4>
                  <div style={styles.cardGrid}>
                    {pendingPromoters.map(p => (
                      <div key={p.id} style={styles.reviewCard}>
                        <h4 style={styles.reviewTitle}>@{p.slug}</h4>
                        <p style={styles.reviewDesc}>{p.email}</p>
                        <div style={styles.reviewMeta}>IG: {p.socialStats?.instagram?.followers || 0} · TT: {p.socialStats?.tiktok?.followers || 0}</div>
                        <div style={styles.reviewActions}>
                          <button onClick={() => handlePromoter(p.id, "approved")} style={styles.btnApprove}>Approve</button>
                          <button onClick={() => handlePromoter(p.id, "rejected")} style={styles.btnReject}>Reject</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
              {approvedPromotersList.length > 0 && (
                <>
                  <h4 style={{ color: "#6B7280", fontSize: "13px", margin: "16px 0 8px" }}>Approved</h4>
                  <div style={styles.cardGrid}>
                    {approvedPromotersList.map(p => (
                      <div key={p.id} style={styles.reviewCard}>
                        <h4 style={styles.reviewTitle}>@{p.slug}</h4>
                        <p style={styles.reviewDesc}>{p.email}</p>
                        <span style={{ ...styles.reviewBadge, background: "#D1FAE5", color: "#065F46" }}>Approved</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
              {pendingPromoters.length === 0 && approvedPromotersList.length === 0 && <p style={styles.emptyText}>No promoters.</p>}
            </div>
          )}

          {activeTab === "withdrawals" && (
            <div style={styles.cardGrid}>
              {pendingWithdrawals.length === 0 && approvedWithdrawals.length === 0 && <p style={styles.emptyText}>No withdrawals.</p>}
              {[...pendingWithdrawals, ...approvedWithdrawals].map(w => (
                <div key={w.id} style={styles.reviewCard}>
                  <h4 style={styles.reviewTitle}>${w.amount.toFixed(2)}</h4>
                  <p style={styles.reviewDesc}>{w.email} · {w.role}</p>
                  <span style={{ ...styles.statusBadge, color: w.status === "approved" ? "#065F46" : w.status === "paid" ? "#1E40AF" : "#92400E", background: w.status === "approved" ? "#D1FAE5" : w.status === "paid" ? "#DBEAFE" : "#FEF3C7" }}>{w.status}</span>
                  <div style={styles.reviewActions}>
                    {w.status === "pending" && (
                      <>
                        <button onClick={() => handleWithdrawal(w.id, "approved")} style={styles.btnApprove}>Approve</button>
                        <button onClick={() => handleWithdrawal(w.id, "rejected")} style={styles.btnReject}>Reject</button>
                      </>
                    )}
                    {w.status === "approved" && (
                      <button onClick={() => handleWithdrawal(w.id, "paid")} style={styles.btnApprove}>Mark Paid</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { fontFamily: "'Inter', sans-serif", background: "linear-gradient(180deg, #F8F9FC 0%, #EEF0F5 100%)", minHeight: "100vh", padding: "40px 24px" },
  container: { maxWidth: "900px", margin: "0 auto" },
  header: { marginBottom: "24px" },
  title: { fontSize: "30px", fontWeight: 700, color: "#1A1D26", margin: 0 },
  subtitle: { color: "#6B7280", fontSize: "14px", marginTop: "2px" },
  statsRow: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "14px", marginBottom: "28px" },
  statCard: { background: "#fff", border: "1px solid #E8EAEF", borderRadius: "14px", padding: "18px", position: "relative", overflow: "hidden" },
  statIcon: { fontSize: "20px", display: "block", marginBottom: "8px" },
  statValue: { display: "block", fontSize: "24px", fontWeight: 700, color: "#1A1D26" },
  statLabel: { display: "block", color: "#6B7280", fontSize: "12px", marginTop: "2px" },
  statBar: { position: "absolute", bottom: 0, left: 0, height: "3px", width: "100%" },
  tabs: { display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "20px" },
  tab: { padding: "8px 16px", borderRadius: "10px", border: "1px solid #E5E7EB", background: "#fff", color: "#6B7280", fontWeight: 500, fontSize: "13px", cursor: "pointer" },
  tabActive: { padding: "8px 16px", borderRadius: "10px", border: "none", background: "#6C5CE7", color: "#fff", fontWeight: 600, fontSize: "13px", cursor: "pointer" },
  content: {},
  section: { marginBottom: "20px" },
  sectionTitle: { fontSize: "16px", fontWeight: 600, color: "#1A1D26", marginBottom: "10px" },
  miniGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "10px" },
  miniCard: { background: "#fff", border: "1px solid #E8EAEF", borderRadius: "12px", padding: "14px", display: "flex", justifyContent: "space-between", alignItems: "center" },
  miniName: { fontWeight: 500, fontSize: "13px", color: "#1A1D26" },
  miniStat: { color: "#6C5CE7", fontWeight: 600, fontSize: "12px" },
  listRow: { display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid #F3F4F6", fontSize: "13px" },
  cardGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "14px" },
  reviewCard: { background: "#fff", border: "1px solid #E8EAEF", borderRadius: "14px", padding: "18px", display: "flex", flexDirection: "column", gap: "8px" },
  reviewBadge: { display: "inline-block", padding: "3px 10px", borderRadius: "6px", background: "#F5F3FF", color: "#6C5CE7", fontSize: "11px", fontWeight: 600, alignSelf: "flex-start" },
  reviewTitle: { fontSize: "15px", fontWeight: 600, color: "#1A1D26", margin: 0 },
  reviewDesc: { color: "#6B7280", fontSize: "13px", margin: 0, lineHeight: 1.4 },
  reviewMeta: { color: "#9CA3AF", fontSize: "12px" },
  reviewActions: { display: "flex", gap: "6px", marginTop: "4px" },
  btnApprove: { padding: "6px 14px", borderRadius: "8px", border: "none", background: "#6C5CE7", color: "#fff", fontWeight: 600, fontSize: "12px", cursor: "pointer" },
  btnReject: { padding: "6px 14px", borderRadius: "8px", border: "1px solid #FCA5A5", background: "#FEF2F2", color: "#EF4444", fontWeight: 600, fontSize: "12px", cursor: "pointer" },
  btnDelete: { padding: "6px 14px", borderRadius: "8px", border: "1px solid #E5E7EB", background: "#fff", color: "#6B7280", fontWeight: 600, fontSize: "12px", cursor: "pointer" },
  statusBadge: { display: "inline-block", padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 600, textTransform: "capitalize", alignSelf: "flex-start" },
  emptyText: { color: "#9CA3AF", fontSize: "14px", textAlign: "center", padding: "40px" },
};

export default Admin;