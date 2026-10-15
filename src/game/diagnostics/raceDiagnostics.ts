import type { BloomSnapshot } from '../rendering/RaceBloom';
import type { MotionBlurSnapshot } from '../rendering/RaceMotionBlur';
import type { GraphicsQuality } from '../../config/graphicsQuality';
import type { RenderPassFrameSample } from './RenderPassInstrumentation';

export function racePerformanceFromSearch(search: string): boolean {
  return new URLSearchParams(search).get('testRacePerf') === '1';
}

export interface RendererCounterSnapshot {
  drawCalls: number;
  triangles: number;
  geometries: number;
  textures: number;
  width: number;
  height: number;
  pixelRatio: number;
}

export interface RaceFrameObservation {
  rawFrameMs: number;
  phase: 'countdown' | 'racing' | 'finished';
  paused: boolean;
  hidden: boolean;
  boundary: boolean;
  counters: RendererCounterSnapshot | null;
  renderPasses?: RenderPassFrameSample | null;
}

export interface RaceRenderingMetadata {
  schemaVersion: 1;
  trackId: string | null;
  visualVariant: string | null;
  actualDrawingBuffer: { width: number; height: number } | null;
  devicePixelRatio: number | null;
  rendererPixelRatio: number | null;
  deviceEnvironment: {
    classification: 'softwareDetected' | 'unknown';
    explanation: string;
  };
  camera: {
    fixture: 'chase' | 'rearView';
    position: readonly [number, number, number];
    quaternion: readonly [number, number, number, number];
    near: number;
    far: number;
  } | null;
  sectorProgress: {
    lap: number | null;
    trackProgress: number | null;
    sectorIndex: number | null;
    sectorName: string | null;
  };
  racerRoster: readonly { id: string; characterId: string | null }[];
  itemEffectState: {
    activeProjectiles: number | null;
    activeHazards: number | null;
    racers: readonly {
      id: string;
      heldItem: { itemId: string; remainingCharges: number } | null;
      frostStacks: number;
      spinoutId: string | null;
      activeBoostLabel: string | null;
      nitroOverdriveActive: boolean | null;
      hyperDriveRocketActive: boolean | null;
    }[];
  };
  configuration: {
    shadows: {
      enabled: boolean | null;
      mapType: number | null;
      dynamicCasterCount: null;
    };
    bloom: BloomSnapshot | null;
    motionBlur: MotionBlurSnapshot | null;
  };
  unavailableMetrics: readonly string[];
}

export interface RacePerformanceSnapshot {
  scoredFrames: number;
  eligibleFrames: number;
  skippedFrames: number;
  durationMs: number;
  medianFrameMs: number | null;
  p95FrameMs: number | null;
  maxFrameMs: number | null;
  medianFps: number | null;
  over50msFrames: number;
  longestOver50msRun: number;
  truncated: boolean;
  maxDrawCalls: number | null;
  maxTriangles: number | null;
}

export interface RaceCaptureMetadata {
  schemaVersion: 1;
  sourceCommit: string | null;
  bloom?: BloomSnapshot;
  motionBlur?: MotionBlurSnapshot;
  capturedAt: string;
  quality: GraphicsQuality;
  userAgent: string;
  hardwareDescription: string | null;
  /** Best-effort WebGL renderer identifier, never proof of representative hardware alone. */
  gpuRenderer?: string | null;
  scenario: string;
  racerCount: number;
  nominalViewport: { width: number; height: number };
  gpuFrameMs: null;
  jsHeapBytes: number | null;
  jsHeapMethod?: string;
  estimatedTextureBytes: null;
  rendering?: RaceRenderingMetadata;
}

export interface RacePerformanceCapture {
  schemaVersion: 1;
  metadata: RaceCaptureMetadata & { rendering: RaceRenderingMetadata };
  summary: RacePerformanceSnapshot;
  samples: readonly { rawFrameMs: number; counters: RendererCounterSnapshot | null }[];
  raceCompleted: boolean;
  policies: {
    warmupFrames: number;
    maxSamples: number;
    percentileMethod: 'nearest-rank';
    medianMethod: 'mean-of-center-pair';
    excluded: 'countdown,pause,hidden,boundary,invalid';
  };
  unavailableMetrics: readonly string[];
  renderPasses: {
    schemaVersion: 1;
    samplingPolicy: {
      scoredFrameInterval: 10;
      maximumSamples: number;
      firstScoredFrameIndex: 0;
    };
    samples: readonly {
      scoredFrameIndex: number;
      frame: RenderPassFrameSample;
    }[];
    attributionDefinitions: readonly string[];
    unavailableMetrics: readonly string[];
  };
}
