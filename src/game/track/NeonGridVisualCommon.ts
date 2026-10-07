import * as THREE from 'three';
import type { NeonGrid } from './NeonGrid';

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
