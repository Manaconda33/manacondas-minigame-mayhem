# Route Night Race Results Asset Brief

## Scope

This brief governs the character-specific Results/Podium illustration package
for Slice 6. Four approved victory batches add twelve top-three poses.
Lower-finish reaction poses are approved and published in character batches;
Batches 01–04 cover AA-01–12. The Results/Podium backdrop remains separately
gated by visual approval.

The approved pose direction is character-driven rather than rank-generic:
each racer receives a distinct silhouette, body angle, gesture, and emotional
read grounded in their locked identity. Existing race driver victory frames
remain race-facing fallbacks; these larger results assets are separate.

## Runtime contract

| Item            | Contract                                                                                         |
| --------------- | ------------------------------------------------------------------------------------------------ |
| Runtime paths   | `public/assets/characters/aa-##/results/{victory,reaction}.png`                                  |
| Dimensions      | 1024 × 1536                                                                                      |
| Format          | PNG, sRGBA, genuine transparency                                                                 |
| Delivery class  | Fixed-size normal-Git runtime derivative                                                         |
| Identity source | Approved Character Select `selection/full-body.png` for the same AA profile                      |
| Visual language | Route Night: indigo shadows, cyan rim, restrained violet/magenta edge light, warm gold highlight |
| Isolation       | Character cutout only; no text, UI, kart, podium, scenery, or extra character                    |

## Approved Batch 01 — victory poses

Manny approved this batch on 2026-09-19 after direct visual review. The
generated outputs use the approved Character Select full-body assets as actual
image-generation references. ImageGen returned flat chroma-green plates;
deterministic edge-connected chroma removal produced the transparent runtime
derivatives. The final files were encoded as alpha-preserving 256-color sRGBA
PNGs after visual comparison, retaining the 1024 × 1536 dimensions and clean
silhouettes while keeping the runtime delivery compact. They were validated as
decodable transparent PNGs with no residual key-green pixels.

| Racer        | Pose direction                                                   | Identity source                                          | Runtime asset                                        | Generator output                                | Source SHA-256                                                     | Runtime SHA-256                                                    |
| ------------ | ---------------------------------------------------------------- | -------------------------------------------------------- | ---------------------------------------------------- | ----------------------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------ |
| Alex / AA-01 | Low asymmetrical finish slide; headset check; knowing half-smile | `public/assets/characters/aa-01/selection/full-body.png` | `public/assets/characters/aa-01/results/victory.png` | `exec-79e9a98c-0c52-4ed0-8a24-9b53528fb796.png` | `1d26bfcb4d46efa352177f9866d3cc0e5c84cbfcb315055869eb71d9af6fdd26` | `9b8751e027a5e62883ec5b1aab280a7dae1bef6d9dfd6e015b034914a1686aaa` |
| Lavi / AA-02 | Buoyant one-boot recovery step; glasses touch; joyful confidence | `public/assets/characters/aa-02/selection/full-body.png` | `public/assets/characters/aa-02/results/victory.png` | `exec-f4fb36db-8ae9-4c32-8738-1dce63a42fa2.png` | `56070831c72a831d44818e462afc86b67a44b658b11166d7c330c4f7d56248e6` | `704148c27f72300d3f6ff9937b155e71bbeca63a38bb2c0ec9768efa5b5a1af3` |
| Lula / AA-03 | Grounded guardian's oath; hand over heart; protective open palm  | `public/assets/characters/aa-03/selection/full-body.png` | `public/assets/characters/aa-03/results/victory.png` | `exec-9134d452-9a81-4d9c-bfdb-027cc9ff05a2.png` | `289a4ae9e3b5d7fa5a07a9e5b761d6b5bfb5434c2b5a4ca15080724761b6f691` | `5a548d229cea14cd824c13014f51cfbef3e9329a77f26573a0aadcd0c28140d2` |

## Approved Batch 02 — victory poses

Manny approved this batch on 2026-09-19 after direct visual review. The
generated outputs again use the approved Character Select full-body assets as
actual image-generation references. Each pose has a separate silhouette,
gesture, body angle, and emotional read rather than repeating a generic
celebration template. The cleaned outputs were validated as decodable
transparent PNGs with no residual key-green pixels and then compacted as
alpha-preserving palette runtime derivatives.

