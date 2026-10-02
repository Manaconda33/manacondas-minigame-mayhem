# Neon Grid — Stage 1 build contract for owner review

**Status:** Refined geometric proposal; owner shape/token review pending. This is a design checkpoint, not playable or production acceptance.

**Shape correction, 2026-10-02:** Manny rejected the gentle switchbacks and supplied the original guide showing long crosswise alley straights and tight reversing bends. This revision restores that geometry; token rules remain proposed.

Manny approved native execution of the five-stage plan on 2026-10-02. This checkpoint prepares Task 1's review artifact before the shared track/runtime work. Read `NEON-GRID-SPEC.md`, `layout.svg`, and `layout.json` together. The supplied `track-layout.html` remains the original schematic; `layout.svg` is the refined dimensional course.

## Intended driving experience

The race starts on a 14 m skyline deck, with three boost pads leading into the broad elevated sweeper and smashable billboard chord. The course descends into the narrower Undercity, which has tight reversing hairpins and clear alley straights matching Manny's original layout, rather than the rejected gentle S-curve. The road then opens into a long Falls Run, wraps the city base, and climbs past a localized broken-road jump back toward the skyline.

Use the reference images for city scale, luminous edge/sign language, dark reflective asphalt, waterfalls and mist. Those references do not authorize rain physics or copying their pictured kart. Preserve the approved racers and all existing physics/stat/item values.

## Geometry authority

- Exact proposed control points, sector boundaries, gate positions/tangents, pad centers, and token anchors are in `layout.json`; regenerate with `python build_layout.py` using Python 3, numpy and matplotlib.
- The script uses closed centripetal Catmull–Rom interpolation and 4,096 divisions for dense geometric measurement. It also reports a 200-division estimate comparable to Three.js's default arc-length cache. Runtime Three.js verification is still required.
- Dense main length: **1,450.001 m**. 200-division estimate: **1,448.938 m**. Both satisfy 1,400–1,500 m.
- Runtime topology remains 384 equally spaced samples, approximately **3.776 m** spacing. Scene/collider tessellation may be denser where narrow corners need it; topology count is not a cap on collision detail.
- Sector 1: progress 0–0.24655, half-width 6 m; descent is included before the Undercity entry. Sector 2: 0.24655–0.50856, half-width 4.5 m. Sector 3: 0.50856–1, half-width 6 m. Blend width changes over approximately 20 m, with walls following the realized profile.
- Gate 0 is the finish crossing 22 m after the grid origin; `checkpointIndices[0]` stays 0 for grid topology. Other indices use the gate sample indices in `layout.json`. Do not move the starting grid to the finish sample by confusing these two contracts.
- Model gate elevation explicitly: proposed half-width 13 m, vertical tolerance 1.5 m around local road height. Task 3 must verify these footprints against real colliders and legal race traversal. Preserve legacy Alpha defaults.

## Shortcut placement

| Shortcut | Forward entry window | Rejoin | Main distance | Proposed alternate path |
|---|---:|---:|---:|---:|
| Billboard Gap | 0.111234–0.116234 | 0.178525 | 97.571 m | 89.103 m plaza chord, deck y≈14 m |
| Service Tunnel | 0.327954–0.332954 | 0.434723 | 154.815 m | 57.212 m entry ramp / straight underground section / exit ramp |
| Waterfall Dive | 0.792717–0.797717 | 0.827030 | 49.754 m | 33.695 m geometric ramp-to-landing chord |

The tunnel's inner two anchors lie at y=-4 m, below the street. Its lateral centerline remains straight; entry and exit ramps connect it to y≈0. Fully wall and roof the drivable tunnel corridor, with headroom verified against the actual kart envelope. The above lengths describe authored polylines, not a finalized curved/collided route.

The dive starts near y=6 m and rejoins near y=9 m. A 34 m chord is a design envelope for a real ballistic jump, not evidence the current kart can clear it. Task 7 must tune ramp/landing geometry with real Rapier launches. Keep the normal climbing line continuous and safe; only the selected shortcut launches across the gap. No teleport or automatic landing correction.

Every path has its own support surface and boundaries. Projection remains owned per racer after a valid forward entry, including when its mapped progress has left the small entry window. Width lookup must retain path context: main-road `halfWidthAt(progress)` must not narrow the main alley to 3.2 m simply because the tunnel shares its progress. A shortcut projection resolves its own 3.2 m half-width (and boundaries); downstream consumers use that local width.

