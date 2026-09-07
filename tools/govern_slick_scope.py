from pathlib import Path


def require_once(text: str, needle: str, label: str) -> None:
    count = text.count(needle)
    if count != 1:
        raise SystemExit(f"{label}: expected one anchor, found {count}: {needle[:120]!r}")


# Slick scope: convert proposal into approved, merge-gated governance.
scope = Path("docs/SLICE-5-SLICK-TRAP-SCOPE.md")
text = scope.read_text()
text = text.replace("# Slice 5 proposed next increment: Slick Trap", "# Slice 5 approved next increment: Slick Trap", 1)
text = text.replace(
    "**Status: PROPOSED / NOT YET AUTHORIZED FOR IMPLEMENTATION. Prepared for Manny review, 2026-09-07.**",
    "**Status: APPROVED FOR GOVERNANCE CHECKPOINT. Gameplay implementation remains gated on governance merge and post-merge CI/Pages. Approved by Manny, 2026-09-07.**",
    1,
)
baseline = "Baseline: `main` at `a2bd4e3a873bcd6a2b67789ebc06ac2c3ccfec76`. Nitro Surge, Ricochet Kinetic Disc, Homing Seeker Drone, Apex Orbital Missile core, and Timed Blast Orb are live accepted. The Timed Blast Orb checkpoint established the reusable `HazardSystem` and shared 40-object item-physics capacity. Slice 5 remains active; Slice 6 remains locked."
require_once(text, baseline, "Slick scope baseline")
text = text.replace(
    baseline,
    baseline + "\n\n**Approval record:** Manny explicitly approved this Slick Trap scope as written on 2026-09-07 and directed that the stale ADR-069 Blast Orb status be corrected in the same governance checkpoint. PRD working amendment 2.9 and ADR-070 record the approved Slick fill-ins.",
    1,
)
text = text.replace(
    "This proposal does not modify the PRD, gameplay code, item probabilities, balance values already approved for other items, racer statistics, track/checkpoint authority, assets, dependencies, AI tactics, or Slice 6 scope. Implementation requires a separate explicit Manny approval after review of the proposed fill-ins below.",
    "This approved scope does not modify gameplay code, item probabilities, balance values already approved for other items, racer statistics, track/checkpoint authority, assets, dependencies, AI tactics, or Slice 6 scope. The approved fill-ins below become implementation-authoritative only after this governance checkpoint merges and its post-merge CI/Pages gate passes.",
    1,
)
old_gate = "## Approval gate\n\nManny approval of this proposal would authorize a documentation governance checkpoint that records the Slick behavior as the next PRD working amendment / ADR and its test matrix. Gameplay implementation would begin only after that governance checkpoint is merged and its post-merge CI/Pages gate passes.\n\nAny requested change to the proposed 1.75 m drop offset, 0.35 s owner immunity, 0.85 s spin presentation, third-placement FIFO replacement rule, immunity semantics, fixture behavior, or other fill-in should be resolved before implementation authority is recorded.\n"
require_once(text, old_gate, "Slick scope approval gate")
text = text.replace(
    old_gate,
    "## Governance / implementation gate\n\nManny approved the complete scope as written on 2026-09-07. This document, PRD amendment 2.9, ADR-070, `docs/TESTING.md`, and `docs/IMPLEMENTATION-STATUS.md` form the governance checkpoint. Gameplay implementation may begin only after this checkpoint merges to `main` and its post-merge CI/Pages run passes. Publication/deployment of gameplay and live acceptance remain later separate gates.\n\nAny future change to the approved 1.75 m drop offset, 0.35 s owner immunity, 0.85 s spin presentation, 60% speed retention, third-placement FIFO replacement rule, immunity semantics, fixture behavior, or other governed fill-in requires the normal approval process before implementation tuning.\n",
    1,
)
scope.write_text(text)

# PRD: advance working amendment and add approved Slick contract after amendment 2.8.
prd = Path("docs/PRD.md")
text = prd.read_text()
require_once(text, "Version 1.1 - Final approved baseline; working implementation amendment 2.8", "PRD version")
text = text.replace(
    "Version 1.1 - Final approved baseline; working implementation amendment 2.8",
    "Version 1.1 - Final approved baseline; working implementation amendment 2.9",
    1,
)
heading = "## Approved implementation amendment 2.8"
start = text.find(heading)
if start < 0:
    raise SystemExit("PRD amendment 2.8 heading missing")
next_heading = text.find("\n## ", start + len(heading))
if next_heading < 0:
    next_heading = len(text)
