# Neon Grid Stage 4 release consolidation record

**Date:** 2026-10-10 UTC
**Repository:** `Manaconda33/manacondas-minigame-mayhem`
**Development branch:** `design/neon-grid-circuit-02`
**Purpose:** preserve the complete development history, integrate the exact owner-approved T9.7 experience with current `main`, validate a release candidate, and stop before production deployment.

## Status

The history-preserving integration is complete at merge commit `c51110b62aa3631bc7c7cd947ad055834b277ec5`; GitHub reports PR #285 merged into the development branch at this commit. PR #242 remains Draft and unmerged into `main`. The documentation candidate `74fcf21` started Actions run [38028270864](https://github.com/Manaconda33/manacondas-minigame-mayhem/actions/runs/38028270864), which was canceled after a subsequent documentation-only update; run [38028403667](https://github.com/Manaconda33/manacondas-minigame-mayhem/actions/runs/38028403667) was queued for the next doc candidate and is superseded by this PR-state reconciliation. The latest status must be checked at the [PR #242 Checks tab](https://github.com/Manaconda33/manacondas-minigame-mayhem/pull/242/checks) and reported with the final remote SHA. The owner-approved T9.7 gameplay source remains exactly `75c6c62c865ec3b546f3f2512e649de9ea6d52bc`. **Production readiness is BLOCKED** by the representative-hardware G-05 evidence gap, the Node 22 full-suite timeout failures, and the latest exact-head hosted Actions result. GitHub API GraphQL and REST calls both returned HTTP 403, so PR #242 metadata could not be updated; the full prepared replacement body is preserved in [`pr-242-description.md`](pr-242-description.md). Do not merge PR #242 into `main`, deploy Neon Grid gameplay, mark T9.8 complete, or claim G-05 certification.

## Verified baseline and pull requests

| Item | Verified source or state |
| --- | --- |
| `main` before integration | `f16173c562911df0020aef22dce1521d104d521e` |
| PR #242 original development head | `f4672ef55d6697fb3d205abd03633faa0f821874` on `design/neon-grid-circuit-02`; public PR page reported Draft, base `main` |
| PR #285 approved correction head | `75c6c62c865ec3b546f3f2512e649de9ea6d52bc` on `fix/neon-grid-t9-7-city-ground`; now **MERGED** into `design/neon-grid-circuit-02` at `c51110b62aa3631bc7c7cd947ad055834b277ec5` |
| PR #288 preview-publication head | `32f10ed7f0d449f9738ca3f1f1a96bc35e633167`; PR is Merged into `main` at `b7b26d1a1afaa88a47ecd7a14759b004bd932b5b` |
| Owner approval record on `main` | `f16173c562911df0020aef22dce1521d104d521e` records Manny's approval of the immutable preview pinned to `75c6c62` |
| Consolidation merge | `c51110b62aa3631bc7c7cd947ad055834b277ec5`, parents `75c6c62c865ec3b546f3f2512e649de9ea6d52bc` and `f16173c562911df0020aef22dce1521d104d521e` |

The public PR pages showed PR #242 Draft, PR #285 Open, and PR #288 Merged before the development-branch push. Once the integration merge commit was pushed to the base branch, GitHub marked PR #285 **Merged** at `c51110b`; this is its integration into the development branch, not production. PR #242 remains Draft and unmerged to `main`; PR #288 remains merged and its page displayed **27 checks passed**. PR #285's Checks tab did not expose a completed check summary. The latest candidate-specific CI state is linked from [PR #242 Checks](https://github.com/Manaconda33/manacondas-minigame-mayhem/pull/242/checks).

## Recovery refs and restoration

Before changing the development branch, remote-write capability was verified and all three recovery refs were created without overwriting existing names. Each remote ref was then read back with `git ls-remote` and matched the expected object ID:

| Recovery ref | SHA |
| --- | --- |
| `refs/heads/recovery/neon-grid-20261010-pr242-f4672ef` | `f4672ef55d6697fb3d205abd03633faa0f821874` |
| `refs/heads/recovery/neon-grid-20261010-pr285-75c6c62` | `75c6c62c865ec3b546f3f2512e649de9ea6d52bc` |
| `refs/heads/recovery/neon-grid-20261010-main-f16173c` | `f16173c562911df0020aef22dce1521d104d521e` |

To inspect or recover one later without moving a shared branch:

```sh
git fetch origin refs/heads/recovery/neon-grid-20261010-pr242-f4672ef:refs/remotes/origin/recovery/neon-grid-20261010-pr242-f4672ef
git show --no-patch --decorate origin/recovery/neon-grid-20261010-pr242-f4672ef
git switch --detach origin/recovery/neon-grid-20261010-pr242-f4672ef
```

Use the corresponding ref name for PR #285 or pre-consolidation `main`. These are remote recovery refs; no local-only backup substitutes for them.

