# Neon Grid approved main-route repair — 2026-10-03

Owner authorization: reduce projection cost, reconcile harsh/conflicting wall response, and correct map orientation. Runtime PR #242 remains draft/unmerged. No production release, tokens, shortcuts, scenery or new audio. Smooth mobile driving remains **OWNER RETEST PENDING**, not an automated acceptance claim.

## Repository catch-up

Fresh GitHub clone at runtime 08bb4f9125f09b05a3e2d36933a0b9bc85ae371d; default main ab2f0c1fdfa213d66083d982f3f593c376a4bac9. Read AGENTS, PRD v1.1/amendments, status, decisions, testing, avatar/roster/LFS contracts, README, Neon spec/contract/layout/plan/progress/diagnosis and saved design references. Main Pages run 37090970443 and runtime diagnosis CI 37092635949 succeeded. Only relevant open PR was draft #242; preview-only #245 was merged. Live preview HTML/entry references resolved; camera runtime pin was 52093b35aa6b44440c6ddb112c4de713b109a86d. Captured production HTML/entry/kart/CSS hashes before publication. Reconciled main's workflow-only pin change into runtime; no production source change is being merged.

## Projection repair

A static 3D segment bounding-volume tree prunes distant segments with exact AABB lower bounds; nearest selection keeps the original continuous segment fraction and lower-index tie rule. Tangent, horizontal lateral distance, elevation and surface rules stay unchanged. A bounded 64-entry exact-coordinate cache avoids redoing the same position query from AI awareness, driving, progress, items, rails and presentation. Coordinate changes after physics, barrier correction, recovery or elevation movement miss the cache; returned vectors are defensive copies. No rounded keys or previous-progress locality assumption. Static topology is built per track instance; future shortcut/path or topology changes must retain their own ownership and reconstruct/invalidate the index/cache as appropriate.

Regression evidence: new cost/reuse tests failed before the fix (390 squared-distance calls, duplicate tangent computation). After repair, the nearby query uses fewer than 40 distance checks; exhaustive-reference equivalence passes for 768 varied positions, far-off-road points, movement, height changes and recovery. Cached caller mutation cannot corrupt later results.

## Controlled simulation CPU comparison

Three trials per circuit, seeded RNG 404 reset for each trial/circuit, 1,800 real eight-body physics/race steps each, Archer player, held mobile wheel with the same sinusoidal steering. Before: original Neon projection and collider builders from 08bb4f9. After: repaired builders. No concurrent benchmark or full validation workload. Existing fixture replaces WebGL/assets/audio/presentation callbacks; real simulation/AI/items/contact paths execute. Timings use process.hrtime.bigint because the fixture mocks performance.now. Figures below average the three trial means or p95 values, not a pooled quantile.

| Metric | Before | After |
| --- | ---: | ---: |
| Alpha mean step | 0.590 ms | 0.608 ms |
| Neon mean step | 2.428 ms | 1.178 ms |
| Neon per-trial p95 average | 3.447 ms | 2.753 ms |
| Neon projection CPU / 1,800 steps | 3,072.946 ms | 240.530 ms |
| Alpha projection CPU / 1,800 steps | 139.015 ms | 137.836 ms |

Neon mean step falls 51.5%; projection CPU falls 92.2%. Neon remains approximately 1.94× Alpha's simulation mean. Raw trials include transient host/JIT/GC variance; item paths and trajectories can diverge after collision repair. This is desktop process CPU evidence, **not phone GPU/frame-time, whole-frame p95 or a smooth-driving pass**. Original unseeded exploratory comparison was 2.586→0.857 ms and is superseded by these controlled trials.

## Collision diagnosis and repair

The reported Falls Run pose genuinely touches the physical outer wall: the leading cuboid corner projects to lateral offset 6.001884 m on the 6 m road (footprint-before.json). Native wall contact has a horizontal normal near (0.625,0,0.781), consistent with the bend. The large impulse is not evidence of a stray interior wall face. Native rectangular-footprint wall response and the later 1.15 m radius-based scripted barrier use different footprints/impulses; Neon added that second authority although Alpha uses scripted kart boundaries.

