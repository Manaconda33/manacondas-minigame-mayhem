from pathlib import Path


def replace_once(path: str, old: str, new: str) -> None:
    p = Path(path)
    text = p.read_text()
    count = text.count(old)
    if count != 1:
        raise SystemExit(f"{path}: expected one anchor, found {count}: {old[:100]!r}")
    p.write_text(text.replace(old, new, 1))


# PRD amendment 2.8.
replace_once(
    "docs/PRD.md",
    "Version 1.1 - Final approved baseline; working implementation amendment 2.7",
    "Version 1.1 - Final approved baseline; working implementation amendment 2.8",
)
prd = Path("docs/PRD.md")
text = prd.read_text()
amendment = """## Approved implementation amendment 2.8 - HazardSystem and Timed Blast Orb

Approved September 7, 2026. Manny approved the complete bounded `docs/SLICE-5-BLAST-ORB-SCOPE.md` proposal. Preserve section 15.6 and the approved Slice 5 item-system contract: Timed Blast Orb remains a one-charge forward/backward deployable hazard with an approximately 3.0-second fuse, 4.0 m horizontal blast radius, qualifying early direct-impact detonation, and the approved 1.20-second heavy explosive spinout. Normal rank probabilities remain unchanged.

The approved implementation establishes `HazardSystem` as the owner of Blast Orb state, movement, fuse, collision checks, detonation, rendering, counter removal, and cleanup. Item-physics capacity becomes one shared maximum of 40 active/reserved projectile + hazard objects; Kinetic Disc, Seeker Drone, Apex reservations, and Blast Orb each consume one slot for their active lifecycle, and a full-capacity activation must preserve the held charge. Forward deployment spawns approximately 1.75 m ahead at 14 m/s base planar speed plus 0.35x inherited planar owner velocity capped at 12 m/s. Backward deployment spawns approximately 1.75 m behind with 0.20x inherited planar owner velocity capped at 12 m/s. Both use deterministic 6 m/s² planar drag. Guardrails contain the ground-bound orb and remove outward velocity without detonating it.

Owner immunity lasts 0.35 s. Other racers may trigger a qualifying early detonation during that window, but the owner is excluded from that blast until immunity expires; later armed self-hit/self-blast is legal. Direct racer contact triggers early detonation only at at least 8 m/s planar relative closing speed. Fuse time is race-simulation time and freezes under pause. On each simulation step, queued Shockwave-clear queries resolve before movement/contact and fuse detonation. Blast resolution reuses the generic horizontal area-effect/immunity boundary, applies no extra impulse/damage/speed multiplier, and affects each eligible unfinished racer at most once.

The reusable hazard counter boundary may remove Blast Orbs within the approved 5 m Shockwave radius, but playable Shockwave and real cross-item counter acceptance remain deferred. AI Blast-Orb/Slick avoidance is also deferred until both shared hazard classes exist. The marked incoming Blast Orb fixture is opt-in and must not consume AI inventory or alter normal item distribution. Issue #106, Slick, Prismatic, general AI item tactics, accepted Nitro/Kinetic/Seeker/Apex behavior, racer stats, track/checkpoint authority, character assets, and Slice 6 remain unchanged/deferred.

"""
if "## Approved implementation amendment 2.8 - HazardSystem and Timed Blast Orb" not in text:
    anchor = "# Contents\n"
    if text.count(anchor) != 1:
        raise SystemExit("PRD Contents anchor missing/ambiguous")
    prd.write_text(text.replace(anchor, amendment + anchor, 1))

# Approved scope language.
for old, new in [
    (
        "**Status: PROPOSED FOR MANNY REVIEW — NOT YET AUTHORIZED FOR IMPLEMENTATION.**",
        "**Status: APPROVED FOR IMPLEMENTATION by Manny, 2026-09-07. Governance publication/merge and gameplay implementation remain separate gates.**",
    ),
    (
        "PRD v1.1 working amendment 2.7 and `docs/SLICE-5-ITEM-SYSTEM-DESIGN.md` remain authoritative.",
        "PRD v1.1 working amendment 2.8 / ADR-069 and `docs/SLICE-5-ITEM-SYSTEM-DESIGN.md` govern this approved increment.",
    ),
    ("## Proposed implementation fill-ins requiring Manny approval", "## Approved implementation fill-ins"),
    ("| Choice | Proposed initial behavior |", "| Choice | Approved initial behavior |"),
    (
        "These are initial implementation values, not silent balance changes. Any material adjustment after live evidence returns for Manny approval before publication.",
        "Manny approved all values and behaviors above on 2026-09-07. PRD amendment 2.8 / ADR-069 record implementation authority. Any material adjustment after live evidence returns for Manny approval before publication.",
    ),
    ("## Test fixture proposal", "## Approved test fixture"),
    ("## Proposed live acceptance gate after deployment", "## Approved live acceptance gate after deployment"),
]:
    replace_once("docs/SLICE-5-BLAST-ORB-SCOPE.md", old, new)

