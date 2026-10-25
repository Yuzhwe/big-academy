import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { expect, test, type Page } from '@playwright/test';

test.use({ reducedMotion: 'reduce' });
const evidenceDir = resolve(import.meta.dirname, '../docs/evidence/staircase-ab');

async function visibleTerraces(page: Page) {
  return page.evaluate(() => {
    const stage = document.querySelector('.staircase-viewport')!.getBoundingClientRect();
    return [...document.querySelectorAll('.staircase-rail .course-nodes > li')].flatMap((node) => {
      const box = node.getBoundingClientRect();
      if (box.right <= stage.left + 1 || box.left >= stage.right - 1) return [];
      const pseudo = getComputedStyle(node, '::before');
      const platform = pseudo.content === 'none' ? 0 : (parseFloat(pseudo.height) || 0) - 49;
      const top = box.top - stage.top;
      const bottom = box.bottom + platform + 6 - stage.top;
      if (top >= -1 && bottom <= stage.height + 1) return [];
      return [{ top: Math.round(top), bottom: Math.round(bottom), stage: Math.round(stage.height) }];
    });
  });
}

test('E-01 v2-terraces layers, parallax, and lesson lock', async ({ page }) => {
  test.setTimeout(60_000);
  mkdirSync(evidenceDir, { recursive: true });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const scene = page.locator('.staircase-viewport');

  await expect(scene).toHaveAttribute('data-landscape', 'v2-terraces');
  await expect(scene).toHaveAttribute('data-sky', 'linear-gradient(135deg, #85DBF9 0%, #F8F4ED 100%)');
  await expect(page.locator('.staircase-rail')).toHaveAttribute('data-parallax', '1');
  await expect(scene).toHaveAttribute('data-parallax-state', 'applied');
  const layers = await page.evaluate(() => {
    const read = (sel: string) => Number(document.querySelector(sel)?.getAttribute('data-parallax'));
    const stage = document.querySelector('.staircase-viewport')!.getBoundingClientRect();
    const header = document.querySelector('.course-path__header')!.getBoundingClientRect();
    const box = (sel: string) => document.querySelector(sel)!.getBoundingClientRect();
    const hill1 = box('[data-testid="path-hill-1"]');
    const hill2 = box('[data-testid="path-hill-2"]');
    const cloud = box('[data-testid="path-cloud"]');
    return {
      sky: read('[data-testid="path-sky"]'),
      cloud: read('[data-testid="path-cloud"]'),
      hill2: read('[data-testid="path-hill-2"]'),
      hill1: read('[data-testid="path-hill-1"]'),
      stageBottom: stage.bottom,
      viewHeight: window.innerHeight,
      headerTop: header.top,
      headerBottom: header.bottom,
      stageTop: stage.top,
      hill1Top: hill1.top,
      hill1Bottom: hill1.bottom,
      hill1Left: hill1.left,
      hill1Right: hill1.right,
      hill2Top: hill2.top,
      hill2Bottom: hill2.bottom,
      hill2Left: hill2.left,
      hill2Right: hill2.right,
      stageLeft: stage.left,
      stageRight: stage.right,
      cloudTop: cloud.top,
      cloudBottom: cloud.bottom,
    };
  });
  expect(layers.sky).toBe(0);
  expect(layers.hill1).toBeGreaterThan(layers.hill2);
  expect(layers.hill2).toBeGreaterThan(layers.cloud);
  expect(layers.cloud).toBeGreaterThan(layers.sky);
  expect(layers.hill1).toBeLessThan(1);
  expect(layers.headerTop).toBeGreaterThanOrEqual(-1);
  expect(layers.headerBottom).toBeLessThanOrEqual(layers.stageTop + 1);
  expect(layers.stageBottom).toBeGreaterThan(layers.viewHeight - 4);
  expect(layers.hill1Top).toBeGreaterThanOrEqual(layers.stageTop - 1);
  expect(layers.hill1Bottom).toBeLessThanOrEqual(layers.stageBottom + 1);
  expect(layers.hill2Top).toBeGreaterThanOrEqual(layers.stageTop - 1);
  expect(layers.hill2Bottom).toBeLessThanOrEqual(layers.stageBottom + 1);
  expect(layers.hill1Left).toBeLessThanOrEqual(layers.stageLeft + 1);
  expect(layers.hill1Right).toBeGreaterThanOrEqual(layers.stageRight - 1);
  expect(layers.hill2Left).toBeLessThanOrEqual(layers.stageLeft + 1);
  expect(layers.hill2Right).toBeGreaterThanOrEqual(layers.stageRight - 1);
  expect(Math.abs((layers.hill1Right - layers.hill1Left) - (layers.hill2Right - layers.hill2Left))).toBeLessThanOrEqual(1);
  expect(layers.cloudBottom).toBeGreaterThan(layers.stageTop);
  expect(layers.cloudTop).toBeLessThan(layers.stageBottom);
  const track = Number(await scene.getAttribute('data-track-length'));
  const cameraMax = Number(await scene.getAttribute('data-camera-max'));
  expect(track).toBeGreaterThan(cameraMax);
  expect(cameraMax).toBeGreaterThan(0);
  await expect(page.getByRole('button', { name: /Separate platforms|Continuous slope/ })).toHaveCount(0);
  await expect(scene).toHaveAttribute('data-rise-px', /^[0-9]+$/);
  await page.screenshot({ path: resolve(evidenceDir, 'v2-terraces-1440.png'), fullPage: false });
  expect(await visibleTerraces(page)).toEqual([]);

  const initial = Number(await scene.getAttribute('data-camera-x'));
  const before = await page.evaluate(() => ({
    camera: Number(document.querySelector('.staircase-viewport')?.getAttribute('data-camera-x')),
    hill1: document.querySelector('[data-testid="path-hill-1"]')!.getBoundingClientRect().left,
    hill2: document.querySelector('[data-testid="path-hill-2"]')!.getBoundingClientRect().left,
    cloud: document.querySelector('[data-testid="path-cloud"]')!.getBoundingClientRect().left,
    rail: document.querySelector('.staircase-rail')!.getBoundingClientRect().left,
  }));
  await scene.focus();
  await page.keyboard.press('ArrowRight');
  await expect.poll(async () => Number(await scene.getAttribute('data-camera-x'))).toBeGreaterThan(initial);
  const after = await page.evaluate(() => ({
    camera: Number(document.querySelector('.staircase-viewport')?.getAttribute('data-camera-x')),
    hill1: document.querySelector('[data-testid="path-hill-1"]')!.getBoundingClientRect().left,
    hill2: document.querySelector('[data-testid="path-hill-2"]')!.getBoundingClientRect().left,
    cloud: document.querySelector('[data-testid="path-cloud"]')!.getBoundingClientRect().left,
    rail: document.querySelector('.staircase-rail')!.getBoundingClientRect().left,
  }));
  const cameraMove = after.camera - before.camera;
  const hill1Move = before.hill1 - after.hill1;
  const hill2Move = before.hill2 - after.hill2;
  const cloudMove = before.cloud - after.cloud;
  const cardMove = before.rail - after.rail;
  expect(cardMove).toBeGreaterThan(hill1Move);
  expect(hill1Move).toBeGreaterThan(hill2Move);
  expect(hill2Move).toBeGreaterThan(cloudMove);
  expect(hill1Move).toBeLessThan(cameraMove);
  expect(await visibleTerraces(page)).toEqual([]);
  await page.keyboard.press('Home');
  await expect(scene).toHaveAttribute('data-camera-x', '0');
  expect(await visibleTerraces(page)).toEqual([]);
  await page.keyboard.press('End');
  await expect.poll(async () => Number(await scene.getAttribute('data-camera-x'))).toBeGreaterThan(0);
  expect(await visibleTerraces(page)).toEqual([]);
  await page.keyboard.press('Home');

  const platform = await page.locator('.staircase-rail .course-nodes > li').first().evaluate((el) => {
    const before = getComputedStyle(el, '::before');
    return { width: before.width, height: before.height, content: before.content };
  });
  expect(platform.width).toBe('300px');
  expect(platform.height).toBe('94px');
  expect(platform.content).not.toBe('none');

  await page.locator('[data-lesson-id="G2-O:2"] .stair-lesson-card__title').click();
  await expect(page.getByTestId('locked-note')).toContainText(/Lesson 1/);
  await expect(page).toHaveURL(/\/$/);

  await page.setViewportSize({ width: 834, height: 1112 });
  await page.getByRole('button', { name: '中文' }).click();
  await expect(scene).toHaveAttribute('data-landscape', 'v2-terraces');
  expect(await visibleTerraces(page)).toEqual([]);
  await page.screenshot({ path: resolve(evidenceDir, 'v2-terraces-834-zh.png'), fullPage: false });
});

