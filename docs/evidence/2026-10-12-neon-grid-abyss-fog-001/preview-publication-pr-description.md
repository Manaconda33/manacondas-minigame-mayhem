# Draft preview-publication PR — not published

**Target:** `main`

**Source:** `preview/neon-grid-abyss-fog-001`

**Workflow-only commit:** `5ef0bcf9d9ab038e2e520815bf1581a8b4bc2aae`

**Title:** `ci(preview): pin isolated Neon Grid abyss-fog review build`

## Summary

- Add a separate immutable Pages preview ID `neon-grid-abyss-fog-001`, pinned to runtime commit `b0f8d6ed0ef1ba92c6e2dace6886ab04232abd65`.
- Add the exact SHA cache restore, isolated preview assembly, required file/signage checks, delivery hash manifest entries, and exact `review-build.json` source assertion.
- Exclude only this preview prefix from pre-deployment production-byte equality checks, while adding its files to post-deployment checksum verification.
- Preserve every existing preview entry and the production game build.

## Validation

- The workflow YAML parses locally.
- A local structural check confirmed the unique matrix entry, source pin, base path, cache restore, assembly checks, hash manifest, production-byte allow-list, and expected-source assertion.
- Hosted workflow validation and Pages deployment have not run because the GitHub API denied PR creation with HTTP 403.

## Approval boundary

This PR adds only a pinned review preview. Keep it unmerged until Manny separately approves preview publication. The future review URL is `https://manaconda33.github.io/manacondas-minigame-mayhem/previews/neon-grid-abyss-fog-001/?neonGridVisual=abyss-fog-001`; it does not exist until the approved merge, Pages deployment, and post-deployment hash checks succeed. This does not merge the runtime PR, replace the approved T9.7 baseline, or authorize production gameplay release.
