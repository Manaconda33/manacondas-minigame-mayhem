# Neon Grid Billboard balance candidate

Date: 2026-10-05  
Runtime: `c71b2287b463f6a17645d664d3307d6b591561bf`  
CI: `37352477495` PASS

Manny approved one modest standard boost pad inside the Billboard shortcut, AI attempt rates Tunnel 5% / Billboard 45% / Dive 12%, a +3.6 s Billboard cycle offset, and retaining the forgiving 1.5 s Dive splash recovery. The existing once-only Billboard ON/static retention remains 0.82.

The candidate uses one standard boost surface at Billboard path fraction 0.93, after the physical commitment mouth and before rejoin. No kart tuning, global physics, items, Tunnel/Dive geometry, repaired 5.3 faces, or Dive recovery behavior changed.

Paired production-native measurements use the same driver/settings and initial speed for main/OFF/ON sections from main progress 0.07 to the common downstream plane at 0.236.

| Metric | Target | Measured range | Mean | Result |
|---|---:|---:|---:|---|
| OFF saving | 0.8–1.0 s | 0.517–0.650 s | 0.569 s | MISS |
| ON saving | 0.5–0.6 s | 0.500–0.633 s | 0.536 s | Mostly in band |
| ON/OFF tell value | 0.25–0.4 s | 0.017–0.050 s | 0.033 s | MISS |

The booster alone does not create the requested ON/OFF separation and does not raise OFF savings to target. Per owner direction, do not alter the 0.82 multiplier unilaterally. The exact measured candidate may be published as an isolated owner-playtest preview, then work stops for owner decision. No Stage 4 authority.

Full branch validation at the exact runtime passed: typecheck, zero-warning lint, full tests, production build, pinned Billboard runtime validation, pinned Dive runtime validation, and spillway render preservation. Measurement rows are in `paired-measurements.json`.
