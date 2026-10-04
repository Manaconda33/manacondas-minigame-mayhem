# Approved Billboard relocation — implementation checkpoint

Date: 2026-10-04 UTC. Manny approved the concrete plan with “Yeah, let's go with this plan.” This supersedes the exploratory geometry below and the first preview's obstructive placement. Artwork approval and Task 5 acceptance remain intact.

The main curve, boost pads, sectors, accepted Service Tunnel and gates 4/5 are unchanged. The bypass enters at 0.101–0.106 and rejoins at 0.215, descending from y=14 m to about 6.8 m. It is an 8 m wide cubic curve with 18 m handles aligned to the main tangents. Length is 140.803 m versus 165.179 m on the main road, saving 24.376 m. Gate 2 is exactly 0.087, gate 3 exactly 0.222; downstream gate 4 is unchanged. Gate 2-to-entry is about 20.3 m, rejoin-to-gate 3 about 10.1 m, and gate 3-to-4 about 10.4 m. The approved plan explicitly accepts the shorter rejoin clearance; no mapped progress awards gates.

The physical mouth and billboard are 19 m along the curve. Artwork remains the approved 2048×1152 derivatives, displayed at 8×4.5 m. Full frame mesh vertices are more than 0.5 m outside the main horizontal corridor. It faces the actual upstream mouth tangent, with unchanged translucency, tell and bounded shards. Native and rendered floors share a 512-segment transverse mesh; inlay follows the curve.

## Engineering rulings

- The exploratory 12 m handles folded the inner 4 m offset near rejoin. A failing native edge regression reproduced this. Using 18 m tangent handles prevents the fold and preserves smooth joins, with reduced savings versus the prototype. This is a support correction, not hidden speed tuning.
- The softened curve requires the mouth at 19 m rather than the prototype's 14.5 m to keep the entire frame outside the main corridor. Mesh footprint regression validates this, while owner camera/readability review remains pending.
- Seeded AI may choose 5–35 m before entry, but steering begins only within 20 m. Immediate steering at 35 m clipped the unchanged main wall; the delayed approach has zero contacts in the measured cases. Commitment survives the small logical window through the physical mouth, cancels missed/reverse departure, and preserves the separate accepted tunnel RNG stream. Default Billboard attempt rate remains 0 pending joint balance review.
- Joined plaza support before ownership uses asphalt while retaining exact main progress and undefined pathId. A failing regression caught grass slowdown on physically paved support. Mouth crossing still selects ownership; support does not award shortcut progress or gates.
- The existing runtime exit-retention fixture assumed a horizontal curve tangent. The descending rejoin tangent's horizontal magnitude is about 0.979, so multiplying its x/z by 28 did not initialize 28 m/s. Normalizing the planar direction restores the known-speed fixture without weakening its six heading/phase assertions or changing controller behavior.

## Verification and measured limits

The real production NeonGrid/RacerTrack/AiDriver/KartController/native-collider diagnostic compares two profiles at 12/22/30 m/s from progress 0.07 to a common downstream plane at 0.236, with fixed OFF/ON entry states and unchanged settings. All 18 runs complete, cross physical gates [1,2,3,4] once in order and have zero wall contacts. Every bypass run enters/exits once. OFF saves 0.483–0.633 s; ON saves 0.450–0.600 s. The ON/OFF difference is only 0.033–0.050 s in these section measurements. See relocation-native.json; reproduce with `node tools/diagnostics/neon-billboard-relocation.mjs output.json`.

These are controlled section results with genuine route entry/choice, not a route adapter. They do not include live cycle arrival, pack/items, human steering, full-lap savings or balance acceptance. The 0.6–0.9 s target is not achieved in every tested condition; no stat/physics/boost/clock changes hide that. First-lap OFF discovery timing, readable ON/OFF advantage, final joint AI rates and desktop/mobile owner feel remain Step 4 work.

Regressions cover curved projection/open indexing, no folded offset edges, native floor support and exact joins, entire frame clearance, preownership paved surface, production AI entry/gates/savings, all four supported main/tunnel/Billboard combinations over three laps, and 18 physical player phase/speed/lane cases. Dive has no runtime implementation and no all-eight-route claim is made. Final full `npm run validate` passes:121files/953tests,typecheck,zero-warninglint,assets/build; `git diff --check` passes. Fresh independent review reports no Critical/Important findings; three Minor evidence issues addressed as recorded in relocation-code-review.md. Final diagnostic rejects incomplete pairs and repeats18successfulcases. No browser/WebGL/device claim. Runtime PR #242 stays draft/unmerged; production gameplay and accepted tunnel preview remain unchanged. No LFS operations are used.

The earlier exploratory review below remains historical evidence only.

---

# Billboard relocation — exploratory candidate, not runtime acceptance

Date: 2026-10-03 America/Chicago. Source runtime: `30af146`; delivery checkpoint: `cc8a800`. New remote checkpoint `30c8ff3` adds only the independent Task 7 design document; it does not change the runtime examined here.

