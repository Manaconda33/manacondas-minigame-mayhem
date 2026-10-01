> **Execution update:** Manny approved implementation/Native execution with “Approved, let's get started.” Implementation and local validation are complete; review fixes are verified. Canonical review CI/private preview and owner new-bloom acceptance remain pending. Separate public merge/publication approval is still required. Earlier awaiting-implementation status is historical.

# Selective Bloom Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add restrained, explicitly selected race bloom while preserving accepted base rendering and counting its complete rendering cost.

**Architecture:** A race-owned `RaceBloom` renders the unchanged scene to screen, a capped depth-occluded emission mask, two fixed nine-tap filter passes, and an additive glow overlay. Material eligibility and mask conversion live separately from renderer orchestration. Low bypasses the pipeline entirely; initialization/render failure restores state and retains ordinary racing.

**Tech Stack:** Existing TypeScript, Three.js 0.185.1 lockfile dependency, Vitest/JSDOM, Vite; no dependency or asset additions.

**Spec:** `docs/superpowers/specs/2026-10-01-selective-bloom-design.md` (written design approved by Manny with “Plan approved.” on 2026-10-01 America/Chicago).

## Global Constraints

- Preserve all accepted diagnostics/optimization/drift/dust/speed/exhaust/gameplay/HUD/Results/audio and character contracts. Do not reopen their owner reviews.
- Context-loss recovery is removed from remaining work and release gates by owner decision. Do not add context-loss listeners or recovery UX.
- Motion blur and the next slice remain outside this work. Concurrent Archer work is separate.
- Medium: 0.5 of drawing buffer, long-edge cap 768 px, filter radius 2 mask pixels, initial composite gain 0.18.
- High: 0.5 of drawing buffer, long-edge cap 1024 px, filter radius 3 mask pixels, initial composite gain 0.24.
- Low: no bloom targets/materials; original direct rendering.
- Three linear RGBA8 targets; mask has depth, filter targets do not. Two normalized fixed nine-tap filters; one additive full-screen composite; no temporal history or mip chain.
- Keep original color management, antialiasing, camera and base rendering. No global exposure/tone-mapping adjustment, new lights or shadow casters.
- All source materials/textures remain borrowed. Restore temporary state in `finally`; release owned resources once.
- Existing next-race quality application and public main/Pages approval gates remain. Private gameplay review precedes separate merge/publication approval.

## Review Focus

1. Multi-material and instanced objects: eligibility must not make unselected surfaces glow or lose per-instance colors (Tasks 1–2).
2. Driver sprite alpha and transparent occluders: no rectangular dark mask, halo through solid karts, or unintentional opacity change (Tasks 2, 5).
3. Mid-mask/filter exceptions: original materials, fog/background, targets, viewport, clears, shadow state and counters are restored before fallback (Tasks 3–4).
4. Dynamic effect disposal/recreation: no stale eligibility, unbounded mask-material cache, ghost glow or double disposal (Tasks 2–3, 5).
5. Portrait/landscape resize and drawing-buffer DPR: preserve aspect, stay under caps, and count every pass (Tasks 3–5).

---

## File responsibilities

- Create `src/game/rendering/bloomEligibility.ts`: explicit source-material marking and object overrides; no name/brightness inference.
- Create `src/game/rendering/BloomMaskMaterials.ts`: cached emission/black-occlusion variants, live property sync, source-disposal cleanup, custom adapters.
- Create `src/game/rendering/bloomShaders.ts`: full-screen triangle shaders, nine-tap spatial filter and output-color-aware additive overlay.
- Create `src/game/rendering/RaceBloom.ts`: quality, buffer sizing, render-state ownership, fallback, warmup and disposal.
- Modify `src/config/graphicsQuality.ts`: bloom profile values under the existing preset authority.
- Modify `src/game/KartTimeTrial.ts`: one race-owned pipeline, resize/startup/disposal, full-frame counter integration and metadata.
- Modify `src/game/diagnostics/raceDiagnostics.ts`: optional attributable bloom metadata, retaining schema version 1 and existing capture semantics.
- Modify visual owners listed in Task 5: mark exact luminous materials at construction; no changes to simulation or existing visual equations.
- Create `tests/bloom-eligibility.test.ts`, `tests/bloom-mask-materials.test.ts`, `tests/race-bloom.test.ts`, `tests/bloom-effects-routing.test.ts`; extend existing routing/settings/track tests only where they prove integrated behavior.

