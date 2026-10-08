# Task 9 — Neon Grid Course-Wide Visual Completion Plan

**Status:** APPROVED FOR EXECUTION — owner approved 2026-10-06 America/Chicago  
**Date:** 2026-10-06 America/Chicago  
**Scope:** Stage 4 Task 9 only — extend the approved Task 8 visual language across Neon Grid and complete lifecycle/performance/full-course review gates.  
**Core principle:** “spectacle as camouflage — mask the door, light the keyhole.”

This document is the approved Task 9 implementation contract. Approval authorizes the bounded Task 9 sequence beginning with T9.0 and pre-integration asset creation/review. It does **not** authorize PR #242 merge or final Neon Grid production publication.

## 1. Repository / runtime baseline

- Default branch: `main`.
- Active Neon Grid branch: `design/neon-grid-circuit-02`.
- PR #242: draft/open/unmerged.
- Governing PRD: v1.1, approved implementation amendment 2.24.
- Task 8 Falls Run representative stretch: implemented and render-readiness validated.
- Task 8 hosted structural evidence: 124 max draw calls, 80,772 max visible triangles, zero render errors in the accepted render-gate run.
- Hosted SwiftShader FPS/p95 are diagnostic-only; PRD hardware targets remain unchanged.
- 300 m far-plane test slice: owner visual/playability review passed for clipping and the corrected 2D-driver/wet-road compositing issue.
- The 300 m Neon Grid far-plane clamp is **owner-approved for production adoption** as of 2026-10-06 after clipping and compositing review. The approval is recorded separately; until the runtime deployment commit lands, the live production game may still contain the previous 900 m value.
- Task 8 accepted range approximately progress 0.70–0.85 remains visually frozen except for seam-safe refactors proven equivalent.

Authoritative design references:

- `docs/design/neon-grid/stage-4-visual-design.md`
- `docs/design/neon-grid/track-concept-art.webp`
- `docs/design/neon-grid/task8-falls-run-target-wide.webp`
- `docs/design/neon-grid/task8-dive-gap-target-pov.webp`
- accepted Task 7 Waterfall Dive and Task 8 Falls Run runtime presentation.

## 2. Task 9 outcome

Finish Neon Grid as one coherent nighttime city circuit while preserving the gameplay and approved Task 8 representative stretch.

Course identity by sector:

| Sector | Progress | Visual identity |
| --- | ---: | --- |
| Skyline Straight | 0.000–0.24655 | cyan elevated expressway, speed, long sightlines, skyline, signage saturation |
| The Undercity | 0.24655–0.46154 | magenta technical alleys, pipes/clutter, work lights, close urban walls |
| Falls Run | 0.46154–1.000 | gold/cyan climbing highway, waterfalls, mist, vertical drama |

Task 9 extends, rather than replaces, the Task 8 language.

## 3. Frozen / out-of-scope

Task 9 MUST NOT change:

- kart physics, controller behavior or stats;
- items or item probabilities;
- AI driving behavior or shortcut attempt rates;
- checkpoint/lap authority;
- shortcut timing/balance;
- Billboard ON/OFF behavior, 0.82 retention, +3.6 s phase or entrance boost;
- Service Tunnel geometry/handling;
- Waterfall Dive gameplay geometry, 1.5 s recovery or accepted spillway presentation;
- repaired 5.3 road-contact faces;
- tokens;
- rain physics or wet-weather handling;
- audio;
- production far-plane policy;
- the cross-minigame render-workload architecture.

Task 9 may organize Neon Grid visual content into logical local groups, but it may not introduce visibility/LOD behavior that belongs to the separately governed render-workload initiative.

## 4. Presentation architecture

Do **not** create one new course-length decorative mesh.

Use logical sector/local presentation owners:

- `SkylineVisual` — Sector 1 only.
- `UndercityVisual` — Sector 2 only.
- existing `FallsRunVisual` — accepted Task 8 stretch remains its authority.
- `FallsRunExtensionVisual` — Sector 3 outside the accepted Task 8 range.
- small shared Neon Grid visual helpers for procedural ribbons, instance placement and owned-material cleanup.

These groups are presentation-only. They do not own collision, surface classification, track projection, checkpoints or shortcut state.

Logical grouping is intentional future-proofing, not authorization for runtime distance culling.

