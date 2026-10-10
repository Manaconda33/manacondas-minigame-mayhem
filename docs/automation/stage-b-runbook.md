# AI Handoff Automation v1.3: Stage B offline-foundation runbook

**Status:** DRAFT / SIMULATION ONLY. No live authenticated approval, dispatch, Codex action, Work integration, notification transport, GitHub workflow, credential or production capability exists here. Stage B was authorized for isolated implementation and review; no merge, publication or Stage C activation is authorized.

**Repository:** `Manaconda33/manacondas-minigame-mayhem` (public); `main` baseline pinned at `f16173c562911df0020aef22dce1521d104d521e`; pilot draft PR #289. Plan in separate draft PR #287. Do not touch Neon Grid draft PR #242, its recovery branches, G-05 release gate, existing preview pins or `.github/workflows/ci.yml`.

## Responsibility / integration boundaries

| Role | Stage B responsibility | Not implemented / not authorized |
| --- | --- | --- |
| Chat | Bound implementation scope and human decisions | Chat conversation does not trigger a GitHub runner automatically |
| Codex/engineering | Build reviewed artifacts under isolated pilot directories | This code never calls Codex or changes any game runtime |
| GitHub | Stores versioned draft branch, commit, PR and existing read-only CI checks | No new webhook, App, issue label listener, workflow_dispatch or deployment credentials |
| Independent Work reviewer | Read-only challenge of the exact diff and CI evidence | No automated review agent, Work event subscription, authenticated callback or real reviewer identity |
| Owner | Accepts implementation separately from exact-SHA merge/publication | Simulated green review never grants acceptance, merge, preview or release |

## Stage B files and entry points

- `tools/ai-handoff/manifest.schema.json`: original versioned JSON Schema for a proposed v1.2 manifest; no new dependencies added.
- `tools/ai-handoff/contracts.schema.json`: draft-2020-12 definitions for **queue item, lease, event envelope, independent review, per-cycle evidence, owner decision, task ledger and review packet**. This is a documented design contract; runtime uses explicitly coded field/identity checks, not a production JSON Schema engine.
- `tools/ai-handoff/event-routing.json`: explicit accepted/rejected event mapping, identity fields, producer/consumer, deduplication and owner-decision gates.
- `tools/ai-handoff/contract.mjs`: strict offline guards for canonical manifest identity, allowed paths, owner decisions, queue/lease generation, event routing, cumulative budgets, immutable cycle history, evidence-bound review readiness and report identity.
- `tools/ai-handoff/simulate.mjs`: local fixture runner. Prints JSON; **zero external actions**, no side-effect API calls, no filesystem writes.
- `tests/ai-handoff/fixtures.json`: **11 synthetic scenarios**, including expected state sequences and explicit failure expectations. All issue numbers, candidate SHAs, reviewer names and CI run IDs inside fixtures are synthetic, not real CI or approval records.
- `tools/ai-handoff/contract.node-check.mjs`: **60** native Node adversarial tests.
- `tools/ai-handoff/contract.test.mjs`: Vitest integration/negative tests, including an explicit subprocess check that executes the full native Node matrix in the existing GitHub PR CI job. Both `.mjs` runners intentionally live under `tools/` to respect the repository's pre-existing ESLint exclusions.
- `docs/automation/stage-b-review-response.md`: mapping of the seven independent-review findings to corrections, explicit gaps and verification.

## Reproducible commands

From the repository root:

```sh
node --test tools/ai-handoff/contract.node-check.mjs
node tools/ai-handoff/simulate.mjs tests/ai-handoff/fixtures.json
npm run validate
git diff --check
```

The simulator prints `simulation_only: true`, `external_actions: 0`, per-cycle fixture outcome, candidate SHA and a synthetic review packet. Failures yield a nonzero exit code. Expected principal sequences:

- `initial-green`: `review_ready` after one fully simulated review.
- `corrected-second-cycle`: `correcting -> review_ready` with distinct candidate SHAs and review records per cycle.
- `exhausted-third-cycle`: `correcting -> correcting -> failed_budget_or_checks` (one initial + two repairs).
- `cumulative-cost-budget`, `cumulative-time-budget`: fail when total spend/time across the task exceeds the ceiling, even though each individual cycle is under it.
- `stale-current-baseline`, `reviewer-candidate-sha-mismatch`: rejected, not accepted as review-ready.
- `late-after-deadline`: terminal failed budget/checks; later retry disallowed.
- `missing-reviewer-report` and `visual-gate-remains-owner-only`: `needs_owner_decision` without any acceptance or release authority.
- `hostile-issue-text-is-inert`: arbitrary issue text remains untrusted string data; cannot alter approved paths or approval facts.

## Immutable identity and approval verification (all simulated)

Manifest digest: SHA-256 over canonical sorted JSON of immutable manifest fields, excluding only `manifest_sha256`, the separately verified `approval` record and mutable `state`. Validation requires the canonical digest to match both the manifest and the separately supplied synthetic approval facts. Scope binding includes repository, task ID, issue number, current baseline SHA, actor, approval event ID and digest. A manifest whose internal hashes agree but whose `base_sha` differs from the **current independently supplied baseline** is rejected as stale.

**Security limitation:** `fixture_context: true` plus `provenance: offline_test_harness` is a test discriminator, not authentication. Any caller who can create a JavaScript object can forge it. These routines must never be connected to a production GitHub event, token, runner or deployment merely because the fixture passes. Stage C needs an authenticated GitHub authority adapter plus independent current-ref and permission verification.

`transition()` checks normal lifecycle edges but **refuses privileged transitions** (scope-approved, queued, implementation-accepted, release-authorized, delivered) even when graph edges are otherwise allowed. `authorizeScope()` verifies scope identity and current baseline against synthetic proof. `eventRouter()` verifies a fully bound event and the same scope proof before returning a simulated queue transition.

