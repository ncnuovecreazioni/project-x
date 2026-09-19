/* PROJECT-X — PRACTICAL EXAMPLES LAYER
   Turns the selected tool tutorial into a concrete mini-workflow.
*/
(function(){
  'use strict';
  if(window.__PROJECTX_PRACTICAL__) return;
  window.__PROJECTX_PRACTICAL__=true;

  function esc(s){
    return String(s==null?'':s).replace(/[&<>"']/g,function(c){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
    });
  }

  function pick(r){
    return r&&(r.primaryTool||r.primary||(r.rankedTools&&r.rankedTools[0]))||null;
  }

  function category(p){
    var text=(String(p.category||'')+' '+String(p.name||'')).toLowerCase();
    if(/crm|sales|pipeline|client/.test(text)) return 'crm';
    if(/marketing|email|campaign|automation/.test(text) && !/n8n|zapier|make|power automate/.test(text)) return 'marketing';
    if(/e-commerce|ecommerce|shop|store/.test(text)) return 'ecommerce';
    if(/automation|make|zapier|n8n|power automate/.test(text)) return 'automation';
    if(/project|task|work management|productivity/.test(text)) return 'projects';
    return 'general';
  }

  function getData(p,a){
    var type=category(p);
    var pain=String(a.painPoint||'').trim();
    var name=String(p.name||p.id||'questo strumento');
    var examples={
      crm:{
        title:'Da richiesta a follow-up automatico',
        input:'Arriva una nuova richiesta cliente.',
        action:'Crea il contatto, assegnagli uno stato e genera automaticamente la prossima attività.',
        output:'Il cliente compare nella pipeline e sai subito chi richiamare e quando.',
        checks:['Crea 1 contatto di prova','Imposta il primo stato','Genera una sola attività di follow-up']
      },
      marketing:{
        title:'Da nuovo contatto a prima comunicazione',
        input:'Una persona lascia i propri dati.',
        action:'Inseriscila nel gruppo corretto e invia una prima email automatica.',
        output:'La prima comunicazione parte senza doverla inviare a mano.',
        checks:['Usa un contatto di test','Collega un solo trigger','Controlla che parta una sola email']
      },
      ecommerce:{
        title:'Da ordine a post-acquisto',
        input:'Viene ricevuto un nuovo ordine.',
        action:'Usa l’evento ordine per avviare una sola comunicazione o attività post-acquisto.',
        output:'Il passaggio successivo parte automaticamente e puoi controllarlo.',
        checks:['Fai un ordine di prova','Verifica il trigger','Controlla l’azione generata']
      },
      automation:{
        title:'Da evento a risultato senza copia-incolla',
        input:'Un dato nuovo entra nel tuo lavoro, per esempio una riga Excel o una richiesta.',
        action:'Fai partire il workflow, filtra solo ciò che serve e crea l’azione successiva.',
        output:'Il passaggio ripetitivo viene eseguito dal sistema.',
        checks:['Scegli un solo trigger','Trasferisci solo i dati necessari','Fai un test completo']
      },
      projects:{
        title:'Da richiesta a attività assegnata',
        input:'Arriva una nuova attività o richiesta.',
        action:'Crea il task, assegna un responsabile e imposta la scadenza.',
        output:'Il lavoro entra subito nel flusso giusto senza essere perso.',
        checks:['Crea 1 attività reale','Assegna un responsabile','Imposta una scadenza']
      },
      general:{
        title:'Da problema a primo workflow',
        input:'Hai un’attività ripetitiva descritta nel risultato.',
        action:'Definisci input, passaggio centrale, controllo e risultato.',
        output:'Hai un primo processo ripetibile che puoi testare e migliorare.',
        checks:['Scegli un caso reale piccolo','Definisci il risultato','Fai una prova completa']
      }
    };

    var d=examples[type]||examples.general;
    if(pain){
      d=JSON.parse(JSON.stringify(d));
      d.input='Caso reale: '+pain;
    }
    return d;
  }

  function inject(){
    var guide=document.getElementById('px-execution-guide');
    if(!guide || guide.dataset.pxPractical==='1') return;
    if(!window.ProjectXUI || !window.ProjectXUI.result) return;

    var r=null;
    try{
      r=window.ProjectXUI.result();
    }catch(e){}
    var p=pick(r);
    if(!p) return;

    guide.dataset.pxPractical='1';

    var a={};
    try{
      a=JSON.parse(localStorage.getItem('projectx_answers_v2')||'{}');
    }catch(e){}

    var d=getData(p,a);
    var key='projectx_practical_'+String(p.id||p.name||'tool').toLowerCase().replace(/[^a-z0-9_-]+/g,'_');
    var saved={};
    try{saved=JSON.parse(localStorage.getItem(key)||'{}')}catch(e){}
    var url=String(p.url||p.pricingUrl||'');
    var affiliateIds={systeme:1,pipedrive:1,getresponse:1,activecampaign:1,hubspot:1,shopify:1,make:1,brevo:1,monday:1,semrush:1,kit:1};
    var toolId=String(p.id||'').toLowerCase().trim();
    var linkUrl=affiliateIds[toolId]
      ? '/api/affiliate?tool='+encodeURIComponent(toolId)+'&source=practical-guide'
      : url;
    var link=/^https?:\/\//i.test(linkUrl) || /^\/api\/affiliate\?tool=/i.test(linkUrl)
      ? '<a class="px-practical-open" href="'+esc(linkUrl)+'" target="_blank" rel="noopener noreferrer">Apri '+esc(p.name||p.id)+' ↗</a>'
      : '';

    var box=document.createElement('section');
    box.className='px-practical';
    box.setAttribute('aria-label','Esempio pratico');

    box.innerHTML=
      '<div class="px-practical-head">'+
        '<div><div class="px-practical-kicker">✦ ESEMPIO PRATICO</div>'+
        '<div class="px-practical-title">'+esc(d.title)+'</div>'+
        '<p class="px-practical-copy">Non limitarti a leggere il tutorial: questo è il primo caso concreto da provare con <strong>'+esc(p.name||p.id)+'</strong>.</p></div>'+
        (link?'<div>'+link+'</div>':'')+
      '</div>'+
      '<div class="px-practical-flow">'+
        '<div class="px-practical-step"><span>01 · INPUT</span><strong>'+esc(d.input)+'</strong></div>'+
        '<div class="px-practical-arrow">→</div>'+
        '<div class="px-practical-step focus"><span>02 · COSA FAI</span><strong>'+esc(d.action)+'</strong></div>'+
        '<div class="px-practical-arrow">→</div>'+
        '<div class="px-practical-step done"><span>03 · RISULTATO</span><strong>'+esc(d.output)+'</strong></div>'+
      '</div>'+
      '<div class="px-practical-check"><div><b>PROVA IN 10 MINUTI</b><span>Parti con un solo caso. Non configurare tutto il software.</span></div>'+
      '<div class="px-practical-list">'+d.checks.map(function(x,i){return '<label><input type="checkbox" data-i="'+i+'"><span>'+esc(x)+'</span></label>';}).join('')+'</div></div>';

    guide.appendChild(box);

    box.querySelectorAll('input[type="checkbox"]').forEach(function(cb){
      var idx=cb.getAttribute('data-i')||'0';
      cb.checked=!!saved[idx];
      cb.parentNode.classList.toggle('done',cb.checked);
      cb.addEventListener('change',function(){
        saved[idx]=!!cb.checked;
        try{localStorage.setItem(key,JSON.stringify(saved))}catch(e){}
        cb.parentNode.classList.toggle('done',cb.checked);
      });
    });
  }

  var observer=new MutationObserver(function(){setTimeout(inject,30);});

  function start(){
    observer.observe(document.body,{subtree:true,childList:true});
    setTimeout(inject,250);
    setTimeout(inject,1200);
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();