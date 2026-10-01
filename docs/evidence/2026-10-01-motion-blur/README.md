# Bounded race motion blur — 2026-10-01

Status: **Owner visual acceptance PASSED; production merge/publication AUTHORIZED; production verification pending.**

## Authority and baseline

Manny approved the scope with “Scope approved.” after repository catch-up at `b07c5b1ba054f0d4af999b72caf59ee13568ca01`, then approved the published pinned preview for merge/publication to main. PRD 23.7 / 35.7 govern the requirement. No material PRD change, next-slice authority, production publication, or reopening of accepted gameplay, Archer, bloom, HUD/Results, audio or Task 10/11 is inferred. Context-loss recovery remains waived.

## Implementation

- Low, explicit Off, and reduced-motion preference bypass blur with no blur textures.
- Medium uses 3 current-frame samples and 0.22 maximum blend; High uses 5 samples and 0.32 maximum blend. Sampling length follows speed intensity independently from opacity.
- Copy only the left/right 20% framebuffer bands between 20–80% height, after the accepted bloom render. The central 60% width and upper/lower 20% remain unchanged; DOM HUD/touch controls are outside the canvas processing. No temporal history, velocity buffer, scene rerender or gameplay writes.
- Maximum input dimensions 4096 per axis / 8,388,608 pixels; larger buffers disable blur. At 1920×1080 the two RGBA textures total 1,990,656 bytes; when drawn, two copies and one fullscreen-triangle overlay are added. Renderer counters retain all passes.
- Use read-only signed forward speed normalized to selected kart tuning; smooth activation over 70–100% normal top speed. Slow/reverse movement fades to zero.
- Rear view, spinout, countdown, Results and recovery clear blur; pause/hidden freeze intensity and draw nothing. Restart/disposal release owned resources once. Init/resize warm shader/textures before speed activation.
- After 60 active valid warmup frames, disable blur for the race after 12 consecutive slow frames or a 30-frame rolling mean above 17.67ms. Timing excludes pause/visibility/eligibility boundaries and runs without diagnostics. This conservative guard is not device performance certification or a claim of timing attribution.
- Settings persist a boolean `graphics.motionBlur` within the existing v1 payload and retain audio/quality choices. Old payloads default On; selecting Low or reduced motion still bypasses it. Settings apply to the next race. `?testMotionBlur=0` supports same-quality comparison without changing saved settings.

## Verification

- Full `npm run validate`: strict typecheck, zero-warning lint, **98 test files / 764 tests**, coverage and production build passed.
- All approved SFX/music/art/model/branding gates passed; `git lfs fsck` and `git diff --check` passed. No binary, lockfile or dependency changes.
- Tests observed failures for absent settings/UI, recurring dropped-frame fallback and inactive-budget scoring before their fixes. Missing renderer module was initially a module-resolution failure, not a behavioral red; do not misreport it as one. Integration tests exercise actual KartTimeTrial RAF speed, pause/rear view/recovery/Results and ordinary-play budget without diagnostics.
- Existing item-runtime rigs omit GPU startup; their Low-tier blur owner is real and needs no GPU resources. All previous item recovery assertions remain intact.
- `browser-pixels.json`: actual production shader on Chromium 153.0.8010.0 / software WebGL, in landscape 800×600 and portrait 375×667. Low changed no pixels; Medium/High changed peripheral pixels only, with zero changes to protected regions and no WebGL errors. High produces stronger differences. This synthetic pattern check is not a gameplay/device performance pass.
- Local browser UI independently persisted Off when changing quality to High. Archer page two and an eight-racer countdown rendered with no page/console errors. Software renderer observed around 10 FPS; countdown-only screenshot does not certify driving or new-effect appearance. Existing Three PCFSoftShadowMap warning and Vite large-chunk warning remain nonblocking.
- Independent read-only code review: no unresolved Critical/Important findings after rolling-budget, independent lifecycle-boundary, radius and startup-warmup fixes.

## Rendered verification reproduction

Keep optional browser tooling outside game dependencies. The verified environment used Playwright Core 1.63.0 and Chromium 153.0.8010.0 with SwiftShader. Provide paths to Playwright's `index.mjs` and the Chromium executable:

```bash
MOTION_BLUR_PLAYWRIGHT_PATH=/absolute/path/playwright-core/index.mjs \
MOTION_BLUR_CHROMIUM_PATH=/absolute/path/chromium \
node tools/verify-motion-blur-browser.mjs
```

The runner starts Vite in its own process network context, runs pixel assertions against the real shader and writes the JSON evidence. Initial agent-browser daemon startup and standard Chrome downloads were unavailable in this Work environment; optional npm-packaged Chromium plus Playwright supplied the rendered check. No browser-download workaround enters the game dependency set.

## Review/publication gates

1. Feature PR CI must pass.
2. Preview infrastructure PR #232 merged at `e933e35717cade97062a9d7e18ffba40a0ec0287`; post-merge CI/Pages run `36921241484` passed the pinned preview build, artifact assembly and deployment.
3. Manny completed the gameplay visual review and approved the effect for merge/publication to main.
4. Reconcile PR #231 with current main while keeping the reviewed runtime blobs unchanged, then require fresh hosted PR CI.
5. Merge/publish only after that reconciliation passes, then require post-merge production CI/Pages verification.

Broader full-race Medium/baseline-hardware performance, browser matrix and final release evidence remain open. No unrelated optimization or new slice is authorized.
