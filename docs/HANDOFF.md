# HANDOFF — Big Academy cross-agent integration

**Date:** 2026-10-19  
**Status:** **P1-A IN PROGRESS** — integration candidate, **not merged to `main`** and no automatic sign-off.

## Canonical roles and sources
- **Repository:** `Yuzhwe/big-academy` (never `RaoJing414`).
- **UI/UX Designer:** final visual and major interaction approval.
- **Alex:** original Writing learning/scoring/skip/progress/eligibility rules.
- **Agent A:** shared design system, tokens, component conventions, documentation authority, tooling and cross-agent integration.
- **Grokbot/other product agents:** Writing application on separate branches.
- **One global `/DESIGN.md`** governs shared design foundations; **`apps/writing/PRODUCT.md` combines Writing shared business rules and feature-specific page requirements/specifications**. There is no `apps/writing/DESIGN.md` and no duplicate standalone E-01 specification.
- **Other shared engineering artifacts:** executable CSS tokens, React Aria-based BA Components, component registry/contracts, Storybook, browser QA.

## Approved architecture (P0)
1. Product accent + subtle tint themes; Writing overarching **A Warm Frame + White Canvas**, page-specific variants require designer review.
2. Tokens **Primitive → Semantic → optional Component**, CSS Variables current executable source; product app selects semantic theme.
3. Heading EN **Dosis ExtraBold 800**; EN long text **Jost**; ZH heading **Douyin**; ZH long text **Noto Sans SC**; all UI digits Dosis ExtraBold 800. Sizes/license/assets/fallback verification still pending.
4. Progressive Big Academy component architecture on React Aria behavior foundation, shared primitives first, product-specific composites locally.
5. Lightweight governance: distinct engineering verified vs designer visual approved.
- **Icon standard:** Iconoir (MIT), general-purpose UI icon family; exact BAIcon mappings are P1 follow-up.

## GitHub source branches and PR ancestry

| PR | Source | Role | Current integration treatment |
| --- | --- | --- | --- |
| #1 | `feat/writing-lesson-topbar` base | first Topbar/system pilot | inherited |
| #2 | `docs/unified-design-and-token-audit` | root DESIGN, P0 and P1 docs | root DESIGN and two audit/planning docs imported/reconciled here |
| #4 | `cursor/writing-e01-lesson-slice-7d6c` | Alex-backed partial E-01 → Lesson 1 | inherited with product logic unchanged |
| #6 | `feat/agent-a-e01-staircase-ab` | diagonal interactive E-01 A/B proof | direct parent; exploratory/unverified |
| #5 | `feat/delivery-hub` | independent delivery portal/site | **not imported into baseline yet**; pinned Writing snapshot is from earlier #4 code |
| #7 | `cursor/writing-hifi-from-agent-a-e01-8539` | new WordGrid/HamburgerLayer P6/partial hi-fi with reported passing tests | **new upstream product candidate; not automatically included**; review runtime changes and registry before integration |

`integration/p1-a-unified-baseline` was branched from #6. Agent A must not modify the original PR branches or touch `main` without reviewed approval. Delivery Hub may be integrated later as an isolated app once its snapshot importer and browser display are checked; site publication does not automatically follow GitHub merges.

## Writing pilot — what works and what is still open
- PR #4 supports a **partial** E-01 → Lesson 1 learn/check → return Continue path, with a real Alex `CourseSession`. Locked lesson access remains guarded, milestone UI receipt separate from progression.
- PR #6 adds review-only **A dimensional cream/card/platform/weak beam** and **B Warm Frame/white-card** visual switch; both target the **diagonal lower-left → upper-right path** with responsive rise and drag/wheel/keyboard navigation. Neither variant is visually approved.
- Source count is nine lessons and 52 activity screens; **the 52 screens are not all built or accepted**. P4–P7 currently include unimplemented templates.
- Alex pending: Level Goal criterion, simultaneous milestones, skip-revocation celebration, P1 Save/Print, Unit clicks, old menu/Index/Analytics location, Task vs Page.
- Designer pending: both E-01 visual treatments, candidate warm surface `#FEF9EF`, radii, milestone artwork, real Chinese font distribution, Topbar sizing/visual, remainder Word Grid/Hamburger/Coach.
- Canonical Skill v0.2 is not yet imported.

## P1-A work status and gates
- **Completed:** repository branches/trees audited, integration branch created; root design specification and P0 documentation reconciled with Writing PRODUCT E-01 compact model; old app-level DESIGN removed; source pointers and cross-agent rules refreshed.
- **Not yet verified:** clean npm install/build, typecheck, Vitest, browser Playwright tests, touch/scroll camera verification, screenshot comparisons and reviewer approval. Do not infer test passage from authored tests.
- **Next:** verify `npm run check:docs`, `npm run typecheck`, `npm test`, `npm run test:layout`; inspect browser A/B at 1440/1024/834/390 and both locales, fix failures. Then review the resulting integration Draft PR and plan a controlled base merge to main.
- **P1-A additional incoming branch:** Draft [PR #7](https://github.com/Yuzhwe/big-academy/pull/7), based on #6, was found during integration. Its author reports passing unit/browser checks and adds WordGrid/HamburgerLayer; these tests were not independently run on **this** integration branch. Review the feature code and registry conflict before merging to the unified baseline. Do not overwrite the product agent's branch.
- **P1-B / P1-C:** semantic Token migration/BAIcon/font follow-up; Delivery Hub latest-source compatibility and safe preview update, separate from P1-A product behavior.
- **Before main:** source-path uniqueness; actual test evidence; no course logic regression; Visual status remains candidate; explicit owner approval for substantive visual/product changes; hub deployment separately verified.

See [P1-A integration readiness](docs/integration/P1-A_READINESS.md) and [P1 implementation plan](docs/design-system/P1_IMPLEMENTATION_PLAN_v0.1.md).
