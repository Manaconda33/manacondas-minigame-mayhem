# Slice 5 Item Distribution Report — 2026-09-07

## Evidence status

- Reproducible test: `tests/item-distribution.test.ts`.
- Hosted pull-request CI run: `34139123888` on commit `94e90a7a8adfbe107dbd2095cae706596a1be7bc` — PASS.
- Sample size: **100,000 deterministic selections per rank; 800,000 total**.
- Acceptance threshold: every eligible item must remain within **0.5 percentage points** of its effective post-restriction/post-gap probability; zero-weight items must never be selected.
- Result: **PASS for all eight ranks**.
- PR #114 reconciles only the seeded-distribution and probability-report evidence gates in the Slice 5 continuity documents; all broader Slice 5 gates remain open.

## Method

The test calls the production `selectItem()` and `effectiveItemWeights()` implementations directly. It uses deterministic Mulberry32 seeds `0x5A17C001` through `0x5A17C008`, one seed per rank. Ranks 1–5 run at 0 m behind the leader. Ranks 6–8 run at exactly 45 m behind the leader so Hyper-Drive is legally eligible and the approved gap factor is 1.18. Apex availability is enabled. No arbitrary runtime filter is applied.

This scenario preserves the approved rank tables while exercising the full legal catch-up pool for ranks 6–8. Existing unit tests separately cover gap-factor clamping through 1.35 and prerequisite filtering.

## Rank summary

| Rank | Seed | Gap | Gap factor | Worst item | Expected | Observed | Absolute deviation | Result |
| ---: | --- | ---: | ---: | --- | ---: | ---: | ---: | --- |
| 1 | `0x5A17C001` | 0 m | 1.00 | Slick Trap | 32.000% | 31.798% | 0.202 pp | PASS |
| 2 | `0x5A17C002` | 0 m | 1.00 | Nitro Surge | 20.000% | 19.774% | 0.226 pp | PASS |
| 3 | `0x5A17C003` | 0 m | 1.00 | Nitro Surge | 16.000% | 16.101% | 0.101 pp | PASS |
| 4 | `0x5A17C004` | 0 m | 1.00 | Slick Trap | 12.000% | 11.855% | 0.145 pp | PASS |
| 5 | `0x5A17C005` | 0 m | 1.00 | Seeker Drone | 15.000% | 15.315% | 0.315 pp | PASS |
| 6 | `0x5A17C006` | 45 m | 1.18 | Frost Orbs | 7.722% | 7.939% | 0.217 pp | PASS |
| 7 | `0x5A17C007` | 45 m | 1.18 | Seeker Drone | 9.504% | 9.320% | 0.184 pp | PASS |
| 8 | `0x5A17C008` | 45 m | 1.18 | Ink Splat | 7.401% | 7.275% | 0.126 pp | PASS |

## Recorded selection counts

Each row totals exactly 100,000 selections. Counts are the deterministic output for the seed and context above.

| Item | R1 | R2 | R3 | R4 | R5 | R6 | R7 | R8 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Kinetic Disc | 18,162 | 16,109 | 13,991 | 10,086 | 8,035 | 4,845 | 2,837 | 1,863 |
| Seeker Drone | 0 | 8,093 | 12,007 | 14,038 | 15,315 | 11,602 | 9,320 | 5,615 |
| Apex Missile | 0 | 0 | 0 | 1,043 | 3,078 | 9,015 | 12,316 | 14,203 |
| Blast Orb | 1,991 | 3,952 | 5,983 | 7,952 | 9,982 | 8,600 | 7,618 | 5,640 |
| Blaze Orbs | 0 | 2,025 | 4,007 | 5,960 | 6,902 | 7,773 | 7,584 | 5,428 |
| Frost Orbs | 0 | 0 | 1,954 | 3,995 | 5,914 | 7,939 | 8,443 | 7,377 |
| Arc Blade | 5,110 | 5,947 | 6,948 | 7,988 | 8,040 | 6,697 | 5,799 | 3,788 |
| Arc Hammers | 0 | 1,007 | 2,003 | 4,082 | 5,879 | 6,632 | 7,679 | 5,586 |
| Slick Trap | 31,798 | 23,962 | 18,059 | 11,855 | 8,013 | 4,719 | 2,835 | 1,856 |
| Shockwave | 18,155 | 15,089 | 12,020 | 7,983 | 5,992 | 3,891 | 1,915 | 1,866 |
| Ink Splat | 0 | 0 | 1,983 | 4,008 | 6,060 | 6,786 | 7,662 | 7,275 |
| Nitro Surge | 21,884 | 19,774 | 16,101 | 14,896 | 11,848 | 7,732 | 5,644 | 4,610 |
| Nitro Overdrive | 0 | 0 | 0 | 1,972 | 2,966 | 6,918 | 10,203 | 14,145 |
| Hyper-Drive | 0 | 0 | 0 | 0 | 0 | 6,851 | 10,145 | 16,287 |
| Prismatic | 2,900 | 4,042 | 4,944 | 4,142 | 1,976 | 0 | 0 | 4,461 |

## Interpretation

All eight rank samples pass the approved approximately 0.5-percentage-point fit gate. The largest observed deviation is **0.315 percentage points** for Seeker Drone in rank 5 (15.000% expected versus 15.315% observed). Impossible/zero-weight items were selected zero times. The test is deterministic, so future CI runs will reproduce the same counts unless governed selector logic, probability configuration, eligibility rules, or the explicit test seed/context changes.

This evidence closes only the Slice 5 seeded-distribution requirement and probability-report evidence requirement. It does not close remaining item effects, cross-item counters, AI tactical use, all-item pause/lifecycle behavior, soak/performance, final desktop/mobile acceptance, or Slice 5 itself.
