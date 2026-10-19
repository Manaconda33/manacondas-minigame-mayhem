# Neon Grid visual layout editor — design

Date: 2026-10-19
Status: owner confirmed feature scope; written design awaiting review.
Repository: Manaconda33/manacondas-minigame-mayhem

## Purpose and agreed scope

Provide Manny with a separate browser editor of the current primary Neon Grid visual version. Manny can navigate the scene, select components, reshape the road, and download a precise design-change record for a later source implementation. The editor is a visual authoring tool; driving and gameplay simulation are outside this increment.

The owner confirmed: browser delivery; object/component transforms rather than face or vertex modelling; track control-point, elevation and width editing; road-attached elements following road edits; background buildings retaining their authored world placement; camera controls without driving.

## Source and visual contract

- Primary runtime source: addab4c7c2421f52c4731691b8a9f3e2d9e39f94.
- Current C2 documentation checkpoint: 99453711a86760d87a84ba427d2799d33056e55b.
- Active Task A/B/C1 base: 91393418c9b219fb5689c2041fb98325aa1e7b41.
- Primary selectors: neonGridMaterial=concrete-coverage-c2-001 and neonGridVisual=c2-task-a-fog-overlay.
- Live main observed during design: bc6160a8ab23dd07c6425a9c25b929fe9abc29be.
- Existing C2 draft PR: #317, open against the active nonproduction line.

Construct the actual source scene, using the approved Concrete Wall 007 assets, C2 background composition, existing Fog V3.2 treatment and inherited Task A Billboard placement. Reuse the scene's lighting, tone mapping and bloom pipeline; do not substitute a generic grey model or approximate background. Use a deterministic visual clock for repeatable editing. Document unavoidable differences caused by free camera viewing and absence of racers. Selection helpers are editor overlays and do not become scene content.

Changes live in an editor document. Opening the editor, changing a scene, or downloading a document never writes to GitHub or changes the game.

## Browser experience

Desktop mouse and keyboard are the primary editing interface.

- Orbit, pan and zoom; optional free-fly camera; top/front/side views; frame selection and fit course.
- Click selects one component. Ctrl/Cmd-click toggles membership. Drag on empty viewport performs marquee selection; a dedicated marquee tool avoids ambiguity with camera gestures.
- Selected components receive a visible outline or bounding box and readable name. Selection remains identifiable through fog; normal appearance remains visible when helpers are hidden.
- Move, rotate and scale gizmos with world/local axes. Numeric position, rotation, scale and width/height/depth fields; optional snapping.
- Multiple selections transform around a visible common pivot. Mixed dimensions are labelled. Escape cancels a drag without adding history.
- Delete hides selected components as reversible document tombstones. Undo/redo covers transforms, dimensions, deletion, track edits and attachment changes. One complete drag produces one undoable action.
- Searchable, sector-grouped object list; selection and visibility filters; original/edited comparison; reset with confirmation.
- Download edits, load edits, local recovery/autosave, and a visible unsaved state. Browser storage failure must not imply a successful save.

The starting view presents the entire course and offers sector bookmarks. Fog and selection-helper inspection toggles are view settings, distinct from design edits. Approved artwork pixels and material families are not painting tools in this version.

## Component catalogue and source mapping

The course includes InstancedMesh batches and merged geometry. A Three.js UUID or a batch name alone is not a sufficient edit identity.

Build a versioned baseline catalogue with deterministic IDs. Each entry records its semantic component, sector, parent/logical group, source file and constructor/generation locator, named scene path, source-pinned instance ordinal or authored geometry range, baseline local/world transform, geometry fingerprint, original dimensions, material identity, and attachment policy.

Expose individual instances as selectable components without changing production batching. Where an authored building consists of foundation, windows, roof equipment or lights, provide a logical building group and independently identified parts where their relationship can be established deterministically. Selecting a single building must not accidentally transform its whole instanced batch.

For merged geometry, expose authored component ranges only when the source provides or can deterministically supply a boundary. Editor-only extraction or selection proxies are permitted. Arbitrary face editing and guessed semantic boundaries are excluded. A merged component without a reliable internal mapping is clearly labelled as one combined component. No editable component may be exported with an unknown source mapping.

Source-pinned instance ordinals are valid only with the matching catalogue fingerprint and source commit. A different build cannot silently reuse them.

## Road editing and attachment rules

The baseline uses a closed centripetal Catmull-Rom curve with 34 control points in src/game/track/neonGridLayout.json. Show handles for those existing points, plus numeric horizontal position, elevation and road-width controls. Existing point identities persist through edits. Inserting/removing points is not required for version 1.

The unedited editor document must reproduce the original centreline and existing sector width transitions. Width editing uses an explicitly versioned width profile rather than silently replacing the current Undercity narrowing. Regeneration must maintain a closed seam and finite, nondegenerate geometry; reject invalid numeric inputs and zero/negative dimensions.

