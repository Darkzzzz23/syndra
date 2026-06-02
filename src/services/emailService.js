// Email notification service
// Currently logs to console. Connect to Resend/SendGrid API when backend is ready.

const SENDER_EMAIL = "noreply@syndra.com";

// Send welcome email after signup
export const sendWelcomeEmail = async (email, name) => {
  const template = {
    to: email,
    from: SENDER_EMAIL,
    subject: "Welcome to Syndra!",
    body: `Hi ${name},\n\nWelcome to Syndra! You're now part of the digital marketplace where creators sell, promoters earn, and customers discover amazing digital products.\n\nGet started:\n- Browse the marketplace\n- Upload your first product\n- Apply to become a promoter\n\nSee you inside!\n\n– The Syndra Team`,
  };

  console.log("📧 Welcome Email:", template);
  // TODO: Connect to email API
  return template;
};

// Notify creator when product is approved
export const sendProductApprovedEmail = async (email, productTitle) => {
  const template = {
    to: email,
    from: SENDER_EMAIL,
    subject: `Your product "${productTitle}" has been approved!`,
    body: `Great news!\n\nYour product "${productTitle}" has been approved and is now live on the Syndra marketplace.\n\nCustomers can now browse and purchase your product. Promoters can share it and earn commissions.\n\nView your product on the marketplace now!\n\n– The Syndra Team`,
  };

  console.log("📧 Product Approved Email:", template);
  return template;
};

// Notify creator when product is rejected
export const sendProductRejectedEmail = async (email, productTitle) => {
  const template = {
    to: email,
    from: SENDER_EMAIL,
    subject: `Update on your product "${productTitle}"`,
    body: `Hi,\n\nYour product "${productTitle}" was not approved for the marketplace.\n\nThis could be due to content guidelines, file issues, or incomplete information. You can upload a revised version.\n\nLog in to your dashboard for more details.\n\n– The Syndra Team`,
  };

  console.log("📧 Product Rejected Email:", template);
  return template;
};

// Notify promoter when application is approved
export const sendPromoterApprovedEmail = async (email, slug) => {
  const template = {
    to: email,
    from: SENDER_EMAIL,
    subject: "You're approved as a Syndra Promoter!",
    body: `Congratulations!\n\nYour promoter application has been approved. Your referral slug is: ${slug}\n\nStart promoting:\n1. Browse approved products\n2. Copy your referral links\n3. Share them and earn 20% commission on every sale\n\nYour referral link format: syndra.com/go/productId?ref=${slug}\n\nStart earning now!\n\n– The Syndra Team`,
  };

  console.log("📧 Promoter Approved Email:", template);
  return template;
};

// Notify promoter when application is rejected
export const sendPromoterRejectedEmail = async (email) => {
  const template = {
    to: email,
    from: SENDER_EMAIL,
    subject: "Update on your Syndra Promoter application",
    body: `Hi,\n\nYour promoter application was not approved at this time.\n\nYou can re-apply with updated social stats and experience.\n\nLog in to your dashboard for more information.\n\n– The Syndra Team`,
  };

  console.log("📧 Promoter Rejected Email:", template);
  return template;
};

// Send purchase confirmation to customer
export const sendPurchaseConfirmationEmail = async (email, productTitle, downloadUrl) => {
  const template = {
    to: email,
    from: SENDER_EMAIL,
    subject: `Your purchase: ${productTitle}`,
    body: `Thank you for your purchase!\n\nProduct: ${productTitle}\nDownload: ${downloadUrl}\n\nYou can also access your downloads from your dashboard.\n\nEnjoy!\n\n– The Syndra Team`,
  };

  console.log("📧 Purchase Confirmation Email:", template);
  return template;
};

// Notify creator of a new sale
export const sendCreatorSaleEmail = async (email, productTitle, amount) => {
  const template = {
    to: email,
    from: SENDER_EMAIL,
    subject: `You made a sale! ${productTitle}`,
    body: `Congratulations!\n\nYour product "${productTitle}" just sold for $${amount.toFixed(2)}.\n\nYour earnings: $${(amount * 0.7).toFixed(2)}\n\nView your dashboard for more details.\n\n– The Syndra Team`,
  };

  console.log("📧 Creator Sale Email:", template);
  return template;
};

// Notify promoter of commission earned
export const sendPromoterCommissionEmail = async (email, productTitle, commission) => {
  const template = {
    to: email,
    from: SENDER_EMAIL,
    subject: `You earned a commission! ${productTitle}`,
    body: `Nice work!\n\nSomeone purchased "${productTitle}" through your referral link.\n\nYour commission: $${commission.toFixed(2)}\n\nKeep sharing and earning!\n\n– The Syndra Team`,
  };

  console.log("📧 Promoter Commission Email:", template);
  return template;
};