## 5. Course-wide visual systems

### 5.1 Sky / horizon

Reuse the approved Task 8 full-night sky/horizon treatment as the single global backdrop.

- no duplicate sector skies;
- no new texture assets;
- no true volumetric atmosphere;
- no real-time reflection probes;
- keep the sky an explicit global presentation object.

### 5.2 Road treatment

Extend the approved fake wet-asphalt language outside the Task 8 range.

- Sector 1: restrained cyan-biased streaks.
- Sector 2: lower-intensity magenta-biased streaks so hairpin readability wins.
- Sector 3 outside 0.70–0.85: cyan/gold language matching the accepted stretch.
- Low quality: omit wet-streak overlay.
- Medium: reference treatment.
- High: density/intensity only, no extra road mesh.
- Every transparent road overlay must render before kart-mounted 2D driver sprites and retain depth testing.

The accepted 0.70–0.85 wet-road pass is not visually retuned.

### 5.3 Road-edge / rail language

- Skyline: cyan luminous edges and sparse gold safety accents.
- Undercity: magenta edge/wayfinding accents, reduced bloom intensity.
- Falls Run: cyan edges with gold reserved for intentional directional/tell moments.
- Do not let decorative gold compete with the Waterfall Dive gold tell.

### 5.4 Elevated structure

Sector 1 and elevated/climbing Sector 3 receive dark structural mass:

- fascia / under-deck shadow massing;
- instanced pylons;
- instanced or merged cross-bracing;
- no new collision.

Sector 2 remains street-level and should not inherit elevated-highway structure.

### 5.5 City base

Use dark silhouette towers/building masses plus instanced emissive windows.

Proposed reference counts, subject to budget validation:

| Quality | Skyline windows | Undercity windows | Falls extension windows |
| --- | ---: | ---: | ---: |
| Low | ~120 | ~80 | ~80 |
| Medium | ~240 | ~160 | ~160 |
| High | ~360 | ~240 | ~240 |

Use one instanced tower set and one instanced window set per visual region/material family where practical. No bespoke building textures are required.

### 5.6 Shortcut masking

The mask must remain cheaper than the tell.

**Billboard Gap / Skyline**
- signage saturation across the surrounding expressway/plaza grammar;
- procedural/instanced ad boards and infrastructure signs;
- existing Paprika hologram/flicker tell remains unchanged and readable at speed;
- ordinary signage must not mimic the exact tell cadence.

**Service Tunnel / Undercity**
- repeat pipes, utility boxes, barriers/dumpster-like block props, simple procedural glow marks and work-light grammar throughout the sector;
- tunnel mouth becomes one dark utility opening among many;
- existing magenta work-light/drip tell remains readable;
- no prop may narrow the physical race corridor or create collision.

**Waterfall Dive / Falls Run**
- preserve the accepted Task 8 twelve-fall district in 0.70–0.85 exactly;
- add lower-contrast ambient deck-edge falls outside that range with separate instances;
- no added ambient fall receives gold;
- gold chevrons, broken rail and landing marker remain the unique dive tell.

## 6. Proposed asset / batch inventory

All entries are procedural or existing-runtime reuse; no new binary runtime art is required.

| System | Planned batching |
| --- | --- |
| Skyline wet road | 1 transparent mesh |
| Skyline edge/rail light geometry | 1–2 merged meshes |
| Skyline fascia | 1 merged mesh |
| Skyline pylons/braces | 1–2 InstancedMeshes |
| Skyline towers/windows | 2 InstancedMeshes |
| Skyline signs/ad boards | 1–2 InstancedMeshes |
| Undercity wet road | 1 transparent mesh |
| Undercity edge/wayfinding accents | 1 merged mesh |
| Undercity building/alley massing | 1–2 InstancedMeshes |
| Undercity pipes/utility clutter | 1–2 InstancedMeshes |
| Undercity work lights/glow panels | 1 InstancedMesh |
| Falls pre/post wet road | 2 local transparent meshes maximum |
| Falls pre/post structure | 1–2 merged/instanced groups |
| Falls extension towers/windows | 2 InstancedMeshes |
| Falls extension waterfalls/foam/mist | 3–4 InstancedMeshes |
| Course signage / chevrons outside accepted tells | instanced by material family |

