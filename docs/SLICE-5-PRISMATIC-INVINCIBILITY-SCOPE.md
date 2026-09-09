# Slice 5 Prismatic Invincibility Scope

**Status: SCOPE APPROVED — 2026-09-09. Governance publication pending; gameplay implementation follows the merged, validated governance checkpoint.**

Source checkpoint: GitHub main `aa7bf601ebadcba50d3a9d1045f98e488762d1f6`, PR #131; validation/Pages run `34311517420` passed. Shockwave is LIVE ACCEPTED. Governing contract: PRD v1.1, amendment 2.12, section 15.17, and ADR-073; ADR-061 retains the approved 1.12x speed-cap target.

## Purpose

Implement Prismatic Invincibility next to exercise the shared immunity boundaries against the accepted items. Keep the increment limited to its timed immunity, speed modifier, hostile racer contact, readable presentation, and deterministic acceptance fixtures.

## Existing PRD requirements

- One inventory charge.
- Approximately six seconds of hazard/projectile immunity.
- Approximately +12% speed; ADR-061 establishes a 1.12x speed-cap target.
- Hostile contact spins rivals.
- Distinct chromatic pulse and music layer, with readable expiry and clean restoration.

## Approved operational contract

| Behavior              | Proposed contract                                                                                                                                                                                                                                                                                                                                                                                                                         |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Activation            | Consume one charge only on a valid committed use; free the slot immediately. Forward and reverse ITEM are identical. Reject paused, countdown, finished, or invalid-owner use without consuming the charge.                                                                                                                                                                                                                               |
| Duration              | Exactly 6.0 race seconds. Protection, speed modifier, and hostile contact share one active interval. A second valid Prismatic use refreshes to 6.0 seconds, without adding durations or multiplying bonuses.                                                                                                                                                                                                                              |
| Speed                 | 1.12x road-based speed cap. While active, ignore dirt/grass speed-cap, deceleration, and acceleration penalties so non-road surfaces do not slow the protected racer. Preserve terrain geometry and ordinary steering/traction. No instantaneous velocity multiplication, extra acceleration boost, or autopilot. Normal acceleration reaches the higher cap.                                                                             |
| Boost overlap         | Preserve independent remaining durations. Use the strongest active cap and acceleration modifier, never multiply them. Nitro retains its accepted 1.18x cap, 1.50x acceleration, and off-road override while active; expiry of either effect must not erase the other. Track/drift boosts retain existing maximum-combination behavior.                                                                                                   |
| Existing spinout      | Activation prevents new hostile item effects but does not cancel a spinout already in progress or restore lost momentum.                                                                                                                                                                                                                                                                                                                  |
| Kinetic / Seeker      | An otherwise valid, armed projectile contact with a protected racer destroys the projectile and releases its capacity slot, with no spinout, velocity penalty, or hit sprite. Preserve owner-arming rules, targeting, warnings, and outside-contact behavior. Seeker may still target a protected racer.                                                                                                                                  |
| Slick                 | Protected racers receive no Slick spinout or speed reduction and do not trigger, consume, or clear the patch. It remains dangerous to unprotected racers and after protection expires, under its accepted lifetime rules.                                                                                                                                                                                                                 |
| Blast / Apex          | Resolve ordinary fuse, contact, targeting, warning, and explosion rules. Exclude the protected racer from blast effects; eligible nearby racers remain affected. Prismatic does not destroy the missile or remove an orb by proximity.                                                                                                                                                                                                    |
| Shockwave             | Ignore its racer push while protected. The pulse still clears eligible nearby item objects normally.                                                                                                                                                                                                                                                                                                                                      |
| Hostile racer contact | Apply one standard 0.85-second, one-turn spin to an unfinished, non-immune rival on entry into the existing planar kart-contact distance of less than 2.35 m. No extra contact radius or speed-retention penalty. Sustained overlap cannot refresh the spin every frame; the pair must separate to at least 2.35 m before another contact spin. Coincident centers are handled finitely.                                                  |
| Two protected racers  | Neither receives hostile contact spin. Ordinary physical kart contact remains in effect.                                                                                                                                                                                                                                                                                                                                                  |
| Physical collisions   | Keep existing weight-based impulses, speed retention, guardrails, and physical hit feedback. This item grants item-effect immunity, not Rocket-style collision immunity or ghosting.                                                                                                                                                                                                                                                      |
| Lifecycle             | Pause freezes the full active state. Expiry removes only this effect's immunity, speed, contact, visual, and audio state. Finish, recovery/respawn, restart, return to hub, and disposal clear it and its contact bookkeeping. No race-progress or transform relocation is introduced.                                                                                                                                                    |
| Presentation          | A chromatic aura follows the driver's visual position for the active interval; readable in chase/rear cameras and above road/dirt/boost/ramp surfaces. Show remaining active time separately from the now-free inventory slot. Use a distinct original synthesized musical layer honoring master volume and gesture unlock, with visual fallback when audio is unavailable. Give a readable final-second fade/cue without rapid flashing. |

