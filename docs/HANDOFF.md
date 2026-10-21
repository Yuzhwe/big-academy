# Big Academy — HANDOFF (current)

**Baseline:** canonical spec branch `docs/canonical-spec-rewrite-v1-20261021` · phase 1 on `cursor/writing-lesson1-hifi-phase1-4442` · phase 2 on `cursor/writing-lesson1-hifi-phase2-dc93` · 2026-10-21
**Branch:** do not treat `main` as the source for this phase. The phase 2 draft PR targets the canonical spec branch and does not update the phase 1 branch.

## Authorities

- `apps/writing/PRODUCT.md` — product rules and Writing-specific page behavior.
- `DESIGN.md` — global visual language, including complete Spacing/Gap and Radius decision rules.
- `packages/design-system/src/tokens.css` — executable token values. Candidate values marked [E] still require visual approval.
- `apps/writing/contracts/components.json` — component interfaces and status; BA-UI-003 and BA-WR-003 are implemented and still visually unapproved.

## Phase 1 status (facts)

Playable in `CourseApp`, not only Storybook:

- Lesson shell uses Warm Frame + white paper, an independently scrolling Coach, and a transparent footer. Previous and the primary action are a 1:2 grid, 8px gap, 70px height. Screen 1 Previous is disabled and does not return to E-01. Top-bar Back is a 50×50 icon button and is still the only exit to the staircase.
- P3 single choice (`L2-04.t.ts1`) uses BA-UI-003. Select does not grade. Check uses the existing Alex choice grader: correct finishes `done` and unlocks the next screen; the first wrong stays open; the second wrong finishes `shown`.
- Apply (`L2-04.apply`) can be opened from the path control “Phase 1 · Apply word grid” or `?phase1=apply`. That path is a layout review: it does not mark earlier screens done and does not change `canOpen`. The same WordGrid is what a legitimately unlocked Apply screen renders. The real Apply screen, opened in order, grades in phase 2.
- BA-WR-003 shows the authored Opinion / Nouns / Adjectives / Marks groups. One group does not render a tab strip. Insert and tab changes do not grade. Tablet overlay is `position: absolute` inside the writing column.
- Chinese mode keeps Chinese chrome and English task sentences, options, and word cards.
- Apply “Check my writing” saves the draft. Under 3 words, it does not count a try. At 3 or more words it still does not grade, does not increment Apply tries, and does not open Next. Offline criteria, CJK-ratio counting, the safety branch, and Move on for now are not implemented.

## Phase 2 status (facts)

Playable in `CourseApp` for G2-O Lesson 1, screens 1–8, under the existing `canOpen` / `screenDone` gates:

- Forward jumps that are still locked do not navigate and do not write learning state. The Coach says “That page opens later.” plus the locked message for the first unfinished screen. `?phase2=blocked` opens Lesson 1 on that message for review. Locked chips stay disabled.
- Select, a word-card insert, and a grid-tab change do not grade. Check, a completed build line, and Hand in do. Practice items use open / done / shown and the two-try reveal. Apply does not use `shown`.
- Ordered build (`ss.L2-04`) inserts only the next target token. Cumulative `miss` is not reset by a correct tap or Start again. The third miss shows the authored reason. A full line is one try.
- Frame fill (`ts8`) grades with Engine `frameFill`. A second miss reveals the authored why, not a made-up model sentence.
- Apply on the real screen uses Analyzer `checkApply`, `wordCount`, and `safetyScreen`. Under 3 words is not a try. A 3+ word draft counts a try, including a CJK-heavy draft (§19, source behavior). Two ordinary failures offer Move on for now, which completes the screen without a pass and without the milestone celebration. A safety match counts a try, asks for the teacher, and does not offer Move on (§19: that Move-on edge is not treated as approved). `?phase1=apply` is still the non-grading layout review.
- P7 keeps one internal question index. The top bar stays eight lesson screens. Hand in grades the set once. A blank set warns once. The first failed set does not finish the screen and revokes an active skill skip. A later submitted set can finish without mastery. That result says “Not yet.” and does not open the milestone celebration.
- `g2o_unit_state_v4` debounces edits by 250ms and flushes on navigation, graded Check, Hand in, locale change, and page hide. Reload restores the screen, answers, tries, build miss, drafts, and the P7 index. The in-memory Coach sentence is not part of the saved record (§19).
- Chinese mode uses authored zh for instructions and chrome already translated in the course shell. Option lines, passages, frames, and word cards stay English. WordGrid still mounts only the active tab panel.
- E-01 is the terraced landscape path: each node has its own shallow grass terrace, and the stage is the layered scenery. Visual approval is still pending.
- A passed Lesson 1 mastery check offers the full-lesson celebration: 30 ribbons and three explosion bursts. An unmastered check finish, Move on, and a practice Check do not. The celebration receipt is `ba_writing_lesson_celebration_receipts_v1`. It is written only after the presentation plays, and it does not change course progress. Reduced motion keeps a still success card. Practice micro-celebrations for each first correct item are still not wired.

## Not in this phase

- Lesson 2 and the rest of the 52 screens are still outside this slice. Lesson 1’s eight screens are the phase 2 journey.
- Apply draft provenance is incomplete: an insert at the caret end keeps a `grid` span; typing or a mid-text insert collapses the draft to one `typed` span. Practice credit must not treat that as final.
- BA-UI-007 is still planned. Coach tones are placeholder cards, not a finished status component.
- No visual state is Approved. Word-grid category colors are [E] tokens.

## Known gaps

- Existing UI remains a pilot outside the phase 1 paths above.
- BATaskProgress / ActivityScreenIndicator and the anchored All activity screens popover still need rendered comparison.
- Unit Folded Corner visual approval is still pending.
- Open product questions are unchanged: Word Build cumulative wrongs, Apply Chinese-ratio failure counting, safety Move-on, and whether Coach’s last sentence must survive reload.
- Checks on 2026-10-21 for this phase 2 branch: `npm test` passed (13 files, 58 tests). `npm run typecheck` passed. `npm run build -w @big-academy/design-system` and `npm run build -w @big-academy/writing` passed earlier in this phase; the writing bundle still warns that the main chunk is over 500 kB. `npm run build-storybook -w @big-academy/writing` passed. Playwright `e2e/staircase.spec.ts`, `e2e/course-slice.spec.ts`, and `e2e/phase2-smoke.spec.ts` passed, including the mastery celebration.
- `npm run check:docs` still fails on the docs baseline: `scripts/check-document-sources.mjs` requires the literal `E-01 · Staircase`, and canonical `PRODUCT.md` says `E-01 Staircase`. PRODUCT.md was not edited to satisfy the checker.
- Browser smoke on the writing dev server: the path is the terraced landscape stage, with no path-shape switch. Screen 1 Previous stays disabled. A wrong pick stays on the screen; reload returns to the path and Continue restores that screen with the missed option still marked. Chinese mode on the choice screen keeps Chinese chrome and the English option sentences. The real Apply check accepts a passing draft. P7 shows its own question numeral while the top bar stays on eight lesson steps.

## Workflow

Review the phase 1 draft against root `DESIGN.md` before any merge. Do not create `apps/writing/DESIGN.md`.
