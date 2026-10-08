import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, readdir, rm, writeFile, chmod } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { validateConfig, transformHtml, transformScript, packageSite, sshArgs, remoteUploadCommand } from '../scripts/staging-lib.mjs';
import { runInNewContext } from 'node:vm';
import { spawnSync } from 'node:child_process';

const token='Abc123_xYz456-'.repeat(2)+'abcd';
const config={sshHost:'45.159.208.95',sshUser:'root',sshKeyPath:"/tmp/Timothy's key",origin:'https://staging.edgefocus.io',token};
const prefix=`/previews/ivaikin/${token}/`;

test('staging rejects hostile identifiers before any executable or network call',()=>{
  assert.equal(validateConfig(config).prefix,prefix);
  assert.equal(validateConfig(config).sshKeyPath,"/tmp/Timothy's key");
  for(const [key,value] of [['sshHost','server; touch /tmp/pwn'],['sshUser','root$(id)'],['token','../escape'],['origin','http://example.com'],['origin','https://example.com/other']]) {
    assert.throws(()=>validateConfig({...config,[key]:value}));
  }
});

test('fake SSH receives apostrophes literally; hostile identifiers never reach an executable',async()=>{
  const target=await mkdtemp(resolve(tmpdir(),'ivaikin-fake-ssh-'));
  try {
    const fake=resolve(target,'ssh');
    await writeFile(fake,`#!${process.execPath}\nconsole.log(JSON.stringify(process.argv.slice(2)));\n`);
    await chmod(fake,0o700);
    const args=sshArgs(config,remoteUploadCommand('safe-release'));
    const result=spawnSync(fake,args,{encoding:'utf8'});
    assert.equal(result.status,0);
    assert.equal(JSON.parse(result.stdout)[1],"/tmp/Timothy's key");
    let invoked=false;
    assert.throws(()=>{const args=sshArgs({...config,sshHost:'host; touch /tmp/unsafe'},'true');invoked=true;spawnSync(fake,args);});
    assert.equal(invoked,false);
    assert.throws(()=>remoteUploadCommand('release$(touch /tmp/unsafe)'));
  } finally {await rm(target,{recursive:true,force:true});}
});

test('staging HTML prevents indexing and keeps all local navigation under the capability prefix',()=>{
  const input='<html><head><meta name="robots" content="index, follow"><link rel="canonical" href="https://ivaikin.com/ru/"><link rel="stylesheet" href="/assets/home/home.css"></head><body><a href="/ru/">RU</a><a href="https://ivaikin.com/en/interviews/tai-chi-business/">Interview</a><img src="/assets/home/timothy-ivaikin.jpg"><a href="https://t.me/timothyivaikin">Contact</a></body></html>';
  const html=transformHtml(input,prefix,'test-release');
  assert.match(html,/name="robots" content="noindex, nofollow, noarchive"/);
  assert.match(html,/name="referrer" content="no-referrer"/);
  assert.ok(html.includes(`href="${prefix}ru/"`));
  assert.ok(html.includes(`href="${prefix}en/interviews/tai-chi-business/"`));
  assert.ok(html.includes(`src="${prefix}assets/home/timothy-ivaikin.jpg"`));
  assert.ok(html.includes('rel="canonical" href="https://ivaikin.com/ru/"'));
  assert.ok(html.includes('href="https://t.me/timothyivaikin"'));
});

test('legacy language redirects stay inside staging and preserve query and target',async()=>{
  const source=await readFile(new URL('../assets/home/home.js',import.meta.url),'utf8');
  const output=transformScript(source,prefix);
  const redirects=[];
  runInNewContext(output,{URL,window:{location:{href:`https://staging.edgefocus.io${prefix}?lang=ru&utm_source=test#apply`,replace:url=>redirects.push(url)}}});
  assert.deepEqual(redirects,[`https://staging.edgefocus.io${prefix}ru/?utm_source=test#contact`]);
});

test('staging package contains public artifacts only and retains both interviews',async()=>{
  const target=await mkdtemp(resolve(tmpdir(),"ivaikin's-staging-test-"));
  try {
    const release='20261008-test';
    await packageSite(resolve(import.meta.dirname,'..'),target,validateConfig(config),release,'0123456');
    const roots=await readdir(target);
    for(const forbidden of ['content','scripts','tests','.git','CNAME','sitemap.xml','README.md','.staging']) assert.ok(!roots.includes(forbidden),forbidden);
    for(const path of ['index.html','ru/index.html','es/index.html','zh/index.html','en/interviews/tai-chi-business/index.html','ru/interviews/tai-chi-business/index.html']) {
      const text=await readFile(resolve(target,path),'utf8');
      assert.ok(text.includes('noindex, nofollow, noarchive'),path);
      assert.ok(!/(?:href|src)="\/(?!previews\/)/.test(text),path+' leaked a root URL');
    }
    const meta=JSON.parse(await readFile(resolve(target,'release.json'),'utf8'));
    assert.equal(meta.release,release);
    assert.equal(meta.sourceCommit,'0123456');
  } finally {await rm(target,{recursive:true,force:true});}
});
