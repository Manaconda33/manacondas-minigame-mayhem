# Immutable Pages preview publication plan

**State:** workflow-only change prepared, committed, and pushed; PR creation was rejected with HTTP 403. No PR was created, merged, or published.

Workflow-only branch: `preview/neon-grid-abyss-fog-001`, based on `main` checkpoint `f09e961b1c7ec65fce82e223f5ed6f288dd195e4`, branch commit `5ef0bcf9d9ab038e2e520815bf1581a8b4bc2aae`. Its only changed file is `.github/workflows/ci.yml`. It adds the pinned preview matrix entry, cache restore, isolated Pages assembly/file/art checks, exact source verification, and production-byte hash allow-list entry. No runtime files or main branch were changed.

The runtime PR and this preview-publication PR still need to be created. GitHub CLI API requests return HTTP 403 because `GH_TOKEN` is invalid and no stored CLI login exists, though Git pushes succeeded. Do not add runtime changes from the experiment branch to the workflow PR.

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

The committed workflow change has been YAML-parsed locally. The normal workflow CI, full preview build, and post-deploy hash verification remain pending because the publication PR could not be opened. Keep the fixed and previously published preview entries unchanged. The PR CI must build and cache the exact SHA; after separate owner approval and merge, Pages assembly must verify existing production bytes and the new preview artifact hash using the existing Node 22 jobs.

The eventual review link will be:

`https://manaconda33.github.io/manacondas-minigame-mayhem/previews/neon-grid-abyss-fog-001/?neonGridVisual=abyss-fog-001`

It will not exist until Manny separately approves the workflow-only publication PR for merge and the pinned Pages deployment and post-deployment hash checks pass. That preview must report the exact experiment source SHA. It cannot reuse the approved T9.7 preview or be presented as owner-accepted until Manny inspects it. Do not merge the runtime experiment PR, change the `main` gameplay bundle, or publish a production runtime update as part of this preview process.
