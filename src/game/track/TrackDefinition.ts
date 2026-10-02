import type * as THREE from 'three';
import type { SurfaceType } from '../../config/kartTuning';

export type TrackId = 'circuit-alpha' | 'neon-grid';

export interface TrackProjection {
  index: number;
  progress: number;
  point: THREE.Vector3;
  tangent: THREE.Vector3;
  lateralDistance: number;
  lateralOffset: number;
  surface: SurfaceType;
  pathId?: 'billboard-gap' | 'service-tunnel' | 'waterfall-dive';
}

/** Shared race topology. Rendering/collision remain owned by each route. */
export interface TrackDefinition {
  readonly id: TrackId;
  readonly roadHalfWidth: number;
  readonly sampleCount: number;
  readonly startFinishDistance: number;
  readonly curve: THREE.CatmullRomCurve3;
  readonly samples: THREE.Vector3[];
  readonly tangents: THREE.Vector3[];
  readonly sampleSpacing: number;
  readonly checkpointIndices: number[];
  readonly checkpointHeightTolerance?: number;
  project(position: THREE.Vector3): TrackProjection;
  halfWidthAt(progress: number): number;
  boundaryHalfWidthAt(projection: TrackProjection): number | null;
  checkpointPosition(index: number): THREE.Vector3;
  checkpointTangent(index: number): THREE.Vector3;
  lapCheckpointPosition(index: number): THREE.Vector3;
  lapCheckpointProgress(index: number): number;
  lapCheckpointTangent(index: number): THREE.Vector3;
}
