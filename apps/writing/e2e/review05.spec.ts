import {test,expect,type Page} from '@playwright/test';
import {mkdirSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
const dir=resolve(import.meta.dirname,'../docs/evidence/review05');mkdirSync(dir,{recursive:true});
const lib=process.env.BA_LIBRARY_URL??'http://127.0.0.1:6007/';
const primary=(p:Page)=>p.getByTestId('lesson-footer').getByRole('button').last();
const next=async(p:Page)=>{await primary(p).click();};
const options=(p:Page)=>p.locator('.ba-choice__option');
const shot=async(p:Page,n:string)=>{await p.evaluate(()=>window.scrollTo(0,0));await p.evaluate(()=>new Promise<void>(done=>requestAnimationFrame(()=>requestAnimationFrame(()=>done()))));await p.screenshot({path:resolve(dir,n+'.png'),fullPage:true});};
const stored=(p:Page)=>p.evaluate(()=>({learning:localStorage.getItem('g2o_unit_state_v4'),receipts:localStorage.getItem('ba_writing_milestone_receipts_v1'),other:localStorage.getItem('unrelated-review05')}));
async function start(p:Page){await p.goto('/?start=lesson');await expect(p.getByTestId('activity')).toBeVisible();}
async function reset(p:Page){await p.getByRole('button',{name:'Reset Lesson',exact:true}).click();await p.getByRole('button',{name:'Enter Test Mode',exact:true}).click();await expect(p.getByRole('region',{name:'Test Mode'})).toBeVisible();}
async function finish(p:Page){
 await next(p);await options(p).nth(1).click();await next(p);await next(p);
 await p.getByRole('button',{name:'believe',exact:true}).click();await next(p);await next(p);
 for(const i of [0,2,4])await options(p).nth(i).click();await next(p);await next(p);
 for(const word of ['our','school','should','have','a','garden','for','two','big','reasons','.'])await p.locator('.word-grid__card').filter({has:p.locator('.word-grid__text',{hasText:new RegExp('^'+word.replace('.','\\.')+'$')})}).click();
 await next(p);const blanks=p.getByTestId('frame').locator('input');await blanks.nth(0).fill('be longer');await blanks.nth(1).fill('kids need time to run');await next(p);await next(p);
 await p.getByTestId('writing-canvas').fill('Our school should have a garden for learning.\nI believe a garden gives us fresh food.\nIn my opinion the school garden is the best place to relax.');await next(p);await next(p);
 await options(p).nth(1).click();await next(p);await options(p).nth(2).click();await next(p);await p.getByRole('button',{name:'should',exact:true}).click();await next(p);
 await p.getByTestId('writing-canvas').fill('I believe kids should have pets at home.');await next(p);await expect(p.getByTestId('check-results')).toContainText('You passed');await next(p);
 await expect(p.locator('.course-app')).toHaveAttribute('data-view','lessonEnd');
}
test.use({video:'on'});

test('Reset Lesson isolates a full eight-screen test, completion, navigation and reload',async({page})=>{
 await page.addInitScript(()=>localStorage.setItem('unrelated-review05','keep'));
 await start(page);await next(page);await options(page).nth(0).click();await next(page);await page.getByRole('button',{name:'Need a hint?',exact:true}).click();
 const before=await stored(page);
 await page.getByRole('button',{name:'Reset Lesson',exact:true}).click();await page.getByRole('button',{name:'Cancel',exact:true}).click();expect(await stored(page)).toEqual(before);
 const resetButton=page.getByRole('button',{name:'Reset Lesson',exact:true});await resetButton.focus();await page.keyboard.press('Enter');await expect(page.getByRole('dialog')).toBeVisible();await page.keyboard.press('Escape');await expect(page.getByRole('dialog')).toHaveCount(0);await expect(resetButton).toBeFocused();
 await reset(page);await expect(page.locator('[data-task-index="0"]').first()).toHaveAttribute('aria-current','step');
 await expect(page.locator('[data-task-index="1"]').first()).toBeDisabled();await shot(page,'test-mode-first');
 await finish(page);expect(await stored(page)).toEqual(before);await shot(page,'test-mode-completed');
 await page.getByRole('button',{name:'Exit Test',exact:true}).click();
 await expect(page.getByTestId('feedback')).toContainText('You chose A');await expect(page.getByTestId('hint')).toHaveCount(1);expect(await stored(page)).toEqual(before);
 await reset(page);await next(page);await options(page).nth(1).click();await next(page);
 await page.getByRole('button',{name:'Back to my path',exact:true}).click();await expect(page.getByRole('region',{name:'Test Mode'})).toBeVisible();
 expect(await stored(page)).toEqual(before);await page.reload();await expect(page.getByRole('region',{name:'Test Mode'})).toHaveCount(0);const reloaded=await stored(page);const original=JSON.parse(before.learning!);const restored=JSON.parse(reloaded.learning!);delete original.events;delete restored.events;expect(restored).toEqual(original);expect(reloaded.receipts).toBe(before.receipts);expect(reloaded.other).toBe(before.other);
 writeFileSync(resolve(dir,'reset-isolation.json'),JSON.stringify({fullLesson:true,exitRestores:true,backToPath:true,refreshDropsTest:true,formalRecordUnchanged:true,unrelatedKeyPreserved:true},null,2));
});

test('completed lesson retest and closing the test page preserve real completion',async({page,context})=>{
 await start(page);await finish(page);await page.getByTestId('lesson-footer').getByRole('button',{name:'Back to my path',exact:true}).click();await page.locator('[data-lesson-focus="G2-O:1"]').click();
 const before=await stored(page);await reset(page);await expect(page.locator('[data-task-index="1"]').first()).toBeDisabled();await next(page);await options(page).nth(0).click();await next(page);
 expect(await stored(page)).toEqual(before);await page.close();const reopened=await context.newPage();await reopened.goto('/');await expect(reopened.getByRole('region',{name:'Test Mode'})).toHaveCount(0);expect(await stored(reopened)).toEqual(before);
 await expect(reopened.locator('[data-lesson-id="G2-O:1"]')).toHaveAttribute('data-state','review');await reopened.close();
});

test('Coach audio shares one owner, reads only body, handles errors and stops across mode/navigation',async({page})=>{
 await page.addInitScript(()=>{
  const log={spoken:[] as {text:string;lang:string}[],cancelled:0,last:null as any};(window as any).__speech=log;
  Object.defineProperty(window,'SpeechSynthesisUtterance',{configurable:true,value:class{lang='';onend:any;onerror:any;constructor(public text:string){}}});
  Object.defineProperty(window,'speechSynthesis',{configurable:true,value:{cancel(){log.cancelled++;},speak(u:any){log.spoken.push({text:u.text,lang:u.lang});log.last=u;}}});
 });
 await start(page);const cards=page.locator('.lesson-workspace__message'),audio=cards.first().getByRole('button');
 await audio.click();await expect(audio).toHaveAttribute('aria-pressed','true');
 expect(await page.evaluate(()=>(window as any).__speech.spoken.at(-1).text)).toBe((await cards.first().locator('.lesson-workspace__message-body').innerText()).trim());
 expect(await audio.locator('.ba-button__assembly').evaluate(e=>({width:e.getBoundingClientRect().width,height:e.getBoundingClientRect().height}))).toEqual({width:36,height:36});
 await audio.click();await expect(audio).toHaveAttribute('aria-pressed','false');
 await audio.click();await page.getByRole('button',{name:'Listen to the prompt',exact:true}).click();await expect(audio).toHaveAttribute('aria-pressed','false');
 await audio.click();await next(page);await expect(page.locator('.coach-audio[aria-pressed="true"]')).toHaveCount(0);
 await page.getByRole('button',{name:'Need a hint?',exact:true}).click();await page.locator('.coach-audio').first().click();const hint=page.getByTestId('hint').getByRole('button');await hint.click();await expect(page.locator('.coach-audio[aria-pressed="true"]')).toHaveCount(1);await expect(hint).toHaveAttribute('aria-pressed','true');
 await page.evaluate(()=>(window as any).__speech.last.onerror());await expect(hint).toHaveAttribute('aria-pressed','false');await hint.focus();await page.keyboard.press('Enter');await expect(hint).toHaveAttribute('aria-pressed','true');
 await reset(page);await expect(page.locator('[aria-pressed="true"].coach-audio')).toHaveCount(0);await page.locator('.coach-audio').first().click();await page.getByRole('button',{name:'Exit Test',exact:true}).click();await expect(page.locator('[aria-pressed="true"].coach-audio')).toHaveCount(0);
 await page.getByRole('button',{name:'Back to my path',exact:true}).click();await expect.poll(()=>page.evaluate(()=>(window as any).__speech.cancelled)).toBeGreaterThan(3);
 await page.getByRole('button',{name:'中文',exact:true}).click();await page.locator('[data-lesson-focus="G2-O:1"]').click();await page.locator('.coach-audio').first().click();expect(await page.evaluate(()=>(window as any).__speech.spoken.at(-1).lang)).toBe('zh-CN');
 await shot(page,'coach-audio-zh');writeFileSync(resolve(dir,'speech.json'),JSON.stringify(await page.evaluate(()=>(window as any).__speech),null,2));
});

test('unsupported speech stays safe without changing learning or controls',async({page})=>{
 await page.addInitScript(()=>Object.defineProperty(window,'speechSynthesis',{configurable:true,value:undefined}));await start(page);const before=await stored(page);await page.locator('.coach-audio').first().click();await expect(page.locator('.coach-audio').first()).toHaveAttribute('aria-pressed','false');expect(await stored(page)).toEqual(before);await expect(primary(page)).toBeEnabled();
});

test('TopBar hugs G2-O, ellipsizes long titles and avoids progress overlap across widths',async({page})=>{
 const measurements=[];
 for(const width of [1440,1024,834,390])for(const sample of ['standard','long']){
  await page.setViewportSize({width,height:width===834?1112:900});await page.goto(`${lib}?view=components&component=topbar&sample=${sample}`);
  const bar=page.locator('.lesson-topbar');await expect(bar.locator('.lesson-topbar__tag')).toHaveText('G2-O');await expect(bar.getByText('G2-O',{exact:true})).toHaveCount(1);
  const result=await bar.evaluate(el=>{const q=(s:string)=>el.querySelector(s)!;const rect=(s:string)=>q(s).getBoundingClientRect();const name=rect('.lesson-topbar__name'),tag=rect('.lesson-topbar__tag'),center=rect('.lesson-topbar__center'),title=rect('.lesson-topbar__title');return {nameWidth:name.width,tagWidth:tag.width,gap:tag.left-name.right,sameRow:tag.top<title.bottom&&tag.bottom>title.top,progressOverlap:Math.max(0,Math.min(title.right,center.right)-Math.max(title.left,center.left))*Math.max(0,Math.min(title.bottom,center.bottom)-Math.max(title.top,center.top)),ellipsis:q('.lesson-topbar__name').scrollWidth>q('.lesson-topbar__name').clientWidth};});
  expect(result.sameRow).toBe(true);expect(result.gap).toBeLessThan(10);expect(result.nameWidth).toBeGreaterThan(10);expect(result.progressOverlap).toBe(0);if(sample==='long')expect(result.ellipsis).toBe(true);if(sample==='standard'&&width===1440)expect(result.ellipsis).toBe(false);measurements.push({width,sample,...result});await shot(page,`topbar-${sample}-${width}`);
 }
 writeFileSync(resolve(dir,'topbar.json'),JSON.stringify(measurements,null,2));
});

test('Unit badge parallax and independent 7s shine, original layered art and silver semantics',async({page})=>{
 await page.emulateMedia({reducedMotion:'no-preference'});await page.goto(`${lib}?view=components&component=milestone&mode=state&state=completed`);const root=page.locator('.unit-milestone'),button=page.getByTestId('milestone');await expect(button).toBeEnabled();
 const box=(await root.boundingBox())!;await page.mouse.move(box.x+box.width*.85,box.y+box.height*.3);await page.waitForTimeout(350);
 const before=await root.evaluate(e=>({base:getComputedStyle(e.querySelector('img')!).transform,front:getComputedStyle(e.querySelectorAll('img')[1]).transform,baseX:new DOMMatrixReadOnly(getComputedStyle(e.querySelector('img')!).transform).m41,frontX:new DOMMatrixReadOnly(getComputedStyle(e.querySelectorAll('img')[1]).transform).m41,time:e.querySelector('.unit-milestone__sheen')!.getAnimations({subtree:true})[0].currentTime,background:getComputedStyle(e).backgroundColor,border:getComputedStyle(e).borderWidth}));
 expect(before.base).not.toBe(before.front);expect(Math.abs(before.baseX)).toBeGreaterThan(.5);expect(Math.abs(before.frontX)).toBeGreaterThan(Math.abs(before.baseX)*1.5);expect(before.background).toBe('rgba(0, 0, 0, 0)');expect(before.border).toBe('0px');await expect(root.locator('h3')).toHaveCount(0);await shot(page,'unit-completed');
 await page.mouse.move(box.x+box.width*.1,box.y+box.height*.8);await page.waitForTimeout(350);const later=await root.locator('.unit-milestone__sheen').evaluate(e=>Number(e.getAnimations({subtree:true})[0].currentTime));expect(later).toBeGreaterThan(Number(before.time)+250);
 await button.click();await expect(page.locator('.preview-result')).toContainText('Replay event');await page.mouse.move(10,10);await page.waitForTimeout(900);expect(Math.abs(await root.evaluate(e=>Number((e as HTMLElement).style.getPropertyValue('--badge-x'))))).toBeLessThan(.01);
 await page.goto(`${lib}?view=components&component=milestone&mode=state&state=upcoming`);await expect(page.getByTestId('milestone')).toBeDisabled();expect(await page.getByTestId('milestone').evaluate(e=>getComputedStyle(e).filter)).toBe('grayscale(1)');await shot(page,'unit-upcoming');const upcoming=page.locator('.unit-milestone');const ub=(await upcoming.boundingBox())!;await page.mouse.move(ub.x+ub.width*.85,ub.y+ub.height*.2);await expect.poll(()=>upcoming.evaluate(e=>Number((e as HTMLElement).style.getPropertyValue('--badge-x')))).toBeGreaterThan(.1);
 await page.goto('/');await page.getByRole('tab').filter({hasText:/^L1$/}).click();const stage=page.locator('.staircase-viewport');await stage.focus();await page.keyboard.press('End');const actual=page.locator('.unit-milestone').last();await expect(actual).toBeInViewport();await page.waitForTimeout(900);const ab=(await actual.boundingBox())!,aw=await actual.locator('button').evaluate(e=>(e as HTMLElement).offsetWidth);await page.mouse.move(ab.x+ab.width/2+aw*.35,ab.y+ab.height/2);await expect.poll(()=>actual.evaluate(e=>Number((e as HTMLElement).style.getPropertyValue('--badge-x')))).toBeCloseTo(.7,1);await shot(page,'staircase-unit-completed');
});

test('original pole is static, yellow/gray cloth waves by time and resets phase',async({page})=>{
 await page.emulateMedia({reducedMotion:'no-preference'});await page.goto(`${lib}?view=components&component=flag&mode=state&state=completed`);
 const flag=page.locator('.ba-flag'),canvas=flag.locator('canvas'),pole=flag.locator('img');await expect(canvas).toHaveAttribute('data-cloth',/writing_flag_1.5/);await expect(pole).toHaveAttribute('src',/writing_flag_2.cutout/);
 await page.bringToFront();await flag.scrollIntoViewIfNeeded();await expect(canvas).toBeInViewport();await expect.poll(()=>page.evaluate(()=>document.visibilityState)).toBe('visible');await expect.poll(()=>canvas.getAttribute('data-phase')).not.toBe('0');const pos=await pole.boundingBox();await page.waitForTimeout(700);expect(await pole.boundingBox()).toEqual(pos);await shot(page,'flag-completed');
 await page.getByRole('button',{name:'暂停',exact:true}).click();const phase=await canvas.getAttribute('data-phase');await page.waitForTimeout(300);expect(await canvas.getAttribute('data-phase')).toBe(phase);
 await page.getByRole('button',{name:/恢复默认参数/}).click();await flag.scrollIntoViewIfNeeded();await expect(canvas).toHaveAttribute('data-phase','0');await expect(pole).toBeVisible();
 await page.goto(`${lib}?view=components&component=flag&mode=state&state=upcoming`);await expect(page.locator('.ba-flag')).toHaveAttribute('data-state','upcoming');await expect(page.locator('.ba-flag canvas')).toHaveAttribute('data-cloth',/writing_flag_1\.png/);await page.waitForTimeout(300);await shot(page,'flag-upcoming');
 await page.emulateMedia({reducedMotion:'reduce'});const stopped=await page.locator('.ba-flag canvas').getAttribute('data-phase');await page.waitForTimeout(300);expect(await page.locator('.ba-flag canvas').getAttribute('data-phase')).toBe(stopped);
});

test('real first Activity has shadow-free Hamburger, wider columns and aligned source sentence',async({page})=>{
 await start(page);const layers=page.locator('.hamburger-composition .hamburger-layer');expect(await layers.evaluateAll(es=>es.every(e=>getComputedStyle(e).boxShadow==='none'))).toBe(true);
 expect(await page.locator('.course-learn-two-column').evaluate(e=>getComputedStyle(e).columnGap)).toBe('48px');
 for(const width of [1440,1024,834,390]){await page.setViewportSize({width,height:width===834?1112:900});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await shot(page,'activity1-'+width);}
 await page.setViewportSize({width:1440,height:900});const aligned=await page.getByTestId('better-panel').evaluate(e=>{const body=e.querySelector(':scope > span')!;const node=[...body.childNodes].find(n=>n.nodeType===3&&n.textContent?.includes('Our school'))!;const r=document.createRange();r.setStart(node,node.textContent!.indexOf('Our'));r.setEnd(node,node.textContent!.indexOf('Our')+3);return {labelX:e.querySelector('.course-examples__label')!.getBoundingClientRect().x,sentenceX:r.getBoundingClientRect().x,paragraphPadding:getComputedStyle(e).paddingLeft};});expect(aligned.sentenceX).toBe(aligned.labelX);writeFileSync(resolve(dir,'sentence-measurement.json'),JSON.stringify({status:'reported extra whitespace not reproduced; no speculative CSS change',...aligned},null,2));await shot(page,'sentence-after');
});
