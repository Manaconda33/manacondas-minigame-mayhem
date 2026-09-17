# Slice 5 - Vision-Obscuring Ink Splat Scope

## Approval state

**Status:** APPROVED GOVERNANCE SCOPE - AI TUNING AMENDMENT APPROVED

**Product-owner approval:** Manny, 2026-09-16

**Governing PRD:** v1.1, approved implementation amendments 2.18-2.19 / ADR-079-080

This document defines the bounded implementation contract for Vision-Obscuring Ink Splat. The original 2.18 publication did not authorize gameplay, VFX, audio, or presentation development; Amendment 2.19 authorizes only the bounded AI impairment tuning described below. Tuned gameplay publication and live acceptance remain separately gated.

## Amendment 2.19 / ADR-080 - AI impairment tuning

**Status:** APPROVED TUNING AMENDMENT - bounded implementation update in progress

**Product-owner approval:** Manny, 2026-09-17

Live review of the merged 2.18 implementation found that its AI impairment was technically active but below the intended perceptual threshold. Amendment 2.19 supersedes only the three AI impairment constants below; all other 2.18 targeting, inventory, immunity, lifecycle, human presentation, architecture, and exclusion boundaries remain unchanged.

- Lateral target-path noise: **0.95 m amplitude**
- Reaction latency: **0.160 seconds**
- Steering precision multiplier: **0.74**

The tuning remains smooth, deterministic, legally road-bounded, and independent of AI speed, throttle, braking, acceleration, rubber-band, physics, and race authority. The active duration remains **2.50 race seconds**.

## Baseline preserved

- Slice 5 remains active; Slice 6 remains locked.
- Kinetic Arc Hammers and all earlier accepted item increments remain unchanged.
- Ink remains one charge in one inventory slot.
- The approved fifteen-item probability matrix remains unchanged: Ink weights by rank 1-8 are `0 / 0 / 2 / 4 / 6 / 7 / 8 / 8`.
- Ink remains a visual/AI impairment only. It adds no spinout.
- Full AI item acquisition/use and tactical timing remain deferred.

## Activation and targeting

1. Ink is instantaneous and direction-independent. Normal ITEM and Brake/Reverse + ITEM resolve identically.
2. Build the target set from the activation-time lap-validated race-progress snapshot.
3. Every unfinished valid racer strictly ahead of the owner is targeted. Use total validated progress (`lap + trackProgress`) after the runtime's existing checkpoint/wrap normalization.
4. World-space distance, line of sight, lane, facing direction, and camera visibility do not participate.
5. Equal total progress is not ahead. The owner is never a target. Finished or invalid-progress racers are excluded.
6. If the owner is finished/invalid or there is no valid racer ahead, reject activation, retain the item, and start no effect.
7. If at least one valid racer is ahead, commit the one charge exactly once. Per-target immunity is resolved after the valid target set exists, so an attack fully blocked by immunity is still consumed.
8. Target resolution is logically simultaneous. Deterministic iteration order may be used for tests but may not change who is affected.

## Immunity and repeat application

- Existing generic item immunity, including active Prismatic protection, blocks Ink application per target.
- Blocking Ink creates no hostile effect, hit spin, speed loss, or hidden substitute penalty.
- Activating immunity after Ink has already landed does not cleanse that active Ink effect.
- A valid later Ink hit on an already affected racer refreshes the remaining duration to **2.50 race seconds**.
- Repeat hits do not stack human coverage/opacity or AI path noise, reaction latency, or precision impairment.

## Human-player view effect

- Exact active duration: **2.50 race seconds**.
- Use multiple original organic screen-space Ink shapes rather than a single opaque wash.
- Peak obscured area is capped at approximately **35% of the viewport**.
- The effect appears immediately on successful application and fades monotonically over its remaining duration.
- Place the Ink layer above the rendered 3D race scene but below HUD, pause UI, results UI, and mobile touch controls.
- Position, lap, item/HUD information, and touch hit targets must remain readable and operable.
- Do not change player steering, throttle, brake, drift, ITEM input, speed, acceleration, handling, camera orientation, camera anchor, FOV, race progress, or checkpoint state.
- No rapid flashing, full-screen blackout, text obstruction layer, or camera shake is part of Ink.

