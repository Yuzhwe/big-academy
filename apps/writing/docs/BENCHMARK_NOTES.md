# Writing Lesson 1 benchmark — independent implementation

Date: 2026-10-20 (Asia/Shanghai). Visual status: **in review**, not designer approved.

Baseline: `main` at `e0a96d867c393e168087a98bbe05277138459262`.
Branch: `benchmark/writing-hifi-codex-01a15859`.
Only the canonical main checkout was read. No other benchmark branch or PR implementation was inspected or reused.

## Run and review

From the repository root:

```sh
npm ci
npm run dev -w @big-academy/writing -- --host 127.0.0.1 --port 5174 --strictPort
```

Open http://127.0.0.1:5174/. Select **Start** on Topic sentences. A fresh browser has only screen 1 unlocked. Existing work uses **Continue**. Course state uses the existing `g2o_unit_state_v4` record, not a demo progress store. To review a fresh attempt without changing saved work, use a separate browser profile/incognito window.

The preview is local to this machine. No hosted deployment was provisioned. Lessons 2–9 remain outside the benchmark: their real path eligibility is retained, but entering an eligible later lesson opens an explicit unavailable-content notice. Keep going and Stop for today preserve the next lesson resume point without inventing those activities.

```sh
npm run check:docs
npm run typecheck
npm test
npm run build
node node_modules/playwright/cli.js test --config apps/writing/playwright.benchmark.config.ts
npm run storybook
```

The benchmark browser config uses installed Chrome and port 5174, avoiding the other local service on port 5173. If Chrome is unavailable, install Playwright Chromium and remove `channel: 'chrome'` from this config. Storybook is included in `npm run build`.

## Implemented experience

- Approved separate-platform diagonal E-01, real gates/Start/Continue/Review, level Tabs, noninteractive folded Unit banners, and keyboard/drag/wheel/touch path exploration.
- P2 rule/example comparison and hamburger diagram; P3 single, tapword and multi-select; P4 ordered card build and literal frame fill; P5 offline authored writing criteria; P7 rotating item sets, four-question pager, blank warning, immutable graded review and sticky mastery.
- Practice selection never grades. Empty pick/word checks do not consume a try. First misses stay open; second misses or the hint ladder finish `shown` with zero credit. Wrong ordered cards never spend a try. Three consecutive misses point to the needed card.
- Apply rejects too-short/CJK input without a try, retains checked results during edits, and requires an explicit Move on after two failed checks. This completion is not a pass.
- Assessment grades only at hand-in. The first failed set does not finish screen 8; the second hand-in can finish without mastery. Passing requires two auto answers **and** correct writing. Lesson End reports that difference.
- Answers, attempts, hint levels, card order, text provenance, Apply history, assessment answers/results/question position and valid unlocks survive Back, path return, refresh and re-entry. Text edits debounce 250ms; navigation, submissions and page leave flush. Source classifiers determine original practice credit, including grid=0.5 and paste/reveal=0.
- One circular ActivityScreenIndicator renders in the measured rail and anchored nonmodal full-index popover. Number persists under check/lock badges; selected and done are independent. Escape returns focus, locked entries do not navigate, and the rail has no data count limit.

## Reuse and component changes

Reused: BAButton, BAIcon (existing official Iconoir subset), BATabs/TabList/TabPanel, BAText/BANumber, LessonTopBar, LessonWorkspace, StairLessonCard, UnitMilestone, StaircaseScene, canonical curriculum and original pure Engine/Analyzer/Prov helpers.

Implemented existing planned contracts: BAChoice (BA-UI-003), BAField (BA-UI-004), WordGrid (BA-WR-003). New: ActivityScreenIndicator (BA-UI-012), LessonActivity (BA-WR-007), StairUnitCard (BA-WR-008). Props/events/states/ownership and stories are recorded in `contracts/components.json`. Domain grading stays in CourseSession/original pure scorers; presentation receives results. No global token values were changed.

The old registry test incorrectly required a frozen implemented-component list and a preexisting visual status, while the baseline registry already declared the folded-corner direction. It now reflects implemented contracts while still forbidding inferred visual approval. The docs check required an obsolete heading absent on baseline; it now recognizes the actual canonical E-01 section without changing PRODUCT.

