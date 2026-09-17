# Slice 5 - Continuous Nitro Overdrive Scope

## Approval state

**Status:** IMPLEMENTATION AUTHORIZED - PR CI passed; publication and live acceptance pending.

**Governance approval:** Manny, 2026-09-17

**Governing PRD:** v1.1, approved implementation amendment 2.20 / ADR-081; PRD Section 15.15

This document defines the bounded contract for Continuous Nitro Overdrive. It resolves the operating details required for implementation while keeping publication, deployment, and product-owner live acceptance as separate gates.

## Context and boundary

Vision-Obscuring Ink Splat is live accepted. Continuous Nitro Overdrive and Hyper-Drive Rocket are the two remaining non-live-accepted item effects. Nitro Overdrive is the next bounded increment because it exercises the existing generic boost, item transaction, HUD, pause, and presentation boundaries without requiring Rocket's legal-path autopilot or automatic-overtake system.

The governance publication and hosted validation gate have cleared. Manny separately authorized the bounded gameplay, VFX, audio, and presentation implementation on 2026-09-17. This checkpoint records that authorization and the resulting local implementation; publication, deployment, and product-owner live acceptance remain separate gates.

## Approved operational contract

| Area | Approved contract |
| --- | --- |
| Item identity | Continuous Nitro Overdrive, item id nitro-overdrive |
| Inventory | One item charge in the existing one-slot inventory. The first committed activation consumes the charge and immediately frees the slot. |
| Activation | Normal ITEM and Brake/Reverse + ITEM are equivalent. The first valid ITEM use starts the six-second window and commits the first pulse immediately. A failed transaction retains the held item. |
| Window | Exactly 6.0 race seconds from the committed activation. The window is race-simulation time and freezes while paused. |
| Repeated pulses | While the window is active, a subsequent ITEM press requests another pulse. A committed pulse requires at least 0.75 race seconds since the previous committed pulse. Rejected cadence presses consume nothing and do not extend or refresh the window. |
| Pulse duration | Each committed pulse supplies an approximately 0.9-second temporary boost state. A later accepted pulse refreshes the same Overdrive pulse state rather than stacking a second source. The pulse cannot extend beyond the six-second window. |
| Speed cap | The Overdrive pulse uses the governed 1.15x normal speed-cap multiplier. |
| Acceleration | Overdrive adds no new acceleration authority; normal acceleration remains 1.0x. This keeps the item distinct from Nitro Surge while preserving the approved generic boost composition boundary. |
| Surfaces | Overdrive does not bypass dirt/grass speed penalties. It preserves normal surface response, boost-pad behavior, ramp behavior, traction, and steering. |
| Composition | Overdrive, Nitro Surge, Prismatic Invincibility, drift boosts, and boost pads compose through the existing maximum-authority rules. Multipliers do not multiply together, permanent stats do not change, and no effect may restore speed or momentum on expiry. |
| Hostile effects | No spinout, collision immunity, hazard immunity, projectile counter, damage, handling impairment, camera hold, or race-progress mutation. |
| Direction | Forward and backward ITEM intent produce the same boost behavior. Brake/Reverse is not a separate Overdrive mode. |
| AI | This increment does not enable general AI item acquisition, tactical selection, or item use. The player-only test route must not grant Overdrive to AI racers. |
| Capacity | Overdrive creates no projectile or hazard and consumes no shared 40-object item-physics slot. |

A racer may collect a new item after the Overdrive charge is committed because the held slot is immediately empty. The active Overdrive window is presentation/effect state, not an occupied inventory slot.

## Lifecycle and state ownership

- Pause freezes the six-second window, pulse cadence clock, pulse timer, HUD countdown, VFX, and audio playback state.
- Player or AI recovery does not refund the charge, restart the window, or reset the cadence clock. The active effect continues through ordinary recovery unless the race lifecycle ends.
- Finish clears the active window, pulse state, HUD state, VFX, and audio so results and victory presentation are not contaminated.
- Restart, return to hub, racer removal, and disposal clear all Overdrive state and release presentation resources.
- A failed pulse request after the window expires has no gameplay or presentation effect.
- A valid pulse request during the active window does not consume another inventory charge.
- Normal item roulette, occupied-slot rules, atomic commit/rollback, and mobile ITEM input remain authoritative.

