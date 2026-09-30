# Full-Race Diagnostics and Medium Baseline Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans for native, task-by-task execution. Steps use checkbox syntax. Do not delegate unless Manny requests it.

**Goal:** Capture trustworthy whole-race frame timing and renderer counters so later Slice 6 effects and optimization are driven by measured evidence.

**Architecture:** A bounded, opt-in race-owned meter receives raw RAF intervals independently of the clamped simulation delta. A separate counter adapter reads Three.js renderer metadata after rendering. The app exposes a diagnostic-only capture/download flow when `?testRacePerf=1`; ordinary HUD, gameplay and audio remain unchanged.

**Tech Stack:** Existing TypeScript, Three.js WebGLRenderer, Vitest/JSDOM and GitHub CI. No dependency, backend, remote analytics or new binary asset.

**Spec:** `docs/SLICE-6-GRAPHICS-AUDIT-2026-09-30.md`; PRD 2.6, G-05, 30, 35.7 and 36.5. Engineering defaults below govern diagnostics, not new PRD acceptance thresholds.

## Authorization and boundaries

Manny approved the audit, aligned with the recommendation to add optional full-race diagnostics and capture the Medium baseline, then requested repository preparation for a new session to get started. The next session may implement this bounded diagnostics increment natively without repeating the audit or asking for the same scope approval. This setup session writes documentation only. New VFX, bloom, motion blur, camera behavior, automatic quality downgrade, cleanup repairs, context-loss behavior and music re-encoding are outside this implementation.

- Preserve physics stepping and the 0.1-second simulation delta clamp. Never use the clamp for measured RAF timing.
- Preserve all Task 10/11, desktop/mobile flow, restart, SFX/music and presentation approvals.
- Diagnostics must be explicit opt-in; `testRacePerf=1` is the only enabling value. Preserve `testItemPerf` and its accepted evidence.
- Medium target: eight racers, 1920×1080, identified baseline desktop; median FPS >=60, p95 frame <=18.3 ms; no sustained >50 ms sequence. Report sequences instead of inventing a new sustained-duration pass criterion.
- Report draw-call target <=250 and triangle target <=750,000. GPU <=12 ms is preferred where measurable; unavailable GPU/heap/texture-byte data is null/unavailable, never zero or passed.
- Retain approved shadow/particle thresholds (12 dynamic objects / 2,500 gameplay particles) as pending budget evidence until counts are defined/measured correctly. Do not substitute submesh counts for dynamic objects.
- Save progress in an isolated implementation branch. Do not merge/deploy new runtime behavior without Manny's publication approval. No next slice is authorized.

## File responsibilities

| File | Responsibility |
| --- | --- |
| Create `src/game/diagnostics/RacePerformanceMeter.ts` | Raw interval filtering, bounded sample window, exact summary/export |
| Create `src/game/diagnostics/RendererCounters.ts` | Typed Three.js draw-call/triangle/resource count snapshot |
| Create `src/game/diagnostics/raceDiagnostics.ts` | Exact query flag and capture schema |
| Modify `src/game/KartTimeTrial.ts` | Race-owned meter lifecycle, post-render counters, optional diagnostic callback |
| Modify `src/app/mountAppShell.ts` | Opt-in panel and downloadable JSON; listener/callback cleanup |
| Modify `src/style.css` only if needed | Small diagnostic-only panel; no ordinary layout changes |
| Create `tests/race-performance-meter.test.ts` | Filtering, quantiles, long frames, sample bounds |
| Create `tests/renderer-counters.test.ts` | Counter semantics, reset and non-additive memory counts |
| Create `tests/race-diagnostics-routing.test.ts` | Real frame/app wiring, opt-in/export and disposal |
| Create `docs/SLICE-6-MEDIUM-PERFORMANCE-METHODOLOGY.md` | Reproducible capture procedure and interpretation |
| Create `docs/evidence/2026-09-30-medium-baseline/README.md` | Actual capture index or explicit pending capture explanation |

## Review focus

- A >100 ms RAF stall stays visible even though simulation catches up with at most its current limit.
- Hidden/paused/countdown/resume boundaries do not pollute the scored interval window or erase valid earlier samples.
- Disabled diagnostics allocate no per-frame sample/counter payloads and add no panel/listeners.
- Restart/disposal cannot export a stale race capture; capture memory stays bounded and truncation is explicit.
- Renderer memory fields are object counts, CPU submission is not GPU time, and missing provenance/short captures never receive a full-race acceptance label.

## Interfaces and metric policy

`racePerformanceFromSearch(search: string): boolean` enables only exact `testRacePerf=1`.

