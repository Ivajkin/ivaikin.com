import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const read = (p) => readFileSync(new URL('../' + p, import.meta.url), 'utf8');
const STEPS = [1, 2, 3, 4, 5, 6, 7];
const path = (lang, n) => (lang === 'ru' ? `ru/ladder/${n}/index.html` : `ladder/${n}/index.html`);
const ld = (html) => [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)].map((m) => JSON.parse(m[1]));
const all = () => ['en', 'ru'].flatMap((lang) => STEPS.map((n) => ({ lang, n, html: read(path(lang, n)) })));
const visible = (html) => html.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<[^>]+>/g, ' ');

test('seo v2: stays noindex, unique title and description, OG and Twitter cards with an existing image', () => {
  const titles = new Set(); const descs = new Set();
  for (const { lang, n, html } of all()) {
    const id = `${lang}/${n}`;
    assert.match(html, [1, 4].includes(n) ? /<meta name="robots" content="index,follow">/ : /<meta name="robots" content="noindex">/, id);
    const title = html.match(/<title>(.*?)<\/title>/)[1];
    const desc = html.match(/<meta name="description" content="(.*?)">/)[1];
    assert.ok(title.length >= 20 && title.length <= 75, `${id} title ${title.length}`);
    assert.ok(desc.length >= 70 && desc.length <= 175, `${id} description ${desc.length}`);
    assert.ok(!titles.has(title) && !descs.has(desc), `${id} duplicate`);
    titles.add(title); descs.add(desc);
    for (const needle of [`<meta property="og:title" content="${title}">`, `<meta name="twitter:title" content="${title}">`, '<meta name="twitter:card" content="summary_large_image">', '<meta property="og:image:width" content="1200">']) assert.ok(html.includes(needle), `${id} ${needle}`);
    const img = html.match(/<meta property="og:image" content="https:\/\/ivaikin\.com(\/[^"]+)">/)[1];
    assert.ok(existsSync(new URL('..' + img, import.meta.url)), `${id} ${img}`);
  }
});

test('seo v2: JSON-LD parses; Person, Organization, WebPage, BreadcrumbList everywhere; Service on 2; FAQPage on 5 matches visible text', () => {
  for (const { lang, n, html } of all()) {
    const blocks = ld(html);
    assert.equal(blocks.length, 1, `${lang}/${n}`);
    const g = blocks[0]['@graph'];
    const types = g.map((x) => x['@type']);
    for (const t of ['Person', 'Organization', 'WebPage', 'BreadcrumbList']) assert.ok(types.includes(t), `${lang}/${n} ${t}`);
    assert.equal(types.includes('Service'), n === 2, `${lang}/${n} Service`);
    assert.equal(types.includes('FAQPage'), n === 5, `${lang}/${n} FAQPage`);
    assert.equal(g.find((x) => x['@type'] === 'Person')['@id'], 'https://ivaikin.com/#person');
    if (n === 5) {
      const faq = g.find((x) => x['@type'] === 'FAQPage');
      assert.equal(faq.mainEntity.length, 3);
      const text = visible(html).replace(/\s+/g, ' ');
      for (const q of faq.mainEntity) assert.ok(text.includes(q.name), `${lang}/5 question visible: ${q.name}`);
    }
    assert.ok(!/"(price|priceCurrency|lowPrice|highPrice)"/.test(JSON.stringify(g)));
  }
});

