# CI-1 trusted evidence and CI-2 worker benchmark

**Date:** 2026-10-14
**Report branch:** `experiment/ci-validation-optimization-benchmark-20261014`
**Original benchmark base:** `main` at `669e227a1c0bcff3fa7a1d403eb379311500f1e4`<br>
**Current reconciled base:** `main` at `54f422a5885865a8a418da79c2c96eb904426c93`
**Pinned benchmark runtime:** `25ea008b15852d593681f5b3b2a17b467a193472`
**Pinned runtime tree:** `92e6cb7571f9b4ddbb25c6754c6216e3533f534b`
**Scope:** Evidence audit, local Node 22 benchmark, and documentation only. This branch makes no experiment-specific workflow, evidence-contract, test-code, gameplay, production-asset, branch-protection, Pages-output, or PRD change; it is reconciled with PR #304 already merged on `main`.

## Verdict

- **CI-1: PARTIAL.** The README-only fast path is demonstrated. After PR #304, trusted producer run `38634108940` successfully uploaded all four artifacts. Non-allowlisted fixture PR #305 run `38638418993` produced two genuine evidence hits (Dive and Abyss Fog V3.2); Billboard and Far300 correctly ran full validation on misses. Four-of-four reuse was not demonstrated, so CI-1 remains incomplete.
- **CI-2: PARTIAL, local only.** Two Vitest workers passed three local full-suite observations and reduced median suite wall time by 48% against the one-worker baseline. Four workers failed an existing 15-second test timeout. No hosted worker-count benchmark or workflow change was made because the required four-hit CI-1 gate remains open.
- **No production-readiness claim.** The local two-worker result is not approval to change the production validation command. The partial hosted fixture took 5m24s and does not prove the under-five-minute target.

## Repository and hosted-run state

The original local benchmark started from `main` `669e227a1c0bcff3fa7a1d403eb379311500f1e4`, after PR #303. PR #304 later merged the Pages `.gitkeep` correction; current reconciled `main` is `54f422a5885865a8a418da79c2c96eb904426c93`. PR #301 (merge `178750c4a6b078398d8c20a6d33e684531c2e025`) and PR #303 (`1c78b4b21cf4a4255458e684d9a332716dcad674`) are merged. The README-only fixture, PR #302, passed in 41 seconds in run [38515094890](https://github.com/Manaconda33/manacondas-minigame-mayhem/actions/runs/38515094890). PR #303 full fallback passed in 19m58s in [38571799430](https://github.com/Manaconda33/manacondas-minigame-mayhem/actions/runs/38571799430). Current post-PR #304 artifacts and PR #305 reuse results are in the dated follow-up at the end of this report.

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

Job-runner minutes below are sums of observed hosted job durations from public workflow graphs, not invoice-rounded GitHub billing. Workflow wall time is separately recorded. A four-of-four evidence-hit result remains unmeasured; the partial two-hit fixture is listed below.

| Scenario | Observed workflow wall | Observed/estimated aggregate job-runner time | Evidence |
|---|---:|---:|---|
| Documentation-only PR | 41s | ~128s (2.13 job-min): `preview-plan` 15s, `validate` 11s, spillway 4s, four pinned-skip jobs 16s total, 22 preview-build jobs 82s total | PR #302 run `38515094890` |
| Full PR, evidence miss | 19m58s | ~37m53s: pinned matrix 32m05s; validate/plan/spillway 2m44s; preview-build matrix 3m04s | PR #303 run `38571799430` |
| Full PR, 2 of 4 evidence hits | 5m24s | 15.47 summed job-minutes | PR #305 run `38638418993`; two misses ran full validation |
| Full PR, 4 of 4 evidence hits | **Not observed** | **Not observed** | CI-1 acceptance gate remains open |
| Trusted producer, mixed attempts | Successful after attempt 2 | ~34m13s summed matrix durations, including the failed Dive attempt and its retry | Historical main run `38580406017` |
| Trusted producer, current coherent attempt | 18m47s | 28.38 summed pinned-job minutes | Main run `38634108940`; all four jobs succeeded on attempt 1 |
| Main CI + Pages, previous attempt | 12m25s | ~15m02s | Historical run `38580406020`; delivery check failed on `.gitkeep` |
| Main CI + Pages, current result | 10m43s | 13.38 summed job-minutes | Run `38634108855`; deployment and live-byte checks passed |

One fully eligible reuse could save approximately the four pinned jobs' 32m05s of full-validation job time, less evidence-lookup overhead. A normal successful producer attempt would cost about 29m46s using the observed successful job durations; the current mixed-attempt run consumed about 34m13s. This puts break-even near one full reuse in runner-time terms, but producer cost is incurred on every main push under the current workflow. Without a demonstrated hit frequency and lookup-job duration, economic justification remains **unproven**.

The independent producer currently runs on every push to `main`, even when the validation contract and four pinned runtimes are unchanged. A future, separately approved improvement could reuse a still-valid artifact from a prior successful main run only after validating exact source pin, asset inventory, dependency lock, workflow/test fingerprint, toolchain, command list, manifest digest, and producer provenance. On every miss, expiry, or changed fingerprint it must execute full validation. This source-fingerprint scheduling proposal is not implemented here.

