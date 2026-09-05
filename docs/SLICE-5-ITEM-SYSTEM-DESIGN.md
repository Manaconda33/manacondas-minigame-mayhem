# Slice 5 Item System Design and Exit Checklist

## Approval state

**Status:** APPROVED FOR IMPLEMENTATION DESIGN CHECKPOINT

**Product-owner approval:** Manny, 2026-09-05

**Implementation authorization:** Documentation and approved Slice 5 implementation are authorized after this design checkpoint is merged. This document does not itself mark any Slice 5 gameplay requirement complete.

**Governing PRD:** v1.1, working implementation amendment 2.2.

The existing PRD Sections 15-17, ITEM-001 through ITEM-008, AI-004, Slice 5 roadmap requirements, probability matrix, item state machines, and existing item values remain authoritative except where amendment 2.2 explicitly resolves previously unspecified implementation behavior.

## Reconciliation baseline

At approval:

- Slice 3 is complete and live accepted.
- Slice 4 AI/grid work was completed earlier out of PRD order and remains retained.
- Slice 5 is the next incomplete roadmap slice.
- `src/game/items/` contains no item implementation beyond scaffolding.
- The existing fifteen-item probability matrix remains unchanged.
- No competitive-balance experiment is reopened by Slice 5.

## Design principles

1. Preserve the approved fifteen-item roster and probability matrix before tuning from live evidence.
2. Keep item balance in configuration rather than scattered switch logic.
3. Keep `KartTimeTrial` as race orchestration rather than making it the permanent home for every item behavior.
4. Expose generic racer effects such as spinout, speed retention, handling modifiers, immunity, and temporary boost instead of teaching kart physics about item names.
5. Make targeting and AI decisions use validated race progress and shared track topology.
6. Treat cleanup, pause, restart, and disposal as first-class state-machine behavior.
7. Preserve original Manaconda's Minigame Mayhem presentation; no item silhouette, icon, effect, sound, or naming may be a direct franchise replica.
8. Final production-grade audio/VFX polish remains Slice 6; Slice 5 still requires readable original placeholder/procedural presentation sufficient for live gameplay acceptance.

## Approved architecture

### `itemDefinitions`

Owns all fifteen item definitions, tunable constants, charge counts, lifetimes, cadences, prerequisites, and the complete rank probability matrix as configuration data.

### `ItemSelector`

Owns rank-weighted selection, dynamic gap adjustment, runtime prerequisite filtering, renormalization, deterministic/seedable test selection, and global availability restrictions.

### `ItemSystem`

Owns racer inventories, roulette state, activation, global cooldowns, active-object lifecycle, item-use dispatch, pause/resume timing, and cleanup coordination.

### `ItemBoxSystem`

Owns rendered/triggered pickup boxes, collection eligibility, shared-world deactivation, and 4.5-second respawn.

### `ProjectileSystem`

Owns projectile spawn, arming, movement, collision, bounce/return behavior, target guidance where relevant, expiration, and destruction.

### `HazardSystem`

Owns Blast Orb and Slick placement, arming, lifetime, trigger behavior, per-owner caps, and cleanup.

### `RacerEffects`

Provides generic runtime effects used by items without coupling the kart controller to item names: standard/heavy/short spinout, speed retention, handling multiplier, temporary boost, immunity, hostile-contact effect, warning state, and effect expiry.

### `ItemTargeting`

Uses validated race progress for leader, nearest-valid-ahead, racers-ahead, and racers-behind queries. Visual distance alone is not authoritative for Seeker or Apex targeting.

### `RocketAutopilot`

Uses Circuit Alpha's shared spline/topology to drive the Hyper-Drive Rocket state through the legal race corridor and to perform automatic overtakes without teleporting or directly mutating lap progress.

### `AiItemPolicy`

Runs alongside AI steering. It considers rank, race-progress gap, target distance, rear attackers, nearby projectiles/hazards, track geometry, and current item, while leaving steering/lane selection in the existing AI driving system.

### HUD integration

Displays roulette, held item, active state where necessary, and remaining charge count for multi-use items. Desktop and mobile expose the same item-use capability.

## Approved item-box contract

