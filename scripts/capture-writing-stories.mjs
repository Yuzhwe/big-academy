import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
// Serve apps/writing/storybook-static at 127.0.0.1:6008 first.
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const context = await browser.newContext({ viewport: { width: 1024, height: 768 } });
const page = await context.newPage();
const out = resolve('apps/writing/docs/evidence/benchmark');
mkdirSync(out, { recursive: true });
try {
  for (const story of ['writing-stairunitcard--current','writing-stairunitcard--done','writing-stairunitcard--locked','writing-stairunitcard--long-english','writing-stairunitcard--long-chinese','ui-activityscreenindicator--indicator-states','ui-activityscreenindicator--done-selected','ui-activityscreenindicator--regular','ui-activityscreenindicator--shown','ui-bachoice--wrong-retry','ui-bachoice--correct-dim','ui-bachoice--revealed','writing-wordgrid--multi-group']) {
    await page.goto(`http://127.0.0.1:6008/iframe.html?id=${story}&viewMode=story`);
    await page.locator('#storybook-root [data-component]').first().waitFor();
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: resolve(out, `story-${story}.png`) });
    console.log(`Captured ${story}`);
  }
} finally { await browser.close(); }
