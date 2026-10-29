# BIG ACADEMY · Documentation Audit Phase 2 — PR #62 final incremental synchronization

**Date:** 2026-10-29 · **Repository:** `Yuzhwe/big-academy`

**Read/coverage SHAs:** initial full audit **`3300151d08706ec91a7719f072e9717b853e7e4d`** (PR #60); final **incremental engineering baseline `af1a6d47291928e7e7d70379d2a51d5986a0f6a8`** (PR #62; `feat/writing-review07-refinement08-20261029`). **Review branch:** `docs/writing-phase2-canonical-sync-20261029`. **Review status:** DRAFT, Pending Joe; code implementation must not be confused with visual approval.

## Authority and provenance

- Canonical learning behavior: `apps/writing/PRODUCT.md`, authored original `apps/writing/source/alex-original.html`, observed session `apps/writing/src/product/courseSession.ts`; **Alex** is final product-business authority.
- Canonical presentation: **repository-root `DESIGN.md` only**; CSS custom properties in `packages/design-system/src/tokens.css` hold executable token values; component interfaces/status in `apps/writing/contracts/components.json`; `docs/HANDOFF.md` is continuity/history.
- Design signoff: Joe. Code merged, a local preview, a screenshot or passing tests do **not** automatically approve an interaction or visual.
- Scope boundary, updated: PR #62 is **now** the audited and selected engineering source after exact compare against PR #60. Its four source/test changes are incorporated solely as implementation evidence; none is promoted to Joe-approved design.

## Source-aligned findings and dispositions

| ID | Severity | Finding | Phase 2 disposition |
| --- | --- | --- | --- |
| D2-01 | P0 | PR #60 Q6 NotebookShell and CoachNote runtime missing or mischaracterized in current canonical docs/contracts | Corrected as **Implemented / Pending Review**; validator and safety untouched |
| D2-02 | P0 | Component contract claimed NotebookShell exposed textarea `value/onChange` and was Library-only, contrary to `NotebookShell.tsx` / Q6 `CourseApp.tsx` | Corrected shell `children` API, layout ownership and runtime evidence; no invented props |
| D2-03 | P1 | PRODUCT §7 BAChoice selected fill contradicted approved target in root DESIGN and shared CSS was still legacy | Separated behavioral state authority from approved *visual target* and source-observed implementation gap; **Pending Joe** |
| D2-04 | P1 | PRODUCT's ordered build mentions three tabs and points at Screen 05 instead of Screen 04 | Corrected Screen 04 to single `set` bank; Screen 05 remains three groups; Q6 remains four |
| D2-05 | P1 | BA-WR-008 component source/props/status were stale, as the actual Level intro and StartPoint combo already exist | Corrected actual runtime component; distinct approved orange Level Title Card still Pending Review |
| D2-06 | P1 | BA-WR-010 contract said standalone LandscapeTerrace files did not exist | Corrected existing helper and scene pseudo-element composition; no assumption of final visual approval |
| D2-07 | P1 | BA-WR-015 StartPoint erroneously described as Library-only | Corrected for real E-01 `StartPointLevelCombo` assembly; approval pending |
| D2-08 | P1 | BA-WR-019 BackToCurrent would be easy to mistake for integrated navigation | Locked to Library exploration at SHA; later local work not included |
| D2-09 | P1 | Root DESIGN and HANDOFF led with old Review 06 baseline despite newer specified audit source | New current-first authority/status index; older history preserved in place |
| D2-10 | P2 | Root DESIGN referenced absent `docs/design-system/COLOR_SYSTEM_v0.2.md` | Redirected executable values to existing CSS and §2.4; no fabricated document |
| D2-11 | P2 | Existing registry unit test originally omitted Review 07 entries/states | **Partially resolved in PR #62 source**: BA-WR-015/016/017 and BA-WR-018/019 covered, but **BA-WR-008 remains missing** from the test's implemented-ID allowlist even though the Phase 2 contract reflects its actual mounted implementation. Static mismatch remains; hosted CI unrun |
| D2-12 | P2 | CI historically ran on other SHAs; present Docs branch has no automatic workflow trigger | **Unverified until exact-SHA Actions result**; no green claim |

## Previous report reconciliation

The checked repository report `docs/audits/writing-review06-documentation-sync-20261028.md` explicitly records **1 P0 + 8 P1 + 4 P2**, not the **4 P0 + 7 P1 + 2 P2** count cited in the Phase 2 brief. Do not invent a mapping to an unavailable second list. The D06-001..013 dispositions were rechecked against current entrypoint, README, root DESIGN, HANDOFF, contracts, code and docs smoke script: entrypoint six-screen scope and canonical paths remain corrected; WordGrid source grouping needed the additional PRODUCT correction above; BAChoice and independent Level Title Card remain pending; LandscapeTerrace previously documented as missing now exists; prior exact-SHA QA results cannot be carried forward. If the 4/7/2 report is later furnished, reconcile by issue ID in the incremental audit.

## Inspected surfaces and acceptance basis

- Learning data/runtime: `apps/writing/source/alex-original.html`, `src/product/courseSession.ts`, `src/product/courseSession.test.tsx`, `src/course/CourseApp.tsx`, `apps/writing/e2e/review06.spec.ts`.
- Composition: `LessonWorkspace.tsx`, `WordGrid.tsx`, `WordChip.tsx`, `NotebookShell.tsx` + CSS, `CoachNote.tsx`, `StartPointLevelCombo.tsx`, `StairLevelIntroCard.tsx`, `LandscapeTerrace.tsx` + CSS, `StaircaseScene.tsx`, `SolarLessonPreview.tsx`, and `apps/library/src/PathBackToCurrentPlayground.tsx`.
- Design system: `packages/design-system/src/tokens.css`, `BAChoice.tsx` + CSS, `apps/library/src/catalog.ts`, component registry and its `registry.test.tsx`; source and tokens were **read only**.
- Canonical docs: PRODUCT, root DESIGN, HANDOFF, Review 06 audit; existing `scripts/check-document-sources.mjs` smoke logic and available `.github/workflows` triggers inspected.
- Static validation: exact strings reconciled, JSON contract round-trip parse, six-Activity routing preserved, source paths and authority boundaries checked. This is **not** a substitute for `npm run check:docs`, `npm run typecheck`, unit/browser tests or Joe's render approval.

## Pending Alex / Joe and incremental synchronization

- **Pending Alex:** 3+-word CJK-heavy Apply counted-failure behavior, safety-flagged repeated submission and `Move on for now`, and exact Coach last-response restoration across hard reload.
- **Pending Joe:** approved-vs-implemented BAChoice selection/undo, separate Level Title Card/4-line description, Q6 notebook paper top/shadow/scroll, flag Upcoming vs Completed, BackToCurrent design/real-page integration, motion, focus and final screen review.
- **Incremental status:** performed `compare_commits(3300151d, af1a6d4)` and verified 4 modified source/test files (exact list below); merged their documentation implications while retaining all previous Phase 2 findings. For future commits, compare against `af1a6d4`, update only affected paragraphs, obtain exact-SHA CI and request Joe approval.

**Delivery remains:** existing Draft PR #61 retargeted to PR #62 branch for **doc-only/contract diff review**. The doc branch is a non-forced merge descendant of both earlier PR #61 doc commit and exact PR #62 engineering commit. No main merge, tag, deploy, final design approval or archive is claimed.

## Final incremental delta log — PR #60 to PR #62

**Compare:** `3300151d08706ec91a7719f072e9717b853e7e4d` → `af1a6d47291928e7e7d70379d2a51d5986a0f6a8`; GitHub reports `ahead_by=4`, `behind_by=0`, `total_commits=4`, four modified files only. No PRODUCT, root DESIGN, Component Contracts, HANDOFF, learner runtime or shared Token edits in this four-file increment.

| Changed GitHub source file | Observed exact delta | Canonical documentation impact | Approval |
| --- | --- | --- | --- |
| `apps/writing/src/course/LevelRewardFlag.css` | `.ba-flag[data-state="upcoming"] .ba-flag__cloth { translate: 10px 0; }` | Root DESIGN and BA-WR-011; static Upcoming cloth only, not pole/pedestal or waving Completed cloth | Implemented / Pending Joe visual review |
| `apps/writing/src/course/course.css` | Q6 NotebookShell `margin-top` `-10px` → `-51px` (extra −41px) | PRODUCT Q6 assembly; root DESIGN and BA-WR-016. Trial to visually align white-paper top edge to Coach container top | Implemented / Pending Joe visual review |
| `apps/library/src/PathBackToCurrentPlayground.css` | BAButton assembly `border-color: transparent`, `border-bottom-width:1px` so Solar rim owns capsule border | Root DESIGN and BA-WR-019. Library-only style; preserve 50px size, focus and Solar active/fallback; Writing scene remains untouched | Implemented specimen / **Exploration**, Pending Joe |
| `apps/writing/src/contracts/registry.test.tsx` | Implemented ID set adds 015/016/017; allowed states add `exploration` | HANDOFF / audit evidence. Original Phase 2 registry test incompatibility corrected. Contracts were not changed by engineering increment | Source-corrected; CI proof not independently available |

**Testing provenance:** PR #62 description reports TypeScript passed, 3 production builds passed and Vitest 138 passed / 3 skipped. GitHub commit check-runs endpoint returned `total_count: 0` at `af1a6d4` and no status records; do **not** report those agent statements as hosted CI. Doc-branch exact-SHA CI must be collected separately. Original four-file Phase 2 docs remain preserved; this section is additive evidence, not a replacement audit.

**Additional QA finding D2-13 (P1, test/contract drift):** Under the exact `af1a6d4` registry test, BA-WR-008 is not in the `implemented` ID set and is therefore tested against only `planned | specified-not-implemented | exploration`. Phase 2 documented the already-existing `StairLevelIntroCard.tsx` as `implemented`, correctly matching the component mounted by `StartPointLevelCombo` in `CourseApp`. Static comparison yields one predictable assertion failure for BA-WR-008. Keep the code-backed contract and request a separate test-maintenance update adding BA-WR-008 to the test's implemented-ID allowlist; no test or runtime code was changed in this documentation PR. `npm test` was **not** run on the documentation commit. This static finding is **not** a claim that a real CI job failed.
