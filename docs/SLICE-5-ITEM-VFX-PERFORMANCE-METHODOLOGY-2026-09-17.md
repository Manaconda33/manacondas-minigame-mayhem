# Slice 5 Item/VFX Performance Measurement Methodology

## Purpose

This checkpoint adds the live instrumentation required to evaluate the PRD v1.1 Section 2.6 **Item/VFX systems <= 1.0 ms CPU** budget on the real rendered game runtime.

It does not certify a device result by itself. Publication of the instrumentation must precede live measurement on the deployed build. No Node/JSDOM timing result may be substituted for rendered-device evidence.

## Diagnostic route

Append `?testItemPerf=1` to the deployed game URL.

The flag is opt-in and may be combined with the existing item forcing routes, for example:

- `?testItemPerf=1`
- `?testItemPerf=1&testItem=arc-blade`
- `?testItemPerf=1&testAiItem=arc-hammers&testAiRacer=ai-1`

The normal unforced URL does not collect performance samples and does not show the performance badge.

## Measured CPU boundary

The meter samples **per rendered frame** and sums item-system work across every fixed simulation step executed in that rendered frame plus the rendered-frame item VFX work.

Included:

- inventory and roulette advancement;
- item-owned timed buffs/debuffs and immunity state;
- Rocket item-control seam;
- projectile, hazard, Apex, Shockwave, Ink and Prismatic item processing;
- item-box runtime update;
- item target/counter processing already owned by the item update path;
- racer-owned Nitro/Overdrive/Rocket/Prismatic visuals;
- Seeker warning visuals;
- Apex presentation;
- Frost presentation; and
- player item presentation.

Excluded because the PRD budgets them separately:

- Three.js renderer submission;
- Rapier physics and kart-controller work;
- ordinary racer AI/pathfinding and race ranking;
- HUD/DOM update;
- audio/update; and
- unrelated drift/driver-sprite presentation.

## Sampling rule

- Collection begins only while RaceDirector phase is `racing`.
- First **120 racing rendered frames** are warmup and are not scored.
- A scored result requires at least **300 rendered-frame samples**.
- The rolling window retains the most recent **600 samples**.
- The badge reports sample count, median, p95 and maximum.
- **PASS:** p95 item/VFX CPU <= **1.00 ms**.
- **FAIL:** p95 item/VFX CPU > **1.00 ms**.
- Maximum is diagnostic only because one-off browser scheduling/GC spikes are not a stable subsystem budget measurement.

This p95 rule is a test-method decision, not a gameplay/balance change. The exact 1.00 ms threshold comes from the PRD.

## Evidence protocol

For the live performance gate, record the stable badge after at least 300 scored samples on each tested device class. The final evidence must identify only device/browser details actually reported by the tester; do not infer them.

Recommended capture:

1. Run an ordinary full-AI race with `?testItemPerf=1`.
2. Continue until the badge has at least 300 samples.
3. Record p95, median, max and sample count.
4. Exercise representative item-heavy play or combine the performance flag with an existing forced-item route.
5. Record the second stable result.
6. Treat any p95 above 1.00 ms as a performance defect requiring investigation before Slice 5 closure.

The separate final desktop/mobile whole-slice acceptance remains open after this instrumentation checkpoint.

## PRD deviation

None.