## AI-equivalent impairment

During the same 2.50-race-second interval, affected AI receives all three bounded impairments:

1. **Lateral target-path noise:** smooth deterministic zero-mean signal with **0.95 m amplitude** added to the ordinary lateral target before final legal-road bounding. No frame-random jitter.
2. **Reaction latency:** **0.160 seconds** of steering/lane-decision latency. The implementation must use bounded simulation-history/buffered decision state rather than pausing the AI or withholding throttle.
3. **Precision multiplier:** **0.74** applied to steering correction authority for the Ink interval. This is an Ink-only steering precision effect, not a racer-stat mutation.

The AI impairment must preserve:

- existing legal-road clamps and kart margin;
- normal path continuity and ability to navigate the circuit;
- existing target speed, Speed-stat authority, pace/corner logic, acceleration, throttle and braking authority;
- existing bounded rubber-band factor;
- existing nearby-racer and accepted hazard-avoidance ownership;
- kart physics, drift mechanics, surfaces, checkpoints, laps, rank, and finish authority.

Ink must make AI visibly less precise without deliberately selecting illegal/off-road targets, teleporting, freezing, applying a hidden speed penalty, or creating an impossible navigation state.

## Lifecycle and coexistence

- Race pause freezes Ink duration, human fade, AI noise phase/history, reaction latency, and precision impairment.
- Player or AI recovery/respawn does **not** cleanse Ink. The same timer continues after recovery.
- Finish clears Ink immediately for that racer so results/victory presentation remains unobscured and no post-finish AI impairment persists.
- Racer removal, race restart, return to hub, and disposal clear Ink state and presentation resources.
- Frost, temporary boosts, Prismatic speed state, spinouts, surface response, collision response, and Ink keep independent ownership and timing.
- Ink itself never creates a hit/spin camera hold or driver hit-state trigger.
- Shockwave does not remove Ink because Ink is neither a persistent projectile nor a hazard.

## Architecture boundary

A later authorized implementation should add a focused `InkSplatSystem` that owns target application, remaining duration, refresh semantics, and read-only impairment/view snapshots.

Reuse:

- `ItemSystem` for request/commit/rollback and one-slot inventory;
- `ItemTargeting` for validated progress semantics, adding a focused all-racers-ahead query rather than world-distance targeting;
- `RacerEffects.isItemImmune()` or the existing generic immunity authority for per-target protection;
- `KartTimeTrial` only as orchestration/wiring;
- `AiDriver` through a bounded Ink impairment input/state seam;
- the existing race-view/HUD layering boundary for local human overlay.

Ink creates no projectile, no hazard, no world collision body, and reserves **zero** slots from the shared 40-object item-physics capacity. Do not move Ink behavior into kart physics or race/checkpoint authority.

## Original presentation contract

If later separately authorized, Slice 5 implementation may use original procedural/CSS/SVG/canvas-style organic splat silhouettes, finite drips/edge breakup, and one short original impact cue sufficient for gameplay readability. No production binary asset is required by this contract.

Do not copy protected franchise Ink silhouettes, animation timing, audio, iconography, or full-screen composition. Final mix/post-processing and broader production polish remain Slice 6.

## Deterministic acceptance instrumentation

Planned primary route:

`?testItem=ink-splat`

It should force Ink into the player inventory while preserving unrestricted normal driving and ITEM input.

Planned bounded diagnostics may include:

- an incoming-Ink fixture that applies a real Ink effect to the player after a visible/countdown setup without granting general AI inventory;
- a Prismatic protected case proving application is blocked;
- a Prismatic expired case proving ordinary Ink application resumes;
- optional diagnostic labels for actual target IDs, remaining duration, AI impairment state, and whether a protected encounter truly resolved.

