/* =========================================================
   PROJECT-X — DECISION ENGINE
   Versione 1.2.0

   Obiettivi:
   - interpretare i bisogni dell'utente
   - applicare hard filters reali
   - calcolare Compatibility Score
   - separare User Compatibility e Business Score
   - valorizzare ecosistema e integrazioni
   - evitare strumenti ridondanti
   - costruire Primary + Complementary Stack
   - spiegare le scelte
   - stimare il valore potenziale del tempo recuperabile
   - generare automazioni suggerite

   Compatibile con:
   - database.js
   - index.html PROJECT-X
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
     2. CONFIG
     ========================================================= */

  const CONFIG = {
    VERSION: "1.2.0",

    MAX_STACK_TOOLS: 4,

    MIN_PRIMARY_COMPATIBILITY: 50,
    MIN_COMPLEMENTARY_COVERAGE: 18,

    MAX_REDUNDANCY_PENALTY: 30,
    CATEGORY_REDUNDANCY_PENALTY: 14,
    STRONG_CATEGORY_REDUNDANCY_PENALTY: 20,

    EXISTING_TOOL_MAX_BONUS: 15,
    PRESERVE_TOOL_MAX_BONUS: 15,
    INTEGRATION_MAX_BONUS: 10,

    COMPATIBILITY_TIE_THRESHOLD: 3,

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

    BUSINESS_WEIGHTS: {
      commission: 25,
      recurring: 25,
      conversion: 20,
      productPrice: 10,
      attribution: 10,
      marketSize: 5,
      reliability: 5
    },

    ENABLE_HARD_FILTERS: true,

    /*
      IMPORTANTE:
      Il fallback non deve mai trasformare un tool
      esplicitamente incompatibile in una raccomandazione.
    */
    ALLOW_SOFT_FALLBACK: false,

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

  function uniqueArray(array) {
    return [...new Set((array || []).filter(Boolean))];
  }

  function toArray(value) {
    if (Array.isArray(value)) {
      return value;
    }

    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
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
     4. DATABASE
     ========================================================= */

  function normalizeToolNeed(value) {
    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      return 0;
    }

    const n = Number(value);

    if (!Number.isFinite(n)) {
      return 0;
    }

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

      id: String(
        tool.id ||
        tool.name ||
        ""
      ).trim(),

      name: String(
        tool.name ||
        tool.id ||
        "Strumento"
      ).trim(),

      category: String(
        tool.category || ""
      ).trim(),

      description: String(
        tool.description || ""
      ).trim(),

      pricingUrl:
        tool.pricingUrl || "",

      affiliateUrl:
        tool.affiliateUrl || "",

      needs: {},

      team:
        toArray(tool.team),

      tech:
        toArray(tool.tech),

      automation:
        toArray(tool.automation),

      integrations:
        toArray(tool.integrations),

      countries:
        toArray(
          tool.countries ||
          tool.country
        ),

      languages:
        toArray(
          tool.languages ||
          tool.language
        )
    };

    NEEDS.forEach(function (need) {
      normalized.needs[need] =
        normalizeToolNeed(
          tool.needs
            ? tool.needs[need]
            : 0
        );
    });

    return normalized;
  }

  function getDatabase() {
    if (
      typeof window !== "undefined" &&
      Array.isArray(
        window.SOFTWARE_DATABASE
      )
    ) {
      return window.SOFTWARE_DATABASE
        .map(normalizeTool)
        .filter(Boolean);
    }

    if (
      typeof SOFTWARE_DATABASE !== "undefined" &&
      Array.isArray(
        SOFTWARE_DATABASE
      )
    ) {
      return SOFTWARE_DATABASE
        .map(normalizeTool)
        .filter(Boolean);
    }

    return [];
  }

  /* =========================================================
     5. GOAL INTERPRETATION
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

    Object.keys(
      GOAL_KEYWORDS
    ).forEach(function (need) {
      GOAL_KEYWORDS[need]
        .forEach(function (keyword) {
          if (
            text.includes(
              normalizeText(keyword)
            )
          ) {
            result[need] =
              Math.max(
                result[need],
                80
              );
          }
        });
    });

    return result;
  }

  /* =========================================================
     6. PAIN POINT
     ========================================================= */

  function interpretPainPoint(
    painPoint
  ) {
    const text =
      normalizeText(
        painPoint
      );

    const result = {};

    NEEDS.forEach(function (need) {
      result[need] = 0;
    });

    function boost(
      need,
      value
    ) {
      result[need] =
        Math.max(
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
     7. AI + PROFILE
     ========================================================= */

  function buildNeedsProfile(
    answers,
    aiProfile
  ) {
    answers =
      answers || {};

    const goals =
      interpretGoals(
        answers.goals ||
        answers.obiettivi ||
        []
      );

    const pain =
      interpretPainPoint(
        answers.painPoint ||
        answers.biggestTimeWaster ||
        answers.problem ||
        answers.timeWaster ||
        ""
      );

    const profile = {};

    NEEDS.forEach(function (need) {
      profile[need] =
        Math.max(
          Number(goals[need] || 0),
          Number(pain[need] || 0),
          Number(
            aiProfile &&
            aiProfile[need]
              ? aiProfile[need]
              : 0
          )
        );
    });

    const automation =
      normalizeText(
        answers.automation ||
        answers.automationLevel ||
        ""
      );

    if (
      automation.includes("smart")
    ) {
      profile.automation =
        Math.max(
          profile.automation,
          75
        );
    }

    if (
      automation.includes("ai")
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
     8. TOOL ALIASES
     ========================================================= */

  const TOOL_ALIASES = {
    "microsoft 365": [
      "microsoft 365",
      "office 365",
      "m365",
      "office"
    ],

    outlook: [
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

    chatgpt: [
      "chatgpt",
      "openai"
    ],

    "monday.com": [
      "monday",
      "monday.com"
    ],

    clickup: [
      "clickup",
      "click up"
    ],

    pipedrive: [
      "pipedrive"
    ],

    hubspot: [
      "hubspot"
    ],

    make: [
      "make",
      "make.com",
      "integromat"
    ],

    zapier: [
      "zapier"
    ],

    shopify: [
      "shopify"
    ],

    woocommerce: [
      "woocommerce",
      "woo commerce"
    ]
  };

  function toolMentionedInText(
    toolName,
    text
  ) {
    const normalizedTool =
      normalizeText(
        toolName
      );

    const normalizedText =
      normalizeText(
        text
      );

    if (
      normalizedText.includes(
        normalizedTool
      )
    ) {
      return true;
    }

    const aliases =
      TOOL_ALIASES[
        toolName
      ] || [];

    return aliases.some(
      function (alias) {
        return normalizedText.includes(
          normalizeText(alias)
        );
      }
    );
  }

  function parseToolList(
    value
  ) {
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

  function getExistingTools(
    answers
  ) {
    answers =
      answers || {};

    return parseToolList(
      answers.existingTools ||
      answers.currentTools ||
      answers.toolsAlreadyUse ||
      answers.software ||
      ""
    );
  }

  function getPreservedTools(
    answers
  ) {
    answers =
      answers || {};

    return parseToolList(
      answers.doNotChange ||
      answers.doNotReplace ||
      answers.toolsToKeep ||
      answers.preserveTools ||
      ""
    );
  }

  function getExcludedTools(
    answers
  ) {
    answers =
      answers || {};

    return parseToolList(
      answers.excludedTools ||
      answers.notInterested ||
      answers.avoid ||
      answers.toolsToAvoid ||
      ""
    );
  }

  /* =========================================================
     9. EXISTING / PRESERVE
     ========================================================= */

  function existingToolBonus(
    tool,
    answers
  ) {
    const existing =
      getExistingTools(
        answers
      );

    if (!existing.length) {
      return 0;
    }

    const text =
      existing.join(" ");

    if (
      toolMentionedInText(
        tool.name,
        text
      )
    ) {
      return CONFIG
        .EXISTING_TOOL_MAX_BONUS;
    }

    const normalizedTool =
      normalizeText(
        tool.name
      );

    if (
      [
        "power automate",
        "microsoft 365",
        "outlook"
      ].includes(
        normalizedTool
      ) &&
      /microsoft 365|office 365|outlook|office/.test(
        normalizeText(text)
      )
    ) {
      return 10;
    }

    if (
      normalizedTool ===
        "google workspace" &&
      /google workspace|g suite|gsuite/.test(
        normalizeText(text)
      )
    ) {
      return 10;
    }

    if (
      normalizedTool ===
        "shopify" &&
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
      getPreservedTools(
        answers
      );

    if (!preserved.length) {
      return 0;
    }

    if (
      toolMentionedInText(
        tool.name,
        preserved.join(" ")
      )
    ) {
      return CONFIG
        .PRESERVE_TOOL_MAX_BONUS;
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

      if (
        requirement <= 0
      ) {
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
    let totalScore = 0;

    NEEDS.forEach(function (need) {
      const requirement =
        Number(
          needsProfile &&
          needsProfile[need]
            ? needsProfile[need]
            : 0
        );

      if (
        requirement <= 0
      ) {
        return;
      }

      const capability =
        Number(
          tool.needs[need] || 0
        );

      const fit =
        clamp(
          capability /
          Math.max(
            requirement,
            1
          ),
          0,
          1
        );

      totalWeight +=
        requirement;

      totalScore +=
        requirement * fit;
    });

    if (!totalWeight) {
      return 50;
    }

    return clamp(
      (
        totalScore /
        totalWeight
      ) * 100,
      0,
      100
    );
  }

  /* =========================================================
     11. TEAM
     ========================================================= */

  function normalizeAnswerTeam(
    team
  ) {
    const text =
      normalizeText(
        team
      );

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
      text === "50+" ||
      text.includes("50+")
    ) {
      return "50+";
    }

    return String(
      team || ""
    ).trim();
  }

  function passesTeamFilter(
    tool,
    answers
  ) {
    const rawTeam =
      answers &&
      (
        answers.team ||
        answers.teamSize ||
        ""
      );

    if (!rawTeam) {
      return true;
    }

    const wanted =
      normalizeText(
        normalizeAnswerTeam(
          rawTeam
        )
      );

    const available =
      (tool.team || [])
        .map(function (x) {
          return normalizeText(x);
        })
        .filter(Boolean);

    /*
      Se il database non dichiara
      alcun segmento, non inventiamo
      un'incompatibilità.
    */
    if (!available.length) {
      return true;
    }

    /*
      HARD FILTER REALE.
      Se il tool dichiara soltanto
      6–20 / 21–50 / 50+
      non è compatibile con Solo io.
    */
    return available.includes(
      wanted
    );
  }

  function teamScore(
    tool,
    team
  ) {
    if (!team) {
      return 75;
    }

    const wanted =
      normalizeText(
        normalizeAnswerTeam(
          team
        )
      );

    const available =
      (tool.team || [])
        .map(function (x) {
          return normalizeText(x);
        });

    if (!available.length) {
      return 75;
    }

    if (
      available.includes(
        wanted
      )
    ) {
      return 100;
    }

    return 40;
  }

  /* =========================================================
     12. TECH
     ========================================================= */

  function techScore(
    tool,
    tech
  ) {
    if (!tech) {
      return 75;
    }

    const wanted =
      normalizeText(
        tech
      );

    const available =
      (tool.tech || [])
        .map(function (x) {
          return normalizeText(x);
        });

    if (!available.length) {
      return 75;
    }

    if (
      available.includes(
        wanted
      )
    ) {
      return 100;
    }

    if (
      wanted.includes("base")
    ) {
      if (
        available.some(
          function (x) {
            return x.includes(
              "base"
            );
          }
        )
      ) {
        return 100;
      }

      if (
        available.some(
          function (x) {
            return x.includes(
              "medio"
            );
          }
        )
      ) {
        return 70;
      }

      return 50;
    }

    if (
      wanted.includes("medio")
    ) {
      if (
        available.some(
          function (x) {
            return x.includes(
              "medio"
            );
          }
        )
      ) {
        return 100;
      }

      if (
        available.some(
          function (x) {
            return x.includes(
              "avanz"
            );
          }
        )
      ) {
        return 75;
      }
    }

    if (
      wanted.includes("avanz")
    ) {
      return 100;
    }

    return 70;
  }

  /* =========================================================
     13. AUTOMATION
     ========================================================= */

  function automationScore(
    tool,
    automationLevel
  ) {
    if (!automationLevel) {
      return 75;
    }

    const wanted =
      normalizeText(
        automationLevel
      );

    const values =
      (tool.automation || [])
        .map(function (value) {
          if (
            typeof value ===
            "number"
          ) {
            return value;
          }

          const text =
            normalizeText(
              value
            );

          if (
            text.includes("ai")
          ) {
            return 90;
          }

          if (
            text.includes("smart")
          ) {
            return 75;
          }

          if (
            text.includes("semplic")
          ) {
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
      return Math.max.apply(
        null,
        values
      );
    }

    if (
      wanted.includes("smart")
    ) {
      return Math.min(
        100,
        Math.max.apply(
          null,
          values
        ) + 5
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

  function parseBudgetNumber(
    value
  ) {
    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      return null;
    }

    const text =
      normalizeText(
        value
      );

    if (
      text.includes("500+")
    ) {
      return 500;
    }

    const n =
      firstNumber(
        value
      );

    return Number.isFinite(n)
      ? n
      : null;
  }

  function getBudgetLimit(
    answers
  ) {
    return parseBudgetNumber(
      answers &&
      (
        answers.budget ||
        answers.monthlyBudget ||
        answers.maxBudget
      )
    );
  }

  function getToolMonthlyPrice(
    tool
  ) {
    const candidates = [
      tool.monthlyPrice,
      tool.priceMonthly,
      tool.price,
      tool.minMonthlyPrice,
      tool.startingPrice
    ];

    for (
      let i = 0;
      i < candidates.length;
      i++
    ) {
      const n =
        firstNumber(
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

  function toolHasFreePlan(
    tool
  ) {
    if (
      tool.freePlan === true ||
      tool.hasFreePlan === true
    ) {
      return true;
    }

    const text =
      normalizeText(
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

  function budgetScore(
    tool,
    answers
  ) {
    const budget =
      getBudgetLimit(
        answers
      );

    if (
      budget === null
    ) {
      return 75;
    }

    const price =
      getToolMonthlyPrice(
        tool
      );

    /*
      Il database attuale non
      contiene ancora prezzi completi.
      In quel caso il punteggio
      rimane neutrale.
    */
    if (
      price === null
    ) {
      if (
        budget <= 30 &&
        toolHasFreePlan(tool)
      ) {
        return 90;
      }

      return 75;
    }

    if (
      price <= budget
    ) {
      return 100;
    }

    if (
      budget > 0 &&
      price <= budget * 1.2
    ) {
      return 75;
    }

    if (
      budget > 0 &&
      price <= budget * 1.5
    ) {
      return 50;
    }

    return 20;
  }

  function passesBudgetFilter(
    tool,
    answers
  ) {
    const budget =
      getBudgetLimit(
        answers
      );

    if (
      budget === null
    ) {
      return true;
    }

    const price =
      getToolMonthlyPrice(
        tool
      );

    /*
      Senza prezzo nel database
      non inventiamo un'esclusione.
    */
    if (
      price === null
    ) {
      return true;
    }

    if (
      price <= budget
    ) {
      return true;
    }

    if (
      budget <= 30 &&
      toolHasFreePlan(tool)
    ) {
      return true;
    }

    /*
      Il 20% è una tolleranza
      soltanto quando il prezzo
      è realmente disponibile.
    */
    return (
      price <=
      budget * 1.2
    );
  }

  /* =========================================================
     15. COUNTRY / LANGUAGE
     ========================================================= */

  function getUserCountry(
    answers
  ) {
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

  function getUserLanguage(
    answers
  ) {
    return String(
      answers &&
      (
        answers.language ||
        answers.languages ||
        ""
      )
    ).trim();
  }

  function countryLanguageScore(
    tool,
    answers
  ) {
    const country =
      normalizeText(
        getUserCountry(
          answers
        )
      );

    const language =
      normalizeText(
        getUserLanguage(
          answers
        )
      );

    if (
      !country &&
      !language
    ) {
      return 75;
    }

    let score = 75;

    const countries =
      (tool.countries || [])
        .map(normalizeText);

    const languages =
      (tool.languages || [])
        .map(normalizeText);

    if (
      country &&
      countries.length
    ) {
      if (
        countries.includes(
          country
        ) ||
        countries.includes("all") ||
        countries.includes("worldwide")
      ) {
        score += 15;
      } else {
        score -= 30;
      }
    }

    if (
      language &&
      languages.length
    ) {
      if (
        languages.includes(
          language
        ) ||
        languages.includes("all")
      ) {
        score += 10;
      } else {
        score -= 15;
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
        getUserCountry(
          answers
        )
      );

    const language =
      normalizeText(
        getUserLanguage(
          answers
        )
      );

    if (
      !country &&
      !language
    ) {
      return true;
    }

    const countries =
      (tool.countries || [])
        .map(normalizeText);

    const languages =
      (tool.languages || [])
        .map(normalizeText);

    if (
      country &&
      countries.length
    ) {
      const ok =
        countries.includes(
          country
        ) ||
        countries.includes("all") ||
        countries.includes("worldwide");

      if (!ok) {
        return false;
      }
    }

    if (
      language &&
      languages.length
    ) {
      const ok =
        languages.includes(
          language
        ) ||
        languages.includes("all");

      if (!ok) {
        return false;
      }
    }

    return true;
  }

  /* =========================================================
     16. INTEGRATIONS
     ========================================================= */

  function integrationMatchScore(
    tool,
    answers
  ) {
    const existing =
      getExistingTools(
        answers
      );

    if (!existing.length) {
      return 50;
    }

    const existingText =
      normalizeText(
        existing.join(" ")
      );

    const integrations =
      (tool.integrations || [])
        .map(normalizeText);

    if (!integrations.length) {
      return 50;
    }

    let matches = 0;

    integrations.forEach(
      function (integration) {
        if (
          existingText.includes(
            integration
          )
        ) {
          matches++;
          return;
        }

        Object.keys(
          TOOL_ALIASES
        ).forEach(
          function (key) {
            const aliases =
              TOOL_ALIASES[key];

            const found =
              aliases.some(
                function (alias) {
                  return (
                    integration.includes(
                      normalizeText(
                        alias
                      )
                    ) &&
                    existingText.includes(
                      normalizeText(
                        alias
                      )
                    )
                  );
                }
              );

            if (found) {
              matches++;
            }
          }
        );
      }
    );

    if (!matches) {
      return 50;
    }

    return clamp(
      60 + matches * 15,
      0,
      100
    );
  }

  function calculateIntegrationBonus(
    tool,
    answers
  ) {
    const score =
      integrationMatchScore(
        tool,
        answers
      );

    if (
      score <= 50
    ) {
      return 0;
    }

    return clamp(
      (
        (score - 50) /
        50
      ) *
      CONFIG.INTEGRATION_MAX_BONUS,
      0,
      CONFIG.INTEGRATION_MAX_BONUS
    );
  }

  /* =========================================================
     17. SIMPLICITY
     ========================================================= */

  function simplicityScore(
    tool,
    answers
  ) {
    if (
      tool.simplicity !==
      undefined
    ) {
      const value =
        Number(
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

    const tech =
      normalizeText(
        answers &&
        (
          answers.tech ||
          answers.technicalLevel ||
          ""
        )
      );

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

    return score;
  }

  /* =========================================================
     18. SCALABILITY
     ========================================================= */

  function scalabilityScore(
    tool,
    answers
  ) {
    if (
      tool.scalability !==
      undefined
    ) {
      const value =
        Number(
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

    const team =
      normalizeText(
        answers &&
        (
          answers.team ||
          answers.teamSize ||
          ""
        )
      );

    if (
      team.includes("50")
    ) {
      return 90;
    }

    if (
      team.includes("solo")
    ) {
      return 70;
    }

    return 75;
  }

  /* =========================================================
     19. FUNCTIONALITY
     ========================================================= */

  function functionalityScore(
    tool,
    needsProfile
  ) {
    const weighted =
      calculateWeightedNeedsCoverage(
        tool,
        needsProfile
      );

    const activeNeeds =
      NEEDS.filter(
        function (need) {
          return (
            Number(
              needsProfile[need] || 0
            ) >= 40
          );
        }
      );

    if (!activeNeeds.length) {
      return 60;
    }

    let strongMatches = 0;

    activeNeeds.forEach(
      function (need) {
        if (
          Number(
            tool.needs[need] || 0
          ) >=
          Number(
            needsProfile[need] || 0
          )
        ) {
          strongMatches++;
        }
      }
    );

    const bonus =
      (
        strongMatches /
        activeNeeds.length
      ) * 15;

    return clamp(
      weighted * 0.85 +
      bonus,
      0,
      100
    );
  }

  /* =========================================================
     20. EXCLUDED TOOLS
     ========================================================= */

  function isExcluded(
    tool,
    answers
  ) {
    const excluded =
      getExcludedTools(
        answers
      );

    if (!excluded.length) {
      return false;
    }

    return toolMentionedInText(
      tool.name,
      excluded.join(" ")
    );
  }

  /* =========================================================
     21. HARD FILTERS
     ========================================================= */

  function passesHardFilters(
    tool,
    answers,
    needsProfile
  ) {
    if (
      !CONFIG.ENABLE_HARD_FILTERS
    ) {
      return {
        passed: true,
        reasons: []
      };
    }

    const reasons = [];

    if (
      isExcluded(
        tool,
        answers
      )
    ) {
      reasons.push(
        "Escluso esplicitamente dall'utente."
      );
    }

    /*
      TEAM = HARD CONSTRAINT
    */
    if (
      !passesTeamFilter(
        tool,
        answers
      )
    ) {
      reasons.push(
        "Non adatto alla dimensione del team indicata."
      );
    }

    /*
      BUDGET = HARD CONSTRAINT
      soltanto quando il database
      contiene un prezzo verificabile.
    */
    if (
      !passesBudgetFilter(
        tool,
        answers
      )
    ) {
      reasons.push(
        "Fuori dal budget indicato."
      );
    }

    if (
      !passesCountryLanguageFilter(
        tool,
        answers
      )
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
      Object.values(
        needsProfile || {}
      ).some(
        function (x) {
          return Number(x) >= 50;
        }
      )
    ) {
      reasons.push(
        "Rilevanza troppo bassa rispetto ai bisogni."
      );
    }

    return {
      passed:
        reasons.length === 0,

      reasons:
        reasons
    };
  }

  /* =========================================================
     22. COMPATIBILITY
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

    const weights =
      CONFIG.WEIGHTS;

    let score =
      coverageScore *
      (weights.needs / 100)

      +

      functionality *
      (weights.functionality / 100)

      +

      budget *
      (weights.budget / 100)

      +

      integrations *
      (weights.integrations / 100)

      +

      simplicity *
      (weights.simplicity / 100)

      +

      team *
      (weights.team / 100)

      +

      countryLanguage *
      (weights.countryLanguage / 100)

      +

      scalability *
      (weights.scalability / 100);

    score =
      score * 0.90 +
      automation * 0.10;

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

    score +=
      integrationBonus;

    /*
      Ulteriore protezione:
      un tool che non passa un hard
      filter non deve ricevere
      un punteggio artificiosamente alto.
    */
    const hard =
      passesHardFilters(
        tool,
        answers,
        needsProfile
      );

    if (
      !hard.passed
    ) {
      score = Math.min(
        score,
        20
      );
    }

    score =
      clamp(
        score,
        0,
        100
      );

    return {
      compatibility:
        Math.round(
          score * 10
        ) / 10,

      baseCompatibility:
        Math.round(
          score * 10
        ) / 10,

      factors: {
        needs:
          Math.round(
            coverageScore
          ),

        functionality:
          Math.round(
            functionality
          ),

        budget:
          Math.round(
            budget
          ),

        integrations:
          Math.round(
            integrations
          ),

        simplicity:
          Math.round(
            simplicity
          ),

        team:
          Math.round(
            team
          ),

        countryLanguage:
          Math.round(
            countryLanguage
          ),

        scalability:
          Math.round(
            scalability
          ),

        automation:
          Math.round(
            automation
          )
      },

      bonuses: {
        existing:
          existingBonus,

        preserved:
          preserveBonus,

        integrations:
          integrationBonus
      }
    };
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

    const valid =
      Object.values(
        values
      ).filter(
        function (x) {
          return x !== null;
        }
      );

    if (!valid.length) {
      return null;
    }

    let score = 0;
    let totalWeight = 0;

    Object.keys(
      CONFIG.BUSINESS_WEIGHTS
    ).forEach(
      function (key) {
        const value =
          values[key];

        if (
          value === null
        ) {
          return;
        }

        const weight =
          CONFIG.BUSINESS_WEIGHTS[
            key
          ];

        score +=
          value * weight;

        totalWeight +=
          weight;
      }
    );

    if (
      !totalWeight
    ) {
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
     24. TOOL REASONS
     ========================================================= */

  function buildToolReasons(
    tool,
    answers,
    needsProfile,
    compatibility
  ) {
    const reasons = [];

    const important =
      NEEDS
        .filter(
          function (need) {
            return Number(
              needsProfile[need] || 0
            ) >= 60;
          }
        )
        .sort(
          function (a, b) {
            return (
              Number(
                needsProfile[b] || 0
              ) -
              Number(
                needsProfile[a] || 0
              )
            );
          }
        )
        .slice(0, 3);

    important.forEach(
      function (need) {
        if (
          Number(
            tool.needs[need] || 0
          ) >= 60
        ) {
          reasons.push(
            "copre bene " +
            NEED_LABELS[
              need
            ].toLowerCase()
          );
        }
      }
    );

    if (
      compatibility.factors
        .integrations >= 75
    ) {
      reasons.push(
        "si integra bene con gli strumenti già utilizzati"
      );
    }

    if (
      compatibility.bonuses
        .existing > 0
    ) {
      reasons.push(
        "valorizza un ecosistema già presente"
      );
    }

    if (
      compatibility.factors
        .budget >= 90
    ) {
      reasons.push(
        "è coerente con il budget indicato"
      );
    }

    if (
      compatibility.factors
        .simplicity >= 85
    ) {
      reasons.push(
        "è relativamente semplice da adottare"
      );
    }

    if (
      compatibility.factors
        .automation >= 85
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

    return uniqueArray(
      reasons
    );
  }

  /* =========================================================
     25. RANKING
     ========================================================= */

  function rankTools(
    answers,
    needsProfile,
    options
  ) {
    answers =
      answers || {};

    needsProfile =
      needsProfile ||
      buildNeedsProfile(
        answers
      );

    options =
      options || {};

    const database =
      getDatabase();

    const ranked = [];

    database.forEach(
      function (rawTool) {
        const tool =
          normalizeTool(
            rawTool
          );

        if (!tool) {
          return;
        }

        const filters =
          passesHardFilters(
            tool,
            answers,
            needsProfile
          );

        /*
          REGOLA FONDAMENTALE:

          Un tool che non passa un
          hard filter NON entra nel
          ranking principale.

          Anche se includeFiltered
          viene richiesto, rimane
          marcato come escluso.
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
                Number(
                  coverage[need] || 0
                ) >=
                Math.max(
                  40,
                  Number(
                    needsProfile[need] ||
                    0
                  ) * 0.6
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
            compatibility
          );

        ranked.push({
          ...tool,

          compatibility:
            compatibility.compatibility,

          baseCompatibility:
            compatibility.baseCompatibility,

          compatibilityScore:
            compatibility.compatibility,

          businessScore:
            businessScore,

          businessScoreAvailable:
            businessScore !== null,

          compatibilityFactors:
            compatibility.factors,

          bonuses:
            compatibility.bonuses,

          coverage:
            coverage,

          coveredNeeds:
            coveredNeeds,

          relevance:
            relevance,

          newCoverage: 0,

          redundancyPenalty: 0,

          stackScore:
            compatibility.compatibility,

          role:
            "candidate",

          reasons:
            reasons,

          why:
            reasons,

          hardFilterPassed:
            filters.passed,

          hardFilterReasons:
            filters.reasons
        });
      }
    );

    ranked.sort(
      function (a, b) {
        /*
          Prima regola:
          tool compatibili prima
          di qualsiasi altro criterio.
        */
        if (
          a.hardFilterPassed !==
          b.hardFilterPassed
        ) {
          return a.hardFilterPassed
            ? -1
            : 1;
        }

        /*
          Compatibility dominante.
        */
        const difference =
          b.compatibility -
          a.compatibility;

        if (
          Math.abs(
            difference
          ) >
          CONFIG
            .COMPATIBILITY_TIE_THRESHOLD
        ) {
          return difference;
        }

        /*
          Business Score solo come
          tie-break tra compatibilità
          molto vicine.
        */
        if (
          a.businessScore !== null &&
          b.businessScore !== null
        ) {
          const businessDifference =
            b.businessScore -
            a.businessScore;

          if (
            Math.abs(
              businessDifference
            ) > 0.1
          ) {
            return businessDifference;
          }
        }

        if (
          b.relevance !==
          a.relevance
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
      }
    );

    ranked.forEach(
      function (tool, index) {
        tool.rank =
          index + 1;
      }
    );

    return ranked;
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

    let penalty = 0;

    const categoryA =
      normalizeText(
        toolA.category
      );

    const categoryB =
      normalizeText(
        toolB.category
      );

    if (
      categoryA &&
      categoryB &&
      categoryA === categoryB
    ) {
      penalty +=
        CONFIG
          .CATEGORY_REDUNDANCY_PENALTY;
    }

    let overlap = 0;
    let relevantNeeds = 0;

    NEEDS.forEach(
      function (need) {
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
            toolA.needs[need] ||
            0
          );

        const b =
          Number(
            toolB.needs[need] ||
            0
          );

        if (
          a >= 60 &&
          b >= 60
        ) {
          overlap++;
        }

        relevantNeeds++;
      }
    );

    if (
      relevantNeeds > 0
    ) {
      penalty +=
        (
          overlap /
          relevantNeeds
        ) *
        CONFIG
          .STRONG_CATEGORY_REDUNDANCY_PENALTY;
    }

    return Math.round(
      clamp(
        penalty,
        0,
        CONFIG
          .MAX_REDUNDANCY_PENALTY
      )
    );
  }

  /* =========================================================
     27. NEW COVERAGE
     ========================================================= */

  function calculateNewCoverage(
    candidate,
    selectedTools,
    needsProfile
  ) {
    let value = 0;

    NEEDS.forEach(
      function (need) {
        const required =
          Number(
            needsProfile[need] ||
            0
          );

        if (
          required < 40
        ) {
          return;
        }

        const candidateCoverage =
          Number(
            candidate.needs[need] ||
            0
          );

        if (
          candidateCoverage <= 0
        ) {
          return;
        }

        let alreadyCovered = 0;

        selectedTools.forEach(
          function (tool) {
            alreadyCovered =
              Math.max(
                alreadyCovered,
                Number(
                  tool.needs[need] ||
                  0
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

        value +=
          additional *
          (
            required /
            100
          );
      }
    );

    return Math.round(
      value * 10
    ) / 10;
  }

  /* =========================================================
     28. PRIMARY
     ========================================================= */

  function choosePrimary(
    rankedTools,
    answers,
    needsProfile
  ) {
    if (
      !rankedTools.length
    ) {
      return null;
    }

    /*
      SOLO TOOL COMPATIBILE.
      Non prendiamo mai il primo
      elemento filtrato.
    */
    const viable =
      rankedTools.filter(
        function (tool) {
          return (
            tool.hardFilterPassed === true &&
            tool.compatibility >=
            CONFIG
              .MIN_PRIMARY_COMPATIBILITY
          );
        }
      );

    if (
      viable.length
    ) {
      return viable[0];
    }

    /*
      Se non c'è nessun tool che
      supera la soglia, prendiamo
      comunque il migliore compatibile,
      ma SOLO se esiste.
    */
    const compatible =
      rankedTools.filter(
        function (tool) {
          return (
            tool.hardFilterPassed === true
          );
        }
      );

    return (
      compatible[0] ||
      null
    );
  }

  /* =========================================================
     29. STACK BUILDER
     ========================================================= */

  function buildStack(
    rankedTools,
    answers,
    needsProfile
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
        needsProfile
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
      SOLO TOOL CHE PASSANO
      TUTTI GLI HARD FILTER.
    */
    const candidates =
      rankedTools.filter(
        function (tool) {
          return (
            tool.id !==
              primary.id &&
            tool.name !==
              primary.name &&
            tool.hardFilterPassed === true
          );
        }
      );

    const selectedIds =
      new Set(
        stack.map(
          function (tool) {
            return tool.id;
          }
        )
      );

    while (
      stack.length <
      CONFIG.MAX_STACK_TOOLS
    ) {
      let bestCandidate =
        null;

      let bestScore =
        -Infinity;

      candidates.forEach(
        function (candidate) {
          if (
            selectedIds.has(
              candidate.id
            )
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
              function (
                total,
                selected
              ) {
                return (
                  total +
                  calculateRedundancy(
                    candidate,
                    selected,
                    needsProfile
                  )
                );
              },
              0
            );

          if (
            newCoverage <
            CONFIG
              .MIN_COMPLEMENTARY_COVERAGE
          ) {
            return;
          }

          if (
            redundancy >
            CONFIG
              .MAX_REDUNDANCY_PENALTY
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

          const score =
            candidate.compatibility *
              0.40 +

            newCoverage *
              0.40 +

            integrationBonus *
              0.10 +

            existingBonus *
              0.10 -

            redundancy *
              0.75;

          if (
            score >
            bestScore
          ) {
            bestScore =
              score;

            bestCandidate =
              candidate;

            bestCandidate.__newCoverage =
              newCoverage;

            bestCandidate.__redundancy =
              redundancy;

            bestCandidate.__stackScore =
              score;
          }
        }
      );

      if (
        !bestCandidate
      ) {
        break;
      }

      bestCandidate.role =
        "complementary";

      bestCandidate.newCoverage =
        bestCandidate
          .__newCoverage ||
        0;

      bestCandidate.redundancyPenalty =
        bestCandidate
          .__redundancy ||
        0;

      bestCandidate.stackScore =
        bestCandidate
          .__stackScore ||
        bestCandidate.compatibility;

      delete bestCandidate
        .__newCoverage;

      delete bestCandidate
        .__redundancy;

      delete bestCandidate
        .__stackScore;

      stack.push(
        bestCandidate
      );

      selectedIds.add(
        bestCandidate.id
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

    NEEDS.forEach(
      function (need) {
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

        (stack || [])
          .forEach(
            function (tool) {
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
            }
          );

        if (
          covered < 50
        ) {
          missing.push({
            id: need,
            need: need,
            label:
              NEED_LABELS[need],
            requested:
              Math.round(
                required
              ),
            covered:
              Math.round(
                covered
              ),
            gap:
              Math.round(
                required -
                covered
              )
          });
        }
      }
    );

    missing.sort(
      function (a, b) {
        return b.gap - a.gap;
      }
    );

    return missing;
  }

  /* =========================================================
     31. VALUE OF TIME
     ========================================================= */

  function estimateValue(
    answers
  ) {
    answers =
      answers || {};

    const hoursValue =
      answers.hours ||
      answers.hoursPerWeek ||
      answers.weeklyHours ||
      "<1";

    const hoursText =
      normalizeText(
        hoursValue
      );

    let weeklyHours = 0.5;

    if (
      hoursText.includes("15+")
    ) {
      weeklyHours = 18;
    } else if (
      hoursText.includes("8")
    ) {
      weeklyHours = 11.5;
    } else if (
      hoursText.includes("4")
    ) {
      weeklyHours = 5.5;
    } else if (
      hoursText.includes("1")
    ) {
      weeklyHours = 2;
    }

    const hourlyRaw =
      answers.hourValue ||
      answers.hourlyValue ||
      answers.valuePerHour ||
      "30";

    const hourlyText =
      normalizeText(
        hourlyRaw
      );

    let hourlyValue =
      firstNumber(
        hourlyRaw
      );

    if (
      hourlyText.includes("100")
    ) {
      hourlyValue = 100;
    }

    if (
      !Number.isFinite(
        hourlyValue
      )
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

    function has(
      need
    ) {
      return (
        Number(
          needsProfile[need] ||
          0
        ) >= 50
      );
    }

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

    return ideas.slice(
      0,
      5
    );
  }

  /* =========================================================
     33. STACK EXPLANATION
     ========================================================= */

  function joinItalian(
    items
  ) {
    if (
      !items.length
    ) {
      return "";
    }

    if (
      items.length === 1
    ) {
      return items[0];
    }

    if (
      items.length === 2
    ) {
      return (
        items[0] +
        " e " +
        items[1]
      );
    }

    return (
      items
        .slice(0, -1)
        .join(", ") +
      " e " +
      items[
        items.length - 1
      ]
    );
  }

  function buildPrimaryExplanation(
    tool,
    needsProfile
  ) {
    const important =
      NEEDS
        .filter(
          function (need) {
            return (
              Number(
                needsProfile[need] ||
                0
              ) >= 60 &&
              Number(
                tool.needs[need] ||
                0
              ) >= 60
            );
          }
        )
        .sort(
          function (a, b) {
            return (
              needsProfile[b] -
              needsProfile[a]
            );
          }
        )
        .slice(
          0,
          3
        );

    if (
      !important.length
    ) {
      return (
        tool.name +
        " è la soluzione con la compatibilità generale più alta per il tuo profilo."
      );
    }

    return (
      tool.name +
      " è stato scelto come soluzione principale perché copre soprattutto " +
      joinItalian(
        important.map(
          function (need) {
            return NEED_LABELS[
              need
            ].toLowerCase();
          }
        )
      ) +
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
        .filter(
          function (need) {
            const requirement =
              Number(
                needsProfile[need] ||
                0
              );

            if (
              requirement < 50
            ) {
              return false;
            }

            const current =
              stack
                .filter(
                  function (x) {
                    return (
                      x.id !==
                      tool.id
                    );
                  }
                )
                .reduce(
                  function (
                    max,
                    x
                  ) {
                    return Math.max(
                      max,
                      Number(
                        x.needs[need] ||
                        0
                      )
                    );
                  },
                  0
                );

            return (
              Number(
                tool.needs[need] ||
                0
              ) > current
            );
          }
        )
        .slice(
          0,
          3
        );

    if (
      !covered.length
    ) {
      return (
        tool.name +
        " completa lo stack senza aggiungere una forte sovrapposizione."
      );
    }

    return (
      tool.name +
      " completa lo stack soprattutto per " +
      joinItalian(
        covered.map(
          function (need) {
            return NEED_LABELS[
              need
            ].toLowerCase();
          }
        )
      ) +
      "."
    );
  }

  function explainStack(
    stack,
    needsProfile
  ) {
    if (
      !stack ||
      !stack.length
    ) {
      return [];
    }

    return stack.map(
      function (
        tool,
        index
      ) {
        if (
          index === 0
        ) {
          return {
            toolId:
              tool.id,

            toolName:
              tool.name,

            role:
              "primary",

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
          toolId:
            tool.id,

          toolName:
            tool.name,

          role:
            "complementary",

          title:
            "Strumento complementare",

          explanation:
            buildComplementaryExplanation(
              tool,
              stack,
              needsProfile
            )
        };
      }
    );
  }

  /* =========================================================
     34. MAIN ANALYSIS
     ========================================================= */

  function analyzeAnswers(
    answers,
    aiProfile
  ) {
    answers =
      answers || {};

    const profile =
      buildNeedsProfile(
        answers,
        aiProfile
      );

    /*
      SOLO TOOLS CHE PASSANO
      GLI HARD FILTER.
    */
    const rankedTools =
      rankTools(
        answers,
        profile
      );

    const stack =
      buildStack(
        rankedTools,
        answers,
        profile
      );

    const primaryTool =
      stack[0] ||
      null;

    if (
      primaryTool
    ) {
      primaryTool.role =
        "primary";
    }

    stack
      .slice(1)
      .forEach(
        function (tool) {
          tool.role =
            "complementary";
        }
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

    const automationSuggestions =
      automationIdeas(
        answers,
        profile,
        stack
      );

    const explanations =
      explainStack(
        stack,
        profile
      );

    /*
      IMPORTANTE:
      La lista finale contiene
      soltanto strumenti realmente
      compatibili.
    */
    const finalRanking =
      rankedTools
        .filter(
          function (tool) {
            return (
              tool.hardFilterPassed === true
            );
          }
        )
        .slice(
          0,
          15
        );

    const stackCoverage = {};

    NEEDS.forEach(
      function (need) {
        stackCoverage[need] =
          stack.reduce(
            function (
              max,
              tool
            ) {
              return Math.max(
                max,
                Number(
                  tool.needs[need] ||
                  0
                )
              );
            },
            0
          );
      }
    );

    const stackCompatibility =
      stack.length
        ? Math.round(
            (
              stack.reduce(
                function (
                  sum,
                  tool
                ) {
                  return (
                    sum +
                    Number(
                      tool.compatibility ||
                      0
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

      profile:
        profile,

      answers:
        answers,

      rankedTools:
        finalRanking,

      ranking:
        finalRanking,

      stack:
        stack,

      primaryTool:
        primaryTool,

      primary:
        primaryTool,

      stackCompatibility:
        stackCompatibility,

      stackCoverage:
        stackCoverage,

      missingNeeds:
        missingNeeds,

      valueEstimate:
        valueEstimate,

      value:
        valueEstimate,

      automationIdeas:
        automationSuggestions,

      automationSuggestions:
        automationSuggestions,

      explanations:
        explanations,

      filters: {
        hardFiltersEnabled:
          CONFIG
            .ENABLE_HARD_FILTERS,

        budget:
          getBudgetLimit(
            answers
          ),

        country:
          getUserCountry(
            answers
          ),

        language:
          getUserLanguage(
            answers
          ),

        excludedTools:
          getExcludedTools(
            answers
          ),

        existingTools:
          getExistingTools(
            answers
          ),

        preservedTools:
          getPreservedTools(
            answers
          )
      },

      business: {
        available:
          finalRanking.some(
            function (tool) {
              return (
                tool.businessScore !==
                null
              );
            }
          ),

        note:
          "Il Business Score non modifica la compatibilità dell'utente e viene utilizzato solo come tie-break quando la compatibilità è molto vicina."
      }
    };
  }

  /* =========================================================
     35. PUBLIC HELPERS
     ========================================================= */

  function getCoveredNeeds(
    stack
  ) {
    const covered =
      new Set();

    (stack || [])
      .forEach(
        function (tool) {
          NEEDS.forEach(
            function (need) {
              if (
                Number(
                  tool.needs &&
                  tool.needs[need]
                    ? tool.needs[need]
                    : 0
                ) >= 50
              ) {
                covered.add(
                  need
                );
              }
            }
          );
        }
      );

    return Array.from(
      covered
    );
  }

  function getNeedLabel(
    need
  ) {
    return (
      NEED_LABELS[need] ||
      need
    );
  }

  /* =========================================================
     36. PUBLIC API
     ========================================================= */

  const ProjectXEngine = {

    VERSION:
      CONFIG.VERSION,

    CONFIG:
      CONFIG,

    NEEDS:
      NEEDS,

    NEED_LABELS:
      NEED_LABELS,

    analyzeAnswers:
      analyzeAnswers,

    interpretGoals:
      interpretGoals,

    interpretPainPoint:
      interpretPainPoint,

    buildNeedsProfile:
      buildNeedsProfile,

    rankTools:
      rankTools,

    buildStack:
      buildStack,

    getMissingNeeds:
      getMissingNeeds,

    estimateValue:
      estimateValue,

    automationIdeas:
      automationIdeas,

    calculateCoverage:
      calculateCoverage,

    calculateRedundancy:
      calculateRedundancy,

    calculateBusinessScore:
      calculateBusinessScore,

    toolCompatibility:
      toolCompatibility,

    getExistingTools:
      getExistingTools,

    getPreservedTools:
      getPreservedTools,

    getExcludedTools:
      getExcludedTools,

    getCoveredNeeds:
      getCoveredNeeds,

    getNeedLabel:
      getNeedLabel,

    explainStack:
      explainStack,

    getDatabase:
      getDatabase,

    passesTeamFilter:
      passesTeamFilter,

    passesBudgetFilter:
      passesBudgetFilter,

    passesHardFilters:
      passesHardFilters
  };

  /* =========================================================
     37. GLOBAL
     ========================================================= */

  if (
    typeof window !==
    "undefined"
  ) {
    window.ProjectXEngine =
      ProjectXEngine;

    /*
      Compatibilità con il
      vecchio nome.
    */
    window.StackPilotEngine =
      ProjectXEngine;
  }

  console.log(
    "PROJECT-X Decision Engine v1.2.0 caricato correttamente."
  );

})();
