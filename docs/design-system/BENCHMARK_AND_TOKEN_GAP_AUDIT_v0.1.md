# Big Academy — DESIGN.md Benchmark & Token Gap Audit v0.1

**Scope:** first-pass source-backed assessment, 2026-10-19. This is a review artifact, not an approved visual specification.  
**Branches checked:** `feat/writing-lesson-topbar` (document baseline) and `feat/grokbot-writing-topbar` (runtime pilot). Did **not** edit Grokbot's implementation branch.

## Decision recorded

One `/DESIGN.md` for all Big Academy products; product identity primarily driven by theme colors. Product-specific component/pattern sections belong inside the same document. Business behavior stays in `apps/<product>/PRODUCT.md`; component-specific Props/States/Events stay in registry/contracts. Do **not** create another DESIGN.md inside individual apps.

## Product Theme scope approval (2026-10-19)

**[A] Chosen:** B · **Accent + subtle tinted surfaces** for product differentiation, while base neutral palette and interaction/accessibility semantics remain common. This resolves the former first open choice about theme scope; tint placement/opacity and each product's exact colors remain open. Details are recorded in the single root `DESIGN.md`.

## Token Architecture approval — P0-2 (2026-10-19)

**[A] Confirmed:** (1) Primitive → Semantic → optional Component Tokens; (2) CSS Variables as the **only current executable value source**; (3) application/shell-owned product theme selection, consumed through semantic role aliases by shared components. This resolves the *architecture*, not exact token naming, CSS theme selector, typography scale, contrast pairs or implementation sign-off. The current Grokbot pilot CSS still contains Writing-specific references in shared BAButton; migrating those is implementation work with testing.

## Typography Foundation approval — P0-3 (2026-10-19)

**[A] Confirmed:** one cross-product semantic text-role hierarchy: expressive **Display/Heading** and readability-first **Body/Learning**, with Label/Control and Caption/Supporting roles for interface text. English/Chinese share roles; font families/fallbacks can differ to support CJK. Final fonts, numerical typography tokens, license/bundling choices and visual signoff are [Q]. Existing Dosis/Jost/Douyin Sans/Noto Sans SC are **reference-only**.

## 1. External benchmark (what to learn, not what to copy)

| Reference | Verified structure/principle | Big Academy adaptation |
|---|---|---|
| Google Labs DESIGN.md format | Human-readable design rationale + optional structured token frontmatter; eight sections: Overview, Colors, Typography, Layout, Elevation, Shapes, Components, Do's and Don'ts | Organize one root DESIGN.md around this navigable hierarchy, but use actual repo CSS/JSON Tokens as executable data instead of copying values manually into competing sources |
| Adobe Spectrum design tokens | Primitive / Semantic / Component-specific tiers; prioritize semantic use case over raw color; component-specific tokens sparingly | Add product-color aliases to a shared semantic API; avoid making one product's accent the global Button default |
| GitHub Primer | Foundations, UI patterns, components and responsive guidance separate conceptual jobs | Keep shared component ID registry plus Writing-specific patterns within one DESIGN.md, and use Storybook/browser examples rather than more overlapping spec documents |
| DTCG 2025.10 | Stable exchange format with typed, structured values and cross-tool compatibility | Consider token source JSON with generated CSS **later**, after confirming conversion tooling. Do not maintain duplicated unsynchronized JSON and CSS now |

Sources (official):
- https://github.com/google-labs-code/design.md/blob/main/docs/spec.md
- https://spectrum.adobe.com/foundations/design-data/design-tokens
- https://primer.github.io/design/
- https://www.designtokens.org/TR/2025.10/

## 2. Actual token inventory

**Latest inspected CSS:** `feat/grokbot-writing-topbar:packages/design-system/src/tokens.css`. Thirteen `:root` custom properties:

- **Approved from recorded design decisions [A]:** `--ba-brand-dark`, `--ba-writing-accent`, `--ba-paper`, `--ba-border-weight`.
- **Candidate [E]:** `--ba-surface-warm`.
- **Temporary [T]:** `--ba-border-temporary`, `--ba-control-border`, `--ba-muted`, `--ba-muted-surface`, `--ba-focus-ring`, `--ba-font-sans`, `--ba-hit-min`, `--ba-focus-width`.

