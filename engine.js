// ==========================================
// PROJECT-X — DECISION ENGINE
// VERSIONE 0.2 — SMART RANKING
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
    // 2. CONFIGURAZIONE ENGINE
    // ==========================================

    const CONFIG = {

        MAX_STACK_TOOLS: 4,

        MIN_STACK_COMPATIBILITY: 55,

        MIN_PRIMARY_COMPATIBILITY: 50,

        MIN_COMPLEMENTARY_COVERAGE: 18,

        MAX_REDUNDANCY_PENALTY: 30,

        CATEGORY_REDUNDANCY_PENALTY: 14,

        STRONG_CATEGORY_REDUNDANCY_PENALTY: 20,

        EXISTING_TOOL_MAX_BONUS: 15,

        PRESERVE_TOOL_MAX_BONUS: 15

    };


    // ==========================================
    // 3. UTILITÀ
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
            .replace(/[\u0300-\u036f]/g, "")
            .trim();

    }


    function tokenize(value) {

        return normalizeText(value)
            .replace(/[^\w\s-]/g, " ")
            .split(/\s+/)
            .filter(Boolean);

    }


    function uniqueArray(array) {

        return [
            ...new Set(
                (Array.isArray(array) ? array : [])
                    .filter(Boolean)
                    .map(value => String(value))
            )
        ];

    }


    // ==========================================
    // 4. NORMALIZZAZIONE VALORI DATABASE
    // ==========================================

    /*
     * Il motore supporta sia:
     *
     * 0–100
     *
     * sia:
     *
     * 0–10
     *
     * Questo evita problemi se il database
     * viene modificato in futuro.
     */

    function normalizeToolNeed(value) {

        const number = Number(value);

        if (Number.isNaN(number)) {
            return 0;
        }

        if (number <= 10) {
            return clamp(
                number * 10,
                0,
                100
            );
        }

        return clamp(
            number,
            0,
            100
        );

    }


    // ==========================================
    // 5. INTERPRETAZIONE OBIETTIVI
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
    // 6. INTERPRETAZIONE PROBLEMA
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
    // 7. PROFILO COMPLESSIVO
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
         * Se l'utente vuole automazioni
         * Smart o AI, aumentiamo il peso.
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
    // 8. STRUMENTI ESISTENTI
    // ==========================================

    function getExistingTools(
        existingTools
    ) {

        return normalizeText(
            existingTools
        );

    }


    function getPreservedTools(
        answers
    ) {

        const values = [];

        if (!answers) {
            return values;
        }


        const sources = [

            answers.doNotChange,

            answers.doNotReplace,

            answers.keepTools,

            answers.toolsToKeep,

            answers.existingTools

        ];


        sources.forEach(source => {

            if (Array.isArray(source)) {

                source.forEach(item => {

                    if (item) {
                        values.push(
                            normalizeText(item)
                        );
                    }

                });

            } else if (source) {

                values.push(
                    normalizeText(source)
                );

            }

        });


        return uniqueArray(
            values
        );

    }


    function toolMentionedInText(
        tool,
        text
    ) {

        const normalizedText =
            normalizeText(text);


        if (!normalizedText) {
            return false;
        }


        const name =
            normalizeText(
                tool.name
            );


        if (
            name &&
            normalizedText.includes(name)
        ) {

            return true;

        }


        const aliases = {

            "microsoft 365": [
                "microsoft",
                "office 365",
                "m365",
                "ms 365"
            ],

            "microsoft office": [
                "office",
                "microsoft"
            ],

            "google workspace": [
                "google workspace",
                "workspace",
                "g suite"
            ],

            "power automate": [
                "power automate",
                "powerautomate"
            ],

            "chatgpt": [
                "chatgpt",
                "openai"
            ],

            "woocommerce": [
                "woocommerce",
                "woo commerce"
            ],

            "monday.com": [
                "monday",
                "monday.com"
            ],

            "clickup": [
                "clickup",
                "click up"
            ],

            "pipedrive": [
                "pipedrive"
            ],

            "hubspot": [
                "hubspot"
            ],

            "make": [
                "make.com",
                "make"
            ],

            "zapier": [
                "zapier"
            ]

        };


        const toolAliases =
            aliases[name] || [];


        return toolAliases.some(
            alias =>
                normalizedText.includes(
                    normalizeText(alias)
                )
        );

    }


    // ==========================================
    // 9. BONUS STRUMENTI ESISTENTI
    // ==========================================

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


        if (
            toolMentionedInText(
                tool,
                text
            )
        ) {

            bonus += 12;

        }


        const toolName =
            normalizeText(
                tool.name
            );


        /*
         * Ecosistema Microsoft.
         */

        if (
            (
                text.includes("microsoft") ||
                text.includes("office 365") ||
                text.includes("microsoft 365") ||
                text.includes("outlook") ||
                text.includes("excel") ||
                text.includes("teams")
            ) &&
            (
                toolName.includes("power automate") ||
                toolName.includes("microsoft 365") ||
                toolName.includes("excel")
            )
        ) {

            bonus += 4;

        }


        /*
         * Strumenti che normalmente
         * si integrano bene con Microsoft.
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
                toolName.includes("zapier") ||
                toolName.includes("monday") ||
                toolName.includes("clickup") ||
                toolName.includes("notion") ||
                toolName.includes("airtable")
            )
        ) {

            bonus += 4;

        }


        /*
         * Ecosistema Google.
         */

        if (
            (
                text.includes("google workspace") ||
                text.includes("google drive") ||
                text.includes("gmail")
            ) &&
            (
                toolName.includes("google workspace") ||
                toolName.includes("make") ||
                toolName.includes("zapier") ||
                toolName.includes("airtable") ||
                toolName.includes("hubspot") ||
                toolName.includes("pipedrive")
            )
        ) {

            bonus += 3;

        }


        /*
         * Shopify.
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
            CONFIG.EXISTING_TOOL_MAX_BONUS
        );

    }


    // ==========================================
    // 10. BONUS STRUMENTI DA NON SOSTITUIRE
    // ==========================================

    function preserveExistingTools(
        tool,
        answers
    ) {

        const preserved =
            getPreservedTools(
                answers
            );


        if (
            preserved.length === 0
        ) {

            return 0;

        }


        const matched =
            preserved.some(
                item =>
                    toolMentionedInText(
                        tool,
                        item
                    )
            );


        if (!matched) {

            return 0;

        }


        return CONFIG.PRESERVE_TOOL_MAX_BONUS;

    }


    // ==========================================
    // 11. COPERTURA DEL TOOL
    // ==========================================

    function calculateCoverage(
        tool,
        profile
    ) {

        let weightedNeed = 0;
        let weightedCovered = 0;


        NEEDS.forEach(need => {

            const importance =
                Number(
                    profile[need] || 0
                );


            if (importance <= 0) {
                return;
            }


            weightedNeed +=
                importance;


            const toolValue =
                normalizeToolNeed(
                    tool.needs &&
                    tool.needs[need]
                );


            weightedCovered +=
                importance *
                (
                    toolValue / 100
                );

        });


        if (
            weightedNeed === 0
        ) {

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
    // 12. PUNTEGGIO TEAM
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


        const exactMatch =
            toolTeam.some(
                value =>
                    normalizeText(value) ===
                    selected
            );


        if (exactMatch) {
            return 100;
        }


        const partialMatch =
            toolTeam.some(
                value => {

                    const normalized =
                        normalizeText(value);

                    return (
                        normalized.includes(selected) ||
                        selected.includes(normalized)
                    );

                }
            );


        if (partialMatch) {
            return 90;
        }


        /*
         * Compatibilità ragionevole
         * ma non perfetta.
         */

        return 65;

    }


    // ==========================================
    // 13. TECNOLOGIA
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


        const normalizedValues =
            values.map(
                value =>
                    normalizeText(value)
            );


        if (
            normalizedValues.includes(
                selected
            )
        ) {

            return 100;

        }


        /*
         * Utente Base:
         * preferiamo strumenti dichiaratamente
         * semplici, ma non escludiamo quelli medi.
         */

        if (
            selected.includes("base")
        ) {

            if (
                normalizedValues.includes("medio")
            ) {

                return 70;

            }

            if (
                normalizedValues.includes("avanzato")
            ) {

                return 50;

            }

        }


        /*
         * Utente Medio:
         * quasi tutto è utilizzabile.
         */

        if (
            selected.includes("medio")
        ) {

            if (
                normalizedValues.includes("avanzato")
            ) {

                return 75;

            }

            return 90;

        }


        /*
         * Utente Avanzato.
         */

        if (
            selected.includes("avanzato")
        ) {

            return 100;

        }


        return 70;

    }


    // ==========================================
    // 14. AUTOMATION SCORE
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


        /*
         * Il database può contenere:
         *
         * 0–100
         *
         * oppure:
         *
         * "Semplice", "Smart", "AI Mode 🤖"
         */

        if (
            typeof toolAutomation === "string"
        ) {

            const normalized =
                normalizeText(
                    toolAutomation
                );


            if (
                selected.includes("ai")
            ) {

                if (
                    normalized.includes("ai")
                ) {

                    return 100;

                }

                if (
                    normalized.includes("smart")
                ) {

                    return 80;

                }

                return 55;

            }


            if (
                selected.includes("smart")
            ) {

                if (
                    normalized.includes("smart") ||
                    normalized.includes("ai")
                ) {

                    return 100;

                }

                return 65;

            }


            if (
                selected.includes("semplice")
            ) {

                if (
                    normalized.includes("semplice")
                ) {

                    return 100;

                }

                if (
                    normalized.includes("smart")
                ) {

                    return 80;

                }

                return 65;

            }


            return 70;

        }


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


        const normalizedActual =
            actual <= 10
                ? actual * 10
                : actual;


        const difference =
            Math.abs(
                desired -
                normalizedActual
            );


        return clamp(
            100 - difference,
            0,
            100
        );

    }


    // ==========================================
    // 15. COMPATIBILITÀ COMPLESSIVA
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


        const preserved =
            preserveExistingTools(
                tool,
                answers
            );


        /*
         * PESI:
         *
         * esigenze       55%
         * team           10%
         * tecnologia     10%
         * automazione    10%
         * strumenti      bonus
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
            existing +
            preserved;


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
                Math.round(
                    existing +
                    preserved
                ),

            redundancyPenalty:
                0

        };

    }


    // ==========================================
    // 16. REDONDANZA
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


        const candidateTool =
            candidate.tool || candidate;


        let penalty = 0;


        selected.forEach(item => {

            const tool =
                item.tool || item;


            /*
             * Stessa categoria:
             * probabile sovrapposizione.
             */

            if (
                tool.category &&
                candidateTool.category &&
                normalizeText(
                    tool.category
                ) ===
                normalizeText(
                    candidateTool.category
                )
            ) {

                penalty +=
                    CONFIG.CATEGORY_REDUNDANCY_PENALTY;

            }


            /*
             * Sovrapposizione funzionale.
             *
             * Contiamo quante esigenze importanti
             * vengono coperte fortemente da entrambi.
             */

            let overlappingNeeds = 0;


            NEEDS.forEach(need => {

                const first =
                    normalizeToolNeed(
                        tool.needs &&
                        tool.needs[need]
                    );


                const second =
                    normalizeToolNeed(
                        candidateTool.needs &&
                        candidateTool.needs[need]
                    );


                if (
                    first >= 70 &&
                    second >= 70
                ) {

                    overlappingNeeds++;

                }

            });


            if (
                overlappingNeeds >= 5
            ) {

                penalty +=
                    CONFIG.STRONG_CATEGORY_REDUNDANCY_PENALTY;

            } else if (
                overlappingNeeds >= 3
            ) {

                penalty += 6;

            }

        });


        return clamp(
            penalty,
            0,
            CONFIG.MAX_REDUNDANCY_PENALTY
        );

    }


    // ==========================================
    // 17. VALORE NUOVO PORTATO DAL TOOL
    // ==========================================

    function calculateNewCoverage(
        candidate,
        profile,
        covered
    ) {

        const tool =
            candidate.tool || candidate;


        let newCoverage = 0;


        NEEDS.forEach(need => {

            const importance =
                Number(
                    profile[need] || 0
                );


            if (
                importance <= 0
            ) {

                return;

            }


            const toolCoverage =
                normalizeToolNeed(
                    tool.needs &&
                    tool.needs[need]
                );


            const alreadyCovered =
                Number(
                    covered[need] || 0
                );


            /*
             * Calcoliamo solo il valore
             * che il nuovo strumento aggiunge.
             */

            const improvement =
                Math.max(
                    0,
                    toolCoverage -
                    alreadyCovered
                );


            newCoverage +=
                importance *
                (
                    improvement / 100
                );

        });


        return newCoverage;

    }


    // ==========================================
    // 18. CLASSIFICAZIONE
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
                        null,

                    newCoverage:
                        0,

                    recommendationRole:
                        "candidate"

                };

            });


        /*
         * Prima ordiniamo per compatibilità.
         */

        ranked.sort(
            (
                a,
                b
            ) => {

                if (
                    b.compatibilityScore !==
                    a.compatibilityScore
                ) {

                    return (
                        b.compatibilityScore -
                        a.compatibilityScore
                    );

                }


                return (
                    b.coverage -
                    a.coverage
                );

            }
        );


        return ranked;

    }


    // ==========================================
    // 19. COSTRUZIONE STACK INTELLIGENTE
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


        const MAX_TOOLS =
            CONFIG.MAX_STACK_TOOLS;


        /*
         * ======================================
         * FASE 1 — TOOL PRINCIPALE
         * ======================================
         */

        let primary =
            rankedTools.find(
                candidate =>
                    candidate.compatibilityScore >=
                    CONFIG.MIN_PRIMARY_COMPATIBILITY
            );


        if (!primary && rankedTools.length > 0) {
            primary = rankedTools[0];
        }


        if (primary) {

            primary.redundancyPenalty =
                0;

            primary.recommendationRole =
                "primary";


            selected.push(
                primary
            );


            NEEDS.forEach(need => {

                const value =
                    normalizeToolNeed(
                        primary.tool.needs &&
                        primary.tool.needs[need]
                    );


                if (value >= 40) {

                    covered[need] =
                        value;

                }

            });

        }


        /*
         * ======================================
         * FASE 2 — STRUMENTI COMPLEMENTARI
         * ======================================
         */

        for (
            const candidate of rankedTools
        ) {

            if (
                selected.length >=
                MAX_TOOLS
            ) {

                break;

            }


            if (
                selected.includes(candidate)
            ) {

                continue;

            }


            /*
             * Non inseriamo software troppo deboli.
             */

            if (
                candidate.compatibilityScore <
                CONFIG.MIN_STACK_COMPATIBILITY
            ) {

                continue;

            }


            const penalty =
                calculateRedundancy(
                    candidate,
                    selected
                );


            const newCoverage =
                calculateNewCoverage(
                    candidate,
                    profile,
                    covered
                );


            candidate.newCoverage =
                Math.round(
                    newCoverage
                );


            /*
             * Se è fortemente ridondante
             * e non porta nuovo valore,
             * viene scartato.
             */

            if (
                penalty >= 20 &&
                newCoverage <
                CONFIG.MIN_COMPLEMENTARY_COVERAGE
            ) {

                continue;

            }


            /*
             * Se ha stessa categoria
             * e aggiunge pochissimo,
             * non lo inseriamo.
             */

            if (
                penalty >=
                CONFIG.CATEGORY_REDUNDANCY_PENALTY &&
                newCoverage <
                CONFIG.MIN_COMPLEMENTARY_COVERAGE
            ) {

                continue;

            }


            /*
             * Il tool deve portare valore nuovo.
             */

            if (
                newCoverage <
                CONFIG.MIN_COMPLEMENTARY_COVERAGE &&
                selected.length >= 2
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


            candidate.recommendationRole =
                "complementary";


            selected.push(
                candidate
            );


            NEEDS.forEach(need => {

                const value =
                    normalizeToolNeed(
                        candidate.tool.needs &&
                        candidate.tool.needs[need]
                    );


                if (value >= 40) {

                    covered[need] =
                        Math.max(
                            covered[need],
                            value
                        );

                }

            });

        }


        /*
         * ======================================
         * FASE 3 — RIORDINO
         * ======================================
         *
         * Il principale deve rimanere primo.
         */

        if (
            selected.length > 1
        ) {

            const first =
                selected[0];

            const rest =
                selected.slice(1);


            rest.sort(
                (
                    a,
                    b
                ) => {

                    const scoreA =
                        (
                            a.compatibilityScore * 0.65
                        ) +
                        (
                            a.newCoverage * 0.35
                        );


                    const scoreB =
                        (
                            b.compatibilityScore * 0.65
                        ) +
                        (
                            b.newCoverage * 0.35
                        );


                    return scoreB - scoreA;

                }
            );


            selected.splice(
                0,
                selected.length,
                first,
                ...rest
            );

        }


        return selected;

    }


    // ==========================================
    // 20. ESIGENZE MANCANTI
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


            /*
             * Consideriamo solo esigenze
             * realmente importanti.
             */

            if (
                importance < 50
            ) {

                return;

            }


            let bestCoverage = 0;


            stack.forEach(item => {

                const tool =
                    item.tool || item;


                const value =
                    normalizeToolNeed(
                        tool.needs &&
                        tool.needs[need]
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
                        ),

                    coverage:
                        Math.round(
                            bestCoverage
                        )

                });

            }

        });


        missing.sort(
            (
                a,
                b
            ) =>
                b.importance -
                a.importance
        );


        return missing;

    }


    // ==========================================
    // 21. STIMA DEL VALORE DEL TEMPO
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

        const text =
            String(value || "");


        if (
            text.includes("100+")
        ) {

            return 100;

        }


        const match =
            text.match(
                /[\d]+/
            );


        if (!match) {
            return 0;
        }


        return Number(
            match[0]
        );

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
    // 22. IDEE DI AUTOMAZIONE
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
    // 23. BUSINESS SCORE
    // ==========================================

    /*
     * IMPORTANTE:
     *
     * Il Business Score rimane separato
     * dalla compatibilità utente.
     *
     * In questa fase non influenza il ranking
     * perché gli affiliateUrl del database
     * sono ancora vuoti.
     *
     * Lo attiveremo quando inseriremo
     * commissioni, cookie, recurring ecc.
     */

    function calculateBusinessScore(
        tool
    ) {

        if (!tool) {
            return null;
        }


        /*
         * Se in futuro il database avrà:
         *
         * tool.business
         *
         * userCompatibility
         * affiliateCommission
         * recurring
         * conversion
         * productPrice
         * cookie
         * reliability
         *
         * questa funzione potrà usarli.
         *
         * Per ora NON inventiamo dati commerciali.
         */

        return null;

    }


    // ==========================================
    // 24. ANALISI COMPLESSIVA
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


        /*
         * Business Score separato.
         */

        rankedTools.forEach(
            candidate => {

                candidate.businessScore =
                    calculateBusinessScore(
                        candidate.tool
                    );

            }
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


        /*
         * Informazioni utili anche per
         * le future versioni della UI.
         */

        const primaryTool =
            stack.length > 0
                ? stack[0].tool
                : null;


        return {

            profile,

            rankedTools,

            stack,

            primaryTool,

            missingNeeds,

            valueEstimate,

            automationIdeas:
                automation

        };

    }


    // ==========================================
    // 25. ESPOSIZIONE GLOBALE
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

        automationIdeas,

        calculateCoverage,

        calculateRedundancy

    };


    /*
     * Compatibilità con il vecchio nome.
     */

    window.StackPilotEngine =
        window.ProjectXEngine;


    console.log(
        "PROJECT-X Decision Engine v0.2 caricato correttamente."
    );


})();
