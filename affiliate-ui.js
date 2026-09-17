/* PROJECT-X monetization UI bridge.
   Loaded after the existing app without changing the decision engine.
*/
(function(){
  'use strict';

  var hostToTool = {
    'systeme.io':'systeme',
    'www.systeme.io':'systeme',
    'pipedrive.com':'pipedrive',
    'www.pipedrive.com':'pipedrive',
    'getresponse.com':'getresponse',
    'www.getresponse.com':'getresponse',
    'activecampaign.com':'activecampaign',
    'www.activecampaign.com':'activecampaign',
    'hubspot.com':'hubspot',
    'www.hubspot.com':'hubspot',
    'shopify.com':'shopify',
    'www.shopify.com':'shopify',
    'make.com':'make',
    'www.make.com':'make'
  };

  function rewriteAffiliateLinks(){
    var links=document.querySelectorAll('#primaryLink');
    Array.prototype.forEach.call(links,function(link){
      if(link.dataset.pxAffiliateWired==='1') return;
      try{
        var u=new URL(link.href,window.location.origin);
        var tool=hostToTool[u.hostname.toLowerCase()];
        if(!tool) return;
        link.href='/api/affiliate?tool='+encodeURIComponent(tool)+'&source=results';
        link.dataset.pxAffiliateWired='1';
        link.target='_self';
      }catch(e){}
    });
  }

  function addProButton(){
    var mount=document.getElementById('primaryMount');
    if(!mount || mount.dataset.pxProWired==='1') return;
    mount.dataset.pxProWired='1';
    var box=document.createElement('div');
    box.style.cssText='margin-top:12px;display:flex;align-items:center;justify-content:space-between;gap:10px;padding:12px 14px;border:1px solid rgba(255,209,102,.18);border-radius:14px;background:rgba(255,209,102,.045);font-size:11px;line-height:1.4;color:#98a5bc;flex-wrap:wrap;';
    box.innerHTML='<span><strong style="color:#fff">Report PRO</strong> · roadmap, automazioni, KPI e blueprint operativa.</span><a href="/report-pro.html" style="display:inline-flex;align-items:center;justify-content:center;padding:9px 12px;border-radius:10px;text-decoration:none;color:#fff;font-weight:900;background:linear-gradient(135deg,#7c5cff,#5b8cff)">Vedi Report PRO →</a>';
    mount.appendChild(box);
  }

  function update(){
    if(document.getElementById('results') && document.getElementById('results').style.display!=='none') addProButton();
    rewriteAffiliateLinks();
  }

  var observer=new MutationObserver(update);
  observer.observe(document.body,{subtree:true,childList:true});
  update();
  window.addEventListener('load',update);
})();