The road-binding catalogue explicitly identifies road surface, barriers, markings, signs and attached supports. These follow the edited road through their source progress, lateral offset, vertical offset and orientation rules. Recompute dependent ribbons and physical UV scale where appropriate. Background buildings stay at their original world placements unless the owner edits them. Logical building dependents follow their building edits.

Users can explicitly detach an attachment or change its binding where supported; those actions are recorded. Selecting an attached object must make its follow-road status visible.

Service Tunnel, Billboard Gap and Waterfall Dive are separate paths with junction-specific source logic. Display and identify them explicitly. Their road-bound portals and endpoints must follow their declared source anchors; any connection that cannot be regenerated reliably is flagged in the viewport and export. The download must record original and edited shortcut paths/anchors and all unresolved reconnection work. A disconnected proposal remains useful for design, but must never be presented as playable or ready for runtime application.

Regenerate from immutable baseline data plus document state. Rebuilding the road must preserve existing background edits, selection identities and undo history. A cancelled or failed rebuild keeps the previous valid scene and document.

## Export and import contract

Download a UTF-8 JSON document with a versioned schema. Include:

1. Repository, exact baseline/runtime and editor build commits, selectors, units, axis conventions, deterministic scene settings, catalogue version and fingerprints.
2. Full baseline and final road control points, width profile, shortcut paths/anchors and attachment policies.
3. Catalogue entries for all edited/deleted components, including source locators, baseline geometry fingerprints and original transform/dimension values.
4. Final component overrides, deletion tombstones, logical groups, attachment overrides and derived changes caused by road edits.
5. Applied action journal with stable action IDs and before/after values, undo cursor and redo state. Final document state is authoritative; undone actions must not be applied.
6. Human-readable change summary, counts, warnings and unresolved junction or source-mapping requirements.
7. Camera and inspection settings separately from design edits, plus integrity hashes of canonical baseline/catalogue and final design sections. These hashes detect mismatches; they do not authenticate authorship.

No arbitrary scripts, executable expressions, credentials or texture binaries enter this JSON. Validate schema, file-size limits, finite numbers, IDs, ranges and matrix constraints before applying imports. Reject unknown/incompatible versions and baseline mismatches without changing the current document. Never partially apply a corrupt import.

Export/import into the same baseline must reproduce final transforms, deletions, road geometry and binding results within documented numeric tolerances. The export must be sufficient for a future implementation to map every edit back to source. That future implementation still requires review of collisions, AI, shortcuts, checkpoints, budgets and gameplay requirements; the editor does not grant production approval.

## Implementation boundaries

Use a separate editor entrypoint and modules, reusing the existing Three.js dependency and actual scene factories. Use existing Three.js camera/transform helpers where suitable. Separate the serializable editor document, source catalogue/adapters, command history, scene projection, selection and interface.

If scene construction requires injectable layout data, keep the default game construction identical and isolate editor inputs behind an explicit entrypoint. Do not mutate imported shared layout objects, shared materials or geometry owned by the game. Editor extraction, gizmos and overrides remain editor-only. Dispose editor-created GPU resources, textures, event handlers and controls correctly on reset and teardown.

A dedicated implementation branch starts from the verified C2 checkpoint. It must not overwrite PR #317 or merge into main. Prepare a local review build and draft PR. A shareable editor publication must use a separate bounded preview path and preserve current production and existing previews. Present its exact source and publication diff for the final owner publication gate before any main merge or deployment.

## Acceptance and validation

- Matched baseline views demonstrate the primary C2/Fog V3.2 appearance in Skyline, Undercity, Tunnel and Falls Run, including sponsor and Billboard continuity.
- Browser interaction verifies camera navigation, individual instance picking, Ctrl/Cmd selection, marquee selection, grouped transforms, dimensions, deletion, cancellation and undo/redo.
- A building edit does not move its batch neighbours; logical children follow the selected group; merged-range edits do not damage adjacent geometry.
- Road edits update declared road attachments while background buildings and their independent edits remain fixed. The closed seam, elevation, widths and shortcut warnings are checked.
- A deliberate mixed edit session exports, reloads and reproduces the final scene. It includes a deletion, multi-selection transform, height/width change, road edit, undo and redo.
- Corrupt files, wrong source/catalogue IDs, invalid numeric input and resource-load failures produce explicit recoverable errors.
- Unit tests cover meaningful document/history/identity/binding/import-export behaviour. Typecheck, zero-warning lint, relevant regressions, production/editor builds, asset/provenance/LFS verification and diff checks run as applicable. Report full-suite failures truthfully without weakening thresholds.
- Verify default game construction, selectors, asset hashes, collision inputs and existing publication workflows remain unchanged.
- Report baseline and edited render counters and editor overhead separately. Editor helpers are not evidence of a production graphics-budget change or G-05 certification.

## Review gate

This written design captures the owner's confirmed scope and the source-specific constraints found during inspection. Review and approve it before writing the implementation plan and editor code. The finished editor's publication and any later application of exported changes to the live track are separate reviewable operations.
