# Slice 5 Item/VFX Rendered-Runtime Performance Evidence

## Publication baseline

- Instrumentation merge: `4ef75359e8b1dc3d6b7e2865d613774975a5af99` through PR #170.
- Post-merge validation and GitHub Pages: `35302908290` PASS.
- Hosted PR validation before merge: `35301884528` PASS with **62 test files / 507 tests**.
- Governing methodology: `docs/SLICE-5-ITEM-VFX-PERFORMANCE-METHODOLOGY-2026-09-17.md`.

## Product-owner rendered-device evidence

Manny supplied two deployed-build screenshots after the live meter reached the full 600-sample rolling window. No browser name, browser version, device make/model, operating-system version, or hardware specification is inferred beyond what Manny explicitly reported.

| Route | p95 | Budget | Median | Max | Samples | Result |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| Ordinary full-AI race, `?testItemPerf=1` | **1.00 ms** | **1.00 ms** | 0.40 ms | 6.80 ms | 600 | **PASS** |
| Forced Rebounding Arc Blade, `?testItemPerf=1&testItem=arc-blade` | **1.00 ms** | **1.00 ms** | 0.50 ms | 8.70 ms | 600 | **PASS** |

## Interpretation

The governing pass condition is **p95 <= 1.00 ms** after at least 300 scored rendered frames. Both supplied captures reached **N600** and therefore satisfy the defined sample requirement. Both p95 values equal the 1.00 ms budget ceiling and therefore pass exactly at the threshold.

The maximum values are retained as diagnostics only and do not independently fail the gate under the approved methodology. The results show no p95 headroom, so later optimization work may improve margin, but no Slice 5 performance defect is opened by these captures.

## Scope

This evidence closes the Slice 5 Item/VFX rendered-runtime performance gate only. It does not by itself close the remaining final desktop/mobile whole-slice acceptance gate or unlock Slice 6.

## PRD deviation

None.
