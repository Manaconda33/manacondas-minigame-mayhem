# Cross-Minigame Render Workload Governance Plan

**Status:** DRAFT FOR OWNER REVIEW — documentation phase only  
**Date:** 2026-10-05 America/Chicago  
**Branch:** `docs/render-workload-governance-20261005`  
**Implementation authority:** NONE. No runtime, gameplay, visual, physics, balance, asset, deployment, or production change is authorized by this document.

## 1. Why this exists

The current Neon Grid Task 8 diagnostic exposed a platform-level risk rather than merely a track-local defect.

On the same GitHub Actions Chromium software-WebGL runner, with Medium quality, eight racers, 1920×1080, Task 8 visuals OFF, Bloom OFF, shadows unchanged, 60 warmup frames and 360 scored frames:

| Camera far plane | Median frame | p95 frame | Median FPS |
| --- | ---: | ---: | ---: |
| 900 m | 286.3 ms | 343.3 ms | 3.49284 |
| 300 m | 170.5 ms | 212.4 ms | 5.86510 |

Changing only the far plane reduced median frame time by **115.8 ms / 40.45%** and increased median FPS by **67.92%**. These are software-renderer diagnostic numbers, not owner-device certification, but the paired delta is strong evidence that visibility/distance workload materially affects render cost.

The repository already contains three research candidates that describe pieces of the solution:

- **STK-008:** environment distance/perceptual LOD;
- **STK-009:** explicit render-pipeline ownership;
- **STK-010:** feature/pass-level render budgets and diagnostics.

This plan combines them into one reusable cross-minigame contract.

## 2. Goal

Create a shared rendering-governance layer that makes unbounded visibility workload difficult to introduce in any current or future 3D minigame.

The system must answer, deterministically and observably:

1. Which world-space visual regions are eligible to render for the current camera?
2. Which representation / LOD is eligible?
3. Which render passes may consume each visual?
4. Which expensive presentation behaviors may still update?
5. What workload did each pass and feature submit?
6. Did a change violate the declared workload contract?

The platform owns the mechanism. Each minigame owns its visual importance and spatial policy.

## 3. Hard requirements from owner approval

### 3.1 Instrumentation first

**No visibility optimization may be implemented until the measurement layer exists and has captured the pre-optimization baseline.**

The first runtime phase, if later authorized, is diagnostics only. It must not alter object visibility, LOD, camera distance, shadows, bloom, material choice, animation cadence, physics, AI, collision, or gameplay.

Only after the instrumentation checkpoint is reviewed may a visibility system begin changing render eligibility.

### 3.2 Enforcement must be real, not advisory

The final architecture may not depend on contributors remembering a style guide.

It must include executable enforcement capable of failing CI when governed world-space content bypasses the contract or exceeds deterministic workload rules.

Enforcement is staged so existing debt can be migrated without opening a loophole for new debt.

## 3A. Temporary playability stopgap — proposed, not adopted

The architectural program above is intentionally broader than one track and may span multiple implementation checkpoints. That does not require Neon Grid to remain unnecessarily difficult to play while the durable system is built.

A **separate, explicitly temporary Neon Grid far-plane clamp** is therefore proposed as a stopgap candidate.

### Candidate shape

- Scope: Neon Grid only. Do not change Circuit Alpha or establish a global platform default.
- Variable: reduce the Neon Grid race-camera far plane from the current 900 m to **300 m**, because 300 m is the only reduced distance currently backed by controlled paired evidence.
- Preserve: physics, AI, collision, checkpoints, shortcuts, Task 8 visuals, shadows, bloom, materials, quality settings, fog values and gameplay state.
- Do not combine the stopgap with spatial chunking, LOD, shadow-distance changes, post-processing changes or Task 8 optimization. It must remain a one-variable mitigation.
- Publication: no production adoption is implied by this document. A stopgap runtime change requires its own explicit authorization and owner visual/playability gate.

### Why 300 m is the candidate

The controlled software-WebGL diagnostic changed only the camera far plane from 900 m to 300 m and improved median frame time from 286.3 ms to 170.5 ms (-40.45%), with median FPS increasing from 3.49284 to 5.86510 (+67.92%). The absolute software-renderer FPS is not hardware certification, but the delta is large enough to justify testing the clamp as a temporary mitigation.

### Required acceptance before adoption

A stopgap clamp may be adopted only if a locked Neon Grid preview confirms:

1. no gameplay-critical tell, checkpoint, shortcut entrance/exit, hazard cue or required landmark disappears at legal race positions;
2. chase and rear-view cameras do not show unacceptable hard clipping or horizon collapse;
3. the existing fog/sky presentation remains visually acceptable without being retuned as part of the same change;
4. the same one-variable diagnostic still shows a material workload reduction;
5. no accepted 5.3 road-contact, tunnel, billboard or dive behavior changes;
6. Manny explicitly approves the preview.

