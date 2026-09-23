/* PROJECT-X — HUMAN GUIDANCE LAYER */
(function(){
'use strict';
if(window.__PROJECTX_HUMAN_LAYER__) return;
window.__PROJECTX_HUMAN_LAYER__=true;

function page(){var p=location.pathname.split('/').pop()||'index.html';return (!p||p==='/')?'index.html':p.toLowerCase();}
function context(){
var p=page();
if(p==='index.html'){
 var results=document.getElementById('results'), questionnaire=document.getElementById('questionnaire');
 if(results&&getComputedStyle(results).display!=='none') return {title:'Hai la risposta. Ora trasformiamola in un’azione.',text:'Non devi capire tutto subito. Guarda prima la scelta principale, poi il piano dei prossimi 7 giorni.',step:'3 / 4 · DECIDI',cta:'Vedi il mio piano',action:function(){var e=document.getElementById('planMount')||document.getElementById('primaryMount');if(e)e.scrollIntoView({behavior:'smooth',block:'start'});},secondary:'Salva il risultato',secondaryAction:function(){var b=document.getElementById('saveLinkBtn');if(b)b.click();}};
 if(questionnaire&&getComputedStyle(questionnaire).display!=='none') return {title:'Stai facendo la parte giusta: rispondere.',text:'Una domanda alla volta. Non serve conoscere il nome del software: descrivi come lavori.',step:'2 / 4 · CAPISCI',cta:'Continua',action:function(){var b=document.getElementById('nextBtn');if(b)b.click();},secondary:'Indietro',secondaryAction:function(){var b=document.getElementById('backBtn');if(b)b.click();}};
 return {title:'Partiamo dal problema, non dal software.',text:'Descrivi una situazione concreta. PROJECT-X ti accompagna fino alla scelta e al primo passo operativo.',step:'1 / 4 · RACCONTA',cta:'Fai l’analisi rapida',action:function(){var e=document.getElementById('quickProblem');if(e){e.scrollIntoView({behavior:'smooth',block:'center'});e.focus();}},secondary:'Come funziona',secondaryAction:'scrollBenefits'};
}
if(p==='audit.html')return{title:'Prima troviamo l’attrito.',text:'Descrivi gli strumenti che usi oggi e il passaggio che ti fa perdere più tempo.',step:'2 / 4 · CONTROLLA',cta:'Vai al campo Audit',action:function(){var e=document.getElementById('stack');if(e){e.focus();e.scrollIntoView({behavior:'smooth',block:'center'});}}},secondary:'Apri Value Simulator',secondaryAction:function(){location.href='/simulator.html?source=audit-guide';}};
if(p==='simulator.html')return{title:'Ora metti il tempo in numeri.',text:'Regola ore, valore orario, persone e recupero realistico.',step:'3 / 4 · MISURA',cta:'Modifica i parametri',action:function(){var e=document.getElementById('hours');if(e){e.focus();e.scrollIntoView({behavior:'smooth',block:'center'});}},secondary:'Apri Business Audit',secondaryAction:function(){location.href='/audit.html?source=simulator-guide';}};
if(p==='workspace.html')return{title:'Riprendi da dove eri arrivato.',text:'La Workspace riunisce i dati salvati dal browser.',step:'PROJECT-X · WORKSPACE',cta:'Vai al prossimo passo',action:function(){var e=document.getElementById('nextBtn');if(e)e.click();},secondary:'Torna al motore',secondaryAction:'goHome'};
if(p==='pro.html')return{title:'Prima capisci cosa stai acquistando.',text:'Il Report PRO è il livello successivo: roadmap, workflow, KPI e business case.',step:'3 / 4 · APPROFONDISCI',cta:'Guarda cosa ricevi',action:function(){var e=document.querySelector('.features, #proCheckoutBtn');if(e)e.scrollIntoView({behavior:'smooth',block:'center'});},secondary:'Torna al motore',secondaryAction:'goHome'};
return{title:'Ti guido io.',text:'Puoi capire cosa stai guardando e riprendere dal punto giusto.',step:'PROJECT-X',cta:'Torna al motore',action:'goHome',secondary:'FAQ',secondaryAction:'goFaq'};
}
function handle(n){if(n==='goHome'){location.href='/';return;}if(n==='goFaq'){location.href='/faq.html';return;}if(n==='scrollBenefits'){var e=document.getElementById('benefits');if(e)e.scrollIntoView({behavior:'smooth',block:'start'});return;}try{if(typeof window[n]==='function')window[n]();}catch(e){}}
function inject(){
if(document.getElementById('px-human-guidance'))return;
var s=document.createElement('style');s.id='px-human-guidance-style';s.textContent=`
#px-human-guidance{pointer-events:none;position:fixed;right:18px;bottom:18px;z-index:9999;font-family:Inter,system-ui,-apple-system,"Segoe UI",sans-serif}
#px-human-toggle{position:relative;isolation:isolate;display:inline-grid;place-items:center;width:46px;height:46px;padding:0;border:1px solid rgba(151,126,255,.48);border-radius:15px;background:linear-gradient(145deg,rgba(25,20,50,.98),rgba(8,12,24,.96));backdrop-filter:blur(18px);color:#fff;cursor:pointer;box-shadow:0 14px 38px rgba(0,0,0,.38),inset 0 1px 0 rgba(255,255,255,.09),0 0 0 1px rgba(124,92,255,.06);transition:transform .22s ease,box-shadow .22s ease,border-color .22s ease}
#px-human-toggle:before{content:"";position:absolute;inset:-1px;border-radius:15px;background:linear-gradient(135deg,rgba(143,112,255,.55),transparent 45%,rgba(54,217,157,.22));z-index:-1;opacity:.55;filter:blur(5px)}
#px-human-toggle:after{content:"✦";font-size:18px;font-weight:900;color:#d9d1ff;text-shadow:0 0 14px rgba(145,119,255,.9);transform:translateY(-1px)}
#px-human-toggle:hover{transform:translateY(-2px) scale(1.04);border-color:rgba(177,157,255,.8);box-shadow:0 18px 45px rgba(0,0,0,.44),0 0 24px rgba(124,92,255,.18)}
#px-human-toggle .dot,#px-human-toggle span:not(.dot){display:none}
#px-human-panel{display:none;width:min(390px,calc(100vw - 28px));margin-bottom:10px;padding:17px;border:1px solid rgba(124,92,255,.24);background:rgba(9,13,24,.97);backdrop-filter:blur(20px);color:#fff;border-radius:20px;box-shadow:0 25px 90px rgba(0,0,0,.5)}
#px-human-panel.open{display:block}
.pxh-top{display:flex;justify-content:space-between;gap:12px;align-items:flex-start}.pxh-step{display:inline-flex;padding:8px 10px;border:1px solid rgba(124,92,255,.23);background:rgba(124,92,255,.08);color:#bfb3ff;border-radius:999px;font-size:12px;font-weight:900}.pxh-close{border:0;background:transparent;color:#74819a;font-size:17px;cursor:pointer}.pxh-title{margin:11px 0 6px;font-size:20px;font-weight:950;letter-spacing:-.02em}.pxh-text{margin:0;color:#c0cad8;font-size:14px;line-height:1.65}.pxh-actions{display:grid;gap:8px;margin-top:14px}.pxh-btn{width:100%;padding:13px 14px;border-radius:13px;border:1px solid rgba(124,92,255,.25);background:linear-gradient(135deg,#7c5cff,#5b8cff);color:#fff;font-weight:900;font-size:14px;cursor:pointer}.pxh-btn.secondary{background:rgba(255,255,255,.035);color:#dfe6f4;border-color:rgba(255,255,255,.09)}.pxh-foot{margin-top:11px;color:#8b98ab;font-size:12px;line-height:1.5}
@media(max-width:600px){#px-human-guidance{right:10px;bottom:74px}#px-human-toggle{width:40px;height:40px;border-radius:13px;box-shadow:0 10px 28px rgba(0,0,0,.36),inset 0 1px 0 rgba(255,255,255,.08)}#px-human-toggle:after{font-size:16px}#px-human-panel{width:min(360px,calc(100vw - 20px));max-height:60vh;overflow:auto}}
#px-human-panel,#px-human-toggle{pointer-events:auto}`;
document.head.appendChild(s);
var w=document.createElement('div');w.id='px-human-guidance';w.innerHTML='<div id="px-human-panel"><div class="pxh-top"><span id="px-human-step" class="pxh-step"></span><button id="px-human-close" class="pxh-close" aria-label="Chiudi guida">×</button></div><div id="px-human-title" class="pxh-title"></div><p id="px-human-text" class="pxh-text"></p><div class="pxh-actions"><button id="px-human-primary" class="pxh-btn"></button><button id="px-human-secondary" class="pxh-btn secondary"></button></div><div class="pxh-foot">Guida PROJECT-X · puoi chiuderla in qualsiasi momento.</div></div><button id="px-human-toggle" aria-label="Apri guida" aria-expanded="false"><span class="dot"></span><span>Ti guido io</span></button>';document.body.appendChild(w);
var ctx=context(),panel=document.getElementById('px-human-panel'),toggle=document.getElementById('px-human-toggle');
function render(){ctx=context();document.getElementById('px-human-step').textContent=ctx.step;document.getElementById('px-human-title').textContent=ctx.title;document.getElementById('px-human-text').textContent=ctx.text;document.getElementById('px-human-primary').textContent=ctx.cta;document.getElementById('px-human-secondary').textContent=ctx.secondary;}
function shut(){panel.classList.remove('open');toggle.setAttribute('aria-expanded','false')}
render();
toggle.onclick=function(){if(panel.classList.contains('open'))shut();else{render();panel.classList.add('open');toggle.setAttribute('aria-expanded','true');}};
document.getElementById('px-human-close').onclick=shut;
document.getElementById('px-human-primary').onclick=function(){render();if(typeof ctx.action==='function')ctx.action();else handle(ctx.action);shut();};
document.getElementById('px-human-secondary').onclick=function(){render();if(typeof ctx.secondaryAction==='function')ctx.secondaryAction();else handle(ctx.secondaryAction);shut();};
document.addEventListener('keydown',function(e){if(e.key==='Escape')shut();});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',inject);else inject();
})();