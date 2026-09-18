/* =========================================================
   PROJECT-X — ADAPTIVE EXPERIENCE LAYER
   ---------------------------------------------------------
   Personalizza la UX senza toccare il decision engine.
   Memoria locale anonima + live demo + next-best-action.
   Commercial layer separata: catalogo, affiliate intelligence e disclosure.
   Nessuna email, nome o dato personale viene salvato qui.
   ========================================================= */
(function(){
  'use strict';

  var MEMORY_KEY = 'projectx_memory_v1';
  var COMMERCIAL_MEMORY_KEY = 'projectx_commercial_v1';
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

  function escapeHtml(s){
    return String(s||'').replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});
  }

  /* =========================================================
     COMMERCIAL LAYER
     ========================================================= */

  function loadAffiliateRegistry(done){
    if(window.ProjectXAffiliateRegistry){
      if(typeof done==='function') done(true);
      return;
    }

    var existing=document.querySelector('script[data-projectx-affiliate-registry="1"]');
    if(existing){
      var finished=false;
      var finish=function(ok){
        if(finished) return;
        finished=true;
        if(typeof done==='function') done(!!ok);
      };
      existing.addEventListener('load',function(){finish(!!window.ProjectXAffiliateRegistry)});
      existing.addEventListener('error',function(){finish(false)});
      setTimeout(function(){finish(!!window.ProjectXAffiliateRegistry)},1800);
      return;
    }

    var script=document.createElement('script');
    script.src='/affiliate-registry.js';
    script.async=false;
    script.dataset.projectxAffiliateRegistry='1';
    script.onload=function(){if(typeof done==='function') done(!!window.ProjectXAffiliateRegistry);};
    script.onerror=function(){if(typeof done==='function') done(false);};
    document.head.appendChild(script);
  }

  function commercialRegistry(){
    return window.ProjectXAffiliateRegistry||{};
  }

  function commercialKey(value){
    return String(value||'')
      .toLowerCase()
      .replace(/&amp;/g,'&')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g,'')
      .replace(/[^a-z0-9]+/g,' ')
      .trim();
  }

  function findCommercial(value){
    var wanted=commercialKey(value);
    if(!wanted) return null;
    var registry=commercialRegistry();

    if(registry[wanted]) return registry[wanted];

    var keys=Object.keys(registry);
    for(var i=0;i<keys.length;i++){
      var item=registry[keys[i]];
      if(commercialKey(item.id)===wanted || commercialKey(item.name)===wanted){
        return item;
      }
    }

    var compact=wanted.replace(/\s+/g,'');
    for(var j=0;j<keys.length;j++){
      var item2=registry[keys[j]];
      var itemKey=commercialKey(item2.name).replace(/\s+/g,'');
      if(itemKey===compact || itemKey.indexOf(compact)>=0 || compact.indexOf(itemKey)>=0){
        return item2;
      }
    }
    return null;
  }

  function resultPrimaryId(){
    var link=document.getElementById('primaryLink');
    if(link){
      try{
        var u=new URL(link.href,window.location.origin);
        var id=u.searchParams.get('tool');
        if(id) return id;
      }catch(e){}
    }
    var title=document.querySelector('.resulthero h2');
    return title ? title.textContent.trim() : '';
  }

  function augmentCommercialCatalog(){
    var additions=[
      {
        id:'brevo',name:'Brevo',category:'Email Marketing & CRM',description:'Email marketing, automazioni, campagne, CRM e messaggistica per attività e aziende.',pricingUrl:'https://www.brevo.com/it/pricing/',affiliateUrl:'',needs:{crm:7,automation:9,email:10,followup:9,sales:7,quotes:2,excel:3,marketing:10,projects:1,documents:2,appointments:6,ecommerce:7,ai:6},team:['Solo io','2–5','6–20','21–50','50+'],tech:['Base','Medio','Avanzato'],automation:['Semplice','Smart'],integrations:['Shopify','WordPress','Make','Zapier','Stripe']
      },
      {
        id:'monday',name:'monday.com',category:'Gestione Progetti & Workflow',description:'Work management per progetti, processi, team, dashboard e automazioni.',pricingUrl:'https://monday.com/pricing',affiliateUrl:'',needs:{crm:5,automation:8,email:5,followup:5,sales:5,quotes:3,excel:6,marketing:4,projects:10,documents:7,appointments:6,ecommerce:2,ai:6},team:['2–5','6–20','21–50','50+'],tech:['Base','Medio','Avanzato'],automation:['Semplice','Smart','AI Mode 🤖'],integrations:['Make','Zapier','Google Drive','Slack','Microsoft Teams']
      },
      {
        id:'semrush',name:'Semrush',category:'SEO & Marketing Intelligence',description:'Suite per SEO, marketing, contenuti, advertising e analisi della visibilità online.',pricingUrl:'https://it.semrush.com/pricing/',affiliateUrl:'',needs:{crm:4,automation:7,email:4,followup:6,sales:6,quotes:1,excel:6,marketing:10,projects:2,documents:3,appointments:1,ecommerce:7,ai:8},team:['Solo io','2–5','6–20','21–50','50+'],tech:['Medio','Avanzato'],automation:['Smart','AI Mode 🤖'],integrations:['Google Analytics','Google Search Console','WordPress','Looker Studio']
      },
      {
        id:'kit',name:'Kit',category:'Creator Marketing & Email',description:'Email marketing e automazioni per creator, newsletter e business digitali.',pricingUrl:'https://kit.com/pricing',affiliateUrl:'',needs:{crm:5,automation:8,email:10,followup:8,sales:6,quotes:1,excel:2,marketing:9,projects:1,documents:2,appointments:2,ecommerce:6,ai:7},team:['Solo io','2–5','6–20'],tech:['Base','Medio'],automation:['Semplice','Smart','AI Mode 🤖'],integrations:['Shopify','WordPress','Zapier','Stripe']
      }
    ];

    var db=null;
    try{
      if(typeof SOFTWARE_DATABASE!=='undefined' && Array.isArray(SOFTWARE_DATABASE)) db=SOFTWARE_DATABASE;
    }catch(e){}
    if(!db && typeof window!=='undefined' && Array.isArray(window.SOFTWARE_DATABASE)) db=window.SOFTWARE_DATABASE;
    if(!db) return;

    var existing={};
    db.forEach(function(t){if(t&&t.id) existing[String(t.id).toLowerCase()]=true;});
    additions.forEach(function(tool){
      if(!existing[tool.id]){
        db.push(tool);
        existing[tool.id]=true;
      }
    });

    try{
      localStorage.setItem(COMMERCIAL_MEMORY_KEY,JSON.stringify({catalogVersion:'2026-09',added:additions.map(function(x){return x.id;})}));
    }catch(e){}
  }

  function injectCommercialStyles(){
    if(document.getElementById('px-commercial-styles')) return;
    var style=document.createElement('style');
    style.id='px-commercial-styles';
    style.textContent=`
      .px-commercial-card{margin-top:15px;padding:23px;border-radius:24px;border:1px solid rgba(255,209,102,.18);background:radial-gradient(circle at 88% 0%,rgba(255,209,102,.08),transparent 34%),linear-gradient(145deg,rgba(31,28,18,.74),rgba(9,14,24,.96));box-shadow:0 22px 70px rgba(0,0,0,.16)}
      .px-commercial-kicker{font-size:9px;letter-spacing:.15em;font-weight:950;color:#e8cf82}
      .px-commercial-title{margin:8px 0 6px;font-size:21px;letter-spacing:-.035em;font-weight:950}
      .px-commercial-copy{margin:0;color:#98a5bc;font-size:11px;line-height:1.55}
      .px-commercial-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:15px}
      .px-commercial-stat{padding:11px;border:1px solid rgba(255,255,255,.07);border-radius:12px;background:rgba(255,255,255,.025)}
      .px-commercial-stat b{display:block;font-size:12px;color:#fff}
      .px-commercial-stat span{display:block;margin-top:3px;font-size:9px;color:#77869d}
      .px-commercial-footer{display:flex;justify-content:space-between;gap:10px;align-items:center;flex-wrap:wrap;margin-top:13px;padding-top:12px;border-top:1px solid rgba(255,255,255,.07);font-size:9px;color:#6f7c92}
      .px-commercial-footer a{color:#c9bfff;text-decoration:none}
      .px-commercial-footer a:hover{text-decoration:underline}
      .px-commercial-badge{display:inline-flex!important;align-items:center;margin-left:6px;padding:4px 7px;border-radius:999px;background:rgba(255,209,102,.09);border:1px solid rgba(255,209,102,.16);color:#e7cf82!important;font-size:8px!important;font-weight:900!important;vertical-align:middle}
      @media(max-width:760px){.px-commercial-grid{grid-template-columns:1fr 1fr}.px-commercial-card{padding:19px}}
    `;
    document.head.appendChild(style);
  }

  function addCommercialResultLayer(){
    var results=document.getElementById('results');
    if(!results || results.style.display==='none' || document.getElementById('px-commercial-card')) return;
    var title=document.querySelector('.resulthero h2');
    var primary=title ? title.textContent.trim() : resultPrimaryId();
    var info=findCommercial(primary);
    if(!info) return;

    if(!document.getElementById('px-revenue-ladder-styles')){
      var rs=document.createElement('style');
      rs.id='px-revenue-ladder-styles';
      rs.textContent='#px-revenue-ladder-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:9px;margin-top:16px}@media(max-width:760px){#px-revenue-ladder-grid{grid-template-columns:1fr}}';
      document.head.appendChild(rs);
    }
    injectCommercialStyles();

    var card=document.createElement('section');
    card.id='px-commercial-card';
    card.className='px-commercial-card';
    var recurring=info.recurring?'Ricorrente':'Non ricorrente';
    var cookie=info.cookieDays ? info.cookieDays+' giorni' : 'Non indicato';
    card.innerHTML='<div class="px-commercial-kicker">PROJECT-X · BUSINESS LAYER</div>'+
      '<div class="px-commercial-title">Percorso commerciale collegato a '+escapeHtml(info.name)+'</div>'+
      '<p class="px-commercial-copy">Il motore ha scelto il software per compatibilità. Questa sezione è separata dal ranking e mostra soltanto se esiste un programma partner ufficiale associato.</p>'+
      '<div class="px-commercial-grid">'+
        '<div class="px-commercial-stat"><b>'+escapeHtml(info.commissionLabel||'Programma disponibile')+'</b><span>termine commerciale</span></div>'+
        '<div class="px-commercial-stat"><b>'+escapeHtml(recurring)+'</b><span>modello</span></div>'+
        '<div class="px-commercial-stat"><b>'+escapeHtml(info.durationLabel||'—')+'</b><span>durata / periodo</span></div>'+
        '<div class="px-commercial-stat"><b>'+escapeHtml(cookie)+'</b><span>cookie</span></div>'+ 
      '</div>'+
      '<div class="px-commercial-footer"><span>Le condizioni appartengono al provider e possono cambiare. PROJECT-X non promette un guadagno.</span><a href="'+escapeHtml(info.officialProgramUrl||info.sourceUrl||info.productUrl||'#')+'" target="_blank" rel="noopener">Vedi programma ufficiale ↗</a></div>';

    var hero=results.querySelector('.resulthero');
    if(hero && hero.parentNode) hero.parentNode.insertBefore(card,hero.nextSibling); else results.prepend(card);

    try{
      var stamp=Date.now();
      localStorage.setItem(COMMERCIAL_MEMORY_KEY,JSON.stringify({lastTool:info.id,lastView:stamp}));
    }catch(e){}
    send('commercial_layer_view',{tool:info.id,commission:info.commissionLabel||'',recurring:!!info.recurring});
  }

  function addCommercialBadges(){
    var registry=commercialRegistry();
    var items=document.querySelectorAll('#rankingMount .item');
    Array.prototype.forEach.call(items,function(item){
      if(item.querySelector('.px-commercial-badge')) return;
      var strong=item.querySelector('strong');
      if(!strong) return;
      var info=findCommercial(strong.textContent.replace(/^\d+\.\s*/,'').trim());
      if(!info) return;
      var badge=document.createElement('span');
      badge.className='px-commercial-badge';
      badge.textContent='AFFILIATE';
      strong.appendChild(badge);
    });
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
        ['E-commerce','ecommerce|e-commerce|carrello|shopify|ordine'],
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


  function addRevenueLadder(){
    var results=document.getElementById('results');
    if(!results || results.style.display==='none' || document.getElementById('px-revenue-ladder')) return;

    var primary=resultPrimaryId();
    var info=findCommercial(primary);
    var section=document.createElement('section');
    section.id='px-revenue-ladder';
    section.style.cssText='margin-top:15px;padding:24px;border-radius:24px;border:1px solid rgba(124,92,255,.2);background:linear-gradient(145deg,rgba(18,25,44,.96),rgba(8,12,22,.98));box-shadow:0 22px 75px rgba(0,0,0,.18);';
    section.innerHTML=
      '<div style="font-size:9px;letter-spacing:.16em;font-weight:950;color:#aaa0ff">IL TUO PERCORSO PROJECT-X</div>'+
      '<h3 style="margin:8px 0 7px;font-size:24px;letter-spacing:-.045em">Tre modi per trasformare la risposta in valore.</h3>'+
      '<p style="margin:0;color:#98a5bc;font-size:11px;line-height:1.55;max-width:780px">Prima capisci cosa serve. Poi scegli quanto vuoi fare da solo. Nessun passaggio cambia il ranking del motore.</p>'+
      '<div id="px-revenue-ladder-grid">'+
        '<div style="padding:15px;border:1px solid rgba(255,255,255,.08);border-radius:15px;background:rgba(255,255,255,.025)">'+
          '<div style="font-size:9px;color:#7ce8bd;font-weight:900">01 · PARTI DAL TOOL</div>'+
          '<strong style="display:block;margin-top:7px;font-size:13px;color:#fff">'+escapeHtml(info&&info.name?info.name:'Software consigliato')+'</strong>'+
          '<p style="margin:6px 0 0;font-size:10px;color:#8290a8;line-height:1.45">Verifica direttamente funzioni, prezzo e condizioni del provider.</p>'+
          (info?'<a href="/api/affiliate?tool='+encodeURIComponent(info.id)+'&source=result-ladder" style="display:inline-flex;margin-top:10px;padding:9px 11px;border-radius:10px;color:#fff;background:rgba(124,92,255,.18);text-decoration:none;font-size:9px;font-weight:900">Apri provider →</a>':'')+
          '<a href="/compare.html" style="display:inline-flex;margin-top:10px;padding:9px 11px;border-radius:10px;color:#c9bfff;border:1px solid rgba(255,255,255,.09);text-decoration:none;font-size:9px;font-weight:900">Confronta →</a>'+
        '</div>'+
        '<div style="padding:15px;border:1px solid rgba(255,209,102,.16);border-radius:15px;background:rgba(255,209,102,.035)">'+
          '<div style="font-size:9px;color:#ffe18c;font-weight:900">02 · APPROFONDISCI · €29</div>'+
          '<strong style="display:block;margin-top:7px;font-size:13px;color:#fff">Report PRO</strong>'+
          '<p style="margin:6px 0 0;font-size:10px;color:#8290a8;line-height:1.45">Roadmap, workflow, KPI e blueprint operativa costruiti sul tuo profilo.</p>'+
          '<a href="/report-pro.html?source=result-ladder" style="display:inline-flex;margin-top:10px;padding:9px 11px;border-radius:10px;color:#fff;background:linear-gradient(135deg,#7c5cff,#5b8cff);text-decoration:none;font-size:9px;font-weight:900">Vedi Report PRO →</a>'+
        '</div>'+
        '<div style="padding:15px;border:1px solid rgba(54,217,157,.16);border-radius:15px;background:rgba(54,217,157,.035)">'+
          '<div style="font-size:9px;color:#7ce8bd;font-weight:900">03 · FATTI AIUTARE</div>'+
          '<strong style="display:block;margin-top:7px;font-size:13px;color:#fff">Implementazione</strong>'+
          '<p style="margin:6px 0 0;font-size:10px;color:#8290a8;line-height:1.45">Richiedi un progetto per trasformare la direzione in processo, automazioni e controlli concreti.</p>'+
          '<a href="/implementation.html?source=result-ladder" style="display:inline-flex;margin-top:10px;padding:9px 11px;border-radius:10px;color:#fff;background:rgba(54,217,157,.16);text-decoration:none;font-size:9px;font-weight:900">Richiedi progetto →</a>'+
        '</div>'+
      '</div>'+
      '<div style="margin-top:12px;padding-top:11px;border-top:1px solid rgba(255,255,255,.07);font-size:9px;color:#6f7c92">I link software possono essere affiliati. La monetizzazione è separata dalla decisione del motore. <a href="/affiliate-disclosure.html" style="color:#aaa0ff">Trasparenza →</a></div>';

    var anchor=document.getElementById('px-next-best-action')||document.getElementById('px-commercial-card');
    if(anchor&&anchor.parentNode) anchor.insertAdjacentElement('afterend',section);
    else results.appendChild(section);
    send('revenue_ladder_view',{primary:primary||'',hasAffiliate:!!info});
  }

  function observeResults(){
    var observer=new MutationObserver(function(){
      addNextBestAction();
      addCommercialResultLayer();
      addCommercialBadges();
      addRevenueLadder();
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
    addCommercialResultLayer();
    addCommercialBadges();
    addRevenueLadder();
  }

  function wire(){
    if(location.pathname!=='/' && !/index\.html$/i.test(location.pathname)) return;
    memory.visits=(memory.visits||0)+1;
    memory.lastPath=location.pathname;
    memory.lastSource=source();
    memory.lastSeen=Date.now();
    saveMemory();

    loadAffiliateRegistry(function(){
      augmentCommercialCatalog();
      addAdaptiveBadge();
      addLiveEngine();
      trackAnalysisStart();
      observeResults();
    });
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',wire);
  else wire();

  window.ProjectXAdaptive={
    memory:function(){return JSON.parse(JSON.stringify(memory));},
    segment:function(){return inferSegment(answers());},
    commercialRegistry:function(){return JSON.parse(JSON.stringify(commercialRegistry()));}
  };
})();