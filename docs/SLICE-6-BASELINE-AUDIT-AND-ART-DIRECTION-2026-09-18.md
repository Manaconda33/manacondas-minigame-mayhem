# Slice 6 Baseline Audit, Material Sourcing & Art-Direction Gate

Date: 2026-09-18

## Purpose

Slice 6 converts the mechanically complete racer into the intended high-fidelity vertical slice without reopening accepted Slice 5 gameplay. This checkpoint freezes the starting baseline, identifies the largest presentation gaps, defines a legally clean material-sourcing workflow, and batches the first visual-direction decision so product-owner collaboration stays high-value rather than devolving into dozens of micro-approvals.

Baseline:

- canonical repository: `Manaconda33/manacondas-minigame-mayhem`
- starting `main`: `a93d8c06be986e6e514124f1a689feb8c1e000a4`
- Slice 5: LIVE ACCEPTED / COMPLETE
- Slice 6: APPROVED TO BEGIN 2026-09-18
- open experimental/stale PRs #162 and #168 remain untouched

## PRD Slice 6 target

The authoritative target remains PRD v1.1 Section 35.7: final HUD, mini-map, pause/results, approved avatars, production audio, final-lap music, shadows, particles, bloom, quality-tier motion blur, graphics presets, optimization, memory cleanup, cross-browser QA, rights/provenance, and release-candidate validation.

No gameplay balance, item probability, racer statistics, race authority, track/checkpoint rules, roster identity, or approved avatar likeness may change through this art-direction checkpoint.

## Baseline audit

| Area | Current implementation | Slice 6 assessment |
| --- | --- | --- |
| Title / hub | Functional DOM/CSS title mark, title copy, hub cards, controls/settings | KEEP structure; RE-DESIGN presentation and motion |
| Character select | 12-card grid, portraits, stats, kart name, selection handoff | POLISH heavily; PRD idle 3D kart preview is not present in the runtime screen and must be implemented |
| Settings | Master-volume slider only; no persistent quality controls | REPLACE with persistent mixer/graphics/accessibility settings |
| Pause | Race simulation pauses through Esc/P | UI pause overlay/menu required: Resume, Restart, Settings, Controls, Quit |
| Results | Compact standings card + Return to Hub | Expand to final results/podium treatment with Race Again / Change Driver / Hub |
| HUD | Lap/time/speed/position/surface/performance/item/drift/minimap/warnings | KEEP data contract; redesign hierarchy, player portrait integration, final-lap treatment and production styling |
| Mini-map | Shared-topology SVG with portrait head markers | KEEP topology/logic; polish framing, scaling, readability |
| Final-lap presentation | No dedicated final-lap UI/music transition found | IMPLEMENT |
| Track materials | Mostly color-only `MeshStandardMaterial` values | MAJOR POLISH opportunity |
| Track texture support | Procedural strip geometry currently emits positions/normals but no UV attribute | IMPLEMENT UV generation or bounded world/triplanar mapping before texture rollout |
| Kart materials | Approved GLBs primarily use color-factor PBR materials; most builders do not provide production UV mapping | Preserve approved silhouettes/material identity; texture selectively only where mapping is technically safe |
| Renderer | WebGLRenderer, antialiasing, pixel-ratio cap, PCF soft shadows | Add controlled tone/exposure, quality presets, post-processing and measured shadow tiers |
| Post-processing | No EffectComposer/bloom/motion-blur implementation found | IMPLEMENT behind quality presets |
| Audio | Procedural item/drift cues + Prismatic musical layer; master volume only | Replace/extend with mixer buses, engine system, music states, final-lap/finish/UI production audio |
| Persistence | No production localStorage settings implementation found | IMPLEMENT approved settings persistence |
| Memory / context recovery | Runtime disposal exists, but no final five-restart memory certification | MEASURE and harden |
| Cross-browser | Existing manual acceptance is feature-specific | Run final Chrome/Edge/Firefox/Safari matrix under Slice 6 |

## 3D material and texture strategy

### Key engineering finding

Circuit Alpha's road and segmented strips currently have no UV coordinates. Most approved kart builders likewise use flat PBR factors and do not expose usable unique UVs; the one texture-capable builder path found uses a degenerate zeroed TEXCOORD fallback rather than a general-purpose authored UV layout.

Therefore, the texture pass must not begin by blindly attaching image maps. The first bounded rendering task is material-coordinate infrastructure:

1. add deterministic longitudinal/lateral UVs to procedural road/shoulder/dirt strips;
2. use existing primitive UVs for ground/props where suitable;
3. consider world-space/triplanar detail only where it stays cheap and visually stable;
4. keep approved kart silhouettes/material color language intact; do not UV-remap every kart merely to justify new texture files;
5. measure GPU texture residency and draw/material cost before broad rollout.

