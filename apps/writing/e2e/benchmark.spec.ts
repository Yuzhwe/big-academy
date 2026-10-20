import { test, expect, type Page } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import AxeBuilder from '@axe-core/playwright';
import { resolve } from 'node:path';
const dir = resolve(import.meta.dirname, '../docs/evidence/benchmark');
mkdirSync(dir, { recursive: true });
const scans: { screen: string; violations: unknown[] }[] = [];
async function shot(p: Page, name: string) {
  await p.screenshot({ path: resolve(dir, `${name}.png`), fullPage: false });
  const activity = p.locator('.lesson-activity[data-screen]');
  const screen = (await activity.count()) ? await activity.first().getAttribute('data-screen') : null;
  if (screen && !scans.some((x) => x.screen === screen)) {
    const result = await new AxeBuilder({ page: p }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
    scans.push({
      screen,
      violations: result.violations.map((x) => ({
        id: x.id,
        impact: x.impact,
        nodes: x.nodes.map((n) => n.target),
      })),
    });
    writeFileSync(resolve(dir, 'accessibility-screens.json'), JSON.stringify(scans, null, 2));
    expect(result.violations).toEqual([]);
  }
}
const next = (p: Page) => p.getByTestId('lesson-footer').getByRole('button').last().click();
const state = (p: Page) => p.evaluate(() => JSON.parse(localStorage.getItem('g2o_unit_state_v4')!));
async function start(p: Page) {
  await p.goto('/');
  await p.locator('[data-lesson-focus="G2-O:1"]').click();
  await expect(p.locator('[data-screen="L2-04.learn"]')).toBeVisible();
}
const applyText =
  'I think a garden would help us learn about plants.\nOur school should have a garden to grow fresh vegetables.\nThe best place for outdoor science lessons is our garden.';
async function practice(p: Page, evidence = false) {
  await next(p);
  await p.locator('.ba-choice').filter({ hasText: 'Our school should have a garden' }).click();
  await next(p);
  if (evidence) await shot(p, '02-correct');
  await next(p);
  await p.getByRole('button', { name: 'believe', exact: true }).click();
  await next(p);
  if (evidence) await shot(p, '03-tapword');
  await next(p);
  for (const name of [/Dogs are the best/, /In my opinion, every/, /School lunch should/])
    await p.locator('.ba-choice').filter({ hasText: name }).click();
  await next(p);
  if (evidence) await shot(p, '04-multiple');
  await next(p);
  await p.getByRole('button', { name: 'garden', exact: true }).click();
  await p.getByRole('button', { name: 'garden', exact: true }).click();
  await p.getByRole('button', { name: 'garden', exact: true }).click();
  expect((await state(p)).tasks['L2-04.skill:ss.L2-04'].tries).toBe(0);
  if (evidence) await shot(p, '05-build-hint');
  for (const word of ['our', 'school', 'should', 'have', 'a', 'garden', 'for', 'two', 'big', 'reasons', '.'])
    await p.getByRole('button', { name: word, exact: true }).click();
  if (evidence) await shot(p, '05-build-complete');
  await next(p);
  await p
    .getByRole('textbox', { name: 'Your sentence' })
    .fill('In my opinion, recess should be longer because kids need time to play.');
  await next(p);
  if (evidence) await shot(p, '06-frame');
  await next(p);
}
test('real eight-screen pass, back/resume, assessment review and Lesson End', async ({ page: p }) => {
  test.setTimeout(90000);
  await p.setViewportSize({ width: 1440, height: 900 });
  await p.goto('/');
  await shot(p, '00-staircase-desktop');
  await p.locator('[data-lesson-focus="G2-O:1"]').click();
  await shot(p, '01-learn-desktop');
  await expect(p.getByRole('button', { name: /Task 2.*locked/ })).toBeDisabled();
  await practice(p, true);
  await p.getByRole('textbox', { name: 'Your writing' }).fill(applyText);
  await next(p);
  await expect(p.getByTestId('apply-feedback')).toContainText('Yes.');
  await shot(p, '07-apply-pass');
  await p.getByRole('button', { name: 'Back to my path', exact: true }).click();
  await p.reload();
  await p.locator('[data-lesson-focus="G2-O:1"]').click();
  await expect(p.getByRole('textbox', { name: 'Your writing' })).toHaveValue(applyText);
  await shot(p, '07-resume');
  await next(p);
  await p.locator('.ba-choice').filter({ hasText: 'I believe every student' }).click();
  await next(p);
  await p.locator('.ba-choice').filter({ hasText: '300 students' }).click();
  await next(p);
  await p.getByRole('button', { name: 'should', exact: true }).click();
  await next(p);
  await p.getByRole('textbox').fill('I believe kids should have a pet at home.');
  await shot(p, '08-assessment-writing');
  await next(p);
  await expect(p.getByTestId('check-result')).toContainText('4 of 4');
  expect((await state(p)).checks['L2-04.check'].passed).toBe(true);
  await shot(p, '08-pass-results');
  await p.getByTestId('result-row').first().click();
  await expect(p.getByRole('radio', { name: /I believe every/ })).toBeDisabled();
  await shot(p, '08-graded-review');
  await p.getByRole('button', { name: 'All results', exact: true }).click();
  await next(p);
  await expect(p.getByTestId('lesson-end')).toHaveAttribute('data-mastery', 'passed');
  await shot(p, '09-lesson-end-pass');
  await p.getByRole('button', { name: 'Back to my path', exact: true }).click();
  await expect(p.locator('[data-lesson-id="G2-O:1"]')).toHaveAttribute('data-state', 'review');
  await p.locator('[data-lesson-focus="G2-O:1"]').click();
  await expect(p.locator('[data-screen="L2-04.learn"]')).toBeVisible();
});
test('wrong feedback, two misses/shown, Apply move-on, both failed assessment rounds', async ({
  page: p,
}) => {
  test.setTimeout(90000);
  await p.setViewportSize({ width: 1024, height: 768 });
  await start(p);
  await next(p);
  await next(p);
  expect((await state(p)).tasks['L2-04.skill:ts1']?.tries ?? 0).toBe(0);
  await p.locator('.ba-choice').filter({ hasText: 'Gardens have plants' }).click();
  await next(p);
  await expect(p.getByTestId('feedback')).toContainText('Try again');
  await shot(p, '02-wrong-tablet');
  await p.locator('.ba-choice').filter({ hasText: 'I like flowers' }).click();
  await next(p);
  await expect(p.getByText('Right answer', { exact: true })).toBeVisible();
  await shot(p, '02-shown-tablet');
  await next(p);
  await p.getByRole('button', { name: 'believe', exact: true }).click();
  await next(p);
  await next(p);
  for (const name of [/Dogs are the best/, /In my opinion, every/, /School lunch should/])
    await p.locator('.ba-choice').filter({ hasText: name }).click();
  await next(p);
  await next(p);
  for (const word of ['our', 'school', 'should', 'have', 'a', 'garden', 'for', 'two', 'big', 'reasons', '.'])
    await p.getByRole('button', { name: word, exact: true }).click();
  await next(p);
  await p.getByRole('textbox').fill('In my opinion, recess should be longer because it is good.');
  await next(p);
  await expect(p.getByTestId('feedback')).toContainText("doesn't tell");
  await next(p);
  await shot(p, '06-shown-tablet');
  await next(p);
  await p.getByRole('textbox').fill('The garden has plants.');
  await next(p);
  await expect(p.getByTestId('apply-feedback')).toBeVisible();
  await next(p);
  await p.getByRole('button', { name: 'Move on for now', exact: true }).click();
  await shot(p, '07-apply-move-on');
  await next(p);
  for (let round = 0; round < 2; round++) {
    for (let q = 0; q < 3; q++) await next(p);
    await next(p);
    await expect(p.getByTestId('feedback')).toContainText('still blank');
    await shot(p, `08-blank-warning-${round}`);
    await next(p);
    await expect(p.getByTestId('check-result')).toContainText('0 of 4');
    await shot(p, `08-fail-set-${round + 1}`);
    if (round === 0) {
      await next(p);
      await expect(p.getByRole('heading', { name: /city or a village/ })).toBeVisible();
    }
  }
  expect((await state(p)).checks['L2-04.check'].passed).toBe(false);
  await next(p);
  await expect(p.getByTestId('lesson-end')).toHaveAttribute('data-mastery', 'not-mastered');
  await shot(p, '09-lesson-end-fail');
  await p.getByRole('button', { name: 'Stop for today', exact: true }).click();
  await expect(p.getByRole('heading', { name: 'Your work is saved.', exact: true })).toBeVisible();
  await p.getByRole('button', { name: 'Back to my path', exact: true }).click();
  await p.locator('[data-lesson-focus="G2-O:2"]').click();
  await expect(p.getByRole('heading', { name: 'Your work is saved.', exact: true })).toBeVisible();
  await p.getByRole('button', { name: 'Start Lesson 2', exact: true }).click();
  await expect(p.getByRole('heading', { name: /Reasons & closing/ })).toBeVisible();
});
for (const v of [
  { width: 1440, height: 900 },
  { width: 1024, height: 768 },
  { width: 834, height: 1112 },
  { width: 390, height: 844 },
])
  test(`responsive ${v.width}: EN/ZH, circle popover, keyboard, focus and reduced motion`, async ({
    page: p,
  }) => {
    await p.setViewportSize(v);
    await p.emulateMedia({ reducedMotion: 'reduce' });
    await p.goto('/');
    await shot(p, `path-${v.width}`);
    await p.getByRole('button', { name: '中文', exact: true }).click();
    await shot(p, `path-${v.width}-zh`);
    await p.locator('[data-lesson-focus="G2-O:1"]').click();
    await shot(p, `learn-${v.width}-zh`);
    expect(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const centered = await p.locator('.lesson-topbar__center').boundingBox();
    expect(Math.abs(centered!.x + centered!.width / 2 - v.width / 2)).toBeLessThan(1);
    if (v.width < 1100) {
      const trigger = p.getByRole('button', { name: '所有活动页面', exact: true });
      await trigger.click();
      const dialog = p.getByRole('dialog', { name: 'All activity screens', exact: true });
      await expect(dialog.locator('[data-component="BA-UI-012"]')).toHaveCount(8);
      await shot(p, `popover-${v.width}`);
      await p.keyboard.press('Escape');
      await expect(dialog).not.toBeVisible();
      await expect(trigger).toBeFocused();
    }
    await next(p);
    await p.getByRole('button', { name: 'Hide Chinese support', exact: true }).click();
    await p.locator('.course-title').focus();
    await p.keyboard.press('b');
    await expect(p.getByRole('radio', { name: /B Our school/ })).toBeChecked();
    await p.keyboard.press('Enter');
    await expect(p.getByTestId('feedback')).toContainText('Right.');
  });

test('all L2 Unit folds preserve anchors and keyboard scene traversal', async ({ page: p }) => {
  await p.setViewportSize({ width: 1440, height: 900 });
  await p.goto('/');
  const scene = p.getByRole('region', { name: /Diagonal lesson staircase/ });
  const indices = await p
    .locator('.course-nodes>li')
    .evaluateAll((nodes) =>
      nodes.map((el, i) => (el.querySelector('.folded-unit') ? i : -1)).filter((i) => i >= 0),
    );
  for (const [unit, index] of indices.entries()) {
    await scene.focus();
    await p.keyboard.press('Home');
    for (let i = 0; i < index; i++) await p.keyboard.press('ArrowRight');
    await shot(p, `unit-${unit + 1}-desktop`);
  }
  await p.setViewportSize({ width: 834, height: 1112 });
  await scene.focus();
  await p.keyboard.press('Home');
  await p.keyboard.press('ArrowRight');
  await shot(p, 'unit-tablet');
  const before = await p.locator('.folded-unit').first().boundingBox();
  await p.addStyleTag({
    content:
      '.folded-unit {clip-path:none!important}.folded-unit::after,.folded-unit::before{display:none!important}',
  });
  const after = await p.locator('.folded-unit').first().boundingBox();
  expect(after).toEqual(before);
  await shot(p, 'unit-before-flat-tablet');
});

test('touch selection, long headings, 200% equivalent reflow and independent Coach scroll', async ({
  browser,
}) => {
  const ctx = await browser.newContext({
    viewport: { width: 720, height: 450 },
    deviceScaleFactor: 2,
    hasTouch: true,
  });
  const p = await ctx.newPage();
  await start(p);
  await p.locator('.lesson-topbar__name').evaluate((el) => {
    el.textContent = 'A very long topic sentence lesson title 这是一个很长的主题句课程标题';
  });
  expect(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await shot(p, 'zoom-200-equivalent');
  await next(p);
  await p.locator('.ba-choice').filter({ hasText: 'Our school should have a garden' }).tap();
  await expect(p.getByRole('radio', { name: /B Our school/ })).toBeChecked();
  await next(p);
  await p.setViewportSize({ width: 1024, height: 450 });
  await p.getByRole('button', { name: /Task 1: Learn, done/ }).click();
  for (let i = 0; i < 3; i++) await p.getByRole('button', { name: 'Show me another', exact: true }).click();
  const coach = p.getByTestId('coach'),
    paper = p.getByTestId('activity');
  const oldPaper = await paper.evaluate((el) => el.scrollTop),
    oldFooter = await p.getByTestId('lesson-footer').boundingBox();
  const overflow = await coach.evaluate((el) => el.scrollHeight > el.clientHeight);
  expect(overflow).toBe(true);
  await coach.evaluate((el) => {
    el.scrollTop = el.scrollHeight;
  });
  expect(await paper.evaluate((el) => el.scrollTop)).toBe(oldPaper);
  expect(await p.getByTestId('lesson-footer').boundingBox()).toEqual(oldFooter);
  await shot(p, 'coach-independent-scroll');
  await ctx.close();
});
