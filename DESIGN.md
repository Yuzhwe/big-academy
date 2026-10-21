# Big Academy — DESIGN.md

**Edition:** Canonical Design System & Writing visual specification v1 · 2026-10-21
**Authority:** global visual and interaction design language; Writing-specific current visual directions.
**Status:** selected visual concepts are approved; numeric [E] candidates require designer review in rendered UI.
**Scope:** shared foundations plus Writing E-01 and Activity experience.

## Reading and authority rules

This is the only active root DESIGN.md. Do not treat old review rounds, deprecated theme alternatives, copied research briefs or historical experiments as competing instructions. PRODUCT.md owns scoring/navigation/learning behavior; this file owns presentation and visual states; tokens.css owns executable values; Component Contracts define component API. [A] is an approved decision, [E] is an implementation candidate that must not be represented as designer-validated. React Aria is the accessibility foundation; use actual Big Academy reusable components rather than replacing them with independently styled controls.

## 1. Design principles and product themes

Big Academy is a K–12 learning ecosystem. Maintain coherent typography, spacing, form controls, navigation, accessible state affordances, layouts and component quality across Writing, Reading and future experiences. Differentiate product identity **primarily through theme color**, without forcing different learning experiences into identical screen structures.

- **Global:** Design Tokens; semantic color roles; typography rhythm; spacing, shape, borders, focus, responsiveness, motion, components.
- **Theme:** product-owned accent/background mappings (e.g. Writing) and permitted decorative accents.
- **Product-specific composition:** Writing's staircase, Coach, paper workspace, Word Grid and Hamburger are distinct components/patterns. Their **page-specific requirements and UX specifications live together in `apps/writing/PRODUCT.md`**, their Props/Events/States live in the Component Registry, and their shared design foundations live **here**. Do not duplicate detailed page requirements or learning/scoring rules inside this global document.
- **Figma:** optional exploration, never a mandatory build input.
- **Implementation status:** the shared library and Storybook pilot are on `feat/grokbot-writing-topbar`. The theme there is explicitly *temporary* and **not visually approved**.

Status legend: **[A]** explicitly designer-approved; **[E]** exploration/candidate; **[R]** reference-only; **[T]** working temporary implementation; **[Q]** open decision.

## 2. Color foundations and theme roles

### 2.1 Known colors (do not invent other product themes)

| Role / candidate token | Value | Status | Use / caveat |
|---|---|---|---|
| `--ba-brand-dark` | `#133547` | [A] | Shared brand ink / key text |
| `--ba-writing-accent` | `#B25415` | [A] | Writing emphasis/primary action |
| `--ba-paper` | `#FFFFFF` | [A] | White content / writing canvas |
| `--ba-surface-warm` | `#FEF9EF` | [A] | Writing warm frame, warm-1 |
| `--ba-choice-border` | `#C9B8B2` | [A] | Warm-4 border value; component usage remains contract-specific |
| `--ba-success` | `#14AE5C` | [A] anchor | Success-6 border-active anchor. The global color role is not a white-text strong fill. The Writing Choice option candidate also uses this hex for the solid `correct` fill and the `shown` border/badge; that component use stays [E] until designer Approved |
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

## 3. Typography and internationalization

**Approved direction:** One coherent typography system across **all** Big Academy products, with **expressive display/heading typography plus highly readable body/learning text**. UI labels use the shared text-role system rather than a separate product-specific font identity. The display and body roles **may** use different typefaces; two separate families are not mandatory.

### Shared text roles (architecture approved; exact style values pending)

- **Display:** expressive brand/learning headlines, used selectively; preserve legibility for younger learners.
- **Heading:** lesson, page and sectional hierarchy, consistent with display intent without excessive decoration.
- **Body / Learning content:** optimized for reading, writing, task instructions and longer passages; legibility takes priority over style.
- **Label / Control:** buttons, tabs, task status, short interface labels; remain legible at practical sizes.
- **Supporting / Caption:** metadata and secondary copy that must remain accessible; not automatically "tiny."

### English and Chinese

Both locales share the **same semantic text roles and hierarchy**, but can select different font families or fallbacks for correct CJK coverage, balance and rendering. **Approved Writing localization behavior B:** when `zh` is selected, use a Chinese-language **interface** (navigation, buttons, instructional copy, Coach, status, accessibility labels and WordGrid category tabs), rather than presenting English interface text and its Chinese translation together. The exceptions are **original English learning material required for an English Writing activity**: quoted example sentences, options, tappable passage words, WordGrid English word/phrase cards, fixed English sentence frames, assessment material and learner-entered writing. These retain their original English spelling/order and are visually integrated into the otherwise Chinese interface. When `en` is selected, use English UI labels. Neither mode changes the curriculum data or grader. Verify English materials within Chinese UI, line breaks, CJK punctuation, long lesson names, zoom/text scaling and mixed-language input.

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

## 4. Spacing, grid and layout

### Spatial, Grid & Layout System v0.2 [A principles, E values · 2026-10-19]

The UI/UX Designer approved a **4px base / 8px predominant spacing rhythm**, supported by **Element First / Content First** sizing, context-sensitive **Column / Modular / Baseline Grid**, and **Responsive / Adaptive / Strict** layout strategies. Full rules and statuses: `root DESIGN.md §4 (complete Spacing/Grid/Layout guide)`.

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

### Writing page patterns [A unless noted]

**E-01 Staircase:** the **diagonal lower-left → upper-right learning-path interaction is the agreed target**; its page-specific requirements are in `apps/writing/PRODUCT.md` (one combined PRODUCT + page specification). Lesson number top-left on every card. Start / Continue / Review / Locked actions; preserve distinct skipped indicator. Insert one Unit Milestone after each Unit and Level Goal after final Unit. Their progress and confetti eligibility are product logic, not CSS. The Writing Staircase is separate platforms on the layered landscape: one platform per node, the card bottom on the platform top, and the full-bleed landscape behind the stage. Cards keep readable paper surfaces. Browser visual review is still required for implementation fidelity.

**Lesson Shell:** A · **Warm Frame + White Canvas**. White task/paper on left, Coach on right. Coach content scrolls independently; Previous plus one contextual Check / Next / Hand in control live in a bottom footer **outside Coach**, pinned to the right column bottom. Ordinary visual borders/dividers default **0.5 CSS px [A]**; thicker functional focus rings remain [T/Q] and must visibly distinguish focus.

**BA-WR-001 LessonTopBar [A structure, E dimensions]:** remove collapsible menu. Left: Back + current Lesson name + only necessary tags; centered: real current-Lesson task numbers and completion statuses; right: no visible action. Task group must be geometrically centered in the **whole bar**, regardless of left-side title length. Do not hard-code task count. Keep skipped distinguishable, and never determine access by visuals. Long titles must not push progress or cause hidden task navigation. 80px desktop / 76px tablet, warm `#FEF9EF`, task marker 36px and scroll rail are **pilot candidates [T]**, not approved measurements. Retain Activity Screen indicators; the Back itself is icon-only and does not show helper text. Removed menu capabilities remain a product-placement question.

**WordGrid:** task-gated inside left writing area. Multiple groups switch real vocabulary using tabs; active tab is visually connected to its panel. Tablet uses **on-demand overlay** in left area, preserving active caret and final writing line, and must not cover Coach/Footer.

**P6 Hamburger:** each row is **one shared visual layer**, label and editable content on same background. Focus changes whole-layer treatment and gives editable line a clear underline, no nested white input card. Distinguish P5 paragraph scaffold colors from P6 plan-layer palette; do not mix them.

**Other P1–P7 templates:** unique structure/feedback from Alex product source, visually informed by `apps/writing/PRODUCT.md §10 and root DESIGN.md`; that reference's simplified P1/P7 and generic completion logic **cannot override Alex**.

### 4.X Complete Spacing / Gap usage guide (normative within this DESIGN.md)

The following is incorporated in full to make this DESIGN.md sufficient for choosing existing spacing tokens and handling exceptions without following an external document. Approved principles [A] and candidate numeric mappings [E] remain visibly separate.


