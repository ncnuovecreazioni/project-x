import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const CLUSTERS = JSON.parse(fs.readFileSync(path.join(ROOT, 'growth-clusters.json'), 'utf8'));
const COUNT = Number((process.argv.find((arg) => arg.startsWith('--count=')) || '--count=1').split('=')[1]) || 1;
const TODAY = new Date().toISOString().slice(0, 10);

const staticPublic = [
  ['index.html', '1.0'],
  ['coach.html', '0.95'],
  ['soluzioni.html', '0.9'],
  ['faq.html', '0.9'],
  ['report-pro.html', '0.8'],
  ['software-per-professionisti.html', '0.8'],
  ['crm-per-piccole-imprese.html', '0.8'],
  ['automazione-preventivi.html', '0.8'],
  ['automazione-email.html', '0.8'],
  ['microsoft-365-automazioni.html', '0.8'],
  ['recupero-carrelli-ecommerce.html', '0.8'],
  ['gestione-progetti.html', '0.8'],
  ['software-per-agenzie.html', '0.8']
];

function esc(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function slugify(value) {
  return String(value).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function buildPage(item) {
  const related = [
    '<a href="/">Analisi PROJECT-X</a>',
    '<a href="/coach.html">AI Coach</a>',
    '<a href="/soluzioni.html">Soluzioni</a>',
    '<a href="/faq.html">FAQ</a>'
  ].join(' · ');

  const faq = [
    `Quale software serve a ${item.audience}?`,
    `Come automatizzare ${item.goal.toLowerCase()}?`,
    `Da dove iniziare se oggi ${item.pain.toLowerCase()}?`
  ];

  const answers = [
    `Non esiste un software universale. La scelta va ricondotta al processo: volume di richieste, persone coinvolte, strumenti già presenti, budget e automazioni necessarie. PROJECT-X parte da questi elementi e costruisce una direzione prima di proporre strumenti.`,
    `Conviene individuare il passaggio ripetitivo più costoso, definire quali dati devono entrare e uscire e poi collegare gli strumenti. In molti casi il primo flusso utile è richiesta → raccolta dati → attività → promemoria → follow-up.`,
    `Parti dal collo di bottiglia descritto in modo concreto. Conta quante volte si ripete, quanto tempo assorbe e quali strumenti tocca. Poi valuta se conservare ciò che funziona, automatizzare i passaggi manuali o sostituire solo il pezzo che crea attrito.`
  ];

  const structuredFaq = faq.map((question, index) => ({
    '@type': 'Question',
    name: question,
    acceptedAnswer: { '@type': 'Answer', text: answers[index] }
  }));

  const title = `${item.keyword}: come scegliere software e automazioni`;
  const description = `Guida pratica per ${item.audience}: ${item.goal}. Analizza processo, strumenti, automazioni e prossimo passo senza scegliere app a caso.`;

  return `<!doctype html>
<html lang="it">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="https://project-x-phi-steel.vercel.app/${esc(item.slug)}.html">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:type" content="article">
<title>${esc(title)} | PROJECT-X</title>
<style>
:root{--bg:#050711;--bg2:#0a0f1c;--panel:rgba(15,21,38,.92);--line:rgba(255,255,255,.09);--text:#f7f9ff;--muted:#98a5bc;--p:#7c5cff;--p2:#5b8cff;--ok:#36d99d}
*{box-sizing:border-box}body{margin:0;color:var(--text);font-family:Inter,system-ui,-apple-system,"Segoe UI",sans-serif;background:radial-gradient(circle at 10% 0%,rgba(124,92,255,.2),transparent 28%),linear-gradient(180deg,var(--bg),var(--bg2));line-height:1.68}.wrap{width:min(980px,calc(100% - 30px));margin:auto}.top{padding:22px 0;border-bottom:1px solid var(--line)}.logo{font-weight:950;letter-spacing:.18em}.logo b{color:var(--p)}main{padding:62px 0 100px}.eyebrow{display:inline-block;padding:7px 10px;border:1px solid rgba(124,92,255,.3);border-radius:999px;color:#c9bfff;background:rgba(124,92,255,.07);font-size:10px;font-weight:900;letter-spacing:.12em}.hero h1{font-size:clamp(38px,6vw,66px);line-height:.98;letter-spacing:-.065em;margin:18px 0}.grad{background:linear-gradient(100deg,#fff,#ad9dff 47%,#79aaff);-webkit-background-clip:text;background-clip:text;color:transparent}.hero p{color:var(--muted);font-size:17px;max-width:820px}.card{margin-top:17px;padding:27px;border:1px solid var(--line);border-radius:22px;background:var(--panel);box-shadow:0 18px 55px rgba(0,0,0,.18)}h2{font-size:25px;letter-spacing:-.035em;margin:0 0 9px}h3{font-size:18px;margin:22px 0 6px}.muted{color:var(--muted)}.grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}.step{padding:16px;border:1px solid var(--line);border-radius:15px;background:rgba(255,255,255,.02)}.step b{display:block}.step span{display:block;color:var(--muted);font-size:13px;margin-top:5px}.cta{margin-top:22px;padding:23px;border:1px solid rgba(124,92,255,.3);border-radius:20px;background:linear-gradient(135deg,rgba(124,92,255,.12),rgba(91,140,255,.07))}.cta a{display:inline-flex;margin:8px 8px 0 0;padding:12px 15px;border-radius:12px;text-decoration:none;color:#fff;font-weight:900;background:linear-gradient(135deg,var(--p),var(--p2))}.links{margin-top:25px;font-size:12px;color:var(--muted)}.links a{color:#bcaeff;text-decoration:none}@media(max-width:720px){.grid{grid-template-columns:1fr}}
</style>
<script type="application/ld+json">${JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    dateModified: TODAY,
    inLanguage: 'it-IT',
    author: { '@type': 'Organization', name: 'PROJECT-X' },
    mainEntity: { '@type': 'FAQPage', mainEntity: structuredFaq }
  })}</script>
</head>
<body>
<header class="top"><div class="wrap"><div class="logo">PROJECT-<b>X</b></div></div></header>
<main><div class="wrap">
<section class="hero">
<span class="eyebrow">GUIDA PROJECT-X · ${esc(item.keyword.toUpperCase())}</span>
<h1>${esc(item.keyword)}: <span class="grad">costruire il sistema giusto</span></h1>
<p>${esc(item.intro || `Per ${item.audience}, il punto di partenza non è cercare l'app più famosa: è capire il processo, il collo di bottiglia e il livello di automazione che ha senso per l'attività.`)}</p>
</section>
<section class="card"><h2>Il problema da risolvere</h2><p>${esc(item.pain)}. L'obiettivo è ${esc(item.goal)} senza aggiungere strumenti inutili.</p><h3>Il metodo</h3><div class="grid">
<div class="step"><b>1 · Mappa il flusso</b><span>Da richiesta a risultato: individua dove entrano dati, persone, email, file e scadenze.</span></div>
<div class="step"><b>2 · Conserva ciò che funziona</b><span>Gli strumenti già adottati possono restare il nucleo dello stack quando coprono bene una parte del processo.</span></div>
<div class="step"><b>3 · Automatizza il passaggio ripetitivo</b><span>Parti dal lavoro frequente e misurabile: raccolta dati, assegnazione attività, promemoria, email o report.</span></div>
<div class="step"><b>4 · Verifica il ritorno</b><span>Confronta tempo risparmiato, errori evitati e qualità del follow-up con il costo dello stack.</span></div>
</div></section>
<section class="card"><h2>Cosa può diventare automatico</h2><p class="muted">La configurazione dipende dal caso, ma questi flussi sono spesso candidati naturali:</p>
<div class="grid">
<div class="step"><b>Acquisizione</b><span>Modulo o richiesta → raccolta dati → creazione contatto/opportunità.</span></div>
<div class="step"><b>Follow-up</b><span>Scadenza o mancata risposta → promemoria → attività commerciale.</span></div>
<div class="step"><b>Documenti</b><span>Dati strutturati → modello → PDF/email → archiviazione.</span></div>
<div class="step"><b>Reporting</b><span>Fonte dati → aggiornamento → report → notifica alle persone interessate.</span></div>
</div></section>
<section class="card"><h2>Come evitare la scelta sbagliata</h2><p>Non partire da una lista di software. Parti da cinque domande: quale attività vuoi eliminare, quante volte accade, chi la esegue, quali strumenti usi già e quale budget è realistico. Solo dopo confronta le piattaforme in base alla copertura del processo.</p><p>Questo approccio evita di comprare una seconda app per fare una cosa che il tuo stack attuale potrebbe già gestire con un'automazione. Evita anche di scegliere una piattaforma troppo complessa quando il collo di bottiglia è piccolo e ripetitivo.</p></section>
<section class="card"><h2>Domande frequenti</h2>
<h3>${esc(faq[0])}</h3><p class="muted">${esc(answers[0])}</p>
<h3>${esc(faq[1])}</h3><p class="muted">${esc(answers[1])}</p>
<h3>${esc(faq[2])}</h3><p class="muted">${esc(answers[2])}</p>
</section>
<section class="cta"><h2>Vuoi sapere da dove partire nel tuo caso?</h2><p class="muted">Descrivi il problema e PROJECT-X collega esigenze, strumenti e automazioni in un percorso personalizzato.</p><a href="/?source=seo&topic=${esc(item.slug)}">Fai l'analisi →</a><a href="/coach.html?source=seo&topic=${esc(item.slug)}">Parla con AI Coach →</a></section>
<div class="links">${related}</div>
</div></main>
</body></html>`;
}

function updateSitemap(generatedSlugs) {
  const files = fs.readdirSync(ROOT).filter((name) => name.endsWith('.html'));
  const priority = new Map(staticPublic);
  const rows = files
    .filter((name) => !['affiliate.html', 'coach-result.html'].includes(name))
    .map((name) => {
      const p = priority.get(name) || (generatedSlugs.includes(name.replace(/\.html$/, '')) ? '0.7' : '0.75');
      return { name, p };
    })
    .sort((a, b) => {
      const ap = Number(a.p), bp = Number(b.p);
      if (bp !== ap) return bp - ap;
      return a.name.localeCompare(b.name);
    });

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...rows.map(({ name, p }) => `  <url><loc>https://project-x-phi-steel.vercel.app/${name === 'index.html' ? '' : name}</loc><lastmod>${TODAY}</lastmod><priority>${p}</priority></url>`),
    '</urlset>',
    ''
  ].join('\n');

  fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), xml);
}

const created = [];
for (const item of CLUSTERS) {
  if (created.length >= COUNT) break;
  const filename = `${slugify(item.slug)}.html`;
  const target = path.join(ROOT, filename);
  if (fs.existsSync(target)) continue;
  fs.writeFileSync(target, buildPage(item));
  created.push(item.slug);
}

if (!created.length) {
  console.log('PROJECT-X SEO: nessuna nuova pagina disponibile.');
  process.exit(0);
}

updateSitemap(created);
console.log(`PROJECT-X SEO: create ${created.length} pagine: ${created.join(', ')}`);
