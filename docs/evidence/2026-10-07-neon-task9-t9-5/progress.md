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

## Owner rejection and T9.5 camouflage correction cycle

Manny reports the first T9.5 preview successfully deployed, but *the shortcuts are obvious and not camouflaged*. The 1,033-test green CI was only structural acceptance, **not owner visual acceptance**. Required: correct the masks and repeat visual review. Owner conditionally authorizes incremental Falls extension +15 calls if objectively needed; retained +12 in first correction candidate.

Root-cause review: prior fifteen screenshots focused on Billboard progress .22 vs actual entry .101–.106; Service Tunnel .355 vs .24655–.25155; Waterfall Dive .75 vs .792717. These frames therefore could not validate the disguised entrances.

Correction code on `design/neon-grid-circuit-02`: Skyline road-edge ad gantries with pre-approved existing sponsors, Undercity service bay/door family densified to 14 grounded portal-size false doors with solid backings, Falls extension non-gold ambient water count 14→24 clustered before/after the frozen 0.70–0.85 Task 8 sector. No physics or visual-tell modification, 2D art creation, or unapproved Task8 district changes. T9.5 test assertions enforce masks near entrances, batch counts, road clearance and frozen ranges. Render fixture expanded to 18 entrance-focused views. Await full validation and rendered owner preview. **No T9.6, #242 merge or production gameplay release.**

## Exact corrected runtime validation and new review pin (2026-10-07 America/Chicago)

