# Big Academy · GitHub Pages review delivery

This is an **infrastructure-only** workflow. It does not merge draft product PRs into `main` or change approved UI behavior.

## Public, stable URLs

- Writing: https://yuzhwe.github.io/big-academy/writing/
- Component Library: https://yuzhwe.github.io/big-academy/library/
- Release provenance: https://yuzhwe.github.io/big-academy/deployment.json

Both sites come from one immutable PR HEAD commit and one Pages artifact. The metadata file records the exact `source_sha` and `source_pr`.

## First release and approvals

The infrastructure is reviewed independently against `main` (this PR). Its one-time initial deployment may be bootstrapped by an explicitly marked `[pages-bootstrap]` push on the infrastructure branch. **Ordinary pushes to product PRs, the infrastructure branch, or main do not publish.**

The GitHub Pages environment can require default-branch deployment or human approval. If bootstrap is blocked, approve/merge **only this infrastructure PR** (no product changes), then use the manual workflow. Never bypass required environment approval.

## Publish a selected Draft PR after infrastructure PR is merged

Go to **Actions → Big Academy · Publish selected Draft PR to GitHub Pages → Run workflow** from the default branch.

Enter:
- **pr_number**: the open product Draft PR number (e.g. 65)
- **expected_sha**: optional full HEAD SHA (recommended to freeze the version; mismatch fails the run)

Run. The workflow resolves the actual GitHub PR head, checks out that single SHA once for **both** Vite builds, packages the two subdirectories, checks CSS/JS/assets and interaction in Chromium, uploads a Pages artifact, deploys it, then opens the **live** URLs in Chromium and checks their `deployment.json` SHA.

**Publishing replaces the currently visible contents of both stable Pages URLs.** Before pressing Run workflow, confirm Joe is not showing or reviewing the current published version. Approval to publish is a separate, deliberate step from merging or completing a product PR.

## Agent-operated publication via GitHub comments (no terminal / Codespaces)

Once this infrastructure PR #66 has been explicitly approved and merged into `main`, the authorized owner may trigger a deployment **without any product merge or changes to main** by posting a single PR Conversation comment on #66:

```text
/pages-publish pr=65 sha=a83a63597e0fd5b3617e4a2c9cc311a60f1847cc
```

The default-branch GitHub Actions workflow listens for `issue_comment.created` only on issue/PR **#66**, requires actor **Yuzhwe**, and requires the strict command format. The PR number must resolve to an open same-repository PR, and the supplied full SHA must match its live HEAD exactly. A failed guard aborts without publishing.

The connected GitHub agent may post that command **only after Joe expressly requests release or says the current review is complete**. The PR comment is the deliberate publish authorization and audit trail. This does not give the agent permission to merge any PR.

The ordinary Actions **Run workflow** option above remains an alternative. Neither product branch commits nor ordinary comments can replace published pages.

## Build and runtime path compatibility

- Writing uses Vite CLI `--base=/big-academy/writing/`.
- Library uses Vite CLI `--base=/big-academy/library/`.
- Vite's asset pipeline prefixes imports automatically.
- Existing absolute public path literals (`/assets/`, `/path/`, `/licenses/`, Library `/review/`) are rebased **only in compiled output**, not in product source. Library also receives Writing's shared public assets required by shared components.
- The root `/big-academy/` redirects to Writing.
- The GitHub Pages deployment has no server/API and must not publish sensitive source data or credentials.

Do not auto-merge main, deploy Vercel, change Codespaces, or approve component visuals by implication. Pages is publicly accessible, unlike Private Codespaces ports.

## Initial approved candidate

The first deployment is pinned to PR #65, commit `a83a63597e0fd5b3617e4a2c9cc311a60f1847cc`; later product revisions require deliberate manual publication. No existing Codespace will be changed.
