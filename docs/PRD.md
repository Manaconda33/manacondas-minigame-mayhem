Warning: truncated output (original token count: 36937)
Total output lines: 3081

**MANACONDA'S**

**MINIGAME MAYHEM**

**Product Requirements Document**

High-Fidelity HTML5 Kart Racer Vertical Slice + Modular Mini-Game Hub

Version 1.1 - Final approved baseline; working implementation amendment 2.17

August 16, 2026

Implementation starting point: Slice 0 - Repository & Project Bootstrap

Durable source of truth: GitHub repository

## Approved implementation amendment 1.2 - Manual confirmation deployments

Approved August 16, 2026. Beginning with Slice 1, every slice checkpoint must include a testable deployment produced from the checkpoint source through a GitHub deployment environment, with GitHub Pages as the default implementation. A slice may not be presented for manual confirmation without the live deployment URL. Automated validation and CI remain required; the deployment adds product-owner manual confirmation rather than replacing other evidence. The repository must record the deployed commit, workflow result, URL, known manual-test limitations, and whether the next slice remains locked pending approval. This amendment changes delivery governance only and does not expand the gameplay scope assigned to any slice.

## Approved implementation amendment 1.3 - Manual-test course length and Slice 1 corrections

Approved August 16, 2026 after product-owner manual confirmation of Slice 1. Circuit Alpha’s implementation target is shortened from approximately 1.45 km to approximately 0.90 km so repeated manual validation remains practical while preserving twelve checkpoints, three laps, all named track sections, and representative handling tests. Target average lap time becomes approximately 30-45 seconds. Dirt must be an optional partial-width lane or a ramp/jump feature rather than covering the entire road. Sustained grass and dirt penalties must retain a playable forward-speed floor while remaining measurably slower than asphalt. Forward controls must read A/Left as visual left and D/Right as visual right from the chase camera. The track scene must provide a deliberate rendered sky/horizon rather than an unlit black upper viewport. These changes supersede conflicting track-length and full-width dirt details below.

## Approved implementation amendment 1.4 - Mobile race controls and slice-order correction

Approved August 16, 2026 with product-owner authorization to add mobile controls, then corrected after product-owner review of the PRD sequence. The original delivery order in sections 35.4-35.6 remains authoritative: Slice 3 is Character Selection & Avatar Ingestion; Slice 4 is AI Waypoint Navigation & Eight-Racer Grid; Slice 5 is Items; final presentation and hardening remain Slice 6. AI/grid work was executed early because repository status incorrectly labeled it Slice 3. That completed work is retained and recorded as an out-of-order Slice 4 checkpoint rather than renumbering the PRD. Touch controls are an approved addition to Slice 4 and must render only when the browser reports a coarse primary pointer with no hover capability. They must support steering, acceleration, brake/reverse, drift, rear view, and recovery without removing keyboard controls. Desktop/fine-pointer sessions must not show the touch overlay. Because the item system is not implemented until Slice 5, AI-004 item use remains dependency-blocked. This amendment supersedes the earlier statement that mobile touch controls are outside the vertical slice but does not supersede the original slice numbering.

## Approved implementation amendment 1.5 - Runtime character asset delivery contract

Approved August 16, 2026 after Lavi’s production integration was manually confirmed on mobile. Every character package delivered through `public/assets/characters/` must be validated in the deployed build, not only in source. Production Pages checkout must materialize Git LFS objects, pass `git lfs fsck`, and fail the build if a required GLB is an LFS pointer or lacks its expected binary signature. Stable public asset paths must use a base-aware controlled revision query or a changed filename whenever their bytes change, so browser and edge caches cannot reuse a previously bad response. The runtime must preload and select the approved rear, steer-left, steer-right, hit, and victory driver frames while retaining a visible rear-frame fallback. Each kart must be visually inspected from chase and rear cameras; if its authored forward axis disagrees with the runtime, a documented visual-root transform may correct it without altering physics, checkpoints, input, or camera coordinates. This amendment adds repeatable delivery and acceptance evidence to Slice 3; it does not approve any unapproved avatar identity or begin the next slice.

## Approved implementation amendment 1.6 - Front driver art, character AI grid, and visible victory pose

Approved August 20, 2026. Every production character package must add `front.png`, a 512 x 512 transparent front-facing seated driver frame used when the race camera faces the front of that character's kart. The existing five approved frames remain valid; front art is separately approval-gated and may not be inferred, mirrored, or substituted as approved production art. Each race randomly selects seven unique AI identities from the manifest after excluding the player's identity. No character may appear more than once in one race. An AI identity with production assets must load its approved kart and rear driver frame; unfinished identities retain the governed fallback kart and monogram treatment. The finish presentation must leave the live race view and player victory pose visible instead of covering the central play area. These requirements refine Slice 3 asset delivery, the already-completed-early Slice 4 grid, and Slice 6 results presentation without changing the eight-racer count.

## Approved implementation amendment 1.7 - Weight-driven kart-impact speed retention

Approved August 30, 2026. Meaningful kart-to-kart impacts must reduce positive forward speed using the governed Weight and closing-speed curve in section 14.1. Weight must create a measurable retention advantage without making any racer collision-immune: severe-impact retention remains bounded, and Weight 10 must still lose meaningful forward speed. Lateral knockback remains governed separately by relative mass. This amendment applies to player and AI contacts without changing roster statistics, Speed ceilings, Acceleration, surface response, wall response, or items.

## Approved implementation amendment 1.8 - AI Speed-stat authority

Approved August 31, 2026. Every AI racer must use its selected character's Speed-derived kart maximum as its clear-straight target. AI pace profiles may change corner-speed judgment, braking, lane choice, and consistency, but may not replace the character's straight-line ceiling with an unrelated absolute speed. A leading AI receives no hidden top-speed reduction. A trailing AI may receive only the bounded top-speed allowance defined in section 21.6. This amendment changes AI speed targeting without changing roster statistics or player performance.

## Approved implementation amendment 1.9 - Complete and shared driver-sprite states

Approved August 31, 2026. Every active production character must provide the full transparent 512 x 512 driver package: rear, front, steer-left, steer-right, hit, and victory. Transparent openings inside props such as steering wheels must contain alpha rather than baked white or checkerboard pixels. Player and AI racers must use one state-selection contract: steering selects the matching turn frame, a kart impact temporarily selects hit, finishing selects victory, and the player rear-view camera selects front for every visible production driver because the camera is facing the fronts of their karts. Each character may define governed neutral and front placement overrides so the driver remains behind the modeled steering controls and seated in the cockpit. Existing identity, kart, stat, and approved-art locks remain unchanged; new or repaired raster derivatives require visual review before publication.

## Approved implementation amendment 2.0 - Camera-facing action-state parity

Approved September 1, 2026. Every active production character must extend the driver package with `front-steer-left.png`, `front-steer-right.png`, `front-hit.png`, and `front-victory.png`. When the camera faces the front of a kart, the shared player/AI selector must preserve the simulated action and choose the matching front-facing frame rather than a rear-oriented action frame or neutral front substitution. Left/right names continue to describe the kart's commanded turn direction, not the viewer's screen side. During the one-character-at-a-time rollout, a missing front-facing action frame must fall back to that character's approved neutral `front.png`; it must never show a rear-facing action from the front camera or blank the driver. New raster derivatives remain outside runtime paths until Manny approves the character's front-facing action package. Existing chase art, neutral front art, identity, kart, stats, physics, camera geometry, and steering-control ownership remain unchanged.

Rollout checkpoint, September 2, 2026: Manny approved the Lavi and Toph camera-facing steering, hit, and victory candidates. Their eight approved files may enter runtime integration under new controlled revisions while publication, deployment, and live acceptance remain separately gated. Lula and Accu remain on the governed neutral-front fallback until their own candidate packages are approved.

Live review checkpoint, September 2, 2026: Toph's deployed front-action package passed. Lavi's art and state behavior passed, but the shared `[0, 0.45, -0.12]` front placement left the camera-facing layer too low behind Potato's body. PR #70 deployed Lavi's character-specific `[0, 0.9, -0.12]` front placement without changing asset bytes or Toph. Lavi requires another live cockpit check. Lula and Accu remain gated.

Live acceptance checkpoint, September 3, 2026: Manny approved Lavi's corrected deployed placement and closed the Lavi/Toph batch. Both drivers now pass steering-left, steering-right, hit, victory, chase restoration, transparency, cockpit placement, and single-wheel presentation in the live build. Manny also authorized Lula and Accu as the final two-driver front-action batch. Their candidate frames remain outside runtime paths until visual approval; publication, deployment, and live acceptance remain separate gates.

Final candidate checkpoint, September 3, 2026: Manny approved Lula's four camera-facing action candidates, then approved Accu's four-frame set. The eight files may enter local runtime integration under controlled revisions `lula-runtime-20260903-3` and `accu-runtime-20260903-3`. Publishing, deployment, and live acceptance remain separate gates.

