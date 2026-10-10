// Static pages and contact links work without JavaScript.
// Keep old shared language/anchor links usable, including the isolated preview.
(() => {
  const script = document.currentScript;
  const root = new URL('../../', script.src);
  const url = new URL(window.location.href);
  const paths = { en: '', ru: 'ru/', es: 'es/', zh: 'zh/' };
  const anchors = { '#hero': '#top', '#apply': '#contact', '#community': '#contact', '#pillars': '#work', '#track-record': '#work', '#testimonials': '#work' };
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

  // A click is an intent to contact, never proof of a submitted or qualified lead.
  document.addEventListener('click', event => {
    const link = event.target.closest?.('a[href]');
    if (!link) return;
    const href = link.getAttribute('href');
    const channel = href.startsWith('mailto:') ? 'email' : href.startsWith('https://t.me/timothyivaikin') ? 'telegram' : null;
    if (!channel) return;
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'contact_click', {
        channel,
        page_language: document.documentElement.lang,
        section: link.closest('section')?.id || 'other',
      });
    }
  });
})();
