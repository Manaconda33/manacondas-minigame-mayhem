# T9.5 owner correction plan: Billboard approach signage and Service Tunnel portals

**Current result (2026-10-08): T9.5 OWNER APPROVED.** The following initial CORRECTIONS REQUIRED notes remain historical; the final verified correction and owner closure are recorded at the end of this file.

**Status:** Owner screenshot review: **CORRECTIONS REQUIRED / T9.5 NOT APPROVED**. This document records the agreed correction approach and is a **handoff/implementation plan**, not evidence that fixes were implemented.
**Date:** 2026-10-08 (America/Chicago)
**Repository:** `Manaconda33/manacondas-minigame-mayhem`
**Working branch:** `design/neon-grid-circuit-02` • runtime PR **#242 draft/unmerged**
**Last owner-reviewed pinned preview:** `https://manaconda33.github.io/manacondas-minigame-mayhem/previews/neon-grid-t9-5-portals/?review=64492df`
**Reviewed gameplay commit:** `64492dfbca7c4a5633880637ddbc5bcc05c34fde`
**Last pre-plan status checkpoint:** `7b409cbc4e28b5bf287ec9faf4c7854c459dc088`
**Known-good software gate:** runtime CI `37818513159` SUCCESS; 206 full-course max draw calls (200 optimization target / 220 T9.5 blocker), 168,790 visible triangles (300,000 limit), 300 scored SwiftShader frames. Workflow-only preview publication PR #280 merged into main at `26f3930`; GitHub Pages `37820169477` SUCCESS.
**PRD:** v1.1, approved implementation amendment 2.25. Do not alter the PRD's gameplay, handling, route, geometry/balance, AI, collision or performance requirements as a side effect.

## 1. Owner review: failure evidence

Manny tested the deployed `neon-grid-t9-5-portals` preview on **Android mobile portrait** and supplied four screenshots in the 2026-10-08 ChatGPT work session:

1. **Billboard lead-up (image 1):** The approved billboard ads no longer populate the visible approach. The raised camouflage wall remains, but the expected wall-attached and post-above-wall advertisements are not visible where the player needs to see them. **Do not interpret static mesh/instance counts as visual presence.**
2. **Tunnel approach (image 2):** The `DO NOT ENTER` warning is floating/offset relative to the actual underpass mouth rather than integrated at its opening and track walls.
3. **Tunnel junction (image 3):** An opaque dark/black wall continues to conceal or obstruct the physically legal entrance; the screenshot also contains a `WRONG WAY` overlay. Diagnose this overlay's circumstances but do **not** change direction/lap/gameplay authority on speculation.
4. **Opposite portal (image 4):** The warning is not mounted to the actual exit portal and reads backwards from the photographed driving view. Other portal scenery must not clip or occlude the kart or camera.

The earlier exterior-camouflage objective was accepted in principle. **Keep genuinely deep shortcut roadway concealed from the normal driving line, while making the true mouth discoverable and traversable from both directions.** Do not remove the masking system as a shortcut to a green render gate.

## 2. Bounded correction sequence

### C1. Reproduce and attribute visibility/geometry defects

- Reproduce all four screenshot camera/route situations in mobile portrait plus representative desktop chase and mobile landscape. Record actual player position, road progress, camera pose, loaded materials, mesh visibility and depth relationships as needed.
- Inspect `src/game/track/SkylineVisual.ts`, especially `addApprovedAds` (`skyline-ad-manaconda-racing`, `skyline-ad-taco-bell-live-mas`, `skyline-mask-roadside-billboard-supports`, `skyline-ad-supports`) and `skyline-roadside` opaque screen/fascia geometry. The implementation currently reports **eight static camouflage faces** (four facade-mounted, four raised) but images do not show appropriate approach presence. Identify occlusion, orientation, depth, anchor and texture reasons before modifying counts.
- Inspect `src/game/track/UndercityVisual.ts` (`addWallsideSightlineScreens`, `serviceTunnelApproachScreen`, opening logic and adjacent dark bays), `src/game/track/ServiceTunnelWarningVisual.ts` (currently samples tunnel fractions `0.015` and `0.985`) and `src/game/track/ServiceTunnel.ts` (`wallRange(side)`, `junctionContains` and legal road clearance).
- **Identify the exact black-wall mesh** and whether its obstruction is visual-only, physical, or an occlusion/camera artifact. Do not assume it is the hologram. Record evidence of the blamed object before editing.

