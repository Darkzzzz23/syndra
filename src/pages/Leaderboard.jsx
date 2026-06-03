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
    const loadLeaderboard = async () => {
      try {
        const [creatorsSnap, promotersSnap] = await Promise.all([
          getDocs(query(collection(db, "users"), orderBy("totalRevenue", "desc"), limit(20))),
          getDocs(query(collection(db, "promoters"), where("status", "==", "approved"), orderBy("totalClicks", "desc"), limit(20))),
        ]);
        setTopCreators(creatorsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        setTopPromoters(promotersSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error("Leaderboard load failed:", err);
      } finally {
        setLoading(false);
      }
    };
    loadLeaderboard();
  }, []);

  if (loading) return <div style={styles.page}><p style={{ textAlign: "center", color: "#94a3b8" }}>Loading leaderboard...</p></div>;

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.title}>🏆 Leaderboard</h1>
        <p style={styles.subtitle}>Top performers on Syndra</p>

        <div style={styles.tabs}>
          <button onClick={() => setTab("creators")} style={tab === "creators" ? styles.tabActive : styles.tab}>🎨 Creators</button>
          <button onClick={() => setTab("promoters")} style={tab === "promoters" ? styles.tabActive : styles.tab}>📣 Promoters</button>
        </div>

        <div style={styles.list}>
          {(tab === "creators" ? topCreators : topPromoters).length > 0 ? (
            (tab === "creators" ? topCreators : topPromoters).map((entry, index) => (
              <div key={entry.id} style={styles.row}>
                <span style={{ ...styles.rank, color: index === 0 ? "#fbbf24" : index === 1 ? "#94a3b8" : index === 2 ? "#cd853f" : "#64748b" }}>
                  #{index + 1}
                </span>
                <span style={styles.name}>{entry.displayName || entry.email?.split("@")[0] || entry.slug || "Unknown"}</span>
                <span style={styles.stat}>
                  {tab === "creators" ? `$${(entry.totalRevenue || 0).toFixed(2)}` : `${entry.totalClicks || 0} clicks`}
                </span>
              </div>
            ))
          ) : (
            <p style={{ color: "#94a3b8", textAlign: "center" }}>No data yet.</p>
          )}
        </div>

        <Link to="/" style={styles.backLink}>← Back to Home</Link>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: "calc(100vh - 70px)", padding: "40px 24px", color: "#fff", background: "linear-gradient(180deg, #05070d 0%, #0f172a 100%)", fontFamily: "Inter, sans-serif" },
  container: { maxWidth: "600px", margin: "0 auto" },
  title: { fontSize: "36px", margin: 0, textAlign: "center" },
  subtitle: { color: "#94a3b8", textAlign: "center", marginTop: "8px", marginBottom: "28px" },
  tabs: { display: "flex", gap: "12px", justifyContent: "center", marginBottom: "24px" },
  tab: { padding: "10px 24px", borderRadius: "12px", border: "1px solid rgba(79,124,255,0.2)", background: "transparent", color: "#94a3b8", cursor: "pointer", fontWeight: 600 },
  tabActive: { padding: "10px 24px", borderRadius: "12px", border: "none", background: "linear-gradient(135deg, #4f7cff, #7c3aed)", color: "#fff", cursor: "pointer", fontWeight: 700 },
  list: { display: "flex", flexDirection: "column", gap: "8px" },
  row: { display: "flex", alignItems: "center", gap: "16px", padding: "16px 20px", borderRadius: "14px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(79,124,255,0.08)" },
  rank: { fontSize: "18px", fontWeight: 700, width: "40px" },
  name: { flex: 1, fontSize: "15px", fontWeight: 600 },
  stat: { fontSize: "15px", fontWeight: 700, color: "#a5b4ff" },
  backLink: { display: "inline-block", marginTop: "32px", color: "#a5b4ff", textDecoration: "none", textAlign: "center", width: "100%" },
};

export default Leaderboard;