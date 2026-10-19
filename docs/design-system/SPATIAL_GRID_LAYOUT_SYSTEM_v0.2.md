# Big Academy — Spatial, Grid & Layout System v0.2

**Task:** BA-DS-SPACE-001 · Spatial, Grid & Layout System v0.2
**Decision date:** 2026-10-19
**Design owner:** UI/UX Designer
**Approval [A]:** combined design principles (Geist-style regularized spacing, 4px base / 8px primary rhythm; Element First / Content First; contextual grid choice; Responsive / Adaptive / Strict).
**Candidate [E]:** initial CSS numeric scale, semantic usage mappings, actual column count/gutters, container boundaries, and breakpoints; they are not signed-off component dimensions.
**Engineering:** not integrated into components or tested in browser. Existing approved Writing layout rules override generic examples.

## 1. Research background and attribution

- [Vercel: Teaching agents product design at Vercel](https://vercel.com/blog/teaching-agents-product-design-at-vercel): linting warns about arbitrary spacing that falls off a 4px grid and suggests a standard utility.
- [Elliot Dahl / Figma publication: Space, grids, and layouts](https://www.designsystems.com/space-grids-and-layouts/): uses an 8pt main scale and 4pt half-step, distinguishes Element First and Content First, describes column/modular/baseline grids and Adaptive/Responsive/Strict layouts.
- These are **reference principles**, not Vercel/Figma brand assets or a requirement to duplicate another company's CSS naming.

## 2. Spatial fundamentals [A]

- Base unit = **4 CSS px** for standard spacing; default design rhythm = **8 CSS px**. A 4px half-step supports icons, micro-gaps and dense control internals.
- Prefer a short supported scale over arbitrary local measurements. When an exceptional value is required, explain what constraint makes it necessary.
- Spacing tokens represent **relationships between elements**, not component geometry, border widths, font sizes, tap targets or arbitrary visual world coordinates.
- Maintain P0 Primitive → Semantic → optional Component hierarchy, with **CSS variables as the single executable value source**. UI components should consume semantic roles when stable; an unreviewed candidate number must never be labeled [A].

## 3. Initial numeric spacing candidates [E]

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

### Proposed semantic relationships [E]

- `inline-gap-compact`: icon + label or closely bound controls
- `control-content-gap`: button/field internals, **not** tap-target minimum
- `stack-gap-compact`: associated label, help and validation message
- `group-gap`: related cards/controls
- `region-gap`: major workspace sections
- `page-padding-inline`: responsive shell inset
- `overlay-inset`: safe margin from panel edges

Do not add all these semantic variables until real components need them; write the agreed value in CSS when implementing.

## 4. Sizing policies [A principles, E exact dimensions]

### Element First

For predictably sized controls (buttons, inputs, icon actions, progress targets), prioritize coherent touch/keyboard target size and layout alignment. The current pilot's `--ba-hit-min: 44px` is a **temporary implemented value**; it is not a spacing scale entry and this policy does not reapprove every control size.

### Content First

For variable content (lesson instructions, writing paper, Coach text, multilingual paragraphs, cards with dynamic descriptions), preserve content, line-wrap and adequate padding. Let height grow rather than clipping teaching content to a decorative step.

### Box model and exceptions

- Use `box-sizing: border-box` for measured UI geometry; distinguish outer measured box from content box in design-to-code review.
- Writing's approved **ordinary 0.5px border** remains a border token, not a violation of the 4px spacing grid. Focus rings may be thicker for accessibility.
- Typography line-height, optical alignment, hairlines, icons and animation/world coordinates are **not automatically rounded** to the 4px grid. Typography metrics remain separately governed and need EN/ZH review.
- `min-height`, `min-width` and content constraints take priority over cosmetic grid purity where accessibility or student learning content would suffer.

## 5. Grid rules

| Grid | When to use | Big Academy guidance |
|---|---|---|
| Column | broad page composition / major panels | Use meaningful tracks and gutters; do not force every page to 12 columns |
| Modular | repeated cards or explicit 2D collections | Use within bounded regions (e.g. optional lesson choice galleries); never use it to infer course eligibility |
| Baseline/typographic rhythm | text-heavy teaching interfaces | Align spacing/line-height deliberately, **without freezing unapproved type metrics** |

**Approved ownership:** app/page controls overall grid and panel placement, reusable components control internal layout. Product-specific geometry such as E-01 staircase positions stays with Writing and must not be replaced with a generic equal-size grid.

## 6. Layout behavior policies [A]

| Behavior | Meaning | Candidate application |
|---|---|---|
| Responsive | fluidly reflow within available space | ordinary shared controls, card content and page padding |
| Adaptive | change composition at an appropriate container/viewport threshold | Writing LessonWorkspace rearrangement when right Coach and left paper cannot remain usable side by side |
| Strict | preserve minimum usable dimension; clip/scroll **within a controlled region** | TaskProgress rail and structured writing/activity canvas |

Multiple modes may coexist on one screen. The responsive strategy uses available **container width and content needs**, not a blanket device-name heuristic. **Breakpoint numbers, columns and percentages are [E].**

## 7. Product rules that outrank generic spatial samples

- `BA-WR-001 LessonTopBar`: task progress stays geometrically centered against the whole header; long titles may truncate instead of displacing progress; lesson statuses and gating remain product-controlled.
- `BA-WR-002 LessonWorkspace`: Warm Frame + White Canvas; Coach content scrolls separately; bottom navigation remains outside Coach and anchored to the right column footer.
- `BA-WR-003 WordGrid`: tablet overlay only within left writing region and preserves caret/last writing line; never covers Coach/Footer.
- `BA-WR-005 StairLessonCard`: diagonal staircase position is scene/product geometry, not a general 4px spacing-grid obligation.
- Target checks when implementation begins: desktop 1440, tablet 1024/834, small-width 390; test English/Chinese long text, zoom, keyboard focus, pointer and touch behavior.

## 8. AI Agent constraints

1. Read root `DESIGN.md`, relevant `PRODUCT.md`, registry/contract and this document before any spacing/layout migration.
2. Use approved layout ownership, then a semantic spacing role, then an existing candidate spacing primitive in CSS.
3. Avoid magic-number proliferation; **do not blindly rewrite** every existing 10px/18px/44px/80px measurement. A measurement can represent component geometry rather than spacing.
4. Never make product-specific composition generic only because the same spatial scale is shared.
5. Changing established component dimensions, breakpoints or major geometry still requires designer review.
6. This proposal **does not grant blanket approval** of new component rendering, QA, merge, or Alex's product logic.
7. If automation/linting is added in P2, classify actual spacing declarations vs icons/borders/font geometry first; initially warn, then consider blocking only after audited exceptions.

## 9. Status and handoff

- **[A] Approved by user:** combined Vercel spacing regularity + Figma spatial/grid/layout concepts; 4px base and 8px dominant design rhythm; sizing and layout strategy.
- **[E] Proposed:** initial 0/4/8/12/16/24/32/48/64px numeric tokens; specific semantic alias mapping; breakpoints, gutters, columns, card/page paddings.
- **[T] Existing pilot:** `--ba-hit-min: 44px`, 80/76px TopBar, local spacing values remain unchanged.
- **Engineering:** CSS candidate variables are present but unused by current components. No component/browser/a11y/visual test run for this doc/token-scaffold change; do not claim production readiness.
- **Integration:** coordinate with Agent A, fold into canonical docs/implementation with reviewed PR ancestry. Do not modify other agents' working branches.

## 10. Future review criteria

When implementation proceeds, compare at least one Element First control and one Content First lesson card against approved UX; confirm responsive, adaptive and strict behavior using actual content and target widths. Confirm exception rationale and no regression to Coach/Footer/TopBar geometry. Record evidence and designer approval separately.
