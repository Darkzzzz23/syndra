import { useState } from "react";
import { Link } from "react-router-dom";

function Legal() {
  const [tab, setTab] = useState("terms");

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.title}>Legal</h1>

        <div style={styles.tabs}>
          <button onClick={() => setTab("terms")} style={tab === "terms" ? styles.tabActive : styles.tab}>
            Terms of Service
          </button>
          <button onClick={() => setTab("privacy")} style={tab === "privacy" ? styles.tabActive : styles.tab}>
            Privacy Policy
          </button>
        </div>

        {tab === "terms" && (
          <div style={styles.content}>
            <p style={styles.date}>Last updated: June 2026</p>
            <div style={styles.section}><h2>1. Acceptance of Terms</h2><p>By accessing or using Syndra, you agree to these Terms of Service. If you do not agree, do not use the platform.</p></div>
            <div style={styles.section}><h2>2. Description of Service</h2><p>Syndra is a digital marketplace where creators sell downloadable digital products. Promoters earn commissions by sharing referral links. Customers purchase and download digital products.</p></div>
            <div style={styles.section}><h2>3. User Accounts</h2><p>You are responsible for maintaining the security of your account. You must provide accurate information during registration. Syndra reserves the right to suspend or terminate accounts that violate these terms.</p></div>
            <div style={styles.section}><h2>4. Creator Terms</h2><p>Creators retain ownership of their content. By uploading, you grant Syndra the right to display and distribute your products on the platform. You must own or have rights to all content you upload. Malware, illegal content, or copyright-infringing material is strictly prohibited.</p></div>
            <div style={styles.section}><h2>5. Promoter Terms</h2><p>Promoters earn commissions as defined by the platform's commission settings. Self-referral (purchasing through your own link) is prohibited. Fraudulent activity will result in forfeiture of earnings and account termination.</p></div>
            <div style={styles.section}><h2>6. Payments and Refunds</h2><p>All prices are in USD unless otherwise stated. Due to the digital nature of products, refunds are generally not provided unless the product is defective, misrepresented, or not as described. Refund requests are reviewed on a case-by-case basis.</p></div>
            <div style={styles.section}><h2>7. Commission Structure</h2><p>Default commission split: Creator 70%, Promoter 20%, Syndra 10%. Syndra reserves the right to modify commission rates with notice.</p></div>
            <div style={styles.section}><h2>8. Limitation of Liability</h2><p>Syndra is provided "as is." We do not guarantee uninterrupted service. We are not liable for damages arising from use of the platform.</p></div>
            <div style={styles.section}><h2>9. Contact</h2><p>For questions about these terms, contact us through the platform.</p></div>
          </div>
        )}

        {tab === "privacy" && (
          <div style={styles.content}>
            <p style={styles.date}>Last updated: June 2026</p>
            <div style={styles.section}><h2>1. Information We Collect</h2><p>We collect: email address, account information you provide, social media statistics (for promoters), purchase history, and referral activity. We use Firebase Authentication for secure login.</p></div>
            <div style={styles.section}><h2>2. How We Use Information</h2><p>Your information is used to: provide marketplace services, process transactions, calculate commissions, track referrals, improve the platform, and communicate with you about your account.</p></div>
            <div style={styles.section}><h2>3. Data Storage</h2><p>Data is stored on Firebase (Firestore) and Cloudinary. Files uploaded by creators are stored on Cloudinary. Payment processing is handled by Stripe — we do not store your payment details.</p></div>
            <div style={styles.section}><h2>4. Cookies</h2><p>We use a referral cookie to track promoter referrals for 30 days. This cookie stores the promoter's username to attribute sales correctly.</p></div>
            <div style={styles.section}><h2>5. Data Sharing</h2><p>We do not sell your data. Your email and profile information is not shared with third parties except as required for payment processing (Stripe).</p></div>
            <div style={styles.section}><h2>6. Your Rights</h2><p>You can request deletion of your account and associated data by contacting us. You can update your profile information at any time through your dashboard.</p></div>
            <div style={styles.section}><h2>7. Contact</h2><p>For privacy concerns, contact us through the platform.</p></div>
          </div>
        )}

        <Link to="/" style={styles.backLink}>← Back to Home</Link>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: "calc(100vh - 70px)", padding: "40px 24px", color: "#fff", background: "linear-gradient(180deg, #05070d 0%, #0f172a 100%)", fontFamily: "Inter, sans-serif" },
  container: { maxWidth: "800px", margin: "0 auto" },
  title: { fontSize: "36px", margin: 0 },
  tabs: { display: "flex", gap: "12px", marginTop: "24px", marginBottom: "24px" },
  tab: { padding: "10px 20px", borderRadius: "12px", border: "1px solid rgba(79,124,255,0.2)", background: "transparent", color: "#94a3b8", cursor: "pointer", fontWeight: 600 },
  tabActive: { padding: "10px 20px", borderRadius: "12px", border: "none", background: "linear-gradient(135deg, #4f7cff, #7c3aed)", color: "#fff", cursor: "pointer", fontWeight: 700 },
  content: {},
  date: { color: "#64748b", marginBottom: "24px" },
  section: { marginBottom: "24px" },
  backLink: { display: "inline-block", marginTop: "24px", color: "#a5b4ff", textDecoration: "none" },
};

export default Legal;