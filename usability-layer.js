/* PROJECT-X — USABILITY / ACCESSIBILITY LAYER
   Enhances navigation, focus, labels and status feedback.
   No decision-engine or ranking logic is changed.
*/
(function(){
  'use strict';

  if(window.__PROJECTX_USABILITY__) return;
  window.__PROJECTX_USABILITY__=true;

  function $(sel,root){ return (root||document).querySelector(sel); }

  function injectStyles(){
    if($('#px-usability-style')) return;
    var s=document.createElement('style');
    s.id='px-usability-style';
    s.textContent=
      '.px-skip-link{position:fixed;left:14px;top:10px;z-index:11000;transform:translateY(-160%);padding:11px 14px;border-radius:12px;background:#fff;color:#050711;text-decoration:none;font:800 14px/1.2 system-ui;box-shadow:0 10px 30px rgba(0,0,0,.35);transition:transform .18s ease}.px-skip-link:focus{transform:none}' +
      '.px-a11y-status{position:fixed;left:14px;bottom:14px;z-index:10999;max-width:min(520px,calc(100% - 28px));padding:10px 13px;border:1px solid rgba(255,255,255,.08);border-radius:12px;background:rgba(7,11,20,.94);color:#dfe6f2;font:600 13px/1.45 system-ui;box-shadow:0 20px 60px rgba(0,0,0,.35);opacity:0;transform:translateY(8px);pointer-events:none;transition:.18s}.px-a11y-status.show{opacity:1;transform:none}' +
      '.px-field-help{display:block;margin-top:7px;color:#9ca9bb;font:500 13px/1.5 system-ui}.px-invalid{border-color:#ff7285!important;box-shadow:0 0 0 4px rgba(255,114,133,.10)!important}' +
      '#main-content:focus{outline:none}' +
      '@media(prefers-reduced-motion:reduce){.px-skip-link,.px-a11y-status{transition:none}}';
    document.head.appendChild(s);
  }

  function setupMain(){
    var main=document.querySelector('main');
    if(main) main.id='main-content';

    if(main && !$('#px-skip-link')){
      var a=document.createElement('a');
      a.id='px-skip-link';
      a.className='px-skip-link';
      a.href='#main-content';
      a.textContent='Vai al contenuto';
      document.body.appendChild(a);
    }
  }

  function setupStatus(){
    if($('#px-a11y-status')) return;
    var x=document.createElement('div');
    x.id='px-a11y-status';
    x.className='px-a11y-status';
    x.setAttribute('role','status');
    x.setAttribute('aria-live','polite');
    x.setAttribute('aria-atomic','true');
    document.body.appendChild(x);
  }

  var statusTimer=null;
  function announce(message){
    var x=$('#px-a11y-status');
    if(!x || !message) return;
    x.textContent=message;
    x.classList.add('show');
    clearTimeout(statusTimer);
    statusTimer=setTimeout(function(){x.classList.remove('show');},2800);
  }

  function improveHomeFields(){
    var fields=[
      ['#quickProblem','Descrivi in breve il lavoro che ti fa perdere tempo.'],
      ['#quickBusiness','Seleziona il tipo di attività.'],
      ['#quickBudget','Seleziona il budget mensile.']
    ];

    fields.forEach(function(item){
      var el=$(item[0]);
      if(!el) return;
      if(!el.getAttribute('aria-label')) el.setAttribute('aria-label',item[1]);
    });

    var problem=$('#quickProblem');
    if(problem && !$('#quickProblemHelp')){
      var h=document.createElement('div');
      h.id='quickProblemHelp';
      h.className='px-field-help';
      h.textContent='Puoi scrivere anche una sola frase: PROJECT-X parte dal problema reale.';
      problem.insertAdjacentElement('afterend',h);
    }
  }

  function improveQuestion(){
    var title=$('#qTitle');
    var desc=$('#qDesc');

    if(title){
      title.setAttribute('tabindex','-1');
      title.setAttribute('aria-live','polite');
    }

    if(desc) desc.setAttribute('aria-live','polite');

    var next=$('#nextBtn');
    var back=$('#backBtn');

    if(next && !next.getAttribute('aria-label')){
      next.setAttribute('aria-label','Continua con la domanda successiva');
    }

    if(back && !back.getAttribute('aria-label')){
      back.setAttribute('aria-label','Torna alla domanda precedente');
    }

    var input=$('#painInput');
    if(input) input.setAttribute('aria-label','Descrivi il problema che vuoi risolvere');

    var actions=document.querySelector('#questionnaire .actions');
    if(actions && !document.getElementById('pxExitQuestionnaire')){
      var exit=document.createElement('button');
      exit.type='button';
      exit.id='pxExitQuestionnaire';
      exit.className='btn secondary';
      exit.textContent='Esci';
      exit.setAttribute('aria-label','Esci dal questionario e torna alla home');
      actions.insertBefore(exit,actions.firstChild);
      exit.addEventListener('click',function(){
        if(window.ProjectXUI && typeof window.ProjectXUI.reset==='function'){
          window.ProjectXUI.reset();
          announce('Sei tornato alla home.');
        }
      });
    }

    var search=$('#toolSearch');
    if(search) search.setAttribute('aria-label','Cerca uno strumento che utilizzi già');
  }

  function improveResult(){
    var section=$('#results');
    if(!section) return;

    section.setAttribute('aria-labelledby','px-results-title');

    var h=section.querySelector('.resulthead h1');
    if(h) h.id='px-results-title';
  }

  function focusView(view){
    setTimeout(function(){
      if(view==='questionnaire'){
        var q=$('#qTitle');
        if(q) q.focus({preventScroll:true});
        var progress=$('#progressLabel');
        announce('Questionario avviato. '+(progress?progress.textContent:''));
      }else if(view==='results'){
        var h=$('#px-results-title');
        if(h) h.focus({preventScroll:true});
        announce('Risultato pronto. Inizia dalla decisione principale.');
      }else if(view==='loading'){
        announce('PROJECT-X sta costruendo il tuo risultato.');
      }

      window.scrollTo({top:0,behavior:'smooth'});
    },60);
  }

  function observeViews(){
    ['questionnaire','loading','results'].forEach(function(id){
      var el=document.getElementById(id);
      if(!el) return;

      var observer=new MutationObserver(function(muts){
        muts.forEach(function(m){
          if(m.type==='attributes' && m.attributeName==='hidden' && !m.target.hidden){
            improveHomeFields();
            improveQuestion();
            improveResult();
            focusView(id);
          }
        });
      });

      observer.observe(el,{attributes:true,attributeFilter:['hidden']});
    });
  }

  function setupMobileNav(){
    var nav=$('#pxMobileNav');
    var btn=$('#pxMobileNavBtn');
    var close=$('#pxMobileNavClose');

    if(!nav || !btn || nav.dataset.pxWired==='1') return;
    nav.dataset.pxWired='1';

    function setOpen(open,focusButton){
      nav.hidden=!open;
      btn.setAttribute('aria-expanded',open?'true':'false');
      document.body.classList.toggle('px-menu-open',open);
      if(open){
        announce('Menu aperto. Scegli una sezione.');
      }else if(focusButton!==false){
        btn.focus();
      }
    }

    btn.addEventListener('click',function(e){
      e.preventDefault();
      e.stopPropagation();
      setOpen(nav.hidden,true);
    });

    if(close){
      close.addEventListener('click',function(e){
        e.preventDefault();
        e.stopPropagation();
        setOpen(false,true);
      });
    }

    nav.addEventListener('click',function(e){
      var a=e.target.closest ? e.target.closest('a') : null;
      if(a) setOpen(false,false);
    });

    document.addEventListener('click',function(e){
      if(nav.hidden) return;
      if(nav.contains(e.target) || btn.contains(e.target)) return;
      setOpen(false,false);
    });

    document.addEventListener('keydown',function(e){
      if(e.key==='Escape' && !nav.hidden){
        setOpen(false,true);
      }
    });
  }

  function keyboard(){
    document.addEventListener('keydown',function(e){
      if(e.key==='Escape'){
        var nav=$('#pxMobileNav');
        var btn=$('#pxMobileNavBtn');
        if(nav && !nav.hidden){
          nav.hidden=true;
          btn.setAttribute('aria-expanded','false');
          document.body.classList.remove('px-menu-open');
          if(btn) btn.focus();
        }
      }
    });
  }

  function boot(){
    injectStyles();
    setupMain();
    setupStatus();
    setupMobileNav();
    improveHomeFields();
    improveQuestion();
    improveResult();
    observeViews();
    keyboard();
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',boot,{once:true});
  }else{
    boot();
  }

  window.ProjectXUsability={announce:announce};
})();