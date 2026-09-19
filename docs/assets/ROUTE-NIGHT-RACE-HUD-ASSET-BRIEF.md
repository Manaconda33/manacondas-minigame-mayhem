# Route Night Race HUD asset brief

## Batch 01 status

**APPROVED / PREPARED** — 2026-09-19. This checkpoint contains the first
three approved ImageGen item identities for Slice 6A. The source renders remain
outside the repository; only fixed-size runtime derivatives are committed.

The canonical Route Night reference at
docs/reference/route-night/ROUTE-NIGHT-CANONICAL-REFERENCE.png was used only
for visual-language guidance: deep indigo/graphite, cyan route energy,
restrained violet, and warm-gold accents. No canonical pixels, copy, logos,
marks, characters, vehicles, or UI layout were copied.

## Runtime contract and preparation

- Runtime delivery is a 512 x 512 transparent sRGBA PNG.
- Each source was generated as one centered, text-free item identity with no
  labels, counters, glyphs, logos, watermark, characters, kart, or scenery.
- The 1254 x 1254 sRGBA source was deterministically resized to 512 x 512 with
  ImageMagick Lanczos resizing, preserving alpha and converting to sRGB PNG32.
- Live item names, charges, roulette state, warnings, behavior, and procedural
  VFX remain authoritative; these images provide visual identity only.

| Item | Generator output ID | Source dimensions / format | Source SHA-256 | Runtime path | Runtime SHA-256 |
| --- | --- | --- | --- | --- | --- |
| Kinetic Disc | exec-4171bfdd-9a39-44fc-bf57-e8fb6b58e3b8 | 1254 x 1254 sRGBA PNG | edc7be16ee0c9ab6348cf5a148bb1ef3498c5746b4b86313c7f626aebff2a725 | public/assets/items/route-night/kinetic-disc.png | ad079a229d1908c06f232fb6f71e77e096ba92836e61f9c94a74395fa9909028 |
| Seeker Drone | exec-4fb686b2-d6ee-442b-9040-bf1a4b834c92 | 1254 x 1254 sRGBA PNG | ff49826405b7f46b9c1fdea2aae00a3b0592e5c4515306190e85d1bb07651f7e | public/assets/items/route-night/seeker-drone.png | 0c475a2135a9ee742ff76b3db0c9f0fc28f4da4b38dfca4dc036eb37ba3b27b4 |
| Apex Missile | exec-690b6b9e-eff8-40fe-ae56-186dc80bf14d | 1254 x 1254 sRGBA PNG | 0895187289fe79f784a9d215755f1c22ab11862a702630bf623a16089f3d020c | public/assets/items/route-night/apex-missile.png | 522f4be0877661278be7a0290036fc4bdbaeb1316c1a24bc33a9ceae0390f08c |

## Validation

- identify reports each runtime file as 512 x 512 sRGBA.
- identify reports each runtime file as non-opaque with genuine alpha.
- Source and runtime SHA-256 values above were computed after generation and
  preparation.
- No rejection was carried into this approved batch.

## Batch 02 status

**APPROVED / PREPARED** — 2026-09-19. This checkpoint adds the next three
approved ImageGen item identities for Slice 6A.

| Item | Generator output ID | Source dimensions / format | Source SHA-256 | Runtime path | Runtime SHA-256 |
| --- | --- | --- | --- | --- | --- |
| Blast Orb | exec-0ee6e2a4-6a3c-40ee-aa9c-dadc76d7997f | 1254 x 1254 sRGBA PNG | 67d491f2479a5556c12fa70b2ad05aa1c0c23d1c700eef937d6375c5612fbf3e | public/assets/items/route-night/blast-orb.png | 32b61d9584298d26fd1651b34f1d9881cfabb752df8eccf4a7e2254f5919329d |
| Blaze Orbs | exec-ab84b131-8046-4d40-bd57-59473ca17f75 | 1254 x 1254 sRGBA PNG | 44d3f9f08431cd8a4facb1bf6572e88f8b33f793d57a5c06bde188ac93be1c29 | public/assets/items/route-night/blaze-orbs.png | a521f690425ebd7ec3b8b125bebd29eb09ec1684dca191918004c6becc95fd2a |
| Frost Orbs | exec-d2b4b977-f5a9-438c-8ab2-969d7570c0c3 | 1254 x 1254 sRGBA PNG | 2dd6d9272d127ec14874d7571aa260a1a05dc5d48dd8fb2e6b191f8675e0cffd | public/assets/items/route-night/frost-orbs.png | 36a16fd6aa8edde4714c4e8eabc9c571e748974e97dab14155bc492660a452ae |

