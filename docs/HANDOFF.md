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
