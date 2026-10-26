# Cloud Shader M4 Adaptive Integration · Draft QA

**Branch:** `feat/writing-cloud-shader-m4-adaptive` from PR #52 head `873717396c7cd976464af3ad2224997a11521a01` on 2026-10-26. Base/PR target is `feat/writing-hifi-integration-v1` (NOT `main`). **Candidate implementation; not visually approved.**

## 1. Source and provenance

The sole Shader visual/algorithm reference is the user-supplied `cloud-shader-demo(2).zip` → `cloud-shader-demo.html` (38,633 bytes, SHA-256 `58289cd3b472c1b04b7a47043f11909410180a44e9435f01e7068a4cb675453e`). The read-only original demo is held in the task attachments/local extraction; it is NOT duplicated in the Git repository. Preserve the exact ZIP and do not mistake this TypeScript port for an original authored algorithm.

Original HTML attribution: Aceternity UI Cloud Shader, https://ui.aceternity.com/components/cloud-shader ; original registry source https://ui.aceternity.com/registry/cloud-shader.json. Vertex + fragment GLSL copied from the original M4 HTML in `apps/writing/src/course/cloudShaderM4.ts` without changing procedural geometry, hash/noise/fbm/billow, cloud density, self-shadow, positions, drift formula, or Clear palette. The HTML includes an independent Canvas 2D fallback; this is NOT the Writing page fallback.

