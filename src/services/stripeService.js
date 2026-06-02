const STRIPE_SECRET = process.env.REACT_APP_STRIPE_SECRET_KEY;

export const createCheckoutSession = async (product, customerEmail, promoterSlug) => {
  const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${STRIPE_SECRET}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      "payment_method_types[]": "card",
      "mode": "payment",
      "customer_email": customerEmail || "",
      "line_items[0][price_data][currency]": "usd",
      "line_items[0][price_data][product_data][name]": product.title || product.name,
      "line_items[0][price_data][unit_amount]": Math.round((product.price || 0) * 100),
      "line_items[0][quantity]": "1",
      "success_url": `${window.location.origin}/checkout/success?productId=${product.id}`,
      "cancel_url": `${window.location.origin}/checkout/cancel`,
      "metadata[productId]": product.id,
      "metadata[creatorId]": product.creatorId || product.ownerUid,
      "metadata[promoterSlug]": promoterSlug || "",
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || "Failed to create checkout session");
  }

  return data.url;
};