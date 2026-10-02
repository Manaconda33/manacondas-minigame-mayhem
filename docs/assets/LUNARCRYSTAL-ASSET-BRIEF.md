# Lunarcrystal Asset Brief

The definitive supplied reference and fourteen individual approvals are recorded in `docs/avatars/LUNARCRYSTAL.md`. Preserve the approved pixel-art likeness and celestial purple/gold outfit.

## Prepared 2D package

Portrait 256×256, ten seated driver frames 512×512, full-body selection and two full-body Results illustrations 1024×1536. The corrected rear steering versions supersede the two rejected versions; front steering uses the same physical hand directions. Driver frames share full-canvas resampling with 16px inset; portrait has 8px inset. Selection/Results preserve exact approved bytes.

Run `python tools/assets/prepare_lunarcrystal_2d.py --verify` to fully decode every delivery file and compare mode, size, alpha bounds and SHA-256 against the checked-in ledger. Regeneration requires the exact source masters identified in the approved ledger; verification requires runtime derivatives only.

Runtime PNGs are delivered in normal Git under `public/assets/characters/lunarcrystal/`. Source masters remain local and LFS-governed, excluded from upload. Existing `.gitattributes` needs no change. No AA profile allocation, manifest activation, kart, production merge or Pages deployment is included.

## Later work

Kart name/concept and AA-14 balance were approved 2026-10-02. Build deterministic geometry with required hierarchy, LOD budgets, `extras.forward: "-Z"` and shared PI visual correction. Inspect actual mesh geometry and structural attachments before owner review. Integrate both-camera driver mounts and existing VFX outlets only after those gates. Reconcile latest main including independent shadow work before runtime integration.

## Moonlit Carriage candidate 1

Actual procedural geometry is built by `tools/assets/build_lunarcrystal_kart.py`, using the established shared GLB exporter. Render `tools/assets/render_lunarcrystal_kart_review.py` shows front/rear three-quarter, top and side views from the same geometry. No painted or generated details are added. LOD0/1/2 must stay under 25,000 / 12,000 / 5,000 triangles, preserve required steering/wheel/exhaust/item/driver nodes and `extras.forward: -Z`, and reproduce identical bytes. Candidate 1 geometry was approved after Manny inspected the actual GLB on 2026-10-02. Its three exact hashes are locally copied into LFS-governed runtime paths; publication and live mounting approval remain pending.

### Local integration contract

Preserve every approved 2D PNG in the `lunarcrystal` namespace; internal roster ID is AA-14. Use revision `lunarcrystal-runtime-20261002-1` for kart/portrait/selection/driver files; Results use the exact original SHA-256 as revision. `approved-kart.json` governs all three immutable GLBs and budgets. The runtime-asset build gate verifies all fourteen art hashes/corners and all three model hashes, hierarchy, forward metadata and triangle counts. `render_lunarcrystal_mount_review.py` produces all-ten-pose offline mount sheets using the actual runtime scale/ground/PI-yaw/billboard contract. No new art derivatives, geometry changes or physics changes are authorized by these mount choices.
