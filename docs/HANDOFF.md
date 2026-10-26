# Big Academy — HANDOFF (current)

**Baseline:** v0.1 · 2026-10-20
**Branch:** main is the single source for new work.

## Authorities

- `apps/writing/PRODUCT.md` — product rules and Writing-specific page behavior.
- `DESIGN.md` — global visual language, including complete Spacing/Gap and Radius decision rules.
- `packages/design-system/src/tokens.css` — executable token values. Candidate values marked [E] still require visual approval.
- `apps/writing/contracts/components.json` — component interfaces and status; latest contracts may be ahead of component code.

## Delivery scope

Only **L2/G2-O Lesson 1: Topic sentences (eight screens)** is in scope for high-fidelity Writing v1. E-01 Staircase supports entry/return, and Lesson End reflects real mastered/unmastered assessment status.

## Independent designer library · 2026-10-25

The designer entry is now `apps/library`, an independent application with its own navigation, layout and build. Start with `npm run dev:library` at `http://127.0.0.1:6007/`. Storybook remains the separate development/test entry on port 6006; earlier Storybook task-flow fixtures are not the designer website.

- Six real components are indexed: BAChoice, BAButton, BATabs, LessonTopBar, StairLessonCard and WordGrid. The default page opens BAChoice's real preview. Search, state exploration, supported sizes, language, container widths, long text and reduced motion are integrated into browsing rather than presented as a task-flow explanation.
- State comparison, usage/contracts, actual source and review evidence/feedback use progressive disclosure. Shared components, shared CSS tokens and the existing contracts remain authoritative. Library tokens are candidates [E]; no component approval status was changed.
- Scenario links preserve configuration and BAChoice selection. Review status is read-only; checklist/notes copy to a feedback draft and never update contracts or learner progress. Screenshots and actual verification scope are available inside the evidence disclosure.
- Verification: documentation check, all four TypeScript scopes, all 59 tests and design-system/Writing/Storybook/library builds passed using installed CLIs with bundled Node. Writing/Storybook retain bundle-size warnings. Browser evidence covers desktop 1440×900, tablet 834×1112 and mobile 390×844, real interactions, share/refresh and feedback copy. See `apps/library/public/review/verification.md` and the adjacent screenshots.
- This supersedes the earlier localhost-binding limitation for the library: the independent preview was successfully opened and verified in the browser. No public deployment or full Writing Playwright/axe audit was performed. Douyin font assets remain missing. Only the six indexed components are included in this release.
- **Ready for designer review, not approved.** The supplied workspace has no Git metadata; this delivery consists of local source changes, with no new branch/commit/PR/merge. Existing historical branch labels below are not evidence of a current checkout.

## Known gaps

