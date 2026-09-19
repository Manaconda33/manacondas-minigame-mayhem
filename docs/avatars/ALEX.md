# Alex - Racer Intake Record

## Approval state

- Character lock: Approved by Manny, 2026-09-05
- Definitive visual authority: Supplied Alex racer reference; written lock governs conflicts
- Transformation rights: Confirmed by Manny, 2026-09-05
- Kart lock: The Neon Vector, approved by Manny, 2026-09-05
- Balance mapping: AA-01 Feather Sprinter, approved by Manny, 2026-09-05
- Portrait design: Option A approved by Manny
- Ten-frame driver design package: Approved by Manny; chase steering uses the final one-hand revision
- 3D kart geometry: Candidate 3 approved by Manny
- Runtime activation: Published, deployed, and live accepted by Manny, 2026-09-05

## Character lock

Alex is an adult woman and a warm, clever competitor. She has fair skin, blue eyes, short side-swept blonde hair, black rectangular glasses, and a black gaming headset with cyan/magenta accents. Small glowing cyan/magenta circuit nodes with fine dark connections mark both cheeks. She wears a charcoal hooded racing jacket and gloves with cyan and magenta neon trim. Her expression remains approachable and focused rather than aggressive.

The supplied reference is definitive visual authority and Manny authorized its transformation into public game assets. The established polished, stylized racer art style remains the governing rendering language.

## Kart lock

The Neon Vector is a low, faceted open-wheel cyber racer in graphite/navy, cyan and magenta neon circuit detailing, wide ring-lit tires, a triangle/play motif, twin violet exhausts, and one modeled steering wheel. The approved Candidate 3 preserves the exposed cyan left and magenta right rear conduits between the cockpit and thrusters. The kart owns the modeled steering wheel; all driver rasters remain character-only and wheel-free.

## Balance mapping

AA-01 Feather Sprinter: Speed 6 / Acceleration 9 / Weight 2 / Handling 8 / Mini-Turbo 7 / Traction 4.

Alex is a high-acceleration, high-control featherweight. She launches quickly, responds cleanly, and rewards drift timing, but gives up collision resistance and off-road forgiveness. The profile communicates clever reactive competition without overlapping Lavi's more technical AA-02 tuning or Lula's higher traction.

## Required production contract

- Portrait: 256 x 256 transparent sRGBA PNG
- Driver frames: front, rear, steer-left, steer-right, hit, victory, front-steer-left, front-steer-right, front-hit, and front-victory
- Every driver frame: 512 x 512 transparent sRGBA PNG with transparent corners
- Kart package: deterministic LOD0, LOD1, and LOD2 GLBs with `extras.forward: "-Z"`
- Runtime orientation: `NEGATIVE_Z_KART_VISUAL_YAW`
- Controlled runtime revision: `alex-runtime-20260905-1`
- Desktop and mobile live acceptance: Passed against deployed checkpoint `daf1e3127478981e40cca9533300f8617f61004d`

## Approved 2D package

Portrait Option A keeps the original silhouette and posture. The ten driver states preserve the warm, clever competitor read. Chase steer-left and steer-right use moderate turn-directed upper-torso rotation, keep Alex's lower body seated and forward, and show only the turn-side hand. The package contains no baked kart or steering-wheel geometry.

The normalized package is `alex-2d-production-v1`, with a 256 x 256 portrait and ten 512 x 512 transparent sRGBA frames. The conversion retained the approved cheek-node markings and used deterministic matte removal only.

## Approved Neon Vector geometry

Manny approved Candidate 3 on 2026-09-05. The three LODs use 10,396, 6,444, and 3,420 triangles. The model has four explicit materials, thirteen required nodes, one `SteeringWheel`, and `extras.forward: "-Z"`. The single wheel remains modeled; the rear cockpit-to-thruster conduits are exposed and structurally readable in the approved review angles.

| Runtime path | LOD | Triangles | SHA-256 |
| --- | ---: | ---: | --- |
| `public/assets/characters/aa-01/kart.glb` | LOD0 | 10,396 | `2df26b2cf70781a410a110a35616fc19506ef014e0140b499b9470f7f5d39e85` |
| `public/assets/characters/aa-01/kart-lod1.glb` | LOD1 | 6,444 | `abf82edd061876d5b2d71ae2f618707ae947d61aa5805a811e1246f011f08b84` |
| `public/assets/characters/aa-01/kart-lod2.glb` | LOD2 | 3,420 | `dced4db85903cc8b410b1a746608cb1f4fdd7f101192d79bbf2d580fa705d68a` |

## Production runtime closure

Alex is active in `characterManifest` as AA-01 under `alex-runtime-20260905-1`. The production mount uses chase-facing `[0, 0.92, -0.12]` and camera-facing `[0, 0.84, -0.12]`, with the modeled wheel retained. PR #92 passed CI and merged at `617312394decfcb95af4f8fee6431ee9d339201b`; Pages deployment passed in run `33989653688`. Manny approved the deployed desktop/mobile matrix against checkpoint `daf1e3127478981e40cca9533300f8617f61004d` on 2026-09-05.

The ten-state offline attachment sheet is `alex-cockpit-review.png` outside the repository (SHA-256 `a875c7456b6fa2cea13d0d953d6033000bda7235dc28666da77441e7367c07fa`). Full dependency-backed validation, LFS publication/fetch-back, PR CI, Pages deployment, artifact-byte verification, and product-owner live acceptance passed. Alex / The Neon Vector is **LIVE ACCEPTED / CLOSED**.

## Character Select full-body selection art

- Runtime asset: `public/assets/characters/aa-01/selection/full-body.png`.
- Format: 1024 × 1536 transparent sRGBA PNG, normal-Git runtime delivery derivative under ADR-092.
- Approval: Manny approved Alex's selection-only full-body asset in the 2026-09-19 Character Select batch review.
- Boundary: Character Select only; the approved portrait, ten-state race driver package, The Neon Vector identity/geometry, statistics, and PBR/material implementation remain unchanged.
