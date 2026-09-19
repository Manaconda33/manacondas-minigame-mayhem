# Dragon Queen Asset Brief

## Governing locks

- Character lock: Approved by Manny, 2026-09-03
- Definitive reference: Supplied Dragon Queen racer collage
- Transformation rights: Confirmed by Manny, 2026-09-03
- Kart name and design: The Sovereign Wyrm, approved by Manny, 2026-09-03
- Balance profile: AA-06 Grip Specialist, approved by Manny, 2026-09-03
- Portrait design: Candidate 2 approved by Manny, 2026-09-03
- Portrait runtime derivative: Integrated and validated, 2026-09-04
- Ten driver-state designs: Approved by Manny, 2026-09-04
- Ten driver-state runtime derivatives: Integrated and validated, 2026-09-04
- Kart GLB geometry: Candidate 2 approved by Manny, 2026-09-04
- Runtime activation: Published under `dragon-queen-runtime-20260904-1`; one rear-view placement defect remains open

## Character authority

Dragon Queen must read immediately as an ancient dragon sovereign. She has deep navy-blue scales with subtle gold flecking, molten-gold eyes, broad wings, a long elegant scaled tail, a long draconic muzzle, horns, and clawed limbs. Dark-blue and gold ceremonial cloths follow her natural anatomy and carry restrained gold trim and embroidered dragon motifs.

Her crown and jewelry are minimal royal accents. Her expression stays composed and intelligent. Every asset must reject humanoid anatomy, dragonborn proportions, feral aggression, excessive ornament, comic casualness, and sexualized shorthand for femininity.

The wings and tail are mandatory silhouette elements in all eleven raster assets. They may change position to fit a seated driving action, but neither may be cropped away, hidden behind an opaque cockpit shape, or omitted.

## The Sovereign Wyrm

The kart is a low royal grand-tourer with midnight-blue bodywork, gold structural trim, blue jewel lights, wide black tires with gold hubs, and a prominent gold dragon shield at the nose. Its ornament should look built into the chassis rather than pasted onto it.

The cockpit must fit a literal dragon. Provide space for a long torso, folded wings, and a visible tail channel. Foreclaw controls must work without humanizing the driver. The kart supplies one modeled steering control; every driver raster remains free of kart and control geometry.

The design must avoid a generic fantasy carriage, a throne on wheels, a humanoid-sized seat, excessive filigree, and bodywork that hides Dragon Queen's wings or tail. The nose shield is the primary emblem. No text or monogram belongs on the kart.

## Portrait candidate requirements

- Solo head-and-upper-body portrait on a genuinely transparent background
- Square composition with enough margin for a 256 x 256 runtime crop
- Three-quarter or near-profile angle that keeps both molten-gold eyes readable
- Crown, horns, folded wing roots, neck scales, gold-flecked navy hide, ceremonial cloth, and the beginning of the long tail visible
- Calm, benevolent authority; closed mouth or restrained neutral mouth
- Strong silhouette at approximately 48 pixels
- No kart, wheel, scenery, text, badge, border, checkerboard, or watermark

## Approved portrait design

Manny approved Candidate 2 on 2026-09-03. The tight head-and-upper-torso framing preserves the molten-gold eyes, long muzzle, crown, horns, both wings, curling tail, navy scales with gold flecking, and ceremonial regalia. The face remains large enough for the 256 x 256 runtime portrait and approximately 48-pixel HUD presentation.

The 1254 x 1254 review export is RGB with a baked checkerboard. It is approved as design authority only. The background will be removed deterministically after the ten driver designs are approved, then the portrait will be resized with premultiplied alpha. No opaque review export may enter `public/assets/characters/aa-06/portrait.png`.

## Approved driver designs and normalization

Manny approved all ten driver-state designs on 2026-09-04. Both steering pairs are directionally distinct. Hit remains a controlled reaction, while victory uses a closed mouth and restrained sovereign salute. Both wings and one long tail remain visible in every frame.

The approved set rejects three defects found during candidate preparation: a duplicated tail in chase steer-right, a roaring chase victory, and a human-like circular finger gesture in front victory. Those defects were replaced before approval and must not return in later derivatives.

The review exports include both native-alpha files and opaque files with baked checkerboards. `tools/assets/prepare_dragon_queen_2d.py` handles those source types separately, clears hidden RGB, and uses premultiplied-alpha resizing. Two runs produced the same eleven output hashes. The staged outputs are one 256 x 256 portrait and ten 512 x 512 non-interlaced sRGBA PNGs with transparent corners. Their relative-path SHA-256 manifest is `6be70b53cb3f63a33e349c7ba2e66d4d413034d32f47ab549d96f23bcc74d7fd`.

## Driver-state requirements

