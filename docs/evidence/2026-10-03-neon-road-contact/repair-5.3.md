# 5.3 constrained local-grade repair ledger

## 5.3a — complete shape inventory and physical characterization

Authority: Manny's 5.3 go-ahead selects local-grade; lifts 5.2 pause. Runtime scope remains NeonGridGeometry.ts only; keep ORIENTED, all assertions, centerline, perimeter clearance, assets/layout/tuning/controllers/workflows. Launch-as-feature is deferred. Preview/release/Stage 3 remain gated. Stop for Paprika after final publishable patch, before preview.

Catch-up: fresh clone; source e9481af, hosted CI37135281958 SUCCESS; PR242 open/draft; default main8c29fca; workflow preview pine441ab7 unchanged. Active Slice6 / Neon Stage2 acceptance unresolved. PRD1.1 with approved amendments through Neon2.25/ADR104 controls. Conversation describing repo private is stale: AGENTS says public and GitHub verifies public. All required docs/contracts read; no slice/production acceptance inferred.

Corrected shape probe classifies patched faces by identity against all 3072 original face triples, never by minimum index. Exact Float32 mesh has3160 faces,193 patched faces;12 exceed20degrees. Four previously omitted faces2966/2978/3007/3047 are now visible. Archive shape-local-grade-5.3.json includes the full local and patched inventory. Original current source remains restored for this tooling-only checkpoint.

Physical command: node tools/diagnostics/neon-residual.mjs /tmp/neon-faces-local-grade-5.3.json --faces=/tmp/neon-shape-local-grade-5.3.json. Reuses unchanged native matrix stepping/controller/production barriers,90settle,240drive,dt1/60,aa09. For EACH face18targeted scenarios: face centroid approach3m upstream, lateral-0.55/0/+0.55m, yaw-15/0/+15degrees, normal/boosted. These are deliberate face/pose probes, NOT the original legal-lane18-run baseline matrix. Pose at boundary may settle off-road and later fall; whole-run airtime includes these cases and cannot be attributed to the face. Exact achieved spawn, inputs policy, contact feature IDs, target/contact metrics and one peak/contact row are archived; command regenerates full traces. A trigger means native road manifold explicitly names the face. No face contact observed for2986/3014, so no physical effect attributed to them; they still fail shape acceptance. Faces-local-grade-5.3.json lists triggering lanes/poses/speeds and contact-only metrics per face. Whole-run worst metrics below include other faces and off-road falling.

| Face | Slope | Contact runs / 18 | Worst run loss m/s | Worst run vy m/s | Max run air steps |
| --- | --- | --- | --- | --- | --- |
| 2966 | 51.751° | 3 | 1.115316 | 7.581087 | 18 |
| 2978 | 33.039° | 14 | 0.135807 | 1.986889 | 0 |
| 2986 | 32.168° | 0 | 1.360278 | 3.469987 | 236 |
| 3007 | 31.535° | 4 | 1.518010 | 8.434915 | 32 |
| 3014 | 59.911° | 0 | 0.465815 | 4.706551 | 236 |
| 3020 | 65.112° | 2 | 2.043513 | 7.469444 | 236 |
| 3025 | 45.632° | 16 | 1.167054 | 5.513432 | 0 |
| 3026 | 83.857° | 8 | 0.412286 | 4.591956 | 236 |
| 3031 | 47.006° | 7 | 1.257230 | 5.623591 | 0 |
| 3036 | 49.768° | 6 | 1.494770 | 4.772240 | 0 |
| 3041 | 54.533° | 8 | 1.459833 | 4.567309 | 0 |
| 3047 | 23.062° | 18 | 1.301294 | 7.477502 | 19 |

Result:10/12faces physically contacted; face3020 has contact-associated native loss up to2.043513m/s. Geometry existence and controlled native response are direct observations; no original-video input replay or universal failure claimed.

