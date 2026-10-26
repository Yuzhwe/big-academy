# Big Academy — Writing PRODUCT.md

**Edition:** Canonical product specification v1 · 2026-10-21
**Authority:** current Writing product behavior, curriculum content and learning state contracts.
**Scope:** Writing L2 / G2-O / Lesson 1, eight Activity Screens; other templates are documented for system compatibility.
**Status:** current product behavior documented; selected visual concepts require separate rendered approval.

## How to use this specification

This is the sole active Writing PRODUCT.md. Chapters describe the current system, not historical review overlays. Design properties and visual tokens are defined in root DESIGN.md and tokens.css; use Component Contracts for component interfaces. Preserve authored tasks, answer validators, retry/shown/skip/assessment logic and saved state. New agents must not substitute generic “correct → next” flow for the template-specific gates below.

## 1. Product context

**User:** a K–12 writing learner at the assigned level. **Core scenario:** enter a Writing lesson from E-01, learn a rule, practise with task-specific checks, apply it in writing, submit a mastery check, and resume if interrupted.

**Problem:** separate activity demonstrations do not by themselves provide a navigable, recoverable learning journey with accurate feedback, gating, and assessment.

**Goal:** deliver the complete eight-screen, end-to-end Lesson 1 journey in the approved Warm Frame + White Canvas direction. Preserve the distinctions among input, evaluation, feedback, completion, and unlocking.

**Acceptance measures:** all eight real screens and original task data; correct/wrong/empty/second-attempt/reveal behavior by task; sequential unlocking; P7 both rounds; Back/exit/refresh/Continue state recovery; accessible keyboard and touch; screenshots and designer approval. These are delivery criteria, not unvalidated learning-effect metrics.

**Out of scope:** implementing the other 44 screens, adding new exercises, old Index/Analytics chrome, user-facing Save my paragraph/Print, or cross-level demo unlocking.

## 2. Information architecture

```text
Writing → Level → Unit → Lesson → Activity Screen → optional internal Task/Question
E-01 Staircase
  └─ Lesson entry (Start / Continue / Review; Locked cannot enter)
       ├─ 01 Learn [P2]
       ├─ 02 Topic sentence — single pick [P3]
       ├─ 03 Opinion word — tapword [P3]
       ├─ 04 Opinion or fact — multi-pick [P3]
       ├─ 05 Build sentence — guided word cards [P4]
       ├─ 06 Finish sentence — frame fill [P4]
       ├─ 07 Apply writing [P5]
       └─ 08 Check [P7: 3 auto questions + 1 writing, internal pager]
          ├─ pass → Lesson End (passed)
          └─ fail → second set → pass or finish-not-mastered
       → Return to E-01
```

**Screen flow:** initial Lesson entry focuses Screen 1, with Screens 2–8 locked. A Screen that legitimately terminates its own learning interaction unlocks its successor; the learner activates Next to navigate. On first visit, no later Screen is directly navigable, including by a collapsed-number popover or URL. A terminal practice `shown` state does not imply correctness. Apply can terminate by passing or by an explicit `Move on for now` after two failed checks; Check can terminate after two failed assessment rounds without awarding mastery. Existing authorized skill-skip transitions remain distinct from ordinary sequential completion.

**Saved navigation:** Back, exit, browser reload, Continue and Review must preserve answer content, attempts, hints, `shown`, drafts, check history and valid unlocks. P7's four internal questions never add four LessonTopBar steps. The detailed activity rules below supply the acceptance conditions; this flow does not replace them.


This document is the product authority for Writing behavior: what the learner sees, how an answer is chosen, how it is checked, when feedback appears, and when the next Activity Screen opens.

Shared visual foundations (Warm Frame, White Canvas, type ramp, Iconoir, motion, tokens) live in repository-root `/DESIGN.md`. This file does not repeat that system. Learner-facing English and Chinese UI strings are authored in the unit configuration and selected by the active locale, **not shown in parallel**. Mode B (Chinese interface, essential English learning content retained) keeps essential English-language learning material in English (task example sentences, answer choices, vocabulary word cards, fixed writing frames and learner-entered writing); see chapter 8 and chapter 14. The rules below decide structure, correctness, gates, and persistence. A reader does not need the HTML runtime to apply them.

