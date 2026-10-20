# Writing P1–P7 Template Contracts · R6 draft

Source: `apps/writing/source/alex-original.html`, schema 7.0. This document complements the source-extracted `ACTIVITY_MATRIX_G2O_v0.1.json`. Original runtime and task data remain the behavior authority. No product code changed.

| Template | Screens | Supported source kinds | UI actions and gates to verify |
|---|---:|---|---|
| P1 Book | 2 | rep_paragraph, rep_grew | Read/Next; new designer decision removes Save my paragraph and Print |
| P2 Teach | 5 | learn, model_read | Next; source skip offer where eligible |
| P3 Select | 15 | task, model_task, plan_topic | Pick single/multi Check; tapword single/multi including remediation; label Check; topic selection updates plan, not correctness |
| P4 Sentence | 12 | task, rep_reflect | Edit/write/check, cloze auto check, build using word cards; reflection may complete without objective correctness |
| P5 Write | 8 | apply, draft_write, rev_comments, rev_cups, rev_final | Check my writing, Hand it in, Hand it in again, final finish; retain persistence and feedback versions |
| P6 Plan | 6 | plan_layer, plan_check, draft_ready | Complete plan fields, Check my plan, recap Start writing |
| P7 Check | 4 | check | Per-question paging, Hand in my check, unanswered warning and Hand in anyway, Try a new set after failure |

## Shared matrix record contract

Each source record must expose lesson identity, screen index, screen ID, step tag, template, kind, params, page ID, optional task ID/type, page type, original title and estimated minutes. All IDs in `ACTIVITY_MATRIX_G2O_v0.1.json` were extracted from the actual `UNIT_CONFIG`; **do not infer a screen's Check behavior solely from a template or the generic action policy field**. Per-screen actions, prerequisite gates, status, feedback and persistence must be audited against `Pages`, `Tasks`, `P1`–`P7` renderers.

## Answer components proposal

- `BAChoice` is the shared base (currently planned); prefer React Aria radio/checkbox semantics, visible focus and all keyboard/touch modes.
- Writing composites for pick single/multi, tapword, label and sentence build should inject grading state from the original controller. Component never decides correct, shown, skip or unlock.
- 50px minimum selectable option height, wrap naturally, align multiline first-line and index, no global BAButton alteration.
- Separate Coach instructional/hint content from feedback surfaced after Check. Preserve special auto-check and multi-target flows.
- Correctness and activity completion are separate. Distinguish `shown` from `correct` in both UI and assistive labels.

## Required evidence per screen

- Screen ID matched to source and React route; required actions/gates documented with actual source function references.
- Interactive test for keyboard/touch and Check/Next/Hand in as applicable.
- Attempt-1/attempt-2/`shown` and remediation where applicable, persistence after navigation.
- EN/ZH truncation or wrapping at 1440, 1024, 834, 390 CSS px and 200% zoom.
- No learning-score, unlock, skip or receipt regression. Visual approval is separate from test passage.

## Approval

Designer-accepted R6 direction; detailed runtime actions and appearance remain to be verified by engineering and designer. Alex's original business logic is unchanged.
