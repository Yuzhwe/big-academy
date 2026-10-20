import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { expect, test, type Page } from '@playwright/test';

const evidenceDir = resolve(import.meta.dirname, '../docs/evidence/lesson1');
const APPLY_PASS = [
  'I think our school should have a garden.',
  'I believe a school garden should help us learn.',
  'Our school should have a garden because it gives us real work.',
].join('\n');
const BUILD_ORDER = ['our', 'school', 'should', 'have', 'a', 'garden', 'for', 'two', 'big', 'reasons', '.'];

async function shot(page: Page, name: string) {
  await page.screenshot({ path: resolve(evidenceDir, `${name}.png`), fullPage: false });
}

async function clickTestId(page: Page, testId: string) {
  await page.getByTestId('lesson-footer').getByTestId(testId).click();
}

async function openLesson(page: Page) {
  await page.locator('[data-lesson-focus="G2-O:1"]').click();
  await expect(page.locator('[data-screen="L2-04.learn"]')).toBeVisible();
}

async function reachApply(page: Page, capture = false) {
  await clickTestId(page, 'next');
  await expect(page.locator('[data-screen="L2-04.t.ts1"]')).toBeVisible();
  await page.locator('.ba-choice__option', { hasText: 'Gardens have plants.' }).click();
  await clickTestId(page, 'check');
  await expect(page.getByTestId('feedback')).toContainText(/You chose A/);
  if (capture) await shot(page, '02-pick-incorrect-1440');
  await page.keyboard.press('b');
  await expect(page.getByRole('radio', { name: /Our school should have a garden/ })).toBeChecked();
  await clickTestId(page, 'check');
  await expect(page.getByTestId('feedback')).toContainText(/Right\. You chose B/);
  if (capture) await shot(page, '02-pick-correct-1440');

  await clickTestId(page, 'next');
  await expect(page.locator('[data-screen="L2-04.t.ts4"]')).toBeVisible();
  if (capture) {
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.goto('/?start=lesson');
    await expect(page.locator('[data-screen="L2-04.t.ts4"]')).toBeVisible();
    await page.getByTestId('lesson-footer').getByTestId('back').click();
    await expect(page.locator('[data-screen="L2-04.t.ts1"]')).toBeVisible();
    await expect(page.getByRole('radio', { name: /Our school should have a garden/ })).toBeChecked();
    await clickTestId(page, 'next');
    await expect(page.locator('[data-screen="L2-04.t.ts4"]')).toBeVisible();
  }
  await page.getByRole('button', { name: 'class', exact: true }).click();
  await clickTestId(page, 'check');
  await expect(page.locator('[data-screen="L2-04.t.ts4"]')).toBeVisible();
  await page.getByRole('button', { name: 'believe', exact: true }).click();
  await clickTestId(page, 'check');
  await expect(page.getByTestId('lesson-footer').getByTestId('next')).toBeVisible();
  if (capture) await shot(page, '03-tapword-1440');

  await clickTestId(page, 'next');
  await expect(page.locator('[data-screen="L2-04.t.ts3"]')).toBeVisible();
  await page.locator('.ba-choice__option', { hasText: 'Dogs are the best pets' }).click();
  await page.locator('.ba-choice__option', { hasText: 'every kid should learn to swim' }).click();
  await page.locator('.ba-choice__option', { hasText: 'School lunch should have more fruit' }).click();
  if (capture) {
    await page.setViewportSize({ width: 390, height: 844 });
    await shot(page, '04-multi-390');
    await page.setViewportSize({ width: 1440, height: 900 });
    await shot(page, '04-multi-1440');
  }
  await clickTestId(page, 'check');
  await expect(page.getByTestId('feedback')).toContainText(/Right/);

  await clickTestId(page, 'next');
  await expect(page.locator('[data-screen="L2-04.t.ss.L2-04"]')).toBeVisible();
  if (capture) await shot(page, '05-build-1440');
  for (const word of BUILD_ORDER) {
    await page.getByRole('button', { name: word, exact: true }).click();
  }
  await expect(page.getByTestId('built-sentence')).toContainText('Our school should have a garden for two big reasons.');
  await expect(page.getByTestId('lesson-footer').getByTestId('next')).toBeVisible();

  await clickTestId(page, 'next');
  await expect(page.locator('[data-screen="L2-04.t.ts8"]')).toBeVisible();
  if (capture) await shot(page, '06-frame-1440');
  const sentence = page.getByRole('textbox', { name: 'Your sentence' });
  await sentence.fill('In my opinion, recess should be good because it is nice.');
  await clickTestId(page, 'check');
  await expect(page.locator('[data-screen="L2-04.t.ts8"]')).toBeVisible();
  await expect(page.getByTestId('lesson-footer').getByTestId('next')).toHaveCount(0);
  await sentence.fill('In my opinion, recess should be longer because kids need time to run.');
  await clickTestId(page, 'check');
  await expect(page.getByTestId('lesson-footer').getByTestId('next')).toBeVisible();

  await clickTestId(page, 'next');
  await expect(page.locator('[data-screen="L2-04.apply"]')).toBeVisible();
}

async function passCheck(page: Page) {
  await page.locator('.ba-choice__option', { hasText: 'every student should learn to cook' }).click();
  await clickTestId(page, 'next-question');
  await expect(page.locator('[data-task-index="7"]')).toHaveAttribute('aria-current', 'step');
  await page.locator('.ba-choice__option', { hasText: 'Our school has 300 students' }).click();
  await clickTestId(page, 'next-question');
  await page.getByRole('button', { name: 'should', exact: true }).click();
  await clickTestId(page, 'next-question');
  await page.getByRole('textbox', { name: 'Your sentence' }).fill('I think kids should have a pet at home.');
  await clickTestId(page, 'hand-in-check');
  await expect(page.getByTestId('check-result')).toContainText(/You passed this check/);
}

