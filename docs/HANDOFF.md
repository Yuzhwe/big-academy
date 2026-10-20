# Big Academy — Current Handoff

**Status:** SPEC CONSOLIDATION IN REVIEW · 2026-10-20. This document records current integration state; it does not override the two primary specifications.

## Current authority and integration

1. **Product behavior:** `apps/writing/PRODUCT.md`. Exact lesson content, scoring, attempts, shown, gates, navigation, reentry and acceptance live here. Scope is eight screens of L2/G2-O Lesson 1; other course inventory is reference.
2. **Visual system and UX design guidance:** root `DESIGN.md`. Complete Spacing/Gap and Shape/Radius rules are embedded within this one authority; old focused design proposals are reference material only.
3. **Executable tokens:** `packages/design-system/src/tokens.css`; CSS custom properties are the numeric source of truth. Indicator/Popover semantic aliases are candidate [E], pending live visual review.
4. **Component interfaces:** `apps/writing/contracts/components.json`. BA-UI-006/BATaskProgress composes one shared ActivityScreenIndicator for TopBar and all-screen popover; BA-WR-001/LessonTopBar consumes it. The updated contract is not evidence that old component code was updated.

## Current branch and PR

- Integration branch: `spec/writing-product-consolidation-20261020`.
- Review PR #26 targets `docs/writing-r6-spec-sync-20261020`, not `main`, because upstream integration commits are not on main.
- Open PR #25 separately proposes a PRODUCT rewrite and overlaps PR #26; reconcile, then close the obsolete proposal only after checking no unique valid behavior was lost.
- The repository has a long chain of unmerged PRs. Merge/rebase in dependency order before calling `main` authoritative or clean. Do not close active implementation PRs to make the list look short.

## Remaining validation and cleanup

- Compare latest product specifications and source content against real L2 Lesson 1 runtime, including P4/P5/P7; validate initial first-only unlocking, Back/resume, `shown`, and P7 second-round failure.
- Implement shared round ActivityScreenIndicator and nonmodal anchored All activity screens popover; current code/stories still require synchronization with amended contract and tokens.
- Validate EN/ZH layout, keyboard focus, 1440/1024/834/390 and 200% zoom, and designer screenshot signoff.
- Identify historical documents only after searching actual repository references and open PRs; delete genuinely redundant ones through a separate reviewed cleanup. Keep source HTML, tests, screenshots, copyright notices and significant decision history where still needed.
- `main` is not yet the integrated product and design baseline; do not advertise that it contains PR #26 changes.

---
## Historical handoff log (reference only)

**Date:** 2026-10-19  
**Status:** **P1-A IN PROGRESS** — integration candidate, **not merged to `main`** and no automatic sign-off.

## R6 scope correction — single Lesson demo

Current Grokbot implementation target is **only original L2/G2-O Lesson 1 (Topic sentences), 8 ordered Activity Screens**. Refer to `apps/writing/docs/L2_LESSON1_DEMO_CONTRACT_R6.md`; retain 52-Screen inventory as reference, **not** an implementation checklist. Acceptance requires first-screen-to-last-screen navigation, original choices, right/wrong/retry/shown and P7 assessment flow, real progress/return, responsive accessible hi-fi with designer review. Do not assign remaining 44 Screens or Lessons 2–9 to Grokbot in this round.

## R6 approved decisions and handoff overlay — 2026-10-20

**Documentation branch:** `docs/writing-r6-spec-sync-20261020`, based on unmerged Celebration Effects PR #22 branch, **not main**. Older sections below describe their original checkpoint and may be stale; this overlay is the current R6 decision register.

