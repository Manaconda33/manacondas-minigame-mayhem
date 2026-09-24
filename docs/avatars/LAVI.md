# Avatar intake: Lavi

- **Intake date:** 2026-08-16
- **Current phase:** Front-action package live accepted
- **Intake status:** Approved
- **Character lock:** Approved by Manny on 2026-08-16
- **Kart lock:** Approved by Manny on 2026-08-16
- **Balance mapping lock:** AA-02 Feather Technician, approved by Manny on 2026-08-16
- **Asset approval:** Portrait, all ten driver frames, and Potato's three-LOD GLB package approved and prepared
- **Implementation verification:** Approved portrait, Potato, and all ten driver states are live. PR #70 deployed `[0, 0.9, -0.12]` for the five camera-facing states after Manny rejected the lower placement. Main validation, Pages deployment, and live bundle verification passed. Product-owner cockpit retesting remains open.

This record captures Manny's written description and the supplied reference image. Image observations remain reference-only unless they appear in an approved lock. Lavi is assigned stable roster ID `aa-02` and balance profile AA-02 Feather Technician.

## Identity

- **Proposed display name:** Lavi
- **Stable internal ID:** `aa-02`
- **Pronouns:** They/them
- **Short selection-screen descriptor:** Unresolved
- **Personality:** Curious, lively, and resourceful. They combine high-energy spontaneity with grounded logic.
- **Defining traits supplied by Manny:** Joyful confidence, energetic natural poise, curiosity, liveliness, and resourcefulness.
- **Traits or interpretations to avoid:** Do not remove or contradict their approved pronouns, personality, athletic build, hair and facial features, glasses, outfit, or other must-preserve details.

## Visual direction

### Supplied character description

- **Body type and presence:** Athletic, agile frame carried with joyful confidence and energetic, natural poise.
- **Hair:** Short, voluminous fiery ginger curls.
- **Eyes:** Bright green.
- **Face:** Freckles across their nose and cheeks.
- **Glasses:** Round, silver-rimmed wireframe glasses.

### Approved visual locks

- Lavi has a light, fair complexion with warm peach-pink undertones, matching the supplied reference image.
- Lavi's racing outfit is a muted-green ribbed sweater with a high crew or mock neckline, black trousers, and white platform boots with rainbow laces and matching rainbow sole accents.
- Small teal-blue stud earrings are part of Lavi's standard design.
- Race grime across Lavi's cheek is situational. It may appear during or after a race but is not a permanent facial marking.

### Reference presentation details

These details are observations, not approved locks:

- A lively, self-assured expression while driving.
- Pixel-art/comic-panel presentation with white photo borders and racing-game iconography.

### Approved character lock

- **Palette:** Fiery ginger hair, bright green eyes, silver glasses, teal-blue earrings, muted-green sweater, black trousers, white boots, and rainbow footwear accents.
- **Must preserve:** Short voluminous curl silhouette, round wireframe glasses, bright green eyes, facial freckles, athletic build, approved outfit, and teal-blue stud earrings.
- **Small-scale simplification:** Individual freckles, knit texture, earring reflections, and separate rainbow eyelets may simplify when the asset is too small to display them cleanly. The overall curl, glasses, green-eye, green-sweater, and rainbow-footwear read must remain.
- **Situational detail:** Cheek grime may appear during or after a race but should be absent from the clean base portrait.
- **Additional symbols or props:** None required.

## Kart direction

- **Final name:** Potato
- **Kart type:** Character-specific novelty kart
- **Approved concept:** Lavi rides a natural potato kart. The body must read immediately as a potato rather than a conventional chassis with potato decoration.
- **Approved construction language:** A hidden mechanical frame supports the natural potato body. Only essential hardware should remain visible.
- **Approved art direction:** Realistic yet whimsical. The potato should retain believable russet skin, organic asymmetry, and natural surface variation while remaining playful and readable as a racing vehicle.
- **Approved surface treatment:** Irregular russet skin, shallow potato eyes, light traces of dry soil, a few scuffs, and two or three short sprouts near the rear. Potato must have no rot, trailing roots, or anthropomorphic face.
- **Approved hardware:** Recessed matte-black cockpit, four exposed treaded black tires with weathered dark-metal hubs, a compact steering wheel, and two short silver exhaust pipes. Hardware must look practical and slightly handmade rather than glossy.

### Details visible in the reference image

These details are observations, not approved locks:

- A large russet-potato body with irregular eyes, dimples, and surface marks.
- A recessed black cockpit cut into the top of the potato.
- Four exposed black tires with simple dark hubs.
- Minimal mechanical hardware, including a steering wheel and short exhaust pipes.

