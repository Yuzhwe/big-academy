import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import vm from 'node:vm';
import {JSDOM,VirtualConsole} from 'jsdom';
import {userEvent} from '@testing-library/user-event';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=f=>fs.readFile(path.join(root,'dist',f),'utf8');
const pause=(ms=35)=>new Promise(r=>setTimeout(r,ms));
async function until(predicate){for(let i=0;i<50;i++){if(predicate())return;await pause(20);}assert(predicate(),'Expected UI state did not appear');}
async function surface(html,url,scripts){
  const errors=[],console=new VirtualConsole();
  console.on('jsdomError',e=>errors.push(String(e)));console.on('error',e=>errors.push(String(e)));
  const dom=new JSDOM(html,{url:'https://example.test/'+url,runScripts:'outside-only',pretendToBeVisual:true,virtualConsole:console});
  const w=dom.window,d=w.document;
  // DOM simulation only. These polyfills do not establish real browser layout,
  // fonts, focus geometry, scrolling, iframe loading, or visual approval.
  w.CSS={escape:s=>String(s).replace(/[^a-zA-Z0-9_-]/g,c=>'\\'+c),supports:()=>false};
  w.matchMedia=()=>({matches:false,addEventListener(){},removeEventListener(){},addListener(){},removeListener(){}});
  w.ResizeObserver=class{observe(){}unobserve(){}disconnect(){}};
  w.IntersectionObserver=class{observe(){}unobserve(){}disconnect(){}};
  w.HTMLElement.prototype.scrollIntoView=function(){};
  w.scrollTo=()=>{};
  w.HTMLElement.prototype.getAnimations=()=>[];
  w.HTMLDialogElement.prototype.showModal=function(){this.open=true};
  w.HTMLDialogElement.prototype.close=function(){this.open=false;this.dispatchEvent(new w.Event('close'))};
  Object.defineProperty(d,'fonts',{value:{load:async()=>[{}]}});
  w.fetch=async()=>({ok:true,json:async()=>JSON.parse(await read('icon-catalog.json'))});
  w.addEventListener('error',e=>errors.push(String(e.error)));
  for(const file of scripts)vm.runInContext(await read(file),dom.getInternalVMContext(),{filename:file});
  const user=userEvent.setup({document:d});
  const button=text=>[...d.querySelectorAll('button')].find(b=>b.textContent.trim()===text);
  const toggle=text=>[...d.querySelectorAll('label')].find(l=>l.textContent===text)?.querySelector('input');
  return {dom,w,d,user,button,toggle,errors};
}

test('all 13 component experiences: input, state, callbacks, modal, insertion and gates',async t=>{
  const s=await surface('<div id="root"></div>','playground/',['playground/lab.js']);t.after(()=>s.dom.window.close());
  const {d,user,button,toggle}=s;await until(()=>d.querySelector('.lab-app'));
  const select=async id=>{await user.selectOptions(d.querySelector('.lab-selection select'),id);await pause();};
  const log=()=>d.querySelector('.event-log').textContent;
  await user.click(button('继续学习'));await until(()=>d.querySelector('.lab-output').textContent.includes('1'));
  await user.click(button('继续学习'));assert.match(d.querySelector('.lab-output').textContent,/1/);
  await select('BA-UI-002');await user.click([...d.querySelectorAll('[role=tab]')].find(e=>e.textContent==='Phrases'));assert.match(d.querySelector('[role=tabpanel]').textContent,/in my opinion/);
  await user.click(toggle('禁用第三项'));assert.equal(d.querySelectorAll('[role=tab]')[2].getAttribute('aria-disabled'),'true');
  await select('BA-UI-003');await user.click(d.querySelectorAll('input[type=radio]')[1]);await user.click(button('查看反馈'));assert.match(d.querySelector('.choice-feedback').textContent,/选择了 B/);
  await select('BA-UI-004');await user.type(d.querySelector('textarea'),'Hello 写作');assert.match(d.querySelector('.field-meta').textContent,/8 字符/);await user.click(toggle('只读'));await user.type(d.querySelector('textarea'),'NO');assert.equal(d.querySelector('textarea').value,'Hello 写作');
  await select('BA-UI-005');await user.click(button('打开 对话框'));await until(()=>d.querySelector('[role=dialog]'));await user.click(button('确认'));await until(()=>!d.querySelector('[role=dialog]'));assert.match(log(),/onOpenChange · false/);
  for(const id of ['BA-UI-006','BA-WR-001']){await select(id);const tasks=[...d.querySelectorAll('.lab-canvas button')];const enabled=tasks.find(b=>!b.disabled&&b.getAttribute('aria-current')!=='step'&&!b.className.includes('back'));assert(enabled);await user.click(enabled);assert.match(log(),/onNavigate/);}
  await select('BA-UI-007');await user.selectOptions(d.querySelector('.lab-controls select'),'error');assert.match(d.querySelector('.sample-status').textContent,/需要检查/);
  await select('BA-WR-002');await user.click(button('Next'));assert.match(d.querySelector('.sample-field label').textContent,/第 2 步/);
  await select('BA-WR-003');const area=d.querySelector('textarea');area.focus();area.setSelectionRange(2,2);area.dispatchEvent(new s.w.Event('select',{bubbles:true}));await user.click(button('garden'));await until(()=>area.value.includes('garden'));assert.equal(area.value,'I garden think ');await user.click(toggle('词库锁定'));assert(button('garden').disabled);
  await select('BA-WR-004');await user.type(d.querySelector('.hamburger-layer input'),'My idea');assert.match(log(),/layer 1/);
  await select('BA-WR-005');await user.selectOptions(d.querySelector('.lab-controls select'),'locked');await user.click(button('未解锁'));assert.match(d.querySelector('.stair-notice').textContent,/已阻止进入/);
  await select('BA-WR-006');assert(button('还没到').disabled);await user.click(toggle('已完成单元'));await until(()=>d.querySelector('.milestone-canvas').textContent.includes('已庆祝 1 次'));await user.click(button('再看一次'));assert.match(d.querySelector('.milestone-canvas').textContent,/已庆祝 2 次/);
  assert.deepEqual(s.errors,[]);
});

