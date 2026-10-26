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

GitHub delivery: [Draft PR #52](https://github.com/Yuzhwe/big-academy/pull/52), `feat/writing-hifi-integration-v1` → `feat/component-library-r2`. The launcher was executed successfully on this Mac and detected/opened the running website. To obtain a normal Git checkout, clone this branch using your authenticated GitHub client, then double-click the launcher.

## Fixed local URLs · 2026-10-26

On this Mac, the library is http://localhost:6007/ and Writing is http://localhost:5174/. Both now run as independent user LaunchAgents, survive closing Terminal and restart at login. The existing 127.0.0.1 aliases remain available, including for progress saved under that origin. Browser storage stays origin-specific; this setup does not migrate learner records between localhost and 127.0.0.1.

Built snapshots and the runtime are installed under `~/Library/Application Support/Big Academy/`. To publish a new local review version, rebuild the apps then run `npm run local-sites:install`. No source-watching server is required. Logs are in that directory's `logs/` folder. Stop/remove a service with `launchctl bootout gui/$(id -u)/com.bigacademy.local.library` (or `.writing`) and remove its corresponding `~/Library/LaunchAgents/com.bigacademy.local.<site>.plist` file. Ordinary login then no longer starts that service.

## R2 Design Review 01 · four-item consistency follow-up

This follow-up corrects four designer-confirmed discrepancies in the integration branch, without altering product scoring, saving, unlocking or assessment behavior.

1. StairLessonCard accepts the original session states `start` and `continue`, but both use the same `enterable` presentation and localized `Enter / 进入` CTA. Resume behavior remains owned by the session.
2. `review` (and source `skipped`, when applicable) use the `completed` visual role. The lesson-number seal uses existing `--ba-color-success-fill` with a white number and no badge border.
3. Skipped is no longer a separately displayed card role or Storybook state. Skip remains a distinct **learning-record** state; its persistence, skip-revocation and LessonTopBar rules are untouched. The card no longer shows a visible `Mastered · skipped` note.
4. WordGrid cards display only authored learning content. Selection/evaluation/disabled meanings remain in accessible labels and data attributes, and the existing graders/hints/shown-answer behavior is untouched.

Stories, component contract and targeted regression assertions were updated. **The original 83 Vitest / 24 Playwright pass counts predate these new commits; do not treat them as post-fix test results.** Re-run `npm run check:docs`, `npm run typecheck`, `npm test`, `npm run build` and `npm run test:integration` in the authenticated local checkout. Visual sign-off is still pending, and PR #52 remains a Draft.


## LessonTopBar correction · R2 Design Review 01 (2026-10-26)

A focused review correction updates the shared `BA-UI-006` marker and `BA-WR-001` layout:
- 50×50 icon-only Back and two-line clamped lesson name that uses the available safe left-hand width;
- indicator rail centered against the full header; on narrow **component containers** it occupies its own centered row;
- numeric-only progress markers with no attached check/lock icons, independent source status and selected index;
- Done = dark fill with white numeral; Done+Selected retains the fill and adds outer ring;
- Locked = disabled colors; Skipped = inner dashed border; Skipped+Selected = dashed inner border and outer ring.
- No scoring, unlocking, navigation entitlement or persistence logic changed.

`DESIGN.md`, canonical `apps/writing/PRODUCT.md` sections 13–15, the component registry, preview stories and targeted unit tests were synchronized. This is code and documentation delivery, **not new visual approval**. Previous 83 unit/24 browser passing figures **precede** this follow-up; no current-chat post-change test run or rendered QA has occurred. Refresh the local development checkout and rerun all checks. For the fixed localhost sites, remember their built snapshots do not auto-update from Git; rebuild and run `npm run local-sites:install`.


## R2 Design Review 02 · implementation submitted for review (2026-10-26)

**Target:** draft PR #52, `feat/writing-hifi-integration-v1`. Nine requests DR02-01–DR02-09, code and docs updated on that branch only; no changes to main or Vercel.

- **DR02-01/02 – StairLessonCard:** the designer library surfaces only Enterable, Completed, Locked; saved start/continue still map to Enter with the **same Writing brown outline**, and Completed retains its green-white seal. Scene-specific card geometry, border, current override and number alignment styles were removed, so the library component is authoritative in the staircase.
- **DR02-03/04/05 – Staircase Unit:** removed visible Writing path kicker; Unit heading shares the Lesson heading design tokens; top-right Unit paper-fold triangle and shadow were reworked to join the main sheet without floating-square treatment. R2.12 scenery, camera, clouds and Level navigation remain as found.
- **DR02-07 – BA-UI-006 LessonTopBar:** one row max 9 slots, including overflow; measured 44px targets and 36px shared numeric/ellipsis circles, current-first contiguous visible window. The same Indicator renders in rail and portal popover. Anchored popover has 424px max width, 40px radius/inset, six fixed left-aligned columns, internal scroll and Escape/outside/Close/focus semantics. The 50px Back and two-line title constraints remain. 320px Mobile custom layout deferred.
- **DR02-08 – Apply editor:** textarea is not user-resizable, occupies remaining writing-paper height with internal scroll; same WordGrid docks under the tip at the bottom while preserving stored caret/insertion.
- **DR02-09 – Footer:** contextual primary truly receives Disabled from original task progress/answer data. Single selection needs one, multi needs exactly authored three, tapword needs a selected token, FrameFill all blanks, Apply at least three words. P2 Learn remains actionable; Build auto-grading remains unchanged. **P7 blank internal questions and one-time Hand in warning / Hand in anyway are explicitly preserved**, as required by the original product; enabling a CTA never implies correctness or mastery.

Updated `DESIGN.md`, `apps/writing/PRODUCT.md`, `apps/writing/contracts/components.json`, designer-library catalog/controls/preview, Storybook stories, Vitest tests, and the Writing Playwright integration specification. After review of CSS specificity, all Staircase overrides of the inner StairLessonCard styles were removed.

**Verification is pending**: Files were updated and re-read via authenticated GitHub contents API, and the contract is valid JSON; **no post-change TypeScript/build/Vitest/Playwright/a11y tests or screenshot comparison has been executed** in this chat environment. Former PR test counts belong to an earlier branch head and must not be used as evidence for Review 02. Use `npm run check:docs`, `npm run typecheck`, `npm test`, `npm run build`, `npm run test:integration` on the updated local branch. Inspect keyboard/popover placement at 1440/1024/834 and the original fold and numeric positioning reference; the designer has final visual approval.

**Local snapshot caveat:** fixed `http://localhost:5174/` and `http://localhost:6007/` services serve published built copies. Merely pulling this GitHub branch does **not** update the sites. Rebuild and run `npm run local-sites:install` to refresh them, or run the local dev server / launcher. Do not merge or announce release solely on a GitHub commit.