### Task 1: Explicit eligibility and quality bounds

**Files:** Create eligibility module and test; modify graphics quality and `tests/settings.test.ts`.

**Interfaces:** Export `type BloomEmission = 'color' | 'emissive'`; `markBloomMaterial<T extends THREE.Material>(material: T, emission: BloomEmission): T`; `bloomEmission(material: THREE.Material): BloomEmission | null`. Store metadata on owned source materials without modifying render properties. `GraphicsQualityProfile.bloom` is `null` for Low or `{ scale: 0.5; maxEdge: 768 | 1024; radius: 2 | 3; gain: number }`.

- [ ] Write failing tests `explicit_material_eligibility_only` and `quality_bounds`: unmarked bright/emissive materials return null; marking preserves color, opacity and blending; the same named object without marking is excluded; Low null, Medium/High values equal the spec table.
- [ ] Run `npx vitest run tests/bloom-eligibility.test.ts tests/settings.test.ts`; observe the new assertions fail before implementation.
- [ ] Implement those interfaces, with no shader/render allocation and no source render-property mutation.
- [ ] Run the focused tests plus `npm run typecheck`; require all pass.
- [ ] Commit `feat: define explicit bloom eligibility and quality bounds`.

### Task 2: Depth-safe mask materials and dynamic ownership

**Files:** Create mask module and test; consume Task 1.

**Interfaces:** `BloomMaskMaterials.variant(source: THREE.Material, emission: BloomEmission | null): THREE.Material`; `registerAdapter(source: THREE.ShaderMaterial, create: () => THREE.ShaderMaterial): void`; `dispose(): void`. Cache variants by source and mode, synchronize live source properties before every use, remove variants when source emits dispose. Retain a registry of owned variants for idempotent cleanup.

- [ ] Write failing `preserves_coverage_and_live_color`, `mixed_material_instances`, `source_disposal_releases_variant_only`, and `custom_vertex_adapter`: sprite map/alphaTest/side/opacity/depth flags preserved; opaque noneligible RGB black; eligible colors/emission updated after mutation; instances retain instanceColor/matrix; material arrays retain independent selection; borrowed maps/geometries/materials are never disposed; recreated sources have fresh variants.
- [ ] Run `npx vitest run tests/bloom-mask-materials.test.ts`; observe failure.
- [ ] Implement Basic/Standard/Phong/Lambert/Physical mesh, Sprite, and LineBasic variants used by this scene. Selected standard materials use emissive-only unlit color, excluding diffuse/env reflection; black variants retain coverage/depth semantics and disable fog. Transparent black occluders use normal alpha coverage rather than additive black, while luminous variants keep effect blending. Preserve vertex/instance transforms through Three built-in materials.
- [ ] Add explicit custom adapters: the sky and screen-space speed-line shader retain their source vertex shader/uniforms/coverage and output black RGB. Unknown custom material without an adapter throws a typed unsupported-mask error, triggering Task 3 fallback rather than guessing coverage.
- [ ] Run mask/eligibility tests and typecheck; require pass. Structural tests certify material/state semantics, not actual GPU occlusion.
- [ ] Commit `feat: add owned depth-safe bloom mask variants`.

### Task 3: Capped selective renderer, shaders and fallback

**Files:** Create shaders, pipeline, tests; consume Tasks 1–2.

**Interfaces:** `new RaceBloom(renderer: THREE.WebGLRenderer, quality: GraphicsQuality)`; `register(object: THREE.Object3D, emission: BloomEmission): void`; `unregister(object: THREE.Object3D): void`; `resize(width: number, height: number): void`; `warmup(scene: THREE.Scene, camera: THREE.Camera): void`; `render(scene: THREE.Scene, camera: THREE.Camera): void`; `snapshot(): BloomSnapshot`; `dispose(): void`. `BloomSnapshot` contains `enabled`, `quality`, `maskWidth`, `maskHeight`, `fallbackReason: string | null`. Object overrides apply only to that renderable, never implicitly to descendants; source marks handle late-created objects. Warmup compiles without advancing effect state.

