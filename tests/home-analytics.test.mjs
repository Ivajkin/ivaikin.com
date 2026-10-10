import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { transformHtml } from '../scripts/staging-lib.mjs';

const html = () => readFileSync(new URL('../index.html', import.meta.url), 'utf8');
function executeAnalytics(source, href) {
  const browser = { location: new URL(href), URL, Date };
  browser.window = browser;
  for (const [, attributes, body] of source.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)) {
    if (/\bsrc=|\btype=/.test(attributes)) continue;
    runInNewContext(body, browser);
  }
  return JSON.parse(JSON.stringify((browser.dataLayer ?? []).map(args => Array.from(args))));
}

test('analytics records ordinary landing views with a query-free and fragment-free page location', () => {
  for (const href of ['https://ivaikin.com/', 'https://ivaikin.com/ru/?utm_source=example#contact', 'https://ivaikin.com/?lang=invalid&private=value']) {
    const configs = executeAnalytics(html(), href).filter(args => args[0] === 'config');
    assert.equal(configs.length, 1);
    assert.equal(configs[0][1], 'G-2Z5VJ13B20');
    assert.equal(configs[0][2].page_location, new URL(href).origin + new URL(href).pathname);
    assert.equal(configs[0][2].send_page_view, true);
    assert.equal(configs[0][2].allow_google_signals, false);
  }
});

test('legacy language redirects do not count an intermediate page view', () => {
  const urls = [
    'https://ivaikin.com/?lang=en',
    'https://ivaikin.com/?lang=ru&utm_source=example#apply',
    'https://ivaikin.com/ru/?lang=es',
    'https://ivaikin.com/?lang=zh',
  ];
  for (const href of urls) {
    const events = executeAnalytics(html(), href);
    assert.equal(events.filter(args => args[0] === 'config' || args[0] === 'event' && args[1] === 'page_view').length, 0, href);
  }
});

test('legacy hash-only navigation initializes analytics once without waiting for a reload', () => {
  for (const anchor of ['hero', 'apply', 'community', 'pillars', 'track-record', 'testimonials']) {
    const configs = executeAnalytics(html(), `https://ivaikin.com/ru/#${anchor}`).filter(args => args[0] === 'config');
    assert.equal(configs.length, 1, anchor);
    assert.equal(configs[0][2].send_page_view, true);
    assert.equal(configs[0][2].page_location, 'https://ivaikin.com/ru/');
  }
});

test('staged homepages never initialize production analytics', () => {
  const preview = transformHtml(html(), '/previews/ivaikin/example/', 'test-release');
  assert.deepEqual(executeAnalytics(preview, 'https://preview.example/previews/ivaikin/example/'), []);
});
