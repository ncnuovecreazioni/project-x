/* =========================================================
   PROJECT-X — AUTOPILOT CONTROL PLANE
   ---------------------------------------------------------
   Public mode:  /api/autopilot?mode=variant
   Dashboard:    /api/autopilot?mode=dashboard&token=...
   Cron mode:    /api/autopilot  (requires CRON_SECRET)

   Optional env:
   CRON_SECRET
   DASHBOARD_TOKEN
   AUTOPILOT_DATA_URL      -> JSON aggregate feed
   AUTOPILOT_WEBHOOK_URL   -> digest destination
   EVENT_WEBHOOK_URL       -> fallback digest destination
   LEAD_WEBHOOK_URL
   PRO_CHECKOUT_URL
   ========================================================= */

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function safeObject(value) {
  return value && typeof value === "object" ? value : {};
}

async function loadFeed() {
  const url = String(process.env.AUTOPILOT_DATA_URL || "").trim();
  if (!url || !/^https:\/\//i.test(url)) return { configured: false, data: null };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 3500);

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: { "Accept": "application/json" },
      signal: controller.signal,
      cache: "no-store"
    });
    if (!response.ok) return { configured: true, data: null, error: "feed_not_ok" };
    const data = await response.json();
    return {
      configured: true,
      data: data && typeof data === "object" ? data : null
    };
  } catch (error) {
    console.error("PROJECT-X autopilot feed error", error);
    return { configured: true, data: null, error: "feed_unavailable" };
  } finally {
    clearTimeout(timer);
  }
}

function getVariantStats(data) {
  const variants = data && data.variants;
  if (!variants) return [];

  if (Array.isArray(variants)) {
    return variants.map(function (item) {
      const views = Number(item.views || 0);
      const conversions = Number(item.conversions || 0);
      const rate = Number(item.conversionRate || item.rate || (views ? conversions / views : 0));
      return {
        id: String(item.id || "A"),
        views,
        conversions,
        rate,
        ratePct: Math.round(rate * 100 * 100) / 100
      };
    });
  }

  if (typeof variants === "object") {
    return Object.keys(variants).map(function (id) {
      const item = variants[id] || {};
      const views = Number(item.views || 0);
      const conversions = Number(item.conversions || 0);
      const rate = Number(item.conversionRate || item.rate || (views ? conversions / views : 0));
      return { id, views, conversions, rate, ratePct: Math.round(rate * 100 * 100) / 100 };
    });
  }

  return [];
}

function chooseVariant(data) {
  const stats = getVariantStats(data);
  const measured = stats.filter(function (item) {
    return item.views >= 10;
  });

  if (measured.length) {
    measured.sort(function (a, b) {
      if (b.rate !== a.rate) return b.rate - a.rate;
      return b.conversions - a.conversions;
    });

    return {
      variant: measured[0].id,
      source: "measured",
      stats: measured
    };
  }

  const variants = ["A", "B", "C"];
  const day = Math.floor(Date.now() / 86400000);
  return {
    variant: variants[day % variants.length],
    source: "rotation",
    stats: stats
  };
}

function getConversions(data) {
  const conversions = safeObject(data && data.conversions);
  return {
    affiliate: Number(conversions.affiliate || conversions.affiliate_redirect || 0),
    pro: Number(conversions.pro || conversions.reportPro || 0),
    implementation: Number(conversions.implementation || 0),
    lead: Number(conversions.lead || 0)
  };
}

function getEventCounts(data) {
  return safeObject(data && data.eventCounts);
}

function buildTotals(data) {
  const conversions = getConversions(data);
  const variants = getVariantStats(data);
  const views = variants.reduce(function (sum, item) { return sum + Number(item.views || 0); }, 0);
  const eventCounts = getEventCounts(data);

  return {
    views,
    affiliate: conversions.affiliate || Number(eventCounts.affiliate_redirect || 0),
    pro: conversions.pro,
    implementation: conversions.implementation,
    lead: conversions.lead
  };
}