## Owner feedback and scope

Manny's screenshot shows the billboard obscuring too much of the main road. He wants the entrance along the track wall and a more worthwhile shortcut. He explicitly requested thought before a solve, then aligned with comparing placements and developing the early-descent candidate. Artwork approval is preserved. Current placement and saving are not owner accepted. No production or replacement preview is published by this record.

## Findings

The exploratory straight chord from progress 0.101 to 0.215 bypasses 165.18 m with 135.65 m, but its abrupt turns produced wall contacts and a slower section in the throwaway physical probe. A cubic curve with tangent-aligned 12 m handles measures 138.34 m, saving 26.84 m. Its endpoints remain on the unchanged main curve: entry y=14 m, rejoin y≈6.8 m.

In 30 final segment runs, two driver profiles (aa-01 and aa-09), three initial speeds (12/22/30 m/s) and fixed OFF/ON outcomes were compared under the same unchanged KartController, Rapier and AiDriver. The candidate's OFF run saves 0.667–0.767 s versus its paired normal-route reference; ON saves 0.617–0.700 s. The current placement is 0.200–0.250 s slower than normal in the OFF probe. These are controlled section results, not full-lap or live-runtime savings. The prototype uses preselected route ownership, curved projection/support and experimental navigation in place of the live RacerTrack entry/choice logic. No items, pack interaction or player input is included.

All 30 final runs physically crossed proposed common-road gates 2/3 and accepted gate 4 in order [2,3,4], once each; all candidate runs entered and exited once. There were zero guardrail contacts, no observed fall through the support, and every run reached the common downstream section. This is not an exhaustive gate-footprint or route-combination proof.

## Candidate placement

- Entry anchor: progress 0.101; rejoin: 0.215. Main route, accepted tunnel and its gates 4/5 remain unchanged.
- Prototype curve: cubic Bezier, 12 m handles aligned to the main tangents at both anchors; 8 m driving width.
- Proposed billboard: 8×4.5 m, preserving the approved 16:9 ads. Frame outer width 8.3 m. At 14.5 m along the curve, the two outer frame endpoints have at least 0.66 m horizontal clearance beyond the main-road edge according to main projection. Actual mesh/camera visibility and the full frame footprint still need verification; no rendered visual pass is claimed.
- Gate 2 proposal: progress 0.087, about 20.3 m before entry; gate 3 proposal: 0.222, about 10.1 m after rejoin. Gate 4 remains 88/384. Gate 3-to-4 distance is about 10.4 m. This explicitly departs from the previous 18–25 m rejoin clearance. The segment probes cross both correctly, but unintended plane intersections, reverse approaches, multiplayer, complete laps and recovery still need live-runtime checks.

An earlier rejoin at 0.209 restores approximately 18.84 m to gate 3, with a 134.18 m curve replacing 156.49 m. In the aa-09 probe, that reduced OFF savings to 0.367–0.417 s. Longer handles at either rejoin lost additional distance/time advantage. See comparison JSONs; they are exploratory, not accepted geometry.

## Remaining work before a replacement preview

Integrate curved projection, support geometry and smooth route commitment without modifying controller/stats/main-road/tunnel behavior. Fit the wall-side billboard and verify its entire frame and normal racing lanes. Validate the changed gate 2/3 placements, all supported main/tunnel/Billboard path combinations and complete laps. Repeat paired savings using the real RacerTrack and player/AI approaches. The final section probe's ON/OFF difference is only 0.033–0.067 s, so meaningful ON/OFF balance is still unresolved; the approved once-only 0.82 retention remains unchanged. No hidden boost or progress award is proposed.

Keep PR #242 draft/unmerged and production unchanged. The existing preview remains pinned to `30af146`; this exploratory checkpoint does not replace it. Task 7 implementation is not part of this work.

## Reproduce

From the repository root:

```bash
node --input-type=module < docs/evidence/2026-10-03-neon-billboard/relocation-probe.fixture.txt
```

Writes `/tmp/billboard-relocation-probe.json`. The source probe is throwaway analysis code; do not treat its route adapter as production implementation. Earlier comparison evidence varies only the recorded curve/clearance settings and is retained separately. The complete runtime source and assets remain unchanged.

## Replacement preview publication — verified

Exact runtime1a1e3ad passed hostedCI37177729369. Workflow-onlyPR252/CI37177762356 merged19f617e; Pages37177890409 validation/deploy PASS. All22livefiles HTTP200/hash/bytes PASS;8Billboardfiles matchlocalbuild and14preservedfiles matchpreviousdelivery. Review: https://manaconda33.github.io/manacondas-minigame-mayhem/previews/neon-grid-billboard/?review=1a1e3ad . Full delivery provenance: relocation-delivery.md/json. Ownerreadability/drivingfeel and remainingTask6Step4gates arepending; PR242draft/unmerged andproductiongameplay unchanged.
