# Slice 5 next increment: Apex Orbital Missile core

**Status: PROPOSED for Manny's scope approval; no Apex implementation authorized by this document.**

Baseline: Seeker Drone is live accepted on 2026-09-07, following Nitro Surge and Kinetic Disc. PR #108 gameplay merge `ef5dbaeccde123faedd00f625cf18e32c07875de` passed CI/Pages `34086473571`; main documentation checkpoint `bea7a5fe4799d64eebde86a1746663dc001ebf4a` passed CI/Pages `34086652360`. Diagnostic PR #109 is closed unmerged. PRD v1.1 amendment 2.6, section 15.5, ITEM-007, and the approved Slice 5 design remain authoritative.

## Intended result

Make Apex usable through the existing player inventory: vertical launch, non-colliding sky travel, lock on the current unfinished leader, readable warning, terminal dive, and a heavy radial blast. Reuse validated progress targeting and the accepted spinout/camera system. This follows Seeker with the second guided item and establishes the global launch gate and area-effect resolution used by later items.

This is a bounded core checkpoint. Shockwave and Prismatic are not yet implemented. Add and test the counter boundaries now; retain real cross-item verification as an explicit later gate. Core live acceptance must not be described as complete Apex counter acceptance or full Slice 5 acceptance.

## Existing approved requirements

- One inventory charge, consumed only on successful launch.
- Vertical launch and non-colliding sky travel; target whoever is first at terminal lock using validated race progress, not physical proximity.
- Approximately **2.5 seconds warning**, **5.5 m blast radius**, and **1.20-second heavy spinout** in the terminal AoE.
- **One active Apex globally** and at least **18 race seconds between successful global spawns**.
- Prismatic immunity prevents blast damage. A precisely timed Shockwave can neutralize Apex during its terminal state.
- Preserve rank weights `0, 0, 0, 1, 3, 8, 11, 13`, existing gap weighting, one-slot inventory, pause-safe simulation, and the 40-projectile limit.

## Proposed implementation fill-ins

These choices become implementation authority only after Manny approves this scope. Record them in a new PRD amendment and ADR before runtime implementation; material changes return for review.

| Choice | Proposed initial behavior |
| --- | --- |
| Leader lookup | Select the unfinished racer with greatest normalized validated lap + progress; use stable racer ID for exact ties. Reuse the Seeker offset-finish normalization without writing race progress. Include the owner: a racer who becomes leader while holding/firing Apex can be targeted. Reject activation if no unfinished rival exists. |
| Launch | Ignore reverse input. Rise vertically from the owner's launch position to **24 m above local track height over 0.6 s**. No racer/rail collision during rise or sky travel. |
| Sky travel | Move toward a point 24 m above the current leader at at most **96 m/s**. Re-evaluate the leader until terminal lock. Begin lock when within **1 m** of that point; clamp movement to prevent overshoot. Abort sky travel after **10 s** without lock; total lifetime ceiling **15 s** from launch. |
| Terminal lock and warning | Lock the current leader's identity when sky arrival completes. Show a target marker plus player HUD and distinct synthesized audio when the player is targeted. Warning-to-blast interval is **2.5 s**: **1.9 s overhead warning**, then **0.6 s terminal dive**. Escalate at dive start. Respect master volume, pause, and browser audio restrictions. |
| Locked pursuit and dive | During warning, remain above the locked racer, moving horizontally at at most **96 m/s**. During dive, reduce height continuously to track level over 0.6 s while tracking that same racer horizontally at at most **60 m/s**. No position teleport. Later rank changes do not retarget. Blast at the missile's actual terminal ground position, so recovery/displacement can cause a miss. |
| Target loss | Before lock, follow the new current leader if the prior leader finishes/leaves. After lock, a finished/missing target cancels the attack and clears its warning; do not silently transfer the locked attack. Owner finish after launch does not cancel an attack on another valid racer. |
| Terminal collision and blast | Dive ignores ordinary racer/rail contact; it resolves once at dive completion unless countered/cancelled. Apply **1.20 s** spin once per unfinished racer whose kart center is within the **5.5 m horizontal radius**, including the owner. This follows the approved explosive effect taxonomy; no new impulse, damage, or speed multiplier. Reuse existing spin refresh and perspective-correct hit presentation. |
| Global availability | Replace the foundation's selection-time timestamp with one race-owned successful-launch timestamp and active state. Selection filters Apex while active, within the 18 s cooldown, at full projectile capacity, or without an unfinished rival. Holding an Apex is not an active missile and does not reserve the global slot; multiple racers may hold one. Activation atomically rechecks availability. |
| Consumption and cooldown | Failed use preserves the charge and gives brief feedback. Only successful spawn/charge commit starts the cooldown; rollback releases all reservations. A cancelled, countered, or expired missile releases the active slot but retains its launch timestamp. Pause freezes the cooldown; new race resets it. |
| Capacity | Reserve one of the shared 40 projectile slots for the missile's entire lifecycle, including non-colliding phases. Release it exactly once on every removal path. This conservative counting prevents terminal transitions from exceeding the cap. |
| Counter boundary | Generic immunity skips each protected racer's blast effect independently. A Shockwave query clears Apex only during the 0.6 s dive and only when the missile lies inside the pulse's **5 m 3D radius**. The pulse resolves before missile movement/blast for that simulation step. Rise, sky, and overhead warning cannot be cleared by Shockwave. |
| Presentation | Original procedural missile, overhead target ring, dive trail and short blast tell. Reuse existing HUD feedback and safe audio lifecycle; no new raster character art or final Slice 6 polish. |

