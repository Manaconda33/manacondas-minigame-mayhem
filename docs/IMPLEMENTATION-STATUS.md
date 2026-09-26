# Implementation Status

## Current slice

**Slice 6 - UI/HUD Polish, Audio, Post Processing & Optimization - CIRCUIT ALPHA PBR PASS LIVE ACCEPTED; ROUTE NIGHT TITLE/HUB/UTILITY + CHARACTER SELECT MERGED / DEPLOYED / LIVE ACCEPTED; RACE HUD / MINIMAP / RESULTS-PODIUM FEATURE BRANCH; 12 LOWER-FINISH REACTIONS MAPPED; APPROVED RESULTS BACKDROP INTEGRATED; LOCAL TASK 10 CHECKS PASS EXCEPT FIVE-RESTART MEMORY EVIDENCE; DEPLOYED ACCEPTANCE PENDING**

PRD baseline: **v1.1 with approved implementation amendments through 2.22**. Slice 6 kickoff and Route Night are governed by ADR-085-086; the published settings/graphics/audio foundation is ADR-087; the bounded material-coordinate / first Circuit Alpha PBR increment is governed by ADR-088; the Character Select baseline and full-body package are governed by ADR-090-092; the next Race HUD / mini-map / Results-Podium asset direction is governed by ADR-093.

