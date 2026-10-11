# Neon Grid Stage 4 Task 9 — T9.1 evidence

## Scope

T9.1 only: shared Neon Grid presentation helpers plus lifecycle ownership/freeze behavior. No course-wide visual expansion is included.

## Input and verified runtime

- T9.0 input head: `3b7ded9ff009e0cf1163b6ba6b96b0fcd57085b9`.
- T9.1 implementation commits: `a8e7fcdf8faef987e24ec799043157280e8f70d4`, `1f4296ae7836f65d8033e95c4a8cfd266f9b46d3`, `876d90cc5d284885f9a5ef041fe87fab9fb00590`.
- Verified runtime/test head: `876d90cc5d284885f9a5ef041fe87fab9fb00590`.
- PR #242 remains draft/open/unmerged.

The first candidate exposed one missed helper rename in the mist placement loop; hosted typecheck caught it. The next candidate exposed one unbound-method lint assertion in the new disposal test; hosted lint caught it. Both were corrected without widening T9.1 scope. The final run is green.

## Changes

- Added `src/game/track/NeonGridVisualCommon.ts` with the genuinely repeated track-local right-vector calculation and bounded ribbon-geometry builder extracted from the accepted Falls Run implementation.
- Refactored `FallsRunVisual.ts` to use those helpers. The helper body preserves the previous sampling, width clamp, UV distance accumulation, indices, normals and progress-range metadata.
- Added explicit idempotent `FallsRunVisual.dispose()`; it uses the existing track-scene resource disposer and clears the owner subtree, so later whole-scene cleanup does not dispose the same owned resources again.
- Added visibility-aware presentation time accumulation. Hidden intervals update the source-time boundary but not shader time; resume continues from the prior visual clock rather than jumping across the hidden interval.
- Promoted only the disposal and hidden-freeze T9.0 contracts from `it.fails` to ordinary `it` and strengthened them with exact-once geometry/material/texture disposal and resume-without-catch-up assertions.
- Left exactly two future RED contracts in place for sector owners and future wet-road quality/compositing behavior.

## Hosted validation

CI run `37643865611` completed successfully on the verified head.

- Validate job `112870109150`: PASS.
  - Git LFS runtime verification: PASS.
  - Typecheck: PASS.
  - ESLint, zero warnings: PASS.
  - Vitest: **127 test files passed; 1006 tests passed; 2 expected failures** (1008 total contract cases).
  - Production build: PASS.
- Spillway render job `112870109653`: PASS.
- Task 8 Falls Run render job `112870109575`: PASS.
- All active preview builds and pinned-runtime validations: PASS.

The six Task 9 cases specifically passed as intended: two frozen Task 8 baseline cases, disposal, hidden freeze, plus the two still-expected future failures under `it.fails` semantics.

## Render/resource evidence

Task 8 Falls Run artifact: `11494291072`; uploaded ZIP SHA-256 `c1fde3d3e4d95ebaeef7b314390527cef0440e6a19200e62189b80dbf1795d54`.

- Desktop Medium 1920×1080: **93 draw calls / 78,604 visible triangles**.
- Maximum observed across the render matrix: **123 draw calls / 78,604 visible triangles**.
- Task 9 engineering ceilings: 200 calls / 300,000 triangles.
- PRD hard caps: 250 calls / 750,000 triangles.
- Remaining engineering headroom at the observed maximum: 77 calls / 221,396 triangles.
- Remaining PRD headroom: 127 calls / 671,396 triangles.

The frozen T9.0 maximum was 125 calls / 88,912 triangles. T9.1 therefore introduces no maximum structural-budget regression. Per-capture values can vary with the rendered view/racer composition, so the checkpoint uses the independent render gate plus the exact Task 8 group/count/compositing tests rather than treating one camera sample as a byte-identical performance fingerprint. SwiftShader frame timing remains diagnostic-only.

## Preserved boundaries

No Skyline, Undercity or Falls-extension scenery; no approved Task 9 billboard runtime integration; no new wet-road sector passes; no visibility/LOD/culling architecture; no 300 m far-plane change; no gameplay, collision, physics, AI, items, checkpoints, balance, audio or shortcut changes; no PR #242 merge or production publication.

## Stop gate

T9.1 is complete. T9.2 Skyline Straight is the next step in the already approved Task 9 plan. This execution stops here and does not begin T9.2.
