# Big Academy · current handoff

Updated 2026-10-27 (Asia/Shanghai). Current work: Review 06 Final Fix & Acceptance, branch `feat/writing-review06-refinement`, Draft PR #55 targeting `feat/writing-review05-components-pages`.

## Authorities and scope

1. `apps/writing/PRODUCT.md`: authored learning/state rules.
2. Root `DESIGN.md`: sole visual guide (no app-level DESIGN.md).
3. `packages/design-system/src/tokens.css`: executable values.
4. `apps/writing/contracts/components.json`: stable IDs/API/states.
5. This delivery record. Review 04 documents are historical context.

Target is now L2/G2-O Lesson 1's six screens, E-01 entry/return and Lesson End. Preserve Warm Frame + White Canvas, diagonal separate-platform landscape and all authored grading/gates. Designer owns visual approval; Product Owner owns curriculum. Never change RaoJing414 repositories, merge unreviewed work to main or deploy Vercel without a request.

## Verified Cloud M4 baseline

PR #53 now has `044f4a6f91b13daf4d834e7b71bdebb62c7ed503`. [CI 40341060938](https://github.com/Yuzhwe/big-academy/actions/runs/40341060938) passed full builds, docs, types, 121/121 unit tests and 17/17 Chromium cases. Old visual/disabled-button expectations, missing transition waits, Mac Home-key test and missing video encoder were fixed. [Authentic CI artifact](https://github.com/Yuzhwe/big-academy/actions/runs/40341060938/artifacts/12658614597).

Actual native Mac Chrome used ANGLE Metal Apple M1 Max and rendered original Clear + transparent-current as `shader`. Workbench measured ~19.99 draws/s for 15 seconds; simulated background produced zero draws; context loss and simulated sustained slow frames safely fell back. Review 05 leaves shader algorithms and original scenery intact. See `docs/CLOUD_SHADER_M4.md` and raw `apps/writing/docs/evidence/m4-audit/`.

## Review 05 integration

See [REVIEW_05.md](REVIEW_05.md) for the component/page matrix, source image hashes, exact isolation model, reproduction and acceptance evidence. Unit/Flag/Hamburger/TopBar/Coach are shared between real pages, library and Storybook. Test Mode uses a deep copy in memory and has no formal-storage access. Reset confirmation and Exit Test are visible; formal session survives mode exit. The fixed StairLessonCard, rounded Unit card, convex WordGrid, Solar, Cross Blur and M4 are preserved.

The reported Better sentence whitespace was located and measured but not reproduced: body/label X are equal and 12px paragraph padding is intentional. Before/after screenshots and measurements are retained; no speculative Choice modification.

## Final verification state

Local documentation check, all TypeScript scopes, **125/125 unit tests**, all four builds and **25/25 native Chrome browser tests passed**. Four Storybook examples rendered without page errors. Axe reports zero violations on path/Learn/graded Choice in the checked tags. Full-size Staircase held actual shader rendering for 60 seconds at ~20 draws/s, 1008×575 buffer. Raw records and source-preservation hashes are in `apps/writing/docs/evidence/review05/verification.json`. Final PR CI status is reported in the delivery message; do not confuse local results with remote CI.

## Historical Review 05 runnable local review

Writing: `http://127.0.0.1:5184/`; library: `http://127.0.0.1:6017/`. These servers point to this independent checkout at `/Users/yuzhe/Documents/ChatGPT/Big Academy/review05`, not the older `integration-v1` server on 5174/6007. Standard commands/configs remain available in package.json; verify actual printed ports. Existing servers on older ports are not evidence for this branch.

## Still requires human/device review

- Designer: rendered Unit follow/sheen, green/silver boundaries, pole/cloth alignment, title/pill spacing and Coach/Activity composition.
- Gray Upcoming cloth contains designer-supplied “Level Completed!” text. It stays unchanged, with correct accessible Upcoming state.
- Safari 18.6 WebDriver unavailable because Allow remote automation is disabled. Safari not run.
- Real speech API reports 191 voices and speaking; audible quality not independently heard/recorded. Automation verifies ownership and failure paths with stubs.
- Physical tablet touch, extended field GPU/battery performance and upstream shader redistribution rights remain separate reviews. Existing missing licensed Douyin asset/fallback remains.

Keep Draft. No main merge and no Vercel deployment.