The same deterministic preparation and validation contract as Batch 01
applies: Lanczos resize to 512 x 512, sRGB PNG32 output, preserved alpha,
text-free original art, and live runtime data remaining outside the image.

## Batch 03 status

**APPROVED / PREPARED** — 2026-09-19. This checkpoint adds the third
approved ImageGen item batch for Slice 6A.

The batch preserves the approved item-specific silhouettes while carrying the
Route Night language: graphite cores or surfaces, cyan route energy, restrained
violet/magenta charge, and warm-gold accents. Each source is text-free,
transparent, and isolated from characters, vehicles, scenery, and UI.

| Item | Generator output ID | Source dimensions / format | Source SHA-256 | Runtime path | Runtime SHA-256 |
| --- | --- | --- | --- | --- | --- |
| Rebounding Arc Blade | exec-133a4e31-f036-4fd9-a260-2749d312d099 | 1312 x 1199 sRGBA PNG | f4b66913251eea02a08613f454f93d43e613002e187620109d7cb899b99f7586 | public/assets/items/route-night/arc-blade.png | 1f9357e2a73a3a87f360500f403e33abb396f8734b74796bf267efa5b3136df8 |
| Kinetic Arc Hammers | exec-e891a990-c912-41b7-a7db-40e1eff1ff58 | 1536 x 1024 sRGBA PNG | 32acdb818b50f37cdc89859c4fec979448bf22a881cdcc6b07fbb628d9ba7456 | public/assets/items/route-night/arc-hammers.png | 0a478bbc153e9dce94745b87e19d75c471ed78481fe57e3fb02f948a557eed36 |
| Slick Trap | exec-2fcdc70c-1cef-48e2-8029-3cd7ad7b24ba | 1536 x 1024 sRGBA PNG | 62d4be0612fe68d3b450066a82d2c2eede36d2fc07d551b95fd87b330304fbb8 | public/assets/items/route-night/slick-trap.png | 5ebc61cef87f28028867e83dfcbf8abc5c0724fa2447207620b3045077ba7c26 |

The same deterministic preparation and validation contract as the earlier
batches applies: Lanczos resize to 512 x 512, sRGB PNG32 output, preserved
alpha, and live runtime data remaining outside the image.

## Batch 05 status

**APPROVED / PREPARED** — 2026-09-19. This checkpoint adds the fifth
approved ImageGen item batch for Slice 6A.

The batch completes the remaining item identities: sustained Nitro Overdrive,
guided Hyper-Drive Rocket, and chromatic Prismatic Invincibility. Each source
is text-free, transparent, and isolated from characters, vehicles, scenery,
and UI while preserving distinct gameplay readability at small HUD sizes.

| Item | Generator output ID | Source dimensions / format | Source SHA-256 | Runtime path | Runtime SHA-256 |
| --- | --- | --- | --- | --- | --- |
| Continuous Nitro Overdrive | exec-cd2e6c40-1fa4-4cef-95f9-1dc430a52a2c | 1378 x 1141 sRGBA PNG | 710008bbc72f734ac2277bc167431f58f3284174f17014597cd6eb1c51ff3a68 | public/assets/items/route-night/nitro-overdrive.png | 525dd72650d2a1ec341c6efe43e2166f8abaed8d0d6fada886205f89082c63d7 |
| Hyper-Drive Rocket | exec-9c3c401d-730c-4728-97f6-adc794cca9ca | 1374 x 1145 sRGBA PNG | dc01a05438040286dfee3f3c34b0f0c7ae1c9324e7f3ba18214076c4e73d95b6 | public/assets/items/route-night/hyper-drive-rocket.png | 31d36682e867e4ec272161d5b13d1b0a24f81e45e76e18a45f07e54ec8830cbf |
| Prismatic Invincibility | exec-7b4d8c14-8010-4b85-9cd4-8dc255a4149c | 1254 x 1254 sRGBA PNG | 3eb3abb14e7088ff1cf5bb74f0821cef9c94cc9a6eda8ee59d6fa0e801d15b04 | public/assets/items/route-night/prismatic-invincibility.png | 71e0a97bcf326005729d62accbbe63c90236540adcbc56155f32a5dece09c0f2 |

