const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = process.cwd();
const OUT = path.join(ROOT, 'guide');
const BASE_URL = 'https://project-x-phi-steel.vercel.app';

function loadProjectData(){
  const ctx = { console, window:{} };
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(ROOT,'database.js'),'utf8'),ctx);
  vm.runInContext(fs.readFileSync(path.join(ROOT,'tool-tutorials.js'),'utf8'),ctx);
  vm.runInContext(fs.readFileSync(path.join(ROOT,'tutorial-library.js'),'utf8'),ctx);
  vm.runInContext(fs.readFileSync(path.join(ROOT,'goal-guides.js'),'utf8'),ctx);
  return {
    db: vm.runInContext('SOFTWARE_DATABASE',ctx) || [],
    tutorials: ctx.window.PROJECTX_TOOL_TUTORIALS,
    detailed: ctx.window.PROJECTX_DETAILED_TUTORIALS,
    goals: ctx.window.PROJECTX_GOAL_GUIDES
  };
}

function esc(s){
  return String(s == null ? '' : s).replace(/[&<>"']/g,function(c){
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
  });
}

function slug(id){
  return String(id || '').toLowerCase().replace(/[^a-z0-9-]+/g,'-').replace(/^-|-$/g,'');
}

function cat(tool){
  const c = String(tool.category || 'Software');
  if(/crm|sales/i.test(c)) return 'CRM & vendite';
  if(/automation|workflow/i.test(c)) return 'Automazione';
  if(/email|marketing/i.test(c)) return 'Marketing & email';
  if(/e-commerce|ecommerce|shop/i.test(c)) return 'E-commerce';
  if(/project|work management/i.test(c)) return 'Gestione del lavoro';
  if(/seo/i.test(c)) return 'SEO';
  if(/ai/i.test(c)) return 'AI';
  if(/document|pdf|signature|quote/i.test(c)) return 'Documenti';
  return c;
}

function toolTutorial(tool, tutorials){
  try { return tutorials && tutorials.get ? tutorials.get(tool) : null; }
  catch(e){ return null; }
}

function detailedTutorial(tool, detailed){
  try { return detailed && detailed.get ? detailed.get(tool) : null; }
  catch(e){ return null; }
}

function platformNote(tool){
  const c = String(tool.category || '').toLowerCase();
  if(/mobile|social/.test(c)) return 'Questa procedura può cambiare tra app e versione Web.';
  if(/crm|sales|marketing|automation|ecommerce|project|document|seo|ai/.test(c)) return 'La guida assume l’uso della versione Web da computer, salvo diversa indicazione.';
  return 'La guida è pensata per la versione Web del servizio.';
}

function richParagraphs(tool,tut,d){
  const name = tool.name || tool.id;
  const scenario = d && d.scenario ? d.scenario : 'Partiamo da un caso concreto e costruiamo una procedura semplice da verificare.';
  const mission = (tut && tut.mission) || 'L’obiettivo è far funzionare bene un singolo processo prima di estenderlo.';
  return [
    scenario,
    'Non è necessario conoscere tutte le funzioni di '+name+'. In questa guida ci concentriamo sulle operazioni che servono per ottenere il risultato indicato, evitando di complicare il primo test.',
    mission+' Procedendo con ordine puoi capire non solo quali pulsanti usare, ma anche perché il passaggio è necessario e come verificare che abbia funzionato.'
  ];
}

function toolStepHtml(steps){
  return steps.map(function(s,i){
    const title=s[0]||('Passaggio '+(i+1));
    const intro=s[1]||'';
    const action=s[2]||'';
    const success=s[3]||'';
    const why='Questo passaggio prepara il dato o la configurazione necessari per quello successivo. Non procedere oltre finché il risultato atteso non è chiaro.';
    const example='Per il primo tentativo usa un solo caso. Se stai configurando un CRM, prova con un solo contatto; se stai creando un’automazione, usa un solo evento di test.';
    const trouble='Se la voce indicata non compare, cerca nell’area equivalente o usa la ricerca interna del servizio. Controlla prima account, permessi e dati di prova, poi ripeti il test con una sola variabile alla volta.';
    return '<section class="article-step" id="passo-'+(i+1)+'">'+
      '<div class="step-head"><span class="step-no">'+String(i+1).padStart(2,'0')+'</span><div><div class="eyebrow">PASSO '+(i+1)+'</div><h2>'+esc(title)+'</h2></div></div>'+
      '<p>'+esc(intro)+'</p>'+
      '<div class="why"><b>PERCHÉ QUESTO PASSAGGIO</b><span>'+esc(why)+'</span></div>'+
      '<div class="action"><b>👉 COSA FARE</b><span>'+esc(action)+'</span></div>'+
      '<div class="examplebox"><b>🧪 UN ESEMPIO CONCRETO</b><span>'+esc(example)+'</span></div>'+
      '<div class="success"><b>✓ COME CAPISCI CHE HAI FATTO BENE</b><span>'+esc(success)+'</span></div>'+
      '<details class="trouble"><summary>Non trovi la voce o compare un errore?</summary><p>'+esc(trouble)+'</p></details>'+
    '</section>';
  }).join('');
}

