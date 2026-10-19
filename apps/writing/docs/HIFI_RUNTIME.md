# Writing hi-fi runtime — plan layer and word grid

**Date:** 2026-10-19  
**Branch:** `cursor/writing-hifi-from-agent-a-e01-8539`  
**Base:** `feat/agent-a-e01-staircase-ab`  
**Visual status:** candidate Warm Frame. Not visually approved. Not `validated`. Designer review of PR #7 requested changes. The must-fix items below are addressed on this branch and still await re-review.

## What runs

`npm run dev` opens the path. `?fixture=` is still the Top Bar pilot.

| Step | Behavior |
|---|---|
| Path | Same Alex Level 2 staircase as Agent A. The student path is Warm Frame only. The dusk A/B switch is not student chrome. It remains at `?explore=staircase` for the Agent A history. Neither treatment is visually approved. |
| Lesson 1 | P2 learn and P3 pick / tap-word Check still use Alex grading. Later P4/P5/P7 screens in that lesson still cannot be marked done. |
| Lesson 6, after lessons 1–5 are actually done | `plan.topic` chooses Alex’s question list. `plan.top` / `plan.r1` / `plan.r2` / `plan.bottom` edit the real plan slots. Next waits until each open slot has text (`Pages.planFields`). |
| Word grid | Shown on those plan layers. Tabs come from `Engine.gridFor` / `Engine.cellsFor`. A cell uses `Engine.smartInsert` and stores provenance `grid`. Checks show the locked grid and no words. P4/P5 grids stay hidden until those editors exist. |
| Tablet | Viewports at or under 1112px open the word list on demand inside the writing column. The open list is a sibling under the writing area, so it does not cover the active plan entry, Coach, or Footer. Escape closes it. The 42% max height is a candidate, not an approved size. |
| Save | `localStorage` key `g2o_unit_state_v4`. Celebration stays on `ba_writing_milestone_receipts_v1`. |
| Lock | `?lesson=6` on a fresh student stays on the path. Lesson 7 stays locked until lesson 6 is done. |

`plan.check` shows the organizer and the label `Check my plan`, then explains that the original read-through is not connected. It does not mark the page done and does not offer a fake `Start writing anyway`.

## Commands

```bash
npm install
npm run typecheck
npm test
npm run dev
npm run storybook
npm run test:layout
```

`npm run dev` serves the writing app at `http://127.0.0.1:5173`. Storybook includes Word Grid and Hamburger Layer.

## Not claimed

- 52 screens are not accepted.
- Shared `BAButton` (`BA-UI-001`), `BATaskProgress` (`BA-UI-006`), and `LessonTopBar` (`BA-WR-001`) stay on the temporary foundation theme. The 834 title clip does not promote them.
- New plan and grid visuals are candidate, not validated.
- VoiceOver / NVDA were not run.
- `skills/prototype-to-hifi` v0.2 was not imported.
