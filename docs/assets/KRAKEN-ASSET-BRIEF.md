# Kraken production asset brief

## Package identity

- Character: Kraken
- Runtime ID: `aa-05`
- Balance profile: AA-05 Drift Specialist
- Kart: The Abyssal Drifter
- Package status: original production package live accepted; front-action parity pilot approved and integrated for live verification

## Canonical character lock

Use the approved racing reference as the definitive likeness. Kraken has an angular masculine face, vivid green eyes, short cropped dark hair with closely cut sides, two pointed ears, and a burgundy collared shirt. Do not restore earlier long or tousled hairstyles, ornate coats, blood effects, facial tentacles, or a transformed Cthulhu head.

Driver art and kart art remain separate runtime layers. Driver PNGs must not contain a steering wheel, cockpit wall, kart body, or wheel geometry.

## Runtime PNG contract

| Path                                                      | Size      | Use                                 |
| --------------------------------------------------------- | --------- | ----------------------------------- |
| `public/assets/characters/aa-05/portrait.png`             | 256 x 256 | Character Select portrait           |
| `public/assets/characters/aa-05/driver/front.png`         | 512 x 512 | Camera facing the front of the kart |
| `public/assets/characters/aa-05/driver/rear.png`          | 512 x 512 | Neutral chase-camera state          |
| `public/assets/characters/aa-05/driver/steer-left.png`    | 512 x 512 | Chase-camera left steering          |
| `public/assets/characters/aa-05/driver/steer-right.png`   | 512 x 512 | Chase-camera right steering         |
| `public/assets/characters/aa-05/driver/hit.png`           | 512 x 512 | Chase-camera impact reaction        |
| `public/assets/characters/aa-05/driver/victory.png`       | 512 x 512 | Chase-camera victory turn           |
| `public/assets/characters/aa-05/driver/front-steer-left.png`  | 512 x 512 | Front-facing left steering       |
| `public/assets/characters/aa-05/driver/front-steer-right.png` | 512 x 512 | Front-facing right steering      |
| `public/assets/characters/aa-05/driver/front-hit.png`         | 512 x 512 | Front-facing impact reaction     |
| `public/assets/characters/aa-05/driver/front-victory.png` | 512 x 512 | Front-facing victory presentation   |

Every file must remain sRGB RGBA with non-opaque alpha and transparent corner pixels. Runtime art belongs in normal Git under ADR-012. High-resolution masters do not belong at these paths.

## Driver-state behavior

- Rear is the visible fallback if another frame fails.
- Steer-left and steer-right preserve the same hip anchor, scale, and seated footprint as rear.
- Hit takes precedence over steering and shows Kraken recoiling while his hips remain forward.
- Chase victory keeps his hips and legs facing the kart while his torso turns back toward the viewer. It must not read as a full-body 180-degree about-face.
- Front and front-victory are separate approved views. Neither may be inferred by mirroring a rear frame.

## Front-facing action parity pilot

- The approved neutral front and front-victory frames remain unchanged.
- Front-steer-left, front-steer-right, and front-hit candidates were prepared with genuine alpha and the 512 x 512 runtime dimensions, then approved by Manny on 2026-09-01.
- The steering candidates preserve kart-input direction: left leans toward Kraken's own left, and right leans toward his own right. The hit candidate preserves the approved seated footprint while translating the chase recoil and blue electrical reaction into the front view.
- The three approved frames are integrated under controlled revision `kraken-runtime-20260901-2`. The existing neutral front, front-victory, and all chase-oriented art remain unchanged.

## Definitive kart direction

The supplied kart reference is definitive. Preserve:

- orange eyes and toothed front maw
- indigo and purple living shell
- cyan bioluminescent markings
- copper trim
- tentacle bodywork
- turbine-like wheel language
- a clear cockpit that does not clip through Kraken

The production model must declare `extras.forward: "-Z"` and use the shared `NEGATIVE_Z_KART_VISUAL_YAW` runtime transform. The maw and eyes are the front. Exhaust and rear propulsion details belong behind the driver. Chase- and front-facing camera checks are mandatory before the kart is accepted.

## Current verification

- Portrait: 256 x 256, sRGB RGBA, transparent
- Ten driver frames: 512 x 512, sRGB RGBA, transparent
- Approved art contains no steering wheel or kart geometry
- Manny approved LOD0 Candidate 3 on 2026-08-21 after reviewing the GLB directly in the interactive 3D viewer.
- The approved steering assembly keeps the rim clear of the shell, mounts its column on the nose-facing side, and connects through an indigo-purple dashboard housing.
- Runtime paths: `public/assets/characters/aa-05/{kart,kart-lod1,kart-lod2}.glb`.
- Triangle counts: LOD0 18,724; LOD1 9,588; LOD2 4,376.
- All three files use four opaque materials, the exact thirteen-node hierarchy, meters, and `extras.forward: "-Z"`.
- SHA-256/LFS object IDs: LOD0 `4a28349e51b0f6936a67bc8160d1b627fb9f77144ab063368e863d644e64a5c9`; LOD1 `c000af29a53fa79810d759b460f7a6a3b72c2f1605b9ff300245c080a95a8bfe`; LOD2 `ca73a74e96ff58769abc83db3b8662b498445144f28497b58213d71022e13546`.
- Live acceptance: Manny confirmed selection portrait and stats, production kart loading, race-forward maw/eyes, rear/front/steering/hit/victory frames, and unique AI-opponent appearance on 2026-08-21.
- Front-action live acceptance: Manny confirmed the deployed steering, hit, victory, chase-state restoration, transparency, cockpit placement, and steering-wheel presentation on 2026-09-01.

## Integration gate

Complete. The original production package and the four-state front-action pilot are live accepted under `kraken-runtime-20260901-2`. The next active driver's separately approved package may begin.

## Character Select full-body selection art

- Runtime asset: `public/assets/characters/aa-05/selection/full-body.png`.
- Format: 1024 × 1536 transparent sRGBA PNG, governed by Git LFS.
- Approval: Manny approved Kraken's selection-only full-body asset in the 2026-09-19 Character Select batch review.
- Boundary: Selection-only art; the approved human Cthulhu identity, portrait, race driver frames, The Abyssal Drifter kart package, statistics, and PBR/material implementation remain unchanged.
