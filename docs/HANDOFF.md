# HANDOFF — GitHub bootstrap (2026-10-19)

## Confirmed
- New private repository: `Yuzhwe/big-academy` (renamed from `big-academy-writing`).
- `main` reserved for approved work; `feat/writing-lesson-topbar` is the active feature branch. Legacy empty `feat/lesson-topbar` remains untouched.
- Writing scope: E-01 + G2-O nine lessons, 52 activity screens; original Alex logic is product source.
- Single visual direction: A Warm Frame + White Canvas; dark wood B explicitly rejected.
- Milestone: one per Unit, same displayed completion rule for all Unit kinds, source-recognized Skill Skip counts; first new-achievement return to staircase auto-celebrates once and user may click to celebrate again.
- Top Bar: menu removed, back/lesson info left, task and completion state centered geometrically, right slot invisible. Task navigation uses source-provided permissions.
- React Aria chosen for headless interaction foundation; component tokens, registry, validation, Storybook and UI/UX designer sign-off are required.

## Status of this GitHub branch
`feat/writing-lesson-topbar` holds the Top Bar pilot (`apps/writing/docs/PILOT_RUNTIME.md`). This change adds the E-01 lesson slice (`apps/writing/docs/SLICE_RUNTIME.md`).

`BA-UI-001`, `BA-UI-006`, and `BA-WR-001` stay `implemented` with a temporary foundation theme. They were not rewritten for the slice. They are not `validated`.

`BA-WR-002` LessonWorkspace, `BA-WR-005` StairLessonCard, and `BA-WR-006` UnitMilestone are `implemented` with `visualStatus: candidate-warm-frame`. They are not `validated`. The other registry entries stay `planned`.

The slice calls Alex `Pages.canOpen`, `Pages.done`, `Skip`, `Home.lessonStates`, and `Stairs` ordering through `apps/writing/src/product/courseSession.ts`. `?fixture=` remains the fixture-only Top Bar preview. `PRODUCT.md` and `DESIGN.md` are still drafts. The canonical Skill v0.2 is still not imported.

## Next steps (do in this order)
1. Designer reviews the path and lesson screenshots in `apps/writing/docs/evidence/slice/` before any visual approval. Candidate values stay candidate.
2. Import the verified v0.2 prototype-to-hifi Skill. Do not reuse old completed lesson HTML styling.
3. Port the remaining G2-O templates from real `SCR` rows: P4, P5, P6, P7, then P1. Do not mark a screen done with a placeholder.
4. Re-home Index / Analytics / Menu behaviors that are no longer on the bar.
5. Do not merge to `main` until runtime evidence and explicit designer sign-off both exist.

## Known open issues
Level Goal exact criterion, concurrent new milestones, skip revocation and celebration receipts, removal/re-homing of former menu features, and remaining 52-activity visual QA.

## E-01 diagonal staircase A/B proof — Agent A (2026-10-19)

Branch \`feat/agent-a-e01-staircase-ab\` (from \`cursor/writing-e01-lesson-slice-7d6c\`) implements a **draft designer-review-only** A/B variant switch: **A** historical cream card/280px thin platform/under-platform light beam on old dusk backdrop, **B** contemporary Warm Frame white-card treatment; **both** use the same left-bottom → right-top staircase positioning, responsive rise, pointer/wheel/keyboard camera, and Alex course session/state. Neither is visually approved; historic dark palette is not reinstated as the product design standard.

The UI/UX Designer proposed merging requirement and page-level Specification **inside each product's PRODUCT.md** and keeping one shared root DESIGN.md (two documentation sources rather than a third E-01 spec file). E-01 details have been appended to the existing Writing PRODUCT.md for this proof; the more global governance/source-of-truth change remains subject to PR review and reconciliation with the unified DESIGN.md branch. Do not create redundant per-page DESIGN.md files.

The original Cursor Writing PR #4 and Agent A documentation PR #2 are still separate; this branch depends on the Cursor E-01 slice and must be merged in a reviewed order. Do not claim layout tests or screenshots have been performed solely because component/unit-test source was added.

### Agent A A/B review artifact (2026-10-19)

- [Draft PR #6](https://github.com/Yuzhwe/big-academy/pull/6) — implementation preview based on Cursor E-01 Draft PR #4, **not merged**. The interactive A/B switch uses the same diagonal scene geometry and the same `CourseSession` for both visual versions.
- Proposed browser assertions and matching screenshot capture are now in `apps/writing/e2e/staircase-ab.spec.ts`. **These tests have been authored but not executed in this chat/runtime**; no deployed URL or approved visual evidence yet. Run typecheck, Vitest, Playwright and collect results before treating this as delivered/validated.
- This branch includes E-01-specific Requirements + Specification in `apps/writing/PRODUCT.md`. Product-level features/shared rules are not duplicated into a separate page spec. The root `/DESIGN.md` on Draft PR #2 still requires a reviewed documentation reconciliation; no false claim of already having two identical finalized docs.

## Writing hi-fi slice after Agent A E-01 (2026-10-19)

Branch `cursor/writing-hifi-from-agent-a-e01-8539` starts from `feat/agent-a-e01-staircase-ab`. It does not push that branch or `main`.

`BA-WR-003` WordGrid and `BA-WR-004` HamburgerLayer are `implemented` with `visualStatus: candidate-warm-frame`. Contract `0.1.1` only adds optional props. `BA-UI-001`, `BA-UI-006`, and `BA-WR-001` were not rewritten.

The student path still uses Alex `Pages.canOpen`. Lesson 6 plan topic and plan layers can be completed for real. `plan.check`, P4, P5, P7, and P1 are not marked done.

BA UI Designer review of draft PR #7 requested changes and did not approve the visuals. The follow-up on this same branch gates the dusk A/B switch off student chrome (`?explore=staircase` only), keeps long titles from displacing the centered task chips at 834, and keeps the tablet word grid from covering the active plan entry, Coach, or Footer. `BA-UI-001`, `BA-UI-006`, and `BA-WR-001` stay temporary foundation. Candidate values stay candidate. This is still awaiting designer re-review. It is not visually complete.

Audit: `apps/writing/docs/PHASE_A_HIFI_AUDIT.md`. Runtime: `apps/writing/docs/HIFI_RUNTIME.md`. Global design copy: `/DESIGN.md` and `docs/reference/unified-design/`.
