/* =========================================================
   PROJECT-X — PRO INTAKE
   ---------------------------------------------------------
   Prepara il contesto del Report PRO prima del checkout.
   Se PRO_INTAKE_WEBHOOK_URL è configurato, inoltra il
   profilo a un archivio/CRM/automation esterno.
   In assenza di quello usa LEAD_WEBHOOK_URL come fallback.
   Non salva dati in modo permanente sul server.
   ========================================================= */

function clean(value, max = 500) {
  return String(value == null ? "" : value).trim().slice(0, max);
}

function safeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ success: false, error: "Method Not Allowed" });
  }

  const body = safeObject(req.body);
  const answers = safeObject(body.answers);
  const consent = body.consent === true;
  if (!consent) {
    return res.status(400).json({ success: false, error: "Consenso richiesto." });
  }

  const handoffId =
    "pxh-" +
    Date.now().toString(36) +
    "-" +
    Math.random().toString(36).slice(2, 8);

  const payload = {
    type: "projectx_pro_intake",
    handoffId,
    createdAt: new Date().toISOString(),
    product: "project-x-report-pro",
    businessType: clean(answers.businessType, 100),
    teamSize: clean(answers.teamSize, 50),
    budget: clean(answers.budget, 50),
    goals: clean(answers.goals, 800),
    painPoint: clean(answers.painPoint, 1200),
    automation: clean(answers.automation, 500),
    tech: clean(answers.tech, 500),
    existingTools: Array.isArray(answers.existingTools)
      ? answers.existingTools.map(x => clean(x, 100)).slice(0, 30)
      : [],
    source: clean(body.source || "report-pro", 100)
  };

  const webhook = clean(
    process.env.PRO_INTAKE_WEBHOOK_URL || process.env.LEAD_WEBHOOK_URL,
    1000
  );

  if (webhook && /^https?:\/\//i.test(webhook)) {
    try {
      const response = await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        console.error("PROJECT-X PRO intake webhook error:", response.status);
      }
    } catch (error) {
      console.error("PROJECT-X PRO intake forwarding error:", error);
    }
  }

  return res.status(200).json({
    success: true,
    handoffId,
    forwarded: Boolean(webhook && /^https?:\/\//i.test(webhook))
  });
}