Task 8 accepted meshes remain in place rather than being rebuilt merely to reduce file count.

## 7. Draw-call / geometry budget

PRD hard cap remains **≤250 draw calls** with visible triangles **≤750,000**.

Latest accepted Task 8 hosted structural evidence:
- max draw calls: **124**;
- max visible triangles: **80,772**.

Proposed Task 9 engineering ceilings:

- canonical Medium eight-racer rendered scene: **≤200 max draw calls**;
- visible triangles: **≤300,000**;
- retain at least **50 draw calls** and **450,000 triangles** of PRD headroom.

These are engineering headroom targets for this plan, not PRD replacements.

Planning allowance:

| Addition | Working allowance |
| --- | ---: |
| Skyline course-wide dressing | +18 calls |
| Undercity course-wide dressing | +20 calls |
| Falls Run outside Task 8 | +12 calls |
| lifecycle/debug-safe seams / material-family overhead | +8 calls |
| bloom/transparency variability reserve | +18 calls |
| Task 9 working ceiling | **200 total** |

For T9.5 full-course rendering, 200 calls remains the **optimization target** and 220 is the **owner-approved blocking maximum**; report every call above 200. The 300,000 visible-triangle engineering ceiling, 250/750k PRD hard limits and separate sector A/B limits are unchanged. Batch and optimize before owner review where possible.

## 8. Lifecycle contract — failing-first

Before course-wide dressing is implemented, add failing tests that require:

1. **Owned-resource cleanup**
   - Task 9-owned geometries/materials dispose exactly once;
   - borrowed gameplay geometry/materials/textures are never disposed by presentation owners.

2. **Finite transforms**
   - every instance matrix and generated vertex is finite;
   - no NaN/Infinity after repeated create/update/dispose cycles.

3. **Bounded counts**
   - Low/Medium/High instance counts are exact or upper-bounded;
   - quality changes never spawn unbounded particles/lights/windows.

4. **Pause / hidden freeze**
   - animated presentation uses race-time authority;
   - paused/hidden state does not accumulate visual simulation time;
   - resumed animation continues without a wall-clock jump.

5. **Quality bypass**
   - Low omits wet-road streak overlay and highest-cost atmospheric dressing;
   - Medium is the reference tier;
   - High may increase density, not add a separate rendering architecture.

6. **Transparent compositing safety**
   - all wet-road overlays render before kart-mounted driver sprites;
   - depth test remains enabled and depth writes remain disabled.

7. **Accepted-feature preservation**
   - Billboard, Tunnel, Dive, four main boost pads and Billboard boost remain present;
   - Task 8 accepted range retains its named visual groups and instance counts;
   - no gameplay/surface/checkpoint data changes.

## 9. Masking / readability acceptance

From the normal chase camera at race speed:

- each shortcut mask reads as ordinary city grammar before it reads as a shortcut;
- each existing tell remains discoverable and unambiguous;
- road edges remain legible on mobile;
- driver sprite/action remains readable over wet-road treatment;
- decorative signage never overpowers checkpoint/route readability;
- Undercity clutter does not visually close the drivable corridor;
- ambient waterfalls do not steal the Waterfall Dive gold tell.

Rear-view camera must also be checked for clipping/compositing regressions.

## 10. Performance evidence

### Hosted CI: blocking structural/readiness evidence

Use a course-wide rendered fixture with Medium, eight racers and 1920×1080.

CI blocks on:

- zero page/console/shader errors;
- valid 1920×1080 evidence;
- eight racers present;
- at least 300 scored frames with finite timing instrumentation;
- ≤250 draw calls;
- ≤750k visible triangles;
- Task 9 engineering ceilings reported separately;
- deterministic instance/resource counts within declared bounds.

Hosted SwiftShader FPS/p95 are retained as diagnostic-only, matching the Task 8 methodology.

### Representative hardware: PRD certification

The unchanged PRD targets remain:

- Medium 1920×1080 median ≥60 FPS;
- p95 frame time ≤18.3 ms;
- no sustained pathological >50 ms sequence under normal race load.

These require representative hardware evidence and may not be inferred from CI.

### Production camera policy

The owner has approved the Neon Grid-only **300 m far-plane clamp for production adoption**. Task 9 should therefore use 300 m as the intended Neon Grid camera policy once the approved clamp is applied to the canonical runtime. Circuit Alpha remains unchanged.

