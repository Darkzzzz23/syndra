import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { uploadProductFile, createProduct } from "../services/productService";

const categories = [
  "Worksheets",
  "Study Guides",
  "E-books",
  "Digital Art",
  "Templates",
  "Printables",
  "Other",
];

function ProductUpload() {
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const [price, setPrice] = useState(0);
  const [file, setFile] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!currentUser) return;
    if (!title || !description || !file) {
      setError("Please complete all fields and attach a product file.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Upload main product file
      const fileUrl = await uploadProductFile(currentUser.uid, file);

      // Upload thumbnail if provided
      let thumbnailUrl = "";
      if (thumbnail) {
        thumbnailUrl = await uploadProductFile(currentUser.uid, thumbnail);
      }

      // Upload preview images if provided
      let previewUrls = [];
      if (previews.length > 0) {
        const uploadPromises = previews.map((preview) =>
          uploadProductFile(currentUser.uid, preview)
        );
        previewUrls = await Promise.all(uploadPromises);
      }

      await createProduct({
        title,
        description,
        category,
        price,
        ownerUid: currentUser.uid,
        creatorEmail: currentUser.email,
        fileUrl,
        thumbnailUrl,
        previewUrls,
      });

      setSuccess("Product uploaded and submitted for review.");
      setTitle("");
      setDescription("");
      setCategory(categories[0]);
      setPrice(0);
      setFile(null);
      setThumbnail(null);
      setPreviews([]);
      setTimeout(() => navigate("/dashboard"), 1400);
    } catch (uploadError) {
      console.error("Product upload failed", uploadError);
      setError("Unable to upload product. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Upload a Product</h1>
            <p style={styles.subtitle}>
              Creators can submit digital products for review and marketplace listing.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          {error && <div style={styles.alertError}>{error}</div>}
          {success && <div style={styles.alertSuccess}>{success}</div>}

          <label style={styles.label}>
            Product Title
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a descriptive title"
              style={styles.input}
              required
            />
          </label>

          <label style={styles.label}>
            Description
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Write a clear description of the product"
              style={{ ...styles.input, minHeight: "140px" }}
              required
            />
          </label>

          <div style={styles.row}>
            <label style={{ ...styles.label, flex: 1 }}>
              Category
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={styles.input}
              >
                {categories.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label style={{ ...styles.label, flex: 1 }}>
              Price ($)
              <input
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                style={styles.input}
                required
              />
            </label>
          </div>

          <label style={styles.label}>
            Thumbnail Image
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setThumbnail(e.target.files?.[0] || null)}
              style={styles.input}
            />
          </label>

          <label style={styles.label}>
            Preview Images (optional)
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => setPreviews(Array.from(e.target.files || []))}
              style={styles.input}
            />
          </label>

          <label style={styles.label}>
            Product File *
            <input
              type="file"
              accept=".pdf,.zip,.jpg,.jpeg,.png,.gif,.webp,.svg,.eps,.ai,.psd,.mp4,.mov,.avi,.webm,.mp3,.wav,.epub,.mobi,.csv,.xlsx,.pptx,.docx,.txt,.rtf"
              onChange={(e) => {
                const selectedFile = e.target.files?.[0] || null;
                if (selectedFile) {
                  const blockedExtensions = [
                    ".exe", ".bat", ".cmd", ".com", ".msi", ".scr",
                    ".vbs", ".js", ".jar", ".apk", ".dmg", ".pif",
                    ".reg", ".sh", ".py", ".php", ".html", ".htm"
                  ];
                  const fileName = selectedFile.name.toLowerCase();
                  const isBlocked = blockedExtensions.some((ext) => fileName.endsWith(ext));
                  if (isBlocked) {
                    setError("This file type is not allowed for security reasons. Please upload a safe file format.");
                    e.target.value = "";
                    return;
                  }
                  if (selectedFile.size > 100 * 1024 * 1024) {
                    setError("File size must be under 100MB.");
                    e.target.value = "";
                    return;
                  }
                  setError("");
                }
                setFile(selectedFile);
              }}
              style={styles.input}
              required
            />
            <span style={styles.hint}>
              Allowed: PDF, ZIP, images, videos, EPUB, documents (max 100MB). No executable files.
            </span>
          </label>

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? "Uploading…" : "Submit for Review"}
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
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(79,124,255,0.18)",
    borderRadius: "24px",
    padding: "32px",
    boxShadow: "0 30px 80px rgba(0,0,0,0.25)",
  },
  header: {
    marginBottom: "24px",
  },
  title: {
    margin: 0,
    fontSize: "32px",
  },
  subtitle: {
    color: "#94a3b8",
    marginTop: "12px",
    lineHeight: 1.7,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "18px",
  },
  label: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    fontSize: "14px",
    color: "#cbd5e1",
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
  },
  hint: {
    fontSize: "12px",
    color: "#64748b",
    marginTop: "4px",
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

export default ProductUpload;