- Lesson 1 (eight Activity Screens) is wired in CourseApp on the v2-terraces branch: routing, `canOpen`, grading FSM, `g2o_unit_state_v4`, and EN/ZH chrome. WordGrid peach tabs and white pills are Approved. Other unreviewed visuals stay candidates where PRODUCT.md and DESIGN.md say so. Screens outside Lesson 1 remain unsupported.
- ActivityScreenIndicator and the anchored All activity screens popover follow the current contract: every circle shows the Activity Screen index, status uses color, a ring, or a secondary mark, the lesson TopBar has no bottom divider, and the tablet 834 title ellipsis stays 「第1课 主·」. Registry id BATaskProgress stays in components.json. The lesson runtime keeps the digit in every state and does not draw that divider.
- The unit folded corner is mandatory on StairUnitCard (BA-WR-007): upper-right sheet fold, goals as plain paragraphs. The English unit title uses a smaller line-height. Paper `#FFF9F2` and stroke `#DCC3AB` stay the unit surface.
- BAChoice states are `default`, `selected`, `correct`, `correctUnselected`, `wrong`, and `dim`. Aliases: `idle` is `default`, `shown` is `correctUnselected`. `selected` and `wrong` use fill `#9B4F36` as the selected fill. `correct` is green fill `#14AE5C` and a leading check. `correctUnselected` is a green outline and a leading check, with no solid green disc. `dim` is graded chrome at opacity 0.4. `disabled` is a separate non-interactive state. One-line and wrapped rows use `align-items: flex-start`. The row does not paint state-copy text. Border is 1px. Hover 1.02 and press 0.95 match the BAButton CTA. Reduced motion does not scale. The lesson runtime now follows that mapping.
- Lesson question feedback cards are a documented candidate: each message is its own card (wrong: white background and a light border; correct: white background and a green border). Previous and Next sit at the bottom of the Coach rail, at 1:2 with an 8px gap and a 70px height. The hint control is a secondary button. WordGrid peach connected sticky tabs and white pill cards are Approved. On the ordered-build screen the bank tabs are 本题词块, 观点, and 标点; Apply uses Opinion, Nouns, Adjectives, and Marks. Each remaining bench blank is an underline. A placed word stays in the line. The ordered-build controls are the word cards and the Coach-rail button group. There is no Start again and no tap-to-withdraw on that screen. The P2 Better panel uses a pale green fill and a leading check. That cue is pedagogical and is not the graded `#14AE5C` choice fill.
- `?demo=preview-seed` is a designer/demo display only: Level 0 and Level 1 lesson cards render as completed so the designer can walk the path, open completed milestones, and continue to the next lesson. It does not write learner progress or grant Mastery. Practice correct uses Ribbons + Explosions (PRODUCT §17). A completed milestone flag click uses the Confetti preset from the flag center (`startCount` 50, `rate.quantity` 0, `life.count` 1) and does not use Ribbons or Explosions. Reduced motion stays a static success state with no particles.
- E-01 path landscape is **v2-terraces** on LandscapeBackdrop (BA-WR-009): sky gradient `linear-gradient(135deg, #85DBF9 0%, #F8F4ED 100%)`, one cloud, one shared hill frame (hill-2 then hill-1), then platforms. LandscapeTerrace (BA-WR-010) specifies 2–3 grass layers. The interim scene uses one platform per node. Implementation file: `apps/writing/src/course/StaircaseScene.tsx`. The stage fills the viewport under the header. The dev note does not take stage height. Visible card tops and terrace bottoms stay inside the stage; rise steps down inside the 48–120 clamp only when a short stage cannot fit them. Path scroll moves the rail on one diagonal: camera Y tracks camera X at the rise slope, so cards do not drop one-by-one vertically while panning. Each hill file appears once, aspect preserved, as tall as the stage, ground on the bottom. Hill 1 moves at the speed that carries that frame across the camera travel and stays slower than the cards. Each farther layer keeps the on-screen share of the track (`viewport / track length`). Those inputs are the node count, track length, and camera max travel. The retired 0 / 0.12 / 0.40 / 0.72 / 1 table is not used. The lesson runtime now paints that gradient. Artwork is `apps/writing/public/path/v2-terraces/`. The interim platform is one 352×64 layer per node. There is no Path A/B control. The ordered-build per-word hint stays in PRODUCT.
- Validate P2–P7 grading, second tries/shown, Apply, P7 second assessment set, Back/Continue/refresh, keyboard/touch, EN/ZH, zoom and responsive screens.
- Run `npm run check:docs`, `npm run typecheck`, `npm test`, `npm run build`, relevant browser/Storybook tests; record actual pass/fail evidence. No previous QA results are asserted as proof for this baseline.

## Workflow

Create independent feature branches from `main`, implement against the four authoritative assets, then request designer review before merging. Historical stacked PRs and other agents' prototypes are reference-only and should not be used as new baselines.


## Phase 1 Component Workbench Pilot · 2026-10-24

