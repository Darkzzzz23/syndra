import { useEffect, useState } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { verifyDownloadToken } from "../services/downloadService";

function Download() {
  const { orderId } = useParams();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState("loading");
  const [product, setProduct] = useState(null);

  useEffect(() => {
    const verify = async () => {
      try {
        const result = await verifyDownloadToken(orderId, null, token);
        if (!result.valid) {
          setStatus(result.reason);
          return;
        }
        const productRef = doc(db, "products", result.productId);
        const snap = await getDoc(productRef);
        if (snap.exists()) {
          setProduct(snap.data());
          setStatus("ready");
          // Auto-trigger download
          window.location.href = snap.data().fileUrl;
        } else {
          setStatus("invalid");
        }
      } catch (err) {
        setStatus("error");
      }
    };
    verify();
  }, [orderId, token]);

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {status === "loading" && <p>Verifying your download...</p>}
        {status === "ready" && <div style={styles.success}><h1>✅ Download Started</h1><p>{product?.title}</p><p style={{ color: "#94a3b8" }}>If download doesn't start, <a href={product?.fileUrl} style={{ color: "#a5b4ff" }}>click here</a>.</p></div>}
        {status === "used" && <div style={styles.error}><h1>❌ Link Already Used</h1><p>This download link has already been used.</p></div>}
        {status === "expired" && <div style={styles.error}><h1>⏰ Link Expired</h1><p>Download links expire after 24 hours.</p></div>}
        {status === "invalid" && <div style={styles.error}><h1>❌ Invalid Link</h1><p>This download link is not valid.</p></div>}
        <Link to="/dashboard" style={styles.backLink}>← Back to Dashboard</Link>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "radial-gradient(circle at top, #0f172a, #05070d)", color: "#fff", fontFamily: "Inter, sans-serif", padding: "24px" },
  container: { textAlign: "center", maxWidth: "500px" },
  success: { padding: "40px", borderRadius: "20px", background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)" },
  error: { padding: "40px", borderRadius: "20px", background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)" },
  backLink: { display: "inline-block", marginTop: "24px", color: "#a5b4ff", textDecoration: "none" },
};

export default Download;