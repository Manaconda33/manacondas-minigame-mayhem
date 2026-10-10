# Stage B: offline AI handoff foundation

**Status:** PROPOSED, simulation-only. Owner authorized Stage B preparation on 2026-10-10; Stage C and beyond remain unapproved. **Never treat a successful fixture as an authenticated GitHub approval.**

## Ownership and hard boundaries

- **Chat:** interprets approved scope, reconciles with repository, summarizes independent evidence and asks for owner decisions.
- **Codex / local engineering work:** builds and tests this scaffold on a separate branch. No Codex runtime is invoked by this scaffold.
- **GitHub:** stores draft PR, branch, immutable code/evidence. No issue label, webhook, `workflow_dispatch`, or GitHub App is activated by these files.
- **Work / independent reviewer:** later evaluates actual PR changes, original acceptance criteria and test evidence. Automatic Work notification is not wired in Stage B.
- **Owner:** approves technical implementation separately from any merge, publication, preview or release. Existing Neon Grid G-05 block and PR #242 are outside this change.

## Files and test entry points

- `tools/ai-handoff/manifest.schema.json`: proposed JSON Schema 2020-12, schema `1.2`. No production JSON Schema dependency added; `validateManifest()` mirrors core required/structural constraints, not every keyword a full schema validator might enforce.
- `tools/ai-handoff/contract.mjs`: canonical digest, scope/path checks, *offline injected* approval verifier, guarded state transitions, duplicate-event prevention, mock queue lease, bounded quality decision, owner review packet.
- `tools/ai-handoff/simulate.mjs`: **read-only** local fixture processor. Prints JSON only; it writes nothing, calls no API and runs no commands.
- `tests/ai-handoff/fixtures.json`: synthetic test records, not real GitHub issue or owner-approval events; numbers, SHAs and actor assertions exist only for simulation.
- `tools/ai-handoff/contract.node-check.mjs`: expanded native Node tests, run with `node --test tools/ai-handoff/contract.node-check.mjs`.
- `tools/ai-handoff/contract.test.mjs`: Vitest subset designed to run under existing PR CI's `npm run test:ci` without editing `.github/workflows/ci.yml`.

The two `.mjs` test runners live under `tools/ai-handoff/` because the existing ESLint configuration deliberately excludes `tools/**/*.mjs`. This avoids type-aware TypeScript lint rules being invoked on non-TypeScript test files, without changing or weakening the repository's lint configuration. Vitest discovers `contract.test.mjs` by its normal filename pattern, while the standalone Node suite remains an explicit command.\n\nFrom the repo root:

```sh
node --test tools/ai-handoff/contract.node-check.mjs
node tools/ai-handoff/simulate.mjs tests/ai-handoff/fixtures.json
npm run validate
git diff --check
```

The simulation must show `initial-green -> review_ready`, `corrected-second-cycle -> correcting, review_ready`, and `exhausted-third-cycle -> correcting, correcting, failed_budget_or_checks`. The broader unit test suite rejects unauthorized actors, stale SHA/digest, malformed/forbidden paths, duplicate triggers, occupied queue, premature release, budget overrun, and fake AI visual acceptance. The CI runner also executes its existing game tests; that pass is necessary but **does not test a live trigger**.

## State machine and approval gates

`draft -> validated -> scope_approved -> queued -> running -> validating -> reviewing -> correcting -> running`; terminal technical states: `review_ready`, `escalated`, `failed`, or simulated loop results `needs_owner_decision`, `failed_budget_or_checks`. From `review_ready`, only an explicit human decision moves to `implementation_accepted` or `changes_requested`; **publication has a second independent gate**. Cancellation and supersession are terminal in this scaffold. Do not reset a failed task's attempt count silently.

The intended immutable identity is repository + task ID + issue + canonical manifest digest + exact baseline SHA + cycle + candidate SHA + CI run. The digest intentionally excludes mutable workflow state and approval proof; those must be verified independently against authenticated GitHub facts. No production actor-verification adapter exists in Stage B. `fixture_context:true` is a synthetic testing switch, **not** a secure or reusable production trust boundary. Treat any production call to this entry point as an unsafe integration.

Simulation event routing accepts only `manual_fixture` or an `issue_labeled` event with an expected label, after an already-approved state. The simulator explicitly injects a synthetic reviewer-available flag; absent reviewer evidence defaults to escalation. This is not independent AI attestation. Both are **modelled** types only; no actual GitHub events or permissions are consumed. The in-memory Set for deduplication and lease ledger are not durable. The lease refuses silent takeover even after expiration. The test packet carries `human_approval: NOT GRANTED`, `release_authorization: NOT GRANTED`, and a deterministic deduplication key; nothing is sent to a notification destination.

## Stage B input/output contracts

| Handoff | Input | Producer | Output | Consumer |
| --- | --- | --- | --- | --- |
| Intent -> validation | Proposed manifest, SHA, permitted paths | Chat | schema-compatible manifest and digest | Offline validator |
| Approval -> queue (simulated) | In-memory trusted fixture facts, synthetic event | Fixture harness | queued or explicit failure | Simulator |
| Candidate -> quality review (simulated) | changed paths, cycle count, checks, findings, elapsed cost | Fixture harness | correcting, review_ready, needs_owner_decision, or failed_budget_or_checks | Offline packet builder |
| Review -> owner | candidate SHA, outcome, checks, blockers | Simulator | JSON packet, no granted approvals | Human/Work future process |

## Event bridge to verify later, not assumptions

1. A Chat conversation cannot automatically dispatch GitHub Actions without explicit connector/authorization steps. A GitHub issue label alone is not a cryptographically verified owner approval.
2. `workflow_dispatch` requires the workflow to be on default branch; this branch intentionally adds **no** workflow file. Merging even this docs-only PR into `main` would run existing Pages CI and requires separate authorization.
3. GitHub's default `GITHUB_TOKEN` events usually do not trigger follow-on workflows; any future job chaining, GitHub App credential or external webhook bridge needs separate proof.
4. Work triggering, filtering by terminal quality state, deduplication, delivery/notification and callback into Codex are **not implemented**. Stage D must verify feasible supported integrations or retain a manual Work handoff.

## Exit criteria, open prerequisites and recovery

**Stage B passes only if** the branch diff stays in these three directories, native simulation checks pass, existing CI passes on exact PR head, review evidence is inspectable, and an independent reviewer has challenged the diff. The draft PR stays unmerged until separate approval. No new external API credentials, secrets, CI workflows, issue template or repository settings are necessary.

Still missing by design: trusted GitHub actor/approval attestation, persistent compare-and-swap state, persistent queue/leases and idempotency, actual runner and secrets separation, per-task metered billing enforcement, independent review agent, actual PR-to-Work delivery, any live workflow trigger, and real GitHub approval event tests. These are Stage C/D/E design gates, not Stage B successes.

**Abort:** close draft PR and optionally remove its isolated branch after owner permission. Do not delete recovery refs or change `main`. **Recovery:** if the branch advances unexpectedly, freeze and compare exact head/base before updating anything. **Costs:** no model or GitHub Actions dispatch from this scaffold; existing PR CI may run and consume repository Actions minutes. **Escalate:** schema changes, protected-path requests, evidence gaps, required device-performance proof, or merge/release decisions.