Deployment checkpoint, September 3, 2026: Manny authorized publication after local validation. PR #73 merged the eight approved frames at `735da4015bca6f9610f6a358672804f4c73b35f9`; main run `33708310011` passed validation and GitHub Pages deployment. The live bundle references both controlled revisions and all eight action paths, and every deployed PNG hash matches the approved source. Product-owner desktop/mobile live acceptance is the remaining gate.

Final rollout acceptance, September 3, 2026: Manny approved Lula and Accu after testing the deployed camera-facing action package. Both drivers pass steering-left, steering-right, hit, victory, chase restoration, transparency, cockpit placement, and single-wheel presentation on desktop/mobile. All nine active production drivers now have live-accepted front-facing action states. The rollout is complete; new asset or gameplay work requires a separately approved PRD scope.

## Approved implementation amendment 2.1 - Product and repository rebrand

Approved September 3, 2026. The public product name is `Manaconda's Minigame Mayhem`. The title screen must show that exact name without a presentation line above it. The former AA monogram is replaced by an original minigame mark showing multiple arcade paths or tokens, and the same mark supplies the browser icon. User-facing placeholders must not expose the internal `aa-##` compatibility keys.

The canonical public repository is `Manaconda33/manacondas-minigame-mayhem`, and the GitHub Pages base path is `/manacondas-minigame-mayhem/`. Active product copy, page metadata, package identity, repository guidance, current PRD records, asset-builder labels, and public links must use the new brand. Dated history snapshots may retain superseded names and URLs as historical evidence, but they are not current authority. A build-time brand check must reject the former display name or repository slug outside preserved history. This amendment also authorizes publishing Jennifer's approved AA-12 package in the same release. Desktop and mobile live acceptance remain required after deployment.

## Approved implementation amendment 2.2 - Slice 5 item-system implementation contract

Approved September 5, 2026 before Slice 5 gameplay implementation. The fifteen-item roster, Sections 15-17 probability matrix, item state machines, ITEM-001 through ITEM-008, AI-004, and existing item values remain unchanged unless this amendment explicitly fills a previously unspecified behavior. The approved implementation and exit contract is recorded in `docs/SLICE-5-ITEM-SYSTEM-DESIGN.md` and is normative for Slice 5.

Circuit Alpha uses four rows of eight shared item boxes at approximately 9%, 34%, 62%, and 89% of lap progress. A valid collection locks the weighted selection immediately using collection-time race state, presents roulette for approximately 0.85 seconds, and deactivates that box globally for approximately 4.5 seconds. A racer with an occupied one-slot inventory does not consume a box. Mobile/coarse-pointer gameplay adds a dedicated ITEM control; holding Brake/Reverse while using ITEM requests backward deployment where supported, matching the keyboard S/Down plus Shift/E contract.

Hyper-Drive Rocket remains restricted to positions 6-8 and additionally requires at least 45 meters of negative race-progress gap to the leader at collection time. Invalid prerequisites remove the item before weighted selection and eligible weights are renormalized. Initial governed boost-cap targets are Nitro Surge 1.18x, Nitro Overdrive pulse 1.15x, Hyper-Drive Rocket 1.25x while on legal spline autopilot, and the existing Prismatic Invincibility 1.12x. These are configuration values subject to later evidence-based balance approval, not silent implementation tuning.

Item effects use the shared PRD spin categories unless otherwise specified in the approved design: standard approximately 0.85 seconds, heavy explosive approximately 1.20 seconds, Blaze short spin approximately 0.55 seconds, Frost momentum/handling impairment without spin, and Slick 360-degree presentation with approximately 60% speed retention. Newly spawned projectiles/hazards receive a short owner-immunity/arming window; after arming, normal collisions may include later self-hit from a returning/ricocheted object or lingering owned hazard.

Slice 5 architecture separates item definitions/selection, inventory and lifecycle, item boxes, projectiles, hazards, generic racer effects, targeting, Rocket spline autopilot, AI item policy, and HUD integration. Item balance remains configuration-driven. Slice 5 may use original procedural/simple models, icons, VFX, and placeholder audio sufficient for gameplay readability; final production audio/VFX polish remains Slice 6. Slice 5 cannot close until the approved exit checklist passes, including at least 100,000 seeded item selections per rank, interaction/counter tests, cleanup/object-count soak, desktop/mobile live deployment checks, and explicit product-owner acceptance.

## Approved implementation amendment 2.3 - Nitro Surge live balance tuning

Approved September 6, 2026 after the first deterministic deployed Nitro Surge acceptance pass. Product-owner testing confirmed the item activation, consumption, inventory release, HUD/VFX tell, off-road override, pause safety, expiry cleanup, desktop/mobile input, deterministic test harness, and normal-selector isolation. Acceleration was functional but not sufficiently pronounced, and the approximately 1.2-second active window felt too short to provide a satisfying or useful boost.

Nitro Surge duration is therefore changed from approximately 1.2 seconds to approximately **2.4 seconds**, and its acceleration multiplier is changed from **1.35x** to **1.50x**. The approved **1.18x normal speed cap remains unchanged**. The off-road speed-penalty override, Traction-governed off-road acceleration, one-charge inventory behavior, pause-safe timer, VFX lifetime coupling, and clean restoration remain unchanged. These values supersede conflicting Nitro Surge duration/acceleration values in the baseline PRD and Slice 5 design while leaving every other item unchanged. This amendment was explicitly approved by Manny before implementation.

## Approved implementation amendment 2.4 - Kinetic Disc guardrails and perspective-correct spinout

Approved September 6, 2026 before the Kinetic Disc implementation checkpoint. The Ricochet Kinetic Disc retains its existing governed projectile values: forward/backward unguided launch, approximately 28 m/s plus limited inherited velocity, approximately 0.32 m radius, nine-second maximum lifetime, up to three wall ricochets using the contact normal, standard approximately 0.85-second spinout on racer impact, and destruction on racer hit.

Circuit Alpha adds continuous visible guardrails outside the legal road/shoulder racing corridor. These rails are a shared collision boundary for Kinetic Disc ricochets and racers. Racer contact with a guardrail produces bounded inward reflection and speed loss plus a brief existing hit-art reaction; guardrail contact alone does not apply the Kinetic Disc standard spinout. The guardrails do not change the circuit centerline, checkpoints, lap validation, item-box rows, or approved dirt/boost/ramp surfaces.

A Kinetic Disc racer hit applies one visible full-yaw spin over the governed standard spinout window. Player controls are suppressed while that spinout is active and planar momentum decays without teleporting the kart. To make the spin readable, the chase/rear camera holds the player's pre-impact travel heading for the spinout rather than orbiting with the rotating kart. The kart's actual orientation still drives 2D driver-facing selection every frame, so the existing approved `hit` and `front-hit` assets switch according to whether the camera currently sees the driver's rear or front as the kart rotates. The same facing rule applies to AI racers visible from either player camera. No new character raster art is authorized or required by this amendment.

## Approved implementation amendment 2.5 - Kinetic Disc catch-up speed

Approved September 6, 2026 after PR #104 live testing. Raise Ricochet Kinetic Disc base speed from approximately **28 m/s to 42 m/s** so it can close on full-speed racers. Preserve the existing bounded inherited velocity: add 0.35 times the owner's planar velocity after clamping that velocity to 8 m/s, yielding approximately 44.8 m/s for a straight forward shot from a fast-moving kart. This supersedes the Kinetic speed in amendment 2.4 and prior baseline references.

Retain the existing angle-of-incidence reflection, with projectile speed preserved across ricochets. A shallow shot on a curved section may hit the same rail again; there is no forced opposite-rail trajectory, minimum inward angle, or homing. The 0.32 m radius, nine-second lifetime, three-ricochet limit, owner arming/self-hit rules, one-charge successful-spawn consumption, 40-projectile cap, and 0.85-second spinout/camera/sprite contract remain unchanged. Final acceptance, September 6, 2026: PR #105 merged at `1497672c639adaf6ca71f2aa775d4e0c23572b33`; CI/Pages run `34034999554` passed, and Manny explicitly live accepted the 42 m/s speed, angle-based ricochets, spinout, chase/rear perspective, and normal item selection. This closes the corrective gate. Issue #106 is a separate future-development standings-display defect and is not an acceptance blocker. The next bounded Seeker proposal is documented separately; no Seeker tuning amendment is approved by this acceptance record. Slice 6 remains locked.

## Approved implementation amendment 2.6 - Homing Seeker Drone

