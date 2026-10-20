# Big Academy — baseline v0.1

Code-first K–12 education product workspace. Writing is the active pilot.

## Authoritative sources

1. [Writing PRODUCT.md](apps/writing/PRODUCT.md) — product requirements, lesson content, grading, navigation, persistence and acceptance criteria.
2. [DESIGN.md](DESIGN.md) — global visual system and detailed spacing, radius, motion, accessibility and component styling rules.
3. [Design Tokens](packages/design-system/src/tokens.css) — executable color, type, space, radius and motion values.
4. [Component Contracts](apps/writing/contracts/components.json) — IDs, props, events, states and component ownership.

[AGENTS.md](AGENTS.md) explains contribution rules. [HANDOFF.md](docs/HANDOFF.md) records current implementation gaps and validation status.

## Development

```sh
npm ci
npm run check:docs
npm run typecheck
npm test
npm run dev
```

Writing uses React Aria Components and a shared Big Academy design-system package. The active implementation target is eight Activity Screens in L2/G2-O Lesson 1. Existing UI/code is a prototype and **does not imply the new written contracts are implemented or visually approved**.

New development should branch from `main`, update contracts/tokens when required, run checks and submit a PR. Prior experimental branches are not authorities.
