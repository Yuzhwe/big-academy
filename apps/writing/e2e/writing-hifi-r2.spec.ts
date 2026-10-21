import { test, expect } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const screenshots = resolve(import.meta.dirname, '../docs/evidence/r2-review');
async function shot(page:import('@playwright/test').Page,name:string){
  mkdirSync(screenshots,{recursive:true});
  await page.screenshot({path:resolve(screenshots,name+'.png'),fullPage:false});
}
test('R2 staircase and lesson shell responsive evidence',async({page})=>{
  test.setTimeout(120000);
  for(const [width,height] of [[1440,900],[1024,768],[834,1112],[390,844]]){
    await page.setViewportSize({width,height});
    await page.goto('/');
    await expect(page.locator('.staircase-viewport')).toHaveAttribute('data-variant','A');
    await expect(page.locator('[data-component="BA-WR-007"]').first()).toHaveCount(1);
    await expect(page.locator('[data-component="BA-WR-008"]').first()).toHaveCount(1);
    await shot(page,'staircase-'+width);
    await page.locator('[data-lesson-focus="G2-O:1"]').click();
    await expect(page.locator('.lesson-topbar')).toBeVisible();
    await expect(page.locator('.lesson-workspace__footer > .ba-button')).toHaveCount(2);
    const footer=page.getByTestId('lesson-footer');
    const prev=footer.locator('button').first();
    await expect(prev).toBeDisabled();
    const buttons=await footer.locator('button').all();
    if(width>=834){
      const boxes=await Promise.all(buttons.map(button=>button.boundingBox()));
      if(boxes[0]&&boxes[1]){
        expect(boxes[1].width/boxes[0].width).toBeGreaterThan(1.7);
        expect(boxes[1].width/boxes[0].width).toBeLessThan(2.3);
      }
    }
    await shot(page,'lesson-learn-'+width);
    await page.goto('/');
  }
});
test('R2 full authored 8-screen lesson actually passes by answering',async({page})=>{
  test.setTimeout(100000);
  page.setDefaultTimeout(8000);
  await page.setViewportSize({width:1440,height:900});
  await page.goto('/');
  await page.locator('[data-lesson-focus="G2-O:1"]').click();
  const primary=()=>page.getByTestId('lesson-footer').locator('button').last();
  await primary().click(); // 1 Learn
  await page.locator('.ba-choice',{hasText:'Our school should have a garden for two big reasons.'}).click();
  await primary().click(); // 2 grade
  await expect(page.getByTestId('feedback')).toContainText('Right.');
  await primary().click(); // 2 -> 3
  await page.locator('.course-word',{hasText:'believe'}).click();
  await primary().click(); // 3 grade
  await primary().click(); // 3 -> 4
  for(const text of ['Dogs are the best pets','In my opinion, every kid','School lunch should have more fruit']){
    await page.locator('.ba-choice',{hasText:text}).click();
  }
  await primary().click(); // 4 grade
  await primary().click(); // 4 -> 5
  await expect(page.getByTestId('ordered-build')).toBeVisible();
  const cards=page.locator('.writing-word-grid__words .ba-button');
  for(let i=0;i<11;i++)await cards.nth(i).click();
  await expect(page.getByTestId('feedback')).toContainText(/That's it|That’s it|Yes/);
  await primary().click(); // 5 -> 6
  await page.getByRole('textbox',{name:'Your sentence'}).fill('In my opinion, recess should be longer because kids need time to run.');
  await primary().click(); // 6 grade
  await primary().click(); // 6 -> 7
  await page.getByRole('textbox',{name:'Your topic sentences'}).fill([
    'I think our school needs a garden.',
    'Our school should have a garden to grow food.',
    'In my opinion, a garden at school would be better for students.',
  ].join('\n'));
  await primary().click(); // 7 grade
  await expect(page.locator('.writing-compose__criteria')).toBeVisible();
  await primary().click(); // 7 -> 8
  await expect(page.getByTestId('mastery-assessment')).toBeVisible();
  await page.locator('.ba-choice',{hasText:'I believe every student should learn to cook.'}).click();
  await primary().click();
  await page.locator('.ba-choice',{hasText:'Our school has 300 students.'}).click();
  await primary().click();
  await page.locator('.writing-assessment .course-word',{hasText:'should'}).click();
  await primary().click();
  await page.getByRole('textbox',{name:'Your answer'}).fill('I think kids should have a pet at home.');
  await primary().click();
  await expect(page.locator('.writing-assessment__results')).toContainText('You passed this check.');
  await shot(page,'mastery-passed-1440');
  await primary().click();
  await expect(page.locator('.course-app')).toHaveAttribute('data-view','lessonEnd');
  await shot(page,'lesson-end-1440');
});

test('R2 locale, overflow popover, reduced motion and high zoom evidence',async({page})=>{
  test.setTimeout(80000);
  page.setDefaultTimeout(8000);
  await page.setViewportSize({width:390,height:844});
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('/?locale=zh');
  await expect(page.locator('.staircase-viewport')).toHaveAttribute('data-variant','A');
  await expect(page.locator('[data-component="BA-WR-007"]').first()).toBeVisible();
  await shot(page,'staircase-390-zh');
  await page.locator('[data-lesson-focus="G2-O:1"]').click();
  await expect(page.locator('.course-lesson')).toBeVisible();
  await expect(page.getByTestId('lesson-footer')).toBeInViewport();
  const nav=page.locator('[data-component="BA-UI-006"]');
  await expect(nav.locator('[data-component="BA-UI-006-INDICATOR"]').first()).toBeVisible();
  await nav.getByRole('button',{name:'查看全部活动页'}).click();
  const overlay=page.locator('[data-component="BA-UI-005"]');
  await expect(overlay).toBeVisible();
  await expect(overlay.locator('[data-component="BA-UI-006-INDICATOR"]')).toHaveCount(8);
  await page.keyboard.press('Escape');
  await expect(overlay).toHaveCount(0);
  await shot(page,'lesson-mobile-390-zh-reduced-motion');
  await page.evaluate(()=>{document.documentElement.style.zoom='2';});
  await shot(page,'lesson-mobile-200percent-zoom');
});
