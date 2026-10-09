# Manaconda's Minigame Mayhem: AI Handoff Automation Pilot

**Prepared:** 9 October 2026 (America/Chicago)  
**Revision:** v1.3, conditional post-pilot codification guidance added; v1.2 implementation-readiness safeguards retained (planning amendment; not deployed).  
**State:** PLAN ONLY. No repository modifications, GitHub issues, new workflows, deployments, or new Codex jobs have been authorized or initiated by this plan.  
**Repository:** `Manaconda33/manacondas-minigame-mayhem`  
**Project policy:** GitHub is authoritative. Owner approval remains mandatory for scope changes, published previews, runtime merges, and production publication.

## v1.3 decision note (9 October 2026)

**Owner-aligned planning decision:** include a **conditional Stage F: Operationalize and codify the proven operating model** after the pilot succeeds. Stage F is a *future scope-of-review and acceptance framework*, **not** a pre-approved specification, permission to alter agent instructions, or requirement to adopt untested automation mechanics. Its concrete changes will be determined by pilot evidence and separately approved when the time comes. The current Codex task and all production/preview controls remain undisturbed.

## Independent review verdict (9 October 2026)

**Decision: retain the overall architecture, but strengthen its phase contracts before authorizing implementation.** The v1.1 plan correctly separates Chat, GitHub, Codex, independent checks, Work, and owner decisions. It is not yet sufficiently precise at the integration boundaries. The v1.2 readiness revision, retained in this v1.3 document, addresses the following gaps:

1. **Pilot-branch trigger correction.** A new `workflow_dispatch` workflow must exist on the repository default branch before GitHub will dispatch it normally. Therefore Stage B cannot claim that a branch-only manual workflow is executable from the GitHub Actions UI. Stage B uses offline fixture tests plus a read-only pull-request check where feasible; a later, separately approved merge/publication enables a manual dispatch on `main`. Source: GitHub's manual workflow guidance.
2. **Event-chain proof, not assumption.** Events produced with the default `GITHUB_TOKEN` do not generally start other workflow runs. Some automated PR events now enter an approval-required state. The integration must prove its chosen GitHub App / authenticated dispatcher / manual approval path on the real repository before treating the chain as automatic. Do not interpret creation of a PR as proof that all downstream work ran.
3. **Quality loop phase consistency.** Stage C tests deterministic build/correction behavior only. The pilot cannot be declared end-to-end, nor `passed_for_owner_review`, until Stage D independently reviews every candidate cycle. Stage C statuses are `engineering_smoke_passed`, `blocked`, or `failed`, not final approval states.
4. **Enforceable approvals and change control.** A casual issue label is not enough. Every execution must trace to an authenticated owner decision identifying a task ID, manifest digest, permitted scope and pinned SHA. If those fields change, approval expires. Review and release authorizations must be separate records bound to exact artifact SHAs.
5. **Operational resilience.** Specify queue semantics, duplicate-event suppression, notification delivery tests, timeout/error recovery, cancellation and stale-state handling, billing ceilings, and rollback. A passed AI review is evidence, not self-certification.
6. **Pilot footprint.** No edits to `.github/workflows/ci.yml`, preview pins, runtime, binary assets, `.gitattributes`, deployment/environment settings or branch protections in the first test. Prefer a dedicated `tools/ai-handoff/`, `tests/ai-handoff/`, `docs/automation/` sandbox with no normal game-runtime effect. Any exception requires separate scope approval.

### Operating contract applicable to every phase

Every phase must name its **entry prerequisites; exact files/accounts touched; producer and consumer; trigger; test cases; durable outputs; abort/rollback; cost ceiling; owner authorization; exit criteria**. A phase is not complete merely because an agent reports success: its independent evidence must exist at a concrete GitHub commit, CI run, or explicitly labeled local test log.

**Authority by function:** Chat frames the task and can submit an explicitly authorized GitHub issue; GitHub owns task state and event routing; Codex proposes code; deterministic CI validates; an isolated reviewer challenges evidence; Work summarizes decisions; the owner accepts implementation and separately authorizes publication. No tool can approve itself or reinterpret a historical approval as permission for a new task.

