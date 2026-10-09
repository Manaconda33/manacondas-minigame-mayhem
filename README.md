# Manaconda's Minigame Mayhem

Manaconda's Minigame Mayhem is a modular HTML5 minigame collection whose first playable experience is a 3D kart racer with illustrated 2D drivers inside stylized 3D karts. The approved requirements baseline is Product Requirements Document v1.1.

The canonical repository `Manaconda33/manacondas-minigame-mayhem` is intentionally public. Publication and deployment changes remain approval-gated under the PRD workflow.

## Current state (October 8, 2026)

**Production game:** The GitHub Pages root continues to serve the owner-accepted Circuit Alpha kart racer with the Route Night title/hub, character selection, HUD, results, audio and effects. Slice 3 character/asset ingestion and Slice 5 items are accepted. Slice 6's accepted UI and presentation checkpoints remain documented in [Implementation Status](docs/IMPLEMENTATION-STATUS.md) and [Testing](docs/TESTING.md). Neon Grid gameplay is **not deployed to the production root**.

**Current development:** Neon Grid Circuit 02 is in Stage 4, Task 9 (course-wide visual completion). **T9.5, Full-Course Lifecycle & Masking including the Billboard and Service Tunnel owner corrections, is OWNER APPROVED** on October 8, 2026, for the exact pinned gameplay runtime `9b973d48c1115d4b35d3936a3eacbed8dbb7ed76`. Earlier rejected T9.5 previews and their defect evidence remain historical; the newest owner acceptance supersedes their pending-status labels for this specific checkpoint.

