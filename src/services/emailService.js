import { Resend } from "resend";

const resend = new Resend(process.env.REACT_APP_RESEND_API_KEY);
const SENDER = "Syndra <onboarding@resend.dev>";

export const sendWelcomeEmail = async (email, name) => {
  try {
    await resend.emails.send({
      from: SENDER,
      to: email,
      subject: "Welcome to Syndra!",
      html: `<h2>Welcome to Syndra, ${name}!</h2><p>You're now part of the digital marketplace.</p><p>Get started:</p><ul><li>Browse the marketplace</li><li>Upload your first product</li><li>Apply to become a promoter</li></ul><p>– The Syndra Team</p>`,
    });
  } catch (err) {
    console.error("Welcome email failed:", err);
  }
};

export const sendProductApprovedEmail = async (email, productTitle) => {
  try {
    await resend.emails.send({
      from: SENDER,
      to: email,
      subject: `Your product "${productTitle}" has been approved!`,
      html: `<h2>Great news!</h2><p>Your product <strong>${productTitle}</strong> has been approved and is now live on the Syndra marketplace.</p><p>– The Syndra Team</p>`,
    });
  } catch (err) {
    console.error("Product approved email failed:", err);
  }
};

export const sendProductRejectedEmail = async (email, productTitle) => {
  try {
    await resend.emails.send({
      from: SENDER,
      to: email,
      subject: `Update on your product "${productTitle}"`,
      html: `<h2>Update</h2><p>Your product <strong>${productTitle}</strong> was not approved.</p><p>Log in to your dashboard for details.</p><p>– The Syndra Team</p>`,
    });
  } catch (err) {
    console.error("Product rejected email failed:", err);
  }
};

export const sendPromoterApprovedEmail = async (email, slug) => {
  try {
    await resend.emails.send({
      from: SENDER,
      to: email,
      subject: "You're approved as a Syndra Promoter!",
      html: `<h2>Congratulations!</h2><p>Your promoter application has been approved.</p><p>Your referral slug: <strong>${slug}</strong></p><p>Start sharing and earning 20% commission!</p><p>– The Syndra Team</p>`,
    });
  } catch (err) {
    console.error("Promoter approved email failed:", err);
  }
};

export const sendPromoterRejectedEmail = async (email) => {
  try {
    await resend.emails.send({
      from: SENDER,
      to: email,
      subject: "Update on your Syndra Promoter application",
      html: `<h2>Update</h2><p>Your promoter application was not approved at this time.</p><p>You can re-apply with updated information.</p><p>– The Syndra Team</p>`,
    });
  } catch (err) {
    console.error("Promoter rejected email failed:", err);
  }
};

export const sendPurchaseConfirmationEmail = async (email, productTitle, downloadUrl) => {
  try {
    await resend.emails.send({
      from: SENDER,
      to: email,
      subject: `Your purchase: ${productTitle}`,
      html: `<h2>Thank you for your purchase!</h2><p>Product: <strong>${productTitle}</strong></p><p><a href="${downloadUrl}">Download your file</a></p><p>– The Syndra Team</p>`,
    });
  } catch (err) {
    console.error("Purchase confirmation email failed:", err);
  }
};

export const sendCreatorSaleEmail = async (email, productTitle, amount) => {
  try {
    await resend.emails.send({
      from: SENDER,
      to: email,
      subject: `You made a sale! ${productTitle}`,
      html: `<h2>Congratulations!</h2><p>Your product <strong>${productTitle}</strong> just sold for $${amount.toFixed(2)}.</p><p>Your earnings: $${(amount * 0.7).toFixed(2)}</p><p>– The Syndra Team</p>`,
    });
  } catch (err) {
    console.error("Creator sale email failed:", err);
  }
};

export const sendPromoterCommissionEmail = async (email, productTitle, commission) => {
  try {
    await resend.emails.send({
      from: SENDER,
      to: email,
      subject: `You earned a commission! ${productTitle}`,
      html: `<h2>Nice work!</h2><p>Someone purchased <strong>${productTitle}</strong> through your referral link.</p><p>Your commission: $${commission.toFixed(2)}</p><p>– The Syndra Team</p>`,
    });
  } catch (err) {
    console.error("Promoter commission email failed:", err);
  }
};