/* Timestamp links stay usable on YouTube without JS; enhanced links remain on this watch page. */
(() => {
  'use strict';
  let player = document.getElementById('interview-player');
  const status = document.getElementById('selected-passage');
  if (!player || !status) return;
  const MAX_START = 2853;
  function validStart(value) {
    if (typeof value !== 'string' || !/^\d{1,4}$/.test(value)) return null;
    const n = Number(value);
    return Number.isSafeInteger(n) && n >= 0 && n <= MAX_START ? n : null;
  }
  function showStart(start, scroll) {
    const url = new URL(player.src);
    if (start === 0) url.searchParams.delete('start');
    else url.searchParams.set('start', String(start));
    url.searchParams.delete('autoplay');
    // A fresh iframe avoids adding a nested history entry for each chapter.
    const nextPlayer = player.cloneNode(false);
    nextPlayer.src = url.href;
    player.replaceWith(nextPlayer);
    player = nextPlayer;
    const exactChapter = document.querySelector('.chapter-list [data-start="' + start + '"] span');
    status.textContent = start === 0 ? '' : status.dataset.prefix + (exactChapter ? exactChapter.textContent : Math.floor(start / 60) + ':' + String(start % 60).padStart(2, '0'));
    document.querySelectorAll('.chapter-list [data-start]').forEach(link => {
      if (Number(link.dataset.start) === start) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    });
    if (scroll) document.getElementById('watch').scrollIntoView({block:'start'});
  }
  document.querySelectorAll('a[data-start]').forEach(link => {
    const start = validStart(link.dataset.start);
    if (start === null) return;
    const url = new URL(window.location.href);
    url.search = '';
    url.searchParams.set('t', String(start));
    url.hash = 'watch';
    link.href = url.href;
    link.addEventListener('click', event => {
      if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      window.history.pushState(null, '', url.href);
      showStart(start, true);
    });
  });
  const initialStart = validStart(new URL(window.location.href).searchParams.get('t'));
  if (initialStart !== null) showStart(initialStart, false);
  window.addEventListener('popstate', () => {
    const start = validStart(new URL(window.location.href).searchParams.get('t'));
    showStart(start === null ? 0 : start, false);
  });
})();
