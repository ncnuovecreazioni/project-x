/* =========================================================
   PROJECT-X — EXECUTION GUIDE
   ---------------------------------------------------------
   Trasforma la decisione in una procedura utilizzabile.
   Nessuna logica di ranking. Nessuna modifica al Decision Engine.
   ========================================================= */
(function(){
  'use strict';

  if(window.__PROJECTX_EXECUTION_GUIDE__) return;
  window.__PROJECTX_EXECUTION_GUIDE__=true;

  var KEY='projectx_guide_state_v1';

  function esc(v){
    return String(v==null?'':v).replace(/[&<>"']/g,function(c){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
    });
  }

  function answers(){
    try{return JSON.parse(localStorage.getItem('projectx_answers_v2')||'{}')}catch(e){return {}}
  }

  function result(){
    try{return window.result||null}catch(e){return null}
  }

  function primary(r){
    return r&&(r.primaryTool||r.primary||(r.rankedTools&&r.rankedTools[0]))||null;
  }

  function getState(toolId){
    try{
      var all=JSON.parse(localStorage.getItem(KEY)||'{}');
      return all[toolId]||{};
    }catch(e){return {}}
  }

  function saveStep(toolId,index,checked){
    try{
      var all=JSON.parse(localStorage.getItem(KEY)||'{}');
      all[toolId]=all[toolId]||{};
      all[toolId][String(index)]=!!checked;
      localStorage.setItem(KEY,JSON.stringify(all));
    }catch(e){}
  }

  function goalSummary(a){
    var goals=Array.isArray(a&&a.goals)?a.goals:[];
    var pain=String(a&&a.painPoint||'').trim();
    var map={
      'Clienti':['avere clienti e richieste più ordinati','centralizzare i contatti','meno dispersione tra email, fogli e app'],
      'Vendite':['seguire meglio le opportunità','rendere visibili le trattative e i richiami','meno occasioni dimenticate'],
      'Preventivi':['preparare e seguire i preventivi più facilmente','standardizzare il passaggio preventivo → follow-up','meno copia-incolla e meno ritardi'],
      'Email':['gestire meglio le comunicazioni ripetitive','creare un flusso email semplice e controllabile','meno risposte manuali ripetute'],
      'Automazioni':['ridurre il lavoro manuale ripetitivo','automatizzare un singolo passaggio ad alto impatto','meno passaggi eseguiti a mano'],
      'Documenti':['trovare e gestire i documenti più facilmente','standardizzare creazione, archiviazione o invio','meno ricerca e operazioni ripetitive'],
      'Excel':['ridurre copia-incolla e gestione manuale dei dati','collegare il foglio al processo che lo usa','meno passaggi manuali sui dati'],
      'Progetti':['avere attività e scadenze più leggibili','centralizzare responsabilità e stati','meno informazioni disperse'],
      'E-commerce':['rendere più ordinato il lavoro intorno agli ordini','collegare eventi del negozio alle comunicazioni','meno attività post-acquisto manuali'],
      'Marketing':['rendere più ordinato il flusso di acquisizione','collegare contatti, campagne e follow-up','meno passaggi scollegati']
    };
    var chosen=null;
    for(var i=0;i<goals.length;i++){if(map[goals[i]]){chosen=map[goals[i]];break;}}
    if(!chosen)chosen=['semplificare il lavoro che oggi crea più attrito','partire dal collo di bottiglia descritto','un processo più chiaro e misurabile'];
    return {goal:chosen[0],action:chosen[1],outcome:chosen[2],pain:pain};
  }

  function categoryType(tool){
    var c=String(tool&&tool.category||'').toLowerCase();
    var n=String(tool&&tool.name||'').toLowerCase();
    if(/crm|sales|customer/.test(c)) return 'crm';
    if(/email|marketing|automation marketing|lead/.test(c)) return 'marketing';
    if(/e-commerce|ecommerce|shop/.test(c) || /shopify|woocommerce|klaviyo|omnisend/.test(n)) return 'ecommerce';
    if(/automation|integration|workflow/.test(c) || /make|zapier|n8n|power automate/.test(n)) return 'automation';
    if(/project|task|work management/.test(c)) return 'projects';
    if(/calendar|appointment|scheduling/.test(c)) return 'appointments';
    if(/document|pdf|esign/.test(c)) return 'documents';
    return 'general';
  }

  function build(tool){
    var a=answers();
    var goal=goalSummary(a);
    var type=categoryType(tool);
    var integrations=Array.isArray(tool&&tool.integrations)?tool.integrations:[];
    var integrationText=integrations.slice(0,4).join(', ');
    var common={
      simple:[
        ['01','Crea l’account','Apri il sito del software e completa la configurazione iniziale. Non cambiare tutto subito.'],
        ['02','Porta dentro solo il necessario','Inizia con pochi dati reali: ad esempio clienti, contatti o un progetto pilota.'],
        ['03','Costruisci un solo flusso','Prendi il problema che hai scritto e trasformalo in un singolo processo ripetibile.'],
        ['04','Fai una prova','Esegui il flusso con un caso reale e controlla che il risultato sia corretto.'],
        ['05','Misura','Conta tempo, passaggi manuali ed errori prima e dopo.']
      ],
      practical:[
        ['01','Definisci input e output','Scrivi cosa entra nel sistema, cosa deve succedere e quale risultato deve uscire.'],
        ['02','Configura il nucleo','Imposta pipeline, liste, progetti o workspace prima di aggiungere integrazioni extra.'],
        ['03','Automatizza il collo di bottiglia','Automatizza un solo passaggio ad alto volume o ad alta frequenza.'],
        ['04','Gestisci gli errori','Prevedi test, notifiche e un modo semplice per capire quando un’automazione si interrompe.'],
        ['05','Replica solo dopo il test','Quando il primo workflow funziona, copia la logica sugli altri processi.']
      ]
    };

    if(type==='crm'){
      common.simple[1]=['02','Crea il primo flusso clienti','Inserisci pochi clienti reali e crea fasi semplici: nuovo → contatto → proposta → chiuso.'];
      common.simple[2]=['03','Automatizza un follow-up','Scegli un richiamo che oggi fai a mano e rendilo il primo workflow.'];
      common.practical[1]=['02','Disegna la pipeline','Definisci fasi, campi obbligatori e regola con cui un contatto passa allo stadio successivo.'];
      common.practical[2]=['03','Collega il follow-up','Imposta trigger, messaggio, scadenza e responsabile.'];
    } else if(type==='marketing'){
      common.simple[1]=['02','Crea una sola lista','Parti da un gruppo piccolo e comprensibile di contatti.'];
      common.simple[2]=['03','Crea una sola automazione','Esempio: contatto → email → attesa → seconda email.'];
      common.practical[1]=['02','Definisci evento e segmento','Stabilisci cosa fa partire il flusso e a chi si applica.'];
      common.practical[2]=['03','Costruisci il journey minimo','Trigger → messaggio → attesa → condizione → uscita.'];
    } else if(type==='ecommerce'){
      common.simple[1]=['02','Collega il negozio','Collega il tuo shop e verifica che ordini e clienti arrivino correttamente.'];
      common.simple[2]=['03','Automatizza il post-acquisto','Parti da una sola comunicazione utile dopo l’ordine.'];
      common.practical[1]=['02','Verifica gli eventi','Controlla ordini, clienti e stato del pagamento prima di attivare le automazioni.'];
      common.practical[2]=['03','Costruisci un workflow misurabile','Evento → messaggio → timing → condizione → conversione.'];
    } else if(type==='automation'){
      common.simple[1]=['02','Scegli due strumenti','Collega solo l’app sorgente e quella che deve ricevere il risultato.'];
      common.simple[2]=['03','Crea una sola automazione','Esempio: nuovo modulo → crea record → avvisa la persona giusta.'];
      common.practical[1]=['02','Definisci trigger e azione','Scrivi esattamente cosa fa partire il flusso e quale output deve produrre.'];
      common.practical[2]=['03','Aggiungi controllo errore','Imposta test, fallback e notifica quando il flusso fallisce.'];
    } else if(type==='projects'){
      common.simple[1]=['02','Crea un progetto pilota','Parti da un solo lavoro reale, non da tutti i progetti.'];
      common.simple[2]=['03','Definisci tre stati','Da fare → in corso → fatto. Aggiungi complessità solo dopo.'];
      common.practical[1]=['02','Disegna stati e responsabilità','Ogni attività deve avere stato, proprietario e scadenza.'];
      common.practical[2]=['03','Automatizza gli handoff','Quando cambia stato, fai partire la notifica o l’attività successiva.'];
    }

    return {
      simple:common.simple,
      practical:common.practical,
      integrationText:integrationText
    };
  }

  function styles(){
    if(document.getElementById('px-execution-guide-style')) return;
    var s=document.createElement('style');
    s.id='px-execution-guide-style';
    s.textContent='.px-eg{margin:15px 0 0;padding:20px;border:1px solid rgba(124,92,255,.20);border-radius:22px;background:radial-gradient(circle at 90% 0%,rgba(124,92,255,.10),transparent 30%),linear-gradient(145deg,rgba(16,23,40,.95),rgba(8,12,22,.97));box-shadow:0 24px 75px rgba(0,0,0,.20)}.px-eg-head{display:flex;justify-content:space-between;gap:12px;align-items:flex-start}.px-eg-k{font-size:8px;letter-spacing:.16em;color:#a99cff;font-weight:950}.px-eg-title{margin:7px 0 4px;font-size:22px;font-weight:950;letter-spacing:-.035em}.px-eg-copy{margin:0;color:#8795aa;font-size:10px;line-height:1.5;max-width:760px}.px-eg-badge{padding:8px 10px;border:1px solid rgba(54,217,157,.15);background:rgba(54,217,157,.04);border-radius:999px;color:#7ce8bd;font-size:8px;font-weight:950;white-space:nowrap}.px-eg-tabs{display:flex;gap:7px;margin-top:14px}.px-eg-tab{padding:9px 11px;border:1px solid rgba(255,255,255,.08);border-radius:11px;background:rgba(255,255,255,.025);color:#98a5bc;font-size:9px;font-weight:900;cursor:pointer}.px-eg-tab.active{border-color:rgba(124,92,255,.34);background:rgba(124,92,255,.09);color:#e9e5ff}.px-eg-list{display:grid;gap:8px;margin-top:11px}.px-eg-step{display:grid;grid-template-columns:29px 1fr auto;gap:9px;align-items:start;padding:11px 12px;border:1px solid rgba(255,255,255,.065);border-radius:12px;background:rgba(255,255,255,.018)}.px-eg-check{width:25px;height:25px;margin:0;accent-color:#7c5cff;cursor:pointer}.px-eg-num{width:27px;height:27px;display:grid;place-items:center;border-radius:8px;background:rgba(124,92,255,.10);color:#c8bfff;font-size:8px;font-weight:950}.px-eg-step b{display:block;font-size:10px}.px-eg-step span{display:block;margin-top:4px;color:#7f8da3;font-size:8px;line-height:1.45}.px-eg-footer{display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-top:12px;padding:10px 11px;border:1px solid rgba(54,217,157,.12);border-radius:11px;background:rgba(54,217,157,.03);color:#7f8da3;font-size:8px;line-height:1.45}.px-eg-footer strong{color:#7ce8bd}.px-eg-link{display:inline-flex;align-items:center;gap:5px;color:#d9d3ff;text-decoration:none;font-weight:900}.px-eg-advanced{margin-top:10px;padding:10px 11px;border-radius:11px;background:rgba(255,255,255,.018);border:1px solid rgba(255,255,255,.06);color:#77859b;font-size:8px;line-height:1.45}@media(max-width:650px){.px-eg-head{display:block}.px-eg-badge{display:inline-flex;margin-top:9px}.px-eg-step{grid-template-columns:27px 1fr 25px}.px-eg-title{font-size:20px}}';
    document.head.appendChild(s);
  }

  function render(){
    var results=document.getElementById('results');
    var mount=document.getElementById('primaryMount');
    if(!results||!mount||getComputedStyle(results).display==='none') return;
    var r=result(),p=primary(r);
    if(!p||document.getElementById('px-execution-guide')) return;

    styles();
    var data=build(p),state=getState(p.id||p.name||'tool');
    var steps=data.simple;
    var box=document.createElement('section');
    box.id='px-execution-guide';
    box.className='px-eg';

    var a=answers(),goal=goalSummary(a);
    var html='<div class="px-eg-head"><div><div class="px-eg-k">DAL RISULTATO ALL’AZIONE</div><div class="px-eg-title">Come usare '+esc(p.name||p.id)+' senza complicarti la vita</div><p class="px-eg-copy">Obiettivo: <strong style="color:#eef2f8">'+esc(goal.goal)+'</strong>. La guida trasforma questo obiettivo in passi concreti e misurabili.</p></div><div class="px-eg-badge">GUIDA OPERATIVA</div></div><div class="px-eg-footer" style="margin-top:12px"><div><strong>In pratica:</strong> '+esc(goal.action)+'.</div><div><strong>Risultato da cercare:</strong> '+esc(goal.outcome)+'.</div></div>';
    html+='<div class="px-eg-tabs"><button type="button" class="px-eg-tab active" data-mode="simple">Voglio solo iniziare</button><button type="button" class="px-eg-tab" data-mode="practical">Voglio configurarlo bene</button></div>';
    html+='<div class="px-eg-list"></div>';
    html+='<div class="px-eg-advanced"></div>';
    html+='<div class="px-eg-footer"><div><strong>Regola PROJECT-X:</strong> fai funzionare un solo processo prima di aggiungerne altri.</div>'+(data.integrationText?'<a class="px-eg-link" href="#" data-scroll="stack">Vedi integrazioni →</a>':'')+'</div>';

    box.innerHTML=html;
    mount.insertAdjacentElement('afterend',box);

    var list=box.querySelector('.px-eg-list'),advanced=box.querySelector('.px-eg-advanced');

    function draw(mode){
      steps=data[mode];
      list.innerHTML=steps.map(function(x,i){
        var checked=!!state[String(i)];
        return '<label class="px-eg-step"><span class="px-eg-num">'+x[0]+'</span><span><b>'+esc(x[1])+'</b><span>'+esc(x[2])+'</span></span><input class="px-eg-check" type="checkbox" data-step="'+i+'" '+(checked?'checked':'')+' aria-label="'+esc(x[1])+'"></label>';
      }).join('');
      advanced.innerHTML=mode==='practical'
        ? '<strong style="color:#dfe5ef">Dettaglio utile:</strong> '+esc(data.integrationText?('Questo strumento dichiara integrazioni con '+data.integrationText+'. Parti da una sola.'):'Non collegare tutto al primo giorno: prima rendi stabile il flusso principale.') 
        : '<strong style="color:#dfe5ef">Per partire bene:</strong> usa un caso reale piccolo. Quando funziona, lo replichi.';
    }

    function setMode(mode){
      box.querySelectorAll('.px-eg-tab').forEach(function(b){b.classList.toggle('active',b.getAttribute('data-mode')===mode)});
      draw(mode);
    }

    box.querySelectorAll('.px-eg-tab').forEach(function(b){b.onclick=function(){setMode(b.getAttribute('data-mode'))}});
    list.addEventListener('change',function(e){
      var cb=e.target.closest('.px-eg-check');
      if(!cb)return;
      saveStep(p.id||p.name||'tool',Number(cb.getAttribute('data-step')||0),cb.checked);
    });
    box.querySelector('[data-scroll="stack"]').onclick=function(e){
      e.preventDefault();
      var el=document.getElementById('stackMount');
      if(el)el.scrollIntoView({behavior:'smooth',block:'start'});
    };
    draw('simple');
  }

  var observer=new MutationObserver(function(){
    if(!document.getElementById('px-execution-guide')) render();
  });

  function start(){
    observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['style','class']});
    setTimeout(render,80);
    setTimeout(render,700);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);
  else start();
})();