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
- `tools/ai-handoff/schema-validator.mjs`: offline test-only interpreter for the explicitly used JSON Schema Draft 2020-12 assertion keywords, failing closed on unsupported keywords. Representative valid and malformed instances for eight artifacts plus the manifest run in the native suite and therefore in hosted Vitest CI; local cross-check also used an independent standards validator. This is not a general-purpose production schema engine.
- `tools/ai-handoff/contracts.schema.json`: draft-2020-12 definitions for **queue item, lease, event envelope, independent review, per-cycle evidence, owner decision, task ledger and review packet**. This is a documented design contract; runtime uses explicitly coded field/identity checks, not a production JSON Schema engine.
- `tools/ai-handoff/event-routing.json`: explicit accepted/rejected event mapping, identity fields, producer/consumer, deduplication and owner-decision gates.
- `tools/ai-handoff/contract.mjs`: strict offline guards for canonical manifest identity, allowed paths, owner decisions, queue/lease generation, event routing, cumulative budgets, immutable cycle history, evidence-bound review readiness and report identity.
- `tools/ai-handoff/simulate.mjs`: local fixture runner. Prints JSON; **zero external actions**, no side-effect API calls, no filesystem writes.
- `tests/ai-handoff/fixtures.json`: **11 synthetic scenarios**, including expected state sequences and explicit failure expectations. All issue numbers, candidate SHAs, reviewer names and CI run IDs inside fixtures are synthetic, not real CI or approval records.
- `tools/ai-handoff/contract.node-check.mjs`: **100** native Node adversarial tests, including six task-start bypass regressions.
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

`transition()` checks normal lifecycle edges but **refuses privileged transitions** (scope-approved, queued, implementation-accepted, release-authorized, delivered) even when graph edges are otherwise allowed. `authorizeScope()` verifies scope identity and current baseline against synthetic proof. `eventRouter()` verifies a fully bound event and the same scope proof before returning a simulated queue transition. **At task start, `beginTask()` repeats `authorizeScope()` and invokes `eventRouter()` for the original event, checks its ID against the queue item, and consumes the simulated deduplication record.** The ledger retains the validated, identity-only source-event envelope, and `validateTask()` joins its ID to `routed_event_id` and its other identity fields to the manifest. Review packets carry this evidence with no embedded untrusted issue instructions. Relabeling either the reported ID or the stored envelope alone fails; this is **record consistency, not cryptographic authenticity or tamper-proof storage**. A caller cannot start a ledger by merely constructing a matching queue object; unapproved or stale evidence fails at the final start boundary. The caller-supplied `Set` is only an offline replay demonstration, **not durable anti-replay authority**. Stage C must inject authenticated actor/current-ref facts and atomically persist event consumption before any runner starts.

`verifyOwnerDecision()` requires a **nonempty** owner-decision event ID for both implementation and release, even when the caller-supplied synthetic trust record repeats the same invalid value. `applyOwnerDecision()` accepts **only** a review-ready task ledger containing passing test evidence and an exact candidate SHA for implementation acceptance. Release authorization requires (a) a separate decision with action `release_authorization`, (b) a different audited event ID, (c) proof of the earlier implementation acceptance, (d) a matching accepted-state record, and (e) the exact task, digest, baseline, candidate SHA, PR and destination `main`. All returned records remain simulation-only. `release_authorized -> delivered` has no usable transition; deployment is outside Stage B.

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

The ledger stores the immutable identity **including separate scope-approval event ID, routed-event ID, and a validated copy of the start-event identity envelope (without untrusted issue text)**, deadline, revision, exact per-cycle candidate SHA/CI run ID/observation timestamp, measured elapsed minutes and API spend, changed paths, mandatory check verdicts, synthetic reviewer record and cumulative totals. Every update verifies the previous revision and checks that the new cycle number is exactly the last + 1. **Every later observation must be strictly newer than its predecessor**, including when both observation and `nowMs` are supplied with matching but backdated values. These synthetic clock inputs are not independent time attestations; Stage C must inject a trustworthy monotonic clock and refuse agent-provided timestamps. **Cancellation and supersession increment the task revision without adding a build cycle**, invalidating pre-termination CAS versions (but a durable atomic compare-and-swap store is still needed for actual concurrent workers). `max_corrective_attempts: 2` is enforced along with `total_build_cycles: 3`; repeated submissions cannot reset attempt or cost totals. Missing time or cost evidence fails validation. Crossing the deadline, total elapsed or total spend ceiling produces a terminal failure; cancellation/supersession reject late results. An independent reviewer **record** with matching candidate SHA, source, verdict and structured findings is necessary for synthetic `review_ready`. A Boolean reviewer flag is not accepted. **Any** confirmed `out_of_scope` finding (even informational, low or medium) requires `needs_owner_decision`; high/critical/blocker findings, disagreeing reviewer or failed check cannot be ignored. Owner-only visual acceptance is never marked passed from a synthetic review.

