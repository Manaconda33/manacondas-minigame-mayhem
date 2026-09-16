# Implementation Status

## Current slice

**Slice 5 - Item Boxes, Weapons & Position-Based Distribution - REBOUNDING ARC BLADE LIVE ACCEPTED; KINETIC ARC HAMMERS IMPLEMENTATION IN PROGRESS**

PRD baseline: **v1.1, approved implementation amendment 2.17 / ADR-078**.

Latest verified `main`: **`ba7e20ab69666ce04ba253a147c93b1ae985db8f`**.

**Authorization:** Manny approved the complete Kinetic Arc Hammers scope on September 16, 2026 and explicitly authorized Arc Hammers gameplay plus original model/VFX/audio/presentation development after governance publication. This clears implementation only; merge/publication, hosted deployment and live acceptance remain separate gates.

## Rebounding Arc Blade final state

Rebounding Arc Blade is **LIVE ACCEPTED** under amendment 2.15 / ADR-076. Gameplay PR #139 merged at `8822341b61900799e0166cfe94bf69cb3986bf0e`; post-merge validation/Pages `35118484183` passed; PR #139 comment `5700594653` records Manny's all-tests-pass deployed acceptance. Reconciliation PRs #140/#141 also passed post-merge CI/Pages.

## Kinetic Arc Hammers governance publication - 2026-09-16

`docs/SLICE-5-ARC-HAMMERS-SCOPE.md`, PRD amendment 2.16 and ADR-077 are now the authoritative approved Hammer contract. PR #142 was limited to eight governance/PRD files and included no gameplay source, runtime asset, model, VFX/audio implementation, fixture, probability, tuning, racer-stat, track/checkpoint, AI-policy, dependency, or Slice 6 change.

Publication evidence:

- Final clean PR head: `3fa42acf8fdab3e13f4ff2a3010205137bf2b0e9`.
- Hosted PR CI `35124762217`: PASS, including Git LFS verification, clean `npm ci`, strict typecheck, zero-warning lint, **48 test files / 431 tests**, **82.50% statement coverage**, runtime/branding verification and production build.
- PR #142 squash merge: **`ba7e20ab69666ce04ba253a147c93b1ae985db8f`**.
- Post-merge validation / GitHub Pages: **`35124948452` PASS** for both validation and deploy jobs.
- The synchronized Word PRD renders to 52 pages. Pages 1-44 and 49-50 remained pixel-identical to the prior approved artifact; all changed/new appendix pages were visually reviewed without clipping, overlap, missing glyphs, or footer errors.
- Temporary governance transfer/synchronization tooling was removed before the final PR diff and merge.
- The unchanged dependency set continues to report three moderate npm audit findings; no remediation is claimed here.

The **governance gate is cleared**. ADR-078 separately clears the bounded implementation gate; gameplay publication and live acceptance remain pending.

## Kinetic Arc Hammers local implementation checkpoint - 2026-09-16

Manny's explicit Work authorization is recorded in PRD amendment 2.17 / ADR-078. The bounded implementation now includes:

- Arc Hammers configuration, launch inheritance, ballistic gravity, one supporting-surface rebound, collision ordering, owner arming, standard racer hit/immunity handling, Shockwave clearing, shared-capacity rollback and finite lifecycle cleanup inside `ProjectileSystem`.
- Real dispatcher/inventory transaction wiring for five charges and the 0.35-second committed-use cadence.
- An actual `SlickGroundSurface` query from `KartTimeTrial` for supporting-surface contact.
- Original procedural double-headed Hammer geometry, finite trail, bounce/impact cues and gesture-unlocked procedural launch/bounce/hit audio.
- Opt-in fixed-item and counter-route instrumentation: `?testItem=arc-hammers`, the Shockwave counter route, and Prismatic protected/expired counter routes. Counter results remain INCONCLUSIVE on misses and do not alter race authority or normal ITEM input.

Local evidence:

