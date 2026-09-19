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
    var a=answers(),goal=goalSummary(a);
    var key=toolKey(tool), type=categoryType(tool);
    var integrations=Array.isArray(tool&&tool.integrations)?tool.integrations:[];
    var fallback={
      crm:{
        ui:'CRM / pipeline',
        setup:'Parti da un piccolo flusso clienti e rendi visibile la prossima azione.',
        flow:'Contatto → stato → prossima azione → follow-up → risultato',
        steps:[
          ['01','Apri il CRM','Entra nel software e apri l’area dedicata a clienti, contatti o opportunità.','Devi vedere chiaramente dove si trova ogni caso.'],
          ['02','Inserisci 3 casi reali','Crea o importa solo tre contatti reali.','Ogni caso deve avere nome, stato e prossimo passo.'],
          ['03','Costruisci il primo workflow','Trasforma il problema che hai descritto in una sequenza semplice.','Il flusso deve partire da un evento e arrivare a un risultato.'],
          ['04','Fai una prova completa','Esegui tutto con un caso reale e controlla ogni passaggio.','Se qualcosa non è chiaro, semplifica prima di automatizzare.'],
          ['05','Misura per una settimana','Conta tempo, attività dimenticate e passaggi manuali.','Il dato ti dirà cosa automatizzare dopo.']
        ]
      },
      marketing:{
        ui:'Audience + automazione',
        setup:'Crea un solo percorso di comunicazione collegato a un evento reale.',
        flow:'Contatto → trigger → messaggio → attesa → risultato',
        steps:[
          ['01','Crea un gruppo piccolo','Scegli un pubblico con lo stesso obiettivo.','Parti da pochi contatti e non da tutta la base.'],
          ['02','Prepara il messaggio','Crea una sola comunicazione collegata al problema reale.','Deve essere semplice da testare.'],
          ['03','Costruisci l’automazione','Collega il trigger al messaggio e, se serve, a una seconda azione.','Il primo percorso deve essere breve.'],
          ['04','Testa dall’inizio alla fine','Usa un contatto di prova e verifica trigger, tempi e uscita.','Controlla che il flusso parta una sola volta.'],
          ['05','Leggi un solo KPI','Scegli la metrica direttamente collegata al tuo obiettivo.','Migliora il punto che blocca il risultato.']
        ]
      },
      ecommerce:{
        ui:'Store + post-acquisto',
        setup:'Parti da un singolo evento dell’ordine e rendi automatico un passaggio utile.',
        flow:'Ordine → evento → azione → cliente → controllo',
        steps:[
          ['01','Controlla la base','Verifica che prodotti, clienti e ordini siano corretti.','Le automazioni funzionano solo se i dati di partenza sono affidabili.'],
          ['02','Scegli un evento','Scegli un evento semplice, come un nuovo ordine o un cambio di stato.','Deve essere facilmente verificabile.'],
          ['03','Crea una sola azione','Collega una comunicazione, una notifica o un’attività utile.','Un solo risultato per il primo test.'],
          ['04','Fai un ordine di prova','Segui tutto il percorso e verifica l’output.','Controlla che non partano azioni duplicate.'],
          ['05','Misura il lavoro evitato','Conta quanti passaggi manuali hai tolto.','Solo dopo estendi il workflow.']
        ]
      },
      automation:{
        ui:'Workflow builder',
        setup:'Scegli due strumenti e togli un solo passaggio manuale dal tuo processo.',
        flow:'Trigger → dati → logica → azione → verifica',
        steps:[
          ['01','Scegli sorgente e destinazione','Decidi quale strumento genera l’evento e quale deve ricevere il risultato.','Due strumenti sono sufficienti per il primo test.'],
          ['02','Configura il trigger','Imposta l’evento di partenza e prova che i dati arrivino correttamente.','Non andare avanti finché il test non è leggibile.'],
          ['03','Mappa i dati essenziali','Trasferisci solo i campi necessari all’azione.','Meno dati significa meno possibilità di errore.'],
          ['04','Crea l’azione','Crea il record, aggiorna il file o invia la notifica necessaria.','Fai subito un test reale.'],
          ['05','Controlla gli errori','Guarda esecuzioni e casi falliti prima di aggiungere altri passaggi.','La stabilità viene prima della complessità.']
        ]
      },
      projects:{
        ui:'Progetto + workflow',
        setup:'Rendi visibili attività, responsabili e scadenze in un solo progetto pilota.',
        flow:'Attività → responsabile → stato → scadenza → completamento',
        steps:[
          ['01','Crea il progetto pilota','Porta dentro un solo lavoro reale.','Deve avere un inizio e una fine chiari.'],
          ['02','Crea pochi stati','Usa da fare → in corso → fatto, poi aggiungi solo ciò che serve.','La struttura deve essere leggibile da tutti.'],
          ['03','Assegna il prossimo passo','Ogni attività deve avere responsabile e prossima azione.','Questo riduce il coordinamento manuale.'],
          ['04','Automatizza un passaggio','Per esempio una notifica al cambio di stato.','Testa prima una sola regola.'],
          ['05','Misura i blocchi','Controlla ritardi e attività ferme.','Riduci prima il collo di bottiglia più frequente.']
        ]
      },
      appointments:{
        ui:'Prenotazioni + calendario',
        setup:'Automatizza il percorso richiesta → disponibilità → conferma.',
        flow:'Richiesta → disponibilità → prenotazione → promemoria → appuntamento',
        steps:[
          ['01','Crea un tipo di appuntamento','Definisci un solo servizio prenotabile.','Durata e disponibilità devono essere chiare.'],
          ['02','Collega il calendario','Associa il calendario che usi davvero.','Controlla che gli slot occupati non vengano proposti.'],
          ['03','Configura conferma','Imposta la conferma della prenotazione.','Deve essere automatica e comprensibile.'],
          ['04','Aggiungi un promemoria','Scegli un solo promemoria utile.','Testa tempi e destinatario.'],
          ['05','Prova come cliente','Fai una prenotazione di test dall’inizio alla fine.','Il risultato corretto è zero coordinamento manuale.']
        ]
      },
      documents:{
        ui:'Document workspace',
        setup:'Crea un modello e una procedura di archiviazione semplice.',
        flow:'Richiesta → modello → documento → approvazione → archivio',
        steps:[
          ['01','Scegli il documento ricorrente','Parti da quello che crei più spesso.','Non cercare di standardizzare tutto insieme.'],
          ['02','Crea il modello','Imposta i campi che cambiano e lascia fissa la struttura.','Riduci il copia-incolla.'],
          ['03','Definisci il percorso','Stabilisci chi crea, chi controlla e dove si archivia.','Ogni passaggio deve avere un responsabile.'],
          ['04','Fai un documento di prova','Esegui il processo con un caso reale.','Controlla contenuto, nome file e posizione finale.'],
          ['05','Automatizza il gesto ripetitivo','Scegli un solo passaggio ripetitivo da automatizzare.','Poi misura il tempo risparmiato.']
        ]
      },
      general:{
        ui:'Workspace operativo',
        setup:'Parti dal problema che hai descritto e trasformalo in un processo ripetibile.',
        flow:'Input → lavoro → controllo → risultato',
        steps:[
          ['01','Definisci il risultato','Scrivi in una frase cosa deve essere ottenuto.','Una frase chiara evita configurazioni inutili.'],
          ['02','Porta dentro un caso reale','Usa un caso piccolo ma rappresentativo.','Il tutorial serve a costruire il primo esempio funzionante.'],
          ['03','Costruisci la sequenza','Individua input, lavoro, controllo e output.','Se manca un passaggio, il processo non è ancora pronto.'],
          ['04','Testa tutto','Esegui il flusso completo.','Correggi prima di aggiungere automazioni.'],
          ['05','Replica','Quando il primo caso funziona, applica lo stesso schema agli altri.','Solo a quel punto aumenta la complessità.']
        ]
      }
    };

    var specific={
      pipedrive:{type:'crm',ui:'Pipeline commerciale',setup:'Porta il problema dei follow-up dentro una pipeline semplice.',flow:'Lead → contatto → proposta → follow-up → chiuso'},
      hubspot:{type:'crm',ui:'CRM + follow-up',setup:'Parti da contatti e prossime attività, poi aggiungi automazioni.',flow:'Contatto → qualificazione → opportunità → follow-up → cliente'},
      close:{type:'crm',ui:'Sales workspace',setup:'Costruisci un flusso rapido orientato alla prossima azione.',flow:'Lead → contatto → follow-up → proposta → chiuso'},
      keap:{type:'crm',ui:'Clienti + automazioni',setup:'Usa il CRM come base e automatizza una comunicazione ricorrente.',flow:'Contatto → organizzazione → follow-up → cliente'},
      activecampaign:{type:'marketing',ui:'Automation builder',setup:'Crea un solo journey breve collegato al tuo obiettivo.',flow:'Trigger → messaggio → attesa → seconda azione → uscita'},
      getresponse:{type:'marketing',ui:'Automation workflow',setup:'Parti da un percorso email semplice e misurabile.',flow:'Contatto → email → attesa → follow-up → risultato'},
      mailchimp:{type:'marketing',ui:'Audience + automation',setup:'Organizza un’audience piccola e automatizza un solo percorso.',flow:'Contatto → segmento → email → follow-up → risultato'},
      shopify:{type:'ecommerce',ui:'Store + post-acquisto',setup:'Parti dall’ordine e automatizza una sola azione successiva.',flow:'Ordine → evento → comunicazione → cliente → controllo'},
      make:{type:'automation',ui:'Scenario builder',setup:'Collega due strumenti e elimina un solo passaggio manuale.',flow:'Trigger → dati → trasformazione → azione → verifica'},
      zapier:{type:'automation',ui:'Zap builder',setup:'Costruisci il primo Zap intorno all’evento che ripeti più spesso.',flow:'Trigger → dati → azione → verifica'},
      'power-automate':{type:'automation',ui:'Flow builder',setup:'Parti da un processo che già vivi in Microsoft 365.',flow:'Evento → dati → azione → Teams/Outlook/Excel'},
      n8n:{type:'automation',ui:'Workflow canvas',setup:'Disegna un workflow breve con input, logica e output.',flow:'Trigger → dati → logica → azione → controllo'},
      monday:{type:'projects',ui:'Board + workflow',setup:'Crea un board pilota con stati e responsabilità.',flow:'Attività → responsabile → stato → scadenza → completato'},
      clickup:{type:'projects',ui:'Workspace + automazioni',setup:'Parti da un progetto reale e da pochi stati.',flow:'Attività → responsabile → stato → automazione → completamento'},
      asana:{type:'projects',ui:'Project + workflow',setup:'Crea un progetto pilota e rendi chiari compiti e scadenze.',flow:'Task → responsabile → scadenza → stato → completato'},
      trello:{type:'projects',ui:'Board + card',setup:'Costruisci una bacheca minima per il flusso che crea più attrito.',flow:'Da fare → in corso → in attesa → fatto'},
      notion:{type:'projects',ui:'Workspace + database',setup:'Crea una pagina operativa e un solo database utile.',flow:'Informazione → database → attività → stato → risultato'}
    };

    var base=specific[key]||fallback[type]||fallback.general;
    var f=fallback[base.type||type]||fallback.general;
    var steps=[];
    var raw=(specific[key]&&specific[key].steps)||f.steps;
    for(var i=0;i<raw.length;i++) steps.push([raw[i][0],raw[i][1],raw[i][2],raw[i][3]]);
    var g=String(goal.goal||'').toLowerCase();
    if(base.type==='crm' && /preventivi|vendite|follow-up|clienti/.test(g)){
      steps[2]=['03','Imposta la prossima azione','Per ogni caso attivo indica cosa succede dopo: richiamo, email, proposta o attività.','Il controllo è semplice: nessun caso attivo senza un prossimo passo.'];
    }
    if(base.type==='automation'){
      steps[2]=['03','Automatizza il collo di bottiglia','Scegli il passaggio ripetitivo che compare più spesso nel lavoro descritto.','Il primo workflow deve togliere un solo gesto manuale.'];
    }
    if(base.type==='marketing'){
      steps[2]=['03','Crea il primo percorso','Collega il trigger a una comunicazione e a una condizione di uscita.','Devi poterlo testare dall’inizio alla fine.'];
    }
    return {
      type:base.type||type,
      ui:base.ui,
      setup:base.setup,
      flow:base.flow,
      simple:steps,
      practical:steps.map(function(s,i){
        var d=[
          'Prima definisci il risultato, poi configura lo strumento.',
          'Riduci campi e impostazioni al minimo necessario.',
          'Testa il flusso prima di aggiungere altre integrazioni.',
          'Controlla dati, destinatari, condizioni e casi di errore.',
          'Replica il modello solo quando il primo caso è stabile.'
        ][i]||'Mantieni il flusso semplice e verificabile.';
        return [s[0],s[1],s[2],d];
      }),
      integrationText:integrations.slice(0,5).join(', '),
      url:toolUrl(tool)
    };
  }

