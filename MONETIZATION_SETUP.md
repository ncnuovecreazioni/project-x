# PROJECT-X — Monetization setup

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

`EVENT_WEBHOOK_URL` can receive server-side `affiliate_redirect` events with the software, source and monetized flag.

The existing frontend also records `affiliate_click` events.

## Report PRO

Set the Vercel Production environment variable:

- `PRO_CHECKOUT_URL`

This should be the public checkout/payment URL for the Report PRO product. The code redirects to that URL and adds `source=project-x` and `product=project-x-report-pro` query parameters.

## Important

Affiliate approval and payment-provider setup are external account actions. The repository intentionally contains no personal affiliate IDs or payment secrets.
