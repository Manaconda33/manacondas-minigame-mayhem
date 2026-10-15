# Neon Grid Task B I0 — pass-attribution evidence

**Checkpoint status:** First read-only instrumentation increment implemented. The source-pinned software-WebGL capture and matched viewport screenshots passed. The standard full coverage command has 11 unchanged timeout failures, and no physical-device/G-05 certification was performed. This does not complete all Phase I0 instrumentation. Owner review is pending.

## Exact baseline and branch

- Approved Task A runtime: `692e9424c2cbf15decbb467b230c02c2e10452a0`.
- Compatible nonproduction review base: Task A evidence checkpoint `d94c813dafd0839e83e1c7dd79ceadf2dca5949b`. GitHub comparison confirms its ten commits beyond `692e942` changed documentation/evidence only, with no runtime or asset changes.
- Implementation commit and source marker: `bd36f2d6b35423e4e3b281d80fc0fb9144df52ad` on `engineering/neon-grid-task-b-i0-instrumentation-20261014`.
- No PR #242 history was merged; production `main` was not changed.

## Before-change boundary map

The counter/reset trace is recorded in [instrumentation-boundary-map.md](instrumentation-boundary-map.md). `RaceBloom` owns the existing per-frame renderer-counter origin and temporarily preserves `info.autoReset` behavior while rendering the base image and bloom stages. Motion blur preserves its existing auto-clear/auto-reset save and restore around framebuffer copies and its fullscreen shader render. `KartTimeTrial.frame` reads the existing whole-frame totals after bloom and motion blur.

The observer wraps only existing `renderer.render` boundaries. It snapshots `renderer.info.render.calls` and `.triangles`, then records nonnegative deltas and target dimensions. It never resets the renderer, changes render order, changes targets, or alters render state. Main-scene submissions include shadow work when Three.js updates shadows during that render; renderer counters do not split shadows from scene geometry. Bloom-mask rendering disables shadow updates. Framebuffer copies are recorded separately from draw calls.

## Implemented data contract

Instrumentation is instantiated only for existing exact `?testRacePerf=1` diagnostic activation. With the flag disabled, no observer is attached and no new counter snapshot or target-size lookup runs. With diagnostics enabled, additive `renderPasses.schemaVersion: 1` data is sampled once per ten scored frames and bounded by the existing whole-frame sample cap. Existing schema version 1 fields and their meanings remain intact.

The named boundaries are main scene, bloom mask, horizontal/vertical filter, composite, bloom failure redraw, and motion-blur composite. Reconciliation reports whole-frame totals, attributed sums, residuals, and unavailable stages; it does not invent values to force equality. Motion-blur framebuffer copies are not presented as renderer submissions. [example-unit-frame.json](example-unit-frame.json) is deliberately a synthetic unit-test fixture, not a browser measurement.

Semantics: calls are submitted draws, not distinct objects; triangles are submitted work, not unique mesh geometry. Render-target pixels are width × height, not GPU processing cost or bandwidth. Existing frame times are CPU-observed; GPU frame time, true texture bytes, unique geometry/object counts, and dynamic shadow-caster count remain unavailable. A WebGL renderer string can identify known software renderers but cannot certify a physical device.

## Source-pinned browser fixture

Runner: [`tools/diagnostics/neon-grid-task-b-i0-capture.mjs`](../../../tools/diagnostics/neon-grid-task-b-i0-capture.mjs). It stages actual `KartTimeTrial` on the approved Task A selector using Medium quality, eight racers, deterministic roster seed 1417, 120 scene-render warmup frames, Skyline/Undercity/Falls Run positions, and chase/rear views. Viewports were desktop 1280×720 at scale 1.5 (actual buffer 1920×1080, DPR 1.5) and portrait 390×844 at scale 1 (actual buffer 390×844, DPR 1). This is browser viewport emulation, not physical-device testing or a full-race performance distribution.

