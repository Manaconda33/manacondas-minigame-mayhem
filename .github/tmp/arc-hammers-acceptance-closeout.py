from pathlib import Path

ACCEPTANCE_COMMENT = "5703186707"
GAMEPLAY_MERGE = "a129bbac75f919dc7136ac50dfd63564fe5cd52e"
PUBLICATION_DOCS_MERGE = "e53bf652b88fb50c29e80acbb68062d49e170d96"
PR_CI = "35137395927"
GAMEPLAY_POST = "35137681000"
DOCS_POST = "35138696144"
DATE = "2026-09-16"


def replace_once(path: str, old: str, new: str) -> None:
    p = Path(path)
    text = p.read_text()
    assert old in text, f"missing expected text in {path}: {old[:120]!r}"
    p.write_text(text.replace(old, new, 1))


replace_once(
    "README.md",
    f"Kinetic Arc Hammers gameplay and original procedural presentation are published under amendment 2.17 / ADR-078 through PR #144 at `{GAMEPLAY_MERGE}`; hosted validation and Pages passed, while product-owner live acceptance remains pending.",
    f"Kinetic Arc Hammers gameplay and original procedural presentation are **LIVE ACCEPTED** under amendments 2.16-2.17 / ADR-077-078. PR #144 merged at `{GAMEPLAY_MERGE}`; hosted validation/Pages passed, and Manny reported all deployed Hammer tests passed on {DATE}. PR #144 comment `{ACCEPTANCE_COMMENT}` records the product-owner evidence.",
)

replace_once(
    "docs/DECISIONS.md",
    f"- **Status:** Gameplay merged/deployed through PR #144 at `{GAMEPLAY_MERGE}`; hosted PR CI `{PR_CI}` and post-merge validation/Pages `{GAMEPLAY_POST}` passed. Product-owner live acceptance remains pending.",
    f"- **Status:** **LIVE ACCEPTED.** Gameplay merged/deployed through PR #144 at `{GAMEPLAY_MERGE}`; hosted PR CI `{PR_CI}` and post-merge validation/Pages `{GAMEPLAY_POST}` passed. Manny reported all deployed Arc Hammers tests passed on {DATE}; PR #144 comment `{ACCEPTANCE_COMMENT}` records the product-owner evidence.",
)
replace_once(
    "docs/DECISIONS.md",
    "- **Boundary:** Publication is complete but no Manny live acceptance is claimed. The published increment does not alter probabilities, accepted item behavior, racer statistics, track/checkpoint authority, AI item acquisition/use, dependencies or Slice 6 final polish.",
    "- **Boundary:** Publication and bounded product-owner live acceptance are complete. No browser/device-specific result is inferred beyond Manny's explicit all-tests-pass report. The accepted increment does not alter probabilities, accepted item behavior, racer statistics, track/checkpoint authority, AI item acquisition/use, dependencies or Slice 6 final polish.",
)

