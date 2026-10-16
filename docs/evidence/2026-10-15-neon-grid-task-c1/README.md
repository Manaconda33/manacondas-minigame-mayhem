# Neon Grid Task C1 — Service Tunnel Concrete A/B

## Publication and hosted-validation follow-up — 2026-10-16

This update supersedes the earlier status statements below about hosted validation and publication. The prior timeout and failure records remain historical evidence.

- **Hosted validation:** PR #310 candidate [`5e6ca0ec070e05c40fbd5b23bb482cee6b9e49a7`](https://github.com/Manaconda33/manacondas-minigame-mayhem/commit/5e6ca0ec070e05c40fbd5b23bb482cee6b9e49a7) passed [run 38807455107](https://github.com/Manaconda33/manacondas-minigame-mayhem/actions/runs/38807455107), including **1,107/1,107 pinned C1 coverage tests**. The run had **32 passed jobs and two skipped publication jobs** (`assemble` and `deploy`); no jobs failed. The candidate kept the C1 runtime pinned to [`e500f68c658edb5dcd45b4149e4c7f32f2a14dce`](https://github.com/Manaconda33/manacondas-minigame-mayhem/commit/e500f68c658edb5dcd45b4149e4c7f32f2a14dce).

- **Main publication:** [PR #310](https://github.com/Manaconda33/manacondas-minigame-mayhem/pull/310) merged to `main` at [`ec1960f69ee9f14f1e57cb6e49a8ae7afcc0e84b`](https://github.com/Manaconda33/manacondas-minigame-mayhem/commit/ec1960f69ee9f14f1e57cb6e49a8ae7afcc0e84b). Post-merge [Pages run 38813219070](https://github.com/Manaconda33/manacondas-minigame-mayhem/actions/runs/38813219070) succeeded. Its recorded delivery verification covered **1,800 HTTP 200 paths**: 401 production-root paths, 413 C1 preview paths, and 986 prior-preview paths. All three Concrete Wall 007 texture hashes matched.

- **Same-runtime playable A/B:** [A — blockout material](https://manaconda33.github.io/manacondas-minigame-mayhem/previews/neon-grid-task-c1-001/?neonGridVisual=neon-grid-task-a-001) and [B — Service Tunnel concrete material](https://manaconda33.github.io/manacondas-minigame-mayhem/previews/neon-grid-task-c1-001/?neonGridVisual=neon-grid-task-a-001&neonGridMaterial=service-tunnel-concrete-001). Both use pinned runtime `e500f68c658edb5dcd45b4149e4c7f32f2a14dce`.

- **Owner playable review:** In [PR #309](https://github.com/Manaconda33/manacondas-minigame-mayhem/pull/309), Manny approved the concrete appearance and confirmed the kart/driver looked correct during normal play. That checkpoint was integrated into the nonproduction branch `fix/neon-grid-task-a-sponsor-visibility-20261014` at [`5b3cfdb137a1b59039e20ddaed75ab75ac4cbd2c`](https://github.com/Manaconda33/manacondas-minigame-mayhem/commit/5b3cfdb137a1b59039e20ddaed75ab75ac4cbd2c). The approval covers isolated preview use only.

- **Historical failures:** The earlier five-second timeout results remain part of the record. The later successful run is a new validation checkpoint using the approved 15,000 ms per-test baseline; it does not prove that the earlier failures were environmental or resolve the runner/test-budget causality described below.

- **Remaining gates:** Production integration remains gated by PR #242 and broader Neon Grid approval. No physical-device or G-05 certification is recorded. This follow-up changes documentation only; it makes no runtime or asset changes.

## Validation follow-up — 2026-10-15

The original 47/47 focused-test result recorded below belongs to the pre-correction test tree at runtime source `e500f68c658edb5dcd45b4149e4c7f32f2a14dce`. Test/evidence commit `b39f8d07bf661318674ed267ce779c2167c0adaa` is its direct child and changes no runtime, assets, package files, or build configuration. It moves the new material-selector and capture-metadata assertions into an existing route integration test with a 15-second bound, removing one unnecessary full-scene startup. The corrected focused coverage command passed **46/46** tests across `tests/neon-grid-service-tunnel-material.test.ts` and `tests/race-diagnostics-routing.test.ts`, with `--maxWorkers=1` (Node 24.19.0; 115.42 seconds).

The initial hosted PR #310 run [38781841144](https://github.com/Manaconda33/manacondas-minigame-mayhem/actions/runs/38781841144) used Node 22.23.3 and parallel V8 coverage on runtime `e500…`: 1,074/1,108 passed and 34 tests timed out at five seconds across 14 scene-heavy files. The pinned Dive suite had one five-second timeout. No failed assertions were reported; the preview build, source marker, Git LFS checks and all three texture hashes passed.

The follow-up run [38792975182](https://github.com/Manaconda33/manacondas-minigame-mayhem/actions/runs/38792975182) checked test/evidence head `b39f8d0…` with runtime tree still pinned to `e500…`. Node 22.23.3 / Vitest 4.1.10 serial coverage (`npm run test:ci -- --maxWorkers=1`) ran 1,107 tests in 1,077.47 seconds: **1,092 passed; 15 timed out at the unchanged five-second limit** across 10 files. The failures were all scene-construction/render/routing timeouts, with no assertion failures:

- `neon-grid-billboard-relocation.test.ts` (1), `neon-grid-collision.test.ts` (1), `neon-grid-dive.test.ts` (1), `neon-grid-runtime.test.ts` (1), and `neon-grid-scene.test.ts` (1).
- `neon-grid-service-tunnel-material.test.ts` (2), `neon-grid-stage4-t9-2-corrections.test.ts` (1), `neon-grid-stage4-t9-7-city-ground.test.ts` (2), `neon-grid-stage4-task9.test.ts` (1), and `race-diagnostics-routing.test.ts` (4).

The serial run reduced the observed timeout count from 34 to 15, and the separate pinned Dive coverage job changed from one timeout to a pass. This supports worker contention as one contributor, but the comparison is not controlled: the test tree changed by removing one redundant scene startup and execution conditions may differ. Fifteen timeouts persisted with one worker; exact runner-versus-test-budget causality remains unresolved. In the C1 job, exact source ancestry, changed-file allowlist, Git LFS integrity, and all three source hashes passed; typecheck and lint passed; full coverage failed; the subsequent build step was skipped. The separate exact `e500…` preview-build and hash job, top-level `validate`, and pinned Dive job passed. Pages assembly and deployment remained skipped.

Workflow commit `679ccb13c5e5651d095bd4810ae2e90fdb1a904a` serializes only the Task C1 and Dive coverage suites. Coverage remains enabled, all tests run, and no test timeout, coverage requirement, or graphics threshold was relaxed. Since the exact C1 full suite still fails, technical validation remains **PARTIAL**, PR #310 remains draft, and no playable preview is published. No further rerun is authorized in this checkpoint.

**Status:** Isolated prototype for owner visual and technical review. Production integration, deployment, PR #242, and Task C2 remain gated.

## Source and approval

- Implementation baseline: `e52fef8169233e5c612f8683e8074423c8cf1c07` (Task A/B nonproduction branch).
- C0 checkpoint: `015ab45ad1c1162b7db5bd0d2671091893ba98d8`. C0.1 target-selection checkpoint: [`48d4b474cf8c9ce590a7623c8e83b44ac0914ef8`](https://github.com/Manaconda33/manacondas-minigame-mayhem/commit/48d4b474cf8c9ce590a7623c8e83b44ac0914ef8), remotely verified on documentation branch `docs/neon-grid-task-c0-1-visibility-review-20261015`. C1 uses the requested exact runtime baseline `e52fef8169233e5c612f8683e8074423c8cf1c07`; the C0.1 audit remains a separate review checkpoint.
- Approved Task A runtime: `692e9424c2cbf15decbb467b230c02c2e10452a0`.
- Production `main` was verified at `e8cb78f1f9c678d08d84ab30cb8585f99e70c800` before work.
- PR #242 remains open, draft, and unmerged.

The approved experiment applies Poly Haven Concrete Wall 007 to only the existing Service Tunnel left/right sidewall meshes. The `?neonGridMaterial=service-tunnel-concrete-001` query enables B. Omitting it selects the existing blockout material A. The approved Task A visual query remains independent (`?neonGridVisual=neon-grid-task-a-001`).

## Scope and implementation

- One shared wall material and the existing two sidewall meshes. No extra object or material group is added, so the prototype predicts no additional draw call.
- U follows each wall's tunnel arc distance; V follows wall height. The prototype repeats the square maps at the 2.2 m scale recorded by the C0 source review. The source page review records width but the source height has not been independently retrieved, so the vertical scale is a stated square-map assumption for owner review.
- The base-color map is sRGB. OpenGL normal and roughness maps use `NoColorSpace`. The optional metallic map is omitted.
- Existing wall positions, indices, and triangle counts are preserved. UVs are added only to render sidewall geometry in B. Floor, roof, lighting, fog, shadows, bloom, motion blur, sponsors, camera, collisions, and route logic remain on their existing paths.
- Texture loads are awaited before the game starts. If any required map fails, B setup fails explicitly and releases successful partial loads; it does not silently present A as B.
- Task B's capture schema is extended additively with the selected material variant so A/B captures are attributable.

## Asset acquisition

The three owner-provided Drive files were downloaded and byte-verified in the isolated workspace. Their dimensions, bit depth, channels, byte counts, and SHA-256 values are recorded in [asset-manifest.json](asset-manifest.json). All are 1024×1024, 16-bit PNGs. The repository tracks these runtime files through Git LFS under `.gitattributes`.

The C0 source review records Poly Haven's CC0 license, the official asset page, a 2.2 m width, and native 1K availability. A fresh TLS-verified request to the publisher's file API returned HTTP 403 through the configured proxy. Publisher-provided archive/map hashes were unavailable; the manifest therefore identifies the received bytes without claiming independent publisher-hash verification. No mirror, proxy bypass, or TLS bypass was used.

The three compressed PNGs total 13,585,286 bytes. A rough RGBA8 full-mipmap storage estimate would be about 16 MiB across three 1024² maps, but actual GPU formats/residency are not reported by Three.js and are not measured here. Download size is not GPU memory.

## Source-pinned fixture and captures

Implementation source: `c07ca0ec48b88b797bfa7056deb5166e966608c7`. The fixture uses the actual `KartTimeTrial`, approved Task A visuals, Medium quality, eight racers with a fixed roster seed, the Service Tunnel midpoint, and chase/rear cameras. Desktop CSS viewport 1280×720 at DPR 1.5 produced the actual 1920×1080 buffer. Portrait used 390×844 at DPR 1. Chromium 151 reported SwiftShader software WebGL. Capture time: `2026-10-15T16:52:02.092Z`.

| Camera / viewport           | A: blockout                                            | B: concrete                                                     | Result                                                                                           |
| --------------------------- | ------------------------------------------------------ | --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Chase, desktop 1920×1080    | [PNG](captures/A-blockout-chase-desktop-1920x1080.png) | [PNG](captures/B-concrete-wall-007-chase-desktop-1920x1080.png) | Same camera, draw calls, triangles, geometry and visibility; images differ on the wall material. |
| Rear, desktop 1920×1080     | [PNG](captures/A-blockout-rear-desktop-1920x1080.png)  | [PNG](captures/B-concrete-wall-007-rear-desktop-1920x1080.png)  | Same invariants.                                                                                 |
| Chase, portrait 390×844     | [PNG](captures/A-blockout-chase-portrait-390x844.png)  | [PNG](captures/B-concrete-wall-007-chase-portrait-390x844.png)  | Same invariants.                                                                                 |
| Rear, portrait 390×844      | [PNG](captures/A-blockout-rear-portrait-390x844.png)   | [PNG](captures/B-concrete-wall-007-rear-portrait-390x844.png)   | Same invariants.                                                                                 |
| Controlled desktop close-up | —                                                      | [PNG](captures/B-concrete-wall-007-closeup-desktop.png)         | Shows surface texture and normal detail at close range.                                          |

The complete [machine-readable capture](captures/material-ab-capture.json) records the source, roster, camera, whole-frame counters, pass deltas, target sizes, image hashes, CPU samples, browser errors, and WebGL status. A separate [visibility and geometry check](captures/visual-state-invariants.json) confirms the same 596 renderable-object signature with 259 visible objects in A and B, equal camera transforms, tunnel vertex/index counts, lighting, and scene fog in all four viewport/camera pairs. WebGL reported error 0 and no context loss; no page or console errors were reported.

## Render workload and resource results

| Matched view   | Main scene (draws / triangles) | Bloom mask (draws / triangles) | Whole frame (draws / triangles) | Unattributed calls / triangles |
| -------------- | -----------------------------: | -----------------------------: | ------------------------------: | -----------------------------: |
| Desktop chase  |                    58 / 49,490 |                    59 / 49,586 |                    120 / 99,079 |                          0 / 0 |
| Desktop rear   |                  186 / 190,992 |                  187 / 191,088 |                   376 / 382,083 |                          0 / 0 |
| Portrait chase |                    59 / 49,706 |                    60 / 49,802 |                    122 / 99,511 |                          0 / 0 |
| Portrait rear  |                    74 / 52,542 |                    75 / 52,638 |                   152 / 105,183 |                          0 / 0 |

The horizontal filter, vertical filter, and final composite each submit 1 draw / 1 triangle in every captured view. Desktop bloom targets are 768×432 (331,776 pixels); its final composite and main scene use 1920×1080 (2,073,600 pixels). Portrait bloom targets are 195×422 (82,290 pixels), with the final composite at 390×844 (329,160 pixels). Main-scene counters include shadow work when updated. The prototype changes no draw-call or triangle total; B reports three more textures, while geometry counts remain equal. Framebuffer copies are separately reported as zero. Target pixels are not a GPU-work estimate.

CPU wall time around `window.renderFrame` (scene updates and the existing Bloom path; not GPU or whole-frame time) was sampled 30 times per view after eight warmups. Desktop chase A/B medians were 5.3/5.2 ms and p95 values 14.9/15.3 ms; desktop rear 7.9/7.7 ms medians and 10.5/12.2 ms p95. Portrait chase medians were 5.5/4.9 ms and p95 11.0/8.8 ms; portrait rear 4.7/8.9 ms medians and 6.9/13.0 ms p95. These short, software-WebGL samples are noisy and do not establish a performance gain, device FPS, GPU time, or texture residency.

The three PNG assets add 13,585,286 uncompressed file bytes and are tracked with Git LFS. `Renderer.info` texture counts increase by three; it does not report GPU bytes. No extra material mesh, geometry, or draw call is introduced.

## Validation and limitations

- Focused tests: `npm run test -- --run tests/neon-grid-service-tunnel-material.test.ts tests/race-diagnostics-routing.test.ts` — **47/47 passed**. This includes the Task A fog/material-sharing regression and successful/partial-failure texture cleanup cases.
- `npm run typecheck` — passed. `npm run lint` — passed with zero warnings. `npm run build` — passed; all existing runtime asset/hash checks passed, including materialized texture checks. Vite emitted its existing advisory for large JavaScript chunks.
- One full `npm run test:ci` coverage run on the initial C1 source exited 1: **1,102/1,106 passed** and four tests hit the existing five-second timeout. One was the then-combined C1 two-scene fixture (8,359 ms), which was split into narrower tests. The other three were existing tests: Skyline city ground vs Billboard Gap (5,062 ms), Falls city ground vs Waterfall Dive (5,141 ms), and hidden-race-time/billboard routing (5,349 ms). That was the initial-source limitation at the time of this packet. The later exact-source serial coverage run is recorded in the validation follow-up near the top; it also failed, with 15 unchanged five-second timeouts. No timeout or coverage requirement was changed.
- Current shell is Node 24.19.0 (the package requires Node ≥22); Node 22 was not available in this environment.
- The official Poly Haven file API returned HTTP 403 via the configured proxy. The CC0/source facts are from the existing C0/C0.1 review; publisher archive hashes were not independently confirmed. Manifest hashes identify the received bytes only.
- No physical-device test or G-05 certification was performed. No GPU timing, reliable instrumentation-overhead estimate, or exact GPU texture-memory value is available. Software-WebGL is used for visual/counter correctness only.
- The only intended image change is the concrete treatment on the two existing Service Tunnel sidewalls. Track geometry, object visibility, camera transforms, lights, fog, whole-frame submissions, gameplay and collisions matched the captured A/B fixture. No approved graphics limit changed; production runtime, CI behavior and physics were not modified.

## Owner review gate

Review wall readability at racing distance and the close-up normal orientation/tiling. Decide whether the 2.2 m tile scale and visible concrete treatment are acceptable before any broader material application. Full standard coverage remains outstanding. This isolated checkpoint is for owner review only; no merge, production integration, preview, or deployment is authorized by this checkpoint.
