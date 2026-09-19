# Accu asset brief

## Authority and source

- Accu, Pink Precision, and AA-11 Collision Tank were approved by Manny on 2026-08-20.
- Manny created the supplied references and approved transforming them into production game assets.
- The pink-hat portrait is the canonical game appearance. The tank collage supplies the compact pink armored-kart concept, not licensed branding.
- Keep original source files unchanged; approved runtime derivatives have separate repository paths.

## Production style

- Polished, colorful, high-contrast Manaconda's Minigame Mayhem arcade presentation.
- Anime-inspired 2D driver art paired with a stylized 3D kart.
- Original visual language with no Hello Kitty imagery, copied marks, or licensed-character branding.

## Locked character identity

- Long vivid pink hair with pale-pink streaks; pink-magenta eyes.
- Broad pink brimmed hat with darker band and side bow.
- Pink long-sleeved top patterned with darker hearts.
- Friendly, composed, precise confidence.
- Small-scale read: hat and bow, two-tone hair, pink eyes, heart-pattern top.

## Pink Precision

- Compact tank-inspired kart with working treads and cannon, scaled and shaped for racing rather than presented as a full-size tank.
- Pink armored construction with a cute-versus-heavy visual contrast.
- Original heart-shaped bullseye emblem with a central four-point sparkle.
- Steering controls must sit in front of Accu. Cannon, tread housings, cockpit, and driver mount must not clip.
- Prohibited: Hello Kitty imagery, licensed mascots, copied labels, full-size military proportions, conventional exposed tires, or a nonfunctional decorative tread treatment.

## Required production deliverables

| Asset                                           | Format                                          | Approval                         |
| ----------------------------------------------- | ----------------------------------------------- | -------------------------------- |
| Portrait                                        | 256 x 256 transparent PNG, sRGB, straight alpha | Approved and prepared 2026-08-20 |
| Rear / steer-left / steer-right / hit / victory | 512 x 512 transparent PNG, sRGB                 | Approved and prepared 2026-08-20 |
| Front                                           | 512 x 512 transparent PNG, sRGB                 | Approved and prepared 2026-08-31 |
| Pink Precision                                  | GLB with PRD hierarchy and LOD budgets          | Approved and prepared 2026-08-20 |

## Approved Pink Precision model checkpoint

- Candidate 1 is the approved production silhouette: low armored hull, continuous tread loops, compact cockpit, forward cannon, rear antennae and exhausts, and the original heart-bullseye nose emblem.
- The approved LOD0 geometry is frozen byte-for-byte in the deterministic builder. LOD1 and LOD2 reduce curved segments, tread pads, and internal road wheels without changing the locked silhouette or mount layout.
- All three GLBs use negative Z as forward, four opaque materials, and the required 13-node kart hierarchy.
- LOD0: 4,156 triangles, SHA-256 `6e3f8cb6d1bdee7f5b315a7c154bd45fd0f4d6ac9b2e6445b9d85d81959ff958`.
- LOD1: 2,700 triangles, SHA-256 `9f481cf854d47ec330e5909d5003353376c471cd37562d79410c20e3f824f9c7`.
- LOD2: 1,804 triangles, SHA-256 `792b8f8bf1d359b3ae464003f0fa9432de5c391d8bd18ac8f84535593d9ba820`.
- The SHA-256 values are also the Git LFS object IDs and must match during publication and fetch-back verification.

## Approved driver-art checkpoint

- Runtime paths: `public/assets/characters/aa-11/portrait.png` and the ten files under `public/assets/characters/aa-11/driver/`.
- Portrait is 256 x 256; each driver state is 512 x 512.
- All seven files are sRGB RGBA PNGs with genuine transparency, alpha spanning 0 to 1, and transparent corner pixels.
- Victory keeps Accu's seated driving orientation while she turns naturally over her shoulder toward the viewer; it does not use a full-body about-face.
- The driver art contains steering wheels where required by the approved compositions. Runtime integration must verify that these do not conflict visually with the future 3D steering control.
- Manny approved the front seated pose and deterministic alpha repair on 2026-08-31. The front derivative SHA-256 is `d62ba47bb7d1da6a6f504a7e4f422caf8b6725d7ce54de226b8ce8cfc2ba6e15`.
- Neutral checker remnants were removed only from the steering-wheel apertures in steer-left, steer-right, and victory. The character pixels and compositions were not redrawn.

