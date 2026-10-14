# CI Validation Optimization Plan

**Date:** 2026-10-14<br>
**Branch:** `engineering/ci-validation-optimization-001`<br>
**Base:** `main` at `e5a49a7f94387b26c1ae91221bdf2217df273448`<br>
**Scope:** CI-1 implementation and CI-2 deployment design/evidence only. No merge or deployment.

## Goal

Shorten documentation-only pull-request validation without changing the required `validate` check identity or weakening the full application and integration suite. Reuse the expensive immutable Abyss Fog V3.2 validation only when GitHub run provenance, exact source, toolchain, dependencies, and validation contract all match a successful trusted `main` run. On any uncertainty or evidence miss, run the pinned validation in full.

## Verified baseline

- The clean source branch is `main`, exact HEAD `e5a49a7f94387b26c1ae91221bdf2217df273448`; current workspace's `design/neon-grid-circuit-02` worktree is left untouched.
- Open PR #242 remains draft/unmerged. Recent PR #298–#300 CI runs validate the unchanged pinned V3.2 runtime; all include preview planning/builds, current-source validation, spillway rendering, and four pinned-runtime validations.
- Total workflow durations shown in GitHub for runs 38445529495, 38454352580, and 38485133171 are 19m 1s, 17m 21s, and 18m 31s. In run 38485133171 the V3.2 `Validate exact pinned runtime` step alone took 17m 42s. It ran typecheck, zero-warning lint, `vitest run --coverage --maxWorkers=1 --testTimeout=15000`, production build, and a preview-relative build. Dependencies restored from the existing npm cache; the ordinary validation cache missed and all validation steps ran.
- Run 38485133171's immutable preview build restored from `actions/cache` in about two seconds and skipped checkout/build. This cache is build acceleration only, not test evidence.
- `validate` takes about 1m18–2m16 in the three recent runs; `preview-plan` about 7–12s; spillway rendering 30–48s. Current preview builds are 22 matrix entries with bounded parallelism. The four pinned runtimes run in parallel; V3.2 is the demonstrated dominant path.
- Main runs 38456834757 and 38452972000 failed respectively in post-deploy live-byte verification and pre-deploy production-preservation verification. Public run pages identify these stages, but step logs require GitHub authentication and are not available in this workspace; their exact mismatching paths/errors remain unresolved and CI-2 must not alter retry or integrity policy based on guesses.
- GitHub Pages branch/ruleset settings and required-check configuration are not publicly readable here: settings returned HTTP 404, `api.github.com` is blocked by the environment proxy, and `gh auth status` reports no authenticated GitHub host. No configured check identity is inferred from that inaccessible settings view. Workflow job IDs will be preserved.

## Implementation sequence

