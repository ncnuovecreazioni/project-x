/* =========================================================
   PROJECT-X — AI COACH
   ---------------------------------------------------------
   Conversazione guidata: capisce problema e contesto senza
   scegliere software. Restituisce solo risposte strutturate
   utili al Decision Engine.

   Env opzionale:
   OPENAI_API_KEY
   ========================================================= */

const NEED_LABELS = {
  crm: "clienti e CRM",
  automation: "automazioni",
  email: "email",
  followup: "follow-up",
  sales: "vendite",
  quotes: "preventivi",
  excel: "Excel e dati",
  marketing: "marketing",
  projects: "progetti",
  documents: "documenti",
  appointments: "appuntamenti",
  ecommerce: "e-commerce",
  ai: "AI"
};

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function cleanMessages(messages) {
  if (!Array.isArray(messages)) return [];
  return messages.slice(-10).map(function (m) {
    return {
      role: m && m.role === "assistant" ? "assistant" : "user",
      content: String((m && m.content) || "").slice(0, 1200)
    };
  });
}

function inferBusiness(text) {
  const s = String(text || "").toLowerCase();
  if (/e-?commerce|shopify|woocommerce|negozio online/.test(s)) return "E-commerce";
  if (/agenzia|agency/.test(s)) return "Agenzia";
  if (/ristorante|bar|pizzeria|hotel|b&b|attività locale/.test(s)) return "Ristorante / attività locale";
  if (/startup|sturtup/.test(s)) return "Startup";
  if (/azienda|impresa|dipendenti|team/.test(s)) return "Azienda";
  if (/idraul|elettric|fabbro|muratore|geometra|avvocato|commercialista|consulente|freelance|professionista/.test(s)) return "Professionista";
  return "";
}

function inferGoals(text) {
  const s = String(text || "").toLowerCase();
  const goals = [];
  const map = [
    ["Clienti", /client|lead|contatti/],
    ["Vendite", /vendit|commercial|chiudere|ordine/],
    ["Preventivi", /preventiv|quotaz|offert/],
    ["Email", /email|posta|newsletter/],
    ["Automazioni", /automat|workflow|ripetitiv/],
    ["Documenti", /document|pdf|contratt/],
    ["Excel", /excel|foglio|spreadsheet|dati/],
    ["Progetti", /progett|scaden|task|attivit/],
    ["E-commerce", /e-?commerce|shopify|woocommerce|carrell/],
    ["Marketing", /marketing|campagn|pubblicit|social/]
  ];
  map.forEach(function (item) {
    if (item[1].test(s)) goals.push(item[0]);
  });
  return goals.slice(0, 6);
}

function inferBudget(text) {
  const s = String(text || "").toLowerCase();
  if (/gratis|zero|nessun budget|0\s*€|€\s*0/.test(s)) return "€0";
  const match = s.match(/(?:€|eur|euro)?\s*(\d{1,4})/);
  if (!match) return "";
  const n = Number(match[1]);
  if (!Number.isFinite(n)) return "";
  if (n <= 30) return "€1–30";
  if (n <= 50) return "€31–50";
  if (n <= 100) return "€51–100";
  if (n <= 250) return "€101–250";
  return "€251+";
}

