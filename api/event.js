/* =========================================================
   PROJECT-X — EVENT TRACKING
   ---------------------------------------------------------
   Optional analytics bridge.
   Env: EVENT_WEBHOOK_URL
   If not configured, events are safely ignored.
   ========================================================= */

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method Not Allowed" });
  }

  const body = req.body || {};
  const event = String(body.event || "").trim().slice(0, 80);
  const sessionId = String(body.sessionId || "").trim().slice(0, 120);
  const meta = body.meta && typeof body.meta === "object" ? body.meta : {};
  const webhook = String(process.env.EVENT_WEBHOOK_URL || "").trim();

  if (!event) {
    return res.status(400).json({ success: false, error: "Event required" });
  }

  if (!webhook) {
    return res.status(200).json({ success: true, configured: false });
  }

  try {
    const response = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        source: "PROJECT-X",
        createdAt: new Date().toISOString(),
        event,
        sessionId,
        meta
      })
    });

    return res.status(200).json({
      success: response.ok,
      configured: true
    });
  } catch (error) {
    console.error("PROJECT-X event error", error);
    return res.status(200).json({ success: false, configured: true });
  }
}
