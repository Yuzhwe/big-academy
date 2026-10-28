import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { expect, test } from '@playwright/test';

const evidence = resolve(import.meta.dirname, '../docs/evidence/cloud-m4');

/** Real student scene: keep this test neutral to the host's GPU availability. */
test('BA-WR-013 student sky is shared, camera-driven and click-through', async ({ page }) => {
  mkdirSync(evidence, { recursive: true });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const viewport = page.locator('.staircase-viewport');
  const sky = viewport.getByTestId('path-cloud');
  await expect(viewport).toBeVisible();
  await expect(sky).toHaveCount(1);
  // Review 06: system Reduced Motion forces Lightweight, even when High is selected.
  await expect(sky).toHaveAttribute('data-mode', 'lightweight');
  await expect(sky).toHaveAttribute('data-renderer', 'lightweight');
  await expect(sky.locator('.r2-cloud')).toHaveCount(3);
  await expect(sky.locator('canvas')).toHaveCount(0);
  expect(await sky.evaluate(el => getComputedStyle(el).pointerEvents)).toBe('none');
  expect(await sky.evaluate(el => getComputedStyle(el.querySelector('.r2-cloud')!).animationName)).toBe('none');
  const cameraBefore = Number(await viewport.getAttribute('data-camera-x'));
  const leftBefore = await sky.evaluate(el => el.getBoundingClientRect().left);
  await viewport.focus();
  await page.keyboard.press('ArrowRight');
  await expect.poll(async () => Number(await viewport.getAttribute('data-camera-x'))).toBeGreaterThan(cameraBefore);
  const cameraAfter = Number(await viewport.getAttribute('data-camera-x'));
  const leftAfter = await sky.evaluate(el => el.getBoundingClientRect().left);
  const coefficient = Number(await sky.getAttribute('data-parallax'));
  expect(leftBefore - leftAfter).toBeCloseTo((cameraAfter - cameraBefore) * coefficient, 0);
  await page.screenshot({ path: resolve(evidence, 'staircase-lightweight-reduce-1440.png') });
  await viewport.focus();
  await page.keyboard.press('Home');
  await expect(viewport).toHaveAttribute('data-camera-x', '0');
});

/** Confirm auto safely settles on one renderer; never assert Shader merely because WebGL API exists. */
test('BA-WR-013 auto has exactly one active renderer and stable scene navigation', async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 768 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  const stage = page.locator('.staircase-viewport');
  const sky = stage.getByTestId('path-cloud');
  await expect(sky).toHaveCount(1);
  await expect.poll(() => sky.getAttribute('data-renderer')).toMatch(/^(shader|lightweight)$/);
  const result = await sky.evaluate(root => ({
    renderer: root.getAttribute('data-renderer'),
    canvases: root.querySelectorAll('canvas').length,
    clouds: root.querySelectorAll('.r2-cloud').length,
    pointerEvents: getComputedStyle(root).pointerEvents,
  }));
  expect(result.canvases).toBeLessThanOrEqual(1);
  expect(result.clouds).toBeLessThanOrEqual(3);
  expect(result.pointerEvents).toBe('none');
  const first = Number(await stage.getAttribute('data-camera-x'));
  await stage.focus();
  await page.keyboard.press('ArrowRight');
  await expect.poll(async () => Number(await stage.getAttribute('data-camera-x'))).toBeGreaterThan(first);
  await page.keyboard.press('Home');
  await expect(stage).toHaveAttribute('data-camera-x', '0');
});