### C2. Restore architecturally connected Billboard lead-up advertising

- Reuse the **existing owner-approved** `manaconda-racing-v1.webp` and `taco-bell-live-mas-v1.webp` textures without redesign or new imagery.
- Fix the actual view-dependent reasons the signs vanished. Position a readable mix of **directly wall-faced panels** and **elevated signs supported on posts tied into the screening wall**, extending throughout the relevant normal-road approach rather than behind the opaque wall. Confirm structural supports connect at each sign base; no floating geometry, billboard-face clipping or intersection with main/shortcut road clearance.
- Preserve the existing opaque camouflage and legitimate Billboard turn-in cue. Keep signs independent of Billboard's ON/OFF cycle. Preserve the eight-face approved display contract unless demonstrable technical evidence justifies a small reversible alternative; do not silently change the product scope.
- A passed instance-count test alone is insufficient: visual screenshots from early/mid/near approaches must show the *actual advertisement artwork*, readable from ordinary racer viewpoints, including mobile portrait.

### C3. Mount the approved holograms at the real Tunnel entrance AND exit

- Reuse the exact approved transparent `DO NOT ENTER / RESTRICTED SERVICE ACCESS` PNG, with unchanged source/runtime SHA-256 `11e540547d0a60da9db2ae7636e373742dec11c9f440afe08c5e29bdddaa7db4`; **no new art approval needed for moving existing approved asset**.
- Compute the two true portal cross-sections from the intersections of the legal tunnel edge and the surface-wall/opening boundary, using `ServiceTunnel.wallRange(side)` and the track's geometry or a similarly testable derived mount. **Do not simply reuse** fractions `0.015`/`0.985` and call them portal-aligned.
- Put the warning panel **on the opening's lintel/above the mouth, or spanning the upper opening as an integrated frame**. Connect it visibly to both side walls or correctly attached posts. Do not leave signage detached down-road, under the track, or floating in open space. Preserve >=3m tunnel headroom, accepted width and traversable kart/camera envelope; hologram and supports must be scenery-only, not colliders.
- Confirm each entrance/exit-facing sign reads **left-to-right** from its respective legitimate approach. Double-sided Three.js geometry can mirror text when viewed from the back; solve orientation explicitly with correct face normal or appropriate twin faces using the **same approved artwork**. Do not substitute a new image.
- Keep independent, smooth portal-proximity fade before the driver's/kart's camera passes through and preserve texture load/disposal/hidden-pause behavior. Preserve legibility on approach without obstructing inside-road visibility.

### C4. Eliminate the black-wall mouth obstruction without exposing the deep shortcut

- Once identified, **cut, shorten, reposition or reshape only the responsible facade/screen/panel segment(s)** so the real legal entrance and exit, immediate approach and chase camera remain clear.
- Preserve all deep-interior opaque mask geometry that passes real main-route LOS tests; do not remove the facade wholesale, insert wrong-way blockades, add colliders or change the accepted route, checkpoints or physics.
- Recheck sidewalls, floor/roof clipping, magenta ramp continuity, kart and road-ahead visibility; forward and reverse actual traversals must stay open, including when the player approaches deliberately from the other direction.

### C5. Add tests that enforce what the owner actually sees

