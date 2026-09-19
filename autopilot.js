/* =========================================================
   PROJECT-X — AUTOPILOT FRONTEND
   ---------------------------------------------------------
   Non decide al posto dell'utente: osserva il funnel, misura
   le azioni e adatta esperimenti/CTA senza toccare il motore.
   ========================================================= */
(function () {
  'use strict';

  const SESSION_KEY = 'projectx_autopilot_session_v1';
  const VARIANT_KEY = 'projectx_autopilot_variant_v1';
  const START_KEY = 'projectx_autopilot_start_v1';
  const CONSENT_KEY = 'projectx_privacy_consent_v1';
  let trackingStarted = false;

  function id() {
    return 'pxs-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 9);
  }

  function sessionId() {
    let value = '';
    try { value = localStorage.getItem(SESSION_KEY) || ''; } catch (e) {}
    if (!value) {
      value = id();
      try { localStorage.setItem(SESSION_KEY, value); } catch (e) {}
    }
    return value;
  }

  function getConsent() {
    try { return localStorage.getItem(CONSENT_KEY) || ''; } catch (e) { return ''; }
  }

  function hasAnalyticsConsent() {
    return getConsent() === 'analytics';
  }

  function send(event, meta) {
    if (!hasAnalyticsConsent()) return;
    const body = JSON.stringify({
      event: String(event || '').slice(0, 80),
      sessionId: sessionId(),
      meta: meta && typeof meta === 'object' ? meta : {}
    });

    try {
      if (navigator.sendBeacon) {
        const blob = new Blob([body], { type: 'application/json' });
        navigator.sendBeacon('/api/event', blob);
        return;
      }
    } catch (e) {}

    try {
      fetch('/api/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
        keepalive: true
      }).catch(function () {});
    } catch (e) {}
  }

  function getAnswers() {
    try {
      const raw = localStorage.getItem('projectx_answers_v2');
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }

  function applyVariant(variant, source) {
    const heroTitle = document.querySelector('.hero h1');
    const heroCopy = document.querySelector('.hero p');
    const hero = document.querySelector('.hero');
    if (!heroTitle) return;

    const variants = {
      A: {
        title: 'Dimmi dove stai <span class="grad">perdendo tempo.</span> Ti dico da dove partire.',
        copy: 'Descrivi il problema in parole normali. PROJECT-X trasforma il collo di bottiglia in una configurazione software, un piano di automazione e un prossimo passo concreto.'
      },
      B: {
        title: 'Meno <span class="grad">lavoro manuale.</span> Più sistema.',
        copy: 'Parti dal problema reale, non dal nome di un\'app. PROJECT-X collega esigenze, processi, automazioni e software in un unico percorso.'
      },
      C: {
        title: 'Descrivi il problema. <span class="grad">PROJECT-X costruisce il sistema.</span>',
        copy: 'Analisi, automazioni, software e prossimo passo: una direzione chiara prima di spendere tempo o denaro.'
      }
    };

    const chosen = variants[variant] || variants.A;
    const wowMode = !!(hero && hero.dataset && hero.dataset.pxWow === '1');

    if (!wowMode) {
      heroTitle.innerHTML = chosen.title;
    } else {
      heroTitle.innerHTML = 'Non cercare il software giusto.<br><span class="grad">Fatti costruire il sistema.</span>';
    }

    if (heroCopy) heroCopy.textContent = chosen.copy;

    try { localStorage.setItem(VARIANT_KEY, variant); } catch (e) {}
    send('experiment_variant', { variant, source, surface: wowMode ? 'wow-subcopy' : 'hero-title' });
  }

  async function loadVariant() {
    let localVariant = '';
    try { localVariant = localStorage.getItem(VARIANT_KEY) || ''; } catch (e) {}

    if (!hasAnalyticsConsent()) {
      applyVariant(localVariant || 'A', 'privacy-default');
      return;
    }

    try {
      const response = await fetch('/api/autopilot?mode=variant', { cache: 'no-store' });
      if (response.ok) {
        const data = await response.json();
        if (data && data.variant) {
          applyVariant(String(data.variant), String(data.source || 'api'));
          return;
        }
      }
    } catch (e) {}

    applyVariant(localVariant || 'A', localVariant ? 'local' : 'fallback');
  }

  function ensureStartTime() {
    try {
      if (!localStorage.getItem(START_KEY)) {
        localStorage.setItem(START_KEY, String(Date.now()));
      }
    } catch (e) {}
  }

  function trackBasicEvents() {
    if (trackingStarted || !hasAnalyticsConsent()) return;
    trackingStarted = true;
    ensureStartTime();
    send('page_view', {
      path: location.pathname,
      source: new URLSearchParams(location.search).get('source') || 'direct'
    });

    let fired50 = false;
    window.addEventListener('scroll', function () {
      const doc = document.documentElement;
      const max = Math.max(1, doc.scrollHeight - window.innerHeight);
      const progress = window.scrollY / max;
      if (!fired50 && progress >= 0.5) {
        fired50 = true;
        send('scroll_50', { path: location.pathname });
      }
    }, { passive: true });

    setTimeout(function () {
      send('engaged_30s', { path: location.pathname });
    }, 30000);
  }

  function trackClicks() {
    if (trackingStarted && document.documentElement.dataset.pxClicksTracked === '1') return;
    document.documentElement.dataset.pxClicksTracked = '1';
    document.addEventListener('click', function (event) {
      const target = event.target && event.target.closest ? event.target.closest('a,button') : null;
      if (!target) return;

      const text = (target.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 120);
      const href = target.getAttribute('href') || '';
      const idValue = target.id || '';

      if (idValue === 'primaryLink') {
        send('affiliate_cta_click', { href, text });
        return;
      }

      if (/report-pro/i.test(href) || /report pro/i.test(text)) {
        send('report_pro_click', { href, text });
        return;
      }

      if (/implementation|implementazione/i.test(text + ' ' + href)) {
        send('implementation_click', { href, text });
        return;
      }

      if (/coach/i.test(href) || /coach/i.test(text)) {
        send('coach_click', { href, text });
        return;
      }

      if (/analizza|analisi|costruisci il mio sistema/i.test(text)) {
        send('analysis_cta_click', { text });
      }
    }, { passive: true });
  }

  function addGrowthOffer() {
    const results = document.getElementById('results');
    if (!results || results.style.display === 'none') return;
    if (document.getElementById('px-autopilot-offer')) return;

    const answers = getAnswers();
    const budget = String(answers.budget || '').toLowerCase();
    const highIntent = /101|251|51|31/.test(budget) || /azienda|agenzia|ecommerce/i.test(String(answers.businessType || ''));

    const box = document.createElement('section');
    box.id = 'px-autopilot-offer';
    box.style.cssText = 'margin-top:15px;padding:22px;border:1px solid rgba(124,92,255,.28);border-radius:22px;background:linear-gradient(135deg,rgba(124,92,255,.12),rgba(91,140,255,.06));box-shadow:0 18px 55px rgba(0,0,0,.16);';
    box.innerHTML = [
      '<div style="font-size:10px;font-weight:900;letter-spacing:.14em;color:#c8beff;">PROJECT-X AUTOPILOT</div>',
      '<h3 style="margin:8px 0 7px;font-size:21px;">Ora facciamo il passo che produce valore.</h3>',
      '<p style="margin:0;color:#98a5bc;font-size:12px;line-height:1.55;">',
      highIntent
        ? 'Hai già un problema abbastanza concreto da trasformarlo in un blueprint operativo. Puoi passare dal risultato al Report PRO oppure parlare con Coach.'
        : 'Parti dal risultato, conserva la direzione e approfondisci solo ciò che serve. Nessuna app casuale: prima il processo, poi lo strumento.',
      '</p>',
      '<div style="display:flex;gap:9px;flex-wrap:wrap;margin-top:14px;">',
      '<a href="/report-pro.html" data-px-offer="pro" style="display:inline-flex;align-items:center;justify-content:center;padding:11px 14px;border-radius:11px;text-decoration:none;color:#fff;font-weight:900;background:linear-gradient(135deg,#7c5cff,#5b8cff);">Report PRO →</a>',
      '<a href="/coach.html" data-px-offer="coach" style="display:inline-flex;align-items:center;justify-content:center;padding:11px 14px;border-radius:11px;text-decoration:none;color:#fff;font-weight:900;border:1px solid rgba(255,255,255,.10);background:rgba(255,255,255,.04);">Parla con Coach →</a>',
      '</div>'
    ].join('');

    const hero = results.querySelector('.resulthero');
    if (hero && hero.parentNode) hero.parentNode.insertBefore(box, hero.nextSibling);
    else results.insertBefore(box, results.firstChild);

    send('autopilot_offer_view', { highIntent });
  }

  function observeResults() {
    const observer = new MutationObserver(function () {
      addGrowthOffer();
    });
    observer.observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ['style'] });
    addGrowthOffer();
  }

  function renderPrivacyBanner(force) {
    if (!force && getConsent()) return;
    if (document.getElementById('px-privacy-banner')) return;

    const style = document.createElement('style');
    style.id = 'px-privacy-style';
    style.textContent = '#px-privacy-banner{position:fixed;left:14px;right:14px;bottom:14px;z-index:10050;display:flex;align-items:center;justify-content:space-between;gap:16px;padding:14px 16px;border:1px solid rgba(255,255,255,.10);border-radius:16px;background:rgba(9,13,24,.97);backdrop-filter:blur(20px);box-shadow:0 24px 80px rgba(0,0,0,.45);color:#fff;font-family:Inter,system-ui,-apple-system,"Segoe UI",sans-serif}#px-privacy-banner .copy{font-size:9px;line-height:1.5;color:#8996aa;max-width:720px}#px-privacy-banner .copy strong{color:#e8edf6}#px-privacy-banner .links{margin-top:4px}#px-privacy-banner a{color:#b9adff;text-decoration:none}#px-privacy-banner .actions{display:flex;gap:7px;flex-wrap:wrap;justify-content:flex-end}.px-privacy-btn{border:1px solid rgba(255,255,255,.10);border-radius:10px;padding:9px 11px;background:rgba(255,255,255,.04);color:#dfe5ef;font-size:9px;font-weight:900;cursor:pointer}.px-privacy-btn.primary{border-color:rgba(124,92,255,.35);background:linear-gradient(135deg,#7c5cff,#5b8cff);color:#fff}.px-privacy-manage{position:fixed;left:12px;bottom:12px;z-index:10049;padding:7px 9px;border:1px solid rgba(255,255,255,.07);border-radius:999px;background:rgba(9,13,24,.82);color:#718097;font:800 8px Inter,system-ui,sans-serif;cursor:pointer;display:none}.px-privacy-manage.show{display:block}@media(max-width:700px){#px-privacy-banner{display:block}#px-privacy-banner .actions{margin-top:10px;justify-content:flex-start}}';
    document.head.appendChild(style);

    const banner = document.createElement('div');
    banner.id = 'px-privacy-banner';
    banner.innerHTML = '<div class="copy"><strong>Privacy e statistiche</strong><br>PROJECT-X funziona anche senza statistiche comportamentali. Con il consenso alle statistiche possiamo misurare utilizzo e migliorare l’esperienza. Le tue risposte restano nel browser salvo quando scegli di inviare un contatto.<div class="links"><a href="/privacy.html">Leggi la Privacy</a></div></div><div class="actions"><button type="button" class="px-privacy-btn" data-consent="essential">Solo necessario</button><button type="button" class="px-privacy-btn primary" data-consent="analytics">Accetta statistiche</button></div>';
    document.body.appendChild(banner);

    banner.querySelectorAll('[data-consent]').forEach(function(button){
      button.addEventListener('click',function(){
        const choice=button.getAttribute('data-consent')==='analytics'?'analytics':'essential';
        try{localStorage.setItem(CONSENT_KEY,choice)}catch(e){}
        banner.remove();
        const manage=document.getElementById('px-privacy-manage');
        if(manage)manage.classList.add('show');
        if(choice==='analytics'){
          trackBasicEvents();
          trackClicks();
          loadVariant();
        }
      });
    });
  }

  function renderPrivacyManager() {
    if (document.getElementById('px-privacy-manage')) return;
    const button=document.createElement('button');
    button.id='px-privacy-manage';
    button.className='px-privacy-manage';
    button.type='button';
    button.textContent='Privacy';
    button.addEventListener('click',function(){
      const banner=document.getElementById('px-privacy-banner');
      if(banner)banner.remove();
      renderPrivacyBanner(true);
    });
    document.body.appendChild(button);
    if(getConsent())button.classList.add('show');
  }

  function start() {
    renderPrivacyManager();
    if (!getConsent()) {
      renderPrivacyBanner(false);
    } else {
      trackBasicEvents();
      trackClicks();
      loadVariant();
    }
    observeResults();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();

  window.ProjectXAutopilot = {
    track: send,
    getSessionId: sessionId
  };
})();