function chooseRevenuePath(data) {
  const c = getConversions(data);
  const candidates = [
    { id: "affiliate", value: c.affiliate },
    { id: "pro", value: c.pro },
    { id: "implementation", value: c.implementation }
  ].filter(function (item) { return item.value > 0; });

  if (!candidates.length) return "report-pro";
  candidates.sort(function (a, b) { return b.value - a.value; });
  return candidates[0].id;
}

function buildReadiness(feed) {
  const data = feed && feed.data ? feed.data : {};
  const eventCounts = getEventCounts(data);
  const conversions = getConversions(data);
  const variantStats = getVariantStats(data);

  const readiness = {
    tracking: !!String(process.env.EVENT_WEBHOOK_URL || "").trim(),
    leadCapture: !!String(process.env.LEAD_WEBHOOK_URL || "").trim(),
    proCheckout: !!String(process.env.PRO_CHECKOUT_URL || "").trim(),
    proIntake: !!(
      String(process.env.PRO_INTAKE_WEBHOOK_URL || "").trim() ||
      String(process.env.LEAD_WEBHOOK_URL || "").trim()
    ),
    stripeVerification: !!String(process.env.STRIPE_SECRET_KEY || "").trim(),
    stripeWebhook: !!String(process.env.STRIPE_WEBHOOK_SECRET || "").trim(),
    receiptEmail: !!(
      String(process.env.RESEND_API_KEY || "").trim() &&
      String(process.env.EMAIL_FROM || "").trim()
    ),
    affiliateRouting: true,
    dataFeed: !!feed.configured,
    measuredExperiment: variantStats.some(function (item) { return Number(item.views || 0) >= 10; }),
    seoAutopilot: true,
    controlRoom: !!String(process.env.DASHBOARD_TOKEN || "").trim()
  };

  const actions = [];

  if (!readiness.tracking) actions.push("Collega EVENT_WEBHOOK_URL per non perdere i segnali di comportamento.");
  if (!readiness.leadCapture) actions.push("Collega LEAD_WEBHOOK_URL per trasformare i contatti in lead lavorabili automaticamente.");
  if (!readiness.proCheckout) actions.push("Collega PRO_CHECKOUT_URL per rendere acquistabile il Report PRO.");
  if (readiness.proCheckout && !readiness.stripeVerification) actions.push("Aggiungi STRIPE_SECRET_KEY per attivare la verifica server-side e il checkout automatico.");
  if (readiness.stripeVerification && !readiness.stripeWebhook) actions.push("Configura STRIPE_WEBHOOK_SECRET sul webhook Stripe per confermare gli ordini lato server.");
  if (!readiness.receiptEmail) actions.push("Collega RESEND_API_KEY + EMAIL_FROM per inviare automaticamente la conferma PRO via email.");
  if (!readiness.dataFeed) actions.push("Collega AUTOPILOT_DATA_URL con un feed aggregato per permettere al sistema di imparare dai dati.");
  if (readiness.dataFeed && !readiness.measuredExperiment) actions.push("Accumula almeno 10 visualizzazioni per variante prima di cambiare il vincitore.");

  if (eventCounts.affiliate_redirect || conversions.affiliate) {
    actions.push("Confronta analisi → click affiliate per individuare i percorsi con maggiore intenzione commerciale.");
  }

  if (conversions.pro) {
    actions.push("Usa gli acquisti PRO come segnale per ottimizzare il passaggio risultati → blueprint.");
  }

  if (conversions.implementation) {
    actions.push("Dai priorità ai lead implementation e raccogli il problema specifico che ha generato la richiesta.");
  }

  if (!actions.length) {
    actions.push("Il sistema è pronto a osservare, misurare e migliorare progressivamente il funnel.");
  }

  return { readiness, actions };
}

