# Big Academy — Color System v0.2

**Decision:** DESIGN APPROVED by UI/UX Designer, 2026-10-19 (explicit direct approval, testing intentionally skipped).
**Engineering:** NOT VERIFIED. No component/browser/Storybook/assistive-tech acceptance claimed.
**Source of executable values:** `packages/design-system/src/tokens.css` on this branch. The table here is a non-executable review mirror; edit CSS first.
**Benchmark:** [Vercel Geist Colors](https://vercel.com/geist/colors) (role structure only, not Vercel palettes).

## 1. Adopted principles

1. Each palette uses consistent **role-based ten steps**, not an arbitrary lightness ladder.
2. **Primitive → Semantic → optional Component Tokens**. Shared UI consumes usage-based aliases; no hardcoding of Writing identity in reusable components.
3. **Interaction state mappings** are deterministic and named (surface and border default/hover/active; strong fill default/hover; text secondary/primary).
4. Color is not the sole feedback signal: retain accessible status text/icons, focus outlines, and native semantics.
5. Solid neutral is the default for text/dividers. Alpha blends/overlays are contextual and **not** falsely claimed to be covered by these eight solid scales.

## 2. Ten-level role contract

| Level | Responsibility |
|---|---|
| 1 | component surface default |
| 2 | component surface hover |
| 3 | component surface active/pressed |
| 4 | border default |
| 5 | border hover |
| 6 | border active |
| 7 | high-contrast fill default |
| 8 | high-contrast fill hover/pressed |
| 9 | secondary text/icon |
| 10 | primary text/icon |

**Implementation note:** White primary page backgrounds may use Color 1 on hover and Color 2 on active; components must not assume every role is used on every surface. Focus and disabled are independent semantics, not implicit palette indexes. Text/background contrast must be assessed against the actual composited surface when subsequently validated.

## 3. Color families

| Family | Responsibility | Anchor/status |
|---|---|---|
| neutral | cross-product neutral UI | approved ten-level palette |
| warm | restrained Writing warm surface and borders | `warm-1 #FEF9EF` + `warm-4 #C9B8B2` approved |
| brand | shared Big Academy ink and non-product-specific actions | `brand-10 #133547` preserved |
| writing | Writing product identity | `writing-7 #B25415` preserved |
| success | universal correctness/success feedback | former `#14AE5C` retained at level 6; level 7 darkened for stronger fill |
| danger | universal wrong/error feedback | former `#9B4F36` retained at level 7 |
| warning | warning/caution feedback | approved initial palette |
| info | information feedback | approved initial palette |

**Reading brand colors remain unassigned.** Do not use Big Academy brand-blue/info color as a fabricated Reading palette. The historical Endless Board Accent `#1A7F8F`, where used elsewhere, remains use-case restricted; it is not made a global primary here.

## 4. Review palette (non-executable mirror)

| Family | Levels 1–10 |
|---|---|
| neutral | `1 #FAFAFA` · `2 #F5F5F5` · `3 #EEEEEE` · `4 #D4D4D4` · `5 #B8B8B8` · `6 #8D8D8D` · `7 #656565` · `8 #4C4C4C` · `9 #363636` · `10 #242424` |
| warm | `1 #FEF9EF` · `2 #FBF3E5` · `3 #F3E8D9` · `4 #C9B8B2` · `5 #B49C95` · `6 #957B73` · `7 #72574E` · `8 #5D463F` · `9 #4D3731` · `10 #3B2926` |
| brand | `1 #F2F7F9` · `2 #E6F0F5` · `3 #D3E4EC` · `4 #B7D0DC` · `5 #91B5C5` · `6 #5F92A7` · `7 #2C657B` · `8 #225365` · `9 #193E4F` · `10 #133547` |
| writing | `1 #FFF9F2` · `2 #FFF0DF` · `3 #FDE2C2` · `4 #EDC69B` · `5 #D9A66E` · `6 #C3813C` · `7 #B25415` · `8 #944511` · `9 #78380E` · `10 #59290C` |
| success | `1 #F0FBF4` · `2 #E1F8E9` · `3 #C5F0D4` · `4 #98E3B3` · `5 #60CF8B` · `6 #14AE5C` · `7 #147C44` · `8 #0E6637` · `9 #0A502C` · `10 #083A21` |
| danger | `1 #FFF4F1` · `2 #FFE8E2` · `3 #FFD4C9` · `4 #EDB3A5` · `5 #D88973` · `6 #BC654C` · `7 #9B4F36` · `8 #803C2D` · `9 #632E26` · `10 #4E231E` |
| warning | `1 #FFF9E9` · `2 #FFF1CF` · `3 #FFE2A5` · `4 #F3CD80` · `5 #DCAF4E` · `6 #B9852B` · `7 #865A19` · `8 #6F4815` · `9 #563711` · `10 #3E280D` |
| info | `1 #F1F8FD` · `2 #E3F2FA` · `3 #CAE6F5` · `4 #9FCFEC` · `5 #72B1DB` · `6 #468EBF` · `7 #176B9E` · `8 #125682` · `9 #104264` · `10 #0D324D` |

## 5. Semantic roles

- Foundations: `background-primary`, `background-secondary`, `surface-canvas`, `content-primary`, `content-secondary`, `content-muted`, `border-default/hover/active`, `focus`.
- Action: `action-primary`, `action-primary-hover`, `action-primary-active`, `on-action-primary`; theme overridden at app/shell only.
- Feedback: `success/error/warning/info` each with `surface`, `border`, `fill`, `text` roles. Their meanings never inherit Writing or future Reading identity.
- Writing selector: `data-ba-product="writing"`; the shell must set it before BAButton is migrated from legacy aliases.
- Approved `#FFFFFF` writing content canvas remains distinct from warm frame; do not automatically tint the paper.

## 6. Compatibility and intentional limits

- Existing `--ba-brand-dark`, `--ba-writing-accent`, `--ba-paper`, `--ba-surface-warm`, `--ba-border-weight` retain their computed values through CSS aliases.
- Other temporary pilot variables (border, muted, focus, font and hit-size) remain unchanged so this palette adoption does **not** assert that existing components were visually redesigned.
- A design-level approval **does not** constitute engineering verification, component migration, WCAG certification or release approval.
- This explicitly supersedes the earlier [E]/[R] statuses of the adopted warm/success/error/choice-border values in the older audit snapshot. It does **not** approve new Reading colors, dark-mode themes, typography metrics, spacing, elevation or radii.
- Per user's request, no automated tests, Storybook/Playwright, live screenshots or full component browser audit were run as part of this change. Future component integration must report verification status truthfully.
- Never force color-only success/error feedback, remove focus treatments, or merge unchecked code into `main` merely because the palette is design-approved.

## 7. Future implementation handoff

1. Reconcile branch ancestry with Agent A. Existing live BAButton/BATaskProgress may still reference Writing primitive directly.
2. Apply the approved `data-ba-product` mapping at the Writing app shell before consuming action semantic tokens.
3. Replace Writing references in shared components in a separate compatible integration PR.
4. When tests resume, check real contrast pairs, visual regression, states and EN/ZH accessibility. No such pass is claimed in this document.
