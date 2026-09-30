# Owner-selected mobile baseline — 2026-09-30

Manny explicitly directed: “Let's treat the desktop medium baseline as the mobile result.” This supersedes the desktop capture prerequisite for this diagnostics checkpoint. The mobile result is the owner-selected baseline; no further desktop capture is required for this checkpoint. It is not relabeled as measured desktop performance and does not automatically close broader PRD performance gates or authorize runtime merge/production, effects or the next slice.

## Evidence and provenance

Manny supplied a Chrome screenshot showing authoritative Race Results and the expanded Race diagnostics panel on the private review. The visible device entry begins “Samsung Z Fold”; the remaining field is clipped. Exact model, OS/browser version, quality setting, drawing-buffer size/DPR, racer count and stamped source metadata cannot be verified from the screenshot. Medium is the intended baseline setting, not independently visible in this evidence. Runtime intended by the provided preview is 4673aac5caae8c8b153526a74afb9d70cb24c15f.

Screenshot identifier: Screenshot_20260930_180453_Chrome.jpg, file_00000000fd7081f6ae32930151a2ae03. Its supplied local path was unavailable; the image displayed in the conversation was inspected and transcribed below. Original screenshot bytes are not committed or replaced by a fabricated image.

Manny reports clicking Download Capture and attaching the result. The attachment available to this session, Minigame-Mayhem-SFX-Preview-1.html, is 6,837,427 bytes, titled “Minigame Mayhem SFX review”, and contains 96 embedded audio assets with no schemaVersion/rawFrameMs/raceCompleted/testRacePerf fields. Capture code downloads application/json as race-performance-<timestamp>.json. The attachment mismatch is unresolved; no raw sample reconstruction or independent JSON verification is claimed. The screenshot summary is retained as the baseline evidence under Manny's explicit substitution.

## Visible summary

| Metric | Screenshot value |
| --- | ---: |
| Scored samples | 5,494 |
| Eligible samples | 5,614 |
| Skipped intervals | 159 |
| Median FPS | 59.9 |
| p95 interval | 16.8 ms |
| Maximum interval | 116.7 ms |
| Intervals >50 ms | 5 |
| Longest consecutive >50 ms run | 2 |
| Maximum draw calls | 321 |
| Maximum triangles | 244,722 |
| Warmup samples | 120 |
| Original sample-window limit | 36,000 |

The displayed scored count is below the cap; raw truncation/completion flags are not available. Results visibly shows Manaconda second at 01:34.117. No resource counts, heap, GPU duration, texture bytes, shadow-object or particle measurements are supplied.

p95 is within the 18.3 ms reference target and triangles below 750,000. The displayed median FPS is slightly below the literal >=60 target; no rounding-based pass is asserted. Maximum draw calls exceed 250 by 71. These are baseline observations, not authorization for optimization or a full performance pass. Existing gameplay/HUD/Results/audio/manual acceptance remains passed.
