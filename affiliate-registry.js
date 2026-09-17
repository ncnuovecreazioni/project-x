/* PROJECT-X — Affiliate Registry
   Current official affiliate programs verified from providers' public pages.
   Personal affiliate links are intentionally not invented: insert them in Vercel
   environment variables when the provider approves your account.
*/
(function(){
  'use strict';
  window.ProjectXAffiliateRegistry = {
    systeme: {
      id: 'systeme',
      name: 'Systeme.io',
      officialProgramUrl: 'https://systeme.io/it/affiliate-program',
      productUrl: 'https://systeme.io/',
      envKey: 'AFFILIATE_SYSTEME',
      verified: true,
      commissionLabel: '60% a vita',
      recurring: true,
      durationLabel: 'Lifetime',
      cookieDays: null,
      model: 'Revenue share',
      sourceUrl: 'https://systeme.io/it/affiliate-program',
      commercialNote: 'Commissione del 60% sulle vendite generate dal referral, secondo i termini del programma.'
    },
    pipedrive: {
      id: 'pipedrive',
      name: 'Pipedrive',
      officialProgramUrl: 'https://www.pipedrive.com/it/affiliate-partnership',
      productUrl: 'https://www.pipedrive.com/',
      envKey: 'AFFILIATE_PIPEDRIVE',
      verified: true,
      commissionLabel: '20% base · 30% crescita',
      recurring: true,
      durationLabel: 'Primi 12 mesi',
      cookieDays: 90,
      model: 'Revenue share',
      sourceUrl: 'https://www.pipedrive.com/it/affiliate-partnership',
      commercialNote: '20% per i primi 12 mesi; 30% per il livello Growth secondo i criteri del programma.'
    },
    getresponse: {
      id: 'getresponse',
      name: 'GetResponse',
      officialProgramUrl: 'https://www.getresponse.com/it/programmi-di-affiliazione',
      productUrl: 'https://www.getresponse.com/',
      envKey: 'AFFILIATE_GETRESPONSE',
      verified: true,
      commissionLabel: '40% base · fino al 60%',
      recurring: true,
      durationLabel: '12 mesi',
      cookieDays: 90,
      model: 'Recurring revenue share',
      sourceUrl: 'https://www.getresponse.com/it/programmi-di-affiliazione',
      commercialNote: '40% per i partner Bronze; 50% dopo 50 vendite in 12 mesi; 60% dopo 100 vendite.'
    },
    activecampaign: {
      id: 'activecampaign',
      name: 'ActiveCampaign',
      officialProgramUrl: 'https://www.activecampaign.com/it/partners/affiliate',
      productUrl: 'https://www.activecampaign.com/',
      envKey: 'AFFILIATE_ACTIVECAMPAIGN',
      verified: true,
      commissionLabel: '30% ricorrente',
      recurring: true,
      durationLabel: 'Fino a 12 mesi',
      cookieDays: null,
      model: 'Recurring revenue share',
      sourceUrl: 'https://help.activecampaign.com/hc/it/articles/115000065864-Programma-affiliazione',
      commercialNote: '30% di commissione ricorrente per ogni nuovo referral idoneo, fino a 12 mesi.'
    },
    hubspot: {
      id: 'hubspot',
      name: 'HubSpot',
      officialProgramUrl: 'https://www.hubspot.com/partners/affiliates',
      productUrl: 'https://www.hubspot.com/',
      envKey: 'AFFILIATE_HUBSPOT',
      verified: true,
      commissionLabel: '30% ricorrente',
      recurring: true,
      durationLabel: 'Fino a 1 anno',
      cookieDays: 180,
      model: 'Recurring revenue share',
      sourceUrl: 'https://www.hubspot.com/partners/affiliates',
      commercialNote: '30% di commissione ricorrente fino a un anno; il programma prevede livelli e condizioni aggiuntive.'
    },
    shopify: {
      id: 'shopify',
      name: 'Shopify',
      officialProgramUrl: 'https://www.shopify.com/it/affiliati',
      productUrl: 'https://www.shopify.com/it/',
      envKey: 'AFFILIATE_SHOPIFY',
      verified: true,
      commissionLabel: 'Fino a 150 USD/referral',
      recurring: false,
      durationLabel: 'Referral idoneo',
      cookieDays: null,
      model: 'Referral bounty',
      sourceUrl: 'https://www.shopify.com/it/affiliati',
      commercialNote: 'Pagamento fino a 150 USD per referral idoneo; l’importo varia in base alla sede del referral.'
    },
    make: {
      id: 'make',
      name: 'Make',
      officialProgramUrl: 'https://www.make.com/en/affiliate',
      productUrl: 'https://www.make.com/',
      envKey: 'AFFILIATE_MAKE',
      verified: true,
      commissionLabel: '35% ricorrente',
      recurring: true,
      durationLabel: '12 mesi',
      cookieDays: null,
      model: 'Recurring revenue share',
      sourceUrl: 'https://help.make.com/affiliate-program',
      commercialNote: '35% delle sottoscrizioni pagate per 12 mesi dalla registrazione tramite link affiliato.'
    }
  };
})();
