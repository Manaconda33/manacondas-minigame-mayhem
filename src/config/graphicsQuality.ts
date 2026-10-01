export type GraphicsQuality = 'low' | 'medium' | 'high';

export interface GraphicsQualityProfile {
  readonly pixelRatioCap: number;
  readonly bloom: {
    readonly scale: 0.5;
    readonly maxEdge: 768 | 1024;
    readonly radius: 2 | 3;
    readonly gain: number;
  } | null;
  readonly driftParticleCapacity: 48 | 96 | 144;
  readonly dustParticleCapacity: 32 | 64 | 96;
  readonly speedLineCapacity: 6 | 10 | 14;
  readonly exhaustInstanceCapacity: 24 | 48 | 72;
  readonly shadows: boolean;
  readonly shadowMapSize: 1024 | 2048;
}

export const GRAPHICS_QUALITY_PROFILES: Readonly<Record<GraphicsQuality, GraphicsQualityProfile>> =
  {
    low: {
      pixelRatioCap: 1,
      bloom: null,
      driftParticleCapacity: 48,
      dustParticleCapacity: 32,
      speedLineCapacity: 6,
      exhaustInstanceCapacity: 24,
      shadows: false,
      shadowMapSize: 1024,
    },
    medium: {
      pixelRatioCap: 1.5,
      bloom: { scale: 0.5, maxEdge: 768, radius: 2, gain: 0.18 },
      driftParticleCapacity: 96,
      dustParticleCapacity: 64,
      speedLineCapacity: 10,
      exhaustInstanceCapacity: 48,
      shadows: true,
      shadowMapSize: 2048,
    },
    high: {
      pixelRatioCap: 2,
      bloom: { scale: 0.5, maxEdge: 1024, radius: 3, gain: 0.24 },
      driftParticleCapacity: 144,
      dustParticleCapacity: 96,
      speedLineCapacity: 14,
      exhaustInstanceCapacity: 72,
      shadows: true,
      shadowMapSize: 2048,
    },
  };

export function isGraphicsQuality(value: unknown): value is GraphicsQuality {
  return value === 'low' || value === 'medium' || value === 'high';
}

export function graphicsQualityProfile(quality: GraphicsQuality): GraphicsQualityProfile {
  return GRAPHICS_QUALITY_PROFILES[quality];
}
