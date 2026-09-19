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
