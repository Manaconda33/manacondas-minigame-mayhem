# Slice 5 Lifecycle / Object-Count Soak Report — 2026-09-17

## Purpose

This report closes the PRD Section 35.6 object-count/lifecycle soak evidence gate for the accepted Slice 5 item layer. It consolidates the existing production stress tests and cleanup contracts and requires the complete repository suite to rerun on the exact publication head.

This checkpoint is evidence-only. It changes no gameplay, item definitions, probabilities, balance, AI tactics, racer statistics, race authority, assets, dependencies, or Slice 6 scope.

## Baseline

- Publication baseline: `b3e102eea06dc485e0c01c8ca7157e48ceb5471f`.
- Final all-item interaction/counter evidence is already complete through PR #165.
- Issue #106 is closed and accepted.
- Experimental balance PR #162 remains separate and is not part of this evidence.
- Item/VFX rendered-device performance certification and final desktop/mobile whole-slice acceptance remain separate gates.

## Soak battery

### Shared physics-capacity saturation and finite transforms

`tests/arc-soak.test.ts` is the primary shared-capacity stress case.

- 20 cycles.
- 40 simultaneous active Arc Blade objects per cycle.
- 800 total throws.
- Eight racer snapshots during updates.
- 100 simulation frames per cycle.
- Every projectile position, velocity, and remaining lifetime is asserted finite on every sampled frame.
- Active count is asserted at exactly 40 at saturation and returns to zero after each cycle.
- Render-group child count remains bounded.
- Final disposal leaves the render group empty.

This directly exercises the PRD shared-capacity ceiling under repeated live object creation/update/destruction rather than only calling the capacity allocator in isolation.

### Projectile completion / impact / expiry cleanup

Focused production suites prove that projectile families do not remain immortal after their governed lifecycle:

- `tests/projectile-system.test.ts`: Kinetic impact, wall-bounce exhaustion, lifetime expiry, owner arming/self-hit, full-capacity rejection, and explicit disposal.
- `tests/blaze-orbs.test.ts`: first valid contact, guardrail destruction, Shockwave counter destruction, immunity absorption, and capacity release.
- `tests/frost-orbs.test.ts`: impact, Shockwave counter, guardrail destruction, exact expiry, repeated resource release, and finite following visuals.
- `tests/arc-blade.test.ts`: catch, wall ordering, counter clear, owner cancellation, exact expiry, shared-slot release, and real Circuit Alpha finite-state coverage.
- `tests/arc-hammers.test.ts`: rebound completion, hit/immunity resolution, Shockwave clear, and finite model/trail lifecycle.

### Hazard restart / expiry / disposal stress

`tests/blast-orb.test.ts` runs **100 restart/removal cycles**. Each cycle verifies:

- Blast Orb geometry and material dispose exactly once.
- Explicit removal and natural fuse completion both return the hazard to baseline.
- Repeated `dispose()` leaves the render group empty.
- Shared `ItemPhysicsCapacity` returns to zero.

`tests/slick-trap.test.ts` runs **50 cleanup cycles** spanning natural expiry, explicit removal, and race/hub-style disposal. Each cycle verifies:

- Slick patch and ring geometry/materials dispose exactly once.
- Repeated remove/dispose is idempotent.
- Shared capacity returns to zero.
- Hazard render groups return to baseline.

The same suites also prove the shared 40-slot budget across projectiles, Apex reservations, Blast, and Slick rather than maintaining independent per-system ceilings.

### Presentation / VFX resource soak

`tests/arc-presentation.test.ts` runs **200 complete throws** and verifies that trails, meshes, contact state, and capacity return to baseline after every throw and repeated disposal.

Additional bounded presentation cleanup is covered by:

