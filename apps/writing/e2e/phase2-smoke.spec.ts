import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { expect, test, type Page } from '@playwright/test';

const evidenceDir = resolve('/opt/cursor/artifacts/phase2');

async function shot(page: Page, name: string) {
  mkdirSync(evidenceDir, { recursive: true });
  await page.screenshot({ path: resolve(evidenceDir, name + '.png'), fullPage: false });
}

async function openLesson(page: Page) {
  await page.goto('/');
  await page.locator('[data-lesson-focus="G2-O:1"]').click();
  await expect(page.getByRole('button', { name: 'Previous' })).toBeDisabled();
}

test('lesson 1 unlock ladder, wrong then shown, reload, and Chinese chrome', async ({ page }) => {
  test.setTimeout(90_000);
  await page.setViewportSize({ width: 1440, height: 900 });
  await openLesson(page);
  const steps = page.getByRole('button', { name: /^Task \d+:/ });
  await expect(steps).toHaveCount(8);
  await expect(steps.nth(2)).toBeDisabled();
  await shot(page, 'unlock-ladder');

  await page.getByRole('button', { name: 'Next' }).click();
  await page.getByRole('radio', { name: 'Gardens have plants.' }).click();
  await page.getByTestId('lesson-footer').getByRole('button', { name: 'Check' }).click();
  await expect(page.getByTestId('feedback')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Next' })).toHaveCount(0);
  await shot(page, 'wrong-retry');

  await page.reload();
  await expect(page.locator('.course-app')).toHaveAttribute('data-view', 'path');
  await page.locator('[data-lesson-focus="G2-O:1"]').click();
  await expect(page.getByRole('radio', { name: /Gardens have plants/ })).toHaveAttribute('aria-label', /Wrong/);
  await shot(page, 'reload-restore');

  await page.getByRole('radio', { name: /Gardens have plants/ }).click();
  await page.getByTestId('lesson-footer').getByRole('button', { name: 'Check' }).click();
  await expect(page.getByTestId('feedback')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Next' })).toBeVisible();
  await shot(page, 'wrong-shown');

  await page.getByRole('button', { name: '中文' }).click();
  await expect(page.getByRole('radio', { name: 'Gardens have plants.' })).toBeVisible();
  await expect(page.getByRole('button', { name: '上一屏' })).toBeVisible();
  await expect(page.getByRole('button', { name: /下一页|下一节/ })).toBeVisible();
  await shot(page, 'zh-mode-b-choice');
});

test('real Apply check and P7 numeral stay off the eight lesson steps', async ({ page }) => {
  test.setTimeout(120_000);
  await page.setViewportSize({ width: 1280, height: 900 });
  await openLesson(page);
  await page.getByRole('button', { name: 'Next' }).click();

  await page.getByRole('radio', { name: /Our school should have a garden/ }).click();
  await page.getByTestId('lesson-footer').getByRole('button', { name: 'Check' }).click();
  await page.getByRole('button', { name: 'Next' }).click();

  await page.getByRole('button', { name: 'should', exact: true }).click();
  await page.getByTestId('lesson-footer').getByRole('button', { name: 'Check' }).click();
  await page.getByRole('button', { name: 'Next' }).click();

  for (const label of [
    'Dogs are the best pets for families.',
    'In my opinion, every kid should learn to swim.',
    'School lunch should have more fruit.',
  ]) {
    await page.getByRole('checkbox', { name: label }).click();
  }
  await page.getByTestId('lesson-footer').getByRole('button', { name: 'Check' }).click();
  await page.getByRole('button', { name: 'Next' }).click();

  for (const token of ['our', 'school', 'should', 'have', 'a', 'garden', 'for', 'two', 'big', 'reasons', '.']) {
    await page.getByRole('button', { name: token, exact: true }).click();
  }
  await expect(page.getByTestId('build-bench')).toContainText('Our school should have a garden');
  await page.getByRole('button', { name: 'Next' }).click();

  const frame = page.locator('textarea').first();
  await frame.fill('In my opinion, recess should be longer because kids need time to run.');
  await page.getByTestId('lesson-footer').getByRole('button', { name: 'Check', exact: true }).click();
  await page.getByRole('button', { name: 'Next' }).click();

  await expect(page.getByTestId('apply-canvas')).toBeVisible();
  await page.getByTestId('apply-canvas').fill(
    'I think our school should have a garden.\nI believe a school garden is the best idea.\nOur school should grow a garden for science.',
  );
  await page.getByTestId('lesson-footer').getByRole('button', { name: 'Check my writing' }).click();
  await expect(page.getByTestId('feedback')).toContainText(/Yes\. You used it/);
  await shot(page, 'apply-real-check');
  await page.getByRole('button', { name: 'Next' }).click();

  await expect(page.getByTestId('question-numeral')).toHaveText('1');
  await expect(page.getByRole('button', { name: /^Task \d+:/ })).toHaveCount(8);
  await page.getByRole('radio').nth(1).click();
  await page.getByRole('button', { name: 'Next question' }).click();
  await page.getByRole('radio').nth(2).click();
  await page.getByRole('button', { name: 'Next question' }).click();
  await page.getByRole('button', { name: 'should', exact: true }).click();
  await page.getByRole('button', { name: 'Next question' }).click();
  await expect(page.getByTestId('question-numeral')).toHaveText('4');
  await expect(page.getByRole('button', { name: /^Task \d+:/ })).toHaveCount(8);
  await shot(page, 'p7-numeral-vs-steps');
  await page.getByTestId('check-writing').fill('I think kids should have a pet at home.');
  await page.getByRole('button', { name: 'Hand in my check' }).click();
  await expect(page.getByTestId('check-result')).toContainText(/You passed this check/);
  const celebration = page.getByTestId('lesson-celebration');
  await expect(celebration).toBeVisible();
  await expect(celebration).toHaveAttribute('data-effects', 'ribbons:30 explosions:3');
  await expect(celebration).toHaveAttribute('data-played', 'true');
  await shot(page, 'lesson-ribbons');
  const progress = await page.evaluate(() => localStorage.getItem('g2o_unit_state_v4'));
  await celebration.getByRole('button', { name: 'OK' }).click();
  await expect(celebration).toHaveCount(0);
  await expect(page.getByTestId('check-result')).toContainText(/You passed this check/);
  expect(await page.evaluate(() => localStorage.getItem('g2o_unit_state_v4'))).toBe(progress);
  await expect(page.locator('.course-app')).toHaveAttribute('data-view', 'lesson');
  await shot(page, 'p7-passed');
});