Constrained triangulation experiment on the SAME91polygon boundary vertices (including all51authored centerline rows) minimizes maximum face slope using only valid internal diagonals. Measured optimum7.967327degrees,89inside triangles. No new sampling cells, broad interpolation or boundary/centerline movement. This is diagnostic evidence, not yet a runtime patch or matrix acceptance.

Original regression rerun exactly5FAIL/8PASS across13checks; unchanged source reproduces11.778874m/s collapse. Evidence regression-5.3-red.txt. Temporary active tests removed, runtime restored. Full tooling-only validation111files/850tests + typecheck/zero-warning lint/assets/build passed; diff/LFS pass. Known initialization/proxy/large-bundle notices remain. Next5.3b: implement constrained local triangulation, rerun19focused unchanged assertions and original18-run matrix; require clean inventory and loss<=1.83m/s/zeroair. No approval needed within go-ahead scope.


## 5.3b — publishable constrained patch, STOP for Paprika

5.3a checkpoint **35de0d48e31c088471ef23eb03af023e5c01c7b3**, hosted CI **37142236915 SUCCESS**. Implemented only `src/game/track/NeonGridGeometry.ts`; no other runtime, collider, controller, guardrail, tuning, layout, asset, dependency or workflow changes. ORIENTED remains unchanged. No deleted-face restoration. No material PRD deviation.

The selected local-grade boundary/height assignment remains unchanged from 5.2. The correction replaces unconstrained ear clipping with minimum-maximum-grade constrained triangulation of the existing 91-vertex local polygon. Valid diagonals remain inside the polygon and do not cross its perimeter; upward triangles are evaluated on exact eventual Float32 vertices. All 51 authored centerline row positions / 50 shared centerline edges and every boundary segment remain present. The original outer-half cells remain; no dense inner cells or new surface sampling. Heights are adjusted only on the approved local inside-edge grade between rows 1230 and 1256, retaining both anchor heights. Material grouping remains gold and shared visible/native mesh stays authoritative.

**Complete slope inventory CLEAN:** 193 patched faces, zero over surrounding-original envelope. Inside polygon: 89 faces, maximum **7.967327°**. Maximum across every patched face **11.845520°**, exactly the surrounding original entry face's 11.845520°; this is inherited end-join slope, not a new steep ear. Surrounding reference: exact original entry row 1219 and exit rows 1270/1271, excluding defective interior triangles. `slope-envelope-5.3.json` retains reference vertices/normals/slope and comparison. All 12 steep local-grade faces are eliminated; final expanded shape inventory also covers immediate joins, rather than only original min-span rows.

Independent `neon-patch-audit.mjs` verifies all **3,074 original ribbon vertices** unchanged byte-for-byte at Float32 precision; **2,965 original faces outside the patch** retain their indices and winding; centerline coordinates match the authored curve exactly after Float32 conversion (maximum rounding distance 7.32e-6 m). Every centerline edge has exactly two incident faces. All local edges have one/two incident faces, one 91-vertex perimeter, 89 triangles; projected triangle area equals polygon area **260.713385547 m²**, no excess overlapping area or missing polygon area. Results in geometry-audit-5.3.json.

**Original 18-run matrix PASS:** worst native loss **0.426449 m/s** versus local-grade baseline 1.828710 m/s (acceptance ≤1.83); **zero air steps in every run**; max native vy **4.675679 m/s**, lower than baseline 7.488292. Exact starts/lanes/speeds unchanged. `candidate-matrix-5.3.json` records source SHA256, spawn, summaries and peak windows; rerun original harness with `--matrix` to regenerate all steps. No original player input or rendered acceptance inferred.

**Causal trace PASS:** original diagnostic AI-steered 0.81 start, 240 steps, native peak loss **0.207361 m/s**, max vy **2.358041 m/s**, **zero air steps**. Original 11.778874 m/s loss / 14.049756 m/s launch removed in this controlled scenario. One later real scripted boundary contact remains (minimum speed 22.864500 m/s); deliberate falling/barrier response still passes the unchanged regression controls. `causal-trace-5.3.json` keeps first 25 steps and boundary/contact/support evidence; `--trace` regenerates the entire sequence.

