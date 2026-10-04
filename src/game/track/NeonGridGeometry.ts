import * as THREE from 'three';
import layout from './neonGridLayout.json';
import type { NeonGrid } from './NeonGrid';

const RIBBON_ROWS = 1536;
const CLIMB_FIRST_ROW = 1220;
const CLIMB_LAST_ROW = 1270;

// The climbing inside offset crosses itself between rows 1236 and 1249.
// Stitch its outer envelope to the authored centerline; keeping the loop
// creates overlapping decks and a steep connector across the driving line.
function climbingPatch(track: NeonGrid, positions: number[]): number[] {
  const first = CLIMB_FIRST_ROW;
  const last = CLIMB_LAST_ROW;
  const point = (index: number) => new THREE.Vector3().fromArray(positions, index * 3);
  const append = (p: THREE.Vector3) => {
    const index = positions.length / 3;
    positions.push(p.x, p.y, p.z);
    return index;
  };
  const center = Array.from({ length: last - first + 1 }, (_, i) =>
    append(track.curve.getPointAt((first + i) / RIBBON_ROWS)),
  );
  const inside: number[] = [];
  for (let row = first; row <= last; row++) inside.push(row * 2);
  // Intersect the two measured crossing boundary segments in XZ. Both heights
  // describe the same physical join, so share one interpolated join vertex.
  const a = point(1236 * 2),
    b = point(1237 * 2);
  const c = point(1248 * 2),
    d = point(1249 * 2);
  const r = b.clone().sub(a),
    s = d.clone().sub(c),
    q = c.clone().sub(a);
  const cross = (u: THREE.Vector3, v: THREE.Vector3) => u.x * v.z - u.z * v.x;
  const denominator = cross(r, s);
  const t = cross(q, s) / denominator;
  const u = cross(q, r) / denominator;
  if (!(t > 0 && t < 1 && u > 0 && u < 1))
    throw new Error('Neon climbing patch requires the verified inside boundary crossing');
  const join = a.clone().addScaledVector(r, t);
  const joinIndex = append(join);
  inside.splice(1237 - first, 12, joinIndex);
  // The two former sheets reach their crossing at different elevations.
  // Retain the approved local-grade anchors at rows 1230 and 1256.
  // Assign one continuous inside-edge height only between those anchors;
  // all centerline heights and the surrounding boundary remain authored.
  const distances = [0];
  for (let i = 1; i < inside.length; i++) {
    const p = point(inside[i] ?? 0),
      previous = point(inside[i - 1] ?? 0);
    distances.push((distances[i - 1] ?? 0) + Math.hypot(p.x - previous.x, p.z - previous.z));
  }
  const gradeFirst = inside.indexOf(1230 * 2);
  const gradeLast = inside.indexOf(1256 * 2);
  const firstHeight = point(inside[gradeFirst] ?? 0).y;
  const lastHeight = point(inside[gradeLast] ?? 0).y;
  for (let i = gradeFirst + 1; i < gradeLast; i++) {
    const p = point(inside[i] ?? 0);
    p.y = THREE.MathUtils.lerp(
      firstHeight,
      lastHeight,
      ((distances[i] ?? 0) - (distances[gradeFirst] ?? 0)) /
        ((distances[gradeLast] ?? 1) - (distances[gradeFirst] ?? 0)),
    );
    inside[i] = append(p);
  }
  const result: number[] = [];
  const triangulate = (contour: number[]) => {
    // Optimize only internal diagonals of this measured simple polygon. Ear
    // clipping forms long, thin ears with steep normals on the curved grade.
    // Evaluate the eventual Float32 support vertices, retaining every boundary
    // segment and authored centerline edge rather than resampling either.
    const points = contour.map((index) => {
      const p = point(index);
      return new THREE.Vector3(Math.fround(p.x), Math.fround(p.y), Math.fround(p.z));
    });
    const n = points.length;
    const at = (i: number) => points[i] ?? new THREE.Vector3();
    const cross = (a: THREE.Vector3, b: THREE.Vector3, c: THREE.Vector3) =>
      (b.z - a.z) * (c.x - a.x) - (b.x - a.x) * (c.z - a.z);
    const inside = (p: THREE.Vector3) => {
      let contained = false;
      for (let i = 0, j = n - 1; i < n; j = i++) {
        const a = at(i),
          b = at(j);
        if (a.z > p.z !== b.z > p.z && p.x < ((b.x - a.x) * (p.z - a.z)) / (b.z - a.z) + a.x)
          contained = !contained;
      }
      return contained;
    };
    const edge = Array.from({ length: n }, () => new Array<boolean>(n).fill(false));
    for (let a = 0; a < n; a++)
      for (let b = a + 1; b < n; b++) {
        let valid = b === a + 1 || (a === 0 && b === n - 1);
        if (!valid) {
          valid = inside(at(a).clone().add(at(b)).multiplyScalar(0.5));
          for (let c = 0; c < n && valid; c++) {
            const d = (c + 1) % n;
            if ([c, d].includes(a) || [c, d].includes(b)) continue;
            if (
              cross(at(a), at(b), at(c)) * cross(at(a), at(b), at(d)) < 0 &&
              cross(at(c), at(d), at(a)) * cross(at(c), at(d), at(b)) < 0
            )
              valid = false;
          }
        }
        const rowA = edge[a],
          rowB = edge[b];
        if (rowA && rowB) rowA[b] = rowB[a] = valid;
      }
    const cost = Array.from({ length: n }, () => new Array<number>(n).fill(Infinity));
    const split = Array.from({ length: n }, () => new Array<number>(n).fill(-1));
    for (let i = 0; i < n - 1; i++) {
      const row = cost[i];
      if (row) row[i + 1] = 0;
    }
    for (let span = 2; span < n; span++)
      for (let a = 0; a + span < n; a++) {
        const b = a + span;
        if (!edge[a]?.[b]) continue;
        for (let k = a + 1; k < b; k++) {
          // Input contour follows the ribbon's upward winding (positive XZ normal).
          if (!edge[a]?.[k] || !edge[k]?.[b] || cross(at(a), at(k), at(b)) <= 1e-8) continue;
          const normal = at(k)
            .clone()
            .sub(at(a))
            .cross(at(b).clone().sub(at(a)));
          const grade = Math.hypot(normal.x, normal.z) / normal.y;
          const maximum = Math.max(grade, cost[a]?.[k] ?? Infinity, cost[k]?.[b] ?? Infinity);
          const row = cost[a],
            choices = split[a];
          if (row && choices && maximum < (row[b] ?? Infinity)) {
            row[b] = maximum;
            choices[b] = k;
          }
        }
      }
    const emit = (a: number, b: number) => {
      if (b <= a + 1) return;
      const k = split[a]?.[b] ?? -1;
      if (k < 0) throw new Error('Neon climbing contour requires valid constrained triangulation');
      result.push(contour[a] ?? 0, contour[k] ?? 0, contour[b] ?? 0);
      emit(a, k);
      emit(k, b);
    };
    emit(0, n - 1);
  };
  triangulate([...inside, ...[...center].reverse()]);
  // Preserve the existing unfolded outer-half cells, sharing centerline
  // vertices with the repaired inside half.
  for (let row = first; row < last; row++) {
    const a = center[row - first] ?? 0,
      b = center[row - first + 1] ?? 0;
    result.push(a, b, row * 2 + 1, row * 2 + 1, b, (row + 1) * 2 + 1);
  }
  // Split adjacent end faces at the centerline joins to avoid T-junctions.
  const before = (first - 1) * 2,
    after = last * 2;
  result.push(
    before,
    before + 2,
    before + 1,
    before + 1,
    before + 2,
    center[0] ?? 0,
    before + 1,
    center[0] ?? 0,
    before + 3,
    after,
    after + 2,
    center.at(-1) ?? 0,
    center.at(-1) ?? 0,
    after + 2,
    after + 1,
    after + 1,
    after + 2,
    after + 3,
  );
  return result;
}

