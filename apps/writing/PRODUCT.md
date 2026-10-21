# Big Academy — Writing PRODUCT.md

**Version:** v0.4 · R3 canonical Writing behavior · 2026-10-21  
**Status:** R3 design direction approved; terrace/status visual details pending designer signoff; engineering unchanged  
**Current delivery:** L2 / G2-O / Lesson 1 — Topic sentences (8 Activity Screens)

## Product Brief — Why, who, outcome

**User:** a K–12 writing learner at the assigned level. **Core scenario:** enter a Writing lesson from E-01, learn a rule, practise with task-specific checks, apply it in writing, submit a mastery check, and resume if interrupted.

**Problem:** separate activity demonstrations do not by themselves provide a navigable, recoverable learning journey with accurate feedback, gating, and assessment.

**Goal:** deliver the complete eight-screen, end-to-end Lesson 1 journey in the approved Warm Frame + White Canvas direction. Preserve the distinctions among input, evaluation, feedback, completion, and unlocking.

**Acceptance measures:** all eight real screens and original task data; correct/wrong/empty/second-attempt/reveal behavior by task; sequential unlocking; P7 both rounds; Back/exit/refresh/Continue state recovery; accessible keyboard and touch; screenshots and designer approval. These are delivery criteria, not unvalidated learning-effect metrics.

**Out of scope:** implementing the other 44 screens, adding new exercises, old Index/Analytics chrome, user-facing Save my paragraph/Print, or cross-level demo unlocking.

## Information Architecture — What exists and how it connects

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

Shared visual foundations (Warm Frame, White Canvas, type ramp, Iconoir, motion, tokens) live in repository-root `/DESIGN.md`. This file does not repeat that system. Learner-facing English and Chinese strings are authored in the unit configuration. The rules below decide structure, correctness, gates, and persistence. A reader does not need the HTML runtime to apply them.

