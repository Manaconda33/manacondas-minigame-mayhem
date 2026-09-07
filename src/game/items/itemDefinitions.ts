export const ITEM_IDS = [
  'kinetic-disc',
  'seeker-drone',
  'apex-missile',
  'blast-orb',
  'blaze-orbs',
  'frost-orbs',
  'arc-blade',
  'arc-hammers',
  'slick-trap',
  'shockwave',
  'ink-splat',
  'nitro-surge',
  'nitro-overdrive',
  'hyper-drive-rocket',
  'prismatic-invincibility',
] as const;

export type ItemId = (typeof ITEM_IDS)[number];
export type RaceRank = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export interface ItemBoostConfig {
  durationSeconds: number;
  speedCapMultiplier: number;
  accelerationMultiplier: number;
  ignoreOffRoadSpeedPenalty: boolean;
}

export interface ItemProjectileConfig {
  speedMetersPerSecond: number;
  radiusMeters: number;
  lifetimeSeconds: number;
  maxWallBounces: number;
  inheritedVelocityFactor: number;
  maxInheritedSpeedMetersPerSecond: number;
  ownerArmSeconds: number;
  spinoutSeconds: number;
}

export const SEEKER_GUIDANCE = {
  minSpeed: 42,
  maxSpeed: 56,
  closingMargin: 10,
  acceleration: 20,
  turnRate: (120 * Math.PI) / 180,
  warningNearSeconds: 3,
  warningUrgentSeconds: 1,
} as const;

/** PRD amendment 2.7 / ADR-068: approved Apex core values. */
export const APEX_CONFIG = {
  riseSeconds: 0.6,
  skyHeight: 24,
  skySpeed: 96,
  arrivalRadius: 1,
  skyTimeoutSeconds: 10,
  lifetimeSeconds: 15,
  overheadSeconds: 1.9,
  diveSeconds: 0.6,
  diveSpeed: 60,
  blastRadius: 5.5,
  spinoutSeconds: 1.2,
  cooldownSeconds: 18,
  counterRadius: 5,
} as const;

export interface ItemDefinition {
  id: ItemId;
  displayName: string;
  icon: string;
  charges: number;
  boost?: Readonly<ItemBoostConfig>;
  projectile?: Readonly<ItemProjectileConfig>;
}

export const ITEM_DEFINITIONS: Readonly<Record<ItemId, ItemDefinition>> = {
  'kinetic-disc': {
    id: 'kinetic-disc',
    displayName: 'Ricochet Kinetic Disc',
    icon: '◇',
    charges: 1,
    projectile: {
      speedMetersPerSecond: 42,
      radiusMeters: 0.32,
      lifetimeSeconds: 9,
      maxWallBounces: 3,
      inheritedVelocityFactor: 0.35,
      maxInheritedSpeedMetersPerSecond: 8,
      ownerArmSeconds: 0.18,
      spinoutSeconds: 0.85,
    },
  },
  'seeker-drone': {
    id: 'seeker-drone',
    displayName: 'Homing Seeker Drone',
    icon: '⌁',
    charges: 1,
    projectile: {
      speedMetersPerSecond: SEEKER_GUIDANCE.minSpeed,
      radiusMeters: 0.32,
      lifetimeSeconds: 12,
      maxWallBounces: 0,
      inheritedVelocityFactor: 0,
      maxInheritedSpeedMetersPerSecond: 0,
      ownerArmSeconds: 0.5,
      spinoutSeconds: 0.85,
    },
  },
  'apex-missile': {
    id: 'apex-missile',
    displayName: 'Apex Orbital Missile',
    icon: '✦',
    charges: 1,
  },
  'blast-orb': { id: 'blast-orb', displayName: 'Timed Blast Orb', icon: '◉', charges: 1 },
  'blaze-orbs': { id: 'blaze-orbs', displayName: 'Blaze Orbs', icon: '✹', charges: 5 },
  'frost-orbs': { id: 'frost-orbs', displayName: 'Frost Orbs', icon: '❄', charges: 3 },
  'arc-blade': { id: 'arc-blade', displayName: 'Rebounding Arc Blade', icon: '⌬', charges: 3 },
  'arc-hammers': { id: 'arc-hammers', displayName: 'Kinetic Arc Hammers', icon: '⚒', charges: 5 },
  'slick-trap': { id: 'slick-trap', displayName: 'Hazard Oil / Slick Trap', icon: '≈', charges: 1 },
  shockwave: { id: 'shockwave', displayName: 'Acoustic Shockwave Pulse', icon: '◌', charges: 1 },
  'ink-splat': {
    id: 'ink-splat',
    displayName: 'Vision-Obscuring Ink Splat',
    icon: '✺',
    charges: 1,
  },
  'nitro-surge': {
    id: 'nitro-surge',
    displayName: 'Nitro Surge',
    icon: '↟',
    charges: 1,
    boost: {
      durationSeconds: 2.4,
      speedCapMultiplier: 1.18,
      accelerationMultiplier: 1.5,
      ignoreOffRoadSpeedPenalty: true,
    },
  },
  'nitro-overdrive': {
    id: 'nitro-overdrive',
    displayName: 'Continuous Nitro Overdrive',
    icon: '≋',
    charges: 1,
  },
  'hyper-drive-rocket': {
    id: 'hyper-drive-rocket',
    displayName: 'Hyper-Drive Rocket',
    icon: '⇈',
    charges: 1,
  },
  'prismatic-invincibility': {
    id: 'prismatic-invincibility',
    displayName: 'Prismatic Invincibility',
    icon: '⬡',
    charges: 1,
  },
};

