# Draft runtime PR — not published

**Target:** `design/neon-grid-circuit-02`

**Source:** `experiment/neon-grid-abyss-fog-001`

**Runtime/evidence commit:** `b0f8d6ed0ef1ba92c6e2dace6886ab04232abd65`

**Title:** `feat(neon-grid): add opt-in abyss fog city visual experiment`

## Summary

- Add an opt-in `?neonGridVisual=abyss-fog-001` presentation for Neon Grid with opaque fog gradient and district-local instanced ruined-city silhouettes.
- Hide only decorative floor triangles while preserving the approved roads, supports, city architecture, signs, waterfall, shortcuts, and gameplay systems.
- Keep the previously approved T9.7 runtime as the default A presentation and preserve it for comparison.
- Add lifecycle, road-clearance, variant-isolation, and visible-mesh regression tests plus browser diagnostics for repeatable A/B captures.

## Validation

- Node 22.23.3 typecheck, zero-warning lint, asset verification/build, LFS fsck, six new fog tests, and eight evidence-checker tests pass.
- Full serial suite: 1,077/1,078 pass; one existing race-orientation test exceeded its unchanged 5-second timeout, then passed alone in 3.64 seconds.
- Local B rendering: 22-case matrix and 182-position full-course sweep; no browser errors. Peak 500 draw calls / 413,103 triangles.
- SwiftShader timing is diagnostic only: B median is 5.3% slower, p95 0.7% lower, and max 0.8% lower than A. No physical-device or G-05 performance claim.

## Review gates

- Owner review of the attached A/B contact sheets and exact pinned preview is required before replacing A or removing its implementation.
- This PR must remain separate from `main`; it is not production deployment authorization.
- Candidate hosted CI and the immutable Pages preview have not been produced because GitHub write authentication is unavailable in the current environment.

See [`README.md`](README.md) for the full report and evidence links.
