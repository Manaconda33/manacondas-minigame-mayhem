# Neon Grid road-contact motion repair — 2026-10-03

Status: validated pinned preview LIVE; owner portrait/landscape driving review remains pending. Manny authorized continuing the track repair after reviewing documentation checkpoint `3d56e74fe64e5306627e006ee56eacb143a7eda8`. Runtime PR #242 remains draft/unmerged. No production release, shortcuts/Dive, scenery, tokens or new audio.

## Catch-up and intended result

GitHub verified runtime branch head 3d56e74, default main 01909ab62d1a92950b38961edc9bcc5a13342a80, runtime CI 37122936892 successful, preview-only PR #246 merged, main validate/deploy 37094083446 successful, and live preview marker still pinned to 6edd4fc. AGENTS, PRD v1.1/amendments including ADR-104, status, decisions, testing, README, avatar/roster/LFS contracts, Neon design/plan and both prior diagnosis/repair evidence were reviewed. Prior scratch HEAD was a different documentation commit; fresh authenticated fetch supplied the exact canonical 3d56e74 base. All changes are based on that GitHub commit.

Success means continuous kart movement on the approved route, preserving geometry, sharp hairpins, widths, elevations, checkpoint authority, tuning, controls, camera, roster/items and accepted Alpha behavior. Owner reports items/effects smooth while driving still sticks; his track/kart hypothesis led this investigation but does not establish every remaining phone symptom's cause.

## Reproduced defect and single-variable isolation

A real Rapier world with the production Neon ribbon and Archer controller, settled onto the road then driven at 25 m/s with held throttle, reproduces a large **position displacement deficit despite steady planar velocity**. On the skyline, expected first-step displacement is 0.417651 m but measured movement is 0.137544 m. Subsequent steps alternate between near-expected movement and approximately 0.09 m. The original road-contact probe reaches 0.537050 m maximum displacement error, without wall contacts or airborne feedback.

The original collider specifies FIX_INTERNAL_EDGES (144), but not ORIENTED (8). Adding only ORIENTED (152) removes the planar sticking on the same mesh. Adding the topology/triangle-cleanup bits individually (145/146/148/176/208) does not remove it. A flat box control behaves continuously. Dropping internal-edge correction entirely instead causes speed loss and is rejected. `flag-isolation.json` preserves the summaries and first 12 steps for the one-bit experiments.

This isolates the production two-sided triangle contact handling as a cause of non-velocity positional correction, not rendering cost, wall collision, controls, projection caching or authored road shape. Rapier's oriented flag uses the mesh's outward normals; the ribbon already winds its top triangles upward. The exact engine-internal source of the solver correction is not asserted. API reference: https://rapier.rs/javascript3d/enums/TriMeshFlags.html (installed Rapier 0.20.0 declarations checked too).

## Bounded correction

NeonGridCollision now combines FIX_INTERNAL_EDGES with ORIENTED for the existing upward-wound road. Preserve adjacent-edge normal correction; make its top support orientation explicit. The road remains a thin top-support ribbon, not a solid volume with a new underside. Geometry vertices/indices, visible road/walls, scripted guardrail authority, native kart-to-kart collisions and all other runtime files remain unchanged. No floor plane, velocity override, teleport, speed cap, track widening or smoothing is introduced. Alpha's existing cuboid support remains unchanged. Future tunnel/jump colliders must declare their own support orientation and walls; this does not install them.

## Independent movement regression

`tests/neon-grid-road-motion.test.ts` drives real Archer physics on two flat authored road regions (progress 0.001 and 0.48), maintaining on-road traversal with the existing AiDriver and held throttle. Its oracle is independent integration: before-step planar velocity × 1/60 must match actual body displacement within 0.002 m at every step; check support and legal lateral containment as well. The final test fails against the original flag on skyline step 0 (0.280106 m error) and Falls step 1 (0.383121 m error), then passes with the orientation correction. This catches the sticking that speed/drop/backwards-only assertions missed. The initial fixed-heading Falls fixture eventually left its bend (lateral 8.823 m); it was corrected to follow the authored road rather than weakening the support assertion. Existing support, barrier, mobile pointer, portrait camera, Alpha and eight-profile three-lap tests remain required.

## Route sweep (native physics, no rendered/device claim)