- Source-extracted 52 G2-O Activity Screens (nine lessons; P1=2/P2=5/P3=15/P4=12/P5=8/P6=6/P7=4): `apps/writing/docs/ACTIVITY_MATRIX_G2O_v0.1.json`. Identifiers and templates extracted; per-screen runtime action gate QA still pending.
- Designer/product decisions: keep Alex `shown`/two-try-and-exceptions; remove P1 Save/Print UI; do not revive old Index/Analytics menu features; preserve underlying data; Unit remains a Stub; E-01 A independent platforms only, viewport adaptive diagonal navigation; use temporary accepted Typography v0.1 from root DESIGN; Writing options minimum 50px.
- Celebration: source is Draft PR #22, ten effects implemented as review Demo, not merged to main or wired into milestones; use Ribbons **30**, lesson Explosions ×3 where approved, separate Milestone Confetti. First eligible E-01 return may auto-locate/celebrate highest-progress newly eligible Mile, and **other newly eligible Mile auto-celebration receipts are handled** (not course completion). Completed flags can always manually replay. Level Goal retains existing logic; skip revocation is out of scope.
- Existing docs' older cross-Level, A/B path, Save/Print, Unit-click and two-retry/open-question treatments must be interpreted using the R6 overlays in PRODUCT and DESIGN. Do not silently modify Alex's original grading, skip or CourseSession logic.
- **Still open for engineering verification:** per-Screen action matrix QA against original runtime, any complete page integration, shared celebration extraction/integration, component stories and browser evidence, responsive screen height geometry, Safari/touch behavior, fonts/licensing and designer visual acceptance.
- **Workflow:** Grokbot uses an independent feature branch from an explicitly agreed integrated baseline; submit PR and tests, do not merge automatically. Alex still owns any true change to original scoring and unlocking, UI/UX designer owns visual signoff.


## Canonical roles and sources
- **Repository:** `Yuzhwe/big-academy` (never `RaoJing414`).
- **UI/UX Designer:** final visual and major interaction approval.
- **Alex:** original Writing learning/scoring/skip/progress/eligibility rules.
- **Agent A:** shared design system, tokens, component conventions, documentation authority, tooling and cross-agent integration.
- **Grokbot/other product agents:** Writing application on separate branches.
- **One global `/DESIGN.md`** governs shared design foundations; **`apps/writing/PRODUCT.md` combines Writing shared business rules and feature-specific page requirements/specifications**. There is no `apps/writing/DESIGN.md` and no duplicate standalone E-01 specification.
- **Other shared engineering artifacts:** executable CSS tokens, React Aria-based BA Components, component registry/contracts, Storybook, browser QA.

## Approved architecture (P0)
1. Product accent + subtle tint themes; Writing overarching **A Warm Frame + White Canvas**, page-specific variants require designer review.
2. Tokens **Primitive → Semantic → optional Component**, CSS Variables current executable source; product app selects semantic theme.
3. Heading EN **Dosis ExtraBold 800**; EN long text **Jost**; ZH heading **Douyin**; ZH long text **Noto Sans SC**; all UI digits Dosis ExtraBold 800. Sizes/license/assets/fallback verification still pending.
4. Progressive Big Academy component architecture on React Aria behavior foundation, shared primitives first, product-specific composites locally.
5. Lightweight governance: distinct engineering verified vs designer visual approved.
- **Icon standard:** Iconoir (MIT), general-purpose UI icon family; exact BAIcon mappings are P1 follow-up.

## GitHub source branches and PR ancestry

| PR | Source | Role | Current integration treatment |
| --- | --- | --- | --- |
| #1 | `feat/writing-lesson-topbar` base | first Topbar/system pilot | inherited |
| #2 | `docs/unified-design-and-token-audit` | root DESIGN, P0 and P1 docs | root DESIGN and two audit/planning docs imported/reconciled here |
| #4 | `cursor/writing-e01-lesson-slice-7d6c` | Alex-backed partial E-01 → Lesson 1 | inherited with product logic unchanged |
| #6 | `feat/agent-a-e01-staircase-ab` | diagonal interactive E-01 A/B proof | direct parent; exploratory/unverified |
| #5 | `feat/delivery-hub` | independent delivery portal/site | **not imported into baseline yet**; pinned Writing snapshot is from earlier #4 code |
| #7 | `cursor/writing-hifi-from-agent-a-e01-8539` | new WordGrid/HamburgerLayer P6/partial hi-fi with reported passing tests | **new upstream product candidate; not automatically included**; review runtime changes and registry before integration |

