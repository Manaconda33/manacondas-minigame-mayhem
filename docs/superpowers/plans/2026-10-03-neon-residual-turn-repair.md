# Neon Grid residual climbing-bend diagnosis and repair plan

> **For agentic workers:** Use superpowers:executing-plans for native execution, one bounded step at a time. No proactive subagent delegation. Checkboxes track work; every numbered step requires a pushed repository checkpoint and a status report to Manny before advancing.

**Goal:** Explain and eliminate the unintended hop/stall on the existing gold Falls Run main-route climbing bend, with evidence separating launch/support loss from speed collapse.
**Architecture:** Diagnose the existing shared road ribbon, native Rapier support and scripted barrier response without changing behavior. Repair only a physically verified cause; preserve visible/physical road agreement and existing authorities.
**Tech Stack:** Existing TypeScript, Three.js, Rapier, Vitest and GitHub Pages; no new dependency planned.
**Spec:** docs/design/neon-grid/BUILD-CONTRACT.md; docs/PRD.md / ADR-104; docs/evidence/2026-10-03-neon-road-contact/residual-owner-feedback.md.
**Planning baseline:** Runtime branch design/neon-grid-circuit-02 at 4c981e9cfb6a7cae3645cf4458585ccf1fd194fa, hosted CI 37126486632 PASS. Deployed review runtime e441ab73ed0a5c3a2d75663de7a89a57606689b8. Main 8c29fca14b47e03df83dd0ba8c3f063aaa57e0f8; CI/Pages 37124865236 PASS. PR #242 draft/unmerged. Reverify all refs, PRs and CI at next-session startup.

## Authorization and review gates

Manny directed saving this agreed plan for a new session, with repository updates and reporting between every step. This session records the plan only. The next session starts with repository catch-up and diagnosis Steps 1–4. Step 4 is a mandatory diagnosis review gate: report measured findings and a concrete bounded repair to Manny, then wait for his approval before Step 5. Do not treat this planning checkpoint as repair authorization. Later pinned-preview publication and production release remain distinct gates; confirm preview authorization from the live session before merging its workflow-only PR. PR #242 must remain draft/unmerged until separate production acceptance/release direction.

## Constraints and evidence discipline

- Keep ORIENTED plus FIX_INTERNAL_EDGES on road support.
- Preserve approximately 1,450 m course intent, approved centerline, sharp hairpins, elevations, width profile, checkpoint authority, roster/stat/item tuning, controls and accepted Circuit Alpha behavior.
- No invisible flat floor, teleport/velocity workaround, speed cap, track widening/softening or interpolation project.
- Surface material handling/physics changes require separate discussion. Stage 3 shortcuts/Dive, scenery, new audio and production release remain gated; tokens omitted.
- Muse reports four triangle-deletion clusters near progress 0.26, 0.38, 0.50 and 0.82. These are leads, not independently confirmed unsupported holes. An affected longitudinal span is not the measured size of a support gap.
- AIRBORNE reports grounding state; it does not prove what initiated the loss of support. The airborne damping rate alone does not account for the abrupt recorded slowdown.
- Preserve original recording. Do not publish the video or binary derivatives without separate direction. File identity/hash, landmarks, frame readings and timestamps are in the evidence note.

## Checkpoint protocol — applies after EVERY numbered step

1. Update the plan checkbox, execution ledger below, docs/IMPLEMENTATION-STATUS.md and relevant evidence. Update docs/TESTING.md when adding a validation procedure; docs/DECISIONS.md when an engineering decision changes.
2. Record findings, checks/results, uncertainties, blockers, changed files, next action, approval gate and exact prior/source/deployed commits.
3. Run checks appropriate to changed files. Any runtime checkpoint requires typecheck, zero-warning lint, full automated tests, production build, diff check and LFS verification. Diagnostic failures are expected evidence, never a passing milestone; keep intentionally failing exploratory fixtures outside the active passing suite until the repair stage.
4. Commit and push only the bounded checkpoint; verify remote branch head and relevant CI. A local commit is not a durable checkpoint. If publication fails, report the blocker and stop rather than accumulate more work only in scratch.
5. Send Manny a concise status report: step/result, decisive evidence, remaining uncertainty, commit/CI, next step and whether approval is needed. Reports alone are not new approval requests; proceed within authorized diagnosis until Step 4.
6. Do not begin the next step before the current checkpoint is durable and reported. For a longer step, split into named substeps and push/report intermediate evidence before extending work. Communicate progress at least every 60 seconds; use bounded polling, not prolonged blocking waits.

If interrupted, the next session reads the ledger, verifies GitHub and resumes the first unfinished step. Never depend on scratch files, chat-only findings or an unpushed harness. Save commands, parameters and enough compact evidence to reproduce expensive diagnostic runs.

## Review focus

- Center/inside/outside lines can differ despite a clean centerline run.
- Grade transitions, overlaps and reversed faces can hide unsupported areas or lips.
- Grounding feedback and driveSupported are different predicates.
- Physical movement, scripted correction and recovery teleport must be distinguished.
- Landing near a boundary can introduce a second speed-loss mechanism.

## Step 1 — Reproduce the recorded event

**Files:** Read residual-owner-feedback.md and relevant current source; create a reproducible diagnostic harness under tools/diagnostics/ plus evidence under docs/evidence/2026-10-03-neon-road-contact/.
- [x] 1.1 Complete required GitHub catch-up: AGENTS, README, PRD/status/decisions/testing, avatar/roster/LFS contracts, Neon design/plan, recent commits, relevant PRs, CI and Pages pin. Reconcile source with the saved evidence.
- [x] 1.2 Reproduce Manaconda / The Wayfinder through the gold Falls Run climbing S-bend after the late cyan pad. Use lap-2 recording seek window 02:05.4–02:08.0, race clock approximately 1:45.6–1:48.2, as the reference.
- [x] 1.3 Compare center/inside/outside lines at normal and boosted speeds, initially without rivals/items. Save spawn pose, input sequence, timestep and results. Input is controlled, not a claim to recover unseen original key presses. Identify which run matches the location, lift and slowdown; document failure to reproduce honestly.