function deterministicReply(answers, messages) {
  const allUserText = messages.filter(function (m) { return m.role === "user"; }).map(function (m) { return m.content; }).join(" ");
  const next = Object.assign({}, answers || {});
  if (!next.businessType) next.businessType = inferBusiness(allUserText);
  if (!Array.isArray(next.goals) || !next.goals.length) next.goals = inferGoals(allUserText);
  if (!next.budget) next.budget = inferBudget(allUserText);

  if (!next.businessType) {
    return { message: "Partiamo dal contesto. Che tipo di attività hai?", done: false, answers: next, field: "businessType" };
  }
  if (!next.painPoint || String(next.painPoint).trim().length < 8) {
    return { message: "Qual è la cosa che ti fa perdere più tempo oggi? Raccontamela come la diresti a un collega.", done: false, answers: next, field: "painPoint" };
  }
  if (!next.goals.length) {
    return { message: "Qual è il risultato che vuoi ottenere prima di tutto? Per esempio: più clienti, meno lavoro manuale, preventivi più veloci, follow-up automatici.", done: false, answers: next, field: "goals" };
  }
  if (!next.budget) {
    return { message: "Quanto vuoi investire al mese? Anche 0 € va bene: mi serve solo per evitare soluzioni fuori budget.", done: false, answers: next, field: "budget" };
  }
  return {
    message: "Ho abbastanza informazioni. Ora trasformo quello che mi hai raccontato in un profilo PROJECT-X.",
    done: true,
    answers: next,
    field: "complete"
  };
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method Not Allowed" });
  }

  const body = req.body || {};
  const answers = body.answers && typeof body.answers === "object" ? body.answers : {};
  const messages = cleanMessages(body.messages);
  const apiKey = String(process.env.OPENAI_API_KEY || "").trim();

  if (!apiKey) {
    return res.status(200).json(Object.assign({ success: true, aiAvailable: false }, deterministicReply(answers, messages)));
  }

  const systemPrompt = `Sei PROJECT-X Coach. Devi capire il problema operativo dell'utente e raccogliere il minimo contesto necessario per il Decision Engine.
NON scegliere software, marchi o prodotti. NON confrontare brand. NON usare commissioni affiliate.
Fai al massimo una domanda per risposta e mantieni la conversazione breve.
Raccogli questi campi quando possibile: businessType, painPoint, goals, budget, teamSize.
businessType ammessi: Professionista, Impresa di servizi, E-commerce, Agenzia, Ristorante / attività locale, Startup, Azienda, Altro.
goals ammessi: Clienti, Vendite, Preventivi, Email, Automazioni, Documenti, Excel, Progetti, E-commerce, Marketing.
budget ammessi: €0, €1–30, €31–50, €51–100, €101–250, €251+.
Restituisci esclusivamente il JSON richiesto.`;

  const requestBody = {
    model: process.env.OPENAI_MODEL || "gpt-5.6-luna",
    reasoning: { effort: "low" },
    input: [
      { role: "system", content: [{ type: "input_text", text: systemPrompt }] },
      { role: "user", content: [{ type: "input_text", text: JSON.stringify({ answers: answers, messages: messages }, null, 2) }] }
    ],
    text: {
      format: {
        type: "json_schema",
        name: "project_x_coach_turn",
        strict: true,
        schema: {
          type: "object",
          additionalProperties: false,
          properties: {
            message: { type: "string" },
            done: { type: "boolean" },
            field: { type: "string" },
            answers: {
              type: "object",
              additionalProperties: false,
              properties: {
                businessType: { type: "string" },
                painPoint: { type: "string" },
                goals: { type: "array", items: { type: "string", enum: ["Clienti", "Vendite", "Preventivi", "Email", "Automazioni", "Documenti", "Excel", "Progetti", "E-commerce", "Marketing"] } },
                budget: { type: "string" },
                teamSize: { type: "string" }
              },
              required: ["businessType", "painPoint", "goals", "budget", "teamSize"]
            }
          },
          required: ["message", "done", "field", "answers"]
        }
      }
    },
    max_output_tokens: 650,
    store: false
  };

  try {
    const upstream = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody)
    });

    if (!upstream.ok) {
      return res.status(200).json(Object.assign({ success: true, aiAvailable: false }, deterministicReply(answers, messages)));
    }

    const data = await upstream.json();
    let outputText = typeof data.output_text === "string" ? data.output_text.trim() : "";
    if (!outputText && Array.isArray(data.output)) {
      data.output.forEach(function (item) {
        if (outputText || !item || item.type !== "message" || !Array.isArray(item.content)) return;
        item.content.forEach(function (content) {
          if (!outputText && content && typeof content.text === "string") outputText = content.text.trim();
        });
      });
    }
    if (!outputText) {
      return res.status(200).json(Object.assign({ success: true, aiAvailable: false }, deterministicReply(answers, messages)));
    }

    let result;
    try {
      result = JSON.parse(outputText);
    } catch (e) {
      return res.status(200).json(Object.assign({ success: true, aiAvailable: false }, deterministicReply(answers, messages)));
    }

    const safeAnswers = result.answers && typeof result.answers === "object" ? result.answers : {};
    safeAnswers.businessType = String(safeAnswers.businessType || "").slice(0, 80);
    safeAnswers.painPoint = String(safeAnswers.painPoint || "").slice(0, 800);
    safeAnswers.budget = String(safeAnswers.budget || "").slice(0, 20);
    safeAnswers.teamSize = String(safeAnswers.teamSize || "").slice(0, 20);
    safeAnswers.goals = Array.isArray(safeAnswers.goals) ? safeAnswers.goals.slice(0, 6) : [];

    return res.status(200).json({
      success: true,
      aiAvailable: true,
      message: String(result.message || "Continuiamo con un'altra domanda.").slice(0, 1000),
      done: !!result.done,
      field: String(result.field || "").slice(0, 40),
      answers: safeAnswers
    });
  } catch (error) {
    console.error("PROJECT-X Coach error", error);
    return res.status(200).json(Object.assign({ success: true, aiAvailable: false }, deterministicReply(answers, messages)));
  }
}
