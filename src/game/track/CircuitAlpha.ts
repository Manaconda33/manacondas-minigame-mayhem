import * as THREE from 'three';
import type { SurfaceType } from '../../config/kartTuning';

export interface TrackProjection {
  index: number;
  progress: number;
  point: THREE.Vector3;
  tangent: THREE.Vector3;
  lateralDistance: number;
  lateralOffset: number;
  surface: SurfaceType;
}

export class CircuitAlpha {
  public readonly roadHalfWidth = 6;
  public readonly sampleCount = 384;
  public readonly startFinishDistance = 22;
  public readonly curve: THREE.CatmullRomCurve3;
  public readonly samples: THREE.Vector3[];
  public readonly tangents: THREE.Vector3[];
  public readonly sampleSpacing: number;
  public readonly checkpointIndices: number[];

  public constructor() {
    const points = [
      new THREE.Vector3(0, 0, -215),
      new THREE.Vector3(150, 0, -205),
      new THREE.Vector3(260, 0, -120),
      new THREE.Vector3(275, 0, 20),
      new THREE.Vector3(220, 0, 150),
      new THREE.Vector3(100, 0, 225),
      new THREE.Vector3(-35, 0, 235),
      new THREE.Vector3(-175, 0, 205),
      new THREE.Vector3(-265, 0, 105),
      new THREE.Vector3(-275, 0, -35),
      new THREE.Vector3(-210, 0, -160),
      new THREE.Vector3(-95, 0, -215),
    ];
    points.forEach((point) => point.multiplyScalar(0.55));

    this.curve = new THREE.CatmullRomCurve3(points, true, 'centripetal', 0.5);
    this.samples = Array.from({ length: this.sampleCount }, (_, index) =>
      this.curve.getPointAt(index / this.sampleCount),
    );
    this.tangents = Array.from({ length: this.sampleCount }, (_, index) =>
      this.curve.getTangentAt(index / this.sampleCount).normalize(),
    );
    this.sampleSpacing = this.curve.getLength() / this.sampleCount;
    this.checkpointIndices = Array.from({ length: 12 }, (_, index) =>
      Math.floor((index * this.sampleCount) / 12),
    );
  }

  public project(position: THREE.Vector3): TrackProjection {
    let nearestIndex = 0;
    let nearestDistanceSq = Number.POSITIVE_INFINITY;

    for (let index = 0; index < this.samples.length; index += 1) {
      const sample = this.samples[index];
      if (sample === undefined) continue;
      const distanceSq = sample.distanceToSquared(position);
      if (distanceSq < nearestDistanceSq) {
        nearestDistanceSq = distanceSq;
        nearestIndex = index;
      }
    }

    const progress = nearestIndex / this.sampleCount;
    const lateralDistance = Math.sqrt(nearestDistanceSq);
    const nearestPoint = this.samples[nearestIndex]?.clone() ?? new THREE.Vector3();
    const nearestTangent = this.tangents[nearestIndex]?.clone() ?? new THREE.Vector3(0, 0, 1);
    const right = new THREE.Vector3(nearestTangent.z, 0, -nearestTangent.x).normalize();
    const lateralOffset = position.clone().sub(nearestPoint).dot(right);
    let surface: SurfaceType = lateralDistance <= this.roadHalfWidth ? 'asphalt' : 'grass';

    if (
      progress >= 0.235 &&
      progress <= 0.315 &&
      lateralOffset >= 1.35 &&
      lateralOffset <= this.roadHalfWidth + 1
    ) {
      surface = 'dirt';
    } else if (
      ((progress >= 0.445 && progress <= 0.458) || (progress >= 0.81 && progress <= 0.823)) &&
      lateralDistance <= 4.5
    ) {
      surface = 'boost';
    } else if (progress >= 0.49 && progress <= 0.51 && lateralDistance <= 4.5) {
      surface = 'ramp';
    }

    return {
      index: nearestIndex,
      progress,
      point: nearestPoint,
      tangent: nearestTangent,
      lateralDistance,
      lateralOffset,
      surface,
    };
  }

  public checkpointPosition(index: number): THREE.Vector3 {
    const sampleIndex = this.checkpointIndices[index] ?? 0;
    return this.samples[sampleIndex]?.clone() ?? new THREE.Vector3();
  }

  public lapCheckpointPosition(index: number): THREE.Vector3 {
    if (index === 0) {
      return this.curve.getPointAt(this.startFinishDistance / this.curve.getLength());
    }
    return this.checkpointPosition(index);
  }

  public lapCheckpointProgress(index: number): number {
    if (index === 0) return this.startFinishDistance / this.curve.getLength();
    return (this.checkpointIndices[index] ?? 0) / this.sampleCount;
  }

  public lapCheckpointTangent(index: number): THREE.Vector3 {
    if (index === 0)
      return this.curve.getTangentAt(this.startFinishDistance / this.curve.getLength()).normalize();
    return this.checkpointTangent(index);
  }

  public checkpointTangent(index: number): THREE.Vector3 {
    const sampleIndex = this.checkpointIndices[index] ?? 0;
    return this.tangents[sampleIndex]?.clone() ?? new THREE.Vector3(0, 0, 1);
  }
}