test('seo v2: answer blocks on 2,3,4,6; share on 6 with utm; hero and sticky CTA; AB bundle defaults and flags', () => {
  for (const { lang, n, html } of all()) {
    const id = `${lang}/${n}`;
    assert.equal(html.includes('data-answer'), [2, 3, 4, 6].includes(n), id);
    assert.ok(html.includes('data-sticky-cta'), id);
    assert.equal(html.includes('class="hero-cta"'), n < 7, id);
    assert.equal(html.includes('https://t.me/share/url?url='), n === 6, id);
    if (n === 6) assert.ok(decodeURIComponent(html.match(/share\/url\?url=([^&]+)/)[1]).includes('utm_medium=share&utm_campaign=ladder&utm_content=share_s6'), id);
    if (n === 7) assert.ok(html.includes('data-prefill="'), id);
    assert.ok(html.indexOf('window.edgeFunnelAB=v') > 0 && html.indexOf('window.edgeFunnelAB=v') < html.indexOf("gtag('config'"), id);
  }
  const b = read('scripts/build-funnel.mjs');
  assert.match(b, /const INDEXABLE = false;/);
  assert.match(b, /const AB_FORCE = '';/);
});

test('seo v2: GA4 page_location keeps only safe utm keys, never other query values', () => {
  const html = read(path('en', 1));
  const snippet = html.match(/var loc = [\s\S]*?gtag\('config', 'G-2Z5VJ13B20', \{page_location: loc[^)]*\);/)[0];
  // evaluate with a capturing gtag
  const loc = (search) => {
    const out = {};
    const window = { location: { origin: 'https://ivaikin.com', pathname: '/ladder/1/', search } };
    const ctx = { window, URLSearchParams, out, gtag: (a, b, c) => { if (a === 'config') out.cfg = c; } };
    vm.runInNewContext(snippet, ctx);
    return out.cfg.page_location;
  };
  assert.equal(loc(''), 'https://ivaikin.com/ladder/1/');
  assert.equal(loc('?utm_source=telegram&utm_medium=story&utm_campaign=ladder&utm_content=iv_ru_s1a&utm_term=hook_a&email=a%40b.ru&x=1'), 'https://ivaikin.com/ladder/1/?utm_source=telegram&utm_medium=story&utm_campaign=ladder&utm_content=iv_ru_s1a&utm_term=hook_a');
  assert.equal(loc('?utm_source=<b>&utm_medium=ok'), 'https://ivaikin.com/ladder/1/?utm_medium=ok');
});

test('seo v2: new copy has no forbidden terms, no letter yo, no long dash, no money in meta', () => {
  const banned = /(Прогресс|SFIT|ROI|Sovereign|суверенн|Dubai|DMCC|Дубай|[ёЁ]|\u2014)/i;
  for (const { lang, n, html } of all()) {
    const meta = [...html.matchAll(/<(?:title|meta)[^>]*?(?:content="([^"]*)")?[^>]*>([^<]*)/g)].map((m) => ((m[1] || '') + ' ' + (m[2] || ''))).join(' ').replace(/\u2014/g, '');
    const answer = (html.match(/<div class="answer" data-answer>([\s\S]*?)<\/div>/) || ['', ''])[1];
    const m = (answer + ' ' + meta).match(banned);
    assert.ok(!m, `${lang}/${n}: ${m && m[0]}`);
    assert.ok(!/(\$|₽|руб)/.test(html.match(/<meta name="description" content="(.*?)">/)[1]));
  }
});

test('llms.txt exists, links only live pages of this site and states what is quotable', () => {
  const t = read('llms.txt');
  assert.match(t, /^# Timothy Ivaikin/);
  const sitemap = read('sitemap.xml');
  for (const m of t.matchAll(/\]\((https:\/\/ivaikin\.com\/[^)]*)\)/g)) assert.ok(sitemap.includes(`<loc>${m[1]}</loc>`), m[1]);
  assert.ok(!/(ladder|Прогресс|SFIT|ROI|Sovereign|Dubai)/i.test(t));
});

