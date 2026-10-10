## T9.7 comprehensive city-environment correction — owner-approved gate, 2026-10-09

This gate supersedes the earlier narrow city-ground verification record below. The acceptance target is no unexplained brown voids, unfinished ground, floating buildings, obscured approved billboards, or malformed Billboard Gap geometry in any owner-reported or course-wide view.

- Trace each reported background failure to missing terrain, the exposed horizon shader, insufficient city massing, or an actual geometry cutout. Validate the generated rendered meshes, shortcut corridors, curved rows, footing support, and all sector seams.
- Sweep the complete course in the real chase and rear cameras, no more than 8 m between samples. Capture the nine approximate owner anchors at race times 0:35.55, 0:48.33, 1:07.30, 1:22.32, 1:38.50, 1:51.97, 2:12.02, 2:31.15, and 2:43.15. Store camera, viewport, progress mapping, draw-call and triangle values with the screenshots.
- Inspect desktop and mobile portrait/landscape captures, including chase and rear cameras, and compare Low/Medium/High quality in Skyline, Undercity, Falls Run, and the Falls extension. Mobile viewport screenshots are visual simulations and do not establish device performance.
- Recheck start-billboard panels against opaque wall depth and the earlier accepted runtime. Check the Billboard Gap opening against the measured junction geometry; retain approved artwork and bidirectional shortcut/gameplay behavior.
- Retain the current **500-call** limit, **425,000-triangle Task 9 ceiling**, **750,000-triangle PRD hard cap**, and approved sector budgets. Optimize existing presentation geometry first; report measured visual alternatives if the triangle ceiling still limits completeness.
- Run the repository CI sequence (`npm run typecheck && npm run lint && npm run test:ci -- --maxWorkers=1 && npm run build`), `node --test tools/diagnostics/t9-6-certify.node-check.mjs`, the T9.5/Task 9 full-course render gates, and `git diff --check`. The single-worker test flag matches `.github/workflows/ci.yml`; the default local `npm run validate` invokes the test suite without that flag and may time out under parallel load. Review stored visual evidence before creating a new immutable, source-pinned preview. G-05 hardware requirements remain a separate certification gate.

**Current structural sweep:** 182 positions, maximum spacing 7.97 m, both desktop chase and rear, zero browser/render errors, peak 494 calls / 417,943 triangles. These local Chromium/SwiftShader numbers are structural evidence only. The owner must review and explicitly accept the new pinned preview; do not merge runtime PR #285 or #242, publish gameplay, or advance to T9.8 before that acceptance.

## T9.5 2026-10-08 second mobile screenshot rejection: future validation contract

The green `64492df` / 37818513159 cannot prove **visible Billboard ads** or **correct wall-anchored warning placement**: Manny's mobile portrait screenshots demonstrate absent Billboard lead-up artwork, offset/floating `DO NOT ENTER` signs (one reverse-readable), and opaque black wall still obscuring the legal Service Tunnel entry. **These are required regressions to capture in tests before claiming another preview.** Plan: `docs/design/neon-grid/t9-5-portal-and-signage-owner-correction-plan-2026-10-08.md`. Add actual-material/screen-space approach checks (including occlusion, not mesh count alone), portal placement derived from `ServiceTunnel.wallRange`/junction geometry rather than fixed internal spline fractions, attached supports, facing/readability in both directions, camera-to-kart and kart-road unobstructed, no clipping; retain separate non-vacuous deep-shortcut occlusion checks and all prior full 28+ desktop/mobile captures. Capture/inspect real owner mobile portrait repro viewpoints and two approaches + tunnel reversal. Existing 200 target / 220 blocking full-course calls, 300k triangles, and separate area caps unchanged. Do not label the plan as a passing test; execute checks during the next bounded implementation session.

## T9.5 portal-warning release verification and owner gate — 2026-10-08

Exact source `64492dfbca7c4a5633880637ddbc5bcc05c34fde` passed full GitHub Actions CI `37818513159` (typecheck, lint, all unit tests, production build, sector render gates, 28 full-course screenshot captures including mobile and both tunnel directions, 300 scored SwiftShader frames). Full-course peak: 206 calls versus 200 optimization goal and 220 blocking ceiling; 168,790 visible triangles versus 300k engineering maximum. The warning master and runtime copy have identical SHA-256 `11e540547d0a60da9db2ae7636e373742dec11c9f440afe08c5e29bdddaa7db4`. Workflow-only PR #280 passed its PR CI, merged at `26f3930`; main CI/Pages `37820169477` passed on deployed output including SHA-256 of the approved warning image, byte-identical original production delivery and correct `review-build.json` source. Owner preview: https://manaconda33.github.io/manacondas-minigame-mayhem/previews/neon-grid-t9-5-portals/?review=64492df . **Remaining manual gate:** test Skyline billboard wall-mounted/elevated placements; concealed Billboard and Service Tunnel interior from normal route; deliberately enter/exit both ends of the Tunnel; see readable warning signs before entering but no visual/kart/camera clipping during traversal; especially test mobile landscape and portrait deep interior and upper-driver/roof visibility; check Waterfall unaffected. Automated screenshots suggest tight mobile ceiling framing, not a certified real-device failure. Manny's explicit in-game approval is required before closing T9.5; no T9.6/T9.7 or gameplay production merge.

## T9.5 exact warning PNG and two portal runtime checks (2026-10-08)

Owner-approved PNG uses fixed paths `docs/design/neon-grid/assets/task9/billboards/service-tunnel-do-not-enter-v1-source.png` and `public/assets/track/neon-grid/signage/service-tunnel-do-not-enter-v1.png`. Run `node tools/verify-task9-tunnel-warning-asset.mjs` (also imported by the normal production asset verifier) to require matching exact SHA-256 `11e540547d0a60da9db2ae7636e373742dec11c9f440afe08c5e29bdddaa7db4`, PNG signature and 1024×512 RGBA IHDR. Unit tests assert two supported non-colliding mesh instances, genuine legal portal positions, 5.85 m width under 6.4 m tunnel clearance, depth-test on/depth-write off and faded zero alpha at the kart's portal crossing; distant warnings return to 0.63 alpha independently. Keep pre-existing camouflage forward/reverse/camera and rendered desktop/mobile gates. Visual owner review must confirm the actual approved artwork loads at both portals, is not accidentally mirrored, remains discreet on the ordinary road, and does not obscure the racer/camera at speed. Do not infer end-to-end gameplay approval from tests.

## Service Tunnel DO NOT ENTER asset integration acceptance (2026-10-08)

Owner approved the specific transparent 1024×512 image with SHA-256 11e540547d0a60da9db2ae7636e373742dec11c9f440afe08c5e29bdddaa7db4 for both forward/reverse portals. Before integrating, preserve original source/art authority and verify the exact runtime derivative's resolution, alpha, hash and provenance. Tests must verify two signs at legal corridor mouths; no Rapier collision or shortcut ownership change; material transparent/depthTest=true/depthWrite=false; asset load and fallback/disposal; fade when the actual player/camera is close enough to cross; clocks freeze when hidden/paused; no geometry occluding kart/camera; both directions physically traversable; pre-existing deep-interior main-route sightline camouflage, mobile views, and prior render limits remain. Only after passing exact-head tests and owner at-speed preview may T9.5 be closed. Artwork approval alone cannot satisfy that gate.

## T9.5 reverse-tunnel clearance and true-interior camera gate (2026-10-08)

First correction run 37814301722 demonstrated an actual reverse-travel ray obstruction at tunnel fraction .22. Do not weaken or remove the regression. Roadside facade modules must omit sections overlapping the underground camera/road volume in both horizontal and vertical dimensions. Full-course render now directly stages player and actual ChaseCamera on tunnel at fractions .08/.38/.66/.94 and mobile .4/.5, clamps camera to real headroom, and raycasts camera-to-kart against both presentation screens and service-tunnel roof/walls. Require zero hit. Keep all prior actual-main-approach deep-interior LOS tests, separate Billboard static faces (8) from raised posts (4) and direct facade mounts (4), and preserve original full-course 200 target/220 blocker and all sector budgets.

## T9.5 owner-follow-up camera and drivable-clearance regression — 2026-10-08

The previously green real chase-camera camouflage check is necessary but insufficient: owner screenshots demonstrate that presentation-only screens may clip the inside roadway and cover the kart/camera after entering the tunnel. Add forward AND reverse genuine Service Tunnel corridor ray checks against the actual batched sightline-screen mesh from entrance through interior to rejoin, including kart center and road-ahead targets. Test the real opening geometry and existing mouth/interior exterior-ray checks, Low/Medium/High lifecycle, previously accepted Sector 3 draw deltas and full 22-station renderer. In visual artifacts inspect normal-road camouflage and BOTH tunnel portal transitions, inside-kart/chase framing, mobile portrait/landscape/rear, and wall-mounted versus post-raised sponsor ads. Do not mistake scenery-only/no collider for camera transparency. A new DO NOT ENTER sign's artwork must receive separate owner approval before runtime placement; do not grant T9.5 completion on green CI alone.

