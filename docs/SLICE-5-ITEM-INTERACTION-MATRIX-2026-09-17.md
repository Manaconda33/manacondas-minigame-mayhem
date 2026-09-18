# Slice 5 Final Item Interaction / Counter Matrix

## Purpose

This document is the closure-grade interaction evidence required by PRD Section 35.6 for Slice 5. It consolidates the already accepted item implementations into one system-level matrix and identifies the production automated tests that prove each governed cross-item boundary.

This checkpoint is evidence consolidation only. It does not change item definitions, probabilities, balance, racer statistics, race authority, AI tactics, assets, dependencies, or Slice 6 scope.

## Baseline

- Repository baseline: `071ee9f87cf83e90a7fb4b157b5a1f8007e311cf`.
- All fifteen governed Slice 5 item IDs are implemented and individually accepted at their recorded checkpoints.
- Full AI item tactics plus ADR-084 corrective behavior are live accepted.
- Issue #106 results synchronization is live accepted and closed.
- The probability/distribution gate is already satisfied by the committed 100,000-selection-per-rank evidence.
- The remaining Slice 5 gates after this matrix are lifecycle/object-count soak, item/VFX performance evidence, and final desktop/mobile whole-slice acceptance.

## Interpretation

The matrix below is intentionally behavior-oriented rather than implementation-name-oriented.

- **Prismatic** means the generic item-immunity boundary while Prismatic protection is active.
- **Shockwave** means the supported counter/push boundary, including its special Apex terminal-only rule.
- **Rocket** means Hyper-Drive Rocket's deliberately narrower racer-contact and ground/area-hazard immunity. Rocket does not silently gain generic projectile immunity.
- **Composition** means source-scoped effects remain independent and use maximum authority rather than multiplying speed/acceleration caps.
- **Race authority** means item resolution must not directly mutate checkpoint sequence, lap count, rank locks, finish order, or validated progress.

## All-item interaction matrix

| Item | Governed cross-item behavior | Automated evidence |
| --- | --- | --- |
| Ricochet Kinetic Disc | Prismatic absorbs a valid hostile hit. Shockwave destroys the disc inside the inclusive 5 m horizontal counter radius before same-step movement/contact. Owner immunity is temporary, so later ricochet/self-hit remains legal. | `tests/prismatic.test.ts` protected/expired Kinetic encounter; `tests/shockwave.test.ts` Kinetic clear; `tests/projectile-system.test.ts` owner arming/self-hit and impact cleanup. |
| Homing Seeker Drone | Prismatic absorbs valid contact without bypassing Seeker arming. Shockwave destroys an in-range Seeker before movement/contact. Targeting remains validated-progress-authoritative. | `tests/prismatic.test.ts` Seeker arming/protection; `tests/shockwave.test.ts` Seeker clear; `tests/seeker-drone.test.ts` targeting/guidance; `tests/validated-race-progress.test.ts`. |
| Apex Orbital Missile | Prismatic filters protected victims from terminal AoE. Shockwave cannot erase rise/sky/warning phases and can neutralize only terminal/dive Apex inside the governed 5 m 3D boundary. | `tests/prismatic.test.ts` Apex protected/expired fixture; `tests/apex-missile.test.ts` terminal-only counter boundary and cleanup. |
| Timed Blast Orb | Prismatic/generic immunity excludes protected victims. Shockwave clear resolves before same-step trigger/fuse. Rocket ground-hazard immunity blocks the hostile effect without deleting the hazard for others. | `tests/prismatic.test.ts`; `tests/shockwave.test.ts`; `tests/blast-orb.test.ts`; `tests/hyper-drive-rocket.test.ts`. |
| Blaze Orbs | Prismatic absorbs a valid orb without hostile spin. Shockwave destroys Blaze at the exact counter boundary before same-step movement. Repeated valid hits refresh rather than stack the short spin. | `tests/blaze-orbs.test.ts`. |
| Frost Orbs | Prismatic/generic immunity prevents a new Frost application. Shockwave clears Frost before contact. Existing Frost stacks remain independent from boost/spin state, and later immunity does not retroactively erase an already landed stack. | `tests/frost-orbs.test.ts`; `tests/prismatic-runtime.test.ts`. |
| Rebounding Arc Blade | Prismatic absorbs hostile rival contact. Shockwave clears an in-range blade before movement. Rival hit eligibility is once outbound and once on return, while owner catch remains non-hostile and does not refund inventory. | `tests/arc-blade.test.ts`. |
| Kinetic Arc Hammers | Prismatic absorbs a valid hammer hit. Shockwave clears a hammer at the governed boundary before movement. Successful unprotected contact applies the standard spinout. | `tests/arc-hammers.test.ts`; `tests/arc-hammers-runtime.test.ts`. |
| Slick Trap | Generic/Prismatic immunity skips protected overlap without consuming the patch. Shockwave clear wins before same-step trigger. Rocket ground-hazard immunity blocks Slick's hostile effect while the patch remains available to other racers. | `tests/slick-trap.test.ts`; `tests/prismatic.test.ts`; `tests/hyper-drive-rocket.test.ts`. |
| Acoustic Shockwave Pulse | Protected Prismatic targets are not pushed. Rocket's ground/area-hazard immunity also blocks the hostile push. The pulse clears supported ordinary projectiles/hazards and obeys Apex's terminal-only exception; it does not create a conventional spinout or mutate race progress. | `tests/shockwave.test.ts`; `tests/prismatic.test.ts`; `tests/hyper-drive-rocket.test.ts`; `tests/apex-missile.test.ts`. |
| Vision-Obscuring Ink Splat | Active Prismatic/generic immunity blocks application at resolution. Later immunity does not cleanse already-landed Ink. Ink is not a projectile/hazard and therefore is not erased by Shockwave; it consumes no shared physics slot. | `tests/ink-splat.test.ts`; `tests/ink-runtime.test.ts`. |
| Nitro Surge | Composes source-scoped with Overdrive, Rocket, and Prismatic. Drive authority uses maxima rather than multiplying caps/acceleration, and Nitro's off-road override remains its own source instead of leaking into unrelated effects. | `tests/racer-effects.test.ts`; `tests/nitro-overdrive.test.ts`; `tests/hyper-drive-rocket.test.ts`; `tests/prismatic.test.ts`. |
| Continuous Nitro Overdrive | Repeated pulses refresh one Overdrive source without stacking. Nitro/Overdrive/Prismatic overlap uses maximum authority and independent timers. The six-second window does not grant hostile immunity or shared-capacity objects. | `tests/nitro-overdrive.test.ts`; `tests/racer-effects.test.ts`. |
| Hyper-Drive Rocket | Grants ordinary racer-contact plus supported ground/area-hazard immunity, but deliberately not generic projectile immunity. Rocket/Nitro/Overdrive/Prismatic composition uses maximum authority. Autopilot earns progress through legal controller movement/checkpoint traversal rather than direct progress mutation. | `tests/hyper-drive-rocket.test.ts`; `tests/validated-race-progress.test.ts`; AI/Rocket regression in `tests/ai-race.integration.test.ts`. |
| Prismatic Invincibility | Supplies generic item immunity, +12% source-scoped speed authority, and hostile racer contact against unprotected rivals. Protection expiry restores ordinary item vulnerability without cleansing unrelated already-active effects. | `tests/prismatic.test.ts`; `tests/prismatic-runtime.test.ts`; `tests/prismatic-music.test.ts`. |

