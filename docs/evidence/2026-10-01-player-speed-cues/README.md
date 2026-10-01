# Player speed cues — 2026-10-01

## Status and authority

**REVIEW ONLY.** Manny approved the bounded proposal on 2026-10-01 with “Approved”: smooth player FOV expansion from 62° toward 68° at high speed; faint peripheral speed lines; bounded quality budgets and pause/recovery/finish/disposal handling. This is a bounded PRD 22.1/23.5 increment inside active Slice 6, not complete speed/boost polish or Slice 6 closure. Base main `5dd81ebe5a6890289c76dbfecd57ee12ce5f96ac` and CI/Pages `36866177416` were verified. All acceptance through PRs #212–218 remains closed. September 30's pending AI/dust proposal is superseded by the accepted October 1 release.

## Implementation bounds

- Read-only signed forward planar speed divided by the selected kart's unboosted normal top speed drives the effect. Reverse/lateral travel does not trigger it. An eased 70–100% speed band and exponential smoothing drive FOV 62–68°. Only the projection changes; chase/rear/mobile camera anchors, distances, intro, spinout authority and controls remain intact.
- One clip-space instanced batch of crisp pale-blue strokes: Low/Medium/High allocate 6/10/14, with at most one visible main-pass submission and no shadow submission. Alpha never exceeds 0.15. All stroke vertices stay outside ±0.77 horizontal NDC and within ±0.78 vertical NDC; strokes use a narrower actual vertical span to avoid top/bottom controls. The central road/kart region is clear. These structural bounds do not constitute rendered HUD/legibility approval.
- No textures, post-processing, bloom, blur, additional exhaust, new assets/dependencies or gameplay RNG draws. Existing player/AI drift/dust and accepted item/exhaust identity remain intact. Existing next-race quality application is unchanged.
- Pause/hidden frames freeze the speed visual; countdown/finish/spinout disable and reset it. Recovery resets immediately. Owned instance buffers, geometry and material dispose once. The shader layout warms at race creation.

## Verification

Baseline full suite passed 89 files / 711 tests. `routing-red.txt` retains the expected absent-effect failure. `unit-red.txt` records the absent new module. Focused `green.txt` passed the initial 30 checks. The first full validation found seven recovery-test failures because older prototype-based fixtures omitted the newly owned visual; `fixture-red.txt` retains those failures. The fixtures now create/dispose the real visual. A later added spinout test initially used an invalid spec; correcting that test fixture did not change production behavior.

Final validation: 90 files / 720 tests; strict typecheck, zero-warning lint, exact SFX/music/runtime asset gates and production build passed; diff check and LFS fsck passed. Existing npm environment and Vite chunk-size warnings remain. See `validation.txt` and `build-final.txt`. A native bundler run emitted “fatal library error, lookup self” after asset verification (`bundler-transient.txt`); after stopping test servers, the fresh production build completed and emitted both expected bundles. No source change was needed for that environment failure. Independent review found no Critical/Important production findings; its Minor rendered-review gap remains explicit in `code-review.md`.

No framebuffer/device/performance or owner visual pass is claimed. Local Chromium installation failed because the downloadable archive was truncated. The supervised internal preview started, but the cloud browser rejected its URL with `net::ERR_BLOCKED_BY_CLIENT`. Private snapshot deployment is delivery evidence, not rendered acceptance.

## Owner review

Use the private playable preview recorded in `provenance.json`. Drive from low to full speed: the projection should widen gradually and the side strokes remain faint. Slow down and check the fade. Check chase/rear on desktop and mobile portrait/landscape, especially road direction and HUD clarity. Pause/resume, recovery and finish should not leave stale cues. Only the new speed cues require review; accepted drift/dust/audio/Task 10/11 gates are not reopened.

Owner new-effect visual acceptance and separate merge/public production approval remain pending. Main/public production remain unchanged. Broader hardware/global budgets, browser matrix, release gates, bloom/blur and later slices remain outside this checkpoint.