| Racer                | Pose direction                                                                             | Identity source                                          | Runtime asset                                        | Generator output                                | Source SHA-256                                                     | Runtime SHA-256                                                    |
| -------------------- | ------------------------------------------------------------------------------------------ | -------------------------------------------------------- | ---------------------------------------------------- | ----------------------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------ |
| Keeg / AA-04         | Theatrical hat-tip; asymmetrical robe sweep; violet magic flourish; sly smile              | `public/assets/characters/aa-04/selection/full-body.png` | `public/assets/characters/aa-04/results/victory.png` | `exec-4b9390bf-3938-49a9-9b25-9304df3d65f5.png` | `2ec945eaa0eb4acc525274ec4a615279b9c0beef7755ed8a4c91ac2a38cb91ab` | `4e4ffce804a8ff94d15eca9a04211c309ea3ec24c995c40761f39811754ddf06` |
| Kraken / AA-05       | Controlled three-quarter lean; one hand in pocket; chin touch; calculating half-smile      | `public/assets/characters/aa-05/selection/full-body.png` | `public/assets/characters/aa-05/results/victory.png` | `exec-6aa52ad7-c8fe-4eea-b380-897efbcc7c38.png` | `ba713e559fc1996c7f6729e3ec288a8c26b105898f23406d637fc8130a08e67e` | `d71c483a32290bbb68f5eb8f13d4bf8cf487b8f0af1cbbcf43e1b5eb2fb9578b` |
| Dragon Queen / AA-06 | Fully draconic sovereign wing display; raised foreclaw salute; elevated head; visible tail | `public/assets/characters/aa-06/selection/full-body.png` | `public/assets/characters/aa-06/results/victory.png` | `exec-962a1898-4969-41e1-b039-713afb700f28.png` | `60ae8a3b28c429837b739a27378b9f620860d9aaf118d816f1ca962dd265cccf` | `c2fda346f374a34b5aa190c8c4549422863688db3da49b4e5948394a411f710d` |

## Approved Batch 03 — victory poses

Manny approved this batch on 2026-09-23 after direct visual review. The
generated 1024 × 1536 renders used each character's approved Character Select
full-body asset as its identity reference. Each runtime derivative retains the
original dimensions and has genuine RGBA transparency.

| Racer              | Pose direction                                      | Identity source                                          | Runtime asset                                        | Generator output                                | Source SHA-256                                                     | Runtime SHA-256                                                    |
| ------------------ | --------------------------------------------------- | -------------------------------------------------------- | ---------------------------------------------------- | ----------------------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------ |
| McFleurdel / AA-07 | Elegant finishing pivot; controlled gothic flourish | `public/assets/characters/aa-07/selection/full-body.png` | `public/assets/characters/aa-07/results/victory.png` | `exec-b4bdd17a-288d-4315-8935-fc9b8d4b4329.png` | `98656cea9090be9bd993c0549eaee076651a0fe5e5fc52bd142846214389e6d0` | `21cbd6c61c2510baa22e351fce1564887331b511c0230345e79d7a3f42f91c02` |
| Toph / AA-08       | Low athletic skid-stop; calm, confident finish      | `public/assets/characters/aa-08/selection/full-body.png` | `public/assets/characters/aa-08/results/victory.png` | `exec-07faa274-8ac5-4389-84a0-6f7735f56c07.png` | `893f997ae3263915ef27ab507726e043dccb03a16cf16fc4939964eddc52e42a` | `1ab53ed1c8d21314d14a99f9c80f65f4d3242cd929f30d1bf072c00ad86419cf` |
| Manaconda / AA-09  | Quiet compass salute with Paprika at his shoulder   | `public/assets/characters/aa-09/selection/full-body.png` | `public/assets/characters/aa-09/results/victory.png` | `exec-f5f2aa6a-09de-41c6-a9e2-abf29b71c4e4.png` | `2e4f760bbc380067dc180fc25b34754b57da3d42de2d1c38f740deeb8d0549b9` | `19adc4de4c6a60d8ceb44ff73579b39812833965d42225305f0badd1be923a9b` |

