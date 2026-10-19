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


for (const variant of ['A', 'B'] as const) {
  test('card height never moves anchor / platform Y — ' + variant, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    await page.getByRole('button', { name: new RegExp('^' + variant + ' ·') }).click();
    const viewport = page.locator('.staircase-viewport');
    await expect(viewport).toHaveAttribute('data-anchor-basis', 'pedestal-y');
    const li = page.locator('.staircase-rail .course-nodes > li').filter({ has: page.locator('.stair-lesson-card') }).first();
    const before = await li.evaluate(el => {
      const r = el.getBoundingClientRect();
      return { top:r.top, bottom:r.bottom, height:r.height };
    });
    await li.locator('.stair-lesson-card__title').evaluate(el => {
      el.textContent = (el.textContent || '') + ' extra text to increase the height of this card'.repeat(14);
    });
    const after = await li.evaluate(el => {
      const r = el.getBoundingClientRect();
      return { top:r.top, bottom:r.bottom, height:r.height };
    });
    expect(after.height).toBeGreaterThan(before.height);
    expect(Math.abs(after.bottom - before.bottom)).toBeLessThanOrEqual(1);
    expect(after.top).toBeLessThan(before.top);
  });
}

test('desktop and 834: one row header with geometrically centered accessible Level Tablist', async ({ page }) => {
  await page.goto('/');
  for (const width of [1440, 834]) {
    await page.setViewportSize({ width, height: width === 1440 ? 900 : 1112 });
    const header = page.locator('.course-path__header');
    const tablist = header.getByRole('tablist');
    const language = header.getByRole('button', { name: '中文' });
    const title = header.locator('.course-path__header-title');
    await expect(tablist).toBeVisible();
    await expect(language).toBeVisible();
    const boxes = await Promise.all([header.boundingBox(), tablist.boundingBox(), title.boundingBox(), language.boundingBox()]);
    const [h, t, l, r] = boxes;
    expect(h && t && l && r).toBeTruthy();
    if (h && t && l && r) {
      expect(Math.abs(t.x + t.width / 2 - h.x - h.width / 2)).toBeLessThanOrEqual(1);
      expect(t.x).toBeGreaterThanOrEqual(l.x + l.width - 1);
      expect(t.x + t.width).toBeLessThanOrEqual(r.x + 1);
      expect(Math.abs(l.y + l.height / 2 - r.y - r.height / 2)).toBeLessThan(30);
    }
    await expect(tablist.locator('[aria-selected="true"]')).toHaveCount(1);
    await expect(header.getByRole('tab').first()).toBeVisible();
    await header.getByRole('tab').first().focus();
    await page.keyboard.press('ArrowRight');
    await expect(tablist.locator('[aria-selected="true"]')).toHaveCount(1);
    await expect(page.locator('.course-app')).toHaveAttribute('data-view', 'path');
    await expect(page.getByRole('tabpanel')).toBeVisible();
    await page.screenshot({ path: resolve(evidenceDir, 'header-' + width + '.png'), fullPage: false });
  }
});
