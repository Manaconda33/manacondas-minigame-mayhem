# Slice 5 Acoustic Shockwave Pulse Scope

**Status: GAMEPLAY MERGED / DEPLOYED; CORRECTIVE REVIEW AND LIVE ACCEPTANCE PENDING.**

Deployed gameplay checkpoint: `3f0c9e9d0d89961936beaec3294bfeef2a6c78fe`.

Governing PRD: **v1.1, working implementation amendment 2.11**. Decision: **ADR-072**.

## Purpose

Implement only the existing Acoustic Shockwave Pulse item and the reusable ordered counter boundary it requires. This increment intentionally closes real counter behavior against already accepted Kinetic Disc, Seeker Drone, Slick Trap, Timed Blast Orb, and terminal Apex Missile before later projectile items are added.

It does **not** enable AI item acquisition/use, implement another item, alter probability weights, modify racer stats, change Circuit Alpha/checkpoint/lap authority, reopen accepted item balance, resolve issue #106, complete final Slice 5 soak/performance work, or begin Slice 6.

## Approved gameplay contract

- One charge. A successfully committed pulse consumes the charge even if no target is currently in range and frees the one inventory slot.
- Instantaneous pulse centered on the using kart with **5.0 m** governed radius. Forward/backward ITEM direction is equivalent.
- Shockwave itself is not a persistent projectile/hazard and reserves no slot in the existing shared 40-object item-physics capacity.
- Eligible racer victims are unfinished, non-owner, non-item-immune racers at horizontal center distance `<= 5.0 m`.
- Racer response is **push only**, not conventional spinout: add one outward planar velocity delta, linearly falling from **6.0 m/s at zero distance** to **2.0 m/s at 5.0 m**. Preserve the victim's existing velocity components except for that added planar delta. Do not teleport, snap heading, apply damage, or directly edit race progress.
- Coincident racer centers must use a deterministic finite fallback outward direction so no NaN/zero-normalization path exists.
- Active Ricochet Kinetic Disc and Homing Seeker Drone projectiles inside 5.0 m are destroyed regardless of owner-arming state.
- Slick Trap and Timed Blast Orb inside 5.0 m are cleared through the accepted queued `HazardSystem` boundary.
- Apex countering keeps the already accepted 3D rule: only a missile already in terminal/dive state and within **5.0 m** of the pulse center may be neutralized. Rise, sky travel, and warning/overhead states are unaffected.
- Counter queries resolve before affected projectile/hazard/Apex movement, racer contact, fuse expiry, or blast resolution in the same simulation step. A correctly timed pulse therefore wins that frame.
- The procedural expanding pressure ring is gameplay-readability VFX only. Exact visual easing/duration may be tuned reversibly without changing gameplay radius/timing. Final production VFX/audio belongs to Slice 6.
- Pause prevents gameplay-time progression of any pending presentation/timer state. Restart, return to hub, and disposal clear queued pulse and VFX state.
- No AI item collection, tactical use, or tactical timing is enabled in this increment.

## Implementation boundaries

Prefer a small `ShockwaveSystem` or equivalent item-domain owner that queues one pulse event and presentation without owning racer progress. `KartTimeTrial` may dispatch the pulse into existing systems in a fixed order. `ProjectileSystem` may add a generic queued radial-clear boundary for ordinary projectiles; `HazardSystem.queueClearWithinRadius` and `ApexMissileSystem.queueCounterPulse` remain the accepted hazard/Apex boundaries.

The implementation must not special-case accepted Kinetic/Seeker/Hazard/Apex state machines beyond exposing/removing them through the approved counter interfaces. No direct transform mutation is allowed for racer push. Use physics/controller velocity authority and keep checkpoint/lap/rank code read-only.

## Deterministic acceptance instrumentation

- `?testItem=shockwave` forces only the player's pickup to Shockwave through the existing governed forced-item harness.
- `?testShockwaveCounter=racer|kinetic|seeker|slick|blast|apex` may place exactly one marked bounded counter scenario for the player after race start. These fixtures must use production object/effect rules, must not spend AI inventory, must not enable AI tactical item use, and must reset cleanly.
- A normal URL must never show a Shockwave test badge or force a counter target.

## Automated acceptance gate

1. Charge commit/retention and one-slot release are atomic and deterministic.
2. Forward/backward intents are equivalent.
3. Radius tests cover immediately below, at, and above 5.0 m.
4. Racer push tests cover 6.0 m/s at center, 4.0 m/s at 2.5 m, 2.0 m/s at 5.0 m, coincident-center fallback, owner/finished/immunity exclusion, and no direct progress mutation.
5. Kinetic/Seeker clears occur before their movement/impact and preserve outside-radius objects.
6. Slick/Blast clears occur before trigger/contact/fuse and preserve outside-radius hazards/capacity accounting.
7. Apex clears only terminal/dive objects inside the existing 5 m 3D radius.
8. Pause/restart/disposal/VFX cleanup leaves no queued pulses or leaked resources.
9. Existing Nitro, Kinetic, Seeker, Apex, Blast, Slick, probability, shared-capacity, controller/camera/sprite, AI-race, and Slick/Blast hazard-response regressions remain passing.
10. Normal selector/gameplay remains fixture-free.

## Deployed live gate

1. Forced pickup/use/charge consumption/HUD slot release and pulse tell.
2. In-range racer push versus out-of-range control, with no conventional spinout/teleport/progress jump.
3. Kinetic and Seeker correctly timed counter plus early/out-of-range negative controls.
4. Slick and Blast clear plus out-of-range negative controls.
5. Terminal Apex counter plus non-terminal negative control.
6. Pause/restart cleanup and no shared-capacity leak.
7. Desktop Shift/E and mobile ITEM; reverse modifier remains equivalent for Shockwave.
8. Normal unforced URL plus accepted-item and Slick/Blast AI-hazard regressions.

## Governance / implementation gate

Manny approved this complete scope, including the 6-to-2 m/s racer push falloff, on 2026-09-07. This document, PRD amendment 2.11, ADR-072, `docs/TESTING.md`, `docs/SLICE-5-ITEM-SYSTEM-DESIGN.md`, and `docs/IMPLEMENTATION-STATUS.md` form the governance checkpoint.

Governance PR #125 squash-merged to `main` at `0825ed02f80a67e088416d2d55925309e38eabe5`; post-merge CI/Pages run `34177188784` passed validation and deployment. The gameplay gate is therefore cleared for `feature/slice-5-shockwave`. Gameplay publication/deployment and live acceptance remain later separate gates. No other item effect is authorized by this scope.

Gameplay PR #126 squash-merged at `3f0c9e9d0d89961936beaec3294bfeef2a6c78fe`; post-merge CI/Pages run `34178644577` passed validation and deployment. Independent post-deployment review found that ordinary projectile/hazard clears used 3D distance instead of amendment 2.11's horizontal radius and that the live target snapshot omitted the generic immunity flag. A bounded corrective checkpoint addresses those findings without changing balance, accepted item behavior, AI tactics, or Slice 6 scope. Live acceptance remains blocked until that correction is validated, published, and deployed.
