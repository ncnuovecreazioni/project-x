/* =========================================================
   PROJECT-X — LEAD CAPTURE
   ---------------------------------------------------------
   Riceve i contatti dal report gratuito.

   Configurazione Vercel opzionale:
   LEAD_WEBHOOK_URL = URL del tuo webhook / CRM / automation

   Il dato viene inoltrato solo se LEAD_WEBHOOK_URL è presente.
   PROJECT-X non salva localmente i dati dei lead.
   ========================================================= */

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      error: "Method Not Allowed"
    });
  }

  const body = req.body || {};
  const email = String(body.email || "").trim().toLowerCase();
  const name = String(body.name || "").trim().slice(0, 120);
  const report = body.report && typeof body.report === "object" ? body.report : {};

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({
      success: false,
      error: "Inserisci un indirizzo email valido."
    });
  }

  const webhook = String(process.env.LEAD_WEBHOOK_URL || "").trim();

  if (!webhook) {
    console.log("PROJECT-X lead received but LEAD_WEBHOOK_URL is not configured.", {
      email,
      name,
      report
    });

    return res.status(200).json({
      success: false,
      configured: false,
      error: "Sistema lead non ancora collegato."
    });
  }

  const payload = {
    source: "PROJECT-X",
    createdAt: new Date().toISOString(),
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
