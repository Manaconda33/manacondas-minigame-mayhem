# Task 7 ramp waterfall — approved visual revision

Manny approved the ramp-as-waterfall spillway design on2026-10-04 after rejecting fbff249's floating cyan blocks. A supported source enters from left, feeds shallow water across unchanged native ramp, and pours over its actual lip to pool. No gameplay/stat/item/physics/main-floor/repaired-face changes or binary assets. Gold tell and landing remain readable pending rendered/owner review.

Base526eb9a is the delivery record directly after previewfbff249. Feature side branch is isolated from draftPR242 atb89c788 and its independent Stage4 document. Preserve all accepted pins.

RED: new lip/source/flow tests fail with missing surface at baseline. Join-edge test independently catches0.6296m mismatch before per-edge ramp grounding; GREEN focused15checks. Full125files/995tests/typecheck/zero-warninglint/build PASS. Hosted renderer pending. Original18-run matrix already passes0air/maxloss0.426449m/s. Main gameplay/support files have no diff.

Continuous water/ramp/source/falls are texture-free shaders with shared race clock, no secondary render passes. Existing48streak/16mist/8splash batches retained; source has one consolidated retaining/bank mesh. Source endpoint edges sample actual ramp and taper to it, sheet begins at every Float32 lip vertex and falls to0.08m. Mist is soft procedural billboarded spray near pool rather than visible polygons. No final AI rates/balance/audio/Stage4 work.

Local browser launch is blocked by process socket restrictions. Hosted actual KartTimeTrial render matrix must pass error/draw-call gates and images must be inspected before preview merge. After deployment verify source marker and30file hashes/preserved22files, record exact commits/CI/delivery and STOP for owner retest.

## First hosted checks and camera correction

PR257 CI37244364120 stopped in the unchanged accepted Billboard fixture: mobile countdown aa-02 exceeded its prior5000ms runner timeout under coverage. The same fixture was already corrected to15000ms in Divefbff249. Apply15s default runner allowance only to retained Billboard CLI validation without changing assertions or pin; all other gates stay intact.

Hosted render37244755692 generated actual eight-racer images and17viewpoints; max140draw calls, no shader errors, but one404 resource request failed the strict error gate. The diagnostic HTML has no favicon; add an inline data favicon and response URLs for precise failure evidence rather than suppress errors. Camera inspection catches the feed on the driver's RIGHT despite negative authored right-vector offset. Neon uses positive-Z forward; true camera-left is the existing positive right vector. Flip only scenery/source offsets to positive lanes; corrected expectation fails first in driver-left-red.txt. Retest all assertions, render and matrix before delivery. Initial screenshot artifacts are not runtime assets and no binary is committed.

Final corrected-driver-left local gate:125files/995tests, strict typecheck, zero-warning lint and production build PASS. Regenerated18runmatrix is byte-identical to first raw matrix;0air/maxloss0.426449. No gameplay/collider/repairedface diff. Hosted corrected render/published source and owner acceptance still pending.