**Licensing gate (checked 2026-10-26):** The Aceternity Cloud Shader component is identified as covered by the **Aceternity License** on its 21st community component page (https://mcp.21st.dev/%40manuarora700/components/cloud-shader). Aceternity's terms (https://ui.aceternity.com/licence) allow modification and use in end products including web apps, while prohibiting separate redistribution of source files, stock assets, and marketplace components or templates. This Big Academy implementation must not be presented or packaged as an independently redistributable open-source shader/library. Keep provenance and license notices; before publishing reusable component source externally, confirm the applicable free-component terms with the rights holder. The provided source HTML itself does not include a separate LICENSE file.

## 2. Presets (candidate visual review)

| Setting | Original M4 Clear | Current Staircase cloud candidate |
|---|---|---|
| Sky top | `#3876BA` | `#85DBF9` |
| Sky bottom | `#8CBFE8` | `#F8F4ED` |
| Cloud color | `#FBF8F2` | `#FBF8F2` |
| Count | 5 | 5 |
| Drift | 0.8 | 0.8 |

The existing formal background is `linear-gradient(135deg,#85DBF9,#F8F4ED)`. **The original 4,599-character M4 fragment source is untouched** (length/FNV1a verified against uploaded HTML: `0xd1e1ef50`, vertex `0x29cf13d3`). Original Clear uses this original FULL sky shader. For the live Staircase, `deriveM4CloudOnly(FRAG)` tracks the opacity of exactly the same six M4 cloud passes and cirrus to emit transparent RGBA only; it composites over the **existing approved 135° CSS gradient**, without overwriting sky color/haze/sun. Cloud geometry, density, shadows and drift remain those of M4; the transparency/compositing derivative is a **candidate** requiring actual WebGL and designer QA. Lightweight/failure uses the same CSS backdrop.

## 3. One real component, two consumers

- `apps/writing/src/course/CloudShaderSky.tsx`: authoritative renderer and lifecycle for both student Staircase and designer preview. `preset=clear` compiles the original full-sky M4 GLSL; `preset=staircase` compiles the derived transparent-cloud output so the original CSS sky is never repainted.
- `apps/writing/src/course/CloudShaderSky.css`: unmodified-style R2.12 three-cloud silhouettes plus Shader canvas layer.
- `apps/writing/src/course/StaircaseScene.tsx`: swaps **only** the previous cloud layer with `<CloudShaderSky mode="auto" preset="staircase" cameraX={boundedX} cameraMaxTravel={maxX} parallaxStrength={scenic.cloud}/>`.
- `apps/library/src/{Preview,CloudControls,catalog}.tsx`: live sample with Auto / Shader / Lightweight, original/current palette, count, speed, colors, parallax, camera simulation, pause and `cloudSimulateUnavailable` for QA only.
- `CloudShaderSky.stories.tsx`: original vs current, forced modes, reduced motion and scroll.
- Registry ID: `BA-WR-013`, not reused.
- No editor controls are mounted on the student page.

## 4. Selection / animation / failure handling

`auto`: prefer WebGL when available, hardware cores >4 where disclosed, device memory >4GB where disclosed, and no reduce-motion preference; successful first compile/link/draw is required to remove existing lightweight clouds. Any failure returns lightweight, not black screen. Forced `shader` retries even on conservative hardware but also safely falls back.

M4 core time accumulator uses elapsed rAF time (speed 0.8), independent of camera. 22 FPS target, at most 580,000 pixels and DPR <=1.25; after sustained >115ms frame intervals, fail to lightweight. Resource/event cleanup handles unmount, document hidden, intersection, resize, and lost WebGL context. No Shader compile on camera changes.

Camera data source: `boundedX`, `maxX` and `scenic.cloud` computed once in StaircaseScene. Both modes use `-cameraX * scenic.cloud` (bounded; pixel displacement is absolute rather than cumulative). Canvas has overscan to avoid gaps when the texture is translated. Hill1/hill2 remain the existing separately managed layers. Navigation/cards/terraces/unit art/flag/milestone/learning are unchanged.

`reducedMotion` or OS preference disables continuous Shader drift; lightweight CSS animation is stopped by its stylesheet. Shader stays static if motion preference changes mid-session until a re-render or mode change.

## 5. Actual verification and remaining gates

- **Original M4 integrity:** the original uploaded vertex/fragment GLSL source matches the repository by length/FNV-1a (VERT 179 chars / `0x29cf13d3`, FRAG 4,599 chars / `0xd1e1ef50`). Source HTML SHA-256: `58289cd3b472c1b04b7a47043f11909410180a44e9435f01e7068a4cb675453e`. No replacement algorithm was introduced.
- **GitHub Actions real checks:** `npm ci`, `check:docs`, `typecheck`, complete production builds of Writing, design-system, library and Storybook **passed**; BA-WR-013 + registry Vitest **9/9 passed**.
- **Complete unit baseline:** **118/121 passed**. Three failing assertions are in unchanged CourseSession and Review04Visuals suites. They remain unresolved; do not change scoring, milestone or flag behavior just to mask this unrelated baseline. CI intentionally stays red on this gate.
- **Browser evidence:** GitHub-hosted Chromium ran 17 Playwright cases, **16 passed**, including **all 4 newly added Cloud M4 visual/interaction cases**. The only failure was an obsolete SVG flag selector from pre-R04 code. The existing real flag is now a Canvas; the test has been updated to validate Canvas motion/reduced-motion and awaits the latest rerun. Real screenshot/video/trace artifact (~17.6 MB): https://github.com/Yuzhwe/big-academy/actions/runs/40329723457/artifacts/12653188207
- **Shader-versus-fallback proof:** the latest branch QA prints `browser-renderer-observations.json` (Clear vs current-palette) after the Chromium run; only `renderer=shader` establishes that software-GL browser compiled/drew M4. A screenshot produced in forced Shader mode is **not** proof when the observed renderer is `lightweight`.
- **Not yet verified:** original standalone HTML in actual Chromium/Safari screenshot, Safari/macOS hardware shader visuals, real GPU frame-time field tests, long-run device performance, real tablet touch, designer visual approval and license conditions for externally redistributing source. Linux Chrome software WebGL does not stand in for native Safari or final visual approval. The user's localhost is not remotely accessible from this chat.

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

Visual QA capture at 1440×900, 1024×768, 834×1112 and 390×844. On macOS, `Start Big Academy.command` normally serves the Writing page at `http://127.0.0.1:5174`; the separate designer workbench is `http://127.0.0.1:6007/?view=components&component=cloud` after `npm run dev:library`. Storybook is normally port 6006. Confirm actual printed Vite/Storybook ports. Verify real shader drift and scroll in Chrome/Safari, WebGL failure and scene continuity, observe system preference changes, and confirm other card assets and controls are unchanged. Do not treat URL examples as hosted previews.

## 6. Designer decisions

1. Original M4 full-sky Clear versus current-palette **transparent M4 clouds** over the approved CSS sky; inspect gradients, shadow edges, opacity and any seams on Chrome/Safari before accepting the adaptation.
2. Cloud `parallaxStrength` default comes from `scenic.cloud`; review motion visually.
3. WebGL budget/auto detection thresholds and whether Shader is enabled by default for students after field performance QA.
4. Source licensing confirmation for public redistribution.

**No main merge, no Vercel deployment. Remain Draft until verified and approved.**
