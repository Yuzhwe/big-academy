# Cloud Shader M4 Adaptive Integration · Draft QA

**Branch:** `feat/writing-cloud-shader-m4-adaptive` from PR #52 head `873717396c7cd976464af3ad2224997a11521a01` on 2026-10-26. Base/PR target is `feat/writing-hifi-integration-v1` (NOT `main`). **Candidate implementation; not visually approved.**

## 1. Source and provenance

The sole Shader visual/algorithm reference is the user-supplied `cloud-shader-demo(2).zip` → `cloud-shader-demo.html` (38,633 bytes, SHA-256 `58289cd3b472c1b04b7a47043f11909410180a44e9435f01e7068a4cb675453e`). The read-only original demo is held in the task attachments/local extraction; it is NOT duplicated in the Git repository. Preserve the exact ZIP and do not mistake this TypeScript port for an original authored algorithm.

Original HTML attribution: Aceternity UI Cloud Shader, https://ui.aceternity.com/components/cloud-shader ; original registry source https://ui.aceternity.com/registry/cloud-shader.json. Vertex + fragment GLSL copied from the original M4 HTML in `apps/writing/src/course/cloudShaderM4.ts` without changing procedural geometry, hash/noise/fbm/billow, cloud density, self-shadow, positions, drift formula, or Clear palette. The HTML includes an independent Canvas 2D fallback; this is NOT the Writing page fallback.

**Licensing gate:** Aceternity lists Cloud Shader as a free copy-paste component but the reviewed public materials did not establish a per-file license for the adapted GLSL. Do not characterize the port as proprietary Big Academy code or publish/license the source for reuse until upstream permission/license is verified. The user-provided HTML contains an attribution but no explicit LICENSE file.

## 2. Presets (candidate visual review)

| Setting | Original M4 Clear | Current Staircase cloud candidate |
|---|---|---|
| Sky top | `#3876BA` | `#85DBF9` |
| Sky bottom | `#8CBFE8` | `#F8F4ED` |
| Cloud color | `#FBF8F2` | `#FBF8F2` |
| Count | 5 | 5 |
| Drift | 0.8 | 0.8 |

The existing formally styled background is `linear-gradient(135deg,#85DBF9,#F8F4ED)`; the original fragment Shader uses vertically interpolated color, haze and sun. Supplying the current color endpoints does not make the full Shader render mathematically identical to the approved 135° gradient. **Designer must visually approve this candidate before release.** The CSS gradient remains as the original behind the renderer and still applies to lightweight/failure mode.

## 3. One real component, two consumers

- `apps/writing/src/course/CloudShaderSky.tsx`: authoritative renderer and lifecycle for both student Staircase and designer preview.
- `apps/writing/src/course/CloudShaderSky.css`: unmodified-style R2.12 three-cloud silhouettes plus Shader canvas layer.
- `apps/writing/src/course/StaircaseScene.tsx`: swaps **only** the previous cloud layer with `<CloudShaderSky mode="auto" preset="staircase" cameraX={boundedX} cameraMaxTravel={maxX} parallaxStrength={scenic.cloud}/>`.
- `apps/library/src/{Preview,CloudControls,catalog}.tsx`: live sample with Auto / Shader / Lightweight, original/current palette, count, speed, colors, parallax, camera simulation and pause.
- `CloudShaderSky.stories.tsx`: original vs current, forced modes, reduced motion and scroll.
- Registry ID: `BA-WR-013`, not reused.
- No editor controls are mounted on the student page.

## 4. Selection / animation / failure handling

`auto`: prefer WebGL when available, hardware cores >4 where disclosed, device memory >4GB where disclosed, and no reduce-motion preference; successful first compile/link/draw is required to remove existing lightweight clouds. Any failure returns lightweight, not black screen. Forced `shader` retries even on conservative hardware but also safely falls back.

M4 core time accumulator uses elapsed rAF time (speed 0.8), independent of camera. 22 FPS target, at most 580,000 pixels and DPR <=1.25; after sustained >115ms frame intervals, fail to lightweight. Resource/event cleanup handles unmount, document hidden, intersection, resize, and lost WebGL context. No Shader compile on camera changes.

Camera data source: `boundedX`, `maxX` and `scenic.cloud` computed once in StaircaseScene. Both modes use `-cameraX * scenic.cloud` (bounded; pixel displacement is absolute rather than cumulative). Canvas has overscan to avoid gaps when the texture is translated. Hill1/hill2 remain the existing separately managed layers. Navigation/cards/terraces/unit art/flag/milestone/learning are unchanged.

`reducedMotion` or OS preference disables continuous Shader drift; lightweight CSS animation is stopped by its stylesheet. Shader stays static if motion preference changes mid-session until a re-render or mode change.

## 5. Current evidence and open gates

Static GitHub file/registry checks were performed during implementation. Added Vitest tests cover original params/GLSL signatures, parallax math, low-end auto rules, three-cloud mode, WebGL-null fallback, and designer URL round-trip. **These tests have NOT been executed in a current repository checkout.**

Live browser test, GL compilation on Chrome/Safari, TypeScript, Vite/library/Storybook builds, Playwright, screenshots, drifting video, real performance telemetry, resize/touch/keyboard/long-run and WCAG checks remain **NOT VERIFIED** because this chat's container cannot clone GitHub (DNS inaccessible) or access the user's localhost. Attempts to capture original file HTML in headless Chromium timed out; no fabricated screenshots included.

On a genuine local checkout:
```sh
git fetch origin
git switch feat/writing-cloud-shader-m4-adaptive
npm ci
npm run check:docs
npm run typecheck
npm test
npm run build
npm run test:integration
npm run dev
npm run dev:library
npm run storybook
```

Visual QA capture at 1440×900, 1024×768, 834×1112 and 390×844. Open `http://127.0.0.1:5173` (use actual Vite output port), designer `http://127.0.0.1:5173/?view=components&component=cloud` only if served by library dev command (use actual port), Storybook on the actual printed port. Verify real shader drift and scroll in Chrome/Safari, WebGL failure and scene continuity, observe system preference changes, and confirm other card assets and controls are unchanged. Do not treat URL examples as hosted previews.

## 6. Designer decisions

1. Original M4 full-sky Clear versus current-palette Shader candidate (vertical GLSL interpolation/haze/sun may change perceived approved backdrop).
2. Cloud `parallaxStrength` default comes from `scenic.cloud`; review motion visually.
3. WebGL budget/auto detection thresholds and whether Shader is enabled by default for students after field performance QA.
4. Source licensing confirmation for public redistribution.

**No main merge, no Vercel deployment. Remain Draft until verified and approved.**
