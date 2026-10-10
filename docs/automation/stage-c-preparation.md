# Stage C manually dispatched Codex smoke: PREPARATION ONLY

**Status:** Draft stacked on accepted Stage B PR #289, exact Stage B implementation `1766e5fcd7608644a7b332975f42d800124047d0`. **No execution, merge, secret, GitHub environment, setting, preview or production action is approved.** Owner approved *preparation*, not Stage C activation. Current `main` is `f16173c562911df0020aef22dce1521d104d521e`, with branch-protection enforcement off. Existing `main` CI can publish Pages on merges, including docs-only merges. Neon Grid PR #242 and pinned preview are unrelated and off-limits.

## First experiment: deterministic automation-only fixture

- Task `MAYHEM-AUTO-SMOKE-001`, sole change-eligible path `tests/ai-handoff/stage-c-smoke-fixture.json`.
- A seeded wrong value for input `6` deliberately fails `node tools/ai-handoff/stage-c-fixture-check.mjs`. Correct answer `21` passes. This is **not** a regular Vitest `.test.*` file and does not break normal PR CI.
- One Codex invocation proposes a **typed JSON integer only**. An independent job on a fresh runner validates the exact task and allowed data, computes a deterministic pass/fail, then (only with separately approved GitHub draft-PR permission) writes the fixed fixture and opens a **draft** PR. No model-authored patch or script is executed by that publisher.
- The smoke demonstrates genuine authenticated manual dispatch, isolated agent use, narrow typed handoff, one deterministic repair, external controls and safe draft-only output. It does **not** yet demonstrate the full autonomous three-cycle correction loop, independent Stage D AI review, owner-accepted production, or release; these remain explicit follow-up acceptance questions. One attempt is below the three-cycle ceiling, never a claim that retry behavior was exercised.

## Boundaries and fail-closed activation

The workflow `.github/workflows/ai-handoff-stage-c-smoke.yml` has **only** `workflow_dispatch`. GitHub will not offer manual dispatch until the workflow is installed on the default branch. No branch-only dispatch is claimed. It uses pinned `actions/checkout`, `actions/setup-node` and `openai/codex-action` commit SHAs, least-privilege read-only permissions on Codex's job, `permission-profile: ':workspace'`, and `safety-strategy: drop-sudo`. The Codex Action is **the last step** in the agent job. The separate publisher has the only write token. It rejects any unexpected path, data shape or dirty checkout and can only create a draft PR from a new isolated branch, never push to main or deploy.

**Deliberate double lock:** the trusted manifest has `activation_state: PREPARED_DISABLED`; the preflight refuses all current launches. Activation requires a **new reviewed commit** changing this field to `OWNER_APPROVED_SINGLE_RUN`, plus GitHub repository variables `AI_HANDOFF_STAGE_C_ENABLED=true`, `AI_HANDOFF_APPROVED_BASE_SHA=<exact future main workflow SHA>`, `AI_HANDOFF_APPROVED_MANIFEST_SHA256=<sha256sum of committed manifest bytes>`, and `AI_HANDOFF_HARD_SPEND_LIMIT_VERIFIED=true`. Manual inputs accept only the exact task ID and manifest digest, while the preflight independently checks the authenticated GitHub actor is `Manaconda33`, event is `workflow_dispatch`, ref is `refs/heads/main`, and running SHA matches owner-approved SHA. A further `AI_HANDOFF_DRAFT_PR_ENABLED=true` allows the **separate** publisher job. All variables must be set intentionally in a later owner-approved step; none have been set here. The launch must also verify the repository Actions setting permits GITHUB_TOKEN-created PRs. Because `GITHUB_TOKEN`-generated PR events may not start downstream checks, a successful draft PR is not proof of independent CI.

**API credentials:** No key has been created, requested, read, set, or logged. A future dedicated, least-privilege, isolated OpenAI API project must be verified with a *hard* spend limit at most $5 (not merely alerts), plus a dedicated secret named `AI_HANDOFF_OPENAI_API_KEY` configured only after explicit owner approval. A hard project spend limit is externally enforced with possible billing delay/overshoot; repository variable attestation does not itself measure or enforce spend. Ensure no other workloads use the project. Read GitHub logs and provider usage following the run, with measured cost/limits as actually reported. If this budget control cannot be independently confirmed, the live run stays **BLOCKED**, even with valid code.

**Runtime/attempts:** preflight job max 5 minutes, Codex job max 45 minutes, separate draft publication max 8 minutes, one Codex attempt. GitHub queue/scheduling overhead can extend wall-clock latency; these individual job ceilings are **not a demonstrated atomic 60-minute end-to-end deadline**. An externally verified stop plan must be accepted before run; cancel via GitHub Actions on any boundary failure, disable the enable flag, and rotate the pilot key if needed. Real live runtime enforcement beyond job limits is a launch review item.

## Local non-executing validation

From this stacked candidate root:

```sh
node --test tools/ai-handoff/stage-c-guard.node-check.mjs
node --check tools/ai-handoff/stage-c-guard.mjs
node --check tools/ai-handoff/stage-c-fixture-check.mjs
node --check tools/ai-handoff/stage-c-candidate.mjs
# The next command MUST fail to prove the defect exists:
node tools/ai-handoff/stage-c-fixture-check.mjs
# This must be rejected until a later owner-authorized manifest activation:
node tools/ai-handoff/stage-c-guard.mjs preflight
# A typed mock proposal can be validated without credentials, writes or API calls:
CODEX_FINAL_MESSAGE='{"task_id":"MAYHEM-AUTO-SMOKE-001","repaired_expected":21,"rationale":"triangular sum"}' node tools/ai-handoff/stage-c-candidate.mjs validate-only
```

## Separate decisions still outstanding

1. Review this stacked **draft/unmerged** Stage C preparation and the pinned Codex Action; accept or request changes. Stage B's acceptance comment is not a merge approval.
2. **Pages-aware owner publication decision:** choose exact reviewed Stage B PR/SHA to merge, then separately choose exact Stage C workflow installation merge/SHA. Each main push triggers existing CI/Pages, so approval must acknowledge potential deployment and any baseline-shift reconciliation.
3. Verify owner permissions, current main SHA, any active Codex work, **enable enforceable main branch protection or ruleset under separate authorization (currently absent)**, workflow permissions, action compatibility, API project hard limit, dedicated secret and rollback/cancellation mechanism. Do not activate until all prove safe.
4. Obtain separate *live smoke execution* authorization for the activated exact SHA and task digest. Only then configure approved repository variables/secret, manually dispatch, collect real run IDs, candidate SHA, path inventory, cost/time/failed-run evidence, and verify whether the draft PR actually triggers relevant CI.
5. Do **not** declare Stage C complete on a single successful proposal: bounded correction/exhausted-loop proof and true external cost measurement remain required by v1.3. Stage D independent review and Work notifications have their own future permission gates. The Neon Grid waterfall boost defect is reserved for a later, separate gameplay pilot, never for this first smoke.
