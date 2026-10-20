import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { expect, test } from '@playwright/test';

const evidenceDir = resolve(import.meta.dirname, '../docs/evidence');

const cases = [
  { name: 'desktop-1440-en-mixed', width: 1440, height: 900, fixture: 'mixed', locale: 'en' },
  { name: 'desktop-1440-en-many', width: 1440, height: 900, fixture: 'many', locale: 'en' },
  { name: 'tablet-1024-en-long', width: 1024, height: 768, fixture: 'long', locale: 'en' },
  { name: 'tablet-1024-zh-mixed', width: 1024, height: 768, fixture: 'mixed', locale: 'zh' },
  { name: 'tablet-834-zh-long', width: 834, height: 1112, fixture: 'long', locale: 'zh' },
  { name: 'tablet-834-en-many', width: 834, height: 1112, fixture: 'many', locale: 'en' },
  { name: 'phone-390-zh-long', width: 390, height: 844, fixture: 'long', locale: 'zh' },
] as const;

test('task progress stays centered on the header', async ({ page }) => {
  mkdirSync(evidenceDir, { recursive: true });
  const results: {
    name: string;
    viewport: string;
    headerCenter: number;
    progressCenter: number;
    deltaPx: number;
    overlapPx: number;
    backHeight: number;
    taskHeight: number;
  }[] = [];

  for (const item of cases) {
    await page.setViewportSize({ width: item.width, height: item.height });
    await page.goto(`/?fixture=${item.fixture}&locale=${item.locale}`);
    const header = page.locator('[data-component="BA-WR-001"]');
    const progress = page.locator('[data-component="BA-UI-006"]');
    await expect(header).toBeVisible();
    await expect(progress).toBeVisible();

    const boxes = await page.evaluate(() => {
      const headerEl = document.querySelector('[data-component="BA-WR-001"]');
      const progressEl = document.querySelector('[data-component="BA-UI-006"]');
      const startEl = document.querySelector('.lesson-topbar__start');
      const backEl = document.querySelector('.lesson-topbar__back');
      const taskEl = document.querySelector('.ba-task-progress__button');
      if (!headerEl || !progressEl || !startEl || !backEl || !taskEl) return null;
      const headerBox = headerEl.getBoundingClientRect();
      const progressBox = progressEl.getBoundingClientRect();
      const startBox = startEl.getBoundingClientRect();
      const backBox = backEl.getBoundingClientRect();
      const taskBox = taskEl.getBoundingClientRect();
      return {
        headerCenter: headerBox.left + headerBox.width / 2,
        progressCenter: progressBox.left + progressBox.width / 2,
        overlapPx: startBox.right - progressBox.left,
        backHeight: backBox.height,
        taskHeight: taskBox.height,
      };
    });
    expect(boxes, item.name).not.toBeNull();
    const deltaPx = Math.abs((boxes?.headerCenter ?? 0) - (boxes?.progressCenter ?? 0));
    results.push({
      name: item.name,
      viewport: `${item.width}x${item.height}`,
      headerCenter: Number(boxes?.headerCenter.toFixed(2)),
      progressCenter: Number(boxes?.progressCenter.toFixed(2)),
      deltaPx: Number(deltaPx.toFixed(2)),
      overlapPx: Number((boxes?.overlapPx ?? 0).toFixed(2)),
      backHeight: Number((boxes?.backHeight ?? 0).toFixed(2)),
      taskHeight: Number((boxes?.taskHeight ?? 0).toFixed(2)),
    });
    await page.screenshot({ path: resolve(evidenceDir, `${item.name}.png`), fullPage: false });
  }

  writeFileSync(resolve(evidenceDir, 'layout-metrics.json'), `${JSON.stringify(results, null, 2)}\n`);
  for (const result of results) {
    expect(result.deltaPx, result.name).toBeLessThanOrEqual(1);
    expect(result.overlapPx, `${result.name} overlap`).toBeLessThanOrEqual(1);
    expect(result.backHeight, `${result.name} back target`).toBeGreaterThanOrEqual(44);
    expect(result.taskHeight, `${result.name} task target`).toBeGreaterThanOrEqual(44);
  }
});

test('keyboard activates back and an open task, and a locked task stays closed', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/?fixture=mixed&locale=en');
  const log = page.getByTestId('event-log');
  // Wait until the React topbar has rendered before starting keyboard navigation.
  await expect(page.getByRole('button', { name: 'Back to my path' })).toBeVisible();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Back to my path' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(log).toContainText('back');

  const openTask = page.getByRole('button', { name: 'Task 5: Build a topic sentence, available' });
  await openTask.focus();
  await page.keyboard.press(' ');
  await expect(log).toContainText('navigate:4');

  const locked = page.getByRole('button', { name: 'Task 8: Check, locked' });
  await expect(locked).toBeDisabled();
  await locked.click({ force: true });
  await expect(log).not.toContainText('navigate:7');
});

test('Chinese long title and skipped state stay distinct at 834', async ({ page }) => {
  await page.setViewportSize({ width: 834, height: 1112 });
  await page.goto('/?fixture=long&locale=zh');
  await expect(page.locator('[data-component="BA-WR-001"]')).toHaveAttribute('lang', 'zh-CN');
  await expect(page.getByText('我能写出说明话题和观点的主题句，并且把理由和例子写清楚给同学看的那一课')).toBeVisible();
  await expect(page.getByRole('button', { name: '任务 3：找出观点词，已跳过' })).toBeEnabled();
  await expect(page.getByRole('button', { name: '任务 1：学一学，已完成' })).toBeEnabled();
  await expect(page.getByRole('button', { name: /菜单|Menu|Index/ })).toHaveCount(0);
});
