/* PROJECT-X — RELIABLE UI CONTROLLER v4
   One controller for static and dynamically-rendered buttons.
*/
(function(){
  'use strict';

  if(window.__PROJECTX_CONTROLLER_V4__) return;
  window.__PROJECTX_CONTROLLER_V4__=true;

  function $$(sel){ return Array.prototype.slice.call(document.querySelectorAll(sel)); }
  function ui(){
    return window.ProjectXUI && typeof window.ProjectXUI.startQuick==='function'
      ? window.ProjectXUI : null;
  }
  function retry(fn){
    var tries=0;
    (function go(){
      var u=ui();
      if(u){ try{ fn(u); }catch(e){} return; }
      if(++tries<30) setTimeout(go,100);
    })();
  }
  function demo(problem){
    var p=document.getElementById('quickProblem');
    var b=document.getElementById('quickBusiness');
    var budget=document.getElementById('quickBudget');
    if(p) p.value=problem||'Perdo tempo in attività ripetitive e voglio capire cosa automatizzare per primo.';
    if(b && !b.value) b.value='Impresa di servizi';
    if(budget && !budget.value) budget.value='€31–50';
  }
  function scrollToId(id){
    var el=document.getElementById(id);
    if(el) el.scrollIntoView({behavior:'smooth',block:'start'});
  }
  function act(el){
    retry(function(u){
      switch(el.id){
        case 'quickBtn': u.startQuick(); return;
        case 'quickBtn2': demo(); u.startQuick(); return;
        case 'demoBtn': demo(); u.startQuick(); return;
        case 'fullBtn':
        case 'fullBtn2': u.startFull(); return;
        case 'nextBtn': u.next(); return;
        case 'backBtn': u.prev(); return;
        case 'resetBtn': u.reset(); return;
        case 'refineBtn': u.refine(); return;
        case 'copyBtn': u.copyReport(); return;
        case 'shareBtn': u.share(); return;
        case 'saveLinkBtn': u.saveResultLink(); return;
        case 'leadBtn': u.openLead('report'); return;
        case 'implementationBtn': u.openLead('implementation'); return;
        case 'printBtn': u.printReport(); return;
        case 'leadCancel': u.closeLead(); return;
        case 'leadSend': u.sendLead(); return;
        case 'copyTop': u.copyReport(); return;
        case 'planTop': scrollToId('planMount'); return;
        case 'stickyBtn': scrollToId('primaryMount'); return;
      }
    });
  }
  function handle(e){
    var el=e.target && e.target.closest ? e.target.closest(
      '#quickBtn,#quickBtn2,#demoBtn,#fullBtn,#fullBtn2,#nextBtn,#backBtn,#resetBtn,#refineBtn,#copyBtn,#shareBtn,#saveLinkBtn,#leadBtn,#implementationBtn,#printBtn,#leadCancel,#leadSend,#copyTop,#planTop,#stickyBtn'
    ) : null;
    if(!el) return;
    /* Let normal browser behavior happen for links, but make every PROJECT-X
       action button deterministic. */
    if(el.tagName==='BUTTON'){
      e.preventDefault();
      act(el);
    }
  }
  function wireExamples(){
    $$('.px-example').forEach(function(btn){
      if(btn.dataset.pxV4==='1') return;
      btn.dataset.pxV4='1';
      btn.addEventListener('click',function(e){
        e.preventDefault();
        e.stopPropagation();
        var p=document.getElementById('quickProblem');
        if(p) p.value=btn.getAttribute('data-example')||'';
        var b=document.getElementById('quickBusiness');
        var budget=document.getElementById('quickBudget');
        if(b && !b.value) b.value='Professionista';
        if(budget && !budget.value) budget.value='€31–50';
        retry(function(u){u.startQuick()});
      });
    });
  }
  function inject(){
    if(!document.getElementById('px-controller-v4-style')){
      var s=document.createElement('style');
      s.id='px-controller-v4-style';
      s.textContent=[
        '#quickBtn,#quickBtn2,#demoBtn,#fullBtn,#fullBtn2,#nextBtn,#backBtn,#resetBtn,#refineBtn,#copyBtn,#shareBtn,#saveLinkBtn,#leadBtn,#implementationBtn,#printBtn,#leadCancel,#leadSend,#copyTop,#planTop,#stickyBtn{pointer-events:auto!important;cursor:pointer!important;position:relative!important;z-index:100000!important}',
        '.px-example{pointer-events:auto!important;cursor:pointer!important;position:relative!important;z-index:100000!important}'
      ].join('');
      document.head.appendChild(s);
    }
    wireExamples();
  }

  document.addEventListener('click',handle,false);
  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',inject,{once:true});
  }else inject();

  new MutationObserver(inject).observe(document.body,{subtree:true,childList:true});
})();