**Current build scope:** L2 unit G2-O, Lesson 1, Topic sentences, the eight Activity Screens in [Lesson 1](#12-lesson-1--eight-authoritative-per-activity-contracts). The other eight lessons and their 44 screens are specified here so later lessons use the same gates. They are not part of this build.

## 3. Course structure

Hierarchy is Level → Unit → Lesson → Activity Screen. A step tag (Skill, Model, Plan, Draft, Revise, Report) is a label on screens, not a separate level the learner navigates.

G2-O, “The Hamburger Paragraph,” is the only playable unit on the learner path. It has 9 lessons and 52 Activity Screens. Other levels and units appear on the learner path as locked or view-only. The learner path does not unlock them for demonstration. The designer preview query in chapter 16 is separate and does not change this learner rule.

| Lesson | Title | Screens | Templates used |
| --- | --- | --- | --- |
| 1 | Topic sentences | 8 | P2, P3, P3, P3, P4, P4, P5, P7 |
| 2 | Reasons & closing | 8 | P2, P3, P3, P4, P4, P3, P5, P7 |
| 3 | Linking words | 8 | P2, P4, P4, P3, P4, P4, P5, P7 |
| 4 | Run-on sentences | 8 | P2, P3, P3, P4, P4, P4, P5, P7 |
| 5 | A strong paragraph | 6 | P2, P3, P3, P3, P3, P3 |
| 6 | Plan your paragraph | 6 | P3, P6, P6, P6, P6, P6 |
| 7 | Write your paragraph | 2 | P6, P5 |
| 8 | Read my comments and revise | 3 | P5, P5, P5 |
| 9 | My finished paragraph | 3 | P1, P1, P4 |

Lesson 1 goal, shown as the lesson aim: “I can write a topic sentence that tells the topic and what I think.”

The lesson top bar counts **Activity Screens inside the current lesson** (Lesson 1 is 1–8). It does not count questions inside a Check. P7 retains internal question navigation while showing only a prominent single current-question numeral at top-left; full count remains in accessible labeling.

## 4. Interaction primitives

Selecting an answer, checking it, showing feedback, and allowing the next screen are four separate steps. A control that only changes a selection never grades. A grade never runs because the learner moved to another row, word, or field.

| Step | What changes | What does not change |
| --- | --- | --- |
| Select or edit | The stored answer (chosen index, tapped word, labels, or text) | Tries, status, credit, page-done. No new grading sentence is written. |
| Check or Hand in | Tries, where the task uses them, then status or page-done | The learner cannot reach the next screen from this press unless the completion rule for this template is met. |
| Show feedback | Coach or margin text, and row/word marks for right, wrong, or revealed | Unlock. Feedback can sit on the screen while Next is still closed. |
| Allow next | The footer primary becomes the real forward action and `canNext` is true | Score. Opening the next screen is not itself a grade. |

While a screen is unfinished, the footer primary **is** the action the screen still needs (Check, Hand in, Hand it in, and so on). It is not a disabled Next. Pressing it runs that action. If the in-page Check is already enabled, the footer press activates that Check. If the learner has not answered yet, the press does not grade: the Coach names what to do, and the answer area pulses.

Forward jumps respect the lock. Backward moves never do.

## 5. Activity screen gates

`canOpen(i)` is true when the screen index is at or before the first unfinished screen, or the screen is already complete, or a teacher unlock-all flag is on. A locked screen does not navigate. A blocked forward attempt explains that an earlier screen must be finished. It does not unlock anything.

`canNext(i)` is true when the screen is complete **or** it is a read-and-advance screen (see the table). These are not the same test.

A skipped skill step counts as complete for both gates. Minutes on those screens become 0.

| Screen kind | Complete when | Next is available |
| --- | --- | --- |
| `learn`, `model_read`, `plan_topic`, `draft_ready`, `rev_comments`, `rep_paragraph`, `rep_grew` | The learner presses Next once (`seen`) | Immediately. Next records `seen`. |
| `rep_reflect` | Next is pressed. That press also marks the report page done. | Immediately. |
| `task`, `model_task` | That screen’s item status is `done` or `shown` (not `open`) | Only then. Until then the footer is Check, or the task’s own completion gesture. |
| `plan_layer` | `seen` **and** every field on that screen has text after pictures are stripped | As soon as every field has text. Next then records `seen`. |
| `plan_check` | The plan page is marked done | Only then. |
| `apply`, `check` | That page id is in the done map | Only then. |
| `draft_write` | At least one draft has been handed in | Only then. |
| `rev_cups` | A second draft exists, or the paragraph is already finished | Only then. |
| `rev_final` | The learner has finished the paragraph | Only then. |

Completion is **not** “the answer was correct.” `shown` (answer revealed), “Move on for now,” “Start writing anyway,” and a failed second Check all complete their screens without a correct result. Read-only screens complete with no answer at all.

When Next would enter another lesson, the footer label is **End of lesson**. That press opens the lesson-break screen. It does not skip the break. On the last screen of the book, the label is **I’m done** until the screen is seen, then **Finished**.

## 6. Navigation and persistence

Course state is one record in this browser, storage key `g2o_unit_state_v4`, schema version 4. Writes are debounced by 250 ms and flushed immediately on navigation, Check completion, Hand in, and leaving the lesson. Older keys (`v3`, `v2`, `v1`) are detected and left unread. There is no second progress store.

The record holds: current screen index, `seen`, page-done flags, per-item state (tries, status, picks, wrong marks, tapped word, found targets, labels, build order, hint level, miss counts, and each ordered-build word tile’s wrong-tap count), writing regions as word segments with how each word was entered, Check attempts and results, plan topic and fields, Apply tries and last result, draft versions, CUPS ticks, reflection, skill status, skip choice, and a capped event log.

Milestone celebration receipts use a different key, `ba_writing_milestone_receipts_v1`. They never grant, revoke, or rewrite a lesson.

| Action | Stored result | What the learner sees on return |
| --- | --- | --- |
| Edit or select | Answer updates. Status stays `open` if it was open. | The same selection or text. |
| Check, reveal, or Hand in | Status, tries, feedback inputs, and page-done as the template requires. | Finished items stay finished. Open items keep tries, selections and source-backed grading context. **Source parity limitation:** the original's transient `Pages.lastSaid` Coach message cache is not part of the saved `S` record; after a hard reload, an unfinished item's exact last Coach sentence is **not guaranteed** to reappear. Preserve the intended feedback-recovery UX requirement and record this as an implementation/owner-verification gap, not as already-working source behavior. |
| Footer **Previous** inside a lesson | Navigates only to an earlier Activity Screen within the current Lesson; disabled on Screen 1. Does not exit to E-01. Answers are not cleared. | The earlier screen with its saved answer and status. |
| P7 **Back** between questions | Question index moves back. Every question’s answer is kept. | The previous question, still answered if it was. |
| P7 **Back** on question 1 | Returns to the preceding Activity Screen **inside the same Lesson**, not to E-01. Check answers stay stored; coming back resumes the saved question index. | The previous Activity Screen; the only exit-to-parent control remains LessonTopBar Back. |
| **Top-left LessonTopBar Back** (all Activity Screens, including Screen 1) | Flush save. Return to the parent E-01 Staircase page. Screen index stays where the learner was. | **Continue** reopens that screen. The lesson Footer never duplicates this exit action. |
| **End of lesson → Back to my path** | Screen index moves to the first screen of the next lesson, then the path opens. The finished lesson’s answers remain. | That lesson shows **Review**. Opening it starts at its first screen with answers and completion intact. |
| **Stop for today** | Same resume point as Back to my path, plus a stopped timestamp. | Next open shows the stopped lesson-break, then a one-time “Welcome back” on the next lesson. |
| Re-enter from E-01 | No reset. | Unfinished lesson: **Continue** at the saved screen if it may still open, otherwise the first unfinished screen. Finished lesson: **Review** at screen 1. |

Changing the top-bar appearance, or pressing a chip that `canOpen` rejects, does not write learning state.

Text regions restore from stored segments, including a printed frame or given sentence. Undo history is session-only; the text itself is what persists. Word-grid insertion, voice, typing, paste, pictures, and printed task text are stored as the source of each span. That source affects practice credit and in-writing weight. It does not change the correctness tests below.

## 7. Answer states, attempts and reveal

Practice items (not Check questions) use status `open`, `done`, or `shown`.

- `done` — the learner met the grader. Practice credit uses how the answer was produced.
- `shown` — the answer was revealed. Credit is 0. The screen still completes. The revealed answer is marked as the answer, and the learner’s own pick stays unmarked as correct.
- A gutter tick appears for both `done` and `shown`. The revealed tick and the correct tick stay visually and accessibly distinct.

**BAChoice board.** Option chrome uses `default` (alias `idle`), `selected`, `correct`, `correctUnselected` (alias `shown`), `wrong`, and `dim`. Before Check a row is `default` or `selected`. `selected` is the brown fill `#9B4F36` with a ring. That hex is the selected fill. After Check, the option the learner picked that is correct is `correct`: green fill `#14AE5C` and a leading check. A correct option the learner did not pick is `correctUnselected`: green outline `#14AE5C` and a leading check, with no solid green disc. A wrong option is `wrong`: fill `#9B4F36` and an X. `dim` is graded chrome at opacity 0.4. `disabled` is a separate non-interactive state. The row shows the letter, the body, and the leading icon.

**Two-try rule (pick, label, single-target tap-word, edit, write, build).** Each Check, or each completed build submission, adds one try. A correct result finishes `done` immediately. A wrong result with fewer than 2 tries stays `open`, shows the retry message, and leaves Next closed. The second wrong result finishes `shown` and reveals the answer. There is no unlimited-retry mode.

**Hint ladder, separate from Check.** On an open practice item that has hints, the hint control is a secondary button: “Need a hint?” then “Another hint,” then “Show me the answer.” Reveal calls the same `shown` finish as a second miss. Hints are never offered inside a Check, and Apply uses the ladder without the reveal button. Asking for a hint does not grade and does not add a try. The ordered topic-sentence build shows the hint for a word from that word tile’s own wrong-tap count.

**Per-item exceptions to the two-try rule:**

- **Cloze edit** (a blank inside a given sentence, Lesson 3 `lw1` and any item flagged cloze): there is no Check button. When the last `___` is filled, the edit grader runs by itself. A miss clears the sentence back to the blanks after 0.9 s. Two misses reveal.
- **Ordered build** (Lesson 1 `ss.L2-04`, build the topic sentence): a wrong word-card tap leaves the bench unchanged and leaves the full-line try unchanged. It briefly shakes that word. Each word tile keeps its own wrong-tap count. After two wrong taps on that same word, the hint for that word is shown. Each remaining blank on the bench is an underline, one horizontal line for each word still to place. Those underlines are the ordered-build bench. The WordGrid panel is the Approved peach word-card bank, with connected sticky tabs 本题词块, 观点, and 标点, and white pill cards. A placed word stays in the line. The screen’s controls are the word cards and the Coach-rail button group. A graded full-line try is counted only after the built line reaches the target length.
- **Free build** (`in_order` false): any card may be placed; the sequence is graded only when its length equals the target. Start again clears the line.
- **Find-every-boundary tap** (`need: all`, Lesson 4 `ro5`): there is no Check button. Each correct boundary is accepted immediately and the count updates. A wrong tap adds a miss. Two misses in a row open the remediation item. Five wrong taps in total reveal the boundaries. Finding every target finishes `done` without a two-try cap.
- **Remediation** (`ro5` → `ro5r`): the smaller multi-pick replaces the paragraph until that item is `done` or `shown`. Then the paragraph returns with the miss streak cleared. Remediation uses the normal two-try pick rules.
- **Apply and plan check** do not use `shown`. They use their own move-on rules in P5 and P6.
- **Check questions** do not use tries or `shown` while the learner is answering. They are graded once, at Hand in.

Practice credit, when the item is outside a Check and outside the teacher gallery:

| How the answer was produced | Weight |
| --- | --- |
| Pick, tap-word, or label the learner answered (`auto`); typed text; voice | 1 |
| Word-grid word or phrase (`grid`); word-card set, including every build (`set`) | 0.5 |
| Paste, or status `shown` | 0 |

Classification order for produced text: a paste span → paste; else a word-card span → set; else a grid or chunk span → grid; otherwise typed. Picture-only and plan-only spans do not get their own practice class; they fall through to typed. Pick, tap-word, and label are `auto` unless revealed. Build is `set` unless revealed. Skill practice score P is `round(100 × credit / tasks)` for that skill.

In-writing weight is a different scale, threshold 2, and counts only Apply writing, Check writing items, and the genre final paragraph. Typed and voice weigh 1; plan notes, grid spans, and chunk spans weigh 0.5; pictures, paste, and printed text weigh 0. Word-card sets are not offered on Apply, Draft, Revise, or Check.

## 8. Shared learning shell behavior

Every Activity Screen is one frame: prompt (localized instruction, read-aloud), body (original authored English learning material when required), and in-page actions (localized UI). **Mode B shows the Chinese UI as the single interface line.** The lesson shell is white task paper on the left and Coach on the right. Coach scrolls on its own. **Previous** and the one contextual primary action sit at the bottom of the Coach rail, at the bottom-right of the lesson, outside the Coach transcript.

Choice, word, and sentence options are at least 50 CSS px tall and grow with wrapped text. One-line and wrapped rows use `align-items: flex-start`, so the status icon and the letter stay with the first line. This height rule is for answer options. Global buttons keep their own height.

Option chrome is `default` (alias `idle`), `selected`, `correct`, `correctUnselected` (alias `shown`), `wrong`, `dim`, and `disabled`, as chapter 7 states. The row shows the letter, the body, and the leading icon. The accessible name carries the state. Coach feedback sentences stay in the feedback region.

**Lesson question feedback.** Every lesson question feedback UI uses the same presentation. Each feedback message sits in its own card. A wrong message uses a white background and a light border. A correct message uses a white background and a green border. Previous and Next sit at the bottom of the Coach rail. The hint control is a secondary button. Card fill, border, and button chrome are the DESIGN.md candidate. When a message appears stays with the activity rules in this file.

Keys 1–9 and A–I select a choice when a choice group is on screen. Enter activates Check when that button is enabled and the learner is not typing in a field. Read-aloud on the prompt is available on every template. It does not grade.

## 9. Activity template behavior

### P1 Book — read

Variants: `final` (finished paragraph), `growth` (first draft beside final).

No question, no options, no grader. The screen completes when the learner presses Next.

- **Final.** Shows the latest final text, one paragraph per blank line, with the account name as a byline when a name is present. If no draft exists, the empty line is “Your finished paragraph will be here.”
- **Growth.** Word diff of the first handed-in draft against the final text. Matching ignores case and trailing punctuation. Added words and removed words are marked and named in a key. A four-row table compares first-draft and final scores: organization and purpose, evidence and elaboration, language, conventions. “My checks” lists each skill Check as passed, not yet, or not taken.
- **Controls removed from the product:** “Save my paragraph” and “Print” are not on this page. Automatic saving still runs. The browser’s own print command is not a product button.

### P2 Teach — read, then Next

Variants: `rule_pair` (skill teach), `annotated_text` (model paragraph).

No grader. Next is available immediately and marks the screen seen.

- **Rule pair.** Step title, the teach sentence, a “Not yet” example beside a “Better” example, and the hamburger diagram for that skill (topic, reasons, linking, or run-on). The Better example uses a pale green fill and a leading check. Lesson 1 teach sentence: “A topic sentence tells the topic and what you think.” Weak example: “Gardens have plants.” Strong example: “Our school should have a garden for two big reasons.”
- **Skip offer.** Only on a rule-pair screen whose params set `skip_offer`, and only when skill-skip rules say so. See [Skill skip](#11-skill-skip-and-lesson-boundary).
- **Annotated model.** Prompt is the page teach line. The model question and Paragraph A are sentence spans. Choosing a sentence opens that sentence’s note in the margin. Notes are teaching, not a score. Next does not require a note to be opened.

### P3 Select — choose, then Check (with two exceptions)

The prompt is the item’s ask line. Options are the item’s lines, passage words, model sentences, topic cards, or label categories. Layout comes from the screen params; inside a Check or a remediation it is inferred from the item type.

**Choice grade.** The stored answer is a list of option indexes. Correct means the sorted list equals the authored answer indexes. If the item is marked `any` (model “Find an example”), correct means exactly one selected index and that index is in the answer list. Letters are A, B, C… in list order.

**Select.** Single choice replaces the selection. Multi choice toggles and shows “Choose N · k chosen.” Selection writes the answer and clears the wrong-mark list. It does not add a try and does not write a new grade. Check stays disabled until the authored pick condition is met: single choice needs one selection; the L2/G2-O multiple-choice activity requires exactly its authored three selections before Check can be submitted. Selection is not grading.

**Check.** Adds a try. Correct → `done`, feedback, screen completes. First wrong → stay `open`. Single choice clears the selection and marks the chosen row wrong; the retry sentence names the letter and the authored reason for that option, then “Try again.” Multi choice keeps the selection; the retry sentence names one wrong letter and its reason, or “You found r of n.” Second wrong → `shown`, wrong rows stay marked, correct rows show the leading check icon, and the feedback region uses the graded sentence in the next paragraph.

**Coach presentation for a pick** (also used when a single-target tap-word is revealed). These template strings are Coach / demo feedback in the feedback region:

- Right: “Right. You chose {letters}. {why the right option is right}.”
- Wrong, with a choice: “You chose {letters}. {why that option is wrong}. The right answer is {letters}. {why the right option is right}.”
- Nothing chosen: “You didn’t choose an answer. The right answer is {letters}. …”

**Tap a word, one target (`need` is not `all`).** The passage is split into words. One word may be selected; tapping it again clears it. Check is disabled until a word is selected. Correct if the selected token is any authored target (`at` plus occurrence, default 1). Two-try reveal applies. Retry text uses the authored note for that word when it exists, otherwise “The word you tapped isn’t the one,” then asks for another try and clears the selection. On reveal, every target word is marked and the feedback names the miss.

**Tap every boundary (`need: all`).** No Check button. A correct word is kept, the miss streak resets, and the hint shows how many remain. The last correct word finishes `done`. A wrong word increments tries, the streak, and the total. At two streak misses, if a remediation id exists and is not done, the remediation replaces the passage. At five total misses, status becomes `shown` and every target is marked. This path is Lesson 4, not Lesson 1.

**Model sentences.** Same select-then-Check as a single choice. The options are the model paragraph’s sentences. Used in Lesson 5.

**Two-up.** Two large options (paragraph A and paragraph B). Same single-choice grade.

**Topic cards (plan, not a score).** One card per authored question. The selected card is the plan topic. The class question is marked. Default topic before any tap is `garden`. A, B, C… or a click changes the topic immediately and may be changed until the plan layers begin. There is no Check and no correct answer. Next is available at once. The screen completes when Next is pressed.

**Label (defined, not used on the 52 student screens).** Each line gets one category. Check enables when every line is labelled. Correct when every label matches the authored index. First miss marks the wrong lines and says to look again. Second miss reveals with “The green labels are the answers.” The teacher template gallery is the only place this variant is shown.

### P4 Sentence — build, fill, fix, or write

The prompt is the item’s ask line. The body is one bench: optional “From the task” source, then “Build it here” or “Your sentence,” then the variant’s actions. A checked draft (edit, write, fill) includes Check and Start again. The Lesson 1 guided topic-sentence build uses the word cards and the Coach-rail button group.

**Build.** Cards come from the item’s cells plus distractors. The learner inserts them from the word-card grid into a read-only line. The ask line may already quote the target sentence; the grader still compares the built line with that target. A free build includes Start again, which clears the line. The Lesson 1 guided topic-sentence screen uses the word cards and the Coach-rail button group.

- Ordered (Lesson 1 topic sentence): the next card is the next target token. A wrong card shakes and stays off the line. The hint for that word tile appears after two wrong taps on that same word. Each remaining blank is an underline. A placed word stays in the line. See the ordered-build rule in [tries](#7-answer-states-attempts-and-reveal). The screen’s controls are the word cards and the Coach-rail button group.
- When the line reaches the target length, it is correct if the built text matches `answer_text` after whitespace and quote normalization, or the card list equals the target list. A wrong full line adds a try, shows the reason, and clears after 1.2 s. The second wrong full line reveals `answer_text` under “Here it is:”.

**Edit (given sentence).** The bench opens on the given text. Correct if the normalized text equals one authored `accept` string, unless the item has `rules` or `frameFill` instead.

- Unchanged text: incorrect, “Nothing has changed yet. What needs fixing?” This miss counts as a try.
- Changed but not accepted, and no rule list: “Not quite yet…” (cloze: “Read the whole sentence with that word. Does it fit?”).
- Cloze: no Check button; filling the last blank grades immediately, as above.
- With `rules`: graded by the production order in [Write and edit rules](#10-grading-and-correctness).

**Write / fill / expand.** Empty or framed text. Frame fills use the frame grader. Rule lists use the production grader. A `___` still in the text is incorrect: “Fill each ___ first.” and does not run the rest of the rules. Two-try reveal shows “One way:” plus the first `accept` string, or the reason if there is no accept list.

**Reflection (Lesson 9 only).** Prompt is the reflection question. A keyboard field opens on “One thing I changed was ___ because ___.” No Check, no correctness. Next is available immediately. Pressing Next marks the screen seen and marks the report done. After that, the page states that the book is finished.

### P5 Write — Check my writing, or Hand in

No single “Correct → Next.” Each phase has its own primary action.

**Apply (`purpose: apply`).** Prompt is the apply task’s ask, large, plus the tip. A short writing canvas. Word grid level follows the page (Lesson 1: words). Live Coach nudges may appear while typing; they are not a grade.

- **Before submission:** if the draft has fewer than 3 counted words, the button displays “Write a little first” feedback and **no attempt is counted**. **CJK ratio over 30% is different in the current original flow**: if the draft has at least 3 counted words, `P5.applyCheck` still submits to `AI.checkApply` (or its offline fallback), receives a failed English-sentences result in offline mode, and **increments `A.tries`**. It is not a no-try early return. English-language feedback and criteria remain localized at the UI layer under Mode B.
- Otherwise the footer **Check my writing** (later **Check again**) submits. The button reads “Reading…” until the result returns. A safety match (self-harm or harm-to-others phrases) shows “Please show your teacher,” does not pass, and does not complete the page.
- Passed when every authored criterion is met. The page is then marked done and Next opens. Feedback is a margin note, not a correct/incorrect stamp on the canvas. A glow quote is separate praise.
- A failed check leaves the page open, stores the result, and shows the first failed criterion’s tip. The second failed criterion can appear as an extra “Also” hint. Editing after a result does **not** invent a new grade; the last result stays until Check again.
- After `continue_after` failed checks (Lesson 1: 2) a **Move on for now** link marks the page done without a pass. Next then opens.

Offline Apply for Lesson 1, used whenever the model service is off or its reply is unusable. Lines are non-empty newline chunks; if that yields one chunk, sentences split on `.!?` are used instead.

| Criterion | Met when |
| --- | --- |
| Three topic sentences | At least 3 lines |
| Each one tells an opinion | At least 3 lines match the opinion pattern and contain “garden” |
| Each one is about a school garden | At least 3 lines contain “garden” |
| The three sentences are different | At least 3 garden-opinion lines, each pair below similarity 0.8 |

Opinion pattern: I think / I believe / I feel / I know / in my opinion / should / shouldn’t / must / ought to / is better / are better / would be better / the best / is the best / I agree / I disagree / it is important / we need / need(s) to.

**Draft.** Shows the chosen plan question, a guide of hamburger parts, and the draft canvas. The plan note is pinned beside it. **Hand it in** is the footer.

- Under 60 words, the first press does not submit. It warns that about 80 words is the goal and asks for more or a second press. The second press submits.
- Hand in stores the draft segments, copies them to the final region, scores the paragraph, marks the draft page done, and moves to the comments screen (or the lesson break if that screen ends a lesson).

**Read comments.** Shows the handed-in draft and up to two comment cards plus a glow. The paragraph stays editable until a second draft exists. Editing it does not grade and does not complete the screen. This screen is a seen-page: Next is available without another Hand in. After a second draft exists, the paragraph on this screen is read-only and the prompt points to the review screen for those comments.

**CUPS / Hand it in again.** The final canvas stays editable until the second draft exists. Four CUPS checks are ticks the learner sets; they are saved and are not a grade. If the edit ratio against the first draft is under 0.02, the first **Hand it in again** does not submit and says no change is visible. The next press submits, stores draft 2, and advances to the review screen.

**Review / Finish.** Read-only final text, second-round comments, and a diff-style read of what changed. **Finish my paragraph** sets finished, marks the feedback page done, and advances to the book page.

### P6 Plan — fields, then Check my plan, then Start writing

**Layer.** One hamburger. Only the fields named on that screen are editable; the others show as compact filled lines. A field counts once it has text with pictures removed. Next stays closed until every field on the screen has text. The footer still says Next, but it stays genuinely disabled until each required field contains text; inactive presses never run grading or increment attempts. An “Ask yourself” note follows the focused field. It is guidance, not a grade.

**Whole plan.** All slots editable. **Check my plan** (then **Check again**) sends the six fields. A field is not ok when it is empty, the opinion has no opinion signal, the text is only vague words or a single word, or the two reasons are the same or similarity ≥ 0.6. Ok on every field marks the plan done. Comments name up to two weak fields. After two checks that are not ok, **Start writing anyway** marks the plan done without a pass.

**Recap.** Read-only plan plus the draft guide. No Check. The footer forward label is **Start writing**. Pressing it marks the screen seen and opens the draft.

### P7 Check — answer all questions, then Hand in

One Check screen is four questions: three drawn from the page pool, then the page’s writing item. Display the current Question as one prominent numeral at upper-left rather than a visible count phrase. The grid is off. An accessible assessment announcement may communicate “No grid and no help this time” where useful, without introducing an extra visible count bar. Hints and reveal are absent. Lesson progress does not move when the question index moves.

**Which three.** For attempt `a` (starting at 0) and pool length `P`, auto items are pool slots `(a×3 + 0) % P`, `(a×3 + 1) % P`, `(a×3 + 2) % P`, then the writing item. Lesson 1 pool order is `tq1`, `tq2`, `tq3`, `tq4`, `tq5`, writing `L2-04.mw`.

- Attempt 0: tq1, tq2, tq3, writing.
- Attempt 1: tq4, tq5, tq1, writing.

**While answering.** The learner can open any question from the dots (their function is retained without adding a second verbose “Question n of 4” label). A dot shows that the question has an answer. Select and edit behave as on P3/P4 except:

- No per-question Check button, no cloze auto-grade, no build grid, no tries, no reveal.
- A pick is answered when at least one option is selected. A tap-word is answered when a word is selected. A label is answered when every line has a category. A write or edit is answered when the text is non-empty and different from the printed start or given sentence.
- Footer **Next question** / **Back** only change the question index.
- On the last question the footer is **Hand in my check**.

**Blank warning.** If any question is unanswered, the first Hand in does not grade. The Coach names the blank question numbers. The footer becomes **Hand in anyway**. The next press grades the paper as it is. Blank picks and blank writing are incorrect.

**Grade at Hand in, once.** Each question uses the same item grader as practice (choice list, tap-word target, label map, or production rules). Nothing is re-graded because the learner opens the result row.

**Pass rule.** Let `autoCorrect` be how many of the three auto items are correct, and `writingCorrect` the writing item. Pass when `autoCorrect ≥ 2` and `writingCorrect` is true. Score shown is auto-correct plus 1 if the writing item is correct, out of 4.

**Results.** “You passed this check.” or “Not yet.” plus “s of 4.” Each row opens that question in graded form: options disabled, right and wrong marked, and the graded sentence in the margin. “All results” returns to the list.

**Try a new set.** Shown on the results view whenever the aggregate Check state is **not passed**, including after the second submitted set in Review. It increments the attempt (the source's rotating pool supports attempt 2+), clears the internal question index/graded view and blank warning on hand-in, and keeps answers separate by attempt. The first failed hand-in (attempt 0) does **not** complete the Activity Screen, so the lesson cannot advance yet. The hand-in of attempt 1 completes the Activity Screen whether or not it passes; Next (or End of lesson) opens. Later optional Review attempts remain available when the Check is not passed; they do not reset already-complete lesson progression. A pass is sticky across later sets. **The original `handIn` calls `Skip.checkFailed` on every non-passing submission, including the first set**, so an active skill skip can be revoked immediately at the first failed Hand in, not only after a later retry. Confirm any intended change to this skip rule with Product Owner before altering it.

If the model service is used for paragraph scores elsewhere, Check items themselves stay on the item grader. They are not sent out as a free-form grade.

## 10. Grading and correctness

**Choice.** Sorted selected indexes equal sorted answer indexes, or the `any` rule above.

**Tap-word.** Selected token index is in the set of located targets. Location is case-insensitive, strips characters that are not letters or apostrophes, and uses `occurrence` when the same word appears more than once.

**Label.** A category index on every line, each equal to the authored answer.

**Exact text.** Normalize curly quotes to straight quotes, collapse whitespace, trim, and compare. Used for `accept` lists and for build `answer_text`.

**Frame fill.** The frame’s literal words must remain, in order. Each `___` must be replaced by at least `min_words` real words and must not still contain a blank. If the frame marks the last blank vague, a last blank that is only “good / nice / fun / cool / great / bad,” with optional it is / so / very / really, is incorrect. Success uses the item’s ok line.

**Production rules, in order.** Stop at the first failure.

1. Fewer than 2 words → write a little more.
2. More than 30% CJK characters → write this one in English.
3. Each `mustInclude` pattern, case-insensitive.
4. Each `mustNotMatch` pattern.
5. `noRunOn`: any sentence that still runs on fails.
6. `minWords`, after the item’s optional strip pattern.
7. `notVague`: after the strip pattern, the text is only vague words.
8. `capital`: first letter is a capital (optional opening quote).
9. `endPunct`: ends with `.` `!` or `?`.

Success uses the item’s ok line. On a practice miss, if the item lists diagnose ids, the Coach adds the first matching diagnosis (unchanged, blank, run-on, capital, end mark, comma after a linking word, missing link, no opinion, no reason, off topic, too short, order). That diagnosis is feedback for an already-run check. It is not a new check.

**Lesson 1 writing item on the Check** (`L2-04.mw`). Prompt: write a topic sentence for “Should kids have a pet at home?” Correct only if all of these hold: at least one of think / believe / should / best / opinion / feel; the word pet or pets; at least 5 words; a capital; an end mark. Ok line: “Yes. It answers the question and tells me what you think.”

## 11. Skill skip and lesson boundary

Skill status is `learning`, `practice`, `writing`, `review`, or `frozen`. Skipping is allowed unless a teacher turns it off. Status arrives from the mastery record (in this product, from settings or a `skills` query). It is not a button the learner sets.

| Status | On the skill’s first teach screen |
| --- | --- |
| `writing`, and skip is allowed | The step is already skipped. A note says it is mastered and can be reviewed. Every screen in the step counts done and adds 0 minutes. |
| `practice`, and skip is allowed | An offer: **Skip this skill** or **Review it**. |
| `learning`, `review`, `frozen`, or skip disallowed | No offer. |

**Skip this skill** stores the choice, logs it, gives no new evidence, re-counts lessons, and jumps to the first screen after that step. **Review it** stores the choice and stays on the teach screen; the offer does not return.

Lessons are re-counted after a skip. A lesson whose own remaining minutes are 0 drops out. A lesson under 8 remaining minutes merges forward into the next lesson unless it is marked short. The last lesson is kept.

**The Check stays available.** If that skill’s Check is handed in and does not pass **on any attempted set, including the first**, and the step was skipped, the original `P7.handIn` calls `Skip.checkFailed` immediately: the skill returns to `learning`, the skip choice is removed, and the step is no longer done. A pass does not of itself create skip evidence.

**Lesson break.** End of lesson shows how many screens in the lesson are complete, names the next lesson and its minutes, and offers **Stop for today**, **Back to my path**, and **Keep going**. Stop for today and Back to my path both set the resume screen to the start of the next lesson. Keep going opens that screen. The stopped view says the work is saved on this device and offers a return to the path. Starting the next lesson clears the stopped flag and shows Welcome back once.

## 12. Lesson 1 — eight authoritative per-Activity contracts

**Scope:** L2 / G2-O / Lesson 1, Topic sentences. These eight records are the only required Lesson 1 Activity Screens. The table below is a **routing index**, not a substitute for the item contracts. The screen, task, and authored options are grounded in `apps/writing/source/alex-original.html` at source blob `c06c8db7317092f081febcebc9eb70979d357c11`. Template-specific behavior follows chapters 5, 7, 9–10; each entry below gives exact fixture values, state transitions and acceptance. Design visual treatment is normatively specified in root `DESIGN.md` section **Writing Activity layout variants**. Component IDs refer to the component registry, not necessarily implemented components; “planned” components must not be mistaken for usable current production code.

### 12.1 Stable identity and template / variant routing

| # | Screen ID | Template ID | Layout Variant ID (canonical) | Required component responsibilities |
| --- | --- | --- | --- | --- |
| 01 | `L2-04.learn` | P2 | `P2.rule-pair.hamburger` | BA-WR-001 TopBar, BA-WR-002 Workspace, BA-WR-004 HamburgerLayer |
| 02 | `L2-04.t.ts1` | P3 | `P3.list.option.single` | BA-UI-003 BAChoice (single) + feedback status + BAButton |
| 03 | `L2-04.t.ts4` | P3 | `P3.passage.word.single` | Word-token selection adapter + feedback status + BAButton |
| 04 | `L2-04.t.ts3` | P3 | `P3.list.option.multi` | BA-UI-003 BAChoice (multiple) + feedback status + BAButton |
| 05 | `L2-04.t.ss.L2-04` | P4 | `P4.build.word.guided-order` | BA-WR-003 WordGrid + read-only build bench + feedback |
| 06 | `L2-04.t.ts8` | P4 | `P4.fill.chunks.frame` | BA-WR-003 WordGrid + editable frame/field + feedback |
| 07 | `L2-04.apply` | P5 | `P5.write.constraint-apply` | Writing canvas + **BA-WR-003 WordGrid** (four category tabs) + Coach semantic feedback + BAButton |
| 08 | `L2-04.check` | P7 | `P7.assessment.3-auto-1-writing` | Internal question pager + choice/write variants + BAButton |

**Authored WordGrid availability and groups (source-derived product behavior):**

| Activity | WordGrid content groups, in order | Visibility and behavior |
| --- | --- | --- |
| 05 · Guided Word Build | `set` (Sentence set; source `type=build` takes precedence over inherited page groups) | The ordered word-card set is the task input. With only one active group, keep the grid and word cards but omit a decorative one-item tab strip. |
| 06 · Frame Fill | `task` → `opinion` → `marks` | Three real, switchable content groups while filling the sentence. The task's own `grid.tabs` explicitly selects these groups. |
| 07 · Apply | `opinion` → `nouns` → `adjectives` → `marks` | Four real, switchable category groups. Original page `grid.level=words`; preserve their authored English/Chinese labels and category content. |
| 08 · Mastery Check | No usable WordGrid; `grid.level=off` | Do not expose selectable vocabulary groups during the check; keyboard writing and independent grading remain. |

The word bank is an **input aid**, never a multiple-choice answer selector. Switching tabs changes the visible vocabulary set and saves the active category for return; it must not clear the writing draft, affect the insertion caret, call the grader, count attempts, unlock a Screen or trigger celebrations. Pressing a word card, by contrast, inserts content into the active editable area, except on Screen 05 where it performs the dedicated ordered-build action. Groups and word cards come from the original authored configuration, not from hardcoded screenshot text. A single-group build uses the same underlying category semantics without a redundant tab header. Tab label, content and active state must remain accessible to keyboard and touch users.

**Global shell mapping:** all eight use `BA-WR-001` and `BA-WR-002`; activity status/progress maps to `BA-UI-006` ActivityScreenIndicator; action controls use `BA-UI-001`; contextual semantic feedback maps to `BA-UI-007` (planned foundation). The anchored full-index overlay is owned by the shared BA-UI-006 implementation; do not create a second independently styled indicator. Product-specific word selection, build bench, text editor and P7 pager have no separate approved reusable Component ID yet: treat as internal template composites, **not** as new imaginary shared components. Component existence/status is controlled by `components.json`. Screen 8 has four internal questions but contributes only **one** TopBar Activity Screen.

### 12.2 Shared activity state machine and persistence

1. **Entry:** an unlocked Activity Screen opens with previously saved response and attempt status, if any; untouched practice is `open`. Screen 1 is read-only and can advance without grading. TopBar `selected` is a navigation state, independent of `done/shown/skipped`.
2. **Answer editing:** selection/tap/typing changes the working response only; it does not check, add attempts, emit correctness feedback, unlock the next Activity Screen or celebrate. Existing validated result remains until the learner explicitly checks again in templates that support revisions.
3. **Check action:** only the template's authorized gesture runs the grader. For practice P3/P4 first wrong → `open` plus retry/feedback, next screen locked. Second wrong → `shown` with authored solution and zero credit, next screen available. Correct → `done` plus success feedback and then Next. For ordered Build, a wrong card tap leaves the full-line try unchanged, and the hint for a word tile appears after two wrong taps on that word. See Screen 05.
4. **P5 Apply:** two failed completed submissions allow `Move on for now`; no success grade is invented. **P7 Check:** internal question edits and Next question do not grade; only Hand in grades the whole assessment; the second submitted set can finish without mastery.
5. **Exit/Back/refresh/reentry:** preserve response selections, text, tries, wrong marks, hints, per-question P7 answers/index, completion and reveal state in the canonical state record (chapter 6). No separate UI-only progress store. Keyboard, touch, focus and reduced motion may alter presentation, never these gates.
6. **Navigation ownership:** the top-left LessonTopBar Back is the **only Lesson-to-parent navigation control** and returns to E-01. The bottom-right Footer button group only navigates and performs required actions *within the current Lesson*: Previous goes to the preceding Activity Screen (disabled on Screen 1), the primary button checks/submits or moves forward when allowed. P7 question Back/Next operate inside the same Check; on its first question, Back may return to the preceding Activity Screen without leaving the Lesson. These Footer controls never duplicate the parent-level Back. Never make every screen “correct → Next”.

### 12.3 Screen 01 — Learn · `L2-04.learn`

- **Identity:** skill `L2-04`; `kind=learn`; `template=P2`; `variant=P2.rule-pair.hamburger`; `params.body=rule_pair`, `diagram=hamburger`, `skip_offer=true` from authored source.
- **Authored teaching:** “A topic sentence tells the topic and what you think.” Weak / Not yet example: “Gardens have plants.” Better example: “Our school should have a garden for two big reasons.” The hamburger/top bun explains topic + opinion; use the source's authored EN/ZH teaching strings.
- **Interaction:** read-only instruction. Next is available once this screen is seen. The Better panel uses a pale green fill and a leading check. That cue is pedagogical.
- **Skip offer:** only according to skill's eligibility `skipMode`, chapter 11; an offer or skip never runs on mere visual rendering.
- **Persistence:** `seen` and authorized skip decision; no fabricated answer attempt.
- **Acceptance:** screen 2 starts locked; learner can read and Next to it, or take a legitimately offered skill-skip route. Both EN/ZH teaching variants preserve the same meaning; no P2 success celebration.

### 12.4 Screen 02 — Single Pick · `L2-04.t.ts1`

- **Identity:** task `ts1`; `type=pick`; `template=P3`; `variant=P3.list.option.single`; params `layout=list,unit=option,pick=single,scored=auto`.
- **Question:** “Which one is a good topic sentence for a school garden? Tap it.”
- **Options in exact source order:** A (0) “Gardens have plants.”; B (1) “Our school should have a garden for two big reasons.”; C (2) “I like flowers.”
- **Answer:** index `[1]`, B only. Use source Engine `choiceGrade`; do not infer correctness from option colors.
- **Flow:** `open/no-choice` → select one radio-like row (`selected`, no grade) → Check enabled → correct: `done`, authored rationale and Next; first wrong: record try 1, mark selected wrong and clear it for retry, stay here; second wrong: `shown`, B shows the revealed check icon, and Next is available without credit.
- **Feedback:** option-specific reason from authored `coach.options`; show Check feedback only after Check, not while selecting.
- **Persistence:** selected index, wrong row marks, tries, status, revealed answer and feedback context.
- **Acceptance:** selection of A does not unlock screen 3; after a failed Check the option can be changed; B correctly checked unlocks screen 3; second wrong reveals B but never pretends “correct”.

### 12.5 Screen 03 — Tapword · `L2-04.t.ts4`

- **Identity:** task `ts4`; `type=tapword`; `template=P3`; `variant=P3.passage.word.single`; params `layout=passage,unit=word,pick=single,scored=auto`; task `need=one`.
- **Question and passage:** “Tap a word that tells you this is an opinion.” / “I believe our class should get a pet fish.”
- **Answer:** precisely one chosen word matching **either** authored target `believe` or `should`; punctuation and word occurrence are interpreted through original `targets[].at` + occurrence rules. Two targets are alternatives, **not** two required selections.
- **Flow:** no chosen word → tap an eligible token (only one current selection; tap selected word again to deselect) → Check → success: `done` with opinion-word reason; first wrong: `open` + word-specific authored feedback and retry; second wrong: `shown` with acceptable targets and Next, no credit.
- **Persistence:** exact token index/target occurrence, tries, status and reveal; never save merely the display string when occurrences can be ambiguous.
- **Acceptance:** both “believe” and “should” pass individually; “class” does not; pressing a word never grades or advances; keyboard token selection has a visible focus and equivalent Check.

### 12.6 Screen 04 — Multi Pick · `L2-04.t.ts3`

- **Identity:** `ts3`; `type=pick`, `multi=true`; `template=P3`; `variant=P3.list.option.multi`; `layout=list,unit=option,pick=multi`.
- **Question:** “Some of these tell an opinion. Some are just facts. Tap every opinion.”
- **Source options:** A (0) “Dogs are the best pets for families.”; B (1) “Many families have dogs.”; C (2) “In my opinion, every kid should learn to swim.”; D (3) “The pool opens at 9:00.”; E (4) “School lunch should have more fruit.”; F (5) “Lunch is at noon.”
- **Answer:** set `{0,2,4}`, regardless of selection order. Exactly these three options. The source `choiceGrade` compares sorted indices; do not grade a correct partial set as fully correct.
- **Flow:** checkbox-like independent toggles, `Choose 3 · k chosen` indicator, no grading until Check; first wrong retains selections and gives reason for one wrong option or “You found r of 3”; second wrong reveals A/C/E, sets `shown`, enables Next with no credit; correct Check sets `done`.
- **Persistence:** selected index set, tries, wrong marks and answer-revealed state.
- **Acceptance:** multi-select allows simultaneous A/C/E; no radio behavior, no auto-grade when the third option is selected, zero credit on forced reveal.

### 12.7 Screen 05 — Guided Word Build · `L2-04.t.ss.L2-04`

- **Identity:** task `ss.L2-04`; `type=build`; `template=P4`; `variant=P4.build.word.guided-order`; params `action=build,input=set,build_unit=word,order=guided,distractors=0`; `in_order=true`.
- **Question:** “Build this topic sentence with the grid, one word at a time: ‘Our school should have a garden for two big reasons.’”
- **Exact source `cells` and `target` order:** `our | school | should | have | a | garden | for | two | big | reasons | .`; authored `answer_text` “Our school should have a garden for two big reasons.”
- **Flow:** A WordGrid card press tries to append the next token in the fixed order. The correct next token appends and updates the bench. Each remaining blank is an underline, one horizontal line for each word still to place. A wrong token stays off the bench, gives a brief nonblocking error, and adds one wrong tap on that word tile. After two wrong taps on that same word, the hint for that word is shown. A completed full line is one full-line try: a correct line finishes `done` and Next opens. A defensive wrong full line clears after a delay; the second wrong full line reveals the authored sentence (`shown`, zero credit, Next). With `in_order=true`, a word tap matches the next target, so a wrong full line is only that defensive path.
- **WordGrid:** the Approved panel is a peach bank with connected sticky tabs 本题词块, 观点, and 标点, and white pill cards. The active tab joins the bank. Empty slots on the bench stay underlines. A placed word stays in the line. Switching a tab changes the visible cards. Grading stays the ordered-build rule above.
- **Actions:** word-card taps, and the Coach-rail button group (Previous and the contextual primary). A placed word stays in the line.
- **Persistence:** token sequence, each word tile’s wrong-tap count, full-line tries, and reveal status. Revisit restores the build sequence and those per-word counts.
- **Acceptance:** an incorrect token stays off the bench; each remaining blank is an underline; a wrong-token tap leaves the full-line attempt count unchanged; the hint for a word is shown after two wrong taps on that word; a tap on a placed word leaves that word in the line; the finished target matches the normalized answer and completes the screen; reduced motion still presents the wrong-next-token feedback as text.

### 12.8 Screen 06 — Frame Fill · `L2-04.t.ts8`

- **Identity:** task `ts8`; `type=write`, `template=P4`; `variant=P4.fill.chunks.frame`; params `action=fill,input=chunks,source=frame,scoring=rule+ai`.
- **Question:** “Finish my sentence about recess. Fill each ___.”
- **Printed frame:** `In my opinion, recess should ___ because ___.` Preserve prefilled text; two editable blanks remain distinguishable from fixed words.
- **Rules from authored `frameFill`:** first blank `min_words=2`, second `min_words=3`, `vagueLast=true`. Sources also offer chunks such as `be longer`, `stay the same`, `kids need`, `time to run`, `and play`, `to rest their brains`. Do not treat source chunks as the only accepted free-writing responses unless the grader explicitly requires them.
- **WordGrid:** the task configures `task → opinion → marks`, shown as the Approved peach bank with connected sticky tabs 本题词块, 观点, and 标点, and white pill cards. The active tab joins the bank. Selected tab and content stay synchronized. Clicking a vocabulary card inserts into the focused editable blank and preserves the full draft.
- **Flow:** fill or edit blank text using keyboard and permitted WordGrid insertion, then Check. An unfilled `___` fails early. Valid response must keep the frame, meet both minima, and provide a non-vague reason after because. Correct → `done` with authored feedback and Next; first wrong → feedback/retry; second wrong → `shown` with one model answer or diagnostic reason and Next without credit.
- **Persistence:** fixed frame identity, both editable blank responses / typed source segments, attempts and result; focus and caret must not be lost when grid inserts.
- **Acceptance:** a remaining blank never passes; too-short reason fails; accepting multiple meaningful reasons rather than one hardcoded phrase follows the source's rule-driven grader.

### 12.9 Screen 07 — Apply Writing · `L2-04.apply`

- **Identity:** `kind=apply`; `template=P5`; `variant=P5.write.constraint-apply`; params `purpose=apply,phase=draft,input=words,feedback=constraint,evidence=apply`.
- **Question:** “Write 3 different topic sentences for: Should our school have a garden? Put each one on a new line.” Three distinct sentences, not one long paragraph. Coach repeats the garden topic and three different ways.
- **Four criteria (all required):** ① at least three nonempty sentence/line chunks; ② at least three lines express an opinion and mention `garden`; ③ at least three lines mention `garden`; ④ three garden-opinion lines have pairwise similarity below 0.8. Use the existing source/PRODUCT chapter 9 offline criteria and fallback order; do not invent AI judgments or additional grading thresholds.
- **WordGrid (required):** `BA-WR-003` supplies four switchable authored word categories in this exact order: `Opinion → Nouns → Adjectives → Marks` (`page.grid.level=words`), shown as the Approved peach bank with connected sticky tabs and white pill cards. Mode B tab labels are 观点, 名词, 形容词, and 标点. The active tab joins the bank. The original words stay as authored. Each tab reveals that group's available words. Tapping a word inserts it at the writing canvas caret or active editable region. Switching tabs changes the available vocabulary and preserves the three-sentence draft, the insertion location, and the grading state. The word bank helps writing. Grading uses the authored criteria.
- **Flow:** editable writing canvas, live nonscoring Coach guidance. A draft with **fewer than 3 words** returns the early writing prompt without an attempt. For a draft with 3+ counted words, Check submits and increments the attempt even if the **offline validator rejects over 30% CJK characters** (source behavior; previously misdescribed as no-try). `Check my writing` (subsequent `Check again`) submits only upon learner action, showing Reading… while awaiting response. Passing all criteria → screen completed, Next available; failed submission → diagnostic feedback and remain on screen. After two counted failed submissions, enable **Move on for now**; choosing it completes the screen **without passing**.
- **Safety:** an authored safety match returns `safety_flag=true`, displays a teacher-directed message and does **not itself** pass or complete the page. The current source nevertheless increments the submitted attempt for a 3+-word safety result, and its ordinary two-failed-check `Move on for now` guard does not explicitly exclude safety-flagged results. Treat this as a **source-observed edge case requiring Product Owner review**, not an approved recommendation to display Move on in a safety situation. Never mistake live writing nudge, quote highlight or optimistic Coach copy for scoring.
- **Persistence:** full draft, saved check result, attempt count, completed-with-pass versus completed-without-pass distinction, relevant feedback.
- **Acceptance:** editing does not auto-grade; first failed submission cannot advance; second **counted** failure offers Move on in the ordinary path but never paints a success badge or triggers correct-answer celebration; a genuine pass completes normally. A three-word-plus CJK-heavy submission is a counted failed attempt under current source; separately flag safety-flagged submissions for owner decision before claiming their move-on treatment is final.

### 12.10 Screen 08 — Mastery Check · `L2-04.check`

- **Identity:** `kind=check`; `template=P7`; `variant=P7.assessment.3-auto-1-writing`; authored params `purpose=mastery,preset=assessment,items=3 auto + 1 writing,pass_rule=>=2/3 auto AND writing correct,second_set=true`.
- **Internal structure:** this is **one** Activity Screen with four internal questions, three automatically graded and one written response. Question pager controls only the P7 internal index. Do not create 4 extra TopBar steps, per-question graded stamps or practice hints.
- **Source-derived order rule (chapter 9):** pool `tq1,tq2,tq3,tq4,tq5` plus writing `L2-04.mw`; first set `tq1,tq2,tq3,mw`; second set `tq4,tq5,tq1,mw`. Every individual question renders its own authored response type (pick/tapword/label/write) with the same input grammar, but **no** per-question Check or reveal.
- **Original authored assessment item fixtures, no invented questions:** the first set uses `tq1` (single pick: “Question: Should every student learn to cook? Best topic sentence?”; options A “Cooking uses pots and pans.”, B “I believe every student should learn to cook.”, C “My mom cooks rice.”; answer **B/index 1**), `tq2` (single pick: “Which sentence is a FACT, not an opinion?”; A “Soccer is the best sport.”, B “Kids should play outside more.”, C “Our school has 300 students.”; answer **C/index 2**), and `tq3` (tapword: “Our town should build a bigger library.”; the only correct token is **should**). The second set uses `tq4` (single pick: “Question: Is it better to live in a city or a village? Which topic sentence matches?”; A “I think living in a village is better than living in a city.”, B “Cities have tall buildings.”, C “My cousin visited Tokyo.”; answer **A/index 0**), `tq5` (single pick: “Which topic sentence is TOO NARROW (too small) for a whole paragraph?”; A “I think our school should start later in the morning.”, B “My shoe is blue.”, C “Kids should have a pet at home.”; answer **B/index 1**), and `tq1` again. Each set ends with `L2-04.mw`: “Write a topic sentence for this question: ‘Should kids have a pet at home?’ Tell your opinion.” Its source `rules` require an opinion signal `think|believe|should|best|opinion|feel`, `pet` or `pets`, at least **5 words**, initial capital and terminal punctuation (`.`, `!`, or `?`); this is **not** an arbitrary AI grade. The authored Chinese `ask.zh` and `coach` copy localize the UI but do not translate the English options/passage/fixed writing material (language mode B).
- **Flow:** select/type answer → Next question / question dots change internal index only. Blank answer on any question: first **Hand in my check** warns once and identifies blank question numbers without grading; next **Hand in anyway** grades current responses including blanks as incorrect. Hand in grades the full paper once. Passing requires `autoCorrect >= 2` **AND** writing answer correct. On first failed set show diagnosis/feedback and **Try a new set**. The second set can complete without mastery; only a genuine passing check grants mastery. Afterwards the Lesson Screen is complete and Footer may show **End of lesson**. In Review, a Check which is finished but not passed can still show **Try a new set** for an optional further attempt, without undoing the Screen-completed state. If a skill had been skipped, the very first failed Hand in invokes skip revocation in the original handler.
- **Persistence:** attempt set index, current P7 internal question index, four independent responses, once-only blank warning, per-item feedback results, pass/fail outcome and mastery flag. Saved answers restore on leave and return.
- **Acceptance:** answering all four questions without Hand in never grades; answering 3 auto correctly with bad writing still fails; correctly writing with fewer than 2 auto still fails; first failed set offers new set, second submitted set ends even when unmastered; finished-unmastered Review permits another optional set; each attempt stores independent answers; a failed first Hand in immediately revokes an active skip; reduced motion never blocks Hand in.

### 12.11 End-to-end acceptance contract

- Exactly eight TopBar Activity circles in this lesson; no separate P7 question circles at lesson level. Screen IDs do not change when visually restyled.
- Each Screen's template ID + variant ID and component responsibilities must match the table and detailed contract above; do not flatten P3 single vs multi or P4 Build vs Frame.
- Exercise no-answer, partial, correct, first incorrect, second incorrect/`shown`, navigation back/forward, exit and reload, both EN/ZH, focus/keyboard/touch, and reduced motion where applicable.
- Run both P7 submission sets and prove mastery is **not** awarded from an unmastered finish. Save and restore each Screen's answer and attempts. Product grading must not depend on animation or presentation color.
- Real source implementation gaps are recorded in `docs/design-system/WRITING-REQUIREMENTS-TRACEABILITY-v1.md`. **They are not permission to weaken this specification.**

## 13. Writing visual and spatial product constraints

- **Scope:** Visual and spatial refinement only. Preserve all authored content, exact graders, retry/shown, screen gates, P7 assessment, saved answers and resume. Start/Continue remain **internal progress actions** but share one Enterable visual; Completed/Locked are the other visual roles. Keyboard/touch and reduced-motion behavior remain intact. The Writing demonstration remains eight Activity Screens.
- **E-01 full-bleed stage (`v2-terraces`):** the path landscape is layered terraces. Separate platforms sit on a stack of mountain layers. LandscapeBackdrop (BA-WR-009) paints the stack. From back to front: the sky gradient `linear-gradient(135deg, #85DBF9 0%, #F8F4ED 100%)`, clouds, hill 2, hill 1, then the lesson platforms and cards. The landscape fills the stage, including the area behind the level header. Level navigation and the language selector stay usable and leave the nodes clear. The scenery ignores pointer events and leaves course state unchanged.
- **Path scroll:** drag, wheel, and keyboard movement along the staircase move the scenic layers horizontally slower than the cards. Farther layers are slower: hill 1 (foreground) is faster than hill 2 (mid), and the clouds and sky are slower still. Lesson platforms and cards stay locked to the path steps. Those speeds are computed from the card/node count and the resulting track length and camera max travel, so the layers stay covered across the full path. Hill and mountain art width alone is not coverage gained by scrolling those layers at the same horizontal speed as the card/camera track. The motion does not change the current lesson, score, or saved progress. The normative parallax rule and the sky gradient are in DESIGN.md. The stage background is `linear-gradient(135deg, #85DBF9 0%, #F8F4ED 100%)`.
- **Path art:** use version **`v2-terraces`** and these ids only.
  - `path.v2-terraces.hill-1-foreground` — foreground mountain layer — `apps/writing/public/path/v2-terraces/hill-1-foreground.png`
  - `path.v2-terraces.hill-2-mid` — second / mid mountain layer — `apps/writing/public/path/v2-terraces/hill-2-mid.png`
  - `path.v2-terraces.cloud` — floating sky cloud — `apps/writing/public/path/v2-terraces/cloud.png`
  The Writing app serves them at `/path/v2-terraces/<file>`. Compositing and placement are in DESIGN.md.
- **Camera visibility:** on the v2-terraces Path, the stage does not clip content at the top or bottom of the usable viewport. The header, cards, platforms, and hill/cloud layers stay in that viewport. Hiding overflow is not the way to cut cards or terrain. Footer and dev banners do not eat the stage. Drag, wheel, keyboard, Home, and End reach the complete first and last nodes, including card bounds, decorative platforms, the sticky header, and viewport padding. The far-left/lower and far-right/upper nodes stay fully reachable.
- **Lesson platform:** LandscapeTerrace (BA-WR-010) specifies 2–3 shallow rounded grass layers under each node, in front of hill 1. The interim scene uses one platform per node. Lesson card bottom anchors and path navigation geometry stay as this chapter and chapter 16 define them. Platform colors and curves are designer-review candidates [E].
- **Lesson state:** Number Seal + Attached Symbol. The lesson number stays dominant in the seal. A small attached symbol carries current, completed, or locked. The accessible name carries the status. State gates stay as authored. Exact icon geometry is a designer review candidate.
- **Unit fold:** every Unit card uses a continuous upper-right paper fold, not a detached square sticker. The fold seam meets the top/right edges and card border terminates naturally. The fold is decorative. **Unit and Lesson card titles use the same system Typography token** (Dosis 24px/800/30px in English, existing Chinese heading mapping). Goals stay plain paragraphs.
- **Lesson card:** three title lines are the default for StairLessonCard in both library and page. The full accessible title is retained; duration remains directly below as number + localized unit, left aligned. CTA uses shared BAButton (height 70px), all approved hover/pressed/focus and reduced motion states. Outer/inner radius follows concentric relation rather than independent unrelated values.
- **Activity hierarchy:** one primary separation treatment per structural boundary (surface, stroke, or divider, each with its own job). Previous and the primary action sit at the bottom of the Coach rail, below the independently scrolling transcript, at 1:2 with an 8px gap and 70px heights. Quiet neutral container strokes leave interactive focus and graded borders readable. Decrease gaps between peer content containers by one existing spacing scale step. The Unit title uses the same Typography level as the Lesson title. Hit targets stay as specified.
- **Lesson question feedback:** each feedback message sits in its own card. A wrong message uses a white background and a light border. A correct message uses a white background and a green border. Previous and Next sit at the bottom of the Coach rail. The hint control is a secondary button. Card fill and border are a visual candidate in DESIGN.md. The treatment applies to every lesson question feedback UI.
- **TopBar:** icon-only Back to Staircase remains 50×50, lesson identity fills the available safe left-hand width, and the title wraps to no more than two lines before truncation. ActivityScreenIndicator remains centered against the whole header, not pushed aside by long text; on narrow screens it may occupy a second centered row. All numbered progress markers show their screen index with no attached status icons; finished = dark fill/white number, locked = disabled colors, skipped = dashed outline. A currently viewed completed or skipped screen retains that status treatment plus an outer selected ring. The TopBar has no divider below it. P7's internal question count is its own pager.
- **P2:** the Better example uses a pale green fill and a leading check. The cue is pedagogical.
- **WordGrid:** the peach connected sticky-tab bank and white pill cards are Approved. The ordered-build bank tabs are 本题词块, 观点, and 标点. The Apply bank tabs are Opinion, Nouns, Adjectives, and Marks (观点, 名词, 形容词, 标点). The active tab joins the peach bank. Ordered-build empty slots stay underlines. The ordered-build controls are the word cards and the Coach-rail button group. A placed word stays in the line. Storybook fixtures `MultipleStickyTabs`, `MultiGroup`, `Chinese`, and `WordWrapTablet` match these Approved visuals.
- **Visual source:** path artwork and version id are the `v2-terraces` files above. DESIGN.md specifies compositing, placement, the normative parallax rule, and the sky gradient `linear-gradient(135deg, #85DBF9 0%, #F8F4ED 100%)`.

## 14. Lesson TopBar and footer actions

**BA-WR-001 top bar.** No hamburger; overflow uses the approved numeric ellipsis/popover, not a second generic collapsible menu. Left: **50×50 icon-only Back** (returns to E-01 and saves/restores answers; no visible helper text), lesson number, and a lesson title that **fills the remaining safe width and wraps to at most two lines** with truncation beyond line two; necessary metadata can remain below. The title must not overlap the activity progress. Center: Activity Screen navigation stays geometrically centered across the **full header**, not in leftover width next to the title. On narrower layouts a second, full-width centered indicator row is permitted so the title and navigation remain readable. Right: no learner action. No horizontal divider below the bar.

Progress reads the live lesson screen list. Its marker renders the **screen number only** (no check or lock icons); the status remains available through accessibility labels and semantic styling. The displayed/selected screen is determined by its index independently from underlying `done/current/available/locked/skipped` status. A completed selected screen keeps its dark-filled white-digit appearance with an outer selected ring. A skipped selected screen keeps its dashed inner border and gains an outer selected ring. Locked screens retain disabled presentation. A marker navigates only when `canOpen` allows it; selection must not rewrite saved status, attempts, unlocking, or grades.

**Coach-rail navigation.** The button group at the bottom of the Coach rail controls **only current-Lesson navigation and actions**: one Previous (previous Activity Screen only; disabled on Screen 1) and one contextual primary (Check, Hand in, Next, and so on). The group sits at the bottom-right of the lesson. The top-left LessonTopBar Back is the **only control returning to the parent E-01 Staircase page**. The Coach-rail label is Previous. In P7 the question navigator replaces ordinary Previous/primary labels while answering; its first-question Back returns to the previous Activity Screen. Labels otherwise follow [page gates](#5-activity-screen-gates) and the template.

**Coach versus feedback.** On arrival, one orientation line, with “Show me another” only when the screen authored extra beats. That text is teaching. The hint ladder is a separate learner-invoked secondary button. Check feedback, Apply comments, plan comments, and draft comments are the result of a submit, and each of those messages sits in its own card. A selection change does not generate a new one. Live writing nudges (one suggestion and one specific praise) can appear during Apply, draft, and revise; they are not a score and they do not complete a page.

**Mode B.** Language selection changes presentation only: it never changes task IDs, answer indexes, authored graders, attempts, unlocks, mastery, the saved writing draft, or the learner's previous progress.

| Area | 中文 mode (zh) | English mode (en) |
| --- | --- | --- |
| Navigation and action buttons (top-left Back, Footer Previous / Next / Check / Hand in / Move on, level tabs, progress announcements) | Show the **authored Chinese UI label** only. English words in this specification denote action identity, not mandatory visible English copy. | Show the authored English UI label only. |
| Task instruction, teaching explanation, Coach arrival/hint/graded feedback, helper and error text | Render the existing authored `zh` text as the **primary and sole UI/explanation line**; do not repeat its `en` translation above it. | Render authored `en` text. |
| English Writing learning material (quoted example sentences, option sentences under comparison, tapword passage, ordered-build word cards, fixed frame, P7 assessment English response material) | **Keep the original authored English material** exactly where it is necessary for the English-language learning exercise. Do not translate, paraphrase or add Chinese into the graded input or token set. | Keep the same original English material. |
| WordGrid group tabs vs word-card content | Localize tab/category labels using their authored Chinese labels, e.g. Opinion → 观点, Nouns → 名词, Adjectives → 形容词, Marks → 标点; **preserve English vocabulary cards** for tapping/insertion. Any existing Chinese vocabulary gloss is optional supporting metadata, not a second duplicate page instruction or a replacement for the English word. | Category tab labels and vocabulary follow the authored English versions. |
| Learner-entered writing and its validation | Preserve the student's exact text and run the existing **English Writing** validators, including the original CJK-content constraint where applicable. Chinese UI does not make a Chinese essay valid for an English-language Writing task. | Same graders and same persisted text. |

If an existing authored Chinese UI/explanation string is absent, identify it for content localization review; do **not** invent a new translated answer, change assessment text, or switch the entire page to duplicated EN+ZH presentation. A necessary original English learning prompt may remain in English as source material without changing the locale of the surrounding UI. Maintain appropriate `lang` semantics for Chinese interface text and English instructional passages so reading and speech work correctly.

## 15. Activity screen indicator and overflow navigation

**Single component:** `ActivityScreenIndicator` (`BA-UI-006` / `BATaskProgress`) is shared between LessonTopBar and the **All activity screens** anchored popover. Both use the same **numeric-only circle and status/selection styling**. No attached check, lock or other status icon may replace or accompany the visible screen number. The popover cannot introduce a different number design; layout/size/touch targets may vary through documented presentation variants.

**Composite states:** `selected` means the currently viewed Activity Screen and is independent of the stored progress status (`incomplete`, `done`, `locked`, `skipped`). Lesson 1 has eight numbered markers (1–8). Incomplete-unselected shows a neutral number; incomplete-selected adds a selected outline; done-unselected uses **dark fill + white numeral**; done-selected retains that dark fill and adds an **outer selected ring**. Locked uses disabled colors and **no lock icon**. Skipped uses a **dashed inner border**; skipped-selected preserves that dashed border and adds an **outer selected ring**. Never replace the status with `current` merely because the learner navigated back to a done or skipped screen. An answer revealed without credit stays distinct in saved learning state and its accessible description. Color and outlines are presentation; the `canOpen` gate and actual learning records remain authoritative. See root DESIGN.md and component contract for visual tokens and interaction states.

**Overflow:** the top bar has **one horizontal row of at most nine elements, including the ellipsis button**. Use measured component width rather than device-based 8/6/4 counts. Keep the current Activity Screen visible by shifting the contiguous visible number window while preserving original order; reserve one slot for a **36×36px circular ellipsis** only when there is actual overflow. All numbered circles are also 36×36px visibly, with accessible hit areas of at least 44×44px where possible. Clicking the ellipsis opens a nonmodal **anchored All activity screens popover**, maximum about 424px wide, 40px radius and 40px padding, titled at top left with a top-right close control. The entire list is a **fixed six-column, left-aligned grid**, and a short last row starts from column one. Top bar and popover must reuse precisely the same marker component, size, number typography and composite visuals. The popover internally scrolls to the current item and stays within viewport bounds. Allowed items navigate and close it; locked ones are disabled. Trigger, top-right Close, outside click and Escape dismiss it; focus returns to the trigger or a safe remaining navigation target. Opening and closing never alters answers, progress or attempts. P7 internal questions do not add extra Lesson circles. Desktop and Tablet are the current scope; 320px Mobile-specific layout is deferred to global responsive rules.

**Component contract:** separate activity number, progressStatus, isSelected, canOpen and onNavigate. BA-UI-006 owns one 36px visual marker in both TopBar and six-column popover; the top-level shell owns whole-bar centering. Keyboard/touch, hover/focus/pressed/disabled and Done+Selected/Skipped+Selected remain test targets. Verify Desktop/Tablet widths 1440/1024/834 and varied heights; 320px special Mobile layout is outside this Review.


### R2 Review 02 · contextual primary button readiness (DR02-09)

The Footer primary BAButton is **actually disabled**, not just painted gray, whenever the current activity lacks the required interaction. The disabled control must ignore mouse, touch and keyboard presses; it must not grade an empty answer, log a failed attempt or change the navigation position. Its enabled state is recomputed from the learner's current saved response and the authored task rules, including on reentry/reload.

For L2/G2-O Lesson 1: P2 Learn is a readable instruction and can advance without answering; P3 single pick requires one selection; P3 multiple pick requires the authored three selections; P3 single-word tap needs one chosen word. P4 ordered-word Build advances only once its built-word interaction has reached the original completion gate (its word tiles perform the authored grading/hint behavior). P4 frame-fill requires all authored blanks filled before Check. P5 Apply Writing requires at least three words before Check my writing; later Check again still uses the authored review/feedback rules, and Move on remains independent. P7 **retains its authored exception**: Next question may move past an unanswered internal item, and Hand in may be pressed with blank answers; the first such Hand in gives the original numbered blank warning without grading, and Hand in anyway is then enabled to submit the paper. Do not replace this with a mandatory-answer gate. Answer correctness is never implied by enabled state; incorrect submissions retain their existing retry / shown / completed rules. The original P7 two-set mastery decision is unchanged.

### R2 Review 02 · long writing workspace (DR02-08)

Only long writing-canvas screens expand their Textarea into the available height of the left white paper area. The editor is not manually resizable. Text longer than that region scrolls vertically **inside the Textarea**, instead of pushing WordGrid out of view. WordGrid stays at the bottom of the paper's writing content region (not fixed across the viewport or Coach). The instruction, tip and other authored controls remain intact. Touch/keyboard caret and WordGrid insertion position continue to be stored and restored.

## 16. E-01 · Staircase behavior

E-01 is a diagonal staircase from lower-left to upper-right. The path is layered terraces: separate platforms, one per node, on the `v2-terraces` landscape. Card bottom sits on the platform top. Card height grows upward and does not move the anchor or the camera.

Anchor for node `i` of `n`: `anchorBaseY + (n - 1 - i) × rise`. Rise comes from the viewport height, clamped between 48 and 120 CSS px. Horizontal step is 290 CSS px. Node width is 260 CSS px. Do not hard-code a 15° angle. Drag, wheel, keyboard arrows, Home, and End use that same rise and snap to a step. The path is usable without a pointer, names itself to assistive tech, and honors reduced motion. There is no forced 1024 px minimum width.

Node roles:

| Node | Role |
| --- | --- |
| Intro | Readable introduction. Not a lesson. |
| Unit | Chapter banner. Not clickable. No destination. |
| Lesson | Stable number at the card's upper left. Three visual states: **Enterable** (both new and resumed, CTA Enter / 进入), **Completed** (CTA Review / 复习), **Locked** (disabled). Skip remains distinct in saved progress data, not a separate card appearance. |
| Milestone | After each unit. Complete when every lesson in that unit is done or skipped. Completion does not grant permissions. |
| Level Goal | After the last unit. A label for the next level’s name, or “Top level” on the last level. Not a lesson, not a milestone, and not a scored object. No separate completion formula. |

Only G2-O lessons call the course session. A locked card never navigates and never looks unlocked. Completed Lesson CTA is Review / 复习; current/available unfinished lessons all show Enter / 进入 with one identical Writing-brown outline; saved progress still decides where entry resumes. The top-left number and completion/lock state form a single badge. Level tabs sit in one header row: level title at the left, the tab list centered on the header, language toggle at the right. Changing level changes which path is shown. It does not open a lesson and does not change score or progress. Phone widths may scroll the tab list inside that row.

**Preview seed (designer/demo only).** `?demo=preview-seed` is a designer preview. While that query is on, every Level 0 lesson card and every Level 1 lesson card renders as completed, so the designer can walk the path, open the completed milestones, and continue to the next lesson. The display leaves the learner course record, learner progress rules, and Mastery on the rules in this chapter. With the query off, cards, unlocks, and mastery follow those same rules.

The E-01 stage is the `v2-terraces` landscape specified by DESIGN.md. Layer order from back to front is the sky gradient `linear-gradient(135deg, #85DBF9 0%, #F8F4ED 100%)`, clouds, hill 2, hill 1, then the lesson platforms and cards. LandscapeTerrace uses the approved R2.12 cloud-platform artwork per node; do not restore the obsolete CSS grassy terrace. The interim scene uses one platform per node. While the learner scrolls the path, scenic layers move horizontally slower than the cards, farther layers slower, and the platforms stay on the steps. The usable viewport shows the header, cards, platforms, and hill/cloud layers without clipping them at the top or bottom. Footer and dev banners do not eat the stage. The scenic layers are decorative. They leave navigation, scoring, and persistence unchanged.

## 17. Celebration triggers

Celebration is presentation. Practice correct plays Ribbons + Explosions. A completed milestone plays the Confetti preset from the flag center (`startCount` 50, `rate.quantity` 0, `life.count` 1). Full-lesson mastery success plays Ribbons count 30 + three Explosions.

- **Practice micro-celebration:** Ribbons + Explosions play once when a graded practice item first receives a correct Check (single/multi, tapword, ordered build, frame fill, P5 Apply). A per-item receipt survives Back, reentry, and refresh. P7 grades on Hand in.
- **Full Lesson celebration:** Ribbons count 30 + three Explosions when the lesson reaches a legitimate completed mastery-success outcome; an unmastered Check finish must not be presented as a mastery celebration. Playback does not grade or unlock. Short composition intensity/duration await visual review.
- **Milestone:** a click on a completed flag plays the Confetti preset from the center of that flag, with `startCount` 50, `rate.quantity` 0, and `life.count` 1.
- The first time E-01 is shown, milestones that are already complete are recorded and do not play.
- On a later return, if one or more milestones have newly become complete, auto-play only the one furthest along the path, using that same Confetti preset. Mark the automatic play of the others as already handled so they do not auto-play on the next return. Scroll a completed flag into view if it is off screen, then play once.
- Later visits keep the flags quiet until the learner presses one. That press replays the Confetti preset from the flag center, with the same parameters.
- Reduced motion shows a static success state and no particles.
- Do not change the selected level in order to celebrate a flag on another level.
- A failed or interrupted presentation does not consume the receipt.

The ten-effect preview at `/?demo=celebration-effects` is a manual gallery (Ribbons, Confetti, Cannon, Explosions, Falling, Parade, Party, Fire, Firefly, Fireworks). Nothing auto-plays on entry. Previews stop on Escape, on leaving the page, or after 15 seconds, and they do not block page controls. The gallery is not the milestone rule above.

## 18. Excluded chrome and non-goals

- No hamburger, Index, or Analytics in the learner chrome. Session, screen, and score data stay in the course record for the path, the top bar, and the Coach.
- No Save or Print button on the book page. Saving remains automatic.
- No demo unlock on the student path. `?demo=preview-seed` is the designer preview in chapter 16. It does not write learner progress and it does not grant Mastery.

## 19. Open product decisions

- **Source-parity review (Product Owner):** For Apply, the original counts a 3+-word response with >30% CJK characters as a failed submission (not a no-try guard). Confirm if that is the intended learning rule.
- **Safety handling (Product Owner):** After two 3+-word safety-flagged Apply submissions, the original generic failed-tries branch can expose `Move on for now`; confirm whether the safety case needs a separate boundary before implementation. No new safety rule is approved by this observation.
- **Feedback restoration (Product Owner / UX):** Saved attempts and answers persist, but the original in-memory `Pages.lastSaid` feedback cache is not persisted. Confirm desired exact Coach message restoration after hard reload; existing PRODUCT recovery intent remains pending runtime proof.

- Non-answer dimming treatments, including the 40% candidate, require accessibility contrast review. Shake and audio cues remain optional candidates and cannot change gates.
- Exact static artwork for the reduced-motion success state.
- If a milestone becomes incomplete (for example after a failed Check revokes a skip) and later becomes complete again, whether that return auto-plays is not decided. Do not add a new celebration for that case.
- Level Goal stays the next-level label. A scored Level Goal formula is not part of this product.
- Live-screen visual sign-off (spacing, type, focus rings, screenshots) remains with the designer. Behavior in this document does not wait on that sign-off.

