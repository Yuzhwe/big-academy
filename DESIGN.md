# Big Academy — DESIGN.md

**Version:** v0.5 DRAFT · Visual Language & Interaction Refinement · 2026-10-20
**Owner:** UI/UX Designer (final visual and UX authority)
**Scope:** cross-product Big Academy design system. This is the **only root DESIGN.md**; page and learning rules remain in `apps/<product>/PRODUCT.md`.
**Normative priority:** explicit designer-approved decisions and source-backed component contracts override exploratory prompts; Alex retains Writing business-logic authority. Latest Writing E-01 specification is `apps/writing/PRODUCT.md`, not archived visual demos.

**Status legend:** **[A]** designer-approved rule/principle; **[F]** from Figma source, awaiting rendered design acceptance; **[E]** candidate geometry or unapproved numeric mapping; **[T]** working implementation; **[Q]** requires decision. Approval of a rule never implies approval of every rendered component or production readiness.

## 1. Design Principles & Visual Language

### 1.1 Light, calm, intentionally expressive [A, 2026-10-20]

Big Academy uses **light minimalist composition with low visual noise**: white and restrained near-white surfaces, soft neutral boundaries, deliberate whitespace, legible typographic hierarchy, and selectively applied subtle elevation. Interaction should feel approachable and friendly for K–12 without flattening the learning hierarchy.

1. **Low visual noise is not low text contrast.** Backgrounds, decorations and dividers can be subtle; reading text, icons conveying actions, focus rings, validation, selected and disabled meanings must remain independently perceivable and accessibility-tested. Do not set all text to pale gray.
2. **Theme personality is retained.** White `#FFFFFF` task canvas and approved warm `#FEF9EF` Writing frame coexist with Big Academy brand ink `#133547` and Writing action accent `#B25415`. Neutral surfaces are the foundation, **not** a ban on approved semantic product colors. Never invent Reading's theme.
3. **Use roundness to express affordance, then hierarchy.** Greater curvature often feels softer and can distinguish a control's silhouette, but it **does not inherently guarantee more attention**. Size, contrast, placement, content and space establish actual priority. Pill-shaped primary and secondary buttons differentiate action role with color and content—not an arms race in curvature.
4. **Depth is earned, not universal.** Use a named Figma Elevation style only where the layering needs it. A shadow is not required merely because a surface is clickable.
5. **Spatial and type discipline.** 4px base / 8px main rhythm, Element First controls and Content First learning layouts, locally consistent icon/text optical alignment and approved sans-serif families.
6. **Accessibility outweighs stylistic softness.** Maintain discernible boundaries, keyboard focus, disabled and error states, stable touch targets, EN/ZH legibility and OS reduced-motion preferences.

### 1.2 Scope of these rules

- **Design principle:** defaults govern new BA Components and new feature instances; do not secretly migrate signed-off product geometry or change product state.
- **Executable values:** `packages/design-system/src/tokens.css` owns primitive → semantic → optional component aliases; CSS is the single numerical source of truth.
- **Authority:** Figma-backed component variants may deliberately differ from a foundation default; the exception must remain named (e.g. Button `radius="standard"`) and auditable in its Contract.
- **Composition:** passive content canvas may be square, low-radius or edge-to-edge. Product-specific arrangement belongs in PRODUCT.md.

## 2. Visual Foundations

#### 2.1.1 Color & Product Themes

#### 2.1.1 Known colors (do not invent other product themes)

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

#### 2.1.2 Approved theme scope — Decision B [A, 2026-10-19]

**Product Color Themes use accent colors plus subtle tinted backgrounds.** This is the approved architectural direction, not approval of any new individual hex values, color ramps or CSS selector API.

- **Product-themed:** primary action backgrounds and on-action foreground pairings, interactive selection, links and relevant emphasis; **allowed** low-intensity surface tints for product atmosphere and shell/background zones.
- **Shared:** neutral foundations, white functional content canvas where needed, text/readability, component geometry/behavior, spacing, typography principles and functional state meanings (success/error/warning/disabled/focus). Product identity must not silently recolor semantic success/error or reduce contrast.
- **Boundaries:** Writing remains A · Warm Frame + White Canvas; its warm background `#FEF9EF` is approved [A] at warm-1. Reading accent and all Reading tint values remain [Q]. The amount/placement of additional tints and exact colors are chosen by the UI/UX Designer in later visual review.
- **Implementation implication:** shared reusable components read semantic aliases such as `--ba-color-action-primary`, not a Writing-specific primitive. App-level product theme resolves those aliases. Exact token spelling/theme selector remains an [E] proposal until Token Architecture approval.

