# Phase A audit — 2026-10-19

Starting ref: `feat/writing-lesson-topbar` @ `9b7e1dd`. This slice branch does not rewrite `BA-UI-001`, `BA-UI-006`, or `BA-WR-001`.

| Topic | Source truth | Approved | Missing before this slice | Pending Alex | Pending designer |
|---|---|---|---|---|---|
| Course, score, skip, unlock | `apps/writing/source/alex-original.html` (`Engine`, `Pages`, `Skip`, `Home`, `Stairs`) | Follow Alex. No demo unlock in the student path. | Top Bar pilot used fixtures and did not call `Pages.canOpen`. | P1 Save/Print keep-or-drop. Unit click destination. Level Goal formula. | — |
| E-01 path | `Home` / `Stairs.build`: intro, unit, lessons, milestone, goal | Warm Frame, not the dark staircase. Number always on the card. Start / Continue / Review / Locked. | No React staircase source in the repo. Rebuilt from Alex data, not from a missing `writing-entry-home` tree. | Cross-unit click. Goal formula. Several new milestones at once. Skip-revocation celebration. | Card geometry, `#FEF9EF`, milestone art. |
| Lesson chrome | Alex shell had Index / Menu. UX-03 removes that menu. | `LessonTopBar`: back + title left, tasks centered, no right control. | Pilot was not wired to a lesson. | Where Index / Analytics / Menu behavior goes. Task vs Page copy. | Top bar height, fonts, tag treatment. Still not validated. |
| Activity templates | 9 lessons, 52 screens, P1–P7 | Real tasks, not P1/P7 placeholders. | No activity UI. | Full P1, P4, P5, P6, P7 behavior beyond this slice. | Word grid, hamburger, coach anchor notes. |
| Visual | Approved ink `#133547`, accent `#B25415`, paper `#FFFFFF`, 0.5px borders | A · Warm Frame + White Canvas only | Dark-brown prompts are rejected. | — | `#FEF9EF`, elevation, motion, focus colors. |
| Fonts | Designer: Dosis ExtraBold 800, Jost, Douyin Sans, Noto Sans SC | Do not ship unlicensed files | Douyin Sans is not in the repo. Dosis / Jost / Noto Sans SC are linked from Google Fonts and fall back if that request fails. | — | Confirm loaded files and the Douyin fallback. |
| Skill v0.2 | Not in `skills/` | Do not claim the skill ran | Still not imported | — | — |

## Old-prompt conflicts (not used)

- Dark brown / dark wood page theme from `Writing-staircase-prompt.md` and `Writing-activity-style-prompt.md`.
- Fixed `min-width: 1024px`.
- Demo unlock, showcase locked-to-available, and P1/P7 placeholder cards.
- A second `writing-ui-lang` store. Locale is Alex `S.zh` in `g2o_unit_state_v4`.
- Decorative titles such as `BIG ACADEMY · WRITING`.

## What this slice added

E-01 for Level 2, enter G2-O Lesson 1, real P2 learn page and real P3 pick / single tap-word checks, save in Alex's state key, return to Continue, locked Lesson 2, and a guarded `?lesson=` entry. Later templates stay unfinished on purpose and cannot be marked done.
