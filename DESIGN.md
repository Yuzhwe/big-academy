# Big Academy — DESIGN.md

**Version:** v0.3 DRAFT · Unified Code-First Design System · 2026-10-19  
**Owner:** UI/UX Designer (final visual authority)  
**Scope:** all Big Academy products. **This is the only DESIGN.md in the repository.**  
**Authority:** approved designer decisions override external design prompts; actual checked component code and Storybook demonstrate implementations but never grant design approval. Product-specific business rules belong in each `apps/<product>/PRODUCT.md`.

## 1. Overview — one design language, multiple product themes

Big Academy is a K–12 learning ecosystem. Maintain coherent typography, spacing, form controls, navigation, accessible state affordances, layouts and component quality across Writing, Reading and future experiences. Differentiate product identity **primarily through theme color**, without forcing different learning experiences into identical screen structures.

- **Global:** Design Tokens; semantic color roles; typography rhythm; spacing, shape, borders, focus, responsiveness, motion, components.
- **Theme:** product-owned accent/background mappings (e.g. Writing) and permitted decorative accents.
- **Product-specific composition:** Writing's staircase, Coach, paper workspace, Word Grid and Hamburger are distinct components/patterns documented **here**, with props and behaviors in Component Registry; learning/scoring rules remain in PRODUCT.md.
- **Figma:** optional exploration, never a mandatory build input.
- **Implementation status:** the shared library and Storybook pilot are on `feat/grokbot-writing-topbar`. The theme there is explicitly *temporary* and **not visually approved**.

Status legend: **[A]** explicitly designer-approved; **[E]** exploration/candidate; **[R]** reference-only; **[T]** working temporary implementation; **[Q]** open decision.

## 2. Colors & Product Themes

### 2.1 Known colors (do not invent other product themes)

| Role / candidate token | Value | Status | Use / caveat |
|---|---|---|---|
| `--ba-brand-dark` | `#133547` | [A] | Shared brand ink / key text |
| `--ba-writing-accent` | `#B25415` | [A] | Writing emphasis/primary action |
| `--ba-paper` | `#FFFFFF` | [A] | White content / writing canvas |
| `--ba-surface-warm` | `#FEF9EF` | [E] | Candidate Writing warm frame |
| `--ba-choice-border` | `#C9B8B2` | [R] | Candidate activity option/Word Grid borders |
| `--ba-success` | `#14AE5C` | [R] | Candidate correctness feedback; verify contrast |
| `--ba-error` | `#9B4F36` | [R] | Candidate wrong feedback; not new global brand primary |
| Reading primary/accent | TBD | [Q] | **Do not assign a fabricated Reading palette** |

`#B25415` on white has approximately **5.03:1** contrast and is suitable for normal-size AA text. White on `#B25415` also passes AA normal text. On `#133547` (2.56:1) or `#4E3B24` (2.11:1), it does not pass AA for normal text. Recalculate for hover, disabled, focus and actual tinted backgrounds; do not assume one contrast result validates every combination.

### 2.2 Token model

1. **Primitive** — raw values, e.g. `--ba-color-ink-900`, `--ba-color-writing-600`.
2. **Semantic** — what values *mean*, e.g. `--ba-color-content-primary`, `--ba-color-action-primary`, `--ba-color-on-action`, `--ba-color-surface-canvas`, `--ba-color-focus`, `--ba-color-feedback-success`.
3. **Component** — add only when distinct reuse/ownership requires it, e.g. `--ba-topbar-height`, `--ba-progress-gap`.

**Product theme contract:** applications attach a product identity (candidate API: `data-ba-product="writing"`) and resolve semantic accent tokens to product-specific primitive values. Components consume **semantic roles**, not the literal `--ba-writing-accent`. State semantics (success/error/disabled/focus) must remain legible across all product themes and never be signaled through color alone.

Only Writing's accent is approved. Reading / other theme values, exact aliases, and multi-theme runtime implementation remain [E/Q], not production contracts. The current Grokbot pilot uses `--ba-writing-accent` directly; this is a known migration item, not evidence of shared theme support.

## 3. Typography

Reference font direction **[R]** (not installed/approved final distribution):

| Role | English | Chinese |
|---|---|---|
| Display/expressive headings | Dosis ExtraBold | Douyin Sans |
| Body / extended reading | Jost | Noto Sans SC |

Font licensing, actual asset sourcing, browser fallbacks, line-height, letter spacing, and complete text scale are [Q]. Never distribute proprietary font files by assumption. The temporary runtime uses a system-sans fallback stack [T].

Ensure EN/ZH is **monolingual per view**; do not place doubled bilingual strings side by side. Support CJK wrapping, long task titles and user font scaling.

## 4. Layout & Spacing

**Shared rules:**
- Prioritize usable task content above decoration. Remove duplicate nonfunctional section labels while retaining task prompts, feedback, progress, essential controls and accessible names [A].
- Layout tokens should document container padding, compact/regular/comfortable gaps, hit target sizing, response to narrow width and browser zoom [Q scale; [T] min hit target 44px in pilot].
- Responsive behavior is defined by available layout space and verified in browser; test desktop 1440×900 and tablet 1024×768, 834×1112. A 390px mobile smoke test is useful; mobile remains secondary for current Writing pilot.
- Shared layouts should be implemented as primitives/slots where reusable, not mandated as one rigid template.

