/* =========================================================
   PROJECT-X — WOW / X-RAY PREVIEW
   ---------------------------------------------------------
   Esperienza live pre-analisi. Non modifica il Decision Engine.
   Mostra segnali rilevati dal testo inserito dall'utente.
   ========================================================= */
(function(){
  'use strict';

  var textarea = document.getElementById('quickProblem');
  var proof = document.querySelector('#home .px-proof');
  if(!textarea || !proof || document.getElementById('px-wow-xray')) return;

  var CSS = `
    .px-wow-xray{
      width:min(900px,100%);
      margin:14px auto 0;
      padding:18px;
      border:1px solid rgba(124,92,255,.16);
      border-radius:22px;
      background:
        radial-gradient(circle at 10% 0%,rgba(124,92,255,.08),transparent 32%),
        linear-gradient(145deg,rgba(12,18,32,.94),rgba(7,10,18,.96));
      text-align:left;
      box-shadow:0 20px 65px rgba(0,0,0,.16);
    }
    .px-wow-head{
      display:flex;
      align-items:flex-start;
      justify-content:space-between;
      gap:12px;
    }
    .px-wow-kicker{
      font-size:8px;
      letter-spacing:.16em;
      color:#a99cff;
      font-weight:950;
      text-transform:uppercase;
    }
    .px-wow-title{
      margin-top:5px;
      font-size:18px;
      line-height:1.08;
      font-weight:950;
      letter-spacing:-.035em;
    }
    .px-wow-state{
      display:inline-flex;
      align-items:center;
      gap:6px;
      padding:7px 9px;
      border-radius:999px;
      border:1px solid rgba(54,217,157,.14);
      background:rgba(54,217,157,.04);
      color:#7ce8bd;
      font-size:8px;
      font-weight:900;
      white-space:nowrap;
    }
    .px-wow-dot{
      width:6px;height:6px;border-radius:50%;
      background:#36d99d;
      box-shadow:0 0 0 5px rgba(54,217,157,.06);
      animation:pxWowPulse 1.6s ease-in-out infinite;
    }
    .px-wow-copy{
      margin:6px 0 0;
      color:#7e8ca3;
      font-size:9px;
      line-height:1.45;
      max-width:650px;
    }
    .px-wow-grid{
      display:grid;
      grid-template-columns:repeat(4,1fr);
      gap:7px;
      margin-top:14px;
    }
    .px-wow-signal{
      min-height:78px;
      padding:11px;
      border:1px solid rgba(255,255,255,.065);
      border-radius:13px;
      background:rgba(255,255,255,.018);
      transition:.22s ease;
    }
    .px-wow-signal.active{
      border-color:rgba(124,92,255,.30);
      background:rgba(124,92,255,.075);
      transform:translateY(-2px);
      box-shadow:0 11px 38px rgba(124,92,255,.08);
    }
    .px-wow-icon{
      width:26px;height:26px;
      display:grid;place-items:center;
      border-radius:8px;
      background:rgba(124,92,255,.09);
      color:#c5bbff;
      font-size:12px;
    }
    .px-wow-signal b{
      display:block;
      margin-top:7px;
      font-size:9px;
    }
    .px-wow-signal span{
      display:block;
      margin-top:3px;
      color:#6f7d94;
      font-size:7px;
      line-height:1.35;
    }
    .px-wow-bottom{
      display:grid;
      grid-template-columns:1fr 1fr;
      gap:8px;
      margin-top:9px;
    }
    .px-wow-output{
      padding:11px 12px;
      border:1px solid rgba(255,255,255,.06);
      border-radius:12px;
      background:rgba(255,255,255,.015);
    }
    .px-wow-output span{
      display:block;
      font-size:7px;
      letter-spacing:.12em;
      color:#748198;
      font-weight:900;
    }
    .px-wow-output strong{
      display:block;
      margin-top:5px;
      color:#e9edf5;
      font-size:9px;
      line-height:1.35;
    }
    .px-wow-hint{
      margin-top:9px;
      color:#59677e;
      font-size:7px;
      line-height:1.45;
    }
    .px-wow-hint b{color:#7d8ba1}
    @keyframes pxWowPulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.55;transform:scale(.82)}}
    @media(max-width:700px){
      .px-wow-grid{grid-template-columns:1fr 1fr}
      .px-wow-bottom{grid-template-columns:1fr}
      .px-wow-head{display:block}
      .px-wow-state{margin-top:9px}
    }
    @media(prefers-reduced-motion:reduce){
      .px-wow-signal{transition:none}
      .px-wow-dot{animation:none}
    }
  `;

  var style=document.createElement('style');
  style.id='px-wow-styles';
  style.textContent=CSS;
  document.head.appendChild(style);

  var box=document.createElement('section');
  box.id='px-wow-xray';
  box.className='px-wow-xray';
  box.setAttribute('aria-label','Anteprima live dei segnali PROJECT-X');
  box.innerHTML=
    '<div class="px-wow-head">'+
      '<div>'+
        '<div class="px-wow-kicker">PROJECT-X · LIVE X-RAY</div>'+
        '<div class="px-wow-title">Mentre scrivi, PROJECT-X inizia già a mettere ordine.</div>'+
        '<p class="px-wow-copy" id="pxWowCopy">Descrivi il problema con parole tue. Qui sotto vedrai quali segnali operativi vengono riconosciuti prima dell’analisi completa.</p>'+
      '</div>'+
      '<div class="px-wow-state"><i class="px-wow-dot"></i><span id="pxWowState">IN ATTESA</span></div>'+
    '</div>'+
    '<div class="px-wow-grid">'+
      '<div class="px-wow-signal" data-signal="time"><div class="px-wow-icon">⏱</div><b>Tempo</b><span>attività ripetitive e lavoro manuale</span></div>'+
      '<div class="px-wow-signal" data-signal="sales"><div class="px-wow-icon">↗</div><b>Vendite</b><span>lead, clienti, preventivi e follow-up</span></div>'+
      '<div class="px-wow-signal" data-signal="data"><div class="px-wow-icon">▦</div><b>Dati</b><span>Excel, copia-incolla, informazioni sparse</span></div>'+
      '<div class="px-wow-signal" data-signal="automation"><div class="px-wow-icon">✦</div><b>Automazione</b><span>collegamenti, workflow, notifiche e regole</span></div>'+
    '</div>'+
    '<div class="px-wow-bottom">'+
      '<div class="px-wow-output"><span>SEGNALI RILEVATI</span><strong id="pxWowSignals">Ancora nessuno. Inizia a scrivere.</strong></div>'+
      '<div class="px-wow-output"><span>PROJECT-X PREPARERÀ</span><strong id="pxWowOutput">software centrale → stack → prima automazione → piano operativo</strong></div>'+
    '</div>'+
    '<div class="px-wow-hint"><b>Anteprima live:</b> non è il punteggio finale e non modifica il motore. Serve a rendere visibile il percorso che parte dal tuo problema.</div>';

  proof.parentNode.insertBefore(box,proof);

  var rules={
    time:/perd|tempo|ore|ripet|manual|copia.?incolla|ricopio|troppo lavoro|lavoro manuale|ripetitivo/i,
    sales:/lead|cliente|clienti|preventiv|vendit|commercial|follow.?up|richiam|contatt|acquisiz/i,
    data:/excel|foglio|fogli|dati|database|spreadsheet|informaz|document|pdf|csv/i,
    automation:/automat|workflow|colleg|integraz|trigger|notific|regola|api|process/i
  };

  function update(){
    var value=String(textarea.value||'').trim();
    var labels=[];
    Object.keys(rules).forEach(function(key){
      var el=box.querySelector('[data-signal="'+key+'"]');
      var active=Boolean(value && rules[key].test(value));
      if(el) el.classList.toggle('active',active);
      if(active){
        labels.push(key==='time'?'Tempo':key==='sales'?'Vendite':key==='data'?'Dati':'Automazione');
      }
    });

    var state=document.getElementById('pxWowState');
    var copy=document.getElementById('pxWowCopy');
    var signals=document.getElementById('pxWowSignals');

    if(!value){
      state.textContent='IN ATTESA';
      copy.textContent='Descrivi il problema con parole tue. Qui sotto vedrai quali segnali operativi vengono riconosciuti prima dell’analisi completa.';
      signals.textContent='Ancora nessuno. Inizia a scrivere.';
      return;
    }

    state.textContent=labels.length?'SEGNALE ATTIVO':'LETTURA IN CORSO';
    copy.textContent=labels.length
      ? 'Ho rilevato '+labels.length+' '+(labels.length===1?'area operativa':'aree operative')+'. Completa la descrizione per rendere la diagnosi più precisa.'
      : 'Sto leggendo il contesto. Aggiungi cosa fai oggi, dove perdi tempo e cosa vorresti smettere di fare manualmente.';
    signals.textContent=labels.length
      ? labels.join(' · ')
      : 'Descrizione ancora troppo generica: aggiungi un esempio concreto.';
  }

  textarea.addEventListener('input',update);
  update();
})();