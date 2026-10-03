# Residual Neon climbing-bend execution progress

Updated: 2026-10-03. Status: STEP 1.1 COMPLETE / REPRODUCTION NEXT.

Plan: docs/superpowers/plans/2026-10-03-neon-residual-turn-repair.md
Evidence: residual-owner-feedback.md in this folder.

| Step | Status | Evidence/checkpoint | Next action/gate |
| --- | --- | --- | --- |
| 1: Catch-up and reproduction | NOT STARTED | Baseline 4c981e9; CI 37126486632 PASS | Next session begins 1.1; push/report each substep |
| 2: Coverage and shape | NOT STARTED | Muse's deletion-cluster hypothesis is not confirmed support loss | Requires Step 1 evidence |
| 3: Causal trace | NOT STARTED | Video shows repeated local hop/stall | Log driveSupported and every recovery/respawn as well as staged velocity/contact evidence |
| 4: Diagnosis review | NOT STARTED | None | Push/report diagnosis; STOP for Manny before repair |
| 5: Regression/repair | NOT AUTHORIZED YET | None | Requires explicit Step-4 approval |
| 6: Validation/preview | NOT STARTED | Existing deployed runtime e441ab7 | Separate pinned-preview authorization and device review; no production release |

## Durable baseline

Runtime branch: design/neon-grid-circuit-02. Last verified source/docs before plan: 4c981e9cfb6a7cae3645cf4458585ccf1fd194fa. Main: 8c29fca14b47e03df83dd0ba8c3f063aaa57e0f8. Existing Pages 37124865236 PASS. PR #242 draft/unmerged. Planning checkpoint identity is the commit containing this file; it contains documentation only. Reverify remote refs/CI on entry.

Deployed review runtime: e441ab73ed0a5c3a2d75663de7a89a57606689b8.
URL: https://manaconda33.github.io/manacondas-minigame-mayhem/previews/neon-grid/?review=e441ab7

## Required record after each substep

Append step ID/date, completed/blocked status, source commit, commands/parameters and results, decisive evidence paths, unresolved questions, changed files, next action, exact pushed checkpoint and hosted CI state. Report that same checkpoint to Manny before advancing. A commit cannot contain its own SHA; record its exact SHA in the next ledger update or GitHub commit/CI reference, and always report it immediately after verified push.

No local-only work accumulation: if interrupted or publication blocked, resume from the first unfinished durable step. Long substeps need intermediate pushed evidence/status. Diagnostics can proceed in the next session through Step 4; repair remains gated. Stage 3/Dive/scenery/production remain paused; tokens omitted.

## 1.1 — repository catch-up, 2026-10-03

Source/planning: d0269e0fe05e72b16def9b05c2261756752421a1; exact-head CI 37128314341 SUCCESS. Main 8c29fca14b47e03df83dd0ba8c3f063aaa57e0f8; CI/Pages 37124865236 SUCCESS. PR #242 open/draft/unmerged. Only relevant open PR is #242. Preview workflow still pins e441ab73ed0a5c3a2d75663de7a89a57606689b8. Remote metadata, branch, six recent commits, PRs and Actions checked with connected GitHub; fresh branch clone matches remote.

Read AGENTS, README, PRD, implementation status, decisions, testing, avatar intake, roster mapping, LFS publishing, Neon spec/build contract/layout, saved diagnosis plan/ledger and recording evidence. PRD baseline v1.1 with approved amendments incl. ADR-104; active Slice 6, Neon Stage 2 main-route blockout. Prior Title/Hub/HUD/Results, audio, art and Alpha acceptance remains closed. Neon remaining main-route localized hop/stall is unresolved; Stage 3 shortcuts/Dive, scenery/new audio and production remain gated; tokens omitted. Camera polish/final Slice 6 diagnostics remain separate/deferred. No completed-slice claim.

Reconciliation: design README's original runtime-pending wording and roster header's thirteen-profile/local-only wording are historical; later approved ADR-102/104, runtime manifest and release evidence govern. No character implementation here. Recording is context-associated with e441ab7, no visible source marker. Launch/support/speed mechanisms unproven; deletion spans are not measured holes. Native source unchanged since e441ab7.

