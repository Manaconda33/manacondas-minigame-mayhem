export type GraphicsQuality = 'low' | 'medium' | 'high';

export interface GraphicsQualityProfile {
  readonly pixelRatioCap: number;
  readonly shadows: boolean;
  readonly shadowMapSize: 1024 | 2048;
}

export const GRAPHICS_QUALITY_PROFILES: Readonly<Record<GraphicsQuality, GraphicsQualityProfile>> = {
  low: {
    pixelRatioCap: 1,
    shadows: false,
    shadowMapSize: 1024,
  },
  medium: {
    pixelRatioCap: 1.5,
    shadows: true,
    shadowMapSize: 2048,
  },
  high: {
    pixelRatioCap: 2,
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
