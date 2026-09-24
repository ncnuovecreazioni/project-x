/* =========================================================
   PROJECT-X — AI ANALYZER
   ---------------------------------------------------------
   Obiettivo:
   - interpretare il problema dell'utente
   - trasformarlo in un profilo strutturato
   - NON scegliere software
   - NON influenzare direttamente il ranking
   - funzionare come livello AI opzionale

   Endpoint:
   POST /api/analyze

   Env:
   OPENAI_API_KEY
   ========================================================= */

export default async function handler(req, res) {

  /* =======================================================
     1. METODO HTTP
     ======================================================= */

  if (req.method !== "POST") {

    return res.status(405).json({
      success: false,
      error: "Method Not Allowed"
    });

  }


  /* =======================================================
     2. API KEY
     ======================================================= */

  const apiKey =
    process.env.OPENAI_API_KEY;


  if (!apiKey) {

    console.error(
      "PROJECT-X AI: OPENAI_API_KEY mancante."
    );


    return res.status(200).json({

      success: false,

      aiAvailable: false,

      profile: null,

      error:
        "OPENAI_API_KEY non configurata."
    });

  }


  /* =======================================================
     3. RISPOSTE
     ======================================================= */

  const body =
    req.body || {};


  const answers =
    body.answers || {};


  /* =======================================================
     4. PROMPT
     ======================================================= */

  const systemPrompt = `
Sei il modulo AI di PROJECT-X.

Il tuo unico compito è INTERPRETARE le esigenze dell'utente.

NON devi:
- scegliere un marchio come vincitore;
- considerare commissioni affiliate;
- inventare prezzi;
- inventare integrazioni;
- determinare il ranking finale.

Devi fare due cose:
1. trasformare le risposte dell'utente in un profilo strutturato di bisogni;
2. costruire un BLUEPRINT DELLA SOLUZIONE, cioè spiegare quale tipo di capacità serve per risolvere il problema anche quando non riconosci un software già presente nel catalogo.

Per il blueprint indica:
- categoria della soluzione;
- risultato concreto desiderato;
- 2-6 capacità necessarie;
- una query descrittiva utile per cercare uno strumento adatto;
- 2-4 tipi di strumenti possibili, senza inventare marchi se non sei sicuro.

Non trasformare il blueprint in una classifica di marchi.

Usa esclusivamente questi bisogni:

crm
automation
email
followup
sales
quotes
excel
marketing
projects
documents
appointments
ecommerce
ai

Assegna a ogni bisogno un valore da 0 a 100.

Regole:
- 0 = non richiesto
- 20 = marginale
- 40 = interesse debole
- 60 = importante
- 80 = molto importante
- 100 = esigenza centrale

Interpreta soprattutto:
1. attività;
2. obiettivi;
3. problema descritto liberamente;
4. livello di automazione desiderato;
5. uso dell'AI;
6. attività ripetitive;
7. attività commerciali;
8. gestione clienti;
9. documenti;
10. dati/Excel;
11. appuntamenti;
12. e-commerce.

Non creare campi aggiuntivi.
Restituisci esclusivamente il JSON richiesto dallo schema.
`;


  /* =======================================================
     5. USER INPUT
     ======================================================= */

  const userInput = {

    businessType:
      answers.businessType || "",

    teamSize:
      answers.teamSize || "",

    goals:
      Array.isArray(answers.goals)
        ? answers.goals
        : [],

    painPoint:
      answers.painPoint || "",

    budget:
      answers.budget || "",

    techLevel:
      answers.techLevel || "",

    automationLevel:
      answers.automationLevel || "",

    hours:
      answers.hours || "",

    hourlyValue:
      answers.hourlyValue || "",

    existingTools:
      Array.isArray(answers.existingTools)
        ? answers.existingTools
        : [],

    doNotChange:
      Array.isArray(answers.doNotChange)
        ? answers.doNotChange
        : []

  };


  /* =======================================================
     6. REQUEST OPENAI
     ======================================================= */

  const requestBody = {

    model:
      "gpt-5.6-luna",

    reasoning: {
      effort: "low"
    },

    input: [

      {
        role: "system",

        content: [
          {
            type: "input_text",
            text: systemPrompt
          }
        ]

      },

      {
        role: "user",

        content: [
          {
            type: "input_text",

            text:
              JSON.stringify(
                userInput,
                null,
                2
              )
          }
        ]

      }

    ],

    text: {

      format: {

        type:
          "json_schema",

        name:
          "project_x_needs_profile",

        strict:
          true,

        schema: {

          type:
            "object",

          additionalProperties:
            false,

          properties: {

            crm: {
              type: "number",
              minimum: 0,
              maximum: 100
            },

            automation: {
              type: "number",
              minimum: 0,
              maximum: 100
            },

            email: {
              type: "number",
              minimum: 0,
              maximum: 100
            },

            followup: {
              type: "number",
              minimum: 0,
              maximum: 100
            },

            sales: {
              type: "number",
              minimum: 0,
              maximum: 100
            },

            quotes: {
              type: "number",
              minimum: 0,
              maximum: 100
            },

            excel: {
              type: "number",
              minimum: 0,
              maximum: 100
            },

            marketing: {
              type: "number",
              minimum: 0,
              maximum: 100
            },

            projects: {
              type: "number",
              minimum: 0,
              maximum: 100
            },

            documents: {
              type: "number",
              minimum: 0,
              maximum: 100
            },

            appointments: {
              type: "number",
              minimum: 0,
              maximum: 100
            },

            ecommerce: {
              type: "number",
              minimum: 0,
              maximum: 100
            },

            ai: {
              type: "number",
              minimum: 0,
              maximum: 100
            },

            solution: {
              type: "object",
              additionalProperties: false,
              properties: {
                category: { type: "string" },
                outcome: { type: "string" },
                capabilities: {
                  type: "array",
                  items: { type: "string" },
                  maxItems: 6
                },
                discoveryQuery: { type: "string" },
                toolTypes: {
                  type: "array",
                  items: { type: "string" },
                  maxItems: 4
                }
              },
              required: [
                "category",
                "outcome",
                "capabilities",
                "discoveryQuery",
                "toolTypes"
              ]
            }

          },

          required: [

            "crm",
            "automation",
            "email",
            "followup",
            "sales",
            "quotes",
            "excel",
            "marketing",
            "projects",
            "documents",
            "appointments",
            "ecommerce",
            "ai",
            "solution"

          ]

        }

      }

    },

    max_output_tokens:
      500,

    store:
      false

  };


  /* =======================================================
     7. CHIAMATA API
     ======================================================= */

  let response;


  try {

    response =
      await fetch(
        "https://api.openai.com/v1/responses",
        {

          method:
            "POST",

          headers: {

            "Content-Type":
              "application/json",

            "Authorization":
              `Bearer ${apiKey}`

          },

          body:
            JSON.stringify(
              requestBody
            )

        }
      );

  } catch (networkError) {

    console.error(
      "PROJECT-X AI network error:",
      networkError
    );


    return res.status(200).json({

      success: false,

      aiAvailable: false,

      profile: null,

      error:
        "Impossibile raggiungere OpenAI."

    });

  }


  /* =======================================================
     8. HEADER DIAGNOSTICI
     ======================================================= */

  const requestId =
    response.headers.get(
      "x-request-id"
    );

  const remainingRequests =
    response.headers.get(
      "x-ratelimit-remaining-requests"
    );

  const remainingTokens =
    response.headers.get(
      "x-ratelimit-remaining-tokens"
    );

  const resetRequests =
    response.headers.get(
      "x-ratelimit-reset-requests"
    );

  const resetTokens =
    response.headers.get(
      "x-ratelimit-reset-tokens"
    );


  /* =======================================================
     9. RISPOSTA NON OK
     ======================================================= */

  if (!response.ok) {

    let errorData = null;

    try {

      errorData =
        await response.json();

    } catch (error) {

      errorData = null;

    }


    console.error(
      "PROJECT-X AI OpenAI error:",
      {
        status:
          response.status,

        requestId,

        error:
          errorData,

        remainingRequests,

        remainingTokens,

        resetRequests,

        resetTokens
      }
    );


    /*
     * Il frontend riceve 200.
     *
     * In questo modo un problema dell'AI
     * NON blocca mai PROJECT-X.
     */

    let message =
      "AI non disponibile.";


    if (
      response.status === 429
    ) {

      message =
        "Limite o quota OpenAI raggiunti.";

    }

    else if (
      response.status === 401
    ) {

      message =
        "OPENAI_API_KEY non valida o non autorizzata.";

    }

    else if (
      response.status === 403
    ) {

      message =
        "Richiesta OpenAI non autorizzata.";

    }

    else if (
      response.status >= 500
    ) {

      message =
        "Servizio OpenAI temporaneamente non disponibile.";

    }


    return res.status(200).json({

      success:
        false,

      aiAvailable:
        false,

      profile:
        null,

      upstreamStatus:
        response.status,

      requestId:
        requestId || null,

      error:
        message,

      diagnostics: {

        remainingRequests:
          remainingRequests || null,

        remainingTokens:
          remainingTokens || null,

        resetRequests:
          resetRequests || null,

        resetTokens:
          resetTokens || null

      }

    });

  }


  /* =======================================================
     10. PARSING RISPOSTA
     ======================================================= */

  let data;


  try {

    data =
      await response.json();

  } catch (error) {

    console.error(
      "PROJECT-X AI invalid JSON response:",
      error
    );


    return res.status(200).json({

      success:
        false,

      aiAvailable:
        false,

      profile:
        null,

      error:
        "Risposta OpenAI non valida."

    });

  }


  /* =======================================================
     11. ESTRAZIONE OUTPUT TESTUALE
     ======================================================= */

  let outputText =
    "";


  if (
    typeof data.output_text ===
    "string"
  ) {

    outputText =
      data.output_text.trim();

  }


  /*
   * Fallback per eventuali strutture
   * di output differenti.
   */

  if (
    !outputText &&
    Array.isArray(data.output)
  ) {

    for (
      const item of data.output
    ) {

      if (
        item &&
        item.type ===
          "message" &&
        Array.isArray(
          item.content
        )
      ) {

        for (
          const content of
          item.content
        ) {

          if (
            content &&
            typeof content.text ===
              "string"
          ) {

            outputText =
              content.text.trim();

            break;

          }

        }

      }


      if (outputText) {
        break;
      }

    }

  }


  if (!outputText) {

    console.error(
      "PROJECT-X AI: output vuoto.",
      data
    );


    return res.status(200).json({

      success:
        false,

      aiAvailable:
        false,

      profile:
        null,

      error:
        "OpenAI non ha restituito un profilo."

    });

  }


  /* =======================================================
     12. PARSING JSON
     ======================================================= */

  let profile;


  try {

    profile =
      JSON.parse(
        outputText
      );

  } catch (error) {

    console.error(
      "PROJECT-X AI JSON parse error:",
      {
        outputText,
        error
      }
    );


    return res.status(200).json({

      success:
        false,

      aiAvailable:
        false,

      profile:
        null,

      error:
        "Profilo AI non interpretabile."

    });

  }


  /* =======================================================
     13. NORMALIZZAZIONE PROFILO
     ======================================================= */

  const NEEDS = [

    "crm",
    "automation",
    "email",
    "followup",
    "sales",
    "quotes",
    "excel",
    "marketing",
    "projects",
    "documents",
    "appointments",
    "ecommerce",
    "ai"

  ];


  const normalizedProfile = {};


  NEEDS.forEach(
    function (need) {

      const value =
        Number(
          profile &&
          profile[need]
        );


      normalizedProfile[need] =
        Number.isFinite(value)
          ? Math.max(
              0,
              Math.min(
                100,
                Math.round(
                  value
                )
              )
            )
          : 0;

    }
  );


  /* =======================================================
     14. RISPOSTA FINALE
     ======================================================= */

  const rawSolution =
    profile &&
    profile.solution &&
    typeof profile.solution === "object"
      ? profile.solution
      : {};

  const normalizedSolution = {
    category: String(rawSolution.category || "").slice(0, 160),
    outcome: String(rawSolution.outcome || "").slice(0, 240),
    capabilities: Array.isArray(rawSolution.capabilities)
      ? rawSolution.capabilities.map(function (x) { return String(x || "").slice(0, 140); }).filter(Boolean).slice(0, 6)
      : [],
    discoveryQuery: String(rawSolution.discoveryQuery || "").slice(0, 300),
    toolTypes: Array.isArray(rawSolution.toolTypes)
      ? rawSolution.toolTypes.map(function (x) { return String(x || "").slice(0, 120); }).filter(Boolean).slice(0, 4)
      : []
  };

  return res.status(200).json({

    success:
      true,

    aiAvailable:
      true,

    profile:
      normalizedProfile,

    solution:
      normalizedSolution,

    requestId:
      requestId || null

  });

}
