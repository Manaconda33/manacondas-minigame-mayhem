# Billboard wall-aperture visual implementation

Date: 2026-10-04 America/Chicago

## Scope

Implemented the owner-approved entrance/exit visual correction from `portal-design.md`. Runtime checkpoint: `fe5e8e5adce928e3fe3e3a3453cafb0cc3f4bb81`. PR #242 remains draft/open/unmerged.

## Placement and presentation

Both portal centers are found by sampling the bypass centerline in 0.25 m increments in the entrance/exit junction windows, locating the inside-to-outside crossing of the main-road lateral boundary, then refining that distance with 32 bisection iterations. The entrance uses the first crossing within the opening window; the exit searches backward from the rejoin. Each portal is grounded to the shared bypass curve at that crossing.

The 8 × 4.5 m approved 16:9 sponsor art, existing Paprika OFF / Arin-Raven ON cycle, translucency, race-clock tell and bounded crossing-shard behavior are reused at both portals. Each display plane follows the local horizontal main-wall tangent and faces approaching shortcut racers. The crossing state, mouth distance, once-only ON retention, support geometry, controller, colliders, assets and tuning are unchanged.

## Verification

Exact runtime CI run `37211084198` passed:

- Typecheck.
- Zero-warning lint.
- 122 test files / 959 tests.
- Production build and existing runtime-asset validation.
- The new aperture-placement regression: both portal roots align to the main-road boundary within 0.12 m, are within 0.02 m of the supported bypass height, retain 16:9 art, and remain separate.
- The new display-orientation regression: each display faces the approaching route and aligns with the horizontal wall tangent.
- The updated frame-clearance regression: frame samples inside the ordinary main corridor must also lie in the actual supported junction opening.
- Existing native exit-motion probes, route/gate tests, and the main-road geometry bytehash regression all pass.

The test-only checkpoint first failed because the portal objects were absent. During implementation, CI exposed and guided correction of frame intrusion beyond the supported opening; the final full suite is green.

## Preservation and limits

No binary assets were changed or generated; no LFS operation occurred. Main-road and bypass support geometry, route/checkpoint gates, collision/controller behavior, clock/cycle, crossing retention, production files and accepted tunnel preview remain untouched. PR #242 is still draft/open/unmerged. No Task 6 Step 4, Dive or Stage 4 work started.

CI is automated evidence only. The live chase-camera presentation and owner visual acceptance are still pending. Preview publication and byte/hash verification are the next gates; after delivery, stop for Manny's focused entrance/exit visual retest. Production release remains unauthorized.


## Owner retest follow-up — 2026-10-04

Manny's retest found both panels still out of line with the wall openings and reported a sharp-looking height ramp near the shortcut exit. The crossing-only placement and linear side-edge grade did not meet the visual request.

Follow-up source changes are committed on `design/neon-grid-circuit-02` through `ca95a3b9f8f3ed6e3849f319c14797e620d2ab87`:

- The hologram center, width and wall direction are now derived from the two sampled ends of the actual open wall span, for both entrance and exit.
- The exit edge-height adjustment uses an eased transition.
- Regression checks compare each panel edge with the measured wall opening and check that the height blend eases at both ends.

This execution environment has no local repository checkout; Git clone failed because the network proxy is unavailable. GitHub currently reports no Actions runs or checks for the new head. Therefore none of the added tests, typecheck, lint or production build is claimed as passing. The existing preview remains pinned to `135eec2`; it has not been replaced. Next gate: run repository validation on the exact branch head, fix any failures, then update and verify only the isolated Billboard preview before Manny's focused visual retest. Production and accepted tunnel preview stay unchanged; PR #242 remains draft/open/unmerged.
