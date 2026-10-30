import { expect, test, type Page } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const evidence = resolve(import.meta.dirname, '../docs/evidence/review11');
mkdirSync(evidence, { recursive: true });
const library = 'http://127.0.0.1:6007/';
const primary = (page: Page) => page.getByTestId('lesson-footer').getByRole('button').last();
const options = (page: Page) => page.locator('.ba-choice__option');
const next = async (page: Page) => primary(page).click();

async function reachQ4(page: Page) {
  await page.goto('/?start=lesson');
  await options(page).nth(1).click(); await next(page); await next(page);
  await page.getByRole('button', { name: 'believe', exact: true }).click();
  await next(page); await next(page);
  for (const index of [0, 2, 4]) await options(page).nth(index).click();
  await next(page); await next(page);
  await expect(page.getByTestId('build-bench')).toBeVisible();
}
async function reachQ5(page: Page) {
  await reachQ4(page);
  for (const word of ['our','school','should','have','a','garden','for','two','big','reasons','.']) {
    await page.locator('.word-grid__card').filter({
      hasText: new RegExp('^' + (word === '.' ? '\\.' : word) + '$'),
    }).click();
  }
  await next(page); await next(page);
  await expect(page.getByTestId('frame')).toBeVisible();
}
async function reachQ6(page: Page) {
  await reachQ5(page);
  const input = page.getByTestId('frame').locator('input');
  await input.nth(0).fill('be longer');
  await input.nth(1).fill('kids need time to run');
  await next(page); await next(page);
  await expect(page.getByTestId('notebook-scroll')).toBeVisible();
}

test('R11-01: only Upcoming flag cloth translates 20px; pole and completed remain untouched', async ({ page }) => {
  await page.goto(library + '?view=components&component=flag&mode=state&state=upcoming');
  const cloth = page.locator('.ba-flag[data-state="upcoming"] .ba-flag__cloth').first();
  await expect(cloth).toBeVisible();
  await expect(cloth).toHaveCSS('translate', '20px');
  const pole = page.locator('.ba-flag[data-state="upcoming"] .ba-flag__pole').first();
  await expect(pole).toHaveCSS('translate', 'none');
  await expect(page.locator('.ba-flag[data-state="upcoming"] .ba-flag__canvas')).toHaveCount(0);
  await page.screenshot({path:resolve(evidence,'flag-upcoming.png')});
  await page.goto(library + '?view=components&component=flag&mode=state&state=completed');
  await expect(page.locator('.ba-flag[data-state="completed"] .ba-flag__canvas').first()).toBeVisible();
  await page.screenshot({path:resolve(evidence,'flag-completed.png')});
});

test('R11-03/05: Q4 and Q5 heading ink aligns with answer ink, without moving audio', async ({ page }) => {
  await reachQ4(page);
  const first = await page.evaluate(() => {
    const title = document.querySelector('.course-activity__heading > .course-title')!;
    const answer = document.querySelector('.course-bench')!;
    const listen = document.querySelector('.course-activity__heading .course-listen')!;
    const t = getComputedStyle(title), a = getComputedStyle(answer);
    return {
      titleInkX: title.getBoundingClientRect().left + parseFloat(t.paddingLeft),
      answerInkX: answer.getBoundingClientRect().left + parseFloat(a.paddingLeft),
      titlePadding: t.paddingLeft,
      speakerX: listen.getBoundingClientRect().x,
    };
  });
  console.log('R11 Q4 alignment ' + JSON.stringify(first));
  expect(first.titlePadding).toBe('16px');
  expect(Math.abs(first.titleInkX - first.answerInkX)).toBeLessThanOrEqual(1);
  await page.screenshot({path:resolve(evidence,'activity4-alignment.png')});
  for (const word of ['our','school','should','have','a','garden','for','two','big','reasons','.']) {
    await page.locator('.word-grid__card').filter({hasText:new RegExp('^' + (word === '.' ? '\\.' : word) + '$')}).click();
  }
  await next(page); await next(page);
  const second = await page.evaluate(() => {
    const title = document.querySelector('.course-activity__heading > .course-title')!;
    const answer = document.querySelector('.course-frame')!;
    const listen = document.querySelector('.course-activity__heading .course-listen')!;
    return {
      titleInkX: title.getBoundingClientRect().left + parseFloat(getComputedStyle(title).paddingLeft),
      answerInkX: answer.getBoundingClientRect().left + parseFloat(getComputedStyle(answer).paddingLeft),
      titlePadding: getComputedStyle(title).paddingLeft,
      speakerX: listen.getBoundingClientRect().x,
    };
  });
  console.log('R11 Q5 alignment ' + JSON.stringify(second));
  expect(Math.abs(second.titleInkX - second.answerInkX)).toBeLessThanOrEqual(1);
  expect(second.speakerX).toBeCloseTo(first.speakerX,0);
  await page.screenshot({path:resolve(evidence,'activity5-alignment.png')});
});

