import type { ItemProjectileConfig } from './itemDefinitions';

/** Amendment 2.14 / ADR-075. */
export const FROST = { duration: 1.2, retention: 0.55, steering: 0.8, cadence: 0.55 } as const;
export const FROST_ORB_CONFIG: Readonly<ItemProjectileConfig> = {
  speedMetersPerSecond: 42,
  radiusMeters: 0.28,
  lifetimeSeconds: 3,
  maxWallBounces: 0,
  inheritedVelocityFactor: 0,
  maxInheritedSpeedMetersPerSecond: 0,
  ownerArmSeconds: 0.18,
  spinoutSeconds: 0,
  impactEffect: 'frost',
};
