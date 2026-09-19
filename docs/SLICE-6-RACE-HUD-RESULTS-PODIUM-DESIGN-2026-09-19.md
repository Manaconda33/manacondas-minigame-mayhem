# Slice 6 Route Night Race HUD, Circuit Alpha Mini-map & Results/Podium Design Brief

**Date:** 2026-09-19
**Status:** APPROVED FOR DESIGN / IMPLEMENTATION PLANNING; no runtime code or new race/results assets are introduced on this documentation branch.

## Decision summary

The accepted Character Select checkpoint closes the previous bounded Slice 6 gate. The next bounded increment is a visual and presentation pass over the live race HUD, the shared Circuit Alpha mini-map, and the post-race transition. Manny approved an ImageGen-led asset direction after reviewing the Route Night canonical target: generated art is required for item identity at minimum, atmospheric layers should reinforce the visual language, and the finish state should become a full cinematic Results/Podium screen with new top-three victory poses and finish-based lower-rank reactions.

The generated art supports the presentation but never owns live game truth. Names, numbers, rank, time, lap, item charges, warnings, map topology, controls, standings, focus behavior, and responsive layout remain DOM/CSS/SVG or typed runtime data.

## Governing references

| Reference | Role |
| --- | --- |
| `docs/PRD.md` Sections 10.5, 10.6, 10.7, 11.4, 11.5, 23, 24.6, 35.7, 36.3, and 37 | HUD, mini-map, results, portrait, finish-flow, testing, and Slice 6 acceptance contract |
| `docs/DECISIONS.md` ADR-086, ADR-087, ADR-088, ADR-090-092, and ADR-093 | Route Night visual grammar, settings/audio boundary, PBR protection, accepted Character Select scope, asset direction |
| `docs/reference/route-night/ROUTE-NIGHT-CANONICAL-REFERENCE.png` | Canonical visual target; visual-language reference only, never a source image to copy |
| `src/game/KartTimeTrial.ts` and `src/game/ui/Minimap.ts` | Existing race authority, typed HUD state, results data, and shared track topology |

## Bounded objective

- Recompose the current generic race HUD into a Route Night / Twilight Broadcast hybrid that reads clearly over Circuit Alpha while preserving every existing HUD value and warning.
- Make the mini-map visually authored without changing the normalized track samples or progress calculation that feed it.
- Replace the compact finish card with a full post-race Results/Podium screen that dynamically represents all eight finishers.
- Add the minimum generated visual pack needed for the artistic flavor: fifteen item identity visuals, one race atmosphere overlay, one Results/Podium backdrop, twelve victory poses, and twelve reaction/defeat poses.
- Keep pause, final-lap/engine audio, post-processing, track topology, item behavior, race authority, and accepted Character Select behavior outside the runtime change.

## Visual target conclusion

The Route Night target is a dark graphite/indigo broadcast surface with electric cyan route energy, restrained violet/magenta atmosphere, gold confirmation accents, clipped panels, route-board density, strong silhouette separation, and editorial brush energy. It is not a request to copy the target image's pixels, exact layout, commercial typography, or branded marks.

ImageGen is the right source for the authored flavor that live UI cannot provide: item silhouettes with a common lighting language, soft edge atmosphere around a live race, a cinematic results environment, and character-specific celebration/reaction poses. ImageGen is not the source of truth for layout, copy, numeric data, route geometry, or interaction states.

## Asset pack contract

| Package | Runtime path | Count and delivery | Authority |
| --- | --- | --- | --- |
| Item identity art | `public/assets/items/route-night/<item-id>.png` | 15 × 512 × 512 transparent sRGBA PNG runtime derivatives | Visual identity only; item name, charges, behavior, and VFX remain typed/runtime |
| Race atmosphere | `public/assets/ui/route-night/race-hud-atmosphere.webp` | 1 × 1536 × 1024 alpha-capable WebP overlay | Edge light, grain, indigo/cyan/violet energy; no copy, map, track, kart, or character |
| Results backdrop | `public/assets/ui/route-night/results-podium-backdrop.webp` | 1 × 1672 × 941 opaque WebP | Text-free podium environment behind live stage, standings, and controls |
| Victory poses | `public/assets/characters/aa-##/results/victory.png` | 12 × 1024 × 1536 transparent sRGBA PNG runtime derivatives | Dynamic top-three hero art; one active asset per top-three finisher |
| Reaction poses | `public/assets/characters/aa-##/results/reaction.png` | 12 × 1024 × 1536 transparent sRGBA PNG runtime derivatives | Dynamic places 4-8 lower-finish art; one active asset per lower finisher |

