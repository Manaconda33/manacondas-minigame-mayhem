# Task 8 — Falls Run Representative Stretch Implementation Plan

**Status:** APPROVED by Manny on 2026-10-05 (America/Chicago).  
**Scope:** Stage 4 Task 8 only — Falls Run dive stretch, track progress approximately 0.70–0.85.  
**Core principle:** “spectacle as camouflage — mask the door, light the keyhole.”

This plan is the approved implementation contract for Task 8. Task 9 remains separately gated and MUST NOT begin as part of this work.

## Repository / runtime baseline

- Default branch: `main`.
- Active Neon Grid branch: `design/neon-grid-circuit-02`.
- Planning checkpoint before this approval: `1a2f7f238c299fcd1c00eddbfd8cb70d04509608`.
- Latest validated runtime beneath the documentation-only checkpoint: `406bb5c2f606c2db4d1f2fa9ee7e36e1d6217308`.
- Hosted CI for that runtime: run `37361803233`, PASS, 125 files / 997 tests.
- PR #242 remains draft/open/unmerged.
- Governing PRD: v1.1, approved implementation amendment 2.24.
- Task 7 waterfall spillway owner visual approval remains preserved.

## Approved visual target

Authoritative references:

- `docs/design/neon-grid/stage-4-visual-design.md`
- `docs/design/neon-grid/task8-falls-run-target-wide.webp`
- `docs/design/neon-grid/task8-dive-gap-target-pov.webp`

The two target WebPs are design references only, not runtime textures.

## Scope boundaries

Polish only the Falls Run representative stretch, approximately progress 0.70–0.85. The only scene-wide exception is the night-sky / horizon backdrop required to judge the stretch against the approved nighttime direction.

Frozen / out of scope:

- no gameplay changes
- no physics changes
- no kart stat changes
- no item changes
- no balance changes
- no AI-rate changes
- no shortcut timing changes
- no repaired-face changes
- no changes to the accepted Waterfall Dive gameplay geometry, recovery, ramp/landing collision surfaces or 5.3 repair contract
- no Task 9 course-wide extension
- no PR #242 merge
- no production release

## Asset inventory

| New render asset | Planned implementation | Count / batching | Runtime texture |
|---|---|---:|---|
| Night sky + horizon glow | Procedural sky dome shader with stars and distant city glow | 1 mesh | none |
| Falls Run wet asphalt | Visual-only ribbon over existing road, progress 0.70–0.85 | 1 mesh | none |
| Cyan road-edge illumination | Both edges merged into one emissive geometry | 1 mesh | none |
| Elevated deck fascia | Dark under-road massing | 1 merged mesh | none |
| Support pylons | Repeating structural columns | ~12 instances, one InstancedMesh | none |
| Cross-braces | Repeating under-deck members | ~20–24 instances, one InstancedMesh | none |
| City silhouette massing | Dark tower blocks below/around deck | ~24 instances, one InstancedMesh | none |
| Lit city windows | Emissive modules | Low ~160 / Medium ~320 / High ~480, one InstancedMesh | none |
| Ambient waterfall sheets | Deck-edge cyan falls | 12 falls, one InstancedMesh | none |
| Waterfall lip foam | Bright source strips at fall lips | 12 instances, one InstancedMesh | none |
| Ambient waterfall mist | Soft billboard cards | Low 16 / Medium 32 / High 48, one InstancedMesh | none |
| Base spray / plunge haze | Foam/haze where falls disappear below deck | ~12 instances, one InstancedMesh | none |
| Falls Run signage | Simple cyan/gold infrastructure signs | ~16–20 instances, one InstancedMesh | none |
| Dive rail framing/debris | Dark broken-rail visual pieces around existing opening | ~8–12 instances, one batched/instanced set | none |

The existing Task 7 ramp-waterfall presentation, pool, mist, splash system, gold chevrons and landing marker are reused and preserved rather than replaced.

## Waterfall plan

Use **12 ambient deck-edge waterfalls**, approximately six per side through progress 0.70–0.85, with irregular spacing and width. The accepted dive waterfall becomes one member of a wider waterfall district rather than a singular shortcut beacon.

Rules:

1. Ambient falls use the shared cool cyan visual language but lower contrast than the dive focus.
2. No ambient fall receives gold treatment.
3. Gold remains reserved for the dive tell: chevrons, broken-rail opening and landing marker.
4. Ambient falls are implemented as instanced shader planes with procedural torn silhouettes.
5. Mist is bounded and quality-scaled.
6. No fluid simulation or true volumetrics.
7. The visual result must make “waterfall district” read first and “jumpable opening” resolve second from chase camera.

## Wet asphalt technique

No true reflections, SSR, render-target reflections, probes or mirrored scene pass.

The existing physical/render road remains authoritative. Add one visual-only road-shaped overlay approximately 1 cm above the Falls Run section. The overlay uses longitudinal UVs and a shader that produces broken elongated specular streaks procedurally.

