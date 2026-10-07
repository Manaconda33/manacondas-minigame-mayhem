# Task 9 — Neon Grid Course-Wide Visual Completion Plan

**Status:** DRAFT FOR OWNER REVIEW — planning only  
**Date:** 2026-10-06 America/Chicago  
**Scope:** Stage 4 Task 9 only — extend the approved Task 8 visual language across Neon Grid and complete lifecycle/performance/full-course review gates.  
**Core principle:** “spectacle as camouflage — mask the door, light the keyhole.”

This document is a proposed implementation contract. Recording it does **not** authorize Task 9 implementation, PR #242 merge, production publication, or production adoption of the temporary 300 m far-plane clamp.

## 1. Repository / runtime baseline

- Default branch: `main`.
- Active Neon Grid branch: `design/neon-grid-circuit-02`.
- PR #242: draft/open/unmerged.
- Governing PRD: v1.1, approved implementation amendment 2.24.
- Task 8 Falls Run representative stretch: implemented and render-readiness validated.
- Task 8 hosted structural evidence: 124 max draw calls, 80,772 max visible triangles, zero render errors in the accepted render-gate run.
- Hosted SwiftShader FPS/p95 are diagnostic-only; PRD hardware targets remain unchanged.
- 300 m far-plane test slice: owner visual/playability review passed for clipping and the corrected 2D-driver/wet-road compositing issue.
- Production adoption of the 300 m clamp remains **not authorized**.
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

If the rendered scene exceeds 200 calls or 300k visible triangles, optimize batching/material families before owner preview. Do not consume the PRD hard ceiling by default.

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

### 900 m vs temporary 300 m camera policy

Task 9 must **not rely on the 300 m clamp to pass** unless production adoption is separately approved.

Primary Task 9 acceptance should use the authoritative runtime camera policy in effect at the time of implementation. Until another owner decision, that remains the existing production 900 m behavior.

A secondary 300 m diagnostic may be captured for comparison, but it is not a substitute for the primary acceptance run.

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

## 14. Approval gate

**Do not implement Task 9 from this draft until Manny approves the plan.**

Approval authorizes T9.0 only as the first bounded implementation checkpoint. Later checkpoints proceed in order, with regressions fixed before advancing.

---

**Planning note:** the accepted 300 m test slice may inform a later separate production-camera decision, but Task 9 is deliberately planned so its visual completion and performance evidence do not depend on that stopgap.
