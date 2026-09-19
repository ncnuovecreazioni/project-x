/* PROJECT-X — CATALOG STATUS
   Reads the automatically generated catalog-health.json when available.
*/
(function(){
  'use strict';
  if(window.__PROJECTX_CATALOG_STATUS__) return;
  window.__PROJECTX_CATALOG_STATUS__=true;

  function boot(){
    var hero=document.querySelector('.hero');
    if(!hero || document.getElementById('px-catalog-status')) return;

    var box=document.createElement('div');
    box.id='px-catalog-status';
    box.className='px-catalog-status';
    box.setAttribute('aria-live','polite');
    box.innerHTML='<span class="px-cs-dot"></span><span class="px-cs-main">Catalogo controllato automaticamente</span><span class="px-cs-detail">verifica programmata</span>';
    var trust=hero.querySelector('.trust');
    if(trust) trust.insertAdjacentElement('afterend',box);
    else hero.appendChild(box);

    fetch('/catalog-health.json?ts='+Date.now(),{cache:'no-store'})
      .then(function(r){if(!r.ok)throw new Error('missing');return r.json();})
      .then(function(d){
        var t=d&&d.totals||{};
        var healthy=Number(t.healthy||0);
        var tools=Number(t.tools||0);
        var changed=Number(t.changed||0);
        var detail=document.querySelector('#px-catalog-status .px-cs-detail');
        if(detail){
          if(tools) detail.textContent=healthy+' / '+tools+' link controllati'+(changed?' · '+changed+' da rivedere':'');
          else detail.textContent='verifica automatica attiva';
        }
      })
      .catch(function(){});
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();