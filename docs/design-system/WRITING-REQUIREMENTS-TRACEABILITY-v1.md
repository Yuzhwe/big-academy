# Writing Canonical Requirements Traceability Matrix v1

Date: 2026-10-21
Scope: current canonical PRODUCT.md, DESIGN.md, executable Tokens, Component Contracts, existing source and tests.
Verification type: **static source/code inspection only**. No frontend code changes or tests executed. "Specified" does not mean "verified implementation."

## Trace matrix — Lesson 1 eight Activity Screens

| Activity | Current normative PRODUCT.md | Current implementation evidence | Actual checked coverage / gap |
|---|---|---|---|
| 01 Learn, `L2-04.learn` | P2 teaching rule pair, Not yet/Better and unrestricted Next | `CourseSession.ready` supports read-only screen kinds; `CourseApp` displays lesson introduction; course-slice UI test shows hamburger | Partial static implementation; typography/strong example R3 appearance not verified |
| 02 Single Pick, `L2-04.t.ts1` | Select once, Check, first miss retry, second miss reveal | `CourseSession.pressPrimary` dispatches task type `pick` to `pickCheck`; courseSession tests check B correct after A wrong | Explicit code and test evidence for basic check; visual state and all retry boundary states not independently verified |
| 03 Tapword, `L2-04.t.ts4` | One word selected then Check, `believe` OR `should` | `pressPrimary` dispatches some `tapword` paths (when `need !== 'all'`) to `wordCheck` | Partial source coverage; two accepted targets and full retry/reveal not independently fixture-verified |
| 04 Multi Pick, `L2-04.t.ts3` | Toggle A/C/E, Check only, two tries | Source delegates `pick` to one `pickCheck` method, with grader imported from original Engine | Likely shared path but **no dedicated multi-pick parity test confirmed**; not approved as verified |
| 05 Ordered Build, `L2-04.t.ss.L2-04` | Ordered WordGrid, wrong word shakes, third miss cue, two full attempts, no Check CTA | `pressPrimary` only dispatches `pick` or `tapword` task types to Check; other task types fall through unsupported branch | **Gap**: current vertical slice is not evidence of full ordered-build behavior. Documented required future implementation |
| 06 Frame Fill, `L2-04.t.ts8` | Preserve fixed words, validate both blanks and nonvague reason, two tries | `pressPrimary` task fallback exposes unsupportedReason for unimplemented types | **Gap**: template-specific checked fill and retry are not demonstrated by source or tests |
| 07 Apply, `L2-04.apply` | Three authored topic sentences; four criteria; two failed checks unlock Move on | `screenDone` checks `state.done[screen.page]`, but `pressPrimary` for non-task unfinished screen reports blocked label rather than submitting an Apply validator | **Gap**: full Check my writing / Move on gating absent from the shown vertical-slice dispatcher |
| 08 Check, `L2-04.check` | Four internal questions, Hand in, blank warning, two assessment rounds, mastery 2/3 auto + writing | `screenDone` reads `state.done[screen.page]`; `pressPrimary` non-task unfinished path only presents locked message; static test file has no dedicated P7 end-to-end exercise | **Gap**: cannot assert P7 Hand in, retry, blank warning or pass/fail mastery parity from existing runtime slice |

## State and navigation parity

| Requirement | Evidence | Assessment |
|---|---|---|
| Course source / grade authority | `loadAlexSource.ts` extracts source from `apps/writing/source/alex-original.html`, Engine is not rewritten | Source architecture matches intended grader authority, but UI does not expose every template |
| Course universe vs pilot scope | Test asserts **52** screens and **9** lessons in G2-O; PRODUCT requires implementing only the eight Lesson 1 screens for current demo | Consistent; no need to implement 52 screens |
| Unlocking and permissions | `screenDone`, `ready`, `canNext`, `firstOpen`, `canOpen` in `courseSession.ts` | Base state model exists; not all template completion gates available in slice |
| Persistence | Key `g2o_unit_state_v4`, `CourseSession` state and storage; tests cover saved pick and resume | Partial test coverage; all P5/P7 saved drafts and results still require coverage |
| Review / Continue / Start | `cardAction` and tests cover existing lesson resume, completion, locked states | Base mechanism evidenced, not R3 visual state approved |
| Top Back vs Footer Previous | PRODUCT requires first-screen Previous disabled and Top Back to Staircase. `CourseSession.footer()` currently labels Screen 1 Back as "My path"; `pressBack()` exits to path from first screen | **Known implementation mismatch**, preserve PRODUCT.md rule and require correction in next code phase |
| Celebration | State receipt key `ba_writing_milestone_receipts_v1` and tests verify milestone does not rewrite progress | Milestone receipt coverage only; newly required first-correct all-practice and full lesson effects need independent test evidence |

## Design/Token/Component links

| Requirement | DESIGN.md authority | Token / contract interface | Actual implementation status |
|---|---|---|---|
| Default E-01 landscape | Writing section 9 landscape stack, source commit `913dbfe` | `--ba-writing-landscape-*`; BA-WR-009 LandscapeBackdrop | Source captured from separate feature branch; cannot claim integrated in main |
| Layered Landscape Terrace | Section 9 terrain; 2–3 shallow rounded layers, no rectangular pillar | `--ba-writing-terrace-*`; BA-WR-010 | Specified, numerical [E] awaiting designer review |
| Number Seal + Attached Symbol | Section 9 card/status | `--ba-writing-status-*`; BA-WR-005 | Contract present, visual implementation still requires render review |
| Unit folded corner | Section 9 Unit fold | `--ba-writing-unit-fold-*`; BA-WR-007 | Specified, not proof of rendered fold quality |
| BAButton reuse | Component section 8 and R3 Writing section | BA-UI-001; size 50 Back / 70 CTA+Footer | Existing StairLessonCard imports React Aria Button directly, so shared reuse gate fails until engineering repair |
| Motion physics | Section 7 Motion | `--ba-motion-spring-*` | Numeric CSS declarations present; no proven runtime spring adapter |
| Transparent Activity footer | Section 9; full width 1:2 | `--ba-writing-activity-footer-background: transparent`; BA-WR-002 | Contracted; product layout code needs browser validation |
| Choice / WordGrid / Feedback | Section 9 activity controls | BA-UI-003, BA-WR-003, BA-UI-007 | Various contracts planned; not full production coverage |

## Actual tests inspected (not executed)

- `apps/writing/src/product/courseSession.test.tsx`: 8 `it()` cases, including real L2-04 pick state, Continue/Review, skip/milestone, first lesson interaction.
- `apps/writing/e2e/course-slice.spec.ts`: 1 Playwright `test()`, E-01 → Lesson 1 single pick → Back.
- Source inspection cannot assert passing test suite, full screen interactions or visual parity.

## Decision rules for handoff

1. **Do not edit PRODUCT.md to match an incomplete UI slice.** Complete the missing runtime behavior later using the original authored source/grader.
2. **Do not mark a component Visually Approved from Tokens or Contracts alone.**
3. Preserve established 50×50 Back / 70px BAButton CTA/Footer, TopBar indicator, 8 Screen lesson, current landscape and R3 terrace/status visuals.
4. Future engineering PR must exercise each activity template and failed/passed branches, plus save/refresh/reentry, with explicit browser evidence.

## Unresolved evidence / approval

- Full original HTML-to-PRODUCT task-by-task equivalence not programmatically verified; require source fixture extraction and comparison.
- Runtime test execution not performed by this documentation review.
- Landscape/terrace/seal aesthetic details are still candidate [E] pending designer approval.
