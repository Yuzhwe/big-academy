# BA-DS-MOTION-001 · Motion System v0.1 — Interim Presets

**Decision date:** 2026-10-19
**Approved [A/T]:** Temporarily reuse the complete spring parameter sets recorded in the Open Claude UI source file, without a bespoke motion research phase.
**Not approved:** Permanent motion personality, final per-component choreography, production performance/visual/accessibility signoff.
**Implementation state:** numerical CSS custom properties are available but **not connected to React animation code**. No new dependency is installed.
**Benchmark & provenance:** [Caho1/open-claude-ui — ClaudeMotionPresets.ts](https://github.com/Caho1/open-claude-ui/blob/main/code-examples/ClaudeMotionPresets.ts) (third-party reverse-engineering, MIT; **not official Anthropic documentation**).
**Priority in conflicts:** The actual source `ClaudeMotionPresets.ts` has precedence over that repository's `AGENTS.md`, which contains conflicting numbers. Never blend values across sources.

## 1. Exact spring parameter snapshot [A/T]

**All six spring parameter groups in the inspected source file** (four named presets and two inline spring transitions):

| Open Claude source ID | Stiffness | Damping | Mass | Open Claude source context | Big Academy initial candidate usage |
|---|---:|---:|---:|---|---|
| `SPRING_BOUNCY` | 600 | 30 | 1.0 | Button press, toggle, small controls | Button tactile feedback, on-state toggles |
| `SPRING_SNAPPY` | 320 | 28 | 1.0 | Message entry, card/popover reveal | Popover, expandable supporting panels |
| `SPRING_GENTLE` | 380 | 18 | 1.0 | Like, copy-confirmation, micro-feedback | Achievement micro-pop (not extended celebration) |
| `SPRING_HEAVY_SNAP` | 1200 | 80 | 0.1 | Drag snap, split pane/panel | Drag release or step snapping |
| `motionUserBubbleEnter` inline spring | 450 | 24 | **unspecified** | User message bubble entry | Optional small notification/chip entry |
| `motionModalDialog` inline spring | 400 | 32 | **unspecified** | Modal dialog entry | Modal opening |

**Source fidelity:** The inline transitions do NOT explicitly set `mass`. Do not invent a fixed 1.0 in the canonical parameter contract. The eventual runtime should preserve omission and document its version-dependent default behavior. The names `BOUNCY`, `SNAPPY`, `GENTLE` are literal upstream names; the original code's numeric behavior may differ from the everyday meaning of those adjectives. Do not swap names or parameter values to align with intuition.

**Out of scope:** CSS Bézier constants and non-spring exit/fade/blur durations in the same upstream file are *not* spring parameters and are not copied as a "spring standard". Existing simple CSS transitions may remain until actual component integration.

## 2. Source-of-truth contract

- All six numerical groups are defined as **CSS numeric custom properties** in `packages/design-system/src/tokens.css`, preserving the P0 architecture: CSS Variables are the only executable design-token value source.
- The table in this document is a human-readable snapshot of the upstream numerical values, not an independent set of maintained constants.
- Motion library usage must be implemented via one adapter that reads the numeric CSS variables from the **active document/shell** and converts the resulting values into a spring configuration; do not hand-copy parameters into every component or a competing TS constant table.
- No motion-library dependency is mandated by this approval. For Framer Motion/Motion integration, read the resolved custom properties at application runtime and handle a missing/invalid value safely; document shell/theme scope and non-browser render behavior before using a runtime adapter.
- No runtime adapter or component animation is shipped in this PR. CSS values alone are **not proof an animation has been implemented**.

## 3. Purpose-first motion selection rules

1. **Feedback is subordinate to content:** one transition per meaningful state change; no continuously moving ornaments near reading/writing content.
2. **Button/Control:** use `bouncy` as the upstream temporary physical baseline where a spring animation is actually justified; do not delay navigation or add repeated press bounce.
3. **Popover/Expandable Coach:** use `snappy`; animate entry/exit without blocking reading or changing focus behavior.
4. **Achievement:** use `gentle` only for brief explicit achievement feedback. Its upstream name is misleading; avoid accidental aggressive bouncing in learning contexts.
5. **Drag or resizable panel:** use `heavy-snap` for snap-to-rest, keeping direct pointer movement 1:1 with input; don't spring during direct dragging.
6. **Bubble / Modal:** use the two inline source groups if reproducing those two distinct entry patterns. For K–12, bubbles and modal interactions are candidate patterns only.
7. **Never tie product progress, score, completion, or navigation eligibility to motion completion.** All business rules still come from `PRODUCT.md` and Alex.
8. **Avoid animating layout size repeatedly during typing**, writing, scrolling and IME composition. Prefer stable layout and an animation on an isolated surface when suitable.

## 4. Accessibility and safety requirements

- Honor `prefers-reduced-motion: reduce`: remove nonessential scale, bounce, travel and prolonged animation; show the state change without animation while maintaining focus, content, skip/locked feedback and action availability.
- Avoid unrequested looping movement around instructional text; achievements must not use flashing/strobing patterns.
- Preserve focus restore, escape dismissal, and scroll position even when animation is disabled or interrupted.
- Do not hide controls/feedback solely inside an animation or rely on animation completion for required accessibility semantics.
- Keep pointer events/keyboard use available; animation may not capture keyboard focus or block navigation.

## 5. Component contract mapping [initial guidance, not final choreography]

| Component/pattern | Candidate group | Status |
|---|---|---|
| BAButton hover/press | bouncy only if spring needed | [E] |
| BATabs active pill | bouncy or snappy after render review | [E] |
| BAOverlay popover / Coach reveal | snappy | [E] |
| BAOverlay dialog | modal-inline | [E] |
| Lesson completion feedback / UnitMilestone | gentle for short confirmation | [E] |
| Staircase camera or panel drag release | heavy-snap only for snapping, not free movement | [E] |
| User/message-like bubble entry | bubble-inline | [E] |

No existing component contract, product flow or temporary CSS transition is changed by this mapping.

## 6. Verification postponed, not claimed

User asked to copy the source springs for speed. The parameter adoption does **not** imply tested visual quality, no regressions or accessibility acceptance. When any component begins consuming spring presets, the engineering implementer is still responsible for relevant behavior, focus, reduced-motion and browser checks and designer review according to P0 governance.

## 7. Reference/license

Only numerical configuration data and brief semantics have been transcribed, **not the original TypeScript module or proprietary application binaries**. The Open Claude UI repository is separately MIT licensed; preserve its author attribution if actual upstream source code is imported later. Do not describe it as an Anthropic-approved motion system.


## 8. DESIGN.md v0.5 addendum: targets distinct from transitions [A, 2026-10-20]

**Interaction Target** names the desired scale/opacity/color/indicator placement; **Motion Transition** describes how to move to it with Spring or CSS timing. The Spring table above remains numerically unchanged and is **not** a runtime adapter.

**BAButton Figma V2 targets [A]:** default scale 1 / opacity 1; hover scale **1.02** / opacity 1; pressing scale **0.95** / opacity **1**. Pressing wins over hover; disabled/pending suppress both. The rejected global pressing proposal **1.03 and 50% opacity** is NOT adopted. Visual assembly scales around its center; the hit target and layout occupancy stay stable. Focus is not pressing.

Other component targets require their own profile: Tabs/Segmented maintain selected indicator, fields protect caret/focus and card press effects cannot double-trigger nested buttons. On release/cancel/move-out, transient state terminates. Reduced motion removes unnecessary transforms while preserving visible immediate states. BAButton still uses a temporary CSS 200ms cubic-bezier transition until a separately reviewed Spring adapter exists.

See `docs/design-system/INTERACTION_FEEDBACK_SYSTEM_v0.1.md` for nested event/visual ownership, cancellation and accessibility criteria. `stopPropagation()` alone does not cancel CSS ancestor hover.
