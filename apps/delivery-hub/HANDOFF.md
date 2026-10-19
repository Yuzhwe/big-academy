# Delivery Hub handoff — 2026-10-19, v0.2

## Scope and ownership

- Site: **Big Academy 交付区域**; GitHub folder `apps/delivery-hub/`, independent branch `feat/delivery-hub`, draft PR #5. No main update or merge.
- Two modules: design knowledge / requirement delivery. Initial product: Writing.
- Root DESIGN.md is authoritative. Primary document snapshot: `docs/unified-design-and-token-audit` at `71659b2377be5303ce33095fa3bbe7611c2842d5`. Legacy product DESIGN documents remain branch references.
- Prototype import: `cursor/writing-e01-lesson-slice-7d6c` at `614d4a4f1304930c675f15988e8bb01c5b31ce01`. All 27 files preserve original blob hashes in `vendor/writing/manifest.json`. No upstream product code was changed.

## Changes requested by the designer

- Eleven portal views: overview, system overview, knowledge, tokens, icons, typography, layout, components, deliveries, Writing and collaboration.
- Complete current system inventory: 13 executable tokens, 12 recorded color roles, 1,671 searchable Iconoir icons, five font roles, layout/spacing/shape/motion/accessibility rules. Undefined scales remain labeled undefined.
- All 13 registered components have working interactive demonstrations. Six reuse exact imported components; seven are local React Aria contract demonstrations. Planned registry statuses are not changed.
- Interactive color contrast, SVG size/stroke preview, editable typography specimens, density/radius/motion experiments, component state controls and event logs.
- Three Writing links open separate pages: actual CourseApp, actual Top Bar fixture harness, and exact Alex original HTML. Development progress uses the `ba-hub-writing-v2:` local storage namespace and has a reset dialog.
- Dosis 800, Jost 400/500/600 and Noto Sans SC 400 are self-hosted with OFL notices. Douyin is absent and explicitly falls back. All catalog and portal icons use Iconoir; its MIT notice is included.
- Writing remains partial: E-01 → Lesson 1, P4–P7 placeholders. Do not describe all 52 screens as complete.

## Synchronization and publication

- `sources.json` selects the document and prototype branches. `sync:github` refreshes snapshots, runtime source and manifest. Never patch imported text or source in place.
- The Site hosting repository is separate. A GitHub commit does not redeploy the Site. Refresh, build, check and explicitly publish through Sites while preserving access.
- GitHub Actions uses `npm ci`, build, provenance/asset checks and DOM interaction tests, then uploads a static artifact. It does not make the site public.
- Grokbot can maintain source through independent PRs with its own GitHub permissions. No credential, new grant or automatic communication was created.

## Verification

Run `npm run build`, `npm run check` and `npm run test:experiences`.

Checks cover 28 complete source documents, 13 component contracts, commit provenance, all 27 imported Git blob hashes, safe Markdown, complete Iconoir SVG catalog, local font assets/licenses, original HTML byte equality and executable outputs.

DOM simulation covers all 13 demos: button callbacks/busy state, tabs and disabling, choice feedback, input/readonly, dialog opening/closing, task navigation, status changes, workspace steps, caret insertion and locked word chips, hamburger input, locked course cards and milestone celebration. Portal checks cover catalog filters, contrast, font fallback, embedded components and new-tab prototype links. Writing integration checks locked lesson gates, opening Lesson 1, a primary action, isolated progress and reset cancellation.

Browser QA is **unverified**. The managed preview supervisor failed before serving with `bwrap: Can't mount proc on /newroot/proc: Operation not permitted`; status is stopped. DOM simulation uses browser API stubs and does not establish visual layout, iframe behavior, font rendering, actual focus/scroll geometry, or desktop/mobile screenshots. Final UI/UX approval remains with the designer.
