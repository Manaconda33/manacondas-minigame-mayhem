import * as THREE from 'three';
import type { ItemProjectileConfig } from './itemDefinitions';
import type { ItemUseDirection } from './ItemSystem';

/** PRD amendment 2.16 / ADR-077: Kinetic Arc Hammers. */
export const ARC_HAMMER_CONFIG = {
  cadenceSeconds: 0.35,
  charges: 5,
  horizontalSpeedMetersPerSecond: 36,
  upwardSpeedMetersPerSecond: 11,
  gravityMetersPerSecondSquared: 24,
  inheritedVelocityFactor: 0.2,
  inheritedSpeedCapMetersPerSecond: 10,
  radiusMeters: 0.36,
  ownerArmSeconds: 0.18,
  terrainTangentialRetention: 0.78,
  terrainNormalRestitution: 0.55,
  postBounceLifetimeSeconds: 0.75,
  lifetimeSeconds: 2.25,
  spinoutSeconds: 0.85,
  shockwaveClearRadiusMeters: 5,
  spawnOffsetMeters: 1.75,
  terrainContactSuppressionSeconds: 0.045,
} as const;

/** Adapter for the shared ProjectileSystem request contract. */
export const ARC_HAMMER_PROJECTILE_CONFIG: Readonly<ItemProjectileConfig> = {
  speedMetersPerSecond: ARC_HAMMER_CONFIG.horizontalSpeedMetersPerSecond,
  radiusMeters: ARC_HAMMER_CONFIG.radiusMeters,
  lifetimeSeconds: ARC_HAMMER_CONFIG.lifetimeSeconds,
  maxWallBounces: 0,
  inheritedVelocityFactor: ARC_HAMMER_CONFIG.inheritedVelocityFactor,
  maxInheritedSpeedMetersPerSecond: ARC_HAMMER_CONFIG.inheritedSpeedCapMetersPerSecond,
  ownerArmSeconds: ARC_HAMMER_CONFIG.ownerArmSeconds,
  spinoutSeconds: ARC_HAMMER_CONFIG.spinoutSeconds,
};

export interface HammerSurfaceSample {
  readonly point: THREE.Vector3;
  readonly normal: THREE.Vector3;
}

export function hammerLaunchVelocity(
  forward: THREE.Vector3,
  ownerVelocity: THREE.Vector3,
  direction: ItemUseDirection,
): THREE.Vector3 | null {
  const launchDirection = forward.clone().setY(0);
  if (!launchDirection.normalize().lengthSq()) return null;
  if (direction === 'backward') launchDirection.multiplyScalar(-1);

  const inherited = ownerVelocity.clone().setY(0);
  const inheritedSpeed = inherited.length();
  if (inheritedSpeed > ARC_HAMMER_CONFIG.inheritedSpeedCapMetersPerSecond) {
    inherited.multiplyScalar(ARC_HAMMER_CONFIG.inheritedSpeedCapMetersPerSecond / inheritedSpeed);
  }

  return launchDirection
    .multiplyScalar(ARC_HAMMER_CONFIG.horizontalSpeedMetersPerSecond)
    .addScaledVector(inherited, ARC_HAMMER_CONFIG.inheritedVelocityFactor)
    .setY(ARC_HAMMER_CONFIG.upwardSpeedMetersPerSecond);
}

/** Reflect only the normal component; the tangent retains the governed 0.78x. */
export function hammerBounceVelocity(
  velocity: THREE.Vector3,
  surfaceNormal: THREE.Vector3,
): THREE.Vector3 {
  const normal = surfaceNormal.clone().normalize();
  const normalSpeed = velocity.dot(normal);
  const tangent = velocity.clone().addScaledVector(normal, -normalSpeed);
  return tangent
    .multiplyScalar(ARC_HAMMER_CONFIG.terrainTangentialRetention)
    .addScaledVector(normal, -normalSpeed * ARC_HAMMER_CONFIG.terrainNormalRestitution);
}

/** First intersection of a horizontal swept segment with a stationary racer circle. */
export function hammerContactFraction(
  start: THREE.Vector3,
  end: THREE.Vector3,
  center: THREE.Vector3,
  radius: number,
): number | null {
  const x = start.x - center.x;
  const z = start.z - center.z;
  const c = x * x + z * z - radius * radius;
  if (c <= 1e-10) return 0;
  const dx = end.x - start.x;
  const dz = end.z - start.z;
  const a = dx * dx + dz * dz;
  if (a < 1e-18) return null;
  const b = x * dx + z * dz;
  const discriminant = b * b - a * c;
  if (discriminant < 0) return null;
  const fraction = (-b - Math.sqrt(discriminant)) / a;
  return fraction >= 0 && fraction <= 1 ? fraction : null;
}

export function finiteHammerVector(vector: THREE.Vector3): boolean {
  return [vector.x, vector.y, vector.z].every(Number.isFinite);
}
