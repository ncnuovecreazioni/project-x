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
    s.textContent='      .px-decision-strip{width:min(1040px,calc(100% - 30px));margin:18px auto 0;display:grid;grid-template-columns:repeat(4,1fr);gap:8px}      .px-ds-card{position:relative;padding:14px 13px;border:1px solid rgba(255,255,255,.07);border-radius:15px;background:linear-gradient(145deg,rgba(17,24,42,.75),rgba(8,12,22,.75));overflow:hidden;transition:.18s}      .px-ds-card:hover{transform:translateY(-2px);border-color:rgba(124,92,255,.28)}      .px-ds-card:after{content:"";position:absolute;width:110px;height:110px;right:-45px;bottom:-62px;border-radius:50%;background:rgba(124,92,255,.10);filter:blur(18px)}      .px-ds-kicker{font-size:8px;letter-spacing:.13em;color:#7f8ba0;font-weight:900;text-transform:uppercase}      .px-ds-value{margin-top:6px;font-size:17px;font-weight:950;letter-spacing:-.03em}      .px-ds-copy{margin-top:3px;font-size:9px;line-height:1.35;color:#7d8ba2}      .px-decision-strip.is-results{margin-top:0;margin-bottom:15px}      .px-result-scorecard{margin-top:15px;padding:22px;border-radius:24px;border:1px solid rgba(255,255,255,.08);background:radial-gradient(circle at 88% 8%,rgba(124,92,255,.10),transparent 30%),linear-gradient(145deg,rgba(15,22,38,.92),rgba(8,12,22,.96));box-shadow:0 20px 70px rgba(0,0,0,.16)}      .px-score-head{display:flex;align-items:flex-start;justify-content:space-between;gap:16px}      .px-score-kicker{font-size:9px;letter-spacing:.15em;color:#a99dff;font-weight:950;text-transform:uppercase}      .px-score-title{margin:7px 0 0;font-size:22px;letter-spacing:-.035em}      .px-score-copy{margin:5px 0 0;color:#8794aa;font-size:10px;line-height:1.5;max-width:720px}      .px-score-badge{padding:9px 12px;border-radius:12px;border:1px solid rgba(54,217,157,.18);background:rgba(54,217,157,.05);color:#7ce8bd;font-size:10px;font-weight:950;white-space:nowrap}      .px-score-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:15px}      .px-score-item{padding:12px;border:1px solid rgba(255,255,255,.065);border-radius:12px;background:rgba(255,255,255,.02)}      .px-score-item b{display:block;font-size:18px;letter-spacing:-.03em}      .px-score-item span{display:block;margin-top:4px;color:#7d8ba1;font-size:8px;line-height:1.35}      .px-value-band{margin-top:10px;padding:16px;border-radius:17px;border:1px solid rgba(255,209,102,.14);background:linear-gradient(90deg,rgba(255,209,102,.045),rgba(124,92,255,.035));display:grid;grid-template-columns:1fr auto;gap:14px;align-items:center}      .px-value-band strong{display:block;font-size:15px}      .px-value-band span{display:block;margin-top:3px;color:#7f8ca2;font-size:9px;line-height:1.4}      .px-value-amount{font-size:24px!important;color:#ffe08d;letter-spacing:-.04em;white-space:nowrap}      .px-next-action{margin-top:10px;display:flex;justify-content:space-between;gap:12px;align-items:center;padding:14px;border:1px solid rgba(124,92,255,.16);border-radius:15px;background:rgba(124,92,255,.045)}      .px-next-action strong{display:block;font-size:10px}      .px-next-action span{display:block;margin-top:3px;color:#818ea4;font-size:9px;line-height:1.4}      .px-next-action a{display:inline-flex;align-items:center;justify-content:center;padding:10px 13px;border-radius:10px;text-decoration:none;color:#fff;background:linear-gradient(135deg,#7c5cff,#5b8cff);font-size:9px;font-weight:900;white-space:nowrap}      .px-before-after{margin-top:10px;display:grid;grid-template-columns:1fr 36px 1fr;align-items:stretch;gap:7px}      .px-ba-box{padding:13px;border-radius:13px;border:1px solid rgba(255,255,255,.07);background:rgba(255,255,255,.02)}      .px-ba-box b{display:block;font-size:10px}      .px-ba-box span{display:block;margin-top:5px;color:#9ba7bb;font-size:9px;line-height:1.45}      .px-ba-arrow{display:grid;place-items:center;border-radius:10px;background:rgba(124,92,255,.08);color:#bcb1ff;font-weight:950}      @media(max-width:760px){        .px-decision-strip{grid-template-columns:1fr 1fr}        .px-score-grid{grid-template-columns:1fr 1fr}        .px-score-head{display:block}        .px-score-badge{display:inline-flex;margin-top:10px}        .px-value-band{grid-template-columns:1fr}        .px-next-action{display:block}        .px-next-action a{margin-top:10px;width:100%}      }      @media(max-width:520px){        .px-decision-strip{width:calc(100% - 22px);grid-template-columns:1fr 1fr}        .px-before-after{grid-template-columns:1fr}        .px-ba-arrow{min-height:28px}      }    ';
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