Branch: \`feat/component-workbench-pilot-20261024\` (unmerged). UI status: **Ready for Visual Review**, not Approved.

- Storybook: \`npm run storybook\`, then \`http://127.0.0.1:6006/\`. Review entries: \`Primitives/BATabs\`, \`Writing/Path/StairLessonCard\`, \`Primitives/BAChoice\`. Start Here includes the Storybook guide, design review checklist and progressive-disclosure task flow. Base token overview remains \`http://127.0.0.1:5173/?system\` when \`npm run dev\` is running. Desktop 1440x900, tablet 834x1112, mobile 390x844 are review targets.
- BA-UI-002: React Aria Tabs with controlled selection, keyboard, disabled L3, EN/ZH and size variants. Writing session still owns the level navigation logic.
- BA-WR-005: real shared BAButton size 70, two reserved title lines, numeric minutes supplied by product, number seal/attached state symbol, five states, long text, EN/ZH. Locked CTA disabled; product still owns unlock. Implementation \`apps/writing/src/components/writing/StairLessonCard.tsx\`.
- BA-WR-010: \`LandscapeTerrace.css\` shares the existing interim CSS platform geometry with the real scene. \`LandscapeTerrace.tsx\` is an optional decoration only for isolated compositions; not a duplicate business component. The scene CSS imports this source. Candidate art is not designer-approved.
- BA-UI-003: React Aria single/multiple and graded states; Storybook includes controlled Check/Reset demo (not real pedagogy). Text now inherits EN/ZH language. Grading, retries, Coach and unlock remain in product.
- Contract authority remains \`apps/writing/contracts/components.json\`; no new registry platform. These are presentation candidates. Run typecheck, tests, build and browser QA locally; no build, screenshot or accessibility pass is asserted until actually run. GitHub-only editing cannot open the user's Mac localhost or produce authentic Mac screenshots.
- Storybook UX IA update · 2026-10-25: Storybook now has a Start Here guide and design-review checklist, a progressive-disclosure task-flow fixture under `Review Workbench/Task Flows`, global Writing/Neutral, EN/ZH and Reduced Motion toolbar globals, and a shared warm-frame preview surface. Formal stories use `Foundations`, `Primitives`, `Writing/Shell`, `Writing/Activities`, and `Writing/Path` prefixes. Core stories carry Contract ID, owner, purpose and review status in `parameters.ba`. The static build completed successfully with the bundled Node runtime; the dev server could not bind port 6006 in the restricted environment, so browser screenshots and live localhost review remain pending on a normal local run.
- Future HTML Generation Agent must look up IDs in the existing registry, import the real implementation and supply props; never restyle or reimplement states in a generated lesson. Only the designer can mark Approved.

## Local QA · 2026-10-24

- Environment: macOS arm64; official Node.js LTS v22.23.4 installed locally under .local/node-v22; npm 10.9.9; dependencies installed with npm ci.
- Storybook: npm run storybook is running at http://127.0.0.1:6006/; Workbench / 02 · Lesson Card (BA-WR-005) · Full Composition is open for visual review.
- Passing: npm run typecheck, npm test (13 files / 52 tests), npm run build, npm run build-storybook, npm run check:docs.
- Browser QA: 13/16 Playwright tests pass after installing Chromium. Three existing E-01 issues remain: two 60s timeouts around the celebration overlay path and one legacy terrace height expectation conflicts with the current fixed two-line Lesson Card contract. No visual approval is claimed.
- Screenshots: apps/writing/docs/evidence/staircase-ab/ and apps/writing/docs/evidence/slice/ include desktop 1440x900 and tablet 834x1112 evidence; mobile 390x844 evidence remains in apps/writing/docs/evidence/celebration/mobile-zh.png.



## Component Library R2 · 2026-10-26

- Independent designer site: `apps/library`, `npm run dev:library`, http://127.0.0.1:6007/. Storybook remains the separate developer/test entry. R1 layout and all six real component imports are retained; no iframe shell or duplicate component implementation.
- R2 adds all 186 scoped color/effect declarations, four button variants (Outline candidate), content/layout options, symmetric Tabs and Choice insets, candidate Dark Tabs, four lesson roles with full-width 70px CTA and opt-in three-line titles, and WordGrid A–H interactive scenarios. URL sharing restores R2 configuration and WordGrid/Choice state.
- WordGrid selection/evaluation/interaction are independent. Used does not imply disabled. Writing explicitly supplies disabled for consumed ordered-build words, retaining its no-undo rule. System-shown answer is not learner correctness; the standalone free-build demo applies feedback to the sentence. Empty group list remains hidden. Locked lesson actions never call onEnter; onBlocked preserves the existing product explanation path.
- Visual review pending: Outline, Dark Tabs, Tabs/Choice spacing correction, current-card emphasis/three-line composition, WordGrid added feedback. Existing approved peach/white WordGrid baseline and existing brand values are preserved. Existing decoration is LandscapeTerrace, not a newly invented cloud.
- Passing checks and browser evidence are recorded in `apps/library/public/review/r2/verification.md`. Browser pressure checks cover 320/390/560/768/834/1440px. Fixed a grid intrinsic-width bug uncovered at 320px. No hardware touch-device or full course E2E pass is claimed. Existing Choice green/white contrast and missing Douyin asset remain review gaps.
- Version delivery uses `feat/component-library-r2` from the byte-verified current `feat/component-workbench-pilot-20261024` baseline (efa38def), per this task's explicit current-baseline instruction. This supplied directory has no .git; the GitHub connector is used for commit/PR. Neither main nor Vercel is changed. Technical verification is not designer approval.

- Review screenshots remain local-only by user decision on 2026-10-26. The review branch includes source and the text report, not image artifacts. Other checkouts show a local-evidence notice instead of requesting absent screenshots.

## Writing Hi-Fi Integration v1.0 · 2026-10-26

Implemented on an isolated branch from byte-verified PR #51/e2886bab, with the remote delivery commit retaining that actual parent. The local supplied workspace had no Git metadata; the isolated local snapshot history is documented in `apps/writing/docs/INTEGRATION_V1.md`.

Shared component updates, R2.12 cloud/scenery/badge/flag migration, canonical Lesson 1's eight screens, first/second assessment sets, distinct mastery/non-mastery outcomes, Lesson End/Review, feedback and caret/provenance recovery are integrated. Edit writes debounce 250ms; navigation, grading and page exit flush immediately. No additional course content, main merge or Vercel deployment. Git deployments disabled in this review branch.

Mac entry: `Start Big Academy.command`. Local Writing: http://127.0.0.1:5174/. Component library and Storybook remain independent. Local screenshots/gallery and detailed validation/known issues are linked in `apps/writing/docs/INTEGRATION_V1.md`; final check counts are recorded there after the last run.

Visual status is in-review. Do not merge before designer acceptance. The complete R2 Design Review 01 and the exact `(1)`-suffixed HTML were unavailable; explicit current-request review items and the located R2.12 reference are implemented. Douyin asset, physical-device/screen-reader/native-menu-zoom tests, source localization gaps and PRODUCT §19 owner decisions remain as documented limitations.

Final delivery: Draft PR https://github.com/Yuzhwe/big-academy/pull/52, branch `feat/writing-hifi-integration-v1`, targeting `feat/component-library-r2`. Final checks: docs/typecheck passed; 83 unit tests and 24 browser tests passed; all four build outputs passed; 3 axe scenarios reported no violations. Forty screenshots remain local with a gallery. The Mac launcher was actually executed against the running site and opened it successfully. Full Review 01 source parity and visual acceptance remain pending as described above.

## Fixed local review URLs · 2026-10-26

The component library and Writing review website now have separate per-user macOS background services: http://localhost:6007/ and http://localhost:5174/. They serve built review snapshots from `~/Library/Application Support/Big Academy/sites/`, with a copied Node runtime outside Documents so login startup does not depend on Terminal or access to the source folder. Two LaunchAgents run at login and restart after an unexpected exit. Both IPv4 and IPv6 loopback are supported; the existing 127.0.0.1 aliases still work.

Rebuild the desired app, then run `npm run local-sites:install` from the integration folder to refresh the same URLs. No UI, curriculum or learning-state rules changed. Site snapshots do not update automatically when source files are edited. The services run while this Mac is awake and the user is logged in; they do not prevent sleep. This is local hosting only, with no main merge or external deployment.

Local-service verification: both sites returned HTTP 200 through localhost, IPv4 and IPv6; both processes automatically recovered after a controlled SIGTERM; browser checks loaded the component library and entered Lesson 1 with no page errors or broken images. Script syntax, documentation checks and whitespace checks passed. Existing curriculum/type/build suites were not repeated for this local-serving-only change; the previously verified build artifacts are served unchanged.


## LessonTopBar R2 Design Review 01 follow-up · 2026-10-26

PR #52 now includes targeted work on `BA-WR-001` and shared `BA-UI-006`. The Back remains an icon-only 50×50 button; the left identity flexes into the available safe width with a two-line title clamp. The progress rail stays centered against the entire header, or a separate centered row when the **component container** is narrow, including designer-library previews.

Progress status and active selection remain separate: dark fill/white number for Done; dark fill/white number **plus outer ring** for Done+Selected; disabled colors without icon for Locked; dashed inner outline for Skipped, plus outer ring for Skipped+Selected. All markers are numeric-only. Source course state, `canOpen`, attempts, mastery and saved progress are unchanged. Targeted unit tests and preview stories were added. The approved direction was synced to root `DESIGN.md`, Writing `PRODUCT.md` (§§13–15), and `apps/writing/contracts/components.json`; no other product/content/scoring rules were reauthored.

**Verification:** code and doc consistency checked against remote blobs. No current-chat local Node/Vitest/Playwright/browser execution has been performed for these commits. Re-run `npm run check:docs`, `npm run typecheck`, `npm test`, `npm run build` and `npm run test:integration` before designer acceptance. Previously reported passing test counts were for the earlier PR head. Draft status and no-main-merge remain unchanged. **Local LaunchAgent review URLs serve built snapshots**, so a Git pull alone does not refresh http://localhost:5174/ or :6007/; rebuild and use `npm run local-sites:install` or use the development-server launcher for the updated source.


## R2 Design Review 02 · implementation submitted for review (2026-10-26)

**Target:** draft PR #52, `feat/writing-hifi-integration-v1`. Nine requests DR02-01–DR02-09, code and docs updated on that branch only; no changes to main or Vercel.

- **DR02-01/02 – StairLessonCard:** the designer library surfaces only Enterable, Completed, Locked; saved start/continue still map to Enter with the **same Writing brown outline**, and Completed retains its green-white seal. Scene-specific card geometry, border, current override and number alignment styles were removed, so the library component is authoritative in the staircase.
- **DR02-03/04/05 – Staircase Unit:** removed visible Writing path kicker; Unit heading shares the Lesson heading design tokens; top-right Unit paper-fold triangle and shadow were reworked to join the main sheet without floating-square treatment. R2.12 scenery, camera, clouds and Level navigation remain as found.
- **DR02-07 – BA-UI-006 LessonTopBar:** one row max 9 slots, including overflow; measured 44px targets and 36px shared numeric/ellipsis circles, current-first contiguous visible window. The same Indicator renders in rail and portal popover. Anchored popover has 424px max width, 40px radius/inset, six fixed left-aligned columns, internal scroll and Escape/outside/Close/focus semantics. The 50px Back and two-line title constraints remain. 320px Mobile custom layout deferred.
- **DR02-08 – Apply editor:** textarea is not user-resizable, occupies remaining writing-paper height with internal scroll; same WordGrid docks under the tip at the bottom while preserving stored caret/insertion.
- **DR02-09 – Footer:** contextual primary truly receives Disabled from original task progress/answer data. Single selection needs one, multi needs exactly authored three, tapword needs a selected token, FrameFill all blanks, Apply at least three words. P2 Learn remains actionable; Build auto-grading remains unchanged. **P7 blank internal questions and one-time Hand in warning / Hand in anyway are explicitly preserved**, as required by the original product; enabling a CTA never implies correctness or mastery.

Updated `DESIGN.md`, `apps/writing/PRODUCT.md`, `apps/writing/contracts/components.json`, designer-library catalog/controls/preview, Storybook stories, Vitest tests, and the Writing Playwright integration specification. After review of CSS specificity, all Staircase overrides of the inner StairLessonCard styles were removed.

**Verification is pending**: Files were updated and re-read via authenticated GitHub contents API, and the contract is valid JSON; **no post-change TypeScript/build/Vitest/Playwright/a11y tests or screenshot comparison has been executed** in this chat environment. Former PR test counts belong to an earlier branch head and must not be used as evidence for Review 02. Use `npm run check:docs`, `npm run typecheck`, `npm test`, `npm run build`, `npm run test:integration` on the updated local branch. Inspect keyboard/popover placement at 1440/1024/834 and the original fold and numeric positioning reference; the designer has final visual approval.

**Local snapshot caveat:** fixed `http://localhost:5174/` and `http://localhost:6007/` services serve published built copies. Merely pulling this GitHub branch does **not** update the sites. Rebuild and run `npm run local-sites:install` to refresh them, or run the local dev server / launcher. Do not merge or announce release solely on a GitHub commit.


