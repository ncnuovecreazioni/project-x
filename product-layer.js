/* =========================================================
   PROJECT-X — PRODUCT / CONVERSION LAYER
   Zero API cost. Does not alter Decision Engine ranking.
   ========================================================= */
(function(){
  'use strict';

  var MEMORY_KEY='projectx_product_v1';

  function esc(s){
    return String(s==null?'':s).replace(/[&<>"']/g,function(c){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
    });
  }

  function readAnswers(){
    try{
      var raw=localStorage.getItem('projectx_answers_v2');
      var data=raw?JSON.parse(raw):{};
      return data&&typeof data==='object'?data:{};
    }catch(e){return {};}
  }

  function num(v){
    var n=Number(v);
    if(Number.isFinite(n)) return n;
    var m=String(v==null?'':v).replace(',','.').match(/-?\\d+(?:\\.\\d+)?/);
    return m?Number(m[0]):0;
  }

  function hoursPerWeek(a){
    var v=num(a.hours);
    if(v>0) return v;
    var s=String(a.hours||'').toLowerCase();
    if(/10|oltre/.test(s)) return 10;
    if(/6|8/.test(s)) return 7;
    if(/3|4|5/.test(s)) return 4;
    if(/1|2/.test(s)) return 2;
    return 0;
  }

  function resultVisible(){
    var r=document.getElementById('results');
    return !!(r&&r.style.display!=='none');
  }

  function getSignals(){
    var a=readAnswers();
    var fitEl=document.querySelector('.resulthero .fit');
    var fit=fitEl?num(fitEl.textContent):0;
    var scores=document.querySelectorAll('#architectureMount .score b');
    var coverage=scores.length?num(scores[0].textContent):0;
    var gaps=scores.length>2?num(scores[2].textContent):0;
    return {
      fit:Math.max(0,Math.min(100,fit)),
      coverage:Math.max(0,Math.min(100,coverage)),
      gaps:Math.max(0,gaps),
      hours:hoursPerWeek(a)
    };
  }

  function systemScore(){
    var s=getSignals();
    var gapPenalty=Math.min(24,s.gaps*8);
    var score=Math.round(s.fit*.55+s.coverage*.30+(100-gapPenalty)*.15);
    return Math.max(0,Math.min(100,score));
  }

  function injectStyles(){
    if(document.getElementById('px-product-styles')) return;
    var style=document.createElement('style');
    style.id='px-product-styles';
    style.textContent=`
      .px-product-wrap{margin-top:15px;padding:24px;border-radius:24px;border:1px solid rgba(124,92,255,.2);background:radial-gradient(circle at 88% 0%,rgba(124,92,255,.08),transparent 35%),linear-gradient(145deg,rgba(17,23,40,.94),rgba(8,12,21,.96));box-shadow:0 24px 75px rgba(0,0,0,.16)}
      .px-product-kicker{font-size:9px;letter-spacing:.15em;font-weight:950;color:#b8adff}
      .px-product-title{margin:8px 0 6px;font-size:23px;line-height:1.05;letter-spacing:-.04em}
      .px-product-copy{margin:0;color:#8e9bb0;font-size:11px;line-height:1.55}
      .px-product-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:15px}
      .px-product-stat{min-height:76px;padding:12px;border:1px solid rgba(255,255,255,.07);border-radius:13px;background:rgba(255,255,255,.025)}
      .px-product-stat b{display:block;font-size:20px;letter-spacing:-.04em}
      .px-product-stat span{display:block;margin-top:4px;color:#748198;font-size:9px;line-height:1.35}
      .px-product-meter{margin-top:15px;padding:12px;border:1px solid rgba(255,255,255,.07);border-radius:13px;background:rgba(255,255,255,.02)}
      .px-product-meter-top{display:flex;justify-content:space-between;gap:10px;font-size:9px;color:#8491a7}
      .px-product-track{height:7px;margin-top:8px;border-radius:99px;background:rgba(255,255,255,.06);overflow:hidden}
      .px-product-track i{display:block;height:100%;border-radius:99px;background:linear-gradient(90deg,#7c5cff,#5b8cff,#36d99d)}
      .px-product-steps{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:14px}
      .px-product-step{padding:11px;border:1px solid rgba(255,255,255,.07);border-radius:12px;background:rgba(255,255,255,.02)}
      .px-product-step b{display:block;font-size:9px;letter-spacing:.1em;color:#9faac0}
      .px-product-step span{display:block;margin-top:5px;color:#d8deea;font-size:10px;line-height:1.4}
      .px-product-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:15px}
      .px-product-actions a{display:inline-flex;align-items:center;justify-content:center;padding:11px 13px;border-radius:11px;text-decoration:none;font-size:10px;font-weight:900}
      .px-product-primary{color:#fff;background:linear-gradient(135deg,#7c5cff,#5b8cff);box-shadow:0 13px 38px rgba(124,92,255,.2)}
      .px-product-secondary{color:#dce2ef;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.04)}
      .px-product-trust{display:flex;flex-wrap:wrap;gap:7px;margin-top:12px}
      .px-product-trust span{padding:7px 9px;border-radius:999px;border:1px solid rgba(255,255,255,.07);background:rgba(255,255,255,.02);font-size:8px;color:#75839a}
      .px-product-homebar{width:min(1080px,calc(100% - 30px));margin:18px auto 0;display:flex;align-items:center;justify-content:center;gap:7px;flex-wrap:wrap}
      .px-product-homebar a{padding:7px 9px;border-radius:999px;border:1px solid rgba(255,255,255,.07);background:rgba(255,255,255,.02);color:#7f8ca3;text-decoration:none;font-size:8px;font-weight:800}
      .px-product-homebar a:hover{color:#d7deeb;border-color:rgba(124,92,255,.25)}
      @media(max-width:760px){.px-product-grid{grid-template-columns:1fr 1fr}.px-product-steps{grid-template-columns:1fr}.px-product-wrap{padding:19px}}
    `;
    document.head.appendChild(style);
  }

  function addHomeBar(){
    if(location.pathname!=='/'&&!/index\\.html$/i.test(location.pathname)) return;
    if(document.getElementById('px-product-homebar')) return;
    var hero=document.querySelector('.hero');
    if(!hero) return;
    var bar=document.createElement('div');
    bar.id='px-product-homebar';
    bar.className='px-product-homebar';
    bar.innerHTML='<a href="/soluzioni.html">Soluzioni</a><a href="/faq.html">FAQ</a><a href="/report-pro.html">Report PRO</a><a href="/coach.html">AI Coach</a><a href="/affiliate.html">Partner</a><a href="/affiliate-disclosure.html">Trasparenza</a>';
    hero.appendChild(bar);
  }

  function addSchema(){
    if(location.pathname!=='/'&&!/index\\.html$/i.test(location.pathname)) return;
    if(document.getElementById('px-product-schema')) return;
    var script=document.createElement('script');
    script.id='px-product-schema';
    script.type='application/ld+json';
    script.text=JSON.stringify({
      '@context':'https://schema.org',
      '@type':'WebApplication',
      name:'PROJECT-X',
      applicationCategory:'BusinessApplication',
      operatingSystem:'Web',
      description:'Motore decisionale per costruire uno stack software e un percorso di automazione coerente con il modo di lavorare.',
      url:location.origin+'/',
      offers:{'@type':'Offer',price:'0',priceCurrency:'EUR'}
    });
    document.head.appendChild(script);
  }

  function addResultCard(){
    if(!resultVisible()) return;
    if(document.getElementById('px-system-score')) return;
    var results=document.getElementById('results');
    if(!results) return;
    var s=getSignals();
    var score=systemScore();
    var hours=s.hours?s.hours+' h':'—';

    injectStyles();

    var box=document.createElement('section');
    box.id='px-system-score';
    box.className='px-product-wrap';
    box.innerHTML=
      '<div class="px-product-kicker">PROJECT-X · SYSTEM SCORE</div>'+
      '<div class="px-product-title">Il sistema, visto dall’alto.</div>'+
      '<p class="px-product-copy">Questo indice sintetizza la coerenza della configurazione emersa dall’analisi. Non sostituisce il punteggio di compatibilità del singolo software.</p>'+
      '<div class="px-product-grid">'+
        '<div class="px-product-stat"><b>'+score+'/100</b><span>System Score</span></div>'+
        '<div class="px-product-stat"><b>'+s.fit+'%</b><span>compatibilità del nucleo</span></div>'+
        '<div class="px-product-stat"><b>'+s.coverage+'%</b><span>copertura bisogni</span></div>'+
        '<div class="px-product-stat"><b>'+hours+'</b><span>tempo ripetitivo dichiarato</span></div>'+
      '</div>'+
      '<div class="px-product-meter"><div class="px-product-meter-top"><span>Coerenza della configurazione</span><strong>'+score+'/100</strong></div><div class="px-product-track"><i style="width:'+score+'%"></i></div></div>'+
      '<div class="px-product-steps">'+
        '<div class="px-product-step"><b>01 · DECISIONE</b><span>Parti dal software centrale già individuato.</span></div>'+
        '<div class="px-product-step"><b>02 · COLLO DI BOTTIGLIA</b><span>Automatizza per primo il passaggio che assorbe più tempo.</span></div>'+
        '<div class="px-product-step"><b>03 · CONTROLLO</b><span>Misura ore, passaggi e risultato dopo 7 giorni.</span></div>'+
      '</div>'+
      '<div class="px-product-actions">'+
        '<a class="px-product-primary" href="/report-pro.html?source=system-score">Trasforma il risultato in un blueprint →</a>'+
        '<a class="px-product-secondary" href="/coach.html?source=system-score">Continua con AI Coach →</a>'+
      '</div>'+
      '<div class="px-product-trust"><span>✓ Ranking separato dalla monetizzazione</span><span>✓ Stime dichiarate, non promesse</span><span>✓ Nessun cambio al motore decisionale</span></div>';

    var anchor=document.getElementById('px-next-best-action')||document.querySelector('.resulthero');
    if(anchor&&anchor.parentNode) anchor.parentNode.insertBefore(box,anchor.nextSibling);
    else results.prepend(box);

    try{
      var state=JSON.parse(localStorage.getItem(MEMORY_KEY)||'{}');
      state.lastSystemScore=score;
      state.lastSeen=Date.now();
      localStorage.setItem(MEMORY_KEY,JSON.stringify(state));
    }catch(e){}

    if(window.ProjectXAutopilot&&typeof window.ProjectXAutopilot.track==='function'){
      window.ProjectXAutopilot.track('system_score_view',{score:score,fit:s.fit,coverage:s.coverage,gaps:s.gaps});
    }
  }

  function start(){
    if(!document.body) return;
    injectStyles();
    addHomeBar();
    addSchema();
    addResultCard();
    var observer=new MutationObserver(function(){
      addHomeBar();
      addResultCard();
    });
    observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['style']});
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start);
  else start();

  window.ProjectXProductLayer={systemScore:systemScore,getSignals:getSignals};
})();