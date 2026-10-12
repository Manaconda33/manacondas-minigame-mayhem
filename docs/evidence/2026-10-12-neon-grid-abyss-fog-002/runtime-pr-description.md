# Pull request draft: Neon Grid Abyss Fog v2

**Title:** `[Draft] Neon Grid: Abyss Fog v2 downward atmospheric correction`

**Base:** `experiment/neon-grid-abyss-fog-001`

**Head:** `experiment/neon-grid-abyss-fog-002`

## Summary

This isolated correction removes B1's new tall ruined-skyline groups, suppresses only identified decorative ground/foundation ranges and pads, applies vertical and distance fog to existing lower-city meshes, extends visual-only support instances down into the fog, and lowers retained city roof fragments below nearby road elevation. B2 adds no new ruin towers. A remains the default approved T9.7 appearance; B1 remains available for comparison; B2 requires `?neonGridVisual=abyss-fog-002` and does not affect Circuit Alpha.

No approved images or textures changed. Roads, barriers, warnings, shortcuts, collisions, racers, AI, physics, race progression, audio and production configuration remain preserved.

## Review evidence

- [A/B1/B2 eight-view desktop comparison](comparison/owner-views-3way-desktop-chase.jpg)
- [Complete object-source diagnosis, render evidence and validation record](README.md)
- All eight owner progress anchors have A/B1/B2 desktop chase/rear and mobile portrait/landscape chase/rear captures in `comparison/`.
- B2 full-course chase/rear sweep: 182 samples over 1,448.938 m, maximum spacing 7.9612 m, zero browser errors, peak 490 calls / 400,031 triangles.
- B2 22-case camera/quality matrix: zero browser errors, peak 382 calls / 386,391 triangles.
- The measurements are Chromium/SwiftShader only. No physical-device result or G-05 evidence is claimed.

## Validation and limitations

- Node 24.19.0 full CI test suite: 133/133 files, 1,082/1,082 tests passed.
- Node 22.23.3: strict typecheck, zero-warning lint, asset-verified production build, and T9.6 evidence checker passed. V2 scene/lifecycle tests passed 10/10. The Waterfall Dive clearance and real-race orientation tests passed individually. A broad serial run was stopped after 12 minutes after two in-suite cases exceeded their unchanged five-second limits; full-suite Node 22 completion is unverified.
- Visual acceptance is still Manny's decision after playing the exact immutable B2 preview. This PR does not replace A, authorize the publication PR merge, release gameplay, close T9.8, or satisfy G-05.
