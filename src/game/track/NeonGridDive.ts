import * as THREE from 'three';
import type { NeonGrid } from './NeonGrid';
import type { TrackProjection, TrackNavigation } from './TrackDefinition';
import { neonGridRibbon } from './NeonGridGeometry';

/** All added support is outside the unchanged main-road triangles. */
export class WaterfallDive {
  public readonly id = 'waterfall-dive' as const;
  public readonly entryProgress = 0.792717;
  public readonly exitProgress = 0.82703;
  public readonly roadHalfWidth = 2.8;
  public readonly mouthDistance = 7;
  public readonly lipDistance = 16;
  public readonly landingDistance = 21;
  public readonly origin: THREE.Vector3;
  public readonly end: THREE.Vector3;
  public readonly direction: THREE.Vector3;
  public readonly right: THREE.Vector3;
  public readonly length: number;
  public readonly recoveryPosition: THREE.Vector3;
  public readonly rampGeometry: THREE.BufferGeometry;
  public readonly landingGeometry: THREE.BufferGeometry;
  private readonly boundaryEdges: [THREE.Vector3, THREE.Vector3][];
  public constructor(private readonly track: NeonGrid) {
    this.origin = track.curve.getPointAt(this.entryProgress);
    this.end = track.curve.getPointAt(this.exitProgress);
    this.direction = this.end.clone().sub(this.origin).setY(0).normalize();
    this.right = new THREE.Vector3(this.direction.z, 0, -this.direction.x);
    this.length = this.end.clone().sub(this.origin).setY(0).length();
    this.recoveryPosition = track.curve.getPointAt(this.exitProgress + 3 / track.curve.getLength());
    const geometry = neonGridRibbon(track),
      positions = geometry.getAttribute('position');
    const counts = new Map<string, { a: number; b: number; count: number }>();
    const triangles = geometry.index?.array ?? [];
    for (let i = 0; i < triangles.length; i += 3)
      for (const [u, v] of [
        [0, 1],
        [1, 2],
        [2, 0],
      ] as const) {
        const a = Number(triangles[i + u]),
          b = Number(triangles[i + v]),
          key = a < b ? `${String(a)}/${String(b)}` : `${String(b)}/${String(a)}`;
        const edge = counts.get(key);
        if (edge) edge.count++;
        else counts.set(key, { a, b, count: 1 });
      }
    this.boundaryEdges = [...counts.values()]
      .filter((e) => e.count === 1)
      .map((e) => [
        new THREE.Vector3().fromBufferAttribute(positions, e.a),
        new THREE.Vector3().fromBufferAttribute(positions, e.b),
      ]);
    geometry.dispose();
    this.rampGeometry = this.buildSupport('ramp');
    this.landingGeometry = this.buildSupport('landing');
  }
  public pointAtDistance(d: number): THREE.Vector3 {
    const p = this.origin.clone().addScaledVector(this.direction, d);
    p.y = THREE.MathUtils.lerp(this.origin.y, this.end.y, d / this.length);
    return p;
  }
  public distance(p: THREE.Vector3): number {
    return p.clone().sub(this.origin).dot(this.direction);
  }
  public lane(p: THREE.Vector3): number {
    return p.clone().sub(this.origin).dot(this.right);
  }
  private edge(lane: number, exit: boolean): { d: number; y: number } {
    const origin = this.origin.clone().addScaledVector(this.right, lane),
      cross = (a: THREE.Vector3, b: THREE.Vector3) => a.x * b.z - a.z * b.x;
    const intersections: { d: number; y: number }[] = [];
    for (const [a, b] of this.boundaryEdges) {
      const segment = b.clone().sub(a),
        relative = a.clone().sub(origin),
        denominator = cross(this.direction, segment);
      if (Math.abs(denominator) < 1e-9) continue;
      const d = cross(relative, segment) / denominator,
        u = cross(relative, this.direction) / denominator;
      if (u >= 0 && u <= 1 && d >= 0 && d <= this.length)
        intersections.push({ d, y: THREE.MathUtils.lerp(a.y, b.y, u) });
    }
    const options = intersections
      .filter((p) => (exit ? p.d > this.length / 2 : p.d < this.length / 2))
      .sort((a, b) => a.d - b.d);
    const selected = exit ? options[0] : options.at(-1);
    if (!selected) throw new Error('Dive support must join an actual main-road boundary');
    return selected;
  }
  private buildSupport(kind: 'ramp' | 'landing'): THREE.BufferGeometry {
    const vertices: number[] = [],
      indices: number[] = [],
      lanes = 24,
      rows = 16;
    const width = kind === 'ramp' ? this.roadHalfWidth : 5;
    for (let j = 0; j <= lanes; j++) {
      const lane = THREE.MathUtils.lerp(-width, width, j / lanes),
        edge = this.edge(lane, kind === 'landing');
      for (let i = 0; i <= rows; i++) {
        const f = i / rows;
        const start = kind === 'ramp' ? edge.d : Math.min(this.landingDistance, edge.d - 0.1);
        const end = kind === 'ramp' ? this.lipDistance : edge.d;
        const d = THREE.MathUtils.lerp(start, end, f);
        const y =
          kind === 'ramp'
            ? THREE.MathUtils.lerp(edge.y, 10.3, f)
            : THREE.MathUtils.lerp(8.8, edge.y, f);
        const p = this.pointAtDistance(d).addScaledVector(this.right, lane).setY(y);
        vertices.push(...p.toArray());
        if (j < lanes && i < rows) {
          const a = j * (rows + 1) + i,
            b = a + rows + 1;
          indices.push(a, a + 1, b, b, a + 1, b + 1);
        }
      }
    }
    const g = new THREE.BufferGeometry()
      .setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
      .setIndex(indices);
    g.computeVertexNormals();
    return g;
  }
  public junctionContains(p: THREE.Vector3): boolean {
    const d = this.distance(p);
    return (
      d >= this.mouthDistance - 2 &&
      d <= this.length + 2 &&
      Math.abs(this.lane(p)) <= 5 &&
      Math.abs(p.y - this.pointAtDistance(d).y) < 6
    );
  }
  public project(p: THREE.Vector3, count: number): TrackProjection {
    const d = THREE.MathUtils.clamp(this.distance(p), 0, this.length),
      progress = THREE.MathUtils.lerp(this.entryProgress, this.exitProgress, d / this.length);
    return {
      index: Math.floor(progress * count),
      progress,
      point: this.pointAtDistance(d),
      tangent: this.direction.clone(),
      lateralOffset: this.lane(p),
      lateralDistance: Math.abs(this.lane(p)),
      surface: d >= this.lipDistance - 0.8 && d <= this.lipDistance ? 'ramp' : 'asphalt',
      pathId: this.id,
    };
  }
  public navigationAt(p: THREE.Vector3, distance: number): TrackNavigation {
    const d = this.distance(p) + distance;
    if (d < this.length)
      return {
        point: this.pointAtDistance(Math.max(0, d)),
        tangent: this.direction.clone(),
        halfWidth: this.roadHalfWidth,
        pathId: this.id,
      };
    const progress = this.exitProgress + (d - this.length) / this.track.curve.getLength();
    return {
      point: this.track.curve.getPointAt(progress),
      tangent: this.track.curve.getTangentAt(progress),
      halfWidth: 6,
    };
  }
  public classifyDiveContact(p: THREE.Vector3, v: THREE.Vector3): 'airborne' | 'landed' | 'missed' {
    const d = this.distance(p),
      lane = Math.abs(this.lane(p));
    if (
      d >= this.landingDistance &&
      d <= this.length + 4 &&
      lane <= 5 &&
      p.y >= 8.6 &&
      p.y <= this.track.projectMain(p).point.y + 1.2 &&
      v.y <= 0.5 &&
      v.y >= -1
    )
      return 'landed';
    if (
      (d >= this.landingDistance &&
        lane > 5 &&
        p.y < this.track.projectMain(p).point.y + 1.2 &&
        Math.abs(v.y) < 1) ||
      p.y <= 0.45 ||
      (d > this.length + 4 && p.y < this.track.projectMain(p).point.y + 1.2 && Math.abs(v.y) < 1)
    )
      return 'missed';
    return 'airborne';
  }
}

