# Kraken avatar record

## Identity

- Display name: Kraken
- Stable internal ID: `aa-05`
- Pronouns: he/him
- Selection descriptor: Drift Specialist
- Character lock: Approved by Manny on 2026-08-21

Kraken is a human Cthulhu with a sharp, disciplined presence. His definitive game likeness is the supplied kart-racing reference: angular face, short cropped dark hair, vivid green eyes, two long pointed ears, and a clean burgundy collared shirt. His expression is controlled and intimidating, with a cunning half-smile reserved for victory states.

Earlier visual notes describing a different hairstyle or more ornate gothic clothing are superseded for the game by the approved racing reference.

## Kart direction

- Kart name: The Abyssal Drifter
- Kart lock: Approved by Manny on 2026-08-21
- Design authority: the supplied Kraken racing sheet is definitive

The Abyssal Drifter is a living Cthulhu-inspired kart with an indigo and purple body, cyan bioluminescence, orange eyes, a toothed front maw, copper trim, tentacle bodywork, and turbine-like wheels. The approved reference controls its silhouette and signature details. Manny approved LOD0 Candidate 3 on 2026-08-21. Its corrected steering wheel is separated from the shell and connected by a nose-side column and organic dashboard housing.

## Gameplay mapping

- Profile: AA-05 Drift Specialist
- Class: Medium
- Stats: Speed 6 / Acceleration 7 / Weight 5 / Handling 6 / Mini-Turbo 9 / Traction 3
- Mapping lock: Approved by Manny on 2026-08-21

Kraken rewards sustained, deliberate drift chains. Mini-Turbo 9 is the defining strength; Traction 3 makes poor lines and off-road mistakes costly. Medium weight and moderate handling keep him distinct from the featherweight technicians and heavyweight collision specialists already assigned.

## Approved driver art

Manny approved the following art on 2026-08-21:

- `portrait.png`: definitive selectable portrait
- `driver/front.png`: front-facing neutral driving frame
- `driver/rear.png`: neutral chase-camera frame
- `driver/steer-left.png`: chase-camera left-turn frame
- `driver/steer-right.png`: chase-camera right-turn frame
- `driver/hit.png`: chase-camera impact frame
- `driver/victory.png`: chase-camera over-the-shoulder victory frame
- `driver/front-victory.png`: front-facing victory frame retained for camera-facing finish presentation

Amendment 2.0 adds front-steer-left, front-steer-right, and front-hit to Kraken's package. Manny approved the three candidates on 2026-09-01, and they are integrated without altering the existing approved front-victory frame or any chase-oriented art.

All runtime derivatives are sRGB RGBA PNGs with genuine transparency. The portrait is 256 x 256; every driver frame is 512 x 512. Character layers contain no kart or steering-wheel geometry.

## Provenance and transformation

Manny supplied the definitive character-and-kart reference and directed its use for this project. Approved generated derivatives preserve that likeness and were resized into the PRD runtime contract. High-resolution working renders are not stored in the fixed-size runtime paths.

## Approval status

- Intake: Approved
- Character lock: Approved
- Kart design lock: Approved
- Balance mapping: Approved, AA-05
- Driver art: Approved
- Front-action parity: Live accepted by Manny on 2026-09-01
- Runtime PNG preparation: Complete
- Kart GLB: Approved and prepared in three deterministic LODs
- Manifest production integration: Front-action pilot integrated under controlled revision `kraken-runtime-20260901-2`
- Live verification: Original production package accepted on 2026-08-21; front-action parity accepted on 2026-09-01

## Next action

Preserve the accepted `kraken-runtime-20260901-2` package. The one-character rollout may proceed to the next active driver.

## Character Select full-body selection art

- Runtime asset: `public/assets/characters/aa-05/selection/full-body.png`.
- Format: 1024 × 1536 transparent sRGBA PNG, normal-Git runtime delivery derivative under ADR-092.
- Approval: Manny approved Kraken's selection-only full-body asset in the 2026-09-19 Character Select batch review.
- Boundary: Character Select only; the approved human Cthulhu identity remains the source of truth. The portrait, race driver package, The Abyssal Drifter identity/geometry, statistics, and PBR/material implementation remain unchanged.

## Results/Podium victory art

- Runtime asset: `public/assets/characters/aa-05/results/victory.png`.
- Format: 1024 × 1536 transparent PNG runtime derivative under the Results/Podium asset brief.
- Approval: Manny approved Kraken's character-specific victory pose in the 2026-09-19 Results/Podium Batch 02 review.
- Pose direction: controlled three-quarter lean with one hand in a trouser pocket, the other touching his chin, and a calculating half-smile.
- Identity source: the approved Character Select full-body asset was supplied as the actual image-generation reference.
- Boundary: Results/Podium victory presentation only; the approved driver package, kart identity/geometry, statistics, and PBR/material implementation remain unchanged.

## Results/Podium lower-finish reaction art

- Runtime asset: `public/assets/characters/aa-05/results/reaction.png`.
- Manny approved the chroma-green render and transparent cutout on 2026-09-24.
- Pose: compact three-quarter stance, brushing dust from one sleeve and giving a measured sideways glance; grounded, controlled frustration. The silhouette avoids Kraken's victory pose.
- Identity source: the approved `public/assets/characters/aa-05/selection/full-body.png` asset was used as the actual generation reference.
- Runtime derivative: 1024 × 1536 RGBA PNG with genuine transparency; SHA-256 `57030b478a9b0cdf6607f5c3041385989768abda61d72d1316b8696b5c390445`.
- This Results-only pose does not change driver art or the Results runtime mapping.
