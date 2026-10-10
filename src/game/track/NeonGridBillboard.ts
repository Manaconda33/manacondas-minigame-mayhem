import * as THREE from 'three';
import type { NeonGrid } from './NeonGrid';
import type { TrackProjection } from './TrackDefinition';
import { TrackSegmentIndex } from './TrackSegmentIndex';
import { billboardExitPatch } from './BillboardExitGeometry';

export const BILLBOARD_PHASE_OFFSET_SECONDS = 3.6;

/** Pure race-time cycle: never reads wall time or accumulates while paused. */
export function billboardStateAt(raceSeconds: number): { on: boolean; tellIntensity: number } {
  const phase = THREE.MathUtils.euclideanModulo(
    Math.max(0, raceSeconds) + BILLBOARD_PHASE_OFFSET_SECONDS,
    6,
  );
  const on = phase < 4;
  const remaining = (on ? 4 : 6) - phase;
  return { on, tellIntensity: THREE.MathUtils.clamp(1 - remaining / 0.8, 0, 1) };
}

/** Approved curved wall-entry plaza; the main route remains unchanged. */
export class BillboardGap {
  public readonly id = 'billboard-gap' as const;
  public readonly roadHalfWidth = 4;
  public readonly mouthDistance = 19;
  public readonly entry = {
    progress: [0.101, 0.106] as [number, number],
    lateral: [-4, 4] as [number, number],
  };
  public readonly exitProgress = 0.215;
  public readonly boostPad = {
    centerFraction: 0.16,
    halfLength: 3,
    halfWidth: 3.5,
  } as const;
  public readonly curve: THREE.CubicBezierCurve3;
  private readonly segmentCount = 128;
  private readonly segmentIndex: TrackSegmentIndex;
  public constructor(public readonly track: NeonGrid) {
    const start = track.curve.getPointAt(this.entry.progress[0]);
    const end = track.curve.getPointAt(this.exitProgress);
    this.curve = new THREE.CubicBezierCurve3(
      start,
      start.clone().addScaledVector(track.curve.getTangentAt(this.entry.progress[0]), 18),
      end.clone().addScaledVector(track.curve.getTangentAt(this.exitProgress), -18),
      end,
    );
    this.curve.arcLengthDivisions = 512;
    this.curve.updateArcLengths();
    this.segmentIndex = new TrackSegmentIndex(
      Array.from({ length: this.segmentCount + 1 }, (_, i) =>
        this.curve.getPointAt(i / this.segmentCount),
      ),
      false,
    );
  }
  public fraction(projection: TrackProjection): number {
    return THREE.MathUtils.clamp(
      (projection.progress - this.entry.progress[0]) / (this.exitProgress - this.entry.progress[0]),
      0,
      1,
    );
  }
  public project(position: THREE.Vector3, mainSampleCount = 384): TrackProjection {
    const nearest = this.segmentIndex.nearest(position);
    const fraction = (nearest.index + nearest.fraction) / this.segmentCount;
    const point = nearest.point,
      tangent = this.curve.getTangentAt(fraction);
    const right = new THREE.Vector3(tangent.z, 0, -tangent.x).normalize();
    const lateralOffset = position.clone().sub(point).dot(right);
    const progress = THREE.MathUtils.lerp(this.entry.progress[0], this.exitProgress, fraction);
    const distance = fraction * this.curve.getLength();
    const boostCenter = this.boostPad.centerFraction * this.curve.getLength();
    const onBoostPad =
      Math.abs(distance - boostCenter) <= this.boostPad.halfLength &&
      Math.abs(lateralOffset) <= this.boostPad.halfWidth;
    return {
      index: Math.floor(progress * mainSampleCount),
      progress,
      point,
      tangent,
      lateralOffset,
      lateralDistance: Math.abs(lateralOffset),
      surface: onBoostPad ? 'boost' : 'asphalt',
      pathId: this.id,
    };
  }
  public junctionContains(position: THREE.Vector3): boolean {
    const projection = this.project(position),
      length = this.curve.getLength();
    const distance = this.fraction(projection) * length;
    const start = this.curve.getPointAt(0),
      end = this.curve.getPointAt(1);
    const first = this.curve.getTangentAt(0).setY(0).normalize();
    const last = this.curve.getTangentAt(1).setY(0).normalize();
    return (
      position.clone().sub(start).dot(first) >= -1 &&
      position.clone().sub(end).dot(last) <= 1 &&
      (distance < this.mouthDistance + 10 || distance > length - 22) &&
      projection.lateralDistance <= this.roadHalfWidth &&
      Math.abs(position.y - projection.point.y) < 1.5
    );
  }
}

/** Support only. The approved visual execution is separately gated. */
export function billboardFloorGeometry(gap: BillboardGap): THREE.BufferGeometry {
  const segments = 512,
    positions: number[] = [],
    indices: number[] = [];
  for (let i = 0; i <= 400; i++) {
    const p = gap.curve.getPointAt(i / segments),
      t = gap.curve.getTangentAt(i / segments);
    const right = new THREE.Vector3(t.z, 0, -t.x).normalize();
    for (const lane of [-gap.roadHalfWidth, gap.roadHalfWidth])
      positions.push(...p.clone().addScaledVector(right, lane).toArray());
    if (i < 400) {
      const a = i * 2;
      indices.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
    }
  }
  indices.push(...billboardExitPatch(gap, positions));
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}