**Targeted original-region checks:** repeat the exact archived 216 face-centroid/line/pose/speed scenarios with `--faces=shape-local-grade-5.3.json --regions`. Old triangle IDs are only region labels after retriangulation; current native manifold IDs and coordinate distance establish contact. Worst native loss across all 216 runs **0.697778 m/s**. All **191 baseline zero-air scenarios remain zero-air**, with no new airtime on previously supported scenarios. The 25 original air scenarios include deliberate near-boundary/off-road starts; some still fall, and maximum 236 air steps is unchanged. These do not replace the legal-line matrix or claim safe off-road driving. The following whole-run extrema include other faces and off-road falling; detailed triggering line/pose and contact-region metrics are in regions-constrained-5.3.json.

| Original face region | Patched worst native loss m/s | Patched worst vy m/s | Max run air steps |
| --- | --- | --- | --- |
| 2966 | 0.351459 | 4.653032 | 0 |
| 2978 | 0.681739 | 4.682492 | 0 |
| 2986 | 0.697778 | 4.691443 | 236 |
| 3007 | 0.351535 | 4.652019 | 0 |
| 3014 | 0.363204 | 3.834167 | 236 |
| 3020 | 0.321894 | 3.782988 | 236 |
| 3025 | 0.079324 | 1.751380 | 0 |
| 3026 | 0.350716 | 3.831432 | 236 |
| 3031 | 0.078898 | 1.739257 | 0 |
| 3036 | 0.066514 | 1.617758 | 0 |
| 3041 | 0.050650 | 1.442202 | 0 |
| 3047 | 0.351465 | 4.668108 | 0 |

**Unchanged assertions / gates:** Original failing fixtures copied unchanged for the focused run: **19/19 PASS**, including all six existing boundary-response assertions and the contains-both-edges support-clearance test at 0.8154. No weakened assertion or changed fixture. Remove both temporary active tests before full validation, retaining original opt-in fixture sources. **111 files / 850 tests PASS**, strict typecheck, zero-warning ESLint, approved asset verification, production build, diff check and Git LFS fsck PASS. Existing suite includes eight profiles × three laps, other sectors, Alpha/controller/mobile input/camera behavior. No new defect observed in these tested cases; finite native tests do not establish every possible line/pose/device behavior. Existing large-chunk/proxy/Rapier initialization notices remain nonblocking. No browser/manual/preview pass claimed.

Reproduction commands:

- `node tools/diagnostics/neon-shape.mjs /tmp/neon-shape.json`
- `node tools/diagnostics/neon-patch-audit.mjs /tmp/neon-audit.json`
- `node tools/diagnostics/neon-residual.mjs /tmp/neon-matrix.json --matrix`
- `node tools/diagnostics/neon-residual.mjs /tmp/neon-trace.json --trace`
- `node tools/diagnostics/neon-residual.mjs /tmp/neon-regions.json --faces=docs/evidence/2026-10-03-neon-road-contact/shape-local-grade-5.3.json --regions`
- Copy the two original diagnostic test fixtures to their documented `tests/` paths; run the focused three-file suite, remove tests, then `npm run validate`, `git diff --check`, `git lfs fsck` sequentially.

Self-review: scope, constrained diagonals/positive winding, centerline conformity, surrounding envelope, fixture integrity, topology/area, material sectors, native matrix/pose traces and full gates checked. **Paprika's independent verification is pending**, and is the explicit next gate. No reviewer-agent dispatch, preview publication, PR merge, release or Stage 3. Final checkpoint's containing commit supplies its identity; exact branch head and hosted CI are verified and reported after publication. Source snapshot/hash: patch-inspection-5.3.json. Main remains8c29fca, pinned previewe441ab7; PR242 stays draft/unmerged.
