# Neon Grid Task C1 — Service Tunnel Concrete A/B

## Validation follow-up — 2026-10-15

The original 47/47 focused-test result above belongs to the pre-correction test tree at runtime source `e500f68c658edb5dcd45b4149e4c7f32f2a14dce`. A test-only follow-up removed a separate full-scene setup by moving its material-selector and capture-metadata assertions into the existing route integration test with a 15-second bound. The corrected focused coverage run passed **46/46** tests across `tests/neon-grid-service-tunnel-material.test.ts` and `tests/race-diagnostics-routing.test.ts` with `--maxWorkers=1`. The runtime source and assets remain `e500…`; no visual or gameplay change is included.

Hosted PR #310 run [38781841144](https://github.com/Manaconda33/manacondas-minigame-mayhem/actions/runs/38781841144) failed its Node 22 full coverage step with 34 five-second timeouts (1,074/1,108 passed) across scene-heavy tests, while its pinned `dive` validation had one different five-second timeout (994/995 passed). Preview build and pinned texture hashes passed. The jobs used Vitest's parallel default worker pool. This pattern, plus a reproduced pre-existing scene timeout on the Task A/B base, supports runner contention around the existing timeout but does not prove it. No failed assertion indicated a Task C1 runtime regression.

The publication workflow now serializes only those two full coverage jobs using `--maxWorkers=1`; it retains full coverage, all tests, the existing 5-second limit, and the existing job time limit. Hosted confirmation has not yet run on this correction. Validation therefore remains **PARTIAL**; no preview may publish until the corrected source/test validation and required checks pass.

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
- One full `npm run test:ci` coverage run on the initial C1 source exited 1: **1,102/1,106 passed** and four tests hit the existing five-second timeout. One was the then-combined C1 two-scene fixture (8,359 ms), which was split into narrower tests. The other three were existing tests: Skyline city ground vs Billboard Gap (5,062 ms), Falls city ground vs Waterfall Dive (5,141 ms), and hidden-race-time/billboard routing (5,349 ms). The full coverage suite was not repeated on the corrected source, so full-suite coverage remains outstanding. No timeout, worker, coverage, or CI settings were changed.
- Current shell is Node 24.19.0 (the package requires Node ≥22); Node 22 was not available in this environment.
- The official Poly Haven file API returned HTTP 403 via the configured proxy. The CC0/source facts are from the existing C0/C0.1 review; publisher archive hashes were not independently confirmed. Manifest hashes identify the received bytes only.
- No physical-device test or G-05 certification was performed. No GPU timing, reliable instrumentation-overhead estimate, or exact GPU texture-memory value is available. Software-WebGL is used for visual/counter correctness only.
- The only intended image change is the concrete treatment on the two existing Service Tunnel sidewalls. Track geometry, object visibility, camera transforms, lights, fog, whole-frame submissions, gameplay and collisions matched the captured A/B fixture. No approved graphics limit changed; production runtime, CI behavior and physics were not modified.

## Owner review gate

Review wall readability at racing distance and the close-up normal orientation/tiling. Decide whether the 2.2 m tile scale and visible concrete treatment are acceptable before any broader material application. Full standard coverage remains outstanding. This isolated checkpoint is for owner review only; no merge, production integration, preview, or deployment is authorized by this checkpoint.