### Writing page patterns [A unless noted]

**E-01 Staircase:** coherent light/warm visual direction, **never the rejected dark wood B page**; Lesson number top-left on every card. Start / Continue / Review / Locked actions; preserve distinct skipped indicator. Insert one Unit Milestone after each Unit and Level Goal after final Unit. Their progress and confetti eligibility are product logic, not CSS; visual geometry, atmosphere, milestone styling remain [Q].

**Lesson Shell:** A · **Warm Frame + White Canvas**. White task/paper on left, Coach on right. Coach content scrolls independently; Back plus one contextual Check / Next / Hand in control live in a bottom footer **outside Coach**, pinned to the right column bottom. Ordinary visual borders/dividers default **0.5 CSS px [A]**; thicker functional focus rings remain [T/Q] and must visibly distinguish focus.

**BA-WR-001 LessonTopBar [A structure, E dimensions]:** remove collapsible menu. Left: Back + current Lesson name + only necessary tags; centered: real current-Lesson task numbers and completion statuses; right: no visible action. Task group must be geometrically centered in the **whole bar**, regardless of left-side title length. Do not hard-code task count. Keep skipped distinguishable, and never determine access by visuals. Long titles must not push progress or cause hidden task navigation. 80px desktop / 76px tablet, warm `#FEF9EF`, task marker 36px and scroll rail are **pilot candidates [T]**, not approved measurements. Removed menu capabilities remain a product-placement question.

**Word Grid:** task-gated inside left writing area. Multiple groups switch real vocabulary using tabs; active tab is visually connected to its panel. Tablet uses **on-demand overlay** in left area, preserving active caret and final writing line, and must not cover Coach/Footer.

**P6 Hamburger:** each row is **one shared visual layer**, label and editable content on same background. Focus changes whole-layer treatment and gives editable line a clear underline, no nested white input card. Distinguish P5 paragraph scaffold colors from P6 plan-layer palette; do not mix them.

**Other P1–P7 templates:** unique structure/feedback from Alex product source, visually informed by `apps/writing/source/Writing-activity-style-prompt.md`; that reference's simplified P1/P7 and generic completion logic **cannot override Alex**.

## 5. Elevation & Depth

Prefer restrained surfaces and hierarchy in learning views. White Paper should read clearly against the light Warm Frame. Ordinary borders are 0.5 CSS px [A] with tested contrast; do not replace accessibility focus, selected, error or other meaningful boundaries with low-contrast decorative hairlines.

Elevation tokens, popover layers, floating Word Grid shadows and Coach treatment remain [Q]; do not clone the dark/wood/strong-glass visual Demo as default.

## 6. Shapes

Define shared radius primitives for button, input, card, chip, overlay and circle, then map components to semantic usage. **No universal numeric radius scale has been approved yet**. Current pilot uses 999px pills and 10px progress targets as [T], not a global standard.

## 7. Components

Foundation: **React Aria Components** for accessible headless button, tabs, field and overlay behavior. Use native semantics where React Aria does not supply an exact business-level component.

Shared BA IDs from `apps/writing/contracts/components.json`: `BA-UI-001` … `BA-UI-007`. Writing composites: `BA-WR-001` … `BA-WR-006`.

Every reusable component needs stable ID, Props, Events, States, Slots (when applicable), layout responsibility, keyboard/touch/a11y requirements, and Storybook/visual test cases. Components may render with an explicitly **Temporary Foundation Theme** while visual design is pending; this may be implemented and tested but **must not be labeled visually approved**.

When changing a token, run its affected component stories, accessibility/contrast checks, and impacted product layouts. Do not assert that a JSX file alone is a design reference unless it is reproducible and reviewed.

## 8. Do's and Don'ts

**Do:** reuse semantic Tokens; keep one approved visual language; make product accents thematic; preserve CJK and accessibility; show states using labels/icons/geometry as well as colors; make business logic independent of UI styling; update Contract and Storybook alongside component API changes.

**Don't:** create a separate `apps/writing/DESIGN.md`; hard-code Writing accent in shared BAButton; invent Reading colors; treat source visual Demo measurements as approved; visually merge skipped with done; add menu or duplicate title; use confetti to mutate progression; freeze v1.0 without designer screenshot/interaction review.

## 9. Evidence & Open Work

- **Benchmark:** `docs/design-system/BENCHMARK_AND_TOKEN_GAP_AUDIT_v0.1.md`.
- **Actual temporary token source:** `packages/design-system/src/tokens.css` on Grokbot's **separate** `feat/grokbot-writing-topbar` branch. This docs branch does **not** yet include that code and must not pretend it does.
- **Current token gaps:** semantic palette aliases/theme contract, spacing/typography/radii/elevation/motion scale, responsive sizes, accessible feedback color pairs, and status token conventions.
- **Gate:** root DESIGN.md draft requires UI/UX Designer approval; proof requires a running component, Storybook states and browser QA. Component contract and product docs remain authoritative for UI interfaces and learning rules.
