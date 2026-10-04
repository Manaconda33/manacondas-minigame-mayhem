# Task 7 ramp waterfall — approved visual revision

Manny approved the ramp-as-waterfall spillway design on2026-10-04 after rejecting fbff249's floating cyan blocks. A supported source enters from left, feeds shallow water across unchanged native ramp, and pours over its actual lip to pool. No gameplay/stat/item/physics/main-floor/repaired-face changes or binary assets. Gold tell and landing remain readable pending rendered/owner review.

Base526eb9a is the delivery record directly after previewfbff249. Feature side branch is isolated from draftPR242 atb89c788 and its independent Stage4 document. Preserve all accepted pins.

RED: new lip/source/flow tests fail with missing surface at baseline. Join-edge test independently catches0.6296m mismatch before per-edge ramp grounding; GREEN focused15checks. Full125files/995tests/typecheck/zero-warninglint/build PASS. Hosted renderer pending. Original18-run matrix already passes0air/maxloss0.426449m/s. Main gameplay/support files have no diff.

Continuous water/ramp/source/falls are texture-free shaders with shared race clock, no secondary render passes. Existing48streak/16mist/8splash batches retained; source has one consolidated retaining/bank mesh. Source endpoint edges sample actual ramp and taper to it, sheet begins at every Float32 lip vertex and falls to0.08m. Mist is soft procedural billboarded spray near pool rather than visible polygons. No final AI rates/balance/audio/Stage4 work.

Local browser launch is blocked by process socket restrictions. Hosted actual KartTimeTrial render matrix must pass error/draw-call gates and images must be inspected before preview merge. After deployment verify source marker and30file hashes/preserved22files, record exact commits/CI/delivery and STOP for owner retest.