`RacePerformanceMeter` accepts `enabled: boolean`, `warmupFrames = 120`, `maxSamples = 36000`; exposes `record(frame: RaceFrameObservation): void`, `snapshot(): RacePerformanceSnapshot`, `exportCapture(metadata: RaceCaptureMetadata): RacePerformanceCapture`, `dispose(): void`.

`RaceFrameObservation`: rawFrameMs:number; phase:'countdown'|'racing'|'finished'; paused:boolean; hidden:boolean; boundary:boolean; counters:RendererCounterSnapshot|null. `boundary` identifies the first interval after capture start or eligibility changes. Reject nonfinite/nonpositive durations; skip boundary intervals and all ineligible phases. Warmup decrements on eligible frames only; it occurs once per race, not again after every pause.

`RendererCounterSnapshot`: drawCalls:number; triangles:number; geometries:number; textures:number; width:number; height:number; pixelRatio:number. Memory fields are counts. `readRendererCounters(renderer: THREE.WebGLRenderer): RendererCounterSnapshot` reads renderer.info plus actual drawing-buffer dimensions after render; does not change renderer reset behavior.

Count eligibleFrames before warmup; scoredFrames after warmup; skippedFrames counts invalid, ineligible and boundary observations. These diagnostics totals do not replace authoritative race time.

`RacePerformanceSnapshot`: scoredFrames:number; eligibleFrames:number; skippedFrames:number; durationMs:number; medianFrameMs:number|null; p95FrameMs:number|null; maxFrameMs:number|null; medianFps:number|null; over50msFrames:number; longestOver50msRun:number; truncated:boolean; maxDrawCalls:number|null; maxTriangles:number|null. Exact quantiles use nearest rank `ceil(n*p)-1`, with odd/even median defined as the mean of the two center entries for even n. medianFps is the median of per-frame `1000/rawFrameMs`, not a capped HUD average. Report percentile method in export.

Store at most 36,000 scored intervals (an engineering memory bound). On reaching the limit, stop adding scored intervals, mark truncated and retain the exact original window; do not silently slide a whole-race capture. Stop scoring at finish but leave the capture exportable through Results until navigation/disposal. Keep full-capture arrays private; snapshot callers receive copies and do not sort/mutate the live sample buffer.

`RaceCaptureMetadata`: schemaVersion:1; sourceCommit:string|null; capturedAt:string; quality:GraphicsQuality; userAgent:string; hardwareDescription:string|null; scenario:string; racerCount:number; nominalViewport:{width:number;height:number}; gpuFrameMs:null; jsHeapBytes:number|null; estimatedTextureBytes:null. Feature-detected heap values must include method/support notes; no feature is mandatory on unsupported browsers. Hardware remains user-entered or unknown. No overall pass/fail field: raw diagnostic captures alone do not establish PRD acceptance.

`RacePerformanceCapture`: schemaVersion:1; metadata:RaceCaptureMetadata; summary:RacePerformanceSnapshot; samples:readonly {rawFrameMs:number;counters:RendererCounterSnapshot|null}[]; raceCompleted:boolean; policies:{warmupFrames:number;maxSamples:number;percentileMethod:'nearest-rank';medianMethod:'mean-of-center-pair';excluded:'countdown,pause,hidden,boundary,invalid'}; unavailableMetrics:readonly string[]. raceCompleted comes from authoritative finished phase, not editable metadata. Export fresh copies; no live references. Require raceCompleted and nontruncated provenance-complete data for the whole-race interpretation, without assigning an automatic pass.

`TimeTrialOptions.onDiagnostics?: (snapshot: RacePerformanceSnapshot) => void`; `KartTimeTrial.exportPerformanceCapture(metadata: RaceCaptureMetadata): RacePerformanceCapture|null`. Callback/UI updates at most once per second. Meter owns no gameplay timing; raw interval is computed before the existing clamp. Read render counters only when enabled and after `renderer.render`, where renderer.info describes that frame.

## Task 1: Meter and counter adapter

- [x] Write failing `race-performance-meter.test.ts` cases: exact flag parsing; disabled no samples; raw 250 ms recorded as 250 ms; nonfinite/zero/negative rejection; countdown/paused/hidden skipped; boundary interval skipped; warmup counts only eligible intervals; pause leaves earlier samples intact; explicit full-sample truncation; immutable export; dispose stops collection.
- [x] Pin statistics with durations [10,20,30,100] and warmup 0: medianFrameMs 25, p95FrameMs 100, max 100, medianFps `(1000/20 + 1000/30)/2`, one >50 ms frame. Durations [60,70,10,80] have three >50 ms frames and longest run 2. A boundary splits a run but preserves total samples.
- [x] Write failing `renderer-counters.test.ts`: read calls/triangles from info.render; geometries/textures from info.memory without multiplying by frames; actual drawing-buffer dimensions; adapter does not call renderer.render/info.reset or mutate shadow/quality.
- [x] Run `npx vitest run tests/race-performance-meter.test.ts tests/renderer-counters.test.ts` and observe relevant assertion/import failures.
- [x] Implement meter, schema and adapter with the interfaces/policies above. Keep GPU/texture byte fields unavailable; do not add costly scene traversal or GPU query machinery in this task.
- [x] Rerun focused tests, `npm run typecheck`, `npm run lint`; commit `feat: add opt-in full-race performance capture primitives`.