1. Add tests for a conservative classifier. It accepts only `README.md` and Markdown planning files under `docs/design/**` and `docs/superpowers/plans/**`; evidence, governance, runtime, build/configuration, assets, workflows, generated paths/names, incomplete diffs, unsupported statuses, traversal, and file-mode changes are full-validation changes. Renames check both paths; only allowlisted planning files may be deleted.
2. In PR runs, check out the target branch separately and execute the classifier and validation-fingerprint code from that trusted checkout. A new or unavailable trusted helper fails closed. The classifier compares the exact base/head commits using NUL-delimited raw Git records and a pull-request-head ref fallback; parse, fetch, or completeness errors require full validation. No workflow-level path filters are introduced.
3. Keep existing job IDs and matrix expansions. `validate`, each `preview-build` child, each `pinned-runtime-validation` child, and `spillway-render` complete with an explicit documentation-only summary/no-op. This avoids absent matrix child checks. `preview-plan` performs `git diff --check` for the exact allowlisted paths. If classification or planning fails, the `always()` fallback runs the full checks; any non-doc, mixed, generated, workflow, asset, or uncertain change receives complete relevant validation.
4. Replace the prior pinned-validation cache PASS marker for all four historical immutable runtimes (Billboard, Waterfall Dive, 300 m visibility, and Abyss Fog V3.2) with per-runtime GitHub Actions evidence artifacts. Evidence keys include the immutable runtime SHA, validation contract and workflow hashes, current Node/npm and runner image, plus exact commands. Manifests bind source SHA/tree, runtime lockfile, verified Git LFS inventory, main workflow run identity, and completed successful commands.
5. On PRs, execute the evidence verifier from the trusted target-branch checkout and use only the Actions API with job-scoped `actions:read`/`contents:read`. Reuse requires an unexpired artifact from a completed successful `push` to `main` using `.github/workflows/ci.yml`, exact run/attempt/source/tree/lock/toolchain/contract/commands, valid LFS inventory, and matching downloaded artifact SHA-256. No `pull_request_target`, PR-origin evidence, mutable cache PASS marker, or PR artifact upload is used. Every missing, expired, mismatched, failed, cancelled, incomplete, or unverifiable case executes the exact full validation commands.
6. On a `main` push, use existing valid evidence where available; on a miss, execute the full exact pinned validation and upload evidence for 30 days only after success. Once CI-1 is merged, the initial main run must repopulate evidence because the workflow/test contract changes. This job is not a deployment prerequisite. The existing `assemble`/`deploy` code remains unchanged.
7. Preserve historical preview builds, exact source-marker and asset checks, all full-validation commands for relevant changes, and current `validate`, `preview-plan`, `preview-build`, `pinned-runtime-validation`, and `spillway-render` identities. Node 22 remains the hosted validation runtime. Type declarations for the JavaScript CI helpers are included in the existing TypeScript project and typed lint scope.
8. Add tests for all twelve requested change/evidence/status scenarios, including README/planning fast path, runtime/test/workflow/lock/asset full path, invalidation, missing/invalid/untrusted artifact, failed/cancelled/incomplete validation, and intact status identities. API fixtures test artifact provenance and digest failure; they are local tests, not hosted evidence.
9. Add a durable evidence report and update implementation status, testing, and decisions with observed baseline, current local results, hosted results (or blockers), security/provenance, retention/invalidation, unresolved deployment runs, and the CI-2 proposal. CI-2 remains design/evidence only with no workflow/deploy edit.
10. Run the full local validation on the isolated branch, then push/open a PR to `main` only if authenticated write access is available. Because `main` initially lacks these helpers, the first PR run must fail closed to full validation. Do not claim it as a warmed docs-path/evidence-hit run. Report real hosted docs-fast-path and trusted-evidence timings only after they are observed.

## Acceptance and stop gates

- Any classifier uncertainty fails closed to full checks.
- Changes to runtime source, tests/contracts, build/toolchain/dependencies, workflows, runtime assets, or deployment/integrity code still receive complete relevant validation.
- Evidence is a success only when it came from a successful trusted main run and matches the exact source, full validation fingerprint, environment, commands, and asset inventory.
- Existing required status names remain unchanged; no workflow path filter, permission escalation beyond scoped read-only artifact lookup, branch-protection change, deployment refactor, cache-as-proof, or shortened test timeout is allowed.
- Production assembly, preservation checks, deployment, Pages content, and live-byte verification remain unchanged in CI-1.
- If branch-protection semantics, cross-run artifact access, source provenance, or hosted validation cannot be established, mark that portion BLOCKED and do not claim an optimization pass.
- CI-2 report must separate observed failures from unknown causes, propose a source/hash/manifest-driven deployment design, and await separate authorization before implementation.

## Self-review / foreseeable risks

- Artifact retention is bounded by repository policy; expired/missing evidence safely costs a full run. The exact retention setting cannot be inspected from this unauthenticated environment.
- Hosted API behavior and artifact digests need to be verified in GitHub Actions. API/auth/retention failures must be full-validation misses, never green reuse.
- Matrix jobs remain expanded and produce successful no-op child runs for docs-only PRs, but exact configured ruleset behavior is inaccessible; hosted check-run behavior and branch-protection review remain part of the report.
- A successful GitHub Actions run is not proof that owner-required hardware G-05 has passed. This task does not affect G-05, Neon Grid acceptance, PR #242, or production release.
