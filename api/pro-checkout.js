export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ success: false, error: "Method Not Allowed" });
  }

  const source = String((req.query && req.query.source) || "project-x").slice(0, 120);
  const handoffId = String((req.query && req.query.handoffId) || "").trim().slice(0, 80);
  const secret = String(process.env.STRIPE_SECRET_KEY || "").trim();
  const priceId = String(process.env.STRIPE_PRICE_ID || "").trim();

  // Preferred path: create a fresh Checkout Session so the handoff ID is
  // carried natively into Stripe and returned by checkout.session.completed.
  if (secret && priceId && /^sk_(test|live)_/i.test(secret)) {
    try {
      const origin = /^https?:\/\//i.test(process.env.APP_URL || "")
        ? String(process.env.APP_URL).replace(/\/$/, "")
        : `${req.headers && req.headers.host ? "https://" + req.headers.host : "https://project-x-phi-steel.vercel.app"}`;

      const params = new URLSearchParams();
      params.set("mode", "payment");
      params.set("line_items[0][price]", priceId);
      params.set("line_items[0][quantity]", "1");
      params.set("success_url", origin + "/pro-success.html?session_id={CHECKOUT_SESSION_ID}");
      params.set("cancel_url", origin + "/pro.html?checkout=cancelled");
      params.set("metadata[product]", "project-x-report-pro");
      params.set("metadata[source]", source);
      if (handoffId && /^pxh-[a-z0-9-]+$/i.test(handoffId)) {
        params.set("client_reference_id", handoffId);
        params.set("metadata[handoff_id]", handoffId);
      }

      const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
        method: "POST",
        headers: {
          "Authorization": "Basic " + Buffer.from(secret + ":").toString("base64"),
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: params.toString()
      });

      const data = await response.json();
      if (response.ok && data && data.url) {
        return res.redirect(303, data.url);
      }

      console.error("PROJECT-X Stripe Checkout error", data);
    } catch (error) {
      console.error("PROJECT-X Stripe Checkout exception", error);
    }
  }

  // Fallback: keep the currently working Payment Link.
  const checkoutUrl = String(process.env.PRO_CHECKOUT_URL || "").trim();
  if (!checkoutUrl || !/^https?:\/\//i.test(checkoutUrl)) {
    return res.redirect(302, "/pro.html?checkout=missing");
  }

  const url = new URL(checkoutUrl);
  url.searchParams.set("source", source);
  url.searchParams.set("product", "project-x-report-pro");

  // These query params are retained only as a best-effort fallback for
  // providers/payment-link configurations that expose them.
  if (handoffId && /^pxh-[a-z0-9-]+$/i.test(handoffId)) {
    url.searchParams.set("client_reference_id", handoffId);
    url.searchParams.set("px_handoff", handoffId);
  }

  return res.redirect(302, url.toString());
}
