import type { ItemProjectileConfig } from './itemDefinitions';

/** PRD amendment 2.13 / ADR-074: approved Blaze Orbs projectile values. */
export const BLAZE_ORB_CONFIG: Readonly<ItemProjectileConfig> = {
  speedMetersPerSecond: 42,
  radiusMeters: 0.28,
  lifetimeSeconds: 3,
  maxWallBounces: 0,
  inheritedVelocityFactor: 0,
  maxInheritedSpeedMetersPerSecond: 0,
  ownerArmSeconds: 0.18,
  spinoutSeconds: 0.55,
};
