import * as THREE from 'three';
import { CircuitAlpha, type TrackProjection } from './CircuitAlpha';

export const GUARDRAIL_OFFSET_METERS = 9.25;
export const GUARDRAIL_KART_RADIUS_METERS = 1.15;
export const GUARDRAIL_TANGENTIAL_RETENTION = 0.82;
export const GUARDRAIL_RESTITUTION = 0.22;

export interface GuardrailContact {
  readonly projection: TrackProjection;
  readonly side: -1 | 1;
  readonly inwardNormal: THREE.Vector3;
  readonly penetration: number;
}

export function guardrailContact(
  track: CircuitAlpha,
  position: THREE.Vector3,
  radiusMeters: number,
): GuardrailContact | null {
  const radius = Math.max(0, radiusMeters);
  const projection = track.project(position);
  const allowedOffset = GUARDRAIL_OFFSET_METERS - radius;
  const absoluteOffset = Math.abs(projection.lateralOffset);
  if (absoluteOffset <= allowedOffset) return null;

  const side: -1 | 1 = projection.lateralOffset < 0 ? -1 : 1;
  const right = new THREE.Vector3(
    projection.tangent.z,
    0,
    -projection.tangent.x,
  ).normalize();
  const inwardNormal = right.multiplyScalar(-side);

  return {
    projection,
    side,
    inwardNormal,
    penetration: absoluteOffset - allowedOffset,
  };
}

function offsetCurve(track: CircuitAlpha, side: -1 | 1, y: number): THREE.CatmullRomCurve3 {
  const points = track.samples.map((point, index) => {
    const tangent = track.tangents[index] ?? new THREE.Vector3(0, 0, 1);
    const right = new THREE.Vector3(tangent.z, 0, -tangent.x).normalize();
    return point
      .clone()
      .addScaledVector(right, side * GUARDRAIL_OFFSET_METERS)
      .setY(y);
  });
  return new THREE.CatmullRomCurve3(points, true, 'centripetal', 0.5);
}

export function createGuardrailVisual(track: CircuitAlpha): THREE.Group {
  const group = new THREE.Group();
  group.name = 'track-guardrails';

  const railMaterial = new THREE.MeshStandardMaterial({
    color: 0xb9bec8,
    roughness: 0.34,
    metalness: 0.72,
  });

  for (const side of [-1, 1] as const) {
    for (const [index, y] of [0.48, 0.88].entries()) {
      const rail = new THREE.Mesh(
        new THREE.TubeGeometry(offsetCurve(track, side, y), track.sampleCount, 0.1, 6, true),
        railMaterial,
      );
      rail.name = `guardrail-${side < 0 ? 'left' : 'right'}-${index === 0 ? 'lower' : 'upper'}`;
      rail.castShadow = true;
      rail.receiveShadow = true;
      group.add(rail);
    }
  }

  const postStep = 12;
  const postsPerSide = Math.ceil(track.sampleCount / postStep);
  const postGeometry = new THREE.BoxGeometry(0.16, 1.15, 0.16);
  const postMaterial = new THREE.MeshStandardMaterial({
    color: 0x8f97a4,
    roughness: 0.48,
    metalness: 0.58,
  });
  const posts = new THREE.InstancedMesh(postGeometry, postMaterial, postsPerSide * 2);
  posts.name = 'guardrail-posts';
  posts.castShadow = true;
  posts.receiveShadow = true;

  const dummy = new THREE.Object3D();
  let instance = 0;
  for (let sampleIndex = 0; sampleIndex < track.sampleCount; sampleIndex += postStep) {
    const point = track.samples[sampleIndex];
    const tangent = track.tangents[sampleIndex];
    if (point === undefined || tangent === undefined) continue;
    const right = new THREE.Vector3(tangent.z, 0, -tangent.x).normalize();
    for (const side of [-1, 1] as const) {
      dummy.position
        .copy(point)
        .addScaledVector(right, side * GUARDRAIL_OFFSET_METERS)
        .setY(0.55);
      dummy.rotation.set(0, Math.atan2(tangent.x, tangent.z), 0);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      posts.setMatrixAt(instance, dummy.matrix);
      instance += 1;
    }
  }
  posts.instanceMatrix.needsUpdate = true;
  group.add(posts);

  return group;
}
