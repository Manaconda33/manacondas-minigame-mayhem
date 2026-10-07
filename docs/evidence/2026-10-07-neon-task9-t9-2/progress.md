# Neon Grid Stage 4 Task 9 — T9.2 Skyline Straight evidence

## Scope

T9.2 only. Extend the accepted Neon Grid presentation language through Sector 1 Skyline Straight, progress 0.000–0.24654910452879084, and prove the approved Skyline masking/budget/lifecycle contracts without beginning Undercity or Falls Run extension work.

## Input and verified runtime

- T9.1 documentation head / T9.2 input: `dfcf48408a0e96791009bb6806b8b4740e5bd2b4`.
- T9.2 runtime/test head: `28c8bd2f6fbddffa2d586aa265796a327f81be09`.
- Hosted CI: `37662836256`, SUCCESS.
- PR #242 remains draft/open/unmerged.

T9.2 commits before documentation:
- `910fadefaa5e3e861abacfa63d82649ac467d9f2` — Skyline presentation owner and contracts.
- `99eb9e6153c5081b55ef0d776e011705cc709292` — approved Skyline runtime ad bytes and verifier.
- `96580537fea1000a07daf5796b7a8190e14e99fc` — asset delivery provenance / ADR-106 addendum.
- `7072a794b08b98c0a6e2afe54fe3c58682c66a73` — lint-only object-shape style correction.
- `5b5889e5e69a8955ecfa8df91f019ba8a16d369b` — Skyline render-readiness CI gate.
- `28c8bd2f6fbddffa2d586aa265796a327f81be09` — test timeout adjusted to the same 20 s budget used for other three-quality scene-construction contracts.

## Runtime changes

`SkylineVisual` owns presentation only. It adds:
- `skyline-asphalt-base`;
- Medium/High `skyline-wet-asphalt`, omitted on Low;
- `skyline-cyan-edges` with Billboard aperture spans omitted;
- `skyline-deck-fascia`;
- 14 `skyline-pylons`;
- 24 `skyline-cross-braces`;
- 22 `skyline-city-towers`;
- `skyline-city-windows`: 120 Low / 240 Medium / 360 High;
- 18 `skyline-procedural-signage`;
- three `skyline-ad-manaconda-racing` instances;
- three `skyline-ad-taco-bell-live-mas` instances.

The new static mask ads have no ON/OFF state, flicker cadence, arrows, chevrons, route guidance or balance semantics. The existing Billboard Gap Paprika/Arin/Raven hologram and its accepted race-time behavior remain unchanged.

T9.2 establishes the second animated sector presentation owner, so the previously Falls-Run-local hidden/resume clock was extracted to `NeonGridVisualClock` and reused by Falls Run and Skyline. The accepted Falls Run hidden-time contract remains passing.

## Approved runtime assets

The already owner-approved review derivatives were copied byte-for-byte to the runtime path under the approved narrow normal-Git exception.

| Asset | Runtime path | Bytes | SHA-256 |
| --- | --- | ---: | --- |
| Manaconda Racing | `public/assets/track/neon-grid/signage/manaconda-racing-v1.webp` | 192,220 | `481feb4ff34635abad29dd4f65b39975e73c227eb0a53901a51028c5e9fe7d22` |
| Taco Bell / Live Más | `public/assets/track/neon-grid/signage/taco-bell-live-mas-v1.webp` | 97,524 | `d289bc4dbc10872d6c75aa4ae650aaf716bf83a9ea36da12ce0cdc021e7bea7e` |

Runtime Git blob IDs match the preserved review derivatives exactly: Manaconda `fc26f60fd33899a9da36db42882bb139a200eedb`; Taco Bell `e958b04842ff4f98d252b0abf0ba7c7d26834bcc`.

No Nightshift Noodles or Voltline Industrial runtime integration occurred in T9.2.

## Contracts

New Skyline tests verify exact owner range/quality, finite instance transforms, exact quality counts, Low wet-road bypass, transparent compositing safety, hidden-time freeze, idempotent disposal and static-ad separation from the Billboard tell.

