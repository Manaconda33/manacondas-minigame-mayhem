# Manaconda's Minigame Mayhem

A modular HTML5 minigame hub built around a 3D kart racer with illustrated 2D avatar drivers, character-specific karts, items, AI opponents, and the neon-lit **Route Night** presentation.

**Status updated: October 26, 2026.** Circuit Alpha remains the default race track; Neon Grid is available as a second selectable track with its owner-approved C2 concrete, Fog V3.2, and edited city layout. [`docs/PRD.md`](docs/PRD.md) is the product specification (approved v1.1 baseline plus recorded amendments); GitHub code, [implementation status](docs/IMPLEMENTATION-STATUS.md), and [test evidence](docs/TESTING.md) establish what has actually shipped. Manny's prior gameplay, desktop/mobile, and five-restart approvals remain accepted. G-05 and the v1 rollback/backup gate are **OWNER ACCEPTED BY EXCEPTION**, with original technical requirements retained for future engineering. Pages packaging assessment and item-by-item §37 reconciliation remain open; formal v1 release acceptance is not declared. See the [Release Readiness R2 checklist](docs/evidence/2026-10-23-release-readiness-r1/r2-evidence-checklist.md) and [R2.13A/B/C recovery evidence summary](docs/evidence/2026-10-26-r2-13-backup-owner-exception/README.md). No further visual refinement is in scope without new owner direction.

## Play and review

