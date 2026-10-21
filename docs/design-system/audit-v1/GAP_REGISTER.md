# Design System Gap Register · 2026-10-20

| ID | Severity | Evidence | Root cause | File(s) | Target Phase |
|---|---|---|---|---|---|
| DS-001 | P0 | Raw React Aria Button used for lesson CTA | Shared library bypass | `apps/writing/src/components/writing/StairLessonCard.tsx` | 2–3 |
| DS-002 | P0 | `activity().supported=false` for unimplemented templates | Product integration stops after pick/tapword | `apps/writing/src/product/courseSession.ts`, `apps/writing/src/course/CourseApp.tsx` | 4 |
| DS-003 | P0 | Only scrolling status rail, no anchored overlay | Contract ahead of UI | `packages/design-system/src/components/ui/BATaskProgress.tsx` | 2–4 |
| DS-004 | P0 | Motion values CSS-only | No runtime adapter | `packages/design-system/src/tokens.css` | 2–3 |
| DS-005 | P0 | `.github/workflows` absent | Quality gates not wired | `.github/workflows`, `scripts/` | 3 |
| DS-006 | P1 | 8 registry entries do not have source | Specification not implementation | Shared and Writing component folders | 2 |
| DS-007 | P1 | `useState('B')` | Historical A/B prototype retained | `apps/writing/src/course/CourseApp.tsx` | 2–4 |
| DS-008 | P1 | Previous 1st screen exits, footer flex | Old navigation/layout | `courseSession.ts`, `LessonWorkspace.css` | 2–4 |
| DS-009 | P1 | Same neutral P2 panels | Missing semantic contrast | `apps/writing/src/course/course.css` | 2 |

**Status:** This is an evidenced repository baseline, not a claim that any fix or browser test has passed. Change status only with concrete commit and test links.
