# Writing PRODUCT.md — v0.1 DRAFT

**Authority:** Alex original HTML (`source/alex-original.html`) and recorded designer approvals in `PHASE1_ALIGNMENT_REPORT_v0.3.md`. This file is a portable working condensation, **not yet Product v1.0**.

## Scope
- One E-01 staircase, 9 Lessons / 52 Activity Screens across seven P1–P7 templates for G2-O; source controls all product semantics, state gating and scoring.
- On E-01, Lesson cards show stable lesson number in upper left plus Start / Continue / Review / Locked. Legitimate Skill Skip follows original Pages/Home/Skip semantics. No demo unlock.
- Each Unit's Lesson cards are followed by one Milestone meaning Unit completed. After the last Unit, retain both Unit Milestone and Level Goal as different achievements.
- Milestone's completed state is computed from Alex course progress and recognized skips; it must not grant permissions. When newly completed, confetti AUTO plays only on first return to E-01. Subsequent returns never auto-repeat; clicking a completed Mile manually replays. A separate presentation-only receipt may be saved, but never changes lesson progression.
- Unresolved: Level Goal exact completion rule; simultaneous new milestones; re-qualification after skip revocation.

## BA-WR-001 LessonTopBar — approved behavior
- No hamburger/collapsible menu. Back returns to E-01 through existing source navigation.
- Left: Back icon button, Lesson name, necessary lesson metadata. Center: dynamically sized activity progress & completion state, centered **relative to entire Top Bar**; right has no user-visible action.
- Progress derives actual task list from current Lesson; do not hardcode activity count. `Pages.canOpen(index)` (or the canonical state adapter) determines whether a task may open.
- Distinguish `done`, `current`, `available`, `locked`, `skipped`. Display skipped distinctly; use meaningful screen reader labels and do not convey state by color alone.
- Changing progress appearance or clicking a task must not mutate learning state by itself.
- Side menu features from original must be inventoried; removal of menu does NOT mean automatic deletion of feature behavior.

## Acceptance journey (TopBar pilot)
1. Lesson title and task data injected as props without hard-coding.
2. Center component measured at center of viewport for 1440px, 1024px, 834px.
3. Long names in EN and ZH do not push progress off center.
4. Locked task never invokes navigate; done/current/open tasks invoke navigate only when canonical `canOpen(index)` allows.
5. Skipped state visible, localized, announced.
6. Back invokes `onBack` and doesn't reset saved answers.
7. Integrate with Alex actual data as a separate QA step; the local mock never claims to be that integration.
## E-01 · Staircase — Combined Requirement & Page Specification (2026-10-19)

**Document strategy:** The product's approved behavior and feature-specific screen/interaction specification are kept together in this single Writing \`PRODUCT.md\`. Do **not** create a second \`E-01.staircase.md\` for duplicate content. Inherit shared visual rules from repository-root \`/DESIGN.md\`; component Props/Events/States are defined once in the existing registry/contracts. This is the current compact two-document authoring approach (Writing PRODUCT.md + global DESIGN.md) for the pilot, not a claim that every future requirement must create its own PRODUCT.md.

### Authoritative decisions vs visual exploration

- **Confirmed experience requirement:** E-01 is a **diagonal staircase learning path running lower-left → upper-right**, **not** a conventional vertical lesson list. Users browse by diagonal drag, mouse wheel, keyboard arrows, Home/End, with snapping to steps and a viewport-adaptive incline. The staircase's UI layout implementation cannot decide course permissions.
- The same Alex course state, URL handling, language, progress, lesson navigation, unit milestones and level goals are used in **both** A and B. No mock unlock, alternate scoring rules or independent study-progress stores.
- **A · Separate stepped platforms [REQUIRED A/B]:** one independent thin platform per node along the diagonal. Card bottom equals platform top at that node's anchor Y. Use approved Writing Warm Frame palette, not historical dusk colors.
- **B · Continuous slope with anchor ticks [REQUIRED A/B]:** same content, permissions, geometry and Writing palette as A. Only the path form differs: a single continuous diagonal line with an individual tick/platform at each level anchor. Card bottom equals anchor Y.
- **Icon family:** use the global /DESIGN.md choice (Iconoir) for UI symbols; the old platform/beam is decorative media, not a replacement UI-icon family.

### Shared diagonal geometry and access rules