A full PR with four evidence hits remains unmeasured. The observed partial-hit PR took 5m24s and 15.47 summed job-minutes, so the under-five-minute target was not met. Removing the slow V3.2 pinned validation improves the path, but the evidence-check jobs and all other jobs still run. For evidence misses, the two-worker local full-validation sequence was 8m14s, while the hosted baseline full PR was 19m58s; a hosted 8–12 minute result remains a projection, not a measured claim.

## Other hosted issues and approval gates

Historical main CI/Pages run [38580406020](https://github.com/Manaconda33/manacondas-minigame-mayhem/actions/runs/38580406020) took 12m25s and failed in live delivery verification on `.gitkeep` placeholders. PR #304 later corrected this, and main run [38634108855](https://github.com/Manaconda33/manacondas-minigame-mayhem/actions/runs/38634108855) passed deployment and live-byte verification. This experiment did not redesign Pages artifacts. The active protection ruleset's current required checks could not be freshly queried because authenticated GitHub access was unavailable; prior repository records say only `validate` is required.

No PRD or gameplay requirement changed. `docs/DECISIONS.md` is unchanged because no new owner policy decision is being recorded. Before any production workflow change, require a hosted PR that runs the exact Node 22 worker command, passes all tests/coverage/build checks, verifies evidence fingerprint invalidation for the command change, and confirms timeout headroom. Before CI-1 can be called complete, an authorized fresh coherent trusted producer run and an unmerged non-allowlisted fixture must demonstrate four actual trusted hits plus full validation on invalid/unavailable evidence.

## Checkpoint

At the original local checkpoint, the report and implementation/testing status updates had not yet been pushed because the available GitHub API credential was unavailable. The section below records the later reconciliation and hosted results. This branch does not change the production runtime, PRD, trusted evidence contract, or deployment behavior; it only incorporates PR #304, already merged to `main`, and records observed results.


## Follow-up after PR #304 merge and fixture PR #305 — 2026-10-14

This section supersedes earlier statements in this report that no trusted evidence hit occurred or that Pages live verification remained pending. It does not supersede the local-only CI-2 worker measurements.

### Pages and trusted producer

PR #304 merged as `54f422a5885865a8a418da79c2c96eb904426c93`. Main CI/Pages run [38634108855](https://github.com/Manaconda33/manacondas-minigame-mayhem/actions/runs/38634108855) succeeded in 10m43s. The public run graph shows 13.38 summed job-minutes; it completed assembly, Pages deploy, and live-byte verification. The known `.gitkeep` false-404 is resolved for this run. This does not redesign the existing >1 GB Pages artifact architecture.

The independent trusted producer run [38634108940](https://github.com/Manaconda33/manacondas-minigame-mayhem/actions/runs/38634108940) succeeded on attempt 1, with four successful pinned-runtime jobs. It took 18m47s wall and 28.38 summed job-minutes. The producer artifact listing shows these four records:

| Runtime | Pinned source SHA / tree | Artifact ID | Contract fingerprint | Toolchain fingerprint | Archive SHA-256 |
|---|---|---:|---|---|---|
| Billboard | `b942c912510ec86312a9d0cd393d71d2eb478ea8` / `76213c1dff2b434861bf6364ec7c8c9cb003908b` | `11926589084` | `76e203407fddd2a350777bf2cc4dd1e683ce0afbe29edf172d8ae9a23ef95d42` | `78b5fd1cb6fad7cb213ca27e0721e1c1357ebad96709566523c96a97dac7641c` | `481b5306262dc85a22f762ede5297c2d29f0983254a3212756694eef425ac89b` |
| Waterfall Dive | `b49d9876f8c6ce87956f8b91675c3c8180e56b55` / `095bc5185ab5790efed5681dc228442b771b683c` | `11927147706` | same | `78b5fd1cb6fad7cb213ca27e0721e1c1357ebad96709566523c96a97dac7641c` | `0cfb6bb67d60ab57b46c4064793f7d264eab8d2541033a6251d7835501774553` |
| Far300 | `ce6a64cf36b1f110af028536d3ff9c7a306ccbdb` / `c3193b2f1c67635504b5fd410e81e9b5d92ccf4e` | `11927068023` | same | `02e97030c6713c011b2995e049482488a486bb1dcf7af3c1b63a967094c73687` | `9b32ab567d6304f5a4c00a0d48ca778c14b850a52a958e2683bc537ba7eb10ad` |
| Abyss Fog V3.2 | `25ea008b15852d593681f5b3b2a17b467a193472` / `92e6cb7571f9b4ddbb25c6754c6216e3533f534b` | `11929150105` | same | `78b5fd1cb6fad7cb213ca27e0721e1c1357ebad96709566523c96a97dac7641c` | `dcecda1d2cf3baf1bcf93abe79166c8f9c7daecdbe4aeb9f7abd41688d2f243e` |

These artifact names contain the four approved runtime source SHAs (`b942c912…`, `b49d9876…`, `ce6a64cf…`, `25ea008b…`). They share contract fingerprint `76e203…`, lock SHA-256 `f3d6916ffe64fd38ecdbe26c82392512750638433c7127eef31b85a32d9993f1`, and normalized LFS inventory `234d0e7336e2d824e9af54f107a2628ce544b42a2260bafb2d32d8e807c765bc`. The workflow requests Node `22`; consumer fallback logs show Node `22.23.3`. The exact producer Node/npm values are bound in each manifest but are not independently visible without downloading those manifests. The current trusted-producer workflow blob is `171ca6863f409d15b0b4a1ab08d22d18f984dc1d`. Far300's toolchain fingerprint differs from the other three; the fingerprint includes Node, npm, and GitHub runner image identity.

The local workspace mount presents tracked files as mode `600`, producing a sandbox-specific fingerprint `a0bdb2…`. A temporary checkout reconstructed from Git tree modes (`644`/`755`) for exact main `54f422a` produces `76e203407fddd2a350777bf2cc4dd1e683ce0afbe29edf172d8ae9a23ef95d42`, exactly matching producer artifact names. The apparent local/hosted contract mismatch was a filesystem-mode artifact, not evidence of a CI mismatch. No workflow or fingerprint code was changed.

### Fixture PR #305: real reuse and fail-closed fallback

PR #305 remains draft and unmerged. It changes only `docs/evidence/2026-10-14-ci1-trusted-reuse-fixture/README.md` and is outside the fingerprinted validation inputs. Its head is `7302f76c07e52c3e499fa1a3d32d413ec7febd48`, based on `54f422a`.

Hosted run [38638418993](https://github.com/Manaconda33/manacondas-minigame-mayhem/actions/runs/38638418993) passed. `preview-plan` passed in 20s; required `validate` passed in 1m59s. Total wall time was 5m24s. The run had 31 job records, 29 executed jobs, two main-only jobs skipped, and 928 seconds / 15.47 summed job-minutes. The PR CI run does not assemble or deploy Pages.

| Runtime | Decision | Job duration and validation |
|---|---|---|
| Billboard | Evidence miss; full validation-on-miss ran | 4m26s; supplied log: 126 test files / 1,001 tests passed, coverage report present, typecheck/lint/build steps passed |
| Far300 | Evidence miss; full validation-on-miss ran | 4m58s; supplied log: 122 test files / 961 tests passed, coverage report present, typecheck/lint/build steps passed |
| Waterfall Dive | Trusted evidence hit; full-validation-on-miss step skipped | 12s |
| Abyss Fog V3.2 | Trusted evidence hit; full-validation-on-miss step skipped | 11s |

The two misses log `no completed successful independent main-validation artifact matches this source and contract`, then execute and pass full validation. On the successful Dive and Abyss jobs, `preview-plan` succeeded and `docs_only=false`; their full-validation steps were skipped, which means the verifier set `reuse=true`. The verifier returns `reuse=true` only after validating a successful trusted main producer run/job attempt, exact artifact key, archive digest, one-file manifest, source/tree, contract/workflow, lock and LFS identities, toolchain, commands, and run-attempt provenance. Thus **two actual hits are demonstrated**, but the four-hit acceptance gate is not met.

The current consumer logs do not print the expected artifact key or selected artifact/run ID. The public producer run shows the four artifact IDs/digests above, but the exact ID selected for each hit cannot be established from those consumer logs. The generic miss reason does not identify which key component differed. Given the contract key is confirmed equal and toolchain suffixes varied in the producer set, a per-job Node/npm/runner-image mismatch is plausible for the misses, but is not proven; do not change or weaken the toolchain key based on this inference.

The 5m24s partial-hit run is 14m34s shorter than the earlier full-fallback PR #303 run (19m58s), an observed comparison rather than a controlled benchmark. It still exceeds the under-five-minute goal, and differences in PR revision, hosted runner state, and caches prevent attributing the entire time reduction to evidence reuse. PR #302's 41s docs-only result remains the actual fast-path measurement.

### CI-1/CI-2 disposition and next gate

- CI-1 is **PARTIAL**: a valid producer run exists, two jobs reuse evidence, and both evidence misses fall back safely; four actual hits in one hosted fixture and invalid-evidence hosted fallback remain unproven as a combined acceptance package.
- CI-2 hosted worker-count benchmarks were **not started**, respecting the required order. Existing one/two/four-worker results remain local-only and unchanged.
- The trusted producer workflow has a `push`-to-`main` trigger only. Artifact v4 names are immutable; rerunning the same upload jobs with existing names is not a safe way to replace artifacts unless unique names/provenance are deliberately designed and validated. Do not enable overwrite or manufacture a main commit. The next route requires a legitimate authorized main push that produces toolchain keys matching the consumer jobs, followed by another isolated non-allowlisted fixture. Any change to the fingerprinted docs/TESTING file on this report branch also changes the contract when merged; the next producer must run against that updated contract.
- PR #305 remains draft/unmerged. Do not merge it, merge the documentation/report branch, alter main, change the evidence contract, or start CI-2 until the owner authorizes the next gate.
