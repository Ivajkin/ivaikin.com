// Static pages and contact links work without JavaScript.
// Keep old shared language/anchor links usable, including the isolated preview.
(() => {
  const script = document.currentScript;
  const root = new URL('../../', script.src);
  const url = new URL(window.location.href);
  const paths = { en: '', ru: 'ru/', es: 'es/', zh: 'zh/' };
  const anchors = { '#hero': '#top', '#apply': '#contact', '#community': '#contact', '#pillars': '#work', '#track-record': '#work' };
  const language = url.searchParams.get('lang');
  let changed = false;
  if (Object.hasOwn(paths, language)) {
    url.pathname = root.pathname + paths[language];
    url.searchParams.delete('lang');
    changed = true;
  }
  if (Object.hasOwn(anchors, url.hash)) {
    url.hash = anchors[url.hash];
    changed = true;
  }
  if (changed && url.href !== window.location.href) window.location.replace(url.href);

  const copyButton = document.querySelector('[data-copy-brief]');
  const briefTemplate = document.querySelector('#project-brief-template');
  const copyStatus = document.querySelector('#brief-copy-status');
  if (copyButton && briefTemplate && copyStatus) {
    copyButton.hidden = false;
    copyButton.addEventListener('click', async () => {
      copyButton.disabled = true;
      copyStatus.textContent = '';
      try {
        if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
        await navigator.clipboard.writeText(briefTemplate.value);
        copyStatus.textContent = copyButton.dataset.success;
      } catch {
        briefTemplate.focus();
        briefTemplate.select();
        copyStatus.textContent = copyButton.dataset.error;
      } finally {
        copyButton.disabled = false;
      }
    });
  }

  // E1: GA4 events for contact actions (see docs/analytics-events.md). Guarded: nothing happens without gtag.
  // Parameters are site-owned labels only, never URLs, mail subjects or visitor input.
  const ctaEvent = href => {
    let target;
    try { target = new URL(href, window.location.href); } catch { return ''; }
    const host = target.hostname.toLowerCase().replace(/^www\./, '');
    const first = target.pathname.toLowerCase().split('/')[1] || '';
    if (target.protocol === 'mailto:') return 'cta_email';
    if (target.protocol !== 'http:' && target.protocol !== 'https:') return '';
    if (host === 'calendar.app.google') return 'cta_calendar';
    if (host === 'wa.me' || host === 'api.whatsapp.com' || host === 'whatsapp.com') return 'cta_whatsapp';
    if (host === 'linkedin.com' || host.endsWith('.linkedin.com')) return 'cta_linkedin';
    if (host === 't.me' || host === 'telegram.me') {
      if (first === 'timothy_ivaikin_ru' || first === 'joinchat' || first.startsWith('+') || href.includes('t.me/+')) return 'cta_channel';
      return first.endsWith('bot') ? 'cta_bot' : 'cta_telegram';
    }
    return /\.pdf$/.test(target.pathname.toLowerCase()) ? 'pdf_download' : '';
  };
  const sendCta = (name, element) => {
    try {
      if (typeof window.gtag !== 'function') return;
      window.gtag('event', name, {
        page_language: document.documentElement.lang,
        section: element?.closest?.('section')?.id || 'other',
      });
    } catch {}
  };
  // A click is an intent to contact, never proof of a submitted or qualified lead.
  document.addEventListener('click', event => {
    const link = event.target.closest?.('a[href]');
    if (!link) return;
    const href = link.getAttribute('href');
    const ctaName = ctaEvent(href);
    if (ctaName) sendCta(ctaName, link);
    const channel = href.startsWith('mailto:') ? 'email' : href.startsWith('https://t.me/timothyivaikin') ? 'telegram' : null;
    if (!channel) return;
    // Only explicit site-owned labels are collected; never derive intent from
    // a mail subject, message body, URL query, or other visitor-supplied content.
    const selectedIntent = link.getAttribute('data-contact-intent');
    const intent = ['project', 'partnership', 'media'].includes(selectedIntent) ? selectedIntent : 'general';
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'contact_click', {
        channel,
        page_language: document.documentElement.lang,
        section: link.closest('section')?.id || 'other',
        intent,
      });
    }
  });

  // The browser fires "submit" only after native validation passes.
  document.addEventListener('submit', event => {
    if (event.target?.tagName === 'FORM') sendCta('form_submit', event.target);
  }, true);

  // S2: Hunt ladder funnel (see docs/analytics-funnel-hunt.md). Non-blocking GA4 events, no markup or design change.
  // ladder_1_landing, ladder_2_problem, ladder_3_solution, ladder_4_proof, ladder_5_offer, ladder_6_intent,
  // ladder_7_conversion and ladder_aux_* helpers. Each event fires once per visit (30 minute window in sessionStorage,
  // memory only if storage is blocked). Safe without gtag or IntersectionObserver. Parameters are site-owned labels only.
  if (changed) return;
  const ladder = (() => {
    const STORE_KEY = 'ivaikin_ladder_v1';
    const VISIT_MS = 30 * 60 * 1000;
    const DWELL_MS = 500;
    const sectionMap = {
      ladder_2_problem: ['#work'],
      ladder_3_solution: ['section[aria-labelledby="approach-title"]', '#ideas'],
      ladder_4_proof: ['#testimonials'],
      ladder_5_offer: ['section[aria-labelledby="faq-title"]'],
      ladder_aux_contact_view: ['#contact'],
    };
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
      try {
        window.sessionStorage.setItem(STORE_KEY, JSON.stringify({ ...(readStore() || {}), [id]: t }));
      } catch {}
    };
    // Coarse entry category only. Never URLs, queries or visitor input.
    const entryCategory = () => {
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
    const send = (id, extra) => {
      if (seen(id)) return false;
      remember(id);
      try {
        if (typeof window.gtag !== 'function') return true;
        window.gtag('event', id, { page_language: document.documentElement.lang || 'und', ...extra });
      } catch {}
      return true;
    };
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
    const intent = trigger => send('ladder_6_intent', { trigger });
    // A direct contact action always counts as intent first, so the funnel stays nested.
    const conversion = channel => { intent(channel); send('ladder_7_conversion', { channel }); };
    return { send, intent, conversion, channelFor, entryCategory, sectionMap, DWELL_MS };
  })();

  // Each part is guarded on its own, so a missing browser feature never disables the others.
  const guarded = setup => { try { setup(); } catch {} };
  guarded(() => ladder.send('ladder_1_landing', { entry: ladder.entryCategory(), landing: window.location.pathname }));

  guarded(() => {
    if (typeof window.IntersectionObserver === 'function') {
      const targets = [];
      const observer = new window.IntersectionObserver(entries => {
        for (const entry of entries) {
          const item = targets.find(target => target.el === entry.target);
          if (!item) continue;
          if (entry.isIntersecting) {
            if (item.timer) continue;
            // A section counts only after it stays in view for a moment, so fast scrolling does not count.
            item.timer = window.setTimeout(() => {
              item.timer = 0;
              ladder.send(item.id, { section: item.el.id || item.el.getAttribute('aria-labelledby') || 'section' });
              try { observer.unobserve(item.el); } catch {}
            }, ladder.DWELL_MS);
          } else if (item.timer) {
            window.clearTimeout(item.timer);
            item.timer = 0;
          }
        }
      }, { rootMargin: '0px 0px -30% 0px', threshold: 0 });
      for (const [id, selectors] of Object.entries(ladder.sectionMap)) {
        for (const selector of selectors) {
          const el = document.querySelector(selector);
          if (!el || targets.some(target => target.el === el)) continue;
          targets.push({ el, id, timer: 0 });
          observer.observe(el);
        }
      }
    }
  });

  guarded(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        ticking = false;
        const total = document.documentElement.scrollHeight || 0;
        if (!total) return;
        const pct = ((window.scrollY || 0) + (window.innerHeight || 0)) / total;
        if (pct >= 0.5) ladder.send('ladder_aux_scroll_50');
        if (pct >= 0.9) {
          ladder.send('ladder_aux_scroll_90');
          window.removeEventListener('scroll', onScroll);
        }
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
  });

  // Counts only seconds while the tab is visible.
  guarded(() => {
    let visibleSeconds = 0;
    const timer = window.setInterval(() => {
      if (document.visibilityState === 'hidden') return;
      visibleSeconds += 1;
      if (visibleSeconds >= 30) {
        window.clearInterval(timer);
        ladder.send('ladder_aux_time_30s');
      }
    }, 1000);
  });

  guarded(() => {
    document.addEventListener('click', event => {
      try {
        const link = event.target.closest?.('a[href]');
        if (link) {
          const href = link.getAttribute('href') || '';
          const channel = ladder.channelFor(href);
          if (channel) ladder.conversion(channel);
          else if (href === '#contact') ladder.intent('anchor');
          return;
        }
        if (event.target.closest?.('[data-copy-brief]')) ladder.intent('copy_brief');
      } catch {}
    });
    document.addEventListener('submit', event => {
      try { if (event.target?.tagName === 'FORM') ladder.conversion('form'); } catch {}
    }, true);
  });
})();