Twelve spawn regions, 90 settling steps, 180 driven steps/region, Archer, existing AI steering with throttle forced on and brake off. Compare 144 vs 152 on identical geometry. Planar displacement error is measured **before scripted guardrail correction** against pre-world-step planar velocity × dt. Collider modes diverge in trajectory, so this is contact diagnostics, not same-path timing/balance evidence. `road-comparison.json` retains every sampled row. `road-probe.txt` is a temporary Vitest diagnostic; copy to tests/neon-contact-probe.test.ts, run alone, collect /tmp/neon-road-comparison.json, then remove it. It is absent from the active suite.

| Start progress | Original max position error (m) | Oriented max position error (m) |
| --- | ---: | ---: |
| 0.001 | 0.537050 | 0.000018 |
| 0.190 | 0.477285 | 0.005557 |
| 0.210 | 0.511684 | 0.002630 |
| 0.230 | 0.511689 | 0.002945 |
| 0.270 | 0.511701 | 0.000016 |
| 0.350 | 0.511656 | 0.000033 |
| 0.480 | 0.511709 | 0.000043 |
| 0.720 | 0.535400 | 0.001946 |
| 0.800 | 0.501524 | 0.048053 |
| 0.850 | 0.511218 | 0.000344 |
| 0.900 | 0.511302 | 0.000266 |
| 0.950 | 0.507825 | 0.000023 |

Flat-road errors fall from roughly half a meter to float-precision noise. Descents/climbs retain legitimate slope contact effects. The forced-throttle tight climbing bend (0.8) still has a 0.048053 m native positional adjustment and a 2.7696 m/s maximum native speed loss (original 0.7253 m/s); trajectories differ and the oriented racer travels farther. Do not claim all impacts or uphill losses vanish. Scripted wall contacts, grade support and physical recovery remain valid behavior. Smooth phone driving still requires Manny's portrait/landscape retest; no rendered motion/frame-time pass is inferred from these probes.

## Validation and delivery

Results and deployment records will be appended after the relevant checks complete. No production merge is authorized. Stage 3/Dive/scenery remain paused until owner main-route acceptance.

Native validation: `npm run validate` PASS (111 test files / 850 tests), strict typecheck, zero-warning lint, asset signatures/provenance and production build; `git diff --check` and `git lfs fsck` PASS. Existing npm proxy-config and Vite chunk-size warnings remain nonblocking. Complete transcript: validation.txt; original-flag failures: regression-red.txt. Independent review and hosted delivery pending.

## Verified preview delivery — resumed session, 2026-10-03

Runtime e441ab73ed0a5c3a2d75663de7a89a57606689b8 passed hosted CI 37124661871. Workflow-only PR #247 (982afb34d4cebc7840c62c6efdd1f1d652b7e997) passed CI 37124689405 and merged at 8c29fca14b47e03df83dd0ba8c3f063aaa57e0f8. Post-merge main CI/Pages 37124865236 passed validate job 111208004815 and deploy job 111208946113. Live marker matches e441ab7; four preview HTML/JS/CSS files and six representative Lavi/Archer/Lunarcrystal GLB/portrait assets match validated bytes. Four production bundle hashes match the verified pre-merge baseline. Exact HTTP/hash evidence: delivery.json.

Resumed-session focused validation: 8 files / 60 tests PASS covering motion, collision, three-lap driving, eight-body runtime, items, boundaries, mobile binding/session and cameras; diff and LFS checks PASS. Full native/hosted runtime validation remains 111 files / 850 tests plus typecheck, zero-warning lint and asset/build gates. No new runtime code was needed after the interruption. The runtime branch workflow is reconciled to the already-merged main preview pin; this delivery-record checkpoint changes no src/public files or deployed runtime bytes.

Owner test: https://manaconda33.github.io/manacondas-minigame-mayhem/previews/neon-grid/?review=e441ab7 — select Circuit 02 / Neon Grid, drive in phone portrait and landscape, check continuous movement on straights, bends, descent/climb, controls, edge contacts and minimap. Report any remaining sticking with location. Ordinary impacts can still slow the kart. Main-route acceptance remains unresolved until this retest; no rendered/device smoothness or timing pass is inferred. PR #242 stays draft/unmerged. Production release, Stage 3 shortcuts/Dive and scenery remain gated; tokens omitted. Earlier pending-delivery statements describe the pre-publication checkpoint.
