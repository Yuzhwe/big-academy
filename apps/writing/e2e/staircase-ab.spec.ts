import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { expect, test } from '@playwright/test';

const evidenceDir = resolve(import.meta.dirname, '../docs/evidence/staircase-ab');

for (const variant of ['A', 'B'] as const) {
  test('E-01 diagonal interaction and real course permissions — ' + variant, async ({ page }) => {
    test.setTimeout(60_000);
    mkdirSync(evidenceDir, { recursive: true });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    const scene = page.locator('.staircase-viewport');

    await page.getByRole('button', { name: new RegExp('^' + variant + ' ·') }).click();
    await expect(scene).toHaveAttribute('data-variant', variant);
    await expect(scene).toHaveAttribute('data-rise-px', /^[0-9]+$/);
    await page.screenshot({ path: resolve(evidenceDir, variant + '-1440.png'), fullPage: false });

    const initial = Number(await scene.getAttribute('data-camera-x'));
    await scene.focus();
    await page.keyboard.press('ArrowRight');
    await expect.poll(async () => Number(await scene.getAttribute('data-camera-x'))).toBeGreaterThan(initial);
    await page.keyboard.press('Home');
    await expect(scene).toHaveAttribute('data-camera-x', '0');

    await scene.hover({ position: { x: 550, y: 250 } });
    await page.mouse.wheel(640, 0);
    await expect.poll(async () => Number(await scene.getAttribute('data-camera-x'))).toBeGreaterThan(0);
    await page.keyboard.press('End');
    const end = Number(await scene.getAttribute('data-camera-x'));
    expect(end).toBeGreaterThan(0);

    await scene.focus();
    await page.keyboard.press('Home');
    // Permission checks belong to the course session, not this A/B visual switch.
    await page.locator('[data-lesson-focus="G2-O:2"]').click();
    await expect(page.getByTestId('locked-note')).toContainText(/Lesson 1/);
    await expect(page).toHaveURL(/\/$/);

    await page.setViewportSize({ width: 834, height: 1112 });
    await page.getByRole('button', { name: '中文' }).click();
    await expect(scene).toHaveAttribute('data-variant', variant);
    await page.screenshot({ path: resolve(evidenceDir, variant + '-834-zh.png'), fullPage: false });
  });
}
