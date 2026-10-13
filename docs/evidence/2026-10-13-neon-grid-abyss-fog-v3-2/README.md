# Neon Grid Abyss Fog V3.2 — geometry termination review

**Status:** Isolated candidate prepared for Manny's Stage 1 visual review. Owner acceptance is pending; Stage 2 remains unauthorized.

**Baseline branch / checkpoint:** `experiment/neon-grid-abyss-fog-003` at `f2619565c9a962623dd8c692aa3a3639a2906046`.

**Candidate branch:** `experiment/neon-grid-abyss-fog-004`.

**Runtime commit:** `9731adafdaf8e84d5a2c36ceeb035620753befa6`. A review-only test follow-up at `c8ed8071e5b4be1f1c34178fc67cb3c8f078dde8` adds explicit terminal-fog coverage for `skyline-cross-braces`; it changes no runtime source.

**Candidate selector:** `?neonGridVisual=abyss-fog-004`. T9.7 remains the production/default presentation.

## Diagnosis and bounded correction

The original fixed-angle views targeted `undercity-city-buildings` instance 1, the `foundations` part range of `undercity-industrial-architecture`, `undercity-wallside-sightline-screens`, `skyline-deck-fascia`, and `skyline-pylons` instance 6. The source and bounds analysis is in [`diagnosis.md`](diagnosis.md).

The first V3.2 render showed that exact blending to V3.1's ordinary `#3e5266` fog color still left a light flat face against the darker lower backdrop. The narrow correction blends only the terminal depth of seven existing termination meshes to `#243543`, while retaining the existing V3.1 fog color through the upper and middle depth. The Undercity screens and Skyline fascia use object-local depth profiles that reach dense fade just before their existing lower edges.

V3.2 does not move, add, remove, or lengthen geometry. It preserves every mesh buffer, index range, instance transform, opening interval, collision shape, route, shortcut, support connection, sign, road surface, character/kart asset, and Waterfall Dive feature. The V3.2 variant maps all district builders to the V3.1 composition, then applies the local fog correction. V3.1 and T9.7 remain independently reproducible.

## Matched actual-scene comparisons

The captures use the real `KartTimeTrial` scene at Medium quality, eight racers with the exact roster `aa-03, aa-04, aa-05, aa-07, aa-10, aa-12, aa-14`, fixed archived V3.1 camera transforms, and the same viewport/render settings for both variants. Desktop is 1280×720; mobile portrait is 390×844. The runtime was local Chromium WebGL with SwiftShader. There were no browser or shader errors. The Vite console did emit the existing Three.js `PCFSoftShadowMap` deprecation warning for both variants; the renderer falls back to `PCFShadowMap` and this work does not change shadow settings.

| View | Desktop comparison | Mobile portrait comparison |
|---|---|---|
| Skyline starting straight | [V3.1 ↔ V3.2](comparison/pairs/starting-straight-desktop.jpg) | [V3.1 ↔ V3.2](comparison/pairs/starting-straight-mobile-portrait.jpg) |
| Undercity | [V3.1 ↔ V3.2](comparison/pairs/undercity-desktop.jpg) | [V3.1 ↔ V3.2](comparison/pairs/undercity-mobile-portrait.jpg) |
| Open curved bridge | [V3.1 ↔ V3.2](comparison/pairs/open-curved-bridge-desktop.jpg) | [V3.1 ↔ V3.2](comparison/pairs/open-curved-bridge-mobile-portrait.jpg) |
| Waterfall Dive | [V3.1 ↔ V3.2](comparison/pairs/waterfall-dive-desktop.jpg) | [V3.1 ↔ V3.2](comparison/pairs/waterfall-dive-mobile-portrait.jpg) |

The three original diagnostic camera transforms are matched separately:

| Diagnostic view | Comparison |
|---|---|
| Undercity building bottom | [V3.1 ↔ V3.2](diagnostics/pairs/undercity-building-bottom.jpg) |
| Undercity wall-side screens | [V3.1 ↔ V3.2](diagnostics/pairs/undercity-side-screens.jpg) |
| Skyline support pylon | [V3.1 ↔ V3.2](diagnostics/pairs/skyline-support-pylon.jpg) |

