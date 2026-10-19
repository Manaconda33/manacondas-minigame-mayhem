export type NeonGridVisualVariant =
  | 'approved'
  | 'fog-experiment'
  | 'fog-experiment-v2'
  | 'fog-experiment-v3'
  | 'fog-experiment-v3-2'
  | 'fog-experiment-task-a'
  | 'fog-experiment-c2-background';

export function neonGridVisualVariantFromSearch(search: string): NeonGridVisualVariant {
  const params = new URLSearchParams(search);
  const variant = params.get('neonGridVisual');
  if (variant === 'abyss-fog-001') return 'fog-experiment';
  if (variant === 'abyss-fog-002') return 'fog-experiment-v2';
  if (variant === 'abyss-fog-003') return 'fog-experiment-v3';
  if (variant === 'abyss-fog-004') return 'fog-experiment-v3-2';
  if (variant === 'neon-grid-task-a-001') return 'fog-experiment-task-a';
  if (variant === 'c2-task-a-fog-overlay') return 'fog-experiment-c2-background';
  return 'approved';
}
