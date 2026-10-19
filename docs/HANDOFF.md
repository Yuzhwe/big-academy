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
`feat/writing-lesson-topbar` began as foundation documents. The pilot implementation lives on `feat/grokbot-writing-topbar` and is recorded in `apps/writing/docs/PILOT_RUNTIME.md`.

`BA-UI-001`, `BA-UI-006`, and `BA-WR-001` are `implemented` with a temporary foundation theme. They are not `validated` and not visually approved. The other ten registry entries stay `planned`. `PRODUCT.md` and `DESIGN.md` are still drafts, not frozen v1.0.

`alex-original.html` is in `apps/writing/source/` as a read-only product reference. The Top Bar preview does not call `Pages.canOpen`. The canonical Skill v0.2 is still not imported.

## Next steps (do in this order)
1. Import the verified v0.2 prototype-to-hifi Skill. Do not reuse old completed lesson HTML styling.
2. Designer reviews the Storybook stories and the screenshots in `apps/writing/docs/evidence/` before any visual approval.
3. Bind `BATaskProgress` to actual Alex `Pages.canOpen` through a product adapter; verify no bypass. Re-home Index / Analytics / Menu behaviors that are no longer on the bar.
4. Do not merge to `main` until runtime evidence and explicit designer sign-off both exist.

## Known open issues
Level Goal exact criterion, concurrent new milestones, skip revocation and celebration receipts, removal/re-homing of former menu features, and remaining 52-activity visual QA.

## Unified DESIGN.md decision (2026-10-19)

Designer approved exactly **one** repository-root `DESIGN.md` spanning all products. Product identity is primarily expressed by colors via semantic product theme tokens; unique product components/layouts remain distinct. Old `apps/writing/DESIGN.md` is moved into the root document on `docs/unified-design-and-token-audit`, with research & token gap audit at `docs/design-system/BENCHMARK_AND_TOKEN_GAP_AUDIT_v0.1.md`. This documents an architecture decision, not a visual v1.0 signoff. Grokbot's TopBar engineering branch remains untouched and must reconcile paths/semantic token aliases before integration.
