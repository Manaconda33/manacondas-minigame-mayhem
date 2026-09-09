# Slice 5 Blaze Orbs Scope

**Status: LIVE ACCEPTED. Amendment 2.13 / ADR-074 govern the complete contract below. Gameplay PR #135 is merged and deployed; Manny reported “Pass” on the deployed playtest on 2026-09-09.**

## Live acceptance — 2026-09-09

Gameplay PR #135 squash-merged to `main` at `a034d40e3185a17f3d5a04cbe330656fe7961b46` after hosted PR CI run `34403346241` passed on the exact reviewed head. Post-merge CI / GitHub Pages run `34403522142` passed clean install, Git LFS verification, strict typecheck, zero-warning lint, **42 test files / 339 tests**, production build, Pages artifact creation, and deployment.

Manny then tested the deployed Blaze Orbs build and reported **“Pass.” Blaze Orbs is LIVE ACCEPTED.** Product-owner evidence is also recorded on PR #135 comment `5608640298`. No independent browser/device matrix, recording, or per-scenario result set is asserted beyond Manny’s reported deployed playtest pass.

This acceptance closes the bounded Blaze Orbs increment only. Frost Orbs, Arc Blade, Arc Hammers, Ink Splat, Nitro Overdrive, and Hyper-Drive Rocket remain open, along with full AI item tactics, final Slice 5 interaction/counter/soak/performance evidence, issue #106, and overall Slice 5 acceptance. Slice 6 remains locked.

## Purpose and base

Continue from live-accepted Prismatic PR #133, main `3d79a7cb5291c53444cf3ae53f261b4a60ea9f0a`. Add one bounded item that proves rapid-fire inventory/cadence and ordinary-projectile counters. PRD section 15.7, amendment 2.2, and the approved item-system design already establish five charges, at least 0.55 seconds between shots, straight limited-lifetime projectiles, and a 0.55-second short spin per successful hit.

## Approved operational contract

| Behavior      | Contract                                                                                                                                                                                                                                                                            | Authority                                                   |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| Inventory     | Five charges in one slot; HUD counts 5 through 1; slot frees only after fifth committed shot.                                                                                                                                                                                       | Existing PRD/design                                         |
| Cadence       | First shot immediately eligible; later successful shots at least 0.55 race seconds apart. Rejected use spends no charge and starts no cooldown. Pause freezes cadence.                                                                                                              | Existing minimum; transaction detail proposed               |
| Controls      | One shot per ITEM press; holding does not auto-fire. Forward by default; Brake/Reverse + ITEM launches backward. No target required.                                                                                                                                                | Proposed operational detail                                 |
| Travel        | 42 m/s straight planar velocity, no inherited kart velocity or homing; radius 0.28 m; lifetime 3.0 race seconds.                                                                                                                                                                    | Proposed values; 42 m/s matches accepted Kinetic base speed |
| Placement     | Existing shared launch offset of 1.75 m plus radius in the requested direction; existing projectile height/terrain conventions.                                                                                                                                                     | Proposed reuse                                              |
| Contact       | Use shared swept/substep racer collision with the existing 1.05 m racer hit radius. Unfinished eligible racer receives one 0.55-second spin; orb is destroyed. No extra speed retention penalty, burning effect, splash, or damage-over-time.                                       | Short spin approved; operational exclusions proposed        |
| Walls         | Destroy on first guardrail contact; zero ricochets. Terrain/height queries retain shared course authority.                                                                                                                                                                          | Proposed                                                    |
| Owner         | Ignore owner for 0.18 race seconds; eligible normal contact afterward. Other racers can be hit during owner arming.                                                                                                                                                                 | General owner rule approved; duration proposed              |
| Repeated hits | Reuse accepted spin refresh to a full 0.55 seconds from each valid hit; never add durations or spin rates.                                                                                                                                                                          | Proposed reuse                                              |
| Immunity      | Prismatic/other active generic immunity absorbs an otherwise valid contact, destroys the orb, releases capacity, and causes no hostile spin/hit sprite.                                                                                                                             | Existing immunity boundary applied to new class             |
| Shockwave     | Destroy Blaze Orbs at horizontal distance <=5 m before same-step movement/contact. Outside range survives.                                                                                                                                                                          | Existing ordinary-projectile counter contract               |
| Capacity      | Each orb occupies one existing shared 40-object slot. Full capacity or failed commit retains charge; rollback releases any reservation/object.                                                                                                                                      | Existing capacity/transaction contract                      |
| Cleanup       | Expiry/contact/counter releases objects and presentation; pause freezes movement/arming/lifetime/cadence; recovery, finish, restart and disposal follow existing inventory/projectile ownership contracts. Fired orbs retain ordinary projectile lifetime after the owner finishes. | Proposed lifecycle detail                                   |