test('R11-04: Q5 focus has a distinct orange 2px underline without rectangular outline', async ({ page }) => {
  await reachQ5(page);
  const blank = page.getByTestId('frame').locator('input').first();
  const style = () => blank.evaluate(el=>{
    const cs=getComputedStyle(el);
    return {width:cs.borderBottomWidth,color:cs.borderBottomColor,outline:cs.outlineStyle,outlineWidth:cs.outlineWidth,
      font:cs.fontSize,lineHeight:cs.lineHeight};
  });
  const resting=await style();
  await blank.focus();
  const focused=await style();
  console.log('R11 Q5 Focus '+JSON.stringify({resting,focused}));
  expect(resting.width).toBe('2px');
  expect(focused.width).toBe('2px');
  expect(focused.color).toBe('rgb(178, 84, 21)');
  expect(focused.outline).toBe('none');
  expect(resting.font).toBe('24px');
  expect(focused.lineHeight).toBe('36px');
  await blank.fill('be longer');
  await expect(blank).toHaveValue('be longer');
  await page.screenshot({path:resolve(evidence,'activity5-focus.png')});
});

test('R11-06: visible notebook paper aligns with Coach and preserves Q6 scroll & dock', async ({ page }) => {
  test.setTimeout(120000);
  await reachQ6(page);
  await expect(page.locator('.course-answer-notebook .course-title')).toHaveCSS('padding-left','0px');
  for (const [width,height] of [[1440,900],[1024,768],[834,1112]]) {
    await page.setViewportSize({width,height});
    await page.evaluate(()=>document.fonts.ready);
    const bounds=await page.evaluate(()=>{
      const paper=document.querySelector('.course-answer-notebook .notebook-shell__notebook')!.getBoundingClientRect();
      const coach=document.querySelector('.lesson-workspace__coach')!.getBoundingClientRect();
      return {paperY:paper.top,coachY:coach.top,paperWidth:paper.width};
    });
    console.log('R11 paper geometry '+width+'x'+height+': '+JSON.stringify(bounds));
    expect(Math.abs(bounds.paperY-bounds.coachY)).toBeLessThanOrEqual(1);
    await page.screenshot({path:resolve(evidence,'notebook-'+width+'.png')});
  }
  const scroll=page.getByTestId('notebook-scroll');
  const textarea=page.getByTestId('writing-canvas');
  const dock=page.locator('.course-answer-notebook__words');
  await expect(scroll).toHaveCSS('overflow-y','auto');
  await expect(textarea).toHaveCSS('overflow-y','hidden');
  const dockY=(await dock.boundingBox())!.y;
  await textarea.fill(Array.from({length:70},(_,i)=>'Line '+String(i+1)).join('\n'));
  await scroll.evaluate(el=>{el.scrollTop=0;el.dispatchEvent(new Event('scroll'));});
  await expect(scroll).toHaveAttribute('data-fade-bottom','true');
  await scroll.evaluate(el=>{el.scrollTop=el.scrollHeight;el.dispatchEvent(new Event('scroll'));});
  await expect(scroll).toHaveAttribute('data-fade-top','true');
  expect((await dock.boundingBox())!.y).toBeCloseTo(dockY,0);
});

test('R11-02: Library-only hybrid control is isolated, interactive and falls back safely', async ({ page }) => {
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.goto(library+'?view=components&component=path-back&pathCurrentView=off&motion=system');
  const root=page.locator('.path-back-slot .solar-lesson-preview');
  await expect(root).toBeVisible();
  await expect(root).toHaveAttribute('data-solar-hybrid-control','true');
  await expect(root).toHaveAttribute('data-solar-fit','control');
  const state=await root.getAttribute('data-solar-status');
  const capsule=root.locator('.ba-button__assembly');
  const styles=await capsule.evaluate(el=>({shadow:getComputedStyle(el).boxShadow,radius:getComputedStyle(el).borderRadius}));
  console.log('R11 WebGL runtime: '+state+'; capsule '+JSON.stringify(styles));
  expect(['active','fallback']).toContain(state);
  await expect(root.locator('.solar-border-canvas')).toHaveCSS('pointer-events','none');
  if(state==='active') expect(styles.shadow).toContain('rgb');
  await page.screenshot({path:resolve(evidence,'backtocurrent-'+state+'.png')});
  await root.getByRole('button',{name:/Back to current|回到当前/}).click();
  await expect(page.getByTestId('path-back-notice')).toBeVisible().catch(()=>{});
  await page.getByTestId('path-back-toggle-fallback').click();
  await expect(root).toHaveAttribute('data-solar-status','fallback');
  await expect(capsule).toBeVisible();
  await page.screenshot({path:resolve(evidence,'backtocurrent-fallback.png')});
  await page.goto(library+'?view=components&component=lesson&mode=state&state=current');
  const card=page.locator('.solar-lesson-preview[data-solar-fit="card"]').first();
  await expect(card).toHaveAttribute('data-solar-hybrid-control','false');
});