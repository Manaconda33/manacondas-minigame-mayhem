# Neon Grid Stage 4 Task 9 — T9.4 Falls Run Extension checkpoint

Date: 2026-10-07 America/Chicago
Status: **T9.4 implemented; automated validation passed; owner visual/playability review pending**.

## Authority and exact sources

- Approved Task 9 plan: `docs/design/neon-grid/task9-coursewide-visual-plan.md`; owner specifically approved T9.4 implementation.
- Branch: `design/neon-grid-circuit-02` on draft/open runtime PR #242; main Neon Grid gameplay remains unchanged.
- Exact verified runtime/CI scheduling source: `be47a3d7215867b9b275473fd2640cc626ef5e37`.
- Failed predecessor: `fe24e39fc16a7ce8a6ca7991b705776d2f675871`, CI `37705637228`.
- Passing hosted CI: https://github.com/Manaconda33/manacondas-minigame-mayhem/actions/runs/37708118256
- Isolated publication branch `preview/neon-grid-t9-4-pages`, PR #276, pinned exactly to `be47a3`; staging CI `37708449954` successful. Separate main Pages deployment/hash audit must be verified before claiming the preview is live.

## T9.4 presentation implementation

- New `FallsRunExtensionVisual` owns only disjoint course portions [0.46154128347522666, 0.7 - 1/1536] and [0.85 + 1/1536, 1.0]; one native ribbon row excludes each boundary. Accepted Task 8 `FallsRunVisual` range 0.70–0.85 and all eleven Medium instance baselines remain protected by tests.
- Native main-ribbon-aligned road geometry and cyan edge strips, depth-safe wet-look overlay; no new road collision or changes to routes, physics, items, AI, checkpoints, shortcut tells, controls, global camera or far policy.
- Bounded, supported structure: 16 pylons plus 16 footings; 16 stepped city towers with foundations; windows 80 Low/160 Medium/240 High; 14 lower-contrast ambient waterfalls with no gold tell contamination; mist 0 Low/14 Medium/28 High. Low omits the wet overlay. One presentation-owned lifecycle with idempotent cleanup and hidden-time freeze.

## Validation evidence

- On exact `be47a3`: Git LFS/runtime asset checks, TypeScript typecheck, ESLint zero-warning lint, **129/129 test files, 1027/1027 tests passed** including V8 coverage, production build and all five rendering gates passed.
- Original CI had **five 5s timeouts**, four race-diagnostics and one Billboard portal geometry under parallel JSdom integration worker contention. No test assertions failed. Resolution: CI test runner `npm run test:ci -- --maxWorkers=1` to remove shared-runner worker contention. All original per-test timeouts, every test and assertions, and coverage remain unchanged; full rerun passed.
- T9.4 rendered gate artifact: `11520198275`, twelve eight-racer screenshot cases, zero recorded page/render error gate failures. Canonical Medium eight-racer 1920×1080 **142 calls / 79,854 triangles visible**, **131 / 71,612 hidden**, delta **+11 calls / +8,242 triangles** (allowance +12). Full view/quality peak **145 calls / 133,998 triangles** (engineering ≤200/300k; PRD ≤250/750k). Independently passing prior gates: Task 8 `11519939341`, waterfall spillway `11520806444`, Skyline `11520781860`, Undercity `11520707386`.
- SwiftShader software-only timing: median ~2.10 FPS, p95 ~484 ms. Diagnostic only, **NOT** representative hardware 60 FPS/p95 ≤18.3ms approval. Hardware remains T9.6.
- Preview branch run `37708449954`: production build, pinned preview packaging, exact source checks successful, pending workflow-only PR #276 merge and main Pages hash/deploy confirmation.

## Unfinished / deferred / approvals

- Manny must review the exact published T9.4 gameplay in desktop/mobile and provide visual/playability PASS or corrections. No inferred owner approval.
- T9.2 Skyline rectangular mass and absent city-base/floating-city presentation issues are explicitly deferred for mandatory T9.7 closure; do not implement during T9.4.
- Later T9.5 lifecycle/masking, T9.6 representative performance, T9.7 full-course polish and T9.8 completion have **not** been started by this checkpoint.
- **STOP for owner.** Do not merge runtime PR #242, deploy Neon Grid gameplay to production, or start T9.5.

## PRD deviations

None. CI worker scheduling change is verification infrastructure only and retains all tests and timeout bounds. No material gameplay or visual-scope changes approved or made.
