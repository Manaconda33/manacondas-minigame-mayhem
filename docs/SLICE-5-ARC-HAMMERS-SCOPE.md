# Slice 5 Kinetic Arc Hammers Scope

**Status: SCOPE APPROVED AND GOVERNANCE PUBLISHED. PR #142 MERGED AT `ba7e20ab69666ce04ba253a147c93b1ae985db8f`; POST-MERGE VALIDATION/PAGES `35124948452` PASSED. GAMEPLAY IMPLEMENTATION AND ASSET/PRESENTATION DEVELOPMENT REMAIN EXPLICITLY NOT AUTHORIZED.**

This document is the approved bounded product/engineering contract for **PRD amendment 2.16 / ADR-077**. Manny approved the complete contract on September 16, 2026 and explicitly directed that gameplay and asset development remain off the table. The governance publication gate is now cleared through PR #142 and post-merge validation/Pages. No further Hammer work is authorized by that publication. Gameplay and asset/presentation development require a separate later Manny authorization.

## Authoritative starting point

Governance is published on `main` at `ba7e20ab69666ce04ba253a147c93b1ae985db8f` after Rebounding Arc Blade live acceptance. Post-merge validation and GitHub Pages run `35124948452` passed.

PRD Section 15.10 is fixed authority for Kinetic Arc Hammers:

- five charges;
- at least **0.35 race seconds** between committed uses;
- ballistic trajectories;
- exactly one terrain bounce; and
- short post-bounce expiry.

The approved Slice 5 item-system design additionally fixes the standard **0.85-second spinout** for a valid Hammer racer hit, the existing one-slot/multi-charge inventory model, the existing rank probability weights, and the shared 40-object item-physics budget.

The operational values below are now approved fill-ins for behavior the PRD previously left unspecified. They are not yet implemented.

## Approved operational contract

| Behavior | Approved contract | Authority |
| --- | --- | --- |
| Inventory | Five charges in the existing one-slot inventory. One committed throw consumes one charge; the fifth frees the slot. Multiple Hammers may coexist if cadence and shared capacity allow. No refund after impact, counter, expiry, or cleanup. | Five charges are PRD-fixed; existing multi-charge inventory contract. |
| Input | One Hammer per ITEM press. Normal ITEM throws forward from current kart heading; Brake/Reverse + ITEM throws backward. Desktop E/Left Shift and mobile ITEM use the same directional contract. No automatic repeat or target prerequisite. | Approved fill-in using the existing directional-item input contract. |
| Cadence | First throw is immediately eligible. At least **0.35 race seconds** between successfully committed throws. Rejected/full-capacity/invalid use consumes no charge and starts no cooldown. Pause freezes the cadence clock. | 0.35 s is PRD-fixed; rollback/pause follow accepted item transaction rules. |
| Launch | Horizontal base speed **36 m/s** plus **0.20x** the owner's launch-time planar velocity, with inherited planar speed capped at **10 m/s** before scaling (maximum 2 m/s inherited contribution). Initial upward velocity is **11 m/s**. Backward use reverses only the 36 m/s launch axis; inherited owner velocity remains physical world velocity. | Approved fill-in. |
| Gravity | Apply constant **24 m/s² downward** world gravity to Hammer flight. No homing, steering, racing-line correction, speed boost-pad effect, or target magnetism. | Approved fill-in. |
| Size and spawn | Horizontal/contact radius **0.36 m**. Reuse the shared `1.75 m + projectile radius` directional launch offset and ordinary safe launch-height convention. A spawn overlapping a guardrail or lacking finite launch data is rejected atomically. | Radius approved; offset/rollback reuse accepted projectile conventions. |
| Terrain bounce | The first genuine descending contact with the actual supporting Circuit Alpha terrain/road surface produces the single PRD-required bounce. Resolve against the supporting-surface normal: retain **0.78x tangential velocity** and reflect the incoming normal component at **0.55x restitution**. Asphalt, dirt, grass, boost-pad and ramp supporting surfaces use the same Hammer bounce physics; terrain type does not add another item effect. | One terrain bounce is PRD-fixed; coefficients and surface-uniform treatment approved. |
| Post-bounce expiry | On the first terrain bounce, cap remaining lifetime to **0.75 race seconds**. Any second terrain contact destroys the Hammer immediately. A Hammer that never reaches terrain has a hard total lifetime of **2.25 race seconds** from launch. | Short post-bounce expiry is PRD-fixed; exact timers approved. |
| Guardrails | First guardrail contact destroys the Hammer. Guardrails never count as the terrain bounce and never ricochet the Hammer. | Approved clarification preserving the distinction between terrain bounce and wall contact. |
| Racer hit | First eligible racer contact applies the accepted standard **0.85-second spinout** through the existing RacerEffects / hit-sprite / camera path, then destroys the Hammer. No piercing, AoE, extra velocity multiplier, Frost stack, progress mutation, or repeated overlap effect. | 0.85 s already approved; destruction/no-extra-effects approved clarification. |
| Owner arming | Ignore owner contact for **0.18 race seconds** after launch. After arming, ordinary Hammer contact may hit the owner, including after the terrain bounce. Bounce does not reset arming. | Generic later self-hit is approved; 0.18 s approved item value matching accepted ordinary-projectile precedent. |
| Immunity | An eligible contact with an item-immune racer, including Prismatic, absorbs/destroys the Hammer with no hostile effect. Finished racers are skipped. Immunity does not reflect or preserve the Hammer. | Accepted ordinary-projectile immunity behavior. |
| Collision ordering | Resolve contacts chronologically along swept/substep travel. At the same collision time, **guardrail > eligible racer > terrain**. A destructive event ends that movement segment so a Hammer cannot hit a racer through a wall or bounce through a coincident racer. | Approved deterministic ordering. |
| Shockwave | A queued Shockwave clears an active Hammer at horizontal distance `<= 5 m` before same-step Hammer movement, terrain bounce, or racer contact. Outside-range Hammers continue normally. | Extends the accepted Shockwave ordinary-projectile boundary to the new class. |
| Effect coexistence | Hammer spin refreshes according to existing standard-spin rules. Nitro, Frost, Prismatic, drift charge, surface handling and race authority remain independently owned by their existing systems. | Existing generic-effects boundary. |
| Capacity and rollback | Each active Hammer owns exactly one slot in the existing shared 40-object item-physics capacity. Release exactly once on hit, immunity, Shockwave, wall, second terrain contact, post-bounce expiry, hard expiry, reset/disposal, or failed commit rollback. | Existing shared-capacity/transaction contract. |
| Owner lifecycle | A fired Hammer is independent of owner motion after launch and therefore is **not** cancelled by ordinary owner recovery or finish; it resolves through its short normal lifetime. Race restart, return to hub and runtime disposal clear all Hammer state. | Approved behavior matching ordinary non-homing fired projectiles; no Arc-Blade-style owner pursuit exists. |
| Pause | Pause freezes flight, gravity integration, cadence, arming, lifetime, post-bounce timer, procedural trail/rotation and Hammer audio. | Existing pause contract. |

