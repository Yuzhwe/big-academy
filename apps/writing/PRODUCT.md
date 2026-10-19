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