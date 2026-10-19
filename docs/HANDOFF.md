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
This commit contains the first foundation documents and reference prompts, **not** a compiled or browser-tested React implementation. Component Registry entries are deliberately `planned` until actual code is present and validated. `PRODUCT.md` and `DESIGN.md` are drafts, not frozen v1.0.

## Next steps (do in this order)
1. Import `source/alex-original.html`, verified v0.2 prototype-to-hifi Skill and the independent TopBar starter source from the previous handoff bundle; do not reuse old completed lesson HTML styling.
2. Bring up a minimal TypeScript + React app and shared design-system package. Fix known BAButton pilot duplicate prop/aria-busy declarations before TypeScript validation.
3. Install dependencies and lock versions; run typecheck/build; make Storybook stories for BA-UI-001, BA-UI-006 and BA-WR-001.
4. Browser QA at 1440x900, 1024x768, 834x1112, 390x844, including EN/ZH and task counts; keyboard, touch, aria current and skipped distinction.
5. Bind `BATaskProgress` to actual Alex `Pages.canOpen` through a product adapter; verify no bypass.
6. Designer approves visually. Open a PR; do not merge until runtime evidence exists.

## Known open issues
Level Goal exact criterion, concurrent new milestones, skip revocation and celebration receipts, removal/re-homing of former menu features, and remaining 52-activity visual QA.
