# Task 5 owner playtest — remaining wall junction issue

2026-10-03. Owner feedback on the delivered Service Tunnel preview pinned to `4367961d5e2471480d09ccee97cceb0223b258e0`:

> Wall entrance & mismatch at entrance & exit. Otherwise everything else a full pass.

Record the remaining issue as entrance/exit wall alignment. Record everything else in the owner-reviewed tunnel gameplay as PASS. Do not reopen those passed behaviors, infer specific device/lap counts or telemetry, or mark the complete Task 5 gate passed while wall junctions remain unresolved. The previously deferred wall presentation issue is now an owner-reported issue at both junctions and should be addressed before closing Task 5.

Read-only source inspection confirms separate junction definitions: tunnel render walls omit the first/last7m; tunnel traversal starts at7m; tunnel scripted containment opens the last9m; main wall mesh and boundary openings use `junctionContains` with9m and lateral/height bounds. This confirms the known7m/9m discrepancy and multiple aperture consumers. It does not yet establish the exact visual/contact failure the owner encountered at entrance, or prove that changing one number would repair both joins. A bounded correction must test both rendered apertures and physical containment at entry/rejoin, including before/after traversal activation, then preserve the existing passed driving and native support.

This checkpoint records feedback only. Runtime src/public, pinned preview and production are unchanged. Latest runtime validation remains116files/876tests plus exact hostedCI37148627462; Pages37148818476 and14-file delivery/refetch pass. No new runtime validation or fixed-wall claim is made. PR242 remains draft/unmerged; production release and Billboard/Dive/Stage4 remain gated.

Next: bounded entrance/exit wall-junction correction, focused regression/native checks, a validated replacement preview and owner retest of the two junctions. Preserve owner's pass for the remainder.

## Authorized bounded correction — 2026-10-03

Manny authorized correction/validation and a replacement pinned preview from ba76bb9. Validated repair and saved evidence: [junction/repair.md](junction/repair.md). Both junctions await focused owner retest; everything else remains fullPASS. This supersedes the feedback-only next-action entry above without claiming new owner acceptance. PR242 stays draft/unmerged; production/Billboard/Dive/Stage4 unchanged/gated.

## Replacement pinned preview delivered — 2026-10-03

Focused entrance/exit retest URL: https://manaconda33.github.io/manacondas-minigame-mayhem/previews/neon-grid-tunnel/?review=92025b5

Runtime92025b5 / exactCI37152562581SUCCESS. Preview-onlyPR250 merged28889be afterCI37159582801SUCCESS; Pages37159670060SUCCESS. All14delivery files match hosted/local hashes and fresh HTTP200/source refetch; production/accepted5.3 unchanged. See [junction/publication.json](junction/publication.json).

Owner acceptance for everything else stays fullPASS. New wall-junction owner acceptance remains PENDING. Retest entrance wall opening/join and exit wall rejoin/alignment only; report any regression if observed. No device/lap count or human balance measurement inferred. PR242 remains draft/unmerged. Stop before production/Billboard/Dive/Stage4.
