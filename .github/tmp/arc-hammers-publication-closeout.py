from pathlib import Path

MERGE = "a129bbac75f919dc7136ac50dfd63564fe5cd52e"
PR_CI = "35137395927"
POST = "35137681000"
HEAD = "e395c63e3f0a425a985de2208e624adf2dd87574"


def replace_once(path: str, old: str, new: str) -> None:
    p = Path(path)
    s = p.read_text()
    assert old in s, f"Missing expected text in {path}: {old[:80]!r}"
    p.write_text(s.replace(old, new, 1))


replace_once(
    "README.md",
    "Kinetic Arc Hammers governance is published under amendment 2.16 / ADR-077 through PR #142, and Manny has authorized bounded gameplay plus original model/VFX/audio/presentation implementation under amendment 2.17 / ADR-078; local implementation is in progress and is not yet published or live accepted.",
    f"Kinetic Arc Hammers gameplay and original procedural presentation are published under amendment 2.17 / ADR-078 through PR #144 at `{MERGE}`; hosted validation and Pages passed, while product-owner live acceptance remains pending.",
)

replace_once(
    "docs/DECISIONS.md",
    "- **Status:** Implementation authorized; local feature work is in progress. Gameplay publication, deployment and live acceptance remain pending.",
    f"- **Status:** Gameplay merged/deployed through PR #144 at `{MERGE}`; hosted PR CI `{PR_CI}` and post-merge validation/Pages `{POST}` passed. Product-owner live acceptance remains pending.",
)
replace_once(
    "docs/DECISIONS.md",
    "- **Boundary:** This clears the implementation gate only. It does not claim a merged/public gameplay release, hosted deployment or Manny live acceptance. It does not alter probabilities, accepted item behavior, racer statistics, track/checkpoint authority, AI item acquisition/use, dependencies or Slice 6 final polish.",
    f"- **Boundary:** Publication is complete but no Manny live acceptance is claimed. The published increment does not alter probabilities, accepted item behavior, racer statistics, track/checkpoint authority, AI item acquisition/use, dependencies or Slice 6 final polish.\n- **Publication evidence:** Reviewed head `{HEAD}` passed hosted PR CI `{PR_CI}` with 50 test files / 446 tests and 82.19% statement coverage; PR #144 squash-merged at `{MERGE}` and post-merge validation/GitHub Pages `{POST}` passed.",
)

replace_once(
    "docs/SLICE-5-ARC-HAMMERS-SCOPE.md",
    "**Status: SCOPE APPROVED AND GOVERNANCE PUBLISHED. PR #142 MERGED AT `ba7e20ab69666ce04ba253a147c93b1ae985db8f`; POST-MERGE VALIDATION/PAGES `35124948452` PASSED. MANNY AUTHORIZED ARC HAMMERS GAMEPLAY AND ORIGINAL MODEL/VFX/AUDIO/PRESENTATION IMPLEMENTATION ON 2026-09-16. LOCAL IMPLEMENTATION IS IN PROGRESS; GAMEPLAY PUBLICATION AND LIVE ACCEPTANCE REMAIN PENDING.**",
    f"**Status: GAMEPLAY AND ORIGINAL PROCEDURAL PRESENTATION PUBLISHED. PR #144 MERGED AT `{MERGE}`; HOSTED PR CI `{PR_CI}` AND POST-MERGE VALIDATION/PAGES `{POST}` PASSED. PRODUCT-OWNER LIVE ACCEPTANCE REMAINS PENDING.**",
)
replace_once(
    "docs/SLICE-5-ARC-HAMMERS-SCOPE.md",
    "This authorization permits the bounded implementation below; it does not claim gameplay publication, deployment or live acceptance, and it does not authorize Slice 6 final polish.",
    "The bounded implementation below is now published and deployed through PR #144. This publication does not claim product-owner live acceptance and does not authorize Slice 6 final polish.",
)
replace_once(
    "docs/SLICE-5-ARC-HAMMERS-SCOPE.md",
    "Governance is published on `main` at `ba7e20ab69666ce04ba253a147c93b1ae985db8f` after Rebounding Arc Blade live acceptance. Post-merge validation and GitHub Pages run `35124948452` passed.",
    f"Governance remains rooted at PR #142. The gameplay/presentation implementation is published on `main` at `{MERGE}`; hosted PR CI `{PR_CI}` and post-merge validation/GitHub Pages `{POST}` passed.",
)
replace_once(
    "docs/SLICE-5-ARC-HAMMERS-SCOPE.md",
    "**Status:** Implementation authorized; local feature work in progress. Gameplay publication, deployment and live acceptance remain pending.",
    f"**Status:** Gameplay merged/deployed through PR #144 at `{MERGE}`; hosted PR CI `{PR_CI}` and post-merge validation/Pages `{POST}` passed. Live acceptance remains pending.",
)
replace_once(
    "docs/SLICE-5-ARC-HAMMERS-SCOPE.md",
    "**Boundary:** This clears the implementation gate only. It does not claim a merged/public gameplay release, hosted deployment or Manny live acceptance. It does not alter probabilities, accepted item behavior, racer statistics, track/checkpoint authority, AI item acquisition/use, dependencies or Slice 6 final polish.",
    "**Boundary:** Gameplay publication/deployment is complete, but Manny live acceptance is not yet claimed. The increment does not alter probabilities, accepted item behavior, racer statistics, track/checkpoint authority, AI item acquisition/use, dependencies or Slice 6 final polish.",
)
replace_once(
    "docs/SLICE-5-ARC-HAMMERS-SCOPE.md",
    "4. **Gameplay publication:** **PENDING.** Local implementation and validation must complete before a publication request.",
    f"4. **Gameplay publication:** **COMPLETE.** Reviewed head `{HEAD}` passed hosted PR CI `{PR_CI}`; PR #144 squash-merged at `{MERGE}` and post-merge validation/Pages `{POST}` passed.",
)

