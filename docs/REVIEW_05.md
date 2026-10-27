# Review 05 · engineering delivery and designer review

Date: 2026-10-27 (Asia/Shanghai). Branch: `feat/writing-review05-components-pages`.
Baseline: PR #53 `044f4a6f91b13daf4d834e7b71bdebb62c7ed503`; [passing M4 CI](https://github.com/Yuzhwe/big-academy/actions/runs/40341060938). This is a stacked, independent Draft PR targeting the Cloud M4 branch. No main merge or Vercel deployment.

PRODUCT.md owns teaching/state; root DESIGN.md owns visuals; Tokens own values; component contracts own API. The Review 05 attachment's old app-level DESIGN path is superseded by repository AGENTS.md. Older Review 04 files are historical records, not competing design authority.

## Shared implementation

| Area | Implemented behavior |
| --- | --- |
| UnitMilestone · BA-WR-006 | Supplied green badge base + unchanged gold check, independently moving depth layers, stable pointer geometry normalized to the badge size (independent of wider Staircase node wrappers), bounded time-based follow/return, independent compositor-only 7s sheen. Upcoming uses the same sculpture in grayscale; no replay/shine. No outside card, border, padding or visible Unit title; accessible name/state retained. |
| LevelRewardFlag · BA-WR-011 | Original pole and original yellow/gray cloth as separate layers. Pole static; only cloth uses Canvas physical-column offsets with 6×PI, 4px amplitude and 1.6s period. Full artwork/aspect retained. Hidden/offscreen pause, reduced-motion flat, reset phase 0, local-only replacement retaining pole. |
| HamburgerComposition · BA-WR-004 | All outer/inset shadows removed. Existing three colors, 88/100/88 widths and exact corner radii retained. Shared Activity 1 uses 48px column gap without altering authored teaching order. |
| LessonTopBar · BA-WR-001 | Exactly one always-visible G2-O after the title. Short title hugs tag; long title flexes/ellipsizes. Back, course number, complete pill, gaps and centered progress are reserved dynamically. Shared typography now matches real page and library. Original progress/popover permissions remain. |
| CoachMessage · BA-WR-014 | Shared body-only audio for orientation, explanation, Hint, Correct and Incorrect. 36px visible Speaker / 44px target. One owner including prompt audio; stop on toggle, other card, Activity, path exit, Test Mode entry/exit, pagehide and hidden page. English/CJK language selection; error/unavailable are safe. BAButton forwards aria-pressed. |
| Reset Lesson | Confirmed Test Mode runs the same CourseSession/graders in a deep-copied memory Storage. Whole tested Lesson resets answers, tries, hints, feedback, skip/completion and grid state; other Lesson records retained. Formal session/receipts/timers remain separate. Exit restores original view/state; path remains clearly Test Mode; reload/close discards it. Tool is removable through `enableLessonTestTools=false`. |
| Real Staircase | Same Unit/Flag implementation as workbench, original lower node anchors. Flag completion uses real Units and never seeded L0/L1 fixtures. Locked Lesson card, rounded Unit card, WordGrid, Solar, Cross Blur, M4 shader/hills/platforms and grading stay intact. |

## Four supplied image sources

`apps/writing/src/assets/review05/manifest.json` records original SHA-256 hashes, dimensions and derivative crops.

- `writing_flag_2.png`: byte-for-byte original new pole. `writing_flag_2.cutout.png` only removes the connected neutral outside backdrop and blank margins; no redrawn pixels.
- `writing_flag_1.5.png`: byte-for-byte original yellow Completed cloth, including all text/check/background.
- `writing_flag_1.png`: byte-for-byte original gray Upcoming cloth, including its baked-in **Level Completed!** wording. Accessible state remains Upcoming. This supplied text/state mismatch needs designer review.
- `writing_milestone_1.1.source.png`: byte-for-byte supplied green source. Lossless `writing_milestone_1.1.webp` removes only edge-connected pale neutral backdrop and blank margins. Original gold check remains separate and unchanged.

