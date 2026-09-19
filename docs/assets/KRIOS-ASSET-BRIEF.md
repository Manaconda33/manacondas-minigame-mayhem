# Krios production asset brief

## Package identity

- Character: Krios
- Runtime ID: `aa-10`
- Balance profile: AA-10 Straight-Line Heavy
- Kart: The Hornbreaker
- Package status: **approved, merged to `main`, deployed, and live accepted**
- Front-action parity: **approved, deployed, and live accepted**

## Canonical character lock

Use the approved portrait as Krios's definitive game likeness. Preserve saturated red skin, immense muscular scale, two black ridged ram horns growing from the temples, swept-back black hair, pointed ears with metal rings, glowing gold eyes, the huge wild black beard with metal-bound braids, rugged dark leather harness, heavy studded bracers, and red flame emblems. His neutral expression is severe, proud, and controlled.

Driver art and kart art remain separate runtime layers. Driver PNGs must not contain a steering wheel, cockpit wall, kart body, tires, exhaust, or other vehicle geometry.

## Runtime PNG contract

| Path                                                          | Size      | Use                                 |
| ------------------------------------------------------------- | --------- | ----------------------------------- |
| `public/assets/characters/aa-10/portrait.png`                 | 256 x 256 | Character Select portrait           |
| `public/assets/characters/aa-10/driver/front.png`             | 512 x 512 | Camera facing the front of the kart |
| `public/assets/characters/aa-10/driver/rear.png`              | 512 x 512 | Neutral chase-camera state          |
| `public/assets/characters/aa-10/driver/steer-left.png`        | 512 x 512 | Chase-camera left steering          |
| `public/assets/characters/aa-10/driver/steer-right.png`       | 512 x 512 | Chase-camera right steering         |
| `public/assets/characters/aa-10/driver/hit.png`               | 512 x 512 | Chase-camera impact reaction        |
| `public/assets/characters/aa-10/driver/victory.png`           | 512 x 512 | Chase-camera victory turn           |
| `public/assets/characters/aa-10/driver/front-steer-left.png`  | 512 x 512 | Front-facing left steering          |
| `public/assets/characters/aa-10/driver/front-steer-right.png` | 512 x 512 | Front-facing right steering         |
| `public/assets/characters/aa-10/driver/front-hit.png`         | 512 x 512 | Front-facing impact reaction        |
| `public/assets/characters/aa-10/driver/front-victory.png`     | 512 x 512 | Front-facing victory pose           |

Every file must remain sRGB RGBA with non-opaque alpha and transparent corner pixels. Runtime art belongs in normal Git under ADR-012. High-resolution masters do not belong at these paths.

## Driver-state behavior

- Rear is the visible fallback if another frame fails.
- Front is a separately approved view and must not be inferred by mirroring a rear frame.
- Rear, steer-left, steer-right, and hit preserve the same broad seated footprint so Krios does not jump or resize between states.
- Steering states keep both hands in a believable driving position without including the wheel.
- Hit takes precedence over steering and shows a forceful recoil without making Krios look timid or comedic.
- Victory keeps the lower body seated toward the kart while Krios turns toward the chase camera in a dominant celebration.
- Horns must remain fully readable and must never become ordinary demon spikes, antlers, or additional horn pairs.
- Camera-facing steering, hit, and victory preserve the simulated action without including a wheel. The transparent openings inside both horn loops must remain genuine alpha rather than baked pale or checkerboard pixels.

## Definitive kart direction

The supplied Krios racing sheet is definitive. Preserve:

- brutal infernal battle-kart / hot-rod construction
- low, broad, aggressive silhouette
- weathered dark steel with red flame graphics
- integrated ram horns at the nose
- open cockpit sized for Krios's heavy build
- oversized rugged studded tires
- twin rear exhausts with visible flame
- dominant straight-line presence rather than a tall armored vehicle

## Runtime GLB contract

| Path                                           | LOD  | Triangles | Materials | Nodes | SHA-256 / LFS OID                                                  |
| ---------------------------------------------- | ---- | --------: | --------: | ----: | ------------------------------------------------------------------ |
| `public/assets/characters/aa-10/kart.glb`      | LOD0 |    14,568 |         4 |    13 | `906cdddd34e8b4270e9c99d334639f2bf7a372cceb22abbb1edaaf15ad8c38a9` |
| `public/assets/characters/aa-10/kart-lod1.glb` | LOD1 |     7,746 |         4 |    13 | `986f6c355401d45ae7ff85f13391de48f3db6d2b5b2b47ed10f5ced7708061f0` |
| `public/assets/characters/aa-10/kart-lod2.glb` | LOD2 |     4,050 |         4 |    13 | `62a3993c11b4c38eebe0d73f7a9b713fcdb1467578ea5429b188ea40e164fa76` |