## Approved Batch 04 — victory poses

Manny approved the Krios / AA-10, Accu / AA-11, and Jennifer / AA-12 source
renders for Results/Podium use. The approved poses were integrated without
redesign or regeneration. Each opaque runtime pixel retains the approved
source RGB; fully transparent pixels are zeroed. The original 1024 × 1536
dimensions are retained.

| Racer            | Pose direction                         | Approved source file                        | Source Library ID                          | Generator output ID                  | Runtime asset                                        | Source SHA-256                                                     | Runtime SHA-256                                                    |
| ---------------- | -------------------------------------- | ------------------------------------------- | ------------------------------------------ | ------------------------------------ | ---------------------------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------ |
| Krios / AA-10    | Arms-flexing triumphant roar           | `Krios's Triumphant Victory Roar.png`       | `libfile_3200c4dcd9fc8191a5f888298a5a912e` | Not surfaced in the recovered record | `public/assets/characters/aa-10/results/victory.png` | `1b5793085436c015862606c27f930438683a3c29243fdc1220e780a0614999a4` | `ceb43f0c7b12a7ad16556dfec460ffc29cfc4372561ce1fa9580a8399aa76c98` |
| Accu / AA-11     | Joyful airborne victory spin           | `AA-11’s Joyful Victory Spin.png`           | `libfile_c0b8b4a2ba6c8191804a0b0f67651600` | Not surfaced in the recovered record | `public/assets/characters/aa-11/results/victory.png` | `5c8cf1a9d0ce1e28bfabef8a2f05cc05961ecc065ecd1b26ace2ebabba292257` | `59dd6987fef114989b7afba9cf13fec40b9896801619285165b646124e88b47b` |
| Jennifer / AA-12 | Welcoming staff-and-open-hand flourish | `Jennifer’s Welcoming Victory Flourish.png` | `libfile_26b55289c24081918503c5aa79f0d3eb` | Not surfaced in the recovered record | `public/assets/characters/aa-12/results/victory.png` | `d2cd74f5cc1235c9a73016faf420066f551cc7b8ddf94150f8261c9368533f37` | `218ef5b7d5650046d04f5cc9adaeb014b9d7829d4b711079ed50c810173ca107` |

The approved source files are RGB PNGs with a baked checkerboard. For a
reproducible matte, the grayscale background modes are 214/253 for Krios,
138/200 for Accu, and 130/192 for Jennifer. The core candidate uses maximum
channel spread ≤ 30 and distance ≤ 30 from either mode. An 8-connected flood
from all image borders selects the exterior; two further 8-connected passes
expand into pixels with channel spread ≤ 42 and mode distance ≤ 44. Accu and
Jennifer also clear enclosed core-candidate components of at least 20 pixels
to remove checkerboard visible through hair and costume gaps; Krios does not
use that enclosed-component pass to protect neutral metal details. The matte
pass replaces selected pixels with exact `#00FF00`; the second pass keys only
that exact green to alpha. None of the three sources contains an exact
`#00FF00` pixel. Visual checks covered full resolution and 256 × 384 previews
over magenta and yellow backgrounds. `tools/assets/prepare_results_victory_cutouts.py`
records these source hashes and matte parameters, writes the green-pass guides,
and checks the regenerated runtime hashes. Run it with the recovered sources:

```bash
python tools/assets/prepare_results_victory_cutouts.py \
  --source-dir /path/to/approved-victory-sources \
  --output-dir public \
  --matte-dir /path/to/green-pass-guides
```

## Approval and boundary

- Approved batches: Alex, Lavi, Lula, Keeg, Kraken, Dragon Queen, McFleurdel, Toph, Manaconda, Krios, Accu, and Jennifer victory poses.
- Approved reaction batch 01: Alex, Lavi, and Lula.
- Victory art remains podium-only for places 1–3; places 4–8 keep the existing selection-art, portrait, and monogram fallback chain.
- Reaction files are approved assets only; runtime selection remains a separate integration checkpoint.
- The remaining nine reaction poses, Results backdrop, and race/gameplay behavior are outside this batch.
- Do not reuse a batch's pose grammar for another racer; every subsequent
  prompt must reference the remaining character's approved visual authority and
  its unique pose brief.

