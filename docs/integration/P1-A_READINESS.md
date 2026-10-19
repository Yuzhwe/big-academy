# P1-A · Unified Baseline Integration Readiness

**Updated:** 2026-10-19  
**Owner:** Agent A · Big Academy System Builder  
**Status:** In progress — branch `integration/p1-a-unified-baseline` is an **unapproved integration candidate**, not the official `main` source of truth.

## Objective
Give Grokbot and other agents a **single tested GitHub entry point** that contains current Writing runtime and canonical design/product specifications. Preserve original approved behavior, reviewer authority and project portability. Do **not** merge work merely because branches are mergeable in GitHub.

## Inputs and strict precedence
- `feat/writing-lesson-topbar`: Topbar and early shared-components pilot.
- PR #4 `cursor/writing-e01-lesson-slice-7d6c`: Alex-backed E-01 → G2-O partial lesson runtime.
- PR #6 `feat/agent-a-e01-staircase-ab`: A/B diagonal visual prototype. **Both proposals remain unapproved.**
- PR #2 `docs/unified-design-and-token-audit`: P0 approved decisions, root `DESIGN.md`, gap audit, P1 plan, Iconoir. Keep any later Writing PRODUCT.md work from #6 rather than replacing it with a stale historical draft.
- PR #5 `feat/delivery-hub`: isolated portal app, built on `main` with pinned early #4 source blobs. **Do not treat as auto-updated when app code changes.** Validate provenance, rebuild and publish separately.
- PR #7 `cursor/writing-hifi-from-agent-a-e01-8539`: independently authored product follow-up based on PR #6, adding WordGrid/HamburgerLayer and P6 plan-layer functionality; arrived while P1-A was underway. The branch reports successful tests but is **not yet imported** into this integration candidate. Evaluate registry/PRODUCT overlaps and runtime evidence before integration.

## Merge conflict / source-of-truth resolutions

| Finding | Integration resolution | Verification |
| --- | --- | --- |
| Duplicate `apps/writing/DESIGN.md` + proposed root `DESIGN.md` | Retain only `/DESIGN.md`; update README and AGENTS. | `npm run check:docs` |
| `apps/writing/PRODUCT.md` conflicts with older doc branch | Preserve #6's latest combined E-01 requirements + page specification; retain Alex business authority. | Verify E-01 heading and Alex source unchanged |
| Historical AGENTS branch/integration instructions | Replace with role- and branch-current `AGENTS.md`; link HANDOFF. | Check live pointers |
| Historical dusk staircase vs approved Writing A Warm Frame | Dusk variant A is *review-only*; Warm Frame B candidate shares the same diagonal UX. No visual approval implied. | Browser A/B screenshot + designer review |
| Old PR #2 HANDOFF lacks #4/#6 work | Unify handoff with latest implementation and P0 decisions. | Review PR diff |
| #5 portal vendor/snapshot source pinned to #4 | Leave portal separate while updating the hub's snapshot importer against reviewed integration source. | Portal check + browser smoke + publish review |
| Incoming #7 modifies Writing component registry and hi-fi product code | Avoid blind overwrite; review changed contracts and product scope; integrate in a separate, tested commit after P1-A baseline. | PR diff review + re-run QA |
| Icon library selection made after initial docs | Root `DESIGN.md` and `AGENTS.md` use Iconoir, preserving MIT notice rules; no unauthorized glyph migration. | Source inspection |

## Estimated effort (not an autonomous background schedule)

| Phase | Expected active engineering time | Exit evidence |
| --- | --- | --- |
| Inventory/ancestry audit | 20–30 min | Source/branch conflict matrix |
| Integrate P0 docs and Writing code without overwrite | 45–75 min | Independent integration branch and Draft PR |
| Verify build/types/unit and browser e2e | 45–90 min | Command logs, regressions/fixes or explicit blockers |
| Delivery Hub compatibility audit | 30–60 min | Pinned source refresh path, integration recommendation |
| Owner PR review and merge decision | 20–30 min, depending on availability | Explicit approval, reviewed merge or documented pending |

Estimate is **2.5–5 active hours** under a working Node/browser environment. Time does not imply asynchronous work or automatic continued execution. Real merge date depends on QA and reviewers.

## Merge gates
1. One global `DESIGN.md`, no `apps/<product>/DESIGN.md`. Writing `PRODUCT.md` contains its feature/page specifications.
2. Course learning access, scoring, progress and milestone requirements remain source-backed. Alex original HTML unmodified.
3. P0 decisions and Iconoir requirement present and unambiguous; temporary palette/visual A/B remain explicitly exploratory.
4. Typecheck/build, Vitest and Playwright/browser checks pass or report named blockers without claiming approval.
5. Both variants shown in actual browser screenshots for reviewer at 1440×900, 1024×768, 834×1112 and 390-wide mobile smoke. EN/ZH and reduced-motion checks.
6. Contract IDs, Storybook and cross-product shared-token boundaries checked; no unrelated PR overwritten.
7. Designer approves relevant major UX/visual changes; Alex reviews any product behavior changes. Existing PRs remain Draft until their own gates pass.
8. Only after the checks above should an owner authorize a controlled PR merge to `main`. Publishing the private site is a separate deployment decision.

## Current evidence
- GitHub trees and PR metadata were audited through the GitHub integration on 2026-10-19.
- Integration candidate assembled from the #6 branch, with #2 global design documents (and no stale replacement of Writing's product code/specs).
- **No local/browser test result is claimed by this documentation alone.**
