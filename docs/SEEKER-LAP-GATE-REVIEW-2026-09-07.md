# Seeker live review and lap-gate investigation — 2026-09-07

## Product-owner feedback

Manny reports that all six Seeker acceptance checks pass: outgoing acquisition/targeting/pursuit/consumption and forward-only launch; no-target charge retention; escalating incoming warnings, volume and pause; accepted spinout/chase/rear presentation; warning cleanup/restart; and normal selection with accepted Kinetic/Nitro behavior. Preserve those passes.

He additionally observed that an incoming Seeker warning stopped when passing through the lap gate, and no incoming drone arrived. Manny subsequently clarified **lap 2**. Final-race-finish cancellation does not explain his report. Treat the reported ordinary-lap disappearance as unresolved; do not claim a confirmed lap-transition root cause or final Seeker closeout yet. Issue #106 remains separate and deferred.

## Verified source

Main: `bea7a5fe4799d64eebde86a1746663dc001ebf4a`, tree `fc0d5b49a892af9cf8fd451dd9a5279f00f91557`, identical to the local source before investigation. Gameplay PR #108 merged at `ef5dbaeccde123faedd00f625cf18e32c07875de`; latest deployment/validation run `34086652360` passed.

Under approved PRD amendment 2.6, target finish/removal expires a Seeker. `KartTimeTrial` registers player finish only after the production `LapTracker` finishes three laps. `ProjectileSystem` then expires a Seeker targeting that finished racer, `seekerThreats` removes its warning, and `IncomingSeekerFixture` stops spawning new attacks toward the finished player. An ordinary lap increment does not mark the target finished. Other approved destruction causes, including interception, guardrail impact, and lifetime, can also remove a threat.

## Controlled reproduction

`tests/seeker-lap-gate.test.ts` uses actual Circuit Alpha geometry, the incoming fixture, projectile system, lap validator, race finish registration, and warning calculation. Each case earns all previous laps/checkpoints, starts a target 20 m before the offset finish gate at 33 m/s, and launches the ordinary fixture-owned Seeker 45 m behind. It applies the production 13 m CP00 proximity trigger and finished-state propagation. There are no other racer targets in this isolated reproduction.

| Crossing | Warning immediately after gate | Drone outcome |
| --- | --- | --- |
| Complete lap 1 / start lap 2 | Remains active | Continues pursuit and hits target |
| Complete lap 2 / start lap 3 | Remains active | Continues pursuit and hits target |
| Complete lap 3 / finish race | Clears | Expires; no new fixture shots afterward |

All three focused tests pass. Full local `npm run validate` and `git diff --check` also pass: 31 test files / 184 tests, 91.32% statement coverage, strict typecheck, zero-warning lint, existing AI/soak and branding/runtime-asset checks, and production build. The existing large-chunk warning remains non-blocking. This distinguishes final-finish cancellation from ordinary lap behavior. The initial centerline reproduction did not reproduce Manny's lap-2 report. It does not rule out interception/rail impacts along his particular path. The original investigation changed no runtime code; the diagnostic follow-up below is pending publication.

## Lap-2 follow-up

Manny confirmed lap 2, so asking whether it was the final race finish is resolved. Preserve his six passed acceptance checks while investigating the ordinary-lap warning disappearance.

A read-only diagnostic used the exact deployed movement/collision code across **125** gate approaches: offsets -7, -4, 0, 4, and 7 m; speeds 0, 20, 29.67, 33, and 40 m/s; fixture activation 0, 10, 30, 60, and 100 m before the gate. Each shot started 45 m behind on the centerline, with no AI interception targets, and was advanced at 1/60-second steps until impact or the 12-second limit. All **100 moving-target** shots hit. Of 25 stationary-target shots, 20 hit, four ended early near the shoulder (consistent with rail destruction), and one expired at 12 seconds. These cases do not recreate Manny's actual steering/traffic and do not prove his shot's cause.

A separate regression reproduces an AI interception near the gate: player and AI travel at 33 m/s, the AI is 26 m behind the player, and the incoming fixture starts when the player is 60 m before the gate. The AI intercepts the drone while the player is within 15 m of the gate. The warning clears, the player is not hit, and the player's finished flag remains false. This establishes a plausible ordinary collision explanation, not the confirmed cause of Manny's session.

## Diagnostic follow-up — publication review

In explicit `?testSeekerIncoming=1` mode, a completed incoming fixture threat now displays a four-second message explaining its resolution: `HIT YOU`, `INTERCEPTED BY <RACER>`, `HIT GUARDRAIL`, `LIFETIME EXPIRED`, `CLEARED AT RACE FINISH`, `TARGET LOST`, or `REMOVED`. The message reuses the existing test feedback area. Normal gameplay, outgoing-only tests, pursuit, target lock, collision rules, arming, lifetime, and all approved numeric values are unchanged. This is observability for the unresolved report, not a claim that a lap-cancellation defect has been fixed.

The event queue is capped at 40, drained each simulation step, and cleared on disposal. Tests verify actual cause reporting at target finish/loss, impact, rail destruction, and lifetime, plus ordinary lap continuation, AI interception, test-mode filtering, latest-result handling, and queue bounds/cleanup.

After separately approved deployment, repeat only the incoming test through the ordinary lap-2 crossing and report the message shown if the warning disappears. If it reports an interception/rail collision/expiry, assess that event under the already-approved behavior. If it reports target loss or race-finish cancellation on an ordinary lap, use that evidence to continue the underlying defect investigation. Do not require the previously passed six-check matrix again unless a regression is observed. Issue #106 stays deferred; the next item remains unstarted.