The clamp is still a temporary mitigation under the render-workload governance plan and must retain its documented removal/re-evaluation condition at Neon Grid Phase V2. Task 9 may not generalize 300 m into a platform-wide or future-minigame default.

## 11. File-by-file plan

### New

- `src/game/track/SkylineVisual.ts`
  - Sector 1 course-wide presentation and Billboard mask grammar.

- `src/game/track/UndercityVisual.ts`
  - Sector 2 course-wide presentation and Service Tunnel mask grammar.

- `src/game/track/FallsRunExtensionVisual.ts`
  - Sector 3 presentation outside the frozen Task 8 range.

- `src/game/track/NeonGridVisualCommon.ts`
  - Neon-Grid-specific procedural geometry/material/instance helpers only;
  - no gameplay logic and no cross-minigame visibility architecture.

- `tests/neon-grid-stage4-task9.test.ts`
  - lifecycle, bounds, quality, compositing, preservation and masking-structure tests.

- `tools/diagnostics/neon-grid-course-render.mjs`
  - full-course eight-racer render/readiness capture.

- dated Task 9 evidence directory under `docs/evidence/`.

### Modify

- `src/game/track/createNeonGridScene.ts`
  - mount the new presentation groups only.

- `src/game/track/FallsRunVisual.ts`
  - only seam-safe helper extraction / lifecycle conformance;
  - accepted Task 8 visuals must remain equivalent.

- `docs/TESTING.md`
  - record Task 9 lifecycle/render/performance procedure.

- `docs/IMPLEMENTATION-STATUS.md`
  - record each bounded checkpoint and final owner gate.

- `docs/DECISIONS.md`
  - only if implementation creates a durable technical decision not already covered by this approved plan.

No Task 9 change is planned for `NeonGrid.ts`, shortcut physics modules, kart tuning, AI, items, lap/checkpoint code or global renderer ownership.

## 12. Implementation sequence after owner approval

### T9.0 — Freeze baseline and write failing lifecycle tests
- capture current Task 8 group/count/budget baseline;
- add failing lifecycle/compositing/quality tests;
- no visual expansion yet.

### T9.1 — Shared Neon Grid presentation helpers
- extract only genuinely repeated procedural helpers;
- prove accepted Task 8 output remains unchanged;
- no culling/LOD behavior.

### T9.2 — Skyline Straight
- wet road / cyan edge language;
- elevated structure and skyline;
- signage-saturation mask around Billboard;
- capture chase-camera readability and budget delta.

### T9.3 — The Undercity
- wet road / magenta edge language;
- alley/building mass, pipes, utility clutter and work-light grammar;
- preserve Service Tunnel tell and corridor readability;
- capture chase-camera readability and budget delta.

### T9.4 — Falls Run extension
- extend road/structure/city/waterfall language outside 0.70–0.85;
- preserve the accepted Task 8 stretch byte/geometry behavior where practical and visual equivalence absolutely;
- preserve Waterfall Dive gold tell hierarchy.

### T9.5 — Full-course lifecycle + masking pass

**Approved T9.5 scope refinement (2026-10-07 America/Chicago):** In addition to the validation requirements below, Manny explicitly approved a proactive but bounded **visual-enhancement pass**. Inspect the full course and improve presentation where doing so deepens supported architecture, sector identity and mask legibility. Initial additions target facade-mounted industrial ventilation in the Undercity and support-attached deck service fixtures in the Falls extension; they are procedural, non-colliding and remain owned by the existing sector groups. No new 2D assets, gameplay, physics, AI, shortcuts, checkpoint changes or camera policy changes are approved. Quantify batch counts and render costs, preserve Task 8 accepted visuals, and publish an isolated pinned preview for owner acceptance. This amendment does not move the separately recorded Skyline building-geometry or city-base polish out of T9.7, and does not replace the dedicated T9.6 representative-hardware performance gate.

- cleanup tests;
- quality-tier bounds;
- pause/hidden freeze;
- chase/rear-view shortcut-mask review;
- mobile readability.

### T9.6 — Performance/readiness evidence
- full validation;
- production build;
- hosted course-wide eight-racer render-readiness gate;
- draw-call/triangle/resource accounting;
- representative-hardware PRD measurement.

