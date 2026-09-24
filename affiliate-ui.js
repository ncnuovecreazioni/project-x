/* PROJECT-X — Monetization + WOW UI bridge
   Loaded after the existing app without changing the decision engine.
   Adds the premium AI control-room experience to the home page.
*/
(function(){
  'use strict';

  var hostToTool = {
    'systeme.io':'systeme',
    'www.systeme.io':'systeme',
    'pipedrive.com':'pipedrive',
    'www.pipedrive.com':'pipedrive',
    'getresponse.com':'getresponse',
    'www.getresponse.com':'getresponse',
    'activecampaign.com':'activecampaign',
    'www.activecampaign.com':'activecampaign',
    'hubspot.com':'hubspot',
    'www.hubspot.com':'hubspot',
    'shopify.com':'shopify',
    'www.shopify.com':'shopify',
    'make.com':'make',
    'www.make.com':'make',
    'brevo.com':'brevo',
    'www.brevo.com':'brevo',
    'monday.com':'monday',
    'www.monday.com':'monday',
    'semrush.com':'semrush',
    'www.semrush.com':'semrush',
    'it.semrush.com':'semrush',
    'kit.com':'kit',
    'www.kit.com':'kit'
  };

  function injectWowStyles(){
    if(document.getElementById('px-wow-styles')) return;
    var style=document.createElement('style');
    style.id='px-wow-styles';
    style.textContent=`
      .hero{overflow:hidden;isolation:isolate}
      .px-wow-orbit{position:absolute;inset:20px 4% auto;height:500px;pointer-events:none;overflow:hidden;z-index:-1}
      .px-wow-orbit:before,.px-wow-orbit:after{content:"";position:absolute;border-radius:50%}
      .px-wow-orbit:before{width:500px;height:500px;left:50%;top:-195px;transform:translateX(-50%);border:1px solid rgba(124,92,255,.15);box-shadow:0 0 130px rgba(124,92,255,.08),inset 0 0 100px rgba(91,140,255,.04);animation:pxSpin 18s linear infinite}
      .px-wow-orbit:after{width:275px;height:275px;left:50%;top:-78px;transform:translateX(-50%);border:1px dashed rgba(91,140,255,.2);animation:pxSpinReverse 11s linear infinite}
      @keyframes pxSpin{to{transform:translateX(-50%) rotate(360deg)}}
      @keyframes pxSpinReverse{to{transform:translateX(-50%) rotate(-360deg)}}
      .hero .eyebrow{box-shadow:0 0 35px rgba(124,92,255,.16);animation:pxFloat 4.5s ease-in-out infinite}
      @keyframes pxFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}

      .px-wow-status{width:min(860px,100%);margin:21px auto 0;display:flex;justify-content:center;gap:8px;flex-wrap:wrap}
      .px-wow-pill{display:inline-flex;align-items:center;gap:7px;padding:8px 11px;border:1px solid rgba(255,255,255,.09);border-radius:999px;background:rgba(8,12,23,.72);backdrop-filter:blur(15px);color:#aeb9cb;font-size:10px;font-weight:800;box-shadow:0 10px 30px rgba(0,0,0,.12)}
      .px-wow-dot{width:7px;height:7px;border-radius:50%;background:#36d99d;box-shadow:0 0 14px rgba(54,217,157,.85);animation:pxPulse 1.8s ease-in-out infinite}
      @keyframes pxPulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(.72)}}

      .px-wow-console{width:min(1040px,100%);margin:26px auto 0;padding:11px;border-radius:24px;border:1px solid rgba(124,92,255,.18);background:linear-gradient(145deg,rgba(20,27,48,.68),rgba(7,11,20,.64));box-shadow:0 30px 100px rgba(0,0,0,.22);backdrop-filter:blur(22px)}
      .px-wow-console-inner{display:grid;grid-template-columns:1.05fr .95fr;gap:9px}
      .px-wow-mini{min-height:105px;border:1px solid rgba(255,255,255,.07);border-radius:18px;padding:16px;background:rgba(255,255,255,.022);position:relative;overflow:hidden}
      .px-wow-mini:after{content:"";position:absolute;right:-38px;bottom:-70px;width:170px;height:170px;border-radius:50%;background:rgba(124,92,255,.1);filter:blur(24px)}
      .px-wow-kicker{font-size:9px;letter-spacing:.14em;text-transform:uppercase;color:#8e9ab0;font-weight:900}
      .px-wow-big{margin-top:7px;font-size:20px;font-weight:950;letter-spacing:-.035em}
      .px-wow-copy{margin-top:5px;color:#8491a7;font-size:10px;line-height:1.45}
      .px-wow-flow{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;margin-top:12px}
      .px-wow-flow span{display:flex;align-items:center;gap:5px;padding:8px 9px;border-radius:10px;background:rgba(255,255,255,.026);border:1px solid rgba(255,255,255,.06);color:#b4bed0;font-size:9px;font-weight:800}
      .px-wow-flow i{font-style:normal;color:#7c5cff}
      .px-wow-scan{height:7px;margin-top:13px;border-radius:99px;background:rgba(255,255,255,.06);overflow:hidden}
      .px-wow-scan i{display:block;width:54%;height:100%;border-radius:99px;background:linear-gradient(90deg,#7c5cff,#5b8cff,#36d99d);animation:pxScan 2.8s ease-in-out infinite}
      @keyframes pxScan{0%,100%{transform:translateX(-70%);width:42%}50%{transform:translateX(100%);width:62%}}

      .quickbox{position:relative;border-color:rgba(124,92,255,.3)!important;box-shadow:0 34px 110px rgba(0,0,0,.34),0 0 70px rgba(124,92,255,.08)!important}
      .quickbox:before{content:"AI DECISION ENGINE";position:absolute;right:18px;top:-10px;padding:5px 8px;border-radius:999px;border:1px solid rgba(124,92,255,.24);background:#0d1321;color:#a99dff;font-size:8px;font-weight:950;letter-spacing:.12em}
      .quickhead b{font-size:14px!important}
      .quickhead span{color:#92a1bb!important}
      .quickactions .primary{position:relative;overflow:hidden;box-shadow:0 16px 55px rgba(124,92,255,.34)!important}
      .quickactions .primary:after{content:"";position:absolute;inset:0;transform:translateX(-120%);background:linear-gradient(100deg,transparent,rgba(255,255,255,.22),transparent);animation:pxShine 3.8s ease-in-out infinite}
      @keyframes pxShine{0%,65%,100%{transform:translateX(-120%)}78%{transform:translateX(120%)}}

      .px-wow-proof{width:min(900px,100%);margin:13px auto 0;display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
      .px-wow-proof-card{padding:11px 12px;border:1px solid rgba(255,255,255,.07);border-radius:13px;background:rgba(255,255,255,.02);text-align:left;transition:.2s}
      .px-wow-proof-card:hover{transform:translateY(-2px);border-color:rgba(124,92,255,.3);background:rgba(124,92,255,.05)}
      .px-wow-proof-card strong{display:block;font-size:11px}
      .px-wow-proof-card span{display:block;margin-top:3px;color:#78859c;font-size:9px;line-height:1.35}

      .px-wow-cta{display:inline-flex!important;align-items:center;justify-content:center;gap:7px;margin-left:7px;text-decoration:none;color:#dce2ef;background:rgba(255,255,255,.045);border:1px solid rgba(255,255,255,.1);padding:13px 17px;border-radius:13px;font-weight:900;font-size:12px;transition:.18s}
      .px-wow-cta:hover{transform:translateY(-2px);border-color:rgba(124,92,255,.4);background:rgba(124,92,255,.08)}

      .px-wow-cursor-glow{position:fixed;left:0;top:0;width:240px;height:240px;border-radius:50%;pointer-events:none;z-index:0;background:radial-gradient(circle,rgba(124,92,255,.08),transparent 68%);transform:translate(-50%,-50%);opacity:0;transition:opacity .3s ease}

      @media(max-width:760px){
        .px-wow-console{padding:9px}
        .px-wow-console-inner{grid-template-columns:1fr}
        .px-wow-proof{grid-template-columns:1fr}
        .px-wow-flow{grid-template-columns:1fr}
        .px-wow-cta{width:100%;margin:7px 0 0}
        .quickbox:before{display:none}
        .px-wow-orbit{top:40px;height:520px}
      }
    `;
    document.head.appendChild(style);
  }

  function addCursorGlow(){
    if(window.matchMedia && window.matchMedia('(pointer:coarse)').matches) return;
    if(document.getElementById('px-wow-cursor')) return;
    var glow=document.createElement('div');
    glow.id='px-wow-cursor';
    glow.className='px-wow-cursor-glow';
    document.body.appendChild(glow);
    var visible=false;
    window.addEventListener('pointermove',function(e){
      var hero=document.querySelector('.hero');
      if(!hero) return;
      var rect=hero.getBoundingClientRect();
      var inside=e.clientY>=rect.top && e.clientY<=rect.bottom;
      if(inside && !visible){glow.style.opacity='1';visible=true;}
      if(!inside && visible){glow.style.opacity='0';visible=false;}
      glow.style.left=e.clientX+'px';
      glow.style.top=e.clientY+'px';
    },{passive:true});
  }

  function addWowHomeLayer(){
    if(!document.body) return;
    var hero=document.querySelector('.hero');
    if(!hero || hero.dataset.pxWow==='1') return;
    hero.dataset.pxWow='1';

    var orbit=document.createElement('div');
    orbit.className='px-wow-orbit';
    hero.prepend(orbit);

    var eyebrow=hero.querySelector('.eyebrow');
    if(eyebrow) eyebrow.innerHTML='✦ <span>PROJECT-X AUTOPILOT · AI DECISION ENGINE</span>';

    var h1=hero.querySelector('h1');
    if(h1) h1.innerHTML='Non cercare il software giusto.<br><span class="grad">Fatti costruire il sistema.</span>';

    var p=hero.querySelector('p');
    if(p) p.textContent='Racconta il collo di bottiglia. PROJECT-X capisce il lavoro, individua cosa automatizzare, costruisce lo stack e accompagna il prossimo passo.';

    var status=document.createElement('div');
    status.className='px-wow-status';
    status.innerHTML=`
      <span class="px-wow-pill"><i class="px-wow-dot"></i> Motore attivo</span>
      <span class="px-wow-pill">⚡ Analisi in pochi secondi</span>
      <span class="px-wow-pill">◈ Stack personalizzato</span>
      <span class="px-wow-pill">✓ Decisione separata dal brand</span>
    `;
    hero.insertBefore(status, hero.querySelector('.quickbox') || null);

    var consoleBox=document.createElement('div');
    consoleBox.className='px-wow-console';
    consoleBox.innerHTML=`
      <div class="px-wow-console-inner">
        <div class="px-wow-mini">
          <div class="px-wow-kicker">1 · Capisci</div>
          <div class="px-wow-big">Il problema diventa dati.</div>
          <div class="px-wow-copy">Obiettivi, tempo perso, team, budget e strumenti esistenti diventano un profilo decisionale.</div>
          <div class="px-wow-flow"><span><i>01</i> problema</span><span><i>02</i> bisogni</span><span><i>03</i> priorità</span></div>
        </div>
        <div class="px-wow-mini">
          <div class="px-wow-kicker">2 · Costruisci</div>
          <div class="px-wow-big">Un sistema, non una lista.</div>
          <div class="px-wow-copy">Software, automazioni e prossimo passo vengono collegati intorno al processo reale.</div>
          <div class="px-wow-scan"><i></i></div>
        </div>
      </div>
    `;
    hero.insertBefore(consoleBox, hero.querySelector('.quickbox') || null);

    var actions=hero.querySelector('.quickactions');
    if(actions && !actions.querySelector('.px-wow-cta')){
      var a=document.createElement('a');
      a.className='px-wow-cta';
      a.href='/coach.html?source=home-wow';
      a.textContent='Parla con AI Coach →';
      actions.appendChild(a);
    }

    var quickbox=hero.querySelector('.quickbox');
    if(quickbox && !hero.querySelector('.px-wow-proof')){
      var proof=document.createElement('div');
      proof.className='px-wow-proof';
      proof.innerHTML=`
        <div class="px-wow-proof-card"><strong>🎯 Fit prima del brand</strong><span>Il ranking parte dalle esigenze, non dalla fama dello strumento.</span></div>
        <div class="px-wow-proof-card"><strong>🧠 AI + motore</strong><span>L'AI interpreta; il motore deterministico decide in modo coerente.</span></div>
        <div class="px-wow-proof-card"><strong>🛡️ Trasparenza</strong><span>Eventuali collegamenti commerciali sono dichiarati dove compaiono; la compatibilità viene calcolata separatamente.</span></div>
      `;
      quickbox.insertAdjacentElement('afterend',proof);
    }

    addCursorGlow();
  }

  function rewriteAffiliateLinks(){
    var links=document.querySelectorAll('#primaryLink');
    Array.prototype.forEach.call(links,function(link){
      if(link.dataset.pxAffiliateWired==='1') return;
      try{
        var u=new URL(link.href,window.location.origin);
        var tool=hostToTool[u.hostname.toLowerCase()];
        if(!tool) return;
        link.href='/api/affiliate?tool='+encodeURIComponent(tool)+'&source=results';
        link.dataset.pxAffiliateWired='1';
        link.target='_self';
      }catch(e){}
    });
  }

  function addProButton(){
    var mount=document.getElementById('primaryMount');
    if(!mount || mount.dataset.pxProWired==='1') return;
    mount.dataset.pxProWired='1';
    var box=document.createElement('div');
    box.style.cssText='margin-top:12px;display:flex;align-items:center;justify-content:space-between;gap:10px;padding:12px 14px;border:1px solid rgba(255,209,102,.18);border-radius:14px;background:rgba(255,209,102,.045);font-size:11px;line-height:1.4;color:#98a5bc;flex-wrap:wrap;';
    box.innerHTML='<span><strong style="color:#fff">Report PRO</strong> · roadmap, automazioni, KPI e blueprint operativa.</span><a href="/report-pro.html" style="display:inline-flex;align-items:center;justify-content:center;padding:9px 12px;border-radius:10px;text-decoration:none;color:#fff;font-weight:900;background:linear-gradient(135deg,#7c5cff,#5b8cff)">Vedi Report PRO →</a>';
    mount.appendChild(box);
  }

  function loadAutopilot(){
    if(window.ProjectXAutopilot || document.querySelector('script[data-projectx-autopilot="1"]')) return;
    var script=document.createElement('script');
    script.src='/autopilot.js';
    script.async=true;
    script.dataset.projectxAutopilot='1';
    document.body.appendChild(script);
  }

  function loadExperience(){
    if(document.querySelector('script[data-projectx-experience="1"]')) return;
    var script=document.createElement('script');
    script.src='/experience.js';
    script.async=true;
    script.dataset.projectxExperience='1';
    document.body.appendChild(script);
  }

  function loadProductLayer(){
    if(document.querySelector('script[data-projectx-product-layer="1"]')) return;
    var script=document.createElement('script');
    script.src='/product-layer.js';
    script.async=true;
    script.dataset.projectxProductLayer='1';
    document.body.appendChild(script);
  }

  function loadConversionLayer(){
    if(document.querySelector('script[data-projectx-conversion-layer="1"]')) return;
    var script=document.createElement('script');
    script.src='/conversion-layer.js?v=20260919-wowfix1';
    script.async=true;
    script.dataset.projectxConversionLayer='1';
    document.body.appendChild(script);
  }

  function loadBlueprintLayer(){
    if(document.querySelector('script[data-projectx-blueprint-layer="1"]')) return;
    var script=document.createElement('script');
    script.src='/blueprint-layer.js';
    script.async=true;
    script.dataset.projectxBlueprintLayer='1';
    document.body.appendChild(script);
  }

  function update(){
    var home=document.getElementById('home');
    var results=document.getElementById('results');
    if(home && results && (results.hidden || results.style.display==='none')) return;

    injectWowStyles();
    if(results && results.style.display!=='none'){
      addProButton();
      rewriteAffiliateLinks();
      loadAutopilot();
      loadExperience();
      loadProductLayer();
      loadBlueprintLayer();
      loadConversionLayer();
    }
  }

  var observer=new MutationObserver(update);
  observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['style']});
  update();
  window.addEventListener('load',update);
})();