A miss, no-target state, invalid target, already-finished target, or fixture that never reaches its intended resolution is **INCONCLUSIVE**, not PASS. Diagnostics may not mutate lap/checkpoint/rank authority, enable general AI item tactics, or block normal ITEM input.

## Automated evidence required before gameplay publication

Future implementation tests must prove at minimum:

- all valid racers strictly ahead are targeted, including cross-lap ordering and wrapped checkpoint-normalized snapshots;
- tied, behind, owner, finished, and invalid-progress racers are excluded;
- no-target activation rejects without consumption;
- a valid target set commits exactly once even if all targets are immune;
- mixed protected/unprotected target sets resolve independently;
- repeat hits refresh to 2.50 seconds without stacking effect magnitudes;
- Prismatic/generic immunity blocks application while active and does not retroactively cleanse landed Ink;
- pause freezes timers/fade/AI impairment; recovery preserves; finish/restart/hub/disposal clear as governed;
- human overlay state respects duration, bounded coverage, monotonic fade, and HUD/touch layering contract;
- AI noise is deterministic/smooth and capped to 0.95 m amplitude;
- 160 ms reaction latency and 0.74 steering precision are active only during Ink;
- AI target remains legally road-bounded and base speed/acceleration/rubber-band/race authority remain unchanged;
- Ink uses no shared projectile/hazard capacity;
- ordinary item probabilities remain unchanged;
- production `ItemEffectDispatcher`, `KartTimeTrial`, controller/input, AI-driver, race-progress targeting, immunity, HUD/view layering, pause, recovery, finish, restart, and disposal seams are exercised. Helper-only tests are insufficient.

All standard repository gates remain required: clean install, strict typecheck, zero-warning lint, full automated suite/coverage, production build, hosted PR CI, merge, post-merge validation, GitHub Pages deployment, and then product-owner live acceptance.

## Live acceptance matrix after a future deployment

The eventual manual review must cover at least:

1. one-charge held item and successful consumption;
2. all racers-ahead behavior in ordinary race conditions;
3. no-target rejection/retention;
4. human incoming Ink readability, partial coverage, monotonic fade, and approximately 2.5-second duration;
5. HUD and desktop/mobile touch controls remaining readable/usable under Ink;
6. repeat Ink refreshing without visually stacking into blackout;
7. AI visibly reduced precision while remaining able to navigate legally;
8. pause freeze, recovery persistence, finish clearing, and restart/hub cleanup;
9. Prismatic protected blocking and expired ordinary application;
10. normal unforced item distribution/race behavior with no fixture hijack.

Do not infer browser/device results that Manny does not explicitly report.

## Explicit exclusions

The original 2.18 governance checkpoint does not authorize or change the following. Amendment 2.19 authorizes only the bounded AI tuning update described above:

- Ink gameplay implementation;
- Ink VFX, audio, or presentation development;
- item probability weights or dynamic gap factor;
- any already accepted item tuning or counter behavior;
- racer statistics or kart physics;
- Circuit Alpha geometry, surfaces, checkpoints, lap/rank/finish authority;
- full AI item acquisition/use or tactical item timing;
- Continuous Nitro Overdrive or Hyper-Drive Rocket;
- dependencies or production binary assets;
- Slice 6 final presentation/polish.

## Approval gates

1. **Scope/governance approval:** COMPLETE - Manny approved this contract on 2026-09-16.
2. **Governance publication:** requires docs-only PR, hosted CI, merge, and post-merge validation/Pages.
3. **Gameplay/presentation authorization:** BLOCKED until Manny explicitly authorizes implementation after gate 2 clears.
4. **Gameplay publication:** later PR after implementation and full automated validation.
5. **Product-owner live acceptance:** later deployed manual review.
6. **Slice 5 closure:** still blocked by remaining item effects, full AI item-use/tactics, all-item interaction/counter evidence, soak/performance, final desktop/mobile full-slice acceptance, and other recorded closure gates.