- `tests/shockwave.test.ts`: pulse VFX finite lifetime; pending and presentation state cleared by reset/disposal.
- `tests/prismatic.test.ts`: fixed resource pool, pause-safe fade, and disposal.
- `tests/frost-presentation.test.ts`: bounded following presentation and disposal.
- `tests/racer-item-visuals.test.ts`: AI/player racer-owned Nitro/Overdrive/Rocket/Prismatic visual reuse and cleanup.
- `tests/nitro-overdrive.test.ts`: finite active/pulse presentation and full cleanup.
- `tests/hyper-drive-rocket.test.ts`: finite return-fading model and disposal.
- `tests/ink-splat.test.ts`: monotonic fade plus expiry/lifecycle teardown.

### Audio lifecycle

The item presentation layer uses bounded Web Audio voices rather than persistent media loops. Cleanup coverage includes:

- `tests/arc-presentation.test.ts`: bounded voices and stop-on-cleanup.
- `tests/prismatic-music.test.ts`: bounded oscillator/chord resources and partial-construction cleanup.
- `tests/frost-presentation.test.ts`: bounded voices, ended-voice disconnect, pause/disposal cleanup.
- `tests/ink-audio.test.ts`: one bounded cue, disposal, and browser-audio failure containment.
- `tests/nitro-overdrive.test.ts`: gesture-gated bounded activation/pulse audio and disposal.
- `tests/hyper-drive-rocket.test.ts`: bounded, pause-safe audio and disposal.
- `tests/seeker-warning-audio.test.ts`: warning cancellation on pause/target expiry and unavailable-audio containment.

### In-memory item/effect timers

The systems use race-time advancement rather than unmanaged wall-clock callbacks. Focused tests verify expiry/pause/clear/disposal for roulette, spinouts, Frost, Prismatic, Ink, Overdrive, Rocket, projectile arming/lifetimes, hazard fuses/lifetimes, and Shockwave VFX.

A repository scan of `src/game/items/` finds no item-owned `addEventListener`, `setTimeout`, `setInterval`, or Rapier `createCollider` calls. Therefore this Slice 5 item layer has no persistent item-owned DOM listeners, wall-clock timer handles, or item-specific Rapier colliders that require a separate leak counter.

## Acceptance mapping

| Reliability requirement | Evidence |
| --- | --- |
| Every projectile/hazard resolves after impact, completion, counter, or expiry | Focused projectile/hazard suites listed above plus full-suite CI. |
| Repeated-use soak leaves no immortal item objects/VFX/audio state | 800-object Arc stress, 200-throw presentation stress, 100 Blast restart cycles, 50 Slick cleanup cycles, bounded audio/visual lifecycle suites. |
| Race restart/disposal returns active counts to baseline | Blast/Slick stress loops, ItemSystem clear/dispose, RacerEffects clear/dispose, visual/audio disposal suites. |
| Simultaneous item physics objects never exceed 40 | Arc soak saturates exactly 40; Blast/Slick focused tests prove mixed shared-capacity accounting and rejection/rollback at saturation. |
| No NaN/infinite transforms under item stress | Arc soak asserts finite position/velocity/lifetime on every sampled frame; item-focused real-track suites retain finite-state checks. |
| Existing gameplay regressions remain intact | Publication requires the complete repository suite, not a soak-only subset. |

## Performance boundary

`tests/arc-soak.test.ts` logs an informational Node/JSDOM CPU sample for the 40-object / eight-racer update case. That number is **not** used to close the separate approximately 1.0 ms rendered-device item/VFX performance gate. The next checkpoint must instrument and record the governed rendered runtime methodology independently.

## Publication gate

This soak report is complete only if hosted PR CI passes:

1. Git LFS runtime verification.
2. Clean lockfile install.
3. Strict typecheck.
4. Zero-warning lint.
5. The complete automated test suite, including the soak/stress tests above.
6. Production build.

After merge, post-merge `main` validation and GitHub Pages deployment must pass before the repository continuity docs can mark the lifecycle/object-count soak gate closed.

## PRD deviation

None.
