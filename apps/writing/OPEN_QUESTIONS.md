# Open Questions — R6 (2026-10-20)

This R6 register supersedes prior open-question wording; accepted decisions live in `PRODUCT.md` and root `DESIGN.md`.

## Resolved for current Writing pilot

- **Multiple newly eligible Milestones:** visually auto-celebrate only the highest-progress flag upon first eligible E-01 return; mark other eligible milestones' automatic celebration opportunities as handled. This never changes their learning completion.
- **Level Goal:** preserve current Alex implementation; no new completion formula.
- **P1 Save/Print:** remove the user-facing controls; preserve autosave and underlying content.
- **Unit cards:** informational Stub, no whole-card action or destination.
- **Old menu / Index / Analytics:** do not restore old user-facing menu or these features elsewhere. Preserve shared state/records used by other components.
- **Task versus Page:** UI LessonTopBar measures Activity Screen progress; source task/page/screen types and `Pages.canOpen` remain unchanged.
- **Cross-Level Milestone auto-location:** out of scope of current G2-O E-01; do not change Level selection to celebrate.
- **Staircase shape:** A independent platforms only; no active A/B decision.
- **Practice retries:** preserve Alex per-task `shown` and exceptions, no global unlimited-retry replacement.
- **Lesson celebration Ribbons:** 30, based on accepted original preview.

## Not authorized for business logic changes

- Skip revocation and subsequent Milestone requalification: **leave existing behavior unchanged**.
- P1–P7 tasks: keep original Check, Next, Hand in and Try a new set behavior. The extracted `docs/ACTIVITY_MATRIX_G2O_v0.1.json` is structural inventory and still requires detailed runtime/action verification.
- Level Goal formula: no reimplementation or new scoring assumption.

## Design/engineering still to validate

- Storybook and browser fidelity for 50px option layout, focus, multiline, Coach and feedback states.
- E-01 height-adaptive diagonal gesture and platform anchors on desktop/tablet/mobile.
- Dusk/background beams, three-card visual separation, and completed flag visual art.
- Temporary Typography metrics and Chinese font distribution/licensing.
- Ten effects shared packaging and real lesson/milestone adapter integration; reduced motion/physical touch/Safari/Firefox.
- Auto-location interrupted by a manual pan or hidden tab: do not consume newly eligible celebration receipts on a failed presentation attempt without confirming existing persistence semantics.