- Expand `tests/neon-grid-stage4-t9-5.test.ts` and `tools/diagnostics/neon-grid-t9-5-render.mjs`/course fixture. Add deterministic geometry-mount and visual assertions for:
  - approved Billboard face textures loaded, visibly facing real normal-road chase/mobile portrait approach cameras, not fully depth-occluded by the fascia;
  - clear road/shortcut clearance and wall-contact/support endpoints for both mounted and raised ad families;
  - both warnings aligned to true computed portal openings, connected mounting geometry, right-reading text in each approach direction, depth-tested/transparent/non-colliding and faded when crossing;
  - absence of blocking dark wall, clip, camera-to-kart or kart-to-ahead-road LOS failures in both directions, while all in-frustum **deep** alternate-road targets remain concealed from the main route;
  - no false positive from an empty viewport, mesh/instance count, alpha=0, or an irrelevant far-camera viewpoint.
- Include mobile portrait (owner's reproduction), landscape, desktop chase and rear/interior samples; screenshot artifacts must be manually inspected. A missing or failed scene inspection means **not done**.
- Keep the existing owner-approved CI checks, source/PNG checksum verification, performance and geometry limits. Full-course **200 target / 220 blocking max**, 300k engineering triangles, PRD 250/750k caps, sector A/B limits and Falls +12 remain unchanged.

### C6. Validate, checkpoint and publish a NEW pinned review

1. Make only scoped changes on `design/neon-grid-circuit-02`; review any concurrent commits before edits. Do not restart from old source or accidentally overwrite another session.
2. Run strict typecheck, zero-warning lint, all tests, production build, asset/LFS verification, Task 8/Falls/Spillway, Skyline, Undercity, Falls extension and full-course T9.5 rendered gates. Fix any failure without weakening assertions. Record objective measured budgets.
3. Inspect actual rendered screenshots and the exact owner-reported mobile approach views; identify any unresolved occlusions or visual defects rather than assuming CI passing proves visual acceptance.
4. Update `docs/IMPLEMENTATION-STATUS.md`, `docs/TESTING.md`, `docs/DECISIONS.md` (only if a meaningful new decision is made), this plan and T9.5 evidence. Commit/push a verified bounded runtime checkpoint.
5. Publish using a **separate workflow-only preview-publication PR** that pins the exact runtime SHA, preserves older previews, verifies source markers, exact art bytes/hash, no production asset changes, and successful live GitHub Pages delivery. Do not call a URL live before verification.
6. Stop and ask Manny for **T9.5 mobile + desktop visual/playability PASS or corrections**. Maintain PR #242 draft and unmerged; no T9.6/T9.7 or gameplay production deployment without separate authorization.

## 3. Acceptance contract / owner gate

T9.5 correction is **ready for owner review** only when all are visibly and objectively true:

- **BB-01:** recognizable approved billboard artwork is visibly mounted **on and above** the camouflage wall during the lead-up, including mobile portrait; both styles have credible contact supports and do not reveal deep Billboard shortcut roadway.
- **TU-01:** entrance and exit each have a correctly oriented, legible owner-approved `DO NOT ENTER` warning **at the true portal opening**, attached to the surrounding walls/supports and not hovering down-track.
- **TU-02:** the specific black facade seen in image 3 no longer visually or physically blocks legitimate entrance/exit approach; actual bidirectional traversal and immediate turn-in are clear.
- **TU-03:** warning and wall geometry do not clip asphalt/vehicle/driver, conceal the kart or block the chase/rear camera or road-ahead view in full travel, mobile and desktop; warning fades without introducing a physical gate.
- **MASK-01:** deep Billboard and Tunnel shortcut asphalt remains occluded from ordinary approach viewpoints, while real portal mouths remain discoverable.
- **GATE-01:** all existing + strengthened CI and render budgets pass, documentation/evidence recorded, a new source-hash-pinned GitHub Pages preview verified live; old pins retained and production gameplay byte-identical.
- **OWNER-01:** Manny then reviews the *new* pinned gameplay build and explicitly approves or requests corrections. A green CI run does **not** close T9.5.

## 4. Authority and exclusions

This is a bounded **T9.5 correction** to already-approved asset placement/portal camouflage, not a new gameplay feature. The owner requested this correction and requested this documented handoff. **This documentation checkpoint executes no runtime fix, changes no asset and grants no implicit T9.5 acceptance.** Do not reorder T9.6/T9.7, replace approved 2D art, alter `WRONG WAY` gameplay rules, move physical entrances, change kart/camera dynamics for convenience, modify Task 8's frozen visual region, merge PR #242, or ship Neon Grid production gameplay. Escalate any material deviation for Manny's approval first.

**Next action for implementation session:** Start with C1 scene/geometry diagnosis on the latest repository head; then perform C2–C6, stopping at the owner-review gate.

## 5. Implementation and delivery checkpoint (2026-10-08)

**Status transition:** This document began as an implementation-only plan; its C1–C6 scoped correction has since been implemented and independently CI-verified. **New source-locked preview is READY FOR OWNER REVIEW, but T9.5 remains NOT APPROVED.** Historical plan language describing the next work as unstarted is superseded by this checkpoint, not deleted.

- Corrected code/checkpoint: `9b973d48c1115d4b35d3936a3eacbed8dbb7ed76`; full [CI 37826321830](https://github.com/Manaconda33/manacondas-minigame-mayhem/actions/runs/37826321830) SUCCESS, 1,039 tests, 34 full-course capture stations, 206 maximum calls (200 target / 220 blocker), 164,806 triangles, 300 scored SwiftShader frames, zero rendering errors. Geometry/raycast coverage checks full wall-end portal frames, image loading/occlusion, bidirectional drive/camera clearances and legal-mouth-vs-hidden-interior sightlines.
- Actual screenshot review: existing approved artwork appears along the Billboard wall, with close/signage mounts on both tunnel portals. Smartphone portrait approach framing is narrower, and the dark tunnel roof still warrants the product owner's subjective in-game visibility/camera judgment. The specific previously reported black wall is **not owner-cleared** by automated checks. Do not treat C2–C5 passing CI as OWNER-01.
- Preview-only PR [#282](https://github.com/Manaconda33/manacondas-minigame-mayhem/pull/282) merged `cee4b4f1241309d198faa87496f2a601d3191a96` after [PR CI 37857076512](https://github.com/Manaconda33/manacondas-minigame-mayhem/actions/runs/37857076512) success. [Pages 37857511926](https://github.com/Manaconda33/manacondas-minigame-mayhem/actions/runs/37857511926) PASSED live source/hash and unchanged production checks. **Owner link:** https://manaconda33.github.io/manacondas-minigame-mayhem/previews/neon-grid-t9-5-owner-correction/?review=9b973d4
- No PRD deviation, new artwork, physics/routing/AI/camera changes, PR #242 runtime merge, or production Neon Grid gameplay release. T9.6/T9.7 remain gated.
- **Next action:** Manny's owner desktop and Android mobile portrait/landscape playtest and explicit PASS/CORRECTIONS REQUIRED on BB-01, TU-01/02/03, MASK-01 and OWNER-01. Do not declare completion before then.

## 6. Final owner gate — APPROVED (2026-10-08)

Manny explicitly replied **“Approved”** to [the latest T9.5 owner-correction preview](https://manaconda33.github.io/manacondas-minigame-mayhem/previews/neon-grid-t9-5-owner-correction/?review=9b973d4), pinned to tested runtime `9b973d48c1115d4b35d3936a3eacbed8dbb7ed76`. This resolves **OWNER-01** and records acceptance of the reviewed BB-01, TU-01/02/03, MASK-01 and GATE-01 correction within T9.5. Older rejection/plan statements in sections 1–4 document what was wrong before the fix, not the present result.

[Source CI 37826321830](https://github.com/Manaconda33/manacondas-minigame-mayhem/actions/runs/37826321830) passed 1,039 tests, 34 render captures and budgets (206/220 draw calls; 164,806/300,000 triangles). Workflow-only [publication PR #282](https://github.com/Manaconda33/manacondas-minigame-mayhem/pull/282) and [Pages 37857511926](https://github.com/Manaconda33/manacondas-minigame-mayhem/actions/runs/37857511926) passed live-hash and production-preservation checks. No hardware performance pass is inferred. **Do not merge runtime PR #242 or begin T9.6/T9.7/production deployment without a separate next-step authorization.**
