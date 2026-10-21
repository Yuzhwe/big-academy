# Big Academy — HANDOFF (current)

**Baseline:** v0.1 · 2026-10-20
**Branch:** main is the single source for new work.

## Authorities

- `apps/writing/PRODUCT.md` — product rules and Writing-specific page behavior.
- `DESIGN.md` — global visual language, including complete Spacing/Gap and Radius decision rules.
- `packages/design-system/src/tokens.css` — executable token values. Candidate values marked [E] still require visual approval.
- `apps/writing/contracts/components.json` — component interfaces and status; latest contracts may be ahead of component code.

## Delivery scope

Only **L2/G2-O Lesson 1: Topic sentences (eight screens)** is in scope for high-fidelity Writing v1. E-01 Staircase supports entry/return, and Lesson End reflects real mastered/unmastered assessment status.

## Known gaps

- Existing UI remains a pilot. Inspect implementation against current PRODUCT and DESIGN; do not infer a fully working eight-screen flow from existing sample demos.
- BATaskProgress / ActivityScreenIndicator and the anchored All activity screens popover require implementation parity with the current contract and design.
- Unit Folded Corner is a Writing-specific candidate documented in PRODUCT, DESIGN and BA-WR-005 contract; visual approval pending.
- Writing Choice option (BA-UI-003 / BAChoice): visible row is letter, body, and leading icon (correct and shown use the check icon); border is 1px; click scale is hover 1.02 and pressed 0.95. Colors, type, and 24px radius remain a candidate pending designer Approved.
- E-01 path landscape is **v2-terraces**. Artwork is `apps/writing/public/path/v2-terraces/` (`hill-1-foreground.png`, `hill-2-mid.png`, `cloud.png`). PRODUCT.md owns layer order, asset ids, and the parallax experience. DESIGN.md owns alpha compositing, placement, and candidate sky/parallax numbers pending Joe Approved. The path page is not implemented in this change.
- Validate P2–P7 grading, second tries/shown, Apply, P7 second assessment set, Back/Continue/refresh, keyboard/touch, EN/ZH, zoom and responsive screens.
- Run `npm run check:docs`, `npm run typecheck`, `npm test`, `npm run build`, relevant browser/Storybook tests; record actual pass/fail evidence. No previous QA results are asserted as proof for this baseline.

## Workflow

Create independent feature branches from `main`, implement against the four authoritative assets, then request designer review before merging. Historical stacked PRs and other agents' prototypes are reference-only and should not be used as new baselines.
