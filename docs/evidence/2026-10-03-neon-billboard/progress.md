# Task 6 — timing/traversal checkpoint (Steps 1–2)

Date: 2026-10-03 America/Chicago. Base: bc40809b84d793d1e0107de6878f8f43021a3e33 on design/neon-grid-circuit-02. Current plan is docs/superpowers/plans/2026-10-02-neon-grid.md Task 6; approved design input is docs/design/neon-grid/billboard-gap-design.md.

## Authorization and stop gate

Manny approved the five-step session plan, then required a visual-execution discussion after Step 2 and before Step 3. “OK, go for it” authorizes Steps 1–2 and saving their validated checkpoint. STOP here before hologram/character ads/plaza materials/flicker rendering/shards/zap/visual execution. No preview publication now. Runtime PR242 stays draft/open/unmerged. Production and accepted 92025b5 tunnel preview remain unchanged. Dive and Stage4 are not started. Task5 owner acceptance stays COMPLETE/PASS.

## Step 1: design/contract reconciliation

Approved geometry remains centerline entry0.1112341368367766–0.11623413683677661, rejoin0.17852464824355127, plaza half-width6m (layout.json, not the tunnel’s3.2m), straight chord at authored endpoint heights. Cycle6s/ON4/OFF2/tell0.8; state derived from authoritative race seconds. The newest approved design explicitly says speed retention0.82 once at exit for an ON crossing. Entry latches the state; OFF gives retention1. Controller treats static as asphalt cap/acceleration while traversal emits the explicit exit event. No off-road floor or per-frame compounding.

Ruling: use the newest approved once-at-exit semantics to reconcile earlier “while ON” surface wording — prevents continuous tax — cost if wrong: timing/feel requires a bounded correction before owner acceptance.
Ruling: physical mouth is7m along the chord, whose center projects inside the approved entry window. Entry tests use the forward geometric plane and lateral/height envelope, with direction toward the chord rather than main tangent. Do not reject legal signed lanes because their nearest main progress shifts slightly outside the centerline window — cost if wrong: entry feel needs a local correction, never a gate waiver.
Ruling: first-lap OFF phase tuning stays pending until representative player/pack and paired-route measurements. The final first-arrival.json has eight independent reference approaches,28.883–34.083s and both phases; this does not certify a real pack or player arrival. A two-second window cannot cover the entire range with one shift. Preserve6/4/2 and discuss/tune the representative discovery target later — cost if wrong: initial discovery timing needs review before preview acceptance.
Ruling: keep billboard AI default attempt rate0 during this partial checkpoint; fourth constructor parameter enables physical AI tests without silently rebalancing the accepted tunnel RNG/rate. Tunnel’s seeded stream is unchanged. Final joint usage rates remain measure-first — cost if wrong: ordinary AI will not choose Billboard until the later rate decision.

## Step 2: timing and physical traversal

Implemented pure billboardStateAt; native plaza floor (no hologram collider); per-racer independent entry/rejoin/reset; asphalt/static projection; shared stateless surface/navigation queries; racer-local navigation and Rocket continuity; configurable AI choice with independent RNG; raceTime wired to player and opponents; once-only planar exit retention even sideways/backward; tunnel/main/Alpha preserved.

No main floor/centerline/tunnel source or collider flags changed. Native plaza support exists but its render mesh, shared visible ground sampling and wall-aperture render changes are deliberately deferred to the visual discussion/Step3. Do not playtest or publish this incomplete render snapshot as visually complete. No owner/device/WebGL acceptance is inferred.

Validation covers pure cycle boundaries3.2/4.0/5.2/6.0; retained crossing state; reversal/reentry/reset; physical signed lanes; five main-sweeper lanes that must never enter; native support/disposal and no horizontal hologram collision; static cap/acceleration; player12/24/30m/s × lanes-3/0/+3 × ON/OFF; four available main/tunnel/billboard combinations,3 ordered laps; actual runtime clock/paused movement/recovery/disposal and forward/sideways/backward ON/OFF exits. Existing hidden-time freeze is covered by the full routing suite. All8 combinations including Dive remain a Task7 integration gate, since Dive has no native route yet; do not claim all8 runtime passes here.

Native three-lap test time budget360s is a bounded proof budget, not a gameplay lap target. With the deeper AI chord target needed for genuine chord-directed entry, the no-tunnel/with-billboard reference approaches are slower; paired savings and entry driving feel remain unaccepted. Do not infer the0.6–0.9s savings target or hide this by changing physics/stat/main geometry.

## Test-first and review evidence

Initial timing/static/ownership RED12/12, then GREEN12/12. Native support/static-cap/configured AI/gates RED7/7 before integration. Runtime RED showed missing authoritative OFF state and exit retention, then GREEN. Signed mouth+3 RED exposed invalid nearest-main-progress gating. Shared surface RED exposed absent chord query/navigation, then GREEN. Independent review caught3 inner main lanes entering accidentally: failing main-lane regressions reproduced it, then heading-directed entry fixed it. Independent review caught backward/sideways exit tax bypass: real runtime regression RED, then existing retainPlanarVelocity fixed it; six heading/phase cases GREEN.

