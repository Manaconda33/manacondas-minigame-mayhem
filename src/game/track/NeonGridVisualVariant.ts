export type NeonGridVisualVariant = 'approved' | 'fog-experiment';

export function neonGridVisualVariantFromSearch(search: string): NeonGridVisualVariant {
  const params = new URLSearchParams(search);
  return params.get('neonGridVisual') === 'abyss-fog-001' ? 'fog-experiment' : 'approved';
}
