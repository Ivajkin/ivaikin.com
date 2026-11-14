import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, mkdtempSync, cpSync, rmSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const ORIGIN = 'https://ivaikin.com';
const routes = { en: '/en/recognition/nasledie-mira-2026/', ru: '/ru/recognition/nasledie-mira-2026/' };
const images = {
  '/assets/recognition/nasledie-mira-2026/diploma-original.jpg': '6a3424fbb6b7e4eef00cc083b8ad744229aa686f4173bdff4a8109e7c2ee4387',
  '/assets/recognition/nasledie-mira-2026/appreciation-original.jpg': 'b254b96b128f4da1a428beb790ef33f8cb3f0abdf06ef2f6caa86f4fb158eb78',
};
const read = path => readFileSync(resolve(ROOT, path.replace(/^\//, '')), 'utf8');
const attrs = source => Object.fromEntries([...source.matchAll(/([\w:-]+)="([^"]*)"/g)].map(m => [m[1], m[2]]));
const tags = (html, tag) => [...html.matchAll(new RegExp(`<${tag}\\b([^>]*)>`, 'g'))].map(m => attrs(m[1]));

for (const [lang, route] of Object.entries(routes)) {
  test(`${route}: language and article metadata retain the person and publisher's separate roles`, () => {
    assert.ok(existsSync(resolve(ROOT, '.' + route, 'index.html')), 'Recognition page must be generated');
    const html = read(route + 'index.html');
    assert.equal(tags(html, 'html')[0].lang, lang);
    assert.equal(tags(html, 'main').length, 1);
    assert.equal(tags(html, 'h1').length, 1);
    const links = tags(html, 'link');
    assert.deepEqual(links.filter(l => l.rel === 'canonical').map(l => l.href), [ORIGIN + route]);
    assert.deepEqual(Object.fromEntries(links.filter(l => l.hreflang).map(l => [l.hreflang, l.href])), {
      en: ORIGIN + routes.en, ru: ORIGIN + routes.ru, 'x-default': ORIGIN + routes.en,
    });
    const meta = tags(html, 'meta');
    assert.ok(meta.some(m => m.property === 'og:url' && m.content === ORIGIN + route));
    assert.ok(meta.some(m => m.property === 'og:type' && m.content === 'article'));
    assert.ok(meta.some(m => m.name === 'description' && m.content.length > 40));
    const schema = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
    assert.equal(schema['@type'], 'Article');
    assert.equal(schema.about['@type'], 'Person');
    assert.equal(schema.about['@id'], ORIGIN + '/#person');
    assert.equal(schema.author?.['@type'], 'Person');
    assert.equal(schema.author?.['@id'], ORIGIN + '/#person');
    assert.equal(schema.author?.name, 'Timothy Ivaikin');
    assert.equal(schema.author?.url, ORIGIN + (lang === 'en' ? '/about/' : '/ru/about/'));
    assert.equal(schema.inLanguage, lang);
    assert.equal(schema.mentions['@type'], 'Organization');
    assert.equal(new URL(schema.mentions.url).href, new URL('https://наследие-мира.рф/').href);
    assert.ok(!schema.datePublished, 'Document date must not be presented as the article publication date');
    assert.ok(!schema.about.memberOf && !schema.about.affiliation && !schema.about.award, 'Recognition must not invent membership or an award title');
  });

  test(`${route}: both unchanged source photos are visible, described and linked without JavaScript`, () => {
    assert.ok(existsSync(resolve(ROOT, '.' + route, 'index.html')), 'Recognition page must be generated');
    const html = read(route + 'index.html');
    const visible = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)[1];
    const evidence = tags(visible, 'img');
    assert.equal(evidence.length, 2);
    assert.deepEqual(new Set(evidence.map(i => i.src)), new Set(Object.keys(images)));
    assert.equal(tags(visible, 'figcaption').length, 2);
    assert.ok(tags(visible, 'time').some(t => t.datetime === '2026-10-07'));
    for (const img of evidence) {
      assert.ok(img.alt.length > 30 && +img.width === 1280 && +img.height === 960);
      assert.ok(tags(visible, 'a').some(a => a.href === img.src), 'Original photo must be accessible');
      const bytes = readFileSync(resolve(ROOT, img.src.slice(1)));
      assert.equal(createHash('sha256').update(bytes).digest('hex'), images[img.src], 'Evidence photo must remain byte-identical');
    }
    for (const a of tags(html, 'a')) {
      const url = new URL(a.href, ORIGIN);
      if (url.origin !== ORIGIN) continue;
      const target = url.pathname.endsWith('/') ? url.pathname + 'index.html' : url.pathname;
      assert.ok(existsSync(resolve(ROOT, target.slice(1))), `Missing destination ${a.href}`);
      if (url.hash) assert.ok(read(target).includes(`id="${url.hash.slice(1)}"`), `Missing anchor ${a.href}`);
    }
    for (const profile of lang === 'en' ? ['/', '/about/'] : ['/ru/', '/ru/about/']) {
      const ideas = read(profile + 'index.html').match(/<section id="ideas"[\s\S]*?<\/section>/)[0];
      assert.ok(tags(ideas, 'a').some(a => a.href === route), 'Recognition must be discoverable from the ideas area');
    }
  });
}

test('full build keeps recognition URLs unique, reciprocal and reproducible while preserving other languages', () => {
  const target = mkdtempSync(resolve(tmpdir(), 'ivaikin-recognition-build-'));
  try {
    for (const path of ['scripts', 'content', 'assets', 'sitemap.xml', 'package.json']) cpSync(resolve(ROOT, path), resolve(target, path), { recursive: true });
    let previous;
    for (let run = 0; run < 2; run++) {
      execFileSync('npm', ['run', 'build'], { cwd: target, stdio: 'pipe' });
      const sitemap = readFileSync(resolve(target, 'sitemap.xml'), 'utf8');
      const locations = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
      assert.equal(new Set(locations).size, locations.length);
      assert.equal(locations.length, 26);
      for (const route of Object.values(routes)) {
        assert.ok(locations.includes(ORIGIN + route));
        const block = [...sitemap.matchAll(/<url\b[^>]*>([\s\S]*?)<\/url>/g)].find(m => m[1].includes(`<loc>${ORIGIN}${route}</loc>`))[1];
        assert.deepEqual(Object.fromEntries(tags(block, 'xhtml:link').map(l => [l.hreflang, l.href])), {
          en: ORIGIN + routes.en, ru: ORIGIN + routes.ru, 'x-default': ORIGIN + routes.en,
        });
      }
      const output = [sitemap, ...Object.values(routes).map(p => readFileSync(resolve(target, '.' + p, 'index.html'), 'utf8'))];
      if (previous) assert.deepEqual(output, previous, 'Repeated builds must be byte-identical');
      previous = output;
      for (const path of ['es/index.html', 'zh/index.html', 'es/about/index.html', 'zh/about/index.html']) assert.equal(readFileSync(resolve(target, path), 'utf8'), read(path));
    }
  } finally { rmSync(target, { recursive: true, force: true }); }
});
