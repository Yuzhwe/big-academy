import { expect, test } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';

const effectNames = ['Ribbons', 'Confetti', 'Confetti Cannon', 'Confetti Explosions', 'Confetti Falling', 'Confetti Parade', 'Party', 'Fire', 'Firefly', 'Fireworks'];
const evidence = resolve('docs/evidence/celebration');
const canvas = '[data-celebration-canvas]';

test('all ten actual runtimes render, interact and stop without changing learning storage', async ({ page }) => {
  test.setTimeout(90000);
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/?demo=celebration-effects');
  await expect(page.getByRole('heading', { name: 'Celebration effects', exact: true })).toBeVisible();
  await expect(page.getByRole('radio')).toHaveCount(10);
  await expect(page.locator('canvas')).toHaveCount(0);
  const storage = await page.evaluate(() => ({ local: { ...localStorage }, session: { ...sessionStorage } }));
  await mkdir(evidence, { recursive: true });
  await page.screenshot({ path: resolve(evidence, 'desktop-ready.png'), fullPage: true });

  for (const name of effectNames) {
    if (name === 'Ribbons') await page.getByRole('button', { name: 'Play again' }).click();
    else await page.getByRole('radio', { name, exact: true }).check();
    await expect(page.locator('[data-preview-status]')).toHaveAttribute('data-preview-status', 'playing');
    await expect(page.locator(canvas)).toHaveCount(1);
    await expect(page.locator('canvas')).toHaveCount(1);
    await expect(page.locator(canvas)).toHaveCSS('pointer-events', 'none');
    await expect(page.locator(canvas)).toHaveAttribute('aria-hidden', 'true');
    const stage = await page.locator('.writing-celebration__stage').boundingBox();
    if (!stage) throw new Error('Missing preview stage');
    if (name === 'Confetti Cannon') {
      await page.mouse.move(stage.x + stage.width * .7, stage.y + stage.height * .7);
      await page.mouse.down();
      await page.mouse.move(stage.x + stage.width * .4, stage.y + stage.height * .9, { steps: 12 });
      await page.mouse.up();
    }
    if (name === 'Firefly') {
      for (let i = 0; i < 8; i++) await page.mouse.move(stage.x + 60 + i * 30, stage.y + 80 + i * 20, { steps: 8 });
    }
    // Verify painted pixels, not merely an empty canvas or a successful import.
    await expect.poll(() => page.locator(canvas).evaluate((element: HTMLCanvasElement) => {
      // v4 renders through OffscreenCanvas; read its displayed bitmap via a copy.
      const sample = document.createElement('canvas');
      sample.width = element.width;
      sample.height = element.height;
      const context = sample.getContext('2d');
      if (!context) return false;
      context.drawImage(element, 0, 0);
      const pixels = context.getImageData(0, 0, sample.width, sample.height).data;
      for (let i = 3; i < pixels.length; i += 4) if (pixels[i] > 0) return true;
      return false;
    }), { message: `${name} paints visible particles`, timeout: 12000 }).toBe(true);
    if (name === 'Ribbons' || name === 'Fireworks') {
      // Capture the visible falling/blooming phase, rather than an empty first frame.
      await expect.poll(() => page.locator(canvas).evaluate((element: HTMLCanvasElement) => {
        const sample = document.createElement('canvas');
        sample.width = element.width;
        sample.height = element.height;
        const context = sample.getContext('2d')!;
        context.drawImage(element, 0, 0);
        const pixels = context.getImageData(0, Math.round(sample.height * .2), sample.width, Math.round(sample.height * .6)).data;
        let painted = 0;
        for (let i = 3; i < pixels.length; i += 4) if (pixels[i] > 24) painted++;
        return painted;
      }), { timeout: 10000 }).toBeGreaterThan(600);
      await page.screenshot({ path: resolve(evidence, name === 'Ribbons' ? 'desktop-ribbons.png' : 'desktop-fireworks.png'), fullPage: true });
    }
    await page.getByRole('button', { name: 'Stop', exact: true }).click();
    await expect(page.locator('canvas')).toHaveCount(0);
  }
  expect(await page.evaluate(() => ({ local: { ...localStorage }, session: { ...sessionStorage } }))).toEqual(storage);
  expect(errors).toEqual([]);
});

test('rapid changes, Escape, navigation and reduced motion clean up decoration', async ({ page }) => {
  await page.goto('/?demo=celebration-effects');
  await page.getByRole('radio', { name: 'Fireworks', exact: true }).check();
  await page.getByRole('radio', { name: 'Ribbons', exact: true }).check();
  await expect(page.locator('[data-preview-status]')).toHaveAttribute('data-preview-status', 'playing');
  await expect(page.locator('canvas')).toHaveCount(1);
  await page.keyboard.press('Escape');
  await expect(page.locator('canvas')).toHaveCount(0);
  await page.getByRole('button', { name: 'Play again' }).click();
  await expect(page.locator(canvas)).toHaveCount(1);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('canvas')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Play again' })).toBeDisabled();
  await page.getByRole('radio', { name: 'Party', exact: true }).check();
  await expect(page.locator('[data-preview-status]')).toHaveAttribute('data-preview-status', 'reduced');
  await expect(page.locator('canvas')).toHaveCount(0);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.getByRole('button', { name: 'Play again' }).click();
  await expect(page.locator(canvas)).toHaveCount(1);
  await page.getByRole('link', { name: 'Back to Writing' }).click();
  await expect(page).not.toHaveURL(/demo=celebration-effects/);
  await expect(page.locator('canvas')).toHaveCount(0);
});

test('Chinese mobile controls, radio keyboard navigation and narrow layout are usable', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/?demo=celebration-effects&locale=zh');
  await expect(page.getByRole('heading', { name: '庆祝效果预览', exact: true })).toBeVisible();
  await page.getByRole('radio', { name: '彩带', exact: true }).focus();
  await page.keyboard.press('ArrowDown');
  await expect(page.getByRole('radio', { name: '彩纸', exact: true })).toBeChecked();
  await expect(page.locator(canvas)).toHaveCount(1);
  await page.keyboard.press('Escape');
  await expect(page.locator('canvas')).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.getByRole('button', { name: '重播效果' }).scrollIntoViewIfNeeded();
  await page.evaluate(() => window.scrollTo(0, 0));
  await mkdir(evidence, { recursive: true });
  await page.screenshot({ path: resolve(evidence, 'mobile-zh.png'), fullPage: true });
  for (const width of [834, 500]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await page.screenshot({ path: resolve(evidence, `review-${width}-zh.png`), fullPage: true });
  }
});
