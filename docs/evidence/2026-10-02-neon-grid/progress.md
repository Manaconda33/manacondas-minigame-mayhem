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

## Full bypass correction — 2026-10-02

Manny directed bypassing all fuchsia hairpins. Tunnel entry now starts at the Undercity boundary before the first hairpin and rejoins after the last on the Falls Run boundary. Gates 4/5 moved to common road around the complete interval. All eight geometric route traces and footprint assertions pass; runtime remains pending.

Ruling: The owner-directed full bypass supersedes the old 1.0–1.4 s tunnel target and fixed aggregate-saving range — keep every fuchsia hairpin bypassed and measure its advantage in blockout — cost if wrong: owner-reviewed balance adjustment, without quietly reducing bypass scope.

## Owner approval and saved checkpoint — 2026-10-02

Manny: “OK, approved. Let's load up the branch with our work so far so we don't lose it.” The corrected sharp-hairpin layout and service tunnel bypass of the entire fuchsia Undercity are approved. This approval follows layout commit 15c6a44dc1db57a507fa739114fac459abdd42b8.

Spec, width-profile/static-surface/shortcut contracts, implementation plan, original visual references and HTML builder guide, generated geometry/diagrams, generator, and validation evidence are saved on design/neon-grid-circuit-02. The supplied original sharp-hairpin layout image is also preserved as original-hairpin-layout-reference.jpg.

Remaining review item: the proposed optional five-per-lap race-local token rule has not been explicitly approved. Course shape approval is complete; runtime implementation and driving/performance verification remain pending. No production merge or deployment is included in this checkpoint.

## Task 1 final owner decision — 2026-10-02

Manny: “Let's omit the tokens.” No token pickups/counter/reward/audio are authorized. Course shape approval remains closed. Unique audio filenames and paired-run timing contracts are resolved by BUILD-CONTRACT. Task 8 is limited to representative scene polish. PRD/ADR-104 and testing scope reflect the reviewed contract.

Pre-flight: Tasks 2–4 share TrackDefinition, local width, route factories and elevation-aware checkpoint crossings. Tasks 5–7 add per-racer path ownership and physical gate crossings without replacing lap authority. Tasks 8–10 consume route scene/lifecycle/audio and exclude tokens. No unresolved interface conflict identified.

Ruling: Work in the fresh, dedicated design-branch clone — it already isolates this session from production and other workspaces — cost if wrong: move the checkout without any shared-history rewrite.

Task 1: complete — owner omitted tokens; regenerated geometry passes; PRD Markdown and Word amendment updated and rendered page 53 inspected. Full validation after shared-contract/main-road scaffolding passed; exact counts in task evidence. Production unchanged.
