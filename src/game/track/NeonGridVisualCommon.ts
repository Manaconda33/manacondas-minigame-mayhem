import * as THREE from 'three';
import type { NeonGrid } from './NeonGrid';
import { neonGridRibbon } from './NeonGridGeometry';

export function neonGridRightAt(track: NeonGrid, progress: number): THREE.Vector3 {
  const tangent = track.curve.getTangentAt(progress).setY(0).normalize();
  return new THREE.Vector3(tangent.z, 0, -tangent.x).normalize();
}

export function neonGridRibbonGeometry(
  track: NeonGrid,
  start: number,
  end: number,
  segments: number,
  halfWidth: number,
  yOffset: number,
): THREE.BufferGeometry {
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];
  let distance = 0;
  let previous: THREE.Vector3 | null = null;

  for (let i = 0; i <= segments; i++) {
    const progress = THREE.MathUtils.lerp(start, end, i / segments);
    const center = track.curve.getPointAt(progress);
    if (previous) distance += previous.distanceTo(center);
    previous = center.clone();
    const right = neonGridRightAt(track, progress);
    const width = Math.min(halfWidth, track.halfWidthAt(progress));
    const left = center.clone().addScaledVector(right, -width);
    const rightPoint = center.clone().addScaledVector(right, width);
    left.y += yOffset;
    rightPoint.y += yOffset;
    positions.push(...left.toArray(), ...rightPoint.toArray());
    uvs.push(0, distance, 1, distance);
    if (i < segments) {
      const a = i * 2;
      indices.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
    }
  }

  const geometry = new THREE.BufferGeometry()
    .setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    .setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
    .setIndex(indices);
  geometry.computeVertexNormals();
  geometry.userData.progressRange = [start, end];
  return geometry;
}



/**
 * Presentation overlay cut directly from the accepted dense native/render road ribbon.
 * This avoids coarse independent ribbons crossing the authored surface on curves/grades.
 */
export function neonGridSurfaceSliceGeometry(
  track: NeonGrid,
  start: number,
  end: number,
): THREE.BufferGeometry {
  const source = neonGridRibbon(track);
  const positions = source.getAttribute('position');
  const sourceIndex = source.index?.array;
  const rows = Number(source.userData.ribbonRows);
  const baseVertexCount = Number(source.userData.baseVertexCount);
  if (
    !sourceIndex ||
    !Number.isInteger(rows) ||
    rows <= 0 ||
    !Number.isInteger(baseVertexCount) ||
    baseVertexCount <= 0
  ) {
    source.dispose();
    throw new Error('Neon Grid presentation slice requires dense ribbon metadata');
  }

  const indices: number[] = [];
  const centroid = new THREE.Vector3();
  const a = new THREE.Vector3();
  const b = new THREE.Vector3();
  const d = new THREE.Vector3();
  for (let i = 0; i < sourceIndex.length; i += 3) {
    const ia = Number(sourceIndex[i]);
    const ib = Number(sourceIndex[i + 1]);
    const ic = Number(sourceIndex[i + 2]);
    let progress: number;
    if (ia < baseVertexCount && ib < baseVertexCount && ic < baseVertexCount) {
      progress =
        (Math.floor(ia / 2) + Math.floor(ib / 2) + Math.floor(ic / 2)) / (3 * rows);
    } else {
      a.fromBufferAttribute(positions, ia);
      b.fromBufferAttribute(positions, ib);
      d.fromBufferAttribute(positions, ic);
      centroid.copy(a).add(b).add(d).multiplyScalar(1 / 3);
      progress = track.projectMain(centroid).progress;
    }
    if (progress >= start - 1e-6 && progress <= end + 1e-6) indices.push(ia, ib, ic);
  }

  const uv: number[] = [];
  const point = new THREE.Vector3();
  for (let i = 0; i < positions.count; i++) {
    if (i < baseVertexCount) {
      const row = Math.floor(i / 2);
      uv.push(i % 2 === 0 ? 0 : 1, (row / rows) * track.curve.getLength());
      continue;
    }
    point.fromBufferAttribute(positions, i);
    const projection = track.projectMain(point);
    const halfWidth = Math.max(0.001, track.halfWidthAt(projection.progress));
    uv.push(
      THREE.MathUtils.clamp(0.5 + projection.lateralOffset / (halfWidth * 2), 0, 1),
      projection.progress * track.curve.getLength(),
    );
  }

  const geometry = new THREE.BufferGeometry()
    .setAttribute('position', positions.clone())
    .setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2))
    .setIndex(indices);
  geometry.computeVertexNormals();
  geometry.userData.progressRange = [start, end];
  geometry.userData.conformsToMainRibbon = true;
  source.dispose();
  return geometry;
}


