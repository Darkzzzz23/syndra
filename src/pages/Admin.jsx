import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { getAdminOverview, getTopProducts } from "../services/analyticsService";
import { getPendingProducts, updateProductStatus, deleteProduct } from "../services/productService";
import { getPendingPromoters, getApprovedPromoters, updatePromoterStatus } from "../services/promotionService";
import { getPendingWithdrawals, updateWithdrawalStatus, markWithdrawalPaid } from "../services/withdrawalService";
import { collection, query, where, getDocs, doc, setDoc } from "firebase/firestore";
import { db } from "../firebase/config";

function Admin() {
  const { currentUser, userProfile } = useContext(AuthContext);
  const isOwner = userProfile?.role === "owner";

  const [stats, setStats] = useState({ users: 0, products: 0, clicks: 0 });
  const [pendingProducts, setPendingProducts] = useState([]);
  const [pendingPromoters, setPendingPromoters] = useState([]);
  const [approvedPromoters, setApprovedPromoters] = useState([]);
  const [pendingCreators, setPendingCreators] = useState([]);
  const [approvedCreators, setApprovedCreators] = useState([]);
  const [pendingWithdrawals, setPendingWithdrawals] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("Overview");

  useEffect(() => {
    const load = async () => {
      try {
        const [overview, pending, pendingPromos, pendingCreatorsSnap, approvedCreatorsSnap, approvedPromotersSnap, withdrawals, top] = await Promise.all([
          getAdminOverview(), getPendingProducts(), getPendingPromoters(), getApprovedPromoters(50),
          getDocs(query(collection(db, "users"), where("creatorStatus", "==", "pending_review"))),
          getDocs(query(collection(db, "users"), where("creatorStatus", "==", "approved"))),
          getDocs(query(collection(db, "promoters"), where("status", "==", "approved"))),
          getPendingWithdrawals(), getTopProducts(5),
        ]);
        setStats(overview); setPendingProducts(pending); setPendingPromoters(pendingPromos);
        setApprovedPromoters(approvedPromotersSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        setPendingCreators(pendingCreatorsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        setApprovedCreators(approvedCreatorsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        setPendingWithdrawals(withdrawals); setTopProducts(top);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const refresh = async () => {
    const [pending, pendingPromos, withdrawals, pendingCreatorsSnap, approvedCreatorsSnap, approvedPromotersSnap] = await Promise.all([
      getPendingProducts(), getPendingPromoters(), getPendingWithdrawals(),
      getDocs(query(collection(db, "users"), where("creatorStatus", "==", "pending_review"))),
      getDocs(query(collection(db, "users"), where("creatorStatus", "==", "approved"))),
      getDocs(query(collection(db, "promoters"), where("status", "==", "approved"))),
    ]);
    setPendingProducts(pending); setPendingPromoters(pendingPromos);
    setApprovedPromoters(approvedPromotersSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    setPendingWithdrawals(withdrawals);
    setPendingCreators(pendingCreatorsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    setApprovedCreators(approvedCreatorsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  const handleProduct = async (id, status) => { await updateProductStatus(id, status, currentUser.uid); await refresh(); };
  const handleDelete = async (id) => { if (!window.confirm("Delete?")) return; await deleteProduct(id); await refresh(); };
  const handlePromoter = async (id, status) => { await updatePromoterStatus(id, status); await refresh(); };
  const handleCreator = async (uid, status) => { await setDoc(doc(db, "users", uid), { creatorStatus: status }, { merge: true }); await refresh(); };
  const handleWithdrawal = async (id, status) => { if (status === "paid") await markWithdrawalPaid(id, currentUser.uid); else await updateWithdrawalStatus(id, status, currentUser.uid); await refresh(); };

  const StatusBadge = ({ status }) => {
    const colors = { approved: "#10B981", pending: "#D97706", rejected: "#EF4444", paid: "#10B981", pending_review: "#D97706" };
    const bg = { approved: "rgba(16,185,129,0.15)", pending: "rgba(217,119,6,0.15)", rejected: "rgba(239,68,68,0.15)", paid: "rgba(16,185,129,0.15)", pending_review: "rgba(217,119,6,0.15)" };
    return <span style={{ fontSize: "10px", fontWeight: 600, textTransform: "uppercase", padding: "4px 8px", borderRadius: "4px", background: bg[status] || "#2D3548", color: colors[status] || "#94A3B8" }}>{status}</span>;
  };

  if (loading) return <div style={styles.page}><p style={{ padding: "60px", textAlign: "center", color: "#94A3B8" }}>Loading...</p></div>;

  const tabs = ["Overview", "Products", "Creators", "Promoters", "Withdrawals"];

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <Link to="/" style={{ color: "#06B6D4", textDecoration: "none", fontSize: "14px", fontWeight: 600 }}>Syndra</Link>
          <span style={styles.adminBadge}>Admin</span>
        </div>

        <h1 style={styles.title}>{isOwner ? "Owner Dashboard" : "Admin Dashboard"}</h1>

        <div style={styles.statsRow}>
          {[{ icon: "👥", label: "Users", value: stats.users, bar: "#06B6D4", bg: "rgba(6,182,212,0.1)" }, { icon: "📦", label: "Products", value: stats.products, bar: "#10B981", bg: "rgba(16,185,129,0.1)" }, { icon: "👆", label: "Clicks", value: stats.clicks, bar: "#D97706", bg: "rgba(217,119,6,0.1)" }, { icon: "⭐", label: "Top Rated", value: topProducts[0]?.averageRating?.toFixed(1) || "—", bar: "#EF4444", bg: "rgba(239,68,68,0.1)" }].map(s => (
            <div key={s.label} style={styles.statCard}>
              <div style={{ ...styles.statIcon, background: s.bg }}>{s.icon}</div>
              <p style={styles.statValue}>{s.value}</p>
              <p style={styles.statLabel}>{s.label}</p>
              <div style={{ ...styles.statBar, background: s.bar }} />
            </div>
          ))}
        </div>

        <div style={styles.tabRow}>
          {tabs.map(t => <button key={t} onClick={() => setTab(t)} style={tab === t ? styles.tabActive : styles.tab}>{t}</button>)}
        </div>

        {tab === "Overview" && (
          <div style={styles.overviewGrid}>
            {[{ title: "Pending Products", count: pendingProducts.length, color: "#D97706" }, { title: "Pending Creators", count: pendingCreators.length, color: "#06B6D4" }, { title: "Pending Promoters", count: pendingPromoters.length, color: "#EF4444" }, { title: "Pending Withdrawals", count: pendingWithdrawals.length, color: "#10B981" }].map(item => (
              <div key={item.title} style={styles.overviewCard}><span>{item.title}</span><span style={{ fontSize: "28px", fontWeight: 700, color: item.color }}>{item.count}</span></div>
            ))}
          </div>
        )}

        {tab === "Products" && (
          <div style={styles.listCard}>
            {pendingProducts.length === 0 && <p style={{ padding: "40px", textAlign: "center", color: "#94A3B8" }}>No pending products.</p>}
            {pendingProducts.map(p => (
              <div key={p.id} style={styles.listRow}>
                <div style={{ flex: 1 }}><p style={{ fontWeight: 500, fontSize: "14px", margin: 0 }}>{p.title || p.name}</p><p style={{ color: "#94A3B8", fontSize: "12px", margin: "2px 0 0" }}>{p.creatorEmail} · {p.category} · ${p.price?.toFixed(2)}</p></div>
                <StatusBadge status={p.status} />
                <div style={{ display: "flex", gap: "6px" }}>
                  <button onClick={() => handleProduct(p.id, "approved")} style={styles.btnApprove}>✓</button>
                  <button onClick={() => handleProduct(p.id, "rejected")} style={styles.btnReject}>✕</button>
                  <button onClick={() => handleDelete(p.id)} style={styles.btnDelete}>🗑</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "Creators" && (
          <div style={styles.listCard}>
            {[...pendingCreators, ...approvedCreators].length === 0 && <p style={{ padding: "40px", textAlign: "center", color: "#94A3B8" }}>No creators.</p>}
            {[...pendingCreators, ...approvedCreators].map(c => (
              <div key={c.id} style={styles.listRow}>
                <div style={styles.listAvatar}>{c.displayName?.[0] || c.email?.[0]}</div>
                <div style={{ flex: 1 }}><p style={{ fontWeight: 500, fontSize: "14px", margin: 0 }}>{c.displayName || c.email?.split("@")[0]}</p><p style={{ color: "#94A3B8", fontSize: "12px", margin: "2px 0 0" }}>{c.email}</p></div>
                <StatusBadge status={c.creatorStatus || "pending"} />
                {c.creatorStatus === "pending_review" && (
                  <div style={{ display: "flex", gap: "6px" }}>
                    <button onClick={() => handleCreator(c.id, "approved")} style={styles.btnApprove}>✓</button>
                    <button onClick={() => handleCreator(c.id, "rejected")} style={styles.btnReject}>✕</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {tab === "Promoters" && (
          <div style={styles.listCard}>
            {[...pendingPromoters, ...approvedPromoters].length === 0 && <p style={{ padding: "40px", textAlign: "center", color: "#94A3B8" }}>No promoters.</p>}
            {[...pendingPromoters, ...approvedPromoters].map(p => (
              <div key={p.id} style={styles.listRow}>
                <div style={{ ...styles.listAvatar, background: "rgba(239,68,68,0.15)", color: "#EF4444" }}>{p.slug?.[0]?.toUpperCase()}</div>
                <div style={{ flex: 1 }}><p style={{ fontWeight: 500, fontSize: "14px", margin: 0 }}>@{p.slug}</p><p style={{ color: "#94A3B8", fontSize: "12px", margin: "2px 0 0" }}>{p.email} · {p.totalClicks || 0} clicks</p></div>
                <StatusBadge status={p.status} />
                {p.status === "pending_review" && (
                  <div style={{ display: "flex", gap: "6px" }}>
                    <button onClick={() => handlePromoter(p.id, "approved")} style={styles.btnApprove}>✓</button>
                    <button onClick={() => handlePromoter(p.id, "rejected")} style={styles.btnReject}>✕</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {tab === "Withdrawals" && (
          <div style={styles.listCard}>
            {pendingWithdrawals.length === 0 && <p style={{ padding: "40px", textAlign: "center", color: "#94A3B8" }}>No withdrawals.</p>}
            {pendingWithdrawals.map(w => (
              <div key={w.id} style={styles.listRow}>
                <div style={{ flex: 1 }}><p style={{ fontWeight: 500, fontSize: "14px", margin: 0 }}>${w.amount.toFixed(2)}</p><p style={{ color: "#94A3B8", fontSize: "12px", margin: "2px 0 0" }}>{w.email} · {w.role}</p></div>
                <StatusBadge status={w.status} />
                <div style={{ display: "flex", gap: "6px" }}>
                  {w.status === "pending" && <><button onClick={() => handleWithdrawal(w.id, "approved")} style={styles.btnApprove}>✓</button><button onClick={() => handleWithdrawal(w.id, "rejected")} style={styles.btnReject}>✕</button></>}
                  {w.status === "approved" && <button onClick={() => handleWithdrawal(w.id, "paid")} style={{ ...styles.btnApprove, padding: "6px 12px", fontSize: "11px" }}>Mark Paid</button>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: { background: "#0A0E17", color: "#F8FAFB", fontFamily: "'Inter', sans-serif", minHeight: "100vh", padding: "40px 32px" },
  container: { maxWidth: "1000px", margin: "0 auto" },
  header: { display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" },
  adminBadge: { fontSize: "11px", fontWeight: 600, padding: "4px 10px", borderRadius: "4px", background: "rgba(6,182,212,0.15)", color: "#06B6D4", textTransform: "uppercase", letterSpacing: "0.05em" },
  title: { fontSize: "28px", fontWeight: 700, letterSpacing: "-0.01em", margin: "0 0 28px" },
  statsRow: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "28px" },
  statCard: { background: "#1A1F2E", border: "1px solid #2D3548", borderRadius: "8px", padding: "18px", position: "relative", overflow: "hidden" },
  statIcon: { width: "32px", height: "32px", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "12px", fontSize: "14px" },
  statValue: { fontSize: "22px", fontWeight: 700, margin: "0 0 2px" },
  statLabel: { fontSize: "12px", color: "#94A3B8", margin: 0 },
  statBar: { position: "absolute", bottom: 0, left: 0, right: 0, height: "2px" },
  tabRow: { display: "flex", gap: "0", borderBottom: "1px solid #2D3548", marginBottom: "24px" },
  tab: { padding: "10px 16px", border: "none", background: "transparent", color: "#94A3B8", cursor: "pointer", fontSize: "14px", borderBottom: "2px solid transparent", fontWeight: 400 },
  tabActive: { padding: "10px 16px", border: "none", background: "transparent", color: "#06B6D4", cursor: "pointer", fontSize: "14px", borderBottom: "2px solid #06B6D4", fontWeight: 500 },
  overviewGrid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" },
  overviewCard: { background: "#1A1F2E", border: "1px solid #2D3548", borderRadius: "8px", padding: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "14px", fontWeight: 500 },
  listCard: { background: "#1A1F2E", border: "1px solid #2D3548", borderRadius: "8px", overflow: "hidden" },
  listRow: { display: "flex", alignItems: "center", gap: "16px", padding: "16px 20px", borderBottom: "1px solid rgba(45,53,72,0.5)" },
  listAvatar: { width: "32px", height: "32px", borderRadius: "50%", background: "rgba(6,182,212,0.15)", color: "#06B6D4", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "12px", flexShrink: 0 },
  btnApprove: { width: "28px", height: "28px", borderRadius: "6px", border: "none", background: "rgba(16,185,129,0.15)", color: "#10B981", cursor: "pointer", fontWeight: 700, fontSize: "12px", display: "flex", alignItems: "center", justifyContent: "center" },
  btnReject: { width: "28px", height: "28px", borderRadius: "6px", border: "none", background: "rgba(239,68,68,0.15)", color: "#EF4444", cursor: "pointer", fontWeight: 700, fontSize: "12px", display: "flex", alignItems: "center", justifyContent: "center" },
  btnDelete: { width: "28px", height: "28px", borderRadius: "6px", border: "none", background: "#2D3548", color: "#94A3B8", cursor: "pointer", fontSize: "12px", display: "flex", alignItems: "center", justifyContent: "center" },
};

export default Admin;