## Presentation

Original bright amber-orange energy orb with a small hot core, short ember trail, and finite launch/contact sparks. The visible orb must correspond to its actual position and remain readable in both cameras, including elevated track sections. Distinguish it from Kinetic's disc and Seeker's drone; do not create a persistent fire patch. A brief original launch/impact sound honors gesture unlock, master volume, pause, and disposal. No full-screen flash. Fixed/bounded procedural resources; final audio/VFX polish remains Slice 6.

All operational details in the table, including entries originally labeled proposed, were explicitly approved together with this scope. Those authority labels retain the distinction between baseline requirements and newly approved fill-ins.

## Engineering review findings

`itemDefinitions.ts` currently registers five Blaze charges without projectile configuration. `ItemSystem` owns charges but has no Blaze cadence timer. `ProjectileSystem` already supplies directional spawn, owner arming, shared capacity, guardrail/contact processing, and absorption. Extend configuration/dispatch and generic cadence ownership without silently applying cadence or Blaze presentation to accepted items. Review zero-bounce destruction and capacity rollback through actual runtime methods. Preserve Shockwave's target refresh and Prismatic's coherent per-step protection interval.

## Deterministic tests and live setup

Approved fixture parameters are not deployed links:

- `?testItem=blaze-orbs` forces the real five-charge pickup after collecting a box. Use for cadence, count, direction, camera and controls.
- `?testItem=blaze-orbs&testBlaze=hit` uses a visibly marked, stationary test rival on a suitable clear approach and waits for the held item and a real shot. It reports actual impact/effect application, never a miss as PASS.
- `?testItem=shockwave&testBlaze=shockwave` supplies one marked incoming production Blaze Orb, a measured counter window, and verifies destruction before contact. Failed timing or interception is distinct from successful countering.
- `?testItem=prismatic-invincibility&testBlaze=prismatic&testBlazePhase=protected|expired` launches a production orb only after successful activation, or after expiry for the control. Protected contact absorbs; expired contact spins. Stage, setup conditions, verified result and retry instructions remain visible.

Fixtures must validate allowed parameter combinations, enforce a reliable clear-course setup before measurement, preserve progress/checkpoint authority, and remain absent on normal URLs. No AI acquisition/use is enabled. A fixture that cannot deliver its intended encounter is inconclusive and must be corrected before being offered for acceptance.

Automated gate: exact charge/cadence boundaries and pause; invalid/roulette/finished/full-capacity/failed-commit retention; both directions at rest and speed; flight/radius/lifetime/arming boundaries; guardrail destruction; one-impact and repeated-hit refresh; protected/expired contact; Shockwave inside/edge/outside and same-step ordering; real runtime dispatcher/contact paths; cleanup/capacity/resource repetition; fixture isolation and verified outcomes. Run full existing validation, LFS and hosted clean-install CI. No dependency or test-gate relaxation.

Live gate: five shots and correct HUD; too-fast presses retain charges; forward/backward controls on desktop/mobile; short spin and camera/driver hit presentation; ordinary miss/wall/expiry cleanup; Shockwave and Prismatic counters plus expired control; pause/restart/recovery/finish/hub and sound cleanup; normal-build accepted-item/AI regressions. Record device/scenario evidence honestly and obtain Manny's acceptance.

## Boundaries and approval

No Frost, Arc Blade, Arc Hammers, Ink, Nitro Overdrive, Rocket, AI item tactics, probability changes, accepted balance changes, racer stats, track/checkpoint authority, dependencies, binary assets, or Slice 6 expansion. Existing moderate dependency audit warnings remain a separate issue.

Manny approved the complete scope in Work. Amendment 2.13 / ADR-074 and TESTING.md record that decision. Governance and gameplay publication are complete. Blaze Orbs is live accepted; Slice 5 remains incomplete pending the remaining item effects and final Slice 5 gates.
