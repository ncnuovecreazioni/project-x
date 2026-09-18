export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ success: false, error: "Method Not Allowed" });
  }

  const checkoutUrl = String(process.env.PRO_CHECKOUT_URL || "").trim();
  const configured = /^https?:\/\//i.test(checkoutUrl);

  res.setHeader("Cache-Control", "no-store");
  return res.status(200).json({
    success: true,
    configured,
    product: "project-x-report-pro",
    price: 29,
    currency: "EUR"
  });
}
