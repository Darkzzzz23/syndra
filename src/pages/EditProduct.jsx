import { useContext, useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/config";
import { uploadProductFile } from "../services/productService";

const categories = ["Worksheets", "Study Guides", "E-books", "Digital Art", "Templates", "Printables", "Other"];

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
  const [category, setCategory] = useState(categories[0]);
  const [price, setPrice] = useState(0);
  const [thumbnail, setThumbnail] = useState(null);
  const [newFile, setNewFile] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const snap = await getDoc(doc(db, "products", id));
        if (!snap.exists() || snap.data().ownerUid !== currentUser?.uid) { setError("Not found."); setLoading(false); return; }
        const d = snap.data();
        setTitle(d.title || ""); setDescription(d.description || ""); setCategory(d.category || categories[0]); setPrice(d.price || 0);
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

  if (loading) return <div style={styles.page}><p>Loading...</p></div>;
  if (error && !title) return <div style={styles.page}><p>{error}</p><Link to="/dashboard" style={{ color: "#6C5CE7" }}>← Back</Link></div>;

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <Link to="/dashboard" style={styles.back}>← Dashboard</Link>
        <h1 style={styles.title}>Edit Product</h1>
        {error && <div style={styles.alert}>{error}</div>}
        {success && <div style={{ ...styles.alert, background: "#ECFDF5", color: "#10B981" }}>{success}</div>}
        <form onSubmit={handleSave} style={styles.form}>
          <label style={styles.label}>Title
            <input value={title} onChange={e => setTitle(e.target.value)} style={styles.input} required />
          </label>
          <label style={styles.label}>Description
            <textarea value={description} onChange={e => setDescription(e.target.value)} style={{ ...styles.input, minHeight: "100px" }} required />
          </label>
          <div style={styles.row}>
            <label style={styles.label}>Category
              <select value={category} onChange={e => setCategory(e.target.value)} style={styles.input}>{categories.map(c => <option key={c}>{c}</option>)}</select>
            </label>
            <label style={styles.label}>Price ($)
              <input type="number" min="0" step="0.01" value={price} onChange={e => setPrice(e.target.value)} style={styles.input} required />
            </label>
          </div>
          <label style={styles.label}>Replace File (optional)
            <input type="file" onChange={e => setNewFile(e.target.files?.[0] || null)} style={styles.fileInput} />
          </label>
          <label style={styles.label}>Replace Thumbnail (optional)
            <input type="file" accept="image/*" onChange={e => setThumbnail(e.target.files?.[0] || null)} style={styles.fileInput} />
          </label>
          <button type="submit" disabled={saving} style={styles.btn}>{saving ? "Saving..." : "Save Changes"}</button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  page: { fontFamily: "'Inter', sans-serif", background: "linear-gradient(180deg, #F8F9FC 0%, #EEF0F5 100%)", minHeight: "100vh", padding: "40px 24px", display: "flex", justifyContent: "center" },
  card: { background: "#fff", border: "1px solid #E8EAEF", borderRadius: "20px", padding: "32px 24px", maxWidth: "540px", width: "100%", boxShadow: "0 2px 8px rgba(0,0,0,0.03)" },
  back: { color: "#6C5CE7", textDecoration: "none", fontSize: "13px", fontWeight: 500 },
  title: { fontSize: "24px", fontWeight: 700, color: "#1A1D26", marginTop: "12px", marginBottom: "16px" },
  alert: { padding: "10px 14px", borderRadius: "10px", background: "#FEF2F2", color: "#EF4444", fontSize: "13px", marginBottom: "12px" },
  form: { display: "flex", flexDirection: "column", gap: "12px" },
  label: { display: "flex", flexDirection: "column", gap: "4px", fontSize: "13px", color: "#4B5563", fontWeight: 500 },
  input: { padding: "10px 14px", borderRadius: "10px", border: "1px solid #E0E3E8", fontSize: "14px", outline: "none", background: "#F8F9FC" },
  row: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" },
  fileInput: { fontSize: "13px", color: "#6B7280" },
  btn: { padding: "12px", borderRadius: "10px", border: "none", background: "#6C5CE7", color: "#fff", fontWeight: 600, fontSize: "14px", cursor: "pointer", marginTop: "4px" },
};

export default EditProduct;