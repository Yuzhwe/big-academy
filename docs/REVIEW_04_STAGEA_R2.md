> **HISTORICAL IMPLEMENTATION STAGE — SUPERSEDED on 2026-10-26 by [Review 04 Integrated Library + Writing](./REVIEW_04_INTEGRATED.md).** Its statements that Unit folds, milestones, Solar or Cross Blur remain out of real Writing pages are no longer current. Do not use its Stage A-only URLs, defaults, or pending-integration rules as product authority.

# Big Academy · Review 04 — Stage A R2 delivery (2026-10-26)

**Review type:** latest designer revision of Stage A. **Branch:** `feat/writing-hifi-integration-v1`, PR #52 (Draft). **No Stage B/C integration**, no direct merge to main, no Vercel deployment.

## Direct designer review URLs

Local designer library requires current PR source: from the project checkout run `npm run dev:library` (port 6007). Published static copies will not update until rebuilt.

1. **WordGrid original rounded seam repair:** `http://127.0.0.1:6007/?view=components&component=words&wordScenario=F&wordCount=4&wordTabs=show&wordGroup=g1`. Old Slanted trial is **retired**, no slanted appearance selector; selected first-tab vs unselected first-tab uses pale-peach backing seam 14px, derived from the inactive Tab surface.
2. **Hamburger 28px bun corners:** `http://127.0.0.1:6007/?view=components&component=hamburger`. Top `#E7F6DF` `28/28/10/10px`, Reason `#F3EFE4` all `10px`, Bottom `#E7C48A` `10/10/28/28px`; width `88/100/88%`, centered contents.
3. **Unit four-rounded-corners candidate:** `http://127.0.0.1:6007/?view=components&component=unit`. In library now **rounded by default**, 16px four corners; first line `UNIT 1` Dosis800/20px plus full-pill `9 lessons · 170 mins` Jost600/16px; title Dosis800/24px second line, goals unchanged. Original Staircase still defaults to folded until Stage B.
4. **Milestone new gold PNGs:** `http://127.0.0.1:6007/?view=components&component=milestone&mode=state&state=completed`, versus `...&state=upcoming`. `writing_milestone_1.png` top gold check, `writing_milestone_2.png` bottom seal; optimized web-ready PNG derivatives committed in `apps/writing/src/assets/review04/`. Two layers keep relative movement. Completed has 7s sweep and replay event; Upcoming gray, disabled, no shine. **Current real high-fidelity page is not yet updated**, Stage B remains.
5. **Solar Custom screenshot parameters:** `http://127.0.0.1:6007/?view=components&component=lesson&mode=state&state=current&composition=terrace`.
   - Preset Custom; border `#FFA82E`, glow `#FFA82E`.
   - Ray Intensity `1.80`; Ray Length `1.26`; Ray Count `64`; Bokeh `1.12`; Rim Boost `0.74`; Glow Spread `10px`; Brightness `1.34`.
   - `恢复设计师确认配置` re-applies exactly these settings, A/B/C remain manual alternatives.
   - The original 7s Enter CTA sweep, thick dark brown static fallback, the original card internals and clouds remain unchanged.
6. **LessonTopBar popup**: `http://127.0.0.1:6007/?view=components&component=topbar`. Click ellipsis at narrow widths; popup padding all sides now `24px` while radius remains `40px`, number circles `36px` and hitboxes `44px`, six left-aligned columns. Correct Writing Brown `#B25415` done-number fill retained.

**Frozen accepted or unchanged:** Cross Blur `/?view=components&component=transition` (Stage C still pending), CTA sweep and original Level Reward Flag `/?view=components&component=flag`.

## Exact code/scope boundary

| Component | New Stage A candidate | Real page until Stage B/C |
| --- | --- | --- |
| WordGrid | Original Connected Rounded Tabs, 14px same-peach first-left backing patch | Shared CSS repair applies, but **no new tab geometry or semantics** |
| HamburgerComposition | 28px asymmetrical bun radii | Existing Activity 1 content/layout untouched until Stage B |
| StairUnitCard | `corner='rounded'` in designer library, 4x16px; 20px Unit, full pill inline | `corner='folded'` legacy default, no actual Staircase change |
| UnitMilestone | `previewAppearance='gold-shine'` selects new designer PNG derivatives | `previewAppearance='existing'`, original images, missing gold Stage B defect still open |
| Solar | Custom `#FFA82E` and seven screenshot numbers | Library Current only, not Staircase |
| LessonTopBar | 24px popup padding | **Approved real UI styling change** |
| Cross Blur | Unchanged | Candidate only; no actual navigation replacement |
| Level Flag | Unchanged | Existing flag |

## Technical QA status

Committed code changes, PNG-derived blobs, Storybook review variants, tests and contract/spec notes. Connector-side static verification of source references is possible; tests below **have not yet been run successfully on the updated branch**:

- [ ] `npm run check:docs`
- [ ] `npm run typecheck`
- [ ] `npm test`
- [ ] `npm run build:library`
- [ ] `npm run build`
- [ ] `npm run test:integration`
- [ ] Browser screenshots 1440/1024/834, long EN/ZH labels, keyboard, reduced-motion, Solar WebGL
- [ ] WordGrid rapid first/unselected tab switch (seam no light/white background gap)
- [ ] Unit all corners equal / no fold in library and `UNIT 1` smaller than title
- [ ] New gold PNG parallax/alignment/sweep and gray disabled
- [ ] Popup 24px computed padding and six columns
- [ ] Designer signs off final Stage A R2 visuals

Third-party Solar source rights still not confirmed; no production distribution or Stage C integration is authorized. Optimized PNG assets are lower-resolution derivatives of the exact user-supplied pictures, preserved visually for web-size display; do not describe them as untouched original 1024px files.

**Stage B pending:** Activity 1 left Hamburger+right Not yet/Better; Activity 7 input spacing and WordGrid; normal rounded Unit cards; new gold E-01 Completed milestones; 50px brown speaker.
**Stage C pending:** real Current Solar and Cross Blur integrated into app navigation after explicit approval and tests.