The report generator returns `simulation_only: true`, `evidence_source: SYNTHETIC_FIXTURES_NOT_LIVE_REVIEW`, **scope-approval event ID, routed-event ID and the validated routed-event identity envelope preserved from task start**, manifest digest, base/final candidate SHA, PR and issue, all cycle SHAs, fixture CI run IDs, checks/reviews, changed paths, cumulative time/spend, attempts/corrections and unresolved risks derived from the **latest candidate's recorded review findings**, including low/medium findings that do not block simulated `review_ready`, plus `human_approval: NOT GRANTED` and `release_authorization: NOT GRANTED`. It recalculates recorded cycle outcomes against the ledger before emission, preventing a caller from merely changing `state` to `review_ready`.

## Required tests and phase exit

Stage B positive and negative evidence exists in the 100-test Node suite, its Vitest CI invocation, 11 fixtures and per-fixture report. **Next independent review is limited to pilot safety and reliability of the evidence, not exhaustive production hardening.** The existing PR CI must pass on the exact final commit, including TypeScript typecheck, existing game tests, lint, LFS checks and build. A green CI proves these tests ran; it does **not** prove live authentication or autonomous orchestration. No new PR-check workflow is installed in this stage.

**Explicit simulated unauthorized merge-request test:** Stage B rejects `merge_request` as an event and always blocks `release_authorized -> delivered`. Negative tests cover missing, stale-baseline, wrong-PR, wrong-candidate-SHA, and wrong-owner release approvals, even when prior implementation acceptance exists. This tests rejection, not a real GitHub merge adapter or repository protection.

**Do not merge or publish:** PR #289 must remain draft/unmerged pending owner acceptance of Stage B and a **separate exact-SHA merge/publication approval**; the repo's existing `main` pipeline can deploy Pages for documentation-only changes. The independent review reported `main` branch protection/required-status-check enforcement was not active when inspected. **These simulated authority gates do not enforce GitHub merge permissions**; branch protection is a separate future owner decision, not changed here.

Still deferred by design: real verified actor approvals, durable queue/lease/idempotency and atomic CAS, actual Codex runner, independent AI reviewer and Work callback, API spending instrumentation/credentials, live notification deduplication, branch-protection enforcement and owner-approved production publication. All require subsequent Stage C/D/E scope review and authorization. If any protected path or external action is required to fix Stage B, stop and request new approval.

**Abort/rollback:** close the draft PR only after owner instruction; leave `main`, PR #242, approved preview pins and recovery refs untouched. Existing PR CI consumes Actions minutes; no autonomous Codex/API spend is incurred by this foundation.

## Risk-proportionate pilot closeout decision (owner-aligned)

The Stage B simulation should demonstrate sufficient *control and observability* to justify asking for a contained Stage C experiment, not prove production-grade security. Two remaining medium findings from independent review were corrected here: (1) routed-event relabeling relative to saved start evidence; (2) empty event IDs for both types of owner decision. The native suite now tests both; no external action is enabled.

**Known Low deferred:** `schema-validator.mjs` does not preflight *unvisited* `anyOf` or conditional branches for unsupported keywords; all current schemas were checked and have no unsupported keywords. This is a future test-harness improvement, not an observed instance-validation failure and not a live-pilot safety authority. Revisit if schema keywords change or a standards-complete validator is adopted. The existing CI schema tests still exercise the current definitions.

**Proposed controlled Stage C learning trial (not authorized):** three small, reversible tasks in isolated branches, <= 60 minutes and <= $5 API spend per bounded task as applicable to the approved proposal, max 3 build cycles, hard stop on unauthorized paths/actions and any spending/time ceiling. Require externally enforced clock/budget, an authenticated owner/source adapter, narrow credentials, durable execution control, an emergency stop, and no automatic merge, deploy or main write. Human explicitly reviews each resulting draft PR. Measure useful results, review effort, cost and failure recovery. No runner, credentials, integration or merge is authorized by this document or CI.

Exit recommendation should weigh **(a)** safety of this narrow proposed experiment and **(b)** the integrity of evidence needed to learn. Exhaustive production-only perfection does not gate the offline Stage B design. Stage C's operational safeguards do gate *any actual execution*.
