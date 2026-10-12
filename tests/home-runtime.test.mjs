import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const source=()=>readFileSync(new URL('../assets/front/home.js',import.meta.url),'utf8');
function run(href,script='https://ivaikin.com/assets/front/home.js',gtag,copyUI={},clipboard){
  const redirects=[];const handlers={};const events=[];
  const window={location:{href,replace:uri=>redirects.push(uri)},gtag};
  const document={querySelector:selector=>copyUI[selector]??null,currentScript:{src:script},documentElement:{lang:'ru'},addEventListener:(name,callback)=>handlers[name]=callback,dispatchEvent:e=>events.push(e)};
  vm.runInNewContext(source(),{window,document,navigator:{clipboard},URL,CustomEvent:class{constructor(type,args){this.type=type;Object.assign(this,args)}}});
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
test('legacy testimonial links reach the restored recommendations in every locale',()=>{
  assert.deepEqual(run('https://ivaikin.com/ru/#testimonials').redirects,[]);
  assert.deepEqual(run('https://ivaikin.com/?lang=ru&utm_source=reference#testimonials').redirects,['https://ivaikin.com/ru/?utm_source=reference#testimonials']);
  assert.deepEqual(run('https://preview.example/previews/ivaikin/test/?lang=zh#testimonials','https://preview.example/previews/ivaikin/test/assets/front/home.js').redirects,['https://preview.example/previews/ivaikin/test/zh/#testimonials']);
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

function copyFixture(clipboard) {
  const listeners = {};
  const button = {hidden:true,disabled:false,dataset:{success:'Copied. Paste into a message.',error:'Select and copy the brief.'},addEventListener:(name,callback)=>listeners[name]=callback};
  const template = {value:'Company: \nNeeded result: \n',focused:false,selected:false,focus(){this.focused=true},select(){this.selected=true}};
  const status = {textContent:''};
  run('https://ivaikin.com/ru/',undefined,undefined,{'[data-copy-brief]':button,'#project-brief-template':template,'#brief-copy-status':status},clipboard);
  return {button,template,status,click:()=>listeners.click()};
}
test('copy brief waits for clipboard confirmation before reporting success',async()=>{
  let finish; const writes=[];
  const ui=copyFixture({writeText:text=>{writes.push(text);return new Promise(resolve=>finish=resolve)}});
  assert.equal(ui.button.hidden,false);
  const pending=ui.click();
  assert.deepEqual(writes,['Company: \nNeeded result: \n']);
  assert.equal(ui.status.textContent,'');
  assert.equal(ui.button.disabled,true);
  finish();await pending;
  assert.equal(ui.status.textContent,'Copied. Paste into a message.');
  assert.equal(ui.button.disabled,false);
});
test('denied or unavailable clipboard selects the visible brief without claiming success',async()=>{
  for(const clipboard of [undefined,{writeText:async()=>{throw Error('Denied')}}]) {
    const ui=copyFixture(clipboard);
    await ui.click();
    assert.equal(ui.status.textContent,'Select and copy the brief.');
    assert.equal(ui.template.focused,true);
    assert.equal(ui.template.selected,true);
    assert.equal(ui.button.disabled,false);
  }
});
