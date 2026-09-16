# Implementation Status

## Current slice

**Slice 5 - Item Boxes, Weapons & Position-Based Distribution - REBOUNDING ARC BLADE LIVE ACCEPTED; KINETIC ARC HAMMERS NEXT / SCOPE APPROVAL REQUIRED**

PRD baseline: **v1.1, working implementation amendment 2.15**.

Latest verified `main`: **`8822341b61900799e0166cfe94bf69cb3986bf0e`**.

This file is intentionally maintained as a current-state continuation record. Detailed historical checkpoints remain durable in Git history, the item-specific scope documents, PR discussions, `docs/DECISIONS.md`, and `docs/TESTING.md`.

## Rebounding Arc Blade final publication and live acceptance - 2026-09-16

Rebounding Arc Blade is **LIVE ACCEPTED** under PRD amendment 2.15 / ADR-076.

Publication evidence:

- Governance PR #138 merged at `7ce6511bc040d2b176ed528b687ed589fafd045d`; governance PR CI `35026904237` and post-merge CI/Pages `35027045477` passed.
- Gameplay PR #139 published the exact validated tree `56e788cc04a1a070a6144cd826ad635207550e92`, identical to local checkpoint `281783cf4d5136a99ba5ffe01b6573e2da4cce43`.
- Hosted PR CI `35118244169` passed on exact reviewed head `5c38663cc3000591f6706da310be68f72217a883` before merge.
- PR #139 squash-merged at `8822341b61900799e0166cfe94bf69cb3986bf0e`.
- Post-merge validation / GitHub Pages run `35118484183` passed both the validation and deploy jobs on that merge.
- Both hosted validation runs passed clean lockfile installation, Git LFS verification, strict typecheck, zero-warning lint, **48 test files / 431 tests**, **82.50% statement coverage**, runtime/branding asset checks, and the production build.
- The unchanged dependency set reported three moderate npm audit findings; no dependency remediation is claimed in this increment.

Product-owner evidence:

- Manny reported on September 16, 2026 that the deployed live acceptance **passed on all tests**.
- PR #139 comment `5700594653` durably records that product-owner result.
- The accepted live matrix is the complete Arc Blade matrix in `docs/SLICE-5-ARC-BLADE-SCOPE.md`: unrestricted normal-race three-charge use, forward-only behavior under normal/reverse ITEM intent, cadence/count, curved outbound and owner-return flight, safe owner catch, standard rival spin and legitimate second-leg hit behavior, Shockwave countering, Prismatic protected/expired controls, chase/rear presentation, desktop/mobile controls, readable audiovisual presentation, pause/recovery/finish/restart/hub cleanup, and normal-build accepted-item / AI hazard-response regression checks.
- No browser/device versions, recordings, or additional evidence beyond Manny's explicit all-tests-pass report are inferred.

The bounded Arc Blade increment is closed. Its gameplay, governance, publication, deployment, and live-acceptance gates are complete.

## Slice 5 accepted functional increments

The following bounded Slice 5 increments are deployed and live accepted unless otherwise noted in their governing records:

- item-box rows, pickup lifecycle, one-slot inventory, roulette, held-item HUD and desktop/mobile ITEM input foundation;
- Nitro Surge;
- Ricochet Kinetic Disc;
- Homing Seeker Drone;
- Apex Orbital Missile core;
- Timed Blast Orb and reusable `HazardSystem` foundation;
- Hazard Oil / Slick Trap;
- bounded Slick/Blast AI hazard response;
- Acoustic Shockwave Pulse;
- Prismatic Invincibility;
- Blaze Orbs;
- Frost Orbs; and
- Rebounding Arc Blade.

The seeded probability-distribution evidence remains valid: PR #114 exercised 100,000 selections per rank / 800,000 total selections against the production selector and passed the documented probability-fit gate.

## Remaining Slice 5 implementation work

Four item effects remain unimplemented and not live accepted:

1. **Kinetic Arc Hammers**
2. **Vision-Obscuring Ink Splat**
3. **Continuous Nitro Overdrive**
4. **Hyper-Drive Rocket**

Additional Slice 5 closure work remains open after those effects:

- full AI item acquisition/use policy and tactical item timing;
- final all-item interaction/counter matrix;
- complete lifecycle/object-count soak and cleanup evidence;
- final item/VFX performance-budget evidence;
- final desktop/mobile full-slice gameplay acceptance;
- issue #106 disposition as appropriate; and
- explicit overall Slice 5 product-owner acceptance.

Slice 6 remains locked until Slice 5 closes.

## Next bounded increment - Kinetic Arc Hammers

The authoritative PRD Section 15.10 currently specifies only:

- five charges;
- at least **0.35 race seconds** between committed uses;
- ballistic trajectories;
- exactly one terrain bounce; and
- short post-bounce expiry.

The existing approved item-system design additionally classifies an eligible Arc Hammer racer hit as the standard **0.85-second spinout**. The rank probability matrix and five-charge inventory entry already exist. No Arc Hammers gameplay implementation is authorized yet.

The next recommended action is a documentation-only Kinetic Arc Hammers scope/governance proposal that makes every currently unspecified gameplay rule explicit, including launch direction, ballistic constants, collision radius, owner arming/self-hit, racer/wall/terrain ordering, bounce restitution, post-bounce lifetime, Shockwave/Prismatic interaction, shared-capacity ownership, pause/lifecycle cleanup, procedural presentation, deterministic acceptance instrumentation, and automated/live acceptance gates.

That proposal must be presented to Manny for review before it is treated as an approved PRD amendment or ADR and before gameplay implementation begins.

## Known defects / unresolved issues

- **Issue #106 - Results ranking tile stops updating after player finishes:** classified as future development and nonblocking for the accepted item increments. No fix is included here.
- The existing production-build large-chunk warning remains known and nonblocking.
- Three moderate npm audit findings remain in the unchanged dependency set from the Arc Blade hosted run; no remediation is claimed here.
- No open Arc Blade gameplay or acceptance defect is recorded.

## Deferred work

- Competitive-balance tuning remains closed unless objective evidence or Manny explicitly reopens it.
- Larger presentation additions such as external PBR texture sets, HDR environment work, final audio mix, post-processing, and broader production polish remain Slice 6 or later work.
- No new character/avatar scope is authorized by the current Slice 5 work.

## Next recommended action

Prepare the **Kinetic Arc Hammers** scope/governance proposal against accepted `main` `8822341b61900799e0166cfe94bf69cb3986bf0e`, reconcile the Arc Blade acceptance checkmarks/evidence, and stop for Manny's approval. Do not implement Arc Hammers gameplay, change its probability weight, tune accepted items, enable full AI item tactics, or begin Slice 6 without approval.

## Approval state

**Slice 5 design:** APPROVED 2026-09-05.

**Rebounding Arc Blade:** LIVE ACCEPTED 2026-09-16 on PR #139 merge `8822341b61900799e0166cfe94bf69cb3986bf0e` / post-merge run `35118484183`.

**Kinetic Arc Hammers scope/governance:** NOT YET APPROVED. Manny approval is required before governance publication or gameplay implementation.

**Slice 5 implementation:** IN PROGRESS.

**Slice 6:** LOCKED pending full Slice 5 validation, deployment, and Manny live acceptance.

**Slice 3 - Character Selection & Avatar Ingestion:** COMPLETE / LIVE ACCEPTED.

**Retained Slice 4 AI/grid checkpoint:** COMPLETE.
