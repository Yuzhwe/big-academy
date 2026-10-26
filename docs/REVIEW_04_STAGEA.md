# Big Academy · R2 Design Review 04 — Stage A (2026-10-26)

**Implementation status:** committed to PR #52, `feat/writing-hifi-integration-v1`. **Visual approval and runtime/browser testing pending.**

## Delivery boundary

**Stage A ONLY = Designer Library / Storybook.** The sole intentional real-lesson fix is BA-UI-006 LessonTopBar completed-number color. Stage B/C have **not** begun. Current Solar remains outside the production Staircase; Cross Blur is never called by real navigation. New WordGrid, Unit and Milestone looks require explicit props and **live page defaults remain untouched**.

## Designer review entry points

Start the latest branch with `npm run dev:library` and open the local library (usually `http://127.0.0.1:6007/`). The former `:6007` published snapshot does **not** automatically update on GitHub Pull.

- **Slanted WordGrid candidate:** `/?view=components&component=words&wordTabAppearance=slanted&wordCount=4&wordTabs=show`. Switch Opinion/Nouns/Adjectives/Marks. The selected Tab owns its right slope above the adjacent Tab; 2px lift ~200ms and content fade ~150ms. Original `connected` remains the page default.
- **Hamburger Composition:** `/?view=components&component=hamburger`. Top is green `#E7F6DF` and radius 18/18/10/10; Reason `#F3EFE4` radius 8; Bottom `#E7C48A` radius 10/10/18/18. The three widths are 88/100/88%, title/sample vertically centered.
- **Unit transparent cutout:** `/?view=components&component=unit&unitCorner=cutout`. Real 32px upper-right transparent triangular paper cut with diagonal stroke; NO fill, no simulated patch. The production page continues to pass the default `corner=folded` until Stage B visual acceptance.
- **Milestone gold sweep vs gray:** `/?view=components&component=milestone&mode=state&state=completed` and `...&state=upcoming`. Existing two-piece artwork; completed 7s sweep + permitted replay event, upcoming fully grayscale + disabled. These are Stage A opt-in `previewAppearance=gold-shine` states. The high-fidelity page's missing gold visual is a **Stage B task**, not represented as already fixed.
- **Solar Current Lesson:** `/?view=components&component=lesson&mode=state&state=current&composition=terrace`. Border/glow candidate palettes A Writing copper-brown (`#B25415`, `#E89B55`), B dark caramel (`#874319`, `#D79553`), C apricot-orange (`#C26824`, `#F3B46A`), or custom HEX inputs. Shader has `uBaseColor`/`uGlowColor` uniforms so **rays and border are not independent hard-coded colors**. The seven original/extended numeric sliders and Restore Defaults button remain. Existing CTA sweep (one pass/7 seconds) remains unchanged. WebGL disabled / Reduced Motion / poor performance falls back to static 3px dark-brown outline. **Solar license provenance remains unverified**; do not distribute this adapted Shader as a reusable external package.
- **Level reward flag:** `/?view=components&component=flag` — original SVG and 4% wind parameter, unchanged from Stage 1.
- **Cross Blur candidate:** `/?view=components&component=transition`. Change between fake Staircase/Lesson screens and tune duration, max blur and Reduced Motion. Starting recommendations: 500ms/12px for Staircase↔Lesson, 300ms/6px for Activity↔Activity. This is an independent React/CSS implementation of the interaction pattern, not a copy of Great UI's restricted code. **No route/Activity integration before Stage C approval.**

## Only approved real-page code fix

`BATaskProgress.css` uses the primitive `--ba-color-writing-7` (#B25415) on the **done indicator itself**. Both the top rail and the full-index popover render this same Indicator. This corrects the previous leakage from `--ba-color-action-primary` (which resolved to the generic blue-green token outside Writing). `tokens.css` now sets the done semantic alias to Writing-7 too. Keep Skipped, Done+Selected outer ring and Locked visuals unchanged.

## Component and interface rules

- WordGrid: `tabAppearance='connected'|'slanted'` (default `connected`).
- StairUnitCard: `corner='folded'|'cutout'` (default `folded`).
- UnitMilestone: `previewAppearance='existing'|'gold-shine'` (default `existing`).
- HamburgerComposition: uses original `HamburgerLayer` instances; custom green top bun applies only within composition.
- SolarLessonPreview: `SolarParameters` adds `borderColor` and `glowColor`; A/B/C presets and direct color inputs. Only the library owns the wrapper.
- BAPageTransition (`BA-WR-012`): `viewKey`, `renderView`, `duration`, `maxBlur`, `reducedMotion`, `onSettled`; content swap at animation midpoint. Navigation and saved state remain caller-owned.

## Acceptance checklist

- [ ] `npm run check:docs`
- [ ] `npm run typecheck`
- [ ] `npm test`
- [ ] `npm run build:library`
- [ ] `npm run test:integration` (including computed topbar done color on the actual Writing page)
- [ ] Browser compare 1440/1024/834, English/Chinese, mouse, keyboard, touch and reduced motion.
- [ ] Actual WebGL Solar screenshot/performance and halo over cloud.
- [ ] Slanted Tab slope, selected z-order, multi-tab transitions, reduced-motion.
- [ ] Unit cutout reveals real background and preserves card content/dimensions.
- [ ] Gold and grayscale Milestone 2-layer materials, gold-only sweep.
- [ ] Cross Blur midpoint swapping and rapid page changes, no flash/double-submit.
- [ ] Designer visually approves/rejects each candidate before Stage B/C.
- [ ] Third-party Solar use rights verified before any production distribution.

**Truth in QA:** GitHub code was inspected and changed. The contract is parseable JSON and static source checks can be done through connector reads. There is **no verified post-change TypeScript/npm build, Vitest, Playwright run, browser screenshot or actual Mac site restart in this session**. Prior PR check counts are NOT proof of Stage A correctness. No main merge or Vercel deploy.
