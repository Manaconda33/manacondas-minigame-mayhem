# Separate author self-review

Native implementation; no delegation. Reviewed the completed runtime independently of the construction sequence.

- Geometry/layout/material grouping preserves opaque triangles, attributes, transforms, policies and dynamic SteeringWheel/anchor identity across all twelve original production GLBs.
- Float32 baking tolerance is explicit; aa-07 embedded image decoding alone is replaced in JSDOM. Pixel/camera/shadow visual acceptance remains owner review.
- Transparent, skinned/morph, instanced, mirrored, hidden and partial draw-range meshes are excluded. Animated assets bypass at race integration. No LOD, caster disable, DPR reduction, material/texture change or gameplay edits.
- New geometry is owned by the race. Finding: retaining replaced original buffers until disposal increased CPU residency; fixed with ownership RED→GREEN. Shared geometry used by a retained steering control is not prematurely disposed. Late AI completion is guarded; animation bypass and disposal are covered in runtime tests.
- Bounds combine per material within one kart, so off-screen triangles can differ under partial culling. Actual draw-call/FPS improvement remains pending; no extrapolated 250-call pass.
- Existing main/production remains unchanged by this review. No open source-level critical/important findings. Known actual-browser/mobile evidence limitation recorded in README.
