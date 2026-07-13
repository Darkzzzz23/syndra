import { useContext, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { applyAsPromoter } from "../services/promotionService";

function ApplyPromoter() {
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    username: "",
    instagram: "",
    instagramFollowers: "",
    tiktok: "",
    tiktokFollowers: "",
    experience: "",
  });

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));
  const isValid = form.username && form.experience.length >= 20;

  const handleSubmit = async () => {
    if (!isValid || !currentUser) return;
    setLoading(true); setError("");
    try {
      await applyAsPromoter(currentUser.uid, currentUser.email, {
        slug: form.username,
        socialStats: {
          instagram: { handle: form.instagram, followers: Number(form.instagramFollowers) || 0 },
          tiktok: { handle: form.tiktok, followers: Number(form.tiktokFollowers) || 0 },
        },
        experience: form.experience,
      });
      setSubmitted(true);
    } catch (err) { setError(err.message || "Failed to submit."); }
    finally { setLoading(false); }
  };

  if (submitted) {
    return (
      <div style={styles.page}>
        <div style={styles.successCard}>
          <span style={{ fontSize: "48px", display: "block", marginBottom: "16px" }}>🎉</span>
          <h1 style={styles.successTitle}>Application received!</h1>
          <p style={styles.successText}>We review applications within 24 hours. Check your dashboard for updates.</p>
          <button onClick={() => navigate("/dashboard")} style={styles.btn}>Go to Dashboard</button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <header style={styles.topbar}>
        <div style={styles.topbarInner}>
          <button onClick={() => navigate("/pro-promoter")} style={styles.topbarBack}>← Pro Promoter</button>
          <span style={{ color: "rgba(0,0,0,0.1)" }}>|</span>
          <span style={{ fontWeight: 600, fontSize: "14px", fontFamily: "'DM Sans', sans-serif" }}>Apply</span>
        </div>
      </header>

      <div style={styles.container}>
        <div style={styles.card}>
          <div style={{ marginBottom: "32px" }}>
            <span style={styles.badge}>✦ Pro Promoter Application</span>
            <h1 style={styles.title}>Become a Pro Promoter</h1>
            <p style={styles.subtitle}>Tell us about yourself and your audience. Most applications are reviewed within 24 hours.</p>
          </div>

          {error && <div style={styles.error}>{error}</div>}

          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div>
              <label style={styles.label}>Syndra username</label>
              <input type="text" value={form.username} onChange={e => set("username", e.target.value)} placeholder="@yourhandle" style={styles.input} />
            </div>

            <div>
              <label style={styles.label}>Instagram handle</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <input type="text" value={form.instagram} onChange={e => set("instagram", e.target.value)} placeholder="@instagram" style={styles.input} />
                <input type="number" value={form.instagramFollowers} onChange={e => set("instagramFollowers", e.target.value)} placeholder="Followers" style={styles.input} />
              </div>
            </div>

            <div>
              <label style={styles.label}>TikTok handle</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <input type="text" value={form.tiktok} onChange={e => set("tiktok", e.target.value)} placeholder="@tiktok" style={styles.input} />
                <input type="number" value={form.tiktokFollowers} onChange={e => set("tiktokFollowers", e.target.value)} placeholder="Followers" style={styles.input} />
              </div>
              <p style={{ fontSize: "12px", color: "#7a7a8a", marginTop: "4px" }}>Leave blank if you don't use that platform.</p>
            </div>

            <div>
              <label style={styles.label}>Your experience & audience</label>
              <textarea value={form.experience} onChange={e => set("experience", e.target.value)} rows={5} placeholder="Tell us about your audience, content, and why you want to join..." style={{ ...styles.input, resize: "none" }} />
              <p style={{ fontSize: "12px", color: "#7a7a8a", marginTop: "4px" }}>{form.experience.length} characters (min. 20)</p>
            </div>

            <div>
              <button onClick={handleSubmit} disabled={!isValid || loading} style={{ ...styles.btn, opacity: !isValid || loading ? 0.4 : 1, cursor: !isValid || loading ? "not-allowed" : "pointer" }}>
                {loading ? "Submitting..." : "Submit Application"}
              </button>
              <p style={{ textAlign: "center", fontSize: "12px", color: "#7a7a8a", marginTop: "12px" }}>
                By applying you agree to the <Link to="/legal" style={{ color: "#6C5CE7" }}>Promoter Terms</Link>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { fontFamily: "'Inter', sans-serif", background: "rgba(245,245,247,0.5)", minHeight: "100vh" },
  successCard: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", textAlign: "center", padding: "24px", background: "#fff" },
  successTitle: { fontFamily: "'DM Sans', sans-serif", fontSize: "24px", fontWeight: 700, letterSpacing: "-0.02em", margin: "0 0 12px" },
  successText: { fontSize: "14px", color: "#7a7a8a", maxWidth: "320px", lineHeight: 1.6, margin: "0 0 32px" },
  btn: { padding: "14px 24px", borderRadius: "8px", border: "none", background: "#6C5CE7", color: "#fff", fontWeight: 600, fontSize: "14px", cursor: "pointer", width: "100%" },
  topbar: { position: "sticky", top: 0, zIndex: 50, background: "#fff", borderBottom: "1px solid rgba(0,0,0,0.08)" },
  topbarInner: { maxWidth: "672px", margin: "0 auto", padding: "0 24px", height: "56px", display: "flex", alignItems: "center", gap: "16px" },
  topbarBack: { display: "flex", alignItems: "center", gap: "6px", fontSize: "14px", color: "#7a7a8a", background: "none", border: "none", cursor: "pointer" },
  container: { maxWidth: "672px", margin: "0 auto", padding: "40px 24px" },
  card: { background: "#fff", border: "1px solid rgba(0,0,0,0.08)", borderRadius: "12px", padding: "32px" },
  badge: { display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: 600, padding: "4px 12px", background: "#ede9ff", color: "#6C5CE7", borderRadius: "999px", marginBottom: "16px" },
  title: { fontFamily: "'DM Sans', sans-serif", fontSize: "24px", fontWeight: 700, letterSpacing: "-0.02em", margin: "0 0 4px" },
  subtitle: { fontSize: "14px", color: "#7a7a8a", margin: 0 },
  error: { padding: "10px 14px", borderRadius: "10px", background: "#FEF2F2", color: "#EF4444", fontSize: "13px", marginBottom: "16px" },
  label: { display: "block", fontSize: "14px", fontWeight: 500, marginBottom: "6px", color: "#0f0f0f" },
  input: { width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid rgba(0,0,0,0.08)", fontSize: "14px", outline: "none", boxSizing: "border-box", background: "#fff", color: "#0f0f0f", fontFamily: "'Inter', sans-serif" },
};

export default ApplyPromoter;