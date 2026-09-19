/* PROJECT-X — CENTRAL INTERACTION CONTROLLER
   Reliable click layer for the public home CTAs.
   Uses event delegation so buttons keep working even when other UI layers
   add/re-render content after page load.
*/
(function(){
  'use strict';

  if(window.__PROJECTX_CONTROLLER__) return;
  window.__PROJECTX_CONTROLLER__=true;

  function id(x){ return document.getElementById(x); }

  function getUI(){
    return window.ProjectXUI &&
      typeof window.ProjectXUI.startQuick==='function' &&
      typeof window.ProjectXUI.startFull==='function'
      ? window.ProjectXUI
      : null;
  }

  function demoValues(problem){
    var p=id('quickProblem');
    var b=id('quickBusiness');
    var budget=id('quickBudget');

    if(p) p.value=problem || 'Perdo ore tra email, preventivi e follow-up dei clienti e vorrei automatizzare il lavoro ripetitivo.';
    if(b && !b.value) b.value='Impresa di servizi';
    if(budget && !budget.value) budget.value='€31–50';

    document.querySelectorAll('.px-example').forEach(function(x){
      x.classList.toggle('is-active', (x.getAttribute('data-example')||'') === (p?p.value:''));
    });
  }

  function startQuick(withDemo, problem){
    var ui=getUI();
    if(!ui) return setTimeout(function(){ startQuick(withDemo,problem); },120);

    try{
      if(withDemo) demoValues(problem);
      ui.startQuick();
    }catch(e){
      setTimeout(function(){
        try{
          var retry=getUI();
          if(retry) retry.startQuick();
        }catch(_){}
      },180);
    }
  }

  function startFull(){
    var ui=getUI();
    if(!ui) return setTimeout(startFull,120);
    try{ ui.startFull(); }catch(e){ setTimeout(startFull,180); }
  }

  function caseDemo(type){
    var map={
      preventivi:'Faccio preventivi a mano e copio sempre gli stessi dati',
      email:'Rispondo spesso alle stesse richieste via email e perdo tempo nei follow-up',
      excel:'Uso Excel per gestire dati e attività e vorrei automatizzare i passaggi ripetitivi',
      clienti:'Gestisco richieste e clienti in posti diversi e rischio di dimenticare i follow-up'
    };
    var problem=map[type]||map.preventivi;
    demoValues(problem);
    setTimeout(function(){ startQuick(false); },80);
  }

  function styles(){
    if(id('px-controller-style')) return;
    var s=document.createElement('style');
    s.id='px-controller-style';
    s.textContent=[
      '#quickBtn,#quickBtn2,#fullBtn,#fullBtn2,#demoBtn,#nextBtn,#backBtn,#copyBtn,#shareBtn,#saveLinkBtn,#leadBtn,#implementationBtn,#printBtn,#refineBtn,#resetBtn,#stickyBtn,#leadCancel,#leadSend,#copyTop,#planTop{pointer-events:auto!important;position:relative!important;z-index:1000!important;cursor:pointer!important}',
      '.px-example{pointer-events:auto!important;position:relative;z-index:100!important;cursor:pointer!important}',
      '.px-home-example-grid a{pointer-events:auto!important;position:relative;z-index:100!important;cursor:pointer!important}',
      '.px-mobile-nav-btn{position:relative;z-index:10002!important}',
      '.px-mobile-nav{z-index:10001!important}'
    ].join('');
    document.head.appendChild(s);
  }

  function resultAction(target){
    var ui=window.ProjectXUI;
    if(!ui) return false;
    try{
      if(target.id==='nextBtn'){ui.next();return true;}
      if(target.id==='backBtn'){ui.prev();return true;}
      if(target.id==='resetBtn'){ui.reset();return true;}
      if(target.id==='refineBtn'){ui.refine?ui.refine():ui.startFull();return true;}
      if(target.id==='copyBtn'||target.id==='copyTop'){ui.copyReport&&ui.copyReport();return true;}
      if(target.id==='shareBtn'){ui.share&&ui.share();return true;}
      if(target.id==='saveLinkBtn'){ui.saveResultLink&&ui.saveResultLink();return true;}
      if(target.id==='leadBtn'){ui.openLead&&ui.openLead('report');return true;}
      if(target.id==='implementationBtn'){ui.openLead&&ui.openLead('implementation');return true;}
      if(target.id==='printBtn'){ui.printReport&&ui.printReport();return true;}
      if(target.id==='leadCancel'){ui.closeLead&&ui.closeLead();return true;}
      if(target.id==='leadSend'){ui.sendLead&&ui.sendLead();return true;}
      if(target.id==='planTop'){var p=document.getElementById('planMount');if(p)p.scrollIntoView({behavior:'smooth',block:'start'});return true;}
      if(target.id==='stickyBtn'){var pm=document.getElementById('primaryMount');if(pm)pm.scrollIntoView({behavior:'smooth',block:'start'});return true;}
    }catch(_){}
    return false;
  }

  function handleClick(e){
    var target=e.target && e.target.closest ? e.target.closest(
      '#quickBtn,#quickBtn2,#fullBtn,#fullBtn2,#demoBtn,.px-example,.px-home-example-grid a,#nextBtn,#backBtn,#copyBtn,#shareBtn,#saveLinkBtn,#leadBtn,#implementationBtn,#printBtn,#refineBtn,#resetBtn,#stickyBtn,#leadCancel,#leadSend,#copyTop,#planTop'
    ) : null;
    if(!target) return;

    e.preventDefault();
    e.stopImmediatePropagation();

    if(resultAction(target)) return;
    
    if(target.matches('.px-home-example-grid a')){
      var href=target.getAttribute('href')||'';
      var m=href.match(/[?&]case=([^&]+)/);
      caseDemo(m?decodeURIComponent(m[1]):'preventivi');
      return;
    }

    if(target.classList.contains('px-example')){
      demoValues(target.getAttribute('data-example')||'');
      setTimeout(function(){ startQuick(false); },80);
      return;
    }

    if(target.id==='fullBtn' || target.id==='fullBtn2'){
      startFull();
      return;
    }

    if(target.id==='demoBtn' || target.id==='quickBtn2'){
      startQuick(true);
      return;
    }

    startQuick(false);
  }

  function init(){
    styles();
    document.addEventListener('click',handleClick,true);
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',init,{once:true});
  }else{
    init();
  }
})();