# Neon Grid Abyss Fog v3 — Stage 1 evidence

**Status: Stage 1 implemented; owner visual review required. Stage 2 has not started.** This is an isolated experiment on `experiment/neon-grid-abyss-fog-003`, based on rejected B2 `6dc9b862e8d5d05dfe6cd17ce2f62018bae7d999`. Runtime implementation is commit `6e133c71c8671123d597c61fcba6bc0186246e5e`. It preserves the approved T9.7 A baseline at `75c6c62c865ec3b546f3f2512e649de9ea6d52bc` and the rejected B2 variant. The default renderer remains A; v3 is opt-in with `?neonGridVisual=abyss-fog-003`.

No merge, push, publication, preview replacement, production deployment, or gameplay change is included. No new scenery was added. Manny must review the actual result before any Stage 2 dressing.

## What the screenshots show

[`comparison/desktop-three-way.jpg`](comparison/desktop-three-way.jpg) is the four-location A/B2/v3 desktop chase comparison. [`comparison/v3-mobile-portrait.jpg`](comparison/v3-mobile-portrait.jpg) contains the matching v3 mobile portrait views. Full size images are in [`comparison/A/`](comparison/A/), [`comparison/B2/`](comparison/B2/), [`comparison/v3/`](comparison/v3/), and [`comparison/mobile-v3/`](comparison/mobile-v3/).

| Location | Progress | Observed v3 Stage 1 result |
| --- | ---: | --- |
| Starting straight | 0.075 | Soft cloud bank and world-height fog visibly fade lower city masses below the elevated deck; approved signage, roadway and racers remain crisp. |
| Undercity | 0.355 | Existing 16-building facade set is restored around the roadway; the road reads as enclosed by nearby city architecture. Lower facades fade into district-local fog. |
| Open curved bridge | 0.239 | Fog softens city masses and support ends below the road while the bridge, roadside screens, and shortcut warning remain visible. |
| Waterfall Dive | 0.792717 | Approved waterfall and warning markers remain clear; the drop and distant support/building forms fade into mist. |

The capture report [`diagnostics/final-capture-report.json`](diagnostics/final-capture-report.json) records exact transforms, scene counters, 8-racer roster, and zero browser errors. Each A/B2/v3 desktop trio uses the same chase camera transform and same deterministic racer roster at its progress anchor. The positions were staged in the actual `KartTimeTrial` course scene; these are not manually driven full-race recordings or physical-device screenshots.

## Source diagnosis and corrections

| Issue seen in B2 | Actual source | Stage 1 correction |
| --- | --- | --- |
| Flat blue horizon without convincing lower-world fog | `NeonGridAbyssFogV2.ts` supplied a background tint and fogged only some lower-world meshes. | `NeonGridAbyssFogV3.ts` adds one soft, noise-shaped cloud-bank backdrop and an opaque world-space height/distance fog shader to existing district architecture and supports. No transparent volume or raymarch pass is used. |
| Unfaded building/support ends | Existing named presentation meshes, including merged city-ground/fascia meshes, district tower instances and pylons. | Fog targets now include existing building/window batches, merged ground/tower meshes, supports and Falls fascia. The shader affects those existing materials only; gameplay road, walls, racers, shortcuts and approved signage materials remain outside the fog treatment. |
| City read as a uniformly elevated environment and Undercity looked empty | B2 lowered Undercity rooflines with Skyline/Falls, leaving all 16 nearby buildings below road height. | Use district-specific placement: Skyline roofs sit 1–3.6 m below their local road; Undercity roofs sit 1.5–4.1 m above road with all 16 existing building masses and industrial support/facade parts preserved; Falls roofs sit 1.5–5 m below local road. No new ruin structures are added. |
| Undercity screen/foundation bottoms read as floating | `undercity-wallside-sightline-screens` contains real road-side enclosure panels plus the merged decorative floor; `undercity-industrial-architecture` batches foundations with facade components. | Decorative floor triangles and utility pads stay suppressed, while required screen panels and building foundations remain. Undercity fog now starts at 2 m below road, becomes visible by 6 m, strong by 14 m and dense by 26 m. The visible wall tops are roadway enclosure geometry and intentionally remain readable. |
| Support pillars appeared to stop in empty space | `skyline-pylons`, `falls-run-pylons`, and `falls-run-extension-supported-pylons`; the Falls extension footings are a separate instanced group. | Extend existing pylons 58–60 m below the deck so their lower ends disappear into fog; suppress only the decorative extension footing instances. Counts and collision geometry are unchanged. |

The v3 depth settings are district-local:

| District | Visible / strong / dense below local road | Distance fade |
| --- | --- | --- |
| Skyline | 11 / 23 / 38 m | 70–250 m |
| Undercity | 6 / 14 / 26 m | 90–220 m |
| Falls Run | 11 / 22 / 36 m | 68–235 m |

The source audit [`diagnostics/v3-source-audit-final.json`](diagnostics/v3-source-audit-final.json) inspected all eight owner-reported progress anchors. It reports zero city-floor pixels, no ground-probe hits or near-coincident ground pairs, zero unsupported fog materials, and zero browser errors. The audit is structural/raycast evidence; it does not replace reviewing the screenshots.

## Measured rendering cost

Four desktop locations were captured with the actual `KartTimeTrial` chase camera, medium quality and eight racers. Maximum among those four views:

| Variant | Max calls | Max triangles |
| --- | ---: | ---: |
| Approved T9.7 A | 300 | 167,755 |
| Rejected B2 | 296 | 151,327 |
| v3 Stage 1 | 296 | 152,047 |

The v3 four-view peak is within 500 calls / 425,000 Task 9 triangles. It is not a full-course peak claim. The comparison is detailed in the capture report.

A separate same-anchor 120-frame Chromium/SwiftShader timing sample is in [`diagnostics/performance-120-frames.json`](diagnostics/performance-120-frames.json):

| Variant | Median ms | P95 ms | Max ms |
| --- | ---: | ---: | ---: |
| A | 361.5 | 499.4 | 670.4 |
| B2 | 300.5 | 454.9 | 631.0 |
| v3 | 261.3 | 293.9 | 321.4 |

These software-renderer frame times are diagnostic only and do not represent physical hardware FPS, mobile performance or G-05 certification. No physical-device run was available.

## Validation and limits

- Node **24.19.0**: strict typecheck, zero-warning lint, asset-verified production build, and **9 focused regression files / 90 tests** passed. The full single-worker coverage suite was stopped after 12 minutes with no final summary, so its result is **incomplete**; see `docs/TESTING.md`.
- `git lfs fsck --objects HEAD` and `git diff --check` passed.
- Build's existing Vite large-chunk advisory remains; build exit code was 0.
- No GitHub Actions run, remote PR, new immutable preview, or physical-device measurements were requested or performed.
- Owner visual acceptance is pending. This evidence does not authorize Stage 2, runtime merge, production release, preview publication, or replacement of A/B2.

## Provenance

- A: approved T9.7 source `75c6c62c865ec3b546f3f2512e649de9ea6d52bc`.
- B2: rejected baseline `6dc9b862e8d5d05dfe6cd17ce2f62018bae7d999`.
- v3 runtime: `6e133c71c8671123d597c61fcba6bc0186246e5e` on `experiment/neon-grid-abyss-fog-003`; evidence and decision documentation are committed after that runtime checkpoint.
