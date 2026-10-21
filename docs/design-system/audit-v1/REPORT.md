# Phase 1 · Design System Audit v1

**Date:** 2026-10-20 · **Baseline main:** `e0a96d867c393e168087a98bbe05277138459262` · **R1:** `947af3306e767dab603de1a78616e93fbaeedac0` · **R2:** `6bf27bad0996e77769b8ba6773307e7560c48128`.

## Method & scope

Compared all 19 R2-registered Component IDs to the base commit repository tree, shared public exports and actual Writing composition. The audit distinguishes a checked-in story/test file from a *run* test. CSS and PRODUCT/DESIGN/Token references are inspected as engineering evidence, not visual approval.

## Maturity (baseline)

- **Specified only:** 8 components; implementation source absent.
- **Implemented, not yet functionally verified under R2:** 11 components.
- **Functionally verified under R2:** 0 established by this repository-only audit.
- **Visually reviewed / approved under R2:** 0 established; designer sign-off not asserted.

See `COMPONENT_MATURITY.json` for every Component ID, path, story and test-file presence. Presence is not equivalence to runnable product consumption.

## Foundations

| Foundation | Specification | Executable / runtime evidence | Priority |
|---|---|---|---|
| Primitive and semantic Color | DESIGN.md + tokens.css | CSS values present; candidate and temporary aliases remain; no complete automated consumption audit | P1 |
| Typography and locale | DESIGN.md | Font-family tokens present; asset/license/EN-ZH rendering unverified | P1 |
| Spacing and Radius | DESIGN.md | CSS candidate scales present, but component-local hardcodes persist | P1 |
| Elevation | DESIGN.md | Semantic elevation tokens present; old component-local border/shadow values remain | P2 |
| Motion | DESIGN.md | Six spring families in CSS but no actual runtime adapter on baseline; BAButton CSS hover/pressed works separately | P0 |
| Icons | Iconoir is selected in DESIGN.md | BAIcon exists; source glyph parity/license must be verified | P1 |
| Responsive/accessibility | DESIGN.md + PRODUCT.md | Existing component tests and browser specs, but no baseline R2 run | P0 |

## Critical chain breaks

- **DS-001 P0:** `StairLessonCard.tsx` imports raw React Aria Button instead of BAButton; local CTA styling duplicates design system and does not enforce disabled eligibility.
- **DS-002 P0:** `CourseSession.activity()` explicitly returns unsupported templates on the current eight-screen path; P4/P5/P7 and authored gating are not yet a complete frontend integration.
- **DS-003 P0:** `BATaskProgress` is a legacy scroll rail and not the shared circular `ActivityScreenIndicator` + anchored nonmodal overflow popover required in R2.
- **DS-004 P0:** runtime spring motion adapter absent although motion tokens exist.
- **DS-005 P0:** no `.github/workflows` entry at baseline; no enforceable CI component/token/motion gates.
- **DS-006 P1:** `BAChoice`, `BAField`, `BAOverlay`, `BAStatus`, `WordGrid`, `HamburgerLayer`, `StairUnitCard`, `StairLevelIntroCard` are registered but source files absent.
- **DS-007 P1:** CourseApp initially picks historical Staircase variant B instead of approved A. Review-only A/B controls currently remain in learner page.
- **DS-008 P1:** Footer was flex/intrinsic-size and first-screen Previous routes back to path; R2 requires full-width 1:2 grid and disabled Previous.
- **DS-009 P1:** P2 Better and Not yet example panels lack distinct semantic emphasis.

## Governance

[A] approved values are retained; [E] candidates may be implemented reversibly but stay pending designer review. Product-owned graders, authored answers, and receipt logic are not modified for styling convenience. Follow-up checks require real runtime and browser evidence, not code inspection alone.
