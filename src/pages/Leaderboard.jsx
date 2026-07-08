import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { collection, query, where, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";

function Leaderboard() {
  const [topCreators, setTopCreators] = useState([]);
  const [topPromoters, setTopPromoters] = useState([]);
  const [tab, setTab] = useState("creators");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [creatorsSnap, promotersSnap] = await Promise.all([
          getDocs(query(collection(db, "users"), where("role", "==", "creator"), orderBy("totalRevenue", "desc"), limit(20))),
          getDocs(query(collection(db, "promoters"), where("status", "==", "approved"), orderBy("totalClicks", "desc"), limit(20))),
        ]);
        setTopCreators(creatorsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        setTopPromoters(promotersSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const data = tab === "creators" ? topCreators : topPromoters;

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <Link to="/" style={styles.back}>← Home</Link>

        <div style={styles.header}>
          <h1 style={styles.title}>Leaderboard</h1>
          <p style={styles.subtitle}>Top performers on Syndra</p>
        </div>

        {/* Toggle */}
        <div style={styles.toggle}>
          <button onClick={() => setTab("creators")} style={tab === "creators" ? styles.toggleActive : styles.toggleBtn}>
            🎨 Creators
          </button>
          <button onClick={() => setTab("promoters")} style={tab === "promoters" ? styles.toggleActive : styles.toggleBtn}>
            📣 Promoters
          </button>
        </div>

        {/* List */}
        {loading ? (
          <p style={styles.empty}>Loading...</p>
        ) : data.length > 0 ? (
          <div style={styles.list}>
            {data.map((entry, i) => (
              <div key={entry.id} style={styles.row}>
                <div style={styles.rankCol}>
                  <span style={{
                    ...styles.rank,
                    color: i === 0 ? "#F59E0B" : i === 1 ? "#94A3B8" : i === 2 ? "#CD853F" : "#9CA3AF",
                    background: i === 0 ? "#FEF3C7" : i === 1 ? "#F1F5F9" : i === 2 ? "#FEF3C7" : "transparent",
                  }}>
                    #{i + 1}
                  </span>
                </div>
                <div style={styles.userCol}>
                  <span style={styles.avatar}>
                    {entry.displayName?.[0] || entry.email?.[0] || entry.slug?.[0] || "?"}
                  </span>
                  <div>
                    <span style={styles.name}>{entry.displayName || entry.email?.split("@")[0] || entry.slug || "Unknown"}</span>
                    <span style={styles.role}>{tab === "creators" ? "Creator" : "Promoter"}</span>
                  </div>
                </div>
                <div style={styles.statCol}>
                  <span style={styles.statValue}>
                    {tab === "creators" ? `$${(entry.totalRevenue || 0).toFixed(0)}` : `${entry.totalClicks || 0} clicks`}
                  </span>
                  <span style={styles.statLabel}>{tab === "creators" ? "earned" : "clicks"}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={styles.emptyState}>
            <span style={{ fontSize: "40px" }}>🏆</span>
            <h3>No data yet</h3>
            <p>Be the first to make it on the leaderboard!</p>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: { fontFamily: "'Inter', sans-serif", background: "linear-gradient(180deg, #F8F9FC 0%, #EEF0F5 100%)", minHeight: "100vh", padding: "40px 24px" },
  container: { maxWidth: "560px", margin: "0 auto" },
  back: { color: "#6C5CE7", textDecoration: "none", fontSize: "13px", fontWeight: 500 },
  header: { marginTop: "14px", marginBottom: "20px" },
  title: { fontSize: "30px", fontWeight: 700, color: "#1A1D26", margin: 0 },
  subtitle: { color: "#6B7280", fontSize: "14px", marginTop: "2px" },
  toggle: { display: "flex", gap: "8px", marginBottom: "24px" },
  toggleBtn: { flex: 1, padding: "10px", borderRadius: "12px", border: "1px solid #E5E7EB", background: "#fff", color: "#6B7280", fontWeight: 600, fontSize: "14px", cursor: "pointer" },
  toggleActive: { flex: 1, padding: "10px", borderRadius: "12px", border: "none", background: "#6C5CE7", color: "#fff", fontWeight: 600, fontSize: "14px", cursor: "pointer" },
  list: { display: "flex", flexDirection: "column", gap: "6px" },
  row: { display: "flex", alignItems: "center", gap: "14px", padding: "14px 16px", borderRadius: "14px", background: "#fff", border: "1px solid #E8EAEF" },
  rankCol: { width: "40px", textAlign: "center" },
  rank: { display: "inline-block", padding: "4px 8px", borderRadius: "8px", fontWeight: 700, fontSize: "13px" },
  userCol: { display: "flex", alignItems: "center", gap: "10px", flex: 1 },
  avatar: { width: "36px", height: "36px", borderRadius: "50%", background: "#F5F3FF", color: "#6C5CE7", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "14px", flexShrink: 0 },
  name: { display: "block", fontWeight: 600, fontSize: "14px", color: "#1A1D26" },
  role: { display: "block", color: "#9CA3AF", fontSize: "11px" },
  statCol: { textAlign: "right" },
  statValue: { display: "block", fontWeight: 700, fontSize: "15px", color: "#1A1D26" },
  statLabel: { display: "block", color: "#9CA3AF", fontSize: "11px" },
  empty: { textAlign: "center", color: "#9CA3AF", padding: "40px" },
  emptyState: { textAlign: "center", padding: "60px 20px", color: "#9CA3AF" },
};

export default Leaderboard;