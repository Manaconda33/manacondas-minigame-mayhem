import * as THREE from 'three';

export function triangulateGradeContour(contour: number[], positions: number[]): number[] {
  const result: number[] = [];
  const point = (index: number) => new THREE.Vector3().fromArray(positions, index * 3);
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
  return result;
}