function indexHtml(items){
  return '<nav class="toc"><div class="toc-title">In questa guida</div><ol>'+
    items.map(function(x,i){ return '<li><a href="#'+esc(x.id)+'">'+String(i+1)+'. '+esc(x.title)+'</a></li>'; }).join('')+
  '</ol></nav>';
}

function factsHtml(items){
  return '<div class="facts">'+items.map(function(x){
    return '<div class="fact"><b>'+esc(x[0])+'</b><span>'+esc(x[1])+'</span></div>';
  }).join('')+'</div>';
}

function baseCss(){
  return [
    ':root{--bg:#f7f8fb;--paper:#fff;--ink:#1f2430;--muted:#687386;--line:#e7eaf0;--brand:#6357e8;--brand2:#4f8df7;--ok:#159b70;--warn:#a36b00;--shadow:0 12px 34px rgba(25,32,48,.08)}',
    '*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;background:var(--bg);color:var(--ink);font-family:Inter,system-ui,-apple-system,"Segoe UI",sans-serif;line-height:1.7}.wrap{width:min(1080px,calc(100% - 28px));margin:auto}',
    '.top{position:sticky;top:0;z-index:20;background:rgba(255,255,255,.94);backdrop-filter:blur(12px);border-bottom:1px solid var(--line)}.nav{height:62px;display:flex;align-items:center;justify-content:space-between}.logo{font-weight:950;letter-spacing:.14em}.logo b{color:var(--brand)}.nav a{color:#505a6d;text-decoration:none;font-size:12px;font-weight:800}',
    '.hero{padding:56px 0 30px;background:linear-gradient(180deg,#fff,#f7f8fb)}.eyebrow{font-size:10px;font-weight:900;letter-spacing:.1em;text-transform:uppercase;color:var(--brand)}.hero h1{max-width:900px;margin:12px 0 13px;font-size:clamp(38px,6.3vw,68px);line-height:1.02;letter-spacing:-.045em}.grad{color:var(--brand)}.hero p{max-width:850px;margin:0;color:#596477;font-size:17px;line-height:1.75}.chips{display:flex;gap:7px;flex-wrap:wrap;margin-top:18px}.chip{padding:7px 10px;border:1px solid var(--line);border-radius:999px;background:#fff;color:#606b7e;font-size:10px;font-weight:800}',
    '.page{padding:24px 0 80px}.grid{display:grid;grid-template-columns:minmax(0,1fr) 285px;gap:20px;align-items:start}.article{min-width:0}.card,.sidecard{background:var(--paper);border:1px solid var(--line);border-radius:18px;box-shadow:var(--shadow)}.section{padding:26px}.section h2{margin:0 0 12px;font-size:27px;line-height:1.15;letter-spacing:-.03em}.section p{margin:0 0 13px;color:#556174;font-size:15px}',
    '.toc{padding:20px 22px;margin-bottom:20px;background:#fff;border:1px solid var(--line);border-radius:16px}.toc-title{font-weight:950;font-size:15px;margin-bottom:7px}.toc ol{margin:0;padding-left:19px}.toc a{color:#4f5a6e;text-decoration:none;font-size:13px}.toc a:hover{color:var(--brand)}',
    '.facts{display:grid;grid-template-columns:repeat(3,1fr);gap:9px;margin-top:17px}.fact{padding:13px;border:1px solid var(--line);border-radius:12px;background:#fbfcfe}.fact b{display:block;font-size:9px;letter-spacing:.08em;color:#737e91}.fact span{display:block;margin-top:5px;color:#394354;font-size:12px;line-height:1.5}',
    '.leadbox{padding:20px;border-left:4px solid var(--brand);background:#f7f6ff;border-radius:12px;margin-top:16px}.leadbox b{display:block;font-size:13px;margin-bottom:5px}.leadbox span{color:#5d677a;font-size:14px}',
    '.article-step{padding:28px 0;border-top:1px solid var(--line);scroll-margin-top:80px}.step-head{display:flex;gap:14px;align-items:flex-start}.step-no{width:42px;height:42px;display:grid;place-items:center;border-radius:12px;background:#eeeafd;color:#4f42c7;font-weight:950;flex:0 0 auto}.article-step h2{margin:2px 0 8px;font-size:24px;line-height:1.2}.article-step>p{margin:0;color:#4f5b6f;font-size:15px;line-height:1.75}',
    '.why,.action,.examplebox,.success{margin-top:14px;padding:13px 15px;border-radius:11px}.why{background:#f7f6ff;border:1px solid #e8e3ff}.action{background:#f4f8ff;border:1px solid #dfe9ff}.examplebox{background:#fbfbf5;border:1px dashed #eadfb7}.success{background:#f2fbf7;border:1px solid #d8f0e7}.why b,.action b,.examplebox b,.success b{display:block;font-size:9px;letter-spacing:.08em;margin-bottom:4px}.why b{color:#6255d8}.action b{color:#416fae}.examplebox b{color:#8b6a13}.success b{color:#137e5c}.why span,.action span,.examplebox span,.success span{display:block;color:#4e5a6d;font-size:13px;line-height:1.6}',
    '.trouble{margin-top:12px;border:1px solid var(--line);border-radius:11px;padding:11px 13px;background:#fff}.trouble summary{cursor:pointer;font-size:13px;font-weight:850;color:#434d5e}.trouble p{margin:8px 0 0!important;color:#647083!important;font-size:12px!important;line-height:1.6!important}',
    '.side{position:sticky;top:79px}.sidecard{padding:18px}.sidecard+.sidecard{margin-top:12px}.sidecard h3{margin:0 0 10px;font-size:14px}.sidecard a{display:block;padding:8px 0;border-bottom:1px solid #f0f1f4;color:#596477;text-decoration:none;font-size:11px;line-height:1.45}.sidecard p{margin:0;color:#6a7587;font-size:11px;line-height:1.6}.side .pill{display:inline-flex;margin-top:7px;padding:6px 8px;background:#f3f1ff;color:#5a4fd1;border-radius:999px;font-size:9px;font-weight:900}',
    '.checklist{padding:21px;background:#fff;border:1px solid var(--line);border-radius:16px;margin-top:20px}.checklist h2{margin:0 0 9px;font-size:21px}.checklist li{margin:7px 0;color:#566174;font-size:13px}',
    '.cta{padding:23px;margin-top:20px;border-radius:16px;background:linear-gradient(135deg,#6357e8,#4f8df7);color:#fff}.cta h2{margin:0 0 7px;font-size:23px}.cta p{margin:0 0 12px;color:rgba(255,255,255,.88);font-size:13px}.btn{display:inline-flex;padding:10px 14px;border-radius:10px;background:#fff;color:#4338a9;text-decoration:none;font-size:11px;font-weight:950}',
    '.related{padding:21px;margin-top:20px}.related h2{margin:0 0 7px;font-size:20px}.related a{display:flex;justify-content:space-between;gap:10px;padding:10px 0;border-bottom:1px solid var(--line);color:#404a5b;text-decoration:none;font-size:12px}.related span{color:#8993a5;font-size:10px}',
    '.visual{margin-top:18px;padding:18px;border-radius:16px;background:#171b28;color:#fff}.visual-head{display:flex;justify-content:space-between;gap:10px;align-items:center}.visual-title{font-weight:950}.visual-label{font-size:9px;letter-spacing:.08em;color:#94a2bb}.visual-grid{display:grid;grid-template-columns:70px 1fr;gap:12px;margin-top:13px}.visual-nav div{height:12px;margin-bottom:6px;border-radius:5px;background:rgba(255,255,255,.07)}.visual-nav .active{height:18px;background:rgba(124,92,255,.28);border:1px solid rgba(124,92,255,.5)}.visual-main{padding:13px;border:1px solid rgba(255,255,255,.08);border-radius:11px;background:rgba(255,255,255,.025)}.visual-main h4{margin:0 0 8px;font-size:13px}.visual-field{padding:9px;border-radius:8px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.06);margin-top:7px}.visual-field b{display:block;font-size:7px;color:#8e9bb3;letter-spacing:.08em}.visual-field span{display:block;margin-top:3px;font-size:10px;color:#e8edf7}.visual-note{margin-top:9px;font-size:9px;color:#8794a9;line-height:1.5}',
    'footer{padding:32px 0 55px;border-top:1px solid var(--line);text-align:center;color:#8791a2;font-size:10px}',
    '@media(max-width:860px){.grid{grid-template-columns:1fr}.side{position:static}.facts{grid-template-columns:1fr 1fr}}@media(max-width:560px){.wrap{width:calc(100% - 20px)}.hero{padding-top:40px}.hero h1{font-size:39px}.hero p{font-size:14px}.section{padding:18px}.facts{grid-template-columns:1fr}.article-step h2{font-size:21px}}'
  ].join('');
}