function styles(){
    if(document.getElementById('px-execution-guide-style')) return;
    var s=document.createElement('style');
    s.id='px-execution-guide-style';
    s.textContent=".px-eg{margin:18px 0 0;border:1px solid rgba(124,92,255,.24);border-radius:28px;background:linear-gradient(145deg,rgba(15,22,39,.98),rgba(6,10,19,.99));box-shadow:0 30px 100px rgba(0,0,0,.30);overflow:hidden}.px-eg-hero{padding:28px;background:linear-gradient(135deg,rgba(124,92,255,.11),rgba(91,140,255,.035) 58%,rgba(54,217,157,.035))}.px-eg-k{font-size:11px;letter-spacing:.16em;color:#b9afff;font-weight:950}.px-eg-title{margin:8px 0 7px;font-size:29px;line-height:1.05;font-weight:950;letter-spacing:-.045em}.px-eg-copy{margin:0;color:#bec8d7;font-size:15px;line-height:1.65;max-width:900px}.px-eg-meta{display:flex;gap:8px;flex-wrap:wrap;margin-top:15px}.px-eg-chip{padding:9px 11px;border:1px solid rgba(255,255,255,.08);border-radius:999px;background:rgba(255,255,255,.025);color:#b8c2d2;font-size:12px;font-weight:850}.px-eg-chip strong{color:#fff}.px-eg-body{padding:22px 25px 28px}.px-eg-layout{display:grid;grid-template-columns:minmax(0,1.08fr) minmax(300px,.92fr);gap:18px}.px-eg-mission{padding:19px;border:1px solid rgba(124,92,255,.18);border-radius:20px;background:rgba(124,92,255,.045)}.px-eg-mission-k{font-size:10px;letter-spacing:.14em;color:#a99cff;font-weight:950}.px-eg-mission-title{margin-top:7px;font-size:22px;font-weight:950}.px-eg-mission p{margin:7px 0 0;color:#9eabbe;font-size:14px;line-height:1.6}.px-eg-targets{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:13px}.px-eg-target{padding:12px;border:1px solid rgba(255,255,255,.07);border-radius:13px;background:rgba(255,255,255,.018)}.px-eg-target span{display:block;color:#7e8ba1;font-size:10px;font-weight:900;letter-spacing:.08em}.px-eg-target strong{display:block;margin-top:5px;color:#eaf0f8;font-size:13px;line-height:1.35}.px-tutorial-mock{padding:15px;border:1px solid rgba(255,255,255,.07);border-radius:20px;background:#060a12;box-shadow:inset 0 1px 0 rgba(255,255,255,.025)}.px-tm-top{display:flex;align-items:center;gap:8px;padding-bottom:11px;border-bottom:1px solid rgba(255,255,255,.06)}.px-tm-dot{width:8px;height:8px;border-radius:50%;background:#36d99d;box-shadow:0 0 0 5px rgba(54,217,157,.07)}.px-tm-brand{font-size:12px;font-weight:900;color:#e9eef6}.px-tm-status{margin-left:auto;font-size:9px;color:#7ce8bd;font-weight:900}.px-tm-body{display:grid;grid-template-columns:42px 1fr;gap:12px;padding-top:13px}.px-tm-side{display:grid;gap:6px;align-content:start}.px-tm-side i{height:10px;border-radius:5px;background:rgba(255,255,255,.055)}.px-tm-side i:nth-child(2){width:80%}.px-tm-side i:nth-child(3){width:90%}.px-tm-side i:nth-child(4){width:70%}.px-tm-title{font-size:13px;color:#dfe6f4;font-weight:900}.px-tm-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:7px;margin-top:9px}.px-tm-card{min-height:74px;padding:10px;border:1px solid rgba(255,255,255,.065);border-radius:10px;background:rgba(255,255,255,.02)}.px-tm-card.active{border-color:rgba(124,92,255,.28);background:rgba(124,92,255,.07)}.px-tm-card.success{border-color:rgba(54,217,157,.17);background:rgba(54,217,157,.035)}.px-tm-card small{display:block;font-size:8px;color:#6e7d95}.px-tm-card b{display:block;margin-top:5px;font-size:10px}.px-tm-card span{display:block;margin-top:4px;color:#738198;font-size:8px;line-height:1.35}.px-tm-bar{height:6px;margin-top:11px;border-radius:999px;background:rgba(255,255,255,.055);overflow:hidden}.px-tm-bar span{display:block;height:100%;border-radius:999px;background:linear-gradient(90deg,#7c5cff,#36d99d);width:20%;transition:width .25s ease}.px-tm-caption{margin-top:9px;color:#6f7d93;font-size:10px;line-height:1.45}.px-eg-tabs{display:flex;gap:8px;margin-top:19px}.px-eg-tab{min-height:50px;padding:11px 14px;border:1px solid rgba(255,255,255,.08);border-radius:13px;background:rgba(255,255,255,.025);color:#acb7c8;font-size:13px;font-weight:900;cursor:pointer}.px-eg-tab.active{border-color:rgba(124,92,255,.38);background:rgba(124,92,255,.105);color:#f0edff}.px-eg-progress{margin-top:14px;padding:13px 15px;border:1px solid rgba(255,255,255,.065);border-radius:15px;background:rgba(255,255,255,.016)}.px-eg-progress-top{display:flex;justify-content:space-between;gap:10px;color:#cbd4e2;font-size:12px;font-weight:900}.px-eg-progress-top span{color:#7e8ba0}.px-eg-track{height:8px;margin-top:9px;border-radius:999px;background:rgba(255,255,255,.055);overflow:hidden}.px-eg-track span{display:block;height:100%;width:0;border-radius:999px;background:linear-gradient(90deg,#7c5cff,#36d99d);transition:width .25s ease}.px-eg-steps{display:grid;gap:10px;margin-top:12px}.px-eg-step{display:grid;grid-template-columns:36px minmax(0,1fr) 26px;gap:11px;align-items:start;padding:15px;border:1px solid rgba(255,255,255,.065);border-radius:16px;background:rgba(255,255,255,.018);transition:.18s ease}.px-eg-step:hover{transform:translateY(-1px);border-color:rgba(124,92,255,.22)}.px-eg-step.done{border-color:rgba(54,217,157,.18);background:rgba(54,217,157,.03)}.px-eg-num{width:34px;height:34px;display:grid;place-items:center;border-radius:10px;background:rgba(124,92,255,.11);color:#c8c1ff;font-size:11px;font-weight:950}.px-eg-step.done .px-eg-num{background:rgba(54,217,157,.10);color:#7ce8bd}.px-eg-step b{display:block;color:#eef3f8;font-size:15px;line-height:1.3}.px-eg-step-copy{margin-top:5px;color:#b0bccd;font-size:13px;line-height:1.62}.px-eg-step-result{margin-top:9px;padding:10px 11px;border-left:2px solid rgba(124,92,255,.38);border-radius:0 10px 10px 0;background:rgba(124,92,255,.04);color:#8b99ae;font-size:11px;line-height:1.52}.px-eg-check{width:23px;height:23px;margin:2px 0 0;accent-color:#7c5cff;cursor:pointer}.px-eg-flow{margin-top:13px;padding:16px;border:1px solid rgba(54,217,157,.13);border-radius:18px;background:rgba(54,217,157,.025)}.px-eg-flow-title{font-size:18px;color:#eef3f9;font-weight:950}.px-eg-flow-copy{margin-top:5px;color:#8997ab;font-size:12px;line-height:1.5}.px-eg-flow-rail{display:grid;grid-template-columns:repeat(5,1fr);gap:6px;margin-top:13px}.px-eg-flow-node{padding:10px 8px;border:1px solid rgba(255,255,255,.06);border-radius:10px;background:rgba(255,255,255,.018);text-align:center}.px-eg-flow-node span{display:block;color:#7d8b9e;font-size:8px;letter-spacing:.08em;font-weight:900}.px-eg-flow-node b{display:block;margin-top:5px;font-size:10px;line-height:1.25}.px-eg-how{margin-top:13px;padding:14px;border:1px solid rgba(255,255,255,.065);border-radius:15px;background:rgba(255,255,255,.016)}.px-eg-how b{color:#e9eef5;font-size:13px}.px-eg-how p{margin:6px 0 0;color:#8e9bae;font-size:12px;line-height:1.55}.px-eg-open{display:inline-flex;align-items:center;justify-content:center;min-height:50px;padding:11px 14px;border:1px solid rgba(124,92,255,.29);border-radius:13px;background:linear-gradient(135deg,#7c5cff,#5b8cff);color:#fff;text-decoration:none;font-size:13px;font-weight:950;box-shadow:0 14px 42px rgba(124,92,255,.18)}.px-eg-footer{display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-top:13px;padding:13px;border:1px solid rgba(255,255,255,.065);border-radius:14px;background:rgba(255,255,255,.014);color:#8190a5;font-size:11px;line-height:1.55}.px-eg-footer strong{color:#7ce8bd}@media(max-width:900px){.px-eg-layout{grid-template-columns:1fr}.px-eg-targets{grid-template-columns:1fr}.px-tm-grid{grid-template-columns:1fr 1fr}.px-tm-card.success{grid-column:1/-1}.px-eg-flow-rail{grid-template-columns:1fr}.px-eg-flow-node{display:flex;align-items:center;justify-content:space-between;text-align:left;gap:10px}}@media(max-width:650px){.px-eg-hero{padding:22px 17px}.px-eg-body{padding:17px 14px 20px}.px-eg-title{font-size:24px}.px-eg-copy{font-size:14px}.px-eg-step{grid-template-columns:32px minmax(0,1fr) 24px;padding:13px;gap:9px}.px-eg-step b{font-size:14px}.px-eg-step-copy{font-size:12.5px}.px-eg-step-result{font-size:10.5px}.px-eg-tabs{display:grid;grid-template-columns:1fr}.px-eg-tab{width:100%}}";
    document.head.appendChild(s);
  }

