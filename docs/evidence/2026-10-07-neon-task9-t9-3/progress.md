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


## T9.3 owner-requested correction review, 2026-10-07

**Owner verdict on earlier 722d9db:** CORRECTIONS REQUIRED / NOT APPROVED. This supersedes any suggestion in this historical file that the initial renderer pass was visually approved. Four observations: unsupported floating props, road-edge/other visible clipping, near-black blocky Undercity architectural detail, and too-small/hard-to-see approved ad billboards. Correction is exclusively Stage 4 T9.3 and does not authorize T9.4 or merge/runtime deployment.

### Reconciliation and exact corrected source

- Main had advanced through workflow-only PR #274 (original T9.3 review pin). Safe merge checkpoint: `1dd6befef42bfe0df82048e42005a4347e4c297f`, no runtime merge to main.
- Corrected runtime/test commit: `42781fb5367a146473c49012e0442e953197e480`.
- Draft runtime PR #242 unchanged in approval status.
- Separate workflow-only review-publication PR #275 pins exact corrected source, retaining old /previews/neon-grid-t9-3/ intact.

### Four bounded changes

1. **Floating geometry:** stopped generating independent floating horizontal utility pipes and light bars, attached both to building walls, grounded all 16 foundation footprints, 20 utility boxes on foot pads, 10 service-bay openings on backing walls, and added 16 loading-bay facade doors; no gameplay collision added.
2. **Road and shoulder clipping:** replaced independent 72-segment magenta edge strips with native dense-edge samples, preserves Service Tunnel aperture skips and compositing depth offset; accepted native driving surface remains byte-identical.
3. **Industrial definition:** multi-stage roof/cornice/annex geometry, visible warehouse doors, roof HVAC forms, facade ribs, slate/violet surface contrast and existing bounded windows. Efficient instancing/merging retain a bounded cost; Skyline polish elsewhere remains T9.7.
4. **Static billboard readability:** 8.55 × 4.15 m (prior 7 × 3.5 m), larger attached support backs, deterministic near-corridor progress targets for 2 Nightshift Noodles and 2 Voltline Industrial billboards. Approved 1024×512 image assets remain exact unchanged bytes. Service Tunnel tell, bidirectional traversal, masks and ad static semantics unchanged.

### Validated acceptance evidence

- CI: [run 37703010562](https://github.com/Manaconda33/manacondas-minigame-mayhem/actions/runs/37703010562) **SUCCESS**.
- LFS/fsck, strict typecheck, zero-warning lint: PASS.
- Vitest: 129 files, 1022 passing tests and 2 intentionally failing future T9.4 contracts: PASS.
- Runtime assets including two owner-approved Undercity 1024×512 WebPs: PASS; production build: PASS.
- Task 8 Falls Run render: PASS; Waterfall spillway: PASS; T9.2 Skyline: PASS; T9.3 Undercity: PASS.
- Corrected Undercity render artifact 11518123864, SHA-256 `d39b43c939ab1e066cb03d01d3279b89a20464e5d758234e92b7a58055d73ee3`: 12 chase/rear, desktop, mobile-landscape, mobile-portrait and sector sweep images; **0 browser/render errors**.
- Canonical 1920×1080 Medium A/B: hidden vs visible Undercity **+18 calls/+7,324 visible triangles**; T9.3 incremental budget +20 calls PASS. Maximum across 12 captures **161 calls/130,486 visible triangles**, Task 9 <=200/300k and PRD <=250/750k PASS.
- Historical reviewed runtime 722d9db A/B was +12/+4,028 and max 153/138,490. Corrected geometric/facade cost +6 canonical calls/+3,296 triangles, remaining within allowances. No budget exception requested.
- Software WebGL diagnostic-only performance: median **2.067 FPS**, p95 **491.2 ms**; not comparable representative-hardware evidence and not T9.6 FPS acceptance. Device performance should be observed in owner's preview playtest.
- Previous candidate run `37702311362` passed all render jobs but failed two existing race-diagnostics 5-second timeouts under concurrent load. The final exact-source run passed 1022 tests and no test thresholds were changed.
- Human screenshot review: multi-view sweep showed better supported road-facing structures, recognizable authored signs in closer frames, and no clear new road interference in available static captures. **This is not a blanket claim of visual acceptance**; the owner must verify full driving behavior including shortcut entry/exits, billboard legibility at speed and mobile portrait usability.

### Approval gate

Staged isolated corrected Pages review path: `/previews/neon-grid-t9-3-correction/` pinned to `42781fb5367a146473c49012e0442e953197e480`, workflow-only PR #275; production and original T9.3 preview remain preserved. STOP after Pages deployment/hash checks and provide URL. **T9.3 owner APPROVAL PENDING; no T9.4, no #242 merge, no production adoption.**
