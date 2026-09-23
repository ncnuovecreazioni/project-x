/* PROJECT-X GUIDE AUTOPILOT v2 — DETAILED TUTORIAL LIBRARY
   Guide operative: scenario, click, dati da inserire, test, risultato, errori comuni.
   Le etichette UI possono cambiare; quando possibile usiamo nomenclature attuali del tool.
*/
(function(){
  'use strict';

  var DEEP={
    make:{
      menu:'Scenarios / Create a new scenario',
      object:'scenario di automazione',
      scenario:'Una nuova richiesta arriva da un modulo o da Google Sheets. Make deve creare automaticamente il caso nel sistema operativo e assegnare il follow-up.',
      prepare:'Prepara un record di prova con nome, email e descrizione della richiesta.',
      steps:[
        ['Apri Make e crea lo scenario','Dalla dashboard scegli “Create a new scenario”. Nel builder premi il grande “+” e cerca l’app che riceve la richiesta.','Usa un trigger semplice, ad esempio una nuova riga o un nuovo elemento. Nel tutorial ufficiale Make il primo modulo viene configurato come trigger del workflow.','Deve comparire un modulo iniziale e, dopo il test, un record di esempio.'],
        ['Collega il secondo modulo','Premi il “+” alla destra del primo modulo e cerca il software dove vuoi salvare la richiesta.','Scegli l’azione concreta: creare un record, un’attività o una riga.','Il secondo modulo deve mostrare i campi che arrivano dal trigger.'],
        ['Crea la connessione','Quando Make chiede l’autorizzazione, premi “Create a connection” o equivalente e completa l’accesso al servizio.','Usa l’account che deve realmente eseguire il workflow.','La connessione deve risultare disponibile nel modulo senza errori.'],
        ['Mappa i dati','Nel secondo modulo clicca nei campi e seleziona i dati arrivati dal primo modulo. Per il primo test mappa solo nome, email e descrizione.','Evita campi inutili e logiche avanzate.','Il record di destinazione viene creato con i dati corretti.'],
        ['Esegui Run once','Salva e usa “Run once” per provare lo scenario. Genera un nuovo record nell’app sorgente.','Apri i moduli completati e leggi l’output di ogni passaggio.','Ogni modulo termina con un check positivo e nessun errore.'],
        ['Attiva e misura','Solo dopo il test attiva lo scenario. Poi osserva la cronologia delle esecuzioni.','Conta quante operazioni manuali non devi più fare e controlla eventuali duplicati.','Il nuovo caso percorre automaticamente il flusso previsto.']
      ],
      mistakes:['Attivare prima del test','Mappare troppi campi','Creare un workflow enorme al primo giorno']
    },
    pipedrive:{
      menu:'Leads / Deals / Pipeline',
      object:'opportunità commerciale',
      scenario:'Una richiesta arriva via email. Invece di lasciarla nella posta, la trasformi in opportunità, le assegni una fase e soprattutto una prossima attività.',
      prepare:'Scegli una richiesta reale non sensibile oppure crea un contatto di prova con nome, azienda e richiesta.',
      steps:[
        ['Apri Pipeline e crea una struttura minima','Vai alla vista Pipeline e mantieni poche fasi, per esempio Nuovo → Contatto → Proposta → Chiuso.','Non creare dieci stati: ogni fase deve rappresentare un momento reale della vendita.','Una opportunità spostata nella pipeline deve essere immediatamente leggibile.'],
        ['Crea l’organizzazione e il contatto','Apri l’area contatti e crea il soggetto del caso oppure collega quello già esistente.','Compila nome, email e un’informazione che serva davvero per il follow-up.','Puoi ritrovare il contatto dalla ricerca.'],
        ['Crea il Deal','Dalla pipeline aggiungi una nuova trattativa e collega il contatto.','Inserisci titolo, valore stimato e fase iniziale.','Il deal compare nella fase corretta e mantiene il collegamento col contatto.'],
        ['Crea la prossima attività','Apri il deal e aggiungi un’attività con data e responsabile.','Scrivi un’azione concreta, ad esempio “richiamare per confermare la proposta”.','Il deal non rimane senza un prossimo passo.'],
        ['Sposta e verifica','Dopo il contatto aggiorna la fase e completa l’attività.','Quando la situazione cambia, programma subito l’attività successiva.','La pipeline racconta stato e prossimo movimento.'],
        ['Controlla i deal fermi','Una volta a settimana cerca trattative senza attività futura o ferme troppo a lungo.','Correggi prima quelle con maggiore valore o urgenza.','Hai una lista chiara di follow-up da eseguire.']
      ],
      mistakes:['Usare la pipeline come archivio senza attività','Creare troppe fasi','Lasciare opportunità senza prossimo passo']
    },
    hubspot:{
      menu:'CRM > Contacts / Sales > Deals',
      object:'contatto + deal + task',
      scenario:'Un lead entra da sito o email. Lo registri, apri il deal e programmi la prossima attività così il team sa sempre cosa fare.',
      prepare:'Prepara un contatto di prova con nome, email, azienda e richiesta.',
      steps:[
        ['Crea o apri il contatto','Apri Contacts e cerca prima il contatto. Se non esiste, crealo.','Inserisci solo i dati necessari: nome, email, azienda e origine della richiesta.','Il contatto è ricercabile e collegabile a un deal.'],
        ['Crea il Deal','Dalla scheda del contatto crea una nuova opportunità/deal.','Compila nome del deal, valore e pipeline/stage iniziale.','Il deal è associato al contatto corretto.'],
        ['Definisci il prossimo task','Dalla timeline o area attività crea una task.','Assegna responsabile, scadenza e una descrizione operativa.','La prossima azione è visibile e datata.'],
        ['Aggiorna lo stage','Dopo il contatto cambia lo stage del deal.','Usa lo stesso criterio ogni volta: non spostare a caso.','Il funnel riflette la situazione reale.'],
        ['Controlla il percorso','Apri il record e verifica che attività, note, contatto e deal siano collegati.','Se manca un’associazione, correggila subito sul caso pilota.','Una sola scheda racconta la storia del caso.'],
        ['Replica la regola','Definisci 3 campi e 1 attività che devono essere sempre presenti nei nuovi lead.','Usa questa struttura come standard del team.','I nuovi casi seguono lo stesso processo.']
      ],
      mistakes:['Compilare campi inutili','Creare deal scollegati dai contatti','Usare stage senza una regola']
    },
    shopify:{
      menu:'Products / Orders / Settings',
      object:'ordine e procedura post-acquisto',
      scenario:'Un cliente acquista un prodotto. Prima controlli che il negozio funzioni, poi testi l’ordine e infine definisci cosa deve succedere dopo l’acquisto.',
      prepare:'Prepara un prodotto di prova e abilita un metodo di pagamento in modalità test.',
      steps:[
        ['Apri Products e controlla il prodotto','Apri Products e verifica titolo, prezzo, disponibilità e immagini.','Per il test usa un prodotto dedicato o un articolo reale che puoi gestire senza rischi.','Il prodotto può essere inserito nel carrello correttamente.'],
        ['Controlla Checkout e pagamenti','Apri le impostazioni del checkout e del provider di pagamento.','Per un test usa la modalità di prova disponibile nel tuo ambiente. Shopify raccomanda di effettuare almeno un ordine di prova durante la configurazione.','Il checkout può essere completato senza un addebito reale.'],
        ['Esegui un ordine di prova','Effettua il checkout usando i dati di test e completa la procedura.','Controlla conferma, stock, spedizione, tasse e notifiche.','L’ordine compare nell’area Orders con lo stato previsto.'],
        ['Definisci cosa succede dopo','Scrivi una sola regola post-acquisto: email, task, inserimento in CRM o altra azione.','Prima descrivi la regola in italiano, poi scegli lo strumento che la esegue.','Il comportamento desiderato è espresso in una frase.'],
        ['Verifica l’azione','Fai partire il percorso di prova e controlla che l’azione avvenga una sola volta.','Controlla soprattutto tempi e duplicati.','Il cliente riceve o genera esattamente il risultato previsto.'],
        ['Replica con prudenza','Quando il test è corretto, applica il workflow a un sottoinsieme prima di estenderlo.','Aggiungi un passaggio alla volta.','Il processo cresce senza perdere controllo.']
      ],
      mistakes:['Testare con pagamenti reali','Automatizzare prima di verificare checkout e stock','Aggiungere troppe azioni insieme']
    },
    getresponse:{
      menu:'Automation > Create workflow',
      object:'workflow di follow-up',
      scenario:'Una persona entra nella lista e riceve un messaggio iniziale, una pausa e un follow-up automatico.',
      prepare:'Prepara un contatto di test e una email breve con un solo obiettivo.',
      steps:[
        ['Crea il workflow','Vai su Automation e seleziona Create workflow. GetResponse consente di partire da zero o da template pre-progettati.','Per imparare usa un workflow breve creato da zero.','Il canvas mostra il punto di partenza del percorso.'],
        ['Configura il trigger','Scegli l’evento che deve far partire il workflow, per esempio l’ingresso di un contatto in una lista.','Collega il contatto di prova al trigger.','Il contatto può entrare nel workflow.'],
        ['Prepara il messaggio','Vai in Automation > Automation messages, crea il messaggio, imposta mittente, reply-to e oggetto e progetta il contenuto.','Mantieni il messaggio breve e con una sola CTA.','Il messaggio risulta pronto/ready per essere usato nel workflow.'],
        ['Inserisci attesa e follow-up','Torna al workflow, aggiungi l’attesa e poi il messaggio successivo.','Scegli un intervallo coerente con il tuo processo.','Il percorso mostra chiaramente trigger → email → attesa → follow-up.'],
        ['Testa prima di pubblicare','Esegui il percorso con un contatto di prova e controlla messaggi e tempi.','Verifica anche il contenuto ricevuto sul dispositivo reale.','Ogni passaggio avviene una volta sola.'],
        ['Pubblica e misura','Quando tutto è corretto pubblica il workflow e controlla statistiche e comportamento dei contatti.','Misura una sola metrica legata all’obiettivo.','Hai un dato con cui migliorare il percorso.']
      ],
      mistakes:['Creare subito una sequenza lunga','Pubblicare senza un contatto di test','Confondere messaggio normale e automation message']
    },
    activecampaign:{
      menu:'Automations > Create an automation',
      object:'automazione di follow-up',
      scenario:'Quando un contatto entra in una lista, ActiveCampaign invia una email, valuta una condizione e prosegue con l’azione corretta.',
      prepare:'Prepara una lista di test, un contatto e una email di benvenuto.',
      steps:[
        ['Apri Automations','Dal menu laterale scegli Automations, poi Create an automation. Puoi usare un template oppure Start from Scratch.','Per imparare parti da zero.','Si apre l’automation builder.'],
        ['Scegli il trigger','Aggiungi il trigger che identifica l’ingresso del contatto, per esempio Subscribe to a list.','Configura la lista di test.','Il contatto di prova soddisfa il trigger.'],
        ['Aggiungi l’azione email','Premi “+” nel builder e scegli l’azione email prevista dal tuo account.','Seleziona o crea il messaggio, controlla oggetto e contenuto.','Il messaggio è collegato al trigger.'],
        ['Aggiungi una logica semplice','Inserisci una condizione solo se serve, ad esempio risposta/interazione.','Mantieni il primo bivio semplice e leggibile.','Puoi distinguere i due percorsi senza ambiguità.'],
        ['Testa i due casi','Usa contatti di prova per verificare il percorso principale e quello alternativo.','Controlla cronologia, tag e azioni.','Entrambi i rami producono l’esito previsto.'],
        ['Attiva e controlla','Solo dopo il test attiva l’automazione.','Rivedi anche la condizione di uscita/re-entry.','I nuovi contatti percorrono la sequenza corretta.']
      ],
      mistakes:['Un’unica automazione enorme','Trigger troppo generici','Nessuna condizione di uscita']
    },
    systeme:{
      menu:'Funnels > page editor > form / rules',
      object:'funnel con acquisizione lead',
      scenario:'Una persona compila un form. Il lead viene acquisito, riceve una comunicazione e arriva al prossimo passo senza copia-incolla.',
      prepare:'Prepara una pagina funnel e un indirizzo email di test.',
      steps:[
        ['Apri il funnel','Apri il funnel e metti la pagina di ingresso in modalità modifica.','Individua il punto esatto in cui il visitatore deve lasciare i dati.','Hai una pagina chiara con un’unica azione principale.'],
        ['Inserisci il campo form','Nel page editor trascina Form input dalla barra laterale alla pagina. La documentazione ufficiale indica questo flusso di drag-and-drop.','Seleziona Input type = Email e, se serve, aggiungi Name.','Il campo è visibile e accetta un valore di prova.'],
        ['Imposta l’azione del form','Configura dove deve finire il contatto e cosa deve succedere dopo l’invio.','Usa una pagina di ringraziamento o il passaggio successivo del funnel.','Il contatto viene acquisito e il visitatore vede un esito.'],
        ['Crea il follow-up','Apri la sezione di automazione/campaign collegata e associa il trigger del nuovo contatto.','Imposta una sola email o azione iniziale.','Il lead entra nel percorso previsto.'],
        ['Fai il test completo','Apri la pagina come un visitatore, inserisci dati di prova e completa l’invio.','Verifica acquisizione, redirect e email.','Il percorso non richiede interventi manuali.'],
        ['Misura il funnel','Dopo i primi accessi controlla quanti visitatori arrivano al form e quanti completano il passo successivo.','Migliora una sola variabile alla volta.','Sai dove il funnel perde persone.']
      ],
      mistakes:['Form senza un prossimo passo','Campagna senza contatto di test','Troppe pagine prima del primo test']
    },
    monday:{
      menu:'Board > Automate > Create automation',
      object:'board operativo',
      scenario:'Una richiesta entra nel board, riceve responsabile e scadenza e, quando cambia stato, genera una notifica automatica.',
      prepare:'Scegli un solo processo ripetitivo, ad esempio richieste clienti o attività interne.',
      steps:[
        ['Crea il board','Dal workspace crea un nuovo board e scegli una struttura semplice. monday.com consente anche di creare board descrivendo il bisogno con AI.','Per il primo test crea poche colonne: Nome, Responsabile, Stato, Data.','Una richiesta è leggibile senza aprire dieci campi.'],
        ['Inserisci un item','Crea un item reale di prova e compila nome, responsabile e scadenza.','Usa una richiesta concreta.','L’item ha un proprietario e una data.'],
        ['Definisci gli stati','Usa una sequenza minima come Da fare → In corso → Fatto.','Non creare uno stato per ogni eccezione.','Il passaggio da uno stato all’altro è comprensibile.'],
        ['Apri Automate','Clicca Automate nella parte alta del board e poi Create from scratch/Create automation, secondo la vista disponibile.','Scegli un trigger come “When status changes to something”.','Il builder mostra trigger e azioni.'],
        ['Aggiungi l’azione','Scegli una sola azione: notifica a una persona, aggiornamento o altra azione disponibile.','Testala su un item di prova.','Il cambio di stato produce l’azione prevista.'],
        ['Controlla Run history','Dopo il test verifica la cronologia delle automazioni e osserva dove il processo si ferma.','Solo dopo replica il board sul resto del lavoro.','Hai un processo monitorabile, non solo una tabella.']
      ],
      mistakes:['Board troppo complesso','Automazioni senza responsabilità chiare','Usare AI senza verificare i blocchi generati']
    },
    brevo:{
      menu:'Automations > Workflows > Create an automation',
      object:'workflow di follow-up',
      scenario:'Un nuovo contatto entra in una lista e riceve automaticamente una comunicazione e una attività di follow-up.',
      prepare:'Prepara un contatto di test, una lista e una email.',
      steps:[
        ['Apri Automations','Vai su Automations > Workflows e clicca Create an automation. Brevo offre template oppure un’automazione da zero.','Per il primo test scegli un caso semplice.','L’editor del workflow è aperto.'],
        ['Scegli il punto di ingresso','Aggiungi il trigger che deve far entrare il contatto, per esempio un contatto aggiunto a una lista.','Usa una lista dedicata al test.','Il contatto di prova soddisfa il trigger.'],
        ['Aggiungi la comunicazione','Premi “+”, scegli l’azione email e seleziona/crea il messaggio.','Mantieni una CTA unica.','L’email è collegata al percorso.'],
        ['Aggiungi una pausa o un’attività','Inserisci una attesa oppure “Create a task” quando serve un tuo intervento. La documentazione ufficiale mostra la creazione automatica di attività tramite questa azione CRM.','Definisci titolo e scadenza.','La tua attività appare come previsto.'],
        ['Testa il workflow','Fai entrare il contatto di prova e controlla i passaggi sul canvas/cronologia.','Verifica invio e attività.','Nessun passaggio viene saltato.'],
        ['Attiva e monitora','Quando il test è corretto attiva l’automazione e osserva una sola metrica.','Non cambiare più elementi insieme.','Hai un workflow che puoi migliorare con dati reali.']
      ],
      mistakes:['Lista sbagliata come trigger','Attivare senza test','Fare più automazioni lunghe prima della prima prova']
    },
    semrush:{
      menu:'Projects > Site Audit / Keyword tools',
      object:'mini audit SEO',
      scenario:'Prima di scrivere nuovo contenuto, controlli il sito e scegli una singola opportunità SEO da trasformare in un’azione.',
      prepare:'Prepara il dominio e 3–5 query che descrivono il servizio/prodotto principale.',
      steps:[
        ['Crea il progetto','Apri Semrush e crea il progetto con il dominio corretto. Per il primo progetto Site Audit può essere configurato automaticamente.','Scegli paese e impostazioni coerenti col mercato che ti interessa.','Il progetto mostra il dominio corretto.'],
        ['Lancia Site Audit','Apri Site Audit, verifica Scope e limite di pagine e premi Start Audit. Semrush documenta anche la possibilità di pianificare audit giornalieri o settimanali.','Per il primo passaggio non modificare impostazioni avanzate senza motivo.','Il crawler parte e produce il report.'],
        ['Apri Errors e Warnings','Quando l’audit è pronto, apri Overview/Issues. Parti dagli Errors e poi passa ai Warnings: Semrush li distingue per severità.','Apri il dettaglio di un problema e leggi “How to fix” quando disponibile.','Hai individuato un problema concreto e non solo un punteggio.'],
        ['Fai una keyword research mirata','Apri Keyword Magic Tool o lo strumento keyword pertinente e inserisci una query del cliente.','Scegli poche keyword con intento chiaro e salva quelle utili.','Hai un piccolo gruppo prioritario.'],
        ['Trasforma il dato in una modifica','Scegli una sola pagina esistente oppure decidi quale nuova pagina creare.','Collega una keyword primaria a una modifica misurabile.','Puoi dire esattamente cosa hai cambiato.'],
        ['Riesegui e confronta','Dopo aver applicato le modifiche, riesegui l’audit o confronta i dati nel tempo. Semrush permette di esportare risultati e confrontare crawl.','Misura un singolo risultato prima/dopo.','Hai una procedura SEO ripetibile.']
      ],
      mistakes:['Guardare solo il punteggio Health','Cambiare tutto il sito insieme','Confondere keyword con intent di ricerca']
    },
    kit:{
      menu:'Subscribers / Sequences / Visual Automations',
      object:'percorso email per iscritti',
      scenario:'Un nuovo iscritto entra in un percorso, riceve una sequenza e viene portato verso il passo successivo.',
      prepare:'Prepara un subscriber di test e una sequenza breve di 2 email.',
      steps:[
        ['Crea la sequenza','Apri la sezione Sequences e crea una nuova sequenza.','Dai un nome interno comprensibile, ad esempio “Nuovo lead – primo follow-up”.','La sequenza è salvabile come bozza.'],
        ['Scrivi il primo messaggio','Crea una email con un problema, una soluzione e una sola CTA.','Usa un mittente e un tono coerenti con il tuo brand.','Il messaggio è pronto per il test.'],
        ['Aggiungi il secondo messaggio','Inserisci una seconda email solo se serve a completare il caso.','Prevedi un intervallo realistico tra i messaggi.','Il percorso ha una sequenza comprensibile.'],
        ['Collega l’ingresso','Apri Visual Automations e crea il trigger che deve aggiungere il subscriber alla sequenza.','Testa con un contatto dedicato.','Il contatto entra nel percorso.'],
        ['Verifica e controlla','Controlla che il subscriber riceva il messaggio previsto e che non entri due volte per errore.','Controlla i tempi e lo stato della sequenza.','Il percorso è ripetibile.'],
        ['Replica e misura','Dopo il test applica la sequenza al pubblico reale e misura una sola azione finale.','Mantieni separati i test dalle campagne attive.','Sai quale passaggio porta il valore.']
      ],
      mistakes:['Sequenza troppo lunga','CTA multiple nello stesso messaggio','Testare sul pubblico reale']
    },
    chatgpt:{
      menu:'ChatGPT > New chat / Projects',
      object:'procedura AI riutilizzabile',
      scenario:'Hai un’attività ripetitiva, ad esempio trasformare note grezze in un report ordinato. Crei una procedura AI che puoi riusare.',
      prepare:'Prendi un esempio non sensibile del testo reale che vuoi trasformare.',
      steps:[
        ['Definisci il risultato','Apri una nuova chat oppure un Project e scrivi prima il risultato desiderato in una frase.','Esempio: “trasforma queste note in un report con 5 sezioni”.','Il risultato ha struttura e criteri chiari.'],
        ['Inserisci il contesto','Indica ruolo, obiettivo, pubblico, vincoli e formato.','Non inserire dati personali o riservati se non sono necessari.','Il modello comprende cosa deve fare.'],
        ['Usa un prompt completo','Scrivi: obiettivo + dati + regole + formato dell’output + cosa evitare.','Chiedi un output facilmente controllabile, ad esempio una tabella o sezioni fisse.','L’output è leggibile e ripetibile.'],
        ['Controlla l’output','Verifica numeri, fatti, nomi, tono e completezza.','Decidi quali parti richiedono sempre revisione umana.','Sai cosa può essere automatizzato e cosa no.'],
        ['Salva il modello','Conserva il prompt con campi variabili, ad esempio [CLIENTE], [DATA], [PROBLEMA].','Usalo come modello invece di riscriverlo ogni volta.','La seconda esecuzione richiede meno lavoro.'],
        ['Collegalo al processo','Quando il prompt funziona, collegalo al punto del lavoro in cui serve, eventualmente tramite lo stack indicato da PROJECT-X.','Misura tempo prima/dopo.','L’AI è diventata una procedura, non una chat casuale.']
      ],
      mistakes:['Prompt troppo generici','Dare per buono il primo output','Inserire dati sensibili non necessari']
    },
    canva:{
      menu:'Canva > Create a design / Templates',
      object:'template riutilizzabile',
      scenario:'Devi creare ogni settimana la stessa tipologia di contenuto. Prepari un template e poi cambi solo testo e immagini.',
      prepare:'Scegli un solo formato ricorrente, ad esempio post social o presentazione.',
      steps:[
        ['Crea il formato','Apri Canva e seleziona Create a design, poi il formato che utilizzi davvero.','Scegli una dimensione adatta al canale finale.','Hai una tela corretta e non devi ridimensionare dopo.'],
        ['Scegli un template','Cerca un modello coerente con il tuo stile e aprilo.','Elimina gli elementi non necessari.','La struttura base è pronta.'],
        ['Inserisci il contenuto','Sostituisci testo, immagini e dati mantenendo le gerarchie visive.','Non cambiare ogni elemento: conserva il layout.','Il contenuto è leggibile anche senza spiegazioni.'],
        ['Crea la variante','Duplica la pagina/design e sostituisci solo ciò che cambia.','Usa questa copia come prossimo contenuto.','Il lavoro della seconda versione è più veloce.'],
        ['Controlla il formato','Usa Preview e verifica margini, leggibilità e dimensioni.','Controlla il risultato anche su mobile se il contenuto è social.','Il file è pronto per il canale previsto.'],
        ['Salva come standard','Rinomina il design e organizzalo nel progetto/cartella corretta.','Condividi il template con chi dovrà riutilizzarlo.','Hai trasformato un lavoro ripetitivo in un modello.']
      ],
      mistakes:['Cambiare il layout ogni volta','Testo troppo piccolo','Nessuna struttura di archiviazione']
    }
  };

  var OBJECTS={
    mailchimp:['Audience > Create / Automations','lista contatti e journey','nuovo contatto → email → follow-up'],
    klaviyo:['Flows / Create Flow','flow customer journey','evento → messaggio → condizione'],
    omnisend:['Automation','workflow e-commerce','ordine → messaggio → follow-up'],
    zapier:['Zaps > Create Zap','Zap','Trigger → Action'],
    'power-automate':['My flows > New flow','cloud flow','evento → azione Microsoft 365'],
    n8n:['Workflows > New Workflow','workflow a nodi','trigger → nodo dati → azione'],
    clickup:['Workspace > Space/List','task di progetto','task → responsabile → stato → scadenza'],
    asana:['Projects > New project / Rules','progetto con task','task → responsabile → regola'],
    trello:['Board > Create / Butler Automation','board operativo','card → stato → automazione'],
    notion:['New page > Database','database operativo','record → proprietà → vista'],
    basecamp:['Projects > New project','progetto','todo → responsabile → scadenza'],
    wrike:['Projects > New project','workflow di progetto','task → stato → assegnazione'],
    constant-contact:['Campaigns / Automation','campagna email','contatto → email → follow-up'],
    drip:['Workflows','workflow customer lifecycle','evento → email → condizione'],
    ahrefs:['Site Explorer / Keywords Explorer','ricerca SEO','dominio → keyword → opportunità'],
    'se-ranking':['Projects / Rank Tracker / Website Audit','progetto SEO','dominio → keyword → monitoraggio'],
    woocommerce:['Products / Orders / WooCommerce Settings','negozio e ordine','prodotto → ordine → post-acquisto'],
    wix:['Site & Mobile App / Automations','pagina + automazione','form → contatto → azione'],
    squarespace:['Pages / Commerce','pagina o prodotto','visita → azione → conversione'],
    calendly:['Event Types','tipo di appuntamento','link → disponibilità → prenotazione'],
    acuity:['Appointment Types','servizio prenotabile','servizio → disponibilità → booking'],
    'cal-com':['Event Types','evento di scheduling','link → disponibilità → booking'],
    pandadoc:['Templates / Documents','template documento','dati → documento → firma'],
    docusign:['Templates / Envelopes','modello di firma','documento → destinatari → firma'],
    'adobe-acrobat':['Edit PDF / Fill & Sign','procedura PDF','PDF → modifica → firma'],
    'microsoft-365':['Outlook / Excel / Teams / SharePoint','processo Microsoft 365','email → dato → collaborazione'],
    'google-workspace':['Gmail / Drive / Sheets / Calendar','processo Google Workspace','email → foglio → calendario'],
    airtable:['Bases / Automations','database operativo','record → automazione → risultato'],
    dropbox:['Files / Folders / Sharing','archivio documentale','file → cartella → condivisione'],
    claude:['New chat / Projects / Documents','procedura AI','contesto → analisi → output'],
    jasper:['Campaigns / Content','procedura content marketing','brief → contenuto → revisione'],
    quickbooks:['Invoices / Expenses / Reports','procedura contabile','operazione → documento → report'],
    holded:['Sales / Billing / Projects','processo aziendale','cliente → operazione → risultato'],
    capsule:['People / Opportunities','pipeline CRM','contatto → opportunità → attività'],
    insightly:['Contacts / Projects / Opportunities','CRM + progetto','cliente → opportunità → progetto'],
    scoro:['Projects / Sales / Invoicing','processo aziendale','lead → progetto → fatturazione']
  };

  var PACK={
    crm:{
      title:'Segui una richiesta commerciale dall’ingresso al follow-up',
      steps:[
        ['Apri la sezione principale','Vai in '+((null))+' e cerca l’area indicata sopra.','Azione: apri il menu e individua il punto in cui creare il primo caso.','✓ Sai dove nasce il caso.'],
        ['Crea un caso pilota','Crea un solo contatto, lead, deal o opportunità.','Azione: inserisci nome, contatto e richiesta.','✓ Il caso è visibile.'],
        ['Compila solo ciò che serve','Aggiungi stato, responsabile e una scadenza se disponibili.','Azione: evita campi che non influenzano il prossimo passo.','✓ Il caso è pronto per essere lavorato.'],
        ['Imposta la prossima azione','Crea una attività, nota, task o follow-up.','Azione: scrivi esattamente cosa deve accadere e quando.','✓ Esiste un prossimo passo datato.'],
        ['Fai il test completo','Esegui l’azione e aggiorna lo stato.','Azione: verifica cronologia e collegamenti.','✓ Il caso racconta il percorso.'],
        ['Crea la regola','Ripeti lo schema su pochi casi e osserva dove si bloccano.','Azione: standardizza stati, campi e prossima attività.','✓ Il processo è replicabile.']
      ]
    },
    automation:{
      title:'Elimina un passaggio manuale con un primo workflow',
      steps:[
        ['Apri AREA_TUTORIALE','Vai nella sezione workflow/automazione del software.','Azione: individua Create / New workflow / Automation.','✓ Hai aperto il builder.'],
        ['Scegli il trigger','Decidi quale evento deve far partire il flusso.','Azione: usa un evento che puoi generare facilmente in test.','✓ Il trigger produce un record.'],
        ['Configura l’azione','Aggiungi la prima azione: crea, aggiorna, invia o notifica.','Azione: collega solo i dati indispensabili.','✓ L’azione mostra i campi ricevuti.'],
        ['Esegui il test','Lancia il workflow con un caso di prova.','Azione: controlla output e cronologia.','✓ Una sola esecuzione produce un risultato.'],
        ['Gestisci l’errore','Apri log/history e individua eventuali fallimenti.','Azione: correggi un punto alla volta.','✓ Sai perché il workflow passa o si ferma.'],
        ['Attiva e replica','Pubblica solo dopo il test.','Azione: applica il workflow a pochi casi reali prima di estenderlo.','✓ Il processo diventa automatico.']
      ]
    },
    marketing:{
      title:'Costruisci un mini percorso per un nuovo contatto',
      steps:[
        ['Apri la sezione marketing','Vai in '+((null))+' e cerca liste/audience e automazioni.','Azione: scegli il pubblico di test.','✓ Hai identificato l’ingresso.'],
        ['Prepara il contatto','Crea o importa un solo contatto di prova.','Azione: verifica email e stato.','✓ Il contatto è pronto.'],
        ['Crea il messaggio','Prepara una email con una CTA unica.','Azione: scrivi titolo, contenuto e prossimo passo.','✓ Il messaggio è pronto.'],
        ['Collega trigger e attesa','Imposta ingresso, eventuale attesa e follow-up.','Azione: mantieni il percorso a 2 messaggi massimo nel test.','✓ Il flusso è leggibile.'],
        ['Testa','Fai entrare il contatto e verifica invio e tempi.','Azione: controlla anche eventuale unsubscribe/bounce.','✓ Il percorso arriva al risultato.'],
        ['Misura','Scegli una metrica legata all’obiettivo.','Azione: confronta il dato prima/dopo.','✓ Hai un criterio di miglioramento.']
      ]
    },
    ecommerce:{
      title:'Porta un ordine dal checkout al post-acquisto',
      steps:[
        ['Apri AREA_TUTORIALE','Vai nella sezione prodotti/ordini/impostazioni.','Azione: controlla che il prodotto di test sia pronto.','✓ Il caso può partire.'],
        ['Crea o controlla il prodotto','Verifica prezzo, disponibilità e dati necessari.','Azione: correggi solo ciò che serve al test.','✓ Il prodotto passa il controllo.'],
        ['Esegui un ordine di prova','Usa la modalità di pagamento test disponibile.','Azione: completa il checkout.','✓ L’ordine appare nello stato previsto.'],
        ['Definisci il post-acquisto','Scegli una sola azione dopo l’ordine.','Azione: email, CRM, task o notifica.','✓ Sai cosa deve succedere.'],
        ['Verifica il workflow','Controlla la singola esecuzione e i duplicati.','Azione: apri storico/log quando disponibile.','✓ L’azione avviene una volta.'],
        ['Replica','Dopo il test applica il modello al flusso reale.','Azione: aggiungi un passaggio alla volta.','✓ Il processo è stabile.']
      ]
    },
    projects:{
      title:'Trasforma una richiesta in un’attività controllabile',
      steps:[
        ['Apri AREA_TUTORIALE','Crea un progetto/board/lista per un solo processo reale.','Azione: scegli un nome facile da capire.','✓ Il progetto è identificabile.'],
        ['Crea un task','Inserisci una richiesta vera ma semplice.','Azione: compila titolo e contesto.','✓ Il task è leggibile.'],
        ['Assegna responsabile e data','Dai un proprietario e una scadenza.','Azione: evita attività senza responsabile.','✓ È chiaro chi deve fare cosa.'],
        ['Configura gli stati','Imposta una sequenza minima.','Azione: usa Da fare → In corso → Fatto come punto di partenza.','✓ Lo stato è leggibile.'],
        ['Aggiungi una regola','Automatizza una sola azione legata a un evento.','Azione: notifica o aggiorna il task.','✓ La regola funziona.'],
        ['Controlla i blocchi','Guarda quali task restano fermi.','Azione: correggi il collo di bottiglia più frequente.','✓ Il board aiuta davvero il lavoro.']
      ]
    },
    documents:{
      title:'Crea un documento ricorrente senza ricostruirlo ogni volta',
      steps:[
        ['Apri AREA_TUTORIALE','Vai in templates/documenti/modelli.','Azione: individua il tipo di documento ricorrente.','✓ Hai un documento campione.'],
        ['Crea il modello','Imposta testo fisso e campi variabili.','Azione: separa informazioni fisse da quelle del cliente.','✓ Il modello è riutilizzabile.'],
        ['Compila un caso test','Usa valori di prova e genera il documento.','Azione: verifica nomi, date e importi.','✓ Il documento è corretto.'],
        ['Invia o firma','Segui il passaggio di invio/firma previsto dal tool.','Azione: prova con destinatario di test.','✓ Il destinatario riceve il documento.'],
        ['Controlla archivio','Salva con una regola di nome e cartella.','Azione: definisci una posizione standard.','✓ Ritrovi il file in pochi secondi.'],
        ['Replica','Usa lo stesso modello su un secondo caso.','Azione: documenta i campi obbligatori.','✓ Hai eliminato il copia-incolla.']
      ]
    },
    ai:{
      title:'Trasforma un compito ripetitivo in una procedura AI',
      steps:[
        ['Apri AREA_TUTORIALE','Entra nell’area chat/project/documenti del tool.','Azione: identifica il compito che vuoi delegare.','✓ Il risultato atteso è scritto.'],
        ['Prepara il contesto','Inserisci obiettivo, dati, pubblico e vincoli.','Azione: elimina informazioni inutili o sensibili.','✓ L’AI comprende il caso.'],
        ['Scrivi il prompt','Indica formato, struttura e criteri di qualità.','Azione: chiedi un output controllabile.','✓ L’output ha una forma coerente.'],
        ['Revisiona','Controlla fatti, numeri, tono e completezza.','Azione: segna cosa deve restare umano.','✓ Sai cosa puoi delegare.'],
        ['Salva il modello','Rendi il prompt riutilizzabile con campi variabili.','Azione: salva esempio + prompt + checklist di controllo.','✓ La seconda esecuzione è più rapida.'],
        ['Collega al processo','Usa il tool nel punto preciso dove serve.','Azione: misura il tempo evitato.','✓ L’AI produce valore nel flusso reale.']
      ]
    },
    seo:{
      title:'Da una ricerca SEO a una sola azione concreta',
      steps:[
        ['Apri AREA_TUTORIALE','Vai nella sezione progetto/audit/keyword del tool.','Azione: imposta dominio e mercato.','✓ Il progetto è corretto.'],
        ['Inserisci la query','Parti da un problema che il cliente cerca davvero.','Azione: raccogli poche query prioritarie.','✓ Hai un gruppo utile.'],
        ['Analizza i risultati','Guarda SERP, volume, intento o problemi tecnici a seconda dello strumento.','Azione: scegli un solo punto da migliorare.','✓ Sai cosa cambiare.'],
        ['Applica una modifica','Ottimizza una pagina o crea un contenuto mirato.','Azione: cambia poche cose misurabili.','✓ Puoi attribuire l’effetto.'],
        ['Monitora','Salva keyword/pagina e controlla il risultato dopo un periodo coerente.','Azione: confronta prima/dopo.','✓ Hai un dato di miglioramento.'],
        ['Replica','Ripeti lo stesso ciclo sulla seconda opportunità.','Azione: mantieni la stessa metodologia.','✓ Il lavoro SEO diventa processo.']
      ]
    },
    appointments:{
      title:'Permetti al cliente di prenotare senza coordinamento manuale',
      steps:[
        ['Apri AREA_TUTORIALE','Vai in Event Types/Appointment Types.','Azione: crea un solo servizio.','✓ L’evento è definito.'],
        ['Imposta durata e disponibilità','Scegli durata, giorni e fasce orarie.','Azione: collega il calendario reale.','✓ Gli slot occupati non vengono proposti.'],
        ['Crea il link','Salva il tipo di appuntamento e copia il link pubblico.','Azione: aprilo in una finestra anonima/test.','✓ Un cliente può arrivare alla prenotazione.'],
        ['Imposta il promemoria','Aggiungi una sola comunicazione di reminder.','Azione: controlla destinatario e tempistica.','✓ Il promemoria parte correttamente.'],
        ['Prenota come cliente','Fai una prenotazione di prova.','Azione: verifica calendario, email e conferma.','✓ Nessun coordinamento manuale.'],
        ['Replica','Collega il link al punto in cui arrivano le richieste.','Azione: misura appuntamenti completati e no-show.','✓ Il calendario diventa un canale automatico.']
      ]
    },
    productivity:{
      title:'Collega una informazione al passaggio successivo',
      steps:[
        ['Apri AREA_TUTORIALE','Individua email, file, foglio, calendario o area collaborazione.','Azione: scegli una sola attività ricorrente.','✓ Il punto di partenza è definito.'],
        ['Crea un caso di prova','Prepara un file, email, riga o evento.','Azione: usa un esempio piccolo ma reale.','✓ Il caso è pronto.'],
        ['Definisci il passaggio','Scrivi cosa deve accadere dopo.','Azione: sposta, notifica, aggiorna o collega il dato.','✓ La regola è esprimibile in una frase.'],
        ['Esegui e controlla','Fai il passaggio manualmente una prima volta.','Azione: verifica dove deve finire il dato.','✓ Conosci il risultato atteso.'],
        ['Automatizza quando disponibile','Collega il trigger e l’azione nello strumento.','Azione: fai un test controllato.','✓ Il passaggio avviene senza copia-incolla.'],
        ['Standardizza','Documenta nomi, cartelle, campi e regole.','Azione: replica su un secondo caso.','✓ Il processo è ripetibile.']
      ]
    },
    design:{
      title:'Crea una volta un asset e riusalo',
      steps:[
        ['Apri AREA_TUTORIALE','Scegli il formato di contenuto che produci più spesso.','Azione: usa un solo formato pilota.','✓ Hai un obiettivo grafico chiaro.'],
        ['Parti da un modello','Apri un template oppure crea una base vuota.','Azione: imposta dimensioni, griglia e gerarchia.','✓ Il layout è pronto.'],
        ['Inserisci i contenuti','Sostituisci testo e immagini senza rompere la struttura.','Azione: mantieni stile e gerarchia.','✓ Il risultato è leggibile.'],
        ['Duplica','Crea una copia e cambia solo i dati variabili.','Azione: usa la copia come seconda versione.','✓ La seconda creazione è più veloce.'],
        ['Controlla l’esportazione','Usa preview/download nel formato richiesto.','Azione: verifica dimensioni e leggibilità.','✓ Il file è pronto per il canale.'],
        ['Crea lo standard','Salva e organizza il template per riutilizzarlo.','Azione: documenta cosa si può cambiare e cosa no.','✓ Hai un sistema creativo replicabile.']
      ]
    }
  };

  function catKey(tool){
    var c=String(tool.category||'').toLowerCase();
    if(c.indexOf('crm')>=0||c.indexOf('sales')>=0) return 'crm';
    if(c.indexOf('automation')>=0||c.indexOf('workflow')>=0||c.indexOf('integr')>=0) return 'automation';
    if(c.indexOf('email')>=0||c.indexOf('marketing')>=0) return 'marketing';
    if(c.indexOf('e-commerce')>=0||c.indexOf('ecommerce')>=0||c.indexOf('website')>=0) return 'ecommerce';
    if(c.indexOf('project')>=0||c.indexOf('task')>=0||c.indexOf('productivity')>=0||c.indexOf('work')>=0) return 'projects';
    if(c.indexOf('document')>=0||c.indexOf('pdf')>=0||c.indexOf('signature')>=0||c.indexOf('quote')>=0) return 'documents';
    if(c.indexOf('appointment')>=0||c.indexOf('scheduling')>=0) return 'appointments';
    if(c.indexOf('ai')>=0) return 'ai';
    if(c.indexOf('seo')>=0) return 'seo';
    if(c.indexOf('design')>=0) return 'design';
    return 'productivity';
  }

  function deepToPublic(id,d){
    return {
      id:id,
      detailed:true,
      menu:d.menu,
      object:d.object,
      scenario:d.scenario,
      prepare:d.prepare,
      steps:d.steps,
      mistakes:d.mistakes||[],
      officialSearch:'',
      level:'Pratico'
    };
  }

  function build(tool){
    var id=String(tool&&tool.id||'').toLowerCase();
    if(DEEP[id]) return deepToPublic(id,DEEP[id]);

    var o=OBJECTS[id]||[(tool&&tool.category)||'Software', 'procedura operativa', 'caso reale → configurazione → test'];
    var p=PACK[catKey(tool)]||PACK.productivity;
    var steps=p.steps.map(function(s){
      return [s[0].replace('AREA_TUTORIALE',o[0]),s[1].replace('AREA_TUTORIALE',o[0]),s[2],s[3]];
    });
    return {
      id:id,
      detailed:true,
      menu:o[0],
      object:o[1],
      scenario:'Esempio pratico con '+(tool.name||'il software')+': '+(tool.description||'portare una attività reale dal punto di partenza al risultato')+'.',
      prepare:'Prepara un solo caso di prova, piccolo e rappresentativo del lavoro reale.',
      steps:steps,
      mistakes:['Configurare tutto insieme','Saltare il test','Non definire il risultato atteso'],
      level:'Pratico'
    };
  }

  window.PROJECTX_DETAILED_TUTORIALS={
    get:function(toolOrId){return build(typeof toolOrId==='string'?{id:toolOrId}:toolOrId||{});},
    has:function(toolOrId){var id=typeof toolOrId==='string'?toolOrId:(toolOrId&&toolOrId.id);return !!build({id:id}).detailed;},
    coverage:function(){var n=0;try{n=Array.isArray(window.SOFTWARE_DATABASE)?window.SOFTWARE_DATABASE.length:0}catch(e){}return {total:n,withDetailed:n};}
  };
})();