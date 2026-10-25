# Writing Hi-Fi Integration v1.0 · review delivery

Status: implemented, engineering verification recorded below; designer acceptance pending.

## Run on this Mac

Double-click `Start Big Academy.command` in the repository root. The browser opens at http://127.0.0.1:5174/. The terminal stays open while serving. Close it or press Control+C to stop. First use on another Mac prepares Node.js and project dependencies if absent; internet is required for that preparation. If Gatekeeper refuses an unsigned command file, right-click → Open. Do not disable macOS security globally.

The current isolated local folder is `/Users/yuzhe/Documents/ChatGPT/Big Academy/integration-v1`. Its local Git history starts from a byte-verified snapshot of PR #51 because the supplied workspace has no Git metadata and the terminal has no private-repository credentials. The GitHub delivery branch uses the actual PR #51 commit as its parent; use a fresh authenticated clone for ordinary pull/update workflows.

Developers can use `npm run dev -w @big-academy/writing -- --port 5174 --strictPort`. The independent component library remains `npm run dev:library` (port 6007). Storybook remains `npm run storybook`.

## Scope and baseline

- Repository: Yuzhwe/big-academy only.
- Exact baseline: PR #51, `feat/component-library-r2`, commit `e2886bab2e013252ae1f358cf5b9711677f34a35`.
- Local text/source files matched every remote blob hash. Three older PNG backdrop files were absent locally; the new scene uses the supplied R2.12 assets instead. Remote base-tree files are preserved.
- PRODUCT: Canonical product specification v1 · 2026-10-21. Only L2 / G2-O / Lesson 1's eight Activity Screens are in the implementation scope.
- Artwork: supplied local `Big-Academy-Staircase-R2.12.html`; source hash and extraction provenance in `src/assets/r2.12/README.md`. A file with the `(1)` suffix and a separate complete R2 Design Review 01 document were not available. The explicit confirmed review items in the current request form the implemented checklist; full-document parity cannot be certified without those materials.
- No merge to main. No Vercel deployment requested or performed. `vercel.json` disables Git deployments for this review branch before it is created.

## What changed

1. Shared components: token-driven Choice hover elevation; opt-in Glass Tabs candidate and designer control; three reserved Lesson Card title lines by default; current/completed/locked visual roles with original action states; connected WordGrid tab curves, error/hint states; TopBar examples retain independent selection and completion/lock/skip status.
2. Staircase: lossless cloud image, original SVG hills, floating clouds, two badge layers and level flag from R2.12; shared cloud CSS used by scene and library; original React camera/gates retained, arrow controls added, endpoint safety insets, badges/flags have no pedestal. Product lesson content replaces the reference's demonstration data.
3. Course: all eight source-backed screens, exact authored Engine/Analyzer graders, practice retries/shown, word-specific build misses, Frame Fill, three-sentence Apply, two assessment sets, results, optional unmastered Review retry, distinct mastery outcome, Lesson End and Review return. Correct tapword remains visibly marked and locked. Apply has the authored two-hint ladder without reveal. P7 writing prompt and stored per-question rationale are visible.
4. Recovery: same `g2o_unit_state_v4` record, 250ms debounce for edits/selections, synchronous navigation/check/exit flush; screen feedback saved in that record; caret-aware insertion and text provenance preserved. P7 has no WordGrid or hints. Browser read-aloud uses available system voices; no model service is called.

PRODUCT §12.1's one authored `set` group governs Screen 05; older generic three-tab Build descriptions are superseded for this screen. Screen 06 keeps task/opinion/marks and Screen 07 keeps opinion/nouns/adjectives/marks.

## Reproduce verification

```sh
npm run check:docs
npm run typecheck
npm test
npm run build
npm run test:layout
npm run test:integration
```

Final results are appended after the last run. The integration tests drive rendered controls from a fresh learner record; they do not seed completion to get through the eight screens. Unit tests also cover grading boundaries and state recovery directly.

## Visual review evidence

Local evidence: `docs/evidence/integration-v1/`. `review.html` is a local screenshot gallery. Screenshots are review evidence, not approved visual baselines. Representative artifacts include the cloud staircase in four widths, eight screen variants, first/second misses, hint and shown states, mastery and non-mastery results/ends, Chinese layouts, and reduced-motion views.

Touch was simulated in Chromium at 834×1112; no physical touch-device or human screen-reader test is claimed. The 200% check uses 720 CSS pixels for a 1440-pixel display layout; it is not a native browser-menu zoom test. Axe coverage is the path, Learn and a graded Choice, not every possible state.

## Known limits and owner review

- Designer: rendered Glass Tabs, Choice hover shadow, three-line card roles/cloud overlap, connected WordGrid curves/error states, ActivityScreenIndicator and Unit folded corner, badges/flag motion, and lesson composition await final visual acceptance.
- Source completeness: full R2 Design Review 01 and the exact `(1)`-named upload were unavailable; provided explicit items and the located R2.12 reference are implemented.
- Typography: Douyin is not bundled without a distributable licensed asset. Chinese headings use the existing fallback. Google-hosted Dosis/Jost/Noto Sans SC need network/cache; system fallbacks apply when unavailable.
- Content localization: original source lacks Chinese supporting placeholders for the two non-topic hamburger layers and a Chinese Apply tip. These remain source English material; no translated grading text was invented.
- Product Owner: preserve original CJK and safety-flagged Apply attempt/move-on behavior pending the decisions already listed in PRODUCT §19. No new safety/completion policy is introduced.
- Existing approved green/white Choice treatment still needs a manual readability decision. A zero-violation automated audit of disabled graded controls is not proof of every color pairing's contrast.
- Build warnings about large chunks remain; builds succeed. Browser speech output depends on installed voices and was not audibly reviewed.
- Learning data is browser-local on the same origin. This delivery adds no account sync and no other playable curriculum.

Third-party notices remain in `packages/design-system/THIRD_PARTY_NOTICES.md` and `apps/writing/public/licenses/tsparticles-MIT.txt`. Supplied artwork is recorded as designer-provided, not relicensed as an external stock asset.


## Final verification · 2026-10-26

| Check | Result |
| --- | --- |
| Documentation sources | passed |
| TypeScript, including stories and browser tests | passed |
| Vitest | 16 files / 83 tests passed |
| Production build | design system, Writing, Storybook and component library passed |
| Full Playwright regression | 24 tests passed, including 8 integration scenarios |
| Axe | 0 reported violations in the 3 recorded scenarios |
| Launcher shell syntax and repository whitespace checks | passed |

The initial regressions exposed obsolete disabled-button click and old green-platform expectations, plus unstable font/camera sampling. They were corrected against the actual approved contract and the complete suite was rerun. The final local gallery contains 40 screenshots. JSON summaries and accessibility output accompany it. Screenshots stay local; source, assets, reproducible tests and the portable report are included in the review branch.
