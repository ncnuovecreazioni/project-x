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

  function inject(){
    if(document.getElementById('px-human-guidance')) return;

    var style=document.createElement('style');
    style.id='px-human-guidance-style';
    style.textContent='#px-human-guidance{position:fixed;right:18px;bottom:18px;z-index:9999;font-family:Inter,system-ui,-apple-system,"Segoe UI",sans-serif}#px-human-toggle{display:inline-flex;align-items:center;gap:8px;padding:12px 14px;border:1px solid rgba(124,92,255,.35);background:rgba(10,14,27,.93);backdrop-filter:blur(16px);color:#fff;border-radius:999px;box-shadow:0 18px 60px rgba(0,0,0,.35);font-weight:900;font-size:11px;cursor:pointer}#px-human-toggle .dot{width:8px;height:8px;border-radius:50%;background:#36d99d;box-shadow:0 0 0 5px rgba(54,217,157,.08)}#px-human-panel{display:none;width:min(390px,calc(100vw - 28px));margin-bottom:10px;padding:17px;border:1px solid rgba(124,92,255,.24);background:rgba(9,13,24,.97);backdrop-filter:blur(20px);color:#fff;border-radius:20px;box-shadow:0 25px 90px rgba(0,0,0,.5)}#px-human-panel.open{display:block}.pxh-top{display:flex;justify-content:space-between;gap:12px;align-items:flex-start}.pxh-step{display:inline-flex;padding:6px 8px;border:1px solid rgba(124,92,255,.23);background:rgba(124,92,255,.08);color:#bfb3ff;border-radius:999px;font-size:9px;font-weight:900}.pxh-close{border:0;background:transparent;color:#74819a;font-size:17px;cursor:pointer}.pxh-title{margin:11px 0 6px;font-size:16px;font-weight:950;letter-spacing:-.02em}.pxh-text{margin:0;color:#98a5bc;font-size:11px;line-height:1.55}.pxh-actions{display:grid;gap:8px;margin-top:14px}.pxh-btn{width:100%;padding:11px 12px;border-radius:12px;border:1px solid rgba(124,92,255,.25);background:linear-gradient(135deg,#7c5cff,#5b8cff);color:#fff;font-weight:900;font-size:11px;cursor:pointer}.pxh-btn.secondary{background:rgba(255,255,255,.035);color:#dfe6f4;border-color:rgba(255,255,255,.09)}.pxh-foot{margin-top:10px;color:#69768d;font-size:9px;line-height:1.45}@media(max-width:600px){#px-human-guidance{right:11px;bottom:11px;left:11px}#px-human-toggle{width:100%;justify-content:center}#px-human-panel{width:100%}}';

    document.head.appendChild(style);

    var wrap=document.createElement('div');
    wrap.id='px-human-guidance';
    wrap.innerHTML='<div id="px-human-panel"><div class="pxh-top"><span id="px-human-step" class="pxh-step"></span><button id="px-human-close" class="pxh-close" aria-label="Chiudi guida">×</button></div><div id="px-human-title" class="pxh-title"></div><p id="px-human-text" class="pxh-text"></p><div class="pxh-actions"><button id="px-human-primary" class="pxh-btn"></button><button id="px-human-secondary" class="pxh-btn secondary"></button></div><div class="pxh-foot">Guida PROJECT-X · puoi chiuderla in qualsiasi momento.</div></div><button id="px-human-toggle" aria-expanded="false"><span class="dot"></span><span>Ti guido io</span></button>';
    document.body.appendChild(wrap);

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

    try{
      if(!sessionStorage.getItem('projectx_human_guide_seen_v1')){
        setTimeout(open,900);
        sessionStorage.setItem('projectx_human_guide_seen_v1','1');
      }
    }catch(e){}
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',inject);
  else inject();
})();