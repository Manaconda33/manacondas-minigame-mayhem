# Implementation Status

## Current slice

**Slice 5 - Item Boxes, Weapons & Position-Based Distribution - NITRO OVERDRIVE LIVE ACCEPTED; HYPER-DRIVE GOVERNANCE PROPOSAL IN REVIEW; SLICE 5 CLOSURE OPEN**

PRD baseline: **v1.1, approved implementation amendments 2.18-2.20 / ADR-079-081; proposed Hyper-Drive governance amendment 2.21 / ADR-082**.

Latest verified merged `main`: **`23c1aa2b11931807af34330b0b45b69297a15451`**.

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

The deployed player-only route is `?testItem=nitro-overdrive`. Manny reported **“Pass”** on 2026-09-17. No browser/device-specific result is inferred beyond that explicit report. Hyper-Drive Rocket, full AI item use/tactics, final cross-item evidence, soak/performance, issue #106, and final Slice 5 closure remain open.

## Hyper-Drive Rocket governance proposal - 2026-09-17

Hyper-Drive Rocket is the next bounded Slice 5 item approved for work. `docs/SLICE-5-HYPER-DRIVE-ROCKET-SCOPE.md` proposes amendment 2.21 / ADR-082: one atomic charge; the existing rank 6-8 and at-least-45-meter selector eligibility; an exactly 6.0 race-second state; legal Circuit Alpha projection/autopilot through normal controller input; a 1.25x speed-cap target; ordinary movement-earned overtakes; a final 0.30-second control return; source-scoped racer-contact and supported ground/area-hazard immunity; pause/lifecycle cleanup; and original procedural presentation.

This is a governance proposal only. No Hyper-Drive gameplay, VFX, audio, or presentation implementation is claimed or authorized by this checkpoint. General AI item acquisition/use/tactics remains a separate full-Slice-5 gate. Scope review, docs-only publication with hosted CI/Pages, and separate implementation authorization are still required. The proposed player-only route is `?testItem=hyper-drive-rocket`.

## Slice 5 accepted/deployed state

Live-accepted bounded increments include item boxes/one-slot inventory/roulette/HUD/input foundation, Nitro Surge, Ricochet Kinetic Disc, Homing Seeker Drone, Apex core, Timed Blast Orb/HazardSystem, Slick Trap, Slick/Blast AI hazard response, Acoustic Shockwave Pulse, Prismatic Invincibility, Blaze Orbs, Frost Orbs, Rebounding Arc Blade, **Kinetic Arc Hammers**, and **Continuous Nitro Overdrive**.

Vision-Obscuring Ink Splat gameplay/presentation and Amendment 2.19 AI tuning are merged, deployed, and live accepted under amendments 2.18-2.19 / ADR-079-080 through PRs #148-149. Continuous Nitro Overdrive is merged, deployed, and live accepted under amendment 2.20 / ADR-081 through PR #152. **Hyper-Drive Rocket governance is proposed/in review under amendment 2.21 / ADR-082; gameplay and presentation implementation remain held.**

Remaining Slice 5 closure work also includes full AI item acquisition/use, final all-item interaction/counter evidence, lifecycle/object-count soak, item/VFX performance evidence, final desktop/mobile full-slice acceptance, and issue #106 disposition as appropriate. Slice 6 remains locked.

## Known issues

- Issue #106 remains future development and nonblocking for accepted item increments.
- Existing production-build large-chunk warning remains known and nonblocking.
- Three moderate npm audit findings remain in the unchanged dependency set.
- No Arc Hammers defect is open from the completed acceptance matrix.

## Next recommended action

Review and, if approved, publish the bounded Hyper-Drive Rocket governance scope; then hold at the separate implementation-authorization gate while completing the remaining full-slice validation/closure work. Slice 6 remains locked.

## Approval state

**Slice 5 design:** APPROVED 2026-09-05.

**Rebounding Arc Blade:** LIVE ACCEPTED 2026-09-16.

**Kinetic Arc Hammers scope/governance:** APPROVED / PUBLISHED.

**Kinetic Arc Hammers gameplay + original presentation:** **LIVE ACCEPTED 2026-09-16** through PR #144 / `a129bbac75f919dc7136ac50dfd63564fe5cd52e` / runs `35137395927` and `35137681000` / product-owner comment `5703186707`.

**Vision-Obscuring Ink Splat scope/governance:** **APPROVED / PUBLISHED 2026-09-16** under amendment 2.18 / ADR-079. **Amendment 2.19 / ADR-080 AI tuning:** **LIVE ACCEPTED 2026-09-17** through PR #149 / \`af4fa73c2a05ad25e4e2d7343f89f3cf6b9f510f\` / post-merge run \`35188684882\` / product-owner comment \`5709839182\`.

**Hyper-Drive Rocket scope/governance:** **PROPOSED / IN REVIEW 2026-09-17** under proposed amendment 2.21 / ADR-082; gameplay, VFX, audio, and presentation implementation are not authorized by the proposal.

**Slice 5 implementation:** IN PROGRESS; Ink Splat and Continuous Nitro Overdrive are live accepted, and Hyper-Drive Rocket governance is in review. Remaining Slice 5 closure gates are still open.

**Slice 6:** LOCKED pending remaining Slice 5 validation/closure work and Manny's full-slice acceptance.
