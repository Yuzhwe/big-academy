import { expect, test } from '@playwright/test';

test('shared React Aria components adapt to Writing semantic theme without changing component code', async ({ page }) => {
  await page.goto('/?system');
  const frame = page.locator('.ba-showcase');
  await expect(page.getByRole('heading', { name: 'Design System Preview' })).toBeVisible();
  await expect(frame).toHaveAttribute('data-ba-product', 'writing');
  const primary = page.getByRole('button', { name: 'Test primary' });
  await expect(primary).toBeVisible();

  const before = await primary.evaluate(el => getComputedStyle(el).backgroundColor);
  await primary.click();
  await expect(page.getByTestId('press-count')).toHaveText('1');

  await page.getByRole('button', { name: 'Neutral' }).click();
  await expect(frame).toHaveAttribute('data-ba-product', 'neutral');
  const after = await primary.evaluate(el => getComputedStyle(el).backgroundColor);
  expect(after).not.toBe(before);
  await primary.click();
  await expect(page.getByTestId('press-count')).toHaveText('2');

  await page.getByRole('button', { name: '中文' }).click();
  await expect(page.getByRole('heading', { name: '可执行设计系统预览' })).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByText('BA-UI-006 · BATaskProgress')).toBeVisible();
  await expect(page.getByRole('button', { name: '禁用' })).toBeDisabled();
});
