# SDD ledger — plan: docs/superpowers/plans/2026-10-02-neon-grid.md

2026-10-02 native execution selected by Manny: “I agree. Let's start.”

## Execution baseline

- Main inspected: d88c2d2e762775e12d2d1eb915a8f904c3c46e2f.
- Main runtime/Pages CI 37066390953: success at 168ba8113d37ad0672345a2326d20d279115c9d8; subsequent main commits are delivery/owner-confirmation documentation.
- Open PRs: none at inspection.
- Design branch task base: aa5c93f0e8f884790f8a083049a90116feaec351.

## Pre-flight

- Tasks 2–4 consume the same TrackDefinition/projection contract; route-specific collision and local width must travel with it.
- Tasks 5–7 consume per-racer traversal; Tasks 4/7 must integrate Rocket, recovery, gate elevation and actual item support surfaces.
- Tasks 8/10 consume Task 1 token/audio rules; token behavior is proposed for owner review, filenames are made unique.

## Task 1 — review artifact prepared; not yet complete

Refined shape, numeric geometry, exact checkpoint sites, boost/token anchors, BUILD-CONTRACT, and diagram prepared. Run: python build_layout.py → PASS assertions for length, ordered distinct gates, no skipped interval gate, higher rejoins, no unintended main-curve gate crossing at proposed width/height, and all eight geometric shortcut combinations tracing 1→11→0. No gameplay/TDD/physics/performance claim; these are design-only calculations.

Ruling: Native execution does not skip the plan's explicit Stage 1 owner contract review — prepare the concrete artifact and stop at that gate — cost if wrong: one review turn, rather than implementing an unreviewed course/token rule.

Ruling: Old oval-based feature progress is replaced by anchors on the refined course — fractions must agree with actual geometry — cost if wrong: adjust anchors during blockout, without changing race authority.

Ruling: Tunnel goes below street at y=-4 m between entry/exit ramps — a same-height straight chord intersects the switchbacks — cost if wrong: revise tunnel depth/headroom/collision detail in blockout.

Ruling: All-shortcut timing uses paired same-driver savings rather than an independent 57–60 s range — supplied timing ranges were inconsistent — cost if wrong: revise measured mastery target with Manny after the blockout.

Next: Manny reviews course shape and proposed five-per-lap race-local token rule. Then document approved PRD/decision changes, complete Task 1, and start shared-track Task 2. No runtime files changed.

## Owner shape correction — 2026-10-02

Manny: “The swichback isn't sharp enough at the bends,” with the original layout guide. Replaced gentle S-curves with clear alley straights and tight reversing bends. Tunnel now skips two actual hairpins. Dense length 1,450.001 m / 200-division estimate 1,448.938 m; regenerated all eight geometric path combinations and footprint checks PASS. Repositioned the common-road gates to the revised shortcut intervals. Shape/token acceptance remains pending.

Ruling: Preserve Manny's sharp-hairpin intent even though the tunnel's larger geometric saving may exceed the original time target — measure and revise the shortcut interval/target in blockout instead of silently weakening the bends or adding a speed limit — cost if wrong: bounded shortcut/balance revision after paired driving tests.
