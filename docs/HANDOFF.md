# Big Academy · current handoff

Updated 2026-10-27 (Asia/Shanghai). Current work: Review 05 shared components + Writing integration, branch `feat/writing-review05-components-pages`.

## Authorities and scope

1. `apps/writing/PRODUCT.md`: authored learning/state rules.
2. Root `DESIGN.md`: sole visual guide (no app-level DESIGN.md).
3. `packages/design-system/src/tokens.css`: executable values.
4. `apps/writing/contracts/components.json`: stable IDs/API/states.
5. This delivery record. Review 04 documents are historical context.

Target remains L2/G2-O Lesson 1's eight screens, E-01 entry/return and Lesson End. Preserve Warm Frame + White Canvas, diagonal separate-platform landscape and all authored grading/gates. Designer owns visual approval; Product Owner owns curriculum. Never change RaoJing414 repositories, merge unreviewed work to main or deploy Vercel without a request.

## Verified Cloud M4 baseline

PR #53 now has `044f4a6f91b13daf4d834e7b71bdebb62c7ed503`. [CI 40341060938](https://github.com/Yuzhwe/big-academy/actions/runs/40341060938) passed full builds, docs, types, 121/121 unit tests and 17/17 Chromium cases. Old visual/disabled-button expectations, missing transition waits, Mac Home-key test and missing video encoder were fixed. [Authentic CI artifact](https://github.com/Yuzhwe/big-academy/actions/runs/40341060938/artifacts/12658614597).

Actual native Mac Chrome used ANGLE Metal Apple M1 Max and rendered original Clear + transparent-current as `shader`. Workbench measured ~19.99 draws/s for 15 seconds; simulated background produced zero draws; context loss and simulated sustained slow frames safely fell back. Review 05 leaves shader algorithms and original scenery intact. See `docs/CLOUD_SHADER_M4.md` and raw `apps/writing/docs/evidence/m4-audit/`.

## Review 05 integration

See [REVIEW_05.md](REVIEW_05.md) for the component/page matrix, source image hashes, exact isolation model, reproduction and acceptance evidence. Unit/Flag/Hamburger/TopBar/Coach are shared between real pages, library and Storybook. Test Mode uses a deep copy in memory and has no formal-storage access. Reset confirmation and Exit Test are visible; formal session survives mode exit. The fixed StairLessonCard, rounded Unit card, convex WordGrid, Solar, Cross Blur and M4 are preserved.

The reported Better sentence whitespace was located and measured but not reproduced: body/label X are equal and 12px paragraph padding is intentional. Before/after screenshots and measurements are retained; no speculative Choice modification.

## Final verification state

Local documentation check, all TypeScript scopes, **125/125 unit tests**, all four builds and **25/25 native Chrome browser tests passed**. Four Storybook examples rendered without page errors. Axe reports zero violations on path/Learn/graded Choice in the checked tags. Full-size Staircase held actual shader rendering for 60 seconds at ~20 draws/s, 1008×575 buffer. Raw records and source-preservation hashes are in `apps/writing/docs/evidence/review05/verification.json`. Final PR CI status is reported in the delivery message; do not confuse local results with remote CI.

## Runnable local review

Writing: `http://127.0.0.1:5184/`; library: `http://127.0.0.1:6017/`. These servers point to this independent checkout at `/Users/yuzhe/Documents/ChatGPT/Big Academy/review05`, not the older `integration-v1` server on 5174/6007. Standard commands/configs remain available in package.json; verify actual printed ports. Existing servers on older ports are not evidence for this branch.

## Still requires human/device review

- Designer: rendered Unit follow/sheen, green/silver boundaries, pole/cloth alignment, title/pill spacing and Coach/Activity composition.
- Gray Upcoming cloth contains designer-supplied “Level Completed!” text. It stays unchanged, with correct accessible Upcoming state.
- Safari 18.6 WebDriver unavailable because Allow remote automation is disabled. Safari not run.
- Real speech API reports 191 voices and speaking; audible quality not independently heard/recorded. Automation verifies ownership and failure paths with stubs.
- Physical tablet touch, extended field GPU/battery performance and upstream shader redistribution rights remain separate reviews. Existing missing licensed Douyin asset/fallback remains.

Keep Draft. No main merge and no Vercel deployment.
