# Manaconda asset brief

## Authority and source

- Character, The Wayfinder, and AA-09 Technical Cruiser were approved by Manny on 2026-08-16.
- Manny supplied the reference and approved transforming it into production game assets.
- The reference supplies identity and general kart-racing context only. Its pixel/comic collage treatment, vehicle geometry, green palette, course-map graphic, number 42, and Manaco Prix '24 text are not production-art requirements.
- Keep original source unchanged; derived candidates and production files have separate filenames and approval states.

## Production style

- Polished, colorful, kinetic, high-contrast Manaconda's Minigame Mayhem presentation.
- Original visual language; no copied character, vehicle, UI, pixel-art, or comic-panel treatment.
- A 2D illustrated driver must sit convincingly within a stylized 3D kart, with race-scene-consistent lighting.

## Locked character identity

- Rugged Latino scholar-explorer in his forties: weathered olive skin, dark gray-streaked curls, thick well-kept beard, sharp observant eyes, rectangular blue glasses.
- Driftwood Crest: two root-like branches emerge at the temples, stay distinct from hair and above the ears, then flow strictly backward along Z toward the backpack. Tiny white blossoms permitted. Never sideways, antler-like, crown-like, or hairline-grown.
- Worn layered leather armor, durable travel clothing, indigo scarf, deep-purple tassels, and a large pack of ancient tomes, maps, notes, and gear.
- Paprika is a small red fox kit tucked into the scarf or resting at the neck/shoulder. Do not obscure face, glasses, steering hands, or kart silhouette.
- Small-scale read: glasses, backward crest, gray-streaked hair/beard, indigo scarf, leather silhouette, red fox. Fine blossoms, book titles, tooling, and map writing may simplify.

## The Wayfinder

- Compact arcane overland expedition kart built from scholar-explorer field equipment, not a conventional race shell.
- Battle-worn dark hardwood and weathered leather panels over compact aged copper/brass mechanical frame; low, protected, recessed cockpit.
- Copper-cube navigation core behind protective grille; subtle navigational glow only.
- Palette: dark walnut, worn leather, aged copper/brass, indigo cloth, muted parchment tan, restrained core glow.
- Details: mini field satchel behind cockpit, short capped expedition-tube exhausts, detachable scroll/map case.
- Prohibited: copied map graphic, unexplained 42, Manaco Prix '24, real racing marks, glossy supercar bodywork, towering cargo, or a green carved duplicate of the supplied reference.

## Portrait candidate 1

- First visual approval anchor before seated driver-state art or GLB.
- Square, genuinely transparent background; head, shoulders, upper torso, readable backward crest, Paprika visible without crowding face.
- Expression: calmly alert, quietly curious, burdened but capable—not grimly angry.
- Clear near 48 px: glasses, face, beard/curls, indigo scarf, crest direction, fox.
- No text, logos, watermark, kart, racing number, border, pixel art, sideways crest branches, generic antlers, standalone-fox composition, or cartographic text.

## Required production deliverables

| Asset                                                            | Format                                          | Approval                         |
| ---------------------------------------------------------------- | ----------------------------------------------- | -------------------------------- |
| Portrait                                                         | 256 x 256 transparent PNG, sRGB, straight alpha | Approved and prepared 2026-08-20 |
| Rear / steer-left / steer-right / hit / victory                  | 512 x 512 transparent PNG, sRGB                 | Approved and prepared 2026-08-20 |
| Front                                                            | 512 x 512 transparent PNG, sRGB                 | Approved and prepared 2026-08-31 |
| Front-steer-left / front-steer-right / front-hit / front-victory | 512 x 512 transparent PNG, sRGB                 | Approved and prepared 2026-09-01 |
| The Wayfinder                                                    | GLB with PRD hierarchy and LOD budgets          | Approved and prepared 2026-08-20 |

Each candidate needs Manny's approval. Manny approved the portrait, all five driver-state derivatives, and the wheel-free Wayfinder GLB package on 2026-08-20.

## Approved Wayfinder checkpoint

- Runtime paths: `public/assets/characters/aa-09/{kart.glb,kart-lod1.glb,kart-lod2.glb}`.
- LOD0 is 9,312 triangles and 305,148 bytes; LOD1 is 4,576 triangles and 168,860 bytes; LOD2 is 2,312 triangles and 100,092 bytes.
- All three are deterministic glTF 2.0 binary containers with four materials, meters, negative-Z forward metadata, and the exact thirteen-node PRD hierarchy.
- The visible steering-wheel mesh is intentionally absent because the approved 2D driver frames contain the wheel. The required `SteeringWheel` node is retained without a mesh as a compatibility anchor.
- SHA-256/LFS object IDs: LOD0 `5498567abf25339b2a9f876f2bb81079d263c80afeea4a7c1b0181a36fdfd446`; LOD1 `9465ca4cb7d75c9a80c30ac09414c94bf35c95e82a26784735376df736191390`; LOD2 `4a2e2a43c147bd7fca0ae07edd7fbf612ac067e47f185b87431290de36e45fe0`.

