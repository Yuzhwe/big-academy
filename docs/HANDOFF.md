# HANDOFF — GitHub bootstrap (2026-10-19)

## Confirmed
- New private repository: `Yuzhwe/big-academy` (renamed from `big-academy-writing`).
- `main` reserved for approved work; `feat/writing-lesson-topbar` is the active feature branch. Legacy empty `feat/lesson-topbar` remains untouched.
- Writing scope: E-01 + G2-O nine lessons, 52 activity screens; original Alex logic is product source.
- Single visual direction: A Warm Frame + White Canvas; dark wood B explicitly rejected.
- Milestone: one per Unit, same displayed completion rule for all Unit kinds, source-recognized Skill Skip counts; first new-achievement return to staircase auto-celebrates once and user may click to celebrate again.
- Top Bar: menu removed, back/lesson info left, task and completion state centered geometrically, right slot invisible. Task navigation uses source-provided permissions.
- React Aria chosen for headless interaction foundation; component tokens, registry, validation, Storybook and UI/UX designer sign-off are required.

## Status of this GitHub branch
`feat/writing-lesson-topbar` began as foundation documents. The pilot implementation lives on `feat/grokbot-writing-topbar` and is recorded in `apps/writing/docs/PILOT_RUNTIME.md`.

`BA-UI-001`, `BA-UI-006`, and `BA-WR-001` are `implemented` with a temporary foundation theme. They are not `validated` and not visually approved. The other ten registry entries stay `planned`. `PRODUCT.md` and `DESIGN.md` are still drafts, not frozen v1.0.

`alex-original.html` is in `apps/writing/source/` as a read-only product reference. The Top Bar preview does not call `Pages.canOpen`. The canonical Skill v0.2 is still not imported.

## Next steps (do in this order)
1. Import the verified v0.2 prototype-to-hifi Skill. Do not reuse old completed lesson HTML styling.
2. Designer reviews the Storybook stories and the screenshots in `apps/writing/docs/evidence/` before any visual approval.
3. Bind `BATaskProgress` to actual Alex `Pages.canOpen` through a product adapter; verify no bypass. Re-home Index / Analytics / Menu behaviors that are no longer on the bar.
4. Do not merge to `main` until runtime evidence and explicit designer sign-off both exist.

## Known open issues
Level Goal exact criterion, concurrent new milestones, skip revocation and celebration receipts, removal/re-homing of former menu features, and remaining 52-activity visual QA.

## Unified DESIGN.md decision (2026-10-19)

Designer approved exactly **one** repository-root `DESIGN.md` spanning all products. Product identity is primarily expressed by colors via semantic product theme tokens; unique product components/layouts remain distinct. Old `apps/writing/DESIGN.md` is moved into the root document on `docs/unified-design-and-token-audit`, with research & token gap audit at `docs/design-system/BENCHMARK_AND_TOKEN_GAP_AUDIT_v0.1.md`. This documents an architecture decision, not a visual v1.0 signoff. Grokbot's TopBar engineering branch remains untouched and must reconcile paths/semantic token aliases before integration.

## Product Theme decision B (approved, 2026-10-19)

The UI/UX Designer selected **B: Product accent + subtle tinted backgrounds**. This approves the *scope* of thematic differences, **not** new palette values or complete theme tokens. Shared neutrals, functional statuses, readability and component interaction remain unified. `#B25415` is Writing's approved accent, `#FEF9EF` remains a candidate warm surface, and Reading colors are unset. Decision recorded in repository-root `DESIGN.md` on the documentation branch. **Next:** implement the now-approved Token Architecture using a separate reviewed engineering change; do not yet modify Grokbot's live CSS without agreeing the exact alias contract. Existing independent implementation branch is untouched.

## Token Architecture approval — P0-2 (2026-10-19)

Designer confirmed: **Primitive → Semantic → optional Component Tokens**, **CSS Variables as the single executable token source for now**, and **product theme selection at the application/shell level** (shared components read semantic token roles, not product identifiers). Scope is approved, but exact CSS names/selector, color ramps, type/spacing numeric values and design-signoff on styling remain candidates. Reading colors remain TBD. Continue typography-foundation discussion; do not prematurely change Grokbot implementation branch. Update the single root `DESIGN.md` and keep `main` unchanged until reviewed.

## Typography Foundation approval — P0-3 (2026-10-19)

UI/UX Designer confirmed **A: expressive display/heading type plus highly readable body and learning text**, as **one shared typography-role system across all Big Academy products**. English and Chinese use matching semantic roles but may require different family/fallback choices for CJK coverage and quality. Specific typefaces, assets/licenses, font sizes, weights, line heights and full scale remain **open for later design review**. Dosis/Jost/Douyin Sans/Noto Sans SC are reference options only, not approved fonts. Existing temporary system fonts remain [T]. The only canonical spec is repository-root `DESIGN.md`; no app-specific DESIGN.md. **Next P0 discussion: Component Architecture** (shared primitives vs product composites, promotion criteria, contract ownership). Grokbot implementation branch remains untouched.

## Component Architecture approval — P0-4 (2026-10-19)

The UI/UX Designer confirmed **A · Progressive Componentization**: build only the shared Big Academy UI foundations needed now; product-specific components remain inside their apps; promote genuinely recurring structures into Shared Patterns only after concrete reuse across products. Every reusable component still needs stable ID, Contract (Props/Events/States/Slots as applicable), Storybook states, responsive/a11y and verification evidence. No speculative full-component-library build required. Current `BA-UI-006 BATaskProgress` is physically shared for the Writing pilot, but its suitability beyond Writing is still unproven and should be reviewed without breaking existing IDs/contracts. This records architecture only; Grokbot's implementation branch and `main` are untouched. **Next:** P0-5 Design Governance now confirmed; follow the P1 plan below.

## Design Governance approval — P0-5 (2026-10-19)

Designer confirmed **A · lightweight governance**. AI Agents may autonomously implement routine changes consistent with approved contracts. Significant component API/learning-behavior/UX/approved visual-token changes need relevant Alex and/or UI/UX Designer approval. Engineering `planned/implemented/verified` is tracked separately from visual `temporary/in-review/approved`. Technical passing tests do **not** confer visual sign-off. Use independent branches, GitHub Pull Requests and these repository documents for decisions/evidence; do not auto-merge unapproved changes. This is policy approval only: registry dual-status fields, CI and PR templates remain future work.

## P0 complete → P1 entry (2026-10-19)

All five P0 architecture choices are accepted and summarized in `docs/design-system/P1_IMPLEMENTATION_PLAN_v0.1.md`. This **does not mean** the unified `DESIGN.md`, color ramp, numerical Typography, existing temporary UI appearance or TopBar integration has received final approval. Active design document branch is `docs/unified-design-and-token-audit`; Grokbot's branch remains `feat/grokbot-writing-topbar`. Proposed P1 first: integrate the single root design spec through reviewed PR ancestry, then semantic tokens on the engineering branch, then implementation/visual status & TopBar Stories QA. No changes were made to Grokbot's branch or `main` by this documentation update.
