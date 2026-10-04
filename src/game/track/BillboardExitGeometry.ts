import * as THREE from 'three';
import type { BillboardGap } from './NeonGridBillboard';
import { triangulateGradeContour } from './GradeTriangulation';

/** Smooth vertical join for the shortcut's shared exit edge. */
export function smoothJoinBlend(progress: number): number {
  const t = THREE.MathUtils.clamp(progress, 0, 1);
  return t * t * (3 - 2 * t);
}

/** Clip the local exit to the unchanged main ribbon's exact Float32 boundary. */
export function billboardExitPatch(gap: BillboardGap, positions: number[]): number[] {
  const append = (p: THREE.Vector3) => {
    const index = positions.length / 3;
    positions.push(p.x, p.y, p.z);
    return index;
  };
  const point = (index: number) => new THREE.Vector3().fromArray(positions, index * 3);
  const edge = (fraction: number, lane: number) => {
    const p = gap.curve.getPointAt(fraction),
      t = gap.curve.getTangentAt(fraction);
    return p.addScaledVector(new THREE.Vector3(t.z, 0, -t.x).normalize(), lane);
  };
  const mainEdge = (row: number, side: number) => {
    const fraction = row / 1536,
      p = gap.track.curve.getPointAt(fraction),
      t = gap.track.curve.getTangentAt(fraction);
    p.addScaledVector(
      new THREE.Vector3(t.z, 0, -t.x).normalize(),
      side * gap.track.halfWidthAt(fraction),
    );
    return new THREE.Vector3(Math.fround(p.x), Math.fround(p.y), Math.fround(p.z));
  };
  const cross = (a: THREE.Vector3, b: THREE.Vector3) => a.x * b.z - a.z * b.x;
  const intersections = [-4, 4].map((lane, sideIndex) => {
    const contour = Array.from({ length: 5 }, (_, i) => (396 + i) * 2 + sideIndex);
    for (let i = 400; i < 512; i++) {
      const a = edge(i / 512, lane),
        b = edge((i + 1) / 512, lane),
        r = b.clone().sub(a);
      for (const side of [-1, 1])
        for (let row = 280; row < 340; row++) {
          const c = mainEdge(row, side),
            d = mainEdge(row + 1, side),
            s = d.clone().sub(c),
            q = c.clone().sub(a);
          const denominator = cross(r, s);
          if (Math.abs(denominator) < 1e-10) continue;
          const t = cross(q, s) / denominator,
            u = cross(q, r) / denominator;
          if (t < 0 || t > 1 || u < 0 || u > 1) continue;
          const join = c.clone().lerp(d, u);
          contour.push(append(join));
          // Retain the authored approach at row 400 and grade only its local edge
          // to the exact shared main-road boundary height.
          const distances = [0];
          for (let j = 1; j < contour.length; j++) {
            const p = point(contour[j] ?? 0),
              previous = point(contour[j - 1] ?? 0);
            distances.push(
              (distances[j - 1] ?? 0) + Math.hypot(p.x - previous.x, p.z - previous.z),
            );
          }
          const startY = point(contour[0] ?? 0).y,
            total = distances.at(-1) ?? 1;
          for (let j = 1; j < contour.length - 1; j++)
            positions[(contour[j] ?? 0) * 3 + 1] = THREE.MathUtils.lerp(
              startY,
              join.y,
              smoothJoinBlend((distances[j] ?? 0) / total),
            );
          return { contour, row: row + u, side };
        }
      contour.push(append(b));
    }
    throw new Error('Billboard exit requires both measured main-boundary intersections');
  });
  const left = intersections[0],
    right = intersections[1];
  if (left?.side === undefined || right?.side === undefined || left.side !== right.side)
    throw new Error('Billboard exit must meet one main boundary');
  const boundary: number[] = [];
  if (left.row < right.row)
    for (let row = Math.floor(left.row) + 1; row <= Math.floor(right.row); row++)
      boundary.push(append(mainEdge(row, left.side)));
  else
    for (let row = Math.floor(left.row); row > right.row; row--)
      boundary.push(append(mainEdge(row, left.side)));
  return triangulateGradeContour(
    [...left.contour, ...boundary, ...right.contour.reverse()],
    positions,
  );
}
