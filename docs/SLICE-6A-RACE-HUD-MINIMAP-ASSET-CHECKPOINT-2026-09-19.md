# Slice 6A Race HUD / Circuit Alpha minimap asset checkpoint

## Status

**Branch-only implementation checkpoint — not merged, deployed, or visually accepted.**

Branch: `feature/slice6-race-hud-minimap-results-podium`

Parent checkpoint: PR #187 merge / `7e8a9ea8901bef6ea4dd785780c4cc8295225ead`

This checkpoint follows the approved Route Night visual target review and the explicit direction to collect existing assets, create only the missing presentation surfaces, and keep the work durable in the repository.

## Asset direction conclusion

The canonical target was reviewed before implementation. The visual gaps for the live race screen are exact panel/gauge/frame geometry, item-art placement, minimap framing, and a restrained atmospheric layer. The asset split is:

| Need                                                                                    | Decision                                                | Repository source                                                                     |
| --------------------------------------------------------------------------------------- | ------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Race atmosphere / edge energy                                                           | Reuse approved generated overlay                        | `public/assets/ui/route-night/race-hud-atmosphere.webp`                               |
| Held-item visuals                                                                       | Reuse approved fifteen-item pack                        | `public/assets/items/route-night/*.png`                                               |
| Roster identity in live minimap                                                         | Reuse existing live portrait/driver sources             | Existing character manifest and race-driver URLs                                      |
| Panel, item, minimap, warning, speed, drift, and placement geometry                     | Create outside ImageGen as text-free SVG symbol library | `public/assets/ui/route-night/route-night-race-hud.svg`                               |
| Values, names, item phase, markers, topology, warnings, responsive layout, and fallback | Keep live in DOM/CSS/SVG runtime                        | `src/app/raceHud.ts`, `src/app/itemHud.ts`, `src/app/raceMinimap.ts`, `src/style.css` |

No new raster/ImageGen asset is introduced by this implementation checkpoint. The approved atmosphere and item generations are already present in the repository and their provenance remains recorded in `docs/ASSET-PROVENANCE.md`.

## Implemented surface

- Added a revisioned `route-night-race-hud.svg` symbol library with eight text-free symbols: panel, wide panel, item frame, warning frame, minimap frame, drift gauge, speed gauge, and placement badge.
- Added base-aware Route Night helpers for the race-HUD library and the fifteen item PNGs.
- Added the semantic race shell composition while preserving the existing dynamic IDs used by race authority and item/minimap update paths.
- Added the approved item-art mapping with an image-error fallback to the existing live Unicode item icon and text.
- Added the authored minimap frame without changing the authoritative Circuit Alpha track path, progress mapping, racer IDs, portraits, or marker updates.
- Added the approved atmosphere overlay below live HUD content with pointer events disabled.
- Added responsive desktop/mobile placement and reduced-motion behavior for the new presentation layer.

## Explicit exclusions

This checkpoint does not add Results/Podium screens, victory or finish-reaction poses, standings authority, race rules, lap/checkpoint/topology logic, item behavior/balance, AI behavior, kart/PBR/material work, audio, or Character Select changes.

## Verification gate

The focused contract is `tests/race-hud-ui.test.ts`. Before publication, the branch must pass the repository validation sequence, runtime-asset checks, SVG integrity, and `git diff --check`. Publication must remain a separate GitHub checkpoint; merge, deployment, and live visual acceptance require a later approval gate.