- [ ] Write failing `low_allocates_nothing`, `size_caps_preserve_aspect`, `render_passes_restore_state`, `failure_keeps_base_image`, and `dispose_once`: Low has one scene draw/no targets; 1920×1080 Medium mask 768×432, High 960×540; 3840×2160 High 1024×576; zero dimensions clamp to one; transpose dimensions for portrait; mask plus three full-screen draws; no extra shadow update; throw during each pass restores originals and leaves a direct base image; resources freed once.
- [ ] Run `npx vitest run tests/race-bloom.test.ts`; observe failure.
- [ ] Implement RGBA8 linear targets, depth on mask only, reusable full-screen triangle and normalized weights `[1, 4, 7, 10, 13, 10, 7, 4, 1] / 57`. Sample offset index −4…4 times radius/4 along the selected axis in mask texels. Explicitly use linear filtering and clamp-to-edge wrapping.
- [ ] Implement mask traversal using Task 2 variants and per-renderable/material mode. Render base first, mask with black background/no fog/shadow refresh disabled, filter horizontal then vertical, and additive screen overlay with alpha 1 and RGB scaled by gain then converted to renderer output space once. Overlay depth test/write off. Do not clear the base screen before the overlay. Snapshot/restore material arrays, render target, viewport/scissor, clear color/alpha, autoClear and shadow-update state in `finally`.
- [ ] On initialization/allocation/render error, dispose only owned bloom resources, set stable fallbackReason and use original direct rendering. Fallback must not retain partially swapped materials or retry allocating every frame.
- [ ] Run focused tests and typecheck; require pass. Commit `feat: render capped selective race bloom with safe fallback`.

### Task 4: Race lifecycle and complete diagnostics

**Files:** Modify KartTimeTrial and diagnostics types; extend `tests/race-diagnostics-routing.test.ts`, `tests/race-performance-meter.test.ts`; use RaceBloom tests for error paths.

**Interfaces:** Race owns one `RaceBloom`; call render instead of renderer.render in the RAF path, resize after renderer.setSize using actual drawing buffer, dispose before renderer disposal. `RaceCaptureMetadata.bloom?: BloomSnapshot` is optional and serializable; do not alter accepted schema version, timing exclusions or percentiles. Use snapshot at capture export, including fallback state and current dimensions.

- [ ] Write failing `complete_frame_counter_capture`, `bloom_resize_export_and_dispose`, and `late_startup_disposal`: counter fixture resets once then accumulates base 22 + mask 17 + full-screen 3 = 42 calls; read occurs after composite; autoReset restored even on failure; viewport metadata remains full drawing buffer; Low bypass intact; abandoned async race startup owns no live bloom resources.
- [ ] Run `npx vitest run tests/race-diagnostics-routing.test.ts tests/race-performance-meter.test.ts`; observe new failures.
- [ ] Implement lifecycle integration without reordering simulation/effect updates. Temporarily disable renderer.info.autoReset, reset once before base, read after all passes and restore bookkeeping in `finally`; diagnostics cannot see only the last filter pass. Preserve raw RAF/pause/hidden policies. Fallback information is capture-only, not normal HUD copy.
- [ ] Run those tests, RaceBloom tests and typecheck; require pass. Commit `feat: integrate bloom lifecycle and whole-frame counters`.

### Task 5: Select exact luminous surfaces in existing visual owners

**Files:** Modify `src/game/vfx/DriftVisual.ts`, `ExhaustVisual.ts`; `src/game/track/createTrackScene.ts`; `src/game/items/NitroSurgeVisual.ts`, `NitroOverdriveVisual.ts`, `HyperDriveRocketVisual.ts`, `PrismaticVisual.ts`, `FrostVisual.ts`, `ArcBladeVisual.ts`, `ArcHammerVisual.ts`, `ApexPresentation.ts`, `ProjectileSystem.ts`, `HazardSystem.ts`, `ShockwaveSystem.ts`; KartTimeTrial only for existing charged drift indicators. Create effects-routing test and extend track-scene/racer-item/race routing coverage.

**Interfaces:** Existing constructors call `markBloomMaterial` on owned luminous materials. Shared player/AI visual classes supply identical eligibility automatically. Dynamic projectile/hazard materials are marked at creation and discovered when visible; disposed source events retire variants. Register explicit sky/speed-line adapters from Task 2 using their source shader materials without changing source shaders.

