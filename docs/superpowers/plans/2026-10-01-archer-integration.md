# Archer Roster Integration Plan

> **For agentic workers:** Use superpowers:executing-plans to implement this existing approved scope inline. Steps use checkbox syntax.

**Goal:** Deliver Archer as a unique thirteenth racer on Character Select page two, preserving the accepted twelve drivers and eight-racer race.

**Architecture:** Reuse the approved manifest, asset pipeline, sprite fallback selector, race roster sampler and Character Select layout. Add pagination state in the application and page-aware roster markup. Publish deterministic kart geometry through the existing Actions bridge; use current normal-Git exceptions for fixed-size 2D art.

**Tech Stack:** TypeScript, Three.js, Vitest; Python deterministic GLB builder.

**Spec:** docs/avatars/ARCHER.md; docs/assets/ARCHER-ASSET-BRIEF.md.

## Global Constraints

- Existing AA-01–AA-12 profiles stay assigned; Archer AA-13 has 8/5/4/8/7/4, totaling 36.
- First twelve on page one; Archer on page two. Eight racers per race, no duplicate drivers.
- Thirteen kart nodes, four materials, -Z forward and shared PI visual yaw; LOD budgets 25,000 / 12,000 / 5,000.
- All ten driver states and base-aware revisioned art URLs; preserve rear/front fallback behavior.
- Existing accepted graphics, audio, items and manual gates stay closed absent a regression.
- Geometry approval does not authorize merge or production activation.

## Review Focus

- Returning to selection after racing Archer should reopen his page.
- Moving between roster pages preserves selection until a driver is chosen.
- Keyboard, mobile landscape and portrait must reach both page buttons.
- Each camera must mount driver hands/body relative to the modeled steering wheel without clipping.
- AI selection remains seven unique opponents and excludes the selected player.

### Task 1: Approved kart repository delivery

**Files:** tools/assets/build_archer_kart.py; tools/assets/test_archer_kart_contract.py; public/assets/characters/aa-13/kart.glb and lod/; temporary branch-scoped materialization workflow.

- [x] Owner approves Candidate 3 geometry.
- [x] Validate actual three-LOD binaries, budgets, metadata and deterministic rebuild hashes; wheel orientation regression passes.
- [x] Publish builder, approved object pointers and pinned branch-scoped bridge; require remote rebuild hashes, unchanged pointers and upload/fetch-back/fsck.
- [x] Remove temporary workflow; record successful run/object IDs.

### Task 2: Driver mounting review

**Files:** Archer mount review tool/evidence; candidate manifest positions after review.

- [x] Render all ten states with approved geometry and runtime normalization/shared yaw in chase and rear views.
- [ ] Verify modeled wheel hands/body clearance and facing; record exact mounts and owner review.
- [x] Resolve kart display name before active manifest entry.

### Task 3: Page two and runtime integration

**Files:** src/characters/manifest.ts; src/ui/characterSelect.ts; application selection state/listeners; relevant CSS; results-art mappings; tools/verify-runtime-assets.mjs; tests/character-manifest.test.ts; tests/character-select-ui.test.ts; tests/race-roster.test.ts.

- [ ] Write/run failing tests for thirteen unique profiles, seven AI opponents excluding Archer, page-one/page-two cards and selected-page restoration.
- [x] Add approved stats/art/kart/mounts to manifest, controlled revision, results poses, and exact asset gate.
- [x] Implement page-aware roster markup and previous/next handlers without losing selection; retain responsive controls.
- [x] Run focused tests, npm run validate, diff and LFS checks; review whole feature diff.
- [ ] Prepare gameplay review with rendered desktop/mobile evidence. Owner review precedes separate merge/production approval.

## Execution evidence

Named delivery bridge `36892887641` and CI `36892887671` passed; workflow removed. Archer manifest/page-two flow/results/AI/batching tests implemented. Manifest test observed failing before integration, then focused suite passed. Expanded real-GLB batching test exposed its single-mesh steering assumption; ancestor-aware control grouping passed all thirteen models with unchanged runtime batching. All 734 tests passed; build initially rejected invisible RGB in the byte-identical approved reaction original. Ruling: preserve the exact approved original and scope only the transparent-RGB derivative rule to the existing packages; retain exact hash, full decoding, transparent corners and opaque chroma-matte rejection for Archer. Subsequent build passed. Browser socket bind denied and fallback Chromium download failed; actual camera/responsive owner review is pending.

Final refresh: merged selective-bloom main `e4defab83b19fcd7a94d27b8ddb361e3b34fadc5`, resolving only concurrent documentation additions by preserving both. Full validation 95 files /750 tests passed; build, exact assets, diff check and LFS fsck passed. Fresh whole-feature review found no Critical/Important issues. Deferred minor findings: post-race change-driver restoration lacks a separate regression (code inspected; menu/play covered), and manifest test label still says twelve. Review output and three deterministic offline mounting sheets committed under Archer evidence. Actual rendered owner review remains pending.