The 18-second interval is between actual launches, not pickups. Inventory holders can therefore encounter a temporary use rejection after another racer launches; their charge stays available. Forced pickup may exercise these cases but must not bypass the launch gate.

## Implementation boundary and fixtures

1. Extend item-domain targeting, lifecycle, availability, and generic area-effect/counter capabilities. Keep `KartTimeTrial` responsible for orchestration, not item-specific physics inside the controller.
2. Support actual player inventory activation and normal selection eligibility. General AI tactical firing remains a separate increment; existing AI inventory collection must still obey the shared availability state.
3. Reuse `?testItem=apex-missile` for outgoing pickup. Add opt-in `?testApexIncoming=1`: after five race seconds, then no sooner than the shared 18-second launch gate permits, launch from a fixture position 45 m behind the current leader. It must use normal leader targeting, not secretly force the player as target; drive into first to test incoming warnings. A visible badge identifies the fixture. No AI charge is consumed.
4. Add automated synthetic counter tests against production boundaries; no fake player counter controls or playable Shockwave/Prismatic are included. Real item integration tests and live counter acceptance remain mandatory when those items are implemented.
5. Preserve accepted Nitro, Kinetic, Seeker, controller/camera/sprite behavior, probability tables, and race authority. Issue #106 remains future development. No standings fix, new character art, dependency/workflow changes, or Slice 6 work is included.

## Verification and review gates

Automated evidence must cover leader changes before and after lock; exact ties; lap/offset-finish wrap and adjacent unrelated track sections; owner becoming leader; target/owner finish; no-rival rejection; one-charge success and failure rollback; two inventory holders activating in the same step; selection filtering; exactly 18-second cooldown and pause/reset; one-global-active and shared capacity; bounded rise/sky/dive movement; warning timing/volume/cleanup; lifetime; 5.5 m blast boundaries and collateral/owner hits; per-racer immunity; terminal-only Shockwave timing/range and same-step ordering; no repeated blast damage; and disposal/restart with no surviving objects or audio. Use actual Circuit Alpha paths as well as isolated state transitions, including full-speed leaders and leadership changes near the lap gate.

Run `npm run validate`, `git diff --check`, Git LFS verification, and clean-install PR CI. Preserve accepted regression suites. Record repeated-launch cleanup and bounded lifecycle counts. Publish only after separate merge/deployment approval, with exact source and CI/Pages evidence.

After approved deployment, Manny's core live gate covers:

1. Pickup/use, vertical launch, readable sky travel and forward-only activation on desktop/mobile.
2. Current-leader selection, changes before lock, and fixed identity after lock.
3. Incoming warning, 2.5-second interval, dive, volume, pause/resume and cleanup while driving in first.
4. Blast radius/collateral feel, 1.20-second heavy spin and accepted chase/rear driver perspective.
5. Global active/cooldown rejection preserving the charge, then successful use when eligible; restart reset.
6. Normal unforced URL and regression checks for Nitro, Kinetic, Seeker, and ordinary race progression.

Record core acceptance separately from **pending real Shockwave/Prismatic counters**, AI tactics, full-slice soak/performance evidence, and final Slice 5 acceptance. This proposal does not unlock Slice 6.
