/* =========================================================
   PROJECT-X — DECISION ENGINE
   Versione 1.3.0
   ---------------------------------------------------------
   Obiettivo:
   - interpretare i bisogni dell'utente
   - applicare hard filters
   - calcolare Compatibility Score
   - calcolare Primary Role Fit
   - separare Business Score
   - valorizzare ecosistema e integrazioni
   - evitare strumenti ridondanti
   - costruire Primary + Complementary Stack
   - separare alternative e complementi
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
    MIN_NEW_COVERAGE: 12,

    /* V1.3:
       un complemento deve colmare una lacuna reale del Primary */
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

        if (
          text.includes(
            normalizeText(keyword)
          )
        ) {
          result[need] = Math.max(
            result[need],
            80
          );
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
      result[need] = Math.max(
        result[need],
        value
      );
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

  function buildNeedsProfile(
    answers,
    aiProfile
  ) {

    answers = answers || {};

    const goalsProfile =
      interpretGoals(
        answers.goals ||
        answers.obiettivi ||
        []
      );

    const painProfile =
      interpretPainPoint(
        answers.painPoint ||
        answers.biggestTimeWaster ||
        answers.problem ||
        answers.timeWaster ||
        ""
      );

    const profile = {};

    NEEDS.forEach(function (need) {

      const fromGoals =
        Number(
          goalsProfile[need] || 0
        );

      const fromPain =
        Number(
          painProfile[need] || 0
        );

      const fromAI =
        Number(
          aiProfile &&
          aiProfile[need]
            ? aiProfile[need]
            : 0
        );

      profile[need] = Math.max(
        fromGoals,
        fromPain,
        fromAI
      );

    });


    const automationMode =
      normalizeText(
        answers.automation ||
        answers.automationLevel ||
        ""
      );


    if (
      automationMode.includes("smart")
    ) {
      profile.automation =
        Math.max(
          profile.automation,
          75
        );
    }


    if (
      automationMode.includes("ai")
    ) {
      profile.automation =
        Math.max(
          profile.automation,
          90
        );

      profile.ai =
        Math.max(
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


  function toolMentionedInText(
    toolName,
    text
  ) {

    const normalizedTool =
      normalizeText(toolName);

    const normalizedText =
      normalizeText(text);

    if (
      normalizedText.includes(
        normalizedTool
      )
    ) {
      return true;
    }


    const aliases =
      TOOL_ALIASES[toolName] || [];


    return aliases.some(
      function (alias) {

        return normalizedText.includes(
          normalizeText(alias)
        );

      }
    );
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

  function existingToolBonus(
    tool,
    answers
  ) {

    const existingTools =
      getExistingTools(answers);


    if (!existingTools.length) {
      return 0;
    }


    const text =
      existingTools.join(" ");


    if (
      toolMentionedInText(
        tool.name,
        text
      )
    ) {
      return CONFIG.EXISTING_TOOL_MAX_BONUS;
    }


    const normalizedTool =
      normalizeText(tool.name);


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
      microsoftTools.includes(
        normalizedTool
      ) &&
      /microsoft 365|office 365|outlook|office/.test(
        normalizeText(text)
      )
    ) {
      return 10;
    }


    if (
      googleTools.includes(
        normalizedTool
      ) &&
      /google workspace|g suite|gsuite/.test(
        normalizeText(text)
      )
    ) {
      return 10;
    }


    if (
      shopifyTools.includes(
        normalizedTool
      ) &&
      /shopify/.test(
        normalizeText(text)
      )
    ) {
      return 10;
    }


    return 0;
  }


  function preserveExistingTools(
    tool,
    answers
  ) {

    const preserved =
      getPreservedTools(answers);


    if (!preserved.length) {
      return 0;
    }


    const text =
      preserved.join(" ");


    if (
      toolMentionedInText(
        tool.name,
        text
      )
    ) {
      return CONFIG.PRESERVE_TOOL_MAX_BONUS;
    }


    return 0;
  }


  /* =========================================================
     10. COVERAGE
     ========================================================= */

  function calculateCoverage(
    tool,
    needsProfile
  ) {

    const coverage = {};


    NEEDS.forEach(function (need) {

      const requirement =
        Number(
          needsProfile &&
          needsProfile[need]
            ? needsProfile[need]
            : 0
        );


      const capability =
        Number(
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


      coverage[need] =
        clamp(
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


  function calculateWeightedNeedsCoverage(
    tool,
    needsProfile
  ) {

    let totalWeight = 0;
    let weightedFit = 0;

    const profile =
      needsProfile || {};

    const needs =
      tool &&
      tool.needs
        ? tool.needs
        : {};


    NEEDS.forEach(function (need) {

      const requirement =
        Number(
          profile[need] || 0
        );

      const capability =
        Number(
          needs[need] || 0
        );


      if (requirement <= 0) {
        return;
      }


      const weight =
        requirement;


      const fit =
        clamp(
          capability /
          requirement,
          0,
          1
        );


      weightedFit +=
        fit * weight;


      totalWeight +=
        weight;

    });


    if (!totalWeight) {
      return 50;
    }


    return clamp(
      (
        weightedFit /
        totalWeight
      ) * 100,
      0,
      100
    );
  }


  /* =========================================================
     11. TEAM SCORE
     ========================================================= */

  function teamScore(
    tool,
    userTeam
  ) {

    const desired =
      normalizeText(
        userTeam
      );


    if (!desired) {
      return 75;
    }


    const toolTeam =
      toArray(tool && tool.team)
        .map(function (x) {
          return normalizeText(x);
        })
        .filter(Boolean);


    if (!toolTeam.length) {
      return 75;
    }


    if (
      toolTeam.includes(
        desired
      )
    ) {
      return 100;
    }


    const flexible =
      toolTeam.some(function (value) {

        return (
          value.includes("all") ||
          value.includes("any") ||
          value.includes("flexible") ||
          value.includes("enterprise")
        );

      });


    if (flexible) {
      return 90;
    }


    return 65;
  }


  /* =========================================================
     12. TECH SCORE
     ========================================================= */

  function techScore(
    tool,
    userTech
  ) {

    const desired =
      normalizeText(
        userTech
      );


    if (!desired) {
      return 70;
    }


    const toolTech =
      toArray(tool && tool.tech)
        .map(function (x) {
          return normalizeText(x);
        })
        .filter(Boolean);


    if (!toolTech.length) {
      if (
        desired.includes("base")
      ) {
        return 80;
      }

      if (
        desired.includes("avanz")
      ) {
        return 90;
      }

      return 70;
    }


    if (
      desired.includes("base")
    ) {

      if (
        toolTech.some(function (x) {
          return x.includes("base");
        })
      ) {
        return 100;
      }

      if (
        toolTech.some(function (x) {
          return x.includes("medio");
        })
      ) {
        return 70;
      }

      return 50;
    }


    if (
      desired.includes("medio")
    ) {

      if (
        toolTech.some(function (x) {
          return x.includes("medio");
        })
      ) {
        return 100;
      }

      if (
        toolTech.some(function (x) {
          return x.includes("avanz");
        })
      ) {
        return 75;
      }

      return 90;
    }


    if (
      desired.includes("avanz")
    ) {
      return 100;
    }


    return 70;
  }


  /* =========================================================
     13. AUTOMATION SCORE
     ========================================================= */

  function automationScore(
    tool,
    userAutomation
  ) {

    const values =
      toArray(
        tool && tool.automation
      );


    let score = 70;


    values.forEach(function (value) {

      const normalized =
        normalizeText(value);


      if (
        normalized.includes("ai")
      ) {
        score =
          Math.max(
            score,
            90
          );
      }


      if (
        normalized.includes("smart")
      ) {
        score =
          Math.max(
            score,
            75
          );
      }


      if (
        normalized.includes("simple")
      ) {
        score =
          Math.max(
            score,
            55
          );
      }

    });


    const desired =
      normalizeText(
        userAutomation
      );


    if (
      desired.includes("ai")
    ) {
      score =
        Math.max(
          score,
          90
        );
    }


    if (
      desired.includes("smart")
    ) {
      score =
        Math.max(
          score,
          80
        );
    }


    if (
      desired.includes("semplice")
    ) {
      score =
        Math.max(
          score,
          80
        );
    }


    return clamp(
      score,
      0,
      100
    );
  }


  /* =========================================================
     14. BUDGET
     ========================================================= */

  function parseBudgetNumber(
    value
  ) {

    if (
      value === null ||
      value === undefined
    ) {
      return null;
    }


    if (
      typeof value === "number"
    ) {
      return value;
    }


    const normalized =
      normalizeText(value);


    if (
      normalized.includes("500+")
    ) {
      return 500;
    }


    if (
      normalized.includes("0")
    ) {
      return 0;
    }


    const number =
      firstNumber(
        value
      );


    return number;
  }


  function getBudgetLimit(
    answers
  ) {

    answers = answers || {};


    return parseBudgetNumber(
      answers.budget ||
      answers.monthlyBudget ||
      answers.budgetMonthly ||
      ""
    );
  }


  function getToolMonthlyPrice(
    tool
  ) {

    if (!tool) {
      return null;
    }


    const candidates = [
      tool.monthlyPrice,
      tool.priceMonthly,
      tool.monthly,
      tool.price
    ];


    for (
      let i = 0;
      i < candidates.length;
      i++
    ) {

      const number =
        firstNumber(
          candidates[i]
        );


      if (
        number !== null
      ) {
        return number;
      }

    }


    return null;
  }


  function toolHasFreePlan(
    tool
  ) {

    if (!tool) {
      return false;
    }


    if (
      tool.free === true ||
      tool.hasFreePlan === true
    ) {
      return true;
    }


    const pricing =
      normalizeText(
        tool.pricing ||
        tool.pricingModel ||
        tool.description ||
        ""
      );


    return (
      pricing.includes("free") ||
      pricing.includes("gratis") ||
      pricing.includes("freemium")
    );
  }


  function budgetScore(
    tool,
    answers
  ) {

    const limit =
      getBudgetLimit(
        answers
      );


    if (
      limit === null
    ) {
      return 75;
    }


    const price =
      getToolMonthlyPrice(
        tool
      );


    if (
      price === null
    ) {

      if (
        limit <= 30 &&
        toolHasFreePlan(tool)
      ) {
        return 90;
      }

      return 75;
    }


    if (
      price <= limit
    ) {
      return 100;
    }


    if (
      limit <= 0
    ) {
      return toolHasFreePlan(tool)
        ? 100
        : 20;
    }


    const ratio =
      price / limit;


    if (
      ratio <= 1.2
    ) {
      return 85;
    }


    if (
      ratio <= 1.5
    ) {
      return 65;
    }


    if (
      ratio <= 2
    ) {
      return 40;
    }


    return 20;
  }


  /* =========================================================
     15. COUNTRY / LANGUAGE
     ========================================================= */

  function getUserCountry(
    answers
  ) {

    answers = answers || {};


    return normalizeText(
      answers.country ||
      answers.paese ||
      answers.userCountry ||
      "italy"
    );
  }


  function getUserLanguage(
    answers
  ) {

    answers = answers || {};


    return normalizeText(
      answers.language ||
      answers.lingua ||
      answers.userLanguage ||
      "italian"
    );
  }


  function countryLanguageScore(
    tool,
    answers
  ) {

    const country =
      getUserCountry(
        answers
      );

    const language =
      getUserLanguage(
        answers
      );


    const countries =
      toArray(
        tool &&
        tool.countries
      )
        .map(function (x) {
          return normalizeText(x);
        });


    const languages =
      toArray(
        tool &&
        tool.languages
      )
        .map(function (x) {
          return normalizeText(x);
        });


    let score = 75;


    if (
      countries.length
    ) {

      if (
        countries.some(function (x) {
          return (
            x === country ||
            x.includes(country) ||
            country.includes(x)
          );
        })
      ) {
        score += 15;
      } else {
        score -= 20;
      }

    }


    if (
      languages.length
    ) {

      if (
        languages.some(function (x) {
          return (
            x === language ||
            x.includes(language) ||
            language.includes(x)
          );
        })
      ) {
        score += 10;
      } else if (
        language.includes("ital")
      ) {
        score -= 10;
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
      getUserCountry(
        answers
      );

    const language =
      getUserLanguage(
        answers
      );


    const countries =
      toArray(
        tool &&
        tool.countries
      )
        .map(function (x) {
          return normalizeText(x);
        })
        .filter(Boolean);


    const languages =
      toArray(
        tool &&
        tool.languages
      )
        .map(function (x) {
          return normalizeText(x);
        })
        .filter(Boolean);


    if (
      countries.length
    ) {

      const countryMatch =
        countries.some(function (x) {

          return (
            x === country ||
            x.includes(country) ||
            country.includes(x) ||
            x === "all" ||
            x === "global"
          );

        });


      if (!countryMatch) {
        return false;
      }

    }


    if (
      languages.length
    ) {

      const languageMatch =
        languages.some(function (x) {

          return (
            x === language ||
            x.includes(language) ||
            language.includes(x) ||
            x === "all" ||
            x === "global"
          );

        });


      if (!languageMatch) {
        return false;
      }

    }


    return true;
  }
