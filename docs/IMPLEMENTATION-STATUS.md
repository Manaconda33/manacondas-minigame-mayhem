# Implementation Status

## Current slice

**Slice 5 - Item Boxes, Weapons & Position-Based Distribution - NITRO SURGE LIVE ACCEPTED / NEXT ITEM INCREMENT AWAITING APPROVAL**

PRD baseline: **v1.1, working implementation amendment 2.3**.

Slice 3 Character Selection & Avatar Ingestion is **COMPLETE / LIVE ACCEPTED**. The already-completed out-of-order Slice 4 AI/grid checkpoint remains retained. Slice 5 is active under the approved `docs/SLICE-5-ITEM-SYSTEM-DESIGN.md` contract and ADR-061. Slice 6 remains locked.

The first Slice 5 foundation increment merged through PR #97. The visible item-box increment merged through PR #98 at `3d216c99afe763f6641ffa5930a4685ac82dc178`, deployed successfully, and Manny live accepted its four item-box rows, pickup presentation, shared-world disappearance/refresh/fade behavior, and one-slot collection contract on 2026-09-05. Main then recorded that acceptance at `15868a7899ab774b8b2bf34d6f409ffee3dcef25` with CI run `34001057413` passing.

Manny approved PR #99 on 2026-09-05. The bounded roulette / held-item HUD / desktop-mobile ITEM input checkpoint squash-merged to `main` at `574d979f1ad59ebdce386525fdb483f821254457`. Post-merge CI / Pages run `34011338953` passed LFS verification, dependency installation, typecheck, zero-warning lint, all tests, production build, Pages artifact upload, and deployment. Pages artifact `9982552507` has digest `sha256:945f3588b045b1a8b0a0a10fe41d356ba8812a0b945593ae714f148f3279d1c9`.

Manny then completed the deployed desktop/mobile acceptance matrix and reported **all eight checks passed**: roulette timing, pause freeze, held-item HUD readability, multi-charge display, desktop forward input, desktop backward input, mobile ITEM layout/direction, and the one-slot no-consumption contract. This checkpoint is therefore **LIVE ACCEPTED**.

Manny approved the next bounded Slice 5 increment on 2026-09-05: **RacerEffects foundation + Nitro Surge**. Branch `feature/slice-5-racer-effects-nitro-surge` is based on accepted `main` checkpoint `712820209274c8e520ca31dacbda0cb87da44a54`. The validated implementation checkpoint is `b3e91f77d8d9985771820470f865272eaa52d6be`. It adds a generic temporary-boost effect boundary and makes Nitro Surge the first real consumable item effect while intentionally leaving every other item unsupported/unconsumed.

Validation run **34012300286** passed Git LFS verification, `npm ci`, strict typecheck, zero-warning lint, **23 Vitest files / 127 tests**, **90.43% overall statement coverage**, **93.26% `game/items` statement coverage**, 100% coverage for `RacerEffects.ts`, existing three-lap AI integration, the ten-minute numeric soak, branding/runtime-asset checks, `git diff --check`, and the production Vite build. Earlier guarded validation runs exposed only synthetic controller-test ground-boundary mistakes; those fixtures were corrected without weakening any product assertion or quality gate.

Manny approved PR #100, which squash-merged to `main` at **`5f41f8fe68e361e451d12c195d2842f05de56ebf`**. Post-merge CI / Pages run **34012662528** passed validation and deployment. Pages artifact **9982946836** has digest `sha256:b46ea5e917f8488e799fee67945f737e98e4a4b10d6915353b2a13fd7908115c`. Before live acceptance, Manny approved a corrective checkpoint adding a reusable player-only forced-item URL harness and a visible Nitro Surge activation tell. Correction validation run **34014080375** passed the full repository gate with 25 Vitest files / 131 tests, including all fifteen forced-item IDs, player-only isolation, Nitro VFX lifecycle, existing AI integration, runtime-asset verification, and the production build.