- Four rows of eight boxes are placed at approximately 9%, 34%, 62%, and 89% of lap progress.
- Rows are mapped to legal Circuit Alpha racing corridor positions rather than arbitrary world coordinates.
- Each box is a shared-world pickup.
- A successful collection deactivates that specific box for every racer for approximately 4.5 seconds.
- On collection, the box plays a brief visible pop as it disappears; it becomes non-collectible immediately rather than lingering as an active pickup.
- After the pop, the box is fully absent from the field for the inactive portion of the respawn window.
- Near the end of the same approximately 4.5-second respawn window, the box fades back into existence while remaining non-collectible; it becomes collectible only when the fade completes.
- Initial implementation timing uses an approximately 0.12-second pop and 0.45-second fade-back as tunable presentation constants. The required product behavior is pop -> absent -> fade back -> collectible.
- A racer already carrying an item passes through without consuming or deactivating the box.
- Valid collection immediately locks the selected item using the racer's rank/progress state at collection time.
- Roulette presentation continues for approximately 0.85 seconds; changing rank during roulette does not reroll the result.
- Finished racers cannot collect new items.

## Approved inventory and input contract

- One active inventory slot per racer.
- Multi-charge items keep remaining charges in the same slot.
- A racer with an occupied slot cannot collect a second item.
- Keyboard item use remains Left Shift or E.
- Holding S / Down while using an item requests backward deployment for items that support direction.
- Coarse-pointer/mobile gameplay adds a dedicated `ITEM` touch control.
- Holding the mobile Brake/Reverse control while tapping `ITEM` requests backward deployment where supported.
- Item input must coexist with simultaneous accelerate/steer/drift combinations already supported by touch controls.

## Approved effect taxonomy

The PRD's standard approximately 0.85-second spinout and heavy approximately 1.20-second explosive spinout remain the common categories.

| Item | Approved initial resolution |
| --- | --- |
| Ricochet Kinetic Disc | Standard 0.85 s spinout; projectile destroyed on racer hit. |
| Homing Seeker Drone | Standard 0.85 s spinout after valid guided hit. |
| Apex Orbital Missile | Heavy 1.20 s explosive spinout in the terminal AoE. |
| Timed Blast Orb | Heavy 1.20 s explosive spinout in the blast AoE. |
| Blaze Orbs | Short 0.55 s spinout per successful hit. |
| Frost Orbs | No spin; retain approximately 55% momentum and apply approximately 20% handling penalty for approximately 1.2 s. Repeated hits refresh but do not stack multiplicatively. |
| Rebounding Arc Blade | Standard 0.85 s spinout; a rival may be hit once outbound and once on return. |
| Kinetic Arc Hammers | Standard 0.85 s spinout. |
| Hazard Oil / Slick Trap | 360-degree spin presentation plus approximately 60% speed retention. |
| Acoustic Shockwave Pulse | Push/counter effect; no conventional spinout required. |
| Vision-Obscuring Ink Splat | PRD visual/AI impairment only; no added spinout. |
| Nitro Surge | One-use boost; no hostile-contact spin. |
| Continuous Nitro Overdrive | Repeated pulse window; no hostile-contact spin. |
| Hyper-Drive Rocket | Autopilot/catch-up/immunity state. |
| Prismatic Invincibility | PRD immunity/+12% speed plus hostile contact that spins rivals. |

## Approved catch-up and boost tuning fill-ins

These values are initial governed configuration constants and may be changed only through the normal balance/approval process after evidence.

- Nitro Surge speed-cap target: approximately 1.18x normal cap for the PRD's approximately 1.2-second effect.
- Nitro Overdrive pulse speed-cap target: approximately 1.15x normal cap; six-second window; pulses no faster than every 0.75 seconds; each pulse approximately 0.9 seconds.
- Hyper-Drive Rocket target: approximately 1.25x normal cap while the spline autopilot state is active, subject to its approximately six-second maximum and safe legal-path exit.
- Prismatic Invincibility remains PRD-locked at approximately +12% speed (1.12x).
- Nitro Surge continues to ignore off-road speed penalty during its active effect.
- Hyper-Drive and Prismatic immunity must not mutate lap/checkpoint state or create impossible item immunity outside the defined active window.

## Approved Hyper-Drive eligibility

- Hyper-Drive Rocket is available only to racers in positions 6-8.
- The racer must also be at least 45 meters of race-progress distance behind the leader at collection time.
- If the prerequisite is false, Rocket weight is removed before selection and the remaining eligible weights are renormalized.
- The existing dynamic gap factor for positions 6-8 remains unchanged.
- Rocket exit may not deliberately place the racer directly into first.

## Approved owner/self-interaction rule

- Newly spawned projectiles and hazards receive a short owner-immunity/arming window sufficient to clear the originating kart.
- After the object is armed/clear, ordinary collision rules apply.
- A racer may therefore be hit by a returning/ricocheted projectile or by the racer's own lingering armed hazard if normal collision conditions later occur.
- This rule does not permit immediate spawn-overlap self-damage.

