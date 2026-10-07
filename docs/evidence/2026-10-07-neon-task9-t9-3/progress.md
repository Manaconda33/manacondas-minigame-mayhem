# Neon Grid Task 9 T9.3 — Undercity evidence

Date: 2026-10-07 America/Chicago

## Scope

T9.3 only. The Undercity presentation is added for progress 0.24654910452879084–0.46154128347522666. No gameplay, physics, AI, item, checkpoint, shortcut balance, audio, camera-policy, culling/LOD, T9.4 Falls extension, T9.7 Skyline polish, production merge or production publication authority is included.

## Checkpoints

- Reconciled branch / main merge: f745aab6cfd9a6fb454cef919afca17310ccf3d0
- Verified T9.3 runtime: 722d9db1c1867f2a1516843679bb30a4ca37a2ea
- PR: #242, draft/open/unmerged

## Runtime content

- `UndercityVisual` presentation owner.
- Dense-main-ribbon-conforming asphalt presentation.
- Medium/High magenta wet overlay; Low bypass.
- 16 stepped building masses.
- Windows: Low 80 / Medium 160 / High 240.
- 20 utility boxes.
- 26 pipe instances.
- 24 work lights.
- 10 ordinary service-bay masks.
- Nightshift Noodles: 2 architecture-mounted static placements.
- Voltline Industrial: 2 architecture-mounted static placements.
- Service Tunnel gameplay authority remains outside the presentation owner.

## Automated validation

GitHub Actions run: 37691248131 — PASS.

Validate:
- Git LFS materialization/fsck: PASS.
- Typecheck: PASS.
- Lint: PASS.
- Test files: 129 passed.
- Tests: 1021 passed + 2 intentional future `it.fails`.
- Runtime asset verification: PASS, including both exact Undercity WebPs.
- Production build: PASS.

Preservation renders:
- Task 8 Falls Run: PASS.
- Waterfall spillway: PASS.
- T9.2 Skyline: PASS.

T9.3 rendered readiness:
- Job: 113031688689 — PASS.
- Artifact: 11513701620.
- Artifact ZIP SHA-256: da5118b083f27ba3c30197e67eb570bfd9b0ec7a2a40580b835d22ea4dadcdcd.
- Medium 1920×1080 A/B Undercity delta: +12 draw calls / +4,028 visible triangles.
- Maximum across desktop/mobile/rear capture set: 153 draw calls / 138,490 visible triangles.
- Task 9 engineering ceilings: <=200 / <=300,000 — PASS.
- PRD caps: <=250 / <=750,000 — PASS.
- SwiftShader median FPS: 3.9448; p95 frame time: 310 ms — diagnostic-only, not representative-hardware certification.

## Owner gate

Automated implementation/readiness is passed. Next action is a distinct pinned T9.3 owner-review preview from exact runtime 722d9db with production bytes preserved. Stop after publication for Manny visual/playability review; do not begin T9.4 from this checkpoint.