Neon now retains the native elevated road ribbon/internal-edge correction and uses the existing shared scripted guardrail as the single kart wall-response authority. Visible walls, authored centerline/hairpins, widths, support surface, kart body, controls, suspension, tuning and Alpha behavior are unchanged. Shared impact retention 0.82, restitution 0.22 and runtime 0.24 s cooldown remain unchanged. Native wall meshes are not installed as extra kart barriers; kart-to-kart native physics remains active. This intentionally adopts Alpha's accepted circular barrier envelope, rather than preserving Neon's extra rectangular corner impulse. Future tunnel/shortcut geometry must explicitly agree with this authority instead of restoring two kart impulses.

A fixed-pose real-Rapier regression failed before with 22.031 m/s and passes after at >30 m/s before scripted boundary resolution. Both-side real-body containment tests cover skyline, alley, Falls straight, climbing bend and elevated climb: bounded inward response, no road-support loss, no repeated impact storm. Existing eight roster-profile three-lap gate-order tests retain the production collision path.

A controlled 9,000-step (150 s) forced-throttle Archer steering probe applies the production +0.02 m correction and 0.24 s retention cooldown in both versions. Both before and after have zero backward movement samples, zero support failures and zero post-correction boundary excess. Native >1 m/s uncommanded drops fall 1→0; the before event is 30.778→19.725 m/s at progress 0.814921. Ten scripted contacts occur in each run; maximum correction is 0.0617→0.0670 m. The after trajectory still has legitimate hard scripted impacts: worst scripted loss increases 6.758→13.977 m/s and minimum speed decreases 9.256→6.977 m/s. **No universal collision-speed improvement is claimed.** Native-only/arcade-only modes are diagnostic controls, not alternate approved runtimes; after repair native-only deliberately lacks wall containment and leaves the road. The combined repaired mode contains the racer. Conservative, commanded-speed multi-lap driving and owner device review remain distinct from this deliberately overdriven corner stress.

## Minimap

Neon explicitly selects positive-Z-down to match the approved dimensional drawing and clockwise top-straight/right-descent flow. Alpha's positive-Z-up default is preserved. The race consumes the oriented sample array for both road SVG and every progress marker. Utility and real-race wiring regressions failed on the mirrored version; eight rendered DOM portrait transforms now match independently transformed world positions, including alley hairpins and Falls Run. No heading artwork, decorative frame, HUD sizing or racer art redesign.

## Rendered/device evidence limit and review

Cloud browser navigated Title → Hub → Neon driver selection, then failed to create WebGL: GL_VENDOR/GL_RENDERER Disabled, Error creating WebGL context. No rendered race or cloud FPS result is claimed, and that environment error is not treated as an owner-device defect. Mobile pointer/countdown movement and portrait elevated camera regressions remain part of the full suite. Owner must drive the corrected Pages preview on phone in portrait/landscape, checking acceleration, steering, braking/reverse, drift, item, rear view, three-lap progress, edge impacts, minimap turns and replay. Optional ?testRacePerf=1 exposes existing frame diagnostics; preserve device/quality/viewport metadata if capturing numbers. The mobile smooth-driving gate remains pending; shortcuts, waterfall dive and scenery stay paused.

## Reproduction

cpu-before-controlled.json / cpu-after-controlled.json and collision-before-controlled.json / collision-after-controlled.json retain raw comparisons. runtime-probe.txt appends temporarily to tests/race-diagnostics-routing.test.ts; run npx vitest run tests/race-diagnostics-routing.test.ts -t DIAGNOSTIC, copy /tmp/neon-route-cpu.json, then remove the appended test. collision-probe.txt temporarily becomes tests/neon-diagnostic-probe.test.ts; run it alone, copy /tmp/neon-full-throttle-detail.json, then remove it. Restore original NeonGrid.ts/NeonGridCollision.ts from 08bb4f9 for the before comparison and restore repaired files before validation. Temporary probes are absent from the active suite. Timings are descriptive evidence, not flaky CI timing assertions.

Native validation, hosted checks and pinned delivery are recorded below after they complete.

Native validation: npm run validate PASS — 110 test files / 848 tests; strict typecheck, zero-warning ESLint, 42 GLB/163 PNG runtime validation, SFX/music/branding gates, production build. git diff --check and git lfs fsck PASS. Validation transcript and red regressions are adjacent. Existing Vite large-chunk and npm proxy-config warnings remain nonblocking; no new acceptance criterion or product requirement.

Independent code review: approved within the authorized repair scope, no Critical/Important findings; four focused suites independently passed 43 tests. Reviewer confirms collision evidence does not imply universal impact-speed or mobile smoothness acceptance.