Manny approved merging PR #107 and implementing `docs/SLICE-5-SEEKER-DRONE-SCOPE.md` on September 6, 2026. Seeker launches forward, locks the nearest unfinished rival strictly ahead by validated total race progress, and retains its charge on failed activation. Normal selection filters it when no target is ahead. Rank changes do not retarget; target finish/removal expires the drone. It starts at 42 m/s, approaches `clamp(target planar speed + 10, 42, 56)` m/s with at most 20 m/s² speed change, and receives no inherited launch velocity. It retains 0.5-second arming, 12-second total lifetime, and 120-degree/second maximum turning. Guidance physically follows the shared legal track route; no position/heading snap or teleport is permitted. Radius is 0.32 m. Guardrail contact destroys it without a bounce; armed racer interception, including later owner self-hit, destroys it and applies the accepted 0.85-second spinout. No racer damage occurs before arming. Warning marker/HUD and settings-aware synthesized tone escalate at estimated arrival thresholds of three and one seconds. Pause, target loss, hit, expiry, and disposal clean up warnings. The existing 40-projectile cap is shared. An opt-in marked incoming-Seeker fixture is authorized for live warning/impact acceptance, without enabling general AI tactics. Issue #106 remains deferred. Gameplay merge/deployment and live acceptance remain separately gated; Slice 6 remains locked.


## Approved implementation amendment 2.7 - Apex Orbital Missile core

Approved September 7, 2026. Manny approved merging PR #110 and implementing the complete `docs/SLICE-5-APEX-MISSILE-SCOPE.md` proposal. Preserve section 15.5 / ITEM-007: current unfinished leader at terminal lock, 2.5-second warning, 5.5 m horizontal AoE, 1.20-second heavy spin, one active globally, and at least 18 race seconds between actual successful launches. Approved fill-ins: 0.6 s vertical rise to 24 m above track; 96 m/s bounded sky travel and overhead tracking; 1 m sky arrival; 10 s sky timeout / 15 s total maximum; 1.9 s overhead warning then 0.6 s terminal dive with 60 m/s horizontal tracking. Lock identity at warning start; before lock follow leader changes, after lock cancel on target finish/loss. Owner can become the leader and receive the blast; ordinary unfinished collateral racers also receive the heavy spin once, with no added impulse or multiplier. Dive ignores ordinary racer/rail contacts and blasts at its actual endpoint.

Use atomic launch/charge commit and reserve one shared projectile slot for the full lifecycle. Held inventory does not reserve the active Apex slot; failed activation keeps its charge. Only successful launch starts the global cooldown; removal retains that timestamp; pause freezes it and new race resets it. Generic per-racer immunity blocks blast effects. Shockwave may clear only a diving missile within its 5 m 3D radius, before missile movement/blast in that simulation step. The marked incoming fixture uses normal leader targeting and the same global launch gate. This core increment tests counter boundaries without implementing playable Shockwave/Prismatic; real cross-item and live counter gates remain outstanding. General AI tactics, issue #106, and Slice 6 remain deferred. All other accepted gameplay and probability weights remain unchanged.

## Approved implementation amendment 2.8 - HazardSystem and Timed Blast Orb

Approved September 7, 2026. Manny approved the complete bounded `docs/SLICE-5-BLAST-ORB-SCOPE.md` proposal. Preserve section 15.6 and the approved Slice 5 item-system contract: Timed Blast Orb remains a one-charge forward/backward deployable hazard with an approximately 3.0-second fuse, 4.0 m horizontal blast radius, qualifying early direct-impact detonation, and the approved 1.20-second heavy explosive spinout. Normal rank probabilities remain unchanged.

The approved implementation establishes `HazardSystem` as the owner of Blast Orb state, movement, fuse, collision checks, detonation, rendering, counter removal, and cleanup. Item-physics capacity becomes one shared maximum of 40 active/reserved projectile + hazard objects; Kinetic Disc, Seeker Drone, Apex reservations, and Blast Orb each consume one slot for their active lifecycle, and a full-capacity activation must preserve the held charge. Forward deployment spawns approximately 1.75 m ahead at 14 m/s base planar speed plus 0.35x inherited planar owner velocity capped at 12 m/s. Backward deployment spawns approximately 1.75 m behind with 0.20x inherited planar owner velocity capped at 12 m/s. Both use deterministic 6 m/s² planar drag. Guardrails contain the ground-bound orb and remove outward velocity without detonating it.

Owner immunity lasts 0.35 s. Other racers may trigger a qualifying early detonation during that window, but the owner is excluded from that blast until immunity expires; later armed self-hit/self-blast is legal. Direct racer contact triggers early detonation only at at least 8 m/s planar relative closing speed. Fuse time is race-simulation time and freezes under pause. On each simulation step, queued Shockwave-clear queries resolve before movement/contact and fuse detonation. Blast resolution reuses the generic horizontal area-effect/immunity boundary, applies no extra impulse/damage/speed multiplier, and affects each eligible unfinished racer at most once.

The reusable hazard counter boundary may remove Blast Orbs within the approved 5 m Shockwave radius, but playable Shockwave and real cross-item counter acceptance remain deferred. AI Blast-Orb/Slick avoidance is also deferred until both shared hazard classes exist. The marked incoming Blast Orb fixture is opt-in and must not consume AI inventory or alter normal item distribution. Issue #106, Slick, Prismatic, general AI item tactics, accepted Nitro/Kinetic/Seeker/Apex behavior, racer stats, track/checkpoint authority, character assets, and Slice 6 remain unchanged/deferred.

# Contents

- 1\. Document Control

- 2\. Executive Summary & Technical Architecture

- 3\. Product Definition

- 4\. Problem and Opportunity

- 5\. Users, Roles, and Authority

- 6\. Goals and Success Measures

- 7\. Non-Goals

- 8\. Product Principles

- 9\. Scope

- 10\. User Experience & Screen Wireflows

- 11\. Character & Avatar Pipeline Specification

- 12\. Game Mechanics & Systems Design

- 13\. Drift & Mini-Turbo

- 14\. Collision Response

- 15\. Item System & Distribution Logic

- 16\. Position-Based Probability Matrix

- 17\. Item State Machines

- 18\. Track Blueprint & Level Design

- 19\. Checkpoints and Lap Validation

- 20\. Track Spline & Waypoint System

- 21\. AI Behavior System

- 22\. Camera System

- 23\. Rendering, VFX & AAA Web Polish

- 24\. Audio Architecture

- 25\. Data Model and Sources of Truth

- 26\. Functional Requirements

- 27\. Design and Content Requirements

- 28\. Privacy, Security, Rights & Access

- 29\. Reliability, Operations & Recovery

- 30\. Analytics & Evidence

- 31\. Repository, GitHub & Cowork Continuity

- 32\. Dependencies

- 33\. Risks and Mitigations

- 34\. Decision Log

- 35\. Phased Implementation Roadmap

- 36\. Test Strategy

- 37\. Acceptance Criteria & Quality Checklist

- 38\. Launch & Rollback Plan

- 39\. Final Definition of Done

- 40\. Open Questions / Deferred Decisions

- 41\. Implementation Readiness Decision

- Appendix A. Slice 0 Cowork Start Prompt

# 1. Document Control

| **Field**                  | **Value**                                   |
|----------------------------|---------------------------------------------|
| Product                    | Manaconda's Minigame Mayhem                 |
| Product Type               | Modular HTML5 browser-game hub              |
| Vertical Slice             | 3D Kart Racer with 2D hybrid avatar drivers |
| PRD Version                | 1.1 - Final                                 |
| Date                       | August 16, 2026                             |
| Product Approver           | Manny                                       |
| Status                     | Final; ready to begin Slice 0               |
| Current Slice              | Slice 0 - Repository & Project Bootstrap    |
| Approval Artifact          | This Word document                          |
| Repository Working PRD     | docs/PRD.md                                 |
| Target Platform            | Desktop web browser                         |
| Input Baseline             | Keyboard                                    |
| Rendering Baseline         | WebGL2                                      |
| Progressive Rendering Path | WebGPU where supported and validated        |
| Network Requirement        | None for core gameplay                      |
| Accounts                   | None in v1                                  |
| Public Deployment          | Approval-gated                              |
| Scope Changes              | Approval-gated                              |


## Approved implementation amendment 2.9 - Slick Trap hazard behavior

Approved September 7, 2026 before Slick Trap gameplay implementation. The existing Slice 5 roster, rank probabilities, one-slot inventory, accepted Nitro/Kinetic/Seeker/Apex/Blast behavior, track/checkpoint authority, racer statistics, and Slice 6 lock remain unchanged. `docs/SLICE-5-SLICK-TRAP-SCOPE.md` and ADR-070 are normative for this bounded increment.

Slick Trap is one charge and extends the accepted `HazardSystem`. It is rear-only: either forward ITEM intent or Brake/Reverse + ITEM places one stationary Slick approximately **1.75 m behind** the kart at track elevation with no inherited planar velocity. Guardrail overlap receives only minimum inward penetration correction. Each active Slick consumes one slot from the accepted shared maximum of 40 active/reserved projectile + hazard objects; capacity failure preserves the held charge.

