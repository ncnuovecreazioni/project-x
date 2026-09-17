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
      envKey: 'AFFILIATE_SYSTEME'
    },
    pipedrive: {
      id: 'pipedrive',
      name: 'Pipedrive',
      officialProgramUrl: 'https://www.pipedrive.com/it/affiliate-partnership',
      productUrl: 'https://www.pipedrive.com/',
      envKey: 'AFFILIATE_PIPEDRIVE'
    },
    getresponse: {
      id: 'getresponse',
      name: 'GetResponse',
      officialProgramUrl: 'https://www.getresponse.com/it/programmi-di-affiliazione',
      productUrl: 'https://www.getresponse.com/',
      envKey: 'AFFILIATE_GETRESPONSE'
    },
    activecampaign: {
      id: 'activecampaign',
      name: 'ActiveCampaign',
      officialProgramUrl: 'https://www.activecampaign.com/it/partners/affiliate',
      productUrl: 'https://www.activecampaign.com/',
      envKey: 'AFFILIATE_ACTIVECAMPAIGN'
    },
    hubspot: {
      id: 'hubspot',
      name: 'HubSpot',
      officialProgramUrl: 'https://www.hubspot.com/partners/affiliates',
      productUrl: 'https://www.hubspot.com/',
      envKey: 'AFFILIATE_HUBSPOT'
    },
    shopify: {
      id: 'shopify',
      name: 'Shopify',
      officialProgramUrl: 'https://www.shopify.com/it/affiliati',
      productUrl: 'https://www.shopify.com/it/',
      envKey: 'AFFILIATE_SHOPIFY'
    },
    make: {
      id: 'make',
      name: 'Make',
      officialProgramUrl: 'https://www.make.com/en/affiliate',
      productUrl: 'https://www.make.com/',
      envKey: 'AFFILIATE_MAKE'
    }
  };
})();
