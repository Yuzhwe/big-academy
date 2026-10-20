import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { expect, test } from '@playwright/test';

const evidenceDir = resolve(import.meta.dirname, '../docs/evidence/lesson-one');

test('Lesson 1 opens from staircase A and checks a real topic sentence', async ({ page }) => {
  test.setTimeout(60_000);
  mkdirSync(evidenceDir, { recursive: true });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await expect(page.locator('.course-app')).toHaveAttribute('data-ab-variant', 'A');
  await expect(page.locator('.course-unit').first()).toBeVisible();
  const fold = await page.locator('.course-unit').first().evaluate((node) => getComputedStyle(node, '::before').content);
  expect(fold).not.toBe('none');

  await page.locator('[data-lesson-focus="G2-O:1"]').click();
  await expect(page.getByRole('heading', { name: /Topic sentences/ })).toBeVisible();
  await expect(page.getByText('A topic sentence tells the topic and what you think.')).toBeVisible();
  await page.screenshot({ path: resolve(evidenceDir, 'learn-1440.png') });

  await page.getByTestId('next').click();
  await expect(page.getByRole('heading', { name: /good topic sentence/ })).toBeVisible();
  await page.getByText('Our school should have a garden for two big reasons.').click();
  await page.getByTestId('check').click();
  await expect(page.getByTestId('feedback')).toContainText(/Right\. You chose B/);
  await page.screenshot({ path: resolve(evidenceDir, 'pick-1440.png') });

  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByTestId('feedback')).toBeVisible();
  await page.screenshot({ path: resolve(evidenceDir, 'pick-390.png') });
});
