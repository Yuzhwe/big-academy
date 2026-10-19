# Big Academy

Code-first product workspace owned by **Yuzhwe**. This private repository starts with **Writing** as the first product pilot; Reading and other experiences can be added later.

## What is here

- `apps/writing/PRODUCT.md`: product behavior and approved UX decisions (draft)
- `DESIGN.md`: single cross-product visual design source (draft)
- `apps/writing/contracts/components.json`: stable component IDs and implementation contracts
- `apps/writing/source/`: user-supplied design reference prompts
- `packages/design-system/`: shared code-first components (implementation pending)
- `skills/`: reusable Agent workflow (canonical v0.2 skill to be imported)
- `docs/HANDOFF.md`: current progress and next tasks

## Status

`BA-UI-001` BAButton, `BA-UI-006` BATaskProgress, and `BA-WR-001` LessonTopBar now have a runnable pilot on `feat/grokbot-writing-topbar`. The theme is a temporary foundation for review. It is not visually approved. See `apps/writing/docs/PILOT_RUNTIME.md`.

Active review target: `feat/writing-lesson-topbar`. Request designer review before merging to `main`.

Private repo: https://github.com/Yuzhwe/big-academy. Do not use RaoJing414 repositories or branches.

Design policy: **one root DESIGN.md**; each app has its own PRODUCT.md and product-specific components, differentiated primarily by theme color.
