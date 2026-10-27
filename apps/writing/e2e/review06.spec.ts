import { test, expect, type Page } from '@playwright/test';

const primary=(page:Page)=>page.getByTestId('lesson-footer').getByRole('button').last();
const options=(page:Page)=>page.locator('.ba-choice__option');
const next=async(page:Page)=>primary(page).click();
test.use({reducedMotion:'no-preference'});

test('High/Low and live system Reduced Motion control every shared decoration',async({page})=>{
  await page.goto('/');
  const stage=page.locator('.staircase-viewport');
  await expect(stage).toHaveAttribute('data-motion','high');
  await page.getByRole('button',{name:'Low motion'}).click();
  await expect(stage).toHaveAttribute('data-motion','low');
  await expect(page.getByTestId('path-cloud')).toHaveAttribute('data-mode','lightweight');
  await expect(page.locator('.ba-flag')).toHaveAttribute('data-playing','false');
  await page.getByRole('button',{name:'High motion'}).click();
  await expect(stage).toHaveAttribute('data-motion','high');
  await page.emulateMedia({reducedMotion:'reduce'});
  await expect(stage).toHaveAttribute('data-motion','low');
  await page.getByRole('button',{name:'High motion'}).click();
  await expect(stage).toHaveAttribute('data-motion','low');
  await page.emulateMedia({reducedMotion:'no-preference'});
  await expect(stage).toHaveAttribute('data-motion','high');
});

test('each Level has one first entry per browser session even after reentry/reload',async({page})=>{
  await page.goto('/');
  await expect(page.locator('.staircase-viewport')).toHaveAttribute('data-intro','enter');
  await expect(page.locator('.staircase-viewport')).toHaveAttribute('data-intro','settled',{timeout:18000});
  await page.getByRole('tab').filter({hasText:/^L1$/}).click();
  await expect(page.locator('.staircase-viewport')).toHaveAttribute('data-intro','enter');
  await page.getByRole('tab').filter({hasText:/^L2$/}).click();
  await expect(page.locator('.staircase-viewport')).toHaveAttribute('data-intro','settled');
  await page.reload();
  await expect(page.locator('.staircase-viewport')).toHaveAttribute('data-intro','settled');
});

test('Lesson 1 has exactly six activities and ends directly after Apply',async({page})=>{
  await page.goto('/?start=lesson');
  await expect(page.locator('[data-task-index]')).toHaveCount(6);
  await options(page).nth(1).click();await next(page);await next(page);
  await page.getByRole('button',{name:'believe',exact:true}).click();await next(page);await next(page);
  for(const i of [0,2,4])await options(page).nth(i).click();await next(page);await next(page);
  for(const word of ['our','school','should','have','a','garden','for','two','big','reasons','.']){
    await page.locator('.word-grid__card').filter({has:page.locator('.word-grid__text',{hasText:new RegExp('^'+word.replace('.','\\.')+'$')})}).click();
  }
  await expect(primary(page)).toBeEnabled();await next(page);await next(page);
  const blanks=page.getByTestId('frame').locator('input');await blanks.nth(0).fill('be longer');await blanks.nth(1).fill('kids need time to run');await next(page);await next(page);
  await page.getByTestId('writing-canvas').fill('Our school should have a garden for learning.\nI believe a garden gives us fresh food.\nIn my opinion the school garden is the best place to relax.');await next(page);await next(page);
  await expect(page.locator('.course-app')).toHaveAttribute('data-view','lessonEnd');
});

test('Tapword Shown reveals valid answers but blocks Next and never celebrates until correct Check',async({page})=>{
  await page.goto('/?start=lesson');
  await options(page).nth(1).click();await next(page);await next(page);
  const fish=page.getByRole('button',{name:'fish.',exact:true});
  await fish.click();await next(page);
  await expect(primary(page)).toBeDisabled();
  await fish.click();await next(page);
  await expect(page.locator('.course-word[data-revealed="true"]')).toHaveCount(2);
  await expect(primary(page)).toBeDisabled();
  await expect(page.getByTestId('practice-burst')).toHaveCount(0);
  const shown=await page.evaluate(()=>JSON.parse(localStorage.getItem('g2o_unit_state_v4')||'{}').tasks?.['L2-04.skill:ts4']?.status);
  expect(shown).toBe('shown');
  await page.getByRole('button',{name:/^believe/}).click();await expect(primary(page)).toBeEnabled();await next(page);
  await expect(page.locator('.course-word[data-correct="true"]')).toHaveCount(1);
  await expect(primary(page)).toBeEnabled();
});

test('desktop/tablet/mobile path and first activity remain operable without horizontal page overflow',async({page})=>{
  for(const width of [1440,1024,834,390]){
    await page.setViewportSize({width,height:width===834?1112:900});
    await page.goto('/');
    await expect(page.locator('.staircase-viewport')).toBeVisible();
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
    await page.goto('/?start=lesson');
    await expect(options(page).first()).toBeVisible();
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
  }
});
