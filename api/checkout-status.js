export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ success: false, error: "Method Not Allowed" });
  }

  const checkoutUrl = String(process.env.PRO_CHECKOUT_URL || "").trim();
  const stripeSecret = String(process.env.STRIPE_SECRET_KEY || "").trim();
  const stripePrice = String(process.env.STRIPE_PRICE_ID || "").trim();

  const paymentLinkConfigured = /^https?:\/\//i.test(checkoutUrl);
  const stripeSessionConfigured =
    /^sk_(test|live)_/i.test(stripeSecret) && Boolean(paymentLinkConfigured || stripePrice);

  res.setHeader("Cache-Control", "no-store");
  return res.status(200).json({
    success: true,
    configured: paymentLinkConfigured || stripeSessionConfigured,
    paymentLinkConfigured,
    testMode: paymentLinkConfigured && /stripe\.com\/test_/i.test(checkoutUrl),
    stripeSessionConfigured,
    automaticProfileHandoff: stripeSessionConfigured,
    deliveryVerificationConfigured: /^sk_(test|live)_/i.test(stripeSecret),
    product: "project-x-report-pro",
    price: 29,
    currency: "EUR"
  });
}
