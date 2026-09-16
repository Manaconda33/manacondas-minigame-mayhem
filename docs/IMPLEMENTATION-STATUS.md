# Implementation Status

## Current slice

**Slice 5 - Item Boxes, Weapons & Position-Based Distribution - REBOUNDING ARC BLADE LIVE ACCEPTED; KINETIC ARC HAMMERS SCOPE PROPOSED / MANNY APPROVAL REQUIRED**

PRD baseline: **v1.1, working approved implementation amendment 2.15**.

Latest verified `main`: **`da6e7e178d30ed5e2d03103dd1bbe18ba120b97d`**.

Proposed, not yet approved: **amendment 2.16 / ADR-077 - Kinetic Arc Hammers** in `docs/SLICE-5-ARC-HAMMERS-SCOPE.md`.

This file is intentionally maintained as a current-state continuation record. Detailed historical checkpoints remain durable in Git history, item-specific scope documents, PR discussions, `docs/DECISIONS.md`, and `docs/TESTING.md`.

## Rebounding Arc Blade final publication and live acceptance - 2026-09-16

Rebounding Arc Blade is **LIVE ACCEPTED** under PRD amendment 2.15 / ADR-076.

Publication and acceptance evidence:

- Governance PR #138 merged at `7ce6511bc040d2b176ed528b687ed589fafd045d`; governance PR CI `35026904237` and post-merge CI/Pages `35027045477` passed.
- Gameplay PR #139 published the exact validated tree `56e788cc04a1a070a6144cd826ad635207550e92`, identical to local checkpoint `281783cf4d5136a99ba5ffe01b6573e2da4cce43`.
- Hosted PR CI `35118244169` passed on exact reviewed head `5c38663cc3000591f6706da310be68f72217a883` before merge.
- PR #139 squash-merged at `8822341b61900799e0166cfe94bf69cb3986bf0e`.
- Post-merge validation / GitHub Pages run `35118484183` passed both jobs with **48 test files / 431 tests**, **82.50% statement coverage**, clean lockfile installation, Git LFS verification, strict typecheck, zero-warning lint, runtime/branding asset checks and production build.
- Manny reported that the deployed live acceptance **passed on all tests**; PR #139 comment `5700594653` records the product-owner result.
- Acceptance reconciliation PR #140 merged at `f009da1535eb9d214693d47ea0905817973f985a`; post-merge validation/Pages `35120596434` passed.
- README alignment PR #141 merged at `da6e7e178d30ed5e2d03103dd1bbe18ba120b97d`; post-merge validation/Pages `35121093818` passed.

No browser/device versions, recordings, or evidence beyond Manny's explicit all-tests-pass report are inferred. The bounded Arc Blade increment is closed.

## Slice 5 accepted functional increments

The following bounded Slice 5 increments are deployed and live accepted unless otherwise qualified in their governing records:

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

The seeded probability-distribution evidence remains valid: PR #114 exercised 100,000 selections per rank / 800,000 total selections against the production selector and passed the documented fit gate.

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

## Kinetic Arc Hammers scope/governance proposal - awaiting Manny approval

PRD Section 15.10 fixes five charges, a 0.35-second minimum cadence, ballistic trajectories, exactly one terrain bounce and short post-bounce expiry. The approved item-system design fixes the standard 0.85-second spinout on valid racer hit.

`docs/SLICE-5-ARC-HAMMERS-SCOPE.md` proposes amendment 2.16 / ADR-077 to resolve the remaining unspecified rules. Key proposed fill-ins are:

- forward/backward directional throws;
- 36 m/s horizontal launch, 11 m/s upward velocity and 24 m/s² downward gravity;
- 0.20x planar owner-velocity inheritance capped at 10 m/s before scaling;
- 0.36 m contact radius and 0.18-second owner arming;
- one actual supporting-surface bounce with 0.78 tangential retention and 0.55 normal restitution;
- a 0.75-second post-bounce lifetime cap and 2.25-second hard total lifetime;
- first guardrail contact destruction and second genuine terrain-contact destruction;
- first eligible racer hit applies only the accepted 0.85-second standard spin, then destroys the Hammer;
- later owner self-hit, ordinary immunity/Prismatic absorption and Shockwave pre-movement clearing;
- deterministic guardrail > racer > terrain tie priority;
- one shared capacity slot per active Hammer with atomic rollback and pause/lifecycle cleanup; and
- bounded original procedural presentation plus unrestricted fixed-item normal-race review.

The proposal is a review artifact only. **It does not alter the approved PRD, does not create ADR-077 as an approved decision, and does not authorize gameplay.**

If Manny approves the scope, the next step is a separate governance-publication checkpoint that synchronizes `docs/PRD.md`, `docs/DECISIONS.md`, the item-system checklist, `docs/TESTING.md`, this status file, and the Word PRD artifact, followed by hosted CI, merge and Pages deployment. Gameplay remains a separate later authorization gate.

## Known defects / unresolved issues

- **Issue #106 - Results ranking tile stops updating after player finishes:** future development and nonblocking for the accepted item increments.
- The existing production-build large-chunk warning remains known and nonblocking.
- Three moderate npm audit findings remain in the unchanged dependency set from the Arc Blade hosted run; no remediation is claimed here.
- No open Arc Blade gameplay or acceptance defect is recorded.

## Deferred work

- Competitive-balance tuning remains closed unless objective evidence or Manny explicitly reopens it.
- Larger presentation additions such as external PBR texture sets, HDR environment work, final audio mix, post-processing, and broader production polish remain Slice 6 or later work.
- No new character/avatar scope is authorized by the current Slice 5 work.

## Next recommended action

**STOP FOR MANNY REVIEW.** Review `docs/SLICE-5-ARC-HAMMERS-SCOPE.md`. Do not publish amendment 2.16 / ADR-077 as approved and do not implement Kinetic Arc Hammers gameplay until Manny explicitly approves the proposed contract and subsequent governance gate.

## Approval state

**Slice 5 design:** APPROVED 2026-09-05.

**Rebounding Arc Blade:** LIVE ACCEPTED 2026-09-16.

**Kinetic Arc Hammers scope/governance:** PROPOSED / NOT APPROVED. Manny approval required.

**Kinetic Arc Hammers gameplay:** NOT AUTHORIZED.

**Slice 5 implementation:** IN PROGRESS.

**Slice 6:** LOCKED pending full Slice 5 validation, deployment, and Manny live acceptance.

**Slice 3 - Character Selection & Avatar Ingestion:** COMPLETE / LIVE ACCEPTED.

**Retained Slice 4 AI/grid checkpoint:** COMPLETE.
