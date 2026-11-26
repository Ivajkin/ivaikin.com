import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import vm from 'node:vm';
import { createHash } from 'node:crypto';

const read = p => readFileSync(new URL('../' + p, import.meta.url), 'utf8');
const STEPS = [1, 2, 3, 4, 5, 6, 7];
const pagePath = (lang, n) => (lang === 'ru' ? `ru/ladder/${n}/index.html` : `ladder/${n}/index.html`);
const hrefOf = (lang, n) => (lang === 'ru' ? `/ru/ladder/${n}/` : `/ladder/${n}/`);

function browser(step, { href = `https://ivaikin.com/ladder/${step}/`, lang = 'en', referrer = '', gtag = true, io = true, sessionThrows = false } = {}) {
  const events = [], listeners = {}, timers = [], observers = [], store = {};
  const stage = { id: `step-${step}` };
  const contact = { id: 'contact' };
  const els = { '[data-ladder-stage]': stage, '#contact': contact };
  const url = new URL(href);
  const document = {
    body: { getAttribute: n => (n === 'data-funnel-step' ? String(step) : null) },
    documentElement: { lang, scrollHeight: 4000 },
    referrer, visibilityState: 'visible',
    querySelector: s => els[s] ?? null,
    addEventListener: (name, fn) => (listeners[name] ??= []).push(fn),
  };
  class IO { constructor(cb) { this.cb = cb; observers.push(this); } observe() {} unobserve() {} }
  const window = {
    location: { href, hostname: url.hostname, pathname: url.pathname, search: url.search },
    sessionStorage: {
      getItem: k => { if (sessionThrows) throw new Error('blocked'); return store[k] ?? null; },
      setItem: (k, v) => { if (sessionThrows) throw new Error('blocked'); store[k] = v; },
    },
    setTimeout: (fn, ms) => { timers.push({ fn, ms, live: true }); return timers.length; },
    clearTimeout: id => { if (timers[id - 1]) timers[id - 1].live = false; },
    setInterval: fn => { timers.push({ fn, every: true, live: true }); return timers.length; },
    clearInterval: id => { if (timers[id - 1]) timers[id - 1].live = false; },
    addEventListener: (name, fn) => (listeners['w:' + name] ??= []).push(fn),
    removeEventListener: () => {},
    requestAnimationFrame: fn => fn(),
    innerHeight: 800, scrollY: 0,
  };
  if (gtag) window.gtag = (...args) => events.push(JSON.parse(JSON.stringify(args)));
  if (io) window.IntersectionObserver = IO;
  vm.runInNewContext(read('assets/front/funnel.js'), { window, document, URL });
  return {
    window, store, events,
    names: () => events.map(e => e[1]),
    fire: (name, e) => (listeners[name] ?? []).forEach(fn => fn(e)),
    fireWin: name => (listeners['w:' + name] ?? []).forEach(fn => fn()),
    see(el) {
      observers.find(o => o).cb([{ target: els[el], isIntersecting: true }]);
      timers.filter(t => t.live && !t.every && t.ms === 500).forEach(t => { t.live = false; t.fn(); });
    },
  };
}
const click = (href, attrs = {}) => ({ target: { closest: s => (s.startsWith('a') ? { getAttribute: () => href, hasAttribute: n => n in attrs, closest: () => ({ id: 'contact' }) } : null) } });

test('funnel pages: 7 steps in EN and RU, noindex, canonical, GA4 loaded before the script, next and contact links', () => {
  for (const lang of ['en', 'ru']) for (const n of STEPS) {
    const path = pagePath(lang, n);
    assert.ok(existsSync(new URL('../' + path, import.meta.url)), path);
    const html = read(path);
    assert.match(html, [1, 4].includes(n) ? /<meta name="robots" content="index,follow">/ : /<meta name="robots" content="noindex">/, path);
    assert.ok(html.includes(`<link rel="canonical" href="https://ivaikin.com${hrefOf(lang, n)}">`), path);
    assert.ok(html.includes(`data-funnel-step="${n}"`) && html.includes('data-ladder-stage'), path);
    const g = html.indexOf("gtag('config', 'G-2Z5VJ13B20'");
    const s = html.indexOf('/assets/front/funnel.js?v=');
    assert.ok(g > 0 && s > g, `${path}: gtag must be defined before funnel.js`);
    assert.ok(html.includes('function gtag(){dataLayer.push(arguments);}'), path);
    assert.ok(!html.includes('/assets/front/home.js'), `${path} must not load the homepage runtime`);
    if (n < 7) {
      assert.ok(html.includes(`class="button primary" href="${hrefOf(lang, n + 1)}"`), `${path} next`);
      assert.ok(html.includes(`href="${hrefOf(lang, 7)}" data-ladder-contact`), `${path} contact`);
    } else {
      for (const needle of ['https://t.me/timothyivaikin', 'mailto:hello@edgeivaikin.com', 'data-contact-intent="project"']) assert.ok(html.includes(needle), `${path} ${needle}`);
    }
  }
});

