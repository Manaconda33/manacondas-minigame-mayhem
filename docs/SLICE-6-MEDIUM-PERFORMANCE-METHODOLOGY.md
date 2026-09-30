# Whole-race Medium capture methodology

> **2026-09-30 owner scope update:** Manny selected the supplied mobile race result to replace the desktop Medium baseline requirement for this checkpoint. Baseline summary is recorded from the screenshot; the raw JSON attachment is unavailable/unverified. No further desktop capture is required for this checkpoint. See `docs/evidence/2026-09-30-medium-baseline/mobile-baseline.md` for metrics, provenance limits and target comparisons. Earlier desktop/pending instructions below describe the superseded capture scope. This does not assert measured desktop performance, a full PRD performance pass, or runtime merge/production approval.


Scope: PRD v1.1/amendments through 2.22, G-05, 2.6, 30, 35.7, 36.5. This instrumentation does not change targets or close Slice 6.

## Reproduce

1. Use the diagnostics review build with only `?testRacePerf=1`. Identify desktop hardware (CPU, GPU, RAM), OS, browser/version, display refresh rate and power mode. Keep the same conditions for later comparison. Enter hardware/OS/browser details in the panel; user agent alone is insufficient hardware provenance.
2. In Settings choose **Medium**, then begin a new ordinary Circuit Alpha race. Retain the normal player plus seven AI racers, three laps, ordinary items and approved music/SFX. No forced-item fixtures or injected race completion for the primary baseline.
3. Set the actual canvas drawing buffer to **1920 × 1080**, not just browser outer dimensions. Medium caps DPR at 1.5: for effective DPR 1.5, an unobstructed 1280 × 720 CSS race canvas produces 1920 × 1080. At DPR 1, use 1920 × 1080 CSS. Verify the `samples[].counters.width/height/pixelRatio` values in an initial diagnostic export; adjust and restart before the primary capture. The panel is collapsed by default; close it while driving.
4. Drive the entire race to authoritative Results. Export before Race Again, Change Driver or Hub: those actions dispose the old race and its capture. For the primary baseline avoid pause/tab switches; validate those separately. Preserve the original JSON unchanged and record the source SHA, build URL, date, device, scenario and limitations in the evidence index.
5. Verify `raceCompleted: true`, `summary.truncated: false`, adequate scored race coverage, quality `medium`, racer count 8, correct source SHA, identified hardware, and drawing-buffer dimensions throughout the scored window. A short, unfinished, truncated, resized, fixture or provenance-incomplete capture cannot establish the whole-race gate.

For local reproducibility: `npm ci`, `git lfs pull`, `git lfs fsck`, `VITE_SOURCE_COMMIT=$(git rev-parse HEAD) npm run build`, then serve the built output at its configured base. The private review is built with the same stamp and `--base /`. Without a build stamp sourceCommit is null; pair raw data with independently verified build provenance rather than guessing a SHA.

## Exact policies and interpretation

- Raw RAF timestamp differences drive sampling. Simulation and the existing HUD still use the unchanged 0.1-second delta clamp. No capped HUD or subsystem-only item measurement substitutes for this capture.
- Exclude countdown, paused, hidden, invalid/nonpositive durations, and first intervals at capture/eligibility transitions. Rapid pause/visibility changes between RAFs also mark boundaries. Warmup excludes the first 120 eligible frames once per race, not once per resume. No valid pre-pause samples are erased. Finish freezes the original scored window, which stays exportable at Results.
- Maximum 36,000 scored samples. On reaching the bound, mark truncation and stop adding, retaining the original window. This is a memory bound, not a new PRD duration target. Exported metadata, summary, samples and counters are independent copies.
- p95 uses nearest rank (`ceil(n*0.95)-1` on ascending durations). Median is the middle value or mean of the two center values. Median FPS is the median of individual `1000/rawFrameMs` values. It is not `1000/medianFrameMs` in the even case. Empty statistics are null.
- Report median FPS, p95 and maximum raw interval, number of intervals >50 ms, longest consecutive >50 ms run, and scored duration/count. Excluded intervals split runs. Compare to median FPS >=60 and p95 <=18.3 ms. Report >50 ms sequences; do not invent a sustained-duration pass criterion.
- Read Three.js `renderer.info` only after its existing render call. Draw calls/triangles are the renderer-reported frame totals, not additive counts across frames. Compare maxima to 250 / 750,000 targets. Geometry and texture fields are resource **object counts**, not bytes or dynamic-shadow-object counts. Sampling does not modify Three.js reset behavior or traverse the scene.
- GPU time and estimated texture bytes are null/unavailable. GPU <=12 ms is preferred where independently measurable; CPU submission/RAF time is not GPU duration. Feature-detected `performance.memory.usedJSHeapSize` is a nonstandard whole-page export-time estimate, with support/method notes; unsupported heap stays null. Dynamic-shadow-object <=12 and gameplay-particle <=2,500 evidence remain pending. Never substitute mesh/submesh counts.
- Opt-in instrumentation adds sample copies, counter reads and once-per-second exact summary sorting/UI updates. Note this overhead in comparisons; the disabled route creates no per-frame diagnostic observation/counter payload and no panel/listener.
- No automatic acceptance label is exported. Raw diagnostic data supports review; PRD acceptance requires actual conditions, provenance and owner review. Existing Task 10/11, restart, desktop/mobile flow, HUD/Results and listening approvals remain passed.

## Diagnostic verification, separate from primary baseline

Check enabled/disabled flags, a >100 ms observed stall, pause/resume and tab return exclusions, Results export, Race Again new empty window, Change Driver/Hub disposal, stale-callback rejection, JSON schema and object-URL cleanup. Unit/runtime wiring tests can exercise these without proving rendered hardware performance. Do not manufacture a stall inside the primary baseline or infer actual FPS from JSDOM.

No VFX, bloom, blur, quality downgrade, resource repair, audio derivative, PRD change or next slice is included. Runtime merge/production publication remains Manny's separate gate.
