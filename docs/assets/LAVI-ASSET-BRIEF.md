# Lavi asset brief

## Authority and source

- **Character and kart locks:** Approved by Manny on 2026-08-16.
- **Balance mapping:** AA-02 Feather Technician, approved by Manny on 2026-08-16.
- **Reference creator:** Manny.
- **Transformation permission:** Manny confirmed permission to transform the supplied reference into game assets on 2026-08-16.
- **Reference role:** Identity, outfit, and kart design reference. The collage's pixel treatment, panel borders, text, number `1`, and `Potato Prix '24` branding are not production-art requirements.
- **Original source retention:** Keep the original reference unchanged. Derived assets must use separate filenames and approval states.

## Game-wide visual direction

Production assets follow PRD sections 2.1, 23, and 27:

- polished, colorful, kinetic, high-contrast, and arcade-oriented;
- original Manaconda's Minigame Mayhem presentation rather than another kart title's character, UI, or rendering language;
- a 2D illustrated driver designed to sit convincingly inside a stylized 3D kart;
- lighting and material treatment matched to the 3D race scene so the driver does not read as a disconnected flat cutout;
- no pixel-art requirement from the supplied collage.

## Locked identity

- They/them pronouns.
- Light, fair complexion with warm peach-pink undertones.
- Short, voluminous fiery ginger curls.
- Bright green eyes and freckles across the nose and cheeks.
- Round silver-rimmed wireframe glasses.
- Small teal-blue stud earrings.
- Athletic, agile build with joyful confidence and energetic natural poise.
- Muted-green ribbed sweater with high crew or mock neckline, black trousers, and white platform boots with rainbow laces and matching sole accents.
- Clean base portrait has no cheek grime. Grime is situational during or after a race.

## Portrait concept

- **Purpose:** First visual approval anchor for all later driver states.
- **Canvas:** Square with a genuinely transparent background.
- **Framing:** Head, shoulders, and upper torso. Keep the full curl silhouette inside the canvas.
- **Expression:** Curious, lively, self-assured, and warmly alert.
- **Readability:** Face, curl silhouette, glasses, and green sweater must remain clear near 48 px.
- **Prohibited:** Text, logos, watermark, kart, racing number, panel border, cheek grime, pixel-art treatment, or changes to locked identity.

## Required production deliverables

| Asset                   | Required format                                  | Approval state                     |
| ----------------------- | ------------------------------------------------ | ---------------------------------- |
| Portrait                | 256 x 256 PNG, transparent, sRGB, straight alpha | Approved and prepared              |
| Rear driver frame       | 512 x 512 PNG, transparent, sRGB                 | Approved and prepared              |
| Front driver frame      | 512 x 512 PNG, transparent, sRGB                 | Approved and prepared 2026-08-31   |
| Steer-left frame        | 512 x 512 PNG, transparent, sRGB                 | Approved and prepared              |
| Steer-right frame       | 512 x 512 PNG, transparent, sRGB                 | Approved and prepared              |
| Hit frame               | 512 x 512 PNG, transparent, sRGB                 | Approved and prepared              |
| Victory frame           | 512 x 512 PNG, transparent, sRGB                 | Approved and prepared              |
| Front-steer-left frame  | 512 x 512 PNG, transparent, sRGB                 | Approved and integrated 2026-09-02 |
| Front-steer-right frame | 512 x 512 PNG, transparent, sRGB                 | Approved and integrated 2026-09-02 |
| Front-hit frame         | 512 x 512 PNG, transparent, sRGB                 | Approved and integrated 2026-09-02 |
| Front-victory frame     | 512 x 512 PNG, transparent, sRGB                 | Approved and integrated 2026-09-02 |
| Potato kart             | GLB with PRD hierarchy and LOD budgets           | Approved and prepared              |

Generated concepts remain candidates until Manny approves them. Approval of one asset does not automatically approve another driver state or Potato's 3D asset.

## Front driver candidate 1

- **Approval:** Manny approved the direct front seated pose and deterministic checkerboard removal on 2026-08-31.
- **Production derivative:** `public/assets/characters/aa-02/driver/front.png`.
- **Production validation:** 512 x 512 sRGB RGBA PNG with transparent corners; SHA-256 `36a8fddd94c6f4f62f904145d4a54b08e2649b29fdfe7f9310d6e3d7cf483fa8`.

## Front-action package

- **Approval:** Manny approved the four camera-facing action candidates on 2026-09-02.
- **Direction contract:** Commanded left leans toward the viewer's right; commanded right leans toward the viewer's left.
- **Steering-control ownership:** No front-action sprite contains a wheel or kart. Potato supplies the modeled steering wheel.
- **Runtime files and SHA-256:** `front-steer-left.png` `1a8f3594fe94da9f85d62a390862f6ba043057549d129e03fb8dd4f6a6d50ba6`; `front-steer-right.png` `25d25b7896844651a559521afd5b0a1be69d3cb6b5d3326e69892770a7c9f958`; `front-hit.png` `05303e58b4f79b0369edfd8f9b8b6e9168156d49de9236307309880384da2719`; `front-victory.png` `b08725190e2234c0014151db0073ee7522ac94c508d4a99654d333046d0f6c8c`.
- **Validation:** Each file is a 512 x 512 non-interlaced sRGBA PNG with decoded RGBA data and transparent corners.

## Potato 3D candidate 4

- **Generated and approved:** 2026-08-16.
- **Purpose:** Character-specific production kart for Lavi, including three distance-detail levels.
- **Approval:** Manny approved LOD0 Candidate 4 after reviewing the GLB directly in an external mobile 3D viewer.
- **Final corrections:** The approved model replaced deleted cockpit geometry with a depression sculpted into the continuous potato surface, embedded all eyes and scuffs, rooted the three sprouts inside the body, forced opaque material rendering, and added four visible axle stubs that overlap the body and wheel hubs.
- **LOD0:** `public/assets/characters/aa-02/kart.glb`; 9,552 triangles.
- **LOD1:** `public/assets/characters/aa-02/kart-lod1.glb`; 5,528 triangles.
- **LOD2:** `public/assets/characters/aa-02/kart-lod2.glb`; 3,086 triangles.
- **Hierarchy validation:** All three files contain `KartRoot`, `Chassis`, `AccentMesh`, `SteeringWheel`, `Wheel_FL`, `Wheel_FR`, `Wheel_RL`, `Wheel_RR`, `Exhaust_L`, `Exhaust_R`, `DriverMount`, `ItemMountRear`, and `ItemMountForward`.
- **Material validation:** Four principal materials; every material explicitly uses opaque rendering.
- **Coordinate validation:** glTF 2.0 GLB, meters, and Y-up. Direct live runtime review established that its rendered visual forward reads as positive Z against this game’s negative-Z race forward; see the runtime integration record below.
- **Repository treatment:** All three GLBs follow the repository Git LFS policy. The reproducible procedural source is `tools/assets/build_lavi_potato.py`.

## Portrait candidate 1

- **Generated:** 2026-08-16.
- **Purpose:** Likeness and production-style review before driver-state work.
- **Source dimensions:** 1254 x 1254 px.
- **File validation:** PNG RGBA; genuine non-opaque alpha verified; transparent corner pixel verified.
- **Approval:** Manny approved the likeness on 2026-08-16.
- **Production derivative:** `public/assets/characters/aa-02/portrait.png`.
- **Production validation:** 256 x 256 PNG RGBA in sRGB; non-opaque alpha and transparent corner verified; normal-Git runtime-asset treatment confirmed.

## Rear driver candidate 1

- **Generated:** 2026-08-16.
- **Purpose:** Default seated rear-driving pose and silhouette review.
- **Source dimensions:** 1214 x 1295 px.
- **File validation:** PNG RGBA; genuine non-opaque alpha verified; transparent corner pixel verified.
- **Approval:** Manny approved the rear pose and silhouette on 2026-08-16.
- **Production derivative:** `public/assets/characters/aa-02/driver/rear.png`.
- **Production validation:** 512 x 512 PNG RGBA in sRGB; non-opaque alpha and transparent corner verified; normal-Git runtime-asset treatment confirmed.

## Steer-left candidate 1

- **Generated:** 2026-08-16.
- **Purpose:** Hard-left steering pose with the approved rear-driver crop and silhouette family.
- **Source dimensions:** 1254 x 1254 px.
- **File validation:** PNG RGBA; non-opaque alpha and transparent corner verified.
- **Approval:** Manny approved the steer-left pose on 2026-08-16.
- **Production derivative:** `public/assets/characters/aa-02/driver/steer-left.png`.
- **Production validation:** 512 x 512 PNG RGBA in sRGB; non-opaque alpha and transparent corner verified; normal-Git runtime-asset treatment confirmed.

## Steer-right candidate 1

- **Generated:** 2026-08-16.
- **Purpose:** Hard-right steering pose paired with the approved steer-left frame.
- **Source dimensions:** 1254 x 1254 px.
- **File validation:** PNG RGBA; non-opaque alpha and transparent corner verified.
- **Approval:** Manny approved the steer-right pose on 2026-08-16.
- **Production derivative:** `public/assets/characters/aa-02/driver/steer-right.png`.
- **Production validation:** 512 x 512 PNG RGBA in sRGB; non-opaque alpha and transparent corner verified; normal-Git runtime-asset treatment confirmed.

## Hit candidate 1

- **Generated:** 2026-08-16.
- **Purpose:** Reusable impact-recoil pose for spinouts, explosive hits, and major collision stuns.
- **Pose:** Rear seated crop with raised shoulders, ducked head, bouncing curls, and both hands thrown briefly away from the steering position. The reaction reads as surprised and kinetic without depicting injury.
- **Source dimensions:** 1254 x 1254 px.
- **File validation:** PNG RGBA in sRGB; alpha ranges from fully transparent to fully opaque, and the corner pixel is transparent. A checkerboard composite confirmed the cutout visually.
- **Approval:** Manny approved Hit Candidate 1 on 2026-08-16.
- **Production derivative:** `public/assets/characters/aa-02/driver/hit.png`.
- **Production validation:** 512 x 512 PNG RGBA in sRGB; alpha ranges from fully transparent to fully opaque, the corner pixel is transparent, and normal-Git runtime-asset treatment is confirmed.

## Victory candidate 1

- **Generated:** 2026-08-16.
- **Purpose:** Reusable celebration pose for the race finish, podium, and optional major Purple Burst boost.
- **Pose:** Rear seated crop with one raised fist, a compact second arm pump, bouncing curls, and a smiling over-the-shoulder turn.
- **Source dimensions:** 1254 x 1254 px.
- **Source cleanup:** A detached yellow speck above the raised fist was removed without changing the character artwork.
- **File validation:** PNG RGBA in sRGB; alpha ranges from fully transparent to fully opaque, and the corner pixel is transparent.
- **Approval:** Manny approved the corrected Victory Candidate 1 on 2026-08-16.
- **Production derivative:** `public/assets/characters/aa-02/driver/victory.png`.
- **Production validation:** 512 x 512 PNG RGBA in sRGB; alpha ranges from fully transparent to fully opaque, the corner pixel is transparent, and normal-Git runtime-asset treatment is confirmed.

## Runtime delivery and integration record

- **Controlled revision:** `lavi-runtime-20260902-5`. Public runtime URLs combine Vite's base URL with this query revision. Change it whenever Potato or Lavi's delivered runtime bytes change at a stable path.
- **LFS deployment rule:** the Pages build materializes LFS, passes `git lfs fsck`, and runs `tools/verify-runtime-assets.mjs`; all three Potato GLBs must have the `glTF` binary signature before deployment.
- **Driver runtime contract:** preload all ten states. Player and AI preserve victory, hit, and steering when the camera changes facing; neutral front remains the rollout fallback for any missing front action.
- **Front-action publication state:** Live accepted. PR #68 deployed the four approved frames, and PR #70 deployed the placement-only correction. All four deployed PNG responses match the approved SHA-256 values. Manny accepted the corrected camera/action package on 2026-09-03.
- **Placement correction:** Manny's 2026-09-02 live review found `[0, 0.45, -0.12]` too low behind Potato. PR #70 deployed `[0, 0.9, -0.12]` for all five camera-facing states; main run `33664361276` passed. The live bundle contains the corrected mapping. No asset bytes, kart geometry, chase placement, or steering-control ownership changed.
- **Visual alignment:** load-time `model.rotation.y = Math.PI` corrects Potato’s visual root to the game’s negative-Z forward direction. It is not a physics, camera, checkpoint, or mount-coordinate change.
- **Live acceptance:** Manny confirmed Potato loading, steering-state artwork, and correct steering-wheel-forward orientation in the mobile GitHub Pages build on 2026-08-16. On 2026-09-03, Manny accepted neutral front, both front steering directions, front hit, front victory, chase restoration, transparency, cockpit placement, and single-wheel presentation at `[0, 0.9, -0.12]`.

## Character Select full-body selection art

- Runtime asset: `public/assets/characters/aa-02/selection/full-body.png`.
- Format: 1024 × 1536 transparent sRGBA PNG, governed by Git LFS.
- Approval: Manny approved Lavi's selection-only full-body asset in the 2026-09-19 Character Select review.
- Boundary: Selection-only art; the portrait, race driver frames, Potato kart package, statistics, and PBR/material implementation remain unchanged.