## Task 2: Wire raw timing and opt-in capture/export

- [x] Add failing routing tests that drive the real race frame integration using injected RAF timestamps/fake renderer. A 250 ms interval yields raw diagnostics 250 ms while the existing simulation still receives 0.1 seconds. A paused/hidden transition is excluded and the first resumed interval is skipped. Renderer counter reads occur after render.
- [x] Add app tests: no diagnostics for absent/0/true flag; `?testRacePerf=1` exposes a diagnostic panel, counters and Download Capture control; ordinary HUD/control markup is unchanged. Download produces schema version 1 JSON and revokes its object URL; disposed/replaced races cannot update the new panel or export stale data.
- [x] Run `npx vitest run tests/race-diagnostics-routing.test.ts` and observe failures before wiring.
- [x] Wire race-owned meter and callback. Preserve RAF scheduling, simulation, HUD frame fields, camera, audio, pause handling and current item timing. Add independent raw timing variables and eligibility boundary tracking; do not refactor the large race module broadly.
- [x] Implement isolated app diagnostic UI only when opted in. Use existing routing/generation cleanup, allow download at Results before disposal, identify sample window/warmup/truncation, and label memory counts correctly. Do not add automatic pass badges.
- [x] Run focused tests and existing `tests/item-performance-meter.test.ts`, `tests/settings.test.ts`, `tests/music-routing.test.ts`, `tests/results-routing.test.ts`; run full `npm run validate` and `git lfs fsck`; commit `feat: expose race diagnostics and bounded JSON capture`.

## Task 3: Review build and Medium baseline evidence

- [x] Write the methodology and capture index. Record actual source SHA, browser/OS/device, graphics quality, drawing-buffer dimensions/DPR, eight racers, scenario, exclusions, raw data path and known limitations. Use a complete ordinary three-lap race with warmup excluded; avoid forced-item fixtures for the primary baseline.
- [x] Validate the new runtime in a real browser: opt-in source/counters/export, raw long interval handling, pause/tab return, finish/restart/navigation cleanup. Run at an actual 1920×1080 drawing buffer on Medium. If device/capability or browser automation is unavailable, record the precise blocker and leave measurements pending; provide a review link and concise owner capture instructions.
- [ ] Capture current visual baseline before adding effects. Record median FPS, p95/max interval, >50 ms count/run, draw-call and triangle maxima, resource count observations and unavailable GPU/heap/texture measurements. A short/truncated/provenance-incomplete export is diagnostics, not final PRD acceptance.
- [x] Review diff for preserved physics/audio/ordinary HUD and no unauthorized graphics behavior. Run `npm run validate`, `git diff --check`, `git lfs fsck` before publishing review code; record real output/counts and CI.
- [x] Publish an implementation review branch/PR and permitted listening/gameplay review deployment using the existing approved repository workflow. Do not modify protected Pages environments or retry known blocked LFS workarounds. Do not deploy runtime changes to production yet.
- [x] Update status/testing records, link captured JSON and review URL, record results or pending hardware evidence, and stop for Manny's review/publication approval. Do not start VFX/bloom/blur automatically.

## Setup self-review

Interfaces use one authority; raw timing and clamped simulation remain separate. All five review-focus conditions have Task 1/2 tests. Tasks 1–3 cover audit recommendation 1; later rendering effects and cleanup repairs are explicitly deferred. Engineering capture bounds/quantile conventions are documented without changing PRD targets. New runtime publication remains a separate approval gate.

## Native execution checkpoint

Tasks 1–2 implemented and verified in review PR #212; exact evidence and initial-failure corrections are in `docs/evidence/2026-09-30-medium-baseline/progress.md`. Final runtime `4673aac5caae8c8b153526a74afb9d70cb24c15f`, full validation 85 files / 663 tests. Task 3 methodology prepared; actual identified-desktop capture and real browser smoke remain pending the documented hardware/authentication blockers. Private review publication/CI is recorded in the evidence index as it completes. No runtime merge/production or later graphics scope is authorized.

Task 3 real browser/device fallback was executed: precise auth/hardware blockers documented, measurements pending. The actual visual/whole-race capture checkbox remains open. Runtime PR CI passed and private review deployed; stop for owner review/production approval.
