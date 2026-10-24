# R2.6 — Isolated 192k Opus Integration Preview

**Status:** Experimental, opt-in only. Production adoption is not approved.

**Source:** `main` at `5df72b270e231790f31121496a10cd58d71378f6`.

## Behavior and review

The ordinary application URL selects the existing WAV music. The exact query `?musicFormat=opus-192k` opts into the experimental Ogg/Opus files. Other application query parameters do not enable the experiment. If Opus fetch or decode fails, or its decoded duration differs beyond the existing production tolerance, that cue falls back to its original WAV. A request aborted because the cue was superseded, no longer retained, or the output disposed does not start a WAV request.

The isolated local review uses the app's normal Vite base path and production UI:

1. Check out `feat/music-opus-192k-preview-20261023` and run `npm ci`.
2. Run `npm run dev -- --host 127.0.0.1`.
3. Open `http://127.0.0.1:5173/manacondas-minigame-mayhem/?musicFormat=opus-192k` in Chromium and press **PRESS START** to unlock audio.
4. Choose **Circuit Alpha**, confirm a driver, and check the browser network panel for Opus requests under `assets/audio/music-opus-192k/` with no matching WAV request for those cues.
5. Repeat without the query string to exercise the unchanged WAV control.

This is a local HTTP review build, not a published preview. Browser and HTTPS transfer conclusions are recorded separately in the final R2.6 report; do not infer browser support from file encoding or a local renderer alone.

## Source and integrity

The five Ogg/Opus 192k VBR candidates are derived from the approved WAVs under source run `39999642793` and source commit above. `assets/audio/music-opus-192k/manifest.json` records file sizes, SHA-256 values, source WAV hashes, exact loop frame counts, encoder settings, and the R2.5 browser decoder evidence. `tools/verify-music-assets.mjs` verifies the approved WAVs and all experimental Opus hashes/provenance during the normal build. Originals are unchanged.

The candidates retain the measured R2.5 values: 48 kHz stereo decode, exact source sample-frame duration for all five cues, and the existing duration gate. No music composition, loop timing, crossfade, race-to-final-lap scheduling, pause behavior, gameplay, graphics, production default, Pages workflow, or Stage C setting is changed.

## Current evidence scope

Automated transport regressions cover Opus success without WAV transfer, HTTP/network fallback, corrupt decode, duration mismatch, intentional cancellation, rapid cue changes, exact loop boundary, and the unchanged WAV default. Existing `MusicDirector` tests remain in scope for route transitions and race cue behavior. Browser coverage and first-playable transfer totals are reported against what was actually available in the R2.6 execution environment.

The R2.5 standalone listening result is accepted as positive owner feedback. It does not authorize production replacement. Chrome/Edge/Firefox/Safari compatibility and a normal-TLS first-playable request waterfall remain separate evidence gates; unavailable environments must be identified, not treated as passes.

[`SHA256SUMS`](SHA256SUMS) pins the local 192k assets, the network result, and both browser captures.

## Integrated Chromium capture

The production build was exercised in Chromium 151.0.7922.173 on Debian 13 through the actual Title → Hub → driver selection → Circuit Alpha race flow. Both default WAV and the Opus opt-in reached the `GO!` state with a rendered race canvas. No page/console errors or failed requests were observed. The browser used SwiftShader software WebGL (the captured race HUD reported approximately 10 FPS / 100 ms per frame); this confirms app/audio integration and request behavior only, not playable performance or G-05.

| Cold local capture through `GO!`             |        WAV control |                  Opus opt-in |
| -------------------------------------------- | -----------------: | ---------------------------: |
| Completed requests                           |                248 |                          249 |
| Total completed response transfer            |      109,293,790 B |                 57,832,786 B |
| Music requests                               |         4 WAV cues | 4 Opus cues; no WAV fallback |
| Music transfer (CDP encoded bytes)           |       56,840,440 B |                  7,396,949 B |
| Cache/service worker                         | Disabled / blocked |           Disabled / blocked |
| Failed requests, console errors, page errors |          0 / 0 / 0 |                    0 / 0 / 0 |

The four first-playable music cues save **49,443,491 bytes (86.99%)** in this local capture. The all-response total differs by **51,461,004 bytes (47.09%)**, but the Opus run reached `GO!` 4.16 seconds later and had 2,017,513 fewer non-music bytes at the cutoff; that timing variance is not attributed to the codec.

The local endpoint served identity-encoded HTTP responses with no `Content-Encoding`; CDP `encodedDataLength` includes response-transfer overhead. These totals are **not** the official PRD shell/45 MB compressed HTTPS test. The Opus run's 57.83 MB raw first-playable response total is a risk signal that needs a normal-TLS production-origin capture; it is not recorded as a formal target failure. The source-pinned request list and method are in [`browser-network-results.json`](browser-network-results.json), and the matched game-state captures are in [`browser-captures/`](browser-captures/).

Only Chromium was available. Edge, Firefox, and Safari were not present in this Linux environment and are not marked passed. The capture did not finish a full race, so in-browser transitions through final lap and Results remain unverified here; the existing MusicDirector unit coverage verifies bar-aligned final-lap scheduling, crossfade, pause/resume, and Results selection. No production HTTPS preview was created.
