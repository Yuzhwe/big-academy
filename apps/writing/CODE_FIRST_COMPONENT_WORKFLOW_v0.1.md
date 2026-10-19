# Code-First Component Workflow · Decision Proposal v0.1

**Scope:** Big Academy Writing, approved A · Warm Frame + White Canvas. This is an execution direction, not completed React code or a replacement for product/design approval.

## Decision

Treat **approved component source + design tokens + interactive component stories + browser evidence** as the portable implementation reference for new AI agents. Figma is optional for exploration and review, and any existing Figma screenshots/refs remain historical evidence. **No Agent requires access to Figma to bootstrap the project.** `../../DESIGN.md` still owns the human-approved visual intent; `PRODUCT.md`/Alex own domain rules.

## Why not code alone?

Source code doesn't prove its styling rendered correctly, that fonts/assets loaded, or that the designer approved it. A receiving Agent needs a runnable preview (Storybook or equivalent), precise states and mocked data, a lockfile, reproducible tests and approval screenshots. Source without install/run/preview paths is not a complete handoff.

## Minimal implementation target (not yet built)

- `src/design-system/tokens.css` — candidate + approved tokens, status tagged.
- `src/components/ui/*.tsx` — limited React Aria-backed common primitives.
- `src/components/writing/*.tsx` — only Writing composites.
- `*.stories.tsx` — default, focused, locked, wrong/correct, long text, EN/ZH, tablet states as applicable.
- `contracts/components.json` — 13 scoped components, IDs `BA-UI-001` through `BA-UI-007`, `BA-WR-001` through `BA-WR-006`; all currently `planned`.
- `scripts/validate` / `tests` — static registry checker + TypeScript build + Storybook interaction + E2E + visual review (later phases).
- `HANDOFF.md` — run commands, known limits, current stage, approved decisions, evidence and next tasks.

## Parallel-track boundary

**Product Agent** can consume a minimal visual-neutral component adapter implementing accepted props/events. **Design Agent** can supply a polished visual implementation for the same contract and test its states in Storybook. Integration requires passing contract, build, behavior, visual checks. Geometry and keyboard/focus semantics cannot be indefinitely postponed as “just CSS”.

## Migration and ownership

- Component ID persists as visual appearance evolves; contract major version changes if breaking public API/state/geometry assumptions.
- Source code is not itself a design signoff. The UI Designer reviews the actual rendered stories and responsive screens before `approved`.
- Optional Figma refs use registry metadata; do not fail when unavailable.
- For transfer, include source + package manager lockfile + assets/license + scripts + exported Storybook/screenshots + test results + 2 specs + original source references.

## Current stage

Selection: React Aria Components, now installed and locked. `BA-UI-001`, `BA-UI-006`, and `BA-WR-001` have source, stories, unit tests, and browser layout evidence. Their registry status is `implemented` with a temporary foundation theme. That is not visual approval and not `validated`. Product navigation is still a fixture, not the Alex engine. Next: designer review, then a real `Pages.canOpen` adapter, then WordGrid/Overlay and StairLessonCard/Milestone on demand.