A Slick lives for **12 race seconds** and freezes under pause. The owner is immune for **0.35 race seconds** while other unfinished racers may trigger immediately. After arming, ordinary later owner self-trigger is legal. An unfinished, non-immune racer triggers at planar center distance **<= 1.1 m** with no closing-speed threshold. The Slick is removed before effect resolution so one placement resolves once. Generic item immunity suppresses the trigger/effect and leaves the Slick in place.

A valid trigger retains **60% of the racer's current planar velocity** without increasing near-stationary speed, applies one **360-degree yaw presentation over 0.85 race seconds**, suppresses player drive controls for that presentation, and reuses the accepted perspective-correct hostile-hit camera/driver-state boundary. Do not add the standard/heavy spinout momentum-decay curve, extra impulse, damage, or stacked yaw rate.

Each owner may have at most **two active Slicks**. A successful third deployment atomically retires that owner's oldest Slick and replaces it with the new placement; a failed new use preserves the held charge and both existing Slicks. The existing queued hazard-clear boundary applies generically to Slick and Blast Orb and resolves before Slick trigger processing in the same simulation step. Synthetic Shockwave evidence uses the existing approximately **5 m** clear radius; playable Shockwave remains deferred.

Targeted acceptance reuses `?testItem=slick-trap` and adds opt-in `?testSlickAhead=1`, which places one fixture-owned Slick approximately 8 m ahead after five race seconds without consuming AI inventory or enabling AI tactics/avoidance. AI avoidance for both Blast Orb and Slick remains deferred until Slick itself is live accepted, at which point the shared hazard-response increment is separately approval-gated. Gameplay implementation, publication/deployment, and live acceptance remain separate gates.


## Approved implementation amendment 2.10 - AI hazard response for Slick Trap and Timed Blast Orb

Approved September 7, 2026 after live acceptance of both Timed Blast Orb and Slick Trap. This amendment fills the previously unspecified operating details for the existing Section 21.5 AI obstacle-avoidance requirement without enabling AI item acquisition/use, changing accepted hazard physics, altering item probabilities, changing racer statistics, or beginning Slice 6. `docs/SLICE-5-AI-HAZARD-RESPONSE-SCOPE.md` and ADR-071 are normative for this bounded increment.

AI hazard awareness consumes read-only Slick Trap and Timed Blast Orb snapshots and reasons by wrapped forward route distance on Circuit Alpha. Relevant hazards are considered up to **20 m ahead**. The existing five bounded lane candidates remain authoritative. AI planning treats Slick as conflicted inside a **2.5 m** planning footprint and Blast Orb inside a **4.5 m** planning footprint; these are decision margins only and do not change the governed Slick trigger or Blast radius. Moving Blast Orbs are evaluated at their current position plus a **0.5 s** drag-aware prediction capped by remaining fuse time.

Hazard clearance takes precedence over preferred-lane convenience while existing nearby-racer avoidance remains active where possible. If every candidate lane is conflicted, AI chooses the candidate with greatest minimum clearance rather than receiving guaranteed immunity. After the last relevant hazard clears or moves behind, AI holds the avoidance lane for at least **0.6 race seconds** before normal preferred-lane recovery. All lateral motion continues through existing steering dynamics: no teleport, transform snap, hidden speed boost, speed penalty, emergency brake rule, rubber-band change, or lap/checkpoint mutation is authorized.

Awareness timers advance only with race simulation, so pause freezes the clear-hold. Removed/expired hazards disappear from awareness on the next simulation step; restart, return-to-hub, and disposal clear temporary avoidance state. Deterministic acceptance instrumentation may use `?testAiHazardAvoidance=slick` and `?testAiHazardAvoidance=blast` to place a real accepted hazard approximately 12 m ahead of the first unfinished AI after five race seconds without consuming AI inventory or enabling AI item tactics. Gameplay implementation, publication/deployment, and live acceptance remain separately gated.


## Approved implementation amendment 2.11 - Acoustic Shockwave Pulse counter behavior

Approved September 7, 2026 before Shockwave gameplay implementation. This amendment fills the operating details for the existing Section 15.12 Acoustic Shockwave Pulse without changing its approximately **5 m** radial-defense identity, the fifteen-item probability matrix, one-slot inventory, racer statistics, track/checkpoint authority, accepted item behavior, or the Slice 6 lock. `docs/SLICE-5-SHOCKWAVE-SCOPE.md` and ADR-072 are normative for this bounded increment.

Shockwave is a one-charge instantaneous pulse centered on the using kart. Forward and backward ITEM intent are equivalent. A successful activation consumes its charge when the pulse is committed even if no target is inside the radius. Shockwave itself is not a persistent projectile/hazard and does not reserve a shared item-physics-capacity slot. The readable expanding pressure-ring presentation is gameplay VFX only; final production VFX/audio remains Slice 6.

Eligible unfinished, non-owner, non-immune racers at horizontal center distance **<= 5.0 m** receive no conventional spinout, damage, teleport, or transform snap. Instead the pulse adds one outward planar velocity delta with magnitude linearly interpolated from **6.0 m/s at zero distance to 2.0 m/s at 5.0 m**. A deterministic finite fallback direction is required for coincident centers. The effect may not edit lap/checkpoint/rank/finish authority.

Within the same 5.0 m horizontal radius, ordinary active Ricochet Kinetic Disc and Homing Seeker Drone projectiles are destroyed regardless of their owner-arming state. Slick Trap and Timed Blast Orb hazards are cleared through the accepted queued `HazardSystem` counter boundary. The existing Apex counter remains 3D: only a missile already in its terminal/dive state may be neutralized inside **5.0 m**; rise, sky-travel, and warning/overhead phases are not counterable. Counter queries must resolve before affected projectile/hazard/Apex movement, contact, fuse, or blast processing in that simulation step so a correctly timed pulse wins the frame.

No AI item acquisition/use is enabled by this increment. The player-only `?testItem=shockwave` override and bounded `?testShockwaveCounter=<case>` acceptance fixtures may exercise racer, Kinetic, Seeker, Slick, Blast, and terminal-Apex cases without altering normal distribution or AI tactics. Pause/restart/disposal must leave no queued pulse or presentation state behind. Gameplay implementation, publication/deployment, and live acceptance remain separately gated.

## Approved implementation amendment 2.12 - Prismatic Invincibility

Approved September 9, 2026, including Manny's explicit clarification that Prismatic prevents Slick spinout and dirt/grass slowdown. Section 15.17, ADR-073, and `docs/SLICE-5-PRISMATIC-INVINCIBILITY-SCOPE.md` govern this bounded increment.

A valid committed one-charge use frees the inventory slot and activates exactly **6.0 race seconds** of item immunity, a **1.12x road-based speed cap**, and hostile contact. Forward/reverse ITEM are equivalent. A repeat use refreshes duration rather than stacking. Ignore dirt/grass speed-cap, deceleration, and acceleration penalties while active; retain terrain geometry and steering/traction. Use normal acceleration, with no instantaneous speed multiplication or autopilot. Preserve independently timed Nitro and other accepted boosts; combine caps and acceleration by maximum, never multiplication. Activation does not clear an existing spinout or restore lost momentum.

Valid armed Kinetic/Seeker contacts are absorbed, destroying the projectile without a hostile effect on the protected racer. Protected racers do not trigger or clear Slick and receive no spinout or speed reduction. Blast/Apex keep normal contact/fuse/targeting/explosion resolution, excluding protected victims while still affecting eligible others. Shockwave cannot push protected racers. Ordinary weight-based kart contact and guardrail physics remain active.

Hostile contact applies one **0.85-second, one-turn standard spin** per encounter to an unfinished non-immune rival at the existing planar contact distance **< 2.35 m**. Sustained overlap cannot repeatedly refresh the spin; separation to **>= 2.35 m** rearms the pair. Two protected racers cannot spin one another. No additional speed-retention penalty, contact radius, teleport, heading snap, or race-progress mutation is introduced.

The approved readable presentation is a translucent faceted shell that follows kart/driver through turns and jumps; flowing cyan/violet/pink/gold highlights with a gentle pulse; a short fading particle trail; a brief blocked-item shimmer; a separate active countdown; and an original volume-aware musical layer. The final second fades smoothly without rapid flashing or a full-screen wash. Preserve driver, track, and hazard visibility. Pause freezes the state; expiry removes only this effect's contributions. Finish, recovery/respawn, restart, hub return, and disposal clear it. Drive, contact, and projectile/hazard processing must use a consistent active interval, includi…16937 tokens truncated…Maintain at minimum asset owner/source, approved use, approval status, source file, and production derivative. Unapproved likenesses must not be publicly deployed.

## 28.3 External Libraries

Production build must record package, version, and license. No dependency with incompatible redistribution terms may ship.

## 28.4 IP Differentiation Gate

Pre-release review must confirm that item presentation and other game content are not direct replicas. This is a product-content control and not a substitute for formal legal advice if commercial/public-release circumstances require it.