- Report: [`captures/render-pass-capture.json`](captures/render-pass-capture.json), captured `2026-10-15T03:28:17.694Z`, source marker exactly `bd36f2d6b35423e4e3b281d80fc0fb9144df52ad`.
- Environment: Headless Chromium `151.0.7922.173`; WebGL renderer `ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero) (0x0000C0DE)), SwiftShader driver)`, identified as software. Medium graphics, eight racers, shadows on, selective bloom on, motion blur off. Bloom targets: desktop 768×432 (331,776 pixels); portrait 195×422 (82,290 pixels). Main/composite targets: desktop 1920×1080 (2,073,600 pixels); portrait 390×844 (329,160 pixels).
- All 12 instrumented/uninstrumented pairs had byte-identical screenshot SHA-256, whole-frame draw/triangle totals, camera position/quaternion, material-state hash, roster, and scene-visibility signature. All 12 instrumented reconciliations were complete with zero unattributed calls/triangles. The runner reported zero HTTP errors, page errors, or console errors. It did not explicitly call `gl.getError`; a direct GL-error query is not claimed.
- All desktop frames used selective bloom. `mainScene` includes shadow submissions when updated; `bloomMask` disables shadow updates. The mask repeats scene geometry submissions, then horizontal/vertical/composite each submit one fullscreen draw and one triangle. These are submitted work, not additional unique geometry.

### Desktop stage measurements

`calls / triangles`; whole-frame counters are from the established `RendererCounters` path.

| Sector / view     |    Main scene |    Bloom mask | Horizontal | Vertical | Composite |   Whole frame | Reconciliation           |
| ----------------- | ------------: | ------------: | ---------: | -------: | --------: | ------------: | ------------------------ |
| Skyline / chase   |  131 / 68,498 |  132 / 68,594 |      1 / 1 |    1 / 1 |     1 / 1 | 266 / 137,095 | Complete; 0 / 0 residual |
| Skyline / rear    | 114 / 176,890 | 115 / 176,986 |      1 / 1 |    1 / 1 |     1 / 1 | 232 / 353,879 | Complete; 0 / 0 residual |
| Undercity / chase |  146 / 68,048 |  147 / 68,144 |      1 / 1 |    1 / 1 |     1 / 1 | 296 / 136,195 | Complete; 0 / 0 residual |
| Undercity / rear  | 131 / 187,060 | 132 / 187,156 |      1 / 1 |    1 / 1 |     1 / 1 | 266 / 374,219 | Complete; 0 / 0 residual |
| Falls Run / chase |   52 / 47,934 |   53 / 48,030 |      1 / 1 |    1 / 1 |     1 / 1 |  108 / 95,967 | Complete; 0 / 0 residual |
| Falls Run / rear  | 189 / 193,506 | 190 / 193,602 |      1 / 1 |    1 / 1 |     1 / 1 | 382 / 387,111 | Complete; 0 / 0 residual |

Portrait captures also fully reconciled. Their whole-frame totals are in the JSON report; the six pairs used a distinct drawing-buffer size and same controlled scene states. The report preserves geometry/texture counts as counts only, not bytes.

### Matched screenshot pairs

Each link opens the instrumented and uninstrumented PNGs for the same scene/camera/viewport. Each pair's screenshot hashes match exactly.

