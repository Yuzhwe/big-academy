# BA-DS-INTERACTION-001 · Interaction Feedback & Nested Ownership v0.1

**Approval:** UI/UX Designer, 2026-10-20. **Authority:** root `DESIGN.md` §3–4 and Figma Button V2 node 30:2. **Engineering state:** BAButton already has isolated visual scaling; a full nested-card audit has NOT been completed. Other component motion targets remain candidates.

## 1. Targets vs transitions

- **Target** = scale, opacity, color, selected highlight and focus outcome at a named state.
- **Transition** = Spring or CSS easing/duration to reach the target. The exact Open Claude UI Spring numbers are stored in CSS but do not yet power a runtime adapter.
- **Precedence** = disabled/pending suppress transient feedback; pressed overrides hovered; hovered overrides default. Focus, selected and validation are independent persistent semantics.
- **Geometry** = scale a visual layer about its own center, not its interactive hit box; layout space and neighboring placement must not shift.

## 2. BAButton Figma state targets [A]

| State | Scale | Opacity | Notes |
|---|---:|---:|---|
| Default | 1.00 | 1.00 | Assembly at rest |
| Hover | **1.02** | 1.00 | Only eligible pointer hover |
| Pressing | **0.95** | **1.00** | Replaces hover, does not multiply by hover scale |
| Disabled/Pending | 1.00 | component-defined | No transient hover or press |
| Focus-visible | no additive scale | no forced fade | Always retain visible focus |

Token aliases: `--ba-feedback-button-default-scale`, `--ba-feedback-button-hover-scale`, `--ba-feedback-button-press-scale`, `--ba-feedback-button-press-opacity`. The proposed universal **Pressing 1.03 + 50% opacity** is rejected as a default. Never install a global `:hover` scale rule for all clickable DOM nodes.

## 3. Nested interactive ownership [A]

**One user action has one primary action owner and one transient visual feedback owner.** Example: a clickable LessonCard contains a Start action.

| Region or event | Owner | Forbidden outcome |
|---|---|---|
| Pointer/touch on Start button | Child Start | Parent card also presses, scales or navigates |
| Pointer/touch on card's independent area | Card | Child Start is falsely pressed |
| Keyboard on focused child | Child Start | Parent handles same activation |
| Keyboard on focused card action | Card | Child action runs |
| Child disabled, parent locked | Neither ineligible action | Click-through accidentally unlocks/navigates |

**DOM structure first:** never place a real button inside another button, or a focusable link wrapping independently focusable descendants. Prefer independent sibling activation zones or a carefully scoped stretched-link pattern with nonoverlapping pointer regions, preserved focus order and accessible names.

**Visual-state isolation:** suppress ancestor hover/pressed styling while child interaction owns the pointer. `stopPropagation()` only affects event propagation, not ancestor CSS `:hover` styling or HTML validity. Resolve using independent DOM interaction zones where possible; if required, explicitly track active owner and/or validated scoped CSS `:has()` behavior. Do not install blanket event interception.

**Cancellation and restart:** release pressing on pointerup, pointercancel, pointer movement outside the owner under the chosen React Aria abstraction, lostpointercapture, unmount, disable or gesture cancellation; restore Hover only when still hovered. Prevent stale feedback during scroll, touch interruption or nested action switch. A field can remain focused without remaining pressed.

**Accessibility:** React Aria/native semantics for pointer, keyboard, touch and assistive-technology activation; no duplicate live action or simultaneous accessible control. Keep focus-visible, disabled semantics, status messaging, hit sizes and reduced-motion equivalent state feedback.

## 4. Component exceptions and boundaries

- **BAButton:** Figma confirmed Full/Pill by default, square icon-only Circle, hover 1.02, press .95, opacity 1; named Standard radius variant remains supported.
- **BATabs** and **BASegmentedControl:** shared visual selection surface but different Tabs-vs-RadioGroup semantics. Their selected state may not fade or scale with a parent click.
- **BAField/Textarea:** focus is not pressing, no persistent scaling during typing; preserve caret, label and errors.
- **Interactive cards:** Large Radius is preferred; numeric size and hover/press targets await component-level designer review, never inherited by universal selector.
- **Writing:** unlock, scoring, skip and lesson navigation come from PRODUCT.md/Alex state, not visual feedback or animation completion.

## 5. QA checklist for component PRs

- [ ] Contract identifies one action owner, one visual feedback owner, semantic DOM shape, and justified exceptions.
- [ ] Valid focusable DOM; keyboard Enter/Space, Tab order, accessible labels and visible focus.
- [ ] Default → Hover → Press → Release/Cancel returns to the right state with no layout movement.
- [ ] Child click, touch and keyboard activate child **once**, without ancestor action/transform.
- [ ] Parent own-region activation still works; no child accidental activation.
- [ ] Test pointer cancellation, hover transition, disabled/pending, lost capture and touch scrolling.
- [ ] Test reduced motion, 200% zoom, responsive EN/ZH labels, selection and error feedback.
- [ ] No product permissions changed; no visual approval inferred from test pass.

## 6. Implementation and status

Canonical numerical values live only in `packages/design-system/src/tokens.css`. This document is normative for behavior, not another executable token table. The current PR adjusts only BAButton token references while preserving computed behavior; existing interactive cards must be audited/refactored separately and cannot be marked done based on this documentation.