PR #101 then squash-merged to `main` at **`d732c989f87e2e76688590214c666843b58bad4b`**. Post-merge CI / Pages run **34027395842** passed validation and deployment. Pages artifact **9987498825** has digest `sha256:7da4cb6c6bb395e4a63b00bd15aa204a3139ae7e4809a3a0dc50113da77d8ed3`.

**Approval gate:** Nitro Surge is live accepted. Do not begin the next item-effect increment until Manny explicitly approves it. Slice 6 remains locked.

## Slice 5 RacerEffects + Nitro Surge checkpoint

Implemented behavior:

- `RacerEffects` owns pause-safe temporary racer drive modifiers independently of item names;
- Nitro Surge configuration is data-driven at approximately **2.4 seconds**, **1.18x** normal speed cap, **1.50x** acceleration authority, and off-road **speed-penalty** bypass under approved PRD amendment 2.3;
- the earlier 1.35x / 1.2-second engineering values are superseded by Manny's deployed-playtest balance approval;
- off-road Traction/surface acceleration still applies while Nitro is active; only the off-road speed ceiling penalty is bypassed;
- Nitro Surge activates only after roulette has resolved, then `commitUse()` consumes the successful use and immediately frees the one inventory slot;
- unsupported item IDs still return without consuming their held charge or freeing inventory;
- effect expiry restores normal cap/surface behavior cleanly;
- pause stops effect-time progression because RacerEffects advances only with race simulation;
- active Nitro state is exposed in the race status label as `NITRO SURGE ACTIVE`; and
- the existing AI-only top-speed allowance remains independently clamped to 1.00-1.04.

Automated evidence from run **34012300286**:

- Git LFS checkout / `git lfs fsck` - PASS;
- `npm ci` - PASS, 198 packages, 0 vulnerabilities;
- strict TypeScript - PASS;
- ESLint zero warnings - PASS;
- Vitest - **23 files / 127 tests passed**;
- overall statement coverage - **90.43%**;
- `game/items` statement coverage - **93.26%**;
- `RacerEffects.ts` - **100% statements / branches / functions / lines**;
- Nitro sustained-cap, acceleration, grass speed-override, restoration, pause, consumption, unsupported-item, and cleanup regressions - PASS;
- existing AI three-lap integration and ten-minute numeric soak - PASS;
- branding, 10 archived Cleo hashes, 36 runtime GLBs, 105 runtime PNGs - PASS;
- `git diff --check` - PASS; and
- production Vite build - PASS.

The known large `KartTimeTrial` chunk warning remains non-blocking at approximately 3.52 MB minified / 1.27 MB gzip. No new production defect is recorded.

PR #101 is merged and deployed. The deterministic Nitro acceptance pass succeeded on checks 1-5 and 7-12; acceleration worked but felt insufficiently significant, and the 1.2-second duration felt too short. Manny approved a bounded tuning correction to 2.4 seconds and 1.50x acceleration while keeping the 1.18x speed cap and all other Nitro behavior unchanged. Tuning validation run **34028687379** passed the full repository gate before publication review. Clean-diff validation run **34028763753** repeated the full repository gate after removing unrelated markdown formatting churn.

PR #102 squash-merged to `main` at **`6c1099ea7cda655e3776a371dccbfa34e9e2de5b`**. Post-merge CI / Pages run **34029597094** passed validation and deployment. Pages artifact **9988166295** has digest `sha256:bae1a207a8c5c337be391d1a485bed4271ab7c9702d383993e9a4a864aa8b508`. Manny then reran the focused deterministic Nitro Surge acceptance and reported **all four checks passed**: 1.50x acceleration feels clearly significant, approximately 2.4 seconds feels appropriate, VFX/HUD remain synchronized through clean expiry, and the normal URL retains unforced governed item selection. **Nitro Surge is LIVE ACCEPTED as of 2026-09-06.**

## Slice 5 roulette / held-item HUD / input checkpoint

Implemented behavior:

- the actual item remains selected and frozen at item-box collection time using the existing rank/gap selector;
- a deterministic presentation-only roulette runs for approximately **0.85 seconds** without rerolling the held item;
- roulette time advances only with race simulation and therefore freezes while paused;
- the one-slot HUD exposes empty, roulette, and held phases with original item glyphs, names, and charge counts;
- multi-charge items remain in the same slot and display remaining versus total charges;
- desktop ITEM input is **Left Shift or E** after reveal;
- **S / Down + ITEM** records backward-use intent;
- mobile gameplay adds a dedicated **ITEM** control, while **Brake/Reverse + ITEM** records backward-use intent;
- input during roulette is rejected;
- input after reveal records a short forward/backward HUD confirmation but intentionally does **not** consume or fire the held item yet; and
- charge consumption is isolated behind `ItemSystem.commitUse()` so the later effect-dispatch increment can consume only after a successful real effect.

The no-consumption behavior is deliberate for this bounded checkpoint. Because item effects are not implemented, consuming a charge would create a fake use path and incorrectly free the real one-slot inventory. A held item therefore continues to block additional item-box pickup until a later effect implementation successfully commits use.

Validation run **34010274590** passed after the branch corrected strict-lint findings and materialized Git LFS assets in the validation checkout. Evidence from the final successful run:

- Git LFS checkout and `git lfs fsck` - PASS;
- `npm ci` - PASS, 198 packages installed;
- strict TypeScript typecheck - PASS;
- ESLint with zero warnings - PASS;
- Vitest - **22 files / 119 tests passed**;
- overall statement coverage - **90.34%**;
- `game/items` statement coverage - **93.36%**;
- item HUD and touch-control focused tests - PASS;
- three-lap AI integration and existing physics regressions - PASS;
- branding verification - PASS;
- 10 archived Cleo hashes, 36 materialized runtime GLBs, and 105 runtime PNGs - PASS; and
- production Vite build - PASS.

The known large `KartTimeTrial` production chunk warning remains non-blocking at approximately 3.52 MB minified / 1.27 MB gzip and is not introduced as a Slice 5 functional defect.

### Product-owner live acceptance — PASSED

Deployed checkpoint: `574d979f1ad59ebdce386525fdb483f821254457`

- roulette starts on pickup and resolves at approximately 0.85 seconds — PASS
- pausing during roulette freezes roulette progression until resume — PASS
- held-item glyph/name presentation is readable — PASS
- governed multi-charge counts display correctly — PASS
- Left Shift and E register forward desktop ITEM intent — PASS
- S / Down + ITEM registers backward desktop intent — PASS
- mobile ITEM control layout and forward/backward direction input — PASS
- held items remain unconsumed and continue blocking a second pickup before effects exist — PASS

No defect was reported in this checkpoint. The deliberate no-fire/no-consumption behavior remains correct until the actual effect dispatcher is implemented.

Remaining Slice 5 work includes the other fourteen item effect implementations, projectiles, hazards, buffs/debuffs and counters, Hyper-Drive Rocket autopilot, AI tactical item use and hazard response, performance/cap evidence, cleanup/soak evidence, and final full-slice live acceptance.

## Alex integration and deployment checkpoint

Alex is active in `characterManifest` as **AA-01 Feather Sprinter** under controlled revision `alex-runtime-20260905-1`:

- Speed 6
- Acceleration 9
- Weight 2
- Handling 8
- Mini-Turbo 7
- Traction 4
- Kart: **The Neon Vector**
- Chase-facing driver position: `[0, 0.92, -0.12]`
- Camera-facing driver position: `[0, 0.84, -0.12]`
- Kart orientation: `NEGATIVE_Z_KART_VISUAL_YAW`

The approved Alex rasters are wheel-free and the Neon Vector supplies exactly one modeled steering wheel. Candidate 3's rear cockpit-to-thruster conduits remain exposed in the approved offline and deployed geometry reviews.