if "## Approved implementation amendment 2.9 - Slick Trap hazard behavior" not in text:
    amendment = """

## Approved implementation amendment 2.9 - Slick Trap hazard behavior

Approved September 7, 2026 before Slick Trap gameplay implementation. The existing Slice 5 roster, rank probabilities, one-slot inventory, accepted Nitro/Kinetic/Seeker/Apex/Blast behavior, track/checkpoint authority, racer statistics, and Slice 6 lock remain unchanged. `docs/SLICE-5-SLICK-TRAP-SCOPE.md` and ADR-070 are normative for this bounded increment.

Slick Trap is one charge and extends the accepted `HazardSystem`. It is rear-only: either forward ITEM intent or Brake/Reverse + ITEM places one stationary Slick approximately **1.75 m behind** the kart at track elevation with no inherited planar velocity. Guardrail overlap receives only minimum inward penetration correction. Each active Slick consumes one slot from the accepted shared maximum of 40 active/reserved projectile + hazard objects; capacity failure preserves the held charge.

A Slick lives for **12 race seconds** and freezes under pause. The owner is immune for **0.35 race seconds** while other unfinished racers may trigger immediately. After arming, ordinary later owner self-trigger is legal. An unfinished, non-immune racer triggers at planar center distance **<= 1.1 m** with no closing-speed threshold. The Slick is removed before effect resolution so one placement resolves once. Generic item immunity suppresses the trigger/effect and leaves the Slick in place.

A valid trigger retains **60% of the racer's current planar velocity** without increasing near-stationary speed, applies one **360-degree yaw presentation over 0.85 race seconds**, suppresses player drive controls for that presentation, and reuses the accepted perspective-correct hostile-hit camera/driver-state boundary. Do not add the standard/heavy spinout momentum-decay curve, extra impulse, damage, or stacked yaw rate.

Each owner may have at most **two active Slicks**. A successful third deployment atomically retires that owner's oldest Slick and replaces it with the new placement; a failed new use preserves the held charge and both existing Slicks. The existing queued hazard-clear boundary applies generically to Slick and Blast Orb and resolves before Slick trigger processing in the same simulation step. Synthetic Shockwave evidence uses the existing approximately **5 m** clear radius; playable Shockwave remains deferred.

Targeted acceptance reuses `?testItem=slick-trap` and adds opt-in `?testSlickAhead=1`, which places one fixture-owned Slick approximately 8 m ahead after five race seconds without consuming AI inventory or enabling AI tactics/avoidance. AI avoidance for both Blast Orb and Slick remains deferred until Slick itself is live accepted, at which point the shared hazard-response increment is separately approval-gated. Gameplay implementation, publication/deployment, and live acceptance remain separate gates.
"""
    text = text[:next_heading] + amendment + text[next_heading:]
prd.write_text(text)

# Decision log: close stale ADR-069 status and add ADR-070.
decisions = Path("docs/DECISIONS.md")
text = decisions.read_text()
start = text.find("## ADR-069:")
if start < 0:
    raise SystemExit("ADR-069 missing")
end = text.find("\n## ", start + 4)
if end < 0:
    end = len(text)
section = text[start:end]
old_status = "- **Status:** Implemented and locally validated; gameplay publication/live acceptance pending"
require_once(section, old_status, "ADR-069 stale status")
section = section.replace(
    old_status,
    "- **Status:** Live accepted / closed for Timed Blast Orb and reusable HazardSystem foundation; playable Shockwave/Prismatic interaction acceptance deferred",
    1,
)
if "- **Live acceptance:** PR #117" not in section:
    section += "\n- **Live acceptance:** PR #117 squash-merged at `9efbceaf06db3ba6c32ec0147b85ad0673c2d1da`; post-merge CI/Pages run `34148220153` passed. Manny completed the deployed Blast Orb playtests and reported all checks pass on 2026-09-07. PR #118 then merged the durable acceptance record at `a2bd4e3a873bcd6a2b67789ebc06ac2c3ccfec76`; post-merge run `34149673641` passed validation and Pages deployment.\n"
