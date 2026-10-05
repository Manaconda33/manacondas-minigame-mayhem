# Neon Grid Billboard booster reposition measurement

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