Candidate 3 geometry is pinned locally at 10,396 / 6,444 / 3,420 triangles for LOD0 / LOD1 / LOD2. The runtime verifier covers all three GLBs and eleven Alex PNGs, including transparent-corner and `extras.forward: "-Z"` checks.

Full local validation passed on 2026-09-05 after `npm ci` installed 198 packages from the committed lockfile. `npm run validate` passed strict typecheck, zero-warning lint, 18 Vitest files / 93 tests, 89.71% statement coverage, branding, 36 materialized runtime GLBs, 105 decoded runtime PNGs, and the production Vite build. `git lfs fsck` passed; deterministic LOD rebuilds matched all three approved GLB SHA-256 values; and the ten-state offline attachment sheet matched at SHA-256 `a875c7456b6fa2cea13d0d953d6033000bda7235dc28666da77441e7367c07fa`. The existing large-chunk warning remains non-blocking.

Publication uses **PR #92 — Integrate Alex and The Neon Vector**. Because the hosted shell could not authenticate a normal HTTPS Git push, the connected GitHub integration published the validated file tree to the feature branch without changing the approved runtime assets. Temporary branch-scoped LFS bridge run **33989497206** rebuilt only Alex's three GLBs with NumPy 2.3.5 and Matplotlib 3.10.8, matched approved object IDs `2df26b2cf70781a410a110a35616fc19506ef014e0140b499b9470f7f5d39e85`, `abf82edd061876d5b2d71ae2f618707ae947d61aa5805a811e1246f011f08b84`, and `dced4db85903cc8b410b1a746608cb1f4fdd7f101192d79bbf2d580fa705d68a`, proved the committed pointers unchanged, uploaded 3/3 objects, deleted its runner cache, fetched the objects back by exact PR-head SHA, and passed `git lfs fsck`. The temporary write-enabled workflow was removed before merge review.

PR CI run **33989589113** passed on final feature head `f667af78d056b43403c85149aa8c8357454a9f1b`. PR #92 merged at `617312394decfcb95af4f8fee6431ee9d339201b`. Main CI / Pages run **33989653688** independently passed LFS materialization and `git lfs fsck`, dependency installation, typecheck, zero-warning lint, tests, production build, Pages configuration, artifact upload, and deployment. Pages artifact **9976234566** has digest `sha256:e2188b050b5047f5985401eac22b5973c035c843ffaff214361ddbea6296e131`. Extracted artifact verification found all eleven Alex PNGs byte-identical to the approved source package and all three materialized GLBs byte-identical to their locked hashes with valid glTF 2 binary signatures.

The live URL is `https://manaconda33.github.io/manacondas-minigame-mayhem/`. A live smoke check loaded the branded landing page, the twelve-slot Character Select, and Alex's controlled 256 x 256 portrait at `alex-runtime-20260905-1`; selecting Alex displayed Feather Sprinter, stats 6 / 9 / 2 / 8 / 7 / 4, and The Neon Vector. The cloud review browser had WebGL disabled and therefore did not supply race-scene evidence. Manny subsequently completed the deployed desktop/mobile product-owner matrix against checkpoint `daf1e3127478981e40cca9533300f8617f61004d` and approved it on 2026-09-05.

### Final Alex product-owner live acceptance — PASSED

- Character Select and race startup — PASS
- chase neutral, steer-left, steer-right, hit, and victory — PASS
- rear-view neutral, steer-left, steer-right, hit, and victory — PASS
- commanded torso rotation and one-hand chase steering silhouettes — PASS
- exactly one modeled steering wheel with correct hand alignment — PASS
- seated occlusion and race-forward kart orientation — PASS
- attached hood motif and clean steering area without pale/render-white or floating geometry — PASS
- exposed cyan/magenta cockpit-to-thruster conduits — PASS
- mobile touch controls, layout, HUD/minimap/results separation, and presentation — PASS
- existing accepted racer regressions — PASS

