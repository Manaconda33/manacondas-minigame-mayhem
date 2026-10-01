# Player wheel dust review — 2026-09-30

## Authority and preserved acceptance

Manny approved the bounded player-only off-road wheel dust proposal with “Approved.” in this continuation. Startup verified canonical main `fa87711c81590c3ebf19b195daa02602db677e3f` and CI/Pages `36798152620` success. PRD v1.1/amendments through 2.22; Slice 6 remains active. The post-drift handoff governs continuation. Diagnostics, kart batching and player drift are already LIVE ACCEPTED; Task 10/11, existing gameplay, controls, camera, HUD, Results, SFX/music and all existing owner acceptance remain passed.

This branch adds dust for the player only. Runtime owner visual acceptance, merge and public production publication remain pending. No AI dust/drift parity, speed/FOV, bloom, blur, automatic quality switching, avatar/binary asset change, dependency change or next slice is included.

## Implementation

- Cache four approved GLB wheel centers after normalized scale/yaw and before static batching removes source wheel mesh nodes. Procedural fallback uses its existing ±1.05m, ±0.98m wheel centers.
- At active, visible, unpaused race frames, sample each wheel's physical ground support with a downward ray (0.65m, excluding dynamic bodies and the player). Existing airborne feedback suppresses emission. Surface comes from the shared Circuit Alpha projection. These are read-only queries; driving physics and track topology are unchanged.
- Grounded dirt/grass wheels emit above 1.2m/s. Rate depends on planar speed and lateral slip, is capped per wheel, and is reduced for grass. Soil uses warm tan; grass uses muted earthy green. Asphalt, boost, ramp, idle and unsupported/airborne wheels stop new emission; old world-space trails fade.
- One InstancedMesh of camera-facing planes, one shared material and one procedural 32×32 RGBA radial-alpha DataTexture. Dust expands/fades over 0.45–0.65s. Low/Medium/High caps: 32/64/96 particles. Normal alpha blending, depth testing, no depth write, no shadows. Layout/material compiled at race startup; separate visual RNG leaves grid/item/AI draws unchanged.
- Pause/hidden freezes ages/emission; countdown/finish/recovery clear it. Race disposal releases instance buffers, texture, geometry and material once. Existing race restart/hub generation disposal applies. The component adds at most one visible main-pass draw call and 64/128/192 triangles by structural count; this is not a measured whole-frame/global-budget certification.

## Automated evidence

Fresh `npm ci` and clean baseline: 87 files / 693 tests passed; LFS fsck passed. Final full validation passed 88 files / 704 tests, typecheck, zero-warning lint, asset gates and production build; LFS fsck and diff checks passed. Focused and final full validation outputs are retained here. The initial new-module run failed because the dust implementation did not exist; the real runtime prewarm test subsequently failed before dust wiring. The first full run found seven missing-component errors in three older partial runtime fixtures; adding/disposal of the real dust component preserved all their existing gameplay assertions.

A reviewer identified missing InstancedMesh disposal; `instance-dispose-red.txt` reproduces the missing event, and the fix passes. The modeled-anchor regression was independently mutation-checked by omitting the capture: `anchor-red.txt` fails against fallback locations, then the restored implementation passes. Review findings and resolution are in `code-review.md`. No automatic test or build is labeled perceptual visual acceptance or hardware performance.

## Focused owner review

Use the private review preview linked in `provenance.json`, preferably Medium first. Only this new visual scope needs acceptance; do not repeat already accepted full-flow/Task 10/11/audio matrices.

1. Drive onto grass and the partial-width dirt line; compare muted grass puffs with warmer soil dust. Check wheel origins in chase and rear cameras, including a half-on/half-off-road line.
2. Compare rolling slowly, driving faster and turning/sliding. Dust should be restrained and respond to motion without obscuring driver, road or hazards. Stop and jump: no fresh airborne/idle dust. Return to asphalt: trail fades away.
3. Check pause/resume and recovery, then finish/Race Again/Return to Hub as dust cleanup spot checks. Confirm existing drift cues remain intact. Spot-check desktop and mobile visibility; Low/High use the same existing next-race preset application.

`?testRacePerf=1` remains optional for comparison. The previously accepted mobile baseline substitution stands; do not request another desktop prerequisite. Broader Slice 6 full-race performance, total 2,500-particle accounting, browser/device matrix, final quality and release gates remain open. No new hardware numbers are inferred.

## Publication boundary

Review branch/PR and sole-owner private preview are authorized by the approved scope. GitHub remains canonical. Production main and accepted public release remain unchanged. Owner runtime acceptance and a separate explicit merge/publication approval are required before production release. Preview provenance pins the canonical runtime source, exact root-base build and saved private version.

## Published review checkpoint

PR [#215](https://github.com/Manaconda33/manacondas-minigame-mayhem/pull/215) is open. Runtime source `1cfda76e2585d1a8df02122e39727195abae85ee` has the same tree as the final locally validated source; hosted CI [36800757799](https://github.com/Manaconda33/manacondas-minigame-mayhem/actions/runs/36800757799) passed. The sole-owner private review site deployed version 4 successfully. `provenance.json` pins the source/tree, root-base index and bundle hashes, preview source commit, saved version, deployment and archive hash. This subsequent evidence-only checkpoint does not change runtime. Main remained `fa87711c81590c3ebf19b195daa02602db677e3f`. Owner dust visual acceptance and merge/publication approval remain pending.
