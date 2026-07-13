import { useContext, useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/config";
import { uploadProductFile } from "../services/productService";

const CATEGORIES = ["ChatGPT Prompts", "Claude Prompts", "AI Workflows", "Automation Templates", "Midjourney Prompts", "DALL-E Prompts", "Other AI Prompts"];

function EditProduct() {
  const { id } = useParams();
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [price, setPrice] = useState("");
  const [thumbnail, setThumbnail] = useState(null);
  const [thumbnailName, setThumbnailName] = useState("");
  const [newFile, setNewFile] = useState(null);
  const [fileName, setFileName] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const snap = await getDoc(doc(db, "products", id));
        if (!snap.exists() || snap.data().ownerUid !== currentUser?.uid) { setError("Not found."); setLoading(false); return; }
        const d = snap.data();
        setTitle(d.title || ""); setDescription(d.description || ""); setCategory(d.category || CATEGORIES[0]); setPrice(d.price || "");
        setThumbnailName(d.thumbnailUrl ? "Current thumbnail" : "");
      } catch (e) { setError("Failed to load."); }
      finally { setLoading(false); }
    };
    load();
  }, [id, currentUser]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true); setError(""); setSuccess("");
    try {
      const update = { title, name: title, description, category, price: Number(price), updatedAt: serverTimestamp() };
      if (newFile) update.fileUrl = await uploadProductFile(currentUser.uid, newFile);
      if (thumbnail) update.thumbnailUrl = await uploadProductFile(currentUser.uid, thumbnail);
      await setDoc(doc(db, "products", id), update, { merge: true });
      setSuccess("Updated!");
      setTimeout(() => navigate("/dashboard"), 1200);
    } catch (e) { setError("Failed to update."); }
    finally { setSaving(false); }
  };

  if (loading) return <div style={styles.page}><p style={{ color: "#94A3B8", padding: "60px", textAlign: "center" }}>Loading...</p></div>;
  if (error && !title) return <div style={styles.page}><div style={styles.container}><p style={{ color: "#94A3B8" }}>{error}</p><Link to="/dashboard" style={{ color: "#06B6D4" }}>← Back</Link></div></div>;

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <Link to="/dashboard" style={styles.back}>← Dashboard</Link>
        <div style={styles.card}>
          <h1 style={styles.title}>Edit Prompt</h1>
          {error && <div style={styles.error}>{error}</div>}
          {success && <div style={styles.success}>{success}</div>}
          <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "20px" }}>
            <div><label style={styles.label}>Title</label><input value={title} onChange={e => setTitle(e.target.value)} style={styles.input} required /></div>
            <div><label style={styles.label}>Description</label><textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} style={{ ...styles.input, resize: "vertical", fontFamily: "'Inter', sans-serif" }} required /></div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div><label style={styles.label}>Category</label><select value={category} onChange={e => setCategory(e.target.value)} style={styles.select}>{CATEGORIES.map(c => <option key={c}>{c}</option>)}</select></div>
              <div><label style={styles.label}>Price ($)</label><input type="number" value={price} onChange={e => setPrice(e.target.value)} style={styles.input} required /></div>
            </div>
            <div><label style={styles.label}>Replace Thumbnail</label><input type="file" accept="image/*" onChange={e => { setThumbnail(e.target.files?.[0] || null); setThumbnailName(e.target.files?.[0]?.name || ""); }} style={{ color: "#94A3B8", fontSize: "13px" }} />{thumbnailName && <p style={{ fontSize: "12px", color: "#94A3B8", marginTop: "4px" }}>{thumbnailName}</p>}</div>
            <div><label style={styles.label}>Replace File</label><input type="file" onChange={e => { setNewFile(e.target.files?.[0] || null); setFileName(e.target.files?.[0]?.name || ""); }} style={{ color: "#94A3B8", fontSize: "13px" }} />{fileName && <p style={{ fontSize: "12px", color: "#94A3B8", marginTop: "4px" }}>{fileName}</p>}</div>
            <button type="submit" disabled={saving} style={styles.btn}>{saving ? "Saving..." : "Save Changes"}</button>
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
  title: { fontSize: "24px", fontWeight: 700, letterSpacing: "-0.01em", margin: 0 },
  error: { padding: "10px 14px", borderRadius: "6px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#EF4444", fontSize: "13px", marginTop: "12px" },
  success: { padding: "10px 14px", borderRadius: "6px", background: "rgba(16,185,129,0.1)", border: "1px solid #10B981", color: "#10B981", fontSize: "13px", marginTop: "12px" },
  label: { display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px" },
  input: { width: "100%", padding: "12px 14px", borderRadius: "6px", border: "1px solid #2D3548", background: "#0A0E17", color: "#F8FAFB", fontSize: "14px", outline: "none", boxSizing: "border-box" },
  select: { width: "100%", padding: "12px 14px", borderRadius: "6px", border: "1px solid #2D3548", background: "#0A0E17", color: "#F8FAFB", fontSize: "14px", outline: "none", cursor: "pointer", boxSizing: "border-box" },
  btn: { width: "100%", padding: "14px", borderRadius: "6px", border: "none", background: "#06B6D4", color: "#0A0E17", fontWeight: 600, fontSize: "14px", cursor: "pointer", marginTop: "8px" },
};

export default EditProduct;