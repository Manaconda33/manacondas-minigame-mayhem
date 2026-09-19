# McFleurdel production asset brief

## Package identity

- Character: McFleurdel
- Runtime ID: `aa-07`
- Balance profile: AA-07 High-Speed Cruiser
- Kart: The Fleur de Nuit
- Package status: **Production package live; front-action expansion approved, deployed, and live accepted**

## Runtime PNG contract

| Path                                                    | Size      | Use                          | SHA-256                                                            |
| ------------------------------------------------------- | --------- | ---------------------------- | ------------------------------------------------------------------ |
| `public/assets/characters/aa-07/portrait.png`           | 256 x 256 | Character Select portrait    | `b07235fdc771a816e9027294ffe2e035a06fce2bd2bc57768ce989a5f67d82e1` |
| `public/assets/characters/aa-07/driver/front.png`       | 512 x 512 | Front-facing race camera     | `8a408a7fda63b60828bbf321a626eff780a8172a9e4da3a633f77890e9e337c0` |
| `public/assets/characters/aa-07/driver/rear.png`        | 512 x 512 | Neutral chase-camera state   | `d08174fcbe583317f1288c24f1ccd000e58d691d4f6643dd973cad995f174d62` |
| `public/assets/characters/aa-07/driver/steer-left.png`  | 512 x 512 | Chase-camera left steering   | `a9636724e54e8e1f05308868983a7bd6ba0fee19f85749d3ff5487a42abebce2` |
| `public/assets/characters/aa-07/driver/steer-right.png` | 512 x 512 | Chase-camera right steering  | `bc944b339db304739a688d4dd23cc8da51b76394147252d41473e8bef78a753b` |
| `public/assets/characters/aa-07/driver/hit.png`         | 512 x 512 | Chase-camera impact reaction | `a27326721f4ceac8f0fc1336636a0487ff4d35265faa9cf5a04d76a92d7bfb9e` |
| `public/assets/characters/aa-07/driver/victory.png`     | 512 x 512 | Chase-camera victory turn    | `42d5c3ce61fec1b21765cb18875cc1a92ac83fbf69cf3452e48beb81ffba944b` |
| `public/assets/characters/aa-07/driver/front-steer-left.png` | 512 x 512 | Front-facing left steering | `d69dc042efab13389fd259bfcee8556328657bda3e06ce1cbcdb155f4ab62a41` |
| `public/assets/characters/aa-07/driver/front-steer-right.png` | 512 x 512 | Front-facing right steering | `e2c99f93a3f33fb627967de88852cfe49289f0fe6fffc007beda1c1aa079ce7b` |
| `public/assets/characters/aa-07/driver/front-hit.png` | 512 x 512 | Front-facing impact reaction | `440b48865114ac4fc2c6acde6f5133c001c3a4c18ccb5fc72772791e874f1c21` |
| `public/assets/characters/aa-07/driver/front-victory.png` | 512 x 512 | Front-facing victory pose | `cb5be9ae847303aa8edf74204e809a1bb690754784d671f145243eb1b195f36f` |

Every file is sRGB RGBA with alpha spanning fully transparent to fully opaque and four fully transparent corner pixels. The approved hit and victory frames intentionally invert the visible hair-color placement to white on the viewer's left and black on the viewer's right.

The four approved front-action frames preserve black hair on the viewer's left and white hair on the viewer's right. The steering frames contain transparent gaps inside the black curls and behind both arms. The runtime gate rejects any connected pale matte component of 30 pixels or more in those reviewed gap regions.

## Driver-state behavior

- Rear remains the visible fallback.
- Front is independently approved and is not a mirrored rear frame.
- Rear, front, steer-left, steer-right, and hit preserve a stable seated footprint.
- Steering states keep both hands in a believable driving position without wheel geometry.
- Hit shows a controlled recoil while McFleurdel remains seated.
- Victory keeps the lower body race-forward while she turns toward the chase camera and traces a violet fleur-de-lis sigil.

## Definitive kart direction

Preserve the low black-lacquer gothic grand-tourer, silver architectural filigree, plum throne cockpit, fleur-de-lis nose shield, exposed connected wheels, structurally integrated candle fixtures with violet flames, and purple exhaust energy from the definitive reference.

Manny approved Candidate 9 on 2026-08-27 after the candle silhouette, black body material, raised silver fleur-de-lis, and contrasting black shield were corrected and verified in an external mobile GLB viewer.

| Runtime path                                   | LOD  | Triangles | SHA-256                                                            |
| ---------------------------------------------- | ---- | --------: | ------------------------------------------------------------------ |
| `public/assets/characters/aa-07/kart.glb`      | LOD0 |    19,844 | `5d7e0941b90ac5d13bb4e019ec43f22a5f9e841c89abaf568ab0c226d8cc92c0` |
| `public/assets/characters/aa-07/kart-lod1.glb` | LOD1 |    11,460 | `8169b05da4a66894d76904f7193c845755bf8d556d01805cc16e8cd870d9a939` |
| `public/assets/characters/aa-07/kart-lod2.glb` | LOD2 |     4,572 | `d862fdb489419d96917b1df3ee7f7eab56796b7aa3be7906be3abab67c03d77f` |

All three files are deterministic binary glTF, use meters, declare `extras.forward: "-Z"`, preserve the required runtime nodes, and keep black body material separate from the silver fleur/trim material.

## Front-action acceptance

`mcfleurdel-runtime-20260901-2` deployed through PR #65 and main run `33563732551`. The live bundle references the controlled revision, and all four deployed front-action PNG responses match the approved SHA-256 values above.

Manny accepted the live front-action package on 2026-09-01 against deployed checkpoint `f8a2ed8be0d72fde62c9403dae4b15e94222f7da`. Both steering directions, hit, victory, chase-state restoration, cockpit placement, transparency, and modeled-wheel ownership pass. No sprite-owned duplicate wheel appears, and the reviewed black-curl interiors and arm gaps remain transparent.

## Character Select full-body selection art

- Runtime asset: `public/assets/characters/aa-07/selection/full-body.png`.
- Format: 1024 × 1536 transparent sRGBA PNG, governed by Git LFS.
- Approval: Manny approved McFleurdel's selection-only full-body asset in the 2026-09-19 Character Select batch review.
- Boundary: Selection-only art; the portrait, race driver frames, The Fleur de Nuit kart package, statistics, and PBR/material implementation remain unchanged.
