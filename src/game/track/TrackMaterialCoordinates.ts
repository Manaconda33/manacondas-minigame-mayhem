import * as THREE from 'three';
import { CircuitAlpha } from './CircuitAlpha';

export const CIRCUIT_ALPHA_MATERIAL_TILE_METERS = 2;

interface MaterialCoordinateMetadata {
  readonly tileMeters: number;
  readonly longitudinalRepeats: number;
  readonly closed: boolean;
}

function finalizeGeometry(
  positions: number[],
  uvs: number[],
  indices: number[],
  metadata: MaterialCoordinateMetadata,
): THREE.BufferGeometry {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  geometry.userData.materialCoordinates = metadata;
  return geometry;
}

function loopLongitudinalDistances(track: CircuitAlpha): number[] {
  const distances = [0];
  let cumulative = 0;

  for (let index = 1; index <= track.sampleCount; index += 1) {
    const previous = track.samples[(index - 1) % track.sampleCount];
    const current = track.samples[index % track.sampleCount];
    if (previous !== undefined && current !== undefined) cumulative += previous.distanceTo(current);
    distances.push(cumulative);
  }

  return distances;
}

export function createLoopStripGeometry(
  track: CircuitAlpha,
  halfWidth: number,
  y: number,
  tileMeters = CIRCUIT_ALPHA_MATERIAL_TILE_METERS,
): THREE.BufferGeometry {
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];
  const safeTileMeters = Math.max(0.001, tileMeters);
  const longitudinalDistances = loopLongitudinalDistances(track);
  const totalLength = longitudinalDistances[track.sampleCount] ?? 0;
  const longitudinalRepeats = Math.max(1, Math.round(totalLength / safeTileMeters));
  const longitudinalTileMeters =
    totalLength > 0 ? totalLength / longitudinalRepeats : safeTileMeters;

  for (let index = 0; index <= track.sampleCount; index += 1) {
    const wrapped = index % track.sampleCount;
    const point = track.samples[wrapped]?.clone() ?? new THREE.Vector3();
    const tangent = track.tangents[wrapped] ?? new THREE.Vector3(0, 0, 1);
    const right = new THREE.Vector3(tangent.z, 0, -tangent.x).normalize();
    const leftPoint = point.clone().addScaledVector(right, -halfWidth);
    const rightPoint = point.clone().addScaledVector(right, halfWidth);
    positions.push(leftPoint.x, y, leftPoint.z, rightPoint.x, y, rightPoint.z);

    const v = (longitudinalDistances[index] ?? 0) / longitudinalTileMeters;
    uvs.push(-halfWidth / safeTileMeters, v, halfWidth / safeTileMeters, v);

    if (index < track.sampleCount) {
      const base = index * 2;
      indices.push(base, base + 2, base + 1, base + 1, base + 2, base + 3);
    }
  }

  return finalizeGeometry(positions, uvs, indices, {
    tileMeters: safeTileMeters,
    longitudinalRepeats,
    closed: true,
  });
}

export function createSegmentStripGeometry(
  track: CircuitAlpha,
  startProgress: number,
  endProgress: number,
  centerOffset: number,
  halfWidth: number,
  y: number,
  tileMeters = CIRCUIT_ALPHA_MATERIAL_TILE_METERS,
): THREE.BufferGeometry {
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];
  const start = Math.floor(startProgress * track.sampleCount);
  const end = Math.ceil(endProgress * track.sampleCount);
  const safeTileMeters = Math.max(0.001, tileMeters);
  let longitudinalMeters = 0;
  let previousCenter: THREE.Vector3 | null = null;

  for (let index = start; index <= end; index += 1) {
    const wrapped = index % track.sampleCount;
    const point = track.samples[wrapped]?.clone() ?? new THREE.Vector3();
    const tangent = track.tangents[wrapped] ?? new THREE.Vector3(0, 0, 1);
    const right = new THREE.Vector3(tangent.z, 0, -tangent.x).normalize();
    const center = point.clone().addScaledVector(right, centerOffset);

    if (previousCenter !== null) longitudinalMeters += previousCenter.distanceTo(center);
    previousCenter = center.clone();

    const leftPoint = center.clone().addScaledVector(right, -halfWidth);
    const rightPoint = center.clone().addScaledVector(right, halfWidth);
    positions.push(leftPoint.x, y, leftPoint.z, rightPoint.x, y, rightPoint.z);

    const v = longitudinalMeters / safeTileMeters;
    uvs.push(
      (centerOffset - halfWidth) / safeTileMeters,
      v,
      (centerOffset + halfWidth) / safeTileMeters,
      v,
    );

    const local = index - start;
    if (index < end) {
      const base = local * 2;
      indices.push(base, base + 2, base + 1, base + 1, base + 2, base + 3);
    }
  }

  return finalizeGeometry(positions, uvs, indices, {
    tileMeters: safeTileMeters,
    longitudinalRepeats: longitudinalMeters / safeTileMeters,
    closed: false,
  });
}
