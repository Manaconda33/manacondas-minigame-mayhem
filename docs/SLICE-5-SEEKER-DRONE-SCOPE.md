# Slice 5 next increment: ItemTargeting + Homing Seeker Drone

**Status: PROPOSED FOR MANNY REVIEW — no Seeker gameplay implemented by this checkpoint.**

Baseline: Kinetic Disc is live accepted at PR #105 merge `1497672c639adaf6ca71f2aa775d4e0c23572b33`; CI/Pages run `34034999554` passed. Nitro Surge, boxes, roulette/HUD/input, and earlier accepted racer behavior remain accepted. Manny is ready to continue Slice 5. This proposal makes the next bounded implementation reviewable under PRD v1.1 amendment 2.5, Section 15.4, and the approved Slice 5 design.

## Intended result

The player can acquire and fire a readable original Seeker Drone. It selects the nearest unfinished rival ahead using validated race-progress distance, physically pursues that racer around Circuit Alpha with bounded speed and steering, warns the target as it approaches, and applies the accepted standard spinout on an armed racer impact.

This adds reusable targeting for later items. Issue #106 remains future development; no standings-display fix is included. Other item effects, general AI tactical item firing, counters, new character art, and Slice 6 polish remain later work.

## Existing approved requirements

- One inventory charge; successful launch consumes it and frees the slot.
- Nearest valid racer ahead is determined by race progress, not screen/world proximity.
- Arming delay: **0.5 seconds**.
- Maximum lifetime: **12 seconds** from launch, including arming.
- Maximum turn rate: approximately **120 degrees/second**.
- Speed closes dynamically without teleporting.
- The target receives escalating warning cues.
- Armed racer impact applies the accepted **0.85-second spinout**, reusing the stable camera anchor and perspective-correct hit/frontHit assets.
- Shared **40-projectile** cap, pause-safe timers, restart/disposal cleanup, and unchanged rank probability weights.

## Proposed fill-ins requiring approval

| Choice | Proposed initial behavior |
| --- | --- |
| Launch | Forward launch only. The backward modifier does not reverse this guided item. |
| Initial target | Choose the smallest strictly positive validated total-race-progress gap among unfinished rivals, excluding the owner. Use stable racer ID for exact ties. Include lap count so adjacent track sections and start/finish wrapping cannot select the wrong rival. |
| Selection eligibility | Remove Seeker weight and renormalize when no valid racer is ahead. The player-only forced-item mode may still grant it to exercise rejection behavior. |
| Failed activation | No target, invalid launch, or full shared projectile capacity leaves the held charge intact and provides brief readable feedback. |
| Target lock | Lock the selected rival on successful launch. Rank changes alone do not switch targets. If that rival finishes or leaves the race, the drone expires and its warning clears; no automatic replacement target. |
| Closing speed | Start at **42 m/s**. Desired speed is `clamp(target planar speed + 10 m/s, 42, 56 m/s)`, approached with a maximum speed-change rate of **20 m/s²**. No inherited launch-speed addition. These are proposed balance values, not measured acceptance results. |
| Track guidance | Steer toward a forward point on the shared legal track route, then the target as reachable. Enforce the turn limit on every movement step; never snap position or heading to the route or target. A miss remains possible. |
| Collision | Use a **0.32 m** projectile collision radius. No racer damage during the 0.5-second arming period. After arming, ordinary racer collision can intercept the drone, including a later owner self-hit. An armed hit destroys it. Guardrail impact destroys it without a ricochet; it cannot pass through rails. |
| Warning | Show an original target marker and a player HUD warning when targeted. Pulse and a distinct synthesized warning tone escalate at estimated arrival thresholds of **3 seconds** and **1 second**. Respect audio settings and pause; clear every cue on hit, target loss, expiry, or disposal. Presentation is functional Slice 5 readability. |

The speed floor already exceeds the current maximum unboosted AI speed of 34.32 m/s; the dynamic margin also responds to moving targets. The 56 m/s ceiling and turn limit intentionally do not promise a hit through every bend or against every boost. Straight and curved-course evidence must support the chosen tuning before publication review. Any material change to this approved proposal returns for review.

## Implementation boundary

1. Add `ItemTargeting` over the existing authoritative racer progress snapshots. It reads progress and never writes lap, checkpoint, finish place, or ranking UI state.
2. Extend the item-owned projectile runtime with distinct Seeker guidance and lifecycle state while retaining Kinetic's accepted movement/reflection path and the shared cap.
3. Add data-driven Seeker configuration, real-use dispatch, target warning state, and original procedural drone presentation. Reuse `RacerEffects` and existing camera/sprite behavior.
4. Use the existing `?testItem=seeker-drone` player-only pickup override. Add a clearly marked, opt-in incoming-Seeker test fixture for verifying the player's warning and impact presentation; it must be absent from normal gameplay and must not enable general AI tactics.
5. Record approved fill-ins in the PRD amendment and decision log before implementation. Keep the normal fifteen-item weights intact; only runtime eligibility filtering changes as required.

## Verification and acceptance

Automated checks must cover nearest-ahead selection across lap boundaries and nearby unrelated track sections; invalid/finished/self candidates; deterministic ties; no-target rejection without consumption; successful one-charge consumption; dynamic speed and acceleration bounds; the 120-degree/second turn bound; 0.5-second arming; physical travel and interception; target loss; 12-second expiry; guardrail destruction; shared capacity; pause and restart/disposal cleanup; and unchanged race-progress authority. Include actual Circuit Alpha trajectories as well as isolated straight-line catch-up tests, including Manaconda and Krios at normal maximum speed and the existing maximum AI allowance.

Warning tests must cover escalation, settings, target changes through expiry, overlapping threats, pause, and removal. The test fixture must be opt-in and leave normal distribution/AI behavior unchanged. Existing Kinetic, Nitro, camera, sprite, controller, and AI regression checks remain required. Run the full repository validation and clean-install PR CI before requesting merge/deployment approval.

After approved deployment, provide focused links and have Manny check:

- Seeker acquisition, forward activation, visible physical pursuit, and catch-up on straights and bends.
- Target choice by race progress, armed hit, and the accepted spinout/chase/rear presentation.
- Increasing incoming warning in the marked test fixture, with clean pause/expiry and audio-setting behavior.
- No-target use preserving the charge; occupied-slot pickup behavior and successful-use release.
- Desktop and mobile ITEM input; normal unforced URL and accepted Kinetic/Nitro behavior.

Merge/deployment review and product-owner live acceptance remain separate gates. This increment does not close all of Slice 5 or unlock Slice 6.