Deliverable: repeatable native scenario or a clearly bounded reproduction gap. Push/report after 1.1, 1.2 and 1.3.

## Step 2 — Measure road coverage and shape

**Files:** Read src/game/track/NeonGridGeometry.ts, NeonGridCollision.ts, NeonGrid.ts and neonGridLayout.json; extend only diagnostic harness/evidence.
- [ ] 2.1 Independently enumerate removed faces against the current production algorithm; map each cluster to world coordinates/main progress. Preserve the exact mesh indices and test parameters.
- [ ] 2.2 Probe actual collider support with downward rays over legal driving lines and kart footprints in all four suspect regions. Refine sampling around misses, account for overlapping triangles and local deck height, exclude self-collider hits, and distinguish intentional outside-road areas from missing road support.
- [ ] 2.3 Measure grade/normal transitions and overlapping surfaces/lips at the incident. Report actual uncovered dimensions if present; otherwise state coverage is intact and retain other hypotheses.

Deliverable: spatial coverage/shape evidence, not deletion-count inference. Push/report after each substep.

## Step 3 — Trace launch and speed loss separately

**Files:** Diagnostic harness observes src/game/physics/KartController.ts, src/game/track/GuardrailSystem.ts and src/game/KartTimeTrial.ts. Any temporary diagnostic hook must be opt-in, behavior-neutral and covered by existing checks; no default user-facing overlay or permanent diagnostics scope expansion.
- [ ] 3.1 Capture per physics step: simulation time, input throttle/brake/steering/drift, body pose and full velocity, selected surface, boost state, local road projection, all four wheel-ray hits/distances, center-ray hit, grounded, centerGrounded, driveSupported and AIRBORNE feedback.
- [ ] 3.2 Record native road contact evidence and velocity/position immediately before/after controller update, world.step and scripted guardrail response. Include boundary offset, inward normal, penetration, cooldown and velocity retained/reflected. Log every recovery/respawn invocation: reason, caller/trigger, earned checkpoint, before/after pose and velocity reset.
- [ ] 3.3 Produce an event sequence identifying the first support loss/upward impulse/boundary correction/teleport and attributing the measured speed change to each stage. Compare with recording observations, separate direct evidence from inference and report any mechanism not captured.

Deliverable: causal trace explaining initiator and speed collapse independently. Push/report after each substep.

## Step 4 — Durable diagnosis review gate

**Files:** Evidence diagnosis.md, execution-progress.md, IMPLEMENTATION-STATUS.md, TESTING.md and DECISIONS.md as applicable.
- [ ] 4.1 Record reproduction, coverage map, event trace, confirmed cause(s), alternative explanations, limitations and proposed exact repair file/scope. If no cause is established, propose the next bounded diagnostic action rather than a speculative fix.
- [ ] 4.2 Push/verify diagnosis checkpoint, report it to Manny and STOP for review. Do not advance to repair without his explicit approval.

## Step 5 — Regression and approved bounded repair

**Files:** tests/neon-grid-collision.test.ts / tests/neon-grid-road-motion.test.ts or a focused new regression; modify src/game/track/NeonGridGeometry.ts only if geometry is physically implicated. Other repair files require the Step-4 evidence/scope.
- [ ] 5.1 Create an independent regression that reproduces the confirmed defect. Observe failure on original code, preserve red output in evidence, and checkpoint a passing active suite with any red diagnostic fixture clearly outside it.
- [ ] 5.2 Implement the minimal approved correction; run the same regression green. If geometry is responsible, repair folded topology rather than indiscriminately restoring inverted triangles. Keep visual/collider support aligned and fix other regions demonstrated to share the same defect.
- [ ] 5.3 Repeat causal traces and geometry checks. Show the targeted unintended lift/slowdown is removed while legitimate impacts/airborne behavior remain. Remove temporary hooks or retain only specifically approved, non-default reproducible diagnostic tooling. Run full required checks before pushing repair.

Push/report after each substep. A failing hypothesis returns to diagnosis; do not stack unrelated fixes.

## Step 6 — Validation and owner preview

**Files:** Relevant regression suites/evidence/docs; separate workflow-only Pages pin branch/PR when authorized.
- [ ] 6.1 Verify center/inside/outside lines, normal/boosted speeds, grade transitions, all suspect regions, representative profiles and repeated complete laps; cover barriers, recovery/earned gates, items, mobile controls/camera and Circuit Alpha. Run npm run validate, git diff --check and git lfs fsck; push verified checkpoint and await exact-head hosted CI.
- [ ] 6.2 Publish an authorized separate workflow-only pinned preview. Merge ONLY that preview PR, verify post-merge CI/Pages, live source marker, build/assets and unchanged production hashes. Keep runtime PR #242 draft/unmerged.
- [ ] 6.3 Save delivery record, report gameplay link and stop for Manny's desktop/mobile portrait/landscape retest. Acceptance requires no unintended main-route hop/stall on comparable lines, retained legitimate collision behavior and accepted Alpha behavior. No device pass inferred from native tests. Production and next track stage need separate direction.

Push/report after every substep. A rejected preview returns to a bounded diagnosis checkpoint.

## Execution ledger

Canonical per-step state and next action: docs/evidence/2026-10-03-neon-road-contact/execution-progress.md. At this planning checkpoint all execution boxes are unchecked; no reproduction/coverage/trace/repair work has begun.
