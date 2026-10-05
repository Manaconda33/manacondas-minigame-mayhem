# Neon Grid Billboard balance evidence

## Entrance boost placement — validated sanity check

Date: 2026-10-05  
Runtime: `406bb5c2f606c2db4d1f2fa9ee7e36e1d6217308`  
CI: `37361803233` PASS

Manny accepted the ON/OFF tell as flavor and retired further separation chasing. The once-only 0.82 ON/static exit retention remains unchanged. The single existing standard boost pad moved from gap fraction 0.55 to **0.16**, with the existing 3 m half-length and 3.5 m half-width unchanged. On the 140.803377 m shortcut, its leading edge is approximately **19.529 m**, just beyond the **19 m** physical commitment point. Regression coverage locks the center to 0.1–0.2, requires the full pad to begin after commitment, and confirms representative main-line lanes cannot trigger boost.

Hosted CI validated PR merge tree `abb5096ed104f05bb976e62a3998b4d994d13000`; GitHub compare reports zero file differences from runtime `406bb5c2f606c2db4d1f2fa9ee7e36e1d6217308`. LFS objects were materialized by `actions/checkout@v5` with `lfs:true`; `git lfs fsck`, clean `npm ci`, typecheck, zero-warning lint, **125 test files / 997 tests**, coverage and production build passed. The workflow executes the same package.json validation constituents rather than invoking the wrapper line literally.

The established paired production-native AA-01/AA-09 × 12/22/30 m/s sanity method produced:

| Metric | 0.16 entrance placement | 0.55 prior round | Mean change |
|---|---:|---:|---:|
| OFF saving | 0.633–0.767 s; mean 0.678 s | 0.517–0.667 s; mean 0.575 s | +0.103 s |
| ON saving | 0.600–0.750 s; mean 0.644 s | 0.500–0.633 s; mean 0.550 s | +0.094 s |
| ON/OFF tell | 0.017–0.050 s; mean 0.033 s | 0.017–0.033 s; mean 0.025 s | +0.008 s |

This is a placement/function sanity check, not a balance experiment, so no numeric target threshold is applied. Every shortcut run entered, exited once, traversed the boost surface and completed with zero guardrail contacts. Savings remain in the same general ballpark as the 0.55 round, with a modest increase consistent with receiving the unchanged boost earlier.

An initial CI attempt `37361040864` exposed one stale test that still expected the first valid post-commit meter to be asphalt. Runtime paired measurements already passed in that run. The assertion was corrected to the newly approved entrance-boost behavior without changing runtime code; final CI `37361803233` is green.

Exact final rows are recorded in `entrance-paired-measurements.json`. The prior 0.55 evidence remains preserved below and in `paired-measurements.json`.

## Prior 0.55 reposition round

Date: 2026-10-05  
Runtime: `2aab14a8a129513ebd31e093c91a680631280294`  
Pad move: `4aea9cbff0c0203e3110d427f86227cff6cc9e75`  
Position test lock: `2aab14a8a129513ebd31e093c91a680631280294`  
CI: `37355905543` PASS

The single approved standard Billboard boost pad remains at gap fraction **0.55**, after commitment and before rejoin. `tests/neon-grid-billboard.test.ts` locks the center to the approved **0.5–0.6** window. No 0.82 retention, pad strength, AI rate, +3.6 s phase, Dive recovery, kart statistic, global physics, item, Tunnel/Dive geometry, repaired 5.3 face, or Stage 4 change was made.

Hosted validation used the PR merge tree `cd5e8a9ecb819a4c792e0c23cede0884d38c9671`; GitHub compare reports **zero file differences** from runtime `2aab14a8a129513ebd31e093c91a680631280294`. LFS materialization/checks, clean `npm ci`, typecheck, zero-warning lint, Vitest coverage and production build all passed. The runtime-tree suite passed **125 test files / 996 tests**.

The existing paired native measurement test uses production NeonGrid/RacerTrack/AiDriver/KartController/native colliders, AA-01 and AA-09 at 12/22/30 m/s, and matched main/OFF/ON sections from main progress 0.07 to the common downstream plane at 0.236.

| Metric | Target | 0.55 measured range | 0.55 mean | 0.93 prior mean | Result |
|---|---:|---:|---:|---:|---|
| OFF saving | 0.8–1.0 s | 0.517–0.667 s | 0.575 s | 0.569 s | **MISS** |
| ON saving | 0.5–0.6 s | 0.500–0.633 s | 0.550 s | 0.536 s | Mostly in band |
| ON/OFF tell value | 0.25–0.4 s | 0.017–0.033 s | 0.025 s | 0.033 s | **MISS** |

Moving the booster earlier changed the mean OFF saving by only **+0.006 s** and mean ON saving by **+0.014 s**. Mean tell separation moved the wrong direction, **-0.008 s**, from about 0.033 s to 0.025 s.

**Conclusion: the position hypothesis is dead.** The lack of runway at 0.93 was not the cause of the missing ON/OFF race value. The earlier pad helps both variants nearly equally, so it does not create the requested 0.25–0.4 s tell separation.

Per PRD amendment 2.23 and Manny's instruction, stop here for owner playtest/decision. Do **not** change the 0.82 multiplier or pad strength without a new decision. No Stage 4 work.

Exact rows are recorded in `paired-measurements.json`.