p = Path("docs/TESTING.md")
s = p.read_text()
heading = "## Slice 5 Kinetic Arc Hammers - approved governance contract; gameplay/assets held"
start = s.index(heading)
next_heading = s.index("\n## ", start + len(heading))
section = f'''## Slice 5 Kinetic Arc Hammers - deployed; live acceptance pending

PRD amendments 2.16-2.17, ADR-077/078, and `docs/SLICE-5-ARC-HAMMERS-SCOPE.md` govern the deployed implementation. Reviewed head `{HEAD}` passed hosted PR CI `{PR_CI}` and PR #144 squash-merged at `{MERGE}`. Post-merge validation and GitHub Pages run `{POST}` passed. Automated evidence is **50 test files / 446 tests**, **82.19% statement / 77.39% branch / 86.56% function / 83.70% line coverage**, strict typecheck, zero-warning lint, Git LFS/runtime-asset verification, branding checks and production build.

Hammer-specific automation covers the exact approved values and boundaries: five charges; 0.35-second commit-only cadence; forward/backward input; 36 m/s horizontal launch, 11 m/s upward velocity, 24 m/s^2 gravity and 0.20x capped planar inheritance; 0.36 m radius; 0.18-second owner arming; one genuine supporting-surface bounce with 0.78 tangential retention / 0.55 normal restitution; 0.75-second post-bounce and 2.25-second hard lifetime; first-wall and second-terrain-contact destruction; 0.85-second standard hit spin; later self-hit; immunity/Prismatic absorption; Shockwave <=5 m pre-movement clearing; chronological collision ordering; shared-capacity rollback; pause/lifecycle cleanup; and race-authority preservation. `tests/arc-hammers-runtime.test.ts` additionally exercises production ITEM input, real shared capacity, the actual Circuit Alpha supporting-surface query, RacerEffects, KartTimeTrial/controller contact state, camera anchoring and recovery behavior.

Primary deployed review route: `?testItem=arc-hammers`. Counter diagnostics: `?testItem=shockwave&testArcHammerCounter=shockwave`, `?testItem=prismatic-invincibility&testArcHammerCounter=prismatic&testArcHammerPhase=protected`, and the same Prismatic route with `testArcHammerPhase=expired`. A miss, rail interception, terrain/lifetime expiry, recovery discontinuity, or unsuitable geometry is INCONCLUSIVE rather than PASS. Product-owner rendered desktop/mobile acceptance remains pending and must be recorded separately.
'''
p.write_text(s[:start] + section + s[next_heading:])

replace_once(
    "docs/SLICE-5-ITEM-SYSTEM-DESIGN.md",
    "Original procedural model/VFX/audio presentation and acceptance routes are authorized for this bounded increment. Keep the Arc Hammers functional checklist row open until implementation, validation, publication and live acceptance are complete.",
    f"Original procedural model/VFX/audio presentation and acceptance routes are implemented and deployed through PR #144 at `{MERGE}`; hosted PR CI `{PR_CI}` and post-merge validation/Pages `{POST}` passed. Keep the Arc Hammers functional checklist row open until Manny live acceptance is complete.",
)

