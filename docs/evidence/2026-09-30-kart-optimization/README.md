# Kart draw-call optimization review — 2026-09-30

Owner approved the focused optimization pass after the mobile baseline, before visual enhancements. Base main: 897b1ca603d9e1e5bd44377e379884a85f7caebb; diagnostics are live through PR #212. Current main CI/Pages 36790456527 passed. Preserve all prior gameplay/HUD/Results/audio/manual acceptance. Review publication is authorized; this new runtime's merge/production remains a separate owner gate. No VFX/bloom/blur/quality downgrade/next slice.

## Cause and bounded change

Source inspection found 5–30 separately submitted production kart parts, repeatedly sharing 4–6 materials. Each loaded kart mesh also casts/receives shadows. The existing Three renderer resets counters before shadow rendering, so exported calls include shadow plus camera submissions. A screenshot maximum of 321 cannot attribute the exact frame's work or prove a CPU/GPU bottleneck. This pass removes demonstrably redundant opaque static mesh submissions, without claiming to identify every call in that screenshot.

At GLTF load time, batch static opaque geometry by material identity, compatible attributes/index layout, shadow flags, layers, render order and culling policy. Bake mesh transforms into model-local positions/normals. Retain SteeringWheel and its descendants, named non-mesh attachment anchors, transparent/skinned/morph/instanced/mirrored/hidden/partial-range parts. Animated GLTF scenes bypass batching. Incompatible merges leave the original parts intact. Existing model forward correction, scale, driver anchors/sprite states, race movement, shadows, graphics presets, diagnostics, UI and audio remain authoritative.

No assets are regenerated or modified; texture/material references are reused. Replaced source geometry not shared with a retained part is released immediately; new merged geometry has race-owned idempotent disposal. Late AI loads cannot install/batch into a disposed race. This is a focused geometry submission change; broader pre-existing GLTF/material/world ownership is outside this pass.

## Structural evidence

`kart-submissions.json` parses all twelve actual production GLBs. Mesh submissions per fully visible camera/shadow pass change from 5–30 to 4–7 per kart. Triangles remain identical for each kart. These are structural counts, not whole-race render calls or frame-time measurements. Frustum culling now acts on each batch's combined bound: a partly visible kart can submit additional off-screen triangles, so actual totals vary by camera/grid/items/shadows. No <=250 or FPS pass is inferred.

The production-asset tests compare complete indexed vertex sequences grouped by material/shadow policy, including world positions, normalized normals and UVs to a 0.000002 floating-point tolerance; detect lost/reordered faces, wrong transforms/materials/shadows/UVs; retain dynamic controls and attachment identity. JSDOM cannot decode aa-07's eight embedded PNGs: only image decoding is stubbed; real GLTF geometry/material parsing runs and approved asset gates verify original bytes. The first equality attempt compared rounded strings and reported harmless Float32 rounding/signed-zero mismatches; replaced by direct numeric error measurement. All geometry comparisons then passed. No pixel-render equivalence is inferred.

RED evidence: missing helper (red.txt), missing player/AI wiring (routing-red.txt), deferred source-buffer retirement (ownership-red.txt). An initial routing-fixture syntax error was corrected before recording the meaningful assertion RED. Earlier local validation attempts found TypeScript/lint issues, corrected before the final full run; only final completed output is a passing checkpoint. GREEN/final validation logs are retained.

## Review and mobile comparison

Use Medium on the same phone, browser, orientation and power/display conditions as the accepted baseline. Drive an ordinary eight-racer three-lap race with accepted audio; compare current appearance in chase/rear views, all visible karts/steering/driver sprites and shadows. Finish, expand diagnostics and record/download before restart. Check restart/change-driver/hub cleanup. The previous mobile summary is 59.9 median FPS, p95 16.8 ms, max 116.7 ms, five >50 ms intervals, longest run two, max calls 321, max triangles 244,722. Random grid/items/camera affect maxima; retain raw JSON if possible and identify hardware/source/settings. A screenshot can record the visible summary under the owner's established evidence preference, but cannot verify its unseen metadata/samples.

Actual rendered/mobile comparison is pending owner review; private cloud browser historically has no signed-in owner session. Do not reclassify unit/source counts as measured device performance. Stop before runtime merge/production and visual enhancements.

## Review publication checkpoint

[PR #213](https://github.com/Manaconda33/manacondas-minigame-mayhem/pull/213), runtime `1caa47dddf3c0d2c14e7d7a38f57c09fb0a73eb4`, tree `a7587731ca5dedf538139f23303b80c8dc4ce8eb` matches local validated `86dd107`. Hosted [CI 36792153860](https://github.com/Manaconda33/manacondas-minigame-mayhem/actions/runs/36792153860) PASSED. Full local validation: 86 files / 682 tests, strict typecheck, zero-warning lint, exact asset gates and build; LFS fsck/diff checks passed. Existing large-bundle warning remains.

[Owner-private optimization preview](https://manaconda-race-diagnostics-review.manaconda2433.chatgpt.site/?testRacePerf=1) now serves this optimization build (same review origin, new saved version). Private deployment `appgdep_6abd9e01d0ec81919707e666bfc9f5cd` succeeded; source snapshot `bbea0e0ac3223b909f67050b3dd2491e54e07329`; `/review-build.json` stamps canonical source/tree and bundle hashes. Original accepted diagnostics baseline remains on public Pages for comparison. See `publication.json`. Actual mobile/visual review remains pending; cloud sign-in blocker is unchanged. Public main remains `897b1ca603d9e1e5bd44377e379884a85f7caebb`; do not merge/deploy this increment or start visuals without owner approval.

## Owner mobile comparison received

Manny supplied a complete-race Results diagnostics screenshot. See `mobile-comparison.md`: max calls 321 → 226 (29.6% lower), triangles 244,722 → 219,548, median FPS/p95 unchanged, >50 ms intervals 5 → 3, but maximum interval 116.7 → 233.5 ms. Draw-call target is met in this observed run; different grid/player and unverified raw metadata limit attribution. This supersedes the earlier pending mobile-summary wording. Explicit rendered-visual acceptance and merge/production approval remain pending.
