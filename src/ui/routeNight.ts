import type { ItemId } from '../game/items/itemDefinitions';

const ROUTE_NIGHT_ASSET_VERSION = '20260925-1';

const ROUTE_NIGHT_ASSETS = {
  'title-hero': 'route-night-title-hero.webp',
  'circuit-alpha-card': 'circuit-alpha-route-card.webp',
  'title-lockup': 'route-night-title-lockup.svg',
  'title-lockup-brush': 'route-night-title-lockup-brush.webp',
  'panel-texture': 'route-night-panel-texture.webp',
  'editorial-strip': 'route-night-editorial-strip.webp',
  'character-select-bay': 'route-night-character-select-bay.webp',
  'character-select-energy': 'route-night-character-select-energy.webp',
  'character-select-hero-aura': 'route-night-character-select-hero-aura.webp',
  'race-hud-atmosphere': 'race-hud-atmosphere.webp',
  'results-podium-backdrop': 'results-podium-backdrop.webp',
  'race-hud': 'route-night-race-hud.svg',
  mark: 'route-night-mark.svg',
  'ui-sprite': 'route-night-ui.svg',
  'button-frames': 'route-night-button-frames.svg',
  'route-ornaments': 'route-night-route-ornaments.svg',
  status: 'route-night-status.svg',
} as const;

export type RouteNightAsset = keyof typeof ROUTE_NIGHT_ASSETS;

export type RouteNightIcon =
  | 'play'
  | 'race'
  | 'minigames'
  | 'controls'
  | 'settings'
  | 'back'
  | 'arrow'
  | 'audio'
  | 'signal'
  | 'input'
  | 'graphics'
  | 'lock'
  | 'route'
  | 'checkpoint'
  | 'node';

export type RouteNightButtonFrame = 'primary' | 'utility' | 'secondary' | 'disabled';

export type RouteNightOrnament = 'arc' | 'branch' | 'checkpoint' | 'divider';

export type RouteNightStatus = 'live' | 'audio' | 'locked' | 'system';

export type RouteNightNodeState = 'live' | 'next' | 'locked';

export type RouteNightRaceHudSymbol =
  | 'frame-panel'
  | 'frame-panel-wide'
  | 'frame-item'
  | 'frame-warning'
  | 'frame-minimap'
  | 'gauge-drift'
  | 'gauge-speed'
  | 'badge-placement';

const ROUTE_NIGHT_RACE_HUD_VIEWBOX: Readonly<Record<RouteNightRaceHudSymbol, string>> = {
  'frame-panel': '0 0 520 180',
  'frame-panel-wide': '0 0 760 180',
  'frame-item': '0 0 220 220',
  'frame-warning': '0 0 560 84',
  'frame-minimap': '0 0 480 480',
  'gauge-drift': '0 0 560 110',
  'gauge-speed': '0 0 360 220',
  'badge-placement': '0 0 160 160',
};

export function routeNightAssetUrl(asset: RouteNightAsset): string {
  return `${import.meta.env.BASE_URL}assets/ui/route-night/${ROUTE_NIGHT_ASSETS[asset]}?v=${ROUTE_NIGHT_ASSET_VERSION}`;
}

export function routeNightItemAssetUrl(itemId: ItemId): string {
  return `${import.meta.env.BASE_URL}assets/items/route-night/${itemId}.png?v=${ROUTE_NIGHT_ASSET_VERSION}`;
}

export function routeNightRaceHudSymbolUrl(symbol: RouteNightRaceHudSymbol): string {
  return `${routeNightAssetUrl('race-hud')}#${symbol}`;
}

export function routeNightRaceHudMarkup(symbol: RouteNightRaceHudSymbol, className = ''): string {
  return `<svg class="race-hud-vector${className === '' ? '' : ` ${className}`}" data-race-symbol="${symbol}" aria-hidden="true" focusable="false" viewBox="${ROUTE_NIGHT_RACE_HUD_VIEWBOX[symbol]}" preserveAspectRatio="none"><use href="${routeNightRaceHudSymbolUrl(symbol)}"></use></svg>`;
}

export function routeNightIconMarkup(icon: RouteNightIcon, className = ''): string {
  return `<svg class="route-icon${className === '' ? '' : ` ${className}`}" data-route-icon="${icon}" aria-hidden="true" focusable="false" viewBox="0 0 24 24"><use href="${routeNightAssetUrl('ui-sprite')}#icon-${icon}"></use></svg>`;
}

export function routeNightButtonFrameMarkup(frame: RouteNightButtonFrame): string {
  return `<svg class="route-button-frame" data-route-frame="${frame}" aria-hidden="true" focusable="false" viewBox="0 0 360 84" preserveAspectRatio="none"><use href="${routeNightAssetUrl('button-frames')}#frame-${frame}"></use></svg>`;
}

export function routeNightNodeMarkup(node: string, state: RouteNightNodeState = 'next'): string {
  return `<span class="route-node route-node-${state}" data-route-node="${node}" data-route-node-state="${state}" aria-hidden="true"><span>${node}</span></span>`;
}

export function routeNightOrnamentMarkup(ornament: RouteNightOrnament, className = ''): string {
  return `<svg class="route-ornament${className === '' ? '' : ` ${className}`}" data-route-ornament="${ornament}" aria-hidden="true" focusable="false" viewBox="0 0 ${ornament === 'arc' ? '520 180' : ornament === 'branch' ? '420 120' : ornament === 'checkpoint' ? '180 180' : '420 28'}"><use href="${routeNightAssetUrl('route-ornaments')}#ornament-${ornament}"></use></svg>`;
}

export function routeNightStatusMarkup(status: RouteNightStatus, className = ''): string {
  return `<svg class="route-status-icon${className === '' ? '' : ` ${className}`}" data-route-status="${status}" aria-hidden="true" focusable="false" viewBox="0 0 24 24"><use href="${routeNightAssetUrl('status')}#status-${status}"></use></svg>`;
}
