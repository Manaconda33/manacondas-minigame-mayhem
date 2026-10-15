# Task A — Recover existing sponsor visibility

Status: **Published for owner review; hosted delivery verification passed. Current-session live playable smoke and owner visual/playability acceptance remain pending.**

## Provenance and diagnosis

- Repository: Manaconda33/manacondas-minigame-mayhem.
- Verified main: `54f422a5885865a8a418da79c2c96eb904426c93`.
- Baseline branch: `experiment/neon-grid-abyss-fog-004`.
- Baseline source: `25ea008b15852d593681f5b3b2a17b467a193472`; executable checkpoint `9731adafdaf8e84d5a2c36ceeb035620753befa6`. Source/assets/configuration comparison between these baseline pins is empty.
- Isolated candidate: `fix/neon-grid-task-a-sponsor-visibility-20261014`.
- Candidate selector: `?neonGridVisual=neon-grid-task-a-001`; accepted T9.7 default and V3.2 selector remain unchanged.

The suspected lifted-ad guard is not the scene defect: scene composition already maps `fog-experiment-v3-2` to `fog-experiment-v3` before district construction. Baseline V3.2 therefore already executes the lifted placement. Actual camera inspection and object inventory identify sub-road facade mounting and intervening road/screens as the primary obstruction. Sponsor image materials are excluded from the height-fog treatment. This correction changes placement, not the fog shader.

The pre-implementation [inventory](before-inventory.json) records all 18 instances. The four final audit JSON files record exact matrices, world centers, normals, nearest road progress/elevation, artwork dimensions, camera transforms, five-point visibility probes and blocking object names. Visibility probes describe sampled occlusion, not subjective legibility or an at-speed acceptance guarantee.

## Bounded correction

- **Manaconda Racing / Taco Bell Live Más:** relocate each sponsor's three existing 8×4m facade signs to six distinct, existing upper tower faces at road +4.5m. Full-face raycasts establish backing by actual tower geometry. Incoming, lateral and outgoing orientations improve chase/rear opportunities. All eight original roadside camouflage-board matrices and supports are unchanged.
- **Nightshift Noodles / Voltline Industrial:** move four existing signs to supported roadside screen mounts at road +2.35m, uniformly half scale (4.275×2.075m). Reuse the existing sign backings, with overlap onto existing wall screens. Test actual wall ribbons and presentation screens at attachment points before selecting mounts; do not span shortcut openings. No new scenery/render objects/materials/assets are introduced. Temporary query geometry is disposed before construction returns.
- All accepted building geometry, fog, waterfall, roadway, colliders, masks, physics, AI, race rules, cameras, roster and art bytes are preserved. No CI workflow, dependency, budget or PRD change.

Initial low guard-face trials were rejected during visual review: the rail and racers concealed too much of the art. The final raised screen-backed placement is the version in this packet. Earlier temporary trial images are not substituted for final evidence.

## Matched visual evidence

Medium quality; Chromium software WebGL/SwiftShader; DPR 1. Desktop 1920×1080 chase/rear, portrait 390×844 chase. Actual KartTimeTrial scene, native ChaseCamera, Manaconda driver and seven deterministic opponents (aa-03/04/05/07/10/12/14), loaded kart/driver assets, existing bloom/motion-blur pipeline. Camera position/rotation/FOV/aspect and roster are exactly equal in each before/after pair. Diagnostic scene captures omit the normal application HUD; separate built-application smoke captures exercise the normal UI.

### desktop sponsor comparisons

| Sponsor / instance | Camera progress | Before width / visible probes (0px = outside capture filter) | After width / visible probes | Images |
|---|---:|---:|---:|---|
| Manaconda Racing #1 | 0.135 | 58.0px / 0/5 | 92.2px / 5/5 | [before](before/desktop/0.135-chase.png) · [after](after/desktop/0.135-chase.png) |
| Taco Bell Live Más #0 | 0.076 | 64.2px / 0/5 | 128.1px / 5/5 | [before](before/desktop/0.076-chase.png) · [after](after/desktop/0.076-chase.png) |
| Nightshift Noodles #0 | 0.278 | 223.1px / 0/5 | 160.3px / 5/5 | [before](before/desktop/0.278-chase.png) · [after](after/desktop/0.278-chase.png) |
| Voltline Industrial #0 | 0.34 | 0.0px / 0/5 | 159.0px / 5/5 | [before](before/desktop/0.34-chase.png) · [after](after/desktop/0.34-chase.png) |

