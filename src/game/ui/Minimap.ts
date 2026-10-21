export interface MinimapPoint {
  x: number;
  y: number;
}

export interface MinimapRacerState {
  id: string;
  name: string;
  progress: number;
  portrait: string;
  isPlayer: boolean;
}

export interface MinimapState {
  track: readonly MinimapPoint[];
  racers: readonly MinimapRacerState[];
}

interface WorldTrackPoint {
  x: number;
  z: number;
}

const roundCoordinate = (value: number): number => Math.round(value * 1000) / 1000;

export function normalizeMinimapTrack(
  samples: readonly WorldTrackPoint[],
  size = 100,
  padding = 8,
  orientation: 'positive-z-up' | 'positive-z-down' = 'positive-z-up',
): MinimapPoint[] {
  if (samples.length === 0) return [];

  const xs = samples.map(({ x }) => x);
  const zs = samples.map(({ z }) => z);
  const minimumX = Math.min(...xs);
  const maximumX = Math.max(...xs);
  const minimumZ = Math.min(...zs);
  const maximumZ = Math.max(...zs);
  const spanX = Math.max(maximumX - minimumX, 0.001);
  const spanZ = Math.max(maximumZ - minimumZ, 0.001);
  const usableSize = Math.max(size - padding * 2, 1);
  const scale = usableSize / Math.max(spanX, spanZ);
  const offsetX = (size - spanX * scale) / 2;
  const offsetY = (size - spanZ * scale) / 2;

  return samples.map(({ x, z }) => ({
    x: roundCoordinate(offsetX + (x - minimumX) * scale),
    y: roundCoordinate(
      offsetY + (orientation === 'positive-z-down' ? z - minimumZ : maximumZ - z) * scale,
    ),
  }));
}

export function minimapPointAtProgress(
  points: readonly MinimapPoint[],
  progress: number,
): MinimapPoint {
  if (points.length === 0) return { x: 50, y: 50 };

  const wrappedProgress = ((progress % 1) + 1) % 1;
  const scaledProgress = wrappedProgress * points.length;
  const firstIndex = Math.floor(scaledProgress) % points.length;
  const secondIndex = (firstIndex + 1) % points.length;
  const mix = scaledProgress - Math.floor(scaledProgress);
  const first = points[firstIndex] ?? points[0] ?? { x: 50, y: 50 };
  const second = points[secondIndex] ?? first;
  return {
    x: roundCoordinate(first.x + (second.x - first.x) * mix),
    y: roundCoordinate(first.y + (second.y - first.y) * mix),
  };
}

export function minimapSvgPath(points: readonly MinimapPoint[]): string {
  if (points.length === 0) return '';
  return `${points
    .map(({ x, y }, index) => `${index === 0 ? 'M' : 'L'} ${String(x)} ${String(y)}`)
    .join(' ')} Z`;
}
