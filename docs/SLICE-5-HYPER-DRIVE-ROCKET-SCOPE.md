# Slice 5 - Hyper-Drive Rocket Scope

## Governance state

**Status:** APPROVED / PUBLISHED GOVERNANCE SCOPE - gameplay, VFX, audio, and presentation implementation are not authorized by this document.

**Work authorization:** Manny approved beginning the next bounded Hyper-Drive Rocket checkpoint in Work on 2026-09-17.

**Proposed governing PRD amendment:** 2.21 / ADR-082; PRD Section 15.16

This document converts the existing Hyper-Drive Rocket requirements into the approved operational contract. It is a governance publication, not a gameplay implementation authorization. PR #154 merged at `ae977623bdc7a209634816e1cea8ef4a799b98c8`; post-merge validation and Pages run `35243454845` passed. A separate implementation gate remains required.

## Context and boundary

Continuous Nitro Overdrive is live accepted under amendment 2.20 / ADR-081. Hyper-Drive Rocket is the remaining unimplemented Slice 5 item effect. It is materially different from the accepted temporary boosts because its defining behavior is legal track navigation under temporary autopilot, not merely a higher speed cap.

The proposal reuses Circuit Alpha projection/checkpoints, KartController movement authority, existing item transactions, RacerEffects composition, race lifecycle, HUD/input, and original procedural presentation boundaries. It does not create a second race director, checkpoint system, physics world, inventory, shared capacity pool, or general AI item-policy system.

## Proposed operational contract

| Area | Proposed contract |
| --- | --- |
| Item identity | Hyper-Drive Rocket, item id `hyper-drive-rocket` |
| Inventory | One charge in the existing one-slot inventory. The first committed activation consumes the charge and immediately frees the slot. A failed activation retains the held item. |
| Collection eligibility | The existing selector prerequisite remains authoritative: rank 6-8 and at least 45 m of negative race-progress gap behind the current leader at collection time. Ranks 1-5 and gaps below 45 m receive zero effective Rocket weight. |
| Activation eligibility | A held Rocket may activate only for an unfinished, present racer. The collection prerequisite is not silently rechecked after the item is held; a valid held item is either committed or retained. Finished, removed, invalid, or failed-transaction activation rejects without consumption. |
| Active window | Exactly 6.0 race seconds of total Rocket state, including the final control-return blend. Pause freezes the remaining window and blend state. |
| Navigation | A focused `RocketAutopilot` projects the racer onto Circuit Alpha, selects a bounded legal lookahead target, and supplies normal controller input toward the track tangent. It never sets a racer transform, edits progress, skips checkpoints, or deposits a racer into a rank. |
| Speed | The governed initial target is a 1.25x normal speed-cap multiplier while the Rocket state is active. Normal acceleration remains authoritative; Rocket does not add a separate acceleration multiplier. |
| Surfaces | Normal asphalt, dirt, grass, boost-pad, ramp, traction, braking, and steering rules remain authoritative. Rocket does not grant an off-road speed-penalty bypass. |
| Automatic overtakes | The autopilot may pass rivals through ordinary legal movement and checkpoint traversal. A pass is earned by position/progress; no racer is moved, ranked, or finished by Rocket code. Natural first place is allowed if earned before the state ends; Rocket may not deliberately deposit the player directly into first. |
| Control ownership | During the full-control portion, Rocket owns throttle and steering toward the legal target while camera, pause, and normal presentation remain usable. During the final 0.30 seconds, autopilot input blends back to the user's input without a yaw/position snap. Rocket cannot be cancelled by steering or braking. |
| Collision immunity | While active, ordinary racer-to-racer contact does not apply collision impulses or collision speed-retention penalties to the Rocket racer. Track geometry, guardrails, checkpoint authority, and legal movement remain authoritative; Rocket is not a phase-through or teleport state. |
| Hazard immunity | While active, ground/area hazards such as Slick, Blast, and Shockwave do not apply their hostile effect to the Rocket racer. Hazards remain in the world for other racers. Rocket creates no counter pulse and does not destroy hazards. Ordinary projectile behavior remains governed by the existing projectile/immunity boundary unless a later approved amendment changes it. |
| Composition | Rocket's 1.25x cap composes with Nitro Surge, Nitro Overdrive, Prismatic, drift boosts, and boost pads through maximum-authority rules; multipliers do not multiply. Existing independent effects retain their own timers and cleanup. |
| AI boundary | This increment does not enable general AI item acquisition, selection, tactical timing, or use. A production player-only test route may exercise Rocket; normal AI inventory policy and the later full AI item-tactics gate remain unchanged. The autopilot seam may be racer-generic so later AI use does not require a second navigation implementation. |
| Capacity | Rocket creates no projectile, hazard, collider, or shared 40-object item-physics reservation. |

