# R2.10 — Browser/WebGL2 compatibility evidence

**Date:** 2026-10-25 UTC
**Disposition:** PARTIAL
**Production source:** `21dc90bbaf1939190b152cddc722235e1bb97b77`
**Deployment:** GitHub Pages deployment `7307818501`, success; main CI/Pages run [`40155455583`](https://github.com/Manaconda33/manacondas-minigame-mayhem/actions/runs/40155455583); trusted-runtime run [`40155455508`](https://github.com/Manaconda33/manacondas-minigame-mayhem/actions/runs/40155455508).
**Live URL:** <https://manaconda33.github.io/manacondas-minigame-mayhem/>

This checkpoint records focused startup compatibility evidence only. It does not certify G-05, representative physical-device performance, complete browser compatibility, or formal v1 acceptance.

## Baseline and deployment verification

GitHub reports `main` at `21dc90bbaf1939190b152cddc722235e1bb97b77`, the squash merge of PR #341 at reviewed head `271331cbb1cb798292a51dda03fa99b4b072ded6`. Deployment `7307818501` reports success at the production URL. Main CI/Pages run `40155455583` passed `validate`, `assemble`, exact-byte preservation verification, the retained preview builds, Pages artifact upload/deploy, and live preservation checks. Trusted pinned-runtime run `40155455508` passed Far300, Dive, Abyss Fog 004, and Billboard. The deployed root returned HTTP 200. No existing preview path or production asset was removed.

## Environment and method

- Browser actually available: **Chromium 151.0.7922.173**, headless; this is not branded Google Chrome and is not counted as a Chrome-product pass.
- OS: **Debian GNU/Linux 13 (trixie), x86_64**; kernel `6.18.55`.
- WebGL renderer: `ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero) (0x0000C0DE)), SwiftShader driver)` — software rendering.
- WebGL2 context: available; version string `WebGL 2.0 (OpenGL ES 3.0 Chromium)`.
- WebGPU condition: launched with `--disable-features=WebGPU`; `navigator.gpu` remained defined, but `navigator.gpu.requestAdapter()` returned `null`. Thus no WebGPU adapter was available while WebGL2 worked.
- Both track checks used a fresh page at the deployed HTTPS URL with `?testRacePerf=1`, followed by Title → Hub → explicit track choice → driver confirmation. They verified the rendered race canvas, WebGL2 context, race HUD/countdown, diagnostic source stamp and startup snapshot; no full race was replayed.
- HTTPS was accessed through the managed execution environment's HTTPS inspection proxy using its designated CA in a temporary browser profile. Certificate validation remained enabled. This is useful browser smoke evidence, but it is not a direct observation of an unproxied public network path.

## Browser matrix

| Browser | Environment | Title/Hub and track selection | Circuit Alpha WebGL2 race startup | Neon Grid WebGL2 race startup | Console/network | Result |
|---|---|---|---|---|---|---|
| Chromium 151.0.7922.173 | Debian 13 x86_64, headless, SwiftShader | PASS | PASS — rendered scene, HUD and countdown | PASS — rendered scene, HUD and countdown | No console/page errors or HTTP 4xx/5xx; see cancellation note below | PASS for this Chromium software-rendering smoke only |
| Google Chrome | Not installed/available | — | — | — | — | UNMEASURED |
| Microsoft Edge | Not installed/available; Chromium is not substituted | — | — | — | — | UNMEASURED |
| Firefox | Not installed/available | — | — | — | — | UNMEASURED |
| Desktop Safari | Not available on this Linux environment; Playwright WebKit was not substituted | — | — | — | — | UNMEASURED |

Chromium had `navigator.gpu` but could not obtain an adapter under the test launch flag, while both tracks initialized WebGL2. This satisfies the focused “WebGPU unavailable” check for this environment; it does not establish WebGPU behavior on supported hardware.

## Track and diagnostic results

**Circuit Alpha** — The no-query production smoke reached the Title, Hub, default Circuit Alpha selection path, and race HUD; diagnostics were absent. Its R2.9 source-pinned diagnostic export at 2026-10-25 03:10:05 UTC reports commit `21dc90bbaf1939190b152cddc722235e1bb97b77`, Medium quality, 1280×720, eight racers, and SwiftShader. `initializationScene` captured the first-render counters at 149 calls / 111,319 triangles with 7 AI assets pending. `assetSettledScene` captured 190 calls / 298,279 triangles after all seven loaded, with no fallback and zero pending. The short incomplete race recorded 14 scored and eligible samples, 32 skipped frames, and no truncation. Its summary maxima were 265 calls / 387,115 triangles. Software-rendered frame timing is not representative performance evidence and does not pass G-05.

**Neon Grid** — The source-pinned startup export at 2026-10-25 03:25:07 UTC reports the same deployed commit, Medium quality, 1280×720, and SwiftShader. Both the first-render and asset-settled snapshots were captured at 209 calls / 302,027 triangles; seven of seven AI assets were loaded, zero fallback, zero pending. This was a startup-only capture with zero active-race samples. It confirms scene initialization and WebGL2 context creation, not a completed race or physical-device performance.

In the separate Neon Grid export run, one request for `assets/audio/music-v2/03-route-night-title-hub-loop.wav` ended as `net::ERR_ABORTED` during the Hub-to-race transition. It had no HTTP error response. The other track smoke had no failed requests; neither run had a console/page error or HTTP 4xx/5xx. The canceled request is recorded rather than counted as a missing asset.

## Evidence files and hashes

- `captures/circuit-alpha-r2-9-post-deployment.json` — 14 active-race samples and both AI-readiness snapshots; SHA-256 `733a5e11bbc3d626e0216015d26c5830e44ada0383801a526582d92136549228`.
- `captures/neon-grid-webgl2-startup.json` — WebGL2 and startup snapshots for Neon Grid; SHA-256 `b094c18d286ef1ee4241799988e8bec5434a2b451bb54e51e6f9a1c9bdf1ea86`.
- `SHA256SUMS` records both capture hashes.

The machine-readable exports contain the source stamp, renderer metadata, scene counters, AI asset outcomes and (for Circuit Alpha) active-race samples. They are short automated smoke captures, not physical-device or full-race evidence.

## Outstanding evidence and next action

Compatibility remains PARTIAL because Chrome, Edge, Firefox and desktop Safari were unavailable. Run the same focused Title/Hub → track selection → race startup check in each genuinely available supported browser on a representative desktop, record browser/OS/WebGL2 renderer, WebGPU condition, console and network outcomes for both tracks, and retain the exports or a concise result log. Do not substitute Chromium for Chrome/Edge or Playwright WebKit for desktop Safari.

The next G-05 evidence remains one representative physical-desktop Medium-quality WebGL2 Circuit Alpha three-lap capture at an actual 1920×1080 drawing buffer with eight racers. The software-rendered 1280×720 samples above cannot satisfy it. Prior owner gameplay and visual acceptance remains valid; no broad gameplay retest is requested. Formal v1 acceptance remains pending the item-by-item original PRD §37 closure record and other requirements in the R2 checklist.

No compatibility defect was observed in the available Chromium environment, so no runtime correction is proposed. This report and the status update are a proposed documentation checkpoint only; no merge or deployment is included.