## Partial runtime use — 2026-09-23

A later, separately approved feature-branch runtime checkpoint first used six
approved victory assets only for mapped top-three characters. A 2026-09-23
follow-on extends the allowlist to McFleurdel, Toph, and Manaconda. The runtime URLs
are base-aware and use each derivative's recorded SHA-256 as its cache revision.
Places four through eight use approved Character Select full-body art until
their reaction package is approved; missing victory/full-body art falls back to
portrait and then monogram. No source or runtime image bytes changed for this
integration. Nine victory poses were in runtime use at this checkpoint; the
following checkpoint completed the allowlist.

## Complete victory-art runtime mapping — 2026-09-24

The approved Krios / AA-10, Accu / AA-11, and Jennifer / AA-12 derivatives
complete the twelve-character top-three victory allowlist. All twelve
approved victory poses are now available to the existing place 1–3 Results
mapping. Places 4–8 retain the existing approved selection-art, portrait, and
monogram fallback. The lower-finish reaction assets are recorded separately
below and are not yet selected by the Results runtime.

## Approved Reaction Batch 01 — lower-finish poses

Manny approved this batch after reviewing the chroma-green renders and the
transparent cutouts over magenta and yellow. Each ImageGen render used the
matching approved Character Select `selection/full-body.png` as its actual
identity reference. The fixed-size runtime derivatives retain the 1024 × 1536
dimensions and use genuine sRGBA transparency.

| Racer        | Pose direction                                                                    | Identity source                                          | Runtime asset                                         | Generator output                            | Source SHA-256                                                     | Runtime SHA-256                                                    |
| ------------ | --------------------------------------------------------------------------------- | -------------------------------------------------------- | ----------------------------------------------------- | ------------------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------ |
| Alex / AA-01 | Restrained rueful shrug while adjusting her headset; composed "so close" reaction | `public/assets/characters/aa-01/selection/full-body.png` | `public/assets/characters/aa-01/results/reaction.png` | `exec-ba928d01-6c41-4be0-9093-6a30bddba050` | `5f4d22a4330d5be040a4d7cee82f318ec926fb905c6c117ccbf3e913e7553ae2` | `b6df95f50c0aa83908f2909e231b763031b2099e62b6fb67cff6a5798f97d650` |
| Lavi / AA-02 | Sheepish, good-natured one-boot recovery; hand at her glasses                     | `public/assets/characters/aa-02/selection/full-body.png` | `public/assets/characters/aa-02/results/reaction.png` | `exec-68f0d3f5-3a01-4347-b26d-085fea2a7798` | `0e775fbf7027149a422a950cef27a399e1e18bdc6aa308be2df1466007d62ff7` | `062a932545ab14a2e5db365d60f45fe95b8285ba96850b38ae994c97e408a430` |
| Lula / AA-03 | Dignified disappointment; hand over heart and steady reset stance                 | `public/assets/characters/aa-03/selection/full-body.png` | `public/assets/characters/aa-03/results/reaction.png` | `exec-0b9782da-fe47-46f1-9483-df4d6ffc3b4e` | `f5aa679b38ffe59c2612d8d25385a14bb807519d84ac6437b59dbacb7072fc47` | `0ae22c91b376259390541dc7193648b6631015eee20b5f18153b31ba97482b91` |

The matte uses an 8-connected border flood over pixels with green ≥ 55 and
green-channel excess ≥ 10, plus a one-pixel neighboring blend pass for green ≥
45 and excess ≥ 5. Alpha is estimated from green excess over the `#00FF00`
plate, rounded to 8-bit, and values below 40 are cleared; foreground RGB is
unmixed against the key color and fully transparent RGB is zeroed. Lavi's
enclosed arm/shoulder green component is cleared separately from the rest of
her green costume using the recorded anchor in
`tools/assets/prepare_results_reaction_cutouts.py`. No resizing or palette
conversion is applied. The script checks both source and output SHA-256 values.

The assets are now available for future Results integration, but this commit
does not change the current fallback for places 4–8. The other nine reactions
and Results backdrop remain unapproved.

