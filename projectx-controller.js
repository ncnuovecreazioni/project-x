/* PROJECT-X — CENTRAL INTERACTION CONTROLLER
   Single, reliable interaction layer for the public home CTAs.
   Visual effects stay in the UI layers; this file only controls flow.
*/
(function(){
  'use strict';

  if(window.__PROJECTX_CONTROLLER__) return;
  window.__PROJECTX_CONTROLLER__=true;

  function id(x){ return document.getElementById(x); }

  function ready(fn){
    if(document.readyState==='loading'){
      document.addEventListener('DOMContentLoaded',fn,{once:true});
    }else{
      fn();
    }
  }

  function getUI(){
    return window.ProjectXUI &&
      typeof window.ProjectXUI.startQuick==='function' &&
      typeof window.ProjectXUI.startFull==='function'
      ? window.ProjectXUI
      : null;
  }

  function demo(){
    var problem=id('quickProblem');
    var business=id('quickBusiness');
    var budget=id('quickBudget');

    if(problem) problem.value='Perdo ore tra email, preventivi e follow-up dei clienti e vorrei automatizzare il lavoro ripetitivo.';
    if(business) business.value='Impresa di servizi';
    if(budget) budget.value='€31–50';

    document.querySelectorAll('.px-example').forEach(function(x){
      x.classList.remove('is-active');
    });

    var first=document.querySelector('.px-example[data-example="Perdo ore tra email e follow-up dei clienti"]');
    if(first) first.classList.add('is-active');
  }

  function quick(isDemo){
    var ui=getUI();
    if(!ui) return false;

    try{
      if(isDemo) demo();
      ui.startQuick();
      return true;
    }catch(e){
      return false;
    }
  }

  function full(){
    var ui=getUI();
    if(!ui) return false;
    try{
      ui.startFull();
      return true;
    }catch(e){
      return false;
    }
  }

  function caseDemo(type){
    var map={
      preventivi:'Faccio preventivi a mano e copio sempre gli stessi dati',
      email:'Rispondo spesso alle stesse richieste via email e perdo tempo nei follow-up',
      excel:'Uso Excel per gestire dati e attività e vorrei automatizzare i passaggi ripetitivi',
      clienti:'Gestisco richieste e clienti in posti diversi e rischio di dimenticare i follow-up'
    };
    var problem=id('quickProblem');
    var business=id('quickBusiness');
    var budget=id('quickBudget');
    if(problem) problem.value=map[type]||map.preventivi;
    if(business && !business.value) business.value='Impresa di servizi';
    if(budget && !budget.value) budget.value='€31–50';
    if(problem) problem.scrollIntoView({behavior:'smooth',block:'center'});
    setTimeout(function(){ quick(false); },180);
  }

  function styles(){
    if(id('px-controller-style')) return;

    var s=document.createElement('style');
    s.id='px-controller-style';
    s.textContent=[
      '#quickBtn,#quickBtn2,#fullBtn,#fullBtn2,#demoBtn{pointer-events:auto!important;position:relative!important;z-index:100!important}',
      '.px-mobile-nav-btn{position:relative;z-index:10002!important}',
      '.px-mobile-nav{z-index:10001!important}'
    ].join('');
    document.head.appendChild(s);
  }

  function bind(){
    styles();

    var quickBtn=id('quickBtn');
    var quickBtn2=id('quickBtn2');
    var fullBtn=id('fullBtn');
    var fullBtn2=id('fullBtn2');
    var demoBtn=id('demoBtn');

    document.querySelectorAll('.px-home-example-grid a').forEach(function(a){
      if(a.dataset.pxCaseWired==='1') return;
      a.dataset.pxCaseWired='1';
      a.onclick=function(e){
        e.preventDefault();
        var href=a.getAttribute('href')||'';
        var type=(href.split('case=')[1]||'').split('&')[0];
        caseDemo(type);
      };
    });

    if(quickBtn){
      quickBtn.onclick=function(e){
        if(e) e.preventDefault();
        quick(false);
      };
    }

    if(quickBtn2){
      quickBtn2.onclick=function(e){
        if(e) e.preventDefault();
        quick(true);
      };
    }

    if(demoBtn){
      demoBtn.onclick=function(e){
        if(e) e.preventDefault();
        quick(true);
      };
    }

    if(fullBtn){
      fullBtn.onclick=function(e){
        if(e) e.preventDefault();
        full();
      };
    }

    if(fullBtn2){
      fullBtn2.onclick=function(e){
        if(e) e.preventDefault();
        full();
      };
    }
  }

  ready(function(){
    bind();
    setTimeout(bind,350);
    setTimeout(bind,1000);
  });
})();