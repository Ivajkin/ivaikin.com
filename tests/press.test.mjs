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
 const xml=await read('sitemap.xml');for(const path of ['press/','ru/press/','es/press/','zh/press/','press/corporate-culture-2026-11-13/','ru/press/corporate-culture-2026-11-13/'])assert.equal(xml.split('<loc>https://ivaikin.com/'+path+'</loc>').length-1,1);
});
