import * as THREE from 'three';
import type { NeonGrid } from './NeonGrid';
import type { TrackProjection } from './TrackDefinition';

/** Pure race-time cycle: never reads wall time or accumulates while paused. */
export function billboardStateAt(raceSeconds: number): { on: boolean; tellIntensity: number } {
  const phase = THREE.MathUtils.euclideanModulo(Math.max(0, raceSeconds), 6);
  const on = phase < 4;
  const remaining = (on ? 4 : 6) - phase;
  return { on, tellIntensity: THREE.MathUtils.clamp(1 - remaining / 0.8, 0, 1) };
}

/** Approved plaza chord; no hologram collider, no change to the main road. */
export class BillboardGap {
  public readonly id = 'billboard-gap' as const;
  public readonly roadHalfWidth = 6;
  public readonly mouthDistance = 7;
  public readonly entry = {
    progress: [0.1112341368367766, 0.11623413683677661] as [number, number],
    lateral: [-6, 6] as [number, number],
  };
  public readonly exitProgress = 0.17852464824355127;
  public readonly curve: THREE.CatmullRomCurve3;
  public constructor(track: NeonGrid) {
    const start = track.curve.getPointAt(this.entry.progress[0]);
    const end = track.curve.getPointAt(this.exitProgress);
    this.curve = new THREE.CatmullRomCurve3(
      [start, start.clone().lerp(end, 0.5), end],
      false,
      'centripetal',
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
    const start = this.curve.getPointAt(0),
      end = this.curve.getPointAt(1),
      chord = end.clone().sub(start);
    const fraction = THREE.MathUtils.clamp(
      position.clone().sub(start).dot(chord) / chord.lengthSq(),
      0,
      1,
    );
    const point = start.clone().lerp(end, fraction),
      tangent = chord.normalize();
    const right = new THREE.Vector3(tangent.z, 0, -tangent.x).normalize();
    const lateralOffset = position.clone().sub(point).dot(right);
    const progress = THREE.MathUtils.lerp(this.entry.progress[0], this.exitProgress, fraction);
    return {
      index: Math.floor(progress * mainSampleCount),
      progress,
      point,
      tangent,
      lateralOffset,
      lateralDistance: Math.abs(lateralOffset),
      surface: 'asphalt',
      pathId: this.id,
    };
  }
  public junctionContains(position: THREE.Vector3): boolean {
    const projection = this.project(position);
    const distance = this.fraction(projection) * this.curve.getLength();
    const start = this.curve.getPointAt(0),
      tangent = this.curve.getTangentAt(0).setY(0).normalize();
    const along = position.clone().sub(start).dot(tangent);
    return (
      along >= -1 &&
      along <= this.curve.getLength() + 1 &&
      (distance < 22 || distance > this.curve.getLength() - 22) &&
      projection.lateralDistance <= this.roadHalfWidth &&
      Math.abs(position.y - projection.point.y) < 1.5
    );
  }
}

/** Support only. The approved visual execution is separately gated. */
export function billboardFloorGeometry(gap: BillboardGap): THREE.BufferGeometry {
  const start = gap.curve.getPointAt(0),
    end = gap.curve.getPointAt(1),
    t = gap.curve.getTangentAt(0);
  const r = new THREE.Vector3(t.z, 0, -t.x).normalize();
  const points = [
    start.clone().addScaledVector(r, -6),
    start.clone().addScaledVector(r, 6),
    end.clone().addScaledVector(r, -6),
    end.clone().addScaledVector(r, 6),
  ];
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(
      points.flatMap((p) => p.toArray()),
      3,
    ),
  );
  geometry.setIndex([0, 2, 1, 1, 2, 3]);
  geometry.computeVertexNormals();
  return geometry;
}
