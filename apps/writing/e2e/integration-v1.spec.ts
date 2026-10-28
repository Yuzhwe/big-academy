import { test, expect, type Page } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { createRequire } from 'node:module';
test.use({reducedMotion:'reduce'});
const dir=resolve(import.meta.dirname,'../docs/evidence/integration-v1');mkdirSync(dir,{recursive:true});
const state=(p:Page)=>p.evaluate(()=>JSON.parse(localStorage.getItem('g2o_unit_state_v4')!));
const primary=(p:Page)=>p.getByTestId('lesson-footer').getByRole('button').last();
const options=(p:Page)=>p.locator('.ba-choice__option');
async function shot(p:Page,name:string){await p.screenshot({path:resolve(dir,name+'.png'),fullPage:true});}
async function start(p:Page){await p.goto('/');await p.locator('[data-lesson-focus="G2-O:1"]').click();await expect(p.getByTestId('activity')).toBeVisible();}
async function forward(p:Page){await primary(p).click();}
async function resume(p:Page){await p.reload();await p.locator('[data-lesson-focus="G2-O:1"]').click();}
async function practices(p:Page,wrong=false,stopAtApply=false){
 await expect(primary(p)).toBeDisabled(); // Unanswered first P3 Check guard
 expect(Object.values((await state(p)).tasks).some((t:any)=>t.tries)).toBe(false);
 await options(p).nth(wrong?0:1).click();await forward(p);
 if(wrong){
  expect((await state(p)).tasks['L2-04.skill:ts1'].tries).toBe(1);
  const feedback=await p.getByTestId('feedback').textContent();await resume(p);await expect(p.getByTestId('feedback')).toHaveText(feedback!);
  await options(p).nth(2).click();await forward(p);await expect(options(p).nth(1)).toHaveAttribute('data-state','correctUnselected');await shot(p,'single-shown');
 }
 await shot(p,'screen-02-'+(wrong?'shown':'correct'));await forward(p);await p.getByRole('button',{name:wrong?'class':'believe',exact:true}).click();await forward(p);
 if(wrong){await p.getByRole('button',{name:'fish.',exact:true}).click();await forward(p);await shot(p,'tapword-shown');await expect(primary(p)).toBeDisabled();await p.getByRole('button',{name:/^believe/}).click();await forward(p);}
 await shot(p,'screen-03-'+(wrong?'shown':'correct'));await forward(p);for(const i of (wrong?[1,2,4]:[0,2,4]))await options(p).nth(i).click();await forward(p);
 if(wrong){await options(p).nth(2).click();await options(p).nth(3).click();await forward(p);await shot(p,'multi-shown');}
 await shot(p,'screen-04-'+(wrong?'shown':'correct'));await forward(p);
 if(wrong){
  await p.locator('.word-grid__card').filter({hasText:/^garden$/}).click();await p.locator('.word-grid__card').filter({hasText:/^garden/}).click();
  expect((await state(p)).tasks['L2-04.skill:ss.L2-04'].tries).toBe(0);await expect(p.getByTestId('bench-blank')).toHaveCount(11);await shot(p,'build-word-hint');
 }
 for(const word of ['our','school','should','have','a','garden','for','two','big','reasons','.'])await p.locator('.word-grid__card').filter({has:p.locator('.word-grid__text',{hasText:new RegExp('^'+word.replace('.','\\.')+'$')})}).click();
 await expect(p.getByTestId('bench-blank')).toHaveCount(0);await shot(p,'build-complete');await forward(p);await forward(p);
 const blanks=p.getByTestId('frame').locator('input');await blanks.nth(0).fill('be longer');await blanks.nth(1).fill(wrong?'nice':'kids need time to run');await forward(p);
 if(wrong){await forward(p);expect((await state(p)).tasks['L2-04.skill:ts8'].status).toBe('shown');await shot(p,'frame-shown');}
 await forward(p);if(stopAtApply)return;await p.getByTestId('writing-canvas').fill(wrong?'I like plants.':'Our school should have a garden for learning.\nI believe a garden gives us fresh food.\nIn my opinion the school garden is the best place to relax.');await forward(p);
 if(wrong){await forward(p);await p.getByTestId('move-on').click();expect((await state(p)).applies['L2-04'].passed).toBe(false);}
 await shot(p,'apply-'+(wrong?'move-on':'passed'));await forward(p);await expect(p.locator('.course-app')).toHaveAttribute('data-view','lessonEnd');
}
async function assessment(p:Page,round:number,pass:boolean){
 for(let q=0;q<3;q++){
  if(round===0&&q===2)await p.getByRole('button',{name:pass?'should':'town',exact:true}).click();
  else await options(p).nth(pass?(round===0?[1,2][q]:[0,1,1][q]):2).click();
  await forward(p);
 }
 await expect(p.getByRole('heading',{name:/Write a topic sentence/})).toBeVisible();await p.getByTestId('writing-canvas').fill(pass?'I believe kids should have pets at home.':'pets');await shot(p,'check-round-'+round+'-writing');
 expect((await state(p)).checks['L2-04.check'].history).toHaveLength(round);await forward(p);await expect(p.getByTestId('check-results')).toContainText(pass?'You passed':'Not yet');
}
test('six screens correct, complete, return, review and responsive',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.setViewportSize({width:1440,height:900});await start(page);await shot(page,'screen-01-single-pick');
 await expect(page.getByTestId('lesson-footer').getByRole('button',{name:'Previous'})).toBeDisabled();await practices(page);
 await expect(page.locator('.course-app')).toHaveAttribute('data-view','lessonEnd');await shot(page,'lesson-end-mastery');await page.getByTestId('lesson-footer').getByRole('button',{name:'Back to my path',exact:true}).click();
 await expect(page.locator('[data-lesson-id="G2-O:1"]')).toHaveAttribute('data-state','review');await shot(page,'path-completed');await page.locator('[data-lesson-focus="G2-O:1"]').click();expect((await state(page)).screen).toBe(0);
 for(const width of [1440,1024,834,390]){await page.setViewportSize({width,height:width===834?1112:900});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await shot(page,'lesson-review-'+width);}
 expect(errors).toEqual([]);
});
test('wrong twice, shown-and-retry, move-on without fabricated P7 mastery',async({page})=>{
 await start(page);await practices(page,true);expect((await state(page)).done['L2-04.check']).not.toBe(true);
 expect((await state(page)).checks['L2-04.check']?.passed).toBeUndefined();await shot(page,'end-without-mastery');
 await page.getByTestId('lesson-footer').getByRole('button',{name:'Back to my path',exact:true}).click();await expect(page.locator('[data-lesson-id="G2-O:1"]')).toHaveAttribute('data-state','review');
});
test.skip('Historical P7 (Not in current runtime sequence): blank warning, question navigation and recovery',async({page})=>{
 await start(page);await practices(page);await options(page).nth(1).click();await forward(page);await page.getByRole('button',{name:'Question 1',exact:true}).click();await expect(options(page).nth(1)).toBeChecked();await page.getByRole('button',{name:'Question 4',exact:true}).click();await forward(page);
 await expect(page.getByTestId('feedback')).toContainText('2, 3, 4');expect((await state(page)).checks['L2-04.check'].history).toHaveLength(0);await resume(page);await expect(primary(page)).toContainText('Hand in anyway');await forward(page);expect((await state(page)).checks['L2-04.check'].history).toHaveLength(1);
});
test('Chinese path, keyboard, touch, reduced motion and 200 percent layout',async({page,browser})=>{
 for(const width of [1440,1024,834,390]){
  await page.setViewportSize({width,height:width===834?1112:900});await page.goto('/?locale=zh');
  const scene=page.locator('.staircase-viewport');await scene.focus();await page.keyboard.press('Home');
  expect(Number(await scene.getAttribute('data-camera-x'))).toBe(0);await shot(page,'path-zh-first-'+width);
  await page.keyboard.press('End');await shot(page,'path-zh-last-'+width);
  const last=await page.getByTestId('level-goal').boundingBox();expect(last!.x).toBeGreaterThanOrEqual(0);expect(last!.x+last!.width).toBeLessThanOrEqual(width+1);
  await scene.focus();await page.keyboard.press('Home');
  await page.locator('[data-lesson-focus="G2-O:1"]').click();
  await expect(options(page)).toHaveCount(3);
  await expect(primary(page)).toBeDisabled();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await shot(page,'lesson-zh-'+width);
 }
 // A 720 CSS px viewport corresponds to 1440 physical pixels at 200% browser scaling.
 await page.setViewportSize({width:720,height:450});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await shot(page,'lesson-200pct-layout');
 const context=await browser.newContext({viewport:{width:834,height:1112},hasTouch:true,reducedMotion:'reduce'});const touch=await context.newPage();await touch.goto(new URL('/',page.url()).href);await touch.locator('[data-lesson-focus="G2-O:1"]').tap();await touch.locator('.ba-choice__option').nth(1).tap();await touch.getByTestId('lesson-footer').getByRole('button',{name:'Check',exact:true}).tap();await expect(touch.getByTestId('feedback')).toHaveAttribute('data-outcome','correct');await context.close();
});
test('WordGrid preserves caret and provenance across category changes and reload',async({page})=>{
 await start(page);await practices(page,false,true);
 const canvas=page.getByTestId('writing-canvas');await expect(canvas).toHaveCSS('resize','none');await expect(canvas).toHaveCSS('overflow-y','auto');await canvas.fill('Our garden.');await canvas.press(process.platform==='darwin'?'Meta+ArrowLeft':'Home');await canvas.press('ArrowRight');await canvas.press('ArrowRight');await canvas.press('ArrowRight');await canvas.press('ArrowRight');
 await page.getByRole('tab',{name:'Nouns',exact:true}).click();const first=page.locator('.word-grid__card').first();const word=await first.locator('.word-grid__text').innerText();await first.click();
 await expect(canvas).toHaveValue(new RegExp('^Our '+word+'.*garden\\.$'));
 const text=await canvas.inputValue();await resume(page);await expect(canvas).toHaveValue(text);await expect(page.getByRole('tab',{name:'Nouns',exact:true})).toHaveAttribute('aria-selected','true');
 expect((await state(page)).regions['L2-04.apply'].some((s:any)=>s.s==='grid')).toBe(true);
});
test.skip('Historical P7 (Not in current runtime sequence): second assessment set can pass after failed hand-in',async({page})=>{
 await start(page);await practices(page);await assessment(page,0,false);await forward(page);await assessment(page,1,true);
 expect((await state(page)).checks['L2-04.check'].passed).toBe(true);await shot(page,'second-set-passed');
});
test('accessibility audit of path, lesson and graded Choice; report retained',async({page})=>{
 const {writeFileSync}=await import('node:fs');
 const reports:unknown[]=[];
 const audit=async(name:string)=>{
   await page.addScriptTag({path:createRequire(import.meta.url).resolve('axe-core/axe.min.js')});
  const violations=await page.evaluate(async()=>{const result=await (window as any).axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','wcag22aa']}});return result.violations.map((v:any)=>({id:v.id,impact:v.impact,description:v.description,nodes:v.nodes.map((n:any)=>({target:n.target,summary:n.failureSummary}))}));});
  reports.push({name,violations});writeFileSync(resolve(dir,'accessibility.json'),JSON.stringify(reports,null,2));
  expect(violations.filter((v:any)=>v.id!=='color-contrast')).toEqual([]);
 };
 await page.goto('/');await page.locator('[data-lesson-focus="G2-O:1"]').waitFor();await audit('path');await page.locator('[data-lesson-focus="G2-O:1"]').click();await audit('first-pick');await options(page).nth(1).click();await forward(page);await audit('choice-correct');
});
test('R04 Canvas flag has moving pixels and freezes on reduced motion',async({page})=>{
 await page.emulateMedia({reducedMotion:'no-preference'});
 await page.goto('/');
 const canvas=page.locator('.course-goal__flag .ba-flag__canvas');
 await expect(canvas).toHaveCount(1);
 const stage=page.locator('.staircase-viewport');
 await stage.focus();await page.keyboard.press('End');
 await expect(canvas).toBeInViewport(); // Review 05 deliberately suspends offscreen cloth.
 const snapshot=()=>canvas.evaluate(el=>(el as HTMLCanvasElement).toDataURL());
 await expect.poll(async()=>canvas.evaluate(el=>{
   const c=el as HTMLCanvasElement,ctx=c.getContext('2d');
   if(!ctx||!c.width||!c.height)return false;
   const pixels=ctx.getImageData(0,0,c.width,c.height).data;
   for(let i=3;i<pixels.length;i+=4)if(pixels[i]>0)return true;
   return false;
 }),{timeout:10000}).toBe(true);
 const moving=await snapshot();
 await expect.poll(snapshot,{timeout:5000,intervals:[200,250,300,400]}).not.toBe(moving);
 await page.emulateMedia({reducedMotion:'reduce'});
 await expect(page.locator('.course-goal__flag')).toHaveAttribute('data-playing','false');
 await expect(canvas).toHaveAttribute('data-image-state','ready');
 await expect(canvas).toHaveAttribute('data-reduced','true');
 await page.waitForTimeout(150); // One flat repaint of the already decoded cloth.
 const frozen=await snapshot();
 await page.waitForTimeout(350);
 expect(await snapshot()).toBe(frozen);
});


test('R2 Review 02 overflow uses current-first 36px markers and fixed left-aligned six-column index',async({page})=>{
 await page.setViewportSize({width:1024,height:768});
 await start(page);
 const rail=page.locator('.lesson-topbar__center');
 await rail.evaluate(el=>{(el as HTMLElement).style.width='228px';(el as HTMLElement).style.maxWidth='228px';});
 const nav=page.locator('.lesson-topbar .ba-task-progress');
 const overflow=nav.getByRole('button',{name:'All activity screens'});
 await expect(overflow).toBeVisible();
 const visible=nav.locator('.ba-task-progress__digit');
 expect(await visible.count()).toBeLessThanOrEqual(8);
 await expect(nav.locator('.ba-task-progress__button')).toHaveCount((await visible.count())+1);
 await overflow.click();
 const pop=page.getByRole('dialog',{name:'All activity screens'});
 await expect(pop).toBeVisible();
 await expect(pop.locator('.ba-task-progress__digit')).toHaveCount(6);
 await expect(pop.locator('.ba-task-progress__popover-grid')).toHaveCSS('grid-template-columns',/44px 44px 44px 44px 44px 44px/);
 const firstRow=await pop.locator('.ba-task-progress__button').first().boundingBox();
 const sixth=await pop.locator('.ba-task-progress__button').nth(5).boundingBox();
 expect(sixth!.y).toBeCloseTo(firstRow!.y,0);
 await page.keyboard.press('Escape');
 await expect(pop).toHaveCount(0);
 await expect(overflow).toBeFocused();
});


test('Review 03 Coach messages, Speaker placement and non-grading hints',async({page})=>{
 await page.setViewportSize({width:1440,height:900});
 await start(page);
 const head=page.locator('.course-activity__heading').first();
 await expect(head.locator('.course-listen svg[data-icon-name="speaker"]')).toBeVisible();
 const headingBox=await head.locator('.course-title').boundingBox();
 const speakerBox=await head.locator('.course-listen').boundingBox();
 expect(speakerBox!.x).toBeGreaterThanOrEqual(headingBox!.x+headingBox!.width);
   await expect(page.getByTestId('coach').locator('.lesson-workspace__message').first()).toBeVisible();
 const hintButton=page.getByRole('button',{name:'Need a hint?'});
 await expect(hintButton).toBeEnabled();
 await hintButton.click();
 await page.getByRole('button',{name:'Another hint'}).click();
 await expect(page.getByTestId('hint')).toHaveCount(2);
 await expect(page.getByRole('button',{name:'Show me the answer'})).toHaveCount(0);
 await expect(primary(page)).toBeDisabled();
 await expect(page.getByTestId('feedback')).toHaveCount(0);
 await options(page).nth(1).click();await forward(page);
 const greenFeedback=page.getByTestId('feedback');
 await expect(greenFeedback).toHaveAttribute('data-tone','correct');
 await expect(greenFeedback).toHaveCSS('background-color','rgb(240, 251, 244)');
 await forward(page);
 await page.getByRole('button',{name:'believe',exact:true}).click();await forward(page);
 const correctWord=page.locator('.course-word[data-correct="true"]').first();
 await expect(correctWord).toHaveCSS('background-color','rgb(20, 174, 92)');
 await expect(correctWord.locator('svg')).toHaveCount(0);
 await forward(page); // P3 multi
 await expect(primary(page)).toBeDisabled();
 await options(page).nth(1).click();
 await expect(primary(page)).toBeEnabled();
 await forward(page);
 await expect(page.getByTestId('feedback')).toHaveAttribute('data-tone','wrong');
 await expect(page.getByTestId('feedback')).toHaveCSS('background-color','rgb(245, 245, 245)');
});

test('Review 03 default L0/L1 completion fixtures are independent from real L2 records',async({page})=>{
 await page.setViewportSize({width:1440,height:900});
 await page.goto('/');
 const initial=await state(page);
 for(const levelId of ['L0','L1']){
  await page.locator('.ba-tabs__option').filter({hasText:levelId}).click();
  const cards=page.locator('[data-node-kind="lesson"] .stair-lesson-card');
  expect(await cards.count()).toBeGreaterThan(0);
  expect(await cards.filter({has:page.locator('[data-visual-state="enterable"]')}).count()).toBe(0);
  const kinds=await cards.evaluateAll(elements=>elements.map(e=>e.getAttribute('data-visual-state')));
  expect(kinds.every(kind=>kind==='completed')).toBe(true);
  const milestones=page.locator('[data-node-kind="milestone"] [data-testid="milestone"]');
  expect(await milestones.count()).toBeGreaterThan(0);
  expect(await milestones.evaluateAll(els=>els.every(el=>el.getAttribute('data-done')==='1'))).toBe(true);
  const pill=page.locator('.course-unit__meta').first();
  await expect(pill).toContainText(/lessons/);
  await expect(pill).not.toContainText(/about| of /);
 }
 await page.locator('.ba-tabs__option').filter({hasText:'L2'}).click();
 expect((await state(page)).done).toEqual(initial.done);
 expect((await state(page)).tasks).toEqual(initial.tasks);
 await expect(page.locator('[data-lesson-id="G2-O:1"]')).toHaveAttribute('data-visual-state','enterable');
});

test('Review 03 P5 lined editor only, without redundant tip',async({page})=>{
 await start(page);await practices(page,false,true);
 const editor=page.getByTestId('writing-canvas');
 await expect(editor).toHaveCSS('resize','none');
 await expect(editor).toHaveCSS('background-image',/repeating-linear-gradient/);
 await expect(page.getByText('Write each sentence on a new line.')).toHaveCount(0);
 await expect(page.locator('.course-activity[data-kind="apply"] .word-grid')).toBeVisible();
});


test('R04 bug fix: completed topbar and portal numbers use the exact Writing brown',async({page})=>{
  await page.setViewportSize({width:1024,height:768});
  await start(page);
  await options(page).nth(1).click();
  await forward(page); // check the authored single-choice answer
  await forward(page); // navigate to next screen so first two are Done
  const done=page.locator('.lesson-topbar .ba-task-progress__button[data-state="done"] .ba-task-progress__marker');
  await expect(done.first()).toBeVisible();
  await expect(done.first()).toHaveCSS('background-color','rgb(178, 84, 21)');
  await page.locator('.lesson-topbar__center').evaluate(el=>{
    (el as HTMLElement).style.width='228px';
    (el as HTMLElement).style.maxWidth='228px';
  });
  const overflow=page.locator('.lesson-topbar').getByRole('button',{name:'All activity screens'});
  await overflow.click();
  const popup=page.getByRole('dialog',{name:'All activity screens'});
  await expect(popup.locator('.ba-task-progress__button[data-state="done"] .ba-task-progress__marker').first())
    .toHaveCSS('background-color','rgb(178, 84, 21)');
  await page.keyboard.press('Escape');
});