test('portal catalogs filter, edit, preview and expose separate prototype pages',async t=>{
  const s=await surface(await read('index.html'),'#foundations',['data.js','system.js','assets/shell-icons.js','app.js','foundations.js']);t.after(()=>s.dom.window.close());
  const {w,d,user}=s;const route=async name=>{w.location.hash=name;await pause();};
  assert.equal(d.querySelectorAll('.foundation-card').length,12);
  await route('tokens');assert.equal(d.querySelectorAll('.token-card').length,12);assert.match(d.querySelector('#contrast-result').textContent,/AAA/);
  await user.selectOptions(d.querySelector('#contrast-fg'),'#FFFFFF');assert.match(d.querySelector('#contrast-result').textContent,/1.00 : 1/);
  await route('icons');await until(()=>d.querySelector('.icon-tile'));await user.type(d.querySelector('#icon-search'),'Book');assert([...d.querySelectorAll('.icon-tile')].every(e=>e.textContent.toLowerCase().includes('book')));await user.click(d.querySelector('.icon-tile'));assert(d.querySelector('#detail-dialog').open);assert(d.querySelector('#icon-large-preview svg'));d.querySelector('#detail-dialog').close();
  await route('typography');await user.clear(d.querySelector('#type-text'));await user.type(d.querySelector('#type-text'),'My Academy');assert.equal(d.querySelector('#type-sample').textContent,'My Academy');await user.click(d.querySelector('[data-font-role=zhheading]'));assert.match(d.querySelector('#font-load-status').textContent,/Douyin 未提供/);
  await route('components');assert.equal(d.querySelectorAll('.component-entry').length,13);await user.click(d.querySelector('[data-component="BA-WR-003"]'));assert.match(d.querySelector('.component-live-frame').src,/playground\/\?id=BA-WR-003/);d.querySelector('#detail-dialog').close();
  await route('writing');const prototypes=[...d.querySelectorAll('.prototype-card')];assert.equal(prototypes.length,3);for(const link of prototypes){assert.equal(link.target,'_blank');assert.match(link.rel,/noopener/);const file=new URL(link.href).pathname.replace(/^\//,'')+'index.html';await fs.access(path.join(root,'dist',file));}
  await route('deliveries');assert(d.querySelector('a[target="_blank"][href*="prototypes/writing/"]'));
  for(const routeName of ['overview','knowledge','layout','collaboration']){await route(routeName);assert(d.querySelector('#main').textContent.length>100);}
  assert.deepEqual(s.errors,[]);
});

test('Writing source runtime retains locked gate, opens a lesson and stores isolated progress',async t=>{
  const s=await surface(await read('prototypes/writing/index.html'),'prototypes/writing/?locale=zh',['prototypes/writing/app.js']);t.after(()=>s.dom.window.close());
  const {d,user}=s;await until(()=>d.querySelector('.course-app'));
  assert.equal(d.querySelector('.course-app').dataset.view,'path');
  const locked=d.querySelector('[data-testid="lesson-row"][data-state="locked"]');assert(locked);await user.click(locked);assert.equal(d.querySelector('.course-app').dataset.view,'path');assert(d.querySelector('[data-testid="locked-note"]'));
  await user.click(d.querySelector('[data-testid="lesson-row"][data-state="start"]'));await until(()=>d.querySelector('.course-app').dataset.view==='lesson');assert(d.querySelector('.lesson-workspace'));
  const next=d.querySelector('.lesson-workspace__navigation button:last-child')||[...d.querySelectorAll('button')].find(b=>b.querySelector('[data-testid]'));
  assert(next,'Lesson has primary action');await user.click(next);await pause();
  assert(Object.keys(s.w.localStorage).some(k=>k.startsWith('ba-hub-writing-v2:')));
  assert(Object.keys(s.w.localStorage).every(k=>k.startsWith('ba-hub-writing-v2:')));
  await user.click(d.querySelector('#reset-prototype'));assert(d.querySelector('#reset-dialog').open);await user.click(d.querySelector('#cancel-reset'));assert(!d.querySelector('#reset-dialog').open);
  assert.deepEqual(s.errors,[]);
});
