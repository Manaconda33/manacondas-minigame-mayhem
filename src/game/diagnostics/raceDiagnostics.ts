import type { BloomSnapshot } from '../rendering/RaceBloom';
import type { MotionBlurSnapshot } from '../rendering/RaceMotionBlur';
import type { GraphicsQuality } from '../../config/graphicsQuality';

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
  scenario: string;
  racerCount: number;
  nominalViewport: { width: number; height: number };
  gpuFrameMs: null;
  jsHeapBytes: number | null;
  jsHeapMethod?: string;
  estimatedTextureBytes: null;
}

export interface RacePerformanceCapture {
  schemaVersion: 1;
  metadata: RaceCaptureMetadata;
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
}
