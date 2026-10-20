# Benchmark review evidence

Generated from the running app and built Storybook on 2026-10-20. Screenshots are candidate renderings for designer review.

## Validation

| Check | Actual result | Evidence |
|---|---|---|
| Documentation authority | Pass | [log](docs-results.txt) |
| Typecheck | Pass (shared + Writing + pilot) | [log](type-results.txt) |
| Unit tests | 49 passed in 12 files | [log](unit-results.txt) |
| Build | Pass: shared library, app, Storybook | [log](build-results.txt) |
| Browser suite | 8 passed, real interactions | [log](browser-results.txt), [JSON](results.json) |
| Automated accessibility | 0 WCAG A/AA violations on all 8 Activity Screens | [per-screen JSON](accessibility-screens.json), [path/Learn/pick scan](accessibility.json) |
| Responsive | 1440×900, 1024×768, 834×1112, 390×844 | screenshots below |
| Story examples | 13 built stories opened/captured | [capture log](stories-results.txt) |
| Dependency audit | 1 moderate, 2 critical in existing Vitest/mocker/tinypool development chain | [audit](dependency-audit.json) |

No VoiceOver/NVDA session, real hardware touch/IME, browser-menu 200% zoom, or separate Storybook test-runner pass is claimed. Zoom evidence uses equivalent 720×450 CSS viewport at DPR 2. See [implementation notes](../../BENCHMARK_NOTES.md) for scope and limitations.

## Complete lesson and feedback

| State | Screenshot |
|---|---|
| E-01 separate platforms | [View](00-staircase-desktop.png) |
| 01 Learn / Workspace | [View](01-learn-desktop.png) |
| 02 Single pick — correct | [View](02-correct.png) |
| 02 First miss | [View](02-wrong-tablet.png) |
| 02 Second miss / shown | [View](02-shown-tablet.png) |
| 03 Tapword | [View](03-tapword.png) |
| 04 Multi pick | [View](04-multiple.png) |
| 05 Ordered build — three wrong cards, no spent try | [View](05-build-hint.png) |
| 05 Completed build | [View](05-build-complete.png) |
| 06 Frame fill | [View](06-frame.png) |
| 06 Second miss / authored explanation | [View](06-shown-tablet.png) |
| 07 Apply check — pass | [View](07-apply-pass.png) |
| 07 Apply — explicit move on without pass | [View](07-apply-move-on.png) |
| 07 Exit / reload / Continue restored writing | [View](07-resume.png) |
| 08 Assessment writing | [View](08-assessment-writing.png) |
| 08 Blank warning | [View](08-blank-warning-0.png) |
| 08 First set fail | [View](08-fail-set-1.png) |
| 08 Second set fail | [View](08-fail-set-2.png) |
| 08 Pass | [View](08-pass-results.png) |
| 08 Read-only answer review | [View](08-graded-review.png) |
| Lesson End — mastered | [View](09-lesson-end-pass.png) |
| Lesson End — complete, not mastered | [View](09-lesson-end-fail.png) |
| Independent Coach scroll, fixed footer | [View](coach-independent-scroll.png) |

## Responsive, language and navigation

| Width | EN path | ZH path | ZH lesson | Full-index popover |
|---|---|---|---|---|
| 1440px | [View](path-1440.png) | [View](path-1440-zh.png) | [View](learn-1440-zh.png) | — |
| 1024px | [View](path-1024.png) | [View](path-1024-zh.png) | [View](learn-1024-zh.png) | [View](popover-1024.png) |
| 834px | [View](path-834.png) | [View](path-834-zh.png) | [View](learn-834-zh.png) | [View](popover-834.png) |
| 390px | [View](path-390.png) | [View](path-390-zh.png) | [View](learn-390-zh.png) | [View](popover-390.png) |

[200% equivalent reflow, long mixed heading](zoom-200-equivalent.png). The tests also exercise emulated touch, keyboard B/Enter, Escape focus restoration, reduced motion and geometrically centered progress.

## Unit folding and reusable components

All eight L2 Unit cards were captured through keyboard scene traversal: [Unit 1](unit-1-desktop.png), [Unit 2](unit-2-desktop.png), [Unit 3](unit-3-desktop.png), [Unit 4](unit-4-desktop.png), [Unit 5](unit-5-desktop.png), [Unit 6](unit-6-desktop.png), [Unit 7](unit-7-desktop.png), [Unit 8](unit-8-desktop.png).

[Tablet fold](unit-tablet.png) · [Same tablet bounding box with fold removed](unit-before-flat-tablet.png). The test asserts exact unchanged Unit bounding geometry.

| Component / state | Screenshot |
|---|---|
| ui-activityscreenindicator--done-selected | [View](story-ui-activityscreenindicator--done-selected.png) |
| ui-activityscreenindicator--indicator-states | [View](story-ui-activityscreenindicator--indicator-states.png) |
| ui-activityscreenindicator--regular | [View](story-ui-activityscreenindicator--regular.png) |
| ui-activityscreenindicator--shown | [View](story-ui-activityscreenindicator--shown.png) |
| ui-bachoice--correct-dim | [View](story-ui-bachoice--correct-dim.png) |
| ui-bachoice--revealed | [View](story-ui-bachoice--revealed.png) |
| ui-bachoice--wrong-retry | [View](story-ui-bachoice--wrong-retry.png) |
| writing-stairunitcard--current | [View](story-writing-stairunitcard--current.png) |
| writing-stairunitcard--done | [View](story-writing-stairunitcard--done.png) |
| writing-stairunitcard--locked | [View](story-writing-stairunitcard--locked.png) |
| writing-stairunitcard--long-chinese | [View](story-writing-stairunitcard--long-chinese.png) |
| writing-stairunitcard--long-english | [View](story-writing-stairunitcard--long-english.png) |
| writing-wordgrid--multi-group | [View](story-writing-wordgrid--multi-group.png) |