The approved collision/hazard boundary is intentionally conservative: Rocket protects the racer from hostile racer contact and supported ground/area hazards, but does not silently grant projectile immunity or alter track geometry. Any broader immunity requires a separate product decision rather than implementation inference.

## Lifecycle and state ownership

- Pause freezes the active Rocket timer, legal-target selection, control-return blend, HUD countdown, VFX animation, and audio progression.
- Recovery does not refund the charge, restart the window, or mutate race progress. The active autopilot reprojects from the recovered legal track position and continues with the remaining time.
- Finish clears Rocket state, autopilot input, collision/hazard protection, HUD state, VFX, and audio before results/victory presentation.
- Restart, return to hub, racer removal, and disposal clear every Rocket state and release all presentation resources.
- A failed activation after the held item becomes invalid has no gameplay or presentation effect and retains the charge when transactionally possible.
- A new item may be collected after the Rocket charge commits because the inventory slot is immediately empty. Using a later held item must not cancel or reset Rocket unless an explicit item interaction is separately approved.

## Architecture boundary

Implementation must remain inside these established boundaries:

- item definitions retain the Rocket identity, charge count, 1.25x cap target, six-second window, and 0.30-second control-return values;
- `ItemSelector` retains the existing rank/gap prerequisite and probability matrix without silent weight changes;
- `ItemSystem` owns atomic charge commit, slot release, input request, pause handling, and lifecycle cleanup;
- a focused `RocketAutopilot`/`HyperDriveRocketSystem` owns active state, projected legal target selection, timer, control blend, and racer-scoped protection queries;
- `CircuitAlpha` remains the only source of legal path/checkpoint geometry;
- `KartController` remains the authority that turns the autopilot's `DriveInput` into movement and velocity;
- `RacerEffects` retains independent boost/protection composition. Rocket immunity must be source-keyed or queried through the focused Rocket system so it cannot clear Prismatic or another active protection;
- `KartTimeTrial` orchestrates player input, race lifecycle, collision/hazard queries, HUD, and presentation without becoming a Rocket switchboard;
- original procedural VFX/audio remain finite, gesture/settings/pause aware, and disposal safe.

The autopilot must not write checkpoint, lap, rank, finish, transform, velocity, or racer-stat state directly. It may only produce bounded controller input and source-scoped protection/boost state.

## Original presentation contract

The bounded increment may add original gameplay-readable presentation:

- a distinct rear energy-rocket/exhaust treatment while autopilot is active;
- a readable HUD state separating Rocket active time and control-return time from the empty item slot;
- a short activation cue, sustained bounded rocket tone, and return-to-control cue;
- a finite overtaking/pass cue only when ordinary race progress confirms a pass, not when Rocket merely targets a rival;
- pause-safe, master-volume-aware, unavailable-audio-safe, and disposal-safe behavior.

No protected-franchise silhouette, iconography, audio identity, production binary dependency, final Slice 6 mix, post-processing, or broad presentation polish is included.

## Deterministic review route

Primary player-only route:

https://manaconda33.github.io/manacondas-minigame-mayhem/?testItem=hyper-drive-rocket

The explicit test override may force the next player pickup to Hyper-Drive Rocket so the gameplay can be reviewed without changing normal selector probabilities or granting AI inventory. The normal URL remains required for selector and regression isolation. The route must not mutate the player's lap, checkpoint, rank, position, or gap to manufacture eligibility or a successful overtake.

## Automated evidence required before gameplay publication

Before implementation publication, tests must exercise production seams and prove:

1. Selector eligibility is exact below/at/above rank 6 and the 45 m gap boundary; the documented matrix and dynamic gap factor remain unchanged.
2. Atomic activation consumes exactly one charge, frees the slot, permits later collection, and rolls back on failed commit or invalid owner.
3. The active state lasts exactly six race seconds, freezes while paused, and includes a bounded 0.30-second return-to-control blend.
4. Legal navigation uses Circuit Alpha projection/lookahead and normal `KartController` input without direct transform/progress/checkpoint/rank mutation.
5. The 1.25x cap is active without an acceleration multiplier or off-road penalty bypass; Nitro/Overdrive/Prismatic overlap uses maximum authority and independent timers.
6. Ordinary racer contact receives no Rocket collision penalty while non-Rocket racers retain normal contact behavior; track geometry remains authoritative.
7. Slick, Blast, and Shockwave hostile effects do not resolve against Rocket while active, while the hazards remain available to other racers; ordinary projectile behavior remains covered by the existing boundary.
8. A staged rival is overtaken through actual movement/progress/checkpoint traversal; no teleport, rank write, direct-first-place deposit, or impossible path is possible.
9. Recovery preserves the remaining state without refund/restart; finish, restart, hub return, removal, and disposal clear all gameplay and presentation resources.
10. Desktop/mobile input, pause, camera/chase/rear presentation, HUD, VFX, audio, and normal unforced isolation use the real `KartTimeTrial` path.
11. The player-only fixture cannot grant Rocket inventory or tactical use to AI, and existing AI/race behavior remains regression-clean.

Helper-only autopilot tests are insufficient. At least one integration path must use the real dispatcher, item system, Circuit Alpha projection/checkpoint path, controller, race lifecycle, contact/hazard resolution, HUD, and presentation cleanup.

## Focused deployed live gate

After separate governance publication, implementation authorization, gameplay publication, and Pages validation, live review must cover:

1. Forced player pickup, HUD identity, atomic slot release, and collection of a later item during Rocket.
2. Rocket activation, legal line following, visible speed increase, normal surface behavior, and no manual steering authority during the full-control portion.
3. A real rival overtake earned through legal movement with no direct placement or checkpoint discontinuity.
4. Collision contact and Slick/Blast/Shockwave immunity without changing the hazards for other racers.
5. The final 0.30-second control return, no snap, six-second maximum, pause/resume, and clean expiry.
6. Recovery, finish, restart, hub, audio/VFX cleanup, desktop/mobile controls, chase/rear readability, and normal unforced isolation.

Record only checks actually observed. A miss, no rival, invalid fixture, impossible geometry, no legal movement, or fixture that never reaches the intended encounter is **INCONCLUSIVE**, not PASS.

## Explicit exclusions

This approved bounded checkpoint does not authorize or change:

- gameplay, VFX, audio, or presentation implementation before a separate authorization;
- general AI item acquisition, selection, tactical timing, or use;
- any item probability, gap factor, rank distribution, or selector behavior beyond documenting existing Rocket eligibility;
- direct lap, checkpoint, rank, finish, transform, velocity, or racer-stat mutation;
- a second navigation/race-authority system, teleport, forced first-place placement, or uncontrolled forward physics;
- projectile immunity unless separately approved; Rocket's approved immunity is limited to racer contact and supported ground/area hazards;
- accepted item behavior, counter behavior, issue #106, dependencies, binary assets, or Slice 6 final polish;
- any balance tuning outside the approved 1.25x cap, six-second state, and 0.30-second control return.

## Approval gates

1. **Scope/governance approval:** COMPLETE. Manny reviewed and approved this operational contract.
2. **Governance publication:** COMPLETE. PR #154 merged at `ae977623bdc7a209634816e1cea8ef4a799b98c8`; post-merge validation and Pages run `35243454845` passed.
3. **Gameplay/presentation implementation authorization:** separate later gate after governance publication.
4. **Gameplay publication and product-owner live acceptance:** separate later gates.
5. **Slice 5 closure:** remains blocked by full AI item-use/tactics, final all-item interaction/counter evidence, soak/performance, final full-slice acceptance, and other recorded closure requirements.
