import * as THREE from 'three';
import layout from './neonGridLayout.json';
import type { TrackDefinition, TrackProjection } from './TrackDefinition';

/** Approved main-route blockout. Shortcuts are integrated in Stage 3. */
export class NeonGrid implements TrackDefinition {
  public readonly id = 'neon-grid' as const;
  public readonly roadHalfWidth = 6;
  public readonly sampleCount = 384;
  public readonly startFinishDistance = 22;
  public readonly checkpointHeightTolerance = 1.5;
  public readonly curve: THREE.CatmullRomCurve3;
  public readonly samples: THREE.Vector3[];
  public readonly tangents: THREE.Vector3[];
  public readonly sampleSpacing: number;
  public readonly checkpointIndices = [...layout.checkpointIndices];

  public constructor() {
    this.curve = new THREE.CatmullRomCurve3(
      layout.controlPoints.map(([x = 0, y = 0, z = 0]) => new THREE.Vector3(x, y, z)),
      true,
      'centripetal',
      0.5,
    );
    this.samples = Array.from({ length: this.sampleCount }, (_, i) =>
      this.curve.getPointAt(i / this.sampleCount),
    );
    this.tangents = Array.from({ length: this.sampleCount }, (_, i) =>
      this.curve.getTangentAt(i / this.sampleCount).normalize(),
    );
    this.sampleSpacing = this.curve.getLength() / this.sampleCount;
  }

  public halfWidthAt(progress: number): number {
    const p = THREE.MathUtils.euclideanModulo(progress, 1);
    const start = layout.sectors[1]?.start ?? 0.24655;
    const end = layout.sectors[1]?.end ?? 0.46154;
    const blend = 10 / this.curve.getLength();
    if (p < start - blend || p > end + blend) return 6;
    if (p < start + blend) return THREE.MathUtils.lerp(6, 4.5, (p - start + blend) / (2 * blend));
    if (p > end - blend) return THREE.MathUtils.lerp(4.5, 6, (p - end + blend) / (2 * blend));
    return 4.5;
  }

  public boundaryHalfWidthAt(projection: TrackProjection): number {
    return this.halfWidthAt(projection.progress);
  }

  public project(position: THREE.Vector3): TrackProjection {
    // Continuous 3D segment projection disambiguates stacked roads. Lateral
    // width remains horizontal so suspension clearance cannot become off-road.
    let bestDistance = Infinity;
    let bestIndex = 0;
    let bestFraction = 0;
    const nearest = new THREE.Vector3();
    const edge = new THREE.Vector3();
    const offset = new THREE.Vector3();
    const point = new THREE.Vector3();
    for (let i = 0; i < this.sampleCount; i++) {
      const a = this.samples[i] ?? new THREE.Vector3();
      const b = this.samples[(i + 1) % this.sampleCount] ?? new THREE.Vector3();
      edge.subVectors(b, a);
      const f = THREE.MathUtils.clamp(
        offset.subVectors(position, a).dot(edge) / edge.lengthSq(),
        0,
        1,
      );
      point.copy(a).addScaledVector(edge, f);
      const distance = position.distanceToSquared(point);
      if (distance < bestDistance) {
        bestDistance = distance;
        bestIndex = i;
        bestFraction = f;
        nearest.copy(point);
      }
    }
    const progress = ((bestIndex + bestFraction) / this.sampleCount) % 1;
    const tangent = this.curve.getTangentAt(progress).normalize();
    const right = new THREE.Vector3(tangent.z, 0, -tangent.x).normalize();
    const lateralOffset = position.clone().sub(nearest).dot(right);
    const lateralDistance = Math.abs(lateralOffset);
    let surface: TrackProjection['surface'] =
      lateralDistance <= this.halfWidthAt(progress) ? 'asphalt' : 'grass';
    if (
      layout.boostPadCenters.some((center) => Math.abs(progress - center) <= 0.0075) &&
      lateralDistance <= 4.5
    )
      surface = 'boost';
    return {
      index: bestIndex,
      progress,
      point: nearest,
      tangent,
      lateralOffset,
      lateralDistance,
      surface,
    };
  }

  public checkpointPosition(index: number): THREE.Vector3 {
    return this.samples[this.checkpointIndices[index] ?? 0]?.clone() ?? new THREE.Vector3();
  }
  public checkpointTangent(index: number): THREE.Vector3 {
    return this.tangents[this.checkpointIndices[index] ?? 0]?.clone() ?? new THREE.Vector3(0, 0, 1);
  }
  public lapCheckpointProgress(index: number): number {
    return index === 0
      ? this.startFinishDistance / this.curve.getLength()
      : (this.checkpointIndices[index] ?? 0) / this.sampleCount;
  }
  public lapCheckpointPosition(index: number): THREE.Vector3 {
    return this.curve.getPointAt(this.lapCheckpointProgress(index));
  }
  public lapCheckpointTangent(index: number): THREE.Vector3 {
    return this.curve.getTangentAt(this.lapCheckpointProgress(index)).normalize();
  }
}