## R2 Design Review 03 · 14 changes implemented for design/runtime review (2026-10-26)

**Repository/branch:** `Yuzhwe/big-academy`, `feat/writing-hifi-integration-v1`, Draft PR #52. No main merge or Vercel deployment. R03 adds nine Activity changes + five Staircase changes to the existing R02 integration.

### Activity changes / shared components

1. `BA-UI-006 / BATaskProgress`: done number fill is Writing-brown (action semantic token / #B25415), white Dosis numeral. Existing done+selected outer ring, skipped, locked and 36px / popover rules stay intact.
2. `BA-WR-002 / CoachMessage`: shared internal Coach card for **every** arrived, expanded, hinted or submitted message. Correct: Success 1/4/9 surface/stroke/ink; wrong: Neutral 2/4/8; ordinary/Hint: Neutral 1/3/9. Every utterance has its own rounded border and background, while Coach scroll stays independent.
3. Activity title owns a two-column layout with the real 50×50 Speaker BAIcon+BAButton at upper right. Long titles wrap without overlapping; original speech synthesis, stop, cleanup and accessible naming are preserved.
4. P2 `Better` / `Not yet` example labels share Dosis ExtraBold, with the redundant Better check icon removed.
5. P3 Tapword correctly selected word has solid Success-6 #14AE5C, white text and **no attached check or visible border**, while `shown` (unearned reveal) stays visually distinct.
6. P3 multiple select Check is enabled with **one or more** choices, disabled at zero. Grading still requires the original three true answers and incorrect tries/shown rules still apply. This explicitly supersedes R02's erroneous exactly-three *button enabling* rule.
7. P5 writing canvas hides the redundant `Write each sentence on a new line.` line. Only P5 (not P7) has subtle #EAEDEB paper lines at ~36px pitch; the long editor still fills spare height, scrolls internally and keeps WordGrid docked.
8. `CourseSession.openHint` and `hintAction`: user-invoked Need a hint/Another hint **only display authored hints**, no auto-answer, no try, no state `shown`, no credit. After all hints, the control disappears. P4 wrong-tile local hints and formal Check failures remain separate; P7 retains the no-hint assessment.
9. Correct/incorrect Coach status and tones remain testable without changing the underlying answers/grades. Existing `data-testid=feedback` and `data-outcome` are retained for browser tests.

### Staircase changes / canonical Unit Card

10. L0 and L1 always render every Lesson as Completed / Review by default. The existing `preview-seed` flag is optional compatibility only. This is a display fixture in `pathNodes`; learner saved `done`, `tasks`, `skills`, L2 unlocks and Mastery remain untouched.
11. Every completed Unit Milestone can replay the **existing one-shot tsParticles Confetti from its badge center** (50 start, no emission rate, one lifetime); reduced motion suppresses animation. No duplicate celebration library was introduced.
12. The Unit top caption displays only `UNIT N` / `第 N 单元`, no `Writing Unit` type suffix.
13. Unit metadata contains only the real per-Unit lesson count and optional exact duration, e.g. `9 lessons · 170 mins` / `9 课 · 170 分钟`; no `0 of`, `about`, `约` or hardcoded shared data values.
14. Metadata has one thin warm-border full-rounded pill using existing paper tokens.

`BA-WR-007 StairUnitCard` was extracted with no redesign from CourseApp into a single code component reused by **Staircase, designer-library preview and Storybook**. The existing folded-paper SVG, typography, goals and cloud platform are retained.

### Files and verification

Changed runtime: CourseApp, course styles, CourseSession, LessonWorkspace/CoachMessage, BATaskProgress CSS, BAIcon, Tokens. Added StairUnitCard + Storybook fixtures, designer library catalogue/preview, regression cases for Unit Card/Coach/Hint/multi Check/L0-L1 fixture and Playwright exercises. Updated `DESIGN.md`, `apps/writing/PRODUCT.md`, component contracts, this handoff and the PR body.

**Static evidence only:** GitHub commits have been read back, the contract was parsed as JSON, and targeted source/invariant checks were performed. **No post-R03 npm TypeScript/build, Vitest, Playwright, accessibility or real browser visual run has completed in this environment.** Do not promote any prior PR test totals as R03 validation. Tests and design approval remain pending.

**Next verification on the updated local branch:**
`npm run check:docs`, `npm run typecheck`, `npm test`, `npm run build`, `npm run test:integration`.
Compare rendered components and actual pages at 1440/1024/834 widths, long EN/ZH titles, Coach/Hint/graded states, P5 editor scrolling/WordGrid, L0/L1 fixture, Confetti replay and true L2 progression. In particular check new StairUnitCard's paper-fold alignment against the user screenshot; P5 ruled lines under scrolling; popup complete number color; 50px speaker right alignment and focus.

**Local built site caveat:** pulling this branch doesn't update the previous static `localhost:5174` or `:6007` copies until rebuilt and published with `npm run local-sites:install`, or run local development sites. Do not merge main/deploy Vercel. Designer final visual acceptance is still required.


## Review 04 · Stage 1 · library-only implementation (2026-10-26)

**Scope is strictly limited to designer-library trials.** This follows the user's explicit order: Solar/current Lesson and CTA 7-second sweep must receive visual approval **before** integration in the Writing Staircase. The previously approved product screens, StairLessonCard runtime source and R03 learning logic have not been modified in Stage 1.

- Existing `StairLessonCard` is rendered inside a new **preview-only** `apps/library/src/SolarLessonPreview.tsx` wrapper when the designer chooses `Current`. It is a visual emphasis of Enterable, not a new business state; ordinary Enterable, Completed and Locked remain intact. The source's 64-ray gold Solar GLSL aura has been adapted to an exterior-only 55px-radius mask, with small per-card transparent WebGL canvas (30 fps cap; 1x resolution; offscreen draw pause); 3px dark-brown fallback if motion is reduced, WebGL fails, or sustained slow frames occur. The CTA uses a clipped 7s repeating shine *only in the wrapper*; the original BAButton and card content/size remain unchanged.
- `apps/library/src/catalog.ts`, `Preview.tsx`, `R2Controls.tsx`, `Code.tsx`, `Showcase.tsx` and library CSS now expose a Current variant and adjustable Ray Intensity, Ray Length, Ray Count, Bokeh, Rim Boost, Glow Spread and Brightness. Uploaded Solar defaults 0.6/0.45/64/0.16/1.66 are retained, and the query-string scene serializes values.
- `BA-WR-004` uses a new non-page `HamburgerComposition` preview and Storybook fixture; three existing HamburgerLayer instances, narrower top/bottom buns, vertical title and example centering. No Activity 1 page change.
- `BA-WR-011` registers the **existing** R2.12 `LevelRewardFlag` as a designer-library and Storybook component, with adjustable 4% default wind. No flag implementation or Staircase page change.
- Stage-1 source license caveat: the user-supplied Solar ZIP did **not** contain a clear license. The adapted shader is **prototype/review-only** until origin/right-to-use are cleared. It introduces no `three` or other runtime dependency.
- More detail and preview links: `docs/REVIEW_04_STAGE1.md`.

**Evidence pending:** post-Stage-1 TypeScript, build, browser screenshots, WebGL/reduced-motion performance, keyboard, cloud stacking and visual acceptance have not been executed in this conversation environment. The local historical port :6007 is a built snapshot; refresh from the latest PR branch and rebuild/run `npm run dev:library` (or rebuild/reinstall local sites) before reviewing. No main merge or Vercel deployment.


## R2 Design Review 04 · Stage A completed code submission, pending runtime/visual QA (2026-10-26)

**PR #52 independent branch:** `feat/writing-hifi-integration-v1`. Scope strictly Stage A designer-library/Storybook **plus** approved LessonTopBar completed-digit color fix. No main merge, Vercel deployment or page-level Solar/Cross Blur integration.

- WordGrid gained opt-in `tabAppearance='slanted'` with 27px right-leaning shoulder, selected z-index/lift and subtle panel fade. The old `connected` layout remains the runtime default and the Activity 7 page uses it until designer signoff.
- HamburgerComposition now applies the exact approved **green** #E7F6DF top, #F3EFE4 reason, #E7C48A bottom with 88/100/88 widths and asymmetric layer radii, using the existing reusable HamburgerLayer children.
- StairUnitCard gained opt-in `corner='cutout'`, real transparent corner clipping with diagonal stroke; production defaults `folded`. Unit card source still shared between library and Staircase.
- UnitMilestone gained opt-in `previewAppearance='gold-shine'`: gold/gray two-layer states with 7s sheen on gold only. Production defaults `existing` and missing gold in the actual high-fidelity Staircase remains an explicit Stage B defect.
- Solar palette A/B/C and custom color inputs are exposed in the designer controls and drive the actual shader uniforms plus border color; original numeric controls, 7s CTA sweep and deep brown static fallback retained. Shader source license/provenance still pending clearance.
- `BA-WR-012` standalone Cross Blur transition (no new router or Motion dependency) added to library and Storybook with editable duration/blur and Reduced Motion. It does not own learning state or change the actual Writing routes.
- Existing BA-WR-011 LevelRewardFlag standalone SVG/wind preview remains intact.
- **Real LessonTopBar fix:** Completed numerals inside BOTH rail and portaled popup now directly use global Writing primitive `--ba-color-writing-7` (#B25415), no leakage from generic action-primary blue-green.
- Storybook candidate stories, component contracts, unit regression tests, and a targeted Playwright real-page completed-color assertion have been added.
- Exact review routes/approval/QA checklist: `docs/REVIEW_04_STAGEA.md`.

**QA truth:** Files committed to the Draft PR; connector read-backs can verify source and contract JSON. No current-turn local Node/TypeScript/Vitest/Playwright execution, browser WebGL/GPU check, screenshots or design signoff has been performed. This is code-complete-for-review, NOT a tested or approved release. Local :5174/:6007 may serve old published built copies; pull PR head and rebuild/run current dev servers for inspection.