**Design owner:** UI/UX Designer
**Approval [A]:** combined design principles (Geist-style regularized spacing, 4px base / 8px primary rhythm; Element First / Content First; contextual grid choice; Responsive / Adaptive / Strict).
**Candidate [E]:** initial CSS numeric scale, semantic usage mappings, actual column count/gutters, container boundaries, and breakpoints; they are not signed-off component dimensions.
**Engineering:** not integrated into components or tested in browser. Existing approved Writing layout rules override generic examples.
#### 1. Research background and attribution
- [Vercel: Teaching agents product design at Vercel](https://vercel.com/blog/teaching-agents-product-design-at-vercel): linting warns about arbitrary spacing that falls off a 4px grid and suggests a standard utility.
- [Elliot Dahl / Figma publication: Space, grids, and layouts](https://www.designsystems.com/space-grids-and-layouts/): uses an 8pt main scale and 4pt half-step, distinguishes Element First and Content First, describes column/modular/baseline grids and Adaptive/Responsive/Strict layouts.
- These are **reference principles**, not Vercel/Figma brand assets or a requirement to duplicate another company's CSS naming.

#### 2. Spatial fundamentals [A]
- Base unit = **4 CSS px** for standard spacing; default design rhythm = **8 CSS px**. A 4px half-step supports icons, micro-gaps and dense control internals.
- Prefer a short supported scale over arbitrary local measurements. When an exceptional value is required, explain what constraint makes it necessary.
- Spacing tokens represent **relationships between elements**, not component geometry, border widths, font sizes, tap targets or arbitrary visual world coordinates.
- Maintain P0 Primitive → Semantic → optional Component hierarchy, with **CSS variables as the single executable value source**. UI components should consume semantic roles when stable; an unreviewed candidate number must never be labeled [A].

#### 3. Initial numeric spacing candidates [E]
The following is a **candidate CSS scale** in `packages/design-system/src/tokens.css`; no component is migrated yet.

| Token | Value | Intended first-use examples |
|---|---:|---|
| `--ba-space-0` | 0px | edge alignment/no gap |
| `--ba-space-1` | 4px | icon/label micro-gap |
| `--ba-space-2` | 8px | inline control gap |
| `--ba-space-3` | 12px | compact card/field interior |
| `--ba-space-4` | 16px | regular component padding |
| `--ba-space-6` | 24px | related component group |
| `--ba-space-8` | 32px | content-section grouping |
| `--ba-space-12` | 48px | large layout region |
| `--ba-space-16` | 64px | spacious section division |

Never interpret this table as an instruction to apply 64px to every page section or 16px to every component. Map a semantic relationship before choosing a value. Exact role-to-value assignments and responsive variants remain [E].

#### Proposed semantic relationships [E]

- `inline-gap-compact`: icon + label or closely bound controls
- `control-content-gap`: button/field internals, **not** tap-target minimum
- `stack-gap-compact`: associated label, help and validation message
- `group-gap`: related cards/controls
- `region-gap`: major workspace sections
- `page-padding-inline`: responsive shell inset
- `overlay-inset`: safe margin from panel edges

Do not add all these semantic variables until real components need them; write the agreed value in CSS when implementing.

#### 4. Sizing policies [A principles, E exact dimensions]
#### Element First

For predictably sized controls (buttons, inputs, icon actions, progress targets), prioritize coherent touch/keyboard target size and layout alignment. The current pilot's `--ba-hit-min: 44px` is a **temporary implemented value**; it is not a spacing scale entry and this policy does not reapprove every control size.

#### Content First

For variable content (lesson instructions, writing paper, Coach text, multilingual paragraphs, cards with dynamic descriptions), preserve content, line-wrap and adequate padding. Let height grow rather than clipping teaching content to a decorative step.

#### Box model and exceptions

- Use `box-sizing: border-box` for measured UI geometry; distinguish outer measured box from content box in design-to-code review.
- Writing's approved **ordinary 0.5px border** remains a border token, not a violation of the 4px spacing grid. Focus rings may be thicker for accessibility.
- Typography line-height, optical alignment, hairlines, icons and animation/world coordinates are **not automatically rounded** to the 4px grid. Typography metrics remain separately governed and need EN/ZH review.
- `min-height`, `min-width` and content constraints take priority over cosmetic grid purity where accessibility or student learning content would suffer.

#### 5. Grid rules
| Grid | When to use | Big Academy guidance |
|---|---|---|
| Column | broad page composition / major panels | Use meaningful tracks and gutters; do not force every page to 12 columns |
| Modular | repeated cards or explicit 2D collections | Use within bounded regions (e.g. optional lesson choice galleries); never use it to infer course eligibility |
| Baseline/typographic rhythm | text-heavy teaching interfaces | Align spacing/line-height deliberately, **without freezing unapproved type metrics** |

**Approved ownership:** app/page controls overall grid and panel placement, reusable components control internal layout. Product-specific geometry such as E-01 staircase positions stays with Writing and must not be replaced with a generic equal-size grid.

#### 6. Layout behavior policies [A]
| Behavior | Meaning | Candidate application |
|---|---|---|
| Responsive | fluidly reflow within available space | ordinary shared controls, card content and page padding |
| Adaptive | change composition at an appropriate container/viewport threshold | Writing LessonWorkspace rearrangement when right Coach and left paper cannot remain usable side by side |
| Strict | preserve minimum usable dimension; clip/scroll **within a controlled region** | TaskProgress rail and structured writing/activity canvas |

Multiple modes may coexist on one screen. The responsive strategy uses available **container width and content needs**, not a blanket device-name heuristic. **Breakpoint numbers, columns and percentages are [E].**

#### 7. Product rules that outrank generic spatial samples
- `BA-WR-001 LessonTopBar`: task progress stays geometrically centered against the whole header; long titles may truncate instead of displacing progress; lesson statuses and gating remain product-controlled.
- `BA-WR-002 LessonWorkspace`: Warm Frame + White Canvas; Coach content scrolls separately; bottom navigation remains outside Coach and anchored to the right column footer.
- `BA-WR-003 WordGrid`: tablet overlay only within left writing region and preserves caret/last writing line; never covers Coach/Footer.
- `BA-WR-005 StairLessonCard`: diagonal staircase position is scene/product geometry, not a general 4px spacing-grid obligation.
- Target checks when implementation begins: desktop 1440, tablet 1024/834, small-width 390; test English/Chinese long text, zoom, keyboard focus, pointer and touch behavior.

#### 8. AI Agent constraints
1. Read root `DESIGN.md`, relevant `PRODUCT.md`, registry/contract and this document before any spacing/layout migration.
2. Use approved layout ownership, then a semantic spacing role, then an existing candidate spacing primitive in CSS.
3. Avoid magic-number proliferation; **do not blindly rewrite** every existing 10px/18px/44px/80px measurement. A measurement can represent component geometry rather than spacing.
4. Never make product-specific composition generic only because the same spatial scale is shared.
5. Changing established component dimensions, breakpoints or major geometry still requires designer review.
6. This proposal **does not grant blanket approval** of new component rendering, QA, merge, or Alex's product logic.
7. If automation/linting is added in P2, classify actual spacing declarations vs icons/borders/font geometry first; initially warn, then consider blocking only after audited exceptions.

#### 9. Status and handoff
- **[A] Approved by user:** combined Vercel spacing regularity + Figma spatial/grid/layout concepts; 4px base and 8px dominant design rhythm; sizing and layout strategy.
- **[E] Proposed:** initial 0/4/8/12/16/24/32/48/64px numeric tokens; specific semantic alias mapping; breakpoints, gutters, columns, card/page paddings.
- **[T] Existing pilot:** `--ba-hit-min: 44px`, 80/76px TopBar, local spacing values remain unchanged.
- **Engineering:** CSS candidate variables are present but unused by current components. No component/browser/a11y/visual test run for this doc/token-scaffold change; do not claim production readiness.
- **Integration:** coordinate with Agent A, fold into canonical docs/implementation with reviewed PR ancestry. Do not modify other agents' working branches.

#### 10. Future review criteria
When implementation proceeds, compare at least one Element First control and one Content First lesson card against approved UX; confirm responsive, adaptive and strict behavior using actual content and target widths. Confirm exception rationale and no regression to Coach/Footer/TopBar geometry. Record evidence and designer approval separately.

## 5. Elevation and materials

**Source:** [Big Academy Design System · Figma node 15:5](https://www.figma.com/design/06PPYhEQn3CqVYGlfopJWx/Big-Academy-Design-System?node-id=15-5); `25:2` documentation, `25:8` / `25:11` / `25:14` / `25:17` / `25:20` effects.

Use **depth to communicate hierarchy, not decoration**. Consume the existing Figma Effect Styles through `--ba-elevation-100/200/300/400`; don't paste shadow values into individual component CSS. All colors have RGB `7 46 81`, at opacities 5% / 10% / 15% and spread 0.

| Figma effect | Exact source geometry | Executable CSS token |
|---|---|---|
| Elevation/100 | 0 0 2px 5% + 0 2px 4px 10% | `--ba-elevation-100` |
| Elevation/200 | 0 4px 16px 5% | `--ba-elevation-200` |
| Elevation/300 | 0 2px 2px 5% + 0 8px 24px 10% | `--ba-elevation-300` |
| Elevation/400 | 0 0 2px 15% + 0 8px 24px 15% | `--ba-elevation-400` |
| Blur/Background/20 | Background blur radius 20 in Figma; generated CSS `backdrop-blur(10px)` | `--ba-blur-background-20` |

**Blur ambiguity:** Figma reports an Effect radius of 20; Figma's code export uses CSS `blur(10px)`. We preserve the exported CSS 10px in code, and mark this translation for designer browser comparison rather than silently claiming the value is equivalent in pixels.

**Do not conflate effects:** Button V2's three-pixel lower physical stroke is **not** Elevation/100. Ordinary borders remain 0.5px as otherwise specified. White Paper on Warm Frame stays legible. Do not add elevation to all surfaces by default: select a named effect only when the visual layer calls for one. Tokens are source-derived [F]; product-specific usage mapping and Figma-to-browser signoff still await designer review.

### Tabs vs Segmented · approved styling equivalence [A, 2026-10-20]

`BATabs` / `BATabList` / `BATabPanel` reuse the **same segmented geometry and selected-surface CSS**, not two separately tuned appearances: sizes 36 / 50 / 70 / 90; Strong / Subtle; Full / Standard; Equal / Hug; 200ms selected surface, reduced-motion handling. They have different semantics: `BATabs` uses React Aria Tabs/TabList/Tab/TabPanel (one selected Tab controls the content panel), while `BASegmentedControl` uses React Aria RadioGroup for **local choice without panels**. Do not replace one with the other. Writing's Level Tab remains geometrically centered in the same-row header, and changing it only switches Level/path (never auto-enters Lesson).

## 6. Shape and radius

### BA-DS-RADIUS-001 · Shape & Radius System v0.1 [A principles, E values · 2026-10-19]

**Approved method:** Inspired by [Geist Materials](https://vercel.com/geist/materials), choose radius from **surface type, component size, visual/elevation role, and nested geometry**; never assign random rounded corners. Detailed decision tree and component mapping: `root DESIGN.md §6 (complete Shape/Radius guide)`.

1. **First classify the surface:** full-bleed canvas (square edge), on-page base/small/medium/large material, or floating tooltip/menu/modal/fullscreen. The bigger/floating tier *may* use a larger corner, but must not assume every overlay needs a large shadow.
2. **Then check the component size/variant:** small controls need restrained corners; regular/large controls may widen; explicit pills use a full capsule, circular task markers use a 50% radius on square boxes. Ordinary button and field sizes are not forced to be pills.
3. **Use shared semantic component/material roles** instead of manually writing `border-radius: 10px` in each new component. Responsive variants must retain intended shape identity; only change radius if the layout/presentation actually changes.
4. **Concentric/nested corners:** starting rule `outerRadius ≈ innerRadius + visibleInset` when both boundaries are visible. For example, a 12px outer radius plus a 4px inset commonly pairs with an 8px inner radius. Inspect asymmetric insets and clipping; this is a visual heuristic, not a universal equation.
5. **Focus/overflow/feedback first:** never clip focus outlines, reduce touch targets or hide error/selected states to satisfy a prettier corner. Preserve Writing `0.5px` ordinary borders as a separate concern.
6. **Material discipline:** choose the least raised surface that establishes hierarchy; avoid stacking two material treatments on the same element; coordinate radius with stroke, fill, shadow and z-index instead of treating radius as isolated decoration.
7. **Product boundaries:** product-specific geometry (Writing Staircase, Coach, UnitMilestone) remains under Writing layout and component contracts; no global radius migration without designer review.

**Candidate primitive scale [E]:** `0, 4, 6, 8, 12, 16, 24px`, `full=9999px`, `circle=50%` in `packages/design-system/src/tokens.css`. Initial **material candidates [E]**: base/small 6px; medium/large 12px; tooltip 6px; menu/modal 12px; fullscreen 16px. Initial component candidates [E]: regular Button/Field 8px, normal Card 12px, chips pill/full, square marker circle/50%; all detailed in the linked spec. **No final numeric Radius Scale has been approved.** Existing 999px pills and 10px progress corners remain [T] until separately reviewed.


### 6.X Complete Shape / Radius usage guide (normative within this DESIGN.md)

This guide is included in full so agents can select radius by surface, size, elevation and nesting without opening another file. The method is approved [A]; mapped numbers remain candidates [E] pending visual sign-off.


**Design approval [A]:** Adopt a Vercel Geist Materials-inspired principle: corner radius depends on **component type, component size, surface/elevation role, and parent-child geometry**.
**Candidate [E]:** All initial numeric radius values, aliases and mappings below. No global numeric Radius Scale has yet received final designer approval.
**Implementation:** Candidate CSS variables added to `packages/design-system/src/tokens.css`, not yet applied to rendered components.
**Benchmark:** [Vercel Geist Materials](https://vercel.com/geist/materials), used for its **surface role and radius association**, not as a copy of its full material/stroke/shadow definitions.
#### 1. Shape design principles [A]
1. **Purpose first:** choose the UI role and content hierarchy before selecting the radius number. Never generate random roundness just to make a component look friendly.
2. **Size aware:** in the same component family, smaller controls tend to use smaller corners, and spacious controls/panels can use wider corners, unless the component is an explicitly pill/circle geometry.
3. **Elevation aware:** ordinary surfaces should look restrained; more prominent/floating surfaces may use a more spacious contour. Elevation still requires a separate shadow/border decision; radius is not a substitute for elevation.
4. **Consistent semantics:** the same component/variant should retain the same radius across default, hover, active, disabled, focus and validation states unless its *shape variant* intentionally changes.
5. **Nested geometry:** maintain harmonious inset geometry. Avoid an exaggerated outer curve surrounding an incongruently square inset or overlapping clipped corners.
6. **Accessibility:** focus-visible outlines, 44px pilot hit regions, legible text, touch/keyboard behavior and overlay boundaries take precedence over visual roundness.
7. **Product intent:** shared controls are a cross-product foundation. Writing cards, Staircase milestones and decorative stage geometry may differ for approved product-specific reasons.
8. **Status separation:** values below are implementation candidates [E] and do not authorize replacing existing temporary radius values throughout Writing.

#### 2. Candidate primitive radius scale [E]
| CSS token | Candidate value | Intended meaning |
|---|---:|---|
| `--ba-radius-0` | 0px | square, e.g. canvas edge or justified full-bleed geometry |
| `--ba-radius-4` | 4px | very small localized control or inset |
| `--ba-radius-6` | 6px | compact control and base card / tooltip |
| `--ba-radius-8` | 8px | regular button/field surface |
| `--ba-radius-12` | 12px | larger card, raised surface, menu or modal |
| `--ba-radius-16` | 16px | large takeover surface |
| `--ba-radius-24` | 24px | deliberately soft large surface or child-friendly feature, case by case |
| `--ba-radius-full` | 9999px | capsule/pill geometry; never use for general content cards |
| `--ba-radius-circle` | 50% | only for truly square avatars/round marker boxes |

**Why 6px?** Geist Materials uses 6px for its base/small/tooltip types. Its medium/large/menu/modal types use 12px; fullscreen uses 16px. Those are **reference anchors**, not approved Big Academy geometry. Do not force every BA surface to mirror Vercel. See [Geist Materials](https://vercel.com/geist/materials).

#### 3. Material/surface hierarchy and default candidates [E]
| BA surface role | Geist inspiration | Radius token | Border/shadow guidance |
|---|---|---|---|
| `surface-base` | base, on page | 6px | calm, no unnecessary shadow; use light boundary where needed |
| `surface-small` | small, slightly raised | 6px | subtle separation without double strokes |
| `surface-medium` | medium, more raised | 12px | allow a raised look only when hierarchy calls for it |
| `surface-large` | large, further raised | 12px | large card/section distinct through content and spacing first |
| `floating-tooltip` | tooltip | 6px | lightweight overlay; correct semantic tooltip relationship |
| `floating-menu` | menu | 12px | independent overlay boundary; keyboard and pointer usable |
| `floating-modal` | modal | 12px | dialog semantics, focus management, adequate internal padding |
| `floating-fullscreen` | fullscreen | 16px | edge-aware; on small screens avoid pointless corner clipping |

**Material guidance approved [A]:** choose the lowest necessary surface/elevation treatment, avoid stacking multiple "material" treatments on the **same element**, align perceived elevation with actual stacking order, and do not rely on shadow alone to convey interaction state. **Exact shadow/stroke tokens remain [Q]** under the existing Elevation section.

#### 4. Component-specific selection rules [A method / E numbers]
| Component | Default candidate | Alternatives / caveats |
|---|---|---|
| BAButton | regular control 8px | compact 6px, large 12px; **pill variant** uses full radius |
| BAField / Textarea | 8px | large/multiline wrapper 12px; preserve text area and caret |
| BATabs / Segmented Control | track 12px or full depending approved layout | active indicator radius must match track/inset; do not randomly mix |
| BAChoice / options | Writing option row **24px** [E, pending designer Approved] | Same 24px for short and long rows. Full rules: §9 Writing Choice option |
| BAStatus / chip | full for pill label | radius 6px for a squarish status tile when context calls for it |
| LessonCard / learning card | 12px | compact 6px, larger featured 16px [E]; product artwork may use a distinct approved shape |
| Coach panel | 12px | right-side full-height workspace can have 0px at full-bleed edge |
| Tooltip / small helper | 6px | beware narrow viewport + arrow clipping |
| Popover/Menu | 12px | keep floating surface separate from underlying card |
| Dialog | 12px | edge-to-edge responsive presentation may set radius 0px on flush edges |
| Fullscreen/Takeover | 16px | actual viewport-edge treatment may require 0px |
| Circular task marker / Avatar | 50% | square width/height required for true circle |
| Long capsule button / progress rail | full | use only if intended pill geometry |

**Important:** these candidate values do not change existing BAButton pill `999px`, BATaskProgress 10px target, or TopBar geometry. Apply changes through the component's own reviewed styling/contracts in later implementation.

#### 5. Concentric corners (nested radius) rule [A method]
If an inner rounded surface sits inside a visible rounded parent, use the starting geometry:

`outerRadius ≈ innerRadius + visibleInset`

- **visibleInset** is the real distance between their shape edges, not the CSS `gap` between arbitrary siblings.
- Example candidate: 12px outer card, 4px inset → 8px inner card.
- When inset is asymmetric, corners might need independently tuned radii.
- If nesting is not visually exposed (e.g. an icon deep inside a flat content block), don't force a nested radius calculation.
- Never use negative corner radius. Border widths and clipping alter the actual visible silhouette; check the real outline.
- Inner surfaces should not visually cut through the outer curve; avoid unwanted clipping at small widths and large text scales.
- If multiple layers of cards yield excessive softness, flatten a layer rather than increasing all radii.

#### 6. State, responsive and touch rules
- Hover/pressed/disabled/focus/error should change *colors, outlines, or content* while retaining the same radius unless the interaction intentionally changes the surface role.
- Focus-visible rings must remain visible even when a container uses `overflow: hidden`; do not clip essential focus or error affordances.
- Do not scale radius directly with viewport width. Choose size/variant and only adjust for meaningful layout change.
- A full-bleed/edge-to-edge modal may use 0px for edges touching the viewport, with free corners retaining its intended radius where feasible.
- Radius never overrides minimum hit area or control alignment; `9999px` does not magically produce a true circle on non-square boxes.
- The Writing Warm Frame + White Canvas hierarchy stays intact. New radius values cannot silently change lesson navigation or Alex progress gating.

#### 7. Designer / Agent decision tree
1. **Is it a full-bleed canvas?** Use square edge/0px unless a designed floating region exists.
2. **Is it a floating overlay?** Choose tooltip/menu/modal/fullscreen category, then corresponding radius and accessibility semantics.
3. **Is it an on-page material?** Choose base/small/medium/large elevation role; pick lowest elevation that clearly separates content.
4. **Is it an atomic control?** Resolve component variant and size first; choose control radius or explicit pill/circle.
5. **Is it nested?** Reconcile visible inset and inner/outer radius; avoid double-stroking.
6. **Is it Writing-specific geometry?** Preserve product rules and seek design review before modifying major shape.
7. **Does the chosen radius conflict with readability/focus/clipping?** The functional/accessible behavior wins.
8. **Record exception:** if a component needs an off-scale or dynamic radius, explain why in its Contract/Story before reusing it globally.

#### 8. Examples (not rendered approval)
```css
/* Proposal only. Not applied to existing components by this PR. */
.ba-card { border-radius: var(--ba-radius-surface-medium); }
.ba-card__inset { border-radius: var(--ba-radius-8); } /* with a 4px actual inset */
.ba-menu { border-radius: var(--ba-radius-floating-menu); }
.ba-pill { border-radius: var(--ba-radius-full); }
.ba-avatar { aspect-ratio: 1; border-radius: var(--ba-radius-circle); }
```

#### 9. QA / change boundaries
- **[A]** Role-based, size-aware, elevation-aware and nesting-aware radius selection method.
- **[E]** Numeric radius scale and first mappings.
- **[T]** Existing implementations remain unchanged.
- **Engineering not verified:** CSS tokens are unused by existing components; no browser/Storybook/a11y tests or design screenshot approval are claimed.
- Changes to major UI geometry, public Props, product logic, semantic roles or approved Writing interactions still require appropriate designer/Alex review.

**Design reference:** Vercel Geist Materials, https://vercel.com/geist/materials

## 7. Motion and interaction feedback

### BA-DS-MOTION-001 · Interim Motion System v0.1 [A temporary adoption · 2026-10-19]

The UI/UX Designer explicitly chose to **temporarily reuse all Spring parameter groups in the third-party Open Claude UI `ClaudeMotionPresets.ts`** to save preparation time. Treat this as an interim baseline, **not** a claim that Anthropic formally published or endorsed those parameters. The inspected upstream `AGENTS.md` disagrees with the actual source file; **source-file values take precedence**. Reduced-motion requirements and the exact spring values are stated below and in the executable tokens; removed historical topic documents are not normative.

| Source Spring group | Stiffness | Damping | Mass | Initial candidate role |
|---|---:|---:|---:|---|
| `SPRING_BOUNCY` | 600 | 30 | 1.0 | buttons/small controls |
| `SPRING_SNAPPY` | 320 | 28 | 1.0 | popover/card reveals |
| `SPRING_GENTLE` | 380 | 18 | 1.0 | brief celebration micro-feedback |
| `SPRING_HEAVY_SNAP` | 1200 | 80 | 0.1 | panel/drag snapping |
| inline bubble-enter spring | 450 | 24 | **unspecified** | message/bubble reveal |
| inline modal-enter spring | 400 | 32 | **unspecified** | dialog reveal |

**Source rule:** Copy exact numerical values into CSS custom properties once; do not maintain conflicting hardcoded TS numeric tables. Inline masses were omitted upstream and must remain **unspecified**, not invented as explicit 1.0. CSS Tokens remain the current numerical source of truth; future JS animation adapters must resolve CSS values at runtime rather than duplicate constants. CSS values by themselves do not implement animation.

**Motion rules:** use springs only for purposeful state changes; avoid distracting movement during reading/writing/IME composition and do not gate business logic on animation completion. Respect `prefers-reduced-motion: reduce` with an equivalent immediate state change. Preserve accessible focus, dismissal, navigation, scroll and status feedback. Temporary spring adoption does **not** approve any specific rendered animation, component choreography, additional animation dependency or production release.

## 8. Component architecture, iconography and reusable patterns

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

### Writing ActivityScreenIndicator — current design direction (2026-10-20)

The TopBar and the anchored `All activity screens` popover **must reuse one ActivityScreenIndicator component**. Its large circle always displays the Dosis ExtraBold numeral; incomplete/selected/done/locked/skipped statuses use identical semantic state mapping in both locations. Done adds a smaller check-circle at the main circle bottom; Locked adds a smaller lock-circle. **Remove any connecting line between the number and the bottom status badge.** Keep the badge in a stable contact/slight-overlap position. Selected changes the main-circle fill, not the completion status itself. The popover may use regular rather than compact size, but never an unrelated rectangular numbered-card visual.

Popover is an accessible, nonmodal anchored overlay opened by the ellipsis indicator; use the existing floating surface radius category (initial candidate 12px) and semantic inset/group spacing tokens rather than arbitrary values. Show **every** screen number in a responsive grid, restrict height and scroll within the popover if needed, keeping the current screen in view. Display capacity is based on measured width (8/6/4 are review examples, not data limits); status and access permissions remain the responsibility of PRODUCT.md. Focus-visible, Escape dismissal, outside-click dismissal, and focus return are required. Do not use color alone to communicate status, and keep reveal/shown distinct in accessible names. Actual rendered dimensions, icon mapping, badges and shadow are subject to designer screenshot approval.

### E-01 Unit Card — folded paper corner

**Product-specific candidate, not a global Card default.** Preserve Writing A — Warm Frame + White Canvas, existing Unit colors, dimensions, content, rounded perimeter, lower anchor and state-specific appearance.

**Geometry:** a roughly 45° upper-right inward fold, represented by the solid paper body and a separate turned triangular flap, with restrained paper light/dark variation and a small soft local shadow. Do not substitute a simple cut-corner silhouette or dramatic 3D effect. Keep folds consistent across Units with proportional sizing bounded to avoid titles, progress and icons. Prefer CSS pseudo-elements/gradients and existing semantic surface/radius/elevation tokens, with pointer-events disabled on decoration. Do not clip focus rings or obscure text.

**Status and scope:** all Unit instances/states share the same folded anatomy; preserve done/current/locked distinctions. No changes to Lesson, Intro, Milestone, Goal, staircase geometry, behavior or gates. Validate Desktop/Tablet, responsive titles, EN/ZH, state styles, focus/hover/disabled and visual comparison. Designer reviews render before approval. New global Tokens need explicit proposal, not an automatic style migration.

## 9. Writing: current Staircase and Activity visual specification

This section specifies the current Writing visual system and its component-level implementation constraints. [A] means explicitly confirmed value/direction, [E] implementation candidate pending visual approval. No screenshot is required to implement the textual specification.

### E-01 full-bleed landscape background [A direction; source geometry]

The default Writing Staircase stage uses the layered landscape. Behind the entire scene, including header and traversable staircase, use this ordered stack (back-to-front): full-bleed sky, sun glow, far peaks, warm haze, drifting white clouds, middle hills and trees, near rolling grassy foreground and trees, small biplane, subdued grain. No cream rectangular top/footer overlay may cut the scene. Decorative layers aria-hidden, pointer-events:none and never mutate lesson state.

**Exact source-backed recorded backdrop values**, retained as initial candidate geometry and colors [E] from the supplied landscape specification and commit 913dbfe: base sky #B7DFF6; vertical sky gradient #B7DFF6 0%, #D7EEF8 34%, #FFF3CF 62%, #E7F6C8 100%. Glow centered at 62% x / 34% y, min(42vw,340px) × min(22vw,180px), radial rgba(255,236,186,.95) → rgba(255,244,214,.4) at 46% → transparent 72%. Far peak SVG viewBox 1600×460 at width 128%, left -14%, bottom 24%; back mountain #D9D6E6, front #C5CBE0, snow caps #F7F4EF. Haze bottom 22%, height 24%, fading to rgba(255,247,224,.55). Cloud SVG viewBox 1440×280 width 112%, top 92px, four soft elliptical clouds, slow drift 46 seconds translate (36px,6px). Middle hills 1600×420 width 136%, left -18%, bottom 6%, greens #C5D98A/#9DC56E/#B7D36A/#8FB86A/#A9C97A and five trees. Near hills 1600×280 width 144%, left -22%, bottom -36px, greens #7EAF4E/#D7E86E/#5F9844/#8FBF58/#4F863C and four trees. Tree trunks #8A6244 with round leafy clusters. Small biplane 168×78 at 58% x / top 108px, wings #E39A4E and #E7A45A, cream body #F6E7C2, soft white smoke. Grain opacity .18 mixed multiply with 140px fractalNoise tile. Parallax multipliers for peaks -.03, hills -.06, foreground -.10, clouds -.015 of staircase camera displacement. Plane drifts 28 seconds from (0,6px) to (64px,-16px). At <=834px plane 132×62 at left 62%, cloud top 84px; <=500px plane 112×52 at left 8% and top 96px, sun left 82% top 18%; trees scale .8. With reduced motion, no drifting/flight animations.

**Source inheritance boundary:** these values describe the landscape backdrop, not permanent global tokens. Terrace shape follows the Layered Landscape Terrace constraints below. This document defines the required visuals without needing access to images.

### E-01 terrain terraces — Layered Landscape Terrace [A concept, E geometry]

Every Lesson retains its original diagonal node/card anchor. Each node sits on a shallow **rounded terrain platform**: a wide soft-green top, a slightly darker middle landform, and optionally a narrow lowest side/shadow plane. Two to three flat overlapping organic/paper-cut curves at most. Candidate source terrace footprint 352×64px relative to 260px node, offset x=-46px, rounded top radius around 46% and small 12px dark-green depth; the **final proportion is a candidate**, adjust shallow height to avoid competing with cards. Source reference grass gradient #D7EB86 to #8FBF55 to #4E8A3C, darker edge #3C7434 and subtle rgba(36,78,32,.18) ambient shadow. Shrub/tree details decorative, sparse; keep card/CTA as strongest contrast and ensure terrain looks integrated with distant hills. Terrace layers must not block hit areas, clip at extremes or make a node look actionable when it is not. Status-dependent geometry must not shift. A fixed-width CSS/SVG layered profile with rounded curves is preferred to unstable content-shaped polygons; document exact selected candidate geometry in its token contract and keep visual approval pending.

### E-01 camera, cards and badges

Scene visible viewport: background fills entire available stage; controls remain accessible and do not cover traversable nodes. Camera clamp derived from **full bounds** of Intro, Unit, Lesson, Milestone and Goal including their decorative terraces, accounting for safe visual insets and top navigation. Verify far-left/lower and far-right/upper accessible extremes are completely visible under drag, wheel, arrows and Home/End. Do not solve by hiding overflow or changing course unlock gates.

**Unit paper fold:** preserve a real rounded folded *sheet*, not floating triangle. Card body and flap seam intersect at two exact points across an F×F square at its upper-right: (width-F,0) and (width,F), F candidate 32px bounded 26–40px [E]. Seam is continuous at approximately 45°. Under-fold cream #F8F1EA; flap face softly shaded #FFFDF9 → #E7D6C9; small shadow 0 2px 4px rgba(71,44,34,.12); flap tips smoothed ~3–4px, body radius continuous. Inner decorative border must terminate or mask beneath the folded region, never run through exposed flap. No hard 90-degree tip, alpha hole, detached patch, or clipping of title; same geometry in all states. Level/Intro and Unit informational cards use candidate #FFF9F2 paper and #DCC3AB subtle ornamental stroke distinct from white Lesson action cards; description 16px and plain text goals without bullets.

**Lesson Card:** reserve two title lines exactly, candidate 24px font with 30px line height and 60px reserved block, clamp overflow on second line and preserve full accessible label. One-line titles keep empty reserved line. Estimated time directly beneath aligned to same left edge, numeric value + localized unit, candidate 16px. CTA is the actual shared BAButton (70px height [A]), with working hover 1.02 scale, pressed .95, focus and reduced-motion behavior. Card radius and inner CTA pill radius follow **concentric inset relation**, outer radius ≈ inner radius + consistent card inset; review candidate geometry rather than independent radius values. Keep all status/card heights and bottom anchors stable.

**Number Seal + Attached Symbol [A direction, E geometry]:** dominant numbered circular seal in one fixed position (diameter candidate 54–56px); current blue fill with small attached current-point symbol, available warm outline with numeral only, completed warm-neutral number with a *small* green check badge attached to lower-right, locked desaturated number with attached lock badge. Badge candidate 20–24px with white 2px separating rim; anchor consistently overlaps the seal edge. No giant horizontal completed/locked capsule, no redundant visible "You're here" or "Finish prior unit" captions. Give full localized status/prerequisite accessible name and optional appropriate visually-hidden text; never rely solely on color. CTA communicates Start/Continue/Review or disabled Locked. Preserve existing gradings/gates.

### Writing Activity layout — restrained separation and rhythm

**One boundary, one primary separator** [A]. For adjacent functional regions use either a distinct surface fill, a border, or a divider as the primary separation method; do not stack all three on the same structural seam. Multiple treatments require a documented different functional purpose (e.g. active focus ring). General container border is one semantic step quieter than current warm-stroke candidate; keep strong **selected/correct/wrong/focus** borders unchanged on controls that use a border to show those states. Writing Choice options are specified separately: `selected`, `wrong` and `correct` use solid fills, and `shown` uses a green border. Do not indiscriminately reduce contrast on controls or change accessibility semantics.

Reduce **peer content-container gaps by one existing spacing-token step**, consistently for horizontal and vertical layout as applicable; leave text line-height, minimum control heights, touch areas and meaningful internal content padding alone. Never invent an arbitrary px offset. Audit each current gap's token and select the immediate next smaller existing spacing step; at smallest valid step keep unchanged and document exception.

Coach is an independently scrolling region with semantic tinted feedback cards. Footer is pinned outside Coach and visually transparent (no standalone background panel or redundant top divider), relying on whitespace and BAButton themselves; retain width:100%, minmax(0,1fr) minmax(0,2fr), gap 8px, both buttons height 70px, full-width children, with disabled Previous on first Screen. Do not remove necessary visible keyboard focus or semantic status. Task writing area stays white paper on warm page frame; nested regions only have one strong perimeter.

### Activity control geometry and states

Top Back: BAButton icon-only, 50×50 [A], visually white round surface and blue-gray chevron, with hover/pressed/focus/reduced motion. TopBar retains Lesson title/meta and a geometrically **whole-bar centered** ActivityScreenIndicator strip; the anchored All activity screens Popover renders the identical numbered-circle component. Done adds a small check-circle, locked a small lock-circle, with no connecting line and correct distinct selected vs progress status. Visible counts adapt to width; overall task list is data driven.

P2 Not yet vs Better: two clearly distinguished teaching panels, Better gently elevated via pale green surface/border and positive cue, not graded/correct-check feedback. P3 single/multi choice uses BA-UI-003. Radius, padding, icon and state colors are the Writing Choice option candidate below; the minimum hit height stays 50px, and selection does not reveal correctness. Tapword is an inline token, not this option row. WordGrid has white pill vocabulary, real multi-set connected sticky-note Tabs (no lone tab for one set). Hamburger three levels each have same two-tier title/support typographic roles. Coach Hint/Show me another BAButton Secondary. P7 uses only a prominent current question numeral in its own question area; screen readers receive full question context. Practice first checked correct triggers brief one-time Ribbons+Explosions (including Apply), not for P7 internal taps; full lesson success uses Ribbons 30 + three Explosions; respect reduced motion and never let animations mutate product records.

### Writing Choice option（选项）· BA-UI-003 / BAChoice [E · candidate / 待设计师 Approved · 2026-10-21]

**状态：** 候选。Joe 尚未把本规格标为 Approved。视觉以本节为准；评分、揭示时机、选项对错和 “Right answer” / “Your answer · right.” 等产品文案仍以 `apps/writing/PRODUCT.md`（Alex）为准。

This is the Writing single/multi choice option row. `single` and `multiple` share one chrome. Short (one line) and long (wrapped) copy share that same chrome. A selectable word token and a WordGrid word card are different controls.

#### Layout, left to right

1. Leading status icon: fixed **36×36 px**, `flex-shrink: 0`.
2. Gap between the icon column and the text block: **4 px** (row `gap`).
3. Text block: `flex: 1`, padding **8 px**, containing:
   - Option letter (A/B/C…): Dosis ExtraBold, `font-weight: 800` (or the project equivalent), **18 px**, `line-height: 20 px`, `white-space: nowrap`.
   - Gap from letter to body: **12 px**.
   - Body: Jost Medium, `font-weight: 500` (or the project equivalent), **18 px**, `line-height: 1.1`, may wrap. The global Jost weight question stays open; Medium is this component's candidate only.
4. Outer row padding: **4 px**.
5. Row width: fill the parent. A 500 px frame is a measurement reference only.
6. A one-line row measures about **46 px** (4 px padding + 36 px icon + 1 px borders). A wrapped row grows with the body. A roughly 3–4 line paragraph is about **106 px** as a reference height. `--ba-writing-choice-min-height` stays **50 px** (the PRODUCT hit-area floor). The hit area stays at least 50 px, and wrapped lines stay fully visible.

#### Shape

- Corner radius: **24 px** (`--ba-radius-24`) for both short and long rows.
- Overflow: clip row content to that radius. The `focus-visible` ring stays visible.
- Border: **1 px solid**. Color comes from the state table.

#### Colors and states

| State | Background | Border | Text (letter + body) | Leading icon |
|---|---|---|---|---|
| `default` / `idle` / unselected | `#FFFFFF` (`--ba-paper`) | `#C9B8B2` (`--ba-choice-border`) | `#133547` (`--ba-brand-dark`) | Empty circle, stroke about `#C9B8B2`, no fill |
| `selected` (before Check) | `#9B4F36` (`--ba-error`) | `#FFFFFF` (or the same as the fill edge) | `#FFFFFF` | Thick white ring, hollow, no X and no check |
| `wrong` (after Check; this option is the learner's wrong pick) | `#9B4F36` | `#FFFFFF` | `#FFFFFF` | White filled circle with an X in `#9B4F36` |
| `correct` (after Check; solid success on the right answer) | `#14AE5C` (`--ba-success`) | `#FFFFFF` | `#FFFFFF` | White circle with a check in `#14AE5C` |
| `shown` (outline reveal of the right answer) | `#FFFFFF` | `#14AE5C` | `#133547` | Solid `#14AE5C` circle with a white check |
| `dim` | Same as `default` | Same as `default` | Same as `default` | Same as `default` |

`dim` sets the whole option to **`opacity: 0.4`**. It keeps default chrome.

`selected` and `wrong` share the solid `#9B4F36` fill. The icon distinguishes them: white ring, or white disk plus X. `selected` is the pre-check choice. `correct` is the post-check solid success. `shown` is the green outline plus green badge.

`#14AE5C` remains the §2.1 success-6 border-active anchor for the global palette. This candidate also uses that hex for the `correct` fill and the `shown` border and badge.

The icon communicates state. The letter is text to the right of the icon.

PRODUCT.md chapter 8 still requires a revealed row to carry “Right answer” and a correct selected row to carry “Your answer · right.” When that product copy is present, the leading icon remains.

#### Icon

- Hit box: 36×36 px.
- Draw the glyph inside that box. Inner glyph about 24–32 px.
- Iconoir check / x may be used when the weight fits the disk. The circle, ring and colors in the table are the rule.

#### One line and wrapped lines

Same padding, gap, radius, icon size and type size.

The row and the text block use `align-items: flex-start`. The icon stays top-aligned with the first line. The body wraps (`min-width: 0`). The letter stays on one line.

A one-line row uses this same alignment. Its content already fills the band, so it reads as one option strip. PRODUCT.md chapter 8 still says a one-line option is vertically centered and a wrapped line keeps the letter with the first line. This candidate keeps the 50 px minimum, one radius and one type size, with the icon on the first line for both lengths.

#### Interaction

The component paints the state it is given. The session and PRODUCT.md own grading, tries and when a row becomes `correct`, `wrong`, `shown` or `dim`.

- Before Check, single-choice puts one option in `selected` and returns the others to `default`. Multiple-choice toggles per PRODUCT. Chosen rows use `selected`. Unchosen rows stay `default`. The color means choice, not correctness.
- A non-interactive option uses `dim` (opacity 0.4) or a disabled treatment PRODUCT already distinguishes from `dim`.
- After Check, render the session's state: the learner's wrong pick is `wrong`; a right answer shown as solid success is `correct`; a right answer shown as an outline reveal is `shown`; peers the session marks are `dim`.
- `focus-visible` keeps the Writing focus ring (`--ba-focus-ring`). A solid fill does not remove it.
- This candidate has no separate hover color. Keep a subtle existing hover, or leave hover unchanged, until a later visual decision.
- Keys 1–9 and A–I stay a PRODUCT / session concern. The option chrome follows the state table.

### Visual validation and status

Validate 1440×900, 1024×768, 834×1112, 390px, 100% and 200% zoom, English/Chinese, long titles, keyboard/touch, reduced motion, all lesson states. Compare two terrace layers vs heavy pillar absence, terrain/background hierarchy, rounded paper fold seam, seal icon anchoring, scenic continuity and edge visibility. Test quiet container separation, smaller tokenized gaps and footer transparency. All [E] visual dimensions, colors and minor motifs remain pending UI/UX Designer approval. This is a **documentation-only change**: no current implementation/test pass or approval is implied.

### Writing Activity visual exploration — chat-inspired learning UI

**Designer-selected exploration direction; rendered visual approval pending.** Use the clear visual hierarchy demonstrated in the recent eight-screen chat review: generous organized whitespace, readable prompt and supportive text, restrained white cards, soft rounded corners, unobtrusive separators, clearly identifiable clickable choices and writing surfaces, and accessible feedback states. Reconstruct this visual language independently using **Big Academy's approved font roles, theme tokens, 50px minimum answer touch targets and shared BAButton**; do not copy a chat interface's product navigation or replace the established Warm Frame + White Canvas shell, Coach split, fixed Footer, Staircase or grading behavior. Specific colors, font sizes, card radii, shadows, alignment and motion remain designer-review candidates until a rendered Activity demo is approved.

**Bilingual content is not a dual-language interface:** In Chinese mode the learner should see a Chinese prompt and Chinese action buttons alongside the original English sentence or vocabulary **only when that English is the material being learned**. Do not stack English and Chinese translations of the same UI prompt/Coach explanation. Keep the English answer/word card unaltered and use Chinese supporting interface labels. Set appropriate per-run or per-region language for pronunciation and screen-reader announcements: Chinese for UI chrome and Chinese instructional copy, English for the English passage, options, original word cards and editable Writing material. Long Chinese labels can wrap without shrinking the established 50px option minimum, touching focus outlines or moving the whole-bar-centered lesson progress.

**WordGrid — screenshot-aligned dedicated visual treatment:** multi-group vocabulary grids use softly colored *connected, raised paper/sticky-note-style tabs* positioned against the top edge of a rounded color-filled word-bank body. The **selected tab surface visually joins the word-bank body without a visible seam**; inactive groups remain distinct, legible and selectable. The body color corresponds to the active group; words/chunks appear as individual white pill cards with subtle separation and wrapped labels, sized for touch and keyboard access. The intended example has `Opinion / Nouns / Adjectives / Marks` tabs for Apply, with a warm peach Opinion surface; it is a **visual reference, not permission to replace source vocabulary or force the same color on every category**. Use group-specific semantic/candidate styling rather than permanently setting every WordGrid body to the old single soft-cyan token. With one group (e.g. Sentence set), show the cards but **do not render an isolated, meaningless one-item tab**.

**Isolation:** this connected-tab styling belongs to `BA-WR-003 WordGrid` only. Do not change global `BATabs` / `BASegmentedControl` default skin or their established React Aria keyboard and panel semantics. Switching a tab updates the visible word category, not the learner's checked-answer status; a word pill inserts content or invokes Word Build's dedicated action. Preserve focus/caret on insertion, keyboard traversal and accessible selected-tab state. Refer to PRODUCT.md chapter 12 for exactly which group IDs each activity receives.

### Consistent cross-Activity visual vocabulary and naming

Apply the following **one-name / one-role** vocabulary across all eight Writing Activity Screens, Storybook examples and component-facing specifications. A shared element changes its content or selection mode by variant, **not its canonical name, baseline anatomy or basic states**.

| Canonical name | Definition and cross-screen rule | Not the same as |
| --- | --- | --- |
| **LessonTopBar / Back** · BA-WR-001 | The top-left, icon-only Back returns one hierarchy level to the parent E-01 Staircase. This is the **only** Lesson exit control. | Footer Previous; P7 internal Back |
| **ActivityScreenIndicator** · BA-UI-006 (`BATaskProgress` in the registry/runtime) | Shared numbered navigation for the eight Lesson screens, including the identical circle in its anchored popover. | P7 internal Question pager |
| **LessonWorkspace** · BA-WR-002 | Warm Frame + White Canvas composition: left Activity area; right independently scrolling Coach and fixed Footer. | A self-contained single-column chat transcript |
| **Footer / Previous / primary action** | Bottom-right controls used only for questions and actions **inside the current Lesson**. First Screen Previous is disabled; never label it My path or make it return to E-01. | LessonTopBar Back |
| **Choice option** · BA-UI-003 | P3 single/multi list option. One chrome for both modes and both lengths: 24px radius, 36×36 leading status icon, letter plus body. Measurements and states are the Writing Choice option candidate, pending designer Approved. | **Word token**, **WordGrid word card** |
| **Selectable word token** | Inline P3 Tapword token inside the original sentence; clicking chooses an answer for later Check, never inserts a word. | WordGrid word card |
| **WordGrid** · BA-WR-003 | Writing vocabulary palette with named **WordGrid category tabs**, a connected **WordGrid body**, and selectable **word cards** for inserting into a writing region or executing a P4 ordered build. In 中文 UI, the category tab label is localized (观点 / 名词 / 形容词 / 标点), while task vocabulary remains the original English word/chunk. | Level Tabs (E-01); multiple-choice answers |
| **Coach / Coach feedback** | The right-hand learning companion, with distinct arrival instruction, hint, checked feedback and writing commentary treatments. | Selection state on an option itself |
| **Writing canvas / Frame blanks / Build bench** | Distinct task-area composites. Reuse shared typography, focus cues and card spacing; input semantics remain different. | One universal text input |
| **P7 Question pager** | Four internal question positions inside the single P7 Activity Screen. | TopBar's eight Activity Screens |

**Shared visual syntax [selected direction; exact sizes [E], with BAChoice measurements recorded as a candidate]:** use a legible prompt heading followed by supporting instruction and the principal interactive region, in that consistent order. Keep the white reading/answer surface prominent, with restrained card edges, soft surfaces and deliberate whitespace. Short and long choice rows are both 24px. The choice row uses `align-items: flex-start` for one line and for wrapped lines, so the 36px status icon and the letter stay with the first line. Word tokens, word cards and inputs keep their own alignment and focus treatment. The same `selected`, `correct`, `wrong`, `shown`, `dim`, `disabled` and `focus-visible` names mark the same distinctions. On a choice option, `selected` is pre-check and `correct` is the post-check solid success fill; `shown` is the green outline reveal. Before grading, color communicates choice, not correctness. Semantic Coach feedback stays a distinct surface from the selection.

**Activity variants use one shared language, not one identical layout:** P2 contrasts Not yet / Better teaching panels; P3 single and multi reuse the same list/card geometry with different choice semantics, while Tapword keeps text flowing as a sentence; P4 uses the same WordGrid anatomy for single Sentence set or multiple Frame Fill categories, but word-card insertion and grading gestures differ; P5 uses a spacious writing canvas plus a connected four-group WordGrid; P7 uses input appearances without practice hints or instant correctness markings. Do not insert a WordGrid on the P7 mastery screen to obtain visual uniformity.

**WordGrid anatomy and visual states:** place connected raised category tabs directly over the rounded word-bank body; the active tab and body share a coordinated softly colored surface. Inactive category colors are softer but still differentiated and readable. Place discrete white rounded pill word cards within the body; preserve generous card padding and flexible line breaks. Maintain clear `tab active`, `tab inactive`, `word available`, `word used` (when a guided set consumes one), `word disabled`, `focused` and `empty group` appearances. When the source offers a single Sentence set, omit only the useless one-tab strip; do not remove or replace the word bank. Do not change global BATabs defaults.

**Designer sign-off remains separate:** the cross-activity direction above is descriptive. It is not approval of every shadow, elevation or page mockup. The Writing Choice option section records concrete candidate colors, radius, type, icon and states for BA-UI-003. Those values are still [E] and need a rendered review before anyone marks them Approved.

### Writing Activity layout variants — canonical presentation matrix

The **Screen IDs and interaction requirements** are owned by `apps/writing/PRODUCT.md` chapter 12. Template IDs are product structures; Layout Variant IDs identify distinct renderings under a template; Component IDs identify reusable implementation contracts. Do not give a template a single universal layout or treat a component name as a template. Variants below describe **appearance and accessibility**, not grading.

| Layout Variant ID | Hierarchy / anatomy | Interaction presentation | Styling and responsive behavior |
| --- | --- | --- | --- |
| `P2.rule-pair.hamburger` | Readable teaching heading, weak/not-yet panel, prominent Better panel, three-layer hamburger/support hierarchy | Informational teaching only; no correct badge, checked border or success animation | White Canvas with quiet separation; Better has semantic soft-green support, not a graded-success treatment; all 3 hamburger tiers have heading/support; natural stacking on narrow widths |
| `P3.list.option.single` | Prompt → vertical option list → inline feedback zone | Shared BAChoice single-select. The leading status icon shows the state. The letter is text beside that icon. Focus ring stays visible. Checked states render only after Check | Min height 50px; radius 24px; one line and wrapped lines share chrome; icon stays on the first line; padding stays intact when lines wrap. Feedback appears only after Check. State is the icon together with the fill |
| `P3.passage.word.single` | Prompt → flowing passage with individually focusable word tokens → feedback | One highlighted token at a time, clearly distinguish selected/focus/wrong/revealed; accessible word token label | Passage line breaks naturally; do not force equal-width option cards; minimum usable touch target and keyboard focus for words; status must survive reflow. This token does not use the choice-option row anatomy |
| `P3.list.option.multi` | Prompt → option list → choose-count line → feedback | Same option chrome as single. Multiple mode toggles per PRODUCT | Same 50px minimum and 24px radius as single. Preserve all selected rows after an incorrect Check |
| `P4.build.word.guided-order` | Prompt → WordGrid palette → ordered build bench → progress/instructional cue | Clickable word pills with inserted sequence visually separate from palette; wrong token cue outside graded status | White vocabulary pills in a group-colored WordGrid body; connected sticky-style tabs only when multiple groups exist; wrong token nudge with text alternative; no generic Check button |
| `P4.fill.chunks.frame` | Prompt → fixed frame with 2 visibly editable blank zones → optional WordGrid → validation feedback | Clearly distinguish locked starter text, editable field focus and filled words; Check-driven | Line wrapping must preserve “because” and the two blanks; no clipping at 200% zoom; accessible label for each blank, keyboard caret and inserts |
| `P5.write.constraint-apply` | Prompt/tip → spacious writing canvas → Coach comments → submission control | Writing is primary, Coach notes secondary; busy/Reading state; no fake correct stamp when Move on | White writing area on warm frame plus four-group Opinion/Nouns/Adjectives/Marks WordGrid with connected category tabs; independently scrolling Coach; fixed transparent Footer; focused typing/caret remain visible and screen-reader feedback announced |
| `P7.assessment.3-auto-1-writing` | One large internal question number → one question body → internal question dots → Hand in footer | No teaching hints or per-question success checks; grading only after Hand in; result summary distinct from in-progress answers | Assessment pager does not add 4 top progress circles; questions reuse P3/P4 input appearances without practice feedback; compact responsive internal nav |

**Shared wrapper, all variants:** BA-WR-001 LessonTopBar, BA-WR-002 LessonWorkspace, BA-UI-006 ActivityScreenIndicator and BA-UI-001 BAButton are shared composition roots. Feedback presentation may consume BA-UI-007 BAStatus, but a planned component must not be falsely reported as implemented. Use BA-UI-003 BAChoice for option-based lists when implemented; word-token control and writing bench are template internal composites until separately assigned IDs. BA-WR-003 WordGrid owns palette/groups/tabs, **not the grader**.

**State-appearance mapping:** Names stay stable across activities. For a Writing choice option, use the candidate table in **Writing Choice option · BA-UI-003 / BAChoice** (pending designer Approved):

| State | Choice-option appearance |
|---|---|
| `idle` / `default` | White `#FFFFFF`, border `#C9B8B2`, text `#133547`, empty circle |
| `selected` | Pre-check choice. Solid `#9B4F36`, white text, white ring |
| `wrong` | After grading. Same brown fill and white text as `selected`, white disk and `#9B4F36` X |
| `correct` | After grading. Solid `#14AE5C`, white text, white disk and `#14AE5C` check |
| `shown` | Outline reveal. White fill, `#14AE5C` border, text `#133547`, solid `#14AE5C` disk and white check |
| `dim` | Default chrome at `opacity: 0.4` |
| `disabled` | Separate product state. `dim`, or an existing disabled treatment |
| `focus-visible` | Writing focus ring stays visible on solid fills |
| `busy` | Async submit. Does not change learning status |
| `reduced-motion` | Removes nonessential movement without hiding the state |

Choice states follow the candidate table above. Other controls keep their own surfaces. Coach revealed feedback stays its own surface, separate from the choice `shown` row.

**Layout quality gates:** 1440×900, 1024×768, 834×1112 and 390px; 100% and 200% zoom; English and Chinese copy including long wrap, pointer/touch/keyboard, focus and reduced motion. One primary separator per structural boundary; peer container gaps reduce exactly one existing spacing-token step (never arbitrary px); transparent pinned action Footer outside Coach with Previous:Primary width 1:2, gap 8px, height 70px each; Screen 1 Previous disabled. Avoid overlays covering caret, option feedback, Footer or the last line of writing.

**Ownership and status:** the selection of variant semantics is [A] per authored source/product rules. The BAChoice option measurements in this file are a visual candidate [E], pending designer Approved. Other precise colors, local radii, shadow/border weights and layouts that have not been designer-reviewed remain [E]. No screenshot, test pass or visual approval is implied by this documentation.

## 10. Global do / don't

**Do:** reuse semantic Tokens; keep one approved visual language; make product accents thematic; preserve CJK and accessibility; show states using labels/icons/geometry as well as colors; make business logic independent of UI styling; update Contract and Storybook alongside component API changes.

**Don't:** create a separate `apps/writing/DESIGN.md` or duplicate the E-01 page specification outside `apps/writing/PRODUCT.md`; hard-code Writing accent in shared BAButton; invent Reading colors; treat source visual Demo measurements as approved; visually merge skipped with done; add menu or duplicate title; use confetti to mutate progression; freeze v1.0 without designer screenshot/interaction review.

## 11. Evidence, approval and open visual questions

- **Benchmark:** `docs/design-system/BENCHMARK_AND_TOKEN_GAP_AUDIT_v0.1.md`.
- **Actual executable token source:** `packages/design-system/src/tokens.css` is present in this review branch, inherited from the R3 specification. Its values are recorded, but this does not prove that frontend components consume every token or that candidate styles have passed browser visual QA.
- **Approved theme scope:** B · product accent + light tinted surfaces; exact tint values pending.
- **Approved Token Architecture:** Primitive → Semantic → optional Component; shared CSS Variables as the single current executable source; themes set by the app/shell and consumed semantically by shared components.
- **Approved Typography Foundation and font roles:** EN headings Dosis ExtraBold 800; EN long text Jost; ZH headings Douyin (asset/family naming to verify); ZH long text Noto Sans SC; **all UI numerals Dosis ExtraBold 800**. Font size/line-height/other weights, licensing and runtime font loading remain unverified.
- **Approved Component Architecture:** A · progressively build shared UI primitives and product components; extract Shared Patterns after real cross-product reuse, never by speculative mass abstraction.
- **Approved Design Governance:** A · lightweight; significant changes reviewed, ordinary agent implementation autonomous; separate engineering and visual acceptance, GitHub PR/HANDOFF records.
- **Current verification gaps:** confirm component consumption of token aliases, responsive sizing and status colors; validate contrast and rendered elevation; implement and test the Motion Runtime (numerical spring parameters already exist, but do not execute animations on their own). Do not infer absence of an entire token family merely because integration evidence is missing.
- **Gate:** this rewritten canonical specification is under UI/UX Designer review; implementation approval separately requires a running component, Storybook states and browser QA. Component contract and product docs remain authoritative for UI interfaces and learning rules.