Transparent boundary treatment and pole/cloth placement are implementation candidates for visual review. No generated replacement image was used.

## Reported sentence whitespace

Located the exact sentence in real Activity 1's Better exemplar: “Our school should have a garden for two big reasons.” DOM Range measurement found the sentence and Better label start at the same X; paragraph padding is the intended 12px. No redundant choice icon, hidden placeholder or text indent was present there. The reported defect is **not reproduced**, so no speculative global BAChoice CSS was changed. `sentence-before.png`, `sentence-after.png` and `sentence-measurement.json` retain genuine before/after observations. A different occurrence/state can be reviewed separately by the designer.

## Verification evidence

All generated browser evidence lives in `apps/writing/docs/evidence/review05/`, existing full-learning regression in `integration-v1/`, and M4 measurements in `m4-audit/` and `cloud-m4/`.

- M4 baseline CI: docs/types/production/Storybook passed; unit 121/121 and Chromium 17/17 passed at exact `044f4a6`.
- Local native Chrome/ANGLE Metal Apple M1 Max compiled and drew Clear + transparent M4 as actual `shader`, not a fallback screenshot. Workbench: 300 draws / 15.01 seconds; actual full-size Staircase stayed shader for 60 seconds at ~20 draws/s with 1008×575 buffer; context loss and simulated sustained slow frames fell back safely; simulated hidden page drew zero frames.
- Review 05 local results: docs/typecheck/production/Storybook passed; **125/125 unit**, **25/25 native Chromium**, four rendered Storybook examples and zero axe violations in the audited path/Learn/graded Choice states. See `verification.json` and HANDOFF for scope. The Coach workbench state filter/font parity is separately verified in `shared-coach.json`.
- Speech: real browser found 191 system voices (47 English / 21 Chinese) and reported actual speaking, no pending queue. Automated deterministic ownership/error/unavailable checks use speech stubs. Audible quality has not been independently heard/recorded.
- Safari 18.6 is installed. WebDriver returned “Allow remote automation” disabled; native Safari test is **not run**. No Safari result is inferred from Chrome.

Reproduce:

```sh
npm ci
npm run check:docs
npm run typecheck
npm test
npm run build
npm run test:integration
```

Current live review in this local workspace: Writing `http://127.0.0.1:5184/`, independent component workbench `http://127.0.0.1:6017/?view=components&component=milestone`. Review 05's optional `playwright.audit.config.ts` targets these separate ports; `BA_LIBRARY_URL=http://127.0.0.1:6017/` points its workbench tests at the same checkout. Standard integration config starts ports 5174/6007. Do not reuse another checkout's server while claiming current-branch tests.

## Designer gates and practical limits

Rendered approval: Unit motion damping/depth/sheen, green/silver edges, pole/cloth alignment and image boundaries; fixed G2-O title rhythm; Coach placement/voice quality; Activity 1 spacing. Gray cloth's embedded Completed text remains intentionally unedited. The reported whitespace issue is unconfirmed. Safari/manual physical tablet touch and extended field GPU/battery behavior remain unverified. Upstream shader source redistribution rights remain a separate licensing decision. Missing licensed Douyin font asset still uses the existing fallback.

No visual change is marked formally approved by engineering checks. This delivery is reviewable and remains Draft.

Optional evidence reproduction (start the matching servers first):

```sh
BA_STORYBOOK_URL=http://127.0.0.1:6067/ node scripts/verify-review05-storybook.mjs
BA_LIBRARY_URL=http://127.0.0.1:6017/ node scripts/verify-cloud-m4-workbench.mjs
BA_WRITING_URL=http://127.0.0.1:5184/ node scripts/verify-cloud-m4-staircase.mjs
```

Native Mac 60-second run is a bounded stability sample, not a claim of extended field performance. Workbench and actual Staircase badge pointer travel are checked against the same untransformed action dimensions.
