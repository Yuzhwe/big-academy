import { expect, test, type Page } from '@playwright/test';

// This suite exercises the real browser motion path. The main integration suite
// defaults to reduced motion, which cannot detect a stagger regression.
test.use({ reducedMotion: 'no-preference' });

async function expectFreshStagger(page: Page) {
  const stage = page.locator('.staircase-viewport');
  await expect(stage).toHaveAttribute('data-motion', 'high');
  await expect(stage).toHaveAttribute('data-intro', 'enter');
  const motion = await page.locator('.staircase-rail .course-nodes > li[data-node-kind="lesson"]')
    .evaluateAll((nodes) => nodes.slice(0, 2).map((element) => {
      const style = getComputedStyle(element);
      return {
        name: style.animationName,
        delay: style.animationDelay,
        duration: style.animationDuration,
        easing: style.animationTimingFunction,
      };
    }));
  expect(motion).toHaveLength(2);
  expect(motion[0].name).toBe('staircase-card-drop');
  expect(motion[1].name).toBe('staircase-card-drop');
  const delay = (value: string) => value.endsWith('ms') ? parseFloat(value) : parseFloat(value) * 1000;
  expect(delay(motion[1].delay) - delay(motion[0].delay)).toBeCloseTo(90, 0);
  expect(motion[0].duration).toBe('0.52s');
  expect(motion[1].duration).toBe('0.52s');
  expect(motion[1].easing).toBe(motion[0].easing);
}

test('R09-02: 10 Activity returns repeat the original sequential drop', async ({ page }) => {
  test.setTimeout(180_000);
  await page.goto('/');
  for (let cycle = 0; cycle < 10; cycle += 1) {
    // Playwright waits for the preceding entrance to finish before clicking.
    await page.locator('[data-lesson-focus="G2-O:1"]').click();
    await expect(page.locator('.course-app')).toHaveAttribute('data-view', 'lesson');
    await page.getByRole('button', { name: 'Back to my path' }).click();
    await expect(page.locator('.course-app')).toHaveAttribute('data-view', 'path');
    await expectFreshStagger(page);
  }
});

test('R09-02: 10 Level switches repeat the original sequential drop', async ({ page }) => {
  test.setTimeout(120_000);
  await page.goto('/');
  for (let cycle = 0; cycle < 10; cycle += 1) {
    const level = cycle % 2 === 0 ? 'L1' : 'L2';
    await page.locator('.ba-tabs__option').filter({ hasText: level }).click();
    await expectFreshStagger(page);
  }
});

test('R09-02: 10 mixed Activity/Level round-trips retain the stagger', async ({ page }) => {
  test.setTimeout(180_000);
  await page.goto('/');
  for (let cycle = 0; cycle < 10; cycle += 1) {
    await page.locator('.ba-tabs__option').filter({ hasText: 'L1' }).click();
    await expectFreshStagger(page);
    await page.locator('.ba-tabs__option').filter({ hasText: 'L2' }).click();
    await expectFreshStagger(page);
    await page.locator('[data-lesson-focus="G2-O:1"]').click();
    await expect(page.locator('.course-app')).toHaveAttribute('data-view', 'lesson');
    await page.getByRole('button', { name: 'Back to my path' }).click();
    await expectFreshStagger(page);
  }
});
