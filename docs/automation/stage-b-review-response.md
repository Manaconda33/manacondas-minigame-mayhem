# Independent Work review remediation: Stage B, v1.3

**Source of findings:** independent, read-only Work review of PR #289 at exact prior commit `d07edd65e5dc465caade59a9a9007c7fadd27479`; verdict **BLOCKED**. This response is a proposal awaiting a new exact-head independent re-review, not a declaration of approval. The original review remains authoritative for the prior SHA only.

| Work finding | Corrective action | Regression evidence | Residual limitation |
| --- | --- | --- | --- |
| **High 1. Privileged state transitions accept caller-supplied labels** | `transition()` refuses all privileged destinations. `authorizeScope()` checks an immutable scope proof. `applyOwnerDecision()` requires a **review-ready ledger with replayable checks and reviewer record** for implementation, and an **accepted-state record** plus separate exact-SHA/PR/destination-bound owner decision and prior acceptance proof for release. `eventRouter()` verifies approval identity and baseline before queueing. | Native cases `graph retains ordinary lifecycle edges`, `proper fixture implementation`, `missing owner decision`, `distinct events`, `release requires exact PR and candidate SHA`, `release cannot be authorized without authentic prior implementation acceptance`. | Proof records are synthetic fixtures, not GitHub-authenticated. No production release edge can be executed. |
| **High 2. Cycle/retry budget can reset** | `beginTask()` creates a task ledger. `advanceCycle()` requires a matching revision, strictly increasing cycle, max 3 builds/2 corrective attempts, a nonterminal state, monotonic per-cycle synthetic observation, total elapsed/spend below cap and deadline. `validateTask()` recomputes cumulative totals and replays evidence-derived outcomes. | Cases `repeating cycle 1`, `task revision is compare-and-swap`, `two individually cheap cycles`, `two individually short cycles`, `timeout/late result`, `cannot forge review_ready`, `cannot insert another cycle after a successful prior cycle`. | In-memory transactional demonstration only. Actual runner resource/billing meters and crash durability remain Stage C/E. |
| **High 3. Missing queue/event/state schemas** | Added versioned `contracts.schema.json` for queue, lease, event, reviewer, cycle, decision, ledger and packet; added explicit `event-routing.json` table; explicit runtime validators assert identity joins and lease generation. | Cases `versioned queue, lease, event... schemas`, `event routing map`, `valid event`, `queue contract binds`, `malformed lease`, `duplicate webhook`, `occupied workstream`. | JSON Schema documents design; native JS checkers implement a strict subset plus cross-object identity. No durable queue and no actual GitHub subscription. |
| **Medium 4. Reviewer Boolean generates readiness** | Removed `reviewerAvailable` parameter entirely. Each cycle requires a synthetic review record with source, review ID, reviewer ID, verdict, findings and candidate SHA. Missing or wrong-SHA review blocks. Packets include explicit `SYNTHETIC_FIXTURES_NOT_LIVE_REVIEW`. | Cases `review missing`, `review for another candidate`, `fake reviewer flag`, `reviewer-pass with high finding`, `cannot forge review_ready`. | A synthetic reviewer report is illustrative data, **not** AI review or authentic independent attestation. Actual independent reviewer Stage D. |
| **Medium 5. Negative matrix gaps** | Added hostile issue-text isolation, stale current-baseline comparison, valid-looking but unauthorized two-step release, timeout/late/cancelled results, cumulative budget exhaustion, reviewer conflict, duplicate label by semantic key and out-of-scope finding rejection. | The 11 fixture scenarios and 60 native Node tests. The Vitest suite executes all native tests inside existing CI, without workflow edits. | Live webhook delivery, authenticated current-ref read and interruption recovery need Stage C/E tests. |
| **Medium 6. Review packet omits identity/provenance** | `reviewPacket()` emits task/repository/issue/PR, manifest digest, base SHA, final candidate SHA, every candidate SHA, every synthetic CI run ID, changes, per-cycle checks/review and time/spend, cumulative totals, attempts/corrections, state and unresolved risks. Replays ledger history before reporting. | Cases `review packet is immutable-identity complete`, `cannot forge review_ready`, `packet cannot be created from active work`; fixture JSON output shows all fields. | CI IDs inside fixture packets are synthetic. CI job link for actual PR is separate GitHub evidence. |
| **Low 7. Runbook markup/status accuracy** | Rewrote runbook: corrected literal `\\n\\n`, identified `needs_owner_decision` as the actual state, documented proper human gates, event routing and remaining live-integration gaps. | Runbook inspection; `stage-b-review-response.md` evidence mapping. | Documentation is explanatory, not enforcement of GitHub merge permissions. |

## Gate ledger for revised Stage B

| Gate | Required proof | Status before new CI/review |
| --- | --- | --- |
| Isolated edit scope | GitHub PR diff only within `tools/ai-handoff/**`, `tests/ai-handoff/**`, `docs/automation/**` | Must be rechecked on exact new head |
| Native offline negative matrix | `node --test tools/ai-handoff/contract.node-check.mjs`, attached or hosted test log | Local 60/60 PASS; existing Vitest now invokes this command in hosted test step |
| Fixture simulation | `node tools/ai-handoff/simulate.mjs tests/ai-handoff/fixtures.json` | Local 11/11 PASS, zero external actions; outputs must be rechecked on exact new head |
| Normal hosted PR CI | Linked GitHub Actions run for exact revised commit, success | PENDING |
| Independent adversarial read-only review | Work checks actual revised diff and evidence against each Stage B requirement | PENDING |
| Human acceptance | Owner decision accepting Stage B at exact SHA | NOT GRANTED |
| Merge/publication | Separate owner approval tied to exact PR/SHA and expected Pages CI consequences | NOT GRANTED |
| Stage C automation | New explicit authorization, credential and runner safety design | NOT AUTHORIZED |

**Known external governance risk:** independent reviewer reported GitHub `main` as unprotected with required-status-check enforcement disabled. This PR cannot repair that within the Stage B footprint. No repository settings have been changed. Do not infer that written gates prevent privileged users from merging against policy.

## Subsequent Work re-review at `cf4ca3ac` (first finding only)

The second independent Work review remains **BLOCKED**. For its High finding 1,
`beginTask()` now requires fresh synthetic approval and original routed-event facts,
verifies queue event identity, and consumes the event in the same simulation start
operation. A fabricated matching queue or absent proof is rejected. Six new native
negative tests cover direct queue injection, fabricated event ID, unapproved actor,
changed digest, stale current baseline and replay with the same in-memory store.

**Unresolved findings remain open:** timestamp backdating, cancellation revision,
unresolved-risk summary, schema-instance coverage and explicit merge-request fixture.
No Stage B acceptance or publication authority is inferred from this first fix.
Only a synthetic in-memory Set provides replay detection; genuine atomic receipt
storage and authenticated evidence remain Stage C prerequisites.
