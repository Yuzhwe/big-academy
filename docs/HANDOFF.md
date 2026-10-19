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