## Approved driver-art checkpoint

- Runtime paths: `public/assets/characters/aa-09/portrait.png` and `public/assets/characters/aa-09/driver/{rear,steer-left,steer-right,hit,victory}.png`.
- Portrait is 256 x 256; each driver state is 512 x 512.
- All six files are sRGB RGBA PNGs with genuine transparency, alpha spanning 0 to 1, and transparent corner pixels.
- Dark and light background composites were visually checked after deterministic checkerboard extraction.
- Crest continuity is locked across states: two independent temple roots, never a central growth or sideways antlers.
- Paprika remains on the same physical shoulder across rear and steering states.
- Manny approved the corrected legs-apart front seated pose on 2026-08-31. Deterministic checkerboard removal produced `driver/front.png`; SHA-256 `9ef86e2e8297833fdb9df5dee62ba6485bce00228ab0c297c296f757ef92d4cd`.
- Manny approved all four camera-facing action frames on 2026-09-01. Each preserves the approved front footprint, identity locks, Paprika, and exactly one visible sprite-owned steering wheel. Runtime paths are `driver/front-steer-left.png`, `driver/front-steer-right.png`, `driver/front-hit.png`, and `driver/front-victory.png`.

## Runtime delivery requirements

- Derivatives live at public/assets/characters/aa-09/: portrait.png, ten driver PNGs, and LFS-governed GLBs.
- Manifest URLs use a controlled base-aware revision whenever stable runtime bytes change.
- Pages materializes LFS, passes git lfs fsck, and rejects an LFS pointer or invalid glTF binary signature before deployment.
- Runtime preloads all ten states. Player and AI preserve victory, hit, and steering while selecting the matching chase- or camera-facing frame.
- Chase and rear cameras must confirm the nose and steering wheel face forward of Manaconda. Any axis correction applies only to the visual root and is recorded.
- Acceptance requires desktop and mobile confirmation of portrait, production kart, all five driver states, and orientation.

## Runtime integration checkpoint

- Controlled revision: `manaconda-runtime-20260901-3` on the portrait, Wayfinder, and all ten driver URLs.
- Manifest identity: AA-09 production character `Manaconda`, `Technical Cruiser`, The Wayfinder, approved 7 / 6 / 6 / 6 / 6 / 5 statistics.
- Visual-root yaw: 180 degrees around local Y. Although the GLB declares negative-Z forward, the deployed chase camera proved the grille/navigation core faced backward at zero yaw. Runtime visual evidence is authoritative; physics coordinates remain unchanged.
- The production build signature gate covers all three AA-09 GLBs in addition to Lavi's package.
- Portrait, Wayfinder loading, duplicate-wheel treatment, and steering states passed Manny's first live mobile check at merge commit `63f2af05ba4a8631594786f2d4ea171b5278778a`.
- Orientation hotfix merge `b88eb635bf928e52a5e34ad218b938fcd7610cfc` deployed through successful Actions run `32430647474`; Manny confirmed the grille/navigation core faces race-forward and the rear satchel/exhausts remain behind him.
- Live mobile acceptance is complete. Separate desktop evidence remains unrecorded.
- Front-action PR #62 merged at `7b58fdff7ca3c0d67a4ca70c1df0f6ddf287889f`; main run `33507775105` passed validation and Pages deployment. All four deployed response hashes match the approved files.
- Manny accepted the live front-action package on 2026-09-01 against deployed checkpoint `2ca852b47f16b8221275ee2b5542650d609b9a0d`. Camera-facing steering in both directions, hit, victory, chase-state restoration, cockpit placement, transparency, and the single sprite-owned wheel all pass.

## Character Select full-body selection art

- Runtime asset: `public/assets/characters/aa-09/selection/full-body.png`.
- Format: 1024 × 1536 transparent sRGBA PNG, governed by Git LFS.
- Approval: Manny approved Manaconda's selection-only full-body asset in the 2026-09-19 Character Select batch review.
- Boundary: Selection-only art; the portrait, race driver frames, The Wayfinder kart package, statistics, and PBR/material implementation remain unchanged.
