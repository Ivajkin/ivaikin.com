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
