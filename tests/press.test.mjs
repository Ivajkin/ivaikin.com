import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const read=p=>readFile(new URL('../'+p,import.meta.url),'utf8');
test('editors can find language-specific media contacts and public biography downloads',async()=>{
 for(const [lang,path] of Object.entries({en:'press/',ru:'ru/press/',es:'es/press/',zh:'zh/press/'})){
  const page=await read(path+'index.html');assert.match(page,new RegExp(`<html lang="${lang}"`));assert.ok(page.includes('https://ivaikin.com/'+path));assert.match(page,/mailto:hello@edgeivaikin\.com\?subject=/);assert.match(page,/assets\/press\/biography-(en|ru)\.txt/);assert.match(page,/hreflang="x-default"/);
  const home=await read((lang==='en'?'':lang+'/')+'index.html');assert.ok(home.includes('href="/'+path+'"'));
  for(const forbidden of ['edgefocus.ru/tasks/','/Users/','SOURCECUTOFF'])assert.ok(!page.includes(forbidden),forbidden);
 }
});
test('new factual release preserves event and publication dates and does not duplicate legal claims',async()=>{
 for(const lang of ['en','ru']){
  const base=lang==='en'?'press/':'ru/press/';const page=await read(base+'corporate-culture-2026-11-13/index.html');
  assert.match(page,/2026-11-13/);assert.match(page,/2026-11-14/);assert.match(page,/application\/ld\+json/);assert.ok(page.includes('https://ivaikin.com/'+base+'corporate-culture-2026-11-13/'));
  assert.doesNotMatch(page,/https:\/\/edgefocus.ru\/tasks\//);
 }
 const xml=await read('sitemap.xml');for(const path of ['press/','ru/press/','es/press/','zh/press/','press/corporate-culture-2026-11-13/','ru/press/corporate-culture-2026-11-13/','press/roirate-antikrizis-2026-11-13/','ru/press/roirate-antikrizis-2026-11-13/','ru/blog/antikrizis-produkt-2026/'])assert.equal(xml.split('<loc>https://ivaikin.com/'+path+'</loc>').length-1,1);
});
test('Roirate anti-crisis release keeps the approved wording and publication date',async()=>{
 const banned=/спикер|выступил|эксперт|Прогресс|SFIT|[ёЁ—–]/;
 for(const lang of ['en','ru']){
  const base=lang==='en'?'press/':'ru/press/';
  const page=await read(base+'roirate-antikrizis-2026-11-13/index.html');
  const txt=await read(`assets/press/roirate-antikrizis-2026-11-13-${lang}.txt`);
  assert.match(page,/datetime="2026-11-13"/);
  assert.match(page,/datetime="2026-11-27"/);
  assert.match(page,/datePublished":"2026-11-27"/);
  assert.ok(page.includes(`/assets/press/roirate-antikrizis-2026-11-13-${lang}.txt`));
  assert.ok(page.includes('/assets/press/roirate-antikrizis-2026-11-13-01.jpg'));
  assert.ok(page.includes('Фото: Roirate')||page.includes('Photo: Roirate'));
  assert.doesNotMatch(page,banned);
  assert.doesNotMatch(txt,banned);
  assert.ok(txt.includes(lang==='ru'?'Дата публикации: 27 ноября 2026':'Publication date: 27 November 2026'));
 }
 const blog=await read('ru/blog/antikrizis-produkt-2026/index.html');
 const index=await read('ru/blog/index.html');
 assert.match(blog,/datetime="2026-11-27"/);
 assert.ok(blog.includes('/assets/press/roirate-antikrizis-2026-11-13-02.jpg'));
 assert.ok(blog.includes('Конференция «Антикризис 2026», 13 ноября 2026. Фото: Roirate'));
 assert.ok(index.includes('href="/ru/blog/antikrizis-produkt-2026/"'));
 assert.ok(index.includes('/assets/press/roirate-antikrizis-2026-11-13-01.jpg'));
 assert.doesNotMatch(blog,banned);
 assert.doesNotMatch(index,banned);
});
