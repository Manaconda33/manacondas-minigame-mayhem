# Medium baseline evidence index

Current baseline measurement: **PENDING**. This is not a whole-race Medium pass.

Source of implementation: review/slice6-full-race-diagnostics; startup main b18d8dda2c97812b310dc321498609ee1f5a0436. PRD v1.1/amendments through 2.22; active Slice 6. Main CI/Pages 36784593002 passed. Review source SHA/URL and browser evidence are recorded below as publication completes.

## Evidence available

- `progress.md`: native execution ledger and review decisions.
- `task1-red.txt`, `task1-green.txt`: missing-feature RED, primitive tests, initial checks. The initial Task 1 lint found four test callback-style errors; corrected during Task 2 and covered by final full validation (the initial checkpoint is not a passed lint milestone).
- Task 2 RED/GREEN and full validation logs: saved at the runtime checkpoint.
- These tests cover statistics, bounds, exact flag parsing, raw RAF integration/simulation clamp, post-render counter order, pause/tab boundaries, Results export, disposal, and asynchronous stale-race startup. Fake-renderer JSDOM runs are integration evidence only.

## Required actual baseline

Identified physical baseline desktop, browser/OS/version, Medium, normal eight-racer three-lap race, approved audio, complete nontruncated export, actual 1920×1080 drawing buffer for every scored sample. Follow `docs/SLICE-6-MEDIUM-PERFORMANCE-METHODOLOGY.md`.

No access to Manny's identified baseline desktop is available in this session. A cloud/headless or virtual/software-rendered browser is not evidence for that hardware gate. Browser smoke checks may be recorded separately; no device identity, complete race, GPU value or whole-race performance pass is inferred. Until a valid primary JSON is supplied, median FPS/p95/max/long-run/render-budget results for the specified desktop remain pending. GPU/texture-byte metrics are unavailable; heap support is feature-detected; shadow/particle budget measurements are still pending.

## Review checklist

- Normal URL: accepted ordinary gameplay/HUD/Results/audio preserved; no diagnostic panel.
- `?testRacePerf=1`: panel and counts appear; Download Capture produces schema 1 JSON.
- Pause/resume/tab return preserve scored samples and exclude transition gaps; restart starts a fresh window.
- Finish and export before navigation. Enter hardware details and retain original JSON for baseline review.
- Runtime merge/production approval is still required. No next graphics increment or slice is authorized.
