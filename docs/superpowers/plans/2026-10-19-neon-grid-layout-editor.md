# Neon Grid Visual Layout Editor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a separate browser editor of the primary C2/Fog V3.2 scene with reliable component/track edits, undo, and source-addressable downloadable change documents.

**Architecture:** Keep a serializable design document and deterministic source catalogue independent of Three.js rendering. Construct the exact baseline scene once, edit copies/instance matrices through explicit adapters, and derive road changes from immutable baseline anchors. Use a separate editor entrypoint and build; reuse existing scene/material/bloom code without changing gameplay construction or publication workflows.

**Tech Stack:** Existing TypeScript 6, Three.js 0.185, Vite 8, Vitest 4, browser File/Blob APIs and IndexedDB. Three.js OrbitControls/TransformControls; no new runtime framework or dependency.

**Spec:** docs/superpowers/specs/2026-10-19-neon-grid-layout-editor-design.md, approved by Manny on 2026-10-19; commit 0c2f0e2ccae5b8a2a1a21d77d4013cafdb9773e8.

## Global Constraints

- Primary runtime source: addab4c7c2421f52c4731691b8a9f3e2d9e39f94.
- Current C2 documentation checkpoint: 99453711a86760d87a84ba427d2799d33056e55b.
- Active Task A/B/C1 base: 91393418c9b219fb5689c2041fb98325aa1e7b41.
- Primary selectors: neonGridMaterial=concrete-coverage-c2-001 and neonGridVisual=c2-task-a-fog-overlay.
- The editor is a visual authoring tool; driving and gameplay simulation are outside this increment.
- Background buildings stay at their original world placements unless the owner edits them.
- No editable component may be exported with an unknown source mapping.
- Inserting/removing points is not required for version 1.
- Never partially apply a corrupt import.
- Do not mutate imported shared layout objects, shared materials or geometry owned by the game.
- A dedicated implementation branch starts from the verified C2 checkpoint. It must not overwrite PR #317 or merge into main.
- A shareable editor publication must use a separate bounded preview path and preserve current production and existing previews.

## Review Focus

1. A building selected inside an instanced batch must not move neighbouring instances; its logical children must follow exactly once. Task 2 tests pin identity and group membership; Task 5 tests pin transform deduplication.
2. A road edit followed by another edit or undo must not drift background objects or destroy prior component edits. Task 4 tests pin immutable-baseline projection and repeatability.
3. Rejected imports, storage failures or interrupted drags must preserve the last valid document and accurately report unsaved state. Tasks 1, 5 and 6 test these transactions.
4. Moving repaired road curves or shortcut endpoints must not invoke hard-coded production triangulation assertions or silently claim valid gameplay. Task 4 tests edits near the climbing repair and junction warning generation.
5. Object identities and export integrity must survive reload while rejecting a different source/catalogue and recording undone actions correctly. Tasks 1, 2 and 6 test mismatch rejection and export/import reproduction.

## File and interface map

All new TypeScript modules live in src/editor/neon-grid/:
- EditorDocument.ts: JSON types, baseline manifest, finite numeric validation, immutable document operations.
- EditorHistory.ts: transaction history, undo/redo, cancellation and saved revision.
- EditorCodec.ts: strict import/export, canonical JSON and SHA-256 content integrity.
- ComponentCatalogue.ts: stable IDs, immutable baseline snapshots and catalogue fingerprints.
- SourceAdapters.ts: explicit source-family mapping, instance/range identifiers and semantic groups.
- EditorScene.ts: real scene creation/asset loading, lighting, rendering, helper overlay and disposal.
- EditorRoad.ts: 34-point edited curve and width profile, unchanged baseline width behaviour.
- RoadBindings.ts: immutable vertex/instance anchors, visual deformation and junction/geometry warnings.
- EditorProjection.ts: apply document overrides/tombstones to scene and instance copies.
- EditorSelection.ts: picking, marquee, selection filtering and selected bounds.
- EditorTransforms.ts: gizmo/numeric multi-selection transactions and derived dimensions.
- EditorStorage.ts: browser autosave/recovery with explicit error outcomes.
- EditorUI.ts and editor.css: toolbars, outliner, numeric inspector, dialogs and status.
- main.ts: entrypoint/composition/lifecycle; no authoring logic in the entrypoint.