## Counter-family coverage

### Shockwave supported objects

The full supported counter family is covered across production systems:

- Kinetic Disc and Seeker Drone: `tests/shockwave.test.ts`.
- Blaze Orbs: `tests/blaze-orbs.test.ts`.
- Frost Orbs: `tests/frost-orbs.test.ts`.
- Rebounding Arc Blade: `tests/arc-blade.test.ts`.
- Kinetic Arc Hammers: `tests/arc-hammers.test.ts`.
- Slick Trap and Timed Blast Orb: `tests/shockwave.test.ts` plus their focused suites.
- Apex Orbital Missile: `tests/apex-missile.test.ts`, terminal/dive only.
- Racer push plus immunity exclusions: `tests/shockwave.test.ts`, `tests/prismatic.test.ts`, and `tests/hyper-drive-rocket.test.ts`.

Ink, Nitro Surge, Nitro Overdrive, Hyper-Drive Rocket state, and Prismatic state are not Shockwave-destroyable world objects and are intentionally outside the counter-clear family.

### Defensive-boundary coverage

- Prismatic is the generic item-immunity defense and is tested against projectile, hazard, Shockwave, Ink, and hostile racer-contact paths.
- Hyper-Drive Rocket is intentionally narrower: racer-contact and supported ground/area-hazard protection only. A projectile can still hit a Rocket racer.
- Frost and Ink demonstrate the no-retroactive-cleanse rule: immunity prevents new application but does not erase an already accepted effect.
- Shockwave countering destroys/clears eligible world objects but does not refund the original user's inventory or rewrite race state.

## Race-authority guard

The matrix closes the PRD acceptance criterion that item interactions do not invalidate lap state.

Evidence:

- `tests/validated-race-progress.test.ts` preserves checkpoint-authoritative ranking/progress snapshots.
- `tests/prismatic-runtime.test.ts` verifies hostile contact/item resolution without race-progress mutation.
- `tests/shockwave.test.ts` verifies push without progress mutation.
- `tests/hyper-drive-rocket.test.ts` verifies legal controller movement and checkpoint-earned overtake rather than transform/progress writes.
- `tests/ai-race.integration.test.ts` retains multi-racer race completion under item-capable AI.

No item-system test is permitted to satisfy this gate by directly editing checkpoint/lap/finish authority.

## Publication gate

For this matrix checkpoint:

1. Hosted PR CI must pass Git LFS verification, clean install, strict typecheck, zero-warning lint, the complete automated suite, and production build.
2. No gameplay or balance file should change.
3. The PR diff must contain only evidence/governance documentation.
4. After publication, `docs/SLICE-5-ITEM-SYSTEM-DESIGN.md` may mark the item interaction/counter matrix evidence, item-hit race-authority guard, Hyper-Drive legal-progress guard, and already accepted AI item-use row complete.
5. This checkpoint does **not** close lifecycle/object-count soak, item/VFX performance evidence, gameplay capture, or final desktop/mobile whole-slice acceptance.

## PRD deviation

None.
