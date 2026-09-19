# Krios avatar record

## Identity

- Display name: Krios
- Stable internal ID: `aa-10`
- Pronouns: he/him
- Selection descriptor: Towering ram-horned brute; proud, loyal, and relentlessly dominant.
- Character lock: Approved by Manny on 2026-08-22

Krios is a towering, massively muscled red brute with black ridged ram horns, swept-back black hair, pointed ears, gold eyes, and a huge wild black beard divided into metal-bound braids. His rugged leather harness, heavy bracers, flame markings, and severe expression reinforce a proud, loyal, aggressive, dominant identity. He must remain visibly larger and more intimidating than the average roster character.

## Kart direction

- Kart name: The Hornbreaker
- Kart lock: Approved by Manny on 2026-08-22
- Design authority: the supplied Krios racing reference is definitive

The Hornbreaker is a low, broad infernal battle-kart and hot-rod hybrid with weathered dark metal bodywork, red flame markings, large ram horns integrated into the nose, an open cockpit sized for Krios, oversized studded tires, and twin rear exhausts with visible flame. It must read as savage, fast, forceful, and space-controlling without hiding Krios behind excessive armor.

## Gameplay mapping

- Profile: AA-10 Straight-Line Heavy
- Class: Heavyweight
- Stats: Speed 10 / Acceleration 4 / Weight 9 / Handling 3 / Mini-Turbo 4 / Traction 6
- Mapping lock: Approved by Manny on 2026-08-22

Krios is a momentum-based heavyweight bully. Speed 10 and Weight 9 create dominant straight-line and collision pressure. Acceleration 4 and Handling 3 make mistakes costly, while Mini-Turbo 4 and Traction 6 preserve a usable but deliberately non-technical driving identity.

## Approved driver art

Manny approved the following art on 2026-08-22:

- `portrait.png`: definitive selectable portrait
- `driver/front.png`: front-camera neutral driving frame
- `driver/rear.png`: neutral chase-camera driving frame
- `driver/steer-left.png`: chase-camera left-turn frame
- `driver/steer-right.png`: chase-camera right-turn frame
- `driver/hit.png`: chase-camera impact-recoil frame
- `driver/victory.png`: seated over-the-shoulder victory frame
- `driver/front-steer-left.png`: front-facing left-turn frame
- `driver/front-steer-right.png`: front-facing right-turn frame
- `driver/front-hit.png`: front-facing impact-recoil frame
- `driver/front-victory.png`: front-facing dominant victory frame

All eleven approved runtime derivatives are sRGB RGBA PNGs with genuine transparency. The portrait is 256 x 256; all ten driver frames are 512 x 512. Character layers contain no kart or steering-wheel geometry. The camera-facing steering and victory frames preserve two transparent enclosed horn apertures.

## Provenance and transformation

Manny supplied the definitive Krios character-and-kart reference, confirmed that he created or controls it, and authorized its transformation into game assets. Approved generated derivatives preserve Krios's locked likeness. High-resolution working renders are not stored in the fixed-size runtime paths.

## Approval status

- Intake: Approved
- Character lock: Approved
- Kart design lock: Approved
- Kart name: Approved, The Hornbreaker
- Balance mapping: Approved, AA-10
- Portrait: Approved
- Front driver frame: Approved
- Rear driver frame: Approved
- Steer-left frame: Approved
- Steer-right frame: Approved
- Hit frame: Approved
- Victory frame: Approved
- Front-steer-left frame: Approved on 2026-09-01
- Front-steer-right frame: Approved on 2026-09-01
- Front-hit frame: Approved on 2026-09-01
- Front-victory frame: Approved on 2026-09-01
- Complete 2D package validation: Passed
- Kart GLB design: Approved by Manny on 2026-08-22 (Hornbreaker Candidate 7)
- Deterministic GLB package: Generated and validated
- LOD0: 14,568 triangles / 4 materials / 13 required nodes / `extras.forward: "-Z"`
- LOD1: 7,746 triangles / 4 materials / 13 required nodes / `extras.forward: "-Z"`
- LOD2: 4,050 triangles / 4 materials / 13 required nodes / `extras.forward: "-Z"`
- LFS object publication: Passed; three approved objects uploaded and fetch-back verified
- Inactive-package materialization gate: Passed, CI run `32590997172` (#80)
- Manifest production integration: Merged to `main` through PR #30
- Active-package CI gate: Passed, CI run `32591092941` (#82)
- Merge checkpoint CI: Passed, run `32591411527` on commit `ddbb2dea9e7f5e558cb8d5e76501b99219416f65`
- Live verification: Passed. Manny confirmed on 2026-08-26 that Krios is in the live game and all assets load as intended.
- Production status: **LIVE ACCEPTED — KRIOS PRODUCTION INTEGRATION COMPLETE.**
- Front-action parity: Deployed from merge `7b58fdff7ca3c0d67a4ca70c1df0f6ddf287889f` under `krios-runtime-20260901-2` and accepted by Manny on 2026-09-01 against checkpoint `2ca852b47f16b8221275ee2b5542650d609b9a0d`. Both steering directions, hit, victory, chase-state restoration, cockpit placement, modeled-wheel ownership, and transparent horn apertures pass.

## Runtime verification closure

The repository continuity review on 2026-08-26 found that `tools/verify-runtime-assets.mjs` had not been updated to include AA-10 when Krios was activated. This was a repository-record/gate omission, not a live asset failure. The bounded closure checkpoint adds all three Hornbreaker GLBs to the active build signature/orientation gate so future builds fail if Krios's LFS assets are pointers, malformed GLBs, or lose `extras.forward: "-Z"` metadata.

## Next action

Playtest the deployed front-facing steering, hit, and victory states, including transparent horn apertures, modeled-wheel ownership, and restoration of matching chase states.

## Character Select full-body selection art

- Runtime asset: `public/assets/characters/aa-10/selection/full-body.png`.
- Format: 1024 × 1536 transparent sRGBA PNG, normal-Git runtime delivery derivative under ADR-092.
- Approval: Manny approved Krios's selection-only full-body asset in the 2026-09-19 Character Select batch review.
- Boundary: Character Select only; the approved portrait, race driver package, The Hornbreaker identity/geometry, statistics, and PBR/material implementation remain unchanged.