Checks: documentation-only diff check; exact remote content/refs and hosted planning CI readback. No fresh runtime validation claimed. Fresh isolated clone on runtime branch; prior scratch checkout left untouched. Normal Git read succeeded; proxy requires credentials; use connector publication if ordinary push unavailable. No binary publication.

Changed files: plan checkbox, this ledger, IMPLEMENTATION-STATUS. Next 1.2: build native controlled reproduction at gold Falls Run after pad 0.73; compare recording lap-2 window 125.4–128.0 seconds. Diagnosis authorized through Step 4; corrective implementation not authorized. This entry's exact publication SHA/CI is reported after remote verification and recorded in the next ledger entry.

## 1.2 — controlled reproduction complete, 2026-10-03

Source checkpoint 927caf0ee7c21fa639a4e2d72750772541352b3d; hosted CI 37128589847 SUCCESS. Native controlled Manaconda / Wayfinder probe reproduces launch and slowdown at main progress 0.809823: controller 29.666667 → world.step 17.887793 m/s; native upward velocity 14.049756 m/s; no scripted boundary at onset. Same run later reports AIRBORNE; max 79 air steps, minimum 7.423852 m/s. Repeated run summaries match within 1e-6 serialization. Location aligns gold return climbing S-bend after late pad; this is a symptom/location match, not original input reconstruction or proof of exact recorded cause.
Command: node tools/diagnostics/neon-residual.mjs docs/evidence/2026-10-03-neon-road-contact/reproduction-1.2.json. Three starts 0.78/0.80/0.81, aa-09, gravity -18, dt 1/60, 90 settling steps, 29.7 m/s planar initial speed, 240 driven steps each; existing AiDriver steering with forced throttle=1/brake=false/drift=false. No rivals/items. Exact settled poses, full input sequence and stage snapshots in JSON. Starts 0.78/0.80 primarily suffer scripted rail losses, 0.81 has native launch. Settling can move on the grade; settled actual pose is saved. No recovery emulation in this first harness; Step 3 will trace support/contact/recovery; do not assume no production recovery from its absence here.
New harness is opt-in mjs outside active tests, using Vite SSR to execute installed source; no default runtime hook or dependency added. TDD repair regression is deliberately deferred to authorized Step 5; diagnostic observations are not passing gameplay milestones. Full npm run validate PASS, 111 files/850 tests, typecheck/zero-warning lint/assets/build; diff and LFS PASS. Full output validation-1.2.txt. Original video/derivatives not published. Changed files: harness, reproduction JSON, validation transcript, plan/ledger/status and testing procedure. Next 1.3 compare lines/speeds. Launch initiator and speed-loss mechanism not yet established.

Publication SHA/CI reported after remote verification and recorded in next entry.

## 1.3 — line and speed comparison complete, 2026-10-03

Prior checkpoint 115061a939a604ceb53f71b5e548ecac8a336c5f; CI 37128916385 SUCCESS. Eighteen controlled runs compare signed lane targets -3/0/+3 m, starts 0.80/0.805/0.81 and normal/boosted speed. Native launch is repeatable on 0.81 starts on all lane targets at normal and boosted speeds; center onset progress 0.809824, actual offset +0.25469 m, speed 29.666668→18.272153 m/s, upward velocity 13.614448 m/s maximum. Boosted center 33.226667→20.447321 m/s, max vy 15.303631. No boundary at peak native loss. Earlier approaches commonly produce scripted rail slowdown; negative lane at 0.80 produces a smaller native launch and subsequent near-stop. Different local starts/steering histories produce different trajectories; do not equate this with all legal lines failing.
Command: node tools/diagnostics/neon-residual.mjs docs/evidence/2026-10-03-neon-road-contact/lines-1.3.json --matrix. Same aa-09/real ribbon/controller/gravity/dt/settling; 7m lane lookahead, steering clamp(2.5*yawError,-1,1), held throttle/no brake/no drift. Normal initial 29.7 m/s; boosted initial maxSpeed*1.12 with first-step boost surface activating existing pad state (0.8s), a controlled condition rather than actual pad traversal. Full inputs/spawn saved, every 10th stage row plus peak ±8 and every rail event. Signed offsets are stable world-track labels; inside/outside reverse through S-bend, so do not call one fixed sign the entire inner side. Recorded unseen controls remain unknown. The local scenario matches location/launch/slowdown, not exact lap-2 107→1 km/h history; its remaining gap is landing/near-stop and original controls/items.
No runtime source, geometry, tuning, dependencies or default diagnostic UI changes. Full native validation results saved to validation-1.3.txt; diagnostic observations are not a passing main-route milestone. Next 2.1 independently enumerate deleted triangles with exact indices/world coordinates. Step 4 review remains mandatory.

