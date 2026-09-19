# Toph / The Grave Shift Asset Brief

## Governing locks

- Character, definitive reference, and transformation rights: Approved 2026-08-28
- Kart name and design direction: Approved 2026-08-28
- Balance profile: AA-08 Turbo Bruiser, approved 2026-08-28
- Portrait and six base driver-state designs: Approved 2026-08-28
- Four front-action designs: Approved 2026-09-02
- Kart GLB geometry: Candidate 2 approved 2026-08-28
- Runtime activation: Live accepted 2026-08-28

## Approved 2D package

Runtime derivatives are stored under `public/assets/characters/aa-08/`:

- `portrait.png`: 256 × 256 sRGBA
- `driver/front.png`: 512 × 512 sRGBA
- `driver/rear.png`: 512 × 512 sRGBA
- `driver/steer-left.png`: 512 × 512 sRGBA
- `driver/steer-right.png`: 512 × 512 sRGBA
- `driver/hit.png`: 512 × 512 sRGBA
- `driver/victory.png`: 512 × 512 sRGBA
- `driver/front-steer-left.png`: 512 × 512 sRGBA
- `driver/front-steer-right.png`: 512 × 512 sRGBA
- `driver/front-hit.png`: 512 × 512 sRGBA
- `driver/front-victory.png`: 512 × 512 sRGBA

All files have genuine alpha spanning transparent to opaque and fully transparent corners. Driver layers contain no kart, seat, or steering-wheel geometry. The initial generated previews contained baked light checkerboards; `tools/assets/prepare_toph_2d.py` deterministically removes only edge-connected light-neutral background pixels before square containment and runtime resizing. Dark-background contact-sheet inspection confirms clean silhouettes and no retained checkerboard cells.

Manny approved the four camera-facing action candidates on 2026-09-02. Commanded left leans toward the viewer's right, commanded right leans toward the viewer's left, hit reads as an impact recoil, and victory keeps the lower body race-forward while the torso celebrates. The front-action previews also arrived with an opaque checkerboard; the reviewed runtime derivatives remove the edge-connected background and one-pixel alpha fringe without changing the approved character artwork.

Front-action SHA-256 values: left `d2842af32df5e92c10454497b8da3cba92591e52324df571f67bd0ebf7c4f39b`; right `663c18ef0a5fbcbb0cffc796bcd9c209675941a95fc082903360a536b9a33f48`; hit `bf2411404f6311bcb648966ca64f5c5f06a4ce4e3b728ca75fd3f0d56323691d`; victory `96ee0fcf6a8ca14e12db258ba58797d8161ca463e33d6c86a19db4bbe2beea9c`.

## Approved 3D package

The approved The Grave Shift package is produced by a deterministic LOD0/LOD1/LOD2 builder. The production model provides:

- Low aggressive street-racer silhouette
- Dark bronze connected frame and exposed mechanical construction
- Black and deep-purple bodywork
- Four physically connected wide tires
- Open cockpit and chassis-mounted steering assembly sized for the approved driver frames
- Structurally integrated thorned-skull nose shield
- Rear-mounted purple exhaust-energy treatment
- `extras.forward: "-Z"` on every GLB
- `NEGATIVE_Z_KART_VISUAL_YAW` in the future manifest entry

Candidate 2 replaced the rejected rounded/clown-like Candidate 1 with the definitive purple-dominant armored interpretation: a flat trapezoidal skull shield, angular integrated thorn crown, enclosed sidepods, low splitter, and enclosed rear engine with twin violet exhausts.

| Runtime path | LOD | Triangles | SHA-256 |
| --- | --- | ---: | --- |
| `public/assets/characters/aa-08/kart.glb` | LOD0 | 8,604 | `87db250bcacbbbe93afdee0e4a346ff3c5aaca7fbb90668af383b1772154c953` |
| `public/assets/characters/aa-08/kart-lod1.glb` | LOD1 | 4,452 | `1d3b62f715e6288b01447eafe2a81a07b09fe676019b1849ff3b5b78ad9c4d23` |
| `public/assets/characters/aa-08/kart-lod2.glb` | LOD2 | 2,344 | `2c38dd14a334443fff3f872fc618210642f51dfc8b612bf1f075b347a5a65be7` |

All three GLBs have 13 required nodes and `extras.forward: "-Z"`. The controlled runtime revision is `toph-runtime-20260902-2`. LFS publication materialized successfully in CI. The front-action revision deployed through PR #68 and main run `33661819292`; the live bundle and all four deployed front-action PNG hashes match the approved checkpoint. Manny accepted the live camera/action package on 2026-09-02 with `[0, 0.45, -0.12]` preserved.

## Live acceptance

Manny confirmed the deployed AA-08 package passes all tests on 2026-08-28. The final front-camera placement uses `[0, 0.45, -0.12]`, aligning Toph's hands with the modeled steering wheel while leaving rear, steer-left, steer-right, hit, victory, and AI rear placement unchanged. Final correction merge: `3353109944c3975e0bbbbac4dffbcc24f07bc58b`.

## Character Select full-body selection art

- Runtime asset: `public/assets/characters/aa-08/selection/full-body.png`.
- Format: 1024 × 1536 transparent sRGBA PNG, governed by Git LFS.
- Approval: Manny approved Toph's clean selection-only full-body asset in the 2026-09-19 Character Select batch review after the marked candidate was rejected.
- Boundary: Selection-only art; the portrait, race driver frames, The Grave Shift kart package, statistics, and PBR/material implementation remain unchanged.
