/* PROJECT-X — USABILITY + ACTION LAYER
   Stable enhancement: improves accessibility and adds one practical action block.
   Decision-engine and ranking logic are untouched.
*/
(function(){
  'use strict';

  if(window.__PROJECTX_USABILITY__) return;
  window.__PROJECTX_USABILITY__=true;

  function $(sel,root){ return (root||document).querySelector(sel); }

  function escapeHtml(s){
    return String(s==null?'':s).replace(/[&<>"']/g,function(c){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
    });
  }

  function injectStyles(){
    if($('#px-usability-style')) return;
    var s=document.createElement('style');
    s.id='px-usability-style';
    s.textContent=
      '.px-skip-link{position:fixed;left:14px;top:10px;z-index:11000;transform:translateY(-160%);padding:11px 14px;border-radius:12px;background:#fff;color:#050711;text-decoration:none;font:800 14px/1.2 system-ui;box-shadow:0 10px 30px rgba(0,0,0,.35);transition:transform .18s ease}.px-skip-link:focus{transform:none}' +
      '.px-a11y-status{position:fixed;left:14px;bottom:14px;z-index:10999;max-width:min(520px,calc(100% - 28px));padding:10px 13px;border:1px solid rgba(255,255,255,.08);border-radius:12px;background:rgba(7,11,20,.94);color:#dfe6f2;font:600 13px/1.45 system-ui;box-shadow:0 20px 60px rgba(0,0,0,.35);opacity:0;transform:translateY(8px);pointer-events:none;transition:.18s}.px-a11y-status.show{opacity:1;transform:none}' +
      '.px-field-help{display:block;margin-top:7px;color:#9ca9bb;font:500 13px/1.5 system-ui}.px-invalid{border-color:#ff7285!important;box-shadow:0 0 0 4px rgba(255,114,133,.10)!important}' +
      '#main-content:focus{outline:none}' +
      '.px-now-card{position:relative;overflow:hidden;margin:14px 0 0;padding:22px;border:1px solid rgba(54,217,157,.18);border-radius:22px;background:linear-gradient(145deg,rgba(12,24,30,.97),rgba(9,13,24,.98));box-shadow:0 24px 70px rgba(0,0,0,.24)}' +
      '.px-now-card:before{content:"";position:absolute;right:-70px;top:-90px;width:230px;height:230px;border-radius:50%;background:radial-gradient(circle,rgba(54,217,157,.12),transparent 68%);pointer-events:none}' +
      '.px-now-kicker{font-size:9px;font-weight:950;letter-spacing:.15em;color:#7ce8bd;text-transform:uppercase}' +
      '.px-now-title{margin-top:7px;font-size:25px;font-weight:950;letter-spacing:-.045em;line-height:1.05}' +
      '.px-now-copy{margin:7px 0 0;color:#97a6bb;font-size:11px;line-height:1.55;max-width:760px}' +
      '.px-now-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:15px}' +
      '.px-now-step{padding:13px;border:1px solid rgba(255,255,255,.07);border-radius:14px;background:rgba(255,255,255,.018)}' +
      '.px-now-step b{display:flex;align-items:center;gap:7px;font-size:10px;color:#eef3fb}' +
      '.px-now-num{width:22px;height:22px;display:grid;place-items:center;border-radius:7px;background:rgba(124,92,255,.11);color:#c7beff;font-size:8px}' +
      '.px-now-step span{display:block;margin-top:7px;color:#7e8da5;font-size:9px;line-height:1.45}' +
      '.px-now-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:14px}' +
      '.px-now-btn{appearance:none;border:0;text-decoration:none;display:inline-flex;align-items:center;justify-content:center;min-height:42px;padding:11px 15px;border-radius:12px;font-size:10px;font-weight:950;cursor:pointer}' +
      '.px-now-btn.primary{background:linear-gradient(135deg,#36d99d,#1ebf87);color:#07130f;box-shadow:0 12px 32px rgba(54,217,157,.16)}' +
      '.px-now-btn.secondary{background:rgba(255,255,255,.035);border:1px solid rgba(255,255,255,.08);color:#e4e9f2}' +
      '.px-now-btn:hover{transform:translateY(-2px)}' +
      '@media(max-width:760px){.px-now-grid{grid-template-columns:1fr}.px-now-card{padding:18px}.px-now-title{font-size:22px}}' +
      '@media(prefers-reduced-motion:reduce){.px-skip-link,.px-a11y-status,.px-now-btn{transition:none}}';
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

  function buildNowCard(){
    if($('#px-now-card')) return;

    var section=$('#results');
    if(!section) return;

    var result=window.ProjectXUI && typeof window.ProjectXUI.getResult==='function'
      ? window.ProjectXUI.getResult()
      : null;

    var primary=result && (result.primaryTool || result.primary || (result.rankedTools&&result.rankedTools[0]));
    var tool=primary && (primary.name || primary.id) ? (primary.name || primary.id) : 'la soluzione appena individuata';
    var problem='';
    try{
      var saved=JSON.parse(localStorage.getItem('projectx_answers_v2')||'null');
      problem=saved && saved.painPoint ? String(saved.painPoint) : '';
    }catch(e){}

    var firstAutomation=$('#automationMount');
    var automationText='';
    if(firstAutomation){
      var node=firstAutomation.querySelector('.item strong');
      if(node) automationText=node.textContent.replace(/^\s*\d+\.\s*/,'').trim();
    }

    var card=document.createElement('div');
    card.id='px-now-card';
    card.className='px-now-card';
    card.innerHTML=
      '<div class="px-now-kicker">PROJECT-X · AZIONE IMMEDIATA</div>'+
      '<div class="px-now-title">⚡ Non fermarti al risultato. Fai il primo passo adesso.</div>'+
      '<p class="px-now-copy">'+
        (problem
          ? 'Hai descritto: <strong style="color:#f1f5fb">'+escapeHtml(problem.slice(0,220))+'</strong>. '
          : 'Hai appena trovato una configurazione coerente. ')+
        'Il primo obiettivo è costruire un solo flusso funzionante con <strong style="color:#f1f5fb">'+escapeHtml(tool)+'</strong>.'+
      '</p>'+
      '<div class="px-now-grid">'+
        '<div class="px-now-step"><b><span class="px-now-num">01</span> Parti dal nucleo</b><span>Apri '+escapeHtml(tool)+' e configura solo ciò che serve al primo processo.</span></div>'+
        '<div class="px-now-step"><b><span class="px-now-num">02</span> Automatizza</b><span>'+(automationText?escapeHtml(automationText):'Collega il passaggio ripetitivo che fai più spesso.')+'</span></div>'+
        '<div class="px-now-step"><b><span class="px-now-num">03</span> Misura</b><span>Conta ore e passaggi prima e dopo. Il risultato deve essere verificabile.</span></div>'+
      '</div>'+
      '<div class="px-now-actions">'+
        '<button type="button" class="px-now-btn primary" id="px-now-start">⚡ Inizia dal primo workflow</button>'+
        '<a class="px-now-btn secondary" id="px-now-guide" href="/tutorial.html?tool='+encodeURIComponent(String(primary&&primary.id||''))+'">📘 Apri la guida pratica</a>'+
      '</div>';

    var anchor=section.querySelector('.resultgrid');
    if(anchor) section.insertBefore(card,anchor);
    else section.appendChild(card);

    var start=$('#px-now-start');
    if(start){
      start.addEventListener('click',function(){
        var target=$('#automationMount') || $('#planMount');
        if(target) target.scrollIntoView({behavior:'smooth',block:'start'});
        announce('Ecco il punto da cui iniziare.');
      });
    }
  }

  function improveResult(){
    var section=$('#results');
    if(!section) return;

    section.setAttribute('aria-labelledby','px-results-title');

    var h=section.querySelector('.resulthead h1');
    if(h) h.id='px-results-title';

    if(!$('#px-now-card')) buildNowCard();
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
        improveResult();
        announce('Risultato pronto. Parti dalla decisione principale o dal primo workflow.');
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