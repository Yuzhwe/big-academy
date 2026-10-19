# Big Academy — P0 Decision Summary & P1 Implementation Plan v0.1

**Date:** 2026-10-19  
**Authority:** explicitly accepted architecture decisions of the UI/UX Designer.  
**Location:** documentation branch `docs/unified-design-and-token-audit`; **not merged into main**.  
**Normative design document:** only repo-root `/DESIGN.md`. This plan is a task/evidence tracker, **not another DESIGN.md**.

## 1. Five accepted P0 decisions [A]

| ID | Decision | Approved scope | Not yet decided |
|---|---|---|---|
| P0-1 · Product Color Themes | **B · product accent + subtle light tinted backgrounds.** Shared neutrals, status semantics and accessible contrast remain coherent. Writing accent `#B25415` approved. | Theme scope and existing Writing accent | Reading palette, Writing surface `#FEF9EF` still candidate, tint placement/intensity |
| P0-2 · Token Architecture | **Primitive → Semantic → optional Component; CSS custom properties are current single executable source; app-level theme selection, shared components consume semantic roles.** | Architecture and ownership | Exact token names, full palette, CSS theme selector, tooling |
| P0-3 · Typography | **A · expressive headings + readable bodies**, shared roles; **EN headings Dosis ExtraBold 800, EN long body Jost, ZH headings Douyin, ZH long body Noto Sans SC; all UI digits Dosis ExtraBold 800, no other Dosis weights.** | Role strategy **and font-family assignments** | Font sizes/line heights, non-Dosis weights, exact Douyin asset identifier, license/assets/loading |
| P0-4 · Component Architecture | **A · progressive componentization.** Build needed shared primitives, keep product-specific composites within apps, extract Shared Patterns after real reuse. | Reuse/promotion approach | Full future component catalog; `BATaskProgress` multi-product status |
| P0-5 · Design Governance | **A · lightweight.** Agent autonomy for routine work, review significant changes; GitHub PR and existing specs; separate Engineering and Visual status. | Authority, review gates, dual-state principle | Exact registry schema changes, CI policies, formal approval tooling |

**These are architecture approvals, not visual approval of the prototype or theme implementation.** Preserve Alex's product authority and the designer's final visual approval.

## 2. Implementation lanes, priority and acceptance evidence

### P1-A · Consolidate the source of truth (highest priority, before cross-agent integration)

**Owner:** documentation/spec agent proposes; repository owner reviews merge; Grokbot notified before integrating with engineering.

- Review doc branch's `/DESIGN.md` as the *sole* Big Academy visual spec. It supersedes the duplicate `apps/writing/DESIGN.md` when merged.
- Preserve each app's `PRODUCT.md` and stable component IDs/contracts; avoid copying business behavior into /DESIGN.md.
- Align `AGENTS.md`, `docs/HANDOFF.md` and affected README references. Preserve Grokbot's active code/Storybook edits.
- Choose branch merge order with Grokbot so documentation and code do not inadvertently overwrite each other.
- **Acceptance:** a PR showing one canonical DESIGN.md, no remaining conflicting references in target branch, no lost original Alex prototype or TopBar code. **Do not merge without review.**

### P1-B · Semantic Token proof with Writing (first engineering change)

**Owner:** Grokbot on a separate engineering branch/PR; ChatGPT can review Token usage and evidence; UI/UX Designer approves visual changes.

- Use `packages/design-system/src/tokens.css` as current executable source, once engineering and doc branches are reconciled.
- Add minimal primitive + semantic aliases for at least content ink, white canvas, primary action/on-action, candidate light surface, focus and disabled treatment; theme identity is selected by the app/shell. **Exact API/selector and placeholder aliases are candidates until reviewed.**
- Refactor reusable `BAButton` and any reusable `BATaskProgress` styling away from direct `--ba-writing-accent` references, keeping Writing's *computed appearance* and behavior unchanged unless designer explicitly requests otherwise.
- Do not invent Reading palette or create hundreds of extra shades. Mark `#FEF9EF` as candidate and other temporary colors as temporary.
- **Acceptance:** code/test/build pass, Storybook states unchanged, browser computed primary/foreground/background values checked, contrast and focus reviewed; no Writing-specific accent dependency in shared primitives, product themes resolve semantic roles.

