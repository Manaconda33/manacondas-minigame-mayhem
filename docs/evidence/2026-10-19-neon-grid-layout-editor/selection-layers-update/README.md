# Independent city platforms, buildings and atmosphere — 2026-10-19

Owner-requested correction to Layout Studio. Manny confirmed that “ground” means the large terraced platform beneath and between buildings. This checkpoint implements the approved bounded design.

**Reviewed editor source:** `4182fb797aa232d6cf38651beb9b017efd0c3f4f`.
**Primary game source:** `addab4c7c2421f52c4731691b8a9f3e2d9e39f94`, with the existing C2 concrete + Task A Fog V3.2 selectors.
**Publication:** pending explicit authorization of the workflow proposal below. The published preview still uses `81bcaa9123dc184f615fa638f64ea34a279397d5`.

## Implemented behavior

- All four city platform families are independently editable. Platforms do not belong to building selection groups.
- Falls Run and its extension expose individual tower bodies and foundations from the exact baked source instance spans. In the main Falls Run section, all 24 tower bodies and 24 foundations are separately addressable, alongside windows and roof details. Whole-building selection remains available; turn it off to edit one part.
- Undercity's terraced floor is separated from its wall screens using the runtime's explicit `floorIndexStart`/`floorIndexCount` metadata.
- Source range discovery now reads geometry metadata as well as mesh metadata. Extracted components retain source file, ordinal, index span, geometry fingerprint and original material/attribute values.
- Fog V3.2 has a dedicated **Atmosphere** visibility layer in Scene explorer. Its world anchors remain fixed when buildings, ground or road points are moved or deleted. Visibility is retained in the exported document's existing `view.fog` field. Atmosphere does not enter building selections.
- Undo, redo and export/import use the existing transaction and source-verification contracts. Catalogue version is now 2; files from a different catalogue/source are rejected rather than silently reinterpreted. Retain any earlier downloaded edit files with their original source reference.

The extraction and atmosphere controller are editor-only. No game source geometry, physics, textures, fog profile, approved artwork or runtime selector is modified. Separating authored ranges increases editor draw submissions; this is not an adopted change to the racing renderer or G-05 certification.

## Verification

- TypeScript: PASS.
- Zero-warning ESLint: full source-tree PASS; final range-helper changes also passed a scoped recheck.
- Focused editor suite: **47/47 tests, 9 files**, final serial run, unchanged timeout settings. See `focused-tests.txt`. Earlier concurrent attempts hit the existing five-second scene-construction limit; the final serial run passed.
- Browser layer/selection checks: **11/11 PASS**, including platform deletion without deleting towers, undo, one-tower movement, exact export/import, building-group exclusion of platforms, fog isolation and fixed fog anchors after a track edit.
- Existing browser round-trip regression: **24/24 PASS**, including fresh-page reproduction of every component's position/index buffers, world matrix, visibility, road paths, and corrupt-import rollback.
- Editor build and exact hashes for all 11 approved assets: PASS. Packaging check: PASS. Existing Vite chunk-size advisory remains.
- Local Git LFS object fsck and `git diff --check`: PASS. No new assets or LFS pointers. This is not a new repository-wide remote LFS audit.

The final rendered catalogue contains **1,772 source-mapped components**. Screenshots show the independently selected terraced platform and an independently controlled fog layer. Browser results use software WebGL; they do not establish representative-device performance acceptance. The full game coverage suite was not repeated for this editor-only change; the previous full-suite limitations remain recorded in the parent evidence index.

## Publication proposal — not applied

A workflow proposal is prepared locally against main `b2afc6ee6b80fb648b8604a5a77e5d415a4b3094`. It changes only the existing Layout Studio publication contract:

1. Replace the old editor SHA with `4182fb797aa232d6cf38651beb9b017efd0c3f4f` in its five matching checkout/build/assembly/delivery references.
2. Run the focused editor suite and packaging check before the standalone editor build.
3. Retain the existing preview URL and normal Pages assembly, deployment and live-byte preservation checks.

No other preview runtime pin, production source, required check, permission, concurrency rule or deployment trigger changes in the proposal. YAML syntax was checked locally. Hosted validation and deployment have not run for the proposal.

Automatic approval review rejected both the attempted workflow tree creation and upload of the proposed patch because the current task did not explicitly authorize a new shared CI/Pages workflow publication change. The raw patch was not published; the summary above identifies the requested change for owner approval. No workflow file, main ref or publication changed. An empty preparation branch, `ci/neon-grid-layout-studio-selection-preview-20261019`, was created at the unchanged main SHA before that rejection. No publication PR was opened, and no bypass was attempted.

The editor correction is retained on draft PR #320. Owner authorization is needed to submit and validate the exact workflow proposal, merge it after required checks pass, and allow its normal automatic Pages publication.