## Runtime delivery requirements

- Manifest URLs use a controlled base-aware revision whenever stable runtime bytes change.
- Pages materializes LFS, passes `git lfs fsck`, and rejects an LFS pointer or invalid glTF binary signature before deployment.
- Runtime preloads all six driver states and retains rear as the safe fallback.
- Chase and rear cameras must confirm Pink Precision's nose, cannon, controls, and treads face the correct direction. Any axis correction applies only to the visual root and is recorded.
- Acceptance requires desktop and mobile confirmation of Accu's portrait, production kart, all six driver states, orientation, cockpit depth, and clean raster-edge occlusion.

## Runtime integration checkpoint

- Controlled asset revision: `accu-runtime-20260903-3`.
- The character manifest selects Accu's approved portrait, Pink Precision LOD0, and all ten driver frames for AA-11. Chase-oriented states use `[0, 0.82, -0.72]` so the flat sprite sits ahead of the collar that created PR #54's horizontal occlusion seam while remaining behind the kart's rear chassis. Camera-facing states use `[0, 0.9, 0.22]`; the modeled wheel receives a front-frame-only local position of `[0, 1.46, -0.46]` and returns to its authored transform for every chase-facing frame.
- Pink Precision declares negative-Z authored forward and therefore uses the runtime's enforced `NEGATIVE_Z_KART_VISUAL_YAW` (`Math.PI`). The transform affects only the model root; physics, checkpoints, controls, driver sprites, and cameras remain unchanged.
- The production signature gate includes all three Pink Precision GLBs. A pointer or invalid GLB at any required path fails the build.
- The grass relaunch and chase-view steering-wheel suppression passed Manny's 2026-08-31 playtest. PR #54's camera-specific vertical placement deployed at merge `87ddf85b1302cc61f62e486c893136be04b84835` but failed visual review: the chase seam remained horizontal and the rear-camera wheel was not readable. PR #56's depth/wheel correction deployed at merge `404c32b05a78a05080c4150dbe4acd3ca7125cbb`; Manny approved the corrected chase hair edge, rear-camera seated composition, and visible wheel between Accu's hands on 2026-08-31. Accu's runtime asset checkpoint is complete.

## Front-action live acceptance

Manny approved the front-steer-left, front-steer-right, front-hit, and front-victory review set on 2026-09-03. It preserves Accu's broad pink hat and bow, two-tone pink hair, heart-pattern top, seated orientation, transparent internal gaps, and `[0, 0.9, 0.22]` front placement contract. Pink Precision owns the modeled front wheel, and the sprites contain no duplicate. The four files were deployed under `accu-runtime-20260903-3` through PR #73 and main run `33708310011`. Their SHA-256 values are `374dc4d70effbfb31b149d8479c206ca147ea3247d2479a519ccca4a04aba91a`, `c14a5e45c2d89858c2b1b0ef925f738a46bf7198fb21dad7023baaf6640b682c`, `21d05413adcbd711f1f47b43a685b1cf7b528cbf8603680805f3936fa2920c37`, and `f35804907230bb1db0623c84622a34ac5be8a30fb8183186c14f3ab38e8524eb` in that order, and all four deployed responses match. Manny accepted Accu's live steering, hit, victory, chase restoration, transparency, cockpit placement, and single-wheel presentation on 2026-09-03.

## Character Select full-body selection art

- Runtime asset: `public/assets/characters/aa-11/selection/full-body.png`.
- Format: 1024 × 1536 transparent sRGBA PNG, governed by Git LFS.
- Approval: Manny approved Accu's selection-only full-body asset in the 2026-09-19 Character Select batch review.
- Boundary: Selection-only art; the portrait, race driver frames, Pink Precision kart package, statistics, and PBR/material implementation remain unchanged.
