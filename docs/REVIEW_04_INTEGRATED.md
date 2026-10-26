# Big Academy · Review 04 — Integrated Library + Writing (2026-10-26)

**Implementation branch:** `feat/writing-hifi-integration-v1`, PR #52 (Draft). **Scope:** design-system/library and live Writing Staircase/Activity integration **together**. No main merge or Vercel deployment. **Status:** implementation committed, browser/TypeScript checks and designer visual approval pending.

This document **supersedes the staged-only constraints in** `REVIEW_04_STAGEA.md` and `REVIEW_04_STAGEA_R2.md`. Those documents are historical records, not competing current UI directions.

## Final rules and live integration

| Component | Final rule | Live Writing integration |
|---|---|---|
| BA-WR-001 LessonTopBar | Short & long titles: ONE line, nowrap + ellipsis, full title available in title attribute; 24px popover inset, 40px popup radius; completed number Writing brown | Shared CSS in real page and library |
| BA-WR-005 StairLessonCard | **Designer frozen**: no interior geometry, text, CTA, number or size redesign | Unchanged actual card; external Solar decorator only on `lesson.courseState==='current'` (visual emphasis of Enterable, not new product state) |
| BA-WR-007 StairUnitCard | ONE version, four 16px corners, no folded/cutout code. UNIT 1 Dosis800 **18px**, text theme brown `#B25415`; inline pill displays **9 lessons · 170 min** example using real session count/time, pill text same brown; main title Dosis800 24px. Paper/border keep existing tokens. | Same `StairUnitCard` component in Library and real Staircase; no `corner` prop |
| BA-WR-004 HamburgerComposition | Top green `#E7F6DF`, 28/28/10/10px, 88%; Reason `#F3EFE4`, 10px, 100%; Bottom `#E7C48A`, 10/10/28/28px, 88%. Every layer has `0 4px 10px rgba(71,44,34,.12)` shadow. Center aligned; uses original HamburgerLayer. | Activity 1 Learn displays left 3-layer burger and right Not yet/Better examples (tablet 740px break to stacked); data passed straight from CourseSession |
| BA-WR-006 UnitMilestone | New user-supplied gold seal + check PNG derivatives in both views. Bottom seal independent low-amplitude 3D, top check stronger independent XY and depth; both rotate with badge. Completed gold + 7s sweep and permitted Confetti replay. Upcoming silver grayscale, 3D visual only, disabled/no shine. Reduced Motion static. | Shared canonical UnitMilestone used on actual E-01 and Library |
| BA-WR-003 WordGrid | **Original rounded tabs**, no Slanted and NO inverted radial-gradient joint or underlay. Bank `.word-grid__panel` ALWAYS has four outward `16px` corners including upper-left, regardless of first active tab. Peach surfaces and word semantics unchanged. | Shared live WordGrid and component playground; P7 writable textarea keeps WordGrid docked below with 24px minimum separation |
| BA-WR-011 LevelRewardFlag | 1 drawing pixel per Canvas vertical column with ±Y displacement ONLY: `offsetY = amplitude * sin((x / flagWidth) * waves * PI + phase)`; `phase = 2PI * elapsedSeconds / period`. Defaults amplitude=4px, waves=6 (3 complete horizontal sinusoids, not 6), period=1.6s. Actual time-based rAF, seam overlap, top/bottom 20px headroom, device pixel ratio, no new perspective/light/shadow. | Shared live Staircase Canvas flag defaults; Library controls adjustable amplitude/waves/period, pause/play, reset defaults+phase 0, local-only FileReader image selection |
| Current Solar | Custom Border+Glow both `#FFA82E` default; 7 shader controls Intensity1.80, Length1.26, Count64, Bokeh1.12, RimBoost0.74, Spread10px, Brightness1.34. CTA 7s sweep unchanged, reduced/no-WebGL deep-brown static outline. | Solar moved to `apps/writing/src/components/writing/`; Designer Library RE-EXPORTS same source; actual Staircase current lesson wrapped externally (inside card frozen) |
| BA-WR-012 Cross Blur | 500ms/12px Staircase↔Lesson, 300ms/6px Activity↔Activity, Reduced Motion immediate. Outgoing DOM snapshot is inert to prevent synchronous course-state transition blank; preserves existing CourseSession ownership. | Shared BAPageTransition on real Writing shell route + Activity content, restored path keyboard focus AFTER visual route settles |
| Speaker | 50×50px fully rounded Writing brown `#B25415` + white speaker SVG; existing BAButton hover/pressed/focus | Actual Activity heading |
| Activity 7 input/WordGrid | Editor still flexes and scrolls internally, WordGrid still docks, 24px visible separation | Actual activity CSS |

### Flag image dependency — NOT finished visually

The user has **not yet provided the requested new flag artwork**. The existing R2.12 SVG is a **temporary reference image**, split into static pole + drawable fabric, while the requested Canvas algorithm is implemented. The component-library FileReader accepts a local `image/*` file and keeps it in client memory; it is never uploaded. Final visual approval and full user-source image parity are **blocked pending the actual image**, but the remaining shared integration is not blocked.

**Credit:** Flutter example author **yarden**, <https://stackoverflow.com/a/78383275>, retrieved **2026-10-26**, supplied license **CC BY-SA 4.0**. Adapted to browser Canvas using original formula (waves times PI). Retain credit and license when distributing an adaptation.

### Solar licensing

The user-supplied `elemental-solar.zip` contains the original shader but no clear LICENSE in its root; adapted Solar implementation remains subject to provenance/rights verification prior to public distribution. No Vercel deploy is performed.

## Preview and required validation

To view **updated** content, pull PR #52 on the actual machine and run the repo's supported commands. Port 6007 can display a **stale built snapshot** if not updated.

- Designer library: `npm run dev:library`, usually `http://127.0.0.1:6007/?view=components&component=unit`; variants also `component=words`, `hamburger`, `milestone`, `lesson&mode=state&state=current`, `transition`, `flag`, `topbar`.
- Live Writing app: `npm run dev:writing` (check terminal for actual port; local server never started in this connector session).
- Technical QA commands: `npm run check:docs`, `npm run typecheck`, `npm test`, `npm run build:library`, `npm run build`, `npm run test:integration` (check available script list and adjust).
- Browser QA: Desktop 1440 and Tablet 1024/834, EN/ZH, long title 1-line overflow, Unit label/metadata brown, 4 exact rounded bank corners for all tabs, hamburger shadow and columns, gold/silver 3D on both layers, 7s sweep, Solar overlay/non-WebGL fallbacks, Cross Blur no blank and focus returned after navigation, updated flag canvas animation and interactive controls, local image replacement and reduced-motion.

**Truth in verification:** GitHub edits and source/static consistency can be read back. Real Node build, TypeScript, Vitest, Playwright, current local Mac page and rendered screenshots **have not been executed or verified** in this session. Do not mark these as passed before doing so. The flag artwork is not a final approved asset. PR remains Draft and is not approved for `main`.
