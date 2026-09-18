const ROUTE_NIGHT_ASSET_VERSION = '20260918-1';

const ROUTE_NIGHT_ASSETS = {
  'title-hero': 'route-night-title-hero.webp',
  'circuit-alpha-card': 'circuit-alpha-route-card.webp',
} as const;

export type RouteNightAsset = keyof typeof ROUTE_NIGHT_ASSETS;

export function routeNightAssetUrl(asset: RouteNightAsset): string {
  return `${import.meta.env.BASE_URL}assets/ui/route-night/${ROUTE_NIGHT_ASSETS[asset]}?v=${ROUTE_NIGHT_ASSET_VERSION}`;
}
