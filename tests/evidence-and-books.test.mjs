import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, existsSync, mkdtempSync, cpSync, rmSync} from 'node:fs';
import {resolve} from 'node:path';
import {tmpdir} from 'node:os';
import {execFileSync} from 'node:child_process';
import {packageSite} from '../scripts/staging-lib.mjs';

const ROOT=resolve(import.meta.dirname,'..');
const read=p=>readFileSync(resolve(ROOT,p),'utf8');
const languages=['en','ru','es','zh'];
const prefix=lang=>lang==='en'?'':lang+'/';
const books=['good-results','shattering-limits'];

test('all languages offer owned book pages through both covers and book-detail links',()=>{
  for(const lang of languages){
    for(const page of [`${prefix(lang)}index.html`,`${prefix(lang)}about/index.html`]){
      const html=read(page);
      for(const slug of books){
        const route=`/${prefix(lang)}books/${slug}/`;
        assert.ok(html.includes(`href="${route}"`),`${page}: missing owned page ${route}`);
        assert.match(html,new RegExp(`<a[^>]+href="${route}"[^>]*><img[^>]+src="/assets/books/${slug}\\.jpg"`));
      }
      assert.ok(html.includes('The Path of Progress'),'Explain cover title alongside catalog title');
    }
  }
});

test('each book page has useful localized content, canonical metadata, sources and real reading access',()=>{
  for(const lang of languages)for(const slug of books){
    const route=`/${prefix(lang)}books/${slug}/`;
    const file=`${prefix(lang)}books/${slug}/index.html`;
    assert.ok(existsSync(resolve(ROOT,file)),`${file} is missing`);
    const html=read(file);
    assert.ok(html.includes(`<html lang="${lang}">`));
    assert.ok(html.includes(`<link rel="canonical" href="https://ivaikin.com${route}">`));
    assert.equal((html.match(/<h1\b/g)??[]).length,1);
    for(const code of languages)assert.ok(html.includes(`hreflang="${code}" href="https://ivaikin.com/${prefix(code)}books/${slug}/"`));
    const schema=JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
    assert.equal(schema['@type'],'Book');
    assert.equal(schema.author['@id'],'https://ivaikin.com/#person');
    assert.ok(html.includes(`href="/${prefix(lang)}#ideas"`));
    assert.doesNotMatch(html,/drive\.google\.com|docs\.google\.com|staging\.edgefocus|EDGE_TOKEN|PENDING|TODO|TBD/);
    if(slug==='good-results'){
      assert.ok(html.includes('https://www.amazon.com/dp/B07N4R52H2'));
      assert.ok(html.includes('https://www.amazon.com/dp/1795182989'));
      assert.match(html,/<blockquote[^>]*lang="en"/);
      assert.ok(html.includes('Plan rituals, do rituals. Program/design systems - get results.'));
      assert.ok(html.includes('1795182989'));
    }else{
      assert.ok(html.includes('The Path of Progress'));
      assert.ok(html.includes('https://books.google.com/books?id=2NuiEAAAQBAJ'));
      assert.ok(html.includes('https://play.google.com/store/books/details?id=2NuiEAAAQBAJ'));
    }
    if(lang==='ru')assert.match(html,/книг|Книг/);
    if(lang==='zh')assert.ok((html.match(/\p{Script=Han}/gu)??[]).length>100);
  }
});

test('homepage explains three distinct cases, recommendation context and the first contact step',()=>{
  for(const lang of languages){
    const html=read(`${prefix(lang)}index.html`);
    assert.equal((html.match(/class="case-example"/g)??[]).length,3);
    for(const id of ['discover-culture','infijoy','edgefocus'])assert.ok(html.includes(`/cases/#${id}`));
    for(const entity of ['Enlightened Ventures LLC-FZ','Infijoy DMCC'])assert.ok(html.includes(entity));
    assert.ok(html.includes('class="recommendation-context"'));
    assert.ok(html.includes('class="contact-next"'));
    for(const intent of ['project','partnership','media'])assert.ok(html.includes(`data-contact-intent="${intent}"`));
    assert.ok(html.includes('https://www.linkedin.com/in/timothyivaikin/details/recommendations/?detailScreenTabIndex=0'));
  }
});

test('recognition issuer stays contextual without a nested complementary landmark',()=>{
  for(const lang of ['ru','en']){
    const html=read(`${lang}/recognition/nasledie-mira-2026/index.html`);
    assert.doesNotMatch(html,/<aside\b[^>]*class="recognition-issuer"/);
    assert.ok(html.includes('class="recognition-issuer"'));
  }
});

test('complete builds retain every owned book URL exactly once in the sitemap',()=>{
  const target=mkdtempSync(resolve(tmpdir(),'ivaikin-books-build-'));
  try{
    for(const p of ['scripts','content','assets','about','ru','es','zh','en','books','sitemap.xml']){
      if(existsSync(resolve(ROOT,p)))cpSync(resolve(ROOT,p),resolve(target,p),{recursive:true});
    }
    for(let i=0;i<2;i++){
      execFileSync(process.execPath,['scripts/build.mjs'],{cwd:target});
      execFileSync(process.execPath,['scripts/build-home.mjs'],{cwd:target});
      execFileSync(process.execPath,['scripts/build-recognition.mjs'],{cwd:target});
      execFileSync(process.execPath,['scripts/build-books.mjs'],{cwd:target});
      const urls=[...readFileSync(resolve(target,'sitemap.xml'),'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map(x=>x[1]);
      assert.equal(urls.length,new Set(urls).size);
      for(const lang of languages)for(const slug of books)assert.ok(urls.includes(`https://ivaikin.com/${prefix(lang)}books/${slug}/`));
    }
  }finally{rmSync(target,{recursive:true,force:true});}
});

test('staging includes all book pages and keeps navigation and assets inside the preview',async()=>{
  const target=mkdtempSync(resolve(tmpdir(),'ivaikin-books-staging-'));
  const token='x'.repeat(32), base=`/previews/ivaikin/${token}/`;
  try{
    await packageSite(ROOT,target,{sshHost:'example.test',sshUser:'deploy',sshKeyPath:'/tmp/key',origin:'https://preview.example',token},'books-test','0123456');
    for(const lang of languages)for(const slug of books){
      const p=`${prefix(lang)}books/${slug}/index.html`;
      const html=readFileSync(resolve(target,p),'utf8');
      assert.ok(html.includes(`src="${base}assets/books/${slug}.jpg"`));
      assert.ok(html.includes(`href="${base}${prefix(lang)}#ideas"`));
      assert.ok(html.includes('noindex'));
    }
    assert.ok(existsSync(resolve(target,'assets/books/books.css')));
  }finally{rmSync(target,{recursive:true,force:true});}
});
