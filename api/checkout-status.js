export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ success: false, error: "Method Not Allowed" });
  }

  const checkoutUrl = String(process.env.PRO_CHECKOUT_URL || "").trim();
  const stripeSecret = String(process.env.STRIPE_SECRET_KEY || "").trim();
  const stripePrice = String(process.env.STRIPE_PRICE_ID || "").trim();

  const paymentLinkConfigured = /^https?:\/\//i.test(checkoutUrl);
  const stripeConfigured =
    /^sk_(test|live)_/i.test(stripeSecret) &&
    Boolean(stripePrice || paymentLinkConfigured);

  const stripeMode = /^sk_live_/i.test(stripeSecret)
    ? "live"
    : /^sk_test_/i.test(stripeSecret)
      ? "test"
      : "not-configured";

  const testPaymentLink = paymentLinkConfigured && /stripe\.com\/test_/i.test(checkoutUrl);
  const livePaymentLink = paymentLinkConfigured && !testPaymentLink;
  const secureProfileHandoff = stripeConfigured;
  const realSalesReady =
    stripeMode === "live"
      ? Boolean(stripePrice || livePaymentLink)
      : false;

  res.setHeader("Cache-Control", "no-store");
  return res.status(200).json({
    success: true,
    configured: paymentLinkConfigured || stripeConfigured,
    paymentLinkConfigured,
    testMode: testPaymentLink || stripeMode === "test",
    stripeMode,
    stripeSessionConfigured: stripeConfigured,
    automaticProfileHandoff: secureProfileHandoff,
    secureProfileHandoff,
    realSalesReady,
    deliveryVerificationConfigured: /^sk_(test|live)_/i.test(stripeSecret),
    product: "project-x-report-pro",
    price: 29,
    currency: "EUR"
  });
}
