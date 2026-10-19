# Big Academy

Code-first K–12 product workspace in **[Yuzhwe/big-academy](https://github.com/Yuzhwe/big-academy)**. **Writing** is the first implementation pilot; Reading and other products can be added later.

## Canonical sources

- [DESIGN.md](DESIGN.md) — **the only global DESIGN.md**, covering P0 architecture, typography, colors/themes, shared patterns, Iconoir, components and QA.
- [Writing PRODUCT.md](apps/writing/PRODUCT.md) — Alex-backed Writing product rules **and** page-level requirements/Specifications (E-01 diagonal Staircase included). No redundant E-01 specification or app-level DESIGN.md.
- [Component Registry](apps/writing/contracts/components.json) — component IDs, Props/Events/States, implementation/visual statuses and code links.
- [CSS design tokens](packages/design-system/src/tokens.css) — **current executable token source** (semantic product-theme migration is planned in P1-B).
- [HANDOFF.md](docs/HANDOFF.md) — latest branch ownership, runtime evidence, limitations and open approvals.
- [P1-A integration readiness](docs/integration/P1-A_READINESS.md) — branch conflict resolutions and merge gates.
- `apps/writing/source/alex-original.html` — original product logic authority; historical design prompt files are references, not independent approvals.

## Getting started

```bash
npm install
npm run check:docs
npm run typecheck
npm test
npm run dev
npm run test:layout
```

`npm run dev` runs the partial Writing E-01 → G2-O lesson slice. The staircase A/B interaction proof **does not mean either variant is visually approved**; the nine-lesson/52-screen target is not complete. Run relevant browser checks and review screenshots/Storybook before approval.

## GitHub review status

This integration candidate brings together the code ancestry from Writing PR #4/#6 and shared documentation from PR #2 **on an isolated branch**. PR #5 Delivery Hub is **not yet integrated** and its vendor snapshot is pinned to an earlier Writing revision. **Do not infer that `main` contains this implementation until an explicit reviewed merge occurs.**

Agents use independent feature branches and PRs; final UI/UX decisions belong to the Designer, and original learning/scoring rules to Alex. Never modify `RaoJing414` repositories.
