# Celebration Demo migration

- Repository: `Yuzhwe/big-academy`; application: `apps/writing`.
- Base: `feat/agent-a-elevation-batabs-figma` at `d63a2deafc7195cceffaff8b4c43f0b60dbfd6c9`.
- Feature branch: `feat/writing-celebration-effects-demo`.
- Review URL: `/?demo=celebration-effects&locale=zh` (omit locale for English).
- Run from the repository root: `npm ci`, then `npm run dev`.
- Product authority: [Writing PRODUCT](../PRODUCT.md#celebration-effects--isolated-review-demo-2026-10-20).
- Shared visual authority: [root DESIGN](../../../DESIGN.md). This document records
  migration provenance and engineering evidence, not a competing design system.

## Source and dependency record

Project 2: `bigread-design-system-prototypes`, commit
`d07dc2eeb055951e339c195fb5d6b6a8e9723189`, directory
`src/demos/celebration/particle-presets/` (`ParticlePresetsPage.jsx`, `model.js`).
The source Demo files were read from the local workspace; they are tracked and
unchanged by this migration. Only the selected page's ten tsParticles effects
are migrated. Celebration Kit/Spine and the separate writing-answer combination
are outside this request.

All twelve direct packages are pinned to **4.4.0** in the Writing manifest and root
lockfile: `@tsparticles/engine`, `slim`, `ribbons`, `preset-confetti`,
`preset-confetti-cannon`, `preset-confetti-explosions`, `preset-confetti-falling`,
`preset-confetti-parade`, `preset-party`, `preset-fire`, `preset-firefly`,
`preset-fireworks`. These provide the original rendering engine, slim plugins,
nine official presets and the Ribbons bundle; no replacement animation library.
All direct packages share the same MIT notice, copied verbatim to
`public/licenses/tsparticles-MIT.txt` and included in the built output.

Preserved: preset identities/default choreography, transparent fullscreen canvas,
60 fps limit for the nine presets (Ribbons retains its native runtime limit),
ribbon count **30**, the original five ribbon colors, muted
Fireworks, Cannon drag-release and Firefly hover-trail interactions. Effect colors
are source artwork parameters, not proposed design-system token values.

Adapters: lazy-load the review route and particle runtime; add an instance-owned
controller for Stop, rapid switching, asynchronous cancellation and unmount;
bound reviews to 15 seconds; listen for reduced-motion changes and hidden pages;
route pointer interactions through the window while keeping canvases decorative
and pointer-transparent. Night is a preview backdrop using the existing brand
token for white Firefly particles, not a new product dark theme.
Register Ribbons alongside all presets before the first engine load: v4 locks
plugin registration afterwards, so reviewers may start with any effect.

## Direction contract

THESIS: Inspect the original effects with controls that recede; no mock learning achievement.

OWN-WORLD: Inherit Writing Warm Frame, white canvas, semantic tokens, BAButton,
BAText/BANumber, and approved language-specific font roles.

STORY: Choose, play, compare, stop; accept appearance before Milestone integration.

FIRST VIEWPORT: Title and review status above; wide white preview left, ten native
radio options right; Play and Stop above the stage. Narrow screens stack naturally.

FORM: Direct migration of the user-confirmed preview into the established visual
system; no new identity or concept selection.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

Root DESIGN remains the inherited authority. No new shipping illustration or font
asset is introduced. Review PNGs are browser evidence of this implementation.

## Verification

Engineering verification passed: `npm run check:docs`, `npm run typecheck`,
`npm test` (39 tests in 11 files), the full `npm run build` (design system,
Writing and Storybook), `npm run test:layout` (18 passed in official Playwright
headless Chromium), and `git diff --check`. The added controller tests exercise late async results after
Stop/unmount, rapid switching, reduced-motion changes during load, retry and the
preview time limit. Browser tests run all ten actual runtimes, check painted
pixels, test Cannon/Firefly interaction, Stop/Escape/navigation/reduced motion,
compare local/session storage before and after previews, and capture desktop,
tablet and narrow Chinese layouts. Tests are engineering evidence, not visual
approval or Milestone integration acceptance. The finish reviewer inspected
source and all six evidence PNGs without rerunning tests: **ship — ready for
designer review as an isolated Demo**, with no material findings or required
fixes. This disposition is not visual approval or production Milestone acceptance.

Evidence: `docs/evidence/celebration/` within this Writing app. Dosis/Jost/Noto Sans
SC loading still uses the branch's existing Google Fonts request; no new font is
packaged, and Douyin distribution remains the previously recorded open issue.
Physical touch, Safari and Firefox remain untested; existing large app/Storybook
chunks remain. See root `docs/HANDOFF.md` for the closeout and remaining boundaries.

## Later integration

After designer acceptance and a separate integration task, consume the rendering
lifecycle from a Writing-owned celebration adapter. The course state alone must
continue to determine eligibility. A presentation controller never marks a
Milestone complete or writes a receipt. Do not connect the review route's radio
selection or 15-second preview policy to production achievement rules implicitly.
