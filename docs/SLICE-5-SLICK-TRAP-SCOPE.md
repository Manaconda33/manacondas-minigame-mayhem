# Slice 5 approved next increment: Slick Trap

**Status: IMPLEMENTED. PR #119 governance merge and post-merge CI/Pages passed; Manny explicitly authorized gameplay implementation. Publication/deployment and live acceptance remain pending.**

Baseline: `main` at `a2bd4e3a873bcd6a2b67789ebc06ac2c3ccfec76`. Nitro Surge, Ricochet Kinetic Disc, Homing Seeker Drone, Apex Orbital Missile core, and Timed Blast Orb are live accepted. The Timed Blast Orb checkpoint established the reusable `HazardSystem` and shared 40-object item-physics capacity. Slice 5 remains active; Slice 6 remains locked.

**Approval record:** Manny explicitly approved this Slick Trap scope as written on 2026-09-07 and directed that the stale ADR-069 Blast Orb status be corrected in the same governance checkpoint. PRD working amendment 2.9 and ADR-070 record the approved Slick fill-ins.

This approved scope does not modify gameplay code, item probabilities, balance values already approved for other items, racer statistics, track/checkpoint authority, assets, dependencies, AI tactics, or Slice 6 scope. The approved fill-ins below become implementation-authoritative only after this governance checkpoint merges and its post-merge CI/Pages gate passes.

## Existing governed Slick requirements

The current Slice 5 contract already requires:

- item ID `slick-trap`, one inventory charge;
- `HazardSystem` ownership;
- rear drop deployment;
- approximately **12 race-second lifetime**;
- approximately **1.1 m horizontal trigger radius**;
- approved **360-degree spin presentation** with approximately **60% speed retention**;
- no more than **two active Slicks per owner**;
- short owner-immunity/arming behavior followed by ordinary later self-interaction;
- future Shockwave removal within its approximately **5 m** counter radius;
- pause/restart/removal/disposal cleanup;
- normal rank probabilities unchanged;
- AI hazard avoidance remains required for Slice 5, but was explicitly deferred until both Blast Orb and Slick exist.

## Proposed implementation fill-ins

| Choice | Proposed initial behavior |
| --- | --- |
| Hazard ownership | Extend the accepted `HazardSystem` with a Slick hazard type while preserving accepted Blast Orb behavior. Hazard-clear queries operate generically across supported hazard types. |
| Shared capacity | Each active Slick consumes one slot from the accepted shared maximum of **40 active/reserved projectile + hazard objects**. A use that cannot obtain capacity is rejected without consuming the held charge. |
| Deployment direction | Slick is a **rear-only** item. Forward ITEM and Brake/Reverse + ITEM both place the Slick behind the kart; the direction modifier does not create a forward-thrown Slick variant. |
| Placement | Place the Slick approximately **1.75 m behind** the kart at the current track elevation, preserving the owner's lateral world position as much as the guardrail boundary permits. The Slick becomes stationary immediately; it receives no launch or inherited planar velocity. |
| Track boundary | The placed Slick is ground-bound. If placement overlaps a Circuit Alpha guardrail, resolve it inward by the minimum penetration correction rather than moving it toward the centerline or deleting it. Guardrail contact does not consume or trigger a Slick. |
| Owner immunity | Reuse **0.35 s owner immunity**, matching the accepted Blast hazard boundary. Other racers can trigger the Slick immediately. After 0.35 race seconds, the owner can trigger the lingering Slick normally. |
| Trigger | An unfinished, non-immune racer triggers the Slick when planar center distance is **<= 1.1 m**. No closing-speed threshold is required. The first valid trigger removes the Slick before applying its effect so one placement cannot hit multiple racers through repeated overlap. |
| Slick effect timing | Present exactly one **360-degree yaw spin over 0.85 race seconds**, reusing the accepted hostile-spin camera and perspective-correct `hit` / `frontHit` presentation. Player drive controls are suppressed during that presentation, matching the existing hostile-spin readability contract. |
| Speed retention | At trigger, scale the racer's current planar velocity vector to **60%** of its pre-trigger magnitude without increasing a near-stationary racer. Do not add the standard/heavy spinout's separate momentum-decay curve, extra impulse, damage, or hidden speed penalty. |
| Re-trigger semantics | A racer already in another hostile spin may have the Slick presentation refresh through the existing generic hostile-spin boundary, but one Slick resolves only once and is removed on its valid trigger. No stacked yaw rates are introduced. |
| Per-owner cap | Keep at most **two active Slicks per owner**. A successful third deployment atomically retires that owner's **oldest** Slick and replaces it with the new placement. The active count never exceeds two. A failed new use preserves the held charge and leaves both existing Slicks untouched. |
| Lifetime / pause | Slick lifetime is **12 race seconds** from successful placement. Time advances only with race simulation, so pause freezes lifetime. Expiry removes the mesh, releases shared capacity, and leaves no effect/VFX residue. |
| Counter boundary | Extend the existing queued hazard-clear boundary so a synthetic **5 m** Shockwave clear removes Slicks as well as Blast Orbs before Slick trigger processing in that simulation step. This proves the reusable boundary only; playable Shockwave remains deferred. |
| Generic immunity | Existing generic item immunity suppresses the Slick trigger/effect and leaves the Slick in place. Real Prismatic/Hyper-Drive interaction acceptance remains deferred until those playable items exist. |
| Presentation | Use an original lightweight procedural dark slick patch with a subtle animated/specular-style readability ring. No protected franchise silhouette, iconography, sound, or final Slice 6 VFX/audio polish. |