function visual(tool,d){
  return '<div class="visual"><div class="visual-head"><div class="visual-title">Schermata di riferimento</div><div class="visual-label">ILLUSTRATIVA</div></div>'+
    '<div class="visual-grid"><div class="visual-nav"><div class="active"></div><div></div><div></div><div></div><div></div></div>'+
    '<div class="visual-main"><h4>'+esc(tool.name)+' · area da trovare</h4><div class="visual-field"><b>AREA</b><span>'+esc(d.menu||tool.category||'Area principale')+'</span></div><div class="visual-field"><b>AZIONE</b><span>'+esc((d.steps&&d.steps[0]&&d.steps[0][2])||'Segui il passaggio indicato nella guida')+'</span></div><div class="visual-note">Questa schermata è una simulazione grafica. Quando disponiamo di una schermata ufficiale aggiornata, la inseriamo qui; non utilizziamo immagini inventate come se fossero l’interfaccia reale.</div></div></div></div>';
}

function toolPage(tool,tut,d,all){
  const name=tool.name||tool.id;
  const steps=Array.isArray(d&&d.steps)?d.steps:[];
  const url=BASE_URL+'/guide/'+slug(tool.id)+'.html';
  const intro=richParagraphs(tool,tut,d);
  const toc=[
    {id:'prima',title:'Prima di iniziare'},
    {id:'procedura',title:'Procedura passo passo'},
    {id:'controllo',title:'Controllo finale'},
    {id:'dopo',title:'Cosa fare dopo'}
  ];
  const related=all.filter(function(t){return t.id!==tool.id&&t.category===tool.category}).slice(0,5);
  return '<!doctype html><html lang="it"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#ffffff"><meta name="description" content="'+esc('Guida completa a '+name+': spiegazione, preparazione, procedura passo passo, esempi, controllo finale ed errori comuni.')+'"><link rel="canonical" href="'+url+'"><title>'+esc('Come usare '+name+' passo passo | PROJECT-X')+'</title><style>'+baseCss()+'</style></head><body>'+
    '<header class="top"><div class="wrap nav"><div class="logo">PROJECT-<b>X</b></div><a href="/tutorials.html">← Tutti i tutorial</a></div></header>'+
    '<section class="hero"><div class="wrap"><div class="eyebrow">GUIDA PROJECT-X · '+esc(cat(tool))+'</div><h1>Come usare '+esc(name)+'<br><span class="grad">passo dopo passo</span></h1>'+
    '<p>'+esc(intro[0])+'</p><div class="chips"><span class="chip">Tempo indicativo: 20–45 min</span><span class="chip">'+steps.length+' passaggi</span><span class="chip">Livello: facile</span><span class="chip">Versione Web</span></div></div></section>'+
    '<main class="page"><div class="wrap grid"><article class="article">'+indexHtml(toc)+
    '<section id="prima" class="card section"><div class="eyebrow">PRIMA DI INIZIARE</div><h2>Prima di cominciare, facciamo chiarezza</h2>'+
    intro.slice(1).map(function(p){return '<p>'+esc(p)+'</p>';}).join('')+
    factsHtml([
      ['COSA TI SERVE',d.prepare||'Un solo caso di prova e i dati minimi necessari.'],
      ['DOVE CERCARE',d.menu||tool.category||'Area principale'],
      ['OBIETTIVO',d.result||'Un primo processo funzionante e verificabile.']
    ])+
    '<div class="leadbox"><b>Nota importante</b><span>'+esc(platformNote(tool))+' Le etichette possono cambiare: quando accade, cerca la funzione equivalente senza modificare l’obiettivo del passaggio.</span></div></section>'+
    '<section id="procedura" class="card section" style="margin-top:20px"><div class="eyebrow">PROCEDURA</div><h2>Adesso facciamolo davvero</h2><p>Non limitarti a leggere: completa un passaggio alla volta. Dopo ogni operazione fermati e verifica il risultato indicato.</p>'+
    toolStepHtml(steps)+visual(tool,d)+'</section>'+
    '<section id="controllo" class="checklist"><h2>✓ Controllo finale</h2><ul><li>Hai completato il caso di prova dall’inizio alla fine.</li><li>Il risultato finale corrisponde a quello definito prima di iniziare.</li><li>Hai verificato che il workflow non generi duplicati o passaggi inattesi.</li><li>Sai spiegare a un’altra persona cosa succede quando arriva un nuovo caso.</li><li>Hai annotato almeno una misura prima/dopo: tempo, errori o passaggi manuali.</li></ul></section>'+
    '<section id="dopo" class="cta"><h2>La parte difficile è fatta.</h2><p>Adesso non aggiungere altre funzioni a caso. Replica il processo su pochi casi reali, misura il risultato e solo dopo amplia il sistema.</p><a class="btn" href="/simulator.html">Misura il valore del workflow →</a></section>'+
    (related.length?'<section class="card related"><h2>Continua da qui</h2>'+related.map(function(t){return '<a href="/guide/'+slug(t.id)+'.html"><b>'+esc(t.name)+'</b><span>'+esc(t.category||'Software')+'</span></a>';}).join('')+'</section>':'')+
    '</article><aside class="side"><div class="sidecard"><h3>Sei qui</h3>'+toc.map(function(x){return '<a href="#'+x.id+'">'+esc(x.title)+'</a>';}).join('')+'<div class="pill">'+steps.length+' passaggi guidati</div></div><div class="sidecard"><h3>Missione</h3><p>'+esc((tut&&tut.mission)||'Fai funzionare bene un solo processo prima di aggiungere complessità.')+'</p></div><div class="sidecard"><h3>PROJECT-X</h3><p>La guida spiega il processo. Il motore decisionale ti aiuta a capire quale configurazione usare per il tuo caso.</p></div></aside></div></main><footer>PROJECT-X · Guide operative · contenuti generati dal catalogo e dalla libreria tutorial.</footer></body></html>';
}

