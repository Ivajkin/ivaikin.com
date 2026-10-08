// Language query support for child pages only. Never loaded by the parent homepage.
(() => {
  const url = new URL(window.location.href);
  const language = url.searchParams.get('lang');
  const paths = { en: '/about/', ru: '/ru/about/', es: '/es/about/', zh: '/zh/about/' };
  const anchors = { '#apply': '#contact', '#community': '#contact', '#pillars': '#work', '#track-record': '#work' };
  let changed = false;
  if (Object.hasOwn(paths, language)) {
    url.pathname = paths[language];
    url.searchParams.delete('lang');
    changed = true;
  }
  if (Object.hasOwn(anchors, url.hash)) {
    url.hash = anchors[url.hash];
    changed = true;
  }
  if (changed) window.location.replace(url.href);
})();
