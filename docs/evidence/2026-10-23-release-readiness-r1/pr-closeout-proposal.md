# Proposed PR closeout — Release Readiness R1

**Status:** Recommendations only. All four PRs below were live-checked on 2026-10-23. Do not merge, close, delete branches, or alter published previews from this record; each such action requires separate owner authorization.

## Proposed resolutions

| PR | Live state and exact head | Recommendation | Preservation conditions |
| --- | --- | --- | --- |
| [#242](https://github.com/Manaconda33/manacondas-minigame-mayhem/pull/242) | Open, draft, unmerged; `design/neon-grid-circuit-02` at `6919729ba5e12f48305f543dca153f4ba9c5ae19`; targets `main`. | Close without merge. The current production track already contains the approved selectable Neon Grid composition. The draft describes an older development runtime and explicitly lists unfinished Task 6 acceptance. | Keep the branch, billboard/traversal implementation history, and evidence. Closing the PR must not delete its source branch or remove any pinned preview. Do not merge the obsolete runtime. |
| [#317](https://github.com/Manaconda33/manacondas-minigame-mayhem/pull/317) | Open, draft, unmerged; `fix/neon-grid-task-c2-concrete-coverage-20261018` at `99453711a86760d87a84ba427d2799d33056e55b`; targets the Task A/B/C1 development branch. | Close without merge. The approved C2 appearance is already in production; the PR is a historical development review, not the route to production now. | Preserve the branch, surface audit, A/B captures, tests, and evidence. Its historical six timeout failures do not override the current 20-second main validation result. |
| [#320](https://github.com/Manaconda33/manacondas-minigame-mayhem/pull/320) | Open, draft, unmerged; `feat/neon-grid-layout-editor-20261019` at `45b45e409427cc9c51e8e42905dcbf9f409cbdb9`; targets the C2 development branch. | Close without merge. The internal Layout Studio is no longer required for current development; a portable player-facing editor is deferred. | Preserve the source branch, uploaded layout exports, source maps, screenshots, and evidence. Keep the already published editor path and its checks unchanged unless a separate packaging decision is approved. Closing this PR is not a request to delete the branch or its published preview. |

## Consolidated rejected-metal decision: source and safe disposition

The rejected Falls Run Scratched Painted Metal 01 decision is included in PR #337 from PR #336 source commit [`939916997ec67b8f2256541d4dc346134c4128c5`](https://github.com/Manaconda33/manacondas-minigame-mayhem/commit/939916997ec67b8f2256541d4dc346134c4128c5), authored as `docs: record rejection of Falls Run metal experiment`. The source record preserves Manny's instruction, “I don't like the cladding look. Let's not add it. Mark it as a failed experiment,” plus the A/B findings: the cladding was largely obscured by the C2 roadside wall; B changed at most **0.3533%** of sampled mobile-portrait pixels; and the race-camera midpoint wall view was identical. The isolated mesh diagnostic showed the material, but normal racing views did not gain a worthwhile improvement. This rejects only Scratched Painted Metal 01 on `falls-run-wall-cladding`; it does not decide other materials or targets.

PR #336 is open, unmerged, at exact head `939916997ec67b8f2256541d4dc346134c4128c5`; its hosted run [39965195785](https://github.com/Manaconda33/manacondas-minigame-mayhem/actions/runs/39965195785) passed, including `validate`. Its documentation decision has been consolidated here, so do not merge it as a second copy. Recommended disposition: after PR #337 is separately approved, merged, and verified on `main`, close #336 unmerged while retaining its branch and source evidence. No PR state changes are authorized by this proposal.

## Current disposition

No PR status was changed. The source branches and useful evidence remain available. Proposed closure is limited to #242, #317, and #320 without merging their contents. Any future closure session should recheck each exact head, ensure all linked artifacts/exports/evidence remain reachable, close without branch deletion, and verify the PR is closed unmerged.
