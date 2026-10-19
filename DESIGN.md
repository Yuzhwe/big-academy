# Big Academy — DESIGN.md

**Version:** v0.4 DRAFT · Color System v0.2 design-approved · Unified Code-First Design System · 2026-10-19  
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
| `--ba-surface-warm` | `#FEF9EF` | [A] | Writing warm frame, warm-1 |
| `--ba-choice-border` | `#C9B8B2` | [A] | Warm-4 border value; component usage remains contract-specific |
| `--ba-success` | `#14AE5C` | [A] | Success-6 border-active anchor, NOT white-text strong fill |
| `--ba-error` | `#9B4F36` | [A] | Danger-7 strong error fill, never global brand primary |
| Reading primary/accent | TBD | [Q] | **Do not assign a fabricated Reading palette** |

`#B25415` on white has approximately **5.03:1** contrast and is suitable for normal-size AA text. White on `#B25415` also passes AA normal text. On `#133547` (2.56:1) or `#4E3B24` (2.11:1), it does not pass AA for normal text. Recalculate for hover, disabled, focus and actual tinted backgrounds; do not assume one contrast result validates every combination.

### 2.2 Approved theme scope — Decision B [A, 2026-10-19]

**Product Color Themes use accent colors plus subtle tinted backgrounds.** This is the approved architectural direction, not approval of any new individual hex values, color ramps or CSS selector API.

- **Product-themed:** primary action backgrounds and on-action foreground pairings, interactive selection, links and relevant emphasis; **allowed** low-intensity surface tints for product atmosphere and shell/background zones.
- **Shared:** neutral foundations, white functional content canvas where needed, text/readability, component geometry/behavior, spacing, typography principles and functional state meanings (success/error/warning/disabled/focus). Product identity must not silently recolor semantic success/error or reduce contrast.
- **Boundaries:** Writing remains A · Warm Frame + White Canvas; its warm background `#FEF9EF` is approved [A] at warm-1. Reading accent and all Reading tint values remain [Q]. The amount/placement of additional tints and exact colors are chosen by the UI/UX Designer in later visual review.
- **Implementation implication:** shared reusable components read semantic aliases such as `--ba-color-action-primary`, not a Writing-specific primitive. App-level product theme resolves those aliases. Exact token spelling/theme selector remains an [E] proposal until Token Architecture approval.

### 2.3 Token Architecture — approved P0-2 [A, 2026-10-19]

**Approved architecture (not approval of every token value or name):**

1. **Primitive → Semantic → optional Component.** Primitive tokens store raw values; semantic tokens express usage and product-theme roles; component tokens are introduced only when a component needs a distinct reusable value. Example names: `--ba-color-ink-900` → `--ba-color-content-primary` → optional `--ba-topbar-title-color`.
2. **CSS custom properties (CSS Variables) are the current *single executable source of truth*.** Store and maintain token values in the shared design-system source; do **not** hand-maintain a competing JSON/Figma token value set. If cross-platform tooling is needed later, approve a migration and generate derivative outputs automatically.
3. **Product themes are selected at application/shell level; shared components consume semantic variables.** For example, a Writing app shell resolves a generic `--ba-color-action-primary` to the approved Writing accent. A reusable BAButton never needs `product="writing"` or a direct `--ba-writing-accent` dependency just to get its primary color.

**Scope / approval boundaries:** Theme B (accent + subtle tinted backgrounds) is approved [A]. The original P0 decision left exact CSS names, selector, color scales and individual tints open. The designer's later Color System v0.2 decision in §2.4 approves the new names, eight color scales, Writing selector and approved warm surface; Reading and new unlisted color values remain [Q]. Reading accent remains TBD. Shared focus, disabled and feedback semantics cannot silently change meaning when product theme changes. Validate computed foreground/background contrast and keyboard focus in each product theme.