Latest verified merged gameplay checkpoint on `main`: **`5136a002ec1d39b13f8470fd4b5449ce6df5bcf2`** (Issue #106 fix through PR #163; post-merge validation/Pages run `35282030810` passed).

Latest verified Slice 5 acceptance-protocol checkpoint on `main`: **`fd967afca41366579fe448bcb7c3d9c0631edf1c`** (final desktop/mobile whole-slice matrix through PR #172; hosted PR CI `35305490406` and post-merge validation/Pages run `35337153793` passed **62 test files / 507 tests**).

Latest verified repository head on `main`: **`7e8a9ea8901bef6ea4dd785780c4cc8295225ead`** (PR #187 full-body Character Select package; merged and deployed on 2026-09-19; post-merge CI/Pages run `35422609359` passed).

Latest verified Slice 6 implementation checkpoint on `main`: **`7e8a9ea8901bef6ea4dd785780c4cc8295225ead`** (Route Night Character Select baseline, composition correction, and approved full-body package through PRs #185-#187; deployed visual acceptance passed on desktop and mobile; the accepted Circuit Alpha PBR baseline remains governed by ADR-088).

Latest verified feature-branch checkpoint: **`1c942fc2c5913859bc46d7a22188e132a15f6822`** on `feature/slice6-race-hud-minimap-results-podium`, matching `origin` with a clean worktree at session start. It integrates the approved Results/Podium backdrop behind live Results content. All twelve approved lower-finish reaction assets are published and mapped by stable character ID to places 4–8; victory mapping remains for places 1–3. The backdrop ImageGen output ID and source/runtime hashes are recorded in `docs/ASSET-PROVENANCE.md`; its runtime SHA-256 is `24812fcd47e20c28601cbdcc15e1f824a3e17b1fdd679c346578bb600a539465`.

**Current release evidence (2026-09-25):** focused verification passed **10 files / 79 tests**; `npm run validate` passed **72 files / 584 tests**, with **81.93% statements / 76.25% branches / 87.07% functions / 83.64% lines**, strict typecheck, zero-warning lint, branding/runtime-asset checks, and production build. Runtime verification checked 18 Results/Podium assets including the approved backdrop, 36 materialized runtime GLBs, and 135 character PNGs. `git diff --check`, `git lfs fsck`, and targeted Prettier checks passed. The existing Vite large-chunk warning for `KartTimeTrial` remains. `tests/results-routing.test.ts` confirms disposal/routing in one mocked cycle per action, but no five-restart browser memory/asset-leak pass is claimed: no whole-app memory soak harness was found. GitHub reports no open PR and no PR-triggered workflow run for this head. Hosted CI/Pages and deployed desktop/mobile visual acceptance remain pending; this branch is not merged or deployed.

Authorized Ink implementation baseline: governance-published `main` **`b62c96ae8297150d8f4cafaede4623d5b01a1e0b`**; implementation merged at **`2df6bf372b01e8a0f13c4bad71737ef8f5ab415d`** through PR #148, with post-merge validation/Pages **`35168880807`** passed. The tuned amendment merged through PR #149 at **`af4fa73c2a05ad25e4e2d7343f89f3cf6b9f510f`**; hosted PR CI **`35173826253`** and post-merge validation/Pages **`35188684882`** passed. Manny reported **“Pass”** on 2026-09-17; PR #149 comment **`5709839182`** records live acceptance.

## Kinetic Arc Hammers final state - 2026-09-16

Kinetic Arc Hammers gameplay plus the approved original procedural model/VFX/audio/presentation are **LIVE ACCEPTED** under amendments 2.16-2.17 / ADR-077-078.

Completion evidence:

- Final reviewed gameplay head: `e395c63e3f0a425a985de2208e624adf2dd87574`.
- Hosted PR CI `35137395927`: PASS — Git LFS verification, clean `npm ci`, strict typecheck, zero-warning lint, **50 test files / 446 tests**, **82.19% statement / 77.39% branch / 86.56% function / 83.70% line coverage**, branding/runtime-asset verification and production build.
- PR #144 squash merge: **`a129bbac75f919dc7136ac50dfd63564fe5cd52e`**.
- Gameplay post-merge validation / GitHub Pages: **`35137681000` PASS**.
- Publication-record reconciliation PR #145 merge: **`e53bf652b88fb50c29e80acbb68062d49e170d96`**.
- PR #145 post-merge validation / GitHub Pages: **`35138696144` PASS**.
- Arc Hammers live-acceptance reconciliation PR #146 merge: **`9ee6ee05fe71715a867a3c9a6b654904faf0e507`**.
- PR #146 post-merge validation / GitHub Pages: **`35140143353` PASS**.
- Manny completed the supplied deployed Arc Hammers review routes and reported **“All tests pass.”**
- Product-owner evidence: PR #144 comment **`5703186707`**.
- No browser/device-specific result is inferred beyond Manny's explicit all-tests-pass report.
- Existing Vite large-chunk warning remains known/nonblocking.
- Three moderate npm audit findings remain in the unchanged dependency set.

The four deployed acceptance routes covered primary Arc Hammers gameplay, Shockwave clearing, Prismatic protected absorption, and Prismatic expired ordinary-hit behavior. Arc Hammers has no known open defect at this acceptance checkpoint.

## Rebounding Arc Blade final state

Rebounding Arc Blade remains **LIVE ACCEPTED** under amendment 2.15 / ADR-076. Gameplay PR #139 merged at `8822341b61900799e0166cfe94bf69cb3986bf0e`; post-merge validation/Pages `35118484183` passed; PR #139 comment `5700594653` records Manny's deployed acceptance.

## Vision-Obscuring Ink Splat deployed implementation and tuning - LIVE ACCEPTED 2026-09-17

Vision-Obscuring Ink Splat implementation, original presentation, and Amendment 2.19 AI tuning are **MERGED / DEPLOYED / LIVE ACCEPTED** through PRs #148 and #149. Manny reported **“Pass”** after reviewing the deployed tuned `?testItem=ink-splat` route.

Authorization and publication evidence:

- Governance publication PR #147 merged at `b62c96ae8297150d8f4cafaede4623d5b01a1e0b`; hosted PR CI `35145111221` and post-merge validation/Pages `35145254188` passed.
- Publication evidence is recorded in PR #147 comment `5703901606`.
- PR #148 merged at `2df6bf372b01e8a0f13c4bad71737ef8f5ab415d`; hosted PR CI `35168738421` and post-merge validation/Pages `35168880807` passed.
- Amendment 2.19 / ADR-080 tuned the AI impairment to 0.95 m lateral noise, 0.160-second reaction latency, and a 0.74 steering precision multiplier; duration and all other boundaries remain unchanged.
- PR #149 squash-merged at `af4fa73c2a05ad25e4e2d7343f89f3cf6b9f510f`; hosted PR CI `35173826253` and post-merge validation/Pages `35188684882` passed.
- Manny reported **“Pass”** on 2026-09-17; PR #149 comment `5709839182` records the product-owner evidence.

The published bounded implementation includes progress-authoritative all-racers-ahead targeting, atomic one-charge dispatch, per-target immunity, refresh-without-stacking, lifecycle state, legal-road-bounded AI impairment, CSS organic screen overlay below HUD/touch controls, procedural impact audio, and the `?testItem=ink-splat` route.

Hosted post-merge validation passed clean install, Git LFS/runtime-asset verification, strict typecheck, zero-warning lint, **54 test files / 463 tests**, **81.97% statement / 77.31% branch / 86.56% function / 83.52% line coverage**, branding/runtime-asset verification, and production build. Existing Vite large-chunk warning remains known/nonblocking.

The tuned Ink increment is closed at live acceptance. Slice 5 remains active for its remaining bounded work; Slice 6 remains locked.

## Continuous Nitro Overdrive final state - LIVE ACCEPTED 2026-09-17

Continuous Nitro Overdrive governance, gameplay, VFX, audio, and presentation are complete and LIVE ACCEPTED under amendment 2.20 / ADR-081 and docs/SLICE-5-NITRO-OVERDRIVE-SCOPE.md. Governance PR #151 merged at `6c1fe1b78274b25c23fe6fc0a2090e26c086febb`; hosted PR CI and post-merge validation/Pages run `35223980439` passed. Manny separately authorized the bounded implementation and later reported **“Pass”** on the deployed player-only route.

The approved contract is one charge; immediate first pulse on committed activation; an exactly 6.0 race-second window; subsequent ITEM pulses no faster than every 0.75 race seconds; approximately 0.9-second non-stacking pulses; a 1.15x normal speed cap; neutral additional acceleration; normal dirt/grass penalties; maximum-authority composition with accepted boosts; pause-safe timing; and full expiry/finish/restart/hub/disposal cleanup. The item creates no hostile effect, immunity, projectile, hazard, or shared-capacity object.

The published implementation adds the bounded Overdrive state/transaction path, keyed generic temporary-boost composition, production player desktop/mobile ITEM routing, separate active-window HUD state, original procedural rear VFX, and original procedural activation/pulse audio. Validation passed with **55 test files / 473 tests**, **81.99% statement / 77.32% branch / 86.55% function / 83.55% line coverage**, strict typecheck, zero-warning lint, branding/runtime-asset verification, and production build. Hosted gameplay PR #152 CI `35230154302` passed; post-merge validation and GitHub Pages deployment `35230540886` also passed. The known Vite large-chunk warning remains nonblocking.

The deployed player-only route is `?testItem=nitro-overdrive`. Manny reported **“Pass”** on 2026-09-17. No browser/device-specific result is inferred beyond that explicit report. Final cross-item evidence, soak/performance, and final Slice 5 closure remain open.

## Hyper-Drive Rocket final state - LIVE ACCEPTED 2026-09-17

Hyper-Drive Rocket gameplay, original procedural model/VFX/audio/presentation, and the bounded player-only acceptance route are **MERGED / DEPLOYED / LIVE ACCEPTED** under amendment 2.21 / ADR-082 and docs/SLICE-5-HYPER-DRIVE-ROCKET-SCOPE.md. Product-owner live acceptance was reported as **“Approved”** on 2026-09-17 after reviewing the deployed `?testItem=hyper-drive-rocket` route.

Authorization and publication evidence:

- Governance publication PR #154 merged at `ae977623bdc7a209634816e1cea8ef4a799b98c8`; post-merge validation and Pages run `35243454845` passed.
- Publication record reconciliation PR #155 merged at `ae40eaa630cc997f452c39b8e312a7ada0441bd0`.
- Separate gameplay implementation authorization was approved on 2026-09-17.
- Gameplay PR #156 squash-merged at `4ae7c6aece6070bb95df889be7059eb91195cd1e`.
- Hosted post-merge validation and GitHub Pages run `35251643282` passed; its validation and deploy jobs both completed successfully.
- Local validation before publication passed with **56 test files / 485 tests**, **82.15% statement / 77.31% branch / 86.72% function / 83.74% line coverage**, strict typecheck, zero-warning lint, branding/runtime-asset verification, and production build.
- Product-owner acceptance evidence is recorded in PR #156 comment `5718483417`.
- The deployed player-only review route is `?testItem=hyper-drive-rocket`. Remaining full-Slice-5 closure gates are unchanged and remain open.

## Full AI item tactics and ADR-084 corrective - LIVE ACCEPTED 2026-09-17

Full AI item acquisition/use/tactics merged through PR #158 at **`cb67183b902e7732b3cab8d95af3e865890b1835`**. Hosted PR CI **`35255837582`** and post-merge validation / GitHub Pages **`35256074171`** passed. The deployed deterministic fixture remains `?testAiItem=<item-id>&testAiRacer=ai-1`; the existing `?testItem=<item-id>` fixture remains player-only.

The first deployed review found two blocking defects before acceptance: displayed ranking could disagree with checkpoint-authoritative lap/finish state, and racer-owned AI effects including Nitro Overdrive did not render their existing procedural visuals. ADR-084 authorized the bounded correction: post-physics swept crossings for the next required checkpoint, shared validated progress for standings/item ranking/targeting/AI gaps, and the existing Nitro Surge, Nitro Overdrive, Hyper-Drive Rocket, and Prismatic visuals mounted for AI racers. No item balance, AI tactics, audio, race rules, assets, or Slice 6 scope changed.

Corrective PR #159 merged at **`e36477022a5fc8363da074dfca302ff263b9758a`**. Before publication, clean-install `npm ci` and `npm run validate` passed with **60 test files / 499 tests**, **81.48% statement / 76.81% branch / 85.88% function / 83.19% line coverage**, strict typecheck, zero-warning lint, runtime-asset/branding verification, and a production build; `git diff --check` and `git lfs fsck` also passed. Post-merge validation and GitHub Pages run **`35265993137`** completed successfully.

Manny then reported **“all live tests accepted.”** PR #159 comment **`5720570319`** records the product-owner evidence. The ADR-084 live gate is closed: lap/finish/standings consistency and AI racer-owned boost/power-up visuals passed the deployed review, with no new defect reported. No browser/device-specific result is inferred beyond Manny's explicit acceptance. Full AI item tactics is therefore **LIVE ACCEPTED**; final Slice 5 closure remains separate.

## Issue #106 results synchronization - LIVE ACCEPTED / CLOSED 2026-09-17

Issue #106, `Results ranking tile stops updating after player finishes`, is **RESOLVED / LIVE ACCEPTED**. PR #163 merged at **`5136a002ec1d39b13f8470fd4b5449ce6df5bcf2`**. Post-merge CI and GitHub Pages run **`35282030810`** passed Git LFS verification, install, strict typecheck, zero-warning lint, the full automated test suite, production build, Pages artifact creation, and deployment.

Manny then completed the deployed desktop and mobile acceptance gate and reported **“Live tests passed.”** Acceptance confirmed that the open results card continues updating as later AI racers finish, the player's locked place/time remains stable, the final displayed order settles correctly, and normal post-race behavior remains intact. Product-owner evidence is recorded in Issue #106 comment **`5722120491`**. Issue #106 was closed as **completed** on 2026-09-17.

No race-authority, lap/checkpoint, AI behavior, item balance, probability, racer-stat, or Slice 6 scope changed in this correction.

## Slice 5 accepted/deployed state

Live-accepted bounded increments include item boxes/one-slot inventory/roulette/HUD/input foundation, Nitro Surge, Ricochet Kinetic Disc, Homing Seeker Drone, Apex core, Timed Blast Orb/HazardSystem, Slick Trap, Slick/Blast AI hazard response, Acoustic Shockwave Pulse, Prismatic Invincibility, Blaze Orbs, Frost Orbs, Rebounding Arc Blade, **Kinetic Arc Hammers**, **Continuous Nitro Overdrive**, **Hyper-Drive Rocket**, and **full AI item tactics with the ADR-084 corrective**.

Vision-Obscuring Ink Splat gameplay/presentation and Amendment 2.19 AI tuning are merged, deployed, and live accepted under amendments 2.18-2.19 / ADR-079-080 through PRs #148-149. Continuous Nitro Overdrive is merged, deployed, and live accepted under amendment 2.20 / ADR-081 through PR #152. Hyper-Drive Rocket gameplay and original presentation are merged, deployed, and live accepted under amendment 2.21 / ADR-082 through PR #156. Full AI item tactics and the corrective race-authority / AI-presentation gate are merged, deployed, and live accepted under amendment 2.22 / ADR-083-084 through PRs #158-159.

The final all-item interaction/counter evidence is complete through `docs/SLICE-5-ITEM-INTERACTION-MATRIX-2026-09-17.md` and PR #165. The final lifecycle/object-count soak is complete through `docs/SLICE-5-ITEM-LIFECYCLE-SOAK-2026-09-17.md` and PR #167. Item/VFX rendered-runtime performance evidence is complete through `docs/SLICE-5-ITEM-VFX-PERFORMANCE-EVIDENCE-2026-09-17.md`. The final desktop/mobile whole-slice matrix is published through PR #172, and Manny reported **“All pass”** on 2026-09-18 for D1-D3, M1-M3, and cleanup/race-authority checks. **Slice 5 is LIVE ACCEPTED / COMPLETE.** Slice 6 is active under the approved kickoff and Route Night art direction.

## Known issues

- Existing production-build large-chunk warning remains known and nonblocking.
- Three moderate npm audit findings remain in the unchanged dependency set.
- No Arc Hammers defect is open from the completed acceptance matrix.
- No ADR-084 corrective defect is open from the completed live review.

## Next recommended action

Complete the five-restart cleanup/memory evidence with an appropriate existing runtime harness; do not infer memory or Results-only asset-leak results from the mocked route tests. Keep hosted PR CI, deployed desktop/mobile visual review, and product-owner acceptance pending. Do not merge or deploy before those required review gates.

## Approval state

**Slice 5 design:** APPROVED 2026-09-05.

**Rebounding Arc Blade:** LIVE ACCEPTED 2026-09-16.

**Kinetic Arc Hammers scope/governance:** APPROVED / PUBLISHED.

**Kinetic Arc Hammers gameplay + original presentation:** **LIVE ACCEPTED 2026-09-16** through PR #144 / `a129bbac75f919dc7136ac50dfd63564fe5cd52e` / runs `35137395927` and `35137681000` / product-owner comment `5703186707`.

**Vision-Obscuring Ink Splat scope/governance:** **APPROVED / PUBLISHED 2026-09-16** under amendment 2.18 / ADR-079. **Amendment 2.19 / ADR-080 AI tuning:** **LIVE ACCEPTED 2026-09-17** through PR #149 / `af4fa73c2a05ad25e4e2d7343f89f3cf6b9f510f` / post-merge run `35188684882` / product-owner comment `5709839182`.

**Hyper-Drive Rocket scope/governance:** **APPROVED / PUBLISHED 2026-09-17** under amendment 2.21 / ADR-082 through PR #154 / `ae977623bdc7a209634816e1cea8ef4a799b98c8` / post-merge validation and Pages `35243454845`; publication record reconciled through PR #155 / `ae40eaa630cc997f452c39b8e312a7ada0441bd0`.

**Hyper-Drive Rocket gameplay + original presentation:** **LIVE ACCEPTED 2026-09-17** through PR #156 / `4ae7c6aece6070bb95df889be7059eb91195cd1e` / post-merge validation and Pages `35251643282` / product-owner comment `5718483417`.

**Full AI item tactics + ADR-084 corrective:** **LIVE ACCEPTED 2026-09-17** under amendment 2.22 / ADR-083-084. PR #158 merged at `cb67183b902e7732b3cab8d95af3e865890b1835`; PR CI `35255837582` and post-merge validation / Pages `35256074171` passed. Corrective PR #159 merged at `e36477022a5fc8363da074dfca302ff263b9758a`; post-merge validation / Pages `35265993137` passed; product-owner acceptance is recorded in PR #159 comment `5720570319`.

**Issue #106 results synchronization:** **LIVE ACCEPTED / CLOSED 2026-09-17** through PR #163 / `5136a002ec1d39b13f8470fd4b5449ce6df5bcf2` / post-merge validation and Pages `35282030810` / product-owner Issue #106 comment `5722120491`.

**Final all-item interaction/counter matrix:** **COMPLETE / PUBLISHED 2026-09-17** through PR #165 / `8906d5c4fa226f2889c609cf97095dbbde92e803`. Hosted PR CI `35297557789` passed **60 test files / 500 tests** plus LFS verification, typecheck, zero-warning lint, and production build; post-merge validation and GitHub Pages run `35298360643` passed. The matrix is recorded in `docs/SLICE-5-ITEM-INTERACTION-MATRIX-2026-09-17.md`. No gameplay or balance changed.

**Final lifecycle/object-count soak:** **COMPLETE / PUBLISHED 2026-09-17** through PR #167 / `125227cde73512588b3941f4d63cdc9086f15912`. Final hosted PR CI `35299893719` passed **61 test files / 502 tests** plus LFS verification, strict typecheck, zero-warning lint, and production build; post-merge validation and GitHub Pages run `35300715115` passed. The soak is recorded in `docs/SLICE-5-ITEM-LIFECYCLE-SOAK-2026-09-17.md`. No production gameplay or balance changed.

**Item/VFX rendered-runtime performance:** **COMPLETE / PASS 2026-09-17.** Instrumentation published through PR #170 / `4ef75359e8b1dc3d6b7e2865d613774975a5af99`; post-merge validation/Pages `35302908290` passed. Product-owner deployed captures recorded ordinary full-AI p95 **1.00 ms**, median **0.40 ms**, max **6.80 ms**, N600 PASS and forced Arc Blade p95 **1.00 ms**, median **0.50 ms**, max **8.70 ms**, N600 PASS. The performance gate passes exactly at the PRD 1.00 ms p95 ceiling. No browser/device details are inferred beyond Manny's explicit evidence.

**Final desktop/mobile whole-Slice 5 acceptance:** **PASS / LIVE ACCEPTED 2026-09-18.** Manny completed D1-D3, M1-M3, and cleanup/race-authority spot checks from `docs/SLICE-5-FINAL-LIVE-ACCEPTANCE-2026-09-17.md` and reported **“All pass.”** No browser/device details are inferred. The final acceptance baseline was PR #172 / `fd967afca41366579fe448bcb7c3d9c0631edf1c`; post-merge validation/Pages run `35337153793` passed **62 test files / 507 tests**.

**Slice 5 implementation:** **LIVE ACCEPTED / COMPLETE.** All fifteen items, probability/distribution evidence, AI item tactics, interaction/counter matrix, lifecycle/object-count soak, rendered-runtime performance evidence, race-authority corrections, and final desktop/mobile whole-slice acceptance are closed with no open Slice 5 defect recorded.

**Slice 6:** **ACTIVE - CHARACTER SELECT LIVE ACCEPTED; NEXT BOUNDED RACE HUD / MINI-MAP / RESULTS-PODIUM IN PLAN REVIEW.** Manny approved beginning Slice 6 on 2026-09-18 and authorized the material-coordinate / first Circuit Alpha PBR increment plus normal PR/CI/deployment publication. PR #178 is merged/deployed, the Route Night title/hub/Controls/Settings increment is merged/deployed through PR #184, and the Character Select baseline, composition correction, and full-body package are merged/deployed through PRs #185-#187. ADR-088 and `docs/SLICE-6-CIRCUIT-ALPHA-PBR-PASS-2026-09-18.md` govern the protected material baseline; ADR-090-092 govern Character Select and its selection-only art package; ADR-093 records the approved next asset direction.,,The PR #187 merge commit is `7e8a9ea8901bef6ea4dd785780c4cc8295225ead`. Post-merge CI/Pages run `35422609359` passed. Manny's deployed Character Select visual acceptance passed on desktop and mobile against the approved Route Night design and all twelve approved roster assets.

Current findings: deployed `main` gives procedural loop/segment strips deterministic 2 m world-meter UVs and applies one provenance-tracked 1K Poly Haven Asphalt Track PBR set to the road/racing-wear surfaces only. Approved kart builders remain untouched. Settings persistence, graphics presets, and the mixer foundation are already published. The Route Night title/hub/Controls/Settings system and corrected Character Select are merged, deployed, and live accepted; the twelve approved full-body identity assets are now part of the accepted Character Select package. The next bounded increment is defined by `docs/SLICE-6-RACE-HUD-RESULTS-PODIUM-DESIGN-2026-09-19.md`, its implementation plan, and ADR-093: a Route Night Race HUD + Circuit Alpha mini-map plus a cinematic Results/Podium transition using ImageGen-led item art, atmospheric layers, twelve victory poses, and twelve finish-reaction poses. Pause, final audio, post-processing, and other later Slice 6 work remain outside that bounded increment.

Preferred material sources are CC0 Poly Haven and ambientCG. Production texture imports must be resolution-limited and provenance-tracked rather than copied at source resolution. Commercial game UIs may inform hierarchy/motion only; final branded assets and interface language remain original.

**Art-direction gate:** **CLOSED / APPROVED 2026-09-18.** Manny selected **Route Night** after reviewing rendered examples of Route Night, Pit Poster, Twilight Broadcast, and the proposed hybrid. Route Night governs the Slice 6 UI/presentation language. Production Character Select must use the real approved roster rather than concept-render placeholders. Future tracks may use their own authored time of day and environmental lighting while retaining the Route Night UI grammar and semantic accent system.

**Route Night Character Select scope:** **IMPLEMENTED / DEPLOYED BASELINE + CORRECTION 2026-09-19; FULL-BODY PACKAGE IN REVIEW.** ADR-090 authorized the bounded responsive Character Select redesign, real approved driver/kart asset binding, and isolated rotating kart preview. PR #185 published the baseline and PR #186 published the lane correction; ADR-091 now adds the twelve approved selection-only full-body assets on this feature branch. Publication of this package and Manny's deployed visual-acceptance gate remain pending; no later Slice 6 screen is authorized.

**Canonical Route Night visual reference:** **APPROVED / REPOSITORY-BOUND 2026-09-18.** Manny re-attached the approved Route Night concept and approved committing it as the durable visual north star. Canonical artifact: `docs/reference/route-night/ROUTE-NIGHT-CANONICAL-REFERENCE.png`. It is a lossless pixel-identical re-encode at 1672 × 941; the concept's placeholder racers and nighttime scenery remain subject to the roster/time-of-day boundaries in ADR-086.

**Slice 6 settings / graphics / audio foundation:** **PUBLISHED / DEPLOYED 2026-09-18.** PR #176 implements versioned local settings persistence, persistent Master/Music/SFX controls, Low/Medium/High graphics presets, and the centralized master/music/SFX/engine mixer skeleton. Medium preserves the pre-Slice-6 1.5 device-pixel-ratio cap, PCF soft shadows, and 2048 shadow map baseline; Low disables shadows and caps DPR at 1.0; High raises the DPR cap to 2.0 while retaining the current shadow tier. Selected graphics quality applies to the next race without a page reload. Existing procedural item/warning/drift cues route through the SFX bus and the existing Prismatic musical layer routes through Music; the Engine bus is reserved for the later production engine system.

Manny approved publication on 2026-09-18. Final PR-head CI run `35352383087` passed Git LFS verification, clean `npm ci`, strict typecheck, zero-warning lint, **64 test files / 515 tests**, **81.40% statement / 76.90% branch / 86.24% function / 83.15% line coverage**, branding/runtime-asset verification, and production build. PR #176 squash-merged at **`0144bcb6f1ce2bc0acb0e7e6adc229f38fd2e109`**. Post-merge CI / GitHub Pages run **`35353036562`** passed validation, Pages artifact upload, and deployment. Publication evidence is recorded in PR #176 comment `5731036246`. No gameplay balance, race authority, item behavior, Route Night visual styling, production audio assets, post-processing, or PBR materials changed in this increment.

**Next recommended action:** publish the approved Character Select full-body package through the normal approval-governed PR flow, then stop at Manny's deployed Character Select visual-acceptance gate before beginning the race HUD, pause/results, final audio, post-processing, or later Slice 6 work.

**Slice 6 material-coordinate / first Circuit Alpha PBR pass:** **LIVE ACCEPTED 2026-09-18.** PR #178 adds meter-scaled procedural strip UVs, one CC0 Poly Haven `asphalt_track` 1K diffuse/OpenGL-normal/roughness set, the first asphalt PBR assignment, exact runtime hash verification, and explicit track-scene GPU-resource disposal. The maps total **2,150,973 bytes (~2.05 MiB compressed)** with a conservative **~16 MiB decoded GPU estimate including mipmaps**, kept visible against the PRD Medium <=256 MB texture target. Provenance is recorded in `docs/ASSET-PROVENANCE.md`; focused implementation/evidence is recorded in `docs/SLICE-6-CIRCUIT-ALPHA-PBR-PASS-2026-09-18.md`.

The material set was materialized on the feature branch by temporary GitHub Actions run `35355493952`; the temporary workflow was removed after the three 1024 x 1024 files and `SOURCE-SHA256SUMS.txt` were committed. Production verification now checks the exact three source hashes/JPEG signatures in addition to normal LFS verification. No gameplay, track topology, race authority, racer statistics, item behavior, approved likeness, kart geometry/identity, dependency, or Route Night UI-language change is included. Hosted PR CI run `35356556627` passed Git LFS verification, clean install, strict typecheck, zero-warning lint, **65 test files / 519 tests**, **81.52% statement / 76.86% branch / 86.42% function / 83.26% line coverage**, exact verification of the three runtime track textures, branding/runtime-asset verification, and production build. PR #178 squash-merged at **`c721fc083e2d18ad534387227968bb0a75982ae7`**. Post-merge validation and GitHub Pages run **`35365068619`** passed both validation and deployment. Manny reviewed the deployed checkpoint on 2026-09-18 and reported **“Looks good.”** Product-owner evidence is recorded in PR #182 comment `5732962712`. No defect was reported; the bounded material visual gate is closed.

## Slice 6 Route Night title / hub / utility UI checkpoint - feature branch

The bounded Route Night title, hub, Controls, and Settings implementation is complete on the feature branch and is recorded in `docs/SLICE-6-ROUTE-NIGHT-UI-CHECKPOINT-2026-09-18.md`. It follows ADR-086 and preserves the published ADR-087 settings/audio foundation and the live-accepted ADR-088 Circuit Alpha material baseline. The feature branch now also carries the authored SVG desktop UI asset library, two original atmosphere/card WebP assets, three bounded generated identity/density WebP assets, and focused asset-resolution/integration coverage; publication and deployed visual acceptance remain pending.

The implementation adds the shared Route Night UI foundation, revisioned asset URL/icon helpers, five original WebP layers, the authored SVG desktop asset library, a brush-led title treatment with an exact-text fallback, a restrained route/checkpoint panel texture, a text-free editorial route-density layer, stronger filled/outlined action plaques, an expanded authored icon set, title route-board chrome, a denser Circuit Alpha-dominant hub with non-activating `COMING SOON` cards, and clipped desktop/mobile Controls and Settings utility panels. No protected gameplay, PBR/material, topology, roster, kart, item, AI, or hosting files were changed.

Local evidence on this branch: **66 test files / 525 tests passed**, **81.59% statement / 76.90% branch / 86.65% function / 83.32% line coverage**, strict typecheck passed, zero-warning lint passed, branding/runtime-asset validation passed, production build passed, `git diff --check` passed, and `git lfs fsck` passed. Hosted PR CI run `35396801098` also passed LFS verification, clean lockfile install, strict typecheck, zero-warning lint, automated tests, and production build on head `e29b1c124350d2bf60dd374534050fd80f0c274c`. The cloud-browser attempt was blocked by `ERR_BLOCKED_BY_CLIENT` for the local Vite URL; no deployed browser-rendered acceptance is claimed. Publication, hosted deployment, and Manny's desktop/mobile Route Night visual-acceptance gate remain pending.

The generated UI asset provenance and exact hashes are recorded in `docs/ASSET-PROVENANCE.md`. At this historical title/hub/utility checkpoint, Character Select and later Slice 6 screens remained deferred until that increment was deployed and accepted.

## Slice 6 Route Night Character Select checkpoint - LIVE ACCEPTED 2026-09-19

The bounded Route Night Character Select implementation is complete, merged, deployed, and live accepted. It follows ADR-086 and ADR-090-092, preserves the published ADR-087 settings/audio foundation, and leaves the live-accepted ADR-088 Circuit Alpha material baseline untouched.

The implementation replaces the earlier rounded Character Select scaffold with a clipped, route-dense driver checkpoint. It renders all twelve approved manifest entries with real portrait assets and fallback behavior, binds the selected production full-body identity art and fixed six-stat presentation, and preserves the existing race handoff and hub navigation. `src/ui/characterKartPreview.ts` loads the selected approved kart GLB through `GLTFLoader`, applies the manifest-governed visual yaw, rotates only when motion is allowed, and falls back to a procedural 3D preview when the kart asset is unavailable; a visible CSS fallback panel covers WebGL-unavailable environments. Generated bay, route-energy, and hero-aura layers are atmospheric only; layout, copy, interaction, and identity remain live DOM/CSS/SVG or approved manifest assets.

Publication and acceptance evidence:

- PR #185 baseline merge: `300a4d5d174e962d6ef4db19dcbee3184bc22202`; post-merge run `35410777878` passed.
- PR #186 composition correction merge: `5e65b092e2049a214db39aec0bce89c9f9817117`; the driver/kart lane correction preserved face readability on the deployed review.
- PR #187 full-body package merge: `7e8a9ea8901bef6ea4dd785780c4cc8295225ead`; post-merge CI/Pages run `35422609359` passed.
- Manny completed the deployed Character Select visual-acceptance review on desktop and mobile against the approved Route Night design and all twelve approved roster assets: PASS.
- The gate verified roster readability, selected full-body identity, driver/kart lane separation, actual kart preview/fallback behavior, route-board/panel hierarchy, focus/reduced-motion behavior, and navigation handoff.

Character Select is closed as an accepted bounded checkpoint. The next work is a separate planned increment; no race HUD, mini-map, Results/Podium runtime code, final audio, post-processing, or unrelated Slice 6 behavior is retroactively included in this checkpoint.

## Slice 6 Route Night Character Select driver/kart composition correction - feature branch

The deployed review defect is corrected without changing driver art, portraits, kart GLBs, kart identities, the rotating preview seam, or any gameplay behavior. The previous stage positioned both visual systems as overlapping absolute layers, with the kart preview painted above the driver art. The correction gives the selected 2D driver a dedicated identity lane and the kart preview a dedicated kart lane on desktop; mobile stacks those lanes so the driver art is complete and readable before the kart preview begins.

The correction is authored entirely in DOM/CSS markup. It adds a regression contract requiring the driver art and kart preview to remain in separate visual lanes, while preserving the existing selected-character rerender, fallback, reduced-motion, and WebGL-unavailable behavior. No generated image asset is added.

Local correction evidence: **67 test files / 533 tests passed**, strict typecheck passed, zero-warning lint passed, branding/runtime-asset validation passed, production build passed, `git diff --check` passed, and targeted formatting checks for changed source/test/style files passed. The repository-wide Prettier check still reports pre-existing formatting drift in unrelated historical files; no repository-wide formatting rewrite was applied. The cloud browser could not reach the local preview URL (`ERR_BLOCKED_BY_CLIENT`), so deployed visual acceptance is intentionally not claimed here; the hosted PR/deployment checkpoint must verify desktop and mobile geometry and face readability.

## Slice 6 Route Night Character Select full-body selection-art package - LIVE ACCEPTED 2026-09-19

The twelve approved full-body character illustrations are integrated as Character Select-only assets under `public/assets/characters/aa-##/selection/full-body.png`. `src/characters/manifest.ts` exposes a separate, revisioned `selectionArt` URL for every active production racer and validates that the active roster cannot omit its full-body layer. `src/ui/characterSelect.ts` uses the selection asset in the identity lane while retaining the race driver selector contract and leaving all `driver/*.png` runtime frames unchanged.

The package follows ADR-091 and ADR-092 and is recorded in `docs/assets/CHARACTER-SELECT-FULL-BODY-ASSET-BRIEF.md`, `docs/ASSET-PROVENANCE.md`, every active avatar record, and `docs/ROSTER-MAPPING.md`. The PNGs are 1024 × 1536 transparent sRGBA runtime delivery derivatives kept in normal Git; future generated/source masters remain governed by Git LFS. Toph's initial marked candidate was rejected before the clean approved derivative was staged; no commercial marks, UI copy, scenery, kart art, or copied Route Night pixels are shipped in the images.

The package is deliberately bounded: no portraits, race driver frames, kart GLBs, kart identities, racer statistics, race authority, item/AI behavior, Circuit Alpha topology, PBR/material implementation, settings/audio behavior, or hosting architecture changed. Runtime validation covers the twelve selection PNGs in addition to the existing character package; focused manifest/UI tests cover asset separation and selected-profile binding.

Pre-publication validation: **67 test files / 536 tests passed**, with **81.20% statement / 75.89% branch / 86.39% function / 82.91% line coverage**; strict typecheck, zero-warning lint, branding verification, runtime-asset verification, production build, `git diff --check`, and `git lfs fsck` all passed. Runtime validation decoded **117 character PNGs**, including all twelve selection assets. The targeted Prettier check passed for the changed source/test/tool files and the new brief after limited formatting cleanup; repository-wide formatter drift remains historical and unrelated.

Publication and live acceptance: PR #187 merged at `7e8a9ea8901bef6ea4dd785780c4cc8295225ead`; post-merge CI/Pages run `35422609359` passed. Manny completed deployed desktop/mobile visual acceptance against the approved Route Night design and twelve roster assets: PASS. The Character Select visual-acceptance gate is closed with no defect reported.

The next bounded increment is documented at `docs/SLICE-6-RACE-HUD-RESULTS-PODIUM-DESIGN-2026-09-19.md` and `docs/superpowers/plans/2026-09-19-race-hud-results-podium.md`. It is planning-only on this branch.

## Slice 6 next bounded increment - Race HUD / mini-map / Results-Podium plan

Planning is recorded in `docs/SLICE-6-RACE-HUD-RESULTS-PODIUM-DESIGN-2026-09-19.md` and `docs/superpowers/plans/2026-09-19-race-hud-results-podium.md`. The approved direction uses ImageGen for a text-free 15-item visual pack, a restrained race atmosphere overlay, a Results/Podium backdrop, twelve top-three victory poses, and twelve 4th-8th reaction poses. Live DOM/CSS/SVG remains authoritative for HUD values, map topology, standings, controls, accessibility, and responsive geometry. Runtime implementation and publication remain later review gates.

## Slice 6A Race HUD / Circuit Alpha minimap asset-authoring checkpoint — branch-only

Following the PR #187 Character Select acceptance, the canonical Route Night target was reviewed before authoring the next presentation surface. The approved atmosphere overlay and fifteen item PNGs are reused; the missing exact panel/gauge/item/minimap frame geometry is authored as the text-free SVG library `public/assets/ui/route-night/route-night-race-hud.svg`. Live HUD values, item state, warnings, portraits, and Circuit Alpha topology remain DOM/CSS/SVG-owned.

The branch is `feature/slice6-race-hud-minimap-results-podium`. It adds the semantic race-shell composition, approved item-art mapping with fallback, and the authored minimap frame while preserving existing race authority and dynamic IDs. Results/Podium screens, victory/reaction poses, and finish-transition behavior remain explicitly deferred. This is a branch-only implementation checkpoint until focused/full validation and a later publication/deployment visual gate are complete.

## Slice 6B Results/Podium asset-authoring checkpoint — approved batches 01-02

Manny approved and published the first three character-specific Results/Podium
victory poses on 2026-09-19: Alex / AA-01, Lavi / AA-02, and Lula / AA-03.
The files are fixed-size 1024 × 1536 transparent sRGBA runtime derivatives at
`public/assets/characters/aa-##/results/victory.png`. Each pose uses the
matching approved Character Select full-body art as its actual generation
reference and has a distinct silhouette, gesture, and emotional read. The
asset brief and provenance ledger record source IDs, deterministic alpha
preparation, runtime hashes, and the approval boundary.

Manny then approved and published Batch 02: Keeg / AA-04, Kraken / AA-05, and
Dragon Queen / AA-06. Keeg's theatrical hat-tip, Kraken's controlled
pocket-and-chin stance, and Dragon Queen's fully draconic sovereign display
extend the unique pose language without reusing a generic celebration pose.

This checkpoint contains no Results/Podium runtime wiring, standings changes,
reaction assets, backdrop, gameplay, race-authority, AI, item, audio, or
deployment changes. Six remaining victory poses, six remaining reaction poses, and
the Results/Podium backdrop remain separately gated by visual approval.

## Slice 6 Results/Podium runtime subset — feature-branch checkpoint, 2026-09-23

Manny approved this bounded runtime increment while the remaining Results art was pending. It is implemented on `feature/slice6-race-hud-minimap-results-podium`. The earlier asset-authoring checkpoint above remains limited to art; this section records the later runtime change.

**Feature-branch code commit:** `51a18ec6e8430153bcc941611039044d8a760a16`.

The race now emits `RaceStanding` snapshots with stable racer and character IDs, display name, portrait URL, and locked place/time while retaining the existing `name`, `place`, and `time` fields. Player identity comes from the selected manifest entry; each AI identity is stored when its roster character is created. Results rendering consumes the authoritative standing order, displays the player character name with a YOU tag, and refreshes the open view when late AI racers finish without changing the player's locked result.

The DOM Results/Podium view renders ranks one through three and the finished lower ranks from `place`, provides all eight standings in a keyboard-scrollable region, and offers Race Again, Change Driver, and Return to Hub. The six approved victory poses are mapped by stable character ID for eligible podium places. Missing pose art falls back to approved full-body selection art, portrait, then monogram. Lower finishers use the approved selection art until reaction poses are separately approved. Race Again disposes and recreates the race using the same selected character; the other routes dispose the race before navigation.

The responsive board stays docked to the right on desktop and along the lower portion on mobile, leaving the race view visible. Changing finish count has its own polite live status; the standings list is not a live region. The presentation is static and includes reduced-motion overrides.

**Local verification:** `npm run validate` passed **71 test files / 561 tests**, with **81.91% statement / 76.23% branch / 87.06% function / 83.62% line coverage**. Strict typecheck, zero-warning lint, branding and runtime-asset validation, and production build passed; `git diff --check`, targeted Prettier checks, and `git lfs fsck` passed. Runtime validation decoded 117 character PNGs and verified the existing 36 GLBs and track textures. Vite reported its existing large-chunk warning for the `KartTimeTrial` bundle.

This is a branch-only automated checkpoint. No hosted PR run, deployment, or live desktop/mobile visual acceptance is claimed. The remaining six victory poses, six remaining reaction poses, and Results backdrop remain gated; the full Race HUD/mini-map and release-candidate acceptance scope also remain open.

## Slice 6 Results/Podium victory art extension — feature-branch checkpoint, 2026-09-23

Manny approved the third victory-pose batch: McFleurdel / AA-07, Toph / AA-08,
and Manaconda / AA-09. Their 1024 × 1536 transparent RGBA runtime derivatives
are recorded with generator IDs and source/runtime hashes in the Results asset
brief and provenance ledger. The podium allowlist now maps all nine approved
characters by stable ID; places four through eight retain their existing
selection-art fallback. The production asset verifier checks the three exact
hashes, dimensions, RGBA encoding, and transparent corners. No balance mapping,
race authority, kart, driver art, reaction asset, or backdrop changed.

**Local verification:** `npm run validate` passed **72 test files / 565 tests**
with **81.92% statement / 76.25% branch / 87.06% function / 83.62% line
coverage**. Typecheck, zero-warning lint, branding/runtime-asset validation,
and the production build passed. Runtime validation decoded 120 character
PNGs, checked 36 materialized GLBs and three track textures, and verified the
three Results/Podium asset hashes. Vite reported its existing large-chunk
warning for the `KartTimeTrial` bundle.

This is a branch-only automated checkpoint. No hosted PR run, deployment, or
live desktop/mobile visual acceptance is claimed. Three victory poses, twelve
reaction poses, the Results backdrop, and the remaining Slice 6 acceptance
scope remain gated.

## Slice 6 Results/Podium victory art extension — feature-branch checkpoint, 2026-09-24

This bounded extension adds the already approved Krios / AA-10, Accu / AA-11,
and Jennifer / AA-12 victory cutouts to the existing podium mapping. Their
1024 × 1536 RGB source renders and Library file IDs are recorded in
`docs/assets/ROUTE-NIGHT-RACE-RESULTS-ASSET-BRIEF.md` and
`docs/ASSET-PROVENANCE.md`. Generator output IDs were not present in the
recovered source record and are left unstated. The deterministic preparation
script verifies source and runtime hashes, writes the green-pass guides, and
keys only the generated `#00FF00` matte while preserving every visible source
RGB value and zeroing fully transparent RGB.

The stable-ID podium allowlist now covers all twelve approved victory poses
for places 1–3 only. Places 4–8 retain the existing selection-art, portrait,
and monogram fallback chain. This extension adds no reaction art, Results
backdrop, standings change, gameplay behavior, driver art, kart asset, or
balance mapping.

**Local validation:** `npm run validate` passed strict typecheck, zero-warning
lint, **72 test files / 568 tests** (**81.92% statements / 76.25% branches /
87.06% functions / 83.62% lines**), branding/runtime-asset verification, and
the production build. Runtime verification decoded 123 character PNGs,
verified 36 materialized GLBs and three track textures, and checked six
Results/Podium asset hashes. The three new PNGs pass the 1024 × 1536 RGBA,
transparent-corner, transparent-RGB-zeroing, and no-key-green checks.
`git diff --check`, targeted formatting of changed source/test/tool/avatar
records, and `git lfs fsck` passed. The existing Vite large-chunk warning for
`KartTimeTrial` remains.

This is branch-only automated evidence; the checkpoint is not merged or
deployed, and no deployed live visual acceptance is claimed. The twelve
lower-finish reaction poses, Results backdrop, and remaining Slice 6 acceptance
scope stay open.

## Slice 6 Results/Podium reaction art — approved batch 01, 2026-09-24

Manny approved the first three lower-finish reactions: Alex / AA-01, Lavi /
AA-02, and Lula / AA-03. The approved 1024 × 1536 transparent sRGBA runtime
derivatives use their matching approved Character Select full-body images as
actual generation references. The preparation script
`tools/assets/prepare_results_reaction_cutouts.py` records the green-screen
matte and Lavi's specifically cleared enclosed arm/shoulder gap, and verifies
the source/runtime hashes byte-for-byte.

The fixed-size runtime assets are included at
`public/assets/characters/aa-01/results/reaction.png`,
`public/assets/characters/aa-02/results/reaction.png`, and
`public/assets/characters/aa-03/results/reaction.png`. Asset details and
hashes are recorded in the Results asset brief, provenance ledger, and each
character record. The runtime verifier now checks their exact hashes, 1024 ×
1536 dimensions, RGBA encoding, transparent corners, zeroed transparent RGB,
and absence of opaque key-green pixels.

This is an asset-only checkpoint. Places 4–8 continue using selection art;
reaction runtime mapping is not part of this commit. Six reaction poses, the
Results backdrop, remaining Results integration, and Slice 6 deployed desktop
and mobile acceptance remain open. Next recommended action: generate reactions
for AA-04–06 through the same prompt, render approval, cutout approval, and
publication gates.

## Slice 6 Results/Podium reaction art — approved batch 02, 2026-09-24

Manny approved the chroma-green renders and transparent cutouts for Keeg / AA-04, Kraken / AA-05, and Dragon Queen / AA-06. The matching approved Character Select full-body art was used as each generation's actual image reference. Their cutout SHA-256 values are recorded in the Results asset brief and provenance ledger; the runtime verifier checks exact bytes and PNG transparency requirements.

The files are included at `public/assets/characters/aa-04/results/reaction.png`, `public/assets/characters/aa-05/results/reaction.png`, and `public/assets/characters/aa-06/results/reaction.png`. Their avatar records and the lower-finish Results asset brief now record the approved poses and references. Results runtime mapping remains unchanged; places 4–8 continue to use the existing selection-art, portrait, and monogram fallback chain.

This asset-only checkpoint does not change gameplay, race authority, balance, kart art, victory poses, or deployment behavior. Six reaction poses, the Results backdrop, remaining Results integration, and Slice 6 deployed desktop/mobile acceptance remain open. Next recommended action: prepare AA-07–09 through the established green-screen render, cutout review, and publication gates.

## Slice 6 Results/Podium reaction art — approved batch 03, 2026-09-25

Manny approved the three green-background renders and then the true-alpha
cutouts for McFleurdel / AA-07, Toph / AA-08, and Manaconda / AA-09. The
approved full-body selection assets were actual generation inputs. The three
1024 × 1536 runtime PNGs and their exact hashes are recorded in the Results
asset brief, provenance ledger, and character records. The approved cutouts
are limited to the asset package; places 4–8 still use selection art.

The preparation script now pins source and derivative hashes for AA-01–09,
correcting the batch-02 publication gap where AA-04–06 runtime binaries and
hashes were present but its committed rebuild script covered only AA-01–03.
Fresh AA-07–09 rebuilds matched the reviewed files byte for byte. The runtime
verifier now checks all nine reaction hashes and includes AA-04–09 in the
PNG format, dimensions, transparency, and key-green checks.

Local `npm run validate` passed strict typecheck, zero-warning lint, 72 test
files / 568 tests, branding, 15 approved Results assets, 36 GLBs, 132 runtime
character PNGs, and production build. Coverage: 81.92% statements, 76.25%
branches, 87.06% functions, 83.62% lines. Vite retains its existing
non-blocking large-chunk warning for `KartTimeTrial`.

This is a feature-branch asset checkpoint, with no merge, deployed visual
acceptance, or Results behavior change. AA-10–12 reactions, the Results
backdrop, reaction runtime mapping, and remaining Slice 6 acceptance are open.
Next recommended action: prepare AA-10–12 through the same render approval,
cutout approval, and publication gates.

## Slice 6 Results/Podium reaction art — approved batch 04, 2026-09-25

Manny approved the chroma-green renders and transparent cutouts for Krios /
AA-10, Accu / AA-11, and Jennifer / AA-12. Each render used its approved
Character Select full-body asset as the actual image-generation reference.
The three 1024 × 1536 RGBA reaction assets are recorded in the asset brief,
provenance ledger, and character records. The runtime verifier checks exact
asset hashes, dimensions, transparency, zeroed RGB under transparent pixels,
and absence of opaque key-green pixels. Results runtime selection is unchanged;
places 4–8 retain the current selection-art fallback.

Local `npm run validate` passed typecheck, zero-warning lint, 72 test files /
568 tests (81.92% statements, 76.25% branches, 87.06% functions, 83.62% lines),
branding and runtime asset verification, and production build. Runtime checks
verified 18 Results/Podium assets, 36 GLBs, and 135 character PNGs. Vite
reported its existing large-chunk warning for `KartTimeTrial`.

This is an asset-only branch checkpoint. The Results backdrop, reaction
runtime mapping, and deployed desktop/mobile acceptance remain open.

## Slice 6 Results/Podium lower-finish reaction runtime mapping

The GitHub-published code/test checkpoint is
`23bc7c9f607f1a12e3a5980042a808562f4b85fd` on
`feature/slice6-race-hud-minimap-results-podium`. Its tree matches the locally
validated implementation tree; subsequent commits reconcile status and exact
documentation bytes without changing runtime code.

The existing Results view now selects the approved `results/reaction.png` for
places 4–8 by the standing's stable `characterId`. Places 1–3 continue to use
the approved victory mapping. Each revision query uses the verified runtime
SHA-256 from the Results asset brief. If a reaction image fails, the existing
selection-art, portrait, and monogram fallback chain remains active. Rank and
time continue to come from the authoritative `RaceStanding`; this increment
does not change race authority, finish behavior, or navigation.

Focused regression coverage verifies reaction/victory rank boundaries,
character-ID lookup independent of display labels, exact cache revision use,
all twelve profile mappings, and fallback after a missing reaction asset.
`npm run validate` passed: 72 test files / 583 tests, 81.93% statement / 76.25%
branch / 87.07% function / 83.64% line coverage, strict typecheck, zero-warning
lint, branding/runtime-asset verification, and production build. Runtime checks
verified 18 Results/Podium assets, 36 materialized GLBs, and 135 character
PNGs. `git diff --check`, targeted Prettier, and `git lfs fsck` also passed;
the existing `KartTimeTrial` large-chunk warning remains. The approved Results
backdrop, full Results visual tuning, hosted deployment, and desktop/mobile
live acceptance remain open. This is a feature-branch implementation
checkpoint, not Slice 6 completion.

## Slice 6 approved Results/Podium backdrop integration — 2026-09-25

Manny approved the Route Night Results/Podium backdrop render. The 1672 × 941
opaque WebP is now rendered as a decorative layer behind the Results board.
The podium, authoritative standings and times, status, and race actions remain
live DOM content. Focused tests cover the backdrop URL, hidden decorative
semantics, and continued live standings/actions; runtime verification pins the
approved WebP signature and SHA-256.

Focused verification passed: 2 test files / 36 tests, plus
`node tools/verify-runtime-assets.mjs` (18 Results/Podium character assets,
the new backdrop, 36 GLBs, and 135 character PNGs). Full `npm run validate`
passed: 72 test files / 584 tests (81.93% statements, 76.25% branches, 87.07%
functions, 83.64% lines), strict typecheck, zero-warning lint, branding and
runtime asset verification, and production build. The existing Vite large
chunk warning remains for `KartTimeTrial`. Desktop/mobile visual acceptance
remains pending.

The approved PNG source is retained as its ImageGen output and documented by
generator ID and SHA-256, following the existing Route Night UI asset
workflow. The fixed-size WebP is the runtime delivery asset. This is a
feature-branch checkpoint only; it does not authorize merge or deployment.

## Slice 6 Task 10 local release-evidence checkpoint — 2026-09-25

Verified repository state before checks: branch `feature/slice6-race-hud-minimap-results-podium`, `HEAD` and `origin/feature/slice6-race-hud-minimap-results-podium` both at `1c942fc2c5913859bc46d7a22188e132a15f6822`; worktree clean.

Focused suites passed with:

```bash
npx vitest run tests/race-hud-ui.test.ts tests/minimap.test.ts tests/results-podium.test.ts tests/results-routing.test.ts tests/app-shell.test.ts tests/route-night-ui.test.ts tests/item-hud-input.test.ts tests/race-results-assets.test.ts tests/race-results.test.ts tests/character-select-ui.test.ts --coverage=false
```

Result: **10 test files / 79 tests passed**. Full `npm run validate` passed strict typecheck, zero-warning lint, **72 test files / 584 tests**, branding and runtime-asset verification, and production build. Coverage: **81.93% statements / 76.25% branches / 87.07% functions / 83.64% lines**. Runtime verification checked 18 Results/Podium assets (including the backdrop), 36 materialized runtime GLBs, and 135 character PNGs. The approved backdrop runtime SHA-256 is `24812fcd47e20c28601cbdcc15e1f824a3e17b1fdd679c346578bb600a539465`; source and all approved reaction hashes remain in `docs/ASSET-PROVENANCE.md` and the Results asset brief. `git diff --check`, `git lfs fsck`, and targeted Prettier checks passed. Vite retains its existing non-blocking large-chunk warning for `KartTimeTrial`.

The five-restart cleanup/memory item remains **INCONCLUSIVE / NOT PASSED**. `tests/results-routing.test.ts` uses a mocked race factory and proves one disposal/routing cycle each for Race Again, Change Driver, and Return to Hub; it does not measure repeated real-game resource counts, stale markers, duplicated/orphaned DOM across five restarts, browser memory, or Results-only asset residency. No whole-app browser memory/soak harness exists in the repository. Do not mark this gate passed based on the routing suite.

GitHub inspection found no open PR for this branch and no PR-triggered workflow run associated with `1c942fc2c5913859bc46d7a22188e132a15f6822`. Hosted PR CI, Pages deployment, and deployed desktop/mobile review remain pending. Results visual acceptance remains pending until the deployed Title → Hub → Character Select → Race → Results flow is reviewed at desktop and mobile sizes; local tests/build are not deployed acceptance.

## Browser evidence 1 — deployed build provenance and baseline — 2026-09-25

Connected Chrome opened the README's GitHub Pages URL. The Title screen rendered at 1363 × 936 CSS pixels, DPR 1; the read-only DOM sample found `data-screen="title"`, 85 elements, zero Results screens, and zero mini-map nodes. These Title-state counts are baseline observations only. The browser page evaluation did not expose `window.performance`, so no heap measurement was collected.

The checked-in CI workflow deploys Pages only on pushes to `main`. `main` was `7e8a9ea8901bef6ea4dd785780c4cc8295225ead`; the feature branch was `cf9e357bb8faa88696865e28ab56323e15df1eee`. This live page is not the feature build and contributes no five-restart cleanup, memory, or deployed-acceptance evidence. Continue local browser validation only with an explicit local label; keep deployed acceptance pending.

## Browser evidence 2 — feature-branch preview access — 2026-09-25

The Vite preview started at `http://127.0.0.1:5173/manacondas-minigame-mayhem/` when bound explicitly to loopback; `0.0.0.0` startup failed because Vite could not query network interfaces. The connected cloud browser rejected both `127.0.0.1` and `localhost` with `net::ERR_BLOCKED_BY_CLIENT`, and its follow-up inspection was denied by URL policy. The Vite process was stopped. No feature-branch page, race cycle, DOM cleanup, heap, or Results-asset-residency evidence was collected. This is an access blocker, not a pass or leak finding. Continue only through an approved branch preview that the browser can reach; do not bypass browser policy. The five-restart and deployed visual gates remain open.

## Browser evidence 3 — GitHub branch preview deployment attempt — 2026-09-25

Manny requested a testable GitHub link without replacing the usual game. Temporary workflow commit `81f59f2831891c609c5bc4c0526a2de3034849aa` assembled the current `main` build at the Pages root and a feature build for `/previews/race-hud-results/`. Local `npm run build -- --base /manacondas-minigame-mayhem/previews/race-hud-results/` passed. GitHub Actions run [`36194146120`](https://github.com/Manaconda33/manacondas-minigame-mayhem/actions/runs/36194146120) passed LFS, both hosted builds, and upload of a 141 MB combined artifact (`sha256:cf9bf34768b390d252c57183b75c247f1dd1ea5156ddee2e70ba87b6c68283ba`). The deployment was rejected before execution: `Branch "feature/slice6-race-hud-minimap-results-podium" is not allowed to deploy to github-pages due to environment protection rules.` The temporary workflow was removed. The normal Pages Title still used `assets/index-Dt74Qa1M.js` and `assets/index-612kuw8p.css` before and after the attempt. No feature preview exists from this run, and no five-restart, real-game cleanup, Results-asset-residency, or memory measurement was collected. Task 10 remains **INCONCLUSIVE / NOT PASSED** and Task 11 deployed desktop/mobile acceptance remains pending.

## Browser evidence 4 — isolated GitHub Pages preview availability — 2026-09-25

Manny approved a temporary workflow-only change on `main` to publish a separate gameplay link. The feature build is pinned to `5ed7199a92061f1b9034ab7b69a6e6a18660fe92` by `main` commit `29fad5d1e66de2fff9f3007bafedb4c2f551df09`. Local `main` `npm ci && npm run build` matched the previously served root JS/CSS filenames; `npm run validate` passed 67 files / 536 tests, as did targeted workflow Prettier, `git diff --check`, and `git lfs fsck`. Hosted CI/Pages [run `36212375736`](https://github.com/Manaconda33/manacondas-minigame-mayhem/actions/runs/36212375736) passed both jobs. Connected Chrome opened `https://manaconda33.github.io/manacondas-minigame-mayhem/previews/race-hud-results/` and saw the Route Night Title with preview-relative `index-UqrfspIU.js` and `index-wawQ29f5.css`. The normal Pages Title continued to load `assets/index-Dt74Qa1M.js` and `assets/index-612kuw8p.css`. This proves a browser-reachable feature preview and unchanged root bundle identity at inspection, but no gameplay cycle, cleanup, Results-only asset, or memory result. Task 10 is **INCONCLUSIVE / NOT PASSED**; Task 11 desktop/mobile visual acceptance and Manny's explicit acceptance are pending.

## Character Select desktop clipping defect — 2026-09-26

Manny's 100% desktop screenshot (1915 × 902 PNG) cut off the lower profile, statistics, and START RACE, while his 75% screenshot (1910 × 906 PNG) exposed them. Connected Chrome reproduced the layout problem at 1363 × 936 CSS pixels on the pinned preview: START RACE bottom 1032.59 px, screen bottom 1128.13 px, screen `scrollHeight = clientHeight = 1128 px`, body `overflow-y: hidden`. A local CSS correction bounds the Character Select screen to 100svh and uses a shorter hero stage/top padding for desktop heights at most 1000 px. Focused 3 files / 20 tests and full `npm run validate` (72 files / 584 tests) passed, but the correction has not been published or visually verified. Task 10 five-restart cleanup/memory is **INCONCLUSIVE / NOT PASSED**; Task 11 desktop/mobile visual acceptance remains pending.
