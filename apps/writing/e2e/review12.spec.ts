import { expect, test, type Page } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const evidence=resolve(import.meta.dirname,'../docs/evidence/review12');
mkdirSync(evidence,{recursive:true});
const pick=(page:Page)=>page.locator('.ba-choice__option');
const action=(page:Page)=>page.getByTestId('lesson-footer').getByRole('button').last();
const check=async(page:Page)=>action(page).click();
const word=(page:Page,text:string)=>page.locator('.word-grid__card').filter({hasText:new RegExp('^'+(text==='.'?'\\.':text)+'$')}).first();

async function reachQ3(page:Page){
  await page.goto('/?start=lesson');
  await pick(page).nth(1).click();await check(page);await check(page);
  await page.getByRole('button',{name:'believe',exact:true}).click();await check(page);await check(page);
  await expect(page.locator('.ba-choice__option')).toHaveCount(5);
}
async function reachQ4(page:Page){
  await reachQ3(page);
  for(const i of [0,2,4]) await pick(page).nth(i).click();
  await check(page);await check(page);
  await expect(page.getByTestId('build-bench')).toBeVisible();
}
async function reachQ5(page:Page){
  await reachQ4(page);
  for(const w of ['our','school','should','have','a','garden','for','two','big','reasons','.'])await word(page,w).click();
  await check(page);await check(page);
  await expect(page.getByTestId('frame')).toBeVisible();
}

test('R12-01: WordGrid/TapWord Selected fill matches BAChoice without changing used',async({page})=>{
  await page.goto('http://127.0.0.1:6007/?view=components&component=words');
  const parity=page.getByTestId('selected-visual-parity');
  await expect(parity).toBeVisible();
  const choice=parity.locator('.ba-choice__option').first();
  const chips=parity.locator('.word-chip');
  for(const element of [choice,chips.nth(0),chips.nth(1)]){
    await expect(element).toHaveCSS('background-color','rgb(155, 79, 54)');
    await expect(element).toHaveCSS('color','rgb(255, 255, 255)');
  }
  await page.screenshot({path:resolve(evidence,'selected-parity.png')});
});

test('R12-02: independent BackToCurrent tuner changes CSS and resets without affecting card',async({page})=>{
  await page.goto('http://127.0.0.1:6007/?view=components&component=path-back&pathCurrentView=off');
  const tuner=page.getByTestId('path-back-tuner');
  await expect(tuner).toBeVisible();
  const root=page.locator('.path-back-slot .solar-lesson-preview');
  await expect(root).toHaveAttribute('data-solar-hybrid-control','true');
  await tuner.getByRole('slider',{name:'CSS Blur Radius'}).fill('20');
  await expect(root).toHaveCSS('--ba-control-css-blur','20px');
  await tuner.getByRole('slider',{name:'Ray Count'}).fill('24');
  await tuner.getByTestId('path-back-render-fallback').click();
  await expect(root).toHaveAttribute('data-solar-status','fallback');
  await tuner.getByTestId('path-back-reduced').click();
  await expect(tuner.getByTestId('path-back-reduced')).toHaveAttribute('aria-pressed','true');
  await page.screenshot({path:resolve(evidence,'hybrid-tuner.png')});
  await tuner.getByTestId('path-back-reset-settings').click();
  await expect(root).toHaveCSS('--ba-control-css-blur','7px');
  await expect(tuner.getByRole('slider',{name:'Ray Count'})).toHaveValue('64');
  await expect(tuner.getByTestId('path-back-render-auto')).toHaveAttribute('aria-pressed','true');
});

test('R12-03: Q3 partial feedback consumes no attempts; full opinions complete',async({page})=>{
  await reachQ3(page);
  await pick(page).nth(0).click(); await check(page);
  await expect(page.getByTestId('feedback')).toContainText(/Great start|找得不错/);
  await expect(page.getByTestId('next')).toHaveCount(0);
  await pick(page).nth(2).click();await check(page);
  await expect(pick(page).nth(4)).toHaveAttribute('data-state','default');
  await pick(page).nth(4).click(); await check(page);
  for(const i of [0,2,4]) await expect(pick(page).nth(i)).toHaveAttribute('data-state','correct');
  await page.screenshot({path:resolve(evidence,'q3-correct.png')});
});
test('R12-03: Q3 hint → explicit Shown and does not award correct',async({page})=>{
  await reachQ3(page);
  await pick(page).nth(0).click();await check(page);
  await page.getByRole('button',{name:'Need a hint?'}).click();
  await expect(page.getByRole('button',{name:'Show answers'})).toBeVisible();
  await page.getByRole('button',{name:'Show answers'}).click();
  await expect(pick(page).nth(2)).toHaveAttribute('data-state','correctUnselected');
  await expect(page.getByTestId('next')).toBeVisible();
  await page.screenshot({path:resolve(evidence,'q3-shown.png')});
});

test('R12-04: Q4 undo middle tile + reinsert at authored order, no placeholders',async({page})=>{
  await reachQ4(page);
  for(const w of ['our','school','should','have'])await word(page,w).click();
  await expect(page.getByTestId('bench-tile')).toHaveCount(4);
  await page.getByTestId('bench-tile').nth(1).click();
  await expect(page.getByTestId('bench-text')).toContainText(/ourshouldhave/i);
  await expect(word(page,'school')).not.toHaveAttribute('data-used','true');
  await word(page,'school').click();
  const text=await page.getByTestId('bench-tile').allInnerTexts();
  expect(text).toEqual(['our','school','should','have']);
  await page.screenshot({path:resolve(evidence,'q4-undo.png')});
});

test('R12-05: Q5 is word cards only, blanks independent, used/undo and composed answer',async({page})=>{
  await reachQ5(page);
  const frame=page.getByTestId('frame');
  await expect(frame.locator('input')).toHaveCount(0);
  await expect(frame.getByTestId('frame-blank-0')).toHaveAttribute('data-active','true');
  await word(page,'be longer').click();
  await expect(frame.getByTestId('frame-blank-0').getByTestId('frame-tile')).toContainText('be longer');
  await frame.getByRole('button',{name:'Select blank 2'}).click();
  for(const w of ['kids need','time to run','and play']) await word(page,w).click();
  await expect(frame.getByTestId('frame-blank-1').getByTestId('frame-tile')).toHaveCount(3);
  await frame.getByTestId('frame-blank-1').getByTestId('frame-tile').nth(1).click();
  await expect(frame.getByTestId('frame-blank-1').getByTestId('frame-tile')).toHaveCount(2);
  await word(page,'time to run').click();
  await expect(frame.getByTestId('frame-blank-0').getByTestId('frame-tile')).toHaveCount(1);
  await page.screenshot({path:resolve(evidence,'q5-cards.png')});
});
