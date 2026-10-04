# Entrance/exit wall correction — validated, owner retest pending

2026-10-03; baseline ba76bb9, diagnosis checkpoint b73e779. Manny authorized the bounded wall correction, validation, checkpoints and replacement pinned Pages preview. Preserve the existing full owner PASS for everything else in Task5; PR242 remains draft/unmerged; no production runtime release, Billboard, Dive or Stage4.

## Cause and correction

Separate fixed7m/9m apertures did not describe the angled road joins. Tunnel right wall overlapped main entrance driving space; left wall overlapped exit driving space. Exact3.2m edge calculations intermittently failed `<=3.2` due to Float64 rounding, leaving main wall cells in the mouth. Whole-cell midpoint omission also left tips/gaps at the join.

Each side now ends at its actual main-road footprint intersection. Entry/exit distances: left4.203232/9.623869m, right8.561454/4.315846m. Scripted tunnel containment uses those same side endpoints. Main wall cells are clipped to the actual tunnel edge, with a10micron numerical tolerance and bounded endpoint neighborhood. Wall lower/upper ends meet the main wall's -0.15/+1.4m corners; render-only height tapers return to original tunnel floor/+3m over6m. This supersedes the old wall deferral.

Scope: NeonGrid.ts boundary lookup, ServiceTunnel.ts junction geometry, ServiceTunnelGeometry.ts wall-only rendering, NeonGridGeometry.ts main-wall-only partial clipping, regression tests/docs. Floor/roof geometry, main-road/climbing patch, authored endpoints/chord, 7m traversal activation, widths, native collision flags, controller/physics/barrier response values, gates/AI/Rocket/items/camera, accepted Alpha and assets remain intact. No PRD deviation.

## Evidence

- `probe-before.jsonl` and `probe-after.jsonl`: 1m longitudinal samples of both side edges, local/main heights/widths and aperture predicates.
- `regression-red.txt`: corrected independent baseline6FAIL/1PASS, exposing exact-edge rejection, two tunnel-wall intrusions and two main-wall tips. Interior-lane transition control already passed.
- `corner-red.txt`: horizontal-only correction still fails3D corner comparison; final taper resolves it.
- `regression-green.txt`: five focused files/29testsPASS, including native ramp/support/camera, three-profile three-lap ordered AI and navigation/item regressions.
- `validation.txt`: full117files/885testsPASS, typecheck, zero-warning lint, approved assets and production buildPASS. Coverage91.51/82.49/92.30/93.64percent; existing npm environment and Vite large-chunk notices remain. `git diff --check` and `git lfs fsck`PASS.
- Independent read-only review: no Critical/Important/Minor findings after the corner follow-up. Main wall indices valid/nondegenerate, all8corners match within0.023m, wall heights restored exactly by6m; tunnel floor/roof buffers and indices unchanged. ±1cm probes on outside lane3.3m verify containment before/after each distinct wall endpoint.

A local browser render attempt could not launch because Chromium was absent; its download failed. No screenshot/WebGL/device/owner wall acceptance is claimed. Geometry/native regressions and owner focused playtest are distinct evidence. All previous accepted tunnel behaviors stay accepted.

## Delivery gate

Save validated runtime and verify exact hosted CI before repinning only the Service Tunnel Pages preview. Preview-only workflow merge may update main governance, but production src/public and root delivery bytes must remain unchanged. Preserve accepted5.3 preview pin9459bf0. Record pin/CI/preview PR/Pages delivery in publication evidence, then stop for owner entrance/exit retest. Task5 remains open until that retest passes.

## Delivery completed

Runtime92025b5 / CI37152562581 SUCCESS. Preview-onlyPR250 CI37159582801 SUCCESS, merged28889be. CI/Pages37159670060 SUCCESS including unchanged production hashes before publication and all14live files/source markers after deployment. Hosted expected hashes exactly match the local preview/production/accepted5.3 hashes; independent refetch also passes14HTTP200/byte-length/SHA256/source checks. Artifacts11286562717 /11287476654 are archived as delivery-expected.json/delivery-verified.json; fresh fetch is delivery-refetch.json.

URL: https://manaconda33.github.io/manacondas-minigame-mayhem/previews/neon-grid-tunnel/?review=92025b5

Final delivery checkpoint synchronizes the preview-only workflow onto the runtime branch and records documentation only; src/public match92025b5 exactly. Owner entrance/exit wall retest remains pending; all other owner-reviewed gameplay remainsPASS. STOP for owner feedback.

## Owner acceptance closed — 2026-10-03 America/Chicago

Manny approved the delivered replacement preview: entrance/exit wall retestPASS. Combined with preserved remainderPASS, Stage3Task5 owner acceptance is COMPLETE/PASS. See ../owner-playtest.md. This supersedes pending-owner entries above. Docs only; runtime/preview/production unchanged, no new tests claimed, PR242 draft/unmerged. Stop for Manny's next session; approved Task6 design input is already saved at84ea856.