test('card height never moves the terrace anchor', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  const viewport = page.locator('.staircase-viewport');
  await expect(viewport).toHaveAttribute('data-anchor-basis', 'pedestal-y');
  const li = page.locator('.staircase-rail .course-nodes > li').filter({ has: page.locator('.stair-lesson-card') }).first();
  await page.evaluate(() => document.fonts.ready);
  await li.locator('button').click({ trial: true });
  const before = await li.evaluate((el) => {
    const rect = el.getBoundingClientRect();
    return { top: rect.top, bottom: rect.bottom, height: rect.height };
  });
  await li.locator('.stair-lesson-card__title').evaluate((el) => {
    el.textContent = (el.textContent || '') + ' extra text to increase the height of this card'.repeat(14);
  });
  const after = await li.evaluate((el) => {
    const rect = el.getBoundingClientRect();
    return { top: rect.top, bottom: rect.bottom, height: rect.height };
  });
  expect(after.height).toBe(before.height); // Three-line title slot truncates long content.
  await li.locator('.stair-lesson-card').evaluate((el, height) => { el.style.minHeight = (height + 80) + 'px'; }, before.height);
  const expanded = await li.boundingBox();
  expect(expanded!.height).toBeGreaterThan(before.height);
  expect(Math.abs(expanded!.y + expanded!.height - before.bottom)).toBeLessThanOrEqual(1);
  expect(Math.abs(after.bottom - before.bottom)).toBeLessThanOrEqual(1);
  expect(expanded!.y).toBeLessThan(before.top);
});

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
