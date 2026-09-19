# Route Night UI asset library

This is the desktop UI asset package for the bounded Route Night Title, Hub, Controls, Settings, and Race HUD/minimap increments. It is intentionally hybrid: expressive atmosphere and editorial-density layers use original raster art, while names, controls, buttons, symbols, live HUD values, and route grammar remain crisp SVG/DOM assets that can be placed at responsive sizes.

## Rendered visual QA sheet

The production SVGs and selected raster layers are rendered below at desktop review scale so the visual language can be inspected without opening source code. The PNG is a review artifact; the source assets in `public/assets/ui/route-night/` remain the production assets.

![Rendered Route Night UI asset library](reference/route-night/ROUTE-NIGHT-UI-ASSET-LIBRARY-PREVIEW.png)

## Asset map

| Asset | Use |
| --- | --- |
| `public/assets/ui/route-night/route-night-title-hero.webp` | Full-bleed cinematic title/hub atmosphere with title-safe negative space |
| `public/assets/ui/route-night/circuit-alpha-route-card.webp` | Playable Circuit Alpha route card art |
| `public/assets/ui/route-night/route-night-title-lockup-brush.webp` | Original painterly product-name treatment for the title screen; SVG remains the exact-text fallback |
| `public/assets/ui/route-night/route-night-panel-texture.webp` | Original opaque Route Night route/checkpoint surface used as a restrained layer behind title, hub, controls, and settings |
| `public/assets/ui/route-night/route-night-editorial-strip.webp` | Original text-free brush/city/route density layer used behind the shared screen composition and utility panels |
| `public/assets/ui/route-night/race-hud-atmosphere.webp` | Approved text-free race atmosphere overlay with HUD-safe negative space; decorative only |
| `public/assets/ui/route-night/route-night-title-lockup.svg` | Exact product-name title lockup |
| `public/assets/ui/route-night/route-night-mark.svg` | Compact route/token brand mark |
| `public/assets/ui/route-night/route-night-ui.svg` | Reusable icon symbol library |
| `public/assets/ui/route-night/route-night-button-frames.svg` | Reusable clipped button-frame symbols |
| `public/assets/ui/route-night/route-night-route-ornaments.svg` | Route arcs, branches, checkpoint rings, and dividers |
| `public/assets/ui/route-night/route-night-status.svg` | Live, audio, locked, and system status markers |
| `public/assets/ui/route-night/route-night-race-hud.svg` | Reusable race HUD panel, item, minimap, warning, gauge, and placement-frame symbols |

## Symbol inventory

`route-night-ui.svg` contains `icon-play`, `icon-race`, `icon-minigames`, `icon-controls`, `icon-settings`, `icon-back`, `icon-arrow`, `icon-audio`, `icon-signal`, `icon-input`, `icon-graphics`, `icon-lock`, `icon-route`, `icon-checkpoint`, and `icon-node`.

`route-night-button-frames.svg` contains `frame-primary`, `frame-utility`, `frame-secondary`, and `frame-disabled`.

`route-night-route-ornaments.svg` contains `ornament-arc`, `ornament-branch`, `ornament-checkpoint`, and `ornament-divider`.

`route-night-status.svg` contains `status-live`, `status-audio`, `status-locked`, and `status-system`.

`route-night-race-hud.svg` contains `frame-panel`, `frame-panel-wide`, `frame-item`, `frame-warning`, `frame-minimap`, `gauge-drift`, `gauge-speed`, and `badge-placement`. It is deliberately text-free: live values, item names, warnings, racer portraits, and minimap topology remain DOM/SVG-owned.

## Runtime usage

Use the helpers in `src/ui/routeNight.ts` rather than hard-coding public paths. They add the Vite base path and a revision query string:

```ts
routeNightAssetUrl('title-lockup');
routeNightAssetUrl('title-lockup-brush');
routeNightAssetUrl('panel-texture');
routeNightAssetUrl('editorial-strip');
routeNightAssetUrl('race-hud-atmosphere');
routeNightAssetUrl('race-hud');
routeNightItemAssetUrl('shockwave');
routeNightRaceHudMarkup('frame-panel');
routeNightIconMarkup('play');
routeNightButtonFrameMarkup('primary');
routeNightNodeMarkup('01', 'live');
routeNightOrnamentMarkup('checkpoint');
routeNightStatusMarkup('live');
```

Button labels, menu names, settings copy, and accessible text remain live DOM content. The SVG files provide visual identity, not interaction or state ownership. CSS owns responsive sizing, gold/cyan focus states, clipping, hover/pressed behavior, and reduced-motion fallback.

## Boundaries

The library is original to Manaconda's Minigame Mayhem and uses the canonical Route Night reference only as a style and production-language reference. It does not copy commercial racing-game logos, icons, exact layouts, typography treatments, proprietary artwork, or trade dress. Character Select, pause/results, kart preview, and gameplay presentation remain outside this asset-library increment; the Race HUD/minimap surface is documented below.

Hashes and provenance are recorded in [`docs/ASSET-PROVENANCE.md`](ASSET-PROVENANCE.md).

## Race HUD / Circuit Alpha minimap package — Slice 6A

The Slice 6A review of the canonical Route Night target identified three asset classes:

- Reuse the approved `race-hud-atmosphere.webp`, the fifteen existing Route Night item PNGs, the existing racer portrait/driver assets, and the existing Route Night icon/frame/ornament libraries.
- Author the missing exact UI geometry outside ImageGen as `route-night-race-hud.svg`. Its symbols provide the visual frame language for panels, the held-item card, minimap, speed/drift gauges, warning treatment, and placement badge without owning copy or state.
- Keep live race values, item phase/name/charges, racer markers, Circuit Alpha topology, warnings, responsive placement, fallback behavior, and accessibility in DOM/CSS/SVG runtime code.

`src/app/raceHud.ts` composes the existing game shell with those authored vector surfaces. `src/app/itemHud.ts` maps the live held-item ID to its approved PNG and retains the text/icon fallback. `src/app/raceMinimap.ts` places the authored frame beneath the existing live track path and racer markers. Results/Podium artwork and transition behavior are not part of this package.
