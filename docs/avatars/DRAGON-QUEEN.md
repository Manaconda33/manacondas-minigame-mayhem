# Dragon Queen - Racer Intake Record

## Approval state

- Character lock: Approved by Manny, 2026-09-03
- Definitive visual authority: Supplied Dragon Queen racer collage
- Transformation rights: Confirmed by Manny, 2026-09-03
- Kart lock: The Sovereign Wyrm, approved by Manny, 2026-09-03
- Balance mapping: AA-06 Grip Specialist, approved by Manny, 2026-09-03
- Portrait design: Candidate 2 approved by Manny, 2026-09-03
- Portrait runtime derivative: Integrated and validated, 2026-09-04
- Ten-frame driver design package: Approved by Manny, 2026-09-04
- Ten-frame runtime derivatives: Integrated and validated, 2026-09-04
- 3D kart geometry: Candidate 2 approved by Manny, 2026-09-04
- Runtime activation: Published under `dragon-queen-runtime-20260904-1`; one rear-view placement defect remains open

## Character lock

Dragon Queen is a literal sovereign dragon. Her anatomy must remain fully draconic in every view: long muzzle, scaled neck and torso, clawed limbs, broad wings, and a long elegant scaled tail. She is never human-bodied, dragonborn-like, or anthropomorphic. Any driving pose must adapt the cockpit and controls to her body rather than reshape her into a person.

Her scales are deep navy blue with restrained gold flecking, like a night sky threaded with precious metal. Her eyes glow molten gold and communicate ancient intelligence, self-command, and benevolent power. The glow must remain readable without becoming feral or menacing.

Richly layered ceremonial cloths in dark blue and gold drape around her natural dragon anatomy. Gold trim and embroidered draconic motifs provide the principal ornament. Jewelry is sparse and deliberate: a royal crown or diadem and a few sovereign accents rather than dense decoration.

Her posture is poised and authoritative. She does not slouch, snarl, lunge, or use casual comic gestures. Regal femininity comes from bearing, proportion, regalia, and expression, never from a humanoid body or sexualized treatment.

## Required silhouette

- Wings remain visible in the portrait and all driver states. They may fold or compress inside the cockpit but may not disappear.
- The long scaled tail remains visible as part of every portrait and driver-state silhouette.
- Hands, feet, limbs, torso, and face remain dragon anatomy. No human hands, human legs, breasts, or upright human proportions.
- Horns, crown, wing membranes, tail, and long muzzle must remain readable at small HUD and gameplay sizes.
- The portrait is a solo character image without kart, wheel, or scenery.

## Reference precedence

The supplied racer collage is definitive visual authority for Dragon Queen and The Sovereign Wyrm. The written character lock controls any conflict. In particular, production derivatives must preserve literal dragon anatomy, visible wings, the long tail, molten-gold eyes, deep navy scales with gold flecking, restrained royal jewelry, and ceremonial textiles fitted to a dragon body.

## Kart lock

The Sovereign Wyrm is a low royal grand-tourer with midnight-blue bodywork, sculpted gold architectural trim, jewel-like blue lighting, substantial tires, and a prominent gold dragon shield on the nose. It should read as a sovereign's purpose-built racer rather than a generic sports kart with decorative dragon decals.

The open cockpit is built around Dragon Queen's actual anatomy. It provides wing clearance, a visible tail channel, a long supported seating cavity, and controls that her foreclaws can operate without turning them into hands. The bodywork must frame her silhouette rather than hide her wings or tail.

The kart owns one modeled steering control. Driver rasters remain free of wheel, seat, tire, and bodywork pixels. Gold ornament must stay structural and restrained enough to remain readable at gameplay distance. The dragon shield is the primary emblem; no letter monogram is used.

## Balance mapping

AA-06 Grip Specialist: Speed 6 / Acceleration 6 / Weight 5 / Handling 7 / Mini-Turbo 5 / Traction 7.

Dragon Queen's driving identity is measured and planted. Handling 7 and Traction 7 support stable line discipline, deliberate corrections, and reliable grip. Speed 6 and Acceleration 6 keep her capable without making straight-line pace her defining advantage. Weight 5 and Mini-Turbo 5 preserve meaningful vulnerability to heavier racers and prevent drift boosts from overtaking her control-first identity.

This mapping expresses calm authority through predictable control rather than assigning power from appearance alone. It also avoids turning an ancient sovereign dragon into the fragile AA-01 Feather Sprinter.

## Required production contract

- Portrait: 256 x 256 transparent sRGBA PNG
- Driver frames: front, rear, steer-left, steer-right, hit, victory, front-steer-left, front-steer-right, front-hit, and front-victory
- Every driver frame: 512 x 512 transparent sRGBA PNG with transparent corners
- Wings and tail: visible in every portrait and driver state
- Kart package: deterministic LOD0, LOD1, and LOD2 GLBs with `extras.forward: "-Z"`
- Runtime orientation: `NEGATIVE_Z_KART_VISUAL_YAW`
- Controlled runtime revision required before publication
- Desktop and mobile live acceptance required before production closure

## Approved portrait design

Manny approved Candidate 2 on 2026-09-03. It locks Dragon Queen's deep navy scales and fine gold flecking, molten-gold eyes, long draconic muzzle, gold crown, broad wings, long curling tail, and layered blue-and-gold ceremonial regalia. The tighter head-and-upper-torso composition keeps her face readable at HUD and minimap size while retaining both wings and the tail in the silhouette.

The approved 1254 x 1254 RGB review export contains a baked checkerboard. It remains design authority only and must not enter the runtime path. Deterministic background removal and premultiplied-alpha resizing will occur after the complete eleven-image design package is approved.

## Approved driver-state package