All three files are deterministic outputs of `tools/assets/build_krios_hornbreaker.py`. Each GLB uses meters, declares `extras.forward: "-Z"`, and contains the required kart root, chassis, accent, steering, four wheel, two exhaust, driver mount, and two item mount nodes. Candidate 7—including the integrated, sealed horn-housing yoke—is the approved visual lock.

## Verification evidence

- Portrait: 256 x 256, sRGB RGBA, transparent
- Front driver frame: 512 x 512, sRGB RGBA, transparent
- Rear driver frame: 512 x 512, sRGB RGBA, transparent
- Steer-left frame: 512 x 512, sRGB RGBA, transparent
- Steer-right frame: 512 x 512, sRGB RGBA, transparent
- Hit frame: 512 x 512, sRGB RGBA, transparent
- Victory frame: 512 x 512, sRGB RGBA, transparent
- All approved files have alpha spanning fully transparent to fully opaque and a fully transparent corner pixel
- All six approved driver frames contain no steering wheel or kart geometry
- Runtime PNGs resolve to normal Git rather than Git LFS
- Manny approved portrait, front, rear, steer-left, steer-right, hit, and victory art on 2026-08-22
- Manny approved Hornbreaker Candidate 7 on 2026-08-22
- Clean repeat builds matched all three approved hashes byte-for-byte
- GLB structure, triangle limits, material limit, required node set, meters, and `-Z` orientation metadata passed local validation
- LFS objects were uploaded and fetch-back verified by the temporary branch-scoped publication bridge, which was removed before review
- Inactive-package CI run `32590997172` (#80) proved all three GLBs materialize and pass `git lfs fsck`, typecheck, lint, tests, and production build
- AA-10 was activated only after run #80 passed
- Active-package CI run `32591092941` (#82) passed LFS verification, the explicit Krios manifest contract, the full suite, and production build
- PR #30 merged Krios to `main`; merge commit `ddbb2dea9e7f5e558cb8d5e76501b99219416f65` passed CI run `32591411527`
- Manny confirmed on 2026-08-26 that Krios is present in the live game and all assets load as intended
- Manny approved the four camera-facing action frames on 2026-09-01 after the enclosed pale matte inside the horn loops was cleared to transparency.
- Controlled front-action revision: `krios-runtime-20260901-2`.

## Active runtime gate

Krios is an active production package. `tools/verify-runtime-assets.mjs` must include all three AA-10 Hornbreaker GLBs. The build must fail if any of those paths contains an LFS pointer instead of a materialized GLB, lacks a valid glTF JSON chunk, or does not declare `extras.forward: "-Z"`.

This requirement was added during the 2026-08-26 continuity cleanup after a usage-limit interruption left the runtime signature list stale even though the live Krios integration itself had succeeded.

## Integration gate

**Complete.** Krios is active in the production manifest, The Hornbreaker and all approved driver states load in the deployed game, repository CI has passed, and Manny has live-accepted the production package. No further Krios integration work is pending.

Front-action PR #62 merged at `7b58fdff7ca3c0d67a4ca70c1df0f6ddf287889f`; main run `33507775105` passed validation and Pages deployment. All four deployed response hashes match the approved files, including the corrected transparent horn apertures.

Manny accepted the live front-action package on 2026-09-01 against deployed checkpoint `2ca852b47f16b8221275ee2b5542650d609b9a0d`. Camera-facing steering in both directions, hit, victory, chase-state restoration, cockpit placement, and modeled-wheel ownership pass. No duplicate wheel appears, and no pale matte remains between Krios's horns.

## Character Select full-body selection art

- Runtime asset: `public/assets/characters/aa-10/selection/full-body.png`.
- Format: 1024 × 1536 transparent sRGBA PNG, governed by Git LFS.
- Approval: Manny approved Krios's selection-only full-body asset in the 2026-09-19 Character Select batch review.
- Boundary: Selection-only art; the portrait, race driver frames, The Hornbreaker kart package, statistics, and PBR/material implementation remain unchanged.