Independent reviewer: two Important findings, both addressed with failing-first regressions; no Critical, additional Important, Minor or scope findings. Additional reviewer native probes24m/s lanes±4/±4.8 pass support/entry/once-only exit. No rereview or owner visual certification inferred.

Focused final:83 tests across3 files PASS before final full validation. Full validation and source hashes are archived alongside this ledger. Earlier failed logs are retained as evidence, never counted as current failures.

## Next

STOP for Manny’s requested visual-execution conversation. Agree the hologram/ad execution and any required character references/prompts before Step3. Later Step4 measures paired savings, normal/boosted entry behavior and representative first-lap phase/joint AI rates; owner readable tell/driving review gets a pinned Pages preview only after visual implementation and validation. No production release authority.

## Saved checkpoint / hosted verification

Runtime/source checkpoint: ee687a5225bf2ef14a2b799958aa7b7011e66f7c; parentbc40809; local/remote treec84b3c1e4bb7a619a00baf2e816bd62ce506e874 matched exactly. All25 source/evidence/governance blobs compared to local Git blob IDs; source-hashes and clean fetched checkout verified. Full validation119files/937tests/typecheck/lint/assets/build PASS; staged diff check and LFS fsck PASS. Hosted exact-runtime CI37168707541 SUCCESS; validate SUCCESS/deploy SKIPPED. Main28889be and pinned tunnel preview unchanged; PR242 stilldraft/open/unmerged. Final record adds docs only, source hashes/runtime unaffected. STOP beforeStep3.

## Step3 — visual approval and integration

Manny completed the requested discussion, individually approved three reference-guided sponsor artworks, confirmed PaprikaOFF and common16:9, then approved preparation/integration. Explicit subsequent normalGit/directupload instruction overrides LFS for the3exactpaths (ADR106). No reuse of earlier unapproved Paprika unclothedprompt or panoramicArin.

Ruling: Arin→Raven midpoint rotation is a normal ad switch, not a strong state-glitch warning — avoids teaching a falseOFFtransition; cost if wrong is adtransitionpolish. Ruling: instantiate billboard at the existingphysical7mmouth,12×6.75m — aligns visualandownership whilekeepingpostsoutsidecorridor; cost if wrong is sceneplacementreview.

Plaza shares exactnativefloor; inlay has no gameplayeffect. Render-wallopenings are opt-in forvisiblewalls only; floor/sharednativegeometry and acceptedtunnel unchanged. Three hidden/visiblematerials ownallads so standardresourcecleanup disposesalltextures. Preloading allthreeawaitssettlement, failurescleanupruntime rather than silentlyshowingblankads. Same race-timecycle ownsstate/tells/shards; crossing queueconsumedonceindependentlyofexitretention. Poolcaps8×12shards,0.55slifetime, noaudioscope.

Independent review found Important upstreammirroredcopy and hiddenclockgap; both reproducedRED→GREEN. Facingtest verifiesupstreamnormal; actualruntimehidden/resumetest dropshiddenintervalwithoutAlpha-timingchanges. Inactiveparticlefinite-matrixdefect caughtandfixedRED→GREEN. Evidence visual-facing-red.txt/visual-hidden-red.txt, visual-red.txt. No other Critical/Important/Minor findings reported.

Step4firstlapOFFphase, pack/playerarrival, pairedsaving/AIfeel/finaljoint rates remainPENDING. Dive/all8routes and Stage4 remaingated. Task5acceptedgameplay and PR242draft/unmerged preserved. Ownerpreviewreadability/device review remainsseparatefromartapproval.

Final Step3 local validation:120files/944tests,typecheck,zero-warninglint,allassetgates,build,diffcheck,LFSfsck PASS. Existing npmproxy and Vitelargechunk notices only. Assetnegativeprobe rejectsone-bitcorruption. Localbrowserrender unavailable: Chromiummissing anddownloadfailed; noWebGL/device/readabilityacceptance claimed. PinnedPagesdelivery andownerreview are next.


## Step 3 pinned review delivered

Runtime `30af146` passed hosted CI `37172064015`. Workflow-only preview PR #251 passed CI `37172303453` and merged at `b6fda352`; Pages run `37172445334` passed validation and deploy. All 22 delivered files matched recorded bytes/hashes, including all three normal Git ads and preserved production bundles. The isolated Billboard preview is live at https://manaconda33.github.io/manacondas-minigame-mayhem/previews/neon-grid-billboard/?review=30af146. The accepted tunnel preview remains pinned to `92025b5`. See `visual-delivery.md` and `visual-delivery.json` for exact provenance.

STOP for owner desktop/mobile visual and driving review. Step 4 first-lap phase, paired savings, AI approach feel and final rates remain pending. PR #242 remains draft/open/unmerged; no production gameplay, Dive or Stage 4 release. This final record reconciles the preview-only workflow without changing runtime source or approved assets.
