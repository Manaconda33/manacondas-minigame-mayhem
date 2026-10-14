# Neon Grid Post-Fog Visual Polish & Adaptive Graphics Performance Roadmap

**Status:** OWNER-ALIGNED ROADMAP, DOCUMENTATION ONLY; individual implementation/release gates remain closed<br>
**Date:** 2026-10-13 (America/Chicago)<br>
**Repository authority:** `docs/PRD.md`, approved amendments on `design/neon-grid-circuit-02`, and verified tests/evidence<br>
**Baseline candidate:** Abyss Fog V3.2 source `experiment/neon-grid-abyss-fog-004` at `25ea008b15852d593681f5b3b2a17b467a193472`; runtime `9731adafdaf8e84d5a2c36ceeb035620753befa6`<br>
**Rendering architecture foundation:** [Cross-Minigame Render Workload Governance Plan](2026-10-05-render-workload-governance.md)

## 1. Scope change and historical preservation

Manny reports that the source-pinned V3.2 playable owner playtest PASSED, consistent with the preceding visual assessment. This is owner visual/playability acceptance of that precise review candidate, **not** G-05 representative-hardware certification, Neon Grid production acceptance, integration into `design/neon-grid-circuit-02`, or permission to merge draft PR #242.

**Superseded future direction:** the previously contemplated next phase of *adding new ruined-city silhouettes, decorative debris, and broken-city primitives* is **no longer the active next work**. Preserve all historical fog experiments, rejected variants, review packets, earlier design references and approval evidence. Do not delete or rewrite them. The approved fog-city illusion is the accepted visual starting point for the replacement roadmap.

**Replacement priority:** (A) recover approved sponsor visibility; (B) establish pass-level rendering instrumentation; (C) prototype carefully selected textures, normal maps, packed maps and PBR on existing geometry; (D) test evidence-driven visibility, LOD and workload optimization under the existing shared-governance sequencing. No newly commissioned sponsor/character graphics, ruined-city dressing, WebGPU migration, camera overhaul, or gameplay changes are included.

This roadmap is a planning authorization only. Each bounded runtime increment still requires its own explicit approval, validation, playable preview as applicable, and owner review before adoption.

## 2. Current budgets, distinct scopes and unresolved evidence

| Rule | Currently approved authority | Interpretation |
| --- | --- | --- |
| Global race-scene draw calls | **500** from development PRD amendment **2.26** | Approved across race scenes, including Circuit Alpha; `main` PRD still displays the superseded 250 figure and requires documentation reconciliation. Not merely a discretionary warning in active Task 9 checks. |
| Task 9 engineering triangle bound | **425,000**, amendment **2.28** | Forward-looking Task 9 acceptance/certification analyzer ceiling, not global PRD triangle cap. |
| Global race-scene visible triangles | **750,000** PRD | Unchanged project-wide target/cap; do not auto-increase. |
| T9.7 incremental A/B draw calls | Skyline +36, Undercity +30, Falls extension +28, amendment 2.27 | Sector deltas, not total sector maxima. |
| Dynamic shadow casters | At most 12 | Retain. |
| Medium approximate GPU texture residency | 256 MB target | Retain pending real measurement. |
| Medium desktop representative hardware | median FPS >=60 at 1920x1080 with eight racers; p95 <=18.3ms, no sustained 3-frame run above 50ms | Existing G-05 contract; no evidence-based relaxation approved. |
| Preferred GPU frame time | <=12ms | Performance preference, not newly certified hardware result. |

**Measurement caveat:** Three.js renderer submission counters accumulate pass work in this project. The same mesh may contribute to base rendering, shadow and selective bloom/mask passes. The V3.2 diagnostic camera maximum is **490 calls / 400,751 submitted triangles**, and its ordinary desktop chase maximum is **296 / 152,047**. These are different camera fixtures, not two comparable hardware thresholds. The earlier accepted T9.7 182-position sweep reached **494 / 416,459**. All quoted fog and T9.7 capture timings are software-WebGL/SwiftShader or reported measurements unless independent physical-device provenance is provided. Visual playtest acceptance is not hardware G-05 proof.

There is a real governance discrepancy: **`main` PRD §2.6 retains 250 calls while the approved development PRD §2.6 plus amendments 2.26-2.28 use 500/425k.** First governance checkpoint must reconcile the already-approved terms, with their scope and historical dates, without inventing new approvals or overwriting the unmerged gameplay branch.