## Architecture boundary

Implementation must remain inside the established Slice 5 boundaries:

- configuration data owns the six-second window, 0.75-second cadence, 0.9-second pulse duration, 1.15x speed cap, and neutral acceleration;
- ItemSystem owns the initial atomic charge commit, active-window input eligibility, cadence rejection, pause handling, and cleanup;
- RacerEffects owns one generic temporary Overdrive pulse source and composes it with existing boost/protection sources without item-name logic in KartController;
- KartTimeTrial owns orchestration and race-lifecycle wiring only;
- HUD exposes the active window and pulse state without pretending the inventory slot remains occupied;
- controller/input routing reuses the existing desktop E/Left Shift and mobile ITEM controls;
- presentation code owns only finite original Overdrive feedback and cleans it on pause, expiry, finish, restart, hub return, disposal, and replacement.

A focused NitroOverdriveSystem is allowed only if it keeps the above ownership boundaries explicit. It must not become a second inventory, physics, race-authority, AI-policy, or track-navigation system.

## Original presentation contract

Original gameplay-readable presentation is authorized for this bounded increment:

- a distinct procedural rear exhaust/energy treatment while the six-second window is active;
- a finite pulse burst on each accepted pulse;
- a readable active-window or next-pulse HUD state that remains separate from the empty inventory state;
- a short original activation cue and accepted-pulse cue, with no cue for rejected cadence presses;
- pause-safe, settings-aware, disposal-safe audio and VFX;
- no protected-franchise silhouette, iconography, audio identity, or composition;
- no production binary dependency or Slice 6 final mix, post-processing, or polish requirement.

No new kart model or character asset is required by this contract. Any procedural item icon or effect geometry must remain original and gameplay-readable.

## Deterministic acceptance instrumentation

After gameplay implementation is separately authorized and deployed, the primary route is:

https://manaconda33.github.io/manacondas-minigame-mayhem/?testItem=nitro-overdrive

This player-only route must force the next player pickup to Continuous Nitro Overdrive while preserving unrestricted driving, normal AI inventories, normal item-box behavior, and normal ITEM input. The normal route without query parameters is required for fixture isolation and selector regression review.

Optional diagnostic labels may expose the actual Overdrive window remaining, pulse remaining, time since the last committed pulse, and rejected-cadence state. Diagnostics may not create hidden pulses, grant AI items, alter speed statistics, mutate race progress, or block normal input.

## Automated evidence required before gameplay publication

The implementation checkpoint must prove, through the production dispatch/orchestration path rather than helper-only tests:

- exact governed configuration: 6.0-second window, 0.75-second minimum cadence, approximately 0.9-second pulse, 1.15x cap, neutral acceleration, and no off-road override;
- first-use atomic consumption, immediate inventory release, first-pulse eligibility, and rollback when activation cannot commit;
- subsequent ITEM presses create pulses only while the window is active and only at or beyond the 0.75-second cadence boundary;
- rejected cadence presses do not consume an item, reset the pulse, extend the window, emit pulse audio, or alter the racer;
- accepted pulses refresh one Overdrive source without stacking speed-cap or acceleration multipliers and are clipped at window expiry;
- pause freezes every Overdrive timer and presentation state;
- expiry, recovery, finish, restart, hub return, racer removal, and disposal clean all state and resources;
- Nitro Overdrive composes with Nitro Surge, Prismatic, drift boosts, boost pads, asphalt, dirt, grass, and ramps through the approved maximum-authority rules;
- permanent racer statistics, steering, traction, surface penalties, braking, acceleration authority, lap/checkpoint/rank/finish state, and race authority remain unchanged;
- the player-only test override cannot force AI inventory or alter normal selector probabilities;
- HUD, desktop input, mobile ITEM input, audio, VFX, and chase/rear presentation state follow the actual effect lifecycle;
- normal unforced production orchestration remains regression-clean.