**Implementation handoff:** Grokbot pilot CSS on `feat/grokbot-writing-topbar` still directly uses `--ba-writing-accent` in shared BAButton. Migrate it to semantic aliases without intentional visual changes; add verification in stories and browser testing. That implementation branch was not modified by this architecture decision.

### 2.4 Color System v0.2 — designer-approved [A, 2026-10-19]

**Direct approval recorded:** the UI/UX Designer requested that the remaining Big Academy palette be completed using the Geist-inspired ten-step role structure and approved without a separate testing/review round. This approves the **color architecture, eight solid-color scales, anchor values and role maps** described in `docs/design-system/COLOR_SYSTEM_v0.2.md`. It does **not** certify engineering behavior or production accessibility.

- Families: `neutral`, `warm`, `brand`, `writing`, `success`, `danger`, `warning`, `info`.
- Unified roles: 1–3 component background (default/hover/active); 4–6 border (default/hover/active); 7–8 strong fill (default/hover); 9–10 text/icon (secondary/primary).
- CSS values live only in `packages/design-system/src/tokens.css`. Semantic tokens drive components. Writing app/shell uses `data-ba-product="writing"` for action-theme alias overrides.
- Preserved existing anchors: brand `#133547` at level 10; Writing `#B25415` at level 7; white writing canvas `#FFFFFF`. Writing warm frame `#FEF9EF` is now approved at warm level 1. Existing `#C9B8B2` warm border, `#14AE5C` success border-active, and `#9B4F36` error strong fill are incorporated.
- Reading primary/tint remain undecided; do **not** invent them. Dark mode, alpha scales and component spacing/radius approvals remain separate.
- No component, browser, Storybook, or accessibility tests were run **as explicitly requested**. Color-system **design approval [A]** must not be confused with engineering `verified` or visual approval of unreviewed rendered components.

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

### Approved font assignments [A, 2026-10-19]

The UI/UX Designer has explicitly selected the following **font roles**. These are no longer reference-only options.

