# Slice 5 approved next increment: AI hazard response

**Status: IMPLEMENTED AND LOCALLY VALIDATED. PR #122 governance merge/deployment passed; gameplay publication/deployment and live acceptance remain pending.**

Baseline: `main` at `190a7d1d926287c1c6cd15479a9e46ee2052d759`. Nitro Surge, Ricochet Kinetic Disc, Homing Seeker Drone, Apex Orbital Missile core, Timed Blast Orb, and Slick Trap are live accepted. Slice 5 remains active; Slice 6 remains locked.

**Approval record:** Manny approved this AI hazard-response scope as written on 2026-09-07 and explicitly directed the governance checkpoint to correct the stale README Slick/count status. PRD working amendment 2.10 and ADR-071 govern the approved fill-ins below once this checkpoint merges and its post-merge CI/Pages gate passes.

The PRD already requires AI obstacle avoidance to detect kart bodies, Slick hazards, Blast Orbs, and static track obstacles, temporarily deviate from the ideal spline, and return gradually rather than snapping. Existing `AiDriver` behavior already has bounded lane selection around nearby racer bodies. Blast Orb and Slick Trap were deliberately implemented first and their scopes explicitly deferred hazard avoidance until both hazard types existed. That prerequisite is now satisfied.

This proposal is intentionally narrower than full `AiItemPolicy`: it adds AI movement response to the two accepted hazard classes only. It does not let AI racers acquire or use items, does not implement Shockwave/Prismatic/Hyper-Drive behavior, does not change hazard physics, and does not alter existing racer stats, item probabilities, track/checkpoint authority, accepted item balance, character assets, or Slice 6 scope.

## Repository reconciliation note

`docs/IMPLEMENTATION-STATUS.md` and the merged PR #121 acceptance record correctly show Slick Trap as live accepted and nine item effects remaining. `README.md` is stale: it still omits Slick Trap from the accepted-item list and says ten effects remain. If this scope is approved, the governance checkpoint should correct that README status at the same time; no product behavior changes are implied by that correction.

## Existing authoritative requirements

- PRD Section 21.5: AI detects kart bodies, oil/slick hazards, Blast Orbs, and static track obstacles; temporarily deviates from the ideal spline; then returns gradually rather than snapping.
- Existing AI steering/lane selection remains authoritative for kart-body avoidance, lane bounds, character Speed-stat ceilings, corner judgment, and bounded rubber-band behavior.
- `HazardSystem` remains authoritative for Blast Orb/Slick state, ownership, movement, timers, trigger/detonation, removal, shared capacity, and cleanup.
- Hazard response must not directly mutate lap/checkpoint/race-progress authority.
- General AI item acquisition/use remains required later in Slice 5 but is not part of this bounded increment.

## Proposed implementation fill-ins