// ---- runtime ---------------------------------------------------------------------------------------------------
function run({ href = 'https://ivaikin.com/ladder/1/', ab, store = {}, step = 1 } = {}) {
  const events = []; const listeners = {}; const timers = [];
  const url = new URL(href);
  const links = [{ attrs: { href: 'https://t.me/timothyivaikin', 'data-prefill': 'Hello!\nTopic: ' }, getAttribute(n) { return this.attrs[n] ?? null; }, setAttribute(n, v) { this.attrs[n] = v; } }];
  const document = { body: { getAttribute: (n) => (n === 'data-funnel-step' ? String(step) : null) }, documentElement: { lang: 'en', scrollHeight: 4000 }, referrer: '', visibilityState: 'visible', querySelector: () => null, querySelectorAll: () => links, addEventListener: (n, fn) => (listeners[n] ??= []).push(fn) };
  const window = {
    location: { href, hostname: url.hostname, pathname: url.pathname, search: url.search },
    sessionStorage: { getItem: (k) => store[k] ?? null, setItem: (k, v) => { store[k] = v; } },
    setTimeout: (fn, ms) => { timers.push({ fn, ms }); return timers.length; }, clearTimeout() {}, setInterval: () => 1, clearInterval() {},
    addEventListener: (n, fn) => (listeners['w:' + n] ??= []).push(fn), removeEventListener() {}, requestAnimationFrame: (fn) => fn(), innerHeight: 800, scrollY: 0, edgeFunnelAB: ab,
    gtag: (...a) => events.push(JSON.parse(JSON.stringify(a))),
  };
  vm.runInNewContext(read('assets/front/funnel.js'), { window, document, URL, URLSearchParams, encodeURIComponent });
  const click = (h, attrs = {}) => (listeners.click ?? []).forEach((fn) => fn({ target: { closest: (s) => (s.startsWith('a') ? { getAttribute: () => h, hasAttribute: (n) => n in attrs, closest: () => ({ id: 'contact' }) } : null) } }));
  return { events, store, links, click };
}
const UTM = '?utm_source=telegram&utm_medium=story&utm_campaign=ladder&utm_content=iv_ru_s1a&utm_term=hook_a';

test('utm pass-through: five utm keys and ab_cro go into every funnel event; stored for the next step', () => {
  const r = run({ href: 'https://ivaikin.com/ladder/1/' + UTM, ab: 'b' });
  const p = r.events[0][2];
  assert.equal(r.events[0][1], 'ladder_1_landing');
  assert.deepEqual([p.utm_source, p.utm_medium, p.utm_campaign, p.utm_content, p.utm_term, p.ab_cro], ['telegram', 'story', 'ladder', 'iv_ru_s1a', 'hook_a', 'b']);
  r.click('https://t.me/timothyivaikin');
  const cta = r.events.find((e) => e[1] === 'cta_telegram')[2];
  assert.equal(cta.utm_content, 'iv_ru_s1a'); assert.equal(cta.entry, 'funnel_page');
  const r2 = run({ href: 'https://ivaikin.com/ladder/2/', ab: 'a', store: r.store, step: 2 });
  r2.click('https://t.me/share/url?url=x');
  const share = r2.events.find((e) => e[1] === 'ladder_aux_share')[2];
  assert.equal(share.utm_source, 'telegram'); assert.equal(share.ab_cro, 'a');
});

test('utm pass-through: unsafe values dropped, other query keys never pass; share is not a conversion; B prefills Telegram', () => {
  const r = run({ href: 'https://ivaikin.com/ladder/1/?utm_source=<x>&utm_campaign=ok_1&email=a%40b.ru&utm_medium=' + 'x'.repeat(65) });
  const p = r.events[0][2];
  assert.equal(p.utm_campaign, 'ok_1');
  for (const k of ['utm_source', 'utm_medium', 'email', 'ab_cro']) assert.ok(!(k in p), k);
  const s = run({ ab: 'a' });
  s.click('https://t.me/share/url?url=x&text=y');
  assert.deepEqual(s.events.map((e) => e[1]), ['ladder_1_landing', 'ladder_aux_share']);
  assert.equal(s.links[0].attrs.href, 'https://t.me/timothyivaikin');
  assert.equal(run({ ab: 'b' }).links[0].attrs.href, 'https://t.me/timothyivaikin?text=' + encodeURIComponent('Hello!\nTopic: '));
});