### Approved 3D construction

- Potato uses a continuous opaque russet body sculpted downward into a recessed matte-black cockpit. The final mesh does not remove the upper potato surface or use a separate cockpit wall that can clip through it.
- Three rear sprouts and all shallow eyes and scuffs intersect the potato surface. Four visible dark-metal axle stubs overlap both the hidden chassis area and wheel hubs.
- The required `KartRoot` hierarchy includes `Chassis`, `AccentMesh`, `SteeringWheel`, all four named wheel nodes, both exhaust nodes, `DriverMount`, `ItemMountRear`, and `ItemMountForward`.
- Manny approved LOD0 Candidate 4 on 2026-08-16 after direct GLB review. The approval includes its continuous upper body, sculpted cockpit, embedded details, rooted sprouts, and connected wheels.
- Production LOD budgets are 9,552 triangles for LOD0, 5,528 for LOD1, and 3,086 for LOD2. Every level uses four principal materials and the same required hierarchy.

### Approved kart lock

- **Palette:** Natural russet brown, dry-soil earth tones, muted sprout green, matte black, weathered dark metal, and restrained silver exhaust accents.
- **Signature detail:** Two or three short rear sprouts.
- **Emblem:** None recommended. Potato's organic silhouette is its identifying mark.
- **Permitted technical adjustment:** Wheel spacing, cockpit depth, and hidden frame geometry may change enough to satisfy collision, animation, and driver-mount requirements without weakening the natural-potato silhouette.
- **Prohibited treatment:** Rot, trailing roots, an anthropomorphic face, glossy racing bodywork, the reference number `1`, and `Potato Prix '24` branding.

### Excluded reference details

- The number `1` is not part of Lavi or Potato's canon.
- `Potato Prix '24` is not part of the game or character canon.

## Gameplay and roster mapping

- **Desired driving feel:** Nimble, responsive, and technical, with quick launch and precise control.
- **Preferred strengths:** Acceleration, Handling, and Mini-Turbo.
- **Accepted weaknesses:** Low collision resistance, weaker off-road performance, and modest top speed.
- **Weight class:** Featherweight.
- **Assigned AA balance profile:** AA-02 Feather Technician.
- **Stats:** Speed 5, Acceleration 8, Weight 2, Handling 9, Mini-Turbo 8, Traction 4. Total: 36.
- **Mapping rationale:** AA-02 rewards quick reactions, clean lines, and controlled drifting. Its low Weight and Traction give Lavi clear weaknesses and keep their feel distinct from balanced, off-road, cruiser, and heavyweight profiles.
- **Manny's mapping approval:** Approved on 2026-08-16.
- **Roster uniqueness:** AA-02 is assigned to Lavi and unavailable to all later characters. `docs/ROSTER-MAPPING.md` governs allocations.

## Required asset states

| Asset                          | Status                | Notes                                                                                                                                                                                                         |
| ------------------------------ | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 256 x 256 transparent portrait | Approved and prepared | `public/assets/characters/aa-02/portrait.png`; RGBA and normal-Git runtime treatment verified.                                                                                                                |
| 512 x 512 rear driver frame    | Approved and prepared | `public/assets/characters/aa-02/driver/rear.png`; RGBA and normal-Git runtime treatment verified.                                                                                                             |
| 512 x 512 steer-left frame     | Approved and prepared | `public/assets/characters/aa-02/driver/steer-left.png`; RGBA and normal-Git runtime treatment verified.                                                                                                       |
| 512 x 512 steer-right frame    | Approved and prepared | `public/assets/characters/aa-02/driver/steer-right.png`; RGBA and normal-Git runtime treatment verified.                                                                                                      |
| 512 x 512 hit frame            | Approved and prepared | `public/assets/characters/aa-02/driver/hit.png`; RGBA transparency and normal-Git runtime treatment verified.                                                                                                 |
| 512 x 512 victory frame        | Approved and prepared | `public/assets/characters/aa-02/driver/victory.png`; RGBA transparency and normal-Git runtime treatment verified.                                                                                             |
| 512 x 512 front-steer-left frame | Approved and integrated | `public/assets/characters/aa-02/driver/front-steer-left.png`; Manny approved the camera-facing commanded-left pose on 2026-09-02.                                                                            |
| 512 x 512 front-steer-right frame | Approved and integrated | `public/assets/characters/aa-02/driver/front-steer-right.png`; Manny approved the camera-facing commanded-right pose on 2026-09-02.                                                                          |
| 512 x 512 front-hit frame      | Approved and integrated | `public/assets/characters/aa-02/driver/front-hit.png`; Manny approved the camera-facing impact pose on 2026-09-02.                                                                                            |
| 512 x 512 front-victory frame  | Approved and integrated | `public/assets/characters/aa-02/driver/front-victory.png`; Manny approved the camera-facing celebration on 2026-09-02.                                                                                        |
| Potato kart GLB package        | Approved and prepared | LOD0: `public/assets/characters/aa-02/kart.glb`; LOD1: `kart-lod1.glb`; LOD2: `kart-lod2.glb`. GLB 2.0, opaque four-material treatment, PRD hierarchy, and triangle budgets verified. Stored through Git LFS. |
| Source and rights record       | Approved              | Manny created the supplied reference and approved its transformation into game assets on 2026-08-16.                                                                                                          |

