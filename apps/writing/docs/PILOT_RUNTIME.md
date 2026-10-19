# Lesson Top Bar pilot — runtime record

**Date:** 2026-10-19  
**Branch:** `feat/grokbot-writing-topbar`  
**Visual status:** temporary foundation theme. Not visually approved. Not `validated`.

## What runs

| Piece | Result |
|---|---|
| `npm install` | Lockfile created. Workspace install of `@big-academy/design-system` and `@big-academy/writing`. |
| `npm run typecheck` | Pass. Package, app, stories, and Playwright sources. |
| `npm test` | Pass. 12 tests, 4 files (Vitest + Testing Library). |
| `npm run build -w @big-academy/design-system` | Pass. `packages/design-system/dist/index.js` and `dist/index.css`. |
| `npm run build -w @big-academy/writing` | Pass. `apps/writing/dist`. |
| `npm run build-storybook -w @big-academy/writing` | Pass. Storybook 10.6.2. Chunk-size warning only. |
| `npm run test:layout` | Pass. 3 Playwright tests. Chromium. |
| `npm audit` | 0 vulnerabilities at the time of this run. |

React Aria Components `1.22.x` is the headless base. `BAButton` uses its `Button`. Pending state uses `isPending` plus an inner `ProgressBar`. The button element does not also receive `aria-busy`, which avoids the known duplicate `aria-busy` declaration.

## Layout evidence

Progress group center versus the header center. Negative overlap means the left identity ends before the progress group starts.

| Viewport | Fixture | Center delta | Overlap | Back height | Task control height |
|---|---|---:|---:|---:|---:|
| 1440×900 | EN mixed | 0px | -128.13px | 44px | 55px |
| 1440×900 | EN 18 tasks | 0px | -34.23px | 44px | 55px |
| 1024×768 | EN long title | 0px | -61.98px | 44px | 55px |
| 1024×768 | ZH mixed | 0px | -122.34px | 44px | 55px |
| 834×1112 | ZH long title | 0px | -32.53px | 44px | 55px |
| 834×1112 | EN 18 tasks | 0px | -16.02px | 44px | 55px |
| 390×844 | ZH long title (smoke) | 0px | -16.02px | 44px | 55px |

Screenshots: `apps/writing/docs/evidence/*.png`. Raw numbers: `layout-metrics.json`.

Centering is `left: 50%` + `translateX(-50%)` on the progress group, so a long title truncates inside the left column instead of pushing the group off the header center. The end slot is empty. There is no menu control.

At container widths below 1360px, lesson tags are clipped visually and remain in the accessibility tree. Below 1280px the back control keeps the icon and the full accessible name; the short visible label is clipped.

## Tests covered

- EN and ZH chrome, including a long Chinese lesson title with no second language rendered beside it.
- Five task states: done, current, available, locked, skipped. Skipped is named and drawn separately from done.
- 18-task list, locked rows do not navigate, and an available row navigates only when `canOpen` returns true.
- A done or current row whose `canOpen` returns false does not navigate. The component does not treat status as permission.
- Keyboard: Tab, Enter, and Space on `BAButton`; Space on an open task; disabled locked task.
- Registry status is `implemented` for BA-UI-001, BA-UI-006, and BA-WR-001, and `planned` for the other ten.

## Unresolved — do not treat this pilot as signed off

1. **Not Alex course state.** `apps/writing/src/fixtures/topbarFixtures.ts` copies G2-O lesson-plan titles for realistic length. `canOpen` in that fixture only closes rows already marked `locked`. It does not call `Pages.canOpen`, `Pages.done`, or `Skip.skipped`. Indexes are lesson-local. A production adapter must map them to Alex's global screen index. No scoring, skip revocation, or answer store exists here, so Back cannot reset answers because there is nothing to reset.
2. **Menu behavior is not re-homed.** The bar no longer has Index, Analytics, or the Menu drawer. Removing the control does not delete those product behaviors. They still need a home.
3. **Visuals are a temporary foundation theme.** Warm surface `#FEF9EF` is still a DESIGN.md candidate. Interactive borders are 1px so default, focus, and disabled stay distinguishable; the approved 0.5px weight is used on the header separator only. Heights 80px / 76px follow the pilot brief and are not approved dimensions. Skipped shows the number, a dashed circle, and the word "skipped" / "已跳过" rather than Alex's check glyph, so it is not distinguished from done by color alone. The designer still needs to choose chips versus segments.
4. **Copy gap.** This pilot says "Task" / "任务". Alex `Shell.step` says "Page".
5. **Fonts are not bundled.** The stack asks for Noto Sans / Noto Sans SC, then WenQuanYi Micro Hei, PingFang, and Microsoft YaHei. Dosis, Jost, and Douyin Sans are not shipped.
6. **Canonical Skill v0.2 is not in this repo.** `skills/README.md` still says to import it.
7. **Out of scope and still open in PRODUCT.md:** Level Goal completion rule, simultaneous new milestones, skip revocation and celebration receipts.
8. **Assistive-tech pass is incomplete.** Keyboard, names, `aria-current`, and disabled locked rows were checked in Chromium. This is not a VoiceOver, NVDA, or TalkBack acceptance pass. Storybook includes the a11y addon for the next review.

## Commands

```bash
npm install
npm run typecheck
npm test
npm run build
npm run dev
npm run storybook
npm run test:layout
```
