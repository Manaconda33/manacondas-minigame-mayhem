# Slice 6 graphics and release-readiness audit — 2026-09-30

## Baseline and scope

Canonical repository: Manaconda33/manacondas-minigame-mayhem, main at `25ebe7996d7f9bbcae13142713118964d0d11123`; PRD v1.1 with approved amendments through 2.22. Slice 6 remains active. This is a source/evidence audit, with no gameplay, asset, settings, renderer, dependency, PRD, or production change.

Startup reviewed AGENTS.md, PRD, IMPLEMENTATION-STATUS, DECISIONS, TESTING, README, the recursive repository tree, four recent main commits, open PR metadata and hosted CI. All 109 TypeScript source files were retrieved at the pinned baseline and scanned; graphics/runtime modules, settings/scene tests and the Slice 5 performance evidence were examined directly.

Baseline CI/Pages run [36771534267](https://github.com/Manaconda33/manacondas-minigame-mayhem/actions/runs/36771534267) has successful validation and deployment jobs. Earlier local music validation recorded 81 test files / 642 tests. This audit did not rerun the suite or perform new rendered-device measurements: the shell execution service was unavailable. Source inspection and observed hosted results are the evidence used here.

The project-level former repository name redirects to this repository. AGENTS.md controls the current public repository and product identity. Open PRs #168, #194 and #199 are older evidence/documentation proposals, not new graphics implementation; their historical descriptions do not override later owner acceptance.

## Requirement-to-implementation matrix

| Requirement | Current implementation | Audit disposition / next evidence |
| --- | --- | --- |
| PRD 23.1 lighting | Hemisphere plus one directional light, one shadow map; fog. | Basic lighting present. HDR/environment/baked contribution is recommended, not a mandatory new asset purchase. |
| PRD 23.2 PBR | Road/racing-wear diffuse, normal and roughness maps; provenance-backed 1K asphalt set; standard kart materials. | Bounded accepted material pass present. No AO map in the asphalt material; assess remaining visual need separately without remapping approved karts. |
| PRD 23.3 shadows | PCF soft shadows, 2048 Medium/High; Low disables shadows. Loaded player/AI GLB meshes all cast/receive shadows. | Implemented, budget policy incomplete: no runtime nearby-caster selection/cap or measured shadow cost. Dynamic-object cap cannot be judged by counting submeshes. |
| PRD 23.4 drift VFX | Two small spheres change blue/orange/purple color and scale with charge. | Partial. No emitted spark trail, orange flame treatment, or purple burst/additional-particle/exhaust tier treatment. |
| PRD 23.5 speed/boost VFX | Nitro Surge, Overdrive and Rocket additive exhaust/rings; item visuals on AI racers. Fixed 62-degree race FOV; camera takes no speed input. | Boost/item treatments present. General speed lines, speed-driven FOV expansion and common chromatic streak/particle treatment are absent. |
| PRD 23.6 off-road dust | No dust emitter or instanced dust pool in source. Existing instancing is track scenery. | Missing. Add speed/slip/surface-driven off-road wheel particles with bounded pools. |
| PRD 23.7 motion blur | No race blur implementation; no motion-blur settings field/control. | Missing. Low off, simplified Medium edge treatment, optional High directional/velocity treatment; explicit persisted disable control. |
| PRD 23.8 bloom | Emissive/additive materials exist; race renders directly with WebGLRenderer. No composer, bloom pass or equivalent scene bloom. UI has CSS shadows/backdrop blur. | Missing. Emissive material brightness and UI blur are not scene bloom. Preserve road readability with controlled eligible effects. |
| Presets / ADR-087 | Persisted Low/Medium/High: DPR 1/1.5/2 and shadows; selection applies to next race without page reload. | Foundation present, as approved. Particle/post-processing/texture dimensions and live-running mutation remain deferred; current next-race application is not a regression. |
| PRD G-05 / 2.6 full-race performance | HUD uses half-second FPS estimate and latest frame duration. ItemPerformanceMeter measures item simulation/VFX CPU only. | Full-race gate open. No full-frame percentile capture, render draw-call/triangle ledger, GPU timing, total particle/shadow budget accounting or texture residency evidence. |
| WebGL2 baseline | Uses THREE.WebGLRenderer directly and has no WebGPU dependency. | Correct source architecture. Still requires the specified Chrome/Edge/Firefox/Safari capability and runtime matrix. Implementing WebGPU is not the next prerequisite. |
| PRD 29.3 context loss | No app-owned webglcontextlost/restored handlers or clean-reload recovery flow found. | Recovery gap. Three.js internal handling does not establish application-level resource rebuild/reload UX. Exercise in browser QA. |
| Memory / lifecycle | Race cancels animation/listeners, disposes item VFX, track resources and renderer. | Existing five-restart owner acceptance stays PASSED. Separate source concern: race dispose does not explicitly free its Rapier World or traverse/dispose loaded kart resources and principal-light shadow resources. Investigate allocation/ownership; no measured leak is claimed. |
| Final release evidence | Accepted desktop/mobile flow, HUD/results, SFX and music; earlier Slice 5 item meter screenshots pass p95 1.00 ms. | Preserve all accepted gates. Full-game Medium capture, browser matrix, gameplay recording, consolidated rights/dependency/provenance record and final quality checklist remain open. |

## Important measurement limitation

KartTimeTrial clamps the RAF delta to 0.1 seconds before passing it to both simulation and the displayed FPS/frame-time calculations. This is a valid simulation safety limit, but it hides the true duration of stalls above 100 ms and biases performance evidence. New diagnostics must use raw RAF intervals separately from the existing clamped simulation step, exclude documented hidden/paused/warmup intervals, and preserve race physics.

The PRD Medium gate is an eight-racer race at 1920×1080 on identified baseline desktop hardware: median FPS >=60, p95 frame time <=18.3 ms, and no sustained sequence of >50 ms frames under normal load. Record actual drawing-buffer dimensions and DPR; a DPR 1.5 cap can produce a larger buffer than 1920×1080. GPU <=12 ms is preferred where measurable. Draw-call target <=250, triangles <=750,000, dynamic shadow objects <=12 and gameplay particles <=2,500 require measured accounting.

Prior Item/VFX captures close that subsystem's accepted gate only. They do not prove current whole-frame performance or invalidate the owner's accepted result.

## Recommended bounded implementation order

1. **Full-race diagnostics and resource-budget baseline.** Add opt-in raw frame sampling, median/p95/max and long-frame observations, renderer draw-call/triangle/resource counters, sample-window export and race/pause/visibility attribution. Assess caster/particle counts and resource ownership. Keep diagnostics out of normal release HUD; do not change simulation, controls, accepted layouts or audio. Capture the current Medium baseline before expensive effects.
2. **Bounded driving VFX.** Pool drift sparks/tier bursts and wheel dust, then restrained speed/FOV cues and common boost particles. Extend the existing preset authority for effect budgets. Preserve driver/camera anchors and accepted item identity. Use the baseline to select safe limits.
3. **Controlled post-processing and settings.** Selective bloom, quality-dependent blur and explicit blur disable; Low bypass, safe fallback and disposal. Extend existing settings rather than creating another graphics authority. Present design/implementation plan and private review before publication.
4. **Targeted optimization and final QA.** Measure the finished same candidate; optimize bottlenecks from captures. Validate context-loss recovery, browser capabilities and budgets; consolidate final release evidence and request Slice 6 closure approval.

The next recommended task is item 1. Audit authorization does not itself authorize implementing/publishing new graphics behavior; later implementation and production gates remain intact. No next PRD slice is authorized.

## Secondary delivery observation

The five approved music WAVs total about 69.9 MB (66.7 MiB) of decoded PCM file data. The PRD separately targets compressed browser audio and a <=45 MB compressed first-playable package. Exact-WAV publication was explicitly approved under ADR-095, so this audit neither changes nor withdraws that approval. Measure lazy-load/network/decode residency in the final candidate; any compressed derivative must be planned and approved without reopening the accepted listening gate unnecessarily.

## Evidence pointers

- src/config/graphicsQuality.ts and src/config/gameSettings.ts: preset and persistence authority.
- src/game/KartTimeTrial.ts: renderer/shadows (352–391), frame/RAF path (515–527), drift treatment (1627–1647), displayed FPS (1713–1734), model caster flags (1862–1865 and 2114–2117), drift meshes (2000–2011), dispose (422–470).
- src/game/camera/ChaseCamera.ts: intro/chase/rear placement without speed/FOV effects.
- src/game/track/TrackMaterials.ts and createTrackScene.ts: asphalt materials, emissive scenery and instancing.
- src/game/items/NitroSurgeVisual.ts, NitroOverdriveVisual.ts, PrismaticVisual.ts and RacerItemVisuals.ts: accepted bounded item effects.
- src/game/items/ItemPerformanceMeter.ts: subsystem-only CPU timing.
- tests/settings.test.ts, track-scene.test.ts and nitro-surge-visual.test.ts: existing structural coverage.
- docs/SLICE-5-ITEM-VFX-PERFORMANCE-EVIDENCE-2026-09-17.md: accepted subsystem capture.
- docs/PRD.md: 2.6, G-05, 23.1–23.8, 29.3, 30, 35.7, 36.5 and final quality checklist.

## Disposition

Audit complete. Slice 6 is not complete. No new graphics implementation was made, no prior owner acceptance was reopened, and no PRD deviation was introduced.