export class DiveState {
  private phase: 'idle' | 'active' | 'reverse' | 'landed' | 'splash' | 'recovered' = 'idle';
  private splashAt = 0;
  public constructor(private readonly dive: WaterfallDive) {}
  public get active(): boolean {
    return this.phase === 'active' || this.phase === 'reverse' || this.phase === 'splash';
  }
  public get landed(): boolean {
    return this.phase === 'landed';
  }
  public get splashing(): boolean {
    return this.phase === 'splash';
  }
  public reset(): void {
    this.phase = 'idle';
    this.splashAt = 0;
  }
  public advance(
    previous: THREE.Vector3,
    p: THREE.Vector3,
    v: THREE.Vector3,
    time: number,
  ): { position: THREE.Vector3; yaw: number } | null {
    if (
      (this.phase === 'landed' || this.phase === 'recovered') &&
      this.dive.distance(p) < this.dive.mouthDistance - 1
    )
      this.reset();
    const before = this.dive.distance(previous),
      after = this.dive.distance(p);
    if (
      this.phase === 'idle' &&
      before < this.dive.mouthDistance &&
      after >= this.dive.mouthDistance &&
      Math.abs(this.dive.lane(p)) <= this.dive.roadHalfWidth &&
      Math.abs(p.y - this.dive.pointAtDistance(after).y) < 2 &&
      v.dot(this.dive.direction) > 0
    ) {
      const mainHeading = previous.clone().sub(p).negate().setY(0).normalize();
      if (mainHeading.dot(this.dive.direction) > 0.95) this.phase = 'active';
    }
    const reverseMouth = this.dive.length - this.dive.mouthDistance;
    if (
      this.phase === 'idle' &&
      before > reverseMouth &&
      after <= reverseMouth &&
      Math.abs(this.dive.lane(p)) <= 5 &&
      Math.abs(p.y - this.dive.pointAtDistance(after).y) < 2.5 &&
      v.dot(this.dive.direction) < 0
    ) {
      this.phase = 'reverse';
    }
    if (this.phase === 'active') {
      if (after < this.dive.mouthDistance - 1) this.reset();
      else {
        const contact = this.dive.classifyDiveContact(p, v);
        if (contact === 'landed') this.phase = 'landed';
        if (contact === 'missed') {
          this.phase = 'splash';
          this.splashAt = time;
        }
      }
    }
    if (
      this.phase === 'reverse' &&
      (after < this.dive.mouthDistance - 1 || after > this.dive.length + 1)
    )
      this.reset();
    if (this.phase === 'splash' && time - this.splashAt >= 1.5 - 1e-9) {
      this.phase = 'recovered';
      const tangent = this.dive.navigationAt(this.dive.end, 3).tangent;
      return {
        position: this.dive.recoveryPosition.clone(),
        yaw: Math.atan2(tangent.x, tangent.z),
      };
    }
    return null;
  }
}
