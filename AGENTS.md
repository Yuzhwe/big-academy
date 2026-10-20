# Big Academy — Agent Instructions (Baseline v0.1)

## Mandatory source order
1. `apps/writing/PRODUCT.md` — Writing product goals, exact lesson data, scoring, gating, recovery and acceptance.
2. Root `DESIGN.md` — sole authoritative visual/design guide, including detailed Spacing, Gap, Radius, Typography, Motion and Unit folded-corner direction.
3. `packages/design-system/src/tokens.css` — executable design values and semantic aliases. Candidate values are not automatically visually approved.
4. `apps/writing/contracts/components.json` — stable IDs, props, events, states, slots and ownership.
5. `docs/HANDOFF.md` — current delivery and verification gaps.

Do not use old branches, historical prompts, demos, abandoned PRs or duplicate design files as product/design authority. One root DESIGN.md, one PRODUCT.md per product. There is no `apps/writing/DESIGN.md`.

## Scope
Writing v1 target: **L2/G2-O Lesson 1, eight Activity Screens**, E-01 Staircase entry/return and Lesson End. No obligation to build all 52 screens. Existing source code is a reusable pilot, not proven parity with the current contracts.

## Roles and boundaries
- UI/UX Designer: final visual and major UX approval.
- Product Owner: Writing curriculum, grading, completion and learning rules.
- AI Agents: implement, test, provide reproducible review evidence and open PRs.
- Never use or modify RaoJing414 repositories.
- Preserve approved **A — Warm Frame + White Canvas** and A independent-platform diagonal Staircase.
- React Aria Components provide accessible interaction foundation; shared Big Academy components own reusable visual language.
- Numeric and semantic values belong in shared CSS Tokens, with approved Primitive → Semantic → optional Component hierarchy.
- English heading/numeral: Dosis ExtraBold 800; English body Jost; Chinese heading Douyin; Chinese body Noto Sans SC; Iconoir is standard UI icon library.

## Workflow
Start each feature from the latest `main`. Use an isolated branch. Read canonical specs, inspect existing component code, implement and update contracts and Tokens where required, run checks, deliver an interactive preview and screenshots, then request designer review. Do not merge unreviewed significant product or visual changes.

Checks: `npm run check:docs`, `npm run typecheck`, `npm test`, `npm run build`, applicable Playwright/Storybook and browser accessibility/responsive evidence. Record not-run or failing checks instead of claiming success. Update `docs/HANDOFF.md` when changing integration state.

## Visual state
A component may be `implemented` yet `temporary` or `in-review` visually. The new ActivityScreenIndicator and Unit folded-corner treatment require rendered comparison and designer approval. Never treat successful compilation as approval.
