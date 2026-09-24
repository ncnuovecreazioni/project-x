/* =========================================================
   PROJECT-X — SOFTWARE DECISION ENGINE
   Versione 1.4.0 USER-FIRST
   ========================================================= */

(function () {
  "use strict";

  /* =========================================================
     1. CONFIGURAZIONE
     ========================================================= */

  const CONFIG = {
    VERSION: "1.4.0",

    MAX_STACK_TOOLS: 4,

    MIN_PRIMARY_COMPATIBILITY: 50,
    MIN_STACK_COMPATIBILITY: 55,
    MIN_COMPLEMENTARY_COVERAGE: 12,
    MIN_NEW_COVERAGE: 12,

    MIN_PRIMARY_GAP: 18,
    MIN_GAP_IMPROVEMENT: 10,
    MIN_COMPLEMENTARY_CAPABILITY: 60,

    MAX_REDUNDANCY_PENALTY: 30,
    CATEGORY_REDUNDANCY_PENALTY: 14,
    STRONG_CATEGORY_REDUNDANCY_PENALTY: 20,

    EXISTING_TOOL_MAX_BONUS: 15,
    PRESERVE_TOOL_MAX_BONUS: 15,
    INTEGRATION_MAX_BONUS: 10,

    COMPATIBILITY_TIE_THRESHOLD: 3,

    ENABLE_HARD_FILTERS: true,
    ALLOW_SOFT_FALLBACK: true,

    DEFAULT_NEED_SCALE: 10,

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
    }
  };


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
     2. PRIMARY ROLES
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
        "attivita",
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


  /* =========================================================
     3. UTILITY
     ========================================================= */

  function clamp(value, min, max) {

    const n = Number(value);

    if (!Number.isFinite(n)) {
      return min;
    }

    return Math.max(
      min,
      Math.min(max, n)
    );
  }


  function round(value, decimals) {

    const p = Math.pow(
      10,
      decimals || 0
    );

    return Math.round(
      Number(value || 0) * p
    ) / p;
  }


  function normalizeText(value) {

    return String(
      value == null ? "" : value
    )
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\w\s€+.-]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }


  /* =========================================================
     3B. HUMAN NEED INTERPRETATION
     ========================================================= */

  const NEED_INTENTS = [
    { id:"file-organization", label:"Organizzazione dei file", summary:"Mettere ordine in file e cartelle e ridurre il lavoro manuale.", keywords:["file","files","cartella","cartelle","desktop","download","pdf","documenti","documento","ordinare","organizzare","ordine","spostare","sposta","rinominare","rinomina","archiviare","archivia","archivio","computer","pc"], profile:{documents:92,automation:88,excel:20}, preferredToolId:"power-automate" },
    { id:"data-transfer-automation", label:"Automazione del passaggio dati", summary:"Collegare strumenti e spostare dati automaticamente senza copia-incolla.", keywords:["copiare dati","copiando dati","copia dati","trasferire dati","passare dati","da excel a","da excel nelle","tra excel e","tra excel ed","dati nelle email"], profile:{automation:100,excel:92,email:88,documents:42}, preferredToolId:"power-automate" },
    { id:"ocr-documents", label:"Digitalizzazione di documenti e scansioni", summary:"Trasformare documenti e scansioni in file utilizzabili e ricercabili senza ricopiare tutto a mano.", keywords:["ocr","scansioni","scansione","scansionato","scansionati","scanned","estrarre testo","riconoscimento testo"], profile:{documents:96,automation:72,ai:78}, preferredToolId:"adobe-acrobat" },
    { id:"access-management", label:"Controllo degli accessi", summary:"Gestire chi può accedere a sistemi e credenziali in modo più ordinato e sicuro.", keywords:["chi entra","chi accede","accesso ai sistemi","controllare gli accessi","permessi","autorizzazioni","privilegi","account aziendali"], profile:{documents:58,automation:50,ai:40}, preferredToolId:"1password" },
    { id:"password-security", label:"Gestione sicura di password e accessi", summary:"Centralizzare password e credenziali e ridurre la gestione manuale degli accessi.", keywords:["password","passwords","credenziali","accessi","accesso","login","segreti","chiavi","token","account","permessi","autorizzazioni"], profile:{documents:42,automation:44,ai:35}, preferredToolId:"1password" },
    { id:"meeting-transcription", label:"Riunioni e trascrizioni", summary:"Registrare, trascrivere e riassumere riunioni senza prendere tutto a mano.", keywords:["riunione","riunioni","meeting","call","trascrivere","trascrizione","verbale","appunti","registrare","registrazione"], profile:{appointments:58,documents:72,automation:62,ai:90}, preferredToolId:"otter" },
    { id:"form-collection", label:"Raccolta dati con moduli", summary:"Raccogliere richieste e dati in modo ordinato invece di copiarli manualmente.", keywords:["modulo","moduli","form","forms","questionario","iscrizioni","raccolta dati","risposte","richieste online","sito","formulario"], profile:{documents:54,automation:72,excel:64}, preferredToolId:"jotform" },
    { id:"esignature", label:"Firma elettronica", summary:"Inviare, firmare e tracciare documenti senza passaggi cartacei.", keywords:["firmare","firma elettronica","firma digitale","firmare documenti","firme","sign"], profile:{documents:96,automation:58}, preferredToolId:"docusign" },
    { id:"scheduling", label:"Prenotazioni e agenda", summary:"Lasciare che le persone prenotino in autonomia evitando il giro di messaggi.", keywords:["appuntamento","appuntamenti","prenotazione","prenotazioni","agenda","disponibilita","calendario","meeting"], profile:{appointments:98,automation:74,email:42}, preferredToolId:"calendly" },
    { id:"email-management", label:"Gestione delle email", summary:"Ridurre il tempo perso a leggere, smistare e seguire le email.", keywords:["email","e-mail","mail","posta","inbox","casella","messaggi","rispondere","risposte","smistare"], profile:{email:94,automation:82,followup:58}, preferredToolId:"power-automate" },
    { id:"repetitive-automation", label:"Automazione del lavoro ripetitivo", summary:"Eliminare passaggi manuali che vengono ripetuti spesso.", keywords:["ripetitivo","ripetitive","ripetutamente","manuale","manualmente","copia","incolla","copio","incollo","ogni giorno","ogni settimana","perdo tempo","perdo ore","sempre le stesse"], profile:{automation:98,ai:60}, preferredToolId:"power-automate" },
    { id:"excel-data", label:"Lavoro con Excel e dati", summary:"Semplificare attività, dati, report e passaggi ripetitivi in Excel.", keywords:["excel","foglio","fogli","tabella","tabelle","celle","report","dashboard","dati","numeri","csv"], profile:{excel:96,automation:72,ai:42}, preferredToolId:"power-automate" },
    { id:"clients-sales", label:"Gestione di clienti e vendite", summary:"Tenere sotto controllo clienti, lead, richieste e follow-up.", keywords:["cliente","clienti","contatto","contatti","lead","commerciale","vendite","vendita","pipeline","follow up","follow-up","richiamare","ricontattare"], profile:{crm:96,sales:88,followup:86,automation:62}, preferredToolId:"hubspot" },
    { id:"quotes", label:"Preventivi e offerte", summary:"Ridurre il lavoro necessario per creare e seguire preventivi e offerte.", keywords:["preventivo","preventivi","offerta","offerte","quotazione","quotazioni"], profile:{quotes:98,sales:72,automation:58}, preferredToolId:"hubspot" },
    { id:"appointments", label:"Appuntamenti e prenotazioni", summary:"Semplificare la gestione di agenda, riunioni e prenotazioni.", keywords:["appuntamento","appuntamenti","prenotazione","prenotazioni","agenda","calendario","riunione","riunioni","meeting","booking"], profile:{appointments:98,automation:64,crm:52}, preferredToolId:"hubspot" },
    { id:"projects", label:"Organizzazione di attività e progetti", summary:"Tenere sotto controllo attività, scadenze e lavori senza perdersi passaggi.", keywords:["progetto","progetti","task","attività","scadenza","scadenze","commessa","commesse","lavori","workflow","team"], profile:{projects:94,automation:60,documents:46}, preferredToolId:"monday" },
    { id:"documents", label:"Gestione documenti", summary:"Centralizzare documenti, contratti e archivi e trovare tutto più facilmente.", keywords:["documenti","documento","contratti","contratto","firma","firme","archivio","archivi","pdf"], profile:{documents:94,automation:58}, preferredToolId:"microsoft-365" },
    { id:"marketing", label:"Marketing e acquisizione clienti", summary:"Organizzare campagne, contatti e attività di marketing in modo più automatico.", keywords:["marketing","campagna","campagne","newsletter","social","seo","ads","advertising","contenuti","content"], profile:{marketing:96,email:78,automation:68}, preferredToolId:"getresponse" },
    { id:"generic-productivity", label:"Produttività e semplificazione del lavoro", summary:"Ridurre passaggi inutili e trovare uno strumento più semplice per lavorare.", keywords:[], profile:{automation:52,documents:38,projects:30}, preferredToolId:"microsoft-365" }
  ];

  function isGreeting(text) {
    const t=normalizeText(text);
    if(!t) return false;
    const greetings=["ciao","salve","saluti","buongiorno","buonasera","buonanotte","hello","hi","hey","ehi","come stai","come va"];
    return greetings.some(function(g){return t===g||t.indexOf(g+" ")===0||t.indexOf(" "+g)>=0;});
  }

  function interpretNeed(value) {
    const text=normalizeText(value);
    if(!text) return {kind:"empty",label:"",summary:"",confidence:0,profile:{},preferredToolId:""};
    if(isGreeting(text)) return {kind:"greeting",label:"Conversazione",summary:"Un saluto non contiene ancora un bisogno da risolvere.",confidence:100,profile:{},preferredToolId:""};

    let best=NEED_INTENTS[NEED_INTENTS.length-1],bestMatches=0;
    NEED_INTENTS.forEach(function(intent){
      if(!intent.keywords.length) return;
      const matches=intent.keywords.reduce(function(count,k){
        return count+(text.indexOf(normalizeText(k))>=0?1:0);
      },0);
      if(matches>bestMatches){bestMatches=matches;best=intent;}
    });

    const confidence=bestMatches
      ? Math.min(98,58+bestMatches*12+Math.min(20,Math.floor(text.length/40)*5))
      : Math.min(72,44+Math.min(24,Math.floor(text.length/12)*4));

    return {
      kind:"need",
      id:best.id,
      label:best.label,
      summary:best.summary,
      confidence:confidence,
      matchedKeywords:bestMatches,
      profile:Object.assign({},best.profile),
      preferredToolId:best.preferredToolId||""
    };
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


  function uniqueArray(values) {

    return Array.from(
      new Set(
        toArray(values)
          .filter(Boolean)
      )
    );
  }


  function firstNumber(value) {

    if (typeof value === "number") {

      return Number.isFinite(value)
        ? value
        : null;
    }

    const match = String(
      value == null ? "" : value
    )
      .replace(",", ".")
      .match(
        /-?\d+(?:\.\d+)?/
      );

    return match
      ? Number(match[0])
      : null;
  }


  function normalizeScore(value, fallback) {

    const n = Number(value);

    if (!Number.isFinite(n)) {
      return fallback || 0;
    }

    return clamp(
      n,
      0,
      100
    );
  }


  function normalizeNeed(value) {

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

    if (
      n >= 0 &&
      n <= CONFIG.DEFAULT_NEED_SCALE
    ) {

      return clamp(
        n * 10,
        0,
        100
      );
    }

    return clamp(
      n,
      0,
      100
    );
  }


  function getString(value) {

    return String(
      value == null ? "" : value
    ).trim();
  }


  function getAnswer(
    answers,
    keys,
    fallback
  ) {

    const a = answers || {};

    for (
      let i = 0;
      i < keys.length;
      i++
    ) {

      const v =
        a[keys[i]];

      if (
        v !== undefined &&
        v !== null &&
        v !== ""
      ) {

        return v;
      }
    }

    return fallback;
  }


  /* =========================================================
     4. DATABASE
     ========================================================= */

  function normalizeTool(tool) {

    if (!tool) {
      return null;
    }

    const normalized =
      Object.assign(
        {},
        tool
      );


    normalized.id =
      getString(
        tool.id ||
        tool.slug ||
        tool.name
      );


    normalized.name =
      getString(
        tool.name ||
        tool.id ||
        "Strumento"
      );


    normalized.category =
      getString(
        tool.category
      );


    normalized.description =
      getString(
        tool.description
      );


    normalized.pricingUrl =
      tool.pricingUrl ||
      tool.pricing ||
      "";


    normalized.affiliateUrl =
      tool.affiliateUrl ||
      tool.affiliate ||
      "";


    normalized.url =
      tool.url ||
      tool.website ||
      "";


    normalized.needs = {};


    NEEDS.forEach(
      function (need) {

        normalized.needs[need] =
          normalizeNeed(
            tool.needs &&
            tool.needs[need]
          );
      }
    );


    normalized.team =
      uniqueArray(
        tool.team ||
        tool.teams ||
        tool.teamSize
      );


    normalized.tech =
      uniqueArray(
        tool.tech ||
        tool.technicalLevel ||
        tool.technology
      );


    normalized.automation =
      uniqueArray(
        tool.automation ||
        tool.automationLevel ||
        tool.automationSupport
      );


    normalized.integrations =
      uniqueArray(
        tool.integrations ||
        tool.integration
      );


    normalized.countries =
      uniqueArray(
        tool.countries ||
        tool.country ||
        tool.market
      );


    normalized.languages =
      uniqueArray(
        tool.languages ||
        tool.language
      );


    normalized.tags =
      uniqueArray(
        tool.tags ||
        tool.keywords ||
        tool.features
      );


    normalized.roles =
      tool.roles ||
      {};


    return normalized;
  }


  function getDatabase() {

    try {

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
        typeof SOFTWARE_DATABASE !==
        "undefined" &&
        Array.isArray(
          SOFTWARE_DATABASE
        )
      ) {

        return SOFTWARE_DATABASE
          .map(normalizeTool)
          .filter(Boolean);
      }

    } catch (error) {

      return [];
    }


    return [];
  }


  function findToolByName(
    name,
    database
  ) {

    const wanted =
      normalizeText(name);


    if (!wanted) {
      return null;
    }


    return (
      database ||
      getDatabase()
    ).find(
      function (tool) {

        const haystack = [
          tool.id,
          tool.name
        ].map(normalizeText);


        return haystack.some(
          function (x) {

            return (
              x === wanted ||
              x.includes(wanted) ||
              wanted.includes(x)
            );
          }
        );
      }
    ) || null;
  }


  function toolMentionedInText(
    tool,
    text
  ) {

    const source =
      normalizeText(text);


    if (!source) {
      return false;
    }


    const variants = [
      tool &&
      tool.name,

      tool &&
      tool.id
    ]
      .filter(Boolean)
      .map(normalizeText);


    return variants.some(
      function (v) {

        return (
          v &&
          source.includes(v)
        );
      }
    );
  }


  /* =========================================================
     5. INTERPRETAZIONE RISPOSTE
     ========================================================= */

  function getRoleInputText(
    answers
  ) {

    return normalizeText(
      [

        getAnswer(
          answers,
          [
            "businessType",
            "activity",
            "type"
          ],
          ""
        ),

        getAnswer(
          answers,
          [
            "goals",
            "goal",
            "objective",
            "objectives"
          ],
          ""
        ),

        getAnswer(
          answers,
          [
            "painPoint",
            "pain",
            "problem",
            "problems"
          ],
          ""

        )

      ].join(" ")
    );
  }


  function textSignal(
    text,
    keywords,
    points,
    max
  ) {

    const source =
      normalizeText(text);


    let score = 0;


    (
      keywords || []
    ).forEach(
      function (keyword) {

        if (
          source.includes(
            normalizeText(
              keyword
            )
          )
        ) {

          score += points;
        }
      }
    );


    return clamp(
      score,
      0,
      max
    );
  }


  function interpretGoals(
    value
  ) {

    const text =
      normalizeText(value);


    const result = {};


    result.crm =
      textSignal(
        text,
        [
          "clienti",
          "cliente",
          "lead",
          "crm"
        ],
        18,
        80
      );


    result.automation =
      textSignal(
        text,
        [
          "automazione",
          "automatizzare",
          "automatico",
          "workflow"
        ],
        22,
        100
      );


    result.email =
      textSignal(
        text,
        [
          "email",
          "mail",
          "newsletter"
        ],
        22,
        100
      );


    result.followup =
      textSignal(
        text,
        [
          "follow up",
          "follow-up",
          "richiamare",
          "ricontattare"
        ],
        25,
        100
      );


    result.sales =
      textSignal(
        text,
        [
          "vendite",
          "vendita",
          "sales",
          "commerciale"
        ],
        25,
        100
      );


    result.quotes =
      textSignal(
        text,
        [
          "preventivo",
          "preventivi",
          "offerte",
          "quotazione"
        ],
        25,
        100
      );


    result.excel =
      textSignal(
        text,
        [
          "excel",
          "dati",
          "report",
          "dashboard",
          "tabelle",
          "numeri"
        ],
        18,
        100
      );


    result.marketing =
      textSignal(
        text,
        [
          "marketing",
          "ads",
          "advertising",
          "social",
          "seo",
          "content",
          "campagne"
        ],
        20,
        100
      );


    result.projects =
      textSignal(
        text,
        [
          "progetti",
          "project",
          "task",
          "commesse",
          "lavori",
          "scadenze"
        ],
        20,
        100
      );


    result.documents =
      textSignal(
        text,
        [
          "documenti",
          "pdf",
          "contratti",
          "contratto",
          "firma",
          "archivio"
        ],
        20,
        100
      );


    result.appointments =
      textSignal(
        text,
        [
          "appuntamenti",
          "prenotazioni",
          "booking",
          "agenda",
          "calendario",
          "meeting"
        ],
        24,
        100
      );


    result.ecommerce =
      textSignal(
        text,
        [
          "ecommerce",
          "e-commerce",
          "shop",
          "ordini",
          "carrello",
          "prodotti"
        ],
        24,
        100
      );


    result.ai =
      textSignal(
        text,
        [
          "ai",
          "intelligenza artificiale",
          "gpt",
          "ia"
        ],
        22,
        100
      );


    return result;
  }


  function interpretPainPoint(
    value
  ) {

    const text =
      normalizeText(value);


    const result = {};


    result.automation =
      textSignal(
        text,
        [
          "tempo",
          "ripetitivo",
          "ripetitive",
          "manuale",
          "manuali",
          "copia",
          "incolla"
        ],
        20,
        100
      );


    result.followup =
      textSignal(
        text,
        [
          "dimentico",
          "ricordarmi",
          "richiamare",
          "ricontattare",
          "follow up",
          "follow-up"
        ],
        25,
        100
      );


    result.quotes =
      textSignal(
        text,
        [
          "preventivi",
          "preventivo",
          "offerta",
          "offerte"
        ],
        24,
        100
      );


    result.email =
      textSignal(
        text,
        [
          "email",
          "mail",
          "rispondere",
          "posta"
        ],
        18,
        100
      );


    result.documents =
      textSignal(
        text,
        [
          "documenti",
          "pdf",
          "contratti",
          "contratto",
          "archivio",
          "firma"
        ],
        18,
        100
      );


    result.excel =
      textSignal(
        text,
        [
          "excel",
          "foglio",
          "tabelle",
          "dati",
          "report"
        ],
        20,
        100
      );


    result.appointments =
      textSignal(
        text,
        [
          "agenda",
          "appuntamenti",
          "prenotazioni",
          "calendario"
        ],
        22,
        100
      );


    result.crm =
      textSignal(
        text,
        [
          "clienti",
          "contatti",
          "lead",
          "anagrafiche"
        ],
        22,
        100
      );


    result.projects =
      textSignal(
        text,
        [
          "scadenze",
          "task",
          "commesse",
          "lavori",
          "progetti"
        ],
        20,
        100
      );


    return result;
  }


  /* =========================================================
     6. NEEDS PROFILE
     ========================================================= */

  function buildNeedsProfile(
    answers,
    aiProfile
  ) {

    const goals =
      interpretGoals(
        getAnswer(
          answers,
          [
            "goals",
            "goal",
            "objective",
            "objectives"
          ],
          ""
        )
      );


    const pain =
      interpretPainPoint(
        getAnswer(
          answers,
          [
            "painPoint",
            "pain",
            "problem",
            "problems"
          ],
          ""
        )
      );


    const profile = {};


    NEEDS.forEach(
      function (need) {

        const explicitAi =
          aiProfile &&
          aiProfile[need] != null
            ? Number(
                aiProfile[need]
              )
            : 0;


        const goalScore =
          Number(
            goals[need] ||
            0
          );


        const painScore =
          Number(
            pain[need] ||
            0
          );


        profile[need] =
          clamp(
            Math.max(
              explicitAi,
              goalScore,
              painScore
            ) +
            (
              goalScore +
              painScore
            ) * 0.18,

            0,
            100
          );
      }
    );


    const activity =
      normalizeText(
        getAnswer(
          answers,
          [
            "businessType",
            "activity",
            "type"
          ],
          ""
        )
      );


    if (
      activity.includes(
        "ecommerce"
      ) ||
      activity.includes(
        "e commerce"
      ) ||
      activity.includes(
        "negozio online"
      )
    ) {

      profile.ecommerce =
        Math.max(
          profile.ecommerce,
          85
        );
    }


    if (
      activity.includes(
        "agenzia"
      )
    ) {

      profile.projects =
        Math.max(
          profile.projects,
          65
        );
    }


    if (
      activity.includes(
        "ristorante"
      ) ||
      activity.includes(
        "locale"
      )
    ) {

      profile.appointments =
        Math.max(
          profile.appointments,
          55
        );
    }


    if (
      activity.includes(
        "startup"
      )
    ) {

      profile.automation =
        Math.max(
          profile.automation,
          60
        );

      profile.ai =
        Math.max(
          profile.ai,
          45
        );
    }


    if (
      activity.includes(
        "professionista"
      )
    ) {

      profile.crm =
        Math.max(
          profile.crm,
          45
        );

      profile.sales =
        Math.max(
          profile.sales,
          45
        );
    }


    return profile;
  }


  /* =========================================================
     7. ROLE DETECTION
     ========================================================= */

  function calculateRoleKeywordSignal(
    answers,
    role
  ) {

    return textSignal(
      getRoleInputText(
        answers
      ),
      role.keywords,
      8,
      24
    );
  }


  function detectDominantRole(
    answers,
    profile
  ) {

    let bestKey =
      "automation";


    let bestScore =
      -Infinity;


    Object.keys(
      PRIMARY_ROLES
    ).forEach(
      function (key) {

        const role =
          PRIMARY_ROLES[key];


        let needScore =
          0;


        Object.keys(
          role.needs
        ).forEach(
          function (need) {

            needScore +=
              Number(
                profile[need] ||
                0
              ) *
              Number(
                role.needs[need] ||
                0
              );
          }
        );


        const keywordSignal =
          calculateRoleKeywordSignal(
            answers,
            role
          );


        const score =
          needScore * 0.78 +
          keywordSignal;


        if (
          score >
          bestScore
        ) {

          bestScore =
            score;

          bestKey =
            key;
        }
      }
    );


    return {

      key:
        bestKey,

      label:
        PRIMARY_ROLES[
          bestKey
        ].label,

      score:
        round(
          clamp(
            bestScore,
            0,
            100
          ),
          1
        )
    };
  }


  /* =========================================================
     8. USER CONSTRAINTS
     ========================================================= */

  function normalizeAnswerTeam(
    value
  ) {

    const t =
      normalizeText(
        value
      );


    if (!t) {
      return "";
    }


    if (
      t.includes(
        "solo"
      )
    ) {

      return "Solo io";
    }


    if (
      t.includes(
        "2 5"
      ) ||
      t.includes(
        "2-5"
      )
    ) {

      return "2–5";
    }


    if (
      t.includes(
        "6 20"
      ) ||
      t.includes(
        "6-20"
      )
    ) {

      return "6–20";
    }


    if (
      t.includes(
        "21 50"
      ) ||
      t.includes(
        "21-50"
      )
    ) {

      return "21–50";
    }


    if (
      t.includes(
        "50"
      )
    ) {

      return "50+";
    }


    return String(
      value
    );
  }


  function passesTeamFilter(
    tool,
    answers
  ) {

    const rawTeam =
      getAnswer(
        answers,
        [
          "team",
          "teamSize"
        ],
        ""
      );


    if (
      !rawTeam ||
      !tool.team.length
    ) {

      return true;
    }


    const wanted =
      normalizeText(
        normalizeAnswerTeam(
          rawTeam
        )
      );


    const available =
      tool.team
        .map(
          normalizeText
        )
        .filter(Boolean);


    if (
      !available.length
    ) {

      return true;
    }


    if (
      available.includes(
        wanted
      )
    ) {

      return true;
    }


    const wantedSolo =
      wanted.includes(
        "solo"
      );


    if (wantedSolo) {

      return available.some(
        function (x) {

          return (
            x.includes(
              "solo"
            ) ||
            x.includes(
              "freelance"
            ) ||
            x.includes(
              "1"
            )
          );
        }
      );
    }


    const wantedLarge =
      wanted.includes(
        "50"
      );


    if (
      wantedLarge
    ) {

      return available.some(
        function (x) {

          return (
            x.includes(
              "50"
            ) ||
            x.includes(
              "enterprise"
            )
          );
        }
      );
    }


    return false;
  }


  function parseBudget(
    value
  ) {

    const text =
      normalizeText(
        value
      );


    if (!text) {

      return {
        min: 0,
        max: Infinity,
        label: ""
      };
    }


    if (
      text.includes(
        "0"
      )
    ) {

      return {
        min: 0,
        max: 0,
        label: "€0"
      };
    }


    const nums =
      text.match(
        /\d+(?:[.,]\d+)?/g
      ) || [];


    const parsed =
      nums
        .map(
          function (x) {

            return Number(
              x.replace(
                ",",
                "."
              )
            );
          }
        )
        .filter(
          Number.isFinite
        );


    if (
      !parsed.length
    ) {

      return {
        min: 0,
        max: Infinity,
        label: text
      };
    }


    if (
      parsed.length >= 2
    ) {

      return {
        min:
          parsed[0],

        max:
          parsed[1],

        label:
          text
      };
    }


    if (
      text.includes(
        "500"
      )
    ) {

      return {
        min:
          parsed[0],

        max:
          Infinity,

        label:
          text
      };
    }


    return {
      min: 0,
      max: parsed[0],
      label: text
    };
  }


  function extractMonthlyCost(
    tool
  ) {

    const source = [
      tool.price,
      tool.monthlyPrice,
      tool.startingPrice,
      tool.pricing,
      tool.cost
    ].join(" ");


    const nums =
      source.match(
        /\d+(?:[.,]\d+)?/g
      ) || [];


    const values =
      nums
        .map(
          function (x) {

            return Number(
              x.replace(
                ",",
                "."
              )
            );
          }
        )
        .filter(
          Number.isFinite
        );


    if (
      !values.length
    ) {

      return 0;
    }


    return Math.min.apply(
      Math,
      values
    );
  }


  function passesBudgetFilter(
    tool,
    answers
  ) {

    const budget =
      parseBudget(
        getAnswer(
          answers,
          [
            "budget",
            "monthlyBudget"
          ],
          ""
        )
      );


    if (
      !budget.label
    ) {

      return true;
    }


    if (
      budget.max === 0
    ) {

      if (
        tool.free === true
      ) {

        return true;
      }


      if (
        normalizeText(
          tool.priceType
        ).includes(
          "free"
        )
      ) {

        return true;
      }


      const cost =
        extractMonthlyCost(
          tool
        );


      return cost === 0;
    }


    const cost =
      extractMonthlyCost(
        tool
      );


    if (
      !cost
    ) {

      return true;
    }


    return (
      cost <=
      budget.max
    );
  }


  function passesCountryLanguageFilter(
    tool,
    answers
  ) {

    const country =
      normalizeText(
        getAnswer(
          answers,
          [
            "country",
            "market",
            "paese"
          ],
          "italy"
        )
      );


    const language =
      normalizeText(
        getAnswer(
          answers,
          [
            "language",
            "lingua"
          ],
          "italiano"
        )
      );


    if (
      tool.countries.length
    ) {

      const countryOK =
        tool.countries.some(
          function (x) {

            const n =
              normalizeText(
                x
              );


            return (
              n.includes(
                country
              ) ||
              (
                country.includes(
                  "ital"
                ) &&
                (
                  n.includes(
                    "ital"
                  ) ||
                  n.includes(
                    "europa"
                  ) ||
                  n.includes(
                    "europe"
                  )
                )
              )
            );
          }
        );


      if (
        !countryOK
      ) {

        return false;
      }
    }


    if (
      tool.languages.length
    ) {

      const languageOK =
        tool.languages.some(
          function (x) {

            const n =
              normalizeText(
                x
              );


            return (
              n.includes(
                language
              ) ||
              (
                language.includes(
                  "ital"
                ) &&
                (
                  n.includes(
                    "ital"
                  ) ||
                  n.includes(
                    "multi"
                  )
                )
              )
            );
          }
        );


      if (
        !languageOK
      ) {

        return false;
      }
    }


    return true;
  }


  function getExcludedTools(
    answers
  ) {

    const values =
      [];


    values.push.apply(
      values,
      toArray(
        answers &&
        answers.excludedTools
      )
    );


    values.push.apply(
      values,
      toArray(
        answers &&
        answers.doNotChange
      )
    );


    values.push.apply(
      values,
      toArray(
        answers &&
        answers.doNotUse
      )
    );


    return values
      .map(
        getString
      )
      .filter(Boolean);
  }


  function getExistingTools(
    answers
  ) {

    return uniqueArray(
      (
        answers &&
        (
          answers.existingTools ||
          answers.currentTools
        )
      ) || []
    );
  }


  function getPreservedTools(
    answers
  ) {

    return uniqueArray(
      (
        answers &&
        (
          answers.doNotChange ||
          answers.keepTools ||
          answers.toolsToKeep
        )
      ) || []
    );
  }


  function isExcluded(
    tool,
    answers
  ) {

    return getExcludedTools(
      answers
    ).some(
      function (name) {

        return toolMentionedInText(
          tool,
          name
        );
      }
    );
  }


  function passesHardFilters(
    tool,
    answers,
    profile
  ) {

    const reasons =
      [];


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
        profile
      );


    const hasStrongNeed =
      NEEDS.some(
        function (need) {

          return Number(
            profile[need] ||
            0
          ) >= 50;
        }
      );


    if (
      relevance < 12 &&
      hasStrongNeed
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
     9. SCORING
     ========================================================= */

  function calculateWeightedNeedsCoverage(
    tool,
    profile
  ) {

    let numerator =
      0;

    let denominator =
      0;


    NEEDS.forEach(
      function (need) {

        const needWeight =
          clamp(
            Number(
              profile[need] ||
              0
            ),
            0,
            100
          );


        if (
          needWeight <= 0
        ) {

          return;
        }


        numerator +=
          needWeight *
          (
            Number(
              tool.needs[need] ||
              0
            ) / 100
          );


        denominator +=
          needWeight;
      }
    );


    if (
      !denominator
    ) {

      return 50;
    }


    return clamp(
      (
        numerator /
        denominator
      ) * 100,
      0,
      100
    );
  }


  function functionalityScore(
    tool,
    profile
  ) {

    const activeNeeds =
      NEEDS.filter(
        function (need) {

          return Number(
            profile[need] ||
            0
          ) >= 40;
        }
      );


    if (
      !activeNeeds.length
    ) {

      return 60;
    }


    let strongMatches =
      0;


    activeNeeds.forEach(
      function (need) {

        if (
          Number(
            tool.needs[need] ||
            0
          ) >=
          Number(
            profile[need] ||
            0
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
      calculateWeightedNeedsCoverage(
        tool,
        profile
      ) * 0.85 +
      bonus,

      0,
      100
    );
  }


  function scoreByLabels(
    values,
    wanted
  ) {

    const actual =
      toArray(
        values
      )
        .map(
          normalizeText
        )
        .filter(Boolean);


    if (
      !actual.length ||
      !wanted
    ) {

      return 70;
    }


    const w =
      normalizeText(
        wanted
      );


    if (
      actual.some(
        function (x) {

          return (
            x === w ||
            x.includes(w) ||
            w.includes(x)
          );
        }
      )
    ) {

      return 100;
    }


    if (
      actual.some(
        function (x) {

          return (
            x.includes(
              "medium"
            ) ||
            x.includes(
              "medio"
            ) ||
            x.includes(
              "advanced"
            ) ||
            x.includes(
              "avanzato"
            )
          );
        }
      )
    ) {

      return 75;
    }


    return 55;
  }


  function budgetScore(
    tool,
    answers
  ) {

    const budget =
      parseBudget(
        getAnswer(
          answers,
          [
            "budget",
            "monthlyBudget"
          ],
          ""
        )
      );


    if (
      !budget.label
    ) {

      return 75;
    }


    if (
      budget.max === 0
    ) {

      return passesBudgetFilter(
        tool,
        answers
      )
        ? 100
        : 0;
    }


    const cost =
      extractMonthlyCost(
        tool
      );


    if (
      !cost
    ) {

      return 85;
    }


    if (
      cost <=
      budget.max * 0.5
    ) {

      return 100;
    }


    if (
      cost <=
      budget.max
    ) {

      return 92;
    }


    if (
      cost <=
      budget.max * 1.25
    ) {

      return 45;
    }


    return 10;
  }


  function integrationMatchScore(
    tool,
    answers
  ) {

    const requested =
      uniqueArray(
        answers &&
        (
          answers.integrations ||
          answers.integration ||
          answers.existingIntegrations
        )
      );


    if (
      !requested.length
    ) {

      return 70;
    }


    const available =
      tool.integrations
        .map(
          normalizeText
        );


    if (
      !available.length
    ) {

      return 55;
    }


    let hits =
      0;


    requested.forEach(
      function (x) {

        const wanted =
          normalizeText(
            x
          );


        if (
          available.some(
            function (a) {

              return (
                a === wanted ||
                a.includes(wanted) ||
                wanted.includes(a)
              );
            }
          )
        ) {

          hits++;
        }
      }
    );


    return clamp(
      55 +
      (
        hits /
        requested.length
      ) * 45,

      0,
      100
    );
  }


  function simplicityScore(
    tool,
    answers
  ) {

    const tech =
      normalizeText(
        getAnswer(
          answers,
          [
            "tech",
            "techLevel",
            "technicalLevel"
          ],
          ""
        )
      );


    const automation =
      normalizeText(
        getAnswer(
          answers,
          [
            "automation",
            "automationLevel"
          ],
          ""
        )
      );


    let score =
      75;


    if (
      tech.includes(
        "base"
      )
    ) {

      score +=
        scoreByLabels(
          tool.tech,
          "Base"
        ) - 70;
    }


    if (
      tech.includes(
        "medio"
      )
    ) {

      score +=
        scoreByLabels(
          tool.tech,
          "Medio"
        ) - 70;
    }


    if (
      tech.includes(
        "avanzato"
      )
    ) {

      score +=
        scoreByLabels(
          tool.tech,
          "Avanzato"
        ) - 70;
    }


    if (
      automation.includes(
        "semplice"
      )
    ) {

      score +=
        scoreByLabels(
          tool.automation,
          "Semplice"
        ) - 70;
    }


    if (
      automation.includes(
        "avanzato"
      )
    ) {

      score +=
        scoreByLabels(
          tool.automation,
          "Avanzato"
        ) - 70;
    }


    return clamp(
      score,
      0,
      100
    );
  }


  function teamScore(
    tool,
    team
  ) {

    if (
      !team ||
      !tool.team.length
    ) {

      return 75;
    }


    return passesTeamFilter(
      tool,
      {
        team: team
      }
    )
      ? 100
      : 35;
  }


  function countryLanguageScore(
    tool,
    answers
  ) {

    return passesCountryLanguageFilter(
      tool,
      answers
    )
      ? 100
      : 20;
  }


  function scalabilityScore(
    tool,
    answers
  ) {

    const team =
      normalizeText(
        getAnswer(
          answers,
          [
            "team",
            "teamSize"
          ],
          ""
        )
      );


    if (!team) {

      return 75;
    }


    if (
      team.includes(
        "50"
      )
    ) {

      return scoreByLabels(
        tool.team,
        "50+"
      );
    }


    if (
      team.includes(
        "21"
      )
    ) {

      return scoreByLabels(
        tool.team,
        "21–50"
      );
    }


    return 75;
  }


  function automationScore(
    tool,
    level
  ) {

    const value =
      normalizeText(
        level
      );


    if (
      !value ||
      !tool.automation.length
    ) {

      return 75;
    }


    if (
      value.includes(
        "semplice"
      )
    ) {

      return scoreByLabels(
        tool.automation,
        "Semplice"
      );
    }


    if (
      value.includes(
        "avanzato"
      )
    ) {

      return scoreByLabels(
        tool.automation,
        "Avanzato"
      );
    }


    return 75;
  }


  /* =========================================================
     10. ECOSYSTEM BONUSES
     ========================================================= */

  function calculateExistingToolBonus(
    tool,
    answers
  ) {

    const existing =
      getExistingTools(
        answers
      );


    if (
      !existing.length
    ) {

      return 0;
    }


    if (
      existing.some(
        function (x) {

          return toolMentionedInText(
            tool,
            x
          );
        }
      )
    ) {

      return CONFIG.EXISTING_TOOL_MAX_BONUS;
    }


    return 0;
  }


  function calculatePreserveBonus(
    tool,
    answers
  ) {

    const preserved =
      getPreservedTools(
        answers
      );


    if (
      !preserved.length
    ) {

      return 0;
    }


    if (
      preserved.some(
        function (x) {

          return toolMentionedInText(
            tool,
            x
          );
        }
      )
    ) {

      return CONFIG.PRESERVE_TOOL_MAX_BONUS;
    }


    return 0;
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


    return Math.round(
      (
        score /
        100
      ) *
      CONFIG.INTEGRATION_MAX_BONUS
    );
  }


  /* =========================================================
     11. TOOL COMPATIBILITY
     ========================================================= */

  function toolCompatibility(
    tool,
    answers,
    profile
  ) {

    const components = {

      needs:
        calculateWeightedNeedsCoverage(
          tool,
          profile
        ),

      functionality:
        functionalityScore(
          tool,
          profile
        ),

      budget:
        budgetScore(
          tool,
          answers
        ),

      integrations:
        integrationMatchScore(
          tool,
          answers
        ),

      simplicity:
        simplicityScore(
          tool,
          answers
        ),

      team:
        teamScore(
          tool,
          getAnswer(
            answers,
            [
              "team",
              "teamSize"
            ],
            ""
          )
        ),

      countryLanguage:
        countryLanguageScore(
          tool,
          answers
        ),

      scalability:
        scalabilityScore(
          tool,
          answers
        )
    };


    const W =
      CONFIG.WEIGHTS;


    const totalWeight =
      Object.keys(
        W
      ).reduce(
        function (
          sum,
          key
        ) {

          return (
            sum +
            W[key]
          );
        },
        0
      );


    let score =
      0;


    Object.keys(
      W
    ).forEach(
      function (key) {

        score +=
          components[key] *
          W[key];
      }
    );


    score /=
      totalWeight;


    score +=
      calculateExistingToolBonus(
        tool,
        answers
      );


    score +=
      calculatePreserveBonus(
        tool,
        answers
      );


    score +=
      calculateIntegrationBonus(
        tool,
        answers
      ) * 0.35;


    return clamp(
      round(
        score,
        1
      ),
      0,
      100
    );
  }


  /* =========================================================
     12. PRIMARY ROLE FIT
     ========================================================= */

  function calculatePrimaryRoleFit(
    tool,
    role
  ) {

    if (!role) {
      return 50;
    }


    const def =
      PRIMARY_ROLES[
        role.key
      ] ||
      role;


    if (
      !def ||
      !def.needs
    ) {

      return 50;
    }


    let weighted =
      0;


    let total =
      0;


    Object.keys(
      def.needs
    ).forEach(
      function (need) {

        const wanted =
          Number(
            def.needs[need] ||
            0
          );


        if (
          !wanted
        ) {

          return;
        }


        weighted +=
          (
            Number(
              tool.needs[need] ||
              0
            ) / 100
          ) *
          wanted;


        total +=
          wanted;
      }
    );


    let fit =
      total
        ? (
            weighted /
            total
          ) * 100
        : 50;


    if (
      tool.roles &&
      typeof tool.roles ===
      "object"
    ) {

      const explicit =
        tool.roles[
          role.key
        ] != null

          ? tool.roles[
              role.key
            ]

          : (
              tool.roles[
                role.label
              ] != null

                ? tool.roles[
                    role.label
                  ]

                : null
            );


      if (
        explicit != null
      ) {

        fit =
          fit * 0.65 +
          normalizeScore(
            explicit,
            50
          ) * 0.35;
      }
    }


    return clamp(
      fit,
      0,
      100
    );
  }


  function choosePrimary(
    rankedTools,
    dominantRole
  ) {

    if (
      !rankedTools.length
    ) {

      return null;
    }


    let best =
      rankedTools[0];


    let bestScore =
      -Infinity;


    rankedTools.forEach(
      function (tool) {

        const selectionScore =
          Number(
            tool.compatibility ||
            0
          ) * 0.40 +

          calculatePrimaryRoleFit(
            tool,
            dominantRole
          ) * 0.60;


        if (
          selectionScore >
          bestScore
        ) {

          bestScore =
            selectionScore;

          best =
            tool;
        }
      }
    );


    return best;
  }


  /* =========================================================
     13. RANKING
     ========================================================= */

  function rankTools(
    answers,
    profile,
    options
  ) {

    const opts =
      options ||
      {};


    const database =
      getDatabase();


    const dominantRole =
      detectDominantRole(
        answers,
        profile
      );


    return database

      .map(
        function (tool) {

          const filter =
            passesHardFilters(
              tool,
              answers,
              profile
            );


          const compatibility =
            toolCompatibility(
              tool,
              answers,
              profile
            );


          const business =
            calculateBusinessScore(
              tool
            );


          const roleFit =
            calculatePrimaryRoleFit(
              tool,
              dominantRole
            );


          const item =
            Object.assign(
              {},
              tool,
              {

                compatibility:
                  round(
                    compatibility,
                    1
                  ),

                businessScore:
                  round(
                    business.total,
                    1
                  ),

                business:
                  business,

                primaryRoleFit:
                  round(
                    roleFit,
                    1
                  ),

                filterPassed:
                  filter.passed,

                filterReasons:
                  filter.reasons,

                needsCoverage:
                  round(
                    calculateWeightedNeedsCoverage(
                      tool,
                      profile
                    ),
                    1
                  ),

                functionalityScore:
                  round(
                    functionalityScore(
                      tool,
                      profile
                    ),
                    1
                  ),

                budgetScore:
                  round(
                    budgetScore(
                      tool,
                      answers
                    ),
                    1
                  ),

                integrationScore:
                  round(
                    integrationMatchScore(
                      tool,
                      answers
                    ),
                    1
                  ),

                simplicityScore:
                  round(
                    simplicityScore(
                      tool,
                      answers
                    ),
                    1
                  ),

                existingToolBonus:
                  calculateExistingToolBonus(
                    tool,
                    answers
                  ),

                preserveToolBonus:
                  calculatePreserveBonus(
                    tool,
                    answers
                  )
              }
            );


          item.rankingScore =
            round(
              Number(
                item.compatibility ||
                0
              ) * 0.82 +

              Number(
                item.primaryRoleFit ||
                0
              ) * 0.18,

              1
            );


          return item;
        }
      )

      .filter(
        function (tool) {

          return (
            opts.includeFiltered ||
            tool.filterPassed
          );
        }
      )

      .sort(
        function (a, b) {

          if (
            b.rankingScore !==
            a.rankingScore
          ) {

            return (
              b.rankingScore -
              a.rankingScore
            );
          }


          return (
            b.compatibility -
            a.compatibility
          );
        }
      );
  }


  /* =========================================================
     14. STACK HELPERS
     ========================================================= */

  function getCoveredNeeds(
    tool
  ) {

    const result =
      {};


    NEEDS.forEach(
      function (need) {

        result[need] =
          normalizeScore(
            tool &&
            tool.needs &&
            tool.needs[need],
            0
          );
      }
    );


    return result;
  }


  function calculateCoverage(
    stack,
    profile
  ) {

    const tools =
      Array.isArray(
        stack
      )

        ? stack

        : [];


    const coverage =
      {};


    NEEDS.forEach(
      function (need) {

        coverage[need] =
          tools.reduce(
            function (
              max,
              tool
            ) {

              return Math.max(
                max,
                Number(
                  tool.needs &&
                  tool.needs[need] ||
                  0
                )
              );
            },
            0
          );
      }
    );


    return coverage;
  }


  function getPrimaryGaps(
    primary,
    profile
  ) {

    const gaps =
      {};


    NEEDS.forEach(
      function (need) {

        const required =
          Number(
            profile[need] ||
            0
          );


        const covered =
          Number(
            primary &&
            primary.needs &&
            primary.needs[need] ||
            0
          );


        gaps[need] =
          Math.max(
            0,
            required -
            covered
          );
      }
    );


    return gaps;
  }


  function calculateStackGapImprovement(
    tool,
    stack,
    profile
  ) {

    const before =
      calculateCoverage(
        stack,
        profile
      );


    let improvement =
      0;


    NEEDS.forEach(
      function (need) {

        const required =
          Number(
            profile[need] ||
            0
          );


        const current =
          Number(
            before[need] ||
            0
          );


        const next =
          Number(
            tool.needs[need] ||
            0
          );


        improvement +=
          Math.max(
            0,
            Math.min(
              required,
              next
            ) -
            Math.min(
              required,
              current
            )
          );
      }
    );


    return (
      improvement /
      NEEDS.length
    );
  }


  function calculateComplementaryCapability(
    tool,
    profile,
    stack
  ) {

    const coverage =
      calculateCoverage(
        stack,
        profile
      );


    let score =
      0;


    NEEDS.forEach(
      function (need) {

        const gap =
          Math.max(
            0,
            Number(
              profile[need] ||
              0
            ) -
            Number(
              coverage[need] ||
              0
            )
          );


        const cap =
          Number(
            tool.needs[need] ||
            0
          );


        if (
          gap > 0
        ) {

          score +=
            Math.min(
              gap,
              cap
            );
        }
      }
    );


    return clamp(
      score * 1.5,
      0,
      100
    );
  }


  function calculateRedundancy(
    a,
    b
  ) {

    if (
      !a ||
      !b
    ) {

      return 0;
    }


    let overlap =
      0;


    NEEDS.forEach(
      function (need) {

        overlap +=
          Math.min(
            Number(
              a.needs[need] ||
              0
            ),

            Number(
              b.needs[need] ||
              0
            )
          );
      }
    );


    let penalty =
      overlap /
      NEEDS.length;


    if (
      a.category &&
      b.category &&
      normalizeText(
        a.category
      ) ===
      normalizeText(
        b.category
      )
    ) {

      penalty +=
        CONFIG.CATEGORY_REDUNDANCY_PENALTY;


      if (
        overlap /
        NEEDS.length >
        45
      ) {

        penalty +=
          CONFIG.STRONG_CATEGORY_REDUNDANCY_PENALTY;
      }
    }


    return clamp(
      round(
        penalty,
        1
      ),
      0,
      CONFIG.MAX_REDUNDANCY_PENALTY
    );
  }


  function calculateStackGap(
    stack,
    profile
  ) {

    const coverage =
      calculateCoverage(
        stack,
        profile
      );


    return NEEDS

      .map(
        function (need) {

          return {

            need:
              need,

            label:
              NEED_LABELS[
                need
              ],

            gap:
              Math.max(
                0,
                Number(
                  profile[need] ||
                  0
                ) -
                Number(
                  coverage[need] ||
                  0
                )
              )
          };
        }
      )

      .filter(
        function (item) {

          return (
            item.gap >=
            CONFIG.MIN_PRIMARY_GAP
          );
        }
      )

      .sort(
        function (a, b) {

          return (
            b.gap -
            a.gap
          );
        }
      );
  }


  /* =========================================================
     15. BUILD STACK
     ========================================================= */

  function buildStack(
    rankedTools,
    answers,
    profile,
    dominantRole
  ) {

    const candidates =
      Array.isArray(
        rankedTools
      )

        ? rankedTools.slice()

        : [];


    if (
      !candidates.length
    ) {

      return [];
    }


    const primary =
      choosePrimary(
        candidates,
        dominantRole
      );


    if (!primary) {
      return [];
    }


    const stack =
      [primary];


    const remaining =
      candidates.filter(
        function (tool) {

          return (
            tool.id !==
            primary.id
          );
        }
      );


    while (
      stack.length <
      CONFIG.MAX_STACK_TOOLS
    ) {

      let best =
        null;


      let bestScore =
        -Infinity;


      const gaps =
        calculateStackGap(
          stack,
          profile
        );


      remaining.forEach(
        function (tool) {

          if (
            !passesTeamFilter(
              tool,
              answers
            )
          ) {

            return;
          }


          if (
            !passesBudgetFilter(
              tool,
              answers
            )
          ) {

            return;
          }


          const redundancy =
            stack.reduce(
              function (
                sum,
                selected
              ) {

                return (
                  sum +
                  calculateRedundancy(
                    tool,
                    selected
                  )
                );
              },
              0
            );


          const improvement =
            calculateStackGapImprovement(
              tool,
              stack,
              profile
            );


          const capability =
            calculateComplementaryCapability(
              tool,
              profile,
              stack
            );


          const coverageNeed =
            gaps.length
              ? gaps[0].need
              : null;


          const focusBonus =
            coverageNeed
              ? Number(
                  tool.needs[
                    coverageNeed
                  ] ||
                  0
                ) * 0.25

              : 0;


          const score =

            improvement * 2.3 +

            capability * 0.45 +

            Number(
              tool.compatibility ||
              0
            ) * 0.25 +

            focusBonus -

            redundancy * 0.8;


          if (
            improvement >=
              CONFIG.MIN_GAP_IMPROVEMENT &&

            capability >=
              CONFIG.MIN_COMPLEMENTARY_CAPABILITY &&

            score >
              bestScore
          ) {

            bestScore =
              score;

            best =
              tool;
          }
        }
      );


      if (!best) {
        break;
      }


      stack.push(
        best
      );


      const index =
        remaining.findIndex(
          function (tool) {

            return (
              tool.id ===
              best.id
            );
          }
        );


      if (
        index >= 0
      ) {

        remaining.splice(
          index,
          1
        );
      }
    }


    return stack;
  }


  /* =========================================================
     16. MISSING NEEDS
     ========================================================= */

  function getMissingNeeds(
    profile,
    stack
  ) {

    const coverage =
      calculateCoverage(
        stack,
        profile
      );


    return NEEDS

      .map(
        function (need) {

          return {

            need:
              need,

            label:
              NEED_LABELS[
                need
              ],

            required:
              round(
                Number(
                  profile[need] ||
                  0
                ),
                1
              ),

            covered:
              round(
                Number(
                  coverage[need] ||
                  0
                ),
                1
              ),

            gap:
              round(
                Math.max(
                  0,
                  Number(
                    profile[need] ||
                    0
                  ) -
                  Number(
                    coverage[need] ||
                    0
                  )
                ),
                1
              )
          };
        }
      )

      .filter(
        function (item) {

          return (
            item.gap >=
            15
          );
        }
      )

      .sort(
        function (a, b) {

          return (
            b.gap -
            a.gap
          );
        }
      );
  }


  /* =========================================================
     17. EXPLANATIONS
     ========================================================= */

  function explainStack(
    stack,
    profile
  ) {

    return (
      stack || []
    ).map(
      function (
        tool,
        index
      ) {

        const covered =
          NEEDS

            .filter(
              function (need) {

                return (

                  Number(
                    profile[need] ||
                    0
                  ) >= 40 &&

                  Number(
                    tool.needs[need] ||
                    0
                  ) >=
                  Number(
                    profile[need] ||
                    0
                  ) * 0.65

                );
              }
            )

            .map(
              function (need) {

                return (
                  NEED_LABELS[
                    need
                  ]
                );
              }
            );


        return {

          tool:
            tool.name,

          role:
            index === 0
              ? "primary"
              : "complementary",

          why:
            covered.length

              ? (
                  "Copre soprattutto: " +
                  covered
                    .slice(
                      0,
                      4
                    )
                    .join(
                      ", "
                    ) +
                  "."
                )

              : "Aggiunge capacità complementari al sistema.",

          strengths:
            covered.slice(
              0,
              6
            )
        };
      }
    );
  }


  /* =========================================================
     18. AUTOMATION IDEAS
     ========================================================= */

  function automationIdeas(
    answers,
    profile,
    stack
  ) {

    const ideas =
      [];


    const text =
      getRoleInputText(
        answers
      );


    const p =
      profile ||
      {};


    const primary =
      stack &&
      stack[0]

        ? stack[0].name

        : "il tuo sistema";


    if (
      p.email >= 45 ||
      normalizeText(
        text
      ).includes(
        "email"
      )
    ) {

      ideas.push({

        title:
          "Email automatiche",

        description:
          "Classifica le richieste, prepara risposte e crea follow-up dal contesto del cliente."
      });
    }


    if (
      p.followup >= 45
    ) {

      ideas.push({

        title:
          "Follow-up automatici",

        description:
          "Trasforma richieste e preventivi in promemoria e sequenze di ricontatto."
      });
    }


    if (
      p.quotes >= 45
    ) {

      ideas.push({

        title:
          "Preventivo → processo",

        description:
          "Quando nasce una richiesta, crea il flusso operativo e le attività successive."
      });
    }


    if (
      p.excel >= 45
    ) {

      ideas.push({

        title:
          "Dati → dashboard",

        description:
          "Porta i dati ricorrenti in un flusso strutturato invece di lavorare manualmente sui fogli."
      });
    }


    if (
      p.documents >= 45
    ) {

      ideas.push({

        title:
          "Documenti automatici",

        description:
          "Genera, archivia e collega automaticamente documenti e PDF alle attività."
      });
    }


    if (
      p.appointments >= 45
    ) {

      ideas.push({

        title:
          "Prenotazione → agenda",

        description:
          "Collega prenotazioni, calendario, conferme e promemoria in un unico flusso."
      });
    }


    if (
      p.ai >= 45
    ) {

      ideas.push({

        title:
          "AI nel workflow",

        description:
          "Usa l’AI per riassumere, classificare, estrarre informazioni e preparare il prossimo passo."
      });
    }


    if (
      !ideas.length
    ) {

      ideas.push({

        title:
          "Workflow operativo",

        description:
          "Collega " +
          primary +
          " alle attività ripetitive che oggi richiedono passaggi manuali."
      });
    }


    return ideas.slice(
      0,
      6
    );
  }


  /* =========================================================
     19. VALUE ESTIMATE
     ========================================================= */

  function estimateValue(
    answers
  ) {

    const hours =
      firstNumber(
        getAnswer(
          answers,
          [
            "hours",
            "hoursPerWeek",
            "ore"
          ],
          0
        )
      ) || 0;


    const hourlyValue =
      firstNumber(
        getAnswer(
          answers,
          [
            "hourValue",
            "hourlyValue",
            "valoreOra"
          ],
          0
        )
      ) || 0;


    const weekly =
      hours *
      hourlyValue;


    const monthly =
      weekly *
      4.33;


    return {

      hoursPerWeek:
        round(
          hours,
          1
        ),

      hourlyValue:
        round(
          hourlyValue,
          2
        ),

      weeklyValue:
        round(
          weekly,
          2
        ),

      monthlyValue:
        round(
          monthly,
          2
        ),

      annualValue:
        round(
          monthly * 12,
          2
        )
    };
  }


  /* =========================================================
     20. BUSINESS SCORE
     ========================================================= */

  function valueFromTool(
    tool,
    keys,
    fallback
  ) {

    for (
      let i = 0;
      i < keys.length;
      i++
    ) {

      if (
        tool &&
        tool[keys[i]] != null
      ) {

        return tool[
          keys[i]
        ];
      }
    }


    return fallback;
  }


  function calculateBusinessScore(
    tool
  ) {

    const raw = {

      commission:
        normalizeScore(
          valueFromTool(
            tool,
            [
              "commission",
              "affiliateCommission",
              "commissionScore"
            ],
            60
          ),
          60
        ),

      recurring:
        normalizeScore(
          valueFromTool(
            tool,
            [
              "recurring",
              "recurringScore",
              "recurringCommission"
            ],
            60
          ),
          60
        ),

      conversion:
        normalizeScore(
          valueFromTool(
            tool,
            [
              "conversion",
              "conversionScore"
            ],
            65
          ),
          65
        ),

      productPrice:
        normalizeScore(
          valueFromTool(
            tool,
            [
              "productPrice",
              "productPriceScore"
            ],
            60
          ),
          60
        ),

      attribution:
        normalizeScore(
          valueFromTool(
            tool,
            [
              "attribution",
              "attributionScore"
            ],
            65
          ),
          65
        ),

      marketSize:
        normalizeScore(
          valueFromTool(
            tool,
            [
              "marketSize",
              "marketSizeScore"
            ],
            70
          ),
          70
        ),

      reliability:
        normalizeScore(
          valueFromTool(
            tool,
            [
              "reliability",
              "reliabilityScore"
            ],
            75
          ),
          75
        )
    };


    const W =
      CONFIG.BUSINESS_WEIGHTS;


    let totalWeight =
      0;


    let total =
      0;


    Object.keys(
      W
    ).forEach(
      function (key) {

        totalWeight +=
          W[key];


        total +=
          raw[key] *
          W[key];
      }
    );


    return {

      total:
        totalWeight
          ? total /
            totalWeight
          : 0,

      components:
        raw
    };
  }


  /* =========================================================
     21. MAIN ANALYSIS
     ========================================================= */

  function analyzeAnswers(
    answers,
    aiProfile
  ) {

    answers =
      answers ||
      {};


    /*
      FIX DEFINITIVO:

      profile viene dichiarato
      e costruito PRIMA
      di essere utilizzato.
    */

    const needInterpretation =
      interpretNeed(
        getAnswer(
          answers,
          ["painPoint","pain","problem","problems"],
          ""
        )
      );

    const mergedAiProfile =
      Object.assign(
        {},
        needInterpretation.profile || {},
        aiProfile || {}
      );

    const profile =
      buildNeedsProfile(
        answers,
        mergedAiProfile
      );


    const dominantRole =
      detectDominantRole(
        answers,
        profile
      );


    let rankedTools =
      rankTools(
        answers,
        profile
      );


    /*
      Fallback:

      se gli hard filter
      lasciano zero strumenti,
      mostra comunque gli strumenti
      più compatibili invece di
      lasciare il risultato vuoto.
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
            includeFiltered:
              true
          }
        );
    }


    if (
      needInterpretation.preferredToolId &&
      Array.isArray(rankedTools) &&
      rankedTools.length
    ) {
      rankedTools.forEach(function(tool) {
        if (String(tool.id || "") === String(needInterpretation.preferredToolId)) {
          tool.rankingScore = round(Number(tool.rankingScore || 0) + 18, 1);
          tool.solutionPreferred = true;
        }
      });

      rankedTools.sort(function(a,b){
        if (b.rankingScore !== a.rankingScore) return b.rankingScore-a.rankingScore;
        return Number(b.compatibility||0)-Number(a.compatibility||0);
      });
    }



    let stack =
      buildStack(
        rankedTools,
        answers,
        profile,
        dominantRole
      );

    const preferredSolution =
      needInterpretation.preferredToolId
        ? rankedTools.find(function(tool){
            return String(tool.id || "") === String(needInterpretation.preferredToolId);
          })
        : null;

    if (preferredSolution) {
      stack = stack.filter(function(tool){
        return String(tool.id || "") !== String(preferredSolution.id || "");
      });
      stack.unshift(preferredSolution);

      if (stack.length > CONFIG.MAX_STACK_TOOLS) {
        stack.length = CONFIG.MAX_STACK_TOOLS;
      }
    }


    const primaryTool =
      (preferredSolution || stack[0]) ||

      choosePrimary(
        rankedTools,
        dominantRole
      ) ||

      rankedTools[0] ||

      null;


    /*
      Se buildStack
      non ha inserito il Primary,
      lo aggiungiamo comunque.
    */

    if (
      primaryTool &&
      !stack.some(
        function (x) {

          return (
            x.id ===
            primaryTool.id
          );
        }
      )
    ) {

      stack.unshift(
        primaryTool
      );


      if (
        stack.length >
        CONFIG.MAX_STACK_TOOLS
      ) {

        stack.length =
          CONFIG.MAX_STACK_TOOLS;
      }
    }


    stack.forEach(
      function (
        tool,
        index
      ) {

        tool.role =
          index === 0
            ? "primary"
            : "complementary";
      }
    );


    const finalRanking =
      rankedTools.slice(
        0,
        15
      );


    const stackCoverage =
      calculateCoverage(
        stack,
        profile
      );


    const stackCompatibility =
      stack.length

        ? round(
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
            ) / stack.length,

            1
          )

        : 0;


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


    return {

      version:
        CONFIG.VERSION,

      profile:
        profile,

      answers:
        answers,

      needInterpretation:
        needInterpretation,

      solutionHint: {
        label: needInterpretation.label || "Soluzione operativa",
        summary: needInterpretation.summary || "Cerco il modo più semplice per arrivare al risultato.",
        confidence: needInterpretation.confidence || 0,
        preferredToolId: needInterpretation.preferredToolId || ""
      },

      solutionDiscovery:
        buildSolutionDiscovery(
          answers,
          profile,
          needInterpretation,
          answers && answers._aiSolution ? answers._aiSolution : null,
          primaryTool
        ),

      dominantRole:
        dominantRole,

      primaryRole:
        dominantRole,

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
        getMissingNeeds(
          profile,
          stack
        ),

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
          CONFIG.ENABLE_HARD_FILTERS,

        fallbackUsed:
          rankedTools.length > 0 &&
          !rankedTools.some(
            function (tool) {

              return (
                tool.filterPassed
              );
            }
          ),

        team:
          getAnswer(
            answers,
            [
              "team",
              "teamSize"
            ],
            ""
          ),

        budget:
          getAnswer(
            answers,
            [
              "budget",
              "monthlyBudget"
            ],
            ""
          )
      },

      business: {

        primaryBusinessScore:
          primaryTool
            ? calculateBusinessScore(
                primaryTool
              )
            : null,

        ranked:
          finalRanking.map(
            function (tool) {

              return {

                name:
                  tool.name,

                score:
                  tool.businessScore
              };
            }
          )
      }
    };
  }


  function buildSolutionDiscovery(answers, profile, needInterpretation, aiSolution, primaryTool) {
    const focusEntries = Object.keys(profile || {}).map(function(need){
      return { need:need, score:Number(profile[need]||0) };
    }).sort(function(a,b){ return b.score-a.score; });

    const focus = focusEntries[0] || {need:"automation",score:0};
    const category = String(
      (aiSolution && aiSolution.category) ||
      needInterpretation.label ||
      "Soluzione digitale"
    ).trim();

    const outcome = String(
      (aiSolution && aiSolution.outcome) ||
      needInterpretation.summary ||
      "Ridurre il lavoro manuale e arrivare al risultato con meno passaggi."
    ).trim();

    const capabilities = Array.isArray(aiSolution && aiSolution.capabilities) && aiSolution.capabilities.length
      ? aiSolution.capabilities.slice(0,6)
      : [category, "Configurazione semplice", "Automazione del passaggio principale"];

    const query = String(
      (aiSolution && aiSolution.discoveryQuery) ||
      (needInterpretation.summary || category)
    ).trim();

    const catalogConfidence = primaryTool
      ? Number(primaryTool.compatibility || 0)
      : 0;

    return {
      mode: (
        needInterpretation.id === "generic-productivity" ||
        catalogConfidence < 55
      ) ? "open" : "catalog",
      category: category,
      outcome: outcome,
      capabilities: capabilities,
      discoveryQuery: query,
      focusNeed: focus.need,
      focusScore: focus.score,
      primaryTool: primaryTool ? String(primaryTool.name || primaryTool.id || "") : "",
      catalogConfidence: catalogConfidence,
      toolTypes: Array.isArray(aiSolution && aiSolution.toolTypes) ? aiSolution.toolTypes.slice(0,4) : []
    };
  }


  /* =========================================================
     22. PUBLIC API
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

    PRIMARY_ROLES:
      PRIMARY_ROLES,

    analyzeAnswers:
      analyzeAnswers,

    interpretGoals:
      interpretGoals,

    interpretPainPoint:
      interpretPainPoint,

    interpretNeed:
      interpretNeed,

    buildSolutionDiscovery:
      buildSolutionDiscovery,

    buildNeedsProfile:
      buildNeedsProfile,

    detectDominantRole:
      detectDominantRole,

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
      function (need) {

        return (
          NEED_LABELS[need] ||
          need
        );
      },

    explainStack:
      explainStack,

    getDatabase:
      getDatabase,

    passesTeamFilter:
      passesTeamFilter,

    passesBudgetFilter:
      passesBudgetFilter,

    passesCountryLanguageFilter:
      passesCountryLanguageFilter
  };


  /* =========================================================
     23. GLOBAL EXPOSURE
     ========================================================= */

  if (
    typeof window !==
    "undefined"
  ) {

    window.ProjectXEngine =
      ProjectXEngine;

    /*
      Compatibilità con
      eventuale codice precedente.
    */

    window.StackPilotEngine =
      ProjectXEngine;
  }


})();