test('funnel script reference carries the current content hash', () => {
  const html = read('ladder/1/index.html');
  const m = html.match(/funnel\.js\?v=([a-f0-9]{12})/);
  assert.ok(m);
  // build-funnel.mjs hashes the file; a stale hash means the build was not rerun
  assert.equal(createHash('sha256').update(readFileSync(new URL('../assets/front/funnel.js', import.meta.url))).digest('hex').slice(0, 12), m[1]);
});

test('funnel pages are not in the sitemap or robots.txt and are not linked from the existing homepages', () => {
  { const sm = read('sitemap.xml'); for (const n of STEPS) for (const u of [`/ladder/${n}/`, `/ru/ladder/${n}/`]) assert.equal(sm.includes('<loc>https://ivaikin.com' + u + '</loc>'), [1, 4].includes(n), u); }
  assert.ok(!read('robots.txt').includes('ladder'));
  for (const f of ['index.html', 'ru/index.html', 'es/index.html', 'zh/index.html']) assert.ok(!read(f).includes('/ladder/'), f);
});

test('funnel copy: no NDA names, no hype, no forbidden terms', () => {
  const banned = /(Прогресс|SFIT|ROI|Sovereign|суверенн|Dubai|Дубай|Дубае|DMCC|guarantee|гарант|[ёЁ])/i;
  for (const lang of ['en', 'ru']) for (const n of STEPS) {
    const text = read(pagePath(lang, n)).replace(/<script[\s\S]*?<\/script>/g, '').replace(/<[^>]+>/g, ' ');
    const m = text.match(banned);
    assert.ok(!m, `${lang}/${n}: ${m && m[0]}`);
  }
});

test('funnel events: order, entry=funnel_page, funnel_step, each once', () => {
  const b = browser(3, { referrer: 'https://www.linkedin.com/feed/' });
  assert.deepEqual(b.events[0], ['event', 'ladder_1_landing', { page_language: 'en', entry: 'funnel_page', funnel_step: 3, source: 'social', landing: '/ladder/3/' }]);
  b.see('[data-ladder-stage]');
  assert.deepEqual(b.names(), ['ladder_1_landing', 'ladder_3_solution']);
  assert.deepEqual(b.events[1][2], { page_language: 'en', entry: 'funnel_page', funnel_step: 3, section: 'step-3' });
  b.see('[data-ladder-stage]');
  assert.equal(b.names().length, 2);
});

test('funnel events: steps 2, 4, 5 own stage; step 6 intent on page view', () => {
  for (const [step, id] of [[2, 'ladder_2_problem'], [4, 'ladder_4_proof'], [5, 'ladder_5_offer']]) {
    const b = browser(step);
    b.see('[data-ladder-stage]');
    assert.deepEqual(b.names(), ['ladder_1_landing', id]);
  }
  const b = browser(6);
  b.see('[data-ladder-stage]');
  assert.deepEqual(b.names(), ['ladder_1_landing', 'ladder_6_intent']);
  assert.equal(b.events[1][2].trigger, 'step_page');
});

test('funnel events: contact step is intent; contact click sends cta_* then intent then conversion', () => {
  const b = browser(2);
  b.fire('click', click('/ladder/3/'));
  b.fire('click', click('https://www.linkedin.com/in/timothyivaikin'));
  assert.deepEqual(b.names(), ['ladder_1_landing']);
  b.fire('click', click('/ladder/7/', { 'data-ladder-contact': '' }));
  assert.deepEqual(b.names(), ['ladder_1_landing', 'ladder_6_intent']);
  b.fire('click', click('https://t.me/timothyivaikin'));
  assert.deepEqual(b.names(), ['ladder_1_landing', 'ladder_6_intent', 'cta_telegram', 'ladder_7_conversion']);
  assert.deepEqual(b.events.at(-2)[2], { page_language: 'en', entry: 'funnel_page', funnel_step: 2, section: 'contact' });
  assert.equal(b.events.at(-1)[2].channel, 'telegram');
  b.fire('click', click('mailto:hello@edgeivaikin.com'));
  assert.ok(b.names().includes('cta_email'));
  assert.equal(b.names().filter(n => n === 'ladder_7_conversion').length, 1);
});

test('funnel events: step 7 contact view and scroll helpers', () => {
  const b = browser(7);
  b.see('#contact');
  assert.deepEqual(b.names(), ['ladder_1_landing', 'ladder_aux_contact_view']);
  b.window.scrollY = 3300;
  b.fireWin('scroll');
  assert.ok(b.names().includes('ladder_aux_scroll_50') && b.names().includes('ladder_aux_scroll_90'));
});

test('funnel script is safe without gtag, storage or IntersectionObserver; own storage key', () => {
  const b = browser(1, { gtag: false, sessionThrows: true, io: false });
  b.fire('click', click('https://t.me/timothyivaikin'));
  assert.deepEqual(b.events, []);
  const ok = browser(1);
  assert.ok(Object.keys(ok.store).every(k => k === 'ivaikin_ladder_funnel_v1'));
});

test('funnel link classes stay identical to the homepage ladder in home.js', () => {
  const pick = s => s.slice(s.indexOf('const channelFor'), s.indexOf('};', s.indexOf('const channelFor'))).replace(/\s+/g, ' ');
  assert.equal(pick(read('assets/front/funnel.js')), pick(read('assets/front/home.js')));
});
