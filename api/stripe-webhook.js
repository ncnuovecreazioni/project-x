import crypto from "crypto";

function getRawBody(req) {
  return new Promise((resolve, reject) => {
    if (typeof req.body === "string") return resolve(req.body);
    if (Buffer.isBuffer(req.body)) return resolve(req.body.toString("utf8"));

    const chunks = [];
    req.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

function verifyStripeSignature(payload, signature, secret) {
  if (!payload || !signature || !secret) return false;

  const parts = signature.split(",").reduce((acc, item) => {
    const [key, value] = item.split("=", 2);
    if (key === "t" && value) acc.t = value;
    if (key === "v1" && value) acc.v1.push(value);
    return acc;
  }, { t: "", v1: [] });

  if (!parts.t || !parts.v1.length) return false;

  const timestamp = Number(parts.t);
  if (!Number.isFinite(timestamp)) return false;

  const tolerance = 300;
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - timestamp) > tolerance) return false;

  const signedPayload = parts.t + "." + payload;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(signedPayload, "utf8")
    .digest("hex");

  const expectedBuffer = Buffer.from(expected, "utf8");
  return parts.v1.some((received) => {
    const receivedBuffer = Buffer.from(received, "utf8");
    return receivedBuffer.length === expectedBuffer.length &&
      crypto.timingSafeEqual(expectedBuffer, receivedBuffer);
  });
}



async function sendReceiptEmail(order) {
  const apiKey = String(process.env.RESEND_API_KEY || "").trim();
  const from = String(process.env.EMAIL_FROM || "").trim();
  if (!apiKey || !from || !order.customerEmail) return false;

  const appUrl = /^https?:\/\//i.test(process.env.APP_URL || "")
    ? String(process.env.APP_URL).replace(/\/$/, "")
    : "https://project-x-phi-steel.vercel.app";
  const link = appUrl + "/pro-delivery.html?session_id=" + encodeURIComponent(order.sessionId);

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + apiKey,
        "Content-Type": "application/json",
        "Idempotency-Key": "projectx-stripe-" + order.eventId
      },
      body: JSON.stringify({
        from,
        to: [order.customerEmail],
        subject: "Il tuo Report PRO — PROJECT-X",
        html:
          '<div style="font-family:Arial,sans-serif;max-width:620px;margin:auto;color:#172033">' +
          '<h1 style="font-size:28px">Il pagamento è stato verificato.</h1>' +
          '<p>Grazie per aver acquistato il Report PRO di PROJECT-X.</p>' +
          '<p>Puoi aprire la pagina verificata del tuo ordine e visualizzare la blueprint personalizzata.</p>' +
          '<p><a href="' + link + '" style="display:inline-block;padding:12px 16px;background:#7c5cff;color:#fff;text-decoration:none;border-radius:10px;font-weight:700">Apri il Report PRO →</a></p>' +
          '<p style="color:#667085;font-size:12px">Riferimento ordine: ' + order.sessionId + '</p>' +
          '</div>'
      })
    });

    if (!response.ok) {
      console.error("PROJECT-X Resend error", response.status);
      return false;
    }
    return true;
  } catch (error) {
    console.error("PROJECT-X Resend exception", error);
    return false;
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ success: false, error: "Method Not Allowed" });
  }

  const secret = String(process.env.STRIPE_WEBHOOK_SECRET || "").trim();
  if (!secret) {
    return res.status(503).json({
      success: false,
      error: "Stripe webhook is not configured"
    });
  }

  try {
    const rawBody = await getRawBody(req);
    const signature = String(req.headers["stripe-signature"] || "");

    if (!verifyStripeSignature(rawBody, signature, secret)) {
      return res.status(400).json({
        success: false,
        error: "Invalid Stripe signature"
      });
    }

    const event = JSON.parse(rawBody);

    if (event.type === "checkout.session.completed") {
      const session = event.data && event.data.object
        ? event.data.object
        : {};

      const paymentStatus = String(session.payment_status || "");
      const email =
        session.customer_details && session.customer_details.email
          ? String(session.customer_details.email)
          : "";

      const configuredPaymentLinkId = String(process.env.STRIPE_PAYMENT_LINK_ID || "").trim();
      const product = session.metadata && session.metadata.product
        ? String(session.metadata.product)
        : "";
      const paymentLinkId = String(session.payment_link || "").trim();

      const amountMatchesPro = Number(session.amount_total || 0) === 2900 &&
        String(session.currency || "").toLowerCase() === "eur";
      const isProjectXOrder =
        product === "project-x-report-pro" ||
        (configuredPaymentLinkId && paymentLinkId === configuredPaymentLinkId) ||
        (!product && paymentLinkId && amountMatchesPro);

      if (!isProjectXOrder) {
        console.log("PROJECT-X Stripe event ignored: not a recognized PRO order.");
        return res.status(200).json({ received: true, ignored: true });
      }

      const order = {
        eventId: String(event.id || ""),
        type: event.type,
        paymentStatus,
        customerEmail: email,
        sessionId: String(session.id || ""),
        product: "project-x-report-pro",
        clientReferenceId: String(session.client_reference_id || ""),
        paymentLinkId,
        amountTotal: Number(session.amount_total || 0),
        currency: String(session.currency || "").toLowerCase(),
        paid: paymentStatus === "paid",
        receivedAt: new Date().toISOString()
      };

      if (!order.paid) {
        console.log("PROJECT-X Stripe PRO session is not paid:", JSON.stringify(order));
        return res.status(200).json({ received: true, paid: false });
      }

      const webhookUrl = String(
        process.env.PRO_ORDER_WEBHOOK_URL ||
        process.env.LEAD_WEBHOOK_URL ||
        ""
      ).trim();

      if (webhookUrl && /^https?:\/\//i.test(webhookUrl)) {
        try {
          await fetch(webhookUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              type: "projectx_stripe_payment",
              order,
              nextStep: "deliver-report"
            })
          });
        } catch (forwardError) {
          console.error("Stripe event forwarding failed:", forwardError);
        }
      }

      const emailSent = await sendReceiptEmail(order);
      console.log("PROJECT-X Stripe payment confirmed:", JSON.stringify({ ...order, emailSent }));
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error("Stripe webhook error:", error);
    return res.status(400).json({
      success: false,
      error: "Invalid webhook payload"
    });
  }
}