#### 2.1.3 Token Architecture — approved P0-2 [A, 2026-10-19]

**Approved architecture (not approval of every token value or name):**

1. **Primitive → Semantic → optional Component.** Primitive tokens store raw values; semantic tokens express usage and product-theme roles; component tokens are introduced only when a component needs a distinct reusable value. Example names: `--ba-color-ink-900` → `--ba-color-content-primary` → optional `--ba-topbar-title-color`.
2. **CSS custom properties (CSS Variables) are the current *single executable source of truth*.** Store and maintain token values in the shared design-system source; do **not** hand-maintain a competing JSON/Figma token value set. If cross-platform tooling is needed later, approve a migration and generate derivative outputs automatically.
3. **Product themes are selected at application/shell level; shared components consume semantic variables.** For example, a Writing app shell resolves a generic `--ba-color-action-primary` to the approved Writing accent. A reusable BAButton never needs `product="writing"` or a direct `--ba-writing-accent` dependency just to get its primary color.

**Scope / approval boundaries:** Theme B (accent + subtle tinted backgrounds) is approved [A]. The designer's Color System v0.2 decision in §2.1.4 approves the new names, eight color scales, Writing selector and approved warm surface; Reading and new unlisted color values remain [Q]. Reading accent remains TBD. Shared focus, disabled and feedback semantics cannot silently change meaning when product theme changes. Validate computed foreground/background contrast and keyboard focus in each product theme.


#### 2.1.4 Color System v0.2 — designer-approved [A, 2026-10-19]

**Direct approval recorded:** the UI/UX Designer requested that the remaining Big Academy palette be completed using the Geist-inspired ten-step role structure and approved without a separate testing/review round. This approves the **color architecture, eight solid-color scales, anchor values and role maps** described in `docs/design-system/COLOR_SYSTEM_v0.2.md`. It does **not** certify engineering behavior or production accessibility.

- Families: `neutral`, `warm`, `brand`, `writing`, `success`, `danger`, `warning`, `info`.
- Unified roles: 1–3 component background (default/hover/active); 4–6 border (default/hover/active); 7–8 strong fill (default/hover); 9–10 text/icon (secondary/primary).
- CSS values live only in `packages/design-system/src/tokens.css`. Semantic tokens drive components. Writing app/shell uses `data-ba-product="writing"` for action-theme alias overrides.
- Preserved existing anchors: brand `#133547` at level 10; Writing `#B25415` at level 7; white writing canvas `#FFFFFF`. Writing warm frame `#FEF9EF` is now approved at warm level 1. Existing `#C9B8B2` warm border, `#14AE5C` success border-active, and `#9B4F36` error strong fill are incorporated.
- Reading primary/tint remain undecided; do **not** invent them. Dark mode, alpha scales and component spacing/radius approvals remain separate.
- No component, browser, Storybook, or accessibility tests were run **as explicitly requested**. Color-system **design approval [A]** must not be confused with engineering `verified` or visual approval of unreviewed rendered components.

#### 2.2 Typography — Foundation [A]

**Approved direction:** One coherent typography system across **all** Big Academy products, with **expressive display/heading typography plus highly readable body/learning text**. UI labels use the shared text-role system rather than a separate product-specific font identity. The display and body roles **may** use different typefaces; two separate families are not mandatory.

#### Shared text roles (architecture approved; exact style values pending)

- **Display:** expressive brand/learning headlines, used selectively; preserve legibility for younger learners.
- **Heading:** lesson, page and sectional hierarchy, consistent with display intent without excessive decoration.
- **Body / Learning content:** optimized for reading, writing, task instructions and longer passages; legibility takes priority over style.
- **Label / Control:** buttons, tabs, task status, short interface labels; remain legible at practical sizes.
- **Supporting / Caption:** metadata and secondary copy that must remain accessible; not automatically "tiny."

#### English and Chinese

