/* =========================================================
   PROJECT-X — DECISION ENGINE
   Versione 1.3.0
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

   Compatibile con:
   - database.js
   - index.html attuale
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

    VERSION: "1.3.0",

    /* Stack */
    MAX_STACK_TOOLS: 4,

    /* Soglie */
    MIN_PRIMARY_COMPATIBILITY: 50,
    MIN_STACK_COMPATIBILITY: 55,
    MIN_COMPLEMENTARY_COVERAGE: 12,
    MIN_PRIMARY_GAP: 18,
    MIN_GAP_IMPROVEMENT: 10,
    MIN_COMPLEMENTARY_CAPABILITY: 60,

    /* Ridondanza */
    MAX_REDUNDANCY_PENALTY: 30,
    CATEGORY_REDUNDANCY_PENALTY: 14,
    STRONG_CATEGORY_REDUNDANCY_PENALTY: 20,

    /* Ecosistema */
    EXISTING_TOOL_MAX_BONUS: 15,
    PRESERVE_TOOL_MAX_BONUS: 15,
    INTEGRATION_MAX_BONUS: 10,

    /* Ranking */
    COMPATIBILITY_TIE_THRESHOLD: 3,

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


    const aliases = TOOL_ALIASES[toolName] || [];

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


    /*
      Ecosistemi conosciuti.
    */

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

      const coverage = clamp(
        Math.min(
          capability,
          requirement
        ) / requirement * 100,
        0,
        100
      );

      const weight = requirement;

      totalWeight += weight;
      totalScore += coverage * weight;
    });


    if (!totalWeight) {
      return 60;
    }


    return clamp(
      totalScore / totalWeight,
      0,
      100
    );
  }


  /* =========================================================
     11. TEAM SCORE
     ========================================================= */

  function normalizeAnswerTeam(value) {

    const text = normalizeText(value);

    if (
      text.includes("solo")
    ) {
      return "solo";
    }

    if (
      text.includes("2") &&
      text.includes("5")
    ) {
      return "2-5";
    }

    if (
      text.includes("6") &&
      text.includes("20")
    ) {
      return "6-20";
    }

    if (
      text.includes("21") &&
      text.includes("50")
    ) {
      return "21-50";
    }

    if (
      text.includes("50")
    ) {
      return "50+";
    }

    return text;
  }


  function teamScore(tool, team) {

    if (!team) {
      return 75;
    }

    const wanted = normalizeText(
      normalizeAnswerTeam(team)
    );

    const available = tool.team
      .map(function (x) {
        return normalizeText(x);
      })
      .filter(Boolean);


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


    /*
      Flessibilità ragionevole.
    */

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

    /*
      Se il database non ha ancora prezzi,
      non penalizziamo il tool.
    */

    if (price === null) {

      if (
        budget <= 30 &&
        toolHasFreePlan(tool)
      ) {
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

    /*
      Senza dati di prezzo non filtriamo.
      Questo evita di eliminare erroneamente strumenti
      dal database attuale.
    */

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


    /*
      Tollera un 20% per evitare stack vuoti.
    */

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


    /*
      Se il database ha un campo esplicito,
      lo utilizziamo.
    */

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
      /*
        Non penalizziamo gli strumenti avanzati
        quando l'utente chiede AI.
      */

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


    /*
      Default neutrale.
    */

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

  function passesTeamFilter(tool, answers) {

    const rawTeam =
      answers &&
      (answers.team || answers.teamSize || "");


    if (!rawTeam) {
      return true;
    }


    const wanted = normalizeText(
      normalizeAnswerTeam(rawTeam)
    );


    const available = (tool.team || [])
      .map(function (x) {
        return normalizeText(x);
      })
      .filter(Boolean);


    /*
      Hard constraint: quando il database dichiara i segmenti
      supportati, un segmento non dichiarato non entra nel ranking.
      In particolare, un tool enterprise che non supporta "Solo io"
      non deve risultare primo per un professionista singolo.
    */

    if (!available.length) {
      return true;
    }


    return available.includes(wanted);
  }


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
      !passesTeamFilter(tool, answers)
    ) {
      reasons.push(
        "Non adatto alla dimensione del team indicata."
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


    /*
      Categoria / rilevanza:
      non eliminiamo strumenti con una categoria
      sconosciuta, ma evitiamo strumenti totalmente
      privi di capacità sui bisogni attivi.
    */

    const activeNeeds = NEEDS.filter(
      function (need) {
        return Number(
          needsProfile &&
          needsProfile[need]
            ? needsProfile[need]
            : 0
        ) >= 40;
      }
    );


    if (
      activeNeeds.length
    ) {

      const hasRelevantCapability =
        activeNeeds.some(function (need) {

          return Number(
            tool.needs &&
            tool.needs[need]
              ? tool.needs[need]
              : 0
          ) >= 40;

        });


      if (!hasRelevantCapability) {
        reasons.push(
          "Non copre in modo significativo le esigenze rilevate."
        );
      }
    }


    return {
      passed: reasons.length === 0,
      reasons
    };
  }


  /* =========================================================
     22. COMPATIBILITY SCORE
     ========================================================= */

  function toolCompatibility(
    tool,
    answers,
    needsProfile
  ) {

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
        answers &&
        (
          answers.team ||
          answers.teamSize ||
          ""
        )
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
        answers &&
        (
          answers.automation ||
          answers.automationLevel ||
          ""
        )
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


    /*
      L'automazione viene usata come correttivo,
      non come peso dominante.
    */

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


    /*
      Limite finale.
    */

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
      IMPORTANTISSIMO:

      Non inventiamo commissioni,
      prezzi o cookie.

      Il database potrà in futuro contenere:

      business: {
        commission: 0-100,
        recurring: 0-100,
        conversion: 0-100,
        productPrice: 0-100,
        attribution: 0-100,
        marketSize: 0-100,
        reliability: 0-100
      }

      Se questi dati non esistono:
      Business Score = null.
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
     24. RANKING
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


      /*
        Gli strumenti esclusi vengono
        normalmente rimossi.

        In modalità fallback possiamo
        tenerli separati.
      */

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

        primaryRoleFit: 0,

        primarySelectionScore:
          compatibility.compatibility,

        hardFilterPassed:
          filters.passed,

        hardFilterReasons:
          filters.reasons
      });

    });


    /*
      Ordinamento:

      1. Compatibility
      2. Relevance
      3. Coverage
      4. Business Score SOLO come tie-break
         quando Compatibility è vicina.
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


      /*
        Compatibilità molto vicina:
        Business Score può fare da tie-break.
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
        b.relevance !== a.relevance
      ) {
        return (
          b.relevance -
          a.relevance
        );
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
      Assegna posizione.
    */

    ranked.forEach(function (tool, index) {
      tool.rank = index + 1;
    });


    return ranked;
  }


  /* =========================================================
     25. MOTIVAZIONI
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
     26. RIDONDANZA
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
      normalizeText(
        toolA.category
      );


    const categoryB =
      normalizeText(
        toolB.category
      );


    /*
      Stessa categoria.
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

    let overlap = 0;
    let relevantNeeds = 0;


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
          toolA.needs[need] || 0
        );


      const b =
        Number(
          toolB.needs[need] || 0
        );


      if (
        a >= 60 &&
        b >= 60
      ) {
        overlap++;
      }


      relevantNeeds++;
    });


    if (
      relevantNeeds > 0
    ) {

      const overlapRatio =
        overlap /
        relevantNeeds;


      penalty +=
        overlapRatio *
        CONFIG.STRONG_CATEGORY_REDUNDANCY_PENALTY;
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
     27. NUOVA COPERTURA
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


      selectedTools.forEach(function (tool) {

        alreadyCovered =
          Math.max(
            alreadyCovered,
            Number(
              tool.needs[need] || 0
            )
          );

      });


      const additional =
        Math.max(
          0,
          candidateCoverage -
          alreadyCovered
        );


      value +=
        additional *
        (required / 100);

    });


    return Math.round(
      value * 10
    ) / 10;
  }


  /* =========================================================
     28. PRIMARY ROLE DETECTION
     ========================================================= */

  const PRIMARY_ROLES = {

    crmSales: {
      label: "CRM & Vendite",

      needs: {
        crm: 1,
        sales: 1,
        followup: 1,
        automation: 0.65,
        quotes: 0.45,
        email: 0.35
      },

      keywords: [
        "crm",
        "clienti",
        "cliente",
        "lead",
        "commerciale",
        "vendite",
        "vendita",
        "sales",
        "follow up",
        "follow-up",
        "pipeline",
        "preventivi",
        "preventivo"
      ]
    },


    marketing: {
      label: "Marketing",

      needs: {
        marketing: 1,
        email: 0.8,
        automation: 0.65,
        ecommerce: 0.45,
        ai: 0.3
      },

      keywords: [
        "marketing",
        "campagne",
        "ads",
        "advertising",
        "social",
        "seo",
        "content",
        "newsletter",
        "acquisizione",
        "brand"
      ]
    },


    projects: {
      label: "Gestione Progetti",

      needs: {
        projects: 1,
        automation: 0.55,
        documents: 0.35,
        crm: 0.25
      },

      keywords: [
        "progetti",
        "project",
        "attività",
        "task",
        "scadenze",
        "team",
        "workflow",
        "lavori",
        "commesse"
      ]
    },


    appointments: {
      label: "Appuntamenti",

      needs: {
        appointments: 1,
        crm: 0.55,
        automation: 0.45,
        email: 0.35
      },

      keywords: [
        "appuntamenti",
        "prenotazioni",
        "booking",
        "agenda",
        "calendario",
        "riunioni",
        "meeting"
      ]
    },


    documents: {
      label: "Documenti",

      needs: {
        documents: 1,
        automation: 0.55,
        email: 0.3,
        ai: 0.25
      },

      keywords: [
        "documenti",
        "documento",
        "pdf",
        "contratti",
        "contratto",
        "archivio",
        "firma",
        "firme"
      ]
    },


    data: {
      label: "Dati / Excel",

      needs: {
        excel: 1,
        automation: 0.65,
        ai: 0.25,
        projects: 0.2
      },

      keywords: [
        "excel",
        "dati",
        "report",
        "dashboard",
        "tabelle",
        "analisi",
        "analizzare",
        "numeri"
      ]
    },


    ecommerce: {
      label: "E-commerce",

      needs: {
        ecommerce: 1,
        marketing: 0.7,
        email: 0.55,
        automation: 0.55,
        sales: 0.45
      },

      keywords: [
        "e-commerce",
        "ecommerce",
        "shop",
        "negozio online",
        "prodotti",
        "ordini",
        "carrello",
        "online store"
      ]
    },


    automation: {
      label: "Automazione",

      needs: {
        automation: 1,
        ai: 0.75,
        email: 0.35,
        crm: 0.3,
        documents: 0.25
      },

      keywords: [
        "automatizzare",
        "automazione",
        "automazioni",
        "automatico",
        "ripetitive",
        "workflow",
        "integrazioni",
        "integrare",
        "ai",
        "intelligenza artificiale"
      ]
    }
  };


  function getRoleInputText(answers) {

    answers = answers || {};

    return normalizeText(
      [
        answers.activity,
        answers.businessType,
        answers.type,
        answers.goals,
        answers.goal,
        answers.objective,
        answers.objectives,
        answers.painPoint,
        answers.pain,
        answers.problem,
        answers.problems
      ]
        .filter(Boolean)
        .join(" ")
    );
  }


  function calculateRoleKeywordSignal(
    role,
    text
  ) {

    if (
      !role ||
      !text
    ) {
      return 0;
    }


    let signal = 0;


    role.keywords.forEach(function (keyword) {

      if (
        text.includes(
          normalizeText(keyword)
        )
      ) {
        signal += 8;
      }

    });


    return clamp(
      signal,
      0,
      24
    );
  }


  function detectDominantRole(
    answers,
    needsProfile
  ) {

    const text =
      getRoleInputText(
        answers
      );


    const results = [];


    Object.keys(
      PRIMARY_ROLES
    ).forEach(function (roleId) {

      const role =
        PRIMARY_ROLES[roleId];


      let needScore = 0;
      let totalWeight = 0;


      Object.keys(
        role.needs
      ).forEach(function (need) {

        const roleWeight =
          Number(
            role.needs[need] || 0
          );


        const requirement =
          Number(
            needsProfile &&
            needsProfile[need]
              ? needsProfile[need]
              : 0
          );


        if (
          roleWeight <= 0
        ) {
          return;
        }


        needScore +=
          requirement *
          roleWeight;


        totalWeight +=
          100 *
          roleWeight;
      });


      const normalizedNeedScore =
        totalWeight > 0
          ? (
              needScore /
              totalWeight
            ) * 100
          : 0;


      const keywordSignal =
        calculateRoleKeywordSignal(
          role,
          text
        );


      const score =
        clamp(
          normalizedNeedScore * 0.78 +
          keywordSignal,
          0,
          100
        );


      results.push({

        id: roleId,

        label: role.label,

        score:
          Math.round(score * 10) / 10,

        needScore:
          Math.round(
            normalizedNeedScore * 10
          ) / 10,

        keywordSignal,

        matchedKeywords:
          role.keywords.filter(
            function (keyword) {
              return text.includes(
                normalizeText(keyword)
              );
            }
          )
      });

    });


    results.sort(function (a, b) {
      return b.score - a.score;
    });


    const dominant =
      results[0] || {
        id: "automation",
        label:
          PRIMARY_ROLES.automation.label,
        score: 0,
        needScore: 0,
        keywordSignal: 0
      };


    return {
      id: dominant.id,
      label: dominant.label,
      score: dominant.score,
      needScore: dominant.needScore,
      keywordSignal: dominant.keywordSignal,
      matchedKeywords:
        dominant.matchedKeywords || [],
      ranking: results
    };
  }


  function calculatePrimaryRoleFit(
    tool,
    dominantRole,
    needsProfile
  ) {

    if (
      !tool ||
      !dominantRole ||
      !dominantRole.id
    ) {
      return 0;
    }


    const role =
      PRIMARY_ROLES[
        dominantRole.id
      ];


    if (!role) {
      return 0;
    }


    let totalWeight = 0;
    let totalScore = 0;


    Object.keys(
      role.needs
    ).forEach(function (need) {

      const weight =
        Number(
          role.needs[need] || 0
        );


      const requirement =
        Number(
          needsProfile &&
          needsProfile[need]
            ? needsProfile[need]
            : 0
        );


      if (
        weight <= 0 ||
        requirement <= 0
      ) {
        return;
      }


      const capability =
        Number(
          tool.needs &&
          tool.needs[need]
            ? tool.needs[need]
            : 0
        );


      const match =
        clamp(
          (
            Math.min(
              capability,
              requirement
            ) /
            requirement
          ) * 100,
          0,
          100
        );


      totalWeight +=
        weight *
        Math.max(
          0.25,
          requirement / 100
        );


      totalScore +=
        match *
        weight *
        Math.max(
          0.25,
          requirement / 100
        );

    });


    let computed =
      totalWeight > 0
        ? totalScore / totalWeight
        : 0;


    /*
      Se il database contiene un ruolo esplicito
      per il tool, lo usiamo come informazione
      aggiuntiva, non come sostituto dei bisogni.
    */

    if (
      tool.roles &&
      Number.isFinite(
        Number(
          tool.roles[
            dominantRole.id
          ]
        )
      )
    ) {

      const explicit =
        normalizeScore(
          tool.roles[
            dominantRole.id
          ]
        );


      computed =
        computed * 0.70 +
        explicit * 0.30;
    }


    /*
      Piccolo bonus se la categoria dichiarata
      coincide con il ruolo principale.
    */

    const category =
      normalizeText(
        tool.category
      );


    const categoryHints = {

      crmSales: [
        "crm",
        "sales",
        "vendite",
        "customer",
        "commerciale"
      ],

      marketing: [
        "marketing",
        "email",
        "advertising"
      ],

      projects: [
        "project",
        "progetti",
        "project management"
      ],

      appointments: [
        "booking",
        "calendar",
        "appuntamenti"
      ],

      documents: [
        "document",
        "documenti",
        "pdf"
      ],

      data: [
        "data",
        "analytics",
        "excel",
        "dati"
      ],

      ecommerce: [
        "ecommerce",
        "e-commerce",
        "shop"
      ],

      automation: [
        "automation",
        "automazione",
        "integration"
      ]
    };


    const hints =
      categoryHints[
        dominantRole.id
      ] || [];


    if (
      hints.some(function (hint) {
        return category.includes(
          normalizeText(hint)
        );
      })
    ) {
      computed += 5;
    }


    return clamp(
      Math.round(computed * 10) / 10,
      0,
      100
    );
  }


  /* =========================================================
     29. PRIMARY TOOL
     ========================================================= */

  function choosePrimary(
    rankedTools,
    answers,
    needsProfile,
    dominantRole
  ) {

    if (
      !rankedTools.length
    ) {
      return null;
    }


    dominantRole =
      dominantRole ||
      detectDominantRole(
        answers,
        needsProfile
      );


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
      Il Primary non viene scelto semplicemente
      in base alla Compatibility.

      Deve essere adatto al ruolo centrale
      emerso dal problema dell'utente.

      40% Compatibility
      60% Primary Role Fit
    */

    viable.forEach(function (tool) {

      tool.primaryRoleFit =
        calculatePrimaryRoleFit(
          tool,
          dominantRole,
          needsProfile
        );


      tool.primarySelectionScore =
        tool.compatibility * 0.40 +
        tool.primaryRoleFit * 0.60;

    });


    viable.sort(function (a, b) {

      if (
        b.primarySelectionScore !==
        a.primarySelectionScore
      ) {
        return (
          b.primarySelectionScore -
          a.primarySelectionScore
        );
      }


      if (
        b.compatibility !==
        a.compatibility
      ) {
        return (
          b.compatibility -
          a.compatibility
        );
      }


      if (
        a.businessScore !== null &&
        b.businessScore !== null
      ) {

        if (
          b.businessScore !==
          a.businessScore
        ) {
          return (
            b.businessScore -
            a.businessScore
          );
        }
      }


      return (
        b.relevance -
        a.relevance
      );
    });


    return viable[0] || null;
  }


  /* =========================================================
     30. STACK BUILDER
     ========================================================= */

  function buildStack(
    rankedTools,
    answers,
    needsProfile,
    dominantRole
  ) {

    if (
      !rankedTools.length
    ) {
      return [];
    }


    const primary =
      choosePrimary(
        rankedTools,
        answers,
        needsProfile,
        dominantRole
      );


    if (!primary) {
      return [];
    }


    primary.role = "primary";


    const stack = [
      primary
    ];


    /*
      Selezioniamo complementari.
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


        const newCoverage =
          calculateNewCoverage(
            candidate,
            stack,
            needsProfile
          );


        /*
          Calcoliamo le lacune ancora aperte
          del Primary / Stack.
        */

        const primaryGaps =
          NEEDS.filter(function (need) {

            const required =
              Number(
                needsProfile[need] || 0
              );


            const primaryCapability =
              Number(
                primary.needs[need] || 0
              );


            return (
              required >= 50 &&
              (
                required -
                primaryCapability
              ) >=
              CONFIG.MIN_PRIMARY_GAP
            );

          });


        let gapImprovement = 0;


        primaryGaps.forEach(function (need) {

          const required =
            Number(
              needsProfile[need] || 0
            );


          let currentCoverage = 0;


          stack.forEach(function (tool) {

            currentCoverage =
              Math.max(
                currentCoverage,
                Number(
                  tool.needs[need] || 0
                )
              );

          });


          const candidateCoverage =
            Number(
              candidate.needs[need] || 0
            );


          gapImprovement +=
            Math.max(
              0,
              candidateCoverage -
              currentCoverage
            ) *
            (required / 100);

        });


        const complementaryCapability =
          NEEDS.reduce(
            function (total, need) {

              const required =
                Number(
                  needsProfile[need] || 0
                );


              const capability =
                Number(
                  candidate.needs[need] || 0
                );


              if (
                required < 40
              ) {
                return total;
              }


              if (
                capability <
                CONFIG.MIN_COMPLEMENTARY_CAPABILITY
              ) {
                return total;
              }


              return total +
                capability *
                (required / 100);

            },
            0
          );


        /*
          Se il Primary copre già bene tutto,
          non aggiungiamo strumenti solo per
          "fare volume".
        */

        if (
          primaryGaps.length &&
          gapImprovement <
          CONFIG.MIN_GAP_IMPROVEMENT
        ) {
          return;
        }


        if (
          !primaryGaps.length &&
          newCoverage <
          CONFIG.MIN_NEW_COVERAGE
        ) {
          return;
        }


        if (
          newCoverage <
          CONFIG.MIN_COMPLEMENTARY_COVERAGE &&
          gapImprovement <
          CONFIG.MIN_GAP_IMPROVEMENT
        ) {
          return;
        }


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


        if (
          redundancy >
          CONFIG.MAX_REDUNDANCY_PENALTY
        ) {
          return;
        }


        const integrationBonus =
          calculateIntegrationBonus(
            candidate,
            answers
          );


        const existingBonus =
          existingToolBonus(
            candidate,
            answers
          );


        const score =

          gapImprovement * 0.40 +

          newCoverage * 0.25 +

          candidate.compatibility * 0.15 +

          complementaryCapability * 0.10 +

          integrationBonus * 0.05 +

          existingBonus * 0.05 -

          redundancy * 0.80;


        if (
          score >
          bestScore
        ) {

          bestScore = score;
          bestCandidate = {
            tool: candidate,
            score,
            newCoverage,
            redundancy,
            gapImprovement,
            complementaryCapability
          };

        }

      });


      if (!bestCandidate) {
        break;
      }


      const selected =
        bestCandidate.tool;


      selected.role =
        "complementary";


      selected.newCoverage =
        bestCandidate.newCoverage;


      selected.redundancyPenalty =
        bestCandidate.redundancy;


      selected.stackScore =
        Math.round(
          bestCandidate.score * 10
        ) / 10;


      selected.stackGapImprovement =
        Math.round(
          bestCandidate.gapImprovement * 10
        ) / 10;


      selected.complementaryCapability =
        Math.round(
          bestCandidate.complementaryCapability * 10
        ) / 10;


      stack.push(selected);

      selectedIds.add(
        selected.id
      );
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
   CONTINUA ENGINE.JS
   ========================================================= */

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
        toolCountries.some(function (x) {
          return x === country;
        })
      ) {
        score += 20;
      }
    }

    if (
      language &&
      toolLanguages.length
    ) {
      if (
        toolLanguages.some(function (x) {
          return x === language;
        })
      ) {
        score += 20;
      }
    }

    return clamp(
      score,
      0,
      100
    );
  }


  function passesCountryLanguageFilter(
    tool,
    answers
  ) {

    const country =
      normalizeText(
        getUserCountry(answers)
      );

    const language =
      normalizeText(
        getUserLanguage(answers)
      );

    if (
      !country &&
      !language
    ) {
      return true;
    }

    const toolCountries =
      tool.countries.map(
        normalizeText
      );

    const toolLanguages =
      tool.languages.map(
        normalizeText
      );

    if (
      country &&
      toolCountries.length &&
      !toolCountries.includes(country)
    ) {
      return false;
    }

    if (
      language &&
      toolLanguages.length &&
      !toolLanguages.includes(language)
    ) {
      return false;
    }

    return true;
  }


  /* =========================================================
     17. INTEGRATIONS
     ========================================================= */

  function getToolIntegrations(tool) {

    if (
      Array.isArray(tool.integrations)
    ) {
      return tool.integrations;
    }

    if (
      Array.isArray(tool.integration)
    ) {
      return tool.integration;
    }

    if (
      typeof tool.integrations === "string"
    ) {
      return [
        tool.integrations
      ];
    }

    if (
      typeof tool.integration === "string"
    ) {
      return [
        tool.integration
      ];
    }

    return [];
  }


  function integrationScore(
    tool,
    answers
  ) {

    const integrations =
      getToolIntegrations(tool);

    if (
      !integrations.length
    ) {
      return 70;
    }

    const requested =
      normalizeText(
        answers &&
        (
          answers.integrations ||
          answers.integration ||
          answers.tools ||
          ""
        )
      );

    if (!requested) {
      return 75;
    }

    const requestedTokens =
      tokenize(requested);

    let matches = 0;

    integrations.forEach(
      function (integration) {

        const integrationText =
          normalizeText(
            integration
          );

        requestedTokens.forEach(
          function (token) {

            if (
              integrationText.includes(
                token
              )
            ) {
              matches++;
            }

          }
        );

      }
    );

    if (!matches) {
      return 60;
    }

    return clamp(
      75 +
      matches * 8,
      0,
      100
    );
  }


  function integrationBonus(
    candidate,
    currentStack
  ) {

    if (
      !candidate ||
      !currentStack ||
      !currentStack.length
    ) {
      return 0;
    }

    const candidateIntegrations =
      getToolIntegrations(candidate)
        .map(normalizeText);

    if (
      !candidateIntegrations.length
    ) {
      return 0;
    }

    let matches = 0;

    currentStack.forEach(
      function (tool) {

        const toolName =
          normalizeText(
            tool.name
          );

        const toolId =
          normalizeText(
            tool.id
          );

        candidateIntegrations.forEach(
          function (integration) {

            if (
              integration.includes(
                toolName
              ) ||
              integration.includes(
                toolId
              ) ||
              toolName.includes(
                integration
              ) ||
              toolId.includes(
                integration
              )
            ) {
              matches++;
            }

          }
        );

      }
    );

    return clamp(
      matches *
      5,
      0,
      CONFIG.INTEGRATION_MAX_BONUS
    );
  }


  /* =========================================================
     18. SIMPLICITY
     ========================================================= */

  function simplicityScore(
    tool,
    answers
  ) {

    const tech =
      normalizeText(
        answers &&
        (
          answers.tech ||
          answers.techLevel ||
          answers.technology ||
          ""
        )
      );

    if (!tech) {
      return 75;
    }

    const complexity =
      normalizeText(
        tool.complexity ||
        tool.difficulty ||
        ""
      );

    if (!complexity) {
      return 75;
    }

    if (
      tech.includes("base")
    ) {

      if (
        complexity.includes("semplic") ||
        complexity.includes("facil") ||
        complexity.includes("easy")
      ) {
        return 100;
      }

      if (
        complexity.includes("medio") ||
        complexity.includes("medium")
      ) {
        return 70;
      }

      return 45;
    }

    if (
      tech.includes("medio")
    ) {

      if (
        complexity.includes("medio") ||
        complexity.includes("medium")
      ) {
        return 100;
      }

      if (
        complexity.includes("semplic") ||
        complexity.includes("facil") ||
        complexity.includes("easy")
      ) {
        return 90;
      }

      return 75;
    }

    if (
      tech.includes("avanz")
    ) {
      return 100;
    }

    return 75;
  }


  /* =========================================================
     19. SCALABILITY
     ========================================================= */

  function scalabilityScore(
    tool,
    answers
  ) {

    const team =
      normalizeText(
        normalizeAnswerTeam(
          answers &&
          (
            answers.team ||
            answers.teamSize ||
            ""
          )
        )
      );

    const scalability =
      Number(
        tool.scalability ||
        tool.scale ||
        75
      );

    if (
      !Number.isFinite(
        scalability
      )
    ) {
      return 75;
    }

    let modifier = 0;

    if (
      team.includes("solo")
    ) {
      modifier = 5;
    }

    if (
      team.includes("2") ||
      team.includes("5")
    ) {
      modifier = 0;
    }

    if (
      team.includes("20")
    ) {
      modifier = 5;
    }

    if (
      team.includes("21") ||
      team.includes("50")
    ) {
      modifier = 8;
    }

    if (
      team.includes("50+")
    ) {
      modifier = 12;
    }

    return clamp(
      scalability + modifier,
      0,
      100
    );
  }


  /* =========================================================
     20. FUNCTIONALITY SCORE
     ========================================================= */

  function functionalityScore(
    tool,
    needsProfile
  ) {

    let total = 0;
    let weight = 0;

    NEEDS.forEach(
      function (need) {

        const required =
          Number(
            needsProfile[need] || 0
          );

        if (
          required <= 0
        ) {
          return;
        }

        const capability =
          Number(
            tool.needs &&
            tool.needs[need] || 0
          );

        total +=
          capability *
          required;

        weight +=
          required;

      }
    );

    if (
      !weight
    ) {
      return 75;
    }

    return clamp(
      total / weight,
      0,
      100
    );
  }


  /* =========================================================
     21. HARD FILTERS
     ========================================================= */

  function passesHardFilters(
    tool,
    answers
  ) {

    if (
      !CONFIG.ENABLE_HARD_FILTERS
    ) {
      return true;
    }

    if (
      !passesBudgetFilter(
        tool,
        answers
      )
    ) {
      return false;
    }

    if (
      !passesCountryLanguageFilter(
        tool,
        answers
      )
    ) {
      return false;
    }

    if (
      tool.available === false
    ) {
      return false;
    }

    if (
      tool.disabled === true
    ) {
      return false;
    }

    return true;
  }


  /* =========================================================
     22. COMPATIBILITY
     ========================================================= */

  function calculateCompatibility(
    tool,
    answers,
    needsProfile
  ) {

    const needs =
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
      integrationScore(
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
        answers &&
        (
          answers.team ||
          answers.teamSize ||
          ""
        )
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

    let score =
      needs *
      CONFIG.WEIGHTS.needs +

      functionality *
      CONFIG.WEIGHTS.functionality +

      budget *
      CONFIG.WEIGHTS.budget +

      integrations *
      CONFIG.WEIGHTS.integrations +

      simplicity *
      CONFIG.WEIGHTS.simplicity +

      team *
      CONFIG.WEIGHTS.team +

      countryLanguage *
      CONFIG.WEIGHTS.countryLanguage +

      scalability *
      CONFIG.WEIGHTS.scalability;

    score /=
      100;


    /*
      Automazione viene trattata come
      correzione specifica perché può essere
      decisiva per alcuni profili.
    */

    const requestedAutomation =
      normalizeText(
        answers &&
        (
          answers.automation ||
          answers.automationLevel ||
          ""
        )
      );

    const automation =
      automationScore(
        tool,
        requestedAutomation
      );


    if (
      requestedAutomation
    ) {

      score =
        score * 0.90 +
        automation * 0.10;

    }


    /*
      Ecosistema.
    */

    const ecosystem =
      normalizeText(
        answers &&
        (
          answers.existingTools ||
          answers.currentTools ||
          answers.tools ||
          ""
        )
      );

    if (
      ecosystem
    ) {

      const bonus =
        calculateExistingToolBonus(
          tool,
          ecosystem
        );

      score +=
        bonus *
        CONFIG.EXISTING_TOOL_MAX_BONUS /
        100;

    }


    return Math.round(
      clamp(
        score,
        0,
        100
      )
    );
  }


  /* =========================================================
     23. BUSINESS SCORE
     ========================================================= */

  function calculateBusinessScore(
    tool
  ) {

    if (
      !tool ||
      !tool.business
    ) {
      return null;
    }

    const business =
      tool.business;


    const commission =
      normalizeScore(
        business.commission
      );

    const recurring =
      normalizeScore(
        business.recurring
      );

    const conversion =
      normalizeScore(
        business.conversion
      );

    const productPrice =
      normalizeScore(
        business.productPrice
      );

    const attribution =
      normalizeScore(
        business.attribution
      );

    const marketSize =
      normalizeScore(
        business.marketSize
      );

    const reliability =
      normalizeScore(
        business.reliability
      );


    const score =
      commission *
      CONFIG.BUSINESS_WEIGHTS.commission +

      recurring *
      CONFIG.BUSINESS_WEIGHTS.recurring +

      conversion *
      CONFIG.BUSINESS_WEIGHTS.conversion +

      productPrice *
      CONFIG.BUSINESS_WEIGHTS.productPrice +

      attribution *
      CONFIG.BUSINESS_WEIGHTS.attribution +

      marketSize *
      CONFIG.BUSINESS_WEIGHTS.marketSize +

      reliability *
      CONFIG.BUSINESS_WEIGHTS.reliability;


    return Math.round(
      score / 100
    );
  }


  /* =========================================================
     24. RANKING
     ========================================================= */

  function rankTools(
    answers,
    needsProfile,
    options
  ) {

    options =
      options || {};

    const database =
      getDatabase();


    const results =
      database
        .map(function (rawTool) {

          const tool =
            normalizeTool(
              rawTool
            );

          if (!tool) {
            return null;
          }


          const hardFilterPassed =
            passesHardFilters(
              tool,
              answers
            );


          if (
            !hardFilterPassed &&
            !options.includeFiltered
          ) {
            return null;
          }


          const compatibility =
            calculateCompatibility(
              tool,
              answers,
              needsProfile
            );


          const businessScore =
            calculateBusinessScore(
              tool
            );


          const relevance =
            calculateWeightedNeedsCoverage(
              tool,
              needsProfile
            );


          const primaryRoleFit =
            0;


          return {

            ...tool,

            compatibility,

            businessScore,

            relevance,

            primaryRoleFit,

            hardFilterPassed,

            filterReason:
              hardFilterPassed
                ? null
                : "Escluso dai filtri iniziali."

          };

        })
        .filter(Boolean);


    /*
      Il ranking principale è USER-FIRST.

      Business Score non deve spostare
      significativamente strumenti con
      compatibilità diversa.

      Viene usato solo come tie-break.
    */

    results.sort(
      function (a, b) {

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
          relevanceDifference !== 0
        ) {

          return relevanceDifference;
        }


        const businessA =
          a.businessScore === null
            ? -1
            : a.businessScore;


        const businessB =
          b.businessScore === null
            ? -1
            : b.businessScore;


        return (
          businessB -
          businessA
        );

      }
    );


    return results;
  }


  /* =========================================================
     25. REASONS
     ========================================================= */

  function buildToolReasons(
    tool,
    answers,
    needsProfile
  ) {

    const reasons = [];


    NEEDS.forEach(
      function (need) {

        const required =
          Number(
            needsProfile[need] || 0
          );

        const capability =
          Number(
            tool.needs &&
            tool.needs[need] || 0
          );

        if (
          required >= 60 &&
          capability >= 60
        ) {

          reasons.push(
            NEED_LABELS[need]
          );

        }

      }
    );


    return reasons
      .slice(0, 6);
  }


  /* =========================================================
     26. REDUNDANCY
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


    let overlap = 0;
    let weight = 0;


    NEEDS.forEach(
      function (need) {

        const required =
          Number(
            needsProfile[need] || 0
          );

        if (
          required <= 0
        ) {
          return;
        }


        const a =
          Number(
            toolA.needs &&
            toolA.needs[need] || 0
          );

        const b =
          Number(
            toolB.needs &&
            toolB.needs[need] || 0
          );


        const shared =
          Math.min(
            a,
            b
          );


        overlap +=
          shared *
          required;

        weight +=
          required;

      }
    );


    if (
      !weight
    ) {
      return 0;
    }


    let score =
      overlap /
      weight *
      100;


    const categoryA =
      normalizeText(
        toolA.category || ""
      );

    const categoryB =
      normalizeText(
        toolB.category || ""
      );


    if (
      categoryA &&
      categoryB &&
      categoryA === categoryB
    ) {

      score +=
        CONFIG.CATEGORY_REDUNDANCY_PENALTY;

    }


    if (
      categoryA &&
      categoryB &&
      categoryA === categoryB &&
      score >= 70
    ) {

      score +=
        CONFIG.STRONG_CATEGORY_REDUNDANCY_PENALTY;

    }


    return clamp(
      score,
      0,
      100
    );
  }


  /* =========================================================
     27. NEW COVERAGE
     ========================================================= */

  function calculateNewCoverage(
    candidate,
    currentStack,
    needsProfile
  ) {

    if (
      !candidate
    ) {
      return 0;
    }


    if (
      !currentStack ||
      !currentStack.length
    ) {

      return calculateWeightedNeedsCoverage(
        candidate,
        needsProfile
      );
    }


    let total = 0;
    let weight = 0;


    NEEDS.forEach(
      function (need) {

        const required =
          Number(
            needsProfile[need] || 0
          );

        if (
          required <= 0
        ) {
          return;
        }


        let current =
          0;


        currentStack.forEach(
          function (tool) {

            current =
              Math.max(
                current,
                Number(
                  tool.needs &&
                  tool.needs[need] || 0
                )
              );

          }
        );


        const candidateCapability =
          Number(
            candidate.needs &&
            candidate.needs[need] || 0
          );


        const improvement =
          Math.max(
            0,
            candidateCapability -
            current
          );


        total +=
          improvement *
          required;

        weight +=
          required;

      }
    );


    if (
      !weight
    ) {
      return 0;
    }


    return clamp(
      total /
      weight,
      0,
      100
    );
  }


  /* =========================================================
     28. STACK BUILDING
     ========================================================= */

  function buildStack(
    rankedTools,
    answers,
    needsProfile,
    dominantRole
  ) {

    const primary =
      choosePrimary(
        rankedTools,
        answers,
        needsProfile,
        dominantRole
      );


    if (!primary) {
      return [];
    }


    primary.role =
      "primary";


    const stack = [
      primary
    ];


    /*
      Massimo strumenti configurato.
    */

    while (
      stack.length <
      CONFIG.MAX_STACK_TOOLS
    ) {

      let bestCandidate =
        null;

      let bestScore =
        -Infinity;


      rankedTools.forEach(
        function (candidate) {

          if (
            !candidate ||
            candidate.id === primary.id
          ) {
            return;
          }


          if (
            stack.some(
              function (tool) {
                return tool.id === candidate.id;
              }
            )
          ) {
            return;
          }


          if (
            candidate.hardFilterPassed === false
          ) {
            return;
          }


          const newCoverage =
            calculateNewCoverage(
              candidate,
              stack,
              needsProfile
            );


          const redundancy =
            stack.reduce(
              function (total, tool) {

                return total +
                  calculateRedundancy(
                    candidate,
                    tool,
                    needsProfile
                  );

              },
              0
            );


          if (
            redundancy >
            CONFIG.MAX_REDUNDANCY_PENALTY
          ) {
            return;
          }


          const gapImprovement =
            calculateStackGapImprovement(
              candidate,
              stack,
              needsProfile
            );


          const complementaryCapability =
            calculateComplementaryCapability(
              candidate,
              stack,
              needsProfile
            );


          /*
            Se il Primary ha una lacuna
            importante, il complementare deve
            migliorare realmente quella lacuna.
          */

          const primaryGaps =
            getPrimaryGaps(
              primary,
              needsProfile
            );


          if (
            primaryGaps.length
          ) {

            if (
              gapImprovement <
              CONFIG.MIN_GAP_IMPROVEMENT
            ) {
              return;
            }

          } else {

            /*
              Se il Primary è già sufficiente,
              aggiungiamo un tool solo quando
              porta copertura realmente nuova.
            */

            if (
              newCoverage <
              CONFIG.MIN_COMPLEMENTARY_COVERAGE
            ) {
              return;
            }

          }


          if (
            newCoverage <
            CONFIG.MIN_COMPLEMENTARY_COVERAGE &&
            gapImprovement <
            CONFIG.MIN_GAP_IMPROVEMENT
          ) {
            return;
          }


          const integrations =
            integrationBonus(
              candidate,
              stack
            );


          const existingBonus =
            calculatePreserveBonus(
              candidate,
              answers
            );


          const score =
            gapImprovement * 0.40 +

            newCoverage * 0.25 +

            Number(
              candidate.compatibility || 0
            ) * 0.15 +

            complementaryCapability * 0.10 +

            integrations * 0.05 +

            existingBonus * 0.05 -

            redundancy * 0.80;


          if (
            score >
            bestScore
          ) {

            bestScore =
              score;

            bestCandidate = {
              ...candidate,

              role:
                "complementary",

              newCoverage:
                Math.round(
                  newCoverage
                ),

              stackGapImprovement:
                Math.round(
                  gapImprovement
                ),

              complementaryCapability:
                Math.round(
                  complementaryCapability
                ),

              stackScore:
                Math.round(
                  score
                ),

              redundancy:
                Math.round(
                  redundancy
                )
            };

          }

        }
      );


      if (
        !bestCandidate
      ) {
        break;
      }


      stack.push(
        bestCandidate
      );

    }


    return stack;
  }
  /* =========================================================
     30. MISSING NEEDS
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
     31. VALUE OF TIME
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
     32. AUTOMATION IDEAS
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
     33. STACK EXPLANATION
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
        " è la soluzione con la compatibilità generale più alta per il tuo profilo."
      );
    }


    const labels =
      important.map(function (need) {
        return NEED_LABELS[need]
          .toLowerCase();
      });


    return (
      tool.name +
      " è stato scelto come soluzione principale perché copre soprattutto " +
      joinItalian(labels) +
      "."
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
        .slice(0, 3);


    if (!covered.length) {
      return (
        tool.name +
        " completa lo stack senza aggiungere una forte sovrapposizione."
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
     34. MAIN ANALYSIS
     ========================================================= */

  function analyzeAnswers(
    answers,
    aiProfile
  ) {

    answers = answers || {};
    /*
      2. Ranking completo.
    */

    let rankedTools =
      rankTools(
        answers,
        profile
      );


    /*
      3. Se gli hard filter eliminano tutto,
         facciamo un fallback controllato.
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
        .filter(function (tool) {

          /*
            Se è nello stack non lo mostriamo
            anche nella lista "altri".
          */

          return true;

        })
        .slice(0, 15);


    /*
      12. Coverage totale dello stack.
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
      13. Qualità complessiva stack.
    */

    const stackCompatibility =
      stack.length
        ? Math.round(
            (
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
              stack.length
            ) * 10
          ) / 10
        : 0;


    return {

      version:
        CONFIG.VERSION,

      profile,

      answers,

      rankedTools:
        finalRanking,

      ranking:
        finalRanking,

      stack,

      primaryTool,

      primary:
        primaryTool,

      stackCompatibility,

      stackCoverage,

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
          finalRanking.some(
            function (tool) {

              return (
                tool.businessScore !== null
              );

            }
          ),

        note:
          "Il Business Score non modifica la compatibilità dell'utente e viene utilizzato solo come tie-break quando la compatibilità è molto vicina."

      }

    };

  }


  /* =========================================================
     35. HELPERS PUBBLICI
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
     36. API PUBBLICA
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

    passesTeamFilter,

    passesBudgetFilter

  };


  /* =========================================================
     37. GLOBAL
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