A passing automated suite does not claim live visual or product-owner acceptance.

## Local implementation checkpoint

The authorized local implementation adds the focused `NitroOverdriveSystem`, keyed temporary-boost composition in `RacerEffects`, production dispatcher and `KartTimeTrial` input/lifecycle wiring, a separate active-window HUD state, original procedural rear VFX, and original procedural activation/pulse audio. The player-only `?testItem=nitro-overdrive` override remains isolated from AI inventory and selector policy.

Local validation passed after implementation: **55 test files / 473 tests**, **81.99% statement / 77.32% branch / 86.55% function / 83.55% line coverage**, strict typecheck, zero-warning lint, branding/runtime-asset verification, and production build. Hosted gameplay PR CI **35229580296** passed. Merge, Pages deployment, and product-owner live acceptance are not claimed by this checkpoint; the build retains the known Vite large-chunk warning.

## Focused deployed live gate

After separate gameplay authorization, publication, deployment, and successful Pages validation, the live review must cover:

1. Forced pickup resolves to Continuous Nitro Overdrive after the normal roulette and shows the correct HUD identity.
2. The first ITEM use consumes the one charge, immediately frees the inventory slot, and produces a visible first pulse.
3. A new item box can be collected during the six-second window.
4. Repeated ITEM presses produce visibly distinct pulses only after the 0.75-second cadence; early presses do nothing and do not extend the window.
5. The active window lasts six race seconds, each pulse lasts approximately 0.9 seconds, and all boost state clears cleanly at expiry.
6. The Overdrive cap reads as approximately 1.15x normal without a hidden permanent-stat change or an off-road penalty override.
7. Nitro Surge and Prismatic overlap use maximum-authority composition rather than multiplying cap/acceleration sources.
8. Pause freezes the window, cadence, HUD, audio, and VFX; resume continues from the frozen state.
9. Finish/recovery/restart/hub/disposal leave no held charge, pulse, timer, audio, or VFX residue.
10. Desktop and mobile ITEM controls behave equivalently, and chase/rear cameras retain readable original presentation.
11. A normal unforced URL shows no fixture badge or forced Overdrive behavior, and AI racers retain their existing non-item-tactical behavior.

Record the exact implementation commit, hosted PR CI, post-merge validation/Pages run, deployment URL, desktop/mobile results, observed defects, and Manny's explicit acceptance in docs/IMPLEMENTATION-STATUS.md. PASS requires an actual resolved effect and visible outcome; INCONCLUSIVE is not PASS.

## Explicit exclusions

This bounded checkpoint does not authorize or change:

- Hyper-Drive Rocket or RocketAutopilot;
- full AI item acquisition, selection, tactical timing, or use;
- item probabilities, dynamic gap factor, or rank distribution;
- racer statistics, kart physics, steering authority, surfaces, checkpoints, laps, ranks, or finish authority;
- accepted item behavior, counter behavior, issue #106, or shared-capacity limits;
- new dependencies or production binary assets;
- final Slice 6 audio mix, VFX/post-processing, or broad presentation polish;
- any additional Nitro balance tuning outside the governed values above.

## Approval gates

1. **Scope/governance approval:** COMPLETE. Manny approved this bounded contract on 2026-09-17.
2. **Governance publication:** COMPLETE. PR #151 merged at `6c1fe1b78274b25c23fe6fc0a2090e26c086febb`; hosted PR CI and post-merge validation/Pages run `35223980439` passed.
3. **Gameplay/presentation implementation authorization:** COMPLETE. Manny explicitly authorized the bounded Nitro Overdrive implementation on 2026-09-17 after the governance publication gate cleared.
4. **Gameplay publication and product-owner live acceptance:** separate later gates.
5. **Slice 5 closure:** remains blocked by Hyper-Drive Rocket, full AI item-use/tactics, all-item interaction/counter evidence, soak/performance, final full-slice acceptance, and other recorded closure requirements.