status = f'''# Implementation Status

## Current slice

**Slice 5 - Item Boxes, Weapons & Position-Based Distribution - KINETIC ARC HAMMERS LIVE ACCEPTED**

PRD baseline: **v1.1, approved implementation amendment 2.17 / ADR-078**.

Latest verified pre-acceptance-record `main`: **`{PUBLICATION_DOCS_MERGE}`**.

## Kinetic Arc Hammers final state - {DATE}

Kinetic Arc Hammers gameplay plus the approved original procedural model/VFX/audio/presentation are **LIVE ACCEPTED** under amendments 2.16-2.17 / ADR-077-078.

Completion evidence:

- Final reviewed gameplay head: `e395c63e3f0a425a985de2208e624adf2dd87574`.
- Hosted PR CI `{PR_CI}`: PASS — Git LFS verification, clean `npm ci`, strict typecheck, zero-warning lint, **50 test files / 446 tests**, **82.19% statement / 77.39% branch / 86.56% function / 83.70% line coverage**, branding/runtime-asset verification and production build.
- PR #144 squash merge: **`{GAMEPLAY_MERGE}`**.
- Gameplay post-merge validation / GitHub Pages: **`{GAMEPLAY_POST}` PASS**.
- Publication-record reconciliation PR #145 merge: **`{PUBLICATION_DOCS_MERGE}`**.
- PR #145 post-merge validation / GitHub Pages: **`{DOCS_POST}` PASS**.
- Manny completed the supplied deployed Arc Hammers review routes and reported **“All tests pass.”**
- Product-owner evidence: PR #144 comment **`{ACCEPTANCE_COMMENT}`**.
- No browser/device-specific result is inferred beyond Manny's explicit all-tests-pass report.
- Existing Vite large-chunk warning remains known/nonblocking.
- Three moderate npm audit findings remain in the unchanged dependency set.

The four deployed acceptance routes covered primary Arc Hammers gameplay, Shockwave clearing, Prismatic protected absorption, and Prismatic expired ordinary-hit behavior. Arc Hammers has no known open defect at this acceptance checkpoint.

## Rebounding Arc Blade final state

Rebounding Arc Blade remains **LIVE ACCEPTED** under amendment 2.15 / ADR-076. Gameplay PR #139 merged at `8822341b61900799e0166cfe94bf69cb3986bf0e`; post-merge validation/Pages `35118484183` passed; PR #139 comment `5700594653` records Manny's deployed acceptance.

## Slice 5 accepted/deployed state

Live-accepted bounded increments include item boxes/one-slot inventory/roulette/HUD/input foundation, Nitro Surge, Ricochet Kinetic Disc, Homing Seeker Drone, Apex core, Timed Blast Orb/HazardSystem, Slick Trap, Slick/Blast AI hazard response, Acoustic Shockwave Pulse, Prismatic Invincibility, Blaze Orbs, Frost Orbs, Rebounding Arc Blade, and **Kinetic Arc Hammers**.

Three item effects remain unimplemented and not live accepted: **Vision-Obscuring Ink Splat, Continuous Nitro Overdrive, and Hyper-Drive Rocket**.

Remaining Slice 5 closure work also includes full AI item acquisition/use, final all-item interaction/counter evidence, lifecycle/object-count soak, item/VFX performance evidence, final desktop/mobile full-slice acceptance, and issue #106 disposition as appropriate. Slice 6 remains locked.

## Known issues

- Issue #106 remains future development and nonblocking for accepted item increments.
- Existing production-build large-chunk warning remains known and nonblocking.
- Three moderate npm audit findings remain in the unchanged dependency set.
- No Arc Hammers defect is open from the completed acceptance matrix.

## Next recommended action

Begin the next bounded Slice 5 item governance/scoping increment for **Vision-Obscuring Ink Splat**. Do not implement Ink gameplay before its required scope/governance approval gate is complete. Slice 6 remains locked.

## Approval state

**Slice 5 design:** APPROVED 2026-09-05.

**Rebounding Arc Blade:** LIVE ACCEPTED 2026-09-16.

**Kinetic Arc Hammers scope/governance:** APPROVED / PUBLISHED.

**Kinetic Arc Hammers gameplay + original presentation:** **LIVE ACCEPTED 2026-09-16** through PR #144 / `{GAMEPLAY_MERGE}` / runs `{PR_CI}` and `{GAMEPLAY_POST}` / product-owner comment `{ACCEPTANCE_COMMENT}`.

**Slice 5 implementation:** IN PROGRESS.

**Slice 6:** LOCKED pending full Slice 5 validation, deployment, and Manny live acceptance.
'''
Path("docs/IMPLEMENTATION-STATUS.md").write_text(status)

replace_once(
    "docs/SLICE-5-ARC-HAMMERS-SCOPE.md",
    f"**Status: GAMEPLAY AND ORIGINAL PROCEDURAL PRESENTATION PUBLISHED. PR #144 MERGED AT `{GAMEPLAY_MERGE}`; HOSTED PR CI `{PR_CI}` AND POST-MERGE VALIDATION/PAGES `{GAMEPLAY_POST}` PASSED. PRODUCT-OWNER LIVE ACCEPTANCE REMAINS PENDING.**",
    f"**Status: LIVE ACCEPTED. PR #144 MERGED AT `{GAMEPLAY_MERGE}`; HOSTED PR CI `{PR_CI}` AND POST-MERGE VALIDATION/PAGES `{GAMEPLAY_POST}` PASSED. MANNY REPORTED ALL DEPLOYED ARC HAMMERS TESTS PASSED ON {DATE}; PR #144 COMMENT `{ACCEPTANCE_COMMENT}` RECORDS PRODUCT-OWNER EVIDENCE.**",
)
replace_once(
    "docs/SLICE-5-ARC-HAMMERS-SCOPE.md",
    f"**Status:** Gameplay merged/deployed through PR #144 at `{GAMEPLAY_MERGE}`; hosted PR CI `{PR_CI}` and post-merge validation/Pages `{GAMEPLAY_POST}` passed. Live acceptance remains pending.",
    f"**Status:** **LIVE ACCEPTED.** Gameplay merged/deployed through PR #144 at `{GAMEPLAY_MERGE}`; hosted PR CI `{PR_CI}` and post-merge validation/Pages `{GAMEPLAY_POST}` passed. Manny reported all deployed Hammer tests passed on {DATE}; PR #144 comment `{ACCEPTANCE_COMMENT}` records the acceptance evidence.",
)
replace_once(
    "docs/SLICE-5-ARC-HAMMERS-SCOPE.md",
    "**Boundary:** Gameplay publication/deployment is complete, but Manny live acceptance is not yet claimed. The increment does not alter probabilities, accepted item behavior, racer statistics, track/checkpoint authority, AI item acquisition/use, dependencies or Slice 6 final polish.",
    "**Boundary:** Gameplay publication/deployment and bounded live acceptance are complete. No browser/device-specific result is inferred beyond Manny's explicit all-tests-pass report. The increment does not alter probabilities, accepted item behavior, racer statistics, track/checkpoint authority, AI item acquisition/use, dependencies or Slice 6 final polish.",
)
replace_once(
    "docs/SLICE-5-ARC-HAMMERS-SCOPE.md",
    "5. **Live acceptance:** **PENDING.** Requires a published build, hosted validation/Pages and Manny's rendered desktop/mobile review.",
    f"5. **Live acceptance:** **COMPLETE.** Manny reported all supplied deployed Arc Hammers tests passed on {DATE}; PR #144 comment `{ACCEPTANCE_COMMENT}` records the product-owner evidence. No browser/device-specific result is inferred beyond that explicit report.",
)