# 29. Reliability, Operations & Recovery

## 29.1 Fatal Asset Failure

If Circuit Alpha itself cannot load, stop race launch, show a user-readable load error, and allow return to hub. Do not enter broken race state.

## 29.2 Non-Critical Asset Failure

Fallback is allowed for character portraits, driver sprites, individual kart models, optional SFX, and decorative effects.

## 29.3 WebGL Context Loss

webglcontextlost  
webglcontextrestored

If restoration succeeds, rebuild resources. Otherwise offer a clean reload.

## 29.4 Race Restart

Restart reconstructs race runtime state rather than manually resetting every mutable entity. Dispose projectiles, hazards, race timers, transient VFX, and stale audio emitters.

# 30. Analytics & Evidence

No remote analytics are required for v1. Development instrumentation must expose:

FPS  
frame time  
draw calls  
triangle count  
physics step time  
AI update time  
active objects  
active particles  
active audio voices

Debug instrumentation must be removable or disabled in release presentation. Evidence for PRD completion comes from automated tests, performance captures, race recordings/screenshots, asset validation, browser tests, and done-check records.

# 31. Repository, GitHub & Cowork Continuity

## 31.1 Repository Policy

The project must live in a dedicated GitHub repository. Unless the product owner explicitly chooses otherwise during creation, the initial repository should be private because it may later contain community avatar art and unreleased game assets. If GitHub exposes multiple possible repository owners or organizations and the correct owner cannot be inferred safely, Cowork must ask before creating the repository.

## 31.2 Required Repository Layout

/  
+-- docs/  
\| +-- PRD.md  
\| +-- Manacondas_Minigame_Mayhem_PRD_v1.1.docx
\| +-- DECISIONS.md  
\| +-- IMPLEMENTATION-STATUS.md  
\| +-- TESTING.md  
+-- public/  
\| +-- assets/  
\| +-- characters/  
\| +-- karts/  
\| +-- track/  
\| +-- items/  
\| +-- audio/  
+-- src/  
\| +-- app/  
\| +-- audio/  
\| +-- config/  
\| +-- game/  
\| \| +-- ai/  
\| \| +-- camera/  
\| \| +-- characters/  
\| \| +-- items/  
\| \| +-- physics/  
\| \| +-- race/  
\| \| +-- track/  
\| \| +-- vfx/  
\| +-- schemas/  
\| +-- ui/  
+-- tests/  
+-- .github/workflows/  
+-- README.md  
+-- package.json  
+-- tsconfig.json  
+-- vite.config.ts  
+-- .gitignore  
+-- .gitattributes

## 31.3 Documentation Contract

README.md must state product purpose, local setup, development/build/test commands, architecture summary, current implementation slice, and links to the working PRD and implementation status. docs/IMPLEMENTATION-STATUS.md must record current slice, completed requirements, work in progress, known defects, deferred work, next recommended action, and last verified commit. docs/DECISIONS.md records technical/product decisions made after approval. docs/TESTING.md defines test commands, environments, manual checks, and evidence expectations.

## 31.4 PRD Representation

This DOCX is retained in docs as the approved versioned artifact. Cowork creates docs/PRD.md as a semantically equivalent implementation copy. Any approved PRD revision must update both the versioned approval artifact and the working Markdown PRD, with the revision noted in DECISIONS and IMPLEMENTATION-STATUS.

## 31.5 Git LFS / Binary Asset Policy

Large binary handling must be configured before production art/audio enters Git history. At minimum, GLB and production audio formats should be considered for Git LFS. High-resolution character PNG/WebP assets may also be placed under LFS according to the repository asset policy. The .gitattributes file must make the policy explicit before those assets are committed.

## 31.6 CI Contract

GitHub Actions must run the repository health pipeline on pushes and pull requests:

install -\> typecheck -\> lint -\> test -\> production build

The exact package manager is selected in Slice 0 and must be locked consistently. CI failure blocks declaring a slice checkpoint healthy.

## 31.7 Cowork Session Handoff

At the end of every material Cowork implementation session, update IMPLEMENTATION-STATUS.md before the final checkpoint commit. A new session should begin by reading README.md, docs/PRD.md, docs/IMPLEMENTATION-STATUS.md, and docs/DECISIONS.md before changing code. Chat history is supplemental only.

## 31.8 Branching and Checkpoints

Initial bootstrap may occur on the default branch if the repository is new and isolated. After bootstrap, material implementation work should use small, reviewable branches or commits appropriate to the connected Cowork workflow. Every slice ends in a named checkpoint commit with passing CI and an updated implementation-status record.

# 32. Dependencies

Required runtime and build dependencies include Three.js, Rapier 3D, Howler.js or equivalent agreed audio wrapper, TypeScript, and Vite. Development dependencies should include a test runner, linting, formatting, and type-check support selected in Slice 0. Content dependencies include 12 approved avatar identities/art packages, kart assets, Circuit Alpha art, item icons/models, SFX, race music, and final-lap arrangement. Early slices may use placeholders; final asset approval is not required to prove the physics architecture.

# 33. Risks and Mitigations

| **Risk**                                   | **Impact** | **Mitigation**                                              |
|--------------------------------------------|------------|-------------------------------------------------------------|
| Physics feels overly realistic             | High       | Custom arcade controller over Rapier                        |
| Physics becomes unstable                   | High       | Fixed timestep, bounded impulses, recovery tests            |
| AAA effects reduce FPS                     | High       | Quality tiers and effect budgets                            |
| 2D drivers look disconnected from 3D kart  | High       | Controlled billboard, cockpit occlusion, matched lighting   |
| AI looks robotic                           | Medium     | Lane selection, overtaking, drift, tactical items           |
| AI rubber-band feels dishonest             | Medium     | Hard percentage caps; no teleport                           |
| Items overwhelm skill                      | High       | Rank table, cooldowns, global caps                          |
| Heavy items create unavoidable frustration | Medium     | Warnings and counters                                       |
| Missing avatar assets block development    | High       | Procedural fallback                                         |
| Large download                             | Medium     | Lazy loading and compressed assets                          |
| Browser audio blocked                      | High       | Title interaction unlock                                    |
| Lap shortcut exploits                      | High       | Ordered checkpoints                                         |
| Franchise similarity                       | High       | Original names, silhouettes, icons, audio, effects          |
| Cowork session loses project context       | High       | Repo-held PRD, status, decisions, tests, checkpoint commits |
| Large binaries bloat Git history           | Medium     | Configure LFS policy before production assets               |

# 34. Decision Log

| **ID** | **Decision**                                  | **Rationale**                                                                 |
|--------|-----------------------------------------------|-------------------------------------------------------------------------------|
| D-001  | Three.js baseline                             | Browser maturity and rendering flexibility                                    |
| D-002  | Rapier physics                                | Stable WASM physics with custom arcade control                                |
| D-003  | WebGL2 baseline                               | Wider production compatibility                                                |
| D-004  | WebGPU progressive                            | Initial gameplay does not depend on availability                              |
| D-005  | 60 Hz fixed simulation                        | Responsive and predictable browser physics                                    |
| D-006  | One inventory slot                            | Keeps first vertical slice readable                                           |
| D-007  | 12 characters / 36 stat points each           | Balance transparency                                                          |
| D-008  | 8-racer grid                                  | Requested competitive target with manageable browser load                     |
| D-009  | Single Circuit Alpha                          | Concentrates vertical-slice quality                                           |
| D-010  | No backend                                    | Unnecessary for current product outcome                                       |
| D-011  | Originalized item presentation                | Distinct product identity                                                     |
| D-012  | 2D driver sprite mounted in 3D kart           | Preserves the approved illustrated roster while controlling asset cost        |
| D-013  | GitHub repository before gameplay code        | Provides durable source of truth and cross-session continuity                 |
| D-014  | DOCX approval artifact + Markdown working PRD | Combines reviewable final artifact with repo-native implementation reference  |
| D-015  | Slice 0 bootstrap before Slice 1              | Prevents architecture, CI, docs, and binary policy from being bolted on later |

# 35. Phased Implementation Roadmap

## 35.1 Slice 0 - Repository & Project Bootstrap

### Objective

Create the canonical GitHub repository, establish the project structure, install the approved technical foundation, configure repository health checks, and make the repo self-describing before gameplay implementation begins.

### Implementation Work

- Create the GitHub repository (current name: manacondas-minigame-mayhem). Default to private unless the product owner explicitly chooses otherwise; ask only if the repository owner/organization cannot be safely determined.

- Initialize a TypeScript/Vite application and select one package manager; commit its lockfile.

- Create the repository directory structure defined in Section 31 and the asset substructure defined in Section 11.

- Place this approved Word PRD in docs/ and create docs/PRD.md as the semantically equivalent canonical working PRD.

- Create README.md covering product purpose, local setup, build/run/test commands, architecture summary, current slice, and links to PRD/status docs.