The aggregate T9.0 future contracts now intentionally name only:
- `undercity-visual`;
- `falls-run-extension-visual`;
- `undercity-wet-asphalt`;
- `falls-run-extension-wet-asphalt`.

Exactly two future `it.fails` remain for T9.3/T9.4.

## Hosted validation

CI `37662836256` completed successfully on `28c8bd2f6fbddffa2d586aa265796a327f81be09`.

- Validate `112934951587`: PASS.
  - Git LFS runtime verification: PASS.
  - Typecheck: PASS.
  - ESLint with zero warnings: PASS.
  - Vitest: **128 files passed / 1011 tests passed / 2 expected future failures** (1013 contract cases).
  - Approved Task 9 Skyline ads verifier: **2/2 exact 1024×512 hashes PASS**.
  - Existing sponsor, terrain, character, audio and runtime asset verifiers: PASS.
  - Production build: PASS.
- Task 8 Falls Run render `112934950981`: PASS.
- Spillway render `112934951521`: PASS.
- T9.2 Skyline render `112934951571`: PASS.
- All pinned-runtime validations and active preview builds: PASS.

## Skyline render evidence

Artifact `11502245930`; ZIP SHA-256 `a0664078fb26e547fa0425281f44bd448d6ab27bcf667dea2152bea14b164f1d`; 1,899,822 bytes.

| Capture | Calls | Triangles | Key quality evidence |
| --- | ---: | ---: | --- |
| Desktop Medium 1920×1080, Skyline visible | 114 | 71,612 | 240 windows, wet overlay, 3+3 approved ads |
| Same camera, Skyline hidden | 103 | 66,876 | A/B control |
| **Skyline delta** | **+11** | **+4,736** | approved allowance ≤+18 calls |
| Desktop Low | 113 | 68,792 | 120 windows, wet omitted |
| Desktop High | 112 | 81,624 | 360 windows, wet present |
| Mobile Low | 112 | 75,148 | 120 windows, wet omitted |
| Mobile Medium | 112 | 74,186 | 240 windows, wet present |
| Mobile High | 115 | 87,100 | 360 windows, wet present |
| Desktop rear Medium | 106 | 151,196 | rear-view readability |

Maximum across the Skyline matrix: **115 draw calls / 151,196 visible triangles**. This leaves 85 calls / 148,804 triangles beneath the Task 9 engineering ceilings and 135 calls / 598,804 triangles beneath the PRD hard caps.

The concurrent Task 8 Falls Run gate also passed with maximum **135 calls / 98,776 triangles**, proving Skyline did not break the accepted Task 8 render-readiness gate.

## Visual evidence inspection

The generated desktop chase, desktop rear and mobile Medium captures were inspected directly. Road edges remain clearly cyan/readable, 2D driver sprites remain unobscured by the transparent road pass, static approved ads read as ordinary city signage, and the Billboard route remains visually separate/passable. No route-blocking clipping or driver-sprite compositing defect was observed.

This is an engineering/readability inspection, not the T9.7 full-course owner visual approval gate.

## Performance classification

GitHub Actions Chromium / SwiftShader timing for the Medium Skyline capture: 240 scored frames, median frame time 392.05 ms, p95 396.20 ms, median 2.55 FPS. This is software-rendered diagnostic evidence only. It does not satisfy the PRD's representative-hardware 60 FPS / p95 ≤18.3 ms requirement; T9.6 owns that later evidence.

## Preserved boundaries

No Undercity presentation, no Falls Run extension, no Nightshift Noodles or Voltline runtime integration, no gameplay/collision/physics/AI/items/checkpoints/balance/audio changes, no far-plane/camera policy change, no culling/LOD/render-governance implementation, no PR #242 merge, no production publication and no pinned owner preview.

## Stop gate

T9.2 is complete on the verified runtime. T9.3 The Undercity is next in the approved Task 9 plan. Stop here until explicit continuation.
