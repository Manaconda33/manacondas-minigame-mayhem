# Neon Grid rough-driving diagnosis — 2026-10-02

Owner report: nearly unplayable mobile stuttering/sticking/back-and-forth motion, misleading minimap, absent waterfall jump, placeholder appearance. Stage 2 main-route acceptance remains **FAIL**. This investigation changes no runtime, preview pin, hosting or product requirements.

Investigated preview: 52093b35aa6b44440c6ddb112c4de713b109a86d; documentation head c677b5292c68af6cc61b3a16d433b2e2b283ffe9. Runtime PR #242 stays draft/unmerged. Camera repair delivery remains verified; this owner report does not accept gameplay smoothness.

## 1. Confirmed CPU regression; strong candidate for frame stutter

An instrumented real eight-body race-loop comparison ran 1,800 simulation steps (30 simulated seconds) for each track, using the same player profile and mobile-style held-wheel input. Only external WebGL/assets/audio and presentation callbacks use the existing test boundaries. Real race simulation, AI, physics, projection and item/contact paths execute. Timings use process.hrtime.bigint; performance.now is mocked by the diagnostic fixture and must not be used for profiling.

| Local simulation measurement | Alpha | Neon |
| --- | ---: | ---: |
| Mean per physics step | 0.785 ms | 2.502 ms |
| Median | 0.560 ms | 2.196 ms |
| p95 | 1.692 ms | 3.890 ms |
| Projection calls over 1,800 steps | 80,096 | 76,940 |
| Total projection CPU | 161.840 ms | 2,866.541 ms |
| Total native physics CPU | 273.451 ms | 562.672 ms |

Neon takes 3.19× the mean CPU per step. Projection consumes 63.6% of its measured simulation duration despite fewer calls than Alpha; one Neon query is approximately 18.4× as expensive in this run. About 43 queries per step each scan all 384 segments: approximately one million segment evaluations per simulated second, before rendering. Callers repeatedly request racer positions for awareness, AI driving, progress, boundary checks and items. Neon performs full continuous 3D segment projection; Alpha uses simpler sampled distances.

The fixed-step runner may execute up to six physics steps for a slow frame, and visuals copy current body poses without render interpolation. Increased CPU cost can cause catch-up bursts and visible snapping. This is an inferred mechanism from measured cost and code, not a measured phone frame-time/GC/GPU diagnosis. GPU, browser DOM, actual device performance and full-race p95 remain unmeasured. Two tracks receive the same input but their routes/race outcomes differ; this is an instrumented workload comparison, not a paired same-course benchmark.

Recommended bounded repair: reuse per-racer pre-step/post-step projections within their valid phase; then reduce candidate-search cost with a spatial index or safe hinted search plus fallback. Preserve exact 3D/elevation-aware resolution, checkpoint authority, and future shortcut ownership. Do not replace Neon with Alpha's planar assumptions. Measure the eight-body production loop again and validate rendered mobile frame times.

## 2. Confirmed native collision jolts; collision authority needs reconciliation

A 9,000-step single-Archer probe ran the authored centerline AI steering under three collider modes. Conservative AI speed control produced zero scripted rail corrections, no road-support failures and no projection jumps. It therefore does not reproduce a systemic centerline road-hole problem.

A second probe kept the same steering controller but forced continuous acceleration and disabled its braking/speed management, stressing corners as a held mobile wheel can do. With both native wall meshes and scripted guardrails active, it issued 26 scripted corrections; the minimum speed after startup was 1.956 m/s. With native walls only, minimum speed was 13.815 m/s; with scripted rails only, 8.507 m/s. Trajectories diverge, so these are diagnostic comparisons rather than controlled balance numbers or proof that disabling walls is a valid fix.

At Falls Run progress 0.815434, position approximately (-172.379, 8.885, 33.263), horizontal velocity entering world.step is 30.778 m/s and leaves at 22.028 m/s (110.8→79.3 km/h in 1/60 second), with no braking input. The native-only run also loses 30.778→20.579 m/s around progress 0.815027. Those large drops disappear from the scripted-only run. The native contact occurs while the center-based guardrail query reports no penetration; the pre-step center lateral offset is approximately 4.656 m on a 6 m half-width road. The leading rotated kart footprint can legitimately touch a corner before its center violates the scripted radius, so this does **not yet prove an unintended wall triangle**.

The two collision authorities use different footprints and responses. Native triangle walls can redirect velocity sharply; scripted rail resolution can additionally teleport the body inward and apply speed retention/restitution. Combined behavior warrants rendered footprint/contact-normal inspection on the tight hairpins and climbing bend. Preserve the approved centerline/hairpins; repair collision shape/authority rather than silently widening, flattening or simplifying the course. No collision mode was disabled in production or the preview.

## 3. Confirmed minimap reflection relative to approved layout

The minimap consumes Neon samples; it is not loading Alpha's route. normalizeMinimapTrack uses screen Y proportional to maximumZ-z, making +Z move upward. The approved layout generator plots (x,z) then inverts the Y axis, making +Z move downward. These representations are reflected vertically relative to one another. The minimap also has no heading arrow, and its decorative frame includes a dashed curve unrelated to road geometry, adding ambiguity. Actual route markers use the same map normalization; a wrong-track or marker-transform defect is not established.

Recommended repair: define one explicit Neon map orientation matching the approved drawing and use it for road, markers and heading. Preserve accepted Alpha orientation unless separately approved. Verify actual clockwise/counterclockwise turns and start/finish locations against the drawing and in-race minimap.

## 4. Waterfall jump and visuals are absent by stage scope

The current Stage 2 blockout intentionally has a continuous main-road ribbon and temporary sector colors, walls, posts and boost pads. No Dive gap/landing/miss behavior, waterfall scene, service tunnel, billboard shortcut, new route music or final city dressing has been implemented. These are later Stage 3+ tasks. Tokens remain excluded. Their absence is not evidence of a missing deployed asset; the runtime feature itself does not exist yet.

The main route needs smooth playable acceptance before adding those features. Stage 3 remains gated. Do not mistake 837 automated tests or independent AI lap completion for owner mobile/performance/visual acceptance.

## Reproduction and evidence limits

Raw data: diagnosis-cpu.json, diagnosis-conservative-collision.json, diagnosis-full-throttle-collision.json. Runtime profiler snippet: diagnostic-runtime-probe.txt (append temporarily to tests/race-diagnostics-routing.test.ts and run vitest with -t DIAGNOSTIC). Collision probe: diagnostic-collision-probe.txt (copy temporarily to tests/neon-diagnostic-probe.test.ts). Remove the continuous-throttle override to reproduce conservative mode. Temporary probes were removed from active tests after investigation. Both diagnostic test runs passed; no full-suite rerun is claimed for a documentation-only diagnosis. The prior validated runtime remains unchanged.

Next: bounded CPU/projection repair, collision reconciliation and minimap orientation correction, with a smooth-driving preview and real mobile validation. Final scenery and waterfall shortcut follow only after that gate.