Path("docs/IMPLEMENTATION-STATUS.md").write_text(f'''# Implementation Status

## Current slice

**Slice 5 - Item Boxes, Weapons & Position-Based Distribution - KINETIC ARC HAMMERS DEPLOYED / LIVE ACCEPTANCE PENDING**

PRD baseline: **v1.1, approved implementation amendment 2.17 / ADR-078**.

Latest verified `main`: **`{MERGE}`**.

## Kinetic Arc Hammers publication - 2026-09-16

Kinetic Arc Hammers gameplay plus the approved original procedural model/VFX/audio/presentation are now merged and deployed under amendments 2.16-2.17 / ADR-077-078.

Publication evidence:

- Final reviewed PR head: **`{HEAD}`**.
- Hosted PR CI **`{PR_CI}`: PASS** — Git LFS verification, clean `npm ci`, strict typecheck, zero-warning lint, **50 test files / 446 tests**, **82.19% statement / 77.39% branch / 86.56% function / 83.70% line coverage**, branding/runtime-asset verification and production build.
- Review repaired accidental connector truncation artifacts in large governance/testing documents before merge; no temporary repair workflow or truncation artifact entered `main`.
- Governed production-runtime coverage includes real ITEM input/inventory/capacity, actual Circuit Alpha supporting-surface sampling, RacerEffects spin/hit state, KartTimeTrial/controller contact behavior, camera anchoring, race-authority preservation and recovery behavior.
- PR #144 squash merge: **`{MERGE}`**.
- Post-merge validation / GitHub Pages: **`{POST}` PASS** for both validation and deploy jobs.
- Existing Vite large-chunk warning remains known/nonblocking.
- Three moderate npm audit findings remain in the unchanged dependency set.

**Publication is complete. Product-owner live acceptance is NOT yet recorded.**

## Deployed Arc Hammers review routes

- Primary: `?testItem=arc-hammers`
- Shockwave: `?testItem=shockwave&testArcHammerCounter=shockwave`
- Prismatic protected: `?testItem=prismatic-invincibility&testArcHammerCounter=prismatic&testArcHammerPhase=protected`
- Prismatic expired: `?testItem=prismatic-invincibility&testArcHammerCounter=prismatic&testArcHammerPhase=expired`

A miss, rail interception, terrain/lifetime expiry, recovery discontinuity or unsuitable geometry is INCONCLUSIVE rather than PASS for counter diagnostics.

## Rebounding Arc Blade final state

Rebounding Arc Blade remains **LIVE ACCEPTED** under amendment 2.15 / ADR-076. Gameplay PR #139 merged at `8822341b61900799e0166cfe94bf69cb3986bf0e`; post-merge validation/Pages `35118484183` passed; PR #139 comment `5700594653` records Manny's deployed acceptance.

## Slice 5 accepted/deployed state

Live-accepted bounded increments include item boxes/one-slot inventory/roulette/HUD/input foundation, Nitro Surge, Ricochet Kinetic Disc, Homing Seeker Drone, Apex core, Timed Blast Orb/HazardSystem, Slick Trap, Slick/Blast AI hazard response, Acoustic Shockwave Pulse, Prismatic Invincibility, Blaze Orbs, Frost Orbs, and Rebounding Arc Blade.

Kinetic Arc Hammers is **DEPLOYED / LIVE ACCEPTANCE PENDING**.

Three item effects remain unimplemented and not live accepted: **Vision-Obscuring Ink Splat, Continuous Nitro Overdrive, and Hyper-Drive Rocket**.

Remaining Slice 5 closure work also includes full AI item acquisition/use, final all-item interaction/counter evidence, lifecycle/object-count soak, item/VFX performance evidence, final desktop/mobile full-slice acceptance, and issue #106 disposition as appropriate. Slice 6 remains locked.

## Known issues

- Issue #106 remains future development and nonblocking for accepted item increments.
- Existing production-build large-chunk warning remains known and nonblocking.
- Three moderate npm audit findings remain in the unchanged dependency set.
- No automated Arc Hammers defect is open at this publication checkpoint; rendered/device acceptance is still pending.

## Next recommended action

Complete the deployed Arc Hammers live-acceptance matrix on desktop/mobile. Record only checks actually observed. Do not mark Arc Hammers LIVE ACCEPTED until Manny reports the deployed results. After acceptance reconciliation, continue Slice 5 in PRD order; Slice 6 remains locked.

## Approval state

**Slice 5 design:** APPROVED 2026-09-05.

**Rebounding Arc Blade:** LIVE ACCEPTED 2026-09-16.

**Kinetic Arc Hammers scope/governance:** APPROVED / PUBLISHED.

**Kinetic Arc Hammers gameplay + original presentation:** PUBLISHED / DEPLOYED through PR #144 / `{MERGE}` / run `{POST}`.

**Kinetic Arc Hammers live acceptance:** PENDING.

**Slice 5 implementation:** IN PROGRESS.

**Slice 6:** LOCKED pending full Slice 5 validation, deployment, and Manny live acceptance.
''')

for path in [
    "README.md",
    "docs/DECISIONS.md",
    "docs/IMPLEMENTATION-STATUS.md",
    "docs/SLICE-5-ARC-HAMMERS-SCOPE.md",
    "docs/SLICE-5-ITEM-SYSTEM-DESIGN.md",
    "docs/TESTING.md",
]:
    assert "Warning: truncated output" not in Path(path).read_text()
