# Circuit Alpha shadow-polish recreation — 2026-10-02

Recreated from the approved design on the current accepted Lunarcrystal production baseline. The unavailable original implementation/runtime/preview SHAs are not claimed as recovered or reproduced byte-for-byte. Manny explicitly authorized recreation.

One existing-direction dusk key light retains its color/intensity, now with a player-centered 144-unit orthographic shadow volume, 2048 map and light-space texel snapping. Player and nearby karts precede nearby opaque projectiles, at most twelve dynamic root objects within 55 m. Transparent/additive effects, sprites, hidden meshes and color-bloom energy cores do not cast; static environment policies remain unchanged. Low disables shadows. Bias -0.001 and normal bias 0.2. Race teardown releases the owned shadow resource once.

Automated coverage: distance retirement, nearest/capped root selection, energy exclusion, snapped movement, recovery across the course, Low, cleanup, render-boundary integration and delayed model/batching policy. Initial integration and energy-core regressions failed before fixes. Final validation and hosted CI are recorded in the publication checkpoint. Browser download failed in this environment; no rendered local pass or device-performance result is claimed.

Publication: runtime PR stays unmerged; a separate workflow-only PR publishes a SHA-pinned Pages review with a source marker. Require successful hosted PR CI, post-merge Pages deployment and preview delivery verification before presenting the gameplay link. Then stop for Manny's visual review. Production release needs separate approval.
