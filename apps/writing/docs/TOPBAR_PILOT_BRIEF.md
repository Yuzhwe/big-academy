# BA-WR-001 · LessonTopBar — design pilot

**Designer-approved:** No hamburger; left Back + Lesson title + necessary labels; task numbers and completion states form a group whose horizontal center is the center of the whole Top Bar. Only A · Warm Frame + White Canvas. This is NOT an approval of exact dimensions.

## Planned responsibilities
- `BA-UI-001` BAButton: keyboard/press/focus; React Aria Button internally.
- `BA-UI-006` BATaskProgress: task statuses and task navigation events; does not calculate entitlement.
- `BA-WR-001` LessonTopBar: geometry and identity/progress composition; left variable width must not displace middle.

## Wire layout
`[← Lesson n / name / necessary tags] | [Task progress & state; exact viewport center] | [invisible symmetric space]`

## Design candidates (not yet approved)
- Height ~80px desktop, ~76px tablet; A warm surface `#FEF9EF`, subtle 0.5px border, white Task circles; title #133547 and active color #B25415.
- Task buttons size 35–38px visually with min 44px interaction footprint when feasible; 0.5px ordinary border, focus ring 2px. Center group has independently scrollable task rail for long lessons.
- For small widths, title truncates first; essential metadata can disappear visually but stays accessible in full via accessible label/title. Never replace progress with arbitrary count.
- EN/ZH both displayed monolingually; task status not only color: symbol/aria-label/number.

## Mock-only interaction
`src/App.tsx` uses simulated task arrays and canOpen values, **not Alex data**; export/production adapter must map from canonical `Pages`/`Skip` state. `topbar-preview.html` is a browser-renderable *design exploration* for local review only.

## QA matrix
- Viewports 1440×900, 1024×768, 834×1112, smoke 390×844.
- Locales EN/ZH; long title at 834; 3/8 normal and 5/18 many tasks.
- States done/current/available/locked/skipped; skip distinct from completed.
- Keyboard Tab + Enter/Space; focus ring visible; disabled blocks; current task announced.
- Progress rail scroll, touch-friendly hit regions, reduced motion.
- Return Back works (callback). No new menu introduced.

## Design review questions for UI Designer
1. Is the centered progress group visually dominant enough without competing with Lesson title?
2. Should the progress use numeric chips or progress segments? Keep this as a purely visual variant; do not change gating semantics.
3. What necessary label(s) beside Lesson title are actually useful, versus decorative clutter?

**Gate:** no component is `validated` until package installation, React runtime/browser checks, source-backed status integration and explicit designer visual acceptance.