async function sendDigest(payload) {
  const webhook = String(
    process.env.AUTOPILOT_WEBHOOK_URL || process.env.EVENT_WEBHOOK_URL || ""
  ).trim();

  if (!webhook) return { sent: false, configured: false };
  if (!/^https:\/\//i.test(webhook)) return { sent: false, configured: true, error: "invalid_webhook" };

  try {
    const response = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    return { sent: response.ok, configured: true };
  } catch (error) {
    console.error("PROJECT-X autopilot digest error", error);
    return { sent: false, configured: true, error: "webhook_unavailable" };
  }
}

function dashboardAuthorized(req) {
  const expected = String(process.env.DASHBOARD_TOKEN || "").trim();
  if (!expected) return false;
  const queryToken = String((req.query && req.query.token) || "").trim();
  const header = String(req.headers.authorization || "");
  return queryToken === expected || header === `Bearer ${expected}`;
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ success: false, error: "Method Not Allowed" });
  }

  const mode = String(req.query && req.query.mode || "").trim().toLowerCase();

  if (mode === "freshness") {
    const feed = await loadFeed();
    const fallback = {
      generatedAt: "2026-09-23T00:00:00.000Z",
      tools: {
        make: "2026-09-23", pipedrive: "2026-09-23", hubspot: "2026-09-23",
        shopify: "2026-09-23", brevo: "2026-09-23", monday: "2026-09-23",
        getresponse: "2026-09-23", activecampaign: "2026-09-23", systeme: "2026-09-23",
        semrush: "2026-09-23", kit: "2026-09-23", close: "2026-09-23",
        zapier: "2026-09-23", asana: "2026-09-23", notion: "2026-09-23", clickup: "2026-09-23"
      }
    };
    const data = feed.data && feed.data.tools ? feed.data : fallback;
    const stale = Object.keys(data.tools || {}).map(function(id){
      const days = Math.floor((Date.now() - new Date(data.tools[id]).getTime()) / 86400000);
      return { id, verified: data.tools[id], days };
    }).filter(function(x){ return x.days > 30; });
    return res.status(200).json({
      success: true,
      generatedAt: data.generatedAt || new Date().toISOString(),
      source: feed.data ? "external-feed" : "registry",
      tools: data.tools || {},
      staleCount: stale.length,
      stale
    });
  }

  if (mode === "variant") {
    const feed = await loadFeed();
    const decision = chooseVariant(feed.data);
    return res.status(200).json({
      success: true,
      variant: decision.variant,
      source: decision.source,
      measured: decision.source === "measured"
    });
  }

  if (mode === "dashboard") {
    if (!dashboardAuthorized(req)) {
      return res.status(401).json({
        success: false,
        error: String(process.env.DASHBOARD_TOKEN || "").trim() ? "Unauthorized" : "DASHBOARD_TOKEN non configurato."
      });
    }

    const feed = await loadFeed();
    const data = feed.data || {};
    const control = buildReadiness(feed);
    const decision = chooseVariant(data);
    const conversions = getConversions(data);

    return res.status(200).json({
      success: true,
      generatedAt: new Date().toISOString(),
      recommendedVariant: decision.variant,
      variantSource: decision.source,
      variants: decision.stats,
      conversions,
      totals: buildTotals(data),
      readiness: control.readiness,
      actions: control.actions,
      nextRevenuePath: chooseRevenuePath(data),
      feedConfigured: feed.configured,
      feedAvailable: !!feed.data
    });
  }

  const secret = String(process.env.CRON_SECRET || "").trim();
  const authorization = String(req.headers.authorization || "");

  if (!secret || authorization !== `Bearer ${secret}`) {
    return res.status(401).json({ success: false, error: "Unauthorized" });
  }

  const feed = await loadFeed();
  const decision = chooseVariant(feed.data);
  const control = buildReadiness(feed);
  const payload = {
    source: "PROJECT-X-AUTOPILOT",
    generatedAt: new Date().toISOString(),
    recommendedVariant: decision.variant,
    variantSource: decision.source,
    nextRevenuePath: chooseRevenuePath(feed.data),
    readiness: control.readiness,
    actions: control.actions,
    measuredVariants: decision.stats,
    totals: buildTotals(feed.data),
    feedConfigured: feed.configured,
    feedAvailable: !!feed.data
  };

  const delivery = await sendDigest(payload);

  return res.status(200).json({
    success: true,
    ...payload,
    digest: delivery
  });
}
