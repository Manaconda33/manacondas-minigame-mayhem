# Slice 6 - Circuit Alpha Material Coordinates and First PBR Pass

**Date:** 2026-09-18  
**Status:** IMPLEMENTED ON FEATURE BRANCH / PUBLICATION PENDING  
**Scope:** Second bounded Slice 6 engineering increment

## Objective

Introduce the minimum reusable material-coordinate architecture required by Circuit Alpha's procedural strips, then apply one small provenance-tracked PBR material set to the asphalt road without changing track topology, collision, race authority, gameplay balance, racer statistics, item behavior, approved likenesses, approved kart identities, or Route Night's locked visual language.

## Material-coordinate architecture

`TrackMaterialCoordinates.ts` now generates deterministic UVs for the procedural loop and bounded segment strips.

- Material scale is expressed in world meters; the current baseline is **2 m per texture tile**, matching the source material's documented physical width.
- The closed road loop chooses an integer number of longitudinal repeats nearest the physical lap length divided by 2 m. The duplicated closing vertices therefore land on an integer V coordinate and the repeating texture can close without a fractional seam.
- Lateral U coordinates remain meter-derived rather than normalized per mesh, so adjacent strip widths retain a consistent material scale.
- Bounded segment strips use cumulative centerline distance for monotonic longitudinal coordinates.
- Existing positions, indices, normals, topology, track samples, collision/race geometry, and gameplay projection remain unchanged.
- Shoulder and dirt strips receive the same reusable UV architecture but remain on their existing color-only materials in this pass.
- Approved kart GLBs are untouched; no kart is UV-remapped.

## First PBR pass

Only two existing render surfaces consume the external material in this checkpoint:

- `track-road`
- `asphalt-racing-wear`

Both share one Poly Haven **Asphalt Track** 1K texture set:

- diffuse/albedo;
- OpenGL normal;
- roughness.

The racing-wear overlay uses the same source maps with a darker tint and lower normal strength. No displacement, parallax, AO map, metallic map, environment map, or new post-processing effect is added.

The material source and exact runtime hashes are recorded in `docs/ASSET-PROVENANCE.md`.

## Budget envelope

Runtime files total **2,150,973 bytes (~2.05 MiB compressed)**.

A conservative decoded GPU estimate for three 1024 x 1024 textures at four bytes per texel plus a full mip chain is approximately **16 MiB**. The maps are shared by both asphalt materials, so the second material does not double texture residency.

This is intentionally small relative to the PRD Medium-preset target of **<=256 MB approximate GPU texture residency** and the **<=45 MB compressed first-playable Kart Racer package** target. This checkpoint does not claim the final Medium-preset performance gate; full rendered performance/residency measurement remains a later Slice 6 task.

## Lifecycle hardening

Introducing external textures makes explicit scene-resource cleanup necessary. `disposeTrackScene` now deduplicates and disposes track textures, materials, and geometries before clearing the track root, and `KartTimeTrial.dispose()` invokes it during race teardown. Shared asphalt textures are disposed exactly once.

This is preventive Slice 6 memory hygiene, not a gameplay change. The PRD's final five-restart memory certification remains a later gate.

## Automated evidence required before publication

The checkpoint must pass:

- normal repository Git LFS materialization / `git lfs fsck` for existing governed assets;
- exact JPEG signature and SHA-256 verification for all three normal-Git 1K runtime maps;
- deterministic loop and segment UV tests;
- closed-loop seam coordinate test;
- track-sample immutability test;
- shared-map PBR material configuration test;
- track resource-disposal deduplication test;
- strict TypeScript;
- zero-warning lint;
- complete Vitest suite with coverage;
- branding/runtime-asset verification;
- production build.

## Deployed visual review after publication

The live checkpoint should be reviewed for:

1. asphalt reads as materially richer than the prior flat-color road;
2. no obvious UV seam, reversal, extreme stretching, or crawling along the closed loop;
3. road and racing-wear scale feel coherent rather than miniature or gigantic;
4. Circuit Alpha retains its approved dusk/twilight identity;
5. dirt lane, shoulder, ramp, boost pads, guardrails, checkpoints, and track topology remain visually/physically in their established locations;
6. approved racers/karts and race HUD remain unchanged by this increment; and
7. restart/hub flow shows no obvious missing-material artifact after teardown/re-entry.

This visual review is a bounded material acceptance check. It is not the final Slice 6 performance, memory, browser-matrix, or release-candidate acceptance gate.

## Boundaries

No gameplay balance, item probabilities, item behavior, racer statistics, AI tactics, checkpoint/lap authority, track topology, avatar likenesses, kart identity/geometry, dependency set, public hosting configuration, or Route Night UI language changes in this increment.