- [ ] Write failing `eligible_effects_only` with fixtures for blue/orange/purple drift, ordinary exhaust, boost chevrons, Nitro/Overdrive/Rocket energy, Prismatic edges/particles, Frost crystals, Arc energy/trails, Apex trail/blast, projectile energy/rings, hazard explosion pulse and Shockwave pulse. Assert source colors/opacity/depth properties and instance counts unchanged by marking.
- [ ] Write failing `exclusions_and_dynamic_lifecycle`: road, boost base, kart/driver art, dust, speed lines, sky/scenery, Arc handles, Rocket solid bodies, Apex hull/fins, Seeker hull, Slick puddle and warning markers excluded; removed/hidden/expired effect emits no mask; disposed/recreated effects do not grow cache unboundedly. Prismatic shell remains excluded to avoid a broad kart-covering glow; its edges/particles carry bloom.
- [ ] Run `npx vitest run tests/bloom-effects-routing.test.ts tests/track-scene.test.ts tests/racer-item-visuals.test.ts tests/race-diagnostics-routing.test.ts`; observe failures.
- [ ] Mark those exact materials, keep all original source equations/limits/lifetimes, and test current player/AI effects through the actual race path. Preserve ordinary boost sphere correction and accepted item suppression rules.
- [ ] Run the focused suite and typecheck; require pass. Commit `feat: select drift boost and item energy for bloom`.

### Task 6: Full validation, rendered review and publication boundary

**Files:** Evidence directory `docs/evidence/2026-10-01-selective-bloom/`; existing IMPLEMENTATION-STATUS, DECISIONS, TESTING and the spec/plan status. No workflow/assets/roster changes.

- [ ] Run `npm run validate`; require full tests/coverage, strict typecheck, zero-warning lint, exact asset gates and production build to pass. Run `git diff --check` and `git lfs fsck`; require pass. Record actual output and known existing bundle warning.
- [ ] Perform one independent whole-branch review under requesting-code-review; resolve important findings with observed regressions and repeat only affected/full required checks. Do not modify Archer work discovered on main; reconcile its changes without overwriting them.
- [ ] Attempt rendered verification with a permitted browser on the exact built review runtime. Check narrow colored glow, crisp road/art/HUD, real opaque/alpha occlusion, moving instanced sparks, late-created items, chase/rear, pause/resume and portrait/landscape resize. If automation is blocked, record the observed blocker; GPU pixel checks remain pending for owner preview, not falsely passed by mocks.
- [ ] Publish canonical review branch/draft PR only within authorized review scope; verify exact head/tree and hosted CI. Build the existing owner-private gameplay preview from that head, record source/version/deployment and packaged-file hashes. Public main remains unchanged.
- [ ] Present new-bloom gameplay review link and opt-in diagnostics capture instructions. Compare the same preview/device/quality/scenario against a bloom-disabled diagnostic fixture (explicit test-only query `testBloom=off`, absent in normal routing); record actual settings/dimensions/calls/frame metrics and limits. Verify fixture cannot alter gameplay or persist settings. Owner sees only new-bloom review; existing acceptance is not repeated.
- [ ] Record owner visual feedback/acceptance. Request separate merge/publication approval only after exact accepted artifact and passing CI are concrete.
- [ ] If publication is approved, verify current main/concurrent work, merge accepted head, await existing protected-main CI/Pages, independently match public index/JS/CSS hashes, and record release acceptance. No Slice 6 closure or next-slice authority is inferred.

## Plan self-review and handoff

Spec coverage: eligibility/color/occlusion (Tasks 1–2, 5); quality and renderer/failure (3); lifecycle/counters/metadata (4); all review-focus cases (2–5); performance/visual/evidence and approval boundaries (6). The diagnostic bloom-off fixture belongs to Task 6's attributable capture verification and needs a focused query-isolation regression before review publication. It adds no settings/UI feature.

Recommended execution: **Native** in this session, followed by one independent whole-branch review, because mask adapters, renderer state and diagnostics are tightly coupled. Written-plan review and execution-method selection remain pending; implementation has not begun. Existing “Plan approved” approved the written design presented at that point, not this subsequently created implementation plan.
