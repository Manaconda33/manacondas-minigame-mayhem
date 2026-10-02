import * as THREE from 'three';
import layout from './neonGridLayout.json';
import type { NeonGrid } from './NeonGrid';

/** Dense shared ribbon, including wall joins; no separate approximate floor. */
export function neonGridRibbon(track: NeonGrid, wallSide: -1 | 1 | 0 = 0): THREE.BufferGeometry {
  const count = 1536;
  const positions: number[] = [];
  const indices: number[] = [];
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
        const projection = track.project(edge);
        // An offset loop inside another part of the same road is an internal
        // ribbon seam, not a physical wall across the drivable corridor.
        if (projection.lateralDistance < track.halfWidthAt(projection.progress) - 0.15) continue;
      }
      indices.push(a, b, a + 1, a + 1, b, b + 1);
    }
  }
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
    const progress = Math.floor(a / 2) / count;
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