The accepted T9.5 correction restores approved Manaconda Racing/Taco Bell billboard artwork along the opaque roadside camouflage, mounts the approved non-colliding **DO NOT ENTER** graphics to both true Service Tunnel wall-end portals with connected frames and correct face orientation, and retains legal shortcut approaches and deep-road masking. Full-source [CI](https://github.com/Manaconda33/manacondas-minigame-mayhem/actions/runs/37826321830) passed **130 test files / 1,039 tests** and the inherited render gates; its 34 full-course captures reported **206 maximum draw calls** (target 200, T9.5 blocking limit 220), **164,806 visible triangles**, zero reported render errors and 300 scored software frames. Those software-render results do **not** establish representative-hardware FPS certification.

**Release separation:** The immutable [T9.5 owner-reviewed gameplay preview](https://manaconda33.github.io/manacondas-minigame-mayhem/previews/neon-grid-t9-5-owner-correction/?review=9b973d4) was published by workflow-only PR [#282](https://github.com/Manaconda33/manacondas-minigame-mayhem/pull/282). [Post-merge Pages verification](https://github.com/Manaconda33/manacondas-minigame-mayhem/actions/runs/37857511926) passed exact source, approved asset and unchanged production-byte checks. Development remains on `design/neon-grid-circuit-02`; runtime PR [#242](https://github.com/Manaconda33/manacondas-minigame-mayhem/pull/242) is **draft/unmerged**. T9.5 approval does not authorize that runtime merge or production publication.

**T9.6 owner authorization and verified source:** Manny approved execution of T9.6 on October 8. Exact-source [CI 37862136028](https://github.com/Manaconda33/manacondas-minigame-mayhem/actions/runs/37862136028) passed 131 Vitest files / 1,041 tests, six independent Node certification-checker tests, strict typecheck, zero-warning lint, production build and all inherited Task 8/9 render gates. Runtime source c8c65f428fcfbc5236bbebf70ab5f98a9f7671bf improves opt-in hardware capture metadata and adds an offline analyzer; it does not certify representative GPU FPS by itself.

**Isolated diagnostic preview:** Workflow-only [PR #283](https://github.com/Manaconda33/manacondas-minigame-mayhem/pull/283) passed [CI 37862150928](https://github.com/Manaconda33/manacondas-minigame-mayhem/actions/runs/37862150928) and merged to main at 23c2b97d800a7b7ee9d401d586785d9c24656a11. [Post-merge Pages run 37864780112](https://github.com/Manaconda33/manacondas-minigame-mayhem/actions/runs/37864780112) **PASSED**: live HTTP 200 and exact source/file hashes verified for the isolated diagnostics preview, approved signage, and unchanged production-root files. [Open the pinned T9.6 diagnostic-only build](https://manaconda33.github.io/manacondas-minigame-mayhem/previews/neon-grid-t9-6-diagnostics/?review=c8c65f4&testRacePerf=1). Runtime PR #242 remains draft/unmerged.

**What remains:** Collect three actual representative-hardware three-lap eight-racer Medium 1920×1080 races, certify median ≥60 FPS and p95 ≤18.3ms against raw capture data, and resolve or explicitly review the 206-call peak against the 200-call engineering target. T9.6 remains **IN PROGRESS / NOT HARDWARE CERTIFIED**. T9.7 final owner preview and deferred Skyline building/city-ground polish have not begun. PRD v1.1 / approved amendment 2.25 remains authoritative. See [T9.6 evidence and hardware instructions](docs/evidence/2026-10-08-neon-task9-t9-6/progress.md), [Task 9 plan](docs/design/neon-grid/task9-coursewide-visual-plan.md), and [implementation status](docs/IMPLEMENTATION-STATUS.md).

## Builds and previews

- [Production Circuit Alpha / game hub](https://manaconda33.github.io/manacondas-minigame-mayhem/) — accepted live game; **does not yet include Neon Grid gameplay**.
- [Owner-approved Neon Grid T9.5 pinned preview](https://manaconda33.github.io/manacondas-minigame-mayhem/previews/neon-grid-t9-5-owner-correction/?review=9b973d4) — standalone review build at source `9b973d48c1115d4b35d3936a3eacbed8dbb7ed76`, **not the production root**.
- [T9.6 hardware-diagnostics preview](https://manaconda33.github.io/manacondas-minigame-mayhem/previews/neon-grid-t9-6-diagnostics/?review=c8c65f4&testRacePerf=1) — immutable source c8c65f4, live Pages delivery verified; opt-in real-race capture, **not hardware-certified nor a gameplay production release**.

The PRD requires owner-reviewable GitHub Pages checkpoints. Workflow-only preview publication keeps earlier preview pins and deployed production runtime unchanged until a separately authorized release.

## Local setup

Prerequisites:

- Node.js 22 or newer compatible release
- npm
- Git LFS before adding production binary assets

```bash
git lfs install
npm ci
npm run dev
```

Vite prints the local development URL when the server starts.

## Commands

| Command                | Purpose                                              |
| ---------------------- | ---------------------------------------------------- |
| `npm run dev`          | Start the Vite development server.                   |
| `npm run build`        | Typecheck and create a production build in `dist/`.  |
| `npm run typecheck`    | Run strict TypeScript validation.                    |
| `npm run lint`         | Run ESLint with zero warnings permitted.             |
| `npm run test`         | Run Vitest in watch mode.                            |
| `npm run test:ci`      | Run Vitest once with coverage for CI.                |
| `npm run format`       | Apply Prettier formatting.                           |
| `npm run format:check` | Verify formatting without changing files.            |
| `npm run validate`     | Run typecheck, lint, CI tests, and production build. |

## Architecture summary

- **Application:** TypeScript single-page application built by Vite.
- **Rendering baseline:** Three.js.
- **Physics baseline:** Rapier 3D through `@dimforge/rapier3d-compat`.
- **Audio baseline:** Howler.js backed by Web Audio.
- **Testing:** Vitest with jsdom and V8 coverage.
- **Quality gates:** strict TypeScript, ESLint, Prettier, unit tests, production build, and GitHub Actions.
- **Asset governance:** Fixed-size runtime avatar PNGs live in normal Git. Git LFS remains required for production 3D models, audio, and high-resolution source art.
- **Continuity:** repository documents are authoritative; Cowork/chat history is supplemental.

The `src/game/` directories define PRD system boundaries. A directory's presence is not evidence that the corresponding slice is complete; completion requires the repository's recorded validation and product-owner acceptance evidence.

## Repository map

- `docs/` - approved PRD, working Markdown PRD, decisions, testing rules, slice designs/checklists, and implementation status.
- `public/assets/` - governed asset roots for characters, karts, track, items, and audio.
- `src/app/` - game-hub application shell.
- `src/audio/` - shared audio integration boundary.
- `src/config/` and `src/schemas/` - configuration and validation boundaries.
- `src/game/` - gameplay systems organized by domain.
- `src/ui/` - interface and HUD boundary.
- `tests/` - automated test suite.
- `.github/workflows/` - repository CI and deployment workflows.

## Project source of truth

- [Approved implementation PRD](docs/PRD.md)
- [Word PRD v1.1](docs/Manacondas_Minigame_Mayhem_PRD_v1.1.docx)
- [Architecture decisions](docs/DECISIONS.md)
- [Current implementation status](docs/IMPLEMENTATION-STATUS.md)
- [Neon Grid Stage 4 Task 9 execution plan](docs/design/neon-grid/task9-coursewide-visual-plan.md)
- [Approved T9.5 correction evidence and owner signoff](docs/evidence/2026-10-07-neon-task9-t9-5/progress.md)
- [T9.5 owner correction plan and closure](docs/design/neon-grid/t9-5-portal-and-signage-owner-correction-plan-2026-10-08.md)
- [Canonical Route Night visual reference](docs/reference/route-night/ROUTE-NIGHT-CANONICAL-REFERENCE.png)
- [Production asset provenance ledger](docs/ASSET-PROVENANCE.md)
- [Route Night UI asset library](docs/ROUTE-NIGHT-UI-ASSET-LIBRARY.md)
- [Slice 6 Circuit Alpha PBR checkpoint](docs/SLICE-6-CIRCUIT-ALPHA-PBR-PASS-2026-09-18.md)
- [Slice 6 Route Night UI checkpoint](docs/SLICE-6-ROUTE-NIGHT-UI-CHECKPOINT-2026-09-18.md)
- [Slice 6 Character Select checkpoint](docs/SLICE-6-CHARACTER-SELECT-CHECKPOINT-2026-09-19.md)
- [Slice 6 Race HUD / Results-Podium design brief](docs/SLICE-6-RACE-HUD-RESULTS-PODIUM-DESIGN-2026-09-19.md)
- [Slice 6 Race HUD / Results-Podium implementation plan](docs/superpowers/plans/2026-09-19-race-hud-results-podium.md)
- [Testing and evidence requirements](docs/TESTING.md)
- [Approved Slice 5 item-system design and exit checklist](docs/SLICE-5-ITEM-SYSTEM-DESIGN.md)
- [Approved Slice 5 Shockwave scope](docs/SLICE-5-SHOCKWAVE-SCOPE.md)
- [Approved Slice 5 Ink Splat scope](docs/SLICE-5-INK-SPLAT-SCOPE.md)
- [Approved Slice 5 Nitro Overdrive scope](docs/SLICE-5-NITRO-OVERDRIVE-SCOPE.md)
- [Approved Slice 5 Hyper-Drive Rocket scope](docs/SLICE-5-HYPER-DRIVE-ROCKET-SCOPE.md)
- [Accepted Slice 5 full AI item tactics scope](docs/SLICE-5-AI-ITEM-TACTICS-SCOPE.md)
- [Restricted Work Git LFS publication](docs/LFS-PUBLISHING.md)
- [Avatar intake and approval contract](docs/AVATAR-INTAKE.md)
- [Roster profile allocation](docs/ROSTER-MAPPING.md)

Future work sessions must read these files before implementation, update them as decisions and evidence change, and execute only the currently approved slice.

## Binary asset policy

`.gitattributes` keeps the PRD's 256 x 256 avatar portraits, 512 x 512 driver frames, and approved Character Select full-body delivery PNGs in normal Git at their runtime paths. Production GLB/GLTF support binaries, common production audio formats, and high-resolution PNG/WebP source art remain in Git LFS. Do not place high-resolution masters in the runtime avatar delivery paths. Policy changes require an approved record in `docs/DECISIONS.md`.

When a hosted Work shell cannot reach GitHub, `docs/LFS-PUBLISHING.md` defines the approved GitHub Actions fallback for assets that committed source can reproduce byte-for-byte. Other LFS assets require an authenticated external handoff.