Other additions:
- tools/editor/neon-grid.html: dedicated development/editor HTML entry.
- tools/editor/build-neon-grid-editor.mjs: separate build and minimal verified asset packaging.
- tools/editor/verify-neon-grid-editor.mjs: Playwright interaction/round-trip evidence harness.
- docs/evidence/2026-10-19-neon-grid-layout-editor/: catalogue coverage, build manifest, sample edits, screenshots and verification results.

Modify package.json only to add build:neon-grid-editor. Do not alter existing scripts, dependencies, pins, workflows, gameplay or asset files. If a demonstrated production-source seam is unavoidable, pause and document the exact change before expanding this plan.

### Task 1: Serializable editor documents, transactions and strict codec

**Files:** Create EditorDocument.ts, EditorHistory.ts, EditorCodec.ts; test tests/neon-grid-editor-document.test.ts.

**Interfaces:**
- Tuple types Vec3, Quaternion and Matrix4Data contain finite numbers; Matrix4Data is column-major and authoritative for affine transforms.
- EditorBaseline records repository, runtimeSourceSha, editorBuildSha, selectors, catalogueVersion and catalogueHash.
- EditorDocument records schemaVersion: 1, baseline, road, overrides, groups, history, view and warnings. Road state contains the 34 stable point IDs/positions and positive widthMultipliers (default 1), plus explicit shortcut anchors/paths.
- ComponentOverride records componentId, matrix, deleted and attachment override. No THREE.Object3D enters JSON.
- EditorHistory.apply(transaction), undo(), redo(), cancel(), markSaved(), snapshot() operate on immutable document snapshots; one gesture is one transaction.
- encodeDocument(document, catalogue): Promise<string>; decodeDocument(json, expectedBaseline, catalogue): Promise<EditorDocument>. The codec validates source IDs/catalogue, 20 MiB import size, finite values, invertible positive-determinant transforms, known properties/versions, journal cursor and content hashes.

- [ ] Write failing tests: original document is unchanged after edits; drag transaction undo restores exact matrix; redo is invalidated by a new edit; cancelled drag adds no history; edited and undone actions remain distinguishable.
- [ ] Write failing codec tests: deterministic canonical hash; unknown component/source/catalogue/version, NaN-equivalent invalid JSON types, singular/mirrored matrix, excessive file size and tampered final-state digest are rejected without modifying the current document.
- [ ] Run: npm run test -- --run tests/neon-grid-editor-document.test.ts. Confirm failures identify missing editor modules.
- [ ] Implement the types, immutable transactions and Web Crypto SHA-256 codec. Export the final state as authoritative alongside original values and the full applied/undone journal. Hash baseline/catalogue and final design sections separately from view/history metadata.
- [ ] Rerun the focused test file and npm run typecheck; require success.
- [ ] Commit: feat(editor): add source-pinned documents and reversible edits.

### Task 2: Source-addressable component catalogue

**Files:** Create ComponentCatalogue.ts, SourceAdapters.ts; test tests/neon-grid-editor-catalogue.test.ts.