replace_once(
    "docs/SLICE-5-ITEM-SYSTEM-DESIGN.md",
    f"Original procedural model/VFX/audio presentation and acceptance routes are implemented and deployed through PR #144 at `{GAMEPLAY_MERGE}`; hosted PR CI `{PR_CI}` and post-merge validation/Pages `{GAMEPLAY_POST}` passed. Keep the Arc Hammers functional checklist row open until Manny live acceptance is complete.",
    f"Original procedural model/VFX/audio presentation and acceptance routes are implemented, deployed, and **LIVE ACCEPTED** through PR #144 at `{GAMEPLAY_MERGE}`. Hosted PR CI `{PR_CI}` and post-merge validation/Pages `{GAMEPLAY_POST}` passed; Manny reported all deployed Hammer tests passed on {DATE}, recorded in PR #144 comment `{ACCEPTANCE_COMMENT}`.",
)
replace_once(
    "docs/SLICE-5-ITEM-SYSTEM-DESIGN.md",
    "- [ ] Arc Hammers provide five charges, enforce the 0.35-second cadence, bounce once after terrain impact, and expire.",
    "- [x] Arc Hammers provide five charges, enforce the 0.35-second cadence, bounce once after terrain impact, and expire.",
)

replace_once(
    "docs/TESTING.md",
    "## Slice 5 Kinetic Arc Hammers - deployed; live acceptance pending",
    "## Slice 5 Kinetic Arc Hammers - LIVE ACCEPTED",
)
replace_once(
    "docs/TESTING.md",
    "Primary deployed review route: `?testItem=arc-hammers`. Counter diagnostics: `?testItem=shockwave&testArcHammerCounter=shockwave`, `?testItem=prismatic-invincibility&testArcHammerCounter=prismatic&testArcHammerPhase=protected`, and the same Prismatic route with `testArcHammerPhase=expired`. A miss, rail interception, terrain/lifetime expiry, recovery discontinuity, or unsuitable geometry is INCONCLUSIVE rather than PASS. Product-owner rendered desktop/mobile acceptance remains pending and must be recorded separately.",
    f"Primary deployed review route: `?testItem=arc-hammers`. Counter diagnostics: `?testItem=shockwave&testArcHammerCounter=shockwave`, `?testItem=prismatic-invincibility&testArcHammerCounter=prismatic&testArcHammerPhase=protected`, and the same Prismatic route with `testArcHammerPhase=expired`. A miss, rail interception, terrain/lifetime expiry, recovery discontinuity, or unsuitable geometry remains INCONCLUSIVE rather than PASS. Manny completed the supplied deployed routes and reported **all tests pass** on {DATE}; PR #144 comment `{ACCEPTANCE_COMMENT}` records the product-owner evidence. Arc Hammers is LIVE ACCEPTED. No browser/device-specific result is inferred beyond that explicit report.",
)

# Sanity guard: no stale Hammer live-acceptance-pending wording should remain in the focused records.
for path in [
    "README.md",
    "docs/DECISIONS.md",
    "docs/IMPLEMENTATION-STATUS.md",
    "docs/SLICE-5-ARC-HAMMERS-SCOPE.md",
    "docs/SLICE-5-ITEM-SYSTEM-DESIGN.md",
    "docs/TESTING.md",
]:
    text = Path(path).read_text()
    assert "Warning: truncated output" not in text
