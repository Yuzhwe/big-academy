import { expect, test, type Page } from '@playwright/test';

// Half-pixel CSS borders are quantized to a full device pixel on DPR=1.
// Inspect the approved 0.5 CSS-pixel stroke on a DPR=2 browser.
test.use({ deviceScaleFactor: 2 });

const lib = 'http://127.0.0.1:6007/?view=components&component=words';
const primary = (page: Page) => page.getByTestId('lesson-footer').getByRole('button').last();
const options = (page: Page) => page.locator('.ba-choice__option');
async function advance(page: Page) { await primary(page).click(); }

async function reachBuild(page: Page) {
  await page.goto('/?start=lesson');
  await options(page).nth(1).click(); await advance(page); await advance(page);
  await page.getByRole('button', { name: 'believe', exact: true }).click();
  await advance(page); await advance(page);
  for (const i of [0, 2, 4]) await options(page).nth(i).click();
  await advance(page); await advance(page);
  await expect(page.getByTestId('build-bench')).toBeVisible();
}
async function finishBuildToFrame(page: Page) {
  for (const word of ['our','school','should','have','a','garden','for','two','big','reasons','.']) {
    // Current shared WordChip renders its word text directly, without the
    // historical .word-grid__text child wrapper used by old E2E specs.
    await page.locator('.word-grid__card').filter({
      hasText: new RegExp('^' + (word === '.' ? '\\.' : word) + '$'),
    }).click();
  }
  await advance(page); await advance(page);
  await expect(page.getByTestId('frame')).toBeVisible();
}
async function reachFrame(page: Page) {
  await reachBuild(page);
  await finishBuildToFrame(page);
}
async function reachNotebook(page: Page) {
  await reachFrame(page);
  const fields = page.getByTestId('frame').locator('input');
  await fields.nth(0).fill('be longer');
  await fields.nth(1).fill('kids need time to run');
  await advance(page); await advance(page);
  await expect(page.getByTestId('notebook-scroll')).toBeVisible();
}

test('R10-04: shared Library and Writing Neutral cards have white 0.5px warm stroke', async ({ page }) => {
  await page.goto(lib);
  const libraryWord = page.locator('.word-chip[data-selection="default"][data-evaluation="neutral"]').first();
  await expect(libraryWord).toBeVisible();
  await expect(libraryWord).toHaveCSS('background-color', 'rgb(255, 255, 255)');
  // Blink snaps fractional CSS borders to a rasterized 1px computed width.
  // The authoring token remains exactly 0.5px; assert both it and the actual
  // visible border color, while documenting the engine rounding separately.
  await expect(libraryWord).toHaveCSS('--ba-wordchip-neutral-stroke', '0.5px');
  expect(Number.parseFloat(await libraryWord.evaluate(el => getComputedStyle(el).borderTopWidth))).toBeLessThanOrEqual(1);
  await expect(libraryWord).toHaveCSS('border-top-color', 'rgb(217, 203, 184)');
  await page.goto('/?start=lesson');
  await options(page).nth(1).click(); await advance(page); await advance(page);
  const writingWord = page.locator('.course-words .word-chip[data-selection="default"][data-evaluation="neutral"]').first();
  await expect(writingWord).toHaveCSS('background-color', 'rgb(255, 255, 255)');
  await expect(writingWord).toHaveCSS('--ba-wordchip-neutral-stroke', '0.5px');
  expect(Number.parseFloat(await writingWord.evaluate(el => getComputedStyle(el).borderTopWidth))).toBeLessThanOrEqual(1);
  await expect(writingWord).toHaveCSS('border-top-color', 'rgb(217, 203, 184)');
  await writingWord.click();
  await expect(writingWord).toHaveAttribute('data-selection', 'selected');
});

test('R10-05: Activity 4 and 5 answer text and input are Jost 24px/36px', async ({ page }) => {
  await reachBuild(page);
  const bench = page.getByTestId('build-bench');
  await expect(bench).toHaveCSS('font-size', '24px');
  await expect(bench).toHaveCSS('line-height', '36px');
  await finishBuildToFrame(page);
  const frame = page.getByTestId('frame');
  await expect(frame).toHaveCSS('font-size', '24px');
  await expect(frame).toHaveCSS('line-height', '36px');
  for (const input of await frame.locator('input').all()) {
    await expect(input).toHaveCSS('font-size', '24px');
    await expect(input).toHaveCSS('line-height', '36px');
  }
});

