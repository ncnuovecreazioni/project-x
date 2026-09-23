/* PROJECT-X — GUIDE PRACTICE MODE
   Tutor interattivo: guarda → fai → prova → controlla → continua.
   Lavora sopra l'HTML già generato da tutorial.html senza fingere l'interfaccia reale dei software terzi.
*/
(function(){
  'use strict';
  if(window.__PROJECTX_GUIDE_PRACTICE__) return;
  window.__PROJECTX_GUIDE_PRACTICE__=true;

  var current=0;
  var observer=null;
  var storageKey='projectx_practice_v1_'+location.pathname;

  function esc(v){
    return String(v==null?'':v).replace(/[&<>"']/g,function(c){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
    });
  }

  function toolName(){
    var el=document.getElementById('toolName');
    if(el&&el.textContent.trim()) return el.textContent.trim();
    var h=document.querySelector('.hero h1');
    return h?h.textContent.replace(/Passo dopo passo\.?/gi,'').trim():'software';
  }

  function rows(){
    return Array.prototype.slice.call(document.querySelectorAll('#steps .step'));
  }

  function readRow(row){
    if(!row) return {};
    var h=row.querySelector('h3');
    var action=row.querySelector('.action-line');
    var example=row.querySelector('.example-line');
    var success=row.querySelector('.success-line');
    var trouble=row.querySelector('.troubleStep p');
    var where=document.getElementById('assistWhere');
    var assistAction=document.getElementById('assistAction');
    var assistSuccess=document.getElementById('assistSuccess');
    return {
      title:h?h.textContent.trim():'Passo '+(current+1),
      action:action?cleanLabel(action.textContent):((assistAction&&assistAction.textContent.trim())||'Segui il passaggio indicato.'),
      example:example?cleanLabel(example.textContent):'Usa un solo caso reale di prova.',
      success:success?cleanLabel(success.textContent):((assistSuccess&&assistSuccess.textContent.trim())||'Controlla che il risultato previsto sia visibile.'),
      trouble:trouble?trouble.textContent.trim():'Riduci la prova a un solo caso e cerca una voce equivalente.',
      where:(where&&where.textContent.trim())||'Area indicata nella guida'
    };
  }

  function cleanLabel(s){
    return String(s||'')
      .replace(/^Adesso fai questo\.\s*/i,'')
      .replace(/^Esempio pratico\.\s*/i,'')
      .replace(/^Come capisci che è fatto\.\s*/i,'')
      .trim();
  }

  function loadState(){
    try{return JSON.parse(localStorage.getItem(storageKey)||'{}')}catch(e){return {}}
  }
  function saveState(s){
    try{localStorage.setItem(storageKey,JSON.stringify(s))}catch(e){}
  }

  function styles(){
    if(document.getElementById('px-practice-style')) return;
    var s=document.createElement('style');
    s.id='px-practice-style';
    s.textContent=[
      '.px-practice{margin:18px 0 8px;padding:20px;border:1px solid rgba(124,92,255,.22);border-radius:20px;background:linear-gradient(145deg,rgba(124,92,255,.08),rgba(8,12,22,.65));box-shadow:0 22px 70px rgba(0,0,0,.16)}',
      '.px-practice-head{display:flex;justify-content:space-between;gap:16px;align-items:flex-start}',
      '.px-practice-k{font-size:8px;letter-spacing:.16em;color:#bdb4ff;font-weight:950}',
      '.px-practice h3{margin:7px 0 5px;font-size:23px;letter-spacing:-.035em}',
      '.px-practice-copy{margin:0;color:#98a6bb;font-size:10px;line-height:1.65;max-width:760px}',
      '.px-practice-badge{padding:7px 9px;border:1px solid rgba(255,255,255,.08);border-radius:999px;color:#cdd6e5;font-size:8px;font-weight:900;white-space:nowrap;background:rgba(255,255,255,.025)}',
      '.px-start{margin-top:14px;padding:13px;border:1px solid rgba(255,255,255,.07);border-radius:15px;background:rgba(255,255,255,.018)}',
      '.px-start-title{font-size:9px;font-weight:950;color:#dce3ee;letter-spacing:.08em}',
      '.px-start-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:9px}',
      '.px-start-item{display:flex;gap:8px;align-items:flex-start;padding:10px;border:1px solid rgba(255,255,255,.06);border-radius:12px;background:rgba(0,0,0,.08);cursor:pointer}',
      '.px-start-item input{margin-top:2px;accent-color:#7c5cff}.px-start-item span{font-size:8.5px;line-height:1.5;color:#9daabc}',
      '.px-toolbar{display:flex;gap:7px;flex-wrap:wrap;margin-top:14px}',
      '.pxp-btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;min-height:38px;padding:9px 12px;border-radius:10px;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.03);color:#e4e9f2;font-size:9px;font-weight:950;cursor:pointer}',
      '.pxp-btn.primary{background:linear-gradient(135deg,#7c5cff,#5b8cff);border-color:transparent;color:#fff;box-shadow:0 12px 30px rgba(124,92,255,.18)}',
      '.pxp-btn.ok{border-color:rgba(54,217,157,.18);background:rgba(54,217,157,.05);color:#86eac2}',
      '.pxp-btn.warn{color:#ffe1a0;border-color:rgba(255,209,102,.15);background:rgba(255,209,102,.035)}',
      '.pxp-stepbar{display:grid;grid-template-columns:repeat(4,1fr);gap:7px;margin-top:16px}',
      '.pxp-phase{padding:9px 8px;border:1px solid rgba(255,255,255,.06);border-radius:11px;background:rgba(255,255,255,.018);font-size:8px;color:#7e8ca1;text-align:center;font-weight:950}',
      '.pxp-phase.active{border-color:rgba(124,92,255,.28);background:rgba(124,92,255,.08);color:#c9c1ff}',
      '.pxp-phase.done{border-color:rgba(54,217,157,.20);background:rgba(54,217,157,.04);color:#82e5be}',
      '.pxp-current{margin-top:12px;padding:16px;border:1px solid rgba(255,255,255,.07);border-radius:16px;background:rgba(6,10,18,.62)}',
      '.pxp-current-top{display:flex;justify-content:space-between;gap:10px;align-items:flex-start}',
      '.pxp-current-k{font-size:8px;letter-spacing:.12em;color:#7fa4ff;font-weight:950}',
      '.pxp-current h4{margin:5px 0 0;font-size:18px;line-height:1.25}',
      '.pxp-counter{font-size:8px;color:#8795a9;white-space:nowrap}',
      '.pxp-steps-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:12px}',
      '.pxp-info{padding:11px;border:1px solid rgba(255,255,255,.06);border-radius:12px;background:rgba(255,255,255,.018)}',
      '.pxp-info b{display:block;font-size:7px;letter-spacing:.09em;color:#bcb4ff}.pxp-info span{display:block;margin-top:5px;font-size:9px;line-height:1.55;color:#a9b5c7}',
      '.pxp-practice{margin-top:10px;padding:12px;border:1px solid rgba(124,92,255,.16);border-radius:13px;background:rgba(124,92,255,.035)}',
      '.pxp-practice-label{font-size:8px;font-weight:950;color:#c9c1ff;letter-spacing:.09em}',
      '.pxp-input-row{display:grid;grid-template-columns:1fr auto;gap:7px;margin-top:8px}',
      '.pxp-input-row input{width:100%;padding:10px 11px;border-radius:9px;border:1px solid rgba(255,255,255,.08);background:#070b14;color:#fff;outline:none;font-size:9px}',
      '.pxp-result{margin-top:8px;font-size:8.5px;color:#7f8da3;min-height:16px;line-height:1.5}',
      '.pxp-video{display:none;margin-top:12px;padding:12px;border:1px solid rgba(255,255,255,.08);border-radius:15px;background:#050811}',
      '.pxp-video.open{display:block}',
      '.pxp-video-head{display:flex;justify-content:space-between;gap:9px;align-items:center}',
      '.pxp-video-title{font-size:9px;font-weight:950;letter-spacing:.09em;color:#dce4ef}',
      '.pxp-video-note{font-size:7px;color:#65758c}',
      '.pxp-mock{margin-top:10px;border:1px solid rgba(255,255,255,.08);border-radius:12px;overflow:hidden;background:#0a0f19}',
      '.pxp-mock-top{display:flex;align-items:center;gap:6px;padding:9px;border-bottom:1px solid rgba(255,255,255,.06);font-size:8px;color:#96a4ba}',
      '.pxp-dot{width:7px;height:7px;border-radius:50%;background:#36d99d;box-shadow:0 0 0 5px rgba(54,217,157,.06)}',
      '.pxp-mock-body{display:grid;grid-template-columns:92px 1fr;min-height:170px}',
      '.pxp-mock-nav{padding:10px;border-right:1px solid rgba(255,255,255,.06);display:grid;gap:6px;align-content:start}',
      '.pxp-mock-nav i{display:block;height:18px;border-radius:6px;background:rgba(255,255,255,.045)}',
      '.pxp-mock-nav i.hot{background:rgba(124,92,255,.14);border:1px solid rgba(124,92,255,.34)}',
      '.pxp-mock-main{padding:13px}',
      '.pxp-mock-title{font-size:12px;font-weight:950}',
      '.pxp-mock-sub{margin-top:4px;color:#6f8098;font-size:7.5px}',
      '.pxp-target{margin-top:10px;padding:11px;border:1px solid rgba(124,92,255,.18);border-radius:9px;background:rgba(255,255,255,.018);transition:.25s}',
      '.pxp-target.pulse{animation:pxPulse 1.1s infinite}',
      '.pxp-target b{display:block;font-size:7px;color:#8795aa;letter-spacing:.08em}.pxp-target span{display:block;margin-top:4px;color:#f0f4fa;font-size:9px;line-height:1.45}',
      '@keyframes pxPulse{0%,100%{box-shadow:0 0 0 0 rgba(124,92,255,.15)}50%{box-shadow:0 0 0 7px rgba(124,92,255,0)}}',
      '.pxp-video-actions{display:flex;gap:7px;flex-wrap:wrap;margin-top:9px}',
      '.pxp-help{display:none;margin-top:12px;padding:13px;border-radius:13px;border:1px solid rgba(255,209,102,.16);background:rgba(255,209,102,.03)}',
      '.pxp-help.open{display:block}.pxp-help h5{margin:0;font-size:11px}.pxp-help p{margin:6px 0 0;color:#98a6ba;font-size:8.5px;line-height:1.6}',
      '.pxp-help ul{margin:7px 0 0;padding-left:17px}.pxp-help li{margin:5px 0;color:#aab5c7;font-size:8.5px;line-height:1.5}',
      '.pxp-foot{margin-top:11px;color:#6f7e95;font-size:7.5px;line-height:1.5}',
      '.pxp-complete{margin-top:10px;padding:11px 12px;border:1px solid rgba(54,217,157,.17);border-radius:12px;background:rgba(54,217,157,.035);color:#8fe7c3;font-size:8.5px;line-height:1.5;display:none}',
      '.pxp-complete.show{display:block}',
      '@media(max-width:700px){.px-start-grid,.pxp-steps-grid{grid-template-columns:1fr}.pxp-stepbar{grid-template-columns:1fr 1fr}.pxp-mock-body{grid-template-columns:1fr}.pxp-mock-nav{display:none}.pxp-input-row{grid-template-columns:1fr}.pxp-toolbar .pxp-btn{flex:1 1 calc(50% - 7px)}}',
      '@media(max-width:480px){.px-practice{padding:15px}.px-practice-head{flex-direction:column}.px-practice-badge{align-self:flex-start}}'
    ].join('');
    document.head.appendChild(s);
  }

  function install(){
    var mount=document.getElementById('steps');
    if(!mount || document.getElementById('px-practice')) return false;
    styles();

    var host=mount.parentNode;
    var box=document.createElement('section');
    box.id='px-practice';
    box.className='px-practice';
    box.innerHTML=
      '<div class="px-practice-head">'+
        '<div><div class="px-practice-k">✦ MODALITÀ TUTOR · PROJECT-X</div>'+
        '<h3>Non limitarti a leggere. Fai la guida insieme a me.</h3>'+
        '<p class="px-practice-copy">Ogni passaggio ora funziona come un mini tutorial: <b>guarda</b> cosa fare, <b>fallo davvero</b>, prova con un dato semplice, <b>controlla</b> il risultato e poi passa avanti.</p></div>'+
        '<div id="pxpBadge" class="px-practice-badge">0% completato</div>'+
      '</div>'+
      '<div class="px-start">'+
        '<div class="px-start-title">PARTI DA QUI · PRIMA DI TOCCARE IL WORKFLOW</div>'+
        '<div class="px-start-grid">'+
          '<label class="px-start-item"><input id="pxStartAccess" type="checkbox"><span><b>Accesso pronto</b><br>Ho creato l’account oppure ho effettuato l’accesso.</span></label>'+
          '<label class="px-start-item"><input id="pxStartCase" type="checkbox"><span><b>Caso di prova pronto</b><br>Ho un solo esempio reale da usare nella guida.</span></label>'+
          '<label class="px-start-item"><input id="pxStartGoal" type="checkbox"><span><b>Obiettivo chiaro</b><br>So quale risultato voglio ottenere alla fine.</span></label>'+
        '</div>'+
        '<div class="px-foot">PROJECT-X non presume quali campi o piani siano disponibili: quando sei sul software reale, usa le voci che corrispondono alla funzione indicata.</div>'+
      '</div>'+
      '<div class="px-toolbar">'+
        '<button id="pxWatch" class="pxp-btn primary">▶ Fammi vedere</button>'+
        '<button id="pxTry" class="pxp-btn">✋ Prova tu</button>'+
        '<button id="pxStuck" class="pxp-btn warn">❓ Non lo trovo</button>'+
        '<button id="pxOpenStep" class="pxp-btn">↗ Vai al passo</button>'+
      '</div>'+
      '<div class="pxp-stepbar">'+
        '<div class="pxp-phase active" data-phase="0">01 · GUARDA</div>'+
        '<div class="pxp-phase" data-phase="1">02 · FAI</div>'+
        '<div class="pxp-phase" data-phase="2">03 · CONTROLLA</div>'+
        '<div class="pxp-phase" data-phase="3">04 · CONTINUA</div>'+
      '</div>'+
      '<div class="pxp-current">'+
        '<div class="pxp-current-top"><div><div class="pxp-current-k">PASSO CORRENTE</div><h4 id="pxpTitle">Caricamento…</h4></div><div id="pxpCounter" class="pxp-counter">1 / 1</div></div>'+
        '<div class="pxp-steps-grid">'+
          '<div class="pxp-info"><b>📍 DOVE</b><span id="pxpWhere">—</span></div>'+
          '<div class="pxp-info"><b>👉 COSA FAI</b><span id="pxpAction">—</span></div>'+
          '<div class="pxp-info"><b>🧪 PROVA TU</b><span id="pxpExample">—</span></div>'+
          '<div class="pxp-info"><b>✓ COSA CONTROLLI</b><span id="pxpSuccess">—</span></div>'+
        '</div>'+
        '<div id="pxpPractice" class="pxp-practice">'+
          '<div class="pxp-practice-label">PROVA TU · DATI DI ESEMPIO</div>'+
          '<div class="pxp-input-row"><input id="pxpInput" placeholder="Scrivi qui il valore che useresti nel software"><button id="pxpCheck" class="pxp-btn ok">Controlla →</button></div>'+
          '<div id="pxpResult" class="pxp-result">Usa un valore innocuo di prova: per esempio “Mario Rossi” o “Richiesta 001”.</div>'+
        '</div>'+
        '<div id="pxpVideo" class="pxp-video">'+
          '<div class="pxp-video-head"><div class="pxp-video-title">▶ DIMOSTRAZIONE VISIVA</div><div class="pxp-video-note">simulazione · non è l’interfaccia reale del software</div></div>'+
          '<div class="pxp-mock"><div class="pxp-mock-top"><span class="pxp-dot"></span><span>'+esc(toolName())+' · area di lavoro</span></div>'+
            '<div class="pxp-mock-body"><div class="pxp-mock-nav"><i class="hot"></i><i></i><i></i><i></i><i></i></div>'+
              '<div class="pxp-mock-main"><div class="pxp-mock-title" id="pxpMockTitle">Passo corrente</div><div class="pxp-mock-sub">PROJECT-X mette in evidenza cosa cercare e cosa controllare.</div>'+
              '<div class="pxp-target pulse"><b>AZIONE DA CERCARE</b><span id="pxpMockAction">—</span></div>'+
              '<div class="pxp-target"><b>RISULTATO ATTESO</b><span id="pxpMockSuccess">—</span></div></div>'+
            '</div></div>'+
          '<div class="pxp-video-actions"><button id="pxpReplay" class="pxp-btn">↻ Riproduci evidenziazione</button><button id="pxpHideVideo" class="pxp-btn">Chiudi</button></div>'+
        '</div>'+
        '<div id="pxpHelp" class="pxp-help"><h5>❓ Non lo trovi? Facciamo diagnosi, non tentativi a caso.</h5><p id="pxpHelpIntro">Il nome può cambiare. Manteniamo uguale il risultato che vogliamo ottenere.</p><ul>'+
          '<li><b>1.</b> Controlla l’area indicata alla voce “DOVE”.</li>'+
          '<li><b>2.</b> Cerca una funzione equivalente: il nome può essere diverso, ma l’azione deve essere la stessa.</li>'+
          '<li><b>3.</b> Se è una funzione collegata ad account o permessi, verifica prima l’accesso.</li>'+
        '</ul><div class="px-toolbar"><button id="pxCopySearch" class="pxp-btn">📋 Copia cosa cercare</button><button id="pxHelpDone" class="pxp-btn warn">Ho risolto ✓</button></div></div>'+
        '<div id="pxComplete" class="pxp-complete"></div>'+
      '</div>'+
      '<div class="px-toolbar" style="justify-content:space-between">'+
        '<div class="px-toolbar"><button id="pxPrev" class="pxp-btn">← Precedente</button><button id="pxNext" class="pxp-btn primary">Avanti →</button></div>'+
        '<button id="pxCompleteStep" class="pxp-btn ok">✓ Passo completato</button>'+
      '</div>'+
      '<div class="px-foot">Nota: la demo visiva serve a “vedere il gesto”. Per la schermata reale apri sempre il software dal pulsante ufficiale della guida. Non vengono inventate schermate reali di servizi terzi.</div>';

    host.insertBefore(box,mount);

    bindStart();
    bindActions();
    refresh();
    syncFromExistingAssistant();
    return true;
  }

  function startKey(id){return storageKey+'_'+id}
  function bindStart(){
    ['Access','Case','Goal'].forEach(function(k){
      var el=document.getElementById('pxStart'+k);
      if(!el)return;
      try{el.checked=localStorage.getItem(startKey(k))==='1'}catch(e){}
      el.addEventListener('change',function(){try{localStorage.setItem(startKey(k),el.checked?'1':'0')}catch(e){}});
    });
  }

  function bindActions(){
    document.getElementById('pxWatch').onclick=function(){toggleVideo(true)};
    document.getElementById('pxTry').onclick=function(){document.getElementById('pxInput').focus();document.getElementById('pxPractice').scrollIntoView({behavior:'smooth',block:'center'})};
    document.getElementById('pxStuck').onclick=function(){var h=document.getElementById('pxHelp');h.classList.toggle('open');if(h.classList.contains('open'))h.scrollIntoView({behavior:'smooth',block:'center'})};
    document.getElementById('pxOpenStep').onclick=function(){scrollCurrent()};
    document.getElementById('pxReplay').onclick=function(){pulse()};
    document.getElementById('pxHideVideo').onclick=function(){toggleVideo(false)};
    document.getElementById('pxCopySearch').onclick=copySearch;
    document.getElementById('pxHelpDone').onclick=function(){document.getElementById('pxHelp').classList.remove('open');setStatus('Perfetto. Torna al passo corrente e rifai la prova una volta.')};
    document.getElementById('pxCheck').onclick=checkPractice;
    document.getElementById('pxPrev').onclick=function(){setCurrent(current-1)};
    document.getElementById('pxNext').onclick=function(){setCurrent(current+1)};
    document.getElementById('pxCompleteStep').onclick=completeStep;
    document.getElementById('pxInput').addEventListener('keydown',function(e){if(e.key==='Enter')checkPractice()});
  }

  function currentData(){
    var all=rows();
    if(!all.length)return {};
    if(current<0)current=0;
    if(current>=all.length)current=all.length-1;
    return readRow(all[current]);
  }

  function refresh(){
    var all=rows();
    if(!all.length){
      return;
    }
    var d=currentData();
    var state=loadState();
    var done=Object.keys(state).filter(function(k){return state[k]}).length;
    var pct=Math.round(done/all.length*100);
    document.getElementById('pxpBadge').textContent=pct+'% completato';
    document.getElementById('pxpCounter').textContent=(current+1)+' / '+all.length;
    document.getElementById('pxpTitle').textContent=d.title;
    document.getElementById('pxpWhere').textContent=d.where;
    document.getElementById('pxpAction').textContent=d.action;
    document.getElementById('pxpExample').textContent=d.example;
    document.getElementById('pxpSuccess').textContent=d.success;
    document.getElementById('pxpMockTitle').textContent=d.title;
    document.getElementById('pxpMockAction').textContent=d.action;
    document.getElementById('pxpMockSuccess').textContent=d.success;
    document.getElementById('pxpHelpIntro').textContent=d.trouble;
    document.getElementById('pxpPrev').disabled=current===0;
    document.getElementById('pxpNext').textContent=current===all.length-1?'Vai al controllo finale →':'Avanti →';
    var complete=document.getElementById('pxpComplete');
    if(state[String(current)]){
      complete.classList.add('show');
      complete.textContent='✓ Questo passo risulta già completato su questo dispositivo.';
    }else{
      complete.classList.remove('show');
    }
    phaseState(state[String(current)]?'done':'active',state[String(current)]);
  }

  function phaseState(mode,done){
    var phases=[].slice.call(document.querySelectorAll('.pxp-phase'));
    phases.forEach(function(p,i){p.classList.remove('active','done')});
    if(done){phases.forEach(function(p){p.classList.add('done')})}
    else{
      phases[0].classList.add('done');
      phases[1].classList.add('active');
    }
  }

  function setCurrent(next){
    var all=rows();
    if(!all.length)return;
    current=Math.max(0,Math.min(next,all.length-1));
    refresh();
    scrollCurrent();
    toggleVideo(false);
  }

  function scrollCurrent(){
    var all=rows();
    if(all[current])all[current].scrollIntoView({behavior:'smooth',block:'center'});
  }

  function completeStep(){
    var all=rows();
    if(!all.length)return;
    var state=loadState();
    state[String(current)]=true;
    saveState(state);
    var existing=document.getElementById('assistDone');
    if(existing && !existing.disabled){
      try{existing.click()}catch(e){}
    }
    refresh();
    if(current<all.length-1){
      setTimeout(function(){setCurrent(current+1)},260);
    }else{
      var out=document.getElementById('outcome');
      if(out)out.scrollIntoView({behavior:'smooth',block:'center'});
      document.getElementById('pxpComplete').classList.add('show');
      document.getElementById('pxpComplete').textContent='🎉 Hai completato tutti i passi della guida. Ora fai il controllo finale sul caso reale prima di replicare il sistema.';
    }
  }

  function checkPractice(){
    var input=(document.getElementById('pxpInput').value||'').trim();
    var out=document.getElementById('pxpResult');
    if(!input){out.textContent='Scrivi prima un valore di prova. Non serve usare dati sensibili.';return}
    var d=currentData();
    var value=input.length>2?'✓ Valore di prova registrato: “'+input+'”. Ora confrontalo con il campo equivalente nel software reale e verifica: '+d.success:'Il valore è troppo corto: usa un esempio riconoscibile, come “Mario Rossi”.';
    out.textContent=value;
    try{var s=loadState();s['practice_'+current]=true;saveState(s)}catch(e){}
  }

  function toggleVideo(open){
    var v=document.getElementById('pxpVideo');
    if(!v)return;
    v.classList.toggle('open',!!open);
    if(open)pulse();
  }

  function pulse(){
    var target=document.querySelector('#pxpVideo .pxp-target');
    if(!target)return;
    target.classList.remove('pulse');
    void target.offsetWidth;
    target.classList.add('pulse');
  }

  function copySearch(){
    var d=currentData();
    var text='PROJECT-X — cosa cercare\nPasso: '+d.title+'\nDove: '+d.where+'\nAzione: '+d.action;
    if(navigator.clipboard&&navigator.clipboard.writeText){
      navigator.clipboard.writeText(text).then(function(){setStatus('✓ Copiato. Usa queste tre righe mentre cerchi la funzione nel software.')});
    }else{
      setStatus('La copia automatica non è disponibile su questo dispositivo.');
    }
  }

  function setStatus(msg){
    var el=document.getElementById('pxpResult');
    if(el)el.textContent=msg;
  }

  function syncFromExistingAssistant(){
    var rowsNow=rows();
    rowsNow.forEach(function(row,i){
      row.addEventListener('click',function(e){
        if(e.target && e.target.closest && e.target.closest('button,input,label,summary,a'))return;
        current=i;
        refresh();
      });
    });
    if(observer)observer.disconnect();
    observer=new MutationObserver(function(){
      var count=rows().length;
      if(count && current>=count)current=count-1;
      refresh();
    });
    var mount=document.getElementById('steps');
    if(mount)observer.observe(mount,{childList:true,subtree:true});
  }

  function boot(){
    if(install()) return;
    setTimeout(boot,500);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);
  else boot();
})();