## Approved Reaction Batch 02 — lower-finish poses

Manny approved the chroma-green renders and the transparent cutouts for Keeg, Kraken, and Dragon Queen on 2026-09-24. The matching approved Character Select full-body image was used as the actual identity reference for each render. Each runtime cutout is a 1024 × 1536 RGBA PNG with genuine transparency and zeroed RGB in fully transparent pixels. Batch 02 adds no Results runtime mapping change; places 4–8 continue using their existing fallback.

| Racer                | Approved lower-finish pose                                                                   | Identity source                                          | Runtime asset                                         | Generator output                            | Source SHA-256                                                     | Runtime SHA-256                                                    |
| -------------------- | -------------------------------------------------------------------------------------------- | -------------------------------------------------------- | ----------------------------------------------------- | ------------------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------ |
| Keeg / AA-04         | Theatrical half-bow; robe sweep and mock-apology hat touch; sheepish, charismatic recovery   | `public/assets/characters/aa-04/selection/full-body.png` | `public/assets/characters/aa-04/results/reaction.png` | `exec-86c49b26-1d57-4795-8b46-ff6501b0490f` | `10543f10f29717554c6dbccc14c8e0f43bd25bc00dc50c46583296072929884c` | `cfb9800f7675c85c055acdbd6a9fbdc3e22748bbc9166e404f3e429c5fe6ee9b` |
| Kraken / AA-05       | Compact three-quarter stance; brushing dust from one sleeve and measured sideways glance     | `public/assets/characters/aa-05/selection/full-body.png` | `public/assets/characters/aa-05/results/reaction.png` | `exec-f31ee1f8-72fc-4e01-a518-1ec4f8e6eab9` | `e598cd915cc397af9f1e1200437b67673d58484978ebd04ce8c2fc5690ae83e9` | `57030b478a9b0cdf6607f5c3041385989768abda61d72d1316b8696b5c390445` |
| Dragon Queen / AA-06 | Partly folded wings; foreclaw over chest ornament; dipped head and fully visible curled tail | `public/assets/characters/aa-06/selection/full-body.png` | `public/assets/characters/aa-06/results/reaction.png` | `exec-1d60d86f-502a-4a23-a742-12b513066e00` | `df53fcf458a4f3b989dc7d5573b1aaa9fa6c00e787745b1aedddcbd5c3b146c1` | `0997d1684a9fc29c05995bb7e361a507d5e967f8965ab77312590fb6488e8e6b` |

The approved runtime PNG hashes, dimensions, RGBA format, transparent corners, transparent-RGB zeroing, and opaque key-green check are enforced by `tools/verify-runtime-assets.mjs`.

## Approved Reaction Batch 03 — lower-finish poses

Manny approved the chroma-green renders and transparent cutouts for
McFleurdel / AA-07, Toph / AA-08, and Manaconda / AA-09 on 2026-09-25.
Each generation used its matching approved Character Select full-body image
as an actual reference. The 1024 × 1536 sRGBA cutouts were reviewed against
navy and magenta backgrounds before approval.

| Racer              | Lower-finish gesture                                | Runtime asset                                         | Generator output                                | Source SHA-256                                                     | Runtime SHA-256                                                    |
| ------------------ | --------------------------------------------------- | ----------------------------------------------------- | ----------------------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------ |
| McFleurdel / AA-07 | Composed cuff adjustment and rueful sideways glance | `public/assets/characters/aa-07/results/reaction.png` | `exec-49fb046b-1f59-4aad-9cdf-9013f7c71a54.png` | `e2068d183576b90d5dfa084724eecbfd2d110cde5e338def96523e9282dc7e3b` | `6ea0df99354f4cb59310ae6ab7d41159940e3b5de23200b94127d6f8da717ca5` |
| Toph / AA-08       | Wry recovery shrug and hand to beanie               | `public/assets/characters/aa-08/results/reaction.png` | `exec-4552f737-3bee-4db7-860e-28fc9c36bf0f.png` | `2cbb8cecd98223e86630eb3274210633e96dec4c0c76afbf472629af9a6aadd2` | `c99be19b82f41a1b2ace6be6f6d153e238056f4750392fa9affa2dffcf7c1b83` |
| Manaconda / AA-09  | Thoughtful map and compass reset with Paprika       | `public/assets/characters/aa-09/results/reaction.png` | `exec-b06a6a7b-29b7-4944-9c33-364570a256a0.png` | `70c568d6616cf59370ec7b1a077bc944103fff2177a713364d9e9f23bfeaafed` | `899fc626403f9811528acb01aa4f6bc259cdef334e19b3921f4ed488e3c3813f` |

