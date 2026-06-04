const RESEND_API_KEY = process.env.REACT_APP_RESEND_API_KEY;
const SENDER = "Syndra <onboarding@resend.dev>";

const sendEmail = async (to, subject, html) => {
  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from: SENDER, to, subject, html }),
    });
  } catch (err) {
    console.error("Email failed:", err);
  }
};

export const sendWelcomeEmail = (email, name) =>
  sendEmail(email, "Welcome to Syndra!", `<h2>Welcome, ${name}!</h2><p>You're now part of the digital marketplace.</p>`);

export const sendProductApprovedEmail = (email, productTitle) =>
  sendEmail(email, `Your product "${productTitle}" has been approved!`, `<h2>Great news!</h2><p><strong>${productTitle}</strong> is now live on Syndra.</p>`);

export const sendProductRejectedEmail = (email, productTitle) =>
  sendEmail(email, `Update on "${productTitle}"`, `<h2>Update</h2><p><strong>${productTitle}</strong> was not approved.</p>`);

export const sendPromoterApprovedEmail = (email, slug) =>
  sendEmail(email, "You're approved as a Promoter!", `<h2>Congratulations!</h2><p>Your slug: <strong>${slug}</strong></p>`);

export const sendPromoterRejectedEmail = (email) =>
  sendEmail(email, "Update on your Promoter application", `<h2>Update</h2><p>Your application was not approved.</p>`);

export const sendPurchaseConfirmationEmail = (email, productTitle, downloadUrl) =>
  sendEmail(email, `Your purchase: ${productTitle}`, `<h2>Thank you!</h2><p><strong>${productTitle}</strong></p><p><a href="${downloadUrl}">Download</a></p>`);

export const sendCreatorSaleEmail = (email, productTitle, amount) =>
  sendEmail(email, `You made a sale! ${productTitle}`, `<h2>Sale!</h2><p>${productTitle} sold for $${amount.toFixed(2)}</p>`);

export const sendPromoterCommissionEmail = (email, productTitle, commission) =>
  sendEmail(email, `Commission earned! ${productTitle}`, `<h2>Nice!</h2><p>$${commission.toFixed(2)} from ${productTitle}</p>`);