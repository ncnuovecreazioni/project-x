/* PROJECT-X — CENTRAL INTERACTION CONTROLLER
   One interaction layer for the home experience.
   It re-wires the public CTAs after all visual layers are loaded.
*/
(function(){
  'use strict';

  if(window.__PROJECTX_CONTROLLER__) return;
  window.__PROJECTX_CONTROLLER__=true;

  function id(x){return document.getElementById(x);}
  function ready(fn){
    if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',fn,{once:true});
    else fn();
  }

  function values(){
    return {
      problem:'Perdo ore tra email, preventivi e follow-up dei clienti e vorrei automatizzare il lavoro ripetitivo.',
      business:'Impresa di servizi',
      budget:'€31–50'
    };
  }

  function setDemoValues(){
    var v=values();
    if(id('quickProblem')) id('quickProblem').value=v.problem;
    if(id('quickBusiness')) id('quickBusiness').value=v.business;
    if(id('quickBudget')) id('quickBudget').value=v.budget;
  }

  function home(){
    if(typeof window.ProjectXUI!=='object') return false;
    return typeof window.ProjectXUI.startQuick==='function';
  }

  function launch(type){
    if(!home()) return false;
    try{
      if(type==='demo'){
        setDemoValues();
      }
      if(type==='quick' || type==='demo'){
        window.ProjectXUI.startQuick();
      }else{
        window.ProjectXUI.startFull();
      }
      return true;
    }catch(e){
      try{
        var msg=id('px-controller-error');
        if(!msg){
          msg=document.createElement('div');
          msg.id='px-controller-error';
          msg.style.cssText='position:fixed;left:50%;bottom:18px;transform:translateX(-50%);z-index:99999;max-width:min(720px,calc(100% - 30px));padding:12px 15px;border:1px solid rgba(255,114,133,.3);background:#0d1321;color:#fff;border-radius:14px;font:700 12px/1.45 system-ui;box-shadow:0 18px 50px rgba(0,0,0,.35)';
          document.body.appendChild(msg);
        }
        msg.textContent='PROJECT-X sta riscontrando un errore nell’avvio. Aggiorna la pagina e riprova.';
      }catch(_){}
      return false;
    }
  }

  function styles(){
    if(id('px-controller-style')) return;
    var s=document.createElement('style');
    s.id='px-controller-style';
    s.textContent=[
      '#px-launcher{position:fixed;inset:0;z-index:9990;display:grid;place-items:center;padding:24px;background:radial-gradient(circle at 50% 36%,rgba(124,92,255,.18),transparent 35%),rgba(4,6,14,.94);backdrop-filter:blur(16px);opacity:0;pointer-events:none;transition:opacity .24s ease}',
      '#px-launcher.open{opacity:1;pointer-events:auto}',
      '.px-launch-card{width:min(760px,100%);text-align:center}',
      '.px-launch-kicker{font:900 9px/1.2 system-ui;letter-spacing:.18em;color:#a99cff}',
      '.px-launch-title{margin-top:12px;font:950 clamp(30px,5vw,54px)/.98 system-ui;letter-spacing:-.055em;color:#fff}',
      '.px-launch-copy{margin:10px auto 0;max-width:620px;color:#8d9bb0;font:500 12px/1.55 system-ui}',
      '.px-launch-steps{display:grid;grid-template-columns:repeat(4,1fr);gap:7px;margin-top:26px}',
      '.px-launch-step{padding:12px 9px;border:1px solid rgba(255,255,255,.08);border-radius:14px;background:rgba(255,255,255,.02);opacity:.35;transform:translateY(5px);transition:.24s}',
      '.px-launch-step.active{opacity:1;transform:none;border-color:rgba(124,92,255,.34);background:rgba(124,92,255,.07)}',
      '.px-launch-step.done{opacity:.72;border-color:rgba(54,217,157,.18)}',
      '.px-launch-step b{display:block;font:900 8px/1.2 system-ui;letter-spacing:.1em;color:#fff}',
      '.px-launch-step span{display:block;margin-top:4px;color:#77869d;font:500 8px/1.35 system-ui}',
      '.px-launch-core{width:76px;height:76px;margin:0 auto 20px;border-radius:50%;display:grid;place-items:center;background:radial-gradient(circle,#111a31 56%,transparent 57%),conic-gradient(#7c5cff var(--p,25%),rgba(255,255,255,.07) 0);box-shadow:0 0 80px rgba(124,92,255,.18);animation:pxLaunchPulse 1.5s ease-in-out infinite}',
      '.px-launch-core i{width:11px;height:11px;border-radius:50%;background:#36d99d;box-shadow:0 0 0 8px rgba(54,217,157,.08)}',
      '@keyframes pxLaunchPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.045)}}',
      '@media(max-width:600px){.px-launch-steps{grid-template-columns:1fr 1fr}.px-launch-title{font-size:34px}.px-launch-copy{font-size:11px}}',
      '@media(prefers-reduced-motion:reduce){.px-launch-core{animation:none}.px-launch-step{transition:none}}',
      '#quickBtn,#quickBtn2,#fullBtn,#fullBtn2,#demoBtn{pointer-events:auto!important;position:relative!important;z-index:100!important}'
    ].join('');
    document.head.appendChild(s);
  }

  function overlay(){
    if(id('px-launcher')) return;
    var o=document.createElement('div');
    o.id='px-launcher';
    o.innerHTML=
      '<div class="px-launch-card">'+
        '<div class="px-launch-kicker">PROJECT-X · DECISION ENGINE</div>'+
        '<div class="px-launch-core"><i></i></div>'+
        '<div class="px-launch-title">Trasformo un problema in una direzione.</div>'+
        '<p class="px-launch-copy">Non stiamo scegliendo un’app a caso. Stiamo costruendo il sistema che ha senso per questo caso.</p>'+
        '<div class="px-launch-steps">'+
          '<div class="px-launch-step" data-n="0"><b>01 · PROBLEMA</b><span>capire l’attrito</span></div>'+
          '<div class="px-launch-step" data-n="1"><b>02 · BISOGNI</b><span>capire cosa serve</span></div>'+
          '<div class="px-launch-step" data-n="2"><b>03 · SISTEMA</b><span>costruire la direzione</span></div>'+
          '<div class="px-launch-step" data-n="3"><b>04 · RISULTATO</b><span>mostrare cosa fare dopo</span></div>'+
        '</div>'+
      '</div>';
    document.body.appendChild(o);
  }

  function cinematic(next){
    overlay();
    var o=id('px-launcher');
    var core=o.querySelector('.px-launch-core');
    var steps=[].slice.call(o.querySelectorAll('.px-launch-step'));
    var messages=[
      ['Trasformo un problema in una direzione.','capire l’attrito'],
      ['Sto leggendo ciò che conta davvero.','capire cosa serve'],
      ['Sto costruendo la configurazione.','costruire la direzione'],
      ['Il risultato sta arrivando.','mostrare cosa fare dopo']
    ];
    var title=o.querySelector('.px-launch-title');
    var copy=o.querySelector('.px-launch-copy');
    var n=0,closed=false;
    function stage(i){
      title.textContent=messages[i][0];
      copy.textContent='PROJECT-X · '+messages[i][1];
      core.style.setProperty('--p',((i+1)*25)+'%');
      steps.forEach(function(x,k){x.classList.toggle('active',k===i);x.classList.toggle('done',k<i);});
    }
    function close(){
      if(closed)return;
      closed=true;
      o.classList.remove('open');
      setTimeout(function(){if(o.parentNode)o.parentNode.removeChild(o);},280);
    }
    o.classList.add('open');
    stage(0);
    var timer=setInterval(function(){
      if(document.getElementById('results') && getComputedStyle(document.getElementById('results')).display!=='none'){
        stage(3);
        clearInterval(timer);
        setTimeout(close,500);
        return;
      }
      if(n<3){n++;stage(n);}
      else{clearInterval(timer);setTimeout(close,900);}
    },420);
    var ok=next();
    if(!ok){
      clearInterval(timer);
      close();
    }
  }

  function bind(){
    styles();
    var q=id('quickBtn'),q2=id('quickBtn2'),f=id('fullBtn'),f2=id('fullBtn2'),d=id('demoBtn');
    if(q) q.onclick=function(e){if(e)e.preventDefault();cinematic(function(){return launch('quick')});};
    if(q2) q2.onclick=function(e){if(e)e.preventDefault();cinematic(function(){return launch('demo')});};
    if(d) d.onclick=function(e){if(e)e.preventDefault();cinematic(function(){return launch('demo')});};
    if(f) f.onclick=function(e){if(e)e.preventDefault();launch('full');};
    if(f2) f2.onclick=function(e){if(e)e.preventDefault();launch('full');};
  }

  function auto(){
    if(location.hash.indexOf('#px=')===0) return;
    if(location.search.indexOf('case=')>=0) return;
    setTimeout(function(){
      var r=id('results');
      if(r && getComputedStyle(r).display==='none'){
        cinematic(function(){return launch('demo')});
      }
    },900);
  }

  ready(function(){
    bind();
    setTimeout(bind,400);
    setTimeout(bind,1200);
    auto();
  });
})();