This approval closes Alex and the final Slice 3 exit gate. It does not authorize Slice 5.

## Dragon Queen publication, correction, and final acceptance

Manny approved Dragon Queen's character lock, definitive visual reference, transformation rights, The Sovereign Wyrm design/name, AA-06 Grip Specialist mapping, portrait Candidate 2, all ten driver states, and Sovereign Wyrm geometry Candidate 2 before publication.

Initial publication completed through:

- Feature branch: `feature/dragon-queen-intake`
- Original completed local/publication checkpoint: `3b7f694e5afcbc668c1eada7e133e61f98adc899`
- Reconciliation checkpoint preserving current-main rollback authority: `4de46328f085e8a279c81f6330e2b30b6f7b7751`
- Pull request: **#89 — Integrate Dragon Queen and The Sovereign Wyrm**
- PR CI run: **33867452643** — passed
- Merge commit: `aef3d92be1ee50d7c4bb6313886b56f8b6478ffe`
- Main CI / Pages run: **33868111838** — validation and deployment passed
- Pages artifact: **9934780648**
- Pages artifact digest: `sha256:3ad70be1f0a5094b05e0cb1a61c5dcb4001d40c89ed34c4cbde02237d2472382`
- Runtime asset revision: `dragon-queen-runtime-20260904-1`

Live playtest passed every item except camera-facing foreclaw-to-steering-control placement. The approved correction retained chase-facing placement at `[0, 0.95, -0.12]`, lowered neutral / steer-left / hit / victory camera-facing placement to `[0, 0.84, -0.12]`, and lowered only front-steer-right to `[0, 0.80, -0.12]` because that approved raster carries its foreclaws slightly higher.

Correction publication completed through:

- Branch: `fix/dragon-queen-rear-view`
- Correction checkpoint: `7426dbfe83205f3a2a1ecac7e4d0c53c20359dd7`
- Pull request: **#90 — Correct Dragon Queen rear-view placement**
- PR CI run: **33883709850** — passed Git LFS verification, typecheck, lint, tests, and production build
- Merge commit: `15cab462d8eb574785427c026c9b199105c68074`
- Main CI / Pages run: **33883816293** — validation passed and deployment passed
- Pages artifact: **9940994630**
- Pages artifact digest: `sha256:945d0565257008fa62b834cf90ee2a6e00ccc706e6e2f798ed93b321cbe50de6`
- Live URL: `https://manaconda33.github.io/manacondas-minigame-mayhem/`

The correction changes no Dragon Queen raster bytes, kart geometry, camera geometry, kart physics, AI behavior, track topology, roster statistics, or competitive-balance authority. `dragon-queen-runtime-20260904-1` remains the controlled asset revision.

## Dragon Queen active production state

Dragon Queen is the active production identity for **AA-06 Grip Specialist**:

- Speed 6
- Acceleration 6
- Weight 5
- Handling 7
- Mini-Turbo 5
- Traction 7
- Kart: **The Sovereign Wyrm**
- Kart orientation: `NEGATIVE_Z_KART_VISUAL_YAW`
- Chase-facing driver position: `[0, 0.95, -0.12]`
- Camera-facing neutral / steer-left / hit / victory position: `[0, 0.84, -0.12]`
- Camera-facing steer-right position: `[0, 0.80, -0.12]`

The Sovereign Wyrm production geometry is locked at:

- LOD0: 12,164 triangles — SHA-256 `57b3f4b248ed96cd19b0c2b233aec4462fde73b102ad9acde8941550bf69e305`
- LOD1: 7,268 triangles — SHA-256 `31bdd684fb764fdb4d6e04726971e0bf3f34ee4f36aefbf652fcdf3b133053c3`
- LOD2: 3,620 triangles — SHA-256 `124ec43e1ada192d67a3d4fe6bb6c3ec1cdd3f9df6b6c22b1af05b25762197de`

