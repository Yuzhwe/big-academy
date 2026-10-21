# Big Academy — HANDOFF (current)

**Baseline:** v0.1 · 2026-10-20
**Branch:** main is the single source for new work.

## Authorities

- `apps/writing/PRODUCT.md` — product rules and Writing-specific page behavior.
- `DESIGN.md` — global visual language, including complete Spacing/Gap and Radius decision rules.
- `packages/design-system/src/tokens.css` — executable token values. Candidate values marked [E] still require visual approval.
- `apps/writing/contracts/components.json` — component interfaces and status; latest contracts may be ahead of component code.

## Delivery scope

Only **L2/G2-O Lesson 1: Topic sentences (eight screens)** is in scope for high-fidelity Writing v1. E-01 Staircase supports entry/return, and Lesson End reflects real mastered/unmastered assessment status.

## Known gaps

- Lesson 1 (eight Activity Screens) is wired in CourseApp on the v2-terraces branch: routing, `canOpen`, grading FSM, `g2o_unit_state_v4`, and EN/ZH chrome. Visuals stay candidate until designer approval. Screens outside Lesson 1 remain unsupported.
- ActivityScreenIndicator and the anchored All activity screens popover follow the current contract: every circle shows the Activity Screen index, status uses color, a ring, or a secondary mark, the lesson TopBar has no bottom divider, and the tablet 834 title ellipsis stays 「第1课 主·」. Registry id BATaskProgress stays in components.json. The lesson runtime keeps the digit in every state and does not draw that divider.
- Unit Folded Corner is on the Unit card (BA-WR-007): upper-right sheet fold, paper `#FFF9F2`, stroke `#DCC3AB`, goals as 16px plain text. Visual approval pending.
- BAChoice states are `default`, `selected`, `correct`, `correctUnselected`, `wrong`, and `dim`. Aliases: `idle` is `default`, `shown` is `correctUnselected`. `selected` and `wrong` use fill `#9B4F36` as the selected fill. `correct` is green fill `#14AE5C` and a leading check. `correctUnselected` is a green outline and a leading check, with no solid green disc. `dim` is graded chrome at opacity 0.4. `disabled` is a separate non-interactive state. One-line and wrapped rows use `align-items: flex-start`. The row does not paint state-copy text. Border is 1px. Hover 1.02 and press 0.95 match the BAButton CTA. Reduced motion does not scale. The lesson runtime now follows that mapping.
- Lesson question feedback is a documented candidate, not Approved: each message is its own card (wrong: white background and a light border; correct: white background and a green border); Previous and Next span the full width of the footer action row; the hint control is a secondary button. On the build-topic-sentence screen, the visible controls are the word cards and the lesson footer, each word tile shows its hint after two wrong taps on that word, and each remaining bench blank is an underline. Ellipsis and dotted placeholders are not used. A placed word stays in the line. There is no Start again on that screen and no tap-to-withdraw. Feedback-card and WordGrid tab/pill chrome stay candidates. The lesson runtime now follows that checklist.
- `?demo=preview-seed` is a designer/demo display only: Level 1 and Level 2 lesson cards render as completed so the designer can walk the path, open completed milestones, and continue to the next lesson. It does not write learner progress or grant Mastery. Practice correct uses Ribbons + Explosions (PRODUCT §17). A completed milestone flag click uses the Confetti preset from the flag center (`startCount` 50, `rate.quantity` 0, `life.count` 1) and does not use Ribbons or Explosions. The lesson runtime now follows that display and those two celebration sets. Reduced motion stays a static success state with no particles.
- E-01 path landscape is **v2-terraces** on LandscapeBackdrop (BA-WR-009): sky gradient `linear-gradient(135deg, #85DBF9 0%, #F8F4ED 100%)`, one cloud, one shared hill frame (hill-2 then hill-1), then platforms. LandscapeTerrace (BA-WR-010) specifies 2–3 grass layers. The interim scene uses one platform per node. Implementation file: `apps/writing/src/course/StaircaseScene.tsx`. The stage fills the viewport under the header. The dev note does not take stage height. Visible card tops and terrace bottoms stay inside the stage; rise steps down inside the 48–120 clamp only when a short stage cannot fit them. Path scroll moves the rail on one diagonal: camera Y tracks camera X at the rise slope, so cards do not drop one-by-one vertically while panning. Each hill file appears once, aspect preserved, as tall as the stage, ground on the bottom. Hill 1 moves at the speed that carries that frame across the camera travel and stays slower than the cards. Each farther layer keeps the on-screen share of the track (`viewport / track length`). Those inputs are the node count, track length, and camera max travel. The retired 0 / 0.12 / 0.40 / 0.72 / 1 table is not used. The lesson runtime now paints that gradient. Artwork is `apps/writing/public/path/v2-terraces/`. The interim platform is one 352×64 layer per node. There is no Path A/B control. The ordered-build per-word hint stays in PRODUCT.
- Validate P2–P7 grading, second tries/shown, Apply, P7 second assessment set, Back/Continue/refresh, keyboard/touch, EN/ZH, zoom and responsive screens.
- Run `npm run check:docs`, `npm run typecheck`, `npm test`, `npm run build`, relevant browser/Storybook tests; record actual pass/fail evidence. No previous QA results are asserted as proof for this baseline.

## Workflow

Create independent feature branches from `main`, implement against the four authoritative assets, then request designer review before merging. Historical stacked PRs and other agents' prototypes are reference-only and should not be used as new baselines.
