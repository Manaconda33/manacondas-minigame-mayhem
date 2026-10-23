# Proposed PR closeout — Release Readiness R1

**Status:** Recommendations only. All four PRs below were live-checked on 2026-10-23. Do not merge, close, delete branches, or alter published previews from this record; each such action requires separate owner authorization.

## Proposed resolutions

| PR | Live state and exact head | Recommendation | Preservation conditions |
| --- | --- | --- | --- |
| [#242](https://github.com/Manaconda33/manacondas-minigame-mayhem/pull/242) | Open, draft, unmerged; `design/neon-grid-circuit-02` at `6919729ba5e12f48305f543dca153f4ba9c5ae19`; targets `main`. | Close without merge. The current production track already contains the approved selectable Neon Grid composition. The draft describes an older development runtime and explicitly lists unfinished Task 6 acceptance. | Keep the branch, billboard/traversal implementation history, and evidence. Closing the PR must not delete its source branch or remove any pinned preview. Do not merge the obsolete runtime. |
| [#317](https://github.com/Manaconda33/manacondas-minigame-mayhem/pull/317) | Open, draft, unmerged; `fix/neon-grid-task-c2-concrete-coverage-20261018` at `99453711a86760d87a84ba427d2799d33056e55b`; targets the Task A/B/C1 development branch. | Close without merge. The approved C2 appearance is already in production; the PR is a historical development review, not the route to production now. | Preserve the branch, surface audit, A/B captures, tests, and evidence. Its historical six timeout failures do not override the current 20-second main validation result. |
| [#320](https://github.com/Manaconda33/manacondas-minigame-mayhem/pull/320) | Open, draft, unmerged; `feat/neon-grid-layout-editor-20261019` at `45b45e409427cc9c51e8e42905dcbf9f409cbdb9`; targets the C2 development branch. | Close without merge. The internal Layout Studio is no longer required for current development; a portable player-facing editor is deferred. | Preserve the source branch, uploaded layout exports, source maps, screenshots, and evidence. Keep the already published editor path and its checks unchanged unless a separate packaging decision is approved. Closing this PR is not a request to delete the branch or its published preview. |

## Separate documentation decision PR

[PR #336](https://github.com/Manaconda33/manacondas-minigame-mayhem/pull/336) is open and unmerged at exact head `939916997ec67b8f2256541d4dc346134c4128c5`. Its hosted workflow run [39965195785](https://github.com/Manaconda33/manacondas-minigame-mayhem/actions/runs/39965195785) completed successfully, including the stable `validate` job. It records the rejected Falls Run Scratched Painted Metal 01 experiment. It may be reviewed for merge separately; this record does not grant merge or automatic Pages deployment authorization.

## Current disposition

No PR status was changed. The source branches and useful evidence remain available. Proposed closure is limited to #242, #317, and #320 without merging their contents. Any future closure session should recheck each exact head, ensure all linked artifacts/exports/evidence remain reachable, close without branch deletion, and verify the PR is closed unmerged.
