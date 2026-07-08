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
      } catch (err) {
        setError("Failed to load product.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, searchParams]);

  const handlePayPalApprove = async (data) => {
    try {
      const promoterSlug = getReferralFromCookie();
      await createOrder({
        productId: product.id,
        productTitle: product.title || product.name,
        customerId: "paypal_customer",
        customerEmail: data.payer?.email_address || "customer@syndra.com",
        creatorId: product.creatorId || product.ownerUid,
        amount: product.price || 0,
        promoterSlug,
      });
      setOrderComplete(true);
    } catch (err) {
      console.error("Order failed:", err);
    }
  };

  const handleSubmitReview = async () => {
    if (!reviewComment.trim()) return;
    setSubmittingReview(true);
    try {
      await submitReview({ productId: product.id, customerId: "anon", customerEmail: "anon", rating: reviewRating, comment: reviewComment });
      const updated = await getProductReviews(product.id);
      setReviews(updated);
      setReviewComment(""); setReviewRating(5); setShowReviewForm(false);
    } catch (err) { console.error("Review failed:", err); }
    finally { setSubmittingReview(false); }
  };

  if (loading) return <div style={styles.page}><div style={styles.container}><p>Loading...</p></div></div>;
  if (error) return <div style={styles.page}><div style={styles.container}><p>{error}</p><Link to="/marketplace" style={styles.backLink}>← Back</Link></div></div>;

  return (
    <div style={styles.page}>
      <SEO title={product?.title} description={product?.description?.slice(0, 160)} />
      <div style={styles.container}>
        <Link to="/marketplace" style={styles.backLink}>← Back to marketplace</Link>

        <div style={styles.layout}>
          {/* Image */}
          <div style={styles.imageSection}>
            {product.thumbnailUrl ? (
              <img src={product.thumbnailUrl} alt={product.title} style={styles.productImage} />
            ) : (
              <div style={styles.imagePlaceholder}>📦</div>
            )}
          </div>

          {/* Info */}
          <div style={styles.infoSection}>
            <span style={styles.category}>{product.category}</span>
            <h1 style={styles.title}>{product.title || product.name}</h1>
            <p style={styles.creator}>by {product.creatorDisplayName || product.creatorEmail?.split("@")[0]}</p>
            {product.averageRating > 0 && (
              <p style={styles.rating}>⭐ {product.averageRating} ({product.totalReviews || 0} reviews)</p>
            )}
            <p style={styles.description}>{product.description}</p>
            <p style={styles.price}>${product.price?.toFixed(2)}</p>

            {orderComplete ? (
              <div style={styles.successBox}>
                <span>✅</span> Payment successful! Download your file below.
                {product.fileUrl && <a href={product.fileUrl} style={styles.downloadBtn} download>📥 Download</a>}
              </div>
            ) : (
              <PayPalButtons
                style={{ layout: "vertical", color: "blue", shape: "rect", label: "pay" }}
                createOrder={(data, actions) => actions.order.create({
                  purchase_units: [{ amount: { value: (product.price || 0).toFixed(2) }, description: product.title }],
                })}
                onApprove={(data, actions) => actions.order.capture().then(details => handlePayPalApprove(details))}
                onError={err => { console.error("PayPal error:", err); alert("Payment failed."); }}
              />
            )}

            <div style={styles.trust}>
              <span>🔒 Secure payment</span>
              <span>📥 Instant download</span>
            </div>
          </div>
        </div>

        {/* Reviews */}
        <div style={styles.reviewsSection}>
          <h3 style={styles.reviewsTitle}>Reviews</h3>
          <button onClick={() => setShowReviewForm(!showReviewForm)} style={styles.reviewBtn}>
            {showReviewForm ? "Cancel" : "Write a Review"}
          </button>
          {showReviewForm && (
            <div style={styles.reviewForm}>
              <div style={{ display: "flex", gap: "4px", marginBottom: "8px" }}>
                {[1,2,3,4,5].map(s => (
                  <span key={s} onClick={() => setReviewRating(s)} style={{ cursor: "pointer", fontSize: "20px", color: s <= reviewRating ? "#F7B731" : "#E5E7EB" }}>★</span>
                ))}
              </div>
              <textarea value={reviewComment} onChange={e => setReviewComment(e.target.value)} placeholder="Share your thoughts..." style={styles.reviewInput} />
              <button onClick={handleSubmitReview} disabled={submittingReview} style={styles.submitBtn}>Submit</button>
            </div>
          )}
          {reviews.map(r => (
            <div key={r.id} style={styles.reviewCard}>
              <p style={{ fontWeight: 600, margin: 0 }}>{r.displayName || r.customerEmail?.split("@")[0] || "Anonymous"}</p>
              <p style={{ color: "#F7B731", margin: "2px 0" }}>{"★".repeat(r.rating)}</p>
              <p style={{ color: "#6B7280", fontSize: "14px", margin: 0 }}>{r.comment}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { fontFamily: "'Inter', sans-serif", background: "#FAFBFC", color: "#1A1D26", minHeight: "100vh", padding: "40px 24px" },
  container: { maxWidth: "860px", margin: "0 auto" },
  backLink: { color: "#6C5CE7", textDecoration: "none", fontSize: "14px" },
  layout: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "40px", marginTop: "20px", alignItems: "start" },
  imageSection: { background: "#F3F4F6", borderRadius: "16px", overflow: "hidden", minHeight: "360px", display: "flex", alignItems: "center", justifyContent: "center" },
  productImage: { width: "100%", height: "100%", objectFit: "cover" },
  imagePlaceholder: { fontSize: "64px", opacity: 0.2 },
  infoSection: {},
  category: { fontSize: "12px", color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.05em" },
  title: { fontSize: "28px", fontWeight: 700, margin: "8px 0" },
  creator: { color: "#6B7280", fontSize: "14px" },
  rating: { color: "#F7B731", fontSize: "14px", marginTop: "4px" },
  description: { color: "#4B5563", lineHeight: 1.7, marginTop: "16px", fontSize: "15px" },
  price: { fontSize: "32px", fontWeight: 700, color: "#6C5CE7", marginTop: "20px" },
  successBox: { marginTop: "16px", padding: "16px", borderRadius: "12px", background: "#ECFDF5", border: "1px solid #A7F3D0", textAlign: "center" },
  downloadBtn: { display: "inline-block", marginTop: "10px", padding: "10px 20px", borderRadius: "10px", background: "#6C5CE7", color: "#fff", textDecoration: "none", fontWeight: 600 },
  trust: { display: "flex", gap: "20px", marginTop: "12px", fontSize: "13px", color: "#6B7280" },
  reviewsSection: { marginTop: "48px", borderTop: "1px solid #E5E7EB", paddingTop: "24px" },
  reviewsTitle: { fontSize: "20px", fontWeight: 600 },
  reviewBtn: { padding: "8px 16px", borderRadius: "8px", border: "1px solid #E5E7EB", background: "#fff", cursor: "pointer", fontSize: "13px", fontWeight: 500, marginBottom: "16px", marginTop: "8px" },
  reviewForm: { marginBottom: "16px", padding: "16px", borderRadius: "12px", background: "#fff", border: "1px solid #E5E7EB" },
  reviewInput: { width: "100%", minHeight: "80px", borderRadius: "8px", border: "1px solid #E5E7EB", padding: "10px", fontSize: "14px", outline: "none", marginBottom: "8px" },
  submitBtn: { padding: "8px 16px", borderRadius: "8px", background: "#6C5CE7", color: "#fff", border: "none", cursor: "pointer", fontWeight: 600, fontSize: "13px" },
  reviewCard: { padding: "12px", borderRadius: "10px", background: "#fff", border: "1px solid #E5E7EB", marginBottom: "8px" },
};

export default ProductDetails;