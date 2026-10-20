import { expect, test } from '@playwright/test';

test('shared React Aria components adapt to Writing semantic theme without changing component code', async ({ page }) => {
  await page.goto('/?system');
  const frame = page.locator('.ba-showcase');
  await expect(page.getByRole('heading', { name: 'Design System Preview' })).toBeVisible();
  await expect(frame).toHaveAttribute('data-ba-product', 'writing');
  const primary = page.getByRole('button', { name: 'Test primary' });
  await expect(primary).toBeVisible();

  const before = await primary.locator('.ba-button__assembly').evaluate(el => getComputedStyle(el).backgroundColor);
  await primary.click();
  await expect(page.getByTestId('press-count')).toHaveText('1');

  await page.getByRole('button', { name: 'Neutral' }).click();
  await expect(frame).toHaveAttribute('data-ba-product', 'neutral');
  // BAButton intentionally animates its semantic fill for 120ms.
  // Wait for the committed neutral theme instead of sampling the first animation frame.
  await expect.poll(async () => primary.locator('.ba-button__assembly').evaluate(el => getComputedStyle(el).backgroundColor))
    .not.toBe(before);
  await primary.click();
  await expect(page.getByTestId('press-count')).toHaveText('2');

  await page.getByRole('button', { name: '中文' }).click();
  await expect(page.getByRole('heading', { name: '可执行设计系统预览' })).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByText('BA-UI-006 · BATaskProgress')).toBeVisible();
  await expect(page.getByRole('button', { name: '禁用' })).toBeDisabled();
});

test('Spatial v0.2 candidate primitives and component semantic mapping retain the measured spacing', async ({ page }) => {
  await page.goto('/?system');
  await expect(page.getByRole('heading', { name: 'Spatial v0.2 · Spacing Scale' })).toBeVisible();
  await expect(page.locator('.ba-showcase__spacing-row')).toHaveCount(9);
  const metrics = await page.getByRole('button', { name: 'Test primary' }).evaluate(el => {
    const s = getComputedStyle(el);
    return { gap:s.gap, padLeft:s.paddingLeft, padRight:s.paddingRight };
  });
  expect(metrics).toEqual({ gap:'8px', padLeft:'16px', padRight:'16px' });
  const progressGap = await page.locator('.ba-task-progress__list').evaluate(el => getComputedStyle(el).gap);
  expect(progressGap).toBe('4px');
});


test('Radius v0.1 and six interim spring groups use shared CSS tokens only', async ({ page }) => {
  await page.goto('/?system');
  await expect(page.getByRole('heading', { name: 'Shape & Radius v0.1 · Candidate Scale' })).toBeVisible();
  await expect(page.locator('.ba-showcase__radius-item')).toHaveCount(9);
  await expect(page.locator('.ba-showcase__motion-row')).toHaveCount(6);
  await expect(page.locator('.ba-showcase__radius-shape').nth(3)).toHaveCSS('border-radius', '8px');
  const data = await page.locator('.ba-showcase').evaluate(el => {
    const s = getComputedStyle(el);
    const v = (token:string) => s.getPropertyValue(token).trim();
    return {
      control:v('--ba-radius-control-regular'),
      bouncy:[v('--ba-motion-spring-bouncy-stiffness'), v('--ba-motion-spring-bouncy-damping'), v('--ba-motion-spring-bouncy-mass')],
      heavy:[v('--ba-motion-spring-heavy-snap-stiffness'), v('--ba-motion-spring-heavy-snap-damping'), v('--ba-motion-spring-heavy-snap-mass')],
      bubbleMass:v('--ba-motion-spring-bubble-enter-mass'),
      modalMass:v('--ba-motion-spring-modal-enter-mass')
    };
  });
  expect(data.control).toBe('8px');
  expect(data.bouncy).toEqual(['600','30','1.0']);
  expect(data.heavy).toEqual(['1200','80','0.1']);
  expect(data.bubbleMass).toBe('');
  expect(data.modalMass).toBe('');
});


test('Typography roles and Iconoir icons are visible and used in Writing', async ({ page }) => {
  await page.goto('/?system');
  await expect(page.getByRole('heading', { name: 'Typography · Semantic Roles' })).toBeVisible();
  await expect(page.locator('.ba-showcase__type-specimens .ba-text')).toHaveCount(5);
  await expect(page.locator('.ba-showcase__icon-card')).toHaveCount(8);
  const heading = await page.locator('.ba-showcase__type-specimens [data-text-role="heading"]').evaluate(el => {
    const s = getComputedStyle(el);
    return { weight:s.fontWeight, family:s.fontFamily };
  });
  expect(heading.weight).toBe('800');
  expect(heading.family).toContain('Dosis');
  const digits = await page.locator('.ba-showcase__digits').first().evaluate(el => {
    const s = getComputedStyle(el);
    return { weight:s.fontWeight, family:s.fontFamily };
  });
  expect(digits.weight).toBe('800');
  expect(digits.family).toContain('Dosis');
  await expect(page.locator('.ba-showcase__icon-card [role="img"]')).toHaveCount(8);
  await page.getByRole('button', { name: '中文' }).click();
  await expect(page.locator('.ba-showcase__type-specimens [data-text-role="heading"]')).toHaveCSS('font-weight', '700');
  const localizedFont = await page.locator('.ba-showcase__type-specimens [data-text-role="heading"]').evaluate(el => getComputedStyle(el).fontFamily);
  expect(localizedFont).toContain('Douyin Sans');

  await page.goto('/');
  await page.locator('[data-lesson-focus="G2-O:1"]').click();
  await expect(page.locator('.lesson-topbar__back-icon[data-icon-name="arrow-left"]')).toBeVisible();
  expect(await page.locator('.ba-task-progress__icon[data-icon-name="lock"]').count()).toBeGreaterThan(0);
});


test('Figma button and segmented gallery preserve visual geometry and local radio semantics', async ({ page }) => {
  await page.goto('/?system');
  const panel = page.locator('[aria-labelledby="figma-controls-title"]');
  await expect(panel).toBeVisible();
  await expect(panel.locator('.ba-showcase__figma-matrix-row')).toHaveCount(4);
  const sizes = await panel.locator('.ba-showcase__figma-matrix-row [data-kind="primary"][data-radius="full"]').evaluateAll(buttons =>
    buttons.map(button => {
      const assembly = button.querySelector('.ba-button__assembly');
      return {size:button.getAttribute('data-size'),height:assembly?.getBoundingClientRect().height};
    }));
  expect(sizes).toEqual([36,50,70,90].map(size => ({size:String(size),height:size})));
  const p = panel.getByRole('radiogroup', { name:'Period' });
  await expect(p.getByRole('radio')).toHaveCount(4);
  await expect(p.getByRole('radio', {name:'Week'})).toBeChecked();
  await p.getByRole('radio',{name:'Week'}).focus();
  await page.keyboard.press('ArrowRight');
  await expect(p.getByRole('radio',{name:'Month'})).toBeChecked();
  await expect(page.getByTestId('selected-period')).toHaveText('Selected: month');
  const iconOnly = panel.getByRole('radiogroup',{name:'Reading control'});
  await expect(iconOnly.getByRole('radio')).toHaveCount(3);
  await expect(panel.getByRole('button',{name:'Open menu'})).toBeVisible();
  await expect(panel.getByRole('button',{name:'Disabled'})).toBeDisabled();
  await expect(panel.getByRole('button',{name:'Processing'})).toHaveAttribute('data-pending','true');
  // Visual evidence is captured by Playwright on failure; dedicated Figma screenshot QA remains separate.
});
