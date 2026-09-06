# Kinetic Disc live review — September 6, 2026

## Initial PR #104 deployed checkpoint (historical)

- Main/PR #104 merge: `655e68e554d9d6f4567e5136bdeb3b4e57a6f570`.
- CI and Pages deployment: successful run `34033720883`.
- Main tree: `c9a60377956503b6f4de8eeb026e4f7ffb063408`, identical to the locally reviewed source tree.
- Governing PRD: v1.1, amendment 2.4. No new balance approval is inferred from this review.

## Initial product-owner result (superseded)

Manny playtested as Manaconda. The disc can hit nearby racers but does not reliably catch full-speed opponents. Guardrail bounces sometimes fail to reach the opposite rail, contrary to his expectation. He passes all other checks from the Kinetic acceptance gate, including the real spinout, chase/rear camera presentation, perspective-correct approved hit assets, and racer/guardrail contact. At that initial review, Kinetic Disc acceptance remained open for these two concerns.

## Speed diagnosis

The deployed kart formula is `23 + ((Speed - 1) / 9) * 10` m/s. A disc launches at 28 m/s plus 0.35 times inherited planar velocity, with that inherited input clamped to 8 m/s. A straight forward shot from a fast-moving kart therefore reaches only 30.8 m/s.

| Racer / target | Normal maximum (m/s) | Disc closing speed (m/s) |
| --- | ---: | ---: |
| Manaconda / Speed 7 | 29.67 | 1.13 |
| Speed 8 racers | 30.78 | 0.02 |
| Krios / Speed 10 | 33.00 | -2.20 |

At equal heading and sustained speed, the disc closes only about 10.2 meters on Manaconda over its nine-second lifetime, before accounting for spawn offset and hit radius. It cannot catch Krios at his ordinary top speed. Boosts and the existing bounded AI speed allowance can widen this mismatch. These are straight-line relative-speed calculations, not guarantees of hits around bends.

## Ricochet diagnosis

A read-only diagnostic exercised the actual deployed `ProjectileSystem`, `CircuitAlpha`, and guardrail contact code. It tested 12 evenly spaced sample indices (0, 32, ..., 352), each at launch angles -90, -60, -30, -15, -5, 5, 15, 30, 60, 90 degrees relative to its local tangent. Launches started at the centerline, y=0.72, with Manaconda-speed velocity along the launch heading. Each simulation used 1/60-second steps, no racer targets, and the ordinary lifetime/bounce limits. It compared current 28 m/s base speed with an in-memory-only 42 m/s candidate; no runtime configuration was changed.

| Base speed | Shots | Second bounce on same side as first | Second bounce on opposite side | Fewer than two bounces |
| --- | ---: | ---: | ---: | ---: |
| Current 28 m/s | 120 | 37 | 83 | 0 |
| Candidate 42 m/s | 120 | 36 | 84 | 0 |

Reflection preserved projectile speed to floating-point tolerance (maximum difference under 1e-12 m/s). A representative current-speed shot from sample 0 at +15 degrees contacted the same side at 1.283, 3.483, and 5.633 seconds, then exhausted its bounce allowance at 8.233 seconds. This reproduces a plausible explanation for the reported path: on a curved course a shallow reflected trajectory can meet the same rail again before reaching the opposite side. It does not establish the exact cause of every user-observed shot or prove all contact cases correct. Increasing speed alone did not materially change this behavior in this diagnostic set.

## Proposal — approved by Manny on 2026-09-06

1. Raise Kinetic Disc base speed from 28 to **42 m/s** (+50%). Retain the bounded inherited contribution, yielding about **44.8 m/s** for a straight forward shot from a fast kart. This closes a 30 m gap at sustained normal speed in roughly 2.0 seconds against Manaconda or 2.5 seconds against Krios, ignoring spawn offset, hit radius, bends, and intervening impacts.
2. Preserve angle-of-incidence reflection and speed retention. Do not silently introduce a minimum inward angle or force alternating-rail bounces; those would change the approved ricochet rule. If Manny wants a guaranteed cross-track bounce, resolve that separate product choice before implementation.
3. Add moving-target catch-up checks using actual racer speeds, plus shallow-angle curved-rail trajectory regressions at the approved new speed. Existing spinout, asset, lifetime, bounce-limit, owner/self-hit, cleanup, and inventory behavior must continue passing.
4. Record the approved balance change in the PRD/decision log only after approval. Publish through a validated corrective PR, then retest catch-up and ricochet expectations before final item acceptance.

Manny subsequently approved the 42 m/s base speed with the existing angle-based reflection rule. Implementation is governed by amendment 2.5 / ADR-066. The diagnostic above remains historical evidence from the PR #104 source; its 42 m/s run changed only an in-memory candidate. Those corrective gates subsequently passed as recorded below.

## Final acceptance — LIVE ACCEPTED

PR #105 merged at `1497672c639adaf6ca71f2aa775d4e0c23572b33`. Post-merge [CI/Pages run 34034999554](https://github.com/Manaconda33/manacondas-minigame-mayhem/actions/runs/34034999554) passed validation and deployment. The deployed source tree is `7ce95dcd49ef3f1c0c357b3080cdfe4761f7db4c` under PRD amendment 2.5.

Manny's [final acceptance comment](https://github.com/Manaconda33/manacondas-minigame-mayhem/pull/105#issuecomment-5559436832) confirms the 42 m/s base speed, acceptable angle-based ricochets, existing spinout, chase/rear perspectives, and normal unforced selection all pass. **Kinetic Disc is LIVE ACCEPTED.** This supersedes the initial partial acceptance and pending corrective gates throughout this record.

During the same retest, later AI finishers failed to refresh the post-player-finish standings tile. [Issue #106](https://github.com/Manaconda33/manacondas-minigame-mayhem/issues/106) tracks this as future development. Manny explicitly excludes it from Kinetic acceptance blockers. He is ready to continue Slice 5; the next bounded scope is proposed separately. Slice 6 remains locked.
