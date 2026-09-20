/* =========================================================
   PROJECT-X — TOOL TUTORIAL ENGINE
   Tutorial pratici, visuali e progressivi per ogni software
   presente nel catalogo.
   ========================================================= */
(function(){
  'use strict';

  var TOOL_FOCUS = {
    "systeme": {area:"Funnels e automazioni", focus:"creare un primo percorso lead → email → follow-up", action:"costruisci un funnel minimo e collega una sola automazione"},
    "getresponse": {area:"Automation / email", focus:"creare un workflow email breve e misurabile", action:"parti da un contatto e collega messaggio, attesa e follow-up"},
    "mailchimp": {area:"Audience e automazioni", focus:"organizzare un pubblico e attivare un percorso", action:"crea un segmento piccolo e una prima automazione"},
    "klaviyo": {area:"Flows e segmenti", focus:"automatizzare un momento del customer journey", action:"scegli un evento e costruisci un flow con una sola azione"},
    "omnisend": {area:"Automation", focus:"collegare un evento e-commerce a una comunicazione", action:"parti da un evento dell'ordine e invia un messaggio di prova"},
    "activecampaign": {area:"Automations", focus:"creare una sequenza di follow-up", action:"configura trigger, messaggio, condizione e uscita"},
    "hubspot": {area:"CRM / Deals / Workflow", focus:"mettere ordine tra contatti, opportunità e prossime azioni", action:"crea un contatto, un deal e una prossima attività"},
    "pipedrive": {area:"Pipeline", focus:"rendere visibili lead e prossime azioni", action:"crea una pipeline minima con pochi stati"},
    "salesforce": {area:"Sales / CRM", focus:"trasformare lead e opportunità in un processo controllabile", action:"crea un'opportunità pilota e una prossima attività"},
    "zoho-crm": {area:"Leads e pipeline", focus:"centralizzare contatti e follow-up", action:"crea un lead e porta il caso fino alla prossima azione"},
    "freshsales": {area:"Pipeline e attività", focus:"organizzare il follow-up commerciale", action:"crea un contatto, un'opportunità e un task"},
    "close": {area:"Sales workspace", focus:"lavorare per prossima azione", action:"crea un lead e definisci il follow-up successivo"},
    "copper": {area:"CRM", focus:"gestire clienti dentro il flusso commerciale", action:"crea un contatto e una opportunità collegata"},
    "keap": {area:"CRM e automazioni", focus:"unire contatti e follow-up automatici", action:"crea il primo contatto e attiva una comunicazione ricorrente"},
    "make": {area:"Scenarios", focus:"eliminare un passaggio manuale collegando due strumenti", action:"crea trigger → modulo → azione e fai un test"},
    "zapier": {area:"Zaps", focus:"collegare un evento a una singola azione", action:"crea Trigger → Action e prova con un record reale"},
    "power-automate": {area:"Cloud flows", focus:"automatizzare un processo Microsoft 365", action:"parti da Outlook, Excel, Teams o SharePoint e crea un flow semplice"},
    "n8n": {area:"Workflows / nodes", focus:"disegnare un workflow con input, logica e output", action:"crea un workflow corto e verifica ogni nodo"},
    "monday": {area:"Boards e automazioni", focus:"rendere visibili attività, responsabili e stati", action:"crea un board pilota e una regola automatica"},
    "clickup": {area:"Workspace e automazioni", focus:"centralizzare task e scadenze", action:"crea un progetto, assegna un task e automatizza un cambio di stato"},
    "asana": {area:"Projects e rules", focus:"organizzare attività, responsabilità e scadenze", action:"crea un progetto pilota e una sola regola"},
    "trello": {area:"Board e Butler", focus:"visualizzare il lavoro e automatizzare un passaggio", action:"crea tre-quattro liste e una regola Butler"},
    "notion": {area:"Pages e database", focus:"creare un workspace operativo semplice", action:"crea una pagina, un database e una vista utile"},
    "basecamp": {area:"Projects e to-dos", focus:"portare un progetto reale in un unico spazio", action:"crea un progetto e una lista di attività"},
    "wrike": {area:"Projects e workflows", focus:"controllare lavoro, stati e responsabilità", action:"crea un progetto pilota con workflow minimo"},
    "brevo": {area:"Contacts e Automations", focus:"automatizzare una comunicazione ricorrente", action:"crea un contatto di prova e un workflow breve"},
    "kit": {area:"Subscribers e Visual Automations", focus:"costruire un percorso semplice per iscritti e newsletter", action:"crea una sequenza breve e collega un trigger"},
    "constant-contact": {area:"Campaigns e Automation", focus:"creare una comunicazione automatica per un piccolo gruppo", action:"crea un pubblico di test e una campagna automatica"},
    "drip": {area:"People e Workflows", focus:"automatizzare una fase del customer lifecycle", action:"scegli un evento e costruisci un workflow minimo"},
    "semrush": {area:"SEO / Keyword / Audit", focus:"partire da una keyword e trovare un'azione concreta", action:"crea un progetto, controlla keyword e apri il primo audit"},
    "ahrefs": {area:"Site Explorer / Keywords", focus:"capire cosa cercano le persone e cosa fanno i competitor", action:"analizza un dominio e salva poche keyword utili"},
    "se-ranking": {area:"Rank tracking / Audit", focus:"monitorare visibilità e problemi SEO", action:"crea un progetto e collega keyword e sito"},
    "shopify": {area:"Admin / Products / Orders", focus:"creare un flusso e-commerce ordinato", action:"controlla prodotto, ordine di prova e automazione post-acquisto"},
    "woocommerce": {area:"WordPress / WooCommerce", focus:"gestire prodotti, ordini e processo post-acquisto", action:"configura un prodotto e verifica un ordine di test"},
    "wix": {area:"Editor / Store / Automations", focus:"creare un sito o store semplice con un'azione automatica", action:"imposta una pagina, un modulo e una automazione"},
    "squarespace": {area:"Pages / Commerce", focus:"creare una presenza online ordinata", action:"imposta pagina principale, prodotto/servizio e conferma"},
    "calendly": {area:"Event Types", focus:"automatizzare prenotazione e promemoria", action:"crea un tipo di appuntamento e prova una prenotazione"},
    "acuity": {area:"Appointment Types", focus:"rendere autonoma la prenotazione", action:"crea un servizio, disponibilità e una prova cliente"},
    "cal-com": {area:"Event Types / Routing", focus:"costruire un percorso di scheduling semplice", action:"crea un evento e collegalo al calendario"},
    "pandadoc": {area:"Templates / Documents", focus:"standardizzare un preventivo o documento ricorrente", action:"crea un modello con campi variabili e invialo a un test"},
    "docusign": {area:"Templates / Envelopes", focus:"digitalizzare firma e invio di un documento", action:"crea un template e una busta di prova"},
    "adobe-acrobat": {area:"PDF / Modifica / Firma", focus:"ridurre lavoro manuale sui PDF", action:"parti da un PDF reale e completa una sola operazione ricorrente"},
    "microsoft-365": {area:"Outlook / Excel / Teams / SharePoint", focus:"usare l'ecosistema Microsoft come un sistema unico", action:"scegli un processo tra email, foglio, documento e collaborazione"},
    "google-workspace": {area:"Gmail / Drive / Sheets / Calendar", focus:"collegare lavoro, file e calendario", action:"crea un flusso minimo tra due strumenti Google"},
    "airtable": {area:"Bases / Tables / Automations", focus:"trasformare dati sparsi in un database operativo", action:"crea una tabella e automatizza una sola azione"},
    "dropbox": {area:"Folders / Sharing", focus:"organizzare e condividere file senza dispersione", action:"crea una struttura minima e una regola di condivisione"},
    "chatgpt": {area:"Chat / Projects / Prompt", focus:"trasformare un'attività ripetitiva in una procedura assistita", action:"parti da un caso reale e crea un prompt riutilizzabile"},
    "claude": {area:"Chat / Projects / Documents", focus:"usare AI per analisi e documenti", action:"carica un esempio e crea una procedura ripetibile"},
    "jasper": {area:"Campaigns / Content", focus:"creare contenuti marketing coerenti", action:"definisci obiettivo, tono e un formato riutilizzabile"},
    "canva": {area:"Design / Brand / Templates", focus:"creare un template riutilizzabile", action:"parti da un contenuto e trasformalo in un modello"},
    "quickbooks": {area:"Invoices / Expenses / Reports", focus:"rendere ordinata la gestione economica", action:"crea una fattura o una spesa di prova e controlla il report"},
    "holded": {area:"Sales / Billing / Projects", focus:"unire vendite, documenti e gestione operativa", action:"crea un cliente e porta una operazione dall'inizio alla fine"},
    "capsule": {area:"People / Pipelines", focus:"tenere sotto controllo clienti e follow-up", action:"crea un contatto, un'opportunità e la prossima attività"},
    "insightly": {area:"CRM / Projects", focus:"collegare clienti e progetti", action:"crea un contatto e un progetto pilota"},
    "scoro": {area:"Sales / Projects / Finance", focus:"centralizzare lavoro commerciale e operativo", action:"crea un caso pilota e seguilo fino al risultato"}
  };

  var COMMON = {
    crm:{
      flow:["Contatto","Stato","Prossima azione","Follow-up","Risultato"],
      steps:[
        ["Apri l'area giusta","Cerca la sezione indicata nella scheda del software e identifica il punto da cui parte il lavoro.","Devi riconoscere subito dove creare o importare il primo caso.","Parti da un solo contatto o opportunità reale."],
        ["Crea il caso pilota","Inserisci un solo caso reale e compila soltanto i dati indispensabili.","Il caso deve avere identità, stato e prossimo passo.","Non importare ancora tutta la base clienti."],
        ["Imposta il flusso","Costruisci il percorso minimo descritto nel tutorial e assegna una prossima azione.","Devi sapere sempre cosa succede dopo.","Se non sai quale campo usare, fermati e semplifica."],
        ["Fai una prova completa","Esegui il percorso da inizio a fine con un caso di test.","Ogni passaggio deve lasciare un risultato visibile.","Controlla notifiche, attività e stato finale."],
        ["Replica e misura","Ripeti su pochi casi e confronta tempo e passaggi manuali.","Il processo deve risultare più facile da controllare.","Solo dopo estendi il modello al resto del lavoro."]
      ]
    },
    marketing:{
      flow:["Contatto","Trigger","Messaggio","Attesa","Risultato"],
      steps:[
        ["Apri audience e automazioni","Trova contatti/audience e l'area dove si costruisce il workflow.","Devi poter distinguere pubblico, messaggi e automazioni.","Crea una base o un segmento di test."],
        ["Prepara il messaggio","Crea una sola email o comunicazione collegata al problema reale.","Il messaggio deve essere leggibile e pronto a essere testato.","Evita di costruire una campagna completa."],
        ["Imposta il trigger","Scegli un evento semplice che fa partire il percorso.","Deve essere possibile provocare il trigger con un contatto di prova.","Mantieni il workflow corto."],
        ["Testa il percorso","Esegui il trigger e controlla messaggio, tempi e uscita.","Il percorso deve partire una sola volta e arrivare alla condizione prevista.","Controlla anche eventuali unsubscribe o errori."],
        ["Leggi il risultato","Scegli una sola metrica collegata all'obiettivo.","Sai già quale dato userai per decidere il prossimo miglioramento.","Non cambiare dieci variabili insieme."]
      ]
    },
    automation:{
      flow:["Trigger","Dati","Logica","Azione","Verifica"],
      steps:[
        ["Scegli sorgente e destinazione","Identifica l'app che genera l'evento e quella che deve ricevere il risultato.","Devi poter spiegare il workflow in una frase.","Per il primo test bastano due strumenti."],
        ["Configura il trigger","Imposta l'evento iniziale e lancia un test.","I dati di prova devono comparire nel builder.","Non creare ancora condizioni avanzate."],
        ["Mappa solo i dati utili","Trasferisci i campi indispensabili dall'input all'azione.","Ogni campo mappato deve avere uno scopo.","Meno campi = meno possibilità di errore."],
        ["Esegui l'azione","Crea il record, aggiorna il file o invia la notifica prevista.","Devi vedere il risultato nello strumento di destinazione.","Fai un secondo test per escludere duplicati."],
        ["Controlla gli errori","Apri la cronologia delle esecuzioni e guarda successi e fallimenti.","Il workflow deve essere leggibile anche quando qualcosa va storto.","Solo dopo aggiungi il secondo passaggio."]
      ]
    },
    projects:{
      flow:["Attività","Responsabile","Stato","Scadenza","Completato"],
      steps:[
        ["Crea il progetto pilota","Apri l'area progetti e crea un unico lavoro reale.","Deve avere un inizio e una fine chiari.","Non trasferire ancora tutti i progetti."],
        ["Crea pochi stati","Imposta una struttura minima come Da fare → In corso → Fatto.","Chi apre il progetto deve capirlo in pochi secondi.","Aggiungi stati extra solo se servono davvero."],
        ["Assegna lavoro e scadenze","Dai ogni attività a una persona e definisci il prossimo passo.","Ogni task deve avere responsabilità e scadenza.","Evita task senza proprietario."],
        ["Automatizza un evento","Aggiungi una sola regola, per esempio una notifica al cambio di stato.","Il comportamento automatico deve essere prevedibile.","Testa la regola su un task di prova."],
        ["Controlla i blocchi","Osserva dove le attività restano ferme o arrivano tardi.","Hai un punto preciso su cui intervenire.","Prima correggi il collo di bottiglia più frequente."]
      ]
    },
    ecommerce:{
      flow:["Evento ordine","Dati cliente","Azione","Comunicazione","Controllo"],
      steps:[
        ["Controlla la base","Verifica prodotti, clienti, ordini e stati.","Il caso di test deve essere leggibile dall'inizio alla fine.","Non automatizzare dati che non sono corretti."],
        ["Scegli un evento","Seleziona un evento semplice, come nuovo ordine o cambio stato.","Devi poter provocare l'evento in modo controllato.","Parti da un solo evento."],
        ["Crea una sola azione","Collega il risultato a una comunicazione, attività o notifica.","Il primo workflow deve produrre un output chiaro.","Evita catene lunghe."],
        ["Fai il test","Usa un ordine o evento di prova e segui il percorso completo.","Il risultato arriva una sola volta al destinatario previsto.","Controlla tempi e duplicati."],
        ["Misura il lavoro evitato","Conta i passaggi che non devi più fare a mano.","Hai un numero semplice da confrontare dopo una settimana.","Solo dopo estendi il workflow."]
      ]
    },
    appointments:{
      flow:["Richiesta","Disponibilità","Prenotazione","Promemoria","Appuntamento"],
      steps:[
        ["Crea un servizio","Trova il tipo di evento/appuntamento e definisci un solo servizio.","Durata e regole sono chiare.","Non configurare tutti i servizi insieme."],
        ["Collega il calendario","Associa il calendario che usi davvero.","Gli orari occupati non vengono proposti.","Fai una prova con un calendario di test se possibile."],
        ["Imposta la prenotazione","Configura il link e le informazioni minime richieste.","Il cliente può arrivare fino alla conferma senza intervento manuale.","Mantieni il modulo corto."],
        ["Aggiungi il promemoria","Imposta un solo promemoria utile.","Il messaggio parte al momento giusto.","Controlla destinatario e orario."],
        ["Prova come cliente","Prenota dall'esterno e verifica tutto il percorso.","Il risultato corretto è zero coordinamento manuale.","Annulla la prova dopo il test."]
      ]
    },
    documents:{
      flow:["Richiesta","Modello","Documento","Firma","Archivio"],
      steps:[
        ["Scegli il documento ricorrente","Individua il documento che produci più spesso.","Hai un esempio reale da usare come modello.","Parti da un solo documento."],
        ["Crea il modello","Trasforma i dati variabili in campi compilabili.","La struttura resta fissa, cambiano solo i dati necessari.","Riduci il copia-incolla al minimo."],
        ["Definisci il passaggio","Stabilisci chi prepara, chi verifica e dove finisce il documento.","Ogni fase ha un responsabile chiaro.","Scrivi la regola anche fuori dal software."],
        ["Fai un documento di prova","Compila, invia o firma un esempio completo.","Il file arriva corretto al destinatario e nel posto previsto.","Controlla nome, versione e allegati."],
        ["Standardizza l'archivio","Usa un nome e una posizione coerenti per tutti i documenti.","Riesci a ritrovare il caso in pochi secondi.","Automatizza solo dopo aver stabilito la regola."]
      ]
    },
    productivity:{
      flow:["Informazione","File","Collaborazione","Automazione","Controllo"],
      steps:[
        ["Apri il punto di partenza","Individua file, posta, calendario o spazio di lavoro coinvolto.","Sai qual è l'app sorgente del processo.","Parti da una sola attività ricorrente."],
        ["Crea un esempio reale","Prepara un file, evento, email o record di prova.","Il caso è piccolo ma rappresentativo.","Non spostare tutto il materiale esistente."],
        ["Costruisci la regola","Definisci come il caso passa allo step successivo.","Il percorso è comprensibile anche a chi non conosce il software.","Scrivi la regola in una frase."],
        ["Prova il risultato","Esegui il processo e verifica dove arriva il dato.","Il passaggio successivo avviene nel posto corretto.","Controlla permessi e destinatari."],
        ["Crea uno standard","Replica il flusso e documenta il nome delle cartelle, campi o stati.","La seconda esecuzione è più veloce della prima.","Solo ora amplia il sistema."]
      ]
    },
    ai:{
      flow:["Contesto","Prompt","Output","Controllo","Riutilizzo"],
      steps:[
        ["Prepara un caso reale","Scegli un compito ripetitivo che l'AI deve aiutarti a svolgere.","Il risultato atteso è scritto in una frase.","Non partire da una richiesta troppo generica."],
        ["Dai il contesto","Fornisci ruolo, obiettivo, vincoli e un esempio.","L'AI sa cosa deve fare e cosa evitare.","Non inserire dati sensibili non necessari."],
        ["Costruisci il primo prompt","Chiedi un output concreto con una struttura precisa.","L'output è controllabile e ripetibile.","Indica formato, lunghezza e criteri."],
        ["Verifica l'output","Controlla fatti, dati, tono e aderenza al compito.","Sai cosa deve essere revisionato da una persona.","Non trattare il primo output come definitivo."],
        ["Rendi il prompt riutilizzabile","Trasforma la richiesta in un modello con campi variabili.","Puoi usarlo più volte senza riscriverlo.","Salva esempio, prompt e criteri di controllo."]
      ]
    },
    seo:{
      flow:["Keyword","SERP","Contenuto","Ottimizzazione","Monitoraggio"],
      steps:[
        ["Crea il progetto","Imposta sito, paese e motore di ricerca coerenti con il tuo caso.","Il progetto mostra un ambiente di lavoro preciso.","Evita di monitorare tutto il sito in una volta."],
        ["Trova poche keyword","Parti da un problema reale del cliente e raccogli poche query utili.","Hai un piccolo set prioritario.","La qualità conta più del numero."],
        ["Guarda la SERP","Analizza cosa compare e quale intento soddisfa la ricerca.","Capisci che tipo di pagina serve.","Non copiare i competitor: usa l'analisi come contesto."],
        ["Fai una prima azione","Ottimizza una pagina o crea un contenuto mirato.","L'intervento è legato alle keyword scelte.","Evita di cambiare l'intero sito."],
        ["Monitora","Controlla ranking, traffico o errori dopo un periodo coerente.","Hai un dato prima/dopo da confrontare.","Ripeti il ciclo con una seconda opportunità."]
      ]
    },
    design:{
      flow:["Brief","Template","Contenuto","Revisione","Riutilizzo"],
      steps:[
        ["Scegli un formato","Apri il tipo di contenuto che produci più spesso.","Hai una dimensione o un template definito.","Parti da un solo formato."],
        ["Crea il modello","Imposta titolo, struttura, stile e aree variabili.","La prossima versione richiede meno lavoro.","Salva il template con un nome chiaro."],
        ["Inserisci il contenuto","Sostituisci solo gli elementi che cambiano.","Il risultato resta coerente.","Evita di ridisegnare tutto da zero."],
        ["Controlla","Verifica leggibilità, branding, formati e destinazione.","Il file è pronto all'uso.","Fai il controllo finale prima di esportare."],
        ["Riusa","Duplica il template per il secondo caso reale.","La produzione diventa più veloce.","Crea una piccola libreria di modelli."]
      ]
    },
    finance:{
      flow:["Dati","Operazione","Documento","Riconciliazione","Report"],
      steps:[
        ["Imposta l'anagrafica","Crea o verifica il cliente/fornitore necessario.","I dati di base sono corretti.","Non duplicare anagrafiche."],
        ["Registra un'operazione","Usa una fattura, spesa o transazione di prova.","L'operazione appare nello storico.","Parti da un solo caso."],
        ["Controlla il collegamento","Verifica categorie, scadenze e collegamenti documentali.","I dati arrivano alla sezione corretta.","Correggi prima di automatizzare."],
        ["Riconcilia e controlla","Confronta il dato con il documento o movimento reale.","Il caso è coerente.","Segnala ogni differenza."],
        ["Leggi un report","Apri il report più vicino all'obiettivo iniziale.","Sai qual è il dato che userai per il controllo.","Non creare report inutili."]
      ]
    },
    general:{
      flow:["Input","Lavoro","Controllo","Risultato"],
      steps:[
        ["Apri il punto di partenza","Individua l'area del software coerente con il problema.","Sai da dove partire senza esplorare tutto.","Parti da un solo caso."],
        ["Crea un caso pilota","Usa un esempio reale piccolo.","Il caso è completo abbastanza da essere testato.","Non trasferire subito tutto."],
        ["Costruisci la procedura","Definisci input, lavoro, controllo e risultato.","La sequenza è ripetibile.","Se manca un passaggio, fermati."],
        ["Fai la prova","Esegui l'intero percorso.","Il risultato è visibile e controllabile.","Correggi prima di aggiungere funzioni."],
        ["Replica","Usa lo stesso schema su un secondo caso.","La seconda esecuzione è più veloce.","Solo dopo aumenta la complessità."]
      ]
    }
  };

  function categoryType(tool){
    var c=String(tool&&tool.category||'').toLowerCase();
    var n=String(tool&&tool.name||'').toLowerCase();
    if(/seo/.test(c)) return 'seo';
    if(/ai/.test(c)||/chatgpt|claude|jasper/.test(n)) return 'ai';
    if(/design/.test(c)||/canva/.test(n)) return 'design';
    if(/accounting|finance|business management/.test(c)) return 'finance';
    if(/crm|sales|customer/.test(c)) return 'crm';
    if(/email|marketing|creator/.test(c)) return 'marketing';
    if(/e-commerce|ecommerce|website|shop/.test(c)||/shopify|woocommerce|wix|squarespace/.test(n)) return 'ecommerce';
    if(/automation|workflow/.test(c)||/make|zapier|n8n|power automate/.test(n)) return 'automation';
    if(/project|task|work management/.test(c)) return 'projects';
    if(/appointment|scheduling/.test(c)||/calendly|acuity|cal.com/.test(n)) return 'appointments';
    if(/document|pdf|esign|signature/.test(c)) return 'documents';
    if(/productivity|database|cloud storage/.test(c)) return 'productivity';
    return 'general';
  }

  function getDatabase(){
    return Array.isArray(window.SOFTWARE_DATABASE)?window.SOFTWARE_DATABASE:[];
  }

  function make(tool){
    tool=tool||{};
    var id=String(tool.id||'');
    var spec=TOOL_FOCUS[id]||{};
    var type=categoryType(tool);
    var pack=COMMON[type]||COMMON.general;
    var flow=(spec.flow||pack.flow||[]).map(function(x){return x;});
    var steps=pack.steps.map(function(s,i){
      var title=s[0],instruction=s[1],success=s[2],note=s[3];
      if(i===0 && spec.area) title='Apri '+spec.area;
      if(i===1 && spec.focus) instruction='Il primo obiettivo è '+spec.focus+'. '+instruction;
      if(i===2 && spec.action) instruction=spec.action.charAt(0).toUpperCase()+spec.action.slice(1)+'. '+instruction;
      return {n:i+1,title:title,instruction:instruction,success:success,note:note};
    });
    return {
      id:id,
      name:tool.name||id,
      category:tool.category||'Software',
      area:spec.area||'Area operativa',
      focus:spec.focus||'far funzionare il primo processo utile',
      action:spec.action||'costruisci il flusso minimo',
      mission:'Non devi imparare tutto il software. Devi far funzionare bene un solo processo reale.',
      flow:flow,
      steps:steps,
      disclaimer:'Le schermate reali possono cambiare nome o posizione con gli aggiornamenti del software. PROJECT-X usa una guida visuale concettuale per farti riconoscere subito cosa cercare.',
      url:tool.pricingUrl||'#',
      integration:(Array.isArray(tool.integrations)?tool.integrations.slice(0,4):[])
    };
  }

  function get(toolOrId){
    var tool=toolOrId;
    if(typeof toolOrId==='string'){
      var list=getDatabase();
      tool=list.find(function(t){return t.id===toolOrId;});
      if(!tool) return null;
    }
    return make(tool);
  }

  function coverage(){
    var db=getDatabase();
    return {total:db.length,withTutorial:db.filter(function(t){return !!TOOL_FOCUS[t.id];}).length};
  }

  window.PROJECTX_TOOL_TUTORIALS={
    get:get,
    getAll:function(){return getDatabase().map(make);},
    coverage:coverage,
    focus:TOOL_FOCUS
  };
})();