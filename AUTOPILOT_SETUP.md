# PROJECT-X AUTOPILOT

PROJECT-X ora ha un livello di crescita automatica separato dal motore di raccomandazione.

## Cosa fa da solo

- raccoglie eventi di funnel senza salvare dati personali nel browser;
- assegna una sessione anonima e misura analisi, scroll, permanenza e CTA;
- mostra una live demo del processo nella home;
- ricorda localmente in forma anonima il percorso del visitatore e adatta la UX quando ritorna;
- ruota tre varianti della hero/subcopy;
- quando esiste un feed aggregato, sceglie automaticamente la variante con il miglior tasso di conversione dopo un minimo di 10 visualizzazioni;
- mostra un next-best-action commerciale coerente con il profilo raccolto;
- genera progressivamente nuove landing SEO da un catalogo di intenti ad alta utilità;
- aggiorna automaticamente la sitemap;
- invia un digest operativo giornaliero tramite webhook;
- mantiene il motore deterministico separato dagli esperimenti di crescita;
- espone una Control Room privata per vedere stato, esperimenti e conversioni aggregate.

## Variabili Vercel

### Automazione giornaliera

`CRON_SECRET`

Stringa casuale lunga almeno 16 caratteri. Vercel la invia come `Authorization: Bearer ...` quando esegue il Cron Job.

### Control Room privata

`DASHBOARD_TOKEN`

Token lungo e casuale usato da `/dashboard.html` per autorizzare `/api/autopilot?mode=dashboard`.

### Necessarie per imparare dai dati

`EVENT_WEBHOOK_URL`

Webhook che riceve gli eventi del sito. Deve idealmente salvare o aggregare eventi in un sistema esterno.

`AUTOPILOT_DATA_URL`

Endpoint HTTPS che restituisce un JSON aggregato. Esempio minimo:

```json
{
  "variants": {
    "A": {"views": 120, "conversions": 9},
    "B": {"views": 110, "conversions": 14},
    "C": {"views": 105, "conversions": 8}
  },
  "eventCounts": {
    "affiliate_redirect": 23
  },
  "conversions": {
    "pro": 4,
    "implementation": 2,
    "affiliate": 23,
    "lead": 11
  }
}
```

Il feed può essere costruito con Make, Power Automate, un database o un'altra automazione. PROJECT-X usa solo dati aggregati e non ha bisogno di leggere email o contenuti personali.

### Digest operativo

`AUTOPILOT_WEBHOOK_URL`

Destinazione del digest prodotto dal Cron Job. Se assente, usa `EVENT_WEBHOOK_URL`.

### Monetizzazione già supportata

`PRO_CHECKOUT_URL`

Link al checkout del Report PRO.

`LEAD_WEBHOOK_URL`

Webhook/CRM per ricevere i lead con score, temperatura e intento.

Gli affiliate restano server-side tramite le variabili `AFFILIATE_*` già previste dal progetto. Inserire esclusivamente i propri link referral ufficialmente assegnati dai programmi.

## SEO Autopilot

`.github/workflows/seo-autopilot.yml` esegue ogni giorno lo script `scripts/seo-autopilot.mjs`.

Lo script sceglie il prossimo intento non ancora pubblicato da `seo-topics.json`, genera una landing HTML coerente con il template PROJECT-X e aggiunge l'URL alla sitemap. Il catalogo contiene decine di professioni, problemi e casi d'uso ed è estendibile aggiungendo oggetti al JSON.

## Control Room

Apri `/dashboard.html` e usa `DASHBOARD_TOKEN`. La dashboard mostra esclusivamente aggregati provenienti da `AUTOPILOT_DATA_URL` e lo stato delle integrazioni rilevate dal control plane.

## Nota importante

Il sistema può automatizzare osservazione, selezione di varianti, crescita SEO e instradamento commerciale, ma nessun codice può garantire ricavi. I ricavi dipendono da traffico reale, tassi di conversione, programmi affiliate approvati, checkout e qualità dei lead.
