# PROJECT-X — Monetization & automation setup

## Affiliate

Set these Vercel environment variables for Production:

- `AFFILIATE_SYSTEME`
- `AFFILIATE_PIPEDRIVE`
- `AFFILIATE_GETRESPONSE`
- `AFFILIATE_ACTIVECAMPAIGN`
- `AFFILIATE_HUBSPOT`
- `AFFILIATE_SHOPIFY`
- `AFFILIATE_MAKE`

Use the exact personal referral URL supplied by each provider after approval. Do not paste dashboard passwords, API keys or other secrets into the repository.

Until a variable is configured, `/api/affiliate?tool=...` falls back to the provider's public website instead of using an invented referral link.

## Tracking

`EVENT_WEBHOOK_URL` receives server-side events such as `affiliate_redirect` and frontend events such as analysis completion, Coach usage and Report PRO views.

## Report PRO

Set the Vercel Production environment variable:

- `PRO_CHECKOUT_URL`

The checkout redirect adds `source=project-x` and `product=project-x-report-pro`.

## AI Coach

Open `/coach.html` to use the conversational entry point.

Optional environment variables:

- `OPENAI_API_KEY`
- `OPENAI_MODEL` (optional override; otherwise the existing PROJECT-X default is used)

The Coach does not choose software. It collects business context and hands the structured answers to the Decision Engine.

## Lead scoring

`/api/lead` now returns and forwards:

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