| Choice | Proposed initial behavior |
| --- | --- |
| Architecture | Add a small typed `AiHazardAwareness` input boundary consumed by `AiDriver`. `KartTimeTrial` orchestration passes read-only accepted `HazardSystem` snapshots into AI steering. Hazard-specific decision logic stays out of `KartController`, race progress, and hazard physics. |
| Supported hazards | Respond only to active **Slick Trap** and **Timed Blast Orb** hazards in this increment. Future hazard/projectile classes require their own governed extension. |
| Route-relative detection | Project AI and hazards onto Circuit Alpha and reason by wrapped forward route distance so a physically nearby hazard on another section of the circuit does not create a false avoidance response. Consider hazards up to **20 m ahead** along the legal route; hazards clearly behind the AI do not affect lane choice. |
| Candidate lanes | Reuse the existing five bounded candidate lane offsets `[-3.3, -1.65, 0, 1.65, 3.3]`. Hazard response augments the existing lane decision instead of directly overriding steering or teleporting lateral position. |
| Slick safety footprint | Treat a candidate lane as hazard-conflicted when its projected center path passes within **2.5 m** of a Slick center. This includes the governed 1.1 m trigger radius plus kart/readability margin; it does not change the Slick trigger itself. |
| Blast safety footprint | Treat a candidate lane as hazard-conflicted when its projected center path passes within **4.5 m** of the Blast Orb's current/predicted center. This is an AI planning margin only; the governed 4.0 m blast radius remains unchanged. |
| Moving Blast prediction | Evaluate the orb's current position plus a **0.5 s** forward prediction, capped by remaining fuse time, using the accepted planar velocity and 6 m/s² drag model. This avoids steering toward a lane the moving orb is about to occupy without changing orb physics. |
| Lane choice | Prefer the nearest candidate to the AI's normal preferred lane that is outside all detected hazard footprints. If every candidate is conflicted, choose the candidate with greatest minimum clearance. Hazard avoidance may fail under genuinely boxed-in conditions; the requirement is believable response, not guaranteed immunity. |
| Existing racer avoidance | Nearby-racer lane scoring remains active. When hazard and racer pressures conflict, hazard clearance takes precedence over preferred-lane convenience, while candidate selection still respects racer-body clearance where possible. |
| Response hold / return | After the last relevant hazard clears or moves behind the AI, keep the avoidance lane for at least **0.6 race seconds** before allowing normal preferred-lane recovery. The kart reaches and leaves the lane through existing steering dynamics; no lateral snap or transform rewrite is permitted. |
| Speed / braking | Do **not** add a new hidden speed boost, speed penalty, emergency brake rule, or rubber-band change. Existing target-speed logic remains authoritative. This increment changes lane intent only. |
| Owner semantics | AI may respond to hazards regardless of owner. For an AI's own hazard in future item-use work, the hazard can be ignored only when the predicted closest-approach time is wholly inside that hazard's remaining owner-immunity window; otherwise it is treated normally. This future-proofs the awareness boundary without enabling AI item use now. |
| Pause / cleanup | Awareness state advances only with race simulation. Pause freezes response timers. Race restart, return-to-hub, and disposal clear temporary avoidance state; removed/expired hazards disappear from awareness on the next simulation step. |

## Proposed deterministic acceptance instrumentation

Add one opt-in fixture parameter with two values:

- `?testAiHazardAvoidance=slick`
- `?testAiHazardAvoidance=blast`

After five race seconds, the fixture targets the first unfinished AI racer and places one real accepted hazard approximately **12 m ahead along that AI's current route/lane**. The HUD shows a visible `AI HAZARD TEST` badge with hazard type and target racer name. The fixture consumes no racer inventory, enables no AI item-use policy, resets on race restart, and is absent from normal URLs.

For the Blast fixture, use the production stationary Blast Orb placement/fuse behavior rather than inventing a test-only hazard type. The AI is expected to make a visible avoidance attempt before detonation when route geometry permits; the fixture does not guarantee the racer can escape every blast.

## Proposed automated verification gate

Before publication review, automated evidence should cover:

- route-relative hazard projection including start/finish wrap;
- physically nearby but route-distant hazards not causing false avoidance;
- same-lane Slick inside 20 m causing a bounded alternate-lane choice;
- Slick behind the AI being ignored;
- 2.5 m Slick planning footprint boundary immediately below/at/above threshold;
- Blast current-position and 0.5 s drag-aware prediction affecting candidate selection;
- 4.5 m Blast planning footprint boundary immediately below/at/above threshold;
- left/right hazard placement producing deterministic opposite-side or maximum-clearance choices;
- multiple hazards choosing the candidate with greatest minimum clearance when no fully clear lane exists;
- nearby-racer avoidance continuing to operate alongside hazard pressure;
- 0.6 s clear-hold and gradual preferred-lane recovery without transform snapping;
- pause freezing the clear-hold timer;
- hazard removal/expiry immediately disappearing from subsequent awareness input;
- race restart/disposal clearing temporary avoidance state;
- no mutation of lap/checkpoint/race-progress state;
- no change to Speed-stat authority, rubber-band cap, normal AI lane bounds, or controller tuning;
- fixture isolation and normal-URL isolation;
- accepted Nitro/Kinetic/Seeker/Apex/Blast/Slick behavior and probability-selector regressions;
- existing AI three-lap integration, finite-transform checks, and road/grass bounds remaining passing.

