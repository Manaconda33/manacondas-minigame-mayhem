import * as THREE from 'three';
import type { TrackProjection } from './TrackDefinition';
import type { NeonGrid } from './NeonGrid';

export interface Shortcut {
  id: NonNullable<TrackProjection['pathId']>;
  curve: THREE.CatmullRomCurve3;
  entry: { progress: [number, number]; lateral: [number, number] };
  exitProgress: number;
  roadHalfWidth: number;
}

/** Straight lateral chord with level aprons and eased underground ramps. */
export class ServiceTunnel implements Shortcut {
  public readonly id = 'service-tunnel' as const;
  public readonly roadHalfWidth = 3.2;
  public readonly headroom = 3;
  public readonly entry = {
    progress: [0.24654910452879084, 0.2515491045287908] as [number, number],
    lateral: [-3.2, 3.2] as [number, number],
  };
  public readonly exitProgress = 0.46154128347522666;
  public readonly curve: THREE.CatmullRomCurve3;
  public readonly mouthDistance = 7;
  private readonly wallRanges = new Map<-1 | 1, [number, number]>();

  public constructor(private readonly track: NeonGrid) {
    const start = track.curve.getPointAt(this.entry.progress[0]);
    const end = track.curve.getPointAt(this.exitProgress);
    const distance = Math.hypot(end.x - start.x, end.z - start.z);
    const points = Array.from({ length: 97 }, (_, i) => {
      const fraction = i / 96;
      const d = fraction * distance;
      const point = start.clone().lerp(end, fraction);
      const ramp = THREE.MathUtils.smoothstep(Math.min(d, distance - d), 7, 32);
      point.y = THREE.MathUtils.lerp(point.y, -4, ramp);
      return point;
    });
    this.curve = new THREE.CatmullRomCurve3(points, false, 'centripetal');
    this.curve.arcLengthDivisions = 1024;
    this.curve.getLength();
  }

  public project(position: THREE.Vector3, mainSampleCount = 384): TrackProjection {
    const start = this.curve.getPointAt(0),
      end = this.curve.getPointAt(1);
    const chord = end.clone().sub(start).setY(0);
    // x/z is a straight chord; height cannot move progress onto the crossing street.
    const horizontal = THREE.MathUtils.clamp(
      position.clone().sub(start).setY(0).dot(chord) / chord.lengthSq(),
      0,
      1,
    );
    // Catmull parameter is not arc length: locate the horizontal coordinate on
    // the realized curve, then map its cumulative length into main progress.
    let low = 0,
      high = 1;
    for (let i = 0; i < 24; i++) {
      const mid = (low + high) / 2;
      const p = this.curve.getPointAt(mid);
      const fraction = p.clone().sub(start).setY(0).dot(chord) / chord.lengthSq();
      if (fraction < horizontal) low = mid;
      else high = mid;
    }
    const fraction = (low + high) / 2;
    const point = this.curve.getPointAt(fraction);
    const tangent = this.curve.getTangentAt(fraction).normalize();
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

  public fraction(projection: TrackProjection): number {
    return THREE.MathUtils.clamp(
      (projection.progress - this.entry.progress[0]) / (this.exitProgress - this.entry.progress[0]),
      0,
      1,
    );
  }

  /** Wall endpoints are the intersections of each tunnel edge with the main road.
   * The two sides meet an angled road at different distances. */
  public wallRange(side: -1 | 1): [number, number] {
    const cached = this.wallRanges.get(side);
    if (cached) return cached;
    const inside = (fraction: number) => {
      const point = this.curve.getPointAt(fraction);
      const tangent = this.curve.getTangentAt(fraction);
      const right = new THREE.Vector3(tangent.z, 0, -tangent.x).normalize();
      const edge = point.addScaledVector(right, side * this.roadHalfWidth);
      const main = this.track.projectMain(edge);
      return main.lateralDistance <= this.track.halfWidthAt(main.progress);
    };
    const end = (exit: boolean) => {
      let low = 0,
        high = 12 / this.curve.getLength();
      for (let i = 0; i < 30; i++) {
        const mid = (low + high) / 2;
        if (inside(exit ? 1 - mid : mid)) low = mid;
        else high = mid;
      }
      return exit ? 1 - high : high;
    };
    const range: [number, number] = [end(false), end(true)];
    this.wallRanges.set(side, range);
    return range;
  }

  /** Match the main wall's lower/upper corners, easing back to tunnel height
   * within six metres of each join. This is render-only; floor/roof are intact. */
  public wallElevationAt(fraction: number, side: -1 | 1, upper: boolean): number {
    const [start, end] = this.wallRange(side);
    const endpoint = fraction - start < end - fraction ? start : end;
    const point = this.curve.getPointAt(endpoint);
    const tangent = this.curve.getTangentAt(endpoint);
    point.addScaledVector(
      new THREE.Vector3(tangent.z, 0, -tangent.x).normalize(),
      side * this.roadHalfWidth,
    );
    const roadHeight = this.track.projectMain(point).point.y;
    const distance = Math.abs(fraction - endpoint) * this.curve.getLength();
    return THREE.MathUtils.lerp(
      roadHeight + (upper ? 1.4 : -0.15),
      this.curve.getPointAt(fraction).y + (upper ? this.headroom : 0),
      THREE.MathUtils.smoothstep(distance, 0, 6),
    );
  }

  public junctionContains(position: THREE.Vector3): boolean {
    const start = this.curve.points[0],
      end = this.curve.points.at(-1);
    if (
      !start ||
      !end ||
      (Math.hypot(position.x - start.x, position.z - start.z) > 16 &&
        Math.hypot(position.x - end.x, position.z - end.z) > 16)
    )
      return false;
    const chord = end.clone().sub(start).setY(0),
      offset = position.clone().sub(start).setY(0);
    const along = offset.dot(chord) / chord.length();
    if (along < -1 || along > chord.length() + 1) return false;
    const projection = this.project(position);
    const distance = this.fraction(projection) * this.curve.getLength();
    return (
      (distance < 12 || distance > this.curve.getLength() - 12) &&
      projection.lateralDistance <= this.roadHalfWidth + 1e-5 &&
      Math.abs(position.y - projection.point.y) < 1.5
    );
  }
}