## Approved probability and restriction contract

The PRD matrix remains unchanged:

| Item | 1st | 2nd | 3rd | 4th | 5th | 6th | 7th | 8th |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Kinetic Disc | 18 | 16 | 14 | 10 | 8 | 5 | 3 | 2 |
| Seeker Drone | 0 | 8 | 12 | 14 | 15 | 12 | 10 | 6 |
| Apex Missile | 0 | 0 | 0 | 1 | 3 | 8 | 11 | 13 |
| Blast Orb | 2 | 4 | 6 | 8 | 10 | 9 | 8 | 6 |
| Blaze Orbs | 0 | 2 | 4 | 6 | 7 | 8 | 8 | 6 |
| Frost Orbs | 0 | 0 | 2 | 4 | 6 | 8 | 9 | 8 |
| Arc Blade | 5 | 6 | 7 | 8 | 8 | 7 | 6 | 4 |
| Arc Hammers | 0 | 1 | 2 | 4 | 6 | 7 | 8 | 6 |
| Slick Trap | 32 | 24 | 18 | 12 | 8 | 5 | 3 | 2 |
| Shockwave | 18 | 15 | 12 | 8 | 6 | 4 | 2 | 2 |
| Ink Splat | 0 | 0 | 2 | 4 | 6 | 7 | 8 | 8 |
| Nitro Surge | 22 | 20 | 16 | 15 | 12 | 8 | 6 | 5 |
| Nitro Overdrive | 0 | 0 | 0 | 2 | 3 | 6 | 9 | 13 |
| Hyper-Drive Rocket | 0 | 0 | 0 | 0 | 0 | 6 | 9 | 15 |
| Prismatic Invincibility | 3 | 4 | 5 | 4 | 2 | 0 | 0 | 4 |
| **Total** | **100** | **100** | **100** | **100** | **100** | **100** | **100** | **100** |

Dynamic adjustment remains:

`gapFactor = clamp(1 + distanceBehindLeader / 250, 1.0, 1.35)`

For positions 6-8, Apex Missile, Nitro Overdrive, Hyper-Drive Rocket, and Prismatic Invincibility may receive that multiplier, after prerequisite filtering and before final renormalization.

Additional PRD restrictions remain:

- Apex Missile: one active globally and at least 18 seconds between eligible global spawns.
- Hyper-Drive Rocket: unavailable unless its positional and meaningful-gap prerequisites are satisfied.
- No item may be selected while a runtime prerequisite prevents valid use.
- The final item table is configuration data, not hard-coded switch logic.

## Original presentation contract for Slice 5

Slice 5 may use procedural/simple original 3D item models, icons, VFX, and placeholder audio sufficient for gameplay readability and product-owner acceptance. It may not reuse protected franchise presentation. Final audio mix, final VFX/post-processing, and broader production polish remain Slice 6 work.

# Slice 5 exit checklist

## System and distribution

- [ ] All fifteen PRD item IDs exist in one typed registry.
- [ ] The eight rank tables remain exactly as approved and each totals 100%.
- [ ] Dynamic gap weighting obeys the 1.00-1.35 PRD bound.
- [ ] Runtime restrictions filter impossible items before selection and renormalize remaining weights.
- [ ] At least 100,000 seeded simulated selections per rank are recorded; expected deviation is within approximately 0.5 percentage points for common items or a documented goodness-of-fit test passes.
- [ ] One-slot inventory works and an occupied racer cannot consume another box.
- [ ] Roulette lasts approximately 0.85 seconds and freezes under pause.
- [ ] Multi-charge item counts display correctly.
- [ ] Item boxes pop on successful collection, immediately stop being collectible, disappear from the field, then fade back before becoming collectible at approximately 4.5 seconds.
- [ ] Four eight-box rows exist at the approved approximate lap-progress locations and remain in the legal race corridor.

## Fifteen-item functional gate