Manny approved the complete ten-frame set on 2026-09-04. The chase-facing states are rear, steer-left, steer-right, hit, and victory. The camera-facing states are front, front-steer-left, front-steer-right, front-hit, and front-victory.

Every approved frame keeps both wings and one long tail visible. The steering pairs show opposite commanded turns, the hit poses use controlled recoil, and the victory poses remain closed-mouth and restrained. The final set contains no wheel, kart, cockpit, seat, tire, or scenery pixels.

Three rejected generation defects are now regression constraints: no duplicate tail or second tail tip, no roaring or skyward-open victory muzzle, and no human sign language or circular finger gesture. A victory salute must use a naturally open draconic foreclaw.

`tools/assets/prepare_dragon_queen_2d.py` preserves native alpha where present, removes edge-connected pale neutral checkerboards from opaque review exports, clears hidden RGB, and resizes with premultiplied alpha. The deterministic package contains one 256 x 256 portrait and ten 512 x 512 driver frames as 8-bit, non-interlaced sRGBA PNGs with transparent corners. The approved files now occupy `public/assets/characters/aa-06/` under the controlled revision.

## Approved 3D package

Manny approved Candidate 2 on 2026-09-04. It corrects Candidate 1's round grille-like nose, dotted side ornament, and oversized steering control. The approved model uses a shield-shaped nose, joined gold chevrons, a smaller lower steering control, structural gold rails, jewel-blue lights, substantial tires, broad wing clearance, and an open rear tail channel.

| Runtime path                                   | LOD  | Triangles | SHA-256                                                            |
| ---------------------------------------------- | ---- | --------: | ------------------------------------------------------------------ |
| `public/assets/characters/aa-06/kart.glb`      | LOD0 |    12,164 | `57b3f4b248ed96cd19b0c2b233aec4462fde73b102ad9acde8941550bf69e305` |
| `public/assets/characters/aa-06/kart-lod1.glb` | LOD1 |     7,268 | `31bdd684fb764fdb4d6e04726971e0bf3f34ee4f36aefbf652fcdf3b133053c3` |
| `public/assets/characters/aa-06/kart-lod2.glb` | LOD2 |     3,620 | `124ec43e1ada192d67a3d4fe6bb6c3ec1cdd3f9df6b6c22b1af05b25762197de` |

All three GLBs reproduce byte-for-byte, use four materials and thirteen required nodes, declare one `SteeringWheel`, and set `extras.forward: "-Z"`. `tools/assets/build_dragon_queen_sovereign_wyrm.py` is the deterministic source.

## Runtime placement and Cleo archive

Dragon Queen's chase-facing states remain at `[0, 0.95, -0.12]`. Live playtest rejected the deployed camera-facing position at the same height because her foreclaws appeared above The Sovereign Wyrm's modeled steering control. The first correction lowered all five camera-facing states to `[0, 0.84, -0.12]`, but Manny found steer-right slightly high.

The revised review keeps neutral, steer-left, hit, and victory at `[0, 0.84, -0.12]` and lowers only front-steer-right to `[0, 0.80, -0.12]`. It does not change the approved PNGs, chase states, kart geometry, control position, sprite scale, or depth. Two renders of the complete front-camera sheet matched SHA-256 `1375abc4e30eaecadb1409030e0fea3e6ca3dd793ad8916227e24925a94006b2`.

Manny approved the complete front-camera placement sheet and authorized branch publication on 2026-09-04.

Cleo's ten-file package is preserved byte-for-byte at `public/assets/archive/characters/cleo-aa-06/`, and `archivedCleo` points only to that location. Dragon Queen's active package does not load or alter the Cleo archive.

## Next gate

Publish the approved correction through the governed branch and pull-request workflow. After deployment, retest rear-view neutral, steering, hit, and victory states before closing Dragon Queen's live acceptance.

## Character Select full-body selection art

- Runtime asset: `public/assets/characters/aa-06/selection/full-body.png`.
- Format: 1024 × 1536 transparent sRGBA PNG, normal-Git runtime delivery derivative under ADR-092.
- Approval: Manny approved Dragon Queen's selection-only full-body asset in the 2026-09-19 final Character Select batch review.
- Boundary: Character Select only; this image preserves her literal dragon anatomy, wings, and tail. The approved portrait, race driver package, The Sovereign Wyrm identity/geometry, statistics, and PBR/material implementation remain unchanged.

## Results/Podium victory art

- Runtime asset: `public/assets/characters/aa-06/results/victory.png`.
- Format: 1024 × 1536 transparent PNG runtime derivative under the Results/Podium asset brief.
- Approval: Manny approved Dragon Queen's character-specific victory pose in the 2026-09-19 Results/Podium Batch 02 review.
- Pose direction: fully draconic regal wing display with elevated head, raised open foreclaw salute, crown, ceremonial regalia, and visible long tail.
- Identity source: the approved Character Select full-body asset was supplied as the actual image-generation reference.
- Boundary: Results/Podium victory presentation only; the approved driver package, kart identity/geometry, statistics, and PBR/material implementation remain unchanged.

## Results/Podium lower-finish reaction art

- Runtime asset: `public/assets/characters/aa-06/results/reaction.png`.
- Manny approved the chroma-green render and transparent cutout on 2026-09-24.
- Pose: partly folded wings, foreclaw on the chest ornament, slightly dipped head, and a fully visible curled tail; composed disappointment with renewed resolve. Dragon Queen remains fully draconic.
- Identity source: the approved `public/assets/characters/aa-06/selection/full-body.png` asset was used as the actual generation reference.
- Runtime derivative: 1024 × 1536 RGBA PNG with genuine transparency; SHA-256 `0997d1684a9fc29c05995bb7e361a507d5e967f8965ab77312590fb6488e8e6b`.
- This Results-only pose does not change driver art or the Results runtime mapping.
