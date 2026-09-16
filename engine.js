const PROJECTX_ENGINE_VERSION = "1.2.0";

/* ============================================================
   PROJECT-X — SOFTWARE DECISION ENGINE
   Versione 1.2.0

   Obiettivo:
   1. capire il problema dominante dell'utente
   2. scegliere il Primary più adatto
   3. identificare le lacune reali del Primary
   4. aggiungere complementi solo quando colmano una lacuna importante
   5. mantenere separate le alternative
   6. evitare stack pieni di strumenti che fanno la stessa cosa
   ============================================================ */

(function () {
  "use strict";

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

  const CONFIG = {
    VERSION: "1.2.0",

    MAX_STACK_TOOLS: 4,

    MIN_PRIMARY_COMPATIBILITY: 50,
    MIN_STACK_COMPATIBILITY: 55,

    MIN_COMPLEMENTARY_COVERAGE: 12,
    MIN_NEW_COVERAGE: 12,
    MIN_PRIMARY_GAP: 12,

    MAX_REDUNDANCY_PENALTY: 30,

    CATEGORY_REDUNDANCY_PENALTY: 18,
    STRONG_CATEGORY_REDUNDANCY_PENALTY: 24,
    VERY_HIGH_OVERLAP_PENALTY: 30,

    SAME_CATEGORY_OVERLAP_THRESHOLD: 0.55,

    MAX_SAME_CATEGORY_TOOLS: 1,

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

    STACK_WEIGHTS: {
      gapCoverage: 45,
      newCoverage: 25,
      compatibility: 15,
      integration: 5,
      existing: 5,
      categoryDiversity: 5
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
    ALLOW_SOFT_FALLBACK: true,

    DEFAULT_NEED_SCALE: 10
  };

  /* ============================================================
     UTILITY
     ============================================================ */

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
      .replace(/[^\w\s-]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function tokenize(value) {
    return uniqueArray(
      normalizeText(value)
        .split(/\s+/)
        .filter(Boolean)
    );
  }

  function uniqueArray(values) {
    return Array.from(new Set((values || []).filter(Boolean)));
  }

  function toArray(value) {
    if (Array.isArray(value)) {
      return value;
    }

    if (value === undefined || value === null || value === "") {
      return [];
    }

    return [value];
  }

  function firstNumber(value, fallback = 0) {
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }

    const match = String(value || "").match(/-?\d+(?:[.,]\d+)?/);

    if (!match) {
      return fallback;
    }

    const parsed = Number(match[0].replace(",", "."));

    return Number.isFinite(parsed) ? parsed : fallback;
  }

  function normalizeScore(value, fallback = 0) {
    if (value === undefined || value === null || value === "") {
      return fallback;
    }

    const n = firstNumber(value, fallback);

    if (n <= 1) {
      return clamp(n * 100, 0, 100);
    }

    return clamp(n, 0, 100);
  }

  /* ============================================================
     DATABASE
     ============================================================ */

  function getDatabase() {
    if (
      typeof window !== "undefined" &&
      window.SOFTWARE_DATABASE
    ) {
      return window.SOFTWARE_DATABASE;
    }

    if (
      typeof SOFTWARE_DATABASE !== "undefined"
    ) {
      return SOFTWARE_DATABASE;
    }

    return [];
  }

  function normalizeToolNeed(value) {
    const n = Number(value);

    if (!Number.isFinite(n)) {
      return 0;
    }

    if (n <= 10) {
      return clamp(n * 10, 0, 100);
    }

    return clamp(n, 0, 100);
  }

  function normalizeTool(raw) {
    const tool = raw || {};

    const normalizedNeeds = {};

    NEEDS.forEach(function (need) {
      normalizedNeeds[need] = normalizeToolNeed(
        tool.needs && tool.needs[need]
      );
    });

    return {
      ...tool,

      id:
        tool.id ||
        normalizeText(tool.name).replace(/\s+/g, "-"),

      name:
        tool.name ||
        tool.id ||
        "Software",

      category:
        tool.category ||
        "General",

      description:
        tool.description || "",

      pricingUrl:
        tool.pricingUrl ||
        tool.url ||
        "",

      affiliateUrl:
        tool.affiliateUrl ||
        tool.affiliate ||
        tool.pricingUrl ||
        tool.url ||
        "",

      needs: normalizedNeeds,

      team:
        tool.team || {},

      tech:
        tool.tech || {},

      automation:
        tool.automation || "simple",

      integrations:
        toArray(tool.integrations),

      countries:
        toArray(tool.countries),

      languages:
        toArray(tool.languages)
    };
  }

  function getNormalizedDatabase() {
    return getDatabase().map(normalizeTool);
  }

  /* ============================================================
     GOAL KEYWORDS
     ============================================================ */

  const GOAL_KEYWORDS = {
    crm: [
      "crm",
      "clienti",
      "cliente",
      "clientela",
      "contatti",
      "anagrafica",
      "gestione clienti",
      "relazioni clienti"
    ],

    automation: [
      "automatizzare",
      "automazione",
      "automazioni",
      "automatico",
      "automatizzare processi",
      "ridurre lavoro manuale",
      "processi manuali",
      "ripetitivo",
      "ripetitive"
    ],

    email: [
      "email",
      "mail",
      "newsletter",
      "posta",
      "email marketing",
      "comunicazioni"
    ],

    followup: [
      "follow up",
      "follow-up",
      "ricontattare",
      "ricontatti",
      "promemoria",
      "promemoria clienti",
      "solleciti",
      "sollecito",
      "ricordare"
    ],

    sales: [
      "vendite",
      "vendere",
      "sales",
      "commerciale",
      "lead",
      "leads",
      "pipeline",
      "opportunita",
      "opportunità"
    ],

    quotes: [
      "preventivi",
      "preventivo",
      "offerte",
      "offerta",
      "quotazioni",
      "quotation",
      "proposal",
      "proposte commerciali"
    ],

    excel: [
      "excel",
      "foglio",
      "fogli",
      "spreadsheet",
      "dati",
      "report",
      "reporting",
      "analisi dati",
      "dashboard dati"
    ],

    marketing: [
      "marketing",
      "pubblicita",
      "pubblicità",
      "ads",
      "social",
      "campagne",
      "acquisizione clienti",
      "brand"
    ],

    projects: [
      "progetti",
      "progetto",
      "task",
      "attivita",
      "attività",
      "lavori",
      "team",
      "collaborazione",
      "scadenze"
    ],

    documents: [
      "documenti",
      "documento",
      "pdf",
      "contratti",
      "contratto",
      "firme",
      "firma",
      "archivio"
    ],

    appointments: [
      "appuntamenti",
      "appuntamento",
      "prenotazioni",
      "prenotazione",
      "calendario",
      "agenda",
      "booking"
    ],

    ecommerce: [
      "ecommerce",
      "e-commerce",
      "negozio online",
      "shop online",
      "vendita online",
      "prodotti online"
    ],

    ai: [
      "ai",
      "intelligenza artificiale",
      "chatgpt",
      "gpt",
      "artificial intelligence",
      "generative ai"
    ]
  };

  /* ============================================================
     PAIN POINT RULES
     ============================================================ */

  const PAIN_RULES = [
    {
      regex: /\b(email|mail|posta elettronica|newsletter)\b/i,
      boosts: {
        email: 85,
        automation: 60
      }
    },

    {
      regex: /\b(clienti|cliente|crm|contatti|anagrafica)\b/i,
      boosts: {
        crm: 90
      }
    },

    {
      regex: /\b(follow[\s-]?up|ricontattare|ricontatti|promemoria|solleciti|sollecito)\b/i,
      boosts: {
        followup: 95,
        automation: 70,
        crm: 55
      }
    },

    {
      regex: /\b(preventivi|preventivo|offerte|offerta|proposal|quotazioni)\b/i,
      boosts: {
        quotes: 95,
        documents: 55,
        automation: 55
      }
    },

    {
      regex: /\b(vendite|vendita|sales|lead|leads|commerciale|pipeline)\b/i,
      boosts: {
        sales: 90,
        crm: 65,
        marketing: 60
      }
    },

    {
      regex: /\b(excel|foglio|fogli|spreadsheet|dati|report|reporting)\b/i,
      boosts: {
        excel: 95,
        automation: 65
      }
    },

    {
      regex: /\b(progetto|progetti|task|attivita|attività|lavori|team|scadenze)\b/i,
      boosts: {
        projects: 80
      }
    },

    {
      regex: /\b(appuntamenti|appuntamento|prenotazioni|prenotazione|calendario|agenda|booking)\b/i,
      boosts: {
        appointments: 90
      }
    },

    {
      regex: /\b(marketing|pubblicita|pubblicità|ads|campagne|social)\b/i,
      boosts: {
        marketing: 90
      }
    },

    {
      regex: /\b(documenti|documento|pdf|contratti|contratto|firma|firme)\b/i,
      boosts: {
        documents: 85
      }
    },

    {
      regex: /\b(ecommerce|e-commerce|negozio online|shop online|vendita online)\b/i,
      boosts: {
        ecommerce: 95
      }
    },

    {
      regex: /\b(ai|intelligenza artificiale|chatgpt|gpt)\b/i,
      boosts: {
        ai: 95,
        automation: 75
      }
    },

    {
      regex: /\b(manuale|manuali|ripetitivo|ripetitive|perdo tempo|perdere tempo|tempo perso|lavoro manuale)\b/i,
      boosts: {
        automation: 90
      }
    }
  ];

  /* ============================================================
     PROFILE
     ============================================================ */

  function buildGoalProfile(goalText) {
    const text = normalizeText(goalText);
    const profile = {};

    NEEDS.forEach(function (need) {
      profile[need] = 0;
    });

    if (!text) {
      return profile;
    }

    Object.keys(GOAL_KEYWORDS).forEach(function (need) {
      const keywords = GOAL_KEYWORDS[need] || [];

      keywords.forEach(function (keyword) {
        const normalizedKeyword = normalizeText(keyword);

        if (
          normalizedKeyword &&
          text.indexOf(normalizedKeyword) !== -1
        ) {
          profile[need] = Math.max(
            profile[need],
            80
          );
        }
      });
    });

    return profile;
  }

  function buildPainProfile(painText) {
    const text = String(painText || "");
    const profile = {};

    NEEDS.forEach(function (need) {
      profile[need] = 0;
    });

    if (!text) {
      return profile;
    }

    PAIN_RULES.forEach(function (rule) {
      if (rule.regex.test(text)) {
        Object.keys(rule.boosts).forEach(function (need) {
          profile[need] = Math.max(
            profile[need],
            rule.boosts[need]
          );
        });
      }
    });

    return profile;
  }

  function buildNeedsProfile(answers) {
    const input = answers || {};

    const goalText =
      input.goals ||
      input.goal ||
      input.objectives ||
      input.obiettivi ||
      "";

    const painText =
      input.painPoint ||
      input.pain ||
      input.problem ||
      input.problemi ||
      input.timeWasting ||
      "";

    const goalProfile = buildGoalProfile(goalText);
    const painProfile = buildPainProfile(painText);

    const profile = {};

    NEEDS.forEach(function (need) {
      profile[need] = Math.max(
        goalProfile[need] || 0,
        painProfile[need] || 0
      );
    });

    const automationLevel = normalizeText(
      input.automationLevel ||
      input.automation ||
      ""
    );

    if (
      automationLevel === "smart" ||
      automationLevel === "intelligente"
    ) {
      profile.automation = Math.max(
        profile.automation,
        75
      );
    }

    if (
      automationLevel === "ai" ||
      automationLevel === "avanzato ai"
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

  /* ============================================================
     ACTIVE NEEDS
     ============================================================ */

  function getActiveNeeds(needsProfile, threshold = 50) {
    return NEEDS.filter(function (need) {
      return Number(needsProfile[need] || 0) >= threshold;
    });
  }

  function getDominantNeeds(needsProfile) {
    return NEEDS
      .filter(function (need) {
        return Number(needsProfile[need] || 0) > 0;
      })
      .sort(function (a, b) {
        return (
          Number(needsProfile[b] || 0) -
          Number(needsProfile[a] || 0)
        );
      });
  }

  function getRequirement(needsProfile, need) {
    return clamp(
      Number(
        needsProfile &&
        needsProfile[need]
      ) || 0,
      0,
      100
    );
  }

  /* ============================================================
     ALIASES
     ============================================================ */

  const TOOL_ALIASES = {
    "microsoft 365": [
      "microsoft365",
      "office 365",
      "office365",
      "m365"
    ],

    outlook: [
      "microsoft outlook",
      "outlook mail"
    ],

    "power automate": [
      "powerautomate",
      "microsoft power automate",
      "power automate desktop"
    ],

    "google workspace": [
      "google",
      "workspace",
      "g suite",
      "gsuite"
    ],

    chatgpt: [
      "openai",
      "chat gpt"
    ],

    "monday.com": [
      "monday",
      "mondaycom"
    ],

    clickup: [
      "click up"
    ],

    pipedrive: [
      "pipedrive crm"
    ],

    hubspot: [
      "hub spot"
    ],

    make: [
      "make.com",
      "integromat"
    ],

    zapier: [
      "zapier automation"
    ],

    shopify: [
      "shopify ecommerce",
      "shopify e-commerce"
    ],

    woocommerce: [
      "woo commerce"
    ],

    salesforce: [
      "salesforce crm"
    ],

    freshsales: [
      "freshsales crm",
      "freshworks crm"
    ],

    "zoho crm": [
      "zoho",
      "zoho crm plus"
    ],

    activecampaign: [
      "active campaign"
    ],

    close: [
      "close crm"
    ],

    klaviyo: [
      "klaviyo email"
    ]
  };

  function canonicalToolName(value) {
    return normalizeText(value);
  }

  function toolMatchesName(tool, value) {
    if (!tool || !value) {
      return false;
    }

    const toolName = canonicalToolName(
      tool.name || tool.id
    );

    const target = canonicalToolName(value);

    if (!toolName || !target) {
      return false;
    }

    if (
      toolName === target ||
      toolName.indexOf(target) !== -1 ||
      target.indexOf(toolName) !== -1
    ) {
      return true;
    }

    const aliases =
      TOOL_ALIASES[toolName] || [];

    return aliases.some(function (alias) {
      const normalizedAlias =
        canonicalToolName(alias);

      return (
        normalizedAlias === target ||
        normalizedAlias.indexOf(target) !== -1 ||
        target.indexOf(normalizedAlias) !== -1
      );
    });
  }

  function getAnswerToolList(answers, keys) {
    const result = [];

    const input = answers || {};

    keys.forEach(function (key) {
      toArray(input[key]).forEach(function (item) {
        if (typeof item === "string") {
          result.push(item);
        } else if (
          item &&
          typeof item === "object"
        ) {
          result.push(
            item.name ||
            item.id ||
            item.value ||
            ""
          );
        }
      });
    });

    return uniqueArray(result);
  }

  function getExistingTools(answers) {
    return getAnswerToolList(
      answers,
      [
        "existingTools",
        "currentTools",
        "toolsAlreadyUse",
        "software",
        "strumentiEsistenti"
      ]
    );
  }

  function getPreservedTools(answers) {
    return getAnswerToolList(
      answers,
      [
        "doNotChange",
        "doNotReplace",
        "toolsToKeep",
        "preserveTools",
        "strumentiDaMantenere"
      ]
    );
  }

  function getExcludedTools(answers) {
    return getAnswerToolList(
      answers,
      [
        "excludedTools",
        "notInterested",
        "avoid",
        "toolsToAvoid",
        "strumentiDaEvitare"
      ]
    );
  }

  function isExistingTool(tool, answers) {
    const existing =
      getExistingTools(answers);

    return existing.some(function (name) {
      return toolMatchesName(tool, name);
    });
  }

  function isPreservedTool(tool, answers) {
    const preserved =
      getPreservedTools(answers);

    return preserved.some(function (name) {
      return toolMatchesName(tool, name);
    });
  }

  function isExcludedTool(tool, answers) {
    const excluded =
      getExcludedTools(answers);

    return excluded.some(function (name) {
      return toolMatchesName(tool, name);
    });
  }

  function calculateExistingBonus(tool, answers) {
    if (!isExistingTool(tool, answers)) {
      return 0;
    }

    return CONFIG.EXISTING_TOOL_MAX_BONUS;
  }

  function calculatePreservedBonus(tool, answers) {
    if (!isPreservedTool(tool, answers)) {
      return 0;
    }

    return CONFIG.PRESERVE_TOOL_MAX_BONUS;
  }

  /* ============================================================
     ECOSYSTEM
     ============================================================ */

  function detectEcosystems(answers) {
    const names = [
      ...getExistingTools(answers),
      ...getPreservedTools(answers)
    ]
      .map(canonicalToolName)
      .join(" ");

    return {
      microsoft:
        /microsoft|office 365|microsoft 365|outlook|power automate/.test(
          names
        ),

      google:
        /google|workspace|gmail/.test(
          names
        ),

      shopify:
        /shopify/.test(names),

      ecommerce:
        /shopify|woocommerce|ecommerce|e-commerce/.test(
          names
        )
    };
  }

  function calculateEcosystemBonus(tool, answers) {
    const ecosystems =
      detectEcosystems(answers);

    const name =
      canonicalToolName(
        tool.name || tool.id
      );

    let bonus = 0;

    if (
      ecosystems.microsoft &&
      (
        name.indexOf("microsoft") !== -1 ||
        name.indexOf("outlook") !== -1 ||
        name.indexOf("power automate") !== -1 ||
        name.indexOf("dynamics") !== -1
      )
    ) {
      bonus += 5;
    }

    if (
      ecosystems.google &&
      (
        name.indexOf("google") !== -1 ||
        name.indexOf("workspace") !== -1
      )
    ) {
      bonus += 5;
    }

    if (
      ecosystems.shopify &&
      name.indexOf("shopify") !== -1
    ) {
      bonus += 5;
    }

    return clamp(
      bonus,
      0,
      CONFIG.INTEGRATION_MAX_BONUS
    );
  }

  /* ============================================================
     COVERAGE
     ============================================================ */

  function calculateCoverage(
    requirement,
    capability
  ) {
    const req =
      Number(requirement) || 0;

    const cap =
      Number(capability) || 0;

    if (req <= 0) {
      return 0;
    }

    return clamp(
      Math.min(req, cap),
      0,
      100
    );
  }

  function calculateWeightedNeedsCoverage(
    tool,
    needsProfile
  ) {
    let weightedCoverage = 0;
    let totalWeight = 0;

    NEEDS.forEach(function (need) {
      const requirement =
        getRequirement(
          needsProfile,
          need
        );

      if (requirement <= 0) {
        return;
      }

      const capability =
        normalizeToolNeed(
          tool.needs &&
          tool.needs[need]
        );

      const fit =
        clamp(
          capability / requirement,
          0,
          1
        );

      weightedCoverage +=
        requirement * fit;

      totalWeight += requirement;
    });

    if (totalWeight <= 0) {
      return 50;
    }

    return clamp(
      (
        weightedCoverage /
        totalWeight
      ) * 100,
      0,
      100
    );
  }

  function getCoveredNeeds(
    tool,
    needsProfile,
    threshold = 50
  ) {
    return NEEDS.filter(function (need) {
      const requirement =
        getRequirement(
          needsProfile,
          need
        );

      if (requirement < threshold) {
        return false;
      }

      const capability =
        normalizeToolNeed(
          tool.needs &&
          tool.needs[need]
        );

      return capability >= threshold;
    });
  }

  /* ============================================================
     TEAM SCORE
     ============================================================ */

  function getTeamValue(answers) {
    const input = answers || {};

    return (
      input.teamSize ||
      input.team ||
      input.dimensioneTeam ||
      ""
    );
  }

  function teamScore(tool, answers) {
    const requested =
      normalizeText(
        getTeamValue(answers)
      );

    if (!requested) {
      return 75;
    }

    const team =
      tool.team || {};

    const exactValues = [
      team.size,
      team.teamSize,
      team.range,
      team.label
    ]
      .filter(Boolean)
      .map(normalizeText);

    if (
      exactValues.some(function (value) {
        return (
          value === requested ||
          value.indexOf(requested) !== -1 ||
          requested.indexOf(value) !== -1
        );
      })
    ) {
      return 100;
    }

    if (
      Array.isArray(team.flexible) &&
      team.flexible.some(function (value) {
        const normalized =
          normalizeText(value);

        return (
          normalized === requested ||
          normalized.indexOf(requested) !== -1 ||
          requested.indexOf(normalized) !== -1
        );
      })
    ) {
      return 90;
    }

    return 65;
  }

  /* ============================================================
     TECH SCORE
     ============================================================ */

  function getTechLevel(answers) {
    const input = answers || {};

    return normalizeText(
      input.techLevel ||
      input.tech ||
      input.technologyLevel ||
      ""
    );
  }

  function techScore(tool, answers) {
    const requested =
      getTechLevel(answers);

    if (!requested) {
      return 70;
    }

    const toolTech =
      normalizeText(
        tool.tech &&
        (
          tool.tech.level ||
          tool.tech.label ||
          tool.tech
        )
      );

    if (
      requested === "base" ||
      requested === "basic"
    ) {
      if (
        toolTech === "base" ||
        toolTech === "basic" ||
        toolTech === "semplice"
      ) {
        return 100;
      }

      if (
        toolTech === "medio" ||
        toolTech === "medium"
      ) {
        return 70;
      }

      return 50;
    }

    if (
      requested === "medio" ||
      requested === "medium"
    ) {
      if (
        toolTech === "medio" ||
        toolTech === "medium"
      ) {
        return 100;
      }

      if (
        toolTech === "avanzato" ||
        toolTech === "advanced"
      ) {
        return 75;
      }

      return 90;
    }

    if (
      requested === "avanzato" ||
      requested === "advanced"
    ) {
      return 100;
    }

    return 70;
  }

  /* ============================================================
     AUTOMATION SCORE
     ============================================================ */

  function automationScore(tool) {
    const value =
      tool.automation;

    if (
      typeof value === "number"
    ) {
      return clamp(
        value,
        0,
        100
      );
    }

    const normalized =
      normalizeText(value);

    if (
      normalized === "ai" ||
      normalized === "advanced ai"
    ) {
      return 90;
    }

    if (
      normalized === "smart" ||
      normalized === "intelligente"
    ) {
      return 75;
    }

    if (
      normalized === "simple" ||
      normalized === "semplice" ||
      normalized === "basic" ||
      normalized === "base"
    ) {
      return 55;
    }

    return 70;
  }

  /* ============================================================
     BUDGET
     ============================================================ */

  function parseBudgetNumber(value) {
    if (
      value === undefined ||
      value === null ||
      value === ""
    ) {
      return null;
    }

    if (
      typeof value === "number" &&
      Number.isFinite(value)
    ) {
      return value;
    }

    const text =
      normalizeText(value);

    if (
      text.indexOf("gratis") !== -1 ||
      text.indexOf("free") !== -1 ||
      text === "0"
    ) {
      return 0;
    }

    const match =
      String(value).match(
        /(\d+(?:[.,]\d+)?)/ 
      );

    if (!match) {
      return null;
    }

    const number =
      Number(
        match[1]
          .replace(/\./g, "")
          .replace(",", ".")
      );

    return Number.isFinite(number)
      ? number
      : null;
  }

  function getBudgetLimit(answers) {
    const input = answers || {};

    const raw =
      input.monthlyBudget ||
      input.budget ||
      input.budgetMonthly ||
      input.budgetMensile ||
      "";

    return parseBudgetNumber(raw);
  }

  function getToolMonthlyPrice(tool) {
    const pricing =
      tool.pricing ||
      tool.price ||
      tool.monthlyPrice ||
      tool.monthly_price;

    if (
      typeof pricing === "number" &&
      Number.isFinite(pricing)
    ) {
      return pricing;
    }

    if (
      pricing &&
      typeof pricing === "object"
    ) {
      return parseBudgetNumber(
        pricing.monthly ||
        pricing.month ||
        pricing.starting ||
        pricing.price
      );
    }

    return parseBudgetNumber(
      tool.monthlyPrice ||
      tool.priceMonthly ||
      tool.startingPrice
    );
  }

  function toolHasFreePlan(tool) {
    const pricingText =
      normalizeText(
        JSON.stringify(
          tool.pricing ||
          tool.price ||
          ""
        )
      );

    return (
      tool.free === true ||
      tool.freePlan === true ||
      pricingText.indexOf("free") !== -1 ||
      pricingText.indexOf("gratis") !== -1
    );
  }

  function budgetScore(tool, answers) {
    const limit =
      getBudgetLimit(answers);

    if (
      limit === null ||
      limit === undefined
    ) {
      return 75;
    }

    const price =
      getToolMonthlyPrice(tool);

    if (
      price === null ||
      price === undefined
    ) {
      if (limit <= 30 && toolHasFreePlan(tool)) {
        return 90;
      }

      return 75;
    }

    if (price <= limit) {
      if (price === 0) {
        return 100;
      }

      if (limit === 0) {
        return 50;
      }

      return 100;
    }

    if (
      limit > 0 &&
      price <= limit * 1.2
    ) {
      return 70;
    }

    if (
      limit > 0 &&
      price <= limit * 1.5
    ) {
      return 45;
    }

    return 20;
  }

  function passesBudgetFilter(tool, answers) {
    const limit =
      getBudgetLimit(answers);

    if (
      limit === null ||
      limit === undefined
    ) {
      return true;
    }

    const price =
      getToolMonthlyPrice(tool);

    if (
      price === null ||
      price === undefined
    ) {
      return (
        limit > 30 ||
        toolHasFreePlan(tool)
      );
    }

    if (price <= limit) {
      return true;
    }

    if (
      limit > 0 &&
      price <= limit * 1.2
    ) {
      return true;
    }

    return false;
  }

  /* ============================================================
     COUNTRY / LANGUAGE
     ============================================================ */

  function getUserCountry(answers) {
    const input = answers || {};

    return normalizeText(
      input.country ||
      input.paese ||
      input.userCountry ||
      "italy"
    );
  }

  function getUserLanguage(answers) {
    const input = answers || {};

    return normalizeText(
      input.language ||
      input.lang ||
      input.lingua ||
      "italian"
    );
  }

  function countryLanguageScore(tool, answers) {
    const country =
      getUserCountry(answers);

    const language =
      getUserLanguage(answers);

    let score = 75;

    const countries =
      toArray(tool.countries)
        .map(normalizeText);

    const languages =
      toArray(tool.languages)
        .map(normalizeText);

    if (countries.length) {
      if (
        countries.indexOf(country) !== -1 ||
        countries.indexOf("global") !== -1 ||
        countries.indexOf("worldwide") !== -1
      ) {
        score += 15;
      } else {
        score -= 30;
      }
    }

    if (languages.length) {
      if (
        languages.indexOf(language) !== -1 ||
        languages.indexOf("multi") !== -1 ||
        languages.indexOf("multilingual") !== -1 ||
        languages.indexOf("global") !== -1
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
      getUserCountry(answers);

    const language =
      getUserLanguage(answers);

    const countries =
      toArray(tool.countries)
        .map(normalizeText);

    const languages =
      toArray(tool.languages)
        .map(normalizeText);

    if (
      countries.length &&
      countries.indexOf(country) === -1 &&
      countries.indexOf("global") === -1 &&
      countries.indexOf("worldwide") === -1
    ) {
      return false;
    }

    if (
      languages.length &&
      languages.indexOf(language) === -1 &&
      languages.indexOf("multi") === -1 &&
      languages.indexOf("multilingual") === -1 &&
      languages.indexOf("global") === -1
    ) {
      return false;
    }

    return true;
  }

  /* ============================================================
     INTEGRATIONS
     ============================================================ */

  function integrationMatchScore(
    tool,
    answers
  ) {
    const existing =
      getExistingTools(answers);

    if (!existing.length) {
      return 50;
    }

    const integrations =
      toArray(tool.integrations)
        .map(normalizeText);

    if (!integrations.length) {
      return 50;
    }

    let matches = 0;

    existing.forEach(function (existingName) {
      const normalizedExisting =
        normalizeText(existingName);

      if (
        integrations.some(function (integration) {
          return (
            integration === normalizedExisting ||
            integration.indexOf(normalizedExisting) !== -1 ||
            normalizedExisting.indexOf(integration) !== -1
          );
        })
      ) {
        matches += 1;
      }
    });

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

    if (score <= 50) {
      return 0;
    }

    return clamp(
      (
        (score - 50) / 50
      ) * CONFIG.INTEGRATION_MAX_BONUS,
      0,
      CONFIG.INTEGRATION_MAX_BONUS
    );
  }

  /* ============================================================
     SIMPLICITY
     ============================================================ */

  function simplicityScore(
    tool,
    answers
  ) {
    if (
      typeof tool.simplicity === "number"
    ) {
      return clamp(
        tool.simplicity,
        0,
        100
      );
    }

    const tech =
      getTechLevel(answers);

    if (
      tech === "base" ||
      tech === "basic"
    ) {
      return 80;
    }

    if (
      tech === "avanzato" ||
      tech === "advanced"
    ) {
      return 90;
    }

    if (
      automationScore(tool) >= 80
    ) {
      return 80;
    }

    return 75;
  }

  /* ============================================================
     SCALABILITY
     ============================================================ */

  function scalabilityScore(
    tool,
    answers
  ) {
    if (
      typeof tool.scalability === "number"
    ) {
      return clamp(
        tool.scalability,
        0,
        100
      );
    }

    const team =
      normalizeText(
        getTeamValue(answers)
      );

    if (
      team.indexOf("50") !== -1 ||
      team.indexOf("+") !== -1
    ) {
      return 90;
    }

    if (
      team.indexOf("solo") !== -1 ||
      team.indexOf("solo io") !== -1
    ) {
      return 70;
    }

    return 75;
  }

  /* ============================================================
     FUNCTIONALITY
     ============================================================ */

  function functionalityScore(
    tool,
    needsProfile
  ) {
    const coverage =
      calculateWeightedNeedsCoverage(
        tool,
        needsProfile
      );

    const activeNeeds =
      getActiveNeeds(
        needsProfile,
        50
      );

    if (!activeNeeds.length) {
      return coverage;
    }

    let bonus = 0;

    activeNeeds.forEach(function (need) {
      const requirement =
        getRequirement(
          needsProfile,
          need
        );

      const capability =
        normalizeToolNeed(
          tool.needs &&
          tool.needs[need]
        );

      if (
        capability >= requirement
      ) {
        bonus += 1;
      }
    });

    bonus = Math.min(
      15,
      bonus * 3
    );

    return clamp(
      coverage * 0.85 +
      bonus,
      0,
      100
    );
  }

  /* ============================================================
     RELEVANCE
     ============================================================ */

  function calculateRelevance(
    tool,
    needsProfile
  ) {
    let total = 0;
    let weight = 0;

    NEEDS.forEach(function (need) {
      const requirement =
        getRequirement(
          needsProfile,
          need
        );

      if (requirement <= 0) {
        return;
      }

      const capability =
        normalizeToolNeed(
          tool.needs &&
          tool.needs[need]
        );

      total +=
        requirement *
        (capability / 100);

      weight += requirement;
    });

    if (!weight) {
      return 0;
    }

    return clamp(
      (total / weight) * 100,
      0,
      100
    );
  }

  /* ============================================================
     HARD FILTERS
     ============================================================ */

  function passesHardFilters(
    tool,
    answers,
    needsProfile
  ) {
    if (
      isExcludedTool(
        tool,
        answers
      )
    ) {
      return false;
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

    const activeNeeds =
      getActiveNeeds(
        needsProfile,
        50
      );

    if (activeNeeds.length) {
      const relevance =
        calculateRelevance(
          tool,
          needsProfile
        );

      if (relevance < 12) {
        return false;
      }
    }

    return true;
  }

  /* ============================================================
     COMPATIBILITY
     ============================================================ */

  function calculateCompatibility(
    tool,
    answers,
    needsProfile
  ) {
    const coverage =
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
        answers
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
      coverage *
        (CONFIG.WEIGHTS.needs / 100) +

      functionality *
        (CONFIG.WEIGHTS.functionality / 100) +

      budget *
        (CONFIG.WEIGHTS.budget / 100) +

      integrations *
        (CONFIG.WEIGHTS.integrations / 100) +

      simplicity *
        (CONFIG.WEIGHTS.simplicity / 100) +

      team *
        (CONFIG.WEIGHTS.team / 100) +

      countryLanguage *
        (CONFIG.WEIGHTS.countryLanguage / 100) +

      scalability *
        (CONFIG.WEIGHTS.scalability / 100);

    const automation =
      automationScore(tool);

    score =
      score * 0.90 +
      automation * 0.10;

    const existingBonus =
      calculateExistingBonus(
        tool,
        answers
      );

    const preservedBonus =
      calculatePreservedBonus(
        tool,
        answers
      );

    const integrationBonus =
      calculateIntegrationBonus(
        tool,
        answers
      );

    score +=
      existingBonus +
      preservedBonus +
      integrationBonus;

    score = clamp(
      score,
      0,
      100
    );

    return {
      compatibility: Math.round(score),

      factors: {
        coverage: Math.round(coverage),
        functionality: Math.round(functionality),
        budget: Math.round(budget),
        integrations: Math.round(integrations),
        simplicity: Math.round(simplicity),
        team: Math.round(team),
        countryLanguage: Math.round(countryLanguage),
        scalability: Math.round(scalability),
        automation: Math.round(automation)
      },

      bonuses: {
        existing: Math.round(existingBonus),
        preserved: Math.round(preservedBonus),
        integration: Math.round(integrationBonus)
      }
    };
  }

  /* ============================================================
     BUSINESS SCORE
     ============================================================ */

  function businessScore(tool) {
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
          business.commission
        ),

      recurring:
        normalizeScore(
          business.recurring
        ),

      conversion:
        normalizeScore(
          business.conversion
        ),

      productPrice:
        normalizeScore(
          business.productPrice
        ),

      attribution:
        normalizeScore(
          business.attribution
        ),

      marketSize:
        normalizeScore(
          business.marketSize
        ),

      reliability:
        normalizeScore(
          business.reliability
        )
    };

    let score =
      values.commission *
        (CONFIG.BUSINESS_WEIGHTS.commission / 100) +

      values.recurring *
        (CONFIG.BUSINESS_WEIGHTS.recurring / 100) +

      values.conversion *
        (CONFIG.BUSINESS_WEIGHTS.conversion / 100) +

      values.productPrice *
        (CONFIG.BUSINESS_WEIGHTS.productPrice / 100) +

      values.attribution *
        (CONFIG.BUSINESS_WEIGHTS.attribution / 100) +

      values.marketSize *
        (CONFIG.BUSINESS_WEIGHTS.marketSize / 100) +

      values.reliability *
        (CONFIG.BUSINESS_WEIGHTS.reliability / 100);

    return {
      score: Math.round(
        clamp(
          score,
          0,
          100
        )
      ),

      factors: values
    };
  }

  /* ============================================================
     REDUNDANCY
     ============================================================ */

  function calculateFunctionalOverlap(
    toolA,
    toolB,
    needsProfile
  ) {
    const relevantNeeds =
      getActiveNeeds(
        needsProfile,
        50
      );

    if (!relevantNeeds.length) {
      return 0;
    }

    let overlapping = 0;
    let considered = 0;

    relevantNeeds.forEach(function (need) {
      const capA =
        normalizeToolNeed(
          toolA.needs &&
          toolA.needs[need]
        );

      const capB =
        normalizeToolNeed(
          toolB.needs &&
          toolB.needs[need]
        );

      const requirement =
        getRequirement(
          needsProfile,
          need
        );

      if (
        requirement <= 0
      ) {
        return;
      }

      considered += 1;

      if (
        capA >= 60 &&
        capB >= 60
      ) {
        overlapping += 1;
      }
    });

    if (!considered) {
      return 0;
    }

    return clamp(
      overlapping / considered,
      0,
      1
    );
  }

  function calculateRedundancy(
    toolA,
    toolB,
    needsProfile
  ) {
    if (!toolA || !toolB) {
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

    const sameCategory =
      categoryA &&
      categoryB &&
      categoryA === categoryB;

    const overlap =
      calculateFunctionalOverlap(
        toolA,
        toolB,
        needsProfile
      );

    if (sameCategory) {
      penalty +=
        CONFIG.CATEGORY_REDUNDANCY_PENALTY;
    }

    if (
      overlap >= 0.80
    ) {
      penalty +=
        CONFIG.VERY_HIGH_OVERLAP_PENALTY;
    } else if (
      overlap >=
      CONFIG.SAME_CATEGORY_OVERLAP_THRESHOLD
    ) {
      penalty +=
        CONFIG.STRONG_CATEGORY_REDUNDANCY_PENALTY;
    } else {
      penalty +=
        overlap *
        CONFIG.STRONG_CATEGORY_REDUNDANCY_PENALTY;
    }

    return clamp(
      penalty,
      0,
      CONFIG.MAX_REDUNDANCY_PENALTY
    );
  }

  /* ============================================================
     NEW COVERAGE
     ============================================================ */

  function calculateNewCoverage(
    candidate,
    selectedTools,
    needsProfile
  ) {
    const selected =
      selectedTools || [];

    let weightedNew = 0;
    let totalWeight = 0;

    NEEDS.forEach(function (need) {
      const requirement =
        getRequirement(
          needsProfile,
          need
        );

      if (
        requirement <= 0
      ) {
        return;
      }

      const candidateCapability =
        normalizeToolNeed(
          candidate.needs &&
          candidate.needs[need]
        );

      let existingCapability = 0;

      selected.forEach(function (tool) {
        const capability =
          normalizeToolNeed(
            tool.needs &&
            tool.needs[need]
          );

        existingCapability =
          Math.max(
            existingCapability,
            capability
          );
      });

      const newCapability =
        Math.max(
          0,
          candidateCapability -
            existingCapability
        );

      weightedNew +=
        requirement *
        (
          newCapability / 100
        );

      totalWeight += requirement;
    });

    if (
      totalWeight <= 0
    ) {
      return 0;
    }

    return clamp(
      (
        weightedNew /
        totalWeight
      ) * 100,
      0,
      100
    );
  }

  /* ============================================================
     PRIMARY GAPS
     ============================================================ */

  function getPrimaryGapNeeds(
    primary,
    needsProfile
  ) {
    if (!primary) {
      return [];
    }

    return NEEDS
      .map(function (need) {
        const requirement =
          getRequirement(
            needsProfile,
            need
          );

        const capability =
          normalizeToolNeed(
            primary.needs &&
            primary.needs[need]
          );

        const gap =
          Math.max(
            0,
            requirement -
              capability
          );

        return {
          need,
          requirement,
          capability,
          gap
        };
      })
      .filter(function (item) {
        return (
          item.requirement >= 50 &&
          item.gap >=
            CONFIG.MIN_PRIMARY_GAP
        );
      })
      .sort(function (a, b) {
        return b.gap - a.gap;
      });
  }

  function calculateGapCoverage(
    candidate,
    selectedTools,
    needsProfile
  ) {
    const stack =
      selectedTools || [];

    const primary =
      stack[0];

    if (!primary) {
      return calculateNewCoverage(
        candidate,
        stack,
        needsProfile
      );
    }

    const gaps =
      getPrimaryGapNeeds(
        primary,
        needsProfile
      );

    if (!gaps.length) {
      return 0;
    }

    let total = 0;
    let weight = 0;

    gaps.forEach(function (gap) {
      const candidateCapability =
        normalizeToolNeed(
          candidate.needs &&
          candidate.needs[gap.need]
        );

      const covered =
        Math.min(
          gap.gap,
          candidateCapability
        );

      total +=
        gap.requirement *
        (
          covered /
          Math.max(
            1,
            gap.gap
          )
        );

      weight +=
        gap.requirement;
    });

    if (!weight) {
      return 0;
    }

    return clamp(
      (
        total /
        weight
      ) * 100,
      0,
      100
    );
  }

  /* ============================================================
     PRIMARY SELECTION
     ============================================================ */

  function choosePrimary(
    rankedTools,
    needsProfile
  ) {
    if (!rankedTools.length) {
      return null;
    }

    const dominant =
      getDominantNeeds(
        needsProfile
      );

    if (!dominant.length) {
      return rankedTools[0];
    }

    const candidates =
      rankedTools.filter(function (tool) {
        return (
          tool.compatibility >=
          CONFIG.MIN_PRIMARY_COMPATIBILITY
        );
      });

    if (!candidates.length) {
      return rankedTools[0];
    }

    let best =
      candidates[0];

    let bestPrimaryScore =
      -Infinity;

    candidates.forEach(function (tool) {
      let primaryScore =
        tool.compatibility * 0.70 +
        tool.relevance * 0.30;

      dominant
        .slice(0, 3)
        .forEach(function (need, index) {
          const capability =
            normalizeToolNeed(
              tool.needs &&
              tool.needs[need]
            );

          const weight =
            index === 0
              ? 0.18
              : index === 1
                ? 0.10
                : 0.05;

          primaryScore +=
            capability * weight;
        });

      if (
        primaryScore >
        bestPrimaryScore
      ) {
        bestPrimaryScore =
          primaryScore;

        best = tool;
      }
    });

    return best;
  }

  /* ============================================================
     STACK
     ============================================================ */

  function buildStack(
    rankedTools,
    primary,
    answers,
    needsProfile
  ) {
    if (!primary) {
      return [];
    }

    const stack = [
      {
        ...primary,
        role: "primary",
        stackScore:
          primary.compatibility,
        gapCoverage: 100,
        newCoverage: 100,
        redundancyPenalty: 0
      }
    ];

    const primaryGaps =
      getPrimaryGapNeeds(
        primary,
        needsProfile
      );

    /*
      REGOLA V1.2:

      Se il Primary copre già sufficientemente
      le esigenze importanti, NON costruiamo
      uno stack artificiale.

      Quindi Salesforce può rimanere da solo
      se CRM, vendite, automazioni, email,
      follow-up ecc. sono già adeguatamente
      coperti.
    */

    if (!primaryGaps.length) {
      return stack;
    }

    const candidates =
      rankedTools.filter(function (candidate) {
        if (
          candidate.id === primary.id
        ) {
          return false;
        }

        if (
          !passesHardFilters(
            candidate,
            answers,
            needsProfile
          )
        ) {
          return false;
        }

        return true;
      });

    while (
      stack.length <
        CONFIG.MAX_STACK_TOOLS
    ) {
      let bestCandidate = null;
      let bestScore = -Infinity;

      candidates.forEach(function (candidate) {
        if (
          stack.some(function (selected) {
            return (
              selected.id ===
              candidate.id
            );
          })
        ) {
          return;
        }

        const sameCategory =
          normalizeText(
            candidate.category
          ) ===
          normalizeText(
            primary.category
          );

        /*
          Alternative dello stesso ruolo:
          fuori dallo stack.

          Eccezione:
          se l'utente ha esplicitamente
          dichiarato di usare/conservare
          quel tool, possiamo mantenerlo.
        */

        if (
          sameCategory &&
          !isExistingTool(
            candidate,
            answers
          ) &&
          !isPreservedTool(
            candidate,
            answers
          )
        ) {
          return;
        }

        const gapCoverage =
          calculateGapCoverage(
            candidate,
            stack,
            needsProfile
          );

        const newCoverage =
          calculateNewCoverage(
            candidate,
            stack,
            needsProfile
          );

        /*
          Il complemento deve aggiungere
          una quantità significativa di
          copertura nuova.
        */

        if (
          gapCoverage <
          CONFIG.MIN_PRIMARY_GAP
        ) {
          return;
        }

        if (
          newCoverage <
          CONFIG.MIN_NEW_COVERAGE
        ) {
          return;
        }

        let redundancy = 0;

        stack.forEach(function (selected) {
          redundancy =
            Math.max(
              redundancy,
              calculateRedundancy(
                candidate,
                selected,
                needsProfile
              )
            );
        });

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
          calculateExistingBonus(
            candidate,
            answers
          );

        const categoryDiversity =
          sameCategory
            ? 0
            : 10;

        /*
          STACK SCORE V1.2

          45% = capacità di colmare
                una lacuna del Primary
          25% = nuova copertura
          15% = compatibilità generale
           5% = integrazione
           5% = strumento già utilizzato
           5% = diversità di categoria

          La ridondanza viene sottratta
          separatamente e con penalità forte.
        */

        const score =
          gapCoverage * 0.45 +
          newCoverage * 0.25 +
          candidate.compatibility * 0.15 +
          integrationBonus * 0.05 +
          existingBonus * 0.05 +
          categoryDiversity * 0.05 -
          redundancy * 0.80;

        if (
          score >
          bestScore
        ) {
          bestScore =
            score;

          bestCandidate = {
            ...candidate,
            role: "complementary",
            gapCoverage:
              Math.round(
                gapCoverage
              ),
            newCoverage:
              Math.round(
                newCoverage
              ),
            redundancyPenalty:
              Math.round(
                redundancy
              ),
            stackScore:
              Math.round(
                clamp(
                  score,
                  0,
                  100
                )
              )
          };
        }
      });

      if (!bestCandidate) {
        break;
      }

      stack.push(
        bestCandidate
      );
    }

    return stack;
  }

  /* ============================================================
     ALTERNATIVES
     ============================================================ */

  function getAlternatives(
    rankedTools,
    primary,
    needsProfile
  ) {
    if (!primary) {
      return [];
    }

    const primaryCategory =
      normalizeText(
        primary.category
      );

    return rankedTools
      .filter(function (tool) {
        if (
          tool.id === primary.id
        ) {
          return false;
        }

        const category =
          normalizeText(
            tool.category
          );

        if (
          category !==
          primaryCategory
        ) {
          return false;
        }

        return (
          tool.compatibility >=
          CONFIG.MIN_PRIMARY_COMPATIBILITY
        );
      })
      .slice(0, 6)
      .map(function (tool) {
        return {
          ...tool,
          role: "alternative"
        };
      });
  }

  function getComplementaryTools(
    rankedTools,
    stack,
    needsProfile
  ) {
    if (
      !stack ||
      !stack.length
    ) {
      return [];
    }

    const primary =
      stack[0];

    const primaryGaps =
      getPrimaryGapNeeds(
        primary,
        needsProfile
      );

    if (!primaryGaps.length) {
      return [];
    }

    return rankedTools
      .filter(function (tool) {
        if (
          stack.some(function (selected) {
            return (
              selected.id ===
              tool.id
            );
          })
        ) {
          return false;
        }

        const gapCoverage =
          calculateGapCoverage(
            tool,
            stack,
            needsProfile
          );

        const newCoverage =
          calculateNewCoverage(
            tool,
            stack,
            needsProfile
          );

        return (
          gapCoverage >=
            CONFIG.MIN_PRIMARY_GAP &&
          newCoverage >=
            CONFIG.MIN_NEW_COVERAGE
        );
      })
      .map(function (tool) {
        return {
          ...tool,
          role: "complementary-candidate",
          gapCoverage:
            Math.round(
              calculateGapCoverage(
                tool,
                stack,
                needsProfile
              )
            ),
          newCoverage:
            Math.round(
              calculateNewCoverage(
                tool,
                stack,
                needsProfile
              )
            )
        };
      })
      .slice(0, 10);
  }

  /* ============================================================
     STACK COVERAGE
     ============================================================ */

  function calculateStackCoverage(
    stack,
    needsProfile
  ) {
    const coverage = {};

    NEEDS.forEach(function (need) {
      let maxCapability = 0;

      (stack || []).forEach(function (tool) {
        const capability =
          normalizeToolNeed(
            tool.needs &&
            tool.needs[need]
          );

        maxCapability =
          Math.max(
            maxCapability,
            capability
          );
      });

      coverage[need] =
        Math.round(
          maxCapability
        );
    });

    return coverage;
  }

  function calculateTotalCoverage(
    stack,
    needsProfile
  ) {
    const coverage =
      calculateStackCoverage(
        stack,
        needsProfile
      );

    let weighted = 0;
    let total = 0;

    NEEDS.forEach(function (need) {
      const requirement =
        getRequirement(
          needsProfile,
          need
        );

      if (
        requirement <= 0
      ) {
        return;
      }

      const covered =
        clamp(
          Number(
            coverage[need]
          ) || 0,
          0,
          100
        );

      weighted +=
        requirement *
        Math.min(
          1,
          covered / requirement
        );

      total +=
        requirement;
    });

    if (!total) {
      return 0;
    }

    return Math.round(
      clamp(
        (
          weighted /
          total
        ) * 100,
        0,
        100
      )
    );
  }

  function calculateStackCompatibility(
    stack,
    needsProfile
  ) {
    if (
      !stack ||
      !stack.length
    ) {
      return 0;
    }

    const averageCompatibility =
      stack.reduce(
        function (sum, tool) {
          return (
            sum +
            Number(
              tool.compatibility
            || 0)
          );
        },
        0
      ) /
      stack.length;

    const totalCoverage =
      calculateTotalCoverage(
        stack,
        needsProfile
      );

    let redundancyPenalty = 0;

    for (
      let i = 0;
      i < stack.length;
      i += 1
    ) {
      for (
        let j = i + 1;
        j < stack.length;
        j += 1
      ) {
        redundancyPenalty =
          Math.max(
            redundancyPenalty,
            calculateRedundancy(
              stack[i],
              stack[j],
              needsProfile
            )
          );
      }
    }

    return Math.round(
      clamp(
        averageCompatibility * 0.55 +
        totalCoverage * 0.45 -
        redundancyPenalty * 0.25,
        0,
        100
      )
    );
  }

  /* ============================================================
     MISSING NEEDS
     ============================================================ */

  function getMissingNeeds(
    stack,
    needsProfile
  ) {
    const coverage =
      calculateStackCoverage(
        stack,
        needsProfile
      );

    return NEEDS
      .filter(function (need) {
        return (
          getRequirement(
            needsProfile,
            need
          ) >= 50
        );
      })
      .map(function (need) {
        const required =
          getRequirement(
            needsProfile,
            need
          );

        const covered =
          Number(
            coverage[need]
          ) || 0;

        return {
          need,
          label:
            NEED_LABELS[need] ||
            need,
          required,
          covered,
          gap:
            Math.max(
              0,
              required -
                covered
            )
        };
      })
      .filter(function (item) {
        return (
          item.covered <
          item.required * 0.50
        );
      })
      .sort(function (a, b) {
        return (
          b.gap -
          a.gap
        );
      });
  }

  /* ============================================================
     REASONS
     ============================================================ */

  function buildReasons(
    tool,
    answers,
    needsProfile
  ) {
    const reasons = [];

    const covered =
      getCoveredNeeds(
        tool,
        needsProfile,
        60
      );

    covered
      .slice(0, 3)
      .forEach(function (need) {
        reasons.push(
          "🎯 " +
          (
            NEED_LABELS[need] ||
            need
          )
        );
      });

    if (
      integrationMatchScore(
        tool,
        answers
      ) >= 75
    ) {
      reasons.push(
        "🔗 Buona integrazione con gli strumenti che utilizzi"
      );
    }

    if (
      isExistingTool(
        tool,
        answers
      )
    ) {
      reasons.push(
        "♻️ È già presente nel tuo ecosistema"
      );
    }

    if (
      isPreservedTool(
        tool,
        answers
      )
    ) {
      reasons.push(
        "🛡️ Rispetta uno strumento che hai scelto di mantenere"
      );
    }

    const budget =
      budgetScore(
        tool,
        answers
      );

    if (budget >= 85) {
      reasons.push(
        "💶 Compatibile con il budget indicato"
      );
    }

    if (
      simplicityScore(
        tool,
        answers
      ) >= 85
    ) {
      reasons.push(
        "🧩 Adatto al tuo livello di semplicità richiesto"
      );
    }

    if (
      automationScore(tool) >= 80
    ) {
      reasons.push(
        "⚡ Buone capacità di automazione"
      );
    }

    return reasons.slice(
      0,
      6
    );
  }

  /* ============================================================
     VALUE ESTIMATE
     ============================================================ */

  function getWeeklyHoursFromSelection(
    value
  ) {
    const normalized =
      normalizeText(value);

    if (
      normalized.indexOf("15") !== -1
    ) {
      return 18;
    }

    if (
      normalized.indexOf("8") !== -1
    ) {
      return 11.5;
    }

    if (
      normalized.indexOf("4") !== -1
    ) {
      return 5.5;
    }

    if (
      normalized.indexOf("1") !== -1
    ) {
      return 2;
    }

    return 0.5;
  }

  function calculateValueEstimate(
    answers
  ) {
    const input =
      answers || {};

    const hoursSelection =
      input.hoursWasted ||
      input.timeWasted ||
      input.orePerse ||
      input.timeLoss ||
      "";

    const weeklyHours =
      getWeeklyHoursFromSelection(
        hoursSelection
      );

    const hourlyValue =
      firstNumber(
        input.hourlyValue ||
        input.valuePerHour ||
        input.valoreOra ||
        30,
        30
      );

    const monthlyValue =
      weeklyHours *
      4.33 *
      hourlyValue;

    return {
      weeklyHours,
      hourlyValue,
      monthlyValue:
        Math.round(
          monthlyValue
        ),
      disclaimer:
        "Stima del potenziale valore del tempo recuperato. Non rappresenta un risparmio garantito."
    };
  }

  /* ============================================================
     AUTOMATION IDEAS
     ============================================================ */

  function buildAutomationIdeas(
    needsProfile
  ) {
    const ideas = [];

    const active =
      getActiveNeeds(
        needsProfile,
        50
      );

    if (
      active.includes("email") &&
      active.includes("automation")
    ) {
      ideas.push(
        "Automatizzare l'invio e la gestione delle email ripetitive."
      );
    }

    if (
      active.includes("followup") &&
      active.includes("crm")
    ) {
      ideas.push(
        "Creare follow-up automatici in base allo stato del cliente."
      );
    }

    if (
      active.includes("sales") &&
      active.includes("crm")
    ) {
      ideas.push(
        "Trasformare automaticamente nuovi lead in opportunità commerciali."
      );
    }

    if (
      active.includes("quotes")
    ) {
      ideas.push(
        "Generare e inviare preventivi automaticamente a partire dai dati del cliente."
      );
    }

    if (
      active.includes("excel") &&
      active.includes("automation")
    ) {
      ideas.push(
        "Eliminare l'inserimento manuale dei dati nei fogli Excel."
      );
    }

    if (
      active.includes("appointments")
    ) {
      ideas.push(
        "Automatizzare prenotazioni, conferme e promemoria degli appuntamenti."
      );
    }

    if (
      active.includes("documents") &&
      active.includes("automation")
    ) {
      ideas.push(
        "Creare e archiviare automaticamente documenti e PDF."
      );
    }

    if (
      active.includes("ai")
    ) {
      ideas.push(
        "Usare l'AI per classificare, riassumere o generare contenuti e risposte."
      );
    }

    return uniqueArray(
      ideas
    ).slice(
      0,
      5
    );
  }

  /* ============================================================
     STACK EXPLANATIONS
     ============================================================ */

  function buildPrimaryExplanation(
    primary,
    needsProfile
  ) {
    if (!primary) {
      return "";
    }

    const dominant =
      getDominantNeeds(
        needsProfile
      )
      .slice(0, 3)
      .map(function (need) {
        return (
          NEED_LABELS[need] ||
          need
        );
      });

    if (!dominant.length) {
      return (
        primary.name +
        " è il punto di partenza principale del sistema."
      );
    }

    return (
      primary.name +
      " è stato scelto come Primary perché copre soprattutto " +
      dominant.join(", ") +
      " in relazione al tuo profilo."
    );
  }

  function buildComplementaryExplanation(
    stack,
    needsProfile
  ) {
    if (
      !stack ||
      stack.length <= 1
    ) {
      return (
        "Il Primary copre già sufficientemente le esigenze principali: non sono stati aggiunti strumenti complementari inutili."
      );
    }

    const explanations =
      stack
        .slice(1)
        .map(function (tool) {
          const covered =
            getCoveredNeeds(
              tool,
              needsProfile,
              60
            );

          if (!covered.length) {
            return (
              tool.name +
              " aggiunge una capacità specifica al sistema."
            );
          }

          return (
            tool.name +
            " aggiunge copertura per " +
            covered
              .slice(0, 3)
              .map(function (need) {
                return (
                  NEED_LABELS[need] ||
                  need
                );
              })
              .join(", ") +
            "."
          );
        });

    return explanations.join(
      " "
    );
  }

  /* ============================================================
     RANKING
     ============================================================ */

  function rankTools(
    tools,
    answers,
    needsProfile
  ) {
    const evaluated =
      tools.map(function (tool) {
        const compatibility =
          calculateCompatibility(
            tool,
            answers,
            needsProfile
          );

        const relevance =
          calculateRelevance(
            tool,
            needsProfile
          );

        const business =
          businessScore(
            tool
          );

        const coveredNeeds =
          getCoveredNeeds(
            tool,
            needsProfile,
            50
          );

        return {
          ...tool,

          compatibility:
            compatibility.compatibility,

          factors:
            compatibility.factors,

          bonuses:
            compatibility.bonuses,

          relevance:
            Math.round(
              relevance
            ),

          businessScore:
            business
              ? business.score
              : null,

          business:
            business,

          coveredNeeds:

            coveredNeeds.length,

          reasons:
            buildReasons(
              tool,
              answers,
              needsProfile
            ),

          role:
            "candidate"
        };
      });

    evaluated.sort(
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
          Math.abs(
            relevanceDifference
          ) > 5
        ) {
          return relevanceDifference;
        }

        /*
          Business Score:
          solo tie-breaker quando la
          compatibilità è molto vicina.
        */

        if (
          a.businessScore !== null &&
          b.businessScore !== null
        ) {
          const businessDifference =
            b.businessScore -
            a.businessScore;

          if (
            businessDifference !== 0
          ) {
            return businessDifference;
          }
        }

        if (
          b.coveredNeeds !==
          a.coveredNeeds
        ) {
          return (
            b.coveredNeeds -
            a.coveredNeeds
          );
        }

        return String(
          a.name
        ).localeCompare(
          String(b.name)
        );
      }
    );

    evaluated.forEach(
      function (tool, index) {
        tool.rank =
          index + 1;
      }
    );

    return evaluated;
  }

  /* ============================================================
     ANALYZE ANSWERS
     ============================================================ */

  function analyzeAnswers(
    answers
  ) {
    const input =
      answers || {};

    const needsProfile =
      buildNeedsProfile(
        input
      );

    const database =
      getNormalizedDatabase();

    let candidates =
      database.filter(
        function (tool) {
          if (
            !CONFIG.ENABLE_HARD_FILTERS
          ) {
            return true;
          }

          return passesHardFilters(
            tool,
            input,
            needsProfile
          );
        }
      );

    /*
      Fallback:
      se i filtri eliminano tutto,
      usiamo il database completo,
      mantenendo comunque l'esclusione
      degli strumenti esplicitamente evitati.
    */

    if (
      !candidates.length &&
      CONFIG.ALLOW_SOFT_FALLBACK
    ) {
      candidates =
        database.filter(
          function (tool) {
            return !isExcludedTool(
              tool,
              input
            );
          }
        );
      }
    }

    const rankedTools =
      rankTools(
        candidates,
        input,
        needsProfile
      );

    const primary =
      choosePrimary(
        rankedTools,
        needsProfile
      );

    const stack =
      buildStack(
        rankedTools,
        primary,
        input,
        needsProfile
      );

    const alternatives =
      getAlternatives(
        rankedTools,
        primary,
        needsProfile
      );

    const complementaryCandidates =
      getComplementaryTools(
        rankedTools,
        stack,
        needsProfile
      );

    const stackCoverage =
      calculateStackCoverage(
        stack,
        needsProfile
      );

    const totalCoverage =
      calculateTotalCoverage(
        stack,
        needsProfile
      );

    const missingNeeds =
      getMissingNeeds(
        stack,
        needsProfile
      );

    const stackCompatibility =
      calculateStackCompatibility(
        stack,
        needsProfile
      );

    const valueEstimate =
      calculateValueEstimate(
        input
      );

    const automationIdeas =
      buildAutomationIdeas(
        needsProfile
      );

    const businessAvailable =
      rankedTools.some(
        function (tool) {
          return (
            tool.businessScore !==
            null
          );
        }
      );

    return {
      version:
        CONFIG.VERSION,

      profile:
        needsProfile,

      answers:
        input,

      rankedTools:
        rankedTools.slice(
          0,
          15
        ),

      ranking:
        rankedTools.slice(
          0,
          15
        ),

      primaryTool:
        primary,

      primary:
        primary,

      stack:
        stack,

      alternatives:
        alternatives,

      complementaryCandidates:
        complementaryCandidates,

      stackCompatibility:
        stackCompatibility,

      stackCoverage:
        stackCoverage,

      totalCoverage:
        totalCoverage,

      missingNeeds:
        missingNeeds,

      valueEstimate:
        valueEstimate,

      value:
        valueEstimate,

      automationIdeas:
        automationIdeas,

      automationSuggestions:
        automationIdeas,

      primaryExplanation:
        buildPrimaryExplanation(
          primary,
          needsProfile
        ),

      complementaryExplanation:
        buildComplementaryExplanation(
          stack,
          needsProfile
        ),

      filters: {
        enabled:
          CONFIG.ENABLE_HARD_FILTERS,

        budget:
          getBudgetLimit(
            input
          ),

        country:
          getUserCountry(
            input
          ),

        language:
          getUserLanguage(
            input
          ),

        excludedTools:
          getExcludedTools(
            input
          )
      },

      business: {
        available:
          businessAvailable,

        note:
          businessAvailable
            ? "Il Business Score viene utilizzato solo come tie-breaker tra compatibilità molto vicine."
            : "Nessun Business Score disponibile: la scelta viene effettuata sulla compatibilità con il profilo."
      }
    };
  }

  /* ============================================================
     PUBLIC API
     ============================================================ */

  const ProjectXEngine = {
    VERSION:
      CONFIG.VERSION,

    CONFIG:
      CONFIG,

    NEEDS:
      NEEDS,

    NEED_LABELS:
      NEED_LABELS,

    analyze:
      analyzeAnswers,

    analyzeAnswers:
      analyzeAnswers,

    buildNeedsProfile:
      buildNeedsProfile,

    calculateCompatibility:
      calculateCompatibility,

    calculateNewCoverage:
      calculateNewCoverage,

    calculateRedundancy:
      calculateRedundancy,

    calculateStackCoverage:
      calculateStackCoverage,

    calculateStackCompatibility:
      calculateStackCompatibility,

    getAlternatives:
      getAlternatives,

    getComplementaryTools:
      getComplementaryTools
  };

  /* ============================================================
     EXPORT
     ============================================================ */

  if (
    typeof window !== "undefined"
  ) {
    window.ProjectXEngine =
      ProjectXEngine;
  }

  if (
    typeof globalThis !== "undefined"
  ) {
    globalThis.ProjectXEngine =
      ProjectXEngine;
  }

})();
