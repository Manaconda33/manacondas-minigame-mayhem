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
node --input-type=module < docs/evidence/2026-10-03-neon-billboard/relocation-probe.mjs
```

Writes `/tmp/billboard-relocation-probe.json`. The source probe is throwaway analysis code; do not treat its route adapter as production implementation. Earlier comparison evidence varies only the recorded curve/clearance settings and is retained separately. The complete runtime source and assets remain unchanged.
