/* =========================================================
   PROJECT-X — DECISION ENGINE
   Versione 1.1.0
   ---------------------------------------------------------
   Obiettivo:
   - interpretare i bisogni dell'utente
   - applicare hard filters
   - calcolare Compatibility Score
   - separare Business Score
   - valorizzare ecosistema e integrazioni
   - evitare strumenti ridondanti
   - costruire Primary + Complementary Stack
   - spiegare il perché delle scelte
   - stimare il valore potenziale del tempo recuperabile
   - generare automazioni suggerite

   V1.1.0
   ---------------------------------------------------------
   Miglioramenti principali:
   - Primary più coerente con il bisogno dominante
   - distinzione netta tra Alternative e Complementary
   - ridondanza più intelligente
   - penalizzazione dei duplicati di categoria
   - maggiore peso alla nuova copertura nello stack
   - Stack Score separato dal Compatibility Score
   - Business Score mai utilizzato per favorire un
     software meno adatto all'utente
   - ranking più stabile
   - protezione contro stack composti da tool equivalenti
   - mantenimento compatibilità con database.js e index.html
   ========================================================= */

(function () {
  "use strict";


  /* =========================================================
     1. NEEDS
     ========================================================= */

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


  /* =========================================================
     2. CONFIGURAZIONE
     ========================================================= */

  const CONFIG = {

    VERSION: "1.1.0",

    /* Stack */
    MAX_STACK_TOOLS: 4,

    /* Soglie */
    MIN_PRIMARY_COMPATIBILITY: 50,
    MIN_STACK_COMPATIBILITY: 55,
    MIN_COMPLEMENTARY_COVERAGE: 12,

    /*
      Una componente deve aggiungere almeno questa
      quantità di copertura utile per entrare nello stack.
    */
    MIN_NEW_COVERAGE: 12,

    /*
      Evita che due software della stessa categoria
      finiscano normalmente nello stesso stack.
    */
    MAX_SAME_CATEGORY_TOOLS: 1,

    /* Ridondanza */
    MAX_REDUNDANCY_PENALTY: 30,
    CATEGORY_REDUNDANCY_PENALTY: 18,
    STRONG_CATEGORY_REDUNDANCY_PENALTY: 24,
    VERY_HIGH_OVERLAP_PENALTY: 30,

    /*
      Se due tool della stessa categoria hanno una
      sovrapposizione molto alta, vengono considerati
      alternative anziché complementari.
    */
    SAME_CATEGORY_OVERLAP_THRESHOLD: 0.55,

    /* Ecosistema */
    EXISTING_TOOL_MAX_BONUS: 15,
    PRESERVE_TOOL_MAX_BONUS: 15,
    INTEGRATION_MAX_BONUS: 10,

    /* Ranking */
    COMPATIBILITY_TIE_THRESHOLD: 3,

    /*
      Quando la differenza tra due software è piccola,
      la rilevanza specifica può aiutare a ordinare.
    */
    RELEVANCE_TIE_THRESHOLD: 5,

    /* Pesi Compatibility Score */
    WEIGHTS: {
      needs: 35,
      functionality: 15,
      budget: 15,
      integrations: 10,
      simplicity: 10,
      team: 5,
      countryLanguage: 5,
      scalability: 5
    },

    /* Business Score */
    BUSINESS_WEIGHTS: {
      commission: 25,
      recurring: 25,
      conversion: 20,
      productPrice: 10,
      attribution: 10,
      marketSize: 5,
      reliability: 5
    },

    /* Stack Score */
    STACK_WEIGHTS: {
      compatibility: 35,
      newCoverage: 40,
      integration: 10,
      existing: 5,
      categoryDiversity: 10
    },

    /* Filtri */
    ENABLE_HARD_FILTERS: true,
    ALLOW_SOFT_FALLBACK: true,

    /* Database */
    DEFAULT_NEED_SCALE: 10
  };


  /* =========================================================
     3. UTILITY
     ========================================================= */

  function clamp(value, min, max) {
    const n = Number(value);

    if (!Number.isFinite(n)) {
      return min;
    }

    return Math.max(min, Math.min(max, n));
  }


  function normalizeText(value) {
    return String(value || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\w\s€+.-]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }


  function tokenize(value) {
    return normalizeText(value)
      .split(/\s+/)
      .filter(Boolean);
  }


  function uniqueArray(array) {
    return [...new Set((array || []).filter(Boolean))];
  }


  function toArray(value) {
    if (Array.isArray(value)) {
      return value;
    }

    if (value === null || value === undefined || value === "") {
      return [];
    }

    return [value];
  }


  function firstNumber(value) {
    if (typeof value === "number") {
      return Number.isFinite(value) ? value : null;
    }

    const match = String(value || "")
      .replace(",", ".")
      .match(/-?\d+(?:\.\d+)?/);

    return match ? Number(match[0]) : null;
  }


  function normalizeScore(value, fallback = 0) {
    const n = Number(value);

    if (!Number.isFinite(n)) {
      return fallback;
    }

    return clamp(n, 0, 100);
  }


  function getToolCategory(tool) {
    return normalizeText(
      tool &&
      tool.category
        ? tool.category
        : ""
    );
  }


  function getToolId(tool) {
    return String(
      tool &&
      (
        tool.id ||
        tool.name ||
        ""
      )
    ).trim();
  }


  /* =========================================================
     4. NORMALIZZAZIONE DATABASE
     ========================================================= */

  function normalizeToolNeed(value) {

    if (value === null || value === undefined || value === "") {
      return 0;
    }

    const n = Number(value);

    if (!Number.isFinite(n)) {
      return 0;
    }

    /*
      Il database attuale può usare:
      0–10
      oppure
      0–100
    */

    if (n >= 0 && n <= 10) {
      return clamp(n * 10, 0, 100);
    }

    return clamp(n, 0, 100);
  }


  function normalizeTool(tool) {

    if (!tool) {
      return null;
    }

    const normalized = {
      ...tool,

      id: String(tool.id || tool.name || "").trim(),

      name: String(tool.name || tool.id || "Strumento").trim(),

      category: String(tool.category || "").trim(),

      description: String(tool.description || "").trim(),

      pricingUrl: tool.pricingUrl || "",

      affiliateUrl: tool.affiliateUrl || "",

      needs: {},

      team: toArray(tool.team),

      tech: toArray(tool.tech),

      automation: toArray(tool.automation),

      integrations: toArray(tool.integrations),

      countries: toArray(tool.countries || tool.country),

      languages: toArray(tool.languages || tool.language)
    };

    NEEDS.forEach(function (need) {
      normalized.needs[need] = normalizeToolNeed(
        tool.needs ? tool.needs[need] : 0
      );
    });

    return normalized;
  }


  function getDatabase() {

    if (
      typeof window !== "undefined" &&
      Array.isArray(window.SOFTWARE_DATABASE)
    ) {
      return window.SOFTWARE_DATABASE
        .map(normalizeTool)
        .filter(Boolean);
    }

    if (
      typeof SOFTWARE_DATABASE !== "undefined" &&
      Array.isArray(SOFTWARE_DATABASE)
    ) {
      return SOFTWARE_DATABASE
        .map(normalizeTool)
        .filter(Boolean);
    }

    return [];
  }


  /* =========================================================
     5. INTERPRETAZIONE OBIETTIVI
     ========================================================= */

  const GOAL_KEYWORDS = {

    crm: [
      "crm",
      "clienti",
      "cliente",
      "anagrafica",
      "gestione clienti",
      "contatti",
      "customer"
    ],

    automation: [
      "automazione",
      "automazioni",
      "automatizzare",
      "automatico",
      "workflow",
      "flusso",
      "processo automatico"
    ],

    email: [
      "email",
      "mail",
      "newsletter",
      "posta",
      "messaggi email"
    ],

    followup: [
      "follow up",
      "followup",
      "ricontattare",
      "ricontatto",
      "promemoria",
      "solleciti",
      "sollecito",
      "non dimenticare clienti"
    ],

    sales: [
      "vendite",
      "vendere",
      "vendita",
      "lead",
      "leads",
      "commerciale",
      "conversioni",
      "acquisizione clienti"
    ],

    quotes: [
      "preventivo",
      "preventivi",
      "offerta",
      "offerte",
      "quotazione",
      "quotation"
    ],

    excel: [
      "excel",
      "foglio",
      "fogli",
      "spreadsheet",
      "dati",
      "tabelle",
      "report",
      "csv"
    ],

    marketing: [
      "marketing",
      "pubblicita",
      "pubblicità",
      "social",
      "campagne",
      "ads",
      "seo",
      "contenuti",
      "acquisizione"
    ],

    projects: [
      "progetto",
      "progetti",
      "project management",
      "attivita",
      "attività",
      "task",
      "lavori",
      "team"
    ],

    documents: [
      "documenti",
      "documento",
      "pdf",
      "contratti",
      "file",
      "archiviazione",
      "documentale"
    ],

    appointments: [
      "appuntamenti",
      "prenotazioni",
      "calendario",
      "agenda",
      "booking",
      "riunioni",
      "meeting"
    ],

    ecommerce: [
      "ecommerce",
      "e commerce",
      "negozio online",
      "shop online",
      "prodotti online",
      "vendere online"
    ],

    ai: [
      "ai",
      "intelligenza artificiale",
      "chatgpt",
      "claude",
      "artificiale",
      "generazione",
      "generare contenuti"
    ]
  };


  function interpretGoals(goals) {

    const result = {};

    NEEDS.forEach(function (need) {
      result[need] = 0;
    });

    const text = normalizeText(
      Array.isArray(goals)
        ? goals.join(" ")
        : goals
    );

    Object.keys(GOAL_KEYWORDS).forEach(function (need) {

      const keywords = GOAL_KEYWORDS[need];

      keywords.forEach(function (keyword) {

        if (text.includes(normalizeText(keyword))) {
          result[need] = Math.max(result[need], 80);
        }

      });

    });

    return result;
  }


  /* =========================================================
     6. INTERPRETAZIONE PAIN POINT
     ========================================================= */

  function interpretPainPoint(painPoint) {

    const text = normalizeText(painPoint);

    const result = {};

    NEEDS.forEach(function (need) {
      result[need] = 0;
    });

    function boost(need, value) {
      result[need] = Math.max(result[need], value);
    }


    if (
      /email|mail|posta|messaggi/.test(text)
    ) {
      boost("email", 85);
      boost("automation", 60);
    }


    if (
      /cliente|clienti|contatt|anagrafic|crm/.test(text)
    ) {
      boost("crm", 90);
    }


    if (
      /ricontatt|follow.?up|sollecit|promemoria|dimentic/.test(text)
    ) {
      boost("followup", 95);
      boost("automation", 70);
      boost("crm", 55);
    }


    if (
      /preventiv|offert|quotazion/.test(text)
    ) {
      boost("quotes", 95);
      boost("documents", 55);
      boost("automation", 55);
    }


    if (
      /vend|lead|commercial|acquisire clienti|nuovi clienti|conversion/.test(text)
    ) {
      boost("sales", 90);
      boost("crm", 65);
      boost("marketing", 60);
    }


    if (
      /excel|foglio|spreadsheet|tabell|dati|report|csv/.test(text)
    ) {
      boost("excel", 95);
      boost("automation", 65);
    }


    if (
      /progett|task|attivit|lavori|organizz|team/.test(text)
    ) {
      boost("projects", 80);
    }


    if (
      /appuntament|prenotaz|agenda|calendario|booking|meeting/.test(text)
    ) {
      boost("appointments", 90);
    }


    if (
      /marketing|social|pubblic|campagn|seo|ads|contenuti/.test(text)
    ) {
      boost("marketing", 90);
    }


    if (
      /document|pdf|contratt|file|archivi/.test(text)
    ) {
      boost("documents", 85);
    }


    if (
      /ecommerce|negozio online|shop online|prodotti online/.test(text)
    ) {
      boost("ecommerce", 95);
    }


    if (
      /\bai\b|intelligenza artificiale|chatgpt|claude|automatizzare con ai/.test(text)
    ) {
      boost("ai", 95);
      boost("automation", 75);
    }


    if (
      /manuale|ripetitiv|ripeto|perdo tempo|perdiamo tempo|faccio sempre/.test(text)
    ) {
      boost("automation", 90);
    }


    return result;
  }


  /* =========================================================
     7. PROFILO BISOGNI
     ========================================================= */

  function buildNeedsProfile(answers, aiProfile) {

    answers = answers || {};

    const goalsProfile = interpretGoals(
      answers.goals || answers.obiettivi || []
    );

    const painProfile = interpretPainPoint(
      answers.painPoint ||
      answers.biggestTimeWaster ||
      answers.problem ||
      answers.timeWaster ||
      ""
    );


    const profile = {};

    NEEDS.forEach(function (need) {

      const fromGoals = Number(goalsProfile[need] || 0);
      const fromPain = Number(painProfile[need] || 0);
      const fromAI = Number(
        aiProfile && aiProfile[need]
          ? aiProfile[need]
          : 0
      );

      profile[need] = Math.max(
        fromGoals,
        fromPain,
        fromAI
      );

    });


    const automationMode = normalizeText(
      answers.automation ||
      answers.automationLevel ||
      ""
    );


    if (
      automationMode.includes("smart")
    ) {
      profile.automation = Math.max(
        profile.automation,
        75
      );
    }


    if (
      automationMode.includes("ai")
    ) {
      profile.automation = Math.max(
        profile.automation,
        90
      );

      profile.ai = Math.max(
        profile.ai,
        80
      );
    }


    return profile;
  }


  /* =========================================================
     8. TOOL MATCHING / ALIAS
     ========================================================= */

  const TOOL_ALIASES = {

    "microsoft 365": [
      "microsoft 365",
      "office 365",
      "m365",
      "office"
    ],

    "outlook": [
      "outlook",
      "microsoft outlook"
    ],

    "power automate": [
      "power automate",
      "microsoft power automate"
    ],

    "google workspace": [
      "google workspace",
      "g suite",
      "gsuite"
    ],

    "chatgpt": [
      "chatgpt",
      "openai"
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

    "salesforce": [
      "salesforce"
    ],

    "freshsales": [
      "freshsales",
      "freshworks crm"
    ],

    "zoho crm": [
      "zoho crm",
      "zoho"
    ],

    "activecampaign": [
      "activecampaign"
    ],

    "close": [
      "close",
      "close crm"
    ],

    "klaviyo": [
      "klaviyo"
    ],

    "make": [
      "make",
      "make.com",
      "integromat"
    ],

    "zapier": [
      "zapier"
    ],

    "shopify": [
      "shopify"
    ],

    "woocommerce": [
      "woocommerce",
      "woo commerce"
    ]
  };


  function toolMentionedInText(toolName, text) {

    const normalizedTool = normalizeText(toolName);
    const normalizedText = normalizeText(text);

    if (
      normalizedText.includes(normalizedTool)
    ) {
      return true;
    }


    const aliases = TOOL_ALIASES[
      normalizedTool
    ] || [];


    return aliases.some(function (alias) {
      return normalizedText.includes(
        normalizeText(alias)
      );
    });
  }


  function getExistingTools(answers) {

    answers = answers || {};

    const value =
      answers.existingTools ||
      answers.currentTools ||
      answers.toolsAlreadyUse ||
      answers.software ||
      "";


    return uniqueArray(
      toArray(value)
        .flatMap(function (item) {
          return String(item)
            .split(",")
            .map(function (x) {
              return x.trim();
            });
        })
        .filter(Boolean)
    );
  }


  function getPreservedTools(answers) {

    answers = answers || {};

    const value =
      answers.doNotChange ||
      answers.doNotReplace ||
      answers.toolsToKeep ||
      answers.preserveTools ||
      "";


    return uniqueArray(
      toArray(value)
        .flatMap(function (item) {
          return String(item)
            .split(",")
            .map(function (x) {
              return x.trim();
            });
        })
        .filter(Boolean)
    );
  }


  function getExcludedTools(answers) {

    answers = answers || {};

    const value =
      answers.excludedTools ||
      answers.notInterested ||
      answers.avoid ||
      answers.toolsToAvoid ||
      "";


    return uniqueArray(
      toArray(value)
        .flatMap(function (item) {
          return String(item)
            .split(",")
            .map(function (x) {
              return x.trim();
            });
        })
        .filter(Boolean)
    );
  }


  /* =========================================================
     9. EXISTING / PRESERVED BONUS
     ========================================================= */

  function existingToolBonus(tool, answers) {

    const existingTools = getExistingTools(answers);

    if (!existingTools.length) {
      return 0;
    }


    const text = existingTools.join(" ");

    if (
      toolMentionedInText(tool.name, text)
    ) {
      return CONFIG.EXISTING_TOOL_MAX_BONUS;
    }


    const normalizedTool = normalizeText(tool.name);

    const microsoftTools = [
      "power automate",
      "microsoft 365",
      "outlook"
    ];

    const googleTools = [
      "google workspace"
    ];

    const shopifyTools = [
      "shopify"
    ];


    if (
      microsoftTools.includes(normalizedTool) &&
      /microsoft 365|office 365|outlook|office/.test(
        normalizeText(text)
      )
    ) {
      return 10;
    }


    if (
      googleTools.includes(normalizedTool) &&
      /google workspace|g suite|gsuite/.test(
        normalizeText(text)
      )
    ) {
      return 10;
    }


    if (
      shopifyTools.includes(normalizedTool) &&
      /shopify/.test(
        normalizeText(text)
      )
    ) {
      return 10;
    }


    return 0;
  }


  function preserveExistingTools(tool, answers) {

    const preserved = getPreservedTools(answers);

    if (!preserved.length) {
      return 0;
    }


    const text = preserved.join(" ");

    if (
      toolMentionedInText(tool.name, text)
    ) {
      return CONFIG.PRESERVE_TOOL_MAX_BONUS;
    }


    return 0;
  }


  /* =========================================================
     10. COVERAGE
     ========================================================= */

  function calculateCoverage(tool, needsProfile) {

    const coverage = {};

    NEEDS.forEach(function (need) {

      const requirement = Number(
        needsProfile && needsProfile[need]
          ? needsProfile[need]
          : 0
      );

      const capability = Number(
        tool &&
        tool.needs &&
        tool.needs[need]
          ? tool.needs[need]
          : 0
      );


      if (requirement <= 0) {
        coverage[need] = 0;
        return;
      }


      coverage[need] = clamp(
        Math.min(
          requirement,
          capability
        ),
        0,
        100
      );
    });


    return coverage;
  }


  function calculateWeightedNeedsCoverage(tool, needsProfile) {

    let totalWeight = 0;
    let totalScore = 0;

    NEEDS.forEach(function (need) {

      const requirement = Number(
        needsProfile[need] || 0
      );

      if (requirement <= 0) {
        return;
      }

      const capability = Number(
        tool.needs[need] || 0
      );

      const normalizedRequirement = clamp(
        requirement,
        0,
        100
      );

      const fit = clamp(
        capability /
        Math.max(
          normalizedRequirement,
          1
        ),
        0,
        1
      );

      totalWeight += normalizedRequirement;

      totalScore +=
        normalizedRequirement * fit;
    });


    if (!totalWeight) {
      return 50;
    }


    return clamp(
      (totalScore / totalWeight) * 100,
      0,
      100
    );
  }


  /* =========================================================
     11. TEAM SCORE
     ========================================================= */

  function normalizeAnswerTeam(team) {

    const text = normalizeText(team);

    if (
      text.includes("solo")
    ) {
      return "Solo io";
    }

    if (
      text.includes("2") &&
      text.includes("5")
    ) {
      return "2–5";
    }

    if (
      text.includes("6") &&
      text.includes("20")
    ) {
      return "6–20";
    }

    if (
      text.includes("21") &&
      text.includes("50")
    ) {
      return "21–50";
    }

    if (
      text.includes("50")
    ) {
      return "50+";
    }

    return team || "";
  }


  function teamScore(tool, team) {

    if (!team) {
      return 75;
    }


    const wanted = normalizeText(
      normalizeAnswerTeam(team)
    );


    const available = tool.team.map(function (x) {
      return normalizeText(x);
    });


    if (!available.length) {
      return 75;
    }


    if (
      available.some(function (x) {
        return x === wanted;
      })
    ) {
      return 100;
    }


    if (
      wanted.includes("solo")
    ) {
      if (
        available.some(function (x) {
          return x.includes("solo") ||
            x.includes("2") ||
            x.includes("5");
        })
      ) {
        return 90;
      }
    }


    if (
      wanted.includes("2") ||
      wanted.includes("5")
    ) {
      if (
        available.some(function (x) {
          return x.includes("solo") ||
            x.includes("2") ||
            x.includes("5") ||
            x.includes("20");
        })
      ) {
        return 90;
      }
    }


    return 65;
  }


  /* =========================================================
     12. TECH SCORE
     ========================================================= */

  function techScore(tool, tech) {

    if (!tech) {
      return 75;
    }


    const wanted = normalizeText(tech);

    const available = tool.tech.map(function (x) {
      return normalizeText(x);
    });


    if (!available.length) {
      return 75;
    }


    if (
      available.some(function (x) {
        return x === wanted;
      })
    ) {
      return 100;
    }


    if (
      wanted.includes("base")
    ) {
      if (
        available.some(function (x) {
          return x.includes("base");
        })
      ) {
        return 100;
      }

      if (
        available.some(function (x) {
          return x.includes("medio");
        })
      ) {
        return 70;
      }

      return 50;
    }


    if (
      wanted.includes("medio")
    ) {
      if (
        available.some(function (x) {
          return x.includes("medio");
        })
      ) {
        return 100;
      }

      if (
        available.some(function (x) {
          return x.includes("avanz");
        })
      ) {
        return 75;
      }

      return 90;
    }


    if (
      wanted.includes("avanz")
    ) {
      return 100;
    }


    return 70;
  }


  /* =========================================================
     13. AUTOMATION SCORE
     ========================================================= */

  function automationScore(tool, automationLevel) {

    if (!automationLevel) {
      return 75;
    }


    const wanted = normalizeText(
      automationLevel
    );


    const values = tool.automation
      .map(function (value) {

        if (typeof value === "number") {
          return value;
        }

        const text = normalizeText(value);

        if (text.includes("ai")) {
          return 90;
        }

        if (text.includes("smart")) {
          return 75;
        }

        if (text.includes("semplic")) {
          return 55;
        }

        return 70;
      });


    if (!values.length) {
      return 75;
    }


    if (
      wanted.includes("ai")
    ) {
      return Math.max.apply(null, values);
    }


    if (
      wanted.includes("smart")
    ) {
      return Math.min(
        100,
        Math.max.apply(null, values) + 5
      );
    }


    if (
      wanted.includes("semplic")
    ) {
      return 80;
    }


    return 75;
  }


  /* =========================================================
     14. BUDGET
     ========================================================= */

  function parseBudgetNumber(value) {

    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      return null;
    }


    const text = normalizeText(value);


    if (
      text.includes("500+")
    ) {
      return 500;
    }


    const n = firstNumber(value);

    return Number.isFinite(n)
      ? n
      : null;
  }


  function getBudgetLimit(answers) {

    return parseBudgetNumber(
      answers &&
      (
        answers.budget ||
        answers.monthlyBudget ||
        answers.maxBudget
      )
    );
  }


  function getToolMonthlyPrice(tool) {

    const candidates = [
      tool.monthlyPrice,
      tool.priceMonthly,
      tool.price,
      tool.minMonthlyPrice,
      tool.startingPrice
    ];


    for (let i = 0; i < candidates.length; i++) {

      const n = firstNumber(
        candidates[i]
      );

      if (
        Number.isFinite(n)
      ) {
        return n;
      }
    }


    return null;
  }


  function toolHasFreePlan(tool) {

    if (
      tool.freePlan === true ||
      tool.hasFreePlan === true
    ) {
      return true;
    }


    const text = normalizeText(
      tool.pricing ||
      tool.pricingModel ||
      tool.description ||
      ""
    );


    return (
      text.includes("free plan") ||
      text.includes("piano gratuito") ||
      text.includes("gratuito") ||
      text.includes("free")
    );
  }


  function budgetScore(tool, answers) {

    const budget = getBudgetLimit(answers);

    if (budget === null) {
      return 75;
    }


    const price = getToolMonthlyPrice(tool);


    if (price === null) {

      if (budget <= 30 && toolHasFreePlan(tool)) {
        return 90;
      }

      return 75;
    }


    if (price <= budget) {
      return 100;
    }


    if (
      budget > 0 &&
      price <= budget * 1.20
    ) {
      return 75;
    }


    if (
      budget > 0 &&
      price <= budget * 1.50
    ) {
      return 50;
    }


    return 20;
  }


  /* =========================================================
     15. HARD BUDGET FILTER
     ========================================================= */

  function passesBudgetFilter(tool, answers) {

    const budget = getBudgetLimit(answers);

    if (budget === null) {
      return true;
    }


    const price = getToolMonthlyPrice(tool);


    if (price === null) {
      return true;
    }


    if (price <= budget) {
      return true;
    }


    if (
      budget <= 30 &&
      toolHasFreePlan(tool)
    ) {
      return true;
    }


    return price <= budget * 1.20;
  }


  /* =========================================================
     16. COUNTRY / LANGUAGE
     ========================================================= */

  function getUserCountry(answers) {

    return String(
      answers &&
      (
        answers.country ||
        answers.nation ||
        answers.countryCode ||
        ""
      )
    ).trim();
  }


  function getUserLanguage(answers) {

    return String(
      answers &&
      (
        answers.language ||
        answers.languages ||
        ""
      )
    ).trim();
  }


  function countryLanguageScore(tool, answers) {

    const country = normalizeText(
      getUserCountry(answers)
    );

    const language = normalizeText(
      getUserLanguage(answers)
    );


    if (
      !country &&
      !language
    ) {
      return 75;
    }


    let score = 75;

    const toolCountries = tool.countries
      .map(normalizeText);

    const toolLanguages = tool.languages
      .map(normalizeText);


    if (
      country &&
      toolCountries.length
    ) {

      if (
        toolCountries.includes(country) ||
        toolCountries.includes("all") ||
        toolCountries.includes("worldwide")
      ) {
        score += 15;
      } else {
        score -= 30;
      }
    }


    if (
      language &&
      toolLanguages.length
    ) {

      if (
        toolLanguages.includes(language) ||
        toolLanguages.includes("all")
      ) {
        score += 10;
      } else {
        score -= 15;
      }
    }


    return clamp(score, 0, 100);
  }


  function passesCountryLanguageFilter(tool, answers) {

    const country = normalizeText(
      getUserCountry(answers)
    );

    const language = normalizeText(
      getUserLanguage(answers)
    );


    if (
      !country &&
      !language
    ) {
      return true;
    }


    if (
      country &&
      tool.countries.length
    ) {

      const supported = tool.countries
        .map(normalizeText);


      const countryOK =
        supported.includes(country) ||
        supported.includes("all") ||
        supported.includes("worldwide");


      if (!countryOK) {
        return false;
      }
    }


    if (
      language &&
      tool.languages.length
    ) {

      const supported = tool.languages
        .map(normalizeText);


      const languageOK =
        supported.includes(language) ||
        supported.includes("all");


      if (!languageOK) {
        return false;
      }
    }


    return true;
  }


  /* =========================================================
     17. INTEGRAZIONI / ECOSISTEMA
     ========================================================= */

  function integrationMatchScore(tool, answers) {

    const existingTools = getExistingTools(answers);

    if (!existingTools.length) {
      return 50;
    }


    const existingText = existingTools.join(" ");

    const integrations = tool.integrations
      .map(normalizeText);


    if (!integrations.length) {
      return 50;
    }


    let matches = 0;


    integrations.forEach(function (integration) {

      const integrationText = normalizeText(
        integration
      );


      if (
        existingText.includes(integrationText)
      ) {
        matches++;
        return;
      }


      Object.keys(TOOL_ALIASES).forEach(function (key) {

        const aliases = TOOL_ALIASES[key];

        if (
          aliases.some(function (alias) {
            return (
              integrationText.includes(
                normalizeText(alias)
              ) &&
              existingText.includes(
                normalizeText(alias)
              )
            );
          })
        ) {
          matches++;
        }

      });

    });


    if (!matches) {
      return 50;
    }


    return clamp(
      60 + matches * 15,
      0,
      100
    );
  }


  function calculateIntegrationBonus(tool, answers) {

    const score = integrationMatchScore(
      tool,
      answers
    );


    if (score <= 50) {
      return 0;
    }


    return clamp(
      ((score - 50) / 50) *
      CONFIG.INTEGRATION_MAX_BONUS,
      0,
      CONFIG.INTEGRATION_MAX_BONUS
    );
  }


  /* =========================================================
     18. SEMPLICITÀ
     ========================================================= */

  function simplicityScore(tool, answers) {

    const tech = normalizeText(
      answers &&
      (
        answers.tech ||
        answers.technicalLevel ||
        ""
      )
    );


    const automation = normalizeText(
      answers &&
      (
        answers.automation ||
        answers.automationLevel ||
        ""
      )
    );


    if (
      tool.simplicity !== undefined
    ) {

      const value = Number(
        tool.simplicity
      );

      if (
        Number.isFinite(value)
      ) {
        return clamp(
          value <= 10
            ? value * 10
            : value,
          0,
          100
        );
      }
    }


    let score = 75;


    if (
      tech.includes("base")
    ) {
      score = 80;
    }


    if (
      tech.includes("avanz")
    ) {
      score = 90;
    }


    if (
      automation.includes("ai")
    ) {
      score = Math.max(
        score,
        80
      );
    }


    return score;
  }


  /* =========================================================
     19. SCALABILITÀ
     ========================================================= */

  function scalabilityScore(tool, answers) {

    if (
      tool.scalability !== undefined
    ) {

      const value = Number(
        tool.scalability
      );

      if (
        Number.isFinite(value)
      ) {
        return clamp(
          value <= 10
            ? value * 10
            : value,
          0,
          100
        );
      }
    }


    const team = normalizeText(
      answers &&
      (
        answers.team ||
        answers.teamSize ||
        ""
      )
    );


    let score = 75;


    if (
      team.includes("50")
    ) {
      score = 90;
    }


    if (
      team.includes("solo")
    ) {
      score = 70;
    }


    return score;
  }


  /* =========================================================
     20. FUNCTIONALITY
     ========================================================= */

  function functionalityScore(tool, needsProfile) {

    const weighted =
      calculateWeightedNeedsCoverage(
        tool,
        needsProfile
      );


    const activeNeeds = NEEDS.filter(
      function (need) {
        return Number(
          needsProfile[need] || 0
        ) >= 40;
      }
    );


    if (!activeNeeds.length) {
      return 60;
    }


    let strongMatches = 0;


    activeNeeds.forEach(function (need) {

      if (
        Number(tool.needs[need] || 0) >=
        Number(needsProfile[need] || 0)
      ) {
        strongMatches++;
      }

    });


    const bonus =
      (strongMatches /
        activeNeeds.length) *
      15;


    return clamp(
      weighted * 0.85 + bonus,
      0,
      100
    );
  }


  /* =========================================================
     21. HARD FILTERS
     ========================================================= */

  function isExcluded(tool, answers) {

    const excluded =
      getExcludedTools(answers);


    if (!excluded.length) {
      return false;
    }


    const text = excluded.join(" ");

    return toolMentionedInText(
      tool.name,
      text
    );
  }


  function passesHardFilters(tool, answers, needsProfile) {

    if (!CONFIG.ENABLE_HARD_FILTERS) {
      return {
        passed: true,
        reasons: []
      };
    }


    const reasons = [];


    if (
      isExcluded(tool, answers)
    ) {
      reasons.push(
        "Escluso esplicitamente dall'utente."
      );
    }


    if (
      !passesBudgetFilter(tool, answers)
    ) {
      reasons.push(
        "Fuori dal budget indicato."
      );
    }


    if (
      !passesCountryLanguageFilter(tool, answers)
    ) {
      reasons.push(
        "Non rispetta i requisiti di paese o lingua."
      );
    }


    const relevance =
      calculateWeightedNeedsCoverage(
        tool,
        needsProfile
      );


    if (
      relevance < 12 &&
      needsProfile &&
      Object.values(needsProfile)
        .some(function (x) {
          return Number(x) >= 50;
        })
    ) {
      reasons.push(
        "Rilevanza troppo bassa rispetto ai bisogni."
      );
    }


    return {
      passed: reasons.length === 0,
      reasons: reasons
    };
  }


  /* =========================================================
     22. COMPATIBILITY SCORE
     ========================================================= */

  function toolCompatibility(tool, answers, needsProfile) {

    const coverageScore =
      calculateWeightedNeedsCoverage(
        tool,
        needsProfile
      );

    const functionality =
      functionalityScore(
        tool,
        needsProfile
      );

    const budget =
      budgetScore(
        tool,
        answers
      );

    const integrations =
      integrationMatchScore(
        tool,
        answers
      );

    const simplicity =
      simplicityScore(
        tool,
        answers
      );

    const team =
      teamScore(
        tool,
        answers.team ||
        answers.teamSize
      );

    const countryLanguage =
      countryLanguageScore(
        tool,
        answers
      );

    const scalability =
      scalabilityScore(
        tool,
        answers
      );

    const automation =
      automationScore(
        tool,
        answers.automation ||
        answers.automationLevel
      );


    const weights = CONFIG.WEIGHTS;


    let score =
      coverageScore *
      (
        weights.needs / 100
      )

      +

      functionality *
      (
        weights.functionality / 100
      )

      +

      budget *
      (
        weights.budget / 100
      )

      +

      integrations *
      (
        weights.integrations / 100
      )

      +

      simplicity *
      (
        weights.simplicity / 100
      )

      +

      team *
      (
        weights.team / 100
      )

      +

      countryLanguage *
      (
        weights.countryLanguage / 100
      )

      +

      scalability *
      (
        weights.scalability / 100
      );


    score =
      score * 0.90 +
      automation * 0.10;


    /*
      Bonus ecosistema.
    */

    const existingBonus =
      existingToolBonus(
        tool,
        answers
      );

    const preserveBonus =
      preserveExistingTools(
        tool,
        answers
      );

    const integrationBonus =
      calculateIntegrationBonus(
        tool,
        answers
      );


    score +=
      Math.min(
        CONFIG.EXISTING_TOOL_MAX_BONUS,
        existingBonus
      );


    score +=
      Math.min(
        CONFIG.PRESERVE_TOOL_MAX_BONUS,
        preserveBonus
      );


    score += integrationBonus;


    score = clamp(
      score,
      0,
      100
    );


    return {

      compatibility:
        Math.round(score * 10) / 10,

      baseCompatibility:
        Math.round(score * 10) / 10,

      factors: {
        needs: Math.round(coverageScore),
        functionality: Math.round(functionality),
        budget: Math.round(budget),
        integrations: Math.round(integrations),
        simplicity: Math.round(simplicity),
        team: Math.round(team),
        countryLanguage:
          Math.round(countryLanguage),
        scalability:
          Math.round(scalability),
        automation:
          Math.round(automation)
      },

      bonuses: {
        existing: existingBonus,
        preserved: preserveBonus,
        integrations: integrationBonus
      }
    };
  }


  /* =========================================================
     23. BUSINESS SCORE
     ========================================================= */

  function calculateBusinessScore(tool) {

    /*
      Il Business Score NON influenza il Compatibility
      Score.

      Viene utilizzato esclusivamente come tie-break
      quando due software hanno compatibilità molto vicina.
    */

    if (
      !tool ||
      !tool.business
    ) {
      return null;
    }


    const business =
      tool.business;


    const values = {

      commission:
        normalizeScore(
          business.commission,
          null
        ),

      recurring:
        normalizeScore(
          business.recurring,
          null
        ),

      conversion:
        normalizeScore(
          business.conversion,
          null
        ),

      productPrice:
        normalizeScore(
          business.productPrice,
          null
        ),

      attribution:
        normalizeScore(
          business.attribution,
          null
        ),

      marketSize:
        normalizeScore(
          business.marketSize,
          null
        ),

      reliability:
        normalizeScore(
          business.reliability,
          null
        )
    };


    const validValues =
      Object.values(values)
        .filter(function (x) {
          return x !== null;
        });


    if (!validValues.length) {
      return null;
    }


    let score = 0;
    let totalWeight = 0;


    Object.keys(
      CONFIG.BUSINESS_WEIGHTS
    ).forEach(function (key) {

      const value =
        values[key];

      if (
        value === null
      ) {
        return;
      }


      const weight =
        CONFIG.BUSINESS_WEIGHTS[key];


      score +=
        value * weight;

      totalWeight += weight;

    });


    if (!totalWeight) {
      return null;
    }


    return Math.round(
      (
        score /
        totalWeight
      ) * 10
    ) / 10;
  }


  /* =========================================================
     24. CATEGORY / OVERLAP HELPERS
     ========================================================= */

  function calculateFunctionalOverlap(
    toolA,
    toolB,
    needsProfile
  ) {

    let weightedOverlap = 0;
    let totalWeight = 0;


    NEEDS.forEach(function (need) {

      const requirement =
        Number(
          needsProfile &&
          needsProfile[need]
            ? needsProfile[need]
            : 0
        );


      if (
        requirement < 40
      ) {
        return;
      }


      const a =
        Number(
          toolA &&
          toolA.needs &&
          toolA.needs[need]
            ? toolA.needs[need]
            : 0
        );

      const b =
        Number(
          toolB &&
          toolB.needs &&
          toolB.needs[need]
            ? toolB.needs[need]
            : 0
        );


      const maxCapability =
        Math.max(a, b);


      if (
        maxCapability <= 0
      ) {
        return;
      }


      const minCapability =
        Math.min(a, b);


      const overlap =
        minCapability /
        maxCapability;


      weightedOverlap +=
        overlap * requirement;

      totalWeight += requirement;

    });


    if (!totalWeight) {
      return 0;
    }


    return clamp(
      weightedOverlap /
      totalWeight,
      0,
      1
    );
  }


  function sameCategory(toolA, toolB) {

    const categoryA =
      getToolCategory(toolA);

    const categoryB =
      getToolCategory(toolB);


    return (
      categoryA &&
      categoryB &&
      categoryA === categoryB
    );
  }


  function calculateCategoryDiversity(
    candidate,
    selectedTools
  ) {

    if (
      !candidate
    ) {
      return 0;
    }


    const candidateCategory =
      getToolCategory(candidate);


    if (!candidateCategory) {
      return 50;
    }


    const alreadyUsed =
      (selectedTools || []).some(
        function (tool) {
          return (
            getToolCategory(tool) ===
            candidateCategory
          );
        }
      );


    return alreadyUsed
      ? 0
      : 100;
  }


  /* =========================================================
     25. RANKING
     ========================================================= */

  function rankTools(
    answers,
    needsProfile,
    options
  ) {

    answers = answers || {};

    needsProfile =
      needsProfile ||
      buildNeedsProfile(answers);


    options = options || {};


    const database =
      getDatabase();


    const ranked = [];


    database.forEach(function (rawTool) {

      const tool =
        normalizeTool(rawTool);


      const filters =
        passesHardFilters(
          tool,
          answers,
          needsProfile
        );


      if (
        !filters.passed &&
        !options.includeFiltered
      ) {
        return;
      }


      const compatibility =
        toolCompatibility(
          tool,
          answers,
          needsProfile
        );


      const businessScore =
        calculateBusinessScore(
          tool
        );


      const coverage =
        calculateCoverage(
          tool,
          needsProfile
        );


      const coveredNeeds =
        NEEDS.filter(
          function (need) {
            return (
              Number(coverage[need] || 0) >=
              Math.max(
                40,
                Number(needsProfile[need] || 0) * 0.6
              )
            );
          }
        );


      const relevance =
        calculateWeightedNeedsCoverage(
          tool,
          needsProfile
        );


      const reasons =
        buildToolReasons(
          tool,
          answers,
          needsProfile,
          compatibility,
          coveredNeeds
        );


      ranked.push({

        ...tool,

        compatibility:
          compatibility.compatibility,

        baseCompatibility:
          compatibility.baseCompatibility,

        compatibilityScore:
          compatibility.compatibility,

        businessScore,

        businessScoreAvailable:
          businessScore !== null,

        compatibilityFactors:
          compatibility.factors,

        bonuses:
          compatibility.bonuses,

        coverage,

        coveredNeeds,

        relevance,

        newCoverage: 0,

        redundancyPenalty: 0,

        stackScore:
          compatibility.compatibility,

        role: "candidate",

        reasons,

        why: reasons,

        hardFilterPassed:
          filters.passed,

        hardFilterReasons:
          filters.reasons
      });

    });


    /*
      Ranking = qualità individuale.

      NON utilizziamo Business Score come criterio
      primario.

      Il Business Score entra solo quando la
      compatibilità è realmente vicina.
    */

    ranked.sort(function (a, b) {

      const compatibilityDifference =
        b.compatibility -
        a.compatibility;


      if (
        Math.abs(
          compatibilityDifference
        ) >
        CONFIG.COMPATIBILITY_TIE_THRESHOLD
      ) {
        return compatibilityDifference;
      }


      const relevanceDifference =
        b.relevance -
        a.relevance;


      if (
        Math.abs(
          relevanceDifference
        ) >
        CONFIG.RELEVANCE_TIE_THRESHOLD
      ) {
        return relevanceDifference;
      }


      /*
        Business Score solo tie-break.
      */

      if (
        a.businessScore !== null &&
        b.businessScore !== null
      ) {

        const businessDifference =
          b.businessScore -
          a.businessScore;


        if (
          Math.abs(businessDifference) > 0.1
        ) {
          return businessDifference;
        }
      }


      if (
        b.coveredNeeds.length !==
        a.coveredNeeds.length
      ) {
        return (
          b.coveredNeeds.length -
          a.coveredNeeds.length
        );
      }


      return a.name.localeCompare(
        b.name
      );
    });


    /*
      Posizione.
    */

    ranked.forEach(function (tool, index) {
      tool.rank = index + 1;
    });


    return ranked;
  }


  /* =========================================================
     26. MOTIVAZIONI
     ========================================================= */

  function buildToolReasons(
    tool,
    answers,
    needsProfile,
    compatibility,
    coveredNeeds
  ) {

    const reasons = [];


    const importantNeeds =
      NEEDS
        .filter(function (need) {
          return Number(
            needsProfile[need] || 0
          ) >= 60;
        })
        .sort(function (a, b) {
          return (
            Number(needsProfile[b] || 0) -
            Number(needsProfile[a] || 0)
          );
        })
        .slice(0, 3);


    importantNeeds.forEach(function (need) {

      if (
        Number(tool.needs[need] || 0) >= 60
      ) {
        reasons.push(
          "copre bene " +
          NEED_LABELS[need].toLowerCase()
        );
      }

    });


    if (
      compatibility.factors.integrations >= 75
    ) {
      reasons.push(
        "si integra bene con gli strumenti già utilizzati"
      );
    }


    if (
      compatibility.bonuses.existing > 0
    ) {
      reasons.push(
        "valorizza un ecosistema già presente"
      );
    }


    if (
      compatibility.factors.budget >= 90
    ) {
      reasons.push(
        "è coerente con il budget indicato"
      );
    }


    if (
      compatibility.factors.simplicity >= 85
    ) {
      reasons.push(
        "è relativamente semplice da adottare"
      );
    }


    if (
      compatibility.factors.automation >= 85
    ) {
      reasons.push(
        "supporta bene il livello di automazione richiesto"
      );
    }


    if (!reasons.length) {
      reasons.push(
        "ha una buona compatibilità generale con il profilo"
      );
    }


    return uniqueArray(reasons);
  }


  /* =========================================================
     27. RIDONDANZA
     ========================================================= */

  function calculateRedundancy(
    toolA,
    toolB,
    needsProfile
  ) {

    if (
      !toolA ||
      !toolB
    ) {
      return 0;
    }


    let penalty = 0;


    const categoryA =
      getToolCategory(toolA);

    const categoryB =
      getToolCategory(toolB);


    /*
      Stessa categoria = forte segnale di
      possibile alternativa.
    */

    if (
      categoryA &&
      categoryB &&
      categoryA === categoryB
    ) {
      penalty +=
        CONFIG.CATEGORY_REDUNDANCY_PENALTY;
    }


    /*
      Sovrapposizione funzionale.
    */

    const overlap =
      calculateFunctionalOverlap(
        toolA,
        toolB,
        needsProfile
      );


    if (
      overlap >=
      CONFIG.SAME_CATEGORY_OVERLAP_THRESHOLD
    ) {

      penalty +=
        CONFIG.STRONG_CATEGORY_REDUNDANCY_PENALTY;
    }


    if (
      overlap >= 0.80
    ) {

      penalty +=
        CONFIG.VERY_HIGH_OVERLAP_PENALTY;
    }


    /*
      Se sono della stessa categoria e
      hanno sovrapposizione elevata,
      li consideriamo sostanzialmente
      alternativi.
    */

    if (
      categoryA &&
      categoryB &&
      categoryA === categoryB &&
      overlap >= 0.55
    ) {
      penalty += 8;
    }


    return Math.round(
      clamp(
        penalty,
        0,
        CONFIG.MAX_REDUNDANCY_PENALTY
      )
    );
  }


  /* =========================================================
     28. NUOVA COPERTURA
     ========================================================= */

  function calculateNewCoverage(
    candidate,
    selectedTools,
    needsProfile
  ) {

    let value = 0;


    NEEDS.forEach(function (need) {

      const required =
        Number(
          needsProfile[need] || 0
        );


      if (
        required < 40
      ) {
        return;
      }


      const candidateCoverage =
        Number(
          candidate.needs[need] || 0
        );


      if (
        candidateCoverage <= 0
      ) {
        return;
      }


      let alreadyCovered = 0;


      (selectedTools || []).forEach(
        function (tool) {

          alreadyCovered =
            Math.max(
              alreadyCovered,
              Number(
                tool.needs[need] || 0
              )
            );

        }
      );


      const additional =
        Math.max(
          0,
          candidateCoverage -
          alreadyCovered
        );


      /*
        La copertura di un bisogno molto importante
        vale più della copertura di un bisogno marginale.
      */

      value +=
        additional *
        (required / 100);
    });


    return Math.round(
      value * 10
    ) / 10;
  }


  /* =========================================================
     29. PRIMARY TOOL
     ========================================================= */

  function choosePrimary(
    rankedTools,
    answers,
    needsProfile
  ) {

    if (!rankedTools.length) {
      return null;
    }


    /*
      Il Primary deve essere:
      - compatibile
      - rilevante
      - capace di coprire il bisogno centrale.

      Non scegliamo il Primary semplicemente
      guardando il numero di tool coperti.
    */

    const viable =
      rankedTools.filter(
        function (tool) {
          return (
            tool.hardFilterPassed !== false &&
            tool.compatibility >=
            CONFIG.MIN_PRIMARY_COMPATIBILITY
          );
        }
      );


    if (!viable.length) {
      return rankedTools[0] || null;
    }


    /*
      Individua i bisogni dominanti.
    */

    const dominantNeeds =
      NEEDS
        .filter(function (need) {
          return Number(
            needsProfile &&
            needsProfile[need]
              ? needsProfile[need]
              : 0
          ) >= 60;
        })
        .sort(function (a, b) {
          return (
            Number(needsProfile[b] || 0) -
            Number(needsProfile[a] || 0)
          );
        })
        .slice(0, 3);


    /*
      Se esiste un bisogno dominante,
      valorizziamo la copertura di quel bisogno
      senza alterare il Compatibility Score.
    */

    const scored =
      viable.map(function (tool) {

        let primaryFit =
          tool.compatibility;


        if (
          dominantNeeds.length
        ) {

          let dominantCoverage = 0;
          let dominantWeight = 0;


          dominantNeeds.forEach(
            function (need) {

              const requirement =
                Number(
                  needsProfile[need] || 0
                );

              const capability =
                Number(
                  tool.needs[need] || 0
                );


              dominantCoverage +=
                Math.min(
                  requirement,
                  capability
                ) *
                (requirement / 100);

              dominantWeight +=
                requirement;
            }
          );


          if (
            dominantWeight > 0
          ) {

            const dominantScore =
              (
                dominantCoverage /
                dominantWeight
              ) * 100;


            primaryFit =
              tool.compatibility * 0.75 +
              dominantScore * 0.25;
          }
        }


        return {
          tool: tool,
          primaryFit: primaryFit
        };

      });


    scored.sort(function (a, b) {

      if (
        b.primaryFit !== a.primaryFit
      ) {
        return (
          b.primaryFit -
          a.primaryFit
        );
      }


      return (
        b.tool.compatibility -
        a.tool.compatibility
      );
    });


    return scored[0]
      ? scored[0].tool
      : viable[0];
  }


  /* =========================================================
     30. STACK BUILDER
     ========================================================= */

  function buildStack(
    rankedTools,
    answers,
    needsProfile
  ) {

    if (!rankedTools.length) {
      return [];
    }


    const primary =
      choosePrimary(
        rankedTools,
        answers,
        needsProfile
      );


    if (!primary) {
      return [];
    }


    primary.role = "primary";


    const stack = [
      primary
    ];


    /*
      Candidati:

      NON cerchiamo semplicemente i software
      con il Compatibility Score più alto.

      Cerchiamo software che aggiungano
      qualcosa al sistema.
    */

    const candidates =
      rankedTools.filter(
        function (tool) {
          return (
            tool.id !== primary.id &&
            tool.name !== primary.name &&
            tool.hardFilterPassed !== false
          );
        }
      );


    const selectedIds =
      new Set(
        stack.map(function (tool) {
          return tool.id;
        })
      );


    while (
      stack.length <
      CONFIG.MAX_STACK_TOOLS
    ) {

      let bestCandidate = null;
      let bestScore = -Infinity;


      candidates.forEach(function (candidate) {

        if (
          selectedIds.has(candidate.id)
        ) {
          return;
        }


        /*
          1. Nuova copertura.
        */

        const newCoverage =
          calculateNewCoverage(
            candidate,
            stack,
            needsProfile
          );


        /*
          2. Ridondanza.
        */

        const redundancy =
          stack.reduce(
            function (total, selected) {

              return total +
                calculateRedundancy(
                  candidate,
                  selected,
                  needsProfile
                );

            },
            0
          );


        /*
          3. Categoria.
        */

        const candidateCategory =
          getToolCategory(candidate);


        const sameCategoryCount =
          stack.filter(
            function (tool) {
              return (
                candidateCategory &&
                getToolCategory(tool) ===
                candidateCategory
              );
            }
          ).length;


        /*
          Due CRM dello stesso tipo non sono
          normalmente un complemento.
        */

        if (
          sameCategoryCount >=
          CONFIG.MAX_SAME_CATEGORY_TOOLS
        ) {

          /*
            Eccezione:
            se l'utente ha esplicitamente chiesto
            di preservare/integrare quel tool,
            non lo scartiamo automaticamente.
          */

          const preserved =
            preserveExistingTools(
              candidate,
              answers
            );

          const existing =
            existingToolBonus(
              candidate,
              answers
            );


          if (
            preserved <= 0 &&
            existing <= 0
          ) {
            return;
          }
        }


        /*
          4. Soglia nuova copertura.
        */

        if (
          newCoverage <
          CONFIG.MIN_NEW_COVERAGE
        ) {
          return;
        }


        if (
          newCoverage <
          CONFIG.MIN_COMPLEMENTARY_COVERAGE
        ) {
          return;
        }


        /*
          5. Ridondanza massima.
        */

        if (
          redundancy >
          CONFIG.MAX_REDUNDANCY_PENALTY
        ) {
          return;
        }


        const integrationBonus =
          candidate.bonuses &&
          candidate.bonuses.integrations
            ? candidate.bonuses.integrations
            : 0;


        const existingBonus =
          candidate.bonuses &&
          candidate.bonuses.existing
            ? candidate.bonuses.existing
            : 0;


        const categoryDiversity =
          calculateCategoryDiversity(
            candidate,
            stack
          );


        /*
          Stack Score.

          La nuova copertura è il fattore
          più importante.

          Compatibility resta importante,
          ma non deve far entrare un duplicato.
        */

        const score =
          candidate.compatibility *
          (
            CONFIG.STACK_WEIGHTS.compatibility /
            100
          )

          +

          newCoverage *
          (
            CONFIG.STACK_WEIGHTS.newCoverage /
            100
          )

          +

          integrationBonus *
          (
            CONFIG.STACK_WEIGHTS.integration /
            100
          )

          +

          existingBonus *
          (
            CONFIG.STACK_WEIGHTS.existing /
            100
          )

          +

          categoryDiversity *
          (
            CONFIG.STACK_WEIGHTS.categoryDiversity /
            100
          )

          -

          redundancy *
          0.90;


        if (
          score > bestScore
        ) {

          bestScore = score;

          bestCandidate = candidate;

          bestCandidate.__newCoverage =
            newCoverage;

          bestCandidate.__redundancy =
            redundancy;

          bestCandidate.__stackScore =
            Math.round(
              score * 10
            ) / 10;

          bestCandidate.__categoryDiversity =
            categoryDiversity;
        }

      });


      if (!bestCandidate) {
        break;
      }


      bestCandidate.role =
        "complementary";


      bestCandidate.newCoverage =
        bestCandidate.__newCoverage || 0;


      bestCandidate.redundancyPenalty =
        bestCandidate.__redundancy || 0;


      bestCandidate.stackScore =
        bestCandidate.__stackScore ||
        bestCandidate.compatibility;


      bestCandidate.categoryDiversity =
        bestCandidate.__categoryDiversity || 0;


      /*
        Compatibility Score resta invariato.

        Compatibility Score =
        qualità per l'utente.

        Stack Score =
        qualità del tool all'interno
        dello stack specifico.
      */

      delete bestCandidate.__newCoverage;
      delete bestCandidate.__redundancy;
      delete bestCandidate.__stackScore;
      delete bestCandidate.__categoryDiversity;


      stack.push(
        bestCandidate
      );


      selectedIds.add(
        bestCandidate.id
      );
    }


    /*
      Riordina lo stack:
      Primary sempre primo,
      complementari per Stack Score.
    */

    if (
      stack.length > 1
    ) {

      const primaryTool =
        stack[0];

      const complementary =
        stack
          .slice(1)
          .sort(function (a, b) {
            return (
              Number(
                b.stackScore || 0
              ) -
              Number(
                a.stackScore || 0
              )
            );
          });


      return [
        primaryTool,
        ...complementary
      ];
    }


    return stack;
  }


  /* =========================================================
     31. MISSING NEEDS
     ========================================================= */

  function getMissingNeeds(
    needsProfile,
    stack
  ) {

    const missing = [];


    NEEDS.forEach(function (need) {

      const required =
        Number(
          needsProfile &&
          needsProfile[need]
            ? needsProfile[need]
            : 0
        );


      if (
        required < 50
      ) {
        return;
      }


      let covered = 0;


      (stack || []).forEach(function (tool) {

        covered =
          Math.max(
            covered,
            Number(
              tool.needs &&
              tool.needs[need]
                ? tool.needs[need]
                : 0
            )
          );

      });


      if (
        covered < 50
      ) {

        missing.push({

          id: need,

          need: need,

          label:
            NEED_LABELS[need],

          requested:
            Math.round(required),

          covered:
            Math.round(covered),

          gap:
            Math.round(
              required -
              covered
            )
        });

      }

    });


    missing.sort(function (a, b) {
      return b.gap - a.gap;
    });


    return missing;
  }


  /* =========================================================
     32. VALUE OF TIME
     ========================================================= */

  function estimateValue(answers) {

    answers = answers || {};


    const hoursValue =
      answers.hours ||
      answers.hoursPerWeek ||
      answers.weeklyHours ||
      "<1";


    let weeklyHours = 0;


    const hoursText =
      normalizeText(
        hoursValue
      );


    if (
      hoursText.includes("15+")
    ) {
      weeklyHours = 18;
    }

    else if (
      hoursText.includes("8")
    ) {
      weeklyHours = 11.5;
    }

    else if (
      hoursText.includes("4")
    ) {
      weeklyHours = 5.5;
    }

    else if (
      hoursText.includes("1")
    ) {
      weeklyHours = 2;
    }

    else {
      weeklyHours = 0.5;
    }


    const hourlyValueRaw =
      answers.hourValue ||
      answers.hourlyValue ||
      answers.valuePerHour ||
      "30";


    const hourlyText =
      normalizeText(
        hourlyValueRaw
      );


    let hourlyValue =
      firstNumber(
        hourlyValueRaw
      );


    if (
      hourlyText.includes("100")
    ) {
      hourlyValue = 100;
    }


    if (
      !Number.isFinite(hourlyValue)
    ) {
      hourlyValue = 30;
    }


    hourlyValue =
      Math.max(
        0,
        hourlyValue
      );


    const monthlyHours =
      weeklyHours * 4.33;


    const monthlyValue =
      monthlyHours *
      hourlyValue;


    return {

      weeklyHours:
        Math.round(
          weeklyHours * 10
        ) / 10,

      hourlyValue:
        Math.round(
          hourlyValue * 100
        ) / 100,

      monthlyHours:
        Math.round(
          monthlyHours * 10
        ) / 10,

      monthlyValue:
        Math.round(
          monthlyValue * 100
        ) / 100,

      label:
        "Valore potenziale del tempo recuperabile",

      disclaimer:
        "È una stima del valore del tempo potenzialmente recuperabile, non una garanzia di risparmio."
    };
  }


  /* =========================================================
     33. AUTOMATION IDEAS
     ========================================================= */

  function automationIdeas(
    answers,
    needsProfile,
    stack
  ) {

    const ideas = [];


    const has = function (need) {
      return Number(
        needsProfile[need] || 0
      ) >= 50;
    };


    if (
      has("email") &&
      has("automation")
    ) {
      ideas.push({
        title:
          "Automatizza le email ripetitive",
        description:
          "Classifica le richieste, assegna priorità e attiva risposte o follow-up automatici."
      });
    }


    if (
      has("followup") &&
      has("crm")
    ) {
      ideas.push({
        title:
          "Follow-up automatici",
        description:
          "Quando un cliente non risponde, crea automaticamente un promemoria o una nuova attività."
      });
    }


    if (
      has("sales") &&
      has("crm")
    ) {
      ideas.push({
        title:
          "Lead → cliente",
        description:
          "Quando arriva un nuovo lead, crea il contatto e avvia automaticamente il percorso commerciale."
      });
    }


    if (
      has("quotes")
    ) {
      ideas.push({
        title:
          "Preventivi più veloci",
        description:
          "Raccogli i dati, genera il documento e programma automaticamente il follow-up."
      });
    }


    if (
      has("excel") &&
      has("automation")
    ) {
      ideas.push({
        title:
          "Excel automatico",
        description:
          "Aggiorna dati, report e riepiloghi senza dover ripetere manualmente le stesse operazioni."
      });
    }


    if (
      has("appointments")
    ) {
      ideas.push({
        title:
          "Appuntamenti automatici",
        description:
          "Riduci lo scambio di email collegando prenotazioni, calendario e notifiche."
      });
    }


    if (
      has("documents") &&
      has("automation")
    ) {
      ideas.push({
        title:
          "Gestione documenti",
        description:
          "Archivia, rinomina, invia e organizza automaticamente i documenti."
      });
    }


    if (
      has("ai")
    ) {
      ideas.push({
        title:
          "AI nel lavoro quotidiano",
        description:
          "Usa l'AI per classificare informazioni, creare bozze, riassumere contenuti e accelerare attività ripetitive."
      });
    }


    return ideas.slice(0, 5);
  }


  /* =========================================================
     34. STACK EXPLANATION
     ========================================================= */

  function explainStack(
    stack,
    needsProfile
  ) {

    if (!stack || !stack.length) {
      return [];
    }


    return stack.map(function (tool, index) {

      if (
        index === 0
      ) {

        return {
          toolId: tool.id,
          toolName: tool.name,
          role: "primary",
          title:
            "Soluzione principale",
          explanation:
            buildPrimaryExplanation(
              tool,
              needsProfile
            )
        };

      }


      return {
        toolId: tool.id,
        toolName: tool.name,
        role: "complementary",
        title:
          "Strumento complementare",
        explanation:
          buildComplementaryExplanation(
            tool,
            stack,
            needsProfile
          )
      };

    });
  }


  function buildPrimaryExplanation(
    tool,
    needsProfile
  ) {

    const important =
      NEEDS
        .filter(function (need) {
          return (
            Number(
              needsProfile[need] || 0
            ) >= 60 &&
            Number(
              tool.needs[need] || 0
            ) >= 60
          );
        })
        .sort(function (a, b) {
          return (
            needsProfile[b] -
            needsProfile[a]
          );
        })
        .slice(0, 3);


    if (!important.length) {
      return (
        tool.name +
        " è la soluzione principale più compatibile con il profilo."
      );
    }


    const labels =
      important.map(function (need) {
        return NEED_LABELS[need]
          .toLowerCase();
      });


    return (
      tool.name +
      " è la soluzione principale perché copre soprattutto " +
      joinItalian(labels) +
      " e rappresenta il centro del sistema proposto."
    );
  }


  function buildComplementaryExplanation(
    tool,
    stack,
    needsProfile
  ) {

    const covered =
      NEEDS
        .filter(function (need) {

          const requirement =
            Number(
              needsProfile[need] || 0
            );


          if (
            requirement < 50
          ) {
            return false;
          }


          const currentCoverage =
            stack
              .filter(function (x) {
                return x.id !== tool.id;
              })
              .reduce(
                function (max, x) {
                  return Math.max(
                    max,
                    Number(
                      x.needs[need] || 0
                    )
                  );
                },
                0
              );


          return (
            Number(
              tool.needs[need] || 0
            ) >
            currentCoverage
          );

        })
        .sort(function (a, b) {

          const aGain =
            Math.max(
              0,
              Number(
                tool.needs[a] || 0
              )
            );

          const bGain =
            Math.max(
              0,
              Number(
                tool.needs[b] || 0
              )
            );

          return bGain - aGain;
        })
        .slice(0, 3);


    if (!covered.length) {
      return (
        tool.name +
        " completa lo stack senza introdurre una forte sovrapposizione."
      );
    }


    return (
      tool.name +
      " completa lo stack soprattutto per " +
      joinItalian(
        covered.map(function (need) {
          return NEED_LABELS[need]
            .toLowerCase();
        })
      ) +
      "."
    );
  }


  function joinItalian(items) {

    if (!items.length) {
      return "";
    }

    if (items.length === 1) {
      return items[0];
    }

    if (items.length === 2) {
      return (
        items[0] +
        " e " +
        items[1]
      );
    }

    return (
      items.slice(0, -1).join(", ") +
      " e " +
      items[items.length - 1]
    );
  }


  /* =========================================================
     35. ALTERNATIVE / COMPLEMENTARY
     ========================================================= */

  function getAlternatives(
    rankedTools,
    primaryTool,
    limit
  ) {

    if (
      !rankedTools ||
      !primaryTool
    ) {
      return [];
    }


    const max =
      Number(limit) || 5;


    return rankedTools
      .filter(function (tool) {

        return (
          tool.id !== primaryTool.id &&
          tool.name !== primaryTool.name
        );

      })
      .slice(0, max)
      .map(function (tool) {

        return {
          ...tool,
          role: "alternative"
        };

      });
  }


  function getComplementaryTools(
    rankedTools,
    stack
  ) {

    const stackIds =
      new Set(
        (stack || []).map(
          function (tool) {
            return tool.id;
          }
        )
      );


    return (rankedTools || [])
      .filter(function (tool) {

        return !stackIds.has(
          tool.id
        );

      })
      .map(function (tool) {

        return {
          ...tool,
          role: "alternative"
        };

      });
  }


  /* =========================================================
     36. MAIN ANALYSIS
     ========================================================= */

  function analyzeAnswers(
    answers,
    aiProfile
  ) {

    answers = answers || {};


    /*
      1. Profilo bisogni.
    */

    const profile =
      buildNeedsProfile(
        answers,
        aiProfile
      );


    /*
      2. Ranking completo.
    */

    let rankedTools =
      rankTools(
        answers,
        profile
      );


    /*
      3. Fallback controllato.
    */

    if (
      !rankedTools.length &&
      CONFIG.ALLOW_SOFT_FALLBACK
    ) {

      rankedTools =
        rankTools(
          answers,
          profile,
          {
            includeFiltered: true
          }
        )
          .sort(function (a, b) {
            return (
              b.compatibility -
              a.compatibility
            );
          });

    }


    /*
      4. Stack.
    */

    const stack =
      buildStack(
        rankedTools,
        answers,
        profile
      );


    /*
      5. Primary.
    */

    const primaryTool =
      stack[0] ||
      rankedTools[0] ||
      null;


    /*
      6. Ruoli.
    */

    if (primaryTool) {
      primaryTool.role =
        "primary";
    }


    stack.slice(1).forEach(
      function (tool) {
        tool.role =
          "complementary";
      }
    );


    /*
      7. Missing needs.
    */

    const missingNeeds =
      getMissingNeeds(
        profile,
        stack
      );


    /*
      8. Valore tempo.
    */

    const valueEstimate =
      estimateValue(
        answers
      );


    /*
      9. Automazioni.
    */

    const automationSuggestions =
      automationIdeas(
        answers,
        profile,
        stack
      );


    /*
      10. Spiegazioni.
    */

    const explanations =
      explainStack(
        stack,
        profile
      );


    /*
      11. Ranking finale.
    */

    const finalRanking =
      rankedTools
        .slice(0, 15);


    /*
      12. Alternative.

      Le alternative sono strumenti valutati
      singolarmente ma NON inseriti nello stack.
    */

    const alternatives =
      primaryTool
        ? getAlternatives(
            rankedTools,
            primaryTool,
            6
          )
        : [];


    /*
      13. Coverage totale dello stack.
    */

    const stackCoverage = {};


    NEEDS.forEach(function (need) {

      stackCoverage[need] =
        stack.reduce(
          function (max, tool) {

            return Math.max(
              max,
              Number(
                tool.needs[need] || 0
              )
            );

          },
          0
        );

    });


    /*
      14. Coverage ponderata complessiva.
    */

    let totalRequired = 0;
    let totalCovered = 0;


    NEEDS.forEach(function (need) {

      const required =
        Number(
          profile[need] || 0
        );


      if (
        required <= 0
      ) {
        return;
      }


      totalRequired += required;


      totalCovered +=
        Math.min(
          required,
          Number(
            stackCoverage[need] || 0
          )
        );

    });


    const totalCoverage =
      totalRequired > 0
        ? Math.round(
            (
              totalCovered /
              totalRequired
            ) * 1000
          ) / 10
        : 0;


    /*
      15. Qualità complessiva stack.

      NON è la semplice media dei tool.

      Tiene conto di:
      - Compatibility
      - copertura effettiva
      - ridondanza
      - capacità di costruire un sistema
    */

    let stackCompatibility = 0;


    if (
      stack.length
    ) {

      const compatibilityAverage =
        stack.reduce(
          function (sum, tool) {
            return (
              sum +
              Number(
                tool.compatibility || 0
              )
            );
          },
          0
        ) /
        stack.length;


      const redundancyTotal =
        stack.reduce(
          function (total, tool) {
            return (
              total +
              Number(
                tool.redundancyPenalty || 0
              )
            );
          },
          0
        );


      const redundancyPenalty =
        stack.length > 1
          ? Math.min(
              20,
              redundancyTotal /
              stack.length
            )
          : 0;


      stackCompatibility =
        Math.round(
          clamp(
            (
              compatibilityAverage * 0.55 +
              totalCoverage * 0.45 -
              redundancyPenalty
            ),
            0,
            100
          ) * 10
        ) / 10;
    }


    /*
      16. Complementary tools esterni allo stack.
    */

    const complementaryCandidates =
      getComplementaryTools(
        rankedTools,
        stack
      );


    /*
      17. Business availability.
    */

    const businessAvailable =
      finalRanking.some(
        function (tool) {
          return (
            tool.businessScore !== null
          );
        }
      );


    return {

      version:
        CONFIG.VERSION,

      profile,

      answers,

      rankedTools:
        finalRanking,

      ranking:
        finalRanking,

      /*
        Nuova struttura esplicita.
      */

      primaryTool,

      primary:
        primaryTool,

      stack,

      alternatives,

      complementaryCandidates,

      stackCompatibility,

      stackCoverage,

      totalCoverage,

      missingNeeds,

      valueEstimate,

      value:
        valueEstimate,

      automationIdeas:
        automationSuggestions,

      automationSuggestions,

      explanations,

      filters: {

        hardFiltersEnabled:
          CONFIG.ENABLE_HARD_FILTERS,

        budget:
          getBudgetLimit(answers),

        country:
          getUserCountry(answers),

        language:
          getUserLanguage(answers),

        excludedTools:
          getExcludedTools(answers),

        existingTools:
          getExistingTools(answers),

        preservedTools:
          getPreservedTools(answers)

      },

      business: {

        available:
          businessAvailable,

        note:
          "Il Business Score non modifica la compatibilità dell'utente e viene utilizzato solo come tie-break quando la compatibilità è molto vicina."

      }

    };
  }


  /* =========================================================
     37. HELPERS PUBBLICI
     ========================================================= */

  function getCoveredNeeds(
    stack
  ) {

    const covered =
      new Set();


    (stack || []).forEach(function (tool) {

      NEEDS.forEach(function (need) {

        if (
          Number(
            tool.needs &&
            tool.needs[need]
              ? tool.needs[need]
              : 0
          ) >= 50
        ) {
          covered.add(need);
        }

      });

    });


    return Array.from(
      covered
    );
  }


  function getNeedLabel(need) {

    return (
      NEED_LABELS[need] ||
      need
    );
  }


  /* =========================================================
     38. API PUBBLICA
     ========================================================= */

  const ProjectXEngine = {

    VERSION:
      CONFIG.VERSION,

    CONFIG,

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

    calculateRedundancy,

    calculateBusinessScore,

    toolCompatibility,

    getExistingTools,

    getPreservedTools,

    getExcludedTools,

    getCoveredNeeds,

    getNeedLabel,

    explainStack,

    getDatabase,

    getAlternatives,

    getComplementaryTools,

    calculateFunctionalOverlap,

    calculateCategoryDiversity

  };


  /* =========================================================
     39. GLOBAL
     ========================================================= */

  if (
    typeof window !== "undefined"
  ) {

    window.ProjectXEngine =
      ProjectXEngine;

    /*
      Compatibilità con il vecchio nome.
    */

    window.StackPilotEngine =
      ProjectXEngine;

  }


  console.log(
    "PROJECT-X Decision Engine v1.1.0 caricato correttamente."
  );


})();