function goalPage(g,goals){
  const steps=Array.isArray(g.steps)?g.steps:[];
  const url=BASE_URL+'/guide/'+slug(g.id)+'.html';
  const toc=[{id:'prima',title:'Prima di iniziare'},{id:'procedura',title:'Procedura passo passo'},{id:'controllo',title:'Controllo finale'},{id:'dopo',title:'Cosa fare dopo'}];
  const related=(goals||[]).filter(function(x){return x&&x.id!==g.id}).slice(0,5);
  return '<!doctype html><html lang="it"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="'+esc(g.mission+' '+g.focus)+'"><link rel="canonical" href="'+url+'"><title>'+esc(g.title)+' | PROJECT-X</title><style>'+baseCss()+'</style></head><body>'+
    '<header class="top"><div class="wrap nav"><div class="logo">PROJECT-<b>X</b></div><a href="/">← Torna a PROJECT-X</a></div></header>'+
    '<section class="hero"><div class="wrap"><div class="eyebrow">GUIDA PROJECT-X · '+esc(g.category)+'</div><h1>'+esc(g.title)+'<br><span class="grad">facciamolo insieme</span></h1><p>'+esc(g.scenario)+'</p><div class="chips"><span class="chip">'+steps.length+' passaggi</span><span class="chip">Tempo indicativo: 20–45 min</span><span class="chip">Livello: facile</span><span class="chip">Caso pilota</span></div></div></section>'+
    '<main class="page"><div class="wrap grid"><article class="article">'+indexHtml(toc)+
    '<section id="prima" class="card section"><div class="eyebrow">PRIMA DI INIZIARE</div><h2>Prima di toccare il software, definiamo il risultato</h2><p>'+esc(g.mission)+'</p><p>'+esc(g.why)+'</p>'+
    factsHtml([['PARTENZA',g.input||'Un caso reale piccolo e rappresentativo.'],['STACK',(g.stack||[]).join(' → ')||'Lo stack verrà definito durante l’analisi.'],['RISULTATO',g.result||'Un primo workflow funzionante.']])+
    '<div class="leadbox"><b>La regola di questa guida</b><span>Prima facciamo funzionare un caso. Poi lo replichiamo. Solo alla fine aggiungiamo automazioni più complesse.</span></div></section>'+
    '<section id="procedura" class="card section" style="margin-top:20px"><div class="eyebrow">PROCEDURA</div><h2>Passo dopo passo</h2><p>'+esc(g.setup||'Segui i passaggi in ordine e verifica ogni risultato prima di proseguire.')+'</p>'+toolStepHtml(steps)+'</section>'+
    '<section id="controllo" class="checklist"><h2>✓ Prima di considerarlo davvero pronto</h2><ul><li>Il caso pilota attraversa l’intero percorso.</li><li>Hai controllato sia il caso che deve passare sia quello che non deve passare, quando previsto.</li><li>Hai verificato destinatari, dati e condizioni prima dell’attivazione.</li><li>Puoi misurare il tempo o gli errori prima e dopo.</li><li>Il processo è abbastanza chiaro da poter essere spiegato a un’altra persona.</li></ul></section>'+
    '<section id="dopo" class="cta"><h2>Adesso trasformiamo il test in sistema.</h2><p>'+esc(g.result)+'</p><a class="btn" href="/?case='+encodeURIComponent(g.caseKey||'zero')+'">Continua con la mia analisi →</a></section>'+
    (related.length?'<section class="card related"><h2>Altri obiettivi</h2>'+related.map(function(x){return '<a href="/guide/'+slug(x.id)+'.html"><b>'+esc(x.title)+'</b><span>'+esc(x.category||'PROJECT-X')+'</span></a>';}).join('')+'</section>':'')+
    '</article><aside class="side"><div class="sidecard"><h3>Sei qui</h3>'+toc.map(function(x){return '<a href="#'+x.id+'">'+esc(x.title)+'</a>';}).join('')+'<div class="pill">'+steps.length+' passi</div></div><div class="sidecard"><h3>Obiettivo</h3><p>'+esc(g.mission)+'</p></div><div class="sidecard"><h3>Focus</h3><p>'+esc(g.focus)+'</p></div></aside></div></main><footer>PROJECT-X · Guide operative per obiettivi · contenuti generati automaticamente.</footer></body></html>';
}

