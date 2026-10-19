# Delivery Hub handoff — 2026-10-19

## Scope

- New portal: **Big Academy 交付区域**. Independent folder `apps/delivery-hub/` and branch `feat/delivery-hub`.
- Two modules: design knowledge / requirement delivery; initial product Writing.
- Current source: `sources.json`, captured in `source-snapshot.json` with exact commit provenance. Root DESIGN.md is primary; product-level legacy DESIGN.md documents are reference-only.
- No product code changed, no existing feature branch overwritten, no approval inferred, no changes to main.

## Features

- Seven routes: overview, knowledge, tokens, components, deliveries, Writing and collaboration.
- Full-text search, document filters and reader, original file download, component contract viewer, source/edit links and share guidance.
- Token values preserve approved/candidate/temporary labels. Registry reports 3 implemented / 10 planned from primary source; cursor branch's extra implementations are separately documented.
- Actual Writing screenshot sourced from `614d4a4f1304930c675f15988e8bb01c5b31ce01`, `apps/writing/docs/evidence/slice/path-1440.png`.

## Synchronization

- GitHub is the editable source; credentials are environment-only.
- `sync:github` imports configured sources. `build` produces `dist/`. `check` verifies provenance, copied content, safe HTML, contracts and assets.
- The Sites URL does not automatically follow GitHub commits. Republish explicitly through Sites. CI produces a build artifact; it is not public hosting.
- Grokbot may work on a new branch with GitHub read/write permissions. No separate Grokbot authorization or automatic communication was created.

## Review

- Portal styling is a review candidate. System-font fallback is explicit.
- The first published site remains private. Sharing settings require a separate explicit audience choice.
- Do not declare the entire Writing curriculum complete based on this portal.

## Verification

`node scripts/build.mjs` and `node scripts/check.mjs` pass: 28 source documents, 13 component contracts, complete source text, commit provenance, safe Markdown links/HTML, local assets and JavaScript syntax.

A non-browser JavaScript smoke check also evaluated all 7 view renderers, all 28 document readers, all 13 component readers, search rendering and document target references without runtime errors. This does not verify real DOM layout or browser interaction.

Browser QA is **unverified**: the managed preview supervisor failed before serving with `bwrap: Can't mount proc on /newroot/proc: Operation not permitted`; `sites-preview status` returned stopped. No browser interaction, screenshot or mobile visual test is claimed. Review the deployed site before visual approval. Final UI/UX approval remains with the designer.
