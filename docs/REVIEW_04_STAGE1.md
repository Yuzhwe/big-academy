> Historical review record. Current product/design authority is PRODUCT.md and root DESIGN.md; current delivery is docs/REVIEW_05.md.

# Big Academy · Review 04 / Stage 1 · Designer Library Candidate

**Status:** implementation committed to Draft PR #52, **NOT designer approved**. This is a **component-library-only experiment**. Do not integrate Solar or the CTA shine into Writing's Staircase until the UI/UX designer explicitly approves a chosen configuration. No main merge, no Vercel deployment.

## Reproduction in the designer library

From the PR #52 head, install dependencies and run `npm run dev:library`. Open these exact relative URLs on its port (normally 6007):

- `/?view=components&component=lesson&mode=state&state=current&composition=terrace` — Current Lesson / Solar + one-shine-per-7s CTA, with the original cloud platform.
- `/?view=components&component=lesson&mode=state&state=current&composition=card&motion=reduce` — intentional static deep-brown 3px outline and ordinary CTA.
- `/?view=components&component=lesson&mode=state&state=start` — unchanged ordinary Enterable control.
- `/?view=components&component=hamburger` — all three reused Hamburger layers (top/bottom each 88% of Reason width, title and example vertically centered).
- `/?view=components&component=flag` — existing R2.12 LevelRewardFlag SVG, with a wind strength control starting at 0.04 (4%).

Switch to **查看状态 → Current · Solar 强调候选** for the Solar sliders. Sliders preserve the **uploaded Elemental Solar defaults**: Ray Intensity 0.6, Ray Length 0.45, Ray Count 64, Bokeh 0.16, Rim Boost 1.66. Additional designer controls adjust outer glow spread in px and brightness. These settings are captured in the shareable scene query; **they are not product state or saved learner progress**.

## Rendering boundaries and fallback

- `apps/library/src/SolarLessonPreview.tsx` holds an isolated WebGL1 shader of the **Solar aura algorithm**, adapted from the user's supplied `elemental-solar/src/shaders/solarAura.js`. It retains gold/peach corona, 64-angle rays and small bokeh highlights, but masks the shape to the **exterior of the 260px lesson card**. The external Solar 3D face, floor, lighting, page background and texture rendering are excluded.
- The **canonical `apps/writing/src/components/writing/StairLessonCard.tsx/.css` is unmodified**. The Solar canvas is an inert, transparent overlay in the designer library; `pointer-events:none`; the original number seal, heading, duration, layout, concentric corner geometry and 70px BAButton are unchanged.
- Visual stacking: Solar wrapper sits above the `LandscapeTerrace` cloud, clipping is avoided by limited 40px overscan. Its card interior is transparent in shader, so numbers, copy and CTA remain readable.
- Shader: at most one tiny 1x-pixel-ratio canvas per Current preview, 30fps cap, intersection/document visibility GPU-draw pause, >25 very slow frames trigger static fallback. Reduced Motion and WebGL failure both trigger the **3px static dark-brown current outline**, without Solar/CTA animation.
- CTA: in the library-only wrapper, a clipped inert highlight sweeps for ~0.9s during each **7s** cycle. Original BAButton click/focus/hover/pressed and size remain unchanged.
- Source provenance: the user-supplied `elemental-solar.zip` contains a README, source, `dist/` and Three.js dependencies, **but no clear LICENSE file**. Treat the adapted fragment as **private design-review candidate**, not an approved distributable dependency, until origin/right-to-use has been confirmed. No `three` or other new runtime dependency was added.

## Acceptance / remaining QA

- [ ] Run `npm run typecheck`, `npm run build:library`, and `npm test` on the PR branch.
- [ ] Verify WebGL live view and sliders in an actual browser, and intentional Reduced Motion and no-WebGL fallbacks.
- [ ] Confirm visual matching of the card's exact radius/geometry at 1440, 1024 and 834 viewport widths.
- [ ] Confirm the Solar halo is never masked by the cloud base or overlaps neighboring cards.
- [ ] Confirm CTA highlight does not interfere with pointer, keyboard, press/release or focus.
- [ ] Verify Flag preview SVG and 4% wind against original R2.12, and Hamburger whole-composition preview.
- [ ] Resolve shader/code reuse license and decide which parameter values become a reviewed token or reusable effect.
- [ ] Obtain UI/UX designer's explicit visual approval **before page integration**.

**Verification at commit creation:** GitHub code/content API re-read and JSON parsing are possible; external CI/local TypeScript/browser screenshot was **not performed** in this environment. Existing `localhost:6007` may serve a previously published snapshot; pulling commits does not refresh that published copy automatically.