**Workflow states:** `draft -> validated -> scope_approved -> queued -> running -> validating -> reviewing -> correcting` (bounded loop), then exactly one of `review_ready`, `escalated`, `failed`; after owner action, `implementation_accepted` or `changes_requested`; only distinct release approval can produce `release_authorized -> delivered -> verified -> closed`. `cancelled` and `superseded` are terminal. Illegal transitions fail closed and are logged. Rework after `changes_requested` opens a new attempt tied to new explicit scope/decision; it does not silently reset the original retry budget.

**Immutable identity:** use repository + task ID + issue number + approved manifest SHA-256 + baseline commit SHA + cycle number + candidate commit SHA + run ID. Every automated action must assert the expected current state (compare-and-swap or equivalent) before writing. Each PR and report links back to the exact task and approval record. Never rely on natural-language summaries as the authoritative state record.

**Queue and notices:** one task executing in the pilot workstream. Use an explicit queue ledger/lease with a stale-lease recovery policy. GitHub concurrency prevents overlap, but by default may replace a pending run; if using GitHub's expanded queue feature, configure and test it, otherwise hold additional tasks in `queued` state until the dispatcher releases them. Each delivered review packet is deduplicated by task ID + final SHA + terminal loop state, and success is confirmed by an actual received message/task, not assumed from a webhook being sent.

## Why we're planning rather than executing now

Codex is already performing another project task. Do not create a second agent job on the same workstream or change the current release workflow while that work is underway. Inspect and reconcile the repository state again after the active job finishes. The current main branch's `.github/workflows/ci.yml` responds to pull requests and pushes to `main`; a `main` push includes production-build, retained-preview assembly, and GitHub Pages deployment. Even merging a documentation/automation PR can therefore initiate a production pipeline run. Treat merges to `main` as publication events requiring explicit authorization.

## Goal and success criterion

**One product-owner approval of an AI task** should lead to a controlled implementation request, a bounded **build → validate → independent critique → correct** loop, a reviewable pull request, and a concise review packet. The workflow must stop for product-owner judgment or authority, not repeatedly request permission for routine tests or bounded fixes. The pilot does not automate production merges or deployment approval.

**Pilot success:** complete one deliberately low-risk, non-gameplay task end-to-end; confirm that it cannot alter current Neon Grid implementation, production code, existing preview pins, releases, or approved assets; demonstrate both a successful autonomous correction and a deliberately exhausted/blocked loop; retain an auditable link from requirement through each test/review iteration to the owner decision.

## How the handoffs work

1. **Chat: intake and scope approval.** Produce a structured handoff manifest containing task ID, objective, relevant project documents, immutable starting SHA, allowed paths, prohibited paths, acceptance tests, maximum iteration/cost bounds, and owner approval requirements. A conversation itself is not a reliable automatic GitHub trigger. Following explicit instruction, the assistant can create a GitHub issue via the connected GitHub integration; alternatively the owner can submit the template manually.
2. **GitHub: state machine / coordination.** Store the accepted manifest in an issue. The workflow validates an exact trusted trigger, issue author/permissions, manifest completeness, uniqueness, and an `approved-for-agent` state. Initially it operates **dry-run only**. Later, enable a guarded trigger on an explicit issue label or manual workflow dispatch. Never trigger privileged jobs from arbitrary PR comments or untrusted issue text.
3. **Codex: bounded execution and corrections.** Start a distinct task branch *after* the active Codex task finishes. Use `openai/codex-action` or another authorized Codex runner, with a separately provisioned API credential and limited permissions. Read `AGENTS.md`, `docs/PRD.md`, `docs/IMPLEMENTATION-STATUS.md`, `docs/DECISIONS.md`, `docs/TESTING.md`, `docs/AVATAR-INTAKE.md`, `docs/ROSTER-MAPPING.md`, and `docs/LFS-PUBLISHING.md` before implementation. Pin the base SHA, reject out-of-scope changes, run agreed checks, and enter the bounded quality loop below before presenting a draft PR for owner review. Codex receives no production-deployment or merge authority.
4. **CI + independent reviewer: automated evidence and challenge.** Reuse existing tests and quality gates; do not rewrite or weaken `.github/workflows/ci.yml`. A separate, read-only reviewer evaluates the actual diff and evidence independently of Codex and reports actionable findings; no reviewer approval based solely on the implementing model's narrative. Record test names/results, branch and commit SHA, changed-file inventory, CI links, reviewer findings, unresolved issues, and deviations from scope. Separate code validation from owner-only game-feel and visual acceptance.
5. **Work: review packet after quality-loop exit.** Configure an event-triggered Work task for authorized GitHub PR activity **only once the bounded loop reaches an owner-review or escalation state**, avoiding review storms from every intermediate commit. Its narrow job is to collect PR requirements, changed files, CI evidence, independent critique, iteration history, preview status and exceptions and return an owner-facing decision brief. A Work trigger is not assumed to invoke Codex automatically or to bypass connected-app approval requirements.
6. **Owner: two distinct release gates.** First approve/reject the **implementation** based on evidence and playtest where applicable. Separately authorize **merge/publication** with exact PR/commit and expected destination; a new approval is needed if implementation changed materially. Never enable blanket auto-merge or main pushes.
7. **Close and preserve.** Record owner decision, changed SHA, PR, CI, preview provenance and post-deployment verification in the approved repository documentation. The system must not mark human review passed from automated tests alone.

