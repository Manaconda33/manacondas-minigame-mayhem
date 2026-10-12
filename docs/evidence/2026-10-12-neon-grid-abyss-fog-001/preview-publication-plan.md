# Immutable Pages preview publication plan

**State (2026-10-12):** workflow-only branch is pushed; [PR #293](https://github.com/Manaconda33/manacondas-minigame-mayhem/pull/293) is open to `main`. Hosted run [38209905504](https://github.com/Manaconda33/manacondas-minigame-mayhem/actions/runs/38209905504) has 20/21 preview matrix jobs complete, with the new pinned build still running. No merge or publication has occurred.

Workflow-only branch: `preview/neon-grid-abyss-fog-001`, based on `main` checkpoint `f09e961b1c7ec65fce82e223f5ed6f288dd195e4`, branch commit `5ef0bcf9d9ab038e2e520815bf1581a8b4bc2aae`. Its only changed file is `.github/workflows/ci.yml`. It adds the pinned preview matrix entry, cache restore, isolated Pages assembly/file/art checks, exact source verification, and production-byte hash allow-list entry. No runtime files or main branch were changed.

The runtime experiment is [PR #292](https://github.com/Manaconda33/manacondas-minigame-mayhem/pull/292), targeting `design/neon-grid-circuit-02`. The workflow-only PR #293 contains no runtime changes. Keep both branches separate; do not merge #293 until the hosted run passes and Manny separately approves publication.

The immutable runtime/evidence commit is `b0f8d6ed0ef1ba92c6e2dace6886ab04232abd65`. Pin that exact SHA in a new `.github/workflows/ci.yml` preview entry:

```yaml
- id: neon-grid-abyss-fog-001
  embed_source: true
  sha: b0f8d6ed0ef1ba92c6e2dace6886ab04232abd65
  base: /manacondas-minigame-mayhem/previews/neon-grid-abyss-fog-001/
  marker_type: feature
  marker_name: Neon Grid isolated fog-covered ruined-city A/B experiment
  status: Owner visual review only; no baseline replacement, runtime merge, or production release
```

The workflow YAML parsed and passed the earlier local structural assertions. Hosted run #38209905504 is active; the pinned B preview matrix job is the remaining matrix build. The hosted run must finish successfully before requesting publication approval. After Manny approves and the PR merges, the existing Pages workflow must assemble and hash-check the pinned preview while verifying existing production bytes. Post-deployment live-byte verification remains a separate required check. Keep all existing preview entries unchanged.

The eventual review link will be:

`https://manaconda33.github.io/manacondas-minigame-mayhem/previews/neon-grid-abyss-fog-001/?neonGridVisual=abyss-fog-001`

It will not exist until Manny separately approves the workflow-only publication PR for merge and the pinned Pages deployment and post-deployment hash checks pass. That preview must report the exact experiment source SHA. It cannot reuse the approved T9.7 preview or be presented as owner-accepted until Manny inspects it. Do not merge the runtime experiment PR, change the `main` gameplay bundle, or publish a production runtime update as part of this preview process.
