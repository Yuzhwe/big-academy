# BA-DS-RADIUS-001 · Shape & Radius System v0.1

**Decision date:** 2026-10-19
**Design approval [A]:** Adopt a Vercel Geist Materials-inspired principle: corner radius depends on **component type, component size, surface/elevation role, and parent-child geometry**.
**Candidate [E]:** All initial numeric radius values, aliases and mappings below. No global numeric Radius Scale has yet received final designer approval.
**Implementation:** Candidate CSS variables added to `packages/design-system/src/tokens.css`, not yet applied to rendered components.
**Benchmark:** [Vercel Geist Materials](https://vercel.com/geist/materials), used for its **surface role and radius association**, not as a copy of its full material/stroke/shadow definitions.

## 1. Shape design principles [A]

1. **Purpose first:** choose the UI role and content hierarchy before selecting the radius number. Never generate random roundness just to make a component look friendly.
2. **Size aware:** in the same component family, smaller controls tend to use smaller corners, and spacious controls/panels can use wider corners, unless the component is an explicitly pill/circle geometry.
3. **Elevation aware:** ordinary surfaces should look restrained; more prominent/floating surfaces may use a more spacious contour. Elevation still requires a separate shadow/border decision; radius is not a substitute for elevation.
4. **Consistent semantics:** the same component/variant should retain the same radius across default, hover, active, disabled, focus and validation states unless its *shape variant* intentionally changes.
5. **Nested geometry:** maintain harmonious inset geometry. Avoid an exaggerated outer curve surrounding an incongruently square inset or overlapping clipped corners.
6. **Accessibility:** focus-visible outlines, 44px pilot hit regions, legible text, touch/keyboard behavior and overlay boundaries take precedence over visual roundness.
7. **Product intent:** shared controls are a cross-product foundation. Writing cards, Staircase milestones and decorative stage geometry may differ for approved product-specific reasons.
8. **Status separation:** values below are implementation candidates [E] and do not authorize replacing existing temporary radius values throughout Writing.

## 2. Candidate primitive radius scale [E]

| CSS token | Candidate value | Intended meaning |
|---|---:|---|
| `--ba-radius-0` | 0px | square, e.g. canvas edge or justified full-bleed geometry |
| `--ba-radius-4` | 4px | very small localized control or inset |
| `--ba-radius-6` | 6px | compact control and base card / tooltip |
| `--ba-radius-8` | 8px | regular button/field surface |
| `--ba-radius-12` | 12px | larger card, raised surface, menu or modal |
| `--ba-radius-16` | 16px | large takeover surface |
| `--ba-radius-24` | 24px | deliberately soft large surface or child-friendly feature, case by case |
| `--ba-radius-full` | 9999px | capsule/pill geometry; never use for general content cards |
| `--ba-radius-circle` | 50% | only for truly square avatars/round marker boxes |

**Why 6px?** Geist Materials uses 6px for its base/small/tooltip types. Its medium/large/menu/modal types use 12px; fullscreen uses 16px. Those are **reference anchors**, not approved Big Academy geometry. Do not force every BA surface to mirror Vercel. See [Geist Materials](https://vercel.com/geist/materials).

## 3. Material/surface hierarchy and default candidates [E]

| BA surface role | Geist inspiration | Radius token | Border/shadow guidance |
|---|---|---|---|
| `surface-base` | base, on page | 6px | calm, no unnecessary shadow; use light boundary where needed |
| `surface-small` | small, slightly raised | 6px | subtle separation without double strokes |
| `surface-medium` | medium, more raised | 12px | allow a raised look only when hierarchy calls for it |
| `surface-large` | large, further raised | 12px | large card/section distinct through content and spacing first |
| `floating-tooltip` | tooltip | 6px | lightweight overlay; correct semantic tooltip relationship |
| `floating-menu` | menu | 12px | independent overlay boundary; keyboard and pointer usable |
| `floating-modal` | modal | 12px | dialog semantics, focus management, adequate internal padding |
| `floating-fullscreen` | fullscreen | 16px | edge-aware; on small screens avoid pointless corner clipping |

**Material guidance approved [A]:** choose the lowest necessary surface/elevation treatment, avoid stacking multiple "material" treatments on the **same element**, align perceived elevation with actual stacking order, and do not rely on shadow alone to convey interaction state. **Exact shadow/stroke tokens remain [Q]** under the existing Elevation section.

## 4. Component-specific selection rules [A method / E numbers]

| Component | Default candidate | Alternatives / caveats |
|---|---|---|
| BAButton | regular control 8px | compact 6px, large 12px; **pill variant** uses full radius |
| BAField / Textarea | 8px | large/multiline wrapper 12px; preserve text area and caret |
| BATabs / Segmented Control | track 12px or full depending approved layout | active indicator radius must match track/inset; do not randomly mix |
| BAChoice / options | 8px | group container 12px, inner option 8px when inset allows |
| BAStatus / chip | full for pill label | radius 6px for a squarish status tile when context calls for it |
| LessonCard / learning card | 12px | compact 6px, larger featured 16px [E]; product artwork may use a distinct approved shape |
| Coach panel | 12px | right-side full-height workspace can have 0px at full-bleed edge |
| Tooltip / small helper | 6px | beware narrow viewport + arrow clipping |
| Popover/Menu | 12px | keep floating surface separate from underlying card |
| Dialog | 12px | edge-to-edge responsive presentation may set radius 0px on flush edges |
| Fullscreen/Takeover | 16px | actual viewport-edge treatment may require 0px |
| Circular task marker / Avatar | 50% | square width/height required for true circle |
| Long capsule button / progress rail | full | use only if intended pill geometry |

**Important:** these candidate values do not change existing BAButton pill `999px`, BATaskProgress 10px target, or TopBar geometry. Apply changes through the component's own reviewed styling/contracts in later implementation.

## 5. Concentric corners (nested radius) rule [A method]

If an inner rounded surface sits inside a visible rounded parent, use the starting geometry:

`outerRadius ≈ innerRadius + visibleInset`

- **visibleInset** is the real distance between their shape edges, not the CSS `gap` between arbitrary siblings.
- Example candidate: 12px outer card, 4px inset → 8px inner card.
- When inset is asymmetric, corners might need independently tuned radii.
- If nesting is not visually exposed (e.g. an icon deep inside a flat content block), don't force a nested radius calculation.
- Never use negative corner radius. Border widths and clipping alter the actual visible silhouette; check the real outline.
- Inner surfaces should not visually cut through the outer curve; avoid unwanted clipping at small widths and large text scales.
- If multiple layers of cards yield excessive softness, flatten a layer rather than increasing all radii.

## 6. State, responsive and touch rules

- Hover/pressed/disabled/focus/error should change *colors, outlines, or content* while retaining the same radius unless the interaction intentionally changes the surface role.
- Focus-visible rings must remain visible even when a container uses `overflow: hidden`; do not clip essential focus or error affordances.
- Do not scale radius directly with viewport width. Choose size/variant and only adjust for meaningful layout change.
- A full-bleed/edge-to-edge modal may use 0px for edges touching the viewport, with free corners retaining its intended radius where feasible.
- Radius never overrides minimum hit area or control alignment; `9999px` does not magically produce a true circle on non-square boxes.
- The Writing Warm Frame + White Canvas hierarchy stays intact. New radius values cannot silently change lesson navigation or Alex progress gating.

## 7. Designer / Agent decision tree

1. **Is it a full-bleed canvas?** Use square edge/0px unless a designed floating region exists.
2. **Is it a floating overlay?** Choose tooltip/menu/modal/fullscreen category, then corresponding radius and accessibility semantics.
3. **Is it an on-page material?** Choose base/small/medium/large elevation role; pick lowest elevation that clearly separates content.
4. **Is it an atomic control?** Resolve component variant and size first; choose control radius or explicit pill/circle.
5. **Is it nested?** Reconcile visible inset and inner/outer radius; avoid double-stroking.
6. **Is it Writing-specific geometry?** Preserve product rules and seek design review before modifying major shape.
7. **Does the chosen radius conflict with readability/focus/clipping?** The functional/accessible behavior wins.
8. **Record exception:** if a component needs an off-scale or dynamic radius, explain why in its Contract/Story before reusing it globally.

## 8. Examples (not rendered approval)

```css
/* Proposal only. Not applied to existing components by this PR. */
.ba-card { border-radius: var(--ba-radius-surface-medium); }
.ba-card__inset { border-radius: var(--ba-radius-8); } /* with a 4px actual inset */
.ba-menu { border-radius: var(--ba-radius-floating-menu); }
.ba-pill { border-radius: var(--ba-radius-full); }
.ba-avatar { aspect-ratio: 1; border-radius: var(--ba-radius-circle); }
```

## 9. QA / change boundaries

- **[A]** Role-based, size-aware, elevation-aware and nesting-aware radius selection method.
- **[E]** Numeric radius scale and first mappings.
- **[T]** Existing implementations remain unchanged.
- **Engineering not verified:** CSS tokens are unused by existing components; no browser/Storybook/a11y tests or design screenshot approval are claimed.
- Changes to major UI geometry, public Props, product logic, semantic roles or approved Writing interactions still require appropriate designer/Alex review.

**Design reference:** Vercel Geist Materials, https://vercel.com/geist/materials
