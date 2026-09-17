/* =========================================================
   PROJECT-X — ADAPTIVE EXPERIENCE LAYER
   ---------------------------------------------------------
   Personalizza la UX senza toccare il decision engine.
   Memoria locale anonima + live demo + next-best-action.
   Nessuna email, nome o dato personale viene salvato qui.
   ========================================================= */
(function(){
  'use strict';

  var MEMORY_KEY = 'projectx_memory_v1';
  var memory = readMemory();

  function readMemory(){
    try{
      var raw = localStorage.getItem(MEMORY_KEY);
      var parsed = raw ? JSON.parse(raw) : null;
      return parsed && typeof parsed === 'object' ? parsed : {
        visits:0, analysesStarted:0, analysesCompleted:0,
        lastPath:'', lastSource:'', segment:'', lastSeen:0
      };
    }catch(e){
      return {visits:0,analysesStarted:0,analysesCompleted:0,lastPath:'',lastSource:'',segment:'',lastSeen:0};
    }
  }

  function saveMemory(){
    try{ localStorage.setItem(MEMORY_KEY, JSON.stringify(memory)); }catch(e){}
  }

  function send(event,meta){
    if(window.ProjectXAutopilot && typeof window.ProjectXAutopilot.track === 'function'){
      window.ProjectXAutopilot.track(event,meta||{});
      return;
    }
    try{
      fetch('/api/event',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({event:event,sessionId:'px-adaptive',meta:meta||{}}),
        keepalive:true
      }).catch(function(){});
    }catch(e){}
  }

  function answers(){
    try{
      var raw=localStorage.getItem('projectx_answers_v2');
      return raw?JSON.parse(raw):{};
    }catch(e){return {};}
  }

  function inferSegment(a){
    var text=(String(a.businessType||'')+' '+String(a.painPoint||'')+' '+String(a.goals||'')).toLowerCase();
    if(/ecommerce|e-commerce|carrello|shopify/.test(text)) return 'E-commerce';
    if(/agenzia|agency|progetti|clienti/.test(text) && /6|21|51/.test(String(a.teamSize||''))) return 'Agenzia';
    if(/idraul|elettric|artigian|installator|professionista/.test(text)) return 'Professionista';
    if(/microsoft|excel|outlook|office 365/.test(text)) return 'Microsoft 365';
    if(/azienda|impresa|team/.test(text)) return 'Azienda';
    return 'Attività';
  }

  function source(){
    try{return new URLSearchParams(location.search).get('source')||'direct';}catch(e){return 'direct';}
  }

  function addAdaptiveBadge(){
    var hero=document.querySelector('.hero');
    if(!hero || document.getElementById('px-adaptive-badge')) return;
    var a=answers();
    var segment=inferSegment(a);
    var badge=document.createElement('div');
    badge.id='px-adaptive-badge';
    badge.style.cssText='display:flex;align-items:center;justify-content:center;gap:8px;margin:12px auto 0;padding:8px 12px;border:1px solid rgba(124,92,255,.18);border-radius:999px;background:rgba(9,13,24,.72);color:#91a0b8;font-size:10px;font-weight:800;width:max-content;max-width:100%;backdrop-filter:blur(14px);';
    if(memory.visits>1 && memory.segment){
      badge.innerHTML='<span style="color:#c9bfff">↻</span> Bentornato · riparto dal tuo percorso <strong style="color:#fff">'+escapeHtml(memory.segment)+'</strong>';
    }else{
      badge.innerHTML='<span style="color:#36d99d">●</span> Il motore si adatta al tuo problema in tempo reale';
    }
    var quick=hero.querySelector('.quickbox');
    hero.insertBefore(badge,quick||null);
    if(segment && memory.segment!==segment){
      memory.segment=segment;
      saveMemory();
    }
  }

  function escapeHtml(s){
    return String(s||'').replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});
  }

  function addLiveEngine(){
    var box=document.querySelector('.quickbox');
    var input=document.getElementById('quickProblem');
    if(!box || !input || document.getElementById('px-live-engine')) return;

    var panel=document.createElement('div');
    panel.id='px-live-engine';
    panel.style.cssText='margin-top:11px;padding:13px 14px;border:1px solid rgba(54,217,157,.13);border-radius:16px;background:linear-gradient(120deg,rgba(54,217,157,.045),rgba(124,92,255,.055));position:relative;overflow:hidden;';
    panel.innerHTML='<div style="display:flex;justify-content:space-between;gap:10px;align-items:center"><strong style="font-size:10px;letter-spacing:.12em;color:#9ee9c8">LIVE SYSTEM SCAN</strong><span id="px-live-score" style="font-size:9px;color:#77869d">In attesa del problema</span></div><div id="px-live-lines" style="display:grid;gap:5px;margin-top:9px"><span style="font-size:10px;color:#65738b">Scrivi cosa ti fa perdere tempo. Il sistema rileverà i moduli necessari.</span></div><div style="height:5px;margin-top:10px;background:rgba(255,255,255,.06);border-radius:99px;overflow:hidden"><i id="px-live-bar" style="display:block;height:100%;width:4%;border-radius:99px;background:linear-gradient(90deg,#7c5cff,#5b8cff,#36d99d);transition:width .35s ease"></i></div>';
    input.insertAdjacentElement('afterend',panel);

    function scan(){
      var t=String(input.value||'').toLowerCase();
      var modules=[];
      var rules=[
        ['CRM','cliente|clienti|contatti|lead'],
        ['Automazione','manuale|ripetitivo|automat|workflow'],
        ['Vendite','vendit|commercial|richiam|preventiv|offert'],
        ['Email','email|posta|outlook|gmail'],
        ['Dati','excel|foglio|report|dati'],
        ['E-commerce','ecommerce|carrello|shopify|ordine'],
        ['Progetti','progetto|scaden|attività|team'],
        ['AI','ai |intelligen|chat|copilot']
      ];
      rules.forEach(function(r){if(new RegExp(r[1],'i').test(t)) modules.push(r[0]);});
      if(!t) modules=['In attesa'];
      if(t && !modules.length) modules=['Analisi processo','Automazione','Follow-up'];
      var score=Math.min(96,Math.max(8,Math.round((t.length/2.5)+modules.length*8)));
      document.getElementById('px-live-score').textContent=t ? 'Segnali rilevati · '+score+'%' : 'In attesa del problema';
      document.getElementById('px-live-lines').innerHTML=modules.slice(0,5).map(function(m,i){return '<span style="font-size:10px;color:'+(i<3?'#b6c1d2':'#78869c')+'"><b style="color:#7c5cff">'+(i+1).toString().padStart(2,'0')+'</b> '+escapeHtml(m)+' <span style="float:right;color:#36d99d">'+(i<2?'rilevato':'in valutazione')+'</span></span>';}).join('');
      document.getElementById('px-live-bar').style.width=score+'%';
      if(t.length>4) memory.liveIntent=(memory.liveIntent||0)+1;
      saveMemory();
    }
    input.addEventListener('input',scan,{passive:true});
    scan();
  }

  function trackAnalysisStart(){
    document.addEventListener('click',function(e){
      var target=e.target && e.target.closest ? e.target.closest('button,a') : null;
      if(!target) return;
      var text=(target.textContent||'').toLowerCase();
      var id=target.id||'';
      if(id==='quickAnalyzeBtn' || /analizza ora|analizza/i.test(text)){
        memory.analysesStarted=(memory.analysesStarted||0)+1;
        memory.segment=inferSegment(answers());
        saveMemory();
        send('analysis_started_adaptive',{segment:memory.segment,source:source()});
      }
    },{passive:true});
  }

  function addNextBestAction(){
    var results=document.getElementById('results');
    if(!results || results.style.display==='none' || document.getElementById('px-next-best-action')) return;
    var a=answers();
    var budget=String(a.budget||'').toLowerCase();
    var team=String(a.teamSize||'').toLowerCase();
    var high=/251|101|51|31/.test(budget)||/6|21|51/.test(team);
    var title=high?'Hai già abbastanza complessità per passare all’operatività.':'Hai già una direzione. Ora puoi renderla concreta.';
    var copy=high?'Il prossimo passo più utile è trasformare il risultato in un blueprint implementabile, mantenendo solo gli strumenti che servono.':'Approfondisci il sistema con il Report PRO oppure continua la conversazione con AI Coach.';
    var section=document.createElement('section');
    section.id='px-next-best-action';
    section.style.cssText='margin-top:15px;padding:25px;border-radius:24px;border:1px solid rgba(54,217,157,.18);background:radial-gradient(circle at 90% 0%,rgba(54,217,157,.08),transparent 34%),linear-gradient(145deg,rgba(16,28,35,.9),rgba(9,14,24,.95));box-shadow:0 22px 70px rgba(0,0,0,.18);';
    section.innerHTML='<div style="font-size:9px;letter-spacing:.15em;font-weight:950;color:#7ce8bd">NEXT BEST ACTION · AUTOPILOT</div><h3 style="margin:9px 0 7px;font-size:23px;letter-spacing:-.04em">'+escapeHtml(title)+'</h3><p style="margin:0;color:#98a5bc;font-size:12px;line-height:1.55">'+escapeHtml(copy)+'</p><div style="display:flex;gap:9px;flex-wrap:wrap;margin-top:15px"><a href="/report-pro.html?source=next-best" data-px-nba="pro" style="display:inline-flex;padding:12px 15px;border-radius:12px;text-decoration:none;color:#fff;font-weight:900;font-size:11px;background:linear-gradient(135deg,#7c5cff,#5b8cff)">Apri Report PRO →</a><a href="/coach.html?source=next-best" data-px-nba="coach" style="display:inline-flex;padding:12px 15px;border-radius:12px;text-decoration:none;color:#dce2ef;font-weight:900;font-size:11px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.04)">Continua con AI Coach →</a></div>';
    var hero=results.querySelector('.resulthero');
    if(hero && hero.parentNode) hero.parentNode.insertBefore(section,hero.nextSibling); else results.prepend(section);
    send('next_best_action_view',{highIntent:high});
  }

  function observeResults(){
    var observer=new MutationObserver(function(){
      addNextBestAction();
      var results=document.getElementById('results');
      if(results && results.style.display!=='none' && !memory.lastResultTracked){
        memory.analysesCompleted=(memory.analysesCompleted||0)+1;
        memory.lastResultTracked=Date.now();
        saveMemory();
        send('analysis_completed_adaptive',{segment:memory.segment||inferSegment(answers()),completed:memory.analysesCompleted});
      }
    });
    observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['style']});
    addNextBestAction();
  }

  function wire(){
    if(location.pathname!=='/' && !/index\.html$/i.test(location.pathname)) return;
    memory.visits=(memory.visits||0)+1;
    memory.lastPath=location.pathname;
    memory.lastSource=source();
    memory.lastSeen=Date.now();
    saveMemory();
    addAdaptiveBadge();
    addLiveEngine();
    trackAnalysisStart();
    observeResults();
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',wire);
  else wire();

  window.ProjectXAdaptive={
    memory:function(){return JSON.parse(JSON.stringify(memory));},
    segment:function(){return inferSegment(answers());}
  };
})();
