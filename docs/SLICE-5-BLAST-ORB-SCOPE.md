# Slice 5 next increment: HazardSystem + Timed Blast Orb

**Status: APPROVED FOR IMPLEMENTATION by Manny, 2026-09-07. Governance publication/merge and gameplay implementation remain separate gates.**

Baseline: `main` is `648506be658fb2da7a0e08466812c41d55622117`. PR #114 merged the reproducible 100,000-selection-per-rank / 800,000-total probability evidence checkpoint and post-merge CI/Pages passed. Nitro Surge, Kinetic Disc, Seeker Drone, Apex core, item boxes, roulette/HUD/input, and the seeded distribution gate are already accepted. PRD v1.1 working amendment 2.8 / ADR-069 and `docs/SLICE-5-ITEM-SYSTEM-DESIGN.md` govern this approved increment.

## Why this increment is next

Timed Blast Orb is the first approved item owned by the planned `HazardSystem`. Implementing it next closes a currently open functional item gate while establishing reusable hazard lifecycle, area-effect, capacity, cleanup, and future Shockwave-clear boundaries needed by Slick and later counter work. It does not require changing accepted item balance, AI tactics, race authority, character assets, or Slice 6 scope.

## Existing approved requirements

- One inventory charge; consume only after a valid hazard spawn succeeds.
- Forward/backward directional deployment.
- Approximately **3.0-second fuse**.
- Approximately **4.0 m horizontal blast radius**.
- A sufficiently strong direct kart impact may detonate the orb early.
- Blast applies the approved **1.20-second heavy explosive spinout** once per affected unfinished racer.
- Generic item immunity prevents the blast effect for that racer.
- Newly spawned hazards receive short owner immunity/arming; after that window, ordinary self-interaction is allowed.
- Shockwave must eventually be able to clear Blast Orbs within its approximately 5 m pulse radius.
- Pause, restart, expiry, removal, and disposal must leave no orphaned hazard/VFX state.
- Normal probability weights remain unchanged.

## Approved implementation fill-ins

| Choice | Approved initial behavior |
| --- | --- |
| Hazard ownership | Add the approved `HazardSystem` as the owner of Blast Orb state, movement, fuse, collision checks, detonation, rendering, and cleanup. Keep item-specific behavior out of kart physics and `KartTimeTrial` except orchestration. |
| Shared physics-object capacity | Replace the projectile-only 40-object counter with a shared item-physics capacity of **40 total active/reserved projectile + hazard objects**. Existing Kinetic, Seeker, and Apex continue consuming exactly one slot each. Blast Orb consumes one slot for its full lifecycle. A full-capacity use is rejected without consuming the held charge. |
| Forward deploy | Spawn approximately **1.75 m ahead** of the kart and give the orb a deterministic forward roll/toss: **14 m/s base planar speed** plus **0.35x inherited planar owner velocity capped at 12 m/s**. Apply deterministic planar drag of **6 m/s²** until it stops. This creates a useful short-range throw without turning the orb into another high-speed projectile. |
| Backward deploy | Spawn approximately **1.75 m behind** the kart with only **0.20x inherited planar owner velocity capped at 12 m/s**, then the same 6 m/s² drag. This behaves as a drop rather than a backward projectile. |
| Track/rail response | Blast Orb remains ground-bound and cannot pass through Circuit Alpha guardrails. Rail contact resolves inward and removes outward velocity rather than ricocheting; the fuse continues. No rail contact by itself detonates the orb. |
| Arming / owner immunity | **0.35 s** owner-immunity window. Other racers may still trigger a qualifying early detonation during that window; the owner is excluded from that blast until owner immunity expires. After 0.35 s, later self-hit/self-blast is legal. |
| Early-impact threshold | After spawn, direct racer contact triggers early detonation only when planar relative closing speed is at least **8 m/s**. Lower-energy overlap does not detonate or apply spin. This keeps "sufficiently strong" meaningful and avoids brush-contact explosions. |
| Fuse and detonation ordering | Fuse starts at successful spawn and reaches zero after **3.0 race seconds**. On each simulation step, queued Shockwave-clear queries resolve first, then movement/contact, then fuse detonation. An orb removed by a counter cannot detonate later in that same step. |
| Blast resolution | Detonate once at the orb's actual position using the existing generic horizontal `areaEffectVictims()` boundary. Each eligible unfinished racer within **4.0 m** receives one **1.20 s** heavy spin. No extra impulse, damage, or speed multiplier is introduced. |
| Future Shockwave boundary | Add a generic `HazardSystem` clear-within-radius query that can remove Blast Orbs before their detonation step. Automated synthetic tests use the approved **5 m** Shockwave radius. No playable Shockwave is added here, and real Shockwave interaction remains a later acceptance gate. |
| Presentation | Original procedural orb with a readable fuse pulse and short blast ring. Slice 5 functional readability only; no final audio/VFX/post-processing work. |

