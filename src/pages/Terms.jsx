function Terms() {
  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.title}>Terms & Conditions</h1>
        <p style={styles.updated}>Last updated: August 2026</p>

        <div style={styles.section}>
          <h2>1. Overview</h2>
          <p>Syndra is a digital marketplace. Creators upload digital products. Customers purchase them. Promoters and resellers earn from qualifying product sales. By using Syndra, you agree to these terms.</p>
        </div>

        <div style={styles.section}>
          <h2>2. Accounts</h2>
          <p>You must provide accurate information when creating an account. You are responsible for your account security. Syndra may suspend accounts that violate these terms or engage in fraudulent activity.</p>
        </div>

        <div style={styles.section}>
          <h2>3. Digital Products</h2>
          <p>All products on Syndra are digital downloads. Products include ebooks, templates, guides, worksheets, and digital art. Creators retain ownership of their content. Purchasing a product grants you a license to use it — not to resell it unless explicitly stated.</p>
        </div>

        <div style={styles.section}>
          <h2>4. Promoters</h2>
          <p>Promoters join free. Promoters receive unique referral links. Promoters earn commission only when a customer completes a qualifying purchase through their link. Clicking a link, creating an account, or signing up does NOT generate commission.</p>
        </div>

        <div style={styles.section}>
          <h2>5. Resellers</h2>
          <p>Users may purchase reseller bundles. A bundle includes specific digital products and the resale rights described in the bundle. Purchasing a bundle does NOT guarantee income or profit. Resellers must comply with the license terms and restrictions in their bundle.</p>
        </div>

        <div style={styles.section}>
          <h2>6. Referral System</h2>
          <p>Referral commissions are paid when a referred user completes a qualifying purchase. Referral commission is one-level only. If User A refers User B, and User B refers User C, User A receives nothing from User C's purchase. Commissions are never paid for account creation alone.</p>
        </div>

        <div style={styles.section}>
          <h2>7. Payments</h2>
          <p>Payments are processed in Ethiopian Birr (ETB) via Telebirr or CBE. Transactions are recorded in a financial ledger. Every commission is traceable to its source transaction.</p>
        </div>

        <div style={styles.section}>
          <h2>8. Refunds & Chargebacks</h2>
          <p>Digital products are generally non-refundable once downloaded. If a transaction is refunded, reversed, or charged back, all associated commissions are reversed. Users cannot withdraw commissions from transactions that have not been successfully completed.</p>
        </div>

        <div style={styles.section}>
          <h2>9. Earnings Disclaimer</h2>
          <p>Syndra does NOT guarantee income. Purchasing a reseller bundle does NOT guarantee profit. Actual earnings depend on sales, demand, effort, and other factors. Past earnings are not guarantees of future results.</p>
        </div>

        <div style={styles.section}>
          <h2>10. Prohibited Conduct</h2>
          <p>Users may not: upload copyrighted content without permission, resell products outside their granted license, create duplicate accounts, engage in self-referrals, commit fraud, or misrepresent earning potential.</p>
        </div>

        <div style={styles.section}>
          <h2>11. Fraud Prevention</h2>
          <p>Syndra monitors for suspicious activity including self-referrals, duplicate accounts, rapid purchase/refund cycles, and unusual referral patterns. Suspected fraud is flagged for review. Commissions from fraudulent transactions are reversed.</p>
        </div>

        <div style={styles.section}>
          <h2>12. Limitation of Liability</h2>
          <p>Syndra is provided "as is." We do not guarantee uninterrupted service. We are not liable for damages arising from use of the platform or from failed placements.</p>
        </div>

        <div style={styles.section}>
          <h2>13. Changes to Terms</h2>
          <p>We may update these terms. Continued use after changes constitutes acceptance.</p>
        </div>

        <div style={styles.section}>
          <h2>14. Legal Review</h2>
          <p>These terms should be reviewed by a qualified legal professional in Ethiopia before publication. This document is not a substitute for legal advice.</p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { background: "#0A0E17", color: "#F8FAFB", fontFamily: "'Inter', sans-serif", minHeight: "100vh", padding: "60px 24px" },
  container: { maxWidth: "700px", margin: "0 auto" },
  title: { fontSize: "32px", fontWeight: 700, letterSpacing: "-0.01em", margin: 0 },
  updated: { color: "#94A3B8", fontSize: "13px", marginTop: "4px", marginBottom: "40px" },
  section: { marginBottom: "28px" },
  sectionTitle: { fontSize: "18px", fontWeight: 600, marginBottom: "8px" },
  sectionDesc: { color: "#CBD5E1", lineHeight: 1.7, fontSize: "14px" },
  listItem: { color: "#CBD5E1", lineHeight: 1.7, fontSize: "14px", margin: "4px 0", paddingLeft: "16px" },
  disclaimer: { padding: "16px", borderRadius: "8px", background: "rgba(217,119,6,0.1)", border: "1px solid rgba(217,119,6,0.3)", color: "#F59E0B", fontSize: "13px", lineHeight: 1.6, marginBottom: "24px" },
};

export default Terms;