# Neon Grid Task B I0 — pass-attribution evidence

**Current checkpoint status: PARTIAL — owner acceptance approved for nonproduction engineering use with exception. Production acceptance is NOT GRANTED.** The reviewed Task B implementation source is `dea1b689dc76eff27eb0429d804b6468b4030164`, and the pre-exception review head was `3e42ac8bee323d082af4632165354e83ca8bb914`. Focused tests and post-correction desktop/portrait software-WebGL captures passed. The paired coverage run still has two timeouts, and the complete standard coverage suite remains outstanding. No physical-device/G-05 certification was performed. This does not complete all Phase I0 instrumentation.

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

## Validation closure follow-up (October 15, 2026)

The routing file includes cases using `?testRacePerf=1`, but not every real integration case enables diagnostics. Before this follow-up, Task B measured every Bloom and motion-blur boundary and constructed pass reconciliation/context objects on diagnostic warmup and unsampled frames, although the meter only retains one pass sample per ten scored frames. The correction asks the meter whether the upcoming frame is eligible for a retained pass sample and limits pass-level work to those frames. Non-sampled frames continue through the same render calls; the schema and sampling indices are unchanged. Historical screenshots remain pinned to the prior implementation and were not recollected after this correction. The regression tests first failed because the prediction API was absent and because a disabled collection frame still inspected renderer counters; both pass with the correction.

