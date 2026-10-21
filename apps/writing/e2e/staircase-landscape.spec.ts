import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { expect, test } from '@playwright/test';

const evidenceDir = resolve(import.meta.dirname, '../docs/evidence/hifi-r1');
const artifactDir = resolve('/opt/cursor/artifacts/hifi-r1');

test('landscape staircase is a second backdrop and keeps Lesson 1 entry', async ({ page }) => {
  test.setTimeout(60_000);
  mkdirSync(evidenceDir, { recursive: true });
  mkdirSync(artifactDir, { recursive: true });
  const shot = async (name: string) => {
    const client = await page.context().newCDPSession(page);
    const image = await client.send('Page.captureScreenshot', { format: 'png' });
    await client.detach();
    const bytes = Buffer.from(image.data, 'base64');
    writeFileSync(resolve(evidenceDir, `${name}.png`), bytes);
    writeFileSync(resolve(artifactDir, `${name}.png`), bytes);
  };

  await page.addInitScript(() => {
    const fonts = { ready: Promise.resolve(), load: () => Promise.resolve([]), check: () => true };
    Object.defineProperty(document, 'fonts', { configurable: true, get: () => fonts });
  });

  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/?staircase=landscape');
  const scene = page.locator('.staircase-viewport');
  await expect(page.locator('.course-path')).toHaveAttribute('data-staircase', 'landscape');
  await expect(scene).toHaveAttribute('data-variant', 'A');
  await expect(scene).toHaveAttribute('data-theme', 'landscape');
  await expect(page.getByTestId('landscape-stage')).toBeVisible();
  await expect(page.getByRole('heading', { name: /Level 2/ })).toBeVisible();
  await expect.poll(async () => page.locator('.landscape-plane').evaluate((el) => getComputedStyle(el).animationName)).toContain('landscape-fly');
  await expect.poll(async () => page.locator('.landscape-cloud-drift').evaluate((el) => getComputedStyle(el).animationName)).toContain('landscape-cloud');

  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect.poll(async () => page.locator('.landscape-plane').evaluate((el) => getComputedStyle(el).animationName)).toBe('none');

  const initial = Number(await scene.getAttribute('data-camera-x'));
  await scene.focus();
  await page.keyboard.press('ArrowRight');
  await expect.poll(async () => Number(await scene.getAttribute('data-camera-x'))).toBeGreaterThan(initial);
  await page.keyboard.press('Home');
  await expect(scene).toHaveAttribute('data-camera-x', '0');
  await expect(page.locator('[data-lesson-focus="G2-O:2"]')).toBeDisabled();

  await shot('landscape-1440');
  for (const [width, height] of [[1024, 768], [834, 1112], [390, 844]] as const) {
    await page.setViewportSize({ width, height });
    await shot(`landscape-${width}`);
  }

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.locator('[data-lesson-focus="G2-O:1"]').click();
  await expect(page.getByText(/top bun/i).first()).toBeVisible();
  await page.getByRole('button', { name: 'Back to my path' }).click();
  await expect(page.locator('.course-path')).toHaveAttribute('data-staircase', 'landscape');

  await page.goto('/');
  await expect(page.locator('.course-path')).toHaveAttribute('data-staircase', 'r1');
  await expect(page.getByTestId('landscape-stage')).toHaveCount(0);
  await expect(page.locator('.staircase-viewport')).toHaveAttribute('data-variant', 'A');
});