## Merge analysis, topology, and conflict resolution

The original PR #242 head is an ancestor of PR #285. The merge base for those two heads was `f4672ef`; PR #285 contributed four commits (`rev-list f467..75c` was `0 4`). The common base of PR #242 and current `main` was `ff40a5b445c5b6b640d5bd9d9d7ab7389fdd7f39`. Before modifying the development branch, `git merge-tree --write-tree --messages 75c6c62 f16173c` produced an automatic merge except for one content conflict in `docs/IMPLEMENTATION-STATUS.md`. The only `main` paths changed since the common base were `.github/workflows/ci.yml` and `docs/IMPLEMENTATION-STATUS.md`.

Integration sequence:

1. Fast-forward `design/neon-grid-circuit-02` from `f4672ef` to the exact PR #285 head `75c6c62`. This retains all four PR #285 commits and the complete earlier PR #242 history.
2. Merge `f16173c` with `--no-ff`; the resulting merge is `c51110b`.
3. Resolve the single implementation-status conflict by retaining the exact latest-main T9.7 owner-approval record and the complete development-branch history. No dated history was discarded.
4. Preserve the automatic CI workflow merge, including PR #288's exact `75c6c62` pin, preview path, source marker, prior preview entries, and current Pages assembly checks. Remove trailing whitespace from three imported blank lines so `git diff --check` remains clean; this does not alter workflow behavior.

There were no runtime-source, runtime-asset, dependency, or gameplay conflicts. No force push, destructive rebase, squash, or history rewrite was performed. The merge base and second parent ensure current `main`, including PR #288 publication and the owner-approval record, is reachable from the candidate.

## Runtime and asset preservation

The comparison `git diff --exit-code 75c6c62 HEAD -- src assets public package.json package-lock.json vite.config.ts tsconfig.json tsconfig.app.json tsconfig.node.json index.html .gitattributes .gitignore eslint.config.js .prettierrc.json .prettierignore` passed after integration. The only tree differences from the approved runtime at that point were `.github/workflows/ci.yml` and `docs/IMPLEMENTATION-STATUS.md`. The expanded release notes added afterward are documentation-only. Re-run the same comparison against the final branch tip before considering any further work.

The approved runtime includes the complete Neon Grid route and three existing shortcuts, gameplay/AI/items/physics/HUD/camera work, Task 8 protected visuals, T9.7 shared city ground and sector scenery, accepted billboard artwork and warning assets, diagnostics, tests, and historical evidence. No approved artwork or gameplay behavior was removed. `git lfs fsck --objects HEAD` returned `Git LFS fsck OK`; the Node 24 production build verified the approved audio, billboard/signage, terrain, character, kart, Results/Podium, and other runtime assets.

## Full file manifest

[`file-manifest.tsv`](file-manifest.tsv) lists every path added, modified, or removed from the pre-consolidation `main` head `f16173c` to the staged candidate tree. It is generated with rename detection disabled so each added/removed path is explicit. It records **1,085 added, 55 modified, and 0 removed** paths, including the consolidation record, proposed PR description, and manifest itself. These counts are rechecked against the final commit before push.

## Existing visual evidence for the exact approved runtime

All evidence below is tied to the final environment correction source `75c6c62`, which is the exact source Manny approved:

- Continuous actual-scene course sweep: 1,448.94 m course, **182** samples, maximum spacing **7.9612 m**, all **nine** owner-reported anchors, zero browser/render errors, maximum **494 draw calls / 416,459 triangles**.
- Separate Billboard Gap sweep: **30** chase/rear desktop and mobile-portrait captures, zero errors, maximum **378 calls / 306,631 triangles**.
- Quality matrix: **16** captures across four course regions, Low/Medium/High, chase and Medium rear; zero errors, maximum **386 calls / 402,819 triangles**.
- Background-source audit: all nine owner anchors traced with actual chase-camera probes; zero recorded errors.
- The evidence includes desktop and mobile-portrait owner anchors, mobile landscape, chase/rear views, bloom on/off, and earlier accepted-runtime comparisons. The prior T9.7 evidence is in [`docs/evidence/2026-10-09-neon-grid-t9-7/after/expanded-environment-correction/`](../2026-10-09-neon-grid-t9-7/after/expanded-environment-correction/).

