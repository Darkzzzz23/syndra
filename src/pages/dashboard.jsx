import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";

function Dashboard() {
  const { currentUser, userProfile } = useContext(AuthContext);
  const [role, setRole] = useState("customer");
  const [orders, setOrders] = useState([]);
  const [resellerBundles, setResellerBundles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!currentUser) return;
      try {
        // Get user role from profile
        if (userProfile?.resellerStatus === "active") {
          setRole("reseller");
        } else if (userProfile?.role === "promoter") {
          setRole("promoter");
        } else {
          setRole("customer");
        }

        // Get user's transactions
        const txQuery = query(
          collection(db, "transactions"),
          where("userId", "==", currentUser.uid)
        );
        const txSnap = await getDocs(txQuery);
        setOrders(txSnap.docs.map(d => ({ id: d.id, ...d.data() })));

        // Get user's bundles if reseller
        if (userProfile?.resellerStatus === "active" && userProfile?.currentBundleId) {
          const bundlesSnap = await getDocs(collection(db, "bundles"));
          setResellerBundles(bundlesSnap.docs.filter(d => d.id === userProfile.currentBundleId).map(d => ({ id: d.id, ...d.data() })));
        }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, [currentUser, userProfile]);



  if (loading) return <div style={styles.page}><p style={{ color: "#94A3B8", padding: "60px", textAlign: "center" }}>Loading...</p></div>;

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Dashboard</h1>
            <p style={styles.sub}>Welcome back, {userProfile?.email?.split("@")[0] || "User"}</p>
          </div>
          <span style={styles.roleBadge}>{role}</span>
        </div>

        {/* CUSTOMER VIEW */}
        {role === "customer" && (
          <div>
            <div style={styles.upgradeRow}>
              <div style={styles.upgradeCard}>
                <span style={styles.upgradeIcon}>📣</span>
                <h3 style={styles.upgradeTitle}>Become a Promoter</h3>
                <p style={styles.upgradeDesc}>Free to join. Share links. Earn commission on qualifying sales.</p>
                <button style={styles.btnPrimary}>Join Free</button>
              </div>
              <div style={styles.upgradeCard}>
                <span style={styles.upgradeIcon}>💼</span>
                <h3 style={styles.upgradeTitle}>Become a Reseller</h3>
                <p style={styles.upgradeDesc}>Purchase a bundle. Get products with resale rights.</p>
                <Link to="/reseller-program" style={styles.btnSecondary}>View Bundles</Link>
              </div>
            </div>

            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>Your Purchases</h2>
              {orders.length === 0 ? (
                <div style={styles.empty}>
                  <span style={{ fontSize: "32px", display: "block", marginBottom: "8px" }}>🛍️</span>
                  <p style={{ color: "#94A3B8" }}>No purchases yet.</p>
                  <Link to="/marketplace" style={styles.btnPrimary}>Browse Marketplace</Link>
                </div>
              ) : (
                orders.map(o => (
                  <div key={o.id} style={styles.row}>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 600, margin: 0 }}>{o.bundleName || o.productTitle || "Purchase"}</p>
                      <p style={{ color: "#94A3B8", fontSize: "12px", margin: "2px 0 0" }}>{o.paymentMethod} · {o.createdAt?.toDate?.().toLocaleDateString() || "—"}</p>
                    </div>
                    <span style={{ fontWeight: 700, color: "#06B6D4" }}>{o.amount} ETB</span>
                    <span style={{ fontSize: "11px", padding: "4px 10px", borderRadius: "20px", background: o.status === "paid" ? "rgba(16,185,129,0.15)" : "rgba(217,119,6,0.15)", color: o.status === "paid" ? "#10B981" : "#F59E0B", fontWeight: 600 }}>{o.status}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* PROMOTER VIEW */}
        {role === "promoter" && (
          <div>
            <div style={styles.statsRow}>
              {[
                { label: "Clicks", value: userProfile?.totalClicks || 0 },
                { label: "Sales", value: userProfile?.totalSales || 0 },
                { label: "Earnings", value: `${(userProfile?.totalEarnings || 0)} ETB` },
              ].map(s => (
                <div key={s.label} style={styles.statCard}>
                  <span style={styles.statValue}>{s.value}</span>
                  <span style={styles.statLabel}>{s.label}</span>
                </div>
              ))}
            </div>

            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>Your Referral Link</h2>
              <div style={styles.referralBox}>
                <code style={{ color: "#06B6D4", fontSize: "14px", wordBreak: "break-all" }}>
                  {typeof window !== "undefined" ? `${window.location.origin}/?ref=${currentUser.uid}` : ""}
                </code>
                <button
                  onClick={() => navigator.clipboard.writeText(`${window.location.origin}/?ref=${currentUser.uid}`)}
                  style={styles.copyBtn}
                >
                  Copy
                </button>
              </div>
            </div>

            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>Products to Promote</h2>
              <Link to="/marketplace" style={styles.btnPrimary}>Browse Marketplace</Link>
            </div>
          </div>
        )}

        {/* RESELLER VIEW */}
        {role === "reseller" && (
          <div>
            <div style={styles.statsRow}>
              {[
                { label: "Bundle", value: userProfile?.currentBundleName || "None" },
                { label: "Sales", value: userProfile?.totalSales || 0 },
                { label: "Earnings", value: `${(userProfile?.totalEarnings || 0)} ETB` },
              ].map(s => (
                <div key={s.label} style={styles.statCard}>
                  <span style={styles.statValue}>{s.value}</span>
                  <span style={styles.statLabel}>{s.label}</span>
                </div>
              ))}
            </div>

            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>Your Bundle</h2>
              {resellerBundles.length === 0 ? (
                <p style={{ color: "#94A3B8" }}>No active bundle found.</p>
              ) : (
                resellerBundles.map(b => (
                  <div key={b.id} style={styles.row}>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 600, margin: 0 }}>{b.name}</p>
                      <p style={{ color: "#94A3B8", fontSize: "12px", margin: "2px 0 0" }}>{b.price} ETB · {(b.productIds || []).length} products</p>
                    </div>
                    <span style={{ color: "#10B981", fontWeight: 600, fontSize: "12px" }}>Active</span>
                  </div>
                ))
              )}
            </div>

            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>Your Reseller Link</h2>
              <div style={styles.referralBox}>
                <code style={{ color: "#06B6D4", fontSize: "14px", wordBreak: "break-all" }}>
                  {typeof window !== "undefined" ? `${window.location.origin}/?ref=${currentUser.uid}` : ""}
                </code>
                <button
                  onClick={() => navigator.clipboard.writeText(`${window.location.origin}/?ref=${currentUser.uid}`)}
                  style={styles.copyBtn}
                >
                  Copy
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: { background: "#0A0E17", color: "#F8FAFB", fontFamily: "'Inter', sans-serif", minHeight: "100vh", padding: "40px 24px" },
  container: { maxWidth: "800px", margin: "0 auto" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px", flexWrap: "wrap", gap: "12px" },
  title: { fontSize: "28px", fontWeight: 700, margin: 0, letterSpacing: "-0.01em" },
  sub: { color: "#94A3B8", fontSize: "14px", marginTop: "4px" },
  roleBadge: { padding: "6px 14px", borderRadius: "20px", background: "rgba(6,182,212,0.1)", color: "#06B6D4", fontSize: "12px", fontWeight: 600, textTransform: "capitalize" },

  upgradeRow: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "32px" },
  upgradeCard: { background: "#1A1F2E", border: "1px solid #2D3548", borderRadius: "12px", padding: "28px 24px", textAlign: "center" },
  upgradeIcon: { fontSize: "32px", display: "block", marginBottom: "12px" },
  upgradeTitle: { fontSize: "16px", fontWeight: 600, marginBottom: "8px" },
  upgradeDesc: { color: "#94A3B8", fontSize: "13px", lineHeight: 1.5, marginBottom: "16px" },

  statsRow: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "32px" },
  statCard: { background: "#1A1F2E", border: "1px solid #2D3548", borderRadius: "8px", padding: "20px", textAlign: "center" },
  statValue: { display: "block", fontSize: "20px", fontWeight: 700, color: "#06B6D4", wordBreak: "break-all" },
  statLabel: { display: "block", color: "#94A3B8", fontSize: "12px", marginTop: "4px" },

  section: { background: "#1A1F2E", border: "1px solid #2D3548", borderRadius: "8px", padding: "24px", marginBottom: "16px" },
  sectionTitle: { fontSize: "16px", fontWeight: 600, margin: "0 0 16px" },
  empty: { textAlign: "center", padding: "40px 20px" },
  row: { display: "flex", alignItems: "center", padding: "14px 0", borderBottom: "1px solid rgba(45,53,72,0.5)", gap: "12px" },

  referralBox: { display: "flex", alignItems: "center", gap: "12px", background: "#0A0E17", border: "1px solid #2D3548", borderRadius: "8px", padding: "16px", flexWrap: "wrap" },
  copyBtn: { padding: "8px 16px", borderRadius: "6px", border: "none", background: "#06B6D4", color: "#0A0E17", fontWeight: 600, fontSize: "13px", cursor: "pointer" },

  btnPrimary: { padding: "10px 20px", borderRadius: "6px", background: "#06B6D4", color: "#0A0E17", fontWeight: 600, fontSize: "14px", textDecoration: "none", display: "inline-block", border: "none", cursor: "pointer" },
  btnSecondary: { padding: "10px 20px", borderRadius: "6px", border: "2px solid #06B6D4", color: "#06B6D4", fontWeight: 600, fontSize: "14px", textDecoration: "none", display: "inline-block", background: "transparent", cursor: "pointer" },
};

export default Dashboard;