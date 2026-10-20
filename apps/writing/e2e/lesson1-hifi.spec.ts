import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { expect, test } from '@playwright/test';

const evidenceDir = resolve(import.meta.dirname, '../docs/evidence/lesson1');

test('Lesson 1 eight screens from the staircase', async ({ page }) => {
  test.setTimeout(90_000);
  mkdirSync(evidenceDir, { recursive: true });
  const shot = (name: string) => page.screenshot({ path: resolve(evidenceDir, `${name}.png`) });

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await expect(page.locator('[data-ab-variant="A"]')).toBeVisible();
  await expect(page.getByTestId('unit').first()).toBeVisible();
  await shot('staircase-a-1440');

  await page.locator('[data-lesson-focus="G2-O:1"]').click();
  await expect(page.locator('[data-screen="L2-04.learn"]')).toBeVisible();
  await page.getByRole('button', { name: 'All activity screens' }).click();
  await expect(page.getByRole('dialog', { name: 'All activity screens' })).toBeVisible();
  await shot('indicator-popover-1440');
  await page.keyboard.press('Escape');

  await page.getByTestId('lesson-footer').getByRole('button', { name: 'Next' }).click();
  await page.locator('.course-choice', { hasText: 'Our school should have a garden' }).click();
  await page.getByTestId('lesson-footer').getByRole('button', { name: 'Check' }).click();
  await expect(page.getByTestId('feedback')).toContainText(/Right/);
  await page.getByTestId('lesson-footer').getByRole('button', { name: 'Next' }).click();

  await page.getByRole('button', { name: 'believe', exact: true }).click();
  await page.getByTestId('lesson-footer').getByRole('button', { name: 'Check' }).click();
  await page.getByTestId('lesson-footer').getByRole('button', { name: 'Next' }).click();

  for (const text of ['Dogs are the best pets', 'every kid should learn to swim', 'School lunch should have more fruit']) {
    await page.locator('.course-choice', { hasText: text }).click();
  }
  await page.getByTestId('lesson-footer').getByRole('button', { name: 'Check' }).click();
  await page.getByTestId('lesson-footer').getByRole('button', { name: 'Next' }).click();

  await expect(page.locator('[data-screen="L2-04.t.ss.L2-04"]')).toBeVisible();
  await page.getByTestId('word-card').filter({ hasText: /^garden$/ }).click();
  await expect(page.getByTestId('word-card').filter({ hasText: /^garden$/ })).toHaveAttribute('data-shake', 'true');
  for (const word of ['our', 'school', 'should', 'have', 'a', 'garden', 'for', 'two', 'big', 'reasons', '.']) {
    await page.getByTestId('word-card').filter({ hasText: new RegExp(`^${word === '.' ? '\\.' : word}$`) }).click();
  }
  await expect(page.getByTestId('build-line')).toContainText(/our school should have a garden/i);
  await shot('build-1440');
  await page.getByTestId('lesson-footer').getByRole('button', { name: 'Next' }).click();

  await page.getByTestId('frame-draft').fill('In my opinion, recess should last longer because children need time to play outside.');
  await page.getByTestId('lesson-footer').getByRole('button', { name: 'Check' }).click();
  await expect(page.getByTestId('feedback')).toBeVisible();
  await page.getByTestId('lesson-footer').getByRole('button', { name: 'Next' }).click();

  await page.getByTestId('apply-draft').fill(
    [
      'Our school should have a garden because students can grow food.',
      'I believe a school garden would teach every class how plants grow.',
      'I think our school garden should give children a real place to work.',
    ].join('\n'),
  );
  await page.getByTestId('lesson-footer').getByRole('button', { name: 'Check my writing' }).click();
  await expect(page.getByTestId('apply-passed')).toBeVisible();
  await shot('apply-1440');
  await page.getByTestId('lesson-footer').getByRole('button', { name: 'Next' }).click();

  await expect(page.locator('[data-screen="L2-04.check"]')).toBeVisible();
  await page.locator('.course-choice', { hasText: 'I believe every student should learn to cook' }).click();
  await page.getByTestId('lesson-footer').getByRole('button', { name: 'Next question' }).click();
  await page.locator('.course-choice', { hasText: 'Our school has 300 students' }).click();
  await page.getByTestId('lesson-footer').getByRole('button', { name: 'Next question' }).click();
  await page.getByRole('button', { name: 'should', exact: true }).click();
  await page.getByTestId('lesson-footer').getByRole('button', { name: 'Next question' }).click();
  await page.getByTestId('writing-draft').fill('I believe kids should have a pet at home.');
  await page.getByTestId('lesson-footer').getByRole('button', { name: 'Hand in my check' }).click();
  await expect(page.getByTestId('check-score')).toBeVisible();
  await page.getByTestId('lesson-footer').getByRole('button', { name: 'End of lesson' }).click();
  await expect(page.locator('[data-outcome="passed"]')).toBeVisible();
  await shot('lesson-end-passed-1440');

  for (const [width, height, name] of [
    [1024, 768, '1024'],
    [834, 1112, '834'],
    [390, 844, '390'],
  ] as const) {
    await page.setViewportSize({ width, height });
    await shot(`lesson-end-${name}`);
  }
});
