# Code review and resolution

Read-only reviewer checked the implementation against the approved bounded dust scope, including shader/instance layout, normalized GLB anchors, support queries, speed/slip, quality caps and lifecycle. No Critical findings.

- Important: geometry/material disposal omitted the InstancedMesh dispose event needed for GPU instance buffers. Added `mesh.dispose()` and observed RED→GREEN exactly-once event coverage.
- Minor: the runtime GLTF fixture initially exercised fallback wheel locations only. Added named wheels beneath translated/rotated parents, literal normalized emission-position expectations, and a mutation run proving the test fails when capture is omitted before batching.

Read-only follow-up confirms both findings resolved with no further findings on those fixes. No reviewer changed files or reran full validation. Actual WebGL shader execution, perceptual alignment/alpha/contact-threshold appearance and hardware frame-time remain pending owner/runtime review; no visual pass is claimed. Existing acceptance is preserved.