### mobile sponsor comparisons

| Sponsor / instance | Camera progress | Before width / visible probes (0px = outside capture filter) | After width / visible probes | Images |
|---|---:|---:|---:|---|
| Manaconda Racing #1 | 0.125 | 39.4px / 0/5 | 50.7px / 5/5 | [before](before/mobile/0.125-chase.png) · [after](after/mobile/0.125-chase.png) |
| Taco Bell Live Más #3 | 0.045 | 44.9px / 4/5 | 44.9px / 4/5 | [before](before/mobile/0.045-chase.png) · [after](after/mobile/0.045-chase.png) |
| Nightshift Noodles #0 | 0.278 | 179.0px / 0/5 | 130.8px / 4/5 | [before](before/mobile/0.278-chase.png) · [after](after/mobile/0.278-chase.png) |
| Voltline Industrial #0 | 0.34 | 0.0px / 0/5 | 129.7px / 4/5 | [before](before/mobile/0.34-chase.png) · [after](after/mobile/0.34-chase.png) |

[Desktop rear example before](before/desktop/0.43-rear.png) / [after](after/desktop/0.43-rear.png). [Waterfall comparison before](before/desktop/0.755-chase.png) / [after](after/desktop/0.755-chase.png).

All 54 final matching capture PNGs are retained in `before/` and `after/`. The four `audit.json` files also contain continuous full-course workload samples: 182 stations, less than 8m spacing, desktop chase/rear and portrait chase. These samples are workload/scene checks, not a claim that a screenshot was saved at every station. The inspector reviewed final normal chase, rear, portrait and waterfall images.

## Rendering and assets

| Full-course peak | V3.2 | Task A | Approved ceiling |
|---|---:|---:|---:|
| Desktop draw calls | 490 | 490 | 500 |
| Desktop visible triangles | 400,751 | 400,751 | 425,000 Task 9 |
| Portrait draw calls | 232 | 232 | 500 |
| Portrait visible triangles | 142,911 | 142,911 | 425,000 Task 9 |

Desktop sampled render memory is 153 geometries /15 textures; portrait 126/12, unchanged at matching first capture. All four 1024×512 approved sponsor assets returned HTTP200 with identical SHA-256 hashes before/after. No page/console errors in the four completed diagnostic runs. Software-renderer/browser viewport evidence does not certify physical mobile performance or G-05. No frame-time improvement is claimed; renderer workload is unchanged. Remaining draw-call headroom is ten at the desktop maximum.

## Validation, limitations and approval gates

Final command results and exact checkpoints are recorded in `validation.json` and the checkpoint addendum below. Full serial coverage validation uses supported Node22.23.3/npm10.9.9 and unchanged historical test timeouts/thresholds. No CI optimization experimentation is included.

Traffic and the driver can briefly cover portions of roadside ads; narrow portrait FOV and distant Skyline placement limit text size. This is an owner visual/playability candidate, not a guarantee of constant readability. Physical-device/G-05 remains a separate unresolved gate. Main's superseded PRD rendering limits versus approved development amendments 2.26–2.28 remain a separate governance discrepancy; no PRD reconciliation is attempted here.

Git HTTPS access works; GitHub CLI authentication/API access is unavailable. Hosted CI and draft-PR creation must be verified when a connected maintainer opens the prepared comparison. No hosted result is invented. The inherited runtime workflow only targets main-base PRs; a correction PR targeting V3.2 does not automatically establish hosted validation.

## Immutable preview publication proposal — pending owner authorization

Use the existing source-pinned preview publication pattern to add a new `/manacondas-minigame-mayhem/previews/neon-grid-task-a-001/` build with the exact candidate source SHA and `?neonGridVisual=neon-grid-task-a-001`. Build with that preview-relative Vite base and stamp `review-build.json` with exact source/path. Preserve every earlier preview and production-root bytes, run required hosted checks, then verify live HTTP200, source marker, deployed hashes and desktop/mobile startup/controls after an independently approved workflow-only publication merge.

**No workflow changes, main publication branch, deployment or live Task A URL are created by this task.** The prepared preview build is local validation only. Owner authorization for that publication is the next gate, followed by owner visual/playability review. Keep runtime correction unmerged, default T9.7 unchanged and Tasks B/C/D paused.

