# Implementation Status

## Current slice

**Slice 5 - Item Boxes, Weapons & Position-Based Distribution - INK SPLAT AI TUNING AMENDMENT IN PROGRESS**

PRD baseline: **v1.1, approved implementation amendments 2.18-2.19 / ADR-079-080**.

Latest verified pre-Ink-governance `main`: **`9ee6ee05fe71715a867a3c9a6b654904faf0e507`**.

Authorized Ink implementation baseline: governance-published `main` **`b62c96ae8297150d8f4cafaede4623d5b01a1e0b`**; implementation merged at **`2df6bf372b01e8a0f13c4bad71737ef8f5ab415d`** through PR #148, with post-merge validation/Pages **`35168880807`** passed. Live acceptance remains open; the approved AI tuning amendment is on a follow-up branch.

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

## Vision-Obscuring Ink Splat deployed implementation and tuning - 2026-09-17

Vision-Obscuring Ink Splat implementation and original presentation are **MERGED / DEPLOYED** through PR #148. Manny's live review found the original AI impairment below the intended perceptual threshold; the approved 2.19 / ADR-080 tuning amendment is **IN PROGRESS**, not yet deployed or live accepted.

Authorization evidence:

- Governance publication PR #147 merged at `b62c96ae8297150d8f4cafaede4623d5b01a1e0b` under amendment 2.18 / ADR-079.
- PR CI `35145111221` and post-merge validation/Pages `35145254188` passed.
- Publication evidence is recorded in PR #147 comment `5703901606`.
- Manny then explicitly authorized bounded Vision-Obscuring Ink Splat gameplay, VFX, audio, and presentation implementation in Work.
- PR #148 merged at `2df6bf372b01e8a0f13c4bad71737ef8f5ab415d`; hosted PR CI `35168738421` and post-merge validation/Pages `35168880807` passed.
- Manny approved Amendment 2.19 / ADR-080 tuning: 0.95 m lateral noise, 0.160-second reaction latency, and 0.74 steering precision; duration and all other boundaries remain unchanged.

The deployed implementation includes:

- progress-authoritative all-racers-ahead targeting, atomic one-charge dispatch, per-target immunity, refresh-without-stacking, and lifecycle state in `InkSplatSystem`;
- AI noise/history impairment through `AiDriver`, with legal-road bounding and unchanged throttle/speed authority;
- CSS organic screen overlay below HUD/touch controls, procedural impact audio, explicit incoming/Prismatic fixtures, and the `?testItem=ink-splat` route;
- focused state/audio tests and production-path runtime tests for targeting, inventory, immunity, pause/expiry, recovery, capacity, fixture resolution, and deterministic AI behavior.

Baseline validation:

- Clean `npm ci --prefer-offline --fetch-retries=0`: PASS.
- `git lfs fsck`: PASS.
- `npm run validate`: PASS — **53 test files / 462 tests**, **81.99% statement / 77.34% branch / 86.58% function / 83.54% line coverage**, branding/runtime-asset verification, and production build.
- Existing Vite large-chunk warning remains known/nonblocking.

The remaining Ink gates are tuned implementation review, a separate tuning publication PR, post-merge validation/Pages for the tuned values, and Manny's desktop/mobile live acceptance. No tuned merge, deployment, or live result is claimed by this checkpoint.

## Slice 5 accepted/deployed state

Live-accepted bounded increments include item boxes/one-slot inventory/roulette/HUD/input foundation, Nitro Surge, Ricochet Kinetic Disc, Homing Seeker Drone, Apex core, Timed Blast Orb/HazardSystem, Slick Trap, Slick/Blast AI hazard response, Acoustic Shockwave Pulse, Prismatic Invincibility, Blaze Orbs, Frost Orbs, Rebounding Arc Blade, and **Kinetic Arc Hammers**.

Vision-Obscuring Ink Splat gameplay/presentation is merged and deployed under amendment 2.18 / ADR-079 through PR #148, but remains not live accepted. Amendment 2.19 / ADR-080 tuning is approved and in progress. Three item effects remain not live accepted: **Vision-Obscuring Ink Splat, Continuous Nitro Overdrive, and Hyper-Drive Rocket**.

Remaining Slice 5 closure work also includes full AI item acquisition/use, final all-item interaction/counter evidence, lifecycle/object-count soak, item/VFX performance evidence, final desktop/mobile full-slice acceptance, and issue #106 disposition as appropriate. Slice 6 remains locked.

## Known issues

- Issue #106 remains future development and nonblocking for accepted item increments.
- Existing production-build large-chunk warning remains known and nonblocking.
- Three moderate npm audit findings remain in the unchanged dependency set.
- No Arc Hammers defect is open from the completed acceptance matrix.

## Next recommended action

Complete tuned Ink validation, then prepare the separate tuning publication checkpoint. Do not merge, deploy, or claim tuned live acceptance from this branch. Slice 6 remains locked.

## Approval state

**Slice 5 design:** APPROVED 2026-09-05.

**Rebounding Arc Blade:** LIVE ACCEPTED 2026-09-16.

**Kinetic Arc Hammers scope/governance:** APPROVED / PUBLISHED.

**Kinetic Arc Hammers gameplay + original presentation:** **LIVE ACCEPTED 2026-09-16** through PR #144 / `a129bbac75f919dc7136ac50dfd63564fe5cd52e` / runs `35137395927` and `35137681000` / product-owner comment `5703186707`.

**Vision-Obscuring Ink Splat scope/governance:** **APPROVED / PUBLISHED 2026-09-16** under amendment 2.18 / ADR-079; implementation is merged/deployed through PR #148 and not live accepted. **Amendment 2.19 / ADR-080 AI tuning:** APPROVED 2026-09-17 and IN PROGRESS on a follow-up branch.

**Slice 5 implementation:** IN PROGRESS.

**Slice 6:** LOCKED pending full Slice 5 validation, deployment, and Manny live acceptance.