`integration/p1-a-unified-baseline` was branched from #6. Agent A must not modify the original PR branches or touch `main` without reviewed approval. Delivery Hub may be integrated later as an isolated app once its snapshot importer and browser display are checked; site publication does not automatically follow GitHub merges.

## Writing pilot — what works and what is still open
- PR #4 supports a **partial** E-01 → Lesson 1 learn/check → return Continue path, with a real Alex `CourseSession`. Locked lesson access remains guarded, milestone UI receipt separate from progression.
- PR #6 adds review-only **A dimensional cream/card/platform/weak beam** and **B Warm Frame/white-card** visual switch; both target the **diagonal lower-left → upper-right path** with responsive rise and drag/wheel/keyboard navigation. Neither variant is visually approved.
- Source count is nine lessons and 52 activity screens; **the 52 screens are not all built or accepted**. P4–P7 currently include unimplemented templates.
- Alex pending: Level Goal criterion, simultaneous milestones, skip-revocation celebration, P1 Save/Print, Unit clicks, old menu/Index/Analytics location, Task vs Page.
- Designer pending: both E-01 visual treatments, candidate warm surface `#FEF9EF`, radii, milestone artwork, real Chinese font distribution, Topbar sizing/visual, remainder Word Grid/Hamburger/Coach.
- Canonical Skill v0.2 is not yet imported.

