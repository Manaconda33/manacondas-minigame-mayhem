# Neon Grid Abyss Fog A/B Experiment

**State: local prototype complete; owner visual approval pending.** This is an opt-in visual experiment on `experiment/neon-grid-abyss-fog-001`. It does not alter `main`, the approved T9.7 default presentation, game rules, physics, routes, AI, collisions, shortcuts, art assets, or release configuration.

## Baseline and implementation

- Starting branch/checkpoint: `design/neon-grid-circuit-02` at `6919729ba5e12f48305f543dca153f4ba9c5ae19`.
- Runtime/evidence implementation commit: `b0f8d6ed0ef1ba92c6e2dace6886ab04232abd65` on `experiment/neon-grid-abyss-fog-001`.
- The approved T9.7 preview is pinned to `75c6c62c865ec3b546f3f2512e649de9ea6d52bc`. Before edits, `src`, `public/assets`, package manifests, and build configuration at the starting checkpoint were verified equal to that approved runtime tree.
- A is the unchanged accepted renderer, captured at the same camera anchors, viewport sizes, quality presets, and eight-racer setup as B. A is in [`approved-a/`](approved-a/); its overview is [`owner-views-contact.jpg`](approved-a/owner-views-contact.jpg).
- B is selected only by `?neonGridVisual=abyss-fog-001`. The normal/default route continues to create the approved scene. The variant is ignored for Circuit Alpha.
- B removes only decorative city-floor triangles from the combined Skyline fascia, Undercity sightline screen, Falls Run ground/building mesh, and Falls extension ground/building mesh. Roads, barriers, structural architecture, foundations, shortcut openings, billboard/warning geometry, waterfall presentation, and colliders remain.
- B adds one opaque camera-relative gradient backdrop and three district-batched, opaque instanced ruin groups with sparse colored windows and distance/height fog. It uses no transparent fog planes, volumetric raymarching, bloom pass, texture, or global renderer fog. Existing district colors and approved art/materials remain in place.
- Skyline silhouettes use cyan, Undercity silhouettes magenta, and Falls Run silhouettes cyan/gold-compatible material. Generated ruins are presentation-only and keep at least 188 m horizontal clearance from 512 samples of the whole route. Their roof heights are checked against the sampled local road elevation.

## Visual evidence

- B's 22-case sector/quality/camera matrix is in [`fog-experiment-b/`](fog-experiment-b/). It includes desktop Skyline chase/rear, Low/Medium/High sector views, and mobile landscape chase/rear views. The nine reported views and representative mobile portrait/rear views are in [`fog-experiment-b/course-sweep/`](fog-experiment-b/course-sweep/).
- [`fog-experiment-b/owner-views-contact.jpg`](fog-experiment-b/owner-views-contact.jpg) shows the nine required regression checkpoints together.
- [`fog-experiment-b/course-sweep-contact.jpg`](fog-experiment-b/course-sweep-contact.jpg) shows the full-course chase-camera sampling.
- B's full sweep samples 182 positions over 1,448.938 m, with no gap larger than 7.962 m, and includes all nine owner anchors. Both the real chase and rear camera are exercised. Browser/render error list is empty.
- These are Chromium/SwiftShader desktop captures and browser viewport emulations. No physical phone or representative G-05 hardware was measured. Images are evidence for owner review, not owner acceptance.

## Measurements

Both matrices stage the same actual `KartTimeTrial`, eight racers, Skyline progress 0.075, and 240 scored software-rendered frames after 45 warm-up frames. Camera/quality/viewport case labels match between A and B.

| Metric | A: approved T9.7 | B: fog experiment | Difference |
| --- | ---: | ---: | ---: |
| Sector matrix cases / browser errors | 22 / 0 | 22 / 0 | — |
| Matrix maximum draw calls | 386 | 392 | +6 (+1.6%) |
| Matrix maximum triangles | 402,819 | 399,463 | −3,356 (−0.8%) |
| Full-course sweep maximum calls | 494 | 500 | +6; B reaches the approved ceiling |
| Full-course sweep maximum triangles | 416,459 | 413,103 | −3,356 |
| Renderer geometries / textures in Skyline medium chase | 155 / 15 | 156 / 15 | +1 geometry / no texture increase |
| Median software frame time | 484.7 ms | 510.6 ms | +25.9 ms (+5.3%) |
| P95 software frame time | 593.8 ms | 589.7 ms | −4.1 ms (−0.7%) |
| Maximum software frame time | 650.8 ms | 645.7 ms | −5.1 ms (−0.8%) |

An initial B shader measured 554.4 ms median. Removing per-pixel trigonometric color variation and simplifying the window hash reduced B's measured median to 510.6 ms. The remaining 5.3% median difference is small in this heavily software-rendered runner; p95 and maximum were slightly lower than A. These measurements do not certify physical-device performance. B's rear-camera full-course peak reaches the 500-call cap exactly, so it has no draw-call headroom in that view; triangle count remains below the 425,000 Task 9 ceiling.

The backdrop and ruin materials are opaque; the experiment adds no alpha-blended fog surfaces. The nine-view captures retain the existing waterfall, signage, warning, shortcut, and road presentation. The shared generated ruin geometry, backdrop geometry, and backdrop material are disposed exactly once by the track-scene lifecycle test. Texture count is unchanged in the matching Skyline medium chase capture.

## Validation and limitations

Validation used supported Node `v22.23.3`:

| Command | Result |
| --- | --- |
| `npm exec --cache /tmp/npm-cache-neon-grid-abyss-fog-001 --yes --package=node@22 -- sh -c 'node -v && npm run typecheck'` | exit 0 |
| `npm exec --cache /tmp/npm-cache-neon-grid-abyss-fog-001 --yes --package=node@22 -- sh -c 'node -v && npm run lint'` | exit 0; zero warnings |
| `npm exec --cache /tmp/npm-cache-neon-grid-abyss-fog-001 --yes --package=node@22 -- sh -c 'node -v && npm run test:ci -- --maxWorkers=1'` | exit 1; 132/133 files and 1,077/1,078 tests passed. The only failure is pre-existing `tests/race-diagnostics-routing.test.ts:1094`, which exceeded its unchanged 5,000 ms limit. |
| `npm exec --cache /tmp/npm-cache-neon-grid-abyss-fog-001 --yes --package=node@22 -- sh -c 'node -v && ./node_modules/.bin/vitest run tests/race-diagnostics-routing.test.ts -t "selects the approved Neon map orientation in the real race and keeps Alpha orientation" --maxWorkers=1'` | exit 0; isolated case passed in 3.64 s |
| `npm exec --cache /tmp/npm-cache-neon-grid-abyss-fog-001 --yes --package=node@22 -- sh -c 'node -v && ./node_modules/.bin/vitest run tests/neon-grid-fog-experiment.test.ts --maxWorkers=1'` | exit 0; 6/6 experiment tests passed |
| `npm exec --cache /tmp/npm-cache-neon-grid-abyss-fog-001 --yes --package=node@22 -- sh -c 'node -v && node --test tools/diagnostics/t9-6-certify.node-check.mjs'` | exit 0; 8/8 evidence-checker tests passed |
| `npm exec --cache /tmp/npm-cache-neon-grid-abyss-fog-001 --yes --package=node@22 -- sh -c 'node -v && npm run build'` | exit 0; SFX/music/branding/runtime asset verification and production build passed. Existing >500 kB chunk warning remains. |
| `git lfs fsck --objects HEAD` | exit 0; `Git LFS fsck OK` |
| `git diff --check` | exit 0 |

The full test suite was not weakened or edited. The isolated timeout case passes without suite contention. Browser matrices and the full course sweep exited 0 with empty error arrays. B's final commands were:

```sh
NEON_GRID_COURSE_PLAYWRIGHT=/tmp/neon-grid-course-webgl NEON_GRID_COURSE_CHROME=/usr/bin/chromium NEON_GRID_COURSE_BASE_URL=http://127.0.0.1:5173/manacondas-minigame-mayhem NEON_GRID_VISUAL_VARIANT=abyss-fog-001 node tools/diagnostics/neon-grid-course-render.mjs /tmp/neon-grid-abyss-fog-001-b-final5
NEON_GRID_COURSE_PLAYWRIGHT=/tmp/neon-grid-course-webgl NEON_GRID_COURSE_CHROME=/usr/bin/chromium NEON_GRID_COURSE_BASE_URL=http://127.0.0.1:5173/manacondas-minigame-mayhem NEON_GRID_VISUAL_VARIANT=abyss-fog-001 node tools/diagnostics/neon-grid-course-sweep.mjs /tmp/neon-grid-abyss-fog-001-sweep-b-final5
```

Runtime [PR #292](https://github.com/Manaconda33/manacondas-minigame-mayhem/pull/292) is open against `design/neon-grid-circuit-02`. Its page shows Open without a Draft badge; repository CI only triggers for pull requests targeting `main`, so #292 currently has no hosted checks. Preview-publication [PR #293](https://github.com/Manaconda33/manacondas-minigame-mayhem/pull/293) is open against `main`. Hosted run [38209905504](https://github.com/Manaconda33/manacondas-minigame-mayhem/actions/runs/38209905504) has three non-matrix jobs and 20/21 preview matrix jobs complete; the new pinned fog-preview build remains in progress. No failure is visible, but the run has not completed and no preview is published.

Remote refs remain verified: runtime branch `experiment/neon-grid-abyss-fog-001` has the documentation-updated tip; runtime/evidence remains pinned to `b0f8d6ed0ef1ba92c6e2dace6886ab04232abd65`. Workflow-only branch `preview/neon-grid-abyss-fog-001` is at `5ef0bcf9d9ab038e2e520815bf1581a8b4bc2aae`, based on `main` `f09e961b1c7ec65fce82e223f5ed6f288dd195e4`. The earlier API 403 prevented automated PR creation; Manny opened #292 and #293 manually. `main` and the approved T9.7 preview remain unchanged.

Review links: [runtime PR #292](https://github.com/Manaconda33/manacondas-minigame-mayhem/pull/292) and [preview-publication PR #293](https://github.com/Manaconda33/manacondas-minigame-mayhem/pull/293). The [run #38209905504](https://github.com/Manaconda33/manacondas-minigame-mayhem/actions/runs/38209905504) must finish before considering the publication merge.

## Review and publication plan

Runtime PR #292 keeps the experiment opt-in and targets `design/neon-grid-circuit-02`; the page does not currently show a Draft badge. Preview PR #293 is workflow-only, targets `main`, and pins runtime SHA `b0f8d6ed0ef1ba92c6e2dace6886ab04232abd65` under preview ID `neon-grid-abyss-fog-001`, base path `/manacondas-minigame-mayhem/previews/neon-grid-abyss-fog-001/`, query `?neonGridVisual=abyss-fog-001`. After run #38209905504 completes, the preview-publication PR still requires Manny's separate approval to merge. It must preserve production and all existing preview bytes. Never reuse or overwrite the approved T9.7 preview.

The local prototype is not owner-approved. Keep the approved T9.7 rendering as the default and preserve its implementation until Manny reviews the actual B captures or a pinned Pages preview and approves a replacement explicitly.

Prepared PR descriptions and publication details remain in [runtime-pr-description.md](runtime-pr-description.md), [preview-publication-pr-description.md](preview-publication-pr-description.md), and [preview-publication-plan.md](preview-publication-plan.md).