Billboard ON/OFF state comes from authoritative race seconds shared by visuals and tuning. Its `static` multiplier is 0.82 while ON on the shortcut, asphalt acceleration, and no off-road minimum-speed floor. It never blocks passage or repeatedly multiplies velocity by 0.82 each frame. Freeze the 6-second cycle and 0.8-second tells while paused/hidden.

## Checkpoints and recovery

Before/after common-road pairs are **2/3 for Billboard**, **4/5 for Tunnel**, and **8/9 for Dive**. Their entry/rejoin separation along the main curve is approximately 18–25 m. The exact 12 gate locations are in the JSON/drawing.

Geometry checks pass: ordered distinct gates; higher shortcut rejoin progress; no gate inside a skipped progress interval; no extra forward main-curve crossing within any proposed 13 m / 1.5 m gate footprint; all eight geometric main/shortcut path combinations trace gates 1→11→0. This does not prove trigger/collision/lap behavior in the runtime.

All eight shortcut combinations still physically cross gates 1→11→0. No projection or declared exit progress awards a checkpoint. A missed dive recovers on the shared landing approach before gate 9, retains only earned gates, and costs approximately 1.5 race seconds. Preserve paused timers and once-only recovery.

## Boost pads and tokens

Four proposed main-route pad centers: **0.035, 0.060, 0.085, 0.730**. Initial windows are center ±0.0075 and lateral distance ≤4.5 m. These replace the earlier oval's progress locations; align rendered pad footprint and physical boost zone in Task 3/4.

**Proposed token rule for Manny's review:** five collectible markers per racer per lap, with race-local collection count only. No speed, stat, item probability, permanent currency, or unlock effect. Each racer has independent availability; another racer cannot steal the human's token. A marker may count once for that racer during a validated lap and returns only when the next lap begins; reverse crossing and respawn do not refresh it. Cap a completed three-lap race at 15; no post-finish pickups.

Locations: main straight at 0.095; Billboard path midpoint; Tunnel path midpoint; pre-dive climb at 0.745; just after the finish crossing at 0.025. The last marker is also available on the opening lap, which gives each of the three laps the same five opportunities. There is no token on the dive landing. This rule fills the spec's undefined economy; current runtime token behavior has not been established and is not assumed.

## UI, music and balance

- Select kart circuit 01 / CIRCUIT ALPHA or 02 / NEON GRID before driver selection; retain the chosen circuit for restart/replay. Results, minimap, race/final-lap cue selection and loading failures identify that circuit. Keep kart circuit numbering separate from the Hub's minigame route index.
- Use unique `neon-grid-race-loop.wav` and `neon-grid-final-lap-loop.wav` filenames under the approved music delivery structure. The draft's numbered 04/05 filenames conflict with accepted preparation/results music and are superseded. Music/SFX/card assets have their own approval and publication gates.
- Target clean normal-route lap: 62–68 s, an average approximately 21.3–23.4 m/s. This is a measured build target, not a current result.
- Pair same-driver/settings runs to measure savings: Billboard 0.6–0.9 s, Tunnel 1.0–1.4 s, Dive 1.8–2.2 s. Geometry alone cannot guarantee these values. The corrected sharp-hairpin layout gives the tunnel about 98 m of geometric distance saving before corner-speed effects, so it is likely to outperform the original 1.0–1.4 s target; if clean player measurements do so, adjust the shortcut entry/rejoin interval or revise the target with Manny rather than soften the approved hairpin intent or silently impose a new speed limit.
- Replace the independently specified 57–60 s all-shortcut target with **the same driver's normal-route time minus measured paired shortcut savings**, approximately 3.4–4.5 s improvement. The former ranges were inconsistent across the full 62–68 s normal target. If Manny wants a separate absolute mastery target, set it after the blockout measurements.
- AI attempt rate starts at seeded/configurable 35% among usable approach lines; steering/braking/path choice remain physical. No hidden progress, ranking or speed writes. Rocket follows an already selected legal route.

## Review gate and next action

Review the refined course shape and proposed token rule. After acceptance, record the second-track PRD/decision amendment and testing scope, reconcile the branch onto current accepted main, then execute Task 2's shared track contract and Alpha regression checks. No further approval is needed for routine reversible engineering within the reviewed contract. The later visual/preview/production gates in the implementation plan remain in force.

Evidence: `layout.json`, `layout.svg`, `build_layout.py`, and the geometry validation output. No gameplay, Rapier trajectory, device performance, or owner acceptance pass is claimed here.
