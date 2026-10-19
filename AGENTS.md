# Big Academy — Agent Operating Rules

## Authority and repository
- Canonical repository: `Yuzhwe/big-academy`. Never modify or use `RaoJing414` repositories, branches or forks.
- **UI/UX Designer:** owns final visual/major UX decisions. **Alex:** owns Writing learning rules, progression, scoring and business behavior. AI engineering agents implement, test, document and submit PRs, but do not approve their own visual candidates.
- **Agent A — System Builder:** owns global `/DESIGN.md`, shared design tokens, Big Academy Components, registry/contract validation, Storybook/test foundations and system integration. **Grokbot and other product coding agents:** implement Writing/product features on independent branches, consume approved contracts, and propose changes through PRs.
- No tool or agent is authorized to silently merge unapproved visual/product changes to `main`. Work on your own feature branch; prefer a PR.

## Two-document authoring model
- Exactly **one global repository-root `/DESIGN.md`** for design system foundations, typography, colors, Iconoir, shared components, accessibility and reusable patterns. **Do not create `apps/<product>/DESIGN.md`.**
- Each product has **one `apps/<product>/PRODUCT.md`** containing shared business rules **and** feature/page-specific interaction/layout/visual Specifications when needed (e.g. `apps/writing/PRODUCT.md#e-01--staircase`). No redundant `E-01.staircase.md` is required.
- Component Props/Events/States/Slots are owned by the registry/contracts and executable component code; CSS variables are current single executable Token source. Do not copy the same detailed rules across documents.
- Source hierarchy: approved Designer/Alex decisions > respective canonical PRODUCT/DESIGN specs > reviewed component contracts > historical prompts/demo. If two sources conflict, raise the conflict; **do not silently discard an approved requirement**.

## P0 approved architectural rules
1. Product-themed **accents and subtle tinted backgrounds**, with shared neutrals and functional statuses. Writing A · Warm Frame + White Canvas is the approved overarching direction; exact page styling remains subject to designer review. The historic dusk staircase may be shown **only as A/B exploration**.
2. **Primitive → Semantic → optional Component Tokens**, CSS custom properties as executable source, themes mapped by app shell. Shared BAButton should consume semantic aliases, not a Writing-only primitive (P1-B).
3. **English headings Dosis ExtraBold 800 only**, long English text Jost, Chinese headings Douyin (asset/license to verify), long Chinese text Noto Sans SC, all UI digits Dosis ExtraBold 800. Font loading, sizing and CJK fallback remain to verify.
4. Progressive componentization: React Aria as accessible behavior foundation; shared Big Academy Components are the product-facing API. Product composites stay in their apps until repeated cross-product patterns justify promotion.
5. Lightweight review: engineering `planned/implemented/verified` is separate from visual `temporary/in-review/approved`; Storybook, browser/a11y/responsive evidence and human visual approval are necessary before visual completion claims.

## Current feature and component boundaries
- **E-01 is a diagonal lower-left → upper-right staircase**, not a vertical list. Both A (dimensional) and B (Warm Frame) share the same actual Alex state/permissions; variants are **not visually approved**. Consult the combined E-01 section in `apps/writing/PRODUCT.md`.
- **LessonTopBar (BA-WR-001):** Back/title/tags left, actual task progress geometrically centered against the entire bar, no hamburger or visible right action; no permission bypass and skipped is distinct.
- **Iconoir** is the standard general-purpose icon library. Prefer a shared BAIcon mapping, respect the Iconoir MIT license; decorative artwork is a separate category.
- `apps/writing/source/alex-original.html` is the original Alex reference. Do not invent P4–P7 completion, pretend all 52 screens are built, or claim Skill v0.2 is imported if it is not.
- **Current integration branch:** `integration/p1-a-unified-baseline` combines code ancestry from PR #4/#6 and global specs from PR #2; it is a **candidate**. PR #5 Delivery Hub has a separate pinned source snapshot and must be synchronized/tested separately.
- Before review: `npm run check:docs`, `npm run typecheck`, `npm test`, `npm run test:layout`, relevant Storybook/browser screenshot/interaction checks, and an explicit record of remaining uncertainties in `docs/HANDOFF.md`.