## Per-instance mounting inventory

All centers and normals are world-space; progress is the closest main-road projection, not a claim that distant tower centers sit on the road.

| Mesh / index | Before progress / road-relative center | After progress / road-relative center | After center | After face normal |
|---|---|---|---|---|
| `skyline-ad-manaconda-racing` #0 | 0.1034 / -11.44m | 0.0958 / 4.50m | 137.19, 18.50, -85.97 | -0.984, 0.000, -0.180 |
| `skyline-ad-manaconda-racing` #1 | 0.1672 / -20.72m | 0.1586 / 4.50m | 241.73, 18.76, -73.90 | -0.998, 0.000, 0.061 |
| `skyline-ad-manaconda-racing` #2 | 0.1999 / -21.41m | 0.1852 / 4.78m | 255.39, 18.11, -27.33 | -0.062, 0.000, 0.998 |
| `skyline-ad-manaconda-racing` #3 | 0.0520 / 3.50m | 0.0520 / 3.50m | 75.31, 17.50, -119.93 | 0.012, 0.000, -1.000 |
| `skyline-ad-manaconda-racing` #4 | 0.0760 / 3.50m | 0.0760 / 3.50m | 110.36, 17.50, -119.93 | -0.038, 0.000, -0.999 |
| `skyline-ad-manaconda-racing` #5 | 0.1349 / 5.45m | 0.1349 / 5.45m | 183.50, 19.45, -98.20 | 0.767, 0.000, -0.642 |
| `skyline-ad-manaconda-racing` #6 | 0.1837 / 5.42m | 0.1837 / 5.42m | 192.53, 18.92, -34.50 | 0.998, 0.000, 0.066 |
| `skyline-ad-taco-bell-live-mas` #0 | 0.1120 / -26.80m | 0.0990 / 4.50m | 147.07, 18.50, -164.23 | -0.988, 0.000, -0.153 |
| `skyline-ad-taco-bell-live-mas` #1 | 0.0870 / -15.92m | 0.0779 / 4.50m | 110.81, 18.50, -180.61 | 0.039, 0.000, 0.999 |
| `skyline-ad-taco-bell-live-mas` #2 | 0.0856 / -21.04m | 0.1673 / 4.41m | 150.52, 18.79, -60.27 | 0.042, 0.000, 0.999 |
| `skyline-ad-taco-bell-live-mas` #3 | 0.0600 / 3.50m | 0.0600 / 3.50m | 87.08, 17.50, -119.74 | 0.021, 0.000, -1.000 |
| `skyline-ad-taco-bell-live-mas` #4 | 0.0850 / 3.50m | 0.0850 / 3.50m | 123.37, 17.50, -120.41 | -0.028, 0.000, -1.000 |
| `skyline-ad-taco-bell-live-mas` #5 | 0.1462 / 5.45m | 0.1462 / 5.45m | 190.91, 19.46, -86.39 | 0.928, 0.000, -0.373 |
| `skyline-ad-taco-bell-live-mas` #6 | 0.1935 / 5.37m | 0.1935 / 5.37m | 190.94, 17.47, -21.04 | 0.979, 0.000, 0.203 |
| `undercity-ad-nightshift-noodles` #0 | 0.2839 / -2.96m | 0.2832 / 2.35m | 98.21, 2.35, 38.48 | 0.759, 0.000, -0.651 |
| `undercity-ad-nightshift-noodles` #1 | 0.3984 / -3.25m | 0.4069 / 2.35m | 98.50, 2.35, 89.13 | 0.748, 0.000, -0.664 |
| `undercity-ad-voltline-industrial` #0 | 0.3385 / -3.25m | 0.3450 / 2.35m | 177.67, 2.35, 63.80 | -0.752, 0.000, -0.659 |
| `undercity-ad-voltline-industrial` #1 | 0.4266 / -2.67m | 0.4301 / 2.35m | 133.27, 2.35, 97.83 | -0.072, 0.000, -0.997 |

## Built application smoke test

The local preview-relative production build entered Neon Grid through the real title → hub → character selection → race UI. The final source-pinned build reached 24km/h with desktop keyboard acceleration and 37km/h with portrait steering-wheel pointer acceleration. These values only demonstrate working controls, not comparable performance/FPS. Existing rear-view controls were exercised and screenshots retained in `playable-smoke/`. Final runs: zero page errors, zero HTTP400+ asset responses, exit0. This is browser emulation/software rendering, not a physical phone or at-speed owner acceptance.

