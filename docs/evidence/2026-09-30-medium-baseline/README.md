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

## Published runtime/source verification

Canonical runtime: `4673aac5caae8c8b153526a74afb9d70cb24c15f`, tree `b5502b6f66ae19cdc36fba3031218a82aa5c2241`; remote fetch and local tree comparison passed against `59b7982`. Review PR: https://github.com/Manaconda33/manacondas-minigame-mayhem/pull/212. Full final validation: **85 files / 663 tests**, strict typecheck, zero-warning lint, all exact asset/branding checks and production build; LFS fsck/diff checks passed. The existing large-chunk build warning remains. `review.md` records the separate self-review and the fixed keyboard provenance interaction.

Browser blocker observed: the owner-private review origin offers “Continue with ChatGPT”; following it opens OpenAI’s “Welcome back” login form. This cloud browser has no signed-in owner session. No credentials were supplied/requested, no access protection changed, and no rendered-runtime smoke or capture result is claimed. Baseline hardware identity is independently unavailable. Owner can use the private review with their own ChatGPT sign-in and the capture procedure; unit/runtime wiring evidence is complete.

## Review deployment and CI

- [Diagnostic review](https://manaconda-race-diagnostics-review.manaconda2433.chatgpt.site/?testRacePerf=1) — owner-private, sign in with ChatGPT. Private deployment `appgdep_6abd911e64a481919913462fcdaa5e12` succeeded. Compiled snapshot source `962a08bc78db28bee0eb436c87bf898da991b7a2`, canonical runtime/source-tree stamp above, supplementary hashes/provenance at `/review-build.json`. Server accepted archive SHA-256 `b22fb1ec62cf409850aa4deb76a3a9e8010762d211dcc894595beb14e892ea59`.
- [Runtime PR CI](https://github.com/Manaconda33/manacondas-minigame-mayhem/actions/runs/36786989565) PASSED on `4673aac5caae8c8b153526a74afb9d70cb24c15f`: fresh LFS checkout/fsck, clean install, typecheck, lint, 85 files / 663 tests, exact asset gates and production build. Production deployment skipped for this PR.
- `publication.json`: exact source, archive, deployment, test and blocker facts. Delivery success is a backend deployment result; served private asset bytes and actual gameplay are not independently browser-verified behind the sign-in wall.

Stop here for Manny's runtime review and merge/production approval. Complete the identified-desktop capture with the linked method before claiming the broader Medium performance gate. Existing acceptance remains passed; no VFX/bloom/blur/next-slice work has begun.