If 300 m fails visual/playability review, do not silently choose another value. Measure the next candidate as another one-variable diagnostic and repeat the gate.

### Expiry / removal rule

This clamp is a **temporary mitigation, not the architecture**. If adopted, it must carry a tracked removal condition and be reconsidered when Neon Grid completes Phase V2 under the shared visibility system. At that checkpoint:

- the clamp is removed if region-based visibility/LOD provides acceptable workload at the intended authored view distance; or
- any retained far-plane value is re-justified as an intentional visual policy through the shared render-world contract rather than inherited from the stopgap.

The stopgap may not be copied into future minigames as a default solution.

## 4. Core architectural principle

**Gameplay existence and render existence are separate authorities.**

Physics bodies, collision, checkpoints, triggers, race state, AI, scoring, navigation and other gameplay systems continue according to their own contracts.

The render-workload layer controls only presentation:

- render eligibility;
- spatial culling region;
- LOD / representation;
- shadow eligibility;
- transparency eligibility;
- bloom eligibility;
- optional presentation-update cadence;
- diagnostic attribution.

A visual may disappear or simplify without removing the gameplay object it represents.

## 5. Shared ownership boundary

The reusable implementation should live outside the kart-specific `src/game/` namespace, for example:

```text
src/rendering/
  RenderWorld.ts
  RenderRegion.ts
  RenderPolicy.ts
  RenderPipeline.ts
  diagnostics/
    RenderWorkloadSnapshot.ts
    RenderWorkloadAudit.ts
```

Names are provisional. The ownership boundary is not.

Future minigames may use Three.js differently, but a 3D minigame must integrate with the shared contract rather than inventing its own invisible parallel system.

Kart-specific route-sector logic, track IDs, laps, shortcuts and spline progress may not enter the shared layer.

## 6. Render-world contract

A minigame supplies a render-world policy and one or more spatial regions.

Conceptually:

```ts
interface RenderWorldPolicy {
  id: string;
  units: 'meters' | 'world';
  maxRegionSpan: number;
  quality: Record<GraphicsQuality, VisibilityProfile>;
}

interface RenderRegionDescriptor {
  id: string;
  bounds: BoundingVolume;
  class: 'gameplay-critical' | 'world' | 'decorative' | 'backdrop';
  lods: readonly RenderRepresentation[];
  passes: RenderPassEligibility;
  updatePolicy: PresentationUpdatePolicy;
}
```

The exact TypeScript API is implementation-design work, but the semantic requirements are fixed by this plan.

### 6.1 Region rules

- Large spatial worlds must expose independently cullable regions.
- A course-length, arena-length, or map-length mesh may not silently become the ordinary culling unit.
- Region size is governed by the minigame's declared `maxRegionSpan`, not one universal meter value.
- Truly global visuals such as a sky or intentional backdrop require an explicit exemption class.
- Exemptions are named, countable and diagnosable. There is no wildcard "ignore this subtree" escape hatch.

### 6.2 Perceptual LOD

LOD is broader than triangle reduction.

A region may change, by distance/quality:

- geometry density;
- instance density;
- material/shader complexity;
- transparency;
- animation/update rate;
- shadow casting/receiving;
- bloom participation;
- particle activity;
- representation type, including impostor/backdrop;
- complete visual omission where safe.

Gameplay-critical tells may specify stronger minimum visibility guarantees.

### 6.3 Independent distance budgets

The following are separate policies, not aliases:

- camera visibility;
- shadow participation;
- transparent/atmospheric effects;
- bloom participation;
- animated presentation updates;
- decorative particles.

An object being visible does not automatically authorize it to participate in every expensive pass.

## 7. Instrumentation-first implementation sequence

### Phase I0 — Baseline instrumentation only

**Purpose:** Make current workload observable without changing it.

Build shared diagnostics that can capture, at minimum:

- viewport and drawing-buffer dimensions;
- DPR and graphics-quality tier;
- camera near/far values;
- submitted draw calls and triangles by named render stage;
- render-target dimensions and aggregate pixels processed;
- shadow-caster root/object counts;
- transparent object/instance counts;
- bloom-eligible object/material counts;
- active animated presentation systems where practical;
- scene/world-space object inventory;
- object/region bounding volume and span;
- commit SHA, minigame ID, fixture ID and feature-toggle metadata;
- CPU frame timing and GPU timing when the browser exposes a reliable mechanism;
- software-renderer paired timing only as relative diagnostic evidence.

**Required output:** deterministic JSON suitable for CI comparison.

**Hard stop:** No culling/LOD behavior is changed in I0.

### Phase I1 — Visibility audit in observe-only mode

Introduce the registration/audit model, but do not apply its decisions.

For every managed camera fixture, report:

