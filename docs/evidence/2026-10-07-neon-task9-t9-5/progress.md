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


## First candidate CI and bounded fix — 2026-10-07 (America/Chicago)

First modified-source candidate `98a36b3698f48b1fa1b77fb2c59b902c464d68a7`, [CI 37712350695](https://github.com/Manaconda33/manacondas-minigame-mayhem/actions/runs/37712350695):

- Typecheck and lint steps **PASS** after fixing the initial ESLint issue; the separate `task9-full-course-render`, `task9-undercity-render`, `task9-skyline-render`, and spillway gates **PASS**.
- Undercity A/B passes the original **+20** maximum, measured +20 draw calls / +8,092 triangles. Whole capture peak 176 draw calls / 156,816 triangles, below engineering ceilings.
- Falls extension A/B fails the *unchanged* **+12** incremental-call gate with **+13**, although readiness parity passes, and whole capture peaks 151 calls / 145,706 triangles. This is a genuine render-cost regression from two individually batched deck fixture families, not the earlier asynchronous readiness drift. Do not raise the bound.
- Corrective engineering checkpoint: fuse the cap and cyan underside lamp (two colored geometries) into a single `falls-run-extension-deck-service-fixtures` instanced geometry family with one material and 16 instances. Visual cap/underside-light geometry remains present, attached to existing pylons and collision-free. The corresponding T9.5 tests inspect both colored geometry regions, exact pylon support and once-only resource disposal.
- This adjustment is **not yet validated** on the final head. CI of an earlier head is insufficient for completion, and passing the structural mask gate is not an owner visual/playability approval.


## Final exact-runtime automated checkpoint (green)

- **Final frozen runtime:** `a25c4b1788f4930b4e416777c8100284ff3c65a7`
- **GitHub Actions validation:** [37712902704](https://github.com/Manaconda33/manacondas-minigame-mayhem/actions/runs/37712902704), all seven jobs including `validate` and the six rendering gates **SUCCESS**.
- **Vitest/V8:** 130 passed files, **1,033 passed tests**, full V8 report.
- **Build/quality:** Node 22, typecheck PASS, zero-warning lint PASS, production build PASS, Git LFS accepted.
- **Falls extension:** **+12 draw calls / +8,626 triangles** versus unchanged +12-call A/B bound; max 148 calls/133,694 triangles. Stabilized forward/reverse hidden/visible readiness counters without changing budget.
- **Undercity:** earlier modified candidate passed unchanged +20-call A/B cap (+8,092 triangles), maximum 176/156,816; final source all associated render jobs passed.
- **Full-course:** fifteen rendered cameras across Skyline/Undercity/Falls plus three shortcut tells, chase/rear and mobile portrait/landscape; eight racers each, canonical Medium 1920x1080, **177 maximum draw calls and 148,316 maximum visible triangles** (Task 9 200/300k ceiling), 300 scored software-rendered frames; no HTTP, console or page errors.
- **Software FPS:** median **1.62 FPS**, p95 **625.5ms** in CI SwiftShader; diagnostic only, NOT representative device performance. Do not cite this as PRD 60 FPS acceptance, reserved for T9.6.
- **Visual inspect:** downloaded and inspected both full-course screenshot artifact and corrected Falls render artifact. No obvious new unsupported standalone fixtures in the sampled screenshots; the known low-detail Skyline tower silhouettes remain documented for T9.7. Screenshots do NOT establish owner visual/playability signoff.
- **Publication PR:** workflow-only [#277](https://github.com/Manaconda33/manacondas-minigame-mayhem/pull/277) pinned this exact runtime SHA, all PR CI including historic preview guards PASSED [37713559260](https://github.com/Manaconda33/manacondas-minigame-mayhem/actions/runs/37713559260), and PR #277 merged at main `8537e018f09f4524f5de105c4bc5780af01bed8c`.
- **Pending:** main GitHub Pages deployment and exact live hash verification of `/previews/neon-grid-t9-5/`, then Manny's visual/playability review. Main workflow merge alone does not prove the URL is live. Runtime PR #242 stays **draft/unmerged**. T9.6 and production gameplay remain off-limits.