Two earlier smoke-harness attempts failed: the harness used a nonexistent `hub` action instead of the existing `enter` action, then used a synthetic rear pointer ID without an active pointer. Both were harness errors; the corrected run used the real entry action and real pointer press/release, without modifying application code. A local development-server interruption affected the first portrait diagnostic attempt; both final portrait runs were rerun completely and exited0. The incomplete attempt is retained in `validation-logs.json`, not counted as a pass.

## Runtime checkpoint

Exact executable-source/checks/capture-tool commit: [`692e9424c2cbf15decbb467b230c02c2e10452a0`](https://github.com/Manaconda33/manacondas-minigame-mayhem/commit/692e9424c2cbf15decbb467b230c02c2e10452a0). The prepared preview build embeds this source in diagnostics and records it in [prepared-review-build.json](prepared-review-build.json); [prepared-preview-hashes.json](prepared-preview-hashes.json) describes the local build bytes, not a published delivery claim. Final documentation/evidence commit follows this runtime checkpoint without changing source or approved assets.

Smoke-harness source is archived as [playable-smoke-runner.txt](playable-smoke-runner.txt). Its absolute browser package/localhost paths describe this environment; substitute configured Playwright/base paths when reproducing. It uses browser keyboard/pointer events, not physical-device touch hardware.

Draft PR handoff: [create the runtime comparison](https://github.com/Manaconda33/manacondas-minigame-mayhem/compare/experiment%2Fneon-grid-abyss-fog-004...fix%2Fneon-grid-task-a-sponsor-visibility-20261014?expand=1), using [prepared description](draft-pr-description.md), targeting V3.2 rather than main. CLI reports an invalid injected token and GitHub API requests return Forbidden; Git HTTPS push succeeded. This is a prepared comparison, not an existing PR or a hosted validation result.

## Final local validation result

All required local commands completed with exit0. Full supported-Node22 serial coverage suite: **134 files /1,089 tests passed**, 964.65s total, 848.29s test execution. Coverage: statements92.53%, branches82.59%, functions92.86%, lines94.40%; no exclusions, threshold reductions or historical timeout changes. Baseline had133 files/1,085 tests; Task A adds one file/four substantive tests. Focused suite: one file/four passed in8.29s. Strict typecheck, zero-warning lint, production build, exact source-pinned preview-relative build, four sponsor hash/dimension validators, Git LFS and diff integrity all exit0. Complete outputs are archived in `validation-logs.json`; structured results in `validation.json`.

Final scope check: `.github`, public assets, dependency manifests/lockfile and PRD are unchanged. Main/V3.2 and both paused research remote refs remain at the recorded checkpoints. Runtime source is remotely preserved at692e942; the accompanying documentation/evidence commit changes no runtime files. No main merge, deployment, hosted PASS, owner acceptance, G-05 certification or Task B/C/D work is claimed.

The staged diff check flagged four inherited trailing-space Markdown line breaks in the roadmap copied from main. A documentation-only follow-up uses explicit `<br>` line breaks, preserving its content/rendering and allowing the complete baseline-to-candidate diff integrity gate to pass. No source or tests changed after validation.

## 2026-10-14 publication authorization and preparation checkpoint

Manny explicitly approved isolated preview publication after reviewing the Task A handoff. This supersedes the earlier pending-publication-authorization statements in this historical packet; visual/playability acceptance remains pending. Exact source remains692e942. Workflow-only branch `preview/neon-grid-task-a-001` at `5cd90add7c23cf7c06ec2f077a5668672d312d96` is pushed from main54f422a, changes only `ci.yml`, preserves all22 historical preview entries and production/check/trust identities, and adds complete public-byte/source/base verification for the new path. New Task A row has30 minutes to complete full hosted serial coverage before its initial build; historical rows retain15 minutes and test timeouts/thresholds are unchanged.

Local publication validation passed105 files/834 main tests,32 CI regressions, typecheck/lint/build/LFS/diff checks and actual inline-script assembly/manifest fixtures with HTTP404/hash-mismatch negative controls. The already validated Task A runtime remains134 files/1,089 tests. Fixture preservation is not live delivery proof. Automated draft PR creation returned GitHub API Forbidden. No hosted run, merge, deployment or live Task A URL exists yet.

[Open the publication comparison](https://github.com/Manaconda33/manacondas-minigame-mayhem/compare/main...preview%2Fneon-grid-task-a-001?expand=1) using [prepared PR description](publication-pr-description.md). Full checkpoint details, exits and limitations are in [publication-preparation.json](publication-preparation.json), with [validation logs](publication-validation-logs.json). Owner publication authorization is already granted; do not ask again. Required next external action is PR creation through an authenticated maintainer, followed by successful hosted checks and live verification after publication. Runtime adoption, production gameplay, Tasks B/C/D and owner visual acceptance remain unauthorized.

## PR #306 hosted checkpoint — 2026-10-14 America/Chicago

Manny created [publication PR #306](https://github.com/Manaconda33/manacondas-minigame-mayhem/pull/306), targeting main at exact publication head5cd90add7c23cf7c06ec2f077a5668672d312d96. [Hosted run38658365026](https://github.com/Manaconda33/manacondas-minigame-mayhem/actions/runs/38658365026) is **in progress**. Independently observed public checks: required `validate` PASS1m48s, preview-plan PASS17s, spillway-render PASS39s. The new pinned Task A preview job116173539711 and full workflow have not completed at this checkpoint. Main remains54f422a and no live Task A URL is claimed. This supersedes the earlier PR-creation blocker; API merge access remains Forbidden. Wait for all applicable checks, then perform the already-authorized workflow-only publication merge; afterwards verify live source/base marker, complete delivery hashes and desktop/portrait controls. Owner visual/playability acceptance remains pending.

## Authorized merge and network-verification checkpoint — 2026-10-14 America/Chicago

PR306 merged at [`4e7607368e0dbea04ee8c76435fa9977bb63ff6a`](https://github.com/Manaconda33/manacondas-minigame-mayhem/commit/4e7607368e0dbea04ee8c76435fa9977bb63ff6a), 2026-10-14 19:29:40 America/Chicago. Its exact-head [CI38658365026](https://github.com/Manaconda33/manacondas-minigame-mayhem/actions/runs/38658365026) completed **Success in19m33s**. Comparing previous main54f422a to merged main4e76073 confirms only `ci.yml` changed; no runtime or artwork entered production. Both paused research refs remain unchanged.

[Main publication run38660334001](https://github.com/Manaconda33/manacondas-minigame-mayhem/actions/runs/38660334001) is **in progress** at this checkpoint, with validate PASS1m42s and preview-plan PASS9s; assembly and deployment are not yet complete. Independent producer38660334010 is a separate routine workflow, not renewed CI research. No final Pages result is claimed.

Live-site verification is additionally **BLOCKED by destination policy**: proxy CONNECT to `manaconda33.github.io` returns403, and the selected worker network policy omits both that host and `api.github.com`. This is not an origin HTTP404, not proof that deployment failed, and not independent proof that GitHub API credentials are invalid. Existing Git HTTPS/public github.com access remains functional. A supported configuration draft adding exactly these two custom destinations is saved and requires user review/save/publish; no bypass, secret change or broadened wildcard is used. Saving the draft does not apply the network change.

Prepared [live-byte runner](live-byte-verification-runner.txt) will verify410 real public files against the validated pinned build, with the workflow's exact JSON marker metadata; `.gitkeep` remains excluded. [Live browser runner](live-playable-smoke-runner.txt) preserves the inherited proxy and will exercise actual desktop/portrait race entry, acceleration and rear view. These runners have not executed against the live site. After network access and Pages completion, finish hashes, production/earlier-preview preservation evidence and real browser controls before claiming a working verified preview. Publication approval is already granted; appearance/playability remains Manny's decision.


## Final published preview verification — 2026-10-14 America/Chicago

PR #306 is merged and main Pages run 38660334001 completed successfully. Hosted delivery artifacts confirm all 410 Task A files and the source/base marker match the prepared preview, every expected route returned HTTP 200, and the production root plus earlier immutable previews passed preservation checks. Current-session desktop/mobile live playable smoke is blocked: the configured proxy refuses connections, and Chromium exits before navigation with a Crashpad permission error. Full evidence and limitations are recorded in [live-verification-2026-10-15.md](live-verification-2026-10-15.md). Owner visual/playability acceptance remains pending.