**T9.5 corrected open-mouth versus hidden-interior validation — VERIFIED (2026-10-08):** Owner-authorized corrected test ran on source `d54a70a`, [CI 37808328715](https://github.com/Manaconda33/manacondas-minigame-mayhem/actions/runs/37808328715) PASS including 130 files / 1035 tests, typecheck, zero-warning lint, build and all rendering gates. The 22-frame, eight-racer, >=300 software-frame T9.5 render captured 201 calls (target 200, blocker 220), 160,524 visible triangles (<300k), no captured errors. True in-frustum interior samples were opaque-screen-occluded 3/3 desktop pre-approach, 1/1 desktop approach and 1/1 mobile-landscape approach; the mobile portrait and mouth views had no genuine interior in camera frustum, but separately verified open-mouth visibility. A mandatory non-vacuous positive-in-view condition prevents those empty interior projections from masquerading as occlusion coverage. Existing lateral structural screen raycasts and entrance-open, native gameplay and sector render tests all retained. PR #279 CI `37808483531`, publication main Pages `37809716659` passed; main production bytes and historical previews preserved. Source pin `d54a70a` is live only at `/previews/neon-grid-t9-5-sightline/`; no owner at-speed pass, hardware FPS validation, T9.6 or production release inferred. **Manual owner test remains required** for both Billboard and Tunnel hiding, mobile and desktop tells, clipping/road contact and bidirectional access.

**T9.5 shared-mouth sightline interpretation: approved 2026-10-08.** The previous `undercity-entry` fixed two-blocker criterion was invalid: the sampled targets were the physically shared roadway entrance. Owner-approved corrected renderer samples tunnel fractions 0.01–0.92 and classifies any target still on the main lane or physical shared junction as mouth/apron, preserving visibility and access. All genuine **interior** in-frustum targets must be behind the opaque screen, with **zero** exposed tolerated, sampled at earlier desktop chase approaches plus landscape and portrait mobile chase cameras. Assert interior targets genuinely evaluated and entrance mouth visibly discoverable (>=2 in-frustum mouth targets at the true entry approach); preserve tests that physically raycast road-edge screens, leave actual entrances unscreened, and preserve screenshot inspection, forward/reverse traversability, tests/build/render thresholds and owner at-speed review. This is not a blanket "allow 0 occluded" waiver. If no interior targets project into an approach frame, record their out-of-view status rather than claiming occlusion, while structural screen-ray tests still apply. New immutable preview remains owner-gated.

**T9.5 Service Tunnel LOS validation blocker (2026-10-08):** Existing renderer requires >=3 in-frustum targets and >=2 blocked by the screen mesh at main progress 0.242. [CI 37788405693](https://github.com/Manaconda33/manacondas-minigame-mayhem/actions/runs/37788405693) traced four targets at tunnel fractions 0.01/0.03/0.06/0.09. World/main/tunnel clearance samples prove the first three lie on the legal main-road apron and the fourth sight ray never crosses a space outside both legal roadways. Keeping the route enterable prohibits placing an opaque blocker across two rays; **do not satisfy this check using a false wall, a collider, a test waiver, or a weaker numeric threshold**. Propose owner-authorized correction: explicitly classify the shared junction versus true downstream tunnel interior, sample real chase views over multiple earlier normal-route positions and mobile portrait/landscape, and fail if *any in-frustum true interior target* is exposed while asserting that entrance cues and bidirectional mouth clearance remain open. Retain all performance/structural gates and human at-speed review. No new preview or acceptance until scope is approved and exact-head CI passes.

**T9.5 owner-approved second camouflage correction (2026-10-08):** New opaque fascia screens and supported Undercity walls must interrupt rays from the ordinary player driving line toward outside shortcut corridors at multiple progress samples, while direct entry-mouth rays remain unblocked. Enforce opaque depth-writing geometry with finite grade-following corners and no gameplay colliders. Snapshot actual chase/rear/mobile approaches with the real camera; inspect screen continuity, blocked alternate asphalt, architectural support, mouth cue visibility, clipping, driver compositing and reverse traversal. Preserve all existing structural and legacy render assertions. **Full-course CI blocking maximum 220 draw calls; 200 optimization target** with explicit excess reported; full-course 300,000 triangles, PRD 250/750k and separate sector/A-B (including Falls +12) bounds unchanged. Previous T9.5 corrected pin is owner-rejected. Fresh exact-head CI, GitHub Pages source/hash checks, then Manny owner at-speed approval required before advancing.

**Corrected T9.5 preview delivered, pending owner review (2026-10-07):** [Live correction review](https://manaconda33.github.io/manacondas-minigame-mayhem/previews/neon-grid-t9-5-correction/?review=e31605f) is pinned to `e31605fa9618df21eaba384d75a056816c95432c` and verified by [main Pages CI 37721977073](https://github.com/Manaconda33/manacondas-minigame-mayhem/actions/runs/37721977073): deploy, live source and SHA-256 checks, historic preview preservation, and unchanged production bytes all PASS. Main workflow-only commit `9c11872f3ccaebb1baab85dc329f523343ecf847`. Automated screenshot examination covers actual Billboard 0.101–0.106, Tunnel 0.24655–0.25155, Dive 0.792717, chase/rear/mobile; eight racers, 18 images, 198 peak calls / 159,582 triangles and 0 render errors. Owner still must actually drive the three entries for camouflage, tells, clipping and playability. Do not record owner acceptance, T9.6 authorization, runtime PR merge or production release until expressly approved.

**T9.5 exact corrected source gate (2026-10-07):** `e31605fa9618df21eaba384d75a056816c95432c` green [CI 37720150312](https://github.com/Manaconda33/manacondas-minigame-mayhem/actions/runs/37720150312), including 18 true-entry eight-racer screenshot stations, all active rendering gates and full validate. `t9-5-render-check.json`: zero page/render errors; maximum 198 draw calls / 159,582 visible triangles (rear Waterfall Dive peak calls), within original 200 / 300,000 engineering ceilings. Source/artifact screenshots inspected for the three true mouths, mobile and rear views; static captures are not an at-speed owner approval. New independent review pin `/previews/neon-grid-t9-5-correction/` is publication-only PR #278, green CI 37721533210 and main merge `9c11872`; final Pages deployed hash/byte evidence and Manny visual/playability review are still pending. Preserve earlier rejected `/previews/neon-grid-t9-5/` as historical review evidence. Neither the original +12 Falls budget nor 250 / 750k PRD caps changed.

**T9.5 owner-requested camouflage correction gate (2026-10-07):** Prior T9.5 owner visual review is NOT approved despite CI success. Require direct normal chase-camera at-speed visual/playability acceptance for all **true entry mouths**: Billboard main progress 0.101–0.106, Service Tunnel 0.246549–0.251549, Waterfall Dive 0.792717. The old 15-station fixture missed those actual locations; the corrected 18-station fixture samples approach, mouth, rear and mobile while maintaining 8 racers, 1920×1080 Medium sample, >=300 scored frames, same global engineering 200 calls/300k triangles and all prior gates. Verify extra masks use pre-approved sponsor assets without copied ON/OFF flicker, have plausible supports, clear main and shortcut roads and maintain unique Paprika flicker, magenta tunnel/drip cue and gold Dive tells. Added non-gold falls must be strictly outside frozen Task 8 0.70–0.85. Keep Falls extension +12 incremental call gate unless evidence makes owner's contingent +15 allowance necessary, in which case record exact deviation in PRD/DECISIONS before increasing threshold. CI is not a substitute for owner camouflage acceptance.

**T9.5 corrective A/B case:** First candidate render run 37712350695 showed the Falls extension at +13 calls, exceeding +12 even though reverse-order renderer readiness was stable. Keep the original +12 blocker. The two service cap and cyan lamp materials/meshes have been consolidated into one instanced, vertex-colored geometry family. The T9.5 tests assert the two material color regions in merged geometry, the pylon attachment and exact-once disposal; the unchanged Falls extension render gate must still pass on the final source. Undercity A/B measured exactly its existing +20 cap; monitor it but do not increase the allowance.

## Neon Grid Stage 4 Task 9 T9.5 — full-course lifecycle, masking and visual enhancements (2026-10-07)

**Governing approval:** Manny approved the revised T9.5 plan to permit bounded presentation-only improvements. Do not advance to T9.6 before T9.5 automated/visual owner review.

- Targeted lifecycle and masking assertions: `npx vitest run tests/neon-grid-stage4-t9-5.test.ts tests/neon-grid-stage4-task9.test.ts tests/neon-grid-stage4-task9-skyline.test.ts tests/neon-grid-stage4-t9-2-corrections.test.ts`.
- Full acceptance checks: `npm run validate` (strict typecheck, zero-warning lint, V8-coverage Vitest, production build), `git diff --check`, `git lfs fsck`, approved runtime asset hash validations.
- Hosted gate `task9-full-course-render`: `tools/diagnostics/neon-grid-t9-5-render.mjs` uses the real Neon Grid eight-racer scene at 34 stations and desktop chase/rear, landscape and portrait views. Canonical Undercity Medium drawing buffer 1920x1080, >=300 scored software-rendered frames, no console/page/shader/HTTP errors; max <=500 calls/425,000 visible triangles (engineering) and <=500 calls/750,000 triangles (PRD). The fixture pins the seven highest-triangle AI kart models and waits for all GLTF replacements before measuring. Inspect captured actual PNGs rather than inferring owner acceptance from structural counters.
- T9.4 A/B readiness hardening: warm up the visible owner before the hidden/visible comparison; require reverse-order hidden/visible call/triangle stability plus no resource-counter drift, while preserving the original +12 call limit. The prior documentation-only run's +15 anomaly is not erased; post-change exact-source green validation is necessary.
- New procedural detailing: verify 16 supported Undercity vent banks/48 attached louvers and 16 Falls deck caps/16 attached cyan downlights, all finite, owned and disposed exactly once; no added physics collision or shortcut tell changes. All quality-tier wet-road and mist bypass contracts remain mandatory.
- Presentation/owner gate: inspect shortcut camouflage versus tell readability at speed, wet-road/driver compositing, sector seams, grounded architecture, mobile road edges, rear-view clipping and repeat-create/dispose. No T9.5 visual approval until a hash-verified pinned preview is reviewed by Manny. Representative-device 60 FPS / p95 <=18.3 ms remains T9.6, not the software-rendered CI result.

Evidence: `docs/evidence/2026-10-07-neon-task9-t9-5/progress.md`. Existing Task 8 and T9.2–T9.4 gates remain mandatory; do not increase their limits as part of this task.

## T9.4 owner acceptance and later render-gate discrepancy — 2026-10-07 America/Chicago

Manny explicitly **approved** the exact pinned [T9.4 Falls Run Extension preview](https://manaconda33.github.io/manacondas-minigame-mayhem/previews/neon-grid-t9-4/?review=be47a3d). The approval closes the **owner visual/playability** gate only. Exact runtime `be47a3d7215867b9b275473fd2640cc626ef5e37` and hosted full CI [37708118256](https://github.com/Manaconda33/manacondas-minigame-mayhem/actions/runs/37708118256) passed 129/129 files and 1027/1027 tests, lint, typecheck, production build and all five render gates. Main preview publication CI/Pages [37709158455](https://github.com/Manaconda33/manacondas-minigame-mayhem/actions/runs/37709158455) also passed live source/hash and unchanged production-byte checks.

A later **documentation-only** revision `64f5ed1` produced CI [37709741587](https://github.com/Manaconda33/manacondas-minigame-mayhem/actions/runs/37709741587) with a failure in the existing T9.4 render A/B delta assertion. The test observed 143 visible vs 128 hidden calls (**+15**, vs the unchanged allowed **+12**), 101,766 vs 73,704 triangles (**+28,062**), and a resource-count shift between captures from 125/6 to 131/11 geometries/textures. Aggregate view maxima (146 calls/133,998 triangles) remained below both Task 9 engineering ceilings. This is not a newly changed runtime feature in the docs-only commit. It is a **render measurement nondeterminism / asset-readiness concern requiring investigation**; a resource readiness race is only a hypothesis. Preserve all current assertions and budget limits; do not convert this fail into a pass by increasing +12 or excluding a scene. Record as open follow-up before relying on the next course-wide render validation. Owner acceptance is independent of this unresolved CI discrepancy.

T9.5 lifecycle/masking implementation, representative-device T9.6 and Skyline T9.7 work remain separately gated. Runtime PR #242 remains draft/unmerged and production gameplay unchanged.

## T9.4 exact pinned preview publication verification, 2026-10-07

Workflow-only [PR #276](https://github.com/Manaconda33/manacondas-minigame-mayhem/pull/276) merged at main `a8d003873e52207d523857ba17f9aff634fb1519` after pinned source `be47a3d7215867b9b275473fd2640cc626ef5e37` code CI `37708118256` and preview staging CI `37708449954` both passed. Post-merge [run 37709158455](https://github.com/Manaconda33/manacondas-minigame-mayhem/actions/runs/37709158455) passed main validate, assembly, Pages deployment, `Verify live preview and unchanged production bytes`, and upload of verification evidence. Published owner URL: https://manaconda33.github.io/manacondas-minigame-mayhem/previews/neon-grid-t9-4/?review=be47a3d . The exact source marker, review build, JS/CSS and required billboard assets are hashed; main game's bytes and prior previews are verified unchanged by the publication contract. Automated availability/byte checks **do not** establish Manny's subjective visual/playability approval. Stop and request owner review. The hardware performance gate is still T9.6; Skyline polish remains T9.7; no T9.5 authority or PR #242 merge.

## Neon Grid Stage 4 Task 9 T9.4 Falls Run extension — verified test/render procedure, 2026-10-07

**Exact runtime checkpoint:** `be47a3d7215867b9b275473fd2640cc626ef5e37`. **Full hosted [CI run 37708118256](https://github.com/Manaconda33/manacondas-minigame-mayhem/actions/runs/37708118256) SUCCESS:** 129 test files/1027 ordinary passing tests with V8 coverage enabled (589.49s), typecheck, zero-warning ESLint and production build. All five independent render gates pass on the same source: waterfall spillway, accepted Task 8 Falls Run, T9.2 Skyline, T9.3 Undercity, T9.4 Falls Extension. In particular `tests/neon-grid-stage4-task9.test.ts` freezes the accepted 0.70–0.85 visual/count baseline while asserting disjoint extension ownership, native road surfaces and edges, finite bounded instances, 14 falls, 80/160/240 windows, Low wet/mist bypass and 0/14/28 quality mist, pause/hidden animation freeze, owner idempotent disposal, and avatar-safe transparent compositing. These checks are ordinary passing assertions, not expected failures.

**Timeout remediation:** Original hosted [run 37705637228](https://github.com/Manaconda33/manacondas-minigame-mayhem/actions/runs/37705637228) failed five unchanged 5000ms integration tests across `race-diagnostics-routing` (four) and `neon-grid-billboard-relocation` (one) under parallel runner CPU contention, while render gates passed. The validated fix configures GitHub validate's existing `npm run test:ci -- --maxWorkers=1`. This retains all 1027 tests, per-test 5000ms bounds, V8 coverage, and assertions. No tests were skipped, retries introduced, timeouts extended, or product constraints weakened. The sequential run passed every test and the production build. Preserve this CI scheduling choice unless a separately verified alternative reliably clears unchanged test limits.

**Real eight-racer rendered gate:** twelve capture positions including desktop Low/Medium/High, Medium rear, mobile landscape Low/Medium/High, before/after the accepted Task 8 stretch and mobile portrait before/after. Canonical same-camera Medium 1920×1080 contribution +11 draw calls/+8,242 triangles (visible 142 calls/79,854 triangles; hidden 131/71,612). Full matrix maximum 145 calls/133,998 triangles. Both are below Task 9 200/300k engineering ceilings and PRD 250/750k. The exact T9.4 evidence artifact is `11520198275` from run `37708118256`. Software WebGL median ~2.10 FPS/p95 ~484ms is **diagnostic only, not representative-hardware PRD performance certification**, which remains T9.6. No owner drive or subjective visual verdict inferred. Workflow-only preview PR #276 staging [CI 37708449954](https://github.com/Manaconda33/manacondas-minigame-mayhem/actions/runs/37708449954) PASS pins `be47a3`; Pages deploy/hash verification and Manny review must follow before T9.4 visual acceptance.

Evidence: [T9.4 checkpoint](evidence/2026-10-07-neon-task9-t9-4/progress.md). Do not advance to T9.5 or merge runtime PR #242 without explicit owner authorization.

## Neon Grid Stage 4 Task 9 T9.3 corrected Undercity — owner acceptance, 2026-10-07

**OWNER APPROVED / T9.3 COMPLETE.** Manny reviewed and explicitly approved exact corrected runtime `42781fb5367a146473c49012e0442e953197e480` in the pinned [corrected T9.3 preview](https://manaconda33.github.io/manacondas-minigame-mayhem/previews/neon-grid-t9-3-correction/?review=42781fb). This approval supersedes the initial rejected `722d9db` presentation without erasing the four original owner findings or correction history. Owner acceptance covers the corrected T9.3 visuals/playability, **not** PR #242 merge, production Neon Grid gameplay, T9.4 implementation, or T9.7 Skyline polish.

- Implementation run [37703010562](https://github.com/Manaconda33/manacondas-minigame-mayhem/actions/runs/37703010562) **SUCCESS**: 129 files, 1022 passing tests, 2 intentional future T9.4 `it.fails`, typecheck, zero-warning lint, asset and LFS checks, production build, Task 8/Waterfall/Skyline/Undercity render gates.
- Workflow-only publication PR #275 **MERGED**; Pages [run 37703541469](https://github.com/Manaconda33/manacondas-minigame-mayhem/actions/runs/37703541469) **SUCCESS**, including successful `Record exact delivery hashes and verify production preservation before publication` and `Verify live preview and unchanged production bytes` steps. Existing previews preserved.
- Corrected render captures: 12 desktop, landscape, portrait, chase/rear and sector-sweep cases, zero rendering errors; canonical T9.3 A/B +18 draw calls/+7,324 triangles; maximum 161 calls/130,486 triangles, below Task 9 200/300k and PRD 250/750k. SwiftShader FPS/p95 remain diagnostic only, not representative-device certification.
- Next: propose T9.4 Falls Run Extension execution plan for explicit approval, preserving Task 8 progress 0.70–0.85, accepted Skyline/Undercity, Waterfall Dive and Service Tunnel gameplay, and the two T9.7-deferred Skyline polish items. See [T9.3 evidence](evidence/2026-10-07-neon-task9-t9-3/progress.md).

## Neon Grid Stage 4 Task 9 T9.3 owner correction pass — 2026-10-07

Owner-reported original T9.3 runtime `722d9db` is **NOT APPROVED**. Exact correction runtime `42781fb5367a146473c49012e0442e953197e480`; PR #242 remains draft/unmerged. The correction fixes four review categories without widening the original T9.3 visual-owner boundary:

- **Road intersections:** the magenta edge strips use sampled vertices from the accepted 1,536-row native road ribbon; each side skips the tunnel mouth. Stripe material preserves depth test, disables depth writes and uses negative polygon offset and opaque-safe draw order. Geometry/finite matrix tests cover the shift from coarse independent 72-segment chords.
- **Grounding and architecture:** 16 building foundations, 32 roof plant units, 32 facade ribs, 16 grounded loading-bay doors, 20 concrete utility pads, 10 backed service bays. All 26 pipes now attach vertically to facades from building base; all 24 work lights attach to real building facades. Original count and quality-scaled 80/160/240 windows remain bounded. No generated gameplay colliders.
- **Billboard preservation and presentation:** two placements each of unchanged owner-approved Nightshift Noodles and Voltline Industrial WebPs are set to 8.55 × 4.15 m within matching 8.95 × 4.55 m architectural mounts. Fixed sector targets replace arbitrary building indices. Static ad behavior, approved pixel bytes, tunnel signage masking, junction/tell and shortcut balance remain frozen. Asset signature/hash verification remains in the production build.
- **Lifecycle and invariants:** T9.3 extra test checks native road sampling, depth safety, finite supporting matrices, low-storey foundations, roof location, vertical pipe heights and actual board dimensions. Existing Task 8 Falls Run, Waterfall spillway, T9.2 Skyline and T9.3 original contract tests remain mandatory.

Validation of source `42781fb5367a146473c49012e0442e953197e480`: GitHub CI [37703010562](https://github.com/Manaconda33/manacondas-minigame-mayhem/actions/runs/37703010562) **SUCCESS**, including LFS, typecheck, zero-warning lint, 129 test files with 1022 passes and two intentional future T9.4 failures, asset validation, production build and all four render regression jobs. Correction render artifact `11518123864` SHA-256 `d39b43c939ab1e066cb03d01d3279b89a20464e5d758234e92b7a58055d73ee3` contains 12 software-WebGL screenshot cases: desktop Low/Medium/High, landscape Low/Medium/High, medium rear view, progress ~0.285/~0.335/~0.415 approach/mid/exit, and portrait ~0.29/~0.42. Captures were inspected for floating pieces, track intersections, billboard recognition and tunnel masking; screenshots are evidence, not a claim that desktop/mobile live human acceptance has passed.

Same-camera Medium Undercity contribution: **+18 draw calls/+7,324 triangles**; maximum across cases **161 calls/130,486 triangles**; no render/page errors. Target <=20 incremental calls, <=200 scene calls, <=300k visible triangles; PRD <=250/750k, all pass. SwiftShader median 2.067 FPS, p95 491.2 ms, explicitly diagnostic-only (not representative device). An earlier CI run on a preceding candidate had two unrelated existing 5-second test timeouts; subsequent final CI passed all 1022 tests without changing timeout contracts. No T9.4 implementation, no T9.7 Skyline polish, no far-plane/render architecture changes, no production release.

Owner gate: corrected runtime awaits pinned isolated Pages publication and Manny's desktop/mobile acceptance; not approved until he tests it. Evidence: `docs/evidence/2026-10-07-neon-task9-t9-3/progress.md`.

## Neon Grid Stage 4 Task 9 T9.2 Skyline checkpoint — 2026-10-07

T9.2 adds a dedicated Skyline contract file at `tests/neon-grid-stage4-task9-skyline.test.ts` while preserving the accepted Task 8/T9.1 baseline in `tests/neon-grid-stage4-task9.test.ts`.

The Skyline contracts require:
- owner name `skyline-visual`, exact progress range 0.000–0.24654910452879084 and matching quality metadata;
- finite bounded instance matrices with exact pylons 14, braces 24, towers 22, procedural signs 18, Manaconda Racing ads 3 and Taco Bell / Live Más ads 3;
- exact Skyline window counts Low 120 / Medium 240 / High 360;
- Low omission of `skyline-wet-asphalt`, with Medium/High `renderOrder < 0`, transparent true, depthWrite false and depthTest true;
- hidden animation freeze and resume without hidden-time catch-up;
- idempotent owner disposal with geometry/material/texture released exactly once before whole-scene cleanup;
- approved static mask ads remain separate from the existing Paprika/Arin/Raven Billboard tell.

The aggregate future-sector tests now intentionally retain only Undercity and Falls-extension names under `it.fails`. T9.3/T9.4 therefore keep explicit RED runway instead of becoming accidentally green when Skyline exists.

Asset verification is enforced by `tools/verify-task9-skyline-assets.mjs`: both runtime WebPs must be RIFF/WebP, exact 1024×512, exact approved byte length and SHA-256. The production build invokes this verifier through `verify-runtime-assets.mjs`.

The T9.2 render-readiness gate is `task9-skyline-render`, driven by `tools/diagnostics/neon-grid-course.html` and `neon-grid-course-render.mjs`. It stages eight racers at Skyline progress ~0.16 and captures Low/Medium/High desktop/mobile plus Medium rear view. The canonical Medium 1920×1080 chase capture performs a same-camera A/B with `skyline-visual` hidden and visible. Skyline contribution must be no more than +18 draw calls, and every capture must stay below the Task 9 engineering ceiling of 200 calls / 300,000 visible triangles. Low/Medium/High quality counts and wet-overlay bypass are checked in the browser fixture, along with resource/page/shader errors. Software-rendered timing is collected only as diagnostic data.

Verified runtime/test source `28c8bd2f6fbddffa2d586aa265796a327f81be09`, CI `37662836256`:
- validate job `112934951587`: PASS, typecheck, zero-warning lint, **128 files / 1011 passes + 2 expected future failures**, asset verification and production build;
- Task 8 Falls Run render `112934950981`: PASS, confirming the accepted Task 8 presentation still clears its gate;
- spillway render `112934951521`: PASS;
- T9.2 Skyline render `112934951571`: PASS;
- pinned runtime checks and active preview builds: PASS.

Skyline render results: desktop Medium 1920×1080 visible **114 calls / 71,612 triangles**, same-camera hidden **103 / 66,876**, for **+11 / +4,736**. Matrix maximum was **115 calls / 151,196 triangles**. Artifact `11502245930`, ZIP SHA-256 `a0664078fb26e547fa0425281f44bd448d6ab27bcf667dea2152bea14b164f1d`. SwiftShader measured median 392.05 ms, p95 396.20 ms and median 2.55 FPS; this is explicitly diagnostic-only and is not representative-hardware PRD certification. T9.6 remains responsible for that hardware gate.

Evidence: `docs/evidence/2026-10-07-neon-task9-t9-2/progress.md`.

## Neon Grid Stage 4 Task 9 T9.1 lifecycle/helper checkpoint — 2026-10-07

T9.1 consumes only the first two T9.0 RED contracts. `FallsRunVisual` must expose idempotent owned-resource disposal and hidden presentation animation must freeze without catching up the hidden interval when visibility resumes. The canonical contract remains `tests/neon-grid-stage4-task9.test.ts`.

The disposal test attaches an owned texture to the accepted Falls Run asphalt material, spies on that texture plus the owned material and geometry, calls the presentation owner's `dispose()` twice, then runs whole-scene cleanup. Each resource must dispose exactly once and the presentation group must be empty after owner disposal. The hidden-freeze test advances visible animation to race time 2, hides the owner through source time 3, then resumes at source time 4; shader time must read 2 while hidden and 3 after resume, proving the hidden interval did not accumulate.

The accepted Task 8 baseline assertions remain ordinary passing tests. The two future course-extension contracts remain `it.fails`: bounded finite `skyline-visual` / `undercity-visual` / `falls-run-extension-visual` owners, and Low-bypass/avatar-safe compositing for the three future wet-road passes. Any later increment that satisfies one of those contracts must promote it to ordinary `it` in the same checkpoint.

Verified source `876d90cc5d284885f9a5ef041fe87fab9fb00590`, hosted CI run `37643865611`: validate `112870109150` PASS with **127 files / 1006 passes + 2 expected failures**, typecheck, zero-warning lint and production build; spillway render `112870109653` PASS; Task 8 Falls Run render `112870109575` PASS. Render artifact `11494291072` has ZIP SHA-256 `c1fde3d3e4d95ebaeef7b314390527cef0440e6a19200e62189b80dbf1795d54`. Maximum observed load was **123 draw calls / 78,604 visible triangles**; desktop Medium 1920×1080 was **93 / 78,604**. SwiftShader timing remains diagnostic-only and is not representative-hardware PRD certification.

Evidence: `docs/evidence/2026-10-07-neon-task9-t9-1/progress.md`.

## Neon Grid Stage 4 Task 9 T9.0 RED-contract procedure — 2026-10-07

Task 9 uses a bounded RED-first gate before course-wide visual expansion. The canonical contract file is `tests/neon-grid-stage4-task9.test.ts`.

T9.0 first ran the four new contract cases as ordinary failing tests on exact branch source `da16aa42cec7808c8e1e855621e02eba5f622b3c`. Hosted CI run `37639361779`, validate job `112854508315`, passed typecheck and zero-warning lint, then produced exactly **4 intended failures / 1004 passes**:

- explicit presentation-owner resource disposal is not implemented;
- hidden presentation owners do not yet freeze animation time;
- Skyline / Undercity / Falls-extension Task 9 owners do not yet exist with bounded finite instance contracts;
- the future sector wet-road passes do not yet exist, so Low bypass and avatar-safe transparent compositing are not yet satisfied.

After that RED proof, the same four cases are encoded with Vitest `it.fails`. This is intentional: CI stays green only while each contract still fails for the expected pre-implementation reason. When a later Task 9 increment implements a contract, that test must be promoted from `it.fails` to ordinary `it` in the same checkpoint. A newly passing body left under `it.fails` is itself a CI failure, preventing silent contract completion.

The same file contains ordinary passing assertions that freeze the accepted Task 8 representative stretch: progress range 0.70–0.85, named shortcut systems, four main boost pads plus Billboard boost, Medium instance counts, quality-scaled window/mist counts, and the accepted wet-road transparent compositing settings.

T9.0 render-baseline evidence comes from the independent Task 8 render job on the same runtime tree: run `37639361779`, job `112854508990`, artifact `11491920972` (ZIP SHA-256 `b2be62b89d5c2aadac749abafa53787d40984a95a48644f7aba2d8094817eb91`). Maximum observed structural budget was **125 draw calls / 88,912 visible triangles**. Desktop Medium 1920×1080 was **91 calls / 66,520 triangles**. SwiftShader frame timing remains diagnostic-only and is not representative-hardware PRD certification.

Evidence: `docs/evidence/2026-10-07-neon-task9-t9-0/`.

> **Task5 final owner acceptance PASS (2026-10-03 America/Chicago):** Manny approved the delivered92025b5 replacement wall preview. Entrance/exit gatePASS plus preserved prior remainderPASS closes Stage3Task5 Service Tunnel owner acceptance. Pending entries below are historical/superseded. Existing117files/885tests/full gates and exact hosted/delivery results remain unchanged; no new runtime/device/balance evidence inferred. Documentation-only approval record; PR242 stays draft/unmerged and production unchanged. Evidence: docs/evidence/2026-10-03-neon-tunnel/owner-playtest.md. Next session resumes from approved Task6 design input after repository catch-up.

> **Tunnel wall replacement preview LIVE / owner junction retest PENDING (2026-10-03):** Runtime92025b5, hostedCI37152562581, previewPR250/CI37159582801 and Pages37159670060 PASS. Local117files/885tests/full gates, independent wall review, and14file hosted/fresh HTTP/hash/source checksPASS. Production and accepted5.3 unchanged. Retest entrance/exit only at https://manaconda33.github.io/manacondas-minigame-mayhem/previews/neon-grid-tunnel/?review=92025b5; preserve owner's fullPASS for all other Task5 gameplay. No new device/WebGL/owner wall pass inferred. Evidence: docs/evidence/2026-10-03-neon-tunnel/junction/. PR242 remains draft/unmerged; stop for owner.

> **Task 5 owner feedback (2026-10-03):** Everything else in the reviewed Service Tunnel gameplay is a full PASS; entrance/exit wall alignment remains an open owner issue. Full Task5 acceptance is pending the two junctions. No exact device/lap count or new automated measurement is inferred. Runtime/preview4367961 unchanged; existing native/hosted checks remain PASS. Evidence: docs/evidence/2026-10-03-neon-tunnel/owner-playtest.md. This supersedes the prior owner-pending statement for the remainder and the Minor-deferral treatment of the wall mismatch.

> **Neon Stage 3 Task 5 preview LIVE / owner playtest PENDING (2026-10-03):** Runtime4367961 exact hostedCI37148627462 and local116files/876tests/typecheck/lint/assets/build/diff/LFS PASS. Physical tunnel support, camera roof rays, three-lap AI, player/Rocket gates/pause/reset/disposal and tunnel/street item contacts have regression coverage. Eight paired native AI runs save16.68–17.90s; wall-scrub probe does not finish within180s. Preview-onlyPR249 merged96d5b5b; CI/Pages37148818476 and fresh HTTP/hash refetch PASS for14files, preserving production and accepted5.3. Owner URL: https://manaconda33.github.io/manacondas-minigame-mayhem/previews/neon-grid-tunnel/?review=4367961 . No owner/device/WebGL/balance pass is inferred. PR242 draft/unmerged; stop for tunnel review; further shortcuts/release gated. Evidence: docs/evidence/2026-10-03-neon-tunnel/.

> **Circuit Alpha terrain materials: LIVE ACCEPTED / DEPLOYED (2026-10-01).** Manny approved production merge/publication after the pinned gameplay preview with “merge & publication to main approved.” PR #234 merged at `0aaea588b1260548cd96d5e4226da7ecfc8397f3`; exact-head PR CI `36932505230` and post-merge main CI/Pages `36934885453` passed. Production HTML, JS, CSS and all nine terrain JPEGs were fetched and matched the validated production build byte-for-byte. Review validation passed 99 files / 768 tests plus typecheck, zero-warning lint, exact assets, LFS and build; hosted preview desktop/portrait startup passed with nine textures and no page/console errors. Accepted asphalt, track geometry/physics, gameplay, karts/art, HUD/Results, audio, bloom and motion blur remain intact. Context-loss recovery remains waived; diagnostics deferred. No separate owner production-root playtest or numeric hardware performance result is inferred. Lighting/shadow/camera increments and final Slice 6 gates remain separate. Evidence: `docs/evidence/2026-10-01-terrain-materials/production-delivery.json`. Earlier review/pending entries are historical.

> **Motion blur LIVE ACCEPTED / DEPLOYED (2026-10-01):** Owner visual review passed on the published pinned preview and Manny explicitly approved merge/publication. Reviewed runtime `949fd77993b9859bc9ca68da5b8f3bc01bd846d6`; reconciled head `32ac3c3435d894f912d921c747777c9375d1c6cc` changed only workflow/release docs relative to that runtime and passed hosted PR CI `36925864779`. PR #231 merged at `981d75f83b592bbb5801be6b7a282144b1ab4e20`; post-merge CI/Pages `36926139532` passed LFS, typecheck, zero-warning lint, tests, production build, pinned previews, artifact upload and deploy. Validate job `110583812445`; deploy job `110585102886`. Local/full validation remains 98 files / 764 tests plus software-WebGL protected-pixel checks. Public-host HTTP/hash refetch is not claimed because this execution environment could not resolve GitHub Pages. Broader full-race Medium/baseline-hardware performance, browser-matrix and final Slice 6 gates remain open.

> **CI Actions Node 24 maintenance VERIFIED (2026-10-01):** PR #229 changed only `.github/workflows/ci.yml`, upgrading checkout v4→v5, setup-node v4→v5, configure-pages v5→v6, upload-pages-artifact v3→v5 and deploy-pages v4→v5 while retaining project `node-version: 22`. PR run `36907406442` passed the normal pull-request validation. Post-merge run `36907725782` passed 95 files / 750 tests, LFS verification, typecheck, zero-warning lint, production build, pinned Race Results and Archer preview rebuilds, `configure-pages@v6`, `upload-pages-artifact@v5`, and `deploy-pages@v5` production deployment. Job-log scan found no Node-20 runtime/deprecation bridge warning. Separate dependency-level `DEP0040 punycode` and `DEP0169 url.parse()` warnings remain nonblocking and are not attributed to game code. Evidence: `docs/evidence/2026-10-01-node24-actions/README.md`.

> **Archer LIVE ACCEPTED / DEPLOYED (2026-10-01):** Manny tested the published pinned Archer preview and explicitly approved merge/publication. Preview runtime `62583845461098caee5fec3e1334502da671de1d` had exact HTTP/hash delivery verification for the preview build, fourteen runtime PNGs and three named GLBs. Reconciled PR #223 head `7d45689b06bde5cda8a0dd164511c2068d3f713f` contained no `src/` or `public/` changes relative to the tested preview runtime. Hosted PR CI `36901694798` passed 95 files / 750 tests, typecheck, lint, LFS verification and build. PR #223 merged at `89fb56e8e8f5f1d45efd45e5cc5fc32c83917f6e`; post-merge CI/Pages `36901993155` passed validation and production deployment, including pinned Archer verification/build. No separate owner production-root playtest or device-performance certification is inferred. Evidence: `docs/evidence/2026-10-01-archer/production-delivery.json`.

> **Selective bloom LIVE ACCEPTED (2026-10-01):** Manny approved private version 9 and explicitly authorized merge/publication with “Approved for merge/publication.” PR #224 merged at `e4defab83b19fcd7a94d27b8ddb361e3b34fadc5`; post-merge CI/Pages `36896865717` passed, with validate job `110485924179` and deploy job `110487025858` successful. Final review validation remains 95 files / 743 tests plus typecheck, zero-warning lint, exact asset checks, production build, diff and LFS checks. Owner visual acceptance is PASSED; Manny additionally confirmed bloom was deployed to production by running the game locally after publication. All prior acceptance remains passed. No identified-device/global-performance certification or independent public-site byte/hash refetch is inferred. Context-loss recovery remains waived rather than tested. Evidence: `docs/evidence/2026-10-01-selective-bloom/production-delivery.json`. Earlier review/pending statements are historical.

# Testing and Validation

## Lunarcrystal asset-only verification — 2026-10-01

Run `python tools/assets/prepare_lunarcrystal_2d.py --verify` from the repository root. It requires delivery PNGs and checked-in ledgers, not local source masters. Verify fourteen RGBA assets, portrait 256×256, ten drivers 512×512, selection/two Results 1024×1536, transparent runtime corners, alpha bounds and exact delivery/source hash links. The two initial rear-turn versions are rejected; approved replacements have own-left-hand low for left steering and own-right-hand low for right steering. Front camera reverses screen sides, not physical hand directions.

Before the asset checkpoint, run the existing full `npm run validate`, `git diff --check` and `git lfs fsck`; use hosted PR CI as clean-runner regression evidence. All delivery paths must have `filter: unset` under existing `.gitattributes`. Upload verification compares remote blob IDs with local `git hash-object` and decodes fetched remote bytes with the preparation verifier. No mounted-camera or gameplay acceptance is inferred; Lunarcrystal is absent from the production manifest.

> **Exhaust / ordinary boost LIVE ACCEPTED (2026-10-01):** Manny accepted private version 8, including the boost-bubble correction, and explicitly authorized merge/publication with “Approved for merge / publish” on 2026-10-01 (America/Chicago). PR #221 merged at `fa9487615330d74f79e46a09c1fdbf1dd14fc8c5`; final PR CI `36881140355` and post-merge CI/Pages `36882109291` passed. Public index, both JS bundles and CSS returned HTTP 200 with exact validated-production-build hashes. Full validation passed 91 files / 727 tests. All prior acceptance stays passed; no hardware/global-performance result, bloom, blur or next-slice authority is inferred. Evidence: `docs/evidence/2026-10-01-exhaust-boost-flares/production-delivery.json`. No accepted manual gate is reopened; earlier review/pending statements are historical.

> **Exhaust / ordinary boost review (2026-10-01):** Full validation passed 91 files / 727 tests plus typecheck/lint/exact asset gates/build, diff and LFS checks. Focused `tests/exhaust-visual.test.ts` and real race routing cover speed/boost strength, quality/shared/camera bounds, normalized modeled outlet capture, accepted purple/item overlap suppression (including active Overdrive gaps), motion preservation, pause/hidden freeze, spinout/countdown/finish/recovery/disposal. Only new-effect owner visual review and separate publication approval remain pending. Prior acceptance stays closed; no hardware/global-performance result is inferred. Evidence: `docs/evidence/2026-10-01-exhaust-boost-flares/`.

> **Player speed cues LIVE ACCEPTED (2026-10-01):** Manny accepted private version 6 and explicitly authorized merge/publication with “Approved for merge / publish.” on 2026-10-01 (America/Chicago). PR #219 merged at `845f68fc173a147d54ecdf74395e65bda328fc4e`; final PR CI `36870557916` and post-merge CI/Pages `36871486372` passed. Public index, both JS bundles and CSS returned HTTP 200 with exact validated-production-build hashes. Full validation passed 90 files / 720 tests. Existing acceptance remains passed. No new device/hardware/global-budget result, bloom/blur or next-slice authority is inferred. Evidence: `docs/evidence/2026-10-01-player-speed-cues/production-delivery.json`. No accepted manual gate is reopened; earlier pending statements are historical.

> **Player speed cues review (2026-10-01):** Run `npx vitest run tests/player-speed-visual.test.ts tests/race-diagnostics-routing.test.ts tests/chase-camera.test.ts`, then full `npm run validate`, `git diff --check`, `git lfs fsck`. Tests cover FOV projection bounds/smoothing, preserved aspect/position, slow/reverse/lateral suppression, clip-space stroke bounds, quality allocations, camera rear view, pause/hidden freeze, spinout/countdown/recovery/finish reset and disposal. Existing prototype item fixtures supply the real owned speed visual. New-effect desktop/mobile rendered legibility is owner review; cloud preview navigation blocked and no rendered/device/performance pass is claimed. All previously accepted gates remain passed. Evidence: `docs/evidence/2026-10-01-player-speed-cues/`.

> **AI driving VFX LIVE ACCEPTED (2026-10-01):** Manny accepted private version 5 and explicitly approved merge/publication. PR #217 merged at `8380390ed07d281d8b99a3956272550ff6fdf0a6`; final PR CI `36861828504` and post-merge CI/Pages `36865162215` passed (89 files / 711 tests). Public index, entry JS, kart JS and CSS returned HTTP 200 with exact validated-build hashes. Owner visual acceptance is PASSED; preserve all prior acceptance. No device/hardware/global-budget measurement is inferred. Evidence: `docs/evidence/2026-10-01-ai-driving-vfx/production-delivery.json`. Earlier pending statements below are historical.

> **AI driving VFX review (2026-10-01):** Run `npx vitest run tests/ai-driving-pools.test.ts tests/race-diagnostics-routing.test.ts tests/drift-visual.test.ts tests/wheel-dust-visual.test.ts`, then full `npm run validate`, `git diff --check`, `git lfs fsck`. Shared-pool tests cover independent racer transitions, aggregate quality bounds, world trails, pause, per-owner clearing and GPU disposal. Runtime coverage includes actual off-road physics queries without body writes, modeled wheel anchors surviving batching, distance/frustum and spinout suppression, no culled catch-up burst, recovery and finish. Preserve all accepted gates. Evidence and preview provenance: `docs/evidence/2026-10-01-ai-driving-vfx/`; AI visual acceptance and public release remain pending.

> **2026-09-30 player wheel dust review:** Approved bounded player-only dust is implemented on a review branch; owner new-effect visual acceptance and separate merge/production approval PASSED; LIVE through PR #215 / CI-Pages `36801897851`. Run `npx vitest run tests/wheel-dust-visual.test.ts tests/race-diagnostics-routing.test.ts tests/drift-visual.test.ts tests/settings.test.ts`, then `npm run validate`, `git diff --check` and `git lfs fsck`. Tests cover off-road wheel separation, unsupported/idle suppression, speed/slip, color differences, preset caps, world-space trails, freeze/expiry/disposal, real ground sampling, unchanged player velocity and modeled wheel centers surviving batching. Review procedure/source/CI/preview and actual results: `docs/evidence/2026-09-30-wheel-dust/`. Preserve all existing acceptance; no fresh GPU/device/global-budget pass is inferred.

> **2026-09-30 player drift VFX LIVE ACCEPTED:** Manny approved the supplied review and explicitly authorized merge/publication. PR #214 merged at `399bbbd6683332a1681b5f1e9d716ed18882644e`; final PR CI 36795775083 and post-merge CI/Pages 36796770466 passed (87 files / 693 tests). Production index/JS/CSS matched the accepted local build. `docs/evidence/2026-09-30-drift-vfx/` records owner acceptance and delivery provenance. Existing manual acceptance remains passed. No new numeric device performance is inferred; broader performance gates remain open. Earlier new-effect review/pending text describes the historical pre-approval checkpoint.

> **2026-09-30 owner scope update:** Manny selected the supplied mobile race result to replace the desktop Medium baseline requirement for this checkpoint. Baseline summary is recorded from the screenshot; the raw JSON attachment is unavailable/unverified. No further desktop capture is required for this checkpoint. See `docs/evidence/2026-09-30-medium-baseline/mobile-baseline.md` for metrics, provenance limits and target comparisons. Earlier desktop/pending instructions below describe the superseded capture scope. This does not assert measured desktop performance, a full PRD performance pass, or runtime merge/production approval.


This file is the operational source of truth for local and CI validation. Update it when commands, environments, or evidence requirements change.

## Slice 5 Arc Blade - deployed and LIVE ACCEPTED

`docs/SLICE-5-ARC-BLADE-SCOPE.md` and amendment 2.15 / ADR-076 govern the accepted implementation. Governance PR #138 merged at `7ce6511bc040d2b176ed528b687ed589fafd045d`; gameplay PR #139 merged at `8822341b61900799e0166cfe94bf69cb3986bf0e`. Hosted PR CI `35118244169` and post-merge validation/Pages `35118484183` passed with **48 files / 431 tests**, **82.50% statement coverage**, strict typecheck, zero-warning lint, asset verification and production build. Manny reported that all deployed Arc Blade live tests passed on September 16, 2026; PR #139 comment `5700594653` is the product-owner evidence. No browser/device versions beyond that explicit report are inferred.

| Coverage                         | Evidence                                                                                                                                                                                                                                                                                                                                                                                                                        |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Inventory, movement and contacts | `tests/arc-blade.test.ts`: three charges and exact cadence, rollback without cues, forward/reverse equivalence, measured curved path and moving-owner return, arming/catch/expiry boundaries, per-leg hit isolation and turnaround separation, chronological wall/contact/catch ordering, immunity/counters, shared mixed-object capacity and owner cancellation. Real Circuit Alpha curves and elevated sections are included. |
| Actual runtime and input         | `tests/arc-runtime.test.ts`: moving keyboard/mobile ITEM paths, ordinary race-state guards, actual Rapier/controller spin and camera/hit state, independent Frost/Nitro/Prismatic state, before-contact Shockwave clearing, recovery and all three moving diagnostics. Counter PASS requires a real measured encounter; a miss remains INCONCLUSIVE.                                                                            |
| Presentation and cleanup         | `tests/arc-presentation.test.ts`: finite trail/return accent, mobile/desktop chase/rear frustums after the camera intro, bounded flashes and audio voices, gesture unlock/volume/pause/unavailable audio/disposal, and 200 complete throws returning resource counts to baseline.                                                                                                                                               |
| Stress                           | `tests/arc-soak.test.ts`: 800 throws with 40 simultaneous objects and eight racer snapshots, finite transforms and bounded capacity/resources. The isolated CPU observation was local Node/JSDOM evidence, not final rendered-device performance certification.                                                                                                                                                                 |

### Arc Blade deployed regression routes

Use `?testItem=arc-blade` to race normally and verify the accepted three-charge/cadence, forward-only throw under normal/reverse ITEM intent, curved outbound/return path, safe owner catch, rival spin and legitimate separated second-leg hit behavior. Optional deployed counter routes remain:

- `?testItem=shockwave&testArcBladeCounter=shockwave`
- `?testItem=prismatic-invincibility&testArcBladeCounter=prismatic&testArcBladePhase=protected`
- `?testItem=prismatic-invincibility&testArcBladeCounter=prismatic&testArcBladePhase=expired`

A miss, interception, wall/catch/expiry, recovery or unsuitable geometry remains INCONCLUSIVE rather than a protection pass. Preserve the accepted normal-build regression matrix, both cameras, desktop/mobile controls, readable original audiovisuals, and lifecycle cleanup in future regression testing.

## Slice 5 Kinetic Arc Hammers - LIVE ACCEPTED

PRD amendments 2.16-2.17, ADR-077/078, and `docs/SLICE-5-ARC-HAMMERS-SCOPE.md` govern the deployed implementation. Reviewed head `e395c63e3f0a425a985de2208e624adf2dd87574` passed hosted PR CI `35137395927` and PR #144 squash-merged at `a129bbac75f919dc7136ac50dfd63564fe5cd52e`. Post-merge validation and GitHub Pages run `35137681000` passed. Automated evidence is **50 test files / 446 tests**, **82.19% statement / 77.39% branch / 86.56% function / 83.70% line coverage**, strict typecheck, zero-warning lint, Git LFS/runtime-asset verification, branding checks and production build.

Hammer-specific automation covers the exact approved values and boundaries: five charges; 0.35-second commit-only cadence; forward/backward input; 36 m/s horizontal launch, 11 m/s upward velocity, 24 m/s^2 gravity and 0.20x capped planar inheritance; 0.36 m radius; 0.18-second owner arming; one genuine supporting-surface bounce with 0.78 tangential retention / 0.55 normal restitution; 0.75-second post-bounce and 2.25-second hard lifetime; first-wall and second-terrain-contact destruction; 0.85-second standard hit spin; later self-hit; immunity/Prismatic absorption; Shockwave <=5 m pre-movement clearing; chronological collision ordering; shared-capacity rollback; pause/lifecycle cleanup; and race-authority preservation. `tests/arc-hammers-runtime.test.ts` additionally exercises production ITEM input, real shared capacity, the actual Circuit Alpha supporting-surface query, RacerEffects, KartTimeTrial/controller contact state, camera anchoring and recovery behavior.

Primary deployed review route: `?testItem=arc-hammers`. Counter diagnostics: `?testItem=shockwave&testArcHammerCounter=shockwave`, `?testItem=prismatic-invincibility&testArcHammerCounter=prismatic&testArcHammerPhase=protected`, and the same Prismatic route with `testArcHammerPhase=expired`. A miss, rail interception, terrain/lifetime expiry, recovery discontinuity, or unsuitable geometry remains INCONCLUSIVE rather than PASS. Manny completed the supplied deployed routes and reported **all tests pass** on 2026-09-16; PR #144 comment `5703186707` records the product-owner evidence. Arc Hammers is LIVE ACCEPTED. No browser/device-specific result is inferred beyond that explicit report.

## Slice 5 Frost Orbs — deployed and LIVE ACCEPTED

PRD amendment 2.14, ADR-075, and `docs/SLICE-5-FROST-ORBS-SCOPE.md` define the accepted stacked Frost contract. PR #137 deployed at `b69648b429c78161593403ce0074b9df0567603e` with successful validation/Pages `34475955547`; Manny's final acceptance is PR comment `5625755529`. The scope at `f44176ceef38dfeebee10f6d44a0c41fdb869629` records that acceptance, and follow-on validation/Pages `34533224332` passed. `tests/frost-orbs.test.ts`, `tests/frost-presentation.test.ts`, `tests/kart-controller-effects.test.ts`, and `tests/prismatic-runtime.test.ts` remain regression coverage. No additional device/version details are inferred.

Frost timers advance before drive at the start of an active simulation step. A timer expiring on that boundary restores neutral steering for that drive step; a later hit starts a new 1.2-second interval. Each impact applies its stack and velocity change immediately, including simultaneous impacts. Pause/countdown freezes the clock.

Use `?testItem=frost-orbs` for normal-race Frost regression: collect a box, finish roulette and fire freely with the existing cadence. Manny used this route after the scripted single-hit gate blocked use and did not show a countdown/rival after stopping. No repair to that scripted setup has been deployed. The optional `testFrost` diagnostics retain their road/heading/stopped setup conditions from the scope; misses or absent encounters remain INCONCLUSIVE, never automatic PASS. Their existence is not a reason to gate the unrestricted fixed-item route.

A fixture PASS certifies its measured encounter only. Complete the scope's desktop/mobile direction/cadence, chase/rear/elevation visibility, original sound/volume/pause, cleanup, and normal-build regression checks on the deployed build. No rendered or device-specific acceptance is claimed by local automation.

## Slice 5 Prismatic Invincibility — deployed and live accepted

PR #133 deployed at `3d79a7cb5291c53444cf3ae53f261b4a60ea9f0a`; validation/Pages `34387476666` passed, and Manny approved and accepted the deployed checkpoint in Work. This supersedes the historical pre-publication wording below. No device-specific results were supplied. Retain the following instructions for regression testing. Blaze Orbs is live accepted under amendment 2.13 / ADR-074; its approved regression matrix remains in `docs/SLICE-5-BLAZE-ORBS-SCOPE.md`. No new Blaze fixture result is claimed by this section.

PRD amendment 2.12, ADR-073, and `docs/SLICE-5-PRISMATIC-INVINCIBILITY-SCOPE.md` define the approved contract and the ten-part automated/eight-part live gates. Before gameplay publication, verify atomic use/refresh/rollback, exactly six seconds of consistent immunity across drive/contact/projectile/hazard processing, independent boost expiry, 1.12x cap with no dirt/grass slowdown, projectile absorption/capacity release, Slick persistence without protected-racer spin or slowdown, per-victim Blast/Apex immunity, Shockwave push exclusion, and once-per-encounter hostile contact. Test both sides of every duration/contact boundary and sustained overlap/separation/re-entry.

The approved following shell, particle trail, shimmer, countdown, and musical layer require camera/surface, pause, volume, unavailable-audio, expiry, recovery, finish, reset, and disposal checks. Fixed-item protected/expired fixtures must reach and report their intended encounters using production rules; misses/interceptions cannot count as immunity passes. Run the full existing validation and hosted clean-install CI before gameplay publication. Deployed desktop/mobile results and Manny's acceptance remain required; local automated evidence is recorded in `docs/IMPLEMENTATION-STATUS.md`; no deployed acceptance is claimed.

### Prismatic live test instructions — use only after approved gameplay deployment

These URLs are deployed through PR #133 at the checkpoint recorded above. The setup instructions still apply to repeat testing.

Each link forces the real pickup result; collect an item box and let the reveal finish. Stop below 1 m/s within 2 m of the road center on asphalt (avoid moving/boost/ramp sections for a stationary test). The HUD must say READY before ITEM will commit. For Apex, first reach first place and remain the leader until fixture launch. Activate once and stay still; expired links wait until the six-second protection ends before launching the encounter. The racer fixture places one existing rival ahead, marks it with a cyan arrow, and controls its approach without editing lap/checkpoint progress. A protected racer test checks the rival's hostile spin; its expired control checks ordinary contact without a Prismatic spin.

| Encounter | Protected                                                                                                                                                           | Expired control                                                                                                                                                 | Expected result                                                               |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Kinetic   | [Protected](https://manaconda33.github.io/manacondas-minigame-mayhem/?testItem=prismatic-invincibility&testPrismaticCounter=kinetic&testPrismaticPhase=protected)   | [Expired](https://manaconda33.github.io/manacondas-minigame-mayhem/?testItem=prismatic-invincibility&testPrismaticCounter=kinetic&testPrismaticPhase=expired)   | Absorbed without spin / normal hit after expiry                               |
| Seeker    | [Protected](https://manaconda33.github.io/manacondas-minigame-mayhem/?testItem=prismatic-invincibility&testPrismaticCounter=seeker&testPrismaticPhase=protected)    | [Expired](https://manaconda33.github.io/manacondas-minigame-mayhem/?testItem=prismatic-invincibility&testPrismaticCounter=seeker&testPrismaticPhase=expired)    | Armed contact absorbed / normal hit after expiry                              |
| Slick     | [Protected](https://manaconda33.github.io/manacondas-minigame-mayhem/?testItem=prismatic-invincibility&testPrismaticCounter=slick&testPrismaticPhase=protected)     | [Expired](https://manaconda33.github.io/manacondas-minigame-mayhem/?testItem=prismatic-invincibility&testPrismaticCounter=slick&testPrismaticPhase=expired)     | No spin or slowdown, patch remains / normal trigger after expiry              |
| Blast     | [Protected](https://manaconda33.github.io/manacondas-minigame-mayhem/?testItem=prismatic-invincibility&testPrismaticCounter=blast&testPrismaticPhase=protected)     | [Expired](https://manaconda33.github.io/manacondas-minigame-mayhem/?testItem=prismatic-invincibility&testPrismaticCounter=blast&testPrismaticPhase=expired)     | Ordinary detonation, player spared / player affected after expiry             |
| Apex      | [Protected](https://manaconda33.github.io/manacondas-minigame-mayhem/?testItem=prismatic-invincibility&testPrismaticCounter=apex&testPrismaticPhase=protected)      | [Expired](https://manaconda33.github.io/manacondas-minigame-mayhem/?testItem=prismatic-invincibility&testPrismaticCounter=apex&testPrismaticPhase=expired)      | Ordinary leader-targeted impact, player spared / player affected after expiry |
| Shockwave | [Protected](https://manaconda33.github.io/manacondas-minigame-mayhem/?testItem=prismatic-invincibility&testPrismaticCounter=shockwave&testPrismaticPhase=protected) | [Expired](https://manaconda33.github.io/manacondas-minigame-mayhem/?testItem=prismatic-invincibility&testPrismaticCounter=shockwave&testPrismaticPhase=expired) | No push / outward push after expiry                                           |
| Racer     | [Protected](https://manaconda33.github.io/manacondas-minigame-mayhem/?testItem=prismatic-invincibility&testPrismaticCounter=racer&testPrismaticPhase=protected)     | [Expired](https://manaconda33.github.io/manacondas-minigame-mayhem/?testItem=prismatic-invincibility&testPrismaticCounter=racer&testPrismaticPhase=expired)     | Marked rival receives one spin / no hostile spin after expiry                 |

PASS means the instrumented contact occurred and matched the requested protection state; it does not certify all live visual or regression checks. Confirm the expected visible outcome as well. INCONCLUSIVE means no valid contact was verified (for example interception, a rail hit, movement away, or losing first for Apex); restart and repeat on a clear straight. FAIL means a verified encounter had the wrong outcome. Record case/phase, device, gameplay commit, badge, and observed behavior. Restart before each repeat.

Use the forced pickup alone for driving, six-second timing, Nitro overlap, dirt/grass immunity, following visuals, pause/audio, expiry, recovery, and mobile/rear-camera checks. Use the normal URL with no parameters for fixture isolation and accepted-item/AI regressions. Automated counters do not replace the eight-part live gate in the scope document.

## Blaze Orbs implementation validation gate

Before gameplay publication, cover five-charge inventory and fifth-shot slot release; exact 0.55-second cadence including pause and rejected-use rollback; 42 m/s forward/backward shots without inherited velocity; 0.28 m radius, three-second lifetime and 0.18-second owner arming; first-wall destruction; 0.55-second spin refresh; shared capacity release; Prismatic absorption/expired control; and Shockwave horizontal 5 m edge/order behavior. Exercise actual dispatcher/contact paths and bounded lifecycle resources. No new Blaze test pass is claimed by this governance-only checkpoint.

The approved fixed-item hit, Shockwave, and protected/expired Prismatic fixtures must establish a suitable course setup and report actual outcomes. Validate camera/surface readability, sound/volume/pause/cleanup, desktop/mobile direction/cadence/count, and normal-build isolation. Exact fixture parameters and the full live matrix are in `docs/SLICE-5-BLAZE-ORBS-SCOPE.md`. Run full local validation and clean-install hosted CI before gameplay publication; record deployment and Manny's live acceptance separately.

## Supported environment

- Node.js 22 LTS or newer compatible release
- npm from the selected Node.js installation
- Modern Chromium, Firefox, or Safari for manual browser checks
- Git LFS 3.x before adding production binary assets

## Clean local validation

From the repository root:

```bash
npm ci
npm run typecheck
npm run lint
npm run test:ci
npm run build
```

`npm run validate` runs the validation stages after dependencies are installed. `npm run test` starts Vitest in watch mode for development.

## CI validation

GitHub Actions runs `.github/workflows/ci.yml` on pushes and pull requests targeting `main`:

1. Check out the repository.
2. Set up Node.js 22 with npm caching.
3. Install exactly from `package-lock.json` with `npm ci`.
4. Run strict TypeScript checks.
5. Run ESLint with zero warnings allowed.
6. Run Vitest once with coverage evidence.
7. Produce a Vite production build.
8. On a healthy push to `main`, publish `dist/` through the `github-pages` deployment environment.

Any failed stage fails the workflow.

The production checkout must use `lfs: true`, run `git lfs fsck`, and execute the runtime-asset signature gate through `npm run build`. A pointer file in any required runtime GLB path must fail the build rather than silently deploying a fallback kart.

## Restricted Work LFS publication

When direct Git/LFS push is blocked, follow `docs/LFS-PUBLISHING.md`. A valid checkpoint requires:

- A committed deterministic builder and pinned dependencies.
- SHA-256 checks matching every approved LFS object ID.
- An unchanged-pointer check after the runner regenerates and stages the files.
- A successful object-ID-only LFS upload.
- A fetch from GitHub after the runner deletes its local LFS cache.
- A passing `git lfs fsck` after that fetch.
- Removal of the temporary workflow before review or merge.

The bridge is not valid evidence for a binary that cannot be reproduced byte-for-byte from committed source.

## Manual confirmation deployment

Every Slice 1+ checkpoint must provide a live GitHub deployment URL, normally:

`https://manaconda33.github.io/manacondas-minigame-mayhem/`

The deployment must originate from the reported checkpoint commit after validation. The product owner uses it for manual confirmation. A passing deployment does not imply approval; the next slice remains locked until explicit approval is recorded.

## Evidence expectations

Every slice done-check must record fresh evidence in `docs/IMPLEMENTATION-STATUS.md`:

- Commands executed and whether each passed.
- Test counts and meaningful coverage or scenario evidence.
- Production build result and generated output summary.
- Manual browser/device evidence when the slice changes rendered behavior.
- GitHub Actions workflow result for the checkpoint commit.
- GitHub deployment environment, live URL, and deployed commit.
- Manual confirmation scenarios appropriate to the slice.
- Known defects, deferred checks, and environmental limitations.
- Exact checkpoint commit SHA.

Code presence alone is not completion evidence.

## Player speed-stat regression

Run the automated controller checks on flat asphalt with full throttle, no boost, no steering, and no collisions:

- Every `characterManifest` profile must converge to its `createKartTuning(stats).maxSpeed` value after ten simulated seconds.
- Two otherwise identical profiles with the same Speed and different Acceleration must differ after one second, with the higher-Acceleration profile ahead, then converge to the same sustained maximum.
- A failure means Acceleration, mass, passive damping, collider friction, or another downstream force has regained control of terminal road speed.

For live acceptance, compare Krios, Accu, Kraken, and Lula on the same asphalt straight without boost. Confirm that higher Speed produces the higher sustained maximum, while Acceleration remains visible in time-to-speed. Repeat on desktop and mobile, and record the deployed commit and observed speeds in `docs/IMPLEMENTATION-STATUS.md`.

## Acceleration, surface-transition, and AI-lane regression

- `createKartTuning` must map Acceleration 4 to 6.2 m/s² and Acceleration 8 to 8.4 m/s² before the documented speed-ratio taper.
- Two otherwise identical Speed 8 profiles with Acceleration 4 and 8 must differ by more than 2 m/s after one second. The Acceleration 4 profile must remain below 75% of its maximum after three seconds, and both must still converge to the same Speed-defined ceiling.
- A kart entering dirt or grass at full asphalt speed must lose less than 0.3 m/s during its first simulated frame, then converge to the correct Traction-defined surface maximum within four seconds.
- Every configured AI profile must complete three validated laps, spend less than 2% of simulated frames on grass, and remain within 0.5 meters of the road boundary.
- In the two-kart passing scenario, the faster AI must commit to an adjacent road-bounded lane, move ahead of the slower racer, and remain within the road boundary.

For live acceptance, compare Krios or Accu against Lavi or Lula from a standing start; drive from asphalt into both dirt and grass without braking; and observe a full AI pack through several corners. Confirm a visible launch/recovery difference, progressive off-road slowdown, no systematic inside-grass line, and lateral overtaking around slower racers.

## AI Speed-stat authority regression

- A clear-straight neutral AI target must equal its selected character's `createKartTuning(stats).maxSpeed`, regardless of grid profile pace.
- Profile pace must affect the curvature penalty: a higher-pace AI may carry more speed through the same corner, but pace may not replace the straight-line cap.
- A leading AI must retain a 1.0 top-speed multiplier. A trailing AI allowance must remain between 1.0 and 1.04.
- Every configured AI pace profile must reach at least 98% of its character maximum during the three-lap circuit simulation while preserving valid laps, road bounds, and the grass-time limit.
- The overtaking regression must use different Speed stats for its slower lead racer and faster trailing racer; grid profile pace alone is not evidence of a straight-line speed advantage.

For live acceptance, observe AI-controlled low-, medium-, and high-Speed characters on clear asphalt sections. Confirm that each can approach its displayed unboosted maximum, that high-Speed racers have a visible straight-line advantage, and that AI still brakes for corners and passes slower traffic without systematic grass use.

## Weight-driven kart-collision regression

- Contacts with less than 0.75 m/s closing speed must retain 100% of forward speed so parallel or resting overlap does not create repeated slowdown.
- At 16 m/s closing speed, Weight 10 versus Weight 2 must retain approximately 85.9% speed, while Weight 2 versus Weight 10 retains approximately 67.1%.
- The heavy racer's retention advantage in that comparison must exceed 15 percentage points, but the Weight 10 racer must still lose at least 13% of forward speed.
- Every Weight 1–10 pairing at full severity must remain inside the governed 65–96% retention range.
- Controller evidence must confirm that retention reduces only positive forward velocity and preserves lateral collision motion.

For live acceptance, collide Accu and a light racer with comparable approach speeds in both directions. Confirm that Accu retains visibly more momentum but still suffers a noticeable slowdown, the light racer accepts greater risk, lateral knockback remains readable, and bumper-to-bumper contact does not continuously drain speed.

## Slice 5 full AI item tactics checkpoint

Automated evidence for ADR-083 / `docs/SLICE-5-AI-ITEM-TACTICS-SCOPE.md` must confirm:

- every governed item ID has a deterministic `AiItemPolicy` decision path;
- progress-valid ahead targeting, rear-attacker direction, defensive threat detection, useful-line checks, and no-target waits remain bounded and deterministic;
- AI Overdrive and Hyper-Drive Rocket activate through the generic dispatcher/system paths, while multi-charge cadence remains owned by `ItemSystem`;
- AI drive modifiers reach `KartController` for speed cap, acceleration, steering, and off-road authority, and Rocket input remains composed through its legal autopilot;
- AI finish cleanup clears inventory and active item state without changing checkpoint/lap/rank/finish authority;
- `?testAiItem=<item-id>&testAiRacer=ai-1` is isolated from player-only `?testItem=<item-id>`, normal item selection, roulette timing, and other AI inventories; and
- the existing selector probability report, AI spline/hazard response, item interaction, lifecycle, and runtime-asset regressions remain passing.

For deployed product-owner acceptance after merge, use the normal unforced route first, then representative deterministic routes such as:

```text
https://manaconda33.github.io/manacondas-minigame-mayhem/?testAiItem=seeker-drone&testAiRacer=ai-1
https://manaconda33.github.io/manacondas-minigame-mayhem/?testAiItem=shockwave&testAiRacer=ai-1
https://manaconda33.github.io/manacondas-minigame-mayhem/?testAiItem=nitro-overdrive&testAiRacer=ai-1
https://manaconda33.github.io/manacondas-minigame-mayhem/?testAiItem=hyper-drive-rocket&testAiRacer=ai-1
```

1. On the normal route, observe multiple AI racers collect and resolve items without player inventory forcing.
2. On a forced AI route, confirm the HUD badge identifies exactly one target racer and the target still completes the normal roulette before policy use.
3. Confirm Seeker/Ink/offensive items wait for a valid ahead target and resolve through the existing projectile/effect systems.
4. Confirm Slick/rear-directed items use a real rear approach and do not change the item definition's placement rules.
5. Confirm Shockwave and Prismatic remain held until a real projectile, hazard, or contact threat is present, then resolve through their existing counter/immunity systems.
6. Confirm Nitro Surge/Overdrive use a useful straight or recovery line, Rocket activates promptly, and all boost movement remains legal spline/controller movement.
7. Confirm AI racers retain normal steering, lane selection, hazard avoidance, lap/checkpoint authority, and finish ordering throughout item use.
8. Confirm pause, finish, recovery, restart, and disposal leave no stale AI item, effect, projectile, hazard, timer, VFX, or audio state.

Record the deployed commit, CI/Pages run, desktop/mobile result, representative routes, any policy/interaction/lifecycle defect, and Manny's explicit acceptance in `docs/IMPLEMENTATION-STATUS.md`. This checkpoint does not by itself close the final all-item, soak/performance, or Slice 5 gates.

## Full AI tactics corrective race-authority and presentation gate

ADR-084 covers the approved corrective gate found during live full-AI review. Automated evidence must verify that a forward swept crossing counts even when both fixed-step samples lie outside the prior radial trigger; reverse and off-corridor crossings remain rejected; the ordered `LapTracker` remains the only lap/finish owner; unvalidated raw spline projection cannot rank ahead of a racer with greater validated progress; the CP11-to-offset-finish wrapped segment remains ordered correctly; and existing AI/Rocket three-lap regressions use the same gate contract.

AI presentation evidence must verify that the existing procedural Nitro Surge, Nitro Overdrive, Hyper-Drive Rocket, and Prismatic effects can be instantiated per AI racer, follow the racer through the active interval, and clear cleanly. No new AI audio, model, item balance, probability, stat, or gameplay-authority behavior is included.

After an approved corrective deployment, first complete a normal three-lap race and confirm that the lap HUD, displayed position, finish lock, and final standings agree throughout. Then use `?testAiItem=nitro-overdrive&testAiRacer=ai-1` and a representative Rocket/Prismatic AI route to confirm the target AI visibly carries the same racer-owned effect while its existing gameplay behavior remains unchanged. Record the deployed commit, CI/Pages run, device/browser result, observed lap/finish outcome, visual result, and Manny's explicit acceptance before closing this gate.

## Slice 5 RacerEffects and Nitro Surge checkpoint

Automated evidence for this bounded checkpoint must confirm:

- the player-only `testItem=<item-id>` acceptance override accepts only the fifteen governed IDs, ignores invalid/missing values, and never forces AI inventories;
- normal URLs without `testItem` continue through the governed position/gap selector unchanged;
- the Nitro Surge procedural rear exhaust/energy visual is hidden outside the effect, visible while the `nitro-surge` RacerEffects state is active, and releases its Three.js resources on disposal;
- Nitro Surge tuning remains configuration data at approximately 2.4 seconds, 1.18x normal speed cap, and 1.50x acceleration authority;
- the temporary boost applies strong acceleration without changing the permanent Speed stat;
- the off-road override bypasses only dirt/grass speed-ceiling penalties while Traction-governed off-road acceleration remains active;
- the effect timer freezes under pause and restores neutral modifiers on expiry;
- successful Nitro activation consumes its single charge and immediately frees the one inventory slot;
- an unsupported/not-yet-implemented item remains held and unconsumed when ITEM is pressed;
- use during roulette remains rejected;
- the existing AI 1.00-1.04 speed allowance remains separately bounded;
- built-in drift boost and item boost do not multiply into an unintended compounded cap/acceleration state; and
- disposal/explicit cleanup removes temporary effects without leaking state.

For deployed product-owner acceptance after merge:

Use `https://manaconda33.github.io/manacondas-minigame-mayhem/?testItem=nitro-surge` for the Nitro acceptance pass. The test-mode badge must identify Nitro Surge, every player pickup must resolve to Nitro Surge, and AI pickups remain normal. Load the normal URL once to confirm production selection is not forced.

1. Collect a player box in forced Nitro test mode; confirm roulette remains approximately 0.85 seconds and resolves to Nitro Surge every time.
2. After reveal, press ITEM and confirm Nitro activates rather than merely registering input.
3. Confirm the held Nitro charge is consumed and the item slot clears immediately, allowing another item box to be collected while the boost is still active.
4. Confirm the race status reports `NITRO SURGE ACTIVE` and the kart shows a clear rear exhaust/energy Nitro tell for the same active interval.
5. On asphalt, confirm noticeably stronger acceleration and a temporary ceiling above the racer's normal top speed, targeting approximately 1.18x.
6. Activate Nitro immediately before or while entering dirt/grass and confirm the usual off-road speed ceiling is bypassed during the effect; Traction may still influence how quickly the kart accelerates there.
7. Confirm Nitro expires after approximately 2.4 seconds and the normal road/off-road speed behavior returns without a persistent buff.
8. Pause during Nitro and confirm the remaining effect duration freezes until gameplay resumes.
9. Confirm both desktop ITEM inputs (Left Shift and E) and the mobile ITEM button can activate Nitro after reveal.
10. Confirm a non-Nitro held item still does not fire or consume in this checkpoint.

Record the deployed commit, CI/Pages run, desktop result, mobile result, any effect/timing/speed defect, and Manny's explicit acceptance in `docs/IMPLEMENTATION-STATUS.md`. Passing this checkpoint authorizes no other item effect.

## Slice 5 roulette, HUD, and input checkpoint

Automated evidence for this bounded checkpoint must confirm:

- the actual selected item is locked at collection while roulette only changes presentation;
- roulette duration is approximately 0.85 seconds and freezes while paused;
- item use is rejected during roulette;
- Left Shift and E are accepted desktop ITEM inputs after reveal, while unsupported keys are not;
- S / Down modifies desktop use intent to backward;
- the mobile gameplay markup exposes exactly one dedicated ITEM control, while non-mobile sessions do not render touch controls;
- Brake/Reverse held with mobile ITEM produces backward intent;
- the HUD renders empty, roulette, held, multi-charge, and input-feedback states without exposing a second inventory slot;
- registering input before item effects exist does not consume a charge or free the occupied inventory slot; and
- the future effect-dispatch boundary consumes one charge only when `commitUse()` is explicitly called.

For deployed product-owner acceptance after merge:

1. On desktop, collect a box and confirm roulette begins immediately, remains readable, and resolves to a held item after approximately 0.85 seconds.
2. Pause during roulette and confirm the roulette freezes until gameplay resumes.
3. Confirm the held HUD shows the final item name/glyph and, for Blaze Orbs, Frost Orbs, Arc Blade, or Arc Hammers, the governed charge count.
4. Press Left Shift and E separately after reveal and confirm forward input registration. No visible item effect or charge consumption is expected in this checkpoint.
5. Hold S or Down while pressing ITEM and confirm backward input registration.
6. On mobile, confirm the dedicated ITEM control is present without obscuring steering, acceleration, braking, drift, rear-view, reset, minimap, or race HUD surfaces.
7. Tap ITEM after reveal and confirm forward registration; hold Brake/Reverse while tapping ITEM and confirm backward registration.
8. Confirm the racer remains unable to collect a second item box because the held item is intentionally not consumed until the later effects increment.

Record the deployed commit, CI/Pages run, desktop result, mobile result, any layout/readability defect, and Manny's explicit acceptance in `docs/IMPLEMENTATION-STATUS.md`. Passing this checkpoint does not authorize item effects or close Slice 5.

## Slice 5 HazardSystem + Timed Blast Orb checkpoint

Automated evidence for the approved PRD amendment 2.8 / ADR-069 increment must confirm:

- one shared maximum of 40 active/reserved projectile + hazard objects, with full-capacity rejection preserving the held charge;
- forward spawn approximately 1.75 m ahead at 14 m/s plus 0.35x inherited planar owner velocity capped at 12 m/s, and backward spawn approximately 1.75 m behind with 0.20x inherited planar velocity capped at 12 m/s;
- deterministic 6 m/s² planar drag and guardrail containment without rail-triggered detonation;
- exactly 3.0 race seconds of fuse time, frozen by pause;
- 0.35-second owner immunity, with other racers still eligible to trigger a qualifying early detonation and legal later owner self-hit/self-blast;
- early direct-impact detonation immediately below/at/above the 8 m/s planar relative-closing threshold;
- one-shot 4.0 m horizontal AoE, finished-racer exclusion, per-racer generic immunity, collateral/owner handling, and 1.20-second heavy spin without repeated overlap damage;
- queued synthetic 5 m Shockwave-clear queries resolving before Blast Orb movement/contact/fuse detonation in the same simulation step;
- restart, explicit removal, counter removal, detonation, and disposal returning hazard/item-physics counts and procedural resources to baseline;
- `?testItem=blast-orb` and opt-in `?testBlastOrbIncoming=1` isolation from normal distribution and AI inventory/tactics; and
- existing Nitro, Kinetic, Seeker, Apex, controller/camera/sprite, AI-race, probability, and runtime-asset regressions remain passing.

Focused deployed desktop/mobile live gate:

1. Forced Blast Orb pickup resolves correctly and successful ITEM use clears the one-slot inventory.
2. Forward use produces the approved short-range moving toss; backward modifier produces the slower drop.
3. Fuse visibly resolves at approximately three race seconds and freezes while paused.
4. A qualifying direct kart impact detonates early while light brush contact does not.
5. Blast radius/collateral behavior reads as approximately 4 m and applies the accepted 1.20-second heavy spin/chase/rear presentation.
6. Owner immunity prevents immediate self-hit while a later armed self-hit remains possible.
7. Incoming fixture presents a real Blast Orb and cleans up on restart without enabling AI tactics.
8. Normal unforced URL and accepted Nitro/Kinetic/Seeker/Apex behavior remain unchanged.

Record exact commit, CI/Pages run, desktop/mobile results, defects, and Manny's acceptance in `docs/IMPLEMENTATION-STATUS.md`. Passing this checkpoint closes only proven Blast Orb/hazard-foundation gates; it does not approve playable Shockwave, AI hazard avoidance, remaining items, or Slice 5 completion.

## Slice 4 AI/grid manual matrix

- Desktop/fine-pointer session: touch controls are absent; keyboard controls remain functional.
- Mobile/coarse-pointer session: touch controls appear only in gameplay and support simultaneous accelerate-plus-steer and drift-plus-steer input.
- Countdown prevents an early start and transitions through 3, 2, 1, and GO.
- Exactly seven visible opponents join the player, live position changes during overtakes, and collisions do not produce sustained vibration.
- The player identity is absent from the AI grid, all seven AI identities are unique, and repeated races vary the sampled roster.
- A sampled production identity displays its approved kart and rear driver frame. A sampled unfinished identity remains an explicit fallback and never borrows another character's art.
- AI racers follow the course, recover after displacement, overtake, and complete validated laps without player involvement.
- AI racers use visibly different road-bounded lanes, do not systematically cut inside corners through grass, and move laterally around slower racers instead of forming a permanent bumper-to-bumper queue.
- Player completion records a placement from first through eighth and presents standings.
- Drift tiers, boost pads, ramp/stunt boost, off-road floors, recovery, rear view, and three-lap validation regressions remain functional.

## Slice 3 Character Select and Lavi manual matrix

- Hub `Start Grand Prix` opens Character Select rather than starting the race immediately.
- Exactly twelve slots render; every production identity, including Alex at AA-01, displays its approved portrait. No roster placeholder remains.
- Selecting any slot updates its name, descriptor, six statistics, kart label, selected state, and race button without layout clipping.
- Lavi remains the default selection and `Race as Lavi` loads Potato rather than the procedural fallback kart.
- Potato reads as one opaque natural russet body with a continuous sculpted cockpit, rooted rear sprouts, connected wheels/axles, and no body clipping or translucency.
- Potato's steering wheel sits in front of Lavi, and its intended nose faces the race direction; a rear-camera check confirms the visual alignment is not reversed.
- Lavi's rear driver artwork sits convincingly in the cockpit without floating, clipping, or obscuring the kart silhouette.
- Lavi's five camera-facing frames use `[0, 0.9, -0.12]` so the upper body clears Potato's tall nose and the hands align with the modeled steering wheel. Toph's accepted `[0, 0.45, -0.12]` placement must not change.
- Holding visual left/right steering switches Lavi to the matching approved steer-left/steer-right frame within two rendered frames; releasing steering restores the rear frame.
- Collision impulse selects the approved hit frame briefly, and a completed player race selects the approved victory frame.
- Rear view preserves Lavi's steering, hit, and victory state through the four matching front-action frames from `lavi-runtime-20260902-5`.
- Lavi's commanded-left and commanded-right poses lean toward opposite camera sides. None of the four front-action sprites contains wheel or kart geometry; Potato supplies the only steering wheel.
- Lavi's AA-02 profile feels nimble and responsive and remains the controlled player kart throughout the race.
- The missing-asset test fixture starts the same race with the governed monogram/fallback kart and selected profile statistics; it does not borrow another production identity or final art.
- Simulated missing portrait replaces the image with the correct monogram; simulated missing GLB loads the fallback kart and does not crash or change physics.
- Desktop and mobile layouts expose all twelve slots, detail panel, back action, and race action without horizontal scrolling or controls hidden outside the viewport.

## Required runtime character-asset contract

Run this matrix for every future production character, in addition to its slice-specific checks:

- CI uses an LFS-materialized checkout, passes `git lfs fsck`, and the production build rejects a pointer or bad binary signature at each required kart path.
- The deployed response uses the current controlled asset revision (or changed filename), not a cached response from an earlier object.
- The selected production kart loads in the live deployment; a fallback kart is evidence of a failed delivery check, not a passing degraded experience.
- All six approved driver states are preloaded. Rear is the safe fallback; the reverse camera selects front, visual left/right select the matching steer frame, hit overrides steering briefly, and victory overrides normal driving after the player finishes.
- Chase and rear cameras confirm the kart’s nose and steering wheel face forward of the driver. Any visual-root rotation or other axis correction is recorded in that character’s record and asset brief.
- Every production GLB declares `extras.forward: "-Z"`, and every production manifest entry uses `NEGATIVE_Z_KART_VISUAL_YAW`. Automated checks must fail if either side of this orientation contract changes independently.
- Every active production character with GLB LODs must have all required LOD paths listed in `tools/verify-runtime-assets.mjs`. Manifest activation without corresponding runtime-gate coverage is an incomplete production checkpoint.
- A product-owner test on desktop and mobile confirms the portrait, controlled kart, driver states, and orientation. Record the tested deployment, commit, browser/device result, and limitations in implementation status.

## Keeg / Mycelial Majesty manual matrix

- AA-04 renders Keeg's approved portrait, Balanced Racer descriptor, and 7 / 7 / 5 / 7 / 5 / 5 statistics.
- `Race as Keeg` loads The Mycelial Majesty rather than the fallback kart.
- The approved purple-and-silver grand-tourer body, mushroom crest and fixtures, four connected wheels, open cockpit, and angled chassis-mounted steering assembly load without clipping or floating geometry.
- Keeg sits correctly in the cockpit with the steering wheel forward of the driver.
- Keeg's driving hands align with the steering-wheel center; the wheel must not cross his abdomen or float below his hands in chase view.
- All ten driver states load from `keeg-runtime-20260901-3`.
- Rear view preserves steering, hit, and victory through Keeg's matching front-facing action frames. The two steering silhouettes must read as opposite directions, and no Keeg front-action frame may contain wheel or kart geometry.
- Chase and rear views confirm the mushroom shield is at the race-forward nose and the exhausts remain behind Keeg.
- Keeg appears no more than once as an AI opponent when the player selects another character.
- CI materializes and validates all three AA-04 GLBs; each begins with the binary glTF signature and declares `extras.forward: "-Z"`.
- CI inflates every AA-04 PNG and validates its RGBA dimensions and PNG scanline filters; a header-only or partially decodable image must fail the build.
- Product-owner acceptance is recorded only after the deployed game confirms Keeg is selectable and all approved assets load as intended on desktop and mobile.

## Krios / Hornbreaker manual matrix

- AA-10 renders Krios's approved portrait, Straight-Line Heavy descriptor, and 10 / 4 / 9 / 3 / 4 / 6 statistics.
- `Race as Krios` loads The Hornbreaker rather than the fallback kart.
- The Hornbreaker's low broad chassis, integrated front ram horns, oversized studded tires, open cockpit, and twin rear exhausts load without clipping or detached housings.
- Krios sits correctly in the cockpit without floating or obscuring the kart silhouette.
- Rear, front, steer-left, steer-right, hit, and victory driver states load from the controlled Krios runtime revision.
- Rear view preserves steering, hit, and victory through Krios's matching front-facing action frames. No Krios frame contains wheel or kart geometry.
- Front-steer-left, front-steer-right, and front-victory retain two substantial transparent enclosed horn apertures; no pale or checkerboard matte remains between the horns.
- Chase and rear views confirm the integrated ram horns remain at the race-forward nose and the rear exhausts remain behind Krios.
- Krios appears no more than once as an AI opponent when the player selects another character.
- CI materializes and validates all three AA-10 GLBs: `kart.glb`, `kart-lod1.glb`, and `kart-lod2.glb`. Each must begin with the binary glTF signature and declare `extras.forward: "-Z"`.
- Product-owner acceptance is recorded only after the deployed game confirms Krios is present and all approved assets load as intended.

## Jennifer / Hearthwarden local integration matrix

- AA-12 renders Jennifer's approved portrait, All-Surface Heavy descriptor, and 8 / 5 / 8 / 4 / 4 / 7 statistics.
- `Race as Jennifer` loads The Hearthwarden rather than a placeholder or fallback kart.
- CI materializes and validates `public/assets/characters/aa-12/kart.glb`, `kart-lod1.glb`, and `kart-lod2.glb`. Each must begin with the binary glTF signature and declare `extras.forward: "-Z"`.
- LOD0, LOD1, and LOD2 remain within 25,000, 12,000, and 5,000 triangles while preserving the required thirteen-node hierarchy and one `SteeringWheel` node.
- Direct GLB review confirms that the tree-of-life medallion intersects its central pear-wood boss and paired bronze braces, and that every rear herb stem enters its remedy box.
- The kart-right dog perch, kart-left staff rack, wide tires, open cockpit, woven side panels, and rear exhausts remain attached at every LOD.
- All ten driver states load from `jennifer-runtime-20260903-2`; every frame is wheel-free and keeps the Newfoundland on Jennifer's physical right.
- `NEGATIVE_Z_KART_VISUAL_YAW` keeps the tree-of-life medallion at the race-forward nose and the remedy cargo behind Jennifer.
- Chase-facing position `[0, 0.92, -0.12]` seats Jennifer behind the rear structure without hiding her head, shoulders, or dog.
- Camera-facing position `[0, 0.84, -0.12]` and modeled-wheel position `[0, 1.86, -0.42]` place The Hearthwarden's single wheel between Jennifer's hands without covering her face.
- Product-owner acceptance is recorded only after the deployed desktop and mobile game confirms orientation, every driver state, cockpit occlusion, dog-side continuity, and single-wheel presentation.

## Dragon Queen / Sovereign Wyrm local integration matrix

- AA-06 renders Dragon Queen's approved portrait, Grip Specialist descriptor, and 6 / 6 / 5 / 7 / 5 / 7 statistics.
- `Race as Dragon Queen` loads The Sovereign Wyrm rather than a placeholder, Cleo, The Gilded Stitch, or a fallback kart.
- CI materializes and validates `public/assets/characters/aa-06/kart.glb`, `kart-lod1.glb`, and `kart-lod2.glb`. Each begins with the binary glTF signature and declares `extras.forward: "-Z"`.
- LOD0, LOD1, and LOD2 remain within 25,000, 12,000, and 5,000 triangles. Each retains the thirteen-node hierarchy and one `SteeringWheel` node.
- All ten driver states load from `dragon-queen-runtime-20260904-1`. Every frame remains free of kart and control geometry, keeps both wings visible, and shows exactly one long tail.
- `NEGATIVE_Z_KART_VISUAL_YAW` keeps the dragon shield at the race-forward nose and the open tail channel behind Dragon Queen.
- Chase-facing position `[0, 0.95, -0.12]` keeps the wings above the bodywork and seats the lower body behind the cockpit edge.
- Neutral, steer-left, hit, and victory camera-facing states use `[0, 0.84, -0.12]`; front-steer-right uses `[0, 0.80, -0.12]` to account for its higher foreclaw pose.
- The kart's single modeled steering control remains between Dragon Queen's foreclaws in front view without covering her face.
- Cleo's ten archived files at `public/assets/archive/characters/cleo-aa-06/` retain their recorded SHA-256 values and remain excluded from the active roster.
- Product-owner acceptance is recorded only after the deployed desktop and mobile game confirms orientation, every driver state, cockpit occlusion, visible wings and tail, and single-control presentation.

## Alex / Neon Vector production acceptance matrix

- AA-01 renders Alex's approved portrait, Feather Sprinter descriptor, and 6 / 9 / 2 / 8 / 7 / 4 statistics.
- `Race as Alex` loads The Neon Vector rather than the former AA-01 placeholder or a fallback kart.
- CI materializes and validates `public/assets/characters/aa-01/kart.glb`, `kart-lod1.glb`, and `kart-lod2.glb`. Each begins with the binary glTF signature and declares `extras.forward: "-Z"`.
- LOD0, LOD1, and LOD2 remain within 25,000, 12,000, and 5,000 triangles. Each retains the required thirteen-node hierarchy and one `SteeringWheel` node.
- All ten driver states load from `alex-runtime-20260905-1`. Every frame is character-only, wheel-free, 512 x 512 transparent sRGBA, and retains Alex's cyan/magenta cheek-node identity.
- `NEGATIVE_Z_KART_VISUAL_YAW` keeps The Neon Vector's triangle nose and twin violet exhausts race-forward and its cockpit-to-thruster conduits behind Alex.
- Chase-facing position `[0, 0.92, -0.12]` keeps Alex seated behind the cockpit edge. Camera-facing position `[0, 0.84, -0.12]` keeps the modeled wheel visible between her hands; no sprite-owned wheel is permitted.
- The approved Candidate 3 conduit pair remains structurally attached and readable in rear three-quarter and profile views; no floating hood emblem or steering-wheel intrusion is permitted.
- Manny confirmed the deployed desktop/mobile game against checkpoint `daf1e3127478981e40cca9533300f8617f61004d` on 2026-09-05. Selection, orientation, all ten driver states, cockpit occlusion, conduit visibility, one-hand steering silhouettes, torso rotation, and single-wheel presentation pass. Alex / The Neon Vector is live accepted.

## McFleurdel / Fleur de Nuit manual matrix

- AA-07 renders McFleurdel's approved portrait, High-Speed Cruiser descriptor, and 8 / 6 / 7 / 5 / 4 / 6 statistics.
- `Race as McFleurdel` loads The Fleur de Nuit rather than the fallback kart.
- The approved black body, raised silver fleur-de-lis, black nose shield, plum throne cockpit, attached silver trim, four connected wheels, ivory candles, and violet flames load without clipping or floating geometry.
- McFleurdel sits correctly in the cockpit with the steering wheel forward of the driver.
- All ten driver states load from `mcfleurdel-runtime-20260901-2`.
- Rear view preserves steering, hit, and victory through McFleurdel's matching front-facing action frames. Her front-action hair remains black on the viewer's left and white on the viewer's right.
- Front-steer-left and front-steer-right must expose transparent background inside the black-hair curls and behind both arms. Any connected pale matte component of 30 pixels or more in the reviewed gap regions fails the runtime gate.
- Chase and rear views confirm the fleur-de-lis shield is at the race-forward nose and exhausts remain behind McFleurdel.
- McFleurdel appears no more than once as an AI opponent when the player selects another character.
- CI materializes and validates all three AA-07 GLBs; each begins with the binary glTF signature and declares `extras.forward: "-Z"`.
- CI inflates and validates every AA-07 PNG as complete RGBA image data.
- Product-owner acceptance is recorded only after the deployed game confirms McFleurdel is selectable and all approved assets load as intended on desktop and mobile.

## Toph / Grave Shift manual matrix

- AA-08 renders Toph's approved portrait, Turbo Bruiser descriptor, and 7 / 5 / 7 / 4 / 8 / 5 statistics.
- `Race as Toph` loads The Grave Shift rather than the fallback kart.
- The approved purple-dominant armored body, bronze perimeter, low splitter, integrated sidepods, flat skull shield, angular thorn crown, enclosed rear engine, connected wide tires, and twin violet exhausts load without clipping or floating geometry.
- Toph sits correctly in the open cockpit with the steering wheel forward of the driver.
- All ten driver states load from `toph-runtime-20260902-2`.
- Rear view preserves commanded steering, hit, and victory through Toph's matching front-action frames. Commanded left and right lean toward opposite camera sides.
- Toph's front-action files have transparent corners and no retained checkerboard or pale fringe. None contains wheel or kart geometry; The Grave Shift supplies the only steering wheel.
- Chase and rear views confirm the skull shield remains at the race-forward nose and the enclosed engine/exhausts remain behind Toph.
- Toph appears no more than once as an AI opponent when the player selects another character.
- CI materializes and validates all three AA-08 GLBs; each begins with the binary glTF signature and declares `extras.forward: "-Z"`.
- CI inflates and validates every AA-08 PNG as complete RGBA image data.
- Product-owner acceptance is recorded only after the deployed game confirms Toph is selectable and all approved assets load as intended on desktop and mobile.

## Lula / Verdant Hart manual matrix

- AA-03 renders Lula's approved portrait, Feather Dirt Ace descriptor, and 5 / 8 / 3 / 7 / 6 / 7 statistics.
- `Race as Lula` loads The Verdant Hart rather than the fallback kart.
- The low living-root body, unified stag face, brow-mounted antlers, embedded green leaves, connected wheel housings, and restrained wooden outlets load without clipping or floating geometry.
- Lula sits correctly in the open cockpit with the steering wheel forward of the driver.
- Rear, front, steer-left, steer-right, hit, and corrected victory states load from `lula-runtime-20260830-2`.
- Chase and rear views confirm the stag face remains at the race-forward nose and the wooden outlets remain behind Lula.
- Lula appears no more than once as an AI opponent when the player selects another character.
- CI materializes and validates all three AA-03 GLBs; each begins with the binary glTF signature and declares `extras.forward: "-Z"`.
- CI inflates and validates every AA-03 PNG as complete RGBA image data.
- CI reconstructs every AA-03 PNG scanline and rejects any opaque neutral-white pixel outside the protected face/eye regions.
- Portrait and front remain the skin-tone authority; rear, steer-left, steer-right, hit, and victory must use the same pale neutral complexion without altering pose, clothing, hair, or alpha edges.
- The front-camera-only placement override must align Lula's hands with The Verdant Hart steering wheel without moving rear, steering, hit, victory, or AI states.
- Product-owner acceptance is recorded only after the deployed game confirms Lula is selectable and all approved assets load as intended on desktop and mobile.
- Manny confirmed the corrected live mobile deployment at checkpoint `ef74ca9eabb2a242c02d35d72c55377ee9b5529c` on 2026-08-30; the full Lula / Verdant Hart matrix passes.

## Mobile finish-state matrix

- Completing a race adds the `is-finished` state to the game shell before results become visible.
- Lap, time, speed, position, surface, performance, drift guidance, game help, and touch-driving controls leave the finished mobile view.
- The results card docks to the top of a portrait viewport and stays within 42% of the viewport height.
- Standings scroll inside their own compact region; they do not expand the card over the kart or victory driver frame.
- The lower chase-camera area remains unobstructed so the selected character's victory pose is visible.
- The results card stays above all retired touch targets, and Return to Hub remains reachable without scrolling the page.
- After the player finishes, the compact results panel leaves the live kart and victory pose clearly visible while all eight standings remain reachable.

## Race minimap matrix

- The rendered closed-course path is generated from Circuit Alpha's ordered samples, not a separately authored approximation.
- Track normalization preserves the course aspect ratio and keeps every point inside the padded SVG view box.
- Exactly eight markers appear during a full race: seven pixel-rendered head crops from approved driver portraits and one larger, gold-outlined player head drawn above them.
- Marker positions interpolate closed-course progress and wrap cleanly from progress 1 back to 0.
- Desktop places the map below the Lap HUD on the left without obscuring the track horizon, Surface HUD, or drift meter.
- Mobile reduces the map in the upper-left HUD column so it stays clear of Position, centered REAR/RESET controls, and bottom steering/action controls.
- Rear camera retains the minimap. The compact finish state hides it with the live HUD so it cannot obscure the victory pose or results controls.
- The static track path is written only when its shared topology reference changes; normal HUD updates move markers without rebuilding the SVG course every frame.

For live acceptance, complete at least one desktop and one mobile race. Confirm that all eight driver heads are recognizable, move continuously around the correct course shape, the player remains easy to identify in a cluster, mobile controls remain unobstructed, and the map disappears when results open.

## Shared driver-sprite state matrix

- Every active production driver supplies rear, front, steer-left, steer-right, hit, and victory as 512 x 512 transparent PNGs with transparent corners and no baked checkerboard or neutral-white background islands.
- The player and every production AI racer use the same state priority: victory, hit, front during rear view, steering, then neutral rear.
- Positive steering selects steer-left and negative steering selects steer-right for both player and AI racers; the dead zone returns to rear.
- A kart contact activates hit for every involved production driver, including AI-to-AI contacts, for the same governed reaction window.
- Each AI finisher activates victory independently of the player's finish state.
- Holding desktop or mobile rear view activates front for all visible production racers because the camera faces the fronts of their karts; releasing rear view restores each racer's simulation-driven state.
- While rear view is active, positive and negative steering select front-steer-left and front-steer-right, collision selects front-hit, and a finished racer selects front-victory. Direction names follow kart input direction rather than the viewer's mirrored screen side.
- During the character-by-character rollout, a missing front-facing action texture falls back to the approved neutral front frame. It must not select a rear-oriented action texture, fall back to rear, or blank the driver.
- All four front-facing action frames use the character's approved front placement and steering-control ownership. They must not move chase-oriented frames or introduce a duplicate wheel.
- Kraken's live pilot must select front-steer-left and front-steer-right for the matching kart input while rear view is held, select front-hit during contact, and retain the approved front-victory presentation after finishing.
- Releasing rear view during Kraken's steering or hit state must restore the matching chase-oriented action rather than leaving a front-facing frame active. All transitions must preserve his approved seated footprint, clean alpha edge, cockpit depth, and single modeled steering wheel.
- Accu's body remains behind Pink Precision's modeled steering control in neutral, turning, hit, and victory views. Her sprite contains no opaque white/checkerboard pixels inside steering-wheel openings.

Kraken live acceptance passed on 2026-09-01. Manny confirmed the requested steering, hit, victory, chase-state restoration, transparency, cockpit placement, and steering-wheel checks against deployed checkpoint `6b0b9239fa34edc521b4fa4e18a19a8397deaea3`.

Manaconda and Krios live acceptance passed on 2026-09-01 against deployed checkpoint `2ca852b47f16b8221275ee2b5542650d609b9a0d`. Manny confirmed both steering directions, hit, victory, chase-state restoration, transparency, cockpit placement, and steering-control ownership. Manaconda shows exactly one sprite-owned wheel. Krios uses The Hornbreaker's modeled wheel without a duplicate, and no pale matte remains between his horns.

Keeg and McFleurdel live acceptance passed on 2026-09-01 against deployed checkpoint `f8a2ed8be0d72fde62c9403dae4b15e94222f7da`. Manny confirmed both steering directions, hit, victory, chase-state restoration, transparency, cockpit placement, and steering-control ownership. Both drivers use their karts' modeled wheels without sprite duplicates. McFleurdel's reviewed black-curl interiors and arm gaps remain transparent.

Lavi and Toph live acceptance passed. Their eight deployed source hashes, controlled revisions, PNG decoding, transparent corners, and modeled-wheel ownership passed. Manny accepted Toph at `[0, 0.45, -0.12]` on 2026-09-02, then accepted Lavi's corrected `[0, 0.9, -0.12]` camera-facing placement on 2026-09-03. Both drivers pass steering-left, steering-right, hit, victory, chase restoration, transparency, cockpit placement, and single-wheel presentation.

Lula and Accu are the final front-action batch. Manny approved all eight candidates and the deployed desktop/mobile result on 2026-09-03. The live files preserve commanded-direction separation, forward-seated body orientation, identity locks, transparent corners and internal gaps, and modeled-wheel ownership without adding kart pixels. Lula retains `[0, 0.45, -0.12]`; Accu retains `[0, 0.9, 0.22]` and Pink Precision's front-only modeled-wheel position `[0, 1.46, -0.46]`.

PR #73 head run `33708240532` and main run `33708310011` passed. The merged checkpoint is `735da4015bca6f9610f6a358672804f4c73b35f9`. The live `assets/index-D84iBLTd.js` bundle exposes both controlled revisions and all eight action paths; all eight deployed PNG responses match the approved SHA-256 values. The runtime gate decodes 72 production PNGs. Review exports, discarded candidates, and Python caches remain outside the repository.

The 2026-09-03 local checkpoint passed `npm run validate`: strict typecheck, zero-warning lint, 16 Vitest files / 83 tests, 83.14% statement coverage, 27 materialized GLBs, 72 decoded PNGs, and a production Vite build. The source and built hashes match for all eight new frames, and the bundle contains both new revisions and all eight paths.

Live acceptance passed on 2026-09-03 against checkpoint `95fcf26fb699065cd9082951b3e8a3e18790e8a2`. Manny confirmed Lula and Accu's steering-left, steering-right, hit, victory, chase restoration, transparency, cockpit placement, and single-wheel presentation. This closes the front-facing action-state rollout for all nine active production drivers.

## Manaconda / Wayfinder manual matrix

- AA-09 renders Manaconda's approved portrait and identifies the kart as The Wayfinder rather than a placeholder or fallback prototype.
- `Race as Manaconda` loads the wheel-free Wayfinder and the approved rear driver frame; no second modeled steering wheel appears.
- Manaconda sits within the recessed cockpit without floating or clipping, and the wheel contained in each driver frame reads in front of him.
- Visual left/right steering selects the matching approved frame; collision selects hit briefly; finishing selects victory.
- Rear view preserves steering, hit, and victory through Manaconda's matching front-facing action frames. Each contains exactly one visible wheel, and The Wayfinder adds no modeled duplicate.
- Chase and rear cameras confirm Wayfinder's grille/navigation core points forward and the rear satchel/twin exhausts remain behind Manaconda. No 180-degree visual correction is applied.
- The selected AA-09 profile remains 7 / 6 / 6 / 6 / 6 / 5 throughout the race.
- Desktop and mobile both load the controlled `manaconda-runtime-20260831-2` URLs rather than cached pre-integration assets.

## Accu / Pink Precision manual matrix

- AA-11 renders Accu's approved portrait and identifies the kart as Pink Precision rather than a placeholder or fallback prototype.
- `Race as Accu` loads Pink Precision and the approved rear driver frame. The compact armored hull, continuous treads, cannon, and heart-bullseye emblem remain visible.
- Accu sits inside the cockpit without floating or clipping. The 3D steering wheel stays in front of her and does not conflict with the driver art.
- In chase view, Accu's rear hair remains continuous into the cockpit; no straight raster edge is visible across the hair or torso above the cockpit rim.
- In rear-camera view, the front frame reads as one seated driver with visible upper-body context rather than a detached face behind the cannon. The cannon may occlude the centerline, but it must not erase the body or separate the head from the cockpit.
- In rear-camera view, Pink Precision's dark steering-wheel ring is visibly readable between and beneath Accu's hands. It must not disappear behind the front sprite, merge with the cockpit collar, or render during chase-oriented states whose approved art already contains a wheel.
- Visual left/right steering selects the matching approved frame; collision selects hit briefly; finishing selects victory.
- Chase and rear cameras confirm the cannon and nose point forward while the antennae and exhausts remain behind Accu. No visual-root rotation is applied.
- The selected AA-11 profile remains 8 / 4 / 10 / 3 / 5 / 6 throughout the race.
- **Live acceptance:** Manny approved deployed PR #56 on 2026-08-31 after verifying the corrected chase-camera hair edge and rear-camera steering-wheel presentation. The previously accepted grass relaunch and chase-state modeled-wheel suppression remain passing.
- Desktop and mobile both load the controlled `accu-runtime-20260831-2` URLs rather than cached pre-integration assets.

## Slice 0 evidence boundary

Slice 0 validates only installation, typechecking, linting, unit testing, production build, the minimal app shell, repository organization, and CI. It does not validate rendering, physics, controls, AI, racing, items, audio playback, or performance requirements assigned to later slices.

## Slice 5 item-system validation matrix

This matrix is required in addition to the repository-wide validation commands and the complete approved checklist in `docs/SLICE-5-ITEM-SYSTEM-DESIGN.md`.

### Distribution and inventory

- Every configured rank column must sum to exactly 100 before dynamic adjustment.
- Use a deterministic seedable selector and run at least 100,000 simulated selections for each rank. Record observed percentages and expected percentages. Common-item absolute deviation should remain within approximately 0.5 percentage points unless a documented goodness-of-fit test is used instead.
- Verify the documented 1.00-1.35 gap multiplier and renormalization after dynamic catch-up adjustment.
- Verify prerequisites are filtered before selection: Apex global availability and cooldown; Hyper-Drive position 6-8 plus at least 45 m behind the leader; any unavailable runtime prerequisite.
- Verify one-slot inventory, multi-charge counts, collection-time outcome lock, approximately 0.85-second roulette, occupied-inventory pass-through, and approximately 4.5-second shared-box respawn.
- Verify all four rows contain eight boxes in the legal racing corridor near 9%, 34%, 62%, and 89% lap progress.

### Item functional and counter matrix

- Kinetic Disc: forward/backward launch, governed travel, no more than three wall ricochets, standard spinout, hit destruction, nine-second lifetime cleanup.
- Seeker Drone: nearest valid racer ahead by race progress, 0.5-second arming, bounded turn, no teleport, warning cue/state, twelve-second maximum cleanup.
- Apex Missile: one active globally, minimum 18-second global interval, current leader at terminal lock, warning/sky/dive phases, 5.5 m AoE, heavy spin, Prismatic immunity, and precisely timed Shockwave terminal counter.
- Blast Orb: directional deploy, three-second fuse, qualifying early direct-impact detonation, 4 m AoE, heavy spin, Shockwave cleanup.
- Blaze Orbs: five charges, at least 0.55 seconds between shots, short 0.55-second spin, expiry cleanup.
- Frost Orbs: three charges, approximately 55% momentum retention and approximately 20% handling penalty per valid hit, with repeat-hit stacks and a shared 1.2-second timer reset by each subsequent hit.
- Arc Blade: three charges, curved outbound/return path, at most one rival hit outbound and one on return per throw, no repeated overlap damage.
- Arc Hammers: five charges, at least 0.35-second cadence, ballistic movement, one terrain bounce, short post-bounce expiry.
- Slick: rear drop, approximately 12-second lifetime, approximately 1.1 m trigger, approved 360-degree spin/60% speed-retention effect, two active per owner, Shockwave cleanup.
- Shockwave: approximately 5 m radial push and destruction/clearing of all supported ordinary projectiles, Slicks, Blast Orbs, and terminal Apex.
- Ink: approximately 2.5-second partial human screen obstruction; AI path noise, approximately 80 ms reaction latency, and reduced precision without navigation failure.
- Nitro Surge: approximately 2.4-second active window, 1.18x cap target, 1.50x acceleration authority, off-road penalty ignore, clean restoration.
- Nitro Overdrive: six-second window, pulse no faster than every 0.75 seconds, approximately 0.9-second pulse, 1.15x initial cap target, clean window expiry.
- Hyper-Drive Rocket: position/gap prerequisite, legal Circuit Alpha spline autopilot, immunity, approximately 1.25x initial cap target, automatic overtakes, maximum approximately six seconds, approximately 0.3-second control return, no teleport/progress mutation/direct first-place deposit.
- Prismatic Invincibility: approximately six seconds, +12% speed, hazard/projectile immunity, hostile-contact spin, expiry warning/restoration.

### Input, AI, race authority, and pause

- Left Shift and E both activate held items.
- S/Down plus item requests backward deployment where supported.
- Coarse-pointer gameplay exposes a dedicated ITEM button; Brake/Reverse plus ITEM requests backward deployment where supported. Verify simultaneous accelerate/steer/drift combinations remain functional.
- AI must acquire and use items tactically. Validate Seeker range, rear-attacker Slick use, defensive Shockwave hold/use, Nitro straight/recovery preference, and prompt Rocket activation.
- AI obstacle awareness must include Slicks and Blast Orbs.
- Seeker/Apex targeting must use validated race progress, not visual proximity alone.
- Item effects may not directly edit checkpoint sequence, lap count, race rank authority, or finish placement. Hyper-Drive must earn progress through legal movement/checkpoint traversal.
- Pause must freeze roulette, arming, fuses, projectiles, hazards, buffs/debuffs, item windows, respawn/cooldown timers, AI item decisions, and related audio progression as appropriate.

### Lifecycle, soak, and performance

- Track active item runtimes, projectile bodies/colliders, hazards, VFX emitters, listeners, timers, and audio voices through repeated use and restart/disposal.
- No object may survive impact/completion/expiry without a documented state reason. Race restart/disposal must return item runtime counts to baseline.
- Enforce the PRD maximum of 40 simultaneous active physics projectiles.
- Instrument item/VFX CPU update cost against the approximately 1.0 ms budget and confirm no NaN/infinite transform under collision/item stress.
- Run existing Speed, Acceleration, Weight, drift, surface, AI, lap, recovery, camera, minimap, and driver-state regression suites unchanged.

### Live Slice 5 acceptance

Desktop and mobile must both verify item-box pickup/respawn, roulette, HUD icon/count, keyboard/touch item input, backward use, representative offensive/defensive/catch-up interactions, AI item use, pause/restart cleanup, and that existing race controls remain usable. Record the deployed commit, CI/deployment run, browser/device evidence, defects, and Manny's explicit acceptance in `docs/IMPLEMENTATION-STATUS.md` before Slice 5 can close.

## Slice 5 Kinetic Disc / guardrail acceptance

Automated and live validation for the Kinetic Disc checkpoint must verify:

- `?testItem=kinetic-disc` deterministically grants the player Kinetic Disc while the normal URL remains unforced.
- Forward and backward launch both consume the single charge only after a projectile spawns.
- Travel uses the governed approximately 42 m/s base speed (amendment 2.5), approximately 0.32 m radius, nine-second lifetime, bounded inherited velocity, and short owner arming immunity.
- The projectile visibly reflects from Circuit Alpha guardrails using the contact normal, never exceeds three successful ricochets, destroys on the next wall contact after the third bounce, and destroys immediately on racer hit.
- After arming, a returning ricochet can hit its owner.
- Player and AI racers are physically constrained by the same continuous guardrail boundary; a meaningful rail impact reflects inward, loses bounded speed, and shows a brief existing hit reaction without starting an item spinout.
- Kinetic racer impact applies one full visible yaw spin across approximately 0.85 seconds and suppresses driving controls for the effect window without mutating lap/checkpoint state.
- In chase view, the camera remains on the pre-impact travel heading while the kart spins; the driver switches between approved `hit` and `frontHit` frames according to the kart's actual orientation to the camera.
- Repeat the same spinout-facing check while holding rear view. The camera remains on the opposite side of the held travel heading, and the 2D asset must remain perspective-correct throughout the rotation.
- AI racers hit by a Kinetic Disc use the same 0.85-second spin and hit/front-hit facing rule when visible from either player camera.
- Pause freezes item/effect simulation. Restart/disposal returns projectile/effect counts to baseline with no surviving projectile meshes, geometries, materials, listeners, or timers.

Recovery regression coverage also checks both rail sides at all 384 track samples, oblique reflection without overlap bounce spam, zero-time pause, failed-spawn/capacity inventory retention, the 40-projectile ceiling, deterministic effect refresh/disposal, half-turn then full-turn controller motion under held inputs, clean acceleration recovery, rear-view switching during an anchored spin, and hit-art priority through a finish-line crossing.

## Kinetic Disc speed correction regression gate

Use the actual 42 m/s registry config and bounded inherited velocity. Forward launch from a fast kart must reach approximately 44.8 m/s; backward launch from rest is -42 m/s along the owner's forward axis. The moving-target regression advances targets at the actual Manaconda and Krios normal maximums, plus Krios with the 1.04 maximum AI allowance, from a 30 m initial gap on a clear straight and requires successful interception within three seconds. This uses an analytic straight-corridor fixture with the real projectile and shared guardrail contact math to isolate closing speed; it is not a guarantee of hits through turns or intervening obstacles. A shallow-angle Circuit Alpha trace must retain projectile speed, normal ricochets, valid same-side contacts, and eventual cleanup. All existing item/guardrail/spinout/camera/sprite gates must still pass.

After approved corrective deployment, use `?testItem=kinetic-disc`: confirm clearly faster catch-up against full-speed rivals, inspect ordinary angle-based ricochets with no guaranteed opposite-rail crossing, and briefly recheck the previously passed spinout/camera behavior. Verify the normal URL remains unforced. The other passed PR #104 checks remain accepted unless a regression is observed; do not start the next item until this focused gate passes.

The focused Kinetic correction gate above **passed on 2026-09-06**: deployed PR #105 / `1497672c639adaf6ca71f2aa775d4e0c23572b33`, CI/Pages run `34034999554`, and Manny's [final acceptance comment](https://github.com/Manaconda33/manacondas-minigame-mayhem/pull/105#issuecomment-5559436832). Earlier pending-gate wording describes the test procedure, not the current acceptance state. Issue #106 is future development and does not invalidate this result.

The approved Seeker increment is implemented under amendment 2.6. Its automated evidence and subsequently accepted live gate follow.

## Seeker Drone checkpoint

`tests/seeker-drone.test.ts` and `tests/seeker-warning-audio.test.ts` cover nearest-ahead lap/progress and stable ties, offset finish-gate wrap, unchanged input race state, selection eligibility, unsuccessful-use charge retention, successful forward launch, full-speed Manaconda/Krios/max-AI catch-up, five real Circuit Alpha pursuit paths, bounded speed/acceleration/turning, arming, owner interception, rail destruction, target finish/removal, lifetime, shared cap, disposal, warning escalation/overlap/cleanup, volume/pause/browser audio fallback, and explicit incoming-fixture isolation. Full local gate on 2026-09-07: **30 files / 181 tests passed**. Existing Kinetic, Nitro, spinout/camera, AI, and runtime-asset tests also pass.

After separately approved gameplay deployment, use:

- Outgoing pickup test: `https://manaconda33.github.io/manacondas-minigame-mayhem/?testItem=seeker-drone`
- Incoming warning/impact test: `https://manaconda33.github.io/manacondas-minigame-mayhem/?testSeekerIncoming=1`
- Combined test: `https://manaconda33.github.io/manacondas-minigame-mayhem/?testItem=seeker-drone&testSeekerIncoming=1`
- Normal selection: `https://manaconda33.github.io/manacondas-minigame-mayhem/`

These URLs now serve the Seeker runtime from PR #108 merge `ef5dbaeccde123faedd00f625cf18e32c07875de`; post-merge CI/Pages run `34086473571` passed. Manny passed the six checks below and accepted continuation on 2026-09-07. The incoming fixture fires after five race seconds and every sixteen seconds thereafter, from 45 m behind the player along the route; an intervening racer or guardrail may intercept it normally. Drive forward to observe the full warning progression; stop on a clear straight to verify impact. Its badge explicitly identifies incoming test mode.

Focused desktop/mobile live gate:

1. Acquire Seeker, resolve roulette, and use Left Shift/E or mobile ITEM. Forward pursuit is visible; holding reverse does not fire Seeker backward. Successful launch frees the slot.
2. From behind rivals, confirm nearest-ahead selection and readable catch-up on straight/curved sections. Confirm rail collision destroys the drone; shots are not guaranteed hits.
3. From first with forced Seeker, use it with no rival ahead: feedback says no racer ahead, the charge remains held, and occupied-slot pickup stays blocked.
4. In incoming mode, confirm target marker, escalating HUD warning and tone, master-volume silence/restoration, and clean pause/resume. Pausing during a tone stops audio immediately. The marked fixture is absent from a normal URL.
5. Let an incoming drone hit: confirm the accepted 0.85-second spinout and chase/rear perspective-correct driver art. Confirm warning cleanup after impact/expiry and on return to hub/restart.
6. Briefly recheck accepted Kinetic/Nitro behavior and the normal unforced selector. Prior acceptance remains valid unless an actual regression is observed.

Seeker is live accepted. The lap-2 disappearance investigation found plausible interception/obstacle causes without identifying the cause of Manny's specific shot. He chose to continue; diagnostic PR #109 is closed unmerged and no additional retest is required for this acceptance. Preserve these scenarios for regression checks. Issue #106 remains a separate future-development defect.

## Apex Orbital Missile core checkpoint

`tests/apex-missile.test.ts` covers leader/tie/lap targeting, owner targeting and finish, target loss, inventory success/rejection/rollback, same-step competing holders, shared capacity, launch-time cooldown, pause/reset, phase timing, bounded sky/dive motion, lifetime, blast boundaries/collateral/immunity, terminal-only 3D pulse ordering, explicit incoming fixture, and 100-lifecycle resource cleanup. It uses five real Circuit Alpha moving-leader paths. The audio ownership suite runs the same volume/pause/gesture/disposal checks for both Seeker and Apex and verifies their distinct tone profiles.

Live Apex core acceptance URLs for deployed PR #111:

- Outgoing pickup: `https://manaconda33.github.io/manacondas-minigame-mayhem/?testItem=apex-missile`
- Incoming leader attack: `https://manaconda33.github.io/manacondas-minigame-mayhem/?testApexIncoming=1`
- Normal selection: `https://manaconda33.github.io/manacondas-minigame-mayhem/`

**These links serve the live-accepted Apex core from PR #111 merge `5f37923d2ea64c9e4e95baafb1eee356f5cf114b`; post-merge CI/Pages run `34128841767` passed validation and deployment.** The incoming fixture starts after five race seconds and obeys the actual shared 18-second launch gate. It targets the current leader, not automatically the player: drive into first to receive warning/dive/impact. A marked test badge identifies it. Forced pickup does not bypass launch prerequisites.

Core desktop/mobile acceptance:

1. Acquire/use Apex: vertical launch and readable sky travel; reverse input still launches upward; successful use frees the slot.
2. Verify current leader at terminal lock; changes before lock are followed, changes after lock preserve identity; a firing owner who becomes leader can be attacked.
3. Drive in first in incoming mode: verify target marker, HUD, distinct warning tone, 1.9 s overhead plus 0.6 s dive, master volume, pause and cleanup.
4. Verify 5.5 m blast/collateral feel and 1.20 s heavy spin using accepted chase/rear camera and hit/front-hit art.
5. Attempt held Apex while another is active or cooldown remains: charge stays held with feedback, then fires when eligible; restart resets the gate.
6. Recheck normal unforced selection, accepted Seeker/Kinetic/Nitro, ordinary lap progression and restart/return-to-hub cleanup.

**Apex core live acceptance passed on 2026-09-07.** Manny passed all outgoing checks, all incoming checks, and the normal governed-game regression against deployed PR #111 / `5f37923d2ea64c9e4e95baafb1eee356f5cf114b`. Product-owner evidence is recorded on PR #111.

Record **core live acceptance separately**. Synthetic immunity/pulse tests do not close real Shockwave/Prismatic cross-item or live counter acceptance. General AI tactics, final Slice 5 soak/performance gates, and Slice 6 remain outstanding. Issue #106 remains deferred and nonblocking.

## Slice 5 seeded item-distribution evidence

The reproducible distribution gate is implemented in `tests/item-distribution.test.ts`. It runs the production selector **100,000 times for each race rank (800,000 selections total)** using fixed Mulberry32 seeds `0x5A17C001` through `0x5A17C008`. Ranks 1-5 use a 0 m leader gap. Ranks 6-8 use exactly 45 m so Hyper-Drive is eligible and the approved 1.18 gap weighting is active. Apex availability is true. Each eligible item must remain within **0.5 percentage points** of the effective normalized weight and every zero-weight item must remain unselected.

Hosted PR #114 CI run **34139123888** on `94e90a7a8adfbe107dbd2095cae706596a1be7bc` passed the distribution test as part of the complete CI test step. The largest absolute deviation was **0.315 percentage points**. The durable counts/report are in `docs/SLICE-5-ITEM-DISTRIBUTION-REPORT-2026-09-07.md`. Re-run this test unchanged whenever selector logic, the rank matrix, dynamic gap weighting, or runtime eligibility changes; any intentional governed change must update the report and approval record rather than silently changing the seed/tolerance.

## HazardSystem + Timed Blast Orb checkpoint

`tests/blast-orb.test.ts` verifies forward/backward inventory use, capped inheritance and deterministic drag, invalid/full-capacity rollback, 40 mixed projectile/Apex/hazard slots, 3.0-second fuse/pause, below/at/above 8 m/s direct closing speed, separating/tangential contact rejection, owner exclusion before 0.35 s and legal later self-hit, once-only 4 m AoE/finished/immunity boundaries, rail containment, five actual Circuit Alpha paths, 5 m horizontal clear priority at imminent detonation, explicit incoming isolation/retry/one-shot behavior, and 100 resource-cleanup cycles. The accepted distribution test remains unchanged.

Local full gate passes **33 files / 233 tests**, **92.03% statement coverage**. Hosted clean-install CI and exact checkpoint SHA must pass before gameplay publication review.

After approved deployment, use:

- Outgoing pickup: `https://manaconda33.github.io/manacondas-minigame-mayhem/?testItem=blast-orb`
- One incoming orb: `https://manaconda33.github.io/manacondas-minigame-mayhem/?testBlastOrbIncoming=1`
- Normal selection: `https://manaconda33.github.io/manacondas-minigame-mayhem/`

**Blast gameplay is not deployed yet.** The incoming fixture places one orb 8 m ahead on the legal route after five race seconds. Drive forward for an early-impact review; restart to repeat. It does not consume AI inventory or enable AI tactics. Forced pickup and the incoming fixture are independently opt-in and visibly marked.

After publication, perform the eight desktop/mobile live checks in `docs/SLICE-5-BLAST-ORB-SCOPE.md`: pickup/charge, forward toss versus backward drop, fuse/pause, strong versus light contacts, 4 m blast and heavy spin/chase/rear, owner immunity/later self-hit, incoming/restart, and normal-URL accepted-item regressions. Record the deployed commit, CI/Pages result and Manny's feedback before marking Blast live accepted. Real Shockwave/Prismatic interactions, AI Blast/Slick avoidance, issue #106 and Slice 6 remain deferred.

## Slice 5 Slick Trap checkpoint

Automated evidence for approved PRD amendment 2.9 / ADR-070 must confirm:

- rear-only deployment for both forward and backward ITEM intents, stationary approximately 1.75 m placement, zero inherited velocity, and guardrail inward containment without deletion or trigger;
- shared 40-object capacity, failed-use charge preservation, two-per-owner cap, successful-third FIFO oldest replacement, and atomic failure preserving both existing Slicks;
- exactly 12 race seconds of lifetime with pause freeze;
- 0.35-second owner immunity, immediate rival eligibility, legal later self-trigger, unfinished-racer filtering, and generic immunity suppressing the trigger while leaving the Slick in place;
- trigger boundaries immediately below/at/above 1.1 m and one-shot removal before effect resolution;
- exactly 60% planar speed retention without accidental speed gain or extra standard/heavy momentum decay, plus one 360-degree / 0.85-second hostile-spin presentation with control suppression and accepted chase/rear `hit` / `frontHit` behavior;
- no repeated-overlap effect or stacked yaw rates;
- queued synthetic 5 m Shockwave clear removing both Slick and Blast Orb before same-step hazard trigger/detonation processing;
- expiry, explicit removal, counter removal, restart, return-to-hub, and disposal returning hazard/capacity/VFX counts to baseline;
- `?testItem=slick-trap`, opt-in `?testSlickAhead=1`, visible test-mode indication, fixture restart reset, AI-inventory/tactics isolation, and normal-URL isolation; and
- accepted Nitro/Kinetic/Seeker/Apex/Blast behavior, probability-selector evidence, controller/camera/sprite, AI-race, and runtime-asset regressions remain passing.

Focused deployed desktop/mobile live gate:

1. Forced Slick pickup resolves correctly and successful use clears the one-slot inventory.
2. Normal ITEM and Brake/Reverse + ITEM both drop the Slick behind the kart; neither creates a forward throw.
3. The Slick remains fixed/readable, expires at approximately 12 race seconds, and freezes under pause.
4. Crossing the approximately 1.1 m trigger applies one readable 360 spin with roughly 60% carried speed and correct chase/rear driver art.
5. Immediate owner spawn overlap does not self-trigger; returning after 0.35 race seconds can trigger the owner's own Slick.
6. Two active Slicks coexist for one owner; a third successful placement replaces the oldest and never leaves three active.
7. `?testSlickAhead=1` presents a real victim-side Slick and restart removes/resets the fixture cleanly.
8. Normal unforced gameplay and accepted Blast/Nitro/Kinetic/Seeker/Apex behavior remain unchanged.

Record exact commit, hosted CI/Pages run, desktop/mobile results, defects, and Manny's acceptance in `docs/IMPLEMENTATION-STATUS.md`. Passing this checkpoint closes only the Slick functional gate proven by the deployed implementation. AI Blast/Slick avoidance, playable Shockwave, real Prismatic/Hyper-Drive interaction acceptance, remaining items, final Slice 5 soak/performance, and Slice 6 remain separate gates.

## Slick Trap implementation evidence — 2026-09-07

Governance baseline: PR #119 merge `2ce2212e5d89e192b9118ec07c655bacefbdf45a`, post-merge CI/Pages `34151395918` passed. Manny explicitly authorized the gameplay implementation.

`tests/slick-trap.test.ts` covers both ITEM directions, inventory consumption/failure, invalid launch data, 40 mixed slots, full-budget FIFO replacement, owner independence, failed/throwing commit rollback, rail containment, lifetime/pause, exact owner/trigger boundaries, immunity/finished filtering, one-shot cleanup, generic horizontal clear ordering, repeated resource disposal, fixture isolation/restart and real Circuit Alpha raised-surface placement. `tests/kart-controller-effects.test.ts` verifies zero/near-zero/moving 60% retention, one 360-degree spin across 51 fixed steps, control suppression, no additional planar decay, hostile-spin refresh, camera-heading stability and both hit/frontHit states. The existing accepted-item and rank-distribution suites remain required.

Clean local `npm ci --prefer-offline --fetch-retries=0` installed 198 packages successfully. Full `npm run validate` passed strict typecheck, zero-warning lint, **34 files / 254 tests**, **92.42% statement coverage**, branding/runtime-asset checks and production build. `git diff --check` and `git lfs fsck` passed. Hosted clean-install PR CI remains required before publication review. After separately approved deployment, use:

- Outgoing: https://manaconda33.github.io/manacondas-minigame-mayhem/?testItem=slick-trap
- Incoming: https://manaconda33.github.io/manacondas-minigame-mayhem/?testSlickAhead=1
- Normal: https://manaconda33.github.io/manacondas-minigame-mayhem/

These links do not provide this gameplay until the gameplay PR is merged and its Pages run passes. Complete the eight Slick deployed checks above on desktop/mobile; include patch visibility on road, dirt, boost pads and the ramp. Automated camera/state checks are not a claim of live visual acceptance. Playable Shockwave, real Prismatic/Hyper-Drive interactions and AI hazard response remain separate gates.

## Slice 5 AI Slick/Blast hazard-response acceptance

The approved PRD amendment 2.10 / ADR-071 increment is limited to AI movement response to the already accepted Slick Trap and Timed Blast Orb hazards. Full AI item acquisition/use remains a separate later Slice 5 gate.

Automated evidence must verify route-relative wrapped forward distance, route-distant false-positive rejection, the 20 m lookahead, 2.5 m Slick and 4.5 m Blast planning boundaries, 0.5 s drag-aware Blast prediction capped by fuse, deterministic left/right and boxed-in lane selection, coexistence with nearby-racer avoidance, the 0.6 race-second clear hold, gradual preferred-lane recovery, pause freeze, hazard removal/expiry cleanup, restart/disposal cleanup, fixture isolation, no lap/checkpoint mutation, unchanged Speed-stat/rubber-band/controller authority, existing three-lap AI integration, finite transforms, road/grass bounds, accepted-item regressions, and probability-selector regressions.

Before publication review run clean `npm ci`, `npm run validate`, `git diff --check`, Git LFS verification, and hosted PR CI.

Deployed acceptance must verify:

1. `?testAiHazardAvoidance=slick` produces a visible bounded avoidance attempt before the real Slick when a clear lane exists, without teleport/snapping.
2. The AI returns gradually after the Slick passes or is removed.
3. `?testAiHazardAvoidance=blast` produces a visible route/lane response to the accepted Blast Orb before detonation when geometry permits.
4. Avoidance remains road-bounded without obvious grass-cutting, wrong-way behavior, recovery loops, or collision deadlock.
5. Other AI racers retain character-Speed-governed race behavior and believable nearby-racer avoidance.
6. Pause/restart freezes or clears fixture/avoidance state correctly.
7. Normal unforced gameplay contains no fixture badge or forced hazard behavior.
8. Accepted Nitro, Kinetic, Seeker, Apex, Blast Orb, and Slick Trap behavior remains unchanged.

Record exact implementation commit, hosted CI, post-merge CI/Pages, live desktop/mobile results, defects, and Manny's acceptance in `docs/IMPLEMENTATION-STATUS.md`. Passing this increment closes only AI Blast/Slick movement-response evidence actually proven; it does not close full AI item tactics, remaining items/counters, issue #106, final soak/performance, overall Slice 5 acceptance, or Slice 6.

## AI hazard-response implementation evidence — 2026-09-08

PR #122 merged at `a782ee0996e032ffae06cb41dddafc7e62eed08c`; post-merge CI/Pages run `34157568033` passed. Manny explicitly authorized the bounded gameplay implementation.

Clean local `npm ci --prefer-offline --fetch-retries=0` installed 198 packages. Full `npm run validate` passed strict typecheck, zero-warning lint, **36 files / 278 tests**, **92.75% statement coverage**, branding/runtime-asset checks and production build. `git diff --check` and `git lfs fsck` passed. Hosted PR CI is recorded in the gameplay PR before publication review.

`tests/ai-hazard-awareness.test.ts` covers wrapped route detection and the 20 m boundary, nearby route-distant rejection, both planning-footprint boundaries, drag/fuse prediction, owner-immunity exemptions, deterministic lane decisions, boxed-in clearance, racer coexistence, pause/hold/reset, detached snapshots and lifecycle removal, fixture capacity retry and normal-URL isolation. `tests/ai-hazard-response.integration.test.ts` runs four real Circuit Alpha/Rapier steering trajectories (both hazard types, left/right preferred lanes), verifying bounded displacement, road bounds, finite state, physical deviation and normal-lane recovery. These trajectories isolate movement response; they do not assert immunity or guaranteed collision avoidance. Existing three-lap AI, Speed-stat, accepted-item and rank-distribution suites pass unchanged.

After separately approved merge and successful Pages deployment, complete the eight AI hazard-response deployed checks above on desktop/mobile:

- Slick: https://manaconda33.github.io/manacondas-minigame-mayhem/?testAiHazardAvoidance=slick
- Blast: https://manaconda33.github.io/manacondas-minigame-mayhem/?testAiHazardAvoidance=blast
- Normal: https://manaconda33.github.io/manacondas-minigame-mayhem/

No live acceptance is claimed. Full AI item tactics, remaining effects/counters, issue #106, final soak/performance and Slice 6 remain separate gates.

## Slice 5 Acoustic Shockwave Pulse checkpoint

Visibility regression: successful activation must put the ring above the existing rendered supporting surface, including dirt, boost pads and the ramp, rather than below the chassis. `tests/shockwave.test.ts` checks surface-normal placement and in-frustum above-surface vertices with production chase/rear camera geometry in portrait and landscape. It also verifies that presentation placement cannot move the gameplay pulse center. These geometric tests do not prove pixel contrast or visibility around kart meshes: after deployment, explicitly repeat moving/stationary activation in both cameras on desktop/mobile, including no nearby racer, pause/resume, and raised surfaces. Confirm the charge disappears and a cyan ring expands and fades; do not mark Shockwave live accepted on automated lifecycle counts alone.

Automated evidence for PRD amendment 2.11 / ADR-072 must confirm:

- one committed Shockwave consumes one charge even when no target is in range; invalid/paused/finished-racer activation cannot create duplicate pulses;
- forward and backward ITEM intent produce the same centered radial pulse;
- horizontal X/Z radius boundaries immediately below, at, and above 5.0 m are deterministic for racers, ordinary projectiles, Slicks, and Blast Orbs regardless of vertical separation;
- eligible racer push adds an outward planar velocity delta that is 6.0 m/s at the center, 4.0 m/s at 2.5 m, and 2.0 m/s at 5.0 m, with a finite deterministic coincident-center fallback and no conventional spinout, teleport, or progress mutation;
- owner, finished-racer, out-of-radius, and generic item-immunity cases are not pushed, and live target snapshots carry that immunity state;
- Kinetic Disc and Seeker Drone objects inside 5.0 horizontal meters are destroyed before they can move or impact in that simulation step, while objects outside the horizontal radius remain active;
- queued Slick Trap and Timed Blast Orb clears use horizontal X/Z distance, resolve before hazard trigger/contact/fuse processing, and preserve shared-capacity accounting;
- only terminal/dive Apex inside the existing 5.0 m 3D counter radius is neutralized; rise/sky/warning phases and out-of-radius terminal Apex remain active;
- accepted Nitro/Kinetic/Seeker/Apex/Blast/Slick behavior, probability selection, Slick/Blast AI hazard response, racer stats, checkpoints/laps, camera/driver states, and the 40-object shared capacity remain regression-clean;
- pressure-ring presentation is finite, pause-safe, restart-safe, and disposal-safe; and
- the live counter links combine `?testItem=shockwave&testShockwaveCounter=racer|kinetic|seeker|slick|blast|apex`; the first parameter statically forces the player's next pickup and the second selects exactly one counter fixture, without altering normal distribution or enabling AI tactics;
- each counter fixture waits until the forced Shockwave is revealed and held before it becomes actionable. Kinetic approaches from 18 route meters behind, Seeker from the proven 45 m route, Slick/Blast sit 3.5 m inward from the player's current lane, and Apex launches only while the player is the current race leader;

Focused deployed desktop/mobile live gate after an approved gameplay merge:

1. Forced Shockwave pickup resolves normally; ITEM produces one readable expanding pressure ring, consumes the held charge, and frees the inventory slot.
2. A nearby rival is pushed outward without a conventional spinout, teleport, wrong-way snap, or race-progress mutation; a rival outside approximately 5 m is unaffected.
3. Incoming Kinetic and Seeker counter fixtures are destroyed by a correctly timed pulse, while a deliberately early/out-of-range pulse does not erase them.
4. Slick and Blast fixtures inside the pulse are cleared without triggering their accepted hostile effect; outside-range hazards remain governed normally.
5. Incoming Apex can be neutralized only during terminal/dive timing inside the 5 m 3D boundary; earlier warning/sky phases cannot be erased.
6. Pause/restart leaves no stuck pulse, warning, hazard, projectile, VFX, inventory, or shared-capacity state.
7. Desktop Shift/E and mobile ITEM activation both work; Brake/Reverse + ITEM remains equivalent rather than directional for Shockwave.
8. Normal unforced gameplay shows no Shockwave test badge/fixture, and accepted Nitro/Kinetic/Seeker/Apex/Blast/Slick plus Slick/Blast AI avoidance remain unchanged.

Record exact gameplay commit, PR CI, post-merge CI/Pages run, desktop/mobile results, defects, and Manny's explicit live acceptance in `docs/IMPLEMENTATION-STATUS.md`. Passing this checkpoint closes only the Shockwave functional/counter increment; the other eight item effects, full AI item policy, final interaction matrix, soak/performance closure, issue #106, overall Slice 5 acceptance, and Slice 6 remain open.

## Vision-Obscuring Ink Splat - LIVE ACCEPTED

Amendments 2.18-2.19 / ADR-079-080 and `docs/SLICE-5-INK-SPLAT-SCOPE.md` define the accepted Ink evidence contract. Gameplay and presentation merged through PR #148 at `2df6bf372b01e8a0f13c4bad71737ef8f5ab415d`; the approved AI tuning amendment merged through PR #149 at `af4fa73c2a05ad25e4e2d7343f89f3cf6b9f510f`. Hosted PR CI `35173826253` and post-merge validation/Pages `35188684882` passed with **54 test files / 463 tests**, **81.97% statement / 77.31% branch / 86.56% function / 83.52% line coverage**, strict typecheck, zero-warning lint, Git LFS/runtime-asset verification, branding checks, and production build.

Manny reported **“Pass”** after reviewing the deployed tuned `?testItem=ink-splat` route. PR #149 comment `5709839182` records the product-owner live-acceptance evidence. No browser/device-specific result is inferred beyond that explicit report.

Automated coverage proves progress-authoritative all-racers-ahead targeting across lap/wrap cases; tied/behind/owner/finished/invalid exclusions; no-target inventory rollback; valid-use exact-once consumption even if all targets are immune; mixed immunity; 2.50-second refresh-without-stacking; Prismatic blocking without retroactive cleanse; pause/recovery/finish/restart/hub/disposal lifecycle; bounded/monotonic human overlay state below HUD/touch controls; deterministic smooth 0.95 m AI path-noise amplitude, 0.160-second decision latency, and 0.74 steering precision; legal-road bounding; unchanged AI speed/acceleration/rubber-band and race authority; zero shared physics-slot use; unchanged probability matrix; and a real `ItemEffectDispatcher` / `KartTimeTrial` / controller / AI / HUD-view integration path. Helper-only tests are insufficient.

The deployed primary route is `?testItem=ink-splat`. A deterministic incoming-Ink fixture exercises the human overlay without enabling general AI item tactics. Prismatic protected/expired fixtures verify actual resolved application/blocking. A miss, no-target setup, invalid/finished target, or fixture that never reaches the intended encounter is **INCONCLUSIVE**, not PASS.

Manny's deployed review passed the required live matrix: one-charge consumption, racers-ahead impairment, human readability and fade, HUD/touch usability, refresh-without-stacking, visibly reduced but legal AI precision, pause/recovery/finish/restart/hub lifecycle, Prismatic protected/expired behavior, and normal unforced item behavior.

## Continuous Nitro Overdrive - LIVE ACCEPTED 2026-09-17

Amendment 2.20 / ADR-081 and docs/SLICE-5-NITRO-OVERDRIVE-SCOPE.md define the accepted contract. Manny authorized gameplay, VFX, audio, and presentation implementation after governance PR #151 and hosted validation/Pages run `35223980439` passed. PR #152 squash-merged at `59897fcd48b8f7b8e156764f75a44360bf0f2281`; hosted PR CI `35230154302` and post-merge validation/Pages `35230540886` passed.

Before gameplay publication, automated evidence must exercise the real ItemEffectDispatcher/KartTimeTrial/controller/HUD paths and verify:

- one-charge atomic activation, immediate inventory release, and first-pulse eligibility;
- exact six-second window, 0.75-second minimum pulse cadence, approximately 0.9-second pulse, 1.15x cap, neutral acceleration, and no off-road override;
- rejected early presses retain all state, do not emit pulse presentation, and do not extend the window;
- accepted pulses refresh one source without stacking and are clipped by the window boundary;
- pause freezes window, cadence, pulse, HUD, VFX, and audio;
- expiry, recovery, finish, restart, hub return, racer removal, and disposal cleanup;
- composition with Nitro Surge, Prismatic, drift boosts, boost pads, dirt, grass, ramps, and normal surfaces without permanent-stat or race-authority changes;
- player-only ?testItem=nitro-overdrive isolation, unchanged normal selection, and no AI item inventory/tactical use;
- desktop and mobile ITEM routing, HUD state, original VFX/audio lifecycle, and chase/rear readability.

The published implementation passed **55 test files / 473 tests** with **81.99% statement / 77.32% branch / 86.55% function / 83.55% line coverage**, strict typecheck, zero-warning lint, branding/runtime-asset verification, and production build. The production-path coverage includes `tests/nitro-overdrive.test.ts` and the real `KartTimeTrial` input seam through `tests/arc-runtime-rig.ts`; visual/audio cleanup is covered locally. The deployed route is `?testItem=nitro-overdrive`. Manny reported **“Pass”** on 2026-09-17. No browser/device-specific result is inferred beyond that explicit report.

After a successful gameplay publication and Pages deployment, use:

- Overdrive: https://manaconda33.github.io/manacondas-minigame-mayhem/?testItem=nitro-overdrive
- Normal isolation: https://manaconda33.github.io/manacondas-minigame-mayhem/

The deployed review must verify first use, slot release, new-item collection during the window, visible repeated pulses, cadence rejection, six-second expiry, pause/resume, accepted-boost overlap, normal surface penalties, desktop/mobile controls, chase/rear presentation, cleanup, and normal unforced isolation. An automated pass does not establish live acceptance. Record the exact commit, PR CI, post-merge validation/Pages run, device/browser results, defects, and Manny's explicit acceptance before closing this item.

## Hyper-Drive Rocket governance checkpoint - APPROVED / PUBLISHED

`docs/SLICE-5-HYPER-DRIVE-ROCKET-SCOPE.md`, approved amendment 2.21, and ADR-082 define the published bounded governance checkpoint. PR #154 squash-merged at `ae977623bdc7a209634816e1cea8ef4a799b98c8`; post-merge validation and Pages run `35243454845` passed. This checkpoint is not gameplay, VFX, audio, or presentation implementation authorization. Do not claim a Rocket gameplay pass or Slice 5 closure from this governance publication.

Before any later implementation publication, automated evidence must exercise the real production seams and verify:

- existing selector eligibility at, below, and above rank 6-8 and the 45 m leader-gap boundary, with unchanged matrix/gap weighting;
- atomic one-charge activation, immediate slot release, later collection, and failed-transaction/invalid-owner rollback;
- exactly 6.0 race seconds including a bounded 0.30-second control-return blend, with pause freeze and no steering/braking cancellation;
- Circuit Alpha projection/lookahead and normal `KartController` input for legal movement, with no direct transform, velocity, checkpoint, lap, rank, finish, or racer-stat mutation;
- a 1.25x speed-cap target with normal acceleration, traction, braking, steering, asphalt/dirt/grass/boost-pad/ramp behavior, and no off-road bypass;
- ordinary racer-contact protection and Slick/Blast/Shockwave hostile-effect protection while hazards remain active for other racers, without silently extending protection to projectiles;
- a real rival overtake through movement/progress/checkpoint traversal, with no teleport or forced first-place deposit;
- recovery, finish, restart, hub return, racer removal, disposal, and presentation cleanup without refunding or restarting the state;
- source-scoped composition with Nitro/Overdrive/Prismatic and existing surfaces/boosts, plus desktop/mobile/pause/HUD/VFX/audio and normal-URL isolation; and
- player-only fixture behavior with AI inventory/tactical-use regression coverage. General AI item acquisition/use remains a separate full-Slice-5 gate.

The approved player-only route is `https://manaconda33.github.io/manacondas-minigame-mayhem/?testItem=hyper-drive-rocket`; the normal unforced URL remains required for selector and regression isolation. This route may force the next player pickup only; it must not mutate rank, gap, lap, checkpoint, progress, or AI inventory. A miss, invalid fixture, no legal movement, or encounter that never reaches its intended condition is **INCONCLUSIVE**, not PASS.

Governance publication is complete after local documentation validation, hosted PR CI, and post-merge validation/Pages. Only after a separate implementation authorization may gameplay work begin; gameplay publication and Manny's live acceptance remain distinct later gates.

## Issue #106 post-finish results synchronization

The bounded Issue #106 regression gate verifies presentation only. Finish as the player before at least two AI racers, keep the results card open, and confirm each later AI finish refreshes the standings from the authoritative race state. Finished racers must replace `RACING` with their locked finish time/order, the final displayed order must match authoritative standings, and the player's locked place/time must not change. Repeat on desktop and mobile. This gate must not alter checkpoint/lap authority, AI behavior, item balance, race timing, or victory/results entry behavior.

## Slice 5 final all-item interaction/counter matrix checkpoint

The final interaction/counter evidence artifact is `docs/SLICE-5-ITEM-INTERACTION-MATRIX-2026-09-17.md`. Treat it as a consolidation gate over the production systems, not as permission to retune items.

Hosted validation for the checkpoint must run the complete suite, including the focused Shockwave, Prismatic, Apex, Blast, Slick, Blaze, Frost, Arc Blade, Arc Hammers, Ink, Nitro Overdrive, Hyper-Drive Rocket, RacerEffects, validated-progress, AI-item, and AI-race tests referenced by the matrix. A green focused subset is insufficient if the full repository suite fails.

The matrix may be marked complete only when the PR diff is evidence/governance-only and hosted CI passes clean install, LFS verification, strict typecheck, zero-warning lint, complete automated tests, and production build. No new live-acceptance claim is made by this checkpoint. Lifecycle/object-count soak, item/VFX performance capture, gameplay capture, and the final desktop/mobile whole-slice acceptance remain separate gates.

## Slice 5 final lifecycle/object-count soak checkpoint

The final object-count soak is defined by `tests/item-lifecycle-soak.test.ts` and documented in `docs/SLICE-5-ITEM-LIFECYCLE-SOAK-2026-09-17.md`.

The closure gate combines two stress paths with the existing focused lifecycle suites:

- **Mixed shared-capacity soak:** 20 race cycles, each reaching exactly 40 simultaneous shared item-physics slots with 30 projectiles across Kinetic, Seeker, Blaze, Frost, Arc Blade and Arc Hammers; four Blast Orbs; five Slicks; and one Apex reservation. Object 41 must be rejected, snapshots must remain finite, ordinary lifetime/completion processing must return active counts to zero, and disposal must return shared capacity and runtime groups to baseline.
- **Timed-state / VFX soak:** 100 cycles of Nitro Surge effect state, Nitro Overdrive, Hyper-Drive Rocket, Prismatic protection, Ink Splat, Shockwave, inventory and racer-owned item visuals. Expiry plus disposal must leave neutral drive modifiers, no immunity flags, no timed item state, no pending/visible Shockwave, no Ink targets, no held inventory, and empty local/world VFX groups.

The complete repository suite remains mandatory because existing focused tests supply item-specific impact/expiry, Arc/Blast repeated resource cleanup, audio voice/disconnect disposal, Prismatic music cleanup, AI finish cleanup, pause behavior, and camera/driver-state regressions. The soak does not substitute for the separate approximately 1.0 ms item/VFX performance gate or final desktop/mobile whole-slice acceptance.

## Slice 5 item/VFX rendered-runtime performance gate

Use the deployed opt-in route `?testItemPerf=1`. The route is instrumentation-only and may be combined with existing fixed player/AI item routes. Normal gameplay URLs do not collect or display item/VFX performance samples.

The meter implements the PRD Section 2.6 Item/VFX CPU budget as follows:

- sample unit: CPU milliseconds of measured item simulation + item VFX per rendered frame;
- warmup: first 120 racing rendered frames excluded;
- minimum scored sample: 300 frames;
- rolling sample window: latest 600 frames;
- pass: p95 <= 1.00 ms;
- fail: p95 > 1.00 ms;
- median and maximum are recorded but do not independently fail the gate.

Included code boundaries are inventory/roulette, item-owned timed effects/immunities, Rocket item-control seam, projectile/hazard/Apex/Shockwave/Ink/Prismatic processing, item-box runtime work, AI item-policy dispatch, racer item modifiers, and item VFX. Renderer submission, Rapier/kart physics, ordinary AI pathfinding/race work, HUD/DOM and audio/update are excluded because they have separate PRD budgets.

Rendered-device evidence must record the stable badge values after at least 300 scored samples. Do not infer a browser or device model that the tester did not report. A Node/JSDOM measurement, CI duration, whole-frame FPS number, or production-build time cannot substitute for this gate.

### Recorded rendered-device performance evidence

Product-owner deployed captures reached the full N600 rolling window on both required evidence routes:

- ordinary full-AI route: p95 **1.00 ms**, median **0.40 ms**, max **6.80 ms**, N600, **PASS**;
- forced Rebounding Arc Blade route: p95 **1.00 ms**, median **0.50 ms**, max **8.70 ms**, N600, **PASS**.

The pass rule is p95 <= 1.00 ms. Both results pass exactly at the ceiling. Browser/device details are not inferred because they were not explicitly reported. Full evidence is recorded in `docs/SLICE-5-ITEM-VFX-PERFORMANCE-EVIDENCE-2026-09-17.md`.

## Slice 5 final desktop/mobile whole-slice acceptance

The final product-owner integration protocol is frozen in `docs/SLICE-5-FINAL-LIVE-ACCEPTANCE-2026-09-17.md`.

The gate intentionally reuses accepted item-specific and automated evidence instead of requiring all fifteen item matrices to be replayed. Live review is limited to normal desktop/mobile races, representative offensive/defensive/catch-up integration, desktop pause behavior, mobile simultaneous ITEM input, mobile backward ITEM modifier, cleanup/race-authority spot checks, and gameplay capture.

A reported miss or ambiguous encounter is INCONCLUSIVE, not PASS. Slice 5 closure requires Manny's explicit whole-slice acceptance and a final documentation checkpoint with clean hosted and post-merge validation/Pages. Slice 6 remains locked until that closure record is published and Manny separately approves beginning Slice 6.

### Final whole-slice result - 2026-09-18

Manny completed the frozen Slice 5 final desktop/mobile integration matrix and reported **“All pass.”**

- Desktop D1-D3: PASS.
- Mobile M1-M3: PASS.
- Cleanup/race-authority spot checks: PASS.
- Product-owner whole-slice acceptance: PASS.

The live result is combined with the existing item-specific deployed acceptance record, final interaction matrix, lifecycle/object-count soak, AI-tactics acceptance, Issue #106 acceptance, and rendered-runtime Item/VFX performance evidence. No browser/device details are inferred. No new standalone final-session recording was supplied; the protocol's explicit-observation path is used with the cumulative existing capture/evidence record.

## Slice 6 baseline audit and visual-direction gate

The kickoff audit is recorded in `docs/SLICE-6-BASELINE-AUDIT-AND-ART-DIRECTION-2026-09-18.md`.

Before visual implementation:

- verify current menu/HUD/settings/pause/results behavior against PRD Sections 10, 23, 24, 25, 35.7 and 37;
- inventory current track/kart material-coordinate support before external texture assignment;
- verify every proposed external production asset license and record provenance;
- treat commercial-game screenshots/UI only as design reference, never production assets;
- keep Medium-preset GPU texture residency <=256 MB and first-playable download targets in scope;
- confirm no Slice 5 gameplay/balance/race-authority files change in this planning checkpoint.

The first product-owner visual gate is selection of Route Night, Pit Poster, Twilight Broadcast, or an approved hybrid. Technical settings architecture, performance-instrumentation planning, material-coordinate design and provenance scaffolding may proceed without locking the final visual language.

## Slice 6 settings / graphics / audio foundation checkpoint

PR #176 is the first bounded Slice 6 engineering increment. Before publication it must retain all existing repository checks and additionally prove:

- versioned settings default safely when storage is absent, corrupt, unavailable, or an unsupported version;
- Master, Music, and SFX values persist across app-shell remounts;
- Low, Medium, and High graphics presets remain distinct and Medium preserves the previous renderer baseline;
- saved graphics quality reaches the next race renderer without requiring a page reload;
- the centralized mixer clamps invalid values, applies Master globally, and composes effective Master × bus volumes;
- existing procedural item/warning/drift cues consume the SFX bus while the existing Prismatic musical layer consumes Music;
- the reserved Engine bus does not claim a production engine system before that later Slice 6 increment exists; and
- no accepted Slice 5 gameplay, balance, race authority, item probability, roster, or track-topology behavior regresses.

Hosted PR CI run `35352171432` on implementation head `19ca29fe6b86e9beea6358deb08ce7346ad47be1` passed Git LFS verification, clean `npm ci`, strict typecheck, zero-warning lint, **64 test files / 515 tests**, **81.40% statement / 76.90% branch / 86.24% function / 83.15% line coverage**, branding/runtime-asset verification, and production build. The existing Vite large-chunk warning and three moderate npm audit findings remain known/nonblocking.

This automated checkpoint does **not** claim deployed settings persistence, device-specific graphics quality, production engine/music audio, Route Night visual acceptance, or public Pages acceptance. Those claims require their later governed implementation/deployment gates.

**Publication result:** Manny approved publication on 2026-09-18. PR #176 squash-merged at `0144bcb6f1ce2bc0acb0e7e6adc229f38fd2e109`. Post-merge run `35353036562` passed validation and GitHub Pages deployment. This publication confirms the checkpoint reached the deployed build; it does not by itself constitute device-specific visual/audio acceptance.

## Slice 6 material-coordinate / first Circuit Alpha PBR checkpoint

The second bounded Slice 6 increment is defined by `docs/SLICE-6-CIRCUIT-ALPHA-PBR-PASS-2026-09-18.md` and ADR-088.

Before publication, hosted validation must prove:

- `TrackMaterialCoordinates` emits one UV for every procedural strip vertex without mutating Circuit Alpha samples;
- the closed loop terminates at the same spatial seam with an integer longitudinal repeat count, preventing a fractional repeating-texture seam;
- bounded segment-strip coordinates are finite and monotonic in cumulative centerline distance;
- the 2 m material scale remains explicit in geometry metadata;
- the PBR asphalt material uses only the governed 1K diffuse, OpenGL normal, and roughness maps with repeat wrapping, sRGB on diffuse only, and one shared texture set for road + racing-wear;
- `tools/verify-runtime-assets.mjs` rejects missing, pointer-like, or byte-changed asphalt maps through JPEG signature and exact SHA-256 verification;
- normal repository Git LFS materialization and `git lfs fsck` continue to pass for existing governed assets, while the normal-Git track JPG derivatives pass their exact hash/signature gate;
- `disposeTrackScene` disposes shared textures/materials/geometries once and race disposal invokes that cleanup;
- all existing track, race, item, AI, roster, settings, audio, and asset tests remain green;
- strict typecheck, zero-warning lint, production build, branding validation, and runtime-asset validation pass.

The budget record for this checkpoint is **2,150,973 bytes (~2.05 MiB compressed)** for the three runtime files and an intentionally conservative **~16 MiB decoded GPU estimate including mipmaps**. These numbers keep the PRD Medium <=256 MB texture-residency target visible; they do not replace later rendered-device Medium performance/residency measurement.

After deployment, product-owner visual review should confirm the asphalt reads richer than the flat-color baseline without obvious UV seams/stretching, Circuit Alpha retains its dusk/twilight identity, established track geometry remains visually intact, approved racer/kart presentation is unchanged, and race restart/hub re-entry does not reveal a missing-material cleanup defect.

**Publication result:** Hosted PR CI `35356556627` passed Git LFS verification, clean install, strict typecheck, zero-warning lint, **65 test files / 519 tests**, **81.52% statement / 76.86% branch / 86.42% function / 83.26% line coverage**, exact track-texture hash/signature verification, branding/runtime-asset verification, and production build. PR #178 squash-merged at `c721fc083e2d18ad534387227968bb0a75982ae7`; post-merge run `35365068619` passed validation and GitHub Pages deployment. Automated publication is complete; the bounded deployed visual review remains pending.

This checkpoint is not the final five-restart memory certification, cross-browser matrix, Medium performance gate, or Slice 6 release-candidate acceptance.

## Slice 6 Route Night title / hub / utility UI checkpoint

The bounded title, hub, Controls, and Settings UI increment adds `tests/route-night-ui.test.ts`. The focused contract covers deployed-base asset resolution, the authored Route Night SVG/raster asset library, art-directed action-plaque metadata, title route-board density, `PRESS START` hub routing, Circuit Alpha dominance, live/locked hub checkpoint nodes, non-activating `COMING SOON` cards, preserved desktop/mobile control bindings, utility route markers, and the existing settings IDs/destinations.

Run the focused contract with:

```bash
npm test -- --run tests/route-night-ui.test.ts tests/app-shell.test.ts
```

Before publication, run the repository validation sequence: `npm run typecheck`, `npm run lint`, `npm run test:ci`, and `npm run build`. The build must also pass branding and runtime-asset validation. The two original Route Night WebP assets are checked into `public/assets/ui/route-night/`; their provenance and hashes are recorded in `docs/ASSET-PROVENANCE.md`.

After hosted deployment, the product-owner visual gate must inspect title, hub, Controls, and Settings at representative desktop and mobile sizes against ADR-086 and the canonical Route Night reference. Verify browser audio unlock, playable/unavailable card routing, keyboard/mobile binding readability, persistent Master/Music/SFX settings, next-race Low/Medium/High selection, focus-visible treatment, and reduced-motion behavior. This automated checkpoint does not constitute deployed visual acceptance and does not authorize Character Select or later Slice 6 screens.

## Slice 6 Route Night Character Select — live accepted

The bounded Character Select checkpoint added the responsive Route Night driver roster, selected production full-body driver art, fixed six-stat presentation, and an isolated rotating kart preview. It preserved the approved twelve-entry roster manifest, canonical class mapping in `docs/ROSTER-MAPPING.md`, kart GLB paths and visual yaw metadata, existing hub/race navigation, portrait fallbacks, and the protected Circuit Alpha material baseline.

The focused contract was `npm test -- --run tests/character-select-ui.test.ts tests/route-night-ui.test.ts tests/app-shell.test.ts`. Pre-publication validation passed the complete test suite, strict typecheck, zero-warning lint, production build, branding/runtime-asset validation, and `git lfs fsck`.

PR #187 merged at `7e8a9ea8901bef6ea4dd785780c4cc8295225ead`; post-merge CI/Pages run `35422609359` passed. Manny completed deployed desktop/mobile visual acceptance against ADR-086, ADR-090-092, the canonical Route Night reference, the approved Route Night design, and all twelve approved roster assets: PASS. The gate verified portraits, selected full-body identity, canonical class labels, six readable stats, actual GLB loading and restrained rotation, manifest-governed yaw, WebGL/asset fallback visibility, reduced-motion rendering, keyboard focus retention, start-race handoff, and back-to-hub navigation.

This automated and deployed checkpoint is complete. The next increment is separate and is defined by the Race HUD / Results-Podium design brief and plan; it does not retroactively expand this Character Select test scope.

## Slice 6A Race HUD / Circuit Alpha minimap asset checkpoint — branch-only

The bounded Race HUD/minimap asset checkpoint adds `tests/race-hud-ui.test.ts`. The focused contract covers the revisioned race-HUD SVG and approved atmosphere/item asset paths, semantic live race-shell regions, held-item PNG mapping with text fallback, and the authored minimap frame layered beneath the existing live Circuit Alpha track path and racer markers.

Run the focused contract with:

```bash
npx vitest run tests/race-hud-ui.test.ts --coverage=false
```

Before publication, run `npm run validate`, inspect the generated production asset paths, validate the authored SVG, and run `git diff --check`. This checkpoint must not claim Results/Podium behavior or deployed visual acceptance; those remain separate approval gates.

## Slice 6 next bounded Race HUD / mini-map / Results-Podium planning gate

The next bounded increment is documented in `docs/SLICE-6-RACE-HUD-RESULTS-PODIUM-DESIGN-2026-09-19.md` and `docs/superpowers/plans/2026-09-19-race-hud-results-podium.md`. Its future validation must add focused contracts for the 15 item-art mappings, enriched eight-racer standings, shared Circuit Alpha mini-map topology, top-three victory/reaction rank mapping, five lower-finish reaction states, Results controls, responsive placement, fallback/reduced-motion behavior, and the complete Title → Hub → Character Select → Race → Results flow. It must still run the complete repository validation sequence and the deployed desktop/mobile acceptance gate.

## Slice 6 Results/Podium runtime subset — feature branch

This bounded, branch-only runtime checkpoint adds `tests/race-results.test.ts`, `tests/results-podium.test.ts`, and `tests/results-routing.test.ts`. It verifies eight stable racer/character identities with legacy result fields, authoritative place ordering, unchanged locked player place/time after late finishes, player placement in each of the eight finish positions, all-eight row access, approved victory-art mapping, full-body/portrait/monogram error fallback, late-standing refresh without replacing action controls, and disposal/navigation for Race Again, Change Driver, and Return to Hub. The Results status is the only live region; the standings use a labelled keyboard-scrollable region. The markup remains static under reduced motion.

Run the focused contract with:

```bash
npx vitest run tests/race-results.test.ts tests/results-podium.test.ts tests/results-routing.test.ts tests/app-shell.test.ts --coverage=false
```

The complete `npm run validate` sequence passed with **71 test files / 561 tests**, **81.91% statement / 76.23% branch / 87.06% function / 83.62% line coverage**, strict typecheck, zero-warning lint, branding/runtime-asset verification, and production build. `git diff --check`, targeted Prettier checks, and `git lfs fsck` also passed. The Vite large-chunk warning remains present for the existing `KartTimeTrial` bundle.

The reviewed code checkpoint is published on the feature branch at `51a18ec6e8430153bcc941611039044d8a760a16`.

This checkpoint uses only the six already approved victory poses; other podium identities use approved selection art and the governed portrait/monogram fallback. It does not add ImageGen assets, reaction poses, a backdrop, item art, or additional race gameplay. It is automated branch evidence only: no hosted CI, deployment, or live visual acceptance is claimed. The remaining full Race HUD/mini-map/Results asset and desktop/mobile acceptance gates stay open.

### Lower-finish reaction runtime mapping — feature branch

Focused Results tests cover approved reaction selection for places 4–8,
victory-only podium selection, stable character-ID resolution, exact cache
revision use, and selection-art fallback when a reaction file fails. Run:

```bash
npx vitest run tests/results-podium.test.ts --coverage=false
```

The runtime asset verifier continues to check each reaction's exact hash,
dimensions, RGBA transparency, and key-green exclusion. This automated mapping
check does not replace hosted CI or desktop/mobile visual acceptance. The
latest local full validation passed **72 test files / 583 tests**; coverage is
81.93% statements, 76.25% branches, 87.07% functions, and 83.64% lines. The
production build retains the existing non-blocking KartTimeTrial large-chunk
warning.

## Results lower-finish reaction art asset gate

For each approved reaction batch, use its exact approved green render as the
input to `tools/assets/prepare_results_reaction_cutouts.py` and verify the
recorded source and runtime SHA-256 values. Run `node
tools/verify-runtime-assets.mjs` to check all approved Results PNG hashes,
1024 × 1536 RGBA format, transparent corners, zero RGB where alpha is zero,
and absence of opaque key-green pixels. Inspect each cutout over a dark and
bright background at runtime scale before publication. This asset gate does
not imply Results runtime mapping or deployed visual acceptance.

The Results/Podium tests verify the decorative backdrop URL and accessibility
semantics while confirming the standings and race actions remain live. Runtime
asset verification checks the backdrop's WebP signature and approved SHA-256.

## Slice 6 Task 10 local release-evidence checkpoint — 2026-09-25

The focused local regression command passed **10 test files / 79 tests**:

```bash
npx vitest run tests/race-hud-ui.test.ts tests/minimap.test.ts tests/results-podium.test.ts tests/results-routing.test.ts tests/app-shell.test.ts tests/route-night-ui.test.ts tests/item-hud-input.test.ts tests/race-results-assets.test.ts tests/race-results.test.ts tests/character-select-ui.test.ts --coverage=false
```

`npm run validate` passed strict typecheck, zero-warning lint, **72 test files /
584 tests**, branding/runtime-asset verification, and production build. Coverage
was **81.93% statements / 76.25% branches / 87.07% functions / 83.64% lines**.
The asset verifier checked 18 Results/Podium assets including the approved
backdrop, 36 materialized runtime GLBs, and 135 character PNGs. Exact asset
source/runtime hashes are recorded in `docs/ASSET-PROVENANCE.md` and
`docs/assets/ROUTE-NIGHT-RACE-RESULTS-ASSET-BRIEF.md`; backdrop runtime SHA-256:
`24812fcd47e20c28601cbdcc15e1f824a3e17b1fdd679c346578bb600a539465`.
`git diff --check`, `git lfs fsck`, and targeted Prettier checks passed. The
existing Vite large-chunk warning for `KartTimeTrial` remains non-blocking.

The five-restart cleanup/memory check is **INCONCLUSIVE / NOT PASSED**.
`tests/results-routing.test.ts` verifies one mocked disposal/routing cycle for
each of Race Again, Change Driver, and Return to Hub, but does not exercise five
repeated cycles with real `KartTimeTrial` instances, compare browser memory,
inspect marker/DOM accumulation across five restarts, or measure Results-only
asset residency. No whole-app browser memory/soak harness was found in the
repository. These limitations do not support a pass claim.

GitHub inspection found no open PR for
`feature/slice6-race-hud-minimap-results-podium` and no PR-triggered workflow run
for `1c942fc2c5913859bc46d7a22188e132a15f6822`. Hosted PR CI/Pages and deployed
visual review remain pending. Do not infer deployed desktop/mobile acceptance
from these local tests or the production build.

## Browser evidence 1 — deployed build provenance and baseline — 2026-09-25

Connected Chrome opened the GitHub Pages URL listed in `README.md` at
`https://manaconda33.github.io/manacondas-minigame-mayhem/`. The visible and
accessible screen was the Route Night Title at **1363 × 936 CSS pixels, DPR 1**.
The read-only DOM sample reported `data-screen="title"`, 85 elements, zero
Results screens, and zero mini-map nodes. Those zero counts are expected on the
Title screen and provide no lifecycle or memory evidence. The page evaluation
surface did not expose `window.performance`; no heap reading was collected.

The checked-in workflow only deploys Pages on pushes to `main`. At this check,
`main` was `7e8a9ea8901bef6ea4dd785780c4cc8295225ead` and the feature branch was
`cf9e357bb8faa88696865e28ab56323e15df1eee`. This Pages view therefore does not
exercise the current feature branch. Do not count it toward Task 10's
five-restart check or Task 11's deployed acceptance. Next browser evidence must
be collected against a branch-matched local preview and labelled local, unless
a later approved deployment supplies a matching deployed build.

## Browser evidence 2 — feature-branch preview access — 2026-09-25

The feature branch's Vite server started successfully at
`http://127.0.0.1:5173/manacondas-minigame-mayhem/` after binding explicitly to
loopback; binding to `0.0.0.0` failed while Vite queried unavailable network
interfaces. The connected cloud browser rejected both the loopback URL and
`http://localhost:5173/manacondas-minigame-mayhem/` with
`net::ERR_BLOCKED_BY_CLIENT`. A follow-up browser inspection was denied by the
browser URL policy for the local origin. The Vite process was stopped afterward.

No feature-branch page opened, and no race cycle, DOM cleanup, heap sample, or
Results asset-residency observation was collected. This is an environment
access blocker, not evidence of a leak or a pass. Resume only with a reviewable
branch-matched preview URL supplied by an approved preview/deployment path or
with browser access explicitly supporting this workspace's local origin; do
not bypass the browser's URL policy. Keep the five-restart and deployed visual
gates open.

## Browser evidence 3 — GitHub branch preview deployment attempt — 2026-09-25

Manny requested a GitHub gameplay link that would leave the usual game at
`https://manaconda33.github.io/manacondas-minigame-mayhem/` intact. A temporary
feature-branch workflow at commit `81f59f2831891c609c5bc4c0526a2de3034849aa`
tried to build `main` commit `7e8a9ea8901bef6ea4dd785780c4cc8295225ead` at
the usual root and the feature revision at the intended
`/manacondas-minigame-mayhem/previews/race-hud-results/` path. Locally,
`npm run build -- --base /manacondas-minigame-mayhem/previews/race-hud-results/`
passed branding and runtime-asset checks and built the preview-relative asset
URLs; `npx prettier --check .github/workflows/temporary-race-results-preview.yml`
passed. Hosted run
[`36194146120`](https://github.com/Manaconda33/manacondas-minigame-mayhem/actions/runs/36194146120)
passed both LFS checks, both clean-install builds, site assembly, and artifact
upload. The combined Pages artifact was 141 MB with digest
`sha256:cf9bf34768b390d252c57183b75c247f1dd1ea5156ddee2e70ba87b6c68283ba`.

The deployment job failed before running with GitHub's annotation:
`Branch "feature/slice6-race-hud-minimap-results-podium" is not allowed to deploy to github-pages due to environment protection rules.`
No preview was published. The temporary workflow was removed in the evidence
cleanup. Before and after the rejected deployment, the usual Pages URL loaded
the Title with the same script `assets/index-Dt74Qa1M.js` and stylesheet
`assets/index-612kuw8p.css`. These matching paths establish that this attempt
did not replace the currently served bundle; they do not prove any feature
behavior. No race cycle, real-game disposal, stale marker or orphaned DOM count,
Results-only asset request/residency check, or browser memory/resource measure
was possible. The five-restart gate is **INCONCLUSIVE / NOT PASSED**, and Task 11
deployed desktop/mobile acceptance remains pending.

## Browser evidence 4 — isolated GitHub Pages preview availability — 2026-09-25

Manny approved a temporary workflow-only `main` change to supply a gameplay
link. Before publication, `main` was
`7e8a9ea8901bef6ea4dd785780c4cc8295225ead` and the clean feature branch
was `5ed7199a92061f1b9034ab7b69a6e6a18660fe92`. An isolated local build
of that `main` checkpoint (`npm ci && npm run build`) produced the same root
script and stylesheet filenames then served by Pages:
`assets/index-Dt74Qa1M.js` and `assets/index-612kuw8p.css`. Local
`npm run validate` passed 67 files / 536 tests, typecheck, lint, runtime-asset
checks, and build; `npx prettier --check .github/workflows/ci.yml`,
`git diff --check`, and `git lfs fsck` passed. The workflow-only `main` commit
`29fad5d1e66de2fff9f3007bafedb4c2f551df09` pins the feature build to
`5ed7199a92061f1b9034ab7b69a6e6a18660fe92`, places it under the isolated
preview path, and preserves the `main` build at the Pages root. Hosted CI and
Pages [run `36212375736`](https://github.com/Manaconda33/manacondas-minigame-mayhem/actions/runs/36212375736)
completed both validate and deploy jobs successfully.

Connected Chrome opened
`https://manaconda33.github.io/manacondas-minigame-mayhem/previews/race-hud-results/`
and observed the accessible Route Night Title (`data-screen="title"`), script
`previews/race-hud-results/assets/index-UqrfspIU.js`, and stylesheet
`previews/race-hud-results/assets/index-wawQ29f5.css`. In a separate tab, the
usual `https://manaconda33.github.io/manacondas-minigame-mayhem/` rendered the
Title and still loaded `assets/index-Dt74Qa1M.js` and
`assets/index-612kuw8p.css`. This establishes preview availability and root
bundle identity at the time of inspection. It does not establish race entry,
five restart cycles, real-instance disposal, marker or DOM cleanup,
Results-only asset residency, or browser memory behavior. Task 10 remains
**INCONCLUSIVE / NOT PASSED**. The preview is a test surface; Task 11 deployed
desktop/mobile visual acceptance and Manny's explicit acceptance remain pending.

## Browser evidence 5 — Character Select desktop clipping defect — 2026-09-26

Manny reported that Character Select at 100% desktop zoom cut off the driver
statistics and START RACE control; his 1915 × 902 PNG showed the profile ending
below the viewport. At 75% zoom, his 1910 × 906 PNG showed both the statistics
and START RACE. This is a reported visual/accessibility defect, not Task 11
acceptance. The preview remains pinned to feature commit
`5ed7199a92061f1b9034ab7b69a6e6a18660fe92` at
`https://manaconda33.github.io/manacondas-minigame-mayhem/previews/race-hud-results/`.

Connected Chrome followed Title → Hub → Character Select on that preview at
1363 × 936 CSS pixels. Read-only DOM measurements showed the START RACE button
bottom at **1032.59 px**, Character Select screen bottom at **1128.13 px**,
`scrollHeight = clientHeight = 1128 px`, and body `overflow-y: hidden`.
Thus the button was below the 936 px viewport with no effective scroll range
in the Character Select element. The corrective local CSS gives the screen a
100svh height and, on desktop viewports at most 1000 px high, reduces the hero
stage height and top padding. The goal is a visible action at ordinary desktop
height with scrolling as a fallback. This change is **not yet published or
browser-verified**. Focused `npx vitest run tests/character-select-ui.test.ts tests/route-night-ui.test.ts tests/results-routing.test.ts --coverage=false`
passed 3 files / 20 tests, and `npm run validate` passed 72 files / 584 tests,
typecheck, lint, runtime-asset checks, and build. These DOM-based suites cannot
prove viewport layout; deployed 100% desktop verification remains required.
No race cycle or cleanup/memory measurement was made; Task 10 remains
**INCONCLUSIVE / NOT PASSED** and Task 11 acceptance remains pending.

The first deployed correction used feature commit
`d06e9ead16214304deb15086ffc78d579f39db02` and `main` workflow commit
`ff474bd71c679748feeff820a105153bf639767b`. Hosted CI/Pages
[run `36253714178`](https://github.com/Manaconda33/manacondas-minigame-mayhem/actions/runs/36253714178)
passed. Connected Chrome reloaded the preview until its new stylesheet
`index-DN4ieFcL.css` appeared, then followed Title → Hub → Character Select
at 1363 × 936. START RACE bottom was **830.61 px** and the screen's
`clientHeight = scrollHeight = 936 px`, so the action was in view. A screenshot
then revealed the selected driver's legs were cropped: the art lane was
207.95 px high while its image retained a 383.06 px minimum size. This is a
new visual defect from the compact stage, so the correction is not accepted.
A second local CSS change removes the image's intrinsic minimum height to
allow `object-fit: contain` to fit the full body in its lane. That change
requires publication and fresh browser review. No five-restart evidence or
Task 11 acceptance follows from the first deploy.

The follow-up feature commit `c13aa67fa5fc5929c3efde9c0ffc9a119a8d8aa1`
was pinned by temporary `main` workflow commit
`ab49071802c0d8dcac95dc3eb7b1244c175128d6` and published by
[CI/Pages run `36254115150`](https://github.com/Manaconda33/manacondas-minigame-mayhem/actions/runs/36254115150),
whose validate and deploy jobs passed. Connected Chrome reloaded the same
preview URL and verified the new `index-C4TC_rqF.css`, then followed Title →
Hub → Character Select at **1363 × 936 CSS pixels**. The full-body driver image
and its clipping lane both measured **207.95 px** high with matching top
435.70 px and bottom 643.66 px. A screenshot showed the driver's head through
shoes inside the panel, the statistics, and START RACE. The action bottom was
**830.61 px** within the 936 px viewport; the screen measured 936 px with
`scrollHeight = clientHeight = 936 px`. The usual Pages root still loaded the
original `assets/index-Dt74Qa1M.js` and `assets/index-612kuw8p.css`.

This is a browser pass for Character Select control reachability and complete
driver silhouette at the inspected desktop viewport. It does not establish
Manny's 1915 × 902 browser result, mobile presentation, actual GLB appearance
(connected Chrome showed its WebGL CSS fallback), full-flow deployed visual
acceptance, or any restart cleanup/memory outcome. Task 10 remains
**INCONCLUSIVE / NOT PASSED** and Task 11 remains pending Manny's review.

## Browser evidence 8 — Character Select desktop composition — 2026-09-26

Feature commit `689d58b291da7e18b6ed4743f876eb9ef439cc79` was pinned into the existing non-production preview by main workflow commit `f32766b120e6a95afffdf4c2821b2575f3c79e8a`; hosted CI/Pages run [36257236545](https://github.com/Manaconda33/manacondas-minigame-mayhem/actions/runs/36257236545) completed successfully. The preview URL is [Race HUD / Results preview](https://manaconda33.github.io/manacondas-minigame-mayhem/previews/race-hud-results/).

Connected Chrome followed Title → Hub → Character Select at **1363 × 936 CSS pixels** (the browser did not expose its zoom percentage). Screenshots inspected Lavi, Dragon Queen, and McFleurdel. Each complete selected silhouette fit within the art lane; Dragon Queen's wings and tail remained visible; the long McFleurdel name stayed above the art; all six statistics and START RACE were visible; the kart remained in its separate lane with the WebGL fallback; and the page retained a vertical scroll bar for lower content. The usual Pages root still rendered the Title screen. The browser API did not expose DOM bounding rectangles or viewport resizing, so exact element geometry was not collected.

The planned **1915 × 902** desktop viewport and narrow coarse-pointer Character Select viewport remain unverified. This evidence is a bounded preview visual check, not deployed Task 11 acceptance. Task 10 five-restart cleanup/memory remains **INCONCLUSIVE / NOT PASSED**. Do not close Task 11 without its separate desktop/mobile observations and Manny's explicit acceptance.

## Slice 6 mobile wheel, HUD, and camera implementation checkpoint — 2026-09-26

The approved mobile controls/HUD/camera plan is implemented in three feature checkpoints: wheel/input priority (`112fa079827f3c33f4728669500c10e261a67dac`), compact HUD and item action (`194f9b5e778e88fded1763dc97452b709cadcb76`), and mobile-forward camera (`312184c5dc394e4437c3760fd8fd686688ad9698`). Follow-up commits record the browser limitations. The approved mockup was used as a composition reference only; it is not a runtime asset.

Local `npm run validate` passed **74 test files / 602 tests**, typecheck, lint, branding/runtime-asset checks, and build. Focused wheel/input/item/HUD/camera tests passed; wheel tests cover centered throttle, normalized/clamped left/right steering, brake/reverse priority and restoration, release/cancel/lost-capture/hidden-document cleanup, and disposal. Item-button tests cover empty, neutral roulette, approved held art, charges/accessibility, consumption, and image fallback. Camera tests preserve desktop and rear values, intro continuity and spinout/rear switching while asserting lower forward framing on mobile. Targeted Prettier, `git diff --check`, and `git lfs fsck` passed. Vite emitted its existing non-blocking `KartTimeTrial` large-chunk warning.

The isolated GitHub Pages preview is pinned to feature code `312184c` by main workflow commit `442e01a86d2089271f2cd33afcdc497dbea5e0f4`; hosted CI/Pages run [36259626041](https://github.com/Manaconda33/manacondas-minigame-mayhem/actions/runs/36259626041) passed validation and deployment. The preview URL is [Race HUD / Results preview](https://manaconda33.github.io/manacondas-minigame-mayhem/previews/race-hud-results/). The ordinary Pages root still loaded main-branch assets `assets/index-Dt74Qa1M.js` and `assets/index-612kuw8p.css`.

Connected Chrome observed **1363 × 936 CSS pixels**, with `pointer: coarse` and `hover: none` both false; the browser API exposed no viewport/device emulation. Local Vite navigation returned `net::ERR_BLOCKED_BY_CLIENT`. The race HUD DOM and countdown rendered, but Chrome could not create a WebGL context and remained on “Initializing Circuit Alpha.” Thus no road/camera framing, touch controls, live item/drift/warning behavior, race finish, or Results routes could be visually exercised. The required 360–430 portrait/safe-area inspection remains open. Do not treat the preview as deployed acceptance.

Task 10 five-restart cleanup/memory remains **INCONCLUSIVE / NOT PASSED**; these UI and geometry tests do not measure repeated real-game disposal, marker/DOM accumulation, Results-only asset residency, or browser memory. Task 11 deployed desktop/mobile acceptance and Manny's explicit acceptance remain pending.

## Mobile HUD correction candidate — 2026-09-26

After reviewing the mobile HUD checkpoint, Manny approved the wheel input behavior but requested a visual correction before accepting the HUD. The feature branch candidate now presents exactly four normal touch actions in the requested order: Rear view, Brake/Reverse, Use Item, Drift. The steering wheel is larger; the live speed readout is bottom-center; and the live drift/boost panel is lower-right above the controls. The mobile-only `Hold Space + steer to drift` instruction is replaced with a neutral `BOOST` state while idle; desktop wording is unchanged. The recovery action is a separate hidden control that appears only while the existing out-of-bounds recovery timer is active. Steering/acceleration, brake priority, release behavior, camera, item runtime behavior, and Results routing are otherwise untouched.

Focused HUD/item suites passed **16 tests**. Full `npm run validate` passed **74 test files / 603 tests**, strict typecheck, lint, branding/runtime-asset checks, and production build. `git diff --check` passed. The branch preview was refreshed to feature commit `1906a040f2bb7c6de88d1783e5d15cb4d1f62bc0` by workflow-only `main` commit `6307fe3683fadb63fa173ea4891f09cd5aeee226`; hosted CI/Pages run [36262709355](https://github.com/Manaconda33/manacondas-minigame-mayhem/actions/runs/36262709355) passed validation and deployment. The preview URL is [Race HUD / Results preview](https://manaconda33.github.io/manacondas-minigame-mayhem/previews/race-hud-results/); `index-Cy_zdG4N.css` loaded after the refresh, matching the corrected local CSS build. The normal root game remains built from `main`.

Connected Chrome can open the preview but reports fine pointer/hover and exposes no touch viewport emulation; its WebGL context is disabled. The race HUD DOM loaded, but this browser cannot render/test the mobile-only layout or live gameplay. The 360–430 CSS-pixel safe-area review is therefore still pending Manny's visual review. The implementation remains **unapproved**; this preview is a review surface, not production deployment or Task 11 acceptance. Task 10 remains **INCONCLUSIVE / NOT PASSED** and Task 11 acceptance remains pending.

## Mobile HUD correction owner review — 2026-09-26

Manny reviewed the refreshed [isolated branch preview](https://manaconda33.github.io/manacondas-minigame-mayhem/previews/race-hud-results/) and replied “Approved.” The approved scope is the corrected HUD presentation: four normal actions ordered Rear view → Brake/Reverse → Use Item → Drift; a larger steering wheel; bottom-center speed; drift/boost lower-right above the controls with no mobile `Hold Space + steer to drift` instruction; and contextual Recover outside the four normal controls. Feature code commit: `1906a040f2bb7c6de88d1783e5d15cb4d1f62bc0`. Preview workflow commit on `main`: `6307fe3683fadb63fa173ea4891f09cd5aeee226`. [CI/Pages run 36262709355](https://github.com/Manaconda33/manacondas-minigame-mayhem/actions/runs/36262709355) passed and published that pinned feature build at the preview path.

This is product-owner approval of the HUD correction checkpoint, not measured touch or live race evidence. No device/viewport, safe-area measurements, five-restart cycles, heap samples, or complete Title → Hub → Character Select → Race → Results acceptance result accompanied the reply. The earlier connected Chrome limitation (fine pointer, no touch emulation, disabled WebGL) remains the only recorded browser capability evidence here. Task 2 portrait/interaction Step 4, Task 3 camera visual Step 4, and integrated Task 4 Step 3 stay open for their specified functional checks. Task 10 five-restart cleanup/memory is **INCONCLUSIVE / NOT PASSED**; Task 11 deployed desktop/mobile acceptance remains pending. The approval does not authorize a feature merge or production deployment.

## Task 10 manual review disposition — 2026-09-26

Manny stated, “I'm passing task 10 via manual review,” against feature head `5d58b6a0e7d909eb115612c0df10335126bb1996`. He clarified that he **played, restarted, reselected, and returned to main at least ten times on both mobile and desktop**. His manual review **passed Task 10's five-restart cleanup/memory gate** and the associated Slice 6 no-material-memory-increase criterion. The previous assertion that no five-restart real-game run occurred was incorrect and is superseded by this clarification. This is a qualitative product-owner measurement; no device models, numeric heap readings, marker/DOM counts, or Results-only asset-residency figures were reported, so do not invent them. The earlier focused/full validation and mocked routing tests remain separate automated evidence. Hosted PR and post-merge CI/Pages have since passed as recorded below. Task 11's deployed desktop/mobile acceptance remains pending.

## PR #188 production deployment and CI recovery — 2026-09-26

Manny approved merge and production deployment. PR #188 was squash-merged at `e04ef8252b454c734e8e96411a6ca6a346b71fd6`. Its post-merge run [`36278076542`](https://github.com/Manaconda33/manacondas-minigame-mayhem/actions/runs/36278076542) passed LFS verification, install, typecheck, lint, **74 test files**, production build, pinned-preview asset verification/build, then failed before deployment during site-artifact assembly: `ci.yml` still required pre-merge main bundle filenames `index-Dt74Qa1M.js` and `index-612kuw8p.css`.

PR #189 replaced those stale hash pins with checks for the current `dist/index.html` and generated `index-*.js` / `index-*.css` files. The workflow correction merged at `f7d88ccb135f10e252ae2eb2f9259e8d64250142`. Post-merge run [`36278444495`](https://github.com/Manaconda33/manacondas-minigame-mayhem/actions/runs/36278444495) passed LFS verification, install, typecheck, lint, **74 test files**, production build, pinned-preview asset verification/build, site artifact assembly, Pages artifact upload, and GitHub Pages deployment. The workflow reported the production URL as `https://manaconda33.github.io/manacondas-minigame-mayhem/`; the isolated preview remains `https://manaconda33.github.io/manacondas-minigame-mayhem/previews/race-hud-results/`.

This validates the build and deployment pipeline. It does not constitute Task 11's deployed visual acceptance. Task 10 remains **PASSED BY PRODUCT-OWNER MANUAL REVIEW** based on Manny's at-least-ten play/restart/reselect/return-to-main cycles on both mobile and desktop. Task 11 remains pending Manny's separate desktop/mobile review of the complete Title → Hub → Character Select → Race → Results flow and listed visual criteria.

## Minimap racer portrait regression correction — deployed verification — 2026-09-26

Manny reported that racer faces on the deployed mobile Race HUD appeared as black circles. Inspection traced the cause to the Route Night `[data-minimap-frame]` rule, which filled the SVG frame circle with an opaque indigo color after the portrait image was drawn. The rule now uses `fill: none` and keeps its visible stroke. A regression test checks the final matching frame rule in the stylesheet cascade. The test failed before the CSS correction and passed afterward.

PR #191 squash-merged at `9cca45b6360979464687a39c0ee5515497985602`. Post-merge CI/Pages run [`36280588544`](https://github.com/Manaconda33/manacondas-minigame-mayhem/actions/runs/36280588544) passed **74 test files / 604 tests**, typecheck, lint, branding/runtime-asset checks, production and isolated-preview builds, and GitHub Pages deployment. The deployed production page serves `assets/index-Cdzwv8Db.css`; inspection confirmed `[data-minimap-frame]{fill:none}` with its outline retained. The existing `KartTimeTrial` large-chunk warning remains. This is deployed-bundle evidence; Manny later confirmed the deployed minimap faces work on 2026-09-28; see the Task 11 staged desktop acceptance below. Task 10 remains **PASSED BY PRODUCT-OWNER MANUAL REVIEW**. Task 11 remains pending the deployed desktop/mobile flow review and Manny's explicit acceptance.

## Task 11 staged desktop acceptance and Race HUD correction — 2026-09-28

Manny explicitly accepted the deployed desktop Title, Hub, and Character Select checkpoints. He reported the deployed desktop minimap passes. Task 11 remains open; no other desktop criteria, placement-specific Results paths, mobile criteria, or full-flow outcome is inferred. Manny identified these Race HUD defects from the deployed screen: item art is too small, a gold star on the item frame is unnecessary, the Surface panel below the item is unnecessary, and the upper-right speed gauge is clipped.

The deployed desktop Race HUD correction was merged through PR #192 at `4f0cbb696c17e4c54e365505007ba81717925c80`, then explicitly accepted by Manny. It enlarges held-item art into the former Surface panel space, removes the yellow star and visible Surface marker, and fits the speedometer within its upper-right panel. This is a desktop correction checkpoint only; mobile HUD acceptance is not inferred.

Manny then reported that the desktop Results card buried the podium backdrop. The requested presentation places only the top three full-body victory portraits, scaled to stand on the backdrop's gold podiums; keeps a compact Race Results panel in an upper corner with all eight standings and the 4th–8th lower-finisher reaction-art rail; and places Race Again, Change Driver, and Return to Hub beneath the podium. The in-progress correction has regression contracts for the podium-stage/card/actions hierarchy and responsive placement. Focused Results tests passed **43 tests**; full local `npm run validate` passed **74 test files / 609 tests**, strict typecheck, lint, runtime-asset checks, and production build. Connected Chrome returned `net::ERR_BLOCKED_BY_CLIENT` for the local Vite preview, so no browser visual pass is claimed. Task 11 remains **OPEN and paused** pending code review, approval-gated publication, deployed Results review, and Manny's explicit acceptance; Task 10 remains **PASSED BY PRODUCT-OWNER MANUAL REVIEW**.

## Results composition follow-up candidate — 2026-09-28

Manny's deployed 1917 × 904 Results screenshot showed the 1st-place shoe approximately 45 px below the center platform top, the 2nd-place feet approximately 50 px below the left platform top, and the 3rd-place feet approximately 30–40 px below the right platform top. The current eight-row list also consumed most of the upper-right board, leaving five small reaction tiles underneath. The local candidate removes that list and enlarges places 4–8 into image cards with placing/name/time overlaid at the bottom; independent portrait anchors lift each winner toward the visible gold top edge. Tests now assert no duplicate list, five ordered lower-finish cards, preserved late-finish updates/actions, the corrected desktop anchors, preserved finish times and Racing placeholders, and scrollable overflow on short viewports. Focused Results/routing suites passed 36 tests; full `npm run validate` passed 74 files / 609 tests with typecheck, lint, asset verification, and production build. These DOM/style contracts do not prove the actual rendered feet align at every viewport. Task 11 remains OPEN and paused until approval-gated publication and Manny's deployed desktop/mobile acceptance; Task 10 remains PASSED by Manny's manual review.

Independent code review found and corrected three regressions before publication: hidden finish times, unfinished racers missing from the card view, and clipped cards on short mobile viewports. The Results board now scrolls on overflow and is keyboard focusable with a visible focus outline; the five cards include Racing placeholders until authoritative placements arrive. A rendered desktop/mobile visual pass is still required because stylesheet assertions cannot prove feet/platform registration.


## Task 11 updated Results/Podium deployed acceptance — 2026-09-28

- Production implementation: PR #197, merged at `fa4f9e6171730dd62033dc1912f4f1b60200e3a0`.
- Post-merge CI/GitHub Pages: run `36464412874` — **PASS**.
- Product-owner deployed visual review: Manny stated, **“Updated podium deployment approved.”**
- Recorded evidence: PR #197 comment `5876242101`.
- Accepted scope: the updated deployed Results/Podium composition, including the larger 4th–8th reaction-card treatment and revised top-three podium placement.
- Boundary: no browser/device identity, mobile-specific behavior, or complete-flow acceptance is inferred unless separately reported. Task 11 remains open for those unreported criteria; Task 10 remains passed.

## Task 11 phone landscape report and candidate verification — 2026-09-28

Manny supplied a portrait race screenshot and four landscape screenshots from his phone. Portrait was described as “mostly perfect.” Landscape race showed the large desktop item and Boost panels overlapping the minimap/wheel and touch controls, with keyboard help visible; landscape Title and Hub hid navigation below the viewport without working scroll. Character Select could scroll. **These images document the pre-fix defect state only; they do not depict the corrected branch preview or production layout.** They establish the problem to fix, not mobile acceptance.

For the local CSS candidate on `fix/mobile-landscape-layout`, full `npm run validate` passed **74 files / 609 tests**, including typecheck, lint, runtime-asset verification and build; `git lfs fsck` and `git diff --check` passed. A browser viewport render was unavailable in the local environment, so the CSS checks do not establish actual spacing, tap usability, or scroll reachability. Review the authorized branch preview on a real phone in landscape: scroll Title to Press Start; scroll Hub to the Circuit Alpha Play action and utility navigation; scroll the utility screens; enter a race and verify the minimap, lap/time/position, speed, Boost, wheel, Rear/Brake/Item/Drift controls, warnings, and safe areas do not overlap or block the road. Rotate to portrait and confirm the previously reviewed layout is intact. The accepted preview outcome and available evidence are recorded below; exact device/viewport were not reported. Production publication is recorded below; keep Task 11 open until its remaining criteria are accepted.


## Task 11 landscape branch-preview owner acceptance — 2026-09-28

Manny passed the landscape rework after reviewing the authorized branch preview. Reviewed implementation commit: `9aceba5de4c5d184772d3467f47463b26a633df0`. Preview URL: https://manaconda33.github.io/manacondas-minigame-mayhem/previews/race-hud-results/. Pages validation/deployment run: [`36476447976`](https://github.com/Manaconda33/manacondas-minigame-mayhem/actions/runs/36476447976), successful. This records acceptance of the landscape correction only; no exact device/viewport, portrait, mobile Results/Podium, or full-flow outcome was inferred at that checkpoint. Manny later passed the portrait Race HUD separately, as recorded below. This is not production/live acceptance. Keep Task 11 open for remaining criteria and the PR was unmerged pending release approval at the time; its approval and merge are recorded below.


## Task 11 landscape correction production deployment — 2026-09-28

Manny approved publication after passing the branch preview. PR #200 squash-merged at `998db2f31b8012366b7c813f7fba08d609d8f5da`; post-merge CI/GitHub Pages run [`36479382762`](https://github.com/Manaconda33/manacondas-minigame-mayhem/actions/runs/36479382762) passed validation, build, artifact assembly, and production deployment. The deployed CSS matches the reviewed implementation at `9aceba5de4c5d184772d3467f47463b26a633df0`. **At this chronological checkpoint, no separate post-deployment review had yet been recorded; Manny's later production full-flow acceptance below covers the corrected landscape flow. The screenshots above are pre-fix defect examples, not screenshots of the deployed correction.** At that point mobile Results/Podium and complete-flow review remained open; Manny's later Results/Podium pass is recorded below. Keep Task 11 open for complete-flow and other unreviewed criteria.


## Task 11 portrait mobile Race HUD owner acceptance — 2026-09-28

Manny clarified that the remaining Race HUD orientation was portrait and explicitly passed it with **“It passes.”** Record the portrait mobile Race HUD checkpoint as passed by product-owner review. No device model, viewport dimensions, or additional interaction checklist is inferred from this statement. At this portrait checkpoint, Results/Podium was not inferred; Manny's later explicit mobile Results/Podium pass is recorded below. The complete mobile flow and all other unreviewed criteria remain open.


## Task 11 mobile Results/Podium owner acceptance — 2026-09-28

Manny clarified that **both the portrait mobile Race HUD and Results/Podium pass**. Record the mobile Results/Podium checkpoint as passed by product-owner review. No device/browser or individual finish-place scenario is inferred. Manny's subsequent complete-flow acceptance is recorded below.


## Task 11 complete-flow owner acceptance — 2026-09-28

Manny confirmed the complete production Title → Hub → Character Select → Race → Results flow passes on desktop and mobile in both portrait and landscape. Mark the PRD full-flow criterion **PASSED BY PRODUCT-OWNER REVIEW**. This later production-flow acceptance covers the corrected landscape navigation and Race HUD; the earlier supplied screenshots document only the pre-fix defect. The separately accepted mobile HUD and Results/Podium and landscape correction are not to be repeated without a regression.

Manny reported the remaining individual Task 11 checks passed on 2026-09-28: 1st/2nd/3rd/8th finish-place cases; Race Again, Change Driver, and Return to Hub; all fifteen item-art states at HUD size; missing-art fallback; reduced-motion Results behavior; and the explicit Route Night reference comparison. These are now PASSED BY PRODUCT-OWNER REVIEW, not open evidence gaps. No browser/device details are inferred. Slice 6's broader release gates remain separate, including production/final-lap audio, full-game Medium performance and browser-matrix evidence, final quality checklist, and complete release evidence. Settings persistence/graphics presets have been implemented and deployed; Task 10's five-restart gate was passed by Manny's manual review.

After this documentation reconciliation, `npm run validate` passed typecheck, lint, **74 test files / 609 tests**, branding/runtime-asset checks, and production build; coverage was **82.01% statements / 76.49% branches / 87.04% functions / 83.77% lines**. `git diff --check` and `git lfs fsck` passed. The existing nonblocking large `KartTimeTrial` bundle warning remains.


## Task 11 remaining plan-level scenario owner acceptance — 2026-09-28

Manny reported all remaining plan-level checks passed: 1st/2nd/3rd/8th finish-place cases; Race Again, Change Driver, and Return to Hub; all fifteen item-art states at HUD size; missing-art fallback; reduced-motion Results behavior; and comparison with the canonical Route Night target/design brief. Together with the previously recorded desktop and mobile portrait/landscape full-flow pass, Task 11's listed acceptance checks are complete. No browser/device details or additional measurements are inferred. Broader Slice 6 release gates remain open.


## SFX review assets v1 — asset-only verification

The listening-approved source package is in `assets/audio/sfx-review-v1/` with byte-identical runtime copies now mounted in the production game after the approved publication below. After LFS checkout, run `python assets/audio/sfx-review-v1/verify_sfx.py`. It verifies the exact 96 manifest hashes, mono 48 kHz PCM16 WAV format, durations, at least 3 dB peak headroom, 13 loop boundaries, and faded one-shot endpoints. For regeneration, use Python 3.12.14 and `python -m pip install -r assets/audio/sfx-review-v1/requirements.txt`, then `python assets/audio/sfx-review-v1/create_sfx.py`; validate against the committed original manifest, not hashes rewritten by the generator.

Serve the repository locally (`python -m http.server 8000`) and open `/assets/audio/sfx-review-v1/preview.html` for listening. This review preview loads its relative WAV files and is not a GitHub Pages production publication. Test engine layers, tires, boosts/impacts, countdown/finish, distinguishing Seeker/Apex warnings, item signatures, and short UI cues through headphones and phone speakers. Record Manny's listening approval separately from the automated waveform/hash checks; Manny approved the assets themselves on 2026-09-30. In-game mix/spatialization/pause/voice budgets and music transitions require a later approved runtime integration. Do not repeat accepted Task 10/11 flow gates absent regression.

**Recorded asset-publication evidence, 2026-09-30:** Actions run `36679705301` passed exact regeneration/hash comparison, unchanged LFS pointer staging, upload of all 96 objects, cache deletion and remote fetch-back, `git lfs fsck`, and the independent WAV verifier. The same runner passed clean `npm ci` and full `npm run validate` with 74 test files / 609 tests, typecheck, lint, branding/runtime-asset validation, and production build. Asset listening subsequently passed; in-game listening was approved on 2026-09-30. Main was not modified.


## SFX racing preview listening checkpoint — 2026-09-30

Manny authorized the runtime review integration after asset-only listening acceptance. Run `npm run validate`, `git lfs fsck`, and `git diff --check`; build runs `tools/verify-sfx-assets.mjs` to enforce all 96 approved binary hashes. Focused bank/runtime tests cover gain application, capped/keyed voices, suspension/pause/disposal, visibility silence for UI, countdown/finish deduplication, distinct warnings, and actual item commit/rejection routing. Automated checks do not establish perceptual mix quality or phone-browser acceptance.

Use the private listening preview linked from PR #208 for the full Title → Hub → Character Select → Race → Results listening pass. Listen through headphones and phone speakers: engine pitch/nearby AI, terrain/drift/boost and contacts; countdown/laps/finish; item pickup/ready/use/travel/impact and distinguishable incoming Seeker/Apex warnings; menus and results. Check Master, SFX, and Engine controls separately; pause, hide/return, restart, and return to Hub must leave no stale loops or queued bursts. Check normal rejected item use preserves held inventory. Existing item fixture URLs can accelerate isolated family checks. Record in-game listening acceptance separately, then seek production publication approval. Do not repeat accepted Task 10/11 layout/flow gates absent a regression. Existing Prismatic music is retained; new music/final-lap music is outside this checkpoint.

Local integration verification passed typecheck, zero-warning lint, **78 test files / 621 tests**, exact hashes/signatures for all 96 runtime WAVs, branding/runtime-asset gates and build. Coverage: **81.55% statements / 75.74% branches / 85.60% functions / 83.42% lines**. `git diff --check` and `git lfs fsck` passed. Existing nonblocking bundle-size warning remains. Hosted CI/Pages and public-browser evidence are recorded on the integration PR after publication.

Hosted runtime CI `36717679327` passed at `970d8975c95a166741ee92c6788a981fc0ba3ae7`. Pages preview run `36717675616` passed build/validation/LFS and artifact upload, then the `github-pages` environment rejected the review branch before deployment. No production publication occurred. The blocked branch-only workflow was removed; use the separately hosted private listening checkpoint. Private-host deployment evidence is recorded on PR #208 after publication; no browser or perceptual acceptance is inferred from deployment success.

Private listening preview publication PASS: https://manaconda-sfx-listening-review.manaconda2433.chatgpt.site. Owner-private Sites deployment `appgdep_6abd081694388191bb00e4252e51d22a` succeeded from static snapshot source `b9c87fa4a1e4a23da940b2b24e6dc83bec4609b7`, compiled from GitHub runtime `970d8975c95a166741ee92c6788a981fc0ba3ae7` with root base. The snapshot includes `review-build.json` provenance and all approved audio hashes were checked before packaging. At preview publication no public-browser/device or in-game listening pass was claimed; later in-game approval is recorded below. Current head only reconciles docs/removes the blocked preview workflow; runtime code matches that listening snapshot.


## SFX in-game listening approval — 2026-09-30

Manny approved the full racing sound experience in PR #208's private preview: **PASSED BY PRODUCT-OWNER REVIEW**. This is separate from the earlier asset-only approval and applies to runtime `970d8975c95a166741ee92c6788a981fc0ba3ae7` (runtime-identical PR head `2fba07ffb1930b5128fe62bc508b6ba442d4300d`, CI `36718861105` passed). No browser/device details, per-cue coverage or additional measurements are inferred. Do not repeat accepted listening/layout/flow gates without a regression. Production merge/publication was separately approved and completed below. Music/final-lap music and broader release gates remain open.


## SFX production deployment verification — 2026-09-30

Manny separately authorized merge/publication after approving in-game listening. PR #208 merged as `d380921d44aaf7ad9c614eed949546add3cf471b` (asset PR #207 included/merged). Main CI/Pages [`36725796666`](https://github.com/Manaconda33/manacondas-minigame-mayhem/actions/runs/36725796666) passed validation and deployment. Exact merged runtime/assets match the accepted listening build. Independent HTTP verification fetched every one of the 96 production WAV URLs with manifest revision queries and passed exact SHA-256 plus RIFF/WAVE signature checks; the production index/module bundle matched the merged build. Local build, `git lfs fsck` and diff checks passed. The approval and delivered-file checks do not invent additional device/browser details or a new perceptual pass. SFX are now live at https://manaconda33.github.io/manacondas-minigame-mayhem/. New music/final-lap music and other release gates remain open.

## Music revision 2 integration — review branch, 2026-09-30

`npm run validate` passed **81 files / 642 tests**, with **82.01% statement / 76.36% branch / 85.70% function / 83.93% line coverage**, strict typecheck, zero-warning lint, build and asset gates. Baseline before changes was 78 files / 621 tests. `tools/verify-music-assets.mjs` checks each accepted SHA-256 plus materialized RIFF/WAVE, stereo PCM16/48kHz and exact loop sample count. Existing 96 SFX hashes remain valid; LFS fsck passed.

Focused production director/output/routing tests cover first-gesture unlock, continuous Title/Hub, stale decodes, bar-clock final-lap scheduling, bounded crossfades, pause and Prismatic duck, effective Master/Music gain applied once, hidden-tab stop/position restoration, suspended-context recovery, finish superseding scheduled final lap, and disposal during decode/unlock. New routing/lifecycle cases were observed failing before implementation/fixes, then passed with the full suite. Native transport scheduling uses injected AudioContext fixtures; these checks do not establish audibility, browser/device performance or integrated listening acceptance.

Manny already accepted the five revision 2 loops and sample race/final-lap transition. Private integrated review should assess menu/selection/race/final-lap/Results cue changes, SFX/music balance, Prismatic duck, sliders, pause/visibility, and race navigation as music-specific cases. Do not repeat accepted Task 10/11 or SFX evidence without a regression. Integrated listening acceptance and separate protected-main production publication remain pending.

Independent review fixes add four passing regressions: delayed Results load cancels the scheduled final lap immediately; rapid Hub → Select → Hub uses a fresh decode after abort and preserves request identity; suspended restart/route changes stop obsolete sources before resumption; silent countdown retains prepared race audio without another race download at GO. The three review findings and countdown case were each observed failing before fixes. No separate minor review findings were reported.

Hosted PR validation run `36765665421` succeeded for canonical code `f4c381b8ac101e2acc5157c4328c5eeac060ef23`. Owner-private integrated review: https://manaconda-music-integration-review.manaconda2433.chatgpt.site. Deployment succeeded; the checked root-base snapshot records source/hash provenance at `/review-build.json`. Perceptual listening has not been inferred from automated checks or deployment success. Await Manny's integrated listening acceptance, then separate merge/production approval.


## Music production publication verification — 2026-09-30

Manny explicitly approved integrated listening, merge and production publication. PR #210 merged at `40f42c13a7700257aebc87cf7b8fe80e707e3837`; post-merge CI/Pages run `36770873477` passed all validation and deployment steps. Fresh local validation passed 81 files / 642 tests, typecheck, zero-warning lint, exact asset gates, build and LFS fsck. The delivered entry module matched the accepted build; all five base-aware revisioned WAV URLs returned HTTP 200 with exact approved SHA-256s and RIFF/WAVE signatures. `docs/evidence/2026-09-30-music-production-delivery.json` records URL/hash/byte-count evidence.

For subsequent publication, derive each runtime URL from `assets/audio/music-review-v2/manifest.json` as `assets/audio/music-v2/<file>?v=<first 12 SHA-256 characters>`, fetch actual bytes after Pages succeeds, and compare SHA-256 and RIFF/WAVE signatures. Compare the served entry module against the validated production build. Do not treat a pre-deployment 404 as final delivery evidence. Integrated listening is PASSED BY PRODUCT-OWNER REVIEW; no additional device/performance claim is inferred. Earlier pending text is historical. Broader Slice 6 release gates remain separate.


## Planned full-race diagnostics verification — implementation pending, 2026-09-30

The approved next increment is specified in `docs/superpowers/plans/2026-09-30-full-race-diagnostics-medium-baseline.md`. Test raw RAF stalls separately from simulation clamp; paused/hidden/countdown/resume exclusion; bounded immutable capture; post-render counters; exact opt-in/disabled behavior; JSON download and race-generation/disposal cleanup. Keep existing ItemPerformanceMeter tests/evidence intact. Record future actual results rather than treating this setup as a passing diagnostics implementation.

For the Medium baseline, identify source, browser/OS/device, eight racers, complete ordinary race, Medium preset and actual 1920×1080 drawing buffer/DPR; export raw capture, quantile method, long-frame observations and draw-call/triangle maxima. Mark GPU timing, texture bytes and unsupported heap values unavailable. Unit tests or a short/truncated capture do not close the full-race PRD gate. Task 3 adds the detailed reproducible methodology and actual capture index. Existing accepted restart/listening/full-flow gates are not reopened.

## Opt-in whole-race diagnostics — review increment, 2026-09-30

Use only `?testRacePerf=1` to enable the race-owned raw RAF capture and diagnostic-only panel. Other values/absent flags leave ordinary UI and per-frame diagnostics disabled. `testItemPerf` remains unchanged and subsystem-only. Methodology: `docs/SLICE-6-MEDIUM-PERFORMANCE-METHODOLOGY.md`; actual evidence/pending baseline: `docs/evidence/2026-09-30-medium-baseline/README.md`.

Focused commands: `npx vitest run tests/race-performance-meter.test.ts tests/renderer-counters.test.ts tests/race-diagnostics-routing.test.ts tests/race-diagnostics-panel-routing.test.ts tests/item-performance-meter.test.ts tests/settings.test.ts tests/music-routing.test.ts tests/results-routing.test.ts`. Race routing tests construct the real KartTimeTrial and drive injected RAF timestamps with a fake renderer; they prove raw 250 ms versus unchanged simulation 0.1 seconds, counter order, eligibility boundaries and lifecycle, not actual GPU/hardware performance. App tests prove flag isolation, JSON export/revocation, Results availability, stale callbacks/buttons and disposal after delayed startup. Run full `npm run validate`, `git diff --check`, `git lfs fsck` before review publication.

No short/provenance-incomplete/JSDOM capture closes the eight-racer 1920×1080 Medium gate. Hardware, complete race, dimensions, source and nontruncated evidence remain required. No old owner acceptance is reopened; merge/production and later graphics work remain gated.

Diagnostics runtime checkpoint `4673aac5caae8c8b153526a74afb9d70cb24c15f` passed hosted PR CI [36786989565](https://github.com/Manaconda33/manacondas-minigame-mayhem/actions/runs/36786989565): fresh LFS checkout/fsck, clean install, strict typecheck, zero-warning lint, 85 files / 663 tests, asset gates and production build. Local final statement coverage 86.62%; exact output saved in the evidence directory. A separate self-review fixed the hardware-input driving-key interaction with RED→GREEN coverage. Cloud rendered-runtime check is blocked by the owner-private preview's sign-in wall; no smoke/capture pass is claimed. Production/main is unchanged.

## Static kart submission optimization review — 2026-09-30

Run `npx vitest run tests/kart-mesh-batching.test.ts tests/race-diagnostics-routing.test.ts`, then full `npm run validate`, `git diff --check`, `git lfs fsck`. Tests parse all twelve production GLBs and preserve indexed world positions/normals/UVs/material/shadow policy and dynamic controls; embedded PNG decoding alone is stubbed in JSDOM. Routing proves player/seven-AI installation, animation bypass, release and delayed-AI disposal guard. Structural submission inventory and exact RED/GREEN/full output: `docs/evidence/2026-09-30-kart-optimization/`. No hardware/rendered visual or FPS improvement is inferred. Compare Medium on Manny's same mobile device against the saved 321-call baseline using the evidence-index review procedure. Existing accepted gates remain passed; this increment's runtime merge/publication remains separate.

## Player wheel dust owner visual acceptance — 2026-09-30

Manny approved the private version 4 bounded wheel-dust checkpoint with “Approved.” Runtime `1cfda76e2585d1a8df02122e39727195abae85ee` matches the runtime files at accepted PR head `dee5a9682c1fd71a3200d691d638fbd194bef4a3`, final CI `36801027238` success. **PASSED BY PRODUCT-OWNER REVIEW.** No additional device/per-scenario or performance measurements are inferred. Existing approvals remain passed and must not be repeated. Separate merge/public production publication approval remains pending; earlier dust visual-pending statements are historical. Evidence and exact saved-preview provenance: `docs/evidence/2026-09-30-wheel-dust/`.

## Player wheel dust public release — 2026-09-30

Manny separately approved merge and public release with “Yep, approved.” PR #215 merged at `416e5e2b4c1a2ffc4949607ea8a028f96125e338`; final PR CI `36801543503` and post-merge CI/Pages `36801897851` passed. The delivered public index, entry JS, KartTimeTrial JS and CSS returned HTTP 200 with exact validated-build SHA-256s (`docs/evidence/2026-09-30-wheel-dust/production-delivery.json`). Source/runtime matches accepted private version 4; root-base versus Pages-base bundles intentionally differ. No visual approval, browser/device/performance or asset acceptance is reopened. Broader release/performance gates remain open. Previous pending publication statements are historical.

## AI drift and wheel dust public release — 2026-10-01

Manny's “Approved - merge & publish approved.” closes both new-effect visual acceptance and explicit public release approval. Accepted PR head `b61a85e7f48bd7830cabce42b3676124a2a223ef`, CI `36861828504` success; runtime source matches accepted private version 5. PR #217 merge `8380390ed07d281d8b99a3956272550ff6fdf0a6`, CI/Pages `36865162215` success. Public index/entry JS/kart JS/CSS were fetched and matched the validated Pages-base build exactly; root-base private bundles intentionally differ. No additional device/per-scenario or performance measurements are inferred. Earlier pending gates are historical; existing acceptance must not be repeated. Broader release/performance gates remain open.


## Circuit Alpha terrain material review — 2026-10-01

Scope: approved grass/dirt/shoulder material completion, preserving accepted asphalt, geometry and gameplay. Focused command: `npx vitest run tests/terrain-materials.test.ts tests/track-materials.test.ts tests/track-scene.test.ts`. Check world-scaled/seam-safe UVs, separate albedo/normal/shared ARM roles, sRGB versus linear maps, unchanged track samples, optional-map fallback, shared disposal and late failures after race teardown. Four pre-implementation behavioral failures are recorded; focused 3-file / 12-test run and full 99-file / 768-test validation passed. Asset gate validates nine JPEG signatures, byte counts and SHA-256s against `public/assets/track/materials/terrain-v1/manifest.json`; pointer and changed-byte negative checks passed. Existing accepted asphalt hashes remain unchanged.

Optional browser reproduction: supply `TERRAIN_PLAYWRIGHT_PATH` (external Playwright Core index.mjs) and `TERRAIN_CHROMIUM_PATH` (Chromium executable), then `node tools/verify-terrain-browser.mjs`. The runner starts its own Vite server, loads actual material/scene shaders, records comparison renders and failed-network fallback, then checks desktop/portrait race startup. Software WebGL results do not establish owner visual approval, complete gameplay or device performance. Evidence: `docs/evidence/2026-10-01-terrain-materials/`.

Owner preview acceptance should check readable soil/grass/gravel, preserved violet shoulder and dusk identity, no obvious seams or distracting shimmer, unchanged road/karts/HUD/bloom/blur, and no missing material after restart. Do not repeat accepted Task 10/11 or five-restart tests unless a regression appears. Diagnostics is deferred by owner until visual improvements are finished; PRD performance criteria remain unchanged. Runtime production merge/deployment requires separate approval.

## Lunarcrystal kart candidate verification — 2026-10-02

Run `python tools/assets/test_lunarcrystal_kart_contract.py`. Actual GLB exports must reproduce identical bytes for all three LODs; preserve the 13-node kart hierarchy, materialized wheel/steering/exhaust meshes, -Z forward metadata, finite bounded positions and 25k/12k/5k triangle budgets. The test first failed because the builder was missing; the initial lowest LOD then exceeded 5k and detail was reduced before a passing run. Render the actual model with `python tools/assets/build_lunarcrystal_kart.py`; inspect front/rear/top/side silhouette, emblem/hubs, lantern attachment and steering clearance. These orthographic geometry renders do not establish live PBR lighting, runtime cockpit placement, owner acceptance or device performance. Run full `npm run validate`, approved-2D verifier, diff and LFS checks before checkpoint.

## Lunarcrystal integration review — 2026-10-02

Focused behavioral tests: `npx vitest run tests/lunarcrystal-integration.test.ts tests/character-manifest.test.ts tests/character-select-ui.test.ts tests/race-roster.test.ts tests/race-results-assets.test.ts tests/kart-mesh-batching.test.ts`. Four new integration cases were observed failing before implementation: profile/asset binding, page-two selection restoration, roster eligibility and Results mappings. They now pass, including exact key-to-frame URLs, unchanged page-one order, normal seven-opponent Lunarcrystal eligibility and correct finish-place limits. Actual Lunarcrystal GLB parsing joins the static batching preservation test. `npm run validate` includes fourteen-art hashes and three-model hash/hierarchy/triangle-budget gates. Offline normalized all-ten-frame montage inspection does not establish live Three.js lighting or owner gameplay acceptance. Future Pages review must inspect page two, kart preview, both race cameras/action poses, finish poses and a restart without redoing accepted unrelated gates.

## Circuit Alpha shadow-polish recreation gate — 2026-10-02

Run `npx vitest run tests/race-shadows.test.ts tests/race-diagnostics-routing.test.ts`, full `npm run validate`, `git diff --check` and `git lfs fsck`. Cover player priority, 12 dynamic roots rather than submeshes, 55m distance retirement, opaque projectile eligibility and energy exclusion, hidden/sprite exclusion, local-volume snapping/recovery, Low-off and once-only cleanup. Real-race routing must apply the policy before rendering and after delayed AI model/batch installation. Preserve accepted static lighting/materials and all other gates. Hosted CI and SHA-pinned review delivery are required. Owner review checks grounding, stability while driving/rear view/recovery, nearby-racer shadows and desktop/mobile legibility; new shadow visual acceptance is not implied by automated tests. Final device-performance/browser-matrix evidence remains separately deferred.

## Circuit Alpha shadow-polish production release — 2026-10-02

Owner visual acceptance applies to pinned runtime `efbcc74f5c8103d2b6411c8bdedd35953b224f3f`. Reconciliation head `297ac6e66b833cf9535fd90b87e32d03f7054539` has no `src/` or `public/` difference from that accepted runtime. Exact-head PR CI `37066044882` passed before the locked merge. PR #240 merged at `168ba8113d37ad0672345a2326d20d279115c9d8`; post-merge run `37066390953` passed Git LFS fsck, typecheck, zero-warning lint, **101 test files / 780 tests**, runtime asset verification and production build. The same run successfully rebuilt and retained the six Pages previews: race-hud-results, Archer, motion-blur, terrain-materials, Lunarcrystal and shadow-polish. Validate job `111035091264` assembled Pages artifact `11253670136` (1,155,634,227 bytes, `sha256:7776208b43af0f23303c1e8f35cf9f1da0581956886cba37045831c18d70031f`); deploy job `111036876514` reported Pages deployment success. Artifact listing verifies production Lunarcrystal GLBs/PNG package and terrain materials are present along with the retained previews. Independent public-host HTTP/hash refetch was unavailable from the current execution environment, so do not infer a second browser replay or fresh device-performance result. Final diagnostics remain deferred; camera polish remains separate.

### Owner production-root confirmation — 2026-10-02

After the successful GitHub Pages deployment, Manny replayed the production-root build and reported **“production passes.”** Record the owner post-deploy gameplay gate as PASS for the shadow-polish release. This does not create a new device-performance measurement or machine HTTP/hash verification; those remain distinct evidence categories. Camera polish remains later and final diagnostics remain deferred.


## Neon Grid Stage 1 geometric design checkpoint — 2026-10-02

Run `python docs/design/neon-grid/build_layout.py` with Python 3, numpy and matplotlib. It reproduces the layout JSON/SVG/PNG and asserts a 1,400–1,500 m dense curve, 12 distinct ordered checkpoint sites, strictly higher shortcut rejoins, no ordered gate within skipped intervals, no unintended forward main-curve crossing inside the proposed 13 m half-width / 1.5 m height tolerance, and all eight geometric shortcut combinations tracing gates 1→11→0. The 2026-10-02 design run passed at 1,450.001 m dense / 1,448.938 m using 200 divisions; race sample spacing is 3.776 m. These are geometric checks, not runtime, Rapier, all-shortcut lap, device-performance or owner acceptance evidence. Runtime requirements and review gates are in `docs/superpowers/plans/2026-10-02-neon-grid.md`; contract review remains pending.


Manny's sharper-hairpin correction was applied on 2026-10-02: geometry, gate placement, main-curve footprint crossings and all eight shortcut traces were regenerated and passed. This revises the shape; runtime driving/shortcut timing remains untested.


### Neon Grid full-hairpin bypass correction — 2026-10-02

Manny directed the service tunnel to bypass **all fuchsia hairpins**. Entry/rejoin are now 0.246549→0.461541, bracketing the complete Undercity hairpin sequence; gates 4/5 moved onto shared road before/after it. All eight geometric path traces and gate-footprint checks pass. The earlier 1.0–1.4 s tunnel saving target is superseded; measure the full bypass during blockout. Owner shape/token acceptance and runtime tests remain pending.

## Neon Grid approved execution scope — 2026-10-02

Tokens are omitted. Retain all Alpha regressions. Stage 2 must prove the shared track contract, Three.js geometry/widths, real Rapier deck/street/climb support, elevated gates, selected-route restart/replay, eight-racer race and resource cleanup. Stage 3 verifies persistent racer-owned shortcuts, all eight physical gate sequences, billboard race-time cycle/static tuning, physical dive/miss/recovery and paired timing. Later scene/audio/device acceptance uses the saved plan checkpoints. Numeric design validation is not runtime evidence.


## Neon Grid mobile preview repair — 2026-10-02

Manny rejected Stage 2 mobile review: the countdown grid was visible, AI drove away, the player stayed at 0 km/h and the camera lost the kart. The main-route owner gate is **FAIL / awaiting corrected-preview retest**; do not begin Stage 3 or merge runtime PR #242.

Root cause reproduced: ChaseCamera positioned itself relative to the elevated kart but aimed at absolute world Y=0.65/1.15. The portrait integration test projects the player above the viewport after the intro. Neon now supplies local road elevation to the existing intro/chase/rear aim; Alpha retains the zero-base default and accepted settings. No control, camera-distance, physics, track shape, roster, asset or audio redesign.

Real pointer binding → touch wheel → player drive → countdown → eight-body Rapier simulation moves AA-02, Archer and Lunarcrystal from the elevated grid. This does not reproduce a separate mobile input defect or certify device behavior; Manny must retest steering/acceleration/brake/drift/item/rear view on the corrected pinned preview. Evidence: docs/evidence/2026-10-02-neon-grid/mobile-repair.md. Full native and hosted results are recorded there; publication and owner review remain distinct.

Regression: `tests/chase-camera.test.ts` checks elevation-invariant intro/chase/rear framing in desktop/mobile. `tests/race-diagnostics-routing.test.ts` checks portrait player framing through actual camera wiring and mobile pointer-driven movement after real countdown for three driver profiles. Only WebGL/assets/audio boundaries are mocked; physics, race state, input composition and camera math are real. Run full `npm run validate`, `git diff --check` and `git lfs fsck` before publication.


## Neon main-route rough-driving repair — 2026-10-03

Run focused npx vitest run tests/neon-grid-projection.test.ts tests/neon-grid-boundary-response.test.ts tests/neon-grid-driving.test.ts tests/minimap.test.ts tests/race-diagnostics-routing.test.ts, then full npm run validate, git diff --check and git lfs fsck. Exact projection reference comparisons cover varied positions/heights/far recovery, cache copy safety and changed-coordinate misses; nearby search must prune the full scan. Real Rapier boundary tests cover fixed Falls Run duplicate native impulse and bothside containment/support across five route locations. Map tests compare +Z-down Neon world transform with all eight DOM marker positions and actual race wiring; preserve Alpha orientation. Existing mobile pointer/portrait camera and eight-profile three-lap tests remain required.

Performance must be compared independently of passing tests: seed 404, three trials/circuit, 1,800 real simulation steps; record process.hrtime timings/projection CPU, and a 9,000-step continuous-throttle collision probe with production correction/cooldown. Reproducible temporary probes and raw data: docs/evidence/2026-10-03-neon-repair/. Remove probes from active tests before normal validation. Report legitimate impact tradeoffs, host variance and the absence of phone frame-time/GPU evidence; never infer smooth mobile driving from functional or process-CPU tests. Pinned preview delivery requires exact source marker/HTML/JS/CSS hashes and preserved production hashes. Owner phone portrait/landscape main-route review remains mandatory before shortcuts/scenery.


## Neon road-contact movement regression — 2026-10-03

Run `npx vitest run tests/neon-grid-road-motion.test.ts tests/neon-grid-collision.test.ts tests/neon-grid-boundary-response.test.ts tests/neon-grid-driving.test.ts tests/race-diagnostics-routing.test.ts tests/kart-controller.test.ts`, full `npm run validate`, `git diff --check` and `git lfs fsck`. The new real-physics regression measures actual planar displacement against pre-step velocity × 1/60 with a 2 mm bound on two flat authored road regions, alongside support and lateral containment; existing AI steering keeps the held-throttle fixture on the road. It fails with the old two-sided internal-edge collider even when speed-loss/backwards-only checks pass. ORIENTED + FIX_INTERNAL_EDGES must retain upward native road support and established boundary/Alpha/mobile/camera/lap behavior. Twelve-region native comparison preserves legitimate slope/contact tradeoffs; no universal native speed-loss or rendered/mobile smoothness claim. Probe/raw/red-green evidence: docs/evidence/2026-10-03-neon-road-contact/. Pinned delivery requires exact source and bytes plus unchanged production hashes. Manny must retest phone portrait/landscape main-route acceleration/steering/drift/brake/rear/items, tight hairpins, descent/climb, edge contact, map and replay before Stage 3/Dive/scenery. Older owner FAIL remains authoritative until that retest.

## Residual Neon climbing-bend diagnosis protocol — 2026-10-03

Follow docs/superpowers/plans/2026-10-03-neon-residual-turn-repair.md. Reproduce recorded lines/speeds; independently verify actual support coverage at deletion clusters; stage velocity/position observations around controller, physics and scripted barrier operations. Log wheel/center rays, driveSupported and every recovery/respawn trigger with before/after pose. AIRBORNE, missing faces and HUD FPS are not causal proof. Preserve diagnostic commands/parameters and expected-failure evidence outside the passing active suite. Add a failing independent regression only after physically verified diagnosis; repair remains owner-gated. Every numbered step requires evidence/status/ledger updates, verified push and a report to Manny before advancing. Runtime checkpoints still require the full existing typecheck/lint/test/build/diff/LFS gates. Documentation-only planning is checked by exact content/readback and diff scope; no new runtime validation result is claimed.

### Residual controlled native reproduction — 1.2

Run `node tools/diagnostics/neon-residual.mjs /tmp/neon-residual-reproduction.json` (existing Vite SSR, no added dependency). Opt-in native probe, not an active-suite regression or rendered race. aa-09, real production ribbon/controller, starts 0.78/0.80/0.81, 90 settling steps, dt 1/60, initial planar speed 29.7 m/s, held throttle/no brake/no drift with existing AI steering. No rivals/items. Records actual settled pose and all input/staged velocity data. Repeated summary match is evidence of native reproducibility, not recovered original player inputs. Full runtime gates remain required for tooling checkpoints; no corrective implementation before Step 4 owner review.

Residual line comparison: append `--matrix` to the native harness command. Uses 18 scenarios: three local starts, three signed lane targets and two speed conditions. Lane follower is explicit controlled input, not production AI or inferred player keys. Saves all inputs and compact trajectories/incident windows; replay regenerates full intermediate states. The artificial initial pad boost is labeled; it is not a full lap or actual pad-entry test. Signed inside/outside changes through an S-bend; compare achieved offsets, not requested labels alone.

Residual deletion mapping: `node tools/diagnostics/neon-coverage.mjs /tmp/neon-deletions.json`. Reconstruct all 3,072 original face triples and verify independent pre-Float32 winding against the 3,064 retained production faces. Exact removed indices/world coordinates are reproducible. Neither removed-face bounds nor centerline spans are support-hole dimensions; native coverage must be measured separately.

Residual support coverage: `node tools/diagnostics/neon-coverage.mjs /tmp/neon-coverage.json --probe`. Road-only native rays exclude self by construction. Sample all four deletion neighborhoods at 0.1m spacing plus tangent-aligned cuboid corner/wheel/center footprints at signed lanes -3/0/+3. Refine misses at 0.02m world spacing and 0.001–0.1m inward retreat. Report exact-edge misses separately from drivable-center/footprint misses, and save hit heights to avoid conflating coverage with smooth local support. Finite sampling is not a continuous support proof.

Residual surface shape: `node tools/diagnostics/neon-shape.mjs /tmp/neon-shape.json`. Independently intersect exact Float32 retained triangles to enumerate multiple support heights; compare actual Rapier center-ray feature/normal/height. Sample 0.02m along approach at body lateral corners, alongside authored centerline grades and triangle slopes. Center rays do not establish full body clearance or contact source; staged native manifold evidence remains required.

Residual support trace: `node tools/diagnostics/neon-residual.mjs /tmp/neon-support.json --trace`. Record pre-controller, post-controller and post-physics body pose/velocity, self-excluding four-wheel/center rays, grounded/centerGrounded/driveSupported, surface, boost and AIRBORNE. Independent predicate observations must be checked against unchanged baseline reproduction. Determine temporal order; a later AIRBORNE label does not establish an initiating hole or explain earlier native speed loss.

Residual native contact trace uses `--trace` to save nonempty road manifolds, shape IDs, full points/normals and Rapier impulse fields. Distinguish measured velocity from an impulse inferred through momentum; post-step zero impulse fields do not mean there was no within-step collision response.

Production diagnosis: copy `tools/diagnostics/neon-production-trace.fixture.txt` to `tests/neon-residual-production-probe.test.ts`, run `npx vitest run tests/neon-residual-production-probe.test.ts`, save `/tmp/neon-production-trace.json`, delete the temporary test, **assert it is absent**, then run full validation sequentially. This opt-in fixture is deliberately outside the active typed/linted suite. Real player simulate stages and recovery methods are observed; isolated opponents and external renderer/loader boundaries are labeled. Positive manual/below-road recoveries must be logged separately from the incident. Never overlap full checks with the temporary fixture.


## Residual Neon independent RED regression — Step5.1, 2026-10-03

Copy tools/diagnostics/neon-residual-regression.fixture.txt to tests/neon-grid-residual-bend.test.ts. Run typecheck and zero-warning lint on the fixture, then npx vitest run tests/neon-grid-residual-bend.test.ts; unchanged source must produce exactly3behavior failures/8controls PASS. Save full output and NEON_REGRESSION_TRACE JSON. Delete temporary test and assert absence **before** npm run validate, diff/LFS checks. Never overlap the temporary red fixture with normal validation. Promote the same test into the active suite for repair5.2 and verify RED-to-GREEN without relaxing bounds. Tests use actual movement/native velocities, no mesh-builder-derived expectations or runtime mocks. Controls cover both flat straights, supported/no-boundary onset and genuine falling/barrier slowdown. Bounds and limitations are documented in residual execution-progress.md5.1; these are regression tolerances, not new physics rules or proof of full-course/device acceptance.


## Step5.2 interrupted repair evidence — 2026-10-03

See residual repair-attempt-5.2.md and candidate-matrix-5.2.json. Candidate snapshots are opt-in source fixtures, not shipped runtime. New tools/diagnostics/neon-climbing-support.fixture.txt copies temporarily to tests/neon-grid-climbing-support.test.ts alongside unchanged5.1regression. Original source yields5FAIL/8PASS across13checks; tested stitched candidates pass13, but existing boundary tests and native lane/speed safety checks expose failures beyond that suite. Keep assertions unchanged. Restore src/game/track/NeonGridGeometry.ts to754c0ff and delete temporary tests before normal validate; never mistake passing suite for elimination of measured native side-line launches. Existing shape diagnostic original-span/min-index classifier is incomplete for new mesh vertices; update measurement/classification independently before using it as complete repaired-patch coverage. No rendered/owner acceptance inferred.


## Residual 5.3 face inventory and physical probes

Shape probe compares each exact mesh triple with the complete original authored face set, including appended vertices and original-only contour ears. `neon-residual.mjs out.json --faces=shape.json` runs18targeted poses/lines/speeds per steep face and records explicit native manifold attribution; whole-run off-road falls are distinct from contact-only metrics. Preserve snapshot and original18-run legal-lane matrix independently; see residual repair-5.3.md.


### Residual 5.3 constrained-patch acceptance

Run `neon-patch-audit.mjs out.json` for exact original vertex/face preservation, authored centerline positions/shared edges, local manifold perimeter and area partition. Complete shape inventory must cover all patched triples including appended vertices and original-only ears; compare every patched slope with independent surrounding original entry/exit faces, not just a20degree filter. Preserve the original18-run `--matrix` parameters and require loss≤1.83m/s/zeroair. `--faces=archive.json --regions` retests original world regions after triangle IDs change; old IDs are labels only, current contacts are independently recorded. Keep whole-run off-road falls separate from new airtime on previously supported scenarios. Run unchanged19focused checks, remove temporary tests, then full111/850validate/diff/LFS gates; Paprika review precedes any preview. Evidence/reproduction/source digest: residual repair-5.3.md.


## Tunnel entrance/exit wall regression — 2026-10-03

Run `npx vitest run tests/neon-grid-tunnel-junction.test.ts tests/neon-grid-tunnel.test.ts tests/neon-grid-tunnel-driving.test.ts tests/neon-grid-tunnel-navigation.test.ts tests/neon-grid-tunnel-items.test.ts`, full `npm run validate`, `git diff --check`, `git lfs fsck`. Exact3.2m edges must remain consistently in the main aperture. Real wall triangles must not intrude into the joined road; every lower/upper wall corner must match a main-wall vertex within0.08m in3D. Test before/after racer traversal activation and release, and both±1cm sides of each distinct wall endpoint on outside lane3.3m. Native support/three-lap/gates/items/camera assertions remain unchanged. Preserve owner PASS for all remaining tunnel gameplay; owner focused retest of both wall joins is required before Task5 completion. Evidence: docs/evidence/2026-10-03-neon-tunnel/junction/.


## Billboard timing/traversal partial checkpoint — 2026-10-03

Run `npx vitest run tests/neon-grid-billboard.test.ts tests/neon-grid-billboard-driving.test.ts tests/race-diagnostics-routing.test.ts`, then full `npm run validate`, `git diff --check`, `git lfs fsck`. Pure phase boundaries3.2/4/5.2/6, forward mouth geometry, five main-sweeper lanes that must never select Billboard, reverse/reentry/reset and retained ON crossing state are covered. Native player12/24/30m/s × lanes-3/0/+3 × ON/OFF verifies support/passability/one planar tax. Four main/tunnel/billboard combinations physically earn1→11→0 exactly once for3laps; the360s fixture ceiling is not a lap/savings target. Actual race-time routing checks pause/recovery/disposal and six heading/state cases (forward/sideways/backward × ON/OFF). Full119files/937tests passed with all legacy tunnel/Alpha assertions retained. `node tools/diagnostics/neon-billboard-arrival.mjs output.json` reproduces eight independent first-mouth approaches, not a real pack or owner playtest.

Task6 visual support/render parity, tell readability, sponsor art, final first-lap phase, paired savings, AI rates and owner desktop/mobile preview review remain open. All8 shortcut combinations including Dive require Task7 implementation before runtime certification. Do not publish this partial render snapshot as a visual acceptance preview. STOP before Step3 for Manny’s requested visual-execution discussion. Evidence: docs/evidence/2026-10-03-neon-billboard/.

## Neon Grid Billboard Step3 visual verification — 2026-10-03

Run `npx vitest run tests/neon-grid-billboard-visual.test.ts tests/race-diagnostics-routing.test.ts tests/neon-grid-billboard.test.ts tests/neon-grid-billboard-driving.test.ts tests/neon-grid-tunnel-junction.test.ts`, then `npm run validate`, `git diff --check`, `git lfs fsck`. `tools/verify-billboard-assets.mjs` is part of runtimebuildgates and rejects missing/invalid/wrongdimension/wronghashads. Verify approvedupstreamfacingcopy,exact16:9surface/support,visiblewallapertures,staticrace-timephase/adselection,paused/hidden/resumefreeze,once-onlymouthcue,boundedfinitepoolandexpiry. Nativefloor/tunnel/controller/stat/item contracts remainaccepted. Sourceinventory/artapproval: visual-assets.json and NEON-GRID-BILLBOARD-ASSET-BRIEF.md.

PinnedPages ownerreview should cover visibleplaza/entrance/rejoin, boldcopy/readableON/OFFtell,subtleroadvisibility,smashcueobscuration anddriving ondesktop/mobile. Artworkapproval is notin-gameacceptance. Step4balance/initialphase remainspending; do notclaimuniversallap1OFF, measuredsaving or finalAIrates. NoDive/Stage4/productionrelease.

## Approved Billboard relocation regression gate — 2026-10-04 UTC

Run `npx vitest run tests/neon-grid-billboard-relocation.test.ts tests/neon-grid-billboard-driving.test.ts tests/neon-grid-billboard-visual.test.ts tests/neon-grid-billboard.test.ts tests/race-diagnostics-routing.test.ts`, then `npm run validate` and `git diff --check`. No LFS operations for this user-directed work. Curved8m native/render support, openprojectionindex, nonfoldingedges, fullframeclearance, pavedpreownershipsurface, real AIentry/physicalgates/savings and descendingexitplanarspeedfixture are covered. Existing four available route combinations over3laps and18playerphase/speed/lane cases remain required; all Alpha/tunnel regressions retained. `node tools/diagnostics/neon-billboard-relocation.mjs output.json` produces18real pairedsectionruns, no adapter/pack/items/full-lapclaim. Preserved initial6/4/2cycle and once.82tax; livefirstlapOFF/readabledelta/rates/ownerdesktopmobilefeel remainopen. Nativeedge/playerfixturelanes nowmatch8mwidth; exactanchors usejoinedfloor support rather than requiring isolated Float32 triangles to own the sharededge. Evidence: docs/evidence/2026-10-03-neon-billboard/relocation-*.


## Billboard exit native-motion regression — 2026-10-04

Run `npx vitest run tests/neon-grid-billboard-exit.test.ts tests/neon-grid-billboard-relocation.test.ts tests/neon-grid-billboard-driving.test.ts`, then `npm run validate` and `git diff --check`. The signed-lane exit regression measures actual native planar displacement against controller-predicted movement (steady speed alone is insufficient), requires one physical exit and zero airborne steps. Geometry regression hashes unchanged main positions/indices/materialgroups, verifies upward/grade-bounded exit faces and negligible Float32-only overlap. Inlay/native/render rays test shared support. Prejoin plaza ray fixtures retain isolated support/height assertions; joined rays inspect both main/plaza surfaces above the highest surface. No LFS operations. `node tools/diagnostics/neon-billboard-exit.mjs output.json --full` reproduces three lanes × three speeds and archives native contact/position windows; `--isolate=main`/`--isolate=plaza` are diagnostic controls that deliberately remove necessary support and cannot serve as repairs. Preserve route/gate/phase/retention/Alpha/tunnel tests. Full local122files/958tests and all gates PASS; hosted delivery/owner exit retest pending. Controlled high-speed held-throttle boundaries are reported, not a universal safe-line claim. Evidence: docs/evidence/2026-10-04-neon-billboard-exit/.

The combined tunnel native/render support and disposal fixture has an explicit15000ms hosted coverage budget after two5000ms-only CI timeouts (37179637987 attempts1/2). All267ray checks and disposal assertions remain unchanged; this does not establish a device performance target or waive gameplay acceptance.

## Waterfall Dive Task7 — 2026-10-04

Run `npx vitest run tests/neon-grid-dive.test.ts tests/neon-grid-lap-routes.test.ts tests/race-diagnostics-routing.test.ts`, then full `npm run validate` and `git diff --check`. Real native ramp-entry24/30m/s and26m/s±6° fixtures, edge/low-speed misses, reverse entry/reentry, racer ownership, once-only1.5s paused recovery, actual player/AI recovery cleanup and Rocket flight are required. All8shortcut combinations over3laps on two body profiles physically earn1→11→0; no projection/recovery awards gates. The unchanged main-ribbon SHA check remains in billboard-exit tests; do not relax existing Alpha/tunnel/billboard assertions.

Re-run `node tools/diagnostics/neon-residual.mjs docs/evidence/2026-10-04-neon-dive/repair-matrix.json --matrix`; require all18scenarios zeroair and native loss<=1.83m/s. Run `node tools/diagnostics/neon-dive.mjs docs/evidence/2026-10-04-neon-dive/paired-trajectories.json` for real paired gate8→gate9 sections; report misses separately and do not tune physics/stats or choose final joint AI rates. A full-road mesh raycast inside every support edge search is too expensive under coverage; use exact unchanged boundary intersections and retain the native assertions.

Pinned Dive delivery must compare hosted HTML/source marker/bundles/CSS and retained production/5.3/tunnel/billboard bytes by size/SHA256/HTTP200. Owner desktop/mobile dive feel, waterfall/markers readability and fair miss recovery remain a separate retest gate.

## Waterfall spillway visual revision — 2026-10-04

Run new `tests/neon-grid-dive-visual.test.ts` with existing dive/lap-route tests. Regression tests catch detached lip vertices, source arriving from wrong side, water hovering above the ramp including both channel join edges, missing pool grounding, pause-time animation and high mist obstructing flight. Retain every existing native/controller/route assertion. Full `npm run validate`, `git diff --check`, unchanged main geometry/collider/gameplay diff and original18-case residual matrix are required.

Hosted render fixture: `tools/diagnostics/waterfall-spillway.html` imports the actual KartTimeTrial in dev only; it is not a production entry or runtime control. `tools/diagnostics/waterfall-render.mjs` captures chase, overhead, falls, portrait and landscape plus12ramp/flight/landing viewpoints through the eight-racer Medium renderer/bloom pipeline. Gate on no page/console/shader errors and all draw-call counts<=250. Save PNGs in Actions artifacts only, inspect them before deployment, and record numeric JSON in evidence. This software-WebGL matrix is a bounded rendering/budget check, not device/full-race FPS certification. Local browser is blocked by process/socket restrictions; run hosted without changing game code. Exact-source fullvalidation and delivery/preservation hashes remain required; stop for owner retest.


Final spillway delivery: source b49d987, exact-source CI 37245035393 PASS (125 files / 995 tests); 17-view eight-racer Medium software-WebGL render PASS, no errors, maximum 142 draw calls. Original residual matrix 18/18 zero unintended air, max loss 0.426449 m/s. Preview-publication PR #257 and Pages 37245587240 PASS; all 30 fresh live HTTP200/size/SHA256 checks match expected build/preserved bytes. Production and repaired 5.3 remain unchanged. Evidence: docs/evidence/2026-10-04-waterfall-spillway/delivery-verification.json and render-check.json. Owner desktop/mobile scenery, gold tell and landing readability retest remains pending; automated passes do not establish owner visual acceptance or full-race device FPS. STOP here.


## Owner visual approval — 2026-10-04 America/Chicago

Manny approved the published waterfall spillway preview on 2026-10-04 at 20:05 America/Chicago with “Approved”. Approval applies to the revised waterfall presentation at runtime b49d9876f8c6ce87956f8b91675c3c8180e56b55: the left waterway, water flowing over the ramp, and cascade from its launch lip into the pool. This closes the visual retest gate for this bounded Task 7 revision. It does not independently establish gameplay balance, final AI rates, device performance or authorize production integration or Stage 4.

The earlier pending-owner-retest statements are historical and superseded for this visual revision only. Engineering and delivery evidence remains unchanged. Approval recorded on feature/neon-grid-waterfall-dive; production unchanged.

## Neon Grid Billboard balance candidate — 2026-10-05

For the approved balance candidate, retain all prior Billboard, Tunnel, Dive and repaired-5.3 regressions. `tests/neon-grid-billboard.test.ts` verifies the +3.6 s race-clock offset, the first OFF boundary at 30.4 s, the approved 5% / 45% / 12% default rates, and a single Billboard boost surface after commitment/before rejoin. `tests/neon-grid-billboard-relocation.test.ts` runs production-native paired main/OFF/ON sections for AA-01 and AA-09 at 12/22/30 m/s, requires physical shortcut entry/exit with zero contacts, confirms the boost is traversed, and logs measured savings without converting product targets into pass-by-construction assertions.

Run full CI validation before publishing the isolated preview. The balance target itself remains an owner decision gate: expected OFF saving 0.8–1.0 s, ON saving 0.5–0.6 s, tell separation 0.25–0.4 s. If the standard boost pad fails the separation target, preserve 0.82 and report the measured miss rather than weakening tests or tuning global physics. Runtime `c71b2287b463f6a17645d664d3307d6b591561bf` / CI `37352477495` passed all validation while measuring a 0.033 s mean tell separation, so the numeric balance target remains open pending owner playtest/decision.


## Neon Grid Stage 4 Task 8 CI render-readiness classification — 2026-10-06

The hosted `task8-falls-run-render` job uses Chromium software WebGL / SwiftShader. It is an authoritative blocking gate for deterministic rendered-scene readiness, not for representative-hardware frame-rate certification.

Blocking CI checks:
- no page, console or HTTP render errors;
- rendered Medium evidence is 1920×1080 with eight racers;
- frame instrumentation produces at least 300 scored frames and finite timing statistics;
- draw calls remain at or below the PRD cap of 250;
- visible triangles remain at or below the PRD target of 750,000.

Diagnostic-only hosted values:
- Medium 1920×1080 median FPS;
- Medium 1920×1080 p95 frame time.

The PRD performance targets remain unchanged: Medium 1920×1080 median ≥60 FPS and p95 ≤18.3 ms on representative hardware. SwiftShader values are retained in uploaded evidence for regression context but cannot independently pass or fail those hardware targets.

Reason for classification: repeated hosted captures before and after main reconciliation were effectively identical at about 1.3 FPS / 777–780 ms p95 while scene budgets remained approximately 123–124 draw calls and 84.6k–86.3k triangles. That stability indicates the hosted software renderer is measuring the runner/rendering environment rather than certifying owner-device performance. This change does not waive, lower or rewrite the PRD thresholds.


## Neon Grid far300 owner visual/playability acceptance — 2026-10-06

Manual owner review of the locked Neon Grid 300 m far-plane preview is complete for the two issues under review.

- Clipping/horizon review: PASSED. Owner reported, “Clipping passes.”
- 2D-driver/wet-road compositing repair: PASSED. Owner reported, “This fix is passed.”
- Corrected preview runtime: `ce6a64cf36b1f110af028536d3ff9c7a306ccbdb`.
- Canonical equivalent repair: `40c2636baf9f5440d138d13a8ef2f78a95fc5b78`.
- Main publication checkpoint: `8cc990c967f3a6d2768759bf537079c94bace3b9`; Pages delivery run `37566927943` passed live hash verification and confirmed unchanged production bytes.

This closes the requested owner visual/playability review for the 300 m test slice. It does not authorize production adoption of the 300 m clamp, which remains a separate product decision.


## Neon Grid Stage 4 Task 9 T9.3 Undercity — 2026-10-07

Run `npx vitest run tests/neon-grid-stage4-task9.test.ts tests/neon-grid-stage4-task9-skyline.test.ts tests/neon-grid-stage4-t9-2-corrections.test.ts tests/neon-grid-tunnel.test.ts tests/neon-grid-tunnel-driving.test.ts`, then full `npm run validate`, `git diff --check`, and the hosted `task9-undercity-render` job.

T9.3 structural coverage requires:
- `undercity-visual` at exact progress `0.24654910452879084–0.46154128347522666` on Low/Medium/High;
- exactly 16 building masses; 80/160/240 Low/Medium/High emissive windows; 20 utility boxes; 26 pipe instances; 24 work lights; 10 ordinary service-bay masks;
- exactly two Nightshift Noodles and two Voltline Industrial architecture-mounted ad placements;
- finite instance transforms and bounded instance counts;
- Low omits `undercity-wet-asphalt`; Medium/High provide transparent, depth-tested, depth-write-disabled wet overlays with negative render order so kart-mounted 2D drivers composite afterward;
- hidden visual-owner time freezes without catch-up; owned disposal is idempotent;
- Service Tunnel remains present and gameplay-owned, with no T9.3 collision or route-authority ownership;
- the T9.0 aggregate future contracts retain only the T9.4 Falls Run extension expectations as intentional `it.fails`.

Hosted rendered readiness uses the actual eight-racer Medium runtime staged in The Undercity plus Low/High, mobile and rear-view captures. Blocking gates: zero page/console/shader/HTTP errors; Medium drawing buffer 1920×1080; eight racers; exact quality counts above; Medium A/B incremental draw-call delta >0 and <=20; total max <=200 calls / <=300k visible triangles; finite frame instrumentation with at least 180 scored frames. SwiftShader FPS/p95 are diagnostic-only and cannot satisfy the PRD representative-hardware performance target.

Verified run `37691248131`: validate passed **129 files / 1021 tests + 2 intentional future failures**. T9.3 render artifact `11513701620`, ZIP SHA-256 `da5118b083f27ba3c30197e67eb570bfd9b0ec7a2a40580b835d22ea4dadcdcd`; Medium A/B **+12 calls / +4,028 triangles**; maximum **153 calls / 138,490 triangles**; software-render diagnostic median 3.9448 FPS / p95 310 ms. T9.2 Skyline, Task 8 Falls Run and spillway render jobs all re-passed.

## Neon Grid T9.5 owner-portal/signage final correction verification (2026-10-08)

**Pinned correction runtime:** `9b973d48c1115d4b35d3936a3eacbed8dbb7ed76` (not the older `64492df` portal-warning preview). **Full source CI:** [37826321830](https://github.com/Manaconda33/manacondas-minigame-mayhem/actions/runs/37826321830), successful: 130 test files, 1,039 passing tests, strict typecheck, lint, approved sprite/audio/asset checks and build. T9.5 fixture covers scene geometry, portaled mouth anchors from wall-range endpoints, upper lintel connecting both true wall-end posts, forward/back-facing normals and readable texture plane (FrontSide rather than mirrored DoubleSide), non-collision, 3 m headroom, proximity fade, approved image maps and wall/raised sponsor sightline rays, shortcut masking and traversal camera clearance. All inherited render gates passed.

**Visual/telemetry artifact:** GitHub Actions artifact `11571572105`, `task9-full-course-render`, 34 render PNGs and `t9-5-render-check.json` from real eight-racer scenes. Verified telemetry: zero logged errors, 300 scored SwiftShader frames, maximum 206 draw calls (200 goal, 220 blocker), 164,806 triangles (300k ceiling). The verified sponsor sightline report includes both approved sponsor names, 18 visible-artwork samples and three mobile portrait-visible samples; inspection confirms that mobile portrait may crop partial signs and true portal framing in some approach views. Reviewer visually examined billboard desktop early/mid, portrait early/mid/near and tunnel desktop/portrait/landscape and traversal frames. Desktop approach has wall-ad artwork and both portal frames; no objective failure of the real camera ray/clearance gates was found. **Still require actual owner steering/playability review** to judge perceived black-wall obstruction, dark roof visibility, readable warning and kart silhouette through a real mobile turn-in; treat diagnostic renders as pre-review evidence, not final visual approval.

**Isolated publication gate:** [workflow-only PR #282](https://github.com/Manaconda33/manacondas-minigame-mayhem/pull/282) CI [37857076512](https://github.com/Manaconda33/manacondas-minigame-mayhem/actions/runs/37857076512) PASS, [main Pages 37857511926](https://github.com/Manaconda33/manacondas-minigame-mayhem/actions/runs/37857511926) PASS including protected production-byte and exact live preview hash checks. Source is pinned in `review-build.json` to `9b973d4` under `/previews/neon-grid-t9-5-owner-correction/`. Approved warning PNG SHA-256 `11e540547d0a60da9db2ae7636e373742dec11c9f440afe08c5e29bdddaa7db4` was re-checked in assembly. Old preview sources retained. GitHub Pages production gameplay unchanged.

**Mandatory owner checklist:** Android portrait, mobile landscape and desktop: approach Billboard Gap, see recognizable wall and raised Manaconda Racing / Taco Bell art before shortcut; see no deep exposed shortcut asphalt; approach each real Service Tunnel mouth and confirm non-mirrored, wall-attached warnings over legal portals, no floating frame, no dark fascia blocking turn-in, no camera/driver clipping, and bidirectional pass-through; check Waterfall remains unchanged. Explicit PASS is required. Do not promote T9.5 to complete based on software CI or diagnostic SwiftShader FPS; representative-hardware frame-time targets remain T9.6.

## T9.5 owner acceptance record — 2026-10-08

Manny responded **“Approved”** to the final source-pinned [T9.5 Billboard/portal correction preview](https://manaconda33.github.io/manacondas-minigame-mayhem/previews/neon-grid-t9-5-owner-correction/?review=9b973d4), satisfying the T9.5 **owner visual/playability signoff gate** for runtime `9b973d48c1115d4b35d3936a3eacbed8dbb7ed76`. This closes the prior screenshot correction review despite older chronological entries labeled pending/rejected. The evidence does **not** include an independent per-device metric transcript, so do not infer one from the approval.

Retain exact-source [CI 37826321830](https://github.com/Manaconda33/manacondas-minigame-mayhem/actions/runs/37826321830) and 34-frame `task9-full-course-render` artifact `11571572105` (130 files / 1,039 tests, 206 calls vs target 200/blocker 220, 164,806 triangles, 300 software frames, zero reported errors). [Pages 37857511926](https://github.com/Manaconda33/manacondas-minigame-mayhem/actions/runs/37857511926) verified production-byte preservation and the live immutable review build. Those software/WebGL gates remain distinct from T9.6 **representative-hardware** PRD ≥60 FPS median and ≤18.3 ms p95 requirements.

T9.5 needs no more retrospective owner-test assertions; T9.6 performance/readiness and T9.7 Skyline/final-preview owner acceptance stay open. PR #242 is draft/unmerged; production gameplay remains unchanged.

## Neon Grid T9.6 performance readiness and real-hardware capture contract — 2026-10-08

The owner approved execution of T9.6 after closing the corrected T9.5 acceptance gate. Repeat the existing hosted eight-racer Medium 1920x1080 300-frame structural test and inherited Task 8/9 presentation/lifecycle assertions unchanged. Separately collect **actual full three-lap race** performance on representative hardware using `?testRacePerf=1`. The actual race meter in `KartTimeTrial` excludes warmup, countdown, pauses and hidden/boundary samples, preserves raw per-frame intervals, captures renderer statistics, and marks finish.

To protect device evidence integrity, the export now identifies selected track, actual quality and best-effort WebGL renderer instead of always labelling Circuit Alpha/Medium; use `tools/diagnostics/t9-6-certify.mjs` to validate original samples and geometry counters, source SHA, 1920×1080 *actual drawing buffer*, Medium, eight racers, full race, >=600 post-warmup frames, realistic hardware/browser identity, median FPS >=60, p95 <=18.3ms, no three-consecutive-frames >50ms sequence, 250/750k hard PRD limits, and Task 9 200/300k engineering targets. Three separate runs are the collection protocol. Analyzer classifications are FAIL / INCOMPLETE / REVIEW_REQUIRED / PASS_CANDIDATE. The last is **not** final certification without independently documented representative hardware. Hosted SwiftShader FPS/p95 never count as physical-device evidence.

Historical T9.5 evidence: `waterfall-dive-rear` is the 206-call maximum (17 Skyline, 15 Undercity, 19 Falls, 12 Falls extension, 4 Billboard, 14 Dive independent owner-cost probes). Overall maximum triangles 164,806 occur in the tunnel-forward-interior station. The six-call excess over target 200 is unresolved; no automatic T9.6 carry-forward of the T9.5 220 allowance. The full [T9.6 evidence contract](evidence/2026-10-08-neon-task9-t9-6/progress.md) contains capture instructions and strict pending gates. Future hardware samples and exact CI/preview publication hashes must be appended there. No PRD or gameplay requirement changes.


## T9.6 source-lock and performance evidence validation — 2026-10-08

Exact approved diagnostic runtime c8c65f428fcfbc5236bbebf70ab5f98a9f7671bf passed [hosted CI 37862136028](https://github.com/Manaconda33/manacondas-minigame-mayhem/actions/runs/37862136028): 131 Vitest files / 1,041 tests; 6/6 independent Node certification tests via node --test tools/diagnostics/t9-6-certify.node-check.mjs; typecheck, zero-warning lint, asset gates, production build, and all inherited Task 8/9 render-readiness gates. The earlier red CI 37860962199 on 007caa0 is not representative of final source.

Workflow-only [PR #283](https://github.com/Manaconda33/manacondas-minigame-mayhem/pull/283) passed [CI 37862150928](https://github.com/Manaconda33/manacondas-minigame-mayhem/actions/runs/37862150928) and merged at 23c2b97d800a7b7ee9d401d586785d9c24656a11. Its preview source is pinned to c8c65f4, but [post-merge Pages 37864780112](https://github.com/Manaconda33/manacondas-minigame-mayhem/actions/runs/37864780112) must pass for published source/hash/production preservation to count as verified.

Capture protocol: use the isolated diagnostic preview with ?testRacePerf=1, Medium effective drawing buffer 1920×1080, three complete three-lap eight-racer ordinary races on representative hardware, >=600 scored post-warmup frames each. Retain hardware and renderer identity, original JSON, and offline results from node tools/diagnostics/t9-6-certify.mjs capture.json c8c65f428fcfbc5236bbebf70ab5f98a9f7671bf result.json. The analyzer's PASS_CANDIDATE is not owner/GPU proof. Software WebGL CI FPS/p95 are diagnostic only. At the time this capture contract was written, it preserved the 200-call target versus 250-call PRD cap; implementation amendment 2.26 supersedes both call limits while preserving the capture and G-05 requirements.


### T9.6 post-merge Pages delivery VERIFIED — 2026-10-08

[Main CI/Pages 37864780112](https://github.com/Manaconda33/manacondas-minigame-mayhem/actions/runs/37864780112) **SUCCESS**: validate, pinned preview cache/source build, assembly, GitHub Pages deploy and independent live HTTP 200, SHA-256 bytes and review-build.json source-marker checks passed. T9.6 source c8c65f428fcfbc5236bbebf70ab5f98a9f7671bf is published solely at https://manaconda33.github.io/manacondas-minigame-mayhem/previews/neon-grid-t9-6-diagnostics/?review=c8c65f4&testRacePerf=1. Delivery artifact 11588315852 records live verification, including five approved signage assets. Prior T9.5 and other pinned previews and Circuit Alpha production byte hashes stayed protected. Earlier 'Pages pending' text is superseded by this verified outcome.

This is delivery/readiness evidence, **not** representative hardware FPS or frame-time certification. Await three original JSON full-race hardware captures; do not move T9.6 to PASS until PRD thresholds and engineering-target disposition are reviewed.


## T9.6 revised engineering budgets / protected hard gates — 2026-10-08 (historical values superseded for draw calls on 2026-10-09)

At the time, owner approval adjusted T9.6/future Task 9 *engineering* targets to **220 calls and 350,000 visible triangles**, with PRD calls capped at 250 and triangles at 750,000. On October 9, the 500-call engineering target and global PRD call cap superseded those draw-call numbers only. Preserve the historical screenshot/audit; raw capture is still absent. Never label `PASS_CANDIDATE` a certified GPU run. G-05 remains unchanged: representative desktop hardware, Medium 1920×1080, median ≥60 FPS, p95 ≤18.3 ms and no three consecutive >50 ms frames.


## T9.7 expanded final visual polish — active validation contract (approved 2026-10-09)

Manny explicitly authorized the expanded [T9.7 plan](design/neon-grid/t9-7-final-visual-polish-plan-2026-10-08.md). Validate the 22 instanced Skyline towers, support/clearance, stepped roofs and grounded non-colliding city base; retain approved signage and Tunnel warnings; prevent shortcut-road, kart and driver-sprite occlusion; preserve Low-quality wet/bloom bypass and the Task 8 0.70–0.85 visual appearance, with the separately owner-approved background city-ground/tower-massing exception below; bound all quality-scaled geometry/material effects. Inspect before/after fixed-camera desktop and mobile-sized portrait/landscape chase/rear views across all sectors; viewport simulations are not physical-device evidence.

The current draw-call target and global PRD hard cap are **500**. Task 9 engineering triangles are **425,000** under PRD amendment 2.28, while the PRD hard cap remains **750,000**; active T9.7 sector A/B ceilings are **Skyline +36, Undercity +30, and Falls extension +28 calls** under amendment 2.27. Preserve independent G-05 representative-desktop requirements (Medium 1920×1080, median ≥60 FPS, p95 ≤18.3 ms, no sustained >50 ms sequence). Run typecheck, zero-warning lint, full Vitest, Node T9.6 analyzer tests, approved asset checks, production build and Task 8/9 render gates. No new binary texture or 2D art is authorized. T9.6 hardware evidence remains open until the original captures and device metadata are independently reviewed.

The October 9 deterministic worst-case full-course run used the seven highest-triangle AI models and waited for all GLTF replacements before measuring. All 34 stations passed with zero HTTP/page/render errors and 300 scored frames; the peak was 404,291 triangles / 416 calls at `waterfall-dive-rear`. See the [full-course report and representative images](evidence/2026-10-09-neon-grid-t9-7/after/full-course-worst-case/). Local SwiftShader timing is diagnostic-only and does not satisfy G-05.

**2026-10-09 amended local verification:** `npm run validate` passed strict typecheck, zero-warning lint, 131 test files / 1,046 tests, approved asset verification and production build; independent `node --test tools/diagnostics/t9-6-certify.node-check.mjs` passed 8/8; `git diff --check` passed. All three T9.7 sector render gates passed against PRD amendment 2.27, with no page/render errors: Skyline +36 calls (peak 286 / 311,199 triangles), Undercity +30 (314 / 313,135), Falls extension +24 against +28 (266 / 329,723), and stable Falls reverse-order readiness. The gates wait for all seven asynchronous AI kart GLTF models before measuring, preventing fallback-to-model replacement from contaminating A/B counters. Earlier reports against +18/+20/+12 remain preserved as historical evidence. No preview was published. Full measurements: [T9.7 sector-gate summary](evidence/2026-10-09-neon-grid-t9-7/after/sector-gates/summary.json). Local SwiftShader timing is not G-05 hardware evidence.

**Owner-approved city-ground correction — 2026-10-09:** The new review identified missing city ground in the background and generic box-shaped Falls buildings. This approval narrowly allows changes to presentation-only background city ground and tower massing in the otherwise frozen Task 8 0.70–0.85 range. Keep the road, waterfall/mist, deck/rails, signage and gold tell, racers, driver/camera composition, route, shortcuts, and gameplay unchanged. Require geometry/raycast checks that every Skyline and Falls foundation contacts or overlaps the terraced floor, finite/owned/disposed geometry, unchanged 24 Falls tower/window/waterfall counts and existing quality-tier behavior, fixed-camera before/after images at the actual waterfall region in desktop and portrait/landscape views, and full 34-station render readiness under **500 calls / 425,000 visible triangles** (PRD hard cap **500 / 750,000**). Preserve G-05's separate hardware evidence gate. A new pinned preview and Manny's visual re-review remain required.

**2026-10-09 correction verification:** Fresh `npm run validate` passed typecheck, zero-warning lint, **132 test files / 1,053 tests**, approved-asset checks and production build. The T9.6 analyzer tests passed **8/8**; `git diff --check` was clean. Local Chromium/SwiftShader rendered all **34 course stations** with zero errors (peak **418 calls / 412,719 triangles**). Skyline measured **+34 calls against +36** (286 peak calls / 350,775 triangles); Falls extension measured **+24 against +28** (272 peak calls / 336,871 triangles), with no render errors. Automated ground raycasts cover the Billboard Gap and the Waterfall Dive's authored landing mesh, including its lane-specific width, at vertices and triangle centers. Fixed views include waterfall approach and dive in desktop, mobile portrait and mobile landscape; a diagnostic angle shows the terraced base and connected tower foundations. The prior preview image is retained beside the matching corrected chase view. These software renders do not certify G-05 hardware performance. See [city-ground correction reports and screenshots](evidence/2026-10-09-neon-grid-t9-7/after/city-ground-correction/README.md). Runtime code review found no further issues; final workflow review and a new source-pinned preview remain pending.