- Gameplay source `e31605fa9618df21eaba384d75a056816c95432c` PASS in [CI 37720150312](https://github.com/Manaconda33/manacondas-minigame-mayhem/actions/runs/37720150312): all eight core jobs green, including typecheck/lint/Vitest/build, Task 8, spillway, Skyline, Undercity, Falls extension and 18-station full-course render; corrections for actual chase/rear/mobile entrance sampling and batched Undercity masks remain incorporated.
- Full-course render artifact `11526080697` includes 18 true-entry-focused screenshots and `t9-5-render-check.json`: **0 recorded errors, maximum 198 draw calls / 159,582 triangles**, eight racers, no raised budgets; worst draw calls rear Dive camera. Software-only FPS remains diagnostic, not hardware certification.
- Captured screenshots visually inspected for billboards, Service Tunnel and Waterfall Dive, including true mouths, rear and mobile views. Screenshot inspection does **not** establish successful at-speed concealment. Manny's earlier rejection remains effective until a tested corrected pinned URL earns fresh approval.
- [Publication-only PR #278](https://github.com/Manaconda33/manacondas-minigame-mayhem/pull/278) PASS in [CI 37721533210](https://github.com/Manaconda33/manacondas-minigame-mayhem/actions/runs/37721533210), merged at main `9c11872f3ccaebb1baab85dc329f523343ecf847`. Workflow adds unique immutable `/previews/neon-grid-t9-5-correction/` from `e31605fa9618df21eaba384d75a056816c95432c`, preserves earlier rejected `/previews/neon-grid-t9-5/` and every older pin, and makes no production runtime change.
- **Pending now:** main [Pages CI 37721977073](https://github.com/Manaconda33/manacondas-minigame-mayhem/actions/runs/37721977073), actual URL/hash verification, owner mobile/desktop driving approval. No #242 merge, production gameplay publication, T9.6 or T9.7.

## Corrected pinned preview deployed and hash verified (2026-10-07 America/Chicago)

- Owner URL: https://manaconda33.github.io/manacondas-minigame-mayhem/previews/neon-grid-t9-5-correction/?review=e31605f
- Publication PR #278 workflow-only to main `9c11872f3ccaebb1baab85dc329f523343ecf847`; old T9.5 preview preserved, runtime PR #242 remains draft, game unchanged.
- [Main GitHub Pages CI 37721977073](https://github.com/Manaconda33/manacondas-minigame-mayhem/actions/runs/37721977073) **SUCCESS**: main validate, corrected source preview assembly, production-preservation before release, deploy, *Verify live preview and unchanged production bytes*, verified-delivery artifact upload.
- Corrected source `e31605fa9618df21eaba384d75a056816c95432c` unchanged; 18 true-mouth screenshot capture and structural metrics remain from exact-runtime [CI 37720150312](https://github.com/Manaconda33/manacondas-minigame-mayhem/actions/runs/37720150312). **No gameplay performance hardware or owner visual acceptance inferred**.
- **STOP:** Manny to inspect at speed all three shortcut approaches/mouths and judge whether disguised enough with tells still fair, on mobile or desktop. Record actual owner finding before T9.6, T9.7 or PR #242 gameplay integration; no production release.

## 2026-10-08 owner-approved Undercity sightline follow-up: confirmed test-contract blocker

The latest existing source on `design/neon-grid-circuit-02` includes batched opaque Skyline and Undercity screens and an inner tunnel wing. Manny approved one bounded correction to finish the remaining Undercity failure; no product/gameplay changes or production publication were authorized. The previous failed render CI `37782131509` reported 200 calls/164,010 visible triangles and failed only `T9.5 Service Tunnel approach reveals shortcut interior from real ChaseCamera`. Two diagnostic-only commits `5be088c` (ray logging) and `fdd82d0` (ray clearance samples) preserved the original gate and made no runtime changes.

[Exact-head CI 37788405693](https://github.com/Manaconda33/manacondas-minigame-mayhem/actions/runs/37788405693) passed validate, Task 8 Falls Run, spillway, Skyline, Undercity, Falls extension and preview plan; full-course alone failed at the unchanged Tunnel LOS assertion. It captured 18 eight-racer stations, 300 software frames, no reported render errors, peak **203 calls** (200 optimization target/220 blocking ceiling) and **188,366 visible triangles** (300k ceiling). Output records the actual `ChaseCamera` at main-route progress `0.242`, world location `[152.0828,4.6333,18.6236]`. The four in-frustum tunnel fractions are `0.01, 0.03, 0.06, 0.09`; **0/4 intersect the scenery-only sightline screen**.

- Fraction 0.01 target `[140.4119,0.6620,18.2762]` has main-road edge margin **-4.52m**, within the legal main lane; all five sampled camera-to-target ray points are within the main lane or the tunnel lane.
- Fraction 0.03 target `[141.1810,0.6618,19.8827]` has main-road edge margin **-3.00m**, also main-road apron.
- Fraction 0.06 target `[142.3348,0.6614,22.2925]` has main-road edge margin **-0.75m**, still on the legal main roadway.
- Fraction 0.09 target `[143.4884,0.6415,24.7021]` is outside the main road at its endpoint (+1.43m) but *inside the tunnel road* (tunnel lateral margin -3.20m); along the ray, the intermediate +0.68m point outside main is already within the tunnel roadway (tunnel margin -2.16m).

The guard requires >=3 projected rays and >=2 blocked. Under this camera/target selection, achieving the blocking count with an opaque scenery panel would obscure a shared legal entrance or shortcut lane. This is a **test target-classification problem**, not evidence that it is safe to place more walls. Camera screenshots alone do not constitute product-owner visual approval. No acceptance thresholds were relaxed or removed; no new geometry, gameplay or production changes were made in this follow-up. **Approval request:** replace the conflated 'open mouth + hidden interior' test with non-weakening, directly relevant evidence: explicitly exclude drivable shared-apron points from *interior* occlusion scoring, test deep shortcut targets over real normal-route chase-camera approach stations and mobile orientations, fail on any exposed in-frustum true interior target, and separately assert open/legible entrance and reverse/forward traversal. Owner decision required before test acceptance amendment and publishing the new immutable preview. Historical pins remain unchanged.


## 2026-10-08 approved LOS test repair, CI and isolated owner delivery — FINAL AUTOMATED CHECKPOINT

Manny approved excluding the *shared drivable entrance* from hidden-interior camouflage scoring, replacing the previous falsely failing camera-ray count with strict deep-interior occlusion evidence. The implementation is scoped to `tools/diagnostics/neon-grid-course.html`, `tools/diagnostics/neon-grid-t9-5-render.mjs` and governance documentation. No `src/` gameplay geometry or asset changes. Early diagnostic `fdd82d0` proved the four old tunnel targets at fractions .01/.03/.06/.09 were reachable through legal driving space. Subsequent `f218638`, `a1513b5`, then final strict `d54a70aefb90bac3051ac28bc02c663431edfb91` classified the mouth separately, sampled 22 frames including 5 actual chase approach stations, and required >=1 interior target in-view at key desktop/landscape stations while failing if any true interior remained uncovered.

**Exact-hosted source CI**: https://github.com/Manaconda33/manacondas-minigame-mayhem/actions/runs/37808328715 — SUCCESS, 130 files / 1035 passed tests (coverage), typecheck, zero-warning lint, asset gates and production build, Task 8 Falls Run, spillway, Skyline, Undercity, Falls extension, T9.5 full course. T9.5 actual eight-racer 22-frame renderer measured **201 draw calls** versus 200 optimization target/220 blocker, **160,524 visible triangles** versus 300,000 engineering bound; software-only 300 scored frames and no captured render errors. Real ChaseCamera ray outcomes: `undercity-pre-approach` 3/3 interior targets occluded and 5 legal mouth targets in view; `undercity-approach-chase` 1/1 occluded, 5 mouth visible; mobile landscape approach 1/1 occluded, 5 mouth visible; at main entry 0 deep targets within FOV, 4 mouth visible; mobile portrait approach 0 deep within FOV, 2 mouth visible. These last zero-view sites are explicitly not claimed as positive interior ray occlusion proof. Other structural lateral occlusion unit tests remain mandatory.

**Independent publication**: workflow-only PR https://github.com/Manaconda33/manacondas-minigame-mayhem/pull/279 at `b3031b4` was green on [PR CI 37808483531](https://github.com/Manaconda33/manacondas-minigame-mayhem/actions/runs/37808483531), merged main at `6275936b6c79bdc957a0c146abe87bfc9d768a42`. [Postmerge CI/Pages run 37809716659](https://github.com/Manaconda33/manacondas-minigame-mayhem/actions/runs/37809716659) SUCCESS, including exact source pin/build, historic pin preservation, assembled production hash comparisons, GitHub Pages deployment, `Verify live preview and unchanged production bytes`, and verified delivery evidence artifact.

**New owner-only URL:** https://manaconda33.github.io/manacondas-minigame-mayhem/previews/neon-grid-t9-5-sightline/?review=d54a70a . This is neither PR #242 merge nor production Neon Grid gameplay publication. Manny still must review real driving: Billboard approach and interior camouflage, UnderCity continuous facade and magenta tell at genuine turn-in, visible world geometry support, any clipping or visual obstructions, mobile portrait/landscape readability, bidirectional tunnel traversal and Waterfall unaffected. Do not declare T9.5 accepted before owner explicit PASS. Do not start T9.6/T9.7. Prior owner-rejected T9.5 and T9.5-correction previews retained. Only runtime source checkpoint `d54a70a` is exact CI validated; following documentation commits preserve that source unchanged.



## Owner follow-up 2026-10-08: camouflage accepted in principle, traversal corrections authorized

Owner gameplay screenshots: T9.5 exterior disguise works, but independent Skyline sponsor stands appear behind the new wall rather than architecturally attached. Service Tunnel image sequence shows visual entrance blockage, apparent road clipping, opaque meshes crossing the player camera and disappearing kart. Correct the geometry and both-way approach-camera envelope before soliciting final owner approval. Preserve prior exterior deep-road LOS gate. Proposed translucent DO NOT ENTER art is not integrated without separate art signoff. Code and test change is an unverified candidate pending exact-head CI and human preview; no claim of successful correction or new publication here.


## 2026-10-08 owner hologram-art approval

Manny expressly approved the standalone reviewed DO NOT ENTER sign for both ends of the Service Tunnel. Source 1024×512 transparent PNG SHA-256 `11e540547d0a60da9db2ae7636e373742dec11c9f440afe08c5e29bdddaa7db4`. This approves the graphic and intended non-colliding fade-in-traffic treatment only. At this checkpoint the binary is not yet preserved in the repository and no runtime sign implementation, final CI or in-game acceptance is claimed. Maintain the fixed 200 target / 220 full-course blocker / 300k visible triangles and all prior sector limits. 
