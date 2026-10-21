import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { expect, test } from '@playwright/test';

const evidenceDir = resolve(import.meta.dirname, '../docs/evidence/slice');

test('E-01 to lesson 1 check and back', async ({ page }) => {
  test.setTimeout(60_000);
  mkdirSync(evidenceDir, { recursive: true });

  async function shot(name: string) {
    await page.screenshot({ path: resolve(evidenceDir, `${name}.png`), fullPage: false });
  }

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /Level 2/ })).toBeVisible();
  await expect(page.getByTestId('level-goal')).toBeVisible();
  await shot('path-1440');

  await page.locator('[data-lesson-focus="G2-O:1"]').click();
  await expect(page.getByText(/top bun/i).first()).toBeVisible();
  await shot('lesson-learn-1440');

  await page.getByRole('button', { name: 'Next' }).click();
  await page.locator('.choice-row', { hasText: 'Our school should have a garden' }).click();
  await expect(page.getByRole('radio', { name: /Our school should have a garden/ })).toBeChecked();
  await page.getByTestId('lesson-footer').getByRole('button', { name: 'Check' }).click();
  await expect(page.getByTestId('feedback')).toContainText(/Right\. You chose B/);
  await shot('lesson-check-1440');

  await page.getByRole('button', { name: 'Back to my path' }).click();
  await expect(page.locator('[data-lesson-id="G2-O:1"]')).toHaveAttribute('data-state', 'continue');
  await shot('path-continue-1440');

  const locked = page.locator('[data-lesson-focus="G2-O:2"]');
  await expect(locked).toBeDisabled();
  await expect(page.locator('[data-lesson-id="G2-O:2"]')).toContainText(/After Lesson 1/);
  await shot('path-locked-1440');

  await page.setViewportSize({ width: 1024, height: 768 });
  await shot('path-1024');

  await page.setViewportSize({ width: 834, height: 1112 });
  await page.getByRole('button', { name: '中文' }).click();
  await expect(page.getByRole('heading', { name: /第 2 级/ })).toBeVisible();
  await expect(page.locator('[data-lesson-id="G2-O:1"]')).toContainText('继续');
  await shot('path-834-zh');
});
