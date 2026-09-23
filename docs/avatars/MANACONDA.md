# Avatar intake: Manaconda

- **Intake date:** 2026-08-16
- **Current phase:** Driver-art and Wayfinder packages approved; runtime integration staged for validation
- **Intake status:** Approved
- **Character lock:** Approved by Manny on 2026-08-16
- **Kart lock:** _The Wayfinder_, approved by Manny on 2026-08-16
- **Balance mapping lock:** AA-09 Technical Cruiser, approved by Manny on 2026-08-16
- **Asset approval:** Portrait, all five driver states, and wheel-free Wayfinder GLBs approved by Manny on 2026-08-20
- **Implementation verification:** Live mobile production checkpoint accepted; separate desktop evidence not yet recorded

This record preserves Manny's supplied writing and racing image as a source reference. The image is approved for transformation into production game assets; its green explorer kart remains an example, not a visual lock.

## Identity and visual locks

- **Stable internal ID:** aa-09
- Rugged Latino scholar-explorer in his forties; weathered olive skin, dark gray-streaked curls, thick well-kept beard, sharp observant eyes, and signature rectangular blue glasses.
- Worn layered leather armor, durable expedition clothes, indigo scarf, deep-purple tassels, and a large pack of ancient tomes, maps, notes, and field gear.
- **Driftwood Crest:** two root-like branches emerge from the temples, remain separate from hair and above the ears, then flow strictly backward along the Z-axis toward the backpack. They may carry tiny white blossoms. Never sideways, antler-like, crowning the face, or growing from the hairline.
- **Paprika:** a small loyal red fox kit tucked into the scarf or resting at the neck/shoulder. Never obscure Manaconda's face, glasses, steering hands, or kart silhouette.
- At small scale retain glasses, backward crest, gray-streaked hair/beard, indigo scarf, leather silhouette, and red-fox companion. Fine blossoms, book titles, armor tooling, and map writing may simplify.

## The Wayfinder: locked kart

- Compact arcane overland expedition kart assembled from a scholar-explorer's field equipment, not a conventional race shell.
- Battle-worn dark hardwood and weathered leather panels over a compact aged copper/brass mechanical frame; low, protected, recessed cockpit.
- Simplified copper-cube navigation core behind a small protective grille, with a subtle glow only.
- Palette: dark walnut, worn leather, aged copper/brass, indigo cloth, muted parchment tan, restrained core glow.
- Signature details: mini field satchel behind cockpit, short side-mounted capped expedition-tube exhausts, detachable scroll/map case.
- The steering wheel must visibly sit in front of Manaconda in chase view, with no clipping of driver, Paprika, scarf, crest, glasses, or pack.
- Prohibited: copied map graphic, unexplained 42, Manaco Prix '24 text, real racing marks, glossy supercar bodywork, towering cargo, or a green carved duplicate of the reference kart.

## Gameplay and roster mapping

- **Driving feel:** composed route-reading cruiser—stable at useful speed, capable of deliberate corrections, neither twitchy nor tank-like.
- **Assigned profile:** AA-09 Technical Cruiser — Speed 7 / Acceleration 6 / Weight 6 / Handling 6 / Mini-Turbo 6 / Traction 5.
- **Rationale:** Speed 7 supports journeying momentum; evenly capable middle values reward deliberation; Weight 6 gives the equipped field vehicle substance; Traction 5 keeps a meaningful off-road weakness.
- **Approval:** Manny approved AA-09 on 2026-08-16.

## Required assets

| Asset                                                                    | Required format                                 | Status                |
| ------------------------------------------------------------------------ | ----------------------------------------------- | --------------------- |
| Portrait                                                                 | 256 x 256 transparent PNG, sRGB, straight alpha | Approved and prepared |
| Rear / steer-left / steer-right / hit / victory                          | 512 x 512 transparent PNG, sRGB                 | Approved and prepared |
| Front / front-steer-left / front-steer-right / front-hit / front-victory | 512 x 512 transparent PNG, sRGB                 | Approved and prepared |
| The Wayfinder                                                            | GLB with PRD hierarchy and LOD budgets          | Approved and prepared |

## Approval record

- Character lock, kart lock, balance mapping, and source transformation: approved.
- Portrait, rear, steer-left, steer-right, hit, and victory: approved by Manny on 2026-08-20 and prepared at the PRD runtime paths.
- Front was approved on 2026-08-31. Front-steer-left, front-steer-right, front-hit, and front-victory were approved on 2026-09-01 with exactly one sprite-owned wheel in each frame.
- Manny approved the wheel-free Wayfinder LOD0, LOD1, and LOD2 package on 2026-08-20. The required `SteeringWheel` hierarchy node remains as an empty runtime anchor because all approved Manaconda driver frames already contain the visible wheel.
- The AA-09 manifest entry selects Manaconda's portrait, ten driver states, Wayfinder GLB, Technical Cruiser statistics, and controlled `manaconda-runtime-20260901-3` asset revision.
- The first deployed integration at merge commit `63f2af05ba4a8631594786f2d4ea171b5278778a` passed portrait, Wayfinder loading, duplicate-wheel, and steering-state checks on Manny's mobile device. The chase-camera check failed because the navigation grille faced backward.
- Runtime camera evidence supersedes the GLB metadata assumption: Wayfinder requires a 180-degree visual-root yaw to align its grille/navigation core with race forward. This transform changes only the rendered model; physics, controls, checkpoints, camera, and driver sprite remain unchanged.
- Orientation hotfix merge `b88eb635bf928e52a5e34ad218b938fcd7610cfc` deployed through successful Actions run `32430647474`. Manny confirmed on mobile that the navigation grille now faces race-forward with the satchel and exhausts behind him.
- The live mobile production package is accepted. A separate desktop check remains unrecorded under the cross-platform acceptance matrix.
- The four-state front-action package is deployed from merge `7b58fdff7ca3c0d67a4ca70c1df0f6ddf287889f` under `manaconda-runtime-20260901-3`.
- Manny accepted the live front-action package on 2026-09-01 against deployed checkpoint `2ca852b47f16b8221275ee2b5542650d609b9a0d`. Both steering directions, hit, victory, chase-state restoration, cockpit placement, transparency, and the single sprite-owned wheel pass.

## Next action

Preserve the accepted front-action files, controlled revision, placement, and single-wheel contract during later roster work.

## Character Select full-body selection art

- Runtime asset: `public/assets/characters/aa-09/selection/full-body.png`.
- Format: 1024 × 1536 transparent sRGBA PNG, normal-Git runtime delivery derivative under ADR-092.
- Approval: Manny approved Manaconda's selection-only full-body asset in the 2026-09-19 Character Select batch review.
- Boundary: Character Select only; the approved portrait, race driver package, The Wayfinder identity/geometry, statistics, and PBR/material implementation remain unchanged.

## Results/Podium victory art

- Runtime asset: `public/assets/characters/aa-09/results/victory.png`.
- Format: 1024 × 1536 transparent sRGBA PNG, normal-Git fixed-size runtime derivative under ADR-093.
- Approval: Manny approved the quiet compass salute with Paprika on 2026-09-23 using the approved Character Select full-body asset as the identity reference.
- Provenance and runtime SHA-256: recorded in `docs/ASSET-PROVENANCE.md` and `docs/assets/ROUTE-NIGHT-RACE-RESULTS-ASSET-BRIEF.md`.
