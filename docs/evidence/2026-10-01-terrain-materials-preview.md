# Circuit Alpha material preview — publication checkpoint

Status: **PREVIEW DEPLOYED / MATERIALS LIVE ACCEPTED IN PRODUCTION.**

Preview PR #235 merged at `e54e4aa2ceaa3f5f0b8659248adfec9c22a086db`; main CI/Pages `36932805048` and exact hosted delivery/startup verification passed. Manny subsequently approved production merge/publication. Materials PR #234 merged at `0aaea588b1260548cd96d5e4226da7ecfc8397f3`, with main CI/Pages `36934885453` and exact production delivery verified. Production evidence: `docs/evidence/2026-10-01-terrain-materials/production-delivery.json`. The proposal/stop scope below describes the earlier preview-only checkpoint.

Runtime candidate: `375c933766dbc52cead91592cd69d954ab022d38` on `review/circuit-alpha-material-completion`.
Production baseline: `68dc1c9a3f68d953c9468d926b533bba21781459`.
Preview-only branch: `preview/circuit-alpha-materials`.
Gameplay URL after successful Pages deployment:
https://manaconda33.github.io/manacondas-minigame-mayhem/previews/terrain-materials/

## Exact publication scope

1. Publish the implementation review branch and create an unmerged runtime PR titled **Complete Circuit Alpha grass, dirt and shoulder materials**.
2. Publish this preview-only branch and create a PR titled **Publish pinned Circuit Alpha material review on GitHub Pages**.
3. Verify both exact-head PR CI results before merging only the preview-infrastructure PR.
4. Keep the implementation PR unmerged and production gameplay at the accepted main runtime.
5. Verify post-merge validation/Pages deployment and preview delivery; provide the gameplay link for Manny’s visual acceptance.
6. Stop for that review. Production runtime merge/publication remains separately gated.

## Workflow change

The existing Node-24 action chain, Node-22 game build, Git LFS checks, production build, existing previews and deployment environment remain unchanged. Added checkout pins the review commit exactly, materializes LFS, verifies assets and builds at `/manacondas-minigame-mayhem/previews/terrain-materials/` with `VITE_SOURCE_COMMIT` matching that pin. Assembly copies that output only into its isolated preview directory.

## Local evidence

Runtime: full validation **99 files / 768 tests**, zero-warning lint/typecheck/build, exact assets/LFS checks; real Chromium material shaders/network fallbacks and desktop/portrait startup pass; independent read-only review has no unresolved Critical/Important issue. Candidate evidence is in `docs/evidence/2026-10-01-terrain-materials/` on the runtime branch. Preview-path build passes locally; local YAML validation confirms the isolated checkout/build/assembly path. Hosted PR CI and Pages verification are pending publication.

Manny explicitly approved publishing both review branches, creating both PRs, and merging/deploying only the preview PR on 2026-10-01. Direct Git publication subsequently failed because the workspace has no Git credential. Publication uses the authenticated GitHub connector; the published runtime tree `9e0240b33f3ee7a26ed19b9d6cc8bc53d2580783` exactly matches local reviewed candidate `1e91c448645add75dc786e6c327d6527fb73f133`. The connector assigns a new commit ID, so the preview pins the published runtime commit above. No LFS-governed binary is uploaded or changed through this path.

This publishes a review preview only. It does not grant production material acceptance, production runtime merge, the later lighting/shadow/camera increments, numeric performance certification, context-loss recovery or Slice 6 closure.
