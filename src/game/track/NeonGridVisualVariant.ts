export type NeonGridVisualVariant = 'approved' | 'fog-experiment' | 'fog-experiment-v2';

export function neonGridVisualVariantFromSearch(search: string): NeonGridVisualVariant {
  const params = new URLSearchParams(search);
  const variant = params.get('neonGridVisual');
  if (variant === 'abyss-fog-001') return 'fog-experiment';
  if (variant === 'abyss-fog-002') return 'fog-experiment-v2';
  return 'approved';
}