## Runtime integration record

- **Asset revision:** `lavi-runtime-20260902-5`. All runtime paths use Vite's base URL and this controlled revision query so stale Pages or browser responses cannot reuse earlier package bytes.
- **Deployment integrity:** Pages checks out LFS, passes `git lfs fsck`, and `tools/verify-runtime-assets.mjs` requires the three Potato files to begin with the binary `glTF` signature before build output is deployed.
- **Driver-frame mapping:** The shared selector preloads all ten states. Rear view preserves commanded steering, hit, and victory through the matching front-action frame; a missing camera-facing action retains neutral front.
- **Camera-facing placement:** `[0, 0.9, -0.12]` for neutral front, front-steer-left, front-steer-right, front-hit, and front-victory. Chase-facing states retain the shared default. This correction does not change sprite bytes or Potato's modeled wheel.
- **Visual-axis adjustment:** Potato’s actual rendered forward is positive Z while this race runtime moves forward along negative Z. The load path applies `model.rotation.y = Math.PI` to Potato’s visual root only. Physics, checkpoints, input, camera, mount hierarchy, and driver billboard coordinates remain unchanged.
- **Manual acceptance:** Manny confirmed the production Potato loads, driver steering states render, and the steering wheel is forward of Lavi in the live mobile race on 2026-08-16.

## Current reference

- **Supplied file:** `1000027702.png`
- **Creator and rights:** Manny; transformation into game assets approved on 2026-08-16.
- **Production style:** The game-wide PRD style, not the collage's pixel/comic treatment.
- **Repository treatment:** Not committed as a production asset. The image remains a landscape concept reference, not one of the required transparent portrait, driver-frame, or GLB deliverables.
- **Asset brief:** `docs/assets/LAVI-ASSET-BRIEF.md`.

## Live front-action acceptance

Manny accepted Lavi's corrected deployed placement on 2026-09-03. Neutral front, both steering directions, hit, victory, chase restoration, transparency, cockpit placement, and Potato's single modeled steering wheel pass at `[0, 0.9, -0.12]`. No further Lavi work is required for this rollout.

## Character Select full-body selection art

- Runtime asset: `public/assets/characters/aa-02/selection/full-body.png`.
- Format: 1024 × 1536 transparent sRGBA PNG, normal-Git runtime delivery derivative under ADR-092.
- Approval: Manny approved Lavi's selection-only full-body asset in the 2026-09-19 Character Select review.
- Boundary: Character Select only; the approved portrait, race driver package, Potato identity/geometry, statistics, and PBR/material implementation remain unchanged.

## Results/Podium victory art — approved batch 01

- Runtime asset: `public/assets/characters/aa-02/results/victory.png`.
- Format: 1024 × 1536 transparent sRGBA PNG, fixed-size normal-Git runtime derivative.
- Pose identity: buoyant one-boot recovery step, glasses touch, and joyful confidence.
- Approval: Manny approved Lavi's character-specific Results/Podium victory pose on 2026-09-19.
- Boundary: Results/Podium presentation only; the accepted Character Select, race driver, kart, statistics, and gameplay contracts remain unchanged.

## Results/Podium reaction art — approved batch 01

- Runtime asset: `public/assets/characters/aa-02/results/reaction.png`.
- Format: 1024 × 1536 transparent sRGBA PNG, fixed-size normal-Git runtime derivative.
- Pose identity: sheepish, good-natured one-boot recovery with one hand at her glasses.
- Approval: Manny approved Lavi's lower-finish reaction pose on 2026-09-24.
- Boundary: Results/Podium art only; this asset batch does not change the Results runtime mapping or Lavi's accepted character/gameplay contracts.
