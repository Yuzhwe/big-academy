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

### 2.2 Approved theme scope — Decision B [A, 2026-10-19]

**Product Color Themes use accent colors plus subtle tinted backgrounds.** This is the approved architectural direction, not approval of any new individual hex values, color ramps or CSS selector API.

- **Product-themed:** primary action backgrounds and on-action foreground pairings, interactive selection, links and relevant emphasis; **allowed** low-intensity surface tints for product atmosphere and shell/background zones.
- **Shared:** neutral foundations, white functional content canvas where needed, text/readability, component geometry/behavior, spacing, typography principles and functional state meanings (success/error/warning/disabled/focus). Product identity must not silently recolor semantic success/error or reduce contrast.
- **Boundaries:** Writing remains A · Warm Frame + White Canvas; its background candidate `#FEF9EF` stays [E]. Reading accent and all Reading tint values remain [Q]. The amount/placement of tints and exact colors are chosen by the UI/UX Designer in later visual review.
- **Implementation implication:** shared reusable components read semantic aliases such as `--ba-color-action-primary`, not a Writing-specific primitive. App-level product theme resolves those aliases. Exact token spelling/theme selector remains an [E] proposal until Token Architecture approval.

### 2.3 Token Architecture — approved P0-2 [A, 2026-10-19]

**Approved architecture (not approval of every token value or name):**

1. **Primitive → Semantic → optional Component.** Primitive tokens store raw values; semantic tokens express usage and product-theme roles; component tokens are introduced only when a component needs a distinct reusable value. Example names: `--ba-color-ink-900` → `--ba-color-content-primary` → optional `--ba-topbar-title-color`.
2. **CSS custom properties (CSS Variables) are the current *single executable source of truth*.** Store and maintain token values in the shared design-system source; do **not** hand-maintain a competing JSON/Figma token value set. If cross-platform tooling is needed later, approve a migration and generate derivative outputs automatically.
3. **Product themes are selected at application/shell level; shared components consume semantic variables.** For example, a Writing app shell resolves a generic `--ba-color-action-primary` to the approved Writing accent. A reusable BAButton never needs `product="writing"` or a direct `--ba-writing-accent` dependency just to get its primary color.

**Scope / approval boundaries:** Theme B (accent + subtle tinted backgrounds) is approved [A]. Exact CSS token names, selector mechanism (e.g. `data-ba-product="writing"`), default theme values, further primitive color scales, specific surface tint values and additional component token values remain *candidates* [E/Q]. Reading accent remains TBD. Shared focus, disabled and feedback semantics cannot silently change meaning when product theme changes. Validate computed foreground/background contrast and keyboard focus in each product theme.

**Implementation handoff:** Grokbot pilot CSS on `feat/grokbot-writing-topbar` still directly uses `--ba-writing-accent` in shared BAButton. Migrate it to semantic aliases without intentional visual changes; add verification in stories and browser testing. That implementation branch was not modified by this architecture decision.

## 3. Typography — Foundation A [A, 2026-10-19]

**Approved direction:** One coherent typography system across **all** Big Academy products, with **expressive display/heading typography plus highly readable body/learning text**. UI labels use the shared text-role system rather than a separate product-specific font identity. The display and body roles **may** use different typefaces; two separate families are not mandatory.

### Shared text roles (architecture approved; exact style values pending)

- **Display:** expressive brand/learning headlines, used selectively; preserve legibility for younger learners.
- **Heading:** lesson, page and sectional hierarchy, consistent with display intent without excessive decoration.
- **Body / Learning content:** optimized for reading, writing, task instructions and longer passages; legibility takes priority over style.
- **Label / Control:** buttons, tabs, task status, short interface labels; remain legible at practical sizes.
- **Supporting / Caption:** metadata and secondary copy that must remain accessible; not automatically "tiny."

### English and Chinese

Both languages share the **same semantic text roles and hierarchy**, but can select different font families or fallbacks for correct CJK coverage, balance and rendering. A localized screen should be monolingual rather than duplicating EN/ZH side-by-side. Verify line breaks, CJK punctuation, long lesson names, zoom/text scaling and mixed-language input.

**Explicitly deferred [Q]:** final font families, exact sizes, weights, line heights, letter spacing, type scale, bundled assets and licensing. The working implementation may continue to use a clearly marked **temporary system-font/fallback stack [T]**; no visual approval is implied.

### Existing typeface inspiration (reference only)

Reference font direction **[R]** (not installed/approved final distribution):

| Role | English | Chinese |
|---|---|---|
| Display/expressive headings | Dosis ExtraBold | Douyin Sans |
| Body / extended reading | Jost | Noto Sans SC |

These are examples for future font exploration, **not a commitment to Dosis, Jost, Douyin Sans or Noto Sans SC**. Do not ship font binaries without reviewing their license and distribution rights.

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
- **Approved theme scope:** B · product accent + light tinted surfaces; exact tint values pending.
- **Approved Token Architecture:** Primitive → Semantic → optional Component; shared CSS Variables as the single current executable source; themes set by the app/shell and consumed semantically by shared components.
- **Approved Typography Foundation:** A · expressive display/heading + readable body/learning content; shared roles across products, EN/ZH can use appropriate family/fallback; numeric scale and final font selection deferred.
- **Current token gaps:** semantic palette aliases/theme contract, spacing/typography/radii/elevation/motion scale, responsive sizes, accessible feedback color pairs, and status token conventions.
- **Gate:** root DESIGN.md draft requires UI/UX Designer approval; proof requires a running component, Storybook states and browser QA. Component contract and product docs remain authoritative for UI interfaces and learning rules.
