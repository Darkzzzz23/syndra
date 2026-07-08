import { useContext, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { applyAsPromoter } from "../services/promotionService";

function ApplyPromoter() {
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [form, setForm] = useState({
    slug: "", instagramHandle: "", instagramFollowers: "",
    tiktokHandle: "", tiktokFollowers: "", experience: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.slug.trim()) { setError("Please choose a username."); return; }
    setLoading(true); setError(""); setSuccess("");
    try {
      await applyAsPromoter(currentUser.uid, currentUser.email, {
        slug: form.slug,
        socialStats: {
          instagram: { handle: form.instagramHandle, followers: Number(form.instagramFollowers) || 0 },
          tiktok: { handle: form.tiktokHandle, followers: Number(form.tiktokFollowers) || 0 },
        },
        experience: form.experience,
      });
      setSuccess("Application submitted! We'll review it shortly.");
      setTimeout(() => navigate("/dashboard"), 2000);
    } catch (err) { setError(err.message || "Failed to submit."); }
    finally { setLoading(false); }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <Link to="/dashboard" style={styles.back}>← Dashboard</Link>
        <h1 style={styles.title}>Become a Promoter</h1>
        <p style={styles.subtitle}>Share products you love and earn commission on every sale.</p>

        {error && <div style={styles.error}>{error}</div>}
        {success && <div style={styles.success}>{success}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>Choose your username *
            <input name="slug" value={form.slug} onChange={handleChange} placeholder="e.g. sarah99" style={styles.input} required />
            <span style={styles.hint}>This appears in your referral link: syndrahub.com/?ref=yourname</span>
          </label>
          <div style={styles.row}>
            <label style={styles.label}>Instagram Handle
              <input name="instagramHandle" value={form.instagramHandle} onChange={handleChange} placeholder="@handle" style={styles.input} />
            </label>
            <label style={styles.label}>Followers
              <input name="instagramFollowers" type="number" value={form.instagramFollowers} onChange={handleChange} placeholder="0" style={styles.input} />
            </label>
          </div>
          <div style={styles.row}>
            <label style={styles.label}>TikTok Handle
              <input name="tiktokHandle" value={form.tiktokHandle} onChange={handleChange} placeholder="@handle" style={styles.input} />
            </label>
            <label style={styles.label}>Followers
              <input name="tiktokFollowers" type="number" value={form.tiktokFollowers} onChange={handleChange} placeholder="0" style={styles.input} />
            </label>
          </div>
          <label style={styles.label}>Previous Experience
            <textarea name="experience" value={form.experience} onChange={handleChange} placeholder="Tell us about any promoting experience..." style={{ ...styles.input, minHeight: "80px" }} />
          </label>
          <button type="submit" disabled={loading} style={styles.btn}>
            {loading ? "Submitting..." : "Submit Application"}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  page: { fontFamily: "'Inter', sans-serif", background: "linear-gradient(180deg, #F8F9FC 0%, #EEF0F5 100%)", minHeight: "100vh", padding: "40px 24px", display: "flex", justifyContent: "center" },
  card: { background: "#fff", border: "1px solid #E8EAEF", borderRadius: "20px", padding: "36px 28px", maxWidth: "540px", width: "100%", boxShadow: "0 2px 8px rgba(0,0,0,0.03)" },
  back: { color: "#6C5CE7", textDecoration: "none", fontSize: "13px", fontWeight: 500 },
  title: { fontSize: "26px", fontWeight: 700, color: "#1A1D26", marginTop: "14px", marginBottom: "4px" },
  subtitle: { color: "#6B7280", fontSize: "14px", marginBottom: "20px" },
  error: { padding: "10px 14px", borderRadius: "10px", background: "#FEF2F2", color: "#EF4444", fontSize: "13px", marginBottom: "14px" },
  success: { padding: "10px 14px", borderRadius: "10px", background: "#ECFDF5", color: "#10B981", fontSize: "13px", marginBottom: "14px" },
  form: { display: "flex", flexDirection: "column", gap: "14px" },
  label: { display: "flex", flexDirection: "column", gap: "4px", fontSize: "13px", color: "#4B5563", fontWeight: 500 },
  input: { padding: "10px 14px", borderRadius: "10px", border: "1px solid #E0E3E8", fontSize: "14px", outline: "none", background: "#F8F9FC" },
  hint: { color: "#9CA3AF", fontSize: "11px", marginTop: "2px" },
  row: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" },
  btn: { padding: "12px", borderRadius: "10px", border: "none", background: "#6C5CE7", color: "#fff", fontWeight: 600, fontSize: "14px", cursor: "pointer", marginTop: "4px" },
};

export default ApplyPromoter;