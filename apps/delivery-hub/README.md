# Big Academy 交付区域

A portable static delivery portal for the private `Yuzhwe/big-academy` repository.

## Two modules

1. **设计总结经验**: unified DESIGN.md, product specifications, design-system decisions, tokens, 13 component contracts, reference prompts and branch history.
2. **需求交付**: Writing scope, implementation milestones, exact-commit source links and runtime records. No claim that all 52 screens are complete.

Search, document reading, original downloads, component inspection, category filters, responsive navigation and GitHub edit links work without a backend. No visitor writes are sent to GitHub.

## Run / build

Requires Node.js 22+.

```sh
cd apps/delivery-hub
npm install
npm run build
npm run check
```

Serve `dist/` with a static HTTP server; the app uses hash routes and works under a subdirectory. `src/` is editable UI source; `dist/` is generated output. `marked` is the only build dependency.

## Refresh GitHub content

Set a read-scoped `GH_TOKEN` or `GITHUB_TOKEN` in the shell environment (never in source), then run:

```sh
npm run sync:github
npm run build
npm run check
```

`sources.json` chooses the primary branch and extra variant paths. The importer reads every Markdown document, token CSS and component registry on the primary branch, excluding this portal to avoid recursive ingestion. Every document carries its branch and exact commit. Review source selection after branch merges; do not silently pick the newest branch as authoritative. The bundled Writing image is actual 1440px branch evidence, tied to the cursor commit in the snapshot.

Grokbot or another agent with repository permission can read and change this folder on its own branch. The portal is not an authorization provider; grant the agent's GitHub identity the needed repository permission separately. Do not share personal tokens in chat.

## Synchronization and publication boundary

The source and current snapshot are committed on `feat/delivery-hub` with a PR targeting `main`. The Site has a separate hosting source repository managed by Sites. This is **snapshot synchronization**, not an installed GitHub → Sites deployment webhook.

The CI workflow `.github/workflows/delivery-hub.yml` builds this folder and provides a static site artifact for PR/push changes. It does not write back to GitHub or deploy a public site. It becomes active through normal repository review and Actions settings.

After approved source changes, refresh the snapshot, build and republish through Sites. In ChatGPT ask: “更新 Big Academy 交付区域，从 GitHub 拉取最新内容并重新发布，保持现有访问权限。” An agent with Sites access should use the existing project ID, open the hosting checkout through the Sites skill, copy the reviewed portal source, build, package and deploy.

Site identity: `appgprj_6ad5ecf6266c819188f7c20228ea1af9`.

Site URL: https://big-academy-delivery.joe2025shenzhen.chatgpt.site

## Sharing

- The initial Site is **private**. Copying a link does not grant access.
- Use the Site's available access controls to grant selected viewers, or explicitly request public access. Public access would expose the imported private repository documents.
- GitHub collaborators can review or modify source through repository permissions and PRs.
- The same `dist/` output can be hosted elsewhere. GitHub Pages or another static host requires host configuration and an explicit access/publication decision; it is not enabled by this PR.

## Current visual status

Portal v0.1 is an implemented review candidate using temporary system fonts. The page's swatches and component miniatures are explanatory representations, not proof of approved component rendering. Canonical roles remain Dosis 800 headings/digits, Jost English body, Douyin Chinese headings, Noto Sans SC Chinese body. Font files are not redistributed by this portal.