Manny approved these operational fill-ins on 2026-09-09, including the clarified dirt/grass slowdown immunity. Future Blaze/Frost/Arc/Ink/Rocket interactions remain later real-item gates; reusable immunity support does not claim those implementations or acceptance.

## Approved visual direction

- A translucent, faceted prismatic shell surrounds the kart and driver without hiding their identity. It follows them continuously, including turns and jumps; it is not a ring left on the track.
- Cyan, violet, pink, and gold highlights travel smoothly around the shell, with a soft outward glow and a slow rhythmic brightness pulse. Keep the driver's silhouette, road, and nearby hazards readable.
- A short trail of small chromatic particles fades behind the moving kart. It is decorative and never indicates a larger hitbox or persistent attack area.
- On activation, the shell blooms into view. When an item is blocked, show a brief local shimmer without the protected driver's hit sprite or spin animation. Ordinary physical collision feedback remains governed separately.
- During the final second, the shell and particles gradually dim while the separate HUD countdown approaches zero. At expiry, the shell dissolves cleanly; no rapid strobe or full-screen color wash.
- The musical layer lasts only during the active effect, honors volume and pause, and fades out with expiry. All visual motion freezes on pause; restart/disposal removes the shell, trail, and audio.

Manny clarified that Slick must not spin a protected racer and explicitly requested dirt/grass slowdown immunity. He then approved the revised scope and visual direction. The approval includes the following shell, chromatic highlights, particle trail, blocked-hit shimmer, and final-second fade.

## Implementation findings and boundaries

- `RacerEffects` already exposes generic item immunity, but it is a neutral-by-default set rather than a timed source. Its current single temporary-boost record would overwrite Nitro if Prismatic reused it directly. Extend generic effect ownership/composition so overlapping approved effects expire independently, including rollback.
- `KartTimeTrial.projectileTargets()` already propagates immunity to Shockwave, area effects, and hazards. Ordinary Kinetic and Seeker contact paths still require immunity-aware absorption. Suppressing all object collisions would incorrectly let projectiles pass through protected racers.
- Racer contact currently runs before `RacerEffects.advance()`, whereas projectile/hazard resolution runs afterward. Establish one documented active-state sampling/expiry rule for the new effect across drive, racer contact, and item impacts. Test activation and expiry on exact simulation-step boundaries so an expired effect cannot attack through contact while being vulnerable to projectiles in that same step.
- Reuse generic spinout, driver hit/front-hit, and camera-anchor contracts for victims. Put timed protection/contact behavior in the item/effect domain; keep controller inputs generic and race progress read-only.
- Preserve other immunity sources when this one expires. Rejected transactions must restore prior active effects rather than delete a pre-existing boost or immunity state.
- Do not change item probabilities, existing item balance, racer stats, track/checkpoint authority, dependencies, assets, workflows, AI acquisition/use, or Slice 6 scope. Existing Slick/Blast AI avoidance remains unchanged.

## Deterministic acceptance instrumentation

The following query names are proposed, not deployed links:

- `?testItem=prismatic-invincibility` forces the player's actual pickup outcome. Collecting a box is still required; roulette decoration may animate but the selected item is fixed.
- Combine that parameter with `testPrismaticCounter=kinetic|seeker|slick|blast|apex|shockwave|racer` to select one visibly labeled scenario. Each fixture waits for the forced pickup to be revealed and held, then for successful activation before initiating its protected encounter.
- Explicit `testPrismaticPhase=protected|expired` selects a protected encounter or an otherwise equivalent encounter after the effect expires. The fixture must show its stage and completion, and must not confuse a rail hit, another racer's interception, or a missed contact with successful protection.
- Kinetic/Seeker use production projectiles on a suitable approach; fixture geometry and timing must be validated against the six-second window. Slick/Blast use production hazard rules with a controlled contact/fuse encounter. Apex requires first place and schedules its production launch so terminal impact fits the selected phase; do not shorten accepted warning/dive timing.
- Shockwave uses an explicit fixture-owned production pulse at a measured in-range position. Racer contact uses a marked test participant and controlled approach. Any test-only position setup must occur before the measured encounter, be labeled, and leave production progress/checkpoint authority intact.
- Include exact on-screen instructions, retry/restart guidance, and unprotected control outcomes for every scenario. No automatic AI inventory acquisition or tactical use. Normal URLs remain fixture-free. If a setup cannot reliably deliver its intended encounter, fix the harness before presenting a live test link.

## Automated acceptance evidence

1. Transactional activation/refresh/rejection, freed inventory slot, and rollback preserving pre-existing timed effects.
2. Exact 6.0-second active interval, forward/reverse equivalence, pause, expiry, finish/recovery/reset/disposal; protection and hostile contact agree at activation/expiry boundaries.
3. 1.12x cap with normal acceleration and immunity to dirt/grass speed-cap, deceleration, and acceleration penalties; Nitro/track/drift overlap, both expiry orders, and no multiplicative speed stacking or stat mutation.
4. Production Kinetic and Seeker contact absorption, owner arming, capacity release, warning cleanup, and unprotected controls.
5. Protected Slick leaves the patch intact; Blast and Apex retain normal resolution and affect nearby unprotected victims. Shockwave cannot push a protected racer.
6. Standard hostile-contact spin once per encounter, sustained overlap, separation/re-entry, exact distance boundaries, coincident centers, finished/immune exclusions, and two protected racers. Ordinary physical collision behavior is retained.
7. Same-step integration covers actual runtime sequencing and live snapshot refresh, not only isolated immunity predicates.
8. Following aura, both cameras/aspect ratios, surface visibility, music/master-volume/unavailable-audio behavior, pause/resume, and repeated lifecycle resource cleanup.
9. Every fixture is held-item-ready, uses the requested fixed item and phase, reaches its intended encounter, resets, and stays absent on the normal URL.
10. Full existing validation, probability, accepted-item, AI hazard-response, shared-capacity, and race-authority regressions remain passing. Record clean-install hosted CI and deployment evidence before live testing.

## Product-owner live gate

1. Forced pickup, one committed use, free inventory slot, six-second following aura/music/countdown, and visible expiry.
2. Speed increase, no dirt/grass slowdown while active, ordinary surface penalties restored after expiry, and overlap with accepted boosts.
3. Kinetic/Seeker absorption without spin; unprotected controls still hit.
4. Slick survives protected passage; Blast/Apex still resolve and spare only protected racers; Shockwave push is blocked.
5. Rival contact produces one readable spin; continuous overlap does not lock a rival in repeated spins; ordinary physical collisions remain readable.
6. Pause/resume, expiry, recovery, restart, return-to-hub, and audio/visual cleanup.
7. Desktop/mobile ITEM, reverse equivalence, and chase/rear presentation.
8. Normal unforced build and accepted-item/AI hazard-response regressions.

## Approval gate

Manny approved the revised operational contract and visual direction on 2026-09-09. PRD amendment 2.12 / ADR-073 record that decision. Publish the governance checkpoint after separate publication approval; gameplay may begin once it merges and post-merge validation/Pages passes. Gameplay publication and live acceptance remain separate gates. This checkpoint adds no runtime behavior and claims no Prismatic test pass.
