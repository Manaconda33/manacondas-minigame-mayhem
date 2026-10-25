# R2.12 — G-05 v1 owner acceptance by exception

**Date:** 2026-10-25

**Repository baseline for this documentation checkpoint:** `12e996ff5b77b3cbfdd5973aabae75f7ca89fa70`

**Disposition:** **OWNER ACCEPTED BY EXCEPTION** for the v1 release gate. This is not an unconditional technical PASS or formal v1 release sign-off.

## Owner-reported desktop capture summary

Manny's R2.12 assignment is the source of truth for the values in this record. The session was reported as:

| Condition                           | Reported value           |
| ----------------------------------- | ------------------------ |
| OS / browser                        | Windows / Chrome 156     |
| GPU / API                           | AMD Radeon / D3D11       |
| Quality                             | Medium                   |
| Track                               | Neon Grid                |
| Drawing buffer                      | 1920×911                 |
| Racers                              | One player plus seven AI |
| Session                             | Completed three laps     |
| Scored frames                       | 9,630                    |
| Median FPS                          | 59.8802                  |
| p95 frame time                      | 16.8 ms                  |
| Longest consecutive run above 50 ms | 2 frames                 |
| Peak draw calls                     | 486                      |
| Peak triangles                      | 348,923                  |
| Isolated maximum frame observation  | 1,199 ms                 |

## Protocol deviations and technical readings

The median is slightly below the original **60 FPS** target. The capture used Neon Grid rather than the prescribed default Circuit Alpha and a 1920×911 drawing buffer rather than 1920×1080. The reported p95 is within the original **18.3 ms** target, the longest >50 ms run is below the three-frame sustained-stall criterion, and 486 calls is within the 500-call scene cap. The 348,923 triangle observation is below the global 750,000 visible-triangle cap; it does not replace the separately scoped Task 9 engineering limit.

The isolated 1,199 ms maximum-frame observation is retained and must not be hidden by the median or p95 summary. The provided summary does not establish the exact sample index or capture file associated with this outlier.

The owner-provided summary contains no numeric measurements for the following §2.6 subsystem/resource fields, so they remain **UNMEASURED** in this record: rendering-submission CPU, physics, AI/race, item/VFX, HUD/UI, audio/update, amortized GC, CPU headroom, GPU frame time, total-frame target, JS heap after race load, GPU texture residency, dynamic shadow-caster count, gameplay-particle count, active physics projectiles, and audio voices. The peak triangle observation is below the global 750,000 visible-triangle cap; it does not substitute for task-scoped measurements.

## Owner disposition and remaining evidence

Manny explicitly accepts G-05 as satisfying the v1 release gate by exception and requires no additional G-05 race capture for this release checkpoint. The exception applies only to this v1 disposition. Original G-05 and §2.6 targets remain unchanged for future engineering and builds.

GPU timing and unavailable subsystem/resource metrics are **UNMEASURED**. No missing measurement is inferred as zero or pass. Rollback readiness, Pages packaging risk, and item-by-item closure of applicable PRD §37 requirements remain open. This record does not claim formal v1 acceptance.

## Raw-capture preservation status

The R2.12 instruction requests preserving two original October 25 JSON captures byte-for-byte with SHA-256 checksums. Those files were not present in this checkout or the connected local workspace when this record was prepared. The owner-provided summary is recorded as the source of truth for the stated values, but the raw JSON bytes and their checksums are **not included or verified here**. No synthetic capture files or placeholder hashes have been created. The exact capture source commit, individual capture filenames, and per-capture mapping of the 1,199 ms observation are likewise unavailable in the supplied summary.