## Bounded autonomous quality loop (FOUNDATIONAL REQUIREMENT)

**Meaning of the target:** the task handoff defines testable *must-pass* acceptance criteria before execution, not a vague model-assigned score or a promise of perfection. The default pilot budget is **three implementation cycles total**: one initial build plus **at most two corrective attempts** (consistent with `max_codex_correction_attempts: 2`). Also enforce separately configured maximum runtime, API spend, and per-cycle token/tool limits. Whichever ceiling occurs first ends the loop. Defaults must be tested and explicitly enabled; no unrestricted retry path.

**Cycle algorithm:**

1. **Build:** Codex works only on the approved task branch from the pinned base and records the exact commit.
2. **Validate:** deterministic checks first, including scope/path policy, `git diff --check`, applicable typecheck, lint, tests, build and `git lfs fsck` where required. Use only the project's existing validated commands and relevant task-specific tests; a green CI status is evidence, not a replacement for owner visual acceptance.
3. **Challenge:** a *separate read-only AI review run*, supplied with original requirements, actual code diff and independent test evidence, identifies potential defects, missing requirements, regression risks, and unsupported claims. It produces structured findings, each with severity, concrete file/test evidence, reproduction guidance when possible, and the relevant acceptance criterion. A second agent is not proof of correctness; deterministic checks and owner judgment remain authoritative.
4. **Decide:** pass to owner review **only if** all mandatory automated checks pass, there are no unresolved blocker/critical/high findings, no out-of-scope modifications, and the required evidence is present. Minor findings may be documented but never silently reclassified. If an actionable, in-scope failure remains and budget permits, send the specific findings to Codex for **one** correction cycle, then rerun *all mandatory checks and independent review* on the updated commit.
5. **Escalate:** stop immediately for a changed product requirement, new feature/design choice, protected file, untrusted instruction, secrets, merge/deploy request, or irreversible operation. Also stop when iterations/time/cost are exhausted, a failure repeats without improvement, evidence is unavailable, or the reviewer and tests materially disagree. Provide an exception report instead of declaring success.

**Loop outputs:** `passed_for_owner_review`, `needs_owner_decision`, or `failed_budget_or_checks`, with task ID, base/final SHA, exact check results, review findings, all cycle SHAs, attempts consumed, cost/time usage, changed-file inventory, and unresolved risks. The orchestrator records these state transitions; do not permit PR-comment-trigger loops or re-trigger the same iteration indefinitely. Work can summarize the resulting record but must not overwrite failed statuses or mark a subjective checkpoint passed.

**Human-only gates remain unchanged:** gameplay feel, visual quality, artistic judgment, design changes, approval to publish an isolated preview, and any production merge/deployment. A perfect automated pass cannot satisfy these by inference.