All ten driver frames use the same approved identity and seated footprint. The long tail remains visible, and folded wings remain recognizable without blocking the head or cockpit read. Steering pairs must show opposite commanded turns without mirroring text or asymmetrical anatomy. Hit is a controlled recoil, not panic or feral rage. Victory is dignified and sovereign rather than exuberant slapstick.

Camera-facing and chase-facing art must preserve the same physical anatomy. The frames contain no wheel, seat, tire, kart panel, or opaque preview background.

## Approved gameplay identity

AA-06 Grip Specialist uses Speed 6 / Acceleration 6 / Weight 5 / Handling 7 / Mini-Turbo 5 / Traction 7. The visual package should communicate controlled grip and deliberate authority without implying heavyweight collision dominance or featherweight agility.

## Production boundaries

- Do not humanize or anthropomorphize Dragon Queen.
- Do not omit the wings or long tail from any raster.
- Do not replace foreclaws with human hands.
- Do not make her snarl, roar, or look needlessly aggressive.
- Do not use excessive jewelry, exposed humanoid anatomy, or sexualized posing.
- Do not flatten the navy scales into plain blue; retain subtle gold flecking.
- Do not place a wheel, kart body, seat, or scenery in any driver raster.
- Do not place generated candidates in runtime paths before visual approval.
- Do not overwrite Cleo's archived AA-06 files. Preserve them byte-for-byte before runtime integration.

## Approved 3D package

Manny approved Candidate 2 on 2026-09-04. Candidate 1 was rejected internally because the nose read as a round grille, its side scales read as dots, and the steering wheel dominated the cockpit. Candidate 2 uses a shield-shaped prow, connected gold chevrons, a smaller and lower control, structural gold rails, blue jewel lights, four substantial tires, broad wing clearance, and a long open tail channel.

| Runtime path                                   | LOD  | Triangles | SHA-256                                                            |
| ---------------------------------------------- | ---- | --------: | ------------------------------------------------------------------ |
| `public/assets/characters/aa-06/kart.glb`      | LOD0 |    12,164 | `57b3f4b248ed96cd19b0c2b233aec4462fde73b102ad9acde8941550bf69e305` |
| `public/assets/characters/aa-06/kart-lod1.glb` | LOD1 |     7,268 | `31bdd684fb764fdb4d6e04726971e0bf3f34ee4f36aefbf652fcdf3b133053c3` |
| `public/assets/characters/aa-06/kart-lod2.glb` | LOD2 |     3,620 | `124ec43e1ada192d67a3d4fe6bb6c3ec1cdd3f9df6b6c22b1af05b25762197de` |

All three GLBs use four materials, thirteen required nodes, one `SteeringWheel`, and `extras.forward: "-Z"`. Deterministic reruns matched byte-for-byte. `tools/assets/build_dragon_queen_sovereign_wyrm.py` is the source.

## Runtime placement

Chase-facing driver states remain at `[0, 0.95, -0.12]`. Live playtest rejected the deployed camera-facing position at the same height because Dragon Queen's foreclaws appeared above the modeled steering control. The first local correction moved all five camera-facing states to `[0, 0.84, -0.12]`; Manny found steer-right still slightly high.

The revised front-camera review keeps neutral, steer-left, hit, and victory at `[0, 0.84, -0.12]` and lowers only steer-right to `[0, 0.80, -0.12]`. The kart, control, raster assets, chase states, sprite scale, and depth remain unchanged. Two review renders matched SHA-256 `1375abc4e30eaecadb1409030e0fea3e6ca3dd793ad8916227e24925a94006b2`. Manny approved the complete sheet and authorized branch publication on 2026-09-04. Deployment and a focused live rear-view retest remain required.

## Required runtime outputs

- `portrait.png`: 256 x 256 transparent sRGBA
- Ten driver states under `driver/`: 512 x 512 transparent sRGBA
- `kart.glb`, `kart-lod1.glb`, and `kart-lod2.glb`
- Current controlled asset revision in the character manifest
- Runtime-asset gate coverage for every PNG and GLB

All required files are active under `dragon-queen-runtime-20260904-1`. Cleo's former AA-06 package is preserved unchanged at `public/assets/archive/characters/cleo-aa-06/`. The placement correction changes no asset bytes, so the controlled asset revision remains valid. Publication and deployed rear-view acceptance remain gated.

## Character Select full-body selection art

- Runtime asset: `public/assets/characters/aa-06/selection/full-body.png`.
- Format: 1024 × 1536 transparent sRGBA PNG, governed by Git LFS.
- Approval: Manny approved Dragon Queen's selection-only full-body asset in the 2026-09-19 final Character Select batch review.
- Boundary: The image preserves literal dragon anatomy, wings, and tail. Selection-only art does not change the portrait, race driver frames, The Sovereign Wyrm kart package, statistics, or PBR/material implementation.