Publication SHA/CI reported after remote verification and recorded in next entry.

## 2.1 — removed faces independently mapped, 2026-10-03

Prior checkpoint be9e289ecfb4e45ff73e9773d4200b2fcbd10110; independent production mesh parity finds exactly 8 removed of 3072 authored faces, 3064 retained. Four clusters: span 428 progress 0.278646–0.279297; 523 0.340495–0.341146; 618 0.402344–0.402995; 1240–1244 0.807292–0.810547. Fourth overlaps controlled hop location; world bounds X -180.717407..-168.719315, Y 7.738028..8.159184, Z 41.625889..50.366856. Its 4.716597 m centerline span is NOT a measured uncovered hole. Earlier Muse approximate progress values are not current exact mesh clusters.
Command: node tools/diagnostics/neon-coverage.mjs docs/evidence/2026-10-03-neon-road-contact/deletions-2.1.json. Independently reconstruct all 1536 spans and 3072 triangle triples from curve/width, compute double-precision cross product prior to Float32 conversion, compare removed status against exact production index set for EVERY triangle. All match. Saved exact removed triples, pre-Float32 and actual collider coordinates, normals, bounds and parameters. No assumption that negative normal implies missing support. Runtime source remains identical to e441ab7. Full native gates saved validation-2.1.txt; next 2.2 actual downward collider rays with legal driving footprints/overlap handling.

Publication SHA/CI reported after remote verification and recorded in next entry.

## 2.2 — native support coverage measured, 2026-10-03

Prior checkpoint 1e676e4c81e7617e7f9e715c1a45fb7f893e46fb; CI 37129204655 SUCCESS. Production road-only Rapier rays across all four exact deletion clusters find zero misses within the drivable center allowance (half-width minus 1.15m radius) and zero tested corner/wheel/center footprint misses on -3/0/+3m lines. Coarse grid 0.1m longitudinal/lateral; 65408 legal native rays and 17874 legal footprint rays. Maximum inward retreat needed at missed exact rim probes: 0.1m; this bounds sampled perimeter discrepancy, not a global continuous proof. Coarse misses occur only at exact authored outer offsets -4.5/+4.5/-4.5/+6m, not at interior driving samples. Refined +/-0.1m world grids at 0.02m spacing and inward retreat probes distinguish tessellated perimeter discrepancies from an interior hole; exact classification/results in coverage-2.2.json. No unsupported interior support gap demonstrated by these samples.
Command: node tools/diagnostics/neon-coverage.mjs docs/evidence/2026-10-03-neon-road-contact/coverage-2.2.json --probe. Exact production ORIENTED|FIX_INTERNAL_EDGES road collider only; castRayAndGetNormal origins local road Y+5m, 10m down. World has no kart/rival/self collider; support cannot be self hits. Full grid hit heights saved, exact project legality excludes outside areas; 3 lanes times center, four body corners and four wheel offsets. Overlapping triangles contribute actual nearest native support; no deleted-face extrapolation. Flat clusters return Y=0. Climb returns heights -0.723937..+0.910141m relative to local centerline, so coverage alone does not establish smooth or correctly shaped support. Other-deck ambiguity bounded by local ray origin/range and recorded heights; Step 2.3 enumerates all overlapping triangles and normals.
Full native gates PASS (111/850, typecheck/lint/assets/build/diff/LFS), validation-2.2.txt. No runtime modification or video publication. Next 2.3 measure grade/normal/overlap/lips at native incident; do not claim root cause from coverage alone.

