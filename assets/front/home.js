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
})();