Generated/source masters are not runtime files. The implementation must record generator output IDs, approved reference inputs, deterministic alpha/resize/compression steps, exact runtime hashes, and rejection notes in a new asset brief plus `docs/ASSET-PROVENANCE.md`. Fixed-size runtime derivatives may receive scoped normal-Git exceptions only after the asset validation contract is implemented; source masters remain governed by LFS.

## Item identity mapping

| Item ID | Display name | Runtime art |
| --- | --- | --- |
| `kinetic-disc` | Ricochet Kinetic Disc | `public/assets/items/route-night/kinetic-disc.png` |
| `seeker-drone` | Homing Seeker Drone | `public/assets/items/route-night/seeker-drone.png` |
| `apex-missile` | Apex Orbital Missile | `public/assets/items/route-night/apex-missile.png` |
| `blast-orb` | Timed Blast Orb | `public/assets/items/route-night/blast-orb.png` |
| `blaze-orbs` | Blaze Orbs | `public/assets/items/route-night/blaze-orbs.png` |
| `frost-orbs` | Frost Orbs | `public/assets/items/route-night/frost-orbs.png` |
| `arc-blade` | Rebounding Arc Blade | `public/assets/items/route-night/arc-blade.png` |
| `arc-hammers` | Kinetic Arc Hammers | `public/assets/items/route-night/arc-hammers.png` |
| `slick-trap` | Hazard Oil / Slick Trap | `public/assets/items/route-night/slick-trap.png` |
| `shockwave` | Acoustic Shockwave Pulse | `public/assets/items/route-night/shockwave.png` |
| `ink-splat` | Vision-Obscuring Ink Splat | `public/assets/items/route-night/ink-splat.png` |
| `nitro-surge` | Nitro Surge | `public/assets/items/route-night/nitro-surge.png` |
| `nitro-overdrive` | Continuous Nitro Overdrive | `public/assets/items/route-night/nitro-overdrive.png` |
| `hyper-drive-rocket` | Hyper-Drive Rocket | `public/assets/items/route-night/hyper-drive-rocket.png` |
| `prismatic-invincibility` | Prismatic Invincibility | `public/assets/items/route-night/prismatic-invincibility.png` |

The item art must stay text-free and recognizable at the compact HUD size. CSS supplies the card, charge count, roulette meter, live label, active state, and reduced-motion behavior. No generated item art may imply a new effect, alter the item balance, or replace the existing procedural gameplay VFX.

## Character result mapping

All active AA-01 through AA-12 characters receive both result states. A racer can occupy any finish place, so a partial asset set would fail the dynamic podium contract.

- Places 1-3: show `results/victory.png` in a responsive hero stage. The winner is centered; second and third are offset left/right with smaller scale and rank treatment.
- Places 4-8: show `results/reaction.png` in a compact lower-finish rail or standings-adjacent strip. The state may read glum, winded, frustrated, or defeated, but it must preserve approved likeness, costume, silhouette, and character identity.
- All eight places: remain present in the live standings table with place, name, and finish time. On mobile the standings scroll independently without hiding the primary controls.
- Fallback chain: generated result pose → approved Character Select `selection/full-body.png` → approved `portrait.png` → existing monogram fallback. The fallback must preserve the result row and never block navigation.
- The existing 512 × 512 `driver/victory.png` frame remains a race-facing fallback only; it is not the new podium hero.

## Reused and newly authored surfaces

| Surface | Reuse | New work |
| --- | --- | --- |
| Race HUD | Existing `HudState`, item snapshot, warning strings, touch controls, and Route Night SVG library | New route composition, item art placement, atmosphere overlay, responsive CSS, and accessibility grouping |
| Mini-map | Existing `normalizeMinimapTrack`, `minimapPointAtProgress`, portrait markers, and player/opponent identity | Route Night frame, route-energy treatment, marker hierarchy, finish-state hiding, responsive placement |
| Results | Existing authoritative `RaceResult` and standings refresh callback | Enriched stable character identity, full stage, victory/reaction assets, all-eight table, and three actions |
| Characters | Existing portraits, selection full-body assets, roster manifest, and approved identity records | 12 victory poses and 12 reaction/defeat poses generated from approved references |
| Track/karts/items | Existing Circuit Alpha topology, kart GLBs, PBR baseline, item definitions, item behavior, and procedural VFX | No gameplay or model replacement; only live UI presentation consumes their existing state |