Full-resolution inputs are in [`v3-1/`](v3-1/) and [`v3-2/`](v3-2/). [`capture-report.json`](capture-report.json) records every camera transform, frame counter, timing sample, roster, and browser error result. The report verifies exact camera matches and identical draw, triangle, geometry, and texture counts for every paired view.

The diagnostic views show lower building faces, screen edges, and pylon ends merging into the dark local haze without changing their upper structure. The ordinary chase views remain visually aligned with V3.1, and the Waterfall Dive capture is unchanged at the same camera transform.

## Rendering and performance

Across matched captures V3.1 and V3.2 report identical render cost:

| View set | Peak draw calls | Peak visible triangles | Peak geometries | Peak textures |
|---|---:|---:|---:|---:|
| Desktop chase views | 296 | 152,047 | 204 | 15 |
| Mobile portrait chase views | 234 | 122,563 | 178 | 13 |
| Fixed desktop diagnostic angles | 490 | 400,751 | 241 | 33 |

All are under the approved **500 draw-call / 425,000 Task 9 triangle** limits. Shader program counts matched at every corresponding view; no extra draw calls, triangles, geometry, or textures were added. The fog remains opaque and uses no transparent volume or additional post-processing pass.

One matched 120-frame synchronous SwiftShader timing sample (30 warmup frames) measured:

| Layout | V3.1 median / p95 / max | V3.2 median / p95 / max |
|---|---:|---:|
| Desktop | 4.2 / 17.2 / 34.4 ms | 3.0 / 6.3 / 22.0 ms |
| Mobile portrait viewport | 3.3 / 7.7 / 27.2 ms | 2.7 / 5.2 / 28.1 ms |

These single-run values are noisy software-renderer measurements, not device FPS, physical-device performance, or G-05 evidence. The render counters and shader-program counts match for every paired view. No heap or GPU-memory byte measurement was captured; geometry, texture, draw-call, and lifecycle tests show no added resources or ownership changes.

## Validation

Validated on Node 24.19.0 / npm 11.9.0:

- `npm run typecheck` — PASS, exit 0.
- `npm run lint` — PASS, zero warnings, exit 0.
- `npm run test:ci -- --maxWorkers=1` — PASS on runtime commit `9731ada`, **133/133 files and 1,085/1,085 tests**, exit 0; coverage enabled; 835.61 seconds. This full run preceded the two-line test-only review follow-up; the focused suite below was rerun afterward against the final source/test tree.
- `npm run test -- --run --maxWorkers=1 tests/neon-grid-fog-experiment.test.ts tests/neon-grid-stage4-t9-7-city-ground.test.ts tests/neon-grid-collision.test.ts tests/neon-grid-tunnel.test.ts tests/shortcut-traversal.test.ts tests/neon-grid-scene.test.ts tests/track-scene.test.ts tests/neon-grid-lap-routes.test.ts tests/neon-grid-stage4-task9.test.ts` — PASS against follow-up `c8ed807`, **9 files / 96 tests**, exit 0; 87.09 seconds. A first run before the review follow-up also passed 9/96 in 87.90 seconds.
- `npm run build` — PASS, exit 0. SFX, music, branding, approved ad/signage, terrain, runtime textures, GLB, character PNG, and podium asset checks passed. Vite emitted the existing warning for the 3,309 kB `KartTimeTrial` bundle exceeding 500 kB.
- `git lfs fsck --objects HEAD` — PASS, exit 0 on runtime commit `9731adafdaf8e84d5a2c36ceeb035620753befa6`; the follow-up changes only a test assertion.
- `git diff --check` — PASS, exit 0 for runtime, evidence, and tracked documentation changes.

No test threshold or render budget was changed. The full-suite run includes the V3.2 regression test and the project’s collision, shortcut, masking, scene-lifecycle, and district geometry tests.

## Acceptance boundary and limitations

This package is for owner visual review, not owner visual acceptance. No preview was published. No runtime merge, production deployment, Stage 2 work, or T9.8 advancement is authorized. Circuit Alpha, physics, AI, shortcuts, approved artwork, and all prior visual baselines remain unchanged. Physical-device/G-05 performance remains unverified.
