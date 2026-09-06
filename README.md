# Manaconda's Minigame Mayhem

Manaconda's Minigame Mayhem is a modular HTML5 minigame collection whose first playable experience is a 3D kart racer with illustrated 2D drivers inside stylized 3D karts. The approved requirements baseline is Product Requirements Document v1.1.

The canonical repository `Manaconda33/manacondas-minigame-mayhem` is intentionally public. Publication and deployment changes remain approval-gated under the PRD workflow.

## Current state

**Current slice:** Slice 5 - Item Boxes, Weapons & Position-Based Distribution — active.

Slice 3 Character Selection & Avatar Ingestion is complete and live accepted. The competitive Grand Prix systems defined for Slice 4 were completed earlier because of a documented sequencing error and remain retained. Slice 5 foundation, visible item boxes, roulette, held-item HUD, desktop/mobile ITEM input, and RacerEffects + Nitro Surge are merged, deployed, and live accepted. The currently approved bounded Slice 5 increment is Ricochet Kinetic Disc with shared projectile/spinout foundations, Circuit Alpha guardrails, racer-to-guardrail collisions, and perspective-correct chase/rear spinout presentation. All other item effects, hazards, Rocket autopilot, and AI tactical item use remain later Slice 5 work.

Implementation and review must continue against `docs/SLICE-5-ITEM-SYSTEM-DESIGN.md`, `docs/IMPLEMENTATION-STATUS.md`, and `docs/TESTING.md`. Slice 6 remains locked until Slice 5 is fully validated, deployed, and live accepted.

## Live test build

[Open the latest GitHub Pages checkpoint](https://manaconda33.github.io/manacondas-minigame-mayhem/)

Every Slice 1+ checkpoint is deployed through the repository's `github-pages` environment for product-owner manual confirmation.

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
- [Testing and evidence requirements](docs/TESTING.md)
- [Approved Slice 5 item-system design and exit checklist](docs/SLICE-5-ITEM-SYSTEM-DESIGN.md)
- [Restricted Work Git LFS publication](docs/LFS-PUBLISHING.md)
- [Avatar intake and approval contract](docs/AVATAR-INTAKE.md)
- [Roster profile allocation](docs/ROSTER-MAPPING.md)

Future work sessions must read these files before implementation, update them as decisions and evidence change, and execute only the currently approved slice.

## Binary asset policy

`.gitattributes` keeps the PRD's 256 x 256 avatar portraits and 512 x 512 driver frames in normal Git at their runtime paths. Production GLB/GLTF support binaries, common production audio formats, and high-resolution PNG/WebP source art remain in Git LFS. Do not place high-resolution masters in the runtime portrait or driver-frame paths. Policy changes require an approved record in `docs/DECISIONS.md`.

When a hosted Work shell cannot reach GitHub, `docs/LFS-PUBLISHING.md` defines the approved GitHub Actions fallback for assets that committed source can reproduce byte-for-byte. Other LFS assets require an authenticated external handoff.