Publication SHA/CI reported after remote verification and recorded in next entry.

## 2.3 — grade normals and overlaps measured, 2026-10-03

Prior checkpoint 47fea1e8039e25a77d93544cccda05bc86df3703. Incident has intact sampled footprint coverage, retained steep triangle 2482 / original span 1245 (progress 0.810547), normal [-0.266732,0.749017,0.606488], slope 41.494728 degrees. Local centerline grade in 0.803–0.815 is 2.022361–5.666647 degrees. The pre-launch leading-right body footprint at approximately +1.18m along/+0.72m lateral meets this steep face; adjacent ordinary support faces slope about 2 degrees. Native center rays agree with independent intersections and still hit ordinary support at launch, so a center ray alone hides the leading footprint interaction. Stage 3 must measure actual contact normals/impulses before attributing launch to triangle 2482.
Command: node tools/diagnostics/neon-shape.mjs docs/evidence/2026-10-03-neon-road-contact/shape-2.3.json. Exact retained Float32 faces, independent THREE.Ray intersections enumerate all layers; native road-only ray heights/normals/features agree. Save steep faces with exact indices/coordinates, 12-step incident center rays before/after physics, 603 cross-section samples at 0.02m (three lateral body lines +/-0.72/0), and grade samples. Overlapping support sheets exist on approach: e.g. -0.72 lateral/-0.76m along has top 8.050787m and lower 7.998522m, a 0.052265m separation; top envelope changes 0.052877m across adjacent 0.02m samples. This is a sampled surface discontinuity, not a missing-support hole; actual continuous extent not claimed. Steep retained narrow transition is present despite inverted-face deletion; overlap/crease cannot be fixed by blindly restoring removed faces.
Full native gates PASS in validation-2.3.txt; runtime source/visible mesh/collider flags unchanged. No uncovered interior dimensions to report because none measured in tested envelope; perimeter tessellation discrepancies are bounded separately in 2.2. Next 3.1 per-step support predicates and drive state, then 3.2 native contact and recovery hooks. No repair/preview/production authorization.

Publication SHA/CI reported after remote verification and recorded in next entry.

## 3.1 — per step support and drive state captured, 2026-10-03

Prior checkpoint aa732886f37436800c9b771e6c1d6a44ae4eef2c. Behavior-neutral observation exactly reproduces 1.2 summary: step 15 controller 29.666667→native 17.887793 m/s, native vy 14.049756. Before this impulse all four wheel rays hit, grounded/driveSupported true. Wheel support is lost after native step 19; step 20 driveSupported false; AIRBORNE feedback first true at step 24. Support loss is a consequence in this scenario, not the initiating unsupported hole. From step 20 controller damping exp(-0.65/60) accounts for gradual airborne speed decay; it cannot explain the earlier 11.778874 m/s one-step native loss. Boost inactive, surface asphalt, throttle=1/brake=false/drift=false. CenterGrounded is independently false while vy exceeds 0.35 even when center ray hits; grounded and driveSupported remain distinct.
Command: node tools/diagnostics/neon-residual.mjs docs/evidence/2026-10-03-neon-road-contact/support-3.1.json --trace. Saves every 1/60 step, full body pose/quaternion/velocity before controller, after controller and after world.step, selected surface/projection/offset, exact wheel origins/hits/distances/features, center ray, grounded/centerGrounded/driveSupported, boost fields and feedback. Self body excluded using same Rapier query filter as controller. Predicates independently reconstruct existing controller formulas; no production overlay/hook/default behavior. Single aa-09 local start 0.81 retains existing AiDriver steering, held throttle/no brake/drift. Added reads reproduce unobserved summary to 1e-6, no intervention in body state. No native manifold or production recovery evidence yet; next 3.2 records actual contacts and real KartTimeTrial staged effects/recovery calls.
Full native gates PASS (111/850, typecheck/lint/assets/build/diff/LFS) in validation-3.1.txt. Runtime/visible road/tuning/flags unchanged; diagnosis not owner acceptance; Step 4 review before corrective implementation.

Publication SHA/CI reported after remote verification and recorded in next entry.
