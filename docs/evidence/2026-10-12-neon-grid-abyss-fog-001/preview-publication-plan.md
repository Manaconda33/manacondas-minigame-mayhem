# Immutable Pages preview publication plan

**State:** specification prepared; no workflow edit, PR, merge, or publication was performed. GitHub write authentication is currently unavailable.

Create a separate workflow-only branch from the current `main`, then a draft publication PR targeting `main`. Do not add runtime changes from the experiment branch to that workflow PR.

After the runtime branch has an immutable commit SHA, pin that SHA in a new `.github/workflows/ci.yml` preview entry:

```yaml
- id: neon-grid-abyss-fog-001
  embed_source: true
  sha: <exact runtime experiment commit SHA>
  base: /manacondas-minigame-mayhem/previews/neon-grid-abyss-fog-001/
  marker_type: feature
  marker_name: Neon Grid isolated fog-covered ruined-city A/B experiment
  status: Owner visual review only; no baseline replacement, runtime merge, or production release
```

The existing workflow also needs the corresponding exact-SHA cache restore, preview assembly and required-file checks, source-specific `review-build.json` assertion, and an addition to the allow-list for preview-only paths in the production-byte preservation gate. Keep the fixed and previously published preview entries unchanged. Verify all existing preview bytes and production `index.html`/JS/CSS hashes before deployment, and add a hash record for the new preview artifact. Use the workflow's existing Node 22 build, Pages artifact, and verification jobs.

The eventual review link will be:

`https://manaconda33.github.io/manacondas-minigame-mayhem/previews/neon-grid-abyss-fog-001/?neonGridVisual=abyss-fog-001`

It will not exist until Manny separately approves the workflow-only publication PR for merge and the pinned Pages deployment and post-deployment hash checks pass. That preview must report the exact experiment source SHA. It cannot reuse the approved T9.7 preview or be presented as owner-accepted until Manny inspects it. Do not merge the runtime experiment PR, change the `main` gameplay bundle, or publish a production runtime update as part of this preview process.