**Interfaces:**
- buildCatalogue(root, baselineTrack): Promise<EditorCatalogue> returns entries, immutable geometry/matrix snapshots, logical groups, attachment declarations, fingerprint and coverage report.
- ComponentEntry records ID, label, sector, sourceFile, sourceSymbol, scenePath, sourceOrdinal/range, geometryHash, baseline matrices, bounds, material identity, groupId and attachment policy.
- IDs are semantic family/kind/ordinal identifiers, qualified by the source/catalogue fingerprint, never runtime UUIDs.
- SceneComponentHandle addresses mesh, instance or explicit authored index range. Unknown internal boundaries are one labelled combined component.
- SourceAdapters contains the explicit named-family registry for SkylineVisual, UndercityVisual, FallsRunVisual, FallsRunExtensionVisual, createNeonGridScene, ServiceTunnelGeometry, NeonGridBillboardVisual and NeonGridDiveVisual. Derive Undercity groups from existing partRanges and source ordinal arithmetic, not nearest-building guesses.

- [ ] Write failing tests for deterministic IDs across two baseline constructions, per-instance identity, known industrial partRanges, group-child membership, duplicate names at different scene paths and source/hash mismatch.
- [ ] Test that unsupported merged interiors are labelled combined components, unregistered families are inspectable but not editable/exportable, and an editable entry always has a valid source locator.
- [ ] Run: npm run test -- --run tests/neon-grid-editor-catalogue.test.ts.
- [ ] Implement the registry after enumerating every rendered family. Preserve original buffers/materials; use editor-only proxies/extracted ranges where needed. Record complete registered/unregistered coverage in evidence.
- [ ] Rerun the catalogue tests with the existing material/collision tests; require success without changing their timeouts/assertions.
- [ ] Commit: feat(editor): map selectable scene components to source.

### Task 3: Exact baseline scene and independent rendering entrypoint

**Files:** Create EditorScene.ts and tools/editor/neon-grid.html; test tests/neon-grid-editor-scene.test.ts.

**Interfaces:**
- createEditorScene(canvas, baseline): Promise<EditorScene> exposes root, renderer, camera, overlayScene, catalogue, render(view), resize(), dispose().
- Construct new NeonGrid() and createNeonGridScene(track, 'medium', 'fog-experiment-c2-background', 'concrete-coverage-c2-001').
- Await billboard.load(), skyline.load(), undercity.load(), tunnelWarnings.load() and loadServiceTunnelConcreteWallMaterial(root), matching the source loader sequence.
- Reuse RaceBloom and RaceShadows. Match game background 0x080f1d, distance fog 0x10192b / 180 / 650 and HemisphereLight(0xcbb7ff, 0x263822, 2.1). Match the current quality profile and frozen visual update at race time 0; no Rapier/racers/audio startup.
- Render helpers in a separate overlay after the game bloom pipeline. Restore state and dispose helpers separately; fog inspection bypass affects only view state.

- [ ] Write failing tests for exact selectors/loaders, all required load failures being reported, no game/physics startup, unchanged shared texture identity and idempotent cleanup.
- [ ] Run the scene tests, then implement source scene/lighting/bloom reuse and a minimal render-only browser fixture.
- [ ] Verify matched no-edit sector screenshots against the source using identical camera transforms; record the deliberate absence of racers and any shadow differences. Do not claim visual equivalence until captured.
- [ ] Verify resets/failed loads dispose owned resources and permit a second successful start.
- [ ] Commit: feat(editor): render the primary Neon Grid scene independently.

### Task 4: Road/attachment deformation and scene projection

**Files:** Create EditorRoad.ts, RoadBindings.ts, EditorProjection.ts; test tests/neon-grid-editor-road.test.ts.