The same deterministic preparation and validation contract as the earlier
batches applies: Lanczos resize to 512 x 512, sRGB PNG32 output, preserved
alpha, and live runtime data remaining outside the image. The final race-HUD
atmosphere asset is documented in the approved Batch 06 section below.

## Batch 06 status — final Slice 6A atmosphere

**APPROVED / PREPARED** — 2026-09-19. This checkpoint completes the
ImageGen-led visual-asset package for Slice 6A with the approved race-HUD
atmosphere overlay. The source render is preserved as the exact approved
ImageGen output record; the repository carries the deterministic runtime
derivative at the contract path.

The overlay is a wide, text-free, alpha-capable atmosphere layer for the live
Route Night race HUD: deep indigo and graphite haze, cyan route-light ribbons,
restrained violet/magenta energy, warm-gold sparks, and broad quiet zones for
the live standings, lap, minimap, item, speed, warning, and touch-control UI.
It contains no map geometry, track layout, character, kart, copy, logo, mark,
or interaction state. It is decorative only and remains below the live DOM/SVG
HUD with `pointer-events: none`.

| Asset | Generator output ID | Source dimensions / format | Source SHA-256 | Runtime path | Runtime derivative | Runtime SHA-256 |
| --- | --- | --- | --- | --- | --- | --- |
| Race-HUD atmosphere overlay | exec-2d3c1e51-3a32-4504-a3d4-d2033f27bc28 | 1536 x 1024 sRGBA PNG | 4dd89adb3095747503089c8b44af1e8494bfe2b63627ba077c727dee2fd87c00 | public/assets/ui/route-night/race-hud-atmosphere.webp | 1536 x 1024 alpha WebP, 385,734 bytes | 1f927a93aa8af5030b12f432bc08db9cf6485c17607adcdbf46fd8eadb37bb74 |

The source and runtime dimensions are identical. ImageMagick converted the
approved PNG to an alpha-capable WebP at quality 82 without crop, repaint, or
resizing; the runtime derivative remains non-opaque with genuine alpha. This
completes the 15-item plus one race-atmosphere Slice 6A asset package. The
Results/Podium backdrop and character victory/reaction poses remain deferred to
Slice 6B.

## Batch 04 status

**APPROVED / PREPARED** — 2026-09-19. This checkpoint adds the fourth
approved ImageGen item batch for Slice 6A.

The batch covers the radial Shockwave pulse, organic Ink Splat, and forward
Nitro Surge charge. Each source is text-free, transparent, and isolated from
characters, vehicles, scenery, and UI while preserving distinct gameplay
readability at small HUD sizes.

| Item | Generator output ID | Source dimensions / format | Source SHA-256 | Runtime path | Runtime SHA-256 |
| --- | --- | --- | --- | --- | --- |
| Acoustic Shockwave Pulse | exec-0b6b2963-593c-4d0b-86fd-69e72e0e412f | 1230 x 1278 sRGBA PNG | 011277c790d7d09233a12e10c1b5b16cde2cf058ffda02068552445d952b2597 | public/assets/items/route-night/shockwave.png | ffef8e12d2938da4a07949136676262d766fa777c94e075d86fa144eaa69e392 |
| Vision-Obscuring Ink Splat | exec-bedf5945-4e82-4dcb-90ad-cfefac1a298d | 1536 x 1024 sRGBA PNG | e2996e60abd1311cb84716978d67ead4af91bd3f1fb47f4946aac20b65a94106 | public/assets/items/route-night/ink-splat.png | 1ae2b74e0966616cdb0ec82b9b565cab2f3bf9639a19cf07122879ecbae04ff9 |
| Nitro Surge | exec-acef5553-bd76-4f78-97ff-4452176f0477 | 1536 x 1024 sRGBA PNG | 4601fc91d188def4aefd6fc9ef34a9875f35705d309ed531796f97141d41da61 | public/assets/items/route-night/nitro-surge.png | 4b5970b6f7184e02190d55ee46418c05e1749ee05c097298220877d42a06ad03 |

The same deterministic preparation and validation contract as the earlier
batches applies: Lanczos resize to 512 x 512, sRGB PNG32 output, preserved
alpha, and live runtime data remaining outside the image.