- Create docs/IMPLEMENTATION-STATUS.md with current slice, completed requirements, work in progress, known defects, deferred work, next recommended action, and last verified commit.

- Create docs/DECISIONS.md and seed it with the approved decisions from Section 34.

- Create docs/TESTING.md documenting local and CI validation commands plus evidence expectations.

- Install and pin the initial foundation: Three.js, Rapier, Howler.js, TypeScript, Vite, plus linting, formatting, and testing tooling appropriate to the stack.

- Configure TypeScript strictness, formatting, linting, and basic test execution.

- Add package scripts at minimum for dev, build, typecheck, lint, test, and CI-friendly testing.

- Configure GitHub Actions to install, typecheck, lint, test, and create a production build on push/pull request.

- Configure .gitignore and .gitattributes, including the approved Git LFS/binary-asset policy before production art/audio is added.

- Add placeholder asset directories/manifests so later slices do not invent competing structures.

- Create only the minimum application shell needed to prove the repository builds and serves; do not implement gameplay physics in Slice 0.

- Run all documented checks locally, fix failures, commit the clean bootstrap checkpoint, push it, and verify CI.

- Update IMPLEMENTATION-STATUS.md with evidence, repository URL, default branch, checkpoint commit SHA, CI status, any deviations, and whether Slice 1 is ready.

### Acceptance Criteria

- Repository exists in GitHub.

- Fresh checkout can be installed and run using documented commands.

- Production build succeeds.

- Type checking and linting succeed.

- Automated test command succeeds, even if only bootstrap tests exist.

- GitHub Actions run successfully.

- Approved PRD is committed and identifiable as the authoritative requirements baseline.

- docs/PRD.md exists as the working implementation copy.

- Folder structure matches this PRD.

- Large binary asset handling is configured before production art enters Git history.

- IMPLEMENTATION-STATUS.md is sufficient for a new Cowork session to determine completed work and the next action.

- No game-specific implementation beyond the minimum app-shell proof has leaked into Slice 0.

### Done-Check Evidence

Repository URL:  
Default branch:  
Checkpoint commit SHA:  
CI result:  
Clean install/build result:  
PRD version:  
Files/folders created:  
Known deviations:  
Open defects:  
Slice 1 ready: YES / NO

### Approval Gate

Slice 0 may begin from this final PRD. Stop after a healthy Slice 0 checkpoint and wait for product-owner approval before starting Slice 1.

## 35.2 Slice 1 - Engine Setup, Basic Kart Physics, Keyboard Controls, Single Track Loop & Time Trial

### Objective

Prove that the browser runtime can deliver stable, responsive kart driving around a complete Circuit Alpha loop.

### Included

- HUB-001-005 baseline shell

- PHYS-001-006 foundational portions

- TRACK-001-003

- basic HUD timing

- player kart only

### Implementation Work

- Vite/TypeScript runtime already bootstrapped

- app state machine

- Three.js scene

- Rapier initialization

- fixed-step loop

- Circuit Alpha blockout

- kart rigid body

- custom throttle/brake/steering

- chase camera

- surface tags

- checkpoint/lap validation

- time-trial timer

- respawn

- performance overlay

### Acceptance Criteria

- player can drive three consecutive valid laps

- reverse finish-line crossing cannot increment lap

- grass/dirt slows vehicle

- kart recovery works

- 10-minute driving test produces no invalid transforms

- keyboard input remains responsive

- representative blockout remains at target performance

### Evidence Required

Gameplay capture, lap-validation test output, physics soak log, FPS/frame-time capture, and repository test output.

### Approval Gate

Any material change to core physics contract or track validation rules.

### Done-Check

Status:  
Evidence:  
Defects:  
Deferred:  
PRD Changes:  
Next Slice Ready: YES / NO

## 35.3 Slice 2 - Drift Engine, Three-Tier Mini-Turbo & Multi-Surface Traction

### Objective

Transform basic steering into the required arcade-driving identity.

### Included

- DRIFT-001-004

- complete character-independent traction equations

- Blue/Orange/Purple boost logic

- boost pads

- jump/stunt boost

### Implementation Work

- hop state

- drift entry

- slip logic

- charge calculation

- three tiers

- tier VFX placeholders

- tier audio placeholders

- boost state

- dirt and grass tuning

- jump/stunt state

### Acceptance Criteria

- all three drift tiers can be intentionally achieved

- release applies correct tier

- tier charge timing matches configuration

- surface traction changes behavior measurably

- drift remains stable on banked corners

- kart cannot indefinitely charge turbo while stationary

### Evidence Required

Automated threshold tests, gameplay capture of all three tiers, telemetry trace, and surface-speed comparison.

### Approval Gate

Any change to the six-stat contract or requested three-tier drift model.

### Done-Check

Status:  
Evidence:  
Defects:  
Deferred:  
PRD Changes:  
Next Slice Ready: YES / NO

## 35.4 Slice 3 - Character Selection & Avatar Ingestion

### Objective

Integrate the complete twelve-slot roster framework without requiring every final production asset.

### Included

- CHAR-001-004

- six-stat mapping

- character select UI

- kart preview

- hybrid driver sprites

- fallback generator

### Implementation Work

- JSON schema

- manifest validator

- twelve balance profiles

- Character Select

- kart preview scene

- driver sprite controller

- sprite atlas pipeline

- fallback kart

- monogram generator

- player-selection handoff into race

### Acceptance Criteria

- exactly 12 slots render

- each slot produces correct statistics

- every stat total validates at 36

- selected character values drive physics

- removing one portrait invokes fallback

- removing one kart invokes fallback

- missing optional assets do not crash race

### Evidence Required

Manifest validation test, Character Select screenshots, twelve automated profile tests, and missing-asset test.

### Approval Gate

Final mapping of real community identities and approved likeness assets.

### Done-Check

Status:  
Evidence:  
Defects:  
Deferred:  
PRD Changes:  
Next Slice Ready: YES / NO

## 35.5 Slice 4 - AI Waypoint Navigation & Eight-Racer Grid

### Objective

Turn the time trial into a complete competitive race.

### Included

- RACE-001-006

- AI-001-005

- race ranking

- eight-racer start grid

- collision interaction

### Implementation Work

- race director

- grid spawning

- spline AI

- desired-speed profile

- lane system

- overtaking

- obstacle avoidance

- AI drift

- bounded rubber-band

- position ranking

- AI finish times

### Acceptance Criteria

- seven AI racers complete three laps

- no AI consistently becomes permanently stuck

- AI can overtake

- race positions update correctly through crossings

- AI collision recovery works

- all eight racers receive finish positions

- repeated races show meaningful order variation

- seven AI identities are sampled from the available roster without duplicating the player or each other

- every sampled production identity loads its approved kart and rear driver frame; sampled unfinished identities use governed fallbacks

### Evidence Required

Ten automated or supervised full-race simulations, AI path telemetry, finish-order data, and collision-stress recording.

### Approval Gate

Any major increase beyond seven opponents or material redesign of rubber-band rules.

### Done-Check

Status:  
Evidence:  
Defects:  
Deferred:  
PRD Changes:  
Next Slice Ready: YES / NO

## 35.6 Slice 5 - Item Boxes, Weapons & Position-Based Distribution

### Objective

Implement the complete tactical and catch-up layer.

### Included

- ITEM-001-008

- all fifteen items

- item boxes

- one-slot inventory

- complete probability matrix

- AI item use

### Implementation Work

- item registry

- item state machine

- probability selector

- roulette UI

- projectile framework

- hazard framework

- buffs/debuffs

- defensive pulse

- Apex targeting

- Rocket autopilot

- AI item logic

- global caps

- cleanup/pooling

### Acceptance Criteria

- all fifteen items can be acquired and successfully resolve

- every rank table sums to 100%

- random distribution statistically approximates configured values

- no item leaves immortal runtime objects

- Apex targets current first-place racer

- Shockwave counters supported objects

- Rocket follows legal race path

- AI uses tactical items

- item interactions do not invalidate lap state

### Evidence Required

Automated probability report, item interaction test matrix, gameplay capture, and object-count soak test. At least 100,000 simulated item selections per rank; expected deviation \<= approximately 0.5 percentage points for common items or a documented statistical goodness-of-fit test.

### Approval Gate

Material balance changes outside approved item definitions or matrix.

### Done-Check

Status:  
Evidence:  
Defects:  
Deferred:  
PRD Changes:  
Next Slice Ready: YES / NO

## 35.7 Slice 6 - UI/HUD Polish, Audio, Post Processing & Optimization

### Objective

Convert the mechanically complete game into the intended high-fidelity vertical slice.

### Included

- final HUD

- mini-map

- pause

- results

- approved avatars

- production audio

- final-lap music

- shadows

- particles

- bloom

- motion blur quality mode

- graphics presets

- performance optimization

### Implementation Work

- complete HUD

- Canvas/SVG mini-map

- final menus

- portrait states

