export default async function handler(req, res) {
  try {
    const tool = String((req.query && req.query.tool) || '').toLowerCase().trim();
    const source = String((req.query && req.query.source) || 'project-x').slice(0, 120);
    const sessionId = String((req.query && req.query.sessionId) || '').slice(0, 160);

    const targets = {
      systeme: {
        name: 'Systeme.io',
        env: 'AFFILIATE_SYSTEME',
        fallback: 'https://systeme.io/',
      },
      pipedrive: {
        name: 'Pipedrive',
        env: 'AFFILIATE_PIPEDRIVE',
        fallback: 'https://www.pipedrive.com/'
      },
      getresponse: {
        name: 'GetResponse',
        env: 'AFFILIATE_GETRESPONSE',
        fallback: 'https://www.getresponse.com/'
      },
      activecampaign: {
        name: 'ActiveCampaign',
        env: 'AFFILIATE_ACTIVECAMPAIGN',
        fallback: 'https://www.activecampaign.com/'
      },
      hubspot: {
        name: 'HubSpot',
        env: 'AFFILIATE_HUBSPOT',
        fallback: 'https://www.hubspot.com/'
      },
      shopify: {
        name: 'Shopify',
        env: 'AFFILIATE_SHOPIFY',
        fallback: 'https://www.shopify.com/it/'
      },
      make: {
        name: 'Make',
        env: 'AFFILIATE_MAKE',
        fallback: 'https://www.make.com/',
      },
      brevo: {
        name: 'Brevo',
        env: 'AFFILIATE_BREVO',
        fallback: 'https://www.brevo.com/it/'
      },
      monday: {
        name: 'monday.com',
        env: 'AFFILIATE_MONDAY',
        fallback: 'https://monday.com/'
      },
      semrush: {
        name: 'Semrush',
        env: 'AFFILIATE_SEMRUSH',
        fallback: 'https://it.semrush.com/'
      },
      kit: {
        name: 'Kit',
        env: 'AFFILIATE_KIT',
        fallback: 'https://kit.com/'
      }
    };

    const target = targets[tool];
    if (!target) {
      return res.status(404).json({ success: false, error: 'Software non configurato.' });
    }

    const configuredUrl = String(process.env[target.env] || '').trim();
    const destination = /^https?:\/\//i.test(configuredUrl)
      ? configuredUrl
      : target.fallback;
    const monetized = !!configuredUrl;

    const analyticsConsent = String((req.query && req.query.analyticsConsent) || '').trim() === '1';
    const webhook = String(process.env.EVENT_WEBHOOK_URL || '').trim();
    if (webhook && analyticsConsent) {
      try {
        await fetch(webhook, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            source: 'project-x',
            timestamp: new Date().toISOString(),
            event: 'affiliate_redirect',
            sessionId: sessionId || null,
            meta: {
              tool: target.name,
              toolId: tool,
              channel: source,
              monetized: monetized,
              destinationHost: new URL(destination).host
            }
          })
        });
      } catch (e) {}
    }

    res.setHeader('Cache-Control', 'no-store');
    return res.redirect(302, destination);
  } catch (e) {
    return res.status(500).json({ success: false, error: 'Impossibile completare il redirect.' });
  }
}