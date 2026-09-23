/* PROJECT-X — TUTORIAL BOOST
   Personalizzazione del tutorial + lead capture non invasiva.
*/
(function(){
  'use strict';
  if(window.__PROJECTX_TUTORIAL_BOOST__) return;
  window.__PROJECTX_TUTORIAL_BOOST__=true;

  function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
  function answers(){try{return JSON.parse(localStorage.getItem('projectx_answers_v2')||'{}')}catch(e){return {}}}
  function tool(){
    var n=document.getElementById('toolName');
    return n?n.textContent.trim():'software';
  }
  function primaryAction(){
    var a=answers();
    var goals=Array.isArray(a.goals)?a.goals:[];
    var map={
      'Clienti':'centralizzare i contatti e non perdere il prossimo follow-up',
      'Vendite':'rendere visibili le opportunità e la prossima azione',
      'Preventivi':'ridurre il copia-incolla e velocizzare il preventivo',
      'Email':'ridurre le comunicazioni ripetitive',
      'Automazioni':'eliminare un passaggio manuale ricorrente',
      'Documenti':'standardizzare creazione e archiviazione',
      'Excel':'ridurre inserimenti e trasferimenti manuali',
      'Progetti':'rendere chiare responsabilità e scadenze',
      'E-commerce':'rendere ordinato il flusso ordine → post-acquisto',
      'Marketing':'collegare acquisizione, comunicazione e follow-up'
    };
    for(var i=0;i<goals.length;i++) if(map[goals[i]]) return map[goals[i]];
    return 'eliminare il passaggio manuale che pesa di più';
  }

  function styles(){
    if(document.getElementById('px-tboost-style'))return;
    var s=document.createElement('style');s.id='px-tboost-style';
    s.textContent=
      '.px-tboost{margin-top:15px;padding:18px;border:1px solid rgba(124,92,255,.18);border-radius:19px;background:linear-gradient(145deg,rgba(124,92,255,.06),rgba(54,217,157,.025));}'+
      '.px-tboost-grid{display:grid;grid-template-columns:1.15fr .85fr;gap:9px;margin-top:12px}'+
      '.px-tboost-mini{padding:12px;border:1px solid rgba(255,255,255,.06);border-radius:12px;background:rgba(255,255,255,.018)}'+
      '.px-tboost-mini b{display:block;font-size:9px}.px-tboost-mini span{display:block;margin-top:4px;color:#8491a6;font-size:8.5px;line-height:1.45}'+
      '.px-tboost-k{font-size:8px;letter-spacing:.15em;color:#a99cff;font-weight:950}.px-tboost-title{margin-top:6px;font-size:18px;font-weight:950;letter-spacing:-.03em}.px-tboost-copy{margin:5px 0 0;color:#94a2b7;font-size:10px;line-height:1.55}'+
      '.px-tboost-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}.px-tboost-btn{display:inline-flex;align-items:center;justify-content:center;padding:10px 12px;border-radius:10px;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.035);color:#dfe6f2;font-size:9px;font-weight:900;text-decoration:none;cursor:pointer}.px-tboost-btn.primary{background:linear-gradient(135deg,#7c5cff,#5b8cff);border-color:transparent;color:#fff}'+
      '.px-tboost-save{margin-top:14px;padding:14px;border:1px solid rgba(255,209,102,.17);border-radius:15px;background:rgba(255,209,102,.035)}'+
      '.px-tboost-save-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px}.px-tboost-save input{width:100%;padding:10px 11px;border-radius:10px;border:1px solid rgba(255,255,255,.08);background:rgba(0,0,0,.18);color:#fff;outline:none;font-size:9px}.px-tboost-save button{width:100%;padding:10px 11px;border-radius:10px;border:0;background:linear-gradient(135deg,#7c5cff,#5b8cff);color:#fff;font-size:9px;font-weight:900;cursor:pointer}.px-tboost-status{margin-top:8px;color:#8290a7;font-size:8.5px;line-height:1.45;min-height:13px}'+
      '@media(max-width:700px){.px-tboost-grid,.px-tboost-save-grid{grid-template-columns:1fr}.px-tboost-actions .px-tboost-btn{width:100%}}';
    document.head.appendChild(s);
  }

  function install(){
    if(!document.getElementById('toolName')||document.getElementById('px-tboost'))return;
    styles();
    var a=answers();
    var pain=String(a.painPoint||'').trim();
    var business=String(a.businessType||'').trim();
    var team=String(a.teamSize||'').trim();
    var budget=String(a.budget||'').trim();
    var goal=primaryAction();
    var mount=document.getElementById('toolName').closest('.toolcard');
    var section=document.createElement('section');
    section.id='px-tboost';section.className='card section px-tboost';
    section.innerHTML=
      '<div class="px-tboost-k">PROJECT-X · PERSONALIZZATO SUL TUO CASO</div>'+
      '<div class="px-tboost-title">Adesso non studiamo '+esc(tool())+'. Risolviamo il tuo problema.</div>'+
      '<p class="px-tboost-copy">'+(pain?'Hai scritto: <strong style="color:#fff">“'+esc(pain)+'”</strong>. ':'')+'Il primo risultato che cerchiamo è <strong style="color:#7ce8bd">'+esc(goal)+'</strong>.</p>'+
      '<div class="px-tboost-grid">'+
        '<div class="px-tboost-mini"><b>IL TUO CONTESTO</b><span>'+(business?esc(business):'Attività non indicata')+(team?' · team '+esc(team):'')+(budget?' · budget '+esc(budget):'')+'</span></div>'+
        '<div class="px-tboost-mini"><b>PRIMO TEST</b><span>Usa un solo caso reale o di prova. Verifica il risultato prima di aggiungere altre automazioni.</span></div>'+
      '</div>'+
      '<div class="px-tboost-actions"><button id="pxCopySetup" class="px-tboost-btn primary">📋 Copia il mio setup</button><a class="px-tboost-btn" href="/report-pro.html?source=tutorial-personalized">Trasforma in blueprint →</a><a class="px-tboost-btn" href="/implementation.html?source=tutorial-personalized">Richiedi implementazione →</a></div>'+
      '<div class="px-tboost-save"><div class="px-tboost-k">✦ SALVA IL PERCORSO</div><div style="margin-top:5px;color:#c5cedd;font-size:11px;font-weight:900">Ricevi una conferma della tua richiesta e lascia a PROJECT-X un contatto per continuare il percorso.</div><div class="px-tboost-save-grid"><input id="pxLeadName" placeholder="Nome"><input id="pxLeadEmail" type="email" placeholder="La tua email"><button id="pxLeadSend">Salva il mio percorso →</button></div><div id="pxLeadStatus" class="px-tboost-status"></div></div>';
    
    var example=document.querySelector('.example')&&document.querySelector('.example').parentNode;
    if(example&&example.parentNode){example.parentNode.insertBefore(section,example.nextSibling)}
    else if(mount&&mount.parentNode){mount.parentNode.insertBefore(section,mount.nextSibling)}

    var copy=document.getElementById('pxCopySetup');
    if(copy)copy.onclick=function(){
      var steps=[].slice.call(document.querySelectorAll('#steps .step')).map(function(s,i){
        var h=s.querySelector('h3');var ps=s.querySelectorAll('p');
        return (i+1)+'. '+(h?h.textContent.trim():'Passo')+'\n'+(ps[0]?ps[0].textContent.trim():'');
      });
      var txt='PROJECT-X — SETUP PERSONALIZZATO\nSoftware: '+tool()+'\nObiettivo: '+goal+'\n'+(pain?'Problema: '+pain+'\n':'')+'\n'+steps.join('\n');
      if(navigator.clipboard&&navigator.clipboard.writeText){
        navigator.clipboard.writeText(txt).then(function(){copy.textContent='✓ Setup copiato';setTimeout(function(){copy.textContent='📋 Copia il mio setup'},2200)});
      }
      try{if(window.gtag)window.gtag('event','tutorial_setup_copy',{tool:tool()})}catch(e){}
    };

    var send=document.getElementById('pxLeadSend');
    if(send)send.onclick=function(){
      var name=(document.getElementById('pxLeadName').value||'').trim();
      var email=(document.getElementById('pxLeadEmail').value||'').trim();
      var status=document.getElementById('pxLeadStatus');
      if(!email||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){status.textContent='Inserisci un indirizzo email valido.';return}
      send.disabled=true;send.textContent='Salvataggio…';
      var payload={
        source:'tutorial-detail',
        intent:'tutorial',
        name:name,
        email:email,
        businessType:business,
        teamSize:team,
        budget:budget,
        painPoint:pain,
        report:{
          primary:tool(),
          tutorial:true,
          tutorialGoal:goal,
          tutorialPage:location.pathname+location.search
        }
      };
      fetch('/api/lead',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)})
      .then(function(r){return r.json().then(function(d){return {ok:r.ok,data:d}})})
      .then(function(x){
        if(x.data&&x.data.success){
          status.textContent='✓ Percorso salvato. PROJECT-X ha registrato la richiesta.';
          send.textContent='✓ Salvato';
          try{if(window.gtag)window.gtag('event','tutorial_lead_capture',{tool:tool()})}catch(e){}
        }else{
          throw new Error('save');
        }
      })
      .catch(function(){status.textContent='Non riesco a salvare il contatto in questo momento. Puoi comunque usare la guida.';send.disabled=false;send.textContent='Salva il mio percorso →'})
    };
  }

  function boot(){setTimeout(install,120);setTimeout(install,900);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();

  /* Load the interactive practice tutor after the existing guide UI is ready. */
  try{
    var practiceScript=document.createElement('script');
    practiceScript.src='/guide-practice.js?v=20260923-practice1';
    practiceScript.defer=true;
    practiceScript.setAttribute('data-projectx-practice','1');
    document.head.appendChild(practiceScript);
  }catch(e){}
})();