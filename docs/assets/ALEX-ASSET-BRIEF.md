# Alex Asset Brief

## Governing locks

- Character: Alex, adult woman, warm and clever competitor
- Definitive reference and transformation rights: approved by Manny, 2026-09-05
- Profile: AA-01 Feather Sprinter — 6 / 9 / 2 / 8 / 7 / 4
- Kart: The Neon Vector, approved by Manny, 2026-09-05
- 2D package: Portrait Option A and all ten driver states approved
- Geometry: Neon Vector Candidate 3 approved by Manny, 2026-09-05
- Runtime revision: `alex-runtime-20260905-1`; published, deployed, and live accepted

## Visual authority

Preserve Alex's short side-swept blonde hair, blue eyes, black rectangular glasses, black gaming headset, charcoal hooded racing jacket, cyan/magenta neon trim, and small cyan/magenta cheek circuit nodes with fine dark connections. The package must retain the established stylized racer art direction and a warm, clever competitive expression.

## Kart direction

The Neon Vector is a low, faceted open-wheel cyber racer with graphite/navy bodywork, cyan and magenta circuit accents, wide ring-lit tires, triangle/play motifs, twin violet exhausts, and one modeled steering wheel. Candidate 3's exposed left/right cockpit-to-thruster conduits are structural identity elements and must remain visible in rear three-quarter and profile review. Do not introduce floating hood emblems, steering-wheel intrusions, or extra pale geometry.

## Runtime placement

The driver rasters are character-only and do not include a steering wheel. The production manifest mounts Alex at chase-facing `[0, 0.92, -0.12]` and camera-facing `[0, 0.84, -0.12]`, preserving the kart's single modeled wheel. Offline and deployed review confirmed seated lower-body occlusion, readable hands, no second wheel, and visible rear conduits.

## Production outputs

- `public/assets/characters/aa-01/portrait.png`: 256 x 256 transparent sRGBA
- `public/assets/characters/aa-01/driver/*.png`: ten 512 x 512 transparent sRGBA frames
- `public/assets/characters/aa-01/kart.glb`, `kart-lod1.glb`, `kart-lod2.glb`
- `tools/assets/build_alex_neon_vector.py`: deterministic geometry source
- `tools/assets/render_alex_cockpit_review.py`: offline attachment evidence

All three GLBs use four materials, the required node hierarchy, exactly one `SteeringWheel`, and `extras.forward: "-Z"`. The asset verifier covers all eleven PNGs and three GLBs. PR #92 merged at `617312394decfcb95af4f8fee6431ee9d339201b`, Pages run `33989653688` deployed the package, and Manny approved the deployed desktop/mobile presentation against checkpoint `daf1e3127478981e40cca9533300f8617f61004d`. The asset package is **LIVE ACCEPTED / CLOSED**.

## Character Select full-body selection art

- Runtime asset: `public/assets/characters/aa-01/selection/full-body.png`.
- Format: 1024 × 1536 transparent sRGBA PNG, governed by Git LFS.
- Approval: Manny approved Alex's selection-only full-body asset in the 2026-09-19 Character Select batch review.
- Boundary: Selection-only art; the portrait, race driver frames, The Neon Vector kart package, statistics, and PBR/material implementation remain unchanged.
