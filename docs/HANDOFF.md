# Big Academy — HANDOFF

**Branch:** `feat/writing-hifi-r1-593dee37`
**Baseline main SHA:** `e0a96d867c393e168087a98bbe05277138459262`
**Writing Hi-Fi Review R1 spec SHA:** `947af3306e767dab603de1a78616e93fbaeedac0` (`docs/writing-hifi-review-r1-20261020`, PR #32 docs only)
**Visual status:** implemented for review. Not designer-approved.

## What landed

R1 spec files integrated from the docs branch only: `apps/writing/PRODUCT.md`, `DESIGN.md`, `apps/writing/contracts/components.json`, `packages/design-system/src/tokens.css`.

Writing → L2 → G2-O → Lesson 1 Topic sentences runs from E-01 through Lesson End on the authored Alex curriculum and graders (Engine + Analyzer from `alex-original.html`). Screens:

1. `L2-04.learn` P2
2. `L2-04.t.ts1` P3 single pick
3. `L2-04.t.ts4` P3 tapword (`believe`, `should`)
4. `L2-04.t.ts3` P3 multi pick
5. `L2-04.t.ss.L2-04` P4 guided word build
6. `L2-04.t.ts8` P4 frame fill
7. `L2-04.apply` P5
8. `L2-04.check` P7

The other 44 activity screens stay out of scope. Staircase variant A (separate platforms) is the mounted path. Variant B remains in the geometry module and is not shown.

## Checks actually run

| Check | Result |
| --- | --- |
| `npm run check:docs` | pass |
| `npm run typecheck` | pass |
| `npm test` (Vitest) | 43 passed |
| `npm run build` (design system, writing, Storybook) | pass; Vite chunk-size warning on the writing bundle |
| `npm run test:layout` (Playwright) | 17 passed |

Browser journey covered correct, wrong, retry, build miss, frame fill, Apply pass, P7 blank warning, P7 failed hand-in (not presented as mastery), reload Continue, English and Chinese, keyboard choice B, focus, reduced motion, and viewports 1440, 1024, 834, and 390. Screenshots: `apps/writing/docs/evidence/hifi-r1/`.

A separate 200% browser-zoom pass and a real touch-device pass were not recorded.

## Known limitations

- Hamburger layers use authored `teacher.v2_points` as titles. Those points have no second-line support copy, so none was invented. All three layers use the same title role.
- Locked lesson capsule uses candidate `#929AA2` with white text. That pair is below WCAG AA. Completed capsule uses `--ba-color-success-8` so white text stays readable; the [E] success-6 mapping does not.
- [E] token values are applied for this review and are not approved global defaults.
- Douyin Sans is not bundled. Chinese headings fall back.
- No hosted preview. This environment has no Writing deploy target or preview credentials. Run `npm run dev -w @big-academy/writing`.
- UI/UX Designer owns visual approval. Do not merge on engineering checks alone.