function updateSitemap(ids,goalIds){
  const file=path.join(ROOT,'sitemap.xml');
  let xml=fs.readFileSync(file,'utf8');
  xml=xml.replace(/\s*<url><loc>[^<]*\/guide\/[^<]*<\/loc><lastmod>[^<]*<\/lastmod><priority>[^<]*<\/priority><\/url>/g,'');
  const today=new Date().toISOString().slice(0,10);
  const toolEntries=ids.map(function(id){return '  <url><loc>'+BASE_URL+'/guide/'+slug(id)+'.html</loc><lastmod>'+today+'</lastmod><priority>0.72</priority></url>';}).join('\n');
  const goalEntries=(goalIds||[]).map(function(id){return '  <url><loc>'+BASE_URL+'/guide/'+slug(id)+'.html</loc><lastmod>'+today+'</lastmod><priority>0.82</priority></url>';}).join('\n');
  xml=xml.replace('</urlset>',toolEntries+'\n'+goalEntries+'\n</urlset>');
  fs.writeFileSync(file,xml);
}

function main(){
  const data=loadProjectData();
  if(!data.db.length) throw new Error('SOFTWARE_DATABASE vuoto o non caricabile.');
  fs.mkdirSync(OUT,{recursive:true});

  const ids=[];
  data.db.forEach(function(tool){
    const id=slug(tool.id);
    if(!id)return;
    const tut=toolTutorial(tool,data.tutorials);
    const d=detailedTutorial(tool,data.detailed);
    if(!d)return;
    fs.writeFileSync(path.join(OUT,id+'.html'),toolPage(tool,tut,d,data.db),'utf8');
    ids.push(tool.id);
  });

  const goalIds=data.goals&&data.goals.keys?data.goals.keys():[];
  const goalObjects=goalIds.map(function(id){return data.goals.get(id);}).filter(Boolean);
  goalObjects.forEach(function(g){
    fs.writeFileSync(path.join(OUT,slug(g.id)+'.html'),goalPage(g,goalObjects),'utf8');
  });

  updateSitemap(ids,goalIds);
  console.log('PROJECT-X editorial guides generated:',ids.length,'software +',goalObjects.length,'goal guides');
}

main();
