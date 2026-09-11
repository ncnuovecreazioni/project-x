export default async function handler(req, res) {

    // ==========================================
    // PROJECT-X — AI ANALYZER
    // ==========================================

    if (req.method !== "POST") {

        return res.status(405).json({
            error: "Metodo non consentito"
        });

    }


    try {

        // ------------------------------------------
        // Controllo API KEY
        // ------------------------------------------

        const apiKey =
            process.env.OPENAI_API_KEY;


        if (!apiKey) {

            return res.status(500).json({
                error:
                    "OPENAI_API_KEY non configurata."
            });

        }


        // ------------------------------------------
        // Leggi le risposte
        // ------------------------------------------

        const answers =
            req.body;


        if (!answers) {

            return res.status(400).json({
                error:
                    "Nessuna risposta ricevuta."
            });

        }


        // ------------------------------------------
        // Prompt
        // ------------------------------------------

        const systemPrompt = `
Sei il modulo AI di PROJECT-X.

Il tuo compito è esclusivamente interpretare
le esigenze dell'utente.

NON devi consigliare software.
NON devi scegliere strumenti.
NON devi fare ranking.
NON devi parlare di affiliate.

Devi trasformare le risposte dell'utente
in un profilo strutturato di esigenze.

Valuta ogni esigenza da 0 a 100.

Le esigenze possibili sono:

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

Regole:

0 = esigenza praticamente assente
25 = esigenza bassa
50 = esigenza moderata
75 = esigenza importante
100 = esigenza fondamentale

Considera sia gli obiettivi dichiarati
sia il problema descritto dall'utente.

Non inventare esigenze non supportate
dalle risposte.

Rispondi esclusivamente con JSON valido.
`;


        // ------------------------------------------
        // Dati utente
        // ------------------------------------------

        const userPrompt = `
Analizza queste risposte dell'utente:

${JSON.stringify(
    answers,
    null,
    2
)}

Restituisci esclusivamente il profilo
numerico delle esigenze.
`;


        // ------------------------------------------
        // Chiamata OpenAI Responses API
        // ------------------------------------------

        const response =
            await fetch(
                "https://api.openai.com/v1/responses",
                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json",

                        "Authorization":
                            `Bearer ${apiKey}`

                    },

                    body: JSON.stringify({

                        model:
                            "gpt-5.6-luna",

                        reasoning: {
                            effort: "low"
                        },

                        input: [
                            {
                                role:
                                    "system",

                                content:
                                    systemPrompt
                            },
                            {
                                role:
                                    "user",

                                content:
                                    userPrompt
                            }
                        ],

                        text: {

                            format: {

                                type:
                                    "json_schema",

                                name:
                                    "project_x_needs",

                                strict:
                                    true,

                                schema: {

                                    type:
                                        "object",

                                    properties: {

                                        crm: {
                                            type:
                                                "integer",
                                            minimum:
                                                0,
                                            maximum:
                                                100
                                        },

                                        automation: {
                                            type:
                                                "integer",
                                            minimum:
                                                0,
                                            maximum:
                                                100
                                        },

                                        email: {
                                            type:
                                                "integer",
                                            minimum:
                                                0,
                                            maximum:
                                                100
                                        },

                                        followup: {
                                            type:
                                                "integer",
                                            minimum:
                                                0,
                                            maximum:
                                                100
                                        },

                                        sales: {
                                            type:
                                                "integer",
                                            minimum:
                                                0,
                                            maximum:
                                                100
                                        },

                                        quotes: {
                                            type:
                                                "integer",
                                            minimum:
                                                0,
                                            maximum:
                                                100
                                        },

                                        excel: {
                                            type:
                                                "integer",
                                            minimum:
                                                0,
                                            maximum:
                                                100
                                        },

                                        marketing: {
                                            type:
                                                "integer",
                                            minimum:
                                                0,
                                            maximum:
                                                100
                                        },

                                        projects: {
                                            type:
                                                "integer",
                                            minimum:
                                                0,
                                            maximum:
                                                100
                                        },

                                        documents: {
                                            type:
                                                "integer",
                                            minimum:
                                                0,
                                            maximum:
                                                100
                                        },

                                        appointments: {
                                            type:
                                                "integer",
                                            minimum:
                                                0,
                                            maximum:
                                                100
                                        },

                                        ecommerce: {
                                            type:
                                                "integer",
                                            minimum:
                                                0,
                                            maximum:
                                                100
                                        },

                                        ai: {
                                            type:
                                                "integer",
                                            minimum:
                                                0,
                                            maximum:
                                                100
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
                                        "ai"

                                    ],

                                    additionalProperties:
                                        false

                                }

                            }

                        }

                    })

                }
            );


        // ------------------------------------------
        // Controllo risposta OpenAI
        // ------------------------------------------

        if (!response.ok) {

            const errorText =
                await response.text();


            console.error(
                "OpenAI API error:",
                errorText
            );


            return res.status(
                response.status
            ).json({

                error:
                    "Errore nella chiamata AI.",

                details:
                    errorText

            });

        }


        const data =
            await response.json();


        // ------------------------------------------
        // Estrai output
        // ------------------------------------------

        let outputText = "";


        if (
            Array.isArray(data.output)
        ) {

            for (
                const item of data.output
            ) {

                if (
                    item.type ===
                    "message"
                ) {

                    if (
                        Array.isArray(
                            item.content
                        )
                    ) {

                        for (
                            const content
                            of item.content
                        ) {

                            if (
                                content.type ===
                                "output_text"
                            ) {

                                outputText +=
                                    content.text;

                            }

                        }

                    }

                }

            }

        }


        if (!outputText) {

            throw new Error(
                "La risposta AI è vuota."
            );

        }


        const aiProfile =
            JSON.parse(
                outputText
            );


        // ------------------------------------------
        // Risposta al frontend
        // ------------------------------------------

        return res.status(200).json({

            success:
                true,

            profile:
                aiProfile

        });


    } catch (error) {

        console.error(
            "PROJECT-X AI error:",
            error
        );


        return res.status(500).json({

            error:
                "Errore interno del modulo AI.",

            message:
                error.message

        });

    }

}
