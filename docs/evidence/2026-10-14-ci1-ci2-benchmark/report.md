# CI-1 trusted evidence and CI-2 worker benchmark

**Date:** 2026-10-14
**Report branch:** `experiment/ci-validation-optimization-benchmark-20261014`
**Verified base:** `main` at `669e227a1c0bcff3fa7a1d403eb379311500f1e4`
**Pinned benchmark runtime:** `25ea008b15852d593681f5b3b2a17b467a193472`
**Pinned runtime tree:** `92e6cb7571f9b4ddbb25c6754c6216e3533f534b`
**Scope:** Evidence audit, local Node 22 benchmark, and documentation only. No workflow, evidence contract, tests, gameplay, production assets, branch protection, Pages output, or PRD requirements were changed.

## Verdict

- **CI-1: PARTIAL.** The README-only fast path is demonstrated, and the full-validation fallback has passed hosted CI. Trusted evidence reuse is **not demonstrated**. The successful producer run combines artifacts from two workflow attempts, which the verifier is designed to reject.
- **CI-2: PARTIAL.** Two Vitest workers passed three local full-suite observations and reduced median suite wall time by 48% against the one-worker baseline. Four workers failed an existing 15-second test timeout. No hosted worker-count benchmark or workflow change was made.
- **No production-readiness claim.** The measured two-worker result is a candidate for a separate hosted PR benchmark, not approval to change the production command.

## Repository and hosted-run state

`main` is `669e227a1c0bcff3fa7a1d403eb379311500f1e4`. It includes PR #301's CI-1 merge (`178750c4a6b078398d8c20a6d33e684531c2e025`) and PR #303's merge. PR #303 source `1c78b4b21cf4a4255458e684d9a332716dcad674` is merged at the current `main` checkpoint.

The existing README-only fixture, PR #302, passed in 41 seconds in run [38515094890](https://github.com/Manaconda33/manacondas-minigame-mayhem/actions/runs/38515094890) and was closed without merging. The exact-head PR #303 full-fallback run [38571799430](https://github.com/Manaconda33/manacondas-minigame-mayhem/actions/runs/38571799430) passed in 19m58s. It ran all four pinned-runtime validations on a miss; this is fallback evidence, not a cache hit.

## CI-1: producer artifact eligibility

