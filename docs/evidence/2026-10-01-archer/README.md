# Archer 2D asset-only delivery — 2026-10-01

Manny individually approved all fourteen illustrations, then directed completion of the 2D workflow and repository delivery before kart modeling. No production activation is authorized by this asset checkpoint.

- `approved-art-ledger.json`: source identity, SHA-256, dimensions, alpha and approval observations. Source masters are retained locally, not remotely delivered.
- `runtime-art-ledger.json`: exact fourteen runtime PNG hashes, dimensions, shared canvas insets and alpha bounds. These use existing normal-Git exceptions, not LFS.
- `python tools/assets/prepare_archer_2d.py --verify`: fully decodes every PNG and checks exact approved delivery hashes, RGBA dimensions and transparent corners. Regeneration requires the original source masters and Pillow 12.3.0 (current preparation environment).
- Portrait 256×256; ten drivers 512×512; selection and two results poses 1024×1536. Premultiplied Lanczos resizing preserves the shared driver canvas with a 16px inset. Selection/results are byte-identical to approved source outputs. Original alpha is retained, with no edge removal, repainting or alpha thresholding.
- Combined delivery sheet visually inspected against a dark background: face/hood detail, bowstrings, glitch accents, state directions and silhouette edges. Actual cockpit mounting awaits approved geometry.
- Refreshed base main: `4fe73c58e4c51201f917658e705fca8b2b3db8ec`. Full validation passed 91 files / 727 tests, strict typecheck, zero-warning lint, branding/runtime asset gates and production build; statement coverage 88.78%. Diff and existing LFS fsck pass. No gameplay/manifest files changed.
- Delivery uses connected GitHub binary blob API; each uploaded blob SHA equals the local Git blob SHA. Direct Git and source LFS uploads are unavailable because shell credentials are absent. No LFS object was uploaded. Unreproducible high-resolution masters are excluded from the remote tree; no unresolved source pointers or LFS-policy bypass.

Kart modeling, Character Select page two, AA-13 runtime integration, mounted camera checks, owner gameplay review and merge/production publication remain pending.