These Chromium/SwiftShader results establish rendered structure and visual coverage, not representative-device performance. The immutable review path is [T9.7 environment correction](https://manaconda33.github.io/manacondas-minigame-mayhem/previews/neon-grid-t9-7-environment-correction/). Manny's approval applies to the exact `75c6c62` source. A fresh Pages byte-fetch was attempted but could not be completed because the environment's outbound Pages request was rejected by the network tunnel; no new live-byte verification is claimed. Since the consolidated runtime is byte-identical, a new gameplay preview is not required to represent a different runtime.

## Automated validation ledger

| Environment / check | Result |
| --- | --- |
| Node 24.19.0, `npm run validate` | **PASS** — strict typecheck, zero-warning lint, 132 test files / 1,072 tests, approved asset checks, production build. Coverage: 92.80% statements, 82.68% branches, 93.04% functions, 94.71% lines. Build emitted the existing large-chunk warning for the 3.27 MB `KartTimeTrial` bundle. |
| Node 22.23.3, initial parallel `npm run validate` | **FAIL / not a pass** — 1,067/1,072 tests; five 5-second timeouts across `race-diagnostics-routing` and `neon-grid-billboard-relocation`. |
| Node 22.23.3, workflow-equivalent serial test attempt 1 | **FAIL / not a pass** — 1,071/1,072 tests; the city-ground facade-panel scene-construction case exceeded the unchanged 5-second test limit. The other 131 test files passed. |
| Node 22.23.3, isolated rerun of that test | **PASS** — 1/1 selected test passed in 4.37 seconds; no timeout/test setting was changed. |
| Node 22.23.3, workflow-equivalent full serialized retry | **FAIL / not a pass** — 131/132 files, 1,069/1,072 tests; three tests in `race-diagnostics-routing.test.ts` exceeded unchanged 5-second limits (portrait camera framing, map orientation, hidden-time freeze). Duration 833.73 seconds. |
| Node 22.23.3, production build | **PASS** — strict TS build, all approved asset checks and Vite production bundle; existing 3.27 MB chunk warning remains. |
| Node 22.23.3, T9.6 evidence-checker | **PASS** — 8/8 Node tests. |
| `git lfs fsck --objects HEAD` | **PASS** — Git LFS objects valid. |
| `node --test tools/diagnostics/t9-6-certify.node-check.mjs` | **PASS** — 8/8 tests, including approved engineering/PRD budget boundaries and hardware-evidence rejection cases. |
| GitHub Actions YAML parse and contract check | **PASS** — YAML parser accepted 12 jobs; Node 22, `--maxWorkers=1`, and the exact `75c6c62` preview pin are present. |
| `git diff --check` | **PASS** on the current documentation edits; run again on the final staged tree. |
| Candidate-specific hosted GitHub Actions checks | **BLOCKED** pending final push and externally readable results. `gh auth status` reports the injected `GH_TOKEN` is invalid; unauthenticated GitHub API access returns HTTP 403. The public PR #288 page showed 27 checks passed, which validates that publication PR only, not this candidate. |

Node 22 and 24 local checks were run with the repository's existing dependency tree; no `npm ci` result is claimed here. The candidate-specific GitHub workflow uses Node 22 and a clean `npm ci`; retain the hosted result as a separate gate.

## Release blockers and stop boundary

- **G-05: BLOCKED.** There are no original representative-hardware captures or matching device metadata for three full-race runs. Owner-reported desktop FPS and all software-renderer timings are not certification.
- **Node 22 full suite / hosted CI: BLOCKED.** The full serial run ended at 1,069/1,072 because three real-camera integration tests exceeded unchanged 5-second limits. An earlier parallel run ended at 1,067/1,072 with five timeouts; the isolated city-ground test passed in 4.37 seconds, which does not clear the full-suite gate. Do not change timeout criteria to force a pass. Candidate-specific hosted Actions results must still be read after push.
- **PR #242 description update: BLOCKED** because both `gh pr edit` (GraphQL) and an authorized REST PATCH returned HTTP 403 from the environment's outbound GitHub API route. The public PR remains Draft with its existing description; no PR metadata changed. The full prepared replacement is preserved in [`pr-242-description.md`](pr-242-description.md) and can be applied when the API is reachable.
- **T9.8: NOT COMPLETE.** Stage 4 closure remains blocked by G-05 and current candidate CI verification.
- **Production release: BLOCKED / do not merge.** PR #242 remains unmerged into production `main`; no production gameplay was deployed; final production approval remains a separate owner decision.

## Existing modified worktrees preserved

Before integration, these separate worktrees were inspected and not edited. Recheck their statuses and diff fingerprints before closing this task:

| Path | Initial state | Fingerprint |
| --- | --- | --- |
| `/tmp/manacondas-t9-7-environment-preview-workflow` | Modified `.github/workflows/ci.yml` (27 insertions / 2 deletions) | `797ac55b31225ecbaa8dbb9c2cf41329726c0ba278919cc888d8eb28be71cf5f` |
| `/tmp/neon-grid-t9-7-original` | Modified `tools/diagnostics/neon-grid-course.html`; untracked `node_modules` | `c508cbf0e626f15ae0de7c47d51693dc909347841fd412e6453ee2b056092998` |

The other pre-existing worktrees were clean and left untouched: `/tmp/manacondas-t9-7-city-ground`, `/tmp/manacondas-t9-7-preview-workflow`.