- what the proposed system *would* render;
- what the existing runtime actually renders;
- unmanaged world-space subtrees;
- proposed region/LOD;
- proposed shadow/bloom/transparent eligibility;
- giant-bound / giant-region warnings.

This allows the contract to be tested against accepted visuals before it can hide anything.

### Phase I2 — Enforcement bootstrap

Turn on CI enforcement for **new or changed world-space content first** while existing unmigrated content is tracked by a finite grandfather list.

No optimization is required yet.

The grandfather list must:

- identify exact owner/module/subtree;
- state why it is temporarily unmanaged;
- point to the migration phase;
- forbid wildcard paths/classes;
- be monotonically non-increasing after adoption unless Manny explicitly approves a new exception.

### Phase V1 — Shared visibility mechanism

Only after I0–I2 evidence is reviewed may the shared system begin controlling visibility and representation.

Implement:

- frustum + distance region selection;
- deterministic quality profiles;
- LOD hysteresis to avoid threshold thrash/popping;
- pass-specific eligibility;
- optional presentation update throttling;
- diagnostics showing the applied decision each frame/capture.

No minigame-specific route semantics belong here.

### Phase V2 — Neon Grid first real adopter

Migrate Neon Grid because it exposed the issue.

Preserve:

- accepted geometry shape;
- collision;
- repaired 5.3 faces;
- tunnel/billboard/dive behavior;
- shortcut balance and AI rates;
- checkpoints/lap authority;
- gameplay tells;
- accepted visual direction.

Likely migration candidates include splitting course-length road/wall presentation into independently cullable render regions while leaving collision authority unchanged.

Before/after evidence must use locked camera fixtures and the instrumentation created in I0.

### Phase V3 — Circuit Alpha second adopter

Migrate Circuit Alpha without changing accepted gameplay or presentation intent.

Passing this phase demonstrates that the shared contract is not Neon-Grid-specific.

### Phase V4 — Non-kart architecture fixture

Create a small synthetic scene that does not import:

- tracks;
- racers;
- laps;
- kart physics;
- shortcuts;
- kart AI.

It must register regions, LODs, pass eligibility and diagnostics through the same shared system.

This is architecture evidence, not Minigame 2 implementation.

### Phase V5 — Close grandfathering and make enforcement universal

After existing 3D minigames are migrated:

- CI requires zero unmanaged ordinary world-space render roots;
- temporary grandfather entries are removed;
- any future 3D minigame receives the same checks from its first substantial visual scene.

## 8. Enforcement mechanism

This section is normative for the proposal.

### 8.1 Structural ownership gate

Every 3D minigame exposes its rendered world through a shared `RenderWorld`-style boundary.

The shared audit traverses the mounted minigame scene and classifies top-level world-space render subtrees.

A renderable subtree must be one of:

1. registered to a render region;
2. registered as screen-space/UI presentation;
3. registered as an explicit governed global/backdrop exemption.

Otherwise the audit reports it as **UNMANAGED**.

Once Phase V5 is reached, any unmanaged world-space renderable is a CI failure.

### 8.2 Renderer-ownership gate

Creation of the primary WebGL renderer and orchestration of named render stages must have an explicit shared owner.

Enforcement should use an ESLint/import restriction or equivalent source check so new minigames cannot quietly construct a parallel production renderer/pipeline outside approved adapters.

Test/asset-preview tooling may use explicitly allowlisted renderer factories outside production runtime.

### 8.3 Region-span gate

Each minigame declares its maximum ordinary culling-region span.

CI/runtime audit calculates world-space bounds for registered regions.

An ordinary region exceeding that policy is a failure.

A global/backdrop exemption may exceed the span only when:

- the exemption is explicitly typed;
- its pass eligibility is declared;
- it appears in diagnostics;
- it does not recursively exempt arbitrary ordinary content.

This directly prevents another kilometer-scale ordinary mesh from silently becoming the minimum culling unit.

### 8.4 Deterministic workload gates

Canonical fixture captures must produce committed/derived limits for deterministic workload counts, including where applicable:

- active regions;
- draw calls by stage;
- submitted triangles by stage;
- shadow casters;
- transparent submissions;
- bloom participants;
- render-target pixel workload;
- unmanaged roots.

Changes outside the allowed envelope fail CI or require an explicit reviewed baseline update.

This is intentionally stronger than a global triangle target.

### 8.5 Performance evidence gate

CI software rendering is **not** the PRD 60 FPS hardware certification.

CI may enforce:

- deterministic workload budgets;
- no pathological relative regression in paired software-renderer fixtures;
- frame-time deltas for controlled A/B diagnosis.

Final PRD Medium 1920×1080 / eight-racer performance remains a representative-hardware gate.

### 8.6 Exemption governance

Exemptions live in one checked-in registry and require:

