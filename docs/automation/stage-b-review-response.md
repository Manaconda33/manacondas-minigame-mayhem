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

## Second Work re-review: remaining three substantive findings addressed (proposal)

At the second Work review of `cf4ca3ac`, three additional implementation defects were raised following the task-start issue:

- **Medium: caller-backdated deadline observations.** `advanceCycle` now requires each synthetic observation to be strictly newer than the last, even if the caller supplies matching `nowMs`. `validateTask` independently rejects a regressed timestamp in saved history. Tests cover a forged earlier/equal second cycle, history tampering, and a genuinely late second-cycle failure. **Still deferred:** authenticated monotonic time in Stage C. Stage B's injected clock is not a production authority or guaranteed hard deadline.
- **Medium: cancellation revision not incremented.** `terminateTask` now increments `revision` for both cancelled and superseded tasks; `validateTask` accepts exactly one terminal revision beyond the number of build cycles, without inventing a build cycle. Tests check the invalidated pre-termination revision, cancellation with prior cycles, supersession, and forged unchanged-revision cancellation. Durable atomic CAS remains Stage C/E.
- **Medium: missing unresolved-risk summary.** `reviewPacket` preserves nonblocking low/medium review findings on the final candidate in `unresolved_risks`, even when `review_ready`. It retains the existing simulated-gate warning when not ready. Tests cover a passing review with two residual findings and the later correction of earlier findings.

The previous High task-start correction remains in force. No CI or independent acceptance is claimed for these new changes until exact-head hosted tests and Work re-review. Stage B remains **BLOCKED**. No merge, credentials, runner, or production publication is authorized.

## Third Work assessment of `694bce3`: PASS WITH REQUIRED FIXES

The independent review confirmed the previous four concerns resolved for Stage B simulation and requested four further fixes. Candidate changes (not yet independently re-reviewed):

1. **Out-of-scope false readiness:** any synthetic `out_of_scope` reviewer finding now returns `needs_owner_decision` regardless of severity. Six severity-specific tests verify the stop and visible risk.
2. **Approval/event provenance:** task start records `scope_approval_event_id` and `routed_event_id` as distinct identity fields; `validateTask`, the versioned task/packet schemas, and the generated packet preserve them. Negative tests reject mismatched, missing, or duplicated provenance.
3. **JSON Schema instance coverage:** test-only `schema-validator.mjs` evaluates every assertion keyword used by the Stage B schemas and fails on unsupported keywords. Native tests validate representative valid/malformed queue, event, lease, cycle, review, owner decision, task ledger, and review packet objects plus the manifest; Vitest invokes the full native suite in hosted CI. Independently checked these same instance shapes against Python `jsonschema.Draft202012Validator` locally, which is not a hosted CI dependency. A production standards engine is deferred.
4. **Explicit merge-request rejection:** a simulated `merge_request` event is denied, an unapproved merge delivery transition is denied, and tests reject missing, stale, wrong-PR, wrong-SHA, or wrong-owner authorization. No real GitHub merge endpoint is invoked.

**Boundary:** no changes to GitHub workflow/settings, credentials, production/game code, or actual dispatch. The synthetic trusted actor, clock and in-memory deduplication are *not* live authentication or atomic persistence. Stage B acceptance, the merge gate, and all Stage C actions remain separately unapproved until exact-head hosted CI and independent re-review succeed.

## Owner-aligned pilot closeout: latest independent re-review response

The independent read-only review of PR #289 at `191bbc2d1e3130cf97e62249be923f2e9af6d6d4` returned **PASS WITH REQUIRED FIXES**. It confirmed the out-of-scope gate, schema instance tests and merge-request negative tests; it identified two remaining **medium** contract defects and one **low** test-only validator weakness. The owner aligned with a minimum-safe-pilot approach: fix safety/evidence integrity defects, defer non-blocking production polish, and measure a controlled experiment rather than iterate indefinitely.

1. **Routed-event provenance:** `beginTask` now retains an identity-only, validated source-event envelope (`routed_event_evidence`) in the ledger. `validateTask` checks its event ID against the ledger's `routed_event_id` and validates all task/approval actor/baseline/digest identity joins before packet generation. Packets include the source identity envelope, without propagating `untrusted_text`. Both ledger and packet JSON Schemas require the evidence. Negative cases relabel the top-level ID, alter evidence ID or manifest digest, and omit the evidence; all are rejected. This ensures internal record consistency, **not** authenticated provenance or tamper-proof storage. A caller that can rewrite all related fields is not a trusted boundary: Stage C needs independent event authority and durable append-only/audited persistence.
2. **Empty owner-decision event IDs:** `verifyOwnerDecision` explicitly checks `event_id` as a nonempty string for both `implementation_acceptance` and `release_authorization`. Native and JSON Schema tests reject an empty ID even when synthetic `trusted.event_id` is also empty.
3. **Low, deferred:** `schema-validator.mjs` may skip unsupported keywords in unvisited `anyOf`/conditional branches. Existing schemas use supported keywords, so no present validation failure was identified. The test-only validator is not a production security or authorizer, and a comprehensive preflight is deferred to a later schema-maintenance effort. This is explicitly documented rather than silently treated as fixed.

Local checks for this narrow correction: **100/100** native Node tests; **11/11** fixture simulations, zero external actions. Hosted exact-head CI, owner acceptance and separate merge/release authorizations are still outstanding until independently verified. PR #289 stays draft and unmerged. No changes to GitHub workflows, game runtime, secrets or runner state.
