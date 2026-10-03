# Task 5 independent review and disposition

A read-only independent reviewer inspected the implementation and ran focused probes before publication. One fix pass followed; no re-review was requested. Five Important findings were accepted and fixed with failing regressions before corrections:

1. Opaque roof intersected the chase/rear view. Neon tunnel camera ceiling now eases down through the approach and caps the actual camera below the covered roof; two real Three ray regressions pass. Default Alpha/main camera behavior is unchanged.
2. Shared-track item guardrails used main projection underground, and projectile spawn used an absolute floor. Stateless physical surface projection, local boundaries and local Neon spawn floor now support tunnel items; racer-selected traversal remains racer-owned.
3. Planar item hits, blasts and object clears crossed the tunnel/street ceiling. Contact filtering now separates physical layers for these consumers, Seeker guidance follows the legal surface, and additional actual-runtime kart/Prismatic regressions prevent through-ceiling contact. Alpha planar behavior and item tuning remain intact.
4. An AI approach missing the physical entry retained its commitment and tried to turn back. Passing the entry window clears a missed commitment.
5. A legal 4 m lateral main-road rejoin retained tunnel state because exit release used 3.2 m. Physical forward exit now accepts the valid main-road footprint and still requires local height/main projection.

Deferred Minor: visual tunnel walls stop 7 m before the endpoint while scripted containment opens 9 m before it (2 m of presentation/containment mismatch). Keep this blockout presentation issue visible for Stage 4; it is not an owner acceptance or runtime-release waiver.

No owner/device/WebGL acceptance is inferred from this review.
