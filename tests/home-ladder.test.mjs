import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const source = () => readFileSync(new URL('../assets/front/home.js', import.meta.url), 'utf8');
const SECTIONS = ['#work', 'section[aria-labelledby="approach-title"]', '#ideas', '#testimonials', 'section[aria-labelledby="faq-title"]', '#contact'];

function browser({ href = 'https://ivaikin.com/ru/', lang = 'ru', referrer = '', gtag = true, io = true, sessionThrows = false, store = {} } = {}) {
  const events = [];
  const listeners = {};
  const timers = [];
  const observers = [];
  const els = Object.fromEntries(SECTIONS.map(s => [s, { id: s.startsWith('#') ? s.slice(1) : '', getAttribute: () => null }]));
  const url = new URL(href);
  const document = {
    currentScript: { src: 'https://ivaikin.com/assets/front/home.js' },
    documentElement: { lang, scrollHeight: 4000 },
    referrer, visibilityState: 'visible',
    querySelector: s => els[s] ?? null,
    addEventListener: (name, fn) => (listeners[name] ??= []).push(fn),
  };
  class IO { constructor(cb) { this.cb = cb; observers.push(this); } observe() {} unobserve() {} }
  const window = {
    location: { href, hostname: url.hostname, pathname: url.pathname, search: url.search, replace: () => {} },
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
  vm.runInNewContext(source(), { window, document, navigator: {}, URL, CustomEvent: class {} });
  return {
    window, document, els, timers, store, events, observers,
    names: () => events.filter(e => e[1].startsWith('ladder_')).map(e => e[1]),
    ladder: () => events.filter(e => e[1].startsWith('ladder_')),
    fire: (name, e) => (listeners[name] ?? []).forEach(fn => fn(e)),
    see(sel) {
      observers[0].cb([{ target: els[sel], isIntersecting: true }]);
      timers.filter(t => t.live && !t.every && t.ms === 500).forEach(t => { t.live = false; t.fn(); });
    },
  };
}
const click = href => ({ target: { closest: s => (s.startsWith('a') ? { getAttribute: () => href, closest: () => ({ id: 'contact' }) } : null) } });

test('ladder: every stage fires in page order with language and entry params, once each', () => {
  const b = browser({ referrer: 'https://www.google.com/' });
  for (const s of ['#work', '#testimonials', 'section[aria-labelledby="approach-title"]', 'section[aria-labelledby="faq-title"]', '#contact']) b.see(s);
  b.fire('click', click('#contact'));
  b.fire('click', click('https://t.me/timothyivaikin'));
  assert.deepEqual(b.names(), ['ladder_1_landing', 'ladder_2_problem', 'ladder_4_proof', 'ladder_3_solution', 'ladder_5_offer', 'ladder_aux_contact_view', 'ladder_6_intent', 'ladder_7_conversion']);
  assert.deepEqual(b.ladder()[0], ['event', 'ladder_1_landing', { page_language: 'ru', entry: 'search', landing: '/ru/' }]);
  assert.deepEqual(b.ladder().at(-1), ['event', 'ladder_7_conversion', { page_language: 'ru', channel: 'telegram' }]);
  b.see('#work');
  b.fire('click', click('mailto:hello@edgeivaikin.com'));
  assert.equal(b.names().length, 8);
});

test('ladder: ideas also count as the approach stage; a quick scroll past a section does not count', () => {
  const b = browser();
  b.see('#ideas');
  assert.deepEqual(b.names(), ['ladder_1_landing', 'ladder_3_solution']);
});

test('ladder: a section that leaves the view before the dwell time does not count', () => {
  const b = browser();
  const observer = b.observers[0];
  observer.cb([{ target: b.els['#testimonials'], isIntersecting: true }]);
  observer.cb([{ target: b.els['#testimonials'], isIntersecting: false }]);
  b.timers.filter(t => t.live && !t.every).forEach(t => t.fn());
  assert.deepEqual(b.names(), ['ladder_1_landing']);
});

test('ladder: a direct contact click implies intent; soft links and anchors are handled', () => {
  const b = browser();
  b.fire('click', click('https://t.me/timothy_ivaikin_ru'));
  b.fire('click', click('https://www.linkedin.com/in/timothyivaikin'));
  b.fire('click', click('/about/'));
  assert.deepEqual(b.names(), ['ladder_1_landing']);
  b.fire('click', click('#contact'));
  assert.deepEqual(b.names(), ['ladder_1_landing', 'ladder_6_intent']);
  assert.equal(b.ladder().at(-1)[2].trigger, 'anchor');
  b.fire('click', click('mailto:hello@edgeivaikin.com?subject=x'));
  assert.deepEqual(b.names(), ['ladder_1_landing', 'ladder_6_intent', 'ladder_7_conversion']);
  assert.equal(b.ladder().at(-1)[2].channel, 'email');
  assert.doesNotMatch(JSON.stringify(b.ladder()), /subject|hello@/);
});

test('ladder: copying the brief is intent', () => {
  const b = browser();
  b.fire('click', { target: { closest: s => (s === '[data-copy-brief]' ? {} : null) } });
  assert.deepEqual(b.names(), ['ladder_1_landing', 'ladder_6_intent']);
  assert.equal(b.ladder().at(-1)[2].trigger, 'copy_brief');
});

test('ladder: scroll and visible time helpers', () => {
  const b = browser();
  b.window.scrollY = 1300;
  b.fire('w:scroll');
  b.window.scrollY = 2900;
  b.fire('w:scroll');
  const tick = b.timers.find(t => t.every);
  for (let i = 0; i < 29; i++) tick.fn();
  b.document.visibilityState = 'hidden';
  tick.fn();
  assert.ok(!b.names().includes('ladder_aux_time_30s'));
  b.document.visibilityState = 'visible';
  tick.fn();
  assert.deepEqual(b.names().slice(1), ['ladder_aux_scroll_50', 'ladder_aux_scroll_90', 'ladder_aux_time_30s']);
});

test('ladder: entry categories carry no URLs; second page of a visit does not repeat the landing; new visit after 30 minutes', () => {
  assert.equal(browser().ladder()[0][2].entry, 'direct');
  assert.equal(browser({ href: 'https://ivaikin.com/?utm_source=tg&utm_medium=cpc' }).ladder()[0][2].entry, 'paid');
  assert.equal(browser({ href: 'https://ivaikin.com/?utm_source=tg' }).ladder()[0][2].entry, 'campaign');
  assert.equal(browser({ referrer: 'https://t.me/x' }).ladder()[0][2].entry, 'messenger');
  assert.equal(browser({ referrer: 'https://ivaikin.com/ru/about/' }).ladder()[0][2].entry, 'internal');
  assert.doesNotMatch(JSON.stringify(browser({ referrer: 'https://example.org/private?x=1' }).ladder()), /private|example/);
  const first = browser();
  const second = browser({ store: { ...first.store } });
  assert.deepEqual(second.names(), []);
  const later = browser({ store: { ivaikin_ladder_v1: JSON.stringify({ ladder_1_landing: Date.now() - 31 * 60 * 1000 }) } });
  assert.deepEqual(later.names(), ['ladder_1_landing']);
});

test('ladder: harmless without gtag, IntersectionObserver or storage; no events on a legacy redirect', () => {
  const b = browser({ gtag: false });
  assert.doesNotThrow(() => b.fire('click', click('mailto:a@b.c')));
  const c = browser({ io: false });
  assert.deepEqual(c.names(), ['ladder_1_landing']);
  const d = browser({ sessionThrows: true });
  d.fire('click', click('mailto:a@b.c'));
  d.fire('click', click('mailto:a@b.c'));
  assert.deepEqual(d.names(), ['ladder_1_landing', 'ladder_6_intent', 'ladder_7_conversion']);
  assert.deepEqual(browser({ href: 'https://ivaikin.com/?lang=ru#apply' }).names(), []);
});

test('ladder: stage selectors exist on all four homepages', () => {
  for (const file of ['index.html', 'ru/index.html', 'es/index.html', 'zh/index.html']) {
    const html = readFileSync(new URL('../' + file, import.meta.url), 'utf8');
    for (const needle of ['id="work"', 'id="testimonials"', 'id="ideas"', 'aria-labelledby="approach-title"', 'aria-labelledby="faq-title"', 'id="contact"', 'href="#contact"']) {
      assert.ok(html.includes(needle), `${file}: ${needle}`);
    }
  }
});