## P1-A work status and gates
- **Completed:** repository branches/trees audited, integration branch created; root design specification and P0 documentation reconciled with Writing PRODUCT E-01 compact model; old app-level DESIGN removed; source pointers and cross-agent rules refreshed.
- **Not yet verified:** clean npm install/build, typecheck, Vitest, browser Playwright tests, touch/scroll camera verification, screenshot comparisons and reviewer approval. Do not infer test passage from authored tests.
- **Next:** verify `npm run check:docs`, `npm run typecheck`, `npm test`, `npm run test:layout`; inspect browser A/B at 1440/1024/834/390 and both locales, fix failures. Then review the resulting integration Draft PR and plan a controlled base merge to main.
- **P1-A additional incoming branch:** Draft [PR #7](https://github.com/Yuzhwe/big-academy/pull/7), based on #6, was found during integration. Its author reports passing unit/browser checks and adds WordGrid/HamburgerLayer; these tests were not independently run on **this** integration branch. Review the feature code and registry conflict before merging to the unified baseline. Do not overwrite the product agent's branch.
- **P1-B / P1-C:** semantic Token migration/BAIcon/font follow-up; Delivery Hub latest-source compatibility and safe preview update, separate from P1-A product behavior.
- **Before main:** source-path uniqueness; actual test evidence; no course logic regression; Visual status remains candidate; explicit owner approval for substantive visual/product changes; hub deployment separately verified.

See [P1-A integration readiness](docs/integration/P1-A_READINESS.md) and [P1 implementation plan](docs/design-system/P1_IMPLEMENTATION_PLAN_v0.1.md).

## P1-B system-first vertical slice (2026-10-19)

The UI/UX Designer reprioritized work toward **design-system completeness, accessible React Aria component foundations, semantic CSS token mapping, and high-fidelity pages rendered from PRODUCT.md + DESIGN.md**. GitHub logistics, Delivery Hub synchronization and broad documentation work are secondary.

On Agent A's isolated branch `feat/agent-a-semantic-tokens-component-preview`:
- Semantic CSS aliases now separate global primitive values and Writing's approved accent mapping. The Writing shell selects `data-ba-product="writing"`; shared BAButton and BATaskProgress consume semantic color roles, **not Writing-only primitives**.
- A new real React `/?system` experience demonstrates theme change (Writing / neutral foundation), typography roles, tokens, keyboard-accessible BAButton states, BATaskProgress statuses, and a link into the actual Writing E-01 prototype. This is not a new product page or replacement for Storybook.
- Existing BAButton Storybook gets two-theme side-by-side visual verification. Playwright coverage demonstrates the same React Aria button changes CSS colors with a semantic theme switch.
- No Reading theme has been invented, and no unapproved visual styles have been presented as final. Iconoir is the approved source; full BAIcon integration, missing reusable components and approved font asset loading remain follow-up work.
- Validate with `npm run typecheck`, `npm test`, `npm run test:layout`; latest implementation is independent from Grokbot and PR #7.

## Approved Color System v0.2 integrated in Agent A P1-B (2026-10-19)

Design approval source: [PR #10](https://github.com/Yuzhwe/big-academy/pull/10), branch `design/approved-color-scales-v0.2-20261019`. Eight ten-step families (80 CSS primitives) and their semantic roles are now copied unchanged into **the only executable color source**, `packages/design-system/src/tokens.css`. Its detailed specification `docs/design-system/COLOR_SYSTEM_v0.2.md` accompanies the stylesheet; the global `DESIGN.md` Color section was reconciled without discarding E-01 specifications in Writing PRODUCT.md. Existing Writing action and shell mappings use the approved names; BAButton/BATaskProgress consume v0.2 semantic names without importing the Writing primitive. The 80-color grid is browsable in the real `/?system` preview.

**Designer approval is for the color system; component appearance and typography metrics are not yet approved.** PR #10 color-design tests were deliberately waived at the user's request. Subsequent integration checks on PR #9 are engineering smoke checks, not a new design approval round. Reading theme remains TBD.

## Spatial, Grid & Layout System v0.2 integration (2026-10-19)
- Approved designer principles and original authoring source: Draft PR #12, `design/spatial-grid-layout-v0.2-20261019`; 4px base/8px primary rhythm, Element First/Content First, contextual grids and responsive/adaptive/strict composition.
- Agent A separate integration branch `feat/agent-a-spatial-v02-components` incorporates the full approved specification without replacing newer E-01 PRODUCT and layout rules.
- Primitive spacing scale **values and semantic aliases remain candidate [E]**, not approved by the 4px/8px principle. Existing BAButton's 8px gap and 16px inline padding, and BATaskProgress's 4px item gap, are refactored to semantic references **without changing computed pixel values**. Other application geometry intentionally untouched.
- Design System Preview `/?system` now exposes the 9 spacing candidates plus 80 Color System v0.2 primitives, with a browser test for actual semantic role mapping.
- CI/visual approval/merge status must be checked per PR; never infer final component approval from design principle approval.


## Radius & Motion v0.1 system integration
- Source: Draft PR #14, approved method for role/size/elevation radius, numeric candidates [E], temporary six spring presets [A/T]. Two detailed source specs imported unchanged.
- Agent A branch `feat/agent-a-radius-motion-v01-preview` imports exact CSS tokens without overwriting Color v0.2, Spatial v0.2, latest Writing PRODUCT or Alex logic. Existing component radii and CSS motion unchanged.
- Radius candidates are shown at `/?system`; Motion spring groups are listed as tokens only, not as actual animated interactions. Inline masses remain unspecified.
- Engineering CI and visual signoff remain separate.

## Typography + Iconoir live component pilot · 2026-10-20

- `feat/agent-a-typography-baicon` adds semantic type role CSS and reusable `BAText`/`BANumber` (approved fonts, candidate sizes/metrics). Dosis used only ExtraBold 800 for headings and task numerals. The app already requests Dosis, Jost and Noto Sans SC from Google Fonts; exact Douyin file/license is **not verified** and no font file is distributed.
- `BAIcon` is an accessible eight-glyph **official Iconoir regular SVG** pilot (MIT license notice in package), not a claim that every Iconoir icon is imported or an alternative icon standard. Expand systematically or move to iconoir-react after package dependency/lock verification.
- The existing Writing `LessonTopBar` Back action and `BATaskProgress` Done/Locked markers consume BAIcon; BAButton typography uses shared role aliases. Underlying React Aria behavior and Alex course permissions unchanged.
- `/?system` and Storybook expose role/locale specimens and Iconoir gallery with accessible/decorative semantics; component source, icons and numeric geometry remain designer-review candidates.
- CI unit, TypeScript, build and Playwright results need checking on PR. No browser font-asset certification or final visual approval is claimed.


## Figma Button V2 + Segmented Control V1 component implementation (2026-10-20)
- Direct Figma design references: `30:2` (Button) and `806:3` (Segmented Control). Existing `BAButton` upgraded, not duplicated; new `BASegmentedControl` built on React Aria RadioGroup/Radio, **not** Tabs.
- Button: size 36/50/70/90, Primary/Secondary/Tertiary, Full/Standard, state, destructive intent, icon content, busy, fixed outer hit with scaled visible assembly, 3px Figma lower stroke; no claim this is a universal drop-shadow system.
- Segmented: one local selection 2-4 choices, Strong/Subtle, Full/Standard, Equal/Hug, icon+label/icon only, product-mapped Strong fill, 200ms moving selected surface, reduced-motion guard. Outer / selected heights differ by 4px.
- Interactive `/?system` Figma matrix + Storybook and Playwright checks. Figma pixel-level visual approval and separate Tabs/Shadow design nodes **remain pending** (no invented Final values).
- Work isolated in `feat/agent-a-figma-button-segmented-v1`; original PR #16 and `main` unchanged.


## Figma Elevation and BATabs (2026-10-20)
- Figma source node `15:5` / docs `25:2`: Elevation/100/200/300/400 exact shadows (RGB 7,46,81 at 5/10/15%); backdrop blur Figma radius 20 maps to exported CSS blur(10px). Effect tokens are in `packages/design-system/src/tokens.css`; see root `DESIGN.md` for full source references. The button 3px lower stroke is separate.
- Designer instructs: **BATabs visual style exactly matches BASegmentedControl**. BATabs uses React Aria Tabs/TabList/Tab/TabPanel, and shared CSS `ba-segmented__*` shapes/states with a CSS ::before selected surface. Product selection stays under Alex business logic; Level Tab never opens Lesson.
- Actual Writing Level header now uses BATabs and retains the existing 1fr/max-content/1fr geometry and 834px constraint. Storybook, browser and designer screenshot signoff pending.
- Branch `feat/agent-a-elevation-batabs-figma` based on PR #17 head. No main merge or final visual approval.

## Writing Celebration Effects Demo closeout (2026-10-20)

- Isolated branch `feat/writing-celebration-effects-demo`, based on `feat/agent-a-elevation-batabs-figma` at `d63a2deafc7195cceffaff8b4c43f0b60dbfd6c9`, migrates all ten Project 2 particle-presets effects to `/?demo=celebration-effects&locale=zh`. No progress, unlock or celebration eligibility rules changed. Provenance and the surface contract are in [the migration record](../apps/writing/docs/CELEBRATION_DEMO_MIGRATION.md); root DESIGN remains the inherited authority.
- Engineering passed: `npm run check:docs`, `npm run typecheck`, `npm test` (39 tests in 11 files), full `npm run build` (design system, Writing, Storybook), `npm run test:layout` (18 passed in official Playwright headless Chromium), and `git diff --check`. Browser coverage confirms all ten effects paint pixels, Cannon drag, Firefly pointer trail, unchanged local/session storage, Stop, Escape, rapid switching, navigation and live reduced-motion cleanup. Initial runtime import/registration issues were fixed before this final pass; Ribbons registers before the first engine load and runtime loading starts only on manual action.
- Six PNGs in `apps/writing/docs/evidence/celebration/` cover desktop Ready/Ribbons/Fireworks (1440 × 1000), Chinese mobile (390px), tablet (834px) and narrow (500px) views. The finish reviewer inspected all six and source without rerunning tests: **ship — ready for designer review as an isolated Demo**, with no material findings or required fixes. Engineering verification and this review disposition do not constitute designer visual approval.
- No new shipping raster or font assets. All twelve direct tsParticles packages are pinned to 4.4.0; their matching MIT license was copied verbatim to `public/licenses/tsparticles-MIT.txt`. The source detector returned no findings.
- Remaining: designer visual review and a separate production Milestone integration task. The 15-second limit is a presentation policy only. Physical touch, Safari and Firefox are untested; existing Google Fonts/Douyin limitations and large app/Storybook chunks remain. No merge or PR status is claimed by this closeout.
