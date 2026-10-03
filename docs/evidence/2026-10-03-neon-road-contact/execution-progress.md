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
