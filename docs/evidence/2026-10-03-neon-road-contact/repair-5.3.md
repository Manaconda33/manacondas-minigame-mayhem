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

Result:10/12faces physically contacted; face3020 has contact-associated native loss up to2.043735m/s. Geometry existence and controlled native response are direct observations; no original-video input replay or universal failure claimed.

Constrained triangulation experiment on the SAME91polygon boundary vertices (including all51authored centerline rows) minimizes maximum face slope using only valid internal diagonals. Measured optimum7.967327degrees,89inside triangles. No new sampling cells, broad interpolation or boundary/centerline movement. This is diagnostic evidence, not yet a runtime patch or matrix acceptance.

Original regression rerun exactly5FAIL/8PASS across13checks; unchanged source reproduces11.778874m/s collapse. Evidence regression-5.3-red.txt. Temporary active tests removed, runtime restored. Full tooling-only validation111files/850tests + typecheck/zero-warning lint/assets/build passed; diff/LFS pass. Known initialization/proxy/large-bundle notices remain. Next5.3b: implement constrained local triangulation, rerun19focused unchanged assertions and original18-run matrix; require clean inventory and loss<=1.83m/s/zeroair. No approval needed within go-ahead scope.
