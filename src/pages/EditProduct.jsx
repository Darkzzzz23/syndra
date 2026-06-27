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
  const [existingFileUrl, setExistingFileUrl] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const snap = await getDoc(doc(db, "products", id));
        if (!snap.exists()) {
          setError("Product not found.");
          setLoading(false);
          return;
        }
        const data = snap.data();
        if (data.ownerUid !== currentUser?.uid) {
          setError("You don't have permission to edit this product.");
          setLoading(false);
          return;
        }
        setTitle(data.title || "");
        setDescription(data.description || "");
        setCategory(data.category || categories[0]);
        setPrice(data.price || 0);
        setExistingFileUrl(data.fileUrl || "");
      } catch (err) {
        setError("Failed to load product.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, currentUser]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const updateData = {
        title,
        name: title,
        description,
        category,
        price: Number(price),
        updatedAt: serverTimestamp(),
      };

      // If new file uploaded, replace old one
      if (newFile) {
        const newUrl = await uploadProductFile(currentUser.uid, newFile);
        updateData.fileUrl = newUrl;
      }

      // If new thumbnail uploaded
      if (thumbnail) {
        const thumbUrl = await uploadProductFile(currentUser.uid, thumbnail);
        updateData.thumbnailUrl = thumbUrl;
      }

      await setDoc(doc(db, "products", id), updateData, { merge: true });
      setSuccess("Product updated!");
      setTimeout(() => navigate("/dashboard"), 1200);
    } catch (err) {
      setError("Failed to update product.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={styles.page}><p>Loading...</p></div>;
  if (error && !title) return <div style={styles.page}><p>{error}</p><Link to="/dashboard" style={styles.backLink}>← Back to Dashboard</Link></div>;

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <Link to="/dashboard" style={styles.backLink}>← Back to Dashboard</Link>
        <h1 style={styles.pageTitle}>Edit Product</h1>

        {error && <div style={styles.alertError}>{error}</div>}
        {success && <div style={styles.alertSuccess}>{success}</div>}

        <form onSubmit={handleSave} style={styles.form}>
          <label style={styles.label}>Title
            <input value={title} onChange={(e) => setTitle(e.target.value)} style={styles.input} required />
          </label>
          <label style={styles.label}>Description
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} style={{ ...styles.input, minHeight: "120px" }} required />
          </label>
          <div style={styles.row}>
            <label style={styles.label}>Category
              <select value={category} onChange={(e) => setCategory(e.target.value)} style={styles.select}>
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </label>
            <label style={styles.label}>Price ($)
              <input type="number" min="0" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} style={styles.input} required />
            </label>
          </div>
          <label style={styles.label}>Replace File (optional)
            <input type="file" onChange={(e) => setNewFile(e.target.files?.[0] || null)} style={styles.fileInput} />
            {existingFileUrl && <span style={styles.hint}>Current file will be kept if no new file is selected.</span>}
          </label>
          <label style={styles.label}>Replace Thumbnail (optional)
            <input type="file" accept="image/*" onChange={(e) => setThumbnail(e.target.files?.[0] || null)} style={styles.fileInput} />
          </label>
          <button type="submit" disabled={saving} style={styles.saveBtn}>
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: "calc(100vh - 70px)", padding: "40px 24px", color: "#fff", background: "linear-gradient(180deg, #05070d 0%, #0f172a 100%)", fontFamily: "Inter, sans-serif" },
  container: { maxWidth: "660px", margin: "0 auto" },
  backLink: { color: "#a5b4ff", textDecoration: "none", fontSize: "14px" },
  pageTitle: { fontSize: "28px", marginTop: "16px", marginBottom: "24px" },
  form: { display: "flex", flexDirection: "column", gap: "16px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(79,124,255,0.12)", borderRadius: "20px", padding: "28px" },
  label: { display: "flex", flexDirection: "column", gap: "6px", fontSize: "14px", color: "#cbd5e1" },
  input: { borderRadius: "12px", border: "1px solid rgba(148,163,184,0.2)", padding: "12px 14px", fontSize: "14px", background: "rgba(255,255,255,0.04)", color: "#fff", outline: "none" },
  select: { borderRadius: "12px", border: "1px solid rgba(148,163,184,0.2)", padding: "12px 14px", fontSize: "14px", background: "rgba(255,255,255,0.04)", color: "#fff", outline: "none", cursor: "pointer" },
  row: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" },
  fileInput: { borderRadius: "12px", border: "1px dashed rgba(148,163,184,0.3)", padding: "12px 14px", fontSize: "13px", background: "rgba(255,255,255,0.02)", color: "#94a3b8", cursor: "pointer" },
  hint: { fontSize: "11px", color: "#64748b", marginTop: "4px" },
  saveBtn: { padding: "14px 20px", borderRadius: "14px", border: "none", background: "linear-gradient(135deg, #4f7cff, #7c3aed)", color: "#fff", cursor: "pointer", fontWeight: 700, fontSize: "15px", marginTop: "8px" },
  alertError: { padding: "12px 16px", borderRadius: "12px", background: "rgba(248,113,113,0.16)", color: "#fecaca", marginBottom: "8px" },
  alertSuccess: { padding: "12px 16px", borderRadius: "12px", background: "rgba(34,197,94,0.16)", color: "#bbf7d0", marginBottom: "8px" },
};

export default EditProduct;