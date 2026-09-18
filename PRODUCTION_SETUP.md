# PROJECT-X — PRODUCTION SETUP

## Stato
Il repository contiene già il flusso gratuito, affiliate, Report PRO, intake, Stripe webhook, verifica pagamento e pagina di consegna.

## Vercel Environment Variables

### Già presenti / principali
- PRO_CHECKOUT_URL = il Payment Link Stripe attualmente utilizzato.
- STRIPE_WEBHOOK_SECRET = signing secret del webhook Stripe.

### Per attivare il percorso automatico completo
Aggiungi:
- STRIPE_SECRET_KEY = chiave segreta Stripe dell'ambiente corretto (test o live).

Non è obbligatorio impostare STRIPE_PRICE_ID: PROJECT-X può provare a risalire automaticamente al Price del Payment Link configurato in PRO_CHECKOUT_URL. Se preferisci evitare questa ricerca, puoi aggiungere anche:
- STRIPE_PRICE_ID = price_...

Opzionale:
- APP_URL = URL pubblico canonico del sito, ad esempio https://project-x-phi-steel.vercel.app

### Automazioni / persistenza esterna
Per collegare intake e ordini a un archivio o automation:
- PRO_INTAKE_WEBHOOK_URL = webhook che riceve il profilo prima del pagamento.
- PRO_ORDER_WEBHOOK_URL = webhook che riceve la conferma Stripe.
- EVENT_WEBHOOK_URL = webhook eventi analytics.
- LEAD_WEBHOOK_URL = webhook lead. Se PRO_INTAKE_WEBHOOK_URL o PRO_ORDER_WEBHOOK_URL non sono impostati, alcune funzioni usano questo come fallback.

## Stripe Webhook
Endpoint: /api/stripe-webhook

Evento principale: checkout.session.completed

Il webhook verifica la firma Stripe e accetta gli ordini PRO quando:
1. il metadata product è project-x-report-pro, oppure
2. il Payment Link coincide con STRIPE_PAYMENT_LINK_ID, oppure
3. come fallback, la sessione è legata a un Payment Link e il totale è 29 EUR.

Per maggiore precisione in produzione puoi impostare:
- STRIPE_PAYMENT_LINK_ID = ID del Payment Link Stripe

## Consegna PRO
Quando il checkout usa una Checkout Session nativa:
1. PROJECT-X crea la sessione.
2. passa client_reference_id e metadata.
3. Stripe reindirizza a /pro-success.html?session_id=...
4. /api/stripe-session verifica lato server.
5. /pro-delivery.html mostra il Report PRO solo con pagamento verificato.

La pagina di consegna ricostruisce il report dal profilo salvato nel browser dell'utente. La consegna email/server-side richiede un archivio esterno tramite webhook.

## Verifica
API pubblica di readiness: /api/health

Stato checkout: /api/checkout-status

Dashboard privata: /dashboard.html

## Importante
Non inserire mai STRIPE_SECRET_KEY o STRIPE_WEBHOOK_SECRET nel codice client, in GitHub, in HTML o in JavaScript eseguito nel browser.