### Preferred free-use sources

**Primary: Poly Haven**
- License: CC0.
- License record: https://polyhaven.com/license
- PBR source candidates:
  - Asphalt Track: https://polyhaven.com/a/asphalt_track
  - Asphalt 01: https://polyhaven.com/a/asphalt_01
  - Leafy Grass: https://polyhaven.com/a/leafy_grass
  - Sparse Grass: https://polyhaven.com/a/sparse_grass
  - Dark Rock: https://polyhaven.com/a/dark_rock
  - Rock 01: https://polyhaven.com/a/rock_01
  - Metal Plate: https://polyhaven.com/a/metal_plate
  - Metal Plate 02: https://polyhaven.com/a/metal_plate_02

**Secondary: ambientCG**
- License: CC0 1.0 for downloadable assets.
- License record: https://docs.ambientcg.com/license/
- Use as a second source when Poly Haven does not supply a visually appropriate surface.

**Generic UI utility/reference: Kenney**
- UI packs are available under CC0.
- Example: https://kenney.nl/assets/ui-pack
- Final branded UI should remain original; Kenney is acceptable for prototyping/generic utility glyphs, not as a substitute for authored product identity.

**Quaternius**
- Free commercial use remains available under the current Quaternius Asset License, but it is no longer a simple CC0 baseline.
- Do not use it as the default material source. Any future Quaternius asset requires its specific license entry in the provenance ledger.

### Texture budget rules

- Do not ship original 8K source maps merely because the source offers them.
- Medium is the governing production baseline.
- Start with 1K or 2K maps depending on screen-space importance.
- Prefer a compact set of reusable materials over unique maps per prop.
- Use albedo + normal + packed AO/roughness/metallic only where the visual gain justifies residency.
- Low may drop normal/AO detail and reduce shadow/postFX cost.
- High may increase selected texture resolution/postFX without making gameplay depend on it.
- Track approximate GPU texture residency against the PRD Medium target of <=256 MB.
- Preserve the first-playable package/download budget.
- Every external asset added to production receives source URL, license, downloaded source identifier, derivative path, resolution, and transformation notes.

## UI / menu inspiration policy

Existing commercial interfaces are reference material only. Do not copy their logos, icons, exact layouts, typography, proprietary art, franchise motifs, or trade dress.

Reference principles worth studying:

- **Mario Kart 8 Deluxe:** immediate hierarchy, fast character readability, large clear selections, information density that does not feel technical.
- **Crash Team Racing Nitro-Fueled:** tactile arcade panels, character-forward presentation, strong selection focus and playful dimensionality.
- **Sonic Racing: CrossWorlds:** speed/portal energy, kinetic diagonals, motion-forward composition and vibrant course identity.
- **Hot Wheels Unleashed 2:** material tactility and bold toy-like environmental/UI contrast.
- **Need for Speed Unbound:** editorial typography, graphic overlays, strong hierarchy and stylized motion language.

The project must synthesize principles, not reproduce a franchise screen.

## Original visual-direction candidates

### Direction A - ROUTE NIGHT

**Recommended starting direction.**

Deep indigo/graphite surfaces, cyan route-line graphics, warm gold placement accents, violet/magenta secondary energy, strong portrait crops, clipped-but-readable panels, and the existing route/token brand mark as the repeated visual grammar.

Why it fits:
- evolves the current dusk Circuit Alpha palette rather than fighting it;
- works with all twelve wildly different character identities;
- makes gold/cyan/violet item and boost energy feel native;
- can scale from title/menu to HUD/results without becoming generic sci-fi;
- gives us an original motif: routes, nodes, tokens, checkpoints, arcs.

Asset language:
- authored route-line SVGs;
- token/node dividers;
- original panel masks and stat rails;
- large character cutouts using approved portraits;
- subtle generated or rendered background plates;
- restrained glass only where readability survives.

### Direction B - PIT POSTER

High-contrast charcoal and warm off-white panels, giant character art, saturated character-specific accents, poster-block typography, diagonal race tape, halftone/speed textures and chunky tactile controls.

Why it fits:
- most playful and character-forward;
- makes the roster the star;
- visually distinct from conventional translucent racing HUDs.

Risk:
- easiest direction to make visually noisy;
- requires disciplined HUD simplification during racing.

### Direction C - TWILIGHT BROADCAST

Premium race-broadcast presentation: translucent dark plates, thin luminous rules, gold rank emphasis, compact typography, elegant minimap/telemetry framing and cinematic results cards.

Why it fits:
- highest information clarity;
- natural fit for live race HUD and results;
- cheapest of the three to keep performant.

Risk:
- can become too restrained for the eccentric roster if not paired with expressive character art and motion.

## Recommended synthesis