### T9.7 — Pinned owner preview
- publish exact source;
- hash verify;
- confirm production bytes unchanged;
- owner drives the full course on the pinned preview;
- resolve only Task 9 visual/readability defects.

**Deferred Skyline polish from the owner-approved corrected T9.2 preview (2026-10-07):**
- bring the remaining previously generated Skyline building masses that still read as elongated rectangular prisms into the same stepped / roof-capped / multi-face architectural geometry language used by the improved buildings around Billboard Gap; preserve instancing/batching, all drivable-route and shortcut clearances, and the Task 9 structural budget;
- add a presentation-only city ground/base treatment beneath the Skyline building field so the city reads as physically grounded rather than as towers floating in open space; this must not add gameplay collision, alter track/shortcut geometry, or compromise road/driver readability;
- these are **deferred T9.7 visual-polish requirements, not a rejection or reopening of T9.2**. The corrected T9.2 owner preview is accepted. Do not implement these items earlier unless Manny explicitly reprioritizes them.

### T9.8 — Stage 4 stop
After owner full-course approval, record evidence and STOP. PR #242 production merge/release remains a separate explicit owner gate.

## 13. Acceptance criteria

Task 9 is complete only when all are true:

- lifecycle tests pass;
- no Task 8 accepted visual regression;
- course-wide visual language is present across all three sectors;
- Billboard, Tunnel and Dive masking doctrine works from chase camera;
- shortcut tells remain readable;
- mobile road/driver readability passes;
- no gameplay/physics/balance/checkpoint changes;
- draw calls ≤250 and visible triangles ≤750k;
- proposed engineering ceilings are met or any exception is explicitly reviewed;
- representative-hardware 60 FPS / p95 ≤18.3 ms evidence is recorded;
- full validation/build green;
- pinned preview source/hash verified;
- owner full-course visual/playability approval recorded.

## 14. Approval and asset-review gate

**Owner approval:** Manny approved this Task 9 plan on 2026-10-06 America/Chicago and authorized execution beginning with T9.0 plus pre-integration asset creation/review.

**2D asset rule:** any new 2D billboard/ad/sign artwork must be presented to Manny **one asset at a time**, together with its exact intended in-game use, before it may be integrated into runtime code or the asset manifest. Rejected or unapproved candidates remain review-only and must not enter the game.

3D/procedural engineering assets may proceed under the approved Task 9 plan unless they materially alter product direction, gameplay, or an existing owner-approved visual.

PR #242 merge and final Neon Grid production publication remain separate explicit owner gates.

---

**Planning note:** the production-approved 300 m Neon Grid clamp is a temporary mitigation, not the long-term render-workload architecture.


## Appendix A — 2D asset approvals

### Asset 1 — Skyline masking billboard “Manaconda Racing”

- **Status:** OWNER APPROVED, 2026-10-06 America/Chicago.
- **Use:** static Sector 1 Skyline Straight city-advertising mask near Billboard Gap.
- **Role:** increase signage saturation without becoming a shortcut tell.
- **Restrictions:** no gameplay information; no state/flicker semantics; no reuse as the Paprika/Arin/Raven tell; no gold directional/tell treatment.
- **Integration:** approved only after creating a faithful clean runtime derivative from the accepted artwork.
- **Next asset:** must be presented separately with intended use before integration.


### Asset repository preservation

Asset 1 is durably preserved at:

- source PNG: `docs/design/neon-grid/assets/task9/billboards/manaconda-racing-v1-source.png`
- 1024×512 WebP derivative: `docs/design/neon-grid/assets/task9/billboards/manaconda-racing-v1.webp`
- preservation commit: `16b25c83fe9b81471f1a9b17b8c7bd6a02a0393f`

The source PNG SHA-256 is `2f8cacacb6c2cefc4f4ef28fcb2cf0a36fd27a10f4cb6650e5cad014b5fc007f`; the WebP SHA-256 is `481feb4ff34635abad29dd4f65b39975e73c227eb0a53901a51028c5e9fe7d22`.

Repository preservation does not itself equal runtime integration.

### Asset 2 — Skyline masking billboard “Taco Bell / Live Más”

