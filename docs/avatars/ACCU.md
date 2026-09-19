# Avatar intake: Accu

- **Intake date:** 2026-08-20
- **Current phase:** Runtime integration complete
- **Intake status:** Approved
- **Character lock:** Approved by Manny on 2026-08-20
- **Kart lock:** _Pink Precision_, approved by Manny on 2026-08-20
- **Balance mapping lock:** AA-11 Collision Tank, approved by Manny on 2026-08-20
- **Asset approval:** Portrait and five original driver states approved by Manny on 2026-08-20; front approved on 2026-08-31
- **Kart-model approval:** Pink Precision Candidate 1 approved by Manny on 2026-08-20
- **Implementation verification:** Live accepted on desktop/mobile by Manny on 2026-08-31
- **Front-action rollout:** Four-frame package approved and deployed through PR #73 on 2026-09-03; live playtest pending

Manny created the supplied Accu reference art and approved transforming it into production game assets. The attached pink-hat design is Accu's canonical appearance for this game and supersedes earlier descriptions that conflict with it.

## Identity and visual locks

- **Stable internal ID:** `aa-11`
- **Selection descriptor:** Perfect aim. Maximum armor.
- Long vivid pink hair with pale-pink streaks, pink-magenta eyes, a broad pink brimmed hat with a darker band and side bow, and a pink long-sleeved top covered in darker heart motifs.
- Bright, composed confidence; cute presentation paired with disciplined precision and heavyweight durability.
- Preserve the hat-and-bow silhouette, two-tone pink hair, pink eyes, heart-pattern top, and friendly confident expression at small scale.
- Do not revert to the earlier twin-ponytail, green-eye, pleated-skirt, or tactical-vest description for this game.

## Pink Precision: locked kart

- Compact tank-inspired racing kart with working treads and a working cannon; it is not a literal full-size tank.
- Pink armored bodywork balances cute presentation with heavy, purposeful construction.
- Original emblem: a heart-shaped bullseye with a central four-point sparkle.
- No Hello Kitty imagery, licensed-character branding, copied marks, or reference text.
- The final model must keep its steering controls in front of Accu and must read correctly from chase and rear cameras.

## Gameplay and roster mapping

- **Driving feel:** armored collision specialist with strong speed once moving, maximum weight, limited acceleration, and deliberate handling.
- **Assigned profile:** AA-11 Collision Tank — Speed 8 / Acceleration 4 / Weight 10 / Handling 3 / Mini-Turbo 5 / Traction 6.
- **Rationale:** Weight 10 and Handling 3 make contact and commitment central to the character, while Speed 8 preserves racing threat. Acceleration 4 creates a real recovery cost; Mini-Turbo 5 and Traction 6 keep the kart usable without erasing its heavyweight identity.
- **Approval:** Manny approved AA-11 on 2026-08-20.

## Required assets

| Asset                                           | Required format                                 | Status                |
| ----------------------------------------------- | ----------------------------------------------- | --------------------- |
| Portrait                                        | 256 x 256 transparent PNG, sRGB, straight alpha | Approved and prepared |
| Ten driver states, including four front actions | 512 x 512 transparent PNG, sRGB                 | Approved and prepared |
| Pink Precision                                  | GLB with PRD hierarchy and LOD budgets          | Approved and prepared |

## Approval record

- Character lock, kart lock, balance mapping, emblem direction, and source transformation: approved.
- Portrait, rear, steer-left, steer-right, hit, and victory were approved by Manny on 2026-08-20; the front frame and alpha repairs were approved on 2026-08-31. All are prepared at the PRD runtime paths.
- Pink Precision Candidate 1 is the approved production LOD0. Its deterministic LOD package is prepared at `public/assets/characters/aa-11/{kart,kart-lod1,kart-lod2}.glb`.
- The manifest maps Accu to AA-11, Pink Precision, all ten approved driver frames, and controlled revision `accu-runtime-20260903-3`.
- Pink Precision declares negative-Z authored forward. Manny's live chase-camera test proved that this runtime requires the shared `NEGATIVE_Z_KART_VISUAL_YAW` (`Math.PI`) visual-root correction. Physics, checkpoints, controls, driver sprites, and camera coordinates remain unchanged.
- Manny's 2026-08-31 live test accepted grass relaunch and confirmed the modeled steering wheel is absent in chase view, but rejected the rear-camera floating-head composition and chase-camera straight hair cutoff. PR #54 improved front-frame placement but failed its follow-up visual review. PR #56 corrected the chase sprite's depth and applied a front-frame-only modeled-wheel position. Manny approved the deployed chase and rear-camera results on 2026-08-31.

## Front-action rollout

Manny approved Accu's front-steer-left, front-steer-right, front-hit, and front-victory review set on 2026-09-03. It preserves the broad pink hat and bow, two-tone hair, heart-pattern top, seated orientation, `[0, 0.9, 0.22]` front placement contract, and Pink Precision's modeled-wheel ownership. The art contains no duplicate wheel. The four files are deployed under `accu-runtime-20260903-3` at checkpoint `735da4015bca6f9610f6a358672804f4c73b35f9`; the live bundle revision and all four response hashes are verified. Desktop/mobile camera-action acceptance remains pending.

## Character Select full-body selection art

- Runtime asset: `public/assets/characters/aa-11/selection/full-body.png`.
- Format: 1024 × 1536 transparent sRGBA PNG, normal-Git runtime delivery derivative under ADR-092.
- Approval: Manny approved Accu's selection-only full-body asset in the 2026-09-19 Character Select batch review.
- Boundary: Character Select only; the approved portrait, race driver frames, Pink Precision kart identity/geometry, statistics, and PBR/material implementation remain unchanged.