The fake specular response combines:

- deterministic longitudinal noise / hash bands
- thin irregular streak masks
- a grazing-view-angle term so highlights strengthen as the road turns away from the camera
- cyan bias near luminous road edges
- local restrained gold influence near the dive tell

The overlay is transparent, `depthWrite=false`, single-pass and visual-only. Low omits the streak layer. Medium is the reference implementation. High may increase streak density/intensity without adding another mesh.

## Draw-call budget

PRD hard cap: **≤250 draw calls**.

Last comparable Task 7 Waterfall/Dive rendered matrix: maximum **142 / 250** draw calls. Treat this as the planning baseline only, not Task 8 acceptance evidence.

| Task 8 addition | Planned calls |
|---|---:|
| Night sky / horizon | +1 |
| Wet asphalt + luminous edges | +2 |
| Deck massing / pylons / braces | +3 |
| City silhouettes / windows | +2 |
| Ambient waterfall sheet / foam / mist / spray | +4 |
| Signage / rail framing / debris | +3 |
| Structural increase | **+15** |
| Conservative multipass / bloom / visibility allowance | **+13** |
| Task 8 internal working ceiling | **170 total** |

Task 8 must pass the PRD cap and is additionally expected to remain at or below **170 total draw calls** so at least **80 calls of headroom** remain for Task 9.

Other active performance gates:

- visible triangles target ≤750,000
- Medium 1920×1080 median ≥60 FPS
- Medium 1920×1080 p95 frame time ≤18.3 ms
- no sustained >50 ms sequence under normal race load

If Task 8 exceeds the 170-call internal ceiling, optimize before owner preview rather than consuming Task 9 headroom.

## File-by-file implementation plan

### New

- `src/game/track/FallsRunVisual.ts`
  - Task 8 presentation owner
  - sky / horizon helper
  - wet-road overlay
  - luminous edge lines
  - elevated deck structures
  - city silhouettes and windows
  - ambient waterfall system
  - bounded mist / spray
  - Falls Run signage
  - visual broken-rail framing / debris
  - quality-scaled instance counts

- `tests/neon-grid-scene.test.ts`
  - failing-first Task 8 scene tests
  - progress locality
  - group names
  - bounded Low / Medium / High instance counts
  - finite transforms
  - no new runtime textures or lights
  - retained Billboard, Service Tunnel, Waterfall Dive and boost-pad groups

- dated Task 8 evidence directory under `docs/evidence/`

### Modify

- `src/game/track/createNeonGridScene.ts`
  - construct the approved Falls Run visual group
  - preserve all existing gameplay and shortcut scene geometry

- `src/game/track/trackCatalog.ts`
  - pass existing graphics-quality context to Neon Grid scene presentation

- `src/game/KartTimeTrial.ts`
  - provide the already-owned `GraphicsQuality` value to selected-track scene creation
  - no simulation behavior change

- `docs/IMPLEMENTATION-STATUS.md`
  - record Task 8 implementation / validation / owner-review gate

- `docs/TESTING.md`
  - record Task 8 visual and performance validation method

- `docs/DECISIONS.md`
  - only if a durable reversible technical decision from implementation needs recording

No change is planned to `NeonGrid.ts`, `NeonGridDive.ts`, `NeonGridCollision.ts`, `NeonGridGeometry.ts`, `WaterfallSpillwayVisual.ts`, kart physics, AI, items or balance code.

## Validation and evidence

Implementation sequence after this approved-plan checkpoint:

1. Add the two approved target WebPs at the authoritative design paths.
2. Write Task 8 scene tests failing-first.
3. Implement Falls Run presentation only.
4. Run focused preservation tests.
5. Run `git lfs pull`, `npm ci`, `npm run validate`, `git diff --check`, and `git lfs fsck`.
6. Run real eight-racer runtime captures at Medium 1920×1080.
7. Acceptance:
   - draw calls ≤250 measured
   - Task 8 engineering target ≤170 measured
   - p95 frame ≤18.3 ms
   - triangle and resource counters recorded
8. Capture Low / Medium / High desktop and mobile-shaped views of the Task 8 stretch and verify road edges, driver readability, waterfall masking and gold-tell readability.
9. Publish an isolated pinned Task 8 preview.
10. Verify exact hosted source / hashes.
11. **STOP for owner visual review.**

Task 9 MUST NOT start without a separate approval after the Task 8 visual review.

## Known target limitations accepted by the plan

The reference composition is achievable within the approved budget, but Task 8 does not promise:

- photoreal mirror reflections
- hundreds of bespoke textured towers
- simulated fluid dynamics
- true volumetric fog
- a cockpit-camera replacement
- a full-screen rain particle system

Those literal effects are replaced by the approved fake-specular asphalt, instanced silhouette city, shader waterfall sheets, bounded mist cards and the existing accepted camera.

---

**Owner approval:** Manny approved this plan on 2026-10-05 and authorized Step 2 implementation only after this plan is durably recorded in the repository.
