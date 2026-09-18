# Slice 6 Route Night title / hub / utility UI checkpoint

Date: 2026-09-18

Status: **IMPLEMENTED ON FEATURE BRANCH / PUBLICATION AND DEPLOYED VISUAL ACCEPTANCE PENDING**

## Authority and bounded objective

This checkpoint implements the first bounded Route Night UI system under ADR-086. The governing references are:

- `docs/PRD.md`, especially Sections 10.2 and 10.3;
- `docs/DECISIONS.md`, ADR-086 Route Night and ADR-087 settings/audio foundation;
- `docs/reference/route-night/ROUTE-NIGHT-CANONICAL-REFERENCE.png`;
- the protected live Circuit Alpha material baseline recorded by ADR-088.

The implementation is limited to the title screen, main hub, Controls, Settings, and shared Route Night UI foundation. Character Select and all later Slice 6 screens remain deferred.

## Implemented surface

- Title keeps the product name, existing route/token mark identity, browser audio-unlock action, and hub navigation while adding cinematic Route Night framing, a brush-led product lockup with an exact-text SVG fallback, a clear `PRESS START` action, audio state, route readout, editorial route board, and original atmospheric layers.
- Hub makes Circuit Alpha the dominant playable destination, keeps Gallery Gauntlet and Inkstorm Arena visibly `COMING SOON`, leaves unavailable cards without action routing, and adds a route-board progression strip with live/locked checkpoint nodes.
- Controls preserves every existing desktop/mobile binding in a clipped Route Night utility-panel presentation with denser signal rows and input-route chrome.
- Settings preserves the existing `mmm.settings.v1` persistence, Master/Music/SFX sliders, Low/Medium/High graphics selection, and next-race graphics application behavior while adding the shared system-route chrome. Slider readouts are presentation-only.
- `src/ui/routeNight.ts` centralizes deployed-base asset URLs and revisioned UI asset names.
- `src/style.css` adds the shared graphite/indigo, cyan, gold, violet/magenta, route/node, clipped-panel, focus-visible, and reduced-motion primitives. Generated panel texture is a low-opacity backdrop layer only; gameplay/HUD styling remains outside this bounded UI layer.

## Original UI asset package

The package contains five original WebP assets and a small authored SVG library under `public/assets/ui/route-night/`:

| Runtime asset                   | Placement                              | Dimensions | SHA-256                                                            |
| ------------------------------- | -------------------------------------- | ---------- | ------------------------------------------------------------------ |
| `route-night-title-hero.webp`   | title and hub atmospheric backdrop     | 1672 × 941 | `799f58545572270f67be3d6c96a8df3863ae3af31d6bc73a861607d3a74fa15c` |
| `circuit-alpha-route-card.webp` | Circuit Alpha hub destination card art | 1672 × 941 | `574220fbe0d67e4f8d9f519cbea69d60093d87721c81fb072b6c5838540ea372` |
| `route-night-title-lockup-brush.webp` | painterly title treatment with transparent alpha | 1774 × 887 | `7f459860e9a4b330c251afa6085be5aac5a2bbf6729412056c30c098e4743d34` |
| `route-night-panel-texture.webp` | restrained route/checkpoint panel surface | 1672 × 941 | `9e43470a8bce016faeee69437f1a811a8d67e62fa04c4c85445c263eeff8ddf3` |
| `route-night-editorial-strip.webp` | text-free painterly city/route density layer | 2048 × 768 | `3685ce9283a384f3726c602d2e05da9fe5f00ba223b6168764145394e8c1cf77` |

The assets were generated as original project art with the built-in OpenAI image-generation tool on 2026-09-18. The canonical Route Night image was used only as a style and production-language reference; no canonical pixels, text, logos, characters, vehicles, commercial artwork, or exact layout were copied. The earlier generated PNG outputs were converted to the committed WebP derivatives at ImageMagick quality 82; the editorial strip was converted at quality 84 without crop or repaint. Full provenance is recorded in `docs/ASSET-PROVENANCE.md`.

The identity-layer title output required deterministic alpha cleanup because the image-generation preview returned a checkerboard instead of usable transparency. The accepted cleanup removes only bright low-chroma neutral pixels, preserves the colored lettering and dark brush silhouette, and was inspected flattened over dark and light backgrounds before WebP conversion. The SVG lockup remains the exact-text fallback and the accessible product name remains live DOM text. The panel texture is opaque and intentionally placed behind responsive live UI at restrained opacity.

The SVG library supplies the exact desktop UI identity without turning responsive labels into fixed raster art: `route-night-title-lockup.svg`, `route-night-mark.svg`, `route-night-ui.svg`, `route-night-button-frames.svg`, `route-night-route-ornaments.svg`, and `route-night-status.svg`. The expanded symbol set adds authored race/minigame/input/signal glyphs, while button frames now carry filled gold-primary and stronger cyan/violet utility states. The library is integrated through `src/ui/routeNight.ts` and used by the Title, Hub, Controls, and Settings views. The library is original repository-authored geometry and contains no copied commercial logos, icons, typography treatments, or exact layouts. File hashes, placements, and usage boundaries are recorded in `docs/ASSET-PROVENANCE.md`.

## Validation evidence

Local validation on the feature branch:

- focused Route Night and app-shell tests: **13 passed**;
- full CI test suite: **66 test files / 525 tests passed**;
- coverage: **81.59% statements / 76.90% branches / 86.65% functions / 83.32% lines**;
- strict TypeScript: passed;
- zero-warning ESLint: passed;
- branding validation: passed;
- runtime-asset validation: passed;
- production build: passed, with the repository's known nonblocking Vite large-chunk warning unchanged.

The canonical reference and generated assets were inspected directly. A local cloud-browser navigation was attempted for title/hub/utility visual inspection, but this Work browser returned `ERR_BLOCKED_BY_CLIENT` for the local Vite URL. Therefore this branch does not claim browser-rendered acceptance. The normal hosted PR/deployment checkpoint must provide the actual desktop/mobile visual review before this increment is accepted.

## Acceptance gate and boundaries

After the normal approval-governed publication flow, the deployed review must verify the title, hub, Controls, and Settings at representative desktop and mobile sizes, including title audio unlock, hub card gating, utility navigation, settings persistence, next-race graphics selection, focus-visible clarity, and reduced-motion behavior.

This checkpoint does not authorize or include Character Select redesign, kart preview, race HUD, mini-map, pause/results screens, race/engine/final-lap audio, post-processing, PBR/material changes, Circuit Alpha topology, racer statistics, item behavior/probability, AI tactics, hosting changes, or Candidate B experiments. Stop at Manny's deployed Route Night visual-acceptance gate.
