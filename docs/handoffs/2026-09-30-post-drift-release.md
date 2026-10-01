# Post-drift release handoff — 2026-09-30

## Start here

This supersedes `2026-09-30-full-race-diagnostics.md` for current continuation. Read AGENTS.md and its required project documents. Verify current GitHub main and CI; do not assume any SHA in this handoff remains head. The handoff itself is documentation only and changes no runtime files.

## Completed, accepted and published

- Full-race diagnostics: PR #212, runtime merge `4656206f2582bf859bbc75eb7151bda47622a3f3`. Optional `?testRacePerf=1`, raw RAF capture/export, renderer counters and Results availability. Preserve the existing simulation clamp and item diagnostics.
- Kart batching optimization: PR #213, runtime merge `99bcebe0d28c9c35bdcb8285221726a3e18eccf1`. Manny accepted unchanged appearance and approved publication. Static opaque source geometry batching preserves materials, triangles, world attributes, steering and anchors. No binary asset modifications.
- Player drift visual effects: PR #214, runtime merge `399bbbd6683332a1681b5f1e9d716ed18882644e`. Blue short rear-wheel sparks, denser orange sparks/flame flickers, purple charge burst and purple boost-release exhaust pulse. One reusable world-space InstancedMesh; caps Low 48 / Medium 96 / High 144; own visual RNG; shader/layout prepared before driving; lifecycle cleanup covered. Existing wheel glow/tones retained. Player only; AI drift visual parity is still open.
- Manny's final acceptance/authority: “Approved. Merge / publish release, please.” This accepts the supplied bounded drift review and explicitly authorizes that release. Do not reopen its acceptance or merge gate.
- Final reviewed PR head `1455561b3e202cff47e86dde416ebcd5bef24f85`: CI 36795775083 success. Runtime post-merge CI/Pages 36796770466 success. Delivered index, both JS bundles and CSS matched the accepted local production build byte-for-byte.
- Release-record main checkpoint `00a56d9c72fb83130b84f52af013fe1fc283b965`: CI/Pages 36797134799 success. Full validation: 87 test files / 693 tests, strict typecheck, zero-warning lint, asset/branding checks, production build and LFS fsck. Existing Vite large-chunk warning remains.
- Task 10 five-restart, Task 11 scenarios/full flow, desktop/mobile portrait/landscape HUD and Results/Podium, SFX/music and existing gameplay acceptance remain PASSED.

Production: https://manaconda33.github.io/manacondas-minigame-mayhem/

Evidence: `docs/evidence/2026-09-30-drift-vfx/` (owner acceptance, red/green/full validation, author self-review, preview provenance and production delivery), `docs/evidence/2026-09-30-kart-optimization/`, `docs/evidence/2026-09-30-medium-baseline/`.

## Performance scope and honesty

Manny expressly substituted the owner mobile race summary for the original desktop Medium baseline prerequisite. Do not ask for the same desktop capture again or relabel it desktop. Baseline screenshot: max calls 321, median FPS 59.9, p95 16.8 ms, max 116.7 ms, 5 intervals >50 ms. Optimization review screenshot: max calls 226, median FPS 59.9, p95 16.8 ms, max 233.5 ms, 3 intervals >50 ms. Different grids/player and clipped metadata limit controlled attribution. Raw JSON was not verified. Mobile screenshots support the recorded owner checkpoint, not a full PRD performance pass. Drift acceptance supplies no new numeric device measurement. Broader whole-race performance, global 2,500-particle accounting and browser/device matrix gates remain open. A 96-particle component cap is not a global budget certification.

## Next work and approval boundary

No further implementation is authorized by this handoff. The audit already recommends bounded driving VFX before post-processing. The next recommended bounded design discussion is off-road wheel dust (speed/slip/surface-driven, pooled and quality-capped), with remaining AI drift parity and restrained speed/FOV/common boost treatment tracked separately. Confirm the next scope with Manny before changing behavior. Do not repeat the completed audit or diagnostics/optimization/drift implementation.

No dust, AI drift effects, speed/FOV, bloom, blur, automatic quality switching, new asset work or next PRD slice has begun. Preserve all accepted gameplay, controls, boost physics, camera behavior, HUD, Results, audio and manual acceptance. Future runtime changes need a review PR/playable preview, owner runtime acceptance and separate merge/publication approval.

## Review hosting / native execution

Existing owner-private review project: `appgprj_6abd8e96a17081919b0934998de64bf8`; private version 3 contains accepted drift runtime. URL: https://manaconda-race-diagnostics-review.manaconda2433.chatgpt.site/?testRacePerf=1. Preserve sole-owner access and reuse the project, not a new site. It is a review deployment; public production is GitHub Pages above. Cloud browser reached the owner sign-in boundary, so no agent-rendered visual/device pass was claimed. Owner acceptance stands.

Native workspace implementation and separate author self-review were used; no agents were spawned. Prefer ordinary authenticated Git/LFS. If shell GitHub writes are unavailable, text source can use the connected GitHub tools; do not put LFS-governed binaries in normal Git. ADR-095's five approved music WAV exceptions remain narrow.

## Continuation prompt

Continue Manaconda’s Minigame Mayhem from GitHub (`Manaconda33/manacondas-minigame-mayhem`). Read `docs/handoffs/2026-09-30-post-drift-release.md`, AGENTS.md and its required documents, then verify current main and CI. Diagnostics, kart optimization and the first player drift effects are accepted and published through PRs #212–214. Preserve all existing acceptance; do not repeat the audit or request approval for completed work. First acknowledge the current state and propose the next bounded visual scope, with off-road wheel dust recommended. Wait for my scope approval before implementation. No bloom, blur or next slice.