**Interfaces:**
- createEditedPaths(baselineTrack, roadState): EditorPaths returns the closed main curve, shortcut curves, widthAt(progress) and warnings.
- Default widthAt exactly delegates to the baseline halfWidthAt; edited positive multipliers interpolate across the authored control-point arc positions. An all-ones profile exactly reproduces the original sector narrowing.
- buildRoadBindings(catalogue, baselineTrack): RoadBindingSet assigns source-defined path/progress/lateral/vertical anchors to road attachments. Store repaired-ribbon row metadata and authored range provenance explicitly.
- projectEditorDocument(baselineScene, catalogue, paths, document): ProjectionResult returns edited scene state, changed component IDs, derived attachment changes and warnings. It always starts from immutable baseline snapshots and then applies document overrides.
- Rigid instances use source-anchor frame deltas. Road ribbons/screens use per-vertex path frames, recomputed normals and physical-scale UVs where applicable. Background groups use fixed world matrices plus their explicit edits.
- Shortcut endpoint deltas update their declared anchors and editor curves; export full resulting paths. Warn for unsupported junction repair, self-intersection, folded faces, extreme grades or insufficient clearance.

- [ ] Write failing tests for zero-edit byte-equivalent position/index buffers; all-ones exact width; closure; finite moved-point geometry; positive width handling; background/window-group invariance; a source-pinned sign following its road anchor.
- [ ] Add tests editing points near the historic climbing repair, undo/reapply repeatability and nonaccumulating sequential edits. Confirm no call to production ribbon regeneration with arbitrary edited geometry.
- [ ] Add shortcut tests for endpoint movement, preserved identity, explicit unresolved-junction warnings and retention of component overrides through road edits.
- [ ] Run: npm run test -- --run tests/neon-grid-editor-road.test.ts.
- [ ] Implement editor-only deformation. The production neonGridRibbon climbingPatch uses fixed rows/intersections and must not be reused to retriangulate arbitrary edited layouts. Preserve the baseline source buffers and expose topology limitations as proposal warnings.
- [ ] Run road tests plus existing Neon Grid geometry/material/collision regressions and require passing assertions.
- [ ] Commit: feat(editor): reshape roads while preserving source attachment identities.

### Task 5: Camera, selection and transform controls

**Files:** Create EditorSelection.ts, EditorTransforms.ts; test tests/neon-grid-editor-interaction.test.ts.

**Interfaces:**
- EditorSelection.pick(pointer), marquee(rect), toggle(id), replace(ids), clear(), bounds() operate on visible registered components and logical groups.
- Direct clicks use nearest selectable hit including instanceId; atmospheric/helper objects are excluded. Marquee uses projected component bounds on visible layers in front of the camera; label its through-object selection behaviour.
- EditorTransforms.begin(ids, mode, pivot), preview(delta), commit(), cancel(), setDimensions(values) use Task 1 transactions. Deduplicate parent/child selections before applying group transforms; retain full affine matrices without lossy decomposition.
- OrbitControls provide orbit/pan/zoom. Add frame-selection, fit-course and top/front/side camera actions; optional free-fly is secondary. Disable camera controls during transforms/marquee and restore on pointer cancellation/lost capture.

- [ ] Write failing tests for instance picking, Ctrl/Cmd toggles, layer filtering, behind-camera marquee exclusion, parent/child transform deduplication, single-gesture undo, Escape cancellation and numeric positive-dimension enforcement.
- [ ] Run the interaction test file, then implement controls and helper outlines/bounds. Use a visible shared bounding-centre pivot and explicit world/local modes.
- [ ] Test keyboard focus: Delete/undo shortcuts do not act while editing a text/number field; pointer release outside canvas ends/cancels cleanly.
- [ ] Verify in the browser that individual batch neighbours remain unchanged and helpers remain legible through fog without changing exported scene content.
- [ ] Commit: feat(editor): add camera navigation and component manipulation.

### Task 6: Usable interface, save/load and browser recovery

**Files:** Create EditorStorage.ts, EditorUI.ts, editor.css and main.ts; test tests/neon-grid-editor-session.test.ts.

**Interfaces:**
- EditorStorage.save(document), recover(expectedBaseline), clear() return explicit success/error outcomes; IndexedDB errors leave a visible unsaved warning.
- EditorUI mounts toolbar/outliner/inspector/status dialogs and dispatches commands to the document/history/selection interfaces. Provide Download edits, Load edits, undo/redo, delete, reset, original/edited comparison, sector bookmarks and view-only fog/helpers.
- main.ts composes the modules, source marker and lifecycle. A comparison view never overwrites the working edited document.
- Loading is transactional: validate/hash first, build a valid scene projection second, replace current state last. Unsupported data leaves the current session intact.

