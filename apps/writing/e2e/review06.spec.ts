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


test('Writing Area and Coach begin together and the footer remains bottom anchored',async({page})=>{
  for(const {width,height} of [{width:1440,height:900},{width:1024,height:768},{width:834,height:1112}]){
    await page.setViewportSize({width,height});
    await page.goto('/?start=lesson');
    await expect(page.getByTestId('activity')).toBeVisible();
    const before=await page.evaluate(()=>{
      const box=(selector:string)=>document.querySelector(selector)!.getBoundingClientRect();
      const paper=box('.lesson-workspace__paper');
      const coach=box('.lesson-workspace__coach');
      const footer=box('.lesson-workspace__footer');
      const topbar=box('[data-component="BA-WR-001"]');
      return {paper:{top:paper.top,height:paper.height},coach:{top:coach.top,height:coach.height},
        footerBottom:footer.bottom,topbarBottom:topbar.bottom,viewport:innerHeight,scrollWidth:document.documentElement.scrollWidth};
    });
    expect(Math.abs(before.paper.top-before.coach.top)).toBeLessThanOrEqual(2);
    expect(before.paper.top).toBeGreaterThanOrEqual(before.topbarBottom);
    expect(before.paper.height).toBeGreaterThan(height*0.45);
    expect(before.coach.height).toBeGreaterThan(height*0.3);
    expect(before.viewport-before.footerBottom).toBeGreaterThanOrEqual(0);
    expect(before.viewport-before.footerBottom).toBeLessThan(30);
    expect(before.scrollWidth).toBeLessThanOrEqual(width+1);
    const after=await page.evaluate(()=>{
      const coach=document.querySelector<HTMLElement>('.lesson-workspace__coach')!;
      const footer=document.querySelector<HTMLElement>('.lesson-workspace__footer')!;
      const y=footer.getBoundingClientRect().bottom;
      coach.insertAdjacentHTML('beforeend','<p>'+('Long Coach instruction. '.repeat(150))+'</p>');
      coach.scrollTop=coach.scrollHeight;
      return {scrolled:coach.scrollHeight>coach.clientHeight,footerY:footer.getBoundingClientRect().bottom,y};
    });
    expect(after.scrolled).toBe(true);
    expect(Math.abs(after.y-after.footerY)).toBeLessThanOrEqual(1);
  }
});

test('single valid Tapword Check reveals the other valid word as a hint, not a selection',async({page})=>{
  await page.goto('/?start=lesson');
  await options(page).nth(1).click();await next(page);await next(page);
  await page.getByRole('button',{name:'should',exact:true}).click();
  await expect(page.locator('.course-word[data-revealed="true"]')).toHaveCount(0);
  await next(page);
  const chosen=page.locator('.course-word').filter({hasText:/^should$/});
  const alternative=page.locator('.course-word').filter({hasText:/^believe$/});
  await expect(chosen).toHaveAttribute('data-correct','true');
  await expect(alternative).toHaveAttribute('data-revealed','true');
  await expect(alternative).not.toHaveAttribute('aria-pressed','true');
});

test('Staircase tree PNG derivatives replace exactly five old SVG trees with stable anchors and colors', async ({page}) => {
  await page.goto('/');
  const trees=page.getByTestId('staircase-tree');
  await expect(trees).toHaveCount(5);
  const inspect=async()=>trees.evaluateAll(nodes=>nodes.map(node=>{
    const el=node as HTMLImageElement;
    return {id:el.dataset.treeId,color:el.dataset.treeColor,x:el.dataset.anchorX,y:el.dataset.anchorY,
      width:Math.round(el.getBoundingClientRect().width),src:new URL(el.src).pathname};
  }));
  const l2=await inspect();
  expect(new Set(l2.map(tree=>tree.color))).toEqual(new Set(['green','orange']));
  expect(l2.every(tree=>tree.src.startsWith('/assets/trees/tree-'))).toBe(true);
  await page.reload();
  await expect(trees).toHaveCount(5);
  expect(await inspect()).toEqual(l2);
  await page.getByRole('tab').filter({hasText:/^L1$/}).click();
  await expect(trees).toHaveCount(5);
  const l1=await inspect();
  expect(new Set(l1.map(tree=>tree.color))).toEqual(new Set(['green','orange']));
  await page.getByRole('tab').filter({hasText:/^L2$/}).click();
  await expect(trees).toHaveCount(5);
  expect(await inspect()).toEqual(l2);
  await page.locator('.staircase-viewport').hover();
  await page.mouse.wheel(500,0);
  await expect(trees).toHaveCount(5);
  expect((await inspect()).map(tree=>[tree.id,tree.color,tree.x,tree.y]))
    .toEqual(l2.map(tree=>[tree.id,tree.color,tree.x,tree.y]));
});
