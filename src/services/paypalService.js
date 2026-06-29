// PayPal service — handles payment processing
// No Stripe needed anymore

export const createPayPalOrder = async (product, promoterSlug, customerEmail) => {
  // In production, you'd call your backend to create the order
  // For now, we use the client-side approach with PayPal Buttons
  return {
    productId: product.id,
    title: product.title || product.name,
    price: product.price,
    creatorId: product.creatorId || product.ownerUid,
    promoterSlug: promoterSlug || null,
    customerEmail: customerEmail || "customer@syndra.com",
  };
};