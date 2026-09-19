# Keeg avatar record

## Identity

- Display name: Keeg
- Stable internal ID: `aa-04`
- Pronouns: he/him
- Selection descriptor: Balanced Racer
- Character lock: Approved by Manny on 2026-08-26
- Definitive visual authority: Manny-supplied Keeg driving reference

Keeg is a flamboyant male witch defined by theatrical magic, intellect, charm, and confident magical sophistication. He has a well-trimmed beard and always wears a tall pointed witch's hat with prominent silver trim. His clothing uses layered flowing robes in rich purple, lavender, silver, and soft pastel tones with velvety, luminous, subtly enchanted materials. Ornate rings, jeweled details, and an elaborate belt reinforce his cultivated, expressive presentation.

Keeg favors dramatic poses, grand gestures, visual spectacle, and expressive movement rather than restraint. He should read as clever, charismatic, slightly extravagant, and unmistakably wizardly. Mushrooms are a canonical secondary motif that may appear in his magic, environments, equipment, symbols, or vehicle details without reducing him to a novelty mushroom character.

Must preserve: tall silver-trimmed pointed hat, well-trimmed beard, purple/lavender/silver palette, layered enchanted robes, ornate accessories, theatrical pose language, sophisticated magical presence, and mushroom affinity.

Avoid: generic black-robed wizard treatment, grim necromancer styling, shabby hedge-witch aesthetics, restrained/minimalist presentation, or oversized comedy mushroom treatment.

## Kart direction

- Kart name: The Mycelial Majesty
- Kart lock: Approved by Manny on 2026-08-26
- Design authority: the supplied Keeg racing reference is definitive

The Mycelial Majesty is an arcane grand-tourer / enchanted luxury racer with a low, wide, sweeping chassis, rounded shield-like nose, open cockpit, sculpted side pods, and flowing ornamental surfaces. It uses royal purple and violet bodywork, blackened metal or charcoal secondary surfaces, bright silver filigree, lavender magical glow, and restrained pastel highlights.

The four conventional wheels may carry violet arcane energy around their rims but must remain physically connected and readable as wheels. The nose carries an ornate mushroom emblem derived from the definitive reference. Small luminous mushroom fixtures may be structurally integrated into the bodywork as magical hardware or ornament. Silver scrollwork and engraved magical detailing must remain physically attached to the chassis rather than floating decoration. The cockpit must preserve Keeg's hat, robes, and expressive silhouette.

Avoid: broom-shaped novelty karts, giant mushrooms, dominant exposed industrial machinery, military armor, rustic styling, or floating decorative geometry.

## Gameplay mapping

- Profile: AA-04 Balanced Racer
- Class: Medium
- Stats: Speed 7 / Acceleration 7 / Weight 5 / Handling 7 / Mini-Turbo 5 / Traction 5
- Mapping lock: Approved by Manny on 2026-08-26

Keeg's approved driving identity is versatile, responsive, technically capable, and expressive without becoming a pure specialist. Acceleration 7 and Handling 7 reward quick control and deliberate line choice. Speed 7 keeps The Mycelial Majesty competitive, while Weight 5 gives the substantial enchanted kart presence without making it a heavyweight. Mini-Turbo 5 preserves Kraken's dedicated drift-specialist role, and Traction 5 prevents an artificial all-surface advantage.

## Provenance and transformation

Manny confirmed on 2026-08-26 that he created or controls the definitive supplied Keeg reference and authorizes its transformation into game assets. Derived production assets must preserve the locked likeness and design authority of that reference.

## Required driver art

Manny approved the complete production driver-art package on 2026-08-26:

- `portrait.png`: approved
- `driver/front.png`: approved
- `driver/rear.png`: approved
- `driver/steer-left.png`: approved
- `driver/steer-right.png`: approved
- `driver/hit.png`: approved
- `driver/victory.png`: approved
- `driver/front-steer-left.png`: approved on 2026-09-01
- `driver/front-steer-right.png`: approved on 2026-09-01
- `driver/front-hit.png`: approved on 2026-09-01
- `driver/front-victory.png`: approved on 2026-09-01

Character layers must contain no kart or steering-wheel geometry. Runtime portrait target is 256 x 256 transparent PNG. Each driver state target is 512 x 512 transparent PNG.

## Approval status

- Intake: Approved
- Character lock: Approved
- Definitive visual reference: Approved
- Source rights / transformation authorization: Confirmed
- Kart design lock: Approved
- Kart name: Approved, The Mycelial Majesty
- Balance mapping: Approved, AA-04 Balanced Racer
- 2D asset package: Approved and staged on `agent/keeg-production`
- Kart GLB design: Approved — Candidate 3 Revision 6, 2026-08-26
- Production integration: Front-action expansion deployed under `keeg-runtime-20260901-3` through PR #65 and main run `33563732551`
- Live verification: Passed on 2026-09-01 against checkpoint `f8a2ed8be0d72fde62c9403dae4b15e94222f7da`. Both steering directions, hit, victory, chase restoration, cockpit placement, transparency, and single modeled-wheel presentation passed.

## Next action

Preserve the accepted front-action files, controlled revision, front placement, and modeled-wheel ownership during later roster work.

## Character Select full-body selection art

- Runtime asset: `public/assets/characters/aa-04/selection/full-body.png`.
- Format: 1024 × 1536 transparent sRGBA PNG, normal-Git runtime delivery derivative under ADR-092.
- Approval: Manny approved Keeg's selection-only full-body asset in the 2026-09-19 Character Select batch review.
- Boundary: Character Select only; the approved portrait, race driver package, The Mycelial Majesty identity/geometry, statistics, and PBR/material implementation remain unchanged.