Trusted producer run [38580406017](https://github.com/Manaconda33/manacondas-minigame-mayhem/actions/runs/38580406017) reports success after attempt 2 and four artifacts in the run summary. The matrix history is mixed:

| Producer attempt | Runtime | Result | Job duration |
|---|---|---:|---:|
| 1 | Abyss Fog V3.2 | success | 18m57s |
| 1 | Billboard | success | 3m51s |
| 1 | Far300 | success | 4m06s |
| 1 | Waterfall Dive | failed | 4m27s |
| 2 | Waterfall Dive | success | 2m52s |

The verifier in `tools/ci/pinned-validation-evidence.mjs` requires both the producer job's `run_attempt` and the manifest's `workflowRun.attempt` to equal the successful workflow run's current attempt. That run's current attempt is 2. The first three successful jobs and their manifests are from attempt 1, so they cannot be accepted as attempt-2 evidence. The Dive artifact was produced on attempt 2, but authenticated artifact download was unavailable, so its manifest, archive digest, source/tree identity, lock/toolchain fingerprint, and command list could not be independently verified here. No full four-runtime evidence set is eligible, and no consumer reuse hit occurred.

Public run metadata reports four artifacts; the public artifact panel exposes the Dive record (`11913250248`, archive digest `sha256:3b891ad540068b617e6405e27e1b23a4fab7d29c425f3663d73fa812d3506f87`). This does not substitute for downloading and verifying all four manifests.

### Safe recovery and authentication blocker

The producer workflow triggers only on `push` to `main`; it has no `workflow_dispatch`. It uploads with `actions/upload-artifact@v4.6.2` and does not enable `overwrite`. Those artifacts are immutable by name. Re-running all jobs on the same run could collide with the three already uploaded artifact names; re-running only failed jobs would leave the same mixed-attempt provenance. I did not trigger either rerun and did not alter the verifier.

`gh auth status` reports the injected `GH_TOKEN` as invalid. GitHub REST API access is also blocked by the environment proxy (`Tunnel connection failed: 403 Forbidden`). Therefore I could not control workflow reruns, download/inspect the artifact ZIPs, open or close the authorized fixture PR, push a branch, or inspect current branch-protection settings through the authenticated API.

**There is no safe Actions UI button for a coherent fresh run under the current workflow.** `Actions → Trusted pinned-runtime validation` has no “Run workflow” control because the workflow has no manual trigger. “Re-run all jobs” is unsafe with the current immutable artifact names. A new coherent run requires a separately authorized new push to `main`; that is outside this task's no-main-change boundary. After it succeeds, an unmerged non-allowlisted documentation fixture still needs to show four explicit hits and the invalid-evidence full-validation fallback. Neither was created because the evidence gate and authenticated GitHub controls were unavailable.

Local Node 22 focused CI regression tests passed **32/32** in 1.43s. The suite covers trusted provenance, invalid/missing evidence fallback, untrusted evidence rejection, incomplete/failed validation rejection, and the documentation fast path. These tests do not prove hosted artifact reuse.

## CI-2: Node 22 worker benchmark

The benchmark used the exact pinned tree and lockfile. Node `v22.23.3` was downloaded from `nodejs.org` and matched its published SHA-256 (`df450af89261115ef9f9e3830c3eeb2cc9213b63c720b1af623cb5dcbe2e02de`). npm was `10.9.9`. `npm ci` passed in 3.64s using a temporary npm cache. Lock SHA-256: `f3d6916ffe64fd38ecdbe26c82392512750638433c7127eef31b85a32d9993f1`; normalized LFS inventory: `234d0e7336e2d824e9af54f107a2628ce544b42a2260bafb2d32d8e807c765bc`; `git lfs fsck --objects HEAD` passed.

Test command retained coverage and the existing timeout: `npm run test:ci -- --maxWorkers=N --testTimeout=15000`. The two-worker trials additionally used Vitest's JSON reporter to capture per-file times; no tests or coverage collection were excluded.

| Workers | Trial | Vitest suite time | Full local sequence | Outcome | Coverage (stmt / branch / func / line) | Peak process RSS |
|---:|---|---:|---:|---|---|---:|
| 1 | 1 | 919.91s (15m19.91s) | 920.67s | 133/133 files; 1,085/1,085 tests pass | 92.53 / 82.56 / 92.84 / 94.39% | ~1.01 GiB* |
| 2 | 1 | 478.37s (7m58.37s) | 480.37s | 133/133; 1,085/1,085 pass | 92.53 / 82.56 / 92.84 / 94.39% | 1.40 GiB |
| 2 | 2 | 486.49s (8m06.49s) | 488.56s | 133/133; 1,085/1,085 pass | 92.73 / 82.88 / 93.15 / 94.59% | 1.35 GiB |
| 2 | 3 | 461.10s (7m41.10s) | 494.65s, including typecheck, lint, and production build | 133/133; 1,085/1,085 pass | 92.53 / 82.56 / 92.84 / 94.39% | 1.55 GiB |
| 4 | 1 | 299.51s (4m59.51s) | 301.56s | **132/133 files; 1,084/1,085 tests** | Partial report; run failed | 2.06 GiB |

All three two-worker trials passed every assertion. Their median Vitest suite wall time was **478.37s**, 48.0% below the one-worker observation; worst was 486.49s. The third sequence passed `npm run typecheck`, `npm run lint`, the full two-worker coverage suite, and `npm run build` including approved asset validators. Build emitted the existing large-chunk advisory only. The one-worker memory number is a full-run process-group sample; the two- and four-worker figures use descendant-tree RSS sampling, so memory values are approximate and not perfectly method-matched.

Aggregate child CPU time was 1,137s for the serial suite; the two-worker observations were 1,120s, 1,139s, and 1,112s including the third full-validation sequence; the four-worker run used 1,192s. This is process CPU time, not hosted billing. It shows that two workers cut elapsed time by overlapping the existing test work rather than removing it. The container's shared CPU load and this process-sampling method make CPU comparisons diagnostic only.

Coverage was never lower in the two-worker trials, and trials 1 and 3 exactly matched the one-worker summary. Trial 2 covered additional time-dependent paths in `KartTimeTrial.ts`, `AiDriver.ts`, `AiItemPolicy.ts`, and `ItemBoxSystem.ts` (a 0.20 percentage-point statement increase). This variation means the coverage map is not bit-for-bit repeatable; investigate its race/timing-sensitive source before claiming exact coverage equivalence.

Four workers are rejected under the unchanged contract. The existing test `tests/neon-grid-scene.test.ts` — “quality-scales only the approved expensive dressing and skips wet streaks on Low” — creates Low, Medium, and High scenes. It took **15.935s**, exceeding its existing `--testTimeout=15000`. It passed three two-worker runs in 12.910s, 14.086s, and 13.309s, leaving little timeout headroom. Four-worker execution also made the six slowest listed files slower in that trial. No timeout was raised.

These are local shared-container results, **not GitHub-hosted measurements**. The container had a 4-CPU quota and 32 GiB memory limit; multiple long-running Vite servers from existing worktrees were present and left untouched. The shared load makes timing noisy. There were not three practical one-worker or four-worker trials: the four-worker full suite already failed the fixed timeout, and a serial suite takes about 15 minutes. Exact per-run summaries and the six-file measurements are in [measurements.json](measurements.json).

### Six expensive test files

Durations below are per-file wall time under the three successful two-worker runs. Files overlap, so their durations must not be summed as a workflow critical path.

| File | Trial 1 | Trial 2 | Trial 3 | Main profiling lead |
|---|---:|---:|---:|---|
| `neon-grid-stage4-t9-7-city-ground.test.ts` | 115.2s | 121.8s | 108.1s | Repeated city-ground generation and dense mesh/triangle validation; investigate immutable fixture reuse without sharing disposed geometry. |
| `race-diagnostics-routing.test.ts` | 104.7s | 106.4s | 91.8s | Repeated `KartTimeTrial` setup, RAF simulation, and teardown; profile fixture startup and frame-driving before changing any lifecycle assertions. |
| `neon-grid-stage4-task9.test.ts` | 102.5s | 104.4s | 94.6s | Repeated scene/geometry construction; consider common read-only inputs while preserving full geometric checks. |
| `neon-grid-stage4-t9-5.test.ts` | 74.2s | 73.3s | 66.8s | Repeated shortcut/visual geometry generation; measure geometry preparation separately from assertions. |
| `neon-grid-stage4-task9-skyline.test.ts` | 61.7s | 63.2s | 58.7s | Repeated Skyline scene and quality construction; profile before consolidating fixtures. |
| `neon-grid-fog-experiment.test.ts` | 56.8s | 57.5s | 55.8s | Existing fog geometry/resource lifecycle checks; lower priority than city-ground and race-diagnostics profiling. |

These are hypotheses from source/test structure and timings, not approved test refactors. No test code was changed.

## Hosted timing and runner-minute economics

Job-runner minutes below are sums of observed hosted job durations from public workflow graphs, not invoice-rounded GitHub billing. Workflow wall time is separately recorded. “Evidence hit” has no measured row because it has not occurred.

| Scenario | Observed workflow wall | Observed/estimated aggregate job-runner time | Evidence |
|---|---:|---:|---|
| Documentation-only PR | 41s | ~128s (2.13 job-min): `preview-plan` 15s, `validate` 11s, spillway 4s, four pinned-skip jobs 16s total, 22 preview-build jobs 82s total | PR #302 run `38515094890` |
| Full PR, evidence miss | 19m58s | ~37m53s: pinned matrix 32m05s; validate/plan/spillway 2m44s; preview-build matrix 3m04s | PR #303 run `38571799430` |
| Full PR, verified evidence hits | **Not observed** | **Not observed**; miss run suggests roughly 5m48s of non-pinned job time before hit-check job durations | No eligible producer set or fixture PR |
| Trusted producer, attempts 1+2 | Successful after attempt 2 | ~34m13s summed matrix durations, including the failed Dive attempt and its retry | Main run `38580406017` |
| Main CI + Pages | 12m25s | ~15m02s summed direct jobs and 22 preview builds; pinned matrix and spillway skipped on push | Main run `38580406020`; deploy failed |

One fully eligible reuse could save approximately the four pinned jobs' 32m05s of full-validation job time, less evidence-lookup overhead. A normal successful producer attempt would cost about 29m46s using the observed successful job durations; the current mixed-attempt run consumed about 34m13s. This puts break-even near one full reuse in runner-time terms, but producer cost is incurred on every main push under the current workflow. Without a demonstrated hit frequency and lookup-job duration, economic justification remains **unproven**.

The independent producer currently runs on every push to `main`, even when the validation contract and four pinned runtimes are unchanged. A future, separately approved improvement could reuse a still-valid artifact from a prior successful main run only after validating exact source pin, asset inventory, dependency lock, workflow/test fingerprint, toolchain, command list, manifest digest, and producer provenance. On every miss, expiry, or changed fingerprint it must execute full validation. This source-fingerprint scheduling proposal is not implemented here.

The CI-1 full PR with a hit target (<5m) is not measured. Removing the 19m38s V3.2 pinned job should make the target plausible, but the four evidence-check jobs and all other jobs still run. For evidence misses, the two-worker local full-validation sequence was 8m14s, while the hosted baseline full PR was 19m58s; extrapolating a hosted result around 11–13 minutes is only a projection. No under-5 or 8–12 minute hosted claim is made.

## Other hosted issues and approval gates

Main CI/Pages run [38580406020](https://github.com/Manaconda33/manacondas-minigame-mayhem/actions/runs/38580406020) took 12m25s and failed in `deploy` after assembly. The separate Pages `.gitkeep` delivery issue was not modified or re-investigated in this experiment. The active protection ruleset's current required checks could not be freshly queried because authenticated GitHub access was unavailable; prior repository records say only `validate` is required.

No PRD or gameplay requirement changed. `docs/DECISIONS.md` is unchanged because no new owner policy decision is being recorded. Before any production workflow change, require a hosted PR that runs the exact Node 22 worker command, passes all tests/coverage/build checks, verifies evidence fingerprint invalidation for the command change, and confirms timeout headroom. Before CI-1 can be called complete, an authorized fresh coherent trusted producer run and an unmerged non-allowlisted fixture must demonstrate four actual trusted hits plus full validation on invalid/unavailable evidence.

## Checkpoint

The report and implementation/testing status updates are committed on the isolated documentation branch only. No changes were pushed because GitHub credentials are unavailable. The production runtime, `main`, PRD, CI workflows, trusted evidence contract, and Pages deployment remain unchanged.