text = text[:start] + section + text[end:]
if "## ADR-070: Approve bounded Slick Trap hazard behavior" not in text:
    text = text.rstrip() + """

## ADR-070: Approve bounded Slick Trap hazard behavior

- **Date:** 2026-09-07
- **Status:** Approved; gameplay implementation gated on governance merge and post-merge CI/Pages
- **Context:** Timed Blast Orb and the reusable `HazardSystem` foundation are live accepted. Slick Trap is the next bounded Slice 5 item and already has governed rear-drop, lifetime, trigger, spin/speed, owner-cap, and future Shockwave-clear requirements; remaining operational fill-ins required product-owner approval before implementation.
- **Decision:** Implement the complete approved behavior in `docs/SLICE-5-SLICK-TRAP-SCOPE.md` and PRD amendment 2.9: rear-only stationary 1.75 m drop; shared 40-object capacity; 0.35 s owner immunity; <=1.1 m unfinished/non-immune trigger; one-shot removal; 60% planar speed retention; one 360-degree yaw over 0.85 s with control suppression and accepted camera/driver-state presentation; two active per owner with successful-third FIFO replacement; 12 race-second pause-safe lifetime; generic immunity leaves the Slick in place; generic queued hazard clear resolves before triggers; and deterministic `?testSlickAhead=1` acceptance instrumentation.
- **Counter boundary:** Synthetic 5 m Shockwave clearing proves the reusable hazard interface only. Playable Shockwave, real Prismatic/Hyper-Drive interactions, and cross-item counter acceptance remain deferred.
- **AI boundary:** Do not implement AI hazard avoidance in this item increment. Once Slick is live accepted, Blast Orb + Slick avoidance should be implemented together in a separately approved shared AI hazard-response increment.
- **Preserved scope:** No probability, accepted-item tuning, racer stats, track/checkpoint geometry, character assets, issue #106 handling, or Slice 6 requirement changes.
- **Evidence gate:** Automated and deployed checks in `docs/TESTING.md` and `docs/SLICE-5-SLICK-TRAP-SCOPE.md` must pass before publication/live acceptance claims.
- **Approval:** Manny explicitly approved the complete Slick Trap scope as written on 2026-09-07 and directed the ADR-069 live-acceptance status correction in this governance checkpoint.
"""
decisions.write_text(text.rstrip() + "\n")

# Implementation status: advance baseline and record the gate.
status = Path("docs/IMPLEMENTATION-STATUS.md")
text = status.read_text()
require_once(text, "PRD baseline: **v1.1, working implementation amendment 2.8**.", "IMPLEMENTATION-STATUS PRD baseline")
text = text.replace(
    "PRD baseline: **v1.1, working implementation amendment 2.8**.",
    "PRD baseline: **v1.1, working implementation amendment 2.9**.",
    1,
)
old_current = "**Slice 5 - Item Boxes, Weapons & Position-Based Distribution - NITRO, KINETIC, SEEKER, APEX, AND BLAST ORB LIVE ACCEPTED**"
require_once(text, old_current, "IMPLEMENTATION-STATUS current slice")
text = text.replace(
    old_current,
    "**Slice 5 - Item Boxes, Weapons & Position-Based Distribution - NITRO, KINETIC, SEEKER, APEX, AND BLAST ORB LIVE ACCEPTED / SLICK SCOPE APPROVED, GOVERNANCE MERGE PENDING**",
    1,
)
marker = "## Slice 5 RacerEffects + Nitro Surge checkpoint"
if marker not in text:
    raise SystemExit("IMPLEMENTATION-STATUS insertion marker missing")
if "## Slice 5 Slick Trap scope approval" not in text:
    section = """## Slice 5 Slick Trap scope approval

Manny approved the complete bounded Slick Trap scope as written on 2026-09-07. PRD amendment 2.9 and ADR-070 govern rear-only stationary 1.75 m placement, shared 40-object capacity, 0.35 s owner immunity, <=1.1 m trigger, 60% planar speed retention, one 360-degree / 0.85-second presentation, two-per-owner FIFO replacement, 12 race-second pause-safe lifetime, generic immunity semantics, queued hazard-clear ordering, and the `?testSlickAhead=1` fixture.

This governance checkpoint also corrects ADR-069's stale pre-publication status: Timed Blast Orb and the reusable HazardSystem foundation are already live accepted through PR #117 / run `34148220153`, with durable acceptance merged in PR #118 at `a2bd4e3a873bcd6a2b67789ebc06ac2c3ccfec76` and run `34149673641`.

Gameplay implementation remains gated on merge of this governance checkpoint and its post-merge CI/Pages pass. AI Blast/Slick avoidance, playable Shockwave, real Prismatic/Hyper-Drive interactions, remaining Slice 5 items, issue #106, final soak/performance closure, and Slice 6 remain deferred.

"""
    text = text.replace(marker, section + marker, 1)
status.write_text(text)

# Item-system design points to the new governing amendment and records the bounded approval.
design = Path("docs/SLICE-5-ITEM-SYSTEM-DESIGN.md")
text = design.read_text()
require_once(text, "**Governing PRD:** v1.1, working implementation amendment 2.8.", "Slice 5 design PRD baseline")
text = text.replace(
    "**Governing PRD:** v1.1, working implementation amendment 2.8.",
    "**Governing PRD:** v1.1, working implementation amendment 2.9.",
    1,
)
marker = "# Slice 5 exit checklist"
if marker not in text:
    raise SystemExit("Slice 5 design exit-checklist marker missing")
