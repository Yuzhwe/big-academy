# E-01 → Lesson 1 slice — runtime record

**Date:** 2026-10-19  
**Branch:** `cursor/writing-e01-lesson-slice-7d6c`  
**Base:** `feat/writing-lesson-topbar`  
**Visual status:** candidate Warm Frame. Not visually approved. Not `validated`.

## What runs

`npm run dev` opens the path. `?fixture=` still opens the Top Bar pilot used by the layout tests.

| Step | Behavior |
|---|---|
| Path | Level 2 from Alex `LEVEL_PATH`. Lesson 1 is Start. Lesson 2 is Locked. Each unit ends with a milestone. The level goal is shown and not scored. |
| Lesson 1 learn | P2 rule pair from the skill page. Next marks the screen seen, which is Alex's seen-page rule. |
| Topic sentence | P3 pick `ts1`. Check uses Alex `Engine.choiceGrade`. The right row is B. |
| Save | `localStorage` key `g2o_unit_state_v4`. Celebration uses a different key, `ba_writing_milestone_receipts_v1`. |
| Return | The Lesson 1 card becomes Continue. Focus returns to that card. Lesson 2 still refuses entry. |
| Skip | `?skills=L2-04:writing` marks that step skipped. `checkFailed('L2-04')` puts it back. |

P4, P5, P6, and P7 screens in the lesson render their question and a notice. They do not flip to done.

## Commands

```bash
npm install
npm run typecheck
npm test
npm run dev
npm run storybook
npm run test:layout
```

`npm run dev` serves the writing app. Storybook includes the new Lesson Workspace, Stair Lesson Card, and Unit Milestone stories.

## Fonts

| Role | Requested | What the page does |
|---|---|---|
| English titles and numbers | Dosis ExtraBold 800 | Google Fonts stylesheet, weight 800 only. Fallback: Arial Narrow, sans-serif. |
| English body | Jost | Google Fonts. Fallback: Noto Sans, Segoe UI, sans-serif. |
| Chinese titles | Douyin Sans | Not shipped. Fallback: PingFang SC, Noto Sans SC, Microsoft YaHei. |
| Chinese body | Noto Sans SC | Google Fonts. Fallback: PingFang SC, Microsoft YaHei. |

## Not claimed

- 52 screens are not accepted. The count is real; the runners are not.
- `BA-UI-001`, `BA-UI-006`, and `BA-WR-001` stay temporary foundation theme.
- `BA-WR-002`, `BA-WR-005`, and `BA-WR-006` are implemented as candidate Warm Frame, not validated.
- VoiceOver / NVDA were not run.
- `skills/prototype-to-hifi` v0.2 is not in the repo and was not used.
