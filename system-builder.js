(function(){
'use strict';
var esc=function(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})};
function q(id){return document.getElementById(id)}
function infer(text){
 var s=(text||'').toLowerCase(),tags=[];
 var map=[[/email|posta|gmail|outlook|messagg/i,'Email'],[/preventiv|offert|quotazion/i,'Preventivi'],[/cliente|crm|lead|contatt|follow.?up|richiam/i,'Clienti'],[/excel|foglio|spreadsheet|copia.?incolla/i,'Excel'],[/ordine|e.?commerce|shop|negozio online/i,'E-commerce'],[/marketing|campagn|newsletter|social|contenut/i,'Marketing'],[/document|pdf|fattur|file/i,'Documenti'],[/progett|scadenz|task|attivit/i,'Progetti'],[/automat|ripetitiv|manuale|copia|perdo ore|perdo tempo/i,'Automazioni']];
 map.forEach(function(x){if(x[0].test(s)&&tags.indexOf(x[1])<0)tags.push(x[1])});
 var business='Professionista';
 if(/e.?commerce|negozio online|ordini online/i.test(s))business='E-commerce';
 else if(/agenzia|clienti.*campagn|campagn.*clienti/i.test(s))business='Agenzia';
 else if(/azienda|dipendent|team|ufficio/i.test(s))business='Azienda';
 else if(/artigian|impresa|intervent|installaz|servizi/i.test(s))business='Impresa di servizi';
 var budget='';
 if(/gratis|zero budget|nessun budget|0 ?€/i.test(s))budget='€0';
 else if(/100 ?€|150 ?€|200 ?€|250 ?€|budget.*alto/i.test(s))budget='€101–250';
 else if(/50 ?€|60 ?€|70 ?€|80 ?€|90 ?€/i.test(s))budget='€51–100';
 return {tags:tags,business:business,budget:budget};
}
function renderSignals(){
 var box=q('quickProblem'),host=q('pxBuilderSignals');if(!box||!host)return;
 var x=infer(box.value);
 host.innerHTML=x.tags.length?'<span class="px-builder-label">PROJECT-X ha capito:</span>'+x.tags.slice(0,5).map(function(t){return '<span class="px-builder-chip">'+esc(t)+'</span>'}).join(''):'<span class="px-builder-label">Scrivi il problema come lo diresti a una persona.</span>';
 var b=q('quickBusiness'),bud=q('quickBudget');if(x.business&&!b.value)b.value=x.business;if(x.budget&&!bud.value)bud.value=x.budget;
}
function buildCard(){
 var r=q('results'),p=q('primaryMount'),old=q('px-build-card');if(!r||!p||!p.innerHTML||old)return;
 var name=(p.querySelector('h2')&&p.querySelector('h2').textContent)||'la configurazione scelta';
 var problem=(q('quickProblem')&&q('quickProblem').value)||'Il problema che hai descritto';
 var card=document.createElement('div');card.id='px-build-card';card.className='px-build-card';
 card.innerHTML='<div class="px-build-kicker">COSTRUISCI IL MIO SISTEMA</div><div class="px-build-title">Non fermarti alla scelta. Costruiamo il primo pezzo.</div><div class="px-build-grid"><div><span>PROBLEMA</span><b>'+esc(problem.slice(0,180))+'</b></div><div><span>NUCLEO</span><b>'+esc(name)+'</b></div><div><span>PRIMA AZIONE</span><b>Configura il nucleo e collegalo al passaggio più ripetitivo.</b></div></div><div class="px-build-actions"><a class="btn primary" href="/workspace.html">Apri il Workspace →</a><a class="btn secondary" href="/simulator.html">Simula il workflow</a></div><div class="px-build-note">Regola PROJECT-X: un workflow funzionante prima di aggiungere altri strumenti.</div>';
 p.insertAdjacentElement('afterend',card);
}
function init(){
 var box=q('quickProblem');if(!box)return;
 if(!q('pxBuilderSignals')){var h=document.createElement('div');h.id='pxBuilderSignals';h.className='px-builder-signals';box.insertAdjacentElement('afterend',h)}
 box.addEventListener('input',renderSignals);renderSignals();
 var btn=q('quickBtn');if(btn)btn.textContent='COSTRUISCI IL MIO SISTEMA →';
 var full=q('fullBtn');if(full)full.textContent='Analisi completa';
 var obs=new MutationObserver(function(){if(q('results')&&!q('results').hidden)setTimeout(buildCard,40)});
 obs.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['hidden','style']});
 setTimeout(buildCard,500);
}
var style=document.createElement('style');
style.textContent='.px-builder-signals{display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-top:9px;min-height:22px}.px-builder-label{font-size:8px;color:#687791;font-weight:900;letter-spacing:.04em}.px-builder-chip{font-size:8px;font-weight:900;color:#d8d2ff;border:1px solid rgba(124,92,255,.22);background:rgba(124,92,255,.07);border-radius:999px;padding:6px 8px}.px-build-card{margin-top:15px;padding:23px;border:1px solid rgba(54,217,157,.18);border-radius:24px;background:linear-gradient(145deg,rgba(12,27,31,.94),rgba(8,13,22,.98));box-shadow:0 24px 70px rgba(0,0,0,.2)}.px-build-kicker{font-size:9px;letter-spacing:.16em;font-weight:950;color:#7ce8bd}.px-build-title{font-size:25px;line-height:1.08;letter-spacing:-.04em;margin:8px 0 16px}.px-build-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:9px}.px-build-grid>div{padding:13px;border:1px solid rgba(255,255,255,.07);border-radius:14px;background:rgba(255,255,255,.02)}.px-build-grid span{display:block;font-size:8px;color:#6f7e96;font-weight:900;letter-spacing:.08em;margin-bottom:6px}.px-build-grid b{display:block;font-size:11px;line-height:1.45;color:#e7ecf5}.px-build-actions{display:flex;gap:9px;flex-wrap:wrap;margin-top:13px}.px-build-actions .btn{text-decoration:none}.px-build-note{margin-top:11px;color:#7e8ca3;font-size:9px;line-height:1.5}@media(max-width:700px){.px-build-grid{grid-template-columns:1fr}.px-build-title{font-size:21px}.px-build-actions .btn{width:100%}}';
document.head.appendChild(style);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();