| Experience | Link | Status |
| --- | --- | --- |
| **Production game / track selection** | [Play on GitHub Pages](https://manaconda33.github.io/manacondas-minigame-mayhem/) | Circuit Alpha is the default; choose Neon Grid from the hub to race its approved C2 + Fog V3.2 + owner-edited layout |
| **Neon Grid: T9.7 baseline** | [Owner-approved visual preview](https://manaconda33.github.io/manacondas-minigame-mayhem/previews/neon-grid-t9-7-environment-correction/) | Historical review of that exact preview; production now uses the later approved owner-edited layout |
| **Neon Grid: Task A sponsor visibility** | [Owner-approved review preview](https://manaconda33.github.io/manacondas-minigame-mayhem/previews/neon-grid-task-a-001/?neonGridVisual=neon-grid-task-a-001) | Historical review preview; its Task A Fog V3.2 treatment is included in the selectable production track |
| **Neon Grid: Abyss Fog B1** | [First fog experiment](https://manaconda33.github.io/manacondas-minigame-mayhem/previews/neon-grid-abyss-fog-001/?neonGridVisual=abyss-fog-001) | Owner-rejected visual experiment; retained for A/B evidence |
| **Neon Grid: Abyss Fog B2** | [Corrected fog review candidate](https://manaconda33.github.io/manacondas-minigame-mayhem/previews/neon-grid-abyss-fog-002/?neonGridVisual=abyss-fog-002) | Separate opt-in candidate; no independent owner visual approval is recorded. The later V3.2 playable review covered V3.2 only. |

**Track selection:** The hub presents Circuit Alpha and Neon Grid as separate playable choices. Circuit Alpha remains the default selection. Neon Grid loads the owner-approved C2 concrete coverage, Task A Fog V3.2, and edited layout; preview-only fog experiments remain separate from this production composition.

**Forward graphics plan:** [Post-fog billboard recovery, selective materials, and adaptive performance roadmap](docs/superpowers/plans/2026-10-13-neon-grid-post-fog-graphics-roadmap.md). The selected Neon Grid production appearance uses owner-approved C2 concrete coverage and Fog V3.2. The v1 G-05 gate is OWNER ACCEPTED BY EXCEPTION under PRD amendment 2.32; original performance targets remain for future engineering, and the exception is not an unconditional technical PASS.

## Current engineering status

| Workstream | Verified state | Next approval / evidence gate |
| --- | --- | --- |
| **Game hub and Circuit Alpha** | Slice 6 work is live: title/hub, settings, character selection, racing HUD/minimap, Results/Podium, Route Night audio and visual polish. Slice 3 character ingestion and Slice 5 item systems are accepted. | Applicable Slice 6 acceptance and remaining §37 release evidence remain tracked in [implementation status](docs/IMPLEMENTATION-STATUS.md). |
| **Neon Grid / Circuit 02** | Selectable production track with owner-approved C2 Concrete Wall 007 coverage, Task A Fog V3.2, and the edited city layout; Circuit Alpha remains default. The broader [runtime PR #242](https://github.com/Manaconda33/manacondas-minigame-mayhem/pull/242) remains draft/unmerged for continued development. | The G-05 v1 gate is OWNER ACCEPTED BY EXCEPTION under amendment 2.32; original technical targets remain for future engineering. |
| **Fog-city replacement experiment** | B1 was owner-rejected and PR #292 is closed unmerged. B2 is a separate candidate with no independent owner approval. The later V3.2 playable-review PASS applies only to V3.2; it does not approve B1 or B2 to replace T9.7. | Keep T9.7 as the approved baseline. B1/B2 replacement and production integration require separate approval. G-05 technical results remain distinct from the v1 owner exception. |
| **Release recovery and packaging** | The v1 rollback/backup gate is OWNER ACCEPTED BY EXCEPTION under PRD amendment 2.33. The exception records missing predecessor-artifact retention, no verified write-once lock, reconstructed (not Actions-ZIP-identical) production roots, and no historical-preview backup. | Pages packaging assessment and item-by-item §37 reconciliation remain open. This does not declare formal v1 acceptance. See the [R2.13A/B/C evidence summary](docs/evidence/2026-10-26-r2-13-backup-owner-exception/README.md). |
| **AI engineering handoff pilot** | Stage B experiments and a *disabled* Stage C manual smoke harness are recorded in `main`; preparation is not activation or unattended Codex execution. | Explicit authorization and separately verified prerequisites before any Stage C live execution. See [Stage C preparation](docs/automation/stage-c-preparation.md). |

For the latest authoritative checkpoint, distinguish **production `main`**, the **Neon Grid development branch**, and **independent preview/experiment branches**. Some historical status paragraphs reflect an earlier point in time; verify current PR state and commit SHA in GitHub.

### Neon Grid visual design and evidence

- [Neon Grid design and build contracts](https://github.com/Manaconda33/manacondas-minigame-mayhem/tree/design/neon-grid-circuit-02/docs/design/neon-grid) live on the development branch, not necessarily `main`.
- [T9.7 visual approval record](https://github.com/Manaconda33/manacondas-minigame-mayhem/blob/design/neon-grid-circuit-02/docs/design/neon-grid/t9-7-final-visual-polish-plan-2026-10-08.md) covers the accepted baseline and explicitly scoped changes.
- [Abyss Fog B1 evidence](https://github.com/Manaconda33/manacondas-minigame-mayhem/blob/7209b5b331a5bdaba65413169d5b3b942ef13a19/docs/evidence/2026-10-12-neon-grid-abyss-fog-001/README.md) documents the rejected first prototype and measured render costs.
- [Abyss Fog B2 evidence](https://github.com/Manaconda33/manacondas-minigame-mayhem/blob/6dc9b862e8d5d05dfe6cd17ce2f62018bae7d999/docs/evidence/2026-10-12-neon-grid-abyss-fog-002/README.md) documents the corrections, comparison captures, tests, and known limitations. Software-rendered browser results do **not** satisfy the physical-device G-05 gate.

## Local development

**Prerequisites:** Node.js 22 or newer compatible release, npm, and Git LFS for governed binary assets.

```bash
git lfs install
npm ci
npm run dev
```

Vite prints the local URL. Available checks:

| Command | Purpose |
| --- | --- |
| `npm run dev` | Launch the local Vite development server |
| `npm run typecheck` | Check TypeScript types |
| `npm run lint` | ESLint with zero warnings permitted |
| `npm run test:ci -- --maxWorkers=1` | Serial Vitest coverage run (the hosted CI worker pattern) |
| `npm run build` | Typecheck, verify audio/branding/runtime assets, and build `dist/` |
| `npm run validate` | Typecheck, lint, tests, and production build |
| `npm run format:check` | Check repository formatting without edits |

Before proposing a completed checkpoint, follow [`docs/TESTING.md`](docs/TESTING.md), including relevant render/physics tests, browser evidence, device measurements where required, and production preservation checks. A successful build is not product-owner acceptance.

## Stack and repository layout

- **Frontend:** Vite + TypeScript.
- **Graphics:** Three.js (current WebGL renderer); route-specific 3D scenes and 2D illustrated driver sprites.
- **Physics:** Rapier via `@dimforge/rapier3d-compat`.
- **Audio:** Howler.js / Web Audio.
- **Testing and delivery:** Vitest, TypeScript, ESLint, GitHub Actions, source-pinned GitHub Pages reviews.

| Path | Responsibility |
| --- | --- |
| `src/app/` | Game-hub shell |
| `src/game/` | Tracks, karts, race/AI systems, collisions, items, effects |
| `src/ui/` | Character select, menus, HUD, results |
| `src/audio/` | Audio runtime integration |
| `src/config/`, `src/schemas/` | Configuration and validation |
| `public/assets/` | Governed runtime assets |
| `tests/`, `tools/` | Automated tests, validation and diagnostics |
| `docs/` | PRD, decisions, evidence, current implementation status |
| `.github/workflows/` | CI, Pages preview publication and guarded experiments |

## Governance and canonical references

1. **Requirements:** [PRD v1.1 and approved amendments](docs/PRD.md) and the [Word baseline](docs/Manacondas_Minigame_Mayhem_PRD_v1.1.docx).
2. **Implementation truth:** [GitHub history and branches](https://github.com/Manaconda33/manacondas-minigame-mayhem/branches) plus [`docs/IMPLEMENTATION-STATUS.md`](docs/IMPLEMENTATION-STATUS.md).
3. **Decisions and acceptance:** [`docs/DECISIONS.md`](docs/DECISIONS.md), [`docs/TESTING.md`](docs/TESTING.md), and the linked evidence.
4. **Contributor instructions:** [`AGENTS.md`](AGENTS.md), [avatar intake](docs/AVATAR-INTAKE.md), [roster mapping](docs/ROSTER-MAPPING.md), and [LFS publication](docs/LFS-PUBLISHING.md).

Use bounded branches, run the relevant checks, and stop at product-owner approval gates. Do not silently merge unapproved runtime changes or replace accepted avatar/sponsor artwork.

**Asset policy:** Follow `.gitattributes`, the provenance ledger, and approved exceptions in [`AGENTS.md`](AGENTS.md). Runtime avatar delivery PNGs are normal Git files; production 3D/audio and other binary formats may require LFS. Do not infer an exemption from a successful local build. Review [asset provenance](docs/ASSET-PROVENANCE.md) and [LFS publication policy](docs/LFS-PUBLISHING.md) before adding or changing binaries.
