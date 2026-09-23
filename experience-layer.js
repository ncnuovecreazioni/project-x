/* PROJECT-X EXPERIENCE LAYER
   Turns the decision engine into a simple journey:
   problem -> system -> simulation -> action -> guide.
   No API dependency. Safe to load after the existing UI layers.
*/
(function(){
  'use strict';

  function $(id){ return document.getElementById(id); }
  function esc(v){
    return String(v==null?'':v).replace(/[&<>"']/g,function(c){
      return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c];
    });
  }
  function primary(result){
    return result && (result.primary || (result.ranking||[])[0] || (result.stack||[])[0]) || null;
  }
  function toolName(t){
    if(!t) return 'il tuo strumento principale';
    return t.name || t.title || t.label || t.id || 'strumento principale';
  }
  function currentProblem(){
    var q=$('quickProblem');
    if(q && q.value.trim()) return q.value.trim();
    try{
      var p=window.ProjectXUI && window.ProjectXUI.getResult && window.ProjectXUI.getResult();
      if(p && p.answers && p.answers.painPoint) return p.answers.painPoint;
    }catch(e){}
    return 'Il tuo processo operativo';
  }
  function scenario(text){
    var s=String(text||'').toLowerCase();
    if(/preventiv|offert|quote/.test(s)) return {
      key:'preventivi',
      before:['Richiesta cliente','Copia dati in Excel','Preparo il preventivo','Invio email','Ricordo il follow-up'],
      after:['Richiesta cliente','DATI RACCOLTI','Preventivo pronto','Email inviata','Follow-up automatico'],
      tasks:[
        ['Raccolta dati','Ogni richiesta','Porta i dati in un unico punto prima del preventivo.'],
        ['Creazione preventivo','Per ogni richiesta','Prepara il documento partendo da un modello.'],
        ['Follow-up','Dopo 2–5 giorni','Genera un promemoria senza dipendere dalla memoria.']
      ]
    };
    if(/email|posta|messagg|follow.?up|richiam/.test(s)) return {
      key:'email',
      before:['Arriva una richiesta','Leggo l’email','Copio le informazioni','Rispondo','Mi ricordo del follow-up'],
      after:['Arriva una richiesta','DATI CLASSIFICATI','Risposta guidata','Attività creata','Follow-up automatico'],
      tasks:[
        ['Classificazione email','Ogni richiesta','Identifica tipo di richiesta e prossima azione.'],
        ['Creazione attività','Dopo la risposta','Trasforma una conversazione in una cosa da fare.'],
        ['Follow-up','A scadenza','Ricorda o avvia il contatto successivo.']
      ]
    };
    if(/excel|foglio|copia.?incolla|dati/.test(s)) return {
      key:'excel',
      before:['Arrivano i dati','Copio e incollo','Controllo righe','Aggiorno il file','Avviso qualcuno'],
      after:['Arrivano i dati','DATI VALIDATI','File aggiornato','Controllo mirato','Notifica automatica'],
      tasks:[
        ['Raccolta dati','Ogni inserimento','Centralizza il dato invece di ricopiarlo.'],
        ['Controlli','A ogni aggiornamento','Evidenzia solo le anomalie da verificare.'],
        ['Notifiche','Quando serve','Avvisa la persona giusta quando il dato cambia.']
      ]
    };
    if(/ordine|e.?commerce|shop|negozio online|spedizion/.test(s)) return {
      key:'ecommerce',
      before:['Nuovo ordine','Controllo manuale','Aggiorno cliente','Gestisco assistenza','Follow-up post vendita'],
      after:['Nuovo ordine','ORDINE RICONOSCIUTO','Cliente aggiornato','Assistenza organizzata','Follow-up automatico'],
      tasks:[
        ['Aggiornamento cliente','Per ogni ordine','Aggiorna automaticamente lo stato della relazione.'],
        ['Comunicazioni','Eventi chiave','Invia il messaggio giusto al momento giusto.'],
        ['Post-vendita','Dopo la consegna','Avvia una sequenza di follow-up.']
      ]
    };
    if(/document|pdf|file|contratt|archiv/.test(s)) return {
      key:'documenti',
      before:['Ricevo un documento','Lo salvo','Cerco informazioni','Rinomino','Lo inoltro'],
      after:['Ricevo un documento','DOCUMENTO CLASSIFICATO','Dati estratti','Archivio ordinato','Persona avvisata'],
      tasks:[
        ['Classificazione','Ogni documento','Capisci tipo e destinazione del file.'],
        ['Estrazione dati','Quando serve','Porta le informazioni operative nel sistema.'],
        ['Archiviazione','Subito','Riduci salvataggi e rinomina manuale.']
      ]
    };
    return {
      key:'generico',
      before:['Ricevo una richiesta','Cerco informazioni','Copio dati','Faccio il passaggio manuale','Ricordo la prossima attività'],
      after:['Ricevo una richiesta','DATI ORGANIZZATI','Sistema aggiornato','PASSAGGIO AUTOMATICO','Prossima attività pronta'],
      tasks:[
        ['Raccolta','Ogni volta','Porta le informazioni in un punto controllabile.'],
        ['Passaggio ripetitivo','Quando accade','Elimina il copia-incolla dove ha senso.'],
        ['Follow-up','A scadenza','Crea la prossima azione automaticamente.']
      ]
    };
  }

  function injectCSS(){
    if($('px-experience-style')) return;
    var s=document.createElement('style');
    s.id='px-experience-style';
    s.textContent = [
      '.px-experience{margin:0 0 15px;display:grid;grid-template-columns:1.04fr .96fr;gap:13px}',
      '.px-exp-card{position:relative;overflow:hidden;padding:22px;border:1px solid rgba(255,255,255,.085);border-radius:24px;background:linear-gradient(145deg,rgba(16,23,40,.96),rgba(8,12,22,.98));box-shadow:0 24px 70px rgba(0,0,0,.2)}',
      '.px-exp-card:after{content:"";position:absolute;width:220px;height:220px;right:-125px;top:-135px;border-radius:50%;background:radial-gradient(circle,rgba(124,92,255,.12),transparent 68%);pointer-events:none}',
      '.px-exp-kicker{font-size:9px;font-weight:950;letter-spacing:.15em;color:#a99dff;text-transform:uppercase}',
      '.px-exp-title{font-size:24px;font-weight:950;letter-spacing:-.045em;line-height:1.04;margin:9px 0 7px}',
      '.px-exp-copy{margin:0;color:#96a3b8;font-size:11px;line-height:1.58}',
      '.px-exp-flow{display:grid;grid-template-columns:1fr 24px 1fr;gap:7px;align-items:stretch;margin-top:15px}',
      '.px-exp-node{padding:12px;border:1px solid rgba(255,255,255,.07);border-radius:14px;background:rgba(255,255,255,.018)}',
      '.px-exp-node b{display:block;font-size:10px;color:#e5e9f2}.px-exp-node span{display:block;margin-top:5px;color:#75829a;font-size:9px;line-height:1.4}',
      '.px-exp-arrow{display:grid;place-items:center;color:#7c5cff;font-weight:900}',
      '.px-exp-chip{display:inline-flex;padding:6px 8px;border-radius:999px;background:rgba(124,92,255,.07);border:1px solid rgba(124,92,255,.15);color:#c7bdff;font-size:8px;font-weight:900;margin-top:10px}',
      '.px-exp-steps{display:grid;gap:7px;margin-top:13px}',
      '.px-exp-step{display:grid;grid-template-columns:25px 1fr;gap:8px;align-items:center;padding:8px 9px;border:1px solid rgba(255,255,255,.06);border-radius:11px;background:rgba(255,255,255,.015)}',
      '.px-exp-step i{width:24px;height:24px;display:grid;place-items:center;border-radius:8px;background:rgba(54,217,157,.08);color:#79e8bc;font-size:8px;font-style:normal;font-weight:950}',
      '.px-exp-step span{font-size:9px;color:#cfd6e4;line-height:1.4}',
      '.px-exp-after{margin-top:12px;padding:11px 12px;border:1px solid rgba(54,217,157,.13);background:rgba(54,217,157,.035);border-radius:12px;color:#92a0b6;font-size:9px;line-height:1.5}',
      '.px-auto-section{margin:0 0 15px;padding:22px;border:1px solid rgba(54,217,157,.12);border-radius:24px;background:linear-gradient(145deg,rgba(12,25,27,.82),rgba(8,15,22,.97))}',
      '.px-auto-head{display:flex;justify-content:space-between;align-items:end;gap:12px;margin-bottom:13px}',
      '.px-auto-head h3{margin:0;font-size:21px;letter-spacing:-.04em}.px-auto-head p{margin:5px 0 0;color:#8290a6;font-size:10px;line-height:1.45}',
      '.px-auto-list{display:grid;grid-template-columns:repeat(3,1fr);gap:9px}',
      '.px-auto{display:flex;flex-direction:column;min-height:170px;padding:14px;border:1px solid rgba(255,255,255,.07);border-radius:15px;background:rgba(255,255,255,.018)}',
      '.px-auto-num{font-size:8px;font-weight:950;color:#74e5b9}.px-auto h4{margin:8px 0 5px;font-size:12px}.px-auto small{color:#76849b;font-size:9px;line-height:1.48;min-height:39px}',
      '.px-auto-meta{margin-top:9px;color:#a8b3c5;font-size:8px;font-weight:900}.px-auto a{margin-top:auto;text-align:center;text-decoration:none;padding:9px 10px;border-radius:10px;background:rgba(124,92,255,.10);border:1px solid rgba(124,92,255,.20);color:#d4ceff;font-size:8px;font-weight:950}',
      '.px-guide-card{margin:0 0 15px;padding:21px;border:1px solid rgba(124,92,255,.17);border-radius:22px;background:linear-gradient(145deg,rgba(16,22,40,.88),rgba(8,12,22,.98));display:grid;grid-template-columns:1fr auto;gap:16px;align-items:center}',
      '.px-guide-kicker{font-size:8px;letter-spacing:.14em;font-weight:950;color:#a99dff}.px-guide-title{margin:6px 0 4px;font-size:20px;font-weight:950;letter-spacing:-.04em}.px-guide-copy{margin:0;color:#8390a5;font-size:10px;line-height:1.5}',
      '.px-guide-steps{display:flex;gap:6px;flex-wrap:wrap;margin-top:11px}.px-guide-step{padding:7px 9px;border-radius:9px;background:rgba(255,255,255,.025);border:1px solid rgba(255,255,255,.06);color:#b1bbcb;font-size:8px;font-weight:800}',
      '.px-guide-actions{display:flex;gap:8px;flex-wrap:wrap}.px-guide-actions a{display:inline-flex;align-items:center;justify-content:center;padding:11px 14px;border-radius:12px;text-decoration:none;font-size:9px;font-weight:950}.px-guide-primary{color:#fff;background:linear-gradient(135deg,#7c5cff,#5b8cff);box-shadow:0 12px 28px rgba(124,92,255,.2)}.px-guide-secondary{color:#dce3ef;background:rgba(255,255,255,.035);border:1px solid rgba(255,255,255,.08)}',
      '.px-home-hint{margin-top:9px;text-align:center;color:#738098;font-size:9px}',
      '@media(max-width:760px){.px-experience{grid-template-columns:1fr}.px-auto-list{grid-template-columns:1fr}.px-guide-card{grid-template-columns:1fr}.px-guide-actions a{flex:1}.px-exp-flow{grid-template-columns:1fr}.px-exp-arrow{transform:rotate(90deg);min-height:10px}}'
    ].join('');
    document.head.appendChild(s);
  }

  function updateHome(){
    var head=document.querySelector('.quickhead b');
    var sub=document.querySelector('.quickhead span');
    var ta=$('quickProblem');
    if(head) head.textContent='✦ Dimmi cosa vuoi sistemare';
    if(sub) sub.textContent='Scrivilo come lo diresti a un collega';
    if(ta) ta.placeholder='Esempio: perdo ore con email, preventivi e follow-up e vorrei che il lavoro ripetitivo si facesse da solo…';

    if(ta && !document.querySelector('.px-home-hint')){
      var hint=document.createElement('div');
      hint.className='px-home-hint';
      hint.innerHTML='Non devi conoscere il software giusto. <b style="color:#bdc6d7">Partiamo dal problema.</b>';
      ta.parentNode.insertBefore(hint,ta.nextSibling);
    }

    var full=$('fullBtn');
    if(full) full.textContent='Analisi completa →';
    var demo=$('demoBtn');
    if(demo) demo.textContent='Guarda cosa costruire →';
  }

  function buildExperience(){
    var results=$('results');
    var primaryMount=$('primaryMount');
    if(!results || !primaryMount || primaryMount.dataset.pxExperienceBuilt==='1') return;
    var ui=window.ProjectXUI;
    if(!ui || !ui.getResult) return;
    var result=ui.getResult();
    if(!result) return;

    primaryMount.dataset.pxExperienceBuilt='1';
    var p=primary(result);
    var sc=scenario(currentProblem());
    var tool=toolName(p);

    var wrap=document.createElement('div');
    wrap.className='px-experience';
    wrap.innerHTML=
      '<div class="px-exp-card">'+
        '<div class="px-exp-kicker">PRIMA · COME SUCCEDE OGGI</div>'+
        '<div class="px-exp-title">Il tuo lavoro non dovrebbe vivere tra 5 passaggi manuali.</div>'+
        '<p class="px-exp-copy">PROJECT-X parte da quello che hai descritto e rende visibile dove stai perdendo tempo.</p>'+
        '<div class="px-exp-steps">'+sc.before.map(function(x,i){return '<div class="px-exp-step"><i>'+(i+1)+'</i><span>'+esc(x)+'</span></div>';}).join('')+'</div>'+
      '</div>'+
      '<div class="px-exp-card">'+
        '<div class="px-exp-kicker" style="color:#72e5b6">DOPO · IL SISTEMA</div>'+
        '<div class="px-exp-title">Un flusso più semplice, con il lavoro ripetitivo fuori dal centro.</div>'+
        '<p class="px-exp-copy">Non serve aggiungere strumenti a caso: prima costruiamo il passaggio che produce il risultato.</p>'+
        '<div class="px-exp-flow"><div class="px-exp-node"><b>INPUT</b><span>'+esc(sc.after[0])+'</span></div><div class="px-exp-arrow">→</div><div class="px-exp-node"><b>OUTPUT</b><span>'+esc(sc.after[sc.after.length-1])+'</span></div></div>'+
        '<div class="px-exp-chip">NUCLEO: '+esc(tool)+'</div>'+
        '<div class="px-exp-after"><b style="color:#7ce8bd">Cosa cambia:</b> '+esc(sc.after.slice(1,-1).join(' → '))+'</div>'+
      '</div>';

    primaryMount.parentNode.insertBefore(wrap,primaryMount.nextSibling);

    var autos=document.createElement('div');
    autos.className='px-auto-section';
    autos.innerHTML=
      '<div class="px-auto-head"><div><h3>🤖 Le prime 3 automazioni da valutare</h3><p>Parti da ciò che si ripete. Ogni automazione apre il simulatore, non un nuovo labirinto di software.</p></div><span class="px-exp-chip" style="margin:0">PRIMA AUTOMAZIONE, POI COMPLESSITÀ</span></div>'+
      '<div class="px-auto-list">'+sc.tasks.map(function(t,i){
        return '<article class="px-auto"><div class="px-auto-num">0'+(i+1)+'</div><h4>'+esc(t[0])+'</h4><small>'+esc(t[2])+'</small><div class="px-auto-meta">↻ '+esc(t[1])+'</div><a href="/simulator.html?automation='+encodeURIComponent(t[0])+'">SIMULA QUESTA →</a></article>';
      }).join('')+
      '</div>';

    wrap.after(autos);

    var guide=document.createElement('div');
    guide.className='px-guide-card';
    var tid=p && (p.id||p.slug||'') || '';
    var goalMap={
      preventivi:'automatizzare-preventivi',
      email:'automatizzare-follow-up-email',
      clienti:'gestire-clienti',
      excel:'automatizzare-excel',
      ecommerce:'gestire-ecommerce',
      progetti:'organizzare-progetti',
      documenti:'gestire-documenti',
      appuntamenti:'automatizzare-appuntamenti',
      automazioni:'creare-workflow',
      crm:'scegliere-crm',
      ai:'usare-ai-al-lavoro',
      marketing:'automatizzare-follow-up-email'
    };
    var goalSlug=goalMap[sc.key]||'';
    var goalHref=goalSlug?'/guide/'+goalSlug+'.html':'/tutorial.html?tool='+encodeURIComponent(tid);
    var guideTitle=goalSlug?'La guida esatta per il problema che hai descritto.':'Non lasciare il sistema sulla carta.';
    var guideCopy=goalSlug?'Non devi partire dal software. Parti dal risultato e segui un caso pilota, un passo alla volta.':'Hai una direzione. Ora PROJECT-X ti accompagna nei primi minuti di configurazione di <b style="color:#eef2fb">'+esc(tool)+'</b>.';
    var guideSteps=goalSlug?'① Definisci il risultato · ② Configura il minimo · ③ Fai il test · ④ Replica':'① Apri lo strumento · ② Configura il nucleo · ③ Attiva il primo workflow';
    guide.innerHTML=
      '<div><div class="px-guide-kicker">DAL RISULTATO ALL’AZIONE</div>'+
      '<div class="px-guide-title">'+guideTitle+'</div>'+
      '<p class="px-guide-copy">'+guideCopy+'</p>'+
      '<div class="px-guide-steps"><span class="px-guide-step">'+guideSteps+'</span><span class="px-guide-step">🧭 PROJECT-X ti segue passo per passo</span></div></div>'+
      '<div class="px-guide-actions"><a class="px-guide-primary" href="'+goalHref+'">INIZIA LA GUIDA →</a><a class="px-guide-secondary" href="/workspace.html">APRI WORKSPACE</a></div>';

    autos.after(guide);
  }

  function observe(){
    var results=$('results');
    if(!results) return;
    var mo=new MutationObserver(function(){
      if(!$('results').hidden) {
        setTimeout(buildExperience,20);
      }
    });
    mo.observe(results,{subtree:true,childList:true,attributes:true,attributeFilter:['hidden']});
    setTimeout(buildExperience,150);
  }

  injectCSS();
  updateHome();
  observe();

  window.ProjectXExperience={refresh:function(){try{if($('primaryMount'))$('primaryMount').dataset.pxExperienceBuilt='';buildExperience();}catch(e){}}};
})();