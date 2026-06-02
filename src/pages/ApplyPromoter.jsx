import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { applyAsPromoter } from "../services/promotionService";

function ApplyPromoter() {
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    slug: "",
    redditUsername: "",
    redditKarma: "",
    instagramHandle: "",
    instagramFollowers: "",
    tiktokHandle: "",
    tiktokFollowers: "",
    avgViews: "",
    engagementRate: "",
    experience: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) return;

    if (!form.slug.trim()) {
      setError("Please choose a username.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await applyAsPromoter(currentUser.uid, currentUser.email, form);
      setSuccess("Application submitted! We'll review it shortly.");
      setTimeout(() => navigate("/dashboard"), 2000);
    } catch (err) {
      setError(err.message || "Failed to submit application.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>Become a Promoter</h1>
          <p style={styles.subtitle}>
            Apply to become a Syndra promoter. Share products you love and earn commissions on every sale.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          {error && <div style={styles.alertError}>{error}</div>}
          {success && <div style={styles.alertSuccess}>{success}</div>}

          <label style={styles.label}>
            Choose Your Promoter Username *
            <input
              name="slug"
              value={form.slug}
              onChange={handleChange}
              placeholder="e.g. sarah99"
              style={styles.input}
              required
            />
            <span style={styles.hint}>This will appear in your referral links: syndra.com/go/product?ref=yourname</span>
          </label>

          <div style={styles.sectionTitle}>Social Media Stats</div>
          <p style={styles.sectionDesc}>Help us understand your reach. Fill in what applies to you.</p>

          <div style={styles.row}>
            <label style={styles.label}>
              Reddit Username
              <input name="redditUsername" value={form.redditUsername} onChange={handleChange} placeholder="@username" style={styles.input} />
            </label>
            <label style={styles.label}>
              Reddit Karma
              <input name="redditKarma" type="number" value={form.redditKarma} onChange={handleChange} placeholder="0" style={styles.input} />
            </label>
          </div>

          <div style={styles.row}>
            <label style={styles.label}>
              Instagram Handle
              <input name="instagramHandle" value={form.instagramHandle} onChange={handleChange} placeholder="@handle" style={styles.input} />
            </label>
            <label style={styles.label}>
              Instagram Followers
              <input name="instagramFollowers" type="number" value={form.instagramFollowers} onChange={handleChange} placeholder="0" style={styles.input} />
            </label>
          </div>

          <div style={styles.row}>
            <label style={styles.label}>
              TikTok Handle
              <input name="tiktokHandle" value={form.tiktokHandle} onChange={handleChange} placeholder="@handle" style={styles.input} />
            </label>
            <label style={styles.label}>
              TikTok Followers
              <input name="tiktokFollowers" type="number" value={form.tiktokFollowers} onChange={handleChange} placeholder="0" style={styles.input} />
            </label>
          </div>

          <div style={styles.row}>
            <label style={styles.label}>
              Average Views
              <input name="avgViews" type="number" value={form.avgViews} onChange={handleChange} placeholder="e.g. 5000" style={styles.input} />
            </label>
            <label style={styles.label}>
              Engagement Rate
              <input name="engagementRate" value={form.engagementRate} onChange={handleChange} placeholder="e.g. 4.2%" style={styles.input} />
            </label>
          </div>

          <label style={styles.label}>
            Previous Promotion Experience
            <textarea
              name="experience"
              value={form.experience}
              onChange={handleChange}
              placeholder="Tell us about any previous promotion or affiliate marketing experience..."
              style={{ ...styles.input, minHeight: "120px" }}
            />
          </label>

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? "Submitting…" : "Submit Application"}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "calc(100vh - 70px)",
    padding: "40px 24px",
    color: "#fff",
    background: "linear-gradient(180deg, #05070d 0%, #0f172a 100%)",
    fontFamily: "Inter, sans-serif",
  },
  container: {
    maxWidth: "760px",
    margin: "0 auto",
  },
  header: {
    marginBottom: "28px",
  },
  title: {
    fontSize: "34px",
    margin: 0,
  },
  subtitle: {
    color: "#94a3b8",
    marginTop: "10px",
    lineHeight: 1.7,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "18px",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(79,124,255,0.18)",
    borderRadius: "24px",
    padding: "32px",
  },
  sectionTitle: {
    fontSize: "20px",
    fontWeight: 700,
    marginTop: "10px",
  },
  sectionDesc: {
    color: "#94a3b8",
    fontSize: "14px",
    marginTop: "-10px",
  },
  label: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    fontSize: "14px",
    color: "#cbd5e1",
    flex: 1,
  },
  hint: {
    fontSize: "12px",
    color: "#64748b",
  },
  input: {
    borderRadius: "14px",
    border: "1px solid rgba(148,163,184,0.2)",
    padding: "14px 16px",
    fontSize: "14px",
    background: "rgba(255,255,255,0.04)",
    color: "#fff",
    outline: "none",
  },
  row: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "18px",
  },
  button: {
    padding: "16px 24px",
    borderRadius: "16px",
    border: "none",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: 700,
    background: "linear-gradient(135deg, #4f7cff, #7c3aed)",
    color: "#fff",
    marginTop: "10px",
  },
  alertError: {
    padding: "14px 18px",
    borderRadius: "16px",
    background: "rgba(248,113,113,0.16)",
    color: "#fecaca",
  },
  alertSuccess: {
    padding: "14px 18px",
    borderRadius: "16px",
    background: "rgba(34,197,94,0.16)",
    color: "#bbf7d0",
  },
};

export default ApplyPromoter;