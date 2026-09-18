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

| Runtime file | Purpose | SHA-256 |
| --- | --- | --- |
| `asphalt_track_diff_1k.jpg` | sRGB diffuse/albedo | `05c4e79cd99160075969d37bfc6ef72be262153a410bb45510b2c23f7303894c` |
| `asphalt_track_nor_gl_1k.jpg` | OpenGL tangent-space normal | `18caf02427a7cd9cd577ceae5aa9daa7bb3ffba60598e2df8aaf75d1925a8a94` |
| `asphalt_track_rough_1k.jpg` | roughness | `0646d0cfbe6bf9ea4a8a9e43aec826e7ec32a10b8aff61bf5a4ec02b1bc3c363` |

The repository also stores `SOURCE-SHA256SUMS.txt` beside the maps. These 1K JPG runtime derivatives are not covered by the current `.gitattributes` LFS patterns, so they remain normal Git files. `tools/verify-runtime-assets.mjs` verifies their JPEG signatures and exact hashes during production validation so an unexpected byte change fails the build. Existing LFS-governed assets remain independently protected by `git lfs fsck`.

## Route Night UI - original generated assets

These two bounded UI assets were generated for the Route Night title/hub increment on 2026-09-18 with the built-in OpenAI image-generation tool. The canonical Route Night reference at `docs/reference/route-night/ROUTE-NIGHT-CANONICAL-REFERENCE.png` was used only as a style and production-language reference. No canonical pixels, text, logos, characters, vehicles, commercial artwork, or exact layout were copied. The generated output is original project art with no embedded external source art or external license dependency.

The transient generated PNG outputs were converted to the committed WebP derivatives with ImageMagick at quality 82. No crop or repaint was applied. The title hero is placed as the full-bleed title/hub atmosphere; the Circuit Alpha image is placed inside the playable hub route card. Runtime URLs are revisioned through `src/ui/routeNight.ts` and use the Vite base path.

| Runtime file | Generated/source resolution | Production derivative | SHA-256 |
| --- | --- | --- | --- |
| `public/assets/ui/route-night/route-night-title-hero.webp` | 1672 x 941 PNG | 1672 x 941 WebP, 141,938 bytes | `799f58545572270f67be3d6c96a8df3863ae3af31d6bc73a861607d3a74fa15c` |
| `public/assets/ui/route-night/circuit-alpha-route-card.webp` | 1672 x 941 PNG | 1672 x 941 WebP, 151,690 bytes | `574220fbe0d67e4f8d9f519cbea69d60093d87721c81fb072b6c5838540ea372` |

Prompt intent was limited to an atmospheric Route Night title/hub backdrop and a Circuit Alpha route/checkpoint card image: deep indigo/graphite structure, cyan route energy, warm gold checkpoints, restrained violet/magenta energy, cinematic twilight framing, and deliberate negative space for UI placement. The assets contain no text, logos, watermark, character likeness, or vehicle identity.
