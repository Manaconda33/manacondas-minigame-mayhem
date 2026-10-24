
# R2.7 first-playable transfer evidence and acceptance disposition

**Disposition date:** 2026-10-24  
**Repository:** Manaconda33/manacondas-minigame-mayhem  
**Production source:** 45235d88cd65be528577db1d71b20ca5454ab979  
**Production Pages:** https://manaconda33.github.io/manacondas-minigame-mayhem/  
**CI and Pages run:** [40095290123](https://github.com/Manaconda33/manacondas-minigame-mayhem/actions/runs/40095290123)  
**Deployment job:** 120881359918

## Approved interpretation

Manny approved PRD governance amendment 2.30: the original 45 MB compressed first-playable download budget remains a historical and forward-looking optimization target. Exceeding it alone is not a v1 release blocker. Keep measured comparisons labeled FAIL against the target and give the release gate a separate non-blocking disposition; do not relabel the measurements PASS.

The 6 MB compressed app-shell target before the interactive Title is unchanged. Continue measuring actual compressed transfer. First-controllable-play loading time is a player-experience metric; this evidence contains no elapsed-load-time result, and no future threshold is established without separate owner approval.

## Source-pinned R2 results

The deployed production HTTPS site was captured with Chromium 151.0.7922.173 in fresh browser contexts with an empty browser cache. The shell endpoint was the interactive Title PRESS START control. First control was observed after selecting a track and driver, starting a race, waiting through countdown, pressing ArrowUp, and observing nonzero speed.

| Configuration | Shell body to interactive Title | Shell result against 6 MB | Additional encoded body through first control | Measurement against 45 MB | Release disposition |
|---|---:|---|---:|---|---|
| Circuit Alpha, WAV default | 366,537 B | PASS | 105,693,972 B | FAIL | Non-blocking |
| Circuit Alpha, Opus 192k opt-in | 723,921 B | PASS | 52,062,570 B | FAIL | Non-blocking |
| Neon Grid, WAV default | 848,641 B | PASS | 108,478,985 B | FAIL | Non-blocking |

The first-control cumulative encoded response bodies were 106,060,509 B (WAV/Circuit Alpha), 52,786,491 B (Opus/Circuit Alpha), and 109,327,626 B (WAV/Neon Grid). The four Opus music tracks in the captured Circuit Alpha run transferred 7,400,077 B versus 56,870,965 B for the four WAV tracks: a measured saving of **49,470,888 B**. Opus remains opt-in; WAV remains the ordinary default.

The measurement report preserves methodology, complete request URLs, status, encoded body and transfer counts, response encoding, browser-cache flags, asset-category totals, errors, raw JSON captures and reproduction scripts. All captured responses returned HTTP 200; no network failures or retries were recorded. Only Chromium was measured. The run does not establish other browser coverage, physical-device performance, G-05, or a first-control time value.

## Evidence archive integrity

The preserved R2 evidence package is r2-first-playable-transfer-evidence.zip. Its SHA-256 is:

0576a79d5f5e18660c0a0f8c462240d73fa3ef7ef8c1023776f5a703df08c06d

The archive's internal SHA256SUMS manifest verifies every report, JSON capture, script, summary, README, and request-evidence CSV in the package. The archive contents are kept unchanged from the reviewed evidence package. The archive is not the Pages deployment ZIP.

## Release-readiness ledger

| Criterion | Evidence status | v1 status |
|---|---|---|
| 6 MB compressed Title shell | PASS in all three R2 captures | Remains mandatory; satisfied by these measurements |
| 45 MB first-playable optimization target | FAIL in all three scenarios | Non-blocking by approved amendment; continue reporting |
| First-controllable loading time | UNMEASURED | Player-experience metric; no threshold yet |
| Browser-engine coverage beyond Chromium | UNMEASURED | Still required by existing browser/WebGL2 release checklist |
| Representative desktop G-05 and other specified performance evidence | UNMEASURED by R2 | Still required; no software-rendering inference |
| All other original PRD acceptance criteria | Not adjudicated by this transfer capture | Continue item-by-item §37 closure under the R2 checklist |

Prior owner gameplay acceptance remains accepted. This record does not reopen it. The amendment does not change any FPS, frame-time, rendering, browser-compatibility, or gameplay requirement. It does not change runtime code, music format default, assets, loading architecture, Pages packaging, CI policy, or Stage C. Stage C remains PREPARED_DISABLED.
