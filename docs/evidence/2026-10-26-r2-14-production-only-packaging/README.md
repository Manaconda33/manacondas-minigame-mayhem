# R2.14 — Production-only Pages packaging candidate

**Status:** isolated review candidate only. No merge, deployment, preview retirement, or formal v1 release acceptance is authorized by this record.

**Baseline:** `main` at `42bac750bbb1fa5387ed3cbc888b4c1783943742`, verified from `origin/main` before branch creation.

## Production feature completeness

This is a source-and-requirements inventory, not a new gameplay acceptance test and not the final PRD §37 closure ledger. Existing owner approvals remain accepted; unresolved release evidence is tracked separately in the R2 checklist.

| Significant feature | Production evidence | Disposition |
| --- | --- | --- |
| Title, Hub, track selection | `src/app/mountAppShell.ts`; Circuit Alpha is initialized as the default and both track cards are presented | Present and approved in production |
| Circuit Alpha and Neon Grid | `src/game/track/trackCatalog.ts`, `CircuitAlpha.ts`, `NeonGrid.ts`, `createNeonGridScene.ts`; Neon Grid uses the approved C2 concrete, Fog V3.2, and owner-edited layout | Present and approved in production |
| Kart physics, collision, validated race progress, laps and results | `src/game/physics/`, `src/game/race/`, `src/game/KartTimeTrial.ts`, Results UI | Present and approved in production |
| Eight-racer grid and AI navigation/hazard behavior | `src/characters/raceRoster.ts`, `src/game/ai/`, race and item integration tests | Present and approved in production |
| Character roster and karts | `src/characters/manifest.ts`, `src/characters/raceRoster.ts`, `public/assets/characters/`; fourteen approved selectable characters including Archer and Lunarcrystal | Present and approved in production |
| Drift, surfaces, boosts, and items | `src/game/physics/`, `src/game/items/`, `src/game/vfx/`; the production item catalog defines fifteen items | Present and approved in production |
| HUD, touch controls, settings, Results/Podium | `src/app/`, `src/ui/`, `src/config/`; existing owner desktop/mobile approvals remain recorded | Present and approved in production |
| Music and sound | `src/audio/`, `public/assets/audio/`; WAV remains the default and the approved Opus option remains opt-in | Present and approved in production |
| Rendering and approved track presentation | `src/game/rendering/`, `src/game/track/`; accepted visual composition is retained | Present and approved in production |
| Historical fog alternatives, earlier track layouts, and material A/Bs | Immutable preview source pins and markers in `.github/workflows/ci.yml`; alternatives are review history, not production requirements | Historical/experimental; do not import as feature parity |
| Scratched Painted Metal 01 on Falls Run cladding | Rejected owner decision preserved in PRD amendment 2.33 history and `docs/DECISIONS.md` | Rejected; intentionally excluded |
| Internal Neon Grid Layout Studio | Source-pinned PR review build and historical `/previews/neon-grid-layout-studio/` path | Deferred; not needed for current production runtime |
| Additional original minigames, Jamverse, Godot rebuild, player-facing track editor, Stage C automation | PRD's future/deferred direction | Intentionally deferred; Stage C remains `PREPARED_DISABLED` |

No approved production functionality was identified as missing from the current built game in this bounded inventory. This does not close the remaining item-by-item §37 reconciliation or convert prior owner acceptance into new evidence. A detailed requirement that is found missing during owner review is a blocker; this candidate does not authorize gameplay changes.

## Publication dependency audit

The stable required `validate` job and `preview-plan` remain. Full pull-request validation still includes LFS verification, strict typecheck, zero-warning lint, coverage tests, and the production build. Preview source validation remains on pull requests: the 25-row pinned Neon Grid preview matrix, Task C1 pinned validation, the four pinned-runtime validations, spillway rendering, the source-pinned Layout Studio build, and the owner-layout playtest build. Their source pins, marker checks, asset hashes, and build/test contracts remain intact. These independent review checks no longer run again on a `main` push solely to feed the Pages package.

The new assembly job uses the validated production build only. It rejects a `previews/` directory in the candidate root, inventories all production files except exact `.gitkeep` placeholders, hashes every file, and checks unchanged public production files against the live site before publication. The exact path/hash exceptions and rebuilt entrypoint rules are unchanged. On a pull request it uploads the Pages candidate and manifest as review artifacts; the `deploy` job remains restricted to a push on `main`. Post-deployment verification checks every production delivery path and exact byte count/SHA-256. There is no wildcard asset exemption.

If later authorized and merged, the normal main-push workflow will deploy the production-only root and the listed preview paths will stop serving their old content. This PR does not merge, deploy, or alter those live URLs.

