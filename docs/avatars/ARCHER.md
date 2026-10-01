# Archer — Racer Intake Record

## Approval state — 2026-10-01 (America/Chicago)

- Supplied character/kart sheet: definitive reference, explicitly approved by Manny.
- Character and kart written locks: approved.
- AA-13 Precision Speedster: approved; Speed 8 / Acceleration 5 / Weight 4 / Handling 8 / Mini-Turbo 7 / Traction 4 (36 total).
- Placement: first entry on Character Select page two; existing twelve remain on page one.
- Portrait, bow-holding full-body selection art, ten race-driver frames, full-body podium victory and lower-finish reaction: individually approved by Manny in this Work session.
- Source art alpha inspection: all fourteen RGBA PNGs have transparent corners and fully transparent background pixels.
- 2D runtime delivery prepared: portrait 256×256, ten drivers 512×512 with shared canvas positions and 16px inset; selection/results 1024×1536 retain approved bytes. Kart geometry, integration, deployed testing and production publication remain pending. No runtime acceptance is inferred from art approval.
- Manny explicitly directed completion of the 2D asset flow and delivery to the repository on 2026-10-01. This authorizes the asset review branch; no production activation is inferred.

## Character lock

Purple skin, mature angular face, glowing magenta eyes, stern expression, ivory hood and layered ivory armor with gold trim, dark/purple inner cloth. Preserve the reference's pixelated VHS/glitch styling. Selection art holds an undrawn dark purple/gold/magenta recurved bow low across his body, following Manny's supplied pose reference. Drivers are wheel-free, character-only seated upper-body sprites; the bow is reserved for selection/results art.

## Kart lock

Reference-matched low pointed ivory bodywork, gold edging, purple accents, bow-and-arrow hood emblem, gold wheel detailing and magenta exhaust energy. Preserve the reference's construction and visual identity. Kart name is not yet assigned. Build one modeled steering wheel and the required node hierarchy, with deterministic LOD0/1/2 and `extras.forward: "-Z"`; use the shared PI visual correction at runtime. Camera attachment, sprite alignment and current exhaust anchors require actual verification.

## Evidence and boundaries

`docs/evidence/2026-10-01-archer/approved-art-ledger.json` identifies the exact approved source PNGs, hashes, dimensions and alpha observations. Original bytes are retained locally under `public/assets/characters/aa-13/source/` and remain LFS-governed. Authenticated source-master upload is blocked: shell Git/LFS has no credentials. Source masters are excluded from the remote commit rather than publishing unresolved pointers or bypassing LFS. `runtime-art-ledger.json` records all 14 delivery hashes; `python tools/assets/prepare_archer_2d.py --verify` fully decodes and validates the delivery package without source masters. Actual mounted cockpit alignment awaits the kart.

Archer is not yet in the runtime manifest. Existing AA-01–AA-12 mappings, eight-racer grid, physics, items, accepted graphics, audio and UI remain unchanged. The asset delivery branch was refreshed onto main `4fe73c58e4c51201f917658e705fca8b2b3db8ec`, including the accepted exhaust release. Refresh main again before runtime integration.

## Kart geometry candidate 1 — local owner review

Reference-based ivory tapered prow, gold edge strips, purple aerodynamic side blades, embedded bow/arrow hood emblem and magenta gem, open dark seat, gold-spoke purple wheels, rear engine vanes and paired gold-collared magenta exhaust outlets. No wheel or prop is baked into driver art. One inclined modeled steering ring with a column extended into the structural tub. Kart name remains unassigned.

LOD0 / LOD1 / LOD2: 11,636 / 6,612 / 4,340 triangles; all below 25,000 / 12,000 / 5,000. All have the required 13 nodes, four vertex-colored materials and -Z forward metadata. Independent tests build and parse actual GLBs and repeat each build to prove identical hashes. Four-view sheet uses depth-buffered rendering of actual mesh geometry; no illustrative embellishment or live-lighting claim. Exact candidate inventory: `docs/evidence/2026-10-01-archer/kart-candidate-1.json`.

Structural review: steering-column base at y=0.58 intersects the tub's y=0.33–0.59 envelope; wheel axles cross the tub and all tire centers; exhaust shells span z=1.28–1.86 and overlap the engine casing through z=1.62. Hood emblem tubes penetrate the sloped hood by 0.013 m; purple side blades overlap armor side panels and front axles. Gold edge tubes overlap their blade/hood supports. Actual mounted chase/rear views remain pending; shared PI visual correction is required at integration.

Candidate is local and not added to the 2D asset PR or the runtime manifest. Await geometry review before delivery/integration.

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

## GitHub Pages preview published — 2026-10-01

Manny explicitly approved “merging preview only approved. Provide the preview link so I can test.” Workflow-only PR #226 merged at `403d7bb1a8d7fc8002a06853557295fc33eabc39`. CI/Pages run `36899647137` passed validation and deployment. Preview: https://manaconda33.github.io/manacondas-minigame-mayhem/previews/archer/. The preview pins tested runtime `62583845461098caee5fec3e1334502da671de1d`. HTTP 200 and exact SHA-256 matches were verified for preview HTML, both JS bundles, CSS, all fourteen runtime PNGs and all three named kart GLBs; evidence: `preview-delivery.json`.

Root game retains twelve drivers and accepted bloom; no Archer roster production merge is authorized. Actual owner desktop/mobile page controls and chase/rear driver mounting review remain pending. Earlier preview-publication-approval-pending wording is historical.