### Ballistic integration requirements

Any later implementation must integrate the Hammer in bounded substeps so that the approximately 36-38 m/s horizontal launch range cannot tunnel through racers, rails, or the supporting surface. Gravity and bounce math operate in full 3D; racer proximity remains the existing item-contact geometry unless a test demonstrates a required vertical-contact refinement.

Terrain contact must be derived from the actual supporting race surface, including the raised/ramped presentation used by gameplay, rather than treating the flat Circuit Alpha centerline `y=0` as universal ground. A focused shared surface-query helper may be introduced if needed, but this increment may not redesign track geometry or kart surface physics.

The bounce is one physical event. Penetration correction, numerical resting contact, or a short post-bounce contact-suppression epsilon must not be counted as a second bounce. After the first real bounce, the next genuine terrain impact destroys the Hammer.

## Approved presentation contract

Use an original compact double-headed kinetic hammer silhouette built from procedural geometry, visually distinct from the Rebounding Arc Blade and from protected franchise item designs. Approved visual language:

- dark graphite core with cyan/amber energized edges;
- visible end-over-end rotation while airborne;
- short finite streak/trail that makes the ballistic arc readable without obscuring the track;
- a brief ground-contact ring/spark at the single bounce;
- a small impact flash on racer/immunity/counter resolution; and
- distinct short original launch, bounce and hit tones.

This is a future implementation contract only. **No asset creation, procedural model implementation, VFX implementation, audio implementation, or other presentation development is authorized by the current governance checkpoint.** Final production audio/VFX polish remains Slice 6.

## Engineering assessment

Current `ITEM_DEFINITIONS` already registers `arc-hammers` with five charges and the approved probability matrix, but it has no projectile/ballistic configuration. `ItemEffectDispatcher` therefore reaches no supported projectile or boost path for Arc Hammers and returns `unsupported`.

The current ordinary `ProjectileSystem` integrates planar constant-velocity projectiles and guardrail contacts; its special Arc Blade helper handles curved outbound/return travel. Reusing either path unchanged would not satisfy ballistic Y motion, supporting-surface contact, or the exactly-one-terrain-bounce contract.

If gameplay is separately authorized later, the bounded implementation shape is:

