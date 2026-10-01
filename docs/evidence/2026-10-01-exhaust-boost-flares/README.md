# Exhaust and ordinary boost flares — 2026-10-01

## Status and authority

**REVIEW ONLY.** Manny approved the bounded design with “Approved” on 2026-10-01 (America/Chicago): stronger high-speed exhaust and ordinary drift/pad/stunt boost flares for the player and nearby AI. Base main `8a7a5f9075519172c4266086564c3bf966dfac48`, CI/Pages `36872649961` verified. All prior acceptance through PRs #212–220 stays closed. No bloom, blur, next slice or wider speed/boost-polish completion is claimed.

## Implementation

One unlit, transparent additive cone InstancedMesh supplies rearward exhaust and short cyan/violet boost flecks. Low/Medium/High share caps of 24/48/72 instances across all eight racers, with 3/6/9 maximum per racer and at most one main-pass draw; no shadow casts, lights, textures, asset edits, dependencies or post-processing. Signed forward velocity is normalized to each kart's normal maximum speed; ordinary exhaust eases through the 70–100% speed band. Existing controller boost feedback adds a stronger flare, without simulation writes.

Normalized modeled `Exhaust_L` / `Exhaust_R` bounds are read before static batching and retained as root-local rear outlet anchors. Procedural fallback uses conservative twin rear anchors. AI uses a 60m camera-distance/frustum gate. Accepted purple drift boost pulses and Nitro Surge, the full Nitro Overdrive window and Hyper-Drive Rocket retain sole exhaust ownership while active. Pause/hidden freeze; countdown/finished clear; spinout/owner finish and recovery suppress/clear their own effects; race disposal releases owned instance buffers, geometry and material once. The batch is prewarmed at startup.

## Verification

Full local `npm run validate`: 91 files / 726 tests, strict typecheck, zero-warning lint, exact SFX/music/branding/runtime-asset gates and production build. `git diff --check` and `git lfs fsck` pass. Existing large-chunk and npm environment warnings remain nonblocking. Focused real-component tests cover bounded high-speed/boost rendering, no slow/reverse/invalid-speed emission, shared quality allocation, AI culling, captured modeled outlet geometry, independent owner cleanup, freeze/disable/disposal, real race velocity preservation and player/AI routing.

Initial effect/routing tests failed before implementation. Independent review found one Important overlap case: Nitro Overdrive exhaust is visible throughout its window, including gaps between pulses. A real-race regression reproduced ordinary exhaust during a zero-pulse active window; suppression now uses the full window's active state. Final verification follows this correction. No other Critical/Important review finding was reported.

Owner visual review of only these new effects and separate merge/publication approval remain pending. No rendered device or hardware/global-performance pass is inferred. Prior accepted flow, HUD, Results, audio, diagnostics, kart optimization, drift, dust and speed cues remain accepted.

## Private review checkpoint

Private version 7 deployed successfully: https://manaconda-race-diagnostics-review.manaconda2433.chatgpt.site. Canonical runtime `c26d2f97ace2859a2ab3b08302f123631c9b1926` / tree `da51b85ac2e4c79dc5973ccfcaaab835a61489b0` equals the locally validated runtime. Packaged index, both JS bundles and CSS match the root-base validated build exactly. `provenance.json` records the source commit, saved version, deployment, archive and file hashes. Root-base and Pages-base URLs intentionally differ. Public main is unchanged; owner visual and merge/publication approval remain pending.