## Packaging measurements

All quantities below are bytes, not player-network transfer measurements.

| Measurement | Result | Provenance |
| --- | ---: | --- |
| Existing published `github-pages` artifact | 5,164,346,802 | Actions artifact `12668110878`, run `40355995777`, source `42bac750bbb1fa5387ed3cbc888b4c1783943742`, SHA-256 `47ff69f692774c121cd7c25a80aabec0104865a49e6957921c13676c77048d30` |
| Existing `production-dist` Actions artifact archive | 211,506,207 | Artifact `12667400184`, run `40355995777`; this is an uploaded ZIP size, not the extracted production root size |
| Clean source-stamped local production root | 234,304,568 bytes across 417 delivery files | `GITHUB_SHA=42bac750bbb1fa5387ed3cbc888b4c1783943742 npm run build`; no preview directory; 42 materialized GLBs, 163 character PNGs, approved SFX/music/track checks passed |
| Hosted assembled production-only root | 234,304,563 bytes across 417 delivery files | PR run `40367669895`; root passed the no-preview inventory checks, but assembly failed before candidate upload because its delivery-verifier script was not checked out |
| Production-only Pages candidate artifact | Pending hosted pull-request run | Record the exact Pages artifact ID/size and calculate reduction against the existing `github-pages` artifact before final review |

The existing artifact is the 5.16 GB Pages package, not a game transfer measurement. The old Pages package's incremental contents include historical preview builds; not every byte has been independently decompressed and attributed in this checkpoint. The local production root is a directory measurement, so it must not be compared to the existing compressed Actions ZIP as if they were like-for-like. The 417-path SHA-256/byte inventory is preserved in [production-root-manifest.json](production-root-manifest.json); `SHA256SUMS` protects the evidence files. The exact candidate Pages artifact will provide the like-for-like comparison.

## Isolated browser startup smoke

The locally built production root was served at the expected `/manacondas-minigame-mayhem/` base path and opened in Chromium 151.0.7922.173 on Debian GNU/Linux 13 x86_64. The browser was headless with ANGLE SwiftShader software WebGL2; WebGPU was disabled. The Title/Hub loaded, Circuit Alpha remained the default, both track choices appeared, the character selection and confirm action worked, and both track race scenes reached the dismissed loading stage with the race HUD and lap `1 / 3` rendered. Each drawing buffer was 1280×720. The browser recorded zero console errors, HTTP errors, or failed asset requests.

This is a software-rendered startup check only. It is not physical-GPU performance evidence, G-05 certification, or a full-race retest. The machine-readable results and screenshots are in this directory: [browser-smoke.json](browser-smoke.json), [Circuit Alpha capture](circuit-alpha-chromium-software-smoke.png), and [Neon Grid capture](neon-grid-chromium-software-smoke.png).

## Historical public preview paths affected by a production-only deployment

All 25 pinned preview rows in the current CI matrix are currently part of Pages assembly. The two additional source-pinned tools are the Layout Studio and owner-layout playtest. These links remain live unless a separately approved deployment replaces the site root.