### Proposed experimental envelopes, not adopted limits

| Envelope | Call allowance | Task 9 triangle allowance | Status |
| --- | ---: | ---: | --- |
| A | 500 | 425,000 | Existing approved engineering ceiling / reference |
| B | 550 | 500,000 | Test-only proposal |
| C | 600 | 600,000 | Test-only proposal |
| D | 650 | 700,000 | Test-only proposal |

These are **envelopes, not measured workloads or new release caps**. Testing above currently approved limits requires separately authorized isolation; CI, production and normal development acceptance must keep current rules. Build actual representative workloads and vary (i) calls alone, (ii) triangles alone, and (iii) both together, while controlling effects and scene state. Do not treat a change of threshold constant as evidence of additional hardware capacity. The 750k global triangle cap remains unchanged.

## 3. Bounded execution order

### Task A: Recover existing approved billboard visibility (next visual task)

**Read first:** `SkylineVisual.ts`, `UndercityVisual.ts`, `NeonGridVisualVariant.ts`, existing T9.5 billboard camouflage and advertiser-art evidence.

- Inventory each existing approved sponsor instance and record target image, world anchor, road progress, facing, mount, apparent in-race pixel size and whether fog/building occlusion hides it.
- Inspect Undercity's exact variant guard: its lifted ad placement presently checks only `variant === 'fog-experiment-v3'`; V3.2 resolves to `fog-experiment-v3-2`. Verify the impact in rendered source and test the smallest compatible fix.
- Prefer clearly visible existing building upper facades. Where necessary, move individual approved signs to structurally supported, track-facing walls, respecting Roadside/Billboard Gap and Service Tunnel masks.
- Keep the exact authorized four sponsor images and existing sponsor identities/art; preserve road cues, approved billboard shortcut concealment, actual tunnel entrances, physical road geometry, gameplay and all approved visual effects.
- Provide a sign-by-sign visibility inventory and matched chase/rear desktop and mobile-portrait images across the full course. Test asset load, disposal, placements and occlusion; do not simply assert signs are in the scene.
- Publish only a new immutable, source-pinned **review** preview after an independent authorization gate. Do not alter the default T9.7 production/runtime selection.

**Stop after Task A preview/review packet and owner visual approval gate.** Do not combine with Task C material changes.

### Phase G0: Resolve approved-budget documentation and renderer-governance foundation

- Documentation-only reconciliation of PRD amendments 2.26–2.28 with `main`, preserving historical limits and untouched release gates. Record decision scope in `DECISIONS.md` and operational rule types in `TESTING.md`.
- Extend, do not duplicate, the existing cross-minigame render governance plan, starting from I0 instrumentation and the existing explicit phase gates.
- Establish a versioned proposed policy model that distinguishes **approved hard release constraints**, **engineering review targets**, and **isolated experimental allowances**. Policy changes must be traceable to explicit owner approvals and cannot be raised silently inside runtime code.
- No new ceiling, release exception, CI enforcement, camera clamp, LOD, or renderer behavior becomes active at this checkpoint.

### Task B / Governance Phase I0: Instrument actual rendering passes (read-only behavior)

- Adapt existing `RaceBloom`, `RendererCounters`, motion-blur and race-diagnostics ownership without rewriting the renderer.
- Capture base scene, shadows (where attributable), bloom mask/filter/composite, motion blur, off-screen target pixel workload, shader/material/texture counts, transparent-overdraw proxies, active camera settings, geometry bounds and rendering submissions. Avoid double counting when presenting stage totals; state exactly what each counter includes/excludes.
- When supported, use **asynchronous** WebGL GPU timer queries, check disjoint and availability, and report unavailable rather than inventing timings. Track CPU/update and GPU timings separately.
- Pin source SHA, viewport *and actual drawing-buffer resolution*, DPR, graphics quality, course sector, camera fixture, roster, items, shadows/bloom/blur settings, warmup/scored frames and device/browser provenance.
- Output reproducible machine-readable reports and matched before/after render invariants. **No visibility, LOD, fog, shaders, geometry, camera or gameplay behavior changes in I0.** Review I0 before any policy enforcement or adaptive rendering.

### Task C: Materials and texture prototype (after Task A and baseline)

