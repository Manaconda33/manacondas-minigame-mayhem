import * as THREE from 'three';
import type { ServiceTunnel } from './ServiceTunnel';

/** The floor's Float32 triangles are shared by native support and rendered art. */
export function serviceTunnelGeometry(
  tunnel: ServiceTunnel,
  kind: 'floor' | 'left-wall' | 'right-wall' | 'roof' = 'floor',
): THREE.BufferGeometry {
  const rows = 192,
    positions: number[] = [],
    indices: number[] = [];
  for (let i = 0; i <= rows; i++) {
    const fraction = i / rows;
    const p = tunnel.curve.getPointAt(fraction),
      tangent = tunnel.curve.getTangentAt(fraction);
    const right = new THREE.Vector3(tangent.z, 0, -tangent.x).normalize();
    for (let j = 0; j < 2; j++) {
      const side = kind === 'left-wall' ? -1 : kind === 'right-wall' ? 1 : j === 0 ? -1 : 1;
      const q = p.clone().addScaledVector(right, side * tunnel.roadHalfWidth);
      if (kind === 'roof') q.y += tunnel.headroom;
      if (kind.endsWith('wall')) q.y += j === 0 ? 0 : tunnel.headroom;
      positions.push(q.x, q.y, q.z);
    }
    if (i === rows) continue;
    const midpoint = tunnel.curve.getPointAt((i + 0.5) / rows);
    const distance = ((i + 0.5) / rows) * tunnel.curve.getLength();
    // Level junction aprons remain open; the actual underground straight is
    // covered below the crossing street, with 3 m clearance above its floor.
    if (kind === 'roof' && midpoint.y > -3.99) continue;
    if (kind.endsWith('wall') && (distance < 7 || distance > tunnel.curve.getLength() - 7))
      continue;
    const a = i * 2,
      b = a + 2;
    if (kind === 'roof') indices.push(a, a + 1, b, a + 1, b + 1, b);
    else indices.push(a, b, a + 1, a + 1, b, b + 1);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}
