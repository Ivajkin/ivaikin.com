import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const source=()=>readFileSync(new URL('../assets/front/home.js',import.meta.url),'utf8');
function run(href,script='https://ivaikin.com/assets/front/home.js',gtag){
  const redirects=[];const handlers={};const events=[];
  const window={location:{href,replace:uri=>redirects.push(uri)},gtag};
  const document={currentScript:{src:script},documentElement:{lang:'ru'},addEventListener:(name,callback)=>handlers[name]=callback,dispatchEvent:e=>events.push(e)};
  vm.runInNewContext(source(),{window,document,URL,CustomEvent:class{constructor(type,args){this.type=type;Object.assign(this,args)}}});
  return {redirects,handlers,events};
}
test('legacy language and anchor links preserve campaign parameters without redirect loops',()=>{
  const result=run('https://ivaikin.com/?lang=ru&utm_source=example#apply');
  assert.deepEqual(result.redirects,['https://ivaikin.com/ru/?utm_source=example#contact']);
  assert.deepEqual(run('https://ivaikin.com/ru/?utm_source=example#contact').redirects,[]);
  assert.deepEqual(run('https://ivaikin.com/?lang=invalid').redirects,[]);
});
test('language query remains in isolated staging preview',()=>{
  const result=run('https://preview.example/previews/ivaikin/test/?lang=zh#pillars','https://preview.example/previews/ivaikin/test/assets/front/home.js');
  assert.deepEqual(result.redirects,['https://preview.example/previews/ivaikin/test/zh/#work']);
});
test('contact click records intent only, without reporting a submitted lead or personal content',()=>{
  const calls=[];const result=run('https://ivaikin.com/ru/',undefined,(...args)=>calls.push(args));
  const link={getAttribute:()=> 'mailto:hello@edgeivaikin.com?body=private%20message',closest:()=>({id:'contact'})};
  result.handlers.click({target:{closest:()=>link}});
  assert.deepEqual(JSON.parse(JSON.stringify(calls)),[['event','contact_click',{channel:'email',page_language:'ru',section:'contact'}]]);
  assert.equal(JSON.stringify(calls).includes('private'),false);
});
test('contact navigation works when analytics is blocked or absent',()=>{
  const result=run('https://ivaikin.com/ru/');
  const link={getAttribute:()=> 'https://t.me/timothyivaikin',closest:()=>({id:'contact'})};
  assert.doesNotThrow(()=>result.handlers.click({target:{closest:()=>link}}));
  assert.deepEqual(result.redirects,[]);
});
