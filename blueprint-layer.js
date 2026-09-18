/* PROJECT-X · SYSTEM BLUEPRINT LAYER · zero API cost */
(function(){
"use strict";
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]})}
function primary(r){return r&&(r.primaryTool||r.primary||(r.rankedTools&&r.rankedTools[0]))||null}
function labelFor(E,k){return E&&E.NEED_LABELS&&E.NEED_LABELS[k]||k}
function readAnswers(){
 try{return JSON.parse(localStorage.getItem("projectx_answers_v2")||"null")||{}}catch(e){return{}}
}
function getResult(answers){
 try{
  var E=window.ProjectXEngine;
  return E&&typeof E.analyzeAnswers==="function" ? E.analyzeAnswers(answers) : null;
 }catch(e){return null}
}
function buildNodes(answers,result){
 var E=window.ProjectXEngine||{}, p=primary(result), profile=result&&result.profile||{};
 var entries=Object.entries(profile).sort(function(a,b){return Number(b[1])-Number(a[1])}).slice(0,3);
 return [
  {n:"01",t:"Problema",d:answers&&answers.painPoint||"Bisogno operativo da strutturare"},
  {n:"02",t:"Nucleo",d:p&&p.name||"Software principale da definire"},
  {n:"03",t:"Automazione",d:labelFor(E,entries[0]&&entries[0][0]||"automation")},
  {n:"04",t:"Controllo",d:labelFor(E,entries[1]&&entries[1][0]||"documents")},
  {n:"05",t:"Misurazione",d:labelFor(E,entries[2]&&entries[2][0]||"projects")}
 ];
}
function mount(){
 if(document.getElementById("projectxBlueprintLive")) return;
 var answers=readAnswers();
 if(!answers||!Object.keys(answers).length) return;
 var result=getResult(answers);
 if(!result) return;
 var nodes=buildNodes(answers,result), wrap=document.createElement("section");
 wrap.id="projectxBlueprintLive";
 wrap.innerHTML='<div class="pxb-card"><div class="pxb-kicker">PROJECT-X · SYSTEM BLUEPRINT</div><h3>Dal problema al sistema.</h3><p>Una mappa operativa generata dal tuo profilo, senza chiamate API.</p><div class="pxb-flow">'+nodes.map(function(x,i){return '<div class="pxb-node"><span>'+x.n+'</span><b>'+esc(x.t)+'</b><small>'+esc(x.d)+'</small></div>'+(i<nodes.length-1?'<div class="pxb-arrow">→</div>':'')}).join('')+'</div><div class="pxb-actions"><a href="/compare.html">Confronta software</a><a href="/report-pro.html">Approfondisci con Report PRO</a></div></div>';
 var style=document.createElement("style");
 style.textContent='.pxb-card{margin:18px 0;padding:22px;border:1px solid rgba(124,92,255,.24);border-radius:22px;background:linear-gradient(180deg,rgba(124,92,255,.08),rgba(255,255,255,.018));box-shadow:0 20px 60px rgba(0,0,0,.16)}.pxb-kicker{font-size:9px;font-weight:900;letter-spacing:.16em;color:#a99dff}.pxb-card h3{margin:8px 0 4px;font-size:24px}.pxb-card p{margin:0;color:#98a5bc;font-size:11px;line-height:1.5}.pxb-flow{display:grid;grid-template-columns:1fr auto 1fr auto 1fr auto 1fr auto 1fr;gap:8px;align-items:stretch;margin-top:16px}.pxb-node{min-height:106px;padding:12px;border:1px solid rgba(255,255,255,.08);border-radius:14px;background:rgba(7,11,20,.55)}.pxb-node span{display:block;color:#8e80ff;font-size:9px;font-weight:900}.pxb-node b{display:block;margin-top:8px;font-size:12px}.pxb-node small{display:block;margin-top:5px;color:#77859c;font-size:9px;line-height:1.35}.pxb-arrow{display:flex;align-items:center;justify-content:center;color:#7c5cff;font-size:20px}.pxb-actions{display:flex;flex-wrap:wrap;gap:8px;margin-top:14px}.pxb-actions a{display:inline-flex;padding:9px 11px;border:1px solid rgba(255,255,255,.08);border-radius:10px;color:#fff;text-decoration:none;font-size:10px}@media(max-width:900px){.pxb-flow{grid-template-columns:1fr}.pxb-arrow{display:none}}';
 document.head.appendChild(style);
 var target=document.getElementById("results")||document.querySelector("main")||document.body;
 target.appendChild(wrap);
 try{if(window.ProjectXAutopilot)window.ProjectXAutopilot.track("system_blueprint_view",{primary:primary(result)&&primary(result).name||""})}catch(e){}
}
function hook(){
 setTimeout(mount,500);
 setTimeout(mount,1500);
 setTimeout(mount,3000);
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",hook);else hook();
window.ProjectXBlueprint={mount:mount};
})();