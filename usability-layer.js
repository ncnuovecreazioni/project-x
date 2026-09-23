/* PROJECT-X — USABILITY + DECISION EXPERIENCE LAYER
   Level-up UI inspired by proven software-discovery patterns:
   transparent methodology, decision cockpit, practical next step.
   Engine/ranking logic is untouched.
*/
(function(){
  'use strict';

  if(window.__PROJECTX_USABILITY__) return;
  window.__PROJECTX_USABILITY__=true;

  function $(sel,root){ return (root||document).querySelector(sel); }

  function escapeHtml(s){
    return String(s==null?'':s).replace(/[&<>"']/g,function(c){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'};
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

      '.px-method{width:min(1030px,calc(100% - 30px));margin:18px auto 0;padding:20px;border:1px solid rgba(255,255,255,.075);border-radius:20px;background:linear-gradient(145deg,rgba(14,20,36,.92),rgba(8,12,22,.97));box-shadow:0 24px 70px rgba(0,0,0,.20)}' +
      '.px-method-head{display:flex;justify-content:space-between;align-items:flex-end;gap:12px;flex-wrap:wrap}' +
      '.px-method-k{font-size:8px;letter-spacing:.16em;font-weight:950;color:#a99cff;text-transform:uppercase}' +
      '.px-method-title{margin-top:6px;font-size:22px;font-weight:950;letter-spacing:-.04em}' +
      '.px-method-copy{margin:6px 0 0;color:#8e9bb0;font-size:10px;line-height:1.55;max-width:760px}' +
      '.px-method-badge{padding:7px 9px;border:1px solid rgba(255,255,255,.075);border-radius:999px;color:#92a0b5;background:rgba(255,255,255,.018);font-size:8px;font-weight:900}' +
      '.px-method-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:14px}' +
      '.px-method-step{padding:12px;border:1px solid rgba(255,255,255,.065);border-radius:13px;background:rgba(255,255,255,.018)}' +
      '.px-method-num{display:grid;place-items:center;width:22px;height:22px;border-radius:7px;background:rgba(124,92,255,.10);color:#c6bdff;font-size:8px;font-weight:950}' +
      '.px-method-step b{display:block;margin-top:8px;font-size:10px}' +
      '.px-method-step span{display:block;margin-top:4px;color:#75839a;font-size:8px;line-height:1.45}' +
      '.px-method-foot{margin-top:12px;padding:10px 11px;border:1px solid rgba(54,217,157,.12);border-radius:11px;background:rgba(54,217,157,.025);color:#7f8ea4;font-size:8px;line-height:1.45}' +
      '.px-method-foot strong{color:#bfeede}' +

      '.px-decision-cockpit{margin:0 0 15px;padding:22px;border:1px solid rgba(124,92,255,.20);border-radius:23px;background:linear-gradient(145deg,rgba(17,24,42,.97),rgba(7,11,20,.99));box-shadow:0 26px 80px rgba(0,0,0,.26);overflow:hidden;position:relative}' +
      '.px-decision-cockpit:after{content:"";position:absolute;width:280px;height:280px;right:-120px;top:-150px;border-radius:50%;background:radial-gradient(circle,rgba(124,92,255,.13),transparent 68%);pointer-events:none}' +
      '.px-dc-top{display:flex;justify-content:space-between;align-items:flex-start;gap:15px;flex-wrap:wrap}' +
      '.px-dc-k{font-size:8px;letter-spacing:.16em;font-weight:950;color:#a99cff;text-transform:uppercase}' +
      '.px-dc-title{margin-top:7px;font-size:28px;font-weight:950;letter-spacing:-.05em;line-height:1.03}' +
      '.px-dc-sub{margin-top:7px;color:#8e9bb0;font-size:10px;line-height:1.5;max-width:720px}' +
      '.px-dc-fit{padding:9px 11px;border-radius:12px;border:1px solid rgba(54,217,157,.16);background:rgba(54,217,157,.06);color:#7ce8bd;font-size:10px;font-weight:950;white-space:nowrap}' +
      '.px-dc-grid{display:grid;grid-template-columns:1.1fr .9fr;gap:9px;margin-top:15px}' +
      '.px-dc-panel{padding:15px;border:1px solid rgba(255,255,255,.065);border-radius:15px;background:rgba(255,255,255,.018)}' +
      '.px-dc-label{font-size:8px;letter-spacing:.12em;font-weight:950;color:#7e8ca3;text-transform:uppercase}' +
      '.px-dc-panel h4{margin:7px 0 5px;font-size:14px}' +
      '.px-dc-panel p{margin:0;color:#9aa8bc;font-size:9px;line-height:1.5}' +
      '.px-dc-signals{display:grid;gap:6px;margin-top:9px}' +
      '.px-dc-signal{display:flex;justify-content:space-between;gap:8px;padding:8px 9px;border:1px solid rgba(255,255,255,.055);border-radius:10px;background:rgba(255,255,255,.016);font-size:8px}' +
      '.px-dc-signal span{color:#76849a}.px-dc-signal strong{color:#dde4ef;text-align:right}' +
      '.px-dc-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}' +
      '.px-dc-btn{min-height:41px;display:inline-flex;align-items:center;justify-content:center;padding:10px 13px;border-radius:11px;text-decoration:none;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.035);color:#e2e9f4;font-size:9px;font-weight:950;cursor:pointer}' +
      '.px-dc-btn.primary{background:linear-gradient(135deg,#7c5cff,#5b8cff);border-color:transparent;color:#fff;box-shadow:0 13px 34px rgba(124,92,255,.18)}' +
      '.px-dc-btn.green{background:linear-gradient(135deg,#36d99d,#1ebf87);border-color:transparent;color:#06140f;box-shadow:0 13px 34px rgba(54,217,157,.13)}' +
      '.px-dc-btn:hover{transform:translateY(-2px)}' +
      '.px-dc-foot{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;margin-top:9px}' +
      '.px-dc-mini{padding:10px;border:1px solid rgba(255,255,255,.055);border-radius:11px;background:rgba(255,255,255,.014)}' +
      '.px-dc-mini span{display:block;color:#6f7d94;font-size:7px;letter-spacing:.08em}.px-dc-mini b{display:block;margin-top:4px;color:#e6ecf5;font-size:10px}' +
      '@media(max-width:820px){.px-method-grid{grid-template-columns:1fr 1fr}.px-dc-grid{grid-template-columns:1fr}}' +
      '@media(max-width:600px){.px-method{width:calc(100% - 22px);padding:17px}.px-method-grid,.px-dc-foot{grid-template-columns:1fr}.px-dc-title{font-size:23px}.px-decision-cockpit{padding:18px}}' +

      '.px-blueprint{margin:0 0 15px;padding:20px;border:1px solid rgba(91,140,255,.18);border-radius:22px;background:linear-gradient(145deg,rgba(12,19,34,.97),rgba(7,11,20,.99));box-shadow:0 22px 70px rgba(0,0,0,.22);position:relative;overflow:hidden}' +
      '.px-blueprint-head{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;flex-wrap:wrap}' +
      '.px-blueprint-k{font-size:8px;letter-spacing:.15em;font-weight:950;color:#91a9ff;text-transform:uppercase}' +
      '.px-blueprint-title{margin-top:6px;font-size:22px;font-weight:950;letter-spacing:-.04em}' +
      '.px-blueprint-copy{margin:6px 0 0;color:#8997ab;font-size:9px;line-height:1.5;max-width:760px}' +
      '.px-blueprint-status{padding:7px 9px;border:1px solid rgba(54,217,157,.14);border-radius:999px;background:rgba(54,217,157,.035);color:#7ce8bd;font-size:8px;font-weight:950}' +
      '.px-blueprint-flow{display:grid;grid-template-columns:1fr auto 1fr auto 1fr auto 1fr;gap:6px;align-items:center;margin-top:15px}' +
      '.px-blueprint-node{min-width:0;padding:13px 10px;border:1px solid rgba(255,255,255,.065);border-radius:13px;background:rgba(255,255,255,.018);text-align:center}' +
      '.px-blueprint-node.focus{border-color:rgba(124,92,255,.34);background:rgba(124,92,255,.055);box-shadow:0 0 0 3px rgba(124,92,255,.035)}' +
      '.px-blueprint-node.done{border-color:rgba(54,217,157,.17);background:rgba(54,217,157,.028)}' +
      '.px-blueprint-node span{display:block;color:#69778e;font-size:7px;letter-spacing:.09em;font-weight:950;text-transform:uppercase}' +
      '.px-blueprint-node b{display:block;margin-top:5px;color:#e8edf5;font-size:9px;line-height:1.32}' +
      '.px-blueprint-node small{display:block;margin-top:4px;color:#78869d;font-size:7px;line-height:1.35}' +
      '.px-blueprint-arrow{color:#6677a1;font-weight:950;font-size:12px}' +
      '.px-blueprint-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:13px}' +
      '.px-blueprint-btn{min-height:40px;padding:9px 12px;border:1px solid rgba(255,255,255,.08);border-radius:11px;background:rgba(255,255,255,.03);color:#dfe6f1;font-size:9px;font-weight:950;cursor:pointer;text-decoration:none;display:inline-flex;align-items:center;justify-content:center}' +
      '.px-blueprint-btn.primary{background:linear-gradient(135deg,#5b8cff,#7c5cff);border-color:transparent;color:#fff}' +
      '.px-blueprint-btn.green{background:linear-gradient(135deg,#36d99d,#1ebf87);border-color:transparent;color:#06140f}' +
      '.px-blueprint-btn:hover{transform:translateY(-2px)}' +
      '@media(max-width:900px){.px-blueprint-flow{grid-template-columns:1fr}.px-blueprint-arrow{justify-self:center;transform:rotate(90deg)}}' +
      '@media(max-width:600px){.px-blueprint{padding:17px}.px-blueprint-title{font-size:20px}}' +
      '@media(prefers-reduced-motion:reduce){.px-skip-link,.px-a11y-status,.px-dc-btn{transition:none}}'      '.px-workflow{margin:0 0 15px;padding:20px;border:1px solid rgba(54,217,157,.16);border-radius:22px;background:linear-gradient(145deg,rgba(10,24,22,.96),rgba(7,11,20,.99));box-shadow:0 22px 70px rgba(0,0,0,.22)}' +      '.px-workflow-head{display:flex;justify-content:space-between;gap:12px;align-items:flex-start;flex-wrap:wrap}' +      '.px-workflow-k{font-size:8px;letter-spacing:.15em;font-weight:950;color:#70e5b5;text-transform:uppercase}' +      '.px-workflow-title{margin-top:6px;font-size:22px;font-weight:950;letter-spacing:-.04em}' +      '.px-workflow-copy{margin:6px 0 0;color:#8997ab;font-size:9px;line-height:1.5;max-width:760px}' +      '.px-workflow-progress{padding:7px 9px;border:1px solid rgba(54,217,157,.16);border-radius:999px;color:#7ce8bd;background:rgba(54,217,157,.035);font-size:8px;font-weight:950;white-space:nowrap}' +      '.px-workflow-steps{display:grid;gap:8px;margin-top:15px}' +      '.px-workflow-step{display:grid;grid-template-columns:34px 1fr auto;gap:10px;align-items:center;padding:12px;border:1px solid rgba(255,255,255,.065);border-radius:14px;background:rgba(255,255,255,.018)}' +      '.px-workflow-step.done{border-color:rgba(54,217,157,.18);background:rgba(54,217,157,.035)}' +      '.px-workflow-num{display:grid;place-items:center;width:30px;height:30px;border-radius:9px;background:rgba(124,92,255,.10);color:#c6bdff;font-size:8px;font-weight:950}' +      '.px-workflow-step.done .px-workflow-num{background:rgba(54,217,157,.12);color:#7ce8bd}' +      '.px-workflow-step b{font-size:10px;color:#e7edf5}.px-workflow-step p{margin:4px 0 0;color:#8b99ae;font-size:8px;line-height:1.45}' +      '.px-workflow-check{min-width:88px;min-height:36px;padding:8px 10px;border:1px solid rgba(255,255,255,.08);border-radius:10px;background:rgba(255,255,255,.035);color:#dfe6f1;font-size:8px;font-weight:950;cursor:pointer}' +      '.px-workflow-check.done{background:rgba(54,217,157,.10);border-color:rgba(54,217,157,.20);color:#7ce8bd}' +      '.px-workflow-tools{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}' +      '.px-workflow-btn{min-height:40px;padding:9px 12px;border:1px solid rgba(255,255,255,.08);border-radius:11px;background:rgba(255,255,255,.03);color:#dfe6f1;font-size:9px;font-weight:950;cursor:pointer;text-decoration:none;display:inline-flex;align-items:center;justify-content:center}' +      '.px-workflow-btn.primary{background:linear-gradient(135deg,#36d99d,#1ebf87);border-color:transparent;color:#06140f}' +      '@media(max-width:600px){.px-workflow{padding:17px}.px-workflow-title{font-size:20px}.px-workflow-step{grid-template-columns:30px 1fr}.px-workflow-check{grid-column:2;width:max-content}}' +'@media(prefers-reduced-motion:reduce){.px-skip-link,.px-a11y-status,.px-dc-btn{transition:none}}';
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

  function setupMethodology(){
    if(!$('#home') || $('#px-method')) return;
    var anchor=$('#benefits');
    if(!anchor) return;

    var card=document.createElement('section');
    card.id='px-method';
    card.className='px-method';
    card.setAttribute('aria-label','Come decide PROJECT-X');
    card.innerHTML=
      '<div class="px-method-head">'+
        '<div><div class="px-method-k">METODO PROJECT-X</div><div class="px-method-title">Non scegliamo dal nome del software.</div><p class="px-method-copy">La direzione nasce dall’incrocio tra problema, bisogni, vincoli e strumenti già presenti. Poi il risultato viene trasformato in un piano operativo.</p></div>'+
        '<div class="px-method-badge">Decisione → sistema → azione</div>'+
      '</div>'+
      '<div class="px-method-grid">'+
        '<div class="px-method-step"><div class="px-method-num">01</div><b>Problema reale</b><span>Partiamo da ciò che ti fa perdere tempo, non da una lista di app.</span></div>'+
        '<div class="px-method-step"><div class="px-method-num">02</div><b>Vincoli</b><span>Consideriamo budget, team, tecnologia e ciò che usi già.</span></div>'+
        '<div class="px-method-step"><div class="px-method-num">03</div><b>Compatibilità</b><span>Il motore calcola una coerenza rispetto al tuo profilo.</span></div>'+
        '<div class="px-method-step"><div class="px-method-num">04</div><b>Primo passo</b><span>La scelta viene collegata a un workflow e a una guida pratica.</span></div>'+
      '</div>'+
      '<div class="px-method-foot"><strong>Trasparenza:</strong> gli eventuali collegamenti commerciali sono separati dal calcolo della compatibilità.</div>';

    anchor.parentNode.insertBefore(card,anchor);
  }

  function getResult(){
    try{
      if(window.ProjectXUI&&typeof window.ProjectXUI.getResult==='function') return window.ProjectXUI.getResult();
    }catch(e){}
    return null;
  }

  function primary(r){
    return r&&(r.primaryTool||r.primary||(r.rankedTools&&r.rankedTools[0]))||null;
  }

  function fit(t){
    return Math.round(Number(t&&(t.compatibility!=null?t.compatibility:t.score))||0);
  }

  function getAnswers(){
    try{return JSON.parse(localStorage.getItem('projectx_answers_v2')||'{}')}catch(e){return {}}
  }

  function firstAutomation(){
    var mount=$('#automationMount');
    if(!mount) return 'Collega il passaggio ripetitivo che fai più spesso.';
    var node=mount.querySelector('.item strong');
    return node ? node.textContent.replace(/^\s*\d+\.\s*/,'').trim() : 'Collega il passaggio ripetitivo che fai più spesso.';
  }

  function buildDecisionCockpit(){
    if($('#px-decision-cockpit')) return;

    var section=$('#results');
    if(!section || getComputedStyle(section).display==='none') return;

    var r=getResult(),p=primary(r);
    if(!p) return;

    var a=getAnswers();
    var name=String(p.name||p.id||'Soluzione');
    var score=fit(p);
    var stack=(r&&r.stack)||[];
    var missing=(r&&r.missingNeeds)||[];
    var profile=r&&r.profile||{};
    var entries=Object.entries(profile).sort(function(x,y){return Number(y[1]||0)-Number(x[1]||0)});
    var topNeed=entries.length ? entries[0][0] : 'bisogno operativo';
    var value=r&&r.valueEstimate||{};
    var monthly=Number(value.monthlyValue||0);
    var role=(r&&r.dominantRole&&r.dominantRole.label)||(r&&r.primaryRole&&r.primaryRole.label)||a.businessType||'la tua attività';

    var card=document.createElement('section');
    card.id='px-decision-cockpit';
    card.className='px-decision-cockpit';
    card.innerHTML=
      '<div class="px-dc-top">'+
        '<div><div class="px-dc-k">PROJECT-X · DECISION COCKPIT</div><div class="px-dc-title">'+escapeHtml(name)+'</div><div class="px-dc-sub">La scelta principale tradotta in una decisione leggibile: cosa risolve, perché è coerente con il tuo profilo e qual è il prossimo movimento.</div></div>'+
        '<div class="px-dc-fit">✓ '+score+'% compatibilità</div>'+
      '</div>'+
      '<div class="px-dc-grid">'+
        '<article class="px-dc-panel">'+
          '<div class="px-dc-label">PERCHÉ È QUI</div>'+
          '<h4>Coerente con '+escapeHtml(role)+'</h4>'+
          '<p>Il motore ha incrociato problema, bisogni, vincoli e strumenti già presenti. Non serve cambiare tutto: serve far funzionare bene il primo pezzo.</p>'+
          '<div class="px-dc-signals">'+
            '<div class="px-dc-signal"><span>Bisogno principale</span><strong>'+escapeHtml(topNeed)+'</strong></div>'+
            '<div class="px-dc-signal"><span>Stack iniziale</span><strong>'+stack.length+' strument'+(stack.length===1?'o':'i')+'</strong></div>'+
            '<div class="px-dc-signal"><span>Gap rilevati</span><strong>'+missing.length+'</strong></div>'+
          '</div>'+
        '</article>'+
        '<article class="px-dc-panel">'+
          '<div class="px-dc-label">COSA FARE ADESSO</div>'+
          '<h4>Un solo workflow.</h4>'+
          '<p>'+escapeHtml(firstAutomation())+'</p>'+
          '<div class="px-dc-actions">'+
            '<button id="px-cockpit-workflow" class="px-dc-btn green">⚡ Inizia dal workflow</button>'+
            '<a id="px-cockpit-guide" class="px-dc-btn primary" href="/tutorial.html?tool='+encodeURIComponent(String(p.id||''))+'">📘 Guida pratica</a>'+
            '<a class="px-dc-btn" href="/compare.html?'+(p.id?'a='+encodeURIComponent(String(p.id)):'')+'">Confronta alternative</a>'+
            '<a class="px-dc-btn" href="/workspace.html">Apri Workspace</a>'+
          '</div>'+
        '</article>'+
      '</div>'+
      '<div class="px-dc-foot">'+
        '<div class="px-dc-mini"><span>VALORE TEORICO / MESE</span><b>'+(monthly?'€'+Math.round(monthly).toLocaleString('it-IT'):'Da misurare')+'</b></div>'+
        '<div class="px-dc-mini"><span>PROSSIMA MOSSA</span><b>Automatizza un collo di bottiglia</b></div>'+
        '<div class="px-dc-mini"><span>REGOLA</span><b>Prima misura. Poi aggiungi complessità.</b></div>'+
      '</div>';

    var anchor=section.querySelector('.resultgrid');
    if(anchor) section.insertBefore(card,anchor);
    else section.appendChild(card);

    var action=$('#px-cockpit-workflow');
    if(action){
      action.addEventListener('click',function(){
        var target=$('#automationMount')||$('#planMount');
        if(target) target.scrollIntoView({behavior:'smooth',block:'start'});
        announce('Hai un punto preciso da cui partire.');
        try{fetch('/api/event',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({event:'first_workflow_click',sessionId:Date.now().toString(),meta:{tool:name}})}).catch(function(){})}catch(e){}
      });
    }
  }


  function buildBlueprint(){
    if($('#px-blueprint')) return;

    var section=$('#results');
    if(!section || getComputedStyle(section).display==='none') return;

    var r=getResult(),p=primary(r);
    if(!p) return;

    var a=getAnswers();
    var tool=String(p.name||p.id||'Software');
    var problem=String(a.painPoint||'Il problema operativo').trim();
    var automation=firstAutomation();
    var goal=Array.isArray(a.goals)&&a.goals.length ? String(a.goals[0]) : 'ridurre lavoro manuale';
    var shortProblem=problem.length>88?problem.slice(0,85)+'…':problem;
    var shortAutomation=automation.length>72?automation.slice(0,69)+'…':automation;

    var card=document.createElement('section');
    card.id='px-blueprint';
    card.className='px-blueprint';
    card.innerHTML=
      '<div class="px-blueprint-head">'+
        '<div><div class="px-blueprint-k">PROJECT-X · SYSTEM BLUEPRINT</div><div class="px-blueprint-title">Ecco come dovrebbe funzionare il tuo primo flusso.</div><div class="px-blueprint-copy">Un blueprint leggibile in pochi secondi: da dove entra il lavoro, quale strumento lo gestisce, cosa automatizzare e quale risultato controllare.</div></div>'+
        '<div class="px-blueprint-status">PILOTA · 1 WORKFLOW</div>'+
      '</div>'+
      '<div class="px-blueprint-flow">'+
        '<div class="px-blueprint-node"><span>INPUT</span><b>'+escapeHtml(shortProblem)+'</b><small>ciò che entra nel processo</small></div>'+
        '<div class="px-blueprint-arrow">→</div>'+
        '<div class="px-blueprint-node focus"><span>CORE</span><b>'+escapeHtml(tool)+'</b><small>strumento centrale</small></div>'+
        '<div class="px-blueprint-arrow">→</div>'+
        '<div class="px-blueprint-node"><span>AUTOMAZIONE</span><b>'+escapeHtml(shortAutomation)+'</b><small>il primo passaggio da collegare</small></div>'+
        '<div class="px-blueprint-arrow">→</div>'+
        '<div class="px-blueprint-node done"><span>OUTPUT</span><b>'+escapeHtml(goal)+'</b><small>il risultato da misurare</small></div>'+
      '</div>'+
      '<div class="px-blueprint-actions">'+
        '<button id="px-blueprint-copy" type="button" class="px-blueprint-btn green">⧉ Copia blueprint</button>'+
        '<a class="px-blueprint-btn primary" href="/tutorial.html?tool='+encodeURIComponent(String(p.id||''))+'">📘 Configura il nucleo</a>'+
        '<a class="px-blueprint-btn" href="/workspace.html">Salva nel Workspace</a>'+
      '</div>';

    var anchor=$('#px-decision-cockpit')||section.querySelector('.resultgrid');
    if(anchor) anchor.insertAdjacentElement('afterend',card);
    else section.appendChild(card);

    var copy=$('#px-blueprint-copy');
    if(copy){
      copy.addEventListener('click',function(){
        var txt=[
          'PROJECT-X — SYSTEM BLUEPRINT',
          'INPUT: '+problem,
          'CORE: '+tool,
          'AUTOMAZIONE: '+automation,
          'OUTPUT: '+goal
        ].join('\n');
        if(navigator.clipboard&&navigator.clipboard.writeText){
          navigator.clipboard.writeText(txt).then(function(){announce('Blueprint copiato.');}).catch(function(){announce('Copia non disponibile.')});
        }else{
          announce('Copia non disponibile.');
        }
        try{fetch('/api/event',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({event:'blueprint_copy',sessionId:Date.now().toString(),meta:{tool:tool}})}).catch(function(){})}catch(e){}
      });
    }
  }

  function buildWorkflow(){
    if($('#px-workflow')) return;
    var section=$('#results');
    if(!section || getComputedStyle(section).display==='none') return;
    var r=getResult(),p=primary(r);
    if(!p) return;

    var tutorial=null;
    try{
      if(window.PROJECTX_TOOL_TUTORIALS && typeof window.PROJECTX_TOOL_TUTORIALS.get==='function'){
        tutorial=window.PROJECTX_TOOL_TUTORIALS.get(String(p.id||''));
      }
    }catch(e){}
    if(!tutorial || !Array.isArray(tutorial.steps) || !tutorial.steps.length) return;

    var key='projectx_workflow_state_v1_'+String(p.id||'');
    var state={};
    try{state=JSON.parse(localStorage.getItem(key)||'{}')||{};}catch(e){state={};}

    var card=document.createElement('section');
    card.id='px-workflow';
    card.className='px-workflow';
    card.setAttribute('aria-label','Workflow guidato PROJECT-X');

    var rows=tutorial.steps.slice(0,5).map(function(step,i){
      var done=state[i+1]===true;
      return '<div class="px-workflow-step'+(done?' done':'')+'" data-step="'+(i+1)+'">'+
        '<div class="px-workflow-num">'+(done?'✓':String(i+1).padStart(2,'0'))+'</div>'+
        '<div><b>'+escapeHtml(step.title||('Passo '+(i+1)))+'</b><p>'+escapeHtml(step.instruction||'Esegui questo passaggio nel software.')+'</p></div>'+
        '<button type="button" class="px-workflow-check'+(done?' done':'')+'">'+(done?'✓ Fatto':'Segna fatto')+'</button>'+
      '</div>';
    }).join('');

    var completed=Object.keys(state).filter(function(k){return state[k]===true;}).length;
    var total=Math.min(5,tutorial.steps.length);

    card.innerHTML=
      '<div class="px-workflow-head">'+
        '<div><div class="px-workflow-k">PROJECT-X · WORKFLOW GUIDATO</div><div class="px-workflow-title">Adesso lo costruiamo davvero.</div><p class="px-workflow-copy">'+escapeHtml(tutorial.mission||'Un solo processo reale, configurato passo dopo passo.')+'</p></div>'+
        '<div id="px-workflow-progress" class="px-workflow-progress">'+completed+'/'+total+' COMPLETATI</div>'+
      '</div>'+
      '<div class="px-workflow-steps">'+rows+'</div>'+
      '<div class="px-workflow-tools">'+
        '<button id="px-workflow-copy" type="button" class="px-workflow-btn primary">⧉ Copia setup</button>'+
        '<a class="px-workflow-btn" href="/tutorial.html?tool='+encodeURIComponent(String(p.id||''))+'">📘 Apri guida completa</a>'+
      '</div>';

    var anchor=$('#px-blueprint')||$('#px-decision-cockpit')||section.querySelector('.resultgrid');
    if(anchor) anchor.insertAdjacentElement('afterend',card);
    else section.appendChild(card);

    function refresh(){
      var count=0;
      card.querySelectorAll('.px-workflow-step').forEach(function(row){
        var n=Number(row.getAttribute('data-step'));
        var done=state[n]===true;
        var num=row.querySelector('.px-workflow-num');
        var btn=row.querySelector('.px-workflow-check');
        if(done) count++;
        row.classList.toggle('done',done);
        if(num) num.textContent=done?'✓':String(n).padStart(2,'0');
        if(btn){
          btn.classList.toggle('done',done);
          btn.textContent=done?'✓ Fatto':'Segna fatto';
        }
      });
      var progress=$('#px-workflow-progress');
      if(progress) progress.textContent=count+'/'+total+' COMPLETATI';
    }

    card.querySelectorAll('.px-workflow-check').forEach(function(btn){
      btn.addEventListener('click',function(){
        var row=btn.closest('.px-workflow-step');
        var n=Number(row.getAttribute('data-step'));
        state[n]=state[n]!==true;
        try{localStorage.setItem(key,JSON.stringify(state));}catch(e){}
        refresh();
        announce(state[n]?'Passo completato.':'Passo riaperto.');
        try{fetch('/api/event',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({event:'workflow_step_toggle',sessionId:Date.now().toString(),meta:{tool:String(p.id||''),step:n,done:!!state[n]}})}).catch(function(){})}catch(e){}
      });
    });

    var copy=$('#px-workflow-copy');
    if(copy){
      copy.addEventListener('click',function(){
        var text=[
          'PROJECT-X — WORKFLOW '+String(p.name||p.id||'').toUpperCase(),
          '',
          'MISSIONE: '+String(tutorial.mission||''),
          '',
          tutorial.steps.slice(0,5).map(function(s,i){return (i+1)+'. '+s.title+' — '+s.instruction;}).join('\n')
        ].join('\n');
        if(navigator.clipboard&&navigator.clipboard.writeText){
          navigator.clipboard.writeText(text).then(function(){announce('Setup copiato.');}).catch(function(){announce('Copia non disponibile.');});
        }else announce('Copia non disponibile.');
      });
    }
  }

  function improveResult(){
    var section=$('#results');
    if(!section) return;

    section.setAttribute('aria-labelledby','px-results-title');

    var h=section.querySelector('.resulthead h1');
    if(h) h.id='px-results-title';

    buildDecisionCockpit();
    buildBlueprint();
    buildWorkflow();
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
        announce('Risultato pronto. Parti dalla decisione e poi dal primo workflow.');
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
    setupMethodology();
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