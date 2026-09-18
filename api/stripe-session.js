export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ success: false, error: "Method Not Allowed" });
  }

  const sessionId = String((req.query && req.query.session_id) || "").trim();
  const secret = String(process.env.STRIPE_SECRET_KEY || "").trim();

  if (!sessionId || !/^cs_(test_|live_)?[A-Za-z0-9_]+$/i.test(sessionId)) {
    return res.status(400).json({ success: false, error: "Session ID non valido." });
  }
  if (!secret || !/^sk_(test|live)_/i.test(secret)) {
    return res.status(503).json({ success: false, configured: false, error: "Verifica Stripe non configurata." });
  }

  try {
    const response = await fetch(
      "https://api.stripe.com/v1/checkout/sessions/" + encodeURIComponent(sessionId),
      {
        headers: {
          "Authorization": "Basic " + Buffer.from(secret + ":").toString("base64")
        }
      }
    );
    const data = await response.json();

    if (!response.ok) {
      console.error("PROJECT-X Stripe session lookup error", data);
      return res.status(502).json({ success: false, error: "Impossibile verificare la sessione." });
    }

    const paid = data.payment_status === "paid";
    const product = data.metadata && data.metadata.product
      ? String(data.metadata.product)
      : "";

    return res.status(200).json({
      success: true,
      configured: true,
      paid,
      status: String(data.status || ""),
      paymentStatus: String(data.payment_status || ""),
      product,
      validProduct: product === "project-x-report-pro",
      clientReferenceId: String(data.client_reference_id || ""),
      mode: String(data.mode || "")
    });
  } catch (error) {
    console.error("PROJECT-X Stripe session exception", error);
    return res.status(500).json({ success: false, error: "Errore durante la verifica." });
  }
}
