# Route Night UI asset library

This is the authored desktop UI asset package for the bounded Route Night Title, Hub, Controls, and Settings increment. It is intentionally hybrid: atmospheric scenes remain raster art, while names, controls, buttons, symbols, and route grammar remain crisp SVG/DOM assets that can be placed at responsive sizes.

## Asset map

| Asset | Use |
| --- | --- |
| `public/assets/ui/route-night/route-night-title-hero.webp` | Full-bleed cinematic title/hub atmosphere with title-safe negative space |
| `public/assets/ui/route-night/circuit-alpha-route-card.webp` | Playable Circuit Alpha route card art |
| `public/assets/ui/route-night/route-night-title-lockup.svg` | Exact product-name title lockup |
| `public/assets/ui/route-night/route-night-mark.svg` | Compact route/token brand mark |
| `public/assets/ui/route-night/route-night-ui.svg` | Reusable icon symbol library |
| `public/assets/ui/route-night/route-night-button-frames.svg` | Reusable clipped button-frame symbols |
| `public/assets/ui/route-night/route-night-route-ornaments.svg` | Route arcs, branches, checkpoint rings, and dividers |
| `public/assets/ui/route-night/route-night-status.svg` | Live, audio, locked, and system status markers |

## Symbol inventory

`route-night-ui.svg` contains `icon-play`, `icon-controls`, `icon-settings`, `icon-back`, `icon-arrow`, `icon-audio`, `icon-graphics`, `icon-lock`, `icon-route`, `icon-checkpoint`, and `icon-node`.

`route-night-button-frames.svg` contains `frame-primary`, `frame-utility`, `frame-secondary`, and `frame-disabled`.

`route-night-route-ornaments.svg` contains `ornament-arc`, `ornament-branch`, `ornament-checkpoint`, and `ornament-divider`.

`route-night-status.svg` contains `status-live`, `status-audio`, `status-locked`, and `status-system`.

## Runtime usage

Use the helpers in `src/ui/routeNight.ts` rather than hard-coding public paths. They add the Vite base path and a revision query string:

```ts
routeNightAssetUrl('title-lockup');
routeNightIconMarkup('play');
routeNightButtonFrameMarkup('primary');
routeNightOrnamentMarkup('checkpoint');
routeNightStatusMarkup('live');
```

Button labels, menu names, settings copy, and accessible text remain live DOM content. The SVG files provide visual identity, not interaction or state ownership. CSS owns responsive sizing, gold/cyan focus states, clipping, hover/pressed behavior, and reduced-motion fallback.

## Boundaries

The library is original to Manaconda's Minigame Mayhem and uses the canonical Route Night reference only as a style and production-language reference. It does not copy commercial racing-game logos, icons, exact layouts, typography treatments, proprietary artwork, or trade dress. Character Select, race HUD, pause/results, kart preview, and gameplay presentation remain outside this increment.

Hashes and provenance are recorded in [`docs/ASSET-PROVENANCE.md`](ASSET-PROVENANCE.md).
