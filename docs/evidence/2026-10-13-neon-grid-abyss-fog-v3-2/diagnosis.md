# V3.2 source diagnosis — before implementation

**Baseline:** V3.1 branch checkpoint `f2619565c9a962623dd8c692aa3a3639a2906046`.

**Inspection:** reviewed the matched V3.1 capture report and its three diagnostic views, then traced each reported object to its builder and fog profile. This record precedes runtime edits.

## Exposed building bottoms

- The V3.1 `undercity-building-bottom` diagnostic targets instance 1 of `undercity-city-buildings`. Its reported lower face is at world Y `-27.85`, with a 30 m instance height and 39.66 m camera-to-subject distance. `UndercityVisual.ts` creates these as 16 instanced building boxes and the scene-level fog profile reaches its dense point at 20 m below the main road.
- `undercity-industrial-architecture` batches six box parts per building. Its `foundations` range is instances `[0,16)`; each pad is 8.6 m tall, centered 4.25 m below its building base. The screenshot and scene metadata confirm these are presentation architecture, not colliders.
- Both meshes are already fog targets, but the V3.1 shader clamps the final material-to-fog mix at **0.97**. At depth beyond `denseBy`, three percent of the original face color remains, enough to outline the flat underside against the mist. Extending a visible bottom without removing that residual would only move the same hard edge.

## Skyline support endings

- The `skyline-support-pylon` diagnostic targets instance 6 of `skyline-pylons`: an instanced `BoxGeometry(1.2, 11, 1.2)` scaled to 58 m. Its measured roadway height is `14`, and its straight lower cap is at `-44` (58 m below the deck).
- The support is already beneath Skyline's 38 m dense-fog depth and the mesh is a fog target. Its visible straight cap is therefore consistent with the same 0.97 maximum blend, rather than insufficient support length. The support count and road connection are correct and must stay unchanged.

## Roadway side panels

- `undercity-wallside-sightline-screens` is one opaque, presentation-only merged mesh. Its sources are: (1) roadside safety/sightline screen panels, (2) the camera-facing service-tunnel approach wing, and (3) city-ground triangles. In V3/V3.1 the ground triangle range is suppressed, leaving the required panels. The mesh has no collision; its adaptive opening intervals, mouth cuts and route-facing camouflage are authored in `UndercityVisual.ts` and must be preserved.
- `neonGridRoadsideScreenGeometry()` currently makes each roadside panel from vertical offset `-1.0` to its top (`1.8` m in Undercity V3). The screen-specific V3.1 fog profile is clear through `-2`, visible by `2`, and dense by `16` m below road. Thus the panel physically ends before the dense part of the profile and its lower edge receives only a partial fog blend.
- The service-tunnel approach wing is part of the same merged draw; it currently starts `0.9` m below tunnel centerline. The service opening/refinement logic is essential for shortcut visibility and will not be changed.
- The open-bridge `skyline-deck-fascia` combines the authored lower deck fascia, roadside sightline panels, Billboard Gap wings, and suppressed city-ground ranges. Its lower deck edge is at `-7.5` m; Skyline's shared profile only starts at 4 m below road and becomes dense at 38 m. It therefore ends while still visually distinct. The track route, physical side walls, Billboard opening indices and geometry-range ownership are separate and remain unchanged.

## Selected narrow correction

The source review shows that extension geometry is unnecessary and would create avoidable risk to merged screen openings, tunnel masking and billboard-gap presentation. V3.2 therefore keeps the complete V3.1 geometry and instance transforms unchanged.

The first fixed-camera render exposed a second issue that geometry metadata alone could not show: an underside at `#3d5165` was meeting nearby lower haze at about `#243543`. The V3.1 shader's 0.97 cap left a small source-color residue, and fully blending to its standard `#3e5266` target still produced a bright, flat underside. The diagnostic sample at `(600, 530)` changed from `#3d5165` in V3.1 to `#243543` in V3.2; the adjacent open haze at `(600, 550)` was also `#243543` in the V3.2 image.

The selected correction is limited to the fog shader on seven already-fogged termination meshes. V3.2 allows these lower-world targets to reach a local dark-haze color (`#243543`) after their object-specific depth profile saturates. The established `#3e5266` color remains the near and middle fog target; only the final lower depth blends toward the darker color. Skyline buildings, supports and Undercity buildings retain their V3.1 depth profiles; the local terminal-color transition removes both the 3% material residue and the mismatched bright edge.

Two merged presentation meshes also need a local depth profile because their visible lower edge occurs much closer to the road than the district-wide dense-fog range:

- `undercity-wallside-sightline-screens`: maintain a clear upper wall and openings, then progress from clear at 0.5 m above road to dense by 0.95 m below road, matching the existing panel bottom at 1 m below road. Its distance profile and all mesh vertices, indices, cuts and openings remain unchanged.
- `skyline-deck-fascia`: retain clear road-adjacent surfaces, then progress from clear at 1 m below road to dense by 7.25 m below road, just above the existing fascia edge at 7.5 m. Its merged geometry and Billboard Gap geometry ranges remain unchanged.

This approach changes no building dimensions, pylon lengths, supports, screen boundaries, material transparency, collision, route or shortcut behavior. The V3.1 selector remains unchanged, and the approved T9.7 baseline, B2, V3 and V3.1 source checkpoints are preserved. V3.2 is an opt-in variant using the same V3.1 environment composition.

Before calling the correction successful, the three original camera transforms and four chase-camera anchors will be replayed against V3.1 and V3.2. Any screen that obscures a tunnel opening or any lower edge that remains visible is a failure, regardless of mesh metadata. Tests compare the affected mesh buffers and instance matrices to prove that the correction does not edit or lengthen geometry.

## Original diagnostic references

- [Undercity building bottom](../2026-10-13-neon-grid-abyss-fog-v3-1/diagnostics/angles/undercity-building-bottom.png)
- [Undercity side screens](../2026-10-13-neon-grid-abyss-fog-v3-1/diagnostics/angles/undercity-side-screens.png)
- [Skyline support pylon](../2026-10-13-neon-grid-abyss-fog-v3-1/diagnostics/angles/skyline-support-pylon.png)
- Source measurements and camera transforms: [V3.1 angle report](../2026-10-13-neon-grid-abyss-fog-v3-1/diagnostics/angles/report.json)
