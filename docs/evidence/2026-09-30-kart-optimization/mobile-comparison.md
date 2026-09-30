# Mobile optimization comparison — 2026-09-30

Manny supplied 1000028765.jpg (conversation attachment file_00000000b43c81f69dca6151c23ee2d8) showing Race Results and diagnostics on the private optimization preview. The supplied local image path was unavailable; the visible conversation image was inspected and transcribed. No original image bytes or raw JSON were available to commit. Evidence method matches the owner's earlier screenshot-based mobile baseline substitution.

The hardware field visibly begins “Galaxy Z Fold 5 / and…”, with the remainder clipped. Exact OS/browser version, Medium setting, drawing-buffer size/DPR and source stamp are not independently visible. Intended review runtime: 1caa47dddf3c0d2c14e7d7a38f57c09fb0a73eb4, PR #213. Screenshot shows authoritative Results: player Krios first at 01:26.633, Alex second and Dragon Queen third. Earlier baseline player was Manaconda; grid/items/view coverage differ. No strictly controlled same-grid comparison is claimed.

| Metric | Original mobile baseline | Optimization run |
| --- | ---: | ---: |
| Scored samples | 5,494 | 5,047 |
| Eligible samples | 5,614 | 5,167 |
| Skipped intervals | 159 | 167 |
| Median FPS | 59.9 | 59.9 |
| p95 interval | 16.8 ms | 16.8 ms |
| Maximum interval | 116.7 ms | 233.5 ms |
| Intervals >50 ms | 5 | 3 |
| Longest consecutive >50 ms run | 2 | 1 |
| Maximum draw calls | 321 | 226 |
| Maximum triangles | 244,722 | 219,548 |
| Warmup samples | 120 | 120 |
| Original window limit | 36,000 | 36,000 |

Maximum draw calls decreased by 95 (29.6%) and are 24 below the <=250 reference target in this observed run. Maximum triangles decreased by 25,174 (10.3%) and remain below 750,000. p95 remains within 18.3 ms; displayed median FPS is unchanged and slightly below the literal >=60 target. The screenshot supports a draw-call improvement consistent with structural batching evidence; changed lineup/scenario prevents attributing the full difference solely to batching.

Fewer >50 ms frames and shorter longest run coexist with a worse maximum interval. The screenshot cannot attribute that 233.5 ms isolated stall to rendering, OS/browser activity or another subsystem; do not hide it, infer a broad frame-time pass, or start speculative repairs. No truncated/raceCompleted flags, raw intervals, heap/GPU/texture-byte/shadow-object/particle data are verified. Scored count is below the cap and Results is visible.

Disposition: actual mobile diagnostic summary RECORDED, draw-call target met in this run. Explicit visual acceptance of unchanged karts/driver behavior/shadows and separate runtime merge/production approval remain pending. Existing gameplay/HUD/Results/audio/manual acceptance remains passed. This screenshot alone authorizes no merge/deployment, VFX/bloom/blur or next slice.