`applyOwnerDecision()` accepts **only** a review-ready task ledger containing passing test evidence and an exact candidate SHA for implementation acceptance. Release authorization requires (a) a separate decision with action `release_authorization`, (b) a different audited event ID, (c) proof of the earlier implementation acceptance, (d) a matching accepted-state record, and (e) the exact task, digest, baseline, candidate SHA, PR and destination `main`. All returned records remain simulation-only. `release_authorized -> delivered` has no usable transition; deployment is outside Stage B.

## Event / queue / state contracts

| Input | Producer in Stage B | Preconditions | Outcome | Negative cases |
| --- | --- | --- | --- | --- |
| `manual_fixture` event | Offline harness | Matching manifest/current base/scope approval; unique event and semantic key | Synthetic `queued` queue item | forged actor/digest/baseline, repeated delivery |
| `issue_labeled` envelope | Offline harness | Expected label plus all matching immutable identity fields | Synthetic `queued` | repeated label with new delivery ID, hostile text, unexpected label, wrong issue |
| `pull_request_comment`, `push`, other events | No Stage B producer | Not on event allowlist | Reject | PR comment prompt injection / authority spoofing |
| queue item | Synthetic router | Version + workstream + immutable task identity + event ID | In-memory queue ledger | identity mismatch, occupied workstream |
| lease | Synthetic workstream state | Correct generation, single owner, future expiry | In-memory lease | occupied, stale generation; expired owner never silently taken over |
| cycle evidence | Synthetic engineer and reviewer fixtures | CAS revision, monotonic cycle, exact candidate/reviewer SHA, checks, spend, time and deadline | Record `correcting`, `review_ready`, `needs_owner_decision` or `failed_budget_or_checks` | repeated cycle 1, cumulative limit, failed reviewer, time-out, cancellation, late result |
| owner implementation and release decisions | Synthetic owner records | Two independently bound events, proper prior ledger/acceptance state and exact destination | Synthetic acceptance/release *record* only | valid-looking two-step unauthorized sequence, changed PR/SHA, replayed scope approval |

The in-memory `Set` for webhook/label semantic-key deduplication, lease and CAS task revision are **demonstrations**, not durable storage and not atomic across machines. Stage C/E must design and prove transactional persistence and crash/lease recovery before any external automation runs. GitHub Actions concurrency by itself is not a FIFO queue. The default `GITHUB_TOKEN` does not normally trigger downstream workflows. A new branch-only `workflow_dispatch` is not a functioning manual GitHub UI dispatch; the workflow must be on default branch, which requires separate approval because `main` pushes trigger Pages CI.

## Simulated quality loop and failure handling

The ledger stores the immutable identity, deadline, revision, exact per-cycle candidate SHA/CI run ID/observation timestamp, measured elapsed minutes and API spend, changed paths, mandatory check verdicts, synthetic reviewer record and cumulative totals. Every update verifies the previous revision and checks that the new cycle number is exactly the last + 1. `max_corrective_attempts: 2` is enforced along with `total_build_cycles: 3`; repeated submissions cannot reset attempt or cost totals. Missing time or cost evidence fails validation. Crossing the deadline, total elapsed or total spend ceiling produces a terminal failure; cancellation/supersession reject late results. An independent reviewer **record** with matching candidate SHA, source, verdict and structured findings is necessary for synthetic `review_ready`. A Boolean reviewer flag is not accepted. A high/critical/blocker finding, disagreeing reviewer or failed check cannot be ignored. Owner-only visual acceptance is never marked passed from a synthetic review.

The report generator returns `simulation_only: true`, `evidence_source: SYNTHETIC_FIXTURES_NOT_LIVE_REVIEW`, manifest digest, base/final candidate SHA, PR and issue, all cycle SHAs, fixture CI run IDs, checks/reviews, changed paths, cumulative time/spend, attempts/corrections and unresolved risks, plus `human_approval: NOT GRANTED` and `release_authorization: NOT GRANTED`. It recalculates recorded cycle outcomes against the ledger before emission, preventing a caller from merely changing `state` to `review_ready`.

## Required tests and phase exit

Stage B positive and negative evidence exists in the 60-test Node suite, its Vitest CI invocation, 11 fixtures and per-fixture report. **Independent Work review of the new exact commit remains mandatory.** The existing PR CI must pass on the exact final commit, including TypeScript typecheck, existing game tests, lint, LFS checks and build. A green CI proves these tests ran; it does **not** prove live authentication or autonomous orchestration. No new PR-check workflow is installed in this stage.

**Do not merge or publish:** PR #289 must remain draft/unmerged pending owner acceptance of Stage B and a **separate exact-SHA merge/publication approval**; the repo's existing `main` pipeline can deploy Pages for documentation-only changes. The independent review reported `main` branch protection/required-status-check enforcement was not active when inspected. **These simulated authority gates do not enforce GitHub merge permissions**; branch protection is a separate future owner decision, not changed here.

Still deferred by design: real verified actor approvals, durable queue/lease/idempotency and atomic CAS, actual Codex runner, independent AI reviewer and Work callback, API spending instrumentation/credentials, live notification deduplication, branch-protection enforcement and owner-approved production publication. All require subsequent Stage C/D/E scope review and authorization. If any protected path or external action is required to fix Stage B, stop and request new approval.

**Abort/rollback:** close the draft PR only after owner instruction; leave `main`, PR #242, approved preview pins and recovery refs untouched. Existing PR CI consumes Actions minutes; no autonomous Codex/API spend is incurred by this foundation.