Use **Route Night as the core identity**, borrow **Pit Poster's character scale and playful selection energy**, and use **Twilight Broadcast's restraint inside the live race HUD**.

That hybrid gives different screens permission to breathe while keeping one visual language:
- Title / Hub: Route Night cinematic
- Character Select: Route Night + Pit Poster
- Race HUD: Route Night + Twilight Broadcast
- Pause / Settings: Twilight Broadcast
- Results / Podium: Route Night cinematic with large character art

## Asset creation plan

### Create ourselves

- title background composition and route/token motion
- menu panel frames and decorative route graphics
- original button states
- character-select selection frame
- stat bars/pips
- HUD plates
- lap/final-lap banners
- item-slot frame treatment
- placement badges
- podium/results plates
- warning frames
- settings icons
- loading indicators
- quality-preset glyphs

Prefer SVG/CSS for scalable structural UI. Use generated/raster artwork only where illustration materially improves the screen.

### Reuse existing approved assets

- product route/token mark
- approved character portraits and driver frames
- approved kart GLBs and silhouettes
- existing item silhouettes/VFX identity
- shared-topology minimap
- existing accepted track layout and landmark geometry

### Source externally under license

- a small PBR material library
- optional HDR environment contribution if it improves PBR while keeping the authored sky
- production audio where a CC0/permissive source is preferable to procedural synthesis

Every sourced production asset must enter the rights/provenance record before public release.

## Creative-collaboration cadence

To avoid wasting turns:

1. Batch discovery, audit and reference research.
2. Present 2-3 coherent alternatives at meaningful visual-direction gates.
3. Manny approves a direction or hybrid, not every individual border/radius/color.
4. Within that approved language, small reversible aesthetic choices are implementation-authorized.
5. Return for approval only when a change alters the visual language, likeness package, material product requirement, paid service, public hosting/deployment, or final release acceptance.
6. Every meaningful implementation checkpoint still receives objective CI/live evidence.

## Proposed Slice 6 implementation order after visual-direction approval

1. Settings/persistence architecture + graphics presets + audio mixer skeleton.
2. Material-coordinate infrastructure + first Circuit Alpha PBR material pass.
3. Title/hub/controls/settings original UI system.
4. Character Select redesign + real rotating 3D kart preview.
5. Race HUD/minimap/final-lap/pause UI.
6. Results/podium/replay/change-driver flow.
7. Engine/music/UI audio and final-lap/finish transitions.
8. Shadows/particles/bloom/motion blur and boost/off-road presentation.
9. Medium-preset performance tuning and texture-residency validation.
10. Five-restart memory gate.
11. Cross-browser/device matrix.
12. Rights/provenance + complete recording + release-candidate checklist.

## First visual-direction approval gate - APPROVED 2026-09-18

Manny reviewed rendered examples of Route Night, Pit Poster, Twilight Broadcast, and the proposed hybrid and explicitly selected **Route Night** as the governing visual direction.

### Locked Route Night visual language

Route Night is now the product-wide Slice 6 presentation system for the kart-racing vertical slice:

- deep indigo / graphite structural surfaces;
- cyan route-line, node, checkpoint, arc, and navigation graphics;
- warm gold placement, rank, focus, and primary-action accents;
- violet / magenta secondary energy accents;
- strong portrait crops and character-forward framing;
- clipped but readable panel geometry;
- cinematic title/results framing;
- high-clarity live-race HUD hierarchy;
- the existing route/token brand mark and related route grammar as a recurring original motif.

The approved Route Night concept governs **look, design, formatting, hierarchy, panel language, typography behavior, motif usage, accent logic, and overall screen composition**. Small reversible aesthetic decisions inside that language are implementation-authorized under ADR-085.

### Character and track boundaries

- Character Select must use the game's **actual approved production racers, portraits, driver art, names, stats, and kart identities**. Concept-render placeholder characters are reference-only and are not production roster proposals.
- The PRD's rotating 3D kart preview remains required.
- Route Night does **not** force every race track to occur at night. Circuit Alpha may retain its authored dusk/twilight identity, while future tracks created after the vertical-slice PRD may use their own deliberate time of day, lighting, sky, weather, and environmental palette.
- Track-specific lighting may shift the scene palette, but the Route Night UI grammar, readability rules, route motif, panel system, and semantic accent hierarchy remain consistent across tracks.
- Approved avatar likenesses, kart silhouettes, item identities, race authority, gameplay balance, and track topology remain protected.

### Implementation consequence

The art-direction gate is closed. Bulk production UI styling may now proceed in Route Night. External PBR material imports remain subject to the provenance and performance rules in this document. The next bounded engineering step remains settings/persistence architecture + graphics presets + audio mixer skeleton, followed by material-coordinate infrastructure and the first Circuit Alpha PBR pass.