1. [Neon Grid](https://manaconda33.github.io/manacondas-minigame-mayhem/previews/neon-grid/)
2. [Neon Grid 5.3](https://manaconda33.github.io/manacondas-minigame-mayhem/previews/neon-grid-5-3/)
3. [Service Tunnel](https://manaconda33.github.io/manacondas-minigame-mayhem/previews/neon-grid-tunnel/)
4. [Billboard](https://manaconda33.github.io/manacondas-minigame-mayhem/previews/neon-grid-billboard/)
5. [Waterfall Dive](https://manaconda33.github.io/manacondas-minigame-mayhem/previews/neon-grid-dive/)
6. [Far300](https://manaconda33.github.io/manacondas-minigame-mayhem/previews/neon-grid-far300/)
7. [T9.2](https://manaconda33.github.io/manacondas-minigame-mayhem/previews/neon-grid-t9-2/)
8. [T9.3](https://manaconda33.github.io/manacondas-minigame-mayhem/previews/neon-grid-t9-3/)
9. [T9.3 correction](https://manaconda33.github.io/manacondas-minigame-mayhem/previews/neon-grid-t9-3-correction/)
10. [T9.4](https://manaconda33.github.io/manacondas-minigame-mayhem/previews/neon-grid-t9-4/)
11. [T9.5](https://manaconda33.github.io/manacondas-minigame-mayhem/previews/neon-grid-t9-5/)
12. [T9.5 correction](https://manaconda33.github.io/manacondas-minigame-mayhem/previews/neon-grid-t9-5-correction/)
13. [T9.5 sightline](https://manaconda33.github.io/manacondas-minigame-mayhem/previews/neon-grid-t9-5-sightline/)
14. [T9.5 portals](https://manaconda33.github.io/manacondas-minigame-mayhem/previews/neon-grid-t9-5-portals/)
15. [T9.5 owner correction](https://manaconda33.github.io/manacondas-minigame-mayhem/previews/neon-grid-t9-5-owner-correction/)
16. [T9.6 diagnostics](https://manaconda33.github.io/manacondas-minigame-mayhem/previews/neon-grid-t9-6-diagnostics/)
17. [T9.7](https://manaconda33.github.io/manacondas-minigame-mayhem/previews/neon-grid-t9-7/)
18. [T9.7 city-ground correction](https://manaconda33.github.io/manacondas-minigame-mayhem/previews/neon-grid-t9-7-city-ground/)
19. [T9.7 environment correction](https://manaconda33.github.io/manacondas-minigame-mayhem/previews/neon-grid-t9-7-environment-correction/)
20. [Abyss Fog 001](https://manaconda33.github.io/manacondas-minigame-mayhem/previews/neon-grid-abyss-fog-001/)
21. [Abyss Fog 002](https://manaconda33.github.io/manacondas-minigame-mayhem/previews/neon-grid-abyss-fog-002/)
22. [Abyss Fog V3.2 review build](https://manaconda33.github.io/manacondas-minigame-mayhem/previews/neon-grid-abyss-fog-004/)
23. [Task A](https://manaconda33.github.io/manacondas-minigame-mayhem/previews/neon-grid-task-a-001/)
24. [Task C1](https://manaconda33.github.io/manacondas-minigame-mayhem/previews/neon-grid-task-c1-001/)
25. [C2 concrete](https://manaconda33.github.io/manacondas-minigame-mayhem/previews/neon-grid-c2-concrete/)
26. [Layout Studio](https://manaconda33.github.io/manacondas-minigame-mayhem/previews/neon-grid-layout-studio/)
27. [Owner-layout playtest](https://manaconda33.github.io/manacondas-minigame-mayhem/previews/neon-grid-owner-layout/)

README and evidence documents contain selected links to these paths. No link edits are made while the current published previews remain available. Any later retirement should include a link inventory/reconciliation before publication, without deleting historical source, exports, manifests, or evidence.

## Validation, status, and rollback

The source-stamped production build and all asset/provenance verifiers passed. The production-only root collected 417 delivery files. Local pre-publication live HTTPS comparison completed successfully. `git lfs fsck`, typecheck, and zero-warning lint passed. Focused Pages/CI regression tests passed (37/37); the isolated skyline test passed (14/14); standalone Stage B and Stage C native matrices passed (100/100 and 25/25). Hosted PR run `40367669895` passed `validate`, including full tests and build, and the pinned spillway render. Its production-only root had no previews, but assembly stopped because the new job had not checked out the delivery verifier. The candidate artifact was not uploaded and deploy was skipped. A checkout step and regression assertion are now added for the follow-up hosted run; no safeguards were bypassed.

The local full-coverage attempt was stopped after more than 26 minutes in this constrained environment. Before stopping, it reported failures in the native Stage B matrix, the native Stage C matrix, and `tests/neon-grid-stage4-task9-skyline.test.ts` (`uses instance tint on Neon Grid city batches without requiring absent vertex colors`, observed 35.4 seconds in the full run). Both native matrices pass when invoked directly (100/100 and 25/25), and the isolated skyline test file passes (14/14). The full local run is therefore recorded as incomplete, not PASS. No test or timeout was changed. The hosted PR `validate` job is the full-suite PASS; the assembly correction is waiting for its follow-up hosted run.

The candidate does not alter runtime source, public assets, game defaults, or gameplay. Production root file preservation is measured by the unchanged-file live SHA-256 preflight and the post-deploy exact delivery manifest. The candidate is not byte-identical to a prior Actions Pages ZIP claim; archive sizes are measured from the actual uploaded artifacts.

No deployment has occurred from this branch. If this candidate is later authorized for production, the currently published Pages site is the immediate fallback until the first production-only deployment. Re-deploying the prior `main` source can restore the full previous site layout, but that would create a new workflow deployment; it is not the same as an immutable Pages artifact rollback. The private recovery archives and owner-approved v1 backup exception are recorded separately in the [R2.13A/B/C evidence summary](../2026-10-26-r2-13-backup-owner-exception/README.md). Formal v1 acceptance remains pending PRD §37 reconciliation.
