import { Link } from "react-router-dom";

function Privacy() {
  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.title}>Privacy Policy</h1>
        <p style={styles.date}>Last updated: June 2026</p>

        <div style={styles.section}>
          <h2>1. Information We Collect</h2>
          <p>We collect: email address, account information you provide, social media statistics (for promoters), purchase history, and referral activity. We use Firebase Authentication for secure login.</p>
        </div>

        <div style={styles.section}>
          <h2>2. How We Use Information</h2>
          <p>Your information is used to: provide marketplace services, process transactions, calculate commissions, track referrals, improve the platform, and communicate with you about your account.</p>
        </div>

        <div style={styles.section}>
          <h2>3. Data Storage</h2>
          <p>Data is stored on Firebase (Firestore) and Cloudinary. Files uploaded by creators are stored on Cloudinary. Payment processing is handled by Stripe — we do not store your payment details.</p>
        </div>

        <div style={styles.section}>
          <h2>4. Cookies</h2>
          <p>We use a referral cookie to track promoter referrals for 30 days. This cookie stores the promoter's username to attribute sales correctly.</p>
        </div>

        <div style={styles.section}>
          <h2>5. Data Sharing</h2>
          <p>We do not sell your data. Your email and profile information is not shared with third parties except as required for payment processing (Stripe).</p>
        </div>

        <div style={styles.section}>
          <h2>6. Your Rights</h2>
          <p>You can request deletion of your account and associated data by contacting us. You can update your profile information at any time through your dashboard.</p>
        </div>

        <div style={styles.section}>
          <h2>7. Contact</h2>
          <p>For privacy concerns, contact us through the platform.</p>
        </div>

        <Link to="/" style={styles.backLink}>← Back to Home</Link>
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
    maxWidth: "800px",
    margin: "0 auto",
  },
  title: {
    fontSize: "36px",
    margin: 0,
  },
  date: {
    color: "#64748b",
    marginTop: "8px",
    marginBottom: "32px",
  },
  section: {
    marginBottom: "28px",
  },
  backLink: {
    display: "inline-block",
    marginTop: "24px",
    color: "#a5b4ff",
    textDecoration: "none",
  },
};

export default Privacy;