Files changed are the Writing course/session/source adapter, new activity/Unit/WordGrid composites and stories, TopBar styles, registry/tests, BAChoice/BAField/ActivityScreenIndicator and stories, package exports/types, benchmark tests/config, dependency lock for axe, docs check and delivery documentation/evidence. See the PR diff for the exact inventory.

## Tokens and provisional values

Reused approved palette and semantic surfaces/content/actions/feedback; spacing 4/8/12/16/24/32/48; role-based control/card/floating radii; elevation 100/200/300; ordinary 0.5px borders, focus width and 44px hit targets; typography family/numeral aliases. Explicit Dosis 800 and Jost are retained for English activity text with Chinese support enabled.

No new global token candidates were installed. Component-local review candidates:

| Candidate | Value / reason |
|---|---|
| Workspace columns | 30% Coach, min 300px; tablet min 280px / 32%, 720px single-column transition |
| Progress rail | 48px measured capacity cell; 36px compact/44px regular circles; 18px badge with 7px contact overlap; 224px mobile rail |
| Unit fold | 32px top-right fold inside existing 260px Unit width; decoration does not change bounding box |
| Paragraph diagram | 480px maximum and 36px top arc geometry; uses semantic palette, no raster art |
| Writing canvas | 240px minimum, 20/36px editable text, 36px ruling; bounded 240px on-demand tablet grid with reserved space |
| Type ramp | 32/40 desktop title, 28/36 tablet, 26/34 narrow; 40/48 Lesson End; source-approved temporary ramp |
| Ordered-card feedback | 300ms short shake; static outline on third miss, immediate under reduced motion; no motion-dependent scoring |
| Wheel input settle | 140ms before snapping to a platform; never a learning gate |
| Apply read affordance | 250ms local Reading state; deterministic offline grader |

These are component geometry/typography candidates, not approved global Tokens. Douyin distribution/family is still unresolved in the canonical docs; Chinese headings use the existing fallback. Existing remote font loading remains in use and no new font binaries were bundled.

## Validation and review limits

Actual final results and screenshots: [evidence index](evidence/benchmark/README.md).

Browser tests exercise real UI interactions; they do not inject completed progress or bypass gates. They cover pass, two-round fail, reveal/retry, blank hand-in, Apply move-on, graded review, reload/resume and Review. Screenshots include 1440×900, 1024×768, 834×1112 and 390px, English/Chinese, all eight screens, popover, all L2 Units and flat/fold anchor comparison. Axe WCAG A/AA scans run on each of the eight real activity screens; separate E-01 and Learn/pick scans are included.

Manual screen-reader use (VoiceOver/NVDA), real IME composition on physical hardware and a real touchscreen were not run. Keyboard and emulated touch were exercised. The 200% evidence uses 720×450 CSS viewport at DPR 2 (equivalent reflow for a 1440×900 display), not the browser's menu zoom. Storybook was built; its browser interaction runner was not separately executed. Automated accessibility checks do not establish full accessibility conformance.

Known limitations / unresolved specification questions:

1. `ts8` has no authored `accept` sentence in the canonical data. PRODUCT specifies using the authored reason when no accept list exists. Reveal therefore freezes the learner's sentence and explains the authored reason; it does not fabricate a model sentence.
2. PRODUCT requires stopping at Lesson 1 while the general Lesson End flow includes Lesson 2. The next resume point and all three exit actions are implemented, but further curriculum is intentionally unavailable.
3. Douyin asset verification and designer approval remain outstanding. All visuals, provisional geometry and Unit states are candidates for UI/UX review.
4. The baseline milestone renderer/receipt policy and ten-effect gallery are outside this lesson's achievable unit completion; this benchmark does not claim to re-verify all celebration effects or all levels. Lesson End uses a static outcome and does not start a particle celebration.
5. No live model endpoint is configured. Apply uses the specified offline criterion checker; it is not a free-form AI grade.
6. Existing dependency audit reports 1 moderate and 2 critical advisories. No unrelated dependency upgrade was applied. See captured audit report for affected development dependencies.