replace_once(
    "docs/SLICE-5-ITEM-SYSTEM-DESIGN.md",
    "**Governing PRD:** v1.1, working implementation amendment 2.7.",
    "**Governing PRD:** v1.1, working implementation amendment 2.8.",
)

# ADR-069.
decisions = Path("docs/DECISIONS.md")
text = decisions.read_text()
adr = """

## ADR-069: Establish shared HazardSystem capacity and approved Timed Blast Orb behavior

- **Date:** 2026-09-07
- **Status:** Approved for implementation
- **Context:** After Apex core live acceptance and completion of the seeded distribution gate, Slice 5 still lacks the approved hazard runtime. The PRD already requires Timed Blast Orb and Slick to be owned by `HazardSystem`, while Shockwave must later clear supported hazards. Implementing Blast Orb first establishes that reusable boundary without prematurely implementing Shockwave or duplicating hazard architecture.
- **Decision:** Implement `HazardSystem` as the owner of Blast Orb lifecycle and use one shared maximum of 40 active/reserved projectile + hazard objects. Blast Orb uses the approved 3.0 s fuse, 4.0 m AoE, 1.20 s heavy spin, 0.35 s owner immunity, 8 m/s early-impact threshold, forward 14 m/s toss with 0.35x inherited planar velocity capped at 12 m/s, backward drop with 0.20x inherited planar velocity capped at 12 m/s, and 6 m/s² planar drag. Guardrails contain rather than detonate the orb. Generic immunity and a pre-detonation hazard-clear query are reused; synthetic Shockwave tests use the approved 5 m pulse radius.
- **Ordering:** Queued hazard-clear/counter queries resolve before Blast Orb movement/contact/fuse detonation for the simulation step so a successfully cleared orb cannot detonate later in that same step.
- **Capacity:** Kinetic, Seeker, Apex reservations, and hazards share the 40-object budget. Full-capacity activation rejects without consuming inventory. This replaces projectile-only counting as the Slice 5 item-physics capacity contract; it does not change any accepted projectile behavior.
- **Deferred:** Playable Shockwave and real cross-item counter acceptance; Slick; AI avoidance for Blast/Slick; general AI item tactics; Prismatic; issue #106; Slice 6.
- **Evidence gate:** Clean validation must cover directional deployment, threshold boundaries, fuse/pause, area immunity, shared capacity, same-step counter ordering, restart/disposal cleanup, fixture isolation, and all accepted Nitro/Kinetic/Seeker/Apex regressions. Desktop/mobile deployed acceptance remains separate.
- **Approval:** Manny approved the complete `docs/SLICE-5-BLAST-ORB-SCOPE.md` proposal on 2026-09-07. PRD amendment 2.8 governs the approved product fill-ins.
"""
if "## ADR-069:" not in text:
    decisions.write_text(text.rstrip() + adr.rstrip() + "\n")

# Implementation status.
replace_once(
    "docs/IMPLEMENTATION-STATUS.md",
    "PRD baseline: **v1.1, working implementation amendment 2.7**.",
    "PRD baseline: **v1.1, working implementation amendment 2.8**.",
)
replace_once(
    "docs/IMPLEMENTATION-STATUS.md",
    "**Approval gate:** Apex core is live accepted. The next bounded Slice 5 gameplay increment requires its own scope review and Manny approval before implementation. Real Shockwave/Prismatic interactions, issue #106, and Slice 6 remain later/deferred gates.",
    "**Approval gate:** Manny approved **HazardSystem + Timed Blast Orb** on 2026-09-07 under `docs/SLICE-5-BLAST-ORB-SCOPE.md`, PRD amendment 2.8, and ADR-069. Merge of the governance checkpoint remains required before gameplay implementation begins. Gameplay publication/deployment and live acceptance remain separate gates. Real Shockwave/Prismatic interactions, AI Blast/Slick avoidance, issue #106, and Slice 6 remain later/deferred gates.",
)
status = Path("docs/IMPLEMENTATION-STATUS.md")
text = status.read_text()
block = """## Slice 5 HazardSystem + Timed Blast Orb scope approval

Manny approved the complete bounded Blast Orb proposal on 2026-09-07. The governed implementation is recorded in `docs/SLICE-5-BLAST-ORB-SCOPE.md`, PRD amendment 2.8, and ADR-069. The increment establishes the approved `HazardSystem`, shared 40-object projectile/hazard capacity, directional toss/drop behavior, 0.35-second owner immunity, 8 m/s qualifying early-impact threshold, 3.0-second fuse, 4.0 m AoE, 1.20-second heavy spin, generic immunity, and the synthetic 5 m Shockwave-clear boundary.

This approval does **not** mark Blast Orb implemented or accepted. Governance merge is the next checkpoint. After that, implementation must pass clean local/hosted validation, deployment, and Manny's focused desktop/mobile live gate before the Blast Orb functional checklist item may close. Playable Shockwave, real counter acceptance, Slick, AI hazard avoidance, issue #106, and Slice 6 remain deferred.

"""
anchor = "## Slice 5 RacerEffects + Nitro Surge checkpoint\n"
if "## Slice 5 HazardSystem + Timed Blast Orb scope approval" not in text:
    if text.count(anchor) != 1:
        raise SystemExit("Implementation status anchor missing/ambiguous")
    status.write_text(text.replace(anchor, block + anchor, 1))

