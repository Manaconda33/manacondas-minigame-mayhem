# Player drift visual review checkpoint — 2026-09-30

## Authority and scope

Manny approved moving from the accepted kart optimization to the first bounded driving visual increment, then approved this drift design. Base main: `31e53e0f1f35737da99d8b9801f1e2915836299a`; accepted optimization runtime: `99bcebe0d28c9c35bdcb8285221726a3e18eccf1`. Main remained unchanged during implementation. Main CI/Pages 36793566371 was successful.

Existing player drift feedback drives short blue rear-wheel sparks, denser orange sparks with rising flame flickers, a purple charge burst, and a purple boost-release exhaust pulse. Existing wheel glow and drift tones remain. One world-space InstancedMesh uses preallocated capacities Low 48 / Medium 96 / High 144; it adds one color-pass submission while particles are visible, without shadow submissions. This is a component bound, not certification of the global 2,500-particle budget. AI drift visuals are outside this first player increment; the complete PRD driving-effects requirement remains open.

No physics, boost timing, input, camera behavior, HUD, Results, audio assets, roster assets, or accepted gameplay were intentionally changed. No dust, speed/FOV effects, bloom, blur, post-processing, or next slice began. Runtime merge and public production publication require new owner approval after review.

## Implementation and lifecycle

The effect reads KartFeedback without writing controller state. Its own random generator isolates emissions from gameplay RNG. Rear-wheel anchors are transformed through the player kart world matrix; trails remain in world space. Tier/release transitions emit once, emission stops airborne, paused/hidden time freezes, and spinout/non-racing/recovery clears particles. Owned geometry/material dispose once. Instance colors are allocated before the shader is compiled during race startup, to move first-use compilation outside driving. Startup compile cost and actual GPU/device behavior are not measured by Node tests.

## Evidence and author self-review

- `red.txt`: new module absent before implementation.
- `routing-red.txt`: missing runtime effect integration.
- `fixture-compatibility-red.txt`: seven failures in old constructor-bypassing runtime fixtures; fixtures now construct and dispose the real visual resource.
- `prewarm-red.txt`: missing preallocated color layout/startup compile.
- `pulse-spread-red.txt`: exhaust spread biased to one side; own-RNG bilateral spread fixed.
- `lint-red.txt`: unnecessary fallback in the new matrix assertion; removed.
- `green.txt`: focused effect, real runtime routing and settings tests.
- Final full validation: PASS, **87 files / 693 tests**, 88.11% statements / 79.51% branches / 89.78% functions / 90.42% lines. Existing Vite large-chunk warning remains.
- `validation.txt`: final complete typecheck, zero-warning lint, coverage suite, asset/branding gates and production build.

Author separately inspected the final runtime diff for authority writes, anchored orientation, transition behavior, pause/hidden/recovery/Results handling, disposal, bounded resource usage, shader layout, and scope. This is an author self-review, not an independent agent review. Tests use actual Three geometry/instance buffers and the real KartTimeTrial routing with an external WebGL renderer fake; they do not certify rendered appearance or GPU speed. The full prior regression suite remains required. `git diff --check` and `git lfs fsck` pass; no binary assets changed.

## Owner runtime review (pending)

Use the private review build on Medium. Drive through blue → orange → purple, release the purple boost, and inspect both chase/rear cameras. Confirm visible trails stay behind both rear wheels, orange remains distinguishable, purple burst/release reads clearly, track/HUD remain readable, and controls, boost timing and existing audio feel unchanged. Exercise pause/resume, recovery, race completion/Results, and restart. Preserve all existing manual acceptance; this new presentation still needs owner acceptance.

Complete one normal full race with `?testRacePerf=1`; compare with the accepted owner mobile optimization summary (226 max calls, 59.9 median FPS, 16.8 ms p95, 233.5 ms max, 3 frames >50 ms). That earlier race had a different grid/player and no verified raw JSON, so it is context rather than an identical controlled run. Manny's mobile substitution stands; do not require another desktop baseline. Do not assert a full PRD performance pass from tests or the earlier mobile screenshot.
