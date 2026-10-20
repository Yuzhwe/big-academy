# Big Academy — HANDOFF (current)

**Baseline:** v0.1 · 2026-10-20
**Branch:** `cursor/writing-lesson1-hifi-15f8` (from latest `main`). Do not merge `spec/writing-product-consolidation-20261020` into `main`.

## Authorities

- `apps/writing/PRODUCT.md` — product rules and Writing-specific page behavior.
- `DESIGN.md` — global visual language, including complete Spacing/Gap and Radius decision rules.
- `packages/design-system/src/tokens.css` — executable token values. Candidate values marked [E] still require visual approval.
- `apps/writing/contracts/components.json` — component interfaces and status; latest contracts may be ahead of component code.

## Delivery scope

L2/G2-O Lesson 1: Topic sentences. Eight Activity Screens from E-01 through Apply, P7 (including a second set), Lesson End, and return to the Staircase. This branch adds that flow on top of the pilot that was already on `main`. `PRODUCT.md`, `DESIGN.md`, `tokens.css`, and `components.json` are unchanged from `main`.

## What this branch runs

- Practice picks, tap-word, ordered build, and frame fill use the Alex Engine / Analyzer. Two tries, then `shown`. A wrong build card does not add a try. The third miss in a row pulses the next card. The miss streak resets after a correct card so “in a row” matches PRODUCT.md.
- Apply is offline `Analyzer.checkApply` for skill `L2-04`. Under 3 words or more than 30% CJK does not add a try. A safety match says “Please show your teacher,” does not pass, and does not count toward Move on. Pass marks the page done. After two failed checks, Move on for now completes the page without a pass.
- P7 uses `masteryItems` / `masteryPass`. Blank hand-in warns once. The first failed set does not complete the screen. Hand-in of attempt 1 completes it whether or not it passes. Pass is sticky. Question answers are stored as `L2-04.check:a{n}:{itemId}`.
- Lesson End shows passed vs not mastered. Stop for today and Back to my path park the screen on the next lesson and return to E-01. Stop for today sets `stoppedAt` and shows “saved on this device.” Keep going opens the next screen. Welcome back is shown once when that next lesson is opened after a stop. Refresh does not restore the lesson-end page; a refresh while stopped opens the path notice.
- Staircase variant A (separate platforms) is the default. The A/B control remains. Unit cards use a CSS folded corner. Lesson cards are not folded.
- `ActivityScreenIndicator` is the shared numeral for the top bar and the nonmodal All-activity-screens popover. `shown` is read as “answer shown,” not done.
- Course state stays in `g2o_unit_state_v4`. Celebration particles are not written into that record.

## Known conflicts, resolved in code

- Alex’s build miss counter does not reset after a correct card. This lesson resets the streak, matching PRODUCT “in a row.”
- Alex `checkApply` can still return a demo result for a short or CJK draft. The session refuses those before a try is counted.
- Apply grading is synchronous, so the footer never shows a visible “Reading…” wait.
- A full lesson-break page is not reopened after refresh. The path notice is.

## Checks on this branch

- `npm test` — 46 passed (Lesson 1 pick reveal, build miss, frame blank, Apply move-on, P7 blank + second set, review at screen 1, plus the existing pilot suite).
- `npm run typecheck` — pass.
- `npm run check:docs` — pass. The gate now accepts Baseline v0.1’s “E-01” wording. It previously required the heading `E-01 · Staircase`, which current `PRODUCT.md` does not use. `PRODUCT.md` itself was not edited.
- `npm run build` — pass (app and Storybook). Vite still warns that the app chunk is large.
- Playwright: `e2e/lesson-one.spec.ts` passed (Staircase A, Lesson 1 teach, real B-answer check, 1440 and 390). `e2e/staircase-ab.spec.ts` passed (5). Full `npm run test:layout` was not re-run as one command after the lesson spec.

## Preview

There is no hosting publish step in this repo. `npm run dev -w @big-academy/writing` serves the interactive course on localhost. That is not a public preview URL.

## Still open

- Designer visual approval for Warm Frame, the indicator, and the Unit fold.
- Responsive screenshot signoff at 1440×900, 1024×768, 834×1112, and 390.
- Lessons 2–9 are still the previous pilot gates.