# Testing contract.
testing = Path("docs/TESTING.md")
text = testing.read_text()
block = """## Slice 5 HazardSystem + Timed Blast Orb checkpoint

Automated evidence for the approved PRD amendment 2.8 / ADR-069 increment must confirm:

- one shared maximum of 40 active/reserved projectile + hazard objects, with full-capacity rejection preserving the held charge;
- forward spawn approximately 1.75 m ahead at 14 m/s plus 0.35x inherited planar owner velocity capped at 12 m/s, and backward spawn approximately 1.75 m behind with 0.20x inherited planar velocity capped at 12 m/s;
- deterministic 6 m/s² planar drag and guardrail containment without rail-triggered detonation;
- exactly 3.0 race seconds of fuse time, frozen by pause;
- 0.35-second owner immunity, with other racers still eligible to trigger a qualifying early detonation and legal later owner self-hit/self-blast;
- early direct-impact detonation immediately below/at/above the 8 m/s planar relative-closing threshold;
- one-shot 4.0 m horizontal AoE, finished-racer exclusion, per-racer generic immunity, collateral/owner handling, and 1.20-second heavy spin without repeated overlap damage;
- queued synthetic 5 m Shockwave-clear queries resolving before Blast Orb movement/contact/fuse detonation in the same simulation step;
- restart, explicit removal, counter removal, detonation, and disposal returning hazard/item-physics counts and procedural resources to baseline;
- `?testItem=blast-orb` and opt-in `?testBlastOrbIncoming=1` isolation from normal distribution and AI inventory/tactics; and
- existing Nitro, Kinetic, Seeker, Apex, controller/camera/sprite, AI-race, probability, and runtime-asset regressions remain passing.

Focused deployed desktop/mobile live gate:

1. Forced Blast Orb pickup resolves correctly and successful ITEM use clears the one-slot inventory.
2. Forward use produces the approved short-range moving toss; backward modifier produces the slower drop.
3. Fuse visibly resolves at approximately three race seconds and freezes while paused.
4. A qualifying direct kart impact detonates early while light brush contact does not.
5. Blast radius/collateral behavior reads as approximately 4 m and applies the accepted 1.20-second heavy spin/chase/rear presentation.
6. Owner immunity prevents immediate self-hit while a later armed self-hit remains possible.
7. Incoming fixture presents a real Blast Orb and cleans up on restart without enabling AI tactics.
8. Normal unforced URL and accepted Nitro/Kinetic/Seeker/Apex behavior remain unchanged.

Record exact commit, CI/Pages run, desktop/mobile results, defects, and Manny's acceptance in `docs/IMPLEMENTATION-STATUS.md`. Passing this checkpoint closes only proven Blast Orb/hazard-foundation gates; it does not approve playable Shockwave, AI hazard avoidance, remaining items, or Slice 5 completion.

"""
anchor = "## Slice 4 AI/grid manual matrix\n"
if "## Slice 5 HazardSystem + Timed Blast Orb checkpoint" not in text:
    if text.count(anchor) != 1:
        raise SystemExit("Testing anchor missing/ambiguous")
    testing.write_text(text.replace(anchor, block + anchor, 1))

# Normalize one trailing newline on every touched file.
for path in [
    "docs/PRD.md",
    "docs/SLICE-5-BLAST-ORB-SCOPE.md",
    "docs/SLICE-5-ITEM-SYSTEM-DESIGN.md",
    "docs/DECISIONS.md",
    "docs/IMPLEMENTATION-STATUS.md",
    "docs/TESTING.md",
]:
    p = Path(path)
    p.write_text(p.read_text().rstrip() + "\n")
