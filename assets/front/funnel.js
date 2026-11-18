// Hunt ladder funnel PAGES for ivaikin.com (/ladder/N/ and /ru/ladder/N/, N = 1..7). GA4 (G-2Z5VJ13B20) through gtag.
// Same event ids as the homepage ladder in home.js (ladder_1_landing ... ladder_7_conversion, ladder_aux_*) plus the
// cta_* contact events, but every event of these pages carries entry = "funnel_page" and funnel_step = N, so funnel-page
// visitors are separable from existing-page traffic. Own sessionStorage key. gtag is defined in the page head (inline);
// every call is guarded, nothing happens without gtag, storage or IntersectionObserver.
// Page N reports its own stage: 2 problem, 3 solution, 4 proof, 5 offer (block seen for 0.5 s), 6 intent (page seen for
// 0.5 s, or a click to the contact step), 7 conversion (direct contact action).
// Rollback: delete /ladder/ and /ru/ladder/ (revert the funnel-pages merge). Nothing else depends on this file.
(() => {
  const STORE_KEY = 'ivaikin_ladder_funnel_v1';
  const VISIT_MS = 30 * 60 * 1000;
  const DWELL_MS = 500;
  const ENTRY = 'funnel_page';
  const STAGES = { 2: 'ladder_2_problem', 3: 'ladder_3_solution', 4: 'ladder_4_proof', 5: 'ladder_5_offer', 6: 'ladder_6_intent' };
  const step = Number.parseInt(document.body?.getAttribute('data-funnel-step') || '0', 10) || 0;
  const fired = {};

  const readStore = () => {
    try {
      const data = JSON.parse(window.sessionStorage.getItem(STORE_KEY) || '{}');
      return data && typeof data === 'object' ? data : {};
    } catch { return null; }
  };
  const seen = id => {
    const t = Date.now();
    if (fired[id] && t - fired[id] < VISIT_MS) return true;
    const data = readStore();
    return Boolean(data && data[id] && t - data[id] < VISIT_MS);
  };
  const remember = id => {
    const t = Date.now();
    fired[id] = t;
    try { window.sessionStorage.setItem(STORE_KEY, JSON.stringify({ ...(readStore() || {}), [id]: t })); } catch {}
  };
  // Coarse traffic source only. Never URLs, queries or visitor input.
  const sourceCategory = () => {
    try {
      const search = window.location.search || '';
      if (/[?&]utm_(medium|source|campaign)=/.test(search)) return /[?&]utm_medium=(cpc|ppc|paid|paidsocial|cpm)(&|$)/.test(search) ? 'paid' : 'campaign';
      const ref = document.referrer || '';
      if (!ref) return 'direct';
      const host = new URL(ref).hostname.toLowerCase().replace(/^www\./, '');
      if (host === window.location.hostname.toLowerCase().replace(/^www\./, '')) return 'internal';
      if (/(^|\.)(google|bing|yandex|duckduckgo|ya|baidu|yahoo)\./.test(host)) return 'search';
      if (/(^|\.)(t\.me|telegram\.org|wa\.me|whatsapp\.com)$/.test(host)) return 'messenger';
      if (/(^|\.)(linkedin\.com|facebook\.com|instagram\.com|vk\.com|x\.com|twitter\.com|youtube\.com|habr\.com|dzen\.ru)$/.test(host)) return 'social';
      return 'referral';
    } catch { return 'unknown'; }
  };
  const emit = (name, extra) => {
    try {
      if (typeof window.gtag !== 'function') return;
      window.gtag('event', name, { page_language: document.documentElement.lang || 'und', entry: ENTRY, funnel_step: step, ...extra });
    } catch {}
  };
  const send = (id, extra) => {
    if (seen(id)) return false;
    remember(id);
    emit(id, extra);
    return true;
  };
  // Same classes as the homepage ladder (a test keeps them identical).
  const channelFor = href => {
    let target;
    try { target = new URL(href, window.location.href); } catch { return ''; }
    const host = target.hostname.toLowerCase().replace(/^www\./, '');
    const first = target.pathname.toLowerCase().split('/')[1] || '';
    if (target.protocol === 'mailto:') return 'email';
    if (target.protocol === 'tel:') return 'phone';
    if (target.protocol !== 'http:' && target.protocol !== 'https:') return '';
    if (host === 'calendar.app.google') return 'calendar';
    if (host === 'wa.me' || host === 'api.whatsapp.com' || host === 'whatsapp.com') return 'whatsapp';
    if (host === 't.me' || host === 'telegram.me') {
      if (first === 'timothy_ivaikin_ru' || first === 'joinchat' || first.startsWith('+') || href.includes('t.me/+')) return '';
      return first.endsWith('bot') ? 'bot' : 'telegram';
    }
    return '';
  };
  const ctaName = channel => ({ email: 'cta_email', telegram: 'cta_telegram', bot: 'cta_bot', calendar: 'cta_calendar', whatsapp: 'cta_whatsapp' })[channel] || '';
  const intent = trigger => send('ladder_6_intent', { trigger });
  // A direct contact action always counts as intent first, so the funnel stays nested.
  const conversion = channel => { intent(channel); send('ladder_7_conversion', { channel }); };

  const watch = (el, onSeen) => {
    if (!el || typeof window.IntersectionObserver !== 'function') return;
    let timer = 0;
    const observer = new window.IntersectionObserver(entries => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          if (timer) continue;
          // A block counts only after it stays in view for a moment, so fast scrolling does not count.
          timer = window.setTimeout(() => { timer = 0; onSeen(); try { observer.unobserve(el); } catch {} }, DWELL_MS);
        } else if (timer) {
          window.clearTimeout(timer);
          timer = 0;
        }
      }
    }, { rootMargin: '0px 0px -30% 0px', threshold: 0 });
    observer.observe(el);
  };
  const guarded = setup => { try { setup(); } catch {} };

  // First funnel page of the visit, whichever step it is. funnel_step tells where the visitor came in.
  guarded(() => send('ladder_1_landing', { source: sourceCategory(), landing: window.location.pathname }));

  guarded(() => {
    const id = STAGES[step];
    const el = document.querySelector('[data-ladder-stage]');
    if (id && el) watch(el, () => (id === 'ladder_6_intent' ? intent('step_page') : send(id, { section: el.id || 'section' })));
    const contact = document.querySelector('#contact');
    if (step === 7 && contact) watch(contact, () => send('ladder_aux_contact_view', { section: 'contact' }));
  });

  guarded(() => {
    let ticking = false;
    const check = () => {
      ticking = false;
      const total = document.documentElement.scrollHeight || 0;
      if (!total) return;
      const pct = ((window.scrollY || window.pageYOffset || 0) + (window.innerHeight || 0)) / total;
      if (pct >= 0.5) send('ladder_aux_scroll_50');
      if (pct >= 0.9) { send('ladder_aux_scroll_90'); window.removeEventListener('scroll', onScroll); }
    };
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      if (typeof window.requestAnimationFrame === 'function') window.requestAnimationFrame(check); else check();
    };
    window.addEventListener('scroll', onScroll, { passive: true });
  });

  guarded(() => {
    let seconds = 0;
    const timer = window.setInterval(() => {
      if (document.visibilityState === 'hidden') return;
      seconds += 1;
      if (seconds >= 30) { window.clearInterval(timer); send('ladder_aux_time_30s'); }
    }, 1000);
  });

  guarded(() => {
    document.addEventListener('click', event => {
      try {
        const link = event.target?.closest?.('a[href]');
        if (!link) return;
        const href = link.getAttribute('href') || '';
        const channel = channelFor(href);
        if (channel) {
          const cta = ctaName(channel);
          if (cta) emit(cta, { section: link.closest('section')?.id || 'other' });
          conversion(channel);
          return;
        }
        if (link.hasAttribute('data-ladder-contact')) intent('contact_step');
      } catch {}
    });
  });
})();
