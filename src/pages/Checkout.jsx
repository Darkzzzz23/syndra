import { useContext, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { addTransaction } from "../services/dbService";
import { uploadToCloudinary } from "../services/cloudinaryService";

function Checkout() {
  const { type, id } = useParams();
  const { currentUser } = useContext(AuthContext);
  const [paymentMethod, setPaymentMethod] = useState("telebirr");
  const [reference, setReference] = useState("");
  const [screenshot, setScreenshot] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const TELEBIRR_NUMBER = "0985742250";
  const CBE_NAME = "Joseph Thabit";
  const CBE_ACCOUNT = "1000668332238";

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    setScreenshot(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setScreenshotPreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setScreenshotPreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reference) { setError("Enter your transaction reference."); return; }
    if (!screenshot) { setError("Upload payment screenshot."); return; }

    setUploading(true);
    setError("");

    try {
      const screenshotUrl = await uploadToCloudinary(screenshot);

      await addTransaction({
        userId: currentUser.uid,
        userEmail: currentUser.email,
        type,
        itemId: id,
        paymentMethod,
        paymentReference: reference,
        screenshotUrl,
        status: "pending",
      });

      setDone(true);
    } catch (e) {
      setError("Failed to submit payment proof.");
      console.error(e);
    } finally {
      setUploading(false);
    }
  };

  if (done) {
    return (
      <div style={styles.page}>
        <div style={styles.successCard}>
          <div style={styles.successGlow} />
          <span style={styles.successIcon}>✅</span>
          <h1 style={styles.successTitle}>Payment Submitted</h1>
          <p style={styles.successSub}>We'll verify your payment within 24 hours. You'll get access once confirmed.</p>
          <div style={styles.successSteps}>
            <div style={styles.stepDone}><span>✓</span> Payment Sent</div>
            <div style={styles.stepLine} />
            <div style={styles.stepActive}><span>⏳</span> Verification</div>
            <div style={styles.stepLine} />
            <div style={styles.stepPending}><span>🔒</span> Access Granted</div>
          </div>
          <Link to="/dashboard" style={styles.btn}>Go to Dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.glow1} />
      <div style={styles.glow2} />

      <div style={styles.card}>
        <Link to="/marketplace" style={styles.back}>← Back to Marketplace</Link>

        <div style={styles.header}>
          <span style={styles.headerIcon}>💳</span>
          <div>
            <h1 style={styles.title}>Complete Your Payment</h1>
            <p style={styles.sub}>Choose a payment method and upload proof to confirm.</p>
          </div>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        {/* Payment Methods */}
        <div style={styles.methodsGrid}>
          <div onClick={() => setPaymentMethod("telebirr")} style={paymentMethod === "telebirr" ? styles.methodCardActive : styles.methodCard}>
            <span style={styles.methodIcon}>📱</span>
            <div>
              <p style={styles.methodName}>Telebirr</p>
              <p style={styles.methodDesc}>Send via mobile money</p>
            </div>
            <span style={styles.methodCheck}>{paymentMethod === "telebirr" ? "✓" : ""}</span>
          </div>

          <div onClick={() => setPaymentMethod("cbe")} style={paymentMethod === "cbe" ? styles.methodCardActive : styles.methodCard}>
            <span style={styles.methodIcon}>🏦</span>
            <div>
              <p style={styles.methodName}>CBE Bank</p>
              <p style={styles.methodDesc}>Bank transfer</p>
            </div>
            <span style={styles.methodCheck}>{paymentMethod === "cbe" ? "✓" : ""}</span>
          </div>
        </div>

        {/* Payment Details */}
        <div style={styles.paymentBox}>
          <span style={styles.paymentBoxLabel}>Send your payment to</span>
          {paymentMethod === "telebirr" ? (
            <>
              <span style={styles.paymentBoxNumber}>{TELEBIRR_NUMBER}</span>
              <span style={styles.paymentBoxName}>{CBE_NAME}</span>
              <button onClick={() => navigator.clipboard.writeText(TELEBIRR_NUMBER)} style={styles.copyBtn}>📋 Copy Number</button>
            </>
          ) : (
            <>
              <span style={styles.paymentBoxNumber}>{CBE_ACCOUNT}</span>
              <span style={styles.paymentBoxName}>{CBE_NAME}</span>
              <button onClick={() => navigator.clipboard.writeText(CBE_ACCOUNT)} style={styles.copyBtn}>📋 Copy Account</button>
            </>
          )}
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div>
            <label style={styles.label}>Transaction Reference / ID *</label>
            <input value={reference} onChange={e => setReference(e.target.value)} placeholder="e.g. FT123456789" style={styles.input} required />
            <p style={styles.hint}>Find this in your Telebirr or CBE confirmation message.</p>
          </div>

          <div>
            <label style={styles.label}>Payment Screenshot *</label>
            <label style={styles.uploadArea}>
              {screenshotPreview ? (
                <img src={screenshotPreview} alt="Payment proof" style={styles.preview} />
              ) : (
                <div style={styles.uploadPlaceholder}>
                  <span style={styles.uploadIcon}>📸</span>
                  <span style={styles.uploadText}>Click to upload screenshot</span>
                  <span style={styles.uploadHint}>PNG or JPG, max 5MB</span>
                </div>
              )}
              <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: "none" }} />
            </label>
            {screenshotPreview && (
              <button type="button" onClick={() => { setScreenshot(null); setScreenshotPreview(null); }} style={styles.removeBtn}>✕ Remove</button>
            )}
          </div>

          <button type="submit" disabled={uploading} style={styles.btn}>
            {uploading ? "Uploading Payment..." : "🔒 Submit Payment Proof"}
          </button>
        </form>

        <div style={styles.steps}>
          <div style={styles.step}>
            <span style={styles.stepNum}>1</span>
            <span style={styles.stepLabel}>Send Payment</span>
          </div>
          <div style={styles.stepArrow}>→</div>
          <div style={styles.step}>
            <span style={styles.stepNum}>2</span>
            <span style={styles.stepLabel}>Upload Proof</span>
          </div>
          <div style={styles.stepArrow}>→</div>
          <div style={styles.step}>
            <span style={styles.stepNum}>3</span>
            <span style={styles.stepLabel}>Get Access</span>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { background: "#0A0E17", color: "#F8FAFB", fontFamily: "'Inter', sans-serif", minHeight: "100vh", padding: "60px 24px", display: "flex", justifyContent: "center", position: "relative", overflow: "hidden" },
  glow1: { position: "absolute", top: "-100px", right: "-100px", width: "400px", height: "400px", background: "radial-gradient(circle, rgba(6,182,212,0.06), transparent 70%)", pointerEvents: "none" },
  glow2: { position: "absolute", bottom: "-100px", left: "-100px", width: "300px", height: "300px", background: "radial-gradient(circle, rgba(6,182,212,0.04), transparent 70%)", pointerEvents: "none" },

  card: { background: "#1A1F2E", border: "1px solid #2D3548", borderRadius: "16px", padding: "36px", maxWidth: "520px", width: "100%", position: "relative", zIndex: 1 },

  back: { color: "#06B6D4", textDecoration: "none", fontSize: "14px", display: "inline-block", marginBottom: "24px" },
  header: { display: "flex", alignItems: "center", gap: "14px", marginBottom: "28px" },
  headerIcon: { fontSize: "36px" },
  title: { fontSize: "24px", fontWeight: 700, margin: 0, letterSpacing: "-0.01em" },
  sub: { color: "#94A3B8", fontSize: "14px", margin: "4px 0 0" },

  error: { padding: "12px 16px", borderRadius: "8px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#EF4444", fontSize: "13px", marginBottom: "16px" },

  methodsGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "20px" },
  methodCard: { display: "flex", alignItems: "center", gap: "12px", padding: "16px", borderRadius: "10px", border: "1px solid #2D3548", background: "transparent", cursor: "pointer", position: "relative" },
  methodCardActive: { display: "flex", alignItems: "center", gap: "12px", padding: "16px", borderRadius: "10px", border: "1px solid #06B6D4", background: "rgba(6,182,212,0.08)", cursor: "pointer", position: "relative" },
  methodIcon: { fontSize: "24px" },
  methodName: { fontWeight: 600, fontSize: "14px", margin: 0 },
  methodDesc: { color: "#94A3B8", fontSize: "12px", margin: "2px 0 0" },
  methodCheck: { position: "absolute", top: "12px", right: "12px", color: "#06B6D4", fontWeight: 700, fontSize: "14px" },

  paymentBox: { background: "#0A0E17", border: "1px solid #2D3548", borderRadius: "10px", padding: "24px", textAlign: "center", marginBottom: "24px" },
  paymentBoxLabel: { display: "block", color: "#94A3B8", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" },
  paymentBoxNumber: { display: "block", color: "#06B6D4", fontSize: "24px", fontWeight: 700, margin: "4px 0" },
  paymentBoxName: { display: "block", color: "#CBD5E1", fontSize: "14px", marginBottom: "12px" },
  copyBtn: { padding: "8px 16px", borderRadius: "6px", border: "1px solid #2D3548", background: "transparent", color: "#CBD5E1", cursor: "pointer", fontSize: "12px", fontWeight: 500 },

  form: { display: "flex", flexDirection: "column", gap: "20px" },
  label: { display: "block", fontSize: "13px", fontWeight: 600, color: "#CBD5E1", marginBottom: "8px" },
  input: { width: "100%", padding: "12px 14px", borderRadius: "8px", border: "1px solid #2D3548", background: "#0A0E17", color: "#F8FAFB", fontSize: "14px", outline: "none", boxSizing: "border-box", fontFamily: "'Inter', sans-serif" },
  hint: { color: "#64748B", fontSize: "12px", marginTop: "4px" },

  uploadArea: { display: "block", cursor: "pointer", borderRadius: "10px", border: "2px dashed #2D3548", overflow: "hidden" },
  uploadPlaceholder: { padding: "40px 20px", textAlign: "center", display: "flex", flexDirection: "column", gap: "6px" },
  uploadIcon: { fontSize: "32px" },
  uploadText: { color: "#CBD5E1", fontSize: "14px", fontWeight: 500 },
  uploadHint: { color: "#64748B", fontSize: "12px" },
  preview: { width: "100%", maxHeight: "300px", objectFit: "cover", display: "block" },
  removeBtn: { marginTop: "8px", padding: "6px 12px", borderRadius: "6px", border: "none", background: "rgba(239,68,68,0.1)", color: "#EF4444", cursor: "pointer", fontSize: "12px" },

  btn: { width: "100%", padding: "14px", borderRadius: "8px", border: "none", background: "#06B6D4", color: "#0A0E17", fontWeight: 600, fontSize: "15px", cursor: "pointer" },

  steps: { display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", marginTop: "28px" },
  step: { display: "flex", alignItems: "center", gap: "8px" },
  stepNum: { width: "28px", height: "28px", borderRadius: "50%", background: "#2D3548", color: "#CBD5E1", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "12px" },
  stepLabel: { color: "#94A3B8", fontSize: "12px" },
  stepArrow: { color: "#2D3548", fontSize: "16px" },

  successCard: { background: "#1A1F2E", border: "1px solid rgba(16,185,129,0.3)", borderRadius: "16px", padding: "48px 32px", maxWidth: "480px", width: "100%", textAlign: "center", position: "relative", zIndex: 1, overflow: "hidden" },
  successGlow: { position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: "200px", height: "2px", background: "linear-gradient(90deg, transparent, #10B981, transparent)" },
  successIcon: { fontSize: "56px", display: "block", marginBottom: "16px" },
  successTitle: { fontSize: "26px", fontWeight: 700, margin: "0 0 8px", letterSpacing: "-0.01em" },
  successSub: { color: "#94A3B8", fontSize: "14px", marginBottom: "28px", lineHeight: 1.6 },
  successSteps: { display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginBottom: "28px" },
  stepDone: { display: "flex", alignItems: "center", gap: "4px", color: "#10B981", fontSize: "12px", fontWeight: 600 },
  stepActive: { display: "flex", alignItems: "center", gap: "4px", color: "#F59E0B", fontSize: "12px", fontWeight: 600 },
  stepPending: { display: "flex", alignItems: "center", gap: "4px", color: "#64748B", fontSize: "12px", fontWeight: 600 },
  stepLine: { width: "20px", height: "1px", background: "#2D3548" },
};

export default Checkout;