- Prioritize the nearest visible roadway-facing walls and structural fascia, then nearby building facades and upper support portions. Do not spend resources detailing lower structures already fully concealed by fog.
- Prototype small, repeated base-color textures, selective tangent-space normal maps, roughness/metalness and optional baked AO; reuse Circuit Alpha texture-loading, mipmap, fallback/disposal and packed-map conventions where applicable.
- Distinguish `MeshBasicMaterial` unlit scenery from lit `MeshStandardMaterial`: normal maps/PBR may require a costlier lit material and can harm stylized night visibility if applied indiscriminately.
- Examine UV tiling, lighting, normal-map orientation, aliasing, texture residency, bandwidth, number of unique materials, GPU shader variants, bloom/transparent passes, cache behavior and package size.
- Treat texture atlases and channel packing as potential *specific* benefits, not guarantees of fewer calls or lower GPU memory; benchmark candidate atlas/material consolidation.
- Avoid displacement maps and bulk decimation unless a measured need emerges. No new binary texture art becomes approved without its separate asset/provenance and preview gate.
- Make a one-area A/B prototype with the same camera and hardware fixtures, with Low/Medium/High alternatives where warranted. Stop for owner visual and performance review before course-wide expansion.

### Task D / Governance I1–I2–V1+: Measured optimization, then adaptive rendering

- Observe-only visibility and ownership audit (I1), finite grandfathering/CI rule bootstrap (I2), and **only then** behavior-changing per-region culling, hysteresis-based LOD, distance-appropriate material simplification and selective bloom/shadow participation (V1).
- Reuse the existing cross-minigame `RenderWorld` design rather than introducing a track-specific global workaround.
- Keep road, racers, shortcuts, warning tells, billboard camouflage, 2D driver correctness, items and all collision/physics systems independent of render eligibility.
- Compare cost per pass and visual parity. Large merged or instanced meshes may need region decomposition before culling; don't assume instancing alone ensures cheap distance rendering.
- Gate Neon Grid adoption first, Circuit Alpha only under its own visual/regression approval, and later minigames under the shared contract.

## 4. Hardware calibration protocol (separate authorization)

Measure identical source, graphics quality, route/camera traces, racer roster, bloom/shadows/motion blur, viewport/drawing-buffer, warmup and scene state while varying one workload dimension at a time. Record **observed actual** draw calls/triangles, not only configured envelopes.

Candidate devices: baseline desktop integrated graphics at required Medium 1920×1080; midrange Android; capable Android; iOS Safari if available. For each workload candidate, propose at least three comparable complete three-lap runs and a sustained thermal/load trial. Capture median FPS, p95 and tail frames, 3-frame >50ms runs, asynchronous GPU time where valid, CPU/main-thread time, draw calls/triangles by stage, memory proxy/real bytes where possible, restart/cleanup growth, input latency/readability and thermal trend. No available physical-device evidence means **NOT CERTIFIED**, not PASS.

Compare increased-detail cost and subjective visible value with the V3.2 accepted look. Existing 60 FPS and 18.3ms p95 gates stay binding. A tighter 16.7ms p95 goal and explicit thermal standard remain **proposals** pending owner approval. No higher cap is grandfathered automatically after a successful single-device run.

## 5. Evidence, governance and stop conditions

- Keep prior ruined-city art direction as historical evidence, but mark it **superseded for future implementation**; do not remove accepted supports, scenery, sponsors or existing geometry.
- Before new visual work, diagnose recent `main` GitHub Actions Pages-preservation failures (runs `38456834757` and `38452972000`). Review the actual failure rather than treating passing build checks as a successful deployment. Do not change publication safeguards merely to obtain green status.
- An ordinary docs-only PR may publish this roadmap, but it must not merge a fog runtime, deploy Neon Grid to production, modify `main` gameplay, alter approval gates or begin another PRD slice.
- Every implementation checkpoint requires typecheck, zero-warning lint, automated tests, production build, appropriate render/asset and LFS checks, objective before/after evidence, concise decision/status updates, and exact Git commit and workflow identity.
- PR #242 stays draft and unmerged; G-05 hardware validation and production release remain separate.
- **Next recommended action:** Task A bounded billboard visibility design/implementation authorization, with Phase G0 documentation reconciliation in a separate docs-only checkpoint. No ruined-city dressing task is next.
