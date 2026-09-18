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

## Route Night UI - generated identity layers

These two bounded identity layers were generated for the hybrid Route Night title/menu pass on 2026-09-18 with the built-in OpenAI image-generation tool. The canonical Route Night reference at `docs/reference/route-night/ROUTE-NIGHT-CANONICAL-REFERENCE.png` was supplied only as a visual-language reference. The outputs are original project art and contain no copied canonical pixels, commercial artwork, logos, characters, vehicles, or external license dependency.

| Runtime file | Generated/source resolution | Production derivative | SHA-256 |
| --- | --- | --- | --- |
| `public/assets/ui/route-night/route-night-title-lockup-brush.webp` | 1774 x 887 PNG output `exec-ed6b9d13-5cf9-4428-8af4-1ec4f0a94ee2.png` | 1774 x 887 alpha WebP, 173,408 bytes | `7f459860e9a4b330c251afa6085be5aac5a2bbf6729412056c30c098e4743d34` |
| `public/assets/ui/route-night/route-night-panel-texture.webp` | 1672 x 941 PNG output `exec-076d9eb9-b5f1-4598-810e-8620291d09c1.png` | 1672 x 941 opaque WebP, 87,054 bytes | `9e43470a8bce016faeee69437f1a811a8d67e62fa04c4c85445c263eeff8ddf3` |

The title layer was requested as an exact product-name treatment with hand-painted brush energy, cyan upper lettering, warm-gold and magenta lower lettering, route strokes, and a gold directional arrow. The generator returned a checkerboard preview instead of usable alpha; production preparation therefore used a deterministic ImageMagick alpha mask that removes only bright, low-chroma neutral checkerboard pixels while preserving the colored lettering and dark brush silhouette. The accepted output was inspected flattened over indigo and light backgrounds before WebP conversion. The SVG title lockup remains the exact-text fallback, and the accessible product name remains live DOM text.

The panel texture was requested as an opaque, text-safe Route Night surface: deep indigo/graphite structure, cyan route lines and checkpoint nodes, restrained violet/magenta energy, warm-gold focus markers, clipped geometry, and print grain. It is placed at low opacity behind live responsive panels and does not own layout, text, input, or interaction state.

## Route Night UI - authored vector asset library

The desktop title/menu increment also includes a small authored SVG library for exact, responsive placement of the production UI identity. These files were authored for this repository on 2026-09-18. They contain no external artwork, copied commercial icons, embedded fonts, third-party dependencies, or rasterized text. The title lockup preserves the exact product name as live SVG text; button labels and accessible interface copy remain live DOM text in `src/app/mountAppShell.ts`.

| Runtime asset | Placement / contents | Bytes | SHA-256 |
| --- | --- | ---: | --- |
| `public/assets/ui/route-night/route-night-title-lockup.svg` | Title-screen product-name lockup | 2,064 | `aab87bed6f21ad41a44d5dd842716011af607edca527ac1ce29e9061f1834bf3` |
| `public/assets/ui/route-night/route-night-mark.svg` | Existing route/token brand mark as a reusable standalone image | 816 | `b02119f2263da87ff04da59a3c749ec7447e7ad52874a2da27ff70b3f7d1354c` |
| `public/assets/ui/route-night/route-night-ui.svg` | Play, controls, settings, back, arrow, audio, graphics, lock, route, checkpoint, and node symbols | 3,301 | `69e84b384cd503499e41576d669a0109a26b361638602c4efe21db4c0bfcfbfc` |
| `public/assets/ui/route-night/route-night-button-frames.svg` | Gold-primary, cyan utility/secondary, and disabled clipped button frames | 1,416 | `f3ce9cab7723efb663fa9f12466b1dc4b2a847f3ebe727ca21cbbf45f6730d3e` |
| `public/assets/ui/route-night/route-night-route-ornaments.svg` | Route arcs, branches, checkpoint rings, and divider motifs | 1,899 | `0b3d2f90d9bdac0a2c3e1380289369834697203a5629c0100eee1f30ffeca67f` |
| `public/assets/ui/route-night/route-night-status.svg` | Live, audio, locked, and system status markers | 1,358 | `ec4379d58ea2ee864b90e3593a1f85c6e4d5eff80cf9764be3ef0ccaaf87bf62` |

The SVG files are referenced through the revisioned, base-aware helpers in `src/ui/routeNight.ts`. `route-night-ui.svg`, `route-night-button-frames.svg`, `route-night-route-ornaments.svg`, and `route-night-status.svg` are symbol libraries: screens place individual symbols with external SVG `<use>` references, while CSS controls scale, color, focus, motion, and responsive layout.
