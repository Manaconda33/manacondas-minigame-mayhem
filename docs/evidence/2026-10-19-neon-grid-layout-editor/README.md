# Neon Grid Layout Studio — isolated visual authoring checkpoint

**Status:** ready for isolated editor review; repository validation remains PARTIAL because 12 existing scene-heavy tests timed out. No gameplay integration, merge, or public publication authorization.

Editor/build source: `81bcaa9123dc184f615fa638f64ea34a279397d5`. Final focused tests: **43/43**; browser checks: **38/38**; packaging assertions: **3/3**. Typecheck, zero-warning lint, production/editor builds, approved asset checks, local LFS fsck and diff checks passed. Full coverage-enabled run: **1,145/1,157 passed**, 12 existing five-second timeouts across five unchanged files. See `validation.json` and `full-coverage.txt`.

## Source and approved scope

- Primary runtime: [`addab4c7c2421f52c4731691b8a9f3e2d9e39f94`](https://github.com/Manaconda33/manacondas-minigame-mayhem/commit/addab4c7c2421f52c4731691b8a9f3e2d9e39f94).
- Current C2 development checkpoint: `99453711a86760d87a84ba427d2799d33056e55b`; active Task A/B/C1 remains `91393418c9b219fb5689c2041fb98325aa1e7b41`.
- Primary selectors: `neonGridMaterial=concrete-coverage-c2-001` and `neonGridVisual=c2-task-a-fog-overlay` (C2 concrete/background, Task A Fog V3.2 and Billboard placement).
- Owner-approved [design](../../superpowers/specs/2026-10-19-neon-grid-layout-editor-design.md) and [plan](../../superpowers/plans/2026-10-19-neon-grid-layout-editor.md).
- Standalone Three.js editor: actual source scene, source materials, frozen scene animation at time zero, source bloom/fog/shadows. No racers, physics, audio, driving, or gameplay state.

## Use

For browser evidence tools, set `NEON_GRID_EDITOR_PLAYWRIGHT` to a node_modules directory containing Playwright and `NEON_GRID_EDITOR_CHROME` to Chromium; `NEON_GRID_EDITOR_URL` selects the local editor URL. No new game dependency is required.

Run `npm run build:neon-grid-editor` from the source checkout with approved LFS assets materialized. The separate output is `dist-neon-grid-editor/`. Extract the portable review ZIP and run `python3 serve.py` (Windows: `py serve.py`); it serves this folder on localhost and opens the editor. HTTP is required; do not open the HTML with `file://`.

- Left drag orbits, right drag pans, wheel zooms. Sector buttons, top/front/side views, and **Frame** assist navigation.
- Click selects; Ctrl/Cmd-click adds/removes. **Box select** or Shift-drag selects across visible layers, including components behind other components.
- **Select whole buildings** includes source-mapped foundations, windows, equipment and lights. Turn it off for individual parts/instances. Search and sector filters affect selection visibility.
- W/E/R activates move/rotate/scale gizmos; numeric dimensions are world bounding dimensions in metres. Rotation/scale fields apply increments. F frames selection.
- Delete hides components. Ctrl/Cmd+Z undoes; Ctrl/Cmd+Shift+Z redoes. Escape cancels an active drag.
- T opens the 34 authored road control points. Edit horizontal coordinates, elevation and width. Road attachments follow; fixed background buildings remain in place unless edited directly.
- **Show original** compares the source baseline without discarding edits. Fog and handles are inspection toggles; they do not change runtime defaults.
- **Download edits** is the handoff to Codex. Keep that JSON and share it back. **Load edits** verifies source identity, catalogue, values, history and hashes before replacing the scene. Local recovery is a convenience, not the only copy.

## What the file records

Exact runtime/editor source identity; stable scene/source identifiers, authored instance/range ordinals, source files/symbols, geometry hashes, material identities and sectors; baseline and final road/shortcut paths, widths, component transforms and deletion tombstones; attachment frames and actual derived world transforms; warnings; applied and undone actions. Matrix arrays are column-major in world metres with +Y up.

The journal uses readable `changes-v1` patches to avoid repeating unchanged roads and components for every action. Import reconstructs the complete undo/redo history and verifies the expanded document digest. Capacity limits reject an oversized edit before accepting it; the last committed design remains downloadable. Files are source-specific and are not automatically rebased onto a later track version.

## Source mapping and limitations

The primary visible scene has 1,691 mapped components and 78 source-defined building groups. Atmosphere/particle families remain inspection-only. Unknown families are not editable. Authored merged index ranges are extracted only in editor-owned geometry; unresolved interiors remain explicitly labelled combined components. Production batching and source buffers are unchanged.

Road editing visually deforms immutable baseline buffers rather than invoking production's hard-coded climbing-repair triangulation. Shortcut paths follow their authored entry/exit anchor displacements. Rigid road attachments can be detached; deformable road surfaces cannot be detached because that would discard their current deformed shape. Inserting/removing road points, arbitrary face/vertex editing, driving, collision/AI/checkpoint certification and automatic application to game source are outside this version.

Layout changes require later junction/topology, final surface UV reconstruction, collision, shortcut, AI, budget and owner review. Steep grades produce a warning; finite geometry and a closed centreline do not establish drivability or absence of intersections. Software WebGL/browser results are not representative-device G-05 certification. No graphics limit or test threshold was raised.

## Evidence and reproducibility

- `tools/editor/neon-grid-assets.json`: 11 exact approved source assets, source Git blobs, payload SHA-256 values and LFS OIDs where applicable; 16,215,056 payload bytes. Build rejects pointers, invalid signatures and changed approved bytes before copying. No duplicate runtime texture source files added.
- `tools/editor/verify-neon-grid-editor.mjs`: mixed editing/export/fresh-import verification; source-addressed buffers/paths/transforms; corrupt import rollback and browser errors.
- `tools/editor/verify-neon-grid-gestures.mjs`: actual camera/marquee/gizmo gestures and matched source-mesh/editor views.
- `browser/verification.json`, `gestures/verification.json`: measured results and source identity. Captures and a mixed-session handoff are included in the separate evidence archive; selected screenshots accompany this index.
- `validation.json`: exact command outcomes, limitations and independent review fixes. Hosted checks are reported separately; this nonproduction PR does not match the existing PR-to-main CI trigger.
- `FILE-MANIFEST.json`: evidence-file SHA-256 values. Portable build has its own manifest and `review-build.json`, recording the exact editor build source SHA.

## Review boundaries

The independent final review identified journal size, save-during-drag, and stale asynchronous import hazards. Regression tests cover compact lossless history/capacity, deferred save after cancellation, and rejecting stale import results. No production source, approved artwork, runtime assets, source pins, Pages publication workflow, gameplay requirement, PR #242 state or Stage C state is changed by this checkpoint. Public editor publication and application of downloaded proposals require separate owner approval.

## Matched source rendering

Actual canvas captures compare untouched source merged meshes with the editor-extracted authored ranges, at the same cameras with helpers off. Of 789,236 pixels per view, 3 Skyline, 34 Undercity, 28 Tunnel and 0 Falls pixels differ. This is over 99.995% pixel equality for each view; the small raster differences are recorded rather than claiming universal byte identity. Complete paired captures are in the evidence archive.