/** Dense shared ribbon, including wall joins; no separate approximate floor. */
export function neonGridRibbon(
  track: NeonGrid,
  wallSide: -1 | 1 | 0 = 0,
  billboardOpen = false,
): THREE.BufferGeometry {
  const count = RIBBON_ROWS;
  const positions: number[] = [];
  const indices: number[] = [];
  const junctionPositions: number[] = [];
  const junctionIndices: number[] = [];
  for (let i = 0; i <= count; i++) {
    const progress = i / count;
    const p = track.curve.getPointAt(progress);
    const t = track.curve.getTangentAt(progress);
    const right = new THREE.Vector3(t.z, 0, -t.x).normalize();
    const width = track.halfWidthAt(progress);
    for (let j = 0; j < 2; j++) {
      const offset = wallSide === 0 ? (j === 0 ? -width : width) : wallSide * width;
      const point = p.clone().addScaledVector(right, offset);
      if (wallSide !== 0) point.y += j === 0 ? -0.15 : 1.4;
      positions.push(point.x, point.y, point.z);
    }
    if (i < count) {
      const a = i * 2;
      const b = a + 2;
      if (wallSide !== 0) {
        const middleProgress = (i + 0.5) / count;
        const center = track.curve.getPointAt(middleProgress);
        const direction = track.curve.getTangentAt(middleProgress);
        const right = new THREE.Vector3(direction.z, 0, -direction.x).normalize();
        const edge = center.addScaledVector(right, wallSide * track.halfWidthAt(middleProgress));
        const edgeAt = (fraction: number) => {
          const point = track.curve.getPointAt(fraction);
          const tangent = track.curve.getTangentAt(fraction);
          return point.addScaledVector(
            new THREE.Vector3(tangent.z, 0, -tangent.x).normalize(),
            wallSide * track.halfWidthAt(fraction),
          );
        };
        const start = i / count,
          end = (i + 1) / count;
        const open = (point: THREE.Vector3) =>
          track.serviceTunnel.junctionContains(point) ||
          (billboardOpen && track.billboardGap.junctionContains(point));
        const startOpen = open(edgeAt(start));
        const endOpen = open(edgeAt(end));
        if (startOpen !== endOpen) {
          // Terminate at the actual tunnel edge, rather than removing a whole
          // midpoint-selected cell and leaving a gap or projecting a wall tip.
          let low = start,
            high = end;
          for (let iteration = 0; iteration < 30; iteration++) {
            const middle = (low + high) / 2;
            if (open(edgeAt(middle)) === startOpen) low = middle;
            else high = middle;
          }
          const first = edgeAt(startOpen ? high : start);
          const last = edgeAt(endOpen ? low : end);
          const base = (count + 1) * 2 + junctionPositions.length / 3;
          for (const point of [first, last]) {
            junctionPositions.push(
              point.x,
              point.y - 0.15,
              point.z,
              point.x,
              point.y + 1.4,
              point.z,
            );
          }
          junctionIndices.push(base, base + 2, base + 1, base + 1, base + 2, base + 3);
          continue;
        }
        if (open(edge)) continue;
        const projection = track.projectMain(edge);
        // An offset loop inside another part of the same road is an internal
        // ribbon seam, not a physical wall across the drivable corridor.
        if (projection.lateralDistance < track.halfWidthAt(projection.progress) - 0.15) continue;
      }
      if (wallSide !== 0 || i < CLIMB_FIRST_ROW - 1 || i > CLIMB_LAST_ROW)
        indices.push(a, b, a + 1, a + 1, b, b + 1);
    }
  }
  positions.push(...junctionPositions);
  indices.push(...junctionIndices);
  const patchStart = indices.length;
  if (wallSide === 0) indices.push(...climbingPatch(track, positions));
  // Tight inside offsets can fold back across another strip at a reversing
  // bend. Exclude their inverted top faces rather than making a raised obstacle.
  const filtered: number[] = [];
  const groups: { start: number; count: number; materialIndex: number }[] = [];
  for (let i = 0; i < indices.length; i += 3) {
    const a = indices[i] ?? 0,
      b = indices[i + 1] ?? 0,
      c = indices[i + 2] ?? 0;
    const ax = positions[a * 3] ?? 0,
      az = positions[a * 3 + 2] ?? 0;
    const bx = positions[b * 3] ?? 0,
      bz = positions[b * 3 + 2] ?? 0;
    const cx = positions[c * 3] ?? 0,
      cz = positions[c * 3 + 2] ?? 0;
    const normalY = (bz - az) * (cx - ax) - (bx - ax) * (cz - az);
    if (wallSide === 0 && normalY <= 0) continue;
    const progress = i >= patchStart ? CLIMB_FIRST_ROW / count : Math.floor(a / 2) / count;
    const sector = Math.max(
      0,
      layout.sectors.findIndex((s) => progress < s.end),
    );
    const previous = groups.at(-1);
    if (previous?.materialIndex === sector) previous.count += 3;
    else groups.push({ start: filtered.length, count: 3, materialIndex: sector });
    filtered.push(a, b, c);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(filtered);
  geometry.computeVertexNormals();
  if (wallSide === 0) for (const g of groups) geometry.addGroup(g.start, g.count, g.materialIndex);
  return geometry;
}
