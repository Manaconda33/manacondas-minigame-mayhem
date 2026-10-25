# R2.12 — G-05 v1 owner acceptance by exception

**Capture date:** 2026-10-25

**Source commit recorded in both exports:** `12e996ff5b77b3cbfdd5973aabae75f7ca89fa70`

**Owner disposition:** **OWNER ACCEPTED BY EXCEPTION** for the v1 release gate. This is not an unconditional technical PASS or formal v1 release sign-off.

## Preserved source package

The two original JSON exports, their original checksum list, and the verification notes are preserved byte-for-byte inside the compact owner-uploaded ZIP in [`source/`](source/). Its SHA-256 is `79b4da3c7ea17e781691e6603f5d8abc0cdba6c7873cf33e8dfb325727e2ed1f`. The archive is 362,428 bytes; storing the compressed original avoids duplicating the 13 MB of expanded JSON in the repository. Root [`SHA256SUMS`](SHA256SUMS) verifies the archive, while [`CAPTURE-SHA256SUMS`](CAPTURE-SHA256SUMS) lists the original JSON hashes and matches the archive's internal manifest.

| Original capture                                 | Captured at (UTC)       | SHA-256                                                            |
| ------------------------------------------------ | ----------------------- | ------------------------------------------------------------------ |
| `race-performance-2026-10-25T17-40-43.767Z.json` | 2026-10-25 17:40:43.767 | `99316f4e2ba3bf11030051d147cbbf7a1ffc6a40d784adb5a974306910beaf16` |
| `race-performance-2026-10-25T17-41-36.743Z.json` | 2026-10-25 17:41:36.743 | `8aa74cc2f574a371562b23ecd30ac7665ab53a1ce136406961b5db90c9f24388` |

## Reproducible verification

From the repository root on Linux, macOS, or WSL with `sha256sum` and `unzip` installed:

```sh
evidence=docs/evidence/2026-10-25-r2-12-g05-owner-acceptance
(cd "$evidence" && sha256sum -c SHA256SUMS)
unzip -t "$evidence/source/r2-12-g05-original-captures-2026-10-25.zip"
temporary_directory="$(mktemp -d)"
unzip -q "$evidence/source/r2-12-g05-original-captures-2026-10-25.zip" -d "$temporary_directory"
cmp "$temporary_directory/SHA256SUMS" "$evidence/CAPTURE-SHA256SUMS"
(cd "$temporary_directory" && sha256sum -c SHA256SUMS)
rm -rf "$temporary_directory"
```

The top-level checksum manifest verifies the exact owner-uploaded ZIP. `unzip -t` checks archive integrity, `cmp` verifies that the separately readable capture manifest is identical to the original embedded manifest, and `sha256sum -c` verifies both extracted JSON files without modifying them.

## Capture identity and relationship

Both exports record source commit `12e996ff5b77b3cbfdd5973aabae75f7ca89fa70`, track `neon-grid`, Medium quality, a 1920×911 actual drawing buffer, eight racers (one player plus seven AI), and a completed three-lap race. They were captured 52.976 seconds apart but are **two exports of one race, not two separate race runs**. Both contain 9,630 scored frames; their frame-sample arrays and race summaries are identical. The per-export `metadata.jsHeapBytes` fields differ (122,791,795 and 103,536,966); these values came from nonstandard `performance.memory.usedJSHeapSize`, are whole-page estimates, and are not race-allocation or GPU-memory measurements.

The user agent identifies Windows / Chrome 156. The renderer string is `ANGLE (AMD, AMD Radeon (TM) Graphics (0x000015E7) Direct3D11 vs_5_0 ps_5_0, D3D11)`. The exports classify physical-device identity as unknown; no hardware certification is inferred from that renderer string.

## Results and protocol deviations

| Metric                              |                                                  Both exports |
| ----------------------------------- | ------------------------------------------------------------: |
| Median FPS                          |           59.8802395210207 (59.8802 rounded; below 60 target) |
| p95 frame time                      | 16.79999999998836 ms (16.8 ms rounded; within 18.3 ms target) |
| Longest consecutive run above 50 ms |                                                      2 frames |
| Frames above 50 ms                  |                                                            10 |
| Peak draw calls                     |                                                           486 |
| Peak triangles                      |                                                       348,923 |
| Scored frames                       |                                  9,630; capture not truncated |
| Maximum frame                       |                                                      1,199 ms |

The original G-05 capture protocol deviations remain explicit: median FPS is slightly below 60, the captured course is Neon Grid rather than the prescribed Circuit Alpha default, and the drawing buffer is 1920×911 rather than 1920×1080. The p95 and longest >50 ms run meet their original numeric criteria. Peak draw calls are within the 500-call cap; peak triangles are below the global 750,000 visible-triangle cap. The Task 9 425,000 engineering-triangle threshold remains separately scoped.

The **1,199 ms** frame occurs at zero-based `samples[9527]`, i.e. one-based sample **9,528**, in both exports. Its recorded counters are 395 draw calls and 336,899 triangles. It remains an observed outlier and is not hidden by median or p95 reporting.

The captures also record initialization snapshots: first render at 188 draw calls / 222,311 triangles with 4 of 7 AI kart assets loaded and 3 pending; after those assets settled, 204 draw calls / 287,443 triangles with all 7 loaded and no fallbacks. These initialization snapshots are separate from the scored race trace.

## Unmeasured fields and limits

The exports mark GPU frame timing, GPU processing cost, true GPU texture bytes, estimated texture bytes, dynamic shadow counts/objects, gameplay-particle count, distinct object count, unique mesh geometry, and physical device identity unavailable. The `itemVfx` meter is disabled, so its subsystem timing is unmeasured. The exports do not establish §2.6 subsystem budgets that are absent from their recorded fields; no unavailable value is inferred as zero or pass.

## Owner disposition and remaining release evidence

Manny explicitly accepts G-05 as satisfying the v1 release gate **by exception**, in view of these measured results and the documented deviations. This is the owner decision; the JSON files are the primary technical evidence. The exception applies only to this v1 release checkpoint and does not alter the original G-05 or §2.6 performance targets for future engineering/builds. No further G-05 race capture is required for this checkpoint.

Rollback readiness, Pages packaging risk, and item-by-item closure of applicable original PRD §37 requirements remain open. This record does not declare formal v1 release acceptance complete.