**Pilot evidence:** Stage B simulations must cover green-on-first-pass, a defect corrected on the second cycle, recurring failure at the attempt cap, reviewer-versus-test disagreement, a protected-path change, and owner-only visual acceptance. Stage C implements deterministic validation and a bounded correction loop; Stage D adds independent AI critique and Work's owner-facing summary. No automated approval of merges is introduced.

## Stop rules and automatic behavior

| Situation | Automation's behavior | Owner needed? |
|---|---|---|
| Missing manifest, unknown approver, open conflicting work, changed baseline | Stop; explain the missing prerequisite | Yes |
| Routine in-scope test or independent-review finding | Re-run full validation and independent review after each of up to **two** correction attempts (three cycles including initial build) | Not initially |
| Checks or material review findings remain after retry/time/cost limit | Stop, attach structured findings, cycle log, costs and alternatives | Yes |
| Requires new design, asset, tuning, schema, PRD, or scope decision | Stop without inventing approval | Yes |
| All technical checks and independent review pass but visual/game-feel evidence absent | Generate review packet; await owner playtest | Yes |
| PR ready but release not approved | Keep draft/unmerged; no production action | Yes |
| Scope diff changes protected paths, preview pins, deployment conditions, secrets, or approval rules | Stop; require a separately approved proposal | Yes |

**Hard guardrails:** one pilot agent job at a time per affected workstream; concurrency locks; attempt, time, and budget ceilings; repository and branch allowlists; narrow GitHub token permission; isolated model credential; **independent read-only review**; strict untrusted-input handling; immutable per-cycle evidence and audit trail. Run Codex in its least-privileged workable sandbox and give branch-writing privileges only to a separate, constrained publication step. Never grant the model production credentials.

## Incremental rollout: reviewed phase contracts

### Stage A: read-only architecture and readiness review (NOW)

- **Entry:** v1.1 plan, available project governance, and read-only GitHub access. No implementation authority.
- **Actions:** Review `AGENTS.md` and required governance documents; identify existing `main` triggers, protected scopes, draft PRs and an actively running Codex assignment; compare claims about Codex Action, Work triggers, GitHub workflow dispatch and event recursion with official docs. Preserve the current implementation task's boundaries.
- **Deliverables:** this v1.2 plan; risks/assumptions register; staged decision gates; a named pilot test fixture and a list of required branch/environment settings to confirm before Stage B.
- **Exit proof:** repository constraints and documented event caveats are explicit; no repo write, API secret, scheduled job, new issue or Codex run. Inspect current main/PR/CI again *after* the other Codex task completes, because these are time-sensitive.
- **Owner gate:** no new permission required to review. **Separate explicit authorization** required to open the Stage B branch/PR.
- **Fallback:** if Codex is still active or the repository moves, remain in plan-only status.

### Stage B: isolated, nonexecuting validation (first authorization)

- **Entry:** Codex's conflicting work is finished or confirmed not to overlap; fresh main commit and open-PR inventory recorded; owner authorizes Stage B's exact non-runtime file scope.
- **Allowed initial files:** `docs/automation/**`, `tools/ai-handoff/**`, `tests/ai-handoff/**`, a tightly scoped issue template, and optionally a **new** read-only PR-triggered check under `.github/workflows/agent-handoff-dryrun.yml`. Preserve `.github/workflows/ci.yml`, existing preview sources/pins and runtime directories. Do not touch repository settings.
- **Build:** a versioned JSON Schema and fixture examples; validator; state-transition table; approval/identity verifier stub; idempotency rules; queue schema; event-routing map; a lightweight report generator; an operator runbook. All are **simulation-only** and must not call Codex, APIs, write issues, or modify protected files.
- **Trigger realism:** run fixtures locally and, where GitHub safely permits, as a read-only `pull_request` check. **Do not use a branch-only `workflow_dispatch` as the Stage B test**; GitHub manual dispatch requires the workflow on the default branch. Mark manual dispatch activation as a later release decision, not a passed Stage B test.
- **Required negative tests:** unknown signer/actor; unapproved manifest; changed SHA/digest; duplicate webhook and repeated label; hostile issue text; path traversal; prohibited file edit; stale baseline; occupied queue; unexpected PR event; timeout; loop over budget; fake 'AI-approved' visual test; merge request without an exact authorization.
- **Exit proof:** test logs and fixture expected/actual results; a draft PR targeting `main`; diff inventory only within approved pilot files; passing normal PR CI as applicable; a written confirmation of what cannot be tested yet. No runtime code, page publication or privileged workflow run.
- **Owner gate:** approve/reject Stage B artifacts. **Merging the foundation PR is a separate publication authorization**, because any push to `main` triggers existing Pages jobs. No implicit merge approval.
- **Abort/rollback:** close the draft PR and delete its pilot branch after consent; leave `main` and current runtime untouched. Existing PR validation may still consume CI time, so quantify that overhead.

