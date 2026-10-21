# Big Academy — HANDOFF (current)

**Baseline:** canonical spec branch `docs/canonical-spec-rewrite-v1-20261021` · phase 1 implementation on `cursor/writing-lesson1-hifi-phase1-4442` · 2026-10-21
**Branch:** do not treat `main` as the source for this phase. The draft PR targets the canonical spec branch until a later stack base exists.

## Authorities

- `apps/writing/PRODUCT.md` — product rules and Writing-specific page behavior.
- `DESIGN.md` — global visual language, including complete Spacing/Gap and Radius decision rules.
- `packages/design-system/src/tokens.css` — executable token values. Candidate values marked [E] still require visual approval.
- `apps/writing/contracts/components.json` — component interfaces and status; BA-UI-003 and BA-WR-003 are implemented and still visually unapproved.

## Phase 1 status (facts)

Playable in `CourseApp`, not only Storybook:

- Lesson shell uses Warm Frame + white paper, an independently scrolling Coach, and a transparent footer. Previous and the primary action are a 1:2 grid, 8px gap, 70px height. Screen 1 Previous is disabled and does not return to E-01. Top-bar Back is a 50×50 icon button and is still the only exit to the staircase.
- P3 single choice (`L2-04.t.ts1`) uses BA-UI-003. Select does not grade. Check uses the existing Alex choice grader: correct finishes `done` and unlocks the next screen; the first wrong stays open; the second wrong finishes `shown`.
- Apply (`L2-04.apply`) can be opened from the path control “Phase 1 · Apply word grid” or `?phase1=apply`. That path is a layout review: it does not mark earlier screens done and does not change `canOpen`. The same WordGrid is what a legitimately unlocked Apply screen renders.
- BA-WR-003 shows the authored Opinion / Nouns / Adjectives / Marks groups. One group does not render a tab strip. Insert and tab changes do not grade. Tablet overlay is `position: absolute` inside the writing column.
- Chinese mode keeps Chinese chrome and English task sentences, options, and word cards.
- Apply “Check my writing” saves the draft. Under 3 words, it does not count a try. At 3 or more words it still does not grade, does not increment Apply tries, and does not open Next. Offline criteria, CJK-ratio counting, the safety branch, and Move on for now are not implemented.

## Not in this phase

- Screens 3–6 and 8 are not a finished eight-screen journey. Tapword and multi-pick graders were already present; ordered build, frame fill, and P7 are not newly graded here.
- Apply draft provenance is incomplete: an insert at the caret end keeps a `grid` span; typing or a mid-text insert collapses the draft to one `typed` span. Practice credit must not treat that as final.
- BA-UI-007 is still planned. Coach tones are placeholder cards, not a finished status component.
- No visual state is Approved. Word-grid category colors are [E] tokens.

## Known gaps

- Existing UI remains a pilot outside the phase 1 paths above.
- BATaskProgress / ActivityScreenIndicator and the anchored All activity screens popover still need rendered comparison.
- Unit Folded Corner visual approval is still pending.
- Open product questions are unchanged: Word Build cumulative wrongs, Apply Chinese-ratio failure counting, safety Move-on, and whether Coach’s last sentence must survive reload.
- Checks on 2026-10-21: `npm test` passed (13 files, 49 tests). `npm run typecheck` passed. `npm run build -w @big-academy/design-system` and `npm run build -w @big-academy/writing` passed. The writing bundle still warns that the main chunk is over 500 kB. Root `npm run build` (Storybook) was not run. Playwright `course-slice` and `topbar-layout` specs were not re-run.
- `npm run check:docs` failed: `scripts/check-document-sources.mjs` requires the literal `E-01 · Staircase`, and canonical `PRODUCT.md` says `E-01 Staircase`. That mismatch is on the docs baseline. PRODUCT.md was not edited to satisfy the checker.
- Browser evidence on the writing dev server: Screen 1 Previous is disabled; Back is 50×50; footer gap is 8px, button assemblies are 70px, and the primary control is about twice the Previous width, on a transparent footer. P3 wrong border computes to `rgb(155, 79, 54)` (`#9B4F36`) with danger-1 surface `#FFF4F1`. After a correct check, unselected rows are opacity 0.4 and the correct border is `#14AE5C`. At 834×1112 the Apply WordGrid is `position: absolute` inside the writing column; its box stays left of Coach, above the footer, and about 60px below the writing canvas.

## Workflow

Review the phase 1 draft against root `DESIGN.md` before any merge. Do not create `apps/writing/DESIGN.md`.
