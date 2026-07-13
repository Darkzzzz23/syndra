import { useEffect, useState } from "react";
import { useParams, Link, useSearchParams } from "react-router-dom";
import { PayPalButtons } from "@paypal/react-paypal-js";
import { getProductById } from "../services/productService";
import { saveReferralCookie, getReferralFromCookie, createOrder } from "../services/orderService";
import { submitReview, getProductReviews } from "../services/reviewService";
import SEO from "../components/SEO";

function ProductDetails() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [orderComplete, setOrderComplete] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref) saveReferralCookie(ref);
    const load = async () => {
      try {
        const data = await getProductById(id);
        if (!data || data.status !== "approved") { setError("Product not found."); return; }
        setProduct(data);
        const revs = await getProductReviews(id);
        setReviews(revs);
      } catch (err) { setError("Failed to load."); }
      finally { setLoading(false); }
    };
    load();
  }, [id, searchParams]);

  const handlePayPalApprove = async (data) => {
    try {
      await createOrder({
        productId: product.id, productTitle: product.title || product.name,
        customerId: "paypal_customer", customerEmail: data.payer?.email_address || "customer@syndra.com",
        creatorId: product.creatorId || product.ownerUid, amount: product.price || 0,
        promoterSlug: getReferralFromCookie(),
      });
      setOrderComplete(true);
    } catch (err) { console.error(err); }
  };

  const handleSubmitReview = async () => {
    if (!reviewComment.trim()) return;
    setSubmittingReview(true);
    try {
      await submitReview({ productId: product.id, customerId: "anon", customerEmail: "anon", rating: reviewRating, comment: reviewComment });
      setReviews(await getProductReviews(product.id));
      setReviewComment(""); setReviewRating(5); setShowReviewForm(false);
    } catch (err) { console.error(err); }
    finally { setSubmittingReview(false); }
  };

  if (loading) return <div style={styles.page}><p style={{ color: "#94A3B8", padding: "60px", textAlign: "center" }}>Loading...</p></div>;
  if (error) return <div style={styles.page}><div style={styles.container}><p style={{ color: "#94A3B8" }}>{error}</p><Link to="/marketplace" style={{ color: "#06B6D4" }}>← Back</Link></div></div>;

  return (
    <div style={styles.page}>
      <SEO title={product?.title} description={product?.description?.slice(0, 160)} />
      <div style={styles.container}>
        <Link to="/marketplace" style={styles.back}>← Marketplace</Link>
        <div style={styles.layout}>
          <div style={styles.imageWrap}>
            {product.thumbnailUrl ? <img src={product.thumbnailUrl} alt="" style={styles.image} /> : <span style={{ fontSize: "64px", opacity: 0.2 }}>📦</span>}
          </div>
          <div>
            <span style={styles.badge}>{product.category}</span>
            <h1 style={styles.title}>{product.title || product.name}</h1>
            <p style={styles.creator}>by {product.creatorDisplayName || product.creatorEmail?.split("@")[0]}</p>
            {product.averageRating > 0 && (
              <p style={{ color: "#D97706", fontSize: "14px", marginBottom: "16px" }}>{"★".repeat(Math.round(product.averageRating))} {product.averageRating} ({product.totalReviews || 0} reviews)</p>
            )}
            <p style={styles.desc}>{product.description}</p>
            <div style={styles.priceRow}><span style={styles.price}>${product.price?.toFixed(2)}</span></div>

            {orderComplete ? (
              <div style={styles.successBox}><span style={{ fontSize: "24px" }}>✅</span><p style={{ fontWeight: 600 }}>Payment successful!</p>
                {product.fileUrl && <a href={product.fileUrl} style={styles.dlBtn} download>📥 Download</a>}
              </div>
            ) : (
              <PayPalButtons style={{ layout: "vertical", color: "silver", shape: "rect", label: "pay" }}
                createOrder={(data, actions) => actions.order.create({ purchase_units: [{ amount: { value: (product.price || 0).toFixed(2) }, description: product.title }] })}
                onApprove={(data, actions) => actions.order.capture().then(d => handlePayPalApprove(d))}
              />
            )}
            <div style={styles.trust}><span>🔒 Secure payment</span><span>📥 Instant download</span></div>
          </div>
        </div>

        <div style={styles.reviewSection}>
          <h2 style={styles.reviewTitle}>Reviews</h2>
          <button onClick={() => setShowReviewForm(!showReviewForm)} style={styles.reviewBtn}>{showReviewForm ? "Cancel" : "Write a Review"}</button>
          {showReviewForm && (
            <div style={styles.reviewForm}>
              <div style={{ display: "flex", gap: "4px", marginBottom: "8px" }}>{[1,2,3,4,5].map(s => <span key={s} onClick={() => setReviewRating(s)} style={{ cursor: "pointer", fontSize: "20px", color: s <= reviewRating ? "#D97706" : "#2D3548" }}>★</span>)}</div>
              <textarea value={reviewComment} onChange={e => setReviewComment(e.target.value)} placeholder="Share your thoughts..." style={styles.reviewInput} />
              <button onClick={handleSubmitReview} disabled={submittingReview} style={styles.submitBtn}>Submit</button>
            </div>
          )}
          {reviews.map(r => (
            <div key={r.id} style={styles.reviewCard}>
              <p style={{ fontWeight: 600, margin: 0 }}>{r.displayName || r.customerEmail?.split("@")[0] || "Anonymous"}</p>
              <p style={{ color: "#D97706", margin: "2px 0" }}>{"★".repeat(r.rating)}</p>
              <p style={{ color: "#94A3B8", fontSize: "14px", margin: 0 }}>{r.comment}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { background: "#0A0E17", color: "#F8FAFB", fontFamily: "'Inter', sans-serif", minHeight: "100vh", padding: "60px 32px" },
  container: { maxWidth: "1000px", margin: "0 auto" },
  back: { color: "#06B6D4", textDecoration: "none", fontSize: "14px" },
  layout: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "48px", marginTop: "24px", alignItems: "start" },
  imageWrap: { aspectRatio: "4/3", background: "#1A1F2E", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" },
  image: { width: "100%", height: "100%", objectFit: "cover" },
  badge: { display: "inline-block", padding: "4px 12px", borderRadius: "4px", background: "rgba(6,182,212,0.15)", color: "#06B6D4", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "12px" },
  title: { fontSize: "28px", fontWeight: 700, letterSpacing: "-0.01em", margin: "0 0 8px" },
  creator: { fontSize: "14px", color: "#94A3B8", marginBottom: "8px" },
  desc: { color: "#CBD5E1", lineHeight: 1.7, fontSize: "14px", marginBottom: "24px" },
  priceRow: { borderTop: "1px solid #2D3548", paddingTop: "20px", marginBottom: "16px" },
  price: { fontSize: "32px", fontWeight: 700, color: "#06B6D4" },
  successBox: { padding: "20px", borderRadius: "8px", background: "rgba(16,185,129,0.1)", border: "1px solid #10B981", textAlign: "center" },
  dlBtn: { display: "inline-block", marginTop: "8px", padding: "10px 20px", borderRadius: "6px", background: "#06B6D4", color: "#0A0E17", textDecoration: "none", fontWeight: 600, fontSize: "13px" },
  trust: { display: "flex", gap: "16px", marginTop: "12px", fontSize: "12px", color: "#94A3B8" },
  reviewSection: { marginTop: "64px", borderTop: "1px solid #2D3548", paddingTop: "40px" },
  reviewTitle: { fontSize: "20px", fontWeight: 600, marginBottom: "12px" },
  reviewBtn: { padding: "8px 16px", borderRadius: "6px", border: "1px solid #2D3548", background: "transparent", color: "#CBD5E1", cursor: "pointer", fontSize: "13px", marginBottom: "16px" },
  reviewForm: { marginBottom: "16px", padding: "16px", borderRadius: "8px", background: "#1A1F2E", border: "1px solid #2D3548" },
  reviewInput: { width: "100%", minHeight: "80px", borderRadius: "6px", border: "1px solid #2D3548", background: "#0A0E17", color: "#F8FAFB", padding: "10px", fontSize: "14px", outline: "none", resize: "vertical", marginBottom: "8px", fontFamily: "'Inter', sans-serif" },
  submitBtn: { padding: "8px 16px", borderRadius: "6px", background: "#06B6D4", color: "#0A0E17", border: "none", cursor: "pointer", fontWeight: 600, fontSize: "13px" },
  reviewCard: { padding: "16px", borderRadius: "8px", background: "#1A1F2E", border: "1px solid #2D3548", marginBottom: "8px" },
};

export default ProductDetails;