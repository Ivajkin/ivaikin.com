import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, mkdtempSync, cpSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';

const ROOT = resolve(import.meta.dirname, '..');
const ORIGIN = 'https://ivaikin.com';
const ROUTES = [['en', '/'], ['ru', '/ru/'], ['es', '/es/'], ['zh', '/zh/']];
const read = path => readFileSync(resolve(ROOT, path.replace(/^\//, '')), 'utf8');
const attrs = source => Object.fromEntries([...source.matchAll(/([\w:-]+)="([^"]*)"/g)].map(m => [m[1], m[2]]));
const tags = (html, tag) => [...html.matchAll(new RegExp(`<${tag}\\b([^>]*)>`, 'g'))].map(m => attrs(m[1]));

for (const [lang, path] of ROUTES) {
  test(`${path}: homepage has static localized content, canonical identity and language links`, () => {
    assert.ok(existsSync(resolve(ROOT, `.${path}index.html`)), `Static ${lang} homepage is missing`);
    const html = read(`${path}index.html`);
    assert.equal(tags(html, 'html')[0].lang, lang);
    assert.equal(tags(html, 'main').length, 1, 'One accessible main landmark is required');
    assert.equal(tags(html, 'h1').length, 1);
    assert.ok((html.match(/<h2\b/g) ?? []).length >= 4);
    const links = tags(html, 'link');
    assert.deepEqual(links.filter(x => x.rel === 'canonical').map(x => x.href), [ORIGIN + path]);
    for (const [code, route] of [...ROUTES, ['x-default', '/']]) {
      assert.ok(links.some(x => x.hreflang === code && x.href === ORIGIN + route), `Missing ${code} alternate`);
    }
    for (const [, route] of ROUTES) assert.ok(tags(html, 'a').some(x => x.href === route), `No crawlable link to ${route}`);
    const meta = tags(html, 'meta');
    assert.ok(meta.some(x => x.name === 'description' && x.content.length >= 40));
    assert.ok(meta.some(x => x.property === 'og:url' && x.content === ORIGIN + path));
    assert.ok(meta.some(x => x.property === 'og:image' && x.content.endsWith('/assets/front/social.jpg')));
    assert.ok(meta.some(x => x.name === 'twitter:card' && x.content === 'summary_large_image'));
    assert.doesNotMatch(html, /content="[^"\n]*(?:noindex|nosnippet)/);
    const schema = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1] ?? '{}');
    assert.equal(schema['@type'], 'ProfilePage');
    assert.equal(schema.mainEntity?.['@id'], ORIGIN + '/#person');
    assert.equal(schema.mainEntity?.['@type'], 'Person');
    assert.ok(schema.mainEntity.sameAs.includes('https://t.me/timothyivaikin'));
    if (lang === 'ru') assert.match(html, /Люди\. Технологии\. Работающие системы\./);
    if (lang === 'zh') assert.ok((html.match(/\p{Script=Han}/gu) ?? []).length > 100);
    assert.doesNotMatch(html, /<form\b|formspree\.io|ceo@edgeexperts\.co|t\.me\/ivaikin["/]/);
  });

  test(`${path}: contact, navigation and images have usable destinations`, () => {
    const html = read(`${path}index.html`);
    for (const match of html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/g)) {
      const a = attrs(match[1]);
      assert.ok(a.href && a.href !== '#' && !a.href.startsWith('javascript:'), 'No placeholder links');
      assert.ok(a['aria-label'] || match[2].replace(/<[^>]*>/g, '').trim(), `Link has no accessible name: ${a.href}`);
      const url = new URL(a.href, ORIGIN + path);
      if (url.origin !== ORIGIN) continue;
      const target = url.pathname.endsWith('/') ? url.pathname + 'index.html' : url.pathname;
      assert.ok(existsSync(resolve(ROOT, target.slice(1))), `Missing linked file: ${target}`);
      if (url.hash) assert.ok(read(target).includes(`id="${url.hash.slice(1)}"`), `Missing anchor: ${a.href}`);
    }
    assert.ok(tags(html, 'a').some(a => a.href === 'https://t.me/timothyivaikin'));
    assert.ok(tags(html, 'a').some(a => a.href === 'mailto:hello@edgeivaikin.com'));
    for (const image of tags(html, 'img')) {
      assert.ok(Object.hasOwn(image, 'alt'), 'Every image needs an alt decision');
      assert.ok(Number(image.width) > 0 && Number(image.height) > 0, 'Reserve image space');
      assert.ok(existsSync(resolve(ROOT, image.src.slice(1))), `Missing image: ${image.src}`);
    }
    for (const link of tags(html, 'link').filter(x => ['stylesheet', 'icon', 'preload'].includes(x.rel))) {
      if (link.href.startsWith('/')) assert.ok(existsSync(resolve(ROOT, link.href.slice(1))), `Missing asset: ${link.href}`);
    }
    for (const script of tags(html, 'script').filter(x => x.src?.startsWith('/'))) assert.ok(existsSync(resolve(ROOT, script.src.slice(1))), `Missing script: ${script.src}`);
    const intentions = tags(html, 'a').filter(a => a.href?.startsWith('mailto:hello@edgeivaikin.com?'));
    assert.equal(intentions.length, 3, 'Three distinct contact paths need useful message starters');
    for (const intent of intentions) {
      const url = new URL(intent.href.replaceAll('&amp;', '&'));
      assert.ok(url.searchParams.get('subject'));
      assert.ok(url.searchParams.get('body')?.includes('\n'));
    }
    assert.ok(existsSync(resolve(ROOT, 'assets/front/social.jpg')), 'Social sharing image must exist');
  });
}

test('homepage build is repeatable and retains the profile and interview pages', () => {
  const target = mkdtempSync(resolve(tmpdir(), 'ivaikin-home-build-'));
  try {
    for (const path of ['scripts', 'content', 'about', 'ru', 'es', 'zh', 'en', 'sitemap.xml']) cpSync(resolve(ROOT, path), resolve(target, path), { recursive: true });
    const preserved = ['about/index.html', 'ru/about/index.html', 'es/about/index.html', 'zh/about/index.html', 'en/interviews/tai-chi-business/index.html', 'ru/interviews/tai-chi-business/index.html'];
    for (let run = 0; run < 2; run++) {
      execFileSync(process.execPath, ['scripts/build-home.mjs'], { cwd: target });
      for (const path of preserved) assert.equal(readFileSync(resolve(target, path), 'utf8'), read(path));
      const locations = [...readFileSync(resolve(target, 'sitemap.xml'), 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map(x => x[1]);
      assert.equal(new Set(locations).size, locations.length, 'Repeat builds duplicate canonical URLs');
      assert.equal(locations.length, 10);
      for (const [, path] of ROUTES) assert.ok(locations.includes(ORIGIN + path));
    }
  } finally { rmSync(target, { recursive: true, force: true }); }
});