/**
 * Opaque presentation-only roadway facade screens. The panels and attached ribs
 * begin below the main-road edge, follow its authored grade and have no collider.
 * Strips leave genuine shortcut entrance/exit openings clear.
 */
export interface NeonRoadsideScreenStrip {
  readonly start: number;
  readonly end: number;
  readonly side: -1 | 1;
  readonly opening?: (progress: number) => boolean;
}

export function neonGridRoadsideScreenGeometry(
  track: NeonGrid,
  strips: readonly NeonRoadsideScreenStrip[],
): THREE.BufferGeometry {
  const vertices: number[] = [];
  const indices: number[] = [];
  let panels = 0;
  let openings = 0;
  function quad(a: THREE.Vector3, b: THREE.Vector3, c: THREE.Vector3, d: THREE.Vector3): void {
    const first = vertices.length / 3;
    vertices.push(...a.toArray(), ...b.toArray(), ...c.toArray(), ...d.toArray());
    indices.push(first, first + 1, first + 2, first, first + 2, first + 3);
  }
  function surface(progress: number, side: -1 | 1, outward: number, height: number): THREE.Vector3 {
    const center = track.curve.getPointAt(progress);
    const right = neonGridRightAt(track, progress);
    return center.addScaledVector(right, side * (track.halfWidthAt(progress) + outward))
      .add(new THREE.Vector3(0, height, 0));
  }
  function panel(a: number, b: number, side: -1 | 1, outer: number, top: number): void {
    const nearA = surface(a, side, outer, -1.0);
    const nearB = surface(b, side, outer, -1.0);
    const highA = surface(a, side, outer, top);
    const highB = surface(b, side, outer, top);
    const farA = surface(a, side, outer + 0.28, -1.0);
    const farB = surface(b, side, outer + 0.28, -1.0);
    const farHighA = surface(a, side, outer + 0.28, top);
    const farHighB = surface(b, side, outer + 0.28, top);
    quad(nearA, nearB, highB, highA);
    quad(farB, farA, farHighA, farHighB);
    quad(highA, highB, farHighB, farHighA);
    quad(nearB, nearA, farA, farB);
    quad(nearA, highA, farHighA, farA);
    quad(highB, nearB, farB, farHighB);
  }
  for (const strip of strips) {
    const count = Math.max(1, Math.ceil((strip.end - strip.start) / 0.0012));
    for (let i = 0; i < count; i++) {
      const a = THREE.MathUtils.lerp(strip.start, strip.end, i / count);
      const b = THREE.MathUtils.lerp(strip.start, strip.end, (i + 1) / count);
      const mid = (a + b) * 0.5;
      if ([a, mid, b].some((p) => strip.opening?.(p) === true)) {
        openings++;
        continue;
      }
      // Repeating opaque wall modules and deeper integral pilaster ribs.
      panel(a, b, strip.side, 0.44, 3.95);
      if (i % 6 === 0) panel(a, a + (b - a) * 0.38, strip.side, 0.30, 4.35);
      panels++;
    }
  }
  const result = new THREE.BufferGeometry()
    .setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
    .setIndex(indices);
  result.computeVertexNormals();
  result.userData.panelCount = panels;
  result.userData.openingSegments = openings;
  result.userData.presentationOnly = true;
  result.userData.opaqueScreens = true;
  return result;
}

export class NeonGridVisualClock {
  private lastSourceTime: number | null = null;
  private visualTime = 0;

  public update(sourceTime: number, visible: boolean): number {
    if (this.lastSourceTime === null) {
      this.lastSourceTime = sourceTime;
      if (visible) this.visualTime = sourceTime;
      return this.visualTime;
    }

    const delta = sourceTime - this.lastSourceTime;
    this.lastSourceTime = sourceTime;
    if (!visible) return this.visualTime;
    this.visualTime = delta >= 0 ? this.visualTime + delta : sourceTime;
    return this.visualTime;
  }
}
