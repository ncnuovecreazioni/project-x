// ==========================================
// PROJECT-X — DECISION ENGINE
// ==========================================

(function () {

    "use strict";


    // ==========================================
    // 1. ESIGENZE
    // ==========================================

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


    const NEED_LABELS = {

        crm: "Gestione clienti",

        automation: "Automazioni",

        email: "Email",

        followup: "Follow-up",

        sales: "Vendite",

        quotes: "Preventivi",

        excel: "Excel / dati",

        marketing: "Marketing",

        projects: "Gestione progetti",

        documents: "Documenti",

        appointments: "Appuntamenti",

        ecommerce: "E-commerce",

        ai: "AI"

    };


    // ==========================================
    // 2. UTILITÀ
    // ==========================================

    function clamp(value, min, max) {

        value = Number(value);

        if (Number.isNaN(value)) {
            value = 0;
        }

        return Math.max(
            min,
            Math.min(max, value)
        );

    }


    function normalizeText(value) {

        return String(value || "")
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");

    }


    // ==========================================
    // 3. INTERPRETAZIONE OBIETTIVI
    // ==========================================

    function interpretGoals(goals) {

        const text =
            normalizeText(goals);

        const profile = {};

        NEEDS.forEach(need => {
            profile[need] = 0;
        });


        const mappings = {

            crm: [
                "clienti",
                "cliente",
                "crm",
                "contatti",
                "anagrafica"
            ],

            automation: [
                "automazione",
                "automatizzare",
                "automatico",
                "workflow",
                "processi"
            ],

            email: [
                "email",
                "mail",
                "posta",
                "newsletter"
            ],

            followup: [
                "follow",
                "ricontatto",
                "ricontattare",
                "solleciti",
                "sollecito"
            ],

            sales: [
                "vendite",
                "vendere",
                "commerciale",
                "conversioni",
                "lead"
            ],

            quotes: [
                "preventivi",
                "preventivo",
                "offerte",
                "offerta",
                "quotazioni"
            ],

            excel: [
                "excel",
                "foglio",
                "fogli",
                "dati",
                "report"
            ],

            marketing: [
                "marketing",
                "pubblicita",
                "pubblicità",
                "social",
                "campagne",
                "seo"
            ],

            projects: [
                "progetti",
                "project",
                "attivita",
                "attività",
                "task",
                "lavori"
            ],

            documents: [
                "documenti",
                "documento",
                "pdf",
                "contratti",
                "file"
            ],

            appointments: [
                "appuntamenti",
                "calendario",
                "prenotazioni",
                "booking"
            ],

            ecommerce: [
                "ecommerce",
                "e-commerce",
                "shop",
                "negozio online",
                "vendita online"
            ],

            ai: [
                "ai",
                "intelligenza artificiale",
                "chatgpt",
                "artificiale"
            ]

        };


        Object.keys(mappings).forEach(need => {

            mappings[need].forEach(keyword => {

                if (text.includes(keyword)) {

                    profile[need] =
                        Math.max(
                            profile[need],
                            70
                        );

                }

            });

        });


        return profile;

    }


    // ==========================================
    // 4. INTERPRETAZIONE PROBLEMA
    // ==========================================

    function interpretPainPoint(painPoint) {

        const text =
            normalizeText(painPoint);

        const profile = {};

        NEEDS.forEach(need => {
            profile[need] = 0;
        });


        const rules = [

            {
                keywords: [
                    "email",
                    "mail",
                    "posta"
                ],
                needs: {
                    email: 90,
                    automation: 65
                }
            },

            {
                keywords: [
                    "cliente",
                    "clienti",
                    "contatti"
                ],
                needs: {
                    crm: 90,
                    followup: 60
                }
            },

            {
                keywords: [
                    "ricontatt",
                    "follow",
                    "sollecit"
                ],
                needs: {
                    followup: 95,
                    automation: 75,
                    crm: 70
                }
            },

            {
                keywords: [
                    "preventiv",
                    "offert"
                ],
                needs: {
                    quotes: 95,
                    crm: 60,
                    sales: 65
                }
            },

            {
                keywords: [
                    "vend",
                    "lead",
                    "commercial"
                ],
                needs: {
                    sales: 90,
                    crm: 75,
                    marketing: 60
                }
            },

            {
                keywords: [
                    "excel",
                    "foglio",
                    "report",
                    "dati"
                ],
                needs: {
                    excel: 95,
                    documents: 50,
                    automation: 65
                }
            },

            {
                keywords: [
                    "progetto",
                    "progetti",
                    "task",
                    "lavori"
                ],
                needs: {
                    projects: 90,
                    automation: 55
                }
            },

            {
                keywords: [
                    "appuntament",
                    "prenotaz",
                    "calendario"
                ],
                needs: {
                    appointments: 95,
                    automation: 60
                }
            },

            {
                keywords: [
                    "marketing",
                    "social",
                    "campagn",
                    "pubblic"
                ],
                needs: {
                    marketing: 90,
                    automation: 60
                }
            },

            {
                keywords: [
                    "document",
                    "pdf",
                    "contratt",
                    "file"
                ],
                needs: {
                    documents: 85,
                    automation: 50
                }
            },

            {
                keywords: [
                    "ecommerce",
                    "e-commerce",
                    "negozio online",
                    "shop online"
                ],
                needs: {
                    ecommerce: 100,
                    sales: 60,
                    marketing: 60
                }
            },

            {
                keywords: [
                    "intelligenza artificiale",
                    "chatgpt",
                    "ai "
                ],
                needs: {
                    ai: 95,
                    automation: 70
                }
            },

            {
                keywords: [
                    "automat",
                    "ripetitiv",
                    "manual",
                    "perdo tempo",
                    "perdiamo tempo"
                ],
                needs: {
                    automation: 95
                }
            }

        ];


        rules.forEach(rule => {

            const matched =
                rule.keywords.some(
                    keyword =>
                        text.includes(keyword)
                );


            if (matched) {

                Object.keys(rule.needs)
                    .forEach(need => {

                        profile[need] =
                            Math.max(
                                profile[need],
                                rule.needs[need]
                            );

                    });

            }

        });


        return profile;

    }


    // ==========================================
    // 5. PROFILO COMPLESSIVO
    // ==========================================

    function buildNeedsProfile(
        answers,
        aiProfile
    ) {

        const goalsProfile =
            interpretGoals(
                answers.goals
            );


        const painProfile =
            interpretPainPoint(
                answers.painPoint
            );


        const profile = {};


        NEEDS.forEach(need => {

            const goalValue =
                goalsProfile[need] || 0;

            const painValue =
                painProfile[need] || 0;

            const aiValue =
                aiProfile &&
                Number(aiProfile[need])
                    ? Number(aiProfile[need])
                    : 0;


            profile[need] =
                clamp(
                    Math.max(
                        goalValue,
                        painValue,
                        aiValue
                    ),
                    0,
                    100
                );

        });


        /*
         * Se l'utente chiede automazioni,
         * aumentiamo leggermente il peso.
         */

        const automationText =
            normalizeText(
                answers.automation
            );


        if (
            automationText.includes("smart") ||
            automationText.includes("ai")
        ) {

            profile.automation =
                Math.max(
                    profile.automation,
                    75
                );

        }


        return profile;

    }


    // ==========================================
    // 6. STRUMENTI GIÀ UTILIZZATI
    // ==========================================

    function getExistingTools(
        existingTools
    ) {

        const text =
            normalizeText(
                existingTools
            );


        return text;

    }


    function existingToolBonus(
        tool,
        existingTools
    ) {

        const text =
            getExistingTools(
                existingTools
            );


        if (!text) {
            return 0;
        }


        let bonus = 0;


        const toolName =
            normalizeText(
                tool.name
            );


        /*
         * Corrispondenze dirette.
         */

        if (
            toolName &&
            text.includes(toolName)
        ) {

            bonus += 12;

        }


        /*
         * Microsoft ecosystem
         */

        if (
            (
                text.includes("microsoft") ||
                text.includes("office 365") ||
                text.includes("microsoft 365") ||
                text.includes("outlook") ||
                text.includes("excel")
            ) &&
            (
                toolName.includes("hubspot") ||
                toolName.includes("pipedrive") ||
                toolName.includes("make") ||
                toolName.includes("monday") ||
                toolName.includes("clickup")
            )
        ) {

            bonus += 4;

        }


        /*
         * Shopify
         */

        if (
            text.includes("shopify") &&
            toolName.includes("shopify")
        ) {

            bonus += 12;

        }


        return clamp(
            bonus,
            0,
            15
        );

    }


    // ==========================================
    // 7. COPERTURA DEL TOOL
    // ==========================================

    function calculateCoverage(
        tool,
        profile
    ) {

        let weightedNeed = 0;
        let weightedCovered = 0;


        NEEDS.forEach(need => {

            const importance =
                Number(profile[need] || 0);


            if (importance <= 0) {
                return;
            }


            weightedNeed += importance;


            const toolValue =
                Number(
                    tool.needs &&
                    tool.needs[need]
                    || 0
                );


            weightedCovered +=
                importance *
                (toolValue / 100);

        });


        if (weightedNeed === 0) {
            return 0;
        }


        return clamp(
            (
                weightedCovered /
                weightedNeed
            ) * 100,
            0,
            100
        );

    }


    // ==========================================
    // 8. COMPATIBILITÀ TEAM
    // ==========================================

    function teamScore(
        tool,
        answer
    ) {

        if (
            !tool.team ||
            !answer.team
        ) {

            return 70;

        }


        const selected =
            normalizeText(
                answer.team
            );


        const toolTeam =
            Array.isArray(tool.team)
                ? tool.team
                : [tool.team];


        const matches =
            toolTeam.some(
                value =>
                    normalizeText(value)
                        .includes(selected) ||
                    selected.includes(
                        normalizeText(value)
                    )
            );


        return matches
            ? 100
            : 70;

    }


    // ==========================================
    // 9. TECNOLOGIA
    // ==========================================

    function techScore(
        tool,
        answer
    ) {

        if (
            !tool.tech ||
            !answer.tech
        ) {

            return 70;

        }


        const selected =
            normalizeText(
                answer.tech
            );


        const values =
            Array.isArray(tool.tech)
                ? tool.tech
                : [tool.tech];


        const match =
            values.some(
                value =>
                    normalizeText(value)
                        .includes(selected) ||
                    selected.includes(
                        normalizeText(value)
                    )
            );


        return match
            ? 100
            : 70;

    }


    // ==========================================
    // 10. AUTOMATION SCORE
    // ==========================================

    function automationScore(
        tool,
        answer
    ) {

        if (
            !answer.automation
        ) {

            return 70;

        }


        const selected =
            normalizeText(
                answer.automation
            );


        const toolAutomation =
            tool.automation;


        if (
            toolAutomation === undefined ||
            toolAutomation === null
        ) {

            return 70;

        }


        let desired = 50;


        if (
            selected.includes("semplice")
        ) {

            desired = 35;

        }

        if (
            selected.includes("smart")
        ) {

            desired = 70;

        }

        if (
            selected.includes("ai")
        ) {

            desired = 90;

        }


        const actual =
            Number(
                toolAutomation
            );


        if (
            Number.isNaN(actual)
        ) {

            return 70;

        }


        const difference =
            Math.abs(
                desired - actual
            );


        return clamp(
            100 - difference,
            0,
            100
        );

    }


    // ==========================================
    // 11. COMPATIBILITÀ COMPLESSIVA
    // ==========================================

    function toolCompatibility(
        tool,
        profile,
        answers
    ) {

        const coverage =
            calculateCoverage(
                tool,
                profile
            );


        const team =
            teamScore(
                tool,
                answers
            );


        const tech =
            techScore(
                tool,
                answers
            );


        const automation =
            automationScore(
                tool,
                answers
            );


        const existing =
            existingToolBonus(
                tool,
                answers.existingTools
            );


        /*
         * PESI:
         *
         * esigenze       55%
         * team           10%
         * tecnologia     10%
         * automazione    10%
         * strumenti      15%
         */

        let score =
            (
                coverage * 0.55
            ) +
            (
                team * 0.10
            ) +
            (
                tech * 0.10
            ) +
            (
                automation * 0.10
            ) +
            (
                existing * 1
            );


        /*
         * existing bonus è già espresso
         * direttamente in punti.
         */


        score =
            clamp(
                score,
                0,
                100
            );


        return {

            compatibilityScore:
                Math.round(score),

            coverage:
                Math.round(coverage),

            teamScore:
                Math.round(team),

            techScore:
                Math.round(tech),

            automationScore:
                Math.round(automation),

            existingBonus:
                Math.round(existing),

            redundancyPenalty: 0

        };

    }


    // ==========================================
    // 12. RIDUZIONE RIDONDANZA
    // ==========================================

    function calculateRedundancy(
        candidate,
        selected
    ) {

        if (
            !selected ||
            selected.length === 0
        ) {

            return 0;

        }


        let penalty = 0;


        selected.forEach(item => {

            const tool =
                item.tool || item;


            if (
                tool.category &&
                candidate.category &&
                normalizeText(tool.category) ===
                normalizeText(candidate.category)
            ) {

                penalty += 12;

            }

        });


        return clamp(
            penalty,
            0,
            30
        );

    }


    // ==========================================
    // 13. CLASSIFICAZIONE
    // ==========================================

    function rankTools(
        answers,
        profile
    ) {

        const database =
            Array.isArray(
                window.SOFTWARE_DATABASE
            )
                ? window.SOFTWARE_DATABASE
                : [];


        const ranked =
            database.map(tool => {

                const scores =
                    toolCompatibility(
                        tool,
                        profile,
                        answers
                    );


                return {

                    tool,

                    ...scores,

                    businessScore:
                        null

                };

            });


        ranked.sort(
            (
                a,
                b
            ) =>
                b.compatibilityScore -
                a.compatibilityScore
        );


        return ranked;

    }


    // ==========================================
    // 14. COSTRUZIONE STACK
    // ==========================================

    function buildStack(
        rankedTools,
        profile
    ) {

        const selected = [];

        const covered = {};


        NEEDS.forEach(
            need => {
                covered[need] = 0;
            }
        );


        /*
         * Massimo 4 strumenti.
         */

        const MAX_TOOLS = 4;


        for (
            const candidate of rankedTools
        ) {

            if (
                selected.length >=
                MAX_TOOLS
            ) {

                break;

            }


            const tool =
                candidate.tool;


            const penalty =
                calculateRedundancy(
                    candidate,
                    selected
                );


            /*
             * Calcoliamo quanto nuovo valore
             * porta questo strumento.
             */

            let newCoverage = 0;


            NEEDS.forEach(need => {

                const importance =
                    Number(
                        profile[need] || 0
                    );


                const toolCoverage =
                    Number(
                        tool.needs &&
                        tool.needs[need]
                        || 0
                    );


                if (
                    importance > 0 &&
                    toolCoverage > 0 &&
                    !covered[need]
                ) {

                    newCoverage +=
                        importance *
                        (
                            toolCoverage / 100
                        );

                }

            });


            /*
             * Il primo strumento entra sempre.
             */

            if (
                selected.length === 0
            ) {

                candidate.redundancyPenalty =
                    0;

                selected.push(candidate);


                NEEDS.forEach(need => {

                    const value =
                        Number(
                            tool.needs &&
                            tool.needs[need]
                            || 0
                        );


                    if (value >= 50) {

                        covered[need] =
                            value;

                    }

                });


                continue;

            }


            /*
             * Evitiamo strumenti quasi inutili.
             */

            if (
                newCoverage < 25 &&
                penalty > 0
            ) {

                continue;

            }


            candidate.redundancyPenalty =
                penalty;


            candidate.compatibilityScore =
                clamp(
                    candidate.compatibilityScore -
                    penalty,
                    0,
                    100
                );


            selected.push(candidate);


            NEEDS.forEach(need => {

                const value =
                    Number(
                        tool.needs &&
                        tool.needs[need]
                        || 0
                    );


                if (value >= 50) {

                    covered[need] =
                        Math.max(
                            covered[need],
                            value
                        );

                }

            });

        }


        return selected;

    }


    // ==========================================
    // 15. ESIGENZE MANCANTI
    // ==========================================

    function getMissingNeeds(
        profile,
        stack
    ) {

        const missing = [];


        NEEDS.forEach(need => {

            const importance =
                Number(
                    profile[need] || 0
                );


            if (importance < 50) {
                return;
            }


            let bestCoverage = 0;


            stack.forEach(item => {

                const tool =
                    item.tool || item;


                const value =
                    Number(
                        tool.needs &&
                        tool.needs[need]
                        || 0
                    );


                bestCoverage =
                    Math.max(
                        bestCoverage,
                        value
                    );

            });


            if (
                bestCoverage < 50
            ) {

                missing.push({

                    need,

                    label:
                        NEED_LABELS[need],

                    importance:
                        Math.round(
                            importance
                        )

                });

            }

        });


        missing.sort(
            (a, b) =>
                b.importance -
                a.importance
        );


        return missing;

    }


    // ==========================================
    // 16. STIMA DEL VALORE DEL TEMPO
    // ==========================================

    function parseHours(
        value
    ) {

        const text =
            String(value || "");


        if (
            text.includes("<1")
        ) {

            return 0.5;

        }


        if (
            text.includes("1–3") ||
            text.includes("1-3")
        ) {

            return 2;

        }


        if (
            text.includes("4–7") ||
            text.includes("4-7")
        ) {

            return 5.5;

        }


        if (
            text.includes("8–15") ||
            text.includes("8-15")
        ) {

            return 11.5;

        }


        if (
            text.includes("15+")
        ) {

            return 18;

        }


        return 0;

    }


    function parseHourValue(
        value
    ) {

        const match =
            String(value || "")
                .match(
                    /[\d]+/
                );


        if (!match) {
            return 0;
        }


        const number =
            Number(
                match[0]
            );


        if (
            String(value)
                .includes("100+")
        ) {

            return 100;

        }


        return number;

    }


    function estimateValue(
        answers
    ) {

        const hours =
            parseHours(
                answers.hours
            );


        const hourValue =
            parseHourValue(
                answers.hourValue
            );


        if (
            hours <= 0 ||
            hourValue <= 0
        ) {

            return {

                weeklyHours:
                    hours,

                hourlyValue:
                    hourValue,

                monthlyHours:
                    0,

                monthlyValue:
                    0

            };

        }


        const monthlyHours =
            hours * 4.33;


        const monthlyValue =
            monthlyHours *
            hourValue;


        return {

            weeklyHours:
                hours,

            hourlyValue:
                hourValue,

            monthlyHours:
                Math.round(
                    monthlyHours * 10
                ) / 10,

            monthlyValue:
                Math.round(
                    monthlyValue
                )

        };

    }


    // ==========================================
    // 17. IDEE DI AUTOMAZIONE
    // ==========================================

    function automationIdeas(
        profile,
        answers
    ) {

        const ideas = [];


        if (
            profile.email >= 50 &&
            profile.automation >= 50
        ) {

            ideas.push({

                title:
                    "Email automatiche",

                description:
                    "Automatizzare l'invio o l'organizzazione delle email ripetitive."

            });

        }


        if (
            profile.followup >= 50
        ) {

            ideas.push({

                title:
                    "Follow-up automatici",

                description:
                    "Creare promemoria e sequenze automatiche per non dimenticare i clienti."

            });

        }


        if (
            profile.crm >= 50 &&
            profile.sales >= 50
        ) {

            ideas.push({

                title:
                    "Lead → cliente",

                description:
                    "Trasformare automaticamente un nuovo contatto in una trattativa monitorabile."

            });

        }


        if (
            profile.quotes >= 50
        ) {

            ideas.push({

                title:
                    "Gestione preventivi",

                description:
                    "Ridurre il lavoro manuale dalla richiesta del cliente fino al follow-up."

            });

        }


        if (
            profile.excel >= 50 &&
            profile.automation >= 50
        ) {

            ideas.push({

                title:
                    "Automazione Excel",

                description:
                    "Ridurre aggiornamenti manuali, copia-incolla e creazione ripetitiva di report."

            });

        }


        if (
            profile.appointments >= 50
        ) {

            ideas.push({

                title:
                    "Prenotazioni automatiche",

                description:
                    "Permettere ai clienti di prenotare senza scambi continui di email."

            });

        }


        if (
            profile.documents >= 50
        ) {

            ideas.push({

                title:
                    "Documenti automatici",

                description:
                    "Creare, archiviare o inviare automaticamente documenti e file."

            });

        }


        if (
            profile.ai >= 60
        ) {

            ideas.push({

                title:
                    "AI nei processi",

                description:
                    "Usare l'AI per classificare, riassumere o trasformare informazioni ripetitive."

            });

        }


        return ideas.slice(
            0,
            5
        );

    }


    // ==========================================
    // 18. FUNZIONE PRINCIPALE
    // ==========================================

    function analyzeAnswers(
        answers,
        aiProfile = null
    ) {

        if (!answers) {

            throw new Error(
                "Risposte mancanti."
            );

        }


        const profile =
            buildNeedsProfile(
                answers,
                aiProfile
            );


        const rankedTools =
            rankTools(
                answers,
                profile
            );


        const stack =
            buildStack(
                rankedTools,
                profile
            );


        const missingNeeds =
            getMissingNeeds(
                profile,
                stack
            );


        const valueEstimate =
            estimateValue(
                answers
            );


        const automation =
            automationIdeas(
                profile,
                answers
            );


        return {

            profile,

            rankedTools,

            stack,

            missingNeeds,

            valueEstimate,

            automationIdeas:
                automation

        };

    }


    // ==========================================
    // 19. ESPOSIZIONE GLOBALE
    // ==========================================

    window.ProjectXEngine = {

        NEEDS,

        NEED_LABELS,

        analyzeAnswers,

        interpretGoals,

        interpretPainPoint,

        buildNeedsProfile,

        rankTools,

        buildStack,

        getMissingNeeds,

        estimateValue,

        automationIdeas

    };


    /*
     * Compatibilità con il vecchio nome.
     */

    window.StackPilotEngine =
        window.ProjectXEngine;


    console.log(
        "PROJECT-X Decision Engine caricato correttamente."
    );


})();