- Keep the horizontal platform/step anchor separation **290 CSS px** as the historical reference for the A/B proof; node width **260px**, slot/platform width reference **280px**. Do not treat these numeric values as finalized global Tokens.
- Vertical rise is **computed from the staircase viewport**, clamped roughly **48–120px**; slope is \`rise / 290\`. **Do not hard-code a 15° angle.** The same rise/slope is used by camera positioning, pan and snapping.
- The region must be navigable without a pointer; identify the path accessibly and provide visible focus. Reduce motion when OS prefers reduced motion. Validate small viewports and zoom; no forced 1024px minimum width.
- Locked lessons **never navigate**; real permission is checked by \`CourseSession.openLesson\` / Alex state. Start, Continue, Review and Skipped remain distinct. If a visual effect for a blocked click is introduced, it must never imply an unlock.
- Milestones are computed from Alex progress; the auto- and replay-celebration behavior already documented above is unchanged. Level Goal scoring and other items in \`OPEN_QUESTIONS.md\` remain pending Alex.
- Historical \`Writing-staircase-prompt.md\` is evidence of the old concept, **not a newer source of truth** for typography, full palette, prototype URL/lang stores, mock unlock logic, exact visuals or milestone-completion semantics.

### A/B internal review protocol

One interactive demo offers a **visible A / B path-shape switch**. A uses separate pedestals, B a continuous slope plus local anchors. Both use exactly the same geometry, colors, data, and course-session adapter; B remains the default review convenience, not a signed-off winner. The comparison is a **designer review**, not a deployed randomized A/B experiment or evidence of K–12 learner preferences.

Review at 1440px, 1024px, 834px (plus a narrow viewport): (1) recognizable lower-left → upper-right hierarchy, (2) drag/wheel/keyboard/snap/navigation functionality, (3) card legibility, center of visual attention and reduced-motion behavior, (4) Start/Continue/Review/Locked/Skipped and milestone states, (5) foreground/background contrast and keyboard focus, (6) path rhythm, density and readability; never alignment of card tops. Collect matched viewport screenshots and a short interaction recording for both before requesting designer approval.

**Implementation status:** Updated by the later designer directive on branch \`feat/agent-a-e01-anchor-tabs-ab\`; supersedes PR #6's earlier A/B color-based definitions. React source and unit tests are provisional until automated checks and browser screenshots are run; neither variant is an approved final visual design.


### Mandatory E-01 bottom-anchor + Level Tabs rules [DESIGNER DIRECTIVE, 2026-10-19]

**Priority:** This section supersedes earlier E-01 A/B path definitions. The single Writing PRODUCT.md contains its page-specific Specification; do not duplicate this in DESIGN.md or a separate E-01 file.

**1. Bottom-anchored vertical invariant.** Set `anchorY(i) = anchorBaseY + (nodeCount - 1 - i) × viewportAdaptiveRise`. Calculate it from only step index and shared viewport/path geometry. Both platform (A) and local anchor (B) use exactly that Y. The card **bottom** equals pedestal top or anchor Y. Implement with `position:absolute; top:anchorY(i); transform:translateY(-100%)` or an equivalent invariant. Card height or content changes ONLY its top position; it never alters anchor Y, camera Y or slope. Do not top/center align cards or normalize Milestone and Lesson heights to fake step alignment.

**2. A/B path shapes, same geometry and Warm Frame palette.** A: one separate platform per diagonal step, with platform top exactly at card bottom. B: a single continuous ascending path through the SAME anchors plus a small platform/tick at each, with card bottom at that anchor. Use approved Color System v0.2 for both. Compare path rhythm/density/readability, NOT visually aligned card tops. Path shape and page visual details remain unapproved until designer review.

**3. Level navigation = accessible Tablist.** Use React Aria `Tabs` + `TabList` + `Tab` + associated `TabPanel` with exactly one selected tab, Left/Right keyboard selection, correct aria semantics. Changing the Level changes the E-01 path content ONLY, never navigates into a Lesson or changes learner progress/score.

**4. One geometric three-zone header.** At desktop and approximately 834 CSS px, keep a SINGLE ROW: left current Level title (truncate inside its area), center the Tablist relative to the ENTIRE header midpoint, right language toggle. Symmetric flexible left/right columns maintain center regardless of unequal side content. No row wrap and no detached language/Level controls. On narrow phones a scrollable internal Tablist is acceptable if all controls remain reachable.

**Acceptance:** interactive A/B with same anchor formula; programmatically change a Lesson card's content height, prove its bottom and anchor Y remain unchanged within 1 CSS px; screenshots at 1440 and 834; test keyboard tabs and exactly one selected item with path-only navigation. Alex course unlocking, skip and scoring remain unchanged. Never label unapproved page visuals Final.

## Celebration effects · isolated review Demo (2026-10-20)

User-authorized scope: migrate the complete Project 2 particle-presets preview to
`/?demo=celebration-effects` in Writing, with optional `&locale=zh`. All ten effects
(Ribbons, Confetti, Cannon, Explosions, Falling, Parade, Party, Fire, Firefly and
Fireworks) are available for explicit manual preview and Stop. Nothing autoplays
on entry. Previews are decorative, honor reduced motion, stop on Escape/page exit
or after 15 seconds, and do not block page controls. Cannon retains its drag and
release gesture; Firefly retains pointer trails. The preview background may be
switched between paper and night to inspect light particles.

This is a temporary visual candidate awaiting designer acceptance. It is **not
Milestone integration**: the existing milestone eligibility, first-return auto
celebration, manual replay receipts, progress, unlocking, skip and scoring rules
above remain authoritative and unchanged. Source/dependency records and validation
are in `docs/CELEBRATION_DEMO_MIGRATION.md`; no shared design tokens or component
contracts are changed.