export const ITEM_PROBABILITY_BY_RANK: Readonly<
  Record<RaceRank, Readonly<Record<ItemId, number>>>
> = {
  1: {
    'kinetic-disc': 18,
    'seeker-drone': 0,
    'apex-missile': 0,
    'blast-orb': 2,
    'blaze-orbs': 0,
    'frost-orbs': 0,
    'arc-blade': 5,
    'arc-hammers': 0,
    'slick-trap': 32,
    shockwave: 18,
    'ink-splat': 0,
    'nitro-surge': 22,
    'nitro-overdrive': 0,
    'hyper-drive-rocket': 0,
    'prismatic-invincibility': 3,
  },
  2: {
    'kinetic-disc': 16,
    'seeker-drone': 8,
    'apex-missile': 0,
    'blast-orb': 4,
    'blaze-orbs': 2,
    'frost-orbs': 0,
    'arc-blade': 6,
    'arc-hammers': 1,
    'slick-trap': 24,
    shockwave: 15,
    'ink-splat': 0,
    'nitro-surge': 20,
    'nitro-overdrive': 0,
    'hyper-drive-rocket': 0,
    'prismatic-invincibility': 4,
  },
  3: {
    'kinetic-disc': 14,
    'seeker-drone': 12,
    'apex-missile': 0,
    'blast-orb': 6,
    'blaze-orbs': 4,
    'frost-orbs': 2,
    'arc-blade': 7,
    'arc-hammers': 2,
    'slick-trap': 18,
    shockwave: 12,
    'ink-splat': 2,
    'nitro-surge': 16,
    'nitro-overdrive': 0,
    'hyper-drive-rocket': 0,
    'prismatic-invincibility': 5,
  },
  4: {
    'kinetic-disc': 10,
    'seeker-drone': 14,
    'apex-missile': 1,
    'blast-orb': 8,
    'blaze-orbs': 6,
    'frost-orbs': 4,
    'arc-blade': 8,
    'arc-hammers': 4,
    'slick-trap': 12,
    shockwave: 8,
    'ink-splat': 4,
    'nitro-surge': 15,
    'nitro-overdrive': 2,
    'hyper-drive-rocket': 0,
    'prismatic-invincibility': 4,
  },
  5: {
    'kinetic-disc': 8,
    'seeker-drone': 15,
    'apex-missile': 3,
    'blast-orb': 10,
    'blaze-orbs': 7,
    'frost-orbs': 6,
    'arc-blade': 8,
    'arc-hammers': 6,
    'slick-trap': 8,
    shockwave: 6,
    'ink-splat': 6,
    'nitro-surge': 12,
    'nitro-overdrive': 3,
    'hyper-drive-rocket': 0,
    'prismatic-invincibility': 2,
  },
  6: {
    'kinetic-disc': 5,
    'seeker-drone': 12,
    'apex-missile': 8,
    'blast-orb': 9,
    'blaze-orbs': 8,
    'frost-orbs': 8,
    'arc-blade': 7,
    'arc-hammers': 7,
    'slick-trap': 5,
    shockwave: 4,
    'ink-splat': 7,
    'nitro-surge': 8,
    'nitro-overdrive': 6,
    'hyper-drive-rocket': 6,
    'prismatic-invincibility': 0,
  },
  7: {
    'kinetic-disc': 3,
    'seeker-drone': 10,
    'apex-missile': 11,
    'blast-orb': 8,
    'blaze-orbs': 8,
    'frost-orbs': 9,
    'arc-blade': 6,
    'arc-hammers': 8,
    'slick-trap': 3,
    shockwave: 2,
    'ink-splat': 8,
    'nitro-surge': 6,
    'nitro-overdrive': 9,
    'hyper-drive-rocket': 9,
    'prismatic-invincibility': 0,
  },
  8: {
    'kinetic-disc': 2,
    'seeker-drone': 6,
    'apex-missile': 13,
    'blast-orb': 6,
    'blaze-orbs': 6,
    'frost-orbs': 8,
    'arc-blade': 4,
    'arc-hammers': 6,
    'slick-trap': 2,
    shockwave: 2,
    'ink-splat': 8,
    'nitro-surge': 5,
    'nitro-overdrive': 13,
    'hyper-drive-rocket': 15,
    'prismatic-invincibility': 4,
  },
};

export const ITEM_BOX_LAYOUT = {
  rowProgress: [0.09, 0.34, 0.62, 0.89] as const,
  boxesPerRow: 8,
} as const;

export function probabilityTotalForRank(rank: RaceRank): number {
  return ITEM_IDS.reduce((total, itemId) => total + ITEM_PROBABILITY_BY_RANK[rank][itemId], 0);
}
