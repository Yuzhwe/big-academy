import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { expect, test } from '@playwright/test';

const evidence = resolve(import.meta.dirname, '../docs/evidence/r1');

test('R1 E-01 and eight authored Lesson 1 screens including P7 mastery', async ({ page }) => {
  test.setTimeout(120_000);
  mkdirSync(evidence, { recursive: true });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await expect(page.locator('.staircase-viewport')).toHaveAttribute('data-variant', 'A');
  await page.screenshot({ path: resolve(evidence, 'staircase-1440.png') });

  await page.locator('[data-lesson-focus="G2-O:1"]').click();
  await expect(page.locator('[data-template="P2"]')).toBeVisible();
  await expect(page.getByTestId('lesson-footer').getByRole('button', { name: 'Previous' })).toBeDisabled();
  await page.screenshot({ path: resolve(evidence, 'learn-1440.png') });
  await page.getByTestId('lesson-footer').getByRole('button', { name: 'Next' }).click();

  await expect(page.locator('[data-kind="task"]')).toBeVisible();
  await page.locator('.course-choice', { hasText: 'Our school should have a garden' }).click();
  await page.getByTestId('lesson-footer').getByRole('button', { name: 'Check' }).click();
  await expect(page.getByTestId('feedback')).toContainText(/Right/);
  await expect(page.locator('.course-choice[data-correct="true"]')).toHaveCount(1);
  await page.screenshot({ path: resolve(evidence, 'choice-correct-1440.png') });
  await page.getByTestId('lesson-footer').getByRole('button', { name: 'Next' }).click();

  await expect(page.locator('.course-words .course-word')).toHaveCount(9);
  await page.locator('.course-words').getByRole('button', { name: 'believe' }).click();
  await page.getByTestId('lesson-footer').getByRole('button', { name: 'Check' }).click();
  await expect(page.getByTestId('feedback')).toContainText(/Yes|Right|Good/);
  await page.getByTestId('lesson-footer').getByRole('button', { name: 'Next' }).click();

  for (const part of [/Dogs are the best pets/i, /In my opinion, every kid/i, /School lunch should/i]) {
    await page.getByRole('checkbox', { name: part }).click();
  }
  await page.getByTestId('lesson-footer').getByRole('button', { name: 'Check' }).click();
  await expect(page.getByTestId('feedback')).toBeVisible();
  await page.getByTestId('lesson-footer').getByRole('button', { name: 'Next' }).click();

  for (const word of ['our', 'school', 'should', 'have', 'a', 'garden', 'for', 'two', 'big', 'reasons', '.']) {
    await page.locator('.course-word-grid').getByRole('button', { name: word, exact: true }).click();
  }
  await expect(page.getByTestId('lesson-footer').getByRole('button', { name: 'Next' })).toBeEnabled();
  await page.screenshot({ path: resolve(evidence, 'guided-build-1440.png') });
  await page.getByTestId('lesson-footer').getByRole('button', { name: 'Next' }).click();

  await page.locator('#writing-frame').fill('In my opinion, recess should be longer because kids need to move.');
  await page.getByTestId('lesson-footer').getByRole('button', { name: 'Check' }).click();
  await expect(page.getByTestId('feedback')).toBeVisible();
  await page.getByTestId('lesson-footer').getByRole('button', { name: 'Next' }).click();

  const apply = [
    'I think our school should have a garden.',
    'Our school should build a garden so children can learn.',
    'In my opinion, a school garden would be better for nature.',
  ].join('\n');
  await page.locator('#apply-text').fill(apply);
  await page.reload();
  await expect(page.locator('#apply-text')).toHaveValue(apply);
  await page.getByTestId('lesson-footer').getByRole('button', { name: /Check my writing/i }).click();
  await expect(page.getByTestId('feedback')).toContainText(/criteria met/i);
  await page.screenshot({ path: resolve(evidence, 'apply-success-1440.png') });
  await page.getByTestId('lesson-footer').getByRole('button', { name: 'Next' }).click();

  await expect(page.locator('.course-question-number')).toHaveText('1');
  await page.locator('.course-assessment .course-choice').nth(1).click();
  await page.getByTestId('lesson-footer').getByRole('button', { name: 'Next question' }).click();
  await page.locator('.course-assessment .course-choice').nth(2).click();
  await page.getByTestId('lesson-footer').getByRole('button', { name: 'Next question' }).click();
  await expect(page.locator('.course-assessment .course-word')).toHaveCount(7);
  await page.locator('.course-assessment').getByRole('button', { name: 'should' }).click();
  await page.getByTestId('lesson-footer').getByRole('button', { name: 'Next question' }).click();
  await page.locator('.course-assessment textarea').fill('I think kids should have a pet at home.');
  await expect(page.locator('.course-assessment')).not.toContainText('You passed this check.');
  await page.getByTestId('lesson-footer').getByRole('button', { name: 'Hand in my check' }).click();
  await expect(page.locator('.course-assessment')).toContainText('You passed this check.');
  await page.screenshot({ path: resolve(evidence, 'p7-mastered-1440.png') });
  await page.reload();
  await expect(page.locator('.course-assessment')).toContainText('You passed this check.');
  await page.getByTestId('lesson-footer').getByRole('button', { name: 'End of lesson' }).click();
  await expect(page.locator('[data-kind="lesson_end"]')).toBeVisible();
  await page.screenshot({ path: resolve(evidence, 'lesson-end-1440.png') });
});

test('R1 responsive and bilingual evidence at four required viewports', async ({ page }) => {
  mkdirSync(evidence, { recursive: true });
  for (const [width, height] of [[1440, 900], [1024, 768], [834, 1112], [390, 844]]) {
    await page.setViewportSize({ width, height });
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /Level 2/ })).toBeVisible();
    await page.screenshot({ path: resolve(evidence, `path-${width}.png`) });
    await page.locator('[data-lesson-focus="G2-O:1"]').click();
    await page.screenshot({ path: resolve(evidence, `workspace-${width}.png`) });
  }
  await page.getByRole('button', { name: /Back to/i }).click();
  await page.getByRole('button', { name: '中文' }).click();
  await expect(page.getByRole('heading', { name: /第 2 级/ })).toBeVisible();
  await page.screenshot({ path: resolve(evidence, 'path-390-zh.png') });
});
