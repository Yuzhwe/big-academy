# BIG ACADEMY · Documentation Audit Phase 2 — PR #60 pinned review

**Date:** 2026-10-29 · **Repository:** `Yuzhwe/big-academy`

**Read/coverage SHA:** `3300151d08706ec91a7719f072e9717b853e7e4d` (Draft PR #60; `feat/writing-review07-preview-upload-20261029`). **Review branch:** `docs/writing-phase2-canonical-sync-20261029`. **Review status:** DRAFT, Pending Joe; not an approved final design or product release.

## Authority and provenance

- Canonical learning behavior: `apps/writing/PRODUCT.md`, authored original `apps/writing/source/alex-original.html`, observed session `apps/writing/src/product/courseSession.ts`; **Alex** is final product-business authority.
- Canonical presentation: **repository-root `DESIGN.md` only**; CSS custom properties in `packages/design-system/src/tokens.css` hold executable token values; component interfaces/status in `apps/writing/contracts/components.json`; `docs/HANDOFF.md` is continuity/history.
- Design signoff: Joe. Code merged, a local preview, a screenshot or passing tests do **not** automatically approve an interaction or visual.
- Scope boundary: local `review07-preview-wt` flag/Q6 alignment/BackToCurrent changes were not provided as a new GitHub SHA for this checkpoint. A separate `feat/writing-review07-refinement08-20261029` branch is ahead of PR #60 but is **not** the selected source. Its modifications are not promoted into this pinned authority.

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
| D2-11 | P2 | Existing registry unit test expects historical statuses and omits added Review 07 component classes | **Open QA debt**; source test may fail. No production implementation changed just to satisfy stale assertions |
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
- **Incremental next step:** on receiving a new GitHub commit SHA from the Writing Agent, `compare_commits(PR60_SHA, new_SHA)`; inspect touched implementation, contracts and tests; modify **only affected** PRODUCT/DESIGN/contract/HANDOFF paragraphs, capture exact-SHA CI and request Joe approval. Do not rewrite historical audit or retcon local previews as approved.

**Delivery remains:** independent Draft PR into the PR #60 source branch for **doc-only diff review**, not into main until underlying implementation branch provenance is resolved. No merge, tag, deploy or approved/archive state is claimed.
