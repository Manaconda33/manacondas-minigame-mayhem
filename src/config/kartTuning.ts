export type SurfaceType = 'asphalt' | 'dirt' | 'grass' | 'boost' | 'ramp' | 'static';

export interface DriverStats {
  speed: number;
  acceleration: number;
  weight: number;
  handling: number;
  miniTurbo: number;
  traction: number;
}

export interface KartTuning {
  maxSpeed: number;
  acceleration: number;
  mass: number;
  steeringRate: number;
  lateralGrip: number;
  reverseSpeed: number;
}

export type DriftTierName = 'none' | 'blue' | 'orange' | 'purple';

export interface DriftThresholds {
  blue: number;
  orange: number;
  purple: number;
}

export interface DriftBoostProfile {
  duration: number;
  speedMultiplier: number;
}

export const sliceOneDriver: DriverStats = {
  speed: 7,
  acceleration: 7,
  weight: 6,
  handling: 7,
  miniTurbo: 4,
  traction: 5,
};

export function createKartTuning(stats: DriverStats): KartTuning {
  const normalized = (value: number): number => (value - 1) / 9;

  return {
    maxSpeed: 23 + normalized(stats.speed) * 10,
    acceleration: 4 + 0.55 * stats.acceleration,
    mass: 105 + normalized(stats.weight) * 75,
    steeringRate: 1.3 + normalized(stats.handling) * 1.1,
    lateralGrip: 5.5 + normalized(stats.traction) * 3.5,
    reverseSpeed: 8,
  };
}

export function surfaceSpeedMultiplier(surface: SurfaceType, traction: number): number {
  const tractionN = (traction - 1) / 9;

  switch (surface) {
    case 'static':
      return 0.82;
    case 'dirt':
      return 0.6 + 0.23 * tractionN;
    case 'grass':
      return 0.425 + 0.225 * tractionN;
    default:
      return 1;
  }
}

export function surfaceAccelerationMultiplier(surface: SurfaceType, traction: number): number {
  const tractionN = (traction - 1) / 9;

  switch (surface) {
    case 'dirt':
      return 0.68 + 0.22 * tractionN;
    case 'grass':
      return 0.585 + 0.205 * tractionN;
    default:
      return 1;
  }
}

export function surfaceMinimumPlayableSpeed(surface: SurfaceType): number {
  if (surface === 'grass') return 8.5;
  if (surface === 'dirt') return 11.5;
  return 0;
}

export function driftThresholds(miniTurbo: number): DriftThresholds {
  const turboN = (miniTurbo - 1) / 9;
  return {
    blue: 0.95 - 0.18 * turboN,
    orange: 1.9 - 0.35 * turboN,
    purple: 3.15 - 0.6 * turboN,
  };
}

export function driftBoostProfile(
  tier: Exclude<DriftTierName, 'none'>,
  miniTurbo: number,
): DriftBoostProfile {
  const turboN = (miniTurbo - 1) / 9;
  if (tier === 'blue') return { duration: 0.55 + 0.15 * turboN, speedMultiplier: 1.08 };
  if (tier === 'orange') return { duration: 0.9 + 0.25 * turboN, speedMultiplier: 1.12 };
  return { duration: 1.35 + 0.4 * turboN, speedMultiplier: 1.16 };
}
