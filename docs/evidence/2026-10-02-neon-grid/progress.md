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


## Tasks 2–4 main-route runtime checkpoint — 2026-10-02

Task 2 shared contract and Alpha adapter implemented; Task 3 approved main ribbon/colliders, local width and elevation-gated crossings implemented. Task 4 selected-route launch, seven unique opponents, minimap, HUD/Results labels, replay/restart state, route-local support/item boxes, recovery and cleanup implemented. Task 4 remains at its owner preview gate; broad rendered/lifecycle acceptance is not closed. No shortcuts/tokens/new audio/city polish implemented.

Final native validation: 108 files / 831 tests pass, TypeScript passes, ESLint zero warnings, 42 GLBs and 163 PNGs validate, production build passes. git diff --check and git lfs fsck pass. Full command transcript: blockout-validation.txt. Review findings/resolution and exact evidence limits: blockout-review.md.

Ruling: Commit Tasks 2–4 as one coherent runtime checkpoint — the catalog consumes Neon factories and route-dependent systems together; avoid publishing a broken intermediate adapter — cost if wrong: reviewers use the focused tests and plan sections to review boundaries.

Ruling: Tight ribbon inside offsets fold at the climbing bend; remove inverted road triangles and internal folded wall faces, then enable Rapier internal-edge correction. This preserves approved centerline/width intent and removes artificial collision obstacles; all eight profiles now drive three laps without recovery. Owner visual inspection of the inside ribbon remains pending.

Ruling: Ordinary Neon projectiles follow actual local road support per travel substep, rather than retaining flat launch Y. Alpha motion and accepted item values/counter authority remain unchanged. Climb/descent tests fail before the fix and pass afterward.

Published design/Task 1 checkpoint: badf0512e2838076c87774cf2768fe06a135e419, tree identical to local documentation checkpoint. Native shell lacks Git push credentials; authenticated connector publishes matching Git blobs/trees and branch refs. No LFS bytes changed.

Next: publish runtime draft PR, require hosted CI, then separate workflow-only pinned Pages preview using the established preview delivery pattern. Production runtime PR remains unmerged. Stop for Manny's main-route visual review before Stage 3.


### First pinned delivery and browser label correction

Runtime d6acf3c32e9d60fa4b8fc58a8eab0be3065a7e2e published in draft PR #242; exact-head CI 37076697788 passed. Workflow-only PR #243 (405e88de4a233c65ebe796d57466a0ac2365dfbc) passed CI 37076815912 and merged with expected-head lock at 50ac94d5b0882449f7eec9edb3912d8c5a528f68. Pages 37077018302 passed. First preview source marker and all four preview/four production index/JS/CSS hashes matched locally validated builds; preview-v1-delivery.json preserves evidence. No production runtime files changed.

Live browser reached Hub → DRIVE NEON GRID → driver selection. It exposed one missed hardcoded Alpha header; regression failed with the observed Alpha text, then fixed by a selected-circuit label argument while preserving the Alpha default. Preview is being repinned to that correction. Rendered driving still blocked by cloud WebGL unavailable. AI independent-world timing: 24 laps, 129.517–138.783 s (mean134.265 s); clean-player target remains unverified, balance open. Exact observations in ai-lap-times.txt.

Design branch reconciles the workflow-only main merge without changing runtime geometry/gameplay; branch publication continues through authenticated GitHub tree/commit APIs with local/remote tree identity checked.

### Stage 2 owner review handoff

Label correction runtime 1b99df944381827cb927a21cf679b37be849aefb passed exact-head CI 37077662262. Workflow-only repin PR #244 passed CI 37077696838 and merged at 8f1dd9840702842cd04a806a88c9168ea9ce54b0. Pages run 37077846211 validation/deployment succeeded. Live marker and index/JS/CSS hashes match the pinned locally built preview; preview-v2-delivery.json records checks. Production runtime remains unchanged; draft runtime PR #242 stays unmerged.

Playable review: https://manaconda33.github.io/manacondas-minigame-mayhem/previews/neon-grid/?review=1b99df9 — choose DRIVE NEON GRID, then a driver. Stop here for Manny's Stage 2 visual/driving review. Tasks 5–10 remain pending. Timing/balance and rendered driving evidence remain open as detailed in blockout-review.md; AI independent-world laps are approximately 130–139 seconds and do not validate the 62–68-second clean-player target.
