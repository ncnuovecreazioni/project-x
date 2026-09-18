export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ success: false, error: "Method Not Allowed" });
  }

  const checkoutUrl = String(process.env.PRO_CHECKOUT_URL || "").trim();
  if (!checkoutUrl || !/^https?:\/\//i.test(checkoutUrl)) {
    return res.redirect(302, "/pro.html?checkout=missing");
  }

  const source = String((req.query && req.query.source) || "project-x").slice(0, 120);
  const handoffId = String((req.query && req.query.handoffId) || "").trim().slice(0, 80);

  const url = new URL(checkoutUrl);
  url.searchParams.set("source", source);
  url.searchParams.set("product", "project-x-report-pro");

  if (handoffId && /^pxh-[a-z0-9-]+$/i.test(handoffId)) {
    url.searchParams.set("client_reference_id", handoffId);
    url.searchParams.set("px_handoff", handoffId);
  }

  return res.redirect(302, url.toString());
}
