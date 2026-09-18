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
    if (key && value) acc[key] = value;
    return acc;
  }, {});

  if (!parts.t || !parts.v1) return false;

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
  const receivedBuffer = Buffer.from(parts.v1, "utf8");

  if (expectedBuffer.length !== receivedBuffer.length) return false;
  return crypto.timingSafeEqual(expectedBuffer, receivedBuffer);
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

      const isProjectXOrder =
        product === "project-x-report-pro" ||
        (configuredPaymentLinkId && paymentLinkId === configuredPaymentLinkId);

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

      console.log("PROJECT-X Stripe payment confirmed:", JSON.stringify(order));
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
