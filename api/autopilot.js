/* =========================================================
   PROJECT-X — AUTOPILOT CONTROL PLANE
   ---------------------------------------------------------
   Public mode: /api/autopilot?mode=variant
   Cron mode:   /api/autopilot   (requires CRON_SECRET)

   Optional env:
   CRON_SECRET
   AUTOPILOT_DATA_URL      -> JSON aggregate feed
   AUTOPILOT_WEBHOOK_URL   -> digest destination
   EVENT_WEBHOOK_URL       -> fallback digest destination
   ========================================================= */

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function pct(n) {
  const value = Number(n);
  return Number.isFinite(value) ? clamp(Math.round(value * 100), 0, 100) : 0;
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
      return {
        id: String(item.id || "A"),
        views: Number(item.views || 0),
        conversions: Number(item.conversions || 0),
        rate: Number(item.conversionRate || item.rate || 0)
      };
    });
  }

  if (typeof variants === "object") {
    return Object.keys(variants).map(function (id) {
      const item = variants[id] || {};
      const views = Number(item.views || 0);
      const conversions = Number(item.conversions || 0);
      const rate = Number(item.conversionRate || item.rate || (views ? conversions / views : 0));
      return { id, views, conversions, rate };
    });
  }

  return [];
}

function chooseVariant(data) {
  const stats = getVariantStats(data).filter(function (item) {
    return item.views >= 10;
  });

  if (stats.length) {
    stats.sort(function (a, b) {
      if (b.rate !== a.rate) return b.rate - a.rate;
      return b.conversions - a.conversions;
    });

    return {
      variant: stats[0].id,
      source: "measured",
      stats
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

function buildReadiness(feed) {
  const data = feed && feed.data ? feed.data : {};
  const eventCounts = data.eventCounts && typeof data.eventCounts === "object" ? data.eventCounts : {};
  const conversions = data.conversions && typeof data.conversions === "object" ? data.conversions : {};

  const readiness = {
    tracking: !!String(process.env.EVENT_WEBHOOK_URL || "").trim(),
    leadCapture: !!String(process.env.LEAD_WEBHOOK_URL || "").trim(),
    proCheckout: !!String(process.env.PRO_CHECKOUT_URL || "").trim(),
    affiliateRouting: true,
    dataFeed: !!feed.configured,
    measuredExperiment: getVariantStats(data).some(function (item) { return Number(item.views || 0) >= 10; }),
    seoAutopilot: true
  };

  const actions = [];

  if (!readiness.tracking) actions.push("Collega EVENT_WEBHOOK_URL per non perdere i segnali di comportamento.");
  if (!readiness.leadCapture) actions.push("Collega LEAD_WEBHOOK_URL per trasformare i contatti in lead lavorabili automaticamente.");
  if (!readiness.proCheckout) actions.push("Collega PRO_CHECKOUT_URL per rendere acquistabile il Report PRO.");
  if (!readiness.dataFeed) actions.push("Collega AUTOPILOT_DATA_URL con un feed aggregato per permettere agli esperimenti di imparare dai dati.");
  if (readiness.dataFeed && !readiness.measuredExperiment) actions.push("Accumula almeno 10 visualizzazioni per variante prima di cambiare il vincitore.");

  if (eventCounts.affiliate_redirect || conversions.affiliate) {
    actions.push("Monitora il rapporto analisi → click affiliate e conserva solo i partner coerenti con il profilo utente.");
  }

  if (conversions.reportPro || conversions.pro) {
    actions.push("Ottimizza il passaggio risultati → Report PRO sulla base del tasso di acquisto reale.");
  }

  if (conversions.implementation) {
    actions.push("Dai priorità ai lead implementation e raccogli il problema specifico che li ha portati alla richiesta.");
  }

  if (!actions.length) {
    actions.push("Il sistema è pronto a osservare, misurare e aumentare progressivamente la qualità del funnel.");
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

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ success: false, error: "Method Not Allowed" });
  }

  const mode = String(req.query && req.query.mode || "").trim().toLowerCase();

  if (mode === "variant") {
    const feed = await loadFeed();
    const decision = chooseVariant(feed.data);
    return res.status(200).json({
      success: true,
      variant: decision.variant,
      source: decision.source,
      measured: decision.stats.length > 0
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
    readiness: control.readiness,
    actions: control.actions,
    measuredVariants: decision.stats,
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