Run clean `npm ci`, `npm run validate`, `git diff --check`, Git LFS verification, and hosted PR CI before requesting gameplay publication approval.

## Proposed deployed live acceptance gate

1. `?testAiHazardAvoidance=slick` visibly causes the targeted AI to deviate before the Slick when a clear lane exists, without teleporting or snapping laterally.
2. The targeted AI returns gradually toward its normal lane after the Slick is passed/removed instead of immediately snapping back.
3. `?testAiHazardAvoidance=blast` visibly causes a route/lane response to the accepted Blast Orb before detonation when geometry permits.
4. Avoidance remains road-bounded and does not create obvious grass-cutting, wrong-way, recovery loops, or collision deadlock.
5. Other AI racers continue their normal character-Speed-governed race behavior; nearby-racer passing/avoidance remains believable.
6. Pause/restart clears or freezes fixture/avoidance state correctly.
7. Normal unforced gameplay shows no fixture badge or forced hazard behavior.
8. Accepted Nitro, Kinetic, Seeker, Apex, Blast Orb, and Slick Trap behavior remains unchanged.

## Explicitly deferred

- Full AI item acquisition/use policy (`AiItemPolicy`) and tactical timing for offensive, defensive, boost, catch-up, and rear-deployed items.
- Static track-obstacle behavior beyond the currently governed road/guardrail/lane system.
- Playable Shockwave and real cross-item counter acceptance.
- Prismatic and Hyper-Drive immunity/contact behavior.
- The nine remaining item effects.
- Issue #106 standings-display defect.
- Final all-item interaction matrix, lifecycle/object-count soak, performance closure, and final Slice 5 acceptance.
- Slice 6.

## Approval / implementation gate

Manny approved this scope as written on 2026-09-07. This governance checkpoint:

1. records the bounded AI hazard-response behavior as PRD working amendment **2.10** and ADR-071;
2. adds the automated/live verification rules to `docs/TESTING.md`;
3. updates `docs/IMPLEMENTATION-STATUS.md` with the approved next increment;
4. corrects the stale Slick/remaining-item count in `README.md`; and
5. remains documentation-only.

Gameplay implementation should begin only after that governance checkpoint merges to `main` and its post-merge CI/Pages run passes. Gameplay publication/deployment and live acceptance remain later separate gates.

Any material change to the proposed 20 m lookahead, 2.5 m Slick planning footprint, 4.5 m Blast planning footprint, 0.5 s Blast prediction horizon, 0.6 s clear-hold, supported hazard classes, or lane-only response model requires product-owner approval before implementation tuning.


## Gameplay implementation checkpoint — 2026-09-08

PR #122 merged at `a782ee0996e032ffae06cb41dddafc7e62eed08c`; post-merge CI/Pages run `34157568033` passed. Manny explicitly authorized the bounded gameplay implementation.

Clean local `npm ci --prefer-offline --fetch-retries=0` installed 198 packages. Full `npm run validate` passed strict typecheck, zero-warning lint, **36 files / 278 tests**, **92.75% statement coverage**, branding/runtime-asset checks and production build. `git diff --check` and `git lfs fsck` passed. Hosted PR CI is recorded in the gameplay PR before publication review.

The implementation uses continuous local tangent refinement of existing route projections for planning, without altering checkpoint authority. Clearance is signed distance outside each hazard planning footprint. Among safe candidates, existing racer/preferred-lane scoring remains active; boxed-in choices maximize minimum clearance and use existing lane scoring to resolve ties. Blast prediction uses the accepted drag and fuse cap. Owner immunity exemptions require every considered closest-approach estimate to be strictly inside remaining immunity; stationary/receding cases receive no optimistic exemption.

The approved fixture and visible target-name badge are included. The eight deployed checks above remain pending; the URLs serve the prior accepted build until this gameplay is separately approved and deployed.
