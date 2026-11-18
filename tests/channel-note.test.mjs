import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { telegramChannelUrl } from '../content/home.mjs';

const page = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('E3 channel note: RU and EN homepages link to the channel constant; ES and ZH and personal contacts are unchanged', () => {
  assert.equal(telegramChannelUrl, 'https://t.me/timothy_ivaikin_ru');
  const expected = {
    'index.html': ['Notes on data, integrations and acceptance of IT projects:', 'Telegram channel (in Russian)'],
    'ru/index.html': ['Заметки о данных, интеграциях и приемке IT-проектов:', 'Telegram-канал'],
  };
  for (const [file, [text, label]] of Object.entries(expected)) {
    const html = page(file);
    assert.equal(html.split('class="channel-note"').length - 1, 1, file);
    assert.ok(html.includes(`<p class="channel-note">${text} <a href="${telegramChannelUrl}" target="_blank" rel="noopener">${label}</a></p>`), file);
    assert.ok(html.indexOf('class="channel-note"') > html.indexOf('id="contact"'), `${file}: inside the contact section`);
    assert.ok(html.includes('href="https://t.me/timothyivaikin"'), `${file}: personal Telegram unchanged`);
  }
  for (const file of ['es/index.html', 'zh/index.html']) assert.ok(!page(file).includes('channel-note'), file);
});