- `npx vitest run tests/arc-hammers.test.ts tests/projectile-system.test.ts tests/shockwave.test.ts tests/arc-blade.test.ts tests/item-system.test.ts`: **5 files / 77 tests passed**.
- `npm run typecheck`: **PASS**.
- `npm run lint`: **PASS**, zero warnings.
- `npm run validate`: **PASS** — **49 files / 441 tests**, **81.99% statement coverage**, typecheck, zero-warning lint, branding/LFS runtime-asset verification and production build. The existing Vite large-chunk warning remains nonblocking.
- Clean-install/hosted CI, rendered browser checks, desktop/mobile checks and Manny live acceptance remain pending.

This is not a published or live-accepted Hammer checkpoint.

## Kinetic Arc Hammers approved contract summary

Five charges; 0.35-second minimum commit cadence; forward/backward ballistic throws; 36 m/s horizontal launch, 11 m/s upward velocity, 24 m/s^2 gravity and 0.20x capped planar inheritance; 0.36 m radius; 0.18-second owner arming; one actual supporting-surface bounce with 0.78 tangential retention / 0.55 normal restitution; 0.75-second post-bounce and 2.25-second hard lifetime; first-wall and second-terrain-contact destruction; standard 0.85-second hit spin and destruction; later owner self-hit; generic/Prismatic immunity absorption; Shockwave <=5 m pre-movement clearing; guardrail > racer > terrain same-time priority; shared 40-object capacity; and pause/lifecycle cleanup.

The original procedural presentation and acceptance routes are authorized and implemented locally. No Hammer binary asset is required by the current procedural presentation. The route is not yet deployed or live accepted.

## Slice 5 state

Deployed/live-accepted bounded increments include item boxes/one-slot inventory/roulette/HUD/input foundation, Nitro Surge, Ricochet Kinetic Disc, Homing Seeker Drone, Apex core, Timed Blast Orb/HazardSystem, Slick Trap, Slick/Blast AI hazard response, Acoustic Shockwave Pulse, Prismatic Invincibility, Blaze Orbs, Frost Orbs, and Rebounding Arc Blade. The seeded distribution evidence from PR #114 remains valid.

Three item effects remain unimplemented and not live accepted: **Vision-Obscuring Ink Splat, Continuous Nitro Overdrive, and Hyper-Drive Rocket**. Arc Hammers has a local implementation but is not yet published or live accepted.

Remaining Slice 5 closure work also includes full AI item acquisition/use, final all-item interaction/counter evidence, lifecycle/object-count soak, item/VFX performance evidence, final desktop/mobile full-slice acceptance, and issue #106 disposition as appropriate. Slice 6 remains locked.

## Known issues

- Issue #106 remains future development and nonblocking for accepted item increments.
- The existing production-build large-chunk warning remains known and nonblocking.
- Three moderate npm audit findings remain in the unchanged dependency set.
- No Arc Blade defect is open.
- Arc Hammers local implementation has no known failing focused test; full validation, build, hosted deployment and rendered acceptance are still open.

## Next recommended action

**Finish local validation and prepare a feature-branch publication request.** Do not merge/deploy or claim live acceptance until full validation, hosted CI/Pages and Manny's rendered review are complete. Slice 6 remains locked.

## Approval state

**Slice 5 design:** APPROVED 2026-09-05.

**Rebounding Arc Blade:** LIVE ACCEPTED 2026-09-16.

**Kinetic Arc Hammers scope:** APPROVED 2026-09-16.

**Kinetic Arc Hammers governance publication:** COMPLETE through PR #142 / `ba7e20ab69666ce04ba253a147c93b1ae985db8f` / run `35124948452`.

**Kinetic Arc Hammers gameplay:** IMPLEMENTATION AUTHORIZED; LOCAL VALIDATION IN PROGRESS.

**Kinetic Arc Hammers asset/presentation development:** IMPLEMENTATION AUTHORIZED; LOCAL VALIDATION IN PROGRESS.

**Slice 5 implementation:** IN PROGRESS.

**Slice 6:** LOCKED pending full Slice 5 validation, deployment, and Manny live acceptance.