- `npm exec -- vitest run tests/race-performance-meter.test.ts tests/render-pass-instrumentation.test.ts` — PASS, exit 0; 15 tests.
- `npm run typecheck` — PASS, exit 0. `npm run lint` — PASS, exit 0, zero warnings. `npm exec -- prettier --check src/game/KartTimeTrial.ts src/game/diagnostics/RacePerformanceMeter.ts src/game/diagnostics/RenderPassInstrumentation.ts src/game/rendering/RaceBloom.ts tests/race-performance-meter.test.ts tests/render-pass-instrumentation.test.ts docs/evidence/2026-10-15-neon-grid-task-b-i0/README.md` — PASS, exit 0. `git diff --check` — PASS, exit 0.
- Before the correction, `npm run test:ci -- tests/neon-grid-stage4-t9-7-city-ground.test.ts tests/race-diagnostics-routing.test.ts` — FAIL, exit 1; 66/67 tests passed. The geometry-only `keeps Falls city ground clear of the Waterfall Dive roadway and landing pad` test timed out at 5.351 seconds; the routing file passed.
- After the correction, the same command — FAIL, exit 1; 66/67 tests passed. The same geometry-only test timed out at 5.118 seconds; all 41 routing tests passed. No timeout, worker, coverage, CI, or test-selection setting was changed.
- `npm run test:ci -- tests/neon-grid-stage4-t9-7-city-ground.test.ts` — PASS, exit 0; 26/26 tests, 109.69 seconds. Scoped V8 coverage was 80.51% statements, 57.76% branches, 71.76% functions, and 81.88% lines. `vite.config.ts` defines no numerical coverage thresholds; these are scoped measurements, not full-suite coverage.
- Independent main workflow run [38668753219](https://github.com/Manaconda33/manacondas-minigame-mayhem/actions/runs/38668753219): three trusted pinned-runtime jobs passed and the `dive` job failed on the unrelated geometry test `tests/neon-grid-billboard-exit.test.ts > keeps the repaired exit inlay on the rendered support` at the existing 5,000 ms timeout. This independent failure supports possible runner contention but does not establish the cause of the Task B run.

The prior isolated T9.7 pass and paired timeout were evidence consistent with execution contention, but did not establish its cause. The earlier 11 full-suite timeouts were not all reproduced or conclusively classified. The complete standard coverage suite was not rerun because the paired focused check did not pass. PR #308 remains a draft pending a clean focused run and then one complete standard coverage run.

## Warmup correction recovery and validation closure (October 15, 2026)

The correction was recovered from the preserved dirty checkout and committed on local branch `recovery/task-b-i0-warmup-20261015` as `dea1b689dc76eff27eb0429d804b6468b4030164`, directly on remote PR #308 HEAD `402a2d2b5c8c9921614fe6d76344f8fabe0676ce`. The original dirty checkout remained untouched. The recovery diff contains six implementation/test files only; the initial evidence update was separate. At the time of that note, nothing had been pushed because paired coverage failed; the following addendum records later fast-forward publication.

The corrected meter predicts the same eligibility, warmup and one-in-ten scored-frame schedule used by `record()`. Stage measurement, pass context construction and `finishFrame()` now run only for frames that will retain pass data. Whole-frame counters are still recorded on every diagnostic frame. Render calls/order, bloom counter resets and `autoReset`, renderer targets, motion-blur behavior, JSON schema and sample indices are unchanged. Diagnostics-off paths do not create or call the observer. Focused tests cover first retained sample index 0, the next sample at 10, and pauses, hidden frames and boundaries not shifting those indices. Race restart uses a new `KartTimeTrial` instance; the existing dispose path clears meter/observer buffers, and `start()` marks the next frame as a diagnostic boundary. The correction removes unnecessary pass-level counter/target reads and sample-object construction during diagnostic warmup and unsampled frames; no reliable CPU performance gain was measured.

**Historical visual evidence:** the original 12 screenshot pairs and capture report above remain pinned to the pre-correction implementation marker `bd36f2d6b35423e4e3b281d80fc0fb9144df52ad`. They are retained as historical evidence. At the time of the recovery note, no capture had been recollected against `dea1b689`; the new focused capture below supersedes that limitation for one Skyline chase state at two emulated viewport sizes.

**Validation on the recovered source:**

- Node `v22.23.3`; focused diagnostic/render tests (`race-performance-meter`, `render-pass-instrumentation`, `race-bloom`, `race-motion-blur`, and `race-diagnostics-routing`) — PASS, exit 0; 5 files / 77 tests, 33.69 seconds.
- `npm run test:ci -- tests/neon-grid-stage4-t9-7-city-ground.test.ts tests/race-diagnostics-routing.test.ts` — FAIL, exit 1; 65/67 passed in 204.99 seconds. The T9.7 file passed. In `race-diagnostics-routing.test.ts`, `frames the elevated Neon player in portrait through the real camera integration` timed out at 5,020 ms and `selects the approved Neon map orientation in the real race and keeps Alpha orientation` timed out at 5,127 ms. The default 5,000 ms timeout, coverage settings and workers were unchanged.
- Both timed-out routing tests call `setup` with an empty query string. They do not activate `?testRacePerf=1`, so the pass observer is absent on those test paths. This means they do not directly exercise the new pass measurements; it does not prove the underlying cause is environmental. The earlier independent workflow [38668753219](https://github.com/Manaconda33/manacondas-minigame-mayhem/actions/runs/38668753219) also failed one unrelated billboard-exit geometry test in its `dive` matrix job while three pinned-runtime jobs passed. Together these are consistent with intermittent execution pressure, not proof of it.
- The full `npm run test:ci` suite was not run after the paired command failed. There is no new complete-suite pass or new full-suite failure count for this recovery source.
- `npm run typecheck` — PASS, exit 0, 6.0 seconds. `npm run lint` — PASS, exit 0 with zero warnings, 20.7 seconds.
- `npm run build` initially exited 1 because sandbox policy denied the existing `unzip` subprocess (`spawnSync unzip EPERM`). The unchanged command then passed, exit 0, 10.3 seconds, after allowing that existing subprocess. SFX, music, branding, T9.5 PNG, terrain JPEGs, approved ads, archived Cleo hashes, track textures, Results/Podium assets, GLBs and character PNG checks all passed. Vite emitted its existing large-chunk advisory.
- `git lfs fsck` — PASS, exit 0. `git diff --check` — PASS, exit 0 before this evidence addendum; it was rerun after the addendum.

At the time of this recovery note, PR #308 was still at remote HEAD `402a2d2b5c8c9921614fe6d76344f8fabe0676ce`, the correction was local-only, and the full coverage gate was outstanding. The next addendum records the subsequent publication, focused browser evidence and current review status.

## Recovery publication and post-correction browser check (October 15, 2026)

The commits were independently checked: `dea1b689dc76eff27eb0429d804b6468b4030164` has parent `402a2d2b5c8c9921614fe6d76344f8fabe0676ce`; evidence commit `1772704adb969ef77f4831769d62cddc66f4251a` descends from it. The remote PR branch was fetched at exactly `402a2d2...`, then both commits were published by a non-force fast-forward. GitHub now reports PR #308 open and draft at `1772704...`. The original dirty checkout remains untouched. Runtime source is `dea1b689`; `1772704` contains evidence-only edits after that implementation.

The bounded correction adds a state-free prediction of the meter's existing eligibility, warmup and one-in-ten scored-frame retention policy. It avoids pass-counter/target reads, pass-context allocation and pass reconciliation on diagnostic warmup and unsampled frames. Whole-frame counters are still recorded every diagnostic frame. Rendering calls/order, image-producing settings, resets, targets, motion blur and capture schema are unchanged; no CPU-performance improvement is claimed.

**Focused post-correction browser evidence:** [`captures-post-warmup-correction/render-pass-capture.json`](captures-post-warmup-correction/render-pass-capture.json) and its four PNGs are pinned to runtime source `dea1b689dc76eff27eb0429d804b6468b4030164`. A temporary focused variant of the committed runner captured one staged Skyline chase frame at desktop 1280×720 / DPR 1.5 (actual buffer 1920×1080) and portrait 390×844 / DPR 1. Each instrumented/uninstrumented pair has identical PNG SHA-256, whole-frame draw/triangle totals, camera transform, material-state hash, racer roster and scene snapshot. The report contains no HTTP, page or console errors. Chromium logged an existing Three.js shadow-map deprecation warning; no renderer state or visual option was changed.

| Viewport          |   Whole frame |   Main scene |   Bloom mask | Horizontal / vertical / composite |         Bloom target |   Attributed residual |
| ----------------- | ------------: | -----------: | -----------: | --------------------------------: | -------------------: | --------------------: |
| Desktop 1920×1080 | 266 / 137,095 | 131 / 68,498 | 132 / 68,594 |                        1 / 1 each | 768×432 (331,776 px) | 0 calls / 0 triangles |
| Portrait 390×844  | 196 / 110,819 |  96 / 55,360 |  97 / 55,456 |                        1 / 1 each |  195×422 (82,290 px) | 0 calls / 0 triangles |

Both bloom composites target the full drawing buffer. The main scene counter includes shadow submissions when Three.js updates them; the mask disables shadow updates. These are submitted draws/triangles, not unique objects or mesh geometry. Target pixel counts do not represent GPU processing cost. The PNG hashes are `eb1c4cb7ccc3a289eb26d2db5448373413246a73382998bc9df239476ca95d51` (desktop pair) and `df70ed22d7b05b89e3fb335004cb68ed9bb60f4855fea2aa6560b4b171438d50` (portrait pair).

This is browser viewport emulation on Headless Chromium 151 / SwiftShader software WebGL, not a physical mobile device or FPS certification. The focused harness staged one render per viewport; it is not a full race capture and does not measure diagnostic overhead. Its 120 explicit scene warmup renders invoked `RaceBloom.render(..., false)` to disable pass collection. The automatic `RacePerformanceMeter` schedule is covered by the focused unit tests: first retained sample index 0, next index 10, with pause, hidden and boundary frames not shifting the indices. This browser check therefore does not claim an end-to-end full-race sample trace.

**Validation and uncertainty:** the focused no-coverage diagnostic/render tests passed 77/77 (33.69 seconds). The paired coverage command on the correction source passed 65/67 tests and exited 1 after 204.99 seconds: two routing tests timed out at 5,020 ms and 5,127 ms, both on setup with an empty query string where the pass observer was inactive. Earlier paired attempts timed out in different tests. An earlier full coverage run on the prior source passed 1,088/1,099 tests, with 11 five-second timeouts. The independent production `main` workflow 38668753219 had a similar unrelated timeout. These observations are consistent with possible execution contention but do not prove that cause or establish Task B innocence. No paired or full coverage suite was rerun in this preservation assignment; full standard coverage on the correction source remains outstanding.

**Owner decision (October 15, 2026):** owner acceptance is **APPROVED FOR NONPRODUCTION ENGINEERING USE WITH EXCEPTION**. Technical validation remains **PARTIAL**. Production acceptance is **NOT GRANTED**. The owner accepts the recorded 65/67 paired coverage result and the absence of a complete corrected-source coverage run for this isolated checkpoint. The full coverage command is not marked successful, suspected contention is not treated as a proven cause, and no GitHub-required check or branch protection is waived. The captures and focused tests establish source correctness and rendering invariance only for their recorded scope; they do not certify runtime performance, a full-race sampling trace, physical-device performance or G-05. No production gameplay or visual change was intended or authorized, and no deployment, CI change, new graphics threshold, Task C/D work or additional instrumentation is authorized by this exception.
