import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { transformHtml } from '../scripts/staging-lib.mjs';

const page = language => readFileSync(new URL(`../${language}/interviews/tai-chi-business/index.html`, import.meta.url), 'utf8');

function visit(language = 'ru', options = {}) {
  const location = new URL(options.href ?? `https://ivaikin.com/${language}/interviews/tai-chi-business/?utm_source=telegram&utm_medium=social&utm_campaign=tai_chi_business&utm_content=announcement&email=private@example.com#watch`);
  const listeners = new Map();
  const loaded = [];
  const source = options.html ?? page(language);
  const languageLinks = [...source.matchAll(/<a\b([^>]*\bhreflang=[^>]*)>/g)].map(([, attrs]) => {
    let href = attrs.match(/href=["']([^"']+)/)[1];
    return { getAttribute: () => href, setAttribute: (_, value) => { href = value; } };
  });
  const document = {
    documentElement: { lang: language },
    title: language === 'ru' ? 'Команда, процессы и тайцзи' : 'Teams, systems and tai chi',
    referrer: options.referrer ?? 'https://t.me/channel?private=hidden#secret',
    head: { appendChild: script => loaded.push(script) },
    createElement: () => ({}),
    getElementById: () => null,
    querySelector: selector => selector === 'meta[name="staging-release"]' && options.staging ? {} : null,
    querySelectorAll: selector => selector === 'a[hreflang]' ? languageLinks : [],
    addEventListener(name, handler) { listeners.set(name, [...(listeners.get(name) ?? []), handler]); },
  };
  const browser = { location, document, URL, Date };
  browser.window = browser;
  function execute() {
    for (const [, attributes, body] of source.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)) {
      if (/type=["']application\/ld\+json/.test(attributes)) continue;
      const src = attributes.match(/src=["']([^"']+)/)?.[1];
      if (src?.startsWith('https://')) { loaded.push({ src }); continue; }
      const code = src ? readFileSync(new URL(src, new URL(`../${language}/interviews/tai-chi-business/index.html`, import.meta.url)), 'utf8') : body;
      runInNewContext(code, browser);
    }
  }
  execute();
  const calls = () => JSON.parse(JSON.stringify((browser.dataLayer ?? []).map(args => Array.from(args))));
  function click(href, inContact = true) {
    let prevented = false;
    const link = { getAttribute: () => href, closest: selector => selector === '.contact' && inContact ? {} : null };
    const event = { button: 0, target: { closest: () => link }, preventDefault() { prevented = true; } };
    for (const handler of listeners.get('click') ?? []) handler(event);
    return prevented;
  }
  return { browser, loaded, calls, click, execute, languageLinks };
}

test('both interview pages initialize one sanitized page view in the existing stream', () => {
  for (const language of ['ru', 'en']) {
    const result = visit(language);
    const configs = result.calls().filter(call => call[0] === 'config');
    assert.equal(configs.length, 1);
    assert.equal(configs[0][1], 'G-2Z5VJ13B20');
    assert.equal(configs[0][2].send_page_view, true);
    assert.equal(configs[0][2].page_location, `https://ivaikin.com/${language}/interviews/tai-chi-business/`);
    assert.equal(configs[0][2].page_referrer, 'https://t.me/');
    assert.equal(configs[0][2].allow_google_signals, false);
    assert.equal(configs[0][2].allow_ad_personalization_signals, false);
    assert.equal(configs[0][2].campaign_source, 'telegram');
    assert.equal(configs[0][2].campaign_name, 'tai_chi_business');
    assert.equal(result.loaded.length, 1);
    assert.equal(result.loaded[0].src, 'https://www.googletagmanager.com/gtag/js?id=G-2Z5VJ13B20');
  }
});

test('a contact click is recorded once without claiming a lead or blocking navigation', () => {
  const result = visit('en');
  assert.equal(result.click('https://t.me/timothyivaikin'), false);
  const events = result.calls().filter(call => call[0] === 'event');
  assert.equal(events.length, 1);
  assert.equal(events[0][1], 'contact_click');
  assert.deepEqual(events[0][2], {
    send_to: 'G-2Z5VJ13B20', channel: 'telegram', page_language: 'en',
    content_id: 'tai_chi_business', section: 'contact',
    page_location: 'https://ivaikin.com/en/interviews/tai-chi-business/',
    entry_source: 'telegram', entry_medium: 'social', entry_campaign: 'tai_chi_business', entry_content: 'announcement',
  });
});

test('entry attribution survives chapter navigation and duplicate script execution', () => {
  const result = visit();
  result.browser.location.search = '?t=1391';
  result.execute();
  result.click('https://t.me/timothyivaikin');
  assert.equal(result.loaded.length, 1);
  assert.equal(result.calls().filter(call => call[0] === 'config').length, 1);
  const events = result.calls().filter(call => call[0] === 'event');
  assert.equal(events.length, 1);
  assert.equal(events[0][2].entry_source, 'telegram');
});

test('switching language retains approved campaign attribution through the contact click', () => {
  const russian = visit('ru');
  const target = russian.languageLinks.map(link => new URL(link.getAttribute('href'), russian.browser.location))
    .find(url => url.pathname.startsWith('/en/'));
  assert.equal(target.searchParams.get('utm_source'), 'telegram');
  assert.equal(target.searchParams.get('email'), null);
  const english = visit('en', { href: target.href });
  english.click('https://t.me/timothyivaikin');
  const event = english.calls().find(call => call[0] === 'event');
  assert.equal(event[2].entry_source, 'telegram');
  assert.equal(event[2].entry_campaign, 'tai_chi_business');
  assert.equal(event[2].page_language, 'en');
});

test('unknown campaign data and private query or referrer paths never enter the event payload', () => {
  const result = visit('ru', {
    href: 'https://ivaikin.com/ru/interviews/tai-chi-business/?utm_source=private@example.com&utm_medium=+79991234567&utm_campaign=secret-project&utm_content=JohnDoe&utm_id=secret&utm_term=secret#private',
    referrer: 'https://example.org/private/person?email=private@example.com#secret',
  });
  result.click('https://t.me/timothyivaikin');
  const configs = result.calls().filter(call => call[0] === 'config');
  assert.equal(configs.length, 1);
  const config = configs[0][2];
  assert.equal(config.campaign_source, 'unattributed');
  assert.equal(config.campaign_medium, 'none');
  assert.equal(config.campaign_name, 'none');
  assert.equal(config.campaign_content, 'none');
  assert.equal(config.campaign_id, 'none');
  assert.equal(config.campaign_term, 'none');
  assert.equal(config.page_referrer, 'https://example.org/');
  assert.doesNotMatch(JSON.stringify(result.calls()), /private|secret|JohnDoe|79991234567/);
});

test('unrelated links and lookalike Telegram destinations are not contact events', () => {
  const result = visit();
  for (const href of ['https://youtube.com/watch?v=iZEOTTFmV8M', 'https://t.me/timothyivaikin_fake', 'https://t.me/another_person']) result.click(href);
  result.click('https://t.me/timothyivaikin', false);
  assert.equal(result.calls().filter(call => call[0] === 'event').length, 0);
});

test('local, staged and non-interview pages do not initialize production tracking', () => {
  for (const href of [
    'http://localhost:4173/ru/interviews/tai-chi-business/',
    'https://staging.edgefocus.io/ru/interviews/tai-chi-business/',
    'https://ivaikin.com/previews/ru/interviews/tai-chi-business/',
    'https://ivaikin.com/',
  ]) {
    const result = visit('ru', { href });
    assert.deepEqual(result.calls(), []);
    assert.equal(result.loaded.length, 0);
  }
  assert.deepEqual(visit('ru', { staging: true }).calls(), []);
  for (const language of ['ru', 'en']) {
    const staged = transformHtml(page(language), '/previews/ivaikin/test/', 'analytics-test');
    assert.deepEqual(visit(language, { html: staged }).calls(), []);
  }
});
