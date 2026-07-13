import { useContext, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { uploadProductFile, createProduct } from "../services/productService";

const CATEGORIES = ["ChatGPT Prompts", "Claude Prompts", "AI Workflows", "Automation Templates", "Midjourney Prompts", "DALL-E Prompts", "Other AI Prompts"];

function ProductUpload() {
  const { currentUser, userProfile } = useContext(AuthContext);
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [price, setPrice] = useState("");
  const [thumbnail, setThumbnail] = useState(null);
  const [thumbnailName, setThumbnailName] = useState("");
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  if (userProfile?.creatorStatus && userProfile.creatorStatus !== "approved") {
    return (
      <div style={styles.page}>
        <div style={styles.card}><h2 style={styles.title}>Access Restricted</h2><p style={{ color: "#94A3B8" }}>Your creator account is pending approval.</p><Link to="/dashboard" style={{ color: "#06B6D4" }}>← Back</Link></div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !description || !file || !price) { setError("Please fill all required fields."); return; }
    setLoading(true); setError(""); setSuccess("");
    try {
      const fileUrl = await uploadProductFile(currentUser.uid, file);
      let thumbnailUrl = "";
      if (thumbnail) thumbnailUrl = await uploadProductFile(currentUser.uid, thumbnail);
      await createProduct({ title, description, category, price: Number(price), ownerUid: currentUser.uid, creatorEmail: currentUser.email, fileUrl, thumbnailUrl });
      setSuccess("Prompt submitted for review!");
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (err) { setError("Upload failed."); }
    finally { setLoading(false); }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <Link to="/dashboard" style={styles.back}>← Dashboard</Link>
        <div style={styles.card}>
          <h1 style={styles.title}>Upload Your AI Prompt</h1>
          <p style={styles.sub}>Share your ChatGPT, Claude, or AI workflow prompt. Keep 70% of every sale.</p>

          {error && <div style={styles.error}>{error}</div>}
          {success && <div style={styles.success}>{success}</div>}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px", marginTop: "24px" }}>
            <div>
              <label style={styles.label}>Prompt Title *</label>
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g., Advanced ChatGPT Writing Assistant" maxLength={100} style={styles.input} required />
              <span style={styles.hint}>{title.length}/100</span>
            </div>

            <div>
              <label style={styles.label}>Category *</label>
              <select value={category} onChange={e => setCategory(e.target.value)} style={styles.select}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label style={styles.label}>Price (USD) *</label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }}>$</span>
                <input type="number" min="0.99" max="999" step="0.01" value={price} onChange={e => setPrice(e.target.value)} placeholder="29" style={{ ...styles.input, paddingLeft: "28px" }} required />
              </div>
              <span style={styles.hint}>💡 Recommended: $15-49 for prompts</span>
            </div>

            <div>
              <label style={styles.label}>Description *</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Explain what your prompt does and how to use it. Include examples..." maxLength={1000} rows={5} style={{ ...styles.input, resize: "vertical", minHeight: "120px", fontFamily: "'Inter', sans-serif" }} required />
              <span style={styles.hint}>{description.length}/1000</span>
            </div>

            <div>
              <label style={styles.label}>Thumbnail Image</label>
              <button type="button" onClick={() => document.getElementById("thumbInput").click()} style={styles.uploadBox}>
                <span style={{ fontSize: "24px", display: "block", marginBottom: "8px" }}>🖼</span>
                <span style={{ fontSize: "14px", color: "#94A3B8" }}>{thumbnailName || "Click to upload thumbnail"}</span>
                <span style={{ fontSize: "12px", color: "#94A3B8", marginTop: "4px" }}>500x500px recommended</span>
              </button>
              <input id="thumbInput" type="file" accept="image/*" style={{ display: "none" }} onChange={e => { setThumbnail(e.target.files?.[0] || null); setThumbnailName(e.target.files?.[0]?.name || ""); }} />
            </div>

            <div>
              <label style={styles.label}>Prompt File *</label>
              <button type="button" onClick={() => document.getElementById("fileInput").click()} style={styles.uploadBox}>
                <span style={{ fontSize: "24px", display: "block", marginBottom: "8px" }}>📄</span>
                <span style={{ fontSize: "14px", color: "#94A3B8" }}>{fileName || "Click to upload your prompt file"}</span>
                <span style={{ fontSize: "12px", color: "#94A3B8", marginTop: "4px" }}>PDF, TXT, ZIP up to 50MB</span>
              </button>
              <input id="fileInput" type="file" style={{ display: "none" }} onChange={e => { setFile(e.target.files?.[0] || null); setFileName(e.target.files?.[0]?.name || ""); }} />
            </div>

            <div style={styles.tipsBox}>
              <p style={{ fontWeight: 600, margin: "0 0 8px" }}>💡 Tips for Great Prompts</p>
              <ul style={{ margin: 0, paddingLeft: "18px", color: "#94A3B8", fontSize: "13px", lineHeight: 1.8 }}>
                <li>Be specific about what the prompt does</li>
                <li>Include at least one real example output</li>
                <li>Mention any limitations or best practices</li>
                <li>Price competitively ($15-49 works best)</li>
                <li>Use a clear, descriptive title</li>
              </ul>
            </div>

            <button type="submit" disabled={loading} style={{ ...styles.btn, opacity: loading ? 0.6 : 1 }}>{loading ? "Uploading..." : "🚀 Upload Prompt"}</button>

            <p style={{ textAlign: "center", color: "#94A3B8", fontSize: "12px" }}>Your prompt will be reviewed within 24 hours. Once approved, it will appear in the marketplace.</p>
          </form>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { background: "#0A0E17", color: "#F8FAFB", fontFamily: "'Inter', sans-serif", minHeight: "100vh", padding: "60px 32px" },
  container: { maxWidth: "640px", margin: "0 auto" },
  back: { color: "#06B6D4", textDecoration: "none", fontSize: "14px" },
  card: { background: "#1A1F2E", border: "1px solid #2D3548", borderRadius: "12px", padding: "32px", marginTop: "16px" },
  title: { fontSize: "24px", fontWeight: 700, letterSpacing: "-0.01em", margin: "0 0 4px" },
  sub: { color: "#94A3B8", fontSize: "14px", margin: "0 0 8px" },
  error: { padding: "10px 14px", borderRadius: "6px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#EF4444", fontSize: "13px" },
  success: { padding: "10px 14px", borderRadius: "6px", background: "rgba(16,185,129,0.1)", border: "1px solid #10B981", color: "#10B981", fontSize: "13px" },
  label: { display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px" },
  input: { width: "100%", padding: "12px 14px", borderRadius: "6px", border: "1px solid #2D3548", background: "#0A0E17", color: "#F8FAFB", fontSize: "14px", outline: "none", boxSizing: "border-box" },
  select: { width: "100%", padding: "12px 14px", borderRadius: "6px", border: "1px solid #2D3548", background: "#0A0E17", color: "#F8FAFB", fontSize: "14px", outline: "none", cursor: "pointer", boxSizing: "border-box" },
  hint: { display: "block", color: "#94A3B8", fontSize: "12px", marginTop: "4px" },
  uploadBox: { width: "100%", padding: "28px", borderRadius: "8px", border: "2px dashed #2D3548", background: "transparent", cursor: "pointer", textAlign: "center", transition: "border-color 0.2s" },
  tipsBox: { padding: "16px", borderRadius: "8px", background: "rgba(6,182,212,0.06)", border: "1px solid rgba(6,182,212,0.15)" },
  btn: { width: "100%", padding: "14px", borderRadius: "6px", border: "none", background: "#06B6D4", color: "#0A0E17", fontWeight: 600, fontSize: "15px", cursor: "pointer" },
};

export default ProductUpload;