- **Status:** OWNER APPROVED, 2026-10-07 America/Chicago.
- **Use:** static Sector 1 Skyline Straight city-advertising mask in the ordinary signage field near Billboard Gap.
- **Role:** satisfy the approved Taco Bell-related signage requirement and increase neon sponsor saturation without becoming a shortcut tell.
- **Restrictions:** static only; no gameplay information; no ON/OFF or flicker semantics; no reuse of the Paprika/Arin/Raven tell cadence; no gold directional/tell treatment.
- **Integration:** repository preservation is approved. Runtime placement remains part of Task 9 execution and must preserve Billboard tell readability and all accepted balance/behavior.

### Asset 2 repository preservation

Asset 2 is durably preserved at:

- normalized 1024×512 source PNG: `docs/design/neon-grid/assets/task9/billboards/taco-bell-live-mas-v1-source.png`
- 1024×512 WebP derivative: `docs/design/neon-grid/assets/task9/billboards/taco-bell-live-mas-v1.webp`
- preservation commit: `db8e83c87c7e021ec83e12b21e3d6caf0a294de9`

The source PNG SHA-256 is `7e66ea3fda8d8db1fdc5dc33d7f7a734eb63fbe22a69641a2b5aec6c5e849b14`; the WebP SHA-256 is `d289bc4dbc10872d6c75aa4ae650aaf716bf83a9ea36da12ce0cdc021e7bea7e`.

Remote Git blob verification matched the local objects exactly: source `5a5dca06d0ea3e917cd14564123619e9ee8b0ef7`, WebP `e958b04842ff4f98d252b0abf0ba7c7d26834bcc`.

Repository preservation does not itself equal runtime integration.

- **Next asset:** must be presented separately with intended use before integration.


### Asset 3 — Undercity masking billboard “Nightshift Noodles”

- **Status:** OWNER APPROVED, 2026-10-07 America/Chicago.
- **Use:** static Sector 2 Undercity city-advertising mask near the Service Tunnel, embedded in the ordinary magenta utility-signage field.
- **Role:** make the tunnel entrance read as one ordinary service opening among many while adding dense late-night commercial texture.
- **Creative:** fictional late-night ramen brand, exact headline “NIGHTSHIFT NOODLES” with “OPEN AFTER DARK,” hero ramen bowl, magenta/violet/deep-indigo palette with restrained cyan.
- **Restrictions:** no racing imagery, cars/karts, snakes/mascots, checkered flags, crowns, Manaconda branding, arrows, chevrons, route guidance, shortcut hints, ON/OFF language, flicker-state semantics or gold/yellow directional treatment.
- **Integration:** repository preservation is approved. Runtime placement remains part of Task 9 execution and must preserve Service Tunnel tell readability and corridor clarity.

### Asset 3 repository preservation

Asset 3 is durably preserved at:

- normalized 1024×512 source PNG: `docs/design/neon-grid/assets/task9/billboards/nightshift-noodles-v1-source.png`
- 1024×512 WebP derivative: `docs/design/neon-grid/assets/task9/billboards/nightshift-noodles-v1.webp`
- preservation commit: `57cde78ca29ce3aecbc274fdc8bf16eff69016a5`

The source PNG SHA-256 is `cff2b17cdae290746564689e63351f01bd7eef0cdda25b5ade0ebc3560e7e2f7`; the WebP SHA-256 is `76fc1f75778c757cd979ff78641844cbf1d3955ec6dff7cc8145289dda45373a`.

Remote Git blob verification matched the local objects exactly: source `6917d3a5446ac3956373e8bbce8c91e6f85fa8c3`, WebP `ec4239fb58c0c1d81e961f49ee9d6bbf446700bb`.

Repository preservation does not itself equal runtime integration.

- **Next asset:** must be presented separately with intended use before integration.

### Asset 4 — Undercity masking billboard “Voltline Industrial”

- **Status:** OWNER APPROVED, 2026-10-07 America/Chicago.
- **Use:** static Sector 2 Undercity industrial-services billboard in the ordinary utility-signage field near, but not directly marking, the Service Tunnel.
- **Role:** deepen the sector's infrastructure identity while keeping the tunnel mouth visually camouflaged among ordinary industrial advertising.
- **Creative:** fictional utility-company campaign featuring the owner-supplied cyberpunk character as spokesperson; exact brand “VOLTLINE INDUSTRIAL,” service line “POWER • AIR • WATER,” and tagline “KEEP THE GRID ALIVE.”
- **Restrictions:** no racing imagery, karts, racetrack cues, snakes/mascots, checkered flags, Manaconda branding, arrows, chevrons, route guidance, shortcut hints, ON/OFF language, flicker-state semantics or gold/yellow directional treatment.
- **Integration:** repository preservation is approved. Runtime placement remains part of Task 9 execution and must preserve Service Tunnel tell readability and corridor clarity.

