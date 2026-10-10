## Consolidated Neon Grid Circuit 02 candidate

This draft PR contains the accumulated Neon Grid development and review history, reconciled with current `main`. PR #285's complete four-commit history was integrated into `design/neon-grid-circuit-02`, followed by a no-ff merge of `main` at `f16173c`. Integration commit: `c51110b62aa3631bc7c7cd947ad055834b277ec5`.

### Approved runtime and provenance

- The canonical environment/gameplay baseline is the exact owner-approved runtime `75c6c62c865ec3b546f3f2512e649de9ea6d52bc` from PR #285.
- Manny played and approved the immutable [T9.7 environment-correction preview](https://manaconda33.github.io/manacondas-minigame-mayhem/previews/neon-grid-t9-7-environment-correction/) pinned to that SHA.
- Preview workflow PR #288 merged into `main` at `b7b26d1a1afaa88a47ecd7a14759b004bd932b5b` and retains the exact pin.
- A tree comparison against `75c6c62` found no executable source, runtime asset, package, or build-configuration differences. The consolidated workflow and documentation retain the preview pin, review marker, historical previews, and owner-approval record.

### Systems and work preserved

- The complete Neon Grid course, its three shortcuts, route/checkpoint authority, AI driving, kart physics, items, HUD/minimap, cameras, lifecycle cleanup, and diagnostics.
- Approved Skyline, Undercity, and Falls Run visuals, connected sector-local city ground, supported foundations, selective bloom/material work, Billboard Gap corrections, approved billboard/signage artwork, and Task 8 protected visuals.
- Existing Circuit Alpha production gameplay and assets, CI fixtures, tests, Git LFS assets, design approvals, and historical visual evidence.

The history-preserving reconciliation found one conflict in `docs/IMPLEMENTATION-STATUS.md`. Resolution preserves main's current T9.7 owner-approval record and the full development-branch chronology. No files were removed; see `docs/evidence/2026-10-10-neon-grid-release-consolidation/file-manifest.tsv` for the complete file-level manifest.

### Validation and release gates

- Node 24.19.0 `npm run validate`: PASS, 132 test files / 1,072 tests, typecheck, zero-warning lint, approved asset checks, production build.
- Node 22.23.3: typecheck, lint, production build and T9.6 evidence-checker tests passed. The workflow-equivalent serial full suite completed with 131/132 files and 1,069/1,072 tests passing; three real-camera tests in `race-diagnostics-routing.test.ts` exceeded unchanged 5-second limits. An earlier parallel suite had five timeouts; a separate isolated city-ground test passed. No timeout or test criterion was changed. Candidate-specific GitHub Actions results are available from the [Checks tab](https://github.com/Manaconda33/manacondas-minigame-mayhem/pull/242/checks); report the exact final run state there.
- T9.7 182-position software-render course sweep: zero reported errors, 494 maximum calls / 416,459 triangles. This is structural/render evidence, not device performance certification.
- G-05 representative-hardware captures and metadata remain BLOCKED. T9.8 is not complete. This PR remains draft/unmerged; no production gameplay merge or deployment is authorized by this description.

The 500-call scene cap, 425,000 Task 9 engineering-triangle ceiling, 750,000 PRD triangle cap, and approved T9.7 sector budgets remain in force. No budget increase or acceptance-criteria relaxation is included.