All ten driver states are active: rear, front, steer-left, steer-right, hit, victory, front-steer-left, front-steer-right, front-hit, and front-victory. Every approved frame keeps both wings visible, contains exactly one long tail, and contains no baked kart or steering-control geometry. The Sovereign Wyrm supplies the single modeled steering control.

Cleo / The Gilded Stitch remains archived and inactive. Her former AA-06 package is preserved byte-for-byte at `public/assets/archive/characters/cleo-aa-06/`; Dragon Queen does not load any Cleo archive asset.

## Dragon Queen validation and acceptance evidence

Local correction validation passed:

- strict TypeScript typecheck;
- ESLint with zero warnings;
- 18 Vitest files / 92 tests;
- 89.71% statement coverage;
- 33 materialized runtime GLBs;
- 94 decoded runtime PNGs;
- brand guard;
- production Vite build;
- `git lfs fsck`.

The deterministic five-state front-camera review matched across two renders at SHA-256 `1375abc4e30eaecadb1409030e0fea3e6ca3dd793ad8916227e24925a94006b2`. Focused placement tests pin the shared front mount and state-specific steer-right override and verify override precedence.

PR #90 and the post-merge `main` run independently repeated the repository CI gate. The GitHub Pages artifact is tied to merge `15cab462...`, and the deployed artifact contains the corrected `[0, 0.84, -0.12]` shared camera-facing placement plus `[0, 0.80, -0.12]` front-steer-right override.

### Final product-owner live acceptance — PASSED

Manny approved the deployed Dragon Queen correction on 2026-09-04 after the focused rear-view retest. Final accepted states:

- rear-view neutral — PASS
- rear-view steer-left — PASS
- rear-view steer-right — PASS
- rear-view hit — PASS
- rear-view victory — PASS
- modeled steering control placement relative to foreclaws — PASS

The prior Dragon Queen rear-view placement defect is closed. No Dragon Queen acceptance action remains open.

## Balance rollback — final closeout

The Circuit Alpha rebalance experiment remains **ABANDONED / ROLLED BACK / CLOSED**. The accepted gameplay authority remains pre-balance checkpoint `a706f01f43f07d9b31d05ce38e3e4b67c396894c` as restored by PR #88.

- Rollback PR: **#88 — Restore pre-balance gameplay**
- Rollback merge: `f8eb2dca1e32fe803b436793edae59b0b01b55ff`
- PR CI run: **33822797898** — passed
- Main CI / Pages run: **33822922732** — validation and deployment passed
- Candidate F PR #86 remains historical analysis only.
- Candidate G PR #87 was closed without merge and is abandoned.
- Further competitive-balance work remains deferred until Manny explicitly reopens it.

Dragon Queen publication and correction did not reopen or alter this balance decision.

## Circuit Alpha environment-art / camera checkpoint

The bounded Circuit Alpha environment/camera polish remains **LIVE ACCEPTED / CLOSED**.

Accepted final camera / finish values remain:

- chase distance: 5.6 m
- chase height: 3.15 m
- rear-view distance: 5.3 m
- rear-view height: 3.05 m
- look target height: 1.15 m
- PerspectiveCamera FOV: 62°
- crane duration: 2.85 s
- visible start/finish crossing: 22 m from the original checkpoint-0/grid origin

The protected race contract remains unchanged: 384 canonical track samples, course topology, checkpoints 1–11, starting-grid positions, surface classification, ramp behavior, kart physics, AI navigation, three-lap requirement, countdown timing, and item scope.

## Active production roster

- Alex / The Neon Vector — AA-01
- Lavi / Potato — AA-02
- Lula / The Verdant Hart — AA-03
- Keeg / The Mycelial Majesty — AA-04
- Kraken / The Abyssal Drifter — AA-05
- Dragon Queen / The Sovereign Wyrm — AA-06
- McFleurdel / The Fleur de Nuit — AA-07
- Toph / The Grave Shift — AA-08
- Manaconda / The Wayfinder — AA-09
- Krios / The Hornbreaker — AA-10
- Accu / Pink Precision — AA-11
- Jennifer / The Hearthwarden — AA-12

