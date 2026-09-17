# Slice 5 Full AI Item Tactics

Status: gameplay implementation increment authorized September 17, 2026; hosted publication and product-owner live acceptance remain open.

Normative references: PRD Section 21.7, PRD amendment 2.22, and ADR-083.

## Objective

Enable all seven AI racers to acquire and use every eligible Slice 5 item through the existing item inventory, dispatcher, effect systems, and `KartController` boundaries. AI item use must read as tactical without creating a second race-authority or item-probability system.

## Contract

- The existing rank tables, gap weighting, rank/gap eligibility, item definitions, charges, cooldowns, projectile values, hazard values, boost values, immunity rules, and global object cap remain unchanged. Other runtime safety and capacity restrictions remain in force; the prior player-only Overdrive eligibility gate is removed solely to enable generic AI use.
- AI continues to acquire through `ItemSelector` and one-slot `ItemSystem` inventory. `?testItem=<item-id>` remains player-only.
- `AiItemPolicy` is a stateless decision layer. It observes rank, progress gap, target distance, rear attackers, nearby projectiles/hazards, track surface/curvature, current item, and active Overdrive/Rocket state.
- The baseline timing rule is first legal opportunity. Tactical predicates may hold an item when its target, defensive threat, capacity, or useful driving line is absent.
- Decisions return only `use`, `pulse`, or `wait` plus forward/backward intent. Item transactions remain atomic in `ItemSystem` and `ItemEffectDispatcher`.
- AI steering, lane selection, hazard avoidance, controller movement, checkpoint sequencing, lap count, finish order, and rubber-banding remain owned by their existing systems.
- Temporary boost fields are applied to AI through `RacerEffects.driveModifiers`; Rocket steering is composed through `HyperDriveRocketSystem.inputFor`. No direct transform, velocity, progress, rank, lap, or finish writes are permitted.
- Finish cleanup clears AI inventory, Overdrive/Rocket state, Frost, Prismatic, Ink, and owned Arc projectiles. Recovery preserves active boost windows unless an existing item contract says otherwise.

## Tactical policy

The thresholds below are policy thresholds, not item tuning. Progress target distances use lap-validated race progress; proximity checks use horizontal world distance.

| Item family                                    | AI use condition                                                                                                     | Intent                                                             |
| ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| Kinetic Disc                                   | Useful racer ahead within 120 m, or a rear attacker within 24 m                                                      | Forward for the ahead target; backward for the rear attacker       |
| Seeker Drone                                   | Nearest valid racer ahead within 120 m                                                                               | Forward                                                            |
| Apex Missile                                   | Apex slot is available and a valid leader is ahead                                                                   | Forward-equivalent                                                 |
| Blast Orb                                      | Rear attacker is close, otherwise useful racer ahead                                                                 | Backward for the rear attacker; forward for the ahead target       |
| Blaze Orbs, Frost Orbs, Arc Blade, Arc Hammers | A useful racer is ahead or a rear attacker is close                                                                  | Direction follows the selected target                              |
| Slick Trap                                     | A rear attacker is within 24 m and placement capacity is available                                                   | Backward/rear-only placement                                       |
| Shockwave                                      | Incoming projectile, nearby hostile hazard, or racer within the defensive contact band                               | Forward/backward-equivalent pulse                                  |
| Ink Splat                                      | At least one valid racer is ahead within useful range                                                                | Forward-equivalent                                                 |
| Nitro Surge                                    | Straight/recovery line or materially below the character's normal cap                                                | Forward-equivalent                                                 |
| Nitro Overdrive                                | Straight/recovery line or materially below the character's normal cap; later pulses obey the existing 0.75 s cadence | Forward-equivalent                                                 |
| Hyper-Drive Rocket                             | Any valid post-acquisition opportunity                                                                               | Forward-equivalent; existing legal autopilot remains authoritative |
| Prismatic Invincibility                        | Hostile threat, close contact pressure, or a clear line for a top-three racer                                        | Forward/backward-equivalent                                        |

Shockwave and Prismatic may intentionally remain held until the defensive condition exists. A rejected dispatch retains the inventory charge and is retried when the policy becomes legal.

## Acceptance instrumentation

The production route remains unforced. For deterministic AI review, use:

```text
?testAiItem=<item-id>&testAiRacer=ai-1
```

`<item-id>` is one of the fifteen governed IDs and `testAiRacer` accepts `ai-1` through `ai-7`; the default target is `ai-1`. The HUD test badge identifies the forced AI item. This fixture changes only the selected test racer’s next collected item and does not grant an item, bypass roulette, change normal probabilities, or force other AI inventories.

The deployed acceptance pass must cover the normal unforced race plus representative target-directed, rear-directed, defensive, boost, Overdrive, Rocket, and Prismatic cases. Defensive routes must be exercised with a real incoming projectile/hazard/contact condition rather than a policy-only bypass.

## Automated evidence

- Pure policy tests cover all fifteen item IDs, target selection, forward/backward intent, defensive waiting, cadence pulses, useful-line checks, and no-target waits.
- Dispatcher/system tests prove generic non-player activation for Overdrive and Rocket and retain atomic rollback behavior.
- Production integration tests prove AI effect modifiers reach `KartController`, Rocket input is composed through the existing autopilot, AI finish cleanup is complete, and normal player forcing remains isolated.
- The existing 100,000-selections-per-rank probability report remains valid; no selector weights or item definitions may change in this increment.
- Existing AI spline, hazard response, item interaction, race-progress, lifecycle, and runtime-asset regressions remain required.

## Exclusions

This increment does not retune any item, alter racer statistics, expand hazard recognition, add a second physics/race system, change checkpoint/lap authority, add Slice 6 polish, or introduce protected binary assets. AI-specific audio/VFX polish is not required for the gameplay gate; existing item-world presentation remains the source of truth.
