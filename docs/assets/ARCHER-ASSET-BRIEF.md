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
