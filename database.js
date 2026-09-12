const SOFTWARE_DATABASE = [

    /* =========================================================
       MARKETING / ALL-IN-ONE
       ========================================================= */

    {
        id: "systeme",
        name: "Systeme.io",
        category: "Marketing & Business",
        description: "Piattaforma all-in-one per funnel, email marketing, vendite, automazioni e prodotti digitali.",
        pricingUrl: "https://systeme.io/pricing",
        affiliateUrl: "",
        needs: {
            crm: 5, automation: 8, email: 9, followup: 8, sales: 9,
            quotes: 2, excel: 1, marketing: 10, projects: 2,
            documents: 3, appointments: 4, ecommerce: 7, ai: 4
        },
        team: ["Solo io", "2–5", "6–20"],
        tech: ["Base", "Medio"],
        automation: ["Semplice", "Smart"],
        integrations: ["Make", "Zapier", "Stripe", "PayPal"]
    },

    {
        id: "getresponse",
        name: "GetResponse",
        category: "Email Marketing & Automation",
        description: "Email marketing, automazioni, funnel, webinar e strumenti per acquisizione e conversione.",
        pricingUrl: "https://www.getresponse.com/pricing",
        affiliateUrl: "",
        needs: {
            crm: 5, automation: 9, email: 10, followup: 9, sales: 7,
            quotes: 1, excel: 2, marketing: 10, projects: 1,
            documents: 1, appointments: 5, ecommerce: 6, ai: 5
        },
        team: ["Solo io", "2–5", "6–20", "21–50"],
        tech: ["Base", "Medio", "Avanzato"],
        automation: ["Semplice", "Smart", "AI Mode 🤖"],
        integrations: ["Make", "Zapier", "Shopify", "WordPress", "Stripe"]
    },

    {
        id: "mailchimp",
        name: "Mailchimp",
        category: "Email Marketing",
        description: "Piattaforma per email marketing, automazioni, audience, campagne e marketing digitale.",
        pricingUrl: "https://mailchimp.com/pricing/",
        affiliateUrl: "",
        needs: {
            crm: 5, automation: 8, email: 10, followup: 8, sales: 6,
            quotes: 1, excel: 3, marketing: 10, projects: 1,
            documents: 1, appointments: 3, ecommerce: 7, ai: 6
        },
        team: ["Solo io", "2–5", "6–20", "21–50", "50+"],
        tech: ["Base", "Medio", "Avanzato"],
        automation: ["Semplice", "Smart", "AI Mode 🤖"],
        integrations: ["Shopify", "WordPress", "Make", "Zapier", "Stripe"]
    },

    {
        id: "klaviyo",
        name: "Klaviyo",
        category: "E-commerce Marketing",
        description: "Email, SMS e automazioni marketing orientate soprattutto a e-commerce e customer retention.",
        pricingUrl: "https://www.klaviyo.com/pricing",
        affiliateUrl: "",
        needs: {
            crm: 7, automation: 10, email: 10, followup: 10, sales: 9,
            quotes: 1, excel: 3, marketing: 10, projects: 1,
            documents: 1, appointments: 2, ecommerce: 10, ai: 8
        },
        team: ["Solo io", "2–5", "6–20", "21–50", "50+"],
        tech: ["Medio", "Avanzato"],
        automation: ["Smart", "AI Mode 🤖"],
        integrations: ["Shopify", "WooCommerce", "Make", "Zapier"]
    },

    {
        id: "omnisend",
        name: "Omnisend",
        category: "E-commerce Marketing",
        description: "Email, SMS e automazioni marketing per negozi online.",
        pricingUrl: "https://www.omnisend.com/pricing/",
        affiliateUrl: "",
        needs: {
            crm: 5, automation: 9, email: 10, followup: 9, sales: 8,
            quotes: 1, excel: 2, marketing: 10, projects: 1,
            documents: 1, appointments: 1, ecommerce: 10, ai: 6
        },
        team: ["Solo io", "2–5", "6–20", "21–50"],
        tech: ["Base", "Medio"],
        automation: ["Semplice", "Smart"],
        integrations: ["Shopify", "WooCommerce", "Zapier"]
    },


    /* =========================================================
       CRM / SALES
       ========================================================= */

    {
        id: "activecampaign",
        name: "ActiveCampaign",
        category: "CRM & Marketing Automation",
        description: "CRM e automazioni avanzate per marketing, email, lead nurturing e vendite.",
        pricingUrl: "https://www.activecampaign.com/pricing",
        affiliateUrl: "",
        needs: {
            crm: 9, automation: 10, email: 10, followup: 10, sales: 8,
            quotes: 3, excel: 2, marketing: 10, projects: 2,
            documents: 2, appointments: 6, ecommerce: 7, ai: 7
        },
        team: ["2–5", "6–20", "21–50", "50+"],
        tech: ["Medio", "Avanzato"],
        automation: ["Smart", "AI Mode 🤖"],
        integrations: ["Make", "Zapier", "Shopify", "WordPress", "Salesforce"]
    },

    {
        id: "hubspot",
        name: "HubSpot",
        category: "CRM & Business",
        description: "Suite CRM e business per marketing, vendite, assistenza clienti e gestione dei lead.",
        pricingUrl: "https://www.hubspot.com/pricing",
        affiliateUrl: "",
        needs: {
            crm: 10, automation: 9, email: 8, followup: 9, sales: 9,
            quotes: 7, excel: 5, marketing: 9, projects: 5,
            documents: 5, appointments: 8, ecommerce: 6, ai: 8
        },
        team: ["2–5", "6–20", "21–50", "50+"],
        tech: ["Base", "Medio", "Avanzato"],
        automation: ["Smart", "AI Mode 🤖"],
        integrations: ["Make", "Zapier", "Microsoft 365", "Google Workspace", "Shopify"]
    },

    {
        id: "pipedrive",
        name: "Pipedrive",
        category: "CRM & Sales",
        description: "CRM focalizzato su pipeline commerciali, lead, opportunità e gestione delle vendite.",
        pricingUrl: "https://www.pipedrive.com/en/pricing",
        affiliateUrl: "",
        needs: {
            crm: 10, automation: 7, email: 7, followup: 9, sales: 10,
            quotes: 7, excel: 5, marketing: 5, projects: 3,
            documents: 4, appointments: 7, ecommerce: 3, ai: 6
        },
        team: ["Solo io", "2–5", "6–20", "21–50", "50+"],
        tech: ["Base", "Medio", "Avanzato"],
        automation: ["Semplice", "Smart"],
        integrations: ["Make", "Zapier", "Microsoft 365", "Google Workspace", "Slack"]
    },

    {
        id: "salesforce",
        name: "Salesforce",
        category: "CRM & Enterprise",
        description: "CRM enterprise per vendite, clienti, marketing, assistenza e automazione commerciale.",
        pricingUrl: "https://www.salesforce.com/eu/editions-pricing/",
        affiliateUrl: "",
        needs: {
            crm: 10, automation: 10, email: 8, followup: 10, sales: 10,
            quotes: 9, excel: 7, marketing: 9, projects: 5,
            documents: 6, appointments: 7, ecommerce: 5, ai: 10
        },
        team: ["6–20", "21–50", "50+"],
        tech: ["Medio", "Avanzato"],
        automation: ["Smart", "AI Mode 🤖"],
        integrations: ["Microsoft 365", "Google Workspace", "Make", "Zapier", "Slack"]
    },

    {
        id: "zoho-crm",
        name: "Zoho CRM",
        category: "CRM & Sales",
        description: "CRM completo per lead, clienti, vendite, automazioni e processi commerciali.",
        pricingUrl: "https://www.zoho.com/crm/zohocrm-pricing.html",
        affiliateUrl: "",
        needs: {
            crm: 10, automation: 9, email: 8, followup: 9, sales: 9,
            quotes: 8, excel: 7, marketing: 8, projects: 5,
            documents: 6, appointments: 7, ecommerce: 4, ai: 8
        },
        team: ["2–5", "6–20", "21–50", "50+"],
        tech: ["Medio", "Avanzato"],
        automation: ["Smart", "AI Mode 🤖"],
        integrations: ["Microsoft 365", "Google Workspace", "Make", "Zapier"]
    },

    {
        id: "freshsales",
        name: "Freshsales",
        category: "CRM & Sales",
        description: "CRM per lead, pipeline, email, vendite e automazione commerciale.",
        pricingUrl: "https://www.freshworks.com/crm/sales/pricing/",
        affiliateUrl: "",
        needs: {
            crm: 9, automation: 8, email: 8, followup: 9, sales: 9,
            quotes: 6, excel: 5, marketing: 7, projects: 3,
            documents: 4, appointments: 7, ecommerce: 3, ai: 8
        },
        team: ["2–5", "6–20", "21–50", "50+"],
        tech: ["Base", "Medio", "Avanzato"],
        automation: ["Smart", "AI Mode 🤖"],
        integrations: ["Microsoft 365", "Google Workspace", "Zapier", "Make"]
    },

    {
        id: "close",
        name: "Close",
        category: "CRM & Sales",
        description: "CRM orientato ai team commerciali con pipeline, comunicazioni e automazioni di vendita.",
        pricingUrl: "https://close.com/pricing/",
        affiliateUrl: "",
        needs: {
            crm: 10, automation: 8, email: 9, followup: 10, sales: 10,
            quotes: 5, excel: 4, marketing: 5, projects: 2,
            documents: 3, appointments: 6, ecommerce: 2, ai: 7
        },
        team: ["2–5", "6–20", "21–50"],
        tech: ["Medio", "Avanzato"],
        automation: ["Smart", "AI Mode 🤖"],
        integrations: ["Zapier", "Make", "Google Workspace", "Microsoft 365"]
    },

    {
        id: "copper",
        name: "Copper",
        category: "CRM",
        description: "CRM pensato per aziende che lavorano con Google Workspace e processi commerciali.",
        pricingUrl: "https://www.copper.com/pricing",
        affiliateUrl: "",
        needs: {
            crm: 10, automation: 7, email: 9, followup: 9, sales: 9,
            quotes: 6, excel: 4, marketing: 6, projects: 4,
            documents: 5, appointments: 7, ecommerce: 2, ai: 6
        },
        team: ["2–5", "6–20", "21–50", "50+"],
        tech: ["Base", "Medio"],
        automation: ["Semplice", "Smart"],
        integrations: ["Google Workspace", "Zapier", "Make", "Slack"]
    },

    {
        id: "keap",
        name: "Keap",
        category: "CRM & Automation",
        description: "CRM per piccole imprese con marketing automation, follow-up e gestione clienti.",
        pricingUrl: "https://keap.com/pricing",
        affiliateUrl: "",
        needs: {
            crm: 9, automation: 10, email: 9, followup: 10, sales: 9,
            quotes: 7, excel: 4, marketing: 9, projects: 2,
            documents: 4, appointments: 7, ecommerce: 5, ai: 5
        },
        team: ["Solo io", "2–5", "6–20"],
        tech: ["Base", "Medio"],
        automation: ["Smart", "AI Mode 🤖"],
        integrations: ["Zapier", "Make", "QuickBooks", "Google Workspace"]
    },


    /* =========================================================
       AUTOMATION
       ========================================================= */

    {
        id: "make",
        name: "Make",
        category: "Automation",
        description: "Piattaforma visuale per collegare applicazioni e creare automazioni avanzate.",
        pricingUrl: "https://www.make.com/en/pricing",
        affiliateUrl: "",
        needs: {
            crm: 6, automation: 10, email: 7, followup: 7, sales: 5,
            quotes: 4, excel: 9, marketing: 7, projects: 7,
            documents: 8, appointments: 7, ecommerce: 7, ai: 9
        },
        team: ["Solo io", "2–5", "6–20", "21–50", "50+"],
        tech: ["Medio", "Avanzato"],
        automation: ["Smart", "AI Mode 🤖"],
        integrations: ["Microsoft 365", "Excel", "Outlook", "Google Workspace", "Gmail", "Slack", "Shopify", "HubSpot", "Pipedrive", "OpenAI"]
    },

    {
        id: "zapier",
        name: "Zapier",
        category: "Automation",
        description: "Piattaforma per collegare applicazioni e automatizzare attività senza programmazione.",
        pricingUrl: "https://zapier.com/pricing",
        affiliateUrl: "",
        needs: {
            crm: 6, automation: 10, email: 8, followup: 8, sales: 5,
            quotes: 5, excel: 9, marketing: 8, projects: 7,
            documents: 8, appointments: 8, ecommerce: 8, ai: 9
        },
        team: ["Solo io", "2–5", "6–20", "21–50", "50+"],
        tech: ["Base", "Medio", "Avanzato"],
        automation: ["Semplice", "Smart", "AI Mode 🤖"],
        integrations: ["Microsoft 365", "Google Workspace", "Excel", "Slack", "Shopify", "HubSpot", "Pipedrive", "OpenAI"]
    },

    {
        id: "power-automate",
        name: "Microsoft Power Automate",
        category: "Automation",
        description: "Automazione dei flussi di lavoro integrata nell'ecosistema Microsoft 365.",
        pricingUrl: "https://www.microsoft.com/en-us/power-platform/products/power-automate/pricing",
        affiliateUrl: "",
        needs: {
            crm: 6, automation: 10, email: 9, followup: 8, sales: 5,
            quotes: 6, excel: 10, marketing: 5, projects: 8,
            documents: 10, appointments: 8, ecommerce: 5, ai: 9
        },
        team: ["Solo io", "2–5", "6–20", "21–50", "50+"],
        tech: ["Medio", "Avanzato"],
        automation: ["Smart", "AI Mode 🤖"],
        integrations: ["Microsoft 365", "Excel", "Outlook", "Teams", "SharePoint", "Power BI"]
    },

    {
        id: "n8n",
        name: "n8n",
        category: "Automation & AI",
        description: "Piattaforma di workflow automation flessibile per integrazioni, API e processi AI.",
        pricingUrl: "https://n8n.io/pricing/",
        affiliateUrl: "",
        needs: {
            crm: 7, automation: 10, email: 8, followup: 7, sales: 5,
            quotes: 6, excel: 7, marketing: 7, projects: 7,
            documents: 8, appointments: 7, ecommerce: 8, ai: 10
        },
        team: ["Solo io", "2–5", "6–20", "21–50", "50+"],
        tech: ["Avanzato"],
        automation: ["Smart", "AI Mode 🤖"],
        integrations: ["OpenAI", "Google Workspace", "Microsoft 365", "Slack", "Shopify", "PostgreSQL"]
    },


    /* =========================================================
       PROJECT MANAGEMENT
       ========================================================= */

    {
        id: "monday",
        name: "monday.com",
        category: "Project Management",
        description: "Piattaforma per progetti, workflow, team, CRM e gestione del lavoro.",
        pricingUrl: "https://monday.com/pricing",
        affiliateUrl: "",
        needs: {
            crm: 8, automation: 8, email: 5, followup: 7, sales: 7,
            quotes: 5, excel: 8, marketing: 6, projects: 10,
            documents: 7, appointments: 6, ecommerce: 3, ai: 7
        },
        team: ["2–5", "6–20", "21–50", "50+"],
        tech: ["Base", "Medio", "Avanzato"],
        automation: ["Semplice", "Smart", "AI Mode 🤖"],
        integrations: ["Microsoft 365", "Excel", "Outlook", "Google Workspace", "Slack", "Make", "Zapier"]
    },

    {
        id: "clickup",
        name: "ClickUp",
        category: "Project Management",
        description: "Work management con progetti, documenti, task, automazioni e funzioni AI.",
        pricingUrl: "https://clickup.com/pricing",
        affiliateUrl: "",
        needs: {
            crm: 7, automation: 9, email: 6, followup: 7, sales: 6,
            quotes: 5, excel: 7, marketing: 6, projects: 10,
            documents: 10, appointments: 6, ecommerce: 3, ai: 9
        },
        team: ["Solo io", "2–5", "6–20", "21–50", "50+"],
        tech: ["Medio", "Avanzato"],
        automation: ["Smart", "AI Mode 🤖"],
        integrations: ["Microsoft 365", "Google Workspace", "Slack", "Make", "Zapier"]
    },

    {
        id: "asana",
        name: "Asana",
        category: "Project Management",
        description: "Gestione di progetti, attività, team, workflow e obiettivi aziendali.",
        pricingUrl: "https://asana.com/pricing",
        affiliateUrl: "",
        needs: {
            crm: 5, automation: 8, email: 6, followup: 7, sales: 4,
            quotes: 3, excel: 7, marketing: 7, projects: 10,
            documents: 7, appointments: 5, ecommerce: 2, ai: 8
        },
        team: ["2–5", "6–20", "21–50", "50+"],
        tech: ["Base", "Medio", "Avanzato"],
        automation: ["Semplice", "Smart", "AI Mode 🤖"],
        integrations: ["Microsoft 365", "Google Workspace", "Slack", "Make", "Zapier"]
    },

    {
        id: "trello",
        name: "Trello",
        category: "Project Management",
        description: "Gestione visuale di attività e workflow tramite bacheche, liste e schede.",
        pricingUrl: "https://trello.com/pricing",
        affiliateUrl: "",
        needs: {
            crm: 4, automation: 6, email: 4, followup: 6, sales: 3,
            quotes: 2, excel: 5, marketing: 4, projects: 9,
            documents: 5, appointments: 3, ecommerce: 2, ai: 5
        },
        team: ["Solo io", "2–5", "6–20", "21–50"],
        tech: ["Base", "Medio"],
        automation: ["Semplice", "Smart"],
        integrations: ["Microsoft 365", "Google Workspace", "Slack", "Make", "Zapier"]
    },

    {
        id: "notion",
        name: "Notion",
        category: "Productivity & Knowledge",
        description: "Workspace per documenti, database, note, progetti, knowledge base e AI.",
        pricingUrl: "https://www.notion.com/pricing",
        affiliateUrl: "",
        needs: {
            crm: 6, automation: 7, email: 3, followup: 5, sales: 4,
            quotes: 4, excel: 7, marketing: 5, projects: 9,
            documents: 10, appointments: 3, ecommerce: 2, ai: 10
        },
        team: ["Solo io", "2–5", "6–20", "21–50", "50+"],
        tech: ["Base", "Medio", "Avanzato"],
        automation: ["Semplice", "Smart", "AI Mode 🤖"],
        integrations: ["Make", "Zapier", "Google Workspace", "Slack"]
    },

    {
        id: "basecamp",
        name: "Basecamp",
        category: "Project Management",
        description: "Workspace semplice per progetti, comunicazione, documenti e collaborazione.",
        pricingUrl: "https://basecamp.com/pricing",
        affiliateUrl: "",
        needs: {
            crm: 2, automation: 4, email: 5, followup: 6, sales: 2,
            quotes: 2, excel: 4, marketing: 2, projects: 9,
            documents: 8, appointments: 3, ecommerce: 1, ai: 4
        },
        team: ["2–5", "6–20", "21–50", "50+"],
        tech: ["Base", "Medio"],
        automation: ["Semplice"],
        integrations: ["Google Workspace", "Microsoft 365", "Zapier"]
    },

    {
        id: "wrike",
        name: "Wrike",
        category: "Project Management",
        description: "Work management per aziende con progetti, workflow, risorse e automazioni.",
        pricingUrl: "https://www.wrike.com/price/",
        affiliateUrl: "",
        needs: {
            crm: 5, automation: 8, email: 5, followup: 7, sales: 5,
            quotes: 4, excel: 8, marketing: 7, projects: 10,
            documents: 8, appointments: 5, ecommerce: 2, ai: 8
        },
        team: ["6–20", "21–50", "50+"],
        tech: ["Medio", "Avanzato"],
        automation: ["Smart", "AI Mode 🤖"],
        integrations: ["Microsoft 365", "Google Workspace", "Slack", "Salesforce"]
    },


    /* =========================================================
       EMAIL / COMMUNICATION
       ========================================================= */

    {
        id: "brevo",
        name: "Brevo",
        category: "Email & CRM",
        description: "Email marketing, SMS, CRM, automazioni e comunicazioni transazionali.",
        pricingUrl: "https://www.brevo.com/pricing/",
        affiliateUrl: "",
        needs: {
            crm: 7, automation: 9, email: 10, followup: 9, sales: 7,
            quotes: 2, excel: 3, marketing: 9, projects: 1,
            documents: 1, appointments: 6, ecommerce: 7, ai: 6
        },
        team: ["Solo io", "2–5", "6–20", "21–50"],
        tech: ["Base", "Medio", "Avanzato"],
        automation: ["Semplice", "Smart", "AI Mode 🤖"],
        integrations: ["Shopify", "WordPress", "Make", "Zapier"]
    },

    {
        id: "kit",
        name: "Kit",
        category: "Creator & Email",
        description: "Piattaforma per creator, newsletter, email marketing, automazioni e vendita di prodotti digitali.",
        pricingUrl: "https://kit.com/pricing",
        affiliateUrl: "",
        needs: {
            crm: 4, automation: 8, email: 10, followup: 9, sales: 7,
            quotes: 1, excel: 1, marketing: 9, projects: 1,
            documents: 1, appointments: 2, ecommerce: 7, ai: 5
        },
        team: ["Solo io", "2–5"],
        tech: ["Base", "Medio"],
        automation: ["Semplice", "Smart"],
        integrations: ["Shopify", "Stripe", "Zapier"]
    },

    {
        id: "constant-contact",
        name: "Constant Contact",
        category: "Email Marketing",
        description: "Email marketing e comunicazione digitale per piccole imprese e organizzazioni.",
        pricingUrl: "https://www.constantcontact.com/pricing",
        affiliateUrl: "",
        needs: {
            crm: 5, automation: 7, email: 10, followup: 7, sales: 5,
            quotes: 1, excel: 3, marketing: 9, projects: 1,
            documents: 2, appointments: 3, ecommerce: 5, ai: 5
        },
        team: ["Solo io", "2–5", "6–20", "21–50"],
        tech: ["Base", "Medio"],
        automation: ["Semplice", "Smart"],
        integrations: ["Shopify", "WordPress", "Zapier"]
    },

    {
        id: "drip",
        name: "Drip",
        category: "E-commerce Email",
        description: "CRM e marketing automation focalizzati su e-commerce e customer lifecycle.",
        pricingUrl: "https://www.drip.com/pricing",
        affiliateUrl: "",
        needs: {
            crm: 7, automation: 10, email: 10, followup: 10, sales: 8,
            quotes: 1, excel: 2, marketing: 10, projects: 1,
            documents: 1, appointments: 1, ecommerce: 10, ai: 6
        },
        team: ["Solo io", "2–5", "6–20", "21–50"],
        tech: ["Medio", "Avanzato"],
        automation: ["Smart", "AI Mode 🤖"],
        integrations: ["Shopify", "WooCommerce", "Zapier", "Make"]
    },


    /* =========================================================
       SEO / MARKETING
       ========================================================= */

    {
        id: "semrush",
        name: "Semrush",
        category: "SEO & Marketing",
        description: "Suite per SEO, ricerca keyword, analisi competitor, advertising e marketing digitale.",
        pricingUrl: "https://www.semrush.com/pricing/",
        affiliateUrl: "",
        needs: {
            crm: 1, automation: 3, email: 2, followup: 2, sales: 5,
            quotes: 1, excel: 4, marketing: 10, projects: 6,
            documents: 2, appointments: 1, ecommerce: 6, ai: 7
        },
        team: ["Solo io", "2–5", "6–20", "21–50", "50+"],
        tech: ["Medio", "Avanzato"],
        automation: ["Semplice", "Smart", "AI Mode 🤖"],
        integrations: ["Google Analytics", "Google Search Console", "Looker Studio", "Zapier"]
    },

    {
        id: "ahrefs",
        name: "Ahrefs",
        category: "SEO & Marketing",
        description: "Suite SEO per ricerca keyword, backlink, competitor e analisi della visibilità online.",
        pricingUrl: "https://ahrefs.com/pricing",
        affiliateUrl: "",
        needs: {
            crm: 1, automation: 2, email: 1, followup: 1, sales: 5,
            quotes: 1, excel: 5, marketing: 10, projects: 5,
            documents: 2, appointments: 1, ecommerce: 6, ai: 6
        },
        team: ["Solo io", "2–5", "6–20", "21–50", "50+"],
        tech: ["Medio", "Avanzato"],
        automation: ["Semplice", "Smart", "AI Mode 🤖"],
        integrations: ["Google Search Console", "Google Analytics", "Looker Studio"]
    },

    {
        id: "se-ranking",
        name: "SE Ranking",
        category: "SEO",
        description: "Piattaforma SEO per keyword tracking, competitor analysis, audit e marketing.",
        pricingUrl: "https://seranking.com/pricing/",
        affiliateUrl: "",
        needs: {
            crm: 1, automation: 2, email: 1, followup: 1, sales: 4,
            quotes: 1, excel: 5, marketing: 10, projects: 5,
            documents: 2, appointments: 1, ecommerce: 5, ai: 6
        },
        team: ["Solo io", "2–5", "6–20", "21–50"],
        tech: ["Medio", "Avanzato"],
        automation: ["Semplice", "Smart"],
        integrations: ["Google Analytics", "Google Search Console"]
    },


    /* =========================================================
       E-COMMERCE
       ========================================================= */

    {
        id: "shopify",
        name: "Shopify",
        category: "E-commerce",
        description: "Piattaforma completa per creare e gestire un negozio online.",
        pricingUrl: "https://www.shopify.com/pricing",
        affiliateUrl: "",
        needs: {
            crm: 6, automation: 7, email: 6, followup: 7, sales: 10,
            quotes: 4, excel: 5, marketing: 9, projects: 4,
            documents: 3, appointments: 3, ecommerce: 10, ai: 7
        },
        team: ["Solo io", "2–5", "6–20", "21–50", "50+"],
        tech: ["Base", "Medio", "Avanzato"],
        automation: ["Semplice", "Smart", "AI Mode 🤖"],
        integrations: ["Make", "Zapier", "HubSpot", "Klaviyo", "Google", "Meta"]
    },

    {
        id: "woocommerce",
        name: "WooCommerce",
        category: "E-commerce",
        description: "Soluzione e-commerce per WordPress con ampia possibilità di personalizzazione.",
        pricingUrl: "https://woocommerce.com/pricing/",
        affiliateUrl: "",
        needs: {
            crm: 5, automation: 8, email: 7, followup: 7, sales: 10,
            quotes: 6, excel: 6, marketing: 9, projects: 4,
            documents: 4, appointments: 4, ecommerce: 10, ai: 7
        },
        team: ["Solo io", "2–5", "6–20", "21–50", "50+"],
        tech: ["Medio", "Avanzato"],
        automation: ["Smart", "AI Mode 🤖"],
        integrations: ["WordPress", "Make", "Zapier", "Stripe", "PayPal"]
    },

    {
        id: "wix",
        name: "Wix",
        category: "Website & E-commerce",
        description: "Piattaforma per creare siti web, landing page e negozi online.",
        pricingUrl: "https://www.wix.com/upgrade/website",
        affiliateUrl: "",
        needs: {
            crm: 5, automation: 6, email: 6, followup: 6, sales: 7,
            quotes: 4, excel: 3, marketing: 8, projects: 3,
            documents: 3, appointments: 8, ecommerce: 8, ai: 8
        },
        team: ["Solo io", "2–5", "6–20"],
        tech: ["Base", "Medio"],
        automation: ["Semplice", "Smart", "AI Mode 🤖"],
        integrations: ["Google", "Meta", "Zapier", "Make", "Stripe"]
    },

    {
        id: "squarespace",
        name: "Squarespace",
        category: "Website & E-commerce",
        description: "Piattaforma per siti web, contenuti, vendita online e presenza digitale.",
        pricingUrl: "https://www.squarespace.com/pricing",
        affiliateUrl: "",
        needs: {
            crm: 3, automation: 5, email: 6, followup: 5, sales: 6,
            quotes: 2, excel: 2, marketing: 8, projects: 2,
            documents: 2, appointments: 6, ecommerce: 8, ai: 6
        },
        team: ["Solo io", "2–5", "6–20"],
        tech: ["Base", "Medio"],
        automation: ["Semplice", "Smart"],
        integrations: ["Stripe", "Google", "Zapier"]
    },


    /* =========================================================
       APPOINTMENTS
       ========================================================= */

    {
        id: "calendly",
        name: "Calendly",
        category: "Appointments",
        description: "Strumento per prenotazioni, appuntamenti e gestione automatica dei calendari.",
        pricingUrl: "https://calendly.com/pricing",
        affiliateUrl: "",
        needs: {
            crm: 5, automation: 8, email: 7, followup: 7, sales: 6,
            quotes: 1, excel: 2, marketing: 4, projects: 2,
            documents: 1, appointments: 10, ecommerce: 1, ai: 5
        },
        team: ["Solo io", "2–5", "6–20", "21–50", "50+"],
        tech: ["Base", "Medio"],
        automation: ["Semplice", "Smart"],
        integrations: ["Google Calendar", "Microsoft 365", "Zoom", "Make", "Zapier"]
    },

    {
        id: "acuity",
        name: "Acuity Scheduling",
        category: "Appointments",
        description: "Sistema di prenotazione online per professionisti e attività basate su appuntamenti.",
        pricingUrl: "https://www.acuityscheduling.com/pricing",
        affiliateUrl: "",
        needs: {
            crm: 5, automation: 7, email: 7, followup: 7, sales: 6,
            quotes: 2, excel: 2, marketing: 4, projects: 2,
            documents: 2, appointments: 10, ecommerce: 4, ai: 3
        },
        team: ["Solo io", "2–5", "6–20"],
        tech: ["Base", "Medio"],
        automation: ["Semplice", "Smart"],
        integrations: ["Google Calendar", "Zoom", "Stripe", "PayPal", "Zapier"]
    },

    {
        id: "cal-com",
        name: "Cal.com",
        category: "Appointments",
        description: "Piattaforma flessibile per scheduling e prenotazioni online.",
        pricingUrl: "https://cal.com/pricing",
        affiliateUrl: "",
        needs: {
            crm: 4, automation: 8, email: 6, followup: 6, sales: 5,
            quotes: 1, excel: 2, marketing: 3, projects: 2,
            documents: 1, appointments: 10, ecommerce: 3, ai: 5
        },
        team: ["Solo io", "2–5", "6–20", "21–50"],
        tech: ["Medio", "Avanzato"],
        automation: ["Smart", "AI Mode 🤖"],
        integrations: ["Google Calendar", "Microsoft 365", "Zoom", "Stripe", "Zapier"]
    },


    /* =========================================================
       DOCUMENTS / QUOTES / SIGNATURES
       ========================================================= */

    {
        id: "pandadoc",
        name: "PandaDoc",
        category: "Documents & Quotes",
        description: "Creazione, gestione, invio e firma di preventivi, proposte e documenti commerciali.",
        pricingUrl: "https://www.pandadoc.com/pricing/",
        affiliateUrl: "",
        needs: {
            crm: 7, automation: 8, email: 7, followup: 8, sales: 9,
            quotes: 10, excel: 5, marketing: 4, projects: 4,
            documents: 10, appointments: 4, ecommerce: 3, ai: 7
        },
        team: ["Solo io", "2–5", "6–20", "21–50", "50+"],
        tech: ["Base", "Medio", "Avanzato"],
        automation: ["Smart", "AI Mode 🤖"],
        integrations: ["HubSpot", "Salesforce", "Pipedrive", "Zapier", "Make"]
    },

    {
        id: "docusign",
        name: "DocuSign",
        category: "Documents & E-signature",
        description: "Firma elettronica e gestione digitale dei documenti.",
        pricingUrl: "https://www.docusign.com/products-and-pricing",
        affiliateUrl: "",
        needs: {
            crm: 5, automation: 7, email: 6, followup: 6, sales: 6,
            quotes: 7, excel: 3, marketing: 2, projects: 4,
            documents: 10, appointments: 2, ecommerce: 2, ai: 6
        },
        team: ["Solo io", "2–5", "6–20", "21–50", "50+"],
        tech: ["Base", "Medio", "Avanzato"],
        automation: ["Semplice", "Smart"],
        integrations: ["Salesforce", "Microsoft 365", "Google Workspace", "Zapier", "HubSpot"]
    },

    {
        id: "adobe-acrobat",
        name: "Adobe Acrobat",
        category: "Documents & PDF",
        description: "Creazione, modifica, conversione, firma e gestione professionale dei PDF.",
        pricingUrl: "https://www.adobe.com/acrobat/pricing.html",
        affiliateUrl: "",
        needs: {
            crm: 2, automation: 5, email: 4, followup: 3, sales: 3,
            quotes: 7, excel: 6, marketing: 2, projects: 4,
            documents: 10, appointments: 1, ecommerce: 1, ai: 7
        },
        team: ["Solo io", "2–5", "6–20", "21–50", "50+"],
        tech: ["Base", "Medio", "Avanzato"],
        automation: ["Semplice", "Smart", "AI Mode 🤖"],
        integrations: ["Microsoft 365", "Google Drive", "OneDrive", "SharePoint"]
    },


    /* =========================================================
       PRODUCTIVITY / FILES
       ========================================================= */

    {
        id: "microsoft-365",
        name: "Microsoft 365",
        category: "Productivity & Business",
        description: "Suite per email, documenti, Excel, collaborazione, riunioni e produttività aziendale.",
        pricingUrl: "https://www.microsoft.com/microsoft-365/business/compare-all-microsoft-365-business-products",
        affiliateUrl: "",
        needs: {
            crm: 5, automation: 8, email: 10, followup: 7, sales: 5,
            quotes: 7, excel: 10, marketing: 4, projects: 7,
            documents: 10, appointments: 9, ecommerce: 2, ai: 8
        },
        team: ["Solo io", "2–5", "6–20", "21–50", "50+"],
        tech: ["Base", "Medio", "Avanzato"],
        automation: ["Semplice", "Smart", "AI Mode 🤖"],
        integrations: ["Outlook", "Excel", "Teams", "SharePoint", "OneDrive", "Power Automate", "Power BI"]
    },

    {
        id: "google-workspace",
        name: "Google Workspace",
        category: "Productivity & Business",
        description: "Suite cloud per Gmail, Drive, Docs, Sheets, Meet e collaborazione.",
        pricingUrl: "https://workspace.google.com/pricing.html",
        affiliateUrl: "",
        needs: {
            crm: 4, automation: 8, email: 10, followup: 7, sales: 4,
            quotes: 6, excel: 9, marketing: 4, projects: 6,
            documents: 10, appointments: 9, ecommerce: 2, ai: 8
        },
        team: ["Solo io", "2–5", "6–20", "21–50", "50+"],
        tech: ["Base", "Medio", "Avanzato"],
        automation: ["Semplice", "Smart", "AI Mode 🤖"],
        integrations: ["Gmail", "Google Drive", "Google Sheets", "Google Calendar", "Make", "Zapier"]
    },

    {
        id: "airtable",
        name: "Airtable",
        category: "Database & Workflow",
        description: "Database visuale per organizzare dati, processi, workflow e applicazioni interne.",
        pricingUrl: "https://www.airtable.com/pricing",
        affiliateUrl: "",
        needs: {
            crm: 8, automation: 9, email: 5, followup: 7, sales: 6,
            quotes: 6, excel: 10, marketing: 6, projects: 9,
            documents: 7, appointments: 5, ecommerce: 5, ai: 8
        },
        team: ["Solo io", "2–5", "6–20", "21–50", "50+"],
        tech: ["Medio", "Avanzato"],
        automation: ["Smart", "AI Mode 🤖"],
        integrations: ["Make", "Zapier", "Google Workspace", "Microsoft 365", "Slack"]
    },

    {
        id: "dropbox",
        name: "Dropbox",
        category: "Cloud Storage & Documents",
        description: "Archiviazione cloud, condivisione file e collaborazione sui documenti.",
        pricingUrl: "https://www.dropbox.com/plans",
        affiliateUrl: "",
        needs: {
            crm: 2, automation: 5, email: 4, followup: 3, sales: 2,
            quotes: 3, excel: 5, marketing: 2, projects: 5,
            documents: 9, appointments: 1, ecommerce: 1, ai: 5
        },
        team: ["Solo io", "2–5", "6–20", "21–50", "50+"],
        tech: ["Base", "Medio"],
        automation: ["Semplice", "Smart"],
        integrations: ["Microsoft 365", "Google Workspace", "Slack", "Zapier"]
    },


    /* =========================================================
       AI
       ========================================================= */

    {
        id: "chatgpt",
        name: "ChatGPT",
        category: "AI",
        description: "Assistente AI per analisi, scrittura, brainstorming, documenti, ricerca e automazione di attività.",
        pricingUrl: "https://chatgpt.com/pricing/",
        affiliateUrl: "",
        needs: {
            crm: 5, automation: 8, email: 8, followup: 6, sales: 6,
            quotes: 7, excel: 8, marketing: 9, projects: 7,
            documents: 10, appointments: 3, ecommerce: 5, ai: 10
        },
        team: ["Solo io", "2–5", "6–20", "21–50", "50+"],
        tech: ["Base", "Medio", "Avanzato"],
        automation: ["Smart", "AI Mode 🤖"],
        integrations: ["Microsoft 365", "Google Workspace", "Make", "Zapier", "OpenAI"]
    },

    {
        id: "claude",
        name: "Claude",
        category: "AI",
        description: "Assistente AI per analisi, scrittura, ragionamento, documenti e lavoro professionale.",
        pricingUrl: "https://www.anthropic.com/pricing",
        affiliateUrl: "",
        needs: {
            crm: 4, automation: 7, email: 7, followup: 5, sales: 5,
            quotes: 6, excel: 7, marketing: 8, projects: 7,
            documents: 10, appointments: 2, ecommerce: 4, ai: 10
        },
        team: ["Solo io", "2–5", "6–20", "21–50", "50+"],
        tech: ["Base", "Medio", "Avanzato"],
        automation: ["Smart", "AI Mode 🤖"],
        integrations: ["Google Workspace", "Microsoft 365", "API", "Make"]
    },

    {
        id: "jasper",
        name: "Jasper",
        category: "AI Marketing",
        description: "AI focalizzata sulla creazione di contenuti, marketing e comunicazione aziendale.",
        pricingUrl: "https://www.jasper.ai/pricing",
        affiliateUrl: "",
        needs: {
            crm: 2, automation: 6, email: 8, followup: 5, sales: 4,
            quotes: 1, excel: 2, marketing: 10, projects: 4,
            documents: 8, appointments: 1, ecommerce: 5, ai: 10
        },
        team: ["Solo io", "2–5", "6–20", "21–50"],
        tech: ["Base", "Medio"],
        automation: ["Smart", "AI Mode 🤖"],
        integrations: ["Google Workspace", "Microsoft 365", "Zapier"]
    },


    /* =========================================================
       DESIGN / CONTENT
       ========================================================= */

    {
        id: "canva",
        name: "Canva",
        category: "Design & Marketing",
        description: "Creazione semplice di grafiche, presentazioni, contenuti social e materiali marketing.",
        pricingUrl: "https://www.canva.com/pricing/",
        affiliateUrl: "",
        needs: {
            crm: 1, automation: 3, email: 4, followup: 2, sales: 4,
            quotes: 4, excel: 2, marketing: 10, projects: 5,
            documents: 7, appointments: 1, ecommerce: 5, ai: 8
        },
        team: ["Solo io", "2–5", "6–20", "21–50", "50+"],
        tech: ["Base", "Medio"],
        automation: ["Semplice", "Smart", "AI Mode 🤖"],
        integrations: ["Google Drive", "Microsoft 365", "Dropbox", "Slack"]
    },


    /* =========================================================
       ACCOUNTING / BUSINESS
       ========================================================= */

    {
        id: "quickbooks",
        name: "QuickBooks",
        category: "Accounting & Finance",
        description: "Gestione contabile, fatture, spese, pagamenti e dati finanziari per imprese.",
        pricingUrl: "https://quickbooks.intuit.com/pricing/",
        affiliateUrl: "",
        needs: {
            crm: 5, automation: 7, email: 5, followup: 5, sales: 6,
            quotes: 8, excel: 8, marketing: 2, projects: 6,
            documents: 7, appointments: 1, ecommerce: 5, ai: 6
        },
        team: ["Solo io", "2–5", "6–20", "21–50", "50+"],
        tech: ["Base", "Medio", "Avanzato"],
        automation: ["Semplice", "Smart"],
        integrations: ["Shopify", "Stripe", "PayPal", "Zapier"]
    },

    {
        id: "holded",
        name: "Holded",
        category: "Business Management",
        description: "Gestione aziendale con fatturazione, contabilità, CRM, progetti e automazioni.",
        pricingUrl: "https://www.holded.com/pricing",
        affiliateUrl: "",
        needs: {
            crm: 8, automation: 8, email: 6, followup: 7, sales: 8,
            quotes: 10, excel: 7, marketing: 4, projects: 8,
            documents: 9, appointments: 4, ecommerce: 5, ai: 6
        },
        team: ["Solo io", "2–5", "6–20", "21–50"],
        tech: ["Base", "Medio"],
        automation: ["Smart", "AI Mode 🤖"],
        integrations: ["Shopify", "Stripe", "Zapier", "Google Workspace"]
    },


    /* =========================================================
       EXTRA CRM / BUSINESS
       ========================================================= */

    {
        id: "capsule",
        name: "Capsule CRM",
        category: "CRM",
        description: "CRM semplice per gestione contatti, opportunità, pipeline e attività commerciali.",
        pricingUrl: "https://capsulecrm.com/pricing/",
        affiliateUrl: "",
        needs: {
            crm: 9, automation: 6, email: 7, followup: 8, sales: 8,
            quotes: 5, excel: 5, marketing: 4, projects: 3,
            documents: 4, appointments: 5, ecommerce: 2, ai: 5
        },
        team: ["Solo io", "2–5", "6–20"],
        tech: ["Base", "Medio"],
        automation: ["Semplice", "Smart"],
        integrations: ["Google Workspace", "Microsoft 365", "Zapier"]
    },

    {
        id: "insightly",
        name: "Insightly",
        category: "CRM & Project Management",
        description: "CRM con gestione progetti, clienti, pipeline e workflow.",
        pricingUrl: "https://www.insightly.com/pricing/",
        affiliateUrl: "",
        needs: {
            crm: 9, automation: 8, email: 7, followup: 8, sales: 8,
            quotes: 6, excel: 6, marketing: 5, projects: 8,
            documents: 6, appointments: 5, ecommerce: 3, ai: 6
        },
        team: ["2–5", "6–20", "21–50", "50+"],
        tech: ["Medio", "Avanzato"],
        automation: ["Smart"],
        integrations: ["Google Workspace", "Microsoft 365", "Zapier", "Make"]
    },

    {
        id: "scoro",
        name: "Scoro",
        category: "Business Management",
        description: "Piattaforma per gestione aziendale, progetti, vendite, fatturazione e reporting.",
        pricingUrl: "https://www.scoro.com/pricing/",
        affiliateUrl: "",
        needs: {
            crm: 8, automation: 8, email: 6, followup: 7, sales: 8,
            quotes: 9, excel: 8, marketing: 6, projects: 10,
            documents: 8, appointments: 5, ecommerce: 2, ai: 7
        },
        team: ["6–20", "21–50", "50+"],
        tech: ["Medio", "Avanzato"],
        automation: ["Smart", "AI Mode 🤖"],
        integrations: ["Microsoft 365", "Google Workspace", "Zapier"]
    },


    /* =========================================================
       END
       ========================================================= */

];


/* =========================================================
   ESPOSIZIONE GLOBALE
   ========================================================= */

if (typeof window !== "undefined") {
    window.SOFTWARE_DATABASE = SOFTWARE_DATABASE;
}