## Proposed deterministic acceptance instrumentation

- Reuse the existing `?testItem=slick-trap` player-only forced-pickup path.
- Add opt-in `?testSlickAhead=1`: after five race seconds, place one fixture-owned Slick approximately **8 m ahead** on the legal route for victim-side effect/camera testing.
- The fixture consumes no AI inventory, does not activate AI item tactics or hazard avoidance, shows a visible test badge, resets on race restart, and is absent from normal URLs.

## Proposed automated verification gate

Before publication review, automated evidence should cover:

- rear-only placement from both forward and backward ITEM intents;
- 1.75 m placement and zero inherited velocity;
- guardrail inward containment without deletion/trigger;
- shared 40-object capacity and charge preservation on capacity failure;
- two-per-owner cap, FIFO oldest replacement, and atomic failure preservation;
- exactly 12 race-second lifetime and pause freeze;
- 0.35-second owner immunity, immediate rival eligibility, and later legal self-trigger;
- trigger boundary immediately below/at/above 1.1 m;
- unfinished-racer and generic-immunity filtering;
- one-shot removal before effect resolution;
- 60% planar speed retention without accidental speed gain;
- one 360-degree / 0.85-second presentation with control suppression and accepted chase/rear `hit` / `frontHit` behavior;
- no repeated-overlap damage or stacked yaw rates;
- synthetic 5 m Shockwave clear and same-step clear-before-trigger ordering for both Slick and Blast Orb;
- expiry, explicit removal, restart, return-to-hub, and disposal returning hazard/capacity/VFX counts to baseline;
- `?testSlickAhead=1` isolation and normal-URL isolation;
- accepted Nitro/Kinetic/Seeker/Apex/Blast behavior and probability-selector regressions.

Run clean `npm ci`, `npm run validate`, `git diff --check`, Git LFS verification, and hosted PR CI before requesting gameplay publication approval.

## Proposed deployed live acceptance gate

1. `?testItem=slick-trap` resolves the governed one-slot pickup and successful use clears the inventory.
2. Normal ITEM use drops the Slick behind the kart; Brake/Reverse + ITEM also remains rear-only rather than throwing forward.
3. The hazard stays fixed in the world, remains readable, and expires at approximately twelve race seconds; pause freezes its lifetime.
4. Crossing the patch triggers at the expected approximately 1.1 m distance and produces a single readable 360 spin with roughly 60% carried speed, with correct chase/rear driver art.
5. Immediate spawn overlap does not self-trigger during owner immunity; returning after arming can trigger the owner's own Slick.
6. Two active Slicks from one owner coexist; a third successful placement replaces the oldest, never leaving three active.
7. `?testSlickAhead=1` produces a real victim-side Slick and restart removes/resets fixtures cleanly.
8. Normal unforced gameplay, Timed Blast Orb, Nitro, Kinetic, Seeker, and Apex remain unchanged.

## Explicitly deferred

- AI avoidance of Slick and Blast Orb. Once Slick itself is accepted, implement both hazard types together in the separately approved AI hazard-response increment.
- Playable Shockwave and real cross-item counter acceptance.
- Prismatic and Hyper-Drive immunity/contact interaction acceptance.
- Other remaining Slice 5 item effects.
- Issue #106 standings-display defect.
- Final Slice 5 cleanup/object-count soak and performance closure beyond evidence directly exercised by this increment.
- Slice 6.

## Governance / implementation gate

Manny approved the complete scope as written on 2026-09-07. This document, PRD amendment 2.9, ADR-070, `docs/TESTING.md`, and `docs/IMPLEMENTATION-STATUS.md` form the governance checkpoint. Gameplay implementation may begin only after this checkpoint merges to `main` and its post-merge CI/Pages run passes. Publication/deployment of gameplay and live acceptance remain later separate gates.

Any future change to the approved 1.75 m drop offset, 0.35 s owner immunity, 0.85 s spin presentation, 60% speed retention, third-placement FIFO replacement rule, immunity semantics, fixture behavior, or other governed fill-in requires the normal approval process before implementation tuning.


## Gameplay implementation checkpoint — 2026-09-07

The approved governance baseline is `2ce2212e5d89e192b9118ec07c655bacefbdf45a` (PR #119), with successful post-merge CI/Pages run `34151395918`. The gameplay implementation is on `feature/slice-5-slick-trap-implementation`.

`HazardSystem` owns both types, their shared clear ordering and disposal. Successful third Slick placement transfers the oldest owned capacity slot only after inventory commit; failure leaves both older Slicks intact. Slick's one-shot 0.6 velocity scale is separate from the generic yaw presentation, whose momentum-preserving option prevents standard/heavy decay from affecting Slick. The accepted camera and driver-frame contracts are reused.

A lightweight surface sampler uses existing track meshes for patch height/normal, including the raised ramp and boost pads; no track geometry or physics changes. The procedural patch sits 0.04 m above its supporting surface to avoid overlap. This is presentation geometry, not a change to the approved 1.1 m planar center trigger.

The eight deployed checks above remain pending. The gameplay PR records automated validation before publication review. Existing accepted items, probabilities, AI scope, issue #106 and Slice 6 gates remain as governed.