Manny approved all values and behaviors above on 2026-09-07. PRD amendment 2.8 / ADR-069 record implementation authority. Any material adjustment after live evidence returns for Manny approval before publication.

## Explicitly deferred from this increment

- General AI item acquisition/use policy.
- AI avoidance of Blast Orbs and Slicks; handle both together when the shared hazard-avoidance increment is approved.
- Playable Shockwave and real cross-item counter acceptance.
- Slick Trap implementation.
- Prismatic item implementation; Blast will only honor the already-generic immunity flag.
- Issue #106 standings-display fix.
- Any change to Nitro, Kinetic, Seeker, Apex, rank probabilities, racer stats, track/checkpoint geometry, character assets, or Slice 6.

## Approved test fixture

Reuse `?testItem=blast-orb` for deterministic player pickup. Add opt-in `?testBlastOrbIncoming=1` for incoming-effect review: after five race seconds, place one fixture-owned armed Blast Orb on the legal route a short distance ahead of the player with a visible test badge. The fixture does not consume AI inventory, does not enable AI tactics, and is absent from normal gameplay.

## Automated verification gate

Before publication review, automated evidence should cover:

- forward and backward successful spawn/charge consumption;
- failed spawn at shared capacity preserving the charge;
- exactly 3.0-second pause-safe fuse;
- 0.35-second owner immunity and legal later self-hit;
- forward/backward movement and deterministic drag;
- guardrail containment without rail-triggered detonation;
- early direct-impact threshold immediately below/at/above 8 m/s;
- one-shot 4.0 m horizontal AoE boundary, collateral racers, owner handling, finished-racer exclusion, and generic immunity;
- one 1.20-second heavy spin per affected racer without repeated overlap damage;
- synthetic 5 m Shockwave clear boundary and same-step ordering;
- shared 40-object capacity across Kinetic/Seeker/Apex reservations plus Blast hazards;
- pause, restart, explicit removal, expiry/detonation, and disposal returning runtime counts/resources to baseline;
- incoming fixture isolation and normal URL isolation;
- existing Nitro/Kinetic/Seeker/Apex, camera/sprite, controller, AI-race, probability, and runtime-asset regressions.

Run clean `npm ci`, `npm run validate`, `git diff --check`, Git LFS verification, and hosted PR CI before merge/deployment approval.

## Approved live acceptance gate after deployment

1. Forced Blast Orb pickup resolves correctly and successful ITEM use clears the one-slot inventory.
2. Forward use produces the short-range moving toss; backward modifier produces the slower drop.
3. Fuse visibly resolves at approximately three race seconds and freezes while paused.
4. A qualifying direct kart impact can detonate early; light brush contact does not.
5. Blast radius/collateral behavior feels consistent with 4 m and applies the accepted 1.20-second heavy spin/chase/rear presentation.
6. Owner immunity prevents immediate spawn-overlap self-hit, while a later armed self-hit remains possible.
7. Incoming fixture presents a real incoming Blast Orb and cleans up correctly on restart.
8. Normal unforced URL and accepted Nitro/Kinetic/Seeker/Apex behavior remain unchanged.

Passing this increment closes only the Timed Blast Orb functional gate and the reusable hazard foundation evidence that is actually proven. It does not close AI hazard avoidance, Shockwave interaction acceptance, remaining items, final soak/performance, Slice 5, or unlock Slice 6.
