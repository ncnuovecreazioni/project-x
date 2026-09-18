# PROJECT-X — Monetization & automation setup

## Affiliate

Set these Vercel environment variables for Production after approval by each provider:

- `AFFILIATE_SYSTEME`
- `AFFILIATE_PIPEDRIVE`
- `AFFILIATE_GETRESPONSE`
- `AFFILIATE_ACTIVECAMPAIGN`
- `AFFILIATE_HUBSPOT`
- `AFFILIATE_SHOPIFY`
- `AFFILIATE_MAKE`
- `AFFILIATE_BREVO`
- `AFFILIATE_MONDAY`
- `AFFILIATE_SEMRUSH`
- `AFFILIATE_KIT`

Use the exact personal referral URL supplied by each provider after approval. Do not paste dashboard passwords, API keys or other secrets into the repository.

Until a variable is configured, `/api/affiliate?tool=...` falls back to the provider's public website instead of using an invented referral link.

The Affiliate Center is available at `/affiliate.html` and now shows the commercial terms stored in the registry.

## Commercial layer

The Decision Engine ranking remains compatibility-first. Commercial metadata is a separate layer used to:

- connect a selected tool to an official affiliate program when one exists;
- show commission model, duration and cookie information where the provider publishes it;
- add eligible commercial tools to the runtime catalog without changing the scoring logic;
- keep a transparent provider-source link for each program.

Current expanded runtime additions include Brevo, monday.com, Semrush and Kit.

## Tracking

`EVENT_WEBHOOK_URL` receives server-side events such as `affiliate_redirect` and frontend events such as analysis completion, Coach usage and Report PRO views.

## Report PRO

Set the Vercel Production environment variable:

- `PRO_CHECKOUT_URL`

The checkout starts through `/api/pro-checkout`. When `STRIPE_SECRET_KEY` is configured, PROJECT-X creates a native Stripe Checkout Session with `client_reference_id` and metadata; otherwise it keeps `PRO_CHECKOUT_URL` as a fallback.

### PRO automatico

Variabili principali:
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `PRO_CHECKOUT_URL`
- `STRIPE_PRICE_ID` (opzionale: il sistema prova a ricavare il Price dal Payment Link)
- `APP_URL` (opzionale)
- `RESEND_API_KEY` + `EMAIL_FROM` (opzionali per la ricevuta email automatica)
- `PRO_INTAKE_WEBHOOK_URL` + `PRO_ORDER_WEBHOOK_URL` (opzionali per archivio/automation esterni)

Il successo viene verificato lato server tramite `/api/stripe-session`; il Report PRO viene mostrato da `/pro-delivery.html` solo quando la sessione risulta pagata.

## AI Coach

Open `/coach.html` to use the conversational entry point.

Optional environment variables:

- `OPENAI_API_KEY`
- `OPENAI_MODEL` (optional override; otherwise the existing PROJECT-X default is used)

The Coach does not choose software. It collects business context and hands the structured answers to the Decision Engine.

## Lead scoring

`/api/lead` returns and forwards:

- `leadScore` from 0–100
- `leadTemperature`: `HOT`, `WARM` or `COLD`
- `tags`
- `recommendedFollowup`
- `leadId`

The score uses declared intent, budget, team size, time at stake, problem detail and existing tools. It is deterministic and does not alter the software ranking.

## External automation

`LEAD_WEBHOOK_URL` is still the main CRM/automation bridge. The webhook can use `leadTemperature` and `recommendedFollowup` to route high-priority leads and start different sequences.

## Data handling

PROJECT-X does not intentionally persist Coach conversations or AI responses in the repository. The AI request uses `store: false`. Leads and analytics are sent only to the webhooks configured by the site owner.

## Configurazione checkout PRO

PROJECT-X usa la variabile Vercel `PRO_CHECKOUT_URL`. La soluzione più semplice per partire è Stripe Payment Links: Stripe indica che i Payment Links permettono di vendere prodotti o servizi tramite una pagina di pagamento senza codice e che il prodotto standard non prevede canoni mensili; si applicano le commissioni sulle transazioni. Verifica sempre le tariffe applicabili al tuo account e al metodo di pagamento. 

1. Apri Stripe e crea il prodotto **PROJECT-X Report PRO**.
2. Imposta il prezzo iniziale a **29 EUR**, una tantum.
3. Crea un **Payment Link** per il prodotto.
4. Imposta, nella configurazione di Stripe, l'eventuale pagina di ritorno dopo il pagamento su `https://project-x-phi-steel.vercel.app/pro-success.html`.
5. In Vercel aggiungi `PRO_CHECKOUT_URL` con il Payment Link.
6. Ridistribuisci il progetto e prova un acquisto in modalità reale solo dopo aver verificato prezzo, dati fiscali, condizioni e consegna del prodotto.

Fonte ufficiale Stripe: https://stripe.com/it/payments/payment-links
