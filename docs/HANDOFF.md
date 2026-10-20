# Big Academy — HANDOFF (current)

**Baseline:** v0.1 · 2026-10-20
**Branch:** `cursor/writing-lesson1-hifi-main-2c7c` from latest `main`. Do not merge the paused spec-branch line.

## Authorities

- `apps/writing/PRODUCT.md` — product rules and Writing-specific page behavior. Unchanged on this branch.
- `DESIGN.md` — global visual language. Unchanged on this branch.
- `packages/design-system/src/tokens.css` — executable token values. Candidate values marked [E] still require visual approval.
- `apps/writing/contracts/components.json` — component interfaces and status. Visual status stays in review.

## Delivery scope

L2/G2-O Lesson 1: Topic sentences, eight activity screens, from E-01 through Lesson End.

Implemented on the main-based feature branch:

- Staircase default is separate platforms (A). The A/B review switch remains.
- Unit cards use a Writing-only folded-corner candidate. Visual approval is still pending.
- Shared ActivityScreenIndicator: numeral stays visible; done and locked add a lower badge with no connector; All activity screens is a nonmodal popover.
- Screens 1–8 run Alex Engine and Analyzer: learn, single choice, tap word, multi choice, ordered build, frame fill, apply, and the P7 check.
- Lesson End distinguishes a passed check from finished-but-not-mastered.
- Persistence stays in `g2o_unit_state_v4`. Milestone receipts stay in `ba_writing_milestone_receipts_v1`.

## Known gaps

- Visual status is `in-review` / `in-review-folded-corner`. Designer sign-off is still required.
- Lesson-end celebration is the existing milestone receipt UI. The 30-ribbon / 3-explosion particle preset is not wired to Lesson End.
- Apply grading is synchronous. A visible “Reading…” beat is not shown.
- `npm run check:docs` looks for the current PRODUCT heading `## 12. E-01 path`. Older copies of that script expected the string `E-01 · Staircase`, which is not in baseline PRODUCT.md.
- No hosted preview was published from this environment. Run `npm run dev -w @big-academy/writing` locally.

## Workflow

Create independent feature branches from latest `main`. Do not overwrite PRODUCT.md or DESIGN.md from an older branch.
