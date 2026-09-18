# Slice 5 Final Lifecycle / Object-Count Soak

## Purpose

This checkpoint supplies the PRD Section 35.6 object-count soak evidence for the complete Slice 5 item runtime. It is a validation increment only. It does not change gameplay, item definitions, probabilities, balance, racer statistics, AI tactics, race authority, presentation assets, dependencies, or Slice 6 scope.

## Baseline

- Branch baseline: `b3e102eea06dc485e0c01c8ca7157e48ceb5471f`.
- The final all-item interaction/counter matrix is already published and closed.
- All fifteen item IDs and full AI item tactics are already implemented at their accepted checkpoints.

## New whole-runtime soak

`tests/item-lifecycle-soak.test.ts` adds two closure-level stress paths.

### Shared physics-object capacity and cleanup

Twenty complete mixed-object cycles each create:

- 30 simultaneous projectiles spread across Ricochet Kinetic Disc, Homing Seeker Drone, Blaze Orbs, Frost Orbs, Rebounding Arc Blade, and Kinetic Arc Hammers;
- four Timed Blast Orbs;
- five Slick Traps; and
- one active Apex Orbital Missile reservation.

That reaches the governed shared ceiling of exactly **40** simultaneous item-physics objects. The test verifies a 41st projectile and hazard are rejected, all live projectile/hazard snapshots remain finite, Apex cancellation releases only its reservation, ordinary projectile/hazard lifetime processing returns active counts and shared capacity to zero, and disposal returns both runtime presentation groups to baseline.

Across 20 cycles this exercises **800 simultaneous-capacity object lifecycles** in the mixed production systems.

### Timed state, inventory, Ink, Shockwave and racer-owned presentation cleanup

One hundred lifecycle cycles repeatedly activate production Nitro Surge effect state, Nitro Overdrive, Hyper-Drive Rocket, Prismatic protection, Ink Splat, Shockwave, held inventory, and the shared racer-owned Nitro/Overdrive/Rocket/Prismatic visuals.

Each cycle verifies timed expiry and final disposal leave:

- no active Overdrive or Rocket state;
- no remaining Prismatic or generic immunity;
- no Ink targets;
- no pending/visible Shockwave state;
- no held inventory;
- no racer-contact or ground-hazard immunity;
- neutral drive modifiers; and
- empty racer-owned local/world VFX groups.

## Existing focused lifecycle evidence retained

The final soak is cumulative with existing focused tests rather than a replacement for them. Existing suites already prove item-specific impact/expiry cleanup, owner replacement rules, counter destruction ordering, repeated Arc presentation/audio teardown, Blast/Slick repeated resource cleanup, Nitro/Overdrive/Rocket audio disposal, Ink expiry, Prismatic visual/music cleanup, and AI finish cleanup.

In particular:

- `tests/arc-soak.test.ts` already performs 800 Arc throws with 40 simultaneous objects and finite-transform checks.
- `tests/blast-orb.test.ts` includes 100 resource cleanup/restart cycles.
- `tests/arc-presentation.test.ts`, `tests/nitro-overdrive.test.ts`, `tests/hyper-drive-rocket.test.ts`, and `tests/prismatic-music.test.ts` cover bounded/disposable audio and VFX resources.
- The full repository suite remains required so this checkpoint cannot pass while any focused lifecycle regression fails.

## Acceptance

This checkpoint passes only if hosted CI succeeds on the complete repository suite with the new soak included. The evidence must show:

1. shared capacity never exceeds 40;
2. saturation rejects additional physics objects without leaking a slot;
3. active physics-object counts return to zero after lifetime/completion processing;
4. restart/disposal returns shared capacity and runtime presentation groups to baseline;
5. timed buffs/immunities/Ink/Shockwave/inventory state return to baseline;
6. stressed runtime snapshots remain finite; and
7. the complete existing regression suite and production build remain green.

## Boundary

This soak does not certify the separate approximately 1.0 ms item/VFX performance budget and does not replace final desktop/mobile whole-slice acceptance. Those remain the next Slice 5 closure gates.

## PRD deviation

None.
