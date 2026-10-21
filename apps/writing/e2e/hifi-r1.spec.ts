import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { expect, test } from '@playwright/test';

const evidenceDir = resolve(import.meta.dirname, '../docs/evidence/hifi-r1');
const artifactDir = resolve('/opt/cursor/artifacts/hifi-r1');

test('Lesson 1 Hi-Fi R1 journey, states, and viewports', async ({ page }) => {
  test.setTimeout(90_000);
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

  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript(() => {
    const fonts = { ready: Promise.resolve(), load: () => Promise.resolve([]), check: () => true };
    Object.defineProperty(document, 'fonts', { configurable: true, get: () => fonts });
  });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /Level 2/ })).toBeVisible();
  await expect(page.getByText('Writing path')).toHaveCount(0);
  await expect(page.locator('.course-goals li')).toHaveCount(0);
  await shot('staircase-1440');
  for (const [width, height] of [[1024, 768], [834, 1112], [390, 844]] as const) {
    await page.setViewportSize({ width, height });
    await shot(`staircase-${width}`);
  }
  await page.setViewportSize({ width: 1440, height: 900 });

  await page.locator('[data-lesson-focus="G2-O:1"]').click();
  await expect(page.getByText(/top bun/i).first()).toBeVisible();
  await expect(page.getByRole('button', { name: 'Previous' })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Read it to me' })).toBeVisible();
  await shot('learn-1440');

  await page.getByRole('button', { name: 'Next' }).click();
  await page.locator('.choice-row', { hasText: 'Gardens have plants' }).click();
  await page.getByRole('button', { name: 'Check' }).click();
  await expect(page.getByTestId('feedback')).toContainText(/isn’t the best|isn't the best|Try again|You chose/i);
  await expect(page.locator('.choice-row[data-visual="wrong"]')).toHaveCount(1);
  await shot('single-wrong-1440');

  await page.keyboard.press('KeyB');
  await page.getByRole('button', { name: 'Check' }).click();
  await expect(page.getByTestId('feedback')).toContainText(/Right\. You chose B/);
  await expect(page.locator('.choice-row[data-visual="correct"]')).toHaveCount(1);
  await shot('single-correct-1440');

  await page.getByRole('button', { name: 'Next' }).click();
  await page.locator('.tapword-token', { hasText: /^believe$/ }).click();
  await expect(page.locator('.tapword-token', { hasText: /^believe$/ })).toHaveAttribute('aria-pressed', 'true');
  await page.getByTestId('lesson-footer').getByRole('button', { name: 'Check' }).click();
  await expect(page.locator('.tapword-token[data-visual="correct"]')).toContainText('believe');
  await shot('tapword-correct-1440');

  await page.getByRole('button', { name: 'Next' }).click();
  await page.getByRole('checkbox', { name: /Dogs are the best/ }).click({ force: true });
  await page.getByTestId('lesson-footer').getByRole('button', { name: 'Check' }).click();
  await expect(page.getByTestId('feedback')).toBeVisible();
  await expect(page.getByRole('checkbox', { name: /Dogs are the best/ })).toBeChecked();
  await shot('multi-retry-1440');
  await page.getByRole('checkbox', { name: /every kid should learn/ }).click({ force: true });
  await page.getByRole('checkbox', { name: /School lunch should/ }).click({ force: true });
  await page.getByTestId('lesson-footer').getByRole('button', { name: 'Check' }).click();

  await page.getByRole('button', { name: 'Next' }).click();
  await page.getByRole('button', { name: 'garden', exact: true }).click();
  await expect(page.locator('.word-pill[data-shake="true"]')).toHaveCount(1);
  await shot('build-miss-1440');
  for (const card of ['our', 'school', 'should', 'have', 'a', 'garden', 'for', 'two', 'big', 'reasons', '.']) {
    await page.getByRole('button', { name: card, exact: true }).click();
  }
  await expect(page.getByRole('button', { name: 'Next' })).toBeEnabled();
  await shot('build-done-1440');

  await page.getByRole('button', { name: 'Next' }).click();
  await page.getByRole('textbox').fill('In my opinion, recess should be longer because kids need time to run.');
  await page.getByRole('button', { name: 'Check' }).click();
  await expect(page.getByTestId('feedback')).toContainText(/Yes|Right/);
  await shot('frame-1440');

  await page.getByRole('button', { name: 'Next' }).click();
  await page.getByRole('textbox').fill('I think our school should have a garden.\nI believe a school garden should grow food.\nOur class should use the garden for science.');
  await page.getByRole('button', { name: /Check my writing|Check/ }).click();
  await expect(page.getByTestId('feedback')).toContainText(/Yes|own writing/i);
  await shot('apply-pass-1440');

  await page.getByRole('button', { name: 'Next' }).click();
  await expect(page.locator('.check-numeral')).toHaveText('1');
  const count = page.locator('.visually-hidden', { hasText: /Question 1 of 4/ });
  await expect(count).toHaveCount(1);
  const box = await count.boundingBox();
  expect(box === null || box.width <= 2).toBeTruthy();
  await shot('check-q1-1440');
  for (let step = 0; step < 3; step += 1) {
    await page.getByRole('button', { name: 'Next question' }).click();
  }
  await page.getByRole('button', { name: 'Hand in my check' }).click();
  await expect(page.getByTestId('feedback')).toContainText(/blank/i);
  await shot('check-blank-1440');
  await page.getByRole('button', { name: 'Hand in anyway' }).click();
  await expect(page.getByTestId('feedback')).toContainText('Not yet.');
  await expect(page.getByText(/You passed this check/)).toHaveCount(0);
  await shot('check-failed-1440');

  await page.reload();
  await expect(page.locator('[data-lesson-id="G2-O:1"]')).toHaveAttribute('data-state', 'continue');
  await shot('resume-continue-1440');

  await page.getByRole('button', { name: '中文' }).click();
  await expect(page.getByRole('heading', { name: /第 2 级/ })).toBeVisible();
  await shot('staircase-1440-zh');

  await page.locator('[data-lesson-focus="G2-O:1"]').click();
  await page.keyboard.press('Tab');
  await shot('focus-1440-zh');

  await page.setViewportSize({ width: 834, height: 1112 });
  await shot('lesson-834-reduced');
  await page.setViewportSize({ width: 1024, height: 768 });
  await shot('lesson-1024');
  await page.setViewportSize({ width: 390, height: 844 });
  await shot('lesson-390');
});