- podium/results

- audio mixer

- engine system

- item audio

- music transitions

- particles

- boost effects

- post processing

- dynamic quality controls

- memory cleanup

- cross-browser QA

- asset-rights validation

- production build

### Acceptance Criteria

- full Title -\> Results flow passes

- HUD values remain correct

- final-lap music transitions correctly

- settings persist

- graphics quality changes without reload where feasible

- no material memory increase across five race restarts

- Medium graphics meets performance target

- missing WebGPU never blocks WebGL2 play

- approved production likenesses are the only likenesses shipped

- release candidate passes final quality checklist

### Evidence Required

Complete gameplay recording, browser matrix, performance capture, memory capture, rights/provenance record, and production build validation.

### Approval Gate

Public deployment, final avatar likeness package, material acceptance-criteria change, paid production services, and production hosting/domain changes.

### Done-Check

Status:  
Evidence:  
Defects:  
Deferred:  
PRD Changes:  
Next Slice Ready: YES / NO

## 35.8 Slice 7 - Jennifer release and product rebrand

### Objective

Publish Jennifer and The Hearthwarden while moving the public product, repository, and Pages URL to Manaconda's Minigame Mayhem.

### Included

- Jennifer's approved AA-12 runtime package and cockpit placement
- title-screen, metadata, browser-icon, package, repository, and Pages-path rebrand
- removal of the presentation line and player-facing AA monogram
- current documentation and Word approval-artifact updates
- build-time protection against superseded brand copy and paths

The internal `aa-##` profile and asset keys remain stable compatibility identifiers. Dated history snapshots remain unchanged as historical evidence.

### Acceptance Criteria

- The title screen shows `Manaconda's Minigame Mayhem` with no presentation line above it.
- The minigame route-and-token mark replaces the AA letter logo and supplies the favicon.
- Jennifer is selectable as AA-12 and loads The Hearthwarden, all ten approved frames, and the 8 / 5 / 8 / 4 / 4 / 7 profile.
- Active product copy, metadata, package identity, repository guidance, builder labels, and public links use the new brand.
- The canonical repository is `Manaconda33/manacondas-minigame-mayhem` and the live site uses `/manacondas-minigame-mayhem/`.
- Automated validation rejects the superseded display name or repository slug outside dated history.
- Full local validation, pull-request CI, main CI, Pages deployment, and source-to-live asset checks pass.

### Evidence Required

Rendered desktop and mobile title screens, Jennifer selection and race entry, repository metadata, Pages response, production-bundle brand scan, asset hashes, CI results, and product-owner live playtest.

### Approval Gate

Manny approved the brand, repository rename, public URL change, Jennifer publication, and deployment on September 3, 2026. Product-owner live acceptance remains required after deployment.

### Rollback

Keep the last accepted deployment commit available. If the renamed Pages site fails, restore the prior source checkpoint on the renamed repository while retaining the new repository identity; do not restore the superseded public brand.

### Done-Check

Status: Local release gate passed; publication in progress
Evidence: Brand guard; strict typecheck; zero-warning lint; 16 test files / 84 tests; 30 GLBs; 83 PNGs; production build; Git LFS fsck; 43-page Word PRD integrity and rendered review
Defects: None recorded
Deferred: Desktop and mobile live acceptance after deployment
PRD Changes: Amendment 2.1, HUB-006, HUB-007, REPO-007, REPO-008, and Slice 7
Next Slice Ready: NO

# 36. Test Strategy

## 36.1 Unit Tests

Cover stat calculations, probability normalization, rank selection, checkpoint sequencing, lap increment, race-progress comparison, drift thresholds, boost durations, surface modifiers, character manifest, and item state transitions.

## 36.2 Simulation Tests

Use headless or reduced-render tests where feasible for AI race completion, projectile cleanup, racer finish ordering, wrong-way lap rejection, repeated collisions, repeated respawns, and item selection distribution.

## 36.3 Integration Tests

Title -\> Menu -\> Character Select -\> Race -\> Pause -\> Race -\> Finish -\> Results -\> Replay

## 36.4 Physics Stress Tests

| **Test**  | **Pass Condition**                                                                                 |
|-----------|----------------------------------------------------------------------------------------------------|
| Pile-Up   | Eight racers in constrained contact; no NaN, no unbounded velocity, racers separate/recover        |
| Wall Test | Maximum-speed impact does not tunnel through major boundary; player remains recoverable            |
| Ramp Test | Repeated jump landings cause no sinking, persistent airborne state, or escalating angular velocity |

## 36.5 Browser Matrix

Baseline: latest Chrome, latest Edge, latest Firefox, and current desktop Safari where WebGL2 capabilities meet the required baseline. Core gameplay must not depend on WebGPU.

# 37. Acceptance Criteria & Quality Checklist

## Complete Gameplay

☐ Title Screen works.

☐ Browser audio unlock works.

☐ Hub loads.

☐ Kart Racer card starts correct flow.

☐ All 12 character slots load.

☐ Character selection affects race stats.

☐ Eight racers start.

☐ Countdown works.

☐ Three laps validate.

☐ Finish order works.

☐ Results contain all racers.

☐ Replay works.

☐ Return to hub works.

## Controls

☐ WASD works.

☐ Arrow keys work.

☐ Space drift works.

☐ Shift item use works.

☐ E alternate item use works.

☐ Backward throw modifier works.

☐ C rear view works.

☐ Escape works.

☐ P pause works.

☐ Browser scrolling does not interfere during active gameplay.

## Physics

☐ No NaN transforms in 30-minute soak.

☐ No uncontrolled velocity explosion.

☐ Kart stays stable on banked road.

☐ Kart lands correctly from ramp.

☐ Heavy racer has observable collision advantage.

☐ Handling changes steering behavior.

☐ Acceleration changes recovery behavior.

☐ Traction changes off-road retention.

☐ Speed affects maximum road velocity.

## Drift

☐ Blue tier reachable.

☐ Orange tier reachable.

☐ Purple tier reachable.

☐ VFX matches tier.

☐ Audio matches tier.

☐ Release activates correct boost.

☐ Zero-speed exploit impossible.

☐ Drift resets after hit.

## Track

☐ Circuit closes cleanly.

☐ All checkpoints are sequential.

☐ Skipping checkpoint blocks lap.

☐ Reversing finish line does not farm laps.

☐ Wrong-way warning works.

☐ Recovery returns to legal location.

☐ Dirt behaves distinctly.

☐ Grass behaves distinctly.

☐ Boost pads work.

☐ Jump/stunt works.

## AI

☐ Seven AI complete race.

☐ AI handles major turns.

☐ AI uses multiple lanes.

☐ AI overtakes.

☐ AI avoids obvious hazards.

☐ AI uses items.

☐ AI recovers after collision.

☐ AI rubber-band remains inside configured limits.

## Items

☐ Kinetic Disc works.

☐ Seeker Drone works.

☐ Apex Missile works.

☐ Blast Orb works.

☐ Blaze Orbs work.

☐ Frost Orbs work.

☐ Arc Blade works.

☐ Arc Hammers work.

☐ Slick Trap works.

☐ Shockwave works.

☐ Ink works.

☐ Nitro works.

☐ Nitro Overdrive works.

☐ Hyper-Drive Rocket works.

☐ Prismatic Invincibility works.

☐ Weighted tables sum to 100%.

☐ Global item limits work.

☐ Expired items are destroyed.

## HUD

☐ Rank is accurate.

☐ Lap is accurate.

☐ Portrait is accurate.

☐ Item icon is accurate.

☐ Charge count is accurate.

☐ Mini-map positions are accurate.

☐ Speed is displayed.

☐ Final lap appears.

☐ Wrong way appears.

## Audio

☐ Music starts only after user interaction.

☐ Engine pitch responds to speed.

☐ AI engines spatialize.

☐ Drift cues work.

☐ Projectile warnings work.

☐ Final-lap music works.

☐ Pause attenuates correctly.

☐ Result music does not overlap race music.

☐ Volume settings persist.

## Visual

☐ Driver sprites sit correctly in kart.

☐ Left/right states trigger correctly.

☐ Hit state triggers correctly.

☐ Victory state triggers correctly.

☐ Shadows do not materially exceed budget.

☐ Drift tiers visually differ.

☐ Boost pads read clearly.

☐ Off-road dust works.

☐ Bloom is controlled.

☐ Motion blur can be disabled.

## Fallback

☐ Missing portrait falls back.

☐ Missing sprite falls back.

☐ Missing kart falls back.

☐ Fallback displays correct monogram.

☐ Fallback does not affect physics.

## Performance

☐ Median \>=60 FPS.

☐ p95 frame \<=18.3 ms.

☐ GPU target \<=12 ms where measurable.

☐ Draw calls target \<=250.

☐ Visible triangles target \<=750k.

☐ Gameplay particles \<=2,500.

☐ Audio voices \<=32.

