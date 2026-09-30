# Execution ledger
Plan: docs/superpowers/plans/2026-09-30-full-race-diagnostics-medium-baseline.md
Base: b18d8dda2c97812b310dc321498609ee1f5a0436. Main CI/Pages 36784593002 passed.
Pre-flight: Task 1 schema/meter → Task 2 race/UI → Task 3 exported evidence; no interface conflict.
Baseline: clean npm ci; 81 files / 642 tests passed.
Task 1: complete. Missing-module RED observed; focused GREEN 2 files / 8 tests, typecheck/lint passed. Evidence: task1-red.txt, task1-green.txt.
Ruling: plan says native execution and no delegation; perform a separate self-review at completion. Cost: review lacks independent author perspective.
Task 1 verification correction: initial lint failed on four test callback styles. Fixed via ESLint; final full validation below supersedes that failed lint. No failed lint was used to publish a completed runtime milestone.
Task 2: complete. Real RAF tests and app tests RED→GREEN; corrected initial matchMedia fixture and reran UI RED against baseline. Focused 8 files / 36 tests passed. Full npm run validate PASS: 85 files / 662 tests, strict typecheck, zero-warning lint, exact asset/branding gates and production build; git lfs fsck and git diff --check passed.
Task 2 additional regression: delayed creation after shell dispose RED→GREEN; old race now disposed before start. No simulation, camera, HUD fields, audio behavior, asset bytes, item meter or quality changes.
Final review: self-review (plan explicitly requires native execution/no delegation). Final keyboard provenance finding fixed RED→GREEN including release of previously held drive keys; focused 7 panel tests passed. Full validation PASS: 85 files / 663 tests, 86.62% statement coverage, asset gates and production build. See validation.txt for exact final coverage. git lfs fsck and git diff --check passed. No deferred minor. Identified-desktop Medium hardware capture remains pending; no source/JSDOM substitute.
Ruling: separate diagnostic panel module owns DOM/listener cleanup and preserves the app callback/export contract. Cost if wrong: consolidate one module.
Review PR: https://github.com/Manaconda33/manacondas-minigame-mayhem/pull/212. Publication uses GitHub connector text commits; original approved asset bytes are unchanged. Compiled private snapshot remains supplementary to canonical GitHub.
Task 3: methodology, explicit pending baseline index, owner-private permitted review and CI evidence complete. Runtime CI 36786989565 PASS; private deployment appgdep_6abd911e64a481919913462fcdaa5e12 succeeded. Hardware baseline and rendered-runtime smoke remain blocked/pending; no capture is invented. Stop at PR #212 for owner runtime review/merge/production approval.

## Owner baseline substitution — 2026-09-30

Manny explicitly replaced the desktop Medium prerequisite with the supplied mobile result. Saved screenshot transcription and provenance/attachment limits in mobile-baseline.md; reconciled current status, methodology, testing, plan and publication metadata. Raw JSON is unverified. p95/triangles meet reference targets; 59.9 FPS is below the literal 60 target and 321 draw calls exceed 250. No automatic performance pass, runtime change, merge, deployment or later-slice work.
