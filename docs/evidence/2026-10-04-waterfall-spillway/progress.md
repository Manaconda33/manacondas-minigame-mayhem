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


**Task 7 waterfall spillway visual revision — LIVE ISOLATED PREVIEW / STOP FOR OWNER RETEST (2026-10-04 America/Chicago).** Manny approved the waterway entering from the driver's left, flowing across the existing ramp and pouring from its actual lip into the pool. Runtime `b49d9876f8c6ce87956f8b91675c3c8180e56b55` supersedes rejected `fbff249`. Full local and exact-source hosted validation PASS: 125 files / 995 tests, typecheck, zero-warning lint and build. Original 18-case residual matrix: zero unintended air, maximum native loss 0.426449 m/s. Hosted real KartTimeTrial software-WebGL matrix: 17 views, no page/resource/shader errors, maximum 142/250 draw calls; overview adds 4 calls and 2,176 triangles. Images inspected, owner visual acceptance remains pending. Workflow-only PR #257 merged at `db861ef8876f38b082fcffef3c423236076fd7c3`; Pages run 37245587240 validate/deploy/hash checks PASS. All 30 live HTTP/size/SHA256 checks pass: 8 exact pinned Dive build files and 22 preserved production/5.3/tunnel/billboard files. No gameplay, physics, stats, item, repaired-face or binary runtime asset changes. Gold tell and landing marker retained. PR #242 remains draft/open/unmerged at b89c788, independent Stage 4 input preserved. Preview: https://manaconda33.github.io/manacondas-minigame-mayhem/previews/neon-grid-dive/?review=b49d987 . Evidence: docs/evidence/2026-10-04-waterfall-spillway/. STOP for owner retest; no production gameplay integration or subsequent stage authority.


## Owner visual approval — 2026-10-04 America/Chicago

Manny approved the published waterfall spillway preview on 2026-10-04 at 20:05 America/Chicago with “Approved”. Approval applies to the revised waterfall presentation at runtime b49d9876f8c6ce87956f8b91675c3c8180e56b55: the left waterway, water flowing over the ramp, and cascade from its launch lip into the pool. This closes the visual retest gate for this bounded Task 7 revision. It does not independently establish gameplay balance, final AI rates, device performance or authorize production integration or Stage 4.

The earlier pending-owner-retest statements are historical and superseded for this visual revision only. Engineering and delivery evidence remains unchanged. Approval recorded on feature/neon-grid-waterfall-dive; production unchanged.