| Scene / view      | Desktop pair                                                                                                                                                  | Portrait pair                                                                                                                                               |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Skyline / chase   | [instrumented](captures/skyline-chase-desktop-1920x1080-instrumented.png) · [uninstrumented](captures/skyline-chase-desktop-1920x1080-uninstrumented.png)     | [instrumented](captures/skyline-chase-portrait-390x844-instrumented.png) · [uninstrumented](captures/skyline-chase-portrait-390x844-uninstrumented.png)     |
| Skyline / rear    | [instrumented](captures/skyline-rear-desktop-1920x1080-instrumented.png) · [uninstrumented](captures/skyline-rear-desktop-1920x1080-uninstrumented.png)       | [instrumented](captures/skyline-rear-portrait-390x844-instrumented.png) · [uninstrumented](captures/skyline-rear-portrait-390x844-uninstrumented.png)       |
| Undercity / chase | [instrumented](captures/undercity-chase-desktop-1920x1080-instrumented.png) · [uninstrumented](captures/undercity-chase-desktop-1920x1080-uninstrumented.png) | [instrumented](captures/undercity-chase-portrait-390x844-instrumented.png) · [uninstrumented](captures/undercity-chase-portrait-390x844-uninstrumented.png) |
| Undercity / rear  | [instrumented](captures/undercity-rear-desktop-1920x1080-instrumented.png) · [uninstrumented](captures/undercity-rear-desktop-1920x1080-uninstrumented.png)   | [instrumented](captures/undercity-rear-portrait-390x844-instrumented.png) · [uninstrumented](captures/undercity-rear-portrait-390x844-uninstrumented.png)   |
| Falls Run / chase | [instrumented](captures/falls-run-chase-desktop-1920x1080-instrumented.png) · [uninstrumented](captures/falls-run-chase-desktop-1920x1080-uninstrumented.png) | [instrumented](captures/falls-run-chase-portrait-390x844-instrumented.png) · [uninstrumented](captures/falls-run-chase-portrait-390x844-uninstrumented.png) |
| Falls Run / rear  | [instrumented](captures/falls-run-rear-desktop-1920x1080-instrumented.png) · [uninstrumented](captures/falls-run-rear-desktop-1920x1080-uninstrumented.png)   | [instrumented](captures/falls-run-rear-portrait-390x844-instrumented.png) · [uninstrumented](captures/falls-run-rear-portrait-390x844-uninstrumented.png)   |

### Measurement overhead observation

A separate desktop Skyline/chase run scored 60 CPU wall-time samples after 10 warmup calls around existing Bloom and disabled motion-blur rendering. Uninstrumented median/p95/max was **6.15/41.2/49.3 ms**; instrumented was **2.9/16.6/41.4 ms**. The difference is noisy and order-sensitive, and the measured interval is not whole-frame time. It does not isolate instrumentation cost or estimate GPU time. Treat overhead as **not established**; a controlled repeated/counterbalanced overhead fixture may be justified later.

## Validation and limits

- `npm ci --cache /workspace/.npm-cache` — PASS, 198 packages.
- `npm run typecheck` — PASS.
- `npm run lint` — PASS, zero warnings.
- Focused diagnostics/render suite under Node 22.23.3 — PASS, exit 0; 7 files / 82 tests, 36.13 seconds.
- `npx vitest run tests/neon-grid-stage4-t9-7-city-ground.test.ts tests/race-diagnostics-routing.test.ts` without coverage under Node 22.23.3 — PASS, exit 0; 2 files / 67 tests, 58.28 seconds.
- `npm run test:ci` with Node 22.23.3 — FAIL, exit 1; 1,088 / 1,099 tests passed (133 / 135 files). Eleven tests hit existing 5,000 ms timeouts: seven in `tests/neon-grid-stage4-t9-7-city-ground.test.ts` and four in `tests/race-diagnostics-routing.test.ts`. Duration 1,019.38 seconds. No timeout or coverage threshold was changed.
- `npm run build` — PASS after allowing the branding validator's required `unzip` subprocess. Asset checks passed for SFX/music, branding, T9.5 PNG, terrain JPGs, approved ads, archived Cleo hashes, track textures, Results/Podium assets, GLBs, and character PNGs. Vite emitted its existing large-chunk advisory.
- `git lfs fsck` — PASS; `npx prettier --check` on changed implementation/tests/runner/evidence sample and changed Task B sections — PASS; `git diff --check` — PASS.

The capture uses the browser/software renderer only to verify attribution and matched visuals. It is not physical-device FPS evidence or G-05. GPU frame time, true texture residency bytes, unique object/geometry count, dynamic shadow casters, direct `gl.getError`, and full-race performance distribution remain unavailable. Existing approved graphics limits and CI thresholds were not changed.

## Next smallest instrumentation increment

A separately authorized follow-up could add a counterbalanced, repeated CPU overhead fixture (with both feature-flag states interleaved) and an explicit WebGL error/context-loss query while retaining these boundaries. Do not add GPU timing, texture-byte estimation, advanced shader inventory, new enforcement, or visual tuning without separate scope and safe measurement support.
