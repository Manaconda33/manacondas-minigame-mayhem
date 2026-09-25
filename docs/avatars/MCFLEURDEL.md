# McFleurdel avatar record

## Identity

- Display name: McFleurdel
- Stable internal ID: `aa-07`
- Pronouns: she/her
- Selection descriptor: High-Speed Cruiser
- Character lock: Approved by Manny on 2026-08-27
- Definitive visual authority: Manny-supplied McFleurdel racing reference

McFleurdel is a human woman known as the Dark Goddess of Refined Contradiction. She has pale skin, sharply divided black-and-white hair, violet eyes, dark lips, and precise black eyeliner. Her tailored gothic formalwear combines pinstripes, silver fleur-de-lis embroidery, dark-academia structure, subtle punk details, and restrained occult accents.

Her demeanor is controlled, observant, quietly intimidating, and often quietly unimpressed. Preserve her clean black-and-white geometry, restrained plum/violet accents, fleur-de-lis symbolism, refined silhouette, and calculated precision.

Avoid generic goth treatment, uncontrolled rage, cheerful softness, ornamental clutter that obscures her silhouette, or changing the canonical black/white hair division without view-specific approval.

## Kart direction

- Kart name: The Fleur de Nuit
- Kart lock: Approved by Manny on 2026-08-27
- Design authority: the supplied racing reference is definitive

The Fleur de Nuit is a low gothic grand-tourer with a black lacquered body, architectural silver filigree, plum throne-like cockpit upholstery, a fleur-de-lis nose shield, four exposed conventional wheels, structurally integrated candle-like violet flame fixtures, and purple exhaust energy. Its elegance must read as engineered construction rather than floating decoration.

Avoid detached candles or filigree, clipped wheels, hidden cockpit geometry, novelty hearse proportions, or decorative elements that interfere with the driver or steering assembly.

## Gameplay mapping

- Profile: AA-07 High-Speed Cruiser
- Class: Cruiser
- Stats: Speed 8 / Acceleration 6 / Weight 7 / Handling 5 / Mini-Turbo 4 / Traction 6
- Mapping lock: Approved by Manny on 2026-08-27

McFleurdel's intended driving identity is elegant and deliberate: strong top speed and substantial road presence, balanced by moderate handling and weak mini-turbo. The profile differentiates her from the technical and drift-specialist cruisers without moving her into the heavyweight class.

## Provenance and transformation

Manny confirmed on 2026-08-27 that he controls the definitive supplied McFleurdel reference and authorizes its transformation into production game assets.

## Required driver art

Manny approved the complete 2D design package on 2026-08-27:

- `portrait.png`: approved
- `driver/front.png`: approved
- `driver/rear.png`: approved
- `driver/steer-left.png`: approved
- `driver/steer-right.png`: approved
- `driver/hit.png`: approved with view-specific hair-color inversion
- `driver/victory.png`: approved with view-specific hair-color inversion
- `driver/front-steer-left.png`: approved on 2026-09-01 after false-white curl and arm-gap cleanup
- `driver/front-steer-right.png`: approved on 2026-09-01 after false-white curl and arm-gap cleanup
- `driver/front-hit.png`: approved on 2026-09-01
- `driver/front-victory.png`: approved on 2026-09-01

All normalized files use genuine sRGBA transparency, exact PRD dimensions, alpha spanning 0–1, and fully transparent corner pixels. Driver layers contain no kart or steering-wheel geometry.

## Approval status

- Intake: Approved
- Character lock: Approved
- Definitive visual reference: Approved
- Source rights / transformation authorization: Confirmed
- Kart design lock: Approved
- Kart name: Approved, The Fleur de Nuit
- Balance mapping: Approved, AA-07 High-Speed Cruiser
- 2D asset package: Approved and normalized on `agent/mcfleurdel-production`
- Kart GLB design: Approved — Candidate 9, 2026-08-27
- Production integration: Front-action expansion deployed under `mcfleurdel-runtime-20260901-2` through PR #65 and main run `33563732551`
- Live verification: Passed on 2026-09-01 against checkpoint `f8a2ed8be0d72fde62c9403dae4b15e94222f7da`. Both steering directions, hit, victory, chase restoration, transparency, cockpit placement, and single modeled-wheel presentation passed. The reviewed black-curl interiors and arm gaps remain transparent.

## Next action

Preserve the accepted front-action files, controlled revision, front placement, modeled-wheel ownership, and pale-matte regression guard during later roster work.

## Character Select full-body selection art

- Runtime asset: `public/assets/characters/aa-07/selection/full-body.png`.
- Format: 1024 × 1536 transparent sRGBA PNG, normal-Git runtime delivery derivative under ADR-092.
- Approval: Manny approved McFleurdel's selection-only full-body asset in the 2026-09-19 Character Select batch review.
- Boundary: Character Select only; the approved portrait, race driver package, The Fleur de Nuit identity/geometry, statistics, and PBR/material implementation remain unchanged.

## Results/Podium victory art

- Runtime asset: `public/assets/characters/aa-07/results/victory.png`.
- Format: 1024 × 1536 transparent sRGBA PNG, normal-Git fixed-size runtime derivative under ADR-093.
- Approval: Manny approved the elegant finishing pivot on 2026-09-23 using the approved Character Select full-body asset as the identity reference.
- Provenance and runtime SHA-256: recorded in `docs/ASSET-PROVENANCE.md` and `docs/assets/ROUTE-NIGHT-RACE-RESULTS-ASSET-BRIEF.md`.

## Results/Podium lower-finish reaction art

- Runtime asset: `public/assets/characters/aa-07/results/reaction.png`.
- Approval: Manny approved the chroma-green render and true-alpha cutout on 2026-09-25. Pose: Composed cuff adjustment and rueful sideways glance.
- Reference: this character's approved Character Select full-body art was supplied directly to generation. Exact source and runtime hashes are recorded in the Results asset brief and provenance ledger.
- Boundary: asset only; places 4–8 continue to use the existing selection-art fallback until separately integrated.