- [ ] Kinetic Disc launches forward/backward, travels at the governed speed, ricochets no more than three times, and expires/cleans up.
- [ ] Seeker selects the nearest valid racer ahead by race progress, respects arming/turn/lifetime behavior, does not teleport, and warns its target.
- [ ] Apex respects one-active-global and 18-second restrictions, then attacks whoever is currently first at terminal lock.
- [ ] Blast Orb supports directional deployment, approximately three-second fuse, qualifying early impact detonation, AoE resolution, and cleanup.
- [ ] Blaze Orbs provide five charges and enforce the 0.55-second minimum cadence.
- [ ] Frost Orbs provide three charges and apply the governed non-stacking speed/handling effect.
- [ ] Arc Blade provides three charges, completes outbound/return movement, and prevents repeated continuous-overlap damage.
- [ ] Arc Hammers provide five charges, enforce the 0.35-second cadence, bounce once after terrain impact, and expire.
- [ ] Slick lasts approximately 12 seconds, triggers the approved spin/speed effect, and obeys the two-per-owner active cap.
- [ ] Shockwave pushes nearby racers and clears every supported projectile/hazard class.
- [ ] Shockwave can neutralize Apex only during the supported terminal counter state.
- [ ] Ink produces partial player screen obstruction for approximately 2.5 seconds and separately governed AI path-noise/reaction/precision impairment without making AI navigation impossible.
- [ ] Nitro Surge applies its approximately 1.2-second boost and off-road override.
- [ ] Nitro Overdrive obeys its six-second window, pulse cadence, pulse duration, and cleanup.
- [ ] Hyper-Drive Rocket follows Circuit Alpha's legal race path, performs automatic overtakes without teleporting, respects immunity, exits safely, and does not deliberately deposit the racer directly into first.
- [ ] Prismatic Invincibility applies approximately six seconds of immunity, +12% speed, hostile-contact spin, warning/expiry transition, and clean restoration.

## Race, HUD, input, and AI integrity

- [ ] Left Shift and E both use the held item.
- [ ] S/Down + item performs backward-capable deployment where supported.
- [ ] Mobile `ITEM` control works and passes simultaneous-input testing.
- [ ] Mobile Brake/Reverse + ITEM requests backward deployment where supported.
- [ ] HUD shows roulette, held item, and correct remaining charge count.
- [ ] AI acquires and uses items according to tactical circumstances.
- [ ] AI recognizes Slicks and Blast Orbs as hazards.
- [ ] Seeker/Apex targeting derives from validated race progress rather than visual proximity alone.
- [ ] Item hits never directly mutate checkpoint sequence, lap count, finish place, or race-progress authority.
- [ ] Hyper-Drive movement earns progress through legal movement/checkpoints rather than direct progress mutation.
- [ ] Finished racers cannot obtain new items.
- [ ] Pause freezes roulette, projectile, hazard, buff/debuff, arming, fuse, global cooldown, and item-window timers.
- [ ] Existing AI steering, lane, speed-stat authority, recovery, and bounded rubber-band tests remain passing.

## Reliability and performance

- [ ] Every projectile/hazard resolves to destruction after impact, completion, or expiry.
- [ ] Repeated-use soak leaves no immortal item objects, colliders, listeners, timers, VFX, or stale audio emitters.
- [ ] Race restart/disposal returns active item runtime counts to baseline.
- [ ] Simultaneous active physics projectiles never exceed the PRD cap of 40.
- [ ] Item/VFX update cost is instrumented against the approximately 1.0 ms CPU budget.
- [ ] No NaN/infinite transforms occur under item collision stress.
- [ ] Item interactions do not break Speed, Acceleration, Weight, drift, surface, AI, lap, recovery, camera, minimap, or driver-state regressions.

## Evidence and publication

- [ ] `npm ci` passes from the checkpoint source.
- [ ] `npm run validate` passes.
- [ ] Slice-specific probability report is committed or referenced from implementation status.
- [ ] Item interaction/counter matrix evidence is recorded.
- [ ] Object-count/lifecycle soak evidence is recorded.
- [ ] Gameplay capture demonstrates acquisition/use/counters and representative AI usage.
- [ ] Pull-request CI passes.
- [ ] `main` CI and GitHub Pages deployment pass.
- [ ] Desktop live playtest passes item controls, roulette/HUD, representative offensive/defensive/catch-up interactions, AI use, and cleanup behavior.
- [ ] Mobile live playtest passes item acquisition/use, HUD, dedicated ITEM control, backward modifier, and simultaneous control combinations.
- [ ] Product-owner live acceptance is explicitly recorded in `docs/IMPLEMENTATION-STATUS.md`.
- [ ] Any PRD deviation is recorded before Slice 5 can close.
- [ ] Slice 6 remains locked until Slice 5 is live accepted.

## Implementation gate

After this approved design checkpoint is merged, implementation may begin on a dedicated Slice 5 feature branch. Code existence does not satisfy this checklist. Slice 5 closes only after the evidence, deployment, and product-owner live acceptance gates above pass.
