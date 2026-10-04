# SDD ledger — plan: docs/superpowers/plans/2026-10-02-neon-grid.md Task 7

## Authority and starting point

Manny authorized Task 7 implementation, full validation, and an isolated hash-verified Pages preview on 2026-10-04 (America/Chicago). All five design decisions in waterfall-dive-design.md are settled. Repository default main was 65eb80d6adf77ae6abfacda5b2ce621d1d4a7c04; approved design branch was b4de20a42d1ec81945340c24b45233ca1aafde08, recording owner acceptance of b942c91 Billboard preview. PR #242 remains draft/open/unmerged and is not changed by this work.

Ruling: implement on a fresh feature/neon-grid-waterfall-dive branch based on the requested design head — preserves the explicit instruction not to modify PR #242 — cost: later integration must reconcile this side branch.

Pre-flight: the main floor, shared gates, racer-local route ownership, native controller, recovery cleanup and Rocket route authority are shared interfaces. No shortcut may award gates. Main curve/checkpoint coordinates, repaired floor faces, accepted tunnel, billboard clock/retention/art/shape, physics and stats remain unchanged.

## Implementation

- New WaterfallDive defines native/render ramp and landing outside the exact existing main-road boundary, a physical lip, five-metre flight opening, pool bounds and before-gate-9 recovery position. The ~34m chord includes supported approaches and actual airborne gap; it is not claimed as 34m of unsupported flight.
- Existing KartController ramp impulse is reused. No changes to KartController, tuning, stats, items or the repaired climbing patch. Real dynamics determine speed/angle quality; no landing pose/velocity correction.
- DiveState is racer-owned. Forward mouth crossing selects the path, flight retains it, a genuine miss owns a 1.5 race-second wait, and recovery is consumed once. Completed attempts rearm when backing before the mouth. Pause freezes timers. Reversing out/reset/disposal do not grant gates.
- Runtime player and AI splash holds suppress ordinary recovery and input/steering; recovery uses existing cleanup with an explicit pre-gate-9 pose. Recovery frame cannot sweep checkpoints. Manual player recovery cannot bypass the splash wait.
- RacerTrack supports a separate seeded, configurable fifth constructor argument for dive attempts, default 0 until the later joint shortcut balance/rate review. Eligibility is based on usable approach heading/line and >=8m/s upstream; the earlier >=20m/s prototype rejected normal 12–15m/s bend approaches before acceleration. This is path feasibility, not final rate selection or physics tuning.
- Bounded procedural waterfall: 48 falling water instances, 16 mist instances, pool, native-parity ramp/landing, gold launch tell and landing marker. No new binary artwork, audio, tokens, Stage 4 course pass or external assets.

## RED → GREEN and review

Missing-feature test failure: red.txt. Real racer ownership/visual integration failures: integration-red.txt. Three-lap dive-route absence first failed eight dive cases: lap-first.txt; all sixteen native owner/profile combinations subsequently passed. Actual race splash wiring was independently RED against the unchanged KartTimeTrial and GREEN against implementation: runtime-red.txt. Low-speed miss fixture already passed the original classifier; low-speed-red.txt is historical passing coverage, not claimed as RED evidence.

Fresh independent review found two Important issues, no Critical/Minor findings: completed-attempt reverse/reentry lost ownership; repeated full-road raycasts caused existing coverage tests to hit the default 5s timeout. The reentry regression failed before correction (reentry-red.txt). Final fix pass rearms before a new attempt and replaces ~1600 raycasts with exact intersections against actual main-mesh single-use boundary edges. Native trajectory/lap assertions are unchanged. Final coverage validation must pass before publication.

## Evidence and limits

- repair-matrix.json: original 18-run residual matrix and raw native trajectories; must be regenerated on final source. Acceptance: zero air and max native loss <=1.83m/s outside intentional Dive.
- paired-trajectories.json: same-driver/start/heading/speed gate8→gate9 section pairs, actual native controllers/colliders. Five clean landings and one high-speed upstream miss in the first measurement; clean savings 2.07–2.83s. These are section measurements, not full-lap/pack balance or a universal safe speed/angle claim. Regenerate after final edge construction.
- Focused ramp-entry envelope: 24/30m/s straight and 26m/s ±6° land naturally; an angled edge attempt and actual native low-speed undershoot miss. An uncommitted slow coast can stop on the approach; that is not a launched miss.
- Eight-combination three-lap fixture uses production AiDriver inputs for both player-body (aa-09) and AI-body (aa-02) profiles. Actual race player/Rocket and player/AI recovery wiring is separately tested. No human/device steering, visual quality or frame-time acceptance is inferred.

Task 7 owner acceptance remains pending. Task 6 Step 4 timing/ON-OFF balance/final joint AI rates and production release remain gated. Stop after live preview delivery for owner retest.

## Final runtime gate

Final review: two Important findings fixed in one pass; no Critical or deferred Minor findings. Completed-attempt reentry regression RED→GREEN; exact-edge optimization passes unchanged native tests and default coverage timeout budgets. Full run found two additional support fixtures that identified the plaza by last collider: retain existing collider creation order by adding Dive support before the unchanged final plaza (collider-order-red.txt). Existing assertions are unchanged.

Final `npm run validate` PASS:124files/992tests with coverage, strict typecheck, ESLint0warnings, all build/runtime asset gates. `git diff --check` PASS. Existing build chunk-size advisory and npm proxy-config warning are tooling notices, not lint warnings. Main ribbon exact SHA256 remains3ac25d647b1c9953dd987594964cf3c404fee749f282691be20d34eb3c9eadc1. Final regenerated18-run matrix:0air, maxloss0.426449m/s (<=1.83). Final paired measurements:fiveclean savings2.0667–2.8333s; aa-09 upstream28m/s missed, once recovered, saving0.0667s. No safe-envelope/full-lap/balance/device acceptance inferred from those pairs.

Task7 engineering is verified; owner acceptance and delivery remain pending. No changes to final AI rates or Task6Step4.

Final fail-state check: undershoots fall to the actual pool (body center<=0.45m) before the1.5s wait; a bounded8-slot procedural splash ring announces a new miss once. Both checks were RED first (pool-red.txt, splash-red.txt) and GREEN in final992-test coverage validation. Actual race fixtures use the existing respawn1.2m body offset; no physics constant changed. Final matrix remains18runs/0air/maxloss0.426449; regenerated paired high-speed miss saving0.0667s.
