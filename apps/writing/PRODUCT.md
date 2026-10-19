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
- **A · Dimensional platform staircase [EXPLORE ONLY]:** historical stacked card + thin platform + subdued downward light beam; the archival dusk gradient \`#411C0A → #B39C6B\` is a **comparison candidate only** and is not a reversal of the approved product visual direction. It requires designer sign-off before any final adoption.
- **B · Warm Frame staircase [EXPLORE ONLY]:** same diagonal composition/behaviors, simpler white cards on a light warm frame; no platform or light beam. It aligns conceptually with approved Warm Frame + White Canvas, but specific appearance/colors/radii remain unapproved.
- **Icon family:** use the global /DESIGN.md choice (Iconoir) for UI symbols; the old platform/beam is decorative media, not a replacement UI-icon family.

### Shared diagonal geometry and access rules

- Keep the horizontal platform/step anchor separation **290 CSS px** as the historical reference for the A/B proof; node width **260px**, slot/platform width reference **280px**. Do not treat these numeric values as finalized global Tokens.
- Vertical rise is **computed from the staircase viewport**, clamped roughly **48–120px**; slope is \`rise / 290\`. **Do not hard-code a 15° angle.** The same rise/slope is used by camera positioning, pan and snapping.
- The region must be navigable without a pointer; identify the path accessibly and provide visible focus. Reduce motion when OS prefers reduced motion. Validate small viewports and zoom; no forced 1024px minimum width.
- Locked lessons **never navigate**; real permission is checked by \`CourseSession.openLesson\` / Alex state. Start, Continue, Review and Skipped remain distinct. If a visual effect for a blocked click is introduced, it must never imply an unlock.
- Milestones are computed from Alex progress; the auto- and replay-celebration behavior already documented above is unchanged. Level Goal scoring and other items in \`OPEN_QUESTIONS.md\` remain pending Alex.
- Historical \`Writing-staircase-prompt.md\` is evidence of the old concept, **not a newer source of truth** for typography, full palette, prototype URL/lang stores, mock unlock logic, exact visuals or milestone-completion semantics.

### A/B internal review protocol

One interactive demo offers a **visible A / B switch**. It changes only the visual treatment; both options use the same React path nodes, geometry and course-session adapter. Default **B** for the approved family direction. The comparison is a **designer review**, not a deployed randomized A/B experiment or evidence of K–12 learner preferences.

Review at 1440px, 1024px, 834px (plus a narrow viewport): (1) recognizable lower-left → upper-right hierarchy, (2) drag/wheel/keyboard/snap/navigation functionality, (3) card legibility, center of visual attention and reduced-motion behavior, (4) Start/Continue/Review/Locked/Skipped and milestone states, (5) foreground/background contrast and keyboard focus, (6) whether A's platform/beam helps learning orientation or distracts. Collect matched viewport screenshots and a short interaction recording for both before requesting designer approval.

**Implementation status:** \`feat/agent-a-e01-staircase-ab\` is an Agent A experimental PR. React source and unit tests are provisional until automated checks and browser screenshots are run; neither variant is an approved final visual design.
