# Phase A audit — Writing hi-fi from Agent A E-01

**Date:** 2026-10-19  
**Starting ref:** `feat/agent-a-e01-staircase-ab` @ `314946c`  
**This branch:** `cursor/writing-hifi-from-agent-a-e01-8539`  
**Visual status:** candidate Warm Frame. Not visually approved. Not `validated`. Tech ready for UI/UX Designer review only.

`skills/prototype-to-hifi` v0.2 is not in the repo and was not run.

## Source of truth / approved / missing / pending

| Topic | Source of truth | Approved | Missing before this step | Pending Alex | Pending designer |
|---|---|---|---|---|---|
| Course, score, skip, unlock | `apps/writing/source/alex-original.html` | Follow Alex. No student demo unlock. | The earlier slice ran P2 learn and P3 pick/tapword only. | P1 Save/Print. Unit click. Level Goal formula. | — |
| E-01 path | Alex `Home` / `Stairs` plus the staircase already on this lineage | Warm Frame product direction. Start / Continue / Review / Locked. Number on the card. | React `writing-entry-home` source is still absent. The path is a reconstruction on Alex data. | Cross-unit destination. Several new milestones at once. Skip-revocation celebration. | Card geometry, `#FEF9EF`, milestone art, A/B switch. |
| Lesson chrome | UX-03 removes the in-lesson menu | `LessonTopBar`, `BATaskProgress`, `BAButton` | — | Where Index / Analytics / Menu go. Task vs Page. | Top bar height and type. Still temporary foundation. |
| Plan (P6) | Alex `P6`, `Pages.planFields`, `Engine.smartInsert`, `Prov.update` | One surface per hamburger layer. Underline on edit. | No plan UI. | Whether `Check my plan` may finish without the original read-through. This slice does not invent that result. | Layer tints, focus color, bun radius. |
| Word grid | Alex `Grid` / `Engine.gridFor` / `Engine.cellsFor` | Tabs for real groups. Tablet on-demand overlay inside the writing column. | No grid component. | — | Overlay height, sticky overlap with the caret, tab chrome. |
| Activity templates | 9 lessons, 52 screens, P1–P7 | Real tasks, not placeholders. | P4 build/edit/write, P5 apply/draft/revise, P7 check, P1 report. | Full scoring and the second hand-in. | Word-grid and hamburger visuals. |
| Visual | Brand `#133547`, accent `#B25415`, paper `#FFFFFF`, 0.5px borders | A · Warm Frame + White Canvas | Root `DESIGN.md` was not on this branch. | — | `#FEF9EF`, elevation, motion, candidate layer tints. |
| Fonts | Dosis ExtraBold 800, Jost, Douyin, Noto Sans SC | Do not ship unlicensed files | Douyin Sans is not in the repo. | — | Confirm loaded files. |
| Icons | `/DESIGN.md` names Iconoir | Family only, not every glyph | `iconoir-react` is not wired. Existing controls use text. | — | Glyph, size, stroke. |

## What Agent A already delivered (reused, not rewritten)

- `BA-UI-001` BAButton, `BA-UI-006` BATaskProgress, `BA-WR-001` LessonTopBar. Temporary foundation theme.
- `BA-WR-002` LessonWorkspace, `BA-WR-005` StairLessonCard, `BA-WR-006` UnitMilestone. Candidate Warm Frame.
- E-01 diagonal staircase with the same `CourseSession` for both visual variants.
- Alex-backed lesson 1 Check/Next, save under `g2o_unit_state_v4`, return focus, locked deep links, skill skip revoke, milestone receipt in a separate key.

## What this step added

- `BA-WR-003` WordGrid and `BA-WR-004` HamburgerLayer, Storybook states, candidate styles.
- Lesson 6 `plan.topic` and `plan.layer` screens run from Alex data. A filled layer can advance. A grid cell inserts with `Engine.smartInsert`.
- `plan.check` stays unfinished on purpose.
- `/DESIGN.md` copied from `docs/unified-design-and-token-audit`. `apps/writing/DESIGN.md` kept.

## Old-prompt conflicts (not used as product rules)

- Dark brown / dark wood page theme.
- Fixed `min-width: 1024px`.
- Demo unlock and P1/P7 placeholder cards.
- A second `writing-ui-lang` store. Locale stays Alex `S.zh`.
- Decorative titles such as `BIG ACADEMY · WRITING`.

## Conflicts left explicit

See `OPEN_QUESTIONS.md`. The largest one: approved Warm Frame-only direction versus Agent A’s explore-only dusk variant A. After the PR #7 must-fix, the student path is Warm Frame only. The dusk switch stays behind `?explore=staircase`. It is not approved, and designer re-review is still open.
