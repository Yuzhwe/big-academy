import { test, expect, type Page } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
test.use({reducedMotion:'reduce'});
const dir=resolve(import.meta.dirname,'../docs/evidence/integration-v1');mkdirSync(dir,{recursive:true});
const state=(p:Page)=>p.evaluate(()=>JSON.parse(localStorage.getItem('g2o_unit_state_v4')!));
const primary=(p:Page)=>p.getByTestId('lesson-footer').getByRole('button').last();
const options=(p:Page)=>p.locator('.ba-choice__option');
async function shot(p:Page,name:string){await p.screenshot({path:resolve(dir,name+'.png'),fullPage:true});}
async function start(p:Page){await p.goto('/');await p.locator('[data-lesson-focus="G2-O:1"]').click();await expect(p.getByTestId('activity')).toBeVisible();}
async function forward(p:Page){await primary(p).click();}
async function resume(p:Page){await p.reload();await p.locator('[data-lesson-focus="G2-O:1"]').click();}
async function practices(p:Page,wrong=false){
 await forward(p);await expect(primary(p)).toBeDisabled(); // Learn, then unanswered Check guard
 expect(Object.values((await state(p)).tasks).some((t:any)=>t.tries)).toBe(false);
 await options(p).nth(wrong?0:1).click();await forward(p);
 if(wrong){
  expect((await state(p)).tasks['L2-04.skill:ts1'].tries).toBe(1);
  const feedback=await p.getByTestId('feedback').textContent();await resume(p);await expect(p.getByTestId('feedback')).toHaveText(feedback!);
  await options(p).nth(2).click();await forward(p);await expect(options(p).nth(1)).toHaveAttribute('data-state','correctUnselected');await shot(p,'single-shown');
 }
 await shot(p,'screen-02-'+(wrong?'shown':'correct'));await forward(p);await p.getByRole('button',{name:wrong?'class':'believe',exact:true}).click();await forward(p);
 if(wrong){await p.getByRole('button',{name:'fish.',exact:true}).click();await forward(p);await shot(p,'tapword-shown');}
 await shot(p,'screen-03-'+(wrong?'shown':'correct'));await forward(p);for(const i of (wrong?[1,2,4]:[0,2,4]))await options(p).nth(i).click();await forward(p);
 if(wrong){await options(p).nth(3).click();await forward(p);await shot(p,'multi-shown');}
 await shot(p,'screen-04-'+(wrong?'shown':'correct'));await forward(p);
 if(wrong){
  await p.locator('.word-grid__card').filter({hasText:/^garden$/}).click();await p.locator('.word-grid__card').filter({hasText:/^garden/}).click();
  expect((await state(p)).tasks['L2-04.skill:ss.L2-04'].tries).toBe(0);await expect(p.getByTestId('bench-blank')).toHaveCount(11);await shot(p,'build-word-hint');
 }
 for(const word of ['our','school','should','have','a','garden','for','two','big','reasons','.'])await p.locator('.word-grid__card').filter({has:p.locator('.word-grid__text',{hasText:new RegExp('^'+word.replace('.','\\.')+'$')})}).click();
 await expect(p.getByTestId('bench-blank')).toHaveCount(0);await shot(p,'build-complete');await forward(p);
 const blanks=p.getByTestId('frame').locator('input');await blanks.nth(0).fill('be longer');await blanks.nth(1).fill(wrong?'nice':'kids need time to run');await forward(p);
 if(wrong){await forward(p);expect((await state(p)).tasks['L2-04.skill:ts8'].status).toBe('shown');await shot(p,'frame-shown');}
 await forward(p);await p.getByTestId('writing-canvas').fill(wrong?'I like plants.':'Our school should have a garden for learning.\nI believe a garden gives us fresh food.\nIn my opinion the school garden is the best place to relax.');await forward(p);
 if(wrong){await forward(p);await p.getByTestId('move-on').click();expect((await state(p)).applies['L2-04'].passed).toBe(false);}
 await shot(p,'apply-'+(wrong?'move-on':'passed'));await forward(p);await expect(p.getByTestId('check-number')).toHaveText('1');
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
test('eight screens correct, complete, return, review and responsive',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.setViewportSize({width:1440,height:900});await start(page);await shot(page,'screen-01-learn');
 await expect(page.getByTestId('lesson-footer').getByRole('button',{name:'Previous'})).toBeDisabled();await practices(page);await assessment(page,0,true);await shot(page,'check-mastery');
 await page.getByTestId('check-results').getByRole('button').first().click();await expect(options(page).first()).toBeDisabled();await forward(page);await forward(page);
 await expect(page.locator('.course-app')).toHaveAttribute('data-view','lessonEnd');await shot(page,'lesson-end-mastery');await page.getByTestId('lesson-footer').getByRole('button',{name:'Back to my path',exact:true}).click();
 await expect(page.locator('[data-lesson-id="G2-O:1"]')).toHaveAttribute('data-state','review');await shot(page,'path-completed');await page.locator('[data-lesson-focus="G2-O:1"]').click();expect((await state(page)).screen).toBe(0);
 for(const width of [1440,1024,834,390]){await page.setViewportSize({width,height:width===834?1112:900});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await shot(page,'lesson-review-'+width);}
 expect(errors).toEqual([]);
});
test('wrong twice, shown, move-on, failed sets, optional Review retry',async({page})=>{
 await start(page);await practices(page,true);await page.getByTestId('lesson-footer').getByRole('button',{name:'Back',exact:true}).click();expect((await state(page)).screen).toBe(6);await forward(page);
 await assessment(page,0,false);expect((await state(page)).done['L2-04.check']).not.toBe(true);await forward(page);await resume(page);expect((await state(page)).checks['L2-04.check'].attempt).toBe(1);
 await assessment(page,1,false);expect((await state(page)).done['L2-04.check']).toBe(true);expect((await state(page)).checks['L2-04.check'].passed).toBe(false);await shot(page,'check-without-mastery');await forward(page);await shot(page,'end-without-mastery');
 await expect(page.getByTestId('practice-burst')).toHaveCount(0);await page.getByTestId('lesson-footer').getByRole('button',{name:'Back to my path',exact:true}).click();await page.locator('[data-lesson-focus="G2-O:1"]').click();await page.locator('[data-task-index="7"]').first().click();
 await page.getByRole('button',{name:'Try a new set',exact:true}).click();expect((await state(page)).checks['L2-04.check'].attempt).toBe(2);expect((await state(page)).done['L2-04.check']).toBe(true);
});
test('P7 blank warning, question navigation and recovery',async({page})=>{
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
  await expect(page.getByTestId('better-panel')).toContainText('Our school should have a garden');
  await expect(page.getByTestId('lesson-footer')).toContainText('下一页');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await shot(page,'lesson-zh-'+width);
 }
 // A 720 CSS px viewport corresponds to 1440 physical pixels at 200% browser scaling.
 await page.setViewportSize({width:720,height:450});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await shot(page,'lesson-200pct-layout');
 const context=await browser.newContext({viewport:{width:834,height:1112},hasTouch:true,reducedMotion:'reduce'});const touch=await context.newPage();await touch.goto('http://127.0.0.1:5174/');await touch.locator('[data-lesson-focus="G2-O:1"]').tap();await touch.getByTestId('lesson-footer').getByRole('button',{name:'Next'}).tap();await touch.locator('.ba-choice__option').nth(1).tap();await touch.getByTestId('lesson-footer').getByRole('button',{name:'Check',exact:true}).tap();await expect(touch.getByTestId('feedback')).toHaveAttribute('data-outcome','correct');await context.close();
});
test('WordGrid preserves caret and provenance across category changes and reload',async({page})=>{
 await start(page);await practices(page);await page.getByTestId('lesson-footer').getByRole('button',{name:'Back',exact:true}).click();
 const canvas=page.getByTestId('writing-canvas');await canvas.fill('Our garden.');await canvas.press('Home');await canvas.press('ArrowRight');await canvas.press('ArrowRight');await canvas.press('ArrowRight');await canvas.press('ArrowRight');
 await page.getByRole('tab',{name:'Nouns',exact:true}).click();const first=page.locator('.word-grid__card').first();const word=await first.locator('.word-grid__text').innerText();await first.click();
 await expect(canvas).toHaveValue(new RegExp('^Our '+word+'.*garden\\.$'));
 const text=await canvas.inputValue();await resume(page);await expect(canvas).toHaveValue(text);await expect(page.getByRole('tab',{name:'Nouns',exact:true})).toHaveAttribute('aria-selected','true');
 expect((await state(page)).regions['L2-04.apply'].some((s:any)=>s.s==='grid')).toBe(true);
});
test('second assessment set can pass after first failed hand-in',async({page})=>{
 await start(page);await practices(page);await assessment(page,0,false);await forward(page);await assessment(page,1,true);
 expect((await state(page)).checks['L2-04.check'].passed).toBe(true);await shot(page,'second-set-passed');
});
test('accessibility audit of path, lesson and graded Choice; report retained',async({page})=>{
 const {writeFileSync}=await import('node:fs');
 const reports:unknown[]=[];
 const audit=async(name:string)=>{
  await page.addScriptTag({path:resolve(import.meta.dirname,'../../../node_modules/axe-core/axe.min.js')});
  const violations=await page.evaluate(async()=>{const result=await (window as any).axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','wcag22aa']}});return result.violations.map((v:any)=>({id:v.id,impact:v.impact,description:v.description,nodes:v.nodes.map((n:any)=>({target:n.target,summary:n.failureSummary}))}));});
  reports.push({name,violations});writeFileSync(resolve(dir,'accessibility.json'),JSON.stringify(reports,null,2));
  expect(violations.filter((v:any)=>v.id!=='color-contrast')).toEqual([]);
 };
 await page.goto('/');await page.locator('[data-lesson-focus="G2-O:1"]').waitFor();await audit('path');await page.locator('[data-lesson-focus="G2-O:1"]').click();await audit('learn');await forward(page);await options(page).nth(1).click();await forward(page);await audit('choice-correct');
});
test('R2.12 flag uses original wind paths and stops for reduced motion',async({page})=>{
 await page.emulateMedia({reducedMotion:'no-preference'});await page.goto('/');const cloth=page.locator('.course-goal__flag .flag-cloth');await cloth.waitFor({state:'attached'});const original=await cloth.getAttribute('d');await expect.poll(()=>cloth.getAttribute('d')).not.toBe(original);
 await page.emulateMedia({reducedMotion:'reduce'});await expect(cloth).toHaveAttribute('d','M40 29 Q75 17 106 29 Q139 39 177 24 L177 113 Q141 131 107 115 Q70 100 40 111 Z');
});
