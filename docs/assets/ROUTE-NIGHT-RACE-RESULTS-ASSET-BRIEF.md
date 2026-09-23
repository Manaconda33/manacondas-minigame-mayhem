# Route Night Race Results Asset Brief

## Scope

This brief governs the character-specific Results/Podium illustration package
for Slice 6. The first three approved batches add nine top-three victory poses.
The remaining three victory poses, twelve lower-finish reaction poses, and the
Results/Podium backdrop remain separately gated by visual approval.

The approved pose direction is character-driven rather than rank-generic:
each racer receives a distinct silhouette, body angle, gesture, and emotional
read grounded in their locked identity. Existing race driver victory frames
remain race-facing fallbacks; these larger results assets are separate.

## Runtime contract

| Item            | Contract                                                                                         |
| --------------- | ------------------------------------------------------------------------------------------------ |
| Runtime paths   | `public/assets/characters/aa-##/results/victory.png`                                             |
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

| Racer | Pose direction | Identity source | Runtime asset | Generator output | Source SHA-256 | Runtime SHA-256 |
| --- | --- | --- | --- | --- | --- | --- |
| McFleurdel / AA-07 | Elegant finishing pivot; controlled gothic flourish | `public/assets/characters/aa-07/selection/full-body.png` | `public/assets/characters/aa-07/results/victory.png` | `exec-b4bdd17a-288d-4315-8935-fc9b8d4b4329.png` | `98656cea9090be9bd993c0549eaee076651a0fe5e5fc52bd142846214389e6d0` | `21cbd6c61c2510baa22e351fce1564887331b511c0230345e79d7a3f42f91c02` |
| Toph / AA-08 | Low athletic skid-stop; calm, confident finish | `public/assets/characters/aa-08/selection/full-body.png` | `public/assets/characters/aa-08/results/victory.png` | `exec-07faa274-8ac5-4389-84a0-6f7735f56c07.png` | `893f997ae3263915ef27ab507726e043dccb03a16cf16fc4939964eddc52e42a` | `1ab53ed1c8d21314d14a99f9c80f65f4d3242cd929f30d1bf072c00ad86419cf` |
| Manaconda / AA-09 | Quiet compass salute with Paprika at his shoulder | `public/assets/characters/aa-09/selection/full-body.png` | `public/assets/characters/aa-09/results/victory.png` | `exec-f5f2aa6a-09de-41c6-a9e2-abf29b71c4e4.png` | `2e4f760bbc380067dc180fc25b34754b57da3d42de2d1c38f740deeb8d0549b9` | `19adc4de4c6a60d8ceb44ff73579b39812833965d42225305f0badd1be923a9b` |

## Approval and boundary

- Approved batches: Alex, Lavi, Lula, Keeg, Kraken, Dragon Queen, McFleurdel, Toph, and Manaconda victory poses.
- No reaction asset is approved by this batch.
- No Results/Podium runtime wiring is included by this asset checkpoint.
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
integration. Nine victory poses are now in runtime use; three victory poses,
twelve reactions, and the backdrop remain outside runtime use and under their
existing visual-approval gates.
