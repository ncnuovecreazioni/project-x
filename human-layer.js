/* =========================================================
   PROJECT-X — HUMAN GUIDANCE LAYER
   UX-first: ogni schermata spiega dove sei, cosa stai facendo
   e qual è il prossimo passo. Nessuna API e nessun costo.
   ========================================================= */
(function(){
  'use strict';
  if (window.__PROJECTX_HUMAN_LAYER__) return;
  window.__PROJECTX_HUMAN_LAYER__ = true;

  function page(){
    var p=location.pathname.split('/').pop() || 'index.html';
    if(!p || p==='/') p='index.html';
    return p.toLowerCase();
  }

  function context(){
    var p=page();

    if(p==='index.html'){
      var results=document.getElementById('results');
      var questionnaire=document.getElementById('questionnaire');
      if(results && getComputedStyle(results).display!=='none'){
        return {
          title:'Hai la risposta. Ora trasformiamola in un’azione.',
          text:'Non devi capire tutto subito. Guarda prima la scelta principale, poi il piano dei prossimi 7 giorni.',
          step:'3 / 4 · DECIDI',
          cta:'Vedi il mio piano',
          action:function(){
            var el=document.getElementById('planMount') || document.getElementById('primaryMount');
            if(el) el.scrollIntoView({behavior:'smooth',block:'start'});
          },
          secondary:'Salva il risultato',
          secondaryAction:function(){
            var b=document.getElementById('saveLinkBtn');
            if(b) b.click();
          }
        };
      }
      if(questionnaire && getComputedStyle(questionnaire).display!=='none'){
        return {
          title:'Stai facendo la parte giusta: rispondere.',
          text:'Una domanda alla volta. Non serve conoscere il nome del software: descrivi come lavori.',
          step:'2 / 4 · CAPISCI',
          cta:'Continua',
          action:function(){
            var b=document.getElementById('nextBtn');
            if(b) b.click();
          },
          secondary:'Indietro',
          secondaryAction:function(){
            var b=document.getElementById('backBtn');
            if(b) b.click();
          }
        };
      }
      return {
        title:'Partiamo dal problema, non dal software.',
        text:'Descrivi una situazione concreta. PROJECT-X ti accompagna fino alla scelta e al primo passo operativo.',
        step:'1 / 4 · RACCONTA',
        cta:'Fai l’analisi rapida',
        action:function(){
          var el=document.getElementById('quickProblem');
          if(el){el.scrollIntoView({behavior:'smooth',block:'center'});el.focus();}
        },
        secondary:'Come funziona',
        secondaryAction:'scrollBenefits'
      };
    }

    if(p==='audit.html') return {
      title:'Prima troviamo l’attrito.',
      text:'Descrivi gli strumenti che usi oggi e il passaggio che ti fa perdere più tempo. L’audit serve a capire cosa semplificare prima di comprare altro.',
      step:'2 / 4 · CONTROLLA',
      cta:'Vai al campo Audit',
      action:function(){
        var el=document.getElementById('stack');
        if(el){el.focus();el.scrollIntoView({behavior:'smooth',block:'center'});}
      },
      secondary:'Apri Value Simulator',
      secondaryAction:function(){location.href='/simulator.html?source=audit-guide';}
    };

    if(p==='simulator.html') return {
      title:'Ora metti il tempo in numeri.',
      text:'Regola ore, valore orario, persone e recupero realistico. Usa il risultato come business case iniziale, non come promessa.',
      step:'3 / 4 · MISURA',
      cta:'Modifica i parametri',
      action:function(){
        var el=document.getElementById('hours');
        if(el){el.focus();el.scrollIntoView({behavior:'smooth',block:'center'});}
      },
      secondary:'Apri Business Audit',
      secondaryAction:function(){location.href='/audit.html?source=simulator-guide';}
    };

    if(p==='workspace.html') return {
      title:'Riprendi da dove eri arrivato.',
      text:'La Workspace riunisce i dati salvati dal browser. Guarda il prossimo passo e apri solo lo strumento che ti serve adesso.',
      step:'PROJECT-X · WORKSPACE',
      cta:'Vai al prossimo passo',
      action:function(){
        var el=document.getElementById('nextBtn');
        if(el)el.click();
      },
      secondary:'Torna al motore',
      secondaryAction:'goHome'
    };

    if(p==='coach.html') return {
      title:'Non devi sapere cosa chiedere.',
      text:'Racconta il problema come lo diresti a una persona. Il Coach ti aiuta a trasformarlo in un profilo operativo.',
      step:'1 / 3 · RACCONTA',
      cta:'Vai alla domanda',
      action:function(){
        var el=document.getElementById('input') || document.querySelector('textarea, input[type="text"], input:not([type])');
        if(el){el.focus();el.scrollIntoView({behavior:'smooth',block:'center'});}
      },
      secondary:'Torna a PROJECT-X',
      secondaryAction:'goHome'
    };

    if(p==='coach-result.html') return {
      title:'Ora il risultato deve diventare una decisione.',
      text:'Leggi prima il punto principale. Poi usa il pulsante dei prossimi passi: non serve fare tutto insieme.',
      step:'2 / 3 · DECIDI',
      cta:'Guarda i prossimi passi',
      action:function(){
        var el=document.querySelector('.steps, .actions, [id*="next"], .card');
        if(el) el.scrollIntoView({behavior:'smooth',block:'start'});
      },
      secondary:'Torna al motore',
      secondaryAction:'goHome'
    };

    if(p==='pro.html') return {
      title:'Prima capisci cosa stai acquistando.',
      text:'Il Report PRO è il livello successivo: roadmap, workflow, KPI, business case e blueprint. Il checkout è separato.',
      step:'3 / 4 · APPROFONDISCI',
      cta:'Guarda cosa ricevi',
      action:function(){
        var el=document.querySelector('.features, #proCheckoutBtn');
        if(el) el.scrollIntoView({behavior:'smooth',block:'center'});
      },
      secondary:'Torna al motore',
      secondaryAction:'goHome'
    };

    if(p==='report-pro.html') return {
      title:'Qui non devi più scegliere: devi eseguire.',
      text:'Usa il report come sequenza. Prima la roadmap, poi il workflow prioritario, poi la misura del risultato.',
      step:'4 / 4 · AGISCI',
      cta:'Vai all’implementazione',
      action:function(){location.href='/implementation.html';},
      secondary:'Torna al motore',
      secondaryAction:'goHome'
    };

    if(p==='implementation.html') return {
      title:'Hai già una direzione. Ora trasformala in sistema.',
      text:'Invia il contesto, ricevi un contatto e valuta il lavoro necessario prima di procedere.',
      step:'4 / 4 · AGISCI',
      cta:'Compila la richiesta',
      action:function(){
        var el=document.querySelector('form, input, textarea');
        if(el) el.scrollIntoView({behavior:'smooth',block:'center'});
      },
      secondary:'Torna al risultato',
      secondaryAction:'goHome'
    };

    if(p==='compare.html') return {
      title:'Non confrontare tutto. Confronta quello che serve.',
      text:'Parti dal bisogno principale, usa il confronto per eliminare le alternative meno coerenti e poi torna all’analisi.',
      step:'DECISIONE',
      cta:'Torna al motore',
      action:'goHome',
      secondary:'Leggi la FAQ',
      secondaryAction:'goFaq'
    };

    return {
      title:'Ti guido io.',
      text:'In ogni momento puoi tornare al motore, capire cosa stai guardando e riprendere dal punto giusto.',
      step:'PROJECT-X',
      cta:'Torna al motore',
      action:'goHome',
      secondary:'FAQ',
      secondaryAction:'goFaq'
    };
  }

  function handle(name){
    if(name==='goHome'){location.href='/';return;}
    if(name==='goFaq'){location.href='/faq.html';return;}
    if(name==='scrollBenefits'){
      var el=document.getElementById('benefits');
      if(el) el.scrollIntoView({behavior:'smooth',block:'start'});
      return;
    }
    try{
      if(typeof window[name]==='function') window[name]();
    }catch(e){}
  }

  function plainLanguage(){
    var existing=document.getElementById('px-plain-language');
    var p=page();
    var mode='home';
    if(p==='index.html'){
      var results=document.getElementById('results');
      var questionnaire=document.getElementById('questionnaire');
      if(results && getComputedStyle(results).display!=='none') mode='results';
      else if(questionnaire && getComputedStyle(questionnaire).display!=='none') mode='questionnaire';
    }

    var data={
      home:{
        kicker:'IN PAROLE SEMPLICI',
        title:'Tu racconti il problema. PROJECT-X fa il resto.',
        steps:[['1','RACCONTA','Scrivi cosa ti fa perdere tempo.'],['2','CAPISCI','Il sistema traduce il problema in bisogni e vincoli.'],['3','DECIDI','Ricevi una direzione software e il prossimo passo.']]
      },
      questionnaire:{
        kicker:'COME LEGGERLA',
        title:'Non ci sono risposte “giuste”.',
        steps:[['1','DESCRIVI','Rispondi come lavori davvero.'],['2','NON PENSARE AL SOFTWARE','Il nome dell’app non serve per arrivare alla scelta.'],['3','AVANTI','Una domanda alla volta: il motore mette insieme il quadro.']]
      },
      results:{
        kicker:'COME LEGGERE IL RISULTATO',
        title:'Guarda queste 3 cose, in quest’ordine.',
        steps:[['1','SCELTA PRINCIPALE','È il nucleo che il motore considera più coerente con il tuo profilo.'],['2','PERCHÉ','Controlla bisogni, copertura, gap e motivazione della scelta.'],['3','COSA FARE','Segui il piano e automatizza un solo collo di bottiglia per volta.']]
      },
      audit:{
        kicker:'COME FUNZIONA',
        title:'L’Audit risponde a una domanda molto semplice.',
        steps:[['1','COSA HAI','Scrivi strumenti e processo che usi oggi.'],['2','DOVE ATTRITO','PROJECT-X cerca duplicazioni e lavoro manuale.'],['3','COSA CAMBIARE','Scegli un workflow da semplificare prima di aggiungere software.']]
      },
      simulator:{
        kicker:'COME LEGGERLO',
        title:'Il numero non è una promessa: è un punto di partenza.',
        steps:[['1','ORE','Quante ore vengono assorbite dal processo?'],['2','VALORE','Quanto vale, in media, un’ora di quel lavoro?'],['3','SCENARIO','Quanto di quel tempo pensi realisticamente di poter recuperare?']]
      },
      workspace:{
        kicker:'COME USARLA',
        title:'La Workspace ti dice semplicemente cosa fare adesso.',
        steps:[['1','ANALISI','Il profilo che hai già compilato.'],['2','AUDIT + SIMULATOR','Capisci attrito e valore prima di decidere.'],['3','PROSSIMO PASSO','Apri solo il tassello successivo, non tutto insieme.']]
      },
      pro:{
        kicker:'COSA STAI COMPRANDO',
        title:'Report PRO significa istruzioni più dettagliate.',
        steps:[['1','ROADMAP','Cosa fare e in quale ordine.'],['2','WORKFLOW','Come trasformare il processo in automazioni concrete.'],['3','MISURA','Quali numeri controllare per capire se ha funzionato.']]
      },
      report:{
        kicker:'COME USARLO',
        title:'Il Report PRO va letto come un progetto.',
        steps:[['1','PRIMA','Capisci il problema e il nucleo del sistema.'],['2','POI','Segui le automazioni e la sequenza di implementazione.'],['3','INFINE','Misura il risultato con KPI semplici.']]
      },
      implementation:{
        kicker:'COSA SUCCEDE',
        title:'Qui trasformi il piano in lavoro reale.',
        steps:[['1','CONTESTO','Racconti cosa vuoi realizzare.'],['2','VALUTAZIONE','Si definisce cosa serve davvero.'],['3','ESECUZIONE','Il sistema passa dalla pagina al processo.']]
      },
      compare:{
        kicker:'COME USARLO',
        title:'Confronta solo ciò che serve alla tua decisione.',
        steps:[['1','PARTI DAL BISOGNO','Non dal nome della marca.'],['2','RIDUCI LE OPZIONI','Guarda differenze concrete.'],['3','TORNA AL PIANO','La scelta ha senso solo se risolve il problema.']]
      },
      generic:{
        kicker:'IN PAROLE SEMPLICI',
        title:'Non devi conoscere il gergo.',
        steps:[['1','CAPISCI','Guarda cosa stai cercando di ottenere.'],['2','SCEGLI','Usa il minimo numero di strumenti necessari.'],['3','AGISCI','Fai il prossimo passo concreto.']]
      }
    };
    var key=mode;
    if(mode==='home' && p!=='index.html') key=p==='audit.html'?'audit':p==='simulator.html'?'simulator':p==='workspace.html'?'workspace':p==='pro.html'?'pro':p==='report-pro.html'?'report':p==='implementation.html'?'implementation':p==='compare.html'?'compare':'generic';
    var d=data[key]||data.generic;
    var modeKey=(p==='index.html'?mode:key);
    if(existing){
      if(existing.getAttribute('data-mode-key')===modeKey) return;
      existing.remove();
    }
    var host=null;
    if(p==='index.html' && mode==='results') host=document.querySelector('.resulthead');
    else if(p==='index.html' && mode==='questionnaire') host=document.querySelector('#questionnaire .qwrap');
    else host=document.querySelector('.hero');
    if(!host) return;

    var card=document.createElement('section');
    card.id='px-plain-language';
    card.setAttribute('data-mode-key',modeKey);
    card.setAttribute('aria-label','Spiegazione in parole semplici');
    card.innerHTML='<div class="pxpl-kicker">'+d.kicker+'</div><div class="pxpl-title">'+d.title+'</div><div class="pxpl-steps">'+d.steps.map(function(x){return '<div class="pxpl-step"><b>'+x[0]+'</b><div><strong>'+x[1]+'</strong><span>'+x[2]+'</span></div></div>'}).join('')+'</div>';

    if(p==='index.html' && mode==='results') host.insertAdjacentElement('afterend',card);
    else if(p==='index.html' && mode==='questionnaire'){
      var qcard=host.querySelector('.qcard');
      if(qcard) host.insertBefore(card,qcard); else host.appendChild(card);
    }else{
      var hp=host.querySelector('p');
      if(hp) hp.insertAdjacentElement('afterend',card); else host.appendChild(card);
    }

    var st=document.createElement('style');
    st.textContent='#px-plain-language{width:min(920px,calc(100% - 30px));margin:16px auto 0;padding:16px 17px;text-align:left;border:1px solid rgba(124,92,255,.16);border-radius:18px;background:linear-gradient(145deg,rgba(18,25,44,.72),rgba(8,12,22,.76));box-shadow:0 18px 60px rgba(0,0,0,.14)}.pxpl-kicker{font-size:11px;letter-spacing:.15em;font-weight:950;color:#a99cff}.pxpl-title{margin-top:7px;font-size:19px;font-weight:950;letter-spacing:-.025em}.pxpl-steps{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;margin-top:11px}.pxpl-step{display:grid;grid-template-columns:26px 1fr;gap:8px;align-items:start;padding:10px;border:1px solid rgba(255,255,255,.06);border-radius:12px;background:rgba(255,255,255,.018)}.pxpl-step>b{width:29px;height:29px;display:grid;place-items:center;border-radius:9px;background:rgba(124,92,255,.11);color:#c8bfff;font-size:11px}.pxpl-step strong{display:block;font-size:12px}.pxpl-step span{display:block;margin-top:4px;color:#a3aec0;font-size:12px;line-height:1.5}@media(max-width:680px){#px-plain-language{width:calc(100% - 22px)}.pxpl-steps{grid-template-columns:1fr}.pxpl-step{grid-template-columns:28px 1fr}}';
    document.head.appendChild(st);
  }

  function inject(){
    if(document.getElementById('px-human-guidance')) return;

    var style=document.createElement('style');
    style.id='px-human-guidance-style';
    style.textContent='#px-human-guidance{pointer-events:none;position:fixed;right:18px;bottom:18px;z-index:9999;font-family:Inter,system-ui,-apple-system,"Segoe UI",sans-serif}#px-human-toggle{display:inline-flex;align-items:center;gap:8px;padding:12px 14px;border:1px solid rgba(124,92,255,.35);background:rgba(10,14,27,.93);backdrop-filter:blur(16px);color:#fff;border-radius:999px;box-shadow:0 18px 60px rgba(0,0,0,.35);font-weight:900;font-size:13px;cursor:pointer}#px-human-toggle .dot{width:8px;height:8px;border-radius:50%;background:#36d99d;box-shadow:0 0 0 5px rgba(54,217,157,.08)}#px-human-panel{display:none;width:min(390px,calc(100vw - 28px));margin-bottom:10px;padding:17px;border:1px solid rgba(124,92,255,.24);background:rgba(9,13,24,.97);backdrop-filter:blur(20px);color:#fff;border-radius:20px;box-shadow:0 25px 90px rgba(0,0,0,.5)}#px-human-panel.open{display:block}.pxh-top{display:flex;justify-content:space-between;gap:12px;align-items:flex-start}.pxh-step{display:inline-flex;padding:8px 10px;border:1px solid rgba(124,92,255,.23);background:rgba(124,92,255,.08);color:#bfb3ff;border-radius:999px;font-size:12px;font-weight:900}.pxh-close{border:0;background:transparent;color:#74819a;font-size:17px;cursor:pointer}.pxh-title{margin:11px 0 6px;font-size:20px;font-weight:950;letter-spacing:-.02em}.pxh-text{margin:0;color:#c0cad8;font-size:14px;line-height:1.65}.pxh-actions{display:grid;gap:8px;margin-top:14px}.pxh-btn{width:100%;padding:13px 14px;border-radius:13px;border:1px solid rgba(124,92,255,.25);background:linear-gradient(135deg,#7c5cff,#5b8cff);color:#fff;font-weight:900;font-size:14px;cursor:pointer}.pxh-btn.secondary{background:rgba(255,255,255,.035);color:#dfe6f4;border-color:rgba(255,255,255,.09)}.pxh-foot{margin-top:11px;color:#8b98ab;font-size:12px;line-height:1.5}@media(max-width:600px){#px-human-guidance{right:11px;bottom:76px;left:11px}#px-human-toggle{width:100%;justify-content:center}#px-human-panel{width:100%;max-height:60vh;overflow:auto}}';

    document.head.appendChild(style);

    var wrap=document.createElement('div');
    wrap.id='px-human-guidance';
    wrap.innerHTML='<div id="px-human-panel"><div class="pxh-top"><span id="px-human-step" class="pxh-step"></span><button id="px-human-close" class="pxh-close" aria-label="Chiudi guida">×</button></div><div id="px-human-title" class="pxh-title"></div><p id="px-human-text" class="pxh-text"></p><div class="pxh-actions"><button id="px-human-primary" class="pxh-btn"></button><button id="px-human-secondary" class="pxh-btn secondary"></button></div><div class="pxh-foot">Guida PROJECT-X · puoi chiuderla in qualsiasi momento.</div></div><button id="px-human-toggle" aria-expanded="false"><span class="dot"></span><span>Ti guido io</span></button>';
    document.body.appendChild(wrap);

    var fontToggle=document.createElement('button');
    fontToggle.id='px-font-toggle';
    fontToggle.type='button';
    fontToggle.setAttribute('aria-pressed','false');
    fontToggle.setAttribute('aria-label','Attiva testo grande');
    fontToggle.textContent='Aa  Testo grande';
    document.body.appendChild(fontToggle);

    function applyLargeText(on){
      document.body.classList.toggle('px-large-text',!!on);
      fontToggle.setAttribute('aria-pressed',on?'true':'false');
      fontToggle.setAttribute('aria-label',on?'Disattiva testo grande':'Attiva testo grande');
      fontToggle.textContent=on?'Aa  Testo normale':'Aa  Testo grande';
      try{localStorage.setItem('projectx_large_text_v1',on?'1':'0')}catch(e){}
    }

    var largeText=false;
    try{largeText=localStorage.getItem('projectx_large_text_v1')==='1'}catch(e){}
    applyLargeText(largeText);

    fontToggle.onclick=function(){
      applyLargeText(!document.body.classList.contains('px-large-text'));
    };

    plainLanguage();
    var viewObserver=new MutationObserver(function(){ plainLanguage(); });
    var qv=document.getElementById('questionnaire'),rv=document.getElementById('results');
    if(qv)viewObserver.observe(qv,{attributes:true,attributeFilter:['style','class']});
    if(rv)viewObserver.observe(rv,{attributes:true,attributeFilter:['style','class']});

    var ctx=context();
    function renderContext(){
      ctx=context();
      document.getElementById('px-human-step').textContent=ctx.step;
      document.getElementById('px-human-title').textContent=ctx.title;
      document.getElementById('px-human-text').textContent=ctx.text;
      document.getElementById('px-human-primary').textContent=ctx.cta;
      document.getElementById('px-human-secondary').textContent=ctx.secondary;
    }
    renderContext();
    document.getElementById('px-human-title').textContent=ctx.title;
    document.getElementById('px-human-text').textContent=ctx.text;
    document.getElementById('px-human-primary').textContent=ctx.cta;
    document.getElementById('px-human-secondary').textContent=ctx.secondary;

    var panel=document.getElementById('px-human-panel');
    var toggle=document.getElementById('px-human-toggle');
    var close=document.getElementById('px-human-close');

    function open(){
      renderContext();
      panel.classList.add('open');
      toggle.setAttribute('aria-expanded','true');
    }
    function shut(){panel.classList.remove('open');toggle.setAttribute('aria-expanded','false');}

    toggle.onclick=function(){panel.classList.contains('open')?shut():open();};
    close.onclick=shut;
    document.getElementById('px-human-primary').onclick=function(){
      renderContext();
      if(typeof ctx.action==='function')ctx.action();else handle(ctx.action);
      shut();
    };
    document.getElementById('px-human-secondary').onclick=function(){
      renderContext();
      if(typeof ctx.secondaryAction==='function')ctx.secondaryAction();else handle(ctx.secondaryAction);
      shut();
    };
    document.addEventListener('keydown',function(e){if(e.key==='Escape')shut();});
    ['quickProblem','painInput','input','stack','manual','context'].forEach(function(id){
      var field=document.getElementById(id);
      if(field){
        field.addEventListener('focus',function(){
          shut();
        });
      }
    });

    // La guida non si apre da sola: non deve mai coprire campi o contenuti.
    try{
      sessionStorage.setItem('projectx_human_guide_seen_v1','1');
    }catch(e){}
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',inject);
  else inject();
})();