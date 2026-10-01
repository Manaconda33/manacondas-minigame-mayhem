# AI drift and wheel dust review — 2026-10-01

## Authority and acceptance

Manny approved the bounded AI drift visual design and explicitly expanded it: “Approved. I think you should do the wheel dust for AI racers at the same time.” (2026-09-30, America/Chicago). “Continue” on 2026-10-01 resumes this same task. Canonical main `d1ccb41b0c413fed1376f82bdc332dd727bbb3d4` and CI/Pages `36802445247` were verified green. Diagnostics, kart optimization, player drift, player dust, gameplay/HUD/Results/audio and all existing manual acceptance remain LIVE ACCEPTED. This review does not reopen them.

AI effects are REVIEW ONLY. New-effect owner visual acceptance and separate merge/public production approval remain pending. No speed/FOV, bloom, blur, new binary assets, dependencies or next slice.

## Implementation and bounds

- One shared AI drift InstancedMesh and one shared AI dust InstancedMesh, independent of the accepted player pools. Low/Medium/High aggregate AI capacities are drift 48/96/144 and dust 32/64/96 across all seven opponents, not per opponent. Emission scales by the number of eligible opponents. This adds at most two visible main-pass submissions, no shadow submissions. Combined player plus AI driving pools cap at 160/320/480 particles; this does not certify the broader global 2,500-particle or frame-rate gate.
- Existing authoritative AI controller feedback drives blue sparks, orange sparks/flames, purple charge and purple boost-release cues. Tier-transition history is per racer; inactive racers still update history to avoid deferred catch-up bursts. Separate visual RNG preserves gameplay random draws.
- Only unfinished, non-spinout opponents within 60m of the camera and intersecting its frustum (3m conservative sphere) emit. Paused/hidden frames freeze without sampling ground. Countdown/whole-race finish clear; individual recovery/finish clears only that racer’s owned particles.
- Actual normalized named GLB wheel centers are captured before static batching removes wheel meshes. Procedural AI chassis fallback uses outside corners (±0.8m, ±0.9m). Read-only downward ground rays exclude dynamic bodies and the kart itself; shared track projection selects dirt/grass. Unsupported, airborne, idle and asphalt/boost/ramp wheels do not emit dust. Trails remain in world space and fade after emission stops.
- Reuse existing dust radial-alpha texture/material and existing drift vocabulary. Instance layouts compile at race startup. Disposal releases owned instance buffers, textures, geometry and materials once. The player’s single-emitter equations and limits remain intact; existing player VFX tests pass.

## Verification and review

The first shared-pool tests failed on missing multi-emitter support; the routing test failed on the missing AI visual group. After implementation, focused tests passed. A transformed-model fixture initially remained airborne because `respawn()` sets y=1.2; placing the fixture body explicitly on the ground fixed the fixture without changing physics. The modeled-anchor omission mutation failed at 1.775m against the 0.041m tolerance; removing visibility gates also failed the nearby shared-budget assertion. These red runs were observed in the session; temporary logs were lost during the overnight session pause, so they are not represented as retained files.

`validation.txt` retains the resumed final full checks: 89 files / 711 tests, strict typecheck, zero-warning lint, asset gates and production build passed. `git diff --check` and `git lfs fsck` passed. Existing Vite large-chunk and npm environment warnings remain unchanged. The independent read-only reviewer found no critical or important issues; the minor regression-coverage gap was closed with modeled anchors after batching, distance/frustum expiry, return without deferred purple burst, real spinout blocking and recovery/finish cleanup. Pool tests prove clearing one owner preserves another. No rendered/device/performance or owner visual pass is inferred from automated checks.

## Owner review

Use the private preview linked in `provenance.json`. Watch nearby opponents through corners in chase and rear view: blue/orange/purple drift cues and release pulses. Observe off-road wheels after an opponent crosses dirt/grass or is knocked off the road; dust should originate at the wheels and fade when returning to asphalt. Check restrained visibility, pause/resume and recovery/finish cleanup. Low/High still apply next race. Only these new AI effects require acceptance; do not repeat accepted Task 10/11/audio/player VFX matrices. Broader full-race hardware, global particle, browser and release gates remain open.

## Publication boundary

Review PR and owner-private playable preview are authorized. Public main stays unchanged until owner new-effect acceptance and separate merge/publication approval. Preview provenance pins exact canonical runtime/tree, root-base index/bundles/CSS, site source commit, saved version and deployment.