- stable ID;
- owner/module;
- reason;
- class;
- permitted passes;
- bounded scope;
- migration/removal disposition.

No callsite may set an ad-hoc `ignoreVisibilityAudit=true` flag.

## 9. CI stages after adoption

A future PR touching a 3D minigame should encounter these gates in order:

1. typecheck/lint/tests/build;
2. render-workload structural audit;
3. region-span/exemption audit;
4. canonical deterministic workload capture;
5. workload regression comparison;
6. software-render paired diagnostic where the change is render-sensitive;
7. representative hardware/perceptual owner gates at the appropriate release checkpoint.

The static/deterministic gates should be fast enough to run routinely. Expensive browser captures may be scoped to changed minigames or designated performance workflows.

## 10. Why draw calls and triangles remain but are insufficient

The existing PRD targets remain useful:

- draw calls target ≤250;
- visible triangles target ≤750k;
- Medium 1920×1080 eight-racer target 60 FPS;
- p95 ≤18.3 ms.

They are retained.

This proposal adds missing workload dimensions because a scene below those totals may still waste time through:

- oversized culling units;
- repeated scene passes;
- shadows;
- transparent overdraw;
- fullscreen pixel work;
- shader complexity;
- animated off-screen presentation;
- unnecessary high-detail distant representation.

## 11. Quality tiers

Low / Medium / High share one visibility-policy system.

Each minigame may tune declared multipliers and representation availability, but may not create three unrelated culling architectures.

Quality changes may alter:

- region visibility distance;
- LOD thresholds;
- shadow/effect distance;
- material/effect representation.

Gameplay visibility guarantees remain authoritative.

## 12. Acceptance gates for the architecture

The architecture is not complete merely because a visibility class exists.

Required evidence:

### Instrumentation checkpoint

- same existing scene renders with behavior unchanged;
- diagnostic JSON is deterministic enough for workload comparisons;
- named pass/feature attribution works;
- unmanaged inventory is visible;
- Neon Grid 900 m baseline is reproducible within expected software-runner variance;
- no optimization is included.

### Enforcement checkpoint

- fixture with an unmanaged world mesh fails;
- fixture with oversized ordinary region fails;
- explicit backdrop exemption passes and is reported;
- prohibited renderer ownership fails source/CI enforcement;
- workload-budget regression fixture fails;
- baseline update path is explicit and reviewable.

### Neon Grid migration checkpoint

- same gameplay/collision outcomes;
- accepted visual tells remain;
- independently cullable spatial regions are proven;
- objective submitted-work reduction on locked camera fixtures;
- no new stutter/popping at race speed beyond approved tolerance;
- owner visual/playtest approval.

### Circuit Alpha migration checkpoint

- equivalent evidence;
- no Neon Grid concepts leak into shared APIs.

### Non-kart fixture checkpoint

- visibility architecture works without importing kart modules;
- CI enforcement applies unchanged.

## 13. Proposed repository governance after owner approves this document

Approval of this design should cause these durable updates:

1. **PRD:** add an implementation amendment establishing cross-minigame render-workload governance and instrumentation-first sequencing. Existing performance targets remain unchanged.
2. **DECISIONS:** add ADR-110 covering shared visibility/render-workload ownership, separation from gameplay authority, staged enforcement and renderer ownership.
3. **TESTING:** add the I0 workload-capture schema, evidence interpretation rules and CI failure cases.
4. **STK backlog:** mark STK-008/009/010 as adopted into this governed initiative rather than separate candidates.
5. **IMPLEMENTATION-STATUS:** identify I0 as the next authorized action only after owner implementation approval.

No runtime work begins merely because the documentation PR is merged unless Manny separately authorizes implementation.

## 14. Proposed PRD amendment summary for review

If approved, the PRD amendment should state:

> Every substantial 3D minigame must use the shared render-workload governance contract. Instrumentation and baseline capture precede optimization. Large spatial worlds must expose independently cullable presentation regions or explicit governed backdrop exemptions. Visibility, LOD, shadows, transparency, post-processing and presentation-update eligibility are independently budgeted. CI must enforce managed render ownership, region-span policy and deterministic render-workload regressions. Gameplay authority remains independent. Existing 60 FPS, p95, draw-call and visible-triangle requirements remain in force.

## 15. Open review decisions

The following remain intentionally reviewable rather than silently decided:

1. Final shared module/type names.
2. Exact default region-span recommendations by game topology.
3. Which deterministic workload metrics are blocking on day one versus informational until both tracks migrate.
4. Whether GPU timer queries are required where supported or remain supplemental.
5. Exact hysteresis thresholds.
6. Whether presentation update throttling enters the first visibility implementation or a later bounded phase.
7. Whether the non-kart fixture is test-only or a tiny hidden development route.

The two owner conditions are **not** open decisions: instrumentation-first sequencing and executable enforcement are mandatory.