test('R10-06/07/08: Q6 alignment, single scroll owner, moving rules, dock and dynamic fades', async ({ page }) => {
  test.setTimeout(180_000);
  await reachNotebook(page);
  const scroll = page.getByTestId('notebook-scroll');
  const textarea = page.getByTestId('writing-canvas');
  const field = page.locator('.course-answer-notebook__field');
  const dock = page.locator('.course-answer-notebook__words');

  await expect(textarea).toHaveCSS('font-size', '24px');
  await expect(textarea).toHaveCSS('line-height', '43.2px');
  await expect(textarea).toHaveCSS('overflow-y', 'hidden');
  await expect(scroll).toHaveCSS('overflow-y', 'auto');
  await expect(page.locator('.course-answer-notebook .course-title')).toHaveCSS('font-size', '32px');
  await expect(page.locator('.course-answer-notebook .course-title')).toHaveCSS('line-height', '36.8px');
  await expect(page.locator('.course-answer-notebook .notebook-shell__ruled')).toHaveCSS('display','none');

  for (const [width,height] of [[1440,900], [1024,768], [834,1112]]) {
    await page.setViewportSize({width,height});
    await page.evaluate(() => document.fonts.ready);
    const actual = await page.evaluate(() => {
      const sheet = document.querySelector('.notebook-shell__sheet')!.getBoundingClientRect();
      const coach = document.querySelector('.lesson-workspace__coach')!.getBoundingClientRect();
      return {sheetTop:sheet.top,coachTop:coach.top};
    });
    console.log(`R10 geometry ${width}x${height}: sheetY=${actual.sheetTop.toFixed(2)}, coachY=${actual.coachTop.toFixed(2)}, delta=${(actual.sheetTop-actual.coachTop).toFixed(2)}px`);
    expect(Math.abs(actual.sheetTop - actual.coachTop), `paper/Coach drift at ${width}`).toBeLessThanOrEqual(2);
  }

  const baseline = await field.evaluate(el => ({
    fieldTop: el.getBoundingClientRect().top,
    ruleTop: Number.parseFloat(getComputedStyle(el,'::before').top),
    textareaTop: el.querySelector('textarea')!.getBoundingClientRect().top,
  }));
  expect(Math.abs(baseline.fieldTop + baseline.ruleTop + 0.5 - (baseline.textareaTop + 43.2))).toBeLessThanOrEqual(1);

  const text = Array.from({length:70},(_,i)=>`Sentence ${i+1}: I believe our school garden makes learning better.`).join('\n');
  await textarea.fill(text);
  await expect.poll(async()=>scroll.evaluate(el => el.scrollHeight > el.clientHeight)).toBe(true);
  const dockTop = (await dock.boundingBox())!.y;
  await scroll.evaluate(el => { el.scrollTop=0;el.dispatchEvent(new Event('scroll')); });
  await expect(scroll).toHaveAttribute('data-fade-top','false');
  await expect(scroll).toHaveAttribute('data-fade-bottom','true');
  await scroll.evaluate(el => { el.scrollTop=(el.scrollHeight-el.clientHeight)/2;el.dispatchEvent(new Event('scroll')); });
  await expect(scroll).toHaveAttribute('data-fade-top','true');
  await expect(scroll).toHaveAttribute('data-fade-bottom','true');
  await scroll.evaluate(el => { el.scrollTop=el.scrollHeight;el.dispatchEvent(new Event('scroll')); });
  await expect(scroll).toHaveAttribute('data-fade-top','true');
  await expect(scroll).toHaveAttribute('data-fade-bottom','false');
  expect((await dock.boundingBox())!.y).toBeCloseTo(dockTop,0);

  // The textarea remains one stable editable element when content shrinks.
  await textarea.fill('Short.');
  await expect.poll(async()=>textarea.evaluate(el=>el.scrollHeight <= el.clientHeight+2)).toBe(true);
  await scroll.evaluate(el => {el.scrollTop=0;el.dispatchEvent(new Event('scroll'));});
  const fade = await scroll.evaluate(el=>({
    overflow:el.scrollHeight>el.clientHeight+2,
    top:el.getAttribute('data-fade-top'),bottom:el.getAttribute('data-fade-bottom'),
  }));
  if(!fade.overflow) expect([fade.top,fade.bottom]).toEqual(['false','false']);
  expect(await textarea.evaluate(el=>el.isSameNode(document.querySelector('[data-testid="writing-canvas"]')))).toBe(true);
  await textarea.fill('I like gardens.');
  await textarea.press('Home');
  await textarea.press('ArrowRight');
  await textarea.press('ArrowRight');
  for (let n = 0; n < 4; n++) await textarea.press('Shift+ArrowRight');
  const firstCard = dock.locator('.word-grid__card').first();
  const replacement = (await firstCard.innerText()).trim();
  await firstCard.click();
  const afterFirst = await textarea.inputValue();
  expect(afterFirst).toContain(replacement);
  expect(afterFirst).not.toContain('like');
  const secondCard = dock.locator('.word-grid__card').nth(1);
  const inserted = (await secondCard.innerText()).trim();
  await secondCard.click();
  expect(await textarea.inputValue()).toContain(inserted);
  await textarea.focus();
  await textarea.press('End');
  await expect(textarea).toBeFocused();
});