1. Add a focused Hammer ballistic state/helper within the existing `ProjectileSystem` ownership boundary rather than adding item logic to kart physics.
2. Reuse shared item capacity, inventory transaction, target snapshots, RacerEffects spin application, Shockwave queue ordering, generic immunity, resource cleanup and item presentation ownership.
3. Add only the supporting-surface query needed to resolve Hammer terrain contact across road/dirt/boost/ramp geometry; do not change Circuit Alpha race authority or kart surface behavior.
4. Keep Hammer tuning in configuration. Do not alter Kinetic Disc, Arc Blade, Blaze, Frost, accepted item balance, rank weights, AI inventory policy, dependencies, or binary assets.

Nothing in this engineering assessment authorizes implementation now.

## Approved acceptance instrumentation contract

Primary deployed review route after a separately approved gameplay publication:

`?testItem=arc-hammers`

This route will provide fixed Hammer pickups while preserving normal racing and unrestricted E / Left Shift / mobile ITEM use. It must not require stopping, a readiness countdown, or a target lock. Manny must be able to fire all five charges while driving and deliberately test forward/backward arcs and terrain bounces.

Optional incoming counter diagnostics may be implemented only if their measured encounter semantics are proven in runtime:

- `?testItem=shockwave&testArcHammerCounter=shockwave`
- `?testItem=prismatic-invincibility&testArcHammerCounter=prismatic&testArcHammerPhase=protected`
- `?testItem=prismatic-invincibility&testArcHammerCounter=prismatic&testArcHammerPhase=expired`

They may stage an incoming Hammer but may not grant AI inventory, alter lap/checkpoint progress, block ordinary player ITEM input, or claim PASS from a miss. A miss, rail interception, premature terrain expiry, recovery discontinuity, or unsuitable geometry is INCONCLUSIVE and retryable.

## Approved automated gates

1. **Inventory/cadence/input:** five charges, fifth-shot slot release, first-shot eligibility, exact 0.35 s boundary below/at/above, pause freeze, one throw per press, forward/backward intent, rejected/full-capacity/failed-commit rollback, and multiple simultaneous Hammers.
2. **Ballistics:** measured 36 m/s horizontal base, 11 m/s launch Y, 24 m/s² gravity, capped 0.20x inherited planar velocity, finite transforms, no homing/boost-pad acceleration, and deterministic behavior across frame/substep sizes.
3. **Terrain bounce:** actual supporting-surface contacts on asphalt, dirt, boost, grass-side/edge where reachable, ramp/elevated geometry and curves; one bounce only; 0.78 tangential retention / 0.55 normal restitution; 0.75 s post-bounce cap; second terrain contact destruction; 2.25 s no-bounce hard expiry.
4. **Contacts/order:** first guardrail destruction, valid racer hit before/after bounce, 0.85 s standard spin with actual player/AI hit sprite and camera integration, chronological contacts, same-time wall/racer/terrain priority, no piercing or duplicate overlap effect, finished-racer exclusion.
5. **Owner/immunity/counters:** owner arming just below/at/above 0.18 s, legal later self-hit, Prismatic/generic immunity absorption, protected/expired controls, Shockwave inside/edge/outside 5 m and before-movement/contact ordering.
6. **Lifecycle/capacity:** shared mixed-object 40-capacity pressure, failed-use rollback, repeated multi-charge use, restart/hub/disposal cleanup, pause, finite procedural resources/audio, and no leaked collider/object/listener/timer state. Include a repeated-use soak and a full-capacity stress case.
7. **Race authority/regression:** no direct lap/checkpoint/rank mutation, accepted item and AI hazard-response tests remain passing, Speed/Acceleration/Weight/drift/surface/recovery/camera/minimap/driver-state regressions remain passing, and normal URLs remain free of Hammer test fixtures.

Helper-only trajectory tests are insufficient. At least one integration path must exercise the real dispatcher, shared capacity, actual Circuit Alpha surface query, RacerEffects, and KartTimeTrial/controller contact/camera behavior without bypassing production rules.

## Approved deployed live gate

After separately authorized gameplay implementation, approved gameplay publication, and successful hosted CI/Pages:

1. Collect Arc Hammers in the fixed-item route and verify exactly five charges, ordinary roulette/HUD behavior, fifth-shot slot release and the 0.35 s minimum cadence; too-fast use retains the charge.
2. While racing normally, verify forward ITEM produces a readable forward ballistic arc and Brake/Reverse + ITEM produces a backward ballistic arc on desktop and mobile.
3. Observe a clean first terrain bounce on representative flat road and raised/ramp terrain, followed by short continued flight and then expiry/second-contact destruction. No rail contact may masquerade as the terrain bounce.
4. Verify an eligible rival hit before or after the bounce causes the accepted standard spin/hit presentation and destroys the Hammer without an extra velocity/progress effect.
5. Verify immediate owner overlap is safe during arming and a legitimate later self-hit is possible after arming.
6. Verify Shockwave clears an incoming Hammer inside the 5 m boundary and a deliberately outside/early pulse does not; verify Prismatic protected absorption and expired ordinary-hit control.
7. Verify chase/rear readability, original trail/rotation/bounce cue and audio, volume behavior, pause/resume, recovery/finish behavior, restart/return-to-hub cleanup and no stuck Hammer state.
8. Verify the normal build has no forced Hammer fixture and accepted Arc Blade/Frost/Blaze/Prismatic/Shockwave plus Slick/Blast AI hazard-response behavior remains regression-clean.