## Runtime behavior

### Race HUD

- Render a semantic `data-race-hud` shell above the canvas and atmosphere layer. Keep `canvas`, touch controls, warnings, and live values in their existing ownership boundaries.
- Group lap/position, race time, speed/surface, item state, drift/boost state, and warnings into explicit live regions. Keep countdown centered and unobscured.
- Replace the Unicode-only item glyph with the mapped item visual while retaining the text name and charge count for readability and assistive technology.
- Keep the existing `HudState` update cadence and all warning semantics. The visual pass must not add timers, modify values, or infer race state in the DOM.
- Keep `pointer-events: none` on atmosphere and decorative layers. Touch controls retain the highest interactive priority on mobile.

### Circuit Alpha mini-map

- Continue to consume the same normalized `MinimapState.track` samples and racer progress values; `src/game/ui/Minimap.ts` remains the only topology/progress geometry source.
- Render all eight racer markers with portrait head crops. The player marker is larger with a gold outline; opponents use a dark outline and stable contrast.
- Keep the map non-interactive and below the lap block on desktop, in the upper-left HUD column on mobile, clear of countdown/rear/reset controls/touch controls, and hidden when the compact finish state becomes the cinematic Results/Podium state.
- Marker creation/removal must remain keyed by stable racer ID. No duplicate markers, stale portraits, or per-frame DOM growth are allowed.

### Finish transition and Results/Podium

- On the authoritative player finish callback, freeze the presentation into a `results-entering` state, hide the minimap and nonessential race HUD, and reveal the full Results/Podium stage without changing the locked race result.
- Use the enriched standings identity to select top-three victory art and places 4-8 reaction art. The render order must follow authoritative `place`, not array arrival order.
- Keep all eight standings live and scrollable, with `RACE AGAIN`, `CHANGE DRIVER`, and `RETURN TO HUB` actions. `RACE AGAIN` restarts the selected character; `CHANGE DRIVER` returns to Character Select; `RETURN TO HUB` returns to the existing Hub.
- Keep later AI finish updates synchronized until the standings are complete. A late finisher may update a row/reaction state but cannot change the player's locked place/time.
- Respect `prefers-reduced-motion`: remove stage parallax, pose entrance motion, and decorative pulsing while preserving the same hierarchy and all content.

## Non-goals and preserved boundaries

- No item balance, probability, charge count, collision, VFX simulation, audio, AI, physics, checkpoint, lap, race-authority, roster, kart, PBR/material, or track-topology change.
- No pause-menu redesign, final-lap/engine music implementation, post-processing stack, WebGPU path, hosting change, or new product route.
- No generated image contains UI copy, logos, hidden controls, copied canonical pixels, commercial art, or exact commercial layout.
- No generated art is allowed to silently replace live names, numbers, standings, accessibility labels, or map topology.

## Acceptance gates

- Asset gate: all 15 item assets, 2 atmosphere assets, 12 victory assets, and 12 reaction assets exist at the exact contract dimensions, have recorded provenance/hashes, contain no embedded copy or marks, and pass runtime fallback/transparent-pixel checks.
- Runtime gate: Title → Hub → Character Select → Race → Results is complete; all eight standings update correctly; top-three and 4th-8th states select the right character art; Race Again, Change Driver, and Return to Hub all work.
- Visual gate: desktop and mobile review against the canonical Route Night target confirms hierarchy, silhouette readability, item identity, mini-map legibility, atmosphere restraint, podium composition, standings access, and clear touch controls.
- Resilience gate: missing item/result/atmosphere art, WebGL fallback, reduced motion, narrow viewport, late AI finish, and repeated race restart remain usable.
- Quality gate: strict typecheck, zero-warning lint, full tests, production build, branding/runtime-asset validation, `git lfs fsck`, five-restart cleanup/memory evidence, hosted CI/Pages, and product-owner deployed acceptance all pass.

## Review stop

This brief is the design basis for the next bounded increment. The current branch contains documentation only. Runtime code, ImageGen outputs, hosted deployment, and the live Race HUD/Results acceptance gate begin only after the plan is reviewed and the implementation branch is authorized.
