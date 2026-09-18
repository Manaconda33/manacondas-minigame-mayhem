const ROUTE_NIGHT_ASSET_VERSION = '20260918-3';

const ROUTE_NIGHT_ASSETS = {
  'title-hero': 'route-night-title-hero.webp',
  'circuit-alpha-card': 'circuit-alpha-route-card.webp',
  'title-lockup': 'route-night-title-lockup.svg',
  'title-lockup-brush': 'route-night-title-lockup-brush.webp',
  'panel-texture': 'route-night-panel-texture.webp',
  mark: 'route-night-mark.svg',
  'ui-sprite': 'route-night-ui.svg',
  'button-frames': 'route-night-button-frames.svg',
  'route-ornaments': 'route-night-route-ornaments.svg',
  status: 'route-night-status.svg',
} as const;

export type RouteNightAsset = keyof typeof ROUTE_NIGHT_ASSETS;

export type RouteNightIcon =
  | 'play'
  | 'controls'
  | 'settings'
  | 'back'
  | 'arrow'
  | 'audio'
  | 'graphics'
  | 'lock'
  | 'route'
  | 'checkpoint'
  | 'node';

export type RouteNightButtonFrame = 'primary' | 'utility' | 'secondary' | 'disabled';

export type RouteNightOrnament = 'arc' | 'branch' | 'checkpoint' | 'divider';

export type RouteNightStatus = 'live' | 'audio' | 'locked' | 'system';

export function routeNightAssetUrl(asset: RouteNightAsset): string {
  return `${import.meta.env.BASE_URL}assets/ui/route-night/${ROUTE_NIGHT_ASSETS[asset]}?v=${ROUTE_NIGHT_ASSET_VERSION}`;
}

export function routeNightIconMarkup(icon: RouteNightIcon, className = ''): string {
  return `<svg class="route-icon${className === '' ? '' : ` ${className}`}" data-route-icon="${icon}" aria-hidden="true" focusable="false" viewBox="0 0 24 24"><use href="${routeNightAssetUrl('ui-sprite')}#icon-${icon}"></use></svg>`;
}

export function routeNightButtonFrameMarkup(frame: RouteNightButtonFrame): string {
  return `<svg class="route-button-frame" aria-hidden="true" focusable="false" viewBox="0 0 360 84" preserveAspectRatio="none"><use href="${routeNightAssetUrl('button-frames')}#frame-${frame}"></use></svg>`;
}

export function routeNightOrnamentMarkup(
  ornament: RouteNightOrnament,
  className = '',
): string {
  return `<svg class="route-ornament${className === '' ? '' : ` ${className}`}" data-route-ornament="${ornament}" aria-hidden="true" focusable="false" viewBox="0 0 ${ornament === 'arc' ? '520 180' : ornament === 'branch' ? '420 120' : ornament === 'checkpoint' ? '180 180' : '420 28'}"><use href="${routeNightAssetUrl('route-ornaments')}#ornament-${ornament}"></use></svg>`;
}

export function routeNightStatusMarkup(status: RouteNightStatus, className = ''): string {
  return `<svg class="route-status-icon${className === '' ? '' : ` ${className}`}" data-route-status="${status}" aria-hidden="true" focusable="false" viewBox="0 0 24 24"><use href="${routeNightAssetUrl('status')}#status-${status}"></use></svg>`;
}
