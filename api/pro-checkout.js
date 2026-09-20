function clean(value, max = 500) {
  return String(value == null ? "" : value).trim().slice(0, max);
}

function safeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function addProfileMetadata(params, answers) {
  const a = safeObject(answers);
  const fields = {
    profile_version: "1",
    business_type: clean(a.businessType, 180),
    team_size: clean(a.teamSize, 80),
    budget: clean(a.budget, 80),
    goals: clean(a.goals, 500),
    pain_point: clean(a.painPoint, 500),
    automation: clean(a.automation, 400),
    tech: clean(a.tech, 400),
    hours: clean(a.hours, 80),
    hourly_value: clean(a.hourlyValue, 80),
    existing_tools: Array.isArray(a.existingTools)
      ? a.existingTools.map(x => clean(x, 60)).slice(0, 12).join(" | ").slice(0, 500)
      : ""
  };

  Object.entries(fields).forEach(([key, value]) => {
    if (value) params.set("metadata[" + key + "]", value);
  });
}

async function trackCheckoutStart(source, handoffId, mode) {
  const webhook = String(process.env.EVENT_WEBHOOK_URL || "").trim();
  if (!webhook || !/^https?:\/\//i.test(webhook)) return;
  try {
    await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        source: "PROJECT-X",
        createdAt: new Date().toISOString(),
        event: "pro_checkout_start",
        sessionId: handoffId || "",
        meta: { source, mode }
      })
    });
  } catch (error) {
    console.error("PROJECT-X checkout event error", error);
  }
}

async function stripeRequest(secret, path, options = {}) {
  const response = await fetch("https://api.stripe.com/v1" + path, {
    method: options.method || "GET",
    headers: {
      "Authorization": "Basic " + Buffer.from(secret + ":").toString("base64"),
      ...(options.body ? { "Content-Type": "application/x-www-form-urlencoded" } : {})
    },
    body: options.body || undefined
  });
  const data = await response.json();
  return { response, data };
}

async function resolvePriceId(secret) {
  const configuredPrice = String(process.env.STRIPE_PRICE_ID || "").trim();
  if (configuredPrice) return configuredPrice;

  const paymentLinkUrl = String(process.env.PRO_CHECKOUT_URL || "").trim();
  if (!paymentLinkUrl) return "";

  const links = await stripeRequest(secret, "/payment_links?active=true&limit=100");
  if (!links.response.ok || !links.data || !Array.isArray(links.data.data)) return "";

  const match = links.data.data.find(link => String(link.url || "") === paymentLinkUrl);
  if (!match || !match.id) return "";

  const items = await stripeRequest(
    secret,
    "/payment_links/" + encodeURIComponent(match.id) + "/line_items?limit=20"
  );

  if (!items.response.ok || !items.data || !Array.isArray(items.data.data)) return "";
  const first = items.data.data[0];
  return first && first.price && first.price.id ? String(first.price.id) : "";
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "GET" && req.method !== "POST") {
    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ success: false, error: "Method Not Allowed" });
  }

  const body = safeObject(req.body);
  const source = clean(
    req.method === "POST" ? body.source || "project-x" : (req.query && req.query.source) || "project-x",
    120
  );
  const handoffId = clean(
    req.method === "POST" ? body.handoffId || "" : (req.query && req.query.handoffId) || "",
    80
  );
  const answers = req.method === "POST" ? safeObject(body.answers) : {};
  if (req.method === "POST" && body.consent !== true) {
    return res.status(400).json({ success: false, error: "Consenso richiesto." });
  }

  const secret = String(process.env.STRIPE_SECRET_KEY || "").trim();

  if (secret && /^sk_(test|live)_/i.test(secret)) {
    await trackCheckoutStart(source, handoffId, "stripe-session");
    try {
      const priceId = await resolvePriceId(secret);

      if (priceId) {
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
        addProfileMetadata(params, answers);

        if (handoffId && /^pxh-[a-z0-9-]+$/i.test(handoffId)) {
          params.set("client_reference_id", handoffId);
          params.set("metadata[handoff_id]", handoffId);
        }

        const created = await stripeRequest(secret, "/checkout/sessions", {
          method: "POST",
          body: params.toString()
        });

        if (created.response.ok && created.data && created.data.url) {
          if (req.method === "POST") {
            return res.status(200).json({
              success: true,
              checkoutUrl: created.data.url,
              mode: "stripe-session",
              handoffId: handoffId || ""
            });
          }
          return res.redirect(303, created.data.url);
        }

        console.error("PROJECT-X Stripe Checkout creation error", created.data);
      }
    } catch (error) {
      console.error("PROJECT-X Stripe Checkout exception", error);
    }
  }

  // Fallback: keep the currently working Payment Link.
  await trackCheckoutStart(source, handoffId, "payment-link");
  const checkoutUrl = String(process.env.PRO_CHECKOUT_URL || "").trim();
  if (!checkoutUrl || !/^https?:\/\//i.test(checkoutUrl)) {
    if (req.method === "POST") {
      return res.status(503).json({
        success: false,
        configured: false,
        error: "Checkout non configurato."
      });
    }
    return res.redirect(302, "/pro.html?checkout=missing");
  }

  const url = new URL(checkoutUrl);
  url.searchParams.set("source", source);
  url.searchParams.set("product", "project-x-report-pro");

  if (handoffId && /^pxh-[a-z0-9-]+$/i.test(handoffId)) {
    url.searchParams.set("client_reference_id", handoffId);
    url.searchParams.set("px_handoff", handoffId);
  }

  if (req.method === "POST") {
    return res.status(200).json({
      success: true,
      checkoutUrl: url.toString(),
      mode: "payment-link",
      handoffId: handoffId || ""
    });
  }

  return res.redirect(302, url.toString());
}
