# R1 independent implementation handoff — engineering candidate

Baseline main: `e0a96d867c393e168087a98bbe05277138459262`.
R1 specification PR #32 head: `947af3306e767dab603de1a78616e93fbaeedac0`.
R1 integrated via independent commit `c26a17076853a5d1d3a6eca8dc1c5166b5cdf1cd`.
Implementation branch: `feat/writing-hifi-r1-gpt6-independent` (not merged).

## Changes
- Imported the four R1 spec/token files, without merging historical agent work.
- Added draft P4 word build and frame-fill presentation + session hooks.
- Added offline P5 writing checker (three separate garden opinions), move-on gate.
- Added P7 assessment internal navigation, question pool rotation, blank warning and hand-in scoring.
- Scoped R1 stage gradient, separate platforms, paper fold, pill card CTA, options, Coach message tint and footer action ratio.
- Maintained source curriculum HTML unchanged.

## Verification status and limitations
- GitHub API changes are committed; **no verified runnable preview** yet. This execution environment cannot clone GitHub (DNS unavailable).
- npm install, typecheck, build, unit, Playwright, Storybook and visual screenshots: **NOT RUN**.
- The current implementation is a candidate and does **NOT** satisfy acceptance until browser verification and defect correction.
- Known gaps: P7 test coverage and some authored question types need validation; assessment result-row drilldown, practice and full lesson ribbons + explosions, persistence receipts, listen placement across all question templates, strict accessibility and locale audits remain incomplete.
- R1 candidate CSS values are not designer-approved global tokens.
- Do not merge until UI designer and tests approve.

## Reproduction
```sh
npm ci
npm run check:docs
npm run typecheck
npm test
npm run build
npm run test:layout
npm run dev
```
Open Writing and exercise the eight sequential Activity Screens at 1440x900, 1024x768, 834x1112, and width 390px; test English/Chinese, keyboard, touch, zoom and reduced motion. Record screenshots and real outcomes here.
