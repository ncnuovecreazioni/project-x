export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ success: false, error: "Method Not Allowed" });
  }

  const has = key => Boolean(String(process.env[key] || "").trim());
  res.setHeader("Cache-Control", "no-store");

  return res.status(200).json({
    success: true,
    service: "PROJECT-X",
    environment: String(process.env.VERCEL_ENV || "unknown"),
    timestamp: new Date().toISOString(),
    readiness: {
      affiliate: [
        "AFFILIATE_SYSTEME","AFFILIATE_PIPEDRIVE","AFFILIATE_GETRESPONSE",
        "AFFILIATE_ACTIVECAMPAIGN","AFFILIATE_HUBSPOT","AFFILIATE_SHOPIFY",
        "AFFILIATE_MAKE","AFFILIATE_BREVO","AFFILIATE_MONDAY",
        "AFFILIATE_SEMRUSH","AFFILIATE_KIT"
      ].some(has),
      leadWebhook: has("LEAD_WEBHOOK_URL"),
      eventWebhook: has("EVENT_WEBHOOK_URL"),
      proIntakeWebhook: has("PRO_INTAKE_WEBHOOK_URL") || has("LEAD_WEBHOOK_URL"),
      proCheckoutLink: has("PRO_CHECKOUT_URL"),
      stripeSession: has("STRIPE_SECRET_KEY") && has("STRIPE_PRICE_ID"),
      stripeVerification: has("STRIPE_SECRET_KEY"),
      stripeWebhook: has("STRIPE_WEBHOOK_SECRET"),
      proOrderWebhook: has("PRO_ORDER_WEBHOOK_URL") || has("LEAD_WEBHOOK_URL")
    }
  });
}
