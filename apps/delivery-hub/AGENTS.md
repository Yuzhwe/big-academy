# Big Academy Delivery Hub — Agent Guide

This folder is the delivery portal, not the product application. Only use `Yuzhwe/big-academy`.

1. Read `README.md`, `HANDOFF.md`, and `sources.json` before edits. Respect the root AGENTS.md when available on your branch.
2. Work on an independent feature branch and PR. Do not push to main, overwrite Grokbot's branch, or treat portal publication as design approval.
3. `sources.json` explicitly selects source branches. The current authoritative design direction is root `DESIGN.md` on `docs/unified-design-and-token-audit`. Product rules live in Writing `PRODUCT.md`.
4. Source documents are immutable inputs for a snapshot. Edit the canonical GitHub source first, then run `npm run sync:github`. Do not hand-edit imported text inside `source-snapshot.json` or generated `dist/data.js`.
5. Component statuses are taken from the primary registry; other branches are labeled references. Engineering completion, candidate appearance and human visual approval remain separate.
6. Portal styles are local review candidates. They are not new approved shared tokens or BA components. The portal uses temporary system font fallbacks.
7. Credentials are supplied only via `GH_TOKEN`/`GITHUB_TOKEN` environment variables. Never embed credentials in any HTML, JS, snapshot, log or committed file.
8. Run `npm run build` and `npm run check`; browser-check the changed interaction and representative desktop/mobile layouts. Update HANDOFF.md with material changes and actual verification limits.
9. A GitHub commit does not redeploy the Sites URL. Follow the hosting instructions and preserve its audience. Do not make private documents public without an explicit audience change request.

## Ownership

- Designer: final UI/UX and visual approval.
- Alex: original Writing learning logic and business rules.
- Agent A: shared system construction.
- Grokbot: Writing engineering and adapters; may maintain this portal through independent PRs.