This count is **13 CSS properties in the pilot**, not a claim that the full historic Big Academy token library has only 13. A wider audit of any separate design-system repository/files is still required if brought into scope.

Component CSS (Grokbot pilot) uses literal dimensions such as `80px`, `76px`, `44px`, `36px`, `18px`, `14px`, `12px`, `11px`, `4px` gap, `10px` radius, `999px` pill, `120ms` transition and `800ms` spinner. Some are viable provisional component defaults; none should silently become a global approved scale.

## 3. Gap matrix

| Area | Evidence | Finding | Priority |
|---|---|---|---|
| Product Theme semantics | Shared `BAButton.css` directly calls `--ba-writing-accent` | Shared BA primitive will inherit Writing color when Reading adopts it; needs semantic `--ba-color-action-primary` alias and per-product theme resolver | **P0** |
| Semantic surface and text | Mainly raw `--ba-paper`, `--ba-brand-dark` | Shared `content-primary`, `surface-canvas`, `on-action`, `focus`, `disabled` roles not codified | **P0** |
| Token classification/status | CSS comment marks [A]/[E]/temporary | Useful start; statuses must stay visible in audit and designer approval record | P0 |
| Typography | **P0 role architecture approved:** Display/Heading expressive, Body/Learning readable, shared EN/ZH roles; pilot has a single fallback stack and CSS literal sizes | Final families, CJK fonts/licensing, numerical role scales, line-height and responsive behavior remain P1 | P1 |
| Spacing & sizing | `--ba-hit-min`, most dimensions local | Need minimal spacing/sizing semantic scale and Top Bar component candidates with tested responsive behavior | P1 |
| Radius & border | `--ba-border-weight`, hard-coded component corners and control strokes | Design-rationale gap: ordinary 0.5px vs input/action/focus strong boundaries; radius types still unspecified | P1 |
| Feedback colors | Correct / wrong from reference prompt only | Need AA-compatible foreground/background, don't rely on color alone; success green as text is unverified | P1 |
| Motion & elevation | 120ms button transitions, 800ms spinner, no shared tokens | Define minimal reduced-motion contract and candidate duration/elevation tiers | P2 |
| Component state mappings | BAButton/TaskProgress implementation & Storybook stories on Grokbot branch | Browser QA evidence exists but designer visual signoff pending; registry status should not jump to approved | P0 |
| Writing-specific layout | TopBar with absolute centering; other P1-P7 unimplemented | Keep BA-WR-001 contract; other layouts remain product components, not global styles | P1 |
| Governance | Two potential DESIGN.md paths | Move Writing draft into one repo-root DESIGN.md, correct all references, never diverge | **P0** |

## 4. First tranche, intentionally small

**First pass:** one DESIGN.md at root; **approved** token layers and CSS-only source; **implement** semantic Writing accent mapping in a reviewed engineering PR, preserving status labels and temporary visual treatment.

**Second pass:** migrate BAButton/BATaskProgress to semantic accent without changing appearance; add minimal focus/foreground/bg palette; run existing tests and screenshots on the **engineering branch** with its owner. Keep exact visual styles temporary until designer accepts them.

**Third pass:** propose typography, spacing, radius and responsive tokens after the designer reviews real BA-WR-001 Storybook states, rather than generating hundreds of unused variables.

## 5. Review and validation gate

- Docs: one canonical `DESIGN.md`, all agents linked to it, old duplicate removed.
- Tokens: CSS effective color pairs and product theme mapping demonstrably correct; no Writing literal in shared reusable BA components.
- Component: stories demonstrate EN/ZH, locked, skipped, long title, 18 tasks, 834/1024 tablet; geometry remains centered; focus and touch behavior checked.
- Ownership: DESIGN.md and Tokens are **draft/candidate** until UI Designer expressly approves them. No phase claimed complete from a static check alone.

## 6. Open design choices

- Product theme scope **resolved: B [A]**. Token architecture **resolved: Primitive → Semantic → optional Component, CSS Variables source, application-level themes [A]**. Still open: exact background tint zones/intensity, token aliases and selector naming.
- Typography role strategy is **resolved: A [A]**; exact EN/ZH font families, scale and legal bundling remain open.
- Will other products share a common neutral palette with Writing? Suggested yes; not yet locked.
- Does a product Theme need light/dark mode from day one? No current authorization, defer.
