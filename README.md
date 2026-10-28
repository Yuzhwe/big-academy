# Big Academy · Writing Baseline 01 — integration candidate

K–12 code-first design ecosystem. Writing is the pilot: E-01 Staircase and L2/G2-O Lesson 1 **six current Activity Screens**. Historical P2/P7 authored records are retained, not routed as standalone screens. Engineering integration and documentation are in progress; the current UI is **not final designer-approved**.

Historic Writing Integration v1 evidence: [archived implementation notes](apps/writing/docs/INTEGRATION_V1.md). The Mac launcher and local URLs require independent verification; they are not proof that the current remote SHA is running.

## Project overview

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

Writing uses React Aria Components and a shared Big Academy design-system package. The active implementation target is six Activity Screens in L2/G2-O Lesson 1; P2/P7 are historical only. Existing UI/code is a prototype and **does not imply the new written contracts are implemented or visually approved**.

New development should branch from `main`, update contracts/tokens when required, run checks and submit a PR. Prior experimental branches are not authorities.

## Previews and local development

Run `npm run dev` for Writing, `npm run dev:library` for the interactive designer Component Library, and `npm run storybook` for Storybook. Read the actual terminal output for the bound port; any older `localhost` URL may point to a different checkout or stopped server. `Start Big Academy.command` and `npm run local-sites:install` are optional Mac utilities, not remote CI evidence.

The [HANDOFF](docs/HANDOFF.md) records the frozen candidate SHA, GitHub CI evidence when available, historical verification, unapproved visual details, and Review 07 starting conditions.
