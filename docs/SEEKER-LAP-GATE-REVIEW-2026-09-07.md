# Seeker live review and lap-gate investigation — 2026-09-07

## Product-owner feedback

Manny reports that all six Seeker acceptance checks pass: outgoing acquisition/targeting/pursuit/consumption and forward-only launch; no-target charge retention; escalating incoming warnings, volume and pause; accepted spinout/chase/rear presentation; warning cleanup/restart; and normal selection with accepted Kinetic/Nitro behavior. Preserve those passes.

He additionally observed that an incoming Seeker warning stopped when passing through the lap gate, and no incoming drone arrived. Which lap crossing this was has not yet been established. Do not assume that it was the final finish, classify it as a confirmed defect, or claim final Seeker closeout before resolving that distinction. Issue #106 remains separate and deferred.

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

All three focused tests pass. Full local `npm run validate` and `git diff --check` also pass: 31 test files / 184 tests, 91.32% statement coverage, strict typecheck, zero-warning lint, existing AI/soak and branding/runtime-asset checks, and production build. The existing large-chunk warning remains non-blocking. This distinguishes expected final-finish cancellation from a possible intermediate-lap problem; it does not establish which event occurred in Manny's session or rule out interception/rail impacts along his particular path. No runtime code, tuning, or deployed behavior changed in this investigation.

## Outstanding detail

Was the observed gate crossing the end of lap 3, or the transition into lap 2 or lap 3? If it was an ordinary lap crossing, continue the investigation with that scenario while preserving all previously passed checks. The next item remains unstarted.
