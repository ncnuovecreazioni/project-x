/* =========================================================
   PROJECT-X — CONVERSION + DECISION LAYER
   ---------------------------------------------------------
   UI/product layer only.
   Does not alter engine scoring or AI interpretation.
   ========================================================= */
(function(){
  'use strict';

  if(window.__PROJECTX_CONVERSION_LAYER__) return;
  window.__PROJECTX_CONVERSION_LAYER__ = true;

  function $$(s,root){return Array.prototype.slice.call((root||document).querySelectorAll(s));}
  function one(s,root){return (root||document).querySelector(s);}
  function esc(v){
    return String(v==null?'':v).replace(/[&<>"']/g,function(c){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
    });
  }
  function num(v){var n=Number(v);return Number.isFinite(n)?n:0;}
  function pct(v){return Math.max(0,Math.min(100,Math.round(num(v))));}
  function money(v){return '€'+Math.round(num(v)).toLocaleString('it-IT');}
  function answers(){
    try{return JSON.parse(localStorage.getItem('projectx_answers_v2')||'{}')}catch(e){return {}}
  }
  function result(){
    try{return window.result||null}catch(e){return null}
  }
  function domResult(){
    var root=one('#results');
    if(!root || getComputedStyle(root).display==='none') return null;
    var title=one('.resulthero h2',root);
    var fitEl=one('.fit',root);
    var stack=one('#stackMount',root);
    var gaps=one('#gapMount',root);
    var coverageEl=one('#architectureMount .score b',root);
    var values=one('#valueMount .money',root);
    return {
      primary:{name:title?title.textContent.trim():'PROJECT-X'},
      fit:fitEl?(fitEl.textContent.match(/(\\d+)\\s*%/)||[])[1]||0:0,
      coverage:coverageEl?coverageEl.textContent.replace(/[^0-9]/g,''):0,
      stackCount:stack?stack.querySelectorAll('.item').length:0,
      gapCount:gaps?gaps.querySelectorAll('.item').length:0,
      monthlyText:values?values.textContent:'',
      primaryNode:title
    };
  }
  function primary(r){
    return r&&(r.primaryTool||r.primary||(r.rankedTools&&r.rankedTools[0]))||null;
  }
  function fit(t){return pct(t&&(t.compatibility!=null?t.compatibility:t.score));}
  function track(event,meta){
    try{
      if(window.ProjectXAutopilot&&typeof window.ProjectXAutopilot.track==='function'){
        window.ProjectXAutopilot.track(event,meta||{});
      }
    }catch(e){}
  }

  function styles(){
    if(one('#px-conversion-styles')) return;
    var s=document.createElement('style');
    s.id='px-conversion-styles';
    s.textContent='      .px-live-preview{margin-top:13px;padding:14px 15px;border:1px solid rgba(124,92,255,.18);border-radius:15px;background:rgba(124,92,255,.045)}      .px-live-preview-label{font-size:8px;letter-spacing:.14em;color:#9185ff;font-weight:950}      .px-live-preview-text{margin-top:6px;color:#dfe5f2;font-size:12px;line-height:1.5;min-height:18px}      .px-human-result{margin:0 0 14px;padding:17px 19px;border-radius:19px;border:1px solid rgba(54,217,157,.14);background:linear-gradient(135deg,rgba(54,217,157,.045),rgba(124,92,255,.045));}      .px-hr-kicker{font-size:8px;letter-spacing:.16em;font-weight:950;color:#7ce8bd}      .px-hr-title{margin:6px 0 5px;font-size:19px;font-weight:950;letter-spacing:-.03em}      .px-hr-copy{margin:0;color:#8e9bb0;font-size:10px;line-height:1.55;max-width:820px}      .px-hr-tags{display:flex;gap:6px;flex-wrap:wrap;margin-top:11px}.px-hr-tag{padding:7px 9px;border-radius:999px;border:1px solid rgba(255,255,255,.07);background:rgba(255,255,255,.02);color:#aeb8c9;font-size:8px;font-weight:800}.px-hr-tag strong{color:#fff}      .px-system-map{margin:0 0 14px;padding:19px;border-radius:22px;border:1px solid rgba(124,92,255,.18);background:radial-gradient(circle at 50% -10%,rgba(124,92,255,.11),transparent 45%),linear-gradient(145deg,rgba(16,23,40,.94),rgba(8,12,22,.97));overflow:hidden}@keyframes pxMapIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}.px-sm-node:nth-child(3){animation-delay:.08s}.px-sm-node:nth-child(5){animation-delay:.16s}.px-sm-node:nth-child(7){animation-delay:.24s}@media(prefers-reduced-motion:reduce){.px-sm-node{animation:none!important}} .px-sm-head{display:flex;justify-content:space-between;align-items:flex-end;gap:12px}.px-sm-kicker{font-size:8px;letter-spacing:.15em;color:#a99cff;font-weight:950}.px-sm-title{margin-top:5px;font-size:20px;font-weight:950;letter-spacing:-.035em}.px-sm-copy{margin:4px 0 0;color:#7f8ca2;font-size:9px;line-height:1.45}.px-sm-badge{padding:7px 9px;border-radius:999px;border:1px solid rgba(54,217,157,.16);background:rgba(54,217,157,.04);color:#7ce8bd;font-size:8px;font-weight:900;white-space:nowrap}.px-sm-flow{display:grid;grid-template-columns:1fr 28px 1fr 28px 1fr 28px 1fr;gap:6px;align-items:stretch;margin-top:15px}.px-sm-node{min-height:86px;padding:12px;border:1px solid rgba(255,255,255,.065);border-radius:13px;background:rgba(255,255,255,.02);display:flex;flex-direction:column;justify-content:center;animation:pxMapIn .45s ease both}.px-sm-node.primary{border-color:rgba(124,92,255,.28);background:rgba(124,92,255,.065)}.px-sm-node:last-child{border-color:rgba(54,217,157,.16);background:rgba(54,217,157,.035)}.px-sm-node small{font-size:7px;letter-spacing:.12em;color:#77859b;font-weight:900}.px-sm-node b{margin-top:5px;font-size:12px}.px-sm-node span{margin-top:4px;color:#8592a7;font-size:8px;line-height:1.35}.px-sm-arrow{display:grid;place-items:center;color:#9e92ff;font-weight:950;font-size:15px}.px-sm-foot{margin-top:11px;padding:10px 11px;border-radius:11px;background:rgba(255,255,255,.018);color:#7f8da3;font-size:8px;line-height:1.45}.px-sm-foot strong{color:#dce3ef}@media(max-width:800px){.px-sm-flow{grid-template-columns:1fr;gap:6px}.px-sm-arrow{min-height:18px;transform:rotate(90deg)}.px-sm-head{display:block}.px-sm-badge{display:inline-flex;margin-top:9px}} .px-decision-strip{width:min(1040px,calc(100% - 30px));margin:18px auto 0;display:grid;grid-template-columns:repeat(4,1fr);gap:8px}      .px-ds-card{position:relative;padding:14px 13px;border:1px solid rgba(255,255,255,.07);border-radius:15px;background:linear-gradient(145deg,rgba(17,24,42,.75),rgba(8,12,22,.75));overflow:hidden;transition:.18s}      .px-ds-card:hover{transform:translateY(-2px);border-color:rgba(124,92,255,.28)}      .px-ds-card:after{content:"";position:absolute;width:110px;height:110px;right:-45px;bottom:-62px;border-radius:50%;background:rgba(124,92,255,.10);filter:blur(18px)}      .px-ds-kicker{font-size:8px;letter-spacing:.13em;color:#7f8ba0;font-weight:900;text-transform:uppercase}      .px-ds-value{margin-top:6px;font-size:17px;font-weight:950;letter-spacing:-.03em}      .px-ds-copy{margin-top:3px;font-size:9px;line-height:1.35;color:#7d8ba2}      .px-decision-strip.is-results{margin-top:0;margin-bottom:15px}      .px-decision-brief{margin:0 0 14px;padding:18px 19px;border:1px solid rgba(124,92,255,.20);border-radius:21px;background:linear-gradient(145deg,rgba(18,25,44,.95),rgba(8,12,22,.97));box-shadow:0 20px 65px rgba(0,0,0,.16)}      .px-db-kicker{font-size:8px;letter-spacing:.15em;font-weight:950;color:#a99cff}.px-db-title{margin:6px 0 5px;font-size:22px;font-weight:950;letter-spacing:-.035em}.px-db-copy{margin:0;color:#8e9bb0;font-size:10px;line-height:1.55}.px-db-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;margin-top:13px}.px-db-item{padding:11px 12px;border:1px solid rgba(255,255,255,.065);border-radius:12px;background:rgba(255,255,255,.018)}.px-db-item b{display:block;font-size:8px;letter-spacing:.09em;color:#7f8da3}.px-db-item strong{display:block;margin-top:5px;font-size:11px;line-height:1.25}.px-db-item span{display:block;margin-top:4px;color:#7d8aa0;font-size:8px;line-height:1.4}.px-db-cta{margin-top:11px;padding:10px 11px;border-radius:11px;border:1px solid rgba(54,217,157,.13);background:rgba(54,217,157,.035);color:#7f8da2;font-size:9px;line-height:1.45}.px-db-cta strong{color:#fff}@media(max-width:680px){.px-db-grid{grid-template-columns:1fr}.px-db-title{font-size:20px}}       .px-system-compare{margin:0 0 14px;padding:18px 19px;border:1px solid rgba(54,217,157,.14);border-radius:21px;background:linear-gradient(145deg,rgba(12,24,29,.92),rgba(8,12,22,.97));box-shadow:0 20px 65px rgba(0,0,0,.14)}      .px-sc-head{font-size:8px;letter-spacing:.15em;color:#7ce8bd;font-weight:950}.px-sc-title{margin-top:6px;font-size:19px;font-weight:950;letter-spacing:-.03em}.px-sc-copy{margin:4px 0 0;color:#8795aa;font-size:9px;line-height:1.45}.px-sc-grid{display:grid;grid-template-columns:1fr 34px 1fr;gap:8px;align-items:stretch;margin-top:13px}.px-sc-box{padding:13px;border:1px solid rgba(255,255,255,.07);border-radius:13px;background:rgba(255,255,255,.018)}.px-sc-box b{display:block;font-size:8px;letter-spacing:.08em}.px-sc-box strong{display:block;margin-top:6px;font-size:11px;line-height:1.25}.px-sc-box span{display:block;margin-top:4px;color:#7d8ba1;font-size:8px;line-height:1.4}.px-sc-arrow{display:grid;place-items:center;border-radius:10px;background:rgba(54,217,157,.05);color:#7ce8bd;font-size:15px;font-weight:950}.px-sc-note{margin-top:10px;color:#7f8ca2;font-size:8px;line-height:1.45}.px-sc-note strong{color:#fff}@media(max-width:680px){.px-sc-grid{grid-template-columns:1fr}.px-sc-arrow{min-height:28px;transform:rotate(90deg)}}
      .px-result-scorecard{margin-top:15px;padding:22px;border-radius:24px;border:1px solid rgba(255,255,255,.08);background:radial-gradient(circle at 88% 8%,rgba(124,92,255,.10),transparent 30%),linear-gradient(145deg,rgba(15,22,38,.92),rgba(8,12,22,.96));box-shadow:0 20px 70px rgba(0,0,0,.16)}      .px-score-head{display:flex;align-items:flex-start;justify-content:space-between;gap:16px}      .px-score-kicker{font-size:9px;letter-spacing:.15em;color:#a99dff;font-weight:950;text-transform:uppercase}      .px-score-title{margin:7px 0 0;font-size:22px;letter-spacing:-.035em}      .px-score-copy{margin:5px 0 0;color:#8794aa;font-size:10px;line-height:1.5;max-width:720px}      .px-score-badge{padding:9px 12px;border-radius:12px;border:1px solid rgba(54,217,157,.18);background:rgba(54,217,157,.05);color:#7ce8bd;font-size:10px;font-weight:950;white-space:nowrap}      .px-score-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:15px}      .px-score-item{padding:12px;border:1px solid rgba(255,255,255,.065);border-radius:12px;background:rgba(255,255,255,.02)}      .px-score-item b{display:block;font-size:18px;letter-spacing:-.03em}      .px-score-item span{display:block;margin-top:4px;color:#7d8ba1;font-size:8px;line-height:1.35}      .px-value-band{margin-top:10px;padding:16px;border-radius:17px;border:1px solid rgba(255,209,102,.14);background:linear-gradient(90deg,rgba(255,209,102,.045),rgba(124,92,255,.035));display:grid;grid-template-columns:1fr auto;gap:14px;align-items:center}      .px-value-band strong{display:block;font-size:15px}      .px-value-band span{display:block;margin-top:3px;color:#7f8ca2;font-size:9px;line-height:1.4}      .px-value-amount{font-size:24px!important;color:#ffe08d;letter-spacing:-.04em;white-space:nowrap}      .px-next-action{margin-top:10px;display:flex;justify-content:space-between;gap:12px;align-items:center;padding:14px;border:1px solid rgba(124,92,255,.16);border-radius:15px;background:rgba(124,92,255,.045)}      .px-next-action strong{display:block;font-size:10px}      .px-next-action span{display:block;margin-top:3px;color:#818ea4;font-size:9px;line-height:1.4}      .px-next-action a{display:inline-flex;align-items:center;justify-content:center;padding:10px 13px;border-radius:10px;text-decoration:none;color:#fff;background:linear-gradient(135deg,#7c5cff,#5b8cff);font-size:9px;font-weight:900;white-space:nowrap}      .px-before-after{margin-top:10px;display:grid;grid-template-columns:1fr 36px 1fr;align-items:stretch;gap:7px}      .px-ba-box{padding:13px;border-radius:13px;border:1px solid rgba(255,255,255,.07);background:rgba(255,255,255,.02)}      .px-ba-box b{display:block;font-size:10px}      .px-ba-box span{display:block;margin-top:5px;color:#9ba7bb;font-size:9px;line-height:1.45}      .px-ba-arrow{display:grid;place-items:center;border-radius:10px;background:rgba(124,92,255,.08);color:#bcb1ff;font-weight:950}      @media(max-width:760px){        .px-decision-strip{grid-template-columns:1fr 1fr}        .px-score-grid{grid-template-columns:1fr 1fr}        .px-score-head{display:block}        .px-score-badge{display:inline-flex;margin-top:10px}        .px-value-band{grid-template-columns:1fr}        .px-next-action{display:block}        .px-next-action a{margin-top:10px;width:100%}      }      @media(max-width:520px){        .px-decision-strip{width:calc(100% - 22px);grid-template-columns:1fr 1fr}        .px-before-after{grid-template-columns:1fr}        .px-ba-arrow{min-height:28px}      }    ';
    document.head.appendChild(s);
  }

  function addHomeDecisionStrip(){
    if(one('#px-home-decision-strip')) return;
    var hero=one('.hero');
    if(!hero || one('#results',hero)) return;
    var mount=one('.px-wow-proof')||one('.quickbox');
    if(!mount) return;

    var strip=document.createElement('div');
    strip.id='px-home-decision-strip';
    strip.className='px-decision-strip';
    strip.innerHTML=
      '<div class="px-ds-card"><div class="px-ds-kicker">INPUT</div><div class="px-ds-value">Il tuo problema</div><div class="px-ds-copy">Parole normali, senza conoscere il software.</div></div>'+
      '<div class="px-ds-card"><div class="px-ds-kicker">LOGICA</div><div class="px-ds-value">Bisogni + vincoli</div><div class="px-ds-copy">Team, budget, tecnologia, obiettivi e stack esistente.</div></div>'+
      '<div class="px-ds-card"><div class="px-ds-kicker">OUTPUT</div><div class="px-ds-value">Uno stack</div><div class="px-ds-copy">Una direzione concreta, non una lista infinita di app.</div></div>'+
      '<div class="px-ds-card"><div class="px-ds-kicker">NEXT</div><div class="px-ds-value">Un prossimo passo</div><div class="px-ds-copy">Automazione, misura e piano operativo.</div></div>';
    mount.insertAdjacentElement('afterend',strip);
  }

  function addLiveHomePreview(){
    if(document.getElementById('px-live-preview')) return;
    var input=document.getElementById('quickProblem');
    var quick=one('.quickbox');
    if(!input || !quick) return;
    var box=document.createElement('div');
    box.id='px-live-preview';box.className='px-live-preview';
    box.innerHTML='<div class="px-live-preview-label">IL TUO CASO · ANTEPRIMA</div><div id="px-live-preview-text" class="px-live-preview-text">Scrivi il problema qui sopra e questa frase diventerà il punto di partenza della tua analisi.</div>';
    var ref=one('.px-example-row',quick)||one('.quickactions',quick);if(ref)ref.insertAdjacentElement('beforebegin',box);else quick.appendChild(box);
    function sync(){var v=(input.value||'').trim();document.getElementById('px-live-preview-text').textContent=v?'“'+v+'”':'Scrivi il problema qui sopra e questa frase diventerà il punto di partenza della tua analisi.';}
    input.addEventListener('input',sync);
    $('.px-example',quick).forEach(function(btn){btn.addEventListener('click',function(){setTimeout(sync,0);});});
    sync();
  }

  function addHumanResult(){
    if(document.getElementById('px-human-result')) return;
    var r=result(),d=domResult(),p=primary(r);var results=one('#results');
    if(!results || getComputedStyle(results).display==='none' || (!r&&!d)) return;
    var a=answers();var name=p?(p.name||p.id):d&&d.primary?d.primary.name:'PROJECT-X';
    var labels=(window.ProjectXEngine&&window.ProjectXEngine.NEED_LABELS)||{};
    var profile=r&&r.profile?r.profile:{};var focus=Object.entries(profile).sort(function(x,y){return y[1]-x[1]}).slice(0,2).map(function(x){return labels[x[0]]||x[0]});
    var box=document.createElement('section');box.id='px-human-result';box.className='px-human-result';
    box.innerHTML='<div class="px-hr-kicker">IN PRATICA</div><div class="px-hr-title">Ecco cosa significa il risultato per te.</div><p class="px-hr-copy">'+(a.painPoint?'Hai descritto: <strong style="color:#fff">'+esc(a.painPoint)+'</strong>. ':'')+'Il motore ha quindi individuato <strong style="color:#fff">'+esc(name)+'</strong> come nucleo della configurazione. Prima di guardare tutti i numeri, concentrati su cosa cambia nel lavoro quotidiano.</p><div class="px-hr-tags">'+(focus.length?focus.map(function(x){return '<span class="px-hr-tag"><strong>Priorità:</strong> '+esc(x)+'</span>'}).join(''):'')+'<span class="px-hr-tag"><strong>Prossimo:</strong> segui un solo workflow</span></div>';
    var head=one('.resulthead',results);if(head)head.insertAdjacentElement('afterend',box);else results.insertBefore(box,results.firstChild);
  }

  function addSystemCompare(){
    if(document.getElementById('px-system-compare')) return;
    var r=result(),d=domResult(),p=primary(r),results=one('#results');
    if(!results || getComputedStyle(results).display==='none' || (!r&&!d)) return;
    var a=answers(),name=p?(p.name||p.id):(d&&d.primary?d.primary.name:'la scelta principale');
    var current=Array.isArray(a.existingTools)&&a.existingTools.length?a.existingTools.join(', '):'Gli strumenti che usi oggi';
    var problem=(a.painPoint||'Il processo che hai descritto').trim();
    var box=document.createElement('section');box.id='px-system-compare';box.className='px-system-compare';
    box.innerHTML='<div class="px-sc-head">PRIMA → DOPO</div><div class="px-sc-title">Cosa cambia concretamente?</div><p class="px-sc-copy">La scelta ha valore solo se rende più semplice il lavoro che hai descritto.</p><div class="px-sc-grid"><div class="px-sc-box"><b>OGGI</b><strong>'+esc(current)+'</strong><span>'+esc(problem.slice(0,160))+'</span></div><div class="px-sc-arrow">→</div><div class="px-sc-box"><b>CONFIGURAZIONE</b><strong>'+esc(name)+'</strong><span>Un nucleo principale + un primo workflow da misurare.</span></div></div><div class="px-sc-note"><strong>Domanda da portarti via:</strong> quale passaggio smetterai concretamente di fare a mano?</div>';
    var brief=document.getElementById('px-decision-brief'),human=document.getElementById('px-human-result');
    if(brief) brief.insertAdjacentElement('afterend',box); else if(human) human.insertAdjacentElement('afterend',box); else results.insertBefore(box,results.firstChild);
  }

  function addDecisionBrief(){
    if(document.getElementById('px-decision-brief')) return;
    var r=result(),d=domResult(),p=primary(r),results=one('#results');
    if(!results || getComputedStyle(results).display==='none' || (!r&&!d)) return;
    var a=answers(),name=p?(p.name||p.id):(d&&d.primary?d.primary.name:'la scelta principale');
    var labels=(window.ProjectXEngine&&window.ProjectXEngine.NEED_LABELS)||{};
    var profile=r&&r.profile?r.profile:{};
    var focus=Object.entries(profile).sort(function(x,y){return y[1]-x[1]}).slice(0,1).map(function(x){return labels[x[0]]||x[0]})[0]||'il bisogno prioritario';
    var autos=r&&(r.automationIdeas||r.automationSuggestions)||[];
    var auto=autos.length?(typeof autos[0]==='string'?autos[0]:(autos[0].title||autos[0].name||autos[0].description||'il primo workflow')):'il primo workflow';
    var gaps=r&&Array.isArray(r.missingNeeds)?r.missingNeeds.length:(d?d.gapCount:0);
    var box=document.createElement('section');box.id='px-decision-brief';box.className='px-decision-brief';
    box.innerHTML='<div class="px-db-kicker">LA TUA DECISIONE · 20 SECONDI</div><div class="px-db-title">Se dovessi ricordare solo 3 cose…</div><p class="px-db-copy">Non serve leggere tutto. Parti da questa sintesi e poi entra nei dettagli solo dove ti servono.</p><div class="px-db-grid"><div class="px-db-item"><b>PARTENZA</b><strong>'+esc(name)+'</strong><span>Il nucleo della soluzione generata.</span></div><div class="px-db-item"><b>PRIORITÀ</b><strong>'+esc(focus)+'</strong><span>Il bisogno che ha guidato la scelta.</span></div><div class="px-db-item"><b>PRIMA AZIONE</b><strong>Automatizza</strong><span>'+esc(auto)+'</span></div></div><div class="px-db-cta"><strong>Regola pratica:</strong> '+(gaps?'ci sono '+gaps+' gap da valutare. Non cercare altre app: chiudi prima il gap più importante e misura il risultato.':'non risultano gap critici. Non aggiungere complessità: misura comunque il primo workflow.')+'</div>';
    var head=one('.resulthead',results);var human=document.getElementById('px-human-result');if(human)human.insertAdjacentElement('afterend',box);else if(head)head.insertAdjacentElement('afterend',box);else results.insertBefore(box,results.firstChild);
  }

  function addSystemMap(){
    if(document.getElementById('px-system-map')) return;
    var r=result(),d=domResult(),p=primary(r),results=one('#results');
    if(!results || getComputedStyle(results).display==='none' || (!r&&!d)) return;
    var a=answers(),labels=(window.ProjectXEngine&&window.ProjectXEngine.NEED_LABELS)||{};
    var name=p?(p.name||p.id):(d&&d.primary?d.primary.name:'Sistema');
    var profile=r&&r.profile?r.profile:{};var focus=Object.entries(profile).sort(function(x,y){return y[1]-x[1]}).slice(0,1).map(function(x){return labels[x[0]]||x[0]})[0]||'bisogno prioritario';
    var autos=r&&(r.automationIdeas||r.automationSuggestions)||[];var auto=autos.length?(typeof autos[0]==='string'?autos[0]:(autos[0].title||autos[0].name||autos[0].description||'Primo workflow')):'primo workflow da definire';
    var box=document.createElement('section');box.id='px-system-map';box.className='px-system-map';
    box.innerHTML='<div class="px-sm-head"><div><div class="px-sm-kicker">PROJECT-X · SYSTEM MAP</div><div class="px-sm-title">Dal problema al sistema.</div><p class="px-sm-copy">Questa è la configurazione in una sola vista. Leggila da sinistra verso destra.</p></div><div class="px-sm-badge">CONFIGURAZIONE CREATA</div></div><div class="px-sm-flow"><div class="px-sm-node"><small>01 · PARTENZA</small><b>Problema</b><span>'+esc(a.painPoint||'Il problema che hai descritto')+'</span></div><div class="px-sm-arrow">→</div><div class="px-sm-node primary"><small>02 · NUCLEO</small><b>'+esc(name)+'</b><span>Lo strumento centrale della configurazione.</span></div><div class="px-sm-arrow">→</div><div class="px-sm-node"><small>03 · PRIORITÀ</small><b>'+esc(focus)+'</b><span>Il bisogno che guida la scelta.</span></div><div class="px-sm-arrow">→</div><div class="px-sm-node"><small>04 · PRIMA AZIONE</small><b>Automatizza</b><span>'+esc(auto)+'</span></div></div><div class="px-sm-foot"><strong>Come usarla:</strong> non devi implementare tutto oggi. Parti dal nucleo, chiudi il problema prioritario e misura il primo workflow.</div>';
    var human=document.getElementById('px-human-result');var hero=one('.resulthero',results);if(human)human.insertAdjacentElement('afterend',box);else if(hero)hero.insertAdjacentElement('beforebegin',box);else results.insertBefore(box,results.firstChild);
    track('system_map_view',{primary:name});
  }

  function addResultScorecard(){
    if(one('#px-result-scorecard')) return;
    var r=result();
    var d=domResult();
    var p=primary(r);
    var results=one('#results');
    if(!r && !d) return;
    if(!results || getComputedStyle(results).display==='none') return;

    var a=answers();
    var v=r?(r.valueEstimate||r.value||{}):{};
    var hours=num(v.hoursPerWeek||a.hours);
    var monthly=num(v.monthlyValue||hours*num(v.hourlyValue)*4.33);
    if(!monthly && d && d.monthlyText){ monthly=num(String(d.monthlyText).replace(/[^0-9]/g,'')); }
    var coverage=pct(r?r.stackCoverage:(d&&d.coverage));
    var stackCount=r&&Array.isArray(r.stack)?r.stack.length:(d?d.stackCount:0);
    var gaps=r&&Array.isArray(r.missingNeeds)?r.missingNeeds.length:(d?d.gapCount:0);
    var score=pct(r?(p.compatibility!=null?p.compatibility:p.score):(d?d.fit:0));
    var primaryName=p?(p.name||p.id||'PROJECT-X'):(d&&d.primary?d.primary.name:'PROJECT-X');

    var box=document.createElement('section');
    box.id='px-result-scorecard';
    box.className='px-result-scorecard';

    var nextHref=one('#refineBtn')?'#planMount':'#planMount';
    box.innerHTML=
      '<div class="px-score-head">'+
        '<div><div class="px-score-kicker">PROJECT-X · DECISION CARD</div>'+
        '<div class="px-score-title">Ecco cosa hai davvero ottenuto.</div>'+
        '<p class="px-score-copy">Non è solo un nome di software: è una configurazione costruita attorno al problema che hai descritto.</p></div>'+
        '<div class="px-score-badge">'+score+'% fit</div>'+
      '</div>'+
      '<div class="px-score-grid">'+
        '<div class="px-score-item"><b>'+score+'%</b><span>aderenza dello strumento principale</span></div>'+
        '<div class="px-score-item"><b>'+coverage+'%</b><span>copertura stimata dei bisogni</span></div>'+
        '<div class="px-score-item"><b>'+stackCount+'</b><span>componenti nello stack</span></div>'+
        '<div class="px-score-item"><b>'+gaps+'</b><span>gap da valutare</span></div>'+
      '</div>'+
      '<div class="px-before-after">'+
        '<div class="px-ba-box"><b>PRIMA</b><span>Problema aperto, strumenti da scegliere e tempo da distribuire.</span></div>'+
        '<div class="px-ba-arrow">→</div>'+
        '<div class="px-ba-box"><b>DOPO</b><span><strong>'+esc(primaryName)+'</strong> come nucleo + un primo workflow da misurare.</span></div>'+
      '</div>'+
      '<div class="px-value-band"><div><strong>Il numero che conta</strong><span>Valore teorico mensile del tempo indicato. Non è una promessa di risparmio.</span></div><strong class="px-value-amount">'+money(monthly)+'/mese</strong></div>'+
      '<div class="px-next-action"><div><strong>Adesso non aggiungere altre app.</strong><span>Apri il piano e completa prima il workflow prioritario.</span></div><a href="'+nextHref+'">Vedi il piano →</a></div>';

    var hero=one('.resulthero',results);
    if(hero && hero.parentNode) hero.insertAdjacentElement('afterend',box);
    else results.insertBefore(box,results.firstChild);

    var link=one('.px-next-action a',box);
    if(link) link.addEventListener('click',function(){var plan=one('#planMount');if(plan)plan.scrollIntoView({behavior:'smooth',block:'start'});});

    track('decision_card_view',{primary:primaryName,fit:score});
  }

  function addHomeTools(){
    if(one('#px-home-tools')) return;
    var hero=one('.hero');
    var results=one('#results');
    if(!hero || (results && getComputedStyle(results).display!=='none')) return;
    var target=one('#px-home-trust')||one('.px-wow-proof')||one('.quickbox');
    if(!target) return;
    var box=document.createElement('div');
    box.id='px-home-tools';
    box.style.cssText='width:min(900px,calc(100% - 30px));margin:16px auto 0;display:grid;grid-template-columns:1fr 1fr;gap:9px;';
    box.innerHTML='<a href="/audit.html" style="display:block;padding:14px;text-decoration:none;border:1px solid rgba(255,255,255,.07);border-radius:14px;background:rgba(255,255,255,.02);color:#fff;"><strong style="font-size:10px">🔍 Business Audit</strong><span style="display:block;margin-top:4px;color:#78869d;font-size:9px;line-height:1.4">Controlla gli strumenti che usi già e trova attriti prima di aggiungere software.</span></a><a href="/simulator.html" style="display:block;padding:14px;text-decoration:none;border:1px solid rgba(255,255,255,.07);border-radius:14px;background:rgba(255,255,255,.02);color:#fff;"><strong style="font-size:10px">💰 Value Simulator</strong><span style="display:block;margin-top:4px;color:#78869d;font-size:9px;line-height:1.4">Metti ore, persone e costi sul tavolo e costruisci un primo business case.</span></a><a href="/workspace.html" style="display:block;padding:14px;text-decoration:none;border:1px solid rgba(124,92,255,.18);border-radius:14px;background:rgba(124,92,255,.045);color:#fff;grid-column:1/-1"><strong style="font-size:10px">🧭 My Workspace</strong><span style="display:block;margin-top:4px;color:#8996ab;font-size:9px;line-height:1.4">Ritrova il tuo profilo, audit, simulazione e prossimo passo nello stesso posto.</span></a>';
    target.insertAdjacentElement('afterend',box);
    var style=document.createElement('style');style.textContent='@media(max-width:600px){#px-home-tools{grid-template-columns:1fr!important;width:calc(100% - 22px)!important}}';document.head.appendChild(style);
  }

  function addHomeMicroTrust(){
    if(one('#px-home-trust')) return;
    var hero=one('.hero');
    if(!hero) return;
    var trust=document.createElement('div');
    trust.id='px-home-trust';
    trust.style.cssText='width:min(880px,calc(100% - 30px));margin:12px auto 0;text-align:center;color:#69768d;font-size:9px;line-height:1.5;';
    trust.innerHTML='<span style="color:#a9b4c6;font-weight:800;">Nessun catalogo infinito da studiare.</span> PROJECT-X restringe il problema → costruisce una direzione → ti mostra il prossimo passo.';
    var target=one('.px-wow-proof')||one('.quickbox');
    if(target) target.insertAdjacentElement('afterend',trust);
  }

  function addResultsBottomCTA(){
    if(one('#px-results-bottom-cta')) return;
    var results=one('#results');
    if(!results || getComputedStyle(results).display==='none') return;
    var r=result(),d=domResult(),p=primary(r);
    if(!r && !d) return;

    var box=document.createElement('div');
    box.id='px-results-bottom-cta';
    box.style.cssText='margin-top:18px;padding:18px;border-radius:18px;border:1px solid rgba(124,92,255,.18);background:linear-gradient(135deg,rgba(124,92,255,.07),rgba(91,140,255,.04));text-align:center;';
    var primaryName=p?(p.name||p.id||'PROJECT-X'):(d&&d.primary?d.primary.name:'PROJECT-X');
    box.innerHTML='<div style="font-size:9px;letter-spacing:.14em;color:#9f94ff;font-weight:950;">NEXT STAGE</div>'+
      '<div style="margin-top:6px;font-size:18px;font-weight:950;letter-spacing:-.03em;">Da decisione a sistema.</div>'+
      '<div style="margin:5px auto 0;max-width:620px;color:#8996ab;font-size:10px;line-height:1.5;">Hai già la scelta principale. Ora puoi trasformarla in blueprint, workflow e implementazione invece di continuare a cercare strumenti.</div>'+
      '<div style="display:flex;justify-content:center;gap:8px;flex-wrap:wrap;margin-top:12px;">'+
      '<a href="/audit.html" style="display:inline-flex;align-items:center;justify-content:center;padding:10px 13px;border-radius:10px;text-decoration:none;color:#dfe5f1;font-size:9px;font-weight:900;border:1px solid rgba(255,255,255,.10);background:rgba(255,255,255,.035);">Business Audit →</a>'+
      '<a href="/simulator.html" style="display:inline-flex;align-items:center;justify-content:center;padding:10px 13px;border-radius:10px;text-decoration:none;color:#dfe5f1;font-size:9px;font-weight:900;border:1px solid rgba(255,255,255,.10);background:rgba(255,255,255,.035);">Value Simulator →</a>'+
      '<a href="/report-pro.html" style="display:inline-flex;align-items:center;justify-content:center;padding:10px 13px;border-radius:10px;text-decoration:none;color:#fff;font-size:9px;font-weight:900;background:linear-gradient(135deg,#7c5cff,#5b8cff);">Apri Report PRO →</a>'+
      '<a href="/implementation.html" style="display:inline-flex;align-items:center;justify-content:center;padding:10px 13px;border-radius:10px;text-decoration:none;color:#dfe5f1;font-size:9px;font-weight:900;border:1px solid rgba(255,255,255,.10);background:rgba(255,255,255,.035);">Parla di implementazione →</a>'+
      '</div>';
    results.appendChild(box);
    $$('.px-results-bottom-cta a',box).forEach(function(a){a.addEventListener('click',function(){track('next_stage_click',{href:a.getAttribute('href')||''});});});
  }

  function run(){
    styles();
    addHomeDecisionStrip();
    addHomeMicroTrust();
    addHomeTools();
    addLiveHomePreview();
    addHumanResult();
    addDecisionBrief();
    addSystemCompare();
    addSystemMap();
    addResultScorecard();
    addResultsBottomCTA();
  }

  var observer=new MutationObserver(function(){run();});
  function start(){
    run();
    observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['style','class']});
    window.addEventListener('load',run);
    setTimeout(run,700);
    setTimeout(run,1800);
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start);
  else start();

})();
