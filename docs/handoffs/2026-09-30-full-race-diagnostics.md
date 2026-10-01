> **Superseded continuation:** Diagnostics, optimization and player drift effects are now accepted and published. Start with `docs/handoffs/2026-09-30-post-drift-release.md`. The tasks and pending gates below are historical.

# Full-race diagnostics session handoff — 2026-09-30

## Current source

- Repository: `Manaconda33/manacondas-minigame-mayhem` (public). Main is the implementation source of truth.
- Music runtime publication: `40f42c13a7700257aebc87cf7b8fe80e707e3837`; publication documentation baseline: `25ebe7996d7f9bbcae13142713118964d0d11123`.
- Audit and this setup are delivered through PR #211. Verify its merged commit and current main on entry; never assume an old SHA is still head.
- Music/SFX integrated listening and production publication are complete. Task 10/11, desktop/mobile portrait/landscape flow, Results/HUD and restart acceptance remain PASSED.

## Authorized next task

Manny aligned with the audit recommendation and requested repository setup for a new session to get started. Implement **opt-in full-race diagnostics and capture the current Medium baseline**, following `docs/superpowers/plans/2026-09-30-full-race-diagnostics-medium-baseline.md`, natively in an isolated review branch. Start at Task 1 after repository catch-up; no duplicate audit or scope-approval request. Do not implement more graphics effects in this increment.

## Read on startup

1. AGENTS.md and all required project documents; current main, recent commits, relevant PRs and CI.
2. `docs/SLICE-6-GRAPHICS-AUDIT-2026-09-30.md`.
3. `docs/superpowers/plans/2026-09-30-full-race-diagnostics-medium-baseline.md`.
4. This handoff and latest status entries. Treat old pending music/audio wording as historical.

## Important constraints

- Raw RAF interval drives diagnostics; existing 0.1-second clamp continues driving simulation. Current HUD uses the clamp, so it cannot prove long-frame performance.
- Existing ItemPerformanceMeter is subsystem-only; preserve its accepted results and `testItemPerf` behavior.
- New diagnostics use `?testRacePerf=1`; disabled ordinary UI/gameplay/audio remains unchanged. Preserve accepted camera/control/layout and assets.
- Do not claim a full-race Medium pass from unit tests, item meter, FPS HUD or a short/provenance-incomplete capture. Record real device/browser, eight racers and actual 1920×1080 drawing buffer.
- Bloom, blur, wheel dust, richer drift/speed VFX, auto quality changes, context-loss repairs, resource-cleanup fixes and compressed music derivatives are later scopes.
- Repository binary policy remains unchanged. Approved five WAV exceptions are narrow; keep other binary assets governed by LFS and documented upload paths.
- Commit and push bounded progress with status/test evidence so another session can resume. Runtime review PR/preview is permitted within existing workflow; merge and production deployment still require Manny's approval.
- If the execution environment cannot run shell/tests/browser, record the blocker and continue read-only/independent preparation; never mark execution tests or captures passed without evidence.

## Stop point

Provide the diagnostics review URL, test/CI evidence, exported baseline or precise capture blocker, and a short review checklist. Wait for Manny before runtime merge/production publication or subsequent VFX/post-processing work. No next PRD slice is authorized.

## Copy/paste continuation prompt

Continue Manaconda’s Minigame Mayhem from GitHub (`Manaconda33/manacondas-minigame-mayhem`). Read `docs/handoffs/2026-09-30-full-race-diagnostics.md`, then AGENTS.md and its required documents. Verify current main, PR #211, and CI. Manny aligned with the graphics audit and approved proceeding with the bounded next task: optional full-race diagnostics and the current Medium baseline. Execute `docs/superpowers/plans/2026-09-30-full-race-diagnostics-medium-baseline.md` natively, task by task, beginning with Task 1. Do not repeat the audit or ask for the same scope approval. Keep raw diagnostic timing separate from the existing simulation clamp. Preserve all accepted HUD/Results, desktop/mobile flow, restart, SFX/music and production gates. Save checkpoints and evidence in the repo. Publish a review PR and permitted preview when ready, then stop for my runtime merge/production approval. Do not begin VFX, bloom, blur or the next slice.