### Asset 4 repository preservation

Asset 4 is durably preserved at:

- normalized 1024×512 source PNG: `docs/design/neon-grid/assets/task9/billboards/voltline-industrial-v1-source.png`
- 1024×512 WebP derivative: `docs/design/neon-grid/assets/task9/billboards/voltline-industrial-v1.webp`
- preservation commit: `68d5fcadd8b9602d9288cf0c7f8bdef7c46380de`

The source PNG SHA-256 is `87dc1584b0c38eb459eb81086fa26721130439022cfb79826901cd9799fde95f`; the WebP SHA-256 is `19b32b71ee59a0f52860c4a6003057b46e4fde890c4e2d4d390b78ed2ea67863`.

Remote Git blob verification matched the local objects exactly: source `226f92afaad0177bc554d30617e35857f9c7f39e`, WebP `962906f50a55fafbc5a2d5b8a6e1d229fb620316`.

Repository preservation does not itself equal runtime integration.

This completes the currently planned four-billboard Task 9 masking set: two Skyline assets and two Undercity assets. Any additional new 2D artwork still requires the same one-at-a-time owner review gate before integration.



## Owner-approved T9.5 sightline correction (2026-10-08)

The owner rejected the latest corrected preview because the Billboard and Service Tunnel alternate asphalt is openly visible from the normal racing line. The approved bounded repair places opaque, supported, non-colliding facade screens along the road's outer walls rather than relying on detached decorative ad supports or isolated service decoys. Real mouth cuts and all original tells remain clear, both directions remain physically accessible, Task 8's 0.70–0.85 visuals remain frozen, and T9.7 Skyline massing/ground polish remains deferred. Require geometric line-of-sight ray tests at multiple race-line positions, chase/mobile/rear captured frame inspection, full existing regression gates and a fresh pinned preview for Manny's subjective at-speed signoff. A green CI run does not grant owner camouflage acceptance. Only the T9.5 **full-course** maximum changes to **220 calls**, still targeting **200** and reporting any excess; all other draw limits remain unchanged.


### Asset 5 — Service Tunnel holographic warning "DO NOT ENTER"

- **Status:** OWNER APPROVED, 2026-10-08. Approval was given to the standalone review-only graphic, not T9.5 playability.
- **Visual:** 1024 × 512 transparent PNG with magenta/violet warning borders, triangular caution symbols, title **DO NOT ENTER**, and subtitle **RESTRICTED SERVICE ACCESS**.
- **Source:** exact approved local conversation artifact `neon-grid-do-not-enter-asset-review.png`; SHA-256 `11e540547d0a60da9db2ae7636e373742dec11c9f440afe08c5e29bdddaa7db4`. Do not treat this as already preserved in GitHub.
- **Use:** the same approved image at the Service Tunnel entrance and exit, presentation only. Both approaches physically open, non-colliding holograms, semi-transparent and locally softened/faded during traversal.
- **Gates:** source/derivative hash and provenance, asset load/fallback and cleanup, bidirectional camera and kart/road visibility, original exterior camouflage, strict CI and separately pinned owner preview. No redesign or other new artwork is approved by this signoff.
- **Integration status:** pending byte-safe repository preservation and exact-head validation, no in-game acceptance yet.



**Asset 5 implementation candidate (2026-10-08):** Owner-approved exact 1024×512 transparent PNG has been committed byte-for-byte as Git blob `6d1275e9266dc5bd16a78de0a8d91aeead463369` to archival and runtime paths, with a narrowly scoped non-LFS runtime exception. Two non-colliding semi-transparent holograms use the original image at both Service Tunnel portals; their per-kart alpha fades to zero at the legal mouth and restores outside the clearance radius. Asset signature tests, type/lint/full regression, published pinned runtime and owner at-speed approval remain separate gates. Neither acceptance nor production merge is implied.