test.describe('L2 lesson 1 eight screens', () => {
  test.use({ actionTimeout: 10_000 });
  test.beforeAll(() => {
    mkdirSync(evidenceDir, { recursive: true });
  });

  test('walks the original eight screens in English', async ({ page }) => {
    test.setTimeout(120_000);
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    await openLesson(page);
    await expect(page.getByText(/top bun/i).first()).toBeVisible();
    await shot(page, '01-learn-1440');
    await page.setViewportSize({ width: 1024, height: 768 });
    await shot(page, '01-learn-1024');
    await page.setViewportSize({ width: 834, height: 1112 });
    await shot(page, '01-learn-834');
    await page.setViewportSize({ width: 390, height: 844 });
    await shot(page, '01-learn-390');
    await page.setViewportSize({ width: 1440, height: 900 });

    await reachApply(page, true);
    await shot(page, '07-apply-1440');
    await page.getByRole('textbox', { name: /Write 3 different topic sentences/ }).fill('Hello there friend');
    await clickTestId(page, 'check-writing');
    await expect(page.getByTestId('move-on')).toHaveCount(0);
    await page.getByRole('textbox', { name: /Write 3 different topic sentences/ }).fill(APPLY_PASS);
    await clickTestId(page, 'check-writing');
    await expect(page.getByTestId('feedback')).toContainText(/own writing/);
    await expect(page.locator('[data-lesson-id="G2-O:2"]')).toHaveCount(0);

    await clickTestId(page, 'next');
    await expect(page.locator('[data-screen="L2-04.check"]')).toBeVisible();
    await expect(page.locator('[data-task-index="7"]')).toHaveAttribute('aria-current', 'step');
    await shot(page, '08-check-question-1440');
    const option = page.locator('.ba-choice__option').first();
    const box = await option.boundingBox();
    expect(box?.height ?? 0).toBeGreaterThanOrEqual(50);

    await passCheck(page);
    await shot(page, '08-check-results-1440');
    await clickTestId(page, 'next');
    await expect(page.getByTestId('lesson-celebration')).toBeVisible();
    await expect(page.locator('[data-celebration-canvas="lesson"]')).toBeVisible();
    await shot(page, '09-celebration-1440');
    await page.getByRole('button', { name: 'OK' }).click();
    await page.getByRole('button', { name: 'Back to my path' }).click();
    await expect(page.locator('[data-lesson-id="G2-O:1"]')).toHaveAttribute('data-state', 'review');
    await page.locator('[data-lesson-focus="G2-O:2"]').click();
    await expect(page.getByTestId('locked-note')).toHaveCount(0);
    await shot(page, '10-lesson2-opened-1440');
  });

  test('warns on a blank check, then a reduced-motion ending', async ({ page }) => {
    test.setTimeout(120_000);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    await openLesson(page);
    await reachApply(page);
    await page.getByRole('textbox', { name: /Write 3 different topic sentences/ }).fill(APPLY_PASS);
    await clickTestId(page, 'check-writing');
    await clickTestId(page, 'next');
    await expect(page.locator('[data-screen="L2-04.check"]')).toBeVisible();
    await clickTestId(page, 'next-question');
    await clickTestId(page, 'next-question');
    await clickTestId(page, 'next-question');
    await clickTestId(page, 'hand-in-check');
    await expect(page.getByTestId('blank-warning')).toContainText(/still blank/);
    await shot(page, '08-check-blank-1440');
    await clickTestId(page, 'hand-in-check');
    await expect(page.getByTestId('check-result')).toContainText(/Not yet/);
    await shot(page, '08-check-retry-1440');
    await page.getByTestId('retry-check').click();
    await expect(page.getByText(/city or a village/)).toBeVisible();
    await page.locator('.ba-choice__option', { hasText: 'living in a village is better' }).click();
    await clickTestId(page, 'next-question');
    await page.locator('.ba-choice__option', { hasText: 'My shoe is blue' }).click();
    await clickTestId(page, 'next-question');
    await page.locator('.ba-choice__option', { hasText: 'every student should learn to cook' }).click();
    await clickTestId(page, 'next-question');
    await page.getByRole('textbox', { name: 'Your sentence' }).fill('I think kids should have a pet at home.');
    await clickTestId(page, 'hand-in-check');
    await expect(page.getByTestId('check-result')).toContainText(/You passed this check/);
    await clickTestId(page, 'next');
    const celebration = page.getByTestId('lesson-celebration');
    await expect(celebration).toBeVisible();
    await expect(celebration).toHaveAttribute('data-reduced', 'true');
    await expect(celebration).toContainText(/Ribbons stay off/);
    await expect(page.locator('[data-celebration-canvas="lesson"]')).toHaveCount(0);
    await shot(page, '09-celebration-reduced-1440');
  });

  test('shows the learn screen in Chinese', async ({ page }) => {
    test.setTimeout(60_000);
    await page.setViewportSize({ width: 834, height: 1112 });
    await page.goto('/?locale=zh');
    await expect(page.getByRole('heading', { name: /第 2 级/ })).toBeVisible();
    await shot(page, 'path-834-zh');
    await openLesson(page);
    await expect(page.locator('[data-screen="L2-04.learn"]')).toBeVisible();
    await shot(page, '01-learn-834-zh');
    await page.setViewportSize({ width: 390, height: 844 });
    await clickTestId(page, 'next');
    await expect(page.locator('[data-screen="L2-04.t.ts1"]')).toBeVisible();
    await shot(page, '02-pick-390-zh');
  });
});
