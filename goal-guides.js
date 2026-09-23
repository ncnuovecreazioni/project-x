/* PROJECT-X — GOAL GUIDES
   Guide operative per problema/obiettivo.
   Ogni ricetta porta l'utente da un caso reale a un primo workflow verificato.
*/
(function(){
  'use strict';

  var G = {
    'automatizzare-preventivi': {
      id:'automatizzare-preventivi', caseKey:'preventivi', category:'Preventivi & vendite',
      title:'Automatizzare i preventivi senza ricopiare tutto ogni volta',
      mission:'Costruisci il primo preventivo semi-automatico, dal dato del cliente al documento e al follow-up.',
      focus:'ridurre copia-incolla, tempi di preparazione e dimenticanze nel follow-up',
      area:'Pipeline / documento / automazione', object:'processo preventivo',
      scenarioTitle:'Esempio: richiesta → dati → preventivo → follow-up',
      scenario:'Partiamo da una richiesta reale. I dati vengono raccolti una volta, il preventivo viene preparato da un modello e il prossimo contatto viene trasformato in un passaggio controllabile.',
      input:'Una richiesta con nome cliente, servizio, quantità/importo e data desiderata.',
      setup:'Raccolta dati → opportunità → modello preventivo → invio → attività di follow-up.',
      result:'Un primo percorso ripetibile che evita di ricostruire lo stesso preventivo da zero.',
      why:'Non automatizziamo il preventivo intero al primo giorno: automatizziamo il tratto più ripetitivo e lo testiamo su un solo caso.',
      stack:['Pipedrive','PandaDoc','Make'],
      steps:[
        ['Definisci il caso pilota','Scegli un tipo di preventivo che fai spesso e prendi un caso di prova con dati non sensibili.','Azione: scrivi in una frase input, documento finale e prossimo follow-up.','✓ Sai esattamente da dove parte e dove deve arrivare il processo.'],
        ['Metti la richiesta in un unico posto','Crea o usa una scheda opportunità/cliente con i soli dati necessari.','Azione: inserisci nome, richiesta, valore e data del prossimo contatto.','✓ Non devi cercare gli stessi dati in email, Excel e chat.'],
        ['Prepara un modello di preventivo','Crea un documento modello con campi variabili, senza ricostruire ogni volta intestazione e struttura.','Azione: lascia modificabili solo i campi che cambiano davvero.','✓ Da un caso all’altro cambi dati, non l'intera struttura.'],
        ['Collega i passaggi','Usa il connettore/automazione disponibile per portare i dati dal caso al documento.','Azione: collega solo 3–5 campi nel primo test e lascia fuori le eccezioni.','✓ Il nuovo documento riceve automaticamente i dati del caso.'],
        ['Invia e crea il follow-up','Dopo la generazione del documento, crea una prossima attività datata.','Azione: usa una regola semplice, ad esempio “ricontatta tra 3 giorni”.','✓ Ogni preventivo ha un prossimo passo visibile.'],
        ['Prova due casi e misura','Testa un caso semplice e uno leggermente diverso prima di estendere il flusso.','Azione: conta minuti prima/dopo e controlla eventuali duplicati o campi mancanti.','✓ Hai un workflow funzionante e una misura iniziale del valore.']
      ]
    },

    'automatizzare-follow-up-email': {
      id:'automatizzare-follow-up-email', caseKey:'followup', category:'Email & follow-up',
      title:'Automatizzare il follow-up senza dimenticare i clienti',
      mission:'Trasforma una risposta o una richiesta in una prossima azione automatica e controllabile.',
      focus:'evitare follow-up dimenticati e comunicazioni ripetitive',
      area:'Contatti / automazioni / email', object:'follow-up commerciale',
      scenarioTitle:'Esempio: nuova richiesta → risposta → attesa → follow-up',
      scenario:'La regola è semplice: quando succede un evento preciso, parte il passaggio successivo. L'utente deve controllare il risultato, non ricordarsi ogni volta cosa fare.',
      input:'Contatto + evento iniziale + data o intervallo del follow-up.',
      setup:'Trigger → messaggio o attività → attesa → follow-up → uscita.',
      result:'Il primo tratto del follow-up viene eseguito da una regola.',
      why:'Un follow-up utile è una sequenza breve con una condizione chiara, non una serie infinita di email.',
      stack:['GetResponse','Make','Pipedrive'],
      steps:[
        ['Scegli quando parte il follow-up','Individua un evento che puoi riconoscere senza ambiguità: nuovo contatto, richiesta ricevuta o attività completata.','Azione: usa un solo trigger per il primo workflow.','✓ Puoi dire esattamente quale evento fa partire il percorso.'],
        ['Prepara il contatto di prova','Usa un contatto di test che puoi controllare direttamente.','Azione: inserisci email e informazione necessaria al processo.','✓ Il contatto è disponibile per il test.'],
        ['Crea il primo messaggio','Scrivi una comunicazione breve con una sola azione attesa.','Azione: inserisci oggetto, testo e CTA senza aggiungere altre variabili.','✓ Il messaggio è pronto e comprensibile.'],
        ['Inserisci attesa e secondo passo','Aggiungi una pausa e poi una sola azione: email, attività o promemoria.','Azione: scegli un intervallo coerente con il processo reale.','✓ Il workflow mostra chiaramente trigger → attesa → follow-up.'],
        ['Testa un caso completo','Fai partire il contatto e controlla cronologia, contenuto e tempi.','Azione: verifica che ogni passaggio avvenga una sola volta.','✓ Nessun duplicato e nessun passaggio inatteso.'],
        ['Attiva e misura','Passa a pochi casi reali e osserva una sola metrica utile.','Azione: confronta risposte o follow-up completati prima e dopo.','✓ Hai un dato con cui migliorare il workflow.']
      ]
    },

    'gestire-clienti': {
      id:'gestire-clienti', caseKey:'clienti', category:'CRM & clienti',
      title:'Gestire i clienti in un unico processo',
      mission:'Porta contatti, richieste e prossime attività nello stesso punto.',
      focus:'centralizzare clienti, richieste e prossime azioni',
      area:'CRM / contatti / attività', object:'processo cliente',
      scenarioTitle:'Esempio: richiesta → cliente → attività → prossimo passo',
      scenario:'Il CRM serve a evitare che la storia del cliente sia sparsa tra email, fogli e memoria. Costruiamo un caso pilota e rendiamo obbligatoria una prossima azione.',
      input:'Nome cliente, canale di ingresso, richiesta e prossima azione.',
      setup:'Contatto → opportunità/richiesta → attività → stato → follow-up.',
      result:'Ogni caso ha un proprietario, uno stato e un passo successivo.',
      why:'La qualità del CRM si vede quando una persona apre una scheda e capisce immediatamente cosa è successo e cosa fare dopo.',
      stack:['HubSpot','Make'],
      steps:[
        ['Crea la struttura minima','Prepara un processo con pochi stati comprensibili.','Azione: usa ad esempio Nuovo → In lavorazione → Proposta → Chiuso.','✓ Gli stati descrivono il lavoro, non semplicemente il software.'],
        ['Inserisci un cliente pilota','Crea o importa un singolo contatto di prova.','Azione: compila nome, email e una sola informazione realmente utile.','✓ Puoi trovare il cliente dalla ricerca.'],
        ['Collega la richiesta','Associa al contatto la richiesta o l’opportunità.','Azione: inserisci titolo, valore se serve e stato iniziale.','✓ Contatto e richiesta sono collegati.'],
        ['Crea la prossima attività','Programma l’azione successiva con data e responsabile.','Azione: scrivi una frase operativa, non “contattare”.','✓ Aprendo la scheda sai cosa fare e quando.'],
        ['Testa il cambio di stato','Aggiorna il caso dopo una interazione reale di prova.','Azione: verifica che attività, stato e note restino coerenti.','✓ La cronologia del caso rimane leggibile.'],
        ['Replicalo come standard','Definisci i campi minimi che ogni nuovo cliente deve avere.','Azione: prova la stessa sequenza su altri 3 casi.','✓ Il processo è ripetibile anche da un’altra persona.']
      ]
    },

    'automatizzare-excel': {
      id:'automatizzare-excel', caseKey:'excel', category:'Excel & automazioni',
      title:'Automatizzare un processo Excel senza buttare via ciò che già usi',
      mission:'Mantieni Excel dove serve e automatizza i passaggi di copia, controllo e notifica.',
      focus:'ridurre copia-incolla e controlli manuali ripetitivi',
      area:'Excel / Microsoft 365 / Power Automate', object:'processo dati',
      scenarioTitle:'Esempio: dato inserito → controllo → aggiornamento → notifica',
      scenario:'Non serve sostituire subito il foglio. Prima rendiamo automatico un singolo passaggio ripetitivo che oggi richiede copia-incolla o avvisi manuali.',
      input:'Una tabella con colonne stabili e un evento chiaro, ad esempio una nuova riga o una modifica.',
      setup:'Evento Excel → controllo dati → azione → notifica.',
      result:'Il foglio continua a essere utilizzabile ma il passaggio ripetitivo viene gestito dal workflow.',
      why:'Automatizzare un foglio disordinato crea errori più velocemente. Prima rendiamo stabile il dato.',
      stack:['Microsoft 365','Power Automate','Excel'],
      steps:[
        ['Metti in ordine la tabella','Assicurati che intestazioni e colonne siano stabili e comprensibili.','Azione: elimina colonne duplicate e assegna un nome chiaro alla tabella.','✓ Una riga rappresenta un caso e ogni colonna ha un significato.'],
        ['Scegli un solo evento','Decidi cosa deve far partire il workflow.','Azione: usa un evento semplice come nuova riga o modifica di uno stato.','✓ Puoi simulare l’evento con un solo record di test.'],
        ['Crea il flusso','Apri Power Automate e crea un cloud flow collegato all’evento scelto.','Azione: collega prima il trigger, poi aggiungi una sola azione.','✓ Il flusso viene salvato senza errori di configurazione.'],
        ['Aggiungi il controllo','Inserisci una condizione che distingua il caso da verificare.','Azione: controlla una sola colonna critica per il primo test.','✓ Il workflow reagisce solo quando la condizione è vera.'],
        ['Crea la notifica o aggiornamento','Scegli un’unica azione finale: email, Teams o aggiornamento di un campo.','Azione: inviala solo al destinatario necessario.','✓ Il destinatario riceve il messaggio oppure il dato cambia automaticamente.'],
        ['Testa con dati finti','Inserisci due righe: una che deve attivare il flusso e una che non deve attivarlo.','Azione: confronta la cronologia delle esecuzioni.','✓ Sai distinguere correttamente i due casi.']
      ]
    },

    'gestire-ecommerce': {
      id:'gestire-ecommerce', caseKey:'ecommerce', category:'E-commerce',
      title:'Gestire meglio ordini e post-vendita',
      mission:'Costruisci un primo percorso post-acquisto che riduca controlli e comunicazioni manuali.',
      focus:'ordinare il lavoro intorno a ordini, cliente e comunicazioni',
      area:'Ordini / clienti / automazioni', object:'processo post-acquisto',
      scenarioTitle:'Esempio: ordine → cliente → comunicazione → follow-up',
      scenario:'Partiamo da un ordine di prova e definiamo cosa deve succedere subito dopo. Il percorso cresce solo dopo aver verificato il primo passaggio.',
      input:'Ordine di prova con cliente e prodotto.',
      setup:'Ordine → evento → comunicazione → attività/segmento → controllo.',
      result:'Il post-vendita parte da una regola chiara invece che da attività manuali sparse.',
      why:'Prima verifichiamo l’evento e il risultato; poi aggiungiamo segmentazione, email e altri automatismi.',
      stack:['Shopify','Klaviyo','Make'],
      steps:[
        ['Scegli l’evento principale','Definisci l’evento che deve avviare il percorso, ad esempio nuovo ordine o consegna.','Azione: usa un solo evento nel primo test.','✓ Sai esattamente quando deve partire la procedura.'],
        ['Prepara un ordine di prova','Usa la modalità di test disponibile nel tuo ambiente.','Azione: verifica prodotto, cliente e stato dell’ordine.','✓ L’ordine è visibile e controllabile.'],
        ['Definisci la comunicazione','Scrivi un messaggio per un solo momento del percorso.','Azione: scegli una sola CTA o informazione principale.','✓ Il messaggio corrisponde all’evento scelto.'],
        ['Collega l’automazione','Usa il connettore disponibile per portare l’evento allo step successivo.','Azione: collega soltanto l’azione indispensabile per il primo caso.','✓ L’evento produce una sola azione.'],
        ['Controlla i duplicati','Ripeti il test con un secondo ordine e osserva la cronologia.','Azione: verifica che lo stesso evento non generi due comunicazioni.','✓ Ogni ordine percorre il flusso una sola volta.'],
        ['Misura il post-vendita','Scegli una metrica: risposta, clic, assistenza o altro risultato coerente.','Azione: usa il dato per decidere quale passaggio migliorare.','✓ Hai una procedura ripetibile e misurabile.']
      ]
    },

    'organizzare-progetti': {
      id:'organizzare-progetti', caseKey:'progetti', category:'Progetti & attività',
      title:'Organizzare progetti con responsabili e scadenze chiare',
      mission:'Trasforma una lista di cose da fare in un processo leggibile.',
      focus:'rendere visibili attività, responsabilità e scadenze',
      area:'Board / task / automazioni', object:'processo di progetto',
      scenarioTitle:'Esempio: richiesta → attività → responsabile → scadenza',
      scenario:'Il board deve rispondere in pochi secondi a tre domande: cosa va fatto, chi lo fa e quando. Tutto il resto viene dopo.',
      input:'Una richiesta concreta o un’attività di progetto.',
      setup:'Attività → responsabile → stato → scadenza → automazione.',
      result:'Il team vede subito il prossimo passo e le attività ferme.',
      why:'Un sistema di progetto utile riduce le domande, non aggiunge schermate.',
      stack:['monday','Make'],
      steps:[
        ['Definisci il processo','Scegli un solo tipo di lavoro da organizzare.','Azione: scrivi in 3–4 stati il percorso reale della richiesta.','✓ Gli stati coprono il lavoro dall’ingresso alla conclusione.'],
        ['Crea il board','Imposta solo le colonne necessarie per il caso.','Azione: usa Nome, Responsabile, Stato e Data come nucleo.','✓ Una richiesta è leggibile senza aprire dieci campi.'],
        ['Inserisci una attività','Crea un caso di prova.','Azione: compila titolo e informazioni minime.','✓ L’attività è riconoscibile a colpo d’occhio.'],
        ['Assegna responsabilità','Imposta persona e scadenza.','Azione: evita attività senza proprietario o data quando il processo ne richiede una.','✓ Chi deve agire e quando sono visibili.'],
        ['Aggiungi una sola automazione','Configura una regola semplice, ad esempio notifica quando lo stato cambia.','Azione: prova la regola su una sola attività.','✓ Il cambio di stato produce l’azione prevista.'],
        ['Controlla i blocchi','Dopo alcuni casi guarda dove le attività rimangono ferme.','Azione: correggi prima il collo di bottiglia più frequente.','✓ Il board inizia a guidare il lavoro invece di archiviarlo.']
      ]
    },

    'gestire-documenti': {
      id:'gestire-documenti', caseKey:'documenti', category:'Documenti & archivi',
      title:'Gestire documenti senza cercare tutto a mano',
      mission:'Crea un flusso semplice per ricezione, classificazione, archiviazione e avviso.',
      focus:'ridurre ricerca, rinomina, inoltro e archiviazione manuale',
      area:'Documenti / archivio / automazioni', object:'processo documentale',
      scenarioTitle:'Esempio: documento ricevuto → classificato → archiviato → persona avvisata',
      scenario:'Partiamo da un tipo di documento ricorrente e costruiamo una sola regola che riduca salvataggi e inoltri manuali.',
      input:'Un documento di prova e una regola chiara di destinazione.',
      setup:'Ricezione → classificazione → archiviazione → notifica → controllo.',
      result:'Il documento arriva nel posto corretto e la persona interessata viene avvisata.',
      why:'Meglio un flusso affidabile per un solo tipo di documento che un’automazione universale piena di eccezioni.',
      stack:['Microsoft 365','Power Automate','Adobe Acrobat'],
      steps:[
        ['Scegli un tipo di documento','Prendi un documento ricorrente, non riservato, e definisci la sua destinazione.','Azione: scrivi nome del tipo, cartella di arrivo e responsabile.','✓ La regola è comprensibile senza spiegazioni aggiuntive.'],
        ['Crea la cartella o libreria','Prepara una struttura semplice e stabile.','Azione: evita cartelle duplicate e nomi ambigui.','✓ Sai dove deve finire il file.'],
        ['Definisci il trigger','Scegli l’evento che indica che il documento è arrivato.','Azione: usa un solo punto di ingresso nel primo test.','✓ Puoi simulare l’arrivo del documento.'],
        ['Aggiungi classificazione e destinazione','Imposta il criterio minimo per scegliere dove archiviare.','Azione: usa un campo, nome o proprietà stabile.','✓ Il file viene indirizzato alla posizione prevista.'],
        ['Invia l’avviso','Aggiungi una sola notifica alla persona che deve intervenire.','Azione: inserisci collegamento al file e prossimo passo.','✓ La persona riceve il contesto necessario.'],
        ['Testa due documenti','Prova un documento corretto e uno che non deve attivare la regola.','Azione: controlla cronologia e posizione finale.','✓ Il flusso distingue correttamente i due casi.']
      ]
    },

    'automatizzare-appuntamenti': {
      id:'automatizzare-appuntamenti', caseKey:'appuntamenti', category:'Appuntamenti',
      title:'Automatizzare la gestione degli appuntamenti',
      mission:'Riduci messaggi avanti e indietro e crea un percorso da prenotazione a promemoria.',
      focus:'semplificare disponibilità, prenotazione e promemoria',
      area:'Calendario / prenotazione / automazioni', object:'processo appuntamento',
      scenarioTitle:'Esempio: richiesta → disponibilità → prenotazione → promemoria',
      scenario:'La persona sceglie un orario disponibile, il calendario si aggiorna e il promemoria parte secondo una regola.',
      input:'Servizio, durata, disponibilità e contatto di prova.',
      setup:'Servizio → calendario → prenotazione → conferma → promemoria.',
      result:'La prenotazione segue un percorso standard senza coordinamento manuale continuo.',
      why:'Il primo obiettivo è eliminare il botta-e-risposta per trovare un orario.',
      stack:['Calendly','Make','HubSpot'],
      steps:[
        ['Definisci un solo servizio','Scegli l’appuntamento più frequente e stabilisci durata e disponibilità.','Azione: configura un solo tipo di meeting per il test.','✓ Il servizio ha durata, calendario e disponibilità chiari.'],
        ['Collega il calendario','Associa il calendario che deve bloccare gli orari occupati.','Azione: verifica con un evento reale di prova.','✓ Gli slot occupati non vengono proposti.'],
        ['Crea la pagina di prenotazione','Imposta il percorso con poche domande.','Azione: chiedi solo le informazioni che servono davvero.','✓ Una persona può prenotare senza assistenza.'],
        ['Testa una prenotazione','Fai una prenotazione con un indirizzo di test.','Azione: controlla conferma, calendario e dati raccolti.','✓ L’appuntamento appare correttamente.'],
        ['Aggiungi un promemoria','Configura un solo promemoria o messaggio automatico.','Azione: usa un intervallo coerente con il tipo di appuntamento.','✓ Il promemoria parte secondo la regola.'],
        ['Collega il cliente','Dopo il test collega la prenotazione al CRM se serve.','Azione: porta solo nome, email, servizio e data.','✓ Il nuovo appuntamento è ritrovabile anche nel processo cliente.']
      ]
    },

    'creare-workflow': {
      id:'creare-workflow', caseKey:'automazioni', category:'Automazioni',
      title:'Creare il tuo primo workflow automatico',
      mission:'Impara a trasformare un passaggio manuale in un trigger, una regola e un’azione verificabile.',
      focus:'eliminare un singolo passaggio manuale ricorrente',
      area:'Workflow / trigger / action', object:'workflow automatico',
      scenarioTitle:'Esempio: evento → dati → regola → azione',
      scenario:'Qualunque processo ripetitivo può essere tradotto in quattro pezzi. Prima descriviamo la regola in italiano, poi la costruiamo nel tool.',
      input:'Un evento iniziale e un risultato che vuoi ottenere automaticamente.',
      setup:'Trigger → dati → condizione → azione → verifica.',
      result:'Un workflow piccolo, leggibile e testato.',
      why:'La prima automazione deve essere abbastanza semplice da poter capire subito perché funziona o perché si ferma.',
      stack:['Make','Microsoft 365'],
      steps:[
        ['Descrivi la regola in una frase','Scrivi “quando succede X, fai Y”.','Azione: elimina eccezioni e dettagli avanzati dalla prima versione.','✓ La regola può essere spiegata a un’altra persona in una frase.'],
        ['Scegli il trigger','Individua l’evento più vicino all’origine del lavoro.','Azione: usa un evento concreto come nuova riga, form inviato o nuovo contatto.','✓ Puoi generare l’evento durante il test.'],
        ['Porta i dati necessari','Collega solo i dati che servono all’azione finale.','Azione: limita il primo test a 3–5 campi.','✓ Il workflow riceve i dati senza campi inutili.'],
        ['Aggiungi la condizione','Inserisci una sola regola quando il processo lo richiede.','Azione: prova sia il caso vero sia il caso falso.','✓ Il workflow distingue i due scenari.'],
        ['Esegui il test','Fai partire un caso di prova e leggi l’esecuzione.','Azione: controlla ogni passaggio prima di attivare il workflow.','✓ Ogni nodo termina con il risultato previsto.'],
        ['Attiva e misura','Attiva l’automazione su un gruppo piccolo o su un processo limitato.','Azione: conta passaggi manuali evitati e errori per una settimana.','✓ Hai una misura prima/dopo, non solo la sensazione che funzioni.']
      ]
    },

    'scegliere-crm': {
      id:'scegliere-crm', caseKey:'crm', category:'CRM',
      title:'Scegliere e impostare un CRM partendo dal lavoro reale',
      mission:'Non partire dalle funzioni. Parti da come entrano, avanzano e chiudono i clienti.',
      focus:'capire quali funzioni CRM servono davvero al processo',
      area:'CRM / pipeline / attività', object:'processo commerciale',
      scenarioTitle:'Esempio: lead → contatto → opportunità → prossima azione',
      scenario:'Prima costruiamo il processo, poi verifichiamo quale strumento lo gestisce senza complicarlo.',
      input:'Un caso commerciale reale e il percorso che segue fino alla chiusura.',
      setup:'Stati → campi minimi → opportunità → attività → controllo.',
      result:'Una struttura CRM minima con criteri chiari.',
      why:'Il CRM diventa utile quando il processo è definito prima della schermata.',
      stack:['HubSpot','Pipedrive','Make'],
      steps:[
        ['Disegna il processo fuori dal software','Scrivi gli stati che una richiesta attraversa.','Azione: limita il percorso a pochi passaggi realmente distinti.','✓ Puoi disegnare il flusso senza nominare alcun software.'],
        ['Definisci i dati minimi','Scegli le informazioni che servono per decidere il passo successivo.','Azione: tieni solo dati che qualcuno userà davvero.','✓ Sai cosa compilare e cosa lasciare fuori.'],
        ['Configura il primo caso','Crea un contatto e una opportunità di prova.','Azione: compila solo i campi minimi definiti prima.','✓ Il caso è completo senza una scheda interminabile.'],
        ['Aggiungi la prossima attività','Programma una azione concreta con responsabile e data.','Azione: evita “ricontatta cliente” e specifica cosa fare.','✓ Il sistema mostra il prossimo movimento.'],
        ['Prova il percorso completo','Sposta il caso attraverso più stati.','Azione: controlla che contatto, opportunità e attività restino collegati.','✓ Il CRM racconta il caso senza cercare informazioni altrove.'],
        ['Decidi cosa automatizzare','Solo dopo il test individua il passaggio ripetitivo che ha senso automatizzare.','Azione: parti da una sola automazione.','✓ Il CRM nasce come sistema operativo, non come archivio.']
      ]
    },

    'usare-ai-al-lavoro': {
      id:'usare-ai-al-lavoro', caseKey:'ai', category:'AI',
      title:'Usare l’AI al lavoro senza creare un altro strumento inutile',
      mission:'Trasforma un’attività ripetitiva in una procedura AI riutilizzabile e controllabile.',
      focus:'usare l’AI dove produce un risultato ripetibile',
      area:'AI / prompt / revisione', object:'procedura AI',
      scenarioTitle:'Esempio: note grezze → output strutturato → controllo',
      scenario:'L’AI non sostituisce il controllo: lo rende più veloce. Partiamo da un compito che fai spesso e costruiamo un modello riutilizzabile.',
      input:'Un esempio non sensibile del lavoro che vuoi trasformare.',
      setup:'Contesto → istruzione → formato → controllo → riutilizzo.',
      result:'Un prompt/procedura riutilizzabile con una checklist di controllo.',
      why:'La prima vittoria dell’AI è la ripetibilità, non la spettacolarità.',
      stack:['ChatGPT','Make','Microsoft 365'],
      steps:[
        ['Scegli un compito ripetitivo','Prendi un lavoro che fai spesso e che ha un risultato abbastanza stabile.','Azione: scrivi il risultato finale in una frase.','✓ Puoi riconoscere subito quando l’output è corretto.'],
        ['Prepara un esempio','Usa un testo o dati di prova privi di informazioni riservate non necessarie.','Azione: inserisci un caso rappresentativo.','✓ Hai un input con cui confrontare le risposte.'],
        ['Scrivi la procedura','Definisci contesto, obiettivo, regole e formato dell’output.','Azione: inserisci campi variabili come [CLIENTE], [DATA], [PROBLEMA].','✓ Puoi riusare lo stesso prompt cambiando solo i campi variabili.'],
        ['Controlla l’output','Verifica fatti, numeri, nomi e completezza.','Azione: definisci quali elementi devono sempre essere controllati da una persona.','✓ Hai una checklist di controllo, non solo un prompt.'],
        ['Salva il modello','Conserva la procedura dove il team può riutilizzarla.','Azione: assegna un nome chiaro e una versione.','✓ La seconda esecuzione è più rapida della prima.'],
        ['Collegalo al workflow','Solo dopo aver validato l’output, collega il punto del processo in cui serve.','Azione: automatizza soltanto l’ingresso o l’uscita che hai già testato.','✓ L’AI è entrata nel processo senza togliere controllo umano.']
      ]
    }
  };

  G.get=function(slug){return G[slug]||null;};
  G.keys=function(){return Object.keys(G).filter(function(k){return k!=='get'&&k!=='keys'});};
  window.PROJECTX_GOAL_GUIDES=G;
})();