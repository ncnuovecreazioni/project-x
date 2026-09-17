/* =========================================================
   PROJECT-X — LEAD CAPTURE
   ---------------------------------------------------------
   Riceve i contatti dal report gratuito e dall'eventuale
   richiesta di implementazione.

   Env opzionale:
   LEAD_WEBHOOK_URL = URL webhook / CRM / automation

   PROJECT-X non salva localmente i lead.
   ========================================================= */

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      error: "Method Not Allowed"
    });
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

  const webhook = String(process.env.LEAD_WEBHOOK_URL || "").trim();

  if (!webhook) {
    return res.status(200).json({
      success: false,
      configured: false,
      error: "Sistema lead non ancora collegato."
    });
  }

  const payload = {
    source,
    createdAt: new Date().toISOString(),
    intent,
    name,
    email,
    report
  };

  try {
    const response = await fetch(webhook, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      console.error("PROJECT-X lead webhook error", response.status);
      return res.status(200).json({
        success: false,
        configured: true,
        error: "Impossibile consegnare il contatto."
      });
    }

    return res.status(200).json({
      success: true,
      configured: true
    });
  } catch (error) {
    console.error("PROJECT-X lead network error", error);
    return res.status(200).json({
      success: false,
      configured: true,
      error: "Errore durante l'invio del contatto."
    });
  }
}
