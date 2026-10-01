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