### Stage C: manually authorized Codex smoke test (second authorization)

- **Entry:** Stage B accepted; determine whether a narrowly scoped workflow must be published to default branch before it can be manually dispatched; obtain **separate explicit owner approval** for that merge/publication, including Pages implications. Verify current branch protection, GitHub Actions permissions, runner strategy, API entitlement and cost controls. No live launch before these steps pass.
- **Trigger and identity:** one owner-initiated `workflow_dispatch` run from a trusted default-branch harness or an equivalently authenticated, proven dispatcher. Pass only task ID and immutable manifest digest; fetch/validate the rest from the trusted repo. Validate authenticated operator, approved task state, exact baseline and non-overlap before using any secret.
- **Security:** store API key only in GitHub secrets, with least privilege and billing limit; pin action versions or reviewed commits; use `openai/codex-action` with `permission-profile: ':workspace'` for edits, `safety-strategy: drop-sudo`, and a trusted config. Never combine that profile with the legacy `sandbox` option. Keep the AI process isolated from token-powered publish operations; use a separate constrained job to create a draft PR after policy checks. No write token or deploy credentials in the model's execution environment.
- **Test task:** a deliberately seeded defect in an automation-only fixture/test under `tools/ai-handoff/**` or `tests/ai-handoff/**`; permitted change paths explicitly enumerated. The successful correction is verifiable with deterministic tests without touching the game or assets.
- **Loop:** initial build plus up to two corrections, each followed by path policy and all mandatory deterministic checks. Independent AI challenge is *not yet installed*; mark result **`engineering_smoke_passed`, not `review_ready`**. Inject one deliberate stuck/over-budget case to prove fail-closed behavior. Avoid retrying infrastructure failures as though they were code defects.
- **Event proof:** confirm actual run creation, bounded execution, draft PR, CI and artifact persistence. Where PR events are produced using `GITHUB_TOKEN`, record any workflow-approval-required state; do not silently substitute an unapproved PAT or GitHub App. Test and document the chosen event bridge explicitly.
- **Exit proof:** branch/PR linked to manifest SHA, full changed-file inventory, cycle log, actual run IDs and checks, measured token/time/cost where provider returns them, stop behavior and security scan of logs. Pilot branch stays unmerged.
- **Owner gate:** separate approval before any secret-backed action starts, and separate acceptance of its results. **No production merge or Pages release.**
- **Abort/rollback:** revoke/rotate compromised credentials, disable dispatch, cancel active run, mark lease expired, close pilot PR if authorized; never use a speculative rollback against main.

### Stage D: independent critique, Work packet, and full handoff proof (third authorization)

