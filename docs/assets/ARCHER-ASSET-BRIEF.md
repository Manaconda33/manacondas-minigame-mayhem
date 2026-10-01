# Archer Asset Brief

The approved character/kart specification and AA-13 mapping are recorded in `docs/avatars/ARCHER.md`. The supplied sheet governs likeness, kart shape, ivory/gold/purple palette and VHS/glitch styling. Each of fourteen source art outputs was approved individually; the exact original bytes are listed in `docs/evidence/2026-10-01-archer/approved-art-ledger.json`.

## Delivery preparation remaining

- COMPLETE: portrait 256 × 256; ten drivers 512 × 512 RGBA. Uniform premultiplied resizing and shared 16px driver inset preserve original pose positions; no cropping, repainting, alpha thresholding, wheel or kart added. Cockpit mounting remains a later geometry/integration check.
- COMPLETE: selection and both results delivery files retain the exact approved 1024 × 1536 RGBA bytes. All 14 images fully decode and were visually inspected together against a dark background.
- Prepare deterministic kart LODs and a four-view geometry review with new candidate URLs/filenames. Validate hierarchy, triangle budgets, structural attachment, forward metadata and modeled steering wheel.
- Bind controlled, base-aware revisioned URLs and all ten driver states; verify chase and rear cameras and fallbacks.
- Integrate page navigation and AA-13 without remapping existing profiles. Record the approved roster expansion in PRD/decisions before runtime integration.
- Verify current graphics/exhaust integration and eight-racer identity sampling against latest main.
- Complete hosted validation, owner gameplay review and explicit publication approval before production activation.

## Publication boundary

Source masters under `public/assets/characters/aa-13/source/` are LFS-governed. Source masters cannot be pushed because shell Git/LFS authentication is unavailable. They are excluded from remote publication and retained locally for authenticated external LFS handoff; the Actions bridge cannot reproduce AI-generated source images. All 14 verified runtime derivatives use the existing normal-Git delivery exceptions. Manny requested repository delivery on 2026-10-01; production activation remains separate.

## Geometry review prepared

Candidate 1 has deterministic LOD0/1/2 (11,636 / 6,612 / 4,340 triangles), thirteen required nodes, four materials and -Z forward. Actual depth-buffered four-view sheet and direct LOD0 GLB are available under `tools/assets/candidates/archer-kart-candidate-1-*`. Steering shaft, axles, side blades, trim, emblem and rear outlets were inspected for structural attachment. Kart name and geometry owner approval remain pending. No publication or live mounting is inferred.

## Kart candidate 2 — requested emblem / steering corrections

Manny's screenshots identified an underdeveloped bow/arrow emblem and a steering wheel/column facing the nose. Candidate 2 replaces the segmented emblem with continuous swept recurve limbs, a fine string, solid arrowhead and fletching, and a raised magenta gem in a gold bezel. The entire badge follows and intersects the hood surface. The wheel mount moves to (0, 1.22, -0.14), beyond the hood's rear edge at -0.42; its top leans noseward so its face points toward the seated driver (+Z). The column base is at (0, 0.60, -0.69), ahead of the wheel and embedded in the hood/tub.

The steering regression failed on Candidate 1 and passes on Candidate 2. All actual GLBs pass node/material/forward/finite-position/budget checks and reproduce identical hashes. LOD0/1/2: 12,088 / 6,704 / 4,316 triangles. New candidate filenames preserve prior review links. Four-view and close-up sheets render the actual geometry; runtime cockpit mounting remains pending. Exact hashes: `docs/evidence/2026-10-01-archer/kart-candidate-2.json`. Geometry owner approval remains pending; no remote publication or runtime activation.

## Kart candidate 3 — arrow direction refinement

Manny accepted the improvement in Candidate 2 and requested one remaining tweak: arrowhead toward the curved bow rather than the string. Candidate 3 reverses the arrow along its existing axis, exchanging head/tail direction while retaining the bow, string, jewel and corrected steering geometry. Candidate 2 review files remain available; Candidate 3 uses new filenames. Final geometry approval remains pending.

## Candidate 3 geometry approval

Manny explicitly approved the corrected Candidate 3 on 2026-10-01 (America/Chicago). Its three exact approved hashes are in the Candidate 3 ledger. Runtime delivery uses `kart.glb`, `lod/kart-lod1.glb`, `lod/kart-lod2.glb` and the existing deterministic Actions materialization bridge; no direct shell LFS upload is attempted. Driver mounting, kart display name, roster-page integration and owner gameplay review remain pending. No production publication is authorized.

## Kart display name approved

Manny chose **The Precision Shot** on 2026-10-01 (America/Chicago). The GLB approvedName metadata now records that identity; geometry is unchanged. Named-delivery hashes are recorded separately from the original Candidate 3 review hashes.

## Runtime integration checkpoint — review only

The review manifest now includes Archer as AA-13 with approved stats and The Precision Shot, all ten driver states and both approved results poses. Character Select exposes him alone on page two; page one retains the original twelve and navigation preserves selection. Races remain eight unique drivers. Revision: `archer-runtime-20261001-1`; shared PI visual yaw, rear mount `[0, 0.85, -0.12]`, front mount `[0, 0.78, -0.12]`. All ten states were inspected in deterministic offline mounted sheets using actual model geometry and runtime normalization. These are proposed mounts, not actual chase/rear camera acceptance.

Named kart Actions run `36892887641` passed exact rebuild hashes, unchanged pointers, restricted approved-object upload, cache deletion, fetch-back and fsck. Named-package CI `36892887671` passed. Temporary materialization workflow removed. Current object IDs: LOD0 `952ca8e50b69bb5f2bc9d8d4cd4e43f844560bb4069fa23c1c0132ae77fb1e93`; LOD1 `8768f40456320986868e96ea23c0590e4f230a946a050f404d3b07ff0e430423`; LOD2 `620a4fd0f88fbd92d1665598f9ba57b65d436be948161c769af562c976e88a2c`. Original geometry bridge `36890781915` also passed; named metadata changed the hashes without changing geometry.

Local browser verification is blocked: agent-browser daemon socket bind returns `Operation not permitted`; Chromium is absent and browser downloads fail ZIP decoding. Desktop/mobile rendered controls and actual chase/rear mounting remain pending, together with owner gameplay acceptance and separate merge/production authorization. Source-master authenticated LFS handoff remains pending; all runtime bytes are delivered. Earlier pending integration/name/geometry text is historical.
