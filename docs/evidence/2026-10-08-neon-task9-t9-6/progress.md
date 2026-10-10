# Neon Grid Stage 4 T9.6 — Performance and Readiness Evidence

**Date:** 2026-10-08 (America/Chicago)  
**Status:** IN PROGRESS. **Representative-hardware performance certification has NOT been obtained. T9.6 is not complete.**  
**Repository/branch:** `Manaconda33/manacondas-minigame-mayhem` / `design/neon-grid-circuit-02`  
**Approved baseline:** `9b973d48c1115d4b35d3936a3eacbed8dbb7ed76`; owner-approved pinned [T9.5 review](https://manaconda33.github.io/manacondas-minigame-mayhem/previews/neon-grid-t9-5-owner-correction/?review=9b973d4)  
**Runtime PR:** [#242](https://github.com/Manaconda33/manacondas-minigame-mayhem/pull/242), draft/unmerged. Neon Grid gameplay not published to production root.  
**PRD:** v1.1, amendment 2.25. Task 9 T9.6 performance/readiness step.

## 1. Approved work and boundaries

Owner approved the six-step T9.6 approach on October 8: freeze baseline, measure actual eight-racer race, make *only evidence-backed visually neutral optimizations*, repeat full hosted validation, certify Medium 1920x1080 on representative desktop hardware, document and stop for approval. Do not invent performance measurements, weaken limits, implement cross-minigame distance culling/LOD, change 300m Neon Grid camera policy, edit approved visuals, tune gameplay, perform T9.7 Skyline city-ground/stepped-building work, merge #242 or publish Neon Grid production gameplay.

## 2. Historical baseline and hotspot (actual T9.5 artifact)

- Source CI [37826321830](https://github.com/Manaconda33/manacondas-minigame-mayhem/actions/runs/37826321830) SUCCESS: 130 files, 1,039 tests, typecheck, lint, build, all Task 8/9 structural rendering gates.
- [Full-course render artifact](https://github.com/Manaconda33/manacondas-minigame-mayhem/actions/runs/37826321830), artifact ID `11571572105`, `t9-5-render-check.json`, 34 screenshot stations, eight racers, 300 scored hosted *software-rendered* frames, zero reported errors.
- **Peak = 206 draw calls at `waterfall-dive-rear`** (157,948 visible triangles at that station). Different frame `tunnel-forward-interior` produced overall maximum **164,806 triangles**; do not misattribute that global peak to the rear view.
- At the 206-call rear station, diagnostic A/B owner-cost observations: Skyline 17 calls; Undercity 15; accepted Falls Run 19; Falls Extension 12; Billboard 4; Dive 14. These are independent hide-one-owner comparisons, **not additive guaranteed optimization savings** or permission to hide these owners at runtime.
- Next-highest reverse captures: `billboard-rear` 188 calls, `tunnel-reverse-interior` 179 calls. The above-200 incidence is narrow, not evidence that every frame exceeds the target.
- Performance captured in the hosted SwiftShader fixture was about **3.326 median FPS / 317.2ms p95**. **These figures are software diagnostics, not a failing real-hardware measurement or a desktop FPS certification.**
- Existing approved T9.5 **220-call blocker applied to T9.5 only**. T9.6 engineering **200-call target**, Task 9 triangle 300,000 bound, PRD hard 250 calls/750,000 triangles remain distinct. **Six calls over engineering target unresolved at this checkpoint.**

## 3. T9.6 instrumentation implementation

Reuse the game's opt-in `?testRacePerf=1` real-race frame meter: `src/game/diagnostics/RacePerformanceMeter.ts` samples actual racing requestAnimationFrame intervals after 120 eligible warm-up frames, excludes paused/hidden/countdown/boundaries, preserves full original-frame distribution (up to 36,000 samples) and records draw calls, triangles and resource counters. It also marks race finish. This is the authoritative device capture, unlike `tools/diagnostics/neon-grid-course.html`, which uses staged kart placements and a software-rendered fixture.

- Updated opt-in panel metadata to export the actual **selected track ID** (`neon-grid` or `circuit-alpha`), **graphics quality** and best-effort reported WebGL GPU renderer string, alongside the already recorded browser/user hardware description and nominal/effective renderer dimensions. This fixes a preexisting hardcoded Circuit Alpha/Medium labeling bug; no gameplay logic or ordinary release UI changes.
- New `tools/diagnostics/t9-6-certify.mjs` independently recomputes median FPS, nearest-rank p95, max frame, longest consecutive >50ms run, drawing-buffer dimensions, draw-call/triangle extrema and metadata consistency. `tools/diagnostics/t9-6-certify.test.mjs` contains bounded positive and deceptive/mismatched test cases; CI now calls Node's built-in test runner. `tests/t9-6-capture-context.test.ts` protects the selected-track/quality metadata in Vitest.
- Evidence checker outcomes: **FAIL** if a gate is missed, **INCOMPLETE** for invalid/short samples, **REVIEW_REQUIRED** if the 200-call or 300k-triangle engineering target is exceeded with no other failure, and **PASS_CANDIDATE** if programmatic requirements pass. PASS_CANDIDATE **never self-certifies hardware**: recorded physical device/browser/GPU details and owner verification are still required.
- A *recorded interpretation of sustained pathological frames* for this T9.6 analyzer is three consecutive frames exceeding 50ms; do not present this operational criterion as a new PRD amendment. The underlying original frame series is preserved for review.
- T9.6 metric checker requires **600 post-warm-up scored frames**, more than the hosted 300-frame readiness sample, a completed three-lap race, real 1920x1080 drawing buffer, actual eight racers/Medium/Neon Grid metadata, matching immutable 40-character source SHA and credible non-software renderer/device details.

## 4. Representative-desktop collection procedure (pending)

1. Open an **isolated T9.6 preview pinned to the final validated runtime source**, with the query `?testRacePerf=1` (or append `&testRacePerf=1` when it already has a query). Do not use the earlier T9.5 pin for T9.6 certification because its capture metadata is hardcoded before the fix.
2. On **hardware-accelerated desktop Chrome or another supported WebGL browser**, set browser rendering viewport to **1920×1080 effective drawing-buffer pixels**; confirm Medium quality in Settings. A smaller buffer or background/inactive tab is not valid. Record device CPU/GPU/RAM, OS, browser/GPU identity, display resolution, browser zoom, graphics quality and ambient/thermal notes.
3. Select **DRIVE NEON GRID**, a driver and complete an ordinary **three-lap race with seven AI**, items and VFX at normal race load. Open the optional Race diagnostics panel, enter real hardware/OS/browser information, and choose **Download Capture** at the results screen. Do not change graphics settings mid-run. Repeat **three** independent complete runs after warm-up.
4. For each downloaded JSON, use `node tools/diagnostics/t9-6-certify.mjs PATH/TO/capture.json EXACT_PINNED_40_CHARACTER_SOURCE_SHA result.json`. Retain originals, per-run computed results, selected representative screenshots and full machine/browser details. A tester on mobile portrait/landscape may additionally report safety/readability and stalls, but this does not replace the 1920x1080 desktop performance gate.
5. Evaluate PRD G-05: Median **>=60 FPS**, p95 **<=18.3ms**, no sustained >50ms sequence under normal race load, <=250 calls / <=750k visible triangles hard cap. Task 9 engineering target 200 calls/300k triangles is reported separately and any exception requires recorded owner disposition. Prefer GPU frame <=12ms where timestamp queries are available; report unavailable rather than guessing.
6. If baseline fails, isolate CPU versus GPU cost and prioritize local no-visible-change fixes, then rerun *identical scenario/device* A/B captures and all hosted tests. Do not change accepted Skyline/Tunnel/Dive visual art, controls, physics, AI/items or add world culling without separate approval. A representative desktop GPU is currently **not accessible through the hosted GitHub CI/SwiftShader environment**, so the certification gate must remain open pending actual hardware captures.

## 5. Pending outputs and stop gate

- Exact-head CI source passes typecheck, lint, all Vitest and Node harness tests, production build, Task 8/9 render gates. Record concrete CI workflow run IDs after completion.
- A source-pinned **diagnostic-only** GitHub Pages preview, with exact source hash and unchanged production bytes, must be published so the hardware collection protocol can be executed against real gameplay. This is distinct from final T9.7 owner-preview approval.
- **Missing real-hardware captures:** no actual desktop benchmark samples have been supplied or verified. Thus **T9.6 is IN PROGRESS, not PASS/complete**. Do not start T9.7, merge #242 or publish Neon Grid gameplay to production.


## 6. Verified source and preview release staging — 2026-10-08

- **Tested source:** c8c65f428fcfbc5236bbebf70ab5f98a9f7671bf, [CI 37862136028](https://github.com/Manaconda33/manacondas-minigame-mayhem/actions/runs/37862136028) SUCCESS: 131 Vitest files / 1,041 tests, six Node analyzer tests, strict typecheck, zero-warning lint, asset verification, production build and inherited Task 8/9 hosted rendering gates. Previous intermediate red CI 37860962199 was corrected and superseded; the source used for publication is the green one.
- **Workflow-only [PR #283](https://github.com/Manaconda33/manacondas-minigame-mayhem/pull/283):** head 60e2fb070a0793566d0f2ac3e517cfbe1816c512, [PR CI 37862150928](https://github.com/Manaconda33/manacondas-minigame-mayhem/actions/runs/37862150928) SUCCESS; merged main at 23c2b97d800a7b7ee9d401d586785d9c24656a11. New source-pinned path /previews/neon-grid-t9-6-diagnostics/ is diagnostic-only. Do not merge gameplay PR #242.
- **Post-merge live verification:** [main Pages 37864780112](https://github.com/Manaconda33/manacondas-minigame-mayhem/actions/runs/37864780112) is the required delivery gate. Treat live byte hashes, deployment and production-root preservation as pending until successful outcome.
- **Outstanding T9.6 gate:** Zero verified representative-desktop GPU samples, no PRD hardware FPS/p95 certification and unresolved six-call exceedance above the 200-call engineering goal at waterfall-dive-rear. No runtime visual optimization, PRD revision, T9.7 start, or Neon Grid gameplay production release.


## 7. Isolated diagnostic publication verified — 2026-10-08

**Delivery PASS:** workflow-only PR #283 merged to main at 23c2b97d800a7b7ee9d401d586785d9c24656a11. [Main/Pages run 37864780112](https://github.com/Manaconda33/manacondas-minigame-mayhem/actions/runs/37864780112) **SUCCESS**, including preview build, Pages deployment and live HTTP 200/byte-hash checks. The review-build.json source marker is the exact green runtime c8c65f428fcfbc5236bbebf70ab5f98a9f7671bf. Independent verified-delivery artifact ID 11588315852.

**Live diagnostic-only link:** https://manaconda33.github.io/manacondas-minigame-mayhem/previews/neon-grid-t9-6-diagnostics/?review=c8c65f4&testRacePerf=1

**Preservation:** The same post-deploy run verified the existing pinned preview files and production-root byte identities as unchanged, including all five approved Neon Grid signage assets at the new diagnostic path. Production gameplay still serves Circuit Alpha; #242 remains draft/unmerged, and neither T9.7 nor gameplay public release was authorized. Earlier pending-publication language in sections 5–6 is superseded by this confirmation.

**Unclosed:** zero real representative desktop captures; median 60 FPS / p95 <=18.3 ms PRD hardware proof unavailable; the Task 9 200-call engineering-target overage at Waterfall Dive rear (206 calls) remains for measurement/owner disposition. Actual hardware evidence and product-owner approval are required before T9.6 may close. The preview being online is NOT hardware certification.


## 8. Owner mobile playability and T9.6 engineering-target revision — 2026-10-08

Manny reported hundreds of real-device Neon Grid playtests without discernible performance problems and expressly approved revising the *additional Task 9 engineering budgets* to **220 maximum calls / 350,000 maximum visible triangles**. The PRD hard caps **250 / 750,000** and hardware 60 FPS median / 18.3ms p95 criteria remain unchanged. Historical T9.5 200 target / 220 blocker remains historical; the revised internal ceilings govern forward-looking T9.6 actual-race evidence and future Task 9 engineering analysis. Any above-target new capture still requires review.

**Screenshot-transcribed first mobile race (not raw JSON):** Samsung Galaxy Z Fold-family Android portrait, 1st-place finish 2:42.167, 9,559 scored / 9,679 eligible frames, 166 skipped, 120 warmup, median FPS 59.9, p95 frame 16.8ms, worst frame 216.8ms, six individual frames >50ms with longest consecutive run one, max draw calls 206, max triangles 317,908. Owner says gameplay is smooth in extensive repeated mobile driving. Counts fit new engineering targets (14 calls and 32,092 triangles headroom) and PRD scene-count limits; p95 is under 18.3ms, no sustained >50ms streak is visible, displayed median 59.9 remains marginally below literal 60. The screenshot cannot validate effective framebuffer size, full source SHA, shader/GPU identity or original per-frame series. **The user reported downloading and attaching the export, but the only available uploads were the screenshot and Switchback visual-study HTML; no JSON was present in conversation file inventory.** Do not claim exported capture was ingested or certify desktop hardware from this evidence.

**Outcome:** Owner mobile subjective playability ACCEPTED and T9.6 *scene-engineering count budgets* updated; actual representative-desktop PRD G-05 performance certification, complete raw-capture review and owner approval gate remain OPEN. No T9.7, no runtime PR #242 merge, no new visual/culling optimizations.