Cleo / The Gilded Stitch remains archived and inactive. Alex fills the former AA-01 governed placeholder; all twelve roster profiles are now assigned.

## Known defects / unresolved issues

- The existing production-build large-chunk warning remains known and non-blocking.
- No Dragon Queen code, asset, orientation, placement, or gameplay defect is open.
- No Alex integration, deployment, or live-acceptance defect is open.
- No balance candidate is active.

## Deferred work

- Remaining Slice 5 work includes roulette/HUD/input, item activation and effects, AI item-use policy, interaction/counter validation, soak/performance evidence, deployment, and live acceptance.
- Further competitive-balance work remains deferred until explicitly reopened.
- External PBR texture sets, HDR environment, baked AO assets, and other larger presentation additions remain outside the Dragon Queen checkpoint.

## Next recommended action

Manny reviews PR #98. If approved, merge and deploy the visible item-box checkpoint, then complete live visual acceptance of placement/readability and the pop/disappear/fade-back lifecycle. Only after that acceptance should the next bounded Slice 5 increment add roulette, held-item HUD, and desktop/mobile item-use input.

Do not reopen competitive-balance tuning while establishing the baseline item implementation unless objective Slice 5 evidence exposes a blocking defect. Do not begin Slice 6 until Slice 5 is live accepted.

## Approval state

**Slice 5 design: APPROVED 2026-09-05.**

**Slice 5 implementation: IN PROGRESS; FOUNDATION MERGED / VISIBLE ITEM-BOX PR #98 AWAITING MANNY REVIEW.**

**Slice 6: LOCKED pending Slice 5 validation, deployment, and Manny live acceptance.**

**Slice 3 - Character Selection & Avatar Ingestion: COMPLETE / LIVE ACCEPTED.**

**Retained Slice 4 AI/grid checkpoint: COMPLETE.**

**Dragon Queen / The Sovereign Wyrm: LIVE ACCEPTED / CLOSED.**

**Alex / The Neon Vector: LIVE ACCEPTED / CLOSED.**

**Balance experiment: ABANDONED / ROLLED BACK / CLOSED.**

**Circuit Alpha environment-art / camera polish: LIVE ACCEPTED / CLOSED.**

## Slice 5 design approval checkpoint

Manny approved the reconciled item-system design and objective exit checklist on 2026-09-05 before gameplay implementation. The repository records the approval in amendment 2.2, ADR-061, `docs/SLICE-5-ITEM-SYSTEM-DESIGN.md`, and the Slice 5 testing matrix. The checkpoint intentionally contains no item gameplay implementation.

Approved fill-ins include four eight-box rows at approximately 9% / 34% / 62% / 89% lap progress; shared 4.5-second box deactivation; selection locked at collection before approximately 0.85-second roulette; dedicated mobile ITEM input with Brake/Reverse backward modifier; Hyper-Drive restricted to places 6-8 at least 45 m behind the leader; shared effect classifications; short spawn owner immunity followed by normal later self-collision; and initial boost-cap targets of 1.18x Nitro Surge, 1.15x Nitro Overdrive pulse, 1.25x Hyper-Drive, and existing 1.12x Prismatic.

The fifteen-item probability matrix is unchanged. Implementation completion still requires the full probability simulation, interaction/counter matrix, lifecycle soak, performance/regression evidence, healthy PR/main CI, GitHub Pages deployment, desktop/mobile live checks, and Manny acceptance.

## Slice 5 design checkpoint publication evidence

The approved documentation-only Slice 5 design checkpoint is merged and healthy.

