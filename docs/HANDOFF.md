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

- Lesson 1 (eight Activity Screens) is wired in CourseApp on the v2-terraces branch: routing, `canOpen`, grading FSM, `g2o_unit_state_v4`, and EN/ZH chrome. Visuals stay candidate until designer approval. Screens outside Lesson 1 remain unsupported.
- BATaskProgress / ActivityScreenIndicator and the anchored All activity screens popover require implementation parity with the current contract and design.
- Unit Folded Corner is on the Unit card (BA-WR-007): upper-right sheet fold, paper `#FFF9F2`, stroke `#DCC3AB`, goals as 16px plain text. Visual approval pending.
- Writing Choice option (BA-UI-003 / BAChoice) is implemented and still `candidate-pending-designer-approval`. Visible row is letter, body, and leading icon; border is 1px; radius is 24px; hover 1.02 / press 0.95. Not Approved.
- E-01 path landscape is **v2-terraces** in `StaircaseScene` (BA-WR-009 implemented, visuals candidate): sky color, cloud, hill-2, hill-1, then one platform per node. Hills share one frame, centered and just wider than the stage, with the ground on the bottom edge; horizontal parallax uses the candidate ratios. The card rail’s `cameraY` is not applied to those layers. Artwork is `apps/writing/public/path/v2-terraces/`. Sky `#58A8E8` and parallax ratios are candidates pending Joe Approved. BA-WR-010’s 2–3 grass layers are not built; the scene uses one 352×64 candidate platform. There is no Path A/B control.
- Validate P2–P7 grading, second tries/shown, Apply, P7 second assessment set, Back/Continue/refresh, keyboard/touch, EN/ZH, zoom and responsive screens.
- Run `npm run check:docs`, `npm run typecheck`, `npm test`, `npm run build`, relevant browser/Storybook tests; record actual pass/fail evidence. No previous QA results are asserted as proof for this baseline.

## Workflow

Create independent feature branches from `main`, implement against the four authoritative assets, then request designer review before merging. Historical stacked PRs and other agents' prototypes are reference-only and should not be used as new baselines.