Record only checks actually observed. Automated trajectory/camera tests do not substitute for rendered live acceptance, and one unrestricted race pass does not automatically prove the counter diagnostics.

## Explicit boundaries

This approval does **not** authorize or change:

- **Arc Hammers gameplay implementation;**
- **Arc Hammers asset development, procedural model/VFX/audio implementation, or other presentation development;**
- item probability weights or dynamic distribution;
- accepted Kinetic Disc, Arc Blade, Blaze, Frost, Shockwave, Prismatic, Blast, Slick, Seeker, Apex or Nitro Surge behavior;
- racer statistics or kart physics;
- Circuit Alpha checkpoint/lap/race authority or track geometry;
- full AI item acquisition/use or tactical timing;
- Vision-Obscuring Ink Splat, Continuous Nitro Overdrive or Hyper-Drive Rocket;
- dependencies or runtime binary assets; or
- Slice 6.

## Approved amendment 2.16 text

Approved September 16, 2026. Kinetic Arc Hammers retain PRD Section 15.10's five charges, 0.35-second minimum cadence, ballistic travel, exactly one terrain bounce and short post-bounce expiry. Amendment 2.16 fills the operational contract with the values and ordering in this document: directional forward/backward use; 36 m/s horizontal launch, 11 m/s upward velocity, 24 m/s² gravity, 0.20x capped planar inheritance, 0.36 m radius and 0.18 s owner arming; one supporting-surface bounce with 0.78 tangential retention and 0.55 normal restitution; 0.75 s post-bounce and 2.25 s hard lifetime; first-wall destruction; standard 0.85 s spin and hit destruction; later owner self-hit; ordinary immunity/Prismatic absorption; Shockwave pre-movement clearing; deterministic collision ordering; shared 40-object capacity; pause/lifecycle cleanup; and bounded original procedural presentation. No other item, probability, racer, track, AI, dependency or Slice 6 requirement changes. Scope approval does not authorize gameplay or asset development; those remain separately gated.

## ADR-077: Bound Kinetic Arc Hammers to one physical terrain rebound

**Status:** Governance published through PR #142 at `ba7e20ab69666ce04ba253a147c93b1ae985db8f`; post-merge validation/Pages `35124948452` passed. Gameplay and asset/presentation development remain NOT AUTHORIZED.

**Context:** PRD Section 15.10 defines the Hammer identity but leaves launch physics, bounce coefficients, collision ordering, lifetime boundaries, defensive counters and lifecycle behavior unspecified. The current runtime has reusable inventory/capacity/contact/counter systems but no ballistic terrain-bounce projectile path.

**Decision:** Use the operational contract above. Keep any later ballistic Hammer state inside the existing projectile/item ownership boundary; sample the actual supporting race surface for the sole terrain bounce; preserve existing RacerEffects, Shockwave, Prismatic, capacity and race-authority contracts; and use the unrestricted fixed-item route as the primary live review experience.

**Rationale:** The approved numbers create a visibly lobbed forward/backward projectile with enough pre-bounce travel to matter at kart-racing speeds and a short, readable second arc without turning five charges into long-lived track clutter. A single surface-normal rebound expresses the PRD identity while wall destruction prevents the Hammer from becoming a second ricochet-disc system.

**Consequences:** A later authorized implementation will require bounded 3D ballistic/surface contact logic and additional deterministic tests, but no new gameplay subsystem, capacity pool, track rewrite, dependency, binary asset, or AI item policy.

## Approval gates

1. **Scope approval:** **COMPLETE.** Manny approved the complete contract on September 16, 2026 and explicitly kept gameplay and asset development off the table.
2. **Governance publication:** **COMPLETE.** PR #142 squash-merged at `ba7e20ab69666ce04ba253a147c93b1ae985db8f` after clean-head hosted CI `35124762217` passed; post-merge validation and GitHub Pages `35124948452` passed. Markdown governance and the 52-page Word PRD approval artifact are synchronized.
3. **Gameplay authorization:** **NOT AUTHORIZED.** Separate from scope/governance publication. Do not begin gameplay or asset development unless Manny explicitly authorizes it after the governance gate is fully cleared.
4. **Gameplay publication:** not applicable until separately authorized implementation exists.
5. **Live acceptance:** not applicable until separately authorized gameplay is deployed.