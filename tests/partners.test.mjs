import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {test} from 'node:test';
test('all homepages provide a localized partner programme link without replacing direct contact',async()=>{
  for(const locale of ['','ru/','es/','zh/']) {
    const html=await readFile(new URL(`../${locale}index.html`,import.meta.url),'utf8');
    const route=locale==='ru/'?'ru/partners/':'partners/';
    assert.ok(html.includes(`https://edgeivaikin.com/${route}?utm_source=ivaikin&amp;utm_medium=website&amp;utm_campaign=edge-partners-202610&amp;utm_content=page`));
    assert.match(html,/mailto:hello@edgeivaikin.com\?subject=/);
    assert.match(html,/https:\/\/t.me\/timothyivaikin/);
  }
});
