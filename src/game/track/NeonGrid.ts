import * as THREE from 'three';
import layout from './neonGridLayout.json';
import { ServiceTunnel } from './ServiceTunnel';
import { TrackSegmentIndex } from './TrackSegmentIndex';
import type { TrackDefinition, TrackProjection, TrackNavigation } from './TrackDefinition';

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

  public readonly serviceTunnel: ServiceTunnel;

  private readonly segmentIndex: TrackSegmentIndex;
  private readonly projectionCache = new Map<string, TrackProjection>();

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
    this.segmentIndex = new TrackSegmentIndex(this.samples);
    this.sampleSpacing = this.curve.getLength() / this.sampleCount;
    this.serviceTunnel = new ServiceTunnel(this);
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

  public boundaryHalfWidthAt(projection: TrackProjection): number | null {
    if (projection.pathId === 'service-tunnel')
      return this.serviceTunnel.fraction(projection) * this.serviceTunnel.curve.getLength() >
        this.serviceTunnel.curve.getLength() - 9
        ? null
        : this.serviceTunnel.roadHalfWidth;
    const right = new THREE.Vector3(projection.tangent.z, 0, -projection.tangent.x).normalize();
    const position = projection.point.clone().addScaledVector(right, projection.lateralOffset);
    if (this.serviceTunnel.junctionContains(position)) return null;
    return this.halfWidthAt(projection.progress);
  }

  public projectSurface(position: THREE.Vector3): TrackProjection {
    const main = this.projectMain(position);
    const tunnel = this.serviceTunnel.project(position, this.sampleCount);
    // Stateless surface queries may inspect underground art/ground. Racer
    // traversal uses projectMain until a physical forward mouth crossing.
    if (
      tunnel.lateralDistance <= this.serviceTunnel.roadHalfWidth &&
      Math.abs(position.y - tunnel.point.y) < 3 &&
      tunnel.point.y < -0.5 &&
      position.distanceToSquared(tunnel.point) < position.distanceToSquared(main.point)
    )
      return tunnel;
    return main;
  }

  public surfaceNavigationAt(projection: TrackProjection, distance: number): TrackNavigation {
    const tunnel = this.serviceTunnel;
    if (projection.pathId === tunnel.id) {
      const d = tunnel.fraction(projection) * tunnel.curve.getLength() + distance;
      if (d <= tunnel.curve.getLength())
        return {
          point: tunnel.curve.getPointAt(d / tunnel.curve.getLength()),
          tangent: tunnel.curve.getTangentAt(d / tunnel.curve.getLength()),
          halfWidth: tunnel.roadHalfWidth,
          pathId: tunnel.id,
        };
      const p = tunnel.exitProgress + (d - tunnel.curve.getLength()) / this.curve.getLength();
      return {
        point: this.curve.getPointAt(p),
        tangent: this.curve.getTangentAt(p),
        halfWidth: this.halfWidthAt(p),
      };
    }
    const p = (projection.progress + distance / this.curve.getLength()) % 1;
    return {
      point: this.curve.getPointAt(p),
      tangent: this.curve.getTangentAt(p),
      halfWidth: this.halfWidthAt(p),
    };
  }

  public project(position: THREE.Vector3): TrackProjection {
    return this.projectMain(position);
  }

  public projectMain(position: THREE.Vector3): TrackProjection {
    // Exact coordinates make repeated queries safe across pre/post physics,
    // rail correction, respawn and camera phases. Never round moving positions.
    const key = `${String(position.x)},${String(position.y)},${String(position.z)}`;
    const cached = this.projectionCache.get(key);
    if (cached) return this.copyProjection(cached);
    const {
      index: bestIndex,
      fraction: bestFraction,
      point: nearest,
    } = this.segmentIndex.nearest(position);
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
    const result: TrackProjection = {
      index: bestIndex,
      progress,
      point: nearest,
      tangent,
      lateralOffset,
      lateralDistance,
      surface,
    };
    if (this.projectionCache.size >= 64) {
      const oldest = this.projectionCache.keys().next().value;
      if (oldest !== undefined) this.projectionCache.delete(oldest);
    }
    this.projectionCache.set(key, result);
    return this.copyProjection(result);
  }

  private copyProjection(projection: TrackProjection): TrackProjection {
    return { ...projection, point: projection.point.clone(), tangent: projection.tangent.clone() };
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