function render(){
    var results=document.getElementById('results');
    var mount=document.getElementById('primaryMount');
    if(!results||!mount||getComputedStyle(results).display==='none') return;
    var r=result(),p=primary(r);
    if(!p)return;

    var id=toolKey(p);
    var old=document.getElementById('px-execution-guide');
    if(old) old.remove();

    styles();
    var a=answers(),goal=goalSummary(a),data=build(p),state=getState(id);
    var steps=data.simple||[];
    var box=document.createElement('section');
    box.id='px-execution-guide';
    box.className='px-eg';

    var openLink=data.url?'<a class="px-eg-open" href="'+esc(data.url)+'" target="_blank" rel="noopener noreferrer">Apri '+esc(p.name||'lo strumento')+' ↗</a>':'';
    var flowParts=String(data.flow||'Input → processo → output').split('→');
    var narrative=goal.pain
      ? 'Hai scritto “'+goal.pain+'”. Questo tutorial traduce quel problema nel primo processo da far funzionare con '+(p.name||'lo strumento')+'.'
      : 'Questo tutorial traduce il tuo obiettivo nel primo processo da far funzionare con '+(p.name||'lo strumento')+'.';

    box.innerHTML=
      '<div class="px-eg-hero">'+
        '<div class="px-eg-k">✦ GUIDA AUTOMATICA · '+esc(data.ui||'WORKSPACE')+'</div>'+
        '<div class="px-eg-title">Adesso ti spiego come usarlo.</div>'+
        '<p class="px-eg-copy">'+esc(narrative)+'</p>'+
        '<div class="px-eg-meta"><span class="px-eg-chip"><strong>STRUMENTO</strong> · '+esc(p.name||p.id)+'</span><span class="px-eg-chip"><strong>OBIETTIVO</strong> · '+esc(goal.goal)+'</span><span class="px-eg-chip"><strong>PASSO</strong> · uno alla volta</span></div>'+
      '</div>'+
      '<div class="px-eg-body">'+
        '<div class="px-eg-layout">'+
          '<div>'+
            '<div class="px-eg-mission">'+
              '<div class="px-eg-mission-k">COSA DEVI OTTENERE</div>'+
              '<div class="px-eg-mission-title">'+esc(data.setup||'Parti da un caso reale piccolo.')+'</div>'+
              '<div class="px-eg-targets">'+
                '<div class="px-eg-target"><span>OGGI</span><strong>'+esc(goal.goal)+'</strong></div>'+
                '<div class="px-eg-target"><span>PRIMO RISULTATO</span><strong>'+esc(goal.action)+'</strong></div>'+
                '<div class="px-eg-target"><span>SEGNALE</span><strong>'+esc(goal.outcome)+'</strong></div>'+
              '</div>'+
            '</div>'+
            '<div class="px-eg-flow">'+
              '<div class="px-eg-side-title">IL FLUSSO</div>'+
              '<div class="px-eg-flow-title">'+esc(data.flow||'Input → processo → output')+'</div>'+
              '<div class="px-eg-flow-copy">Questa è la sequenza che il tutorial ti aiuta a costruire.</div>'+
              '<div class="px-eg-flow-rail">'+flowParts.map(function(x,i){return '<div class="px-eg-flow-node"><span>FASE '+(i+1)+'</span><b>'+esc(String(x).trim())+'</b></div>';}).join('')+'</div>'+
            '</div>'+
          '</div>'+
          '<div>'+
            mockVisual(data.type||categoryType(p),p.name||p.id,0)+
            '<div class="px-eg-how"><b>Come usarlo</b><p>Apri il software. Esegui il passo evidenziato. Controlla cosa succede. Poi spunta la casella. Non devi imparare tutto: devi far funzionare questo primo processo.</p></div>'+
            (openLink?'<div style="margin-top:11px">'+openLink+'</div>':'')+
          '</div>'+
        '</div>'+
        '<div class="px-eg-tabs"><button type="button" class="px-eg-tab active" data-mode="simple">🟢 Guidami passo passo</button><button type="button" class="px-eg-tab" data-mode="practical">⚙ Voglio capire anche il perché</button></div>'+
        '<div class="px-eg-progress"><div class="px-eg-progress-top"><span>IL TUO AVANZAMENTO</span><b id="px-eg-progress-text">0 / '+steps.length+' completati</b></div><div class="px-eg-track"><span id="px-eg-progress-bar"></span></div></div>'+
        '<div class="px-eg-steps"></div>'+
        '<div class="px-eg-footer"><div><strong>Regola:</strong> non configurare tutto insieme. Prima fai funzionare questo workflow.</div><div>'+(data.integrationText?'<strong>Collegamenti utili:</strong> '+esc(data.integrationText):'<strong>Dopo:</strong> aggiungi integrazioni solo quando il flusso è stabile.')+'</div></div>'+
        '<div class="px-eg-how"><b>Quando hai finito i 5 passi</b><p>'+esc(goal.outcome)+' A quel punto PROJECT-X può aiutarti a passare al secondo workflow senza ricominciare da zero.</p></div>'+
      '</div>';

    mount.insertAdjacentElement('afterend',box);

    var list=box.querySelector('.px-eg-steps');
    var progressText=box.querySelector('#px-eg-progress-text');
    var progressBar=box.querySelector('#px-eg-progress-bar');
    var mode='simple';

    function draw(){
      var arr=data[mode]||data.simple||[];
      list.innerHTML=arr.map(function(x,i){
        var checked=!!state[String(i)];
        return '<div class="px-eg-step '+(checked?'done':'')+'">'+
          '<div class="px-eg-num">'+esc(x[0])+'</div>'+
          '<div><b>'+esc(x[1])+'</b><div class="px-eg-step-copy">'+esc(x[2])+'</div><div class="px-eg-step-result"><strong>Quando va bene:</strong> '+esc(x[3]||'Il passaggio funziona come previsto.')+'</div></div>'+
          '<input class="px-eg-check" type="checkbox" data-step="'+i+'" '+(checked?'checked':'')+' aria-label="Completa '+esc(x[1])+'">'+
        '</div>';
      }).join('');
      updateProgress();
    }

    function updateProgress(){
      var arr=data[mode]||data.simple||[],done=0;
      for(var i=0;i<arr.length;i++){if(state[String(i)])done++;}
      progressText.textContent=done+' / '+arr.length+' completati';
      progressBar.style.width=(arr.length?Math.round(done/arr.length*100):0)+'%';
      var visual=box.querySelector('.px-tm-bar span');
      if(visual)visual.style.width=Math.max(20,Math.round((done+1)/arr.length*100))+'%';
    }

    function setMode(next){
      mode=next==='practical'?'practical':'simple';
      box.querySelectorAll('.px-eg-tab').forEach(function(b){b.classList.toggle('active',b.getAttribute('data-mode')===mode)});
      draw();
    }

    box.querySelectorAll('.px-eg-tab').forEach(function(b){b.onclick=function(){setMode(b.getAttribute('data-mode'));}});
    list.addEventListener('change',function(e){
      var cb=e.target.closest('.px-eg-check');if(!cb)return;
      state[String(Number(cb.getAttribute('data-step')||0))]=!!cb.checked;
      saveState(id,state);
      var row=cb.closest('.px-eg-step');if(row)row.classList.toggle('done',cb.checked);
      updateProgress();
    });
    draw();
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