# Implementation Status

## Current slice

**Slice 5 - Item Boxes, Weapons & Position-Based Distribution - INK SPLAT DEPLOYED / LIVE ACCEPTANCE PENDING**

PRD baseline: **v1.1, approved implementation amendment 2.18 / ADR-079**.

Latest verified pre-Ink-governance `main`: **`9ee6ee05fe71715a867a3c9a6b654904faf0e507`**.

Authorized Ink implementation baseline: governance-published `main` **`b62c96ae8297150d8f4cafaede4623d5b01a1e0b`**. Ink gameplay is now deployed from PR #148 merge **`2df6bf372b01e8a0f13c4bad71737ef8f5ab415d`**; product-owner live acceptance remains pending.

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

## Vision-Obscuring Ink Splat deployed implementation - 2026-09-16

Vision-Obscuring Ink Splat gameplay plus the approved original procedural/CSS presentation and original impact audio are **DEPLOYED / LIVE ACCEPTANCE PENDING** under amendment 2.18 / ADR-079. No product-owner live result is claimed yet.

Publication evidence:

- Governance PR #147 merge: `b62c96ae8297150d8f4cafaede4623d5b01a1e0b`; PR CI `35145111221` and post-merge validation/Pages `35145254188` passed; publication evidence comment `5703901606`.
- Manny separately authorized bounded Ink gameplay, VFX, audio, and presentation implementation and later explicitly approved merge and deployment of `feature/ink-splat-gameplay`.
- Supplied remote implementation checkpoint: `9c7dfe354d6f4f55147b7f7ba1abaaa9d2fbd429` (reported content-equivalent to local `d0ea786`).
- Review found and corrected one material issue before publication: the AI history sampler selected the oldest eligible retained decision, which could stretch the governed 0.080-second reaction latency toward approximately 0.30 seconds. The corrected sampler selects the newest decision at or before the 0.080-second cutoff, and `tests/ink-ai-latency.test.ts` locks that behavior.
- Final reviewed gameplay head: `1ff4e9acdb5e9464f19c059183f08a42712109a2`.
- Hosted PR #148 CI `35168738421`: PASS — Git LFS verification, clean `npm ci`, strict typecheck, zero-warning lint, **54 test files / 463 tests**, **81.97% statement / 77.31% branch / 86.56% function / 83.52% line coverage**, branding/runtime-asset verification and production build.
- PR #148 squash merge: **`2df6bf372b01e8a0f13c4bad71737ef8f5ab415d`**.
- Post-merge validation / GitHub Pages run **`35168880807` PASS**, including successful Pages deployment.
- Publication evidence: PR #148 comment **`5706830348`**.
- Existing Vite large-chunk warning remains known/nonblocking.
- Three moderate npm audit findings remain in the unchanged dependency set.

Deployed behavior includes progress-authoritative all-racers-ahead targeting, atomic one-charge use, per-target immunity, 2.50-second refresh-without-stacking state, human partial Ink overlay below HUD/touch controls, bounded AI impairment, original impact audio, deterministic incoming/Prismatic fixtures, production runtime wiring, recovery persistence, finish/restart/disposal cleanup, and zero shared projectile/hazard capacity use.

The remaining Ink gate is Manny's deployed desktop/mobile live acceptance matrix. Do not infer a browser/device or scenario pass until Manny reports it.

## Slice 5 accepted/deployed state

Live-accepted bounded increments include item boxes/one-slot inventory/roulette/HUD/input foundation, Nitro Surge, Ricochet Kinetic Disc, Homing Seeker Drone, Apex core, Timed Blast Orb/HazardSystem, Slick Trap, Slick/Blast AI hazard response, Acoustic Shockwave Pulse, Prismatic Invincibility, Blaze Orbs, Frost Orbs, Rebounding Arc Blade, and **Kinetic Arc Hammers**.

Vision-Obscuring Ink Splat is deployed under amendment 2.18 / ADR-079 and awaits product-owner live acceptance. Three item effects remain not live accepted: **Vision-Obscuring Ink Splat, Continuous Nitro Overdrive, and Hyper-Drive Rocket**.

Remaining Slice 5 closure work also includes full AI item acquisition/use, final all-item interaction/counter evidence, lifecycle/object-count soak, item/VFX performance evidence, final desktop/mobile full-slice acceptance, and issue #106 disposition as appropriate. Slice 6 remains locked.

## Known issues

- Issue #106 remains future development and nonblocking for accepted item increments.
- Existing production-build large-chunk warning remains known and nonblocking.
- Three moderate npm audit findings remain in the unchanged dependency set.
- No Arc Hammers defect is open from the completed acceptance matrix.

## Next recommended action

Run the deployed Vision-Obscuring Ink Splat live-acceptance matrix on the published Pages build. Do not mark Ink live accepted until Manny explicitly reports the deployed results. Slice 6 remains locked.

## Approval state

**Slice 5 design:** APPROVED 2026-09-05.

**Rebounding Arc Blade:** LIVE ACCEPTED 2026-09-16.

**Kinetic Arc Hammers scope/governance:** APPROVED / PUBLISHED.

**Kinetic Arc Hammers gameplay + original presentation:** **LIVE ACCEPTED 2026-09-16** through PR #144 / `a129bbac75f919dc7136ac50dfd63564fe5cd52e` / runs `35137395927` and `35137681000` / product-owner comment `5703186707`.

**Vision-Obscuring Ink Splat scope/governance:** **APPROVED / PUBLISHED 2026-09-16** under amendment 2.18 / ADR-079. **Gameplay + original presentation:** **DEPLOYED / LIVE ACCEPTANCE PENDING** through PR #148 / `2df6bf372b01e8a0f13c4bad71737ef8f5ab415d` / runs `35168738421` and `35168880807` / publication comment `5706830348`.

**Slice 5 implementation:** IN PROGRESS.

**Slice 6:** LOCKED pending full Slice 5 validation, deployment, and Manny live acceptance.
