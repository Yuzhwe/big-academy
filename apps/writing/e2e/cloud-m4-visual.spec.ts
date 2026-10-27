import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { expect, test } from '@playwright/test';

const evidenceDir = resolve(import.meta.dirname, '../docs/evidence/cloud-m4');
const library = (process.env.BA_LIBRARY_URL ?? 'http://127.0.0.1:6007/');
test.use({ video: 'on' });
type Observation = { candidate: string; renderer: string | null; fallback: string | null; timestamp: string };

async function openCloud(page: import('@playwright/test').Page, params: Record<string,string>) {
  const search = new URLSearchParams({ view: 'components', component: 'cloud', ...params });
  await page.goto(library + '?' + search.toString());
  const cloud = page.getByTestId('cloud-preview').getByTestId('path-cloud');
  await expect(cloud).toBeVisible();
  await expect(cloud).toHaveAttribute('data-mode', params.cloudRenderMode ?? 'auto');
  await expect(cloud).toHaveAttribute('data-renderer', /^(shader|lightweight)$/);
  await page.waitForTimeout(900);
  return cloud;
}
async function observe(page: import('@playwright/test').Page, name: string): Promise<Observation> {
  const cloud = page.getByTestId('cloud-preview').getByTestId('path-cloud');
  return {candidate:name,renderer:await cloud.getAttribute('data-renderer'),
    fallback:await cloud.getAttribute('data-fallback-reason'),timestamp:new Date().toISOString()};
}

test('M4 Clear and current-palette transparent clouds render actual browser candidates', async ({ page }) => {
  test.setTimeout(90_000);
  mkdirSync(evidenceDir, { recursive: true });
  const observations: Observation[] = [];
  await page.setViewportSize({width:1440,height:900});
  await page.emulateMedia({reducedMotion:'no-preference'});
  let cloud = await openCloud(page, {cloudRenderMode:'shader',cloudPreset:'clear'});
  observations.push(await observe(page, 'Original M4 Clear'));
  await page.screenshot({path:resolve(evidenceDir, 'cloud-m4-clear-1440-chromium.png')});
  if ((await cloud.getAttribute('data-renderer')) === 'shader') {
    await expect(cloud.locator('canvas')).toHaveCount(1);
    await expect(cloud.locator('.r2-cloud')).toHaveCount(0);
  } else {
    await expect(cloud.locator('.r2-cloud')).toHaveCount(3);
  }
  cloud = await openCloud(page, {cloudRenderMode:'shader',cloudPreset:'staircase'});
  observations.push(await observe(page, 'Transparent M4 clouds over current CSS sky'));
  await page.screenshot({path:resolve(evidenceDir, 'cloud-m4-transparent-current-1440-chromium.png')});
  await page.waitForTimeout(1500); // Playwright's WebM captures drift, if GPU is available.
  await page.screenshot({path:resolve(evidenceDir, 'cloud-m4-transparent-drift-later-1440-chromium.png')});
  await page.setViewportSize({width:834,height:1112});
  await page.screenshot({path:resolve(evidenceDir, 'cloud-m4-current-834-chromium.png')});
  writeFileSync(resolve(evidenceDir, 'browser-renderer-observations.json'), JSON.stringify(observations,null,2));
});

test('legacy lightweight, simulated unavailable WebGL, reduced motion and independent parallax', async ({page}) => {
  test.setTimeout(90_000);
  mkdirSync(evidenceDir, {recursive:true});
  await page.setViewportSize({width:1024,height:768});
  await page.emulateMedia({reducedMotion:'no-preference'});
  let cloud = await openCloud(page,{cloudRenderMode:'lightweight',cloudPreset:'staircase'});
  await expect(cloud).toHaveAttribute('data-renderer','lightweight');
  await expect(cloud.locator('.r2-cloud')).toHaveCount(3);
  await expect(cloud.locator('canvas')).toHaveCount(0);
  await page.screenshot({path:resolve(evidenceDir,'cloud-m4-lightweight-1024-chromium.png')});
  const shiftBefore = await cloud.evaluate(el=>getComputedStyle(el).getPropertyValue('--m4-negative-shift').trim());
  expect(shiftBefore).toBe('0px');
  // The same component changes only cameraX: no new camera, no new Shader context.
  const cameraSlider = page.getByTestId('cloud-designer-controls').getByRole('slider').last();
  await cameraSlider.focus();
  await page.keyboard.press('End');
  await expect.poll(async()=> cloud.evaluate(el=>getComputedStyle(el).getPropertyValue('--m4-negative-shift').trim()))
    .not.toBe('0px');
  await page.screenshot({path:resolve(evidenceDir,'cloud-m4-lightweight-scrolled-1024-chromium.png')});
  cloud = await openCloud(page,{cloudRenderMode:'shader',cloudPreset:'staircase',cloudSimulateUnavailable:'true'});
  await expect(cloud).toHaveAttribute('data-renderer','lightweight');
  await expect(cloud).toHaveAttribute('data-fallback-reason',/simulated/);
  await page.screenshot({path:resolve(evidenceDir,'cloud-m4-no-webgl-1024-chromium.png')});
  await page.emulateMedia({reducedMotion:'reduce'});
  cloud = await openCloud(page,{cloudRenderMode:'auto',cloudPreset:'staircase'});
  await expect(cloud).toHaveAttribute('data-renderer','lightweight');
  await expect(cloud.locator('.r2-cloud')).toHaveCount(3);
  expect(await cloud.locator('.r2-cloud').first().evaluate(el=>getComputedStyle(el).animationName)).toBe('none');
  await page.screenshot({path:resolve(evidenceDir,'cloud-m4-reduced-motion-1024-chromium.png')});
});