Both languages share the **same semantic text roles and hierarchy**, but can select different font families or fallbacks for correct CJK coverage, balance and rendering. A localized screen should be monolingual rather than duplicating EN/ZH side-by-side. Verify line breaks, CJK punctuation, long lesson names, zoom/text scaling and mixed-language input.

#### Approved font assignments [A, 2026-10-19]

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

#### 2.3 Spatial, Grid & Layout

#### Spatial, Grid & Layout System v0.2 [A principles, E values · 2026-10-19]

The UI/UX Designer approved a **4px base / 8px predominant spacing rhythm**, supported by **Element First / Content First** sizing, context-sensitive **Column / Modular / Baseline Grid**, and **Responsive / Adaptive / Strict** layout strategies. Full rules and statuses: `docs/design-system/SPATIAL_GRID_LAYOUT_SYSTEM_v0.2.md`.

- **[A]** Spacing records relationships between elements; it must not be confused with interactive hit targets, border widths, typography metrics or path/world geometry.
- **[A]** Page-level grids and overall placement belong to the application; shared components own only their internal layout. E-01's separately approved bottom-to-anchor staircase behavior in Writing PRODUCT.md overrides generic grid guidance.
- **[E]** Initial 0/4/8/12/16/24/32/48/64px primitives exist in shared CSS Tokens, along with three provisional semantic relationships for BAButton/BATaskProgress. Exact gutters, breakpoints, radii and large page spacings are not approved by this decision.
- **[T]** BAButton and BATaskProgress consume only token references whose current values reproduce their pre-existing 8px/16px/4px sizing. This is an integration proof, not a redesign.
- **Validation:** browser and Storybook evidence for touch/keyboard/zoom/long EN/ZH text is required for future numeric approvals. Do not round approved 0.5px borders or E-01 anchor positions to a 4px grid.


**Shared rules:**
- Prioritize usable task content above decoration. Remove duplicate nonfunctional section labels while retaining task prompts, feedback, progress, essential controls and accessible names [A].
- Layout tokens should document container padding, compact/regular/comfortable gaps, hit target sizing, response to narrow width and browser zoom [Q scale; [T] min hit target 44px in pilot].
- Responsive behavior is defined by available layout space and verified in browser; test desktop 1440×900 and tablet 1024×768, 834×1112. A 390px mobile smoke test is useful; mobile remains secondary for current Writing pilot.
- Shared layouts should be implemented as primitives/slots where reusable, not mandated as one rigid template.

### 2.4 Shape & Radius — role-first selection [A method + new defaults, E numbers]

**Canonical detail:** `docs/design-system/SHAPE_RADIUS_SYSTEM_v0.1.md`. The Geist-inspired principle remains: first classify **purpose, size, layer/elevation and nested visible insets**. This v0.5 decision adds stronger interactive defaults.

| Role | New default [A] | Numerical review boundary |
|---|---|---|
| **All ordinary BA action buttons** (Primary/Secondary/Tertiary) | **Full/Pill**, regardless of color or size | `--ba-radius-action-button: var(--ba-radius-full)`; Figma `standard` remains an explicit supported shape variant |
| **Icon-only action buttons** | **Circle**, visually square width and height | `--ba-radius-icon-button: var(--ba-radius-circle)`; maintain ≥44px usable hit area or documented exception |
| **Tabs & segmented selection** | Large/Full rounded group plus congruent selected surface | Both share Figma Segmented appearance and React Aria semantics appropriate to each |
| **Other clickable components** (cards, tiles, option surfaces, menu/nav items) | **Large Radius by default**, as a class of surface rather than automatic `9999px` | Candidate shared alias `--ba-radius-interactive-large: var(--ba-radius-16)`; bigger surfaced items may opt into 24px after component review |
| **Single-line text fields** | Soft, strongly rounded; **pill as a candidate**, not approved for every form factor | Text/caret, prefix/suffix, validation and long EN/ZH content decide actual geometry |
| **Textarea / long content, whole-page canvas, edge-to-edge regions, inline links, table cells** | Use context geometry; no enforced pill | A multi-line textarea need not be a capsule; inline text links have no standalone rounded rectangle |
| **Passive surfaces** | Size/material-dependent radius, not determined by whether the surface can be clicked incidentally | Existing 0/4/6/8/12/16/24px primitive numeric scale remains [E] |