if "## Slick Trap scope approval - approved 2026-09-07" not in text:
    section = """## Slick Trap scope approval - approved 2026-09-07

PRD amendment 2.9 / ADR-070 and `docs/SLICE-5-SLICK-TRAP-SCOPE.md` govern the next bounded Slick Trap item increment. The approved fill-ins are rear-only stationary 1.75 m placement, 0.35 s owner immunity, <=1.1 m trigger, 60% planar speed retention, one 360-degree / 0.85-second spin presentation, two active per owner with successful-third FIFO replacement, 12 race-second pause-safe lifetime, shared item-physics capacity, generic immunity that leaves the hazard in place, and generic queued hazard-clear ordering. `?testSlickAhead=1` is approved acceptance instrumentation. AI Blast/Slick avoidance remains a later shared increment after Slick live acceptance. The Slick functional checklist item remains unchecked until implementation, hosted validation, deployment, and Manny live acceptance prove it.

"""
    text = text.replace(marker, section + marker, 1)
design.write_text(text)

# Testing matrix for the approved scope.
testing = Path("docs/TESTING.md")
text = testing.read_text().rstrip()
if "## Slice 5 Slick Trap checkpoint" not in text:
    text += """

## Slice 5 Slick Trap checkpoint

Automated evidence for approved PRD amendment 2.9 / ADR-070 must confirm:

- rear-only deployment for both forward and backward ITEM intents, stationary approximately 1.75 m placement, zero inherited velocity, and guardrail inward containment without deletion or trigger;
- shared 40-object capacity, failed-use charge preservation, two-per-owner cap, successful-third FIFO oldest replacement, and atomic failure preserving both existing Slicks;
- exactly 12 race seconds of lifetime with pause freeze;
- 0.35-second owner immunity, immediate rival eligibility, legal later self-trigger, unfinished-racer filtering, and generic immunity suppressing the trigger while leaving the Slick in place;
- trigger boundaries immediately below/at/above 1.1 m and one-shot removal before effect resolution;
- exactly 60% planar speed retention without accidental speed gain or extra standard/heavy momentum decay, plus one 360-degree / 0.85-second hostile-spin presentation with control suppression and accepted chase/rear `hit` / `frontHit` behavior;
- no repeated-overlap effect or stacked yaw rates;
- queued synthetic 5 m Shockwave clear removing both Slick and Blast Orb before same-step hazard trigger/detonation processing;
- expiry, explicit removal, counter removal, restart, return-to-hub, and disposal returning hazard/capacity/VFX counts to baseline;
- `?testItem=slick-trap`, opt-in `?testSlickAhead=1`, visible test-mode indication, fixture restart reset, AI-inventory/tactics isolation, and normal-URL isolation; and
- accepted Nitro/Kinetic/Seeker/Apex/Blast behavior, probability-selector evidence, controller/camera/sprite, AI-race, and runtime-asset regressions remain passing.

Focused deployed desktop/mobile live gate:

1. Forced Slick pickup resolves correctly and successful use clears the one-slot inventory.
2. Normal ITEM and Brake/Reverse + ITEM both drop the Slick behind the kart; neither creates a forward throw.
3. The Slick remains fixed/readable, expires at approximately 12 race seconds, and freezes under pause.
4. Crossing the approximately 1.1 m trigger applies one readable 360 spin with roughly 60% carried speed and correct chase/rear driver art.
5. Immediate owner spawn overlap does not self-trigger; returning after 0.35 race seconds can trigger the owner's own Slick.
6. Two active Slicks coexist for one owner; a third successful placement replaces the oldest and never leaves three active.
7. `?testSlickAhead=1` presents a real victim-side Slick and restart removes/resets the fixture cleanly.
8. Normal unforced gameplay and accepted Blast/Nitro/Kinetic/Seeker/Apex behavior remain unchanged.

Record exact commit, hosted CI/Pages run, desktop/mobile results, defects, and Manny's acceptance in `docs/IMPLEMENTATION-STATUS.md`. Passing this checkpoint closes only the Slick functional gate proven by the deployed implementation. AI Blast/Slick avoidance, playable Shockwave, real Prismatic/Hyper-Drive interaction acceptance, remaining items, final Slice 5 soak/performance, and Slice 6 remain separate gates.
"""
testing.write_text(text.rstrip() + "\n")
