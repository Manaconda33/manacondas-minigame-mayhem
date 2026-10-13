# Neon Grid Abyss Fog V3.1 — Stage 1 review packet

**Status:** Ready for Manny's Stage 1 visual review; visual acceptance remains pending. Stage 2 is not authorized.

**Branch:** `experiment/neon-grid-abyss-fog-003`

**Starting checkpoint:** `7ce61bf2409a5a42872e6c37575571f692bbe9d2`

**V3 runtime baseline:** `6e133c71c8671123d597c61fcba6bc0186246e5e`

**Review option:** `?neonGridVisual=abyss-fog-003` (the existing opt-in experiment selector; no preview was published by this work).

## Scope and changes

V3.1 keeps V3's fog-bank approach and uses existing city, tunnel, and support geometry. It adds no meshes, towers, textures, external assets, transparent fog layers, collision changes, or gameplay behavior.

- Fog now selects the nearer roadway in 3D. At the Undercity main-road chase camera, V3 had selected the lower service-tunnel elevation because the tunnel's broad lateral threshold also matched the camera. That put the fog reference 4 m below the main deck. The camera is now referenced to the main road there and to the tunnel only when the tunnel surface is actually nearer.
- The Undercity fog begins just below road height and reaches dense coverage by 20 m below it. The merged wall-side screens have a shorter, stronger fade. This leaves the road and warning meshes outside the fog while softening the lower ends of screens and buildings.
- The skyline keeps its existing 22 instanced towers, with varied roofs from 6 m below to 28 m above the roadway and heights from 32–74 m. Their bases remain 38–46 m below road level.
- The cloud bank and object fog use a shared darker blue-black palette (`#3e5266` fog target; linear mist `[0.050, 0.084, 0.130]`). No new render pass or transparent volume was added.
- The tunnel side walls receive a restrained cool tint. The visible service-tunnel floor receives a muted slate tint; its geometry, indices, collision/route, floor and roof visibility, and warning placement are unchanged. Approved/default and B2 colors remain unchanged.
- Waterfall geometry, texture, animation, shortcut markers, road, and camera logic were not edited. The common background fog palette changes its surrounding haze; compare the Waterfall Dive pair below.

## Matched in-game comparisons

Captures use the actual medium-quality `KartTimeTrial` scene, the deterministic eight-racer roster, the chase camera, and identical progress anchors. The V3 and V3.1 camera positions and rotations match exactly at all four anchors. Desktop is 1280×720; mobile portrait is 390×844. Both runs used local Chromium WebGL/SwiftShader.

| Location | Desktop pair | Mobile portrait pair |
|---|---|---|
| Skyline starting straight | [V3 ↔ V3.1](comparison/pairs/starting-straight-desktop.jpg) | [V3 ↔ V3.1](comparison/pairs/starting-straight-mobile-portrait.jpg) |
| Undercity | [V3 ↔ V3.1](comparison/pairs/undercity-desktop.jpg) | [V3 ↔ V3.1](comparison/pairs/undercity-mobile-portrait.jpg) |
| Open curved bridge | [V3 ↔ V3.1](comparison/pairs/open-curved-bridge-desktop.jpg) | [V3 ↔ V3.1](comparison/pairs/open-curved-bridge-mobile-portrait.jpg) |
| Waterfall Dive | [V3 ↔ V3.1](comparison/pairs/waterfall-dive-desktop.jpg) | [V3 ↔ V3.1](comparison/pairs/waterfall-dive-mobile-portrait.jpg) |

Full-resolution individual captures are in [`comparison/v3/`](comparison/v3/) and [`comparison/v3-1/`](comparison/v3-1/). Raw camera, frame, roster, and timing data are in [`diagnostics/v3-capture-report.json`](diagnostics/v3-capture-report.json) and [`diagnostics/v3-1-capture-report.json`](diagnostics/v3-1-capture-report.json).

The original V3 skyline reads as a short, uniform silhouette; V3.1 restores varied towers above the deck. Undercity lower structures and the wall-side screens now blend more softly into dark haze while the road and warning remain crisp. The curved-bridge tunnel surface reads as cool slate rather than a prominent magenta patch. The Waterfall Dive's cascade, gold indicators, and road remain visible; the ambient backdrop is darker.

## Source audit and rendering budget

The eight owner-reported progress checkpoints were rendered and inspected with a 5×5 screen-ray grid and six lateral ground probes. The audit found zero browser errors, zero exposed city-floor pixels, zero ground-probe hits, zero near-coincident ground overlaps, and zero unsupported fog materials. The results and object inventory are in [`diagnostics/v3-1-source-audit.json`](diagnostics/v3-1-source-audit.json).

Across matched chase-camera captures, V3 and V3.1 have the same draw calls, visible triangles, geometry count, and texture count at each anchor:

- Desktop peak: **296 calls / 152,047 triangles**, 204 geometries, 15 textures.
- Mobile portrait peak: **234 calls / 122,563 triangles**, 178 geometries, 13 textures.
- No scene geometry or texture was added. V3.1 clones three existing tunnel materials for its isolated palette changes; scene disposal is exercised by the existing scene resource lifecycle tests.
- One local 120-frame diagnostic sample at the Undercity anchor: desktop median/p95 **4.5/13.5 ms (V3)** and **3.4/9.0 ms (V3.1)**; mobile portrait **2.3/3.6 ms (V3)** and **2.4/3.2 ms (V3.1)**. These synchronous SwiftShader diagnostic timings are noisy and are not physical-device FPS or G-05 certification.

The V3.1 final validation used Node 24.19.0 / npm 11.9.0. Strict typecheck, zero-warning lint, production build (including all runtime asset verifiers), LFS integrity, and the complete serial CI test suite passed. The full-suite command completed **133 files / 1,084 tests** in 826.51 seconds with coverage enabled. An earlier two-worker run hit two existing five-second timeouts in the T9.7 city-ground suite; both tests passed in isolation without changing their timeout or assertions, and the full serial run passed. Exact commands and exit codes are recorded in `docs/TESTING.md`.

Three additional candidate-only diagnostic angles show the Undercity building lower body, Undercity wall-side screens, and a Skyline support pylon: [`diagnostics/angles/undercity-building-bottom.png`](diagnostics/angles/undercity-building-bottom.png), [`diagnostics/angles/undercity-side-screens.png`](diagnostics/angles/undercity-side-screens.png), and [`diagnostics/angles/skyline-support-pylon.png`](diagnostics/angles/skyline-support-pylon.png). These are useful source views, but they are not matched A/B camera comparisons. The matched desktop/mobile pairs remain the primary review evidence.

The render reports contain geometry, texture, draw-call, and frame-time counters. No process heap or GPU memory-byte measurement was collected; disposal was exercised through the repository's scene lifecycle tests. No new geometry or texture resources were created. The only additional resources are three cloned presentation materials, which are owned by the scene and disposed with it.

## Acceptance boundary

This packet is evidence for owner review, not visual acceptance. The current screenshots show improved height variation, a darker blended atmosphere, and softer lower structures; Manny must decide whether any remaining dark architectural silhouettes still read as floating. Do not merge to the Neon Grid development branch or `main`, publish/replace a preview, begin Stage 2, or claim G-05 certification without the separate approvals and evidence required for those steps.