- [ ] Write failing tests for storage quota/permission failure, failed import keeping the current scene, reset cancellation, outliner selection sync and view settings not becoming design changes.
- [ ] Test a mixed edit document with deletion, group movement, height/width change, track change, undo and redo. Export/import must reproduce final catalogue IDs, matrices, deleted state, road geometry hashes and warning list.
- [ ] Run session tests; implement the compact interface, autosave, explicit download and import/recovery dialogs.
- [ ] Browser-test the complete mixed session, reload, and import on a fresh page. Save the exported JSON and before/after screenshots as review evidence.
- [ ] Commit: feat(editor): add authoring interface and reproducible edit downloads.

### Task 7: Portable build, end-to-end evidence and review checkpoint

**Files:** Create tools/editor/build-neon-grid-editor.mjs, tools/editor/verify-neon-grid-editor.mjs and docs/evidence/2026-10-19-neon-grid-layout-editor/README.md; modify package.json to add build:neon-grid-editor only.

**Interfaces:**
- build:neon-grid-editor runs TypeScript validation and the standalone Vite builder, writing dist-neon-grid-editor/ with the editor HTML, bundles, source marker and a minimal asset manifest.
- Builder uses publicDir:false, an explicit editor HTML input and configurable preview base. Copy only the scene's required approved assets from existing public sources, preserving exact bytes/LFS policy; missing/signature-invalid assets fail the build.
- review-build.json records baseline source, editor source, selectors, catalogue version and file hashes. The user download records this editor build identity.
- The Playwright verifier accepts base URL and exact source SHA, performs the mixed editing session and captures sector/selection/road-change images and export/import integrity.

- [ ] Add meaningful builder tests for base-aware URLs, missing/invalid required assets, source marker integrity and absence of game/workflow output modifications.
- [ ] Run npm run typecheck; npm run lint; the editor test files; existing affected geometry/material regressions; npm run test:ci; npm run build; npm run build:neon-grid-editor; git lfs fsck --objects HEAD; git diff --check. Report actual failures, including existing timeouts, without altering criteria or calling a partial run a pass.
- [ ] Run the browser verifier; verify every component edit is source-addressable and export/reload reproduces the final design. Capture baseline and edited render counters and teardown/restart observations separately from gameplay budgets.
- [ ] Verify diff scope: editor modules, editor tools/tests, package script and editor documentation only. Compare baseline game source/assets/workflows hashes and confirm PR #242, active lines and Stage C are unchanged.
- [ ] Record exact source/build SHA, asset/catalogue coverage, sample JSON, verification results, limitations and publication instructions in the evidence index.
- [ ] Commit/push the isolated implementation branch and create one draft PR against the C2 development line, not main. Do not merge or change existing publication workflows.
- [ ] Prepare the portable editor artifact and the separate preview publication proposal. If publishing requires a main workflow change or automatic production republish, present that exact diff and side effect for the owner's final approval before execution.

## Self-review and execution choice

The tasks cover each approved spec section: source appearance (3), component identity (2), track/bindings (4), controls (5), document/history/export (1), recovery/UI (6), and delivery/validation (7). Interfaces are shared by name and the five Review Focus cases have owning tests. No runtime authoring code, source pin or workflow is changed by this plan commit.

Recommended execution: Native. Catalogue, deformation, selection and export share tightly coupled interfaces, and one implementer can verify the complete mixed editing session continuously. After the implementation and required checks, request one independent whole-branch review before presenting the checkpoint. The owner may choose subagent-driven execution instead.

Written plan review and execution-method selection remain the next gate before editor implementation.