☐ No sustained major frame stalls.

☐ Five race restarts do not show material memory leakage.

## Repository / Slice 0

☐ GitHub repository exists.

☐ README documents fresh setup and commands.

☐ Approved DOCX PRD is committed.

☐ docs/PRD.md exists and matches approved scope.

☐ IMPLEMENTATION-STATUS.md is current.

☐ DECISIONS.md exists.

☐ TESTING.md exists.

☐ CI pipeline passes.

☐ Clean checkout install/build succeeds.

☐ Typecheck succeeds.

☐ Lint succeeds.

☐ Tests succeed.

☐ Binary/LFS policy is configured before production assets.

☐ Slice 0 contains no gameplay implementation beyond minimal shell.

## Production

☐ Optimized production build completes.

☐ Console contains no uncaught gameplay errors.

☐ All asset paths resolve.

☐ Licenses recorded.

☐ Avatar usage rights verified.

☐ Original item presentation reviewed.

☐ WebGL2 fallback verified.

☐ Production deployment has explicit approval.

# 38. Launch & Rollback Plan

## 38.1 Candidate Build

MMM-v1.0.0-rcN

The candidate must be tested independently from local development state.

## 38.2 Launch Preconditions

- complete vertical-slice flow passes

- baseline browser matrix passes

- performance target passes

- avatar rights are verified

- production dependencies/licenses recorded

- final item/visual differentiation review completed

- production build matches approved PRD

- rollback artifact exists

- public deployment is explicitly approved

## 38.3 Rollback

Retain the previous successful production bundle. Rollback should restore the previous immutable build rather than manually undoing individual production files. A failed release should not modify player data because the vertical slice stores only local preferences.

# 39. Final Definition of Done

The v1 vertical slice is complete only when a clean browser session can:

Load site -\> enter Title Screen -\> activate audio -\> enter Hub -\> launch Kart Racer -\> choose any of 12 roster slots -\> start an eight-racer race -\> drive Circuit Alpha -\> drift through all three turbo tiers -\> collect and use items -\> complete three validated laps -\> receive a final rank -\> see complete results -\> replay or return to Hub

The same release candidate must also satisfy the 60 FPS performance criteria, physics stability, AI completion, item distribution tests, asset fallback tests, cross-browser baseline, production asset-rights requirements, and public-release approval. A successful local build alone is not evidence that this definition of done has been met.

# 40. Open Questions / Deferred Decisions

| **ID** | **Decision Needed**                                                                         | **Responsible Point**          |
|--------|---------------------------------------------------------------------------------------------|--------------------------------|
| OQ-01  | Final mapping of specific roster characters to AA-01 through AA-12 internal balance profiles | Slice 3                        |
| OQ-02  | Canonical approved portrait/cutout source package                                           | Slice 3 / Slice 6 finalization |
| OQ-03  | Circuit Alpha final environmental art theme                                                 | Before Slice 6 final art       |
| OQ-04  | Production hosting provider/domain                                                          | Launch                         |
| OQ-05  | Final music and SFX assets                                                                  | Slice 6                        |

These items do not block Slice 0, Slice 1, or Slice 2 unless a later implementation choice unexpectedly makes one technically prerequisite.

# 41. Implementation Readiness Decision

PRD state: FINAL. Slice 0 is authorized to begin from this document. No additional product clarification is required to create the repository and complete the defined bootstrap work, except where GitHub presents multiple possible repository owners/organizations and the correct destination cannot be safely inferred.

First executable implementation slice: Slice 0 - Repository & Project Bootstrap. Slice 0 must end at a healthy checkpoint with passing CI and updated repository status documentation. Cowork must stop there and wait for product-owner approval before beginning Slice 1.

# Appendix A. Slice 0 Cowork Start Prompt

Use the following prompt in Cowork with this final PRD available to the session. The same prompt is also delivered as a separate text file alongside this document.

You are beginning implementation of Manaconda's Minigame Mayhem from the attached/available final PRD v1.1.
  
Execute ONLY Slice 0 - Repository & Project Bootstrap. Do not begin Slice 1 physics or gameplay implementation.  
  
Treat the final PRD as the approved requirements baseline. GitHub must become the durable project source of truth, not this Cowork conversation.  
  
1. Repository creation and ownership  
- Check my connected GitHub first for an existing repository clearly intended for this project. Do not create a duplicate if one already exists.  
- If no project repository exists, create \`manacondas-minigame-mayhem\`.
- Create it as PRIVATE unless I explicitly tell you otherwise.  
- If GitHub gives you multiple plausible owners/organizations and you cannot safely infer the correct owner, ask me before creating the repository. Otherwise proceed without unnecessary clarification.  
  
2. Bootstrap the technical project  
- Initialize a TypeScript + Vite SPA.  
- Use Three.js as the rendering baseline, Rapier 3D as the physics dependency, and Howler.js/Web Audio as specified by the PRD.  
- Select one package manager and commit its lockfile.  
- Configure TypeScript strictness, linting, formatting, and a test runner suitable for this stack.  
- Add package scripts at minimum for: dev, build, typecheck, lint, test, and a CI-friendly test command if needed.  
  
3. Create the repository structure required by the PRD  
Create the documented structure, including at minimum:  
- \`docs/PRD.md\`  
- \`docs/Accurate_Artistry_Game_Hub_PRD_v1.1.docx\` (retain the final approved Word PRD in the repo if the session can access the file directly; if it cannot, tell me exactly what file action remains for me)  
- \`docs/DECISIONS.md\`  
- \`docs/IMPLEMENTATION-STATUS.md\`  
- \`docs/TESTING.md\`  
- \`public/assets/characters/\`  
- \`public/assets/karts/\`  
- \`public/assets/track/\`  
- \`public/assets/items/\`  
- \`public/assets/audio/\`  
- \`src/app/\`  
- \`src/audio/\`  
- \`src/config/\`  
- \`src/game/ai/\`  
- \`src/game/camera/\`  
- \`src/game/characters/\`  
- \`src/game/items/\`  
- \`src/game/physics/\`  
- \`src/game/race/\`  
- \`src/game/track/\`  
- \`src/game/vfx/\`  
- \`src/schemas/\`  
- \`src/ui/\`  
- \`tests/\`  
- \`.github/workflows/\`  
- \`README.md\`  
- \`.gitignore\`  
- \`.gitattributes\`  
  
4. Establish repository documentation and continuity  
- Convert the final PRD into \`docs/PRD.md\` as a semantically equivalent working implementation copy. Do not simplify or drop requirements.  
- In \`README.md\`, document the product purpose, local setup, run/build/test commands, architecture summary, current slice, and links to the PRD/status documents.  
- Seed \`docs/DECISIONS.md\` with the approved architecture/repository decisions and establish a format for later decisions.  
- Create \`docs/IMPLEMENTATION-STATUS.md\` with: current slice, completed requirements, work in progress, known defects, deferred work, next recommended action, and last verified commit.  
- Create \`docs/TESTING.md\` with local/CI commands, environments, and evidence expectations.  
- Treat these repo files as the primary context for future Cowork sessions. Chat history is supplemental only.  
  
5. Configure binary asset policy before production art is added  
- Configure \`.gitattributes\` and Git LFS policy for large binary game assets before those assets enter Git history.  
- At minimum address GLB and production audio formats; also cover high-resolution character PNG/WebP assets where appropriate.  
- Document the policy so later sessions do not invent a different asset-storage approach.  
  
6. Configure GitHub Actions  
Create a CI workflow that runs on appropriate pushes/pull requests and performs:  
install -\> typecheck -\> lint -\> test -\> production build  
  
CI must use the committed lockfile and fail on validation errors.  
  
7. Minimal app-shell proof only  
- Create only enough SPA shell code to prove the project installs, serves, tests, and builds successfully.  
- Do NOT implement kart physics, Circuit Alpha gameplay, drifting, AI, items, or other Slice 1+ functionality.  
- Placeholder files/directories are acceptable where needed to establish architecture.  
  
8. Validate and repair  
- Run the full documented local validation sequence.  
- Fix any issues you can fix within Slice 0.  
- Verify the production build succeeds.  
- Push the bootstrap state and verify GitHub Actions passes.  
  
9. Close the Slice 0 checkpoint  
Before the final Slice 0 commit/checkpoint, update \`docs/IMPLEMENTATION-STATUS.md\` with the evidence and exact current state.  
  
Report back with:  
- repository URL  
- repository visibility  
- default branch  
- package manager  
- checkpoint commit SHA  
- CI result  
- clean install/build/typecheck/lint/test result  
- top-level files/folders created  
- Git LFS/binary policy configured  
- any deviations from PRD and why  
- open defects/blockers  
- whether every Slice 0 acceptance criterion passed  
- whether Slice 1 is ready to begin  
  
STOP after Slice 0. Do not begin Slice 1 until I explicitly approve the Slice 0 checkpoint.

End of PRD v1.1
