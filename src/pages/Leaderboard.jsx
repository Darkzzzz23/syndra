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
        const [c, p] = await Promise.all([
          getDocs(query(collection(db, "users"), where("role", "==", "creator"), orderBy("totalRevenue", "desc"), limit(20))),
          getDocs(query(collection(db, "promoters"), where("status", "==", "approved"), orderBy("totalClicks", "desc"), limit(20))),
        ]);
        setTopCreators(c.docs.map(d => ({ id: d.id, ...d.data() })));
        setTopPromoters(p.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const list = tab === "creators" ? topCreators : topPromoters;
  const top3 = list.slice(0, 3);
  const rest = list.slice(3);
  const medals = ["🥇", "🥈", "🥉"];

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.hero}>
          <p style={styles.eyebrow}>Rankings</p>
          <h1 style={styles.title}>Leaderboard</h1>
          <p style={styles.sub}>Top creators and promoters ranked by earnings and reach.</p>
          <div style={styles.toggle}>
            {["creators", "promoters"].map(t => (
              <button key={t} onClick={() => setTab(t)} style={tab === t ? styles.toggleActive : styles.toggleBtn}>{t}</button>
            ))}
          </div>
        </div>

        {loading ? <p style={{ textAlign: "center", color: "#94A3B8", padding: "60px" }}>Loading...</p> : list.length === 0 ? (
          <div style={styles.empty}>
            <span style={{ fontSize: "40px", display: "block", marginBottom: "12px" }}>🏆</span>
            <h3>No data yet</h3>
            <p style={{ color: "#94A3B8" }}>Be the first to make the leaderboard!</p>
          </div>
        ) : (
          <>
            <div style={styles.podium}>
              {top3.map((person, i) => {
                const name = person.displayName || person.email?.split("@")[0] || person.slug || "?";
                const stat = tab === "creators" ? `$${(person.totalRevenue || 0).toFixed(0)}` : `${person.totalClicks || 0} clicks`;
                return (
                  <div key={person.id} style={{ ...styles.podiumCard, order: i === 0 ? -1 : 0, borderColor: i === 0 ? "#D97706" : "#2D3548" }}>
                    <div style={{ fontSize: "28px", marginBottom: "8px" }}>{medals[i]}</div>
                    <div style={styles.podiumAvatar}>{name[0]?.toUpperCase()}</div>
                    <p style={styles.podiumName}>{name}</p>
                    <p style={styles.podiumRole}>{tab === "creators" ? "Creator" : "Promoter"}</p>
                    <p style={styles.podiumStat}>{stat}</p>
                  </div>
                );
              })}
            </div>

            {rest.length > 0 && (
              <div style={styles.listCard}>
                {rest.map((person, i) => {
                  const name = person.displayName || person.email?.split("@")[0] || person.slug || "?";
                  const stat = tab === "creators" ? `$${(person.totalRevenue || 0).toFixed(0)}` : `${person.totalClicks || 0} clicks`;
                  return (
                    <div key={person.id} style={styles.listRow}>
                      <span style={styles.rank}>#{i + 4}</span>
                      <div style={styles.listAvatar}>{name[0]?.toUpperCase()}</div>
                      <div style={{ flex: 1 }}><p style={styles.listName}>{name}</p><p style={styles.listRole}>{tab === "creators" ? "Creator" : "Promoter"}</p></div>
                      <p style={styles.listStat}>{stat}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {tab === "promoters" && (
          <div style={{ textAlign: "center", marginTop: "32px" }}>
            <Link to="/pro-promoter" style={styles.ctaBtn}>Become a Pro Promoter</Link>
          </div>
        )}

        <footer style={styles.footer}>
          <span style={{ color: "#06B6D4", fontWeight: 700 }}>Syndra</span>
          <div style={{ display: "flex", gap: "20px" }}>
            <Link to="/legal" style={styles.footerLink}>Legal</Link>
            <Link to="/contact" style={styles.footerLink}>Contact</Link>
          </div>
        </footer>
      </div>
    </div>
  );
}

const styles = {
  page: { background: "#0A0E17", color: "#F8FAFB", fontFamily: "'Inter', sans-serif", minHeight: "100vh", padding: "60px 32px" },
  container: { maxWidth: "768px", margin: "0 auto" },
  hero: { textAlign: "center", marginBottom: "40px" },
  eyebrow: { fontSize: "12px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "#06B6D4", marginBottom: "12px" },
  title: { fontSize: "36px", fontWeight: 700, letterSpacing: "-0.02em", margin: "0 0 8px" },
  sub: { color: "#94A3B8", fontSize: "14px", marginBottom: "24px" },
  toggle: { display: "inline-flex", background: "#1A1F2E", borderRadius: "8px", padding: "4px" },
  toggleBtn: { padding: "8px 20px", borderRadius: "6px", border: "none", background: "transparent", color: "#94A3B8", cursor: "pointer", fontSize: "14px", fontWeight: 500, textTransform: "capitalize" },
  toggleActive: { padding: "8px 20px", borderRadius: "6px", border: "none", background: "#06B6D4", color: "#0A0E17", cursor: "pointer", fontSize: "14px", fontWeight: 600, textTransform: "capitalize" },
  podium: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "24px" },
  podiumCard: { background: "#1A1F2E", border: "1px solid #2D3548", borderRadius: "8px", padding: "24px", textAlign: "center" },
  podiumAvatar: { width: "48px", height: "48px", borderRadius: "50%", background: "#06B6D4", color: "#0A0E17", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "16px", margin: "0 auto 12px" },
  podiumName: { fontWeight: 700, fontSize: "14px", margin: "0 0 2px" },
  podiumRole: { fontSize: "12px", color: "#94A3B8", marginBottom: "8px" },
  podiumStat: { fontSize: "16px", fontWeight: 700, color: "#06B6D4" },
  listCard: { background: "#1A1F2E", border: "1px solid #2D3548", borderRadius: "8px", overflow: "hidden", marginBottom: "24px" },
  listRow: { display: "flex", alignItems: "center", gap: "16px", padding: "14px 20px", borderBottom: "1px solid rgba(45,53,72,0.5)" },
  rank: { fontSize: "14px", fontFamily: "monospace", fontWeight: 600, color: "#94A3B8", width: "28px" },
  listAvatar: { width: "36px", height: "36px", borderRadius: "50%", background: "#06B6D4", color: "#0A0E17", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "14px", flexShrink: 0 },
  listName: { fontWeight: 600, fontSize: "14px", margin: 0 },
  listRole: { fontSize: "12px", color: "#94A3B8", margin: "2px 0 0" },
  listStat: { fontSize: "14px", fontWeight: 700, color: "#06B6D4" },
  ctaBtn: { display: "inline-block", padding: "10px 24px", borderRadius: "6px", background: "#06B6D4", color: "#0A0E17", textDecoration: "none", fontWeight: 600, fontSize: "14px" },
  empty: { textAlign: "center", padding: "60px", color: "#94A3B8" },
  footer: { display: "flex", justifyContent: "space-between", padding: "32px 0 0", borderTop: "1px solid #2D3548", marginTop: "40px" },
  footerLink: { color: "#94A3B8", textDecoration: "none", fontSize: "13px" },
};

export default Leaderboard;