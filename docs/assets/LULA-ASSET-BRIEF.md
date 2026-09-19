# Lula / The Verdant Hart Asset Brief

## Governing locks

- Character, definitive reference, and transformation rights: Approved 2026-08-29
- Kart name and design direction: Approved 2026-08-29
- Balance profile: AA-03 Feather Dirt Ace, approved 2026-08-29
- Portrait and six driver-state designs: Approved 2026-08-29
- Kart GLB geometry: Candidate 4 approved 2026-08-29

## Approved 2D package

Runtime derivatives are stored under `public/assets/characters/aa-03/`:

- `portrait.png`: 256 × 256 sRGBA
- `driver/front.png`: 512 × 512 sRGBA
- `driver/rear.png`: 512 × 512 sRGBA
- `driver/steer-left.png`: 512 × 512 sRGBA
- `driver/steer-right.png`: 512 × 512 sRGBA
- `driver/hit.png`: 512 × 512 sRGBA
- `driver/victory.png`: 512 × 512 sRGBA

All eleven raster files have transparent backgrounds, fully transparent corners, and approved clean silhouettes. Driver layers contain no kart, seat, or steering-wheel geometry. Live mobile testing exposed white background islands that the first edge-connected cleanup had not removed. `tools/assets/repair_lula_alpha.py` now removes every neutral-white component outside explicit face/eye protection zones and cleans the adjacent pale spill. Side-by-side package review also found saturated orange skin in the five chase-camera states. `tools/assets/repair_lula_skin_tone.py` normalizes only the reviewed exposed-skin masks to the approved portrait/front palette while preserving every non-skin and alpha pixel. The ten-state driver package uses revision `lula-runtime-20260903-3`.

## Approved 3D package

Candidate 4 preserves the approved low stag-racer silhouette while replacing exposed cylinder endcaps with overlapping organic joints. The stag face, cheek roots, structural antlers, cockpit roots, wheel housings, and wooden outlets form one connected construction. Dedicated foliage geometry and a neutral leaf material keep the embedded leaf clusters visibly green across viewers.

| Runtime path                                   | LOD  | Triangles | SHA-256                                                            |
| ---------------------------------------------- | ---- | --------: | ------------------------------------------------------------------ |
| `public/assets/characters/aa-03/kart.glb`      | LOD0 |    21,948 | `6842eecf711117d8ca521ebd9620926268452193f5c3b9e2ba7ad9aba090c26c` |
| `public/assets/characters/aa-03/kart-lod1.glb` | LOD1 |     8,954 | `b9a267a6a41d14a674771cc0137d1b0445e1a264bfa8b2c5acc7c6685ab399cd` |
| `public/assets/characters/aa-03/kart-lod2.glb` | LOD2 |     4,746 | `3a062ee6bee2502bdd3914063cc549a08e4de151ebf5bcfc3a52fe9658eb57f0` |

All three GLBs provide 13 required nodes and `extras.forward: "-Z"`. The controlled runtime revision is `lula-runtime-20260903-3`. The branch-scoped LFS bridge uploaded the locked objects, and PR #44 CI run `33266092639` independently materialized and validated them. Main checkpoint `514113e` deployed the corrected transparent sprite palette, and checkpoint `ef74ca9` aligned the front-camera hands with the steering wheel. Manny accepted the original live mobile package on 2026-08-30.

## Front-action deployment gate

Manny approved the front-steer-left, front-steer-right, front-hit, and front-victory review set on 2026-09-03. The package uses the neutral front as its visual and footprint authority and preserves the corrected complexion, green hair, leaf forehead mark, transparent internal gaps, wheel-free driver layer, and `[0, 0.45, -0.12]` placement. The four files are deployed under `lula-runtime-20260903-3` through PR #73 and main run `33708310011`. Their SHA-256 values are `4d4efdacb0d38c924b356d2a32ace046ac744a2ec6da0329a8c60a49e545a0ff`, `6a400c0d2745b2e3fbe13e100fb3b99d09d404ea98e95c6dc995788aee0376ea`, `3e99891c712310ff8018b9db9258e8f9a77be949b7403bd28d7a6b8fd679f444`, and `5c6b662f0449a811319b89396a8053c6e58dc9b0f4916162e37ad5a06434f453` in that order, and all four deployed responses match. Desktop/mobile camera-action acceptance remains pending.

## Character Select full-body selection art

- Runtime asset: `public/assets/characters/aa-03/selection/full-body.png`.
- Format: 1024 × 1536 transparent sRGBA PNG, governed by Git LFS.
- Approval: Manny approved Lula's selection-only full-body asset in the 2026-09-19 Character Select batch review.
- Boundary: Selection-only art; the portrait, race driver frames, The Verdant Hart kart package, statistics, and PBR/material implementation remain unchanged.
