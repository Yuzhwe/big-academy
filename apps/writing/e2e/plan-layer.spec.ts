import { mkdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { expect, test } from '@playwright/test';
import { ALEX_STATE_KEY, CourseSession, createMemoryStorage, type CourseSession as Session } from '../src/product/courseSession';

const html = readFileSync(resolve(import.meta.dirname, '../source/alex-original.html'), 'utf8');
const evidenceDir = resolve(import.meta.dirname, '../docs/evidence/hifi');

function satisfyAll(course: Session, lessonIndex: number) {
  const state = course.inspect();
  const allowed = new Set(course.liveIdx(lessonIndex));
  course.screens.forEach((ref, index) => {
    if (!allowed.has(index)) return;
    const screenRef = ref.screen;
    if (screenRef.kind === 'task' || screenRef.kind === 'model_task') {
      state.tasks[`${screenRef.page}:${screenRef.task}`] = { tries: 1, status: 'done' };
    } else if (screenRef.kind === 'apply' || screenRef.kind === 'check') {
      state.done[screenRef.page] = true;
    } else if (screenRef.kind === 'plan_check') {
      state.done.plan = true;
    } else if (screenRef.kind === 'draft_write' || screenRef.kind === 'rev_cups' || screenRef.kind === 'rev_final') {
      state.feedback.drafts.push({ text: 'Our school should have a garden because it gives us real work.' });
      state.feedback.finished = true;
    } else if (screenRef.kind === 'plan_layer') {
      state.seen[screenRef.id] = true;
      for (const field of screenRef.fields ?? []) {
        state.regions[`plan.${field}`] = [{ t: 'Students should use the garden.', s: 'typed' }];
      }
    } else {
      state.seen[screenRef.id] = true;
    }
  });
}

test('lesson 6 plan layer after real earlier completion', async ({ page }) => {
  test.setTimeout(90_000);
  mkdirSync(evidenceDir, { recursive: true });
  const storage = createMemoryStorage();
  const course = new CourseSession({ html, storage });
  for (let lesson = 0; lesson < 5; lesson += 1) satisfyAll(course, lesson);
  course.saveArrangedState();
  const saved = storage.getItem(ALEX_STATE_KEY);
  expect(saved).toBeTruthy();

  await page.addInitScript((payload) => {
    localStorage.setItem('g2o_unit_state_v4', payload);
  }, saved ?? '');

  async function shot(name: string) {
    await page.screenshot({ path: resolve(evidenceDir, `${name}.png`), fullPage: false });
  }

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /Level 2/ })).toBeVisible();
  await page.locator('[data-lesson-focus="G2-O:6"]').click();
  await expect(page.getByRole('heading', { name: 'Choose a question' })).toBeVisible();
  await page.getByRole('button', { name: 'Next' }).click();
  await expect(page.getByTestId('burger')).toBeVisible();
  await expect(page.getByTestId('word-grid')).toBeVisible();
  await page.getByRole('textbox', { name: /Top bun/ }).fill('I think recess should be longer');
  await shot('plan-layer-1440');

  await page.setViewportSize({ width: 1024, height: 768 });
  await expect(page.getByRole('button', { name: 'Open the grid' })).toBeVisible();
  await shot('plan-layer-1024');

  await page.setViewportSize({ width: 834, height: 1112 });
  await page.getByRole('button', { name: 'Open the grid' }).click();
  await expect(page.getByRole('tab', { name: 'Opinion' })).toBeVisible();
  const coverage = await page.evaluate(() => {
    const box = (selector: string) => document.querySelector(selector)?.getBoundingClientRect() ?? null;
    const clip = (node: DOMRect, frame: DOMRect) => {
      const top = Math.max(node.top, frame.top);
      const bottom = Math.min(node.bottom, frame.bottom);
      const left = Math.max(node.left, frame.left);
      const right = Math.min(node.right, frame.right);
      if (bottom - top <= 1 || right - left <= 1) return null;
      return { top, bottom, left, right };
    };
    const hits = (
      a: { top: number; bottom: number; left: number; right: number },
      b: DOMRect,
    ) => a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
    const grid = box('.word-grid--expanded');
    const activity = box('.course-activity');
    const coach = box('.lesson-workspace__coach');
    const footer = box('.lesson-workspace__footer');
    const layers = [...document.querySelectorAll('.hamburger-layer')].map((node) =>
      node.getBoundingClientRect(),
    );
    const active = box('.hamburger-layer[data-part="top"]');
    const activeVisible = active && activity ? clip(active, activity) : null;
    return {
      presentation: document.querySelector('.word-grid--expanded')?.getAttribute('data-presentation'),
      activeVisible: Boolean(activeVisible && activeVisible.bottom - activeVisible.top >= 24),
      gridCoversEntry: Boolean(
        grid &&
          activity &&
          layers.some((layer) => {
            const visible = clip(layer, activity);
            return visible ? hits(visible, grid) : false;
          }),
      ),
      gridCoversCoach: Boolean(grid && coach && hits(coach, grid)),
      gridCoversFooter: Boolean(grid && footer && hits(footer, grid)),
    };
  });
  expect(coverage.presentation).toBe('overlay');
  expect(coverage.activeVisible).toBe(true);
  expect(coverage.gridCoversEntry).toBe(false);
  expect(coverage.gridCoversCoach).toBe(false);
  expect(coverage.gridCoversFooter).toBe(false);
  const field = page.getByRole('textbox', { name: /Top bun/ });
  await field.click();
  await field.pressSequentially(' still open');
  await expect(field).toHaveValue(/still open/);
  await shot('plan-layer-834');

  await page.keyboard.press('Escape');
  await expect(page.getByRole('tab', { name: 'Opinion' })).toHaveCount(0);
});