## Review 06 · final acceptance handoff

### Current branch and verified implementation

- Draft PR: #55, branch `feat/writing-review06-refinement`, base `feat/writing-review05-components-pages`.
- Verified engineering implementation SHA: `926224b334dcc1f1d3595ec2da0cec323cabf3df`. This handoff update is delivery metadata only; before making new code changes, read PR #55's current HEAD in case another Agent has added a newer commit.
- Verification run: GitHub Actions [40470164313](https://github.com/Yuzhwe/big-academy/actions/runs/40470164313), checked out exactly `926224b`, conclusion **success**.
- Evidence artifact: [12718139175](https://github.com/Yuzhwe/big-academy/actions/runs/40470164313/artifacts/12718139175), SHA-256 `8ba7b5a437ed6a13cab99baab44829359fb816864029dc840eefae7ac53eab97`.
- PR stays **Draft**. No main merge and no Vercel deployment.

### Accepted fixes

1. **Per-Level first-entry card drop:** session-only receipt uses `sessionStorage` plus an in-memory fallback, keyed by Level and kept completely outside Alex learning records. The drop can run only on the first Level entry in a browser-tab session, never on Lesson return, Level re-entry or reload. Low/System Reduced Motion claims the first visit without playing a deferred drop. Incoming Lesson cards temporarily reject pointer entry during the animation so the motion cannot accidentally enter a lesson.
2. **Unified motion policy:** the CourseApp shell owns High/Low preference; live `prefers-reduced-motion: reduce` overrides High. Low/Reduced forces Lightweight Clouds, reduces scenic parallax, suppresses the first-entry drop, pauses LevelRewardFlag cloth motion, removes UnitMilestone/Solar ornamental motion, removes route blur and celebration particles, while preserving layout, focus and essential correctness/error feedback. High keeps M4 `auto` selection and its existing performance/WebGL fallback rules.
3. **Six-Activity runtime and Tapword semantics:** every runtime Lesson filters standalone P2/P7 while authored templates and historical records remain preserved. Lesson 1 is exactly `ts1 → ts4 → ts3 → ss.L2-04 → ts8 → apply` and ends after Apply. Tapword second wrong enters `shown`, reveals both authored valid targets with the approved outline flash, retains wrong semantics, gives zero credit/celebration and keeps Next blocked. A later valid selection + explicit Check is required for `done`.
4. **Single-source docs/contracts:** PRODUCT.md, DESIGN.md and `components.json` now use six current Lesson 1 activities. P2/P7 are explicitly historical / **Not in current runtime sequence**. Old 1–8 indicators, old Guided Build three-tab description and stale Review 05 current-task wording were removed or marked historical. `tokens.css` requires no Review 06 value change beyond the already-landed semantic input/motion values.

### Final automated and browser verification

All results below are from run **40470164313** on `926224b`, not from Review 05 or an older local server.

- `npm run check:docs`: **Passed**.
- `npm run typecheck`: **Passed**.
- `npm test`: **127 passed / 0 failed / 3 skipped** across 22 test files. The skipped cases are retained legacy/historical flows, not deleted coverage.
- `npm run build`: **Passed** for design-system, Writing, Storybook and Library.
- `npm run test:integration`: **27 passed / 0 failed / 3 skipped** in native GitHub Actions Chrome, 4.1 minutes. The three skipped browser cases are explicitly historical P2/P7 tests that are not in the Review 06 runtime.
- Browser coverage that passed includes: real M4 candidate rendering and Lightweight/WebGL-unavailable fallback; six-screen correct flow; wrong-twice shown-and-retry; Lesson End after Apply; reload/return/retest persistence; English and Chinese path; keyboard/touch/reduced-motion checks; 200% layout; WordGrid caret/provenance; TopBar overflow; High→Low→High and live System Reduced Motion; first entry once per Level including reload; and 1440/1024/834/390 no-horizontal-overflow regression.
- Automated axe test passed for the configured WCAG tags on path, first Lesson activity and graded Choice, with its report retained at `apps/writing/docs/evidence/integration-v1/accessibility.json` in the CI artifact. The test treats color-contrast findings separately, so do not claim an independent manual contrast sign-off from this automation.

### Review entry points

- Component Library command: `npm run dev:library`. Review the existing WordGrid candidate comparison and BATabs 36/50/70 candidate controls there.
- Writing command: `npm run dev`.
- No currently running local URL is claimed by this handoff. The older Review 05 localhost addresses above are historical and are **not** evidence for Review 06.
- Workbench WordGrid 56px/18px and BATabs 36/50/70 remain **Pending Visual Approval** and do not replace approved real-page defaults.

### Remaining human/device review only

- UI/UX Designer final rendered visual approval: Unit milestone follow/sheen, flag pole/cloth alignment, title/pill spacing, Coach/Activity composition, plus the isolated Workbench candidate sizes.
- Safari was not part of run 40470164313; physical tablet/mobile touch hardware was not tested. CI covers emulated viewport/touch regression only.
- Extended real-device GPU/battery behavior and audible speech quality remain device/human checks. Existing shader fallback, visibility suspension and speech error paths are automated.
- No unresolved Review 06 engineering blocker is known after the green run above.



## Review 06 · Final Visual & Interaction Refinement (2026-10-28, new iteration)

**Status: PARTIALLY IMPLEMENTED — not accepted.** This is separate from the prior green engineering acceptance at `d816079`. The new commits after that SHA are not covered by old CI runs. Recheck current HEAD and all results before declaring a pass. PR #55 remains Draft; do not merge main or deploy Vercel.

### Implemented in the new remote branch
- BA-WR-002: Designer Reset Lesson tool moved into an isolated non-scrolling Coach-rail slot, above Previous/Next. The root LessonTopBar + Workspace now remains two rows; paper and Coach align at their tops and share remaining 100dvh height. Existing internal Coach/paper scroll and responsive structure preserved.
- BA-WR-003: Default pill dimensions 70px min / 20px / 28px / 12px×18px. Dark brown selected outline, no disabled-on-select. Stable per-card identity for ordered build; fill, select/undo and reselect maintain the same `TaskProgress.built` + `builtCardIds` record. Frame fill uses `frameCardPlacements` with stable ID, blank and exact character span; manual typing reconciles these selections. Tapword after Correct retains filled success for the selected answer and reveals other authored correct targets without setting selected. Existing wrong/shown/credit/Next gates preserved.
- Shared WordGrid and Writing use the same implementation; workbench and Storybook include selected/undo and correct-unselected examples.
- Added Vitest and Playwright regression cases; PRODUCT.md, DESIGN.md, component Contracts updated.

### Blocking resource / verification gaps
- **Tree replacement BLOCKED**: the required approved `apps/writing/public/assets/trees/tree-green.png` and `tree-orange.png` return 404 on the remote branch. Existing code-drawn trees are embedded in `apps/writing/src/assets/r2.12/hill-front.svg`. Do not delete/replace these with guessed assets. Sync the designer's exact approved local PNG files into version control, then replace the SVG tree paths in place using the five original positions/baselines and deterministic per-Level assignment, calibrate alpha margins and verify parallax.
- **CI and browser verification UNVERIFIED** for this newer iteration: prior full green runs belong to old HEAD `d816079`, not these changes. Unit tests, typecheck, build, Storybook, Playwright and screenshots need a fresh run; never mark them PASS based on earlier CI.
- **Local Mac preview UNVERIFIED**: this remote GitHub-only execution had no access to `/Users/yuzhe/Documents/ChatGPT/Big Academy/review05`, port 5184 or port 6017. Do not advertise local services as running; verify their PID, cwd and latest checkout before designer review.
- Physical Safari and tablet QA plus designer visual approval remain outstanding. Preserve untracked `review-evidence-review06-lesson1.png` in the actual Mac workspace.

### Next execution steps
1. Reconcile remote branch with local worktree without force-reset; preserve all untracked/user changes.
2. Add exact missing approved PNG resources and finish the stable one-for-one tree swap; no duplicate trees.
3. Run `npm run check:docs`, `npm run typecheck`, `npm test`, `npm run build`, `npm run test:integration`, `git diff --check`; investigate all failures, keep assertions intact.
4. Verify 1440×900, 1024×768, 834px, 390px; confirm both internal scroll, bottom-right navigation, build/card undo, Check/Correct/Shown and full-page tree comparisons. Capture actual browser screenshots/video and attach to existing Draft PR #55.
5. Only after those gates may engineering acceptance be reported; visual approval still belongs to the designer.