- **Entry:** Stage C technical smoke test accepted; verified connected GitHub access and Work event-trigger feature; separate owner consent for event-triggered Work setup; agreed notification destination.
- **Independent review:** launch a genuinely separate read-only review context on each candidate SHA, with original manifest + actual diff + independently gathered check evidence. Require structured findings (`severity`, `criterion`, `file/line`, `reproduction`, `confidence`, `disposition`). Block `critical/high` and uncovered must-pass requirements; allow lower-severity findings only if explicitly documented and not prohibited by the task. Review cannot rewrite CI verdicts.
- **Corrective loop:** run a fresh, separately authorized Stage D fixture/task with a new three-cycle budget (do not silently recycle or reset Stage C's task); independent findings may prompt at most the remaining two Codex corrections; all checks and a fresh independent review are rerun for each candidate SHA. If the reviewer/test disagree materially, stop; an unsubstantiated model grade can never override a failing deterministic test.
- **Work trigger:** GitHub PR activity is a verified supported source, but **a final-quality-state event filter is a design to be tested**, not an assumed native feature. If Work can filter to the authorized PR/label/state, configure it and prove it fires once; otherwise use a narrow event condition plus deduplication, or a manual Work handoff, until integration works. Never run Work for each intermediate push by accident.
- **Review packet:** one-page owner brief with objective, reviewed SHA, required checks pass/fail, reviewer findings, iteration count, remaining risks, exact preview status and direct PR/test evidence. It must say **not playtested** when human visual or driving acceptance remains open. Owner choices: `accept implementation`, `request bounded changes`, or `escalate`. Notification delivery requires an observed successful end-to-end test.
- **Adversarial tests:** duplicate GitHub events; absent Work connection; PR updated after packet generation; bad/missing report; new high-severity finding; external issue injection; failed notification; reviewer hallucinated line; owner rejects and resubmits. The packet must identify stale SHAs, retry safely or escalate, and never grant implicit approval.
- **Exit proof:** one full success flow and one full rejection/escalation flow, with immutable logs and exactly one relevant owner-review packet per terminal candidate SHA. No new production authorization implied.
- **Owner gate:** consent to connect/enable the Work task; final human acceptance of the pilot and the reviewed artifact.
- **Abort/rollback:** disable the Work trigger, leave PR draft, retain audit trail and revert only isolated pilot configuration with fresh owner approval if already published.

### Stage E: guarded routine use and optional discovery (fourth authorization)

- **Entry:** owner has explicitly accepted Stage D evidence; current permissions, budget and concurrency controls rechecked; runbook has named operator and failure owner.
- **Activation:** optionally enable authenticated issue-label or trusted GitHub App dispatch; keep manual initiation as fallback. Validate identity of the authorizing *action*, not just issue author or label presence. Use a digest-bound approval record and ensure new approval for changed manifests.
- **Controls:** enforce one executing task per workstream; a true queue or documented backpressure; deduplication; per-task runtime/attempt/cost ceilings; task-specific path allowlists; secret redaction; notification on failures; stale-lease recovery. Test GitHub concurrency queue settings on the actual account instead of assuming default pending-run behavior. Ensure actions initiated by model content cannot trigger a privileged runner.
- **Release gates:** require human implementation acceptance, separate exact-SHA preview/publication approval if needed, and separate exact-SHA merge/production authorization. Check actual branch protection and required status rules; don't mistake a documented policy for an enforced one. If code changed post-approval, revalidate and reapprove.
- **Metrics:** track human interventions per task, first-pass acceptance, fixes per task, escaped defects, turnaround by stage, duplicate triggers, dropped notifications, agent/API spend, Actions overhead and rollback events. Define a pilot acceptance sample before increasing concurrency; do not optimize solely for fewer human prompts.
- **Proactive discovery:** optional and **separate** from approved execution; Work may recommend issues but cannot dispatch new implementation without approval.
- **Exit proof:** stable audited use over an agreed sample of low-risk tasks; written runbook, owner stop switch, actual rollback drill and a portability checklist before extending to Compounding Architecture or Empire Today. If the pilot meets those criteria, assess the *conditional* Stage F codification proposal separately; do not silently write it into repository instructions. Empire work remains subject to corporate authorization and data governance.
- **Owner gate:** a distinct go-live approval and new approval for expansion to additional repos or corporate systems.

### Stage F: operationalize and codify, **conditional / post-proof** (future planning guidance, not authorized implementation)

**Purpose:** once the new workflow has demonstrated dependable end-to-end operation, make the *proven* ways of working durable, discoverable, and consistently enforceable for future agents and project sessions. **Do not decide the exact file edits, workflow changes, instruction wording, or versioning scheme today.** Those choices depend on what the pilot actually validates and on repository conditions at that later time.

**When to consider Stage F:** only after Stage D proves the complete handoff and Stage E demonstrates stable, owner-accepted routine operation across an agreed sample, including a successful task, a rejected or escalated task, an interruption/recovery case, and correct human review/release pauses. If the pilot changes direction or fails, revisit this stage instead of copying unproven rules into permanent instructions. Stage F remains **unstarted and unauthorized** until its own future scope approval.

**Areas to evaluate after proof (candidates, not predetermined deliverables):**

1. **Agent entry instructions.** Decide what minimal, proven guidance belongs in `AGENTS.md` or other existing agent entrypoints: how to find the current workflow contract, what source of truth to trust, what tasks may be accepted, how to handle a blocked handoff, and which decisions remain owner's alone. Avoid burying every workflow implementation detail in top-level instructions.
2. **Canonical orchestration reference.** Consider a versioned source-of-truth document or schema explaining role boundaries among Chat, GitHub, Codex, independent validation/review, Work, and the owner; task identity and states; handoff inputs/outputs; timeout and retry rules; escalation; audit records; and fail-closed behavior. Select an appropriate location and format after examining the working pilot artifacts.
3. **Alignment with current project governance.** Review `docs/PRD.md`, `docs/DECISIONS.md`, `docs/IMPLEMENTATION-STATUS.md`, `docs/TESTING.md`, existing handoff/runbooks, and applicable ChatGPT project instructions for contradictions or stale manual steps. Update only what needs revision. Preserve established gameplay, asset, preview, publication and owner-approval rules unless separately amended.
4. **Machine-enforced controls versus written guidance.** Inventory which constraints are actually enforced through GitHub permissions, branch protections, workflow conditions, immutable SHAs, schema validation and CI. Where a rule is still advisory, decide whether enforcement is necessary and feasible. Never represent a documentation statement as a technical security guarantee.
5. **Lifecycle and change management.** Decide how to version the operating model, propose amendments, compare them against the last proven version, record owner approvals, prevent contradictory instructions, and provide a reversible migration/rollback route. Retain a clear manual fallback when integrations are unavailable.
6. **Fresh-session transfer test.** Have an independent agent, using only the repository's current approved instructions and a valid task handoff, identify the authority chain, execute or simulate its authorized portion, produce auditable evidence, and stop at the appropriate human checkpoint without bespoke instructions from the owner. Test that it **refuses** an unauthorized or stale request as well.

**Decision and acceptance framework for a future Stage F proposal:** use evidence from actual pilot runs to identify gaps; compare alternatives for the smallest maintainable change; present a bounded, versioned proposal specifying files, risks, approvals and validation before implementation. A successful Stage F would leave no conflicting project guidance, make the workflow intelligible to a fresh agent, preserve a tested manual fallback, and demonstrate that authorization boundaries survive context loss or tool unavailability. Do not call Stage F complete based on documentation alone.

**Non-negotiable gate:** any proposed merge to `main`, even docs-only, initiates the current Pages pipeline and requires a **new, explicit owner merge/publication authorization** tied to the exact PR and commit. Do not automatically rewrite `AGENTS.md`, PRD, CI, protections, preview pins, or other durable governance as a consequence of pilot success. Stage F is also not blanket permission to expand to Compounding Architecture or Empire Today; those require separate project-specific review and authorization.

## Proposed Chat-to-implementation handoff contract (schema v1.2)

```yaml
schema_version: '1.2'
id: MAYHEM-AUTO-001
repository: Manaconda33/manacondas-minigame-mayhem
issue_number: <assigned by GitHub>
requested_by: <authenticated GitHub account>
approved_by: <authenticated GitHub owner account>
approval_event_id: <immutable audited action/event ID>
approval_scope: implementation_only   # never publication
manifest_sha256: <canonical approved manifest digest>
base_branch: main
base_sha: <40-char commit pinned when task is authorized>
objective: <one bounded task>
workstream_lock: pilot-automation
allowed_paths: [tools/ai-handoff/**, tests/ai-handoff/**, docs/automation/**]
forbidden_paths: [src/**, public/**, .github/workflows/ci.yml, .gitattributes, package-lock.json]
acceptance:
  mandatory_checks: [approved_path_diff, git_diff_check, task_fixture_tests, applicable_repo_ci]
  required_evidence: [changed_file_inventory, cycle_shas, check_runs, reviewer_report]
quality_loop:
  total_build_cycles: 3   # initial build + no more than 2 corrections
  max_corrective_attempts: 2
  elapsed_minutes_limit: <owner-set before Stage C>
  api_spend_usd_limit: <owner-set and enforceability verified>
  reviewer_required_for_final_ready: true   # Stage D onward
  block_severities: [critical, high]
  stop_on_disagreement: true
security:
  runner_permission_profile: ':workspace'
  prohibit_model_write_token: true
  prohibit_secret_in_issue_or_logs: true
  manual_dispatch_only_until_stage_e: true
notifications:
  destination: <owner-verified delivery channel>
  dedupe_key: <task id + candidate SHA + final state>
state: draft
owner_gates:
  - scope_approval
  - implementation_acceptance
  - isolated_preview_publication_if_needed
  - exact_sha_merge_and_production_authorization
```

**Schema notes:** This is a design example, not a syntactically complete production configuration. Runtime policy must verify the canonical digest (computed over the approved immutable manifest fields while excluding the digest field itself and mutable runtime state), the GitHub actor and permissions, allowlist glob semantics, SHA/base consistency, reviewer evidence, and lease ownership. Do not trust `approved_by` as self-declared text in an issue. Costs may require more than API quota settings to enforce hard per-task ceilings; until measured and enforced, default to conservative runner timeouts and a manual stop. Branch publication has separate authority from a scope approval.

## Technical and product caveats

- **Chat cannot silently auto-trigger Codex after arbitrary conversation turns.** The reliable bridge is an explicit authorized GitHub tool action or another approved event source. The resulting task still needs an authenticated, immutable execution approval.
- **Work can react to PR activity** in an authorized connected repository, but automatic composition of its results with Codex requires integration and should be validated rather than assumed.
- **GitHub Codex Action requires API authentication** and separate API billing may apply; a ChatGPT subscription alone is not a substitute for configuring the runner. Use narrow `permission-profile`, `drop-sudo`, secrets separation, and action-version review; do not run PR-controlled scripts alongside secrets.
- **Do not weaken repository approvals to simplify automation.** The desired outcome is fewer manual handoffs, not fewer meaningful reviews. Independent AI critique reduces oversight effort but does not certify correctness or gameplay quality.
- **No existing release or preview behavior is authorized to change by this document.**

## Sources inspected

- Project: https://github.com/Manaconda33/manacondas-minigame-mayhem
- Repository agent rules: https://github.com/Manaconda33/manacondas-minigame-mayhem/blob/main/AGENTS.md
- Existing CI: https://github.com/Manaconda33/manacondas-minigame-mayhem/blob/main/.github/workflows/ci.yml
- Release governance: https://github.com/Manaconda33/manacondas-minigame-mayhem/blob/main/docs/PRD.md
- OpenAI Codex Action: https://github.com/openai/codex-action
- OpenAI Work and Codex: https://help.openai.com/en/articles/20001275-chatgpt-work-and-codex

## Next decision, when current Codex work finishes

Authorize **Stage B only**, after confirming the latest main, PRs and CI: create a **draft**, unmerged PR with handoff documentation, fixture tests and a safe read-only PR validation path. **Do not assume that a branch-only `workflow_dispatch` can be run manually.** Stage C's manually invoked runner only becomes possible after the workflow is legitimately installed on the default branch under a separate, Pages-aware merge authorization. No current Codex task, runtime, preview pin or production release is affected by this plan revision.

## Supporting verification (official sources)

- GitHub manual dispatch requires the workflow file on default branch: https://docs.github.com/en/actions/how-tos/manage-workflow-runs/manually-run-a-workflow
- GitHub `GITHUB_TOKEN` event recursion/PR approval exceptions: https://docs.github.com/en/actions/concepts/security/github_token
- GitHub Actions concurrency and pending queue behavior: https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/control-workflow-concurrency
- GitHub Actions PR security: https://docs.github.com/en/actions/reference/security/securely-using-pull_request_target
- Codex Action settings and security: https://github.com/openai/codex-action/blob/main/docs/security.md
- Work GitHub PR trigger and connection/approval constraints: https://help.openai.com/en/articles/20001275-chatgpt-work-and-codex
