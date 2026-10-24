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

- Storybook: \`npm run storybook\`, then \`http://127.0.0.1:6006/\`. Workbench Stories: \`Workbench/01 Level Tabs (BA-UI-002)\`, \`Workbench/02 Lesson Card (BA-WR-005)\`, \`Workbench/03 Choice (BA-UI-003)\`. Base token overview remains \`http://127.0.0.1:5173/?system\` when \`npm run dev\` is running. Desktop 1440x900, tablet 834x1112, mobile 390x844 are review targets.
- BA-UI-002: React Aria Tabs with controlled selection, keyboard, disabled L3, EN/ZH and size variants. Writing session still owns the level navigation logic.
- BA-WR-005: real shared BAButton size 70, two reserved title lines, numeric minutes supplied by product, number seal/attached state symbol, five states, long text, EN/ZH. Locked CTA disabled; product still owns unlock. Implementation \`apps/writing/src/components/writing/StairLessonCard.tsx\`.
- BA-WR-010: \`LandscapeTerrace.css\` shares the existing interim CSS platform geometry with the real scene. \`LandscapeTerrace.tsx\` is an optional decoration only for isolated compositions; not a duplicate business component. The scene CSS imports this source. Candidate art is not designer-approved.
- BA-UI-003: React Aria single/multiple and graded states; Storybook includes controlled Check/Reset demo (not real pedagogy). Text now inherits EN/ZH language. Grading, retries, Coach and unlock remain in product.
- Contract authority remains \`apps/writing/contracts/components.json\`; no new registry platform. These are presentation candidates. Run typecheck, tests, build and browser QA locally; no build, screenshot or accessibility pass is asserted until actually run. GitHub-only editing cannot open the user's Mac localhost or produce authentic Mac screenshots.
- Future HTML Generation Agent must look up IDs in the existing registry, import the real implementation and supply props; never restyle or reimplement states in a generated lesson. Only the designer can mark Approved.



## Local QA · 2026-10-24

- Environment: macOS arm64; official Node.js LTS v22.23.4 installed locally under .local/node-v22; npm 10.9.9; dependencies installed with npm ci.
- Storybook: npm run storybook is running at http://127.0.0.1:6006/; Workbench / 02 · Lesson Card (BA-WR-005) · Full Composition is open for visual review.
- Passing: npm run typecheck, npm test (13 files / 52 tests), npm run build, npm run build-storybook, npm run check:docs.
- Browser QA: 13/16 Playwright tests pass after installing Chromium. Three existing E-01 issues remain: two 60s timeouts around the celebration overlay path and one legacy terrace height expectation conflicts with the current fixed two-line Lesson Card contract. No visual approval is claimed.
- Screenshots: apps/writing/docs/evidence/staircase-ab/ and apps/writing/docs/evidence/slice/ include desktop 1440x900 and tablet 834x1112 evidence; mobile 390x844 evidence remains in apps/writing/docs/evidence/celebration/mobile-zh.png.