**Principle clarification:** curvature strengthens a friendly affordance and differentiates controls from content, but actual visual attention depends on relative contrast, prominence, color, spacing and area. If everything is pill/large, radius ceases to distinguish hierarchy. Do **not** promote every passive card to clickable merely to get bigger corners.

**Concentric geometry:** when parent and child shapes have visible rounded outlines, use `outerRadius ≈ innerRadius + actualInset` as a starting heuristic; clip neither focus nor selected state. Within the same component family, preserve its shape across hover, pressed, focus, disabled unless an explicit shape variant is chosen. Never round a Writing staircase anchor or 0.5px ordinary border to the spacing grid.

**Approval boundary:** defaults above [A]; exact 16/24px mapping [E]. Do not silently rewrite existing `BAButton standard` instances, current input fields or Writing scene geometry. Newly authored button instances default Full, with a documented opt-in Standard.

### 2.5 Elevation & Effects — Figma source [F] / usage [E]

Canonical source: [Big Academy Figma Effect Styles, node 15:5](https://www.figma.com/design/06PPYhEQn3CqVYGlfopJWx/Big-Academy-Design-System?node-id=15-5). **Elevation communicates stacking and separation, not decoration.** All effect colors use base `rgb(7,46,81)`, spread `0`.

| Effect | Exact Figma-derived source geometry | Semantic implementation |
|---|---|---|
| Elevation/100 | 0 0 2px @5% + 0 2px 4px @10% | `--ba-effect-elevation-100` |
| Elevation/200 | 0 4px 16px @5% | `--ba-effect-elevation-200` |
| Elevation/300 | 0 2px 2px @5% + 0 8px 24px @10% | `--ba-effect-elevation-300` |
| Elevation/400 | 0 0 2px @15% + 0 8px 24px @15% | `--ba-effect-elevation-400` |
| Blur/Background/20 | Figma radius 20; exported CSS `blur(10px)` | `--ba-effect-blur-background-20` |

Figma blur radius and exported CSS pixels are **not presumed equivalent**; visually verify before approving. Button V2's **3px lower physical border** is not a generic shadow. Ordinary Writing boundaries remain **0.5 CSS px** except visible functional focus/validation outlines. Existing Figma effect values are source-backed; overlay/card-to-elevation mappings still need component review. No default blanket shadow.

### 2.6 Iconography — Iconoir [A]

**Approved source:** [Iconoir](https://iconoir.com/#icons) is the Big Academy system's standard icon library. React apps should use the maintained `iconoir-react` package through a Big Academy-facing `BAIcon` interface where practical, instead of independently introducing other general-purpose icon sets. Iconoir is distributed under the MIT license: preserve required copyright/license notices in redistributed copies.

**Boundaries:** This decision selects the icon family, **not** every icon glyph, icon-to-action mapping, line thickness, size, optical alignment or approved full icon component API. Establish a small accessible icon mapping in the component registry/Storybook during P1; meaningful icon-only controls require names and visible keyboard focus. Decorative assets (e.g. staircase platform illustrations or milestone artwork) are **not interchangeable with UI icons** and must be separately reviewed. Any exceptions or custom artwork should be tracked explicitly rather than silently mixing libraries.

## 3. Interaction Feedback & Motion

### 3.1 Separate **Target** from **Transition** [A, 2026-10-20]

**Interaction Target** = what a state looks like: target `scale`, `opacity`, `background`, `border`, and indicator position. **Motion Transition** = how the target is reached: Spring (`stiffness/damping/mass`) or CSS `duration/easing`. Do not mix target values into Spring definitions or pretend CSS Spring tokens already animate anything.

**State priority:** disabled/pending suppress hover/press → pressing overrides hover → hover overrides default. Keyboard `focus-visible` is orthogonal and may coexist without becoming pressing. Selection and validation are persistent semantic states independent of transient feedback.

| BAButton state | Scale target [A] | Opacity target [A] | Notes |
|---|---:|---:|---|
| Default | 1.00 | 1.00 | Natural assembly size |
| Hover | **1.02** | 1.00 | Does not shift layout or target |
| Pressing (pointer/key activation) | **0.95** | **1.00** | Preserve Figma Button V2; pressed wins over hover |
| Disabled / Pending | 1.00 | component-defined | No transient hover/press; visible accessible disabled/busy state |
| Focus-visible | no additional scale by default | no forced fade | Clear focus outline; not a held pressing state |

The rejected proposal `pressing = 1.03 + opacity 0.50` is **not** a Big Academy default. Do not use `opacity:0.5` across control text/icons/focus as the global pressed state; it may make learning controls illegible. For controls other than BAButton, scale/opacity targets are *component-specific candidates*, not automatically inherited from Button. In particular, **text fields do not keep scaling while focused**, Tabs/Segmented must preserve selected state, and drag surfaces need stable geometry.

Scale the **visual assembly about its center**, not the interactive hit region or layout box. A hit region keeps its geometry for pointer/touch/keyboard consistency; siblings must not reflow. Pressing ends correctly on release, cancel, pointer departure or disabled transition. Keep action semantics independent of animation completion.

**Executable target aliases:** `--ba-feedback-button-default-scale`, `--ba-feedback-button-hover-scale`, `--ba-feedback-button-press-scale`, `--ba-feedback-button-press-opacity` in shared `tokens.css`. These are BAButton targets, **not** universal CSS wildcard selectors.

### 3.2 Motion Transition — Interim Springs [A/T]

Existing temporary Open Claude UI Spring groups remain unchanged: `BOUNCY 600/30/1`, `SNAPPY 320/28/1`, `GENTLE 380/18/1`, `HEAVY_SNAP 1200/80/0.1`, bubble-enter `450/24/(mass unspecified)`, modal-enter `400/32/(mass unspecified)`. Exact source/purpose/limitations in `docs/design-system/MOTION_SYSTEM_v0.1.md`.

- **Spring** controls the way the target changes, not the target scale itself; runtime adapter is not yet shipped. Until then, existing CSS `200ms cubic-bezier(.2,0,0,1)` BAButton transitions remain temporary [T], not falsely described as Springs.
- Use one purposeful transition per relevant state change. Do not gate lesson completion or navigation permissions on animation.
- Respect `prefers-reduced-motion: reduce`: suppress nonessential scaling/travel/bounce while preserving visible immediate selection, focus and status. Preserve scroll, IME composition, keyboard, touch and pointer cancellation.
- Figma may specify distinct interactions (e.g. a moving segmented selected surface); preserve explicit component source behavior until designer approval of any change.

### 3.3 Nested interaction feedback ownership [A, 2026-10-20]

**One interaction has one primary action owner and one transient feedback owner.** A card containing a Start control is NOT an invitation to fire and animate both ancestors and descendants.

1. **Prefer semantic siblings, not interactive descendants:** avoid HTML `<button>` containing another `<button>`, or links wrapping nested interactive controls. A card action may use a stretched-link / separated button layout with nonoverlapping activation regions, respecting focus order.
2. **Owner resolution:** pointer / touch / keyboard activation on a nested child assigns press feedback and action to the **child**; ancestors must suppress their own press/hover visual feedback when the pointer is over that interactive descendant. Activating the parent's own empty area belongs to the parent.
3. **Event and visual separation:** `stopPropagation()` alone does **not** prevent ancestor CSS `:hover`, capture handlers or all keyboard handling. Choose a deliberate mechanism (separate DOM activation regions; scoped state/event ownership; appropriate `:has()` suppression when validated). Do not install universal event interception that blocks child behavior.
4. **Termination and precedence:** pointerup/pointercancel, movement outside ownership region, lost pointer capture, blur/cancel, disabled/unmount/scroll interruptions must release pressing state. A focused field remains focused without retaining press. Hover resumes if genuinely hovered; don't stack parent+child scale/opacity.
5. **Accessible equivalence:** each action has a distinguishable accessible name, focus order and keyboard behavior. Parent selection and child action semantics remain independent. Tests cover mouse, touch, pointer cancel, keyboard, reduced motion and nested disabled cases.
6. **No product side effects:** nested visual feedback may never decide Writing unlock, scoring, skip or navigation permissions. Product actions use the canonical PRODUCT/Component Contract handler.

Canonical implementation checklist: `docs/design-system/INTERACTION_FEEDBACK_SYSTEM_v0.1.md`. Component Contracts own documented exceptions. **This approval is a behavioral design contract, not a claim all existing nested cards have been audited or fixed.**

## 4. Component System & Implementation Boundaries

### 4.1 Code-first component boundaries [A]

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

### 4.2 Reusable feedback and component ownership

React Aria provides headless keyboard/pointer/a11y state; BA Components map semantic Tokens and state to presentation. Do **not** apply one global `:hover {transform:...}` selector to every clickable element. Use component-specific target profiles and a shared implementation pattern, with one visual owner per interaction.

- **BAButton** defaults `radius="full"`; Figma `radius="standard"` remains explicit. It uses its own visible assembly so hit testing does not reflow. An icon-only button must remain circular if its visual bounds are square.
- **BASegmentedControl** owns local radio choice; **BATabs** owns TabPanels and navigation. Their shapes and indicator visuals match per the designer decision, but their behavior and ARIA contracts are distinct.
- **Cards/tiles/choices** should be large-radius when clickable; do not set card-level scales in a way that magnifies an active nested button. Large-radius aliases are [E] for numeric values until stories/screenshots are signed off.
- **BAField/Textarea** needs stable typing geometry, caret and error/focus outline; inputs are not BAButton.
- Contract/Storybook must record states, hit vs visual layer, shape exceptions, nested ownership, touch/keyboard, and reduced motion. No component is visually approved solely by compilation.

## 5. Product Themes & Page Composition

Different products share foundations; product themes may provide allowed subtle accents and surfaces without changing the meanings of focus/success/error/disabled. Writing is **A — Warm Frame + White Canvas** [A]; Reading theme remains [Q].

**Do not duplicate page specs in this file:** full Writing UX/behavior rules belong in `apps/writing/PRODUCT.md`. E-01 is a **lower-left to upper-right** navigable diagonal staircase. Its current A/B exploration is **A separate stepped platforms vs B continuous slope with per-step anchor ticks**, with **card.bottom = pedestal/anchor Y**, independent of content height. The current header is **left Level title | geometrically centered React Aria Level Tabs | right language**. Both A and B share the same Writing palette and Alex state; neither is final visually. Do **not** revive archived dark/dusk A/B palettes, old platform/beam-as-color comparisons, fake unlock logic or card-top alignment.

Other Writing patterns: White task/paper on left, independently scrolling Coach at right, contextual bottom navigation outside Coach; Word Grid content switching inside writing space; P6 Hamburger row uses one shared visual layer for label and editable line. **The precise layout, task prompts and P1–P7 behavior must be read from Product and component contracts**, not recreated from this cross-product summary.

## 6. Governance, Sources & Review

### 6.1 Review authority and independent approval [A]

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

### 6.2 Change discipline and linked source documents

- **Source priority:** product/business decisions → product `PRODUCT.md`; shared design decisions → root `DESIGN.md` and linked foundation specs; actual component Props/Events/States → component Contract; live numerical values → shared CSS Tokens; implementation evidence/state → `docs/HANDOFF.md` and PRs. A Figma file supplies component visual evidence, but design acceptance still requires the UI/UX Designer.
- Detailed specs: `docs/design-system/COLOR_SYSTEM_v0.2.md`; `SPATIAL_GRID_LAYOUT_SYSTEM_v0.2.md`; `SHAPE_RADIUS_SYSTEM_v0.1.md`; `MOTION_SYSTEM_v0.1.md`; `INTERACTION_FEEDBACK_SYSTEM_v0.1.md`.
- Visual references: Figma Button node `30:2`; Segmented `806:3`; Elevation `15:5`. Tabs intentionally share Segmented appearance. Existing numeric styles remain source-derived or candidate until actual render sign-off.
- **Do:** reuse shared semantic Tokens, differentiate visual target and motion process, preserve accessible focus/contrast/EN-ZH, avoid nested double actions, document exception/approval in contracts.
- **Do not:** create a second Writing DESIGN.md, invent Reading colors, treat historical demos as live authority, convert opacity reduction into universal pressing, confuse button bottom depth with Elevation, duplicate product rules, or mark unreviewed visuals Final.
- **Evidence and status:** current engineering branches and test results are tracked in `docs/HANDOFF.md` / associated PRs instead of dated claims in the evergreen DESIGN.md. Visual acceptance and engineering verification remain independent.

