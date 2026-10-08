# Neon Grid Stage 4 Task 9 T9.5 — lifecycle, masking and visual enhancement checkpoint

Date: 2026-10-07 America/Chicago
Current outcome: **IMPLEMENTATION IN PROGRESS / TEST AND OWNER PREVIEW PENDING**.

## Approval and authority

Manny approved the revised T9.5 plan: in addition to original full-course lifecycle, quality tiers, masking, chase/rear camera and mobile checks, bounded new visual improvements are explicitly authorized. The Task 9 plan was amended in `docs/design/neon-grid/task9-coursewide-visual-plan.md`; `docs/DECISIONS.md` records the durable owner approval. T9.2's Skyline elongated prism and city-base polish remain T9.7 work.

- Repository: `Manaconda33/manacondas-minigame-mayhem`
- Branch: `design/neon-grid-circuit-02`
- PR: #242 draft, unmerged; main production gameplay untouched
- Approved T9.4 runtime: `be47a3d7215867b9b275473fd2640cc626ef5e37`
- Approved T9.4 owner preview: https://manaconda33.github.io/manacondas-minigame-mayhem/previews/neon-grid-t9-4/?review=be47a3d

## Implemented on working branch (not yet acceptance-certified)

1. `src/game/track/UndercityVisual.ts`: one batched facade housing and one batched metal louver family, 16 and 48 instances. Each bank is attached to an existing warehouse face above the lower-level billboard mounts. No physics, independent props, texture assets or new shader passes.
2. `src/game/track/FallsRunExtensionVisual.ts`: 16 deck cross-caps and 16 cyan underside service lights positioned from the existing structural pylon matrices. Remains outside Task 8 accepted 0.70–0.85 owner; no gold dive-tell duplication or collider.
3. `tests/neon-grid-stage4-t9-5.test.ts`: six cases for full-course Low/Medium/High counts, wet-road compositor, anchored transforms, static mask/tell preservation, four-clock hidden-freeze, exact-once resource disposal and repeated scene lifecycle.
4. `tools/diagnostics/neon-grid-course.html`: non-gameplay `sector=course&progress=` fixture mode; includes Falls extension updates in full-course capture.
5. `tools/diagnostics/neon-grid-t9-5-render.mjs` and CI `task9-full-course-render`: fifteen eight-racer screenshots covering the three sectors, Billboard/Tunnel/Dive approaches, rear view and mobile landscape/portrait. Checks no HTTP/page/console errors, canonical Medium 1920x1080, >=300 scored SwiftShader frames and Task 9 engineering 200 calls/300k triangles with unchanged PRD 250/750k caps. SwiftShader FPS is explicitly not hardware performance certification.
6. `tools/diagnostics/neon-grid-falls-extension-render.mjs`: same-camera A/B explicitly warms visual owner; verifies reverse-order calls/triangles and renderer resource stability. The +12 T9.4 incremental draw-call ceiling is unchanged.

## Baseline anomaly resolution gate

- Original exact T9.4 runtime CI [37708118256](https://github.com/Manaconda33/manacondas-minigame-mayhem/actions/runs/37708118256): all 1027 tests and five rendering gates PASS, +11 calls/+8,242 triangles, 145 call / 133,998 triangle peak.
- Intermittent documentation-only head CI [37709741587](https://github.com/Manaconda33/manacondas-minigame-mayhem/actions/runs/37709741587): T9.4 A/B +15 calls/+28,062 triangles versus +12; varying 125/6 to 131/11 geometry/texture counters. Cause **not established**; asynchronous render readiness is one hypothesis.
- Unmodified-docs repeat [37710338681](https://github.com/Manaconda33/manacondas-minigame-mayhem/actions/runs/37710338681): PASS again, +11 calls/+8,242 triangles; 148 calls/144,690 triangle global peak. This confirms intermittent variation, not its root cause.
- Remaining gate: final modified-source CI pass with new resource stability assertions; do not reinterpret the intermittent failure as resolved solely because a rerun passed.

## Required validation and delivery (not yet claimed)

- Hosted exact-head typecheck, zero-warning ESLint, 100% existing tests plus six T9.5 cases with V8 coverage, production build, assets/LFS verification, Task 8, spillway, Skyline, Undercity, Falls Extension and full-course render jobs.
- Inspect generated before/after screenshots and render artifacts for clipping, floating details, visible camouflage, readable tell hierarchy, wet-road/2D-driver compositing and corridor clarity. Tests alone do not grant visual acceptance.
- Record measured incremental draw calls/triangles and any necessary bounded corrections. Do not expand global camera/far, cross-minigame render workload or pre-approved quality budgets.
- Publish exact-source pinned T9.5 review through a publication-only PR to main, verify live delivery hashes and unchanged production assets, then request Manny's visual/playability review.
- Do **not** merge #242, deploy Neon Grid gameplay to production, start T9.6 or pull T9.7 Skyline work forward.