| Use | English / Chinese | Typeface | Weight |
|---|---|---|---|
| English headings / display | English | **Dosis** | **ExtraBold only (CSS `font-weight: 800`)** |
| Long-form English body / learning text | English | **Jost** | Not yet fixed |
| Chinese headings / display | Chinese | **Douyin** (previous reference called `Douyin Sans`; confirm the distributable font's exact family/asset identifier before packaging) | Not yet fixed |
| Long-form Chinese body / learning text | Chinese | **Noto Sans SC** | Not yet fixed |
| **All UI numerals (0–9)**, in either language | Global override | **Dosis** | **ExtraBold only (800)** |

**Non-negotiable Dosis rule:** **Dosis is used exclusively at ExtraBold weight**; no Dosis Regular/Medium/SemiBold or synthetic intermediate weights should be chosen. This applies to both English headings and every UI numeral. Arabic digits inside otherwise Jost/Noto Sans SC text should use Dosis ExtraBold where technically practical without impairing text editing, accessibility, or text semantics. The exact rendering approach for mixed-script inline numbers, localized number formats and student-authored editable content remains an implementation question to test, **not permission to silently omit the numeric rule**.

**Explicitly deferred [Q]:** numeric font-size scale, line heights, letter spacing, chosen weights for Jost/Douyin/Noto Sans SC, UI control typography details, font asset source/version, license/distribution verification, performance strategy and fallback behavior. A temporary system-font stack [T] may remain in existing implementation until these font assets have been legally and technically verified; an installed fallback is **not** a change to the approved font choices. Do not bundle any font file before confirming its license. Verify actual font loading and EN/ZH/digit specimens in Storybook before visual sign-off.

## 4. Layout & Spacing

### Spatial, Grid & Layout System v0.2 [A principles, E values · 2026-10-19]

The UI/UX Designer approved **combining Vercel Geist-style regularized spacing with Figma's spatial organization method**. Full reference and review statuses: `docs/design-system/SPATIAL_GRID_LAYOUT_SYSTEM_v0.2.md`.

- **[A] 4px base / 8px predominant rhythm**. Prefer reusable spacing decisions and a small documented scale over arbitrary `gap`, `margin` or `padding`.
- **[A] Element First** for predictable interactive controls; **Content First** for variable learning content, Coach and writing passages.
- **[A] Column, Modular and typographic grids** may be used where they solve real layout needs; do not require 12 columns universally.
- **[A] Responsive, Adaptive and Strict** are complementary behaviors that may coexist in one page. Product layout/learning logic overrides generic grid samples.
- **[E] Candidate CSS scale:** `--ba-space-0/1/2/3/4/6/8/12/16` maps to 0/4/8/12/16/24/32/48/64px in `packages/design-system/src/tokens.css`. Exact semantic mappings, breakpoints, gutters, padding and component dimensions are **not designer-approved** by this decision.
- **Exceptions:** 44px touch-target minimum is a separate size concern; ordinary 0.5px borders, typographic metrics, focus rings, optical alignment and staircase world geometry do not need to be multiples of 4px. Do not rewrite existing Writing layouts or component contracts during this documentation phase.
- **Engineering state:** candidate spacing variables are unused until separately integrated and verified. Design-principle approval is **not** product, accessibility, or rendering signoff.

**Shared rules:**
- Prioritize usable task content above decoration. Remove duplicate nonfunctional section labels while retaining task prompts, feedback, progress, essential controls and accessible names [A].
- Layout tokens should document container padding, compact/regular/comfortable gaps, hit target sizing, response to narrow width and browser zoom [Q scale; [T] min hit target 44px in pilot].
- Responsive behavior is defined by available layout space and verified in browser; test desktop 1440×900 and tablet 1024×768, 834×1112. A 390px mobile smoke test is useful; mobile remains secondary for current Writing pilot.
- Shared layouts should be implemented as primitives/slots where reusable, not mandated as one rigid template.

### Writing page patterns [A unless noted]

**E-01 Staircase:** coherent light/warm visual direction, **never the rejected dark wood B page**; Lesson number top-left on every card. Start / Continue / Review / Locked actions; preserve distinct skipped indicator. Insert one Unit Milestone after each Unit and Level Goal after final Unit. Their progress and confetti eligibility are product logic, not CSS; visual geometry, atmosphere, milestone styling remain [Q].

**Lesson Shell:** A · **Warm Frame + White Canvas**. White task/paper on left, Coach on right. Coach content scrolls independently; Back plus one contextual Check / Next / Hand in control live in a bottom footer **outside Coach**, pinned to the right column bottom. Ordinary visual borders/dividers default **0.5 CSS px [A]**; thicker functional focus rings remain [T/Q] and must visibly distinguish focus.

**BA-WR-001 LessonTopBar [A structure, E dimensions]:** remove collapsible menu. Left: Back + current Lesson name + only necessary tags; centered: real current-Lesson task numbers and completion statuses; right: no visible action. Task group must be geometrically centered in the **whole bar**, regardless of left-side title length. Do not hard-code task count. Keep skipped distinguishable, and never determine access by visuals. Long titles must not push progress or cause hidden task navigation. 80px desktop / 76px tablet, task marker 36px and scroll rail are **pilot candidates [T]**, not approved measurements. Warm `#FEF9EF` is approved as Writing warm-1 surface [A], but this does not approve the TopBar layout measurements. Removed menu capabilities remain a product-placement question.

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

### Component Architecture — P0-4 · Progressive Componentization [A, 2026-10-19]

**Approved strategy: develop necessary shared foundation primitives first, allow product-specific components to be built independently, and extract cross-product Shared Patterns only after demonstrated reuse.** Do not attempt a complete speculative component catalog in advance.

- **Behavior foundation:** React Aria Components and appropriate native semantics; provides interaction/accessibility foundation rather than a finished Big Academy visual skin.
- **Big Academy UI Components:** reusable cross-product primitives (e.g. BAButton, BATabs, BAField) with brand/system styling defined through semantic Tokens; live under `packages/design-system`.
- **Product components:** domain-specific composites (e.g. Writing LessonTopBar, WordGrid, HamburgerLayer, StairLessonCard) belong in `apps/<product>`; they may compose shared primitives without prematurely generalizing product UX.
- **Shared Patterns:** only extract a common card, navigation, or layout pattern when genuine recurring needs show a stable interface and behavior across products. Reuse of superficial appearance alone is not sufficient. Make the promotion through an explicit reviewed refactor with consumer checks.
- **Ownership before implementation:** record stable Component ID, Props/Events/States/Slots where appropriate, layout ownership, keyboard/touch/responsive/a11y responsibilities, Storybook examples, and test evidence. Product business logic remains outside shared primitives.
- **Status is separate from classification and appearance:** a component can be implemented with Temporary Foundation Theme but remain visually unapproved. Being physically in `packages/design-system` does not by itself prove multi-product reuse.

**Current boundary note:** `BA-UI-006 BATaskProgress` is implemented in the shared package for the Writing pilot, but cross-product applicability is not yet validated. Keep its ID/contract stable during the pilot; revisit ownership only through a compatible, reviewed change instead of silently moving it. This decision does not reclassify or rename any existing registry entry today.

Every reusable component needs stable ID, Props, Events, States, Slots (when applicable), layout responsibility, keyboard/touch/a11y requirements, and Storybook/visual test cases. Components may render with an explicitly **Temporary Foundation Theme** while visual design is pending; this may be implemented and tested but **must not be labeled visually approved**.

When changing a token, run its affected component stories, accessibility/contrast checks, and impacted product layouts. Do not assert that a JSX file alone is a design reference unless it is reproducible and reviewed.

### Design Governance — P0-5 · Lightweight Governance [A, 2026-10-19]

**Approved:** AI Agents may autonomously perform routine implementation that follows existing contracts and design rules. **Significant changes require review**, but routine fixes must not be blocked by unnecessary approval ceremonies. GitHub feature branches, Pull Requests, the Component Registry, `/DESIGN.md`, product `PRODUCT.md` and `docs/HANDOFF.md` are the project record. Do not rely on chats as the only source of authority.

**Three independent responsibilities:**
- **Product approval — Product Owner (Alex):** original Writing learning behavior, scoring, completion, navigation eligibility, skip and other business rules. A UI Agent may document concerns or propose improvements but not overwrite product authority silently.
- **Design approval — UI/UX Designer:** visual appearance, major layout, interaction experience, semantic design tokens and formal design sign-off; this cannot be inferred from test passes.
- **Engineering verification — AI Agents:** code implementation, typecheck/build, behavior, keyboard/touch/accessibility, responsive/browser test evidence. Agents may report verification, but verification does not grant product or design approval.

**Keep independent review states:**
- Engineering: `planned → implemented → verified`. `verified` requires documented evidence for the component's applicable checks; a test pass alone may not cover source-backed learning behavior.
- Visual: `temporary → in-review → approved`. `approved` needs explicit UI/UX Designer acceptance based on actual renderings. A component can be `implemented` while `temporary`.
- A separate eventual `deprecated` lifecycle marker may be introduced when needed; deprecation is not a replacement for the visual-approval state.
- Existing legacy `status` fields in `apps/writing/contracts/components.json` remain unchanged for now. Splitting schema fields is a P1 implementation proposal requiring backwards-compatible migration and validation.

**Change boundaries and PR gates:**
- **Significant:** behavior/contracts or public Props/Events/States, learning logic, approved design direction, approved semantic token meaning/value, component ownership/major geometry, navigation/focus semantics, source-of-truth/branch conventions. Requires relevant product and/or designer review, rationale, affected examples and tests.
- **Routine:** implement accepted behavior, fix a bug, add compatible tests/Stories, tune **temporary** styling within approved layout and accessibility constraints. AI Agents can work independently on their own branches and submit PRs without prior approval for every small change.
- **Before merging to `main`:** applicable build/tests, story examples, responsive evidence/screenshots for visual changes, known limitations, Contract/Token/Doc updates, and **explicit** product/design approval where those domains change. Missing evidence blocks claims of completion; no automatic merge for unapproved visual/behavior changes.
- No Agent may silently replace accepted requirements, label a temporary palette as approved, or use the `RaoJing414` repositories/branches.

**Stage:** governance policy is approved [A]; the full dual-status schema, CI checks, branch protections and PR templates are **not yet implemented**. Keep initial workflow lightweight, audit in P1 as useful rather than constructing a large approval platform.

### Shared Icon Library — Iconoir [A, 2026-10-19]

**Approved source:** [Iconoir](https://iconoir.com/#icons) is the Big Academy system's standard icon library. React apps should use the maintained `iconoir-react` package through a Big Academy-facing `BAIcon` interface where practical, instead of independently introducing other general-purpose icon sets. Iconoir is distributed under the MIT license: preserve required copyright/license notices in redistributed copies.

**Boundaries:** This decision selects the icon family, **not** every icon glyph, icon-to-action mapping, line thickness, size, optical alignment or approved full icon component API. Establish a small accessible icon mapping in the component registry/Storybook during P1; meaningful icon-only controls require names and visible keyboard focus. Decorative assets (e.g. staircase platform illustrations or milestone artwork) are **not interchangeable with UI icons** and must be separately reviewed. Any exceptions or custom artwork should be tracked explicitly rather than silently mixing libraries.

## 8. Do's and Don'ts

**Do:** reuse semantic Tokens; keep one approved visual language; make product accents thematic; preserve CJK and accessibility; show states using labels/icons/geometry as well as colors; make business logic independent of UI styling; update Contract and Storybook alongside component API changes.

**Don't:** create a separate `apps/writing/DESIGN.md`; hard-code Writing accent in shared BAButton; invent Reading colors; treat source visual Demo measurements as approved; visually merge skipped with done; add menu or duplicate title; use confetti to mutate progression; freeze v1.0 without designer screenshot/interaction review.

## 9. Evidence & Open Work

- **Benchmark:** `docs/design-system/BENCHMARK_AND_TOKEN_GAP_AUDIT_v0.1.md`.
- **Actual temporary token source:** `packages/design-system/src/tokens.css` on Grokbot's **separate** `feat/grokbot-writing-topbar` branch. This docs branch does **not** yet include that code and must not pretend it does.
- **Approved theme scope:** B · product accent + light tinted surfaces; exact tint values pending.
- **Approved Token Architecture:** Primitive → Semantic → optional Component; shared CSS Variables as the single current executable source; themes set by the app/shell and consumed semantically by shared components.
- **Approved Typography Foundation and font roles:** EN headings Dosis ExtraBold 800; EN long text Jost; ZH headings Douyin (asset/family naming to verify); ZH long text Noto Sans SC; **all UI numerals Dosis ExtraBold 800**. Font size/line-height/other weights, licensing and runtime font loading remain unverified.
- **Approved Component Architecture:** A · progressively build shared UI primitives and product components; extract Shared Patterns after real cross-product reuse, never by speculative mass abstraction.
- **Approved Design Governance:** A · lightweight; significant changes reviewed, ordinary agent implementation autonomous; separate engineering and visual acceptance, GitHub PR/HANDOFF records.
- **Current token gaps:** semantic palette aliases/theme contract, spacing/typography/radii/elevation/motion scale, responsive sizes, accessible feedback color pairs, and status token conventions.
- **Gate:** root DESIGN.md draft requires UI/UX Designer approval; proof requires a running component, Storybook states and browser QA. Component contract and product docs remain authoritative for UI interfaces and learning rules.
