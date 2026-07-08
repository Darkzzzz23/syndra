import { useContext, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { uploadProductFile, createProduct } from "../services/productService";

const categories = ["Worksheets", "Study Guides", "E-books", "Digital Art", "Templates", "Printables", "Other"];

function ProductUpload() {
  const { currentUser, userProfile } = useContext(AuthContext);
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const [price, setPrice] = useState("");
  const [file, setFile] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  if (userProfile?.creatorStatus && userProfile.creatorStatus !== "approved") {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <h2 style={styles.title}>Access Restricted</h2>
          <p style={styles.subtitle}>Your creator account is pending approval.</p>
          <Link to="/dashboard" style={styles.link}>← Back to Dashboard</Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !description || !file || !price) { setError("Please fill in all required fields."); return; }
    setLoading(true); setError(""); setSuccess("");
    try {
      const fileUrl = await uploadProductFile(currentUser.uid, file);
      let thumbnailUrl = "";
      if (thumbnail) thumbnailUrl = await uploadProductFile(currentUser.uid, thumbnail);
      await createProduct({ title, description, category, price: Number(price), ownerUid: currentUser.uid, creatorEmail: currentUser.email, fileUrl, thumbnailUrl });
      setSuccess("Product submitted for review!");
      setTitle(""); setDescription(""); setCategory(categories[0]); setPrice(""); setFile(null); setThumbnail(null);
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (err) { setError("Upload failed. Please try again."); }
    finally { setLoading(false); }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.title}>Upload a Product</h2>
        <p style={styles.subtitle}>Submit your digital product for review</p>

        {error && <div style={styles.errorBox}>{error}</div>}
        {success && <div style={styles.successBox}>{success}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>Title *
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Algebra Worksheet Pack" style={styles.input} required />
          </label>
          <label style={styles.label}>Description *
            <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe your product..." style={{ ...styles.input, minHeight: "100px" }} required />
          </label>
          <div style={styles.row}>
            <label style={{ ...styles.label, flex: 1 }}>Category
              <select value={category} onChange={e => setCategory(e.target.value)} style={styles.input}>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </label>
            <label style={{ ...styles.label, flex: 1 }}>Price ($) *
              <input type="number" min="0" step="0.01" value={price} onChange={e => setPrice(e.target.value)} placeholder="9.99" style={styles.input} required />
            </label>
          </div>
          <label style={styles.label}>Product File *
            <input type="file" onChange={e => setFile(e.target.files?.[0] || null)} style={styles.fileInput} required />
          </label>
          <label style={styles.label}>Thumbnail Image
            <input type="file" accept="image/*" onChange={e => setThumbnail(e.target.files?.[0] || null)} style={styles.fileInput} />
          </label>
          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? "Uploading..." : "Submit for Review"}
          </button>
        </form>

        <Link to="/dashboard" style={{ ...styles.link, display: "block", textAlign: "center", marginTop: "16px" }}>← Back to Dashboard</Link>
      </div>
    </div>
  );
}

const styles = {
  page: { display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "linear-gradient(180deg, #F8F9FC 0%, #EEF0F5 100%)", fontFamily: "'Inter', sans-serif", padding: "40px 24px" },
  card: { background: "#fff", border: "1px solid #E8EAEF", borderRadius: "20px", padding: "36px 28px", maxWidth: "580px", width: "100%", boxShadow: "0 4px 24px rgba(0,0,0,0.04)" },
  title: { fontSize: "24px", fontWeight: 700, margin: 0, color: "#1A1D26" },
  subtitle: { color: "#6B7280", marginTop: "4px", fontSize: "14px", marginBottom: "20px" },
  errorBox: { padding: "12px", borderRadius: "10px", background: "#FEF2F2", color: "#EF4444", fontSize: "13px", marginBottom: "16px" },
  successBox: { padding: "12px", borderRadius: "10px", background: "#ECFDF5", color: "#10B981", fontSize: "13px", marginBottom: "16px" },
  form: { display: "flex", flexDirection: "column", gap: "14px" },
  label: { display: "flex", flexDirection: "column", gap: "6px", fontSize: "13px", color: "#4B5563", fontWeight: 500 },
  input: { padding: "12px 14px", borderRadius: "10px", border: "1px solid #E0E3E8", fontSize: "14px", outline: "none", background: "#F8F9FC" },
  row: { display: "flex", gap: "12px" },
  fileInput: { padding: "10px", fontSize: "13px", color: "#6B7280" },
  button: { padding: "12px", borderRadius: "10px", border: "none", background: "#6C5CE7", color: "#fff", fontWeight: 600, fontSize: "15px", cursor: "pointer", marginTop: "4px" },
  link: { color: "#6C5CE7", textDecoration: "none", fontSize: "13px", fontWeight: 500 },
};

export default ProductUpload;