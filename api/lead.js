/* =========================================================
   PROJECT-X — LEAD CAPTURE + LEAD SCORING
   ---------------------------------------------------------
   Riceve i contatti, assegna una priorità commerciale e
   inoltra un payload CRM-ready al webhook configurato.

   Env opzionale:
   LEAD_WEBHOOK_URL = URL webhook / CRM / automation

   PROJECT-X non salva localmente i lead.
   ========================================================= */

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function scoreLead(body, intent, report) {
  let score = intent === "implementation" ? 30 : 10;
  const budget = String(body.budget || report.budget || "").toLowerCase();
  const team = String(body.teamSize || report.teamSize || "").toLowerCase();
  const hours = String(body.hours || report.hours || "").toLowerCase();
  const pain = String(body.painPoint || report.painPoint || "").toLowerCase();
  const existing = Array.isArray(body.existingTools)
    ? body.existingTools
    : (Array.isArray(report.existingTools) ? report.existingTools : []);

  if (budget.indexOf("251") >= 0 || budget.indexOf("251+") >= 0) score += 25;
  else if (budget.indexOf("101") >= 0) score += 20;
  else if (budget.indexOf("51") >= 0) score += 15;
  else if (budget.indexOf("31") >= 0) score += 10;
  else if (budget.indexOf("1–30") >= 0 || budget.indexOf("1-30") >= 0) score += 5;

  if (team.indexOf("51") >= 0 || team.indexOf("51+") >= 0) score += 20;
  else if (team.indexOf("21") >= 0) score += 16;
  else if (team.indexOf("6") >= 0) score += 12;
  else if (team.indexOf("2") >= 0) score += 8;
  else if (team.indexOf("solo") >= 0) score += 4;

  if (hours.indexOf("30+") >= 0 || hours.indexOf("30") >= 0) score += 20;
  else if (hours.indexOf("16") >= 0) score += 16;
  else if (hours.indexOf("8") >= 0) score += 12;
  else if (hours.indexOf("4") >= 0) score += 8;
  else if (hours.indexOf("1") >= 0) score += 4;

  if (pain.length >= 160) score += 8;
  else if (pain.length >= 80) score += 5;
  if (/lead|client|cliente|preventiv|follow|email|automat|excel|workflow/.test(pain)) score += 7;
  if (existing.length) score += 5;

  score = clamp(score, 0, 100);
  const temperature = score >= 70 ? "HOT" : score >= 45 ? "WARM" : "COLD";
  const followup = intent === "implementation"
    ? ["contatto prioritario", "qualifica budget e processo", "proposta implementazione"]
    : score >= 70
      ? ["invia caso d'uso pertinente", "proponi Report PRO", "proponi implementazione"]
      : ["invia report", "mostra un caso d'uso", "riattiva con una domanda sul collo di bottiglia"];

  return {
    score,
    temperature,
    followup,
    tags: [
      "project-x",
      "intent:" + intent,
      "temperature:" + temperature.toLowerCase()
    ]
  };
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method Not Allowed" });
  }

  const body = req.body || {};
  const email = String(body.email || "").trim().toLowerCase().slice(0, 160);
  const name = String(body.name || "").trim().slice(0, 120);
  const intent = String(body.intent || "report").trim().slice(0, 60);
  const source = String(body.source || "PROJECT-X").trim().slice(0, 60);
  const report = body.report && typeof body.report === "object" ? body.report : {};

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({
      success: false,
      error: "Inserisci un indirizzo email valido."
    });
  }

  const lead = scoreLead(body, intent, report);
  const leadId = "pxl-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8);
  const webhook = String(process.env.LEAD_WEBHOOK_URL || "").trim();

  const payload = {
    source,
    createdAt: new Date().toISOString(),
    leadId,
    intent,
    name,
    email,
    leadScore: lead.score,
    leadTemperature: lead.temperature,
    tags: lead.tags,
    recommendedFollowup: lead.followup,
    businessType: String(body.businessType || report.businessType || "").slice(0, 100),
    teamSize: String(body.teamSize || report.teamSize || "").slice(0, 30),
    budget: String(body.budget || report.budget || "").slice(0, 30),
    painPoint: String(body.painPoint || report.painPoint || "").slice(0, 800),
    report
  };

  if (!webhook) {
    return res.status(200).json({
      success: true,
      configured: false,
      leadId,
      leadScore: lead.score,
      leadTemperature: lead.temperature,
      error: "Lead acquisito localmente dalla richiesta, ma webhook non ancora configurato."
    });
  }

  try {
    const response = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      console.error("PROJECT-X lead webhook error", response.status);
      return res.status(200).json({
        success: false,
        configured: true,
        leadId,
        leadScore: lead.score,
        leadTemperature: lead.temperature,
        error: "Impossibile consegnare il contatto."
      });
    }

    return res.status(200).json({
      success: true,
      configured: true,
      leadId,
      leadScore: lead.score,
      leadTemperature: lead.temperature
    });
  } catch (error) {
    console.error("PROJECT-X lead network error", error);
    return res.status(200).json({
      success: false,
      configured: true,
      leadId,
      leadScore: lead.score,
      leadTemperature: lead.temperature,
      error: "Errore durante l'invio del contatto."
    });
  }
}
