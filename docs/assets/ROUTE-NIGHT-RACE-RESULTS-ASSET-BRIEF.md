# Route Night Race Results Asset Brief

## Scope

This brief governs the character-specific Results/Podium illustration package
for Slice 6. The first approved batch adds three top-three victory poses. The
remaining nine victory poses, twelve lower-finish reaction poses, and the
Results/Podium backdrop remain separately gated by visual approval.

The approved pose direction is character-driven rather than rank-generic:
each racer receives a distinct silhouette, body angle, gesture, and emotional
read grounded in their locked identity. Existing race driver victory frames
remain race-facing fallbacks; these larger results assets are separate.

## Runtime contract

| Item | Contract |
| --- | --- |
| Runtime paths | `public/assets/characters/aa-##/results/victory.png` |
| Dimensions | 1024 × 1536 |
| Format | PNG, sRGBA, genuine transparency |
| Delivery class | Fixed-size normal-Git runtime derivative |
| Identity source | Approved Character Select `selection/full-body.png` for the same AA profile |
| Visual language | Route Night: indigo shadows, cyan rim, restrained violet/magenta edge light, warm gold highlight |
| Isolation | Character cutout only; no text, UI, kart, podium, scenery, or extra character |

## Approved Batch 01 — victory poses

Manny approved this batch on 2026-09-19 after direct visual review. The
generated outputs use the approved Character Select full-body assets as actual
image-generation references. ImageGen returned flat chroma-green plates;
deterministic edge-connected chroma removal produced the transparent runtime
derivatives. The final files were encoded as alpha-preserving 256-color sRGBA
PNGs after visual comparison, retaining the 1024 × 1536 dimensions and clean
silhouettes while keeping the runtime delivery compact. They were validated as
decodable RGBA PNGs with no residual key-green pixels.

| Racer | Pose direction | Identity source | Runtime asset | Generator output | Source SHA-256 | Runtime SHA-256 |
| --- | --- | --- | --- | --- | --- | --- |
| Alex / AA-01 | Low asymmetrical finish slide; headset check; knowing half-smile | `public/assets/characters/aa-01/selection/full-body.png` | `public/assets/characters/aa-01/results/victory.png` | `exec-79e9a98c-0c52-4ed0-8a24-9b53528fb796.png` | `1d26bfcb4d46efa352177f9866d3cc0e5c84cbfcb315055869eb71d9af6fdd26` | `9b8751e027a5e62883ec5b1aab280a7dae1bef6d9dfd6e015b034914a1686aaa` |
| Lavi / AA-02 | Buoyant one-boot recovery step; glasses touch; joyful confidence | `public/assets/characters/aa-02/selection/full-body.png` | `public/assets/characters/aa-02/results/victory.png` | `exec-f4fb36db-8ae9-4c32-8738-1dce63a42fa2.png` | `56070831c72a831d44818e462afc86b67a44b658b11166d7c330c4f7d56248e6` | `704148c27f72300d3f6ff9937b155e71bbeca63a38bb2c0ec9768efa5b5a1af3` |
| Lula / AA-03 | Grounded guardian's oath; hand over heart; protective open palm | `public/assets/characters/aa-03/selection/full-body.png` | `public/assets/characters/aa-03/results/victory.png` | `exec-9134d452-9a81-4d9c-bfdb-027cc9ff05a2.png` | `289a4ae9e3b5d7fa5a07a9e5b761d6b5bfb5434c2b5a4ca15080724761b6f691` | `5a548d229cea14cd824c13014f51cfbef3e9329a77f26573a0aadcd0c28140d2` |

## Approval and boundary

- Approved batch: Alex, Lavi, and Lula victory poses only.
- No reaction asset is approved by this batch.
- No Results/Podium runtime wiring is included by this asset checkpoint.
- Do not reuse a batch's pose grammar for another racer; every subsequent
  prompt must reference the remaining character's approved visual authority and
  its unique pose brief.
