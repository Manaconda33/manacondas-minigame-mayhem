# Lunarcrystal Asset Brief

The definitive supplied reference and fourteen individual approvals are recorded in `docs/avatars/LUNARCRYSTAL.md`. Preserve the approved pixel-art likeness and celestial purple/gold outfit.

## Prepared 2D package

Portrait 256×256, ten seated driver frames 512×512, full-body selection and two full-body Results illustrations 1024×1536. The corrected rear steering versions supersede the two rejected versions; front steering uses the same physical hand directions. Driver frames share full-canvas resampling with 16px inset; portrait has 8px inset. Selection/Results preserve exact approved bytes.

Run `python tools/assets/prepare_lunarcrystal_2d.py --verify` to fully decode every delivery file and compare mode, size, alpha bounds and SHA-256 against the checked-in ledger. Regeneration requires the exact source masters identified in the approved ledger; verification requires runtime derivatives only.

Runtime PNGs are delivered in normal Git under `public/assets/characters/lunarcrystal/`. Source masters remain local and LFS-governed, excluded from upload. Existing `.gitattributes` needs no change. No AA profile allocation, manifest activation, kart, production merge or Pages deployment is included.

## Later work

Obtain kart name/construction and balance approval, then build deterministic geometry with required hierarchy, LOD budgets, `extras.forward: "-Z"` and shared PI visual correction. Inspect actual mesh geometry and structural attachments before owner review. Integrate both-camera driver mounts and existing VFX outlets only after those gates. Reconcile latest main including independent shadow work before runtime integration.
