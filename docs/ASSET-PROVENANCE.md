# Production Asset Provenance Ledger

This ledger records external production assets used by Manaconda's Minigame Mayhem. It is the durable rights/provenance record required by Slice 6. Every externally sourced production asset must record its source, license, stable asset identifier, downloaded/source resolution, production derivative path, and transformation notes before release.

## Poly Haven - Asphalt Track

- **Asset:** Asphalt Track
- **Stable source identifier:** `asphalt_track`
- **Author:** Dimitrios Savva
- **Source:** https://polyhaven.com/a/asphalt_track
- **License:** CC0
- **License record:** https://polyhaven.com/license
- **License verified:** 2026-09-18
- **Physical scale:** 2 m wide source material
- **Downloaded source resolution:** 1024 x 1024 JPEG maps selected from Poly Haven's 1K distribution
- **Production use:** Circuit Alpha road and racing-wear PBR material only
- **Production derivative root:** `public/assets/track/materials/asphalt-track/`
- **Transformations:** No crop, resample, repaint, or generative modification. The 1K diffuse, OpenGL normal, and roughness JPEG variants are shipped byte-for-byte as downloaded. Runtime material parameters provide tint/normal strength/roughness response; those parameters do not alter source bytes.
- **Excluded source maps:** displacement, AO/rough/metal packed map, DX normal, previews, and higher-resolution distributions are not shipped in this checkpoint.
- **Runtime revision:** `slice6-asphalt-20260918-1`

| Runtime file | Purpose | SHA-256 / LFS object ID |
| --- | --- | --- |
| `asphalt_track_diff_1k.jpg` | sRGB diffuse/albedo | `05c4e79cd99160075969d37bfc6ef72be262153a410bb45510b2c23f7303894c` |
| `asphalt_track_nor_gl_1k.jpg` | OpenGL tangent-space normal | `18caf02427a7cd9cd577ceae5aa9daa7bb3ffba60598e2df8aaf75d1925a8a94` |
| `asphalt_track_rough_1k.jpg` | roughness | `0646d0cfbe6bf9ea4a8a9e43aec826e7ec32a10b8aff61bf5a4ec02b1bc3c363` |

The repository also stores `SOURCE-SHA256SUMS.txt` beside the maps. `tools/verify-runtime-assets.mjs` verifies the JPEG signatures and the exact hashes during production validation so an LFS pointer or unexpected byte change fails the build.