**Current build scope:** L2 unit G2-O, Lesson 1, Topic sentences, the eight Activity Screens in [Lesson 1](#lesson-1--topic-sentences). The other eight lessons and their 44 screens are specified here so later lessons use the same gates. They are not part of this build.

## 1. Course shape

Hierarchy is Level → Unit → Lesson → Activity Screen. A step tag (Skill, Model, Plan, Draft, Revise, Report) is a label on screens, not a separate level the learner navigates.

G2-O, “The Hamburger Paragraph,” is the only playable unit. It has 9 lessons and 52 Activity Screens. Other levels and units appear on the path as locked or view-only. Nothing in the interface unlocks them for demonstration.

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

## 2. Four different actions

Selecting an answer, checking it, showing feedback, and allowing the next screen are four separate steps. A control that only changes a selection never grades. A grade never runs because the learner moved to another row, word, or field.

| Step | What changes | What does not change |
| --- | --- | --- |
| Select or edit | The stored answer (chosen index, tapped word, labels, or text) | Tries, status, credit, page-done. No new grading sentence is written. |
| Check or Hand in | Tries, where the task uses them, then status or page-done | The learner cannot reach the next screen from this press unless the completion rule for this template is met. |
| Show feedback | Coach or margin text, and row/word marks for right, wrong, or revealed | Unlock. Feedback can sit on the screen while Next is still closed. |
| Allow next | The footer primary becomes the real forward action and `canNext` is true | Score. Opening the next screen is not itself a grade. |

While a screen is unfinished, the footer primary **is** the action the screen still needs (Check, Hand in, Hand it in, and so on). It is not a disabled Next. Pressing it runs that action. If the in-page Check is already enabled, the footer press activates that Check. If the learner has not answered yet, the press does not grade: the Coach names what to do, and the answer area pulses.

Forward jumps respect the lock. Backward moves never do.

## 3. Page gates

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

## 4. Save, Back, leave, and return

Course state is one record in this browser, storage key `g2o_unit_state_v4`, schema version 4. Writes are debounced by 250 ms and flushed immediately on navigation, Check completion, Hand in, and leaving the lesson. Older keys (`v3`, `v2`, `v1`) are detected and left unread. There is no second progress store.

The record holds: current screen index, `seen`, page-done flags, per-item state (tries, status, picks, wrong marks, tapped word, found targets, labels, build order, hint level, miss counts), writing regions as word segments with how each word was entered, Check attempts and results, plan topic and fields, Apply tries and last result, draft versions, CUPS ticks, reflection, skill status, skip choice, and a capped event log.

Milestone celebration receipts use a different key, `ba_writing_milestone_receipts_v1`. They never grant, revoke, or rewrite a lesson.

| Action | Stored result | What the learner sees on return |
| --- | --- | --- |
| Edit or select | Answer updates. Status stays `open` if it was open. | The same selection or text. |
| Check, reveal, or Hand in | Status, tries, feedback inputs, and page-done as the template requires. | Finished items stay finished. Open items keep tries and the last check message. |
| Footer **Previous** inside a lesson | Screen index moves back. Answers are not cleared. | The earlier screen with its saved answer and status. |
| P7 **Back** between questions | Question index moves back. Every question’s answer is kept. | The previous question, still answered if it was. |
| P7 **Back** on question 1 | Leaves the Check for the previous Activity Screen. Check answers stay stored. Coming back resumes the same question index. | The previous Activity Screen. |
| Top-bar **Back**, or **My path** on the first screen | Flush save. Return to E-01. Screen index stays where the learner was. | **Continue** reopens that screen. |
| **End of lesson → Back to my path** | Screen index moves to the first screen of the next lesson, then the path opens. The finished lesson’s answers remain. | That lesson shows **Review**. Opening it starts at its first screen with answers and completion intact. |
| **Stop for today** | Same resume point as Back to my path, plus a stopped timestamp. | Next open shows the stopped lesson-break, then a one-time “Welcome back” on the next lesson. |
| Re-enter from E-01 | No reset. | Unfinished lesson: **Continue** at the saved screen if it may still open, otherwise the first unfinished screen. Finished lesson: **Review** at screen 1. |

Changing the top-bar appearance, or pressing a chip that `canOpen` rejects, does not write learning state.

Text regions restore from stored segments, including a printed frame or given sentence. Undo history is session-only; the text itself is what persists. Word-grid insertion, voice, typing, paste, pictures, and printed task text are stored as the source of each span. That source affects practice credit and in-writing weight. It does not change the correctness tests below.

## 5. Item status, tries, and reveal

Practice items (not Check questions) use status `open`, `done`, or `shown`.

- `done` — the learner met the grader. Practice credit uses how the answer was produced.
- `shown` — the answer was revealed. Credit is 0. The screen still completes. The revealed answer is marked as the answer, not as the learner’s correct choice.
- A gutter tick appears for both. The revealed tick is visually and accessibly distinct from a correct tick.

**Two-try rule (pick, label, single-target tap-word, edit, write, build).** Each Check, or each completed build submission, adds one try. A correct result finishes `done` immediately. A wrong result with fewer than 2 tries stays `open`, shows the retry message, and leaves Next closed. The second wrong result finishes `shown` and reveals the answer. There is no unlimited-retry mode.

**Hint ladder, separate from Check.** On an open practice item that has hints: “Need a hint?” then “Another hint,” then “Show me the answer.” Reveal calls the same `shown` finish as a second miss. Hints are never offered inside a Check, and Apply uses the ladder without the reveal button. Asking for a hint does not grade and does not add a try.

**Per-item exceptions to the two-try rule:**

- **Cloze edit** (a blank inside a given sentence, Lesson 3 `lw1` and any item flagged cloze): there is no Check button. When the last `___` is filled, the edit grader runs by itself. A miss clears the sentence back to the blanks after 0.9 s. Two misses reveal.
- **Ordered build** (Lesson 1 `ss.L2-04`): a wrong card does not add a try. It shakes. The third wrong card in a row shows the reason and pulses the card that is needed next. A try is counted only when the full target length has been placed.
- **Free build** (`in_order` false): any card may be placed; the sequence is graded only when its length equals the target.
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

## 6. Shared layout

Every Activity Screen is one frame: prompt (instruction, read-aloud, Chinese line when 中文 is on), body, and in-page actions. The lesson shell is white task paper on the left and Coach on the right. Coach scrolls on its own. **Previous** and the one contextual primary action sit in a full-width footer under the right column, outside the Coach transcript.

Choice, word, and sentence options are at least 50 CSS px tall, grow with wrapped text, vertically center a single line, and align wrapped text and the letter or number to the first line. This height rule is only for answer options. It does not resize global buttons.

Option states, each with a text label so color is not the only signal: idle, selected, correct (learner’s right answer), wrong, revealed answer, dimmed non-answer, disabled, keyboard focus. A revealed row uses the “Right answer” label. A correct selected row uses “Your answer · right.”

Keys 1–9 and A–I select a choice when a choice group is on screen. Enter activates Check when that button is enabled and the learner is not typing in a field. Read-aloud on the prompt is available on every template. It does not grade.

## 7. Templates

### P1 Book — read

Variants: `final` (finished paragraph), `growth` (first draft beside final).

No question, no options, no grader. The screen completes when the learner presses Next.

- **Final.** Shows the latest final text, one paragraph per blank line, with the account name as a byline when a name is present. If no draft exists, the empty line is “Your finished paragraph will be here.”
- **Growth.** Word diff of the first handed-in draft against the final text. Matching ignores case and trailing punctuation. Added words and removed words are marked and named in a key. A four-row table compares first-draft and final scores: organization and purpose, evidence and elaboration, language, conventions. “My checks” lists each skill Check as passed, not yet, or not taken.
- **Controls removed from the product:** “Save my paragraph” and “Print” are not on this page. Automatic saving still runs. The browser’s own print command is not a product button.

### P2 Teach — read, then Next

Variants: `rule_pair` (skill teach), `annotated_text` (model paragraph).

No grader. Next is available immediately and marks the screen seen.

- **Rule pair.** Step title, the teach sentence, a “Not yet” example beside a “Better” example, the hamburger diagram for that skill (topic, reasons, linking, or run-on), without the redundant “Next: N short practices, then you try it in your own writing, then a check.” preview line. Lesson 1 teach sentence: “A topic sentence tells the topic and what you think.” Weak example: “Gardens have plants.” Strong example: “Our school should have a garden for two big reasons.”
- **Skip offer.** Only on a rule-pair screen whose params set `skip_offer`, and only when skill-skip rules say so. See [Skill skip](#9-skill-skip-and-the-lesson-break).
- **Annotated model.** Prompt is the page teach line. The model question and Paragraph A are sentence spans. Choosing a sentence opens that sentence’s note in the margin. Notes are teaching, not a score. Next does not require a note to be opened.

### P3 Select — choose, then Check (with two exceptions)

The prompt is the item’s ask line. Options are the item’s lines, passage words, model sentences, topic cards, or label categories. Layout comes from the screen params; inside a Check or a remediation it is inferred from the item type.

**Choice grade.** The stored answer is a list of option indexes. Correct means the sorted list equals the authored answer indexes. If the item is marked `any` (model “Find an example”), correct means exactly one selected index and that index is in the answer list. Letters are A, B, C… in list order.

**Select.** Single choice replaces the selection. Multi choice toggles and shows “Choose N · k chosen.” Selection writes the answer and clears the wrong-mark list. It does not add a try and does not write a new grade. Check stays disabled until at least one option is selected.

**Check.** Adds a try. Correct → `done`, feedback, screen completes. First wrong → stay `open`. Single choice clears the selection and marks the chosen row wrong; the retry sentence names the letter and the authored reason for that option, then “Try again.” Multi choice keeps the selection; the retry sentence names one wrong letter and its reason, or “You found r of n.” Second wrong → `shown`, wrong rows stay marked, correct rows are labeled “Right answer,” feedback uses the graded sentence in the next paragraph.

**Graded sentence for a pick** (also used when a single-target tap-word is revealed):

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

The prompt is the item’s ask line. The body is one bench: optional “From the task” source, then “Build it here” or “Your sentence,” then Check and Start again unless the variant has no Check button.

**Build.** Cards come from the item’s cells plus distractors. The learner inserts them from the word-card grid into a read-only line. There is no Check button. Start again clears the line. The ask line may already quote the target sentence; the grader still compares the built line with that target.

- Ordered (Lesson 1): the next card must be the next target token. A wrong card shakes and does not insert. See the miss rule in [tries](#5-item-status-tries-and-reveal).
- When the line reaches the target length, it is correct if the built text matches `answer_text` after whitespace and quote normalization, or the card list equals the target list. A wrong full line adds a try, shows the reason, and clears after 1.2 s. The second wrong full line reveals `answer_text` under “Here it is:”.

**Edit (given sentence).** The bench opens on the given text. Correct if the normalized text equals one authored `accept` string, unless the item has `rules` or `frameFill` instead.

- Unchanged text: incorrect, “Nothing has changed yet. What needs fixing?” This miss counts as a try.
- Changed but not accepted, and no rule list: “Not quite yet…” (cloze: “Read the whole sentence with that word. Does it fit?”).
- Cloze: no Check button; filling the last blank grades immediately, as above.
- With `rules`: graded by the production order in [Write and edit rules](#8-graders).

**Write / fill / expand.** Empty or framed text. Frame fills use the frame grader. Rule lists use the production grader. A `___` still in the text is incorrect: “Fill each ___ first.” and does not run the rest of the rules. Two-try reveal shows “One way:” plus the first `accept` string, or the reason if there is no accept list.

**Reflection (Lesson 9 only).** Prompt is the reflection question. A keyboard field opens on “One thing I changed was ___ because ___.” No Check, no correctness. Next is available immediately. Pressing Next marks the screen seen and marks the report done. After that, the page states that the book is finished.

### P5 Write — Check my writing, or Hand in

No single “Correct → Next.” Each phase has its own primary action.

**Apply (`purpose: apply`).** Prompt is the apply task’s ask, large, plus the tip. A short writing canvas. Word grid level follows the page (Lesson 1: words). Live Coach nudges may appear while typing; they are not a grade.

- Under 3 words, or more than 30% of the characters are CJK: no try is counted. Margin: “Write a little first” / the English-sentences message.
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

**Layer.** One hamburger. Only the fields named on that screen are editable; the others show as compact filled lines. A field counts once it has text with pictures removed. Next stays closed until every field on the screen has text. The footer still says Next and, if pressed early, tells the learner to write a few words in each part. An “Ask yourself” note follows the focused field. It is guidance, not a grade.

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

**Try a new set.** Shown when the attempt did not pass. It increments the attempt, clears the question index and the blank warning, and keeps the new answers separate from the previous attempt. The first failed hand-in does **not** complete the Activity Screen, so the lesson cannot advance yet. The hand-in of attempt 1 completes the Activity Screen whether or not it passes, and Next (or End of lesson) opens. A pass is sticky across later sets. Another failed set after a skip revokes that skip (see below). The in-page “Try a new set” can still start a further attempt after the screen is already complete.

If the model service is used for paragraph scores elsewhere, Check items themselves stay on the item grader. They are not sent out as a free-form grade.

## 8. Graders

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

## 9. Skill skip and the lesson break

Skill status is `learning`, `practice`, `writing`, `review`, or `frozen`. Skipping is allowed unless a teacher turns it off. Status arrives from the mastery record (in this product, from settings or a `skills` query). It is not a button the learner sets.

| Status | On the skill’s first teach screen |
| --- | --- |
| `writing`, and skip is allowed | The step is already skipped. A note says it is mastered and can be reviewed. Every screen in the step counts done and adds 0 minutes. |
| `practice`, and skip is allowed | An offer: **Skip this skill** or **Review it**. |
| `learning`, `review`, `frozen`, or skip disallowed | No offer. |

**Skip this skill** stores the choice, logs it, gives no new evidence, re-counts lessons, and jumps to the first screen after that step. **Review it** stores the choice and stays on the teach screen; the offer does not return.

Lessons are re-counted after a skip. A lesson whose own remaining minutes are 0 drops out. A lesson under 8 remaining minutes merges forward into the next lesson unless it is marked short. The last lesson is kept.

**The Check stays available.** If that skill’s Check is handed in and does not pass, and the step was skipped, the skill returns to `learning`, the skip choice is removed, and the step is no longer done. A pass does not of itself create skip evidence.

**Lesson break.** End of lesson shows how many screens in the lesson are complete, names the next lesson and its minutes, and offers **Stop for today**, **Back to my path**, and **Keep going**. Stop for today and Back to my path both set the resume screen to the start of the next lesson. Keep going opens that screen. The stopped view says the work is saved on this device and offers a return to the path. Starting the next lesson clears the stopped flag and shows Welcome back once.

## 10. Lesson 1 — Topic sentences

Build this lesson in this order. Screen ids are stable.

| # | Screen | Template | Prompt the learner works from | Answer | Check and completion |
| --- | --- | --- | --- | --- | --- |
| 1 | `L2-04.learn` | P2 rule pair | Teach sentence, weak/strong pair, hamburger | None | Next is open. Skip offer only if this skill is at practice or writing, per [skill skip](#9-skill-skip-and-the-lesson-break). |
| 2 | `L2-04.t.ts1` | P3 single list | “Which one is a good topic sentence for a school garden?” | B. A “Gardens have plants.” B “Our school should have a garden for two big reasons.” C “I like flowers.” | Select, then Check. Two-try reveal. |
| 3 | `L2-04.t.ts4` | P3 passage, one word | “Tap a word that tells you this is an opinion.” Passage: “I believe our class should get a pet fish.” | “believe” or “should” | Select one word, then Check. Two-try reveal. |
| 4 | `L2-04.t.ts3` | P3 multi list | “Tap every opinion.” | A, C, and E (indexes 0, 2, 4). A Dogs are the best pets for families. B Many families have dogs. C In my opinion, every kid should learn to swim. D The pool opens at 9:00. E School lunch should have more fruit. F Lunch is at noon. | Toggle any set, then Check. “Choose 3.” Two-try reveal. Not a radio group. |
| 5 | `L2-04.t.ss.L2-04` | P4 ordered build | “Build this topic sentence with the grid, one word at a time: Our school should have a garden for two big reasons.” Cards, in required order: our / school / should / have / a / garden / for / two / big / reasons / . | That same sentence | No Check button. A wrong card shakes and does not insert. The third miss in a row shows the reason and pulses the next card. A full line is one try. The second wrong full line reveals the sentence. |
| 6 | `L2-04.t.ts8` | P4 frame fill | “Finish my sentence about recess.” Frame: “In my opinion, recess should ___ because ___.” | Keep the frame words. First blank ≥ 2 words. Second blank ≥ 3 words. The reason must not be only a vague “good/nice/fun…”. | Check, or the two-try reveal. A leftover `___` fails before the frame test. |
| 7 | `L2-04.apply` | P5 apply | “Write 3 different topic sentences for: Should our school have a garden? Put each one on a new line.” | All four criteria in [Apply](#p5-write--check-my-writing-or-hand-in) | **Check my writing.** Pass completes the screen. Two failed checks unlock **Move on for now**, which completes it without a pass. |
| 8 | `L2-04.check` | P7 | Four questions, attempt sets in [P7](#p7-check--answer-all-questions-then-hand-in). Writing prompt and rules in [Graders](#8-graders). | Pass = at least 2 of 3 auto items and the writing item | **Next question**, then **Hand in my check**. Blanks warn once. Fail → **Try a new set**. The screen completes on a pass or on the hand-in of the second set. Footer then becomes **End of lesson**. |

Top-bar chips for this lesson are these eight screens, states `done`, `current`, `available`, `locked`, `skipped`. P7’s four questions are not chips.

Acceptance for this lesson:

1. The eight ids appear in the order above, and only these eight are required for the build.
2. A correct practice item shows its success feedback and only then enables Next.
3. A first miss on screens 2–6 stays on the screen with retry feedback and does not enable Next. A second miss reveals, credits 0, and enables Next.
4. Screen 4 accepts a partial set without grading until Check, and does not behave as single-select.
5. Screen 5 does not grade on a wrong card. Screen 7 does not show a correct stamp when the learner uses Move on.
6. Screen 8 does not grade until Hand in, warns once on blanks, and uses the 2-of-3-plus-writing rule.
7. Back, leaving to E-01, and re-entering restore selections, text, tries, Check progress, and screen position as in [Save, Back, leave, and return](#4-save-back-leave-and-return).
8. Keyboard selection, visible focus, and non-color state labels work on the choice and word tasks. Reduced motion does not block a gate.

## 11A. Current R3 Writing presentation behavior (single source, 2026-10-21)

- **Scope:** Visual and spatial refinement only. Preserve all authored content, exact graders, retry/shown, screen gates, P7 assessment, saved answers, resume, Start/Continue/Review/Locked, keyboard/touch and reduced-motion behavior. The Writing demonstration remains eight Activity Screens.
- **E-01 full-bleed stage:** landscape sky / distant peaks / hills / trees / clouds / subtle plane + parallax is the sole default presentation; no residual beige header/footer bands may occlude the scene. Level navigation and language selector remain usable above scenery without overlapping nodes. Background never captures pointer events or course state.
- **Camera visibility:** drag, wheel, keyboard, Home and End must reach complete visible first/last nodes, including card bounds, decorative terraces, sticky header and viewport padding; no unreachable clipped upper-right or lower-left cards.
- **Terrace:** choose the **Layered Landscape Terrace** family (2–3 shallow rounded grass/landform layers). Retire high translucent rectangular vertical pillars. Preserve Lesson card bottom anchors and existing path navigation geometry. Terrace colors/curves are R3 design candidates, not yet approved numeric specifications.
- **Lesson state:** choose **Number Seal + Attached Symbol**. Lesson number remains dominant; attached small status icon encodes current, completed or locked. Do not restore giant colored status capsules or redundant You're here / Finish prior unit captions. Accessible status descriptions remain; actual state gates do not change. Exact final icon geometry is a designer review candidate.
- **Unit fold:** folded face must be a continuous rounded corner integrated with the card's outer edge; no detached corner triangle or inner decorative border crossing the folded region. Decorative folded state is not an interactive target.
- **Lesson card:** title uses exactly two reserved line boxes, 2-line truncation with accessible full title; estimated duration directly below title as number + localized unit, left aligned. CTA uses shared BAButton (height 70px), all approved hover/pressed/focus and reduced motion states. Outer/inner radius follows concentric relation rather than independent unrelated values.
- **Activity hierarchy:** one primary separation treatment per structural boundary (surface OR stroke OR divider unless independently justified). Right-column action footer no longer draws its own filled panel or redundant divider; it remains pinned below independently scrolling Coach. Primary and Previous fill footer width at 1:2 with 8px gap and 70px heights. Quiet neutral container strokes must not obscure interactive focus/graded borders. Decrease gaps between peer content containers by one existing spacing scale step; do not tighten line-height or hit targets.
- **TopBar:** keep title/meta and centered ActivityScreenIndicator shared with the anchored full-screen Popover. Icon Back to Staircase remains 50×50. P7's internal question count is distinct from top eight Activity Screen indicators.
- **P2:** differentiate Not yet vs Better; Better is instructional emphasis, never a checked practice success event.
- **Visual authority:** backdrop appearance originates from the user-supplied E01-landscape-backdrop-prompt.md visual record, baseline commit 913dbfe on feat/writing-hifi-r1-593dee37. That historical implementation requested R1 as default; **this instruction is superseded**: in R3 landscape is default. The recorded grass terrace is a useful source, but the new R3 terrace family must not be forced to reproduce the old geometry unchanged.

## 11. Lesson chrome

**BA-WR-001 top bar.** No hamburger and no collapsible menu. Left: icon-only Back (returns to E-01, does not clear answers; no visible helper text), lesson name, and necessary metadata. Center: the lesson’s Activity Screen progress, centered on the full bar, not in the leftover space between the title and the right edge. Right: no learner action. Long English or Chinese titles truncate inside the left area and do not push the progress off center.

Progress reads the live lesson screen list. Chips distinguish done, current, available, locked, and skipped in text as well as appearance. A chip navigates only when `canOpen` allows it. The current chip does not rewrite status.

**Footer.** One Previous (previous Activity Screen only; disabled on Screen 1) and one primary. Top-bar Back alone exits to Staircase. Labels follow [page gates](#3-page-gates) and the template. P7 replaces both while questions are in progress.

**Coach versus feedback.** On arrival, one orientation line, with “Show me another” only when the screen authored extra beats. That text is teaching. The hint ladder is a separate learner-invoked control. Check feedback, Apply comments, plan comments, and draft comments are the result of a submit. A selection change does not generate a new one. Live writing nudges (one suggestion and one specific praise) can appear during Apply, draft, and revise; they are not a score and they do not complete a page.

**Language.** 中文 shows the authored Chinese line under the English. It does not change answers or gates.

## Activity Screen indicator and overflow navigation — approved interaction direction

**Single component:** `ActivityScreenIndicator` is shared between LessonTopBar and the **All activity screens** anchored popover. Both must render the same circle/number/status-icon visual component and state mappings; the popover must not create a separate rectangular-number design. Container layout, size and touch target may vary by a documented variant.

**Composite states:** `selected` (current view) is independent of progress status (`incomplete`, `done`, `locked`, `skipped`). A completed screen may be selected. Locked cannot be selected through user action. For `shown` provide an accessible answer-revealed description; do not pretend correctness. Numerals remain visible in all states. Done uses a small bottom check-circle, locked uses a bottom lock-circle; there is **no connecting line** between the large number circle and its lower status circle. The lower circle sits against or slightly overlaps the number circle without jumping across states. Visual tokens, relative positioning, and responsive variants are defined by root DESIGN.md and component contract.

**Overflow:** do not impose an eight-screen data limit. Visible node count responds to available container width; 8 desktop / 6 tablet / 4 mobile are review targets, not enforced product limits or exact breakpoints. Keep current screen visible and collapse other numbers behind a clearly labeled ellipsis trigger. A nonmodal **anchored Popover**, not a blocking dialog, opens near that trigger and lists **all** Screen numbers (including those visible outside) in a responsive grid. Overflow scrolls within the popover and the current indicator is initially in view. On allowed screen selection: validate access, navigate, close. Locked indicators do not navigate. Outside click, trigger toggle, close affordance, and Escape dismiss; Escape returns focus to the trigger. Opening/closing never alters progress or attempts. Use accessible button names and keyboard navigation. A shown-but-unanswered assessment item does not count as an additional Lesson Screen.

**Component contract:** separate `screenNumber`, `progressStatus`, `isSelected`, `canOpen`, and `onNavigate`; popover open/close is its container's state. Use the same React Aria focus/keyboard semantics across both locations. Document compact/regular sizes, hover/focus/pressed/disabled and Done+Selected combinations in Storybook; verify 1440/1024/834/390 widths, long headings, and 200% zoom.

## 12. E-01 path

E-01 is a diagonal staircase, lower-left to upper-right, not a vertical list. The path form is separate platforms: one thin platform per node. Card bottom sits on the platform top. Card height grows upward and does not move the anchor, the camera, or the slope.

Anchor for node `i` of `n`: `anchorBaseY + (n - 1 - i) × rise`. Rise comes from the viewport height, clamped between 48 and 120 CSS px. Horizontal step is 290 CSS px. Node width is 260 CSS px. Do not hard-code a 15° angle. Drag, wheel, keyboard arrows, Home, and End use that same rise and snap to a step. The path is usable without a pointer, names itself to assistive tech, and honors reduced motion. There is no forced 1024 px minimum width.

Node roles:

| Node | Role |
| --- | --- |
| Intro | Readable introduction. Not a lesson. |
| Unit | Chapter banner. Not clickable. No destination. |
| Lesson | The action. Stable lesson number at the card’s upper left. **Start**, **Continue**, **Review**, or **Locked**. Skipped is distinct from done. |
| Milestone | After each unit. Complete when every lesson in that unit is done or skipped. Completion does not grant permissions. |
| Level Goal | After the last unit. A label for the next level’s name, or “Top level” on the last level. Not a lesson, not a milestone, and not a scored object. No separate completion formula. |

Only G2-O lessons call the course session. A locked card never navigates and never looks unlocked. Completed Lesson CTA is Review / 复习, not Start; current/available unfinished lessons show Start or Continue according to saved progress. The top-left number and completion/lock state form a single badge. Level tabs sit in one header row: level title at the left, the tab list centered on the header, language toggle at the right. Changing level changes which path is shown. It does not open a lesson and does not change score or progress. Phone widths may scroll the tab list inside that row.

The E-01 default is the layered landscape environment specified by DESIGN.md; the formerly prescribed warm-brown vertical gradient is retired from the active Writing visual contract. Landscape layers are decorative only and cannot affect navigation, scoring or persistence.

## 13. Celebration

Celebration is presentation. It never grades, never completes a screen, and never writes the course record.

- **Practice micro-celebration:** briefly combine Ribbons + Explosions for each graded practice item when it first receives a correct Check result (single/multi, tapword, ordered build, frame fill, P5 Apply). Record a stable per-item once-only receipt across Back/reentry/refresh. Never trigger on selection, wrong check, shown/reveal, or Move on; P7 internal assessment is graded only on Hand in, not on each internal question.
- **Full Lesson celebration:** Ribbons count 30 + three Explosions when the lesson reaches a legitimate completed mastery-success outcome; an unmastered Check finish must not be presented as a mastery celebration. Playback does not grade or unlock. Short composition intensity/duration await visual review.
- **Milestone:** a one-shot confetti burst whose origin is the center of the completed flag. Parameters: `startCount` 50, `rate.quantity` 0, `life.count` 1. That is a single burst, not a continuous emitter.
- The first time E-01 is shown, milestones that are already complete are recorded and do not play.
- On a later return, if one or more milestones have newly become complete, auto-play only the one furthest along the path. Mark the automatic play of the others as already handled so they do not auto-play on the next return. Scroll a completed flag into view if it is off screen, then play once.
- Later visits do not auto-play. Pressing a completed flag replays its confetti.
- Reduced motion shows a static success state and no particles.
- Do not change the selected level in order to celebrate a flag on another level.
- A failed or interrupted presentation does not consume the receipt.

The ten-effect preview at `/?demo=celebration-effects` is a manual gallery (Ribbons, Confetti, Cannon, Explosions, Falling, Parade, Party, Fire, Firefly, Fireworks). Nothing auto-plays on entry. Previews stop on Escape, on leaving the page, or after 15 seconds, and they do not block page controls. The gallery is not the milestone rule above.

## 14. What is not in the lesson chrome

- No hamburger, Index, or Analytics in the learner chrome. Session, screen, and score data stay in the course record for the path, the top bar, and the Coach.
- No Save or Print button on the book page. Saving remains automatic.
- No demo unlock on the student path.

## 15. Open

- R3 landscape is the E-01 default; old warm-brown gradient and old pillar-based terrace are historical, not alternative default requirements.
- R1 Choice treatments including approximately 40% non-answer dimming require accessibility contrast review. Shake and audio cues remain optional candidates and cannot change gates.
- Exact static artwork for the reduced-motion success state.
- If a milestone becomes incomplete (for example after a failed Check revokes a skip) and later becomes complete again, whether that return auto-plays is not decided. Do not add a new celebration for that case.
- Level Goal stays the next-level label. A scored Level Goal formula is not part of this product.
- Live-screen visual sign-off (spacing, type, focus rings, screenshots) remains with the designer. Behavior in this document does not wait on that sign-off.