The source/runtime hashes and reproducible green-screen matte are pinned in
`tools/assets/prepare_results_reaction_cutouts.py`. The batch adds assets
only; places 4–8 still use the selection-art fallback.

## Route Night Results/Podium — approved lower-finish reaction batch 04

Manny approved the chroma-green renders and transparent cutouts for Krios /
AA-10, Accu / AA-11, and Jennifer / AA-12 on 2026-09-25. Each render used its
matching approved Character Select full-body image as the actual identity
reference. The 1024 × 1536 RGBA cutouts preserve the reviewed lower-finish
poses and were checked against navy and bright yellow backgrounds. This batch
adds art only; it does not change Results selection behavior.

| Racer            | Lower-finish gesture                                                      | Identity source (SHA-256)                                                                            | Runtime asset                                         | Generator output                                | Source SHA-256                                                     | Runtime SHA-256                                                    |
| ---------------- | ------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ----------------------------------------------------- | ----------------------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------ |
| Krios / AA-10    | Broad lowered stance, steady exhale, one gauntleted hand across his chest | `aa-10/selection/full-body.png` (`5eca274a95bfefc134798e30d99dc20d3e9df1eaeb0c7c76bc09c7db881c89ba`) | `public/assets/characters/aa-10/results/reaction.png` | `exec-cdaa85ed-33a8-4a63-88ca-6f83c31cbc80.png` | `b258d6126d0a556f0fdb84aca3753ac580f7b9c7c4a794a29058ddadfe1d6117` | `c91d9947d42873d3da73f7f31edfca7f9201fcbb2be14f244f1d8fea2ecfbae8` |
| Accu / AA-11     | Asymmetrical weight shift, hand at hip, wry half-smile                    | `aa-11/selection/full-body.png` (`51fc2a28abee94bc3715dcfb5bb95ae964007e5e014c0a557eea67dab7a2798e`) | `public/assets/characters/aa-11/results/reaction.png` | `exec-0d1a12f3-04e2-4b8f-a934-10a46779f943.png` | `ad75bb9be2c7655d56a8ed6d55dc97d6bdd91e5b81977e835273a1b796962fcb` | `65dc0695310a406f46b7f3574bdea7b28bceab6fcf0ce98c2db5dcf44eba40f5` |
| Jennifer / AA-12 | Three-quarter stance, staff angled beside her, thoughtful expression      | `aa-12/selection/full-body.png` (`c20b761581e450f9b7b792c2cc905306fc577cc33d6aa1ff1e8c0b805a48782d`) | `public/assets/characters/aa-12/results/reaction.png` | `exec-df1d3b4c-f7ab-463e-b70f-460427db4933.png` | `b0cab5f4b0d0994b87cd1ad622f53f685eb74c5bf5faf9c84c378774b503b6b4` | `048275029ea11e85cba10fd1ce918a6d3ec479396324fb1174e5ae7e772462b8` |

The accepted runtime bytes are pinned in `tools/verify-runtime-assets.mjs`.
The existing preparation script covers batches 01–03; these accepted batch-04
cutouts are preserved as approved runtime files.

## Lower-finish reaction runtime mapping — 2026-09-25

All twelve approved reaction derivatives are now selected for authoritative
places 4–8 by stable character ID. Their exact SHA-256 values are used as
revision queries in `src/ui/raceAssets.ts`; places 1–3 remain restricted to
the victory set. Failed reaction loads retain the existing selection-art →
portrait → monogram fallback. The rank and result time continue to come from
the live `RaceStanding` contract. Focused coverage is in
`tests/results-podium.test.ts`. This mapping checkpoint does not integrate the
separately approval-gated Results backdrop or constitute visual acceptance.
