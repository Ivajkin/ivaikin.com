import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, mkdtempSync, cpSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runInNewContext } from 'node:vm';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ORIGIN = 'https://ivaikin.com';
const PERSON_ID = `${ORIGIN}/#person`;
const LANDINGS = [
  { lang: 'en', path: '/about/' },
  { lang: 'ru', path: '/ru/about/' },
  { lang: 'es', path: '/es/about/' },
  { lang: 'zh', path: '/zh/about/' },
];
const INTERVIEWS = [
  { lang: 'en', path: '/en/interviews/tai-chi-business/' },
  { lang: 'ru', path: '/ru/interviews/tai-chi-business/' },
];
const CONTACTS = ['https://t.me/timothyivaikin', 'https://www.linkedin.com/in/timothyivaikin'];

function read(relativePath) {
  const filename = resolve(ROOT, relativePath.replace(/^\//, ''));
  assert.ok(existsSync(filename), `Missing published artifact: ${relativePath}`);
  return readFileSync(filename, 'utf8');
}

function page(path) {
  return read(`${path}index.html`);
}

function decode(value = '') {
  return value.replace(/&(?:amp|lt|gt|quot|apos|nbsp|#\d+|#x[\da-f]+);/gi, entity => {
    const named = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&apos;': "'", '&nbsp;': ' ' };
    if (entity[1] !== '#') return named[entity.toLowerCase()];
    return String.fromCodePoint(entity[2].toLowerCase() === 'x'
      ? parseInt(entity.slice(3, -1), 16) : parseInt(entity.slice(2, -1), 10));
  });
}

function attrs(source) {
  const result = {};
  for (const match of source.matchAll(/([^\s=<>/]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g)) {
    result[match[1].toLowerCase()] = decode(match[2] ?? match[3] ?? match[4] ?? '');
  }
  return result;
}

function tags(html, name) {
  return [...html.matchAll(new RegExp(`<${name}\\b([^>]*)>`, 'gi'))].map(match => attrs(match[1]));
}

function blocks(html, name) {
  return [...html.matchAll(new RegExp(`<${name}\\b([^>]*)>([\\s\\S]*?)<\\/${name}\\s*>`, 'gi'))]
    .map(match => ({ attrs: attrs(match[1]), content: match[2] }));
}

function text(html) {
  return decode(html.replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<(script|style|template)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, '')
    .replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
}

function absolute(href, path) {
  return new URL(href, `${ORIGIN}${path}`).href;
}

function normalizedProfile(href) {
  const url = new URL(href);
  url.hostname = url.hostname.replace(/^www\./, '');
  return `${url.origin}${url.pathname.replace(/\/$/, '')}`;
}

function jsonLd(html) {
  return blocks(html, 'script').filter(script => script.attrs.type === 'application/ld+json')
    .flatMap(script => {
      const data = JSON.parse(script.content);
      return Array.isArray(data) ? data : data['@graph'] ?? [data];
    });
}

function hasType(node, type) {
  return [node?.['@type']].flat().includes(type);
}

function checkMetadata(html, route) {
  assert.equal(tags(html, 'html')[0]?.lang, route.lang, 'HTML language must match this route');
  const head = blocks(html, 'head');
  assert.equal(head.length, 1, 'One document head is required');
  const titles = blocks(head[0].content, 'title');
  assert.equal(titles.length, 1, 'One meaningful title is required');
  assert.ok(text(titles[0].content).length >= 10, 'Title must identify the page');
  const meta = tags(head[0].content, 'meta');
  const descriptions = meta.filter(tag => tag.name?.toLowerCase() === 'description');
  assert.equal(descriptions.length, 1, 'One description is required');
  assert.ok(descriptions[0].content?.length >= 30, 'Description must summarize the page');
  for (const tag of meta.filter(tag => /^(robots|googlebot|bingbot)$/i.test(tag.name ?? ''))) {
    assert.doesNotMatch(tag.content ?? '', /\b(?:noindex|nosnippet|none)\b|\bmax-snippet\s*:\s*0\b/i,
      'Public profile must remain indexable and snippet-eligible');
  }
  const canonicals = tags(head[0].content, 'link').filter(tag => tag.rel?.toLowerCase() === 'canonical');
  assert.equal(canonicals.length, 1, 'One canonical is required');
  assert.equal(new URL(canonicals[0].href).href, `${ORIGIN}${route.path}`, 'Each translation must be self-canonical');
}

function checkAlternates(html, routes, fallback) {
  const alternates = tags(blocks(html, 'head')[0]?.content ?? '', 'link')
    .filter(tag => tag.rel?.toLowerCase() === 'alternate' && tag.hreflang);
  assert.equal(new Set(alternates.map(tag => tag.hreflang)).size, alternates.length, 'No duplicate language alternates');
  const actual = Object.fromEntries(alternates.map(tag => [tag.hreflang, tag.href]));
  for (const route of routes) assert.equal(actual[route.lang], `${ORIGIN}${route.path}`, `Missing reciprocal ${route.lang} alternate`);
  if (actual['x-default']) assert.equal(actual['x-default'], `${ORIGIN}${fallback}`, 'Fallback must use the canonical English page');
  assert.ok(Object.keys(actual).every(lang => routes.some(route => route.lang === lang) || lang === 'x-default'), 'No stale language variants');
}

for (const route of LANDINGS) {
  test(`${route.path}: complete localized profile remains readable without JavaScript`, () => {
    const html = page(route.path);
    const main = blocks(html, 'main');
    assert.equal(main.length, 1, 'Publish one semantic main element');
    const copy = text(main[0].content);
    assert.ok(copy.length >= 250, 'Main profile copy must be present in initial HTML');
    assert.equal(blocks(main[0].content, 'h1').length, 1, 'The profile needs one main heading');
    assert.ok(blocks(main[0].content, 'h2').length >= 2, 'Profile needs navigable content sections');
    if (route.lang === 'ru') assert.ok((copy.match(/\p{Script=Cyrillic}/gu) ?? []).length >= 80, 'Russian text cannot depend on JS translation');
    if (route.lang === 'zh') assert.ok((copy.match(/\p{Script=Han}/gu) ?? []).length >= 50, 'Chinese text cannot depend on JS translation');
    if (route.lang === 'es') assert.match(copy, /\b(?:para|con|una|empresa|personas|tecnolog[ií]a|sistemas)\b/i, 'Spanish text cannot be the English fallback');
  });

  test(`${route.path}: metadata and reciprocal language URLs describe this static page`, () => {
    const html = page(route.path);
    checkMetadata(html, route);
    checkAlternates(html, LANDINGS, '/about/');
    const hrefs = tags(blocks(html, 'body')[0]?.content ?? '', 'a').map(tag => absolute(tag.href ?? '', route.path));
    for (const home of LANDINGS.filter(home => home.lang !== route.lang)) {
      assert.ok(hrefs.includes(`${ORIGIN}${home.path}`), `${home.lang} switch must be a crawlable link`);
    }
  });

  test(`${route.path}: profile schema identifies the visible person and verified profiles`, () => {
    const html = page(route.path);
    const nodes = jsonLd(html);
    const profiles = nodes.filter(node => hasType(node, 'ProfilePage'));
    assert.equal(profiles.length, 1, 'Publish one ProfilePage JSON-LD entity');
    const entity = profiles[0].mainEntity;
    const person = hasType(entity, 'Person') ? entity : nodes.find(node => node['@id'] === entity?.['@id']);
    assert.ok(hasType(person, 'Person'), 'ProfilePage.mainEntity must resolve to a Person');
    assert.equal(person['@id'], PERSON_ID, 'Translations must retain one stable person identity');
    assert.ok(person.name?.trim(), 'Person must have a real name');
    const visible = text(blocks(html, 'body')[0]?.content ?? '');
    const publicNames = [person.name, person.alternateName ?? []].flat();
    assert.ok(publicNames.some(name => name && visible.includes(name)), 'A schema name or alternate name must also appear visibly');
    const sameAs = [person.sameAs ?? []].flat();
    for (const contact of CONTACTS) {
      assert.ok(sameAs.some(url => normalizedProfile(url) === normalizedProfile(contact)), `Missing verified sameAs: ${contact}`);
    }
    const visibleProfiles = tags(blocks(html, 'body')[0]?.content ?? '', 'a')
      .filter(tag => tag.href?.startsWith('https:')).map(tag => normalizedProfile(tag.href));
    for (const url of sameAs) {
      assert.equal(new URL(url).protocol, 'https:', 'Identity profiles must use public HTTPS URLs');
      assert.ok(visibleProfiles.includes(normalizedProfile(url)), `Schema profile must also be linked visibly: ${url}`);
    }
  });

  test(`${route.path}: links use verified contact profiles and valid local destinations`, () => {
    const html = page(route.path);
    const body = blocks(html, 'body')[0]?.content ?? '';
    const anchors = blocks(body, 'a');
    const hrefs = anchors.map(anchor => anchor.attrs.href);
    for (const contact of CONTACTS) {
      assert.ok(hrefs.some(href => href?.startsWith('https:') && normalizedProfile(href) === normalizedProfile(contact)), `Visible contact missing: ${contact}`);
    }
    for (const anchor of anchors) {
      const { href } = anchor.attrs;
      assert.ok(href && href !== '#' && !/^javascript:/i.test(href), 'Links must not use placeholder destinations');
      assert.ok(text(anchor.content) || anchor.attrs['aria-label'] || tags(anchor.content, 'img').some(image => image.alt), `Link needs an accessible name: ${href}`);
      const url = new URL(href, `${ORIGIN}${route.path}`);
      if (url.hostname === 't.me' || /(^|\.)linkedin\.com$/.test(url.hostname)) {
        assert.ok(CONTACTS.some(contact => normalizedProfile(contact) === normalizedProfile(href)), `Unverified or stale contact handle: ${href}`);
      }
      if (url.origin !== ORIGIN) continue;
      assert.ok(!url.searchParams.has('lang'), 'New navigation must point directly to static language pages');
      const target = url.pathname.endsWith('/') ? `${url.pathname}index.html` : url.pathname;
      assert.ok(existsSync(resolve(ROOT, target.replace(/^\//, ''))), `Broken internal destination: ${href}`);
      if (url.hash && url.pathname === route.path) {
        const id = decodeURIComponent(url.hash.slice(1));
        assert.ok(tags(html, '[a-z][a-z0-9:-]*').some(tag => tag.id === id), `Missing anchor target: ${href}`);
      }
    }
  });
}

for (const route of INTERVIEWS) {
  test(`${route.path}: existing interview remains crawlable with its bilingual identity`, () => {
    const html = page(route.path);
    checkMetadata(html, route);
    checkAlternates(html, INTERVIEWS, '/en/interviews/tai-chi-business/');
    assert.ok(text(blocks(html, 'main')[0]?.content ?? '').length >= 250, 'Interview content must remain present');
    assert.ok(jsonLd(html).some(node => hasType(node, 'VideoObject')), 'Existing video identity must remain available');
    assert.ok(tags(html, 'a').some(tag => tag.href === 'https://t.me/timothyivaikin'), 'Interview contact must remain usable');
  });
}

function upstream(path) {
  return execFileSync('git', ['show', `origin/main:${path}`], { cwd: ROOT, encoding: 'utf8' });
}

const PRESERVED = [
  'main.js', 'i18n.js', 'style.css', 'analytics.js',
  'en/interviews/tai-chi-business/index.html', 'ru/interviews/tai-chi-business/index.html',
];

test('the legacy assets and interview pages remain byte-identical to origin/main', () => {
  for (const path of PRESERVED) assert.equal(read(path), upstream(path), `Existing public artifact changed: ${path}`);
  assert.ok(!tags(page('/'), 'script').some(script => script.src === '/assets/home/home.js'),
    'The child-page redirect script must not replace legacy homepage behavior');
});

test('sitemap keeps child profiles and independent interview entries alongside new homepages', () => {
  const sitemap = read('sitemap.xml');
  assert.match(sitemap, /<urlset\b[^>]*xmlns=["']http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9["']/);
  const homes = ['/', '/ru/', '/es/', '/zh/'];
  const owned = new Set([...LANDINGS.map(route => ORIGIN + route.path), ...homes.map(path => ORIGIN + path)]);
  const oldEntries = blocks(upstream('sitemap.xml'), 'url')
    .filter(entry => !owned.has(decode(blocks(entry.content, 'loc')[0]?.content.trim())));
  const currentEntries = blocks(sitemap, 'url');
  const locations = currentEntries.map(entry => decode(blocks(entry.content, 'loc')[0]?.content.trim()));
  const oldLocations = oldEntries.map(entry => decode(blocks(entry.content, 'loc')[0]?.content.trim()));
  assert.deepEqual(locations.sort(), [...oldLocations, ...owned].sort());
  assert.equal(new Set(locations).size, locations.length, 'Every canonical URL must occur once');
  for (const old of oldEntries) assert.ok(currentEntries.some(entry => entry.content === old.content),
    'Previously published independent sitemap entries must remain unchanged');
  for (const route of LANDINGS) {
    const entry = currentEntries.find(entry => blocks(entry.content, 'loc')[0]?.content.trim() === ORIGIN + route.path);
    const alternates = tags(entry.content, 'xhtml:link');
    for (const sibling of LANDINGS) assert.ok(alternates.some(link => link.hreflang === sibling.lang && link.href === ORIGIN + sibling.path));
    assert.ok(alternates.some(link => link.hreflang === 'x-default' && link.href === ORIGIN + '/about/'));
    assert.doesNotMatch(entry.content, /[?&](?:amp;)?lang=/, 'New child URLs must be static');
  }
});

test('the generator preserves the parent page and existing sitemap records across repeated builds', () => {
  const target = mkdtempSync(resolve(tmpdir(), 'ivaikin-child-build-'));
  try {
    for (const directory of ['scripts', 'content']) cpSync(resolve(ROOT, directory), resolve(target, directory), { recursive: true });
    const parent = '<!doctype html><html><body>Existing parent remains owned by its own workflow.</body></html>\n';
    const record = '<url><loc>https://ivaikin.com/existing-independent-page/</loc><lastmod>2026-01-01</lastmod></url>';
    writeFileSync(resolve(target, 'index.html'), parent);
    writeFileSync(resolve(target, 'sitemap.xml'), `<?xml version="1.0"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${record}</urlset>`);
    for (let run = 0; run < 2; run++) {
      execFileSync(process.execPath, ['scripts/build.mjs'], { cwd: target, encoding: 'utf8' });
      assert.equal(readFileSync(resolve(target, 'index.html'), 'utf8'), parent, 'Build overwrote the existing homepage');
      const sitemap = readFileSync(resolve(target, 'sitemap.xml'), 'utf8');
      assert.ok(sitemap.includes(record), 'Build lost an independently maintained sitemap entry');
      const locations = blocks(sitemap, 'loc').map(block => block.content);
      assert.equal(locations.length, 5, 'Repeat builds must add four child routes exactly once');
      for (const route of LANDINGS) assert.ok(existsSync(resolve(target, '.' + route.path, 'index.html')));
      for (const lang of ['ru', 'es', 'zh']) assert.ok(!existsSync(resolve(target, lang, 'index.html')));
    }
  } finally { rmSync(target, { recursive: true, force: true }); }
});

function robotsGroups(source) {
  const groups = [];
  let group;
  for (const raw of source.split(/\r?\n/)) {
    const line = raw.replace(/#.*$/, '').trim();
    const match = /^([^:]+):\s*(.*)$/.exec(line);
    if (!match) continue;
    const key = match[1].trim().toLowerCase();
    const value = match[2].trim();
    if (key === 'user-agent') {
      if (!group || group.hasRules) groups.push(group = { agents: [], rules: [], hasRules: false });
      group.agents.push(value.toLowerCase());
    } else if (group && ['allow', 'disallow'].includes(key)) {
      group.hasRules = true;
      if (value) group.rules.push({ allow: key === 'allow', path: value });
    }
  }
  return groups;
}

function permitted(groups, agent, path) {
  const specific = groups.filter(group => group.agents.some(name => name !== '*' && agent.toLowerCase().includes(name)));
  const applicable = specific.length ? specific : groups.filter(group => group.agents.includes('*'));
  const matches = applicable.flatMap(group => group.rules).filter(rule => {
    const pattern = rule.path.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\\\$$/, '$').replace(/\*/g, '.*');
    return new RegExp(`^${pattern}`).test(path);
  }).sort((a, b) => b.path.length - a.path.length || Number(b.allow) - Number(a.allow));
  return matches[0]?.allow ?? true;
}

test('robots permits search discovery separately from any training policy', () => {
  const source = read('robots.txt');
  assert.match(source, /^Sitemap:\s*https:\/\/ivaikin\.com\/sitemap\.xml\s*$/mi);
  const groups = robotsGroups(source);
  for (const agent of ['Googlebot', 'Bingbot', 'OAI-SearchBot']) {
    for (const route of [...LANDINGS, ...INTERVIEWS]) {
      assert.ok(permitted(groups, agent, route.path), `${agent} cannot crawl ${route.path}`);
    }
  }
});

test('child language compatibility stays within the child landing and preserves campaign parameters and anchors', () => {
  const script = blocks(page('/about/'), 'script')
    .find(script => script.attrs.src && new URL(script.attrs.src, ORIGIN).pathname === '/assets/home/home.js');
  assert.ok(script, 'Publish the legacy URL compatibility script');
  const path = new URL(script.attrs.src, ORIGIN).pathname;
  for (const [input, expected] of [
    ['/about/?lang=en', '/about/'],
    ['/about/?lang=ru', '/ru/about/'],
    ['/about/?lang=es&utm_source=legacy#contact', '/es/about/?utm_source=legacy#contact'],
    ['/about/?lang=zh', '/zh/about/'],
    ['/about/?lang=ru#apply', '/ru/about/#contact'],
    ['/about/#community', '/about/#contact'],
    ['/ru/about/#pillars', '/ru/about/#work'],
    ['/about/?lang=en#track-record', '/about/#work'],
    ['/about/?lang=unknown', null],
    ['/about/?lang=__proto__', null],
    ['/about/?lang=https%3A%2F%2Fexample.com', null],
    ['/about/?utm_source=direct', null],
  ]) {
    const redirects = [];
    const location = { href: `${ORIGIN}${input}`, replace: value => redirects.push(new URL(value, ORIGIN).href) };
    runInNewContext(read(path), { URL, URLSearchParams, window: { location } }, { timeout: 1000, filename: path });
    assert.deepEqual(redirects, expected === null ? [] : [`${ORIGIN}${expected}`], `Unexpected navigation for ${input}`);
  }
});