### P1-C · Component Registry status + review evidence

**Owner:** Grokbot can implement backwards-compatible schema changes and tests in its own PR; ChatGPT reviews contracts; designer confirms visual state.

- Keep stable Component IDs and current Props/Events/States. Treat classification (`primitive`/`composite`) separately from engineering/visual approval.
- Propose backwards-compatible metadata: `engineeringStatus = planned|implemented|verified`; `visualStatus = temporary|in-review|approved`. Avoid rewriting legacy `status` silently or claiming migration already done.
- Storybook must show representative TopBar states: default, EN/ZH, long title, 18 tasks, done/current/available/locked/skipped, 1440/1024/834 widths; regression test true viewport-relative center and no locked navigation.
- **Acceptance:** validation script/tests exercise contract fields; screenshots & QA evidence attached; every implemented item accurately reports visual state, known gaps and approvals.

### P1-D · Typography implementation and verification (typeface assignments approved, measurements still open)

**Owner:** design/spec agent maintains `/DESIGN.md`; Grokbot implements on its own reviewed branch; UI/UX Designer approves actual renderings.

- Keep shared semantic roles Display, Heading, Body/Learning, Label/Control and Supporting/Caption.
- **Required family mapping [A]:** EN headings **Dosis ExtraBold 800 only**; EN long body **Jost**; ZH headings **Douyin** (verify precise asset/family name; prior documentation says Douyin Sans); ZH long body **Noto Sans SC**; **all UI digits use Dosis ExtraBold 800**, including digits embedded in Chinese labels/reading copy where practical.
- **Dosis must never be applied at another weight**. Avoid synthetic font weights; verify actual loaded face in the browser. Other font weights remain for designer review.
- Until font sources/licenses/assets are verified, keep temporary fallback fonts clearly marked [T]; **do not assert that approved typography is visually rendered** just because a CSS `font-family` is declared.
- Test in Storybook: EN titles; ZH titles; long EN/ZH reading; UI task numerals, progress counters and numbers embedded in mixed-script labels; verify fallback, wrapping, accessibility/zoom. Do not auto-segment student-authored editable text without UX/product review.
- **Acceptance:** correct applied family/weight once assets are available, evidenced computed styles/rendered screenshots; documented font license and loading/fallback; no premature size/line-height freeze.

### P1-E · TopBar product adapter (separate product gate, not a visual task)

**Owner:** engineer proposes adapter; **Alex** validates course logic when required; designer reviews UX effects.

- Map fixture-local indexes and statuses to Alex's canonical `Pages.canOpen` / completion / `Skip` behavior. No new progress store or unlock shortcut.
- Track former menu actions (Index, Analytics etc.) as Pending Alex if they need a new home; visual redesign cannot silently delete business functions.
- **Acceptance:** source-based navigation behavior and regression tests, design review of header and interaction, no conflation between passing storybook mocks and real course integration.

## 3. Scope consciously deferred

- Full color scales, Reading accents/tints, custom brand fonts, complete typography numeric scale, spacing/radius/elevation/motion catalog, dark mode, broad Pattern Library, token compiler/JSON conversion.
- P1 scope may grow through real component discoveries, but **no agent may silently mark unknown values or product rules approved**.

## 4. Working agreements

- GitHub: `Yuzhwe/big-academy` only. Never use `RaoJing414` repositories or branches.
- Active code: `feat/grokbot-writing-topbar`; current design doc work: `docs/unified-design-and-token-audit`; base: `feat/writing-lesson-topbar`. `main` remains separate until review.
- Significant changes need a PR that links relevant evidence and owner signoff. Routine accepted-contract work can proceed autonomously.
- Component work may be technically implemented without visual approval; these are separate checks.
- After each accepted decision or PR, update `docs/HANDOFF.md` and the canonical `/DESIGN.md` where applicable.

## 5. First actionable handoff

1. **Design/spec:** submit the unified DESIGN.md/document branch for review against the engineering branch's current file tree; resolve stale duplicate paths.
2. **Grokbot:** start the smallest semantic-color migration with Writing as proof, but coordinate ancestry and keep current Storybook/React tests, screenshots and branch intact.
3. **Designer:** review the TopBar's current Storybook render and decide only blocking UI issues; exact fonts and full token scales can wait.
