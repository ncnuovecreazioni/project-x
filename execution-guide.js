/* =========================================================
   PROJECT-X — EXECUTION GUIDE + VISUAL TUTORIAL
   ========================================================= */
(function(){
  'use strict';

  if(window.__PROJECTX_EXECUTION_GUIDE__) return;
  window.__PROJECTX_EXECUTION_GUIDE__=true;

  var KEY='projectx_guide_state_v2';

  function esc(v){
    return String(v==null?'':v).replace(/[&<>"']/g,function(c){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
    });
  }

  function answers(){
    try{return JSON.parse(localStorage.getItem('projectx_answers_v2')||'{}')}catch(e){return {}}
  }

  function result(){
    try{
      if(window.ProjectXUI&&typeof window.ProjectXUI.getResult==='function') return window.ProjectXUI.getResult();
      return window.result||null;
    }catch(e){return null}
  }

  function primary(r){
    return r&&(r.primaryTool||r.primary||(r.rankedTools&&r.rankedTools[0]))||null;
  }

  function getState(id){
    try{
      var all=JSON.parse(localStorage.getItem(KEY)||'{}');
      return all[id]||{};
    }catch(e){return {}}
  }

  function saveState(id,state){
    try{
      var all=JSON.parse(localStorage.getItem(KEY)||'{}');
      all[id]=state||{};
      localStorage.setItem(KEY,JSON.stringify(all));
    }catch(e){}
  }

  function goalSummary(a){
    var goals=Array.isArray(a&&a.goals)?a.goals:[];
    var pain=String(a&&a.painPoint||'').trim();
    var map={
      'Clienti':'centralizzare i contatti',
      'Vendite':'rendere visibili le prossime azioni commerciali',
      'Preventivi':'ridurre copia-incolla e ritardi sui preventivi',
      'Email':'ridurre le comunicazioni ripetitive',
      'Automazioni':'eliminare un passaggio manuale ricorrente',
      'Documenti':'standardizzare gestione e archiviazione dei documenti',
      'Excel':'ridurre gestione manuale e copia-incolla dei dati',
      'Progetti':'rendere leggibili attività, responsabili e scadenze',
      'E-commerce':'rendere più ordinato il lavoro intorno agli ordini',
      'Marketing':'collegare acquisizione, comunicazione e follow-up'
    };
    var chosen='semplificare il lavoro che crea più attrito';
    for(var i=0;i<goals.length;i++){if(map[goals[i]]){chosen=map[goals[i]];break;}}
    return {goal:chosen,pain:pain};
  }

  function tutorialFor(tool){
    try{
      if(window.PROJECTX_TOOL_TUTORIALS&&typeof window.PROJECTX_TOOL_TUTORIALS.get==='function'){
        return window.PROJECTX_TOOL_TUTORIALS.get(tool);
      }
    }catch(e){}
    return null;
  }

  function styles(){
    if(document.getElementById('px-visual-tutorial-style')) return;
    var s=document.createElement('style');
    s.id='px-visual-tutorial-style';
    s.textContent=
      '.px-eg{margin:18px 0 0;border:1px solid rgba(124,92,255,.24);border-radius:28px;background:linear-gradient(145deg,rgba(15,22,39,.98),rgba(6,10,19,.99));box-shadow:0 30px 100px rgba(0,0,0,.30);overflow:hidden}'+
      '.px-eg-hero{padding:28px;background:linear-gradient(135deg,rgba(124,92,255,.10),rgba(54,217,157,.025))}'+
      '.px-eg-k{font-size:10px;letter-spacing:.16em;color:#b9afff;font-weight:950}.px-eg-title{margin:8px 0 7px;font-size:31px;line-height:1.03;font-weight:950;letter-spacing:-.045em}.px-eg-copy{margin:0;color:#bec8d7;font-size:14px;line-height:1.65;max-width:920px}.px-eg-meta{display:flex;gap:8px;flex-wrap:wrap;margin-top:15px}.px-eg-chip{padding:8px 10px;border:1px solid rgba(255,255,255,.08);border-radius:999px;background:rgba(255,255,255,.025);color:#b8c2d2;font-size:10px;font-weight:850}.px-eg-chip strong{color:#fff}'+
      '.px-eg-body{padding:22px 25px 28px}.px-eg-layout{display:grid;grid-template-columns:minmax(0,.95fr) minmax(330px,1.05fr);gap:18px}.px-eg-mission{padding:18px;border:1px solid rgba(124,92,255,.18);border-radius:20px;background:rgba(124,92,255,.045)}.px-eg-mission-k{font-size:10px;letter-spacing:.14em;color:#a99cff;font-weight:950}.px-eg-mission-title{margin-top:7px;font-size:21px;font-weight:950}.px-eg-mission p{margin:7px 0 0;color:#9eabbe;font-size:13px;line-height:1.6}'+
      '.px-eg-flow{margin-top:13px;padding:15px;border:1px solid rgba(54,217,157,.13);border-radius:18px;background:rgba(54,217,157,.025)}.px-eg-flow-title{font-size:17px;color:#eef3f9;font-weight:950}.px-eg-flow-copy{margin-top:5px;color:#8997ab;font-size:11px;line-height:1.5}.px-eg-flow-rail{display:grid;grid-template-columns:repeat(5,1fr);gap:6px;margin-top:12px}.px-eg-flow-node{padding:9px 7px;border:1px solid rgba(255,255,255,.06);border-radius:10px;background:rgba(255,255,255,.018);text-align:center}.px-eg-flow-node span{display:block;color:#7d8b9e;font-size:7px;letter-spacing:.08em;font-weight:900}.px-eg-flow-node b{display:block;margin-top:5px;font-size:9px;line-height:1.25}'+
      '.px-eg-tools{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}.px-eg-open,.px-eg-library{display:inline-flex;align-items:center;justify-content:center;min-height:46px;padding:10px 14px;border-radius:12px;text-decoration:none;font-size:11px;font-weight:950}.px-eg-open{border:1px solid rgba(124,92,255,.29);background:linear-gradient(135deg,#7c5cff,#5b8cff);color:#fff;box-shadow:0 14px 42px rgba(124,92,255,.18)}.px-eg-library{border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.035);color:#dce5f2}'+
      '.px-eg-screen{padding:13px;border:1px solid rgba(255,255,255,.09);border-radius:20px;background:#060a12;box-shadow:inset 0 1px 0 rgba(255,255,255,.025),0 22px 60px rgba(0,0,0,.24)}.px-eg-screenbar{display:grid;grid-template-columns:auto 1fr auto;gap:8px;align-items:center;padding-bottom:10px;border-bottom:1px solid rgba(255,255,255,.06)}.px-eg-screen-dot{width:8px;height:8px;border-radius:50%;background:#36d99d;box-shadow:0 0 0 5px rgba(54,217,157,.07)}.px-eg-screen-brand{font-size:11px;font-weight:950;color:#eaf0f8}.px-eg-screen-live{font-size:8px;color:#7ce8bd;font-weight:900}.px-eg-screenbody{display:grid;grid-template-columns:70px 1fr;gap:11px;padding-top:12px}.px-eg-sidebar{display:grid;gap:6px;align-content:start}.px-eg-sideitem{height:13px;border-radius:5px;background:rgba(255,255,255,.055)}.px-eg-sideitem.active{height:19px;border:1px solid rgba(124,92,255,.35);background:rgba(124,92,255,.11)}.px-eg-mainhead{display:flex;align-items:center;justify-content:space-between;gap:8px}.px-eg-mainhead b{font-size:12px;color:#e6ebf4}.px-eg-focus{font-size:7px;color:#91a0b4}.px-eg-widgetgrid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:7px;margin-top:9px}.px-eg-widget{min-height:68px;padding:9px;border:1px solid rgba(255,255,255,.06);border-radius:9px;background:rgba(255,255,255,.018)}.px-eg-widget.focus{border-color:rgba(124,92,255,.55);background:rgba(124,92,255,.09);box-shadow:0 0 0 3px rgba(124,92,255,.07)}.px-eg-widget.success{border-color:rgba(54,217,157,.25);background:rgba(54,217,157,.045)}.px-eg-widget small{display:block;color:#68778e;font-size:7px}.px-eg-widget b{display:block;margin-top:5px;color:#e6ebf4;font-size:9px}.px-eg-widget span{display:block;margin-top:4px;color:#7e8ca1;font-size:7px;line-height:1.35}.px-eg-action{margin-top:9px;padding:8px 9px;border:1px dashed rgba(124,92,255,.4);border-radius:9px;color:#b9afff;background:rgba(124,92,255,.04);font-size:8px;font-weight:900}.px-eg-status{display:flex;justify-content:space-between;gap:8px;margin-top:8px;color:#8290a6;font-size:7px}.px-eg-visual-caption{margin-top:9px;color:#6f7d93;font-size:9px;line-height:1.45}.px-eg-tabs{display:flex;gap:8px;margin-top:18px}.px-eg-tab{min-height:48px;padding:10px 13px;border:1px solid rgba(255,255,255,.08);border-radius:12px;background:rgba(255,255,255,.025);color:#acb7c8;font-size:11px;font-weight:900;cursor:pointer}.px-eg-tab.active{border-color:rgba(124,92,255,.38);background:rgba(124,92,255,.105);color:#f0edff}'+
      '.px-eg-progress{margin-top:12px;padding:12px 14px;border:1px solid rgba(255,255,255,.065);border-radius:14px;background:rgba(255,255,255,.016)}.px-eg-progress-top{display:flex;justify-content:space-between;gap:10px;color:#cbd4e2;font-size:11px;font-weight:900}.px-eg-progress-top span{color:#7e8ba0}.px-eg-track{height:8px;margin-top:8px;border-radius:999px;background:rgba(255,255,255,.055);overflow:hidden}.px-eg-track span{display:block;height:100%;width:0;border-radius:999px;background:linear-gradient(90deg,#7c5cff,#36d99d);transition:width .25s ease}'+
      '.px-eg-steps{display:grid;gap:9px;margin-top:11px}.px-eg-step{display:grid;grid-template-columns:34px minmax(0,1fr) auto;gap:10px;align-items:start;padding:13px;border:1px solid rgba(255,255,255,.065);border-radius:15px;background:rgba(255,255,255,.018);transition:.18s ease;cursor:pointer}.px-eg-step:hover{transform:translateY(-1px);border-color:rgba(124,92,255,.22)}.px-eg-step.selected{border-color:rgba(124,92,255,.5);background:rgba(124,92,255,.06);box-shadow:0 0 0 3px rgba(124,92,255,.05)}.px-eg-step.done{border-color:rgba(54,217,157,.18);background:rgba(54,217,157,.03)}.px-eg-num{width:32px;height:32px;display:grid;place-items:center;border-radius:9px;background:rgba(124,92,255,.11);color:#c8c1ff;font-size:10px;font-weight:950}.px-eg-step.done .px-eg-num{background:rgba(54,217,157,.10);color:#7ce8bd}.px-eg-step b{display:block;color:#eef3f8;font-size:13px;line-height:1.3}.px-eg-step-copy{margin-top:4px;color:#b0bccd;font-size:11px;line-height:1.58}.px-eg-check{min-width:22px;width:22px;height:22px;margin:2px 0 0;accent-color:#7c5cff;cursor:pointer}.px-eg-coach{margin-top:12px;padding:14px;border:1px solid rgba(91,140,255,.16);border-radius:16px;background:linear-gradient(135deg,rgba(91,140,255,.045),rgba(124,92,255,.055));display:grid;grid-template-columns:1fr auto;gap:12px;align-items:center}.px-eg-coach-k{font-size:8px;letter-spacing:.14em;color:#99aaff;font-weight:950}.px-eg-coach-title{margin-top:4px;color:#f2f5fb;font-size:14px;font-weight:950}.px-eg-coach-text{margin-top:4px;color:#8d9bb0;font-size:10px;line-height:1.5}.px-eg-coach-actions{display:flex;gap:7px;flex-wrap:wrap;justify-content:flex-end}.px-eg-coach-btn{border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.035);color:#dce5f2;border-radius:10px;padding:9px 11px;font-size:9px;font-weight:900;cursor:pointer}.px-eg-coach-btn.primary{background:linear-gradient(135deg,#7c5cff,#5b8cff);border-color:transparent;color:#fff}.px-eg-footer{display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-top:12px;padding:12px;border:1px solid rgba(255,255,255,.065);border-radius:13px;background:rgba(255,255,255,.014);color:#8190a5;font-size:9px;line-height:1.55}.px-eg-footer strong{color:#7ce8bd}'+
      '@media(max-width:880px){.px-eg-layout{grid-template-columns:1fr}.px-eg-flow-rail{grid-template-columns:1fr}.px-eg-flow-node{display:flex;justify-content:space-between;gap:8px;text-align:left}.px-eg-coach{grid-template-columns:1fr}.px-eg-coach-actions{justify-content:flex-start}.px-eg-screenbody{grid-template-columns:58px 1fr}}@media(max-width:620px){.px-eg-hero{padding:22px 16px}.px-eg-body{padding:16px 13px 20px}.px-eg-title{font-size:25px}.px-eg-copy{font-size:13px}.px-eg-widgetgrid{grid-template-columns:1fr 1fr}.px-eg-widget:last-child{grid-column:1/-1}.px-eg-tabs{display:grid;grid-template-columns:1fr}.px-eg-tab{width:100%}.px-eg-step{grid-template-columns:30px minmax(0,1fr) 22px;padding:11px;gap:8px}.px-eg-step b{font-size:12px}.px-eg-step-copy{font-size:10.5px}.px-eg-sidebar{display:none}.px-eg-screenbody{grid-template-columns:1fr}.px-eg-screenbar{grid-template-columns:auto 1fr}.px-eg-screen-live{display:none}}';
    document.head.appendChild(s);
  }

  function visual(tool,data,stepIndex){
    var step=data.steps[stepIndex]||data.steps[0];
    var focusIndex=stepIndex%3;
    var labels=(data.area+'|'+data.focus+'|Workflow|Risultati').split('|');
    return '<div class="px-eg-screen">'+
      '<div class="px-eg-screenbar"><span class="px-eg-screen-dot"></span><span class="px-eg-screen-brand">'+esc(tool.name||'Software')+'</span><span class="px-eg-screen-live">● modalità tutorial</span></div>'+
      '<div class="px-eg-screenbody">'+
        '<div class="px-eg-sidebar">'+labels.map(function(x,i){return '<div class="px-eg-sideitem '+(i===0?'active':'')+'" title="'+esc(x)+'"></div>';}).join('')+'</div>'+
        '<div>'+
          '<div class="px-eg-mainhead"><b>'+esc(step.title)+'</b><span class="px-eg-focus">cerca quest’area</span></div>'+
          '<div class="px-eg-widgetgrid">'+
            '<div class="px-eg-widget '+(focusIndex===0?'focus':'')+'"><small>AREA</small><b>'+esc(data.area)+'</b><span>punto di partenza</span></div>'+
            '<div class="px-eg-widget '+(focusIndex===1?'focus':'')+'"><small>AZIONE</small><b>'+esc(data.action)+'</b><span>cosa impostare</span></div>'+
            '<div class="px-eg-widget '+(focusIndex===2?'focus':'success')+'"><small>ESITO</small><b>Controlla</b><span>verifica il risultato</span></div>'+
          '</div>'+
          '<div class="px-eg-action">▸ '+esc(step.instruction)+'</div>'+
          '<div class="px-eg-status"><span>Passo '+(stepIndex+1)+' di '+data.steps.length+'</span><span>✓ '+esc(step.success)+'</span></div>'+
        '</div>'+
      '</div>'+
      '<div class="px-eg-visual-caption">Schermata simulata: serve a farti riconoscere la zona da cercare nel software reale. Le etichette possono cambiare con gli aggiornamenti del tool.</div>'+
    '</div>';
  }

  function render(){
    var results=document.getElementById('results');
    var mount=document.getElementById('primaryMount');
    if(!results||!mount||getComputedStyle(results).display==='none') return;

    var r=result(),p=primary(r);
    if(!p)return;

    var data=tutorialFor(p);
    if(!data)return;

    var old=document.getElementById('px-execution-guide');
    if(old)old.remove();

    styles();

    var a=answers(),goal=goalSummary(a),id=String(p.id||p.name||'tool'),state=getState(id),steps=data.steps||[];
    var coverage=window.PROJECTX_TOOL_TUTORIALS&&window.PROJECTX_TOOL_TUTORIALS.coverage?window.PROJECTX_TOOL_TUTORIALS.coverage():{total:0,withTutorial:0};
    var selected=0;

    var box=document.createElement('section');
    box.id='px-execution-guide';
    box.className='px-eg';

    var open=(data.url&&data.url!=='#')?'<a class="px-eg-open" href="'+esc(data.url)+'" target="_blank" rel="noopener noreferrer">Apri '+esc(data.name||'lo strumento')+' ↗</a>':'';
    var lib='<a class="px-eg-library" href="/tutorials.html?tool='+encodeURIComponent(id)+'">Tutti i tutorial →</a>';

    box.innerHTML=
      '<div class="px-eg-hero">'+
        '<div class="px-eg-k">✦ TUTORIAL VISIVO · '+esc(data.area||'GUIDA')+'</div>'+
        '<div class="px-eg-title">Ti accompagno passo passo.</div>'+
        '<p class="px-eg-copy">'+esc(goal.pain?'Partiamo da “'+goal.pain+'”.':'Partiamo dal tuo obiettivo.')+' Prima facciamo funzionare una cosa concreta, poi allarghiamo il sistema. Non devi imparare tutto '+esc(data.name)+'.</p>'+
        '<div class="px-eg-meta"><span class="px-eg-chip"><strong>TOOL</strong> · '+esc(data.name)+'</span><span class="px-eg-chip"><strong>PRIMO OBIETTIVO</strong> · '+esc(data.focus)+'</span><span class="px-eg-chip"><strong>TUTORIAL</strong> · '+steps.length+' passi</span><span class="px-eg-chip"><strong>CATALOGO</strong> · '+coverage.withTutorial+'/'+coverage.total+' tool coperti</span></div>'+
      '</div>'+
      '<div class="px-eg-body">'+
        '<div class="px-eg-layout">'+
          '<div>'+
            '<div class="px-eg-mission">'+
              '<div class="px-eg-mission-k">COSA COSTRUIAMO ADESSO</div>'+
              '<div class="px-eg-mission-title">'+esc(data.action||'costruisci il primo workflow utile')+'</div>'+
              '<p>La regola è semplice: un caso reale, una procedura, un test. Quando questo pezzo funziona, PROJECT-X ti accompagna al successivo.</p>'+
            '</div>'+
            '<div class="px-eg-flow"><div class="px-eg-flow-title">Il percorso</div><div class="px-eg-flow-copy">Il tutorial trasforma il software in una procedura concreta.</div><div class="px-eg-flow-rail">'+(data.flow||[]).map(function(x,i){return '<div class="px-eg-flow-node"><span>FASE '+(i+1)+'</span><b>'+esc(x)+'</b></div>';}).join('')+'</div></div>'+
            '<div class="px-eg-tools">'+open+lib+'</div>'+
          '</div>'+
          '<div id="px-eg-visual">'+visual(p,data,selected)+'</div>'+
        '</div>'+
        '<div class="px-eg-tabs"><button type="button" class="px-eg-tab active" data-mode="simple">🟢 Faccio con te</button><button type="button" class="px-eg-tab" data-mode="why">💡 Perché questo passo</button></div>'+
        '<div class="px-eg-progress"><div class="px-eg-progress-top"><span>AVANZAMENTO DEL TUTORIAL</span><b id="px-eg-progress-text">0 / '+steps.length+' completati</b></div><div class="px-eg-track"><span id="px-eg-progress-bar"></span></div></div>'+
        '<div class="px-eg-steps" id="px-eg-steps"></div>'+
        '<div class="px-eg-coach">'+
          '<div><div class="px-eg-coach-k">✦ GUIDA</div><div class="px-eg-coach-title">Non sai cosa fare adesso?</div><div id="px-eg-coach-text" class="px-eg-coach-text">Seleziona il primo passo. Ti mostro dove guardare e cosa controllare.</div></div>'+
          '<div class="px-eg-coach-actions"><button type="button" id="px-eg-coach-start" class="px-eg-coach-btn primary">Vai al passo →</button><button type="button" id="px-eg-coach-check" class="px-eg-coach-btn">Cosa controllo?</button><button type="button" id="px-eg-copy-flow" class="px-eg-coach-btn">Copia checklist</button></div>'+
        '</div>'+
        '<div class="px-eg-footer"><div><strong>Importante:</strong> la schermata è una simulazione visiva, non uno screenshot del software. I nomi delle sezioni possono cambiare.</div><div><strong>Regola:</strong> prima il test, poi l’automazione.</div></div>'+
      '</div>';

    mount.insertAdjacentElement('afterend',box);

    var list=box.querySelector('#px-eg-steps');
    var visualMount=box.querySelector('#px-eg-visual');
    var progressText=box.querySelector('#px-eg-progress-text');
    var progressBar=box.querySelector('#px-eg-progress-bar');
    var coachText=box.querySelector('#px-eg-coach-text');
    var mode='simple';

    function doneCount(){
      var n=0;
      for(var i=0;i<steps.length;i++){if(state[String(i)])n++;}
      return n;
    }

    function firstPending(){
      for(var i=0;i<steps.length;i++){if(!state[String(i)])return i;}
      return Math.max(0,steps.length-1);
    }

    function draw(){
      var count=doneCount();
      progressText.textContent=count+' / '+steps.length+' completati';
      progressBar.style.width=(steps.length?Math.round(count/steps.length*100):0)+'%';

      list.innerHTML=steps.map(function(s,i){
        var checked=!!state[String(i)];
        var isSelected=i===selected;
        var body=mode==='why'?s.note:s.instruction;
        return '<div class="px-eg-step '+(checked?'done ':'')+(isSelected?'selected':'')+'" data-step="'+i+'">'+
          '<div class="px-eg-num">'+String(i+1).padStart(2,'0')+'</div>'+
          '<div><b>'+esc(s.title)+'</b><div class="px-eg-step-copy">'+esc(body)+'</div></div>'+
          '<input class="px-eg-check" type="checkbox" data-step-check="'+i+'" '+(checked?'checked':'')+' aria-label="Completa passo '+(i+1)+'">'+
        '</div>';
      }).join('');

      if(coachText){
        if(count===steps.length){
          coachText.textContent='Tutorial completato. Ora puoi replicare il flusso su un secondo caso reale.';
        }else{
          var idx=firstPending();
          coachText.textContent='Parti da “'+steps[idx].title+'”. Quando hai verificato il risultato, spunta il passaggio.';
        }
      }
    }

    function select(index,scroll){
      selected=Math.max(0,Math.min(steps.length-1,Number(index)||0));
      visualMount.innerHTML=visual(p,data,selected);
      draw();
      if(scroll){
        var row=list.querySelector('[data-step="'+selected+'"]');
        if(row)row.scrollIntoView({behavior:'smooth',block:'center'});
      }
    }

    list.addEventListener('click',function(e){
      var check=e.target.closest('.px-eg-check');
      if(check){
        e.stopPropagation();
        var idx=Number(check.getAttribute('data-step-check')||0);
        state[String(idx)]=!!check.checked;
        saveState(id,state);
        selected=idx;
        visualMount.innerHTML=visual(p,data,selected);
        draw();
        return;
      }
      var row=e.target.closest('.px-eg-step');
      if(row)select(Number(row.getAttribute('data-step')||0),false);
    });

    box.querySelectorAll('.px-eg-tab').forEach(function(btn){
      btn.onclick=function(){
        mode=btn.getAttribute('data-mode')==='why'?'why':'simple';
        box.querySelectorAll('.px-eg-tab').forEach(function(b){b.classList.toggle('active',b===btn)});
        draw();
      };
    });

    var coachStart=box.querySelector('#px-eg-coach-start');
    if(coachStart)coachStart.onclick=function(){select(firstPending(),true)};

    var coachCheck=box.querySelector('#px-eg-coach-check');
    if(coachCheck)coachCheck.onclick=function(){
      var idx=selected||0;
      var s=steps[idx];
      if(coachText&&s)coachText.textContent='Controlla: '+s.success;
    };

    var copyFlow=box.querySelector('#px-eg-copy-flow');
    if(copyFlow)copyFlow.onclick=function(){
      var text='PROJECT-X — Tutorial '+data.name+'\n\n'+steps.map(function(s,i){return (i+1)+'. '+s.title+'\n'+s.instruction+'\nControllo: '+s.success;}).join('\n\n');
      if(navigator.clipboard&&navigator.clipboard.writeText){
        navigator.clipboard.writeText(text).then(function(){
          if(coachText)coachText.textContent='Checklist copiata. Ora puoi usarla mentre configuri '+data.name+'.';
        }).catch(function(){});
      }
    };

    draw();
  }

  var observer=new MutationObserver(function(){
    var results=document.getElementById('results');
    if(results&&getComputedStyle(results).display!=='none'&&!document.getElementById('px-execution-guide')) render();
  });

  function start(){
    if(!document.body)return;
    observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['style','class']});
    setTimeout(render,80);
    setTimeout(render,700);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);
  else start();
})();