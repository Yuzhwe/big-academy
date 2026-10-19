# Big Academy — Agent Operating Rules

1. Owner and target: `Yuzhwe/big-academy` only. Never touch `RaoJing414` repositories, branches or forks.
2. Design authority: the UI/UX designer approves visual and UX changes. Alex's original Writing prototype remains the product-logic authority; read `apps/writing/PRODUCT.md` and its recorded source references. Approved later decisions take precedence over conflicting demo guidance.
3. The sole Writing visual direction is **A / Warm Frame + White Canvas**. No dark wood B design.
4. Big Academy has **exactly one canonical visual specification at the repository root: `/DESIGN.md`**, shared across all products. Product themes vary mainly by semantic accent color; do not add `apps/<product>/DESIGN.md`. Big Academy uses **code-first** artifacts: `DESIGN.md`, design tokens, React Aria Components, custom BA components, stable Component IDs, Storybook and browser QA. A Figma connection is optional, not required to progress.
5. Before building, verify `apps/writing/contracts/components.json` and the component's Props, Events, States, and layout ownership. Product business rules never belong inside headless UI components.
6. `BA-WR-001 LessonTopBar` is the first pilot: back + lesson identification on left, actual task progress centered against **entire viewport/header**, no hamburger menu, no visible right control. Preserve done/current/available/locked/skipped and permission checks.
7. Only promote components or specifications to `approved` after runtime tests and explicit designer signoff. Never infer visual approval from documentation or static type checks.
8. Use `feat/writing-lesson-topbar` while building the pilot; open a PR for review. Do not push experimental components directly to `main`.
9. `apps/writing/source/alex-original.html` exists on this branch. Runtime component source is on the separate `feat/grokbot-writing-topbar` branch; canonical Skill v0.2 is not imported. Declare gaps rather than inventing runtime or product semantics.