- Pull request: **#95 — Record approved Slice 5 item-system design**
- PR head: `9a00d49ba88e4444e6810b85146bf1303bf6e9fd`
- PR CI run: **33994514332 — passed** Git LFS runtime verification, lockfile install, strict typecheck, zero-warning lint, tests, and production build.
- Squash merge / design checkpoint: `5b828be9d16592103afb67d3ea84dbee167be8d5`
- Main CI / GitHub Pages run: **33994553192 — validation and deployment passed**.
- Pages artifact: **9977655925**
- Pages artifact digest: `sha256:9fa8f3f7bdc18e9b51c5ad8f0380b8818db6490d7a281a1883f92b02e9baca77`
- Live URL: `https://manaconda33.github.io/manacondas-minigame-mayhem/`
- Word PRD amendment 2.2 synchronization run: **33994294280 — passed**; render artifact **9977580656**. The resulting 44-page Word PRD render was reviewed without clipping, overlap, or downstream layout breakage.
- Final PR diff contained only `README.md`, the working/Word PRDs, `DECISIONS.md`, `IMPLEMENTATION-STATUS.md`, `TESTING.md`, and `SLICE-5-ITEM-SYSTEM-DESIGN.md`. No gameplay source file changed.
- The existing Slice 3 closeout remains ADR-060; the approved Slice 5 implementation contract is ADR-061.

This checkpoint satisfies the pre-implementation governance gate. Slice 5 gameplay implementation may now begin on a dedicated feature branch when work resumes. `src/game/items/` remains implementation scaffolding at this checkpoint. Slice 6 remains locked until Slice 5 is implemented, validated, deployed, and explicitly live accepted by Manny.

**Latest verified Slice 5 design checkpoint:** `5b828be9d16592103afb67d3ea84dbee167be8d5`.

## Slice 5 foundation implementation checkpoint

Manny authorized Slice 5 implementation on 2026-09-05 and clarified the item-box collection presentation under ADR-062. The first bounded feature branch is `feature/slice-5-items-foundation`.

Implemented for review in this increment:

- one typed registry containing all fifteen approved item IDs, display names, charge counts, and the exact eight-rank probability matrix;
- configuration for the four approved item-box row progress points and eight boxes per row;
- weighted item selection with the PRD 1.00-1.35 gap factor, Hyper-Drive 45 m eligibility threshold, Apex/runtime availability filtering, and post-filter weighted selection;
- one-slot inventory with multi-charge consumption;
- item-box lifecycle state implementing collection pop, immediate non-collectibility, hidden respawn interval, fade-back, and final collectible restoration at the approximately 4.5-second target;
- focused Vitest coverage for table totals, restrictions, inventory, and the item-box lifecycle.

The pop/fade implementation begins with approximately 0.12-second pop and 0.45-second fade-back configuration values. These are reversible presentation defaults; the approved sequence is pop -> absent -> fade back -> collectible.

Not yet implemented in this checkpoint: Circuit Alpha box meshes/triggers/row placement, roulette/HUD/input integration, race pickup wiring, projectiles, hazards, buffs/debuffs, AI item use, or any of the fifteen item effects. This increment must pass CI and Manny review before merge or the next implementation increment.

## Slice 5 foundation CI evidence

Pull request **#97 — Start Slice 5 item-system foundation** is open for Manny review and is intentionally unmerged at this checkpoint. PR head before evidence recording: `3da08a741e514623ddfe28eee100b7fa8bb5ecb8`.

PR CI run **33997897371** passed on Node 22.23.2:

- Git LFS materialization / `git lfs fsck`: passed;
- `npm ci`: 198 packages installed, 0 vulnerabilities;
- strict TypeScript build/typecheck: passed;
- ESLint with `--max-warnings 0`: passed;
- Vitest: **19 files / 101 tests passed**, including **8 Slice 5 foundation tests**;
- statement coverage: **89.91% overall**, **93.15% for `game/items`**;
- runtime verification: 36 materialized GLBs and 105 runtime character PNGs passed;
- production Vite build: passed;
- existing large-chunk warning remains non-blocking and unchanged.

No Pages deployment occurred because this is a pull-request validation run. The next gate is Manny review/approval of PR #97 before merge. The next implementation increment remains blocked until that review decision.
